# Deployment Guide

This guide covers how to deploy AssisCore to production.

---

## Recommended Stack

| Component | Recommended Service |
|---|---|
| **Application** | [Fly.io](https://fly.io) (config included in `fly.toml`) |
| **Database** | [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app) |
| **Sandboxes** | [E2B](https://e2b.dev) — required for code execution |

---

## Environment Variables (Production)

Copy `.env.example` and fill in all required values:

```bash
# Required
E2B_API_KEY=...
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<strong random secret>
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# At least one AI provider
ANTHROPIC_API_KEY=...
# or
OPENROUTER_API_KEY=...
# or
OPENAI_API_KEY=...

# Optional
FIRECRAWL_API_KEY=...
FIGMA_PERSONAL_ACCESS_TOKEN=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
```

---

## Deploy to Fly.io

### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. Create the app

```bash
fly launch --no-deploy
```

### 3. Set secrets

```bash
fly secrets set \
  DATABASE_URL="postgresql://..." \
  E2B_API_KEY="..." \
  NEXTAUTH_SECRET="..." \
  NEXTAUTH_URL="https://your-app.fly.dev" \
  ANTHROPIC_API_KEY="..."
  # ... add all other required keys
```

### 4. Deploy

```bash
fly deploy
```

---

## Database Setup (Production)

Run migrations against your production database:

```bash
# Set DATABASE_URL to your production database
pnpm prisma:migrate:deploy
```

> ⚠️ **Never** use `prisma db push` in production — always use `prisma migrate deploy`.

---

## Monthly Quota Reset (Cron)

Set up a daily cron job to call:

```
POST /api/billing/cron/reset
```

On Fly.io you can use Fly Machines cron. Alternatively, use a service like [Upstash](https://upstash.com/qstash) or GitHub Actions scheduled workflow.

---

## Docker (Self-Hosting)

```bash
# Build and start
docker compose up --build -d

# View logs
docker compose logs -f app
```

Make sure your `.env` is properly configured before running.

---

## Health Check

After deploying, verify the app is running:

```bash
curl https://your-domain.com/api/health
# Expected: { "status": "ok" }
```
