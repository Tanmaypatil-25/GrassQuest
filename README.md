# GrassQuest 🌿

**AI that invites you to close the app.** Turn a spare moment into a small outdoor adventure with Gemma, then keep a private memory of what you noticed.

## Run locally
Requires Node 20.12+ (Node 22 LTS recommended).

```powershell
npm install
Copy-Item .env.example .env
```

If you already have `.env`, keep it and add the MongoDB settings below instead of overwriting it.

```dotenv
GEMINI_API_KEY=your_google_ai_studio_key
GEMMA_MODEL=gemma-4-26b-a4b-it
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=grassquest
```

Use the actual URI supplied by Atlas. URL-encode reserved characters in the database password if necessary. The database user needs read/write access to `grassquest`; your current IP must be in Atlas Network Access. Keep `.env` private. It is ignored by Git. Do not put secrets in client code or screenshots.

```powershell
npm run dev
```

Open http://localhost:3000. The terminal should print `MongoDB connected.` Create an app account using the Sign in button; this account is separate from the Atlas database user. Complete a quest and check My journal. Sign in from another browser to verify cloud persistence.

Without `MONGODB_URI`, the journal stays in browser mode. Without model credentials, quests are explicitly labeled samples. A configured but unreachable database stops startup rather than silently storing cloud entries locally.

## Features
- Time, mood and environment preferences with a responsive outdoor-inspired interface
- Gemma generation through Google AI Studio; optional OpenAI-compatible Gemma endpoint
- Persistent local Touch-Grass timer
- Guest journal with reflections, optional compressed photo and JSON export
- Email/password accounts and Atlas-backed journals across devices
- Explicit import of browser memories into an account; retries do not duplicate entries

## How cloud storage works
The Node server uses the official MongoDB driver. Passwords are salted and hashed with scrypt. Session tokens use HttpOnly, SameSite cookies; only hashed tokens are stored in MongoDB. Production cookies require HTTPS. Queries always use the signed-in user's ID. MongoDB unique indexes prevent duplicate user emails and duplicate imported entries; TTL indexes clean up expired sessions and rate-limit records. Expiry is checked on every request independently of TTL cleanup.

Collections: `users`, `sessions`, `entries`, `limits`. Do not share a public database user or credentials with application users.

Guest data stays in the browser until the user explicitly imports it. Signed-in journal entries are fetched from the server, while active quest timers remain device-local. Signing out switches back to the browser journal. Guest originals remain available after import. Exported JSON contains personal reflections and photos.

## Deploy the Node app
Use a Node web service on a host such as Render:

- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`
- Runtime secrets: `GEMINI_API_KEY`, `MONGODB_URI`
- Other environment values: `GEMMA_MODEL`, `MONGODB_DB=grassquest`, `NODE_ENV=production`, `APP_ORIGIN=https://your-exact-public-hostname`
- Allow the host's outbound IP addresses in Atlas Network Access.

`PORT` is provided by the host. The old Sites preview remains separate and uses browser journal storage. It has not been switched to this Node/Atlas backend.

## Development

```sh
npm test
npm run build
```

The build validates the browser script and produces `dist/index.html` as a static preview. Run `npm start` for the actual server; serving the HTML alone does not provide AI or cloud APIs. `npm run build` works on Windows without Bash.

- `worker/index.js`: existing UI and model generation handler
- `server/index.mjs`: Node HTTP server, environment loading and database startup
- `server/app.mjs`: authentication, journal endpoints and rate limits
- `server/database.mjs`: connection and indexes
- `server/security.mjs`: password hashing and request validation
- `tests/`: model, auth and journal behavior tests

Tests use an in-memory database double for route behavior. Actual Atlas connectivity and browser flows need verification with the owner's private configuration. No credentials are bundled.

## Current limits
Email verification and password recovery are not implemented. Keep your password safe. Auth and AI limits use the direct socket IP, so visitors behind a reverse proxy may share an IP limit. Active quests do not sync across devices. Images are stored with journal documents; this MVP is intended for small usage. Recorded outdoor minutes are elapsed time capped at the requested duration, not GPS verification. There are no maps or verified route recommendations.

## Challenge readiness
Still required: a live public Node deployment, an outdoor field test, demo media and a DEV submission. No prize eligibility or deployment to Render is claimed merely by including these setup instructions.

## Contributing
See CONTRIBUTING.md. Licensed under MIT. Hero art was generated for this project.
