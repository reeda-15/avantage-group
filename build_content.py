"""Generate content pages from Avantage AI's approved public copy."""
from pathlib import Path
from html import escape
import json

ROOT = Path('dist')
ARTICLES = json.loads(Path('content/articles.json').read_text(encoding='utf-8'))
INDUSTRIES = [
    'Travel agencies', 'Manufacturing companies', 'Real estate brokerages',
    'Steel and hardware suppliers', 'Retail businesses', 'Interior and fitout businesses',
    'Marketing agencies', 'Ecommerce teams', 'Service businesses'
]
SERVICES = [
    {
        'name':'Custom ERP software','eyebrow':'OPERATIONS / VISIBILITY',
        'headline':'Control the operation without being at the counter.',
        'description':'Avantage AI builds ERP systems for manufacturers, steel and hardware suppliers, retail teams, and service businesses that need inventory, billing, purchases, cash, customer records, supplier records, role access, and live reporting in one place.',
        'features':['Inventory and stock movement','Sales bills and purchase bills','Cash and payment records','Customer and supplier records','Role based access and audit logs','Owner dashboards and live reports']
    },
    {
        'name':'Custom CRM development','eyebrow':'LEADS / CUSTOMERS',
        'headline':'Keep every lead and follow-up in view.',
        'description':'We build CRM systems that collect leads from website forms, WhatsApp, calls, Instagram, walk-ins, agents, and online sources, then assign follow-ups, track status, store customer history, and show owners which channels convert.',
        'features':['Lead capture from every source','Assignment and follow-up reminders','Bookings and customer history','Sales pipelines and status tracking','Branch and employee dashboards','Channel performance and reporting']
    },
    {
        'name':'AI automation','eyebrow':'WORKFLOWS / TIME SAVED',
        'headline':'Give repeated work a better route.',
        'description':'Avantage AI automates repetitive tasks such as WhatsApp follow-ups, payment reminders, customer updates, invoice reminders, low-stock alerts, task approvals, report generation, and lead assignment so teams save time and owners see work moving.',
        'features':['WhatsApp and customer follow-ups','Payment and invoice reminders','Lead routing and assignment','Low-stock and task alerts','Approval and status workflows','Automatic daily reports']
    },
    {
        'name':'Websites, web apps & mobile apps','eyebrow':'DIGITAL EXPERIENCES / TOOLS',
        'headline':'Digital tools that do more than look good.',
        'description':'We design and build marketing websites, ecommerce stores, internal dashboards, customer portals, and operational web apps that connect to CRM, ERP, automation, payment, inventory, and reporting workflows. Our work also includes mobile apps built around business operations.',
        'features':['Marketing websites and ecommerce','Customer portals and mobile apps','Internal dashboards','Operational web applications','CRM and ERP integrations','Payment, inventory and reporting workflows']
    }
]
PROJECTS = [
    {'slug':'btp-travel-crm','title':'BTP Travel CRM','client':'Bharat Travel Point','category':'TRAVEL / CRM & ACCOUNTING','summary':'A custom travel CRM and accounting system that unifies inquiries, bookings, customers, branches, payments, and marketing channel performance.','image':'project-btp.webp','related':['harshad-steel-erp','vrc-plasto-plm','tickat-crm']},
    {'slug':'harshad-steel-erp','title':'Harshad Steel ERP','client':'Harshad Steel / Bhavana Hardware','category':'STEEL & HARDWARE / ERP','summary':'A custom ERP for steel and hardware operations covering inventory, sales bills, purchase bills, cash, customers, suppliers, roles, and audit logs.','image':'project-harshad.webp','related':['btp-travel-crm','vrc-plasto-plm','tickat-crm']},
    {'slug':'vrc-plasto-plm','title':'VRC Plasto PLM','client':'VRC Plasto Mould','category':'MANUFACTURING / PLM','summary':'A product lifecycle management system for plastic parts manufacturing, digitising RFQ, feasibility, quotation, APQP, trials, PPAP, and SOP handover.','image':'project-vrc.webp','related':['btp-travel-crm','harshad-steel-erp','tickat-crm']},
    {'slug':'tickat-crm','title':'Tickat CRM','client':'Tickat Dubai','category':'TRAVEL / CRM & ACCOUNTING','summary':'A CRM and accounting platform for a Dubai travel operator, built to automate repetitive workflows and improve booking visibility.','image':'project-tickat.webp','related':['btp-travel-crm','harshad-steel-erp','vrc-plasto-plm']},
    {'slug':'quartzline-minerals','title':'Quartzline Minerals Website','client':'Quartzline Minerals','category':'MINERALS / WEBSITE','summary':'A corporate mining and minerals website with product catalog, certifications, capability storytelling, and inquiry routing.','image':'','related':['btp-travel-crm','harshad-steel-erp','vrc-plasto-plm']},
    {'slug':'playcobra','title':'PlayCobra Mobile App','client':'PlayCobra','category':'ENTERTAINMENT / MOBILE APP','summary':'A real-time multiplayer card game platform with virtual currency, tournaments, and operational game systems.','image':'project-playcobra.webp','related':['btp-travel-crm','harshad-steel-erp','vrc-plasto-plm']},
    {'slug':'broker-seva','title':'Broker Seva Mobile App','client':'Broker Seva','category':'REAL ESTATE / MOBILE APP','summary':'A real estate broker mobile app for property inventory, requirement matching, broker networks, wallet flows, and listing workflows.','image':'project-broker.webp','related':['btp-travel-crm','harshad-steel-erp','vrc-plasto-plm']},
    {'slug':'urban-hungry-media','title':'Urban Hungry Media Website','client':'Urban Hungry Media','category':'MARKETING / WEBSITE','summary':'A motion-led marketing website and editorial case-study experience for a content and brand growth agency.','image':'project-urban.png','related':['btp-travel-crm','harshad-steel-erp','vrc-plasto-plm']}
]
BY_SLUG = {project['slug']:project for project in PROJECTS}

