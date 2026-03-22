#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import io
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests
from PIL import Image, ImageOps, ImageSequence, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
PROMPTS_PATH = ROOT / "prompts_batch.json"
REFERENCE_DIR = ROOT / "output" / "geek"
OUTPUT_DIR = ROOT / "public" / "products" / "gallery"
CONTACT_SHEET_PATH = ROOT / "output" / "playwright" / "chibi-variants-contact-sheet.webp"
SD_IMG2IMG = "http://127.0.0.1:7861/sdapi/v1/img2img"
MODEL_CHECKPOINT = "juggernautXL_ragnarokBy.safetensors [dd08fa32f9]"
SAMPLER = "DPM++ 2M Karras"
WIDTH = 832
HEIGHT = 1024


@dataclass(frozen=True)
class VariantRecipe:
    index: int
    suffix: str
    denoising_strength: float
    prompt_tail: str


VARIANTS: tuple[VariantRecipe, ...] = (
    VariantRecipe(
        index=2,
        suffix="catalog-angle-a",
        denoising_strength=0.26,
        prompt_tail=(
            "same character identity, same collectible proportions, slightly different camera angle, "
            "front three-quarter view, centered on wooden table, realistic Bambu Lab workshop bokeh"
        ),
    ),
    VariantRecipe(
        index=3,
        suffix="catalog-angle-b",
        denoising_strength=0.30,
        prompt_tail=(
            "same character identity, same collectible proportions, slightly different pose framing, "
            "close premium tabletop shot, shallow depth of field, subtle side-light from studio softbox"
        ),
    ),
)


CHIBI_REFERENCE_OVERRIDES: dict[str, list[str]] = {
    "mdh-061": ["Sasuke Uchiha Chibi.png"],
    "mdh-062": ["Sasuke Uchiha Chibi.png"],
    "mdh-063": ["Goku Dragon Ball Chibi original.jpg", "Goku Dragon Ball Chibi.png"],
    "mdh-064": ["Luffy One Piece Chibi.png", "Luffy One Piece Chibi original.gif"],
    "mdh-065": ["Elsa Frozen Chibi original.jpg", "Elsa Frozen Chibi.png"],
    "mdh-066": ["Totoro My Neighbor Chibi original.jpg", "Totoro My Neighbor Chibi.png"],
    "mdh-067": ["Pikachu Pokémon Chibi original.jpg", "Pikachu Pokémon Chibi.png"],
    "mdh-068": ["Kirby Nintendo Chibi.png", "Kirby Nintendo Chibi original.gif"],
    "mdh-069": ["Mario Nintendo Chibi original.jpg", "Mario Nintendo Chibi.png"],
    "mdh-070": ["Sonic Hedgehog Chibi original.jpg", "Sonic Hedgehog Chibi.png"],
}


def stable_seed(value: str) -> int:
    total = 100001
    for index, char in enumerate(value, start=1):
        total += index * ord(char)
    return total


def load_prompt_index() -> dict[str, dict[str, Any]]:
    data = json.loads(PROMPTS_PATH.read_text(encoding="utf-8"))
    return {item["id"]: item for item in data if isinstance(item, dict) and str(item.get("id", "")).startswith("mdh-0")}


def resolve_reference(product_id: str) -> Path:
    candidates = CHIBI_REFERENCE_OVERRIDES[product_id]
    for filename in candidates:
        path = REFERENCE_DIR / filename
        if path.exists():
            return path
    raise FileNotFoundError(f"No reference found for {product_id}: {candidates}")


def open_reference(path: Path) -> Image.Image:
    image = Image.open(path)
    if getattr(image, "is_animated", False):
        image = next(ImageSequence.Iterator(image)).convert("RGB")
    else:
        image = image.convert("RGB")

    fitted = ImageOps.contain(image, (WIDTH, HEIGHT), Image.LANCZOS)
    canvas = Image.new("RGB", (WIDTH, HEIGHT), (18, 20, 26))
    left = (WIDTH - fitted.width) // 2
    top = (HEIGHT - fitted.height) // 2
    canvas.paste(fitted, (left, top))
    return canvas


