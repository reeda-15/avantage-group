(function (global) {
  'use strict';

  function create(root) {
    const doc = root.ownerDocument || root;
    const win = doc.defaultView || global;
    const component = root.matches?.('[data-case-studies]') ? root : root.querySelector('[data-case-studies]');
    if (!component) return { open() {}, close() {}, destroy() {} };
    const triggers = Array.from(component.querySelectorAll('[data-case-open]'));
    const panels = Array.from(component.querySelectorAll('[data-case-panel]'));
    const records = new Map(panels.map(panel => [panel.getAttribute('data-case-panel'), panel]));
    const originals = triggers.map(trigger => ({ trigger, expanded: trigger.getAttribute('aria-expanded'), controls: trigger.getAttribute('aria-controls') }));
    const visibility = panels.map(panel => panel.hidden);
    const enhanced = component.getAttribute('data-cases-enhanced');
    let disposed = false, active, opener, returnHash = '#our-work';

    function hashId() {
      try {
        const hash = decodeURIComponent(win.location?.hash?.slice(1) || '');
        return panels.find(panel => panel.id === hash)?.getAttribute('data-case-panel');
      } catch (_) { return undefined; }
    }
    function writeHash(hash, replace) {
      const history = win.history;
      const method = replace ? 'replaceState' : 'pushState';
      if (!history?.[method] || win.location?.hash === hash) return;
      try { history[method](history.state, '', (win.location.pathname || '') + (win.location.search || '') + hash); }
      catch (_) { /* A restricted History API must not block reading the story. */ }
    }
    function display(id) {
      active = id;
      panels.forEach(panel => { panel.hidden = panel !== records.get(id); });
      triggers.forEach(trigger => trigger.setAttribute('aria-expanded', String(trigger.getAttribute('data-case-open') === id)));
    }
    function alignAndFocus(element) {
      if (!element) return;
      if (element.getBoundingClientRect) {
        const nav = doc.querySelector?.('[data-chapter-nav]');
        const offset = nav ? nav.getBoundingClientRect().height + Math.max(0, parseFloat(win.getComputedStyle?.(nav)?.top) || 0) + 16
          : Math.max(0, parseFloat(win.getComputedStyle?.(element)?.scrollMarginTop) || 0);
        const top = Math.max(0, element.getBoundingClientRect().top + (win.scrollY || 0) - offset);
        // An immediate adapter jump also cancels Lenis' previous momentum target.
        // Use a numeric position because the bridge's native fallback expects it.
        if (win.AvantageScroll?.scrollTo) win.AvantageScroll.scrollTo(top, { immediate: true });
        else if (win.scrollTo) win.scrollTo({ top, behavior: 'instant' });
        else element.scrollIntoView?.({ block: 'start', behavior: 'instant' });
      } else element.scrollIntoView?.({ block: 'start', behavior: 'instant' });
      element.focus({ preventScroll: true });
    }
    function show(id, source, history) {
      if (disposed || !records.has(id)) return;
      if (active === id) return;
      if (history && !hashId()) returnHash = win.location?.hash || '';
      opener = source || triggers.find(trigger => trigger.getAttribute('data-case-open') === id);
      display(id);
      if (history) writeHash('#' + records.get(id).id, false);
      alignAndFocus(records.get(id));
    }
    function open(id) { show(id, null, true); }
    function close() {
      if (disposed || !active) return;
      const id = active;
      display(undefined);
      // Close never erases a hash written by another page component.
      if (hashId() === id) writeHash(returnHash, true);
      alignAndFocus(opener); opener = undefined;
    }
    function restore() {
      if (disposed) return;
      const id = hashId();
      if (id) { show(id, null, false); return; }
      const focusedInside = active && records.get(active).contains(doc.activeElement);
      display(undefined);
      if (focusedInside) opener?.focus({ preventScroll: true });
      opener = undefined;
      returnHash = win.location?.hash || '';
    }
    function activate(trigger) {
      const id = trigger.getAttribute('data-case-open');
      if (active === id) close();
      else show(id, trigger, true);
    }
    function click(event) {
      if (disposed || event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const trigger = event.target.closest?.('[data-case-open]');
      if (triggers.includes(trigger) && records.has(trigger.getAttribute('data-case-open'))) {
        // The existing global smooth-scroll anchor handler ignores defaultPrevented.
        event.preventDefault(); event.stopPropagation(); activate(trigger); return;
      }
      const closer = event.target.closest?.('[data-case-close]');
      if (closer && active && records.get(active).contains(closer)) {
        event.preventDefault(); event.stopPropagation(); close();
      }
    }
    function keydown(event) {
      if (disposed || event.defaultPrevented) return;
      if (event.key === 'Escape' && active) { event.preventDefault(); event.stopPropagation(); close(); return; }
      const trigger = event.target.closest?.('[data-case-open]');
      if (event.key === ' ' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey
        && triggers.includes(trigger) && records.has(trigger.getAttribute('data-case-open'))) {
        event.preventDefault(); event.stopPropagation(); activate(trigger);
      }
    }

    component.setAttribute('data-cases-enhanced', 'true');
    triggers.forEach(trigger => {
      const panel = records.get(trigger.getAttribute('data-case-open'));
      if (panel) trigger.setAttribute('aria-controls', panel.id);
    });
    display(undefined);
    component.addEventListener('click', click);
    component.addEventListener('keydown', keydown);
    win.addEventListener?.('hashchange', restore);
    win.addEventListener?.('popstate', restore);
    restore();
    return { open, close, destroy() {
      if (disposed) return;
      disposed = true;
      component.removeEventListener('click', click);
      component.removeEventListener('keydown', keydown);
      win.removeEventListener?.('hashchange', restore);
      win.removeEventListener?.('popstate', restore);
      panels.forEach((panel, index) => { panel.hidden = visibility[index]; });
      originals.forEach(({ trigger, expanded, controls }) => {
        if (expanded === null) trigger.removeAttribute('aria-expanded'); else trigger.setAttribute('aria-expanded', expanded);
        if (controls === null) trigger.removeAttribute('aria-controls'); else trigger.setAttribute('aria-controls', controls);
      });
      if (enhanced === null) component.removeAttribute('data-cases-enhanced'); else component.setAttribute('data-cases-enhanced', enhanced);
      active = opener = undefined;
    } };
  }

  const api = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    global.AvantageCaseStudies = api;
    if (global.document?.querySelector('[data-case-studies]')) {
      api.instance = create(global.document);
      const destroy = api.instance.destroy;
      function cleanup(event) { if (!event.persisted) api.instance.destroy(); }
      api.instance.destroy = function () { destroy(); global.removeEventListener('pagehide', cleanup); };
      global.addEventListener('pagehide', cleanup);
    }
  }
})(typeof window === 'undefined' ? {} : window);
