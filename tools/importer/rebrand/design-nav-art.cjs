// Designs Kapoor Jewellers replacements for the megamenu images that carried the source
// brand (gold exchange card, e-gift card, exchange programme banner). Writes over the
// matching files in content/images/nav/ (names from build-nav.cjs GENERATED list).
// Run from the project root with Playwright on NODE_PATH.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = 'content/images/nav';
const FONTS = 'https://api.fontshare.com/v2/css?f[]=gambetta@400,500&f[]=satoshi@400,500,700&display=swap';
const find = (prefix) => fs.readdirSync(DIR).find((f) => f.startsWith(prefix));

const wrap = (w, h, body) => `<!doctype html><html><head><link rel="stylesheet" href="${FONTS}"><style>
  body{margin:0;width:${w}px;height:${h}px;overflow:hidden;font-family:Satoshi,Arial,sans-serif}
  .serif{font-family:Gambetta,Georgia,serif}
  .eyebrow{letter-spacing:.26em;text-transform:uppercase;font-weight:500}
  .orn{display:flex;align-items:center;gap:12px;width:190px;margin:0 auto}
  .orn span{flex:1;height:2px;background:currentColor}
  .orn i{width:12px;height:12px;transform:rotate(45deg);border:2px solid currentColor}
</style></head><body>${body}</body></html>`;

const ornament = '<div class="orn"><span></span><i></i><span></span></div>';

const ART = {
  'big-gold-exchange': [600, 600, wrap(600, 600, `
    <div style="width:600px;height:600px;background:#fbf6ec;display:flex;align-items:center;justify-content:center">
      <div style="width:520px;height:520px;border:3px solid #c9a15b;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#b07a22;text-align:center">
        ${ornament}
        <div class="serif" style="font-size:44px;color:#832729;margin-top:26px">Kapoor Jewellers</div>
        <div class="serif" style="font-size:72px;line-height:1.05;margin:18px 0">Gold<br>Exchange</div>
        ${ornament}
      </div>
    </div>`)],
  'big-kapoor-jewellers-egift-card': [600, 600, wrap(600, 600, `
    <div style="width:600px;height:600px;background:linear-gradient(135deg,#f3e6cf,#e6cfa8);display:flex;align-items:center;justify-content:center">
      <div style="width:420px;height:264px;border-radius:18px;background:linear-gradient(135deg,#832729,#54090a);box-shadow:0 18px 40px rgb(84 9 10 / 35%);transform:rotate(-8deg);color:#f3dfb3;display:flex;flex-direction:column;justify-content:space-between;padding:30px 34px;box-sizing:border-box">
        <div class="eyebrow" style="font-size:15px">Kapoor Jewellers</div>
        <div class="serif" style="font-size:54px">Gift Card</div>
        <div style="font-size:15px;opacity:.8">Sample design</div>
      </div>
    </div>`)],
  'banner-more-exchange-program': [640, 640, wrap(640, 640, `
    <div style="width:640px;height:640px;background:linear-gradient(160deg,#54090a,#832729);color:#f3dfb3;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative">
      <div style="position:absolute;inset:28px;border:2px solid rgb(243 223 179 / 45%)"></div>
      <div class="eyebrow" style="font-size:18px">Kapoor Jewellers</div>
      <div class="serif" style="font-size:66px;line-height:1.08;color:#fff;margin:24px 0">Exchange your<br>old gold</div>
      ${ornament}
      <div style="font-size:22px;margin-top:24px;color:rgb(255 255 255 / 80%)">Visit your nearest boutique</div>
    </div>`)],
};

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage();
  for (const [prefix, [w, h, html]] of Object.entries(ART)) {
    const file = find(prefix);
    if (!file) { console.log(`skip ${prefix}: no file`); continue; }
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(DIR, file), type: file.endsWith('.png') ? 'png' : 'jpeg', quality: file.endsWith('.png') ? undefined : 90 });
    console.log(`designed ${file}`);
  }
  await b.close();
})();
