const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const file = 'dist/cinematic-time.js';
test('cinematic time engine is available', () => assert.ok(fs.existsSync(file), 'missing cinematic time engine'));
if (fs.existsSync(file)) {
  const { sample, createSeeker, createStallGuard } = require('../dist/cinematic-time.js');
  const lengths = [6, 7, 7, 8, 7];
  test('phase boundaries and reverse scrubbing are history independent', () => {
    const boundary = 6 / 35 * .82;
    assert.equal(sample(boundary - .00001, lengths).index, 0);
    assert.equal(sample(boundary + .00001, lengths).index, 1);
    const before = sample(.11, lengths);
    sample(.95, lengths);
    assert.deepEqual(sample(.11, lengths), before);
    assert.equal(sample(-1, lengths).time, 0);
    assert.deepEqual(sample(1, lengths), sample(.82, lengths));
    assert.equal(sample(1, lengths).index, 4);
    assert.ok(sample(1, lengths).time < 7);
  });
  test('a busy decoder coalesces requests and converges on the latest reverse seek', () => {
    const listeners = {};
    const seeks = [];
    let time = 0;
    const video = {
      readyState: 2, duration: 7, seeking: false,
      addEventListener: (name, cb) => { listeners[name] = cb; },
      removeEventListener: name => { delete listeners[name]; },
      get currentTime() { return time; },
      set currentTime(value) { time = value; this.seeking = true; seeks.push(value); }
    };
    let presented = 0;
    const seeker = createSeeker(video, () => presented++);
    seeker.set(5);
    seeker.set(6);
    seeker.set(2);
    assert.deepEqual(seeks, [5]);
    video.seeking = false; listeners.seeked();
    assert.deepEqual(seeks, [5, 2]);
    assert.equal(presented, 0, 'stale frames must not be revealed');
    video.seeking = false; listeners.seeked();
    assert.equal(presented, 1);
    seeker.dispose();
    assert.equal(Object.keys(listeners).length, 0);
  });
  test('requests before metadata are retained and clamp to a decodable end frame', () => {
    const listeners = {};
    const video = {readyState: 0, duration: NaN, currentTime: 0, seeking: false,
      addEventListener: (n, cb) => listeners[n] = cb, removeEventListener: n => delete listeners[n]};
    const seeker = createSeeker(video, () => {});
    seeker.set(99);
    assert.equal(video.currentTime, 0);
    video.readyState = 2; video.duration = 7; listeners.loadeddata();
    assert.ok(video.currentTime > 6.9 && video.currentTime < 7);
    seeker.dispose();
  });
  test('decoder progress prevents fallback during a long scrub, but a genuine stall fails', t => {
    assert.equal(typeof createStallGuard, 'function');
    t.mock.timers.enable({apis:['setTimeout']});
    let failures=0;
    const guard=createStallGuard(()=>failures++,15000);
    guard.check(true);
    for(let i=0;i<10;i++) {t.mock.timers.tick(5000); guard.progress(true);}
    assert.equal(failures,0,'50 seconds of decoder progress is not a stall');
    t.mock.timers.tick(15001);
    assert.equal(failures,1);
    guard.check(true);
    guard.clear();
    t.mock.timers.tick(15001);
    assert.equal(failures,1,'cleanup cancels watchdog');
  });
}
