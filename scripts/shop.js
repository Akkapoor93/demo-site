/**
 * POC shop for Kapoor Jewellers: catalogue (data/products.json), cart, test accounts and
 * test orders kept in the browser, plus the commerce / account events from
 * docs/tracking-spec.md. Replaceable by Adobe Commerce later without changing the pages.
 */
import {
  trackEvent, identify, forgetIdentity, setMarketingConsent, sendProfile,
} from './tracking.js';

const CART_KEY = 'kapoor-cart';
const ACCOUNTS_KEY = 'kapoor-accounts';
const SESSION_KEY = 'kapoor-session';
const ORDERS_KEY = 'kapoor-orders';
const CURRENCY = 'USD';

const CATEGORY_PATHS = { Earrings: '/jewelry/earrings', Rings: '/jewelry/rings' };

let catalogPromise;

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (e) {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const randomId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/** Site path for links built in code (local preview serves pages under /content). */
export function sitePath(path) {
  return window.location.pathname.startsWith('/content/') ? `/content${path}` : path;
}

export const formatPrice = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY }).format(amount);

export async function getCatalog() {
  catalogPromise ||= fetch(`${window.hlx?.codeBasePath || ''}/data/products.json`)
    .then((resp) => (resp.ok ? resp.json() : { products: [] }))
    .then((data) => data.products || []);
  return catalogPromise;
}

export async function getProduct(sku) {
  const products = await getCatalog();
  return products.find((p) => p.sku.toLowerCase() === String(sku || '').toLowerCase());
}

export const productPath = (product) => sitePath(`/product?sku=${encodeURIComponent(product.sku)}`);
export const categoryPath = (category) => sitePath(CATEGORY_PATHS[category] || '/');
// absolute product link for emails (always the public path, without the local /content prefix)
const productLink = (product) => new URL(`/product?sku=${encodeURIComponent(product.sku)}`, window.location.origin).href;
const imageLink = (product) => new URL(product.image, window.location.origin).href;

const lineItem = (product, quantity) => ({
  SKU: product.sku,
  name: product.name,
  quantity,
  priceTotal: Math.round(product.price * quantity * 100) / 100,
  currencyCode: CURRENCY,
});

/* ---------- cart ---------- */

export function getCart() {
  const cart = read(CART_KEY, null);
  if (cart && Array.isArray(cart.items)) return cart;
  // keep one cart ID per shopper so every cart event refers to the same cart
  const fresh = { id: randomId('CART'), items: [] };
  write(CART_KEY, fresh);
  return fresh;
}

function saveCart(cart) {
  write(CART_KEY, cart);
  window.dispatchEvent(new CustomEvent('kapoor:cart', { detail: cart }));
}

export const cartCount = (cart = getCart()) => cart.items.reduce((n, i) => n + i.qty, 0);

/** Cart lines joined with catalogue data. */
export async function cartLines(cart = getCart()) {
  const products = await getCatalog();
  return cart.items
    .map((i) => ({ product: products.find((p) => p.sku === i.sku), qty: i.qty }))
    .filter((l) => l.product);
}

export const cartTotal = (lines) => {
  const sum = lines.reduce((t, l) => t + l.product.price * l.qty, 0);
  return Math.round(sum * 100) / 100;
};

/* ---------- promo codes ---------- */

// codes offered in POC-Kapoor journey emails (checked in the browser; POC only)
const PROMOS = { KAPOOR10: { percent: 10, label: '10% off' } };

export function applyPromo(code) {
  const key = String(code || '').trim().toUpperCase();
  if (!PROMOS[key]) throw new Error('This promo code is not valid.');
  const cart = getCart();
  cart.promo = key;
  saveCart(cart);
}

export function removePromo() {
  const cart = getCart();
  delete cart.promo;
  saveCart(cart);
}

/** Applies a code from the page address (e.g. a reminder email links to /cart?promo=KAPOOR10). */
export function promoFromUrl() {
  const code = new URLSearchParams(window.location.search).get('promo');
  if (!code) return;
  try {
    applyPromo(code);
  } catch (e) { /* ignore unknown codes in links */ }
}

/** Subtotal, applied promo code, discount and total for the cart. */
export function cartTotals(lines, cart = getCart()) {
  const subtotal = cartTotal(lines);
  const promo = PROMOS[cart.promo] ? cart.promo : null;
  const discount = promo ? Math.round(subtotal * PROMOS[promo].percent) / 100 : 0;
  return {
    subtotal,
    promo,
    promoLabel: promo ? PROMOS[promo].label : '',
    discount,
    total: Math.round((subtotal - discount) * 100) / 100,
  };
}

function trackAdd(cart, product, qty, method) {
  trackEvent('commerce.productListAdds', {
    commerce: { productListAdds: { value: 1 }, cart: { cartID: cart.id } },
    productListItems: [{ ...lineItem(product, qty), productAddMethod: method }],
  }, { productImageUrl: imageLink(product), productUrl: productLink(product) });
}

export function addToCart(product, qty = 1, method = 'product page') {
  const cart = getCart();
  const line = cart.items.find((i) => i.sku === product.sku);
  if (line) line.qty += qty;
  else cart.items.push({ sku: product.sku, qty });
  saveCart(cart);
  trackAdd(cart, product, qty, method);
}

