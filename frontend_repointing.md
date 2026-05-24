# Nervana — Frontend–Backend Integration Guide

> **Document type:** Frontend repointing and API integration reference  
> **Audience:** Frontend engineers transitioning the app from prototype to production  
> **Current state:** Mocked prototype with hardcoded data  
> **Target state:** Fully API-integrated production React Native app  
> **Last updated:** May 2026

---

## 1. Current Mock Architecture

### Overview

The current Nervana frontend is a fully functioning emotional wellness prototype. Every screen renders correctly, animations work, and the UX flows are complete — but all data is either hardcoded in `data/mock.ts`, stored ephemerally in `AsyncStorage`, or generated locally. There is no real backend integration.

### What is Currently Mocked

#### `artifacts/mobile/data/mock.ts`
This is the single source of truth for all app data in the prototype. It contains:

```ts
mockUser          — hardcoded user profile (name: "Alex", profession: "Engineering Manager")
mockCheckins      — 10 hardcoded emotional check-in entries with moods and notes
mockJournalEntries — 6 hardcoded journal entries with titles, content, tags, moods
mockConversation  — 7 hardcoded AI conversation messages (static, not generated)
calmingQuotes     — 7 hardcoded quotes
mockNotifications — 6 hardcoded notifications
weeklyMoodData    — 7 hardcoded mood data points for the bar chart
mockReferrals     — 3 hardcoded referral entries
mockPatterns      — 4 hardcoded behavioral pattern insights
```

None of this data is fetched from a server. It never changes between app launches.

#### `artifacts/mobile/context/AppContext.tsx`
The `AppContext` is the only "live" state layer. It persists three fields to `AsyncStorage`:
- `nervana_onboarding_complete` — boolean
- `nervana_today_checkin` — the mood string for today's check-in
- `nervana_user` — the user object (always starts from `GUEST_USER` defaults)

The `AppContext` has **no API calls**. All writes are local-only.

#### AI Companion (`companion.tsx`)
The companion chat has no AI integration. User messages are sent to a hardcoded `MOCK_RESPONSES` array:

```ts
const MOCK_RESPONSES = [
  "It sounds like there's a lot of pressure underneath that...",
  "What would it mean if things didn't improve right away?...",
  // ... 8 more static strings
];
```

Responses are selected randomly with `Math.random()`. There is no OpenAI or Anthropic call.

#### Insights & Patterns
`weeklyMoodData` and `mockPatterns` in `data/mock.ts` are always the same 7 data points and 4 patterns regardless of what check-ins the user has actually completed.

#### Referrals
The referral code (`ALEX-CALM`) is hardcoded in the `referral.tsx` screen. The referral list (`mockReferrals`) is static.

#### Notifications
The notifications list is entirely from `mockNotifications`. `read` state changes are not persisted anywhere.

### What Has Real Behavior

| Feature | Current Status |
|---|---|
| Onboarding flow navigation | ✅ Real navigation with progress |
| Today's check-in selection | ✅ Persisted to AsyncStorage |
| Onboarding completion flag | ✅ Persisted to AsyncStorage |
| Auth screen | 🎭 Routes exist, no actual auth |
| Animation system | ✅ Fully functional |
| Font loading | ✅ Fully functional |
| Tab navigation | ✅ Fully functional |

---

## 2. Backend Integration Strategy

### Phased Approach

Do not attempt to repoint all mocked features simultaneously. Follow this phased approach to reduce risk:

**Phase 0 — Infrastructure (prerequisite, no user-facing change)**
- Deploy API Worker to staging
- Configure Supabase staging project
- Set up environment variables in `app.config.ts`
- Set up `expo-secure-store` for token storage
- Create the API client base layer (`services/api.ts`)

**Phase 1 — Auth First**
- Wire Supabase Auth (guest sign-in, Google OAuth, magic link)
- Replace `AsyncStorage` token storage with `expo-secure-store`
- Auth state drives routing (replace the current always-onboarded-as-guest assumption)
- Onboarding data now POSTed to backend on completion

**Phase 2 — Core Data (Check-ins, Journal)**
- Replace `mockCheckins` with API calls
- Replace `mockJournalEntries` with API calls
- Streak and calm coins come from the API response
- Home screen chart data from `/api/v1/checkins/weekly`

