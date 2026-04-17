# Changelog

All notable changes to VideoToSMPL are documented here. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [SemVer](https://semver.org/).

## [Unreleased]

### Planned for v0.2
- WBC rollout module (NVIDIA Groot integration in `core/wbc`).
- Notebook 04 wired up end-to-end.
- `web/app/playground/` page with reference-vs-simulated comparison.

## [0.1.0] — 2026-04-17

Initial alpha. Covers the full pipeline up to (and excluding) WBC simulation.

### Added
- `core` Python package: `extraction` (GVHMR), `retargeting` (GMR), `sanitize` (velocity/limits/grounding), `render` (MuJoCo), `wbc` (placeholder).
- Four Colab notebooks: video→SMPL, SMPL→G1, full pipeline, WBC placeholder.
- Local install + run scripts (`install_local.sh`, `run_local.sh`, `healthcheck.py`).
- Minimal Gradio GUI wrapping the core modules.
- Next.js static site: landing, demos, docs, playground placeholder.
- GitHub Actions: deploy-pages, test-notebooks, lint, release, CodeQL.
- Privacy-friendly analytics: Plausible / Cloudflare / Umami (all opt-in via env vars).
- Docs: Quickstart, Local setup, Troubleshooting (12 entries), Architecture, WBC integration spec, Contributing, Security.
