(() => {
  'use strict';

  const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
  const COUNTRY_META_URL = 'https://cdn.jsdelivr.net/npm/world-countries@5.1.0/countries.json';
  const EMPTY_FILL = '#d8cfad';
  const GREEN_STOPS = ['#b7c7a8', '#779579', '#3e6d52', '#0d3d29'];

  function emptyDataset() {
    return { byCountry: new Map(), totalBooks: 0, totalCountries: 0 };
  }

  async function create() {
    if (!window.d3 || !window.topojson || typeof d3.geoRobinson !== 'function') {
      throw new Error('The map libraries did not load.');
    }

    const stage = document.getElementById('map-stage');
    const svg = d3.select('#world-map');
    const viewport = svg.select('#map-viewport');
    const countriesLayer = svg.select('#countries');
    const legend = document.getElementById('legend');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const resetButton = document.getElementById('map-reset');

    const [world, countryMeta] = await Promise.all([
      d3.json(WORLD_URL),
      d3.json(COUNTRY_META_URL).catch(() => [])
    ]);
    if (!world?.objects?.countries) throw new Error('The world map data could not be read.');

    const features = topojson.feature(world, world.objects.countries).features
      .filter(feature => feature.properties?.name !== 'Antarctica');
    const flagByNumericId = new Map(
      (Array.isArray(countryMeta) ? countryMeta : [])
        .filter(country => country.ccn3 && country.flag)
        .map(country => [String(country.ccn3).padStart(3, '0'), country.flag])
    );

    const projection = d3.geoRobinson();
    const path = d3.geoPath(projection);
    const graticule = d3.geoGraticule10();
    let dataset = emptyDataset();
    let width = 0;
    let height = 0;
    let pinned = false;
    let activeElement = null;

    function countryKey(feature) {
      return AtlasData.canonicalCountry(feature.properties?.name || '');
    }

    function booksFor(feature) {
      return dataset.byCountry.get(countryKey(feature)) || [];
    }

    function flagFor(feature) {
      return flagByNumericId.get(String(feature.id ?? '').padStart(3, '0')) || '🏳️';
    }

    function detailsFor(feature) {
      const key = countryKey(feature);
      return {
        name: AtlasData.displayCountry(key, feature.properties?.name),
        flag: flagFor(feature),
        books: booksFor(feature)
      };
    }

    function adaptiveColour(count, maxCount) {
      if (!count) return EMPTY_FILL;
      const fraction = maxCount <= 1 ? 0.6 : Math.log1p(count) / Math.log1p(maxCount);
      const scale = d3.scaleLinear().domain([0, 0.34, 0.67, 1]).range(GREEN_STOPS).clamp(true);
      return scale(0.1 + fraction * 0.9);
    }

    function maximumCount() {
      return Math.max(0, ...features.map(feature => booksFor(feature).length));
    }

    function updateLegend(maxCount) {
      legend.replaceChildren();
      const title = document.createElement('span');
      title.className = 'legend-title';
      title.textContent = 'Books read';
      legend.appendChild(title);

      const values = maxCount > 0
        ? [0, 1, ...[0.33, 0.66, 1].map(fraction => Math.max(1, Math.round(Math.expm1(Math.log1p(maxCount) * fraction))))]
        : [0];
      [...new Set(values)].sort((a, b) => a - b).forEach(value => {
        const item = document.createElement('span');
        item.className = 'legend-item';
        const swatch = document.createElement('i');
        swatch.className = 'legend-swatch';
        swatch.style.background = adaptiveColour(value, maxCount);
        const label = document.createElement('span');
        label.textContent = String(value);
        item.append(swatch, label);
        legend.appendChild(item);
      });
    }

    function clearActive() {
      if (activeElement) d3.select(activeElement).classed('is-active', false);
      activeElement = null;
      countriesLayer.selectAll('.country').classed('is-muted', false);
    }

    function setActive(element) {
      clearActive();
      activeElement = element;
      d3.select(element).classed('is-active', true);
      countriesLayer.selectAll('.country').classed('is-muted', function () { return this !== element; });
    }

    function pointerInStage(event) {
      return event?.clientX == null ? [width / 2, height / 2] : d3.pointer(event, stage);
    }

    function showCountry(element, event, feature, shouldPin = false) {
      if (shouldPin || AtlasPanels.isMobile()) pinned = true;
      setActive(element);
      AtlasPanels.show(detailsFor(feature), pointerInStage(event));
    }

    AtlasPanels.configure({
      onClose: () => {
        pinned = false;
        clearActive();
      }
    });

    const countryPaths = countriesLayer.selectAll('path')
      .data(features, feature => feature.id)
      .join('path')
      .attr('class', 'country')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .on('mouseenter', function (event, feature) {
        if (!pinned && !AtlasPanels.isMobile()) showCountry(this, event, feature);
      })
      .on('mousemove', function (event) {
        if (!pinned && !AtlasPanels.isMobile()) AtlasPanels.move(pointerInStage(event));
      })
      .on('mouseleave', function () {
        if (!pinned && !AtlasPanels.isMobile()) {
          AtlasPanels.hideDesktop();
          clearActive();
        }
      })
      .on('click', function (event, feature) {
        event.stopPropagation();
        pinned = true;
        showCountry(this, event, feature, true);
      })
      .on('focus', function (event, feature) {
        if (!pinned) showCountry(this, event, feature);
      })
      .on('blur', function () {
        if (!pinned) {
          AtlasPanels.hideDesktop();
          clearActive();
        }
      })
      .on('keydown', function (event, feature) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          pinned = true;
          showCountry(this, event, feature, true);
        }
      });

    svg.on('click', event => {
      if (event.target === svg.node() || event.target.id === 'sphere' || event.target.id === 'ocean-pattern') {
        pinned = false;
        AtlasPanels.closeAll(false);
        clearActive();
      }
    });

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .filter(event => !event.ctrlKey || event.type === 'wheel')
      .on('zoom', event => viewport.attr('transform', event.transform));
    svg.call(zoom).on('dblclick.zoom', null);

    function reset(animate = true) {
      pinned = false;
      AtlasPanels.closeAll(false);
      clearActive();
      const target = animate ? svg.transition().duration(520) : svg;
      target.call(zoom.transform, d3.zoomIdentity);
    }

    zoomIn.addEventListener('click', () => svg.transition().duration(220).call(zoom.scaleBy, 1.5));
    zoomOut.addEventListener('click', () => svg.transition().duration(220).call(zoom.scaleBy, 1 / 1.5));
    resetButton.addEventListener('click', () => reset());

    function resize() {
      const rect = stage.getBoundingClientRect();
      width = Math.max(320, Math.round(rect.width));
      height = Math.max(430, Math.round(rect.height));
      svg.attr('viewBox', `0 0 ${width} ${height}`);
      projection.fitExtent([[18, 18], [width - 18, height - 18]], { type: 'Sphere' });
      svg.select('#sphere').attr('d', path({ type: 'Sphere' }));
      svg.select('#ocean-pattern').attr('d', path({ type: 'Sphere' }));
      svg.select('#graticule').attr('d', path(graticule));
      countryPaths.attr('d', path);
      zoom.extent([[0, 0], [width, height]]).translateExtent([[-width * 0.65, -height * 0.65], [width * 1.65, height * 1.65]]);
    }

    function setData(nextDataset) {
      dataset = nextDataset || emptyDataset();
      const maxCount = maximumCount();
      countryPaths
        .attr('fill', feature => adaptiveColour(booksFor(feature).length, maxCount))
        .attr('aria-label', feature => {
          const count = booksFor(feature).length;
          return `${detailsFor(feature).name}: ${count} ${count === 1 ? 'book' : 'books'}`;
        });
      updateLegend(maxCount);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();
    setData(dataset);

    return { setData, reset, destroy: () => observer.disconnect() };
  }

  window.AtlasMap = { create };
})();
