# VibeCheck

**A self-learning prompt optimization layer for AI coding assistants — built with OpenTelemetry and SigNoz.**

Built for the [WeMakeDevs "Agents of SigNoz" Hackathon](https://www.wemakedevs.org/hackathons/signoz) — Track 01: AI & Agent Observability.

---

## Table of Contents
- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [How It Works — End-to-End Flow](#how-it-works--end-to-end-flow)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [SigNoz Usage](#signoz-usage)
- [Getting Started](#getting-started)
- [Security](#security)
- [What We Deliberately Left Out](#what-we-deliberately-left-out)
- [Future Scope](#future-scope)

---

## Problem Statement

AI-assisted "vibe coding" — building software by prompting an AI assistant instead of writing code by hand — has become the default way many developers work. But there's a hidden cost nobody talks about: **prompt quality directly determines token usage, cost, and speed**, and most people have no idea how good or bad their prompts actually are until the bill arrives or they hit a usage limit.

A vague prompt like *"build me an app"* forces the model to guess, over-generate, and ask clarifying questions — burning far more tokens than a well-scoped prompt that specifies the stack, scope, and expected output. Nobody tells you this in the moment. There's no feedback loop. You just find out later that you were 3x less efficient than you needed to be, with no way to know why or fix it going forward.

## Our Solution

**VibeCheck** is a prompt-to-code interface that sits between the user and an LLM, and does three things no typical AI coding tool does:

1. **Predicts cost before you run a prompt** — using real historical data, not guesswork
2. **Suggests better versions of your prompt** — three optimized rewrites, each with a predicted token/cost estimate
3. **Traces and measures everything that actually happens** — every prompt's real token usage, cost, latency, and success is captured end-to-end with OpenTelemetry and visualized in SigNoz

The system gets smarter the more it's used — not through a trained neural network, but through **retrieval over real historical outcomes**: every prompt run is stored with its actual cost and success, and future predictions are grounded in the closest real past examples via embedding similarity search. This keeps the system fully explainable — every prediction can be traced back to the specific past prompts it was based on.

## Key Features
- **VibeCheck (Optimize Prompt)** — one click classifies your prompt, searches historical data, and returns 3 rewritten versions with predicted cost/token badges
- **Direct submission** — skip optimization entirely and submit your original prompt if you prefer
- **Live trace visibility** — every generation shows its SigNoz trace ID directly in the UI
- **Success / Needs Work feedback** — a lightweight signal that tells the learning loop whether a prompt's output actually worked, so cheap-but-broken prompts don't get recommended
- **Prompt history** — a per-user log of past prompts, costs, and outcomes
- **Live telemetry counters** — public-facing stats on prompts optimized and estimated cost savings
- **Secure by default** — hashed passwords, httpOnly JWT cookies, rate-limited AI endpoints, input validation

## How It Works — End-to-End Flow

```
1. User writes a raw prompt
2. (Optional) Clicks "VibeCheck" →
     → Classify prompt (vague / underspecified / well-scoped)
     → Generate a local embedding of the prompt
     → Search MongoDB for similar past prompts that succeeded
     → Use their real recorded cost/tokens as a prediction baseline
     → Ask the LLM for 3 rewritten versions, each tagged with predicted cost/tokens
3. User picks a suggestion (auto-fills the prompt box) or edits it further —
   or skips this step and submits the original prompt directly
4. Prompt is sent to the LLM to generate code
5. The entire call is wrapped in an OpenTelemetry span (real tokens, cost,
   latency captured)
6. Result is stored in MongoDB — this becomes a new data point for the next
   similarity search
7. Trace is exported to SigNoz, viewable as a full multi-step waterfall
8. User marks the output as "Success" or "Needs Work" — this feeds directly
   back into what counts as a good example for future predictions
```

## Architecture

**Frontend (React)** ↔ **Backend (Node.js/Express)** ↔ **MongoDB** (prompt history + embeddings)

The backend also calls the **LLM** (for both prompt rewriting and code generation) and is instrumented with the **OpenTelemetry SDK**, which exports traces to a locally running **SigNoz** instance (installed via Foundry).

```
 ┌───────────┐      ┌────────────┐      ┌─────────┐
 │ Frontend  │─────▶│  Backend   │─────▶│   LLM   │
 │ (React)   │◀─────│ (Node/Exp) │◀─────│ (Groq)  │
 └───────────┘      └─────┬──────┘      └─────────┘
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
           ┌───────────┐    ┌─────────────┐
           │  MongoDB  │    │ OTel SDK →  │
           │ (history) │    │  SigNoz     │
           └───────────┘    └─────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Prism.js for syntax highlighting |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (httpOnly cookies), bcrypt password hashing |
| LLM | Groq API (Llama 3.3 70B) — prompt rewriting and code generation |
| Embeddings | Local sentence embeddings via Xenova Transformers.js (384-dim, all-MiniLM-L6-v2) — no external API call required |
| Observability | OpenTelemetry SDK → SigNoz (installed via Foundry) |
| Security middleware | express-rate-limit, input validation, CORS restricted to frontend origin |

## SigNoz Usage

This project uses SigNoz as more than a data sink — every major signal type and feature is used directly:

- **Traces** — every prompt run is a full multi-step trace: `classification` → `embedding` → `similarity_search` → `rewrite_generation` → code generation, all as nested spans under one parent trace, tagged with custom attributes (`prompt.category`, `tokens.input`, `tokens.output`, `cost.usd`, `latency.ms`)
- **Logs** — structured log lines correlated to each trace ID (e.g. `prompt executed category=vague cost=0.045 success=true`)
- **Dashboards** — built directly in the SigNoz UI: cost-per-category comparison, cost trend over time, predicted vs actual cost
- **Alerts** — a configured alert rule that fires when a single prompt's cost exceeds a set threshold
- **Query Builder** — used to filter and group spans by `prompt.category` and cost
- **MCP Server** — the SigNoz MCP server is enabled via `casting.yaml` and was queried directly (e.g. "what's the average cost per prompt category") to demonstrate conversational access to telemetry data

See the [`/signoz`](./signoz) folder for exported dashboard JSON, and the screenshots below for visual proof of each SigNoz feature in use.



## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- Groq API key
- SigNoz installed locally via Foundry (see `casting.yaml` in repo root)

### Setup

```bash
# 1. Start SigNoz (already configured via Foundry)
foundryctl cast -f casting.yaml

# 2. Clone and install
git clone <repo-url>
cd vibecheck

# 3. Backend
cd backend
cp .env.example .env   # fill in your keys
npm install
npm run dev

# 4. Frontend
cd ../frontend
npm install
npm run dev
```

### Environment Variables (`.env`)

```
GROQ_API_KEY=
MONGODB_URI=
JWT_SECRET=
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
PORT=5000
```

See [`SETUP.md`](./SETUP.md) for detailed setup steps and [`TESTING.md`](./TESTING.md) for a manual verification checklist.

## Security

- Passwords hashed with bcrypt, never stored or logged in plaintext
- Sessions managed via httpOnly JWT cookies (not localStorage) to reduce XSS exposure
- Rate limiting on all AI-calling endpoints to prevent cost abuse
- Input validation and sanitization on all API routes
- CORS restricted to the frontend's origin only
- All secrets loaded from environment variables, never hardcoded

## What We Deliberately Left Out

Given the hackathon's time constraints, we made conscious scope decisions rather than half-building extra features:

- **No trained neural network** — predictions come from embedding similarity search over real historical outcomes, which is more explainable and required no dataset curation upfront
- **No code execution sandbox** — success/failure is captured via user feedback (Success / Needs Work) rather than actually running generated code
- **No real multi-file project system** — the left panel is a lightweight static file list for visual context, not a full file manager
- **No OAuth beyond Google Sign-In** — kept auth simple and secure rather than building a full identity system

## Future Scope

- Add OTel **metrics** (counters/histograms) alongside traces for richer SigNoz signal coverage
- Real code-execution sandboxing to make the success/failure signal fully automated
- Team/workspace support for shared prompt history and cost accountability
- Expand the classifier from heuristic rules to a lightweight trained model once enough real usage data has accumulated

*This README is intended as the first document a judge reads. For the full development journey — problem discovery, design decisions, and what we learned along the way — see our [Medium write-up](#).*
