const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Node has no browser DOM or decoder. These doubles expose the media/DOM boundary;
// the real scene controller runs unchanged and owns every observable side effect.
class Element extends EventTarget {
  constructor(tag = 'div') {
    super(); this.tagName = tag.toUpperCase(); this.children = []; this.attributes = new Map();
    this.dataset = {}; this.style = {}; this.hidden = false;
    const classes = new Set();
    this.classList = { add: (...xs) => xs.forEach(x => classes.add(x)),
      remove: (...xs) => xs.forEach(x => classes.delete(x)), contains: x => classes.has(x) };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  appendChild(child) { child.parentNode?.removeChild(child); this.children.push(child); child.parentNode = this; return child; }
  removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; }
  insertBefore(child, next) {
    if (!next) return this.appendChild(child);
    child.parentNode?.removeChild(child); this.children.splice(this.children.indexOf(next), 0, child); child.parentNode = this;
  }
  get nextSibling() { return this.parentNode?.children[this.parentNode.children.indexOf(this) + 1] ?? null; }
  remove() { this.parentNode?.removeChild(this); }
}

function setup({ mobile = false, reduced = false, noVideo = false, records } = {}) {
  const root = new Element(); const stage = new Element(); const next = new Element('canvas');
  const video = new Element('video');
  video.readyState = 0; video.duration = NaN; video.currentTime = 0; video.paused = true;
  video.pause = () => { video.paused = true; };
  video.play = () => { video.paused = false; return Promise.resolve(); };
  video.load = () => { video.loads = (video.loads || 0) + 1; video.readyState = 0; video.duration = NaN; };
  Object.defineProperty(video, 'src', { get() { return this.getAttribute('src') || ''; }, set(value) { this.setAttribute('src', value); } });
  video.setAttribute('poster', 'assets/cinematic-v2/poster-hd.jpg'); video.setAttribute('preload', 'auto');
  video.setAttribute('autoplay', ''); video.style.opacity = '0';
  const mobileSource = new Element('source'); mobileSource.setAttribute('media', '(max-width: 800px)');
  mobileSource.setAttribute('src', 'assets/cinematic-v2/avantage-journey-mobile.mp4?v=2');
  const desktopSource = new Element('source'); desktopSource.setAttribute('src', 'assets/cinematic-v2/avantage-journey-web.mp4');
  video.appendChild(mobileSource); video.appendChild(desktopSource);
  video.querySelectorAll = selector => selector === 'source' ? [mobileSource, desktopSource] : [];
  stage.appendChild(video); stage.appendChild(next); root.appendChild(stage);
  const slots = ['intro', 'agents', 'automations', 'software', 'insights', 'creative', 'work', 'finale'].map(id => {
    const slot = new Element(); slot.dataset.scene = id; slot.appendChild(new Element('img'));
    slot.querySelector = selector => selector === '.scene-poster' ? slot.children.find(child => child.tagName === 'IMG') : null;
    root.appendChild(slot); return slot;
  });
  const links = []; const observers = [];
  const motion = new EventTarget(); motion.matches = reduced;
  const viewport = new EventTarget(); viewport.matches = mobile;
  const win = { CustomEvent, matchMedia: query => query.includes('reduced-motion') ? motion : viewport,
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); }
      observe(target) { this.targets.push(target); }
      disconnect() { this.targets = []; this.disconnected = true; }
    } };
  const doc = { defaultView: win, head: new Element('head'), createElement(tag) {
    assert.notEqual(tag, 'video', 'controller must reuse the existing video, not create another decoder');
    const element = new Element(tag); if (tag === 'link') links.push(element); return element;
  } };
  root.ownerDocument = doc;
  root.querySelector = selector => selector === '#journey' ? (noVideo ? null : video) : null;
  root.querySelectorAll = selector => selector === '[data-scene]' ? slots : [];
  const events = [];
  for (const name of ['enter', 'hold', 'exit', 'release']) root.addEventListener(`avantage:scene-${name}`, event => events.push({ name, detail: event.detail }));
  vm.runInNewContext(fs.readFileSync('dist/cinematic-scenes.js', 'utf8'), { window: win, setTimeout, clearTimeout });
  const api = win.AvantageScenes;
  const instance = api.create(root, { scenes: records });
  const fire = (name, time) => { if (time !== undefined) video.currentTime = time; video.dispatchEvent(new Event(name)); };
  const ready = () => { video.readyState = 2; video.duration = 10; fire('loadedmetadata'); fire('loadeddata'); };
  return { api, instance, root, stage, next, video, slots, links, events, motion, viewport, observers, fire, ready };
}

