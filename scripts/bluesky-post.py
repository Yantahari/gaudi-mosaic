#!/usr/bin/env python3
"""
Gaudí Mosaic — Script de publicació a Bluesky (AT Protocol)

Permet publicar posts i fils a Bluesky via l'API.

Ús:
    # Post simple
    python3 bluesky-post.py "Hola des de Gaudí Mosaic!"

    # Post amb link card
    python3 bluesky-post.py "Visita l'app!" --link https://gaudimosaic.art

    # Fil (respostes encadenades)
    python3 bluesky-post.py --thread posts.json

Credencials: fitxer .env al directori arrel del projecte
    BLUESKY_HANDLE=gaudimosaic.bsky.social
    BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
"""

import os
import sys
import json
import argparse
import re
from datetime import datetime, timezone
from pathlib import Path

import requests

# ---- Configuració ----

API_BASE = "https://bsky.social/xrpc"
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
GRAPHEME_LIMIT = 300  # Límit dur de Bluesky per post
REQUEST_TIMEOUT = 30  # Segons. Evita crides HTTP penjades indefinidament.


class BlueskyAPIError(Exception):
    """Error d'API de Bluesky amb el status code HTTP per al caller."""

    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")


def count_graphemes(text):
    """Compta grapheme clusters reals via regex \\X (UAX #29).
    Bluesky compta graphemes, no code points: 🇬🇧 = 1 grapheme però len()=2."""
    try:
        import regex as _regex
        return len(_regex.findall(r"\X", text))
    except ImportError:
        # Fallback conservador: len() sobreestima per seqüències emoji,
        # cosa que és segura (rebutjarem abans que l'API).
        return len(text)


def load_env():
    """Retorna (handle, password). Prioritza variables d'entorn (per a GitHub Actions);
    si no hi són, llegeix .env (per a execució local)."""
    handle = os.environ.get("BLUESKY_HANDLE")
    password = os.environ.get("BLUESKY_APP_PASSWORD")

    if not (handle and password) and ENV_PATH.exists():
        for line in ENV_PATH.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip()
            if key == "BLUESKY_HANDLE" and not handle:
                handle = value
            elif key == "BLUESKY_APP_PASSWORD" and not password:
                password = value

    if not handle or not password:
        print("Error: BLUESKY_HANDLE i BLUESKY_APP_PASSWORD obligatoris (env vars o .env)")
        sys.exit(1)

    return handle, password


# ---- Autenticació ----

def create_session(handle, password):
    """Autentica i retorna el token de sessió"""
    resp = requests.post(
        f"{API_BASE}/com.atproto.server.createSession",
        json={"identifier": handle, "password": password},
        timeout=REQUEST_TIMEOUT,
    )
    if resp.status_code != 200:
        raise BlueskyAPIError(resp.status_code, f"autenticació fallida: {resp.text}")

    data = resp.json()
    return {
        "did": data["did"],
        "accessJwt": data["accessJwt"],
    }


# ---- Detecció de facets (links i hashtags) ----

def detect_facets(text):
    """Detecta URLs i hashtags al text i genera facets per Bluesky"""
    facets = []

    # URLs
    url_re = re.compile(r"https?://[^\s\)]+")
    for m in url_re.finditer(text):
        url = m.group()
        # Calcular byte offsets (Bluesky usa byte positions, no char positions)
        start = len(text[: m.start()].encode("utf-8"))
        end = len(text[: m.end()].encode("utf-8"))
        facets.append({
            "index": {"byteStart": start, "byteEnd": end},
            "features": [{"$type": "app.bsky.richtext.facet#link", "uri": url}],
        })

    # Hashtags
    tag_re = re.compile(r"(?:^|\s)(#[^\s#\.\,\!\?\;\:]+)", re.UNICODE)
    for m in tag_re.finditer(text):
        tag_text = m.group(1)  # inclou #
        tag_value = tag_text[1:]  # sense #
        # Offset del tag dins el text complet
        tag_start_char = m.start(1)
        start = len(text[:tag_start_char].encode("utf-8"))
        end = start + len(tag_text.encode("utf-8"))
        facets.append({
            "index": {"byteStart": start, "byteEnd": end},
            "features": [{"$type": "app.bsky.richtext.facet#tag", "tag": tag_value}],
        })

    return facets if facets else None


# ---- Fetch link card metadata ----

