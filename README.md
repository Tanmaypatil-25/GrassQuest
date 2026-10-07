# GrassQuest
AI that invites you to close the app.

## Features
- Time, mood and environment preferences
- Server-side Gemma integration through an OpenAI-compatible chat endpoint
- Explicit curated sample mode when a model is not connected
- Touch-Grass Mode with a persistent end timestamp
- Local adventure journal, reflections, compressed optional photos and JSON export
- Responsive, keyboard-accessible interface

## Run locally
Requires Node 20.12+ (or a newer LTS release).

```sh
npm install
npm run dev
```

Open http://localhost:3000. No credentials are needed for sample mode.
For Google AI Studio: copy `.env.example` to `.env`, replace the key placeholder with your key, then run `npm run dev`. The local server loads `.env` automatically. Keep this file private; it is ignored by Git. Hosted deployments require `GEMINI_API_KEY` configured as a runtime secret and `GEMMA_MODEL=gemma-4-26b-a4b-it`. Live Google access has not been verified without credentials.

For an alternative OpenAI-compatible provider, set GEMMA_API_URL to your trusted endpoint ending in `/v1/chat/completions`, GEMMA_MODEL to the exact model ID, and GEMMA_API_KEY if your provider requires authentication. These values stay server-side. A local Ollama installation can use http://localhost:11434/v1/chat/completions with an installed Gemma model. The hosted Worker needs an HTTPS endpoint reachable from Cloudflare; localhost is only for local development.

```sh
npm test
npm run build
```

## Deployment
This project is deployed with Sites as a Cloudflare Worker. Configure the same three runtime variables for live inference. No MongoDB Atlas or Render service is provisioned. Journal data is stored in the browser; it does not sync across devices. Export it before clearing browser storage. The journal contains personal reflections and optional photos.

## Architecture
`worker/index.js` contains the UI and Worker request handler. `/api/status` reports model availability; `/api/quest` validates preferences, calls the model and validates its JSON output. Model failures are reported honestly. Sample quests are never labeled AI-generated. The local Node adapter is in `scripts/dev.mjs`.

## Challenge readiness
The application is usable in sample mode. A verified live open-weight model integration, public source repository, outdoor field test and DEV submission are still required before treating this as an AI challenge submission. This repository does not claim prize eligibility.

## Limitations
No maps, GPS tracking, route safety verification, accounts or cloud persistence. Outdoor time is recorded elapsed time capped at the requested duration, not proof of activity. Users can adapt or skip quests. Model output is untrusted and rendered as escaped text.

## Contributing
See CONTRIBUTING.md. Licensed under MIT.
