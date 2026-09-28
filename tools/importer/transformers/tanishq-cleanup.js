/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Tanishq site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (https://www.tanishq.com/homepage).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Slick slider clones (div.slick-slide.slick-cloned) duplicate real slides - remove before parsing.
    WebImporter.DOMUtils.remove(element, ['.slick-cloned']);

    // Overlays / modals / consent (found: #onetrust-consent-sdk, div.video-modal#videoModal,
    // div.modal#appointment-form-modal, div#custom-modal.visual-search-modal, div.modal-background).
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#videoModal',
      '#appointment-form-modal',
      '#custom-modal',
      '.modal-background',
      '.cookie-alert',
      '.notification-top-bar',
    ]);

    // Runtime-only personalised Einstein recommender ("Pick up where you left off!").
    WebImporter.DOMUtils.remove(element, [
      '.experience-einstein-einsteinCarouselStaticGlobalRecomenderRevamp',
      '.dataContainer',
    ]);

    // Empty emptyContainer holding only div.evgHomePageCarousel.
    element.querySelectorAll('.evgHomePageCarousel').forEach((evg) => {
      const container = evg.closest('.experience-commerce_assets-emptyContainer');
      if (container && container.children.length === 1 && !container.textContent.trim()) {
        container.remove();
      } else {
        evg.remove();
      }
    });

    // Slider controls: arrows, dots, progress bars, swiper a11y/scrollbars, hero carousel controls.
    WebImporter.DOMUtils.remove(element, [
      '.slick-arrow',
      '.slick-dots',
      '.slide-arrow',
      '.slide-arrow-collection',
      '.spot-arrow',
      '.slider-progress',
      '.swiper-scrollbar',
      '.swiper-notification',
      '.carousel-control-prev',
      '.carousel-control-next',
      '.pd-carousel-indicators',
    ]);

    // Mobile-only duplicates of authored content: the category swiper repeats the desktop
    // grid, and the gifting pills repeat the card titles (the block JS rebuilds them as tabs).
    WebImporter.DOMUtils.remove(element, [
      '.pd-fod-category .mobile-categories',
      '.gifting .action-pills',
    ]);

    // Outlined CTA on the source: author it as an italic link so EDS renders a secondary button.
    element.querySelectorAll('.shop-our-collection-explore a.explore-link').forEach((a) => {
      if (a.closest('em')) return;
      const em = a.ownerDocument.createElement('em');
      a.replaceWith(em);
      em.append(a);
    });

    // Empty notification slots and hidden inputs.
    WebImporter.DOMUtils.remove(element, [
      '.home-notification-slot',
      'input#store-postal-code',
      'input.isMainBannerRevamp',
      'input#getWishlistURL',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global header, nav menus and footer - migrated separately.
    WebImporter.DOMUtils.remove(element, [
      'header.header',
      '#sg-navbar-collapse',
      '.header-section-m-spacing',
      'footer.footer-div',
      '.payment-info',
    ]);

    // Page-shell leftovers: hidden state divs, SEO-only heading, back-to-top, error messaging.
    WebImporter.DOMUtils.remove(element, [
      '.current-locale',
      '#homepage-pd',
      '.isauthenticated',
      '.homepage.d-none',
      '#homepage-revamp > h2.d-none',
      '.back-to-top',
      '.error-messaging',
    ]);

    // Tracking pixels and chat widget.
    WebImporter.DOMUtils.remove(element, [
      '[id^="batBeacon"]',
      '#criteo-tags-div',
      '#chat-widget-container',
    ]);

    // Trailing empty contentAsset (empty .contentasset-component-container).
    element.querySelectorAll('.experience-commerce_assets-contentAsset').forEach((asset) => {
      if (!asset.textContent.trim() && !asset.querySelector('img, video, picture, table')) {
        asset.remove();
      }
    });

    // Non-authorable elements.
    WebImporter.DOMUtils.remove(element, ['iframe', 'script', 'style', 'link', 'noscript', 'input']);
  }
}
