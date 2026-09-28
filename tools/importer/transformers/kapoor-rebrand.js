/* eslint-disable */
/* global WebImporter */

/**
 * Rebrands the imported Tanishq homepage as Kapoor Jewellers (afterTransform, after parsing).
 * - "Tanishq" text becomes "Kapoor Jewellers" ("Kapoor" in product names like "Tanishq 18KT ...")
 * - images become Kapoor Jewellers artwork/placeholders (tools/importer/rebrand/design-banners.cjs,
 *   generate-placeholders.cjs; mapped via the image sidecar); see DEMO_KEEP_SOURCE_PHOTOS below
 * - videos become sample quote cards/feature tiles, boutiques become three sample stores
 * - links to tanishq.* become site-relative paths; collection and banner names become generic
 */
const PLACEHOLDER = (name) => `https://placeholder.kapoorjewellers.example/kapoor-${name}.png`;

// INTERNAL DEMO ONLY: keep the source's unbranded jewellery photos (products, categories,
// occasions, audience, gifting, kids showcase). These are the source brand's copyrighted
// photos, so set this to false (placeholders) or map real Kapoor Jewellers photos before
// publishing. Branded art (hero banners, collections, stores) and videos are always replaced.
const DEMO_KEEP_SOURCE_PHOTOS = true;
const DEMO_SLOTS = new Set(['category', 'product', 'occasion', 'audience', 'gifting', 'showcase-poster']);
// Photos reviewed as showing the source brand's logo (checked with tools/importer/rebrand/contact-sheet.cjs);
// always replaced, even in demo mode. Matched on file name.
const BRANDED_PHOTOS = ['gift_WOMEN.jpg'];

const isBranded = (src) => BRANDED_PHOTOS.some((name) => src.split('?')[0].endsWith(`/${name}`));
const BRAND = 'Kapoor Jewellers';
const TANISHQ_HOST = /(^|\.)tanishq\.(com|ae|co\.in)$/i;

const SAMPLE_STORES = [
  { city: 'Edison', path: '/stores/edison', address: '100 Sample Avenue, Suite 1, Edison, New Jersey 08817', phone: '(732) 555-0101', tel: '+17325550101' },
  { city: 'Chicago', path: '/stores/chicago', address: '200 Placeholder Street, Chicago, Illinois 60601', phone: '(312) 555-0102', tel: '+13125550102' },
  { city: 'Dallas', path: '/stores/dallas', address: '300 Example Road, Dallas, Texas 75201', phone: '(214) 555-0103', tel: '+12145550103' },
];

