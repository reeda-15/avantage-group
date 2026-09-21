const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const file = 'dist/cinematic-time.js';
test('cinematic time engine is available', () => assert.ok(fs.existsSync(file), 'missing cinematic time engine'));
if (fs.existsSync(file)) {
  const { sample, sampleEdited, clips, createSeeker, createStallGuard } = require('../dist/cinematic-time.js');
  const lengths = [6, 7, 7, 8, 7];
  test('mastered clips begin at their matched first frame at every boundary', () => {
    const total=clips.reduce((sum,c)=>sum+c.out-c.in,0);
    const secondBoundary=(clips[0].out+clips[1].out)/total*.82;
    const thirdBoundary=(clips[0].out+clips[1].out+clips[2].out-clips[2].in)/total*.82;
    assert.equal(sampleEdited(secondBoundary+.00001).index,2);
    assert.ok(sampleEdited(secondBoundary+.00001).time<1/24);
    assert.equal(sampleEdited(thirdBoundary+.00001).index,3);
    assert.ok(sampleEdited(thirdBoundary+.00001).time<1/24);
    assert.equal(sampleEdited(secondBoundary-.00001).index,1);
    assert.equal(sampleEdited(1).time,7,'SVG holds the original final decoded frame');
  });
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
  test('continuous scrolling presents completed frames without waiting for scrolling to stop', () => {
    const events = {}; let time = 0;
    const video = {readyState:2,duration:7,seeking:false,
      addEventListener:(n,cb)=>events[n]=cb, removeEventListener:n=>delete events[n],
      get currentTime(){return time;}, set currentTime(v){time=v;this.seeking=true;}};
    const frames=[];
    const seeker=createSeeker(video,()=>{},t=>frames.push(t));
    const finish=()=>{video.seeking=false;events.seeked();};
    seeker.set(1); seeker.set(2); finish();
    assert.deepEqual(frames,[1], 'completed intermediate frames must be committed while the next seek is pending');
    seeker.set(3); finish();
    assert.deepEqual(frames,[1,2]);
    seeker.set(.5); finish();
    assert.deepEqual(frames,[1,2], 'obsolete forward frame must not flash after a reversal');
    finish(); assert.deepEqual(frames,[1,2,.5]);
    seeker.dispose();
  });
  test('small smooth reverse updates invalidate an outstanding forward seek',()=>{
    const events={};let time=0;const frames=[];
    const video={readyState:2,duration:7,seeking:false,addEventListener:(n,cb)=>events[n]=cb,removeEventListener:n=>delete events[n],get currentTime(){return time;},set currentTime(t){time=t;this.seeking=true;}};
    const seeker=createSeeker(video,()=>{},t=>frames.push(t));
    seeker.set(1);seeker.set(2);
    for(let n=1;n<=40;n++)seeker.set(2-n*.005);
    video.seeking=false;events.seeked();
    assert.deepEqual(frames,[],'small reverse steps must invalidate the forward frame');
    seeker.dispose();
  });
  test('SVG handoff seeks the actual final frame instead of accepting an adjacent frame',()=>{
    const video={readyState:2,duration:169/24,currentTime:6.99,seeking:false,addEventListener(){},removeEventListener(){}};
    const seeker=createSeeker(video,()=>{});
    seeker.set(7);assert.equal(video.currentTime,7);
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
