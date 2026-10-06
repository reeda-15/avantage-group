const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Target extends EventTarget {
  constructor() { super(); this.listeners = new Map(); }
  addEventListener(name, fn, options) { super.addEventListener(name, fn, options); if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name).add(fn); }
  removeEventListener(name, fn, options) { super.removeEventListener(name, fn, options); this.listeners.get(name)?.delete(fn); }
  count() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}
function setup() {
  const win = new Target(), doc = new Target(), motion = new Target();
  const calls = [], frames = new Map(), observers = []; let frameId = 0;
  const main = { id: 'connected-systems-main', getBoundingClientRect: () => ({ top: 200 }), focus: options => calls.push(['focus', options]) };
  const video = { pause: () => calls.push(['pause']) };
  const nav = { getBoundingClientRect: () => ({ height: 64 }) };
  doc.defaultView = win; doc.hidden = false; doc.readyState = 'complete';
  doc.querySelector = selector => selector === '.connected-systems-main' ? main : selector === '#journey' ? video : selector === '[data-chapter-nav]' ? nav : selector.includes('a[href=') ? { click() { calls.push(['map-click']); win.AvantageChapterNav.options.onSelect('automations'); } } : null;
  doc.querySelectorAll = () => []; doc.getElementById = id => id === main.id ? main : null;
  win.document = doc; win.scrollY = 50; win.location = { hash: '' }; win.history = { state: {}, pushState(state, unused, hash) { win.location.hash = hash; } };
  win.getComputedStyle = () => ({ top: '0' }); win.scrollTo = value => calls.push(['native', value]);
  win.matchMedia = () => motion;
  win.requestAnimationFrame = fn => { frames.set(++frameId, fn); return frameId; }; win.cancelAnimationFrame = id => frames.delete(id);
  win.ResizeObserver = class { constructor(fn) { this.callback = fn; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } };
  win.ScrollTrigger = new Target(); win.ScrollTrigger.refresh = () => { calls.push(['layout']); win.ScrollTrigger.dispatchEvent(new Event('refresh')); };
  win.AvantageScroll = { start() { calls.push(['scroll-start']); }, refresh() { calls.push(['resize']); }, destroy() { calls.push(['scroll-destroy']); } };
  for (const name of ['AvantageScenes', 'AvantageChapterNav', 'AvantageSystemMap', 'AvantageChapters', 'AvantageTransformation', 'AvantageCaseStudies', 'AvantageSystemBuilder']) {
    win[name] = { instance: { destroy() { calls.push(['old-destroy', name]); } }, create(root, options) {
      assert.equal(root, doc); calls.push(['create', name]); this.options = options;
      return { goTo: id => calls.push(['scene', id]), setActive: id => calls.push(['active', id]), activate: id => calls.push(['chapter', id]),
        refresh: () => calls.push(['chapter-refresh']), destroy: () => calls.push(['destroy', name]) };
    }, lookup: id => id === 'automations' ? { id: 'automations', chapterId: id } : null };
  }
  // This is the already running scene controller owned by the hero.
  win.AvantageScenes.instance.goTo = id => calls.push(['scene', id]);
  win.AvantageBrief = { applyRecommendation(root, result) { assert.equal(root, doc); calls.push(['brief', result]); return result.ok; } };
  const source = fs.existsSync('dist/connected-systems.js') ? fs.readFileSync('dist/connected-systems.js', 'utf8') : '';
  vm.runInNewContext(source, { window: win });
  function flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); }
  function event(target, name, values = {}) { const event = new Event(name, { cancelable: true }); Object.assign(event, values); target.dispatchEvent(event); return event; }
  return { win, doc, calls, frames, observers, main, flush, event };
}

