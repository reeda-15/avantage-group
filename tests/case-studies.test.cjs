const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Verified inventory recorded before public copy: build_content.py:40–42,
// dist/works.html and the corresponding dist/projects/<id>.html pages.
// No source documents historical failures or measured business improvements.
// Friction therefore describes the workflow requirement, and outcome means
// delivered scope. Screenshot numbers are interface data, not client results.
const facts = [
  { id: 'btp-travel-crm', name: 'BTP Travel CRM', client: 'Bharat Travel Point',
    image: 'project-btp.webp', width: 1905, height: 992,
    scope: ['inquiries', 'bookings', 'customers', 'branches', 'payments', 'marketing channel performance'] },
  { id: 'harshad-steel-erp', name: 'Harshad Steel ERP', client: 'Harshad Steel / Bhavana Hardware',
    image: 'project-harshad.webp', width: 1920, height: 991,
    scope: ['inventory', 'sales bills', 'purchase bills', 'cash', 'customers', 'suppliers', 'roles', 'audit logs'] },
  { id: 'vrc-plasto-plm', name: 'VRC Plasto PLM', client: 'VRC Plasto Mould',
    image: 'project-vrc.webp', width: 1906, height: 991,
    scope: ['RFQ', 'feasibility', 'quotation', 'APQP', 'trials', 'PPAP', 'SOP handover'] }
];

