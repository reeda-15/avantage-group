const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const html = fs.readFileSync(path.join(__dirname, '../dist/cinematic-preview.html'), 'utf8');
const ids = ['system-overview', 'ai-agents', 'automations', 'custom-software', 'data-insights', 'creative-ai', 'our-work', 'systems-finale'];
const headings = ['Every part of your business. Working as one.', 'A team that can think, act, and report.', 'From repetitive work to reliable systems.', 'Software shaped around the business.', 'Decisions arrive with the evidence.', 'A production system for every campaign.', 'Connected systems. Real business work.', 'Your business already has the moving parts. We make them work as one.'];
const text = value => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

test('publishes edition framing and loads its stylesheet', () => {
  assert.match(html, /<title>Avantage AI — The Connected Systems Edition<\/title>/);
  assert.match(html, /class="edition-marker"[^>]*>Systems 2026<\//);
  assert.match(html, /<link\b[^>]*rel="stylesheet"[^>]*href="connected-systems\.css(?:\?[^\"]*)?"/);
  assert.ok(fs.existsSync(path.join(__dirname, '../dist/connected-systems.css')));
});

test('has one main after the cinematic hero and keeps conversion sections after the finale', () => {
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  const main = html.match(/<main\b[^>]*class="connected-systems-main"[^>]*>([\s\S]*?)<\/main>/);
  assert.ok(main, 'connected systems main must exist');
  const stage = html.match(/<section\b[^>]*class="stage"[\s\S]*?<\/section>/);
  assert.ok(stage);
  assert.ok(main.index > stage.index + stage[0].length, 'main follows the complete hero');
  assert.ok(html.indexOf('id="callback"') > html.indexOf('id="systems-finale"'));
  assert.ok(html.indexOf('id="brief"') > html.indexOf('id="callback"'));
  assert.match(html, /id="callback-form"/);
  assert.match(html, /id="brief-form"/);
});

test('all chapters are readable ordered HTML without scripts or video metadata', () => {
  const staticHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<video\b[^>]*>[\s\S]*?<\/video>/g, '');
  const main = staticHtml.match(/<main\b[^>]*class="connected-systems-main"[^>]*>([\s\S]*?)<\/main>/);
  assert.ok(main, 'chapters exist before any script or media event');
  let previous = -1;
  ids.forEach((id, index) => {
    const section = main[1].match(new RegExp(`<section\\b[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/section>`));
    assert.ok(section, `${id} is a semantic section`);
    assert.ok(section.index > previous, `${id} follows the previous chapter`);
    previous = section.index;
    assert.doesNotMatch(section[0], /\b(?:hidden|inert)\b|aria-hidden="true"/, 'essential chapter is exposed');
    const heading = section[1].match(/<h2\b[^>]*id="([^\"]+)"[^>]*>([\s\S]*?)<\/h2>/);
    assert.ok(heading, `${id} has a level two heading`);
    assert.equal(text(heading[2]), headings[index]);
    assert.match(section[0], new RegExp(`aria-labelledby="${heading[1]}"`));
    assert.match(section[1], /<p\b[^>]*>[^<]+<\/p>/, `${id} has readable supporting content`);
  });
});
