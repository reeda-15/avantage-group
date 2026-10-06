(() => {
  'use strict';
  const video = document.querySelector('#journey');
  const slider = document.querySelector('#position');
  const time = document.querySelector('#time');
  const notice = document.querySelector('#notice');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 800px)');
  const state = { progress: 0 };
  const canvas = document.querySelector('#picture');
  const context = canvas.getContext('2d', {alpha:false});
  const stars = window.createCinematicStars?.(document.querySelector('.stage'));
  const billboards = window.createCinematicBillboards?.(document.querySelector('.stage'));
  let timeline, target = 0, disposed = false, stallTimer, mobileSettleTimer, dragging = false, presented = -1, scrollPlayback = false, sceneOwned = false;
  let heroConfigured = false, heroPreferences = '';
  const preferenceKey = () => `${motion.matches}:${mobile.matches}`;
  const content = window.createCinematicContent?.(document.querySelector('.stage'), jump);
  const maximum = () => Math.max(0, (Math.round(video.duration * 48) - 1) / 48);
  const createHeroSeeker = () => CinematicTime.createSeeker(video, () => {
    clearTimeout(stallTimer); stallTimer = undefined; notice.textContent = '';
  }, frameTime => {
    if (disposed || sceneOwned) return;
    if (frameTime === presented) return;
    presented = frameTime;
    stars?.update(frameTime);
    billboards?.update(frameTime);
    if (mobile.matches) {
      canvas.style.visibility = 'hidden';
      video.style.opacity = '1';
    } else if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.style.visibility = 'visible';
    } else video.style.opacity = '1';
  });
  let seeker = createHeroSeeker();
  function sceneEnter() {
    if (sceneOwned) return;
    sceneOwned = true; scrollPlayback = false; video.pause(); seeker.dispose();
    clearTimeout(stallTimer); stallTimer = undefined; clearTimeout(mobileSettleTimer);
  }
  function sceneRelease() {
    if (!sceneOwned || disposed) return;
    sceneOwned = false; presented = -1; seeker = createHeroSeeker();
    if (video.readyState >= 1) heroMetadata();
  }
  document.addEventListener('avantage:scene-enter', sceneEnter);
  document.addEventListener('avantage:scene-release', sceneRelease);
  const scenes = window.AvantageScenes?.create(document, { video });
  function pump() {
    if (disposed || sceneOwned || !Number.isFinite(video.duration)) return;
    if (mobile.matches && !motion.matches) continueMobilePlayback();
    else seeker.set(Math.min(maximum(), target));
  }
  function continueMobilePlayback() {
    const delta = target - video.currentTime;
    clearTimeout(mobileSettleTimer);
    if (Math.abs(delta) < 1 / 48) return;
    if (delta < 0) {
      scrollPlayback = false;
      video.pause();
      seeker.set(target);
      return;
    }
    scrollPlayback = true;
    video.playbackRate = Math.min(4, Math.max(.75, delta * 4));
    const attempt = video.play();
    if (attempt?.catch) attempt.catch(() => {});
    mobileSettleTimer = setTimeout(() => {
      scrollPlayback = false;
      video.pause(); seeker.set(target);
    }, 240);
  }
  function render() {
    content?.update(state.progress);
    if (!dragging) slider.value = String(Math.round(state.progress * 1000));
    if (sceneOwned || !Number.isFinite(video.duration)) return;
    target = Math.min(maximum(), CinematicStory.sample(state.progress).time);
    if (mobile.matches) { stars?.update(target); billboards?.update(target); }
    time.textContent = `${target.toFixed(1)} / ${video.duration.toFixed(1)} s`;
    if (!stallTimer) stallTimer = setTimeout(() => { notice.textContent = 'Loading the next scene…'; stallTimer = undefined; }, 8000);
    pump();
  }
  function configure() {
    if (disposed) return;
    timeline?.scrollTrigger?.kill(true); timeline?.kill(); timeline = undefined;
    // Motion changes must remove the old pin even while a scene borrows the video.
    // Rebuild only after the original hero media and decoder regain ownership.
    if (sceneOwned) { heroConfigured = false; return; }
    heroConfigured = true; heroPreferences = preferenceKey();
    // Keep decoded HD detail; the CSS crop controls presentation only.
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    presented = -1;
    if (!motion.matches && window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      document.querySelector('#instruction').textContent = 'Explore the story';
      timeline = gsap.timeline({onUpdate:render,scrollTrigger:{trigger:'.stage',start:'top top',end:()=>`+=${Math.max(innerHeight,700) * 28 * CinematicStory.total / 21.7}`,pin:true,scrub:mobile.matches ? .08 : window.AvantageScroll?.active ? .15 : .65,invalidateOnRefresh:true}});
      timeline.fromTo(state,{progress:0},{progress:1,duration:1,ease:'none'});
    } else document.querySelector('#instruction').textContent = 'Explore the story';
    render();
  }
  function heroMetadata() {
    if (disposed || sceneOwned) return;
    if (!heroConfigured || heroPreferences !== preferenceKey()) { configure(); return; }
    // Restoring the same hero media must not rebuild its pin or reset its timeline.
    canvas.width = video.videoWidth; canvas.height = video.videoHeight; presented = -1; render();
  }
  function decoded() { if (sceneOwned) return; clearTimeout(stallTimer); stallTimer = undefined; pump(); }
  let primed = false;
  function pauseAutoplay() {
    if (scrollPlayback || sceneOwned) return;
    video.pause(); primed = true; pump();
  }
  function primeMobileVideo() {
    if (sceneOwned || !mobile.matches || primed || video.readyState < 1) return;
    const attempt = video.play();
    if (attempt?.catch) attempt.catch(() => {});
  }
  function move() {
    const progress = Number(slider.value) / 1000;
    if (timeline) {
      const trigger = timeline.scrollTrigger;
      const top = trigger.start + progress * (trigger.end - trigger.start);
      if (window.AvantageScroll) window.AvantageScroll.scrollTo(top, {immediate:true});
      else window.scrollTo({top,behavior:'instant'});
      timeline.scrollTrigger.getTween()?.progress(1);
      timeline.progress(progress);
    } else { state.progress = progress; render(); }
  }
  function error() { if (!sceneOwned) notice.textContent = 'The background video could not load. You can still explore our story with the slider.'; }
  function jump(id) {
    if (id === 'brief' || id === 'callback') {
      const section = document.getElementById(id);
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (window.AvantageScroll) window.AvantageScroll.scrollTo(top);
      else window.scrollTo({top, behavior:motion.matches ? 'instant' : 'smooth'});
      section.focus({preventScroll:true});
      return;
    }
    let units=0;
    for(const beat of CinematicStory.beats){
      if(beat[0]===id){slider.value=String(Math.round((units+beat[3]*.4)/CinematicStory.total*1000));move();break;}
      units+=beat[3];
    }
  }
  function navigation(event) {const button=event.target.closest('[data-jump]');if(button)jump(button.dataset.jump);}
  document.querySelector('header').addEventListener('click',navigation);
  function beginDrag() { dragging = true; }
  function endDrag() { requestAnimationFrame(() => { dragging = false; }); }
  video.addEventListener('loadedmetadata', heroMetadata);
  video.addEventListener('loadeddata', decoded);
  video.addEventListener('seeked', decoded);
  video.addEventListener('playing', pauseAutoplay);
  video.addEventListener('error', error);
  addEventListener('touchstart', primeMobileVideo, {passive:true});
  // Cached local media can finish metadata loading before deferred scripts run.
  if (video.readyState >= 1) {
    configure();
  }
  slider.addEventListener('input', move);
  slider.addEventListener('pointerdown', beginDrag);
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);
  motion.addEventListener('change', configure);
  addEventListener('pagehide', event => {
    video.pause(); clearTimeout(stallTimer); clearTimeout(mobileSettleTimer);
    if (event.persisted) return;
    disposed = true; scenes?.destroy(); seeker.dispose(); stars?.dispose(); billboards?.dispose(); content?.dispose(); timeline?.scrollTrigger?.kill(); timeline?.kill();
    document.removeEventListener('avantage:scene-enter', sceneEnter);
    document.removeEventListener('avantage:scene-release', sceneRelease);
    document.querySelector('header').removeEventListener('click',navigation);
    motion.removeEventListener('change', configure);
    slider.removeEventListener('input', move);
    slider.removeEventListener('pointerdown', beginDrag);
    removeEventListener('touchstart', primeMobileVideo);
    removeEventListener('pointerup', endDrag);
    removeEventListener('pointercancel', endDrag);
    video.removeEventListener('loadeddata', decoded); video.removeEventListener('seeked', decoded); video.removeEventListener('playing', pauseAutoplay);
    video.removeEventListener('loadedmetadata', heroMetadata); video.removeEventListener('error', error);
  });
})();
