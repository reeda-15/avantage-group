(function (global) {
  'use strict';
  const ids = ['system-overview', 'ai-agents', 'automations', 'custom-software', 'data-insights', 'creative-ai', 'our-work'];

  function create(root, options = {}) {
    const doc = root.ownerDocument || root;
    const win = doc.defaultView || global;
    const nav = root.querySelector('[data-chapter-nav]');
    if (!nav) return { setActive() {}, destroy() {} };
    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const targets = new Map(ids.map(id => [id, doc.getElementById(id)]).filter(([, target]) => target));
    const original = new Map(links.map(link => [link, link.getAttribute('aria-current')]));
    const visible = new Set();
    const heroVideo = doc.getElementById('journey');
    const scrollTrigger = win.ScrollTrigger;
    let disposed = false, observer, initialPending = false, restorationHash, restorationId, selectionId, alignmentFrame;
    const offset = () => Number.isFinite(options.offset) ? Math.max(0, options.offset)
      : nav.getBoundingClientRect().height + Math.max(0, parseFloat(win.getComputedStyle?.(nav).top) || 0) + 16;

    function setActive(id) {
      if (disposed || !targets.has(id)) return;
      links.forEach(link => {
        if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function align(target, immediate) {
      const top = Math.max(0, target.getBoundingClientRect().top + win.scrollY - offset());
      const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (win.AvantageScroll?.scrollTo) win.AvantageScroll.scrollTo(top, { immediate: immediate || !!reduced });
      else win.scrollTo({ top, behavior: immediate || reduced ? 'instant' : 'smooth' });
    }
    function select(id, immediate = false, history = false) {
      const target = targets.get(id);
      if (disposed || !target) return;
      selectionId = id;
      align(target, immediate);
      if (history && win.location.hash !== '#' + id) win.history.pushState(null, '', '#' + id);
      setActive(id);
      target.focus({ preventScroll: true });
      // Optional scene work must never prevent a completed chapter selection.
      try { options.onSelect?.(id); } catch (_) { /* The semantic chapter remains available. */ }
    }
    function restoreHash() {
      cancelInitialRestore();
      let id;
      try { id = decodeURIComponent(win.location.hash.slice(1)); } catch (_) { return; }
      if (!targets.has(id)) return;
      restorationHash = win.location.hash; restorationId = id; initialPending = true;
      select(id, true);
      scheduleInitialAlignment();
    }
    function cancelInitialRestore() {
      initialPending = false; selectionId = undefined;
      if (alignmentFrame !== undefined) win.cancelAnimationFrame?.(alignmentFrame);
      alignmentFrame = undefined;
    }
    function correctInitialLayout() {
      if (disposed || !initialPending || win.location.hash !== restorationHash) return;
      const target = targets.get(restorationId);
      if (target) { align(target, true); setActive(restorationId); }
    }
    function scheduleInitialAlignment() {
      if (disposed || !initialPending || alignmentFrame !== undefined || !win.requestAnimationFrame) return;
      alignmentFrame = win.requestAnimationFrame(() => {
        alignmentFrame = undefined; correctInitialLayout();
      });
    }
    function restoreInitialLayout() {
      correctInitialLayout(); scheduleInitialAlignment();
    }
    function refreshed() {
      // Smooth-scroll registers its Lenis resize listener first. The next frame
      // sees both the completed pin layout and the updated scroll dimensions.
      scheduleInitialAlignment();
    }
    function click(event) {
      if (event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('a[href^="#"]');
      if (!links.includes(link)) return;
      const id = link.getAttribute('href').slice(1);
      if (!targets.has(id)) return;
      // Lenis' global anchors handler does not check defaultPrevented.
      event.preventDefault(); event.stopPropagation(); cancelInitialRestore(); select(id, false, true);
    }
    function observe() {
      observer?.disconnect(); visible.clear();
      if (!win.IntersectionObserver || disposed) return;
      observer = new win.IntersectionObserver(entries => {
        if (disposed) return;
        entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
        // Observer entries can describe the viewport before a hash correction or
        // smooth selection. Retain its chosen chapter until fresh user input.
        if (selectionId) return;
        const ordered = Array.from(visible).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
        const passed = ordered.filter(target => target.getBoundingClientRect().top <= offset() + 1);
        const current = passed.at(-1) || ordered[0];
        if (current) setActive(current.id);
      }, { rootMargin: `-${offset()}px 0px -${Math.round((win.innerHeight || 900) * .6)}px 0px`, threshold: 0 });
      targets.forEach(target => observer.observe(target));
    }
    nav.addEventListener('click', click);
    win.addEventListener('hashchange', restoreHash);
    win.addEventListener('resize', observe);
    win.addEventListener('load', restoreInitialLayout);
    heroVideo?.addEventListener('loadedmetadata', restoreInitialLayout);
    scrollTrigger?.addEventListener?.('refresh', refreshed);
    const inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    inputs.forEach(name => win.addEventListener(name, cancelInitialRestore, { passive: true }));
    setActive(ids[0]); observe(); restoreHash();
    return { setActive, destroy() {
      if (disposed) return;
      disposed = true; cancelInitialRestore(); observer?.disconnect(); visible.clear();
      nav.removeEventListener('click', click);
      win.removeEventListener('hashchange', restoreHash);
      win.removeEventListener('resize', observe);
      win.removeEventListener('load', restoreInitialLayout);
      heroVideo?.removeEventListener('loadedmetadata', restoreInitialLayout);
      scrollTrigger?.removeEventListener?.('refresh', refreshed);
      inputs.forEach(name => win.removeEventListener(name, cancelInitialRestore));
      original.forEach((value, link) => value === null ? link.removeAttribute('aria-current') : link.setAttribute('aria-current', value));
    } };
  }

  const api = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    global.AvantageChapterNav = api;
    // The later coordinator can destroy this standalone enhancement before taking ownership.
    if (global.document?.querySelector('[data-chapter-nav]')) {
      api.instance = create(global.document, { onSelect(id) {
        global.document.dispatchEvent(new global.CustomEvent('avantage:chapter-select', { detail: { id } }));
      } });
      global.addEventListener('pagehide', function cleanup(event) {
        if (event.persisted) return;
        api.instance.destroy(); global.removeEventListener('pagehide', cleanup);
      });
    }
  }
})(typeof window === 'undefined' ? {} : window);
