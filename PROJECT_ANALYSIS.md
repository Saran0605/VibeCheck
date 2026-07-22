# VibeCheck — Project Analysis

> Generated for internal reference. Use this document as the source of truth for architecture before suggesting or modifying code.

**Product names:** The UI and README brand the product as **VibeCheck**. The root npm package, backend package, and several log strings still say **Promptify**. Treat them as the same product.

---

## 1. High-level architecture

VibeCheck is a **self-learning prompt optimizer**: users write software prompts, the system classifies and rewrites them via Groq, predicts cost/tokens from similar past runs, generates code, stores history with embeddings, and exports OpenTelemetry traces to SigNoz.

It is an **informal two-package repo** (not a formal monorepo — no workspaces/Turbo/Nx):

| Package | Path | Role |
|---------|------|------|
| Root scripts | `/` | `npm run start:backend` / `dev:frontend` convenience only |
| Backend | `backend/` | Express API, MongoDB, Groq, local embeddings, OTel |
| Frontend | `frontend/` | React 19 + Vite SPA (IDE-style shell) |

```
┌─────────────────────┐     /api proxy (dev)      ┌──────────────────────────┐
│  React + Vite       │ ───────────────────────► │  Express :5000           │
│  localhost:5173     │   credentials: include   │  JWT cookie auth         │
└─────────────────────┘                          └────────────┬─────────────┘
                                                              │
                    ┌──────────────┬──────────────┬───────────┼───────────┐
                    ▼              ▼              ▼           ▼           ▼
               MongoDB        Groq LLM    Xenova MiniLM   OTLP HTTP    (optional)
               (Mongoose)  llama-3.3-70b  all-MiniLM-L6   → SigNoz
```

**Core product loop**

1. User enters a raw prompt.
2. `POST /api/promptify` → classify → embed → find similar successful runs → predict cost/tokens → Groq produces 3 rewrites.
3. User picks a rewrite.
4. `POST /api/generate` → Groq generates code → persist `PromptHistory` (embedding + metrics + `traceId`).
5. User can mark success/failure; successful runs feed future similarity predictions.

---

## 2. Folder-by-folder explanation

### Repository root

| Path | Purpose |
|------|---------|
| `package.json` | Name `promptify`; scripts to start frontend/backend |
| `.env.example` | Template for `GROQ_API_KEY`, `MONGODB_URI`, `JWT_SECRET`, OTel, `PORT` |
| `.gitignore` | Ignores `node_modules`, `.env`, `dist`/`build`, `local-signoz-data/` |
| `README.md` | One-line product description |
| `PROJECT_ANALYSIS.md` | This document |

**Not present:** Docker, CI, docs/, infra/, tests, TypeScript app code.

### `backend/`

| Path | Purpose |
|------|---------|
| `server.js` | Express bootstrap: CORS, cookies, JSON, AI rate limit, route mounts, health |
| `tracing.js` | OpenTelemetry NodeSDK → OTLP HTTP (SigNoz); service name `vibecheck-backend` |
| `config/db.js` | Mongoose connect; custom DNS for Atlas SRV; does not exit on failure |
| `middleware/auth.js` | JWT from httpOnly cookie or `Authorization: Bearer` |
| `models/User.js` | Email + bcrypt password hash |
| `models/PromptHistory.js` | Prompt runs, embeddings, tokens, cost, code, feedback, traceId |
| `routes/authRoutes.js` | Signup, login, logout, me |
| `routes/promptifyRoutes.js` | Prompt optimization pipeline |
| `routes/generateRoutes.js` | Code generation + history write |
| `routes/historyRoutes.js` | List history, patch feedback |
| `services/classifierService.js` | Heuristic vague / underspecified / well-scoped |
| `services/embeddingService.js` | Xenova MiniLM 384-d embeddings (+ hash fallback) |
| `services/similarityService.js` | Cosine similarity + cost/token predictions |
| `services/groqService.js` | Prompt rewrites + code generation via Groq |

