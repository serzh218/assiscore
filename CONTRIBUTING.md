# 🤝 Contributing to AssisCore

Thank you for your interest in contributing to AssisCore! This document will guide you through the process of setting up your development environment and submitting contributions.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and constructive environment. We welcome contributors of all backgrounds and experience levels.

---

## 🚀 Getting Started

### 1. Fork and clone

```bash
# Fork via GitHub UI, then:
git clone https://github.com/<your-username>/assiscore.git
cd assiscore
```

### 2. Set up your environment

Follow the [local development guide in README.md](README.md#️-local-development).

**Minimum required:**
- Node.js ≥ 20
- pnpm ≥ 8
- Docker (for local PostgreSQL)
- At least one AI provider API key (e.g., `OPENROUTER_API_KEY`)

### 3. Create a branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

---

## 🔄 Development Workflow

```bash
# Start local database
docker compose up -d db

# Apply migrations
pnpm prisma:migrate && pnpm prisma:gen

# Start dev server with hot reload
pnpm dev

# Before committing — run full quality check
pnpm dx:check
```

The `pnpm dx:check` command runs in sequence:
1. `prisma generate` — regenerate the Prisma client
2. `tsc --noEmit` — TypeScript type check
3. `eslint` — lint check
4. `vitest run` — unit tests
5. `next build` — production build check

**All checks must pass before opening a PR.**

---

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Code formatting, no logic change |
| `refactor` | Code restructuring, no behavior change |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates |
| `perf` | Performance improvements |

**Examples:**

```bash
feat(editor): add unified diff preview before applying AI changes
fix(billing): prevent negative token balance on concurrent requests
docs: update README with Docker setup instructions
test(ai): add unit tests for FileBundle validator
```

---

## 🎨 Code Style

- **TypeScript** everywhere — no plain JavaScript
- **Prettier** for formatting (config in `.prettierrc`)
- **ESLint** for linting (config in `.eslintrc.cjs`)
- **Tailwind CSS** for styling — avoid inline styles

Formatting is enforced on commit via husky + lint-staged. Run manually:

```bash
pnpm format      # auto-format all files
pnpm lint        # check for lint errors
```

**Key conventions:**
- Prefer `async/await` over `.then()` chains
- Use Zod schemas for all external data validation
- Server-only code goes in `server/` — never import server modules from client components
- Use `lib/` for shared, isomorphic utilities

---

## 🧪 Testing

Tests live in `tests/` and `test/`:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

We use [Vitest](https://vitest.dev/) with jsdom for DOM testing.

**What to test:**
- Business logic in `lib/` and `server/`
- AI output validators and parsers
- Utility functions with complex logic
- API route handlers (integration tests)

---

## 📬 Submitting a Pull Request

1. **Ensure your branch is up to date** with `main`
2. **All quality checks pass**: `pnpm dx:check`
3. **Write a clear PR description** using the PR template
4. **Link related issues** (e.g., `Closes #42`)
5. **Keep PRs focused** — one feature or fix per PR

PRs need at least **one review approval** and a green CI status before merging.

---

## 🐛 Reporting Bugs

Use the [bug report template](https://github.com/serzh218/assiscore/issues/new?template=bug_report.md).

Please include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)
- Relevant logs or screenshots

---

## 💡 Requesting Features

Use the [feature request template](https://github.com/serzh218/assiscore/issues/new?template=feature_request.md).

Check the [ROADMAP.md](ROADMAP.md) first — your idea might already be planned!

---

## ❓ Questions?

Open a [GitHub Discussion](https://github.com/serzh218/assiscore/discussions) or start a conversation in the Issues tab.

---

Thank you for helping make AssisCore better! 🚀
