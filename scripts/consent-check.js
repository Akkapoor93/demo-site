let consentedLoaded = false;
const CONSENT_KEY = 'kapoor-consent';

/**
 * Simple consent banner for the POC (stands in for a real CMP such as OneTrust).
 * Consented scripts (Web SDK / analytics) load only after "Accept".
 *
 * The stored choice can be overridden with a query parameter for testing:
 *   ?consent=accept   grant consent
 *   ?consent=decline  decline consent
 *
 * @returns {boolean|null} true/false once the visitor has chosen, null if not yet
 */
function consentChoice() {
  const param = new URLSearchParams(window.location.search).get('consent');
  if (param !== null) return ['accept', 'true', '1', 'yes'].includes(param.toLowerCase());
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === 'accept') return true;
  if (stored === 'decline') return false;
  return null;
}

/**
 * Loads consented scripts once consent is available.
 */
function loadConsented() {
  if (consentedLoaded) return;
  consentedLoaded = true;
  import('./consented.js');
}

/**
 * Notifies listeners of the current consent state and loads consented
 * scripts if consent has been granted.
 */
function onConsentUpdate() {
  const consented = consentChoice() === true;
  window.dispatchEvent(new CustomEvent('consent.update', { detail: { consented } }));
  if (consented) {
    loadConsented();
  }
}

function showBanner() {
  const banner = document.createElement('div');
  banner.className = 'consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <p>We use cookies and Adobe Experience Cloud to measure visits and personalise offers. (POC demo)</p>
    <div class="consent-banner-actions">
      <button type="button" class="button secondary" data-choice="decline">Decline</button>
      <button type="button" class="button primary" data-choice="accept">Accept</button>
    </div>`;
  banner.addEventListener('click', (e) => {
    const choice = e.target.closest('button')?.dataset.choice;
    if (!choice) return;
    localStorage.setItem(CONSENT_KEY, choice);
    banner.remove();
    onConsentUpdate();
  });
  document.body.append(banner);
}

if (consentChoice() === null) showBanner();
onConsentUpdate();
