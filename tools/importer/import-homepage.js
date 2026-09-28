/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsProductParser from './parsers/cards-product.js';
import columnsSpotlightParser from './parsers/columns-spotlight.js';
import cardsVideoParser from './parsers/cards-video.js';
import cardsOccasionParser from './parsers/cards-occasion.js';
import cardsCollectionParser from './parsers/cards-collection.js';
import columnsAudienceParser from './parsers/columns-audience.js';
import columnsShowcaseParser from './parsers/columns-showcase.js';
import cardsGiftingParser from './parsers/cards-gifting.js';
import cardsStoreParser from './parsers/cards-store.js';

// TRANSFORMER IMPORTS
import tanishqCleanupTransformer from './transformers/tanishq-cleanup.js';
import tanishqSectionsTransformer from './transformers/tanishq-sections.js';
import kapoorRebrandTransformer from './transformers/kapoor-rebrand.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-category': cardsCategoryParser,
  'cards-product': cardsProductParser,
  'columns-spotlight': columnsSpotlightParser,
  'cards-video': cardsVideoParser,
  'cards-occasion': cardsOccasionParser,
  'cards-collection': cardsCollectionParser,
  'columns-audience': columnsAudienceParser,
  'columns-showcase': columnsShowcaseParser,
  'cards-gifting': cardsGiftingParser,
  'cards-store': cardsStoreParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "homepage",
  "description": "Tanishq homepage: hero carousel, category grid, product rails, spotlight, testimonials, occasions, collections, audience tiles, kids showcase, gifting and boutiques",
  "urls": [
    "https://www.tanishq.com/homepage"
  ],
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        ".experience-commerce_layouts-carouselRevamp .carousel.main-banner"
      ]
    },
    {
      "name": "cards-category",
      "instances": [
        ".pd-fod-category .desktop-categories .category-grid"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        ".experience-commerce_layouts-categoryStaticCarousel .product-carousel-track",
        ".new-arrivals-section .new-arrivals-carousel",
        ".shop-our-collections .product-slides-container"
      ]
    },
    {
      "name": "columns-spotlight",
      "instances": [
        ".spotlight-carousel .spotlight-wrapper"
      ]
    },
    {
      "name": "cards-video",
      "instances": [
        ".Testimonials .video-slider-wrapper"
      ]
    },
    {
      "name": "cards-occasion",
      "instances": [
        ".shop-our-occasions .occasion-track"
      ]
    },
    {
      "name": "cards-collection",
      "instances": [
        ".shop-our-collections .category-tile-lists"
      ]
    },
    {
      "name": "columns-audience",
      "instances": [
        ".jew-for-everyone .jewelry-section"
      ]
    },
    {
      "name": "columns-showcase",
      "instances": [
        ".party-edit .party-edit-content"
      ]
    },
    {
      "name": "cards-gifting",
      "instances": [
        ".gifting .gift-card-slides"
      ]
    },
    {
      "name": "cards-store",
      "instances": [
        ".home-stores .stores-cards-all"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "Hero banner carousel",
      "selector": [
        ".experience-commerce_layouts-carouselRevamp"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "Explore Our Categories",
      "selector": [
        ".experience-commerce_assets-contentAsset:has(.pd-fod-category)",
        ".pd-fod-category"
      ],
      "style": null,
      "blocks": [
        "cards-category"
      ],
      "defaultContent": [
        ".pd-fod-category .desktop-categories .title-header"
      ]
    },
    {
      "id": "3",
      "name": "Trending Products",
      "selector": [
        ".experience-newTitleWithImage"
      ],
      "style": null,
      "blocks": [
        "cards-product"
      ],
      "defaultContent": [
        ".experience-newTitleWithImage .title-header"
      ]
    },
    {
      "id": "4",
      "name": "Effortless Essentials spotlight",
      "selector": [
        ".experience-commerce_layouts-spotLightCarousel"
      ],
      "style": null,
      "blocks": [
        "columns-spotlight"
      ],
      "defaultContent": []
    },
    {
      "id": "5",
      "name": "Fresh From the Design Studio",
      "selector": [
        ".experience-commerce_layouts-contentWithCarousel"
      ],
      "style": "dark",
      "blocks": [
        "cards-product"
      ],
      "defaultContent": [
        ".new-arrivals-section .new-arrivals-content"
      ]
    },
    {
      "id": "6",
      "name": "From Our Patrons",
      "selector": [
        ".experience-commerce_assets-emptyContainer:has(.Testimonials)",
        ".Testimonials"
      ],
      "style": null,
      "blocks": [
        "cards-video"
      ],
      "defaultContent": [
        ".Testimonials .video-title"
      ]
    },
    {
      "id": "7",
      "name": "Shop For Occasions",
      "selector": [
        ".experience-commerce_layouts-shopOurOccasions"
      ],
      "style": "blush",
      "blocks": [
        "cards-occasion"
      ],
      "defaultContent": [
        ".shop-our-occasions .title-section"
      ]
    },
    {
      "id": "8",
      "name": "The World of Tanishq",
      "selector": [
        ".experience-commerce_layouts-shopOurCollections"
      ],
      "style": "cream",
      "blocks": [
        "cards-collection",
        "cards-product"
      ],
      "defaultContent": [
        ".shop-our-collections > .title-section",
        ".shop-our-collections .shop-our-collection-explore"
      ]
    },
    {
      "id": "9",
      "name": "Jewelry for Everyone",
      "selector": [
        ".experience-commerce_assets-contentAsset:has(.jew-for-everyone)",
        ".jew-for-everyone"
      ],
      "style": null,
      "blocks": [
        "columns-audience"
      ],
      "defaultContent": []
    },
    {
      "id": "10",
      "name": "For The Little Ones",
      "selector": [
        ".experience-commerce_layouts-partyEdit"
      ],
      "style": "cream",
      "blocks": [
        "columns-showcase"
      ],
      "defaultContent": [
        ".party-edit .party-title"
      ]
    },
    {
      "id": "11",
      "name": "The Gifting Edit",
      "selector": [
        ".experience-commerce_layouts-gifting"
      ],
      "style": "cream",
      "blocks": [
        "cards-gifting"
      ],
      "defaultContent": [
        ".gifting .title-section"
      ]
    },
    {
      "id": "12",
      "name": "Our Boutiques",
      "selector": [
        ".experience-commerce_assets-storeLocator"
      ],
      "style": "cream",
      "blocks": [
        "cards-store"
      ],
      "defaultContent": [
        ".home-stores .title-section",
        ".home-stores .stores-explore-all"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  tanishqCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [tanishqSectionsTransformer] : []),
  // Kapoor Jewellers rebrand runs last (afterTransform only), on the parsed block tables
  kapoorRebrandTransformer,
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section break markers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    // the migrated homepage is the site root page
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' || rawPath === '/homepage' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
