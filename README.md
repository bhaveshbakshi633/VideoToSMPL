<div align="center">

# VideoToSMPL

**Turn any video into humanoid motion.**

Open pipeline: RGB video → SMPL parameters → Unitree G1 joint trajectories.
Runs on a free Colab GPU or your own machine.

[Website](https://bhaveshbakshi633.github.io/VideoToSMPL) · [Quickstart](./docs/QUICKSTART.md) · [Troubleshooting](./docs/TROUBLESHOOTING.md) · [Architecture](./docs/ARCHITECTURE.md)

[![Deploy](https://github.com/bhaveshbakshi633/VideoToSMPL/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/bhaveshbakshi633/VideoToSMPL/actions/workflows/deploy-pages.yml)
[![Lint](https://github.com/bhaveshbakshi633/VideoToSMPL/actions/workflows/lint.yml/badge.svg)](https://github.com/bhaveshbakshi633/VideoToSMPL/actions/workflows/lint.yml)
[![CodeQL](https://github.com/bhaveshbakshi633/VideoToSMPL/actions/workflows/codeql.yml/badge.svg)](https://github.com/bhaveshbakshi633/VideoToSMPL/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

</div>

---

## Try it in 5 minutes

Click the badge → Colab opens with a free T4 GPU → upload a video → download the SMPL params.

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/bhaveshbakshi633/VideoToSMPL/blob/main/notebooks/01_video_to_smpl.ipynb)

Or jump straight to the [end-to-end notebook](https://colab.research.google.com/github/bhaveshbakshi633/VideoToSMPL/blob/main/notebooks/03_full_pipeline.ipynb) — video in, G1 PKL + preview MP4 out.

## What's inside

```
VideoToSMPL/
├── core/                  # Python pipeline modules
│   ├── extraction/        # GVHMR wrapper (video → SMPL)
│   ├── retargeting/       # GMR wrapper (SMPL → G1)
│   ├── sanitize/          # velocity limits, joint clamping, foot grounding
│   ├── render/            # headless MuJoCo MP4 preview
│   └── wbc/               # NVIDIA Groot WBC plugin point (v0.2)
├── notebooks/             # Colab notebooks (self-contained, zero install)
│   ├── 01_video_to_smpl.ipynb
│   ├── 02_smpl_to_g1.ipynb
│   ├── 03_full_pipeline.ipynb
│   └── 04_wbc_simulation.ipynb    # placeholder for v0.2
├── scripts/               # install_local.sh, run_local.sh, healthcheck.py
├── web/                   # Next.js site (landing + docs, static → GitHub Pages)
├── docs/                  # Quickstart, local setup, troubleshooting, architecture
└── .github/               # CI: deploy, lint, notebook validation, CodeQL
```

## Two ways to run it

| | **Colab** | **Local** |
|---|---|---|
| Setup time | 0 | ~30 min |
| GPU | free T4 | your own (≥ 8 GB VRAM) |
| Iteration speed | slow upload/download | fast |
| Works offline | no | yes |
| Multi-video batch | limited (session timeout) | unlimited |

Colab first, local second once you're committed.

## Roadmap

- **v0.1** (now) — video → SMPL → G1, full sanitization, MuJoCo preview, Colab + local.
- **v0.2** — NVIDIA Groot WBC integration in `core/wbc`, notebook 04 wired up, playground page live.
- **v0.3** — multi-person support, batch CLI, Docker image.

## Built on

- [GVHMR](https://github.com/zju3dv/GVHMR) — temporally consistent SMPL extraction (SIGGRAPH Asia 2024)
- [GMR](https://github.com/generalroboticslab/GMR) — IK-based retargeting with MuJoCo
- [MuJoCo](https://mujoco.org) — physics + rendering
- [Next.js](https://nextjs.org), [Tailwind](https://tailwindcss.com), [Shiki](https://shiki.style) — the website

Each has its own license — see their repos. This project is MIT.

## Contributing

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for dev setup, code style, and the release process. Issues with full repro + healthcheck output are gold.

## License

[MIT](./LICENSE). Do what you want, but be nice.
