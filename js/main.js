// Veri dosyasından kitapları çek (şimdilik örnek veri, sonra books.json'dan gelecek)
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

// Örnek ürünler (Milady resmi ile doldurulmuş, her kategoride 5 ürün)
const miladyImage = "https://imgproxy.fourthwall.com/smD2ZuSufwXNybwkL_4mOv1pQC3bdDlmpmYDefdibwM/w:1920/sm:1/enc/4S7VQ6Jqsmabmjyp/MiRZvftRchyWpC3O/syYARl4Up2YROwjc/4OiABjauWeIkuQv4/fBE4_vz6r0XDLITT/XfVDHG7JIigh_YCF/EnU_Eg02eLNGOTGF/c_Ea1kuMwTMiiadK/4R9QzYWB8BgUwCru/84MUplL250OiBPSU/cR4oN3fRtN-Lk2aT/qrY3S2YeO5WNfd9D/euCDL2s6GbUqAPtA/jI_c3w";
const allProducts = [];
categories.forEach(cat => {
  for (let i = 1; i <= 5; i++) {
    allProducts.push({
      name: `${cat.title} - Sample Book ${i}`,
      price: 9.99 + (i * 2),
      imageUrl: miladyImage,
      category: cat.id,
      planId: "plan_ubegJ5QTCGxBS"
    });
  }
});

// Slider verileri
const sliderData = [
  { title: "Milady Standard Cosmetology 14th Edition", desc: "Official digital PDF • Instant download", image: miladyImage },
  { title: "Barron's AP Calculus Premium 2026", desc: "12 full-length tests", image: miladyImage },
  { title: "Netter's Atlas of Human Anatomy", desc: "8th Edition", image: miladyImage },
  { title: "PMBOK Guide 7th Edition", desc: "Official PMI", image: miladyImage },
  { title: "Campbell Biology AP 12th", desc: "Urry & Cain", image: miladyImage }
];

// ---------- Render ana sayfa ----------
function renderHomepage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  // Slider HTML
  const slidesHtml = sliderData.map(slide => `
    <div class="custom-slide">
      <div class="custom-slide-content">
        <h2>${escapeHtml(slide.title)}</h2>
        <p>${escapeHtml(slide.desc)}</p>
        <button class="custom-slide-btn view-book-trigger" data-plan-id="plan_ubegJ5QTCGxBS">View Book →</button>
      </div>
      <div class="custom-slide-image">
        <img src="${slide.image}" alt="${escapeHtml(slide.title)}" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=Cover'">
      </div>
    </div>
  `).join('');

  // Kategoriler ve carousel'ler
  let categoriesHtml = '';
  categories.forEach(cat => {
    const catProducts = allProducts.filter(p => p.category === cat.id);
    if (catProducts.length === 0) return;
    const carouselId = `carousel-${cat.id}`;
    const trackId = `track-${carouselId}`;
    const productsHtml = catProducts.map(p => `
      <div class="product-card">
        <div class="product-img">
          <img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=Cover'">
        </div>
        <div class="product-info">
          <div class="product-title">${escapeHtml(p.name)}</div>
          <div class="product-price">$${p.price.toFixed(2)}</div>
          <button class="btn-view view-book-trigger" data-plan-id="${p.planId}">View Book →</button>
        </div>
      </div>
    `).join('');
    categoriesHtml += `
      <div class="category-section" id="category-${cat.id}">
        <div class="category-head">
          <h2>${cat.title}</h2>
          <button class="see-all-btn" data-category="${cat.id}">See all →</button>
        </div>
        <div class="carousel-wrapper">
          <button class="carousel-arrow carousel-arrow-left" data-carousel="${carouselId}">‹</button>
          <div class="carousel-container" id="${carouselId}">
            <div class="carousel-track" id="${trackId}">
              ${productsHtml}
            </div>
          </div>
          <button class="carousel-arrow carousel-arrow-right" data-carousel="${carouselId}">›</button>
        </div>
      </div>
    `;
  });

  app.innerHTML = `
    <div class="custom-slider-wrapper" id="customSlider">
      <div class="custom-slides" id="customSlides">${slidesHtml}</div>
      <button class="custom-slider-btn custom-slider-left" id="customPrev">←</button>
      <button class="custom-slider-btn custom-slider-right" id="customNext">→</button>
    </div>
    <div class="slider-controls">
      <div class="slider-indicators" id="sliderIndicators"></div>
      <button class="play-pause-btn" id="playPauseBtn">⏸</button>
    </div>
    <div id="categoriesContainer">${categoriesHtml}</div>
  `;

  // Slider ve carousel'leri başlat
  initSlider();
  initCarousels();
  attachSeeAllButtons();
  
  // Kategori dropdown linklerini doldur
  const catDropdown = document.getElementById('categoriesDropdown');
  if (catDropdown) {
    catDropdown.innerHTML = categories.map(cat => `<a href="#category-${cat.id}">${cat.title}</a>`).join('');
    document.querySelectorAll('#categoriesDropdown a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeAllDropdowns(); // Bu fonksiyon index.html içinde global
      });
    });
  }
}

