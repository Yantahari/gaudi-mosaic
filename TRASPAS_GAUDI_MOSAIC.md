# TRASPÀS GAUDÍ MOSAIC — Document de Context Complet

**Data:** 15 de març de 2026
**Projecte:** Gaudí Mosaic — Trencadís Creator
**URL producció:** https://gaudimosaic.art
**URL backup:** https://gaudimosaic.netlify.app
**Propòsit:** Document de traspàs per continuar el desenvolupament sense pèrdua de context.

---

## 1. Estat Tècnic Actual

### 1.1 Arquitectura del Projecte

App web estàtica (HTML/CSS/JS purs amb ES Modules). Zero dependències. No build step. Desplegada a Netlify.

```
gaudi-mosaic/
├── index.html                    # Punt d'entrada, meta tags OG, estructura HTML
├── css/
│   ├── styles.css                # Estils principals, layout escriptori, variables CSS
│   ├── splash.css                # Pantalla de benvinguda
│   ├── panels.css                # Panells laterals (ceràmiques, capes, plantilles)
│   └── modals.css                # Modals (educatiu, trencament, exportació) + media queries mòbil
├── js/
│   ├── app.js                    # Inicialització, event listeners globals, dreceres teclat
│   ├── state.js                  # Estat centralitzat pub/sub (emit/subscribe)
│   ├── engine/
│   │   ├── fracture.js           # 3 algorismes: Voronoi (Lloyd relaxation), Radial, Orgànic
│   │   ├── canvas.js             # Motor de renderitzat Canvas 2D, drawPiece, drawGrout, interaccions
│   │   └── ceramics.js           # Generació de rajoles (ara carrega textures Midjourney, fallback procedural eliminat)
│   ├── ui/
│   │   ├── splash.js             # Pantalla benvinguda, cita aleatòria, selector idioma
│   │   ├── panels.js             # Panell ceràmiques (col·leccions, filtre acabat), capes, plantilles
│   │   ├── toolbar.js            # Barra eines, safata fragments, events mòbil (tap-to-place)
│   │   ├── breakzone.js          # Zona trencament (sense línies manuals, eliminades)
│   │   └── modals.js             # Modal educatiu (guia, bio, trencadís, natura, curiositats, privacitat, contacte) + modal exportació/compartir
│   ├── data/
│   │   ├── palettes.js           # Definició de paletes i col·leccions (parcGuell, mediterrani, jocsFlorals, mosaicClassic)
│   │   ├── templates.js          # 6 plantilles SVG vectoritzades des de Midjourney
│   │   ├── textures.js           # TEXTURE_MANIFEST: mapa de textures Midjourney, càrrega, cache, estructura packs
│   │   └── content.js            # Contingut educatiu (biografia, timeline, curiositats, cites)
│   ├── i18n/
│   │   ├── i18n.js               # Mòdul central i18n: t(), setLanguage(), localStorage preferència
│   │   ├── ca.js                 # Català (complet)
│   │   ├── en.js                 # Anglès (complet)
│   │   ├── ja.js                 # Japonès (placeholder, Fase 2)
│   │   └── es.js                 # Castellà (placeholder, hasEasterEgg: true, Fase 2)
│   └── utils/
│       ├── storage.js            # localStorage: guardar/carregar projectes, autoguardat 60s
│       ├── export.js             # Exportació PNG 2x + modal compartir (Web Share API)
│       └── helpers.js            # Utilitats diverses
├── assets/
│   ├── textures/                 # 37 rajoles Midjourney (.png)
│   │   ├── parcguell-vidriat1..5.png
│   │   ├── parcguell-mat1..4.png
│   │   ├── parcguell-iridiscent1..4.png
│   │   ├── parcguell-rustic1..4.png
│   │   ├── mediterrani1..4.png
│   │   ├── jocsflorals1..4.png
│   │   ├── mosaic-iridiscent1..4.png
│   │   ├── mosaic-mat1..4.png
│   │   └── mosaic-rustic1..4.png
│   ├── og-image.png              # Imatge Open Graph 1200x630 per xarxes socials
│   └── favicon.svg               # Favicon mosaic 4 colors
```

