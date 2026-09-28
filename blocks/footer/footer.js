// Below this width the link columns collapse into an accordion
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, base: URL}|null>}
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: new URL(resp.url, window.location.href) };
}

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function setExpanded(button, list, expanded) {
  button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  list.classList.toggle('is-open', expanded);
}

/**
 * Builds one footer column. Text-link columns get an accordion toggle (mobile only);
 * icon-only columns (social) stay open.
 * @param {Element} section Fragment section with a heading and a list
 * @param {number} idx Column index
 */
function buildColumn(section, idx) {
  const col = el('div', 'footer-col');
  const heading = section.querySelector(':scope > h2, :scope > h3');
  const list = section.querySelector(':scope > ul');
  const iconOnly = list && [...list.querySelectorAll('a')].every((a) => a.querySelector('img') && !a.textContent.trim());
  if (iconOnly) col.classList.add('footer-col-icons');

  if (heading && list && !iconOnly) {
    const button = el('button', 'footer-col-toggle');
    button.type = 'button';
    button.textContent = heading.textContent.trim();
    const listId = `footer-col-${idx}`;
    list.id = listId;
    button.setAttribute('aria-controls', listId);
    setExpanded(button, list, false);
    button.addEventListener('click', () => {
      if (isDesktop.matches) return;
      setExpanded(button, list, button.getAttribute('aria-expanded') !== 'true');
    });
    const h = el('h2', 'footer-col-heading');
    h.append(button);
    col.append(h);
  } else if (heading) {
    const h = el('h2', 'footer-col-heading');
    h.textContent = heading.textContent.trim();
    col.append(h);
  }

  if (list) {
    list.classList.add('footer-col-list');
    list.querySelectorAll('a').forEach((a) => {
      const img = a.querySelector('img');
      if (img && !a.textContent.trim()) a.setAttribute('aria-label', img.alt);
    });
    col.append(list);
  }
  return col;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  if (!fragment) return;
  const frag = document.createElement('div');
  frag.innerHTML = fragment.html;
  // fragment image paths are relative to the fragment, not the page; drop <source>s so
  // their relative srcsets don't resolve against the page URL
  frag.querySelectorAll('picture source').forEach((source) => source.remove());
  frag.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), fragment.base).href;
    img.loading = 'lazy';
  });

  const sections = [...frag.querySelectorAll(':scope > div')];
  // the legal strip is the section without a heading
  const legal = sections.find((s) => !s.querySelector(':scope > h2, :scope > h3'));
  const columns = sections.filter((s) => s !== legal);

  const main = el('div', 'footer-main');
  const grid = el('div', 'footer-columns');
  columns.forEach((section, idx) => grid.append(buildColumn(section, idx)));
  main.append(grid);

  const children = [main];
  if (legal) {
    const strip = el('div', 'footer-legal');
    const inner = el('div', 'footer-legal-inner');
    inner.append(...[...legal.children]);
    const links = inner.querySelector(':scope > ul');
    if (links) links.classList.add('footer-legal-links');
    const copy = inner.querySelector(':scope > p');
    if (copy) copy.classList.add('footer-copyright');
    strip.append(inner);
    children.push(strip);
  }

  // leaving mobile: collapse state no longer applies (desktop shows every list)
  isDesktop.addEventListener('change', () => {
    block.querySelectorAll('.footer-col-toggle').forEach((button) => {
      const list = block.querySelector(`#${button.getAttribute('aria-controls')}`);
      if (list) setExpanded(button, list, false);
    });
  });

  block.replaceChildren(...children);
}
