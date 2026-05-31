const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',     
    database: '251109029_yusuf_haber_db'
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Veritabanına Başarıyla Bağlanıldı.");
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); 
app.use(session({
    secret: 'yusuf_gizli_anahtar_123',
    resave: false,
    saveUninitialized: true
}));


const authKontrol = (req, res, next) => {
    
    if (req.session.kullaniciId && req.session.kullaniciRol === 'admin') {
        next();
    } else if (req.session.kullaniciId) {
       
        res.send('<script>alert("Bu alana erişim yetkiniz yok! Sadece yöneticiler girebilir."); window.location.href="/ANASAYFA.HTML";</script>');
    } else {
       
        res.send('<script>alert("Bu alana erişmek için giriş yapmalısınız!"); window.location.href="/giris";</script>');
    }
};

// --- SAYFA YÖNLENDİRMELERİ ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'ANASAYFA.HTML')));
app.get('/ANASAYFA.HTML', (req, res) => res.sendFile(path.join(__dirname, 'ANASAYFA.HTML')));
app.get('/HABERLER.HTML', (req, res) => res.sendFile(path.join(__dirname, 'HABERLER.HTML')));
app.get('/HAKKIMIZDA.HTML', (req, res) => res.sendFile(path.join(__dirname, 'HAKKIMIZDA.HTML')));
app.get('/ILETIŞIM.HTML', (req, res) => res.sendFile(path.join(__dirname, 'İLETİŞİM.HTML')));


app.get('/giris', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr"><head><meta charset="UTF-8"><title>Giriş Yap</title><link rel="stylesheet" href="style.css"></head>
        <body>
            <div class="y-ust-menu"><nav class="y-menu"><a href="ANASAYFA.HTML">Anasayfa</a><a href="/giris">Yönetim Paneli</a></nav></div>
            <div class="y-ana-kutu">
                <h2 class="y-baslik">Yönetici Girişi</h2>
                <form action="/api/auth/giris" method="POST" class="y-form-kutu">
                    <div class="y-form-satir"><label>E-posta</label><input type="email" name="eposta" required></div>
                    <div class="y-form-satir"><label>Şifre</label><input type="password" name="sifre" required></div>
                    <button class="y-buton">GİRİŞ YAP</button>
                </form>
                <p style="text-align:center; margin-top:10px;"><a href="/kayit" style="color:#191970;">Hesabınız yok mu? Kayıt Olun</a></p>
            </div>
        </body></html>
    `);
});

app.get('/kayit', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr"><head><meta charset="UTF-8"><title>Kayıt Ol</title><link rel="stylesheet" href="style.css"></head>
        <body>
            <div class="y-ust-menu"><nav class="y-menu"><a href="ANASAYFA.HTML">Anasayfa</a></nav></div>
            <div class="y-ana-kutu">
                <h2 class="y-baslik">Yeni Kayıt</h2>
                <form action="/api/auth/kayit" method="POST" class="y-form-kutu">
                    <div class="y-form-satir"><label>Ad Soyad</label><input type="text" name="ad_soyad" required></div>
                    <div class="y-form-satir"><label>E-posta</label><input type="email" name="eposta" required></div>
                    <div class="y-form-satir"><label>Şifre</label><input type="password" name="sifre" required></div>
                    <button class="y-buton">KAYIT OL</button>
                </form>
            </div>
        </body></html>
    `);
});


app.get('/admin', authKontrol, (req, res) => {
    db.query('SELECT haberler.*, kategoriler.kategori_adi, kullanicilar.ad_soyad FROM haberler LEFT JOIN kategoriler ON haberler.kategori_id = kategoriler.id LEFT JOIN kullanicilar ON haberler.yazar_id = kullanicilar.id', (err, haberler) => {
        if (err) throw err;
        
        let haberSatirlari = haberler.map(h => `
            <tr>
                <td>${h.baslik}</td>
                <td>${h.kategori_adi || 'Belirsiz'}</td>
                <td>${h.ad_soyad || 'Bilinmiyor'}</td>
                <td>
                    <button class="y-buton" style="background:#d9534f; padding:4px;" onclick="haberSil(${h.id})">Sil</button>
                </td>
            </tr>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="tr"><head><meta charset="UTF-8"><title>Admin Paneli</title><link rel="stylesheet" href="style.css">
            <script>
                function haberSil(id) {
                    if(confirm('Bu haberi silmek istediğinize emin misiniz?')) {
                        fetch('/api/haberler/' + id, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(data => { alert(data.mesaj); location.reload(); });
                    }
                }
            </script>
            </head>
            <body>
                <div class="y-ust-menu"><nav class="y-menu"><a href="ANASAYFA.HTML">Anasayfa</a><a href="/cikis">Çıkış Yap (${req.session.kullaniciAd})</a></nav></div>
                <div class="y-ana-kutu" style="width:80%;">
                    <h2 class="y-baslik">Haber Yönetim Paneli (Admin)</h2>
                    
                    <h3 style="color:#191970; margin-top:20px;">Yeni Haber Ekle</h3>
                    <form action="/api/haberler" method="POST" class="y-form-kutu">
                        <div class="y-form-satir"><label>Haber Başlığı</label><input type="text" name="baslik" required></div>
                        <div class="y-form-satir"><label>Haber Özeti</label><input type="text" name="ozet" required></div>
                        <div class="y-form-satir"><label>Kategori</label>
                            <select name="kategori_id"><option value="1">Mobil</option><option value="2">Yapay Zeka</option><option value="3">Donanım</option></select>
                        </div>
                        <button class="y-buton">HABERİ EKLE (POST)</button>
                    </form>

                    <h3 style="color:#191970; margin-top:30px;">Mevcut Haberler (JOIN Yapılı Liste)</h3>
                    <table class="y-hizmet-tablosu">
                        <tr><th>Başlık</th><th>Kategori</th><th>Yazar</th><th>İşlem</th></tr>
                        ${haberSatirlari}
                    </table>
                </div>
            </body></html>
        `);
    });
});

