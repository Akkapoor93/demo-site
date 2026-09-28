// Breakpoint that switches the mobile drawer to the desktop header
const isDesktop = window.matchMedia('(width >= 900px)');

// UI chrome icons (not content): hamburger, close, chevron, back
const ICONS = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"/></svg>',
};

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  return node;
}

function iconButton(className, label, icon) {
  const button = el('button', className, ICONS[icon]);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  return button;
}

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, base: URL}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: new URL(resp.url, window.location.href) };
}

// Item layout comes from the image naming convention in the fragment (card-/big-/icon-).
function itemType(li) {
  const img = li.querySelector('img');
  if (!img) return 'chip';
  const name = img.getAttribute('src').split('/').pop();
  const match = name.match(/^(card|big|icon)-/);
  return match ? match[1] : 'card';
}

function textOf(anchor) {
  return [...anchor.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join('')
    .trim() || anchor.textContent.trim();
}

/**
 * Reads the fragment's top-level sections by their shape.
 * @param {Element} frag The parsed fragment
 */
function readSections(frag) {
  const sections = [...frag.querySelectorAll(':scope > div')];
  const nav = sections.find((s) => s.querySelector(':scope > ul > li > ul'));
  const account = sections.find((s) => s !== nav && s.querySelector(':scope > h2'));
  const tools = sections.find((s) => s !== nav && s !== account && s.querySelector(':scope > ul img'));
  const brand = sections.find((s) => ![nav, account, tools].includes(s) && s.querySelector(':scope > p > a'));
  const announcement = sections.find((s) => ![nav, account, tools, brand].includes(s));
  return {
    announcement, brand, tools, nav, account,
  };
}

/**
 * Reads the megamenu model for one top-level item.
 * @param {Element} li Top-level nav item from the fragment
 */
function readItem(li) {
  const link = li.querySelector(':scope > a');
  const tabs = [...li.querySelectorAll(':scope > ul > li')].map((tab) => {
    const tabLink = tab.querySelector(':scope > a');
    const items = [...tab.querySelectorAll(':scope > ul > li')];
    const paragraphs = [...tab.querySelectorAll(':scope > p')];
    const explore = paragraphs.map((p) => p.querySelector(':scope > a:only-child'))
      .find((a) => a && !a.querySelector('img'));
    const bannerLink = paragraphs.map((p) => p.querySelector('a')).find((a) => a && a.querySelector('img'));
    const caption = paragraphs.find((p) => !p.querySelector('a'));
    return {
      label: tabLink ? tabLink.textContent.trim() : '',
      href: tabLink ? tabLink.getAttribute('href') : '#',
      items,
      type: items.length ? itemType(items[0]) : 'chip',
      explore,
      bannerLink,
      caption: caption ? caption.textContent.trim() : '',
    };
  });
  return {
    label: link ? link.textContent.trim() : '', href: link ? link.getAttribute('href') : '#', tabs,
  };
}

function buildItemList(tab) {
  const ul = el('ul', `nav-panel-items nav-panel-items-${tab.type}`);
  tab.items.forEach((item) => {
    const src = item.querySelector(':scope > a');
    if (!src) return;
    const li = el('li');
    const a = el('a');
    a.href = src.getAttribute('href');
    const img = src.querySelector('img');
    if (img) {
      const pic = img.cloneNode();
      pic.loading = 'lazy';
      pic.alt = '';
      a.append(pic);
    }
    a.append(el('span', '', textOf(src)));
    li.append(a);
    ul.append(li);
  });
  return ul;
}

function activateTab(panel, index) {
  panel.querySelectorAll('.nav-panel-tab').forEach((tab, i) => {
    tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
    tab.classList.toggle('is-active', i === index);
  });
  panel.querySelectorAll('.nav-panel-view, .nav-panel-banner').forEach((view) => {
    view.hidden = Number(view.dataset.tab) !== index;
  });
}

function buildPanel(model, idx) {
  const panel = el('div', 'nav-panel');
  panel.id = `nav-panel-${idx}`;
  const tabList = el('ul', 'nav-panel-tabs');
  tabList.setAttribute('role', 'tablist');
  const views = el('div', 'nav-panel-views');
  const banners = el('div', 'nav-panel-banners');
  model.tabs.forEach((tab, t) => {
    const tabLi = el('li');
    tabLi.setAttribute('role', 'presentation');
    const tabLink = el('a', 'nav-panel-tab', tab.label);
    tabLink.href = tab.href;
    tabLink.setAttribute('role', 'tab');
    tabLink.addEventListener('mouseenter', () => activateTab(panel, t));
    tabLink.addEventListener('focus', () => activateTab(panel, t));
    tabLi.append(tabLink);
    tabList.append(tabLi);

    const view = el('div', 'nav-panel-view');
    view.dataset.tab = t;
    view.setAttribute('role', 'tabpanel');
    if (tab.items.length) view.append(buildItemList(tab));
    if (tab.explore) {
      const p = el('p', 'nav-panel-explore');
      const a = tab.explore.cloneNode(true);
      p.append(a);
      view.append(p);
    }
    views.append(view);

    if (tab.bannerLink) {
      const banner = el('div', 'nav-panel-banner');
      banner.dataset.tab = t;
      const a = tab.bannerLink.cloneNode(true);
      a.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });
      banner.append(a);
      if (tab.caption) banner.append(el('p', 'nav-panel-caption', tab.caption));
      banners.append(banner);
    }
  });
  panel.append(tabList, views, banners);
  activateTab(panel, 0);
  return panel;
}