### `frontend/`

| Path | Purpose |
|------|---------|
| `index.html` | SPA shell (title still `"frontend"`) |
| `vite.config.js` | Port 5173; proxies `/api` → `http://localhost:5000` |
| `src/main.jsx` | React root mount |
| `src/App.jsx` | Auth gate, all API calls, shared state, layout orchestration |
| `src/index.css` | Design tokens, glass panels, Prism overrides |
| `src/App.css` | **Unused** Vite template leftover |
| `src/components/AuthScreen.jsx` | Full-page login/register (active) |
| `src/components/AuthModal.jsx` | **Unused** modal auth variant |
| `src/components/Navbar.jsx` | Brand, history, user, logout |
| `src/components/LeftPanel.jsx` | Decorative fake file tree |
| `src/components/CenterPanel.jsx` | Generated code + metrics + feedback |
| `src/components/RightPanel.jsx` | Prompt input, Optimize, Submit |
| `src/components/OptimizeModal.jsx` | Pick among 3 rewritten prompts |
| `src/components/HistoryDrawer.jsx` | Past runs drawer |

---

## 3. File dependency graph

### Backend (runtime)

```
tracing.js  ←── required first (via `node -r` and/or server.js)
     │
server.js
     ├── config/db.js → mongoose
     ├── middleware/auth.js → jsonwebtoken
     ├── routes/authRoutes.js
     │     ├── models/User.js
     │     └── middleware/auth.js
     ├── routes/promptifyRoutes.js
     │     ├── middleware/auth.js
     │     ├── services/classifierService.js
     │     ├── services/embeddingService.js → @xenova/transformers
     │     ├── services/similarityService.js → models/PromptHistory.js
     │     └── services/groqService.js → groq-sdk
     ├── routes/generateRoutes.js
     │     ├── middleware/auth.js
     │     ├── models/PromptHistory.js
     │     ├── services/classifierService.js
     │     ├── services/embeddingService.js
     │     └── services/groqService.js
     └── routes/historyRoutes.js
           ├── middleware/auth.js
           └── models/PromptHistory.js
```

### Frontend (runtime)

```
main.jsx
  └── App.jsx  (sole API client + state hub)
        ├── AuthScreen.jsx
        ├── Navbar.jsx
        ├── LeftPanel.jsx          (no props / isolated)
        ├── CenterPanel.jsx        ← currentOutput, onFeedbackToggle
        ├── RightPanel.jsx         ← prompt + optimize/submit
        ├── OptimizeModal.jsx      ← suggestions from /promptify
        └── HistoryDrawer.jsx      ← historyList + select/feedback

Orphans (not imported): AuthModal.jsx, App.css
```

### Cross-cutting (frontend → backend)

| Frontend (`App.jsx`) | Backend |
|----------------------|---------|
| `GET /api/auth/me` | `authRoutes` + `authMiddleware` |
| `POST /api/auth/signup\|login\|logout` | `authRoutes` |
| `POST /api/promptify` | `promptifyRoutes` |
| `POST /api/generate` | `generateRoutes` |
| `GET /api/history` | `historyRoutes` |
| `PATCH /api/history/:id/feedback` | `historyRoutes` |

---

## 4. API flow

Base URL in development: frontend uses relative `/api` (Vite proxy → backend `:5000`).

| Method | Path | Auth | Rate limit | Description |
|--------|------|------|------------|-------------|
| `POST` | `/api/auth/signup` | No | No | Create user; set JWT cookie; return user + token |
| `POST` | `/api/auth/login` | No | No | Login; set JWT cookie; return user + token |
| `POST` | `/api/auth/logout` | No | No | Clear `token` cookie |
| `GET` | `/api/auth/me` | Yes | No | Current user (no passwordHash) |
| `POST` | `/api/promptify` | Yes | 20/min | Classify, embed, similar, 3 rewrites + predictions |
| `POST` | `/api/generate` | Yes | 20/min | Generate code; save PromptHistory |
| `GET` | `/api/history` | Yes | No | Last 50 history docs for user |
| `PATCH` | `/api/history/:id/feedback` | Yes | No | Set/toggle `success` on owned doc |
| `GET` | `/api/health` | No | No | Health + OTel endpoint info |

