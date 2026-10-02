/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
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

  // tools/importer/shop-pages/import-account.js
  var import_account_exports = {};
  __export(import_account_exports, {
    default: () => import_account_default
  });

  // tools/importer/import-shop-pages.js
  var BRAND = "Kapoor Jewellers";
  var PAGES = [
    {
      path: "/jewelry/earrings",
      title: "Earrings",
      intro: "Diamond studs, drop earrings and jhumkas, crafted in 14KT, 18KT and 22KT gold.",
      block: "Product List",
      config: { Category: "Earrings" },
      meta: { "Page Type": "category", Category: "Earrings" }
    },
    {
      path: "/jewelry/rings",
      title: "Rings",
      intro: "Engagement rings, everyday bands and statement cocktail rings.",
      block: "Product List",
      config: { Category: "Rings" },
      meta: { "Page Type": "category", Category: "Rings" }
    },
    {
      path: "/product",
      title: "Product",
      block: "Product Details",
      meta: { "Page Type": "product" },
      noHeading: true
    },
    {
      path: "/cart",
      title: "Your cart",
      block: "Cart",
      meta: { "Page Type": "cart" }
    },
    {
      path: "/checkout",
      title: "Checkout",
      block: "Checkout",
      meta: { "Page Type": "checkout" }
    },
    {
      path: "/account",
      title: "My account",
      block: "Account",
      meta: { "Page Type": "account" }
    }
  ];
  function buildPage(document, page) {
    const main = document.createElement("main");
    if (!page.noHeading) {
      const h1 = document.createElement("h1");
      h1.textContent = page.title;
      main.append(h1);
    }
    if (page.intro) {
      const p = document.createElement("p");
      p.textContent = page.intro;
      main.append(p);
    }
    const cells = page.config ? Object.entries(page.config).map(([k, v]) => [k, v]) : [[""]];
    main.append(WebImporter.Blocks.createBlock(document, { name: page.block, cells }));
    main.append(document.createElement("hr"));
    main.append(WebImporter.Blocks.createBlock(document, {
      name: "Metadata",
      cells: __spreadValues({
        Title: `${page.title} | ${BRAND}`,
        Description: page.intro || `${page.title} \u2014 ${BRAND} (POC shop).`
      }, page.meta)
    }));
    return main;
  }
  function shopPageImport(path) {
    const page = PAGES.find((p) => p.path === path);
    return {
      transform: ({ document }) => [{
        element: buildPage(document, page),
        path: page.path,
        report: { title: `${page.title} | ${BRAND}`, template: "shop" }
      }]
    };
  }

  // tools/importer/shop-pages/import-account.js
  var import_account_default = shopPageImport("/account");
  return __toCommonJS(import_account_exports);
})();
