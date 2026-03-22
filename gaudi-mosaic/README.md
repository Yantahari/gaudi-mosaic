# Gaudí Mosaic — Trencadís Creator

**Aplicació web interactiva per crear mosaics digitals inspirats en la tècnica del trencadís d'Antoni Gaudí.**

Creat amb motiu del centenari de la mort d'Antoni Gaudí (1926-2026).

## Com executar

Servir els fitxers estàtics amb qualsevol servidor local:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .

# VS Code
# Extensió "Live Server" → clic dret a index.html → Open with Live Server
```

Obrir `http://localhost:8000` al navegador.

## Funcionalitats implementades (Fase 2)

### Motor de trencadís millorat
- **3 algorismes de fractura**: Voronoi (amb pertorbació de vores i Lloyd relaxation), Radial (des d'un punt d'impacte), Orgànic (amb soroll determinístic per vores corbes)
- **Control de granularitat**: lliscador per ajustar la mida dels fragments (fi ↔ gruixut)
- **4 tipus de ceràmica**: Vidriat (brillant), Mat (suau), Iridiscent (canvi de color), Rústic (textura rugosa)
- **Animació de fractura** amb easing suau
- **10 patrons procedurals**: Cercles, Ratlles, Diamants, Orgànic, Mosaic, Floral, Espiral, Escates, Vitrall, Granit

### Llenç creatiu avançat
- **Zoom** amb roda del ratolí / pinch (0.2x — 5x)
- **Pan** amb clic central, dos dits, o eina dedicada (espai per activar temporalment)
- **Graella ajustable** amb snap opcional (tecla G per activar/desactivar)
- **Efecte de rejunt/cola** configurable: activar/desactivar, color i gruix
- **Rotació lliure** — arrossegar per girar contínuament (no increments)
- **Escala proporcional**
- **Duplicació de fragments** (Ctrl+D)

### Sistema de capes
- Crear, eliminar i reordenar capes
- Visibilitat per capa
- Comptador de peces per capa
- Les peces noves es col·loquen a la capa activa

### Biblioteca de ceràmiques rica
- **10 paletes** inspirades en obres de Gaudí: Parc Güell, Casa Batlló, Sagrada Família, El Matí, Mediterrani, Casa Milà, Colònia Güell, Cripta Güell, Vitrall, Nocturn
- Cada paleta genera múltiples rajoles amb patrons variats
- Categories per obra de Gaudí

### Plantilles SVG
- **6 plantilles** com a guies de composició: El Drac, Banc Serpentí, Creu Gaudiniana, Rosassa, Salamandra, Sagrada Família
- Opacitat ajustable
- Les plantilles són guies subtils, no restriccions

### Contingut educatiu
- **Biografia interactiva** d'Antoni Gaudí amb timeline visual (12 events, 1852-1926)
- **Explicació del trencadís**: origen, tècnica, filosofia
- **Gaudí i la Natura**: biomímesi, exemples arquitectònics
- **Curiositats i cites**: 10 dades curioses, 15 cites en català
- Tot integrat en un modal elegant amb navegació per seccions

### Persistència
- **Guardar/carregar projectes** amb localStorage
- Múltiples projectes amb noms
- **Autoguardat** cada 60 segons
- Avís quan l'espai s'acosta al límit

### Exportació
- **PNG d'alta qualitat** (2x resolució)
- Crop automàtic al contingut amb marge
- Exporta amb rejunt si activat
- Respecta la visibilitat de capes

### Interfície
- Pantalla de benvinguda amb mosaic generatiu i cita aleatòria de Gaudí
- Transicions fluides
- **Responsive**: funciona en escriptori, tauleta i mòbil
- **Accessibilitat**: ARIA labels, navegació per teclat, focus visible
- Notificacions toast

### Dreceres de teclat
| Drecera | Acció |
|---------|-------|
| V | Eina moure |
| R | Eina girar |
| S | Eina escalar |
| X | Eina eliminar |
| Espai (mantenir) | Pan temporal |
| G | Activar/desactivar graella |
| Ctrl+Z | Desfer |
| Ctrl+D | Duplicar fragment |
| Ctrl+S | Guardar projecte |
| Ctrl+O | Carregar projecte |
| Ctrl+E | Exportar PNG |
| Ctrl+0 | Reiniciar zoom |
| Supr | Eliminar fragment seleccionat |
| Fletxes | Moure fragment seleccionat (Shift per 10px) |
| +/- | Zoom |

### Easter egg
- Doble clic al logo "Gaudí Mosaic" mostra una cita aleatòria de Gaudí.

## Arquitectura

```
gaudi-mosaic/
├── index.html                    # Punt d'entrada HTML
├── css/
│   ├── styles.css                # Estils principals + variables
│   ├── splash.css                # Pantalla de benvinguda
│   ├── panels.css                # Panells laterals + zona de trencament
│   └── modals.css                # Modals + educatiu + responsive
├── js/
│   ├── app.js                    # Entrada, inicialització, dreceres
│   ├── state.js                  # Estat centralitzat amb pub/sub
│   ├── engine/
│   │   ├── fracture.js           # 3 algorismes de fractura
│   │   ├── canvas.js             # Llenç amb zoom/pan/interaccions
│   │   └── ceramics.js           # Generació procedural de ceràmiques
│   ├── ui/
│   │   ├── splash.js             # Pantalla de benvinguda
│   │   ├── panels.js             # Panell: ceràmiques, capes, plantilles
│   │   ├── toolbar.js            # Barra d'eines + safata de fragments
│   │   ├── breakzone.js          # Zona de trencament interactiva
│   │   └── modals.js             # Modals educatius
│   ├── data/
│   │   ├── palettes.js           # 10 paletes + patrons + tipus
│   │   ├── templates.js          # 6 plantilles SVG + fons temàtics
│   │   └── content.js            # Contingut educatiu sobre Gaudí
│   └── utils/
│       ├── storage.js            # Guardar/carregar localStorage
│       ├── export.js             # Exportació PNG alta qualitat
│       └── helpers.js            # Utilitats compartides
└── assets/
    ├── textures/                 # Espai per futures textures Midjourney
    └── icons/                    # Espai per icones SVG
```

## Decisions tècniques

- **HTML/CSS/JS pur amb ES Modules** — Zero dependències, desplegament estàtic directe
- **Estat centralitzat amb pub/sub** — Patró Observer senzill per desacoblar mòduls
- **Canvas 2D amb matriu de transformació** — Per zoom/pan eficient
- **Generació procedural** — Tots els visuals generats per codi, preparats per futures textures Midjourney
- **Tot en català** — Interfície, codi, comentaris, contingut

## Desplegament

Compatible amb Vercel, Netlify, GitHub Pages o qualsevol hosting estàtic. No cal build step.

## Funcionalitats pendents (Fase 3)

- Galeria comunitària
- Mode meditatiu/zen amb música ambient
- Filtres i efectes sobre el mosaic final
- Generador de formes orgàniques
- Compartir a xarxes socials
- Suport per importar textures d'imatge

---

*"La creació continua incessantment a través dels mitjans de l'home."* — Antoni Gaudí