function fixtures() {
  return ['intro', 'agents', 'automations', 'software', 'insights', 'creative', 'work', 'finale'].map((id, i) => ({
    id, chapterId: ['stage', 'ai-agents', 'automations', 'custom-software', 'data-insights', 'creative-ai', 'our-work', 'systems-finale'][i],
    srcDesktop: `/media/${id}.mp4`, srcMobile: `/media/${id}-mobile.mp4`, poster: `/posters/${id}.jpg`,
    startFrame: 24, holdFrame: 48, exitFrame: 72
  }));
}

test('scene module exists', () => assert.ok(fs.existsSync('dist/cinematic-scenes.js'), 'missing cinematic scene controller'));

test('the eight scene lookups map uniquely to the approved chapter targets', () => {
  const { scenes, lookup, validate } = require('../dist/cinematic-scenes.js');
  assert.deepEqual(scenes.map(scene => [scene.id, scene.chapterId]), [
    ['intro', 'stage'], ['agents', 'ai-agents'], ['automations', 'automations'], ['software', 'custom-software'],
    ['insights', 'data-insights'], ['creative', 'creative-ai'], ['work', 'our-work'], ['finale', 'systems-finale']
  ]);
  assert.equal(validate(scenes).length, 8);
  assert.equal(lookup('ai-agents').id, 'agents'); assert.equal(lookup('unknown'), null);
  for (const scene of scenes) assert.ok(scene.startFrame <= scene.holdFrame && scene.holdFrame <= scene.exitFrame);
  assert.throws(() => validate([{ ...fixtures()[0], holdFrame: 12 }]), /frame/i);
  assert.throws(() => validate([fixtures()[0], { ...fixtures()[1], chapterId: 'stage' }]), /chapter/i);
  assert.throws(() => validate([fixtures()[0], { ...fixtures()[1], id: 'intro' }]), /id/i);
  assert.throws(() => validate([{ ...fixtures()[0], startFrame: NaN }]), /frame/i);
});

test('one existing video swaps sources and emits ordered enter, hold and exit details', () => {
  const s = setup({ records: fixtures() });
  try {
    assert.equal(s.video.parentNode, s.stage, 'creation leaves the stable hero in place');
    assert.equal(s.instance.goTo('agents'), true); s.ready();
    assert.equal(s.video.parentNode, s.slots[1]); assert.equal(s.video.src, '/media/agents.mp4');
    assert.equal(s.slots[1].children[0].getAttribute('src'), '/posters/agents.jpg', 'each source swap must use its matching poster');
    assert.equal(s.video.currentTime, 1); s.fire('timeupdate', 2);
    assert.equal(s.video.paused, true); s.fire('timeupdate', 3);
    assert.equal(s.instance.goTo('automations'), true); s.ready();
    assert.equal(s.video.parentNode, s.slots[2]); assert.equal(s.slots[1].children.length, 1);
    assert.deepEqual(s.events.map(event => event.name), ['enter', 'hold', 'exit', 'enter']);
    assert.deepEqual(JSON.parse(JSON.stringify(s.events[1].detail)), { id: 'agents', chapterId: 'ai-agents' });
    assert.equal(s.instance.goTo('unknown'), false); assert.equal(s.video.src, '/media/automations.mp4');
  } finally { s.instance.destroy(); }
});

