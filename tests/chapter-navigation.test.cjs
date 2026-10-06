const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const chapters = [
  ['system-overview', 'Overview'], ['ai-agents', 'AI Agents'], ['automations', 'Automations'],
  ['custom-software', 'Custom Software'], ['data-insights', 'Data & Insights'],
  ['creative-ai', 'Creative AI'], ['our-work', 'Our Work']
];

// The real controller runs against the browser boundary; no DOM package is added.
class Element extends EventTarget {
  constructor(id = '') { super(); this.id = id; this.attrs = new Map(); this.top = 0; this.height = 64; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  removeAttribute(name) { this.attrs.delete(name); }
  getBoundingClientRect() { return { top: this.top, height: this.height }; }
  focus(options) { this.focusOptions = options; this.focusCount = (this.focusCount || 0) + 1; }
  closest(selector) { return selector === 'a[href^="#"]' ? this : null; }
}
function setup({ hash = '', reduced = false, scrollBridge = false, observer = true, offset = 80, onSelect, layoutEvents = false } = {}) {
  const nav = new Element(), sections = chapters.map(([id], i) => { const s = new Element(id); s.top = i * 500; return s; });
  const links = chapters.map(([id]) => { const a = new Element(); a.setAttribute('href', '#' + id); return a; });
  nav.querySelectorAll = () => links;
  const root = new EventTarget(); root.querySelector = s => s === '[data-chapter-nav]' ? nav : null;
  const observers = [], calls = [], selected = [], properties = new Map();
  const win = new EventTarget();
  const frames = new Map(); let frameId = 0;
  Object.assign(win, { scrollY: 100, innerHeight: 900, location: { hash }, matchMedia: () => ({ matches: reduced }),
    getComputedStyle: () => ({ top: '0px' }), scrollTo: args => calls.push(['native', args]),
    history: { pushState(_, __, value) { win.location.hash = value; } } });
  if (layoutEvents) {
    win.ScrollTrigger = new EventTarget();
    win.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
    win.cancelAnimationFrame = id => frames.delete(id);
  }
  if (scrollBridge) win.AvantageScroll = { scrollTo: (top, options) => calls.push(['bridge', top, options]) };
  if (observer) win.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    disconnect() { this.disconnected = true; }
  };
  const heroVideo = new Element('journey');
  const doc = new EventTarget();
  Object.assign(doc, { defaultView: win, querySelector: root.querySelector,
    getElementById: id => id === 'journey' ? heroVideo : sections.find(s => s.id === id),
    documentElement: { style: { setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key), getPropertyValue: key => properties.get(key) || '' } } });
  root.ownerDocument = doc;
  const api = require('../dist/chapter-navigation.js');
  const instance = api.create(root, { offset, onSelect: onSelect || (id => selected.push(id)) });
  const click = (index, extras = {}) => {
    const event = new Event('click', { cancelable: true });
    Object.defineProperties(event, { target: { value: links[index] }, button: { value: 0 }, ...Object.fromEntries(Object.entries(extras).map(([k, value]) => [k, { value }])) });
    nav.dispatchEvent(event); return event;
  };
  const flushFrames = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); };
  return { nav, sections, links, root, win, doc, calls, selected, observers, instance, click, properties, heroVideo, frames, flushFrames };
}

