const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const pairs = [
  ['Manual handoffs', 'Automated workflows'],
  ['Disconnected tools', 'Connected systems'],
  ['Slow reporting', 'Live intelligence'],
  ['Generic AI usage', 'Company-specific AI'],
  ['Information chasing', 'Proactive information delivery']
];
const read = name => fs.readFileSync('dist/' + name, 'utf8');
const plain = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

test('the static comparison exposes all five approved pairs and an explicitly labelled native control', () => {
  const section = read('cinematic-preview.html').match(/<section\b[^>]*id="system-transformation"[^>]*>([\s\S]*?)<\/section>/);
  assert.ok(section, 'semantic transformation section exists without JavaScript');
  assert.match(section[0], /aria-labelledby="system-transformation-title"/);
  assert.match(section[1], /<h2 id="system-transformation-title">/);
  const rows = [...section[1].matchAll(/<div class="transformation-pair">([\s\S]*?)<\/div>/g)];
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map(row => [plain(row[1].match(/<dt[^>]*>([\s\S]*?)<\/dt>/)[1]), plain(row[1].match(/<dd[^>]*>([\s\S]*?)<\/dd>/)[1])]),
    pairs.map(([before, after]) => ['Before ' + before, 'After ' + after]));
  rows.forEach(row => assert.doesNotMatch(row[0], /hidden|inert|aria-hidden|style=/));
  assert.match(section[1], /<dl class="transformation-pairs">/);
  assert.match(section[1], /<label for="transformation-position">/);
  assert.match(section[1], /<input[^>]*id="transformation-position"[^>]*type="range"[^>]*min="0"[^>]*max="100"[^>]*step="1"[^>]*value="50"[^>]*aria-describedby="transformation-help"/);
  assert.match(section[1], /<svg[^>]*class="transformation-diagram"[^>]*aria-hidden="true"[^>]*focusable="false"/);
  assert.match(read('cinematic-preview.html'), /<script defer src="system-transformation\.js"><\/script>/);
});

test('desktop clips only its contained decorative reveal; mobile and reduced motion stack the complete comparison', () => {
  const css = read('connected-systems.css');
  assert.match(css, /\.transformation-visual\s*\{[^}]*position:\s*relative[^}]*overflow:\s*hidden[^}]*max-width:\s*100%/);
  assert.match(css, /\[data-transformation-enhanced="true"\] \.transformation-connected\s*\{[^}]*clip-path:[^}]*var\(--transformation-progress\)/);
  assert.match(css, /\.transformation-pair\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 700px\), \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.transformation-pair\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 700px\), \(prefers-reduced-motion: reduce\)[\s\S]*?\.transformation-connected\s*\{[^}]*clip-path:\s*none/);
  assert.doesNotMatch(css, /\.transformation-(?:pair|pairs|before|after)[^{]*\{[^}]*(?:clip-path|visibility:\s*hidden|opacity:\s*0|display:\s*none)/);
});

