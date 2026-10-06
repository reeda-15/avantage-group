(function (win) {
  'use strict';
  const doc = win.document;
  let instance;

  function start() {
    if (instance) return instance;
    const main = doc?.querySelector('.connected-systems-main');
    if (!main) return { refresh() {}, destroy() {} };
    const owners = [], listeners = [];
    let disposed = false, frame, alignmentFrame, pendingTarget, observer, navigation, chapters;
    const listen = (target, name, handler, options) => {
      target?.addEventListener?.(name, handler, options);
      listeners.push(() => target?.removeEventListener?.(name, handler, options));
    };
    function own(name, options, adopt = false) {
      const api = win[name];
      if (!api?.create) return null;
      // The hero has already created the single scene/video controller.
      // Other standalone controllers are replaced to attach coordinator callbacks.
      if (!adopt) { api.instance?.destroy(); api.instance = null; }
      const controller = api.instance || api.create(doc, options);
      api.instance = controller; owners.push([api, controller]); return controller;
    }
    win.AvantageScroll?.start?.();
    const scenes = own('AvantageScenes', undefined, true);
    function selected(id) {
      const scene = win.AvantageScenes?.lookup(id);
      if (scene) scenes?.goTo(scene.id);
      chapters?.activate(id);
    }
    chapters = own('AvantageChapters');
    navigation = own('AvantageChapterNav', { onSelect: selected });
    own('AvantageSystemMap', { onSelect(id, chapterId) {
      // Reuse the navigation's offset, history and keyboard focus path.
      doc.querySelector('[data-chapter-nav] a[href="#' + chapterId + '"]')?.click();
    } });
    own('AvantageTransformation');
    own('AvantageCaseStudies');
    own('AvantageSystemBuilder', { onContinue(result) {
      return win.AvantageBrief?.applyRecommendation(doc, result) === true;
    } });

    function refresh() {
      if (disposed) return;
      win.ScrollTrigger?.refresh?.();
      win.AvantageScroll?.refresh?.();
      chapters?.refresh();
      correctAlignment();
    }
    function scheduleRefresh() {
      if (disposed || frame !== undefined) return;
      if (!win.requestAnimationFrame) { refresh(); return; }
      frame = win.requestAnimationFrame(() => { frame = undefined; refresh(); });
    }
    function align(target, immediate) {
      const nav = doc.querySelector('[data-chapter-nav]');
      const offset = target.id === main.id ? 0 : (nav?.getBoundingClientRect().height || 0) +
        Math.max(0, parseFloat(nav && win.getComputedStyle?.(nav)?.top) || 0) + 16;
      const top = Math.max(0, target.getBoundingClientRect().top + win.scrollY - offset);
      if (win.AvantageScroll?.scrollTo) win.AvantageScroll.scrollTo(top, { immediate });
      else win.scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' });
    }
    function cancelAlignment() {
      pendingTarget = null;
      if (alignmentFrame !== undefined) win.cancelAnimationFrame?.(alignmentFrame);
      alignmentFrame = undefined;
    }
    function correctAlignment() {
      if (disposed || !pendingTarget || win.location.hash !== pendingTarget.hash) return;
      const target = doc.getElementById(pendingTarget.id);
      if (target) align(target, true);
    }
    function scheduleAlignment() {
      if (disposed || !pendingTarget || alignmentFrame !== undefined) return;
      if (!win.requestAnimationFrame) { correctAlignment(); return; }
      // Completed external ScrollTrigger refreshes may still be followed by
      // the scroll adapter's resize listener; align after those listeners finish.
      alignmentFrame = win.requestAnimationFrame(() => { alignmentFrame = undefined; correctAlignment(); });
    }
    function hashChanged() {
      cancelAlignment();
      if (win.location.hash === '#' + main.id) {
        pendingTarget = { id: main.id, hash: win.location.hash }; scheduleAlignment();
      }
    }
    function click(event) {
      if (event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('a[href^="#"]');
      if (!link || link.hasAttribute?.('download') || link.getAttribute('target') === '_blank') return;
      let id;
      try { id = decodeURIComponent(link.getAttribute('href').slice(1)); } catch (_) { return; }
      const target = doc.getElementById(id);
      if (!target) return;
      // Component clicks stop at their own boundary. This covers skip, finale
      // and contextual links before Lenis' global anchor handler can compete.
      event.preventDefault(); event.stopPropagation();
      const immediate = id === main.id || !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      cancelAlignment(); align(target, immediate);
      if (win.location.hash !== '#' + id) win.history?.pushState(win.history.state, '', '#' + id);
      pendingTarget = { id, hash: win.location.hash };
      target.focus({ preventScroll: true }); navigation?.setActive(id); selected(id);
    }
    function sceneEntered(event) { navigation?.setActive(event.detail?.chapterId); }
    function pagehide(event) { if (event.persisted) scenes?.suspend?.(); else instance?.destroy(); }
    function pageshow(event) { if (event.persisted) scenes?.resume?.(); scheduleRefresh(); }
    function visibilityChanged() { if (doc.hidden) scenes?.suspend?.(); else scenes?.resume?.(); }
    listen(doc, 'click', click);
    listen(doc, 'load', scheduleRefresh, true);
    listen(doc, 'loadedmetadata', scheduleRefresh, true);
    listen(doc, 'avantage:scene-enter', sceneEntered);
    listen(doc, 'visibilitychange', visibilityChanged);
    listen(win, 'resize', scheduleRefresh);
    listen(win, 'pageshow', pageshow);
    listen(win, 'pagehide', pagehide);
    listen(win, 'hashchange', hashChanged);
    listen(win.ScrollTrigger, 'refresh', scheduleAlignment);
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(name => listen(win, name, cancelAlignment, { passive: true }));
    if (win.ResizeObserver) {
      observer = new win.ResizeObserver(scheduleRefresh);
      observer.observe(main);
      const nav = doc.querySelector('[data-chapter-nav]'); if (nav) observer.observe(nav);
    }
    // Font and panel changes can move anchors even when media dimensions are fixed.
    doc.fonts?.ready?.then(scheduleRefresh);
    instance = { refresh, destroy() {
      if (disposed) return;
      disposed = true;
      cancelAlignment();
      if (frame !== undefined) win.cancelAnimationFrame?.(frame);
      frame = undefined; observer?.disconnect(); listeners.forEach(remove => remove());
      owners.reverse().forEach(([api, controller]) => {
        controller.destroy(); if (api.instance === controller) api.instance = null;
      });
      win.AvantageScroll?.destroy?.(); instance = null;
    } };
    hashChanged(); scheduleRefresh(); return instance;
  }
  win.AvantageConnectedSystems = { start };
  start();
})(window);
