/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-audience. Base: columns.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .jew-for-everyone .jewelry-section
 *
 * Output (matches blocks/columns-audience/columns-audience.js): one row, 1 + N cells
 *   cell 1 = H2 + intro paragraph
 *   cells 2..N = image, label paragraph, "Explore" link paragraph (one cell per audience tile)
 *
 * Source structure (validated against block-context/columns-audience/source.html):
 *   .jewelry-text > h2 + p
 *   .jewelry-images > .jewelry-image-box > img + .overlay > .label + a[href]
 */
export default function parse(element, { document }) {
  const row = [];

  // ---- intro cell ----
  const textWrap = element.querySelector('.jewelry-text') || element;
  const heading = textWrap.querySelector('h2, h1, h3');
  const intro = [];
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    intro.push(h2);
  }
  [...textWrap.querySelectorAll('p')].forEach((p) => {
    if (p.closest('.jewelry-image-box, .overlay')) return;
    const text = p.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const np = document.createElement('p');
    np.textContent = text;
    intro.push(np);
  });
  if (intro.length) row.push(intro);

  // ---- audience tiles ----
  let tiles = [...element.querySelectorAll('.jewelry-image-box')];
  if (!tiles.length) tiles = [...element.querySelectorAll('.jewelry-images > div')];
  const seen = new Set();
  tiles.forEach((tile) => {
    const img = tile.querySelector('img');
    const labelEl = tile.querySelector('.label');
    const label = labelEl ? labelEl.textContent.trim() : '';
    const a = tile.querySelector('a[href]');
    const key = (a && a.getAttribute('href')) || label;
    if (!key || seen.has(key)) return;
    seen.add(key);

    const cell = [];
    if (img && img.getAttribute('src')) {
      const i = document.createElement('img');
      i.src = img.getAttribute('src');
      i.alt = (img.getAttribute('alt') || label).trim();
      cell.push(i);
    }
    if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      cell.push(p);
    }
    if (a) {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = a.getAttribute('href').trim();
      link.textContent = a.textContent.trim() || 'Explore';
      p.append(link);
      cell.push(p);
    }
    if (cell.length) row.push(cell);
  });

  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-audience', cells: [row] });
  element.replaceWith(block);
}
