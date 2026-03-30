// =====================================================
// GAUDÍ MOSAIC — Sistema de modals
// Contingut educatiu, guardar/carregar, ajuda
// =====================================================

import { subscribe, emit, getState, setState } from '../state.js';
import { createElement } from '../utils/helpers.js';
import { t } from '../i18n/i18n.js';

/**
 * Inicialitza el sistema de modals
 */
export function initModals() {
  subscribe('modal:education', showEducationModal);
  subscribe('modal:help', showHelpModal);
  subscribe('modal:save', showSaveModal);
  subscribe('modal:load', showLoadModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/**
 * Mostra un modal genèric
 */
function showModal(content, title = '') {
  closeModal();

  const overlay = createElement('div', { className: 'modal-overlay' });
  const modal = createElement('div', { className: 'modal' });

  const header = createElement('div', { className: 'modal-header' }, [
    createElement('h2', { className: 'modal-title', textContent: title }),
    createElement('button', {
      className: 'modal-close',
      innerHTML: '✕',
      'aria-label': t('dialogs.close'),
      onClick: closeModal
    })
  ]);

  const body = createElement('div', { className: 'modal-body' });
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
}

/**
 * Tanca el modal actiu
 */
function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
}

// =====================================================
// MODAL EDUCATIU — Sobre Gaudí i el Trencadís
// =====================================================
function showEducationModal() {
  const container = createElement('div', { className: 'edu-container' });

  const nav = createElement('div', { className: 'edu-nav' });
  const sections = [
    { id: 'guia', labelKey: 'education.navGuide', icon: '📖' },
    { id: 'bio', labelKey: 'education.navBio', icon: '🏛' },
    { id: 'trencadis', labelKey: 'education.navTrencadis', icon: '🔨' },
    { id: 'natura', labelKey: 'education.navNature', icon: '🌿' },
    { id: 'curiositats', labelKey: 'education.navCuriosities', icon: '✨' },
    { id: 'privacitat', labelKey: 'education.navPrivacy', icon: '🔒' },
    { id: 'contacte', labelKey: 'education.navContact', icon: '✉' }
  ];

  const contentArea = createElement('div', { className: 'edu-content' });

  sections.forEach((section, i) => {
    const btn = createElement('button', {
      className: `edu-nav-btn ${i === 0 ? 'active' : ''}`,
      innerHTML: `<span class="edu-nav-icon">${section.icon}</span> ${t(section.labelKey)}`,
      onClick: () => {
        nav.querySelectorAll('.edu-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showEduSection(contentArea, section.id);
      }
    });
    nav.appendChild(btn);
  });

  container.appendChild(nav);
  container.appendChild(contentArea);

  showEduSection(contentArea, 'guia');
  showModal(container, t('education.modalTitle'));
}

/**
 * Mostra una secció educativa
 */
function showEduSection(container, sectionId) {
  container.innerHTML = '';

  switch (sectionId) {
    case 'guia': renderGuiaSection(container); break;
    case 'bio': renderBioSection(container); break;
    case 'trencadis': renderTrencadisSection(container); break;
    case 'natura': renderNaturaSection(container); break;
    case 'curiositats': renderCuriositatsSection(container); break;
    case 'privacitat': renderPrivacitatSection(container); break;
    case 'contacte': renderContacteSection(container); break;
  }
}

function renderGuiaSection(container) {
  const intro = createElement('div', { className: 'edu-intro' }, [
    createElement('h3', { textContent: t('education.guideTitle') }),
    createElement('p', { className: 'edu-subtitle', textContent: t('education.guideSubtitle') })
  ]);
  container.appendChild(intro);

  const steps = t('education.guideSteps');
  if (Array.isArray(steps)) {
    steps.forEach(pas => {
      const card = createElement('div', { className: 'edu-card' }, [
        createElement('div', { className: 'edu-card-icon', textContent: pas.icon }),
        createElement('div', { className: 'edu-card-content' }, [
          createElement('h4', { textContent: pas.title }),
          createElement('p', { textContent: pas.text })
        ])
      ]);
      container.appendChild(card);
    });
  }

  container.appendChild(createElement('hr', { className: 'edu-divider' }));

  const drecTitle = createElement('h4', {
    className: 'edu-cites-title',
    textContent: t('education.shortcutsTitle')
  });
  container.appendChild(drecTitle);

  const drecList = createElement('div', { className: 'edu-curiosities' });
  const shortcuts = t('education.shortcuts');
  if (Array.isArray(shortcuts)) {
    shortcuts.forEach(d => {
      const item = createElement('div', { className: 'curiosity-item' }, [
        createElement('span', {
          className: 'curiosity-bullet',
          textContent: d.key,
          style: 'font-size:11px;color:var(--gaudi-gold);min-width:65px;font-family:monospace;'
        }),
        createElement('p', { textContent: d.action })
      ]);
      drecList.appendChild(item);
    });
  }
  container.appendChild(drecList);

  // Botó per repetir el tutorial interactiu
  const repeatBtn = createElement('button', {
    className: 'break-btn use',
    textContent: t('tutorial.repeat'),
    style: 'margin-top: 16px; align-self: center;',
    onClick: () => {
      // Tancar el modal educatiu i llançar el tutorial
      const overlay = document.querySelector('.modal-overlay');
      if (overlay) overlay.remove();
      emit('tutorial:repeat');
    }
  });
  container.appendChild(repeatBtn);
}

function showHelpModal() {
  showEducationModal();
}

function renderBioSection(container) {
  const intro = createElement('div', { className: 'edu-intro' }, [
    createElement('h3', { textContent: t('education.bioTitle') }),
    createElement('p', { className: 'edu-subtitle', textContent: t('education.bioSubtitle') }),
    createElement('p', { className: 'edu-text', textContent: t('education.bioIntro') })
  ]);
  container.appendChild(intro);

  const timeline = createElement('div', { className: 'edu-timeline' });
  const events = t('education.bioTimeline');

  if (Array.isArray(events)) {
    events.forEach(event => {
      const item = createElement('div', { className: 'timeline-item' });

      const year = createElement('div', { className: 'timeline-year', textContent: event.year });
      const content = createElement('div', { className: 'timeline-content' }, [
        createElement('h4', { textContent: event.title }),
        createElement('p', { textContent: event.text })
      ]);

      if (event.quote) {
        const cita = createElement('blockquote', {
          className: 'timeline-quote',
          textContent: `"${event.quote}"`
        });
        content.appendChild(cita);
      }

      item.appendChild(year);
      item.appendChild(content);
      timeline.appendChild(item);
    });
  }

  container.appendChild(timeline);
}

function renderTrencadisSection(container) {
  const intro = createElement('div', { className: 'edu-intro' }, [
    createElement('h3', { textContent: t('education.trencadisTitle') }),
    createElement('p', { className: 'edu-subtitle', textContent: t('education.trencadisSubtitle') })
  ]);
  container.appendChild(intro);

  const sections = t('education.trencadisSections');
  if (Array.isArray(sections)) {
    sections.forEach(section => {
      const card = createElement('div', { className: 'edu-card' }, [
        createElement('div', { className: 'edu-card-icon', textContent: section.icon }),
        createElement('div', { className: 'edu-card-content' }, [
          createElement('h4', { textContent: section.title }),
          createElement('p', { textContent: section.text })
        ])
      ]);
      container.appendChild(card);
    });
  }
}

function renderNaturaSection(container) {
  const intro = createElement('div', { className: 'edu-intro' }, [
    createElement('h3', { textContent: t('education.natureTitle') }),
    createElement('p', { className: 'edu-subtitle', textContent: t('education.natureSubtitle') }),
    createElement('p', { className: 'edu-text', textContent: t('education.natureText') })
  ]);
  container.appendChild(intro);

  const grid = createElement('div', { className: 'edu-grid' });
  const examples = t('education.natureExamples');
  if (Array.isArray(examples)) {
    examples.forEach(ex => {
      const card = createElement('div', { className: 'edu-example' }, [
        createElement('h4', { textContent: ex.element }),
        createElement('p', { textContent: ex.inspiration })
      ]);
      grid.appendChild(card);
    });
  }
  container.appendChild(grid);

  const cita = createElement('blockquote', {
    className: 'edu-quote',
    textContent: `"${t('education.natureQuote')}" — Antoni Gaudí`
  });
  container.appendChild(cita);
}

function renderCuriositatsSection(container) {
  const intro = createElement('div', { className: 'edu-intro' }, [
    createElement('h3', { textContent: t('education.curiositiesTitle') }),
    createElement('p', { className: 'edu-subtitle', textContent: t('education.curiositiesSubtitle') })
  ]);
  container.appendChild(intro);

  const curiList = createElement('div', { className: 'edu-curiosities' });
  const curiosities = t('education.curiosities');
  if (Array.isArray(curiosities)) {
    curiosities.forEach(dada => {
      const item = createElement('div', { className: 'curiosity-item' }, [
        createElement('span', { className: 'curiosity-bullet', textContent: '◆' }),
        createElement('p', { textContent: dada })
      ]);
      curiList.appendChild(item);
    });
  }
  container.appendChild(curiList);

  container.appendChild(createElement('hr', { className: 'edu-divider' }));

  const citesTitle = createElement('h4', { className: 'edu-cites-title', textContent: t('education.quotesTitle') });
  container.appendChild(citesTitle);

  const citesList = createElement('div', { className: 'edu-quotes-list' });
  const quotes = t('education.quotes');
  if (Array.isArray(quotes)) {
    quotes.forEach(cita => {
      const item = createElement('blockquote', {
        className: 'edu-quote-item',
        textContent: `"${cita}"`
      });
      citesList.appendChild(item);
    });
  }
  container.appendChild(citesList);
}

// =====================================================
// SECCIÓ DE PRIVACITAT
// =====================================================
function renderPrivacitatSection(container) {
  const intro = createElement('div', { className: 'edu-intro' }, [
    createElement('h3', { textContent: t('education.privacyTitle') }),
    createElement('p', { className: 'edu-subtitle', textContent: t('education.privacySubtitle') }),
    createElement('p', { className: 'edu-text', textContent: t('education.privacyIntro') })
  ]);
  container.appendChild(intro);

  const items = t('education.privacyItems');
  if (Array.isArray(items)) {
    items.forEach(item => {
      const card = createElement('div', { className: 'edu-card' }, [
        createElement('div', { className: 'edu-card-icon', textContent: item.icon }),
        createElement('div', { className: 'edu-card-content' }, [
          createElement('h4', { textContent: item.title }),
          createElement('p', { textContent: item.text })
        ])
      ]);
      container.appendChild(card);
    });
  }
}

// =====================================================
// SECCIÓ DE CONTACTE
// =====================================================
function renderContacteSection(container) {
  const intro = createElement('div', { className: 'edu-intro' }, [
    createElement('h3', { textContent: t('education.contactTitle') }),
    createElement('p', { className: 'edu-subtitle', textContent: t('education.contactSubtitle') })
  ]);
  container.appendChild(intro);

  // Email
  const emailCard = createElement('div', { className: 'edu-card' }, [
    createElement('div', { className: 'edu-card-icon', textContent: '📧' }),
    createElement('div', { className: 'edu-card-content' }, [
      createElement('h4', { textContent: t('education.contactEmailText') }),
      createElement('a', {
        href: `mailto:${t('education.contactEmail')}`,
        textContent: t('education.contactEmail'),
        style: 'color: var(--gaudi-gold); text-decoration: none; font-size: 14px;'
      })
    ])
  ]);
  container.appendChild(emailCard);

  // Xarxes socials
  container.appendChild(createElement('hr', { className: 'edu-divider' }));
  container.appendChild(createElement('h4', {
    className: 'edu-cites-title',
    textContent: t('education.contactSocialTitle')
  }));

  const socials = t('education.contactSocial');
  if (Array.isArray(socials)) {
    socials.forEach(social => {
      const card = createElement('div', { className: 'edu-card' }, [
        createElement('div', { className: 'edu-card-icon', textContent: social.icon }),
        createElement('div', { className: 'edu-card-content' }, [
          createElement('h4', { textContent: social.name }),
          createElement('a', {
            href: social.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            textContent: social.handle,
            style: 'color: var(--gaudi-gold); text-decoration: none; font-size: 13px;'
          })
        ])
      ]);
      container.appendChild(card);
    });
  }

  // Sobre el projecte
  container.appendChild(createElement('hr', { className: 'edu-divider' }));
  container.appendChild(createElement('h4', {
    className: 'edu-cites-title',
    textContent: t('education.contactProjectTitle')
  }));
  container.appendChild(createElement('p', {
    className: 'edu-text',
    textContent: t('education.contactProjectText')
  }));

  // Peu
  const footer = createElement('p', {
    style: 'text-align: center; margin-top: 20px; font-size: 13px; color: var(--gaudi-gold); font-style: italic;',
    textContent: t('education.contactLicense')
  });
  container.appendChild(footer);
}

// =====================================================
// MODALS DE GUARDAR/CARREGAR
// =====================================================
function showSaveModal() {
  emit('project:save');
}

function showLoadModal() {
  emit('project:load');
}