**Phase 3 — AI Companion**
- Replace `MOCK_RESPONSES` array with streaming API calls
- Implement message persistence
- Wire conversation restoration on screen return

**Phase 4 — Insights, Patterns, Notifications, Referrals**
- Replace all remaining `mock*` imports with API calls
- Push token registration
- Real referral codes from API

**Phase 5 — Polish & Hardening**
- Remove all `import` references to `data/mock.ts`
- Add loading skeletons
- Add empty states
- Add error boundaries per screen
- Add offline queue

---

## 3. API Repointing Tasks (Screen by Screen)

### 3.1 Auth Screen (`/auth`)

**Current behavior:** Tapping any auth button calls `router.push("/flow")`. There is no authentication.

**Expected backend behavior:**
- "Continue with Google" → Supabase OAuth redirect flow
- "Continue with Email" → OTP email sent via `POST /auth/v1/otp`
- "Continue as Guest" → `POST /auth/v1/guest` → anonymous Supabase session

**Frontend changes required:**

```ts
// services/auth.ts — create this file

import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';

export async function signInWithGoogle(): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'nervana://auth-callback' },
  });
  if (error) throw error;
  // Deep link handles token exchange
}

export async function signInAsGuest(): Promise<void> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  await SecureStore.setItemAsync('nervana_access_token', data.session.access_token);
  await SecureStore.setItemAsync('nervana_refresh_token', data.session.refresh_token);
}

export async function sendOTP(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}
```

**Remove:** `router.push("/flow")` as the direct handler for all buttons.

**Add:** Loading states on each button while auth is processing.

---

### 3.2 Onboarding Flow (`/flow/*`)

**Current behavior:** The 4-step flow (profession → stress → struggles → goals) collects data locally. On the final step, `setOnboardingComplete(true)` writes to `AsyncStorage`. The data is never sent anywhere.

**Expected backend behavior:** On completing the goals step, POST all collected onboarding data to `POST /api/v1/onboarding/profile`.

**Frontend changes required:**

Introduce a local state accumulator across the flow steps. The cleanest approach is a lightweight form context:

```ts
// context/OnboardingContext.tsx
interface OnboardingState {
  profession: string | null;
  stressLevel: number | null;
  struggles: string[];
  goals: string[];
}
```

Pass state forward through each step. On the final `goals.tsx` screen:

```ts
// REMOVE:
await setOnboardingComplete(true);
router.replace("/(main)/home");

// REPLACE WITH:
const mutation = useMutation({
  mutationFn: () => api.post('/api/v1/onboarding/profile', {
    profession: onboarding.profession,
    stress_level: onboarding.stressLevel,
    struggles: onboarding.struggles,
    goals: onboarding.goals,
  }),
  onSuccess: async () => {
    await setOnboardingComplete(true);
    router.replace("/(main)/home");
  },
  onError: () => {
    showToast("Something went wrong. Please try again.");
  },
});
```

**Also apply referral code during onboarding** if the user arrived via a referral link (read from deep link params, pass through onboarding flow to API).

---

### 3.3 Emotional Check-Ins

**Files:** `app/checkin.tsx`, `app/(main)/reflect.tsx`, `app/(main)/home.tsx`

**Current behavior:**
- `checkin.tsx` calls `setTodayCheckin(mood)` → writes to `AsyncStorage`
- `home.tsx` reads `todayCheckin` from `AppContext`
- Yesterday's check-in is from `mockCheckins[0]` (always the same hardcoded entry)
- The weekly bar chart in `home.tsx` uses `weeklyMoodData` from `mock.ts`

**Expected backend behavior:**
- `POST /api/v1/checkins` to create check-in
- `GET /api/v1/checkins/today` to hydrate `todayCheckin` on app launch
- `GET /api/v1/checkins/weekly` for the bar chart
- `GET /api/v1/checkins?limit=1` for "yesterday's check-in" card on home

**Frontend changes required:**

