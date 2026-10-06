const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync('dist/cinematic-preview.html', 'utf8');
const tags = (source, name) => [...source.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'g'))].map(match => attributes(match[1]));
function attributes(source) {
  return Object.fromEntries([...source.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)].map(match => [match[1], match[2] ?? '']));
}
function localAsset(url) {
  assert.ok(url && !/^(?:[a-z]+:|\/\/)/i.test(url), `expected a local asset: ${url}`);
  const filename = path.resolve('dist', url.split(/[?#]/)[0]);
  assert.ok(filename.startsWith(path.resolve('dist') + path.sep), `asset escaped dist: ${url}`);
  assert.ok(fs.statSync(filename).isFile(), `missing local asset: ${url}`);
}
function checkImages(source) {
  const images = tags(source.slice(source.indexOf('<main')), 'img');
  assert.ok(images.length >= 11, 'eight scene posters and three case images remain in the document');
  for (const image of images) {
    assert.equal(image.loading, 'lazy', `${image.src} must not compete with the hero`);
    assert.equal(image.decoding, 'async', `${image.src} must not block presentation`);
    assert.ok(Number(image.width) > 0 && Number(image.height) > 0, `${image.src} needs reserved dimensions`);
    localAsset(image.src);
  }
}
function checkScripts(source) {
  const scripts = tags(source, 'script');
  assert.ok(scripts.length > 0);
  for (const script of scripts) {
    assert.ok(Object.hasOwn(script, 'defer'), `${script.src} blocks HTML parsing`);
    assert.ok(!Object.hasOwn(script, 'async'), `${script.src} loses dependency ordering`);
    localAsset(script.src);
  }
}
function checkPoster(source) {
  const videos = tags(source, 'video');
  assert.equal(videos.length, 1, 'the hero and interludes share one decoder');
  localAsset(videos[0].poster);
  assert.equal(videos[0]['aria-hidden'], 'true');
  const sources = tags(source, 'source');
  assert.equal(sources.length, 2, 'only the stable mobile and desktop hero streams are eagerly discoverable');
  sources.forEach(item => localAsset(item.src));
  assert.ok(!tags(source, 'link').some(item => item.as === 'video'), 'interludes must not preload from static HTML');
}

test('below-fold imagery stays lazy, asynchronous, dimensioned and locally available', () => checkImages(html));
test('every startup script is local and deferred in document order', () => checkScripts(html));
test('the single hero retains a local poster without eager interlude downloads', () => checkPoster(html));

test('the edition adds no runtime package or remotely hosted startup dependency', () => {
  const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.deepEqual(Object.keys(manifest.dependencies || {}), ['gsap']);
  assert.deepEqual(Object.keys(manifest.optionalDependencies || {}), []);
  for (const stylesheet of tags(html, 'link').filter(item => item.rel === 'stylesheet')) localAsset(stylesheet.href);
});

test('fallback chapters, cases, qualifier and contact destinations are present before scripts execute', () => {
  const ids = tags(html, '[a-z][a-z0-9-]*').filter(item => item.id).map(item => item.id);
  assert.equal(new Set(ids).size, ids.length, 'native fragment destinations must be unique');
  const sections = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)];
  for (const id of ['system-overview', 'ai-agents', 'automations', 'custom-software', 'data-insights',
    'creative-ai', 'system-transformation', 'our-work', 'build-your-system', 'systems-finale', 'callback', 'brief']) {
    const section = sections.find(match => attributes(match[1]).id === id);
    assert.ok(section, `missing readable ${id} section`);
    assert.ok(!Object.hasOwn(attributes(section[1]), 'hidden'), `${id} must be readable without enhancement`);
    assert.match(section[2], /<h2\b/);
    assert.match(section[2], /<p\b/);
  }
  for (const link of tags(html, 'a')) {
    if (link.href?.startsWith('#')) assert.ok(ids.includes(link.href.slice(1)), `broken native destination: ${link.href}`);
    else if (link.href && !/^[a-z]+:/i.test(link.href)) localAsset(link.href);
  }
  const panels = tags(html, 'article').filter(item => Object.hasOwn(item, 'data-case-panel'));
  assert.equal(panels.length, 3);
  panels.forEach(panel => assert.ok(!Object.hasOwn(panel, 'hidden'), 'case detail remains readable without scripts'));
  assert.match(html, /<fieldset[^>]+data-builder-problems[^>]*disabled/);
  assert.match(html, /<noscript><p>Describe any of these needs/);
  const links = tags(html, 'a').map(link => link.href);
  assert.ok(links.includes('mailto:contact@avantageai.com'), 'email must remain actionable while online submission is unavailable');
  assert.ok(links.includes('tel:+919270856871'), 'phone must remain actionable while online submission is unavailable');
  for (const form of [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)]) {
    const submits = tags(form[1], 'button').filter(item => item.type === 'submit');
    assert.ok(submits.length);
    submits.forEach(button => assert.ok(Object.hasOwn(button, 'disabled'), 'fallback must not suggest an available backend'));
  }
});

