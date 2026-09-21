const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('dist/index.html', 'utf8');
const css = fs.readFileSync('dist/content.css', 'utf8');
const script = fs.readFileSync('dist/script.js', 'utf8');

assert.match(html, /class="hero-media-strip"/, 'second hero screen contains the media strip');
assert.ok((html.match(/media-logos-strip\.png/g) || []).length >= 2, 'strip image is duplicated for a seamless loop');
assert.match(css, /@keyframes hero-media-marquee/, 'media strip has an infinite marquee animation');
assert.match(css, /animation:[^;}]*hero-media-marquee[^;}]*infinite/, 'marquee repeats forever');
assert.match(script, /aiNetworkLines\.style\.opacity/, 'network lines fade as the hero image expands');

console.log('hero media strip contract verified');
