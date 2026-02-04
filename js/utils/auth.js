/* ==========================================
   BOOKPANGO - Authentication Utilities
   ========================================== */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        // Listen for auth state changes
        auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            
            if (user) {
                await this.handleUserSignIn(user);
            } else {
                this.handleUserSignOut();
            }
        });

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }

        // Google sign in
        const googleSignInBtn = document.getElementById('googleSignInBtn');
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', () => this.signInWithGoogle());
        }

        // Email sign in form
        const emailForm = document.getElementById('emailSignInForm');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => this.handleEmailSignIn(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.signOut());
        }

        // Modal close
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalClose) modalClose.addEventListener('click', () => this.hideLoginModal());
        if (modalOverlay) modalOverlay.addEventListener('click', () => this.hideLoginModal());

        // Show signup (for future implementation)
        const showSignUpBtn = document.getElementById('showSignUpBtn');
        if (showSignUpBtn) {
            showSignUpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignUpForm();
            });
        }
    }

    // Google Sign In
    async signInWithGoogle() {
        try {
            const result = await auth.signInWithPopup(googleProvider);
            const user = result.user;
            
            // Create or update user document
            await this.createUserDocument(user);
            
            this.hideLoginModal();
            this.showNotification('Successfully signed in!', 'success');
        } catch (error) {
            console.error('Google sign in error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // Email Sign In
    async handleEmailSignIn(e) {
        e.preventDefault();
        
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;

        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            const user = result.user;
            
            await this.createUserDocument(user);
            
            this.hideLoginModal();
            this.showNotification('Successfully signed in!', 'success');
        } catch (error) {
            console.error('Email sign in error:', error);
            
            // If user doesn't exist, create account
            if (error.code === 'auth/user-not-found') {
                try {
                    const result = await auth.createUserWithEmailAndPassword(email, password);
                    const user = result.user;
                    
                    await this.createUserDocument(user);
                    
                    this.hideLoginModal();
                    this.showNotification('Account created successfully!', 'success');
                } catch (createError) {
                    console.error('Account creation error:', createError);
                    this.showNotification(createError.message, 'error');
                }
            } else {
                this.showNotification(error.message, 'error');
            }
        }
    }

    // Create or update user document in Firestore
    async createUserDocument(user) {
        const userRef = db.collection('users').doc(user.uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            // Create new user document
            await userRef.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || '',
                favoriteBooks: [],
                favoriteBlogs: [],
                readingList: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update last login
            await userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    // Handle user sign in
    async handleUserSignIn(user) {
        // Check if user is admin
        this.isAdmin = await firebaseApp.isUserAdmin();
        
        // Update UI
        this.updateUIForSignedInUser(user);
        
        // Show admin link if admin
        if (this.isAdmin) {
            this.showAdminLink();
        }
    }

    // Handle user sign out
    handleUserSignOut() {
        this.isAdmin = false;
        this.updateUIForSignedOutUser();
        this.hideAdminLink();
    }

    // Update UI for signed in user
    updateUIForSignedInUser(user) {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            
            // Set user avatar
            const avatarImg = document.getElementById('userAvatarImg');
            if (avatarImg && user.photoURL) {
                avatarImg.src = user.photoURL;
            } else if (avatarImg) {
                // Default avatar
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=E67E22&color=fff`;
            }
        }
    }

    // Update UI for signed out user
    updateUIForSignedOutUser() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }

    // Show admin link in navigation
    showAdminLink() {
        const navMenu = document.getElementById('navMenu');
        if (navMenu && !document.getElementById('adminLink')) {
            const adminLink = document.createElement('a');
            adminLink.href = '/admin/index.html';
            adminLink.className = 'nav-link';
            adminLink.id = 'adminLink';
            adminLink.innerHTML = '<i class="fas fa-cog"></i> Admin';
            adminLink.style.color = 'var(--secondary-color)';
            navMenu.appendChild(adminLink);
        }
    }

    // Hide admin link
    hideAdminLink() {
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.remove();
        }
    }

    // Sign out
    async signOut() {
        try {
            await auth.signOut();
            this.showNotification('Successfully signed out', 'success');
            
            // Redirect to home if on admin page
            if (window.location.pathname.includes('/admin/')) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Sign out error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // Show login modal
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    // Hide login modal
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    // Show signup form (for future implementation)
    showSignUpForm() {
        alert('Sign up form coming soon! For now, use Google sign in or enter email/password to create an account.');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--accent-color)'};
            color: white;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Check if user is signed in
    isSignedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getUser() {
        return this.currentUser;
    }

    // Check if current user is admin
    checkIsAdmin() {
        return this.isAdmin;
    }

    // Require authentication
    requireAuth() {
        if (!this.isSignedIn()) {
            this.showLoginModal();
            return false;
        }
        return true;
    }

    // Require admin
    requireAdmin() {
        if (!this.isSignedIn()) {
            this.showNotification('Please sign in first', 'error');
            this.showLoginModal();
            return false;
        }
        
        if (!this.checkIsAdmin()) {
            this.showNotification('Admin access required', 'error');
            window.location.href = '/';
            return false;
        }
        
        return true;
    }
}

// Add notification animations to page
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize auth manager
const authManager = new AuthManager();

// Export for use in other files
window.authManager = authManager;