test('preloading is restricted to the immediate next scene and replaces the prior hint', () => {
  const s = setup({ records: fixtures() });
  try {
    assert.equal(s.instance.preload('creative'), false); assert.equal(s.links.length, 0);
    s.instance.goTo('agents');
    assert.equal(s.links.filter(link => link.parentNode).length, 1);
    assert.equal(s.links[0].href, '/media/automations.mp4');
    assert.equal(s.instance.preload('finale'), false);
    s.instance.goTo('software');
    assert.equal(s.links.filter(link => link.parentNode).length, 1);
    assert.equal(s.links.at(-1).href, '/media/insights.mp4');
    s.instance.goTo('finale'); assert.equal(s.links.filter(link => link.parentNode).length, 0);
  } finally { s.instance.destroy(); }
});

test('mobile sources load only for the current scene and its next hint', () => {
  const s = setup({ mobile: true, records: fixtures() });
  try {
    s.instance.goTo('agents'); assert.equal(s.video.src, '/media/agents-mobile.mp4');
    assert.equal(s.links[0].href, '/media/automations-mobile.mp4');
    s.viewport.matches = false; s.viewport.dispatchEvent(new Event('change'));
    assert.equal(s.video.src, '/media/agents.mp4');
    assert.equal(s.links.at(-1).href, '/media/automations.mp4');
  } finally { s.instance.destroy(); }
});

test('failed or missing scenes retain the poster and readable content and clear pending downloads', () => {
  const s = setup({ records: fixtures() });
  try {
    s.instance.goTo('agents'); s.fire('error');
    assert.equal(s.slots[1].classList.contains('scene-fallback'), true);
    assert.equal(s.video.hidden, true); assert.equal(s.video.paused, true);
    assert.equal(s.video.getAttribute('src'), null);
    assert.equal(s.links.filter(link => link.parentNode).length, 0);
    assert.equal(s.slots[1].hidden, false);
    assert.deepEqual(s.events.map(event => event.name), ['enter', 'hold']);
    s.instance.goTo('automations'); s.ready(); assert.equal(s.video.hidden, false);
  } finally { s.instance.destroy(); }
  const missing = setup({ noVideo: true });
  missing.instance.goTo('agents'); assert.equal(missing.slots[1].classList.contains('scene-fallback'), true); missing.instance.destroy();
});

test('reduced motion uses posters with no media fetch or preload and responds to preference changes', () => {
  const s = setup({ reduced: true, records: fixtures() });
  try {
    s.instance.goTo('agents');
    assert.equal(s.video.loads || 0, 0); assert.equal(s.video.parentNode, s.stage);
    assert.equal(s.slots[1].classList.contains('scene-fallback'), true); assert.equal(s.links.length, 0);
    s.motion.matches = false; s.motion.dispatchEvent(new Event('change'));
    assert.equal(s.video.src, '/media/agents.mp4'); s.ready();
    s.motion.matches = true; s.motion.dispatchEvent(new Event('change'));
    assert.equal(s.video.paused, true); assert.equal(s.video.getAttribute('src'), null);
    assert.equal(s.links.filter(link => link.parentNode).length, 0);
  } finally { s.instance.destroy(); }
});

test('intro retries the local production fallback once, then uses its poster if both clips fail', () => {
  const s = setup();
  try {
    s.instance.goTo('intro'); assert.match(s.video.src, /connected-intro-kling\.mp4$/);
    s.fire('error'); assert.equal(s.video.src, 'assets/cinematic-v2/avantage-journey-web.mp4');
    s.fire('error'); assert.equal(s.video.getAttribute('src'), null);
    assert.equal(s.slots[0].classList.contains('scene-fallback'), true);
    assert.deepEqual(s.events.map(event => event.name), ['enter', 'hold']);
  } finally { s.instance.destroy(); }
});

test('stalled media yields to readable poster content and cleanup cancels the watchdog', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const s = setup({ records: fixtures() });
  s.instance.goTo('agents'); t.mock.timers.tick(15001);
  assert.equal(s.slots[1].classList.contains('scene-fallback'), true);
  s.instance.goTo('automations'); s.instance.destroy();
  const count = s.events.length; t.mock.timers.tick(15001); assert.equal(s.events.length, count);
});

