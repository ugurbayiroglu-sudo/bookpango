import { renderHomepage, renderCategoryPage, renderProductPage } from './templates.js';

let allBooks = [];
const categoryList = [
  { id: "best-seller", title: "Best Seller" },
  { id: "new-arrivals", title: "New Arrivals" },
  { id: "medical-nursing", title: "Medical & Nursing" },
  { id: "textbooks", title: "Textbooks" },
  { id: "engineering-math", title: "Engineering & Mathematics" },
  { id: "business-career", title: "Business & Career" },
  { id: "bestseller-novels", title: "Bestseller Novels" },
  { id: "student-favorites", title: "Student Favorites" },
  { id: "psychology-counseling", title: "Psychology & Counseling" },
  { id: "history-humanities", title: "History & Humanities" },
  { id: "natural-sciences", title: "Natural Sciences" },
  { id: "software-computer", title: "Software & Computer Science" },
  { id: "education", title: "Education" },
  { id: "herbal-medicine", title: "Herbal & Alternative Medicine" }
];

const appContainer = document.getElementById('app');

async function loadData() {
  const res = await fetch('data/books.json');
  const data = await res.json();
  allBooks = data.books;
  router();
}

function router() {
  const path = window.location.pathname;
  if (path === '/' || path === '/index.html') {
    const sliderData = getSliderData();
    const html = renderHomepage(allBooks, categoryList, sliderData);
    appContainer.innerHTML = html;
    initSlider();
    initCarousels();
    updateDropdownLinks();
  } 
  else if (path.startsWith('/category/')) {
    const categorySlug = path.split('/')[2];
    const category = categoryList.find(c => c.id === categorySlug);
    if (category) {
      const categoryBooks = allBooks.filter(b => b.category_id === categorySlug);
      const html = renderCategoryPage(category, categoryBooks);
      appContainer.innerHTML = html;
      document.title = `${category.title} Books | University Books`;
    } else {
      notFound();
    }
  }
  else if (path.startsWith('/product/')) {
    const productSlug = path.split('/')[2];
    const book = allBooks.find(b => b.slug === productSlug);
    if (book) {
      const html = renderProductPage(book);
      appContainer.innerHTML = html;
      addProductStructuredData(book);
    } else {
      notFound();
    }
  }
  else {
    notFound();
  }
}

function getSliderData() {
  if (allBooks.length === 0) return [];
  const top3 = allBooks.slice(0, 3);
  return top3.map(book => ({
    title: book.name,
    desc: book.description || 'Digital PDF available',
    image: book.image,
    url: `/product/${book.slug}`
  }));
}

function notFound() {
  appContainer.innerHTML = '<div style="text-align:center; padding:50px;"><h1>404 - Page Not Found</h1><a href="/">Go Home</a></div>';
}

let currentSlideIndex = 0;
let autoInterval;
let isPlaying = true;

function initSlider() {
  const slidesContainer = document.getElementById('customSlides');
  if (!slidesContainer) return;
  const slides = document.querySelectorAll('.custom-slide');
  if (slides.length === 0) return;
  const total = slides.length;

  function updateSlidePosition() {
    slidesContainer.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    updateIndicators();
  }
  function updateIndicators() {
    const dots = document.querySelectorAll('.indicator-dot');
    dots.forEach((dot, i) => {
      if (i === currentSlideIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }
  function nextSlide() { currentSlideIndex = (currentSlideIndex + 1) % total; updateSlidePosition(); resetAutoTimer(); }
  function prevSlide() { currentSlideIndex = (currentSlideIndex - 1 + total) % total; updateSlidePosition(); resetAutoTimer(); }
  function startAutoSlide() { if(autoInterval) clearInterval(autoInterval); autoInterval = setInterval(nextSlide, 5000); isPlaying = true; const btn = document.getElementById('playPauseBtn'); if(btn) btn.innerHTML = '⏸'; }
  function stopAutoSlide() { if(autoInterval) clearInterval(autoInterval); autoInterval = null; isPlaying = false; const btn = document.getElementById('playPauseBtn'); if(btn) btn.innerHTML = '▶'; }
  function resetAutoTimer() { if(isPlaying) { stopAutoSlide(); startAutoSlide(); } }
  function togglePlayPause() { isPlaying ? stopAutoSlide() : startAutoSlide(); }

  const indContainer = document.getElementById('sliderIndicators');
  if (indContainer) {
    indContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = `indicator-dot ${i === currentSlideIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => { currentSlideIndex = i; updateSlidePosition(); resetAutoTimer(); });
      indContainer.appendChild(dot);
    }
  }

  const prevBtn = document.getElementById('customPrev');
  const nextBtn = document.getElementById('customNext');
  const playPause = document.getElementById('playPauseBtn');
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (playPause) playPause.addEventListener('click', togglePlayPause);

  let touchStart = 0;
  const sliderWrapper = document.getElementById('customSlider');
  if (sliderWrapper) {
    sliderWrapper.addEventListener('touchstart', e => touchStart = e.touches[0].clientX);
    sliderWrapper.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(diff) > 50) diff > 0 ? prevSlide() : nextSlide();
    });
  }
  startAutoSlide();
}

function initCarousels() {
  if (window.innerWidth < 769) return;
  const carousels = document.querySelectorAll('.carousel-wrapper');
  carousels.forEach(wrapper => {
    const leftBtn = wrapper.querySelector('.carousel-arrow-left');
    const rightBtn = wrapper.querySelector('.carousel-arrow-right');
    const track = wrapper.querySelector('.carousel-track');
    if (!track) return;
    const items = Array.from(track.children);
    if (items.length === 0) return;
    const itemsPerView = 5;
    const itemWidth = items[0].offsetWidth + 16;
    let currentGroup = 0;
    const groups = Math.ceil(items.length / itemsPerView);
    function update() {
      const offset = -currentGroup * (itemsPerView * itemWidth);
      track.style.transform = `translateX(${offset}px)`;
    }
    function next() { currentGroup = (currentGroup + 1) % groups; update(); }
    function prev() { currentGroup = (currentGroup - 1 + groups) % groups; update(); }
    if (leftBtn) leftBtn.addEventListener('click', prev);
    if (rightBtn) rightBtn.addEventListener('click', next);
    update();
  });
}

function updateDropdownLinks() {
  const dropdown = document.getElementById('categoriesDropdown');
  if (dropdown) {
    dropdown.innerHTML = categoryList.map(cat => `<a href="/category/${cat.id}">${cat.title}</a>`).join('');
  }
}

function addProductStructuredData(book) {
  const oldScript = document.querySelector('script[type="application/ld+json"]');
  if (oldScript) oldScript.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": book.name,
    "image": book.image,
    "description": book.description,
    "sku": book.isbn || book.id,
    "brand": { "@type": "Brand", "name": book.author || "University Books" },
    "offers": {
      "@type": "Offer",
      "url": book.external_url,
      "priceCurrency": "USD",
      "price": book.price,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  });
  document.head.appendChild(script);
}

window.addEventListener('DOMContentLoaded', () => {
  loadData();
  window.addEventListener('popstate', router);
});

document.body.addEventListener('click', (e) => {
  let target = e.target.closest('a');
  if (target && target.getAttribute('href') && target.getAttribute('href').startsWith('/')) {
    const href = target.getAttribute('href');
    if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/#')) {
      e.preventDefault();
      history.pushState(null, '', href);
      router();
    }
  }
});