// ---------- Slider ----------
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
  function startAutoSlide() { if (autoInterval) clearInterval(autoInterval); autoInterval = setInterval(nextSlide, 5000); isPlaying = true; const btn = document.getElementById('playPauseBtn'); if (btn) btn.innerHTML = '⏸'; }
  function stopAutoSlide() { if (autoInterval) clearInterval(autoInterval); autoInterval = null; isPlaying = false; const btn = document.getElementById('playPauseBtn'); if (btn) btn.innerHTML = '▶'; }
  function resetAutoTimer() { if (isPlaying) { stopAutoSlide(); startAutoSlide(); } }
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
      alert(`See all products in category: ${catId} (Coming soon)`);
    });
  });
}

// ---------- Whop Checkout Modal ----------
const modal = document.getElementById('whopModal');
const closeModalBtn = document.querySelector('.whop-close');
const checkoutContainer = document.getElementById('whop-checkout-container');

function closeModal() {
  modal.style.display = 'none';
  checkoutContainer.innerHTML = '';
}
if (closeModalBtn) closeModalBtn.onclick = closeModal;
window.onclick = function(e) { if (e.target === modal) closeModal(); };

function openCheckoutModal(planId) {
  checkoutContainer.innerHTML = `
    <div class="checkout-wrapper">
      <div class="whop-checkout-embed" id="whop-embedded-checkout" data-whop-checkout-plan-id="${planId}" data-whop-checkout-theme="light" data-whop-checkout-theme-accent-color="blue" data-whop-checkout-hide-submit-button="true"></div>
      <div class="terms-section">
        <div class="checkbox-group">
          <input type="checkbox" id="accept-terms">
          <label for="accept-terms">I agree to the <a href="#" target="_blank">Terms & Conditions</a> and <a href="#" target="_blank">Privacy Policy</a></label>
        </div>
      </div>
      <div class="button-container">
        <button id="custom-submit-btn" style="background-color:#000; color:#fff;"><span class="button-title">Complete Purchase</span></button>
        <div class="error-message" id="error-message">Please accept all terms to continue</div>
      </div>
    </div>
  `;
  modal.style.display = 'flex';

  // Whop'un iframe'i oluşturması için scan'i çağır
  setTimeout(() => {
    if (window.whopCheckoutLoader && typeof window.whopCheckoutLoader.scan === 'function') {
      window.whopCheckoutLoader.scan();
    }
  }, 100);

  setTimeout(() => {
    const submitBtn = document.getElementById('custom-submit-btn');
    const acceptCheckbox = document.getElementById('accept-terms');
    const errorMsg = document.getElementById('error-message');
    if (!submitBtn) return;

    function enableSubmit() {
      if (acceptCheckbox.checked) {
        submitBtn.disabled = false;
        errorMsg.style.display = 'none';
      } else {
        submitBtn.disabled = true;
      }
    }
    if (acceptCheckbox) acceptCheckbox.addEventListener('change', enableSubmit);
    enableSubmit();

    let checkoutSubmitted = false;
    let submitTimeout = null;
    function resetSubmitButton() {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<span class="button-title">Complete Purchase</span>'; }
      checkoutSubmitted = false;
      if (submitTimeout) clearTimeout(submitTimeout);
    }

    submitBtn.addEventListener('click', () => {
      if (acceptCheckbox && !acceptCheckbox.checked) {
        if (errorMsg) errorMsg.style.display = 'block';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Processing...';
      checkoutSubmitted = true;
      submitTimeout = setTimeout(() => resetSubmitButton(), 30000);
      if (typeof wco !== 'undefined' && wco.submit) {
        wco.submit('whop-embedded-checkout');
      } else {
        console.error('wco.submit not available');
        resetSubmitButton();
        alert('Payment system not ready. Please refresh and try again.');
      }
    });

    function whopMessageHandler(event) {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'whop_checkout_complete') {
        resetSubmitButton();
        setTimeout(() => { closeModal(); alert('Thank you for your purchase!'); }, 1000);
        window.removeEventListener('message', whopMessageHandler);
      }
      if (event.data.type === 'whop_checkout_error') {
        resetSubmitButton();
        alert('Payment error. Please try again.');
        window.removeEventListener('message', whopMessageHandler);
      }
    }
    window.addEventListener('message', whopMessageHandler);
  }, 200);
}

// Tüm "View Book" butonlarına tıklama olayını bağla (delegasyon)
document.body.addEventListener('click', (e) => {
  const trigger = e.target.closest('.view-book-trigger');
  if (trigger && trigger.classList.contains('view-book-trigger')) {
    e.preventDefault();
    const planId = trigger.getAttribute('data-plan-id') || 'plan_ubegJ5QTCGxBS';
    openCheckoutModal(planId);
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Sayfa yüklendiğinde ana sayfayı render et
document.addEventListener('DOMContentLoaded', () => {
  renderHomepage();
});
