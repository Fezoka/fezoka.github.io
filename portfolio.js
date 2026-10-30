/* Interações do portfólio oficial: listas compactas, destaque e navegação responsiva. */
(function () {
  'use strict';

  function progressiveList(gridSelector, initialCount, noun) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    const cards = Array.from(grid.children).filter(node => node.classList.contains('card'));
    if (cards.length <= initialCount) return;

    const actions = document.createElement('div');
    actions.className = 'compact-list-actions';
    const button = document.createElement('button');
    button.className = 'compact-list-toggle';
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    if (!grid.id) grid.id = `${noun}-grade`;
    button.setAttribute('aria-controls', grid.id);
    actions.appendChild(button);
    grid.after(actions);

    let expanded = false;
    function render() {
      cards.forEach((card, index) => {
        const hidden = !expanded && index >= initialCount;
        card.classList.toggle('portfolio-compact-hidden', hidden);
        if (hidden) {
          card.setAttribute('inert', '');
          card.setAttribute('aria-hidden', 'true');
        } else {
          card.removeAttribute('inert');
          card.removeAttribute('aria-hidden');
        }
      });
      button.textContent = expanded ? `Mostrar menos ${noun}` : `Ver todos os ${noun} (${cards.length})`;
      button.setAttribute('aria-expanded', String(expanded));
    }
    button.addEventListener('click', () => {
      expanded = !expanded;
      render();
      if (!expanded) grid.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    render();
  }

  progressiveList('#projetos .projects-list', 4, 'projetos');
  progressiveList('#cursos .cards-grid', 3, 'certificados');

  // Foco visual global: o recorte acompanha o card, inclusive durante o movimento.
  const spotlightSelector = '#habilidades .habilidade-card, #experiencia .timeline-item, #projetos .projects-list > .card, #cursos .cards-grid > .card';
  const hoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)');
  const spotlight = document.createElement('div');
  spotlight.className = 'compact-card-spotlight';
  spotlight.setAttribute('aria-hidden', 'true');
  document.body.appendChild(spotlight);

  let hoveredCard = null;
  let focusedCard = null;
  let activeCard = null;
  let frame = 0;
  let previousBox = '';

  function followCard() {
    if (!activeCard || !activeCard.isConnected || activeCard.getClientRects().length === 0) {
      hideSpotlight();
      return;
    }

    const rect = activeCard.getBoundingClientRect();
    const box = `${rect.left},${rect.top},${rect.width},${rect.height}`;
    if (box !== previousBox) {
      spotlight.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
      spotlight.style.width = `${rect.width}px`;
      spotlight.style.height = `${rect.height}px`;
      previousBox = box;
    }
    frame = requestAnimationFrame(followCard);
  }

  function hideSpotlight() {
    activeCard = null;
    previousBox = '';
    cancelAnimationFrame(frame);
    frame = 0;
    spotlight.classList.remove('is-visible');
  }

  function syncSpotlight() {
    const nextCard = hoveredCard || focusedCard;
    if (!nextCard || nextCard.closest('.portfolio-compact-hidden')) {
      hideSpotlight();
      return;
    }
    if (nextCard === activeCard) return;
    cancelAnimationFrame(frame);
    activeCard = nextCard;
    previousBox = '';
    followCard();
    spotlight.classList.add('is-visible');
  }

  document.addEventListener('pointerover', event => {
    if (!hoverDevice.matches) return;
    const card = event.target.closest?.(spotlightSelector);
    if (card && card !== hoveredCard) {
      hoveredCard = card;
      syncSpotlight();
    }
  });

  document.addEventListener('pointerout', event => {
    if (!hoveredCard || hoveredCard.contains(event.relatedTarget)) return;
    hoveredCard = null;
    syncSpotlight();
  });

  document.addEventListener('focusin', event => {
    focusedCard = event.target.closest?.(spotlightSelector) || null;
    syncSpotlight();
  });

  document.addEventListener('focusout', event => {
    if (!focusedCard || focusedCard.contains(event.relatedTarget)) return;
    focusedCard = null;
    syncSpotlight();
  });

  window.addEventListener('blur', () => {
    hoveredCard = null;
    focusedCard = null;
    hideSpotlight();
  });

  const nav = document.querySelector('header nav');
  const links = nav?.querySelector('.nav-links');
  if (nav && links) {
    links.id = 'compact-nav-links';
    const menu = document.createElement('button');
    menu.type = 'button';
    menu.className = 'compact-menu-toggle';
    menu.textContent = 'Menu ☰';
    menu.setAttribute('aria-label', 'Abrir menu de navegação');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-controls', links.id);
    nav.appendChild(menu);
    const close = () => {
      links.classList.remove('compact-menu-open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Abrir menu de navegação');
    };
    menu.addEventListener('click', () => {
      const open = links.classList.toggle('compact-menu-open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    });
    links.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    document.addEventListener('click', event => { if (!nav.contains(event.target)) close(); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', close);
  }
})();