def fetch_link_card(session, url):
    """Genera un embed external (link card) per a una URL.
    Descarrega l'og:image i la puja com a blob."""

    # Obtenir metadata OG de la pàgina
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, headers={"User-Agent": "GaudiMosaic-Bot/1.0"})
        resp.raise_for_status()
    except Exception as e:
        print(f"  Avís: no s'ha pogut obtenir la pàgina {url}: {e}")
        return None

    html = resp.text

    def og(prop):
        m = re.search(rf'<meta\s+(?:property|name)=["\']og:{prop}["\']\s+content=["\']([^"\']+)["\']', html)
        if not m:
            m = re.search(rf'content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:{prop}["\']', html)
        return m.group(1) if m else ""

    title = og("title") or "Gaudí Mosaic — Trencadís Creator"
    description = og("description") or ""
    og_image_url = og("image") or ""

    embed = {
        "$type": "app.bsky.embed.external",
        "external": {
            "uri": url,
            "title": title,
            "description": description,
        },
    }

    # Pujar og:image com a blob si existeix
    if og_image_url:
        try:
            img_resp = requests.get(og_image_url, timeout=REQUEST_TIMEOUT)
            img_resp.raise_for_status()
            content_type = img_resp.headers.get("Content-Type", "image/png")

            blob_resp = requests.post(
                f"{API_BASE}/com.atproto.repo.uploadBlob",
                headers={
                    "Authorization": f"Bearer {session['accessJwt']}",
                    "Content-Type": content_type,
                },
                data=img_resp.content,
                timeout=REQUEST_TIMEOUT,
            )
            if blob_resp.status_code == 200:
                embed["external"]["thumb"] = blob_resp.json()["blob"]
                print(f"  ✓ Imatge OG pujada ({len(img_resp.content) // 1024}KB)")
            else:
                print(f"  Avís: no s'ha pogut pujar la imatge ({blob_resp.status_code})")
        except Exception as e:
            print(f"  Avís: no s'ha pogut descarregar og:image: {e}")

    return embed


# ---- Publicació ----

def upload_image(session, image_path):
    """Puja una imatge al servidor de Bluesky i retorna el blob reference.

    Args:
        image_path: camí al fitxer d'imatge (PNG, JPG, WEBP)

    Returns:
        dict amb el blob reference o None si falla
    """
    path = Path(image_path)
    if not path.exists():
        print(f"  Avís: imatge no trobada: {image_path}")
        return None

    # Validar mida (Bluesky límit: 1MB)
    size = path.stat().st_size
    if size > 1_000_000:
        print(f"  Avís: imatge massa gran ({size // 1024}KB > 1000KB). Comprimint...")
        # Intentar comprimir amb Pillow si disponible
        try:
            from PIL import Image as PILImage
            img = PILImage.open(path)
            # Reduir mida si cal
            if max(img.size) > 2000:
                img.thumbnail((2000, 2000), PILImage.LANCZOS)
            # Guardar com a JPEG temporal amb compressió
            import tempfile
            tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
            img.convert("RGB").save(tmp.name, "JPEG", quality=80, optimize=True)
            path = Path(tmp.name)
            size = path.stat().st_size
            print(f"  Comprimit a {size // 1024}KB")
            if size > 1_000_000:
                print(f"  Error: imatge segueix massa gran després de comprimir")
                return None
        except ImportError:
            print(f"  Error: cal Pillow per comprimir (pip install Pillow)")
            return None

    # Detectar content type
    suffix = path.suffix.lower()
    content_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }
    content_type = content_types.get(suffix, "image/png")

    data = path.read_bytes()
    resp = requests.post(
        f"{API_BASE}/com.atproto.repo.uploadBlob",
        headers={
            "Authorization": f"Bearer {session['accessJwt']}",
            "Content-Type": content_type,
        },
        data=data,
        timeout=REQUEST_TIMEOUT,
    )

    if resp.status_code != 200:
        print(f"  Error pujant imatge ({resp.status_code}): {resp.text}")
        return None

    blob = resp.json()["blob"]
    print(f"  ✓ Imatge pujada: {path.name} ({size // 1024}KB)")
    return blob


def create_images_embed(session, images):
    """Crea un embed d'imatges per a un post.

    Args:
        images: llista de dicts amb 'path' i 'alt'
            [{"path": "img.jpg", "alt": "Descripció"}, ...]

    Returns:
        dict embed o None
    """
    if not images:
        return None

    if len(images) > 4:
        print(f"  Avís: Bluesky permet màxim 4 imatges, usant les 4 primeres")
        images = images[:4]

    embed_images = []
    for img_info in images:
        blob = upload_image(session, img_info["path"])
        if blob:
            embed_images.append({
                "alt": img_info.get("alt", ""),
                "image": blob,
            })

    if not embed_images:
        return None

    return {
        "$type": "app.bsky.embed.images",
        "images": embed_images,
    }