def e(value): return escape(str(value), quote=True)
def link(prefix, path): return prefix + path
def header(prefix, active=''):
    nav = [('Work','works.html'),('Services','services.html'),('About','about.html'),('Insights','blog.html'),('Contact','contact.html')]
    items = ''.join(f'<a href="{link(prefix,path)}" data-page-link{(" aria-current=\"page\"" if active==label else "")}>{label}</a>' for label,path in nav)
    return f'''<header class="site-header" id="top"><a class="brand" href="{link(prefix,'index.html')}" data-page-link aria-label="Avantage AI home">Avantage<span class="brand-dot">.</span><small>AI</small></a><button class="menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false">Menu <span aria-hidden="true">☰</span></button><nav id="site-nav" aria-label="Main navigation">{items}</nav></header>'''
def footer(prefix):
    return f'''<footer class="footer section-pad"><a class="footer-brand" href="{link(prefix,'index.html')}" data-page-link>Avantage<span>.</span><small>AI</small></a><div class="footer-detail"><p>Custom software and AI automation for owners who want operations to run without constant manual control.</p><div><strong>Visit</strong><span>Nagpur, Maharashtra, India</span></div><div><strong>Call</strong><a href="tel:+919270856871">+91 92708 56871</a></div><div><strong>Email</strong><a href="mailto:contact@avantageai.com">contact@avantageai.com</a></div></div><div class="footer-line"><span>TECHNOLOGY THAT MAKES WORK FLOW</span><span>© <span id="year">2026</span> AVANTAGE AI</span><a href="#top">BACK TO TOP ↑</a></div></footer>'''
