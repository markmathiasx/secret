#!/usr/bin/env python3
from __future__ import annotations

import base64
import io
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests
from PIL import Image, ImageEnhance, ImageOps


DEFAULT_PROMPTS_PATH = Path("prompts_batch.json")
DEFAULT_GEEK_SOURCE_DIR = Path(r"C:\Users\markm\Downloads\geek")
DEFAULT_OUTPUT_ROOT = Path("public/products")
DEFAULT_MANIFEST_OUT = Path("public/products/geek/geek_image_manifest.json")
SD_API_URL = "http://127.0.0.1:7860/sdapi/v1/txt2img"
SD_OPTIONS_URL = "http://127.0.0.1:7860/sdapi/v1/options"


@dataclass
class SourcePair:
    main: Path | None
    original: Path | None


def normalize_text(value: str) -> str:
    return unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii").lower().strip()


def load_prompts(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("prompts_batch.json precisa ser um array JSON.")
    return data


def group_sources(geek_dir: Path) -> dict[str, SourcePair]:
    if not geek_dir.exists():
        raise FileNotFoundError(f"Pasta de origem nao encontrada: {geek_dir}")

    grouped: dict[str, dict[str, Path | None]] = {}
    for file_path in sorted(geek_dir.iterdir()):
        if not file_path.is_file():
            continue
        stem = file_path.stem.strip()
        is_original = bool(re.search(r"\s+original$", stem, flags=re.IGNORECASE))
        base_name = re.sub(r"\s+original$", "", stem, flags=re.IGNORECASE).strip()
        key = normalize_text(base_name)
        bucket = grouped.setdefault(key, {"main": None, "original": None})
        if is_original:
            bucket["original"] = file_path
        else:
            bucket["main"] = file_path

    return {k: SourcePair(main=v["main"], original=v["original"]) for k, v in grouped.items()}


def sd_api_available() -> bool:
    try:
        response = requests.get(SD_OPTIONS_URL, timeout=3)
        return response.status_code == 200
    except Exception:
        return False


def generate_via_sd(item: dict[str, Any]) -> Image.Image:
    payload = {
        "prompt": item["prompt"],
        "negative_prompt": item["negative_prompt"],
        "seed": int(item["seed"]),
        "width": int(item["width"]),
        "height": int(item["height"]),
        "sampler_name": item["sampler"],
        "steps": int(item["steps"]),
        "cfg_scale": float(item["cfg_scale"]),
        "batch_size": 1,
        "n_iter": 1,
        "restore_faces": False,
        "tiling": False,
    }
    response = requests.post(SD_API_URL, json=payload, timeout=300)
    response.raise_for_status()
    body = response.json()
    images = body.get("images") or []
    if not images:
        raise RuntimeError("API do SD nao retornou imagens.")

    image_bytes = base64.b64decode(images[0])
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def build_from_source(source_file: Path, width: int, height: int) -> Image.Image:
    with Image.open(source_file) as img:
        rgb = img.convert("RGB")
        fitted = ImageOps.fit(rgb, (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        fitted = ImageEnhance.Sharpness(fitted).enhance(1.08)
        fitted = ImageEnhance.Contrast(fitted).enhance(1.04)
        fitted = ImageEnhance.Color(fitted).enhance(1.03)
        return fitted


def write_image(image: Image.Image, target_file: Path) -> None:
    target_file.parent.mkdir(parents=True, exist_ok=True)
    image.save(target_file, format="PNG", optimize=True)


def main() -> None:
    prompts_path = DEFAULT_PROMPTS_PATH
    geek_source_dir = DEFAULT_GEEK_SOURCE_DIR
    output_root = DEFAULT_OUTPUT_ROOT
    manifest_out = DEFAULT_MANIFEST_OUT

    prompts = load_prompts(prompts_path)
    sources = group_sources(geek_source_dir)
    use_sd_api = sd_api_available()

    report: list[dict[str, Any]] = []
    generated = 0

    for item in prompts:
        name = item["name"]
        slug = item["slug"]
        source_key = normalize_text(name)
        source_pair = sources.get(source_key, SourcePair(main=None, original=None))

        width = int(item["width"])
        height = int(item["height"])

        relative_output = Path(item["output_filename"])
        main_target = output_root / relative_output
        original_target = main_target.with_name(f"{slug}-original.png")

        method = "sd_api"
        fallback_reason = ""

        try:
            if use_sd_api:
                main_image = generate_via_sd(item)
            else:
                if source_pair.main is None:
                    raise FileNotFoundError(f"Sem foto principal para '{name}' em {geek_source_dir}")
                main_image = build_from_source(source_pair.main, width, height)
                method = "source_fallback"
                fallback_reason = "sd_api_unavailable"

            write_image(main_image, main_target)

            original_written = False
            if source_pair.original is not None:
                original_image = build_from_source(source_pair.original, width, height)
                write_image(original_image, original_target)
                original_written = True

            report.append(
                {
                    "id": item["id"],
                    "name": name,
                    "slug": slug,
                    "method": method,
                    "fallback_reason": fallback_reason,
                    "source_main": str(source_pair.main) if source_pair.main else None,
                    "source_original": str(source_pair.original) if source_pair.original else None,
                    "output_main": str(main_target),
                    "output_original": str(original_target) if original_written else None,
                }
            )
            generated += 1
            print(f"[OK] {name} -> {main_target}")
        except Exception as exc:
            report.append(
                {
                    "id": item["id"],
                    "name": name,
                    "slug": slug,
                    "method": "error",
                    "error": str(exc),
                    "source_main": str(source_pair.main) if source_pair.main else None,
                    "source_original": str(source_pair.original) if source_pair.original else None,
                    "output_main": str(main_target),
                    "output_original": str(original_target),
                }
            )
            print(f"[ERRO] {name}: {exc}")

    manifest_out.parent.mkdir(parents=True, exist_ok=True)
    manifest_payload = {
        "items_total": len(prompts),
        "items_generated": generated,
        "sd_api_enabled": use_sd_api,
        "output_root": str(output_root),
        "source_dir": str(geek_source_dir),
        "items": report,
    }
    manifest_out.write_text(json.dumps(manifest_payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nManifesto: {manifest_out}")
    print(f"Gerados: {generated}/{len(prompts)}")


if __name__ == "__main__":
    main()

