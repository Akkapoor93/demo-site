// Builds the POC shop catalogue (data/products.json) from the product cards on the imported
// homepage (content/index.plain.html): SKU (from the product link), name, price, category,
// image. Images use the public tanishq.ae mirror URL (demo photos, internal POC only) so they
// load everywhere; local /media-da copies are mapped back to their source URL first.
// Run from the project root: node tools/importer/rebrand/build-catalog.cjs
const fs = require('fs');

const HTML = 'content/index.plain.html';
const SIDECAR = 'tools/importer/bd-snapshots/www.tanishq.com/homepage.images.json';
const OUT = 'data/products.json';

const html = fs.readFileSync(HTML, 'utf-8');
const sidecar = JSON.parse(fs.readFileSync(SIDECAR, 'utf-8'));
const reverse = Object.fromEntries(Object.entries(sidecar).map(([src, local]) => [local, src]));

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#x26;/g, '&').replace(/&quot;/g, '"').trim();

function imageUrl(src) {
  const original = src.startsWith('/media-da/') ? reverse[src] : src;
  if (!original || original.includes('placeholder.kapoorjewellers')) return null;
  const url = new URL(original.replace('://www.tanishq.com/', '://www.tanishq.ae/'));
  url.searchParams.set('sw', '640');
  url.searchParams.set('sh', '640');
  return url.toString();
}

function category(name) {
  if (/earring|jhumka|stud/i.test(name)) return 'Earrings';
  if (/\bring\b/i.test(name)) return 'Rings';
  if (/necklace|haaram|choker/i.test(name)) return 'Necklaces';
  if (/pendant/i.test(name)) return 'Pendants';
  if (/bangle|bracelet/i.test(name)) return 'Bangles & Bracelets';
  if (/nose pin/i.test(name)) return 'Nose Pins';
  if (/mangalsutra/i.test(name)) return 'Mangalsutras';
  return 'Jewellery';
}

const metal = (name) => {
  const k = name.match(/(\d{2})\s*K[Tt]/);
  if (k) return `${k[1]}KT gold`;
  if (/diamond/i.test(name)) return 'gold and diamonds';
  return 'gold';
};

// product links: /product/<slug> (original) or /product?sku=<SKU> (after the shop rewrite)
const LINK = '(/product/[^"]+|/product\\?sku=[A-Z0-9]+)';
const skuOf = (href) => (href.includes('?sku=') ? href.split('=').pop() : href.split('/').pop().split('-').pop()).toUpperCase();
// 1) product rails: <img src alt></picture></div><div><h3><a href>Name</a></h3><p>$ price</p>
const cardRe = new RegExp(`<img src="([^"]+)" alt="[^"]*"></picture></div><div><h3[^>]*><a href="${LINK}">([^<]+)</a></h3>(?:<p>([^<]*)</p>)?`, 'g');
// 2) spotlight / kids showcase: <p><picture><img src alt></picture></p><p><a href>Name</a></p>
const tileRe = new RegExp(`<p><picture><img src="([^"]+)" alt="[^"]*"></picture></p><p><a href="${LINK}">([^<]+)</a></p>`, 'g');
const products = new Map();
for (const m of [...html.matchAll(cardRe), ...html.matchAll(tileRe)]) {
  const [, src, href, rawName, rawPrice] = m;
  const slug = href.includes('?sku=') ? skuOf(href).toLowerCase() : href.split('/').pop();
  const sku = skuOf(href);
  const name = decode(rawName);
  const priceMatch = (rawPrice || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  const price = priceMatch ? Number(priceMatch[1]) : null;
  // the same product can appear in several rails; keep the card that shows a price
  if (products.has(sku)) {
    const existing = products.get(sku);
    if (existing.priceIsSample && price !== null) Object.assign(existing, { price, priceIsSample: false });
    continue;
  }
  products.set(sku, {
    sku,
    urlKey: slug,
    name,
    category: category(name),
    price: price ?? 1250,
    priceIsSample: price === null,
    currency: 'USD',
    image: imageUrl(src),
    description: `Crafted in ${metal(name)}, this ${name.replace(/^Kapoor\s+/, '')} is part of the Kapoor Jewellers collection. (Sample description for the POC.)`,
    inStock: true,
  });
}

// products without a price on the source get a stable sample price for their category
const SAMPLE_BASE = {
  Earrings: 1450, Rings: 980, Necklaces: 3400, 'Bangles & Bracelets': 2100, Pendants: 760, 'Nose Pins': 320, Jewellery: 1200,
};
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1000, 7);
products.forEach((p) => {
  if (!p.priceIsSample) return;
  const base = SAMPLE_BASE[p.category] || 1200;
  p.price = Math.round((base * (0.75 + (hash(p.sku) / 1000) * 0.6)) / 5) * 5;
});

// the e-gift card linked from a hero banner (image served from the site code)
const giftSku = 'EGCKAPOORUSA';
if (!products.has(giftSku) && html.includes(`sku=${giftSku}`)) {
  products.set(giftSku, {
    sku: giftSku,
    urlKey: 'kapoor-e-gift-card',
    name: 'Kapoor Jewellers e-Gift Card',
    category: 'Gift Cards',
    price: 250,
    priceIsSample: true,
    currency: 'USD',
    image: '/data/images/egift-card.jpg',
    description: 'A Kapoor Jewellers e-Gift Card, delivered by email. (Sample product for the POC.)',
    inStock: true,
  });
}

const list = [...products.values()];
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify({ updated: new Date().toISOString().slice(0, 10), products: list }, null, 2)}\n`);
const by = list.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
console.log(`catalogue: ${list.length} products`, by, `missing images: ${list.filter((p) => !p.image).length}, sample prices: ${list.filter((p) => p.priceIsSample).length}`);
