#!/usr/bin/env python3
from __future__ import annotations

import base64
import io
import json
import os
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

import requests
from PIL import Image


WEBUI_ROOT = Path(r"C:\AI\stable-diffusion-webui")
WEBUI_BAT = WEBUI_ROOT / "webui-user.bat"
CHECKPOINT_NAME = "juggernautXL_ragnarokBy.safetensors"
BASE_URL = os.environ.get("SD_WEBUI_BASE_URL", "http://127.0.0.1:7860").rstrip("/")
MODELS_URL = f"{BASE_URL}/sdapi/v1/sd-models"
TXT2IMG_URL = f"{BASE_URL}/sdapi/v1/txt2img"

NEGATIVE_PROMPT = (
    "text, logo, watermark, packaging, hands, person, cluttered background, "
    "low quality, low detail, blurry, cropped, duplicate, deformed, poster, drawing, painting, "
    "blueprint, label, plaque, sign, badge, medallion, flat icon, flat art, toy box, dramatic scene, "
    "nameplate, wall art, printed poster, text plate, medal, keychain badge"
)


@dataclass
class ConceptItem:
    name: str
    output: Path
    prompt: str
    seed: int


ITEMS = [
    ConceptItem(
        name="Organizador de mesa 3 gavetas print-in-place",
        output=Path("public/products/bambu-018-organizador-de-mesa-3-gavetas.webp"),
        prompt="realistic catalog product photo of a 3D printed desk organizer with three integrated drawers, print-in-place design, drawers slightly open, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180018,
    ),
    ConceptItem(
        name="Kit passa-fios de mesa modular",
        output=Path("public/products/util-011-organizador-fios.webp"),
        prompt="realistic catalog product photo of a 3D printed modular desk cable organizer kit, interlocking cable pass-through pieces assembled as one product, holding three desk cables in use, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single product set centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180011,
    ),
    ConceptItem(
        name="Suporte para oculos dobravel",
        output=Path("public/products/util-015-suporte-oculos.webp"),
        prompt="realistic catalog product photo of a 3D printed foldable eyeglasses stand, eyeglasses resting on the stand, compact desktop support, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180015,
    ),
    ConceptItem(
        name="Suporte para controle gamer",
        output=Path("public/products/util-009-suporte-controle.webp"),
        prompt="realistic catalog product photo of a 3D printed desk stand holding an Xbox style game controller, curved cradle support for a controller on the desk, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single product centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180009,
    ),
    ConceptItem(
        name="Spinner triangular antiestresse",
        output=Path("public/products/fidget-003-spinner-triangular.webp"),
        prompt="realistic catalog product photo of a 3D printed triangular fidget spinner, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180003,
    ),
    ConceptItem(
        name="Porta-canetas robo multiuso",
        output=Path("public/products/util-003-porta-canetas-robo.webp"),
        prompt="realistic catalog product photo of a 3D printed robot pen holder desk organizer, a few pens inside the holder, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=183003,
    ),
    ConceptItem(
        name="Organizador de cabos com trilho",
        output=Path("public/products/util-006-organizador-cabos.webp"),
        prompt="realistic catalog product photo of a 3D printed cable organizer rail for desk setup, desk cables routed through the rail clips, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180006,
    ),
    ConceptItem(
        name="Suporte de celular exoskeleton",
        output=Path("public/products/bambu-016-suporte-de-celular-exoskeleton.webp"),
        prompt="realistic catalog product photo of a 3D printed exoskeleton phone stand holding a smartphone, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180016,
    ),
    ConceptItem(
        name="Suporte para relogio e smartwatch",
        output=Path("public/products/util-013-suporte-relogio.webp"),
        prompt="realistic catalog product photo of a 3D printed stand for wristwatch and smartwatch, watch and smartwatch resting on the stand, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180013,
    ),
    ConceptItem(
        name="Organizador compacto 2 gavetas",
        output=Path("public/products/util-002-organizador-2gavetas.webp"),
        prompt="realistic catalog product photo of a 3D printed compact organizer with two drawers, drawers slightly open to show the structure, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180002,
    ),
    ConceptItem(
        name="Organizador modular de maquiagem e utilitarios",
        output=Path("public/products/util-014-organizador-maquiagem.webp"),
        prompt="realistic catalog product photo of a 3D printed modular makeup and utilities organizer, multiple built-in compartments with a few brushes and accessories organized, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180014,
    ),
    ConceptItem(
        name="Suporte Dragon multiuso",
        output=Path("public/products/util-001-suporte-dragon.webp"),
        prompt="realistic catalog product photo of a 3D printed dragon themed stand supporting a smartphone, premium matte PLA, visible layer lines, professionally printed on a Bambu Lab A1 Mini, single object centered on a wooden workbench, blurred 3D printer workshop background, blurred Bambu Lab A1 Mini in the background, soft studio lighting, shallow depth of field, vertical composition, realistic object photo, no text, no packaging, no hands",
        seed=180001,
    ),
]


