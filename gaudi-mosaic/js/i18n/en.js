// =====================================================
// GAUDÍ MOSAIC — English translations
// =====================================================

export default {
  meta: { lang: 'en', name: 'English', flag: '🇬🇧' },

  // ---- Splash screen ----
  splash: {
    title: 'Gaudí Mosaic',
    subtitle: 'Trencadís Creator',
    enter: 'Start creating',
    year: '1926 — 2026 · Antoni Gaudí Centenary'
  },

  // ---- Header ----
  header: {
    brand: 'Gaudí',
    brandAccent: 'Mosaic',
    brandTitle: 'Double-click for a surprise',
    edu: '🏛 Gaudí',
    eduTitle: 'Discover Gaudí (?)',
    eduAria: 'Educational content and guide',
    load: '↑ Load',
    loadTitle: 'Load project (Ctrl+O)',
    save: '↓ Save',
    saveTitle: 'Save project (Ctrl+S)',
    clear: 'Clear',
    clearTitle: 'Clear canvas',
    undo: '↩ Undo',
    undoTitle: 'Undo (Ctrl+Z)',
    export: 'Export',
    exportTitle: 'Export PNG (Ctrl+E)'
  },

  // ---- Panels ----
  panels: {
    ceramics: 'Ceramics',
    layers: 'Layers',
    templates: 'Templates',

    ceramicsTitle: 'Ceramics',
    ceramicsSubtitle: 'Select and break to create fragments',
    finishLabel: 'Finish',

    layersTitle: 'Layers',
    layersSubtitle: 'Organise your mosaic by layers',
    addLayer: '+ New layer',
    hideLayer: 'Hide layer',
    showLayer: 'Show layer',
    deleteLayer: 'Delete layer',
    layerCreated: 'New layer created',
    layerDeleted: 'Layer deleted',

    templatesTitle: 'Templates',
    templatesSubtitle: 'Visual guides inspired by Gaudí',
    noTemplate: 'No template',
    opacityLabel: 'Opacity',
    sizeLabel: 'Size',
    templateActive: 'Template: {name}',

    loadingTiles: 'Loading tiles…',
    noTiles: 'No tiles with this finish'
  },

  // ---- Ceramic finishes ----
  finishes: {
    glazed: 'Glazed',
    matte: 'Matte',
    iridescent: 'Iridescent',
    rustic: 'Rustic'
  },

  // ---- Break zone ----
  breakzone: {
    title: 'Break the ceramic',
    subtitle: 'Chance decides the fractures, just like in a real trencadís',
    algorithmLabel: 'Algorithm',
    granularityLabel: 'Granularity',
    granularityFine: 'Fine',
    granularityMedium: 'Medium',
    granularityCoarse: 'Coarse',
    crack: '⚡ Break',
    useFragments: '✓ Use fragments',
    cancel: 'Cancel',
    fragmentsCreated: '{count} fragments created!',
    fragmentsAdded: 'Fragments added to the tray. Drag them onto the canvas!'
  },

  // ---- Fracture algorithms ----
  fractures: {
    voronoi: 'Voronoi',
    radial: 'Radial',
    organic: 'Organic'
  },

  // ---- Toolbar ----
  tools: {
    label: 'Tools',
    move: 'Move',
    moveTitle: 'Move (V)',
    rotate: 'Rotate',
    rotateTitle: 'Rotate (R)',
    scale: 'Scale',
    scaleTitle: 'Scale (S)',
    pan: 'Pan',
    panTitle: 'Pan (Space)',
    duplicate: 'Duplicate',
    duplicateTitle: 'Duplicate (Ctrl+D)',
    delete: 'Delete',
    deleteTitle: 'Delete (Del)',
    resetZoom: 'Reset zoom',
    resetZoomTitle: 'Reset zoom (Ctrl+0)'
  },

  // ---- Grout ----
  grout: {
    label: 'Grout',
    toggle: 'Enable grout',
    color: 'Grout colour',
    width: 'Grout width',
    activate: 'Enable'
  },

  // ---- Backgrounds ----
  backgrounds: {
    label: 'Background',
    dark: 'Dark',
    light: 'Light',
    blue: 'Mediterranean blue',
    stone: 'Stone',
    cement: 'Cement',
    canvasBackground: 'Canvas background'
  },

  // ---- Canvas ----
  canvas: {
    hint: 'Select a ceramic from the left panel',
    hintBold: 'Break it',
    hintSuffix: 'and drag the fragments here',
    trayLabel: 'Pieces'
  },

  // ---- Mobile navigation ----
  mobile: {
    ceramics: 'Ceramics',
    canvas: 'Canvas',
    layers: 'Layers',
    tools: 'Tools',
    actions: 'Actions',
    resetZoom: 'Reset zoom'
  },

  // ---- Notifications ----
  notify: {
    fragmentDeleted: 'Fragment deleted',
    gridOn: 'Grid enabled',
    gridOff: 'Grid disabled',
    zoomReset: 'Zoom reset',
    selectFragment: 'Click on a fragment to select it and move it with the arrow keys',
    projectSaved: 'Project "{name}" saved',
    projectLoaded: 'Project "{name}" loaded',
    projectDeleted: 'Project "{name}" deleted',
    noProjects: 'No saved projects',
    projectNotFound: 'Project not found',
    saveError: 'Error saving the project',
    loadError: 'Error loading the project',
    storageFullError: 'Error: storage full. Delete old projects.',
    autoSaved: 'Auto-saved',
    autoSaveName: '(Auto-save)',
    exportEmpty: 'The canvas is empty — add pieces to export',
    exported: 'Mosaic exported in high quality!',
    actionUndone: 'Action undone',
    fragmentDuplicated: 'Fragment duplicated',
    canvasCleared: 'Canvas cleared',
    langChanged: 'Language changed to {name}'
  },

  // ---- Share ----
  share: {
    title: 'Mosaic created with Gaudí Mosaic',
    text: 'I created this digital mosaic with Gaudí\'s trencadís technique 🎨✨ #GaudíMosaic #Trencadís #Gaudí2026',
    shareBtn: 'Share',
    downloadBtn: 'Download',
    shared: 'Mosaic shared!',
    shareFailed: 'Could not share',
    modalTitle: 'Your mosaic is ready!',
    modalText: 'Share your creation or download it in high quality.'
  },

  // ---- Tutorial ----
  tutorial: {
    step1: 'Choose a tile',
    step2: 'Break it',
    step3: 'Compose your mosaic',
    skip: 'Got it'
  },

  // ---- Tutorial ----
  tutorial: {
    step1: 'Choose a tile',
    step2: 'Break it',
    step3: 'Compose your mosaic',
    skip: 'Got it'
  },

  // ---- Dialogs ----
  dialogs: {
    projectName: 'Project name:',
    defaultProjectName: 'My mosaic',
    overwrite: 'Overwrite "{name}"?\n\nOK → Overwrite\nCancel → Save with a new name',
    newProjectName: 'New project name:',
    copyName: '{name} (copy)',
    storageSizeWarning: 'The project is {size}MB. Storage is limited. Continue?',
    deleteProject: 'Delete "{name}"?',
    untitled: 'Untitled',
    loadProject: 'Load project',
    close: 'Close',
    loadBtn: 'Load',
    deleteBtn: 'Delete',
    pieces: 'pieces'
  },

  // ---- Template names (kept in Catalan as proper nouns) ----
  templateNames: {
    drac: 'El Drac',
    salamandra: 'Salamandra',
    banc: 'Banc Serpentí',
    creu: 'Creu Gaudiniana',
    rosassa: 'Rosassa',
    sagradafamilia: 'Sagrada Família'
  },

  // ---- Template descriptions (translated) ----
  templateDescriptions: {
    drac: 'The dragon of Park Güell, symbol of Barcelona',
    salamandra: 'The mosaic salamander of Park Güell',
    banc: 'The undulating bench of Park Güell',
    creu: 'Four-armed crowned cross',
    rosassa: 'Gothic rose window with vegetal patterns',
    sagradafamilia: 'Silhouette of the unfinished basilica'
  },

  // ---- Education modal ----
  education: {
    modalTitle: 'Discover Gaudí',
    navGuide: 'User guide',
    navBio: 'Biography',
    navTrencadis: 'Trencadís',
    navNature: 'Nature',
    navCuriosities: 'Curiosities',

    // User guide
    guideTitle: 'How Gaudí Mosaic works',
    guideSubtitle: 'Quick guide to create your digital trencadís',
    guideSteps: [
      {
        title: '1. Choose a ceramic',
        text: 'On the left panel, select a tile from the catalogue. You can change the fracture type (Voronoi, Radial, Organic), fragment size and ceramic type.',
        icon: '🎨'
      },
      {
        title: '2. Break it',
        text: 'Press "Break" to fracture the ceramic. Chance decides the fractures, just like in a real trencadís. You can change the algorithm and granularity for different results.',
        icon: '⚡'
      },
      {
        title: '3. Use the fragments',
        text: 'Press "Use fragments" to send them to the pieces tray at the bottom. Drag each fragment onto the canvas to place it.',
        icon: '✋'
      },
      {
        title: '4. Compose the mosaic',
        text: 'Move, rotate and scale the fragments with the tools in the bottom bar. You can use templates as visual guides and organise pieces by layers.',
        icon: '🧩'
      },
      {
        title: '5. Export and save',
        text: 'Export your mosaic as a high-quality PNG or save the project to continue later.',
        icon: '💾'
      }
    ],
    shortcutsTitle: 'Keyboard shortcuts',
    shortcuts: [
      { key: 'V', action: 'Move tool' },
      { key: 'R', action: 'Rotate tool' },
      { key: 'S', action: 'Scale tool' },
      { key: 'X', action: 'Delete tool' },
      { key: 'Space', action: 'Pan canvas (hold)' },
      { key: 'G', action: 'Show/hide grid' },
      { key: 'Arrows', action: 'Move fragment (Shift = ×10)' },
      { key: 'Del', action: 'Delete selected fragment' },
      { key: 'Ctrl+D', action: 'Duplicate fragment' },
      { key: 'Ctrl+Z', action: 'Undo' },
      { key: 'Ctrl+S', action: 'Save project' },
      { key: 'Ctrl+O', action: 'Load project' },
      { key: 'Ctrl+E', action: 'Export PNG' },
      { key: '+/−', action: 'Zoom' },
      { key: 'Ctrl+0', action: 'Reset zoom' },
      { key: '?', action: 'This guide' }
    ],

    // Biography
    bioTitle: 'Antoni Gaudí i Cornet',
    bioSubtitle: '1852 — 1926',
    bioIntro: 'A visionary architect who transformed Barcelona into an open-air museum. His work, deeply rooted in nature and Catalan tradition, continues to inspire the world a century after his death.',
    bioTimeline: [
      { year: 1852, title: 'Birth', text: 'Born on 25 June in Reus (or Riudoms, according to some sources). Son of a coppersmith, from childhood he observed the forms of nature and artisan crafts.', quote: null },
      { year: 1873, title: 'School of Architecture', text: 'Enters the Provincial School of Architecture of Barcelona. The director says: "I don\'t know if we\'ve given the degree to a madman or a genius."', quote: null },
      { year: 1878, title: 'First works', text: 'Graduates as an architect. Meets Eusebi Güell, who would become his great patron. Important commissions begin.', quote: null },
      { year: 1883, title: 'The Sagrada Família', text: 'Takes over the direction of the Expiatory Temple of the Sagrada Família, the project that would define his life.', quote: 'El meu client no té pressa.' },
      { year: 1886, title: 'Palau Güell', text: 'Builds the Palau Güell on Carrer Nou de la Rambla. First major work where he applies trencadís to the rooftops.', quote: null },
      { year: 1900, title: 'Park Güell', text: 'Begins Park Güell, a garden city that would become the finest example of trencadís on a large scale. The serpentine bench and the dragon are universal icons.', quote: null },
      { year: 1904, title: 'Casa Batlló', text: 'Refurbishes Casa Batlló on Passeig de Gràcia. The façade evokes the sea and bones, with an extraordinary iridescent trencadís.', quote: 'El color en els objectes és la vida.' },
      { year: 1906, title: 'Casa Milà', text: 'Builds La Pedrera, with its undulating façade and sculptural rooftops. His last civil work before devoting himself exclusively to the Sagrada Família.', quote: null },
      { year: 1910, title: 'International recognition', text: 'Exhibition of his works in Paris. The world begins to recognise his genius, but he increasingly withdraws from social life.', quote: null },
      { year: 1914, title: 'Exclusive dedication', text: 'Devotes himself exclusively to the Sagrada Família. Lives ever more austerely, eventually moving into the workshop on site.', quote: null },
      { year: 1924, title: 'Defender of Catalan', text: 'The police arrest him for speaking Catalan to an officer during Primo de Rivera\'s dictatorship. He declares: "Soc català i parlaré en català" (I am Catalan and I will speak Catalan).', quote: 'Soc català i parlaré en català.' },
      { year: 1926, title: 'Death', text: 'On 7 June he is struck by a tram. Nobody recognises him due to his humble appearance. He dies three days later, on 10 June. All of Barcelona mourns him.', quote: null }
    ],

    // Trencadís
    trencadisTitle: 'Trencadís',
    trencadisSubtitle: 'The art of broken ceramics',
    trencadisSections: [
      { title: 'What is it?', text: 'Trencadís is a decorative technique that uses irregular fragments of ceramic, glass or other materials to create mosaics. The name comes from the Catalan verb "trencar" (to break) — the art of breaking to create.', icon: '🔨' },
      { title: 'Origin', text: 'Gaudí did not invent the mosaic, but he revolutionised it. He transformed rejects from ceramic factories — defective, broken, discarded pieces — into sublime art. Artistic recycling avant la lettre.', icon: '♻' },
      { title: 'Technique', text: 'The process is simple but demands an extraordinary eye: ceramic or glass tiles are broken with a hammer, fragments are selected by shape and colour, and placed on a surface with mortar, forming a design.', icon: '🎨' },
      { title: 'Philosophy', text: 'For Gaudí, trencadís was a metaphor: from destruction, creation is born. Every broken fragment finds its place in a harmonious whole. There are no mistakes, only possibilities.', icon: '✨' },
      { title: 'Where to find it', text: 'Park Güell is the most famous example, but trencadís appears throughout Gaudí\'s work: on the rooftops of Palau Güell, on the façade of Casa Batlló, on the pinnacles of the Sagrada Família, in the crypt of Colònia Güell...', icon: '🏛' }
    ],

    // Nature
    natureTitle: 'Gaudí and Nature',
    natureSubtitle: 'Biomimicry before the word existed',
    natureText: 'Gaudí was the first biomimetic architect. He studied nature with an engineer\'s eyes: the structure of bones, the geometry of flowers, the resistance of trees to wind. He said that nature is the great book, always open, that one must strive to read.',
    natureExamples: [
      { element: 'The columns of the Sagrada Família', inspiration: 'Tree trunks that branch towards the ceiling, distributing weight like a forest of stone.' },
      { element: 'The façade of Casa Batlló', inspiration: 'Bones, skeletons and marine forms. The roof evokes the back of a dragon or the crest of the sea.' },
      { element: 'The chimneys of Palau Güell', inspiration: 'Fungiform shapes, like giant mushrooms covered in trencadís.' },
      { element: 'The catenary arch', inspiration: 'The shape adopted by a chain hanging under gravity — the structurally perfect form.' },
      { element: 'Ruled surfaces', inspiration: 'The hyperboloid and the paraboloid, shapes found in horses\' legs and dragonflies\' wings.' }
    ],
    natureQuote: 'L\'arbre prop del meu taller: aquest és el meu mestre.',

    // Curiosities
    curiositiesTitle: 'Curiosities and Quotes',
    curiositiesSubtitle: 'Hidden treasures about Gaudí',
    curiosities: [
      'Gaudí was a strict vegetarian during the last years of his life.',
      'The Sagrada Família will not be completed until approximately 2026, a hundred years after his death.',
      'Gaudí used mirrors to study how light changed forms.',
      'He never travelled outside Catalonia and the south of France.',
      'The trencadís of Park Güell uses rejects from the Pujol i Bausis ceramic factory in Esplugues.',
      'Gaudí hung chains upside down to find the ideal shapes for arches.',
      'Seven of Gaudí\'s works are UNESCO World Heritage Sites.',
      'The serpentine bench of Park Güell is ergonomically designed — Gaudí had a worker sit naked in plaster to obtain the perfect form.',
      'The four-armed cross that crowns many of Gaudí\'s works symbolises the four cardinal points.',
      'The dragon of Park Güell originally spat water like a fountain.'
    ],
    quotesTitle: 'Quotes by Antoni Gaudí',
    // Original quotes in Catalan are preserved across all languages
    quotes: [
      'L\'originalitat consisteix a tornar a l\'origen.',
      'Res no és art si no prové de la natura.',
      'La creació continua incessantment a través dels mitjans de l\'home.',
      'El color en els objectes és la vida.',
      'La línia recta és la línia dels homes. La corba és la línia de Déu.',
      'Per fer les coses bé cal: primer, l\'amor; segon, la tècnica.',
      'L\'arbre prop del meu taller: aquest és el meu mestre.',
      'Res no és inventat, perquè la natura ja ho ha escrit tot primer.',
      'La bellesa és el resplendor de la veritat.',
      'Tot surt del gran llibre de la natura.',
      'Els angles rectes no existeixen a la natura.',
      'El meu client no té pressa.',
      'Soc català i parlaré en català.',
      'L\'arquitectura és l\'ordenació de la llum.',
      'He de confessar que el meu gran mestre ha estat i serà sempre l\'arbre.'
    ],

    // Privacy
    navPrivacy: 'Privacy',
    privacyTitle: 'Privacy',
    privacySubtitle: 'How we handle your data',
    privacyIntro: 'Gaudí Mosaic respects your privacy. This application has been designed so that your data never leaves your device.',
    privacyItems: [
      {
        icon: '🚫',
        title: 'No personal data collected',
        text: 'We do not ask for your name, email or any other personal information. There are no user accounts or registration.'
      },
      {
        icon: '🍪',
        title: 'No tracking cookies',
        text: 'We do not use tracking cookies, analytics or third-party services. No Google Analytics, Facebook Pixel or any tracking service.'
      },
      {
        icon: '📡',
        title: 'No server connection',
        text: 'The app runs entirely in your browser. We do not send any information to external servers. All processing is local.'
      },
      {
        icon: '💾',
        title: 'Local storage only',
        text: 'Your saved projects and language preference are stored in your browser\'s localStorage. This data stays on your device and you can delete it at any time from your browser settings.'
      }
    ],

    // Contact
    navContact: 'Contact',
    contactTitle: 'Contact',
    contactSubtitle: 'Have questions, suggestions or want to collaborate?',
    contactEmail: 'contact@gaudimosaic.art',
    contactEmailText: 'Write to us at',
    contactSocialTitle: 'Follow us',
    contactSocial: [
      { icon: '🐦', name: 'Twitter / X', url: 'https://twitter.com/gaudimosaic', handle: '@gaudimosaic' },
      { icon: '📸', name: 'Instagram', url: 'https://instagram.com/gaudimosaic', handle: '@gaudimosaic' }
    ],
    contactProjectTitle: 'About the project',
    contactProjectText: 'Gaudí Mosaic is a project created to commemorate the centenary of Antoni Gaudí\'s death (1926–2026). The application is free.',
    contactLicense: 'Made with ♥ in Barcelona'
  },

  // ---- Guided mode ----
  guided: {
    splashBtn: 'Complete a mosaic',
    headerBtn: '🧩 Guided',
    headerTitle: 'Guided mode: complete a mosaic',
    modalTitle: 'Complete the mosaic',
    modalSubtitle: 'Choose a challenge. Some pieces are already placed — you need to complete the rest!',
    fragments: 'fragments',
    loading: 'Preparing the challenge…',
    started: 'Challenge "{name}" started! Complete the mosaic.',
    progressBtn: '🧩 Progress',
    progress: '{placed}/{total} pieces · {remaining} remaining · {time}',
    completed: 'Mosaic completed! Time: {time}',
    exitBtn: 'Exit guided mode'
  },

  // ---- PWA ----
  pwa: {
    install: 'Install',
    installTitle: 'Install Gaudí Mosaic on your device',
    installed: 'Gaudí Mosaic installed on your device!',
    offline: 'No connection — working offline',
    online: 'Connection restored',
    updated: 'New version available — reload to update'
  },

  // ---- Language selector ----
  language: {
    label: 'Language',
    current: 'English'
  }
};
