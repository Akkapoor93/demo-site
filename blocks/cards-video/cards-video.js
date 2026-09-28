import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_RE = /\.(mp4|webm|mov)(\?.*)?$/i;

function createVideo(href, hasPoster) {
  const video = document.createElement('video');
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', hasPoster ? 'none' : 'metadata');
  const source = document.createElement('source');
  source.src = hasPoster ? href : `${href.split('#')[0]}#t=0.1`;
  source.type = href.split('?')[0].toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
  video.append(source);
  return video;
}

function createArrow(dir) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `cards-video-arrow cards-video-${dir}`;
  button.setAttribute('aria-label', dir === 'prev' ? 'Previous video' : 'Next video');
  const path = dir === 'prev' ? 'M30 21H12M18 15l-6 6 6 6' : 'M12 21h18M24 15l6 6-6 6';
  button.innerHTML = `<svg viewBox="0 0 42 42" width="42" height="42" aria-hidden="true" focusable="false">
    <circle cx="21" cy="21" r="20.5" fill="none" stroke="currentcolor"/>
    <path d="${path}" fill="none" stroke="currentcolor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  return button;
}

function play(li, video) {
  li.classList.add('cards-video-playing');
  video.controls = true;
  video.play().catch(() => {});
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row, idx) => {
    const link = [...row.querySelectorAll('a[href]')].find((a) => VIDEO_RE.test(a.href))
      || row.querySelector('a[href]');
    const img = row.querySelector('picture img');
    if (!link && !img) return;

    const li = document.createElement('li');
    li.className = 'cards-video-card';
    const media = document.createElement('div');
    media.className = 'cards-video-media';
    li.append(media);

    // any authored text beyond the link (e.g. patron name) becomes the card body
    const label = link ? link.textContent.trim() : '';
    const text = [...row.querySelectorAll(':scope > div > *')]
      .filter((el) => !el.querySelector('picture') && !(link && el.contains(link)) && el.textContent.trim());
    if (text.length) {
      const body = document.createElement('div');
      body.className = 'cards-video-card-body';
      body.append(...text);
      li.append(body);
    }

    if (link && VIDEO_RE.test(link.href)) {
      const video = createVideo(link.href, !!img);
      media.append(video);
      if (img) {
        const poster = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
        poster.classList.add('cards-video-poster');
        media.append(poster);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cards-video-play';
      button.setAttribute('aria-label', `Play video${label && !VIDEO_RE.test(label) ? `: ${label}` : ` ${idx + 1}`}`);
      button.addEventListener('click', () => play(li, video));
      media.append(button);
      video.addEventListener('ended', () => li.classList.remove('cards-video-playing'));
    } else {
      // non-video link or image only: render as a linked image card
      const picture = img ? createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]) : null;
      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = picture ? '' : label;
        if (picture) a.append(picture);
        media.append(a);
      } else if (picture) {
        media.append(picture);
      }
    }
    ul.append(li);
  });

  if (ul.children.length < 2) {
    block.replaceChildren(ul);
    return;
  }

  // mobile slider: one card per view with prev/next arrows (hidden by CSS on wider screens)
  const slider = document.createElement('div');
  slider.className = 'cards-video-slider';
  const prev = createArrow('prev');
  const next = createArrow('next');
  // wraps around at either end, so both arrows stay active (as on the source)
  const step = (dir) => {
    const max = ul.scrollWidth - ul.clientWidth;
    let left = ul.scrollLeft + dir * ul.clientWidth;
    if (dir < 0 && ul.scrollLeft <= 1) left = max;
    else if (dir > 0 && ul.scrollLeft >= max - 1) left = 0;
    ul.scrollTo({ left, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  slider.append(prev, ul, next);
  block.replaceChildren(slider);
}