class Element extends EventTarget {
  constructor(doc, attrs = {}) { super(); this.ownerDocument = doc; this.attrs = new Map(Object.entries(attrs)); this.hidden = false; }
  get id() { return this.getAttribute('id'); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  removeAttribute(name) { this.attrs.delete(name); }
  matches(selector) { return selector === '[data-case-studies]' && this.attrs.has('data-case-studies'); }
  closest(selector) { return selector === '[data-case-open]' && this.attrs.has('data-case-open') || selector === '[data-case-close]' && this.attrs.has('data-case-close') ? this : null; }
  contains(element) { return element === this || element === this.closeButton; }
  focus(options) { this.ownerDocument.activeElement = this; this.focusOptions = options; }
}
function fixture({ hash = '#our-work', history = true, rootIsComponent = false } = {}) {
  const win = new EventTarget(), doc = new EventTarget(); doc.defaultView = win;
  win.location = { hash, pathname: '/cinematic-preview.html', search: '?review=1' };
  const writes = [], state = { existing: 'preserve me' };
  if (history) win.history = { state,
    pushState(s, _, url) { writes.push(['push', s, url]); win.location.hash = url.slice(url.indexOf('#')); },
    replaceState(s, _, url) { writes.push(['replace', s, url]); win.location.hash = url.includes('#') ? url.slice(url.indexOf('#')) : ''; } };
  const component = new Element(doc, { 'data-case-studies': '' });
  const triggers = facts.map(f => new Element(doc, { 'data-case-open': f.id, href: '#case-' + f.id }));
  const panels = facts.map(f => new Element(doc, { 'data-case-panel': f.id, id: 'case-' + f.id, tabindex: '-1' }));
  const closes = panels.map(p => { p.closeButton = new Element(doc, { 'data-case-close': '' }); return p.closeButton; });
  component.querySelectorAll = selector => selector === '[data-case-open]' ? triggers : selector === '[data-case-panel]' ? panels : closes;
  doc.querySelector = selector => selector === '[data-case-studies]' ? component : null;
  const root = rootIsComponent ? component : doc;
  function dispatch(type, target, extras = {}) {
    const event = new Event(type, { cancelable: true });
    Object.defineProperties(event, Object.fromEntries(Object.entries({ target, button: 0, ...extras }).map(([k, value]) => [k, { value }])));
    component.dispatchEvent(event); return event;
  }
  return { win, doc, component, triggers, panels, closes, writes, state, root, dispatch,
    start() { this.api = require('../dist/case-studies.js').create(root); return this.api; },
    hash(value, event = 'hashchange') { win.location.hash = value; win.dispatchEvent(new Event(event)); } };
}
const visible = s => s.panels.filter(p => !p.hidden).map(p => p.getAttribute('data-case-panel'));

test('static stories expose sourced scope, friction, solution, outcome and useful project destinations', () => {
  const html = fs.readFileSync('dist/cinematic-preview.html', 'utf8');
  const work = html.split('id="our-work"')[1].split('id="systems-finale"')[0];
  assert.match(work, /data-case-studies/);
  for (const fact of facts) {
    const panel = work.match(new RegExp(`<article[^>]*data-case-panel="${fact.id}"[^>]*>([\\s\\S]*?)<\\/article>`));
    assert.ok(panel, fact.name + ' has a readable in-page story');
    assert.doesNotMatch(panel[0], /\bhidden\b|\binert\b|aria-hidden="true"/);
    for (const label of ['Friction', 'Connected solution', 'Outcome']) assert.match(panel[1], new RegExp(`<h4>${label}<\\/h4>`));
    assert.ok(panel[1].includes(fact.client));
    for (const term of fact.scope) assert.ok(panel[1].toLowerCase().includes(term.toLowerCase()), fact.name + ': ' + term);
    assert.match(panel[1], new RegExp(`href="projects/${fact.id}\\.html"`));
    assert.match(work, new RegExp(`href="#case-${fact.id}"[^>]*data-case-open="${fact.id}"`));
    assert.match(work, new RegExp(`src="assets/${fact.image}"[^>]*width="${fact.width}"[^>]*height="${fact.height}"[^>]*loading="lazy"`));
    assert.ok(fs.existsSync('dist/projects/' + fact.id + '.html'));
    assert.ok(fs.existsSync('dist/assets/' + fact.image));
  }
  assert.doesNotMatch(work, /\d+\s*(?:%|percent|times|hours saved)|\b(?:ROI|doubled|tripled|testimonial|revenue growth|cost savings)\b/i);
  assert.match(html, /<script defer src="case-studies\.js"><\/script>/);
});

test('pointer and public selection expose exactly one panel and focus its accessible reading start', () => {
  const s = fixture(); s.start(); assert.deepEqual(visible(s), []);
  const event = s.dispatch('click', s.triggers[0]);
  assert.equal(event.defaultPrevented, true); assert.equal(event.cancelBubble, true);
  assert.deepEqual(visible(s), ['btp-travel-crm']); assert.equal(s.doc.activeElement, s.panels[0]);
  assert.deepEqual(s.panels[0].focusOptions, { preventScroll: true });
  assert.deepEqual(s.triggers.map(t => t.getAttribute('aria-expanded')), ['true', 'false', 'false']);
  assert.equal(s.triggers[0].getAttribute('aria-controls'), 'case-btp-travel-crm');
  s.api.open('harshad-steel-erp'); assert.deepEqual(visible(s), ['harshad-steel-erp']);
  s.api.open('unknown'); s.api.open('__proto__'); assert.deepEqual(visible(s), ['harshad-steel-erp']); s.api.destroy();
});

test('native keyboard click and Space open stories; Escape and close restore their opener', () => {
  const s = fixture(); s.start();
  s.dispatch('click', s.triggers[1], { detail: 0 });
  s.dispatch('keydown', s.panels[1], { key: 'Escape' });
  assert.deepEqual(visible(s), []); assert.equal(s.doc.activeElement, s.triggers[1]);
  const space = s.dispatch('keydown', s.triggers[2], { key: ' ' }); assert.equal(space.defaultPrevented, true);
  assert.deepEqual(visible(s), ['vrc-plasto-plm']);
  s.dispatch('click', s.closes[2]); assert.deepEqual(visible(s), []); assert.equal(s.doc.activeElement, s.triggers[2]);
  s.dispatch('click', s.triggers[0]); s.dispatch('click', s.triggers[0]); assert.deepEqual(visible(s), []); s.api.destroy();
});

test('modified links retain browser behavior and unrelated keyboard events remain untouched', () => {
  const s = fixture(); s.start();
  for (const extras of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }])
    assert.equal(s.dispatch('click', s.triggers[0], extras).defaultPrevented, false);
  assert.equal(s.dispatch('keydown', s.triggers[0], { key: 'ArrowDown' }).defaultPrevented, false);
  assert.equal(s.dispatch('keydown', s.triggers[0], { key: ' ', repeat: true }).defaultPrevented, false);
  assert.deepEqual(visible(s), []); assert.deepEqual(s.writes, []); s.api.destroy();
});

