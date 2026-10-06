const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ids = ['ai-agents', 'automations', 'custom-software', 'data-insights', 'creative-ai'];
const headlines = ['A team that can think, act, and report.', 'From repetitive work to reliable systems.', 'Software shaped around the business.', 'Decisions arrive with the evidence.', 'A production system for every campaign.'];
const read = () => fs.readFileSync('dist/cinematic-preview.html', 'utf8');
const text = value => value.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

test('five static chapters provide a named demonstration, supporting capabilities, scenario, contextual action and handoff', () => {
  const html = read().replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<video\b[^>]*>[\s\S]*?<\/video>/g, '');
  ids.forEach((id, index) => {
    const chapter = html.match(new RegExp(`<section\\b[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/section>`))[1];
    const headings = [...chapter.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)];
    assert.equal(text(headings[0][2]), headlines[index]);
    assert.equal(headings[0][1], '2');
    assert.ok(headings.slice(1).every(h => h[1] === '3'), 'all supporting headings sit below the chapter heading');
    assert.equal((chapter.match(/class="edition-feature\b/g) || []).length, 1, `${id}: one major demonstration`);
    assert.match(chapter, /<figure\b[^>]*class="edition-feature\b[^"]*"[^>]*aria-labelledby="[^"]+"/);
    assert.ok((chapter.match(/class="capability-card"/g) || []).length >= 3, `${id}: three supporting cards`);
    assert.match(chapter, /class="chapter-scenario"[\s\S]*?<h3[^>]*>In practice<\/h3>/);
    assert.match(chapter, /class="systems-action" href="#(?:callback|brief)"[^>]*>[^<]+<\/a>/);
    assert.match(chapter, /class="chapter-handoff"[\s\S]*?href="#[^"]+"/);
    assert.match(chapter, /class="chapter-transition" data-scene=/);
    assert.doesNotMatch(chapter.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/g, ''), /\bhidden\b|\binert\b|aria-hidden="true"/);
  });
});

test('automation demonstrates the exact ordered business path using readable HTML labels', () => {
  const chapter = read().split('id="automations"')[1].split('</section>')[0];
  const workflow = chapter.match(/<ol class="automation-flow"[^>]*>([\s\S]*?)<\/ol>/);
  assert.ok(workflow, 'workflow must remain readable without scripts');
  const labels = [...workflow[1].matchAll(/<strong>([^<]+)<\/strong>/g)].map(match => match[1]);
  assert.deepEqual(labels, ['Lead', 'Qualification', 'CRM', 'Follow-up', 'Report']);
  assert.match(read(), /<script defer src="capability-chapters\.js"><\/script>/);
});

test('the light software chapter paints its own background so its dark text stays readable', () => {
  const css = fs.readFileSync('dist/connected-systems.css', 'utf8');
  assert.match(css, /#custom-software\s*\{[^}]*background:\s*var\(--systems-bg\)/);
  assert.match(css, /#custom-software\s*\{[^}]*color:\s*var\(--systems-paper\)/);
});

class Element extends EventTarget {
  constructor(id) { super(); this.id = id; this.attrs = new Map(); this.parts = new Map(); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  removeAttribute(name) { this.attrs.delete(name); }
  querySelectorAll(selector) { if (!this.parts.has(selector)) this.parts.set(selector, [new Element(selector)]); return this.parts.get(selector); }
  querySelector(selector) { return this.querySelectorAll(selector)[0]; }
}
function setup({ reduced = false, gsap = true, observer = true } = {}) {
  const chapters = ids.map(id => new Element(id));
  const contents = chapters.map(chapter => chapter.querySelector('.systems-container'));
  const media = new EventTarget(); media.matches = reduced;
  const doc = new EventTarget(), win = new EventTarget(), observers = [], timelines = [], contexts = [];
  doc.defaultView = win; doc.hidden = false; win.document = doc; win.matchMedia = () => media;
  doc.querySelectorAll = () => chapters;
  doc.querySelector = () => chapters[0];
  if (observer) win.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); } disconnect() { this.disconnected = true; }
  };
  if (gsap) win.gsap = {
    context(callback) { const context = { revert() { this.reverted = true; } }; contexts.push(context); callback(); return context; },
    timeline() {
      const timeline = { steps: [], playing: false,
        fromTo(target, from, to) { this.steps.push({ target, from, to }); return this; },
        play() { this.playing = true; return this; }, pause() { this.playing = false; return this; },
        kill() { this.killed = true; this.playing = false; }, invalidate() { this.invalidated = true; return this; }
      }; timelines.push(timeline); return timeline;
    }
  };
  const instance = require('../dist/capability-chapters.js').create(doc);
  function visible(index, value = true) { observers[0].callback([{ target: contents[index], isIntersecting: value }]); }
  return { chapters, contents, media, doc, win, observers, timelines, contexts, instance, visible };
}

test('activation selects one valid chapter and stays useful with no animation libraries or observer', () => {
  const s = setup({ gsap: false, observer: false });
  s.instance.activate('automations');
  assert.deepEqual(s.chapters.map(c => c.getAttribute('data-chapter-active')), [null, 'true', null, null, null]);
  s.instance.activate('unknown'); s.instance.activate('__proto__');
  assert.equal(s.chapters[1].getAttribute('data-chapter-active'), 'true');
  s.instance.refresh(); s.instance.destroy();
  assert.ok(s.chapters.every(c => c.getAttribute('data-chapter-active') === null));
});

