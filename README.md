# 📚 BookPango - Book Review & Recommendation Platform

A modern, minimalist book review and recommendation website built with HTML, CSS, JavaScript, and Firebase. Features include user authentication, admin panel, blog system, and affiliate marketing capabilities.

## 🌟 Features

### User Features
- 🔐 **Authentication** - Google OAuth & Email/Password sign-in
- 📖 **Book Browsing** - Search, filter, and discover thousands of books
- ⭐ **Reviews & Ratings** - Read and write book reviews
- ❤️ **Favorites** - Save favorite books to your profile
- 📝 **Reading List** - Track books you want to read
- 📰 **Blog** - Read articles about books and literature
- 🎨 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works perfectly on all devices

### Admin Features
- 📊 **Dashboard** - View site statistics and analytics
- ➕ **Book Management** - Add, edit, and delete books
- 🖼️ **Image Upload** - Upload book covers to Firebase Storage
- 🏷️ **Category Management** - Create and manage book categories
- ✍️ **Blog Management** - Create and publish blog posts
- 💬 **Comment Moderation** - Approve or reject user comments
- 🔗 **Affiliate Links** - Add customizable affiliate buttons
- 📈 **Statistics** - Track views, clicks, and user engagement

### Technical Features
- 🔥 **Firebase Backend** - Firestore Database, Authentication, Storage
- 🎯 **SEO Optimized** - Meta tags, Schema.org, sitemap
- ⚡ **Fast Loading** - Lazy loading, optimized assets
- 🛡️ **Secure** - Firebase security rules, XSS protection
- 📊 **Analytics Ready** - Google Analytics integration
- 🌍 **Multilingual Ready** - Easy to add more languages

## 🚀 Quick Start

### Prerequisites
- A Firebase account (free tier is sufficient)
- A GitHub account (for hosting)
- Basic knowledge of HTML/CSS/JavaScript
- Text editor (VS Code recommended)

### 1. Clone or Download

Download this project or clone it:
```bash
git clone https://github.com/yourusername/bookpango.git
cd bookpango
```

### 2. Firebase Setup

#### A. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "BookPango"
4. Enable Google Analytics (optional)

#### B. Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
   - Add your email as test user
3. Enable **Email/Password** provider
4. Add authorized domains:
   - `localhost` (for testing)
   - `bookpango.github.io` (your GitHub Pages URL)
   - `bookpango.com` (your custom domain)

#### C. Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode**
4. Select your location (closest to your users)
5. Click "Enable"

#### D. Setup Storage
1. Go to **Storage**
2. Click "Get started"
3. Use default security rules for now
4. Click "Done"

#### E. Get Configuration
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps"
3. Click the **</>** (Web) icon
4. Register app with nickname "bookpango-web"
5. Copy the `firebaseConfig` object

#### F. Update Configuration
Open `js/config/firebase-config.js` and replace:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "bookpango.firebaseapp.com",
    projectId: "bookpango",
    storageBucket: "bookpango.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

