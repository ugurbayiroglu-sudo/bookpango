/* ==========================================
   BOOKPANGO - Firebase Configuration
   ========================================== */

// Firebase Configuration
// IMPORTANT: Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > Firebase SDK snippet

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "bookpango.firebaseapp.com",
    projectId: "bookpango",
    storageBucket: "bookpango.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Firestore Settings
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Enable Offline Persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.log('Multiple tabs open, persistence enabled in first tab only');
        } else if (err.code === 'unimplemented') {
            console.log('Browser does not support persistence');
        }
    });

/* ==========================================
   SETUP INSTRUCTIONS
   ========================================== */

/*
1. Create Firebase Project:
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name it "BookPango"
   - Enable Google Analytics (optional)

2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Google" provider
   - Enable "Email/Password" provider
   - Add authorized domains: bookpango.com, www.bookpango.com

3. Create Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Start in "production mode"
   - Choose location (closest to your users)

4. Create Storage:
   - Go to Storage
   - Click "Get started"
   - Start in "production mode"

5. Get Configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps"
   - Click "Web" icon (</>)
   - Register app with nickname "bookpango-web"
   - Copy the firebaseConfig object
   - Replace the values above

6. Update Firestore Security Rules:
   Go to Firestore Database > Rules and paste:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }
    
    // Books collection
    match /books/{bookId} {
      allow read: if true; // Public reading
      allow create, update, delete: if isAdmin();
    }
    
    // Blogs collection
    match /blogs/{blogId} {
      allow read: if true; // Public reading
      allow create, update, delete: if isAdmin();
    }
    
    // Categories collection
    match /categories/{categoryId} {
      allow read: if true; // Public reading
      allow create, update, delete: if isAdmin();
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // Newsletter collection
    match /newsletter/{emailId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    
    // Stats collection
    match /stats/{statId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Affiliate clicks tracking
    match /affiliate-clicks/{clickId} {
      allow create: if true;
      allow read: if isAdmin();
    }
  }
}

7. Update Storage Security Rules:
   Go to Storage > Rules and paste:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAdmin() {
      return request.auth != null &&
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Book covers
    match /covers/{imageId} {
      allow read: if true; // Public reading
      allow write: if isAdmin();
    }
    
    // Blog images
    match /blog/{imageId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // User avatars
    match /avatars/{userId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

8. Set Admin User:
   After first user signs in, manually add admin role:
   - Go to Firestore Database
   - Find the users collection
   - Find your user document
   - Add field: role = "admin"

9. Index Creation (if needed):
   Firestore will show errors with index creation links.
   Click the links to auto-create required indexes.

*/

/* ==========================================
   Helper Functions
   ========================================== */

// Get current user
function getCurrentUser() {
    return auth.currentUser;
}

// Check if user is admin
async function isUserAdmin() {
    const user = getCurrentUser();
    if (!user) return false;
    
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        return doc.exists && doc.data().role === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Format timestamp
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Upload image to Storage
async function uploadImage(file, path) {
    try {
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const ref = storage.ref(`${path}/${filename}`);
        
        const snapshot = await ref.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// Track affiliate click
async function trackAffiliateClick(bookId, buttonId) {
    try {
        await db.collection('affiliate-clicks').add({
            bookId: bookId,
            buttonId: buttonId,
            userId: auth.currentUser?.uid || 'anonymous',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error tracking click:', error);
    }
}

// Export for use in other files
window.firebaseApp = {
    auth,
    db,
    storage,
    googleProvider,
    getCurrentUser,
    isUserAdmin,
    formatDate,
    generateSlug,
    uploadImage,
    trackAffiliateClick
};

console.log('Firebase initialized successfully');
