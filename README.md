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

Resource production D1 `arenka-writer`, R2 `arenka-writer-media`, dan KV `arenka-writer-session` dibuat di akun
Cloudflare pemilik zone `arenka.biz.id`. Migrasi domain 0001–0004 sudah ada di
D1; migrasi 0005 masih perlu diterapkan sebelum endpoint saran AI dipakai.
Worker dan subdomain belum dideploy. Secret produksi dimasukkan lewat
`wrangler secret put AI_API_KEY` dan `wrangler secret put AI_MODEL`.

## API utama

Semua API privat menggunakan session EmDash dan membatasi query berdasarkan
owner. Mutasi memeriksa Origin dan ukuran JSON.

- `/api/books` serta `/api/books/:bookId`: koleksi, metadata, arsip.
- `/api/books/:bookId/outline`: simpan outline berversi dengan conflict cursor.
- `/api/books/:bookId/chapters/*`: bab, revisi, susunan, dan persetujuan snapshot.
- `/api/books/:bookId/chapters/:chapterId/suggest`: hasilkan saran AI untuk bab aktif.
  Instruksi, blueprint, profil suara versi buku, dan bagian akhir draf dikirim ke
  gateway hanya ketika endpoint dipanggil; hasil tidak disimpan otomatis.
- `/api/books/:bookId/preview`: data preview dari revisi aktif/disetujui.
- `/api/books/:bookId/export`: buat PDF dari revisi yang disetujui, simpan D1/R2.
- `/api/exports/:exportId`: unduh ulang dengan pemeriksaan owner.
- `/api/voice-profiles/*`: profil suara berversi.

## Pemeriksaan dan batas

Endpoint saran membatasi setiap akun hingga 4 permintaan per menit dan 30 per
hari UTC. Pemakaian dicatat di `ai_usage` menggunakan jumlah token yang
dikembalikan gateway; bila gateway tidak menyertakannya, nilainya kosong. Batas
ini mengatur jumlah permintaan, bukan biaya token.

`npm run typecheck` dan `npm run build` berhasil. Build memperingatkan chunk
frontend >500 KB dan Wrangler tidak dapat menulis log di luar workspace, namun
build selesai. UI saran AI, migrasi 0005 production, secret produksi, setup
EmDash production, dan deploy masih belum selesai.



