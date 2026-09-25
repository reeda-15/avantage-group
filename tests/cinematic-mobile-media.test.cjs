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