```ts
// hooks/useCheckinToday.ts
export function useCheckinToday() {
  return useQuery({
    queryKey: queryKeys.checkinToday,
    queryFn: () => api.get('/api/v1/checkins/today'),
    staleTime: 1000 * 60 * 2,
  });
}

// hooks/useCreateCheckin.ts
export function useCreateCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCheckinInput) => api.post('/api/v1/checkins', data),
    onMutate: async (newCheckin) => {
      // Optimistic update
      const prev = queryClient.getQueryData(queryKeys.checkinToday);
      queryClient.setQueryData(queryKeys.checkinToday, newCheckin);
      return { prev };
    },
    onError: (err, vars, ctx) => {
      queryClient.setQueryData(queryKeys.checkinToday, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.checkinToday });
      queryClient.invalidateQueries({ queryKey: queryKeys.weeklyMood });
      queryClient.invalidateQueries({ queryKey: queryKeys.user }); // streak
    },
  });
}
```

**Remove from `home.tsx`:** `import { mockCheckins, weeklyMoodData } from "@/data/mock"`

**Remove from `AppContext`:** `todayCheckin` / `setTodayCheckin` (replaced by React Query cache). The `AppContext` should eventually become auth-only.

---

### 3.4 Journal

**File:** `app/(main)/journal.tsx`

**Current behavior:**
- Journal entries rendered from `mockJournalEntries` (imported from `mock.ts`)
- The compose modal collects title + content but on "Save" does nothing (no persist)
- Tags are rendered but not editable in compose

**Expected backend behavior:**
- `GET /api/v1/journal` for the list
- `POST /api/v1/journal` when compose modal is saved
- `DELETE /api/v1/journal/:id` on swipe-to-delete
- `PATCH /api/v1/journal/:id` for edits

**Frontend changes required:**

```ts
// hooks/useJournal.ts
export function useJournalList() {
  return useInfiniteQuery({
    queryKey: queryKeys.journalList(),
    queryFn: ({ pageParam }) =>
      api.get('/api/v1/journal', { params: { cursor: pageParam, limit: 20 } }),
    getNextPageParam: (last) => last.data.next_cursor,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalInput) => api.post('/api/v1/journal', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journalList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user }); // coins
    },
  });
}
```

**Update compose modal:** Wire the "Save" button to `useCreateJournal` mutation. Show loading state on save. Dismiss modal on success.

**Update FlatList:** Change from `data={mockJournalEntries}` to `data={journalQuery.data?.pages.flatMap(p => p.data.items)}`. Add `onEndReached` to trigger `fetchNextPage`.

---

### 3.5 AI Companion

**File:** `app/(main)/companion.tsx`

**Current behavior:**
- `messages` state is initialized from `mockConversation` (static, 7 messages)
- `handleSend` appends user message then selects a random response from `MOCK_RESPONSES` after a `setTimeout`
- No conversation is persisted — refreshing the screen resets everything

**Expected backend behavior:**
- `POST /ai/v1/conversations` to create a conversation session on first open (or restore from storage)
- `GET /ai/v1/conversations/:id/messages` to restore messages on screen mount
- `POST /ai/v1/conversations/:id/messages` (streaming SSE) for each user message

**Frontend changes required:**

This is the most complex repointing task. Key implementation notes:

**Step 1 — Conversation session management:**
```ts
// Store active conversation ID in SecureStore between sessions
const conversationId = await SecureStore.getItemAsync('active_conversation_id');
if (!conversationId) {
  const res = await api.post('/ai/v1/conversations', { context: 'home' });
  await SecureStore.setItemAsync('active_conversation_id', res.data.conversation_id);
}
```