test('semantic navigation exposes all seven exact chapter labels and working hashes before overview', () => {
  const html = fs.readFileSync('dist/cinematic-preview.html', 'utf8');
  const nav = html.match(/<nav\b[^>]*data-chapter-nav[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'edition navigation is present');
  assert.match(nav[0], /aria-label="Edition chapters"/);
  const actual = [...nav[1].matchAll(/<a\b[^>]*href="#([^"]+)"[^>]*>([^<]+)<\/a>/g)]
    .map(([, id, label]) => [id, label.replace('&amp;', '&')]);
  assert.deepEqual(actual, chapters);
  assert.match(html, /<\/nav>\s*<section[^>]*id="system-overview"/);
  assert.match(html, /<script defer src="chapter-navigation\.js/);
});

test('one active aria-current is updated without navigating or accepting unknown IDs', () => {
  const s = setup();
  assert.equal(s.links[0].getAttribute('aria-current'), 'location');
  s.instance.setActive('ai-agents');
  assert.equal(s.links[1].getAttribute('aria-current'), 'location');
  assert.equal(s.links[0].getAttribute('aria-current'), null);
  s.instance.setActive('unknown');
  assert.equal(s.links[1].getAttribute('aria-current'), 'location');
  assert.equal(s.calls.length, 0); assert.equal(s.selected.length, 0);
  s.instance.destroy();
});

test('anchor activation scrolls below sticky navigation, updates history, focuses without a second scroll, and calls the hook', () => {
  const s = setup(); const event = s.click(2);
  assert.equal(event.defaultPrevented, true);
  assert.deepEqual(s.calls, [['native', { top: 1020, behavior: 'smooth' }]]);
  assert.equal(s.win.location.hash, '#automations');
  assert.deepEqual(s.sections[2].focusOptions, { preventScroll: true });
  assert.deepEqual(s.selected, ['automations']);
  assert.equal(s.links[2].getAttribute('aria-current'), 'location');
  assert.equal(s.click(1, { ctrlKey: true }).defaultPrevented, false);
  assert.equal(s.calls.length, 1);
  s.instance.destroy();
});

test('keyboard anchor activation contains the click before Lenis can run its global anchor handler', () => {
  const s = setup({ scrollBridge: true });
  const event = s.click(1, { detail: 0 });
  assert.equal(event.cancelBubble, true, 'Lenis anchors must not perform a second unoffset scroll');
  assert.equal(s.calls.length, 1);
  assert.deepEqual(s.sections[1].focusOptions, { preventScroll: true });
  s.instance.destroy();
});

test('direct hashes and history changes restore immediately with safe unknown and malformed hashes', () => {
  const s = setup({ hash: '#creative-ai' });
  assert.deepEqual(s.calls[0], ['native', { top: 2520, behavior: 'instant' }]);
  assert.deepEqual(s.sections[5].focusOptions, { preventScroll: true });
  assert.equal(s.links[5].getAttribute('aria-current'), 'location');
  s.win.location.hash = '#our-work'; s.win.dispatchEvent(new Event('hashchange'));
  assert.equal(s.calls[1][1].top, 3020); assert.deepEqual(s.selected, ['creative-ai', 'our-work']);
  s.win.location.hash = '#%E0%A4%A'; s.win.dispatchEvent(new Event('hashchange'));
  s.win.location.hash = '#callback'; s.win.dispatchEvent(new Event('hashchange'));
  assert.equal(s.calls.length, 2); s.instance.destroy();
});

test('a direct hash is realigned after late hero pin layout without refocusing, and user input cancels restoration', () => {
  const s = setup({ hash: '#creative-ai' });
  s.sections[5].top = 20000;
  s.heroVideo.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(s.calls.at(-1)[1].top, 20020);
  assert.equal(s.sections[5].focusCount, 1);
  assert.deepEqual(s.selected, ['creative-ai']);
  s.win.dispatchEvent(new Event('wheel'));
  s.win.dispatchEvent(new Event('load')); s.heroVideo.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(s.calls.length, 2, 'later media must not restore a hash after user input');
  s.instance.destroy();
  const moved = setup({ hash: '#creative-ai' });
  moved.win.dispatchEvent(new Event('wheel'));
  moved.heroVideo.dispatchEvent(new Event('loadedmetadata')); moved.win.dispatchEvent(new Event('load'));
  assert.equal(moved.calls.length, 1, 'late media must not override the user scrolling');
  moved.instance.destroy();
});

test('direct hash survives pin expansion during alignment and a later refresh after Lenis dimensions update', () => {
  const s = setup({ hash: '#system-overview', scrollBridge: true, layoutEvents: true });
  const applied = [];
  let limit = 5000, expanded = false;
  s.win.AvantageScroll.scrollTo = (top, options) => {
    s.calls.push(['bridge', top, options]); applied.push(Math.min(limit, top));
    if (!expanded) { expanded = true; s.sections[0].top = 30467; }
  };
  s.heroVideo.dispatchEvent(new Event('loadedmetadata'));
  // ScrollTrigger completes the deferred pin expansion; its existing scroll
  // integration updates Lenis dimensions before the navigation correction frame.
  limit = 40000; s.win.ScrollTrigger.dispatchEvent(new Event('refresh'));
  s.flushFrames(); s.flushFrames();
  assert.equal(applied.at(-1), 30487);
  assert.equal(s.sections[0].focusCount, 1);
  assert.deepEqual(s.selected, ['system-overview']);
  s.sections[0].top = 33000;
  s.win.ScrollTrigger.dispatchEvent(new Event('refresh')); s.flushFrames();
  assert.equal(applied.at(-1), 33020, 'refresh after metadata remains eligible for correction');
  s.win.ScrollTrigger.dispatchEvent(new Event('refresh'));
  assert.equal(s.frames.size, 1);
  s.win.dispatchEvent(new Event('wheel'));
  assert.equal(s.frames.size, 0, 'manual input also cancels a queued correction');
  const count = s.calls.length;
  s.win.ScrollTrigger.dispatchEvent(new Event('refresh')); s.flushFrames();
  assert.equal(s.calls.length, count, 'manual scrolling cancels refresh restoration');
  s.instance.destroy();
});

test('observer delivery before and after final hash alignment cannot replace the selected chapter with its predecessor', () => {
  const s = setup({ hash: '#creative-ai', layoutEvents: true });
  const stale = [{ target: s.sections[4], isIntersecting: true }];
  s.observers[0].callback(stale);
  assert.equal(s.links[5].getAttribute('aria-current'), 'location');
  s.sections[5].top = 20000; s.heroVideo.dispatchEvent(new Event('loadedmetadata'));
  s.observers[0].callback(stale);
  s.win.ScrollTrigger.dispatchEvent(new Event('refresh')); s.flushFrames();
  assert.equal(s.links[5].getAttribute('aria-current'), 'location');
  s.observers[0].callback(stale);
  assert.equal(s.links[5].getAttribute('aria-current'), 'location');
  assert.equal(s.links[4].getAttribute('aria-current'), null);
  s.win.dispatchEvent(new Event('wheel'));
  s.observers[0].callback([{ target: s.sections[4], isIntersecting: false }, { target: s.sections[6], isIntersecting: true }]);
  assert.equal(s.links[6].getAttribute('aria-current'), 'location', 'manual navigation releases selection ownership');
  s.win.ScrollTrigger.dispatchEvent(new Event('refresh')); s.instance.destroy();
  assert.equal(s.frames.size, 0);
  const count = s.calls.length; s.flushFrames(); s.win.ScrollTrigger.dispatchEvent(new Event('refresh'));
  assert.equal(s.calls.length, count);
  const pending = setup({ hash: '#creative-ai', layoutEvents: true });
  pending.win.ScrollTrigger.dispatchEvent(new Event('refresh'));
  assert.equal(pending.frames.size, 1);
  pending.instance.destroy();
  assert.equal(pending.frames.size, 0, 'destruction cancels queued alignment');
  const destroyedCount = pending.calls.length;
  pending.flushFrames(); pending.win.ScrollTrigger.dispatchEvent(new Event('refresh'));
  assert.equal(pending.calls.length, destroyedCount, 'destroyed instances cannot react to refresh');
});

test('uses the existing Lenis bridge when available and respects reduced motion with native fallback', () => {
  const s = setup({ scrollBridge: true, reduced: true }); s.click(1);
  assert.deepEqual(s.calls[0], ['bridge', 520, { immediate: true }]); s.instance.destroy();
  const fallback = setup({ reduced: true, observer: false }); fallback.click(1);
  assert.deepEqual(fallback.calls[0], ['native', { top: 520, behavior: 'instant' }]); fallback.instance.destroy();
});

test('default offset measures the sticky bar and observers update state without moving focus', () => {
  const s = setup({ offset: undefined });
  // Explicitly omit offset so the bar height (64) plus breathing room (16) is measured.
  s.instance.destroy();
  s.instance = require('../dist/chapter-navigation.js').create(s.root);
  s.click(1); assert.equal(s.calls.at(-1)[1].top, 520);
  const observer = s.observers.at(-1); assert.equal(observer.targets.length, 7);
  assert.match(observer.options.rootMargin, /^-80px/);
  assert.equal(observer.options.rootMargin, '-80px 0px -540px 0px', 'activation band uses viewport height even on wide screens');
  const count = s.sections[2].focusCount || 0;
  s.win.dispatchEvent(new Event('wheel'));
  observer.callback([{ target: s.sections[2], isIntersecting: true }]);
  assert.equal(s.links[2].getAttribute('aria-current'), 'location');
  assert.equal(s.sections[2].focusCount || 0, count); s.instance.destroy();
});

test('a failed scene hook leaves chapter navigation usable and destruction removes listeners and observers', () => {
  const s = setup({ onSelect() { throw new Error('media unavailable'); } });
  assert.doesNotThrow(() => s.click(1)); assert.equal(s.calls.length, 1);
  s.instance.destroy(); s.instance.destroy();
  assert.equal(s.observers[0].disconnected, true);
  assert.equal(s.click(2).defaultPrevented, false);
  s.win.location.hash = '#our-work'; s.win.dispatchEvent(new Event('hashchange'));
  s.observers[0].callback([{ target: s.sections[3], isIntersecting: true }]);
  s.instance.setActive('our-work'); assert.equal(s.calls.length, 1);
  assert.equal(s.links[1].getAttribute('aria-current'), null);
});

test('deferred browser startup enhances links, publishes the scene coordination event, and releases its instance on page exit', () => {
  const s = setup(); s.instance.destroy();
  s.win.document = s.doc;
  s.win.CustomEvent = class extends Event { constructor(name, options) { super(name); this.detail = options.detail; } };
  const selected = [];
  s.doc.addEventListener('avantage:chapter-select', event => selected.push(event.detail.id));
  vm.runInNewContext(fs.readFileSync('dist/chapter-navigation.js', 'utf8'), { window: s.win });
  assert.equal(typeof s.win.AvantageChapterNav.create, 'function');
  s.click(3); assert.deepEqual(selected, ['custom-software']);
  assert.equal(s.calls.length, 1);
  const cached = new Event('pagehide'); cached.persisted = true; s.win.dispatchEvent(cached);
  s.click(4); assert.equal(s.calls.length, 2, 'bfcache keeps the enhancement alive');
  s.win.dispatchEvent(new Event('pagehide'));
  assert.equal(s.click(5).defaultPrevented, false);
  assert.equal(s.observers.at(-1).disconnected, true);
});

test('mobile navigation contains its own scroll and retains visible keyboard focus', () => {
  const css = fs.readFileSync('dist/connected-systems.css', 'utf8');
  const nav = css.match(/\.edition-navigation\s*\{([^}]+)\}/);
  assert.ok(nav); assert.match(nav[1], /position:\s*sticky/); assert.match(nav[1], /max-width:\s*100%/);
  const row = css.match(/\.edition-navigation-row\s*\{([^}]+)\}/);
  assert.ok(row); assert.match(row[1], /overflow-x:\s*auto/); assert.match(row[1], /overscroll-behavior-x:\s*contain/);
  assert.match(row[1], /flex-wrap:\s*nowrap/); assert.match(row[1], /min-width:\s*0/);
  assert.match(css, /\.edition-navigation a:focus-visible/);
});
