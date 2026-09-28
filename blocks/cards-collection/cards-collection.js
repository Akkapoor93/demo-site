import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-collection-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    let hasImage = false;
    [...li.children].forEach((cell) => {
      if (!hasImage && cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-collection-card-image';
        hasImage = true;
      } else if (!cell.textContent.trim()) {
        cell.remove();
      } else {
        cell.className = 'cards-collection-card-body';
      }
    });
    if (!hasImage) li.classList.add('cards-collection-card-text');

    // the title link also wraps the image so the whole tile is clickable;
    // the duplicate is hidden from AT/tab order (the title link stays the accessible one)
    const link = li.querySelector('.cards-collection-card-body :is(h2, h3, h4) a[href]')
      || li.querySelector('.cards-collection-card-body a[href]');
    if (link) {
      link.classList.add('cards-collection-card-link');
      li.classList.add('cards-collection-card-linked');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  ul.querySelectorAll('.cards-collection-card-linked').forEach((li) => {
    const link = li.querySelector('.cards-collection-card-link');
    const picture = li.querySelector('.cards-collection-card-image picture');
    if (!link || !picture || picture.closest('a')) return;
    const imageLink = document.createElement('a');
    imageLink.href = link.href;
    imageLink.tabIndex = -1;
    imageLink.setAttribute('aria-hidden', 'true');
    picture.replaceWith(imageLink);
    imageLink.append(picture);
  });
  block.replaceChildren(ul);
}
