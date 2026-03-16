
#!/usr/bin/env python3
"""
MDH 3D catalog image generator
Gera imagens WebP para os arquivos mdh-1.webp ... mdh-60.webp
com visual de miniatura 3D em estúdio, inspirado no estilo do exemplo enviado.
Também aceita uma lista personalizada de produtos via JSON.

Uso:
  python scripts/generate_mdh_images.py --output public/catalog-assets
  python scripts/generate_mdh_images.py --manifest docs/mdh-product-mapping.json --output public/catalog-assets
"""

from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math, random, os, json, argparse, pathlib

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def load_font(size, bold=False):
    path = FONT_BOLD if bold else FONT_REG
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def lerp(a, b, t):
    return a + (b - a) * t

def gradient_bg(w, h, c1, c2):
    img = Image.new("RGB", (w, h), 0)
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        row = (int(lerp(c1[0], c2[0], t)), int(lerp(c1[1], c2[1], t)), int(lerp(c1[2], c2[2], t)))
        for x in range(w):
            px[x, y] = row
    return img

def add_bokeh(img, palette, seed=0):
    rng = random.Random(seed)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    w, h = img.size
    for _ in range(45):
        r = rng.randint(18, 90)
        x = rng.randint(-20, w + 20)
        y = rng.randint(-20, h + 20)
        color = rng.choice(palette) + (rng.randint(18, 70),)
        d.ellipse((x-r, y-r, x+r, y+r), fill=color)
    overlay = overlay.filter(ImageFilter.GaussianBlur(12))
    img.alpha_composite(overlay)

theme_specs = {
    "hello kitty": {"bg": [(244,206,223),(255,242,250)], "accent": (245,110,190), "secondary": (255,204,230), "type":"kitty"},
    "ninja": {"bg": [(65,79,113),(26,30,48)], "accent": (71,231,255), "secondary": (29,48,88), "type":"ninja"},
    "mecha": {"bg": [(165,199,240),(61,77,115)], "accent": (255,84,84), "secondary": (104,140,208), "type":"mecha"},
    "samurai": {"bg": [(240,214,190),(105,66,56)], "accent": (225,77,60), "secondary": (188,152,128), "type":"samurai"},
    "mascote": {"bg": [(218,205,255),(140,118,245)], "accent": (255,214,86), "secondary": (255,255,255), "type":"mascot"},
    "mini busto": {"bg": [(227,230,237),(120,132,150)], "accent": (193,197,205), "secondary": (245,245,245), "type":"bust"},
}
default_spec = {"bg":[(219,230,255),(235,239,248)],"accent":(123,161,255),"secondary":(255,255,255),"type":"generic"}

def get_spec(name):
    low = name.lower()
    for k, v in theme_specs.items():
        if k in low:
            return v
    return default_spec

def add_hand(img, variant, seed=0):
    w, h = img.size
    layer = Image.new("RGBA", img.size, (0,0,0,0))
    d = ImageDraw.Draw(layer)
    skin = (240,183,168,255)
    edge = (226,165,148,180)
    if variant == 1:
        thumb=(w*0.18,h*0.60,w*0.48,h*1.00)
        finger=(w*0.50,h*0.66,w*0.79,h*1.02)
    elif variant == 2:
        thumb=(w*0.10,h*0.54,w*0.43,h*0.97)
        finger=(w*0.57,h*0.62,w*0.86,h*1.02)
    else:
        thumb=(w*0.23,h*0.67,w*0.53,h*1.02)
        finger=(w*0.45,h*0.69,w*0.74,h*1.01)
    for box in [thumb, finger]:
        d.ellipse(box, fill=skin, outline=edge, width=4)
        x0,y0,x1,y1 = box
        nail=(x0+(x1-x0)*0.43, y0+(y1-y0)*0.18, x0+(x1-x0)*0.78, y0+(y1-y0)*0.42)
        d.rounded_rectangle(nail, radius=24, fill=(244,215,219,220))
    d.ellipse((w*0.38,h*0.58,w*0.62,h*0.86), fill=(60,30,25,35))
    layer = layer.filter(ImageFilter.GaussianBlur(1.4))
    img.alpha_composite(layer)

