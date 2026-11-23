# Arenka Writer

Scaffold awal Cloudflare Workers dengan D1, R2, dan adapter 9routers.

## Isi konfigurasi lokal

Isi `AI_API_KEY` dan `AI_MODEL` di `.dev.vars`. File ini diabaikan Git.
Base URL sudah diarahkan ke `https://9routers.vpsarenka.site/v1` dan dapat
diubah di file yang sama bila instalasi gateway memakai alamat lain.

## Pengembangan lokal

```sh
npm install
npm run db:migrate:local
npm run dev
```

Endpoint `GET /api/health` hanya memeriksa bahwa Worker merespons. Adapter AI
berada di `src/ai.ts` dan belum disambungkan ke route publik sebelum
autentikasi aplikasi tersedia.

`wrangler.jsonc` memakai ID D1 lokal sementara. Ganti dengan ID database
Cloudflare sebelum migrasi remote atau deploy. R2 juga perlu dibuat atau
diikat ke bucket yang benar di akun Cloudflare.

## Status

- Migrasi inti masih rancangan awal dan belum diterapkan ke Cloudflare.
- Integrasi CMS Emdash belum ditambahkan karena produknya belum diidentifikasi.
- Tidak ada rahasia API yang disimpan di repo.

