const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('cinematic preview offers a lightweight mobile stream before the desktop stream', () => {
  const html = fs.readFileSync('dist/cinematic-preview.html', 'utf8');
  const mobilePath = 'assets/cinematic-v2/avantage-journey-mobile.mp4';
  const mobile = `${mobilePath}?v=2`;
  const desktop = 'assets/cinematic-v2/avantage-journey-web.mp4';
  assert.ok(html.includes(`<source media="(max-width: 800px)" src="${mobile}"`));
  assert.ok(html.indexOf(mobile) < html.indexOf(desktop));
  const size = fs.statSync(`dist/${mobilePath}`).size;
  assert.ok(size > 10_000_000 && size < 35_000_000);
});

test('mobile playback uses direct rendering and primes decoding from touch', () => {
  const html = fs.readFileSync('dist/cinematic-preview.html', 'utf8');
  const script = fs.readFileSync('dist/cinematic-preview.js', 'utf8');
  assert.match(html, /<video id="journey"[^>]+autoplay/);
  assert.match(script, /matchMedia\('\(max-width: 800px\)'\)/);
  assert.match(script, /video\.style\.opacity\s*=\s*'1'/);
  assert.match(script, /video\.play\(\)/);
  assert.match(script, /touchstart/);
});

test('mobile scroll uses synchronized touch and a tighter scrub', () => {
  const smooth = fs.readFileSync('dist/smooth-scroll.js', 'utf8');
  const preview = fs.readFileSync('dist/cinematic-preview.js', 'utf8');
  assert.match(smooth, /syncTouch:\s*true/);
  assert.match(smooth, /touchMultiplier:\s*\.8/);
  assert.match(preview, /mobile\.matches\s*\?\s*\.08\s*:/);
});
