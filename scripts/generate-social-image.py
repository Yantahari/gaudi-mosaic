#!/usr/bin/env python3
"""
Gaudí Mosaic — Generador d'imatges per a xarxes socials

Crea imatges compostes amb cites, dades o text sobre fons de trencadís
usant les textures Midjourney del projecte.

Ús:
    # Imatge de cita
    python3 generate-social-image.py quote "L'originalitat consisteix a tornar a l'origen." -o social-images/w2-wed.jpg

    # Imatge de compte enrere
    python3 generate-social-image.py countdown 62 --subtitle "dies per al centenari" -o social-images/w2-wed-countdown.jpg

    # Imatge educativa amb text personalitzat
    python3 generate-social-image.py text "Les columnes de la Sagrada Família" --subtitle "es ramifiquen com troncs d'arbre" -o social-images/w2-fri.jpg

    # Només generar el fons de trencadís
    python3 generate-social-image.py background -o social-images/bg.jpg
"""

import argparse
import random
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# ---- Configuració ----

TEXTURES_DIR = Path(__file__).resolve().parent.parent / "gaudi-mosaic" / "assets" / "textures"
OUTPUT_DIR = Path(__file__).resolve().parent / "social-images"

# Mida de les imatges generades
SIZE_SQUARE = (1080, 1080)
SIZE_LANDSCAPE = (1200, 675)

# Colors Gaudí
BG_DARK = (28, 25, 20)       # #1C1914
GOLD = (212, 168, 67)         # #D4A843
CREAM = (245, 236, 215)       # #F5ECD7
DARK_TEXT = (28, 25, 20, 230)


def load_textures():
    """Carrega totes les textures PNG disponibles."""
    textures = []
    if not TEXTURES_DIR.exists():
        print(f"Avís: directori de textures no trobat: {TEXTURES_DIR}")
        return textures
    for f in sorted(TEXTURES_DIR.glob("*.png")):
        try:
            textures.append(Image.open(f))
        except Exception:
            pass
    return textures


def create_trencadis_background(width, height, textures, num_fragments=25, seed=None):
    """Crea un fons amb fragments de trencadís a partir de les textures."""
    if seed is not None:
        random.seed(seed)

    bg = Image.new("RGB", (width, height), BG_DARK)
    draw = ImageDraw.Draw(bg)

    if not textures:
        return bg

    margin = 40
    for _ in range(num_fragments):
        tex = random.choice(textures)

        # Mida del fragment
        frag_size = random.randint(80, 220)
        x = random.randint(-frag_size // 3, width - frag_size // 2)
        y = random.randint(-frag_size // 3, height - frag_size // 2)

        # Retallar un fragment irregular de la textura
        tw, th = tex.size
        cx = random.randint(0, max(0, tw - frag_size))
        cy = random.randint(0, max(0, th - frag_size))
        crop = tex.crop((cx, cy, min(cx + frag_size, tw), min(cy + frag_size, th)))

        # Crear màscara poligonal irregular (4-6 punts)
        mask = Image.new("L", crop.size, 0)
        mask_draw = ImageDraw.Draw(mask)
        n_points = random.randint(4, 6)
        points = []
        for i in range(n_points):
            angle = (2 * math.pi * i / n_points) + random.uniform(-0.4, 0.4)
            r = (frag_size // 2) * random.uniform(0.6, 1.0)
            px = int(frag_size / 2 + r * math.cos(angle))
            py = int(frag_size / 2 + r * math.sin(angle))
            px = max(0, min(px, crop.size[0] - 1))
            py = max(0, min(py, crop.size[1] - 1))
            points.append((px, py))
        mask_draw.polygon(points, fill=200)

        # Rotar lleugerament
        angle = random.uniform(-15, 15)
        crop = crop.rotate(angle, expand=True, fillcolor=BG_DARK)
        mask = mask.rotate(angle, expand=True, fillcolor=0)

        # Fer més transparent els fragments (fons subtil)
        mask_arr = mask.copy()
        mask = Image.eval(mask, lambda v: int(v * random.uniform(0.3, 0.7)))

        bg.paste(crop, (x, y), mask)

    # Afegir un overlay fosc semitransparent per llegibilitat del text
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle([(0, 0), (width, height)], fill=(28, 25, 20, 140))
    bg = Image.alpha_composite(bg.convert("RGBA"), overlay).convert("RGB")

    return bg


def get_font(size, bold=False, italic=False):
    """Intenta carregar una font del sistema o usa la per defecte."""
    font_paths = []

    if bold and italic:
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif-BoldItalic.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf",
        ]
    elif bold:
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        ]
    elif italic:
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
        ]
    else:
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        ]

    for fp in font_paths:
        if Path(fp).exists():
            return ImageFont.truetype(fp, size)

    return ImageFont.load_default()


