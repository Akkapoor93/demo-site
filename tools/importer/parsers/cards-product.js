/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.tanishq.com/homepage
 * Source selectors (3 instances):
 *   .experience-commerce_layouts-categoryStaticCarousel .product-carousel-track  (Trending rail)
 *   .new-arrivals-section .new-arrivals-carousel                                 (Fresh From the Design Studio)
 *   .shop-our-collections .product-slides-container                              (World of Tanishq; several .product-slide groups, some hidden)
 *
 * Output (matches blocks/cards-product/cards-product.js):
 *   one row per product: cell 1 = product image, cell 2 = H3 with linked product name + price paragraph (when present)
 *   Wishlist hearts / tooltips / stock messages are dropped.
 *
 * Iteration is keyed on the stable per-tile wrapper div
 * (.experience-commerce_assets-productTileRevamp), never on the anchors or the wishlist
 * buttons (source nests <button> inside <a> and <a> inside <a>, which the HTML parser flattens).
 * Slick clones are skipped and products are de-duplicated by URL across all groups
 * (hidden .product-slide groups are included).
 */
export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll('.experience-commerce_assets-productTileRevamp')];
  if (!tiles.length) tiles = [...element.querySelectorAll('.product-tile-revamp, .product-tile')];

  const isProductHref = (href) => href && !/^javascript:/i.test(href) && href !== '#';

  const cells = [];
  const seen = new Set();

  tiles.forEach((tile) => {
    if (tile.classList.contains('slick-cloned') || tile.closest('.slick-cloned')) return;

    const img = tile.querySelector('img.tile-image') || tile.querySelector('.product-image-block img, .image-container img, img');
    const anchor = [...tile.querySelectorAll('a[href]')].find((a) => isProductHref(a.getAttribute('href')));
    const href = anchor ? anchor.getAttribute('href') : '';

    const nameEl = tile.querySelector('.pdp-link h3, h3.link, .product-name h3, .pdp-link a')
      || tile.querySelector('span[title]');
    let name = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!name && img) name = (img.getAttribute('alt') || img.getAttribute('title') || '').replace(/,\s*$/, '').trim();
    if (!name && !img) return;

    const key = href || name;
    if (seen.has(key)) return;
    seen.add(key);

    const imageCell = [];
    if (img && img.getAttribute('src')) {
      const i = document.createElement('img');
      i.src = img.getAttribute('src');
      i.alt = (img.getAttribute('alt') || name).trim();
      imageCell.push(i);
    }

    const body = [];
    const h3 = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = name;
      h3.append(a);
    } else {
      h3.textContent = name;
    }
    body.push(h3);

    // sale price = first .price-text; list (reduced-from) price lives in .strike-through
    const clean = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
    const saleEl = tile.querySelector('.sales .price-text .tile-show')
      || tile.querySelector('.sales .price-text')
      || tile.querySelector('.price-text');
    const listEl = tile.querySelector('.strike-through .tile-show') || tile.querySelector('.strike-through');
    const listPrice = clean(listEl).replace(/Price reduced from|to$/gi, '').trim();
    let price = clean(saleEl);
    if (!price) price = clean(tile.querySelector('.price')).replace(/Price reduced from.*$/i, '').trim();
    if (price) {
      const p = document.createElement('p');
      p.append(document.createTextNode(price));
      if (listPrice && listPrice !== price) {
        p.append(document.createTextNode(' '));
        const del = document.createElement('del');
        del.textContent = listPrice;
        p.append(del);
      }
      body.push(p);
    }

    cells.push([imageCell.length ? imageCell : '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
