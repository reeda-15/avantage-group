const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('dist/cinematic-preview.html', 'utf8');
const css = fs.readFileSync('dist/connected-systems.css', 'utf8');

test('the static document has a first keyboard skip link and one persistent primary heading', () => {
  assert.match(html, /<body>\s*<a[^>]+class="systems-skip"[^>]+href="#connected-systems-main"/);
  assert.match(html, /<main[^>]+id="connected-systems-main"[^>]+tabindex="-1"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map(match => Number(match[1]));
  assert.equal(levels[0], 1);
  levels.forEach((level, index) => { if (index) assert.ok(level <= levels[index - 1] + 1, 'headings never skip a level'); });
  assert.match(css, /\.systems-skip:focus[^}]+transform:\s*translateY\(0\)/);
  assert.match(css, /textarea:focus-visible/);
  assert.match(html, /<video[^>]+aria-hidden="true"[^>]*>/);
  for (const image of html.matchAll(/<img[^>]+class="scene-poster"[^>]*>/g)) assert.match(image[0], /alt=""/);
  const finale = html.slice(html.indexOf('id="systems-finale"'), html.indexOf('</main>'));
  assert.match(finale, /Your business already has the moving parts\. We make them work as one\./);
  assert.match(finale, /href="#callback">Design my system<\/a>/);
  assert.match(finale, /href="#our-work">Explore our work<\/a>/);
});

test('the actual hero content factory adds no second h1 and works without GSAP', () => {
  let markup = '';
  const panel = { inert: false, style: {}, setAttribute() {}, querySelectorAll: () => [], querySelector: () => null };
  const host = { children: [panel], addEventListener() {}, removeEventListener() {}, remove() {}, setAttribute() {},
    set innerHTML(value) { markup = value; } };
  const document = { createElement: () => host, querySelector: () => ({ textContent: '' }) };
  const window = {};
  vm.runInNewContext(fs.readFileSync('dist/cinematic-content.js', 'utf8'), { window, document,
    matchMedia: () => ({ matches: true }), CinematicStory: { sample: () => ({ index: 0, local: 0 }) } });
  let controller;
  assert.doesNotThrow(() => { controller = window.createCinematicContent({ querySelector: () => ({ before() {} }) }, () => {}); });
  assert.equal((markup.match(/<h1\b/g) || []).length, 0);
  assert.match(markup, /<h2[^>]*><span class="brand-label">AVANTAGE AI<\/span>Your business/);
  assert.doesNotThrow(() => { controller.update(.5); controller.dispose(); });
});

test('reduced motion independently keeps interludes static and semantic content available', () => {
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.systems-finale[\s\S]*animation:\s*none/);
  assert.match(html, /<script defer src="connected-systems\.js"><\/script>/);
  assert.equal((html.match(/<video\b/g) || []).length, 1);
});
