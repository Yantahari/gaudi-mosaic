# Gaudí Mosaic — Visió de producte

**Document intern — Març 2026**
**Audiència:** COO, equip de producte
**Autor:** Equip de desenvolupament

---

## Context

Gaudí Mosaic és una aplicació web que permet crear mosaics digitals amb la tècnica del trencadís d'Antoni Gaudí. Està live a gaudimosaic.art. El 10 de juny de 2026 es commemora el centenari de la mort de Gaudí — tenim **87 dies** per aprofitar aquesta finestra cultural irrepetible.

---

## 1. Què ja tenim (i és molt bo)

- **37 rajoles Midjourney** d'alta qualitat organitzades en 4 col·leccions temàtiques (Parc Güell, Mediterrani, Jocs Florals, Mosaic Clàssic). La qualitat visual és el cor del producte.
- **Contingut educatiu** complet: biografia interactiva, explicació del trencadís, connexió natura-Gaudí, curiositats i cites. Dóna ànima al producte — no és una joguina buida.
- **Bilingüe** (català i anglès), amb estructura preparada per japonès i castellà.
- **Arquitectura tècnica impecable**: zero dependències, HTML/CSS/JS pur, hosting estàtic a Netlify. Cost total: 3,60 €/any (domini).
- **Motor de fractura** amb 3 algorismes i control de granularitat.
- **Eines de composició**: zoom, pan, rotació, duplicar, capes, rejunt, plantilles SVG.

---

## 2. Què li falta per funcionar

### 2.1. Compartir és el producte, no un extra

**Problema:** L'app crea art que mor al telèfon de l'usuari. Sense compartir, no hi ha viralitat. Sense viralitat, un projecte cultural no existeix — especialment amb una finestra temporal limitada.

**Solució:**
- Botó de compartir natiu (Web Share API) integrat al flux d'exportació.
- L'exportació ha de produir imatges optimitzades per xarxes: format quadrat (1080×1080), ideal per Instagram.
- Watermark subtil ("gaudimosaic.art") a la cantonada — cada mosaic compartit és màrqueting orgànic.
- Text preparat amb hashtags: `#GaudíMosaic #Trencadís #Gaudí2026`.

**Impacte:** Sense això, l'app no creixerà orgànicament. Amb això, cada usuari que comparteix una creació porta nous usuaris.

### 2.2. L'onboarding fa o desfà

**Problema:** Un turista al Parc Güell no dedicarà 30 segons a entendre l'app. El flux "tria → trenca → compon" no és obvi sense guia. La secció d'ajuda existeix (botó Gaudí → Guia) però ningú la troba.

**Solució:**
- Tutorial visual de 3 passos que apareix la primera vegada (i només la primera):
  1. Tria una rajola
  2. Trenca-la
  3. Compon el teu mosaic
- Gens de text — tot icones amb animació. Ha de ser comprensible en 5 segons.

**Impacte:** Reduir la taxa d'abandonament dels primers 10 segons, que és on es perd la majoria d'usuaris en apps creatives.

### 2.3. El mòbil ha de ser impecable

**Problema:** El 80%+ del públic objectiu (turistes, curiosos de xarxes socials, estudiants) hi accedirà des del mòbil. L'app funciona en mòbil, però té friccions: elements que no caben, scroll que no funciona, zones mortes.

**Solució:**
- No afegir funcionalitats — polir les existents fins que siguin fluides.
- Cada canvi mòbil s'ha de testejar i desplegar individualment, verificant que no trenca res.
- Prioritzar: catàleg de rajoles → zona de trencament → llenç → exportació.

**Impacte:** Un mòbil que funciona bé converteix visitants en creadors. Un mòbil amb friccions els fa marxar.

---

## 3. Què el faria especial

### 3.1. Una experiència guiada, no un llenç en blanc

**Observació:** El llenç buit és intimidant. La majoria d'usuaris no són artistes i no sabran què fer amb un espai buit i 37 rajoles.

