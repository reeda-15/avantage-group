(function (global) {
  'use strict';
  const prototype = 'assets/cinematic-v2/connected-intro-kling.mp4';
  const poster = 'assets/cinematic-v2/connected-intro-poster.jpg';
  // Empty sources explicitly mark clips that have not been supplied yet.
  // The controller renders their local posters without requesting placeholder URLs.
  const scenes = [
    { id: 'intro', chapterId: 'stage', srcDesktop: prototype, srcMobile: prototype, poster, startFrame: 0, holdFrame: 216, exitFrame: 240 },
    ...[['agents', 'ai-agents'], ['automations', 'automations'], ['software', 'custom-software'],
      ['insights', 'data-insights'], ['creative', 'creative-ai'], ['work', 'our-work'], ['finale', 'systems-finale']]
      .map(([id, chapterId]) => ({ id, chapterId, srcDesktop: '', srcMobile: '', poster, startFrame: 0, holdFrame: 0, exitFrame: 0 }))
  ].map(Object.freeze);
  Object.freeze(scenes);

  function validate(records) {
    if (!Array.isArray(records)) throw new TypeError('Scene records must be an array');
    const ids = new Set(), chapters = new Set();
    return records.map(scene => {
      if (!scene || typeof scene.id !== 'string' || !scene.id || ids.has(scene.id)) throw new TypeError('Scene id must be unique');
      if (typeof scene.chapterId !== 'string' || !scene.chapterId || chapters.has(scene.chapterId)) throw new TypeError('Scene chapter must be unique');
      const frames = [scene.startFrame, scene.holdFrame, scene.exitFrame];
      if (frames.some(frame => !Number.isInteger(frame) || frame < 0) || frames[0] > frames[1] || frames[1] > frames[2]) {
        throw new TypeError('Scene frames must satisfy startFrame <= holdFrame <= exitFrame');
      }
      if (['srcDesktop', 'srcMobile', 'poster'].some(key => typeof scene[key] !== 'string')) throw new TypeError('Scene media must use string paths');
      ids.add(scene.id); chapters.add(scene.chapterId);
      return Object.freeze({ ...scene });
    });
  }

  function lookup(id, records = scenes) {
    return records.find(scene => scene.id === id || scene.chapterId === id) || null;
  }

  function create(root, options = {}) {
    const records = validate(options.scenes || scenes);
    const doc = root.ownerDocument || root;
    const win = doc.defaultView || global;
    const video = options.video || root.querySelector('#journey');
    const slots = new Map(Array.from(root.querySelectorAll('[data-scene]'), slot => [slot.dataset.scene, slot]));
    const preference = query => win.matchMedia?.(query) || { matches: false };
    const motion = preference('(prefers-reduced-motion: reduce)');
    const mobile = preference('(max-width: 800px)');
    const fps = Number.isFinite(options.fps) && options.fps > 0 ? options.fps : 24;
    const sourceElements = Array.from(video?.querySelectorAll('source') || [], element => ({ element, src: element.getAttribute('src') }));
    const attrs = ['src', 'poster', 'preload', 'autoplay', 'aria-hidden', 'aria-label'];
    const original = video && { parent: video.parentNode, next: video.nextSibling,
      attrs: new Map(attrs.map(name => [name, video.getAttribute(name)])), hidden: video.hidden,
      opacity: video.style.opacity, visibility: video.style.visibility };
    const fallback = options.introFallback || {
      srcDesktop: sourceElements.find(({ element }) => !element.getAttribute('media'))?.src || '',
      srcMobile: sourceElements.find(({ element }) => element.getAttribute('media'))?.src || ''
    };
    let current = null, borrowed = false, disposed = false, hint = null, timer, generation = 0;
    const visible = new Map();
    const sourceFor = record => mobile.matches ? record.srcMobile || record.srcDesktop : record.srcDesktop;
    const emit = (name, scene) => root.dispatchEvent(new win.CustomEvent(`avantage:scene-${name}`, {
      bubbles: true, detail: { id: scene.id, chapterId: scene.chapterId }
    }));
    const clearTimer = () => { clearTimeout(timer); timer = undefined; };
    const clearHint = () => { hint?.remove(); hint = null; };
    const clearSlot = slot => slot.classList.remove('scene-enter', 'scene-ready', 'scene-hold',
      'scene-exit', 'scene-fallback', 'content-to-video', 'video-to-content');
    const hold = () => {
      if (!current || current.held) return;
      current.held = true; current.slot.classList.remove('content-to-video');
      current.slot.classList.add('scene-hold', 'video-to-content'); clearTimer();
      emit('hold', current.scene);
    };
    const exit = () => {
      if (!current || current.exited) return;
      current.exited = true; current.slot.classList.add('scene-exit'); emit('exit', current.scene);
    };
    function stopMedia() {
      if (!video || !borrowed) return;
      video.pause(); video.hidden = true; video.removeAttribute('src');
      // Nested hero sources must stay disabled while the borrowed surface is empty.
      // Otherwise load() would restart the original full hero download on every error.
      video.load();
    }
    function showFallback() {
      if (!current) return;
      current.failed = true;
      generation++; clearTimer(); clearHint(); stopMedia();
      current.slot.classList.remove('scene-ready', 'scene-enter');
      current.slot.classList.add('scene-fallback'); hold();
    }
    function armWatchdog() {
      clearTimer(); timer = setTimeout(showFallback, 15000);
    }
    function preload(id) {
      if (disposed || motion.matches || !video || current?.failed) return false;
      const next = records[current ? records.indexOf(current.scene) + 1 : 0];
      const requested = lookup(id, records);
      if (!next || requested !== next || !sourceFor(next)) return false;
      const src = sourceFor(next);
      if (hint?.getAttribute('href') === src) return true;
      clearHint(); hint = doc.createElement('link'); hint.rel = 'preload'; hint.as = 'video';
      hint.href = src; hint.setAttribute('href', src); hint.type = 'video/mp4';
      doc.head.appendChild(hint); return true;
    }
    function load(src) {
      if (!current || !video || !src) return showFallback();
      if (!borrowed) {
        borrowed = true;
        sourceElements.forEach(({ element }) => element.removeAttribute('src'));
      }
      video.pause(); video.hidden = true; video.removeAttribute('autoplay');
      video.setAttribute('aria-hidden', 'true'); video.removeAttribute('aria-label');
      video.setAttribute('preload', 'auto'); video.setAttribute('poster', current.scene.poster);
      video.classList.add('cinematic-scene-video'); video.style.opacity = '1';
      current.slot.appendChild(video); video.src = src; video.load(); armWatchdog();
    }
    function activate() {
      current.failed = false; current.held = false; current.exited = false; current.started = false;
      current.triedFallback = false;
      current.slot.querySelector('.scene-poster')?.setAttribute('src', current.scene.poster);
      clearSlot(current.slot);
      current.slot.classList.add('scene-enter', 'content-to-video');
      if (motion.matches || !video || !sourceFor(current.scene)) return showFallback();
      load(sourceFor(current.scene));
      const next = records[records.indexOf(current.scene) + 1];
      if (next) preload(next.id);
    }
    function goTo(id) {
      if (disposed) return false;
      const scene = lookup(id, records), slot = scene && slots.get(scene.id);
      if (!scene || !slot) return false;
      if (current?.scene === scene) return true;
      generation++; clearTimer(); clearHint(); exit();
      if (current) clearSlot(current.slot);
      video?.pause();
      current = { scene, slot, held: false, exited: false };
      emit('enter', scene); activate(); return true;
    }
    function metadata() {
      if (!current || !borrowed || motion.matches || !video.getAttribute('src')) return;
      const maximum = Math.max(0, video.duration - 1 / fps);
      if (!Number.isFinite(maximum)) return;
      current.start = Math.min(maximum, current.scene.startFrame / fps);
      current.holdTime = Math.min(maximum, current.scene.holdFrame / fps);
      current.exitTime = Math.min(maximum, current.scene.exitFrame / fps);
      video.currentTime = current.start;
    }
    function decoded() {
      if (!current || !borrowed || motion.matches || !video.getAttribute('src') || video.readyState < 2) return;
      // Keep the poster until a nonzero starting frame has finished seeking.
      if (video.seeking) return;
      video.hidden = false; current.slot.classList.add('scene-ready');
      if (current.started) return;
      current.started = true;
      if (current.holdTime <= current.start) { video.pause(); hold(); return; }
      const token = generation;
      try {
        const attempt = video.play();
        attempt?.catch(() => { if (!disposed && token === generation) showFallback(); });
      } catch (_) { showFallback(); }
    }
    function progress() {
      if (!current || !borrowed || motion.matches || !video.getAttribute('src')) return;
      if (video.currentTime >= current.holdTime && !current.held) {
        video.pause(); video.currentTime = current.holdTime; hold();
      } else if (!current.held) armWatchdog();
      if (video.currentTime >= current.exitTime) { video.pause(); exit(); }
    }
    function error() {
      if (!current || !borrowed || !video.getAttribute('src')) return;
      if (current.scene.id === 'intro' && !current.triedFallback && sourceFor(fallback)) {
        current.triedFallback = true; current.started = false; generation++;
        load(sourceFor(fallback)); return;
      }
      current.failed = true; showFallback();
    }
    function release() {
      if (!current) return;
      generation++; clearTimer(); clearHint(); exit();
      const scene = current.scene;
      clearSlot(current.slot);
      current = null;
      if (video && borrowed) {
        video.pause(); video.classList.remove('cinematic-scene-video');
        original.parent.insertBefore(video, original.next);
        original.attrs.forEach((value, name) => value === null ? video.removeAttribute(name) : video.setAttribute(name, value));
        sourceElements.forEach(({ element, src }) => src === null ? element.removeAttribute('src') : element.setAttribute('src', src));
        video.hidden = original.hidden; video.style.opacity = original.opacity; video.style.visibility = original.visibility;
        borrowed = false; video.load();
      }
      emit('release', scene);
    }
    function preferenceChanged() {
      if (disposed || !current) return;
      generation++; clearTimer(); clearHint(); activate();
    }
    const handlers = { loadedmetadata: metadata, loadeddata: decoded, seeked: decoded,
      timeupdate: progress, ended: hold, error };
    Object.entries(handlers).forEach(([name, handler]) => video?.addEventListener(name, handler));
    motion.addEventListener?.('change', preferenceChanged); mobile.addEventListener?.('change', preferenceChanged);
    const observer = win.IntersectionObserver && options.observe !== false ? new win.IntersectionObserver(entries => {
      if (disposed) return;
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= .25) visible.set(entry.target, entry.intersectionRatio);
        else visible.delete(entry.target);
      }
      const target = Array.from(visible).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (target) goTo(target.dataset.scene); else release();
    }, { threshold: [0, .25, .55, .8] }) : null;
    slots.forEach(slot => observer?.observe(slot));
    return { goTo, preload, destroy() {
      if (disposed) return;
      disposed = true; observer?.disconnect(); visible.clear(); release(); clearTimer(); clearHint();
      Object.entries(handlers).forEach(([name, handler]) => video?.removeEventListener(name, handler));
      motion.removeEventListener?.('change', preferenceChanged); mobile.removeEventListener?.('change', preferenceChanged);
    } };
  }

  const api = { scenes, validate, lookup, create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.AvantageScenes = api;
})(typeof window === 'undefined' ? {} : window);
