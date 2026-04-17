---
name: Bug report
about: Something in the pipeline broke.
title: "bug: "
labels: ["bug"]
---

## What happened

A clear, one-line description.

## What you expected

What should have happened instead.

## Repro steps

1. …
2. …
3. …

## Environment

- OS: (e.g. Ubuntu 22.04, macOS 14.2)
- GPU: (e.g. RTX A2000 12 GB — or "Colab T4")
- CUDA: `nvidia-smi | head -3`
- Python: `python --version`
- Install path: local / Colab

## `scripts/healthcheck.py` output

```
paste here
```

## Stderr / traceback

```
paste here
```

## Input video (if relevant)

`ffprobe -v error -show_format -show_streams your_video.mp4` output.
