#!/usr/bin/env python3
"""
Gaudí Mosaic — Seguir perfils rellevants a Bluesky

Segueix els perfils identificats al pla de xarxes socials.

Ús:
    python3 scripts/bluesky-follow.py              # Segueix perfils nous
    python3 scripts/bluesky-follow.py --dry-run    # Mostra sense actuar
    python3 scripts/bluesky-follow.py --list       # Llista perfils seguits
"""

import json
import sys
import time
import argparse
from datetime import datetime, timezone
from pathlib import Path

import requests

SCRIPTS_DIR = Path(__file__).resolve().parent
LOG_PATH = SCRIPTS_DIR / "following-log.json"
ENV_PATH = SCRIPTS_DIR.parent / ".env"
API_BASE = "https://bsky.social/xrpc"

# Perfils del pla de xarxes socials
PROFILES_TO_FOLLOW = [
    # ---- Ronda 1 (2026-04-02) ----
    # Gaudí i Modernisme
    "casavicens.bsky.social",
    "ticketsparkguell.bsky.social",
    "castellerssafa.bsky.social",
    "iambustillo.bsky.social",
    # Museus i Patrimoni
    "museunacionalartc.bsky.social",
    "mnactec.bsky.social",
    "amicsdelmnac.bsky.social",
    "fragmentcultura.bsky.social",
    "romaniccatala.bsky.social",
    "mosaicrooms.bsky.social",
    # Arquitectura
    "dpr-barcelona.bsky.social",
    "ethelbaraona.bsky.social",
    "osubiros.bsky.social",
    # Cultura Catalana
    "pmasca.bsky.social",
    "wkirbyy.bsky.social",
    "catalanmedia.bsky.social",
    "bcnfestivals.bsky.social",
    "craigyknows.bsky.social",
    # Art, Ceràmica i Mosaic
    "bette.bsky.social",
    "annemarieprice.bsky.social",
    "emilydu.bsky.social",
    "politicalpotter.bsky.social",
    "alischorman.com",
    # Connexió Japó-Catalunya
    "anyartnetty.bsky.social",
    # Art Digital
    "izac.us",
    # Cultura Local
    "tomirisllibreria.bsky.social",
    "nausicaacomics.bsky.social",

    # ---- Ronda 2 (2026-04-07) ----
    # Mosaic / Ceràmica / Vidre artístic
    "stainedglassmuseum.bsky.social",   # The Stained Glass Museum
    "byzantinemosaics.bsky.social",     # Byzantine Mosaics
    "carterpottery.bsky.social",        # Carter Pottery
    "breadsticc.art",                   # Rosemary — Stained Glass Artist
    "curiositygarden.bsky.social",      # Curiosity Garden — Stained Glass Artist
    # Museus i Patrimoni Barcelona
    "museutapies.bsky.social",          # Fundació Antoni Tàpies
    "macba.cat",                        # MACBA — Museu d'Art Contemporani BCN
    "patrimindustrial.bsky.social",     # Patrimoni Industrial Arquitectònic
    "iberapt.bsky.social",             # IBER — Arqueologia, Patrimoni i Turisme
    "museumsandheritage.com",           # Museums + Heritage
    # Cultura catalana i media
    "acn.cat",                          # Agència Catalana de Notícies
    "advocaciacatalana.bsky.social",    # Consell de l'Advocacia Catalana
    "ccma.bsky.social",                 # CCMA — Corporació Catalana Mitjans Audiovisuals
    "321.bsky.social",                  # 3/21 — Xarxa Patrimoni
    "catalunya.bsky.social",            # Catalunya — compte de difusió cultural
    "catalanarts.bsky.social",          # Catalan Arts
    # Art digital / Japó
    "abstractjp.bsky.social",           # Japan Abstract Contemporary Digital Art
    "mymoda.bsky.social",              # MoDA — Museum of Digital Art
    "casaasia.bsky.social",             # Casa Asia — pont Àsia-Catalunya
    # Patrimoni / Arquitectura / Art
    "michalcudrnak.bsky.social",        # Museums, architecture, digital
    "artstuffmatters.bsky.social",      # Cultural worker/curator/art historian
    "neilfawle.bsky.social",           # Traductor ES-EN, art, museus
    "3dstoa.bsky.social",              # 3D Stoa — Patrimonio y Tecnología
    # Turisme i Institucions
    "visitbarcelona.bsky.social",       # Visit Barcelona — turisme oficial
    "palaumusicacat.bsky.social",       # Palau de la Música Catalana
]


