// Builds the Kapoor Jewellers header fragment (content/nav.plain.html) from the source
// megamenu model (migration-work/navigation-validation/source-nav-model.json):
// - downloads menu images (via the identical tanishq.ae mirror path) to content/images/nav/
// - writes simple line-icon SVGs for the header tools
// - rebrands text and rewrites links to site-relative paths
// Flat DA-safe markup: top-level section <div>s only, no classes/ids/data/style, no forms.
// Run from the project root: node tools/importer/rebrand/build-nav.cjs
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MODEL = 'migration-work/navigation-validation/source-nav-model.json';
const IMG_DIR = 'content/images/nav';
const OUT = 'content/nav.plain.html';
const BRAND = 'Kapoor Jewellers';

// Tanishq-branded programme names get neutral Kapoor Jewellers equivalents.
const RENAMES = [
  [/\bEncircle\b/g, 'Kapoor Rewards'],
  [/Tanishq/gi, BRAND],
];
const PATH_RENAMES = [
  [/about-tanishq/gi, 'about-kapoor-jewellers'],
  [/encircle/gi, 'kapoor-rewards'],
  [/tanishq/gi, 'kapoor'],
];

const TYPE_BY_STYLE = {
  'small-image-title': 'card',
  'big-image-title': 'big',
  'icon-with-text': 'icon',
  'title-only': 'chip',
};