def draw_kitty(draw,cx,cy,scale,spec):
    head=(cx-scale*70,cy-scale*110,cx+scale*70,cy+scale*20)
    body=(cx-scale*48,cy-scale*12,cx+scale*48,cy+scale*92)
    leg1=(cx-scale*45,cy+scale*55,cx-scale*8,cy+scale*110)
    leg2=(cx+scale*8,cy+scale*55,cx+scale*45,cy+scale*110)
    arm1=(cx-scale*72,cy+scale*5,cx-scale*24,cy+scale*52)
    arm2=(cx+scale*24,cy+scale*5,cx+scale*72,cy+scale*52)
    for box in [body, leg1, leg2, arm1, arm2]:
        draw.rounded_rectangle(box, radius=int(scale*18), fill=(255,245,250,255))
    draw.ellipse(head, fill=(255,250,253,255))
    draw.polygon([(cx-scale*60,cy-scale*48),(cx-scale*22,cy-scale*130),(cx-scale*4,cy-scale*45)], fill=(255,250,253,255))
    draw.polygon([(cx+scale*60,cy-scale*48),(cx+scale*22,cy-scale*130),(cx+scale*4,cy-scale*45)], fill=(255,250,253,255))
    draw.rounded_rectangle((cx-scale*54,cy+scale*10,cx+scale*54,cy+scale*74), radius=int(scale*16), fill=spec["accent"]+(255,))
    draw.ellipse((cx-scale*15,cy+scale*16,cx+scale*15,cy+scale*42), fill=(255,221,86,255))
    for ex in [-26,26]:
        draw.ellipse((cx+scale*(ex-8),cy-scale*32,cx+scale*(ex+8),cy-scale*16), fill=(35,35,35,255))
    draw.ellipse((cx-scale*7,cy-scale*16,cx+scale*7,cy-scale*0), fill=(242,201,55,255))
    for side in [-1,1]:
        for oy in [-28,-18,-8]:
            draw.line((cx+side*scale*36, cy+scale*oy, cx+side*scale*68, cy+scale*(oy-4)), fill=(70,70,70,180), width=max(1,int(scale*3)))
    bow=spec["accent"]+(255,)
    draw.ellipse((cx+scale*10,cy-scale*70,cx+scale*46,cy-scale*34), fill=bow)
    draw.ellipse((cx+scale*36,cy-scale*78,cx+scale*78,cy-scale*38), fill=bow)
    draw.ellipse((cx+scale*32,cy-scale*62,cx+scale*52,cy-scale*44), fill=(255,222,240,255))

def draw_ninja(draw,cx,cy,scale,spec):
    draw.rounded_rectangle((cx-scale*52,cy-scale*6,cx+scale*52,cy+scale*104), radius=int(scale*20), fill=(24,32,53,255))
    draw.ellipse((cx-scale*62,cy-scale*118,cx+scale*62,cy+scale*10), fill=(33,42,66,255))
    draw.pieslice((cx-scale*62,cy-scale*70,cx+scale*62,cy+scale*30), start=200, end=340, fill=spec["accent"]+(255,))
    draw.rounded_rectangle((cx-scale*48,cy-scale*42,cx+scale*48,cy-scale*4), radius=int(scale*10), fill=(246,247,249,255))
    draw.ellipse((cx-scale*28,cy-scale*34,cx-scale*14,cy-scale*18), fill=(30,30,30,255))
    draw.ellipse((cx+scale*14,cy-scale*34,cx+scale*28,cy-scale*18), fill=(30,30,30,255))
    draw.rounded_rectangle((cx-scale*42,cy+scale*30,cx+scale*42,cy+scale*44), radius=int(scale*5), fill=spec["accent"]+(255,))
    draw.rounded_rectangle((cx+scale*46,cy-scale*30,cx+scale*60,cy+scale*90), radius=int(scale*5), fill=(210,218,226,255))
    draw.rounded_rectangle((cx+scale*40,cy-scale*40,cx+scale*66,cy-scale*20), radius=int(scale*4), fill=spec["secondary"]+(255,))

