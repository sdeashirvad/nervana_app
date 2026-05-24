# Nervana — Technical Debt & Engineering Checklist

> **Document type:** Master engineering checklist  
> **Status:** Active prototype → Production  
> **Last updated:** May 2026  
> **Legend:** `[ ]` = not started · `[~]` = in progress · `[x]` = complete

All items are actionable. Items marked with `⚡ BLOCKS LAUNCH` must be resolved before any public release. Items marked with `📌 MVP` should be completed before soft launch. Items with no marker are post-launch or parallelizable.

---

## 1. Authentication Setup

### Supabase Auth

- [ ] ⚡ BLOCKS LAUNCH — Create Supabase project for Nervana (`nervana-prod`)
- [ ] ⚡ BLOCKS LAUNCH — Create separate staging project (`nervana-staging`)
- [ ] ⚡ BLOCKS LAUNCH — Enable anonymous sign-in (for guest mode)
- [ ] ⚡ BLOCKS LAUNCH — Enable Google OAuth provider in Supabase Auth dashboard
- [ ] 📌 MVP — Enable Apple Sign-In provider in Supabase Auth dashboard (required for iOS App Store)
- [ ] 📌 MVP — Enable email OTP (magic link) provider — disable email+password
- [ ] ⚡ BLOCKS LAUNCH — Configure JWT expiry: access token 1 hour, refresh token 30 days
- [ ] Configure redirect URLs in Supabase Auth:
  - `nervana://auth-callback` (mobile deep link)
  - `https://nervana.app/auth/callback` (web)
  - `https://nervana-staging.app/auth/callback` (staging)
- [ ] ⚡ BLOCKS LAUNCH — Replace `AsyncStorage` with `expo-secure-store` for all session tokens
- [ ] ⚡ BLOCKS LAUNCH — Implement token refresh proactive logic (refresh if <5 min to expiry)
- [ ] ⚡ BLOCKS LAUNCH — Implement auth session restoration on app cold start
- [ ] ⚡ BLOCKS LAUNCH — Implement guest → authenticated migration (`link_guest_to_user` DB function)
- [ ] Add auth state change listener (`supabase.auth.onAuthStateChange`) in `AppContext`
- [ ] Handle token revocation gracefully (redirect to `/auth` without crash)
- [ ] Validate that guest accounts expire and are soft-deleted after 30 days (cron job)

### Google OAuth

- [ ] Create Google Cloud project for Nervana
- [ ] Enable Google Sign-In API
- [ ] Create OAuth 2.0 credentials (Web + iOS + Android clients)
- [ ] Add iOS bundle ID: `com.nervana.app` to Google Cloud credentials
- [ ] Add Android package name + SHA-1 fingerprint to Google Cloud credentials
- [ ] Configure Google client ID in Supabase Auth provider settings
- [ ] Test OAuth redirect round-trip on physical iOS and Android device
- [ ] Handle edge case: user has both Google and email accounts with same email

### Apple Sign-In

- [ ] 📌 MVP — Enroll in Apple Developer Program ($99/year)
- [ ] 📌 MVP — Create App ID with Sign In with Apple capability
- [ ] 📌 MVP — Create Service ID for web OAuth flow (if web companion added)
- [ ] 📌 MVP — Generate Apple private key and upload to Supabase Auth
- [ ] 📌 MVP — Add `expo-apple-authentication` package
- [ ] 📌 MVP — Wire Apple Sign-In button in `/auth` screen (required by App Store guidelines when Google is offered)
- [ ] Handle Apple name-relay: Apple only sends name on first sign-in; must persist immediately

---

## 2. Database Tasks

### Schema & Migrations

- [ ] ⚡ BLOCKS LAUNCH — Run all migration files from `backend_implementation.md` against staging Supabase
- [ ] ⚡ BLOCKS LAUNCH — Run all migration files against production Supabase
- [ ] ⚡ BLOCKS LAUNCH — Create all enums (`mood_type`, `profession_type`, `companion_style`, etc.)
- [ ] ⚡ BLOCKS LAUNCH — Create all 14 tables with constraints, indexes, and foreign keys
- [ ] ⚡ BLOCKS LAUNCH — Apply `set_updated_at()` trigger to all tables with `updated_at` column
- [ ] ⚡ BLOCKS LAUNCH — Create `link_guest_to_user()` stored procedure
- [ ] Set up `updated_at` trigger for all relevant tables

