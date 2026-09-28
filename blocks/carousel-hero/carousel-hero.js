import { createOptimizedPicture } from '../../scripts/aem.js';

const AUTOPLAY_MS = 5000;
let carouselId = 0;

function getSlides(block) {
  return [...block.querySelectorAll('.carousel-hero-slide')];
}

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;
  getSlides(block).forEach((slide, idx) => {
    const active = idx === slideIndex;
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a').forEach((link) => {
      if (active) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.carousel-hero-indicator button').forEach((button, idx) => {
    if (idx === slideIndex) {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    } else {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = getSlides(block);
  if (!slides.length) return;
  let idx = slideIndex;
  if (idx < 0) idx = slides.length - 1;
  if (idx >= slides.length) idx = 0;
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: slides[idx].offsetLeft,
    behavior: 'smooth',
  });
  updateActiveSlide(block, idx);
}

function bindEvents(block) {
  const current = () => parseInt(block.dataset.activeSlide || '0', 10);

  block.querySelectorAll('.carousel-hero-indicator button').forEach((button, idx) => {
    button.addEventListener('click', () => showSlide(block, idx));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(block, parseInt(entry.target.dataset.slideIndex, 10));
      }
    });
  }, { root: block.querySelector('.carousel-hero-slides'), threshold: 0.5 });
  getSlides(block).forEach((slide) => observer.observe(slide));

  // autoplay (rotating banner), paused on hover/focus and for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let timer;
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    timer = setInterval(() => showSlide(block, current() + 1), AUTOPLAY_MS);
  };
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}

function optimize(picture, eager) {
  const img = picture.querySelector('img');
  if (!img) return picture;
  return createOptimizedPicture(img.src, img.alt, eager, [
    { media: '(min-width: 600px)', width: '2000' },
    { width: '750' },
  ]);
}

function createSlide(row, idx, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hero-slide';
  slide.dataset.slideIndex = idx;
  slide.id = `carousel-hero-${id}-slide-${idx}`;

  // collect pictures and the first link from anywhere in the row (authors may merge/split cells)
  const pictures = [...row.querySelectorAll('picture')];
  const link = row.querySelector('a[href]');

  const media = document.createElement('div');
  media.className = 'carousel-hero-slide-media';
  pictures.forEach((pic, picIdx) => {
    const optimized = optimize(pic, idx === 0);
    if (pictures.length > 1) {
      optimized.classList.add(picIdx === 0 ? 'carousel-hero-desktop' : 'carousel-hero-mobile');
    }
    media.append(optimized);
  });

  const alt = pictures[0]?.querySelector('img')?.alt || '';
  if (link) {
    const a = document.createElement('a');
    a.href = link.href;
    if (link.title) a.title = link.title;
    a.className = 'carousel-hero-slide-link';
    a.setAttribute('aria-label', link.textContent.trim() || alt || `Slide ${idx + 1}`);
    a.append(media);
    slide.append(a);
  } else {
    slide.append(media);
  }

  // keep any other authored text (optional) as slide content
  const text = [...row.querySelectorAll(':scope > div')]
    .filter((cell) => !cell.querySelector('picture') && cell.textContent.trim() && !(link && cell.contains(link) && cell.textContent.trim() === link.textContent.trim()));
  if (text.length) {
    const content = document.createElement('div');
    content.className = 'carousel-hero-slide-content';
    text.forEach((cell) => content.append(...cell.childNodes));
    slide.append(content);
  }
  return slide;
}

export default function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  block.id = `carousel-hero-${id}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.querySelector('picture') || row.textContent.trim());

  const container = document.createElement('div');
  container.className = 'carousel-hero-slides-container';
  const slidesList = document.createElement('ul');
  slidesList.className = 'carousel-hero-slides';
  rows.forEach((row, idx) => slidesList.append(createSlide(row, idx, id)));
  container.append(slidesList);

  const isSingle = rows.length < 2;
  const children = [container];

  if (!isSingle) {
    const indicatorsNav = document.createElement('nav');
    indicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    const indicators = document.createElement('ol');
    indicators.className = 'carousel-hero-indicators';
    rows.forEach((_, idx) => {
      const li = document.createElement('li');
      li.className = 'carousel-hero-indicator';
      li.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      indicators.append(li);
    });
    indicatorsNav.append(indicators);
    children.push(indicatorsNav);
  }

  block.replaceChildren(...children);
  updateActiveSlide(block, 0);
  if (!isSingle) bindEvents(block);
}
