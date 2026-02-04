/* ==========================================
   BOOKPANGO - Helper Utilities
   ========================================== */

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Calculate reading time
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

// Generate star rating HTML
function generateStarRating(rating, maxStars = 5) {
    let html = '<div class="stars">';
    
    for (let i = 1; i <= maxStars; i++) {
        if (i <= Math.floor(rating)) {
            html += '<i class="fas fa-star"></i>';
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    
    html += '</div>';
    return html;
}

// Format Firestore timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Create book card HTML
function createBookCard(book) {
    const rating = book.rating || 0;
    const reviewCount = book.reviewCount || 0;
    
    return `
        <div class="book-card" data-book-id="${book.id}">
            <div class="book-card-image">
                <img src="${book.coverImage || '/images/placeholder.jpg'}" 
                     alt="${book.title}" 
                     loading="lazy">
                ${book.featured ? '<span class="book-card-badge">Featured</span>' : ''}
                <button class="book-card-favorite ${book.isFavorite ? 'active' : ''}" 
                        data-book-id="${book.id}">
                    <i class="${book.isFavorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="book-card-content">
                <span class="book-card-category">${book.categories?.[0] || 'Uncategorized'}</span>
                <h3 class="book-card-title">
                    <a href="/books/${book.slug || book.id}.html">${book.title}</a>
                </h3>
                <p class="book-card-author">by ${book.author}</p>
                <div class="book-card-rating">
                    ${generateStarRating(rating)}
                    <span class="rating-count">(${reviewCount})</span>
                </div>
                <div class="book-card-footer">
                    <a href="/books/${book.slug || book.id}.html" class="btn-outline btn-sm">
                        View Details
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Create blog card HTML
function createBlogCard(blog) {
    return `
        <div class="blog-card" data-blog-id="${blog.id}">
            <div class="blog-card-image">
                <img src="${blog.featuredImage || '/images/placeholder.jpg'}" 
                     alt="${blog.title}" 
                     loading="lazy">
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-category">${blog.categories?.[0] || 'General'}</span>
                    <span class="blog-card-date">
                        <i class="far fa-clock"></i>
                        ${formatTimestamp(blog.publishedAt)}
                    </span>
                </div>
                <h3 class="blog-card-title">
                    <a href="/blog/${blog.slug || blog.id}.html">${blog.title}</a>
                </h3>
                <p class="blog-card-excerpt">${truncateText(blog.excerpt || '', 150)}</p>
                <div class="blog-card-footer">
                    <div class="blog-card-author">
                        <div class="author-avatar">
                            <img src="${blog.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(blog.author)}" 
                                 alt="${blog.author}">
                        </div>
                        <span class="author-name">${blog.author}</span>
                    </div>
                    <a href="/blog/${blog.slug || blog.id}.html" class="read-more">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Create category card HTML
function createCategoryCard(category) {
    return `
        <a href="/categories/${category.slug || category.id}.html" class="category-card">
            <div class="category-icon" style="background: ${category.color || '#E67E22'}20; color: ${category.color || '#E67E22'};">
                <i class="${category.icon || 'fas fa-book'}"></i>
            </div>
            <h3 class="category-name">${category.name}</h3>
            <p class="category-count">${category.bookCount || 0} Books</p>
        </a>
    `;
}

// Show loading spinner
function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

// Hide loading spinner
function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// Toggle favorite book
async function toggleFavorite(bookId) {
    if (!authManager.requireAuth()) return;
    
    const user = authManager.getUser();
    const userRef = db.collection('users').doc(user.uid);
    
    try {
        const doc = await userRef.get();
        const favorites = doc.data().favoriteBooks || [];
        
        if (favorites.includes(bookId)) {
            // Remove from favorites
            await userRef.update({
                favoriteBooks: firebase.firestore.FieldValue.arrayRemove(bookId)
            });
            authManager.showNotification('Removed from favorites', 'success');
            return false;
        } else {
            // Add to favorites
            await userRef.update({
                favoriteBooks: firebase.firestore.FieldValue.arrayUnion(bookId)
            });
            authManager.showNotification('Added to favorites', 'success');
            return true;
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        authManager.showNotification('Error updating favorites', 'error');
        return false;
    }
}

// Get user's favorite books
async function getUserFavorites() {
    if (!authManager.isSignedIn()) return [];
    
    const user = authManager.getUser();
    
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        return doc.data().favoriteBooks || [];
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
}

// Add book to reading list
async function addToReadingList(bookId) {
    if (!authManager.requireAuth()) return;
    
    const user = authManager.getUser();
    
    try {
        await db.collection('users').doc(user.uid).update({
            readingList: firebase.firestore.FieldValue.arrayUnion(bookId)
        });
        authManager.showNotification('Added to reading list', 'success');
    } catch (error) {
        console.error('Error adding to reading list:', error);
        authManager.showNotification('Error updating reading list', 'error');
    }
}

// Subscribe to newsletter
async function subscribeNewsletter(email) {
    try {
        await db.collection('newsletter').add({
            email: email,
            subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
            active: true
        });
        return true;
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        return false;
    }
}

// Increment book views
async function incrementBookViews(bookId) {
    try {
        const bookRef = db.collection('books').doc(bookId);
        await bookRef.update({
            views: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

// Increment blog views
async function incrementBlogViews(blogId) {
    try {
        const blogRef = db.collection('blogs').doc(blogId);
        await blogRef.update({
            views: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        authManager.showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

// Share on social media
function shareOnSocial(platform, url, title) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`
    };
    
    if (urls[platform]) {
        window.open(urls[platform], '_blank', 'width=600,height=400');
    }
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize tooltips (if using a tooltip library)
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    // Add tooltip functionality if needed
}

// Smooth scroll to element
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Export functions for use in other files
window.helpers = {
    debounce,
    formatNumber,
    truncateText,
    calculateReadingTime,
    generateStarRating,
    formatTimestamp,
    createBookCard,
    createBlogCard,
    createCategoryCard,
    showLoading,
    hideLoading,
    toggleFavorite,
    getUserFavorites,
    addToReadingList,
    subscribeNewsletter,
    incrementBookViews,
    incrementBlogViews,
    getUrlParameter,
    copyToClipboard,
    shareOnSocial,
    isValidEmail,
    sanitizeHTML,
    lazyLoadImages,
    smoothScrollTo
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
});