test('coordinator adopts the hero scene controller and replaces all standalone component owners exactly once', () => {
  const s = setup(); assert.equal(typeof s.win.AvantageConnectedSystems?.start, 'function');
  const instance = s.win.AvantageConnectedSystems.start(); assert.equal(s.win.AvantageConnectedSystems.start(), instance);
  assert.equal(s.calls.filter(call => call[0] === 'create').length, 6);
  assert.equal(s.calls.filter(call => call[0] === 'old-destroy').length, 6);
  assert.ok(!s.calls.some(call => call[1] === 'AvantageScenes'), 'the hero scene is adopted without a second factory');
  s.win.AvantageChapterNav.options.onSelect('automations');
  assert.deepEqual(s.calls.slice(-2), [['scene', 'automations'], ['chapter', 'automations']]);
  s.win.AvantageSystemMap.options.onSelect('connect', 'automations');
  assert.ok(s.calls.some(call => call[0] === 'map-click'));
  assert.equal(s.win.AvantageSystemBuilder.options.onContinue({ ok: false }), false);
  assert.equal(s.win.AvantageSystemBuilder.options.onContinue({ ok: true }), true);
  instance.destroy();
});

test('layout refresh is coalesced and destroy removes resources; restart and cached page restore are safe', () => {
  const s = setup(); assert.ok(s.win.AvantageConnectedSystems, 'coordinator exists');
  const instance = s.win.AvantageConnectedSystems.start(); s.flush(); s.calls.length = 0;
  s.event(s.doc, 'load'); s.event(s.doc, 'loadedmetadata'); s.observers[0].callback([]);
  assert.equal(s.frames.size, 1); s.flush(); assert.equal(s.calls.filter(call => call[0] === 'layout').length, 1);
  s.event(s.win, 'pagehide', { persisted: true }); assert.ok(!s.calls.some(call => call[0] === 'destroy'));
  s.event(s.win, 'pageshow', { persisted: true }); s.flush();
  s.event(s.doc, 'load'); instance.destroy(); instance.destroy();
  assert.equal(s.frames.size, 0); assert.equal(s.doc.count(), 0); assert.equal(s.win.count(), 0);
  assert.ok(s.observers.every(observer => observer.disconnected));
  assert.equal(s.calls.filter(call => call[0] === 'destroy').length, 6);
  assert.equal(s.calls.filter(call => call[0] === 'old-destroy' && call[1] === 'AvantageScenes').length, 1);
  const before = s.calls.length; instance.refresh(); s.observers[0].callback([]); assert.equal(s.calls.length, before);
  const next = s.win.AvantageConnectedSystems.start(); assert.notEqual(next, instance);
  assert.equal(s.calls.filter(call => call[0] === 'create' && call[1] === 'AvantageScenes').length, 1);
  next.destroy();
});

test('skip navigation uses immediate scrolling and focus without a competing native or Lenis anchor jump', () => {
  const s = setup(); assert.ok(s.win.AvantageConnectedSystems, 'coordinator exists');
  const instance = s.win.AvantageConnectedSystems.start();
  const link = { getAttribute: () => '#connected-systems-main', closest: () => null };
  // Event.target is native/read-only, so dispatch from the document with an own getter.
  const event = new Event('click', { cancelable: true }); Object.defineProperty(event, 'target', { value: { closest: () => link } });
  s.doc.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true); assert.equal(s.win.location.hash, '#connected-systems-main');
  assert.equal(s.calls.filter(call => call[0] === 'focus' && call[1].preventScroll === true).length, 1);
  assert.ok(s.calls.some(call => call[0] === 'native' && call[1].behavior === 'instant'));
  instance.destroy();
});

