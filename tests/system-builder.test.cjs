const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = name => fs.readFileSync('dist/' + name, 'utf8');
const builder = () => require('../dist/system-builder.js');
const problems = ['manual-work', 'disconnected-tools', 'slow-support', 'poor-reporting', 'custom-software', 'content-workflow'];
const combinations = [
  ['Workflow Automation'], ['CRM Automation', 'Analytics Dashboard'], ['AI Agent', 'CRM Automation'],
  ['Analytics Dashboard'], ['Custom Software'], ['Workflow Automation', 'AI Content Workflow']
];

// These literal outcomes catch missing/wrong mappings and order dependent results.
test('each problem produces its predefined system combination', () => {
  problems.forEach((id, index) => {
    const result = builder().recommend([id]);
    assert.deepEqual(result.components, combinations[index]);
    assert.equal(result.title, combinations[index].join(' + '));
    assert.match(result.summary, /Needs: .+\. Suggested system: .+\./);
  });
});
test('combined systems de-duplicate components in a stable order and never mutate inputs', () => {
  const input = Object.freeze(['content-workflow', 'slow-support', 'manual-work', 'disconnected-tools', 'custom-software', 'poor-reporting', 'slow-support']);
  const result = builder().recommend(input);
  assert.deepEqual(result.components, ['AI Agent', 'Workflow Automation', 'CRM Automation', 'Custom Software', 'Analytics Dashboard', 'AI Content Workflow']);
  assert.deepEqual(builder().recommend([...input].reverse()), result);
  result.components.push('tampered');
  assert.deepEqual(builder().recommend(['slow-support']).components, ['AI Agent', 'CRM Automation']);
});
test('empty, malformed, repeated and unknown inputs are harmless deterministic values', () => {
  const empty = { title: 'Choose where to start.', components: [], summary: 'Select one or more problems to see a suggested system.' };
  for (const input of [undefined, null, [], 'manual-work', {}, ['unknown', '__proto__', 'constructor', '<img src=x onerror=alert(1)>', null, 42]]) assert.deepEqual(builder().recommend(input), empty);
  assert.deepEqual(builder().recommend(['manual-work', 'manual-work', 'unknown']), builder().recommend(['manual-work']));
});