test('deep links and browser history synchronize panels without adding history entries', () => {
  const s = fixture({ hash: '#case-vrc-plasto-plm' }); s.start();
  assert.deepEqual(visible(s), ['vrc-plasto-plm']); assert.equal(s.doc.activeElement, s.panels[2]); assert.deepEqual(s.writes, []);
  s.hash('#case-btp-travel-crm', 'popstate'); assert.deepEqual(visible(s), ['btp-travel-crm']);
  s.hash('#case-harshad-steel-erp'); assert.deepEqual(visible(s), ['harshad-steel-erp']);
  s.hash('#automations', 'popstate'); assert.deepEqual(visible(s), []); assert.equal(s.win.location.hash, '#automations');
  s.hash('#case-%E0%A4%A'); assert.deepEqual(visible(s), []);
  s.hash('#case-missing'); assert.deepEqual(visible(s), []); assert.deepEqual(s.writes, []); s.api.destroy();
});

test('open avoids duplicate history, close preserves query/state and never overwrites an unrelated hash', () => {
  const s = fixture(); s.start(); s.api.open('btp-travel-crm'); s.api.open('btp-travel-crm');
  assert.deepEqual(s.writes, [['push', s.state, '/cinematic-preview.html?review=1#case-btp-travel-crm']]);
  s.api.close(); assert.deepEqual(s.writes[1], ['replace', s.state, '/cinematic-preview.html?review=1#our-work']);
  s.api.open('vrc-plasto-plm'); s.win.location.hash = '#brief'; s.api.close();
  assert.equal(s.win.location.hash, '#brief'); assert.equal(s.writes.length, 3); s.api.destroy();
  const direct = fixture({ hash: '#case-btp-travel-crm' }); direct.start(); direct.api.close();
  assert.equal(direct.win.location.hash, '#our-work'); direct.api.destroy();
});

test('cleanup restores readable markup and original attributes, removes listeners and is idempotent', () => {
  const s = fixture({ rootIsComponent: true });
  s.triggers[0].setAttribute('aria-expanded', 'original'); s.component.setAttribute('data-cases-enhanced', 'original');
  s.start(); s.api.open('btp-travel-crm'); s.api.destroy(); s.api.destroy();
  assert.deepEqual(visible(s), facts.map(f => f.id)); assert.equal(s.component.getAttribute('data-cases-enhanced'), 'original');
  assert.equal(s.triggers[0].getAttribute('aria-expanded'), 'original'); assert.equal(s.triggers[1].getAttribute('aria-expanded'), null);
  assert.equal(s.triggers[0].getAttribute('aria-controls'), null);
  const count = s.writes.length; s.api.open('harshad-steel-erp'); s.api.close(); s.hash('#case-vrc-plasto-plm');
  assert.equal(s.dispatch('click', s.triggers[1]).defaultPrevented, false);
  assert.deepEqual(visible(s), facts.map(f => f.id)); assert.equal(s.writes.length, count);
  assert.doesNotThrow(() => require('../dist/case-studies.js').create({ querySelector: () => null }).destroy());
});

test('missing history stays usable and no motion/library API is required', () => {
  const s = fixture({ history: false }); s.start(); s.api.open('btp-travel-crm');
  assert.deepEqual(visible(s), ['btp-travel-crm']); s.api.close(); assert.equal(s.doc.activeElement, s.triggers[0]); s.api.destroy();
});

