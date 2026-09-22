/* A separate sky layer: cursor movement never transforms the filmed scenery. */
window.createCinematicStars = function (stage) {
  'use strict';
  const layer = document.createElement('canvas');
  layer.className = 'cinematic-stars';
  layer.setAttribute('aria-hidden', 'true');
  layer.width = 1920;
  layer.height = 1080;
  stage.querySelector('#picture').after(layer);
  const ctx = layer.getContext('2d');
  if (!ctx || !window.gsap) { layer.remove(); return { update() {}, dispose() {} }; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const offset = { x: 0, y: 0 };
  let seconds = 0, disposed = false, seed = 2731;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const stars = Array.from({ length: 210 }, (_, i) => ({
    x: random() * 1980 - 30, y: random() * 780 - 30,
    depth: i % 3, radius: .55 + random() * .65,
    alpha: .24 + random() * .45
  }));
  const smooth = (a, b, n) => { const t = Math.max(0, Math.min(1, (n-a)/(b-a))); return t*t*(3-2*t); };
  function draw() {
    if (disposed) return;
    ctx.clearRect(0, 0, 1920, 1080);
    const arrival = 1 - smooth(.6, 2.8, seconds);
    const galaxy = smooth(28, 30, seconds);
    const strength = Math.max(arrival * .68, galaxy);
    if (!strength) return;
    ctx.save();
    // Sky-only masks in the video's coordinate system follow the same cover crop.
    // Fade out during the approach, before the mountain reaches this safe skyline.
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1920, 0);
    if (galaxy > 0) {
      ctx.lineTo(1920, 650); ctx.lineTo(0, 650);
    } else {
      [[1920,280],[1630,275],[1410,310],[1230,240],[1100,150],
        [980,55],[800,55],[660,150],[460,285],[230,340],[0,370]]
        .forEach(([x,y]) => ctx.lineTo(x,y));
    }
    ctx.closePath(); ctx.clip();
    for (const star of stars) {
      const depth = [5, 11, 19][star.depth];
      const x = star.x + offset.x * depth;
      const y = star.y + offset.y * depth;
      const horizonFade = 1 - smooth(galaxy ? 470 : 210, galaxy ? 650 : 370, y);
      ctx.globalAlpha = star.alpha * strength * horizonFade;
      ctx.fillStyle = star.depth === 2 ? '#fff4de' : '#dce9ff';
      ctx.beginPath(); ctx.arc(x, y, star.radius, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  const easeX = gsap.quickTo(offset, 'x', { duration: 1.15, ease: 'power3.out', onUpdate: draw });
  const easeY = gsap.quickTo(offset, 'y', { duration: 1.15, ease: 'power3.out', onUpdate: draw });
  function move(event) {
    if (reduced.matches || !pointer.matches || event.pointerType === 'touch') return;
    const r = stage.getBoundingClientRect();
    easeX(-Math.max(-1, Math.min(1, (event.clientX-r.left)/r.width*2-1)));
    easeY(-Math.max(-1, Math.min(1, (event.clientY-r.top)/r.height*2-1)));
  }
  function reset() { easeX(0); easeY(0); }
  function preference() {
    easeX.tween.pause(); easeY.tween.pause(); offset.x = offset.y = 0; draw();
  }
  stage.addEventListener('pointermove', move, { passive: true });
  stage.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  reduced.addEventListener('change', preference);
  pointer.addEventListener('change', preference);
  draw();
  return {
    update(time) { seconds = time; draw(); },
    dispose() {
      disposed = true; easeX.tween.kill(); easeY.tween.kill();
      stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      reduced.removeEventListener('change', preference); pointer.removeEventListener('change', preference);
      layer.remove();
    }
  };
};
