// Designs original Kapoor Jewellers artwork (hero banners, collection/spotlight tiles,
// testimonial quote cards, boutique cards) and writes it over the matching placeholder files
// in content/media-da/ (names used by transformers/kapoor-rebrand.js). Photos are the
// unbranded demo photos already localised under /media-da/ (served by the local preview).
// Run from the project root with the preview on localhost:3000 and Playwright on NODE_PATH.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = 'content/media-da';
const SIDECAR = 'tools/importer/bd-snapshots/www.tanishq.com/homepage.images.json';
const ORIGIN = 'https://placeholder.kapoorjewellers.example';
const MEDIA = 'http://localhost:3000/content/media-da';
const FONTS = 'https://api.fontshare.com/v2/css?f[]=gambetta@400,500&f[]=satoshi@400,500,700&display=swap';

const PHOTO = {
  bridal: 'c31f233fe1ed327067d24a95f2054f75.png',
  necklace: '155f6ef130963681fb26a991535e9106.png',
  earrings: 'c31f233fe1ed327067d24a95f2054f75.png',
  pendant: 'aa6a4ebac9a7da431549aaf71656eec2.png',
  ring: '614ce6f22c78fa96de97d841e7926142.png',
  bangle: '13557963647e89cde44f2e9f05317cde.png',
  modelBridal: '7ac9ff0b8cab62e1055033cf5bf5b932.png',
  modelEveryday: '4595cb42ec1977207f4b8bd866140e5b.png',
  modelFestive: 'f4611b6afc452f72875150919d77ffa9.png',
  feather: '21c7f5ee7a1f7f8016a53bf7d4d84432.png',
  mensRing: 'a1b5d2b3c5179d7c6c3a1a502e3d463c.png',
  kids: '56dd9e86ae35df35000af712e63dda9e.png',
  solitaire: '690c16ec910bb8773e9ecf5aeaa404d0.png',
  kidsBracelet: '551a7c6a49cea7aae72982e15c08d695.png',
};

const HERO = [
  ['modelBridal', 'The Bridal Edit', 'Heirloom pieces for the most special day.', 'Discover'],
  ['necklace', 'Timeless Gold, Crafted for You', 'Designs made to be worn and treasured.', 'Shop Now'],
  ['earrings', 'Diamonds That Tell Your Story', 'Brilliance for every milestone.', 'Explore Diamonds'],
  ['modelEveryday', 'Everyday Elegance', 'Light, wearable jewellery for every day.', 'Shop Everyday'],
  ['kids', 'Little Treasures', 'Playful gold for the little ones.', 'Shop Kids'],
  ['modelFestive', 'Festive Season Sparkle', 'Celebrate in gold and gemstones.', 'Shop Festive'],
  ['feather', 'New Arrivals', 'Fresh from the Kapoor Jewellers design studio.', "See What's New"],
  ['bangle', 'Gold That Lasts Generations', 'Bangles and bracelets, finely finished.', 'Shop Bangles'],
  ['solitaire', 'Gifts to Treasure', 'Thoughtful jewellery for the people you love.', 'Find a Gift'],
  ['mensRing', 'Crafted for Him', 'Bold rings and chains for men.', 'Shop Men'],
];

const COLLECTIONS = [
  ['collection-1', 'ring', 'Signature', 'Collection'],
  ['collection-2', 'pendant', 'Gemstone', 'Collection'],
  ['collection-3', 'bangle', 'Festive Gold', 'Collection'],
];

const QUOTES = [
  ['testimonial-1', 'The craftsmanship on my wedding set was flawless, and the team made choosing it a joy.', 'Sample customer, Edison'],
  ['testimonial-2', 'I found the perfect anniversary gift in minutes. Beautiful work and warm service.', 'Sample customer, Chicago'],
];

const STORES = ['Edison', 'Chicago', 'Dallas'];

const base = (w, h, body, extraCss = '') => `<!doctype html><html><head><link rel="stylesheet" href="${FONTS}">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; width: ${w}px; height: ${h}px; overflow: hidden; font-family: Satoshi, Arial, sans-serif; }
  .serif { font-family: Gambetta, Georgia, serif; }
  .eyebrow { letter-spacing: .28em; text-transform: uppercase; color: #e7c98f; font-weight: 500; }
  .cta { display: inline-block; border: 1px solid #e7c98f; color: #fff; border-radius: 4px; font-weight: 500; }
  ${extraCss}
</style></head><body>${body}</body></html>`;

function heroDesktop([photo, title, sub, cta]) {
  return base(1920, 640, `
  <div style="display:flex;width:1920px;height:640px;background:linear-gradient(120deg,#54090a,#832729)">
    <div style="flex:0 0 46%;padding:0 110px;display:flex;flex-direction:column;justify-content:center;color:#fff">
      <div class="eyebrow" style="font-size:22px">Kapoor Jewellers</div>
      <div class="serif" style="font-size:82px;line-height:1.08;margin:26px 0 20px">${title}</div>
      <div style="font-size:28px;color:rgb(255 255 255 / 80%);margin-bottom:40px">${sub}</div>
      <div><span class="cta" style="font-size:24px;padding:14px 34px">${cta}</span></div>
    </div>
    <div style="flex:1;position:relative;background:url('${MEDIA}/${PHOTO[photo]}') center/cover">
      <div style="position:absolute;inset:0;background:linear-gradient(90deg,#6b1719 0%,rgb(107 23 25 / 0%) 22%)"></div>
    </div>
  </div>`);
}