def page(title, description, body, filename, prefix='', active=''):
    html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fffaf4"><meta name="description" content="{e(description)}"><title>{e(title)} — Avantage AI</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet"><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23fffaf4'/%3E%3Cpath d='M9 48 26 15h11l18 33H43l-5-9H25l-5 9H9Zm20-18h5l-2.5-5-2.5 5Z' fill='%23232323'/%3E%3Ccircle cx='51' cy='14' r='5' fill='%23edff76' stroke='%23232323'/%3E%3C/svg%3E"><link rel="stylesheet" href="{prefix}styles.css"><link rel="stylesheet" href="{prefix}motion.css"><link rel="stylesheet" href="{prefix}content.css"></head><body>{header(prefix,active)}<main>{body}</main>{footer(prefix)}<script src="{prefix}script.js" defer></script></body></html>'''
    destination = ROOT / filename; destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(html,encoding='utf-8')

def title_block(kicker, title, intro=''):
    return f'''<section class="content-hero paper-grid section-pad"><div class="section-label"><span>{e(kicker)}</span><span class="scribble">Avantage AI</span></div><h1>{title}</h1>{f'<p>{e(intro)}</p>' if intro else ''}</section>'''

def service_section(service, number):
    features = ''.join(f'<li>{e(item)}</li>' for item in service['features'])
    return f'''<article class="service-detail" id="service-{number}"><div class="detail-heading"><span class="detail-number">0{number}</span><div><span class="case-category">{e(service['eyebrow'])}</span><h2>{e(service['name'])}</h2></div></div><div class="detail-body"><p class="lead">{e(service['headline'])}</p><p>{e(service['description'])}</p><ul class="feature-grid">{features}</ul></div></article>'''

about = title_block('01 / ABOUT', 'Technology for the <mark>work behind the work.</mark>', 'Avantage AI designs and builds practical technology for owners who need their business to run with less dependency on manual coordination.')
about += '''<section class="copy-section section-pad"><div class="section-label"><span>WHAT WE BUILD</span><span class="scribble">practical by design</span></div><div class="copy-grid"><h2>One connected way to <mark>move forward.</mark></h2><div><p>Our work spans AI automation, custom ERP software, CRM development, websites, mobile apps, dashboards, and operational systems. We also build task automation, sales and marketing workflows, ecommerce systems, reporting dashboards, and custom AI tools shaped around each business workflow.</p><p>We help owners replace scattered manual work with software that tracks operations, automates follow-up, and makes performance visible.</p></div></div></section>'''
benefits = [('Save money','Reduce repeated admin, missed leads, and delayed payment follow-ups.'),('Save time','Automate booking records, production updates, property searches, stock reports, and daily dashboards.'),('Automate work','Handle WhatsApp follow-ups, invoice reminders, customer updates, approvals, and low-stock alerts.'),('Stay in control','See the business through CRM, ERP, mobile app, and dashboard systems.')]
about += '<section class="benefits section-pad paper-grid"><div class="section-label"><span>WHAT BETTER SYSTEMS CHANGE</span><span class="scribble">useful outcomes</span></div><div class="benefit-grid">' + ''.join(f'<article><span>0{i}</span><h3>{e(name)}</h3><p>{e(text)}</p></article>' for i,(name,text) in enumerate(benefits,1)) + '</div></section>'
about += '<section class="industry-section section-pad"><div class="section-label"><span>INDUSTRIES SERVED</span><span class="scribble">built around real operations</span></div><h2>Across businesses,<br><mark>the work comes first.</mark></h2><div class="industry-list">' + ''.join(f'<span>{e(name)}</span>' for name in INDUSTRIES) + '</div></section>'
about += f'<section class="page-cta paper-grid section-pad"><h2>Let’s understand your workflow.</h2><a class="pill" href="contact.html" data-page-link>Talk to us <span aria-hidden="true">↗</span></a></section>'
page('About','Learn how Avantage AI builds practical AI automation and custom software for owner-led businesses.',about,'about.html',active='About')