### Row-Level Security

- [ ] ⚡ BLOCKS LAUNCH — Enable RLS on all user-data tables
- [ ] ⚡ BLOCKS LAUNCH — Write and test RLS policies for `emotional_checkins`
- [ ] ⚡ BLOCKS LAUNCH — Write and test RLS policies for `journal_entries`
- [ ] ⚡ BLOCKS LAUNCH — Write and test RLS policies for `ai_conversations`
- [ ] ⚡ BLOCKS LAUNCH — Write and test RLS policies for `ai_messages`
- [ ] ⚡ BLOCKS LAUNCH — Write and test RLS policies for `notifications`
- [ ] ⚡ BLOCKS LAUNCH — Write and test RLS policies for `calm_coins_ledger`
- [ ] ⚡ BLOCKS LAUNCH — Write and test RLS policies for `push_tokens`
- [ ] Confirm service-role key is used only in Workers (never client-side)
- [ ] Penetration test RLS by attempting cross-user data access with anon key

### Indexes

- [ ] Verify all indexes from schema exist in production: user lookups, date ranges, tag GIN
- [ ] Add partial index on `users(guest_expires_at) WHERE is_guest = TRUE` for cleanup cron
- [ ] Add index on `notifications(user_id, read)` for unread count queries
- [ ] Benchmark slow queries with `EXPLAIN ANALYZE` after seeding test data

### Backup Strategy

- [ ] Enable Supabase point-in-time recovery (PITR) on production project
- [ ] Configure daily automated backups with 30-day retention
- [ ] Document restore procedure — test it once before launch
- [ ] Set up pg_dump cron as secondary backup to R2 or S3

### Seed & Mock Data

- [ ] Create `supabase/seed.sql` with test users, check-ins, and journal entries for staging
- [ ] Document how to reset staging database to clean state
- [ ] Create a dev user fixture that mirrors the current mock user (`ALEX-CALM`)

---

## 3. AI Integration Tasks

### API Setup

- [ ] ⚡ BLOCKS LAUNCH — Create Anthropic API account and generate production API key
- [ ] ⚡ BLOCKS LAUNCH — Create OpenAI API account and generate production API key (for patterns/memory)
- [ ] ⚡ BLOCKS LAUNCH — Store both keys as Cloudflare Worker secrets (never in code)
- [ ] Set billing alerts on both providers: $50 warning, $200 hard cap for MVP phase
- [ ] Implement API key rotation strategy (quarterly or on suspected exposure)

### Model Selection & Versioning

- [ ] ⚡ BLOCKS LAUNCH — Pin companion model: `claude-3-5-sonnet-20241022`
- [ ] ⚡ BLOCKS LAUNCH — Pin pattern/memory model: `gpt-4o-2024-08-06`
- [ ] ⚡ BLOCKS LAUNCH — Pin lightweight tasks model: `gpt-4o-mini-2024-07-18`
- [ ] Document model version in `ANTHROPIC_MODEL` / `OPENAI_MODEL` environment variables
- [ ] Implement model fallback: if Anthropic unavailable → GPT-4o for companion
- [ ] Version control system prompts (store in KV or DB, not hardcoded)
- [ ] Create a prompt versioning table to A/B test prompt variants

### Streaming

- [ ] ⚡ BLOCKS LAUNCH — Implement SSE streaming endpoint in Cloudflare Worker
- [ ] ⚡ BLOCKS LAUNCH — Implement `EventSource` / fetch-stream reader in React Native companion screen
- [ ] Test streaming on Android (known fetch streaming limitations)
- [ ] Add non-streaming fallback (`?stream=false`) for environments where SSE fails
- [ ] Implement partial message recovery on stream interruption

### Moderation & Safety

- [ ] ⚡ BLOCKS LAUNCH — Integrate OpenAI `omni-moderation-latest` pre-check on all user messages
- [ ] ⚡ BLOCKS LAUNCH — Implement crisis response intercept (self-harm / suicide flag → compassionate redirect)
- [ ] Test crisis response with synthetic inputs before launch
- [ ] Log moderation events (user_id, timestamp, category) to `admin_logs` — no message content
- [ ] Define escalation playbook: what happens if a user is in crisis via the app?

### Token & Cost Monitoring

