import { createOptimizedPicture } from '../../scripts/aem.js';

/** A paragraph holding two or more links is the filter-chip list (Men | Women | ...). */
function buildChips(p) {
  const links = [...p.querySelectorAll('a[href]')];
  const ul = document.createElement('ul');
  ul.className = 'cards-occasion-chips';
  links.forEach((a) => {
    a.classList.remove('button');
    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
  });
  return ul;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-occasion-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    let image;
    let body;
    [...li.children].forEach((cell) => {
      if (!image && cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-occasion-card-image';
        image = cell;
      } else if (!cell.textContent.trim()) {
        cell.remove();
      } else if (!body) {
        cell.className = 'cards-occasion-card-body';
        body = cell;
      } else {
        body.append(...cell.childNodes); // extra authored cells fold into the body
        cell.remove();
      }
    });

    if (body) {
      const chipsP = [...body.querySelectorAll(':scope > p')].find((p) => p.querySelectorAll('a[href]').length > 1);
      if (chipsP) {
        const chips = buildChips(chipsP);
        chipsP.remove();
        // chips sit over the bottom of the image when there is one
        (image || body).append(chips);
      }
      const links = [...body.querySelectorAll(':scope > p a[href]')];
      const cta = links[links.length - 1];
      if (cta && cta.closest('p').textContent.trim() === cta.textContent.trim()) {
        cta.closest('p').classList.add('cards-occasion-cta');
      }
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]));
  });
  block.replaceChildren(ul);
}
