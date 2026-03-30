// =====================================================
// GAUDÍ MOSAIC — Panells laterals
// Ceràmiques, capes, plantilles
// =====================================================

import { getState, setState, emit, subscribe,
         addLayer, removeLayer, toggleLayerVisibility, reorderLayers } from '../state.js';
import { PALETTES, PALETTE_KEYS, CERAMIC_TYPES } from '../data/palettes.js';
import { TEMPLATES } from '../data/templates.js';
import { createElement } from '../utils/helpers.js';
import { loadAllTextures, filterByFinish, FINISH_NAMES } from '../data/textures.js';
import { t } from '../i18n/i18n.js';

// Totes les rajoles carregades (cache global)
let allTiles = [];

/**
 * Inicialitza el panell lateral amb pestanyes
 */
export function initPanels() {
  setupPanelTabs();
  initCeramicsPanel();
  initLayersPanel();
  initTemplatesPanel();

  // Subscriure's a canvis de capes
  subscribe('layers:change', renderLayersPanel);
}

/**
 * Reconstrueix tota la UI dinàmica (cridat en canvi d'idioma)
 */
export function rebuildDynamicUI() {
  initTemplatesPanel();
  renderLayersPanel();
  renderTileGrid();
  rebuildMobileToolsView();
}

/**
 * Configura les pestanyes del panell
 */
function setupPanelTabs() {
  const tabs = document.querySelectorAll('.panel-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const panelId = tab.dataset.panel;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
      const target = document.getElementById(`panel-${panelId}`);
      if (target) target.classList.add('active');

      setState('activePanel', panelId);
    });
  });
}

// =====================================================
// PANELL DE CERÀMIQUES (només textures Midjourney)
// =====================================================
function initCeramicsPanel() {
  const grid = document.getElementById('ceramicsGrid');
  if (!grid) return;

  setupFinishFilter();
  loadAndRenderTiles();
}

/**
 * Configura el selector d'acabat com a filtre
 */
function setupFinishFilter() {
  const ceramicSelect = document.getElementById('ceramicType');
  if (ceramicSelect) {
    const state = getState();
    ceramicSelect.value = state.ceramicType;
    ceramicSelect.addEventListener('change', (e) => {
      setState('ceramicType', e.target.value);
      renderTileGrid();
    });
  }
}

/**
 * Carrega totes les textures i renderitza la graella
 */
async function loadAndRenderTiles() {
  const grid = document.getElementById('ceramicsGrid');
  if (!grid) return;

  grid.innerHTML = `<div class="loading-tiles">${t('panels.loadingTiles')}</div>`;

  allTiles = await loadAllTextures();
  renderTileGrid();
}

/**
 * Renderitza la graella de rajoles filtrada per acabat
 */
function renderTileGrid() {
  const grid = document.getElementById('ceramicsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  const state = getState();

  const finishMap = { glazed: 'glazed', matte: 'matte', iridescent: 'iridescent', rustic: 'rustic' };
  const finish = finishMap[state.ceramicType] || 'glazed';

  const filtered = filterByFinish(allTiles, finish);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-tiles">${t('panels.noTiles')}</div>`;
    return;
  }

  // Agrupar per col·lecció
  const grouped = new Map();
  filtered.forEach(tl => {
    if (!grouped.has(tl.collection)) grouped.set(tl.collection, []);
    grouped.get(tl.collection).push(tl);
  });

  grouped.forEach((tiles, collectionName) => {
    const header = document.createElement('div');
    header.className = 'collection-header';
    // Noms de col·lecció es mantenen en català (noms propis)
    header.textContent = collectionName;
    grid.appendChild(header);

    tiles.forEach((tileData) => {
      const tile = document.createElement('div');
      tile.className = 'ceramic-tile';
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', `${collectionName} — ${t('finishes.' + tileData.finish)} ${tileData.variant}`);
      tile.tabIndex = 0;

      const cvs = document.createElement('canvas');
      cvs.width = 256;
      cvs.height = 256;
      const tCtx = cvs.getContext('2d');
      tCtx.imageSmoothingEnabled = true;
      tCtx.imageSmoothingQuality = 'high';
      tCtx.drawImage(tileData.img, 0, 0, 256, 256);
      tile.appendChild(cvs);

      const name = document.createElement('div');
      name.className = 'ceramic-name';
      name.textContent = `${collectionName} ${tileData.variant}`;
      tile.appendChild(name);

      const handler = () => selectCeramic(tile, cvs, tileData);
      tile.addEventListener('click', handler);
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });

      grid.appendChild(tile);
    });
  });
}

