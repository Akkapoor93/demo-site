import {
  currentCustomer, signUp, signIn, signOut, ordersFor, formatPrice, sitePath,
} from '../../scripts/shop.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function input(label, name, type = 'text', autocomplete = '') {
  const wrap = el('label', 'account-field');
  wrap.append(el('span', '', label));
  const field = el('input');
  field.type = type;
  field.name = name;
  field.required = true;
  if (autocomplete) field.autocomplete = autocomplete;
  wrap.append(field);
  return wrap;
}

function authForm(title, fields, submitLabel, onSubmit, extra) {
  const form = el('form', 'account-form');
  form.append(el('h2', '', title), ...fields);
  if (extra) form.append(extra);
  const submit = el('button', 'button primary', submitLabel);
  submit.type = 'submit';
  const error = el('p', 'account-error');
  error.setAttribute('role', 'alert');
  form.append(submit, error);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      onSubmit(Object.fromEntries(new FormData(form)), form);
    } catch (err) {
      error.textContent = err.message;
    }
  });
  return form;
}

function signedOut(block, render) {
  const signInForm = authForm('Sign in', [
    input('Email', 'email', 'email', 'email'),
    input('Password', 'password', 'password', 'current-password'),
  ], 'Sign in', (data) => {
    signIn({ email: data.email });
    render();
  });

  const optInLabel = el('label', 'account-option');
  const optIn = el('input');
  optIn.type = 'checkbox';
  optIn.name = 'optIn';
  optInLabel.append(optIn, ' Email me offers and new collections');
  const signUpForm = authForm('Create an account', [
    input('First name', 'firstName', 'text', 'given-name'),
    input('Last name', 'lastName', 'text', 'family-name'),
    input('Email', 'email', 'email', 'email'),
    input('Password', 'password', 'password', 'new-password'),
  ], 'Create account', (data) => {
    signUp({
      email: data.email, firstName: data.firstName, lastName: data.lastName, optIn: optIn.checked,
    });
    render();
  }, optInLabel);

  const note = el('p', 'account-note', 'POC demo accounts are stored in this browser only; passwords are not checked.');
  block.replaceChildren(signInForm, signUpForm, note);
}

function signedIn(block, customer, render) {
  const profile = el('div', 'account-profile');
  profile.append(
    el('h2', '', `Hello, ${customer.firstName || customer.email}`),
    el('p', '', customer.email),
    el('p', 'account-note', `Customer ID ${customer.customerId}`),
  );
  const out = el('button', 'button secondary', 'Sign out');
  out.type = 'button';
  out.addEventListener('click', () => {
    signOut();
    render();
  });
  profile.append(out);

  const history = el('div', 'account-orders');
  history.append(el('h2', '', 'My orders'));
  const orders = ordersFor(customer.email).reverse();
  if (!orders.length) {
    const p = el('p', '', 'No orders yet. ');
    const shop = el('a', '', 'Shop earrings');
    shop.href = sitePath('/jewelry/earrings');
    p.append(shop);
    history.append(p);
  } else {
    const list = el('ul');
    orders.forEach((o) => {
      const li = el('li');
      li.append(
        el('strong', '', o.id),
        el('span', '', new Date(o.date).toLocaleDateString('en-US', { dateStyle: 'medium' })),
        el('span', '', `${o.items.reduce((n, i) => n + i.qty, 0)} item(s)`),
        el('span', '', formatPrice(o.total)),
      );
      list.append(li);
    });
    history.append(list);
  }
  block.replaceChildren(profile, history);
}

/**
 * Account page: sign in / create account (test accounts), profile and order history.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const render = () => {
    const customer = currentCustomer();
    if (customer) signedIn(block, customer, render);
    else signedOut(block, render);
  };
  render();
}
