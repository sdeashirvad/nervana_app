# Nervana — Backend Implementation Bible

> **Status:** Implementation Reference · Version 1.0  
> **Frontend:** Expo / React Native (Expo Router v6)  
> **Target Stack:** Cloudflare Workers · Supabase · PostgreSQL · Resend · OpenAI/Anthropic  
> **Scope:** Complete production backend specification derived from full frontend codebase analysis

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication Strategy](#2-authentication-strategy)
3. [Full API Specification](#3-full-api-specification)
4. [Database Schema](#4-database-schema)
5. [AI Architecture](#5-ai-architecture)
6. [Notifications Architecture](#6-notifications-architecture)
7. [Security Considerations](#7-security-considerations)
8. [Folder Structure](#8-folder-structure)
9. [State Synchronization Strategy](#9-state-synchronization-strategy)
10. [Scalability Notes](#10-scalability-notes)

---

## 1. Architecture Overview

### 1.1 System Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      Expo React Native App                       │
│  (Expo Router v6 · React Query · AsyncStorage · expo-secure-store)│
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / JWT Bearer
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers (API Gateway)                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   /auth/*   │  │   /api/v1/*  │  │   /ai/v1/companion   │   │
│  │  Auth proxy │  │  REST API    │  │   Streaming SSE       │   │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼────────────────┼─────────────────────┼───────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌──────────────┐  ┌─────────────────┐  ┌────────────────────┐
│  Supabase    │  │   Supabase      │  │  OpenAI / Anthropic │
│  Auth        │  │   PostgreSQL    │  │  API               │
│  (OAuth/OTP) │  │   (RLS enabled) │  │  (Claude 3.5 /     │
│              │  │                 │  │   GPT-4o)          │
└──────────────┘  └─────────────────┘  └────────────────────┘
                           │
               ┌───────────┼──────────────┐
               ▼           ▼              ▼
        ┌──────────┐ ┌──────────┐ ┌─────────────┐
        │  Resend  │ │  Expo    │ │  Cloudflare │
        │  (Email) │ │  Push    │ │  KV (cache) │
        │          │ │  Notifs  │ │  + Queues   │
        └──────────┘ └──────────┘ └─────────────┘
```

### 1.2 Recommended Stack

| Layer | Technology | Rationale |
|---|---|---|
| API Runtime | Cloudflare Workers | Edge-latency, free tier generous, no cold starts, native streaming SSE for AI |
| Database | Supabase PostgreSQL | Row-level security, real-time, managed Postgres, Auth integration |
| Auth | Supabase Auth | OAuth (Google), Magic Link (email), anonymous/guest users |
| Email | Resend | Transactional email for magic links and onboarding sequences |
| AI Orchestration | OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet | Companion chat, pattern analysis, emotional memory |
| Push Notifications | Expo Push Notification Service → APNs/FCM | Native push via Expo's managed service |
| Cache | Cloudflare KV | Session validation, rate-limit counters, daily quote cache |
| Background Jobs | Cloudflare Queues | Notification scheduling, pattern analysis, streak calculation |
| Object Storage | Cloudflare R2 | Future: journal audio, attachments |
| CDN | Cloudflare | Assets, API responses with cache-control headers |

### 1.3 Service Boundaries

```
workers/
├── auth-worker          → /auth/* (Supabase Auth proxy + token refresh)
├── api-worker           → /api/v1/* (all REST endpoints)
├── ai-worker            → /ai/v1/* (streaming companion, pattern analysis)
└── notification-worker  → Queues consumer (scheduled push delivery)
```

All workers share:
- A common JWT verification middleware (Supabase JWT secret)
- Cloudflare KV namespace `NERVANA_CACHE`
- Cloudflare Queue `nervana-jobs`

### 1.4 API Versioning and Base URL

```
Production:   https://api.nervana.app/api/v1
Staging:      https://api-staging.nervana.app/api/v1
AI:           https://api.nervana.app/ai/v1
Auth:         https://api.nervana.app/auth/v1
```

All responses follow the envelope pattern:

```json
{
  "data": { ... },
  "meta": { "request_id": "...", "timestamp": "..." },
  "error": null
}
```

Error shape:

```json
{
  "data": null,
  "error": {
    "code": "CHECKIN_ALREADY_EXISTS",
    "message": "A check-in already exists for today.",
    "field": null
  }
}
```

---

## 2. Authentication Strategy

### 2.1 Auth Modes

Nervana supports three entry paths, all producing a usable session:

| Mode | Mechanism | User Record | Data Persistence |
|---|---|---|---|
| Guest | Supabase anonymous sign-in | `is_guest = true`, ephemeral UUID | Device-local (AsyncStorage) + limited server-side |
| Google OAuth | Supabase OAuth redirect flow | Full user record | Full server-side |
| Email Magic Link | Supabase OTP → Resend delivery | Full user record | Full server-side |

### 2.2 Guest Mode

When the user taps "Continue as Guest" in `/auth`:

1. Client calls `supabase.auth.signInAnonymously()` (Supabase anonymous auth).
2. Supabase returns an `access_token` and `refresh_token` just like any user.
3. The `users` table receives a row with `is_guest = true`, `guest_expires_at = NOW() + INTERVAL '30 days'`.
4. All check-ins, journal entries, and conversation history are stored server-side under this guest UUID.
5. On app launch, the device checks for a stored `nervana_session` in `expo-secure-store`. If found and valid, skip auth.

**Guest expiry:** A Cloudflare Queues cron runs daily and soft-deletes guest accounts older than 30 days. Their associated data is also soft-deleted.

### 2.3 Guest → Authenticated Transition

When a guest user later signs in with Google or email:

1. Client calls `POST /auth/v1/link-guest` with `{ guest_token, new_user_token }`.
2. Worker verifies both tokens, confirms `guest_user.is_guest = true`.
3. A database function `link_guest_to_user(guest_id, real_id)` runs as a transaction:
   - Reassigns all `emotional_checkins`, `journal_entries`, `ai_conversations`, `calm_coins` rows from `guest_id` to `real_id`.
   - Copies `onboarding_profiles` row.
   - Soft-deletes the guest user record.
4. Returns the authenticated user's full profile.
5. Client replaces session tokens in `expo-secure-store`.

This ensures no emotional history is lost during conversion.

### 2.4 Google OAuth Flow

```
App → supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: 'nervana://auth-callback' })
    → Google OAuth consent screen (web redirect)
    → nervana://auth-callback?code=...
    → supabase.auth.exchangeCodeForSession(code)
    → access_token + refresh_token stored in expo-secure-store
    → POST /api/v1/users/me/sync (upserts user profile from Supabase identity)
```

Deep link scheme: `nervana://` must be registered in `app.json` and handled in `_layout.tsx`.

### 2.5 Magic Link / Email OTP

```
App → POST /auth/v1/otp { email }
    → Supabase sends OTP via Resend SMTP integration
    → User enters 6-digit code in app
    → supabase.auth.verifyOtp({ email, token, type: 'email' })
    → access_token + refresh_token stored in expo-secure-store
```

Resend handles email delivery. Configure Supabase SMTP to point at Resend's SMTP endpoint.

### 2.6 Token Handling and Session Persistence

- `access_token`: Short-lived JWT (1 hour). Stored in `expo-secure-store` (encrypted native keychain).
- `refresh_token`: Long-lived (30 days). Also stored in `expo-secure-store`.
- On every API call, the client checks if `access_token` expires within 5 minutes. If so, calls `supabase.auth.refreshSession()` proactively.
- All Workers validate JWTs using the Supabase JWT secret (stored as a Worker secret). No database hit required for token validation.
- If refresh fails (token expired or revoked), clear `expo-secure-store` and redirect to `/auth`.

### 2.7 Token Storage on Client

```ts
// Recommended: expo-secure-store
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken:  'nervana_access_token',
  refreshToken: 'nervana_refresh_token',
  userId:       'nervana_user_id',
  guestId:      'nervana_guest_id',
};
```

Never store tokens in `AsyncStorage` (not encrypted). Use `expo-secure-store` for all auth material.

---

## 3. Full API Specification

All endpoints require `Authorization: Bearer <access_token>` unless marked `[PUBLIC]`.  
All request bodies are `Content-Type: application/json`.  
All list endpoints support `?limit=20&cursor=<opaque_cursor>` pagination unless noted.

---

### 3.1 Auth Endpoints (`/auth/v1`)

#### `POST /auth/v1/otp` [PUBLIC]

Trigger email magic link / OTP.

**Request:**
```json
{ "email": "user@example.com" }
```

**Response `200`:**
```json
{ "data": { "message": "OTP sent" } }
```

**Errors:** `400 INVALID_EMAIL`, `429 RATE_LIMITED`  
**Rate limit:** 3 requests per email per 15 minutes.

---

#### `POST /auth/v1/otp/verify` [PUBLIC]

**Request:**
```json
{ "email": "user@example.com", "token": "847291", "type": "email" }
```

**Response `200`:**
```json
{
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 3600,
    "user": { "id": "uuid", "email": "...", "is_guest": false }
  }
}
```

---

#### `POST /auth/v1/guest` [PUBLIC]

Create anonymous guest session.

**Response `201`:**
```json
{
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": { "id": "uuid", "is_guest": true, "guest_expires_at": "..." }
  }
}
```

---

#### `POST /auth/v1/link-guest`

Merge guest data into authenticated account after OAuth/OTP sign-in.

**Request:**
```json
{ "guest_user_id": "uuid" }
```

**Response `200`:**
```json
{ "data": { "merged": true, "records_transferred": 14 } }
```

**Errors:** `404 GUEST_NOT_FOUND`, `409 ALREADY_LINKED`, `422 GUEST_EXPIRED`

---

#### `POST /auth/v1/refresh`

**Request:**
```json
{ "refresh_token": "..." }
```

**Response `200`:**
```json
{ "data": { "access_token": "...", "expires_in": 3600 } }
```

---

#### `POST /auth/v1/signout`

Revokes current session server-side.

**Response `204`:** No content.

---

### 3.2 User / Profile Endpoints (`/api/v1/users`)

#### `GET /api/v1/users/me`

Returns the authenticated user's full profile.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Alex",
    "email": "alex@example.com",
    "profession": "Engineering Manager",
    "stress_level": 4,
    "struggles": ["burnout", "overthinking", "work anxiety"],
    "goals": ["emotional clarity", "better sleep"],
    "calm_coins": 1240,
    "streak_days": 12,
    "is_guest": false,
    "onboarding_complete": true,
    "preferences": {
      "reminder_time": "09:00",
      "checkin_frequency": "daily",
      "companion_response_style": "reflective",
      "notifications_enabled": true
    },
    "joined_at": "2025-11-01T00:00:00Z"
  }
}
```

---

#### `PATCH /api/v1/users/me`

Update profile fields. All fields optional.

**Request:**
```json
{
  "name": "Alex",
  "profession": "Engineering Manager",
  "preferences": {
    "reminder_time": "21:00",
    "checkin_frequency": "daily",
    "companion_response_style": "reflective",
    "notifications_enabled": true
  }
}
```

**Response `200`:** Updated user object.  
**Validation:** `name` max 80 chars; `reminder_time` must be `HH:MM` format; `companion_response_style` must be `reflective | direct | gentle`.

---

#### `POST /api/v1/users/me/sync`

Called after OAuth sign-in to upsert user from Supabase identity data. Idempotent.

**Request:**
```json
{
  "name": "Alex Chen",
  "email": "alex@example.com",
  "avatar_url": "https://..."
}
```

**Response `200`:** Full user profile.

---

#### `DELETE /api/v1/users/me`

Soft-delete the account. Queues data deletion after 30-day grace period.

**Response `204`:** No content.

---

### 3.3 Onboarding Endpoints (`/api/v1/onboarding`)

The onboarding flow has 4 steps: profession → stress → struggles → goals.  
Each step is a separate screen. The client saves progress incrementally.

#### `POST /api/v1/onboarding/profile`

Submits completed onboarding profile. Called on the final goals step.

**Request:**
```json
{
  "profession": "em",
  "stress_level": 4,
  "struggles": ["burnout", "overthinking", "work anxiety"],
  "goals": ["emotional clarity", "better sleep"]
}
```

**Response `201`:**
```json
{
  "data": {
    "onboarding_complete": true,
    "profile_id": "uuid",
    "initial_calm_coins_awarded": 100
  }
}
```

**Side effects:**
- Sets `users.onboarding_complete = true`
- Awards 100 Calm Coins for completing onboarding
- Triggers first welcome notification (queued via Cloudflare Queues)
- Seeds `emotional_memory` with initial context from onboarding responses

**Validation:**
- `profession`: must be one of `['swe','em','design','pm','founder','other']`
- `stress_level`: integer 1–5
- `struggles`: array 1–10 items, each from allowed enum
- `goals`: array 1–6 items, each from allowed enum

---

#### `GET /api/v1/onboarding/status`

**Response `200`:**
```json
{
  "data": {
    "complete": true,
    "completed_at": "2025-11-01T12:00:00Z"
  }
}
```

---

### 3.4 Emotional Check-In Endpoints (`/api/v1/checkins`)

#### `GET /api/v1/checkins/today`

Returns today's check-in if it exists.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "date": "2026-05-24",
    "mood": "mentally tired",
    "note": "Long sprint review today.",
    "calm_score": 3,
    "created_at": "2026-05-24T09:14:00Z"
  }
}
```

**Response `204`:** No check-in yet today.

---

#### `POST /api/v1/checkins`

Create today's check-in. One per user per calendar day (UTC-local).

**Request:**
```json
{
  "mood": "mentally tired",
  "note": "Long sprint review today. Couldn't switch off after.",
  "calm_score": 3
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "date": "2026-05-24",
    "mood": "mentally tired",
    "note": "...",
    "calm_score": 3,
    "calm_coins_awarded": 10,
    "streak_updated_to": 13,
    "created_at": "..."
  }
}
```

**Side effects:**
- Awards 10 Calm Coins
- Recalculates streak (increments if yesterday also had a check-in, resets if gap > 1 day)
- Updates `emotional_memory.recent_moods` array
- Triggers async pattern analysis job (Cloudflare Queue)

**Validation:**
- `mood`: required, max 60 chars, must match allowed enum
- `note`: optional, max 500 chars
- `calm_score`: optional, integer 1–5
- One check-in per user per day — returns `409 CHECKIN_ALREADY_EXISTS` if duplicate

**Rate limit:** 5 requests per user per hour (prevents spamming on error)

---

#### `GET /api/v1/checkins`

Returns paginated check-in history.

**Query params:** `?limit=20&cursor=<cursor>&from=2026-05-01&to=2026-05-24`

**Response `200`:**
```json
{
  "data": {
    "items": [
      { "id": "uuid", "date": "...", "mood": "...", "note": "...", "calm_score": 3 }
    ],
    "next_cursor": "opaque_base64_string",
    "total": 42
  }
}
```

---

#### `GET /api/v1/checkins/weekly`

Returns the 7-day mood summary for the home screen chart.

**Response `200`:**
```json
{
  "data": {
    "week_start": "2026-05-18",
    "days": [
      { "day": "Mon", "date": "2026-05-18", "score": 1, "label": "overwhelmed" },
      { "day": "Tue", "date": "2026-05-19", "score": 4, "label": "hopeful" }
    ]
  }
}
```

Days with no check-in return `{ "score": null, "label": null }`.

---

#### `PATCH /api/v1/checkins/:id`

Update note or calm_score on an existing check-in (same-day only).

**Request:**
```json
{ "note": "Updated reflection on the day.", "calm_score": 4 }
```

**Validation:** Cannot edit check-ins older than 24 hours. Returns `403 EDIT_WINDOW_EXPIRED`.

---

### 3.5 Journal Endpoints (`/api/v1/journal`)

#### `GET /api/v1/journal`

Paginated journal entries, newest first.

**Query params:** `?limit=20&cursor=<cursor>&mood=anxious&tag=burnout`

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "date": "2026-05-23",
        "title": "After the sprint",
        "content": "I don't know why I feel so empty...",
        "tags": ["burnout", "reflection"],
        "mood": "mentally tired",
        "word_count": 64,
        "created_at": "2026-05-23T20:00:00Z",
        "updated_at": "2026-05-23T20:00:00Z"
      }
    ],
    "next_cursor": "...",
    "total": 6
  }
}
```

---

#### `POST /api/v1/journal`

Create a new journal entry.

**Request:**
```json
{
  "title": "After the sprint",
  "content": "I don't know why I feel so empty after we shipped...",
  "mood": "mentally tired",
  "tags": ["burnout", "reflection"]
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "date": "2026-05-23",
    "title": "...",
    "content": "...",
    "tags": [...],
    "mood": "...",
    "word_count": 64,
    "calm_coins_awarded": 15,
    "created_at": "..."
  }
}
```

**Side effects:**
- Awards 15 Calm Coins per entry
- Triggers async emotional memory extraction (tag recurring themes)
- Word count stored for insights

**Validation:**
- `title`: required, max 120 chars
- `content`: required, min 10 chars, max 10,000 chars
- `mood`: optional, from allowed enum
- `tags`: optional, max 10 items, each max 40 chars

---

#### `GET /api/v1/journal/:id`

Returns single entry.

---

#### `PATCH /api/v1/journal/:id`

Update title, content, tags, or mood.

**Validation:** User must own the entry. Returns `403 FORBIDDEN` otherwise.

---

#### `DELETE /api/v1/journal/:id`

Soft-delete entry. Sets `deleted_at`.

**Response `204`:** No content.

---

### 3.6 AI Companion Endpoints (`/ai/v1`)

The AI companion is streamed via Server-Sent Events (SSE) for real-time feel.

#### `GET /ai/v1/conversations`

Returns list of conversation sessions.

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "started_at": "2026-05-23T09:14:00Z",
        "message_count": 7,
        "last_message_at": "2026-05-23T09:17:00Z",
        "preview": "That kind of post-delivery emptiness is more common..."
      }
    ]
  }
}
```

---

#### `GET /ai/v1/conversations/:id/messages`

Returns all messages in a conversation.

**Response `200`:**
```json
{
  "data": {
    "conversation_id": "uuid",
    "messages": [
      {
        "id": "uuid",
        "role": "assistant",
        "content": "I noticed you've been checking in as mentally tired...",
        "timestamp": "2026-05-23T09:14:00Z",
        "tokens_used": 38
      }
    ]
  }
}
```

---

#### `POST /ai/v1/conversations`

Create a new conversation session.

**Request:**
```json
{ "context": "home" }
```

`context` can be `home | reflect | journal` and influences the initial companion greeting.

**Response `201`:**
```json
{ "data": { "conversation_id": "uuid" } }
```

---

#### `POST /ai/v1/conversations/:id/messages` (Streaming SSE)

Send a user message and stream the assistant response.

**Request:**
```json
{ "content": "Just tired. The sprint ended and somehow I feel worse, not better." }
```

**Response:** `Content-Type: text/event-stream`

```
data: {"type":"content_start","message_id":"uuid"}
data: {"type":"content_delta","delta":"That kind of "}
data: {"type":"content_delta","delta":"post-delivery emptiness "}
data: {"type":"content_delta","delta":"is more common than people talk about."}
data: {"type":"content_end","tokens_used":87,"message_id":"uuid"}
```

If streaming is not supported by the client (e.g., RN Web polyfill gap), fall back to:

`POST /ai/v1/conversations/:id/messages?stream=false`

Returns standard JSON with the full assistant response.

**Rate limits:**
- 30 messages per user per day (free tier)
- 5 messages per minute per user
- Returns `429 RATE_LIMITED` with `{ "reset_at": "..." }`

**Side effects:**
- User message stored with `role = 'user'`
- Assistant response stored with `role = 'assistant'` and `tokens_used`
- After every 5 exchanges, trigger async emotional memory update job

---

#### `DELETE /ai/v1/conversations/:id`

Soft-delete conversation and all its messages.

**Response `204`:** No content.

---

### 3.7 Emotional Insights Endpoints (`/api/v1/insights`)

#### `GET /api/v1/insights/weekly`

Returns the same data as `checkins/weekly` but enriched with AI-derived patterns.

**Response `200`:**
```json
{
  "data": {
    "weekly_summary": {
      "dominant_mood": "anxious",
      "average_calm_score": 2.8,
      "best_day": "Saturday",
      "worst_day": "Monday",
      "days": [...]
    },
    "patterns": [
      { "icon": "moon", "text": "You tend to feel calmer on weekend mornings." },
      { "icon": "alert-triangle", "text": "Late-meeting Thursdays often carry into your evenings." }
    ],
    "streak": {
      "current": 12,
      "longest": 12,
      "last_checkin_date": "2026-05-23"
    }
  }
}
```

---

#### `GET /api/v1/insights/patterns`

Returns AI-analyzed behavioral patterns derived from check-in and journal history.

**Response `200`:**
```json
{
  "data": {
    "patterns": [
      {
        "id": "uuid",
        "icon": "moon",
        "text": "You tend to feel calmer on weekend mornings.",
        "confidence": 0.82,
        "detected_at": "2026-05-20T00:00:00Z",
        "based_on_entries": 8
      }
    ],
    "last_analyzed_at": "2026-05-24T00:00:00Z"
  }
}
```

**Rate limit:** Patterns are refreshed at most once per 24 hours. Subsequent calls within 24h return cached data with `"from_cache": true`.

---

#### `GET /api/v1/insights/mood-history`

Returns mood data for longer timeframes.

**Query params:** `?period=30d|90d|all`

**Response `200`:**
```json
{
  "data": {
    "period": "30d",
    "entries": [
      { "date": "2026-04-24", "mood": "anxious", "calm_score": 2 }
    ],
    "summary": {
      "mood_distribution": {
        "calm": 0.22,
        "anxious": 0.18,
        "overwhelmed": 0.12
      },
      "average_calm_score": 3.1
    }
  }
}
```

---

### 3.8 Calm Coins Endpoints (`/api/v1/coins`)

#### `GET /api/v1/coins/balance`

**Response `200`:**
```json
{
  "data": {
    "balance": 1240,
    "total_earned": 1440,
    "total_spent": 200
  }
}
```

---

#### `GET /api/v1/coins/history`

Paginated ledger of all coin transactions.

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "amount": 15,
        "direction": "credit",
        "reason": "journal_entry",
        "description": "Journal entry written",
        "balance_after": 1240,
        "created_at": "..."
      }
    ]
  }
}
```

`reason` enum: `onboarding_complete | daily_checkin | journal_entry | referral_joined | streak_milestone | reward_redeemed`

---

### 3.9 Referral Endpoints (`/api/v1/referrals`)

#### `GET /api/v1/referrals/code`

Returns user's referral code.

**Response `200`:**
```json
{
  "data": {
    "code": "ALEX-CALM",
    "link": "https://nervana.app/join?ref=ALEX-CALM",
    "total_referred": 3,
    "successful_referrals": 2,
    "coins_earned": 400
  }
}
```

Referral codes are generated at user creation: first 4 chars of `name` (uppercased) + `-CALM` + random suffix if collision.

---

#### `GET /api/v1/referrals`

Returns list of people this user referred.

**Response `200`:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "referred_user_display": "Jordan",
        "joined": true,
        "coins_awarded_to_referrer": 200,
        "joined_at": "2026-03-12T00:00:00Z"
      }
    ]
  }
}
```

Note: Only first name is returned for privacy. Full referred user identity is not exposed.

---

#### `POST /api/v1/referrals/redeem` [PUBLIC — during sign-up]

Called when a new user signs up with a referral code.

**Request:**
```json
{ "code": "ALEX-CALM", "new_user_id": "uuid" }
```

**Response `200`:**
```json
{
  "data": {
    "valid": true,
    "coins_awarded_to_new_user": 200,
    "coins_awarded_to_referrer": 200
  }
}
```

**Validation:**
- Code must exist and belong to an active, non-guest user
- `new_user_id` must not have redeemed a referral before
- Referrer cannot refer themselves (same email domain check insufficient — check user ID)
- One referral per new account

---

### 3.10 Notifications Endpoints (`/api/v1/notifications`)

#### `GET /api/v1/notifications`

**Query params:** `?limit=20&cursor=<cursor>&unread_only=true`

**Response `200`:**
```json
{
  "data": {
    "unread_count": 2,
    "items": [
      {
        "id": "uuid",
        "title": "A quieter moment",
        "body": "You've been carrying a lot today...",
        "type": "emotional_nudge",
        "read": false,
        "created_at": "2026-05-24T10:00:00Z"
      }
    ]
  }
}
```

`type` enum: `emotional_nudge | checkin_reminder | streak_milestone | referral_joined | system`

---

#### `PATCH /api/v1/notifications/:id/read`

Mark a notification as read.

**Response `200`:** Updated notification.

---

#### `POST /api/v1/notifications/read-all`

Mark all notifications as read.

**Response `200`:**
```json
{ "data": { "marked_read": 4 } }
```

---

#### `POST /api/v1/notifications/push-token`

Register an Expo push token for this device.

**Request:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios",
  "device_id": "opaque-device-id"
}
```

**Response `201`:** Upserts token for the user/device pair.

---

#### `DELETE /api/v1/notifications/push-token`

Remove push token when user signs out or disables notifications.

**Request:**
```json
{ "token": "ExponentPushToken[...]" }
```

---

### 3.11 Profile / Settings Endpoints

#### `PATCH /api/v1/users/me/preferences`

Update notification preferences and settings.

**Request:**
```json
{
  "reminder_time": "21:00",
  "checkin_frequency": "daily",
  "companion_response_style": "reflective",
  "notifications_enabled": false
}
```

**Validation:**
- `reminder_time`: `HH:MM` 24h format
- `checkin_frequency`: `daily | weekdays | custom`
- `companion_response_style`: `reflective | direct | gentle`

---

### 3.12 Emotional Memory Endpoints (`/api/v1/memory`)

These are primarily internal — used by the AI orchestration layer — but may be exposed for transparency.

#### `GET /api/v1/memory/summary`

Returns a sanitized version of the AI's emotional context for this user.

**Response `200`:**
```json
{
  "data": {
    "recurring_struggles": ["burnout", "overthinking"],
    "recent_moods": ["mentally tired", "anxious", "calm"],
    "recent_themes_in_journal": ["sprint exhaustion", "imposter syndrome"],
    "dominant_context": "Engineering Manager under sustained pressure",
    "last_updated_at": "2026-05-24T00:00:00Z"
  }
}
```

---

## 4. Database Schema

All tables use:
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` (updated via trigger)
- `deleted_at TIMESTAMPTZ` for soft-deletes

A common trigger function handles `updated_at`:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Apply with:
```sql
CREATE TRIGGER set_updated_at_<table>
  BEFORE UPDATE ON <table>
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

### 4.1 Enums

```sql
CREATE TYPE profession_type AS ENUM (
  'swe', 'em', 'design', 'pm', 'founder', 'other'
);

CREATE TYPE mood_type AS ENUM (
  'overwhelmed', 'mentally_tired', 'anxious', 'distracted',
  'calm', 'emotionally_numb', 'hopeful', 'lonely',
  'stressed', 'sad', 'neutral', 'energized'
);

CREATE TYPE companion_style AS ENUM (
  'reflective', 'direct', 'gentle'
);

CREATE TYPE checkin_frequency AS ENUM (
  'daily', 'weekdays', 'custom'
);

CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

CREATE TYPE coin_direction AS ENUM ('credit', 'debit');

CREATE TYPE coin_reason AS ENUM (
  'onboarding_complete', 'daily_checkin', 'journal_entry',
  'referral_joined', 'streak_milestone', 'reward_redeemed',
  'admin_adjustment'
);

CREATE TYPE notification_type AS ENUM (
  'emotional_nudge', 'checkin_reminder', 'streak_milestone',
  'referral_joined', 'system'
);

CREATE TYPE push_platform AS ENUM ('ios', 'android', 'web');
```

---

### 4.2 Users

```sql
CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_uid          UUID UNIQUE NOT NULL,       -- Supabase Auth user.id
  email                 TEXT UNIQUE,                 -- NULL for guests
  name                  TEXT,
  avatar_url            TEXT,
  profession            profession_type,
  stress_level          SMALLINT CHECK (stress_level BETWEEN 1 AND 5),
  struggles             TEXT[] DEFAULT '{}',
  goals                 TEXT[] DEFAULT '{}',
  calm_coins            INTEGER NOT NULL DEFAULT 0 CHECK (calm_coins >= 0),
  streak_days           INTEGER NOT NULL DEFAULT 0,
  last_checkin_date     DATE,
  onboarding_complete   BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  is_guest              BOOLEAN NOT NULL DEFAULT FALSE,
  guest_expires_at      TIMESTAMPTZ,
  referral_code         TEXT UNIQUE,
  referred_by_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  reminder_time         TIME DEFAULT '09:00:00',
  checkin_frequency     checkin_frequency DEFAULT 'daily',
  companion_style       companion_style DEFAULT 'reflective',
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  timezone              TEXT DEFAULT 'UTC',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX idx_users_supabase_uid ON users(supabase_uid);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_guests ON users(guest_expires_at) WHERE is_guest = TRUE;
```

---

### 4.3 Onboarding Profiles

```sql
CREATE TABLE onboarding_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profession    profession_type,
  stress_level  SMALLINT CHECK (stress_level BETWEEN 1 AND 5),
  struggles     TEXT[] NOT NULL DEFAULT '{}',
  goals         TEXT[] NOT NULL DEFAULT '{}',
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_onboarding_user UNIQUE (user_id)
);

CREATE INDEX idx_onboarding_user_id ON onboarding_profiles(user_id);
```

---

### 4.4 Emotional Check-ins

```sql
CREATE TABLE emotional_checkins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  mood         TEXT NOT NULL,               -- denormalized string for flexibility
  note         TEXT,
  calm_score   SMALLINT CHECK (calm_score BETWEEN 1 AND 5),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ,

  CONSTRAINT uq_checkin_user_date UNIQUE (user_id, date)
);

CREATE INDEX idx_checkins_user_id ON emotional_checkins(user_id);
CREATE INDEX idx_checkins_user_date ON emotional_checkins(user_id, date DESC);
CREATE INDEX idx_checkins_active ON emotional_checkins(user_id, date) 
  WHERE deleted_at IS NULL;
```

---

### 4.5 Journal Entries

```sql
CREATE TABLE journal_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (char_length(title) <= 120),
  content     TEXT NOT NULL CHECK (char_length(content) >= 10),
  mood        TEXT,
  tags        TEXT[] DEFAULT '{}',
  word_count  INTEGER GENERATED ALWAYS AS (
                array_length(regexp_split_to_array(trim(content), '\s+'), 1)
              ) STORED,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_user_created ON journal_entries(user_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_tags ON journal_entries USING GIN(tags);
CREATE INDEX idx_journal_mood ON journal_entries(user_id, mood) WHERE deleted_at IS NULL;

-- Full-text search on journal content (future feature)
CREATE INDEX idx_journal_fts ON journal_entries
  USING GIN(to_tsvector('english', title || ' ' || content))
  WHERE deleted_at IS NULL;
```

---

### 4.6 AI Conversations

```sql
CREATE TABLE ai_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  context         TEXT DEFAULT 'home',   -- 'home' | 'reflect' | 'journal'
  message_count   INTEGER NOT NULL DEFAULT 0,
  total_tokens    INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_conversations_user ON ai_conversations(user_id, created_at DESC)
  WHERE deleted_at IS NULL;
```

---

### 4.7 AI Messages

```sql
CREATE TABLE ai_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            message_role NOT NULL,
  content         TEXT NOT NULL,
  tokens_used     INTEGER DEFAULT 0,
  model_used      TEXT,                  -- 'gpt-4o' | 'claude-3-5-sonnet'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON ai_messages(conversation_id, created_at ASC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_user ON ai_messages(user_id, created_at DESC);
```

---

### 4.8 Emotional Memory

One row per user. Holds the AI's persistent emotional context summary.

```sql
CREATE TABLE emotional_memory (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recurring_struggles    TEXT[] DEFAULT '{}',
  recent_moods           TEXT[] DEFAULT '{}',  -- Last 14 moods, FIFO
  recurring_themes       TEXT[] DEFAULT '{}',  -- Extracted from journal
  dominant_context       TEXT,                  -- AI-generated summary string
  positive_signals       TEXT[] DEFAULT '{}',  -- Things that help them
  last_updated_at        TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_memory_user UNIQUE (user_id)
);

CREATE INDEX idx_memory_user ON emotional_memory(user_id);
```

---

### 4.9 Emotional Patterns

```sql
CREATE TABLE emotional_patterns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  icon            TEXT NOT NULL,          -- Feather icon name
  text            TEXT NOT NULL,
  confidence      FLOAT CHECK (confidence BETWEEN 0 AND 1),
  based_on_count  INTEGER DEFAULT 0,      -- Number of data points
  detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,            -- Patterns refresh after 7 days
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patterns_user ON emotional_patterns(user_id, detected_at DESC);
CREATE INDEX idx_patterns_active ON emotional_patterns(user_id)
  WHERE expires_at IS NULL OR expires_at > NOW();
```

---

### 4.10 Calm Coins Ledger

```sql
CREATE TABLE calm_coins_ledger (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount         INTEGER NOT NULL CHECK (amount > 0),
  direction      coin_direction NOT NULL,
  reason         coin_reason NOT NULL,
  description    TEXT,
  reference_id   UUID,                -- ID of the triggering entity (checkin_id, etc.)
  balance_after  INTEGER NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coins_user ON calm_coins_ledger(user_id, created_at DESC);
CREATE INDEX idx_coins_reason ON calm_coins_ledger(user_id, reason);
```

---

### 4.11 Referrals

```sql
CREATE TABLE referrals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  code              TEXT NOT NULL,
  joined            BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at         TIMESTAMPTZ,
  coins_to_referrer INTEGER DEFAULT 0,
  coins_to_referred INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_referral_referred_user UNIQUE (referred_user_id)
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(code);
```

---

### 4.12 Notifications

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        notification_type NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  data        JSONB DEFAULT '{}',          -- Arbitrary metadata for deep linking
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_unread ON notifications(user_id)
  WHERE read = FALSE AND deleted_at IS NULL;
```

---

### 4.13 Push Tokens

```sql
CREATE TABLE push_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    push_platform NOT NULL,
  device_id   TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_push_token UNIQUE (token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id) WHERE active = TRUE;
```

---

### 4.14 Admin Logs

```sql
CREATE TABLE admin_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,                       -- 'user' | 'journal' | etc.
  target_id   UUID,
  metadata    JSONB DEFAULT '{}',
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_logs_target ON admin_logs(target_type, target_id);
```

---

### 4.15 Row-Level Security

Enable RLS on all user-data tables:

```sql
ALTER TABLE emotional_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE calm_coins_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Pattern: users can only see their own rows
CREATE POLICY "users_own_checkins" ON emotional_checkins
  FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "users_own_journals" ON journal_entries
  FOR ALL USING (user_id = auth.uid()::uuid);

-- Repeat analogous policies for all user-data tables
-- Service role (Workers) bypasses RLS via Supabase service_role key
```

Workers use the `service_role` key. Client-side Supabase SDK (if used) uses the `anon` key with RLS enforcement.

---

### 4.16 Guest Data Isolation Function

```sql
CREATE OR REPLACE FUNCTION link_guest_to_user(
  p_guest_id UUID,
  p_real_id  UUID
) RETURNS JSONB AS $$
DECLARE
  v_count INTEGER := 0;
  v_rec   INTEGER;
BEGIN
  -- Verify guest
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_guest_id AND is_guest = TRUE) THEN
    RAISE EXCEPTION 'GUEST_NOT_FOUND';
  END IF;

  -- Reassign all owned tables
  UPDATE emotional_checkins SET user_id = p_real_id WHERE user_id = p_guest_id;
  GET DIAGNOSTICS v_rec = ROW_COUNT; v_count := v_count + v_rec;

  UPDATE journal_entries SET user_id = p_real_id WHERE user_id = p_guest_id;
  GET DIAGNOSTICS v_rec = ROW_COUNT; v_count := v_count + v_rec;

  UPDATE ai_conversations SET user_id = p_real_id WHERE user_id = p_guest_id;
  GET DIAGNOSTICS v_rec = ROW_COUNT; v_count := v_count + v_rec;

  UPDATE ai_messages SET user_id = p_real_id WHERE user_id = p_guest_id;
  GET DIAGNOSTICS v_rec = ROW_COUNT; v_count := v_count + v_rec;

  UPDATE calm_coins_ledger SET user_id = p_real_id WHERE user_id = p_guest_id;
  GET DIAGNOSTICS v_rec = ROW_COUNT; v_count := v_count + v_rec;

  -- Copy onboarding profile
  INSERT INTO onboarding_profiles (user_id, profession, stress_level, struggles, goals, completed_at)
  SELECT p_real_id, profession, stress_level, struggles, goals, completed_at
  FROM onboarding_profiles WHERE user_id = p_guest_id
  ON CONFLICT (user_id) DO NOTHING;

  -- Copy emotional memory
  INSERT INTO emotional_memory (user_id, recurring_struggles, recent_moods, recurring_themes, dominant_context)
  SELECT p_real_id, recurring_struggles, recent_moods, recurring_themes, dominant_context
  FROM emotional_memory WHERE user_id = p_guest_id
  ON CONFLICT (user_id) DO NOTHING;

  -- Copy calm coins balance
  UPDATE users SET calm_coins = users.calm_coins + guest.calm_coins
  FROM users AS guest
  WHERE users.id = p_real_id AND guest.id = p_guest_id;

  -- Copy streak
  UPDATE users SET
    streak_days = (SELECT streak_days FROM users WHERE id = p_guest_id),
    last_checkin_date = (SELECT last_checkin_date FROM users WHERE id = p_guest_id),
    onboarding_complete = TRUE
  WHERE id = p_real_id;

  -- Soft-delete guest
  UPDATE users SET deleted_at = NOW() WHERE id = p_guest_id;

  RETURN jsonb_build_object('merged', TRUE, 'records_transferred', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. AI Architecture

### 5.1 Philosophy

Nervana's AI companion is not a therapist. It is not a productivity coach. It is not a motivational bot.

It is a **thoughtful presence** — trained through prompting to reflect rather than advise, to hold space rather than solve, and to name feelings rather than minimize them. Every response should feel like it came from someone who read the room.

**Emotional design principles for the AI:**
- Never immediately offer solutions. First, acknowledge.
- Name the feeling before expanding it.
- Use language that lands — not clinical terminology, not startup jargon.
- Never suggest a user "should" feel anything.
- Never minimize with "at least...".
- Normalize without dismissing.

---

### 5.2 Model Selection

| Task | Model | Reasoning |
|---|---|---|
| Companion chat | Anthropic Claude 3.5 Sonnet | Superior emotional nuance, lower hallucination, natural warmth |
| Pattern analysis | GPT-4o | Strong structured output, JSON mode |
| Emotional memory extraction | GPT-4o-mini | Fast, cheap, runs after every 5 exchanges |
| Journal theme tagging | GPT-4o-mini | Lightweight classification |

Use model fallbacks: if Anthropic API is unreachable, fall back to GPT-4o.

---

### 5.3 System Prompt Architecture

The companion's system prompt is assembled dynamically per request:

```
[PERSONA BLOCK]
[USER CONTEXT BLOCK]
[EMOTIONAL MEMORY BLOCK]
[RECENT CHECK-IN CONTEXT BLOCK]
[CONVERSATION STYLE BLOCK]
[SAFETY BOUNDARY BLOCK]
```

**PERSONA BLOCK** (static):
```
You are Nervana's emotional companion. You are not a therapist.
You do not diagnose, prescribe, or treat. You are a calm, emotionally
intelligent presence who helps people process what they're carrying.

Your tone is warm, measured, non-clinical. You reflect more than you advise.
You do not hype or minimize. You hold space.
```

**USER CONTEXT BLOCK** (personalized per user):
```
The person you're speaking with:
- Works as: {profession}
- Reported stress level at onboarding: {stress_level}/5
- Struggles they identified: {struggles.join(', ')}
- What they want from Nervana: {goals.join(', ')}
```

**EMOTIONAL MEMORY BLOCK** (from `emotional_memory` table):
```
What you've learned about this person over time:
- Recurring patterns: {recurring_struggles.join(', ')}
- How they've been feeling recently: {recent_moods.join(', ')}
- Themes from their journal: {recurring_themes.join(', ')}
- What seems to help them: {positive_signals.join(', ')}
Context summary: {dominant_context}
```

**RECENT CHECK-IN CONTEXT BLOCK** (from last 3 check-ins):
```
Their recent check-ins:
- {date}: {mood} ({calm_score}/5)
- {date}: {mood} ({calm_score}/5)
- {date}: {mood} ({calm_score}/5)
```

**CONVERSATION STYLE BLOCK** (based on `companion_style` preference):
- `reflective`: Prioritize open questions. Mirror feelings back. Let silence exist.
- `direct`: Shorter responses. Concrete acknowledgements. Less open-ended questioning.
- `gentle`: Extra warmth. More validation. Softer pacing.

**SAFETY BOUNDARY BLOCK** (static):
```
If the person expresses thoughts of self-harm or suicide, respond with
warmth and acknowledge the pain. Then gently recommend they reach out
to a crisis line appropriate to their region (e.g., 988 in the US).
Do not continue the therapeutic conversation. Do not panic or lecture.

You are not a replacement for professional mental health care. If someone
is in a mental health emergency, your job is to acknowledge, not to treat.
```

---

### 5.4 Conversation Persistence

Every conversation is stored in `ai_conversations` + `ai_messages`.

When assembling the messages array to send to the API:

1. Load the last 20 messages from `ai_messages` for this conversation (ordered ascending).
2. Prepend the assembled system prompt as a `system` role message.
3. Send the full messages array to the model.
4. Stream the response back to the client.
5. Once streaming completes, save the assistant message to `ai_messages`.
6. Update `ai_conversations.message_count`, `total_tokens`, `last_message_at`.

**Token budget management:**
- Target max 12,000 tokens per API call (well within Claude 3.5's 200k context but cost-conscious).
- If conversation grows beyond 40 messages, summarize the oldest 20 into a single "Earlier in this conversation..." assistant summary message and delete those rows.

---

### 5.5 Emotional Memory Updates

Emotional memory is updated asynchronously — never blocking the chat response.

**Trigger:** Every 5 user messages in any conversation, enqueue a `UPDATE_EMOTIONAL_MEMORY` job.

**Job process:**
1. Load the last 30 journal entries (titles + moods only, not full content for privacy).
2. Load the last 30 check-ins (moods + calm scores).
3. Load `emotional_memory` current state.
4. Send to GPT-4o-mini:

```
Analyze these emotional signals from a user of an emotional wellness app.
Return JSON with:
- recurring_struggles: string[] (max 5, emotional patterns)
- recent_moods: string[] (last 14 moods in chronological order)
- recurring_themes: string[] (themes from journal, max 5)
- positive_signals: string[] (situations/patterns that improve their state)
- dominant_context: string (1-2 sentence summary of who this person is emotionally right now)

Check-in data: {json}
Journal data: {json}
Current memory: {json}
```

5. Upsert result into `emotional_memory`.

**Privacy note:** Journal content is never sent to the AI in full. Only title and mood tag are included in the memory extraction prompt.

---

### 5.6 Pattern Analysis

Pattern analysis runs as a scheduled job (once per day per user, via Cloudflare Queue):

```
Trigger: daily_pattern_analysis cron (midnight UTC)
Input: Last 30 check-ins with moods, dates, calm scores
Input: Last 14 journal entries moods and tags
Prompt: "Identify 3-5 behavioral emotional patterns from this data..."
Output: JSON array of { icon, text, confidence, based_on_count }
Store: emotional_patterns table (expires_at = NOW() + 7 days)
```

Pattern text must sound human and specific to Nervana's voice — not generic wellness copy.

---

### 5.7 Companion Greeting Logic

When a new conversation is created, the first assistant message is generated based on context:

- **Context `home`:** Check if user has a check-in today. If yes, acknowledge the mood. If no, invite them to share what's on their mind.
- **Context `reflect`:** Gently open the reflection space.
- **Context `journal`:** Reference a recent journal theme if available.

The greeting is generated by the AI using a shorter, cheaper call — not a full streaming request.

---

### 5.8 Moderation

Before any user message is sent to the AI model, run it through a content moderation check:

- **Option 1:** OpenAI's `omni-moderation-latest` model (fast, cheap, already in the stack).
- **Option 2:** A simple keyword classifier for severe crisis language as a pre-check.

If the moderation score for `self-harm` or `violence` exceeds threshold:
1. Do not send to the main companion model.
2. Return a pre-written compassionate crisis response.
3. Log the event to `admin_logs` (no PII in the log — just user_id, timestamp, category).

---

## 6. Notifications Architecture

### 6.1 Notification Types

| Type | Trigger | Delivery |
|---|---|---|
| `checkin_reminder` | Daily at user's `reminder_time` | Push + in-app |
| `emotional_nudge` | Adaptive — based on recent mood patterns | Push + in-app |
| `streak_milestone` | On streak day 3, 7, 14, 30 | Push + in-app |
| `referral_joined` | When referred user completes onboarding | Push + in-app |
| `system` | Manual admin broadcast | In-app only |

### 6.2 Scheduling Architecture

```
Cloudflare Cron Trigger (every 5 minutes):
→ notification-worker polls users where:
    reminder_time::time = NOW() AT TIME ZONE timezone (rounded to 5min)
    AND notifications_enabled = TRUE
    AND NOT already sent today
→ For each matching user:
    → INSERT INTO notifications (type='checkin_reminder', ...)
    → Enqueue push delivery job
```

```
Cloudflare Queue consumer (notification-worker):
→ Receives { user_id, notification_id, token[] }
→ Calls Expo Push API: POST https://exp.host/--/api/v2/push/send
→ Handles ReceiptId → polls receipt endpoint after 15 minutes
→ If receipt status = 'error' and details.error = 'DeviceNotRegistered':
    → Deactivate the push token
```

### 6.3 Adaptive Emotional Nudges

Nudges are not scheduled — they are triggered by emotional signals:

- **3 consecutive high-stress check-ins:** Send a "You've been carrying a lot" nudge.
- **2-day gap without check-in:** Send a gentle "We haven't heard from you" nudge.
- **First calm day after a difficult stretch:** Send a positive acknowledgment.

Nudge logic runs as a post-checkin side effect (Cloudflare Queue job).

### 6.4 Notification Tone Guidelines

All push notification copy follows Nervana's voice:

**✓ Good:**
- "You've been showing up every day. That's worth noting."
- "How has your mind been lately?"
- "A quieter moment, whenever you're ready."

**✗ Avoid:**
- "Don't forget to check in!"
- "You've got this! 💪"
- "Unlock your streak!"
- Exclamation marks as urgency signals
- Gamification language ("Level up your wellness!")

---

## 7. Security Considerations

### 7.1 Rate Limiting

Implemented via Cloudflare Workers + KV for counters:

| Endpoint | Limit | Window |
|---|---|---|
| `POST /auth/v1/otp` | 3 per email | 15 min |
| `POST /auth/v1/otp/verify` | 5 attempts | 15 min |
| `POST /ai/v1/conversations/:id/messages` | 30 messages/day | 24h rolling |
| `POST /ai/v1/conversations/:id/messages` | 5 messages/min | 1 min |
| `POST /api/v1/checkins` | 5 per user | 1 hour |
| `POST /api/v1/journal` | 50 per user | 24h |
| `POST /api/v1/referrals/redeem` | 1 per new user | Lifetime |
| All authenticated endpoints | 1000 req/user | 1 hour |

Rate limit response: `429 Too Many Requests` with `Retry-After` header.

### 7.2 Journal Privacy

- Journal content is never included in AI prompts (only title + mood tag used for memory extraction).
- Journal content is never logged in `admin_logs`.
- Soft-delete is the default. Hard-delete runs 30 days after soft-delete for data minimization.
- Journal content is encrypted at rest via Supabase's default Postgres encryption + disk encryption.
- Future: client-side encryption (user's device key) for zero-knowledge journal storage.

### 7.3 Referral Abuse Prevention

- One referral redemption per account (enforced by `UNIQUE (referred_user_id)` constraint).
- Referrer cannot self-refer (enforced by checking `referrer_id != referred_user_id`).
- Same email domain does not block referral (many teams share domains) but same email does.
- Device fingerprint check (optional): flag if the same device creates multiple accounts to farm coins.
- Coin fraud detection job: flag if a user earns >1000 coins in 24h for manual review.

### 7.4 AI Misuse Prevention

- User message content moderation (section 5.8) before every AI call.
- Rate limiting on companion (section 7.1).
- Maximum message length: 2000 characters per message.
- Maximum conversation length: 100 messages before requiring a new conversation.
- Jailbreak detection: if a system-prompt injection pattern is detected in the user message, reject silently with a benign response.
- All AI responses checked against moderation before being stored or streamed to client.

### 7.5 Input Validation

All inputs validated at the Worker layer using Zod before touching the database:

```ts
import { z } from 'zod';

const CheckinSchema = z.object({
  mood: z.string().min(1).max(60),
  note: z.string().max(500).optional(),
  calm_score: z.number().int().min(1).max(5).optional(),
});
```

Return `400 Bad Request` with field-level errors for validation failures.

### 7.6 Authentication on Every Request

```ts
// middleware/auth.ts
export async function requireAuth(request: Request, env: Env): Promise<User> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throw new APIError(401, 'UNAUTHORIZED');
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new APIError(401, 'INVALID_TOKEN');
  
  const dbUser = await getUserBySupabaseUid(user.id, env);
  if (!dbUser || dbUser.deleted_at) throw new APIError(401, 'USER_NOT_FOUND');
  
  return dbUser;
}
```

### 7.7 CORS Configuration

```ts
const ALLOWED_ORIGINS = [
  'https://nervana.app',
  'https://wearenervana.com',
  // Dev only:
  'exp://localhost:8081',
];
```

Mobile app calls use HTTPS with Bearer tokens — CORS is primarily for any web companion.

---

## 8. Folder Structure

```
workers/
├── src/
│   ├── index.ts                    # Worker entry point — router
│   │
│   ├── routes/
│   │   ├── auth.ts                 # /auth/v1/*
│   │   ├── users.ts                # /api/v1/users/*
│   │   ├── onboarding.ts           # /api/v1/onboarding/*
│   │   ├── checkins.ts             # /api/v1/checkins/*
│   │   ├── journal.ts              # /api/v1/journal/*
│   │   ├── ai.ts                   # /ai/v1/*
│   │   ├── insights.ts             # /api/v1/insights/*
│   │   ├── coins.ts                # /api/v1/coins/*
│   │   ├── referrals.ts            # /api/v1/referrals/*
│   │   ├── notifications.ts        # /api/v1/notifications/*
│   │   └── memory.ts               # /api/v1/memory/*
│   │
│   ├── middleware/
│   │   ├── auth.ts                 # JWT verification + user hydration
│   │   ├── ratelimit.ts            # KV-backed rate limiting
│   │   ├── cors.ts                 # CORS headers
│   │   ├── logging.ts              # Request/response logging
│   │   └── validation.ts           # Zod schema validation factory
│   │
│   ├── services/
│   │   ├── ai/
│   │   │   ├── companion.ts        # Companion chat orchestration
│   │   │   ├── memory.ts           # Emotional memory extraction
│   │   │   ├── patterns.ts         # Pattern analysis
│   │   │   ├── prompts.ts          # System prompt assembly
│   │   │   └── moderation.ts       # Content moderation
│   │   ├── auth/
│   │   │   ├── supabase.ts         # Supabase Auth client
│   │   │   └── guest.ts            # Guest merge logic
│   │   ├── coins/
│   │   │   └── ledger.ts           # Coin award + debit transactions
│   │   ├── notifications/
│   │   │   ├── push.ts             # Expo Push API client
│   │   │   ├── scheduler.ts        # Queue job production
│   │   │   └── copy.ts             # Notification copy templates
│   │   ├── referrals/
│   │   │   └── referrals.ts        # Referral code generation + validation
│   │   └── streak/
│   │       └── streak.ts           # Streak calculation logic
│   │
│   ├── repositories/
│   │   ├── users.ts                # User DB queries
│   │   ├── checkins.ts             # Check-in DB queries
│   │   ├── journal.ts              # Journal DB queries
│   │   ├── conversations.ts        # AI conversation DB queries
│   │   ├── memory.ts               # Emotional memory DB queries
│   │   ├── patterns.ts             # Patterns DB queries
│   │   ├── coins.ts                # Ledger DB queries
│   │   ├── notifications.ts        # Notifications DB queries
│   │   └── referrals.ts            # Referrals DB queries
│   │
│   ├── lib/
│   │   ├── supabase.ts             # Supabase service-role client
│   │   ├── openai.ts               # OpenAI client
│   │   ├── anthropic.ts            # Anthropic client
│   │   ├── resend.ts               # Resend email client
│   │   ├── queue.ts                # Cloudflare Queue producer
│   │   ├── kv.ts                   # Cloudflare KV helpers
│   │   └── errors.ts               # APIError class + error codes
│   │
│   ├── types/
│   │   ├── api.ts                  # Request/response types
│   │   ├── db.ts                   # Database row types
│   │   └── env.ts                  # Cloudflare Env bindings
│   │
│   └── utils/
│       ├── response.ts             # Standard response envelope helpers
│       ├── pagination.ts           # Cursor-based pagination utilities
│       ├── date.ts                 # Date/timezone utilities
│       └── referral-code.ts        # Referral code generation
│
├── wrangler.toml                   # Worker config + KV/Queue bindings
├── package.json
└── tsconfig.json

supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_indexes.sql
│   ├── 004_functions.sql           # link_guest_to_user, set_updated_at, etc.
│   └── 005_seed_enums.sql
└── config.toml
```

---

## 9. State Synchronization Strategy

### 9.1 Client-Side State Architecture

The frontend uses `@tanstack/react-query` (already installed in `_layout.tsx`).

Configure with Nervana-appropriate defaults:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes — emotional data doesn't need to be real-time
      gcTime: 1000 * 60 * 30,           // 30 minutes in cache
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});
```

### 9.2 Optimistic Updates

Check-ins and journal entries use optimistic updates for immediate UI feedback:

```ts
// Example: optimistic check-in
const checkinMutation = useMutation({
  mutationFn: createCheckin,
  onMutate: async (newCheckin) => {
    await queryClient.cancelQueries({ queryKey: ['checkins', 'today'] });
    const previous = queryClient.getQueryData(['checkins', 'today']);
    queryClient.setQueryData(['checkins', 'today'], newCheckin);
    return { previous };
  },
  onError: (err, newCheckin, context) => {
    queryClient.setQueryData(['checkins', 'today'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['checkins'] });
    queryClient.invalidateQueries({ queryKey: ['users', 'me'] }); // streak update
  },
});
```

### 9.3 Offline Handling

The app should function offline for reading. Writing while offline queues actions:

1. **Offline detection:** `@react-native-community/netinfo`
2. **Offline queue:** Use `AsyncStorage` as a simple queue. On reconnect, replay queued mutations.
3. **Priority:** Check-ins and journal writes are the most important to queue offline.
4. **Conflict resolution:** Server is authoritative. If a conflict exists (e.g., duplicate check-in date), the server returns `409` and the client resolves by showing the existing server record.

### 9.4 Query Key Conventions

```ts
const queryKeys = {
  user:            ['users', 'me'],
  checkinToday:    ['checkins', 'today'],
  checkins:        (filters?) => ['checkins', 'list', filters],
  weeklyMood:      ['checkins', 'weekly'],
  journalList:     (filters?) => ['journal', 'list', filters],
  journalEntry:    (id: string) => ['journal', id],
  conversations:   ['ai', 'conversations'],
  messages:        (id: string) => ['ai', 'conversations', id, 'messages'],
  insights:        ['insights', 'weekly'],
  patterns:        ['insights', 'patterns'],
  moodHistory:     (period: string) => ['insights', 'mood-history', period],
  coins:           ['coins', 'balance'],
  coinsHistory:    ['coins', 'history'],
  referrals:       ['referrals'],
  notifications:   ['notifications'],
};
```

### 9.5 Caching Strategy

| Data | Cache Duration | Invalidation Trigger |
|---|---|---|
| User profile | 5 min | After `PATCH /users/me` |
| Today's check-in | 2 min | After `POST /checkins` |
| Weekly mood chart | 10 min | After new check-in |
| Journal list | 5 min | After create/update/delete |
| AI messages | Realtime (append-only) | Never stale |
| Patterns | 24 hours | After pattern analysis job |
| Coin balance | 2 min | After any coin event |
| Notifications | 3 min | After read/new arrival |

### 9.6 Retry Logic

```ts
const retryConfig = {
  retry: (failureCount: number, error: Error) => {
    // Don't retry auth errors, validation errors, or 404s
    if ([401, 403, 404, 409, 422, 429].includes(error.status)) return false;
    return failureCount < 2;
  },
};
```

---

## 10. Scalability Notes

### 10.1 What Can Stay Simple (MVP)

These do not need over-engineering at launch:

- **Single Cloudflare Worker** handling all routes (split later if cold start becomes relevant)
- **No message queue for most operations** — direct DB writes are fine at low volume
- **Cloudflare Queues only for notifications and AI memory jobs** — not everything needs async
- **No search** — journal full-text search can be deferred; the GIN index is already there
- **No real-time** — Supabase Realtime subscriptions not needed; React Query polling is sufficient
- **Single AI model** — pick one (Claude 3.5 Sonnet) and add fallback only when needed
- **No caching layer beyond KV** — no Redis/Upstash needed at launch volume
- **No CDN for user assets** — no user images/uploads in MVP

### 10.2 What May Need Scaling Later

| Component | Scale Trigger | Solution |
|---|---|---|
| AI companion | >10k daily active users | Add a job queue so companion requests don't block; use streaming more aggressively |
| Pattern analysis | >50k users | Move from per-user on-demand to batch nightly job using Cloudflare Batch Workers |
| Notification delivery | >100k push tokens | Switch from Expo Push API to direct APNs/FCM with Cloudflare Queue batching |
| Database | >1M rows in `ai_messages` | Partition `ai_messages` by month; archive old conversations to cold storage |
| Journal search | User demand | Enable Supabase full-text search on pre-built GIN index |
| Emotional memory | >5M users | Vector embeddings in `pgvector` for semantic memory retrieval |

### 10.3 Intentionally Deferred

These are explicitly not in scope for MVP and should not be premature:

- **Multi-tenancy / B2B**: Nervana is B2C. No team/org model needed.
- **Native AI fine-tuning**: Prompting is sufficient. Fine-tuning adds operational complexity without clear MVP benefit.
- **Webhooks**: No external integrations require webhooks at launch.
- **Client-side journal encryption**: Desirable long-term for trust; technically complex. Defer to v2.
- **Multiple AI providers with automatic failover**: Implement Anthropic first; add OpenAI fallback when reliability is validated.
- **Emotion detection from text**: Pure NLP mood extraction from journal content (vs. user-reported mood). Promising but defer.
- **Voice journaling**: High engineering cost. Defer to v2.
- **Wearable/HRV integration**: Exciting but far out of MVP scope.

### 10.4 The Intentional Simplicity Principle

Nervana's backend should be as simple as the app's emotional design. Complexity hides in over-built systems the same way anxiety hides in noise.

Build for the user who needs it now. Scale for the users who come later. Don't build for the users who might come in three years.

---

*Document generated from full codebase analysis of `artifacts/mobile` — Expo Router v6 app including all screen routes, context, mock data structures, and onboarding flow.*

*Last updated: May 2026*