def decode_image(image_payload: str) -> Image.Image:
    image_bytes = base64.b64decode(image_payload)
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def resolve_checkpoint_title() -> str:
    response = requests.get(MODELS_URL, timeout=15)
    response.raise_for_status()
    models = response.json()
    for model in models:
        title = str(model.get("title") or "")
        if CHECKPOINT_NAME.lower() in title.lower() or Path(CHECKPOINT_NAME).stem.lower() in title.lower():
            return title
    return CHECKPOINT_NAME


def wait_for_api(timeout: int = 240) -> None:
    started = time.time()
    while time.time() - started < timeout:
        try:
            response = requests.get(MODELS_URL, timeout=5)
            if response.status_code == 200 and response.json():
                return
        except Exception:
            pass
        time.sleep(2)
    raise RuntimeError("AUTOMATIC1111 nao subiu a tempo.")


def api_available() -> bool:
    try:
        response = requests.get(MODELS_URL, timeout=5)
        return response.status_code == 200
    except Exception:
        return False


def start_webui() -> subprocess.Popen:
    return subprocess.Popen(["cmd.exe", "/c", "webui-user.bat"], cwd=str(WEBUI_ROOT), creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)


def stop_webui(process: subprocess.Popen) -> None:
    subprocess.run(["taskkill", "/F", "/T", "/PID", str(process.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
    time.sleep(2)


def generate_item(item: ConceptItem, checkpoint_title: str) -> None:
    payload = {
        "prompt": item.prompt,
        "negative_prompt": NEGATIVE_PROMPT,
        "seed": item.seed,
        "width": 832,
        "height": 1024,
        "sampler_name": "DPM++ 2M Karras",
        "steps": 28,
        "cfg_scale": 6.0,
        "batch_size": 1,
        "n_iter": 1,
        "restore_faces": False,
        "tiling": False,
        "do_not_save_samples": True,
        "do_not_save_grid": True,
        "override_settings": {
            "sd_model_checkpoint": checkpoint_title,
        },
        "override_settings_restore_afterwards": True,
    }
    response = requests.post(TXT2IMG_URL, json=payload, timeout=360)
    response.raise_for_status()
    body = response.json()
    images = body.get("images") or []
    if not images:
        raise RuntimeError(f"Nenhuma imagem retornada para {item.name}")

    output_image = decode_image(images[0])
    item.output.parent.mkdir(parents=True, exist_ok=True)
    output_image.save(item.output, format="WEBP", quality=92, method=6)


def main() -> None:
    report: list[dict[str, str]] = []
    external_api = api_available()
    checkpoint_title = ""
    spawned_process: subprocess.Popen | None = None

    try:
        if not external_api:
            print("[INFO] API do SD indisponivel. Tentando subir o AUTOMATIC1111 uma vez para processar o lote.")
            spawned_process = start_webui()
            wait_for_api()
            external_api = True

        if external_api:
            checkpoint_title = resolve_checkpoint_title()
            print(f"[INFO] Usando API em {BASE_URL}")
            for item in ITEMS:
                print(f"[START] {item.name}")
                generate_item(item, checkpoint_title)
                report.append({"name": item.name, "output": str(item.output), "status": "ok"})
                print(f"[OK] {item.output}")
    finally:
        if spawned_process is not None:
            stop_webui(spawned_process)

    report_path = Path("public/products/catalog_concept_generation_report.json")
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Report: {report_path}")


if __name__ == "__main__":
    main()