// Only these pages exist in the POC; other internal links go to the coming-soon page,
// keeping the intended destination in ?from= for when that page is built.
const BUILT_PAGES = ['/', '/index', '/coming-soon'];
const comingSoon = (target) => (BUILT_PAGES.includes(target.split(/[?#]/)[0]) ? target : `/coming-soon?from=${encodeURIComponent(target)}`);

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => String(s || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'item';
const rebrand = (s) => RENAMES.reduce((acc, [re, to]) => acc.replace(re, to), String(s || ''));

function rel(href) {
  if (!href || href === '#' || /^javascript:/i.test(href)) return '#';
  let url;
  try {
    url = new URL(href, 'https://www.tanishq.com');
  } catch (e) {
    return '#';
  }
  if (!/(^|\.)tanishq\.(com|ae|co\.in)$/i.test(url.hostname)) return href;
  ['lang', 'utm_source', 'utm_medium', 'utm_campaign'].forEach((p) => url.searchParams.delete(p));
  const pathname = PATH_RENAMES.reduce((acc, [re, to]) => acc.replace(re, to), url.pathname || '/').replace(/\.html$/, '');
  const search = url.searchParams.toString();
  return comingSoon(`${pathname}${search ? `?${search}` : ''}${url.hash}`);
}

const downloads = new Map(); // source url -> local file name

function localName(src, type, label) {
  if (downloads.has(src)) return downloads.get(src);
  const ext = (path.extname(new URL(src).pathname) || '.jpg').toLowerCase();
  const hash = crypto.createHash('md5').update(src).digest('hex').slice(0, 6);
  const name = `${type}-${slug(label)}-${hash}${ext}`;
  downloads.set(src, name);
  return name;
}

// Source images that show the source brand's logo/endorsements; replaced with Kapoor
// Jewellers artwork by design-nav-art.cjs, so never re-downloaded here.
const GENERATED = ['big-gold-exchange', 'big-kapoor-jewellers-egift-card', 'banner-more-exchange-program'];

async function download(src, name) {
  const target = path.join(IMG_DIR, name);
  if (fs.existsSync(target) && fs.statSync(target).size > 0) return true;
  if (GENERATED.some((prefix) => name.startsWith(prefix))) return false;
  const candidates = [src, src.replace('://www.tanishq.com/', '://www.tanishq.ae/')];
  for (const url of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(url);
      const type = res.headers.get('content-type') || '';
      if (res.ok && type.startsWith('image/')) {
        // eslint-disable-next-line no-await-in-loop
        fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
        return true;
      }
    } catch (e) { /* try next */ }
  }
  return false;
}

const ICON = (paths) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#343434" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>\n`;
const TOOL_ICONS = {
  'tool-search.svg': ICON('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>'),
  'tool-diamond.svg': ICON('<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16M15 4l-3 16"/>'),
  'tool-stores.svg': ICON('<path d="M3 9 5 4h14l2 5"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v7h14v-7M10 20v-4h4v4"/>'),
  'tool-account.svg': ICON('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  'tool-wishlist.svg': ICON('<path d="M12 20s-7.5-4.6-9-9.3C2 7.4 4.2 4.5 7.3 4.5c2 0 3.6 1.2 4.7 2.9 1.1-1.7 2.7-2.9 4.7-2.9 3.1 0 5.3 2.9 4.3 6.2C19.5 15.4 12 20 12 20z"/>'),
  'tool-cart.svg': ICON('<path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
};

(async () => {
  const model = JSON.parse(fs.readFileSync(MODEL, 'utf-8'));
  fs.mkdirSync(IMG_DIR, { recursive: true });
  Object.entries(TOOL_ICONS).forEach(([file, svg]) => fs.writeFileSync(path.join(IMG_DIR, file), svg));

  const lines = [];
  const imgTag = (src, type, label, alt) => {
    const name = localName(src, type, label);
    return `<img src="images/nav/${name}" alt="${esc(alt)}">`;
  };

  // 1. announcement bar
  lines.push('<div>', `<p>Welcome offer: $25 off your first diamond jewellery order of $500 or more. T&amp;Cs apply. (Sample offer)</p>`, '</div>');

  // 2. brand (text wordmark, no logo image)
  lines.push('<div>', `<p><a href="/">${BRAND}</a></p>`, '</div>');

  // 3. tools
  const tools = [
    ['/search', 'tool-search.svg', 'Search'],
    ['/jewelry/diamond', 'tool-diamond.svg', 'Diamond Jewellery'],
    ['/stores', 'tool-stores.svg', 'Stores'],
    ['/account', 'tool-account.svg', 'Account'],
    ['/wishlist', 'tool-wishlist.svg', 'Wishlist'],
    ['/cart', 'tool-cart.svg', 'Cart'],
  ];
  lines.push('<div>', '<ul>');
  tools.forEach(([href, icon, label]) => lines.push(`<li><a href="${comingSoon(href)}"><img src="images/nav/${icon}" alt="${label}">${label}</a></li>`));
  lines.push('</ul>', '</div>');

  // 4. main navigation with megamenus (heading is shown above the mobile category grid)
  lines.push('<div>', '<h2>Explore categories</h2>', '<ul>');
  model.triggers.forEach((t) => {
    const label = rebrand(t.label);
    const href = rel(t.href);
    if (!t.tabs.length) {
      lines.push(`<li><a href="${href}">${esc(label)}</a></li>`);
      return;
    }
    lines.push(`<li><a href="${href}">${esc(label)}</a>`, '<ul>');
    t.tabs.forEach((tab) => {
      const type = TYPE_BY_STYLE[tab.style] || 'chip';
      const tabLabel = rebrand(tab.label);
      lines.push(`<li><a href="${rel(tab.href)}">${esc(tabLabel)}</a>`);
      if (tab.items.length) {
        lines.push('<ul>');
        tab.items.forEach((item) => {
          const text = rebrand(item.text);
          const pic = item.img && type !== 'chip' ? imgTag(item.img, type, text, text) : '';
          lines.push(`<li><a href="${rel(item.href)}">${pic}${esc(text)}</a></li>`);
        });
        lines.push('</ul>');
      }
      if (tab.explore) lines.push(`<p><a href="${rel(tab.explore.href)}">${esc(rebrand(tab.explore.text))}</a></p>`);
      if (tab.banner && tab.banner.img) {
        const caption = rebrand(tab.banner.caption);
        lines.push(`<p><a href="${rel(tab.banner.href)}">${imgTag(tab.banner.img, 'banner', `${label}-${tabLabel}`, caption || `${label} feature`)}</a></p>`);
        if (caption) lines.push(`<p>${esc(caption)}</p>`);
      }
      lines.push('</li>');
    });
    lines.push('</ul>', '</li>');
  });
  lines.push('</ul>', '</div>');

  // 5. mobile drawer extras (account card + account links)
  lines.push('<div>', '<h2>Access Your Account</h2>', `<p><a href="${comingSoon('/account')}">Sign In</a></p>`, '<ul>');
  (model.mobileLinks || []).forEach((l) => lines.push(`<li><a href="${rel(l.href)}">${esc(rebrand(l.text))}</a></li>`));
  lines.push('</ul>', '</div>');

  let ok = 0;
  const failed = [];
  for (const [src, name] of downloads) {
    // eslint-disable-next-line no-await-in-loop
    if (await download(src, name)) ok += 1; else failed.push(src);
  }
  fs.writeFileSync(OUT, `${lines.join('\n')}\n`);
  console.log(`nav written: ${OUT}; images ${ok}/${downloads.size} downloaded${failed.length ? `; FAILED: ${failed.join(', ')}` : ''}`);
})();
