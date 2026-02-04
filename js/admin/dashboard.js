/* ==========================================
   BOOKPANGO - Admin Dashboard
   ========================================== */

class AdminDashboard {
    constructor() {
        this.init();
    }

    async init() {
        // Check if user is admin
        if (!authManager.requireAdmin()) {
            return;
        }

        showLoading();

        try {
            await Promise.all([
                this.loadStats(),
                this.loadRecentBooks(),
                this.loadRecentComments(),
                this.loadPopularBooks(),
                this.loadPendingComments()
            ]);
            
            this.setupEventListeners();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
        } finally {
            hideLoading();
        }
    }

    setupEventListeners() {
        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('adminSidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Logout
        const logoutBtn = document.getElementById('adminLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                authManager.signOut();
            });
        }
    }

    async loadStats() {
        try {
            // Get current date and first day of month
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Total Books
            const booksSnapshot = await db.collection('books').get();
            const totalBooks = booksSnapshot.size;
            document.getElementById('totalBooks').textContent = helpers.formatNumber(totalBooks);

            // Books this month
            const booksThisMonth = await db.collection('books')
                .where('createdAt', '>=', firstDayOfMonth)
                .get();
            document.getElementById('booksChange').textContent = booksThisMonth.size;

            // Total Blogs
            const blogsSnapshot = await db.collection('blogs').get();
            const totalBlogs = blogsSnapshot.size;
            document.getElementById('totalBlogs').textContent = helpers.formatNumber(totalBlogs);

            // Blogs this month
            const blogsThisMonth = await db.collection('blogs')
                .where('createdAt', '>=', firstDayOfMonth)
                .get();
            document.getElementById('blogsChange').textContent = blogsThisMonth.size;

            // Total Comments
            const commentsSnapshot = await db.collection('comments').get();
            const totalComments = commentsSnapshot.size;
            document.getElementById('totalComments').textContent = helpers.formatNumber(totalComments);

            // Pending Comments
            const pendingComments = await db.collection('comments')
                .where('approved', '==', false)
                .get();
            document.getElementById('pendingComments').textContent = pendingComments.size;

            // Total Users
            const usersSnapshot = await db.collection('users').get();
            const totalUsers = usersSnapshot.size;
            document.getElementById('totalUsers').textContent = helpers.formatNumber(totalUsers);

            // Users this month
            const usersThisMonth = await db.collection('users')
                .where('createdAt', '>=', firstDayOfMonth)
                .get();
            document.getElementById('usersChange').textContent = usersThisMonth.size;

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadRecentBooks() {
        try {
            const snapshot = await db.collection('books')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            const table = document.getElementById('recentBooksTable');
            if (snapshot.empty) {
                table.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 40px;">
                            No books yet. <a href="/admin/add-book.html">Add your first book</a>
                        </td>
                    </tr>
                `;
                return;
            }

            table.innerHTML = snapshot.docs.map(doc => {
                const book = doc.data();
                return `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="${book.coverImage || '/images/placeholder.jpg'}" 
                                     alt="${book.title}"
                                     style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;">
                                <strong>${book.title}</strong>
                            </div>
                        </td>
                        <td>${book.author}</td>
                        <td>
                            <span style="background: var(--secondary-color); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem;">
                                ${book.categories?.[0] || 'Uncategorized'}
                            </span>
                        </td>
                        <td>${helpers.formatNumber(book.views || 0)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon btn-edit" onclick="window.location.href='/admin/edit-book.html?id=${doc.id}'">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="adminDashboard.deleteBook('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading recent books:', error);
        }
    }

    async loadRecentComments() {
        try {
            const snapshot = await db.collection('comments')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            const container = document.getElementById('recentCommentsList');
            
            if (snapshot.empty) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        No comments yet
                    </div>
                `;
                return;
            }

            container.innerHTML = snapshot.docs.map(doc => {
                const comment = doc.data();
                return `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="comment-author-name">${comment.userName}</span>
                            <span class="comment-time">${helpers.formatTimestamp(comment.createdAt)}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                        ${!comment.approved ? `
                            <div class="comment-actions">
                                <button class="btn-approve" onclick="adminDashboard.approveComment('${doc.id}')">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn-reject" onclick="adminDashboard.deleteComment('${doc.id}')">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading recent comments:', error);
        }
    }

    async loadPopularBooks() {
        try {
            const snapshot = await db.collection('books')
                .orderBy('views', 'desc')
                .limit(10)
                .get();

            const table = document.getElementById('popularBooksTable');
            
            if (snapshot.empty) {
                table.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px;">
                            No books yet
                        </td>
                    </tr>
                `;
                return;
            }

            table.innerHTML = snapshot.docs.map((doc, index) => {
                const book = doc.data();
                return `
                    <tr>
                        <td>
                            <strong style="color: var(--secondary-color); font-size: 1.25rem;">
                                #${index + 1}
                            </strong>
                        </td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="${book.coverImage || '/images/placeholder.jpg'}" 
                                     alt="${book.title}"
                                     style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;">
                                <div>
                                    <strong>${book.title}</strong>
                                    <div style="font-size: 0.75rem; color: var(--text-light);">
                                        by ${book.author}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>${book.categories?.[0] || 'Uncategorized'}</td>
                        <td><strong>${helpers.formatNumber(book.views || 0)}</strong></td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 5px;">
                                ${helpers.generateStarRating(book.rating || 0)}
                                <span style="font-weight: 600;">${(book.rating || 0).toFixed(1)}</span>
                            </div>
                        </td>
                        <td>${book.reviewCount || 0}</td>
                    </tr>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading popular books:', error);
        }
    }

    async loadPendingComments() {
        try {
            const snapshot = await db.collection('comments')
                .where('approved', '==', false)
                .get();

            const badge = document.getElementById('pendingCommentsBadge');
            if (badge) {
                badge.textContent = snapshot.size;
                badge.style.display = snapshot.size > 0 ? 'block' : 'none';
            }
        } catch (error) {
            console.error('Error loading pending comments:', error);
        }
    }

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
            return;
        }

        try {
            showLoading();

            // Delete book
            await db.collection('books').doc(bookId).delete();

            // Delete associated comments
            const comments = await db.collection('comments')
                .where('bookId', '==', bookId)
                .get();

            const batch = db.batch();
            comments.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            authManager.showNotification('Book deleted successfully', 'success');
            this.loadRecentBooks();
            this.loadStats();

        } catch (error) {
            console.error('Error deleting book:', error);
            authManager.showNotification('Error deleting book', 'error');
        } finally {
            hideLoading();
        }
    }

    async approveComment(commentId) {
        try {
            await db.collection('comments').doc(commentId).update({
                approved: true
            });

            authManager.showNotification('Comment approved', 'success');
            this.loadRecentComments();
            this.loadPendingComments();

        } catch (error) {
            console.error('Error approving comment:', error);
            authManager.showNotification('Error approving comment', 'error');
        }
    }

    async deleteComment(commentId) {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            await db.collection('comments').doc(commentId).delete();

            authManager.showNotification('Comment deleted', 'success');
            this.loadRecentComments();
            this.loadPendingComments();
            this.loadStats();

        } catch (error) {
            console.error('Error deleting comment:', error);
            authManager.showNotification('Error deleting comment', 'error');
        }
    }
}

// Initialize dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});