function closePanels(nav, except) {
  nav.querySelectorAll('.nav-item.is-open').forEach((item) => {
    if (item === except) return;
    item.classList.remove('is-open');
    item.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
  });
}

function openPanel(nav, item) {
  closePanels(nav, item);
  item.classList.add('is-open');
  item.querySelector('.nav-link').setAttribute('aria-expanded', 'true');
}

function buildDesktopMenu(nav, models) {
  const menu = el('div', 'nav-menu');
  const list = el('ul', 'nav-list');
  models.forEach((model, idx) => {
    const item = el('li', 'nav-item');
    const link = el('a', 'nav-link', model.label);
    link.href = model.href;
    item.append(link);
    if (model.tabs.length) {
      item.classList.add('has-panel');
      link.setAttribute('aria-expanded', 'false');
      link.setAttribute('aria-controls', `nav-panel-${idx}`);
      item.append(buildPanel(model, idx));
      let timer;
      item.addEventListener('mouseenter', () => {
        if (!isDesktop.matches) return;
        clearTimeout(timer);
        openPanel(nav, item);
      });
      item.addEventListener('mouseleave', () => {
        timer = setTimeout(() => {
          item.classList.remove('is-open');
          link.setAttribute('aria-expanded', 'false');
        }, 150);
      });
      item.addEventListener('focusin', () => { if (isDesktop.matches) openPanel(nav, item); });
    }
    list.append(item);
  });
  menu.append(list);
  return menu;
}

function setDrawer(nav, open) {
  const drawer = nav.querySelector('.nav-drawer');
  const hamburger = nav.querySelector('.nav-hamburger');
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (!open) drawer.querySelectorAll('.nav-drawer-sub.is-active').forEach((sub) => sub.classList.remove('is-active'));
}

function buildSubPanel(nav, model) {
  const sub = el('div', 'nav-drawer-sub');
  const head = el('div', 'nav-drawer-sub-head');
  const back = iconButton('nav-drawer-back', 'Back', 'back');
  back.addEventListener('click', () => sub.classList.remove('is-active'));
  const close = iconButton('nav-drawer-close', 'Close menu', 'close');
  close.addEventListener('click', () => setDrawer(nav, false));
  head.append(back, el('h2', 'nav-drawer-sub-title', model.label), close);
  sub.append(head);
  model.tabs.forEach((tab) => {
    const group = el('div', 'nav-drawer-group');
    group.append(el('h3', '', tab.label));
    if (tab.items.length) {
      const chips = el('ul', 'nav-drawer-chips');
      tab.items.forEach((item) => {
        const src = item.querySelector(':scope > a');
        if (!src) return;
        const li = el('li');
        const a = el('a', '', textOf(src));
        a.href = src.getAttribute('href');
        li.append(a);
        chips.append(li);
      });
      group.append(chips);
    }
    sub.append(group);
  });
  const exploreSource = model.tabs.map((t) => t.explore).find(Boolean);
  if (exploreSource) {
    const p = el('p', 'nav-drawer-explore');
    const a = el('a', '', exploreSource.textContent.trim());
    a.href = model.href && model.href !== '#' ? model.href : exploreSource.getAttribute('href');
    p.append(a);
    sub.append(p);
  }
  return sub;
}

