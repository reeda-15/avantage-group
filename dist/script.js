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

const syncHeaderSelection = () => {
  if (!siteNav) return;
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page !== 'works.html') return;
  const portfolioLink = siteNav.querySelector('a[href$="works.html"]');
  const projectsLink = siteNav.querySelector('a[href*="works.html#projects"]');
  if (!portfolioLink || !projectsLink) return;
  const projectsOpen = window.location.hash === '#projects';
  portfolioLink.toggleAttribute('aria-current', !projectsOpen);
  if (!projectsOpen) portfolioLink.setAttribute('aria-current', 'page');
  projectsLink.toggleAttribute('aria-current', projectsOpen);
  if (projectsOpen) projectsLink.setAttribute('aria-current', 'page');
};
syncHeaderSelection();
window.addEventListener('hashchange', syncHeaderSelection);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroIntro = document.querySelector('[data-hero-intro]');
if (heroIntro) {
  let introSeen = false;
  try { introSeen = sessionStorage.getItem('avantage-intro-seen') === '1'; } catch {}
  const finishIntro = () => {
    document.documentElement.classList.add('intro-complete');
    document.body.classList.remove('intro-active');
    heroIntro.remove();
  };
  if (reduceMotion || introSeen) {
    finishIntro();
  } else {
    document.body.classList.add('intro-active');
    try { sessionStorage.setItem('avantage-intro-seen', '1'); } catch {}
    window.setTimeout(() => heroIntro.classList.add('is-revealing'), 1050);
    window.setTimeout(() => {
      document.documentElement.classList.add('intro-complete');
      document.body.classList.remove('intro-active');
      heroIntro.classList.add('is-complete');
    }, 1750);
    window.setTimeout(() => heroIntro.remove(), 2450);
  }
}

if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  document.documentElement.classList.add('has-custom-cursor');
  const cursor = document.createElement('div');
  cursor.className = 'scroll-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span>View</span>';
  document.body.appendChild(cursor);
  let pointerX = -100;
  let pointerY = -100;
  let cursorX = -100;
  let cursorY = -100;
  const moveCursor = () => {
    cursorX += (pointerX - cursorX) * 0.22;
    cursorY += (pointerY - cursorY) * 0.22;
    cursor.style.transform = `translate3d(${cursorX}px,${cursorY}px,0) translate(-50%,-50%)`;
    requestAnimationFrame(moveCursor);
  };
  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.classList.add('is-visible');
  }, { passive: true });
  document.addEventListener('pointerover', (event) => {
    cursor.classList.toggle('is-action', Boolean(event.target.closest('a,button')));
  });
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  requestAnimationFrame(moveCursor);
}

