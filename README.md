# 🐾 momo — a pet dashboard

A cozy, generic dashboard for any pet — profile, events, medical history,
prescriptions (with AI transcription), reminders, a gamified training roadmap,
gallery and the story of how they joined the family.

**`momo` is the first pet.** The app is generic across species (cat, dog,
rabbit, bird, …) and you can add as many pets as you like.

## Architecture

Pure static React SPA. No backend to run.

- **Hosting:** GitHub Pages (static)
- **Auth:** Google Identity Services (GIS) token client — you sign in with Google
- **Data store:** *your own* Google Drive (`drive.file` scope)
- **AI:** the shared LLM proxy (`llm-proxy-smoky.vercel.app`) for prescription
  transcription — no per-project API keys
- **Stack:** Vite · React 19 · TypeScript · React Router (HashRouter)

### How data is stored in Drive

```
PetDashboard/                 (app folder, created on first save)
  <petId>.json                (one Pet record — the structured source of truth)
  <petId>-media/              (folder of binary assets for that pet)
    avatar-*.jpg
    photo-*.jpg               (gallery)
    rx-*.jpg                  (prescription scans)
```

Each `<petId>.json` carries `appProperties` (`pd=pet`, name, species, emoji,
accent) so the pet picker lists everyone without downloading every file. The
full `Pet` schema lives in [`src/types.ts`](src/types.ts).

## Local setup

```bash
npm install
cp .env.example .env          # then paste your Google client ID
npm run dev                   # http://localhost:5173
```

### Google Cloud (one-time)

1. [console.cloud.google.com](https://console.cloud.google.com) → new project.
2. **APIs & Services → Library** → enable **Google Drive API**.
3. **Credentials → Create OAuth client ID → Web application**.
4. **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://<your-username>.github.io`
5. **OAuth consent screen** → External → add your email as a test user.
6. Copy the Client ID into `.env` as `VITE_GOOGLE_CLIENT_ID`.

> Keep this client ID handy — the MCP connector (below) **must use the same GCP
> project** so it can see the same Drive files.

## Deploy to GitHub Pages

1. Push to a repo named **`momo`** (the `base` in `vite.config.ts` must match the
   repo name; change it for a custom domain).
2. Add the client ID as a repo **secret**: `VITE_GOOGLE_CLIENT_ID`.
3. Enable Pages with the GitHub Actions source:
   ```bash
   gh api -X POST repos/{owner}/{repo}/pages -f build_type=workflow
   ```
4. Push to `main` → the `Deploy` workflow builds and publishes automatically.
   Live at `https://<your-username>.github.io/momo/`.

## AI prescription transcription

Upload a photo on the **Prescriptions** page and tap *Transcribe*. The image is
sent (with your existing Google token) to the shared LLM proxy, which forwards it
to Claude vision and returns clean text. If you get **403** from the proxy your
email isn't on its allowlist (`ALLOWED_USERS` in the proxy's Vercel env).

## MCP connector — let an agent read momo's context

The whole point of keeping everything as structured JSON in Drive is that an LLM
agent can read it to make informed decisions ("is momo due for deworming?",
"what's he allergic to?", "draft a vet-visit summary").

Build a custom MCP connector per the **drive-mcp-connector** skill — a thin
Cloudflare Worker on `@drive-mcp/core` at `/media/extra/Developer/drive-mcp`:

```bash
cd /media/extra/Developer/drive-mcp
cp -r apps/_template apps/momo-mcp
```

Then in `apps/momo-mcp`:

- Set `TData = Pet` to match `src/types.ts` exactly, with `folderName:
  "PetDashboard"` and per-pet file `<petId>.json`.
- Expose **domain tools**, not a generic writer:
  - `list_pets` → name/species/id summary (reads `appProperties`)
  - `get_pet_overview(petId)` → profile, open reminders, due medical items
  - `get_medical(petId)`, `get_training(petId)`
  - `add_event(petId, …)`, `add_reminder(petId, …)`, `log_weight(petId, …)`,
    `complete_reminder(petId, reminderId)` — each does one read-modify-write,
    generating ids/timestamps server-side to match what this app produces.
- Use the **same GCP project** as the SPA's `VITE_GOOGLE_CLIENT_ID` (the #1
  silent-failure rule — wrong project = the connector can't see the files).

Add it in Claude.ai → Settings → Connectors → custom connector →
`https://momo-mcp.<subdomain>.workers.dev/mcp`. The SPA needs **zero** changes.

## Project map

| Path | What |
|---|---|
| `src/types.ts` | The `Pet` schema — shared with the MCP connector |
| `src/data/petKinds.ts` | Species presets + default care reminders + `newPet()` |
| `src/data/syllabi.ts` | Training syllabi → the graduation roadmap |
| `src/services/googleAuth.ts` | GIS sign-in + the refresh-survival storage pattern |
| `src/services/drive.ts` | Drive I/O: pet JSON + media upload/download |
| `src/lib/store.ts` | Orchestration + `normalize()` (backfills old files) |
| `src/lib/llm-proxy.ts` | Proxy client + `transcribePrescription()` |
| `src/context/PetProvider.tsx` | App state + optimistic debounced autosave |
| `src/pages/*` | Dashboard, Profile, Events, Medical, Prescriptions, Reminders, Training, Gallery |
