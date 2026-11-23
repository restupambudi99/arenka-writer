# Arenka Writer

Arenka Writer memakai Astro + EmDash pada Cloudflare Workers, dengan D1, R2,
dan adapter server-side untuk 9routers. Aplikasi mencakup wizard blueprint,
outline versi, workspace revisi, preview, dan ekspor PDF privat.

## Siapkan AI lokal

Isi `AI_API_KEY` dan `AI_MODEL` di `.dev.vars`. URL dasar berada di
`wrangler.jsonc`: `https://9routers.vpsarenka.site/v1`. `.dev.vars` diabaikan
Git. Jangan menaruh key di chat atau commit.

## Jalankan lokal

Persyaratan EmDash: Node.js 22.23.4 atau lebih baru.

```sh
npm ci
npm run dev
```

Buka `http://localhost:4321/_emdash/admin` untuk setup EmDash dan passkey admin.
Route `GET /api/ai/models` memakai session EmDash dan memanggil katalog 9routers.
UI tidak menerima kredensial AI.

## Data dan migrasi

D1 `DB` memakai migration domain `migrations/`; R2 `MEDIA` menyimpan file.
Terapkan migration berurutan. Konfigurasi lokal:

```sh
npm run db:migrate:local
```

Resource production `arenka-writer` dan `arenka-writer-media` dibuat di akun
Cloudflare pemilik zone `arenka.biz.id`. Belum ada migration production atau
deploy. Secret production dimasukkan lewat `wrangler secret put AI_API_KEY` dan
`wrangler secret put AI_MODEL` setelah credential siap.

## API utama

Semua API privat menggunakan session EmDash dan membatasi query berdasarkan
owner. Mutasi memeriksa Origin dan ukuran JSON.

- `/api/books` serta `/api/books/:bookId`: koleksi, metadata, arsip.
- `/api/books/:bookId/outline`: simpan outline berversi dengan conflict cursor.
- `/api/books/:bookId/chapters/*`: bab, revisi, susunan, dan persetujuan snapshot.
- `/api/books/:bookId/preview`: data preview dari revisi aktif/disetujui.
- `/api/books/:bookId/export`: buat PDF dari revisi yang disetujui, simpan D1/R2.
- `/api/exports/:exportId`: unduh ulang dengan pemeriksaan owner.
- `/api/voice-profiles/*`: profil suara berversi.

## Pemeriksaan dan batas

`npm run typecheck` (33 file) dan `npm run build` berhasil. Build memperingatkan
chunk frontend >500 KB; Wrangler juga mencatat EPERM pada file log di luar
workspace tanpa menggagalkan build. Chat AI, kuota/ledger, dan pemeriksaan
kontrak gateway belum selesai. Belum deploy.

