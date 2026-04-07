# Scripts de Bluesky — @gaudimosaic.bsky.social

Scripts per gestionar la presència de Gaudí Mosaic a Bluesky.

## Configuració

1. Crea `.env` a l'arrel del projecte:
```
BLUESKY_HANDLE=gaudimosaic.bsky.social
BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

2. Dependències: `pip install requests` (normalment ja instal·lat)

## Scripts

### `bluesky-post.py` — Publicació directa
```bash
# Post simple
python3 scripts/bluesky-post.py "Hola des de Gaudí Mosaic!"

# Post amb link card
python3 scripts/bluesky-post.py "Visita l'app!" --link https://gaudimosaic.art

# Fil de posts
python3 scripts/bluesky-post.py --thread scripts/thread-launch.json

# Dry run
python3 scripts/bluesky-post.py --thread fitxer.json --dry-run
```

### `bluesky-auto.py` — Publicació des del calendari
```bash
# Publica els posts d'avui
python3 scripts/bluesky-auto.py

# Publica una data concreta
python3 scripts/bluesky-auto.py --date 2026-04-07

# Veure posts pendents
python3 scripts/bluesky-auto.py --list

# Dry run
python3 scripts/bluesky-auto.py --dry-run
```

### `bluesky-engage.py` — Interacció autònoma
```bash
# Cicle complet (likes + reposts)
python3 scripts/bluesky-engage.py

# Dry run
python3 scripts/bluesky-engage.py --dry-run

# Veure respostes pendents de revisió
python3 scripts/bluesky-engage.py --replies
```

### `bluesky-follow.py` — Seguir perfils
```bash
# Seguir perfils del pla
python3 scripts/bluesky-follow.py

# Veure perfils seguits
python3 scripts/bluesky-follow.py --list

# Dry run
python3 scripts/bluesky-follow.py --dry-run
```

### `generate-calendar.py` — Regenerar calendari
```bash
python3 scripts/generate-calendar.py
```

## Fitxers de dades

| Fitxer | Descripció |
|--------|------------|
| `bluesky-calendar.json` | 28 posts programats (10 setmanes + especials) |
| `thread-launch.json` | Fil de llançament trilingüe (ja publicat) |
| `engagement-log.json` | Historial de likes i reposts (generat automàticament) |
| `following-log.json` | Perfils seguits (generat automàticament) |
| `pending-replies.json` | Respostes proposades pendents de revisió humana |

## Workflow setmanal

1. **Dilluns/Dimecres/Divendres**: `python3 scripts/bluesky-auto.py`
2. **Diàriament**: `python3 scripts/bluesky-engage.py`
3. **Revisió**: `python3 scripts/bluesky-engage.py --replies`

## Afegir contingut al calendari

Edita `bluesky-calendar.json` o modifica `generate-calendar.py` i regenera.
Cada entrada té el format:
```json
{
  "id": "identificador-unic",
  "date": "2026-04-07",
  "type": "countdown|quote|educational|special|centenary",
  "published": false,
  "posts": [
    {"lang": "ca", "text": "Text en català..."},
    {"lang": "en", "text": "Text in English..."},
    {"lang": "ja", "text": "日本語テキスト..."}
  ]
}
```
