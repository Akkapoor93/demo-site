import {
  getProduct, formatPrice, addToCart, trackProductView, categoryPath, sitePath,
} from '../../scripts/shop.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function notFound(block) {
  const box = el('div', 'product-details-missing');
  box.append(el('h1', '', 'Product not found'));
  const p = el('p');
  const a = el('a', '', 'Browse earrings');
  a.href = sitePath('/jewelry/earrings');
  p.append('This design is no longer available. ', a);
  box.append(p);
  block.replaceChildren(box);
}

/**
 * Product detail page; the product comes from ?sku= in the page URL.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const sku = new URLSearchParams(window.location.search).get('sku');
  const product = sku ? await getProduct(sku) : null;
  if (!product) {
    notFound(block);
    return;
  }
  document.title = `${product.name} | Kapoor Jewellers`;

  const media = el('div', 'product-details-media');
  const img = el('img');
  img.src = product.image;
  img.alt = product.name;
  img.width = 640;
  img.height = 640;
  media.append(img);

  const info = el('div', 'product-details-info');
  const crumb = el('a', 'product-details-category', product.category);
  crumb.href = categoryPath(product.category);
  const title = el('h1', 'product-details-name', product.name);
  const price = el('p', 'product-details-price', formatPrice(product.price));
  const note = el('p', 'product-details-note', `Free shipping · SKU ${product.sku}`);
  const desc = el('p', 'product-details-description', product.description);

  const form = el('form', 'product-details-buy');
  const qtyLabel = el('label', 'product-details-qty', 'Quantity ');
  const qty = el('input');
  qty.type = 'number';
  qty.min = '1';
  qty.max = '10';
  qty.value = '1';
  qty.name = 'qty';
  qtyLabel.append(qty);
  const add = el('button', 'button primary', 'Add to cart');
  add.type = 'submit';
  const status = el('p', 'product-details-status');
  status.setAttribute('role', 'status');
  form.append(qtyLabel, add, status);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const count = Math.max(1, Math.min(10, Number(qty.value) || 1));
    addToCart(product, count, 'product page');
    status.replaceChildren('Added to your cart. ');
    const view = el('a', '', 'View cart');
    view.href = sitePath('/cart');
    status.append(view);
  });

  info.append(crumb, title, price, note, form, desc);
  block.replaceChildren(media, info);
  trackProductView(product);
}
