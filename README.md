# Arenka Writer

Scaffold Astro + EmDash pada Cloudflare Workers, dengan D1, R2, dan adapter
server-side untuk 9routers.

## Siapkan AI lokal

Isi `AI_API_KEY` dan `AI_MODEL` di `.dev.vars`, lalu simpan. URL dasar sudah
diatur di `wrangler.jsonc` ke `https://9routers.vpsarenka.site/v1`.
`.dev.vars` diabaikan Git. Jangan menaruh key di chat atau commit.

## Jalankan lokal

Persyaratan EmDash: Node.js 22.23.4 atau lebih baru.

```sh
npm install
npm run dev
```

Buka `http://localhost:4321/_emdash/admin` untuk menyelesaikan setup EmDash
dan membuat passkey admin pertama. Route `GET /api/ai/models` mensyaratkan
session EmDash; saat dipanggil, route itu meneruskan permintaan katalog model
ke 9routers. UI buku Arenka belum dibangun.

## Data buku dan berkas

Data domain berada di migrasi `migrations/0001_core.sql` menggunakan binding
D1 `DB`, dengan tabel yang terpisah dari skema internal EmDash. Berkas
menggunakan binding R2 `MEDIA`. Migrasi lokal:

```sh
npm run db:migrate:local
```

Belum ada migrasi remote atau deploy. Buat resource D1/R2 Cloudflare dan
konfigurasikan binding production sebelum deploy. Simpan API key production
melalui `wrangler secret put AI_API_KEY`; model menggunakan setting server-side
`AI_MODEL`.

## Status integrasi AI

- Adapter model mengikuti format OpenAI-compatible (`GET /models`). Kontrak
  gateway spesifik belum diverifikasi karena tidak ada request eksternal.
- Endpoint chat belum diekspos. Sebelum aktif, perlu session, validasi, kuota,
  batas pemakaian, dan ledger.
- Jawaban AI dirancang sebagai usulan yang ditinjau penulis.
