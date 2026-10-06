(() => {
  'use strict';
  if (!document.querySelector('[data-cinematic]')) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const { gsap, ScrollTrigger, Lenis } = window;
  let lenis, listening = false;
  const tick = seconds => lenis?.raf(seconds * 1000);
  const resize = () => lenis?.resize();
  function enable() {
    if (lenis || motion.matches || !gsap || !ScrollTrigger || !Lenis) return;
    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({
      autoRaf: false, lerp: .085, smoothWheel: true, wheelMultiplier: .9,
      syncTouch: true, touchMultiplier: .8, anchors: true, allowNestedScroll: true
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
  function preferenceChanged() { motion.matches ? stop() : enable(); }
  function start() {
    if (!listening) {
      motion.addEventListener?.('change', preferenceChanged);
      window.addEventListener('pagehide', stop);
      window.addEventListener('pageshow', start);
      listening = true;
    }
    enable();
  }
  window.AvantageScroll = {
    get active() { return !!lenis; },
    start,
    refresh: resize,
    destroy() {
      stop();
      motion.removeEventListener?.('change', preferenceChanged);
      window.removeEventListener?.('pagehide', stop);
      window.removeEventListener?.('pageshow', start);
      listening = false;
    },
    scrollTo(top, options = {}) {
      if (lenis) lenis.scrollTo(top, options);
      else window.scrollTo({ top, behavior: options.immediate || motion.matches ? 'instant' : 'smooth' });
    }
  };
  start();
})();
