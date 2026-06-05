"""Async defect detection prototype for MDH 3D.

The module runs with the Python standard library. Redis is optional and only used
when available and configured.
"""

from __future__ import annotations

import asyncio
import json
import os
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


@dataclass
class DefectResult:
    job_id: str
    status: str
    confidence: float
    reasons: list[str]


class LocalStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    async def save(self, key: str, value: dict[str, Any]) -> None:
        await asyncio.to_thread(self.path.write_text, json.dumps({key: value}, ensure_ascii=False, indent=2), "utf-8")


async def get_store() -> Any:
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        try:
            import redis.asyncio as redis  # type: ignore

            return redis.from_url(redis_url)
        except Exception:
            pass
    return LocalStore(Path(".local/defect-results.json"))


async def detect_defect(job_id: str, image_metrics: dict[str, float]) -> DefectResult:
    layer_shift = image_metrics.get("layer_shift", 0)
    stringing = image_metrics.get("stringing", 0)
    under_extrusion = image_metrics.get("under_extrusion", 0)

    reasons: list[str] = []
    if layer_shift > 0.7:
        reasons.append("possible_layer_shift")
    if stringing > 0.6:
        reasons.append("possible_stringing")
    if under_extrusion > 0.65:
        reasons.append("possible_under_extrusion")

    confidence = min(0.98, max(layer_shift, stringing, under_extrusion))
    status = "review_needed" if reasons else "clear"
    result = DefectResult(job_id=job_id, status=status, confidence=confidence, reasons=reasons)

    store = await get_store()
    payload = asdict(result)
    if hasattr(store, "set"):
        await store.set(f"mdh3d:defect:{job_id}", json.dumps(payload))
    else:
        await store.save(job_id, payload)
    return result


async def main() -> None:
    result = await detect_defect("demo-local", {"layer_shift": 0.2, "stringing": 0.4, "under_extrusion": 0.1})
    print(json.dumps(asdict(result), ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())
