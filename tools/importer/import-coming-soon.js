/* eslint-disable */
/* global WebImporter */

/**
 * Generates the Kapoor Jewellers "Coming soon" page (/coming-soon) used as the destination
 * for links to pages not yet built in the POC. The source document is ignored; the page is
 * authored here so it can be re-generated through the standard import pipeline.
 */
const BRAND = 'Kapoor Jewellers';

export default {
  transform: ({ document }) => {
    const main = document.createElement('main');

    const h1 = document.createElement('h1');
    h1.textContent = 'Coming soon';
    const intro = document.createElement('p');
    intro.textContent = `This page of the ${BRAND} site is being prepared. In the meantime, explore our latest collections on the homepage.`;

    // strong-wrapped link = primary button in EDS
    const ctaP = document.createElement('p');
    const strong = document.createElement('strong');
    const cta = document.createElement('a');
    cta.href = '/';
    cta.textContent = 'Back to homepage';
    strong.append(cta);
    ctaP.append(strong);

    const meta = WebImporter.Blocks.createBlock(document, {
      name: 'Metadata',
      cells: {
        Title: `Coming soon | ${BRAND}`,
        Description: `This ${BRAND} page is coming soon.`,
        Robots: 'noindex, nofollow',
      },
    });

    // metadata goes in its own trailing section so it is consumed as page metadata
    main.append(h1, intro, ctaP, document.createElement('hr'), meta);

    return [{
      element: main,
      path: '/coming-soon',
      report: { title: `Coming soon | ${BRAND}`, template: 'coming-soon' },
    }];
  },
};
