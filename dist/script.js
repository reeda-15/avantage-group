document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const inquiryForm = document.getElementById('inquiry-form');
if (inquiryForm) {
  inquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(inquiryForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !email || !message) return;
    const subject = encodeURIComponent(`Project inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nWhat I would like to improve:\n${message}`);
    window.location.href = `mailto:contact@avantageai.com?subject=${subject}&body=${body}`;
  });
}

if (!reduceMotion) {
  const revealTargets = document.querySelectorAll('.statement h2,.statement-bottom,.sector-line,.boxed-heading,.work-intro,.case-card,.more-work,.all-work-cta,.services-title,.service-list article,.approach h2,.steps article,.contact h2,.contact>p,.contact-action,.inquiry,.works-hero h1,.works-row,.works-end h2');
  revealTargets.forEach((element, index) => {
    element.classList.add('motion-reveal');
    if (element.matches('.steps article,.service-list article')) element.style.setProperty('--reveal-delay', `${(index % 3) * 80}ms`);
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  revealTargets.forEach((element) => revealObserver.observe(element));

  const heroVisual = document.querySelector('.hero-visual');
  let scrollTicking = false;
  const updateScrollMotion = () => {
    scrollTicking = false;
    if (heroVisual && window.innerWidth > 700) {
      const progress = Math.min(1, Math.max(0, window.scrollY / 680));
      const ease = 1 - Math.pow(1 - progress, 2);
      const startWidth = Math.min(window.innerWidth * 0.45, 560);
      const endWidth = Math.min(window.innerWidth * 0.83, 1120);
      heroVisual.style.width = `${startWidth + (endWidth - startWidth) * ease}px`;
      heroVisual.style.aspectRatio = `${1.75 + 0.12 * ease}`;
      heroVisual.style.setProperty('--scroll-shift', `${ease * 8}%`);
    }
    document.querySelectorAll('.case-image img,.works-row-image img').forEach((image) => {
      const rect = image.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) / window.innerHeight;
      image.style.setProperty('--parallax-y', `${Math.max(-18, Math.min(18, -offset * 18))}px`);
    });
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(updateScrollMotion); }
  }, { passive: true });
  window.addEventListener('resize', updateScrollMotion);
  updateScrollMotion();
}

document.querySelectorAll('a[data-page-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (reduceMotion || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (document.body.classList.contains('page-leaving')) return;
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = link.href; }, 520);
  });
});
if (!reduceMotion) {
  document.body.classList.add('page-entering');
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('page-entering')));
}