services = title_block('02 / SERVICES','Technology that fits <mark>the way you work.</mark>','Task automation, custom ERP and CRM platforms, web and mobile applications, sales and marketing workflows, ecommerce systems, reporting dashboards, and custom AI tools.')
services += '<section class="service-details section-pad">' + ''.join(service_section(service,i) for i,service in enumerate(SERVICES,1)) + '</section>'
services += '<section class="page-cta paper-grid section-pad"><h2>Not sure where to start?</h2><p>We can map your current workflow and identify the first system that will make a practical difference.</p><a class="pill" href="contact.html" data-page-link>Discuss a project <span aria-hidden="true">↗</span></a></section>'
page('Services','Custom ERP, CRM, AI automation, websites, web apps and mobile apps built around business workflows.',services,'services.html',active='Services')

works = title_block('03 / WORK','Thoughtful systems,<br><mark>real impact.</mark>','CRM and accounting systems, ERP, PLM, mobile apps, websites, and automation tools built for real business operations.')
works += '<section class="work-archive section-pad"><div class="section-label"><span>PROJECT ARCHIVE / 08</span><span class="scribble">open each story ↗</span></div><div class="archive-grid">'
for i,project in enumerate(PROJECTS,1):
    image = f'<img src="assets/{e(project["image"])}" alt="{e(project["title"])} project visual" loading="lazy">' if project['image'] else '<div class="archive-type-art">Quartzline<br><i>Minerals</i></div>'
    works += f'''<a class="archive-card" href="projects/{project['slug']}.html" data-page-link><div class="archive-image">{image}<span>0{i}</span></div><div class="archive-meta"><span class="case-category">{e(project['category'])}</span><h2>{e(project['title'])}</h2><p>{e(project['summary'])}</p><b aria-hidden="true">↗</b></div></a>'''
works += '</div></section><section class="page-cta paper-grid section-pad"><h2>Have a process we can improve?</h2><a class="pill" href="contact.html" data-page-link>Start a conversation <span aria-hidden="true">↗</span></a></section>'
page('Work','Selected Avantage AI projects across travel, manufacturing, steel, real estate, games, minerals and marketing.',works,'works.html',active='Work')

for i,project in enumerate(PROJECTS,1):
    image = f'<img src="../assets/{e(project["image"])}" alt="{e(project["title"])} project visual">' if project['image'] else '<div class="archive-type-art">Quartzline<br><i>Minerals</i></div>'
    related = ''.join(f'<a href="{slug}.html" data-page-link>{e(BY_SLUG[slug]["title"])} <span aria-hidden="true">↗</span></a>' for slug in project['related'])
    body = f'''<section class="content-hero paper-grid section-pad"><div class="section-label"><span>PROJECT / 0{i}</span><a href="../works.html" data-page-link>ALL WORK ↗</a></div><span class="case-category">{e(project['category'])}</span><h1>{e(project['title'])}<span class="heading-dot">.</span></h1><p>{e(project['summary'])}</p></section><section class="project-detail section-pad"><div class="project-visual">{image}</div><div class="project-facts"><div><span>CLIENT</span><strong>{e(project['client'])}</strong></div><div><span>PROJECT TYPE</span><strong>{e(project['category'])}</strong></div></div><div class="project-explanation"><h2>Built for the real operation.</h2><p>{e(project['summary'])}</p></div></section><section class="related section-pad paper-grid"><div class="section-label"><span>RELATED WORK</span><span class="scribble">keep exploring</span></div><div class="related-links">{related}</div></section>'''
    page(project['title'],project['summary'],body,f'projects/{project["slug"]}.html',prefix='../',active='Work')

blog = title_block('04 / INSIGHTS','Ideas for <mark>better operations.</mark>','Clear guides for owners who want software to do the repeated work. Practical examples of automation, ERP, CRM, WhatsApp workflows, dashboards, and business systems.')
blog += '<section class="article-index section-pad"><div class="section-label"><span>KNOWLEDGE BASE / 06 ARTICLES</span><span class="scribble">made for business owners</span></div><div class="article-grid">'
for article in ARTICLES:
    blog += f'''<a class="article-card" href="articles/{article['slug']}.html" data-page-link><img src="assets/article-{article['slug']}.png" alt="{e(article['title'])} illustration" loading="lazy"><div><span class="case-category">{e(article['category'])} / {e(article['meta'][1])}</span><h2>{e(article['title'])}</h2><p>{e(article['summary'])}</p><span class="article-date">{e(article['meta'][0])} <b aria-hidden="true">↗</b></span></div></a>'''
