# Deployment

## Local production-like run

1. Build and start containers:
   ```bash
   docker compose up --build
   ```
2. Open [http://localhost:3000/ru](http://localhost:3000/ru).

## Preview deployments from pull requests

- Workflow `.github/workflows/preview.yml` builds the image and deploys it to Fly.io.
- Every pull request gets its own app `assiscore-pr-<number>` with URL `https://assiscore-pr-<number>.fly.dev`.
- Migrations are applied via `prisma migrate deploy` and secrets are set from repository variables.
- The preview app is destroyed automatically when the pull request is closed.
