// Contact sheet of downloaded nav images (content/images/nav) for a branding review.
// Usage: node nav-contact-sheet.cjs [prefix...]  e.g. banner big
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const prefixes = process.argv.slice(2);
const dir = 'content/images/nav';
const files = fs.readdirSync(dir).filter((f) => !f.startsWith('tool-') && (!prefixes.length || prefixes.some((p) => f.startsWith(`${p}-`))));

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const cells = files.map((f, i) => {
    const data = fs.readFileSync(path.join(dir, f)).toString('base64');
    const mime = f.endsWith('.png') ? 'image/png' : f.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';
    return `<figure style="margin:0;border:1px solid #ccc;padding:4px"><img src="data:${mime};base64,${data}" style="width:100%;height:170px;object-fit:contain;background:#f4f4f4"><figcaption style="font:11px Arial;word-break:break-all">#${i + 1} ${f}</figcaption></figure>`;
  }).join('');
  await page.setContent(`<body style="margin:8px;display:grid;grid-template-columns:repeat(6,1fr);gap:8px">${cells}</body>`);
  await page.screenshot({ path: `migration-work/nav-contact-sheet${prefixes.length ? `-${prefixes.join('-')}` : ''}.png`, fullPage: true });
  console.log(`${files.length} images`);
  await b.close();
})();
