# Arenka Writer

Arenka Writer memakai Astro + EmDash pada Cloudflare Workers, dengan D1, R2,
dan adapter server-side untuk 9routers. Wizard buku lima tahap menyimpan
blueprint bertahap; profil suara dan workspace naskah memiliki API privat.

## Siapkan AI lokal

Isi `AI_API_KEY` dan `AI_MODEL` di `.dev.vars`, lalu simpan. URL dasar sudah
diatur di `wrangler.jsonc` ke `https://9routers.vpsarenka.site/v1`.
`.dev.vars` diabaikan Git. Jangan menaruh key di chat atau commit.

## Jalankan lokal

Persyaratan EmDash: Node.js 22.23.4 atau lebih baru.

```sh
npm ci
npm run dev
```

Buka `http://localhost:4321/_emdash/admin` untuk menyelesaikan setup EmDash
dan membuat passkey admin pertama. Route `GET /api/ai/models` mensyaratkan
session EmDash; saat dipanggil, route itu meneruskan permintaan katalog model
ke 9routers. UI tidak pernah menerima kredensial AI.

## Data buku dan berkas

Data domain berada di `migrations/` menggunakan binding D1 `DB`, dengan tabel
yang terpisah dari skema internal EmDash. Terapkan migrasi secara berurutan.
Berkas menggunakan binding R2 `MEDIA`. Migrasi lokal:

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

## API buku

Semua route privat membaca ID pemilik dari session EmDash. Mutasi mensyaratkan
Origin sama dengan origin request, JSON maksimal 256 KB, dan respons pribadi
ditandai no-store.

- `GET /api/books?status=active|archived|all&q=&cursor=` — daftar terfilter dan berpaginasi.
- `POST /api/books` — buat blueprint setelah profil suara siap milik pengguna diverifikasi.
- `GET /api/books/:bookId` — detail buku dan bab.
- `PATCH /api/books/:bookId` — ubah metadata, layout, tahap, arsip, dan data wizard.
- `POST /api/books/:bookId/chapters` — tambah bab.
- `PATCH /api/books/:bookId/chapters/:chapterId` — ubah judul, tujuan, posisi.
- `PUT /api/books/:bookId/chapters/:chapterId` — buat revisi manual baru.
- `GET/POST /api/voice-profiles` — daftar profil siap dan buat profil awal.

`/` menampilkan koleksi responsif; `/books/new` menyediakan wizard lima tahap;
`/books/:id` memungkinkan menambah bab dan menyimpan revisi manual. Rich text
dan Preview/PDF belum tersedia.

## Pemeriksaan dan batas

`npm run typecheck` dan `npm run build` berhasil. Build memperingatkan chunk
frontend >500 KB. Jangan deploy sebelum resource D1/R2 produksi disiapkan;
kontrak gateway 9routers belum diverifikasi melalui request eksternal.

Dependency tercatat dalam `package-lock.json`; gunakan `npm ci` untuk instalasi
reproducible. Migrasi Cloudflare remote dan deployment belum dilakukan.

