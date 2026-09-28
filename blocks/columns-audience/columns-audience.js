import { createOptimizedPicture } from '../../scripts/aem.js';

function decorateTile(cell) {
  cell.classList.add('columns-audience-tile');
  const picture = cell.querySelector('picture');
  const media = document.createElement('div');
  media.className = 'columns-audience-tile-image';
  const holder = picture.closest('p');
  media.append(picture);
  if (holder && !holder.textContent.trim() && !holder.children.length) holder.remove();

  const overlay = document.createElement('div');
  overlay.className = 'columns-audience-tile-content';
  overlay.append(...cell.childNodes);
  cell.replaceChildren(media);
  if (overlay.textContent.trim()) cell.append(overlay);

  // last link (e.g. "Explore") stretches over the whole tile
  const links = [...overlay.querySelectorAll('a[href]')];
  const link = links[links.length - 1];
  if (link) {
    link.classList.add('columns-audience-tile-link');
    cell.classList.add('columns-audience-tile-linked');
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  const cols = rows[0] ? rows[0].children.length : 0;
  block.classList.add(`columns-audience-${cols}-cols`);

  rows.forEach((row) => {
    row.classList.add('columns-audience-row');
    const tiles = document.createElement('div');
    tiles.className = 'columns-audience-tiles';
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture')) {
        cell.remove();
      } else if (cell.querySelector('picture')) {
        decorateTile(cell);
        tiles.append(cell);
      } else {
        cell.classList.add('columns-audience-intro');
      }
    });
    if (tiles.children.length) {
      tiles.style.setProperty('--columns-audience-tiles', tiles.children.length);
      row.append(tiles);
    }
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]));
  });
}
