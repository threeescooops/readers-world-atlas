(() => {
  'use strict';

  const tooltip = document.getElementById('country-tooltip');
  const tooltipFlag = document.getElementById('tooltip-flag');
  const tooltipName = document.getElementById('tooltip-name');
  const tooltipCount = document.getElementById('tooltip-count');
  const tooltipBooks = document.getElementById('tooltip-books');
  const tooltipClose = document.getElementById('tooltip-close');

  const mobileSheet = document.getElementById('mobile-sheet');
  const mobileBackdrop = document.getElementById('sheet-backdrop');
  const mobileFlag = document.getElementById('mobile-flag');
  const mobileName = document.getElementById('mobile-name');
  const mobileCount = document.getElementById('mobile-count');
  const mobileBooks = document.getElementById('mobile-books');
  const mobileClose = document.getElementById('mobile-close');
  const mapStage = document.getElementById('map-stage');

  let onClose = () => {};

  function isMobile() {
    return window.matchMedia('(max-width: 820px)').matches;
  }

  function countLabel(count) {
    return `${count} ${count === 1 ? 'book' : 'books'} read`;
  }

  function renderBooks(list, books) {
    list.replaceChildren();
    if (!books.length) {
      const item = document.createElement('li');
      item.className = 'empty-note';
      item.textContent = 'No books recorded from this country yet.';
      list.appendChild(item);
      return;
    }

    const fragment = document.createDocumentFragment();
    books.forEach(book => {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      const author = document.createElement('span');
      title.textContent = book.title;
      author.textContent = `by ${book.author}`;
      item.append(title, author);
      fragment.appendChild(item);
    });
    list.appendChild(fragment);
  }

  function populate(flagNode, nameNode, countNode, listNode, details) {
    flagNode.textContent = details.flag || '🏳️';
    nameNode.textContent = details.name;
    countNode.textContent = countLabel(details.books.length);
    renderBooks(listNode, details.books);
  }

  function positionTooltip(pointer) {
    if (tooltip.hidden) return;
    const stage = mapStage.getBoundingClientRect();
    const card = tooltip.getBoundingClientRect();
    const margin = 12;
    const requestedX = pointer?.[0] ?? stage.width / 2;
    const requestedY = pointer?.[1] ?? stage.height / 2;
    const left = Math.min(
      Math.max(requestedX + 18, margin),
      Math.max(margin, stage.width - card.width - margin)
    );
    const top = Math.min(
      Math.max(requestedY - 30, margin),
      Math.max(margin, stage.height - card.height - margin)
    );
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function show(details, pointer) {
    if (isMobile()) {
      populate(mobileFlag, mobileName, mobileCount, mobileBooks, details);
      mobileBackdrop.hidden = false;
      mobileSheet.hidden = false;
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(() => mobileClose.focus({ preventScroll: true }));
      return;
    }

    populate(tooltipFlag, tooltipName, tooltipCount, tooltipBooks, details);
    tooltip.hidden = false;
    positionTooltip(pointer);
  }

  function move(pointer) {
    if (!isMobile()) positionTooltip(pointer);
  }

  function hideDesktop() {
    tooltip.hidden = true;
  }

  function closeAll(notify = true) {
    tooltip.hidden = true;
    mobileSheet.hidden = true;
    mobileBackdrop.hidden = true;
    document.body.style.overflow = '';
    if (notify) onClose();
  }

  function configure(options = {}) {
    if (typeof options.onClose === 'function') onClose = options.onClose;
  }

  tooltipClose.addEventListener('click', () => closeAll());
  mobileClose.addEventListener('click', () => closeAll());
  mobileBackdrop.addEventListener('click', () => closeAll());
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (!tooltip.hidden || !mobileSheet.hidden)) closeAll();
  });
  window.addEventListener('resize', () => {
    if (!isMobile() && !mobileSheet.hidden) closeAll();
  });

  window.AtlasPanels = { configure, show, move, hideDesktop, closeAll, isMobile };
})();
