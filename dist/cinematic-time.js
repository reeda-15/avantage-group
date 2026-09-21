(function (root) {
  'use strict';
  const FRAME = 1 / 24;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  function sample(progress, durations) {
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    let time = clamp(Number.isFinite(progress) ? progress : 0, 0, .82) / .82 * total;
    let index = 0;
    while (index < durations.length - 1 && time >= durations[index]) time -= durations[index++];
    return { index, time: clamp(time, 0, Math.max(0, durations[index] - FRAME)) };
  }
  // Only one seek is in flight. Once it completes, pursue the latest scroll
  // target instead of queuing every intermediate position during fast scrolling.
  function createSeeker(video, onReady) {
    let target = 0;
    let disposed = false;
    const wanted = () => clamp(target, 0, Math.max(0, video.duration - FRAME));
    const ready = () => !disposed && video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - wanted()) < FRAME / 2;
    function pump() {
      if (disposed || video.readyState < 2 || !Number.isFinite(video.duration) || video.seeking) return;
      if (ready()) onReady();
      else video.currentTime = wanted();
    }
    video.addEventListener('loadeddata', pump);
    video.addEventListener('seeked', pump);
    return {
      set(time) { target = time; pump(); },
      ready,
      dispose() {
        disposed = true;
        video.removeEventListener('loadeddata', pump);
        video.removeEventListener('seeked', pump);
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
  const api = { sample, createSeeker, createStallGuard };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CinematicTime = api;
})(typeof window === 'undefined' ? {} : window);
