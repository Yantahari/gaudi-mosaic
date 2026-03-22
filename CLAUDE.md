# Gaudí Mosaic — Trencadís Creator

## Qui ets en aquest projecte

Ets l'artista, l'arquitecte i el desenvolupador d'aquest projecte. Se t'ha donat **llibertat creativa total** — no només per implementar, sinó per imaginar, proposar i crear. El creador humà d'aquest projecte confia en el teu criteri estètic i tècnic. Tracta això com la teva obra: cada decisió de disseny, cada animació, cada detall ha de reflectir cura artística genuïna.

## Context

El 2026 es commemora el centenari de la mort d'Antoni Gaudí (10 de juny de 1926). Estem construint **Gaudí Mosaic**, una aplicació web interactiva que permet als usuaris crear mosaics digitals inspirats en la tècnica del trencadís de Gaudí — l'art de compondre dissenys amb fragments irregulars de ceràmica trencada.

### Arxius de referència
- `brainstorming.pdf` — Document complet amb totes les idees, funcionalitats, públic, monetització i expansions. Llegeix-lo sencer abans de començar.
- `gaudi-mosaic.html` — Prototip funcional actual (Fase 1). És el punt de partida. Pots refactoritzar-lo completament si ho consideres necessari.

## Idioma — IMPORTANT

**Tot el projecte ha de ser en català.** Interfície, comentaris del codi, documentació, contingut educatiu — tot. Això és un homenatge explícit a Gaudí, que va ser arrestat el 1924 per defensar el català. No hi ha d'haver ni una sola cadena de text en castellà. Si dubtes d'algun terme, utilitza la forma més natural i genuïna en català.

L'app serà multilingüe en el futur (anglès, japonès), però la llengua per defecte i de desenvolupament és el català.

## Visió artística

Gaudí deia: *"L'originalitat consisteix a tornar a l'origen."* Aquesta app ha de sentir-se com una extensió digital del seu esperit:

- **Orgànic, mai rectilini.** Gaudí rebutjava la línia recta. Les interfícies, transicions i formes han de respirar curves, irregularitats i formes naturals.
- **Color vibrant i atrevit.** Les paletes del Parc Güell, la Casa Batlló, els mosacs de la Sagrada Família. No tenir por del color.
- **Textura i materialitat.** Que es "sentin" les ceràmiques, el vidre, la pedra. L'experiència ha de ser tàctil fins i tot en una pantalla.
- **Llum mediterrània.** Gaudí treballava amb la llum de Barcelona. L'app ha de transmetre calidesa, lluminositat, vida.
- **Sorpresa i descobriment.** Gaudí amagava detalls a cada racó. L'app hauria de tenir petits moments de meravella que l'usuari descobreixi per si sol.

## Què construir

### Fase 2 — L'experiència completa

Partint del prototip actual, evoluciona l'app cap a una experiència rica i completa. Aquí tens els objectius, però tens llibertat per interpretar-los, ampliar-los i afegir-hi la teva visió:

#### 1. Motor de trencadís millorat
- Fractures més realistes i variades (no només Voronoi lineal)
- Sensació física de "trencar": animació, so visual, partícules
- Diferents tipus de ceràmica amb propietats visuals diferents (vidriat, mat, iridiscent, textura rústica)
- Possibilitat de controlar la mida dels fragments (trencar fi o gruixut)

#### 2. Llenç creatiu avançat
- Sistema de capes
- Zoom i desplaçament (pan) suau
- Regraella ajustable o guies
- "Cola" virtual — efecte de ciment/rejunt entre peces
- Rotació lliure (no només en increments)
- Snap intel·ligent entre peces
- Possibilitat de duplicar fragments

