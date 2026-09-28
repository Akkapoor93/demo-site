import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_RE = /\.(mp4|webm|mov)(\?.*)?$/i;

function buildVideo(link) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'metadata');
  const source = document.createElement('source');
  source.src = link.href;
  source.type = `video/${link.href.split('?')[0].split('.').pop().toLowerCase() === 'webm' ? 'webm' : 'mp4'}`;
  video.append(source);

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.autoplay = true;
    video.setAttribute('autoplay', '');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    });
    observer.observe(video);
  }
  return video;
}

function decorateMediaCell(cell) {
  cell.classList.add('columns-spotlight-media');
  const videoLink = [...cell.querySelectorAll('a[href]')].find((a) => VIDEO_RE.test(a.href));
  const picture = cell.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'columns-spotlight-media-asset';
  if (videoLink) {
    media.append(buildVideo(videoLink));
    const wrapper = videoLink.closest('p');
    if (wrapper && wrapper.textContent.trim() === videoLink.textContent.trim()) wrapper.remove();
    else videoLink.remove();
  }
  if (picture) {
    const pWrap = picture.closest('p');
    if (videoLink) picture.classList.add('columns-spotlight-poster');
    media.append(picture);
    if (pWrap && !pWrap.textContent.trim() && !pWrap.children.length) pWrap.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'columns-spotlight-overlay';
  overlay.append(...cell.childNodes);
  cell.replaceChildren(media);
  if (overlay.textContent.trim()) cell.append(overlay);
}

const ARROW_PATH = 'M1 14h16M10 7l7 7-7 7';
let listCount = 0;

function buildNav(cell, list) {
  listCount += 1;
  list.id = list.id || `columns-spotlight-products-${listCount}`;
  const nav = document.createElement('div');
  nav.className = 'columns-spotlight-nav';

  const makeButton = (dir, label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `columns-spotlight-arrow columns-spotlight-${dir}`;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-controls', list.id);
    btn.innerHTML = `<svg viewBox="0 0 18 28" width="18" height="28" aria-hidden="true" focusable="false"><path d="${ARROW_PATH}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    btn.addEventListener('click', () => {
      const item = list.querySelector('.columns-spotlight-product');
      const step = item ? item.getBoundingClientRect().width : list.clientWidth;
      list.scrollBy({ left: dir === 'prev' ? -step : step, behavior: 'smooth' });
    });
    return btn;
  };

  const prev = makeButton('prev', 'Previous products');
  const next = makeButton('next', 'Next products');
  nav.append(prev, next);
  cell.append(nav);

  const update = () => {
    const max = list.scrollWidth - list.clientWidth;
    prev.disabled = list.scrollLeft <= 1;
    next.disabled = list.scrollLeft >= max - 1;
    nav.hidden = max <= 1;
  };
  list.addEventListener('scroll', update, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(list);
  update();
}

function decorateContentCell(cell) {
  cell.classList.add('columns-spotlight-content');
  const intro = document.createElement('div');
  intro.className = 'columns-spotlight-intro';
  const list = document.createElement('ul');
  list.className = 'columns-spotlight-products';

  let current = null;
  [...cell.children].forEach((el) => {
    if (el.querySelector('picture') || el.tagName === 'PICTURE') {
      current = document.createElement('li');
      current.className = 'columns-spotlight-product';
      list.append(current);
    }
    (current || intro).append(el);
  });

  list.querySelectorAll('.columns-spotlight-product').forEach((item) => {
    const link = item.querySelector('a[href]');
    const pic = item.querySelector('picture');
    if (link && pic) {
      const a = document.createElement('a');
      a.href = link.href;
      a.tabIndex = -1;
      a.setAttribute('aria-hidden', 'true');
      a.className = 'columns-spotlight-product-image';
      const p = pic.closest('p');
      const holder = p && !p.textContent.trim() ? p : pic;
      holder.replaceWith(a);
      a.append(pic);
    }
  });

  cell.replaceChildren();
  if (intro.children.length) cell.append(intro);
  if (list.children.length) {
    cell.append(list);
    buildNav(cell, list);
  }
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  block.classList.add(`columns-spotlight-${cells.length}-cols`);

  // media cell = first cell carrying a video link or picture; remaining cells are content
  const mediaCell = cells.find((c) => [...c.querySelectorAll('a[href]')].some((a) => VIDEO_RE.test(a.href)))
    || (cells.length > 1 ? cells[0] : null);
  cells.forEach((cell) => {
    if (cell === mediaCell) decorateMediaCell(cell);
    else decorateContentCell(cell);
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    const isMedia = !!picture.closest('.columns-spotlight-media');
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: isMedia ? '900' : '400' }]);
    optimized.className = picture.className;
    picture.replaceWith(optimized);
  });

  // extra rows authored beyond the first are kept as-is, below
  [...block.children].slice(1).forEach((extra) => extra.classList.add('columns-spotlight-extra'));
}
