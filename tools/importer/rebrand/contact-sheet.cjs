// Renders every non-placeholder image in the imported homepage onto numbered contact sheets
// (migration-work/contact-sheet-N.png) so they can be reviewed for visible branding.
// Run from the project root with Playwright on NODE_PATH.
const fs = require('fs');
const { chromium } = require('playwright');

const PER_SHEET = 24;
const html = fs.readFileSync('content/homepage.plain.html', 'utf-8');
const srcs = [...new Set([...html.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]))]
  .filter((s) => !s.startsWith('/media-da/kapoor-'))
  .map((s) => (s.startsWith('/') ? `http://localhost:3000/content${s}` : s));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const index = [];
  for (let sheet = 0; sheet * PER_SHEET < srcs.length; sheet += 1) {
    const batch = srcs.slice(sheet * PER_SHEET, (sheet + 1) * PER_SHEET);
    const cells = batch.map((s, i) => {
      const n = sheet * PER_SHEET + i + 1;
      index.push({ n, src: s });
      return `<figure style="margin:0;border:1px solid #ccc;padding:4px"><img src="${s}" style="width:100%;height:230px;object-fit:contain;background:#f4f4f4"><figcaption style="font:bold 16px Arial">#${n}</figcaption></figure>`;
    }).join('');
    await page.setContent(`<body style="margin:8px;display:grid;grid-template-columns:repeat(6,1fr);gap:8px">${cells}</body>`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.screenshot({ path: `migration-work/contact-sheet-${sheet + 1}.png`, fullPage: true });
  }
  fs.writeFileSync('migration-work/contact-sheet-index.json', JSON.stringify(index, null, 2));
  console.log(`${srcs.length} images on ${Math.ceil(srcs.length / PER_SHEET)} sheets`);
  await browser.close();
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
