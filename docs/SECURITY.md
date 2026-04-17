# Security

## Scope

This is a research project — it processes video files and produces motion data. It is **not** a web service and does not accept remote input.

- No authentication/authorization code.
- No network endpoints in the core library.
- The local Gradio GUI listens on `localhost:7860` by default; `--share` opens a temporary public tunnel via Gradio's service. Use it at your own discretion.
- The static website on GitHub Pages is read-only HTML/CSS/JS.

## Reporting a vulnerability

If you find a security issue, please do **not** file a public issue. Instead:

1. Email the maintainer (see the GitHub profile).
2. Include: a clear description, reproducer steps, and what you'd expect instead.
3. Allow 7 days for a first response before disclosure.

## What this project does NOT do

- Upload your videos anywhere. Colab processing happens in your own Colab sandbox.
- Phone home. No telemetry is sent from the pipeline code.
- Store credentials. No API keys, tokens, or secrets are expected or stored.
- Privacy-friendly analytics (Plausible/Cloudflare) are **optional** and only run on the static website — never in the pipeline.

## Supply-chain posture

- `pyproject.toml` pins major versions; specific CUDA builds are pinned in install scripts.
- GitHub **Dependabot** (see `.github/dependabot.yml`) opens weekly PRs for outdated deps.
- GitHub **CodeQL** (see `.github/workflows/codeql.yml`) scans every PR.
- Notebooks clone only pinned public repos (`zju3dv/GVHMR`, `generalroboticslab/GMR`). If either is compromised upstream, pin to a known-good commit.

## Known limitations

- The Gradio GUI runs arbitrary Python — only expose it on trusted networks.
- MuJoCo loads XML files from disk; don't pass attacker-controlled XML paths into the renderer.
- Pickle files are used internally. **Do not load untrusted PKLs** — standard pickle caveats apply.
