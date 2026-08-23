(async () => {
  try {
    const parts = window.__ATLAS_GZIP_PARTS;
    if (!Array.isArray(parts) || parts.length !== 6 || parts.some(part => typeof part !== 'string')) {
      throw new Error('The atlas package is incomplete.');
    }
    const encoded = parts.join('');
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const html = await new Response(stream).text();
    document.open();
    document.write(html);
    document.close();
  } catch (error) {
    console.error('[Reader’s World Atlas] Startup failed:', error);
    document.body.innerHTML = '<main class="boot"><b>The atlas could not be unrolled.</b><p>Please open this page in a current version of Chrome, Edge, Firefox or Safari.</p></main>';
  }
})();
