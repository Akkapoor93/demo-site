/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-video. Base: cards.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .Testimonials .video-slider-wrapper
 *
 * Output (matches blocks/cards-video/cards-video.js):
 *   one row per video: cell 1 = poster image (optional, empty when absent), cell 2 = link to the .mp4
 *
 * Source structure (validated against block-context/cards-video/source.html):
 *   .swiper-wrapper > .swiper-slide > .video-card > video > source[src] + .play-icon
 * Slider arrows / notification / duplicate (loop) slides are ignored.
 */
export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.video-card')];
  if (!cards.length) cards = [...element.querySelectorAll('.swiper-slide, video')];

  const cells = [];
  const seen = new Set();

  cards.forEach((card) => {
    if (card.closest('.slick-cloned, .swiper-slide-duplicate')) return;
    const video = card.tagName === 'VIDEO' ? card : card.querySelector('video');
    const source = video && (video.querySelector('source[src]') || (video.getAttribute('src') ? video : null));
    const src = source ? source.getAttribute('src')
      : ((card.querySelector('a[href$=".mp4"], a[href*=".mp4?"]') || { getAttribute: () => '' }).getAttribute('href'));
    if (!src || seen.has(src)) return;
    seen.add(src);

    let posterCell = '';
    const posterSrc = (video && video.getAttribute('poster')) || '';
    const posterImg = card.querySelector('img:not(.arrow-img)');
    if (posterSrc || posterImg) {
      const img = document.createElement('img');
      img.src = posterSrc || posterImg.getAttribute('src');
      img.alt = posterImg ? (posterImg.getAttribute('alt') || '') : '';
      posterCell = img;
    }

    const a = document.createElement('a');
    a.href = src;
    a.textContent = src;

    cells.push([posterCell, a]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video', cells });
  element.replaceWith(block);
}