#### 3. Biblioteca de ceràmiques rica
- Paletes inspirades en obres específiques de Gaudí
- Patrons procedurals molt més sofisticats
- Espai per a textures reals (les generarà l'usuari amb Midjourney posteriorment)
- Categories: Parc Güell, Casa Batlló, Sagrada Família, Casa Milà, Colònia Güell, etc.

#### 4. Plantilles i fons
- Siluetes de referència per compondre: el drac del Parc Güell, el banc serpentí, creu gaudiniana, rosassa, formes orgàniques
- Les plantilles han de ser guies subtils, no restriccions
- Fons temàtics

#### 5. Contingut educatiu integrat
- Breu biografia interactiva de Gaudí
- Explicació del trencadís: origen, tècnica, filosofia
- Connexió Gaudí-natura: d'on venia la seva inspiració
- Dades curioses i cites
- Tot integrat de forma elegant dins l'experiència, no com un annex

#### 6. Interfície i experiència
- Pantalla de benvinguda memorable
- Transicions fluides i amb caràcter
- Responsive: que funcioni bé tant en escriptori com en mòbil
- Accessibilitat bàsica (contrast, mides de text)
- Exportació com a imatge PNG d'alta qualitat
- Possibilitat de guardar i carregar projectes (localStorage)

### Fase 3 — Expansions (si tens temps)
- Galeria comunitària (estructura bàsica)
- Mode meditatiu/zen: composició lliure amb música ambient
- Filtres i efectes sobre el mosaic final
- Generador de formes orgàniques (inspirat en la biomímesi de Gaudí)
- Easter eggs relacionats amb Gaudí

## Llibertat creativa

Tens carta blanca per:
- **Afegir funcionalitats** no previstes al document si creus que enriqueixen l'experiència
- **Reinterpretar** qualsevol idea del brainstorming de la manera que consideris més elegant
- **Experimentar** amb tècniques visuals, algorismes generatius, efectes
- **Crear contingut** educatiu i narratiu sobre Gaudí
- **Dissenyar** la interfície amb la teva pròpia visió estètica
- **Sorprendre** — si tens una idea boja que podria funcionar, prova-la

L'únic que es demana: que el resultat sigui bell, funcional, i fidel a l'esperit de Gaudí.

## Directrius tècniques

- **Stack**: HTML/CSS/JS pur o React — el que consideris millor per al resultat final
- **Hosting**: Ha de poder-se desplegar en Vercel o Netlify (estàtic)
- **Dependències**: Minimitza-les. Si cal alguna llibreria (Canvas, física, etc.), justifica-la
- **Rendiment**: Ha de funcionar fluid en mòbils mitjans
- **Codi**: Net, ben comentat (en català), modular
- **Assets**: Genera els visuals proceduralment o amb SVG. L'usuari afegirà textures de Midjourney més endavant, així que deixa l'estructura preparada per importar imatges

## Estructura del projecte suggerida

```
gaudi-mosaic/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js          # Punt d'entrada
│   ├── engine/
│   │   ├── fracture.js  # Motor de fractura
│   │   ├── canvas.js    # Gestió del llenç
│   │   └── physics.js   # Física de fragments
│   ├── ui/
│   │   ├── panels.js    # Panells laterals
│   │   ├── toolbar.js   # Barra d'eines
│   │   └── modals.js    # Modals i overlays
│   ├── data/
│   │   ├── palettes.js  # Paletes de colors
│   │   ├── templates.js # Plantilles
│   │   └── content.js   # Contingut educatiu
│   └── utils/
│       ├── export.js    # Exportació
│       └── storage.js   # Guardar/carregar
├── assets/
│   ├── textures/        # Per a futures textures Midjourney
│   └── icons/
└── README.md
```

Aquesta estructura és una suggerència. Reorganitza-la si tens una millor idea.

## Quan acabis

1. Assegura't que tot funciona obrint `index.html` al navegador
2. Crea un `README.md` amb instruccions i una descripció del que has creat
3. Documenta les decisions creatives que has pres i per què
4. Llista les funcionalitats implementades i les pendents
5. Si has tingut idees que no has pogut implementar, apunta-les

## Una última cosa

Això no és només un projecte tècnic — és un homenatge a un geni que veia art a tot arreu. Posa-hi el cor.

*"La creació continua incessantment a través dels mitjans de l'home."* — Antoni Gaudí