- [ ] Track `tokens_used` per message in `ai_messages` table
- [ ] Build daily token burn dashboard (even a simple Supabase query is fine at launch)
- [ ] Implement per-user daily message limit (30 messages/day free tier)
- [ ] Alert if total daily AI spend exceeds $X threshold

### Emotional Tone Calibration

- [ ] Document and version the Nervana companion persona prompt
- [ ] Conduct internal tone review: test 20 difficult emotional inputs and evaluate responses
- [ ] Create regression test suite for tone (at least 10 sample conversations)
- [ ] Define what "good" looks like for each `companion_style` (reflective, direct, gentle)
- [ ] Schedule quarterly tone review as AI models are updated

### Memory & Pattern Analysis

- [ ] Implement `UPDATE_EMOTIONAL_MEMORY` queue job (runs every 5 messages)
- [ ] Implement `DAILY_PATTERN_ANALYSIS` cron job (midnight UTC)
- [ ] Test memory extraction prompt with realistic user data
- [ ] Confirm journal content is never sent to AI (only title + mood tag)
- [ ] Set `expires_at` on patterns so stale patterns don't persist indefinitely

---

## 4. Email Infrastructure

### Resend Setup

- [ ] 📌 MVP — Create Resend account for Nervana
- [ ] 📌 MVP — Add and verify sending domain (`mail.nervana.app` or `hello@nervana.app`)
- [ ] 📌 MVP — Configure Supabase SMTP to use Resend's SMTP endpoint
- [ ] Store Resend API key as Worker secret

### DNS / Deliverability

- [ ] 📌 MVP — Configure SPF record for sending domain
- [ ] 📌 MVP — Configure DKIM record (Resend provides this)
- [ ] 📌 MVP — Configure DMARC policy (`p=quarantine` at minimum)
- [ ] Test email deliverability with mail-tester.com before launch
- [ ] Monitor bounce rate in Resend dashboard weekly

### Transactional Templates

- [ ] 📌 MVP — Magic link / OTP email template (matches Nervana brand — dark, warm, minimal)
- [ ] 📌 MVP — Welcome email after onboarding completion
- [ ] Referral invite email (sent when user shares referral code via email)
- [ ] Streak re-engagement email (sent after 3-day lapse — gentle, not gamified)
- [ ] Weekly mood summary email (opt-in only)
- [ ] Account deletion confirmation email (with 30-day grace period note)

---

## 5. Push Notifications

### Expo Setup

- [ ] ⚡ BLOCKS LAUNCH — Install and configure `expo-notifications` in the mobile app
- [ ] ⚡ BLOCKS LAUNCH — Implement permission request flow (ask after onboarding complete, not on first launch)
- [ ] ⚡ BLOCKS LAUNCH — Implement `POST /api/v1/notifications/push-token` call after permission granted
- [ ] ⚡ BLOCKS LAUNCH — Implement token cleanup on sign-out (`DELETE /api/v1/notifications/push-token`)
- [ ] Test push receipt polling and `DeviceNotRegistered` token deactivation

### APNs (iOS)