test('observer exit and destroy restore the original hero and remove listeners, hints and observers', () => {
  const s = setup({ records: fixtures() });
  assert.equal(s.observers[0].targets.length, 8);
  s.observers[0].callback([{ target: s.slots[1], isIntersecting: true, intersectionRatio: .8 }]);
  assert.equal(s.video.parentNode, s.slots[1]);
  s.observers[0].callback([{ target: s.slots[1], isIntersecting: false, intersectionRatio: 0 }]);
  assert.equal(s.video.parentNode, s.stage); assert.equal(s.video.nextSibling, s.next);
  assert.equal(s.video.getAttribute('src'), null); assert.equal(s.video.getAttribute('preload'), 'auto');
  assert.equal(s.events.at(-1).name, 'release');
  s.instance.goTo('agents'); s.instance.destroy(); s.instance.destroy();
  assert.equal(s.observers[0].disconnected, true); assert.equal(s.links.filter(link => link.parentNode).length, 0);
  assert.equal(s.video.parentNode, s.stage); assert.equal(s.video.style.opacity, '0');
  const count = s.events.length; s.fire('error'); s.motion.dispatchEvent(new Event('change'));
  s.viewport.dispatchEvent(new Event('change')); assert.equal(s.events.length, count);
  assert.equal(s.instance.goTo('agents'), false);
});

