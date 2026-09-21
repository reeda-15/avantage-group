(function (root) {
  'use strict';
  const FRAME = 1 / 48;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  // Cropped masters include their motion bridges; every next clip starts at 0.
  const clips = [229, 271, 97, 421, 337].map(frames => ({ in: 0, out: frames / 48 }));
  function sample(progress, durations) {
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    let time = clamp(Number.isFinite(progress) ? progress : 0, 0, .82) / .82 * total;
    let index = 0;
    while (index < durations.length - 1 && time >= durations[index]) time -= durations[index++];
    return { index, time: clamp(time, 0, Math.max(0, durations[index] - FRAME)) };
  }
  // Only one seek is in flight. Once it completes, pursue the latest scroll
  // target instead of queuing every intermediate position during fast scrolling.
  function sampleEdited(progress) {
    const result = sample(progress, clips.map(clip => clip.out - clip.in));
    return { index: result.index, time: result.time + clips[result.index].in };
  }
  function createSeeker(video, onReady, onFrame = () => {}) {
    let target = 0;
    let disposed = false;
    let direction = 0;
    let generation = 0;
    let seekGeneration = 0;
    // MP4 metadata rounds duration to microseconds; subtracting one frame
    // before quantizing can otherwise discard the actual final frame.
    const wanted = () => Math.floor(clamp(target, 0, Math.max(0, Math.round(video.duration / FRAME) - 1) * FRAME) / FRAME + 1e-7) * FRAME;
    const ready = () => !disposed && video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - wanted()) < 1e-6;
    function pump() {
      if (disposed || video.readyState < 2 || !Number.isFinite(video.duration) || video.seeking) return;
      if (ready()) { onFrame(video.currentTime); onReady(); }
      else { seekGeneration = generation; video.currentTime = wanted(); }
    }
    function decoded() {
      // Copy each completed frame before starting the next coalesced seek.
      // A direction change invalidates the old in-flight seek, not every frame
      // that happens to lag behind a continuously moving scroll target.
      if (!disposed && video.readyState >= 2 && !video.seeking && seekGeneration === generation && !ready()) onFrame(video.currentTime);
      pump();
    }
    video.addEventListener('loadeddata', pump);
    video.addEventListener('seeked', decoded);
    return {
      set(time) {
        const delta = time - target;
        if (Math.abs(delta) > 1e-7) {
          const nextDirection = Math.sign(delta);
          if (direction && direction !== nextDirection) generation++;
          direction = nextDirection;
        }
        target = time; pump();
      },
      ready,
      dispose() {
        disposed = true;
        video.removeEventListener('loadeddata', pump);
        video.removeEventListener('seeked', decoded);
      }
    };
  }
  function createStallGuard(onStall, delay = 15000) {
    let timer;
    const clear = () => { clearTimeout(timer); timer = undefined; };
    const check = pending => {
      if (!pending) clear();
      else if (timer === undefined) timer = setTimeout(() => { timer = undefined; onStall(); }, delay);
    };
    return { check, clear, progress(pending) { clear(); check(pending); } };
  }
  const api = { sample, sampleEdited, clips, createSeeker, createStallGuard };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CinematicTime = api;
})(typeof window === 'undefined' ? {} : window);