class Element extends EventTarget {
  constructor() { super(); this.attrs = new Map(); this.hidden = false; this.value = '50'; this.properties = new Map();
    this.style = { setProperty: (name, value, priority = '') => this.properties.set(name, { value: String(value), priority }),
      getPropertyValue: name => this.properties.get(name)?.value || '', getPropertyPriority: name => this.properties.get(name)?.priority || '',
      removeProperty: name => this.properties.delete(name) };
  }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  removeAttribute(name) { this.attrs.delete(name); }
}
function setup({ stacked = false, scroll = false, frame = true } = {}) {
  const component = new Element(), range = new Element(), controls = new Element(); controls.hidden = true;
  const content = pairs.map(([before, after]) => { const element = new Element(); element.textContent = before + ' → ' + after; return element; });
  component.querySelector = selector => selector === '[data-transformation-range]' ? range : selector === '[data-transformation-controls]' ? controls : null;
  component.querySelectorAll = () => content;
  component.matches = selector => selector === '[data-transformation]';
  let geometry = { top: 640, height: 500 };
  component.getBoundingClientRect = () => geometry;
  if (scroll) component.setAttribute('data-transformation-scroll', '');
  const doc = new EventTarget(), win = new EventTarget(), media = new EventTarget(), frames = new Map();
  media.matches = stacked; doc.defaultView = win; component.ownerDocument = doc; win.document = doc; win.innerHeight = 800;
  doc.querySelector = () => component; win.matchMedia = () => media;
  let serial = 0;
  if (frame) { win.requestAnimationFrame = callback => { frames.set(++serial, callback); return serial; }; win.cancelAnimationFrame = id => frames.delete(id); }
  const instance = require('../dist/system-transformation.js').create(component);
  const progress = () => Number(component.style.getPropertyValue('--transformation-progress'));
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); };
  return { component, range, controls, content, doc, win, media, frames, instance, progress, flush, geometry: value => { geometry = value; } };
}
function key(range, value) { const event = new Event('keydown', { cancelable: true }); event.key = value; range.dispatchEvent(event); return event; }

test('public progress clamps endpoints, accepts fractions and ignores malformed values', () => {
  const s = setup(); assert.equal(s.progress(), .5);
  for (const [input, expected] of [[-2, 0], [2, 1], [0, 0], [1, 1], [.375, .375], [Infinity, 1], [-Infinity, 0]]) {
    s.instance.setProgress(input); assert.equal(s.progress(), expected); assert.equal(Number(s.range.value), expected * 100);
  }
  s.instance.setProgress(.4); s.instance.setProgress(NaN); s.instance.setProgress('bad'); assert.equal(s.progress(), .4);
  assert.equal(s.range.getAttribute('aria-valuetext'), '40% connected view. Both before and after are listed below.');
  s.instance.destroy();
});

test('pointer input and keyboard arrows, page keys and endpoints share the same progress state', () => {
  const s = setup(); assert.equal(s.controls.hidden, false);
  s.range.value = '72'; s.range.dispatchEvent(new Event('input')); assert.equal(s.progress(), .72);
  for (const [input, expected] of [['ArrowRight', .73], ['ArrowLeft', .72], ['ArrowUp', .73], ['ArrowDown', .72], ['PageUp', .82], ['PageDown', .72], ['Home', 0], ['ArrowLeft', 0], ['End', 1], ['ArrowRight', 1]]) {
    assert.equal(key(s.range, input).defaultPrevented, true); assert.equal(s.progress(), expected);
  }
  assert.equal(key(s.range, 'Tab').defaultPrevented, false); s.instance.destroy();
});

test('all comparison text and semantic exposure survive every progress state', () => {
  const s = setup(), original = s.content.map(element => element.textContent);
  for (const progress of [0, .1, .5, .9, 1]) {
    s.instance.setProgress(progress); assert.deepEqual(s.content.map(element => element.textContent), original);
    s.content.forEach(element => { assert.equal(element.hidden, false); assert.equal(element.getAttribute('aria-hidden'), null); assert.equal(element.getAttribute('inert'), null); });
  }
  s.instance.destroy();
});

test('optional desktop scrolling uses the same property and yields to deliberate slider input', () => {
  const s = setup({ scroll: true }); s.flush(); assert.equal(s.progress(), 0);
  s.geometry({ top: 270, height: 500 }); s.win.dispatchEvent(new Event('scroll')); s.flush(); assert.equal(s.progress(), .5);
  s.geometry({ top: -100, height: 500 }); s.win.dispatchEvent(new Event('scroll')); s.flush(); assert.equal(s.progress(), 1);
  s.range.value = '25'; s.range.dispatchEvent(new Event('input')); s.win.dispatchEvent(new Event('scroll')); s.flush(); assert.equal(s.progress(), .25);
  s.instance.destroy();
});