function heroMobile([photo, title, sub, cta]) {
  return base(800, 800, `
  <div style="position:relative;width:800px;height:800px;background:url('${MEDIA}/${PHOTO[photo]}') center/cover">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgb(84 9 10 / 0%) 35%,rgb(84 9 10 / 92%) 78%)"></div>
    <div style="position:absolute;left:56px;right:56px;bottom:60px;color:#fff">
      <div class="eyebrow" style="font-size:20px">Kapoor Jewellers</div>
      <div class="serif" style="font-size:62px;line-height:1.08;margin:16px 0 12px">${title}</div>
      <div style="font-size:24px;color:rgb(255 255 255 / 85%);margin-bottom:26px">${sub}</div>
      <span class="cta" style="font-size:22px;padding:12px 28px">${cta}</span>
    </div>
  </div>`);
}

function collectionTile([, photo, name, suffix]) {
  return base(800, 800, `
  <div style="position:relative;width:800px;height:800px;background:url('${MEDIA}/${PHOTO[photo]}') center/cover">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgb(0 0 0 / 0%) 45%,rgb(40 8 8 / 70%) 100%)"></div>
    <div style="position:absolute;left:60px;bottom:64px;color:#fff">
      <div class="serif" style="font-size:78px;line-height:1">${name}</div>
      <div class="eyebrow" style="font-size:22px;margin-top:14px">${suffix} · Kapoor Jewellers</div>
    </div>
  </div>`);
}

function spotlightTile() {
  return base(800, 800, `<div style="width:800px;height:800px;background:url('${MEDIA}/${PHOTO.feather}') center/cover"></div>`);
}

function quoteCard([, quote, who]) {
  return base(960, 540, `
  <div style="width:960px;height:540px;background:linear-gradient(135deg,#f8f3e8,#efe2cc);display:flex;flex-direction:column;justify-content:center;padding:0 110px;color:#54090a">
    <div class="serif" style="font-size:150px;line-height:.6;color:#c49d8e">&ldquo;</div>
    <div class="serif" style="font-size:44px;line-height:1.3;margin:10px 0 28px">${quote}</div>
    <div style="font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:#832729">${who}</div>
  </div>`);
}

function storeCard(city) {
  return base(800, 800, `
  <div style="width:800px;height:800px;background:linear-gradient(160deg,#54090a,#832729);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;position:relative">
    <div style="position:absolute;inset:32px;border:2px solid rgb(231 201 143 / 50%)"></div>
    <div style="display:flex;align-items:center;gap:18px;width:300px;margin-bottom:36px">
      <span style="flex:1;height:2px;background:#e7c98f"></span>
      <span style="width:18px;height:18px;transform:rotate(45deg);border:2px solid #e7c98f"></span>
      <span style="flex:1;height:2px;background:#e7c98f"></span>
    </div>
    <div class="serif" style="font-size:72px">Kapoor Jewellers</div>
    <div class="eyebrow" style="font-size:26px;margin-top:22px">${city} Boutique</div>
    <div style="font-size:20px;color:rgb(255 255 255 / 70%);margin-top:40px">Sample location</div>
  </div>`);
}

(async () => {
  const sidecar = JSON.parse(fs.readFileSync(SIDECAR, 'utf-8'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const jobs = [];
  HERO.forEach((h, i) => {
    jobs.push([`hero-desktop-${i + 1}`, 1920, 640, heroDesktop(h)]);
    jobs.push([`hero-mobile-${i + 1}`, 800, 800, heroMobile(h)]);
  });
  COLLECTIONS.forEach((c) => jobs.push([c[0], 800, 800, collectionTile(c)]));
  jobs.push(['spotlight', 800, 800, spotlightTile()]);
  // replaces the one gifting photo that showed the source brand's logo
  jobs.push(['gifting', 800, 800, base(800, 800, `<div style="width:800px;height:800px;background:url('${MEDIA}/${PHOTO.necklace}') center/cover"></div>`)]);
  QUOTES.forEach((q) => jobs.push([q[0], 960, 540, quoteCard(q)]));
  STORES.forEach((city) => jobs.push([`store-${city.toLowerCase()}`, 800, 800, storeCard(city)]));
  for (const [name, w, h, html] of jobs) {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const file = `kapoor-${name}.png`;
    await page.screenshot({ path: path.join(OUT, file) });
    sidecar[`${ORIGIN}/${file}`] = `/media-da/${file}`;
  }
  await browser.close();
  fs.writeFileSync(SIDECAR, JSON.stringify(sidecar, null, 2));
  console.log(`designed ${jobs.length} images`);
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