**Step 2 — Streaming response:**
```ts
async function sendMessage(content: string) {
  const userMsg = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
  setMessages(prev => [userMsg, ...prev]);
  setIsTyping(true);

  const response = await fetch(`${API_URL}/ai/v1/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ content }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let assistantText = '';
  let assistantMsgId = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = JSON.parse(line.replace('data: ', ''));
      if (data.type === 'content_start') {
        assistantMsgId = data.message_id;
        setIsTyping(false);
        setMessages(prev => [{ id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date() }, ...prev]);
      }
      if (data.type === 'content_delta') {
        assistantText += data.delta;
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: assistantText } : m));
      }
    }
  }
}
```

**Fallback for Android streaming issues:** If `EventSource` / `ReadableStream` is unreliable on the target Android version, implement a non-streaming path with `?stream=false` and a short poll.

**Remove:** `MOCK_RESPONSES` array, `setTimeout` fake delay, `[...mockConversation].reverse()` initial state.

---

### 3.6 Emotional Insights

**File:** `app/(main)/insights.tsx`

**Current behavior:**
- `weeklyMoodData` from `mock.ts` — same 7 days always
- `mockPatterns` from `mock.ts` — same 4 patterns always
- Streak number is hardcoded as `"12 days"` in the JSX

**Expected backend behavior:**
- `GET /api/v1/insights/weekly` for the bar chart + streak
- `GET /api/v1/insights/patterns` for the pattern cards

**Frontend changes required:**

```ts
// hooks/useInsights.ts
export function useWeeklyInsights() {
  return useQuery({
    queryKey: queryKeys.insights,
    queryFn: () => api.get('/api/v1/insights/weekly'),
    staleTime: 1000 * 60 * 10,
  });
}

export function usePatterns() {
  return useQuery({
    queryKey: queryKeys.patterns,
    queryFn: () => api.get('/api/v1/insights/patterns'),
    staleTime: 1000 * 60 * 60 * 24, // 24h — refreshed by backend job
  });
}
```

**Update insights screen:** Replace hardcoded streak and `weeklyMoodData`/`mockPatterns` with query results.

---

### 3.7 Profile

**File:** `app/(main)/profile.tsx`

**Current behavior:**
- `mockUser` from `mock.ts` for name, profession, coins, streak
- Stats row shows hardcoded `"12"`, `"6"`, `"1,240"` values
- Preference rows show hardcoded `"9:00 AM"`, `"Daily"`, `"Reflective"` values

**Expected backend behavior:**
- `GET /api/v1/users/me` for the user profile and preferences
- `PATCH /api/v1/users/me/preferences` when user changes a preference

**Frontend changes required:**

```ts
// hooks/useCurrentUser.ts
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => api.get('/api/v1/users/me'),
    staleTime: 1000 * 60 * 5,
  });
}
```

**Wire stats row:** `streakDays`, `journalEntriesCount`, `calmCoins` from `user.data`.

**Wire preferences:** Make preference rows tap-navigable to a settings edit screen. PATCH on save.

---

### 3.8 Referrals

**File:** `app/referral.tsx`

**Current behavior:**
- Referral code `"ALEX-CALM"` is hardcoded as a string literal
- `mockReferrals` is static
- Share button does nothing

**Expected backend behavior:**
- `GET /api/v1/referrals/code` for the user's code and stats
- `GET /api/v1/referrals` for the list of referred users
- Share button uses React Native `Share.share()` with the link from the API

**Frontend changes required:**

```ts
const referralQuery = useQuery({
  queryKey: ['referrals', 'code'],
  queryFn: () => api.get('/api/v1/referrals/code'),
});

const handleShare = async () => {
  await Share.share({
    message: `Join me on Nervana — your mental exhale. Use my link: ${referralQuery.data?.data.link}`,
    url: referralQuery.data?.data.link,
  });
};
```

---

### 3.9 Notifications

**File:** `app/notifications.tsx`

**Current behavior:**
- `mockNotifications` from `mock.ts` — static, `read` state does not persist
- Bell icon in `home.tsx` has no badge count

**Expected backend behavior:**
- `GET /api/v1/notifications` for the list
- `PATCH /api/v1/notifications/:id/read` on tap
- Unread count badge on bell icon in home header

**Frontend changes required:**

```ts
// In home.tsx header bell icon:
const notifQuery = useQuery({
  queryKey: queryKeys.notifications,
  queryFn: () => api.get('/api/v1/notifications?unread_only=true'),
});
const unreadCount = notifQuery.data?.data.unread_count ?? 0;

// Show badge if unreadCount > 0
```

Register push token on startup:

```ts
// In _layout.tsx after auth is confirmed:
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

