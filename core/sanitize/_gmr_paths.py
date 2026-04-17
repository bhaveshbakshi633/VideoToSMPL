"""Resolve robot XML paths from GMR without importing the full package at module load."""

from __future__ import annotations

import os
import sys
from pathlib import Path


def robot_xml_path(robot: str = "unitree_g1") -> Path:
    """Return the MuJoCo XML for `robot`, loading GMR's ROBOT_XML_DICT lazily."""
    gmr = Path(os.environ.get("GMR_PATH", "~/Projects/IL/GMR")).expanduser().resolve()
    if str(gmr) not in sys.path:
        sys.path.insert(0, str(gmr))
    from general_motion_retargeting import ROBOT_XML_DICT  # type: ignore[import-not-found]

    if robot not in ROBOT_XML_DICT:
        raise KeyError(f"Unknown robot '{robot}'. Available: {sorted(ROBOT_XML_DICT)}")
    return Path(ROBOT_XML_DICT[robot])