test('viewport entrance follows the same label, headline, demonstration, cards, lines and handoff grammar', () => {
  const s = setup(); assert.equal(s.timelines.length, 0);
  s.instance.activate('ai-agents'); assert.equal(s.timelines.length, 0, 'offscreen activation starts no motion');
  s.visible(0);
  const timeline = s.timelines[0];
  assert.deepEqual(timeline.steps.map(step => step.target[0].id), ['.chapter-label', 'h2', '.edition-feature', '.capability-card', '.chapter-connections', '.chapter-handoff']);
  assert.ok(timeline.playing);
  s.visible(0, false); assert.equal(timeline.playing, false);
  s.visible(0); assert.equal(s.timelines.length, 1, 'entrance resumes rather than resetting');
  s.doc.hidden = true; s.doc.dispatchEvent(new Event('visibilitychange')); assert.equal(timeline.playing, false);
  s.doc.hidden = false; s.doc.dispatchEvent(new Event('visibilitychange')); assert.equal(timeline.playing, true);
  s.instance.refresh(); assert.equal(timeline.invalidated, true);
  s.instance.destroy(); assert.equal(timeline.killed, true); assert.equal(s.contexts[0].reverted, true);
});

test('a visible cinematic poster cannot start motion while readable content remains offscreen', () => {
  const s = setup();
  const io = s.observers[0];
  // Model a section whose leading poster intersects, while its following content
  // is still below the viewport. Deliver geometry only for observed elements.
  io.callback(io.targets.map(target => ({ target, isIntersecting: target === s.chapters[0] })));
  s.instance.activate('ai-agents'); s.instance.refresh();
  const hold = new Event('avantage:scene-hold'); hold.detail = { chapterId: 'ai-agents' }; s.doc.dispatchEvent(hold);
  assert.equal(s.timelines.length, 0, 'poster visibility and scene holds must not consume the content entrance');
  io.callback(io.targets.map(target => ({ target, isIntersecting: target === s.contents[0] })));
  assert.equal(s.timelines.length, 1, 'readable content entering starts the entrance');
  assert.equal(s.timelines[0].playing, true);
  s.instance.destroy();
});

test('reduced motion creates no timelines and a live preference change restores static content', () => {
  const s = setup({ reduced: true }); s.visible(0); s.instance.activate('ai-agents');
  assert.equal(s.timelines.length, 0);
  s.media.matches = false; s.media.dispatchEvent(new Event('change')); assert.equal(s.timelines.length, 1);
  s.media.matches = true; s.media.dispatchEvent(new Event('change'));
  assert.equal(s.timelines[0].killed, true); assert.equal(s.contexts[0].reverted, true);
  s.instance.destroy();
});

test('scene handoffs select chapters, teardown restores state and stale callbacks become inert', () => {
  const s = setup(); s.instance.destroy(); s.chapters[2].setAttribute('data-chapter-active', 'original');
  s.instance = require('../dist/capability-chapters.js').create(s.doc);
  function hold(id) { const event = new Event('avantage:scene-hold'); event.detail = { chapterId: id }; s.doc.dispatchEvent(event); }
  hold('creative-ai'); assert.equal(s.chapters[4].getAttribute('data-chapter-active'), 'true');
  const io = s.observers.at(-1); io.callback([{ target: s.contents[4], isIntersecting: true }]);
  s.instance.destroy(); s.instance.destroy();
  assert.equal(io.disconnected, true); assert.equal(s.chapters[2].getAttribute('data-chapter-active'), 'original');
  assert.equal(s.chapters[4].getAttribute('data-chapter-active'), null);
  const count = s.timelines.length;
  hold('ai-agents'); io.callback([{ target: s.contents[0], isIntersecting: true }]);
  s.media.dispatchEvent(new Event('change')); s.doc.dispatchEvent(new Event('visibilitychange'));
  s.instance.activate('ai-agents'); s.instance.refresh(); assert.equal(s.timelines.length, count);
  assert.equal(s.chapters[0].getAttribute('data-chapter-active'), null);
});

test('standalone instance releases page lifecycle ownership and preserves cached page exits', () => {
  const s = setup(); s.instance.destroy();
  const listeners = new Set(), add = s.win.addEventListener.bind(s.win), remove = s.win.removeEventListener.bind(s.win);
  s.win.addEventListener = (type, fn) => { if (type === 'pagehide') listeners.add(fn); add(type, fn); };
  s.win.removeEventListener = (type, fn) => { if (type === 'pagehide') listeners.delete(fn); remove(type, fn); };
  const code = fs.readFileSync('dist/capability-chapters.js', 'utf8');
  vm.runInNewContext(code, { window: s.win });
  const api = s.win.AvantageChapters.instance;
  assert.equal(listeners.size, 1);
  const cached = new Event('pagehide'); cached.persisted = true; s.win.dispatchEvent(cached);
  api.activate('ai-agents'); assert.equal(s.chapters[0].getAttribute('data-chapter-active'), 'true');
  api.destroy(); assert.equal(listeners.size, 0);
  vm.runInNewContext(code, { window: s.win }); s.win.dispatchEvent(new Event('pagehide'));
  assert.equal(listeners.size, 0); assert.equal(s.chapters[0].getAttribute('data-chapter-active'), null);
});