- [ ] 📌 MVP — Generate APNs key in Apple Developer portal
- [ ] 📌 MVP — Upload APNs key to Expo EAS (for managed push)
- [ ] 📌 MVP — Configure bundle ID in EAS project settings
- [ ] Test on physical iOS device (simulators don't support push)

### Firebase (Android)

- [ ] 📌 MVP — Create Firebase project
- [ ] 📌 MVP — Add Android app to Firebase project
- [ ] 📌 MVP — Download `google-services.json` and configure in EAS
- [ ] Test on physical Android device

### Notification UX

- [ ] Implement quiet hours: respect user's local timezone, no pushes between 10 PM – 8 AM
- [ ] Implement notification deep linking (tap notification → open relevant screen)
- [ ] Handle notification tap when app is in background vs. killed state
- [ ] Implement in-app notification badge count (unread count on bell icon)
- [ ] Test notification delivery latency across timezones

---

## 6. Mobile Production Tasks

### App Identity

- [ ] 📌 MVP — Design final Nervana app icon (1024×1024 PNG, no transparency)
- [ ] 📌 MVP — Design splash screen (solid `#06070F` background + wordmark)
- [ ] Generate all icon sizes for iOS and Android via EAS
- [ ] Configure `app.json` with correct `bundleIdentifier` (iOS) and `package` (Android)
- [ ] Set app version and build number strategy (semver for version, auto-increment for build)

### Deep Linking

- [ ] ⚡ BLOCKS LAUNCH — Register `nervana://` scheme in `app.json`
- [ ] ⚡ BLOCKS LAUNCH — Configure Universal Links (iOS) for `https://nervana.app/*`
- [ ] ⚡ BLOCKS LAUNCH — Configure App Links (Android) for `https://nervana.app/*`
- [ ] Create `/.well-known/apple-app-site-association` file on domain
- [ ] Create `/.well-known/assetlinks.json` file on domain
- [ ] Test auth callback deep link on physical device for both OAuth and OTP flows

### Environment Configuration

- [ ] ⚡ BLOCKS LAUNCH — Implement `app.config.ts` (dynamic) instead of `app.json` (static)
- [ ] Separate env configs: `development`, `staging`, `production`
- [ ] Use EAS environment variables for `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Never commit `.env` files containing real keys
- [ ] Document all required environment variables in `README.md`

### App Signing

- [ ] 📌 MVP — Generate iOS distribution certificate via EAS Credentials
- [ ] 📌 MVP — Generate Android keystore via EAS Credentials
- [ ] Store signing credentials in EAS (not locally)
- [ ] Document key recovery procedure

### Store Assets

- [ ] **App Store (iOS):**
  - [ ] App Store screenshots (6.7", 6.1", iPad)
  - [ ] App preview video (optional but recommended)
  - [ ] App description (500 chars)
  - [ ] Keywords (100 chars)
  - [ ] Subtitle (30 chars): "Your mental exhale"
  - [ ] Privacy policy URL
  - [ ] Support URL
  - [ ] App category: Health & Fitness → Mental Health

- [ ] **Play Store (Android):**
  - [ ] Feature graphic (1024×500)
  - [ ] Screenshots (phone + tablet)
  - [ ] Short description (80 chars)
  - [ ] Full description (4000 chars)
  - [ ] Content rating questionnaire
  - [ ] Privacy policy URL

### Legal

- [ ] 📌 MVP — Draft and publish Privacy Policy at `https://nervana.app/privacy`
- [ ] 📌 MVP — Draft and publish Terms of Service at `https://nervana.app/terms`
- [ ] Include data deletion request mechanism in settings (required for App Store)
- [ ] Review HIPAA applicability: Nervana does not store medical records but handles emotional/mental data — consult legal counsel

---

## 7. Security Tasks

### API Security

- [ ] ⚡ BLOCKS LAUNCH — Implement Zod validation on all API inputs
- [ ] ⚡ BLOCKS LAUNCH — Implement rate limiting middleware (Cloudflare KV-backed)
- [ ] ⚡ BLOCKS LAUNCH — JWT verification on every authenticated endpoint
- [ ] ⚡ BLOCKS LAUNCH — Reject requests from unknown origins (CORS allowlist)
- [ ] Implement request ID tracking (`X-Request-ID`) for log correlation
- [ ] Audit all endpoints for IDOR vulnerabilities (user can only access their own data)

### Secrets Management

- [ ] ⚡ BLOCKS LAUNCH — Rotate all API keys before production launch
- [ ] Never commit `.env` files — add to `.gitignore`
- [ ] Use Cloudflare Worker secrets for all sensitive values (not `wrangler.toml` vars)
- [ ] Supabase `service_role` key used only in Workers — never in mobile app
- [ ] Audit all commits for accidentally committed secrets before making repo public

### Journaling Privacy

- [ ] ⚡ BLOCKS LAUNCH — Confirm journal content is never sent to AI APIs
- [ ] ⚡ BLOCKS LAUNCH — Confirm journal content is never logged in `admin_logs`
- [ ] Confirm journal soft-delete clears content field after 30-day grace period
- [ ] Future: consider client-side encryption for zero-knowledge journal storage

### Referral Abuse

- [ ] Enforce `UNIQUE (referred_user_id)` constraint at DB level
- [ ] Block self-referral at API level (user cannot use their own code)
- [ ] Implement Calm Coins fraud detection job (alert if >1000 coins earned in 24h)
- [ ] Log referral redemptions to `admin_logs`

### Audit Logging

- [ ] Log all admin actions to `admin_logs`
- [ ] Log moderation events (no PII, no content)
- [ ] Log guest expiration and cleanup events
- [ ] Retain audit logs for 1 year minimum

---

## 8. Analytics & Monitoring

### Product Analytics

- [ ] Choose analytics provider: Posthog (recommended — privacy-friendly, self-hostable), Mixpanel, or Amplitude
- [ ] Instrument key events:
  - `onboarding_completed` (with profession, stress_level)
  - `checkin_created` (with mood, has_note)
  - `journal_created` (with word_count, mood)
  - `companion_message_sent` (with message_count in conversation)
  - `referral_code_shared`
  - `notification_tapped` (with type)
  - `streak_milestone` (with days)
- [ ] Implement `screen_viewed` event for all screens
- [ ] Respect user privacy: no PII in event properties, anonymized user IDs

### Crash Reporting

- [ ] 📌 MVP — Integrate Sentry for React Native (`@sentry/react-native`)
- [ ] Configure Sentry DSN as environment variable
- [ ] Set up Sentry source maps upload in EAS build pipeline
- [ ] Configure Sentry to scrub PII from error payloads (no journal content, no messages)
- [ ] Set up Sentry alert rules: >5 crashes/hour → Slack notification

### API Monitoring

- [ ] 📌 MVP — Enable Cloudflare Analytics on all Workers routes
- [ ] Set up uptime monitoring (Better Uptime / Checkly): ping `/health` endpoint every 1 minute
- [ ] Alert on p95 latency >1500ms for companion endpoint
- [ ] Alert on error rate >1% for any endpoint
- [ ] Monitor Supabase connection pool utilization

### Logging

- [ ] Implement structured JSON logging in all Workers
- [ ] Include `user_id`, `request_id`, `route`, `duration_ms`, `status` in every log
- [ ] Never log `access_token`, journal content, or AI message content
- [ ] Configure Cloudflare Logpush to R2 or a log aggregator (Logtail / Axiom)

---

## 9. DevOps & Deployment

### Cloudflare Workers

- [ ] ⚡ BLOCKS LAUNCH — Create Cloudflare account and configure Workers subdomain
- [ ] ⚡ BLOCKS LAUNCH — Configure `wrangler.toml` for production and staging environments
- [ ] ⚡ BLOCKS LAUNCH — Set all Worker secrets in Cloudflare dashboard
- [ ] Configure custom domain: `api.nervana.app` → production Worker
- [ ] Configure `api-staging.nervana.app` → staging Worker
- [ ] Create KV namespace `NERVANA_CACHE` in Cloudflare dashboard
- [ ] Create Queue `nervana-jobs` in Cloudflare dashboard
- [ ] Test Worker cold start time and optimize if >50ms

### Supabase Environments

- [ ] ⚡ BLOCKS LAUNCH — Separate staging and production Supabase projects (never share)
- [ ] Document connection strings and project URLs in environment config
- [ ] Configure production project in Singapore or US East region (based on user base)
- [ ] Enable Supabase Vault for sensitive column encryption (future)

### CI/CD

- [ ] Set up GitHub repository (or private GitLab)
- [ ] Configure branch protection on `main`: require PR + passing CI
- [ ] GitHub Actions workflows:
  - [ ] `ci.yml` — run TypeScript typecheck + lint on every PR
  - [ ] `deploy-worker-staging.yml` — deploy Worker to staging on push to `develop`
  - [ ] `deploy-worker-prod.yml` — deploy Worker to production on push to `main` (with manual approval)
  - [ ] `eas-build.yml` — trigger EAS build on tag push (`v*`)
- [ ] Store secrets in GitHub Actions secrets (not in YAML files)

### EAS (Expo Application Services)

- [ ] 📌 MVP — Create EAS project (`eas init`)
- [ ] 📌 MVP — Configure `eas.json` with three profiles: `development`, `preview`, `production`
- [ ] 📌 MVP — Set up EAS Update for OTA updates (critical for fast bug fixes post-launch)
- [ ] Configure `EXPO_PUBLIC_*` environment variables per EAS profile

---

## 10. UX / Design Debt

### Animation

- [ ] Audit all `useSharedValue` animations for jank on low-end Android devices
- [ ] Test `AtmosphericBackground` orb animations on Pixel 5a (mid-range target)
- [ ] Reduce `BlurView` intensity if causing performance issues on Android
- [ ] Replace `AtmosphericBackground` `Image` assets with actual Nervana brand assets (currently placeholder)
- [ ] Add `reduceMotion` support — respect `AccessibilityInfo.isReduceMotionEnabled()`

### Spacing & Layout Consistency

- [ ] Audit all hardcoded pixel values — consolidate into a spacing token system
- [ ] Verify no content is hidden behind the tab bar on any screen (especially on notched devices)
- [ ] Test all screens on smallest supported device: iPhone SE (375pt width)
- [ ] Test all screens on largest device: iPhone 16 Pro Max (430pt width)

### Accessibility

- [ ] Add `accessibilityLabel` and `accessibilityRole` to all interactive elements
- [ ] Ensure all text has minimum 4.5:1 contrast ratio against background
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)
- [ ] Ensure all touch targets are minimum 44×44pt
- [ ] Add `accessibilityHint` to mood chips explaining selection behavior

