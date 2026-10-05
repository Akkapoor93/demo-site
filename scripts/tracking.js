/**
 * Kapoor Jewellers POC tracking (docs/tracking-spec.md).
 * Builds XDM events and queues them; scripts/web-sdk.js (loaded only after consent)
 * sends the queue through the Experience Platform Web SDK.
 * Every event is also kept in sessionStorage ('kapoor-tracking-log') for checking.
 */
import config from './tracking-config.js';

const LOG_KEY = 'kapoor-tracking-log';
const IDENTITY_KEY = 'kapoor-identity';
// email of the shopper this browser's Adobe visitor ID (ECID) has been linked to
const OWNER_KEY = 'kapoor-adobe-id-owner';
const queue = [];
let sender = null;

const ext = (fields) => ({ [config.tenant]: { kapoor: fields } });

function storedIdentity() {
  try {
    return JSON.parse(localStorage.getItem(IDENTITY_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function identityMap() {
  const { email, customerId } = storedIdentity();
  const map = {};
  if (email) map.Email = [{ id: email, authenticatedState: 'authenticated', primary: false }];
  if (customerId) map.kapoorCustomerId = [{ id: customerId, authenticatedState: 'authenticated', primary: false }];
  return Object.keys(map).length ? map : undefined;
}

/* ---------- on-page event viewer (?tracking-debug=1 turns it on, =0 off) ---------- */

const debugParam = new URLSearchParams(window.location.search).get('tracking-debug');
if (debugParam !== null) {
  if (['0', 'false', 'off'].includes(debugParam)) localStorage.removeItem('kapoor-tracking-debug');
  else localStorage.setItem('kapoor-tracking-debug', '1');
}
const debugOn = () => !!localStorage.getItem('kapoor-tracking-debug');

function describe(entry) {
  const x = entry.payload || {};
  const items = (x.productListItems || []).map((i) => `${i.SKU}×${i.quantity}`).join(', ');
  const order = x.commerce?.order ? ` · order ${x.commerce.order.purchaseID} $${x.commerce.order.priceTotal}` : '';
  const ids = x.identityMap ? ` · ids: ${Object.keys(x.identityMap).join('+')}` : '';
  if (entry.type === 'consent') return `consent · email offers ${entry.optIn ? 'yes' : 'no'}`;
  if (entry.type === 'profile') return `profile → ${x.personalEmail?.address} (offers ${x.consents?.marketing?.email?.val})`;
  return `${entry.eventType}${items ? ` · ${items}` : ''}${order}${ids}`;
}

function renderDebug() {
  if (!debugOn() || !document.body) return;
  let panel = document.querySelector('.tracking-debug');
  if (!panel) {
    panel = document.createElement('aside');
    panel.className = 'tracking-debug';
    panel.setAttribute('aria-label', 'Tracking events (debug)');
    panel.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:400;width:min(460px,calc(100vw - 24px));max-height:40vh;overflow:auto;padding:10px 12px;border-radius:6px;background:rgb(20 20 20 / 92%);color:#e8e8e8;font:12px/1.5 monospace;box-shadow:0 6px 24px rgb(0 0 0 / 30%);pointer-events:none';
    document.body.append(panel);
  }
  const list = JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]');
  const sent = window.alloy ? 'sending to Adobe' : 'NOT sent: accept the cookie banner';
  panel.innerHTML = `<strong style="color:#f3dfb3">Tracking events — ${sent}</strong><br>`;
  list.slice(-15).reverse().forEach((e) => {
    const row = document.createElement('div');
    row.textContent = `• ${describe(e)}`;
    panel.append(row);
  });
}

function log(entry) {
  try {
    const list = JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]');
    list.push(entry);
    sessionStorage.setItem(LOG_KEY, JSON.stringify(list.slice(-50)));
  } catch (e) { /* storage unavailable */ }
  if (debugOn()) {
    // eslint-disable-next-line no-console
    console.info('[tracking]', entry.type, entry.payload);
    renderDebug();
  }
}

window.addEventListener('load', renderDebug);

const inFlight = new Set();

function send(item) {
  // a consent change waits for events already on their way; sent at the same moment,
  // the Web SDK can hold those events back indefinitely
  const ready = item.type === 'consent' ? Promise.allSettled([...inFlight]) : Promise.resolve();
  const done = ready.then(() => sender(item));
  inFlight.add(done);
  done.finally(() => inFlight.delete(done));
  return done;
}

/**
 * Resolves once the item has been sent. Items queued before the Web SDK is ready resolve when
 * it sends them (never, if the visitor has not accepted cookies — callers should not wait long).
 */
function dispatch(item) {
  log(item);
  if (sender) return send(item);
  return new Promise((resolve) => { queue.push({ item, resolve }); });
}

/** Page type for the current page: `page-type` metadata, else derived from the path. */
export function pageType() {
  const meta = document.querySelector('meta[name="page-type"]');
  if (meta) return meta.content;
  const path = window.location.pathname.replace(/^\/content/, '') || '/';
  if (path === '/' || path === '/index') return 'home';
  if (path.startsWith('/coming-soon')) return 'coming-soon';
  if (path.startsWith('/jewelry/')) return 'category';
  if (path.startsWith('/product')) return 'product';
  if (path.startsWith('/cart')) return 'cart';
  if (path.startsWith('/checkout')) return 'checkout';
  if (path.startsWith('/account')) return 'account';
  return 'other';
}

/** Category for listing pages: `category` metadata, else the /jewelry/<category> path. */
export function pageCategory() {
  const meta = document.querySelector('meta[name="category"]');
  if (meta) return meta.content;
  const match = window.location.pathname.match(/\/jewelry\/([^/?#]+)/);
  return match ? match[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : undefined;
}

/**
 * Sends an XDM experience event.
 * @param {string} eventType XDM eventType, e.g. 'commerce.productViews'
 * @param {object} xdm Event-specific XDM fields
 * @param {object} [kapoor] Fields for the POC-Kapoor Site Context field group
 */
export function trackEvent(eventType, xdm = {}, kapoor = {}) {
  const payload = {
    eventType,
    web: { webPageDetails: { name: document.title, URL: window.location.href } },
    ...xdm,
    ...ext({ pageType: pageType(), ...kapoor }),
  };
  const ids = identityMap();
  if (ids) payload.identityMap = ids;
  return dispatch({ type: 'event', eventType, payload });
}

export function trackPageView(kapoor = {}) {
  trackEvent('web.webpagedetails.pageViews', {
    web: {
      webPageDetails: { name: document.title, URL: window.location.href, pageViews: { value: 1 } },
      webReferrer: { URL: document.referrer || '' },
    },
  }, kapoor);
}

/** Remembers the shopper's identities so later events carry them (spec section 3). */
export function identify({ email, customerId }) {
  const current = storedIdentity();
  localStorage.setItem(IDENTITY_KEY, JSON.stringify({ ...current, email, customerId }));
  if (email) localStorage.setItem(OWNER_KEY, email.trim().toLowerCase());
}

export function forgetIdentity() {
  localStorage.removeItem(IDENTITY_KEY);
}

/**
 * True when this browser's Adobe visitor ID is already linked to a different shopper.
 * Sending a second shopper's email with the same ID would merge both into one profile.
 */
export function linkedToSomeoneElse(email) {
  const owner = localStorage.getItem(OWNER_KEY) || storedIdentity().email;
  return !!owner && owner !== String(email || '').trim().toLowerCase();
}

/** Drops the Adobe visitor ID cookies so the next page load starts as a new visitor. */
export function resetVisitorId() {
  const names = [
    `kndctr_${config.orgId.replace('@', '_')}_identity`,
    `AMCV_${encodeURIComponent(config.orgId)}`, // legacy ECID copy the Web SDK can read back
  ];
  const parts = window.location.hostname.split('.');
  names.forEach((name) => {
    const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = expired;
    // cookies may be set on the widest domain the browser accepts, so clear every level
    parts.forEach((_, i) => {
      document.cookie = `${expired}; domain=.${parts.slice(i).join('.')}`;
    });
  });
  localStorage.removeItem(OWNER_KEY);
}

/** Records the "Email me offers" choice on the profile (Web SDK setConsent, Adobe 2.0). */
export function setMarketingConsent(optIn) {
  return dispatch({ type: 'consent', optIn, identityMap: identityMap() });
}

/**
 * Posts a profile record (name, email, consent) to the HTTP API streaming source
 * into "POC-Kapoor Profile" (spec section 5). No-op until the inlet is configured.
 */
export async function sendProfile({
  email, firstName, lastName, customerId, optIn,
}) {
  const { url, datasetId, schemaId } = config.profileStreaming;
  const entity = {
    // unique record ID; the profile itself is keyed on the email identity
    _id: `${customerId || 'KJ-GUEST'}-${Date.now()}`,
    personalEmail: { address: email },
    person: { name: { firstName, lastName } },
    consents: { marketing: { email: { val: optIn ? 'y' : 'n' } } },
    ...(customerId ? ext({ customerId }) : {}),
  };
  log({ type: 'profile', payload: entity });
  if (!url || !datasetId || !schemaId) return;
  // same rule as the Web SDK: nothing goes to Adobe until the cookie banner is accepted
  if (localStorage.getItem('kapoor-consent') !== 'accept'
    && new URLSearchParams(window.location.search).get('consent') !== 'accept') return;
  const body = {
    header: {
      schemaRef: { id: schemaId, contentType: 'application/vnd.adobe.xed-full+json;version=1' },
      imsOrgId: config.orgId,
      datasetId,
      source: { name: 'POC-Kapoor' },
    },
    body: {
      xdmMeta: { schemaRef: { id: schemaId, contentType: 'application/vnd.adobe.xed-full+json;version=1' } },
      xdmEntity: entity,
    },
  };
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch (e) { /* tracking must never break the page */ }
}

/** Called by web-sdk.js once the Web SDK is ready: sends everything queued so far. */
export function attachSender(webSdkSend) {
  sender = webSdkSend;
  queue.splice(0).forEach(({ item, resolve }) => send(item).then(resolve));
}

// link and menu clicks in the header, footer and calls to action (event 2)
document.addEventListener('click', (e) => {
  const a = e.target.closest('header a[href], footer a[href], main a.button[href], main .nav-panel a[href]');
  if (!a) return;
  const url = new URL(a.href, window.location.href);
  const label = a.getAttribute('aria-label') || a.textContent.trim() || a.querySelector('img')?.alt || url.pathname;
  trackEvent('web.webinteraction.linkClicks', {
    web: {
      webInteraction: {
        name: label.slice(0, 100), URL: url.href, type: url.origin === window.location.origin ? 'other' : 'exit', linkClicks: { value: 1 },
      },
    },
  });
}, { capture: true });

window.kapoorTracking = {
  trackEvent, trackPageView, identify, setMarketingConsent, sendProfile, config,
};
