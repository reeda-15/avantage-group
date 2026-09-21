const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('dist/index.html','utf8');
const videos=[...html.matchAll(/<video\b[^>]*>/g)].map(m=>m[0]);
assert.equal(videos.length,5);
for(const video of videos) {
  assert.match(video,/preload="none"/);
  assert.match(video,/muted playsinline/);
  assert.doesNotMatch(video,/autoplay|loop|(?<!data-)src=/);
}
for(let i=1;i<=5;i++) assert.ok(fs.statSync('dist/assets/cinematic/phase-'+i+'.mp4').size>1000);
assert.doesNotMatch(html,/hero-floating-visual|hero-video-stage/,'old competing hero animation is removed');
console.log('cinematic media loading contract verified');
