/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-collection. Base: cards.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .shop-our-collections .category-tile-lists
 *
 * Output (matches blocks/cards-collection/cards-collection.js):
 *   one row per collection: cell 1 = image, cell 2 = H3 title (linked when the source tile has a link) + description paragraph
 *
 * Source structure (validated against block-context/cards-collection/source.html):
 *   .category-tile-item > .experience-commerce_assets-categoryCarousel > .main-card
 *     > .collection-cards > img.main-img
 *     > .tile-content > h3.tile-title + p.tile-description
 * On the source the tiles are JS tab triggers for the product slides and carry no href,
 * so the H3 is only linked when an <a href> exists inside the tile (no URLs are invented).
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.category-tile-item')];
  if (!items.length) items = [...element.querySelectorAll('.main-card, .experience-commerce_assets-categoryCarousel')];

  const cells = [];
  const seen = new Set();

  items.forEach((item) => {
    if (item.classList.contains('slick-cloned') || item.closest('.slick-cloned')) return;
    const img = item.querySelector('img.main-img, .collection-cards img') || item.querySelector('img');
    const titleEl = item.querySelector('.tile-title, h3, h2');
    const descEl = item.querySelector('.tile-description, .tile-content p');
    const title = (titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '')
      || (img ? (img.getAttribute('alt') || '').replace(/\s*Collection$/i, '').trim() : '');
    const anchor = [...item.querySelectorAll('a[href]')].find((a) => !/^javascript:|^#$/i.test(a.getAttribute('href').trim()));

    const key = title || (img && img.getAttribute('src'));
    if (!key || seen.has(key)) return;
    seen.add(key);

    let imageCell = '';
    if (img && img.getAttribute('src')) {
      const i = document.createElement('img');
      i.src = img.getAttribute('src');
      i.alt = (img.getAttribute('alt') || title).trim();
      imageCell = i;
    }

    const body = [];
    if (title) {
      const h3 = document.createElement('h3');
      if (anchor) {
        const a = document.createElement('a');
        a.href = anchor.getAttribute('href').trim();
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      body.push(h3);
    }
    const desc = descEl ? descEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      body.push(p);
    }

    cells.push([imageCell, body.length ? body : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-collection', cells });
  element.replaceWith(block);
}
