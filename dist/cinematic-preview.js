(() => {
  'use strict';
  const video = document.querySelector('#journey');
  const slider = document.querySelector('#position');
  const time = document.querySelector('#time');
  const notice = document.querySelector('#notice');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { progress: 0 };
  const canvas = document.querySelector('#picture');
  const context = canvas.getContext('2d', {alpha:false});
  const stars = window.createCinematicStars?.(document.querySelector('.stage'));
  const billboards = window.createCinematicBillboards?.(document.querySelector('.stage'));
  let timeline, target = 0, disposed = false, stallTimer, dragging = false, presented = -1;
  const content = window.createCinematicContent?.(document.querySelector('.stage'), jump);
  const maximum = () => Math.max(0, (Math.round(video.duration * 48) - 1) / 48);
  const seeker = CinematicTime.createSeeker(video, () => {
    clearTimeout(stallTimer); stallTimer = undefined; notice.textContent = '';
  }, frameTime => {
    if (disposed) return;
    if (frameTime === presented) return;
    presented = frameTime;
    stars?.update(frameTime);
    billboards?.update(frameTime);
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.style.visibility = 'visible';
    } else video.style.opacity = '1';
  });
  function pump() {
    if (disposed || !Number.isFinite(video.duration)) return;
    seeker.set(Math.min(maximum(), target));
  }
  function render() {
    content?.update(state.progress);
    if (!dragging) slider.value = String(Math.round(state.progress * 1000));
    if (!Number.isFinite(video.duration)) return;
    target = Math.min(maximum(), CinematicStory.sample(state.progress).time);
    time.textContent = `${target.toFixed(1)} / ${video.duration.toFixed(1)} s`;
    if (!stallTimer) stallTimer = setTimeout(() => { notice.textContent = 'Loading the next scene…'; stallTimer = undefined; }, 8000);
    pump();
  }
  function configure() {
    timeline?.scrollTrigger?.kill(true); timeline?.kill(); timeline = undefined;
    // Keep decoded HD detail; the CSS crop controls presentation only.
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    presented = -1;
    if (!motion.matches && window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      document.querySelector('#instruction').textContent = 'Explore the story';
      timeline = gsap.timeline({onUpdate:render,scrollTrigger:{trigger:'.stage',start:'top top',end:()=>`+=${Math.max(innerHeight,700) * 28 * CinematicStory.total / 21.7}`,pin:true,scrub:window.AvantageScroll?.active ? .15 : .65,invalidateOnRefresh:true}});
      timeline.fromTo(state,{progress:0},{progress:1,duration:1,ease:'none'});
    } else document.querySelector('#instruction').textContent = 'Explore the story';
    render();
  }
  function decoded() { clearTimeout(stallTimer); stallTimer = undefined; pump(); }
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
  function error() { notice.textContent = 'The background video could not load. You can still explore our story with the slider.'; }
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
  video.addEventListener('loadedmetadata', configure, {once:true});
  video.addEventListener('loadeddata', decoded);
  video.addEventListener('seeked', decoded);
  video.addEventListener('error', error);
  // Cached local media can finish metadata loading before deferred scripts run.
  if (video.readyState >= 1) {
    video.removeEventListener('loadedmetadata', configure);
    configure();
  }
  slider.addEventListener('input', move);
  slider.addEventListener('pointerdown', beginDrag);
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);
  motion.addEventListener('change', configure);
  addEventListener('pagehide', event => {
    video.pause(); clearTimeout(stallTimer);
    if (event.persisted) return;
    disposed = true; seeker.dispose(); stars?.dispose(); billboards?.dispose(); content?.dispose(); timeline?.scrollTrigger?.kill(); timeline?.kill();
    document.querySelector('header').removeEventListener('click',navigation);
    motion.removeEventListener('change', configure);
    slider.removeEventListener('input', move);
    slider.removeEventListener('pointerdown', beginDrag);
    removeEventListener('pointerup', endDrag);
    removeEventListener('pointercancel', endDrag);
    video.removeEventListener('loadeddata', decoded); video.removeEventListener('seeked', decoded);
  });
})();
