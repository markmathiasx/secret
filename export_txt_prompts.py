#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROMPTS_FILE = ROOT / "prompts_batch.json"
OUTPUT_DIR = ROOT / "prompts_txt"


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def render_txt(item: dict) -> str:
    return (
        f"Nome: {item['name']}\n"
        f"Seed: {item['seed']}\n\n"
        f"Prompt:\n{item['prompt']}\n\n"
        f"Negative Prompt:\n{item['negative_prompt']}\n\n"
        "Parametros recomendados:\n"
        f"- Width: {item['width']}\n"
        f"- Height: {item['height']}\n"
        f"- Sampler: {item['sampler']}\n"
        f"- Steps: {item['steps']}\n"
        f"- CFG Scale: {item['cfg_scale']}\n"
        f"- Output Filename: {item['output_filename']}\n"
    )


def main() -> None:
    items = json.loads(PROMPTS_FILE.read_text(encoding="utf-8"))
    ensure_output_dir()

    for item in items:
        output_path = OUTPUT_DIR / f"{item['slug']}.txt"
        output_path.write_text(render_txt(item), encoding="utf-8")

    print(f"Exportados {len(items)} prompts para {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
