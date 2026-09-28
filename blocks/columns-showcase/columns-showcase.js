import { createOptimizedPicture } from '../../scripts/aem.js';

function unwrapPicture(picture) {
  const holder = picture.closest('p');
  if (holder && !holder.textContent.trim() && holder.children.length === 1) {
    holder.replaceWith(picture);
  }
}

function decoratePoster(cell) {
  cell.classList.add('columns-showcase-poster');
  const picture = cell.querySelector('picture');
  unwrapPicture(picture);
  const link = cell.querySelector('a[href]');
  // like the source, the poster image itself links to the collection
  const media = document.createElement(link ? 'a' : 'div');
  media.className = 'columns-showcase-poster-image';
  if (link) {
    media.href = link.href;
    media.tabIndex = -1;
    media.setAttribute('aria-hidden', 'true');
  }
  media.append(picture);

  const content = document.createElement('div');
  content.className = 'columns-showcase-poster-content';
  content.append(...cell.childNodes);
  cell.replaceChildren(media);
  if (content.textContent.trim()) cell.append(content);

  if (link) {
    link.classList.add('columns-showcase-poster-link');
    cell.classList.add('columns-showcase-poster-linked');
  }
}

function decorateProducts(cell) {
  cell.classList.add('columns-showcase-products');
  const intro = document.createElement('div');
  intro.className = 'columns-showcase-intro';
  const list = document.createElement('ul');
  list.className = 'columns-showcase-product-list';

  let current = null;
  [...cell.children].forEach((el) => {
    if (el.tagName === 'PICTURE' || el.querySelector('picture')) {
      current = document.createElement('li');
      current.className = 'columns-showcase-product';
      list.append(current);
    }
    (current || intro).append(el);
  });

  list.querySelectorAll('.columns-showcase-product').forEach((item) => {
    const link = item.querySelector('a[href]');
    const picture = item.querySelector('picture');
    if (!picture) return;
    const p = picture.closest('p');
    const holder = p && !p.textContent.trim() ? p : picture;
    const media = document.createElement(link ? 'a' : 'div');
    media.className = 'columns-showcase-product-image';
    if (link) {
      media.href = link.href;
      media.tabIndex = -1;
      media.setAttribute('aria-hidden', 'true');
    }
    holder.replaceWith(media);
    media.append(picture);
  });

  cell.replaceChildren();
  if (intro.children.length) cell.append(intro);
  if (list.children.length) cell.append(list);
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture'));
  block.classList.add(`columns-showcase-${cells.length}-cols`);

  cells.forEach((cell, idx) => {
    const pictures = cell.querySelectorAll('picture').length;
    // the poster is the first cell with a single picture; the product cell holds several
    if (idx === 0 && pictures === 1 && cells.length > 1) decoratePoster(cell);
    else decorateProducts(cell);
  });
  [...row.children].forEach((c) => { if (!cells.includes(c)) c.remove(); });

  block.querySelectorAll('picture > img').forEach((img) => {
    const isPoster = !!img.closest('.columns-showcase-poster');
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: isPoster ? '900' : '400' }]));
  });
}
