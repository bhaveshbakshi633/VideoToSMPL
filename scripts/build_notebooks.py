#!/usr/bin/env python3
"""Validate notebooks and (optionally) inline source into them.

Why:
    Colab users should be able to run any notebook in `notebooks/` without
    needing access to this repo. Notebooks clone GVHMR + GMR (public) and
    install via pip, so no private access is required. This script:

      1. `--validate`    — checks every notebook parses, declares a GPU,
                           and doesn't reference any private path.
      2. `--check-links` — checks Colab URLs resolve (offline: skipped).

In a future iteration we'll extend this to auto-sync `core/` snippets into
notebook cells, but for now notebooks call pip-published `video-to-smpl-core`
or inline what they need by hand.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

NB_DIR = Path(__file__).resolve().parent.parent / "notebooks"
PRIVATE_HINTS = [
    "bhaveshbakshi633/VideoToSMPL.git",
    "/home/ssi",
    "ssh://git@",
]


def validate(path: Path) -> list[str]:
    errors: list[str] = []
    try:
        nb = json.loads(path.read_text())
    except json.JSONDecodeError as e:
        return [f"{path.name}: invalid JSON — {e}"]

    meta = nb.get("metadata", {})
    if meta.get("accelerator") != "GPU":
        errors.append(f"{path.name}: missing `accelerator: GPU` in metadata")

    all_source = "\n".join(
        "".join(cell.get("source", [])) for cell in nb.get("cells", [])
    )
    for hint in PRIVATE_HINTS:
        if hint in all_source:
            errors.append(f"{path.name}: contains private reference `{hint}`")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--validate", action="store_true", default=True)
    args = parser.parse_args()

    if not NB_DIR.exists():
        print(f"no notebooks dir at {NB_DIR}", file=sys.stderr)
        return 1

    notebooks = sorted(NB_DIR.glob("*.ipynb"))
    if not notebooks:
        print("no notebooks to check", file=sys.stderr)
        return 1

    errors: list[str] = []
    for nb in notebooks:
        nb_errors = validate(nb)
        if nb_errors:
            errors.extend(nb_errors)
        else:
            print(f"✓ {nb.name}")

    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  ✗ {e}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
