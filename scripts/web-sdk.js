/**
 * Loads the Experience Platform Web SDK (only after consent, from consented.js) and sends
 * the queued tracking events. Without a datastream ID it stays in dry-run mode.
 */
import config from './tracking-config.js';
import { attachSender } from './tracking.js';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

async function init() {
  if (!config.datastreamId) {
    // eslint-disable-next-line no-console
    console.info('[tracking] dry run: no datastream ID configured; events are logged only');
    return;
  }
  // standard Web SDK base code: queue calls until the library loads
  // eslint-disable-next-line no-underscore-dangle -- name required by the Web SDK base code
  window.__alloyNS = ['alloy'];
  window.alloy = function alloy(...args) {
    return new Promise((resolve, reject) => {
      window.alloy.q.push([resolve, reject, args]);
    });
  };
  window.alloy.q = [];
  await loadScript(config.sdkUrl);
  await window.alloy('configure', {
    datastreamId: config.datastreamId,
    orgId: config.orgId,
    defaultConsent: 'in',
    clickCollectionEnabled: false,
  });
  attachSender((item) => {
    if (item.type === 'event') {
      window.alloy('sendEvent', { xdm: item.payload }).catch(() => {});
    } else if (item.type === 'consent') {
      window.alloy('setConsent', {
        consent: [{ standard: 'Adobe', version: '2.0', value: { marketing: { email: { val: item.optIn ? 'y' : 'n' } } } }],
        ...(item.identityMap ? { identityMap: item.identityMap } : {}),
      }).catch(() => {});
    }
  });
}

init();