blog += '</div></section>'
page('Insights','Practical guides to AI automation, ERP, CRM, WhatsApp workflows, dashboards and business software.',blog,'blog.html',active='Insights')

for article in ARTICLES:
    blocks = ''
    for block in article['blocks']:
        tag = block['type']
        if tag in ('p','h2','h3'):
            blocks += f'<{tag}>{e(block["text"])}</{tag}>'
        elif tag in ('ul','ol'):
            blocks += f'<{tag}>' + ''.join(f'<li>{e(item)}</li>' for item in block['items']) + f'</{tag}>'
    body = f'''<section class="article-hero paper-grid section-pad"><a class="back-link" href="../blog.html" data-page-link>← ALL INSIGHTS</a><span class="case-category">{e(article['category'])}</span><h1>{e(article['title'])}</h1><p>{e(article['summary'])}</p><div class="article-meta"><span>{e(article['meta'][0])}</span><span>{e(article['meta'][1])}</span><span>By Avantage AI</span></div></section><article class="article-body section-pad"><img src="../assets/article-{article['slug']}.png" alt="{e(article['title'])} illustration"><div class="article-copy">{blocks}</div></article><section class="page-cta paper-grid section-pad"><h2>Want to put this into practice?</h2><p>We can map your workflow and show which tasks, reports, follow-ups, and dashboards should be automated first.</p><a class="pill" href="../contact.html" data-page-link>Talk to Avantage AI <span aria-hidden="true">↗</span></a></section>'''
    page(article['title'],article['summary'],body,f'articles/{article["slug"]}.html',prefix='../',active='Insights')

contact = title_block('05 / CONTACT','Let’s make <mark>work flow.</mark>','Talk to Avantage AI about reducing manual work, improving visibility, and supporting growth across operations, sales, customer service, accounting, and reporting.')
contact += '''<section class="contact-details section-pad"><div class="section-label"><span>GET IN TOUCH</span><span class="scribble">tell us what needs to change</span></div><div class="contact-grid"><div><span>CALL OR WHATSAPP</span><a href="tel:+919270856871">+91 92708 56871</a><p>Message on WhatsApp for the fastest response.</p></div><div><span>EMAIL</span><a href="mailto:contact@avantageai.com">contact@avantageai.com</a><p>Share your ERP, CRM, automation, app, or website project.</p></div><div><span>LOCATION</span><strong>Nagpur, Maharashtra, India</strong><p>Working with businesses across industries.</p></div></div></section><section class="callback paper-grid section-pad"><div class="section-label"><span>START A PROJECT</span><span class="scribble">a clear first conversation</span></div><div class="callback-grid"><div><h2>Tell us what you need to improve.</h2><p>Leave your phone number and tell us about the workflow. Our team aims to call within 24 hours to discuss your project.</p></div><form id="inquiry-form"><label>Your name<input name="name" autocomplete="name" required></label><label>Your email<input name="email" type="email" autocomplete="email" required></label><label>Your phone number<input name="phone" type="tel" autocomplete="tel" required></label><label>What would you like to improve?<textarea name="message" rows="5" required></textarea></label><button class="pill" type="submit">Prepare inquiry <span aria-hidden="true">↗</span></button><p class="form-note" role="status">Your email app will open a message for you to review and send.</p></form></div></section>'''
page('Contact','Contact Avantage AI in Nagpur about ERP, CRM, AI automation, apps or website projects.',contact,'contact.html',active='Contact')
print('Generated',4 + len(PROJECTS) + len(ARTICLES),'content pages')
