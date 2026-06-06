# 🗺️ AssisCore Roadmap

This document outlines the planned development direction for AssisCore. It is intentionally public — we believe transparency builds trust, and we welcome community input on priorities.

> **Note:** This roadmap is aspirational, not a binding commitment. Priorities may shift based on community feedback and contributor interest.

---

## ✅ Already Shipped (v0.1)

- [x] AI-powered project generation (Website, Web App, Telegram Bot types)
- [x] Live preview via E2B sandboxes
- [x] Telegram bot emulator
- [x] Integrated code editor with file tree
- [x] Conversational iteration via AI chat
- [x] Unified diff preview before applying AI changes
- [x] GitHub OAuth + email/password authentication
- [x] Token-based usage accounting (Free & PRO tiers)
- [x] Figma design import
- [x] GitHub push / ZIP export
- [x] Docker & Docker Compose setup
- [x] CI pipeline (typecheck → lint → tests → build)
- [x] i18n support (next-intl)
- [x] OpenTelemetry observability

---

## 🔨 In Progress (v0.2)

- [ ] **Multi-file diff viewer** — See all AI-proposed file changes at once before applying ([#help-wanted](#))
- [ ] **Undo/Redo history** — Step back through AI-applied changes
- [ ] **Mobile-friendly studio layout** — Responsive design for tablet/phone access
- [ ] **Project templates gallery** — Curated starter templates users can fork

---

## 🎯 Short-Term Goals (v0.3)

- [ ] **Collaborative editing** — Real-time multi-user editing on a single project
- [ ] **Plugin/provider system** — Allow users to plug in their own LLM providers and API keys
- [ ] **Persistent project versioning** — Git-like snapshot history for projects
- [ ] **Custom domain deployment** — One-click deploy to Vercel, Netlify, Railway
- [ ] **Component library integration** — Generate with shadcn/ui, MUI, or Chakra UI

---

## 💡 Medium-Term Goals (v0.4+)

- [ ] **VS Code extension** — Sync AssisCore projects with local VS Code workspace
- [ ] **Voice input** — Describe features by speaking instead of typing
- [ ] **AI code review** — Automatic code quality suggestions on every change
- [ ] **Import from GitHub repo** — Open any existing GitHub repository in AssisCore
- [ ] **Multi-language support** — Generate projects in Python (Flask/FastAPI), Go, etc.
- [ ] **Database schema designer** — Visual Prisma schema editor with AI assistance

---

## 🌟 Long-Term Vision

AssisCore aims to become a **universal AI development environment** — where anyone can build, iterate, and ship production-grade software through natural conversation. The long-term vision includes:

- **Team workspaces** — Organizations can self-host AssisCore as an internal development platform
- **AI agent pipelines** — Compose multiple AI agents for complex, multi-step development tasks
- **No-code ↔ pro-code continuum** — Seamlessly switch between visual editing and raw code
- **Open plugin marketplace** — Community-built templates, providers, and integrations

---

## 💬 How to Influence the Roadmap

We prioritize based on:
1. Community upvotes on [GitHub Issues](https://github.com/serzh218/assiscore/issues)
2. Pull request activity
3. Real-world usage patterns

**Have an idea?** [Open a feature request](https://github.com/serzh218/assiscore/issues/new?template=feature_request.md) — we read every one.

---

## 🤝 Want to Help Build This?

Check out [CONTRIBUTING.md](CONTRIBUTING.md) to get started. Items marked with `[#help-wanted]` above are great entry points for contributors.
