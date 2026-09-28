import { createOptimizedPicture } from '../../scripts/aem.js';

let instance = 0;

function selectTab(block, index) {
  block.querySelectorAll('.cards-gifting-tab').forEach((tab, idx) => {
    tab.setAttribute('aria-selected', idx === index);
    tab.tabIndex = idx === index ? 0 : -1;
  });
  block.querySelectorAll('.cards-gifting-card').forEach((card, idx) => {
    card.classList.toggle('cards-gifting-card-active', idx === index);
  });
}

// short pill labels: drop a leading word shared by every title ("Gifts for Women" -> "For Women")
function tabLabels(cards) {
  const titles = cards.map((card) => {
    const heading = card.querySelector('h2, h3, h4, h5, h6');
    return heading ? heading.textContent.trim().split(/\s+/) : [];
  });
  const first = titles[0] && titles[0][0];
  const shared = first && titles.every((words) => words.length > 2 && words[0] === first);
  return titles.map((words, idx) => {
    if (!words.length) return `${idx + 1}`;
    if (!shared) return words.join(' ');
    const label = words.slice(1).join(' ');
    return label.charAt(0).toUpperCase() + label.slice(1);
  });
}

function buildTabs(block, cards, id) {
  const tablist = document.createElement('div');
  tablist.className = 'cards-gifting-tabs';
  tablist.setAttribute('role', 'tablist');
  const labels = tabLabels(cards);
  cards.forEach((card, idx) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'cards-gifting-tab';
    tab.id = `cards-gifting-${id}-tab-${idx}`;
    tab.setAttribute('role', 'tab');
    tab.textContent = labels[idx];
    card.id = `cards-gifting-${id}-card-${idx}`;
    tab.setAttribute('aria-controls', card.id);
    tab.addEventListener('click', () => selectTab(block, idx));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + cards.length) % cards.length;
      selectTab(block, next);
      tablist.children[next].focus();
    });
    tablist.append(tab);
  });
  return tablist;
}

export default function decorate(block) {
  instance += 1;
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-gifting-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    let body;
    [...li.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-gifting-card-image';
      } else if (!cell.textContent.trim()) {
        cell.remove();
      } else if (!body) {
        cell.className = 'cards-gifting-card-body';
        body = cell;
      } else {
        body.append(...cell.childNodes);
        cell.remove();
      }
    });

    if (body) {
      const paragraphs = [...body.querySelectorAll(':scope > p')];
      const subLinks = paragraphs.find((p) => p.querySelectorAll('a[href]').length > 1);
      if (subLinks) {
        const list = document.createElement('ul');
        list.className = 'cards-gifting-links';
        subLinks.querySelectorAll('a[href]').forEach((a) => {
          a.classList.remove('button');
          const item = document.createElement('li');
          item.append(a);
          list.append(item);
        });
        subLinks.replaceWith(list);
      }
      const last = [...body.querySelectorAll(':scope > p')].pop();
      if (last && last.querySelector('a[href]') && last.textContent.trim() === last.querySelector('a').textContent.trim()) {
        last.classList.add('cards-gifting-cta');
      }
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  const cards = [...ul.children];
  const children = [];
  if (cards.length > 1) {
    const tablist = buildTabs(block, cards, instance);
    cards.forEach((card, idx) => {
      card.setAttribute('role', 'tabpanel');
      card.setAttribute('aria-labelledby', tablist.children[idx].id);
    });
    children.push(tablist);
  }
  children.push(ul);
  block.replaceChildren(...children);
  if (cards.length > 1) selectTab(block, 0);
}
