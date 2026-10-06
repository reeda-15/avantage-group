(function (global) {
  'use strict';
  const property = '--transformation-progress';

  function create(root) {
    const component = root.matches?.('[data-transformation]') ? root : root.querySelector('[data-transformation]');
    const range = component?.querySelector('[data-transformation-range]');
    const controls = component?.querySelector('[data-transformation-controls]');
    if (!component || !range || !controls) return { setProgress() {}, destroy() {} };
    const doc = component.ownerDocument || root;
    const win = doc.defaultView || global;
    const media = win.matchMedia?.('(max-width: 700px), (prefers-reduced-motion: reduce)');
    const original = {
      progress: component.style.getPropertyValue(property), priority: component.style.getPropertyPriority(property),
      enhanced: component.getAttribute('data-transformation-enhanced'), hidden: controls.hidden,
      value: range.value, description: range.getAttribute('aria-valuetext')
    };
    const scroll = component.getAttribute('data-transformation-scroll') !== null;
    let disposed = false, manual = false, frame = null;

    function setProgress(value) {
      if (disposed) return;
      const number = Number(value);
      if (Number.isNaN(number)) return;
      const progress = Math.max(0, Math.min(1, number));
      component.style.setProperty(property, String(progress));
      range.value = String(progress * 100);
      range.setAttribute('aria-valuetext', Math.round(progress * 100) + '% connected view. Both before and after are listed below.');
    }
    function cancelFrame() {
      if (frame !== null) win.cancelAnimationFrame?.(frame);
      frame = null;
    }
    function updateScroll() {
      frame = null;
      if (disposed || media?.matches || manual) return;
      const bounds = component.getBoundingClientRect();
      const height = win.innerHeight;
      // Normal document scrolling: top at 80% to bottom at 50% of viewport.
      if (height > 0 && bounds.height > 0) setProgress((height * .8 - bounds.top) / (bounds.height + height * .3));
    }
    function scheduleScroll() {
      if (disposed || !scroll || manual || media?.matches || frame !== null || !win.requestAnimationFrame) return;
      frame = win.requestAnimationFrame(updateScroll);
    }
    function updateMode() {
      if (disposed) return;
      controls.hidden = Boolean(media?.matches);
      if (media?.matches) { component.removeAttribute('data-transformation-enhanced'); cancelFrame(); }
      else { component.setAttribute('data-transformation-enhanced', 'true'); scheduleScroll(); }
    }
    function input() {
      if (disposed) return;
      manual = true; cancelFrame(); setProgress(Number(range.value) / 100);
    }
    function keydown(event) {
      if (disposed || event.altKey || event.ctrlKey || event.metaKey) return;
      const value = Number(range.value);
      const keys = { ArrowRight: value + 1, ArrowUp: value + 1, ArrowLeft: value - 1, ArrowDown: value - 1,
        PageUp: value + 10, PageDown: value - 10, Home: 0, End: 100 };
      if (!Object.prototype.hasOwnProperty.call(keys, event.key)) return;
      event.preventDefault(); manual = true; cancelFrame(); setProgress(keys[event.key] / 100);
    }
    range.addEventListener('input', input);
    range.addEventListener('keydown', keydown);
    if (scroll) { win.addEventListener('scroll', scheduleScroll, { passive: true }); win.addEventListener('resize', scheduleScroll, { passive: true }); }
    if (media?.addEventListener) media.addEventListener('change', updateMode);
    else media?.addListener?.(updateMode);
    setProgress(Number(range.value) / 100); updateMode();
    return { setProgress, destroy() {
      if (disposed) return;
      disposed = true; cancelFrame();
      range.removeEventListener('input', input); range.removeEventListener('keydown', keydown);
      if (scroll) { win.removeEventListener('scroll', scheduleScroll); win.removeEventListener('resize', scheduleScroll); }
      if (media?.removeEventListener) media.removeEventListener('change', updateMode);
      else media?.removeListener?.(updateMode);
      if (original.progress) component.style.setProperty(property, original.progress, original.priority);
      else component.style.removeProperty(property);
      if (original.enhanced === null) component.removeAttribute('data-transformation-enhanced');
      else component.setAttribute('data-transformation-enhanced', original.enhanced);
      controls.hidden = original.hidden; range.value = original.value;
      if (original.description === null) range.removeAttribute('aria-valuetext');
      else range.setAttribute('aria-valuetext', original.description);
    } };
  }
  const api = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    global.AvantageTransformation = api;
    if (global.document?.querySelector('[data-transformation]')) {
      api.instance = create(global.document);
      const destroy = api.instance.destroy;
      function cleanup(event) { if (!event.persisted) api.instance.destroy(); }
      api.instance.destroy = function () { destroy(); global.removeEventListener('pagehide', cleanup); };
      global.addEventListener('pagehide', cleanup);
    }
  }
})(typeof window === 'undefined' ? {} : window);
