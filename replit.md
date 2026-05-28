# Nervana

A premium mental reset app for overwhelmed modern professionals — built as a frontend prototype for UX review.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo app (port 18115)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: React Native + Expo SDK 54, Expo Router v6
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile/app/` — all screens (Expo Router file-based)
- `artifacts/mobile/app/(main)/` — main authenticated Stack (home, companion, journal, calm-reset, focus-session)
- `artifacts/mobile/components/` — shared UI (AtmosphericBackground, PremiumCard, GlowText, etc.)
- `artifacts/mobile/context/AppContext.tsx` — global state (user, coins, streak, mood goal)
- `artifacts/mobile/data/mock.ts` — all mocked/hardcoded data
- `artifacts/mobile/hooks/useColors.ts` — design token hook
- `lib/db/src/schema.ts` — Drizzle DB schema (source of truth)
- `lib/api-spec/openapi.yaml` — OpenAPI contract

## Architecture decisions

- Frontend-only prototype: all data is mocked/local state — no real API calls made from screens
- Navigation: single Stack hub (`(main)`) with no tab bar — all secondary screens push from Mindspace (home)
- Gamification: light-touch coins + streak only, stored in AppContext + AsyncStorage
- AI coach: simulated responses via local MOCK_RESPONSES array; no LLM calls
- Dark luxury aesthetic: atmospheric gradients + glassmorphism throughout

## Product

**Nervana** is a mental reset system for knowledge workers. Core flows:

1. **Onboarding** (2 steps) — Mood goal selection + MindScan (5-question check-in with mocked result)
2. **Mindspace** (hub) — Flow Score, Daily Insight, 3 primary actions, AI Coach card
3. **Focus Session** — Duration select → active countdown → completion with coins/streak reward
4. **Calm Reset** — Guided breathing session (2.5 min) → completion with coin reward
5. **Journal** — Daily prompt + free-write, saves locally
6. **AI Coach** — Conversational companion with simulated responses

## User preferences

- Frontend-only prototype — do NOT add backend integrations or real APIs
- Keep mocked/hardcoded data — no complex state management (no Redux, etc.)
- Premium, minimalist, dark luxury aesthetic
- Smooth Reanimated animations throughout
- Modular reusable components

## Gotchas

- Expo Router v6 — use `router.push("/(main)/screen-name")` for navigation
- The `(main)/_layout.tsx` is now a Stack (not Tabs) — screens push/pop rather than tab-switch
- `AtmosphericBackground` variants: `default`, `warm`, `deep`
- Fonts: DMSans (body) + DMSerifDisplay (display/italic headings)
- `useColors()` hook returns design tokens — always use it instead of hardcoded colors

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
