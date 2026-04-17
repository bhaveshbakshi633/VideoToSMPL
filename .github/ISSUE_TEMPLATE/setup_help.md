---
name: Setup help
about: Install / environment / weights / conda trouble.
title: "setup: "
labels: ["setup"]
---

## What you tried

Paste the exact command(s).

## What broke

First error message from the install script or healthcheck.

## `scripts/healthcheck.py` output

```
paste here
```

## System

- OS + arch
- GPU (`nvidia-smi` full output)
- Conda version (`conda --version`)
- Disk space (`df -h ~`)

## Checklist

- [ ] I ran `bash scripts/install_local.sh` to completion (or shared the failure point)
- [ ] I read [docs/TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md) top-to-bottom
- [ ] I'm not mixing conda envs
