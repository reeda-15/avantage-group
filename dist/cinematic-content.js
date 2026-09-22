window.createCinematicContent = function(stage, navigate) {
  const host=document.createElement('div');host.className='story';host.setAttribute('aria-label','Our story');
  stage.querySelector('header').before(host);
  const button=`<button class="story-button" data-go="callback">Book a free strategy call <span aria-hidden="true">↗</span></button>`;
  const projects=[
    ['BTP Travel CRM','Inquiries, bookings, customers, and payments in one system.','btp-travel-crm'],
    ['Harshad Steel ERP','Inventory, billing, purchases, and cash under control.','harshad-steel-erp'],
    ['VRC Plasto PLM','A connected manufacturing process, from RFQ to production handover.','vrc-plasto-plm'],
    ['Tickat CRM','Connected CRM and accounting for a Dubai travel operator.','tickat-crm']
  ];
  const services=[['Task automation','Follow-ups, invoicing, scheduling, and reminders.'],['Custom software','ERP, CRM, PLM, billing, and dashboards.'],['Web & app development','Business websites and mobile apps.'],['Marketing automation','Lead capture, follow-up sequences, and onboarding.'],['E-commerce','Online stores with connected inventory and checkout.'],['Complex custom systems','AI platforms and operational command centres.']];
  const articles=[
    ['intro','',``],
    ['hero','01 / YOUR ADVANTAGE',`<h1 data-reveal><span class="brand-label">AVANTAGE AI</span>Your business.<br><em>Running smarter.</em></h1><p data-reveal>AI automation, custom software, websites, and apps—built around how your business works.</p><div data-reveal class="actions">${button}<button class="text-button" data-go="project-0">Explore our work ↓</button></div>`],
    ['message','02 / A BETTER WAY TO WORK',`<h2 class="message-lines"><span>Your business shouldn’t depend on you for every update.</span><span>Connect your operations. Automate repetitive work.</span><span>See what’s happening—without chasing your team.</span></h2>`],
    ['benefits','03 / WHAT WE DO FOR YOU',`<h2 data-reveal>Less manual work.<br><em>More control.</em></h2><p data-reveal>Save time. Reduce repetitive costs.<br>Keep leads, payments, and operations moving.</p><dl class="stats" data-reveal>${[[23,'','Clients'],[37,'₹','Revenue moved'],[177,'','Tasks automated'],[11,'','Industries served']].map(([n,p,l],i)=>`<div><dt>${l}</dt><dd data-count="${n}" data-prefix="${p}" data-suffix="${i===1?'L+':i===2?'+':''}" aria-label="${p}${n}${i===1?' lakh plus':i===2?' plus':''}">${p}${n}${i===1?'L+':i===2?'+':''}</dd></div>`).join('')}</dl>`],
    ...projects.map(([title,body,slug],i)=>[`project-${i}`,`04 / SELECTED WORK · 0${i+1} OF 04`,`<span class="project-index" aria-hidden="true" data-reveal>0${i+1}</span><h2 data-reveal>${title}</h2><p data-reveal>${body}</p><button data-reveal class="text-button" data-go="contact">Discuss a similar project ↓</button>`]),
    ['team','05 / THE PEOPLE BEHIND IT',`<h2 data-reveal>Two people.<br><em>Direct involvement.</em></h2><p data-reveal>The strategist who understands your business and the architect who builds your system stay close to the work.</p><div class="founders">${[['Sumit Thakur','Business Strategist & Advisor','15+ years in business consulting, focused on profitability, efficiency, and growth.','sumit.png'],['Meer Sheikh','Technology Architect & AI Lead','Intelligent automation, custom software, and AI architecture.','meer.jpg']].map(([name,role,bio,img])=>`<figure><img src="assets/cinematic-content/${img}" alt="${name}" width="220" height="220"><figcaption><h3>${name}</h3><span>${role}</span><p>${bio}</p></figcaption></figure>`).join('')}</div>`],
    ['process','06 / HOW TO GET YOUR ADVANTAGE',`<h2 data-reveal>Understand first.<br><em>Build your advantage.</em></h2><ol class="process-list">${[['Discover','Understand your operations and identify repetitive work.'],['Design','Build the software and workflows around your needs.'],['Dominate','Deploy, improve, and keep refining.']].map(([a,b],i)=>`<li><span class="process-number">0${i+1}</span><div><h3>${a}</h3><p>${b}</p></div></li>`).join('')}</ol>`],
    ...services.map(([title,body],i)=>[`service-${i}`,`07 / SERVICES · 0${i+1} OF 06`,`<span class="service-rule" aria-hidden="true"></span><h2 data-reveal>${title}</h2><p data-reveal>${body}</p><p class="small" data-reveal>Built around what your business needs.</p>`]),
    ...[
      ['Harshad','Owner at Harshad Steel','I can now monitor everything from my phone.','harshad.jpg'],
      ['Faizan','Owner at Tickat, Dubai','Avantage AI built us a complete CRM and accounting system that automated almost 70% of our work.','faizan.jpg'],
      ['Siraj','Owner at BTP Group','I can now see which sources perform best and where our marketing money actually brings returns.','siraj.jpg'],
      ['Shubham','Owner at VRC Plasto Mould','Avantage AI built a custom production management system that brought complete clarity and organization to our process.','shubham.jpg'],
      ['Sadiya','Owner at Mazana Interiors','It feels personal yet fully automated.','sadiya.jpg']
    ].map(([name,role,quote,img],i)=>[`quote-${i}`,`08 / CLIENT PERSPECTIVES · ${i+1} OF 5`,`<h2 class="sr-only">Client perspective from ${name}</h2><blockquote data-reveal>“${quote}”</blockquote><div class="client" data-reveal><img src="assets/cinematic-content/${img}" alt="${name}" width="64" height="64"><p><strong>${name}</strong><span>${role}</span></p></div><p class="small" data-reveal>Client-reported results.</p>`]),
    ['contact','09 / YOUR NEXT CHAPTER',`<h2 data-reveal>Give your business<br><em>its advantage.</em></h2><p data-reveal>Let’s find the work your team shouldn’t have to do manually.</p><div class="actions" data-reveal><button class="story-button" data-go="brief">Tell us about your project <span aria-hidden="true">↓</span></button></div>`]
  ];
  host.innerHTML=articles.map(([id,label,body],i)=>`<article class="story-panel ${id}" data-chapter="${id}" ${i?'inert aria-hidden="true"':''}>${id==='intro'?'':`<div class="panel-inner"><p class="eyebrow" data-reveal>${label}</p>${body}</div>`}</article>`).join('');
  const panels=[...host.children];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const timelines=panels.map((p,i)=>{
    const t=gsap.timeline({paused:true});const items=p.querySelectorAll('[data-reveal]');
    if(items.length) t.fromTo(items,{y:24,opacity:0},{y:0,opacity:1,duration:.16,stagger:.035,ease:'power2.out'},.06);
    if(p.classList.contains('message')) t.fromTo(p.querySelectorAll('.message-lines span'),{opacity:.18,y:12},{opacity:1,y:0,duration:.18,stagger:.18},.08);
    if(p.classList.contains('team')) p.querySelectorAll('figure').forEach((f,j)=>t.fromTo(f,{x:j?35:-35,opacity:0},{x:0,opacity:1,duration:.22},.15+j*.06));
    if(p.classList.contains('process')) t.fromTo(p.querySelectorAll('li'),{opacity:.16,x:12},{opacity:1,x:0,duration:.18,stagger:.19},.1);
    const rule=p.querySelector('.service-rule');if(rule)t.fromTo(rule,{scaleX:0},{scaleX:1,duration:.35,ease:'power2.out'},.1);
    t.to({}, {duration:.01},1);return t;
  });
  let active=-1;
  function update(progress) {
    const {index,local}=CinematicStory.sample(progress);
    if(active!==index){panels.forEach((p,i)=>{p.inert=i!==index;p.setAttribute('aria-hidden',String(i!==index));p.style.visibility=i===index?'visible':'hidden';});active=index;}
    const panel=panels[index];
    const entry=index===0?1:Math.min(1,local/.12);
    const exit=index===panels.length-1?1:Math.min(1,(1-local)/.12);
    panel.style.opacity=reduced.matches?'1':String(Math.min(entry,exit));
    timelines[index].progress(reduced.matches?1:local);
    const countProgress=reduced.matches?1:Math.min(1,Math.max(0,(local-.1)/.4));
    panel.querySelectorAll('[data-count]').forEach(el=>el.textContent=`${el.dataset.prefix}${Math.round(Number(el.dataset.count)*countProgress)}${el.dataset.suffix}`);
    document.querySelector('#chapter-label').textContent=articles[index][1];
  }
  function click(e){const target=e.target.closest('[data-go]');if(target)navigate(target.dataset.go);}
  host.addEventListener('click',click);
  update(0);
  return {update,dispose(){host.removeEventListener('click',click);timelines.forEach(t=>t.kill());host.remove();}};
};
