## Summary

What changes, in one sentence.

## Why

Problem being solved or goal being reached. Link an issue if there is one: `Closes #…`.

## Changes

- …
- …

## Scope

- [ ] `core/` (Python)
- [ ] `web/` (site)
- [ ] `notebooks/`
- [ ] `scripts/` / tooling
- [ ] docs
- [ ] CI / `.github/`

## Checks

- [ ] `ruff check .` clean
- [ ] `mypy core` clean
- [ ] `npm run lint && npm run typecheck` clean (if web touched)
- [ ] `python scripts/build_notebooks.py --validate` (if notebooks touched)
- [ ] `CHANGELOG.md` updated under `## [Unreleased]` (if user-visible)

## Screenshots (if UI)

…