function buildDrawer(nav, models, sections) {
  const drawer = el('div', 'nav-drawer');
  drawer.id = 'nav-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  const main = el('div', 'nav-drawer-main');
  const close = iconButton('nav-drawer-close', 'Close menu', 'close');
  close.addEventListener('click', () => setDrawer(nav, false));
  main.append(close);

  const { account } = sections;
  if (account) {
    const card = el('div', 'nav-account-card');
    const title = account.querySelector(':scope > h2');
    const signIn = account.querySelector(':scope > p');
    if (title) card.append(title.cloneNode(true));
    if (signIn) card.append(signIn.cloneNode(true));
    main.append(card);
  }

  const heading = sections.nav.querySelector(':scope > h2');
  if (heading) main.append(el('h2', 'nav-drawer-heading', heading.textContent.trim()));

  const grid = el('ul', 'nav-drawer-grid');
  models.forEach((model) => {
    const li = el('li');
    if (model.tabs.length) {
      const sub = buildSubPanel(nav, model);
      drawer.append(sub);
      const button = el('button', 'nav-drawer-tile', `<span>${model.label}</span>${ICONS.chevron}`);
      button.type = 'button';
      button.addEventListener('click', () => sub.classList.add('is-active'));
      li.append(button);
    } else {
      const a = el('a', 'nav-drawer-tile', `<span>${model.label}</span>${ICONS.chevron}`);
      a.href = model.href;
      li.append(a);
    }
    grid.append(li);
  });
  main.append(grid);

  const accountLinks = account && account.querySelector(':scope > ul');
  if (accountLinks) {
    const links = el('ul', 'nav-drawer-links');
    accountLinks.querySelectorAll('a').forEach((src) => {
      const li = el('li');
      const a = el('a', '', `<span>${src.textContent.trim()}</span>${ICONS.chevron}`);
      a.href = src.getAttribute('href');
      li.append(a);
      links.append(li);
    });
    main.append(links);
  }
  drawer.prepend(main);
  return drawer;
}

function buildBar(nav, sections) {
  const bar = el('div', 'nav-bar');
  const hamburger = iconButton('nav-hamburger', 'Open menu', 'menu');
  hamburger.setAttribute('aria-controls', 'nav-drawer');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.addEventListener('click', () => setDrawer(nav, true));

  const toolLinks = sections.tools ? [...sections.tools.querySelectorAll('a')] : [];
  const searchLink = toolLinks.find((a) => /search/i.test(a.getAttribute('href')));

  const search = el('form', 'nav-search');
  search.setAttribute('role', 'search');
  search.action = searchLink ? searchLink.getAttribute('href') : '/search';
  const searchLabel = searchLink ? textOf(searchLink) : 'Search';
  const searchIcon = searchLink && searchLink.querySelector('img');
  if (searchIcon) {
    const icon = searchIcon.cloneNode();
    icon.alt = '';
    search.append(icon);
  }
  const input = el('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = searchLabel;
  input.setAttribute('aria-label', searchLabel);
  search.append(input);

  const brand = el('div', 'nav-brand');
  const brandLink = sections.brand && sections.brand.querySelector('a');
  if (brandLink) brand.append(brandLink.cloneNode(true));

  const tools = el('ul', 'nav-tools');
  toolLinks.filter((a) => a !== searchLink).forEach((src) => {
    const slug = (src.getAttribute('href') || '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
    const li = el('li', `nav-tool-${slug || 'link'}`);
    const a = el('a');
    a.href = src.getAttribute('href');
    const label = textOf(src);
    a.setAttribute('aria-label', label);
    a.title = label;
    const img = src.querySelector('img');
    if (img) {
      const icon = img.cloneNode();
      icon.alt = '';
      a.append(icon);
    }
    li.append(a);
    tools.append(li);
  });

  bar.append(hamburger, search, brand, tools);
  return bar;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;
  const frag = document.createElement('div');
  frag.innerHTML = fragment.html;
  // fragment image paths are relative to the fragment, not the page
  frag.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), fragment.base).href;
  });

  const sections = readSections(frag);
  if (!sections.nav) return;
  const models = [...sections.nav.querySelectorAll(':scope > ul > li')].map(readItem);

  const nav = el('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  if (sections.announcement) {
    const announcement = el('div', 'nav-announcement');
    announcement.append(...[...sections.announcement.children].map((c) => c.cloneNode(true)));
    nav.append(announcement);
  }
  nav.append(
    buildBar(nav, sections),
    buildDesktopMenu(nav, models),
    buildDrawer(nav, models, sections),
  );

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closePanels(nav);
    setDrawer(nav, false);
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closePanels(nav);
  });
  // viewport resize across the breakpoint: reset whichever mode we left
  isDesktop.addEventListener('change', () => {
    closePanels(nav);
    setDrawer(nav, false);
  });

  const navWrapper = el('div', 'nav-wrapper');
  navWrapper.append(nav);
  block.replaceChildren(navWrapper);
}
