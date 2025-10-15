# 🚀 Flight Data Generator - Başlatma Kılavuzu

## Hızlı Başlangıç

### En Basit Yöntem: run.bat

1. `run.bat` dosyasına **çift tıklayın**
2. Script otomatik olarak:
   - Port 5173'ü kontrol edecek
   - Port meşgulse boşaltacak
   - node_modules yoksa yükleyecek
   - Sunucuyu başlatacak
3. Tarayıcınızda açın: `http://localhost:5173/tools/flight-generator`

---

## Başlatma Scriptleri

### 1️⃣ run.bat (Önerilen)

**Kullanım:**
```cmd
run.bat
```
veya dosyaya çift tıklayın.

**Avantajları:**
- En kolay kullanım
- PowerShell ve Batch versiyonlarını otomatik dener
- Hata durumunda alternatif çalıştırır

---

### 2️⃣ start-dev.ps1 (PowerShell)

**Kullanım:**
```powershell
powershell -ExecutionPolicy Bypass -File start-dev.ps1
```

**Özellikler:**
- Renkli konsol çıktısı
- Detaylı bilgilendirme
- Daha iyi hata yönetimi
- Process bilgilerini gösterir

**Gereksinimler:**
- Windows PowerShell 5.0+
- Yönetici yetkisi (port temizleme için)

---

### 3️⃣ start-dev.bat (Klasik Batch)

**Kullanım:**
```cmd
start-dev.bat
```

**Özellikler:**
- Windows CMD ile çalışır
- PowerShell gerektirmez
- Daha basit ama etkili

---

## Port Kontrolü ve Temizleme

### Port Nedir?
Vite geliştirme sunucusu varsayılan olarak **5173** portunu kullanır. Eğer bu port başka bir program tarafından kullanılıyorsa, sunucu başlatılamaz.

### Otomatik Port Temizleme
Tüm scriptler otomatik olarak:
1. Port 5173'ün kullanımda olup olmadığını kontrol eder
2. Eğer meşgulse, hangi programın kullandığını bulur
3. O programı güvenli bir şekilde sonlandırır
4. Portu boşaltır ve sunucuyu başlatır

### Manuel Port Kontrolü

**Port'u kullanan programı bulmak:**
```cmd
netstat -ano | findstr ":5173"
```

**Process'i sonlandırmak:**
```cmd
taskkill /F /PID [PROCESS_ID]
```

---

## Sorun Giderme

### 🔴 Hata: "Missing script: dev"

**Çözüm:**
```cmd
npm install
```

### 🔴 Hata: "Port 5173 already in use"

**Çözüm 1:** run.bat kullanın (otomatik temizler)

**Çözüm 2:** Portu manuel temizleyin:
```cmd
# Port'u kullanan process ID'sini bulun
netstat -ano | findstr ":5173"

# Process'i sonlandırın (yönetici olarak)
taskkill /F /PID [ID]
```

**Çözüm 3:** Farklı port kullanın:
```cmd
npm run dev -- --port 3000
```

### 🔴 Hata: "Access Denied" veya "Yetkisiz"

**Neden:** Port temizleme için yönetici yetkisi gerekiyor

**Çözüm:**
1. CMD veya PowerShell'i **Yönetici olarak çalıştırın**
2. Script'i tekrar çalıştırın

**Nasıl Yönetici olarak çalıştırılır:**
- CMD'ye sağ tıklayın → "Yönetici olarak çalıştır"
- PowerShell'e sağ tıklayın → "Yönetici olarak çalıştır"

### 🔴 Hata: "node_modules not found"

**Çözüm:**
```cmd
npm install
```
Script zaten otomatik olarak yapacaktır.

### 🔴 PowerShell Execution Policy Hatası

**Hata:**
```
cannot be loaded because running scripts is disabled
```

**Çözüm:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

veya run.bat kullanın (otomatik bypass yapar).

---

## Manuel Başlatma

Scriptleri kullanmadan manuel başlatmak isterseniz:

```cmd
# 1. Proje dizinine gidin
cd "c:\Projeler\fms daily"

# 2. Bağımlılıkları yükleyin (ilk kez)
npm install

# 3. Sunucuyu başlatın
npm run dev
```

---

## Sunucuyu Durdurma

Çalışan sunucuyu durdurmak için:
- Terminal/CMD penceresinde **Ctrl + C** tuşlarına basın
- İki kez basmanız istenebilir

---

## Ek Komutlar

### Production Build Oluşturma
```cmd
npm run build
```
Çıktı: `dist/` klasöründe

### Production Build'i Önizleme
```cmd
npm run preview
```

### Kod Kalitesi Kontrolü (Linting)
```cmd
npm run lint
```

---

## Sistem Gereksinimleri

- **Node.js**: 18.x veya üzeri
- **npm**: 8.x veya üzeri
- **İşletim Sistemi**: Windows 10/11
- **Tarayıcı**: Chrome, Edge, Firefox (modern)

---

## Port Bilgileri

| Port | Kullanım |
|------|----------|
| 5173 | Vite Dev Server (varsayılan) |
| 4173 | Vite Preview Server |

---

## Faydalı Komutlar

```cmd
# Tüm scriptleri görüntüle
npm run

# Hangi port'lar kullanımda?
netstat -ano | findstr "LISTENING"

# Node versiyonunu kontrol et
node -v

# npm versiyonunu kontrol et
npm -v

# Tüm node_modules'i sil ve yeniden yükle
rmdir /s /q node_modules
npm install

# Cache temizle
npm cache clean --force
```

---

## 📞 Yardım

Sorun yaşıyorsanız:

1. **Önce deneyin:**
   - Terminali yönetici olarak çalıştırın
   - `npm install` komutunu çalıştırın
   - Bilgisayarı yeniden başlatın

2. **Hala çalışmıyorsa:**
   - Hata mesajını not edin
   - Node.js versiyonunu kontrol edin (`node -v`)
   - `package.json` dosyasının mevcut olduğundan emin olun

---

## 🎯 Başarılı Başlatma

Sunucu başarıyla başladığında şunu göreceksiniz:

```
========================================
Flight Data Generator - Dev Server
========================================

[1/3] Port 5173 kontrol ediliyor...
  ✓ Port 5173 boşta

[2/3] Node modules kontrol ediliyor...
  ✓ node_modules mevcut

[3/3] Geliştirme sunucusu başlatılıyor...

========================================
Sunucu hazır olduğunda tarayıcınızda:
  http://localhost:5173/tools/flight-generator
========================================

  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Tarayıcınızda `http://localhost:5173/tools/flight-generator` adresine gidin!

---

## ✨ İlk Kullanım Önerileri

1. **Default ayarlarla test edin:**
   - 200 çift uçuş
   - ADB home airport
   - 1 günlük tarih aralığı

2. **Preview oluşturun:** "Generate Preview" butonuna tıklayın

3. **Tabloyu inceleyin:**
   - Sıralama için başlıklara tıklayın
   - Filtreler ile verileri daraltın

4. **Excel indirin:** "Download Excel" butonuna tıklayın

---

**Not:** Bu kılavuz Windows işletim sistemi için hazırlanmıştır. Linux/Mac kullanıyorsanız, `npm run dev` komutunu doğrudan kullanın.