#### G. Update Firestore Security Rules
Go to **Firestore Database** → **Rules** and paste:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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
    
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }
    
    match /books/{bookId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    match /blogs/{blogId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    match /comments/{commentId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    match /newsletter/{emailId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    
    match /stats/{statId} {
      allow read, write: if isAdmin();
    }
    
    match /affiliate-clicks/{clickId} {
      allow create: if true;
      allow read: if isAdmin();
    }
  }
}
```

#### H. Update Storage Security Rules
Go to **Storage** → **Rules** and paste:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null &&
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /covers/{imageId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /blog/{imageId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /avatars/{userId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. GitHub Pages Setup

#### A. Create Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it: `bookpango`
4. Make it **Public**
5. Don't initialize with README (we have one)

#### B. Push Code
```bash
cd bookpango
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/bookpango.git
git push -u origin main
```

#### C. Enable GitHub Pages
1. Go to repository **Settings**
2. Scroll to **Pages** section
3. Source: **Deploy from branch**
4. Branch: **main** → **/ (root)**
5. Click **Save**
6. Your site will be live at: `https://yourusername.github.io/bookpango/`

### 4. Custom Domain Setup (www.bookpango.com)

#### A. Configure GitHub Pages
1. In GitHub Pages settings
2. Add custom domain: `www.bookpango.com`
3. Check "Enforce HTTPS"

#### B. Configure DNS (at your domain registrar)
Add these DNS records:
```
Type: CNAME
Name: www
Value: yourusername.github.io

Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

#### C. Wait for DNS Propagation
- Can take 24-48 hours
- Check status at: https://www.whatsmydns.net/

### 5. Set Admin User

1. Sign in to your site (use Google or Email)
2. Go to [Firestore Console](https://console.firebase.google.com/)
3. Open **Firestore Database**
4. Find `users` collection
5. Find your user document
6. Click **Edit**
7. Add new field:
   - Field: `role`
   - Type: `string`
   - Value: `admin`
8. Save

Now you can access `/admin/` panel! 🎉

## 📖 Usage Guide

### Adding Your First Book

1. Sign in with admin account
2. Go to `/admin/` or click "Admin" in navigation
3. Click "Add Book" button
4. Fill in the form:
   - **Title**: Book title
   - **Author**: Author name
   - **Description**: Book summary
   - **Cover Image**: Upload book cover
   - **Categories**: Select categories
   - **ISBN**: (optional) Book ISBN
   - **Publisher**: (optional) Publisher name
   - **Published Date**: (optional) Release date

5. **Add Affiliate Buttons**:
   - Click "Add Affiliate Button"
   - Enter button text (e.g., "Buy on Amazon")
   - Enter affiliate URL
   - Choose button color
   - Choose text color
   - Select icon (optional)

6. **SEO Settings**:
   - Meta Title: For search engines
   - Meta Description: Short description (150-160 chars)
   - Keywords: Comma-separated (e.g., "fiction, bestseller")

7. Click "Publish Book"

### Creating a Blog Post

1. Go to `/admin/blogs.html`
2. Click "Add Blog Post"
3. Fill in:
   - **Title**: Post title
   - **Content**: Use the editor for formatting
   - **Featured Image**: Upload header image
   - **Excerpt**: Short summary
   - **Categories**: Select blog categories
   - **Tags**: Add relevant tags

4. Click "Publish Post"

### Managing Categories

1. Go to `/admin/categories.html`
2. Click "Add Category"
3. Enter:
   - **Name**: Category name (e.g., "Fiction", "Comedy Books")
   - **Slug**: URL-friendly name (e.g., "fiction", "comedy-books")
   - **Description**: Category description
   - **Icon**: Font Awesome icon class (e.g., "fa-book")
   - **Color**: Hex color code (e.g., "#E67E22")
   - **Type**: Book or Blog category

4. Click "Create Category"

### Moderating Comments

1. Go to `/admin/comments.html`
2. See all pending comments
3. Click "Approve" or "Reject"
4. Rejected comments are deleted

## 🎨 Customization

### Colors
Edit `css/main.css` - CSS Variables section:
```css
:root {
    --primary-color: #2C3E50;    /* Dark blue */
    --secondary-color: #E67E22;  /* Orange */
    --accent-color: #3498DB;     /* Light blue */
}
```

### Fonts
Edit Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap" rel="stylesheet">
```

Then update CSS:
```css
:root {
    --font-heading: 'Your Heading Font', serif;
    --font-body: 'Your Body Font', sans-serif;
}
```

### Logo
Replace logo text in navigation:
```html
<a href="/" class="logo">
    <i class="fas fa-book-open"></i>
    <span>Your Site Name</span>
</a>
```

## 📊 SEO Optimization

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://www.bookpango.com`
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `https://www.bookpango.com/sitemap.xml`

### Google Analytics
1. Create [Google Analytics](https://analytics.google.com/) account
2. Get Measurement ID
3. Add to `index.html` before `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Sitemap Generation
Create `sitemap.xml` in root:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.bookpango.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.bookpango.com/books.html</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

## 🐛 Troubleshooting

### Firebase Errors
- **Permission Denied**: Check Firestore rules
- **Network Error**: Check Firebase config
- **Storage Failed**: Check Storage rules

### Admin Access Issues
- Make sure `role: 'admin'` is set in Firestore
- Clear browser cache
- Check browser console for errors

### GitHub Pages Not Working
- Wait 5-10 minutes after pushing
- Check Actions tab for build errors
- Ensure repository is public

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@bookpango.com

## 🎉 Credits

Built with:
- [Firebase](https://firebase.google.com/)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)

---

Made with ❤️ for book lovers worldwide
