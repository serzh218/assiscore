# AssisCore Architecture

This document describes the high-level architecture of AssisCore — a browser-based AI-powered IDE for building websites, web apps, and Telegram bots through natural language conversation.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (User)                        │
│  ┌─────────────┐  ┌───────────────┐  ┌───────────────────┐ │
│  │  File Tree  │  │  Code Editor  │  │   AI Chat Panel   │ │
│  └─────────────┘  └───────────────┘  └───────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Live Preview / Telegram Bot Emulator          │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│                    Next.js Application                       │
│                   (App Router + API Routes)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   NextAuth   │  │  Billing &   │  │   i18n (next-    │  │
│  │  (Auth.js)   │  │  Token Guard │  │      intl)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└──────────┬───────────────────────────┬────────────────────────┘
           │                           │
  ┌────────▼────────┐         ┌────────▼────────┐
  │   PostgreSQL    │         │   AI Providers  │
  │  (Prisma ORM)   │         │  (via OpenRouter│
  │                 │         │  or direct SDK) │
  │ - Users         │         │                 │
  │ - Projects      │         │ - Anthropic     │
  │ - Files         │         │ - OpenAI        │
  │ - TokenTx       │         │ - Google Gemini │
  │ - Entitlements  │         │ - Groq          │
  └─────────────────┘         └────────┬────────┘
                                       │ Generated files
                              ┌────────▼────────┐
                              │   E2B Sandbox   │
                              │ (Cloud Execution│
                              │   Environment)  │
                              │                 │
                              │ - Static build  │
                              │ - Bot emulation │
                              │ - Live preview  │
                              └─────────────────┘
```

---

## Core Modules

### `app/` — Next.js Pages & Layouts

Uses the Next.js 15 App Router. Contains all pages, layouts, and route groups. Server components are the default; client components are opted in with `"use client"`.

Key routes:
- `/` — Landing page
- `/studio/[projectId]` — Main project workspace (editor + preview + chat)
- `/api/*` — REST API endpoints

### `server/` — Server-Only Business Logic

Contains code that must never run in the browser. Strict boundary enforced by TypeScript path aliases.

- `server/ai/` — LLM integration, prompt construction, file bundle validation
- `server/billing/` — Plan definitions, entitlement checks, token transaction logic
- `server/guards/` — Rate limiting and pre-flight checks for API routes

### `lib/` — Isomorphic Utilities

Shared code that can run both on server and client:
- `lib/ai/` — Prompt templates, output parsers
- `lib/tokens.ts` — Token cost calculation
- `lib/limits.ts` — Plan limit definitions

### `components/` — React Components

- `components/editor/` — File tree, code editor (Monaco-based)
- `components/preview/` — Live preview iframe, Telegram bot emulator
- `components/ui/` — Base UI primitives (shadcn/ui + Radix UI)

### `prisma/` — Database Schema

PostgreSQL via Prisma ORM. Key models:

| Model | Description |
|---|---|
| `User` | Authenticated users |
| `Project` | A user's project with its type and metadata |
| `ProjectFile` | Individual files within a project |
| `Entitlement` | A user's subscription plan details |
| `TokenTransaction` | Immutable audit log of all token spend/refund events |

---

## AI Code Generation Pipeline

```
User prompt
    │
    ▼
Prompt builder (lib/ai/)
    │  Selects template, formats context
    ▼
LLM call (server/ai/)
    │  Returns FileBundle JSON
    ▼
Schema validation (Zod)
    │  Validates file structure and content
    ▼
Protected file check
    │  Blocks writes to .env, Prisma migrations
    ▼
Project file update (Prisma)
    │
    ▼
E2B sandbox build
    │  Installs deps, builds static output
    ▼
Preview URL served to client
    │
    ▼
User sees changes in Live Preview
```

---

## Authentication & Authorization

- **NextAuth.js** handles session management
- Supports GitHub OAuth and email/password
- All API routes are protected by session middleware
- Billing guards (`server/guards/limits.ts`) check token balances before any AI call

---

## Token & Billing System

Every AI operation costs tokens. The system ensures:
- Atomic debit/credit via PostgreSQL transactions (no negative balance possible)
- Full audit trail in `TokenTransaction` table
- Monthly quota reset via `POST /api/billing/cron/reset` (runs on a schedule in production)

Plans are defined in `server/billing/plans.ts`.
Token costs per operation are defined in `lib/limits.ts`.

---

## Observability

- **Pino** — Structured JSON logging
- **OpenTelemetry** — Distributed tracing (exportable to any OTLP-compatible backend)
- **Prometheus** — Metrics via `prom-client`

---

## Deployment

See [deploy.md](deploy.md) for full deployment instructions.

The recommended production setup:
- **Fly.io** (configured via `fly.toml`)
- **PostgreSQL** — managed instance (e.g., Supabase, Neon, Railway)
- **E2B** — cloud sandbox API
