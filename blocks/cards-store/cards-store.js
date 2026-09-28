import { createOptimizedPicture } from '../../scripts/aem.js';

function scrollByCard(track, dir) {
  const card = track.querySelector('li');
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
  track.scrollBy({ left: dir * step, behavior: 'smooth' });
}

function updateButtons(track, prev, next) {
  prev.disabled = track.scrollLeft <= 0;
  next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-store-track';

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-store-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) cell.className = 'cards-store-card-image';
      else if (!cell.textContent.trim()) cell.remove();
      else cell.className = 'cards-store-card-body';
    });

    li.querySelectorAll('.cards-store-card-body a[href]').forEach((a) => {
      a.classList.remove('button', 'primary', 'secondary');
      const p = a.closest('p');
      if (p) p.classList.remove('button-wrapper', 'button-container');
      if (a.href.startsWith('tel:')) {
        if (p) {
          p.classList.add('cards-store-phone');
          if (!/^\s*contact/i.test(p.textContent)) {
            const label = document.createElement('span');
            label.className = 'cards-store-phone-label';
            label.textContent = 'contact- ';
            p.prepend(label);
          }
        }
      } else if (/maps|direction/i.test(`${a.href} ${a.textContent}`)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        if (p) p.classList.add('cards-store-directions');
      }
    });
    li.querySelectorAll('.cards-store-card-body > p:not([class])').forEach((p) => {
      if (!p.querySelector('a')) p.classList.add('cards-store-address');
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]));
  });

  const viewport = document.createElement('div');
  viewport.className = 'cards-store-viewport';
  viewport.append(ul);
  block.replaceChildren(viewport);
  if (ul.children.length < 2) return;

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-store-prev';
  prev.setAttribute('aria-label', 'Previous stores');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-store-next';
  next.setAttribute('aria-label', 'Next stores');
  viewport.append(prev, next);

  prev.addEventListener('click', () => scrollByCard(ul, -1));
  next.addEventListener('click', () => scrollByCard(ul, 1));
  ul.addEventListener('scroll', () => updateButtons(ul, prev, next), { passive: true });
  window.addEventListener('resize', () => updateButtons(ul, prev, next));
  requestAnimationFrame(() => updateButtons(ul, prev, next));
}
