#!/usr/bin/env python3
"""
Generate catalog reference images with Stable Diffusion using a reference image.

This workflow is intentionally reference-first:
- it expects a real photo or faithful render as input
- it should not be used to invent catalog-official images from title only

Examples:
  python scripts/generate_product_reference_sd.py ^
    --reference public/products/foto-003-porta-creme-dental.webp ^
    --prompt "professional ecommerce photo of a 3D printed toothpaste holder on a clean bathroom counter, neutral studio lighting, product centered, realistic PLA texture" ^
    --output public/generated-catalog/porta-creme-dental-refined.webp

  python scripts/generate_product_reference_sd.py --manifest scripts/stable_diffusion_manifest.example.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from PIL import Image


def fail(message: str) -> None:
    raise SystemExit(message)


def load_runtime():
    try:
        import torch  # type: ignore
        from diffusers import AutoPipelineForImage2Image  # type: ignore
    except Exception as exc:  # pragma: no cover
        fail(
            "Stable Diffusion runtime not ready.\n"
            "Install PyTorch first from the official PyTorch Windows page, then install:\n"
            "pip install diffusers transformers accelerate safetensors pillow\n"
            f"Original error: {exc}"
        )
    return torch, AutoPipelineForImage2Image


def resolve_defaults(model_id: str) -> dict[str, Any]:
    lowered = model_id.lower()
    if "turbo" in lowered:
        return {
            "steps": 4,
            "guidance": 0.0,
            "strength": 0.55,
        }
    return {
        "steps": 20,
        "guidance": 6.5,
        "strength": 0.45,
    }


def load_items(args: argparse.Namespace) -> list[dict[str, Any]]:
    if args.manifest:
        manifest_path = Path(args.manifest)
        if not manifest_path.exists():
            fail(f"Manifest not found: {manifest_path}")
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            fail("Manifest must be a JSON array.")
        return data

    if not args.reference or not args.prompt or not args.output:
        fail("Single mode requires --reference, --prompt and --output.")

    return [
        {
            "reference": args.reference,
            "prompt": args.prompt,
            "negative_prompt": args.negative_prompt,
            "output": args.output,
            "width": args.width,
            "height": args.height,
            "seed": args.seed,
            "steps": args.steps,
            "guidance": args.guidance,
            "strength": args.strength,
        }
    ]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", help="JSON array for batch generation")
    parser.add_argument("--reference", help="Reference image path")
    parser.add_argument("--prompt", help="Positive prompt")
    parser.add_argument("--negative-prompt", dest="negative_prompt", default="low quality, blurry, deformed, duplicate, watermark, text overlay")
    parser.add_argument("--output", help="Output image path")
    parser.add_argument("--model", default="stabilityai/sd-turbo")
    parser.add_argument("--width", type=int, default=768)
    parser.add_argument("--height", type=int, default=1024)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--steps", type=int)
    parser.add_argument("--guidance", type=float)
    parser.add_argument("--strength", type=float)
    parser.add_argument("--cpu", action="store_true", help="Force CPU mode")
    parser.add_argument("--skip-existing", action="store_true")
    return parser


def open_reference(path_str: str, width: int, height: int) -> Image.Image:
    path = Path(path_str)
    if not path.exists():
        fail(f"Reference image not found: {path}")
    image = Image.open(path).convert("RGB")
    return image.resize((width, height), Image.LANCZOS)


def save_image(image: Image.Image, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    suffix = output_path.suffix.lower()
    if suffix == ".png":
        image.save(output_path)
        return
    image.save(output_path, quality=92, method=6)


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    items = load_items(args)
    torch, AutoPipelineForImage2Image = load_runtime()

    defaults = resolve_defaults(args.model)
    device = "cpu" if args.cpu or not torch.cuda.is_available() else "cuda"
    dtype = torch.float32 if device == "cpu" else torch.float16

    print(f"Loading model: {args.model}")
    pipe = AutoPipelineForImage2Image.from_pretrained(
        args.model,
        torch_dtype=dtype,
    )
    pipe.enable_attention_slicing()
    if device == "cuda":
        pipe.enable_model_cpu_offload()
    else:
        pipe.to(device)

    for item in items:
        prompt = item.get("prompt", "").strip()
        reference = item.get("reference", "").strip()
        output = Path(item.get("output", "")).resolve()
        if not prompt or not reference or not output:
            print(f"Skipping invalid item: {item}")
            continue
        if args.skip_existing and output.exists():
            print(f"Skipping existing output: {output}")
            continue

        width = int(item.get("width") or args.width)
        height = int(item.get("height") or args.height)
        steps = int(item.get("steps") or args.steps or defaults["steps"])
        guidance = float(item.get("guidance") or args.guidance or defaults["guidance"])
        strength = float(item.get("strength") or args.strength or defaults["strength"])
        seed = int(item.get("seed") or args.seed)
        negative_prompt = item.get("negative_prompt") or args.negative_prompt

        reference_image = open_reference(reference, width, height)
        generator = torch.Generator(device="cpu").manual_seed(seed)

        print(f"Generating: {output.name}")
        result = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            image=reference_image,
            num_inference_steps=steps,
            guidance_scale=guidance,
            strength=strength,
            generator=generator,
        ).images[0]

        save_image(result, output)
        print(f"Saved: {output}")


if __name__ == "__main__":
    main()
