// Renders the header tool icons and footer icons (SVG) to PNG in content/media-da/, because
// SVG images are not served from documents on DA/EDS. Output names: media-da/<prefix>-<name>.png
// Run from the project root with Playwright on NODE_PATH.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SOURCES = [
  ['content/images/nav', 'nav', /^tool-.*\.svg$/],
  ['content/images/footer', 'footer', /\.svg$/],
];

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ deviceScaleFactor: 2 });
  let count = 0;
  for (const [dir, prefix, re] of SOURCES) {
    for (const file of fs.readdirSync(dir).filter((f) => re.test(f))) {
      const svg = fs.readFileSync(path.join(dir, file), 'utf-8');
      const w = Number((svg.match(/width="(\d+)"/) || [])[1] || 24);
      const h = Number((svg.match(/height="(\d+)"/) || [])[1] || 24);
      await page.setViewportSize({ width: w, height: h });
      await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
      const out = path.join('content/media-da', `${prefix}-${file.replace(/\.svg$/, '.png')}`);
      await page.locator('svg').screenshot({ path: out, omitBackground: true });
      count += 1;
    }
  }
  console.log(`rendered ${count} icons`);
  await b.close();
})();