### Tablet Responsiveness

- [ ] Test all screens on iPad (768pt+ width) — currently designed for phone
- [ ] Add max-width constraint to scrollable content (max 640pt centered) for tablet

### Dark Mode

- [ ] App is currently dark-only — verify this works correctly in iOS Light Mode system setting
- [ ] Consider adding a true light mode variant (low priority — wellness apps typically dark)

### Copy Refinement

- [ ] Final copy review pass with a copywriter — all screen headings, button labels, empty states
- [ ] Review all AI companion responses in `MOCK_RESPONSES` for tone consistency
- [ ] Ensure all notification copy passes Nervana voice guidelines (no urgency, no gamification)
- [ ] Verify all error messages are user-friendly (no raw API error strings exposed)

---

## 11. Future Features (Intentionally Deferred)

These are logged here to prevent scope creep. Do not implement until the core product is stable.

- [ ] **Therapist marketplace** — Connect users with licensed therapists for real sessions. Requires legal review, insurance considerations, HIPAA analysis.
- [ ] **Anonymous social spaces** — Optional community spaces where users share without identity. Privacy architecture is complex; defer.
- [ ] **Voice journaling** — Record audio, transcribe with Whisper, analyze sentiment. High engineering cost.
- [ ] **Voice AI companion** — Spoken conversation with the companion. Requires real-time audio pipeline.
- [ ] **Wearable integrations** — Apple Watch HRV, Oura Ring, WHOOP data correlation with mood.
- [ ] **Advanced AI personalization** — Fine-tuned model on anonymized Nervana conversation patterns.
- [ ] **AI emotional memory engine v2** — Vector embeddings (`pgvector`) for semantic memory retrieval vs. current array-based approach.
- [ ] **Multilingual support** — i18n infrastructure. Currently English-only.
- [ ] **Web companion app** — Browser-accessible version of Nervana for desktop users.
- [ ] **B2B / teams** — Employer wellness benefit offering. Requires org/team data model.
- [ ] **Mood forecasting** — ML-based emotional trend prediction. Needs significant data accumulation first.

