(() => {
  'use strict';
  const hero = document.querySelector('[data-cinematic]');
  if (!hero || !window.gsap || !window.ScrollTrigger || !window.CinematicTime) return;
  const { gsap, ScrollTrigger, CinematicTime } = window;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || navigator.connection?.saveData) return;
  gsap.registerPlugin(ScrollTrigger);
  const videos = [...hero.querySelectorAll('video')];
  const durations = [145, 169, 169, 193, 169].map(frames => frames / 24);
  const media = hero.querySelector('.cinematic-media');
  const canvas = hero.querySelector('.cinematic-canvas');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return;
  const overlay = hero.querySelector('.cinematic-overlay');
  const brand = hero.querySelector('.cinematic-brand');
  const wash = hero.querySelector('.cinematic-wash');
  const controls = hero.querySelector('.cinematic-controls');
  const paths = [...hero.querySelectorAll('.cinematic-connection')];
  const orb = hero.querySelector('.cinematic-orb');
  const signal = hero.querySelector('.cinematic-signal');
  const progressBar = hero.querySelector('.cinematic-progress');
  const review = hero.querySelector('.cinematic-review');
  const isReview = new URLSearchParams(location.search).has('cinematic-review');
  const state = { progress: 0 };
  let disposed = false;
  let timeline;
  let current = { index: 0, time: 0 };
  let blending = false;
  let framePending = false;
  let lastFrameKey = '';
  const loaded = new Set();
  const phaseNames = ['The world', 'Something appears', 'Rising together', 'The passage', 'The agents'];

  function fallback() {
    if (disposed) return;
    disposed = true;
    stallGuard.clear();
    timeline?.scrollTrigger?.kill(true);
    timeline?.kill();
    seekers.forEach(seeker => seeker.dispose());
    videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); video.style.opacity = '0'; });
    gsap.set([brand, ...brand.children, wash, controls, media, overlay, canvas], { clearProps: 'all' });
    brand.inert = false;
    hero.classList.remove('is-active');
    if (isReview) review.textContent = 'Static fallback — motion disabled or a video could not load.';
    ScrollTrigger.refresh();
  }

  function load(index) {
    if (index < 0 || index >= videos.length || loaded.has(index) || disposed) return;
    loaded.add(index);
    videos[index].src = videos[index].dataset.src;
    videos[index].preload = 'auto';
    videos[index].load();
  }

  // Keep the previous displayed frame until all layers for the latest target
  // have finished seeking. Late seek completions cannot flash stale clips.
  function present() {
    framePending = false;
    if (disposed || !seekers[current.index].ready()) return;
    if (blending && !seekers[current.index - 1].ready()) return;
    stallGuard.clear();
    // Decoder elements are never displayed. Commit a frame only after the
    // latest requested seek is ready, preserving the previous canvas otherwise.
    // This prevents an obsolete intermediate seek from flashing on reversal.
    const key = `${current.index}:${current.time}`;
    if (key !== lastFrameKey) {
      try {
        context.globalAlpha = 1;
        if (blending) {
          context.drawImage(videos[current.index - 1], 0, 0, 1280, 720);
          context.globalAlpha = current.time / .3;
        }
        context.drawImage(videos[current.index], 0, 0, 1280, 720);
        context.globalAlpha = 1;
        lastFrameKey = key;
      } catch { fallback(); return; }
    }
    canvas.style.visibility = 'visible';
    // The canvas holds the actual decoded Phase 5 final frame throughout SVG
    // and HTML phases, without substituting a differently compressed still.
    const live = state.progress >= .82;
    gsap.set(overlay, { visibility: live ? 'visible' : 'hidden' });
  }
  function schedulePresent() {
    if (!framePending && !disposed) {
      framePending = true;
      requestAnimationFrame(present);
    }
  }
  const seekers = videos.map(video => CinematicTime.createSeeker(video, schedulePresent));
  const stallGuard = CinematicTime.createStallGuard(fallback);
  function watchProgress(reset = false) {
    if (disposed) return;
    const pending = !seekers[current.index].ready() || (blending && !seekers[current.index - 1].ready());
    if (reset) stallGuard.progress(pending);
    else stallGuard.check(pending);
  }
  videos.forEach((video, index) => {
    video.addEventListener('error', fallback);
    for (const event of ['loadeddata', 'seeked', 'progress']) video.addEventListener(event, () => {
      if (index === current.index || (blending && index === current.index - 1)) watchProgress(true);
    });
  });
  function update() {
    if (disposed) return;
    current = CinematicTime.sample(state.progress, durations);
    blending = current.index > 0 && current.time < .3;
    if (state.progress < .82) gsap.set(overlay, { visibility: 'hidden' });
    load(current.index);
    load(current.index + 1);
    load(current.index - 1);
    seekers[current.index].set(current.time);
    if (blending) seekers[current.index - 1].set(durations[current.index - 1]);
    brand.inert = state.progress < .994;
    controls.style.color = state.progress > .96 || innerWidth < 700 ? '#272923' : '#fffaf4';
    controls.style.textShadow = state.progress > .96 || innerWidth < 700 ? 'none' : '';
    if (isReview) {
      review.textContent = state.progress >= .82
        ? `Phase ${state.progress < .92 ? '6 · Connections' : state.progress < .97 ? '7 · Signal' : '8 · Brand'} — live SVG / HTML`
        : `Phase ${current.index + 1} · ${phaseNames[current.index]}${blending ? ' · SOURCE HANDOFF: 0.3s dissolve; matching source frames still needed.' : ' · Source continuity requires corrected clips at all four boundaries.'}`;
    }
    watchProgress();
    schedulePresent();
  }
  hero.classList.add('is-active');
  brand.inert = true;
  gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1, opacity: .85 });
  gsap.set(orb, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(signal, { scaleX: 0, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(brand, { autoAlpha: 0 });
  gsap.set([...brand.children], { y: 24, opacity: 0 });
  timeline = gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate: update,
    scrollTrigger: {
      id: 'avantage-cinematic', trigger: hero, start: 'top top',
      end: () => `+=${Math.round(innerHeight * (innerWidth < 700 ? 9 : 11))}`,
      pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1
    }
  });
  timeline.to(state, { progress: 1, duration: 1 }, 0)
    .to(progressBar, { scaleX: 1, duration: 1 }, 0)
    .to(paths, { strokeDashoffset: 0, duration: .065, stagger: .004 }, .825)
    .to(orb, { scale: 1, opacity: 1, duration: .038 }, .874)
    .to(paths, { strokeDashoffset: -1, opacity: 0, duration: .028 }, .922)
    .to(orb, { scale: 1.65, duration: .022 }, .92)
    .to(signal, { scaleX: 1, opacity: 1, duration: .032 }, .932)
    .to(orb, { scale: .1, opacity: 0, duration: .016 }, .951)
    .to(wash, { opacity: 1, duration: .032 }, .955)
    .to(signal, { opacity: 0, duration: .012 }, .966)
    .to(brand, { autoAlpha: 1, duration: .004 }, .973)
    .to(brand.children, { y: 0, opacity: 1, duration: .01, stagger: .004 }, .974)
    .to({}, { duration: .045 }, 1);
  hero.querySelector('[data-cinematic-skip]').addEventListener('click', event => {
    event.preventDefault();
    const target = document.getElementById('after-cinematic');
    const offset = target.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: offset, behavior: 'instant' });
    target.focus({ preventScroll: true });
  });
  motion.addEventListener('change', event => { if (event.matches) fallback(); });
  window.addEventListener('pagehide', () => videos.forEach(video => video.pause()));
  window.addEventListener('pageshow', () => { if (!disposed) { ScrollTrigger.refresh(); update(); } });
  update();
})();