/**
 * Selecciona una ceràmica i obre la zona de trencament
 */
function selectCeramic(tile, canvas, tileData) {
  document.querySelectorAll('.ceramic-tile').forEach(t => t.classList.remove('selected'));
  tile.classList.add('selected');

  const state = getState();
  state.selectedCeramic = {
    canvas,
    palette: tileData.collection,
    pattern: 'texture',
    sourceImage: tileData.img
  };

  emit('ceramic:selected', state.selectedCeramic);
  emit('breakzone:open', state.selectedCeramic);
}

// =====================================================
// PANELL DE CAPES
// =====================================================
function initLayersPanel() {
  renderLayersPanel();

  const addBtn = document.getElementById('addLayerBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addLayer();
      emit('notify', t('panels.layerCreated'));
    });
  }
}

function renderLayersPanel() {
  const container = document.getElementById('layersList');
  if (!container) return;

  const state = getState();
  container.innerHTML = '';

  state.layers.slice().reverse().forEach((layer, revIdx) => {
    const idx = state.layers.length - 1 - revIdx;
    const el = createElement('div', {
      className: `layer-item ${layer.id === state.activeLayer ? 'active' : ''}`,
      role: 'button',
      tabIndex: '0'
    });

    const visBtn = createElement('button', {
      className: `layer-vis ${layer.visible ? 'visible' : ''}`,
      innerHTML: layer.visible ? '👁' : '—',
      'aria-label': layer.visible ? t('panels.hideLayer') : t('panels.showLayer'),
      onClick: (e) => {
        e.stopPropagation();
        toggleLayerVisibility(layer.id);
      }
    });

    const nameEl = createElement('span', {
      className: 'layer-name',
      textContent: layer.name
    });

    const count = state.placedPieces.filter(p => p.layer === layer.id).length;
    const countEl = createElement('span', {
      className: 'layer-count',
      textContent: `${count}`
    });

    if (state.layers.length > 1) {
      const delBtn = createElement('button', {
        className: 'layer-del',
        innerHTML: '✕',
        'aria-label': t('panels.deleteLayer'),
        onClick: (e) => {
          e.stopPropagation();
          removeLayer(layer.id);
          emit('notify', t('panels.layerDeleted'));
        }
      });
      el.appendChild(visBtn);
      el.appendChild(nameEl);
      el.appendChild(countEl);
      el.appendChild(delBtn);
    } else {
      el.appendChild(visBtn);
      el.appendChild(nameEl);
      el.appendChild(countEl);
    }

    el.addEventListener('click', () => {
      setState('activeLayer', layer.id);
      renderLayersPanel();
    });

    container.appendChild(el);
  });
}

