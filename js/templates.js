export function renderHomepage(books, categories, sliderData) {
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

  let categoriesHtml = '';
  categories.forEach(cat => {
    const catBooks = books.filter(b => b.category_id === cat.id);
    if (catBooks.length === 0) return;
    const carouselId = `carousel-${cat.id}`;
    const productsHtml = catBooks.map(book => `
      <div class="product-card">
        <div class="product-img">
          <img src="${book.image}" alt="${escapeHtml(book.name)}" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=Cover'">
        </div>
        <div class="product-info">
          <div class="product-title">${escapeHtml(book.name)}</div>
          <div class="product-price">$${book.price.toFixed(2)}</div>
          <a href="/product/${book.slug}" class="btn-view">View Book →</a>
        </div>
      </div>
    `).join('');

    categoriesHtml += `
      <div class="category-section" id="category-${cat.id}">
        <div class="category-head">
          <h2>${cat.title}</h2>
          <a href="/category/${cat.id}" class="see-all-btn">See all →</a>
        </div>
        <div class="carousel-wrapper">
          <button class="carousel-arrow carousel-arrow-left" data-carousel="${carouselId}">‹</button>
          <div class="carousel-container" id="${carouselId}">
            <div class="carousel-track" id="track-${carouselId}">
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

export function renderCategoryPage(category, books) {
  const booksHtml = books.map(book => `
    <div class="book-card">
      <img src="${book.image}" alt="${escapeHtml(book.name)}" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=Cover'">
      <div class="book-title">${escapeHtml(book.name)}</div>
      <div class="book-price">$${book.price.toFixed(2)}</div>
      <a href="/product/${book.slug}" class="btn-view">View Book →</a>
    </div>
  `).join('');

  return `
    <div class="category-page">
      <div class="category-header">
        <h1>${escapeHtml(category.title)}</h1>
      </div>
      <div class="books-grid">
        ${booksHtml || '<p>No books found in this category.</p>'}
      </div>
    </div>
  `;
}

export function renderProductPage(book) {
  updateProductMetaTags(book);
  return `
    <div class="product-page">
      <a href="/" class="back-link">← Back to Home</a>
      <div class="product-detail-container">
        <div class="product-detail-image">
          <img src="${book.image}" alt="${escapeHtml(book.name)}" onerror="this.src='https://placehold.co/400x500?text=Cover'">
        </div>
        <div class="product-detail-info">
          <h1>${escapeHtml(book.name)}</h1>
          <p><strong>Author:</strong> ${escapeHtml(book.author || 'N/A')}</p>
          <p><strong>ISBN:</strong> ${escapeHtml(book.isbn || 'N/A')}</p>
          <p><strong>Pages:</strong> ${book.pages || 'N/A'}</p>
          <p><strong>Year:</strong> ${book.publication_year || 'N/A'}</p>
          <p>${escapeHtml(book.description || '')}</p>
          <div class="product-detail-price">$${book.price.toFixed(2)}</div>
          <a href="${book.external_url}" target="_blank" class="checkout-btn">Go to checkout →</a>
        </div>
      </div>
    </div>
  `;
}

function updateProductMetaTags(book) {
  document.title = `${book.name} | University Books`;
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = book.description || `Buy ${book.name} - digital PDF available for instant download.`;

  const setMeta = (prop, name, content) => {
    let meta = document.querySelector(`meta[${prop}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(prop, name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  setMeta('property', 'og:title', book.name);
  setMeta('property', 'og:description', book.description || `Price: $${book.price}`);
  setMeta('property', 'og:image', book.image);
  setMeta('property', 'og:url', window.location.href);
  setMeta('property', 'og:type', 'product');
  setMeta('property', 'product:price:amount', book.price.toString());
  setMeta('property', 'product:price:currency', 'USD');
  setMeta('property', 'product:availability', 'in stock');
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', book.name);
  setMeta('name', 'twitter:description', book.description);
  setMeta('name', 'twitter:image', book.image);
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
