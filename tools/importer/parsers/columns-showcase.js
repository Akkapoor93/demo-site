/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-showcase. Base: columns.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .party-edit .party-edit-content
 *
 * Output (matches blocks/columns-showcase/columns-showcase.js): one row, 2 cells
 *   cell 1 = poster image + "Explore The Kids Jewelry Collection" link
 *   cell 2 = per product: image paragraph + linked name paragraph
 *
 * Source structure (validated against block-context/columns-showcase/source.html):
 *   .party-edit-main-banner .party-main-card-wrapper > a.party-main-card-link > img
 *                                                   + .party-main-card-text > a.party-main-card-link (text CTA)
 *   .party-content-wrapper .party-product-track .experience-commerce_assets-productTileRevamp
 *     > a[href] > ... img.tile-image + span[title]
 *   a.spotlight-explore-link-mobile is a mobile-only duplicate CTA and is dropped.
 * Products are iterated via the tile wrapper divs (not the anchors).
 */
export default function parse(element, { document }) {
  const para = (child) => {
    const p = document.createElement('p');
    p.append(child);
    return p;
  };
  const makeLink = (href, text) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    return a;
  };
  const validAlt = (alt) => (alt && !/\$\{/.test(alt) ? alt.trim() : '');

  // ---- cell 1: poster ----
  const banner = element.querySelector('.party-edit-main-banner') || element.firstElementChild;
  const posterCell = [];
  if (banner) {
    const cta = banner.querySelector('.party-main-card-text a[href]')
      || [...banner.querySelectorAll('a[href]')].find((a) => a.textContent.trim());
    const ctaText = cta ? cta.textContent.replace(/\s+/g, ' ').trim() : '';
    const img = banner.querySelector('img');
    if (img && img.getAttribute('src')) {
      const i = document.createElement('img');
      i.src = img.getAttribute('src');
      // source alt is an unrendered template token (${mediaAlt}); fall back to the CTA text
      i.alt = validAlt(img.getAttribute('alt')) || validAlt(img.getAttribute('title')) || ctaText.replace(/^Explore\s+(The\s+)?/i, '');
      posterCell.push(para(i));
    }
    const href = cta ? cta.getAttribute('href')
      : (banner.querySelector('a[href]') || { getAttribute: () => '' }).getAttribute('href');
    if (href) posterCell.push(para(makeLink(href.trim(), ctaText || 'Explore')));
  }

  // ---- cell 2: products ----
  const content = element.querySelector('.party-content-wrapper') || element;
  const productCell = [];
  let tiles = [...content.querySelectorAll('.experience-commerce_assets-productTileRevamp')];
  if (!tiles.length) tiles = [...content.querySelectorAll('.product-tile-revamp')];
  const seen = new Set();
  tiles.forEach((tile) => {
    if (tile.classList.contains('slick-cloned') || tile.closest('.slick-cloned')) return;
    const img = tile.querySelector('img.tile-image, img');
    const a = [...tile.querySelectorAll('a[href]')].find((x) => !/^javascript:/i.test(x.getAttribute('href')));
    const href = a ? a.getAttribute('href').trim() : '';
    const nameEl = tile.querySelector('span[title], .pdp-link h3, h3');
    const name = (nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '') || (img ? validAlt(img.getAttribute('alt')) : '');
    const key = href || name;
    if (!key || seen.has(key)) return;
    seen.add(key);
    if (img && img.getAttribute('src')) {
      const i = document.createElement('img');
      i.src = img.getAttribute('src');
      i.alt = validAlt(img.getAttribute('alt')) || name;
      productCell.push(para(i));
    }
    if (name) productCell.push(para(href ? makeLink(href, name) : document.createTextNode(name)));
  });

  if (!posterCell.length && !productCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[posterCell.length ? posterCell : '', productCell.length ? productCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-showcase', cells });
  element.replaceWith(block);
}
