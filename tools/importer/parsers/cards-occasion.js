/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-occasion. Base: cards.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .shop-our-occasions .occasion-track
 *
 * Output (matches blocks/cards-occasion/cards-occasion.js):
 *   one row per occasion: cell 1 = image,
 *   cell 2 = H3 title, paragraph of chip links (Men | Women | Diamond | Gold), "Explore" link paragraph
 *
 * Source structure (validated against block-context/cards-occasion/source.html):
 *   .experience-commerce_assets-imageCTAandButton > section.occasions-container > .occasion-grid > .occasion-card
 *     > a.image-link > img.occasion-image
 *     > .button-row > a.badge-button (chips)
 *   + .occasion-title + a.explore-link
 * Iteration is keyed on the per-occasion wrapper divs.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.experience-commerce_assets-imageCTAandButton')];
  if (!items.length) items = [...element.querySelectorAll('.occasions-container, .occasion-grid')];

  const clean = (href) => (href || '').trim();
  const cells = [];
  const seen = new Set();

  items.forEach((item) => {
    if (item.classList.contains('slick-cloned') || item.closest('.slick-cloned')) return;
    const img = item.querySelector('img.occasion-image') || item.querySelector('img');
    const titleEl = item.querySelector('.occasion-title, h3, h2');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const explore = item.querySelector('a.explore-link') || item.querySelector('a.image-link[href]');
    const exploreHref = explore ? clean(explore.getAttribute('href')) : '';

    const key = `${title}|${exploreHref}`;
    if ((!title && !img) || seen.has(key)) return;
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
      h3.textContent = title;
      body.push(h3);
    }

    const chips = [...item.querySelectorAll('a.badge-button[href]')].filter((a) => a.textContent.trim());
    if (chips.length) {
      const p = document.createElement('p');
      chips.forEach((chip, idx) => {
        if (idx) p.append(document.createTextNode(' | '));
        const a = document.createElement('a');
        a.href = clean(chip.getAttribute('href'));
        a.textContent = chip.textContent.trim();
        p.append(a);
      });
      body.push(p);
    }

    if (exploreHref) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = exploreHref;
      a.textContent = (explore.classList.contains('explore-link') && explore.textContent.trim()) || 'Explore';
      p.append(a);
      body.push(p);
    }

    cells.push([imageCell, body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-occasion', cells });
  element.replaceWith(block);
}
