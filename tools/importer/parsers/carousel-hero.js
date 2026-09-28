/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .experience-commerce_layouts-carouselRevamp .carousel.main-banner
 *
 * Output (matches blocks/carousel-hero/carousel-hero.js):
 *   one row per slide:
 *     cell 1 = desktop image + mobile image (second picture in same cell)
 *     cell 2 = link to slide target (image alt as link text)
 *
 * Source structure (validated against block-context/carousel-hero/source.html):
 *   .carousel-inner > .carousel-item > .collecion_clicks ... figure.image-component > a[href]
 *     > img.d-none.d-lg-block (desktop) + img.d-lg-none.d-block (mobile)
 * Iteration is keyed on the .carousel-item <div> wrappers (not on the anchors).
 */
export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.carousel-item')];
  if (!slides.length) slides = [...element.querySelectorAll('figure.image-component, figure')];

  const cells = [];
  const seen = new Set();

  slides.forEach((slide) => {
    // defensive: skip slider clones if the cleanup transformer did not run
    if (slide.classList.contains('slick-cloned')) return;

    const imgs = [...slide.querySelectorAll('img')];
    if (!imgs.length) return;

    const desktop = slide.querySelector('img.d-lg-block')
      || slide.querySelector('img:not(.d-lg-none)')
      || imgs[0];
    const mobile = slide.querySelector('img.d-lg-none')
      || imgs.find((img) => img !== desktop && img.getAttribute('src') !== desktop.getAttribute('src'));

    const anchor = slide.querySelector('a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';

    const key = `${desktop.getAttribute('src')}|${href}`;
    if (seen.has(key)) return;
    seen.add(key);

    const alt = (desktop.getAttribute('alt') || desktop.getAttribute('title') || '').trim();

    const imageCell = [];
    const d = document.createElement('img');
    d.src = desktop.getAttribute('src');
    d.alt = alt;
    imageCell.push(d);
    if (mobile && mobile !== desktop) {
      const m = document.createElement('img');
      m.src = mobile.getAttribute('src');
      m.alt = (mobile.getAttribute('alt') || alt).trim();
      imageCell.push(m);
    }

    let linkCell = '';
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = alt || href;
      linkCell = a;
    }

    cells.push([imageCell, linkCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
