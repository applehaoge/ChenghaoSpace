export const KIDS_CAPTURE_HELPER = `\"\"\"KidsCoding visualization helper for pygame.

Usage:
    import kids_capture
    kids_capture.send_frame(pygame.display.get_surface())

Frames are sent back to the runner so the web UI can display them.
\"\"\"

from __future__ import annotations

import base64
import json
import os
import time
import uuid
from typing import Any

try:
    import pygame
except ImportError:  # pragma: no cover - pygame may not be installed when helper is unused
    pygame = None  # type: ignore

VIZ_DIR = os.environ.get("KIDS_VIZ_DIR")


def _get_surface_bytes(surface: "pygame.Surface") -> bytes:
    return pygame.image.tostring(surface, "RGB")


def _write_payload(payload: dict[str, Any]) -> None:
    if VIZ_DIR is None:
        return
    os.makedirs(VIZ_DIR, exist_ok=True)
    tmp_path = os.path.join(VIZ_DIR, f"{uuid.uuid4().hex}.json.tmp")
    final_path = tmp_path[:-4]
    with open(tmp_path, "w", encoding="utf-8") as tmp_file:
        json.dump(payload, tmp_file)
    os.replace(tmp_path, final_path)


def send_frame(surface: "pygame.Surface") -> bool:
    \"\"\"Encode the given pygame surface and hand it back to the runner.\"\"\"
    if VIZ_DIR is None or pygame is None or surface is None:
        return False

    width, height = surface.get_size()
    pixel_bytes = _get_surface_bytes(surface)
    payload = {
        "type": "frame",
        "width": width,
        "height": height,
        "format": "RGB",
        "timestamp": time.time(),
        "data": base64.b64encode(pixel_bytes).decode("ascii"),
    }
    _write_payload(payload)
    return True


def poll_events():
    \"\"\"Placeholder for future interactive event support.\"\"\"
    return []
`;
