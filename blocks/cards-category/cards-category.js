import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Text-only "Explore more" tile: any intro text goes into a bordered panel (same
 * footprint as the image tiles) with a decorative arrow; the link stays below as the label.
 * If the tile only has a link, the link itself is shown inside the panel.
 * @param {Element} li the card
 */
function decorateTextCard(li) {
  const link = li.querySelector('a[href]');
  const panel = document.createElement('div');
  panel.className = 'cards-category-card-panel';

  const bodies = [...li.querySelectorAll(':scope > .cards-category-card-body')];
  bodies.forEach((body) => {
    [...body.childNodes].forEach((node) => {
      const holdsLink = link && (node === link || (node.contains && node.contains(link)));
      if (!holdsLink && node.textContent.trim()) panel.append(node);
    });
  });

  let label = link ? bodies.find((b) => b.contains(link)) : null;
  if (!panel.textContent.trim() && label) {
    panel.append(...label.childNodes);
    label.remove();
    label = null;
  }
  bodies.filter((b) => b !== label).forEach((b) => b.remove());

  const arrow = document.createElement('span');
  arrow.className = 'cards-category-card-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  panel.append(arrow);
  li.prepend(panel);
}

/**
 * Mobile swiper-style scroll indicator (hidden on desktop via CSS).
 * @param {Element} block the block
 * @param {Element} ul the scrolling list
 */
function addScrollbar(block, ul) {
  const track = document.createElement('div');
  track.className = 'cards-category-scrollbar';
  track.setAttribute('aria-hidden', 'true');
  const thumb = document.createElement('div');
  thumb.className = 'cards-category-scrollbar-drag';
  track.append(thumb);
  block.append(track);

  const update = () => {
    const { scrollLeft, scrollWidth, clientWidth } = ul;
    const max = scrollWidth - clientWidth;
    track.hidden = max <= 1;
    if (max <= 1) return;
    const ratio = clientWidth / scrollWidth;
    const trackWidth = track.clientWidth;
    const thumbWidth = trackWidth * ratio;
    thumb.style.width = `${thumbWidth}px`;
    thumb.style.transform = `translateX(${(scrollLeft / max) * (trackWidth - thumbWidth)}px)`;
  };
  ul.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(ul);
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-category-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-category-card-image';
      } else if (!cell.textContent.trim() && !cell.querySelector('img, .icon')) {
        cell.remove(); // empty cell (e.g. text-only "Explore more" tile)
      } else {
        cell.className = 'cards-category-card-body';
      }
    });

    if (!li.querySelector('.cards-category-card-image')) {
      li.classList.add('cards-category-card-text');
      decorateTextCard(li);
    }

    // make the whole tile clickable via the first link (label link / "View All")
    const link = li.querySelector('a[href]');
    if (link) {
      li.classList.add('cards-category-card-linked');
      const image = li.querySelector('.cards-category-card-image');
      if (image) {
        const a = document.createElement('a');
        a.href = link.href;
        a.tabIndex = -1;
        a.setAttribute('aria-hidden', 'true');
        a.append(...image.childNodes);
        image.append(a);
      }
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]));
  });
  // mobile swiper lays tiles out in two rows (row-first fill)
  ul.style.setProperty('--cards-category-cols', Math.max(1, Math.ceil(ul.children.length / 2)));
  block.replaceChildren(ul);
  addScrollbar(block, ul);
}
