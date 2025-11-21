export const KIDS_AUDIO_HELPER = `"""KidsCoding audio helper for streaming PCM chunks.

Usage:
    import kids_audio
    kids_audio.send_audio_chunk(raw_bytes, sample_rate=44100, channels=2)

Audio chunks are sent back to the runner so the web UI can play them.
"""

from __future__ import annotations

import base64
import json
import os
import time
import uuid
from typing import Any

AUDIO_DIR = os.environ.get("KIDS_AUDIO_DIR")
_SEQ_COUNTER = 0


def _next_seq(seq: int | None) -> int:
    global _SEQ_COUNTER
    if seq is not None:
        return int(seq)
    _SEQ_COUNTER += 1
    return _SEQ_COUNTER


def _build_paths(audio_dir: str, seq_value: int | None) -> tuple[str, str]:
    base_name = f"{seq_value:012d}" if seq_value is not None else uuid.uuid4().hex
    tmp_path = os.path.join(audio_dir, f"{base_name}.json.tmp")
    final_path = tmp_path[:-4]
    return tmp_path, final_path


def _infer_duration_ms(data_length: int, sample_rate: int, channels: int) -> float | None:
    if sample_rate <= 0 or channels <= 0:
        return None
    bytes_per_sample = 2  # pcm_s16le uses 16-bit per channel
    frame_count = data_length / (channels * bytes_per_sample)
    return (frame_count / sample_rate) * 1000


def _write_payload(payload: dict[str, Any], seq_value: int | None) -> bool:
    if AUDIO_DIR is None:
        return False
    os.makedirs(AUDIO_DIR, exist_ok=True)
    tmp_path, final_path = _build_paths(AUDIO_DIR, seq_value)
    with open(tmp_path, "w", encoding="utf-8") as tmp_file:
        json.dump(payload, tmp_file)
    os.replace(tmp_path, final_path)
    return True


def send_audio_chunk(
    data: bytes,
    sample_rate: int,
    channels: int = 2,
    format: str = "pcm_s16le",
    timestamp: float | None = None,
    seq: int | None = None,
    duration_ms: float | None = None,
) -> bool:
    """Encode PCM bytes and send them back to the runner."""
    if AUDIO_DIR is None or not data:
        return False
    seq_value = _next_seq(seq)
    ts = timestamp if timestamp is not None else int(time.time() * 1000)
    computed_duration = (
        duration_ms
        if duration_ms is not None
        else _infer_duration_ms(len(data), int(sample_rate), int(channels))
    )

    payload = {
        "type": "audio",
        "sampleRate": int(sample_rate),
        "channels": int(channels),
        "format": format,
        "data": base64.b64encode(data).decode("ascii"),
        "timestamp": ts,
        "seq": seq_value,
    }
    if computed_duration is not None:
        payload["durationMs"] = float(computed_duration)
    return _write_payload(payload, seq_value)
`;
