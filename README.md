# Arenka Writer

Scaffold awal Cloudflare Workers dengan D1, R2, dan adapter 9routers.

## Isi konfigurasi AI lokal

1. Buka `.dev.vars` di folder proyek.
2. Isi `AI_API_KEY` dengan key 9routers dan `AI_MODEL` dengan ID model yang
   diizinkan untuk key tersebut.
3. Simpan file. Jangan kirim key lewat chat atau memasukkannya ke file lain.

`.dev.vars` sudah diabaikan Git. `.dev.vars.example` adalah template aman.
Base URL tersimpan sebagai nilai nonrahasia di `wrangler.jsonc`:
`https://9routers.vpsarenka.site/v1`.

Untuk memasang rahasia di Worker produksi setelah akun Cloudflare siap, jalankan
`npx wrangler secret put AI_API_KEY` dan `npx wrangler secret put AI_MODEL`.

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

