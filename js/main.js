import { renderHomepage } from './templates.js';

let allBooks = [];
const categories = [
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

const sliderData = []; // manuel doldurulacak

const app = document.getElementById('app');

async function loadData() {
  try {
    const res = await fetch('data/books.json');
    const data = await res.json();
    allBooks = data.books;
    // Slider verilerini ilk 3 kitaptan oluştur
    if (allBooks.length >= 3) {
      sliderData.push(
        { title: allBooks[0].name, desc: allBooks[0].description || 'Digital PDF', image: allBooks[0].image, url: allBooks[0].external_url },
        { title: allBooks[1].name, desc: allBooks[1].description || 'Best academic resource', image: allBooks[1].image, url: allBooks[1].external_url },
        { title: allBooks[2].name, desc: allBooks[2].description || 'Essential for students', image: allBooks[2].image, url: allBooks[2].external_url }
      );
    } else {
      // fallback
      sliderData.push({ title: "Sample Book", desc: "Description", image: "https://placehold.co/400x500?text=Cover", url: "#" });
    }
    render();
  } catch (err) {
    console.error('Veri yüklenemedi:', err);
    app.innerHTML = '<p>Error loading books. Please check console.</p>';
  }
}

function render() {
  const html = renderHomepage(allBooks, categories, sliderData);
  app.innerHTML = html;
  initSlider();
  initCarousels();
  attachSeeAllButtons();
  // Kategori dropdown linklerini güncelle
  const dropdown = document.getElementById('categoriesDropdown');
  if (dropdown) {
    dropdown.innerHTML = categories.map(cat => `<a href="#category-${cat.id}">${cat.title}</a>`).join('');
    document.querySelectorAll('#categoriesDropdown a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}

// Slider
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

  // Indicator oluştur
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

  // Touch swipe
  const sliderWrapper = document.getElementById('customSlider');
  let touchStart = 0;
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

function attachSeeAllButtons() {
  document.querySelectorAll('.see-all-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const catId = btn.getAttribute('data-category');
      alert(`See all products in category: ${catId} (functionality to be added)`);
    });
  });
}

loadData();
