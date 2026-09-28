/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-store. Base: cards.
 * Source: https://www.tanishq.com/homepage
 * Source selector: .home-stores .stores-cards-all
 *
 * Output (matches blocks/cards-store/cards-store.js):
 *   one row per store: cell 1 = image,
 *   cell 2 = linked H3 store name, address paragraph, tel link paragraph, "Get Directions" link paragraph
 *
 * Source structure (validated against block-context/cards-store/source.html):
 *   .slick-slide.store-details-column > .card-body > .form-check
 *     > .thumbnail-img > a[href=/storeDetails?storeId=..] > img.store-img
 *     > .store-details > .store-name + address > span.store-address + span.phonenumber-label > a.storelocator-phone[href^=tel:]
 *                      + .view-store-details > a.home-store-direction-detail (maps)
 * Iteration is keyed on the inner div.card-body wrappers; slick clones are skipped.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.card-body')];
  if (!items.length) items = [...element.querySelectorAll('.store-details-column, .store-details')];

  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const para = (child) => {
    const p = document.createElement('p');
    p.append(child);
    return p;
  };

  const cells = [];
  const seen = new Set();

  items.forEach((item) => {
    if (item.closest('.slick-cloned')) return;
    const img = item.querySelector('img.store-img, .thumbnail-img img') || item.querySelector('img');
    const nameEl = item.querySelector('.store-name');
    const name = text(nameEl) || (nameEl && nameEl.getAttribute('title')) || '';
    const detailLink = item.querySelector('.thumbnail-img a[href], a[href*="storeDetails"]');
    const address = text(item.querySelector('.store-address'));
    const phone = item.querySelector('a[href^="tel:"]');
    const directions = item.querySelector('a.home-store-direction-detail[href]')
      || [...item.querySelectorAll('a[href]')].find((a) => /maps|direction/i.test(`${a.getAttribute('href')} ${a.textContent}`));

    const key = (detailLink && detailLink.getAttribute('href')) || name;
    if (!key || seen.has(key)) return;
    seen.add(key);

    let imageCell = '';
    if (img && img.getAttribute('src')) {
      const i = document.createElement('img');
      i.src = img.getAttribute('src');
      const alt = (img.getAttribute('alt') || '').trim();
      i.alt = !alt || /thumbnail/i.test(alt) ? name : alt;
      imageCell = i;
    }

    const body = [];
    if (name) {
      const h3 = document.createElement('h3');
      if (detailLink) {
        const a = document.createElement('a');
        a.href = detailLink.getAttribute('href').trim();
        a.textContent = name;
        h3.append(a);
      } else {
        h3.textContent = name;
      }
      body.push(h3);
    }
    if (address) {
      const p = document.createElement('p');
      p.textContent = address;
      body.push(p);
    }
    if (phone) {
      const a = document.createElement('a');
      a.href = `tel:${phone.getAttribute('href').replace(/^tel:/i, '').replace(/[^\d+]/g, '')}`;
      a.textContent = text(phone);
      body.push(para(a));
    }
    if (directions) {
      const a = document.createElement('a');
      a.href = directions.getAttribute('href').trim();
      a.textContent = text(directions) || 'Get Directions';
      body.push(para(a));
    }

    cells.push([imageCell, body.length ? body : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-store', cells });
  element.replaceWith(block);
}