class Element extends EventTarget {
  constructor(text = '') { super(); this.attrs = new Map(); this.checked = false; this.disabled = false; this.hidden = false; this.value = ''; this.children = []; this.textContent = text; this.listeners = new Set(); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  removeAttribute(name) { this.attrs.delete(name); }
  get childNodes() { return this.children; }
  replaceChildren(...children) { this.children = children; this.textContent = children.map(child => child.textContent).join(''); }
  set innerHTML(value) { throw new Error('unsafe HTML rendering: ' + value); }
  addEventListener(type, fn, options) { this.listeners.add(fn); super.addEventListener(type, fn, options); }
  removeEventListener(type, fn, options) { this.listeners.delete(fn); super.removeEventListener(type, fn, options); }
  focus(options) { this.focusOptions = options; this.ownerDocument.activeElement = this; }
}
function fixture() {
  const component = new Element(), fieldset = new Element(), title = new Element('Your system starts with your needs.'), summary = new Element('Static explanation'), list = new Element(), reset = new Element(), next = new Element();
  fieldset.disabled = true; reset.hidden = true; next.setAttribute('href', '#brief');
  const checks = problems.map(id => { const input = new Element(); input.value = id; return input; });
  const nodes = { '[data-builder-problems]': fieldset, '[data-builder-title]': title, '[data-builder-summary]': summary, '[data-builder-components]': list, '[data-builder-reset]': reset, '[data-builder-continue]': next };
  component.matches = selector => selector === '[data-system-builder]'; component.querySelector = selector => nodes[selector] || null;
  component.querySelectorAll = () => checks;
  const doc = new EventTarget(), win = new Element(); doc.defaultView = win; win.document = doc; doc.createElement = () => new Element(); doc.querySelector = selector => selector === '[data-system-builder]' ? component : null;
  const brief = new Element(); brief.getBoundingClientRect = () => ({ top: 950 }); doc.getElementById = id => id === 'brief' ? brief : null;
  const nav = new Element(); nav.getBoundingClientRect = () => ({ height: 72 }); doc.querySelector = selector => selector === '[data-system-builder]' ? component : selector === '[data-chapter-nav]' ? nav : null;
  const movements = []; win.scrollY = 200; win.getComputedStyle = () => ({ top: '0' }); win.scrollTo = options => movements.push(options); win.location = { hash: '' }; win.history = { state: { original: true }, pushState(state, unused, hash) { assert.deepEqual(state, { original: true }); win.location.hash = hash; } };
  Object.values(nodes).concat(component, ...checks, brief).forEach(el => el.ownerDocument = doc);
  function select(...ids) { checks.forEach(input => { input.checked = ids.includes(input.value); }); checks[0].dispatchEvent(new Event('change')); }
  function click(node, modifiers = {}) { const event = new Event('click', { cancelable: true }); Object.assign(event, modifiers); node.dispatchEvent(event); return event; }
  return { component, fieldset, checks, title, summary, list, reset, next, doc, win, brief, movements, select, click };
}
test('native checkbox changes render a live text recommendation and reset clears only the chooser', () => {
  const s = fixture();
  s.checks.push(Object.assign(new Element(), { value: '<img src=x onerror=alert(1)>', checked: true }));
  const instance = builder().create(s.component);
  assert.equal(s.fieldset.disabled, false); assert.equal(s.reset.hidden, false); assert.equal(s.next.getAttribute('aria-disabled'), 'true');
  s.select('slow-support', 'poor-reporting', '<img src=x onerror=alert(1)>');
  assert.equal(s.title.textContent, 'AI Agent + CRM Automation + Analytics Dashboard');
  assert.deepEqual(s.list.children.map(child => child.textContent), ['AI Agent', 'CRM Automation', 'Analytics Dashboard']);
  assert.doesNotMatch(s.summary.textContent, /<img/); assert.equal(s.next.getAttribute('aria-disabled'), 'false');
  s.click(s.reset); assert.ok(s.checks.every(input => !input.checked)); assert.equal(s.list.children.length, 0); assert.equal(s.title.textContent, 'Choose where to start.');
  instance.destroy();
});
test('confirmation alone carries the current recommendation and aligns keyboard focus through the scroll adapter', () => {
  const s = fixture(), confirmed = []; s.win.AvantageScroll = { scrollTo(top, options) { s.movements.push({ top, ...options }); } };
  const instance = builder().create(s.doc, { onContinue(result) { confirmed.push(result); } });
  s.click(s.next); assert.equal(confirmed.length, 0);
  s.select('manual-work'); assert.equal(confirmed.length, 0);
  assert.equal(s.click(s.next).defaultPrevented, true); assert.equal(confirmed.length, 1);
  assert.deepEqual(confirmed[0].components, ['Workflow Automation']); assert.deepEqual(s.movements, [{ top: 1062, immediate: true }]);
  assert.equal(s.doc.activeElement, s.brief); assert.deepEqual(s.brief.focusOptions, { preventScroll: true }); assert.equal(s.win.location.hash, '#brief');
  s.click(s.next, { ctrlKey: true }); assert.equal(confirmed.length, 1);
  instance.destroy();
});
test('failed confirmation leaves the chooser available and missing motion APIs use immediate native navigation', () => {
  const s = fixture(); let instance = builder().create(s.component, { onContinue: () => false }); s.select('manual-work'); s.click(s.next);
  assert.equal(s.movements.length, 0); assert.match(s.summary.textContent, /message is full/); instance.destroy();
  instance = builder().create(s.component, { onContinue() {} }); s.select('poor-reporting'); s.click(s.next);
  assert.deepEqual(s.movements, [{ top: 1062, behavior: 'instant' }]); instance.destroy();
});
test('destroy removes every owned listener, restores markup and makes reset and old controls inert', () => {
  const s = fixture(); s.checks[2].checked = true; const existing = new Element('Existing static component'); s.list.replaceChildren(existing);
  const instance = builder().create(s.component); s.select('manual-work'); instance.destroy(); instance.destroy();
  assert.equal(s.checks[2].checked, true); assert.equal(s.checks[0].checked, false); assert.equal(s.fieldset.disabled, true); assert.equal(s.reset.hidden, true);
  assert.equal(s.title.textContent, 'Your system starts with your needs.'); assert.equal(s.summary.textContent, 'Static explanation'); assert.deepEqual(s.list.children, [existing]); assert.equal(s.next.getAttribute('aria-disabled'), null);
  s.checks.concat(s.reset, s.next).forEach(el => assert.equal(el.listeners.size, 0));
  instance.reset(); s.click(s.reset); s.click(s.next); assert.equal(s.checks[2].checked, true); assert.equal(s.movements.length, 0);
  assert.doesNotThrow(() => { const absent = builder().create(null); absent.reset(); absent.destroy(); });
});
function briefFixture(message = 'Keep my existing project details.') {
  const checks = ['Task Automation', 'Custom Software', 'Web/App Development', 'Marketing Automation', 'E-Commerce', 'The Impossible'].map(value => Object.assign(new Element(), { value }));
  checks[2].checked = true; const textarea = Object.assign(new Element(), { value: message, maxLength: 5000 });
  const name = Object.assign(new Element(), { value: 'Original name' }); const form = { querySelectorAll: () => checks, querySelector: () => textarea };
  const doc = { querySelector: selector => selector === '#brief-form' ? form : null };
  return { checks, textarea, name, doc };
}
test('brief transfer checks matching services and preserves other fields, selections and untrusted message text', () => {
  const s = briefFixture('<script>existing text</script>'); const api = require('../dist/cinematic-content.js');
  const result = builder().recommend(['slow-support', 'poor-reporting', 'content-workflow']);
  assert.equal(api.applyRecommendation(s.doc, result), true);
  assert.deepEqual(s.checks.filter(check => check.checked).map(check => check.value), ['Task Automation', 'Custom Software', 'Web/App Development', 'Marketing Automation']);
  assert.equal(s.textarea.value, '<script>existing text</script>\n\n' + result.summary); assert.equal(s.name.value, 'Original name');
  api.applyRecommendation(s.doc, result); assert.equal(s.textarea.value, '<script>existing text</script>\n\n' + result.summary);
});
test('full messages are preserved and empty or missing brief transfers cause no mutation', () => {
  const s = briefFixture('x'.repeat(4999)), api = require('../dist/cinematic-content.js');
  assert.equal(api.applyRecommendation(s.doc, builder().recommend(['manual-work'])), false); assert.equal(s.textarea.value.length, 4999); assert.equal(s.checks[0].checked, false);
  assert.equal(api.applyRecommendation(s.doc, builder().recommend([])), false); assert.equal(api.applyRecommendation(null, {}), false);
});
test('browser module confirms into the brief and releases the standalone lifecycle listener', () => {
  const s = fixture(), brief = briefFixture(); s.doc.querySelector = selector => selector === '[data-system-builder]' ? s.component : selector === '#brief-form' ? brief.doc.querySelector(selector) : null;
  vm.runInNewContext(read('cinematic-content.js'), { window: s.win }); vm.runInNewContext(read('system-builder.js'), { window: s.win });
  const instance = s.win.AvantageSystemBuilder.instance; assert.ok(instance); assert.equal(s.win.listeners.size, 1);
  s.select('custom-software'); s.click(s.next); assert.equal(brief.checks[1].checked, true); assert.match(brief.textarea.value, /Suggested system: Custom Software/);
  const cached = new Event('pagehide'); cached.persisted = true; s.win.dispatchEvent(cached); assert.equal(s.fieldset.disabled, false);
  instance.destroy(); assert.equal(s.win.listeners.size, 0); s.select('manual-work'); assert.equal(s.title.textContent, 'Your system starts with your needs.');
  vm.runInNewContext(read('system-builder.js'), { window: s.win }); s.win.dispatchEvent(new Event('pagehide')); assert.equal(s.fieldset.disabled, true); assert.equal(s.win.listeners.size, 0);
});
test('static markup labels six native choices, explains the recommendation and retains a no-JS brief destination', () => {
  const html = read('cinematic-preview.html'), section = html.match(/<section\b[^>]*id="build-your-system"[\s\S]*?<\/section>/);
  assert.ok(section); assert.match(section[0], /<h2 id="system-builder-title">Build your system\.<\/h2>/);
  assert.match(section[0], /<fieldset[^>]*data-builder-problems[^>]*disabled/); assert.match(section[0], /<legend>What’s slowing your business down\?<\/legend>/);
  const values = [...section[0].matchAll(/<input[^>]*type="checkbox"[^>]*value="([^"]+)"/g)].map(match => match[1]); assert.deepEqual(values, problems);
  assert.match(section[0], /aria-live="polite"[^>]*aria-atomic="true"/); assert.match(section[0], /data-builder-reset[^>]*hidden/);
  assert.match(section[0], /href="#brief"[^>]*data-builder-continue>Design this system with us<\/a>/);
  assert.match(html, /<script defer src="system-builder\.js"><\/script>/);
  assert.ok(section.index < html.indexOf('id="systems-finale"')); assert.match(section[0], /AI Agent|Workflow Automation/);
});
