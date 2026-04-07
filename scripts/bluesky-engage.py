#!/usr/bin/env python3
"""
Gaudí Mosaic — Interacció autònoma a Bluesky

Busca posts rellevants, fa likes automàtics, reposts selectius,
i proposa respostes per a revisió humana.

Ús:
    python3 scripts/bluesky-engage.py              # Executa cicle complet
    python3 scripts/bluesky-engage.py --dry-run    # Mostra sense actuar
    python3 scripts/bluesky-engage.py --replies     # Mostra respostes pendents
"""

import json
import sys
import time
import argparse
from datetime import datetime, timezone, date
from pathlib import Path

import requests

SCRIPTS_DIR = Path(__file__).resolve().parent
LOG_PATH = SCRIPTS_DIR / "engagement-log.json"
REPLIES_PATH = SCRIPTS_DIR / "pending-replies.json"
ENV_PATH = SCRIPTS_DIR.parent / ".env"
API_BASE = "https://bsky.social/xrpc"
PUBLIC_API = "https://public.api.bsky.app/xrpc"

# Termes de cerca rellevants
SEARCH_TERMS = [
    "gaudí", "gaudi", "trencadís", "sagrada familia",
    "parc güell", "park güell", "casa batlló",
    "mosaic art", "ceramic art", "barcelona architecture",
    "#Centenari2026", "#Centenary2026",
    "modernisme barcelona", "art nouveau barcelona",
    "ガウディ",  # Gaudí en japonès
]