### Promptify request/response (summary)

- **Body:** `{ prompt }` (required, max 5000 chars)
- **Response:** `{ rawPrompt, category, suggestions[], embedding }`
- Each suggestion includes rewritten text, category, predicted tokens/cost/latency, and a display title (`Stack Explicit` / `Scoped Architecture` / `Production Grade`).

### Generate request/response (summary)

- **Body:** `{ prompt }` and/or `{ rawPrompt, chosenPrompt, category? }` (max 8000 on chosen)
- **Response:** `{ id, generatedCode, category, tokensInput, tokensOutput, costUsd, latencyMs, traceId, success }`

---

## 5. Database design

**Engine:** MongoDB via Mongoose 8.  
**Migrations:** None — schemas define collections at runtime.

### Collection: `users` (`User`)

| Field | Type | Notes |
|-------|------|--------|
| `email` | String | required, unique, lowercase, trim |
| `passwordHash` | String | required (bcrypt, salt rounds 10) |
| `createdAt` | Date | default now |

No roles, email verification, or `updatedAt`.

### Collection: `prompthistories` (`PromptHistory`)

| Field | Type | Notes |
|-------|------|--------|
| `userId` | ObjectId → User | required |
| `rawPrompt` | String | required |
| `chosenPrompt` | String | required |
| `category` | enum | `vague` \| `underspecified` \| `well-scoped` |
| `embedding` | `[Number]` | ~384 dims (MiniLM) or hash fallback |
| `tokensInput` / `tokensOutput` | Number | |
| `costUsd` / `latencyMs` | Number | |
| `success` | Boolean | default `true`; used for learning filter |
| `generatedCode` | String | |
| `traceId` | String | OTel correlation |
| `createdAt` | Date | |

**Relationships:** one User → many PromptHistory. No cascade delete.

**Indexes:** email uniqueness only. No compound index on `userId` / `success`. Similarity search loads up to 100 successful docs and scores in memory (no vector index).

**Important behavior:** `findSimilarPrompts` queries **all users’** successful prompts (no `userId` filter), then averages metrics and may pass match prompt text into Groq context.

---

## 6. Authentication flow

```
┌──────────┐  signup/login   ┌─────────────┐
│ Frontend │ ──────────────► │ authRoutes  │
│ AuthScreen│                │ bcrypt+JWT  │
└────┬─────┘                 └──────┬──────┘
     │                              │
     │  Set-Cookie: token (httpOnly │
     │  sameSite=lax, 7d;           │
     │  secure if NODE_ENV=production)
     │                              │
     │  Also returns `token` in JSON body (frontend currently ignores it)
     ▼
Subsequent fetch(..., { credentials: 'include' })
     │
     ▼
authMiddleware: cookie `token` OR Bearer header
     → jwt.verify(JWT_SECRET || hardcoded fallback)
     → req.user = { id, email }
```

**Session check on load:** `GET /api/auth/me` → if OK, set user and load history; else show `AuthScreen`.

**Logout:** clears cookie only — JWT remains valid until expiry if stolen (no denylist).

**Frontend “Google” button:** not real OAuth. Uses `prompt()` for email plus a shared hardcoded password path in `AuthScreen.jsx` (security concern).

---

## 7. Request lifecycle

