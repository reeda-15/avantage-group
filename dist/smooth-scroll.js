(() => {
  'use strict';
  if (!document.querySelector('[data-cinematic]')) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const { gsap, ScrollTrigger, Lenis } = window;
  let lenis;
  const tick = seconds => lenis?.raf(seconds * 1000);
  const resize = () => lenis?.resize();
  function start() {
    if (lenis || motion.matches || !gsap || !ScrollTrigger || !Lenis) return;
    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({
      autoRaf: false, lerp: .1, smoothWheel: true, wheelMultiplier: .9,
      syncTouch: false, anchors: true, allowNestedScroll: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.addEventListener('refresh', resize);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }
  function stop() {
    if (!lenis) return;
    gsap.ticker.remove(tick);
    ScrollTrigger.removeEventListener('refresh', resize);
    lenis.destroy();
    lenis = undefined;
  }
  window.AvantageScroll = {
    get active() { return !!lenis; },
    scrollTo(top, options = {}) {
      if (lenis) lenis.scrollTo(top, options);
      else window.scrollTo({ top, behavior: options.immediate || motion.matches ? 'instant' : 'smooth' });
    }
  };
  motion.addEventListener('change', () => motion.matches ? stop() : start());
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  start();
})();