# Perfils rellevants per monitoritzar (els més actius dels que seguim)
FOLLOWED_HANDLES = [
    # Ronda 1 — Gaudí, museus, art
    "casavicens.bsky.social",
    "museunacionalartc.bsky.social",
    "mnactec.bsky.social",
    "amicsdelmnac.bsky.social",
    "dpr-barcelona.bsky.social",
    "romaniccatala.bsky.social",
    "bcnfestivals.bsky.social",
    "bette.bsky.social",
    "annemarieprice.bsky.social",
    # Ronda 2 — patrimoni, ceràmica, institucions
    "museutapies.bsky.social",
    "macba.cat",
    "stainedglassmuseum.bsky.social",
    "byzantinemosaics.bsky.social",
    "visitbarcelona.bsky.social",
    "palaumusicacat.bsky.social",
    "patrimindustrial.bsky.social",
    "casaasia.bsky.social",
    "catalunya.bsky.social",
    "acn.cat",
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
    return {"liked": [], "reposted": [], "last_run": None}


def save_log(log):
    log["last_run"] = datetime.now(timezone.utc).isoformat()
    LOG_PATH.write_text(json.dumps(log, ensure_ascii=False, indent=2))


def load_pending_replies():
    if REPLIES_PATH.exists():
        return json.loads(REPLIES_PATH.read_text())
    return []


def save_pending_replies(replies):
    REPLIES_PATH.write_text(json.dumps(replies, ensure_ascii=False, indent=2))


def search_posts(term, limit=15):
    """Cerca posts públics amb un terme."""
    try:
        resp = requests.get(f"{PUBLIC_API}/app.bsky.feed.searchPosts",
                           params={"q": term, "limit": limit, "sort": "latest"},
                           timeout=10)
        if resp.status_code == 200:
            return resp.json().get("posts", [])
    except Exception as e:
        print(f"  Error cercant '{term}': {e}")
    return []


def get_author_feed(session, handle, limit=10):
    """Obté els posts recents d'un perfil."""
    try:
        resp = requests.get(f"{API_BASE}/app.bsky.feed.getAuthorFeed",
                           headers={"Authorization": f"Bearer {session['accessJwt']}"},
                           params={"actor": handle, "limit": limit},
                           timeout=10)
        if resp.status_code == 200:
            return [item["post"] for item in resp.json().get("feed", [])]
    except Exception as e:
        print(f"  Error obtenint feed de {handle}: {e}")
    return []


def like_post(session, uri, cid):
    """Fa like a un post."""
    resp = requests.post(f"{API_BASE}/com.atproto.repo.createRecord",
                        headers={"Authorization": f"Bearer {session['accessJwt']}"},
                        json={
                            "repo": session["did"],
                            "collection": "app.bsky.feed.like",
                            "record": {
                                "$type": "app.bsky.feed.like",
                                "subject": {"uri": uri, "cid": cid},
                                "createdAt": datetime.now(timezone.utc).isoformat()
                            }
                        })
    return resp.status_code == 200


def repost(session, uri, cid):
    """Fa repost d'un post."""
    resp = requests.post(f"{API_BASE}/com.atproto.repo.createRecord",
                        headers={"Authorization": f"Bearer {session['accessJwt']}"},
                        json={
                            "repo": session["did"],
                            "collection": "app.bsky.feed.repost",
                            "record": {
                                "$type": "app.bsky.feed.repost",
                                "subject": {"uri": uri, "cid": cid},
                                "createdAt": datetime.now(timezone.utc).isoformat()
                            }
                        })
    return resp.status_code == 200


def is_relevant_for_like(text):
    """Determina si un post mereix un like."""
    text_lower = text.lower()
    keywords = [
        # Gaudí directe
        "gaudí", "gaudi", "trencadís", "trencadis",
        "sagrada familia", "sagrada família",
        "parc güell", "park güell", "park guell",
        "casa batlló", "casa batllo", "casa milà", "la pedrera",
        "palau güell", "colònia güell",
        # Mosaic i ceràmica
        "mosaic", "mosaïc", "ceramic", "ceràmic", "pottery",
        "stained glass", "vitrall", "azulejo", "tile art",
        # Arquitectura i patrimoni Barcelona
        "modernisme", "modernismo", "art nouveau",
        "barcelona art", "barcelona architect", "bcn art",
        "patrimoni", "heritage", "patrimonio",
        # Cultura catalana
        "cultura catalan", "catalan culture",
        # Japonès
        "ガウディ", "トレンカディス", "モザイク",
    ]
    return any(kw in text_lower for kw in keywords)


def is_relevant_for_repost(text):
    """Determina si un post mereix repost (criteri més estricte)."""
    text_lower = text.lower()
    repost_keywords = [
        "centenari", "centenary", "centenario",
        "100 anys", "100 years", "100 años",
        "exposició gaudí", "gaudí exhibition", "exposición gaudí",
        "trencadís art", "trencadís mosaic",
        "gaudimosaic",
    ]
    return any(kw in text_lower for kw in repost_keywords)


def run_engagement(session, log, dry_run=False):
    """Executa un cicle d'interacció."""
    new_likes = 0
    new_reposts = 0
    pending = load_pending_replies()

    # 1. Buscar posts per termes
    print("\n🔍 Cercant posts rellevants...")
    all_posts = []
    for term in SEARCH_TERMS:
        posts = search_posts(term, limit=10)
        all_posts.extend(posts)
        time.sleep(0.4)

    # 2. Monitoritzar perfils seguits
    print("👁 Monitoritzant perfils seguits...")
    for handle in FOLLOWED_HANDLES:
        posts = get_author_feed(session, handle, limit=5)
        all_posts.extend(posts)
        time.sleep(0.4)

    # Deduplicar
    seen_uris = set()
    unique_posts = []
    for post in all_posts:
        uri = post.get("uri", "")
        if uri not in seen_uris and uri:
            seen_uris.add(uri)
            unique_posts.append(post)

    print(f"  Trobats {len(unique_posts)} posts únics")

    # 3. Processar cada post
    for post in unique_posts:
        uri = post.get("uri", "")
        cid = post.get("cid", "")
        text = post.get("record", {}).get("text", "")
        author = post.get("author", {}).get("handle", "")

        # No interactuar amb els nostres propis posts
        if author == session["handle"]:
            continue

        # Ja processat?
        if uri in log["liked"] or uri in log["reposted"]:
            continue

        # Like?
        if is_relevant_for_like(text):
            if dry_run:
                print(f"  ♡ Like → @{author}: {text[:80]}...")
            else:
                if like_post(session, uri, cid):
                    log["liked"].append(uri)
                    print(f"  ♡ Like → @{author}: {text[:60]}...")
                    new_likes += 1
                time.sleep(1)

        # Repost?
        if is_relevant_for_repost(text):
            if dry_run:
                print(f"  🔁 Repost → @{author}: {text[:80]}...")
            else:
                if repost(session, uri, cid):
                    log["reposted"].append(uri)
                    print(f"  🔁 Repost → @{author}: {text[:60]}...")
                    new_reposts += 1
                time.sleep(1)

    # Resum
    print(f"\n{'='*40}")
    print(f"Resum: {new_likes} likes, {new_reposts} reposts")
    if pending:
        print(f"Respostes pendents de revisió: {len([r for r in pending if r.get('status')=='pending'])}")
    print(f"{'='*40}")

    if not dry_run:
        save_log(log)


def show_pending_replies():
    """Mostra les respostes pendents de revisió."""
    pending = load_pending_replies()
    p = [r for r in pending if r.get("status") == "pending"]
    if not p:
        print("No hi ha respostes pendents.")
        return
    print(f"Respostes pendents: {len(p)}\n")
    for r in p:
        print(f"  De: @{r['original_author']}")
        print(f"  Text: {r['original_text'][:100]}...")
        print(f"  Resposta CA: {r['proposed_reply_ca'][:80]}...")
        print()


def main():
    parser = argparse.ArgumentParser(description="Interacció autònoma a Bluesky")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--replies", action="store_true", help="Mostra respostes pendents")
    args = parser.parse_args()

    if args.replies:
        show_pending_replies()
        return

    log = load_log()

    if args.dry_run:
        print("=== DRY RUN ===")
        # Per dry-run, usem l'API pública sense autenticació
        run_engagement({"did": "", "accessJwt": "", "handle": "gaudimosaic.bsky.social"}, log, dry_run=True)
    else:
        session = create_session()
        print(f"✓ Autenticat com a {session['handle']}")
        run_engagement(session, log)


if __name__ == "__main__":
    main()
