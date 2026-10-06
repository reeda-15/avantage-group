const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const capabilities = [
  ['think', 'Think', 'ai-agents'], ['connect', 'Connect', 'automations'],
  ['automate', 'Automate', 'automations'], ['build', 'Build', 'custom-software'],
  ['understand', 'Understand', 'data-insights'], ['create', 'Create', 'creative-ai']
];

// The browser boundary provides events and attributes; selection and lifecycle
// behavior are executed by the real module without new runtime dependencies.
class Element extends EventTarget {
  constructor() { super(); this.attrs = new Map(); }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  removeAttribute(name) { this.attrs.delete(name); }
  closest(selector) { return selector === '[data-system-node]' ? this : null; }
}
function setup({ reduced = false, observer = true, onSelect, callback = true } = {}) {
  const map = new Element(), nodes = capabilities.map(([id, , chapter]) => {
    const node = new Element(); node.setAttribute('data-system-node', id); node.setAttribute('href', '#' + chapter); return node;
  });
  const paths = capabilities.map(([id]) => { const p = new Element(); p.setAttribute('data-system-path', id); return p; });
  map.querySelectorAll = selector => selector === '[data-system-node]' ? nodes : paths;
  const media = new EventTarget(); media.matches = reduced;
  const observers = [], selected = [], win = new EventTarget(); win.matchMedia = () => media;
  if (observer) win.IntersectionObserver = class {
    constructor(fn) { this.callback = fn; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  };
  const doc = new EventTarget(); doc.defaultView = win; doc.hidden = false;
  map.ownerDocument = doc;
  const root = { ownerDocument: doc, querySelector: () => map };
  const options = callback ? { onSelect: onSelect || ((...args) => selected.push(args)) } : {};
  const instance = require('../dist/system-map.js').create(root, options);
  function click(index, extras = {}) {
    const e = new Event('click', { cancelable: true });
    Object.defineProperties(e, { target: { value: nodes[index] }, button: { value: 0 },
      ...Object.fromEntries(Object.entries(extras).map(([k, value]) => [k, { value }])) });
    map.dispatchEvent(e); return e;
  }
  return { map, nodes, paths, media, doc, win, observers, selected, instance, click };
}

test('overview map offers six useful semantic chapter links and a dominant Avantage hub without scripts', () => {
  const html = fs.readFileSync('dist/cinematic-preview.html', 'utf8');
  const overview = html.split('id="system-overview"')[1].split('</section>')[0];
  assert.match(overview, /Your business already has the moving parts\. We make them work as one\./);
  assert.match(overview, /class="system-map" data-system-map/);
  assert.match(overview, /class="system-map-hub"[^>]*>[\s\S]*?Avantage[\s\S]*?Operating system/);
  const links = [...overview.matchAll(/<a\b([^>]*data-system-node="([^"]+)"[^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(links.length, 6);
  capabilities.forEach(([id, label, chapter], i) => {
    assert.equal(links[i][2], id); assert.match(links[i][1], new RegExp(`href="#${chapter}"`));
    assert.match(links[i][3], new RegExp(`<strong>${label}</strong>`));
    assert.match(html, new RegExp(`id="${chapter}"`));
  });
  assert.match(overview, /<svg\b[^>]*aria-hidden="true"[^>]*focusable="false"/);
  assert.equal([...overview.matchAll(/data-system-path=/g)].length, 6);
  assert.match(html, /<script defer src="system-map\.js"><\/script>/);
});

test('selection leaves exactly one current capability and signal path, and reports the chapter through callbacks', () => {
  const s = setup();
  assert.equal(s.nodes[0].getAttribute('aria-current'), 'true'); assert.deepEqual(s.selected, []);
  s.instance.select('understand');
  assert.deepEqual(s.selected, [['understand', 'data-insights']]);
  assert.deepEqual(s.nodes.map(n => n.getAttribute('aria-current')), [null, null, null, null, 'true', null]);
  assert.deepEqual(s.paths.map(p => p.getAttribute('data-selected')), [null, null, null, null, 'true', null]);
  s.instance.select('unknown'); s.instance.select('__proto__');
  assert.equal(s.selected.length, 1); s.instance.destroy();
});

test('keyboard-compatible anchor activation delegates navigation while modifier and native fallback clicks stay useful', () => {
  const s = setup(); const e = s.click(1);
  assert.equal(e.defaultPrevented, true); assert.equal(e.cancelBubble, true);
  assert.deepEqual(s.selected, [['connect', 'automations']]);
  s.click(2, { ctrlKey: true }); s.click(2, { button: 1 });
  assert.equal(s.selected.length, 1); s.instance.destroy();
  const native = setup({ callback: false });
  assert.equal(native.click(5).defaultPrevented, false);
  assert.equal(native.nodes[5].getAttribute('aria-current'), 'true'); native.instance.destroy();
});

test('decorative signals run only in the viewport and pause when the document is hidden', () => {
  const s = setup(); assert.equal(s.map.getAttribute('data-signal-motion'), null);
  s.observers[0].callback([{ target: s.map, isIntersecting: true }]);
  assert.equal(s.map.getAttribute('data-signal-motion'), 'true');
  s.doc.hidden = true; s.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(s.map.getAttribute('data-signal-motion'), null);
  s.doc.hidden = false; s.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(s.map.getAttribute('data-signal-motion'), 'true');
  s.observers[0].callback([{ target: s.map, isIntersecting: false }]);
  assert.equal(s.map.getAttribute('data-signal-motion'), null); s.instance.destroy();
});

test('reduced motion remains static while selection works and preference changes suspend signal animation', () => {
  const s = setup({ reduced: true }); s.observers[0].callback([{ target: s.map, isIntersecting: true }]);
  assert.equal(s.map.getAttribute('data-signal-motion'), null);
  s.instance.select('create'); assert.deepEqual(s.selected, [['create', 'creative-ai']]);
  s.media.matches = false; s.media.dispatchEvent(new Event('change'));
  assert.equal(s.map.getAttribute('data-signal-motion'), 'true');
  s.media.matches = true; s.media.dispatchEvent(new Event('change'));
  assert.equal(s.map.getAttribute('data-signal-motion'), null); s.instance.destroy();
  const fallback = setup({ observer: false }); fallback.instance.select('build');
  assert.equal(fallback.map.getAttribute('data-signal-motion'), null);
  assert.deepEqual(fallback.selected, [['build', 'custom-software']]); fallback.instance.destroy();
});

test('destroy restores original attributes and removes selection, viewport and preference effects', () => {
  const s = setup(); s.instance.destroy();
  s.nodes[2].setAttribute('aria-current', 'page'); s.paths[2].setAttribute('data-selected', 'original');
  s.instance = require('../dist/system-map.js').create({ ownerDocument: s.doc, querySelector: () => s.map }, { onSelect: (...a) => s.selected.push(a) });
  const io = s.observers.at(-1); io.callback([{ target: s.map, isIntersecting: true }]);
  s.instance.select('build'); s.instance.destroy(); s.instance.destroy();
  assert.equal(io.disconnected, true);
  assert.equal(s.nodes[2].getAttribute('aria-current'), 'page');
  assert.equal(s.paths[2].getAttribute('data-selected'), 'original');
  assert.equal(s.nodes[3].getAttribute('aria-current'), null);
  const count = s.selected.length; s.instance.select('think');
  assert.equal(s.click(0).defaultPrevented, false);
  io.callback([{ target: s.map, isIntersecting: true }]);
  s.doc.dispatchEvent(new Event('visibilitychange')); s.media.dispatchEvent(new Event('change'));
  assert.equal(s.map.getAttribute('data-signal-motion'), null); assert.equal(s.selected.length, count);
  assert.doesNotThrow(() => require('../dist/system-map.js').create({ querySelector: () => null }).destroy());
});

test('standalone callback activates existing navigation, emits mapping, and tears down on permanent exit', () => {
  const s = setup(); s.instance.destroy();
  const activations = [], emissions = [];
  s.doc.querySelector = selector => selector === '[data-system-map]' ? s.map
    : selector === '[data-chapter-nav]' ? {} : { click: () => activations.push(selector) };
  s.doc.addEventListener('avantage:system-select', e => emissions.push(e.detail));
  s.win.document = s.doc;
  s.win.CustomEvent = class extends Event { constructor(type, options) { super(type); this.detail = options.detail; } };
  vm.runInNewContext(fs.readFileSync('dist/system-map.js', 'utf8'), { window: s.win });
  s.click(3);
  assert.deepEqual(activations, ['[data-chapter-nav] a[href="#custom-software"]']);
  assert.equal(emissions[0].id, 'build'); assert.equal(emissions[0].chapterId, 'custom-software');
  const cached = new Event('pagehide'); Object.defineProperty(cached, 'persisted', { value: true }); s.win.dispatchEvent(cached);
  s.click(5); assert.equal(activations.length, 2);
  s.win.dispatchEvent(new Event('pagehide')); s.click(1);
  assert.equal(activations.length, 2);
});

test('map layout contains controls on phones and reduced motion CSS suppresses continuous signals', () => {
  const css = fs.readFileSync('dist/connected-systems.css', 'utf8');
  assert.match(css, /\.system-map\s*\{[^}]*display:\s*grid/);
  assert.match(css, /\.system-map-node\s*\{[^}]*min-height:\s*(?:[5-9]\d|[1-9]\d{2})px/);
  assert.match(css, /\.system-map-hub\s*\{[^}]*grid-column:\s*2[^}]*grid-row:\s*1\s*\/\s*4/);
  assert.match(css, /\.system-map\[data-signal-motion="true"\][^{]*\{[^}]*animation:/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)\s*\{[\s\S]*?\.system-map\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.system-map[^}]*animation:\s*none/);
});

test('destroying a standalone instance releases its page lifecycle listener before a later coordinator takes ownership', () => {
  const s = setup(); s.instance.destroy();
  s.doc.querySelector = selector => selector === '[data-system-map]' ? s.map : null;
  s.win.document = s.doc;
  const listeners = new Set();
  const add = s.win.addEventListener.bind(s.win), remove = s.win.removeEventListener.bind(s.win);
  s.win.addEventListener = (type, listener) => { if (type === 'pagehide') listeners.add(listener); add(type, listener); };
  s.win.removeEventListener = (type, listener) => { if (type === 'pagehide') listeners.delete(listener); remove(type, listener); };
  vm.runInNewContext(fs.readFileSync('dist/system-map.js', 'utf8'), { window: s.win });
  assert.equal(listeners.size, 1);
  s.win.AvantageSystemMap.instance.destroy();
  assert.equal(listeners.size, 0);
});