// The media element and document are browser boundaries. The real scene module
// controls source assignment, preload hints, fallback states and teardown.
function sceneHarness({ mobile = false, reduced = false, source } = {}) {
  class Element extends EventTarget {
    constructor() {
      super(); this.children = []; this.attrs = new Map(); this.style = {}; this.dataset = {}; this.hidden = false;
      const classes = new Set(); this.classList = { add: (...values) => values.forEach(value => classes.add(value)),
        remove: (...values) => values.forEach(value => classes.delete(value)), contains: value => classes.has(value) };
    }
    getAttribute(name) { return this.attrs.get(name) ?? null; }
    setAttribute(name, value) { this.attrs.set(name, String(value)); }
    removeAttribute(name) { this.attrs.delete(name); }
    appendChild(child) { child.remove(); this.children.push(child); child.parentNode = this; return child; }
    insertBefore(child) { return this.appendChild(child); }
    remove() { if (this.parentNode) this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; }
  }
  const root = new Element(), stage = new Element(), video = new Element(), head = new Element();
  const loads = [];
  video.pause = () => { video.paused = true; };
  video.play = () => { video.paused = false; return Promise.resolve(); };
  video.load = () => loads.push(video.getAttribute('src'));
  video.querySelectorAll = () => [];
  Object.defineProperty(video, 'src', { set(value) { this.setAttribute('src', value); } });
  stage.appendChild(video); video.setAttribute('poster', 'hero.jpg');
  const ids = ['intro', 'agents', 'automations', 'software', 'insights', 'creative', 'work', 'finale'];
  const records = ids.map(id => ({ id, chapterId: `chapter-${id}`, srcDesktop: `/desktop/${id}.mp4`,
    srcMobile: `/mobile/${id}.mp4`, poster: `/posters/${id}.jpg`, startFrame: 0, holdFrame: 24, exitFrame: 48 }));
  const slots = ids.map(id => { const slot = new Element(); slot.dataset.scene = id;
    const poster = new Element(); slot.appendChild(poster); slot.querySelector = () => poster; return slot; });
  const motion = new EventTarget(); motion.matches = reduced;
  const win = { CustomEvent, matchMedia: query => query.includes('reduced-motion') ? motion : { matches: mobile } };
  const doc = { defaultView: win, head, createElement(tag) { assert.equal(tag, 'link', 'never allocate another video'); return new Element(); } };
  root.ownerDocument = doc; root.querySelector = () => video; root.querySelectorAll = () => slots;
  vm.runInNewContext(source || fs.readFileSync('dist/cinematic-scenes.js', 'utf8'), { window: win, setTimeout, clearTimeout });
  return { instance: win.AvantageScenes.create(root, { scenes: records }), loads, slots, video, head, ids };
}

test('phone and desktop scene traversal fetch only the active clip and immediate next hint', () => {
  for (const mobile of [true, false]) {
    const s = sceneHarness({ mobile });
    try {
      assert.deepEqual(s.loads, []); assert.equal(s.head.children.length, 0);
      const directory = mobile ? '/mobile' : '/desktop';
      for (const [index, id] of s.ids.entries()) {
        s.instance.goTo(id);
        assert.equal(s.loads.at(-1), `${directory}/${id}.mp4`);
        assert.equal(s.loads.filter(Boolean).length, index + 1, 'only one active source loads per selection');
        assert.deepEqual(s.head.children.map(link => link.getAttribute('href')),
          index < 7 ? [`${directory}/${s.ids[index + 1]}.mp4`] : []);
        assert.equal(s.instance.preload(id), false, 'current or earlier scenes cannot be eagerly fetched');
        assert.equal(s.slots[index].hidden, false);
        assert.equal(s.video.hidden, true, 'slow media retains its poster until decoding succeeds');
      }
    } finally { s.instance.destroy(); }
    assert.equal(s.head.children.length, 0);
    assert.equal(s.video.getAttribute('poster'), 'hero.jpg');
  }
});

test('reduced motion requests no interlude media and an error clears both pending source and hint', () => {
  const reduced = sceneHarness({ reduced: true });
  try {
    for (const id of reduced.ids) reduced.instance.goTo(id);
    assert.deepEqual(reduced.loads, []); assert.equal(reduced.head.children.length, 0);
    assert.ok(reduced.slots.every(slot => !slot.hidden));
  } finally { reduced.instance.destroy(); }
  const failed = sceneHarness();
  try {
    failed.instance.goTo('agents'); failed.video.dispatchEvent(new Event('error'));
    assert.equal(failed.head.children.length, 0); assert.equal(failed.video.getAttribute('src'), null);
    assert.equal(failed.video.hidden, true); assert.equal(failed.slots[1].hidden, false);
    assert.ok(failed.slots[1].classList.contains('scene-fallback'));
    failed.instance.goTo('automations'); assert.equal(failed.loads.at(-1), '/desktop/automations.mp4');
  } finally { failed.instance.destroy(); }
});

test('performance checks reject eager imagery, parser blocking scripts and a missing poster', () => {
  assert.throws(() => checkImages(html.replace('loading="lazy"', 'loading="eager"')), /compete with the hero/);
  assert.throws(() => checkScripts(html.replace('<script defer', '<script')), /blocks HTML parsing/);
  assert.throws(() => checkPoster(html.replace(/poster="[^"]+"/, '')), /expected a local asset/);
});
