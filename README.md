# Her Ashtra

A Women's Safety mobile app (Expo + React Native), with a JWT-authenticated Express/Postgres backend ([`Her-Ashtra-API`](https://github.com/acroshubham/her-ashtra-api)).

## Free resource stack (verified July 2026)

What we're building on and why — keep this in sync with reality as choices change.

| Piece | Service | Free tier | Notes |
|---|---|---|---|
| Compute (API) | **Render** (Web Service, free instance) | Free, no card, 512MB/0.1vCPU, scales to zero after 15min idle, ~30-60s cold start on wake | Was Koyeb until its deploy flow went down amid the Mistral acquisition. Cold start is mitigated with a 10-minute uptime pinger before demos — see the API's deployment doc. |
| Database | **Neon** (Postgres, free plan) — **one shared project** | 100 CU-hrs/month, 0.5GB storage, unlimited branches, scale-to-zero after 5 min idle | One shared project for the whole backend, not one per feature or teammate — avoids splitting free-tier limits into N single points of failure. |
| Auth | Plain email + password + JWT, built in `Her-Ashtra-API` | — | No Supabase, no OAuth, no magic link — simplest thing that keeps a mobile client logged in. |
| LLM (AI Safety, planned) | **Google Gemini API** free tier | Flash-Lite: 15 RPM / 1,000 RPD; Flash: 10 RPM / 250 RPD; shared 250k TPM | Not wired up yet — build against `gemini-2.5-flash-lite` for headroom when this lands. |
| Push notifications (planned) | **Expo Push Notification service** | Free, no card | Not wired up yet. |
| Maps (planned) | **react-native-maps** (already installed) | iOS free (Apple Maps). Android needs a Google Maps SDK key, free under Google's $200/mo credit at hackathon scale | Key goes in `app.json` → `android.config.googleMaps.apiKey` — never hardcode it elsewhere. |
| Offline SMS (planned) | **expo-sms** / native module | Free, on-device | Zero backend involvement by design — must work with no connectivity. |

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and point it at the API (local backend, or your team's deployed URL):
   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_API_URL=http://localhost:4000
   ```
3. Start the app:
   ```bash
   npx expo start
   ```

Need the backend running locally too? See `Her-Ashtra-API`'s README — `npm install`, fill `.env`, `npm run db:migrate`, `npm run dev`.

## Commands

```bash
npx expo start        # Expo dev server
npx expo start --android
npx expo start --ios
npx expo start --web
npm run lint
```

## Project structure

```
app/                  Expo Router routes — (auth)/, (tabs)/
components/           auth/, common/, home/, navigation/
lib/                  API client, auth context, theme tokens
stores/               Zustand stores
```
