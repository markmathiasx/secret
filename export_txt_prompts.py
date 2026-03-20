from __future__ import annotations

import json
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parent
    batch_path = root / "prompts_batch.json"
    output_dir = root / "prompts_txt"

    if not batch_path.exists():
        raise FileNotFoundError(f"Arquivo nao encontrado: {batch_path}")

    data = json.loads(batch_path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("prompts_batch.json deve conter um array JSON.")

    output_dir.mkdir(parents=True, exist_ok=True)

    exported = 0
    for item in data:
        item_id = item.get("id", "")
        name = item.get("name", "")
        slug = item.get("slug", f"item-{item_id}")
        seed = item.get("seed", "")
        prompt = item.get("prompt", "")
        negative_prompt = item.get("negative_prompt", "")
        width = item.get("width", "")
        height = item.get("height", "")
        sampler = item.get("sampler", "")
        steps = item.get("steps", "")
        cfg_scale = item.get("cfg_scale", "")
        output_filename = item.get("output_filename", "")

        txt_content = (
            f"Nome: {name}\n"
            f"ID: {item_id}\n"
            f"Slug: {slug}\n"
            f"Seed: {seed}\n\n"
            "Prompt:\n"
            f"{prompt}\n\n"
            "Negative prompt:\n"
            f"{negative_prompt}\n\n"
            "Parametros recomendados:\n"
            f"- Width: {width}\n"
            f"- Height: {height}\n"
            f"- Sampler: {sampler}\n"
            f"- Steps: {steps}\n"
            f"- CFG Scale: {cfg_scale}\n"
            f"- Output filename sugerido: {output_filename}\n"
        )

        target_file = output_dir / f"{int(item_id):03d}-{slug}.txt"
        target_file.write_text(txt_content, encoding="utf-8")
        exported += 1

    print(f"Exportacao concluida: {exported} arquivos em {output_dir}")


if __name__ == "__main__":
    main()