1. **Process start:** `node -r ./tracing.js server.js` loads OTel first; `server.js` also `require('./tracing')` (possible double-init depending on start path).
2. **Env:** load `../.env` then `backend/.env`.
3. **DB:** `connectDB()` async (non-blocking; failures logged, process stays up).
4. **Per HTTP request:**
   1. OpenTelemetry HTTP/Express auto-instrumentation
   2. CORS (`FRONTEND_ORIGIN` + localhost origins, `credentials: true`)
   3. `cookie-parser`
   4. `express.json` / `urlencoded` (10mb limit)
   5. Route mount:
      - `/api/auth/*` — no AI rate limiter
      - `/api/promptify` and `/api/generate` — `aiRateLimiter` (20/min) then route-level `authMiddleware`
      - `/api/history*` — route-level `authMiddleware`
      - `/api/health` — open
   6. Handler → services → MongoDB / Groq / local embedding model
   7. Manual OTel spans on promptify/generate paths
5. **No** global error handler, Helmet, CSRF middleware, or structured request logging middleware.

---

## 8. Business logic

### Prompt classification (`classifierService`)

Rule-based heuristics on word count + keyword lists (tech stack + specificity):

- **vague** — short / no tech or spec keywords
- **well-scoped** — longer + tech + specificity signals
- Otherwise **underspecified**

### Embeddings (`embeddingService`)

- Primary: `@xenova/transformers` pipeline `feature-extraction` with `Xenova/all-MiniLM-L6-v2` (mean pool, normalize) → 384-d vector
- Fallback: deterministic char-hash vector (normalized) if model fails

### Similarity & cost prediction (`similarityService`)

1. Load up to 100 `PromptHistory` where `success: true` and embedding non-empty (**global**, not per-user).
2. Cosine-rank against target embedding; take top 5 with similarity > 0.1.
3. Average their tokens/cost/latency as predictions.
4. If no corpus/matches: heuristic from word count.

### Prompt rewrites (`groqService.generatePromptRewrites`)

- Groq model `llama-3.3-70b-versatile`
- System prompt asks for exactly 3 intent-preserving variations (stack explicit, scoped logic, production quality)
- May include past successful prompts as context
- On parse/API failure: template string fallbacks (still returns 3 strings)

### Code generation (`groqService.generateCode`)

- Same Groq model; returns markdown-capable assistant text
- Cost estimated with hardcoded per-token rates (`1e-7` input, `2e-7` output) — not live Groq billing
- On failure: mock JS fallback code still returned as success-shaped payload

### Feedback learning loop

- New generations default `success: true`
- User can PATCH feedback; only `success: true` rows participate in similarity search
- Polluted defaults until users mark failures reduce prediction quality

---

## 9. Key classes / modules

There are no OOP “classes” in the classic sense — CommonJS modules and Mongoose models. Treat these as the key units of responsibility:

| Module | Responsibility |
|--------|----------------|
| `server.js` | App wiring, middleware, mounts |
| `tracing.js` | OTel SDK lifecycle |
| `middleware/auth.js` | JWT gate → `req.user` |
| `models/User.js` | Auth identity persistence |
| `models/PromptHistory.js` | Run store for learning + UI history |
| `routes/authRoutes.js` | Credential auth + cookie session |
| `routes/promptifyRoutes.js` | Optimize orchestration + OTel spans |
| `routes/generateRoutes.js` | Generate + persist + OTel attributes |
| `routes/historyRoutes.js` | History read + feedback |
| `classifierService` | Prompt quality category |
| `embeddingService` | Text → vector |
| `similarityService` | Neighbor search + metric prediction |
| `groqService` | LLM rewrite + codegen |
| `App.jsx` | Frontend orchestrator / API client |
| UI components | Presentational panels/modals around App state |

---

## 10. Potential issues

### Security

1. **Hardcoded JWT secret fallback** in `auth.js` and `authRoutes.js` if `JWT_SECRET` unset — forgeable tokens in misconfigured production.
2. **JWT also returned in JSON body** on signup/login — XSS surface if a future client stores it; cookie-only would be safer.
3. **No rate limit on auth** — brute force / signup spam.
4. **Weak passwords** — minimum length 6 only.
5. **Cross-user similarity** — other users’ prompt text and metrics leak into predictions and Groq context.
6. **Full embedding vector returned** from `/api/promptify` — large, unnecessary client payload.
7. **Raw prompts in OTel attributes** — sensitive content may leave the app boundary.
8. **Fake Google sign-in** with shared password pattern on the frontend.
9. **Logout does not revoke JWT.**
10. **10mb JSON body limit** — oversized for this API; DoS/cost risk.

