const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('dist/index.html', 'utf8');
const css = fs.readFileSync('dist/content.css', 'utf8');
const script = fs.readFileSync('dist/script.js', 'utf8');

assert.match(html, /class="hero-flow"/, 'hero flow wrapper is restored');
assert.match(html, /class="hero-video-stage/, 'second-stage canvas is restored');
assert.match(html, /class="hero-floating-visual"/, 'animated visual is restored');
assert.match(html, /assets\/hero-avantage-workspace\.png/, 'approved Avantage AI workspace image is used');
assert.match(css, /\.hero-floating-visual/, 'floating visual layout exists');
assert.match(script, /const heroVisual = document\.querySelector\('\.hero-visual'\)/, 'scroll expansion controller exists');
assert.match(script, /heroVisual\.style\.width/, 'scroll expansion changes image width');

console.log('hero image motion contract verified');