def wrap_text(text, font, max_width, draw):
    """Talla el text en línies que càpiguen dins max_width."""
    words = text.split()
    lines = []
    current = ""

    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    return lines


def generate_quote_image(quote, author="Antoni Gaudí", output=None, size="square"):
    """Genera una imatge amb una cita de Gaudí sobre fons de trencadís."""
    w, h = SIZE_SQUARE if size == "square" else SIZE_LANDSCAPE
    textures = load_textures()
    bg = create_trencadis_background(w, h, textures, num_fragments=30)
    draw = ImageDraw.Draw(bg)

    # Guillemets decoratius
    quote_font = get_font(42, italic=True)
    guillemet_font = get_font(80, bold=True)
    author_font = get_font(24)
    credit_font = get_font(16)

    margin = 100

    # Guillemet d'obertura
    draw.text((margin - 10, h // 2 - 160), "«", font=guillemet_font, fill=GOLD)

    # Cita
    lines = wrap_text(quote, quote_font, w - margin * 2, draw)
    y = h // 2 - (len(lines) * 52) // 2
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=quote_font)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, y), line, font=quote_font, fill=CREAM)
        y += 52

    # Guillemet de tancament
    draw.text((w - margin - 40, y - 10), "»", font=guillemet_font, fill=GOLD)

    # Autor
    y += 30
    author_text = f"— {author}"
    bbox = draw.textbbox((0, 0), author_text, font=author_font)
    aw = bbox[2] - bbox[0]
    draw.text(((w - aw) // 2, y), author_text, font=author_font, fill=GOLD)

    # Línia decorativa
    y += 50
    line_w = 120
    draw.line([(w // 2 - line_w // 2, y), (w // 2 + line_w // 2, y)], fill=GOLD, width=2)

    # Crèdit
    y += 20
    credit = "gaudimosaic.art · #Gaudí #Centenari2026"
    bbox = draw.textbbox((0, 0), credit, font=credit_font)
    cw = bbox[2] - bbox[0]
    draw.text(((w - cw) // 2, y), credit, font=credit_font, fill=(*GOLD, 150))

    return save_image(bg, output)


def generate_countdown_image(days, subtitle="dies per al centenari", output=None, size="square"):
    """Genera una imatge amb el compte enrere."""
    w, h = SIZE_SQUARE if size == "square" else SIZE_LANDSCAPE
    textures = load_textures()
    bg = create_trencadis_background(w, h, textures, num_fragments=35)
    draw = ImageDraw.Draw(bg)

    # Número gran
    num_font = get_font(200, bold=True)
    sub_font = get_font(32)
    title_font = get_font(24, italic=True)
    credit_font = get_font(16)

    # Número
    num_text = str(days)
    bbox = draw.textbbox((0, 0), num_text, font=num_font)
    nw = bbox[2] - bbox[0]
    nh = bbox[3] - bbox[1]
    draw.text(((w - nw) // 2, h // 2 - nh - 20), num_text, font=num_font, fill=GOLD)

    # Subtítol
    bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    sw = bbox[2] - bbox[0]
    draw.text(((w - sw) // 2, h // 2 + 20), subtitle, font=sub_font, fill=CREAM)

    # Títol centenari
    y = h // 2 + 80
    title = "Centenari d'Antoni Gaudí · 1926–2026"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, y), title, font=title_font, fill=(*GOLD, 180))

    # Crèdit
    credit = "gaudimosaic.art"
    bbox = draw.textbbox((0, 0), credit, font=credit_font)
    cw = bbox[2] - bbox[0]
    draw.text(((w - cw) // 2, h - 60), credit, font=credit_font, fill=(*GOLD, 150))

    return save_image(bg, output)


def generate_text_image(title, subtitle=None, output=None, size="square"):
    """Genera una imatge amb text lliure sobre fons de trencadís."""
    w, h = SIZE_SQUARE if size == "square" else SIZE_LANDSCAPE
    textures = load_textures()
    bg = create_trencadis_background(w, h, textures, num_fragments=28)
    draw = ImageDraw.Draw(bg)

    title_font = get_font(38, bold=True)
    sub_font = get_font(28, italic=True)
    credit_font = get_font(16)

    margin = 100

    # Títol
    lines = wrap_text(title, title_font, w - margin * 2, draw)
    total_h = len(lines) * 48
    if subtitle:
        total_h += 60
    y = (h - total_h) // 2

    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, y), line, font=title_font, fill=CREAM)
        y += 48

    # Subtítol
    if subtitle:
        y += 20
        sub_lines = wrap_text(subtitle, sub_font, w - margin * 2, draw)
        for line in sub_lines:
            bbox = draw.textbbox((0, 0), line, font=sub_font)
            lw = bbox[2] - bbox[0]
            draw.text(((w - lw) // 2, y), line, font=sub_font, fill=GOLD)
            y += 38

    # Crèdit
    credit = "gaudimosaic.art · #Gaudí #Centenari2026"
    bbox = draw.textbbox((0, 0), credit, font=credit_font)
    cw = bbox[2] - bbox[0]
    draw.text(((w - cw) // 2, h - 60), credit, font=credit_font, fill=(*GOLD, 150))

    return save_image(bg, output)


def generate_background_image(output=None, size="square"):
    """Genera només el fons de trencadís."""
    w, h = SIZE_SQUARE if size == "square" else SIZE_LANDSCAPE
    textures = load_textures()
    bg = create_trencadis_background(w, h, textures, num_fragments=40)
    return save_image(bg, output)


def save_image(img, output):
    """Guarda la imatge amb compressió adequada per a Bluesky (<1MB)."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if output is None:
        output = OUTPUT_DIR / "output.jpg"
    else:
        output = Path(output)
        if not output.is_absolute():
            output = OUTPUT_DIR / output

    # Guardar com a JPEG per mida petita
    if output.suffix.lower() in (".jpg", ".jpeg"):
        img.convert("RGB").save(output, "JPEG", quality=85, optimize=True)
    else:
        img.save(output, optimize=True)

    size_kb = output.stat().st_size // 1024
    print(f"✓ Imatge generada: {output} ({size_kb}KB)")

    # Si és massa gran per Bluesky, comprimir més
    if output.stat().st_size > 950_000:
        print("  Comprimint per Bluesky (<1MB)...")
        img.convert("RGB").save(output, "JPEG", quality=70, optimize=True)
        size_kb = output.stat().st_size // 1024
        print(f"  Comprimida a {size_kb}KB")

    return str(output)


# ---- CLI ----

def main():
    parser = argparse.ArgumentParser(description="Genera imatges per a xarxes socials")
    parser.add_argument("type", choices=["quote", "countdown", "text", "background"],
                        help="Tipus d'imatge")
    parser.add_argument("content", nargs="?", help="Text principal (cita, número de dies, títol)")
    parser.add_argument("--subtitle", help="Subtítol o text secundari")
    parser.add_argument("--author", default="Antoni Gaudí", help="Autor de la cita")
    parser.add_argument("-o", "--output", help="Fitxer de sortida (relatiu a social-images/)")
    parser.add_argument("--size", choices=["square", "landscape"], default="square",
                        help="Format: square (1080x1080) o landscape (1200x675)")
    args = parser.parse_args()

    if args.type == "quote":
        if not args.content:
            print("Error: cal proporcionar la cita")
            sys.exit(1)
        generate_quote_image(args.content, author=args.author, output=args.output, size=args.size)

    elif args.type == "countdown":
        if not args.content:
            print("Error: cal proporcionar el número de dies")
            sys.exit(1)
        subtitle = args.subtitle or "dies per al centenari"
        generate_countdown_image(int(args.content), subtitle=subtitle, output=args.output, size=args.size)

    elif args.type == "text":
        if not args.content:
            print("Error: cal proporcionar el títol")
            sys.exit(1)
        generate_text_image(args.content, subtitle=args.subtitle, output=args.output, size=args.size)

    elif args.type == "background":
        generate_background_image(output=args.output, size=args.size)


if __name__ == "__main__":
    import sys
    main()
