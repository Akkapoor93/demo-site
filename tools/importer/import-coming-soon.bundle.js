/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-coming-soon.js
  var import_coming_soon_exports = {};
  __export(import_coming_soon_exports, {
    default: () => import_coming_soon_default
  });
  var BRAND = "Kapoor Jewellers";
  var import_coming_soon_default = {
    transform: ({ document }) => {
      const main = document.createElement("main");
      const h1 = document.createElement("h1");
      h1.textContent = "Coming soon";
      const intro = document.createElement("p");
      intro.textContent = `This page of the ${BRAND} site is being prepared. In the meantime, explore our latest collections on the homepage.`;
      const ctaP = document.createElement("p");
      const strong = document.createElement("strong");
      const cta = document.createElement("a");
      cta.href = "/";
      cta.textContent = "Back to homepage";
      strong.append(cta);
      ctaP.append(strong);
      const meta = WebImporter.Blocks.createBlock(document, {
        name: "Metadata",
        cells: {
          Title: `Coming soon | ${BRAND}`,
          Description: `This ${BRAND} page is coming soon.`,
          Robots: "noindex, nofollow"
        }
      });
      main.append(h1, intro, ctaP, document.createElement("hr"), meta);
      return [{
        element: main,
        path: "/coming-soon",
        report: { title: `Coming soon | ${BRAND}`, template: "coming-soon" }
      }];
    }
  };
  return __toCommonJS(import_coming_soon_exports);
})();