### 1.2 Arquitectura CSS — Media Queries i Breakpoints

**Breakpoint principal:** `@media (max-width: 768px)` per a mòbil.

**Fitxers amb media queries de mòbil:**
- `styles.css` — Layout general, .mobile-nav (display: none per defecte, display: flex a mòbil)
- `panels.css` — Panell ceràmiques, grid de rajoles, controls
- `modals.css` — Principals canvis mòbil: capçalera simplificada, pestanyes, vista eines, breakzone, modal exportació

**⚠️ PROBLEMA CENTRAL: El CSS és desktop-first amb media queries afegides.** Els canvis dins media queries afecten múltiples elements en cascada. Per exemple, `.modal-body` afecta tant el modal d'exportació com la zona de trencament.

### 1.3 Mapa de Conflictes CSS Coneguts

| Selector | Afecta a | Problema |
|----------|----------|----------|
| `.modal-body` | Modal exportació + Zona trencament | Canvis a overflow/padding afecten ambdós |
| `.ceramics-grid` | Catàleg rajoles | align-content/aspect-ratio afecta la mida de les rajoles de forma diferent segons el nombre de variants per col·lecció |
| `canvas` dins `.modal-body` | breakCanvas + previsualització exportació | Regles genèriques de canvas afecten tots dos |
| `.header-btn` | Capçalera desktop + mòbil | display:none per amagar botons en mòbil pot no aplicar-se per especificitat |
| `.mobile-nav` | Pestanyes inferiors | z-index conflicte amb safata de fragments |
| `.piece-tray` / safata | Safata fragments | z-index, position, display canvien entre desktop i mòbil de forma complexa |

### 1.4 Variables i Configuració Important

**CSS Variables (styles.css):**
```css
--gaudi-dark: #1C1914;
--gaudi-gold: #D4A843;
--gaudi-cream: #F5ECD7;
--gaudi-blue: #2E6B8A;
--gaudi-teal: #1A8A7D;
```

