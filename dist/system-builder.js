(function (global) {
  'use strict';
  // Business needs and suggested components have a fixed editorial order.
  const problems = [
    ['manual-work', 'Too much manual work', ['Workflow Automation']],
    ['disconnected-tools', 'Disconnected tools', ['CRM Automation', 'Analytics Dashboard']],
    ['slow-support', 'Slow customer support', ['AI Agent', 'CRM Automation']],
    ['poor-reporting', 'Poor reporting', ['Analytics Dashboard']],
    ['custom-software', 'Need custom software', ['Custom Software']],
    ['content-workflow', 'Need an AI content workflow', ['Workflow Automation', 'AI Content Workflow']]
  ];
  const order = ['AI Agent', 'Workflow Automation', 'CRM Automation', 'Custom Software', 'Analytics Dashboard', 'AI Content Workflow'];

  function recommend(problemIds) {
    const ids = new Set(Array.isArray(problemIds) ? problemIds : []);
    const selected = problems.filter(([id]) => ids.has(id));
    const needed = new Set(selected.flatMap(([, , components]) => components));
    const components = order.filter(component => needed.has(component));
    if (!components.length) return { title: 'Choose where to start.', components, summary: 'Select one or more problems to see a suggested system.' };
    const title = components.join(' + ');
    return { title, components, summary: 'Needs: ' + selected.map(([, label]) => label).join('; ') + '. Suggested system: ' + title + '.' };
  }

  function create(root, options = {}) {
    const component = root?.matches?.('[data-system-builder]') ? root : root?.querySelector?.('[data-system-builder]');
    const fieldset = component?.querySelector('[data-builder-problems]');
    const title = component?.querySelector('[data-builder-title]');
    const summary = component?.querySelector('[data-builder-summary]');
    const list = component?.querySelector('[data-builder-components]');
    const resetButton = component?.querySelector('[data-builder-reset]');
    const next = component?.querySelector('[data-builder-continue]');
    if (!component || !fieldset || !title || !summary || !list || !resetButton || !next) return { reset() {}, destroy() {} };
    const checks = Array.from(component.querySelectorAll('[data-builder-problems] input[type="checkbox"]'));
    const doc = component.ownerDocument || root;
    const win = doc.defaultView || global;
    const original = { disabled: fieldset.disabled, resetHidden: resetButton.hidden, title: title.textContent, summary: summary.textContent,
      children: Array.from(list.childNodes), ariaDisabled: next.getAttribute('aria-disabled'), checked: checks.map(input => input.checked) };
    let disposed = false, result;

    function render() {
      if (disposed) return;
      result = recommend(checks.filter(input => input.checked).map(input => input.value));
      title.textContent = result.title;
      summary.textContent = result.summary;
      list.replaceChildren(...result.components.map(component => { const item = doc.createElement('li'); item.textContent = component; return item; }));
      next.setAttribute('aria-disabled', String(!result.components.length));
    }
    function reset() {
      if (disposed) return;
      checks.forEach(input => { input.checked = false; });
      render();
    }
    function continueToBrief(event) {
      if (disposed || event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      // Contain the link so global Lenis anchors cannot issue a second scroll.
      event.preventDefault(); event.stopPropagation();
      if (!result.components.length) return;
      const confirmation = { ...result, components: result.components.slice() };
      const accepted = options.onContinue ? options.onContinue(confirmation) : win.AvantageBrief?.applyRecommendation(doc, confirmation);
      if (accepted === false) {
        summary.textContent = result.summary + ' Your brief message is full. Make room for this summary, then continue again.';
        return;
      }
      const brief = doc.getElementById?.('brief');
      if (!brief) return;
      const nav = doc.querySelector('[data-chapter-nav]');
      const offset = nav ? nav.getBoundingClientRect().height + Math.max(0, parseFloat(win.getComputedStyle?.(nav).top) || 0) + 16 : 16;
      const top = Math.max(0, brief.getBoundingClientRect().top + (win.scrollY || 0) - offset);
      if (win.AvantageScroll?.scrollTo) win.AvantageScroll.scrollTo(top, { immediate: true });
      else if (win.scrollTo) win.scrollTo({ top, behavior: 'instant' });
      else brief.scrollIntoView?.({ behavior: 'instant', block: 'start' });
      brief.focus?.({ preventScroll: true });
      if (win.location && win.location.hash !== '#brief') win.history?.pushState?.(win.history.state, '', '#brief');
    }
    fieldset.disabled = false; resetButton.hidden = false;
    checks.forEach(input => input.addEventListener('change', render));
    resetButton.addEventListener('click', reset);
    next.addEventListener('click', continueToBrief);
    render();
    return { reset, destroy() {
      if (disposed) return;
      disposed = true;
      checks.forEach((input, index) => { input.removeEventListener('change', render); input.checked = original.checked[index]; });
      resetButton.removeEventListener('click', reset); next.removeEventListener('click', continueToBrief);
      fieldset.disabled = original.disabled; resetButton.hidden = original.resetHidden;
      title.textContent = original.title; summary.textContent = original.summary; list.replaceChildren(...original.children);
      if (original.ariaDisabled === null) next.removeAttribute('aria-disabled'); else next.setAttribute('aria-disabled', original.ariaDisabled);
    } };
  }

  const api = { recommend, create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    global.AvantageSystemBuilder = api;
    if (global.document?.querySelector('[data-system-builder]')) {
      api.instance = create(global.document);
      const destroy = api.instance.destroy;
      function cleanup(event) { if (!event.persisted) api.instance.destroy(); }
      api.instance.destroy = function () { destroy(); global.removeEventListener('pagehide', cleanup); };
      global.addEventListener('pagehide', cleanup);
    }
  }
})(typeof window === 'undefined' ? {} : window);
