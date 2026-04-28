# 🚀 API-PILKETOS: Awesome Backend Service

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

## 🚧 Status Proyek: Under Development
**PENTING:** Proyek ini masih dalam tahap **pengembangan aktif**. Beberapa fitur mungkin sedang dalam masa pengujian, dan struktur database masih dapat berubah sewaktu-waktu hingga mencapai versi stabil.

## ✨ Fitur Utama

- 🏗️ **Robust Architecture**: Manajemen skema database terstruktur dengan Sequelize ORM.
- 🔐 **Secure Authentication**: Sistem keamanan menggunakan **JWT (JSON Web Token)** dan **API Key** (x-api-key).
- 📄 **Official PDF Report**: Pembuatan Berita Acara Ketetapan Kandidat Terpilih otomatis menggunakan **PDFKit**.
- 🎫 **Bulk Identity Generator**: Generate kode peserta secara massal beserta cetak kartu peserta PDF.
- 🛠️ **Maintenance Mode**: Fitur kendali server untuk mengaktifkan/menonaktifkan akses sistem secara real-time.
- ⚡ **Real-time Ready**: Mendukung integrasi data real-time untuk kebutuhan Quick Count.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5.x)
- **Documentation**: Swagger UI & Swagger Autogen
- **ORM & Migrations**: Sequelize
- **Database**: PostgreSQL
- **PDF Engine**: PDFKit
- **File Upload**: Multer

## ⚙️ Cara Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/GarinNugrohoo/API-PILKETOS.git
   cd API-PILKETOS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env` dan lengkapi variabel berikut:
   - `JWT_SECRET`: Kode rahasia token.
   - `APIKEY`: Key untuk akses header.
   - `SUPABASE_URL`: Koneksi PostgreSQL (jika menggunakan supabase).
   - `E_VOTING_MODE`: 1 (Ketua) atau 2 (Paslon).
   - `NAMA_ORGANISASI`: Nama organisasi yang melaksanakan/menjadi panitia pilketos
   - `TAHUN_PELAKSANAAN`: Tahun periode pemilihan (contoh:2026).

4. **Persiapan Database**
   Jalankan migrasi untuk membuat tabel dan seeder untuk membuat akun **Admin Utama**:
   ```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. **Jalankan Aplikasi**
   ```bash
   # Mode Development
   npm run dev
   ```

## 📸 API Documentation

Dokumentasi dapat diakses melalui browser setelah menjalankan server di:
`http://localhost:3000/api-docs` (atau sesuai host Anda).

## 📁 Struktur Assets
Pastikan folder berikut tersedia untuk menyimpan hasil generate sistem:
- `assets/pdf/` : Penyimpanan Laporan Berita Acara & Kartu Peserta.
- `assets/images/logo_sekolah/` : Logo sekolah untuk Kop Surat (wajib hanya 1 file gambar didalam folder).
- `assets/images/logo_organisasi/` : Logo OSIS/Organisasi untuk Kop Surat (wajib hanya 1 file gambar didalam folder).

## 📐 Database Schema
Proyek ini menggunakan **Relational Design Pattern**. Seluruh perubahan skema harus dilakukan melalui file migration untuk menjaga konsistensi data antara tim pengembang dan server produksi.

## 🤝 Kontribusi
Ingin berkontribusi? Silakan buka _Issue_ atau kirimkan _Pull Request_. Semua kontribusi sangat dihargai!

---
Developed with ❤️ by **Garin Nugroho**