// A native jump during an active adapter leaves its old momentum target alive.
// Both explicit transitions must use the immediate adapter contract and must
// account for the actual sticky bar before focusing without another scroll.
test('opening and closing use immediate adapter alignment below sticky navigation during active momentum', () => {
  const s = fixture(), alignments = [], nativeAlignments = [];
  const nav = { getBoundingClientRect: () => ({ height: 64 }) };
  s.doc.querySelector = selector => selector === '[data-chapter-nav]' ? nav : selector === '[data-case-studies]' ? s.component : null;
  s.win.getComputedStyle = () => ({ top: '12px' }); s.win.scrollY = 200;
  s.panels[0].getBoundingClientRect = () => ({ top: 500 });
  s.triggers[0].getBoundingClientRect = () => ({ top: -400 });
  s.panels[0].scrollIntoView = s.triggers[0].scrollIntoView = () => nativeAlignments.push('element');
  s.win.scrollTo = () => nativeAlignments.push('window');
  s.win.AvantageScroll = { active: true, scrollTo(top, options) { alignments.push([top, options]); } };
  s.start(); s.dispatch('click', s.triggers[0]);
  assert.deepEqual(alignments, [[608, { immediate: true }]]);
  assert.deepEqual(s.panels[0].focusOptions, { preventScroll: true });
  s.win.scrollY = 608; s.dispatch('click', s.closes[0]);
  assert.deepEqual(alignments, [[608, { immediate: true }], [116, { immediate: true }]]);
  assert.deepEqual(s.triggers[0].focusOptions, { preventScroll: true });
  assert.deepEqual(nativeAlignments, []);
  s.api.destroy();
});

test('opening and closing without the adapter use instant native scrolling with sticky compensation and clamp at the page start', () => {
  const s = fixture(), alignments = [];
  const nav = { getBoundingClientRect: () => ({ height: 64 }) };
  s.doc.querySelector = selector => selector === '[data-chapter-nav]' ? nav : selector === '[data-case-studies]' ? s.component : null;
  s.win.getComputedStyle = () => ({ top: '12px' }); s.win.scrollY = 200;
  s.win.scrollTo = options => alignments.push(options);
  s.panels[0].getBoundingClientRect = () => ({ top: 500 });
  s.triggers[0].getBoundingClientRect = () => ({ top: -250 });
  s.start(); s.api.open('btp-travel-crm'); s.api.close();
  assert.deepEqual(alignments, [{ top: 608, behavior: 'instant' }, { top: 0, behavior: 'instant' }]);
  assert.deepEqual(s.panels[0].focusOptions, { preventScroll: true });
  assert.deepEqual(s.triggers[0].focusOptions, { preventScroll: true }); s.api.destroy();
});

test('standalone lifecycle preserves cached exits and releases its listener on explicit destroy', () => {
  const s = fixture(); s.win.document = s.doc;
  const listeners = new Set(), add = s.win.addEventListener.bind(s.win), remove = s.win.removeEventListener.bind(s.win);
  s.win.addEventListener = (type, fn) => { if (type === 'pagehide') listeners.add(fn); add(type, fn); };
  s.win.removeEventListener = (type, fn) => { if (type === 'pagehide') listeners.delete(fn); remove(type, fn); };
  vm.runInNewContext(fs.readFileSync('dist/case-studies.js', 'utf8'), { window: s.win });
  assert.equal(listeners.size, 1);
  const cached = new Event('pagehide'); Object.defineProperty(cached, 'persisted', { value: true }); s.win.dispatchEvent(cached);
  s.dispatch('click', s.triggers[0]); assert.deepEqual(visible(s), ['btp-travel-crm']);
  s.win.AvantageCaseStudies.instance.destroy(); assert.equal(listeners.size, 0); assert.deepEqual(visible(s), facts.map(f => f.id));
});