test('the page loads the spine without adding a second video or temporary asset URL', () => {
  const html = fs.readFileSync('dist/cinematic-preview.html', 'utf8');
  assert.equal((html.match(/<video\b/g) || []).length, 1);
  assert.match(html, /<script defer src="cinematic-scenes\.js/);
  assert.match(html, /href="cinematic-scenes\.css/);
  assert.equal((html.match(/data-scene="/g) || []).length, 8);
  assert.doesNotMatch(html, /cloudfront\.net/);
  assert.ok(fs.statSync('dist/assets/cinematic-v2/connected-intro-kling.mp4').size > 1000000);
  const { scenes } = require('../dist/cinematic-scenes.js');
  assert.equal(scenes[0].srcDesktop, 'assets/cinematic-v2/connected-intro-kling.mp4');
  assert.equal(scenes[0].srcMobile, 'assets/cinematic-v2/connected-intro-kling.mp4');
});

function attachHero(s) {
  const controls = new Map(['#position', '#time', '#notice', '#instruction', 'header'].map(id => [id, new Element()]));
  const canvas = new Element('canvas'); const paints = [];
  canvas.getContext = () => ({ drawImage: (...args) => paints.push(args) });
  controls.set('#picture', canvas); controls.get('#position').value = '0';
  s.root.querySelector = selector => selector === '#journey' ? s.video : selector === '.stage' ? s.stage : controls.get(selector);
  const winEvents = new EventTarget(); const win = s.root.ownerDocument.defaultView;
  const timelines = [];
  const gsap = { registerPlugin() {}, timeline() {
    const timeline = { pinActive: true, killed: false, scrollTrigger: { kill(revert) {
      timeline.pinActive = false; timeline.revert = revert;
    } }, kill() { this.killed = true; }, fromTo() {} };
    timelines.push(timeline); return timeline;
  } };
  win.gsap = gsap; win.ScrollTrigger = {};
  win.AvantageScenes.create = () => s.instance;
  vm.runInNewContext(fs.readFileSync('dist/cinematic-preview.js', 'utf8'), {
    window: win, document: s.root, matchMedia: win.matchMedia,
    CinematicTime: require('../dist/cinematic-time.js'), CinematicStory: require('../dist/cinematic-story.js'),
    gsap, ScrollTrigger: win.ScrollTrigger, innerHeight: 900,
    setTimeout, clearTimeout, addEventListener: winEvents.addEventListener.bind(winEvents),
    removeEventListener: winEvents.removeEventListener.bind(winEvents), requestAnimationFrame: callback => callback()
  });
  return { paints, winEvents, timelines };
}

test('hero decoder yields to modular playback and resumes from the original source after release', () => {
  const s = setup({ reduced: true, records: fixtures() });
  const { paints, winEvents, timelines } = attachHero(s);
  try {
    s.motion.matches = false; s.motion.dispatchEvent(new Event('change'));
    assert.equal(timelines.length, 1);
    s.instance.goTo('agents'); s.ready();
    assert.equal(s.video.currentTime, 1, 'hero seeker must not overwrite scene start');
    s.fire('playing'); assert.equal(s.video.paused, false, 'hero autoplay handler must not pause the modular clip');
    assert.equal(paints.length, 0, 'scene frames must not paint over the stable hero canvas');
    s.observers[0].callback([{ target: s.slots[1], isIntersecting: false, intersectionRatio: 0 }]);
    s.video.readyState = 2; s.video.duration = 31.479167;
    s.fire('loadedmetadata'); s.fire('loadeddata');
    assert.ok(paints.length > 0, 'restored hero decoder resumes rendering');
    assert.equal(timelines.length, 1, 'media restoration must preserve the existing hero pin and timeline');
  } finally { winEvents.dispatchEvent(new Event('pagehide')); s.instance.destroy(); }
});

test('reduced motion removes the hero pin immediately while a scene owns the video', () => {
  const s = setup({ reduced: true, records: fixtures() });
  const { winEvents, timelines } = attachHero(s);
  try {
    s.motion.matches = false; s.motion.dispatchEvent(new Event('change'));
    assert.equal(timelines[0].pinActive, true);
    s.instance.goTo('agents'); s.ready(); assert.equal(s.video.parentNode, s.slots[1]);
    s.motion.matches = true; s.motion.dispatchEvent(new Event('change'));
    assert.equal(timelines[0].pinActive, false, 'reduced motion must remove the pin before scene release');
    assert.equal(timelines[0].revert, true, 'pin removal must revert its document layout');
    assert.equal(timelines[0].killed, true, 'the old timeline must stop immediately');
    assert.equal(s.video.parentNode, s.slots[1], 'the video is still borrowed during this assertion');
    assert.equal(s.video.paused, true); assert.equal(s.video.getAttribute('src'), null);
    assert.equal(s.slots[1].classList.contains('scene-fallback'), true);
    s.motion.matches = false; s.motion.dispatchEvent(new Event('change')); s.ready();
    assert.equal(timelines.length, 1, 'restoring motion must defer the hero pin while a scene is active');
    s.observers[0].callback([{ target: s.slots[1], isIntersecting: false, intersectionRatio: 0 }]);
    s.video.readyState = 2; s.video.duration = 31.479167; s.fire('loadedmetadata'); s.fire('loadeddata');
    assert.equal(timelines.length, 2, 'hero restoration must rebuild a timeline invalidated during scene ownership');
    assert.equal(timelines[1].pinActive, true);
  } finally { winEvents.dispatchEvent(new Event('pagehide')); s.instance.destroy(); }
});

test('agents to automations and destroy clear all scene classes from departing slots', () => {
  const states = ['scene-enter', 'scene-ready', 'scene-hold', 'scene-exit', 'content-to-video', 'video-to-content', 'scene-fallback'];
  for (const phase of ['loading', 'hold', 'fallback']) {
    const s = setup({ records: fixtures() });
    s.slots.forEach(slot => slot.classList.add('chapter-transition'));
    try {
      s.instance.goTo('agents');
      if (phase === 'hold') { s.ready(); s.fire('timeupdate', 2); }
      if (phase === 'fallback') s.fire('error');
      s.instance.goTo('automations');
      for (const state of states) assert.equal(s.slots[1].classList.contains(state), false, `${phase}: departing agents retains ${state}`);
      s.instance.destroy();
      for (const slot of s.slots) {
        for (const state of states) assert.equal(slot.classList.contains(state), false, `${phase}: destroy leaves ${state} on ${slot.dataset.scene}`);
        assert.equal(slot.classList.contains('chapter-transition'), true, 'cleanup must preserve the base presentation class');
      }
    } finally { s.instance.destroy(); }
  }
});