async function registerForPushNotifications() {
  if (!Device.isDevice) return; // Simulators don't support push
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await api.post('/api/v1/notifications/push-token', {
    token,
    platform: Platform.OS,
    device_id: Device.deviceName,
  });
}
```

---

## 4. State Management Migration

### Current State Layers

| Layer | Current Role | Target Role |
|---|---|---|
| `data/mock.ts` | Primary data source | **Delete entirely** after integration complete |
| `AppContext` (AsyncStorage) | Auth, today's check-in, user object | Auth state only (`currentUser`, `isReady`) |
| React Query | Not used (installed but no queries) | **Primary data layer** for all server state |
| `useState` in components | UI state | Remains for local UI state only (modals, inputs) |

### Migration Pattern

For every mocked data source, follow this pattern:

1. Create a typed hook in `hooks/` that wraps a React Query `useQuery` or `useMutation`
2. Update the component to use the hook instead of the mock import
3. Add loading state (skeleton or spinner)
4. Add error state (retry button or fallback copy)
5. Remove the mock import

### API Client Base

Create a single API client before any repointing begins:

```ts
// lib/api.ts
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

async function getAccessToken(): Promise<string> {
  // First try SecureStore
  const stored = await SecureStore.getItemAsync('nervana_access_token');
  if (stored) {
    // Decode JWT and check expiry
    const payload = JSON.parse(atob(stored.split('.')[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    if (expiresIn > 5 * 60 * 1000) return stored; // >5 min remaining, use it
  }
  // Refresh
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  const token = data.session.access_token;
  await SecureStore.setItemAsync('nervana_access_token', token);
  return token;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Clear session and redirect to /auth
    await SecureStore.deleteItemAsync('nervana_access_token');
    throw new APIError(401, 'SESSION_EXPIRED');
  }

  if (!res.ok) {
    const err = await res.json();
    throw new APIError(res.status, err.error?.code, err.error?.message);
  }

  return res.json();
}

export const api = {
  get:    <T>(path: string, opts?: { params?: Record<string, string> }) =>
            request<T>('GET', path + (opts?.params ? '?' + new URLSearchParams(opts.params) : '')),
  post:   <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

class APIError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}
```

---

## 5. Authentication Wiring

### Replacing Guest-Only Assumptions

The current app always operates as if the user is a guest (`GUEST_USER` in `AppContext`). The routing assumption is: if `onboardingComplete = true`, show the main app; otherwise, show onboarding.

After auth integration, routing logic becomes:

```
App opens
  → Check expo-secure-store for session tokens
  → If valid token → restore session → check onboarding status
      → If onboarding complete → /(main)/home
      → If not → /flow (onboarding)
  → If no valid token → /splash → /onboarding → /auth
```

### AppContext Auth Migration

Reduce `AppContext` to auth concerns only. Extract all check-in and user-data state to React Query:

```ts
// context/AppContext.tsx — simplified after migration
interface AppContextType {
  currentUser: NervanaUser | null;     // From API, not AsyncStorage
  isAuthenticated: boolean;
  isGuest: boolean;
  isReady: boolean;
  signOut: () => Promise<void>;
}
```

### Auth Guards

Create a higher-order route guard:

```ts
// components/AuthGuard.tsx
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isReady, isAuthenticated]);

  if (!isReady) return <SplashScreen />; // or loading indicator
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
```

Wrap `(main)/_layout.tsx` with `<AuthGuard>`.

### Token Refresh Handling

Subscribe to Supabase auth state changes in the root layout:

```ts
// In _layout.tsx useEffect:
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        await SecureStore.setItemAsync('nervana_access_token', session.access_token);
      }
      if (event === 'SIGNED_OUT') {
        await SecureStore.deleteItemAsync('nervana_access_token');
        router.replace('/auth');
      }
    }
  );
  return () => subscription.unsubscribe();
}, []);
```

---

## 6. AI Chat Integration

### Streaming on React Native

React Native's `fetch` supports `ReadableStream` from RN 0.73+. Expo SDK 51+ (which this project uses) is based on RN 0.74+, so streaming should work. Test on physical devices — simulators may behave differently.

Key implementation considerations:
- Render the assistant message container immediately on `content_start`
- Append text deltas in-place using `setMessages` with message ID matching
- Use a `useRef` for the current in-progress text to avoid stale closure issues in the render loop
- If streaming is unreliable on a target device, fall back to `?stream=false` polling endpoint

### Message Persistence & Restoration

```ts
// On companion screen mount:
useEffect(() => {
  async function restore() {
    const convId = await SecureStore.getItemAsync('active_conversation_id');
    if (convId) {
      setConversationId(convId);
      const messages = await api.get(`/ai/v1/conversations/${convId}/messages`);
      setMessages(messages.data.messages.reverse()); // FlatList inverted
    } else {
      const conv = await api.post('/ai/v1/conversations', { context: 'home' });
      const id = conv.data.conversation_id;
      await SecureStore.setItemAsync('active_conversation_id', id);
      setConversationId(id);
    }
  }
  restore();
}, []);
```

### Typing Indicator

Keep the existing `TypingDot` animation component — it's already well-built. The trigger changes from `setTimeout` to streaming state:

```ts
setIsTyping(true);       // When user sends message
// → When stream 'content_start' arrives:
setIsTyping(false);      // Replace with growing text
```

---

## 7. Error Handling Requirements

### Loading Skeletons

Every list and card that fetches from the API needs a skeleton loading state. Add a shared `SkeletonCard` component:

```ts
// components/SkeletonCard.tsx
// Animated shimmer card of specified height
// Used in: home, journal, insights, companion
```

### Empty States

Every list needs an empty state (API returns 0 results, not mock data):

| Screen | Empty State Copy |
|---|---|
| Journal | "You haven't written anything yet. Your first entry is the hardest." |
| Check-ins | "No check-ins yet. Today is a good day to start." |
| Insights | "Check in for a few days and your patterns will start to emerge." |
| Notifications | "You're all caught up. We'll reach out gently." |
| Companion | Auto-opens with a greeting from the companion |

### Graceful Degradation

| Error | Behavior |
|---|---|
| `401 SESSION_EXPIRED` | Clear session, redirect to `/auth` |
| `429 RATE_LIMITED` | Show message: "You've been reflecting a lot today. Take a breath — we'll be here." |
| `500 SERVER_ERROR` | Show retry button, report to Sentry |
| Network offline | Show stale cached data with a soft "last updated X minutes ago" label |
| AI companion error | Show: "I'm having trouble right now. Take a moment and come back." |

### React Query Error Handling

```ts
// In QueryClientProvider config:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => {
        if (error instanceof APIError && [401, 403, 404, 409, 429].includes(error.status)) {
          return false; // Don't retry these
        }
        return count < 2;
      },
    },
  },
});
```

---

## 8. Environment Configuration

### Replace `app.json` with `app.config.ts`

```ts
// app.config.ts
import { ExpoConfig } from 'expo/config';

