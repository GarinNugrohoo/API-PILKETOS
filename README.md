# 🚀 Project Name: Awesome Backend Service

![Node.js](https://shields.io)
![Supabase](https://shields.io)
![Sequelize](https://shields.io)
![PostgreSQL](https://shields.io)

## ✨ Fitur Utama

- 🏗️ **Robust Architecture**: Menggunakan Sequelize untuk manajemen skema database yang terstruktur.
- ⚡ **Database SQL**: Integrasi mulus dengan PostgreSQL.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **ORM & Migrations**: Sequelize
- **Database**: PostgreSQL
- **Driver**: `pg` & `pg-hstore`

## ⚙️ Cara Instalasi

1. **Clone repository**

   ```bash
   git clone https://github.com/GarinNugrohoo/API-PILKETOS.git
   cd project-name
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file `.env` masukkan kode JWT_SECRET dan KEY:

   ```env
   JWT_SECRET=KODE_JWT
   KEY=APIKEY
   ```

4. **Jalankan Migrasi**

   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Running App**
   ```bash
   npm run dev
   ```

## 📐 Database Schema

Proyek ini menggunakan **Structural Design Pattern** dalam penyusunan model data untuk memastikan kode tetap _maintainable_ dan mudah dikembangkan.

## 🤝 Kontribusi

Ingin berkontribusi? Silakan buka _Issue_ atau kirimkan _Pull Request_. Semua kontribusi sangat dihargai!

---

Developed with ❤️ by Garin Nugroho