const aiNetwork = document.querySelector('[data-ai-network]');
if (aiNetwork && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const networkHero = aiNetwork.closest('.hero');
  networkHero?.addEventListener('pointermove', (event) => {
    const bounds = networkHero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    aiNetwork.style.setProperty('--network-x', `${x * 10}px`);
    aiNetwork.style.setProperty('--network-y', `${y * 7}px`);
  }, { passive: true });
  networkHero?.addEventListener('pointerleave', () => {
    aiNetwork.style.setProperty('--network-x', '0px');
    aiNetwork.style.setProperty('--network-y', '0px');
  });
}
const serviceRows = [...document.querySelectorAll('.services .service-list article')];
if (serviceRows.length) {
  const serviceImages = ['assets/hero-office.png', 'assets/project-btp.webp', 'assets/hero-office.png', 'assets/project-urban.png'];
  serviceRows.forEach((row, index) => {
    const title = row.querySelector('h3')?.textContent?.trim();
    if (!title) return;
    const ticker = document.createElement('div');
    ticker.className = 'service-ticker';
    ticker.setAttribute('aria-hidden', 'true');
    for (let copy = 0; copy < 12; copy += 1) {
      const item = document.createElement('span');
      item.className = 'service-ticker-item';
      const picture = document.createElement('img');
      picture.src = serviceImages[index] || serviceImages[0];
      picture.alt = '';
      picture.loading = 'lazy';
      item.append(document.createTextNode(title), picture);
      ticker.append(item);
    }
    const tickerViewport = document.createElement('div');
    tickerViewport.className = 'service-ticker-viewport';
    tickerViewport.setAttribute('aria-hidden', 'true');
    tickerViewport.append(ticker);
    row.append(tickerViewport);
  });

  let serviceTicking = false;
  const updateActiveService = () => {
    serviceTicking = false;
    const focusY = window.innerHeight * .58;
    let nearest = null;
    let nearestDistance = Infinity;
    serviceRows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - focusY);
      if (distance < nearestDistance && rect.bottom > 0 && rect.top < window.innerHeight) {
        nearest = row;
        nearestDistance = distance;
      }
    });
    serviceRows.forEach((row) => row.classList.toggle('is-service-active', !reduceMotion && row === nearest && nearestDistance < window.innerHeight * .34));
  };
  window.addEventListener('scroll', () => {
    if (!serviceTicking) { serviceTicking = true; requestAnimationFrame(updateActiveService); }
  }, { passive: true });
  window.addEventListener('resize', updateActiveService);
  updateActiveService();
}
const testimonialRail = document.querySelector('.testimonial-rail');
if (testimonialRail) {
  const reviews = [
    { name: 'Siraj', role: 'Owner at BTP Group', quote: `Avantage AI completely transformed the way we handle our accounting and vendor payments. Earlier, managing payments and accounts across two companies used to be a nightmare. Now, everything runs on autopilot — reminders, reconciliations, and even payment scheduling. It's like having an accountant who never sleeps. I've saved countless hours every week, and my team finally has time to focus on growing the business instead of chasing paperwork.` },
    { name: 'Ankush', role: 'Owner at Texas & Amrutlal', quote: `Before working with Avantage AI, we had bookings coming from multiple sources — website, partners, and offline agents — and managing them manually was chaotic. The team built us a unified system that not only syncs all our bookings in one place but also provides deep customer insights. I can now see which sources perform best and where our marketing money actually brings returns. It's been a total game-changer for our operations.` },
    { name: 'Shubham', role: 'Owner at VRC Plasto Mould', quote: `Our production team was constantly struggling to track the progress of multiple orders and parts. Avantage AI built a custom production management system that brought complete clarity and organization to our process. Now every stage is tracked in real-time — from moulding to delivery. We've reduced delays, improved communication, and the system has literally become the backbone of our factory operations.` },
    { name: 'Harshad', role: 'Owner at Harshad Steel', quote: `Running a steel business means you're constantly needed everywhere — accounts, inventory, dispatch — and that used to tie me to my desk all day. Avantage AI built an ERP system that automates almost all of it. I can now monitor everything from my phone. I don't have to be physically present at the office for things to move. It's given me both time freedom and peace of mind — something every business owner dreams of.` },
    { name: 'Faizan', role: 'Owner at Tickat, Dubai', quote: `We handle over 1,00,000 bookings every year, and managing leads, accounts, and clients was a massive headache. Avantage AI built us a complete CRM and accounting system that automated almost 70% of our work. What earlier required a full team of people is now handled effortlessly by the system. It's not just automation — it's intelligent automation that understands how our business actually works. Couldn't recommend them enough.` },
    { name: 'Sadiya', role: 'Owner at Mazana Interiors', quote: `As an interior brand, we used to get so many client inquiries daily that it became hard to handle each one personally. Avantage AI helped us set up a smart enquiry automation and a chatbot that assists clients in choosing designs based on their preferences. It feels personal yet fully automated. Our conversion rate has gone up and customers love the quick responses — it's like having a 24x7 design consultant online.` },
    { name: 'Mahek', role: 'Owner at Blossom & Bees', quote: `Avantage AI designed our e-commerce store beautifully. It's fast, clean, and perfectly represents our brand online. What I loved most was how they combined great design with smart functionality — product management, order flow, and automation are all smooth. We've seen a visible increase in both engagement and conversions after launching our new store.` },
    { name: 'Daksh', role: 'Owner at Whiff', quote: `The team at Avantage AI helped us bring Whiff to life online. They handled everything — design, store setup, and even automation for inventory and checkout. The entire process felt effortless, and the final result is a store that not only looks premium but performs flawlessly. Our customers love the experience, and our operations are much smoother now.` }
  ];
  const portraits = [...testimonialRail.querySelectorAll('.testimonial-portrait')];
  const story = testimonialRail.querySelector('.testimonial-story');
  const count = document.querySelector('.testimonial-count span');
  portraits[0].after(story);
  let activeReview = 0;
  let autoReview = null;
  let visible = false;
  const showReview = (index) => {
    if (index === activeReview || !portraits[index]) return;
    const oldLeft = story.getBoundingClientRect().left;
    activeReview = index;
    portraits.forEach((portrait, i) => {
      portrait.classList.toggle('is-active', i === index);
      portrait.setAttribute('aria-pressed', String(i === index));
    });
    portraits[index].after(story);
    story.querySelector('blockquote').textContent = `“${reviews[index].quote}”`;
    story.querySelector('figcaption strong').textContent = reviews[index].name;
    story.querySelector('figcaption span').textContent = reviews[index].role;
    if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / 08`;
    if (!reduceMotion && window.innerWidth > 1050) {
      const distance = oldLeft - story.getBoundingClientRect().left;
      story.animate([{ transform: `translateX(${distance}px)`, opacity: .3 }, { transform: 'translateX(0)', opacity: 1 }], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
  };
  const pauseReview = () => { if (autoReview) clearInterval(autoReview); autoReview = null; };
  const playReview = () => {
    if (reduceMotion || !visible || autoReview) return;
    autoReview = setInterval(() => showReview((activeReview + 1) % portraits.length), 7000);
  };
  portraits.forEach((portrait, index) => {
    portrait.addEventListener('pointerenter', () => showReview(index));
    portrait.addEventListener('click', () => showReview(index));
    portrait.addEventListener('focus', () => showReview(index));
    portrait.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = (index + (event.key === 'ArrowRight' ? 1 : portraits.length - 1)) % portraits.length;
      portraits[next].focus();
    });
  });
  testimonialRail.addEventListener('pointerenter', pauseReview);
  testimonialRail.addEventListener('pointerleave', playReview);
  testimonialRail.addEventListener('focusin', pauseReview);
  testimonialRail.addEventListener('focusout', (event) => { if (!testimonialRail.contains(event.relatedTarget)) playReview(); });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) playReview(); else pauseReview();
  }, { threshold: .25 }).observe(testimonialRail);
}
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
  const footerCounters = document.querySelectorAll('.footer-facts b');
  if (footerCounters.length) {
    footerCounters.forEach((counter) => {
      counter.dataset.countTarget = counter.textContent.trim();
      counter.textContent = '0'.padStart(counter.dataset.countTarget.length, '0');
    });
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const counter = entry.target;
        const targetText = counter.dataset.countTarget || '0';
        const target = Number.parseInt(targetText, 10);
        const digits = targetText.length;
        const duration = 1500;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = String(Math.round(target * eased)).padStart(digits, '0');
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(counter);
      });
    }, { threshold: 0.45 });
    footerCounters.forEach((counter) => counterObserver.observe(counter));
  }
  const portfolioTargets = document.querySelectorAll('[data-portfolio-card],.home-team-grid article,.team-card');
  const portfolioObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      portfolioObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 8% 0px' });
  portfolioTargets.forEach((element) => portfolioObserver.observe(element));
  const revealTargets = document.querySelectorAll('.statement h2,.statement-bottom,.sector-line,.boxed-heading,.work-intro,.case-card,.more-work,.all-work-cta,.portfolio-projects-heading,.portfolio-projects .archive-card,.operating-rhythm>h2,.rhythm-steps article,.services-title,.service-list article,.approach h2,.steps article,.contact h2,.contact>p,.contact-action,.inquiry,.works-hero h1,.works-row,.works-end h2');
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
  const heroMediaStrip = document.querySelector('.hero-media-strip');
  const aiNetworkLines = document.querySelector('.ai-network-lines');
  let scrollTicking = false;
  const updateScrollMotion = () => {
    scrollTicking = false;
    if (heroVisual && heroFlow && heroFloat && window.innerWidth > 700) {
      const hero = heroFlow.querySelector('.hero');
      const heroTop = heroFlow.getBoundingClientRect().top + window.scrollY;
      const firstPageHeight = hero.offsetHeight;
      const progress = Math.min(1, Math.max(0, (window.scrollY - heroTop) / firstPageHeight));
      const ease = 1 - Math.pow(1 - progress, 2);
      const compactHero = window.innerHeight <= 680;
      const startWidth = Math.min(window.innerWidth * (compactHero ? .23 : .285), compactHero ? 310 : 360);
      const endWidth = Math.min(window.innerWidth * .84, 1120, window.innerHeight * 1.72);
      const preferredStartTop = Math.max(firstPageHeight * (compactHero ? .67 : .69), compactHero ? 370 : 475);
      const startTop = Math.min(preferredStartTop, firstPageHeight - startWidth / 1.75 - (compactHero ? 18 : 20));
      const endHeight = endWidth / 1.87;
      const endTop = firstPageHeight + Math.max(28, (window.innerHeight - endHeight) / 2);
      heroFloat.style.top = `${startTop + (endTop - startTop) * ease}px`;
      heroVisual.style.width = `${startWidth + (endWidth - startWidth) * ease}px`;
      heroVisual.style.aspectRatio = `${1.75 + .12 * ease}`;
      heroVisual.style.setProperty('--scroll-shift', `${ease * 8}%`);
      if (heroMediaStrip) {
        heroMediaStrip.style.setProperty('--media-half-gap', `${(startWidth + (endWidth - startWidth) * ease + 28) / 2}px`);
      }
      if (aiNetworkLines) {
        const lineFade = Math.max(0, 1 - progress * 2.35);
        aiNetworkLines.style.opacity = String(lineFade);
        aiNetworkLines.style.filter = `blur(${progress * 2.5}px)`;
      }
    } else if (heroVisual) {
      heroFloat?.style.removeProperty('top');
      heroVisual.style.removeProperty('width');
      heroVisual.style.removeProperty('aspect-ratio');
      heroMediaStrip?.style.removeProperty('--media-half-gap');
      aiNetworkLines?.style.removeProperty('opacity');
      aiNetworkLines?.style.removeProperty('filter');
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

const nativePageTransitions = 'startViewTransition' in document && CSS.supports('view-transition-name: root');
document.querySelectorAll('a[data-page-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (reduceMotion || nativePageTransitions || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (document.body.classList.contains('page-leaving')) return;
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = link.href; }, 520);
  });
});
if (!reduceMotion && !nativePageTransitions) {
  document.body.classList.add('page-entering');
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('page-entering')));
}
