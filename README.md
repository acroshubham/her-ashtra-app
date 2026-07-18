# Women Safety AI

A hackathon starter template for a Women's Safety mobile app (Expo + React Native).
See [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) for the full feature spec, architecture, and two-day build timeline.

## What's already wired up

- **Auth**: Supabase (Google OAuth + Email magic link/OTP), with deep-link callback handling in `app/_layout.tsx` and `lib/supabase.ts`.
- **Deep linking**: `expo-linking` scheme (`womensafetyai://`) configured in `app.json`, magic-link tokens are parsed in `handleSupabaseUrl`.
- **State**: Zustand, demonstrated in `stores/useContactStore.ts` (a selectable "trusted guardian" list) paired with the reusable `components/common/Dropdown.tsx`.
- **Navigation**: A custom paginated bottom tab bar (`components/navigation/PaginatedTabBar.tsx`) showing 4 tabs per page with chevrons to page through the rest - add more `Tabs.Screen` entries in `app/(tabs)/_layout.tsx` and it scales automatically.
- **Theming**: A bright, minimal rose/violet palette in `tailwind.config.js` and `lib/theme.ts` - use the `brand-*`, `accent-*`, and `sos-*` color scales.
- **Screens**: Two real screens (`Home`, `Settings`) and six "Coming Soon" placeholders (`components/common/ComingSoon.tsx`) for the features in the spec - swap each one out as your team builds it.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a [Supabase](https://supabase.com) project, then copy `.env.example` to `.env` and fill in your project's URL/anon key:
   ```bash
   cp .env.example .env
   ```
3. Run the schema in `supabase/migrations/001_create_profiles.sql` against your Supabase project (SQL editor or `supabase db push`). This gives you a minimal `profiles` table auto-created on signup.
4. Enable Google OAuth and Email OTP in your Supabase project's Auth settings, with the redirect URL `womensafetyai://auth-callback` (mobile) and `<your-web-url>/auth-callback` (web).
5. Start the app:
   ```bash
   npm start
   ```

## Where to build the real features

| Feature (from the spec) | Placeholder screen | Notes |
|---|---|---|
| Live GPS trip / map | `app/(tabs)/safe-trip.tsx` | `react-native-maps` + `expo-location` are already in `package.json` |
| Guardian Network (crowdsourced SOS) | `app/(tabs)/guardian-network.tsx` | Needs a backend fan-out (Supabase Edge Function or Realtime) |
| AI safety recommendations | `app/(tabs)/ai-safety.tsx` | Free-tier Gemini/OpenAI call, keyed off location + trip state |
| SOS alert history | `app/(tabs)/alerts.tsx` | |
| Offline SMS distress broadcast | `app/(tabs)/offline-sos.tsx` | Needs a native SMS module (e.g. `expo-sms` or a native module for auto-send) |
| Trusted circle management | `app/(tabs)/circle.tsx` | Extend `stores/useContactStore.ts` with a real Supabase table |

## Project structure

```
app/                  Expo Router routes
  (auth)/             Login + OTP screens
  (tabs)/             Main app - paginated tab bar + 8 screens
components/
  auth/               AuthGate (redirect logic)
  common/             Dropdown, ComingSoon, DatePicker - generic UI
  home/               Home screen header
  navigation/         PaginatedTabBar
lib/                  Supabase client, auth context, theme tokens
stores/               Zustand stores
supabase/migrations/  SQL schema
```

## Commands

```bash
npm start        # Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web
npm run lint     # Lint
```
