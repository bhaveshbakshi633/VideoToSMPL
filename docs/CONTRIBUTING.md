# Contributing

Thanks for the interest. This project is actively developed — issues and PRs welcome.

## Dev setup

```bash
git clone https://github.com/bhaveshbakshi633/VideoToSMPL.git
cd VideoToSMPL
bash scripts/install_local.sh
```

Web dev server:

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

## Code style

### Python (`core/`)

- **Ruff** for lint + format: `ruff check . && ruff format .`
- **MyPy** for types (strict-ish): `mypy core`
- **No wildcard imports.** Use `from module import a, b`.
- **Type hints** on all public functions.
- **No prints in library code** — use `logging`. CLIs and scripts can print.
- **Heavy deps import inside the function**, not at module top — so `import core` stays cheap.

### Web (`web/`)

- **ESLint + Prettier**: `npm run lint && npm run format:check`
- **TypeScript strict mode**: `npm run typecheck`
- Server components by default; only `"use client"` when genuinely needed.
- Tailwind utility classes, no inline styles.

## Commits

Conventional commits:

- `feat:` new feature
- `fix:` bug fix
- `docs:` docs only
- `refactor:` restructure, no behavior change
- `chore:` tooling / CI
- `test:` tests only

Branch per feature: `feat/<short-name>`. Don't push to `main` directly.

## PR flow

1. Branch off `main`.
2. Run `ruff`, `mypy`, `npm run lint`, `npm run typecheck` locally.
3. `python scripts/build_notebooks.py --validate` before committing notebooks.
4. Push, open PR with the template filled in.
5. CI must be green.

## Running tests

```bash
# Python
pytest

# Web
cd web && npm run typecheck && npm run lint

# Notebook validation
python scripts/build_notebooks.py --validate
```

## Adding a troubleshooting entry

User-facing troubleshooting is in **two places** and must match:

1. `docs/TROUBLESHOOTING.md` — canonical version (long-form).
2. `web/content/troubleshooting.ts` — top-N shown on landing page.

Add to both, or add a test so we can de-duplicate later.

## Release process

1. Bump version in `pyproject.toml` AND `web/lib/site.ts` AND `web/package.json`.
2. Update `CHANGELOG.md` under a new `## [x.y.z] — YYYY-MM-DD` heading.
3. Commit `chore: release vX.Y.Z`.
4. Tag `vX.Y.Z`, push tags.
5. `release.yml` GitHub Action publishes the release and deploys the web.

## Code of conduct

Be respectful, assume good faith, no personal attacks. When in doubt, err on the side of kindness.
