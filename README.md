# Nervana

> **Your mental exhale.** A premium emotional wellness app for knowledge workers.

Nervana is a React Native prototype for an emotionally intelligent wellness companion. It helps people in high-pressure professions decompress, reflect, and process the weight of modern work through daily check-ins, private journaling, AI conversation, and emotional pattern insight.

This repository contains a **polished frontend prototype** with a full UI, animation system, and UX flow — built on Expo with hardcoded/mocked data. The backend integration layer is specified in `backend_implementation.md` and `frontend_repointing.md`.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Prerequisites](#4-prerequisites)
5. [Frontend Local Setup](#5-frontend-local-setup)
6. [Backend Local Setup](#6-backend-local-setup)
7. [Environment Variables](#7-environment-variables)
8. [How to Preview the App](#8-how-to-preview-the-app)
9. [Android Build Instructions](#9-android-build-instructions)
10. [iOS Build Instructions](#10-ios-build-instructions)
11. [Useful Commands](#11-useful-commands)
12. [Troubleshooting](#12-troubleshooting)
13. [Current Limitations](#13-current-limitations)
14. [Recommended Next Steps](#14-recommended-next-steps)

---

## 1. Project Overview

### What Nervana Is

Nervana is a mobile-first emotional wellness app aimed at knowledge workers — engineers, managers, designers, founders — who experience chronic stress, burnout, and emotional overload but are often underserved by generic wellness apps.

Core features:
- **Emotional check-ins** — Daily mood tracking with calm score and private note
- **AI Companion** — A non-clinical, emotionally intelligent conversation partner
- **Private Journal** — Unfiltered, beautifully composed personal reflection space
- **Emotional Insights** — Patterns derived from check-in and journal history
- **Calm Coins** — Soft reward system for consistent self-care behaviors
- **Referrals** — Bring someone you care about into the app

### Current Status

This is a **frontend prototype**. The entire app is functional at the UI and navigation level but uses hardcoded mock data. No real authentication, no database writes, and no actual AI calls occur.

See `tech_debt.md` for the full engineering checklist and `frontend_repointing.md` for the API integration guide.

### Repository Structure

This is a **pnpm monorepo** with three artifacts:

| Artifact | Path | Description |
|---|---|---|
| `mobile` | `artifacts/mobile/` | Expo React Native app |
| `api-server` | `artifacts/api-server/` | Express API stub (prototype only) |
| `mockup-sandbox` | `artifacts/mockup-sandbox/` | Vite component preview server |

The production backend will be Cloudflare Workers + Supabase, not the current Express stub.

---

## 2. Tech Stack

### Frontend (Mobile App)

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.74+ (via Expo) | Cross-platform mobile framework |
| Expo | SDK 51 | Managed React Native workflow |
| Expo Router | v6 | File-system-based navigation |
| TypeScript | 5.x | Type safety |
| React Native Reanimated | 4.x | High-performance animations |
| Expo Blur | latest | Glassmorphism blur effects |
| Expo Linear Gradient | latest | Atmospheric background gradients |
| Expo Image | latest | Optimized image rendering |
| @expo/vector-icons (Feather) | latest | Icon system |
| @tanstack/react-query | v5 | Server state management (wired, not yet used) |
| DM Serif Display | — | Display / emotional serif font |
| DM Sans | — | Body / UI sans-serif font |
| react-native-safe-area-context | latest | Safe area handling |
| expo-haptics | latest | Tactile feedback |
| AsyncStorage | latest | Local key-value storage |
| expo-secure-store | latest | Encrypted token storage |

### Target Backend (Specified, Not Yet Built)

| Technology | Purpose |
|---|---|
| Cloudflare Workers | Edge API runtime |
| Supabase | PostgreSQL database + Auth |
| Supabase Auth | Google OAuth, Magic Link, Anonymous |
| Resend | Transactional email |
| Anthropic Claude 3.5 Sonnet | AI companion responses |
| OpenAI GPT-4o | Pattern analysis and memory |
| Cloudflare KV | Cache and rate limiting |
| Cloudflare Queues | Background jobs |
| Expo Push Notifications | APNs / FCM delivery |

---

## 3. Folder Structure

```
nervana/
├── artifacts/
│   ├── mobile/                     # Main Expo app — start here
│   │   ├── app/                    # Expo Router screens (file = route)
│   │   │   ├── _layout.tsx         # Root layout (fonts, providers)
│   │   │   ├── index.tsx           # Entry redirect (splash/home)
│   │   │   ├── splash.tsx          # Animated splash screen
│   │   │   ├── onboarding.tsx      # Marketing onboarding slides
│   │   │   ├── auth.tsx            # Google / Email / Guest auth
│   │   │   ├── checkin.tsx         # Daily mood check-in modal
│   │   │   ├── notifications.tsx   # Notification list
│   │   │   ├── referral.tsx        # Referral program
│   │   │   ├── flow/               # User setup flow (4 steps)
│   │   │   │   ├── index.tsx       # Step 1: Profession
│   │   │   │   ├── stress.tsx      # Step 2: Stress level
│   │   │   │   ├── struggles.tsx   # Step 3: Current struggles
│   │   │   │   └── goals.tsx       # Step 4: Goals → enter app
│   │   │   └── (main)/             # Tab bar screens
│   │   │       ├── _layout.tsx     # Glass tab bar
│   │   │       ├── home.tsx        # Dashboard + chart + quote
│   │   │       ├── reflect.tsx     # Daily reflection + prompts
│   │   │       ├── companion.tsx   # AI conversation
│   │   │       ├── journal.tsx     # Journal list + compose
│   │   │       ├── insights.tsx    # Charts + patterns + streak
│   │   │       └── profile.tsx     # User profile + settings
│   │   ├── components/             # Shared UI components
│   │   │   ├── AtmosphericBackground.tsx  # Animated orb background
│   │   │   ├── PremiumCard.tsx            # Glassmorphism card
│   │   │   ├── CalmButton.tsx             # Primary/secondary/ghost buttons
│   │   │   ├── MoodChip.tsx               # Animated mood selector chip
│   │   │   ├── GlowText.tsx               # Serif heading with glow
│   │   │   ├── ErrorBoundary.tsx          # React error boundary
│   │   │   └── ErrorFallback.tsx          # Error fallback UI
│   │   ├── constants/
│   │   │   └── colors.ts           # Design tokens (palette, glass values)
│   │   ├── context/
│   │   │   └── AppContext.tsx      # Auth + today's check-in state
│   │   ├── data/
│   │   │   └── mock.ts             # All hardcoded prototype data (to be deleted)
│   │   ├── hooks/
│   │   │   └── useColors.ts        # Design token hook
│   │   └── assets/
│   │       └── images/             # Fonts, orb images, splash assets
│   │
│   ├── api-server/                 # Express stub (prototype only)
│   └── mockup-sandbox/             # Vite component preview (design only)
│
├── backend_implementation.md       # Complete backend spec
├── frontend_repointing.md          # API integration guide
├── tech_debt.md                    # Engineering checklist
└── README.md                       # This file
```

---

## 4. Prerequisites

Ensure the following are installed before running the project:

### Required

| Tool | Minimum Version | Install |
|---|---|---|
| Node.js | 20.x LTS | [nodejs.org](https://nodejs.org) or via `nvm` |
| pnpm | 9.x | `npm install -g pnpm` |
| Expo CLI | latest | `npm install -g expo-cli` (or use `npx expo`) |
| Git | 2.x+ | Pre-installed on macOS, `apt install git` on Linux |

### For iOS Development (macOS only)

| Tool | Notes |
|---|---|
| Xcode | 15+ from the Mac App Store |
| Xcode Command Line Tools | `xcode-select --install` |
| CocoaPods | `sudo gem install cocoapods` |
| iOS Simulator | Included with Xcode |

### For Android Development

| Tool | Notes |
|---|---|
| Android Studio | [developer.android.com/studio](https://developer.android.com/studio) |
| Android SDK | API Level 33+ (Android 13) — install via Android Studio |
| Java 17 | `brew install openjdk@17` on macOS |
| ANDROID_HOME | Set in your shell profile (see below) |

Add to your `.zshrc` or `.bashrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Optional (Recommended)

| Tool | Purpose |
|---|---|
| `nvm` | Node version management — `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh \| bash` |
| Expo Go (iOS/Android) | Preview app on physical device without a build |
| Watchman | Speeds up Metro bundler on macOS — `brew install watchman` |

---

## 5. Frontend Local Setup

### Step 1: Install dependencies

From the project root:

```bash
pnpm install
```

This installs dependencies for all workspace packages simultaneously.

### Step 2: Navigate to the mobile app

```bash
cd artifacts/mobile
```

All subsequent commands in this section run from `artifacts/mobile/` unless noted.

### Step 3: Start the Expo development server

```bash
npx expo start
```

Or from the project root:

```bash
pnpm --filter @workspace/mobile run dev
```

This starts the Metro bundler and shows a QR code in the terminal.

### Step 4: Open in browser (fastest for UI review)

After running `npx expo start`, press `w` to open in the web browser.

Or start directly in web mode:

```bash
npx expo start --web
```

The app opens at `http://localhost:8081` (or the port shown in terminal).

> **Note:** Some React Native-specific APIs (haptics, secure storage, push notifications) do not work in the browser. Core UI and navigation work fully.

### Step 5: Run in Android emulator

First ensure an Android Virtual Device (AVD) is running in Android Studio, then press `a` in the Expo terminal, or:

```bash
npx expo start --android
```

### Step 6: Run in iOS simulator (macOS only)

Press `i` in the Expo terminal, or:

```bash
npx expo start --ios
```

This opens the app in the selected iOS simulator.

---

## 6. Backend Local Setup

> The production backend is Cloudflare Workers + Supabase. The current repository contains an Express stub in `artifacts/api-server/` for prototype development.

### Express Stub (Prototype Only)

```bash
pnpm --filter @workspace/api-server run dev
```

This runs on `http://localhost:3000`. It does not implement any real API — it exists as a scaffold.

### Cloudflare Workers (Production Backend — Future)

Install Wrangler:

```bash
npm install -g wrangler
```

Authenticate with Cloudflare:

```bash
wrangler login
```

Run Worker locally (from `workers/` directory once created):

```bash
wrangler dev
```

This starts a local Worker at `http://localhost:8787`. Configure `EXPO_PUBLIC_API_URL=http://localhost:8787` in `.env.development`.

### Supabase Local Development (Optional)

Install Supabase CLI:

```bash
brew install supabase/tap/supabase
```

Start local Supabase stack (requires Docker):

```bash
supabase start
```

This starts a local Postgres, Auth, and Studio at `http://localhost:54323`.

---

## 7. Environment Variables

### Mobile App Variables

Create `artifacts/mobile/.env.development`:

```bash
# Supabase — get from Supabase project Settings > API
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API base URL
EXPO_PUBLIC_API_URL=http://localhost:8787        # Local Worker
# EXPO_PUBLIC_API_URL=https://api-staging.nervana.app  # Staging

# App environment
APP_ENV=development
```

> **Security:** Never commit `.env.*` files. They are already in `.gitignore`. Never use the Supabase `service_role` key in the mobile app — only the `anon` key.

### Cloudflare Worker Secrets

Set these via `wrangler secret put` (not in `wrangler.toml`):

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put RESEND_API_KEY
```

### Variable Reference

| Variable | Where Set | Description |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Mobile `.env` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Mobile `.env` | Supabase public anon key (safe to expose) |
| `EXPO_PUBLIC_API_URL` | Mobile `.env` | Backend Worker base URL |
| `APP_ENV` | Mobile `.env` | `development` / `staging` / `production` |
| `SUPABASE_URL` | Worker secret | Same Supabase URL (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker secret | Supabase service role key (never expose) |
| `ANTHROPIC_API_KEY` | Worker secret | Anthropic Claude API key |
| `OPENAI_API_KEY` | Worker secret | OpenAI API key (pattern analysis, moderation) |
| `RESEND_API_KEY` | Worker secret | Resend email API key |
| `SUPABASE_JWT_SECRET` | Worker secret | Used to verify Supabase JWTs without DB hit |

---

## 8. How to Preview the App

### Option A: Browser (no device required)

```bash
cd artifacts/mobile
npx expo start --web
```

Open `http://localhost:8081` in any modern browser. This is the fastest way to review UI changes.

### Option B: Expo Go on Physical Device

1. Install **Expo Go** from the App Store or Play Store on your phone
2. Run `npx expo start` in the terminal
3. Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android)

The app hot-reloads on file save.

> **Note:** Expo Go has some limitations with custom native modules. For full native feature testing (push notifications, secure storage), use a development build.

### Option C: iOS Simulator

```bash
npx expo start --ios
```

Requires Xcode installed on macOS. Press `i` in the Expo terminal to select a simulator.

### Option D: Android Emulator

1. Open Android Studio → **Device Manager** → Start an AVD
2. Run `npx expo start --android` or press `a` in the Expo terminal

### Option E: Development Build (Full Native)

For testing native features (push notifications, biometrics, etc.):

```bash
npx expo run:ios      # Build and run on iOS simulator
npx expo run:android  # Build and run on Android emulator
```

These compile the native app locally — requires Xcode / Android Studio fully configured.

---

## 9. Android Build Instructions

### Development APK (for testing)

Install EAS CLI:

```bash
npm install -g eas-cli
eas login
```

Build a development APK:

```bash
eas build --profile development --platform android
```

Download the `.apk` from the EAS dashboard and install on a device with:

```bash
adb install nervana-dev.apk
```

### Preview Build (internal testing / QA)

```bash
eas build --profile preview --platform android
```

Share the QR code from the EAS build page with testers. They install it directly on their Android device.

### Production Build (Play Store)

```bash
eas build --profile production --platform android
```

This generates a signed `.aab` (Android App Bundle) for Play Store submission.

Submit directly to Play Store:

```bash
eas submit --platform android
```

### Configure `eas.json`

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "APP_ENV": "staging" }
    },
    "production": {
      "env": { "APP_ENV": "production" }
    }
  }
}
```

### Local Android Build (without EAS)

```bash
npx expo run:android --variant release
```

Requires the Android SDK and a local keystore. EAS is preferred for production builds.

---

## 10. iOS Build Instructions

> iOS builds require a macOS machine and an Apple Developer account.

### Simulator Build

```bash
npx expo run:ios
```

No Apple Developer account required for simulator.

### Development Device Build

Register your device UDID with Apple, then:

```bash
eas build --profile development --platform ios
```

### TestFlight Build (internal + external testing)

```bash
eas build --profile production --platform ios
eas submit --platform ios
```

This uploads the build to App Store Connect. From there:
1. Go to **TestFlight** in App Store Connect
2. Add internal testers (up to 100 Apple IDs, available immediately)
3. Add external testers (up to 10,000, requires Apple review ~24–48 hours)

### App Store Submission

After TestFlight validation:
1. In App Store Connect, create a new version
2. Select the TestFlight build for the version
3. Fill in What's New, screenshots, etc.
4. Submit for review

### Apple Requirements

- Apple Developer Program membership: $99/year
- Bundle ID registered in Apple Developer portal: `com.nervana.app`
- App must include Apple Sign-In if other social sign-ins (Google) are offered
- Privacy Policy URL must be publicly accessible before App Store review

### EAS Credentials (Recommended)

Let EAS manage signing credentials:

```bash
eas credentials
```

EAS handles certificate generation, provisioning profiles, and renewal automatically.

---

## 11. Useful Commands

### Development

```bash
# Start Expo development server
npx expo start

# Start for specific platform
npx expo start --web
npx expo start --ios
npx expo start --android

# Start with clean cache
npx expo start --clear

# Install a new package (use expo install for native packages)
npx expo install expo-camera
pnpm add some-js-package       # For JS-only packages

# Run all workspace packages
pnpm --filter @workspace/mobile run dev
pnpm --filter @workspace/api-server run dev
```

### TypeScript & Linting

```bash
# From artifacts/mobile/
npx tsc --noEmit             # Type check without emitting
npx eslint . --ext .ts,.tsx  # Lint TypeScript files

# From project root
pnpm --filter @workspace/mobile run lint
pnpm --filter @workspace/mobile run typecheck
```

### Cache Clearing

```bash
# Clear Expo cache
npx expo start --clear

# Clear Metro bundler cache
npx react-native start --reset-cache

# Clear all node_modules and reinstall
pnpm clean                   # If configured in root package.json
# Or manually:
rm -rf node_modules artifacts/mobile/node_modules
pnpm install

# iOS: clear CocoaPods cache
cd artifacts/mobile/ios && pod cache clean --all && pod install

# Android: clean Gradle build
cd artifacts/mobile/android && ./gradlew clean
```

### EAS (Building & Submitting)

```bash
# Build for Android
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview

# Build for both
eas build --platform all --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios

# OTA update (no store review required for JS changes)
eas update --branch production --message "Fix companion screen crash"
```

### Wrangler (Cloudflare Workers)

```bash
# Login to Cloudflare
wrangler login

# Start local development server
wrangler dev

# Deploy to staging
wrangler deploy --env staging

# Deploy to production
wrangler deploy --env production

# Set a secret
wrangler secret put ANTHROPIC_API_KEY

# View Worker logs in real-time
wrangler tail
```

---

## 12. Troubleshooting

### Metro bundler won't start / hangs

```bash
# Kill any existing Metro processes
pkill -f "metro"
# Or find the process using port 8081:
lsof -i :8081
kill -9 <PID>

# Restart with clean cache
npx expo start --clear
```

### "Unable to resolve module" error

```bash
# This usually means a package isn't installed or cache is stale
pnpm install
npx expo start --clear
```

### iOS simulator shows blank white screen

1. Stop Expo (`Ctrl+C`)
2. In Xcode → Simulator menu → **Device** → **Erase All Content and Settings**
3. Restart: `npx expo start --ios --clear`

If persisting, check `server.allowedHosts` in any Vite config — the preview is proxied and may reject iframe origins.

### Android emulator not connecting to Metro

Ensure the emulator can reach your machine:

```bash
adb reverse tcp:8081 tcp:8081
```

Or check that `REACT_NATIVE_PACKAGER_HOSTNAME` is set to your machine's IP:

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.100 npx expo start
```

### "Invariant Violation: requireNativeComponent: 'RCTView'" errors

This indicates a native module version mismatch. Run:

```bash
npx expo install --fix
pnpm install
```

### Font not loading / default font shown

If DM Serif Display or DM Sans don't load, check that `useFonts` hooks in `_layout.tsx` resolve without error. Network connectivity issues can delay font loading from Google Fonts CDN.

### Reanimated animation not running on Android

Ensure the Reanimated Babel plugin is in `babel.config.js`:

```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'],
};
```

This plugin must be **last** in the plugins array.

### `expo-blur` shows no blur on Android

`BlurView` on Android uses a software rendering approximation — it will appear less sharp than iOS. This is expected. The app's glassmorphism remains visually correct on Android; the blur intensity may appear slightly different.

### TypeScript errors after pnpm install

```bash
# Regenerate TypeScript project references
npx tsc --build

# Or just run typecheck to see specific errors
npx tsc --noEmit
```

### Environment variables not loading in Expo

- Variables must be prefixed with `EXPO_PUBLIC_` to be accessible in app code
- After changing `.env` files, stop and restart `npx expo start`
- Verify with: `console.log(process.env.EXPO_PUBLIC_API_URL)` in any component

---

## 13. Current Limitations

This is a prototype. The following do not work as of this version:

| Feature | Limitation |
|---|---|
| **Authentication** | All auth buttons navigate past auth without verifying identity. There is no real sign-in. |
| **Data persistence** | Check-in mood and onboarding completion are saved locally to `AsyncStorage`. All other data (journal, insights, companion history) resets on app restart. |
| **AI Companion** | Responses are randomly selected from a hardcoded `MOCK_RESPONSES` array. No OpenAI or Anthropic API is called. |
| **Emotional insights** | Chart data and behavioral patterns are always the same 7 hardcoded data points. |
| **Referrals** | Referral code is hardcoded as `"ALEX-CALM"`. Share button has no action. |
| **Push notifications** | Notifications are hardcoded in `mockNotifications`. No push registration occurs. |
| **Calm Coins** | Balance is hardcoded as `1,240`. No real ledger or award logic exists. |
| **Streak** | Streak days are hardcoded as `"12 days"`. No real streak calculation occurs. |
| **Apple Sign-In / Google OAuth** | No real OAuth flow is wired. |
| **Email magic link** | No real OTP email is sent. |
| **Backend** | The `api-server` artifact is an Express scaffold. No real endpoints are implemented. |

---

## 14. Recommended Next Steps

The following is the logical implementation roadmap for taking Nervana from prototype to production:

### Immediate (1–2 weeks)

1. **Set up Supabase projects** (staging + production) and run the database schema migrations from `backend_implementation.md`
2. **Create the Cloudflare Worker project** with the folder structure in `backend_implementation.md`
3. **Wire Supabase Auth** in the mobile app — replace the current fake auth with real Google OAuth and magic link
4. **Replace `AsyncStorage` with `expo-secure-store`** for all session material

### Short-Term (2–4 weeks)

5. **Implement check-in and journal API endpoints** in the Worker
6. **Repoint `home.tsx`, `journal.tsx`, `checkin.tsx`** to use real API calls instead of `mock.ts`
7. **Implement the AI companion endpoint** (streaming SSE from Anthropic Claude)
8. **Wire companion screen** to use real AI responses

### Medium-Term (1–2 months)

9. **Implement push notifications** end-to-end (Expo → APNs/FCM → Cloudflare Queue → delivery)
10. **Implement onboarding profile persistence** and pattern analysis
11. **Set up EAS builds** for TestFlight and Play Store internal testing
12. **Analytics integration** (Sentry for crashes, Posthog for events)

### Before Launch

13. **Security review** — rate limiting, RLS verification, referral fraud prevention
14. **App Store assets** — screenshots, descriptions, privacy policy
15. **Legal review** — privacy policy, terms of service, HIPAA applicability check
16. **Remove all mock data** — delete `data/mock.ts` after all screens are repointed

Refer to `tech_debt.md` for the full itemized checklist.

---

## Documentation Index

| File | Purpose |
|---|---|
| `README.md` | Developer onboarding and project usage guide (this file) |
| `backend_implementation.md` | Complete backend architecture, API spec, and database schema |
| `frontend_repointing.md` | API integration guide for transitioning from mock to production |
| `tech_debt.md` | Master engineering checklist and operational tracking document |

---

*Built with care. Nervana is your mental exhale.*
