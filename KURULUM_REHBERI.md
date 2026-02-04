# 🚀 BookPango Kurulum Rehberi (Türkçe)

## 📋 İçindekiler
1. [Firebase Kurulumu](#firebase-kurulumu)
2. [GitHub Yükleme](#github-yükleme)
3. [Domain Bağlama](#domain-bağlama)
4. [Admin Yetkisi Verme](#admin-yetkisi-verme)
5. [İlk Kitabı Ekleme](#ilk-kitabı-ekleme)

---

## 🔥 Firebase Kurulumu

### Adım 1: Firebase Projesi Oluşturma
1. https://console.firebase.google.com/ adresine gidin
2. "Proje ekle" veya "Add project" butonuna tıklayın
3. Proje adı: **BookPango** yazın
4. Google Analytics'i aktif edin (isteğe bağlı)
5. "Proje oluştur" butonuna tıklayın

### Adım 2: Authentication (Kimlik Doğrulama) Kurulumu
1. Sol menüden **Authentication** (Kimlik Doğrulama) seçin
2. **Sign-in method** (Oturum açma yöntemi) sekmesine gidin
3. **Google** seçeneğini aktif edin:
   - Enable/Etkinleştir butonuna tıklayın
   - Proje destek e-postanızı seçin
   - Kaydet
4. **Email/Password** (E-posta/Şifre) seçeneğini aktif edin
5. **Authorized domains** (Yetkili alan adları) kısmına ekleyin:
   - `localhost` (test için)
   - `bookpango.github.io` (GitHub Pages için)
   - `bookpango.com` ve `www.bookpango.com` (özel domain)

### Adım 3: Firestore Database Kurulumu
1. Sol menüden **Firestore Database** seçin
2. "Veritabanı oluştur" veya "Create database" butonuna tıklayın
3. **Production mode** (Üretim modu) seçin
4. Location: **eur3 (europe-west)** seçin (size en yakın lokasyon)
5. "Enable" (Etkinleştir) butonuna tıklayın

### Adım 4: Storage Kurulumu
1. Sol menüden **Storage** seçin
2. "Get started" (Başla) butonuna tıklayın
3. Varsayılan güvenlik kurallarını kabul edin
4. "Done" (Tamam) butonuna tıklayın

### Adım 5: Firebase Config Alma
1. Sol menüden **Project Settings** (Proje Ayarları) → **General** (Genel) seçin
2. Aşağı kaydırın, "Your apps" (Uygulamalarınız) bölümünü bulun
3. **Web** ikonuna `</>` tıklayın
4. App nickname: **bookpango-web** yazın
5. "Register app" (Uygulamayı kaydet) butonuna tıklayın
6. `firebaseConfig` nesnesini kopyalayın (aşağıdaki gibi görünecek):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bookpango.firebaseapp.com",
  projectId: "bookpango",
  storageBucket: "bookpango.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxx"
};
```

### Adım 6: Config Dosyasını Güncelleme
1. Proje klasöründe `js/config/firebase-config.js` dosyasını açın
2. Kopyaladığınız config'i yapıştırın
3. Dosyayı kaydedin

### Adım 7: Firestore Güvenlik Kuralları
1. **Firestore Database** → **Rules** (Kurallar) sekmesine gidin
2. Aşağıdaki kuralları yapıştırın:

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
  }
}
```

3. "Publish" (Yayınla) butonuna tıklayın

### Adım 8: Storage Güvenlik Kuralları
1. **Storage** → **Rules** (Kurallar) sekmesine gidin
2. Aşağıdaki kuralları yapıştırın:

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
  }
}
```

3. "Publish" (Yayınla) butonuna tıklayın

---

## 📤 GitHub Yükleme

### Adım 1: GitHub Repository Oluşturma
1. https://github.com/ adresine gidin
2. Sağ üstteki **+** işaretine tıklayın
3. **New repository** seçin
4. Repository adı: **bookpango** yazın
5. **Public** (Herkese açık) seçin
6. "Create repository" butonuna tıklayın

### Adım 2: Kodu GitHub'a Yükleme

**Yöntem 1: GitHub Desktop (Kolay)**
1. GitHub Desktop uygulamasını indirin
2. "Add local repository" seçin
3. BookPango klasörünü seçin
4. Commit message: "Initial commit" yazın
5. "Commit to main" butonuna tıklayın
6. "Publish repository" butonuna tıklayın

**Yöntem 2: Komut Satırı**
```bash
cd bookpango
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICIADI/bookpango.git
git push -u origin main
```

### Adım 3: GitHub Pages Aktifleştirme
1. Repository'nizde **Settings** (Ayarlar) sekmesine gidin
2. Sol menüden **Pages** seçin
3. **Source** (Kaynak) kısmında:
   - Branch: **main**
   - Folder: **/ (root)**
4. **Save** (Kaydet) butonuna tıklayın
5. 5-10 dakika bekleyin
6. Siteniz yayında: `https://KULLANICIADI.github.io/bookpango/`

---

## 🌐 Domain Bağlama (www.bookpango.com)

### Adım 1: GitHub Pages'e Domain Ekleme
1. Repository **Settings** → **Pages**
2. **Custom domain** kısmına: `www.bookpango.com` yazın
3. **Save** butonuna tıklayın
4. **Enforce HTTPS** kutucuğunu işaretleyin (birkaç dakika sonra)

### Adım 2: DNS Ayarları (Domain Sağlayıcınızda)

Domain sağlayıcınızın kontrol paneline gidin (GoDaddy, Namecheap, vb.) ve bu kayıtları ekleyin:

**CNAME Kaydı:**
```
Type: CNAME
Name: www
Value: KULLANICIADI.github.io
TTL: 3600
```

**A Kayıtları:**
```
Type: A
Name: @ (veya boş)
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @ (veya boş)
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @ (veya boş)
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @ (veya boş)
Value: 185.199.111.153
TTL: 3600
```

### Adım 3: DNS Yayılımını Bekleyin
- DNS güncellemesi 24-48 saat sürebilir
- Kontrol etmek için: https://www.whatsmydns.net/
- Domain'inizi yazın ve yeşil tik işaretlerini görene kadar bekleyin

---

## 👑 Admin Yetkisi Verme

### Adım 1: İlk Kayıt
1. Sitenize gidin: `www.bookpango.com`
2. Sağ üstteki **Sign In** butonuna tıklayın
3. **Google ile giriş** veya **E-posta/Şifre** ile kayıt olun

### Adım 2: Firestore'da Admin Yetkisi Verme
1. https://console.firebase.google.com/ adresine gidin
2. **Firestore Database** seçin
3. **users** koleksiyonunu açın
4. Kendi kullanıcı belgenizi bulun (e-postanızla)
5. Belgenin üzerine tıklayın
6. **Add field** (Alan ekle) butonuna tıklayın
7. Şu bilgileri girin:
   - Field: `role`
   - Type: `string`
   - Value: `admin`
8. **Add** (Ekle) butonuna tıklayın

### Adım 3: Admin Paneline Erişim
1. Sayfayı yenileyin (F5)
2. Navigasyonda **Admin** linki görünecek
3. Admin paneline girin: `www.bookpango.com/admin/`

🎉 **Tebrikler! Artık admin olarak sisteme giriş yapabilirsiniz!**

---

## 📚 İlk Kitabı Ekleme

### Adım 1: Admin Paneline Girin
1. `www.bookpango.com/admin/` adresine gidin
2. Dashboard'u görüyorsanız her şey hazır!

### Adım 2: Kategori Oluşturma (Opsiyonel ama Önerilen)
1. Sol menüden **Categories** seçin
2. **Add Category** butonuna tıklayın
3. Bilgileri girin:
   - **Name**: Kategori adı (örn: "Fiction", "Comedy Books")
   - **Slug**: URL-dostu ad (örn: "fiction", "comedy-books")
   - **Description**: Kısa açıklama
   - **Icon**: Font Awesome ikonu (örn: "fa-book", "fa-laugh")
   - **Color**: Renk kodu (örn: "#E67E22")
   - **Type**: "book" seçin
4. **Create Category** butonuna tıklayın

### Adım 3: Kitap Ekleme
1. **Dashboard** → **Add Book** butonuna tıklayın
2. **Temel Bilgiler:**
   - **Title** (Kitap Adı): Örn: "The Great Gatsby"
   - **Author** (Yazar): Örn: "F. Scott Fitzgerald"
   - **Description** (Açıklama): Kitap hakkında özet
   - **Cover Image** (Kapak Resmi): Dosya seçin ve yükleyin

3. **Detay Bilgiler:**
   - **Categories** (Kategoriler): Oluşturduğunuz kategorileri seçin
   - **ISBN**: (opsiyonel) Kitabın ISBN numarası
   - **Publisher** (Yayınevi): (opsiyonel) Örn: "Penguin Books"
   - **Published Date** (Yayın Tarihi): (opsiyonel)
   - **Page Count** (Sayfa Sayısı): (opsiyonel)

4. **Affiliate Butonlar** (Önemli!):
   - **Add Affiliate Button** butonuna tıklayın
   - **Button Text**: Örn: "Amazon'dan Satın Al"
   - **Affiliate URL**: Tam affiliate linkiniz (https://...)
   - **Button Color**: Renk seçin (örn: turuncu #FF9900)
   - **Text Color**: Metin rengi (örn: beyaz #FFFFFF)
   - **Icon**: Ikon seçin (örn: "fa-shopping-cart")
   - Birden fazla buton ekleyebilirsiniz (Amazon, D&R, Kitapyurdu, vb.)

5. **SEO Ayarları:**
   - **Meta Title**: Örn: "The Great Gatsby - F. Scott Fitzgerald | BookPango"
   - **Meta Description**: 150-160 karakter (arama motorları için)
   - **Keywords**: Örn: "classic fiction, american literature, 1920s"

6. **Diğer Seçenekler:**
   - **Featured**: Bu kitabı anasayfada öne çıkar
   - **Allow Comments**: Yorumlara izin ver

7. **Publish Book** butonuna tıklayın

### Adım 4: Sonucu Kontrol Edin
1. Anasayfaya dönün: `www.bookpango.com`
2. Kitabınızı görüyor musunuz?
3. Kitap detay sayfasına girin
4. Affiliate butonları çalışıyor mu test edin

---

## 🎨 Özelleştirme İpuçları

### Site Renklerini Değiştirmek
`css/main.css` dosyasını açın ve şu değişkenleri değiştirin:
```css
:root {
    --primary-color: #2C3E50;    /* Ana renk */
    --secondary-color: #E67E22;  /* İkincil renk (turuncu) */
    --accent-color: #3498DB;     /* Vurgu rengi */
}
```

### Site Logosunu Değiştirmek
`index.html` ve diğer sayfalarda şu kısmı bulun:
```html
<span>BookPango</span>
```
Bunu kendi site adınızla değiştirin.

### Footeri Özelleştirmek
`index.html` dosyasının footer bölümünde sosyal medya linklerini güncelleyin.

---

## ❓ Sık Sorulan Sorular

### Siteye Giriş Yapamıyorum
- Firebase Authentication'ın aktif olduğundan emin olun
- Authorized domains listesine domain'inizi eklediniz mi?
- Tarayıcı console'unda hata var mı kontrol edin (F12)

### Admin Paneline Erişemiyorum
- Firestore'da `role: 'admin'` alanını eklediniz mi?
- Sayfayı yenileyin (F5) ve tekrar deneyin
- Çıkış yapıp tekrar giriş yapın

### Kitap Kapak Resmi Yüklenmiyor
- Firebase Storage'ın aktif olduğundan emin olun
- Storage security rules'u doğru yazdınız mı?
- Resim boyutu 5MB'dan küçük mü?

### Site Yavaş Yükleniyor
- Firebase'in ücretsiz planında limitlere dikkat edin
- Resimleri optimize edin (WebP formatı önerilir)
- Lazy loading aktif (kod zaten dahil)

---

## 📞 Destek

Herhangi bir sorunuz varsa:
- GitHub Issues açın
- README dosyasını tekrar okuyun
- Firebase Console'da hata loglarını kontrol edin

**Başarılar! 🎉**