// =====================================================
// PANELL DE PLANTILLES
// =====================================================
function initTemplatesPanel() {
  const container = document.getElementById('templatesList');
  if (!container) return;

  container.innerHTML = '';
  container.className = 'templates-grid';

  // Funció per seleccionar una tarjeta
  const selectCard = (el, template) => {
    container.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    setState('activeTemplate', template);
    emit('canvas:render');
  };

  // Opció "Sense plantilla"
  const noneCard = createElement('div', {
    className: 'template-card template-card-none active',
    textContent: t('panels.noTemplate'),
    onClick: () => selectCard(noneCard, null)
  });
  container.appendChild(noneCard);

  // Tarjetes per a cada plantilla
  TEMPLATES.forEach(template => {
    const card = createElement('div', { className: 'template-card' });

    // Miniatura SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', template.viewBox);
    svg.setAttribute('width', '64');
    svg.setAttribute('height', '64');
    template.paths.forEach(pathStr => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathStr);
      svg.appendChild(path);
    });
    card.appendChild(svg);

    // Nom traduït
    const tplName = t(`templateNames.${template.id}`);
    const name = createElement('div', {
      className: 'template-card-name',
      textContent: tplName !== `templateNames.${template.id}` ? tplName : template.name
    });
    card.appendChild(name);

    // Descripció traduïda
    const tplDesc = t(`templateDescriptions.${template.id}`);
    const desc = createElement('div', {
      className: 'template-card-desc',
      textContent: tplDesc !== `templateDescriptions.${template.id}` ? tplDesc : template.description
    });
    card.appendChild(desc);

    card.addEventListener('click', () => {
      selectCard(card, template);
      const displayName = tplName !== `templateNames.${template.id}` ? tplName : template.name;
      emit('notify', t('panels.templateActive', { name: displayName }));
    });

    container.appendChild(card);
  });

  // Controls d'opacitat i mida
  const opacitySlider = document.getElementById('templateOpacity');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      setState('templateOpacity', e.target.value / 100);
      emit('canvas:render');
    });
  }
  const scaleSlider = document.getElementById('templateScale');
  if (scaleSlider) {
    scaleSlider.addEventListener('input', (e) => {
      setState('templateScale', e.target.value / 100);
      emit('canvas:render');
    });
  }
}

// =====================================================
// NAVEGACIÓ MÒBIL AMB PESTANYES
// =====================================================
let mobileToolsView = null;

export function initMobilePanel() {
  const nav = document.getElementById('mobileNav');
  if (!nav) return;

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  createMobileToolsView();

  nav.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isMobile()) return;
      switchMobileView(btn.dataset.view);
    });
  });

  subscribe('fragments:update', () => {
    if (isMobile() && getState().fragments.length > 0) {
      switchMobileView('canvas');
    }
  });

  if (isMobile()) {
    switchMobileView('ceramics');
  }

  window.addEventListener('resize', () => {
    if (isMobile()) {
      const activeBtn = nav.querySelector('.mobile-nav-btn.active');
      if (activeBtn) {
        switchMobileView(activeBtn.dataset.view);
      } else {
        switchMobileView('ceramics');
      }
    } else {
      const panel = document.getElementById('panel');
      const canvasArea = document.getElementById('canvasArea');
      if (panel) {
        panel.classList.remove('mobile-view-active');
        panel.style.display = '';
      }
      if (canvasArea) {
        canvasArea.classList.remove('mobile-view-active');
        canvasArea.style.display = '';
      }
      if (mobileToolsView) {
        mobileToolsView.classList.remove('mobile-view-active');
      }
    }
  });
}

/**
 * Canvia la vista mòbil activa
 */
export function switchMobileView(viewName) {
  const nav = document.getElementById('mobileNav');
  const panel = document.getElementById('panel');
  const canvasArea = document.getElementById('canvasArea');
  if (!nav) return;

  nav.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  if (panel) panel.classList.remove('mobile-view-active');
  if (canvasArea) canvasArea.classList.remove('mobile-view-active');
  if (mobileToolsView) mobileToolsView.classList.remove('mobile-view-active');

  // Safata de fragments: només visible a la vista canvas
  const tray = document.getElementById('fragmentsTray');
  if (tray) {
    tray.style.display = viewName === 'canvas' ? '' : 'none';
  }

  switch (viewName) {
    case 'ceramics':
      if (panel) {
        panel.classList.add('mobile-view-active');
        activatePanelTab('ceramics');
      }
      break;

    case 'canvas':
      if (canvasArea) {
        canvasArea.classList.add('mobile-view-active');
        emit('app:ready');
      }
      break;

    case 'layers':
      if (panel) {
        panel.classList.add('mobile-view-active');
        activatePanelTab('layers');
      }
      break;

    case 'tools':
      if (mobileToolsView) {
        mobileToolsView.classList.add('mobile-view-active');
      }
      break;
  }
}