**Proposta — Mode "Completa el mosaic":**
- L'app presenta una silueta (per exemple, el drac del Parc Güell) amb algunes peces ja col·locades.
- L'usuari afegeix les peces que falten — com un puzzle creatiu.
- La barrera d'entrada baixa a zero i el resultat sempre és bonic.
- Això és el que compartirà la gent: "He completat el drac del Parc Güell!"

**Impacte:** Transforma l'app d'una eina per a creatius en una experiència per a tothom. Multiplica el públic objectiu per 10.

### 3.2. Menys eines, més plaer

**Observació:** L'app té capes, zoom, rotació lliure, snap, graella, duplicar, fons, rejunt... Moltes opcions penalitzen l'experiència tàctil, especialment en mòbil.

**Proposta:**
- Gaudí no treballava amb menús — treballava amb les mans. L'app hauria de sentir-se així.
- Menys panells, més gestos directes: tocar per col·locar, arrossegar per moure, dos dits per girar.
- Les eines avançades poden existir, però han de ser secundàries, no el primer que veu l'usuari.

**Impacte:** Una interfície més simple → menys fricció → més creacions completades → més comparticions.

### 3.3. El moment "wow"

**Observació:** Falta un moment que faci somriure. L'acció de trencar és el gest més únic de l'app, però visualment és poc espectacular.

**Proposta:**
- Animació de trencar que es *senti* real: partícules, vibració (haptic feedback), efecte visual de fragmentació.
- Efecte al "completar" un mosaic: un brillant, un zoom out que revela la composició sencera amb música/so subtil.
- Easter eggs distribuïts per l'app (com Gaudí amagava detalls a cada racó de les seves obres).

**Impacte:** La diferència entre una app que s'usa un cop i una que es recorda i es recomana.

---

## 4. Què NO li cal ara

- **Més rajoles.** 37 són suficients per llançar. Les noves col·leccions poden venir com a actualitzacions post-llançament (i eventualment com a paquets premium).
- **Més funcionalitats tècniques.** Les eines actuals sobren per al públic objectiu.
- **Perfecció visual del rejunt o les fractures.** Funcionen. No són el coll d'ampolla.
- **Galeria comunitària** (Fase 3). Important, però no abans de tenir compartició bàsica.
- **Sistema de pagaments.** Prematur fins que hi hagi tracció d'usuaris.

---

## 5. Prioritats suggerides

| Prioritat | Acció | Esforç | Impacte |
|-----------|-------|--------|---------|
| **P0** | Polir mòbil (bug a bug, amb verificació) | Mig | Crític — 80% del públic |
| **P0** | Compartir des de l'app (Web Share API + watermark) | Mig | Crític — sense viralitat no hi ha creixement |
| **P1** | Tutorial first-time (3 passos visuals) | Baix | Alt — redueix abandonament |
| **P1** | Mode "Completa el mosaic" (silueta + peces pre-col·locades) | Alt | Alt — multiplica el públic |
| **P2** | Animació de trencar millorada | Mig | Mig — factor "wow" |
| **P2** | Simplificar interfície mòbil | Mig | Mig — menys fricció |
| **P3** | PWA / Service Worker | Mig | Mig — offline per turistes |

---

## 6. El calendari

| Data | Fita |
|------|------|
| Ara → 31 març | P0: mòbil polit + compartir funcionant |
| 1-15 abril | P1: onboarding + mode guiat |
| 15-30 abril | P2: animacions + simplificació |
| Maig | Testing, feedback, iteració |
| **10 juny 2026** | **Centenari de Gaudí** — l'app ha d'estar llesta per rebre tràfic |

---

## Conclusió

Gaudí Mosaic és tècnicament sòlid i visualment bonic. El que el separa de l'èxit no és codi — és **reduir fricció** (onboarding, mòbil) i **amplificar el retorn emocional** (compartir, el moment wow, el mode guiat). Menys opcions, més plaer.

El 10 de juny no espera.

---

*"L'originalitat consisteix a tornar a l'origen."* — Antoni Gaudí