test('phone and live reduced-motion changes use the static complete view and suspend scroll updates', () => {
  const s = setup({ stacked: true, scroll: true }); assert.equal(s.controls.hidden, true);
  assert.equal(s.component.getAttribute('data-transformation-enhanced'), null); assert.equal(s.frames.size, 0);
  s.media.matches = false; s.media.dispatchEvent(new Event('change')); s.flush(); assert.equal(s.controls.hidden, false);
  s.win.dispatchEvent(new Event('scroll')); assert.equal(s.frames.size, 1);
  s.media.matches = true; s.media.dispatchEvent(new Event('change'));
  assert.equal(s.frames.size, 0); assert.equal(s.controls.hidden, true); assert.equal(s.component.getAttribute('data-transformation-enhanced'), null);
  s.instance.destroy();
});

test('missing animation-frame and media APIs still leave a working control and complete text', () => {
  const s = setup({ frame: false, scroll: true }); s.instance.destroy(); s.win.matchMedia = undefined;
  s.instance = require('../dist/system-transformation.js').create(s.component);
  s.range.value = '65'; s.range.dispatchEvent(new Event('input')); assert.equal(s.progress(), .65);
  assert.deepEqual(s.content.map(element => element.textContent), pairs.map(([before, after]) => before + ' → ' + after));
  s.instance.destroy();
});

test('cleanup cancels scheduled motion, restores prior state and makes old callbacks inert', () => {
  const s = setup({ scroll: true }); s.instance.destroy();
  s.component.style.setProperty('--transformation-progress', '.2', 'important'); s.component.setAttribute('data-transformation-enhanced', 'original');
  s.range.value = '20'; s.range.setAttribute('aria-valuetext', 'Original value');
  s.instance = require('../dist/system-transformation.js').create(s.component); const callback = [...s.frames.values()][0];
  s.instance.destroy(); s.instance.destroy(); assert.equal(s.frames.size, 0);
  assert.equal(s.component.style.getPropertyValue('--transformation-progress'), '.2'); assert.equal(s.component.style.getPropertyPriority('--transformation-progress'), 'important');
  assert.equal(s.component.getAttribute('data-transformation-enhanced'), 'original'); assert.equal(s.controls.hidden, true);
  assert.equal(s.range.value, '20'); assert.equal(s.range.getAttribute('aria-valuetext'), 'Original value');
  callback(); s.range.dispatchEvent(new Event('input')); key(s.range, 'End'); s.win.dispatchEvent(new Event('scroll')); s.media.dispatchEvent(new Event('change'));
  s.instance.setProgress(1); assert.equal(s.component.style.getPropertyValue('--transformation-progress'), '.2'); assert.equal(s.frames.size, 0);
});

test('standalone startup releases its lifecycle listener and preserves cached page exits', () => {
  const s = setup(); s.instance.destroy();
  const listeners = new Set(), add = s.win.addEventListener.bind(s.win), remove = s.win.removeEventListener.bind(s.win);
  s.win.addEventListener = (type, fn, options) => { if (type === 'pagehide') listeners.add(fn); add(type, fn, options); };
  s.win.removeEventListener = (type, fn) => { if (type === 'pagehide') listeners.delete(fn); remove(type, fn); };
  vm.runInNewContext(read('system-transformation.js'), { window: s.win }); const api = s.win.AvantageTransformation.instance;
  assert.equal(listeners.size, 1); const cached = new Event('pagehide'); cached.persisted = true; s.win.dispatchEvent(cached);
  api.setProgress(.8); assert.equal(s.progress(), .8); api.destroy(); assert.equal(listeners.size, 0);
  vm.runInNewContext(read('system-transformation.js'), { window: s.win }); s.win.dispatchEvent(new Event('pagehide'));
  assert.equal(listeners.size, 0); assert.equal(s.component.style.getPropertyValue('--transformation-progress'), '');
});
