const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('dist/index.html', 'utf8');
const css = fs.readFileSync('dist/content.css', 'utf8');
const script = fs.readFileSync('dist/script.js', 'utf8');

assert.match(html, /data-ai-network/, 'hero includes the connected AI network');
assert.doesNotMatch(html, /class="hero-tools"/, 'old four-corner tool layout is removed');
for (const tool of ['ChatGPT', 'Claude', 'GitHub Copilot', 'Gemini', 'Midjourney', 'Perplexity', 'Runway', 'Canva', 'Grok', 'DeepSeek', 'Kling AI', 'Suno', 'Lovable', 'Replit', 'Leonardo AI']) {
  assert.match(html, new RegExp(`aria-label="${tool}"`), `${tool} is represented as a network node`);
}
assert.ok((html.match(/class="ai-network-path\b/g) || []).length >= 15, 'every tool has a visible connection to the AI core');
assert.ok((html.match(/class="ai-network-node\b/g) || []).length >= 15, 'network contains all tool nodes');
assert.match(css, /\.ai-network-path/, 'network paths are animated');
assert.match(css, /prefers-reduced-motion[\s\S]*ai-network/, 'network provides a reduced-motion fallback');
assert.match(script, /data-ai-network/, 'network supports pointer-responsive movement');

console.log('hero AI network contract verified');
