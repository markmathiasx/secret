from __future__ import annotations

import base64
import io
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import requests
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public"
SNAPSHOT_PATH = ROOT / "output" / "prod-catalog-api.json"
LIVE_BASE = "https://mdh-3d-store.vercel.app"
SD_API = "http://127.0.0.1:7861/sdapi/v1/txt2img"
SAMPLER = "DPM++ 2M Karras"
NEGATIVE = (
    "text, logo, watermark, packaging, label, words, letters, UI, multiple objects, multiple products, "
    "hands, person, people, human, cluttered background, low quality, low detail, blurry, deformed, duplicate, "
    "toy box, dramatic scene, oversized accessories, cropped object, controller, gamepad, glasses, eyeglasses, watch, "
    "smartwatch, phone, smartphone, tablet, pens, pencils, makeup brushes, cosmetics, cables, dragon creature, figurine"
)


@dataclass(frozen=True)
class GenerationTarget:
    name: str
    relative_path: str
    prompt: str


GENERATED_TARGETS: tuple[GenerationTarget, ...] = (
    GenerationTarget(
        name="Organizador de mesa 3 gavetas print-in-place",
        relative_path="products/bambu-018-organizador-de-mesa-3-gavetas.webp",
        prompt=(
            "realistic product photo of a 3D printed desktop organizer with three integrated pull-out drawers, "
            "print-in-place rails, compact bench storage design, premium matte black PLA plastic, visible layer lines, "
            "single object centered, drawers slightly staggered, standing on a wooden workbench, blurred 3D printer "
            "workshop background, soft studio lighting, shallow depth of field, professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Kit passa-fios de mesa modular",
        relative_path="products/util-011-organizador-fios.webp",
        prompt=(
            "realistic product photo of a 3D printed modular desk cable management kit, compact cable pass-through guides, "
            "snap-in desk clips and a low-profile organizer rail grouped as one clean product set, the 3D printed kit itself is "
            "the only subject, no desk setup, no cables installed, premium matte black PLA plastic, visible layer lines, "
            "single product centered on a wooden workbench, blurred 3D printer workshop background, soft studio lighting, "
            "shallow depth of field, professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Suporte para oculos dobravel",
        relative_path="products/util-015-suporte-oculos.webp",
        prompt=(
            "realistic product photo of a 3D printed foldable eyeglasses stand, compact hinged display support for glasses, "
            "the empty 3D printed stand itself is the only object, no eyeglasses on it, premium matte black PLA plastic, "
            "visible layer lines, single object centered, standing on a wooden workbench, blurred 3D printer workshop background, soft studio lighting, "
            "shallow depth of field, professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Suporte para controle gamer",
        relative_path="products/util-009-suporte-controle.webp",
        prompt=(
            "realistic product photo of a 3D printed gamer controller stand, ergonomic cradle base for a console controller, "
            "the empty 3D printed stand itself is the only object, no controller on it, premium matte black PLA plastic, "
            "visible layer lines, single object centered, "
            "wooden workbench, blurred 3D printer workshop background, soft studio lighting, shallow depth of field, "
            "professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Spinner triangular antiestresse",
        relative_path="products/fidget-003-spinner-triangular.webp",
        prompt=(
            "realistic product photo of a 3D printed triangular fidget spinner, compact anti-stress desk toy with three rounded lobes "
            "and central bearing cap, premium dark graphite PLA plastic, visible layer lines, single object centered, "
            "resting on a wooden workbench, blurred 3D printer workshop background, soft studio lighting, "
            "shallow depth of field, professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Porta-canetas robo multiuso",
        relative_path="products/util-003-porta-canetas-robo.webp",
        prompt=(
            "realistic product photo of a 3D printed robot-shaped pen holder, multiuse desktop organizer with hollow body "
            "for pens and small tools, the empty robot organizer itself is the only object, no pens or tools inside, "
            "premium matte charcoal PLA plastic, visible layer lines, single object centered, wooden workbench, blurred 3D printer workshop background, soft studio lighting, "
            "shallow depth of field, professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Organizador de cabos com trilho",
        relative_path="products/util-006-organizador-cabos.webp",
        prompt=(
            "realistic product photo of a 3D printed cable organizer rail, slim desk cable management track with integrated cable clips, "
            "premium matte black PLA plastic, visible layer lines, single object centered, wooden workbench, "
            "blurred 3D printer workshop background, soft studio lighting, shallow depth of field, professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Suporte de celular exoskeleton",
        relative_path="products/bambu-016-suporte-de-celular-exoskeleton.webp",
        prompt=(
            "realistic product photo of a 3D printed exoskeleton smartphone stand, skeletal frame design with angular ribs, "
            "premium matte black PLA plastic, visible layer lines, single object centered, empty stand without phone, "
            "standing on a wooden workbench, blurred 3D printer workshop background, soft studio lighting, "
            "shallow depth of field, professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Suporte para relogio e smartwatch",
        relative_path="products/util-013-suporte-relogio.webp",
        prompt=(
            "realistic product photo of a 3D printed watch and smartwatch stand, elegant display pedestal with circular top support "
            "and stable base, the empty 3D printed stand itself is the only object, no watch, no smartwatch, premium matte black PLA plastic, "
            "visible layer lines, single object centered, wooden workbench, blurred 3D printer workshop background, soft studio lighting, shallow depth of field, "
            "professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Organizador compacto 2 gavetas",
        relative_path="products/util-002-organizador-2gavetas.webp",
        prompt=(
            "realistic product photo of a 3D printed compact organizer with two pull-out drawers, small parts storage box for screws "
            "and connectors, premium matte black PLA plastic, visible layer lines, single object centered, drawers slightly open, "
            "wooden workbench, blurred 3D printer workshop background, soft studio lighting, shallow depth of field, "
            "professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Organizador modular de maquiagem e utilitarios",
        relative_path="products/util-014-organizador-maquiagem.webp",
        prompt=(
            "realistic product photo of a 3D printed modular makeup organizer, desktop utility tray system with brush compartments "
            "and stacked sections, the empty organizer itself is the only object, no makeup brushes, no cosmetics, premium pearl white PLA plastic, visible layer lines, single object centered, "
            "wooden workbench, blurred 3D printer workshop background, soft studio lighting, shallow depth of field, "
            "professional ecommerce catalog photography"
        ),
    ),
    GenerationTarget(
        name="Suporte Dragon multiuso",
        relative_path="products/util-001-suporte-dragon.webp",
        prompt=(
            "realistic product photo of a 3D printed dragon-themed multiuse stand, fantasy dragon silhouette stand structure for phone or tablet, "
            "the stand itself is the only object, not a dragon figurine, no device on it, premium matte black PLA plastic, visible layer lines, single object centered, "
            "wooden workbench, blurred 3D printer workshop background, soft studio lighting, shallow depth of field, "
            "professional ecommerce catalog photography"
        ),
    ),
)


def stable_seed(name: str) -> int:
    total = 100000
    for index, char in enumerate(name, start=1):
        total += index * ord(char)
    return total


def load_snapshot() -> dict:
    return json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))


def iter_live_image_paths(snapshot: dict) -> Iterable[str]:
    skip_primary = {f"/{target.relative_path}" for target in GENERATED_TARGETS}
    seen: set[str] = set()

    for item in snapshot.get("items", []):
      for raw_path in item.get("images", []):
            if not isinstance(raw_path, str) or not raw_path.startswith("/products/"):
                continue
            if raw_path in skip_primary:
                continue
            if raw_path in seen:
                continue
            seen.add(raw_path)
            yield raw_path


def download_live_asset(relative_url: str) -> None:
    target = PUBLIC_DIR / relative_url.removeprefix("/products/")
    target = PUBLIC_DIR / relative_url.lstrip("/")
    target.parent.mkdir(parents=True, exist_ok=True)

    response = requests.get(f"{LIVE_BASE}{relative_url}", timeout=120)
    response.raise_for_status()
    target.write_bytes(response.content)
    print(f"SYNC {relative_url} -> {target}")


def generate_asset(target: GenerationTarget) -> None:
    payload = {
        "prompt": (
            f"{target.prompt}, highly detailed, no text, no logo, no packaging, no hands, no people, "
            "professional studio product shot"
        ),
        "negative_prompt": NEGATIVE,
        "steps": 18,
        "cfg_scale": 6.0,
        "width": 768,
        "height": 768,
        "sampler_name": SAMPLER,
        "seed": stable_seed(target.name),
        "override_settings_restore_afterwards": True,
        "save_images": False,
    }

    response = requests.post(SD_API, json=payload, timeout=900)
    response.raise_for_status()
    encoded = response.json()["images"][0]
    image = Image.open(io.BytesIO(base64.b64decode(encoded)))

    destination = ROOT / "public" / target.relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "WEBP", quality=92, method=6)
    print(f"GEN  {target.relative_path}")


def main() -> None:
    snapshot = load_snapshot()

    for relative_url in iter_live_image_paths(snapshot):
        download_live_asset(relative_url)

    for target in GENERATED_TARGETS:
        generate_asset(target)


if __name__ == "__main__":
    main()
