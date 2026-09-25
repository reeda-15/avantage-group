const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('cinematic preview offers a lightweight mobile stream before the desktop stream', () => {
  const html = fs.readFileSync('dist/cinematic-preview.html', 'utf8');
  const mobile = 'assets/cinematic-v2/avantage-journey-mobile.mp4';
  const desktop = 'assets/cinematic-v2/avantage-journey-web.mp4';
  assert.match(html, new RegExp(`<source[^>]+media="\\(max-width: 800px\\)"[^>]+src="${mobile}"`));
  assert.ok(html.indexOf(mobile) < html.indexOf(desktop));
  assert.ok(fs.statSync(`dist/${mobile}`).size < 40_000_000);
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
