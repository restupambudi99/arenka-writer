# Arenka Writer

Arenka Writer memakai Astro + EmDash pada Cloudflare Workers, dengan D1, R2,
dan adapter server-side untuk 9routers. Aplikasi mencakup wizard blueprint,
outline versi, workspace revisi, preview, persetujuan bab, dan ekspor PDF privat.

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

Resource production D1 `arenka-writer`, R2 `arenka-writer-media`, dan KV
`arenka-writer-session` sudah dibuat di akun Cloudflare pemilik zone
`arenka.biz.id`. Migrasi D1 0001–0004 telah diterapkan; migration 0005 masih
perlu diterapkan sebelum endpoint saran AI dirilis. Worker dan subdomain belum
dideploy. Secret produksi dimasukkan lewat `wrangler secret put AI_API_KEY`
dan `wrangler secret put AI_MODEL`.

## API utama

Semua API privat menggunakan session EmDash dan membatasi query berdasarkan
owner. Mutasi memeriksa Origin dan ukuran JSON.

- `/api/books` serta `/api/books/:bookId`: koleksi, metadata, arsip.
- `/api/books/:bookId/outline`: simpan outline berversi dengan conflict cursor.
- `/api/books/:bookId/chapters/*`: bab, revisi, susunan, dan persetujuan snapshot.
- `/api/books/:bookId/chapters/:chapterId/suggest`: hasilkan saran AI untuk bab aktif.
  Saat dipanggil, instruksi, blueprint, profil suara versi buku, dan hingga
  20.000 karakter terakhir draf dikirim ke gateway. Hasil tampil terpisah dan
  baru tersimpan sebagai revisi saat penulis menerapkannya.
- `/api/books/:bookId/preview`: data preview dari revisi aktif/disetujui.
- `/api/books/:bookId/export`: buat PDF dari revisi yang disetujui, simpan D1/R2.
- `/api/exports/:exportId`: unduh ulang dengan pemeriksaan owner.
- `/api/voice-profiles/*`: profil suara berversi.

## Pemeriksaan dan status rilis

Endpoint saran membatasi setiap akun hingga 4 permintaan per menit dan 30 per
hari UTC. Pemakaian dicatat di `ai_usage` menggunakan jumlah token dari gateway;
bila tidak disertakan, nilainya kosong. Ini batas jumlah permintaan, bukan kuota
biaya token.

Uji lokal mencakup alur blueprint, outline, pembuatan bab, revisi, preview,
persetujuan, dan ekspor PDF. Form saran AI dan validasi input diuji tanpa
mengirim naskah ke gateway. `npm run typecheck` lulus 34 file tanpa diagnostic;
`npm run build` berhasil dengan peringatan bundle frontend >500 KB dan Wrangler
tidak dapat menulis log di luar workspace.

Kontrak respons 9routers untuk chat completion belum diuji langsung. Production
masih membutuhkan migration 0005, setup EmDash, secrets, autentikasi Wrangler,
deploy Worker dan pengaitan domain. Jangan anggap layanan sudah aktif.
