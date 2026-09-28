/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-category. Base: cards.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .pd-fod-category .desktop-categories .category-grid
 *
 * Output (matches blocks/cards-category/cards-category.js):
 *   one row per category: cell 1 = image, cell 2 = linked H3 label
 *   last row ("view all" tile): cell 1 empty, cell 2 = "Explore More Categories" text + "View All" link
 *
 * Source structure (validated against block-context/cards-category/source.html):
 *   a.category-card[href] > div.img-wrap > img  +  h3
 *   a.view-all-card.category-card[href] > div.img-wrap > span + div.arrow  +  h3 "View All"
 * Iteration is keyed on the inner div.img-wrap wrappers (not on the sibling anchors,
 * which the importer's inline-element preprocessing can merge); href is read from the
 * closest anchor.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.img-wrap')].map((wrap) => {
    const card = wrap.closest('.category-card') || wrap.parentElement;
    return {
      wrap,
      card,
      heading: (card && card.querySelector('h3, h2, h4')) || null,
      href: (wrap.closest('a[href]') || (card && card.querySelector('a[href]')) || {}).getAttribute?.('href') || '',
    };
  });
  if (!items.length) {
    items = [...element.querySelectorAll('.category-card')].map((card) => ({
      wrap: card,
      card,
      heading: card.querySelector('h3, h2, h4'),
      href: card.getAttribute('href') || '',
    }));
  }

  const cells = [];
  const seen = new Set();

  items.forEach(({ wrap, card, heading, href }) => {
    if (card && card.closest('.slick-cloned')) return;
    const label = heading ? heading.textContent.trim() : '';
    const img = wrap.querySelector('img');
    const isViewAll = (card && card.classList.contains('view-all-card')) || !img;

    const key = `${href}|${label}`;
    if (seen.has(key)) return;
    seen.add(key);

    if (isViewAll) {
      const body = [];
      // The promo span can be stripped as hidden before parsing; data-cta carries the same text.
      const promo = wrap.querySelector('span, p');
      const promoText = (promo && promo.textContent.trim())
        || (card && card.getAttribute('data-cta') ? card.getAttribute('data-cta').trim() : '');
      if (promoText) {
        const p = document.createElement('p');
        p.textContent = promoText;
        body.push(p);
      }
      if (href || label) {
        const a = document.createElement('a');
        a.href = href || '#';
        a.textContent = label || 'View All';
        const p = document.createElement('p');
        p.append(a);
        body.push(p);
      }
      if (body.length) cells.push(['', body]);
      return;
    }

    const image = document.createElement('img');
    image.src = img.getAttribute('src');
    image.alt = (img.getAttribute('alt') || '').trim() || label;

    const h3 = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      h3.append(a);
    } else {
      h3.textContent = label;
    }

    cells.push([image, h3]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
