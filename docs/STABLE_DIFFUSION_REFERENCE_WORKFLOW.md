# Stable Diffusion Reference Workflow

This workflow exists to improve catalog visuals without inventing fake products from title only.

## Rule of use

- Official catalog image:
  - real photo of the printed item, or
  - faithful render from STL / OBJ / 3MF, or
  - Stable Diffusion refinement generated from a real reference image
- Do not publish title-only generations as if they were real product photos.

## Recommended install path

1. Install PyTorch for Windows from the official PyTorch page and choose the CUDA build that matches your machine.
2. Install the remaining packages:

```powershell
pip install diffusers transformers accelerate safetensors pillow
```

## MDH local path policy

For this machine, the Stable Diffusion runtime and caches should stay on `D:`:

- extra site-packages: `D:\ai-runtime\sd-site-packages`
- Hugging Face cache: `D:\ai-cache\huggingface`
- Torch cache: `D:\ai-cache\torch`
- pip cache: `D:\ai-cache\pip`

The helper runner below already applies this layout:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_sd_reference.ps1 --manifest tmp\imagegen\your-manifest.json
```

## Single image generation

```powershell
python scripts/generate_product_reference_sd.py `
  --reference public/products/foto-003-porta-creme-dental.webp `
  --prompt "professional ecommerce product photo of a 3D printed toothpaste holder on a clean bathroom counter, centered composition, realistic PLA texture, soft studio lighting, premium retail look" `
  --output public/generated-catalog/porta-creme-dental-refined.webp
```

## Batch generation

```powershell
python scripts/generate_product_reference_sd.py --manifest scripts/stable_diffusion_manifest.example.json
```

## Recommended publication policy

- `Foto real`: publish directly in the store.
- `Render fiel`: publish when linked to a real STL / OBJ / 3MF.
- `Imagem conceitual`: keep internal or mark clearly as conceptual.

## Good prompts

- Mention object type, material, use case, framing and background.
- Ask for ecommerce lighting, realistic print texture and centered composition.
- Use the negative prompt to block distortion, text noise and duplicate objects.

## Bad prompts

- "Make an image of product X" with no reference.
- Prompting from title only for catalog-official media.
- Asking the model to invent details that the physical part does not have.
