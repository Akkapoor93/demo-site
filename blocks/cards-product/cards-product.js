import { createOptimizedPicture } from '../../scripts/aem.js';

function scrollByPage(track, dir) {
  const card = track.querySelector('li');
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
  const perPage = Math.max(1, Math.floor((track.clientWidth + gap) / step));
  track.scrollBy({ left: dir * step * perPage, behavior: 'smooth' });
}

function updateButtons(track, prev, next) {
  const max = track.scrollWidth - track.clientWidth - 1;
  prev.disabled = track.scrollLeft <= 0;
  next.disabled = track.scrollLeft >= max;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-product-track';

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-product-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) cell.className = 'cards-product-card-image';
      else if (!cell.textContent.trim()) cell.remove();
      else cell.className = 'cards-product-card-body';
    });

    // link the product image to the product page (name link)
    const link = li.querySelector('.cards-product-card-body a[href]');
    const image = li.querySelector('.cards-product-card-image');
    if (link && image) {
      const a = document.createElement('a');
      a.href = link.href;
      a.tabIndex = -1;
      a.setAttribute('aria-hidden', 'true');
      a.append(...image.childNodes);
      image.append(a);
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]));
  });

  const viewport = document.createElement('div');
  viewport.className = 'cards-product-viewport';
  viewport.append(ul);
  block.replaceChildren(viewport);

  if (ul.children.length < 2) return;

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-product-prev';
  prev.setAttribute('aria-label', 'Previous products');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-product-next';
  next.setAttribute('aria-label', 'Next products');
  viewport.append(prev, next);

  prev.addEventListener('click', () => scrollByPage(ul, -1));
  next.addEventListener('click', () => scrollByPage(ul, 1));
  ul.addEventListener('scroll', () => updateButtons(ul, prev, next), { passive: true });
  window.addEventListener('resize', () => updateButtons(ul, prev, next));
  requestAnimationFrame(() => updateButtons(ul, prev, next));
}
