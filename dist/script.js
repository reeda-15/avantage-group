document.querySelectorAll('#year').forEach((year) => { year.textContent = new Date().getFullYear(); });
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.getElementById('site-nav');
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const inquiryForm = document.getElementById('inquiry-form');
if (inquiryForm) {
  inquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(inquiryForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !email || !message) return;
    const subject = encodeURIComponent(`Project inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}\n\nWhat I would like to improve:\n${message}`);
    window.location.href = `mailto:contact@avantageai.com?subject=${subject}&body=${body}`;
  });
}

if (!reduceMotion) {
  document.body.classList.add('has-motion');
  const portfolioTargets = document.querySelectorAll('[data-portfolio-card],.home-team-grid article,.team-card');
  const portfolioObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      portfolioObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 8% 0px' });
  portfolioTargets.forEach((element) => portfolioObserver.observe(element));
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
  const heroFlow = document.querySelector('.hero-flow');
  const heroFloat = document.querySelector('.hero-floating-visual');
  let scrollTicking = false;
  const updateScrollMotion = () => {
    scrollTicking = false;
    if (heroVisual && heroFlow && heroFloat && window.innerWidth > 700) {
      const hero = heroFlow.querySelector('.hero');
      const description = hero.querySelector('.hero-description');
      const heroTop = heroFlow.getBoundingClientRect().top + window.scrollY;
      const firstPageHeight = hero.offsetHeight;
      const progress = Math.min(1, Math.max(0, (window.scrollY - heroTop) / firstPageHeight));
      const ease = 1 - Math.pow(1 - progress, 2);
      const startWidth = Math.min(window.innerWidth * (window.innerHeight <= 620 ? 0.30 : 0.33), 440, window.innerHeight <= 620 ? window.innerHeight * 0.6 : Infinity);
      const endWidth = Math.min(window.innerWidth * 0.83, 1120, window.innerHeight * 1.7);
      const startTop = hero.querySelector('.hero-center').offsetTop + description.offsetTop + description.offsetHeight + 12;
      const endHeight = endWidth / 1.87;
      const endTop = firstPageHeight + Math.max(0, (window.innerHeight - endHeight - 35) / 2);
      heroFloat.style.top = `${startTop + (endTop - startTop) * ease}px`;
      heroVisual.style.width = `${startWidth + (endWidth - startWidth) * ease}px`;
      heroVisual.style.aspectRatio = `${1.75 + 0.12 * ease}`;
      heroVisual.style.setProperty('--scroll-shift', `${ease * 8}%`);
    } else if (heroVisual) {
      heroFloat?.style.removeProperty('top');
      heroVisual.style.removeProperty('width');
      heroVisual.style.removeProperty('aspect-ratio');
    }
    document.querySelectorAll('.case-image img,.works-row-image img,.portfolio-card-media img').forEach((image) => {
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