export function setQuantity(product, qty) {
  const cart = getCart();
  const line = cart.items.find((i) => i.sku === product.sku);
  if (!line) return;
  const removed = line.qty - Math.max(qty, 0);
  if (qty <= 0) cart.items = cart.items.filter((i) => i.sku !== product.sku);
  else line.qty = qty;
  saveCart(cart);
  if (removed > 0) {
    trackEvent('commerce.productListRemovals', {
      commerce: { productListRemovals: { value: 1 }, cart: { cartID: cart.id } },
      productListItems: [lineItem(product, removed)],
    });
  } else if (removed < 0) {
    trackAdd(cart, product, -removed, 'cart quantity');
  }
}

export function trackProductView(product) {
  trackEvent('commerce.productViews', {
    commerce: { productViews: { value: 1 } },
    productListItems: [lineItem(product, 1)],
  }, {
    productImageUrl: imageLink(product),
    productUrl: productLink(product),
    category: product.category,
  });
}

export function trackCartView(lines) {
  trackEvent('commerce.productListViews', {
    commerce: { productListViews: { value: 1 }, cart: { cartID: getCart().id } },
    productListItems: lines.map((l) => lineItem(l.product, l.qty)),
  });
}

export function trackCheckout(lines) {
  trackEvent('commerce.checkouts', {
    commerce: { checkouts: { value: 1 }, cart: { cartID: getCart().id } },
    productListItems: lines.map((l) => lineItem(l.product, l.qty)),
  });
}

/* ---------- test accounts ---------- */

export const currentCustomer = () => read(SESSION_KEY, null);

function startSession(account) {
  const {
    email, firstName, lastName, customerId,
  } = account;
  const customer = {
    email, firstName, lastName, customerId,
  };
  write(SESSION_KEY, customer);
  identify({ email: customer.email, customerId: customer.customerId });
  window.dispatchEvent(new CustomEvent('kapoor:account', { detail: customer }));
  return customer;
}

/** Creates a test account (no real authentication — POC only). */
export function signUp({
  email, firstName, lastName, optIn,
}) {
  const accounts = read(ACCOUNTS_KEY, {});
  const key = email.trim().toLowerCase();
  if (accounts[key]) throw new Error('An account with this email already exists. Please sign in.');
  const account = {
    email: key, firstName, lastName, customerId: randomId('KJ'), optIn: !!optIn,
  };
  accounts[key] = account;
  write(ACCOUNTS_KEY, accounts);
  const customer = startSession(account);
  trackEvent('userAccount.createProfile', { userAccount: { createProfile: 1 } });
  sendProfile({ ...customer, optIn: account.optIn });
  setMarketingConsent(account.optIn);
  return customer;
}

export function signIn({ email }) {
  const account = read(ACCOUNTS_KEY, {})[email.trim().toLowerCase()];
  if (!account) throw new Error('No account found for this email. Create an account first.');
  const customer = startSession(account);
  trackEvent('userAccount.login', { userAccount: { login: 1 } });
  // re-send the profile so accounts created before consent (or before the profile
  // connection existed) still get a profile with their email-offers choice
  sendProfile({ ...customer, optIn: account.optIn });
  setMarketingConsent(!!account.optIn);
  return customer;
}

export function signOut() {
  trackEvent('userAccount.logout', { userAccount: { logout: 1 } });
  localStorage.removeItem(SESSION_KEY);
  forgetIdentity();
  window.dispatchEvent(new CustomEvent('kapoor:account', { detail: null }));
}

/* ---------- test orders ---------- */

export const ordersFor = (email) => read(ORDERS_KEY, []).filter((o) => o.email === email);

/** Places a test order (no payment) and sends the purchase event. */
export async function placeOrder({
  email, firstName, lastName, address, optIn,
}) {
  const cart = getCart();
  const lines = await cartLines(cart);
  if (!lines.length) throw new Error('Your cart is empty.');
  const {
    subtotal, promo, discount, total,
  } = cartTotals(lines, cart);
  const order = {
    id: randomId('KJ-ORD'),
    date: new Date().toISOString(),
    email: email.trim().toLowerCase(),
    name: `${firstName} ${lastName}`.trim(),
    address,
    items: lines.map((l) => ({
      sku: l.product.sku,
      name: l.product.name,
      qty: l.qty,
      price: l.product.price,
      image: l.product.image,
    })),
    subtotal,
    promo,
    discount,
    total,
  };
  write(ORDERS_KEY, [...read(ORDERS_KEY, []), order]);

  const customer = currentCustomer();
  identify({ email: order.email, customerId: customer?.customerId });
  trackEvent('commerce.purchases', {
    commerce: {
      purchases: { value: 1 },
      cart: { cartID: cart.id },
      order: {
        purchaseID: order.id,
        priceTotal: total,
        currencyCode: CURRENCY,
        payments: [{ paymentType: 'other', paymentAmount: total, currencyCode: CURRENCY }],
      },
    },
    productListItems: lines.map((l) => lineItem(l.product, l.qty)),
  });
  if (optIn) {
    sendProfile({
      email: order.email, firstName, lastName, customerId: customer?.customerId, optIn: true,
    });
    setMarketingConsent(true);
  }
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent('kapoor:cart', { detail: { items: [] } }));
  return order;
}
