(function (global) {
  'use strict';
  const ids = ['ai-agents', 'automations', 'custom-software', 'data-insights', 'creative-ai'];
  const grammar = ['.chapter-label', 'h2', '.edition-feature', '.capability-card', '.chapter-connections', '.chapter-handoff'];

  function create(root) {
    const doc = root.ownerDocument || root;
    const win = doc.defaultView || global;
    const chapters = Array.from(root.querySelectorAll('.edition-chapter')).filter(chapter => ids.includes(chapter.id));
    const states = chapters.map(element => ({ element, content: element.querySelector('.systems-container'), visible: false, timeline: null, context: null,
      original: element.getAttribute('data-chapter-active') }));
    const media = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    let disposed = false, observer;

    function clear(state) {
      state.timeline?.kill(); state.context?.revert();
      state.timeline = null; state.context = null;
    }
    function update() {
      if (disposed) return;
      states.forEach(state => {
        if (media?.matches) { clear(state); return; }
        if (!state.visible || doc.hidden) { state.timeline?.pause(); return; }
        const gsap = win.gsap;
        if (!gsap?.context || !gsap?.timeline) return;
        if (!state.timeline) {
          state.context = gsap.context(() => {
            state.timeline = gsap.timeline({ paused: true, defaults: { duration: .65, ease: 'power2.out' } });
            grammar.forEach((selector, index) => {
              const targets = Array.from(state.content.querySelectorAll(selector));
              // Text is readable even if an animation is interrupted or a library fails.
              if (targets.length) state.timeline.fromTo(targets,
                { opacity: .7, y: index === 4 ? 0 : 18 },
                { opacity: 1, y: 0, stagger: .08, immediateRender: false }, index * .14);
            });
          }, state.content);
        }
        state.timeline.play();
      });
    }
    function activate(id) {
      if (disposed || !states.some(state => state.element.id === id)) return;
      states.forEach(state => state.element.id === id
        ? state.element.setAttribute('data-chapter-active', 'true') : state.element.removeAttribute('data-chapter-active'));
      update();
    }
    function hold(event) { activate(event.detail?.chapterId); }
    function refresh() {
      if (disposed) return;
      states.forEach(state => state.timeline?.invalidate()); update();
    }
    if (win.IntersectionObserver) {
      observer = new win.IntersectionObserver(entries => {
        if (disposed) return;
        entries.forEach(entry => {
          const state = states.find(item => item.content === entry.target);
          if (state) state.visible = entry.isIntersecting;
        });
        update();
      }, { threshold: 0 });
      // Leading cinematic media can intersect long before readable content.
      // A missing content group stays static rather than falling back to the poster.
      states.forEach(state => { if (state.content) observer.observe(state.content); });
    }
    doc.addEventListener('avantage:scene-hold', hold);
    doc.addEventListener('visibilitychange', update);
    if (media?.addEventListener) media.addEventListener('change', update);
    else media?.addListener?.(update);
    return { activate, refresh, destroy() {
      if (disposed) return;
      disposed = true; observer?.disconnect();
      doc.removeEventListener('avantage:scene-hold', hold);
      doc.removeEventListener('visibilitychange', update);
      if (media?.removeEventListener) media.removeEventListener('change', update);
      else media?.removeListener?.(update);
      states.forEach(state => {
        clear(state);
        if (state.original === null) state.element.removeAttribute('data-chapter-active');
        else state.element.setAttribute('data-chapter-active', state.original);
      });
    } };
  }
  const api = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    global.AvantageChapters = api;
    if (global.document?.querySelector('.edition-chapter')) {
      api.instance = create(global.document);
      const destroy = api.instance.destroy;
      function cleanup(event) { if (!event.persisted) api.instance.destroy(); }
      api.instance.destroy = function () { destroy(); global.removeEventListener('pagehide', cleanup); };
      global.addEventListener('pagehide', cleanup);
    }
  }
})(typeof window === 'undefined' ? {} : window);
