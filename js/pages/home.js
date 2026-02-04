/* ==========================================
   BOOKPANGO - Home Page
   ========================================== */

class HomePage {
    constructor() {
        this.featuredBooks = [];
        this.newReleases = [];
        this.latestBlogs = [];
        this.categories = [];
        this.init();
    }

    async init() {
        try {
            showLoading();
            
            // Load all data
            await Promise.all([
                this.loadFeaturedBooks(),
                this.loadNewReleases(),
                this.loadLatestBlogs(),
                this.loadCategories(),
                this.loadStats()
            ]);
            
            // Setup event listeners
            this.setupEventListeners();
            
            hideLoading();
        } catch (error) {
            console.error('Error initializing home page:', error);
            hideLoading();
        }
    }

    async loadFeaturedBooks() {
        try {
            const snapshot = await db.collection('books')
                .where('featured', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            this.featuredBooks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderFeaturedBooks();
        } catch (error) {
            console.error('Error loading featured books:', error);
            // If no featured books, load latest books
            this.loadLatestBooksAsFeatured();
        }
    }

    async loadLatestBooksAsFeatured() {
        try {
            const snapshot = await db.collection('books')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            this.featuredBooks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderFeaturedBooks();
        } catch (error) {
            console.error('Error loading latest books:', error);
        }
    }

    renderFeaturedBooks() {
        const slider = document.getElementById('featuredSlider');
        if (!slider) return;
        
        if (this.featuredBooks.length === 0) {
            slider.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px;">No featured books yet. Check back soon!</p>';
            return;
        }
        
        slider.innerHTML = this.featuredBooks
            .map(book => `
                <div class="featured-slide">
                    ${helpers.createBookCard(book)}
                </div>
            `)
            .join('');
        
        // Add favorite button listeners
        this.attachFavoriteListeners();
    }

    async loadNewReleases() {
        try {
            const snapshot = await db.collection('books')
                .orderBy('createdAt', 'desc')
                .limit(8)
                .get();
            
            this.newReleases = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderNewReleases();
        } catch (error) {
            console.error('Error loading new releases:', error);
        }
    }

    renderNewReleases() {
        const grid = document.getElementById('newReleasesGrid');
        if (!grid) return;
        
        if (this.newReleases.length === 0) {
            grid.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px;">No books yet. Check back soon!</p>';
            return;
        }
        
        grid.innerHTML = this.newReleases
            .map(book => helpers.createBookCard(book))
            .join('');
        
        // Add favorite button listeners
        this.attachFavoriteListeners();
    }

    async loadLatestBlogs() {
        try {
            const snapshot = await db.collection('blogs')
                .orderBy('publishedAt', 'desc')
                .limit(3)
                .get();
            
            this.latestBlogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderLatestBlogs();
        } catch (error) {
            console.error('Error loading latest blogs:', error);
        }
    }

    renderLatestBlogs() {
        const grid = document.getElementById('blogGrid');
        if (!grid) return;
        
        if (this.latestBlogs.length === 0) {
            grid.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px;">No blog posts yet. Check back soon!</p>';
            return;
        }
        
        grid.innerHTML = this.latestBlogs
            .map(blog => helpers.createBlogCard(blog))
            .join('');
    }

    async loadCategories() {
        try {
            const snapshot = await db.collection('categories')
                .where('type', '==', 'book')
                .orderBy('bookCount', 'desc')
                .limit(8)
                .get();
            
            this.categories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderCategories();
            this.renderFooterCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;
        
        if (this.categories.length === 0) {
            grid.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px;">No categories yet.</p>';
            return;
        }
        
        grid.innerHTML = this.categories
            .map(category => helpers.createCategoryCard(category))
            .join('');
    }

    renderFooterCategories() {
        const footerCategories = document.getElementById('footerCategories');
        if (!footerCategories) return;
        
        const topCategories = this.categories.slice(0, 4);
        
        footerCategories.innerHTML = topCategories
            .map(category => `
                <li><a href="/categories/${category.slug || category.id}.html">${category.name}</a></li>
            `)
            .join('');
    }

    async loadStats() {
        try {
            // Get total books count
            const booksSnapshot = await db.collection('books').get();
            const totalBooks = booksSnapshot.size;
            
            // Get total blogs count
            const blogsSnapshot = await db.collection('blogs').get();
            const totalBlogs = blogsSnapshot.size;
            
            // Get total reviews count
            const commentsSnapshot = await db.collection('comments').get();
            const totalReviews = commentsSnapshot.size;
            
            // Animate counters
            this.animateCounter('totalBooks', totalBooks);
            this.animateCounter('totalBlogs', totalBlogs);
            this.animateCounter('totalReviews', totalReviews);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    animateCounter(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = helpers.formatNumber(Math.floor(current));
        }, duration / steps);
    }

    setupEventListeners() {
        // Featured slider controls
        const sliderPrev = document.getElementById('sliderPrev');
        const sliderNext = document.getElementById('sliderNext');
        const slider = document.getElementById('featuredSlider');
        
        if (sliderPrev && slider) {
            sliderPrev.addEventListener('click', () => {
                slider.scrollBy({ left: -320, behavior: 'smooth' });
            });
        }
        
        if (sliderNext && slider) {
            sliderNext.addEventListener('click', () => {
                slider.scrollBy({ left: 320, behavior: 'smooth' });
            });
        }
        
        // Hero search
        const heroSearch = document.getElementById('heroSearch');
        if (heroSearch) {
            heroSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = heroSearch.value.trim();
                    if (query) {
                        window.location.href = `/books.html?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
        
        // Newsletter form
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }
    }

    async handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value.trim();
        
        if (!helpers.isValidEmail(email)) {
            authManager.showNotification('Please enter a valid email', 'error');
            return;
        }
        
        try {
            // Check if email already exists
            const snapshot = await db.collection('newsletter')
                .where('email', '==', email)
                .get();
            
            if (!snapshot.empty) {
                authManager.showNotification('This email is already subscribed!', 'info');
                emailInput.value = '';
                return;
            }
            
            // Subscribe
            const success = await helpers.subscribeNewsletter(email);
            
            if (success) {
                authManager.showNotification('Successfully subscribed to newsletter!', 'success');
                emailInput.value = '';
            } else {
                authManager.showNotification('Error subscribing. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            authManager.showNotification('Error subscribing. Please try again.', 'error');
        }
    }

    attachFavoriteListeners() {
        const favoriteButtons = document.querySelectorAll('.book-card-favorite');
        
        favoriteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const bookId = button.dataset.bookId;
                const isFavorite = await helpers.toggleFavorite(bookId);
                
                // Update button state
                const icon = button.querySelector('i');
                if (isFavorite) {
                    button.classList.add('active');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    button.classList.remove('active');
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            });
        });
    }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});
