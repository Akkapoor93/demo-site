import {
  cartLines, cartTotal, setQuantity, formatPrice, productPath, sitePath, trackCartView,
} from '../../scripts/shop.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function qtyControl(line, onChange) {
  const wrap = el('div', 'cart-qty');
  const minus = el('button', 'cart-qty-btn', '−');
  minus.type = 'button';
  minus.setAttribute('aria-label', `Decrease quantity of ${line.product.name}`);
  const value = el('span', 'cart-qty-value', String(line.qty));
  const plus = el('button', 'cart-qty-btn', '+');
  plus.type = 'button';
  plus.setAttribute('aria-label', `Increase quantity of ${line.product.name}`);
  minus.addEventListener('click', () => onChange(line.qty - 1));
  plus.addEventListener('click', () => onChange(Math.min(10, line.qty + 1)));
  wrap.append(minus, value, plus);
  return wrap;
}

async function render(block) {
  const lines = await cartLines();
  if (!lines.length) {
    const empty = el('div', 'cart-empty');
    empty.append(el('p', '', 'Your cart is empty.'));
    const p = el('p');
    const earrings = el('a', 'button secondary', 'Shop earrings');
    earrings.href = sitePath('/jewelry/earrings');
    const rings = el('a', 'button secondary', 'Shop rings');
    rings.href = sitePath('/jewelry/rings');
    p.append(earrings, ' ', rings);
    empty.append(p);
    block.replaceChildren(empty);
    return lines;
  }

  const list = el('ul', 'cart-lines');
  lines.forEach((line) => {
    const li = el('li', 'cart-line');
    const img = el('img');
    img.src = line.product.image;
    img.alt = '';
    img.width = 120;
    img.height = 120;
    const details = el('div', 'cart-line-details');
    const name = el('a', 'cart-line-name', line.product.name);
    name.href = productPath(line.product);
    details.append(name, el('span', 'cart-line-unit', formatPrice(line.product.price)));
    const remove = el('button', 'cart-line-remove', 'Remove');
    remove.type = 'button';
    const change = (qty) => {
      setQuantity(line.product, qty);
      render(block);
    };
    remove.addEventListener('click', () => change(0));
    details.append(qtyControl(line, change), remove);
    const total = el('span', 'cart-line-total', formatPrice(line.product.price * line.qty));
    li.append(img, details, total);
    list.append(li);
  });

  const summary = el('aside', 'cart-summary');
  summary.append(el('h2', '', 'Order summary'));
  const rows = el('dl');
  [['Subtotal', formatPrice(cartTotal(lines))], ['Shipping', 'Free'], ['Total', formatPrice(cartTotal(lines))]]
    .forEach(([k, v]) => rows.append(el('dt', '', k), el('dd', '', v)));
  const checkout = el('a', 'button primary cart-checkout', 'Proceed to checkout');
  checkout.href = sitePath('/checkout');
  summary.append(rows, checkout);

  block.replaceChildren(list, summary);
  return lines;
}

/**
 * Cart page: lines with quantity controls, totals and checkout link.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const lines = await render(block);
  trackCartView(lines);
}
