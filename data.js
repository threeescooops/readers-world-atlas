(() => {
  'use strict';

  const SHEET_ID = '1vA4ALaNS7Zzmreb69lO7c04d4bb8k2chWaQFKOx5eUU';
  const GID = '0';
  const REFRESH_MS = 5 * 60 * 1000;

  const aliases = {
    'u.s.a.':'USA','us':'USA','usa':'USA','united states':'USA','united states of america':'USA',
    'uk':'United Kingdom','great britain':'United Kingdom','england':'United Kingdom','united kingdom':'United Kingdom',
    'republic of korea':'South Korea','korea, rep.':'South Korea','south korea':'South Korea',
    'russian federation':'Russia','russia':'Russia','viet nam':'Vietnam','czechia':'Czech Republic',
    'dem. rep. congo':'Democratic Republic of the Congo','democratic republic of congo':'Democratic Republic of the Congo',
    'democratic republic of the congo':'Democratic Republic of the Congo','congo':'Republic of the Congo',
    'dominican rep.':'Dominican Republic','central african rep.':'Central African Republic',
    'bosnia and herz.':'Bosnia and Herzegovina','eq. guinea':'Equatorial Guinea','s. sudan':'South Sudan',
    'solomon is.':'Solomon Islands','w. sahara':'Western Sahara','falkland is.':'Falkland Islands',
    'fr. s. antarctic lands':'French Southern and Antarctic Lands','n. cyprus':'Northern Cyprus',
    'côte d\'ivoire':'Côte d’Ivoire','ivory coast':'Côte d’Ivoire','laos':'Laos','myanmar':'Myanmar',
    'swaziland':'Eswatini','cape verde':'Cabo Verde','macedonia':'North Macedonia',
    'brunei darussalam':'Brunei','east timor':'Timor-Leste','the bahamas':'Bahamas','the gambia':'Gambia'
  };

  const displayOverrides = {
    USA:'United States',
    'Democratic Republic of the Congo':'DR Congo',
    'Republic of the Congo':'Republic of the Congo',
    'French Southern and Antarctic Lands':'French Southern Lands'
  };

  function clean(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function canonicalCountry(value) {
    const cleaned = clean(value);
    if (!cleaned) return '';
    return aliases[cleaned.toLowerCase()] || cleaned;
  }

  function displayCountry(key, fallback = '') {
    return displayOverrides[key] || key || fallback || 'Unknown country';
  }

  function parseGoogleTable(payload) {
    if (!payload || payload.status !== 'ok' || !payload.table) {
      throw new Error(payload?.errors?.[0]?.detailed_message || 'The sheet returned an invalid response.');
    }
    const headers = payload.table.cols.map((column, index) => clean(column.label || column.id || `Column ${index + 1}`));
    return payload.table.rows.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        const cell = row.c?.[index];
        record[header] = cell ? clean(cell.f ?? cell.v ?? '') : '';
      });
      return {
        title: record.Title ?? record.A ?? '',
        author: record.Author ?? record.B ?? '',
        genre: record.Genre ?? record.C ?? '',
        gender: record.Gender ?? record.D ?? '',
        country: record.Country ?? record.E ?? ''
      };
    });
  }

  function loadSheet() {
    return new Promise((resolve, reject) => {
      const callback = `__readersAtlas_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      let settled = false;
      let timeout;
      const cleanup = () => {
        delete window[callback];
        script.remove();
        if (timeout) window.clearTimeout(timeout);
      };
      const finish = handler => value => {
        if (settled) return;
        settled = true;
        cleanup();
        handler(value);
      };
      window[callback] = finish(payload => {
        try { resolve(parseGoogleTable(payload)); }
        catch (error) { reject(error); }
      });
      script.onerror = finish(() => reject(new Error('The public reading spreadsheet could not be reached.')));
      const tqx = encodeURIComponent(`out:json;responseHandler:${callback}`);
      const query = encodeURIComponent('select A, B, C, D, E where A is not null');
      script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&headers=1&tqx=${tqx}&tq=${query}&_=${Date.now()}`;
      script.async = true;
      document.head.appendChild(script);
      timeout = window.setTimeout(finish(() => reject(new Error('The reading spreadsheet request timed out.'))), 15000);
    });
  }

  function organise(rows) {
    const byCountry = new Map();
    const validRows = rows.filter(row => clean(row.title) && clean(row.country));
    validRows.forEach(row => {
      const country = canonicalCountry(row.country);
      if (!byCountry.has(country)) byCountry.set(country, []);
      byCountry.get(country).push({
        title: clean(row.title),
        author: clean(row.author) || 'Unknown author',
        genre: clean(row.genre),
        gender: clean(row.gender)
      });
    });
    byCountry.forEach(books => books.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })));
    return { rows: validRows, byCountry, totalBooks: validRows.length, totalCountries: byCountry.size };
  }

  window.AtlasData = { REFRESH_MS, canonicalCountry, displayCountry, loadSheet, organise };
})();
