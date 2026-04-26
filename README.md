# 🚀 Adsistent AI - Solusi Otomasi Iklan Meta untuk UMKM

**Adsistent AI** adalah sistem asisten cerdas berbasis AI yang dirancang untuk membantu pemilik UMKM (seperti retail atau barbershop) mengelola iklan Meta (Facebook/Instagram) langsung melalui Telegram. Sistem ini tidak hanya membuat iklan, tetapi juga mengevaluasi performa iklan secara otomatis untuk mencegah pemborosan anggaran.

## 🌟 Fitur Utama
* [cite_start]**Pembuatan Iklan via Telegram**: Menggunakan Azure OpenAI untuk menyusun strategi dan teks iklan persuasif berdasarkan input pengguna[cite: 23, 24].
* [cite_start]**Integrasi Meta Graph API**: Melakukan posting kampanye iklan secara langsung ke lingkungan produksi Meta[cite: 2, 29, 30].
* [cite_start]**Monitoring Otomatis (n8n)**: Evaluasi performa setiap 6 jam untuk memantau metrik seperti CPC, CTR, dan Frekuensi[cite: 44, 46, 51].
* [cite_start]**Auto-Pause System**: Menghentikan iklan secara otomatis jika performa buruk (CPL/CPC terlalu mahal) untuk mengamankan dana pengguna[cite: 43, 49, 54].
* [cite_start]**Arsitektur Docker**: Seluruh sistem dibungkus dalam Docker untuk memastikan kestabilan dan kemudahan deployment[cite: 2, 9].

## 🛠️ Teknologi yang Digunakan
* [cite_start]**Backend**: Node.js (Express, Telegraf)[cite: 17, 19].
* [cite_start]**AI**: Microsoft Azure OpenAI (GPT-4)[cite: 8, 22].
* [cite_start]**Database**: PostgreSQL 15[cite: 10, 14].
* [cite_start]**Automation**: n8n Workflow[cite: 11, 44].
* [cite_start]**Infrastructure**: Docker & Cloudflare Zero Trust[cite: 10, 12].

## 📁 Struktur Folder
```text
adsistent-vm/
├── bot/                # Backend Node.js & Logika AI [cite: 4]
├── docker-compose.yml  # Orkestrasi sistem [cite: 4, 9]
├── init-db.sql         # Skema Database PostgreSQL [cite: 4, 13]
├── n8n-production.json # Workflow evaluasi otomatis [cite: 4, 42]
└── .env                # Konfigurasi & API Keys (Hidden) [cite: 4, 7]
