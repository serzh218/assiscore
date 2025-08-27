# Branch Protection

To enable branch protection for `main`:

1. Go to **Settings → Branches** in the repository.
2. Add a rule for `main`.
3. Require status checks:
   - `typecheck`
   - `lint`
   - `test`
   - `coverage-diff`
   - `build`
   - `report`
4. Require 1–2 approvals before merging.
5. Disallow direct pushes to `main`.

With these settings, merges without passing checks are blocked.
