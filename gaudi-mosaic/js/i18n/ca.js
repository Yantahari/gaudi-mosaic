// =====================================================
// GAUDÍ MOSAIC — Traduccions en català (idioma per defecte)
// =====================================================

export default {
  meta: { lang: 'ca', name: 'Català', flag: '🇦🇩' },

  // ---- Splash screen ----
  splash: {
    title: 'Gaudí Mosaic',
    subtitle: 'Trencadís Creator',
    enter: 'Comença a crear',
    year: '1926 — 2026 · Centenari d\'Antoni Gaudí'
  },

  // ---- Capçalera ----
  header: {
    brand: 'Gaudí',
    brandAccent: 'Mosaic',
    brandTitle: 'Fes doble clic per una sorpresa',
    edu: '🏛 Gaudí',
    eduTitle: 'Descobreix Gaudí (?)',
    eduAria: 'Contingut educatiu i guia',
    load: '↑ Carregar',
    loadTitle: 'Carregar projecte (Ctrl+O)',
    save: '↓ Guardar',
    saveTitle: 'Guardar projecte (Ctrl+S)',
    clear: 'Netejar',
    clearTitle: 'Netejar llenç',
    undo: '↩ Desfer',
    undoTitle: 'Desfer (Ctrl+Z)',
    export: 'Exportar',
    exportTitle: 'Exportar PNG (Ctrl+E)'
  },

  // ---- Panells ----
  panels: {
    ceramics: 'Ceràmiques',
    layers: 'Capes',
    templates: 'Plantilles',

    ceramicsTitle: 'Ceràmiques',
    ceramicsSubtitle: 'Selecciona i trenca per crear fragments',
    finishLabel: 'Acabat',

    layersTitle: 'Capes',
    layersSubtitle: 'Organitza el teu mosaic per capes',
    addLayer: '+ Nova capa',
    hideLayer: 'Amagar capa',
    showLayer: 'Mostrar capa',
    deleteLayer: 'Eliminar capa',
    layerCreated: 'Nova capa creada',
    layerDeleted: 'Capa eliminada',

    templatesTitle: 'Plantilles',
    templatesSubtitle: 'Guies visuals inspirades en Gaudí',
    noTemplate: 'Cap plantilla',
    opacityLabel: 'Opacitat',
    sizeLabel: 'Mida',
    templateActive: 'Plantilla: {name}',

    loadingTiles: 'Carregant rajoles…',
    noTiles: 'Cap rajola amb aquest acabat'
  },

  // ---- Acabats ceràmics ----
  finishes: {
    glazed: 'Vidriat',
    matte: 'Mat',
    iridescent: 'Iridiscent',
    rustic: 'Rústic'
  },

  // ---- Zona de trencament ----
  breakzone: {
    title: 'Trenca la ceràmica',
    subtitle: 'L\'atzar decideix les fractures, com en un trencadís real',
    algorithmLabel: 'Algorisme',
    granularityLabel: 'Granularitat',
    granularityFine: 'Fi',
    granularityMedium: 'Mitjà',
    granularityCoarse: 'Gruixut',
    crack: '⚡ Trencar',
    useFragments: '✓ Usar fragments',
    cancel: 'Cancel·lar',
    fragmentsCreated: '{count} fragments creats!',
    fragmentsAdded: 'Fragments afegits a la safata. Arrossega\'ls al llenç!'
  },

  // ---- Algorismes de fractura ----
  fractures: {
    voronoi: 'Voronoi',
    radial: 'Radial',
    organic: 'Orgànic'
  },

  // ---- Barra d'eines ----
  tools: {
    label: 'Eines',
    move: 'Moure',
    moveTitle: 'Moure (V)',
    rotate: 'Girar',
    rotateTitle: 'Girar (R)',
    scale: 'Escalar',
    scaleTitle: 'Escalar (S)',
    pan: 'Desplaçar',
    panTitle: 'Desplaçar (Espai)',
    duplicate: 'Duplicar',
    duplicateTitle: 'Duplicar (Ctrl+D)',
    delete: 'Eliminar',
    deleteTitle: 'Eliminar (Supr)',
    resetZoom: 'Reiniciar zoom',
    resetZoomTitle: 'Reiniciar zoom (Ctrl+0)'
  },

  // ---- Rejunt ----
  grout: {
    label: 'Rejunt',
    toggle: 'Activar rejunt',
    color: 'Color del rejunt',
    width: 'Amplada del rejunt',
    activate: 'Activar'
  },

  // ---- Fons ----
  backgrounds: {
    label: 'Fons',
    dark: 'Fosc',
    light: 'Clar',
    blue: 'Blau mediterrani',
    stone: 'Pedra',
    cement: 'Ciment',
    canvasBackground: 'Fons del llenç'
  },

  // ---- Llenç ----
  canvas: {
    hint: 'Selecciona una ceràmica del panell esquerre',
    hintBold: 'Trenca-la',
    hintSuffix: 'i arrossega els fragments aquí',
    trayLabel: 'Peces'
  },

  // ---- Navegació mòbil ----
  mobile: {
    ceramics: 'Ceràmiques',
    canvas: 'Llenç',
    layers: 'Capes',
    tools: 'Eines',
    actions: 'Accions',
    resetZoom: 'Reset zoom'
  },

  // ---- Notificacions ----
  notify: {
    fragmentDeleted: 'Fragment eliminat',
    gridOn: 'Graella activada',
    gridOff: 'Graella desactivada',
    zoomReset: 'Zoom reiniciat',
    selectFragment: 'Fes clic en un fragment per seleccionar-lo i moure\'l amb les fletxes',
    projectSaved: 'Projecte "{name}" guardat',
    projectLoaded: 'Projecte "{name}" carregat',
    projectDeleted: 'Projecte "{name}" eliminat',
    noProjects: 'No hi ha projectes guardats',
    projectNotFound: 'Projecte no trobat',
    saveError: 'Error en guardar el projecte',
    loadError: 'Error en carregar el projecte',
    storageFullError: 'Error: espai d\'emmagatzematge ple. Elimina projectes antics.',
    autoSaved: 'Autoguardat',
    autoSaveName: '(Autoguardat)',
    exportEmpty: 'El llenç és buit — afegeix peces per exportar',
    exported: 'Mosaic exportat en alta qualitat!',
    actionUndone: 'Acció desfeta',
    fragmentDuplicated: 'Fragment duplicat',
    canvasCleared: 'Llenç netejat',
    langChanged: 'Idioma canviat a {name}'
  },

  // ---- Compartir ----
  share: {
    title: 'Mosaic creat amb Gaudí Mosaic',
    text: 'He creat aquest mosaic digital amb la tècnica del trencadís de Gaudí 🎨✨ #GaudíMosaic #Trencadís #Gaudí2026',
    shareBtn: 'Compartir',
    downloadBtn: 'Descarregar',
    shared: 'Mosaic compartit!',
    shareFailed: 'No s\'ha pogut compartir',
    modalTitle: 'El teu mosaic és llest!',
    modalText: 'Comparteix la teva creació o descarrega-la en alta qualitat.'
  },

  // ---- Tutorial ----
  tutorial: {
    step1: 'Tria una rajola',
    step2: 'Trenca-la',
    step3: 'Compon el mosaic',
    skip: 'Entesos'
  },

  // ---- Diàlegs ----
  dialogs: {
    projectName: 'Nom del projecte:',
    defaultProjectName: 'El meu mosaic',
    overwrite: 'Sobreescriure "{name}"?\n\nD\'acord → Sobreescriure\nCancel·la → Guardar amb un nom nou',
    newProjectName: 'Nom del nou projecte:',
    copyName: '{name} (còpia)',
    storageSizeWarning: 'El projecte ocupa {size}MB. L\'espai és limitat. Vols continuar?',
    deleteProject: 'Eliminar "{name}"?',
    untitled: 'Sense títol',
    loadProject: 'Carregar projecte',
    close: 'Tancar',
    loadBtn: 'Carregar',
    deleteBtn: 'Eliminar',
    pieces: 'peces'
  },

  // ---- Plantilles (noms i descripcions) ----
  templateNames: {
    drac: 'El Drac',
    salamandra: 'Salamandra',
    banc: 'Banc Serpentí',
    creu: 'Creu Gaudiniana',
    rosassa: 'Rosassa',
    sagradafamilia: 'Sagrada Família'
  },

  templateDescriptions: {
    drac: 'El drac del Parc Güell, símbol de Barcelona',
    salamandra: 'La salamandra de mosaic del Parc Güell',
    banc: 'El banc ondulant del Parc Güell',
    creu: 'Creu de quatre braços coronada',
    rosassa: 'Rosassa gòtica amb patrons vegetals',
    sagradafamilia: 'Silueta de la basílica inacabada'
  },

  // ---- Modal educatiu ----
  education: {
    modalTitle: 'Descobreix Gaudí',
    navGuide: 'Guia d\'ús',
    navBio: 'Biografia',
    navTrencadis: 'Trencadís',
    navNature: 'Natura',
    navCuriosities: 'Curiositats',

    // Guia d'ús
    guideTitle: 'Com funciona Gaudí Mosaic',
    guideSubtitle: 'Guia ràpida per crear el teu trencadís digital',
    guideSteps: [
      {
        title: '1. Tria una ceràmica',
        text: 'Al panell esquerre, selecciona una rajola del catàleg. Pots canviar el tipus de fractura (Voronoi, Radial, Orgànic), la mida dels fragments i el tipus de ceràmica.',
        icon: '🎨'
      },
      {
        title: '2. Trenca-la',
        text: 'Prem "Trencar" per fracturar la ceràmica. L\'atzar decideix les fractures, com en un trencadís real. Pots canviar l\'algorisme i la granularitat per resultats diferents.',
        icon: '⚡'
      },
      {
        title: '3. Usa els fragments',
        text: 'Prem "Usar fragments" per enviar-los a la safata de peces, a la part inferior. Arrossega cada fragment al llenç per col·locar-lo.',
        icon: '✋'
      },
      {
        title: '4. Compon el mosaic',
        text: 'Mou, gira i escala els fragments amb les eines de la barra inferior. Pots usar plantilles com a guia visual i organitzar peces per capes.',
        icon: '🧩'
      },
      {
        title: '5. Exporta i guarda',
        text: 'Exporta el teu mosaic com a PNG d\'alta qualitat o guarda el projecte per continuar-lo més tard.',
        icon: '💾'
      }
    ],
    shortcutsTitle: 'Dreceres de teclat',
    shortcuts: [
      { key: 'V', action: 'Eina moure' },
      { key: 'R', action: 'Eina girar' },
      { key: 'S', action: 'Eina escalar' },
      { key: 'X', action: 'Eina eliminar' },
      { key: 'Espai', action: 'Desplaçar llenç (mantenir)' },
      { key: 'G', action: 'Mostrar/amagar graella' },
      { key: 'Fletxes', action: 'Moure fragment (Shift = ×10)' },
      { key: 'Supr', action: 'Eliminar fragment seleccionat' },
      { key: 'Ctrl+D', action: 'Duplicar fragment' },
      { key: 'Ctrl+Z', action: 'Desfer' },
      { key: 'Ctrl+S', action: 'Guardar projecte' },
      { key: 'Ctrl+O', action: 'Carregar projecte' },
      { key: 'Ctrl+E', action: 'Exportar PNG' },
      { key: '+/−', action: 'Zoom' },
      { key: 'Ctrl+0', action: 'Reiniciar zoom' },
      { key: '?', action: 'Aquesta guia' }
    ],

    // Biografia
    bioTitle: 'Antoni Gaudí i Cornet',
    bioSubtitle: '1852 — 1926',
    bioIntro: 'Arquitecte visionari que va transformar Barcelona en un museu a cel obert. La seva obra, profundament arrelada en la natura i la tradició catalana, continua inspirant el món un segle després de la seva mort.',
    bioTimeline: [
      { year: 1852, title: 'Naixement', text: 'Neix el 25 de juny a Reus (o Riudoms, segons algunes fonts). Fill d\'un calderer, des de petit observa les formes de la natura i els oficis artesanals.', quote: null },
      { year: 1873, title: 'Escola d\'Arquitectura', text: 'Ingressa a l\'Escola Provincial d\'Arquitectura de Barcelona. El director diu: "No sé si hem donat el títol a un boig o a un geni."', quote: null },
      { year: 1878, title: 'Primeres obres', text: 'Es titula com a arquitecte. Coneix Eusebi Güell, que es convertirà en el seu gran mecenes. Comencen els encàrrecs importants.', quote: null },
      { year: 1883, title: 'La Sagrada Família', text: 'Assumeix la direcció de les obres del Temple Expiatori de la Sagrada Família, el projecte que definiria la seva vida.', quote: 'El meu client no té pressa.' },
      { year: 1886, title: 'Palau Güell', text: 'Construeix el Palau Güell al carrer Nou de la Rambla. Primera gran obra on aplica el trencadís als terrats.', quote: null },
      { year: 1900, title: 'Parc Güell', text: 'Comença el Parc Güell, una ciutat jardí que es convertirà en el millor exemple del trencadís a gran escala. El banc serpentí i el drac són icones universals.', quote: null },
      { year: 1904, title: 'Casa Batlló', text: 'Reforma la Casa Batlló al Passeig de Gràcia. La façana evoca el mar i els ossos, amb un trencadís iridiscent extraordinari.', quote: 'El color en els objectes és la vida.' },
      { year: 1906, title: 'Casa Milà', text: 'Construeix La Pedrera, amb la seva façana ondulant i els terrats escultòrics. L\'última obra civil abans de dedicar-se exclusivament a la Sagrada Família.', quote: null },
      { year: 1910, title: 'Reconeixement internacional', text: 'Exposició a París dels seus treballs. El món comença a reconèixer la seva genialitat, però ell s\'allunya cada cop més de la vida social.', quote: null },
      { year: 1914, title: 'Dedicació exclusiva', text: 'Es dedica exclusivament a la Sagrada Família. Viu cada cop de forma més austera, fins a instal·lar-se al taller de l\'obra.', quote: null },
      { year: 1924, title: 'Defensor del català', text: 'La policia l\'arresta per parlar en català a un agent durant la dictadura de Primo de Rivera. Declara: "Soc català i parlaré en català."', quote: 'Soc català i parlaré en català.' },
      { year: 1926, title: 'Mort', text: 'El 7 de juny és atropellat per un tramvia. Ningú el reconeix pel seu aspecte humil. Mor tres dies després, el 10 de juny. Barcelona sencera el plora.', quote: null }
    ],

    // Trencadís
    trencadisTitle: 'El Trencadís',
    trencadisSubtitle: 'L\'art de la ceràmica trencada',
    trencadisSections: [
      { title: 'Què és?', text: 'El trencadís és una tècnica decorativa que utilitza fragments irregulars de ceràmica, vidre o altres materials per crear mosaics. El nom ve del verb català "trencar" — l\'art de trencar per crear.', icon: '🔨' },
      { title: 'Origen', text: 'Gaudí no va inventar el mosaic, però va revolucionar-lo. Va convertir rebuigs de fàbriques de ceràmica — peces defectuoses, trencades, descartades — en art sublim. Reciclatge artístic avant la lettre.', icon: '♻' },
      { title: 'Tècnica', text: 'El procés és senzill però exigeix un ull extraordinari: es trenquen rajoles de ceràmica o vidre amb un martell, es seleccionen els fragments per forma i color, i es col·loquen sobre una superfície amb morter, formant un disseny.', icon: '🎨' },
      { title: 'Filosofia', text: 'Per a Gaudí, el trencadís era una metàfora: de la destrucció neix la creació. Cada fragment trencat troba el seu lloc en un tot harmònic. No hi ha errors, només possibilitats.', icon: '✨' },
      { title: 'On trobar-lo', text: 'El Parc Güell n\'és l\'exemple més famós, però el trencadís apareix arreu de l\'obra de Gaudí: als terrats del Palau Güell, a la façana de la Casa Batlló, als pinacles de la Sagrada Família, a la cripta de la Colònia Güell...', icon: '🏛' }
    ],

    // Natura
    natureTitle: 'Gaudí i la Natura',
    natureSubtitle: 'Biomímesi abans que existís la paraula',
    natureText: 'Gaudí va ser el primer arquitecte biomimètic. Estudiava la natura amb ulls d\'enginyer: les estructures dels ossos, la geometria de les flors, la resistència dels arbres al vent. Deia que la natura és el gran llibre, sempre obert, que cal esforçar-se a llegir.',
    natureExamples: [
      { element: 'Les columnes de la Sagrada Família', inspiration: 'Troncs d\'arbre que es ramifiquen cap al sostre, distribuint el pes com un bosc de pedra.' },
      { element: 'La façana de la Casa Batlló', inspiration: 'Ossos, esquelets i formes marines. La teulada evoca l\'esquena d\'un drac o el llom del mar.' },
      { element: 'Les xemeneies del Palau Güell', inspiration: 'Formes fungiformes, com bolets gegants coberts de trencadís.' },
      { element: 'L\'arc catenari', inspiration: 'La forma que adopta una cadena penjant per la gravetat — la forma estructuralment perfecta.' },
      { element: 'Les superfícies reglades', inspiration: 'L\'hiperboloide i el paraboloide, formes que es troben en les cames dels cavalls i les ales de les libèl·lules.' }
    ],
    natureQuote: 'L\'arbre prop del meu taller: aquest és el meu mestre.',

    // Curiositats
    curiositiesTitle: 'Curiositats i Cites',
    curiositiesSubtitle: 'Petits tresors sobre Gaudí',
    curiosities: [
      'Gaudí era vegetarià estricte durant els últims anys de la seva vida.',
      'La Sagrada Família no s\'acabarà fins aproximadament el 2026, cent anys després de la seva mort.',
      'Gaudí feia servir miralls per estudiar com la llum canviava les formes.',
      'Mai va viatjar fora de Catalunya i el sud de França.',
      'El trencadís del Parc Güell utilitza rebutjos de la fàbrica de ceràmica Pujol i Bausis d\'Esplugues.',
      'Gaudí penjava cadenes al revés per trobar les formes ideals dels arcs.',
      'Set obres de Gaudí són Patrimoni de la Humanitat per la UNESCO.',
      'El banc serpentí del Parc Güell està dissenyat ergonòmicament — Gaudí va fer seure un obrer nu al guix per obtenir la forma perfecta.',
      'La creu de quatre braços que corona moltes obres de Gaudí simbolitza els quatre punts cardinals.',
      'El drac del Parc Güell originalment escopia aigua com una font.'
    ],
    quotesTitle: 'Cites d\'Antoni Gaudí',
    // Les cites originals en català es mantenen en tots els idiomes
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

    // Privacitat
    navPrivacy: 'Privacitat',
    privacyTitle: 'Privacitat',
    privacySubtitle: 'Com tractem les teves dades',
    privacyIntro: 'Gaudí Mosaic respecta la teva privacitat. Aquesta aplicació ha estat dissenyada perquè les teves dades mai surtin del teu dispositiu.',
    privacyItems: [
      {
        icon: '🚫',
        title: 'No recollim dades personals',
        text: 'No demanem nom, correu electrònic ni cap altra informació personal. No hi ha registre ni comptes d\'usuari.'
      },
      {
        icon: '🍪',
        title: 'Sense cookies de rastreig',
        text: 'No utilitzem cookies de rastreig, analítiques ni de tercers. No hi ha Google Analytics, Facebook Pixel ni cap servei de seguiment.'
      },
      {
        icon: '📡',
        title: 'Sense connexió a servidors',
        text: 'L\'app funciona completament al teu navegador. No enviem cap informació a servidors externs. Tot el processament és local.'
      },
      {
        icon: '💾',
        title: 'Emmagatzematge local',
        text: 'Els teus projectes guardats i la preferència d\'idioma s\'emmagatzemen al localStorage del teu navegador. Aquestes dades romanen al teu dispositiu i les pots esborrar en qualsevol moment des de la configuració del navegador.'
      }
    ],

    // Contacte
    navContact: 'Contacte',
    contactTitle: 'Contacte',
    contactSubtitle: 'Tens preguntes, suggeriments o vols col·laborar?',
    contactEmail: 'contact@gaudimosaic.art',
    contactEmailText: 'Escriu-nos a',
    contactSocialTitle: 'Segueix-nos',
    contactSocial: [
      { icon: '🐦', name: 'Twitter / X', url: 'https://twitter.com/gaudimosaic', handle: '@gaudimosaic' },
      { icon: '📸', name: 'Instagram', url: 'https://instagram.com/gaudimosaic', handle: '@gaudimosaic' }
    ],
    contactProjectTitle: 'Sobre el projecte',
    contactProjectText: 'Gaudí Mosaic és un projecte creat per commemorar el centenari de la mort d\'Antoni Gaudí (1926–2026). L\'aplicació és gratuïta.',
    contactLicense: 'Fet amb ♥ a Barcelona'
  },

  // ---- Selector d'idioma ----
  language: {
    label: 'Idioma',
    current: 'Català'
  }
};
