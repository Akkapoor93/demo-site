// Builds the Kapoor Jewellers footer fragment (content/footer.plain.html) from the source
// footer model (migration-work/footer-validation/source-footer-model.json):
// rebranded copy, site-relative links, sample contact details, placeholder social links,
// own line-icon SVGs. Flat DA-safe markup: top-level <div>s only, no classes/ids/forms.
// Run from the project root: node tools/importer/rebrand/build-footer.cjs
const fs = require('fs');
const path = require('path');

const MODEL = 'migration-work/footer-validation/source-footer-model.json';
const IMG_DIR = 'content/images/footer';
const OUT = 'content/footer.plain.html';
const BRAND = 'Kapoor Jewellers';
const SAMPLE_EMAIL = 'care@kapoorjewellers.example';
const COPYRIGHT = `© ${new Date().getFullYear()} ${BRAND}. All Rights Reserved.`;

const RENAMES = [[/\bEncircle\b/g, 'Kapoor Rewards'], [/Tanishq/gi, BRAND]];
const PATH_RENAMES = [[/about-tanishq/gi, 'about-kapoor-jewellers'], [/encircle/gi, 'kapoor-rewards'], [/tanishq/gi, 'kapoor']];

// Source destinations that are the source brand's own properties/services get Kapoor paths.
const LINK_OVERRIDES = {
  'Exercise Your Rights': '/privacy/exercise-your-rights',
  'Your California Privacy Choices': '/privacy/california-privacy-choices',
};


const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rebrand = (s) => RENAMES.reduce((acc, [re, to]) => acc.replace(re, to), String(s || ''));

function rel(href, country) {
  if (!href || /^javascript:/i.test(href)) return '#';
  let url;
  try {
    url = new URL(href, 'https://www.tanishq.com');
  } catch (e) {
    return '#';
  }
  if (!/(^|\.)tanishq\.(com|ae|co\.in|sg)$/i.test(url.hostname)) return href;
  // international sister sites become Kapoor store-finder links
  if (country && url.hostname !== 'www.tanishq.com') return `/stores?country=${country.toLowerCase()}`;
  ['lang', 'utm_source', 'utm_medium', 'utm_campaign'].forEach((p) => url.searchParams.delete(p));
  const pathname = PATH_RENAMES.reduce((acc, [re, to]) => acc.replace(re, to), url.pathname || '/').replace(/\.html$/, '');
  const search = url.searchParams.toString();
  return `${pathname}${search ? `?${search}` : ''}${url.hash}`;
}

const ICON = (paths, size = 26) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 26 26" fill="none" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>\n`;
const ICONS = {
  'social-facebook.svg': ICON('<circle cx="13" cy="13" r="12"/><path d="M16.5 8.5h-2a2.5 2.5 0 0 0-2.5 2.5v14M9.5 15h6"/>'),
  'social-instagram.svg': ICON('<rect x="2" y="2" width="22" height="22" rx="6"/><circle cx="13" cy="13" r="5"/><circle cx="19" cy="7" r="0.8" fill="#222"/>'),
  'privacy-choices.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="14" viewBox="0 0 30 14"><rect x="0.5" y="0.5" width="29" height="13" rx="6.5" fill="#fff" stroke="#0066ff"/><path d="M15 0.5h8a6.5 6.5 0 0 1 0 13h-8z" fill="#0066ff"/><path d="m5 7 2 2 4-4" fill="none" stroke="#0066ff" stroke-width="1.5" stroke-linecap="round"/><path d="m19.5 4.5 5 5m0-5-5 5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>\n',
};

const model = JSON.parse(fs.readFileSync(MODEL, 'utf-8'));
fs.mkdirSync(IMG_DIR, { recursive: true });
Object.entries(ICONS).forEach(([file, svg]) => fs.writeFileSync(path.join(IMG_DIR, file), svg));

const lines = [];
const seen = new Set();
model.cols.forEach((col) => {
  const heading = rebrand(col.heading);
  if (!heading || seen.has(heading)) return; // source repeats a column for mobile/desktop
  seen.add(heading);
  const isCountries = /present in/i.test(heading);
  lines.push('<div>', `<h2>${esc(heading)}</h2>`, '<ul>');
  col.links.forEach((l) => {
    if (/^mailto:/i.test(l.href || '')) {
      lines.push(`<li><a href="mailto:${SAMPLE_EMAIL}">${SAMPLE_EMAIL}</a></li>`);
    } else if (l.aria) {
      const file = `social-${l.aria.toLowerCase()}.svg`;
      lines.push(`<li><a href="#"><img src="/media-da/footer-${file.replace('.svg', '.png')}" alt="${esc(l.aria)}"></a></li>`);
    } else {
      const text = rebrand(l.text);
      lines.push(`<li><a href="${rel(l.href, isCountries ? l.text : null)}">${esc(text)}</a></li>`);
    }
  });
  lines.push('</ul>', '</div>');
});

lines.push('<div>', '<ul>');
model.legal.forEach((l) => {
  const text = rebrand(l.text);
  const href = LINK_OVERRIDES[l.text] || rel(l.href);
  const icon = l.img ? '<img src="/media-da/footer-privacy-choices.png" alt="">' : '';
  lines.push(`<li><a href="${href}">${icon}${esc(text)}</a></li>`);
});
lines.push('</ul>', `<p>${esc(COPYRIGHT)}</p>`, '</div>');

fs.writeFileSync(OUT, `${lines.join('\n')}\n`);
console.log(`footer written: ${OUT} (${seen.size} columns + legal strip)`);