app.get('/cikis', (req, res) => {
    req.session.destroy();
    res.redirect('/ANASAYFA.HTML');
});




app.get('/api/haberler', (req, res) => {
    db.query('SELECT haberler.*, kategoriler.kategori_adi FROM haberler LEFT JOIN kategoriler ON haberler.kategori_id = kategoriler.id', (err, sonuclar) => {
        if (err) return res.status(500).json({ hata: err.message });
        res.json(sonuclar);
    });
});


app.post('/api/haberler', authKontrol, (req, res) => {
    const { baslik, ozet, kategori_id } = req.body;
    const yazar_id = req.session.kullaniciId;
    db.query('INSERT INTO haberler (baslik, ozet, kategori_id, yazar_id) VALUES (?, ?, ?, ?)', [baslik, ozet, kategori_id, yazar_id], (err, sonuc) => {
        if (err) return res.status(500).json({ hata: err.message });
        res.send('<script>alert("Haber başarıyla eklendi!"); window.location.href="/admin";</script>');
    });
});


app.put('/api/haberler/:id', authKontrol, (req, res) => {
    const { baslik, ozet } = req.body;
    db.query('UPDATE haberler SET baslik = ?, ozet = ? WHERE id = ?', [baslik, ozet, req.params.id], (err, sonuc) => {
        if (err) return res.status(500).json({ hata: err.message });
        res.json({ mesaj: "Haber başarıyla güncellendi (PUT)." });
    });
});


app.delete('/api/haberler/:id', authKontrol, (req, res) => {
    db.query('DELETE FROM haberler WHERE id = ?', [req.params.id], (err, sonuc) => {
        if (err) return res.status(500).json({ hata: err.message });
        res.json({ mesaj: "Haber başarıyla silindi (DELETE)." });
    });
});

app.post('/api/auth/kayit', async (req, res) => {
    const { ad_soyad, eposta, sifre } = req.body;
    const hashedSifre = await bcrypt.hash(sifre, 10);
    
    
    db.query('INSERT INTO kullanicilar (ad_soyad, eposta, sifre, rol) VALUES (?, ?, ?, \'user\')', 
    [ad_soyad, eposta, hashedSifre], (err, sonuc) => {
        if (err) return res.send('<script>alert("E-posta zaten kayıtlı!"); window.history.back();</script>');
        res.send('<script>alert("Kayıt başarılı! Giriş yapabilirsiniz."); window.location.href="/giris";</script>');
    });
});
// Auth (Kimlik Doğrulama) işlemleri: bcrypt ile şifreleri hashledik (güvenlik için)
app.post('/api/auth/giris', (req, res) => {
    const { eposta, sifre } = req.body;
    db.query('SELECT * FROM kullanicilar WHERE eposta = ?', [eposta], async (err, sonuclar) => {
        if (err) throw err;
        if (sonuclar.length === 0 || !(await bcrypt.compare(sifre, sonuclar[0].sifre))) {
            return res.send('<script>alert("Hatalı e-posta veya şifre!"); window.history.back();</script>');
        }
        
        
        req.session.kullaniciId = sonuclar[0].id;
        req.session.kullaniciAd = sonuclar[0].ad_soyad;
        req.session.kullaniciRol = sonuclar[0].rol; 
        
        // Eğer admin ise yönetim paneline, normal kullanıcı ise ana sayfaya yönlendiriyoruz
        if (sonuclar[0].rol === 'admin') {
            res.redirect('/admin');
        } else {
            res.send('<script>alert("Giriş başarılı! Yönetici olmadığınız için ana sayfaya yönlendiriliyorsunuz."); window.location.href="/ANASAYFA.HTML";</script>');
        }
    });
});

// Sunucuyu Çalıştır
app.listen(3000, () => {
    console.log("Sunucu http://localhost:3000 adresinde aktif.");
});