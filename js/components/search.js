/* ==========================================
   BOOKPANGO - Search Component
   ========================================== */

class SearchComponent {
    constructor() {
        this.isOpen = false;
        this.searchResults = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search toggle button
        const searchToggle = document.getElementById('searchToggle');
        const searchClose = document.getElementById('searchClose');
        
        if (searchToggle) {
            searchToggle.addEventListener('click', () => this.toggleSearch());
        }
        
        if (searchClose) {
            searchClose.addEventListener('click', () => this.closeSearch());
        }
        
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', helpers.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        window.location.href = `/books.html?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
        
        // Close search on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSearch();
            }
        });
    }

    toggleSearch() {
        if (this.isOpen) {
            this.closeSearch();
        } else {
            this.openSearch();
        }
    }

    openSearch() {
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBar) {
            searchBar.classList.remove('hidden');
            this.isOpen = true;
            
            // Focus input
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        }
    }

    closeSearch() {
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        if (searchBar) {
            searchBar.classList.add('hidden');
            this.isOpen = false;
        }
        
        if (searchInput) {
            searchInput.value = '';
        }
        
        if (searchResults) {
            searchResults.innerHTML = '';
        }
    }

    async handleSearch(query) {
        query = query.trim().toLowerCase();
        
        if (query.length < 2) {
            this.clearResults();
            return;
        }
        
        try {
            // Search books
            const booksPromise = this.searchBooks(query);
            
            // Search blogs
            const blogsPromise = this.searchBlogs(query);
            
            const [books, blogs] = await Promise.all([booksPromise, blogsPromise]);
            
            this.displayResults(books, blogs, query);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    async searchBooks(query) {
        try {
            // Search by title
            const titleResults = await db.collection('books')
                .orderBy('title')
                .startAt(query)
                .endAt(query + '\uf8ff')
                .limit(5)
                .get();
            
            const books = [];
            titleResults.forEach(doc => {
                books.push({ id: doc.id, ...doc.data() });
            });
            
            // Also search by author if not enough results
            if (books.length < 5) {
                const authorResults = await db.collection('books')
                    .where('author', '>=', query)
                    .where('author', '<=', query + '\uf8ff')
                    .limit(5 - books.length)
                    .get();
                
                authorResults.forEach(doc => {
                    const bookData = { id: doc.id, ...doc.data() };
                    // Avoid duplicates
                    if (!books.find(b => b.id === doc.id)) {
                        books.push(bookData);
                    }
                });
            }
            
            return books;
        } catch (error) {
            console.error('Error searching books:', error);
            return [];
        }
    }

    async searchBlogs(query) {
        try {
            const snapshot = await db.collection('blogs')
                .orderBy('title')
                .startAt(query)
                .endAt(query + '\uf8ff')
                .limit(3)
                .get();
            
            const blogs = [];
            snapshot.forEach(doc => {
                blogs.push({ id: doc.id, ...doc.data() });
            });
            
            return blogs;
        } catch (error) {
            console.error('Error searching blogs:', error);
            return [];
        }
    }

    displayResults(books, blogs, query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        if (books.length === 0 && blogs.length === 0) {
            resultsContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }
        
        let html = '<div style="padding: 20px;">';
        
        // Books section
        if (books.length > 0) {
            html += '<h4 style="margin-bottom: 15px; color: var(--primary-color);">Books</h4>';
            html += '<div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">';
            
            books.forEach(book => {
                html += `
                    <a href="/books/${book.slug || book.id}.html" 
                       class="search-result-item"
                       style="display: flex; gap: 15px; padding: 10px; border-radius: var(--radius-md); 
                              background: var(--bg-secondary); transition: all 0.2s;">
                        <img src="${book.coverImage || '/images/placeholder.jpg'}" 
                             alt="${book.title}"
                             style="width: 60px; height: 90px; object-fit: cover; border-radius: var(--radius-sm);">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 5px;">
                                ${this.highlightQuery(book.title, query)}
                            </div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                by ${this.highlightQuery(book.author, query)}
                            </div>
                        </div>
                    </a>
                `;
            });
            
            html += '</div>';
        }
        
        // Blogs section
        if (blogs.length > 0) {
            html += '<h4 style="margin-bottom: 15px; color: var(--primary-color);">Blog Posts</h4>';
            html += '<div style="display: flex; flex-direction: column; gap: 10px;">';
            
            blogs.forEach(blog => {
                html += `
                    <a href="/blog/${blog.slug || blog.id}.html" 
                       class="search-result-item"
                       style="display: flex; gap: 15px; padding: 10px; border-radius: var(--radius-md); 
                              background: var(--bg-secondary); transition: all 0.2s;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 5px;">
                                ${this.highlightQuery(blog.title, query)}
                            </div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                ${helpers.formatTimestamp(blog.publishedAt)}
                            </div>
                        </div>
                    </a>
                `;
            });
            
            html += '</div>';
        }
        
        // View all results link
        html += `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--gray-200); text-align: center;">
                <a href="/books.html?search=${encodeURIComponent(query)}" 
                   style="color: var(--secondary-color); font-weight: 600;">
                    View all results <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        
        html += '</div>';
        
        resultsContainer.innerHTML = html;
    }

    highlightQuery(text, query) {
        if (!text) return '';
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--secondary-color); color: white; padding: 2px 4px; border-radius: 2px;">$1</mark>');
    }

    clearResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }
}

// Add hover styles for search results
const searchStyles = `
    .search-result-item:hover {
        background: var(--bg-tertiary) !important;
        transform: translateX(5px);
    }
`;

const style = document.createElement('style');
style.textContent = searchStyles;
document.head.appendChild(style);

// Initialize search component
document.addEventListener('DOMContentLoaded', () => {
    new SearchComponent();
});

// Export for use in other files
window.searchComponent = SearchComponent;
