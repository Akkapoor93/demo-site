/* eslint-disable */
/* global WebImporter */

/**
 * Kapoor Jewellers POC shop page definitions:
 * /jewelry/earrings, /jewelry/rings, /product, /cart, /checkout, /account.
 * The bulk importer writes one page per import script, so each page has a small entry
 * script in tools/importer/shop-pages/ (import-<name>.js) built with shopPageImport().
 * The source document is ignored; each page is a heading + one shop block + metadata.
 */
const BRAND = 'Kapoor Jewellers';

export const PAGES = [
  {
    path: '/jewelry/earrings',
    title: 'Earrings',
    intro: 'Diamond studs, drop earrings and jhumkas, crafted in 14KT, 18KT and 22KT gold.',
    block: 'Product List',
    config: { Category: 'Earrings' },
    meta: { 'Page Type': 'category', Category: 'Earrings' },
  },
  {
    path: '/jewelry/rings',
    title: 'Rings',
    intro: 'Engagement rings, everyday bands and statement cocktail rings.',
    block: 'Product List',
    config: { Category: 'Rings' },
    meta: { 'Page Type': 'category', Category: 'Rings' },
  },
  {
    path: '/product', title: 'Product', block: 'Product Details', meta: { 'Page Type': 'product' }, noHeading: true,
  },
  {
    path: '/cart', title: 'Your cart', block: 'Cart', meta: { 'Page Type': 'cart' },
  },
  {
    path: '/checkout', title: 'Checkout', block: 'Checkout', meta: { 'Page Type': 'checkout' },
  },
  {
    path: '/account', title: 'My account', block: 'Account', meta: { 'Page Type': 'account' },
  },
];

function buildPage(document, page) {
  const main = document.createElement('main');
  if (!page.noHeading) {
    const h1 = document.createElement('h1');
    h1.textContent = page.title;
    main.append(h1);
  }
  if (page.intro) {
    const p = document.createElement('p');
    p.textContent = page.intro;
    main.append(p);
  }
  const cells = page.config ? Object.entries(page.config).map(([k, v]) => [k, v]) : [['']];
  main.append(WebImporter.Blocks.createBlock(document, { name: page.block, cells }));

  // metadata in its own trailing section so it is consumed as page metadata
  main.append(document.createElement('hr'));
  main.append(WebImporter.Blocks.createBlock(document, {
    name: 'Metadata',
    cells: {
      Title: `${page.title} | ${BRAND}`,
      Description: page.intro || `${page.title} — ${BRAND} (POC shop).`,
      ...page.meta,
    },
  }));
  return main;
}

/** Import config for one shop page (by its path). */
export function shopPageImport(path) {
  const page = PAGES.find((p) => p.path === path);
  return {
    transform: ({ document }) => [{
      element: buildPage(document, page),
      path: page.path,
      report: { title: `${page.title} | ${BRAND}`, template: 'shop' },
    }],
  };
}