def encode_image(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def generate_variant(item: dict[str, Any], recipe: VariantRecipe, reference_image: Image.Image, output_path: Path) -> None:
    prompt = f'{item["prompt"]}, {recipe.prompt_tail}'
    payload = {
        "init_images": [encode_image(reference_image)],
        "prompt": prompt,
        "negative_prompt": item["negative_prompt"],
        "sampler_name": SAMPLER,
        "steps": 24,
        "cfg_scale": 6.5,
        "width": WIDTH,
        "height": HEIGHT,
        "denoising_strength": recipe.denoising_strength,
        "resize_mode": 1,
        "seed": stable_seed(f'{item["id"]}-{recipe.suffix}'),
        "restore_faces": False,
        "tiling": False,
        "save_images": False,
        "override_settings_restore_afterwards": True,
        "override_settings": {
            "sd_model_checkpoint": MODEL_CHECKPOINT,
        },
    }

    response = requests.post(SD_IMG2IMG, json=payload, timeout=1800)
    response.raise_for_status()
    data = response.json()
    encoded = data["images"][0]
    image = Image.open(io.BytesIO(base64.b64decode(encoded.split(",", 1)[-1]))).convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="WEBP", quality=92, method=6)


def build_contact_sheet(entries: list[tuple[str, list[Path]]]) -> None:
    thumb_w = 300
    thumb_h = 360
    gap = 24
    label_h = 56
    cols = 3
    rows = max(1, (len(entries) + cols - 1) // cols)
    sheet = Image.new("RGB", (cols * (thumb_w + gap) + gap, rows * (thumb_h + label_h + gap) + gap), (8, 12, 24))
    draw = ImageDraw.Draw(sheet)

    for idx, (title, images) in enumerate(entries):
        row = idx // cols
        col = idx % cols
        x = gap + col * (thumb_w + gap)
        y = gap + row * (thumb_h + label_h + gap)
        draw.rounded_rectangle((x, y, x + thumb_w, y + thumb_h + label_h), radius=22, fill=(15, 20, 34), outline=(39, 229, 244), width=2)
        draw.text((x + 18, y + 14), title, fill=(230, 240, 255))

        for image_idx, path in enumerate(images[:2]):
            image = Image.open(path).convert("RGB")
            fitted = ImageOps.cover(image, (132, 180), Image.LANCZOS)
            ix = x + 18 + image_idx * (132 + 12)
            iy = y + 52
            sheet.paste(fitted, (ix, iy))

    CONTACT_SHEET_PATH.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(CONTACT_SHEET_PATH, format="WEBP", quality=90, method=6)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ids", nargs="*", help="Optional product ids to generate, ex: mdh-061 mdh-068")
    parser.add_argument("--skip-existing", action="store_true")
    args = parser.parse_args()

    prompt_index = load_prompt_index()
    generated_entries: list[tuple[str, list[Path]]] = []
    selected_ids = args.ids or list(CHIBI_REFERENCE_OVERRIDES.keys())

    for product_id in selected_ids:
        item = prompt_index.get(product_id)
        if not item:
            raise KeyError(f"Prompt not found for {product_id}")

        reference_path = resolve_reference(product_id)
        reference_image = open_reference(reference_path)
        saved_paths: list[Path] = []

        for recipe in VARIANTS:
            output_path = OUTPUT_DIR / product_id / f"{recipe.index}.webp"
            if args.skip_existing and output_path.exists():
                saved_paths.append(output_path)
                continue

            print(f"Generating {product_id} variant #{recipe.index} from {reference_path.name}")
            generate_variant(item, recipe, reference_image, output_path)
            saved_paths.append(output_path)

        generated_entries.append((item["name"], saved_paths))

    build_contact_sheet(generated_entries)
    print(f"Saved contact sheet to {CONTACT_SHEET_PATH}")


if __name__ == "__main__":
    main()