def create_post(session, text, link_url=None, images=None, reply_to=None):
    """Publica un post a Bluesky.

    Args:
        session: dict amb did i accessJwt
        text: contingut del post
        link_url: URL per generar link card (opcional)
        images: llista de dicts {path, alt} per embed d'imatges (opcional)
        reply_to: dict amb root i parent {uri, cid} per a fils (opcional)

    Returns:
        dict amb uri i cid del post creat
    """
    # Validació local de longitud: Bluesky rebutja posts >300 graphemes amb 400.
    g_count = count_graphemes(text)
    if g_count > GRAPHEME_LIMIT:
        raise BlueskyAPIError(
            0,
            f"text massa llarg: {g_count} graphemes (màx {GRAPHEME_LIMIT}). "
            f"Primer fragment: {text[:80]!r}",
        )

    record = {
        "$type": "app.bsky.feed.post",
        "text": text,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    # Facets (links clicables i hashtags)
    facets = detect_facets(text)
    if facets:
        record["facets"] = facets

    # Embed: imatges tenen prioritat sobre link card (Bluesky no permet ambdós)
    if images:
        embed = create_images_embed(session, images)
        if embed:
            record["embed"] = embed
    elif link_url:
        embed = fetch_link_card(session, link_url)
        if embed:
            record["embed"] = embed

    # Resposta (per a fils)
    if reply_to:
        record["reply"] = reply_to

    resp = requests.post(
        f"{API_BASE}/com.atproto.repo.createRecord",
        headers={"Authorization": f"Bearer {session['accessJwt']}"},
        json={
            "repo": session["did"],
            "collection": "app.bsky.feed.post",
            "record": record,
        },
        timeout=REQUEST_TIMEOUT,
    )

    if resp.status_code != 200:
        raise BlueskyAPIError(resp.status_code, resp.text)

    data = resp.json()
    return {"uri": data["uri"], "cid": data["cid"]}


# ---- Publicació de fils ----

def post_thread(session, posts):
    """Publica un fil de posts encadenats.

    Args:
        posts: llista de dicts amb 'text' i opcionalment 'link' i 'images'

    Returns:
        llista de {uri, cid} per cada post
    """
    results = []
    root_ref = None

    for i, post in enumerate(posts):
        reply_to = None
        if i > 0:
            parent_ref = results[-1]
            reply_to = {
                "root": {"uri": root_ref["uri"], "cid": root_ref["cid"]},
                "parent": {"uri": parent_ref["uri"], "cid": parent_ref["cid"]},
            }

        print(f"\n--- Post {i + 1}/{len(posts)} ---")
        print(f"  Text: {post['text'][:80]}...")
        if post.get("images"):
            print(f"  Imatges: {len(post['images'])}")

        result = create_post(
            session,
            post["text"],
            link_url=post.get("link"),
            images=post.get("images"),
            reply_to=reply_to,
        )

        if i == 0:
            root_ref = result

        results.append(result)
        print(f"  ✓ Publicat: {result['uri']}")

    return results


# ---- CLI ----

def main():
    parser = argparse.ArgumentParser(description="Publica a Bluesky (AT Protocol)")
    parser.add_argument("text", nargs="?", help="Text del post")
    parser.add_argument("--link", help="URL per a link card embed")
    parser.add_argument("--image", action="append", help="Imatge a adjuntar (es pot repetir fins a 4)")
    parser.add_argument("--alt", action="append", help="Alt text per a cada imatge (en ordre)")
    parser.add_argument("--thread", help="Fitxer JSON amb llista de posts per a fil")
    parser.add_argument("--dry-run", action="store_true", help="Mostra què es publicaria sense fer-ho")
    args = parser.parse_args()

    if not args.text and not args.thread:
        parser.print_help()
        sys.exit(1)

    # Preparar imatges si n'hi ha
    images = None
    if args.image:
        alts = args.alt or []
        images = []
        for i, img_path in enumerate(args.image):
            images.append({
                "path": img_path,
                "alt": alts[i] if i < len(alts) else "",
            })

    if args.dry_run:
        print("=== DRY RUN ===")
        if args.thread:
            posts = json.loads(Path(args.thread).read_text())
            for i, p in enumerate(posts):
                print(f"\nPost {i + 1}:")
                print(f"  Text: {p['text']}")
                if p.get("link"):
                    print(f"  Link: {p['link']}")
                if p.get("images"):
                    for j, img in enumerate(p["images"]):
                        print(f"  Imatge {j+1}: {img['path']} (alt: {img.get('alt', '')})")
        else:
            print(f"Text: {args.text}")
            if args.link:
                print(f"Link: {args.link}")
            if images:
                for j, img in enumerate(images):
                    print(f"Imatge {j+1}: {img['path']} (alt: {img.get('alt', '')})")
        return

    handle, password = load_env()
    print(f"Autenticant com a {handle}...")
    try:
        session = create_session(handle, password)
        print(f"✓ Autenticat (DID: {session['did']})")

        if args.thread:
            posts = json.loads(Path(args.thread).read_text())
            results = post_thread(session, posts)
            print(f"\n=== Fil publicat amb {len(results)} posts ===")
            for i, r in enumerate(results):
                post_id = r["uri"].split("/")[-1]
                print(f"  Post {i + 1}: https://bsky.app/profile/{handle}/post/{post_id}")
        else:
            result = create_post(session, args.text, link_url=args.link, images=images)
            post_id = result["uri"].split("/")[-1]
            print(f"\n✓ Post publicat: https://bsky.app/profile/{handle}/post/{post_id}")
    except BlueskyAPIError as e:
        print(f"Error Bluesky: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