// Only these pages exist in the POC; other internal links go to the coming-soon page,
// keeping the intended destination in ?from= for when that page is built.
const BUILT_PAGES = ['/', '/index', '/coming-soon'];
const comingSoon = (target) => (BUILT_PAGES.includes(target.split(/[?#]/)[0]) ? target : `/coming-soon?from=${encodeURIComponent(target)}`);

const COLLECTION_NAMES = ['Signature Collection', 'Gemstone Collection', 'Festive Gold Collection'];

function rebrandText(text) {
  return text
    .replace(/Tanishq(?=\s+\d+\s*KT)/gi, 'Kapoor')
    .replace(/Tanishq/gi, BRAND);
}

function blockName(table) {
  const head = table.querySelector('tr th, tr td');
  return head ? head.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
}

function setPlaceholder(img, name, alt) {
  const src = img.getAttribute('src') || '';
  if (DEMO_KEEP_SOURCE_PHOTOS && DEMO_SLOTS.has(name) && src && !isBranded(src)) {
    if (alt !== undefined) img.setAttribute('alt', alt);
    return;
  }
  img.setAttribute('src', PLACEHOLDER(name));
  img.removeAttribute('srcset');
  img.removeAttribute('data-src');
  if (alt !== undefined) img.setAttribute('alt', alt);
  const picture = img.closest('picture');
  if (picture) picture.querySelectorAll('source').forEach((s) => s.remove());
}

function makeImg(document, name, alt) {
  const img = document.createElement('img');
  setPlaceholder(img, name, alt);
  return img;
}

function rowsOf(table) {
  return [...table.querySelectorAll(':scope > tbody > tr, :scope > tr')].slice(1);
}

function cellsOf(row) {
  return [...row.children].filter((c) => c.tagName === 'TD' || c.tagName === 'TH');
}

function rebrandHero(table) {
  rowsOf(table).forEach((row, i) => {
    const n = (i % 10) + 1;
    const label = `${BRAND} banner ${n}`;
    const imgs = [...row.querySelectorAll('img')];
    imgs.forEach((img, j) => setPlaceholder(img, j === 0 ? `hero-desktop-${n}` : `hero-mobile-${n}`, label));
    row.querySelectorAll('a[href]').forEach((a) => {
      if (!a.querySelector('img')) a.textContent = label;
    });
  });
}

function rebrandStores(table, document) {
  const rows = rowsOf(table);
  const parent = rows.length ? rows[0].parentNode : table;
  rows.forEach((r) => r.remove());
  SAMPLE_STORES.forEach((store) => {
    const name = `${BRAND} - ${store.city} (Sample)`;
    const tr = document.createElement('tr');
    const imgCell = document.createElement('td');
    imgCell.append(makeImg(document, `store-${store.city.toLowerCase()}`, name));
    const body = document.createElement('td');
    const h3 = document.createElement('h3');
    const link = document.createElement('a');
    link.href = comingSoon(store.path);
    link.textContent = name;
    h3.append(link);
    const address = document.createElement('p');
    address.textContent = store.address;
    const phone = document.createElement('p');
    const tel = document.createElement('a');
    tel.href = `tel:${store.tel}`;
    tel.textContent = store.phone;
    phone.append(tel);
    const directions = document.createElement('p');
    const dir = document.createElement('a');
    dir.href = comingSoon(store.path);
    dir.textContent = 'Get Directions';
    directions.append(dir);
    body.append(h3, address, phone, directions);
    tr.append(imgCell, body);
    parent.append(tr);
  });
}

function rebrandCollections(table) {
  rowsOf(table).forEach((row, i) => {
    const name = COLLECTION_NAMES[i] || `${BRAND} Collection ${i + 1}`;
    row.querySelectorAll('img').forEach((img) => setPlaceholder(img, `collection-${Math.min(i + 1, 3)}`, name));
    const heading = row.querySelector('h1, h2, h3, h4');
    if (heading) {
      const target = heading.querySelector('a') || heading;
      target.textContent = name;
    }
    row.querySelectorAll('p').forEach((p) => {
      if (!p.querySelector('a, img') && p.textContent.trim()) p.textContent = `A ${BRAND} collection (placeholder description).`;
    });
  });
}

function replaceVideos(scope, document, name) {
  scope.querySelectorAll('a[href]').forEach((a) => {
    if (!/\.(mp4|webm|mov)(\?|$)/i.test(a.getAttribute('href'))) return;
    a.replaceWith(makeImg(document, name, `${BRAND} ${name.startsWith('testimonial') ? 'customer story' : 'feature'} (sample)`));
  });
}

function rebrandTable(table, document) {
  const name = blockName(table);
  switch (name) {
    case 'carousel-hero':
      rebrandHero(table);
      break;
    case 'cards-store':
      rebrandStores(table, document);
      break;
    case 'cards-collection':
      rebrandCollections(table);
      break;
    case 'cards-video':
      rowsOf(table).forEach((row, i) => {
        const slot = `testimonial-${(i % 2) + 1}`;
        replaceVideos(row, document, slot);
        row.querySelectorAll('img').forEach((img) => setPlaceholder(img, slot, `${BRAND} customer story (sample)`));
      });
      break;
    case 'columns-spotlight':
    case 'columns-showcase': {
      const first = rowsOf(table)[0];
      const firstCell = first ? cellsOf(first)[0] : null;
      if (name === 'columns-spotlight' && firstCell) replaceVideos(firstCell, document, 'spotlight');
      table.querySelectorAll('img').forEach((img) => {
        const inFirst = firstCell && firstCell.contains(img);
        let slot = 'product';
        if (inFirst) slot = name === 'columns-spotlight' ? 'spotlight' : 'showcase-poster';
        setPlaceholder(img, slot);
      });
      break;
    }
    default: {
      const slots = {
        'cards-category': 'category',
        'cards-product': 'product',
        'cards-occasion': 'occasion',
        'columns-audience': 'audience',
        'cards-gifting': 'gifting',
      };
      const slot = slots[name] || 'product';
      table.querySelectorAll('img').forEach((img) => setPlaceholder(img, slot));
    }
  }
}

function rebrandLinks(element) {
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    let url;
    try {
      url = new URL(href, 'https://www.tanishq.com');
    } catch (e) {
      return;
    }
    if (!/^https?:$/.test(url.protocol)) return;
    if (TANISHQ_HOST.test(url.hostname)) {
      ['lang', 'utm_source', 'utm_medium', 'utm_campaign'].forEach((p) => url.searchParams.delete(p));
      const search = url.searchParams.toString();
      const pathname = (url.pathname || '/').replace(/about-tanishq/gi, 'about-kapoor-jewellers').replace(/encircle/gi, 'kapoor-rewards').replace(/tanishq/gi, 'kapoor').replace(/\.html$/, '');
      a.setAttribute('href', comingSoon(`${pathname}${search ? `?${search}` : ''}${url.hash}`));
    } else if (/(^|\.)(goo\.gl|google\.[a-z.]+)$/i.test(url.hostname) && /maps/i.test(href)) {
      a.setAttribute('href', comingSoon('/stores'));
    }
  });
}

function rebrandTextNodes(element, document) {
  const walker = document.createTreeWalker(element, 4 /* NodeFilter.SHOW_TEXT */);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (/tanishq/i.test(node.nodeValue)) node.nodeValue = rebrandText(node.nodeValue);
  });
  element.querySelectorAll('[alt], [title]').forEach((el) => {
    ['alt', 'title'].forEach((attr) => {
      const v = el.getAttribute(attr);
      if (v && /tanishq/i.test(v)) el.setAttribute(attr, rebrandText(v));
    });
  });
}

function rebrandHead(document) {
  document.title = rebrandText(document.title || `${BRAND}`);
  document.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]').forEach((meta) => {
    const prop = meta.getAttribute('property') || meta.getAttribute('name');
    if (/image/i.test(prop)) {
      meta.remove();
      return;
    }
    const content = meta.getAttribute('content');
    if (content) meta.setAttribute('content', rebrandText(content));
  });
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const { document } = payload;

  element.querySelectorAll('table').forEach((table) => rebrandTable(table, document));

  // Default-content images (section ornaments/icons) become the neutral divider.
  element.querySelectorAll('img').forEach((img) => {
    if (!img.closest('table')) setPlaceholder(img, 'divider', 'Decorative divider');
  });

  rebrandLinks(element);
  rebrandTextNodes(element, document);
  rebrandHead(document);
}