### Reliability / architecture

11. **DB connect failure does not stop the server** — silent 500s later.
12. **Silent Groq/mock fallbacks** look like success and can pollute history metrics.
13. **In-memory similarity over 100 docs** — will not scale; no vector DB/index.
14. **Possible double OTel init** (`-r tracing.js` + `require('./tracing')`).
15. **No global error handler** or consistent error schema.
16. **Xenova cold start** — first embedding request can be very slow.
17. **`success` defaults to true** — biases the learning corpus.
18. **Naming drift** VibeCheck vs Promptify across packages, logs, health payload.

### Frontend

19. **God-component `App.jsx`** — all networking and domain state.
20. **Dead code:** `AuthModal.jsx`, `App.css`, some unused icon imports.
21. **`animate-spin` / `animate-pulse` used but not defined** in CSS.
22. **No responsive layout** — fixed panel widths.
23. **Prism always highlights as JavaScript.**
24. **Error handling mixes axios-shaped fields with `fetch`.**
25. **No production API base URL** — Vite proxy only works in dev.
26. **No router, tests, or typed API contracts.**

---

## 11. Improvement suggestions

Prioritized for impact vs. effort:

1. **Require `JWT_SECRET` in production** (fail fast if missing); stop returning tokens in JSON if cookie auth is the only path.
2. **Scope similarity by `userId`** (or anonymize aggregates) to fix the privacy leak.
3. **Rate-limit auth endpoints**; strengthen password validation.
4. **Fail closed or flag explicitly** when Groq/DB/embeddings fall back — do not silently store mock metrics as real runs.
5. **Remove fake Google OAuth** or replace with a real provider.
6. **Stop exporting raw prompts / full embeddings** to clients and telemetry (hash or redact).
7. **Add indexes** on `PromptHistory.userId` (+ `success`, `createdAt`); plan for vector search if history grows.
8. **Split frontend API layer** (`api/` + hooks) out of `App.jsx`; remove dead components/CSS; define missing animations.
9. **Add `VITE_API_URL` (or same-origin deploy)** for production; set a real `index.html` title.
10. **Global Express error handler**, Helmet, and auth rate limits; exit process on DB failure in production.
11. **Align naming** (VibeCheck vs Promptify) in packages, health checks, and logs.
12. **Add basic tests** for classifier, cosine similarity, and auth middleware; consider TypeScript or at least shared request/response shapes.
13. **Default `success` to `null`/unset** until the user votes, so the learning set is intentional.
14. **Preload embedding model** on server boot (or lazy-load behind a readiness probe) to avoid first-request stalls.

---

## 12. Environment & runbook (reference)

| Variable | Purpose | Default |
|----------|---------|---------|
| `GROQ_API_KEY` | Groq LLM | Missing → mock outputs |
| `MONGODB_URI` | Mongo connection | `mongodb://localhost:27017/VibeCheck` |
| `JWT_SECRET` | Sign/verify cookies | Hardcoded dev fallback |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | SigNoz OTLP | `http://localhost:4318` |
| `PORT` | Backend port | `5000` |
| `FRONTEND_ORIGIN` | CORS primary origin | `http://localhost:5173` |
| `NODE_ENV` | Cookie `secure` flag | unset |

**Typical local run**

```bash
# terminal 1
npm run start:backend   # or dev:backend

# terminal 2
npm run start:frontend  # Vite :5173
```

Copy `.env.example` → `.env` at repo root (backend loads it).

---

## 13. Standing instruction for future work

From the user’s request: **after this document exists, always use this project understanding before suggesting or modifying any code.** Prefer changes that respect the existing Express + Mongoose + React/Vite structure, the promptify → generate → feedback learning loop, and JWT cookie auth unless explicitly asked to redesign them.
