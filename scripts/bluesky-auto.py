#!/usr/bin/env python3
"""
Gaudí Mosaic — Publicació automàtica des del calendari

Llegeix bluesky-calendar.json, busca els posts d'avui i els publica com a fils trilingües.
Marca els posts com a publicats per no repetir-los.

Ús:
    python3 scripts/bluesky-auto.py              # Publica els posts d'avui
    python3 scripts/bluesky-auto.py --date 2026-04-07  # Publica una data concreta
    python3 scripts/bluesky-auto.py --dry-run     # Mostra sense publicar
    python3 scripts/bluesky-auto.py --list        # Llista tots els posts pendents
"""

import json
import sys
import argparse
from datetime import date
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
CALENDAR_PATH = SCRIPTS_DIR / "bluesky-calendar.json"

# Importar el mòdul de publicació
sys.path.insert(0, str(SCRIPTS_DIR))
from importlib import import_module


def load_calendar():
    return json.loads(CALENDAR_PATH.read_text())


def save_calendar(cal):
    CALENDAR_PATH.write_text(json.dumps(cal, ensure_ascii=False, indent=2))


def list_pending(cal):
    pending = [e for e in cal if not e.get("published")]
    if not pending:
        print("No hi ha posts pendents.")
        return
    print(f"Posts pendents: {len(pending)}\n")
    for e in pending:
        print(f"  {e['date']} [{e['type']:12s}] {e['id']}")
        print(f"    → {e['posts'][0]['text'][:80]}...")
        print()


def resolve_image_paths(images, base_dir=None):
    """Resol els camins d'imatge relatius al directori del projecte."""
    if not images:
        return None
    if base_dir is None:
        base_dir = SCRIPTS_DIR.parent
    resolved = []
    for img in images:
        path = Path(img["path"])
        if not path.is_absolute():
            path = base_dir / img["path"]
        resolved.append({"path": str(path), "alt": img.get("alt", "")})
    return resolved


def publish_entry(entry, dry_run=False):
    """Publica un entry del calendari com a fil trilingüe."""
    posts = entry["posts"]
    link = entry.get("link")

    if dry_run:
        print(f"\n=== DRY RUN: {entry['id']} ({entry['date']}) ===")
        for i, p in enumerate(posts):
            print(f"\nPost {i+1} [{p['lang']}]:")
            print(f"  {p['text'][:120]}...")
            if i == 0 and link:
                print(f"  Link: {link}")
            if p.get("images"):
                for j, img in enumerate(p["images"]):
                    print(f"  Imatge {j+1}: {img['path']} (alt: {img.get('alt', '')})")
        return True

    # Carregar mòdul de publicació
    bp = import_module("bluesky-post")

    handle, password = bp.load_env()
    print(f"Autenticant com a {handle}...")
    session = bp.create_session(handle, password)
    print(f"✓ Autenticat")

    # Convertir a format thread
    thread_posts = []
    for i, p in enumerate(posts):
        tp = {"text": p["text"]}
        if i == 0 and link:
            tp["link"] = link
        # Imatges per post (resolent camins relatius)
        if p.get("images"):
            tp["images"] = resolve_image_paths(p["images"])
        thread_posts.append(tp)

    results = bp.post_thread(session, thread_posts)

    print(f"\n✓ Fil publicat amb {len(results)} posts")
    for i, r in enumerate(results):
        post_id = r["uri"].split("/")[-1]
        print(f"  Post {i+1}: https://bsky.app/profile/{handle}/post/{post_id}")

    return True


def main():
    parser = argparse.ArgumentParser(description="Publicació automàtica des del calendari")
    parser.add_argument("--date", help="Data concreta (YYYY-MM-DD), per defecte avui")
    parser.add_argument("--dry-run", action="store_true", help="Mostra sense publicar")
    parser.add_argument("--list", action="store_true", help="Llista posts pendents")
    parser.add_argument("--force", action="store_true", help="Publica encara que ja estigui marcat")
    args = parser.parse_args()

    cal = load_calendar()

    if args.list:
        list_pending(cal)
        return

    target_date = args.date or date.today().isoformat()

    # Buscar entries per a la data
    entries = [e for e in cal if e["date"] == target_date]

    if not entries:
        print(f"No hi ha posts programats per al {target_date}")
        return

    for entry in entries:
        if entry.get("published") and not args.force:
            print(f"⏭ {entry['id']} ja publicat (usa --force per republicar)")
            continue

        print(f"\n{'='*50}")
        print(f"Publicant: {entry['id']} ({entry['type']})")
        print(f"{'='*50}")

        success = publish_entry(entry, dry_run=args.dry_run)

        if success and not args.dry_run:
            entry["published"] = True
            save_calendar(cal)
            print(f"✓ Marcat com a publicat")


if __name__ == "__main__":
    main()