**State (state.js):**
- `state.groutColor`: '#B5A898' (gris ciment clar, per defecte)
- `state.groutWidth`: 2 (màxim 4)
- `state.projectName`: pot ser null (causa del bug d'exportació — fix: fallback 'gaudi-mosaic')
- `state.language`: 'ca' (per defecte, guardat a localStorage)

**Textures (textures.js):**
- `MAX_VARIANTS`: 8
- `TEXTURE_MANIFEST`: objecte que mapeja col·lecció+acabat → llista d'arxius
- `TEXTURE_PACKS`: estructura per a futur sistema de packs premium (tot desbloquejat)

---

## 2. Bugs Coneguts

### 2.1 Bugs Mòbil NO Resolts (estat a 15 de març de 2026)

| # | Bug | Severitat | Detalls |
|---|-----|-----------|---------|
| M1 | **Rajoles primera fila comprimides** | Alt | Les rajoles de la primera fila de cada col·lecció (excepte Parc Güell amb 5 variants) es veuen com a franges primes/comprimides. Les de la fila inferior tapen les superiors. El grau de solapació hauria de ser uniforme com a Parc Güell. |
| M2 | **Fragments no apareixen al llenç** | Crític | Regressió: al deploy #3 funcionava (safata tap-to-place). Després dels deploys #4-#7 ha deixat de funcionar. La safata en mòbil queda dins un contenidor display:none o amb z-index incorrecte. |
| M3 | **Zona trencament: rajola retallada** | Alt | La rajola no es mostra sencera dins la zona de trencament en mòbil. Retallada pels costats i/o inferior. |
| M4 | **Zona trencament: resultat incomplet** | Alt | Després de trencar, no es veuen tots els fragments resultants. Abans es veien. |
| M5 | **Modal exportació: botons fora de pantalla** | Alt | El modal "Your mosaic is ready!" no scroleja. Els botons Compartir i Descarregar queden per sota de la part visible. |
| M6 | **Benvinguda: mosaic tapa títol** | Baix | El mosaic generatiu solapa parcialment "Gaudí Mosaic" i "TRENCADÍS CREATOR" en mòbil. |
| M7 | **Capçalera: element daurat tallat** | Baix | Element parcialment visible a la dreta de la capçalera en mòbil. Persistent. |
| M8 | **Catàleg: scroll Jocs Florals** | Mig | L'última col·lecció pot no ser completament visible (padding-bottom insuficient). |

### 2.2 Bugs Resolts (per no repetir intents)

| Bug | Resolució | Data |
|-----|-----------|------|
| Línies fractura no funcionen | **Eliminada la funcionalitat.** Decisió de disseny: l'atzar decideix. | 4 març |
| Tipus ceràmica sense diferències | **Eliminats filtres de codi.** Les diferències vénen de les imatges Midjourney. | 4 març |
| Restes fantasma trencament orgànic | Smoothing pass a fracture.js | 4 març |
| Fragments no es consumeixen post-scroll | Splice al handler de drag & drop | 4 març |
| Plantilles descentrades post-scroll | Fix de coordenades | 4 març |
| Guardar sobreescriu sense opció | Pregunta sobreescriure o crear nou | 4 març |
| Rejunt rectangular (7 intents) | **Canvas temporal amb silueta ampliada.** No Path2D ni polígons. | 11 març |
| Fragments no desapareixen en arrossegar | Splice abans d'emit | 4 març |
| Botó ❓ redundant | Unificat amb botó Gaudí | 4 març |
| Exportar no funciona (desktop) | state.projectName null → fallback 'gaudi-mosaic' | 15 març |
| Mòbil inutilitzable (panell bloqueja llenç) | Barra navegació inferior amb pestanyes | 4-11 març |
| Contrast insuficient | Audit WCAG AA, 18 elements millorats a >4.5:1 | 13 març |
| Girar no funciona en mòbil | Afegit touchmove handler per rotació | 4 març |
| Pestanyes mòbils visibles en escriptori | display:none fora del media query | 4 març |
| Cache del navegador impedeix veure canvis | **Ctrl+Shift+R** (force refresh) | 4 març |

### 2.3 Historial dels 7 Deploys del 15 de Març (Què va fallar)

| Deploy | Canvis | Resultat | Per què va fallar |
|--------|--------|----------|-------------------|
| #1 | 9 bugs simultanis (export, fragments, botons, splash, espai, idioma, capçalera, rejunt) | Parcial | Fragments s'abocaven tots de cop al llenç (no safata) |
| #2 | align-content:start + social sharing + modal exportació | Parcial | Modal no scroleja |
| #3 | Safata tap-to-place + pestanyes ocultes + capçalera compacta + mosaic reduït | **Millor moment** | Rajoles primes persistien |
| #4 | padding-bottom:100% per rajoles quadrades + breakzone overflow + canvas 200x200 | **Regressió** | padding-bottom:100% trick va canviar el renderitzat del canvas, degradant qualitat |
| #5 | Revertir padding-bottom + ajusts breakzone + modal padding | **Pitjor** | Canvis en cascada: arreglar una cosa trencava una altra |
| #6 | Intent de reversió total | Incomplet | No es van revertir tots els canvis |
| #7 | Estat matí + align-content:start | Incoherent | La reversió no va ser completa, estat CSS indefinit |

**Lliçó clau:** Mai fer més de 1-2 canvis CSS de mòbil simultanis. El CSS desktop-first amb media queries crea dependències no òbvies entre elements.

---

## 3. Decisions de Disseny Preses

### 3.1 Decisions de Producte

| Decisió | Justificació | Data |
|---------|-------------|------|
| Tot el projecte en català | Homenatge a Gaudí, qui va ser arrestat el 1924 per defensar el català | Inici |
| Eliminar línies de fractura manuals | 2 intents fallits. L'atzar decideix com en un trencadís real. Simplifica UI. | 4 març |
| Textures Midjourney obligatòries per al MVP | Les procedurals no provoquen "què bonic!". Les rajoles han de ser desitjables. | 4 març |
| Fragments es consumeixen sempre | Cada fragment és únic com en un trencadís real. | 4 març |
| Múltiples variants per rajola (×4) | Cada prompt Midjourney genera 4 variacions. Totes es guarden. | 4 març |
| Eliminar textures procedurals | Diferència de qualitat massa gran amb Midjourney. 37 espectaculars > 37+40 mediocres. | 11 març |
| Col·leccions com a unitat d'organització | Cada col·lecció completa i autocontinguda. Encaixa amb packs premium futurs. | 11 març |
| Mediterrani i Jocs Florals = acabat Vidriat | Per al filtre d'acabat al catàleg. | 11 març |
| 36 rajoles gratuïtes al llançament | Generar tracció primer, monetitzar amb col·leccions futures. | 11 març |
| Plantilles no disponibles en mòbil | Pantalla massa petita, difícil treballar-hi. Decisió raonada. | 15 març |
| "Gratuïta" sense mencionar codi obert | Decisió pendent: open source sí o no. | 13 març |
| Domini .art | gaudimosaic.art — encaixa amb projecte artístic. $3.60/any primer any. | 13 març |

### 3.2 Decisions d'Arquitectura CSS

| Decisió | Implicació |
|---------|-----------|
| Desktop-first amb media queries | Causa dels conflictes CSS en mòbil. Cal reescriure mòbil de forma cohesiva. |
| Breakpoint 768px | Únic breakpoint per a mòbil |
| .mobile-nav pestanyes inferiors | 4 vistes: Ceramics, Canvas, Layers, Tools |
| Capçalera simplificada mòbil | Només logo + botó Gaudí. Resta d'accions a vista Tools. |
| Safata tap-to-place mòbil | Click event per col·locar peces al centre del llenç (no drag) |

### 3.3 Decisions Futures Compromeses (Fase 2, abans 10 juny 2026)

| Decisió | Detalls |
|---------|---------|
| Versió japonesa | Traducció professional necessària. Mercat enorme per Gaudí. |
| Easter egg castellà | En lloc de versió traduïda: documentar la detenció de Gaudí el 1924 per negar-se a parlar castellà. Retalls de premsa d'època + al·legat en defensa del català. To: "digne i respectuós, no agressiu" (directiva COO). |
| Packs premium (1,99€) | Col·leccions Casa Batlló, Sagrada Família, El Matí, Nocturn, etc. Estructura preparada a textures.js. |
| Possible 5è acabat: Relleu/Volum | Rajoles amb profunditat 3D, ceràmica reciclada estil Gaudí real. Pack premium especial. |

---

## 4. Funcionalitats Implementades

### 4.1 Estat per Plataforma

| Funcionalitat | Desktop | Mòbil | Notes |
|---------------|---------|-------|-------|
| Pantalla benvinguda | ✅ | ⚠️ Mosaic tapa títol | Selector idioma integrat |
| Catàleg rajoles (37 Midjourney) | ✅ | ❌ Rajoles comprimides | 4 col·leccions, filtre acabat |
| Filtre per acabat | ✅ | ✅ | Vidriat/Mat/Iridiscent/Rústic |
| Zona trencament | ✅ | ❌ Retallada | 3 algorismes + granularitat |
| Safata fragments + drag | ✅ | ❌ Regressió | Tap-to-place funcionava al deploy #3 |
| Canvas composició | ✅ | ❌ Fragments no apareixen | Moure, girar, escalar, duplicar, eliminar |
| Zoom + Pan | ✅ | No testat | Roda ratolí / espai+arrossegar |
| Capes | ✅ | ✅ | Crear, reordenar, visibilitat |
| Rejunt configurable | ✅ | No testat | Color + gruix, silueta ampliada |
| Plantilles SVG (6) | ✅ | ❌ Eliminades intencionalment | Opacitat + mida ajustables |
| Exportació PNG | ✅ | ❌ Botons fora pantalla | 2x resolució, crop automàtic |
| Social Sharing (Web Share API) | Descarregar | ❌ Botons fora pantalla | Sheet natiu en Android/iOS |
| Guardar / Carregar | ✅ | No testat | localStorage + confirmació sobreescriptura |
| Autoguardat | ✅ | No testat | Cada 60s amb notificació |
| Contingut educatiu | ✅ | ✅ | Bio, timeline, trencadís, natura, curiositats, 15 cites |
| Guia d'ús | ✅ | ✅ | Primera pestanya modal Gaudí + tecla ? |
| Privacitat | ✅ | ✅ | No recull dades, localStorage local |
| Contacte | ✅ | ✅ | contact@gaudimosaic.art + xarxes (placeholder) |
| i18n CA + EN | ✅ | ✅ | Complet. JA i ES placeholders. |
| Easter egg (doble clic logo) | ✅ | No testat | Cita aleatòria de Gaudí |
| Dreceres teclat | ✅ | N/A | V/R/S/X, G, Ctrl+Z/D/S/O/E, ?, Supr, fletxes, +/- |
| Contrast WCAG AA | ✅ | ✅ | 18 elements >4.5:1 |
| Meta tags OG + Twitter Cards | ✅ | ✅ | og-image.png 1200x630 |

### 4.2 Social Sharing — Detall

Implementat a `export.js`. Modal amb previsualització del mosaic + botons:
- **Compartir** (📤): Visible si `navigator.share` disponible (Android, iOS Safari). Comparteix PNG + text amb hashtags + URL.
- **Descarregar** (↓): Sempre visible. Descarrega PNG.
- **Problema actual:** Modal no scroleja en mòbil, botons queden fora de pantalla.
- Text compartit inclou: #GaudíMosaic #Trencadís #Gaudí2026 + gaudimosaic.art
- Bilingüe CA/EN.

### 4.3 i18n — Detall

Sistema a `js/i18n/`:
- `i18n.js`: Mòdul central amb `t('clau.subclau')`, `setLanguage('en')`, localStorage.
- `ca.js`: Complet (idioma per defecte).
- `en.js`: Complet.
- `ja.js`: Placeholder (estructura creada, contingut pendent).
- `es.js`: Placeholder amb `hasEasterEgg: true` per al contingut especial de la Fase 2.
- Cites de Gaudí mantingudes en català en tots els idiomes.
- Noms de col·leccions i plantilles mantinguts en català (noms propis).
- Selector d'idioma a la benvinguda i dins l'app.

---

## 5. Assets i Recursos

### 5.1 Rajoles Midjourney — Inventari Complet

| Col·lecció | Acabat | Fitxers | Total |
|------------|--------|---------|-------|
| Parc Güell | Vidriat | parcguell-vidriat1..5.png | 5 |
| Parc Güell | Mat | parcguell-mat1..4.png | 4 |
| Parc Güell | Iridiscent | parcguell-iridiscent1..4.png | 4 |
| Parc Güell | Rústic | parcguell-rustic1..4.png | 4 |
| Mediterrani | Vidriat | mediterrani1..4.png | 4 |
| Jocs Florals | Vidriat | jocsflorals1..4.png | 4 |
| Mosaic Clàssic | Iridiscent | mosaic-iridiscent1..4.png | 4 |
| Mosaic Clàssic | Mat | mosaic-mat1..4.png | 4 |
| Mosaic Clàssic | Rústic | mosaic-rustic1..4.png | 4 |
| **TOTAL** | | | **37** |

Carpeta: `assets/textures/`
Totes les imatges són quadrades, alta resolució (1024x1024 o superior).

### 5.2 Plantilles SVG

| Plantilla | Descripció | Origen |
|-----------|------------|--------|
| El Drac | Drac del Parc Güell amb mosaic dins silueta | Midjourney → potrace → SVG |
| Salamandra | Salamandra del Parc Güell amb trencadís | Midjourney → potrace → SVG |
| Banc Serpentí | Banc ondulant amb detall mosaic | Midjourney → potrace → SVG |
| Creu Gaudiniana | Creu quatre braços amb pinacle | Midjourney → potrace → SVG |
| Rosassa | Rosassa gòtica amb traceria radial | Midjourney → potrace → SVG |
| Sagrada Família | Silueta detallada basílica | Midjourney → potrace → SVG |

Definides a `js/data/templates.js`. Amb controls d'opacitat i mida (només escriptori).

### 5.3 Fórmula de Prompts Midjourney que Funciona

**Per a rajoles/textures ceràmiques:**
```
seamless [acabat] ceramic texture, [colors descriptius], organic subtle color variations, smooth continuous [acabat] surface with depth and luminosity, solid unbroken [acabat] filling entire image --ar 1:1 --s 250 --q 2 --no mosaic tiles pattern fragments grid cracks photograph frame border edge table background
```

**Exemple (Parc Güell vidriat):**
```
seamless glazed ceramic texture, rich golden yellows blending into Mediterranean blues and emerald greens with warm orange accents on cream, organic subtle color variations, smooth continuous glossy surface with depth and luminosity, solid unbroken glaze filling entire image --ar 1:1 --s 250 --q 2 --no mosaic tiles pattern fragments grid cracks photograph frame border edge table background
```

**Per a plantilles/siluetes:**
```
black silhouette of [objecte], [detalls específics], mosaic texture detail within silhouette, clean outline on pure white background, vector style, no shadows, no gradients --ar 1:1 --s 100 --q 2 --no color texture photograph realistic
```

**Claus descobertes per assaig-error:**
- MAI dir "tile" → Midjourney fotografía la rajola com a objecte
- Usar "seamless texture" en lloc de "tile surface"
- Afegir `--no mosaic tiles pattern` per evitar mosaics dins la rajola
- Afegir `--no photograph frame border edge table background` per evitar que la fotografiï
- "filling entire image" + "edge to edge" → la textura omple tota la imatge
- Cada prompt genera 4 variacions — guardar-les totes (nomenclatura: paleta-acabat1..4.png)

**40 prompts complets preparats a:** `prompts-midjourney-rajoles-v2.md`

### 5.4 Mosaics "Descartats"

~30 imatges de rajoles amb patró mosaic (generats abans de trobar la fórmula correcta). Guardats a `assets/mosaic-inspiracio/` o similar. Possibles usos: fons temàtics, contingut educatiu, marketing.

---

## 6. Configuració de Producció

### 6.1 Netlify

- **URL:** https://gaudimosaic.netlify.app
- **Admin:** https://app.netlify.com/projects/gaudimosaic
- **Deploy:** Manual o des de CLI (`netlify deploy --prod`)
- **Pla:** Gratuït (100GB bandwidth/mes, 1000 deploys/mes)
- **Build:** Cap (site estàtic, carpeta arrel = projecte)
- **68 fitxers** al deploy actual

### 6.2 Domini (Porkbun)

- **Domini:** gaudimosaic.art
- **Registrador:** Porkbun
- **Admin:** https://porkbun.com/account/domainsSpeedy
- **Cost:** $3.60 primer any, renovació $21.11/any
- **Auto-renew:** Activat
- **Expiració:** 2027-03-13
- **DNS Records:**
  - A: gaudimosaic.art → 75.2.60.5 (Netlify)
  - CNAME: www.gaudimosaic.art → gaudimosaic.netlify.app
  - MX: fwd1.porkbun.com (10), fwd2.porkbun.com (20)
  - TXT: v=spf1 include:_spf.porkbun.com ~all

### 6.3 Email

- **Adreça:** contact@gaudimosaic.art
- **Tipus:** Email forwarding (Porkbun, gratuït)
- **Reenvia a:** Gmail personal
- **Configuració:** Porkbun → Email Hosting → Email Forwarding

### 6.4 HTTPS

- **Certificat:** Let's Encrypt via Netlify
- **Estat:** Actiu i automàtic
- **Renovació:** Automàtica per Netlify

### 6.5 Cost Total

| Concepte | Cost anual |
|----------|-----------|
| Domini gaudimosaic.art | $21.11 (renovació) |
| Netlify hosting | $0 |
| Email forwarding | $0 |
| HTTPS | $0 |
| **TOTAL** | **~$21/any** |

---

## 7. Lo que NO Hay que Hacer

### 7.1 Enfocaments CSS que van fallar

| Què es va intentar | Per què va fallar | Alternativa |
|--------------------|-------------------|-------------|
| `padding-bottom: 100%` per fer rajoles quadrades | Canvia el renderitzat del canvas intern, degradant qualitat d'imatge | Usar `aspect-ratio: 1` natiu |
| Múltiples canvis CSS mòbil simultanis | Efecte cascada: arreglar una cosa trenca una altra | Un canvi a la vegada amb verificació |
| `.modal-body canvas { width: auto !important }` | Afecta TOTS els canvas dins modals (breakzone + exportació) | Selectors més específics per a cada modal |
| `position: sticky` per títols col·leccions mòbil | Desconnecta el títol de les seves rajoles en scroll | Títols en flux normal |
| Fixes sense verificar en mòbil real | DevTools no replica barres navegador, safe areas, touch | Sempre verificar en dispositiu real |
| Revertir "tots els canvis" d'una sessió | Difícil garantir reversió completa si no hi ha git | Usar git commits per cada deploy |

### 7.2 Patrons que causen regressions

1. **Regles CSS genèriques dins media queries:** `.modal-body`, `canvas`, `.panel` — afecten múltiples vistes.
2. **z-index wars:** La safata, la nav inferior, els modals, els dropdowns — tots competeixen per z-index. Mapa actual:
   - .mobile-nav: z-index 150
   - .piece-tray: z-index 200 (quan funciona)
   - Modals: z-index variable
3. **overflow: hidden a contenidors pare:** Amaga elements fills que haurien de ser visibles (safata, dropdowns).
4. **display: none condicional:** Quan un contenidor pare té display:none, els fills no es renderitzen (problema de la safata en mòbil).

### 7.3 Errors a Evitar

1. **No confiar en els reports de Claude Code** — Sempre verificar visualment cada canvi. Claude Code ha reportat bugs com a "resolts" que no ho estaven (problema de cache + connexió WiFi).
2. **Ctrl+Shift+R obligatori** — El cache del navegador és el major enemic del testing.
3. **No fer deploy sense testejar localment primer** — Cada deploy consumeix crèdits i temps.
4. **Ampliar /effort de Claude Code al màxim** per a canvis de layout mòbil.
5. **No barrejar sessions de "noves funcionalitats" amb "poliment mòbil"** — Prioritzar malament porta a fer tot a mitges.

---

## 8. Roadmap i Prioritats

### 8.1 Immediat (pròxima sessió)

1. **Reescriure CSS mòbil** de forma cohesiva (no pegats). Sessió dedicada.
2. Verificar cada canvi amb DevTools a 400px ABANS de deploy.
3. UN SOL deploy final amb tots els canvis testejats.

### 8.2 Curt termini (abans del llançament mòbil)

1. CSS mòbil estable (catàleg, trencament, canvas, exportació)
2. Safata tap-to-place funcional
3. Modal exportació accessible
4. Watermark "gaudimosaic.art" als PNG exportats (P1 de l'auditoria)
5. Tutorial primera vegada (P1 de l'auditoria)

### 8.3 Fase 2 (abans del 10 juny 2026 — centenari)

1. Versió japonesa (traducció professional)
2. Easter egg castellà (detenció 1924, retalls premsa, al·legat)
3. Noves col·leccions premium (Casa Batlló, Sagrada Família, etc.)
4. Integració Stripe per packs premium
5. Xarxes socials @gaudimosaic
6. Galeria de mosaics creats (P1 de l'auditoria)

### 8.4 Documents de Referència Generats

| Document | Contingut |
|----------|----------|
| AUDIT_UX_GAUDI_MOSAIC.md | Auditoria UX completa amb Top 10 prioritats |
| prompts-midjourney-rajoles-v2.md | 40 prompts per a 10 col·leccions × 4 acabats |
| bugs-produccio-ronda1..4-2026-03-15.md | Historial detallat de bugs i intents |
| CLAUDE.md (al projecte) | Instruccions per a Claude Code |
| README.md (al projecte) | Documentació tècnica del projecte |

---

*"La paciència és la companya de la saviesa."* — Antoni Gaudí

*Document generat el 15 de març de 2026. gaudimosaic.art — Fet amb ♥ a Barcelona.*