def draw_mecha(draw,cx,cy,scale,spec):
    draw.rounded_rectangle((cx-scale*56,cy-scale*8,cx+scale*56,cy+scale*104), radius=int(scale*20), fill=(187,212,255,255), outline=(70,95,146,255), width=max(1,int(scale*4)))
    draw.rounded_rectangle((cx-scale*68,cy-scale*122,cx+scale*68,cy+scale*8), radius=int(scale*26), fill=(230,239,255,255), outline=(70,95,146,255), width=max(1,int(scale*4)))
    draw.rounded_rectangle((cx-scale*36,cy-scale*66,cx+scale*36,cy-scale*24), radius=int(scale*12), fill=(30,40,62,255))
    draw.ellipse((cx-scale*22,cy-scale*52,cx-scale*8,cy-scale*38), fill=spec["accent"]+(255,))
    draw.ellipse((cx+scale*8,cy-scale*52,cx+scale*22,cy-scale*38), fill=spec["accent"]+(255,))
    draw.rectangle((cx-scale*8,cy-scale*132,cx+scale*8,cy-scale*102), fill=spec["accent"]+(255,))
    draw.line((cx,cy-scale*132,cx,cy-scale*160), fill=(50,60,80,255), width=max(1,int(scale*4)))

def draw_samurai(draw,cx,cy,scale,spec):
    draw.rounded_rectangle((cx-scale*52,cy-scale*4,cx+scale*52,cy+scale*104), radius=int(scale*20), fill=(122,48,44,255))
    draw.ellipse((cx-scale*66,cy-scale*118,cx+scale*66,cy+scale*10), fill=(255,239,225,255))
    draw.pieslice((cx-scale*82,cy-scale*122,cx+scale*82,cy-scale*10), start=180, end=360, fill=(46,37,39,255))
    draw.polygon([(cx-scale*74,cy-scale*50),(cx-scale*108,cy-scale*122),(cx-scale*20,cy-scale*82)], fill=spec["accent"]+(255,))
    draw.polygon([(cx+scale*74,cy-scale*50),(cx+scale*108,cy-scale*122),(cx+scale*20,cy-scale*82)], fill=spec["accent"]+(255,))
    draw.ellipse((cx-scale*24,cy-scale*40,cx-scale*10,cy-scale*24), fill=(30,30,30,255))
    draw.ellipse((cx+scale*10,cy-scale*40,cx+scale*24,cy-scale*24), fill=(30,30,30,255))
    draw.arc((cx-scale*22,cy-scale*20,cx+scale*22,cy+scale*4), start=10, end=170, fill=(120,70,60,255), width=max(1,int(scale*3)))
    draw.rounded_rectangle((cx-scale*56,cy+scale*12,cx+scale*56,cy+scale*52), radius=int(scale*12), fill=spec["accent"]+(255,))
    draw.rectangle((cx-scale*38,cy+scale*54,cx+scale*38,cy+scale*96), fill=(84,53,55,255))
    draw.rounded_rectangle((cx+scale*54,cy-scale*22,cx+scale*66,cy+scale*86), radius=int(scale*3), fill=(29,23,25,255))

def draw_mascot(draw,cx,cy,scale,spec):
    draw.ellipse((cx-scale*66,cy-scale*120,cx+scale*66,cy+scale*8), fill=(255,247,214,255))
    draw.rounded_rectangle((cx-scale*48,cy-scale*2,cx+scale*48,cy+scale*100), radius=int(scale*22), fill=spec["accent"]+(255,))
    for ex in [-24,24]:
        draw.ellipse((cx+scale*(ex-8),cy-scale*40,cx+scale*(ex+8),cy-scale*24), fill=(35,35,35,255))
    draw.arc((cx-scale*30,cy-scale*12,cx+scale*30,cy+scale*24), start=10, end=170, fill=(215,120,40,255), width=max(1,int(scale*3)))

def draw_bust(draw,cx,cy,scale,spec):
    draw.ellipse((cx-scale*66,cy-scale*124,cx+scale*66,cy-scale*2), fill=(246,248,251,255))
    draw.arc((cx-scale*28,cy-scale*36,cx+scale*28,cy-scale*4), start=10, end=170, fill=(120,126,134,255), width=max(1,int(scale*3)))
    draw.ellipse((cx-scale*22,cy-scale*52,cx-scale*8,cy-scale*36), fill=(88,96,105,255))
    draw.ellipse((cx+scale*8,cy-scale*52,cx+scale*22,cy-scale*36), fill=(88,96,105,255))
    draw.polygon([(cx-scale*48,cy+scale*4),(cx+scale*48,cy+scale*4),(cx+scale*68,cy+scale*50),(cx-scale*68,cy+scale*50)], fill=(220,224,231,255))
    draw.rounded_rectangle((cx-scale*82,cy+scale*48,cx+scale*82,cy+scale*88), radius=int(scale*12), fill=(188,195,204,255))