test('smooth scroll has reversible lifecycle with active libraries or native behavior when GSAP or Lenis is missing', () => {
  for (const missing of [null, 'gsap', 'Lenis']) {
    const win = new Target(), motion = new Target(); const ticks = new Set(); let destroyed = 0;
    win.gsap = { registerPlugin() {}, ticker: { add: fn => ticks.add(fn), remove: fn => ticks.delete(fn), lagSmoothing() {} } };
    win.ScrollTrigger = { update() {}, addEventListener() {}, removeEventListener() {} };
    win.Lenis = class { on() {} raf() {} resize() {} scrollTo(top) { win.lastScroll = { top }; } destroy() { destroyed++; } };
    delete win[missing]; win.scrollTo = value => { win.lastScroll = value; };
    vm.runInNewContext(fs.readFileSync('dist/smooth-scroll.js', 'utf8'), { window: win, document: { querySelector: () => ({}) }, matchMedia: () => motion });
    const api = win.AvantageScroll;
    assert.equal(typeof api.destroy, 'function'); api.scrollTo(400, { immediate: true }); assert.equal(win.lastScroll.top, 400);
    api.destroy(); assert.equal(win.count(), 0); assert.equal(motion.count(), 0); assert.equal(ticks.size, 0);
    api.start(); api.start(); assert.equal(win.count(), 2); assert.equal(ticks.size, missing ? 0 : 1);
    motion.matches = true; motion.dispatchEvent(new Event('change')); assert.equal(ticks.size, 0);
    api.destroy(); assert.equal(destroyed, missing ? 0 : 2);
  }
});

test('real standalone navigation releases its pagehide listener during coordinator takeover', () => {
  const win = new Target(), doc = new Target(), nav = new Target();
  nav.querySelectorAll = () => []; nav.getBoundingClientRect = () => ({ height: 64 });
  doc.defaultView = win; doc.querySelector = () => nav; doc.getElementById = () => null;
  win.document = doc; win.location = { hash: '' }; win.matchMedia = () => ({ matches: false });
  vm.runInNewContext(fs.readFileSync('dist/chapter-navigation.js', 'utf8'), { window: win });
  assert.equal(win.listeners.get('pagehide').size, 1);
  win.AvantageChapterNav.instance.destroy();
  assert.equal(win.count(), 0); assert.equal(nav.count(), 0);
});

test('skip and contextual destinations remain aligned after late hero pin layout without repeated focus or history', () => {
  for (const id of ['connected-systems-main', 'callback']) {
    const s = setup(); let top = 200, histories = 0;
    const target = { id, getBoundingClientRect: () => ({ top }), focus: options => s.calls.push(['focus', options]) };
    s.doc.getElementById = requested => requested === id ? target : null;
    s.win.history.pushState = (state, unused, hash) => { histories++; s.win.location.hash = hash; };
    const click = new Event('click', { cancelable: true });
    Object.defineProperty(click, 'target', { value: { closest: () => ({ getAttribute: name => name === 'href' ? '#' + id : null }) } });
    s.doc.dispatchEvent(click); s.flush(); s.flush();
    const initialScrolls = s.calls.filter(call => call[0] === 'native').length;
    // Simulate delayed metadata expanding the hero's pin spacer during refresh.
    const originalRefresh = s.win.ScrollTrigger.refresh;
    s.win.ScrollTrigger.refresh = () => { top = 6200; originalRefresh(); };
    s.event(s.doc, 'loadedmetadata'); s.flush(); s.flush();
    assert.ok(s.calls.filter(call => call[0] === 'native').length > initialScrolls);
    assert.equal(s.calls.filter(call => call[0] === 'native').at(-1)[1].top, id === 'callback' ? 6170 : 6250);
    assert.equal(s.calls.filter(call => call[0] === 'native').at(-1)[1].behavior, 'instant');
    assert.equal(s.calls.filter(call => call[0] === 'focus').length, 1); assert.equal(histories, 1);
    // A completed refresh initiated outside the coordinator also realigns.
    top = 7200; s.win.ScrollTrigger.dispatchEvent(new Event('refresh')); s.flush();
    assert.equal(s.calls.filter(call => call[0] === 'native').at(-1)[1].top, id === 'callback' ? 7170 : 7250);
    const count = s.calls.filter(call => call[0] === 'native').length;
    s.event(s.win, 'wheel'); top = 8200; s.win.ScrollTrigger.dispatchEvent(new Event('refresh')); s.flush();
    assert.equal(s.calls.filter(call => call[0] === 'native').length, count, 'fresh input owns scrolling');
    s.win.AvantageConnectedSystems.start().destroy(); assert.equal(s.win.ScrollTrigger.count(), 0);
  }
});
