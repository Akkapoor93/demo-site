/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-spotlight. Base: columns.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .spotlight-carousel .spotlight-wrapper
 *
 * Output (matches blocks/columns-spotlight/columns-spotlight.js): one row, 2 cells
 *   cell 1 = video link (.mp4) + H2 heading + "Explore" link
 *   cell 2 = H3 heading, subtitle paragraph, "Explore" link, then per product: image paragraph + linked name paragraph
 *
 * Source structure (validated against block-context/columns-spotlight/source.html):
 *   .spotlight-main-banner .main-card-wrapper > a.main-card-link > video > source[src]
 *                                             + .main-card-text > h2.main-card-heading + a.main-card-link "Explore"
 *   .spotlight-content-wrapper > .spotlight-heading-section > h3.spotlight-title + p.spotlight-subtitle + a.spotlight-explore-link
 *                              > .spotlight-product-track .experience-commerce_assets-productTileRevamp (img.tile-image + span[title])
 * Products are iterated via the tile wrapper divs (the source nests <a> inside <a>).
 */
export default function parse(element, { document }) {
  const para = (child) => {
    const p = document.createElement('p');
    p.append(child);
    return p;
  };
  const link = (href, text) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    return a;
  };

  // ---- cell 1: media banner ----
  const banner = element.querySelector('.spotlight-main-banner') || element.firstElementChild;
  const mediaCell = [];
  if (banner) {
    const source = banner.querySelector('video source[src], video[src]');
    const videoSrc = source ? source.getAttribute('src') : '';
    if (videoSrc) mediaCell.push(para(link(videoSrc, videoSrc)));
    const poster = !videoSrc ? banner.querySelector('img') : null;
    if (poster) {
      const img = document.createElement('img');
      img.src = poster.getAttribute('src');
      img.alt = poster.getAttribute('alt') || '';
      mediaCell.push(img);
    }
    const h2 = banner.querySelector('h2, .main-card-heading');
    if (h2) {
      const h = document.createElement('h2');
      h.textContent = h2.textContent.trim();
      mediaCell.push(h);
    }
    // CTA: the text link in the overlay; never the video-wrapping anchor (its text is the
    // <video> fallback message)
    const cta = banner.querySelector('.main-card-text a[href]')
      || [...banner.querySelectorAll('a[href]')].find((a) => !a.querySelector('video')
        && a.textContent.trim() && !/browser does not support/i.test(a.textContent));
    const ctaHref = cta ? cta.getAttribute('href')
      : (banner.querySelector('a.main-card-link[href]') || { getAttribute: () => '' }).getAttribute('href');
    if (ctaHref) mediaCell.push(para(link(ctaHref, (cta && cta.textContent.trim()) || 'Explore')));
  }

  // ---- cell 2: heading + products ----
  const content = element.querySelector('.spotlight-content-wrapper') || element.lastElementChild;
  const contentCell = [];
  if (content) {
    const title = content.querySelector('.spotlight-title, .spotlight-heading-section h3, h3');
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      contentCell.push(h3);
    }
    const subtitle = content.querySelector('.spotlight-subtitle, .spotlight-heading-section p');
    if (subtitle && subtitle.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = subtitle.textContent.trim();
      contentCell.push(p);
    }
    const explore = content.querySelector('.spotlight-explore-link, .spotlight-heading-section a[href]')
      || content.querySelector('.spotlight-explore-link-mobile');
    if (explore) contentCell.push(para(link(explore.getAttribute('href'), explore.textContent.trim() || 'Explore')));

    const seen = new Set();
    let tiles = [...content.querySelectorAll('.experience-commerce_assets-productTileRevamp')];
    if (!tiles.length) tiles = [...content.querySelectorAll('.product-tile-revamp')];
    tiles.forEach((tile) => {
      if (tile.classList.contains('slick-cloned') || tile.closest('.slick-cloned')) return;
      const img = tile.querySelector('img.tile-image, img');
      const a = [...tile.querySelectorAll('a[href]')].find((x) => !/^javascript:/i.test(x.getAttribute('href')));
      const href = a ? a.getAttribute('href') : '';
      const nameEl = tile.querySelector('span[title], .pdp-link h3, h3');
      const name = (nameEl ? nameEl.textContent.trim() : '') || (img ? (img.getAttribute('alt') || '').trim() : '');
      const key = href || name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      if (img && img.getAttribute('src')) {
        const i = document.createElement('img');
        i.src = img.getAttribute('src');
        i.alt = (img.getAttribute('alt') || name).trim();
        contentCell.push(para(i));
      }
      if (name) contentCell.push(para(href ? link(href, name) : document.createTextNode(name)));
    });
  }

  if (!mediaCell.length && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[mediaCell.length ? mediaCell : '', contentCell.length ? contentCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-spotlight', cells });
  element.replaceWith(block);
}
