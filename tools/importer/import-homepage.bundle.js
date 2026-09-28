/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".carousel-item")];
    if (!slides.length) slides = [...element.querySelectorAll("figure.image-component, figure")];
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((slide) => {
      if (slide.classList.contains("slick-cloned")) return;
      const imgs = [...slide.querySelectorAll("img")];
      if (!imgs.length) return;
      const desktop = slide.querySelector("img.d-lg-block") || slide.querySelector("img:not(.d-lg-none)") || imgs[0];
      const mobile = slide.querySelector("img.d-lg-none") || imgs.find((img) => img !== desktop && img.getAttribute("src") !== desktop.getAttribute("src"));
      const anchor = slide.querySelector("a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      const key = `${desktop.getAttribute("src")}|${href}`;
      if (seen.has(key)) return;
      seen.add(key);
      const alt = (desktop.getAttribute("alt") || desktop.getAttribute("title") || "").trim();
      const imageCell = [];
      const d = document2.createElement("img");
      d.src = desktop.getAttribute("src");
      d.alt = alt;
      imageCell.push(d);
      if (mobile && mobile !== desktop) {
        const m = document2.createElement("img");
        m.src = mobile.getAttribute("src");
        m.alt = (mobile.getAttribute("alt") || alt).trim();
        imageCell.push(m);
      }
      let linkCell = "";
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = alt || href;
        linkCell = a;
      }
      cells.push([imageCell, linkCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".img-wrap")].map((wrap) => {
      var _a, _b;
      const card = wrap.closest(".category-card") || wrap.parentElement;
      return {
        wrap,
        card,
        heading: card && card.querySelector("h3, h2, h4") || null,
        href: ((_b = (_a = wrap.closest("a[href]") || card && card.querySelector("a[href]") || {}).getAttribute) == null ? void 0 : _b.call(_a, "href")) || ""
      };
    });
    if (!items.length) {
      items = [...element.querySelectorAll(".category-card")].map((card) => ({
        wrap: card,
        card,
        heading: card.querySelector("h3, h2, h4"),
        href: card.getAttribute("href") || ""
      }));
    }
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach(({ wrap, card, heading, href }) => {
      if (card && card.closest(".slick-cloned")) return;
      const label = heading ? heading.textContent.trim() : "";
      const img = wrap.querySelector("img");
      const isViewAll = card && card.classList.contains("view-all-card") || !img;
      const key = `${href}|${label}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (isViewAll) {
        const body = [];
        const promo = wrap.querySelector("span, p");
        const promoText = promo && promo.textContent.trim() || (card && card.getAttribute("data-cta") ? card.getAttribute("data-cta").trim() : "");
        if (promoText) {
          const p = document2.createElement("p");
          p.textContent = promoText;
          body.push(p);
        }
        if (href || label) {
          const a = document2.createElement("a");
          a.href = href || "#";
          a.textContent = label || "View All";
          const p = document2.createElement("p");
          p.append(a);
          body.push(p);
        }
        if (body.length) cells.push(["", body]);
        return;
      }
      const image = document2.createElement("img");
      image.src = img.getAttribute("src");
      image.alt = (img.getAttribute("alt") || "").trim() || label;
      const h3 = document2.createElement("h3");
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = label;
        h3.append(a);
      } else {
        h3.textContent = label;
      }
      cells.push([image, h3]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse3(element, { document: document2 }) {
    let tiles = [...element.querySelectorAll(".experience-commerce_assets-productTileRevamp")];
    if (!tiles.length) tiles = [...element.querySelectorAll(".product-tile-revamp, .product-tile")];
    const isProductHref = (href) => href && !/^javascript:/i.test(href) && href !== "#";
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    tiles.forEach((tile) => {
      if (tile.classList.contains("slick-cloned") || tile.closest(".slick-cloned")) return;
      const img = tile.querySelector("img.tile-image") || tile.querySelector(".product-image-block img, .image-container img, img");
      const anchor = [...tile.querySelectorAll("a[href]")].find((a) => isProductHref(a.getAttribute("href")));
      const href = anchor ? anchor.getAttribute("href") : "";
      const nameEl = tile.querySelector(".pdp-link h3, h3.link, .product-name h3, .pdp-link a") || tile.querySelector("span[title]");
      let name = nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (!name && img) name = (img.getAttribute("alt") || img.getAttribute("title") || "").replace(/,\s*$/, "").trim();
      if (!name && !img) return;
      const key = href || name;
      if (seen.has(key)) return;
      seen.add(key);
      const imageCell = [];
      if (img && img.getAttribute("src")) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        i.alt = (img.getAttribute("alt") || name).trim();
        imageCell.push(i);
      }
      const body = [];
      const h3 = document2.createElement("h3");
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = name;
        h3.append(a);
      } else {
        h3.textContent = name;
      }
      body.push(h3);
      const clean = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
      const saleEl = tile.querySelector(".sales .price-text .tile-show") || tile.querySelector(".sales .price-text") || tile.querySelector(".price-text");
      const listEl = tile.querySelector(".strike-through .tile-show") || tile.querySelector(".strike-through");
      const listPrice = clean(listEl).replace(/Price reduced from|to$/gi, "").trim();
      let price = clean(saleEl);
      if (!price) price = clean(tile.querySelector(".price")).replace(/Price reduced from.*$/i, "").trim();
      if (price) {
        const p = document2.createElement("p");
        p.append(document2.createTextNode(price));
        if (listPrice && listPrice !== price) {
          p.append(document2.createTextNode(" "));
          const del = document2.createElement("del");
          del.textContent = listPrice;
          p.append(del);
        }
        body.push(p);
      }
      cells.push([imageCell.length ? imageCell : "", body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-spotlight.js
  function parse4(element, { document: document2 }) {
    const para = (child) => {
      const p = document2.createElement("p");
      p.append(child);
      return p;
    };
    const link = (href, text) => {
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = text;
      return a;
    };
    const banner = element.querySelector(".spotlight-main-banner") || element.firstElementChild;
    const mediaCell = [];
    if (banner) {
      const source = banner.querySelector("video source[src], video[src]");
      const videoSrc = source ? source.getAttribute("src") : "";
      if (videoSrc) mediaCell.push(para(link(videoSrc, videoSrc)));
      const poster = !videoSrc ? banner.querySelector("img") : null;
      if (poster) {
        const img = document2.createElement("img");
        img.src = poster.getAttribute("src");
        img.alt = poster.getAttribute("alt") || "";
        mediaCell.push(img);
      }
      const h2 = banner.querySelector("h2, .main-card-heading");
      if (h2) {
        const h = document2.createElement("h2");
        h.textContent = h2.textContent.trim();
        mediaCell.push(h);
      }
      const cta = banner.querySelector(".main-card-text a[href]") || [...banner.querySelectorAll("a[href]")].find((a) => !a.querySelector("video") && a.textContent.trim() && !/browser does not support/i.test(a.textContent));
      const ctaHref = cta ? cta.getAttribute("href") : (banner.querySelector("a.main-card-link[href]") || { getAttribute: () => "" }).getAttribute("href");
      if (ctaHref) mediaCell.push(para(link(ctaHref, cta && cta.textContent.trim() || "Explore")));
    }
    const content = element.querySelector(".spotlight-content-wrapper") || element.lastElementChild;
    const contentCell = [];
    if (content) {
      const title = content.querySelector(".spotlight-title, .spotlight-heading-section h3, h3");
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title.textContent.trim();
        contentCell.push(h3);
      }
      const subtitle = content.querySelector(".spotlight-subtitle, .spotlight-heading-section p");
      if (subtitle && subtitle.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = subtitle.textContent.trim();
        contentCell.push(p);
      }
      const explore = content.querySelector(".spotlight-explore-link, .spotlight-heading-section a[href]") || content.querySelector(".spotlight-explore-link-mobile");
      if (explore) contentCell.push(para(link(explore.getAttribute("href"), explore.textContent.trim() || "Explore")));
      const seen = /* @__PURE__ */ new Set();
      let tiles = [...content.querySelectorAll(".experience-commerce_assets-productTileRevamp")];
      if (!tiles.length) tiles = [...content.querySelectorAll(".product-tile-revamp")];
      tiles.forEach((tile) => {
        if (tile.classList.contains("slick-cloned") || tile.closest(".slick-cloned")) return;
        const img = tile.querySelector("img.tile-image, img");
        const a = [...tile.querySelectorAll("a[href]")].find((x) => !/^javascript:/i.test(x.getAttribute("href")));
        const href = a ? a.getAttribute("href") : "";
        const nameEl = tile.querySelector("span[title], .pdp-link h3, h3");
        const name = (nameEl ? nameEl.textContent.trim() : "") || (img ? (img.getAttribute("alt") || "").trim() : "");
        const key = href || name;
        if (!key || seen.has(key)) return;
        seen.add(key);
        if (img && img.getAttribute("src")) {
          const i = document2.createElement("img");
          i.src = img.getAttribute("src");
          i.alt = (img.getAttribute("alt") || name).trim();
          contentCell.push(para(i));
        }
        if (name) contentCell.push(para(href ? link(href, name) : document2.createTextNode(name)));
      });
    }
    if (!mediaCell.length && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[mediaCell.length ? mediaCell : "", contentCell.length ? contentCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-spotlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-video.js
  function parse5(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".video-card")];
    if (!cards.length) cards = [...element.querySelectorAll(".swiper-slide, video")];
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      if (card.closest(".slick-cloned, .swiper-slide-duplicate")) return;
      const video = card.tagName === "VIDEO" ? card : card.querySelector("video");
      const source = video && (video.querySelector("source[src]") || (video.getAttribute("src") ? video : null));
      const src = source ? source.getAttribute("src") : (card.querySelector('a[href$=".mp4"], a[href*=".mp4?"]') || { getAttribute: () => "" }).getAttribute("href");
      if (!src || seen.has(src)) return;
      seen.add(src);
      let posterCell = "";
      const posterSrc = video && video.getAttribute("poster") || "";
      const posterImg = card.querySelector("img:not(.arrow-img)");
      if (posterSrc || posterImg) {
        const img = document2.createElement("img");
        img.src = posterSrc || posterImg.getAttribute("src");
        img.alt = posterImg ? posterImg.getAttribute("alt") || "" : "";
        posterCell = img;
      }
      const a = document2.createElement("a");
      a.href = src;
      a.textContent = src;
      cells.push([posterCell, a]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-occasion.js
  function parse6(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".experience-commerce_assets-imageCTAandButton")];
    if (!items.length) items = [...element.querySelectorAll(".occasions-container, .occasion-grid")];
    const clean = (href) => (href || "").trim();
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      if (item.classList.contains("slick-cloned") || item.closest(".slick-cloned")) return;
      const img = item.querySelector("img.occasion-image") || item.querySelector("img");
      const titleEl = item.querySelector(".occasion-title, h3, h2");
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const explore = item.querySelector("a.explore-link") || item.querySelector("a.image-link[href]");
      const exploreHref = explore ? clean(explore.getAttribute("href")) : "";
      const key = `${title}|${exploreHref}`;
      if (!title && !img || seen.has(key)) return;
      seen.add(key);
      let imageCell = "";
      if (img && img.getAttribute("src")) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        i.alt = (img.getAttribute("alt") || title).trim();
        imageCell = i;
      }
      const body = [];
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      const chips = [...item.querySelectorAll("a.badge-button[href]")].filter((a) => a.textContent.trim());
      if (chips.length) {
        const p = document2.createElement("p");
        chips.forEach((chip, idx) => {
          if (idx) p.append(document2.createTextNode(" | "));
          const a = document2.createElement("a");
          a.href = clean(chip.getAttribute("href"));
          a.textContent = chip.textContent.trim();
          p.append(a);
        });
        body.push(p);
      }
      if (exploreHref) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = exploreHref;
        a.textContent = explore.classList.contains("explore-link") && explore.textContent.trim() || "Explore";
        p.append(a);
        body.push(p);
      }
      cells.push([imageCell, body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-occasion", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-collection.js
  function parse7(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".category-tile-item")];
    if (!items.length) items = [...element.querySelectorAll(".main-card, .experience-commerce_assets-categoryCarousel")];
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      if (item.classList.contains("slick-cloned") || item.closest(".slick-cloned")) return;
      const img = item.querySelector("img.main-img, .collection-cards img") || item.querySelector("img");
      const titleEl = item.querySelector(".tile-title, h3, h2");
      const descEl = item.querySelector(".tile-description, .tile-content p");
      const title = (titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "") || (img ? (img.getAttribute("alt") || "").replace(/\s*Collection$/i, "").trim() : "");
      const anchor = [...item.querySelectorAll("a[href]")].find((a) => !/^javascript:|^#$/i.test(a.getAttribute("href").trim()));
      const key = title || img && img.getAttribute("src");
      if (!key || seen.has(key)) return;
      seen.add(key);
      let imageCell = "";
      if (img && img.getAttribute("src")) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        i.alt = (img.getAttribute("alt") || title).trim();
        imageCell = i;
      }
      const body = [];
      if (title) {
        const h3 = document2.createElement("h3");
        if (anchor) {
          const a = document2.createElement("a");
          a.href = anchor.getAttribute("href").trim();
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        body.push(h3);
      }
      const desc = descEl ? descEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc;
        body.push(p);
      }
      cells.push([imageCell, body.length ? body : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-collection", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-audience.js
  function parse8(element, { document: document2 }) {
    const row = [];
    const textWrap = element.querySelector(".jewelry-text") || element;
    const heading = textWrap.querySelector("h2, h1, h3");
    const intro = [];
    if (heading) {
      const h2 = document2.createElement("h2");
      h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      intro.push(h2);
    }
    [...textWrap.querySelectorAll("p")].forEach((p) => {
      if (p.closest(".jewelry-image-box, .overlay")) return;
      const text = p.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      const np = document2.createElement("p");
      np.textContent = text;
      intro.push(np);
    });
    if (intro.length) row.push(intro);
    let tiles = [...element.querySelectorAll(".jewelry-image-box")];
    if (!tiles.length) tiles = [...element.querySelectorAll(".jewelry-images > div")];
    const seen = /* @__PURE__ */ new Set();
    tiles.forEach((tile) => {
      const img = tile.querySelector("img");
      const labelEl = tile.querySelector(".label");
      const label = labelEl ? labelEl.textContent.trim() : "";
      const a = tile.querySelector("a[href]");
      const key = a && a.getAttribute("href") || label;
      if (!key || seen.has(key)) return;
      seen.add(key);
      const cell = [];
      if (img && img.getAttribute("src")) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        i.alt = (img.getAttribute("alt") || label).trim();
        cell.push(i);
      }
      if (label) {
        const p = document2.createElement("p");
        p.textContent = label;
        cell.push(p);
      }
      if (a) {
        const p = document2.createElement("p");
        const link = document2.createElement("a");
        link.href = a.getAttribute("href").trim();
        link.textContent = a.textContent.trim() || "Explore";
        p.append(link);
        cell.push(p);
      }
      if (cell.length) row.push(cell);
    });
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-audience", cells: [row] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-showcase.js
  function parse9(element, { document: document2 }) {
    const para = (child) => {
      const p = document2.createElement("p");
      p.append(child);
      return p;
    };
    const makeLink = (href, text) => {
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = text;
      return a;
    };
    const validAlt = (alt) => alt && !/\$\{/.test(alt) ? alt.trim() : "";
    const banner = element.querySelector(".party-edit-main-banner") || element.firstElementChild;
    const posterCell = [];
    if (banner) {
      const cta = banner.querySelector(".party-main-card-text a[href]") || [...banner.querySelectorAll("a[href]")].find((a) => a.textContent.trim());
      const ctaText = cta ? cta.textContent.replace(/\s+/g, " ").trim() : "";
      const img = banner.querySelector("img");
      if (img && img.getAttribute("src")) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        i.alt = validAlt(img.getAttribute("alt")) || validAlt(img.getAttribute("title")) || ctaText.replace(/^Explore\s+(The\s+)?/i, "");
        posterCell.push(para(i));
      }
      const href = cta ? cta.getAttribute("href") : (banner.querySelector("a[href]") || { getAttribute: () => "" }).getAttribute("href");
      if (href) posterCell.push(para(makeLink(href.trim(), ctaText || "Explore")));
    }
    const content = element.querySelector(".party-content-wrapper") || element;
    const productCell = [];
    let tiles = [...content.querySelectorAll(".experience-commerce_assets-productTileRevamp")];
    if (!tiles.length) tiles = [...content.querySelectorAll(".product-tile-revamp")];
    const seen = /* @__PURE__ */ new Set();
    tiles.forEach((tile) => {
      if (tile.classList.contains("slick-cloned") || tile.closest(".slick-cloned")) return;
      const img = tile.querySelector("img.tile-image, img");
      const a = [...tile.querySelectorAll("a[href]")].find((x) => !/^javascript:/i.test(x.getAttribute("href")));
      const href = a ? a.getAttribute("href").trim() : "";
      const nameEl = tile.querySelector("span[title], .pdp-link h3, h3");
      const name = (nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "") || (img ? validAlt(img.getAttribute("alt")) : "");
      const key = href || name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      if (img && img.getAttribute("src")) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        i.alt = validAlt(img.getAttribute("alt")) || name;
        productCell.push(para(i));
      }
      if (name) productCell.push(para(href ? makeLink(href, name) : document2.createTextNode(name)));
    });
    if (!posterCell.length && !productCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[posterCell.length ? posterCell : "", productCell.length ? productCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-showcase", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-gifting.js
  function parse10(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".experience-commerce_assets-imageCTAandButton")];
    if (!items.length) items = [...element.querySelectorAll(".occasions-container, .occasion-grid")];
    const cleanAlt = (alt) => alt && !/^(undefined|null)$/i.test(alt.trim()) && !/\$\{/.test(alt) ? alt.trim() : "";
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      if (item.classList.contains("slick-cloned") || item.closest(".slick-cloned")) return;
      const img = item.querySelector("img.occasion-image") || item.querySelector("img");
      const titleEl = item.querySelector(".occasion-title, h3, h2");
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const explore = item.querySelector("a.explore-link[href], .wrapper_link a[href]");
      const key = title || img && img.getAttribute("src");
      if (!key || seen.has(key)) return;
      seen.add(key);
      let imageCell = "";
      if (img && img.getAttribute("src")) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        i.alt = cleanAlt(img.getAttribute("alt")) || title;
        imageCell = i;
      }
      const body = [];
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      const subs = [...item.querySelectorAll(".button-row a[href], a.badge-button[href]")].filter((a, idx, arr) => arr.indexOf(a) === idx && a.textContent.trim());
      if (subs.length) {
        const p = document2.createElement("p");
        subs.forEach((sub, idx) => {
          if (idx) p.append(document2.createTextNode(" | "));
          const a = document2.createElement("a");
          a.href = sub.getAttribute("href").trim();
          a.textContent = sub.textContent.trim();
          p.append(a);
        });
        body.push(p);
      }
      if (explore) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = explore.getAttribute("href").trim();
        a.textContent = explore.textContent.trim() || "Explore";
        p.append(a);
        body.push(p);
      }
      cells.push([imageCell, body.length ? body : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-gifting", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-store.js
  function parse11(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".card-body")];
    if (!items.length) items = [...element.querySelectorAll(".store-details-column, .store-details")];
    const text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const para = (child) => {
      const p = document2.createElement("p");
      p.append(child);
      return p;
    };
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      if (item.closest(".slick-cloned")) return;
      const img = item.querySelector("img.store-img, .thumbnail-img img") || item.querySelector("img");
      const nameEl = item.querySelector(".store-name");
      const name = text(nameEl) || nameEl && nameEl.getAttribute("title") || "";
      const detailLink = item.querySelector('.thumbnail-img a[href], a[href*="storeDetails"]');
      const address = text(item.querySelector(".store-address"));
      const phone = item.querySelector('a[href^="tel:"]');
      const directions = item.querySelector("a.home-store-direction-detail[href]") || [...item.querySelectorAll("a[href]")].find((a) => /maps|direction/i.test(`${a.getAttribute("href")} ${a.textContent}`));
      const key = detailLink && detailLink.getAttribute("href") || name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      let imageCell = "";
      if (img && img.getAttribute("src")) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        const alt = (img.getAttribute("alt") || "").trim();
        i.alt = !alt || /thumbnail/i.test(alt) ? name : alt;
        imageCell = i;
      }
      const body = [];
      if (name) {
        const h3 = document2.createElement("h3");
        if (detailLink) {
          const a = document2.createElement("a");
          a.href = detailLink.getAttribute("href").trim();
          a.textContent = name;
          h3.append(a);
        } else {
          h3.textContent = name;
        }
        body.push(h3);
      }
      if (address) {
        const p = document2.createElement("p");
        p.textContent = address;
        body.push(p);
      }
      if (phone) {
        const a = document2.createElement("a");
        a.href = `tel:${phone.getAttribute("href").replace(/^tel:/i, "").replace(/[^\d+]/g, "")}`;
        a.textContent = text(phone);
        body.push(para(a));
      }
      if (directions) {
        const a = document2.createElement("a");
        a.href = directions.getAttribute("href").trim();
        a.textContent = text(directions) || "Get Directions";
        body.push(para(a));
      }
      cells.push([imageCell, body.length ? body : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-store", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/tanishq-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".slick-cloned"]);
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#videoModal",
        "#appointment-form-modal",
        "#custom-modal",
        ".modal-background",
        ".cookie-alert",
        ".notification-top-bar"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".experience-einstein-einsteinCarouselStaticGlobalRecomenderRevamp",
        ".dataContainer"
      ]);
      element.querySelectorAll(".evgHomePageCarousel").forEach((evg) => {
        const container = evg.closest(".experience-commerce_assets-emptyContainer");
        if (container && container.children.length === 1 && !container.textContent.trim()) {
          container.remove();
        } else {
          evg.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".slick-arrow",
        ".slick-dots",
        ".slide-arrow",
        ".slide-arrow-collection",
        ".spot-arrow",
        ".slider-progress",
        ".swiper-scrollbar",
        ".swiper-notification",
        ".carousel-control-prev",
        ".carousel-control-next",
        ".pd-carousel-indicators"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".pd-fod-category .mobile-categories",
        ".gifting .action-pills"
      ]);
      element.querySelectorAll(".shop-our-collection-explore a.explore-link").forEach((a) => {
        if (a.closest("em")) return;
        const em = a.ownerDocument.createElement("em");
        a.replaceWith(em);
        em.append(a);
      });
      WebImporter.DOMUtils.remove(element, [
        ".home-notification-slot",
        "input#store-postal-code",
        "input.isMainBannerRevamp",
        "input#getWishlistURL"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header",
        "#sg-navbar-collapse",
        ".header-section-m-spacing",
        "footer.footer-div",
        ".payment-info"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".current-locale",
        "#homepage-pd",
        ".isauthenticated",
        ".homepage.d-none",
        "#homepage-revamp > h2.d-none",
        ".back-to-top",
        ".error-messaging"
      ]);
      WebImporter.DOMUtils.remove(element, [
        '[id^="batBeacon"]',
        "#criteo-tags-div",
        "#chat-widget-container"
      ]);
      element.querySelectorAll(".experience-commerce_assets-contentAsset").forEach((asset) => {
        if (!asset.textContent.trim() && !asset.querySelector("img, video, picture, table")) {
          asset.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, ["iframe", "script", "style", "link", "noscript", "input"]);
    }
  }

  // tools/importer/transformers/tanishq-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/transformers/kapoor-rebrand.js
  var PLACEHOLDER = (name) => `https://placeholder.kapoorjewellers.example/kapoor-${name}.png`;
  var DEMO_KEEP_SOURCE_PHOTOS = true;
  var DEMO_SLOTS = /* @__PURE__ */ new Set(["category", "product", "occasion", "audience", "gifting", "showcase-poster"]);
  var BRANDED_PHOTOS = ["gift_WOMEN.jpg"];
  var isBranded = (src) => BRANDED_PHOTOS.some((name) => src.split("?")[0].endsWith(`/${name}`));
  var BRAND = "Kapoor Jewellers";
  var TANISHQ_HOST = /(^|\.)tanishq\.(com|ae|co\.in)$/i;
  var SAMPLE_STORES = [
    { city: "Edison", path: "/stores/edison", address: "100 Sample Avenue, Suite 1, Edison, New Jersey 08817", phone: "(732) 555-0101", tel: "+17325550101" },
    { city: "Chicago", path: "/stores/chicago", address: "200 Placeholder Street, Chicago, Illinois 60601", phone: "(312) 555-0102", tel: "+13125550102" },
    { city: "Dallas", path: "/stores/dallas", address: "300 Example Road, Dallas, Texas 75201", phone: "(214) 555-0103", tel: "+12145550103" }
  ];
  var BUILT_PAGES = ["/", "/index", "/coming-soon"];
  var comingSoon = (target) => BUILT_PAGES.includes(target.split(/[?#]/)[0]) ? target : `/coming-soon?from=${encodeURIComponent(target)}`;
  var COLLECTION_NAMES = ["Signature Collection", "Gemstone Collection", "Festive Gold Collection"];
  function rebrandText(text) {
    return text.replace(/Tanishq(?=\s+\d+\s*KT)/gi, "Kapoor").replace(/Tanishq/gi, BRAND);
  }
  function blockName(table) {
    const head = table.querySelector("tr th, tr td");
    return head ? head.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") : "";
  }
  function setPlaceholder(img, name, alt) {
    const src = img.getAttribute("src") || "";
    if (DEMO_KEEP_SOURCE_PHOTOS && DEMO_SLOTS.has(name) && src && !isBranded(src)) {
      if (alt !== void 0) img.setAttribute("alt", alt);
      return;
    }
    img.setAttribute("src", PLACEHOLDER(name));
    img.removeAttribute("srcset");
    img.removeAttribute("data-src");
    if (alt !== void 0) img.setAttribute("alt", alt);
    const picture = img.closest("picture");
    if (picture) picture.querySelectorAll("source").forEach((s) => s.remove());
  }
  function makeImg(document2, name, alt) {
    const img = document2.createElement("img");
    setPlaceholder(img, name, alt);
    return img;
  }
  function rowsOf(table) {
    return [...table.querySelectorAll(":scope > tbody > tr, :scope > tr")].slice(1);
  }
  function cellsOf(row) {
    return [...row.children].filter((c) => c.tagName === "TD" || c.tagName === "TH");
  }
  function rebrandHero(table) {
    rowsOf(table).forEach((row, i) => {
      const n = i % 10 + 1;
      const label = `${BRAND} banner ${n}`;
      const imgs = [...row.querySelectorAll("img")];
      imgs.forEach((img, j) => setPlaceholder(img, j === 0 ? `hero-desktop-${n}` : `hero-mobile-${n}`, label));
      row.querySelectorAll("a[href]").forEach((a) => {
        if (!a.querySelector("img")) a.textContent = label;
      });
    });
  }
  function rebrandStores(table, document2) {
    const rows = rowsOf(table);
    const parent = rows.length ? rows[0].parentNode : table;
    rows.forEach((r) => r.remove());
    SAMPLE_STORES.forEach((store) => {
      const name = `${BRAND} - ${store.city} (Sample)`;
      const tr = document2.createElement("tr");
      const imgCell = document2.createElement("td");
      imgCell.append(makeImg(document2, `store-${store.city.toLowerCase()}`, name));
      const body = document2.createElement("td");
      const h3 = document2.createElement("h3");
      const link = document2.createElement("a");
      link.href = comingSoon(store.path);
      link.textContent = name;
      h3.append(link);
      const address = document2.createElement("p");
      address.textContent = store.address;
      const phone = document2.createElement("p");
      const tel = document2.createElement("a");
      tel.href = `tel:${store.tel}`;
      tel.textContent = store.phone;
      phone.append(tel);
      const directions = document2.createElement("p");
      const dir = document2.createElement("a");
      dir.href = comingSoon(store.path);
      dir.textContent = "Get Directions";
      directions.append(dir);
      body.append(h3, address, phone, directions);
      tr.append(imgCell, body);
      parent.append(tr);
    });
  }
  function rebrandCollections(table) {
    rowsOf(table).forEach((row, i) => {
      const name = COLLECTION_NAMES[i] || `${BRAND} Collection ${i + 1}`;
      row.querySelectorAll("img").forEach((img) => setPlaceholder(img, `collection-${Math.min(i + 1, 3)}`, name));
      const heading = row.querySelector("h1, h2, h3, h4");
      if (heading) {
        const target = heading.querySelector("a") || heading;
        target.textContent = name;
      }
      row.querySelectorAll("p").forEach((p) => {
        if (!p.querySelector("a, img") && p.textContent.trim()) p.textContent = `A ${BRAND} collection (placeholder description).`;
      });
    });
  }
  function replaceVideos(scope, document2, name) {
    scope.querySelectorAll("a[href]").forEach((a) => {
      if (!/\.(mp4|webm|mov)(\?|$)/i.test(a.getAttribute("href"))) return;
      a.replaceWith(makeImg(document2, name, `${BRAND} ${name.startsWith("testimonial") ? "customer story" : "feature"} (sample)`));
    });
  }
  function rebrandTable(table, document2) {
    const name = blockName(table);
    switch (name) {
      case "carousel-hero":
        rebrandHero(table);
        break;
      case "cards-store":
        rebrandStores(table, document2);
        break;
      case "cards-collection":
        rebrandCollections(table);
        break;
      case "cards-video":
        rowsOf(table).forEach((row, i) => {
          const slot = `testimonial-${i % 2 + 1}`;
          replaceVideos(row, document2, slot);
          row.querySelectorAll("img").forEach((img) => setPlaceholder(img, slot, `${BRAND} customer story (sample)`));
        });
        break;
      case "columns-spotlight":
      case "columns-showcase": {
        const first = rowsOf(table)[0];
        const firstCell = first ? cellsOf(first)[0] : null;
        if (name === "columns-spotlight" && firstCell) replaceVideos(firstCell, document2, "spotlight");
        table.querySelectorAll("img").forEach((img) => {
          const inFirst = firstCell && firstCell.contains(img);
          let slot = "product";
          if (inFirst) slot = name === "columns-spotlight" ? "spotlight" : "showcase-poster";
          setPlaceholder(img, slot);
        });
        break;
      }
      default: {
        const slots = {
          "cards-category": "category",
          "cards-product": "product",
          "cards-occasion": "occasion",
          "columns-audience": "audience",
          "cards-gifting": "gifting"
        };
        const slot = slots[name] || "product";
        table.querySelectorAll("img").forEach((img) => setPlaceholder(img, slot));
      }
    }
  }
  function rebrandLinks(element) {
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      let url;
      try {
        url = new URL(href, "https://www.tanishq.com");
      } catch (e) {
        return;
      }
      if (!/^https?:$/.test(url.protocol)) return;
      if (TANISHQ_HOST.test(url.hostname)) {
        ["lang", "utm_source", "utm_medium", "utm_campaign"].forEach((p) => url.searchParams.delete(p));
        const search = url.searchParams.toString();
        const pathname = (url.pathname || "/").replace(/about-tanishq/gi, "about-kapoor-jewellers").replace(/encircle/gi, "kapoor-rewards").replace(/tanishq/gi, "kapoor").replace(/\.html$/, "");
        a.setAttribute("href", comingSoon(`${pathname}${search ? `?${search}` : ""}${url.hash}`));
      } else if (/(^|\.)(goo\.gl|google\.[a-z.]+)$/i.test(url.hostname) && /maps/i.test(href)) {
        a.setAttribute("href", comingSoon("/stores"));
      }
    });
  }
  function rebrandTextNodes(element, document2) {
    const walker = document2.createTreeWalker(
      element,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (/tanishq/i.test(node.nodeValue)) node.nodeValue = rebrandText(node.nodeValue);
    });
    element.querySelectorAll("[alt], [title]").forEach((el) => {
      ["alt", "title"].forEach((attr) => {
        const v = el.getAttribute(attr);
        if (v && /tanishq/i.test(v)) el.setAttribute(attr, rebrandText(v));
      });
    });
  }
  function rebrandHead(document2) {
    document2.title = rebrandText(document2.title || `${BRAND}`);
    document2.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]').forEach((meta) => {
      const prop = meta.getAttribute("property") || meta.getAttribute("name");
      if (/image/i.test(prop)) {
        meta.remove();
        return;
      }
      const content = meta.getAttribute("content");
      if (content) meta.setAttribute("content", rebrandText(content));
    });
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const { document: document2 } = payload;
    element.querySelectorAll("table").forEach((table) => rebrandTable(table, document2));
    element.querySelectorAll("img").forEach((img) => {
      if (!img.closest("table")) setPlaceholder(img, "divider", "Decorative divider");
    });
    rebrandLinks(element);
    rebrandTextNodes(element, document2);
    rebrandHead(document2);
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-hero": parse,
    "cards-category": parse2,
    "cards-product": parse3,
    "columns-spotlight": parse4,
    "cards-video": parse5,
    "cards-occasion": parse6,
    "cards-collection": parse7,
    "columns-audience": parse8,
    "columns-showcase": parse9,
    "cards-gifting": parse10,
    "cards-store": parse11
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : [],
    // Kapoor Jewellers rebrand runs last (afterTransform only), on the parsed block tables
    transform3
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" || rawPath === "/homepage" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
