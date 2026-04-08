// templates.js - HTML şablonları (sadece ana sayfa için şimdilik)
export function renderHomepage(books, categories, sliderData) {
  // Slider HTML
  const slidesHtml = sliderData.map(slide => `
    <div class="custom-slide">
      <div class="custom-slide-content">
        <h2>${escapeHtml(slide.title)}</h2>
        <p>${escapeHtml(slide.desc)}</p>
        <a href="${slide.url}" class="custom-slide-btn">View Book →</a>
      </div>
      <div class="custom-slide-image">
        <img src="${slide.image}" alt="${escapeHtml(slide.title)}" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=Cover'">
      </div>
    </div>
  `).join('');

  // Kategori carousel'leri
  let categoriesHtml = '';
  categories.forEach(cat => {
    const catBooks = books.filter(b => b.category_id === cat.id);
    if (catBooks.length === 0) return;
    const carouselId = `carousel-${cat.id}`;
    const trackId = `track-${carouselId}`;
    const productsHtml = catBooks.map(book => `
      <div class="product-card">
        <div class="product-img">
          <img src="${book.image}" alt="${escapeHtml(book.name)}" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=Cover'">
        </div>
        <div class="product-info">
          <div class="product-title">${escapeHtml(book.name)}</div>
          <div class="product-price">$${book.price.toFixed(2)}</div>
          <a href="#" class="btn-view">View Book →</a>
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

  return `
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
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}
