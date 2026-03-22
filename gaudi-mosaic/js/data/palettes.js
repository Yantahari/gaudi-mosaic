// =====================================================
// GAUDÍ MOSAIC — Paletes de colors
// Cada paleta inspirada en una obra d'Antoni Gaudí
// =====================================================

export const PALETTES = {
  parkGuell: {
    name: 'Parc Güell',
    description: 'Els colors vibrants del banc serpentí i el drac',
    category: 'iconic',
    colors: ['#D4A843', '#2E6B8A', '#E8DCC8', '#D4763A', '#4A7C59', '#B84233', '#1A8A7D', '#8B6914', '#C4956A', '#3A5A7C']
  },
  casaBatllo: {
    name: 'Casa Batlló',
    description: 'Blaus i verds de la façana marina',
    category: 'iconic',
    colors: ['#2E6B8A', '#1A8A7D', '#4A9BB5', '#6BB5A0', '#D4A843', '#1C4E6B', '#7DCFB6', '#2A7F6F', '#A8D8C8', '#3B8EA5']
  },
  sagradaFamilia: {
    name: 'Sagrada Família',
    description: 'Tons daurats i pedra de la basílica',
    category: 'iconic',
    colors: ['#C4956A', '#D4A843', '#8B6914', '#E8DCC8', '#A67B3D', '#D4C4A0', '#967544', '#B8A070', '#6B5530', '#F0E6D0']
  },
  laManyana: {
    name: 'El Matí',
    description: 'Colors càlids de l\'alba mediterrània',
    category: 'ambient',
    colors: ['#D4763A', '#B84233', '#D4A843', '#E8DCC8', '#6B3A2A', '#C9614A', '#A85030', '#E09060', '#8B5030', '#F0C090']
  },
  mediterrani: {
    name: 'Mediterrani',
    description: 'Blancs, blaus i daurats del mar',
    category: 'ambient',
    colors: ['#FFFFFF', '#2E6B8A', '#D4A843', '#1A8A7D', '#E8DCC8', '#4A9BB5', '#F5ECD7', '#3B8EA5', '#87CEEB', '#D4763A']
  },
  casaMila: {
    name: 'Casa Milà',
    description: 'La Pedrera: tons de pedra, ferro i cel',
    category: 'iconic',
    colors: ['#B8A88A', '#8C7B6B', '#D4C4A0', '#6B5E4F', '#E8DCC8', '#9E8E7A', '#C4B08C', '#7A6B5A', '#DDD0BC', '#5A4E42']
  },
  coloniaGuell: {
    name: 'Colònia Güell',
    description: 'Basalts, maons i vitralls de la cripta',
    category: 'iconic',
    colors: ['#5A3E2B', '#8B6914', '#B84233', '#2E6B8A', '#4A7C59', '#C4956A', '#D4A843', '#3D2B1F', '#6B8E4E', '#A0522D']
  },
  criptaGuell: {
    name: 'Cripta Güell',
    description: 'Colors profunds dels vitralls i la pedra volcànica',
    category: 'iconic',
    colors: ['#2C1810', '#8B4513', '#1A8A7D', '#D4A843', '#4A2C17', '#6B8E4E', '#B84233', '#1C4E6B', '#A0522D', '#3A6B35']
  },
  vitrall: {
    name: 'Vitrall',
    description: 'Llum filtrada pels vitralls de la Sagrada Família',
    category: 'ambient',
    colors: ['#C41E3A', '#FF6B35', '#FFD700', '#32CD32', '#1E90FF', '#8A2BE2', '#FF69B4', '#00CED1', '#FF4500', '#9370DB']
  },
  nocturn: {
    name: 'Nocturn',
    description: 'Barcelona de nit, llums i ombres',
    category: 'ambient',
    colors: ['#1C1914', '#2E2620', '#D4A843', '#3A5A7C', '#1A3A4A', '#4A3A2A', '#6B5530', '#2A4A3A', '#8B6914', '#0D1B2A']
  },
  jocsFlorals: {
    name: 'Jocs Florals',
    description: 'Ornamentació floral dels Jocs Florals catalans',
    category: 'collection',
    colors: ['#D4A843', '#B84233', '#4A7C59', '#2E6B8A', '#C4956A', '#8B6914', '#D4763A', '#1A8A7D', '#E8DCC8', '#6B5530']
  },
  mosaicClassic: {
    name: 'Mosaic Clàssic',
    description: 'Mosaics clàssics amb acabats variats',
    category: 'collection',
    colors: ['#C4956A', '#2E6B8A', '#D4A843', '#4A7C59', '#B84233', '#1A8A7D', '#8B6914', '#D4763A', '#E8DCC8', '#3A5A7C']
  }
};

export const PALETTE_KEYS = Object.keys(PALETTES);

// Patrons de ceràmica disponibles
export const PATTERN_TYPES = [
  { id: 'circles', name: 'Cercles' },
  { id: 'stripes', name: 'Ratlles' },
  { id: 'diamonds', name: 'Diamants' },
  { id: 'organic', name: 'Orgànic' },
  { id: 'mosaic', name: 'Mosaic' },
  { id: 'floral', name: 'Floral' },
  { id: 'spiral', name: 'Espiral' },
  { id: 'scales', name: 'Escates' },
  { id: 'stainedglass', name: 'Vitrall' },
  { id: 'granite', name: 'Granit' }
];

// Tipus de ceràmica amb propietats visuals
export const CERAMIC_TYPES = {
  glazed: {
    name: 'Vidriat',
    description: 'Superfície brillant i reflectant',
    glossiness: 0.8,
    roughness: 0.1
  },
  matte: {
    name: 'Mat',
    description: 'Superfície suau sense brillantor',
    glossiness: 0.1,
    roughness: 0.3
  },
  iridescent: {
    name: 'Iridiscent',
    description: 'Canvia de color amb l\'angle de visió',
    glossiness: 0.9,
    roughness: 0.05
  },
  rustic: {
    name: 'Rústic',
    description: 'Textura rugosa i natural',
    glossiness: 0.2,
    roughness: 0.7
  }
};

// Colors de fons predefinits
export const BACKGROUNDS = [
  { id: 'dark', name: 'Fosc', color: '#1C1914' },
  { id: 'light', name: 'Clar', color: '#F5ECD7' },
  { id: 'blue', name: 'Blau mediterrani', color: '#1A3A4A' },
  { id: 'stone', name: 'Pedra', color: '#8C7B6B' },
  { id: 'cement', name: 'Ciment', color: '#A09585' }
];
