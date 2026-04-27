# 🚀 API-PILKETOS: Awesome Backend Service

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

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
