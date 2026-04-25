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
import logging
import time
from datetime import date, datetime, timezone
from pathlib import Path

import requests

SCRIPTS_DIR = Path(__file__).resolve().parent
CALENDAR_PATH = SCRIPTS_DIR / "bluesky-calendar.json"
LOG_DIR = SCRIPTS_DIR / "logs"
LOG_PATH = LOG_DIR / "bluesky-auto.log"

# Reintents per errors transitoris (rate limit 429 i timeouts de xarxa)
RETRY_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 60


def setup_logging():
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    handler = logging.FileHandler(LOG_PATH, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(handler)
    # Només duplicar a stdout quan l'execució és interactiva; si ve de cron, el
    # fitxer FileHandler ja recull tots els missatges.
    if sys.stdout.isatty():
        stream = logging.StreamHandler()
        stream.setFormatter(logging.Formatter("%(message)s"))
        root.addHandler(stream)


log = logging.getLogger(__name__)

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

    # Reintents per a errors transitoris: 429 (rate limit) i timeouts de xarxa.
    # Cobreix tant l'autenticació com la publicació — al divendres 24/04 el cron
    # es va quedar penjat a `create_session` abans de cap retry, així que
    # l'autenticació ha d'estar dins del bucle.
    # Qualsevol altre BlueskyAPIError es propaga immediatament per no emmascarar
    # 400 (text massa llarg, contingut invàlid, etc.).
    results = None
    for attempt in range(1, RETRY_ATTEMPTS + 1):
        try:
            log.info("Autenticant com a %s (intent %d/%d)...", handle, attempt, RETRY_ATTEMPTS)
            session = bp.create_session(handle, password)
            log.info("✓ Autenticat")
            results = bp.post_thread(session, thread_posts)
            break
        except bp.BlueskyAPIError as e:
            if e.status_code == 429 and attempt < RETRY_ATTEMPTS:
                log.warning(
                    "Rate limit 429 (intent %d/%d). Esperant %ds abans de reintentar...",
                    attempt, RETRY_ATTEMPTS, RETRY_BACKOFF_SECONDS,
                )
                time.sleep(RETRY_BACKOFF_SECONDS)
                continue
            log.error(
                "Publicació fallida (%s) [HTTP %s]: %s",
                entry["id"], e.status_code, e.message,
            )
            raise
        except requests.exceptions.Timeout as e:
            if attempt < RETRY_ATTEMPTS:
                log.warning(
                    "Timeout de xarxa (intent %d/%d): %s. Esperant %ds abans de reintentar...",
                    attempt, RETRY_ATTEMPTS, e, RETRY_BACKOFF_SECONDS,
                )
                time.sleep(RETRY_BACKOFF_SECONDS)
                continue
            log.error(
                "Publicació fallida (%s) després de %d intents per timeout: %s",
                entry["id"], RETRY_ATTEMPTS, e,
            )
            raise

    if not results:
        return False

    log.info("Fil publicat amb %d posts (%s)", len(results), entry["id"])
    for i, r in enumerate(results):
        post_id = r["uri"].split("/")[-1]
        log.info("  Post %d: https://bsky.app/profile/%s/post/%s", i + 1, handle, post_id)

    # Desar URIs dels posts publicats al entry (per al primer, que és el root)
    entry["published_uris"] = [r["uri"] for r in results]

    return True


def main():
    parser = argparse.ArgumentParser(description="Publicació automàtica des del calendari")
    parser.add_argument("--date", help="Data concreta (YYYY-MM-DD), per defecte avui")
    parser.add_argument("--dry-run", action="store_true", help="Mostra sense publicar")
    parser.add_argument("--list", action="store_true", help="Llista posts pendents")
    parser.add_argument("--force", action="store_true", help="Publica encara que ja estigui marcat")
    args = parser.parse_args()

    setup_logging()
    cal = load_calendar()

    if args.list:
        list_pending(cal)
        return

    target_date = args.date or date.today().isoformat()

    # Buscar entries per a la data
    entries = [e for e in cal if e["date"] == target_date]

    if not entries:
        log.info("No hi ha posts programats per al %s", target_date)
        return

    for entry in entries:
        if entry.get("published") and not args.force:
            log.info("⏭ %s ja publicat (usa --force per republicar)", entry["id"])
            continue

        log.info("Publicant %s (%s, data calendari %s)", entry["id"], entry["type"], entry["date"])

        try:
            success = publish_entry(entry, dry_run=args.dry_run)
        except Exception as e:
            log.error("Error irrecuperable publicant %s: %s", entry["id"], e)
            sys.exit(1)

        if success and not args.dry_run:
            entry["published"] = True
            entry["published_at"] = datetime.now(timezone.utc).isoformat()
            save_calendar(cal)
            log.info("✓ %s marcat com a publicat (%s)", entry["id"], entry["published_at"])


if __name__ == "__main__":
    main()
