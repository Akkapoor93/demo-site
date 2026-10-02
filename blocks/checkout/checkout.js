import {
  cartLines, cartTotal, formatPrice, placeOrder, currentCustomer, sitePath, trackCheckout,
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

function summary(lines) {
  const aside = el('aside', 'checkout-summary');
  aside.append(el('h2', '', 'Your order'));
  const list = el('ul');
  lines.forEach((l) => {
    const li = el('li');
    li.append(el('span', '', `${l.product.name} × ${l.qty}`), el('span', '', formatPrice(l.product.price * l.qty)));
    list.append(li);
  });
  const total = el('p', 'checkout-total');
  total.append(el('span', '', 'Total'), el('span', '', formatPrice(cartTotal(lines))));
  aside.append(list, total);
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
  box.append(list, el('p', 'checkout-total', `Total ${formatPrice(order.total)}`));
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

  const submit = el('button', 'button primary checkout-submit', `Place order · ${formatPrice(cartTotal(lines))}`);
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

  block.replaceChildren(form, summary(lines));
  trackCheckout(lines);
}