---

## 12. Operational Notes

### Supabase Free Tier Limitations

The Supabase free tier pauses projects after 7 days of inactivity. To prevent this in staging:
- Set up a daily ping cron (GitHub Actions or a simple uptime monitor) that makes a lightweight authenticated request
- Or upgrade to Supabase Pro ($25/month) before soft launch — recommended

Free tier limits to be aware of:
- 500 MB database space (sufficient for MVP)
- 2 GB bandwidth/month (watch with AI conversation data)
- 50,000 monthly active users

### Cloudflare Workers Free Tier

- 100,000 requests/day free
- 10ms CPU time per request (watch AI orchestration logic — consider paid plan at launch)
- Workers Paid: $5/month + $0.50/million requests over 10M — recommended

### AI Cost Projections (Rough)

| Scenario | Daily Cost Estimate |
|---|---|
| 100 DAU × 10 companion messages | ~$0.80–$2.00/day |
| 1,000 DAU × 10 messages | ~$8–$20/day |
| 10,000 DAU × 10 messages | ~$80–$200/day |

Set billing hard caps on both Anthropic and OpenAI before launch. Monitor weekly.

### Monitoring Cadence

- Daily: check Sentry for new crashes, Cloudflare for error spikes
- Weekly: review AI token spend, check referral fraud signals, review Supabase slow query log
- Monthly: review pattern analysis quality, tune AI tone if needed, check push delivery rates

---

*This document is the living engineering checklist for Nervana. Update it as items are completed. Review it weekly during active development sprints.*
