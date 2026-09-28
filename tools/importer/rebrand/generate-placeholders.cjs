// Generates neutral Kapoor Jewellers placeholder images (PNG) into content/media-da/
// and registers them in the Bright Data image sidecar so the importer maps
// placeholder URLs to the local copies.
// Run from the project root:
//   NODE_PATH=<playwright node_modules> node tools/importer/rebrand/generate-placeholders.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT_DIR = 'content/media-da';
const SIDECAR = 'tools/importer/bd-snapshots/www.tanishq.com/homepage.images.json';
const PLACEHOLDER_ORIGIN = 'https://placeholder.kapoorjewellers.example';

// name -> [width, height, label, theme]
const SLOTS = {
  category: [600, 700, 'Category photo', 'light'],
  product: [720, 720, 'Product photo', 'white'],
  spotlight: [800, 800, 'Spotlight feature', 'dark'],
  testimonial: [960, 540, 'Customer story', 'dark'],
  occasion: [800, 800, 'Occasion photo', 'light'],
  collection: [800, 800, 'Collection feature', 'dark'],
  audience: [600, 600, 'Audience photo', 'light'],
  'showcase-poster': [800, 900, 'Kids collection feature', 'dark'],
  gifting: [800, 800, 'Gift idea', 'light'],
  store: [800, 800, 'Boutique photo', 'light'],
  divider: [240, 64, '', 'ornament'],
};
for (let i = 1; i <= 10; i += 1) {
  SLOTS[`hero-desktop-${i}`] = [1920, 640, `Hero banner ${i}`, 'dark'];
  SLOTS[`hero-mobile-${i}`] = [800, 800, `Hero banner ${i}`, 'dark'];
}

const THEMES = {
  dark: { bg: 'linear-gradient(135deg, #54090a 0%, #832729 100%)', fg: '#f3dfb3', sub: 'rgb(255 255 255 / 70%)' },
  light: { bg: 'linear-gradient(135deg, #f8f3e8 0%, #efe2cc 100%)', fg: '#832729', sub: '#8a6d5b' },
  white: { bg: '#fff', fg: '#832729', sub: '#8a6d5b' },
};

function html(name, [w, h, label, theme]) {
  if (theme === 'ornament') {
    return `<html><body style="margin:0;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;background:transparent">
      <div style="display:flex;align-items:center;gap:14px;width:80%">
        <span style="flex:1;height:2px;background:#c49d8e"></span>
        <span style="width:14px;height:14px;transform:rotate(45deg);border:2px solid #832729"></span>
        <span style="flex:1;height:2px;background:#c49d8e"></span>
      </div></body></html>`;
  }
  const t = THEMES[theme];
  const scale = Math.min(w, h) / 800;
  return `<html><body style="margin:0;width:${w}px;height:${h}px;background:${t.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Georgia,serif;text-align:center">
    <div style="border:${Math.max(2, 3 * scale)}px solid ${t.fg};opacity:.35;position:absolute;inset:${Math.round(24 * scale)}px"></div>
    <div style="color:${t.fg};font-size:${Math.round(64 * scale)}px;letter-spacing:.04em">Kapoor Jewellers</div>
    <div style="color:${t.sub};font:${Math.round(30 * scale)}px/1.4 Arial,sans-serif;margin-top:${Math.round(16 * scale)}px">${label}</div>
    <div style="color:${t.sub};font:${Math.round(22 * scale)}px/1.4 Arial,sans-serif;margin-top:${Math.round(8 * scale)}px;opacity:.8">Placeholder · ${w}×${h}</div>
  </body></html>`;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const sidecar = JSON.parse(fs.readFileSync(SIDECAR, 'utf-8'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [name, spec] of Object.entries(SLOTS)) {
    const [w, h] = spec;
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html(name, spec));
    const file = `kapoor-${name}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, file), omitBackground: spec[3] === 'ornament' });
    sidecar[`${PLACEHOLDER_ORIGIN}/${file}`] = `/media-da/${file}`;
  }
  await browser.close();
  fs.writeFileSync(SIDECAR, JSON.stringify(sidecar, null, 2));
  console.log(`generated ${Object.keys(SLOTS).length} placeholders; sidecar entries: ${Object.keys(sidecar).length}`);
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
