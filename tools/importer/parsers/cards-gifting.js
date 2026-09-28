/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-gifting. Base: cards.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .gifting .gift-card-slides
 *
 * Output (matches blocks/cards-gifting/cards-gifting.js):
 *   one row per audience: cell 1 = image,
 *   cell 2 = H3 title, paragraph of sub-links (Wedding | Anniversary | Engagement), "Explore" link paragraph
 *
 * Source structure (validated against block-context/cards-gifting/source.html):
 *   .experience-commerce_assets-imageCTAandButton > section.occasions-container > .occasion-grid
 *     > .occasion-card > img.occasion-image
 *     > .gift-card-body > .occasion-title + .button-row > a.badge-button + .wrapper_link > a.explore-link
 * Iteration is keyed on the per-audience wrapper divs. Source alts are sometimes the
 * literal string "undefined" and are replaced with the card title.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.experience-commerce_assets-imageCTAandButton')];
  if (!items.length) items = [...element.querySelectorAll('.occasions-container, .occasion-grid')];

  const cleanAlt = (alt) => (alt && !/^(undefined|null)$/i.test(alt.trim()) && !/\$\{/.test(alt) ? alt.trim() : '');
  const cells = [];
  const seen = new Set();

  items.forEach((item) => {
    if (item.classList.contains('slick-cloned') || item.closest('.slick-cloned')) return;
    const img = item.querySelector('img.occasion-image') || item.querySelector('img');
    const titleEl = item.querySelector('.occasion-title, h3, h2');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const explore = item.querySelector('a.explore-link[href], .wrapper_link a[href]');
    const key = title || (img && img.getAttribute('src'));
    if (!key || seen.has(key)) return;
    seen.add(key);

    let imageCell = '';
    if (img && img.getAttribute('src')) {
      const i = document.createElement('img');
      i.src = img.getAttribute('src');
      i.alt = cleanAlt(img.getAttribute('alt')) || title;
      imageCell = i;
    }

    const body = [];
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      body.push(h3);
    }

    const subs = [...item.querySelectorAll('.button-row a[href], a.badge-button[href]')]
      .filter((a, idx, arr) => arr.indexOf(a) === idx && a.textContent.trim());
    if (subs.length) {
      const p = document.createElement('p');
      subs.forEach((sub, idx) => {
        if (idx) p.append(document.createTextNode(' | '));
        const a = document.createElement('a');
        a.href = sub.getAttribute('href').trim();
        a.textContent = sub.textContent.trim();
        p.append(a);
      });
      body.push(p);
    }

    if (explore) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = explore.getAttribute('href').trim();
      a.textContent = explore.textContent.trim() || 'Explore';
      p.append(a);
      body.push(p);
    }

    cells.push([imageCell, body.length ? body : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gifting', cells });
  element.replaceWith(block);
}
