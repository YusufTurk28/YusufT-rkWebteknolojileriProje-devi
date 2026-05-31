CREATE DATABASE IF NOT EXISTS 251109029_yusuf_haber_db;
USE 251109029_yusuf_haber_db;

-- 1. Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS kullanicilar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad_soyad VARCHAR(100) NOT NULL,
    eposta VARCHAR(100) UNIQUE NOT NULL,
    sifre VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'user',
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kategoriler Tablosu
CREATE TABLE IF NOT EXISTS kategoriler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_adi VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Haberler Tablosu (İlişkili Tablo)
CREATE TABLE IF NOT EXISTS haberler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    ozet TEXT NOT NULL,
    icerik TEXT,
    resim_yolu VARCHAR(255) DEFAULT 'resimler/default.jpg',
    kategori_id INT,
    yazar_id INT,
    yayin_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE SET NULL,
    FOREIGN KEY (yazar_id) REFERENCES kullanicilar(id) ON DELETE SET NULL
);

-- Örnek Başlangıç Verileri
INSERT INTO kategoriler (kategori_adi) VALUES ('Mobil'), ('Yapay Zeka'), ('Donanım');
-- Şifre: 'admin123' (bcrypt hash'li hali aşağıdadır)
INSERT INTO kullanicilar (ad_soyad, eposta, sifre, rol) VALUES 
('Yusuf Türk', 'admin@yusufhaberturk.com', 'admin123', 'admin');