def draw_generic(draw,cx,cy,scale,spec):
    draw.ellipse((cx-scale*64,cy-scale*116,cx+scale*64,cy+scale*8), fill=(255,250,250,255))
    draw.rounded_rectangle((cx-scale*50,cy,cx+scale*50,cy+scale*100), radius=int(scale*22), fill=spec["accent"]+(255,))

DRAWERS = {
    "kitty": draw_kitty,
    "ninja": draw_ninja,
    "mecha": draw_mecha,
    "samurai": draw_samurai,
    "mascot": draw_mascot,
    "bust": draw_bust,
    "generic": draw_generic,
}

def render_image(name, out_path, variant=1, seed=0):
    spec = get_spec(name)
    w = h = 1024
    bg = gradient_bg(w, h, spec["bg"][0], tuple(min(255, c + 10) for c in spec["bg"][1])).convert("RGBA")
    add_bokeh(bg, [spec["accent"], spec["secondary"], (255,255,255)], seed)
    glow = Image.new("RGBA", (w, h), (0,0,0,0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((w*0.18, h*0.18, w*0.82, h*0.78), fill=spec["secondary"] + (70,))
    glow = glow.filter(ImageFilter.GaussianBlur(50))
    bg.alpha_composite(glow)
    add_hand(bg, variant, seed)
    layer = Image.new("RGBA", (w, h), (0,0,0,0))
    d = ImageDraw.Draw(layer)
    cx = int(w*0.50 if variant != 2 else w*0.54)
    cy = int(h*0.50 if variant == 1 else (h*0.46 if variant == 2 else h*0.49))
    size_scale = 1.0
    for word, mult in [("mini",0.95),("compact",1.0),("desk",1.05),("padrão",1.1),("padrao",1.1),("plus",1.14),("max",1.18),("wall",1.2),("pro",1.25),("premium",1.3),("collector",1.36)]:
        if word in name.lower():
            size_scale = mult
            break
    scale = 2.6*size_scale if variant == 3 else (2.1*size_scale if variant == 2 else 1.9*size_scale)
    sd = ImageDraw.Draw(layer)
    sd.ellipse((cx-110*size_scale, cy+110*size_scale, cx+110*size_scale, cy+170*size_scale), fill=(40,25,50,70))
    DRAWERS.get(spec["type"], draw_generic)(d, cx, cy, scale/2, spec)
    layer = layer.filter(ImageFilter.GaussianBlur(0.2))
    bg.alpha_composite(layer)
    overlay = Image.new("RGBA", (w, h), (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((56,56,286,124), radius=34, fill=(19,26,45,130), outline=(255,255,255,42), width=2)
    od.text((84,74), "MDH 3D", fill=(255,255,255,230), font=load_font(28, True))
    od.text((84,106), name.split()[0].upper()[:18], fill=spec["accent"] + (220,), font=load_font(18))
    bg.alpha_composite(overlay)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(out_path, quality=90, method=6)

DEFAULT_THEMES = ["Hello Kitty", "Ninja", "Mecha", "Samurai", "Mascote", "Mini busto"]
DEFAULT_SIZES = ["Mini","Compact","Desk","Padrão","Plus","Max","Wall","Pro","Premium","Collector"]

def default_manifest():
    items = []
    index = 1
    for theme in DEFAULT_THEMES:
        for size in DEFAULT_SIZES:
            items.append({"index": index, "file": f"mdh-{index}.webp", "name": f"{theme} {size}"})
            index += 1
    return items

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=pathlib.Path, help="JSON com lista de produtos")
    parser.add_argument("--output", type=pathlib.Path, default=pathlib.Path("public/catalog-assets"))
    args = parser.parse_args()

    if args.manifest and args.manifest.exists():
        items = json.loads(args.manifest.read_text(encoding="utf-8"))
    else:
        items = default_manifest()

    for item in items:
        variant = (int(item.get("index", 1)) % 3) + 1
        render_image(item["name"], args.output / item["file"], variant=variant, seed=int(item.get("index", 1)) * 7)

    print(f"{len(items)} imagens geradas em {args.output}")

if __name__ == "__main__":
    main()
