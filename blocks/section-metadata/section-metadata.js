import { readBlockConfig, toCamelCase, toClassName } from '../../scripts/aem.js';

/**
 * Applies section metadata to the parent section: `style` values become
 * section classes, any other key becomes a data attribute. The block itself
 * is removed so it never renders.
 * @param {Element} block The section-metadata block element
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (section) {
    const meta = readBlockConfig(block);
    Object.entries(meta).forEach(([key, value]) => {
      if (key === 'style') {
        const styles = (Array.isArray(value) ? value : String(value).split(','))
          .map((style) => toClassName(style.trim()))
          .filter(Boolean);
        section.classList.add(...styles);
      } else {
        section.dataset[toCamelCase(key)] = value;
      }
    });
  }
  const wrapper = block.parentElement;
  block.remove();
  if (wrapper && wrapper.classList.contains('section-metadata-wrapper') && !wrapper.children.length) {
    wrapper.remove();
  }
}