def load_env():
    env = {}
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"): continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip()
    return env["BLUESKY_HANDLE"], env["BLUESKY_APP_PASSWORD"]


def create_session():
    handle, password = load_env()
    resp = requests.post(f"{API_BASE}/com.atproto.server.createSession",
                         json={"identifier": handle, "password": password})
    if resp.status_code != 200:
        print(f"Error d'autenticació: {resp.text}")
        sys.exit(1)
    data = resp.json()
    return {"did": data["did"], "accessJwt": data["accessJwt"], "handle": handle}


def load_log():
    if LOG_PATH.exists():
        return json.loads(LOG_PATH.read_text())
    return {"followed": [], "last_run": None}


def save_log(log):
    log["last_run"] = datetime.now(timezone.utc).isoformat()
    LOG_PATH.write_text(json.dumps(log, ensure_ascii=False, indent=2))


def resolve_handle(handle):
    """Resol un handle a un DID."""
    try:
        resp = requests.get(f"{API_BASE}/com.atproto.identity.resolveHandle",
                           params={"handle": handle}, timeout=10)
        if resp.status_code == 200:
            return resp.json().get("did")
    except:
        pass
    return None


def follow_user(session, did):
    """Segueix un usuari pel seu DID."""
    resp = requests.post(f"{API_BASE}/com.atproto.repo.createRecord",
                        headers={"Authorization": f"Bearer {session['accessJwt']}"},
                        json={
                            "repo": session["did"],
                            "collection": "app.bsky.graph.follow",
                            "record": {
                                "$type": "app.bsky.graph.follow",
                                "subject": did,
                                "createdAt": datetime.now(timezone.utc).isoformat()
                            }
                        })
    return resp.status_code == 200


def main():
    parser = argparse.ArgumentParser(description="Seguir perfils rellevants a Bluesky")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--list", action="store_true", help="Llista perfils seguits")
    args = parser.parse_args()

    log = load_log()

    if args.list:
        if not log["followed"]:
            print("Cap perfil seguit encara.")
        else:
            print(f"Perfils seguits ({len(log['followed'])}):\n")
            for f in log["followed"]:
                print(f"  @{f['handle']} — {f['date']}")
        return

    already_followed = {f["handle"] for f in log["followed"]}
    to_follow = [h for h in PROFILES_TO_FOLLOW if h not in already_followed]

    if not to_follow:
        print("Tots els perfils del pla ja estan seguits.")
        return

    print(f"Perfils per seguir: {len(to_follow)}")

    if not args.dry_run:
        session = create_session()
        print(f"✓ Autenticat com a {session['handle']}\n")

    followed = 0
    failed = 0

    for handle in to_follow:
        if args.dry_run:
            print(f"  → Seguiria @{handle}")
            followed += 1
            continue

        # Resolem handle a DID
        did = resolve_handle(handle)
        if not did:
            print(f"  ✗ @{handle} — no trobat")
            failed += 1
            time.sleep(1)
            continue

        # Seguir
        if follow_user(session, did):
            log["followed"].append({
                "handle": handle,
                "did": did,
                "date": datetime.now(timezone.utc).isoformat()
            })
            print(f"  ✓ @{handle}")
            followed += 1
        else:
            print(f"  ✗ @{handle} — error seguint")
            failed += 1

        # Rate limiting: 3 segons entre cada follow
        time.sleep(3)

    if not args.dry_run:
        save_log(log)

    print(f"\n{'='*40}")
    print(f"Seguits: {followed} | Fallats: {failed}")
    print(f"{'='*40}")


if __name__ == "__main__":
    main()