const IS_PROD = process.env.APP_ENV === 'production';
const IS_STAGING = process.env.APP_ENV === 'staging';

export default (): ExpoConfig => ({
  name: IS_PROD ? 'Nervana' : IS_STAGING ? 'Nervana Staging' : 'Nervana Dev',
  slug: 'nervana',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'nervana',
  extra: {
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
  plugins: [
    'expo-router',
    ['expo-secure-store'],
    ['expo-notifications', { icon: './assets/images/notification-icon.png' }],
  ],
});
```

### Required Environment Variables

Create `.env.development`, `.env.staging`, `.env.production`:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# API
EXPO_PUBLIC_API_URL=https://api-staging.nervana.app  # or api.nervana.app
EXPO_PUBLIC_AI_URL=https://api-staging.nervana.app

# App environment
APP_ENV=development  # development | staging | production

# EAS (build-time only)
EAS_PROJECT_ID=your-eas-project-id
```

### Supabase Client

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Required for React Native
    },
  }
);
```

---

## 9. Production Readiness Checklist

### Before Launch

- [ ] `data/mock.ts` is no longer imported by any screen (delete the file)
- [ ] `MOCK_RESPONSES` array removed from `companion.tsx`
- [ ] `GUEST_USER` in `AppContext` replaced by real auth flow
- [ ] All `console.log` statements removed or replaced with structured logging
- [ ] All API errors surface user-friendly messages (no raw error strings)
- [ ] Loading states exist for every async operation
- [ ] Empty states exist for every list
- [ ] `expo-secure-store` used for all tokens (no `AsyncStorage` for auth material)
- [ ] All environment variables loaded from `app.config.ts`, none hardcoded
- [ ] All screens tested with simulated network failure
- [ ] All screens tested with expired auth token (401 handling)
- [ ] All screens tested on iOS 16 and Android 13 (minimum supported)
- [ ] Sentry integration capturing crashes
- [ ] Analytics events firing for all key user actions
- [ ] Push notifications tested on physical device (both iOS and Android)
- [ ] Deep link tested for auth callback
- [ ] App does not crash when AI companion API is unavailable
- [ ] Referral code share uses native share sheet

---

## 10. Suggested Frontend Folder Refactor

Current structure concentrates too much in `app/`. As API integration grows, split concerns:

```
artifacts/mobile/
├── app/                          # Routes ONLY (Expo Router convention)
│   ├── (main)/
│   ├── flow/
│   └── ...
│
├── components/                   # Presentational UI components
│   ├── AtmosphericBackground.tsx
│   ├── PremiumCard.tsx
│   ├── CalmButton.tsx
│   ├── SkeletonCard.tsx          ← ADD: loading skeleton
│   ├── EmptyState.tsx            ← ADD: empty state component
│   └── ErrorRetry.tsx            ← ADD: error + retry button
│
├── context/
│   └── AppContext.tsx             # Auth state only after migration
│
├── hooks/                        ← CREATE THIS DIRECTORY
│   ├── useCurrentUser.ts          # GET /api/v1/users/me
│   ├── useCheckinToday.ts         # GET /api/v1/checkins/today
│   ├── useCreateCheckin.ts        # POST /api/v1/checkins
│   ├── useWeeklyMood.ts           # GET /api/v1/checkins/weekly
│   ├── useJournal.ts              # GET /api/v1/journal (infinite)
│   ├── useCreateJournal.ts        # POST /api/v1/journal
│   ├── useConversation.ts         # AI conversation management
│   ├── useInsights.ts             # GET /api/v1/insights/weekly
│   ├── usePatterns.ts             # GET /api/v1/insights/patterns
│   ├── useNotifications.ts        # GET /api/v1/notifications
│   ├── useReferrals.ts            # GET /api/v1/referrals/*
│   └── useCoins.ts                # GET /api/v1/coins/balance
│
├── lib/                          ← CREATE THIS DIRECTORY
│   ├── api.ts                     # Base API client (fetch wrapper, auth, error handling)
│   ├── supabase.ts                # Supabase client with SecureStore adapter
│   └── queryKeys.ts               # Centralized React Query key definitions
│
├── types/                        ← CREATE THIS DIRECTORY
│   ├── api.ts                     # API response types (DTOs)
│   ├── user.ts                    # User, NervanaUser interfaces
│   ├── checkin.ts                 # CheckIn, CreateCheckinInput
│   ├── journal.ts                 # JournalEntry, CreateJournalInput
│   ├── companion.ts               # Message, Conversation
│   └── notifications.ts           # Notification, PushToken
│
├── constants/
│   └── colors.ts                  # Design tokens (already exists)
│
└── data/
    └── mock.ts                    # DELETE after integration complete
```

### Typed DTOs

Every API response should have a matching TypeScript interface in `types/`. This enables full type safety from API call to render. Example:

```ts
// types/checkin.ts
export interface CheckIn {
  id: string;
  date: string;           // YYYY-MM-DD
  mood: string;
  note: string | null;
  calm_score: number | null;
  created_at: string;
}

export interface CreateCheckinInput {
  mood: string;
  note?: string;
  calm_score?: number;
}

export interface CheckInResponse {
  data: CheckIn & {
    calm_coins_awarded: number;
    streak_updated_to: number;
  };
}
```

---

*This document should be read alongside `backend_implementation.md` (API spec and database schema) and `tech_debt.md` (overall engineering checklist). Together they form the complete engineering handoff for Nervana's backend integration.*
