// Reports leftover source-brand mentions and non-placeholder images in the imported homepage.
// Run from the project root: node tools/importer/rebrand/check-rebrand.cjs
const fs = require('fs');

const html = fs.readFileSync('content/homepage.plain.html', 'utf-8');
const mentions = {};
for (const m of html.matchAll(/.{0,50}(tanishq|tata).{0,30}/gi)) {
  const key = m[0].replace(/[0-9a-f]{8,}/g, '#');
  mentions[key] = (mentions[key] || 0) + 1;
}
console.log(`brand mentions: ${Object.values(mentions).reduce((a, b) => a + b, 0)}`);
Object.entries(mentions).slice(0, 20).forEach(([k, v]) => console.log(`  ${v}x ${k}`));

const others = [...html.matchAll(/<img src="([^"]+)"[^>]*>/g)]
  .filter((m) => !m[1].startsWith('/media-da/kapoor-'))
  .map((m) => m[0]);
console.log(`non-placeholder images: ${others.length}`);
others.forEach((o) => console.log(`  ${o}`));