/**
 * Activa una pestanya del panell
 */
function activatePanelTab(panelId) {
  document.querySelectorAll('.panel-tab').forEach(tl => {
    tl.classList.toggle('active', tl.dataset.panel === panelId);
  });
  document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`panel-${panelId}`);
  if (target) target.classList.add('active');
}

/**
 * Crea la vista d'eines per a mòbil (dins del workspace)
 */
function createMobileToolsView() {
  const workspace = document.querySelector('.workspace');
  if (!workspace) return;

  mobileToolsView = createElement('div', { className: 'mobile-tools-view' });

  // Secció d'eines principals
  const toolsSection = createElement('div', { className: 'mobile-tools-section' }, [
    createElement('div', { className: 'mobile-tools-title', textContent: t('tools.label') })
  ]);

  const toolsGrid = createElement('div', { className: 'mobile-tools-grid' });
  const tools = [
    { id: 'move', icon: '✋', labelKey: 'tools.move' },
    { id: 'rotate', icon: '↻', labelKey: 'tools.rotate' },
    { id: 'scale', icon: '⤡', labelKey: 'tools.scale' },
    { id: 'pan', icon: '☩', labelKey: 'tools.pan' },
    { id: 'duplicate', icon: '⊕', labelKey: 'tools.duplicate' },
    { id: 'delete', icon: '✕', labelKey: 'tools.delete' }
  ];

  tools.forEach(tool => {
    const btn = createElement('button', {
      className: `mobile-tool-btn ${tool.id === 'move' ? 'active' : ''}`,
      innerHTML: `<span class="tool-icon">${tool.icon}</span>${t(tool.labelKey)}`,
      'data-tool': tool.id
    });
    btn.addEventListener('click', () => {
      if (tool.id === 'duplicate') {
        const state = getState();
        if (state.selectedPiece !== null) {
          emit('piece:duplicate', state.selectedPiece);
          import('../state.js').then(m => m.duplicatePiece(state.selectedPiece));
        }
        return;
      }
      import('./toolbar.js').then(m => m.setActiveTool(tool.id));
      toolsGrid.querySelectorAll('.mobile-tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    toolsGrid.appendChild(btn);
  });
  toolsSection.appendChild(toolsGrid);
  mobileToolsView.appendChild(toolsSection);

  // Secció de rejunt
  const groutSection = createElement('div', { className: 'mobile-tools-section' }, [
    createElement('div', { className: 'mobile-tools-title', textContent: t('grout.label') })
  ]);

  const groutRow = createElement('div', { className: 'mobile-grout-row' });

  const groutToggle = createElement('input', {
    type: 'checkbox',
    className: 'grout-toggle',
    id: 'mobileGroutToggle'
  });
  groutToggle.addEventListener('change', (e) => {
    getState().grout.enabled = e.target.checked;
    const desktopToggle = document.getElementById('groutToggle');
    if (desktopToggle) desktopToggle.checked = e.target.checked;
    import('../engine/canvas.js').then(m => m.render());
  });

  const groutColor = createElement('input', {
    type: 'color',
    className: 'grout-color',
    value: '#8C7B6B'
  });
  groutColor.addEventListener('input', (e) => {
    getState().grout.color = e.target.value;
    const desktopColor = document.getElementById('groutColor');
    if (desktopColor) desktopColor.value = e.target.value;
    import('../engine/canvas.js').then(m => m.render());
  });

  const groutWidth = createElement('input', {
    type: 'range',
    className: 'control-range',
    min: '1', max: '6', value: '2',
    style: 'flex:1'
  });
  groutWidth.addEventListener('input', (e) => {
    getState().grout.width = parseInt(e.target.value);
    import('../engine/canvas.js').then(m => m.render());
  });

  groutRow.appendChild(createElement('span', {
    className: 'control-label',
    textContent: t('grout.activate')
  }));
  groutRow.appendChild(groutToggle);
  groutRow.appendChild(groutColor);
  groutRow.appendChild(groutWidth);
  groutSection.appendChild(groutRow);
  mobileToolsView.appendChild(groutSection);

  // Secció de fons
  const bgSection = createElement('div', { className: 'mobile-tools-section' }, [
    createElement('div', { className: 'mobile-tools-title', textContent: t('backgrounds.canvasBackground') })
  ]);

  const bgGrid = createElement('div', { className: 'mobile-bg-grid' });
  const backgrounds = [
    { id: 'dark', color: '#1C1914', labelKey: 'backgrounds.dark' },
    { id: 'light', color: '#F5ECD7', labelKey: 'backgrounds.light' },
    { id: 'blue', color: '#1A3A4A', labelKey: 'backgrounds.blue' },
    { id: 'stone', color: '#8C7B6B', labelKey: 'backgrounds.stone' },
    { id: 'cement', color: '#A09585', labelKey: 'backgrounds.cement' }
  ];

  backgrounds.forEach((bg, i) => {
    const btn = createElement('button', {
      className: `mobile-bg-btn ${i === 0 ? 'active' : ''}`,
      style: `background:${bg.color}`,
      title: t(bg.labelKey),
      'aria-label': `${t('backgrounds.label')} ${t(bg.labelKey)}`
    });
    btn.addEventListener('click', () => {
      setState('canvasBg', bg.color);
      bgGrid.querySelectorAll('.mobile-bg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
      const desktopBtn = document.getElementById(`bg-${bg.id}`);
      if (desktopBtn) desktopBtn.classList.add('active');
      import('../engine/canvas.js').then(m => m.render());
    });
    bgGrid.appendChild(btn);
  });
  bgSection.appendChild(bgGrid);
  mobileToolsView.appendChild(bgSection);

  // Secció d'accions ràpides
  const actionsSection = createElement('div', { className: 'mobile-tools-section' }, [
    createElement('div', { className: 'mobile-tools-title', textContent: t('mobile.actions') })
  ]);
  const actionsGrid = createElement('div', { className: 'mobile-tools-grid' });
  const actions = [
    { icon: '↩', labelKey: 'header.undo', action: () => import('../state.js').then(m => m.undo()) },
    { icon: '🔍', labelKey: 'mobile.resetZoom', action: () => import('../engine/canvas.js').then(m => m.resetZoom()) },
    { icon: '🗑', labelKey: 'header.clear', action: () => import('../state.js').then(m => m.clearCanvas()) },
    { icon: '↓', labelKey: 'header.save', action: () => document.getElementById('saveBtn')?.click() },
    { icon: '↑', labelKey: 'header.load', action: () => document.getElementById('loadBtn')?.click() },
    { icon: '📤', labelKey: 'header.export', action: () => document.getElementById('exportBtn')?.click() }
  ];
  actions.forEach(act => {
    const label = t(act.labelKey);
    // Strip icon prefixes from header labels (↑, ↓, ↩)
    const cleanLabel = label.replace(/^[↑↓↩]\s*/, '');
    const btn = createElement('button', {
      className: 'mobile-tool-btn',
      innerHTML: `<span class="tool-icon">${act.icon}</span>${cleanLabel}`
    });
    btn.addEventListener('click', act.action);
    actionsGrid.appendChild(btn);
  });
  actionsSection.appendChild(actionsGrid);
  mobileToolsView.appendChild(actionsSection);

  workspace.appendChild(mobileToolsView);
}

/**
 * Reconstrueix la vista d'eines mòbil (per canvi d'idioma)
 */
function rebuildMobileToolsView() {
  if (mobileToolsView) {
    mobileToolsView.remove();
    mobileToolsView = null;
  }
  createMobileToolsView();
}
