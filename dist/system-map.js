(function (global) {
  'use strict';
  const chapters = new Map([
    ['think', 'ai-agents'], ['connect', 'automations'], ['automate', 'automations'],
    ['build', 'custom-software'], ['understand', 'data-insights'], ['create', 'creative-ai']
  ]);

  function create(root, options = {}) {
    const map = root.matches?.('[data-system-map]') ? root : root.querySelector('[data-system-map]');
    if (!map) return { select() {}, destroy() {} };
    const doc = map.ownerDocument || root.ownerDocument || root;
    const win = doc.defaultView || global;
    const nodes = Array.from(map.querySelectorAll('[data-system-node]'));
    const paths = Array.from(map.querySelectorAll('[data-system-path]'));
    const original = nodes.map(node => [node, 'aria-current', node.getAttribute('aria-current')])
      .concat(paths.map(path => [path, 'data-selected', path.getAttribute('data-selected')]),
        [[map, 'data-signal-motion', map.getAttribute('data-signal-motion')]]);
    const media = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    let disposed = false, visible = false, observer;

    function updateMotion() {
      if (disposed) return;
      if (visible && !doc.hidden && !media?.matches) map.setAttribute('data-signal-motion', 'true');
      else map.removeAttribute('data-signal-motion');
    }
    function mark(id) {
      nodes.forEach(node => node.getAttribute('data-system-node') === id
        ? node.setAttribute('aria-current', 'true') : node.removeAttribute('aria-current'));
      paths.forEach(path => path.getAttribute('data-system-path') === id
        ? path.setAttribute('data-selected', 'true') : path.removeAttribute('data-selected'));
    }
    function select(id) {
      if (disposed || !chapters.has(id) || !nodes.some(node => node.getAttribute('data-system-node') === id)) return;
      mark(id);
      options.onSelect?.(id, chapters.get(id));
    }
    function click(event) {
      if (disposed || event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const node = event.target.closest?.('[data-system-node]');
      if (!nodes.includes(node)) return;
      const id = node.getAttribute('data-system-node');
      if (!chapters.has(id)) return;
      // The callback owns chapter navigation. Without it, keep the native anchor.
      if (typeof options.onSelect === 'function') { event.preventDefault(); event.stopPropagation(); }
      select(id);
    }
    map.addEventListener('click', click);
    doc.addEventListener('visibilitychange', updateMotion);
    if (media?.addEventListener) media.addEventListener('change', updateMotion);
    else media?.addListener?.(updateMotion);
    if (win.IntersectionObserver) {
      observer = new win.IntersectionObserver(entries => {
        if (disposed) return;
        entries.forEach(entry => { if (entry.target === map) visible = entry.isIntersecting; });
        updateMotion();
      }, { threshold: 0 });
      observer.observe(map);
    }
    const initial = nodes.find(node => node.getAttribute('aria-current') !== null)?.getAttribute('data-system-node');
    mark(chapters.has(initial) ? initial : 'think'); updateMotion();
    return { select, destroy() {
      if (disposed) return;
      disposed = true; observer?.disconnect();
      map.removeEventListener('click', click); doc.removeEventListener('visibilitychange', updateMotion);
      if (media?.removeEventListener) media.removeEventListener('change', updateMotion);
      else media?.removeListener?.(updateMotion);
      original.forEach(([element, name, value]) => value === null
        ? element.removeAttribute(name) : element.setAttribute(name, value));
    } };
  }

  const api = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    global.AvantageSystemMap = api;
    const doc = global.document;
    if (doc?.querySelector('[data-system-map]')) {
      const options = doc.querySelector('[data-chapter-nav]') ? { onSelect(id, chapterId) {
        // Reuse the chapter controller's anchor path for hash, offset and focus.
        doc.querySelector('[data-chapter-nav] a[href="#' + chapterId + '"]')?.click();
        doc.dispatchEvent(new global.CustomEvent('avantage:system-select', { detail: { id, chapterId } }));
      } } : {};
      api.instance = create(doc, options);
      const destroy = api.instance.destroy;
      function cleanup(event) {
        if (event.persisted) return;
        api.instance.destroy();
      }
      api.instance.destroy = function () {
        destroy(); global.removeEventListener('pagehide', cleanup);
      };
      global.addEventListener('pagehide', cleanup);
    }
  }
})(typeof window === 'undefined' ? {} : window);
