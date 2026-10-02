import { readBlockConfig } from '../../scripts/aem.js';
import {
  getCatalog, formatPrice, productPath, addToCart,
} from '../../scripts/shop.js';

const SORTS = {
  featured: () => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

function tile(product) {
  const li = document.createElement('li');
  li.className = 'product-list-item';
  const link = document.createElement('a');
  link.className = 'product-list-link';
  link.href = productPath(product);
  const img = document.createElement('img');
  img.src = product.image;
  img.alt = product.name;
  img.loading = 'lazy';
  img.width = 320;
  img.height = 320;
  const name = document.createElement('span');
  name.className = 'product-list-name';
  name.textContent = product.name;
  const price = document.createElement('span');
  price.className = 'product-list-price';
  price.textContent = formatPrice(product.price);
  link.append(img, name, price);

  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'button secondary product-list-add';
  add.textContent = 'Add to cart';
  add.addEventListener('click', () => {
    addToCart(product, 1, 'product list');
    add.textContent = 'Added ✓';
    setTimeout(() => { add.textContent = 'Add to cart'; }, 1500);
  });
  li.append(link, add);
  return li;
}

/**
 * Product listing for one category. Authored config: "Category | Earrings".
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const category = (config.category || '').trim();
  block.textContent = '';

  const products = (await getCatalog())
    .filter((p) => !category || p.category.toLowerCase() === category.toLowerCase());

  const toolbar = document.createElement('div');
  toolbar.className = 'product-list-toolbar';
  const count = document.createElement('p');
  count.className = 'product-list-count';
  count.textContent = `${products.length} ${products.length === 1 ? 'design' : 'designs'}`;
  const label = document.createElement('label');
  label.className = 'product-list-sort';
  label.textContent = 'Sort by ';
  const select = document.createElement('select');
  [['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['name', 'Name']]
    .forEach(([value, text]) => select.append(new Option(text, value)));
  label.append(select);
  toolbar.append(count, label);

  const list = document.createElement('ul');
  list.className = 'product-list-grid';
  const render = () => {
    list.replaceChildren(...[...products].sort(SORTS[select.value]).map(tile));
  };
  select.addEventListener('change', render);
  render();

  if (!products.length) {
    const empty = document.createElement('p');
    empty.textContent = 'New designs are coming soon.';
    block.append(empty);
    return;
  }
  block.append(toolbar, list);
}
