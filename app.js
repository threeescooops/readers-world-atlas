(() => {
  'use strict';

  const totalBooks = document.getElementById('book-total');
  const totalCountries = document.getElementById('country-total');
  const status = document.getElementById('sync-status');
  const loading = document.getElementById('loading-panel');
  const brandReset = document.getElementById('brand-reset');

  let atlas = null;
  let latestDataset = null;
  let refreshInProgress = false;

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }

  function checkedTime() {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date());
  }

  function updateTotals(dataset) {
    totalBooks.textContent = dataset.totalBooks.toLocaleString();
    totalCountries.textContent = dataset.totalCountries.toLocaleString();
  }

  async function refresh({ initial = false } = {}) {
    if (refreshInProgress) return;
    refreshInProgress = true;
    if (!initial) setStatus('Checking the live reading ledger…', 'loading');

    try {
      const rows = await AtlasData.loadSheet();
      latestDataset = AtlasData.organise(rows);
      atlas?.setData(latestDataset);
      updateTotals(latestDataset);
      setStatus(`Live sheet · checked ${checkedTime()}`, 'live');
    } catch (error) {
      console.error('[Reader’s World Atlas] Sheet refresh failed:', error);
      if (!latestDataset) {
        totalBooks.textContent = '—';
        totalCountries.textContent = '—';
      }
      setStatus('Live sheet unavailable · another check will follow', 'error');
    } finally {
      refreshInProgress = false;
      if (initial) loading.hidden = true;
    }
  }

  async function boot() {
    setStatus('Drawing the world map…', 'loading');
    const firstSheetRequest = AtlasData.loadSheet();

    try {
      atlas = await AtlasMap.create();
      brandReset.addEventListener('click', () => atlas.reset());
    } catch (error) {
      console.error('[Reader’s World Atlas] Map startup failed:', error);
      const heading = loading.querySelector('strong');
      const note = loading.querySelector('span');
      heading.textContent = 'The atlas could not be drawn';
      note.textContent = 'Please reload in a current browser';
      setStatus('Map data unavailable', 'error');
      return;
    }

    try {
      latestDataset = AtlasData.organise(await firstSheetRequest);
      atlas.setData(latestDataset);
      updateTotals(latestDataset);
      setStatus(`Live sheet · checked ${checkedTime()}`, 'live');
    } catch (error) {
      console.error('[Reader’s World Atlas] Initial sheet request failed:', error);
      setStatus('Live sheet unavailable · another check will follow', 'error');
    } finally {
      loading.hidden = true;
    }

    window.setInterval(() => refresh(), AtlasData.REFRESH_MS);
    window.addEventListener('online', () => refresh());
  }

  boot();
})();
