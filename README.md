# GrassQuest 🌿

**AI that invites you to close the app.** Turn a spare moment into a small outdoor adventure with Gemma, then keep a private memory of what you noticed.


[Try the live demo](https://grassquest.onrender.com/) · [Source code](https://github.com/Tanmaypatil-25/GrassQuest)

Built for the Hacktoberfest 2026 Open-Source AI Challenge, Week 1: **Touch Grass**.

## How it works

1. Choose your available time, mood and surroundings.
2. Gemma creates a personalized outdoor micro-adventure.
3. Start Touch-Grass Mode, pocket your phone and head outside.
4. Return with a reflection or photo and save your adventure.

## Screenshots

### Find your adventure
![GrassQuest homepage](assets/screenshots/home.png)

### Your personalized quest
![Generated outdoor quest](assets/screenshots/quest.png)

### Your outside story
![Adventure journal](assets/screenshots/journal.png)

## Technology

| Part | Technology |
| --- | --- |
| Interface | HTML, CSS, JavaScript |
| Server | Node.js |
| Quest generation | Gemma 4 via Google's hosted API |
| Database | MongoDB Atlas |
| Hosting | Render |
| Authentication | Scrypt password hashes and cookie sessions |

## Why an open-weight model?

Gemma generates the core quest content from the user's preferences. Open weights make self-hosting and model adaptation possible; the application also supports an alternative OpenAI-compatible endpoint. The deployed version uses Google's hosted Gemma API. Offline inference and fine-tuning have not been tested. Sample mode is explicitly labeled when AI credentials are absent.

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
- Start command on Render: `APP_ORIGIN=$RENDER_EXTERNAL_URL npm start` (or set `APP_ORIGIN` explicitly and use `npm start`)
- Health check path: `/api/health`
- Runtime secrets: `GEMINI_API_KEY`, `MONGODB_URI`
- Other environment values: `GEMMA_MODEL`, `MONGODB_DB=grassquest`, `NODE_ENV=production`, `APP_ORIGIN=https://your-exact-public-hostname`
- Allow the host's outbound IP addresses in Atlas Network Access.

`PORT` is provided by the host. The live demo above runs the Node application on Render with MongoDB Atlas.

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

All 15 automated tests passed during development. Route tests use an in-memory database double. Live Gemma generation and MongoDB-backed service health were checked on Render; the author verified sign-in, journal persistence across browser sessions, and two quests in real-world use. These checks do not replace comprehensive browser or load testing. No credentials are bundled.

## Current limits
Email verification and password recovery are not implemented. Keep your password safe. Auth and AI limits use the direct socket IP, so visitors behind a reverse proxy may share an IP limit. Active quests do not sync across devices. Images are stored with journal documents; this MVP is intended for small usage. Recorded outdoor minutes are elapsed time capped at the requested duration, not GPS verification. There are no maps or verified route recommendations.

## Challenge submission
Created on October 7, 2026, during the Week 1 challenge window. The project uses Gemma for quest generation, Atlas for private journals and Render for public hosting. The DEV submission will explain the implementation and the author's outdoor testing experience.

AI assistance was used for implementation and visual design. The hero landscape was generated for this project. The application source is MIT-licensed; dependencies and Gemma are governed by their respective licenses and terms.

## Contributing
See CONTRIBUTING.md. Licensed under MIT. Hero art was generated for this project.
