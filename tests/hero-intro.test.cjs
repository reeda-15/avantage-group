const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('dist/index.html', 'utf8');
const css = fs.readFileSync('dist/content.css', 'utf8');
const script = fs.readFileSync('dist/script.js', 'utf8');

assert.match(html, /data-hero-intro/, 'homepage includes the opening company-name screen');
assert.match(html, /Avantage<span[^>]*>\.<\/span><small>AI<\/small>/, 'opening screen shows the company name');
assert.match(html, /hero-floating-visual[\s\S]*hero-video-stage|hero-video-stage[\s\S]*hero-floating-visual/, 'opening sequence coexists with the restored image stage');
assert.match(css, /\.hero-intro-screen/, 'opening screen is styled');
assert.match(css, /\.hero-intro-screen\.is-complete/, 'opening screen has a completed transition state');
assert.match(script, /data-hero-intro/, 'opening sequence is initialized in JavaScript');
assert.match(script, /sessionStorage/, 'opening sequence does not replay during same-session page navigation');

console.log('hero intro contract verified');
