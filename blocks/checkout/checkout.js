import {
  cartLines, cartTotals, applyPromo, removePromo, promoFromUrl,
  formatPrice, placeOrder, currentCustomer, sitePath, trackCheckout,
} from '../../scripts/shop.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function field(label, name, { type = 'text', value = '', autocomplete } = {}) {
  const wrap = el('label', 'checkout-field');
  wrap.append(el('span', '', label));
  const input = el('input');
  input.type = type;
  input.name = name;
  input.required = true;
  input.value = value;
  if (autocomplete) input.autocomplete = autocomplete;
  wrap.append(input);
  return wrap;
}

function row(label, value, className = 'checkout-row') {
  const p = el('p', className);
  p.append(el('span', '', label), el('span', '', value));
  return p;
}

function promoForm(onChange) {
  const form = el('form', 'checkout-promo');
  const label = el('label', 'checkout-field');
  const input = el('input');
  input.name = 'promo';
  input.autocomplete = 'off';
  label.append(el('span', '', 'Promo code'), input);
  const apply = el('button', 'button secondary', 'Apply');
  apply.type = 'submit';
  const message = el('p', 'checkout-error');
  message.setAttribute('role', 'alert');
  form.append(label, apply, message);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      applyPromo(input.value);
      onChange();
    } catch (err) {
      message.textContent = err.message;
    }
  });
  return form;
}

function summary(lines, onChange) {
  const totals = cartTotals(lines);
  const aside = el('aside', 'checkout-summary');
  aside.append(el('h2', '', 'Your order'));
  const list = el('ul');
  lines.forEach((l) => {
    const li = el('li');
    li.append(el('span', '', `${l.product.name} × ${l.qty}`), el('span', '', formatPrice(l.product.price * l.qty)));
    list.append(li);
  });
  aside.append(list);
  if (totals.promo) {
    const discount = row(`${totals.promo} (${totals.promoLabel})`, `−${formatPrice(totals.discount)}`, 'checkout-row checkout-discount');
    const remove = el('button', 'checkout-promo-remove', 'Remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove promo code ${totals.promo}`);
    remove.addEventListener('click', () => {
      removePromo();
      onChange();
    });
    discount.firstElementChild.append(' ', remove);
    aside.append(row('Subtotal', formatPrice(totals.subtotal)), discount);
  } else {
    aside.append(promoForm(onChange));
  }
  aside.append(row('Total', formatPrice(totals.total), 'checkout-total'));
  return aside;
}

function confirmation(order) {
  const box = el('div', 'checkout-confirmation');
  box.append(
    el('h2', '', 'Thank you for your order'),
    el('p', '', `Order ${order.id} is confirmed. A confirmation would be emailed to ${order.email}.`),
    el('p', 'checkout-test-note', 'Test order — no payment was taken.'),
  );
  const list = el('ul');
  order.items.forEach((i) => list.append(el('li', '', `${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`)));
  if (order.discount) box.append(list, el('p', '', `${order.promo}: −${formatPrice(order.discount)}`));
  else box.append(list);
  box.append(el('p', 'checkout-total', `Total ${formatPrice(order.total)}`));
  const more = el('p');
  const shop = el('a', 'button secondary', 'Continue shopping');
  shop.href = sitePath('/');
  const account = el('a', 'button secondary', 'My account');
  account.href = sitePath('/account');
  more.append(shop, ' ', account);
  box.append(more);
  return box;
}

/**
 * Checkout: contact + shipping form, test payment, order placement and confirmation.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  promoFromUrl();
  const lines = await cartLines();
  if (!lines.length) {
    const empty = el('div', 'checkout-empty');
    empty.append(el('p', '', 'Your cart is empty.'));
    const back = el('a', 'button secondary', 'Shop earrings');
    back.href = sitePath('/jewelry/earrings');
    empty.append(back);
    block.replaceChildren(empty);
    return;
  }

  const customer = currentCustomer() || {};
  const form = el('form', 'checkout-form');
  const contact = el('fieldset');
  contact.append(
    el('legend', '', 'Contact'),
    field('Email', 'email', { type: 'email', value: customer.email || '', autocomplete: 'email' }),
    field('First name', 'firstName', { value: customer.firstName || '', autocomplete: 'given-name' }),
    field('Last name', 'lastName', { value: customer.lastName || '', autocomplete: 'family-name' }),
  );
  const shipping = el('fieldset');
  shipping.append(
    el('legend', '', 'Shipping address'),
    field('Address', 'street', { autocomplete: 'street-address' }),
    field('City', 'city', { autocomplete: 'address-level2' }),
    field('State', 'state', { autocomplete: 'address-level1' }),
    field('ZIP code', 'zip', { autocomplete: 'postal-code' }),
  );
  const payment = el('fieldset');
  const testPay = el('label', 'checkout-option');
  const radio = el('input');
  radio.type = 'radio';
  radio.name = 'payment';
  radio.checked = true;
  testPay.append(radio, ' Test payment (POC — no charge)');
  payment.append(el('legend', '', 'Payment'), testPay);

  const optInLabel = el('label', 'checkout-option');
  const optIn = el('input');
  optIn.type = 'checkbox';
  optIn.name = 'optIn';
  optInLabel.append(optIn, ' Email me offers and order updates from Kapoor Jewellers');

  const submit = el('button', 'button primary checkout-submit', `Place order · ${formatPrice(cartTotals(lines).total)}`);
  submit.type = 'submit';
  const error = el('p', 'checkout-error');
  error.setAttribute('role', 'alert');
  form.append(contact, shipping, payment, optInLabel, submit, error);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submit.disabled = true;
    const data = Object.fromEntries(new FormData(form));
    try {
      const order = await placeOrder({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        address: {
          street: data.street, city: data.city, state: data.state, zip: data.zip, country: 'US',
        },
        optIn: optIn.checked,
      });
      block.replaceChildren(confirmation(order));
      window.scrollTo({ top: 0 });
    } catch (err) {
      error.textContent = err.message;
      submit.disabled = false;
    }
  });

  let aside;
  const refresh = () => {
    const next = summary(lines, refresh);
    if (aside) aside.replaceWith(next);
    aside = next;
    submit.textContent = `Place order · ${formatPrice(cartTotals(lines).total)}`;
  };
  refresh();
  block.replaceChildren(form, aside);
  trackCheckout(lines);
}
