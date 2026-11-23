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
npm ci
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
## API buku

Semua route privat membaca ID pemilik dari session EmDash. Mutasi mensyaratkan
Origin sama dengan origin request, JSON maksimal 256 KB, dan respons pribadi
ditandai no-store.

- `GET /api/books?status=active|archived|all&q=&cursor=` — daftar terfilter dan
  berpaginasi.
- `POST /api/books` — buat blueprint setelah profil suara siap milik pengguna
  diverifikasi.
- `GET /api/books/:bookId` — detail buku dan bab.
- `PATCH /api/books/:bookId` — ubah metadata, layout, tahap, atau arsip.
- `POST /api/books/:bookId/chapters` — tambah bab.
- `PATCH /api/books/:bookId/chapters/:chapterId` — ubah judul, tujuan, posisi.
- `PUT /api/books/:bookId/chapters/:chapterId` — buat revisi manual baru;
  perubahan mengosongkan status persetujuan lama.
- `GET/POST /api/voice-profiles` — daftar profil siap dan buat profil awal.

`/` menampilkan koleksi responsif; `/books/new` membuat blueprint; `/books/:id`
memungkinkan menambah bab dan menyimpan revisi manual. UI ini belum menggantikan
wizard lima langkah lengkap, editor rich text, ataupun Preview/PDF.

## Pemeriksaan dan batas

Node dependency install belum berhasil tuntas di workspace ini, jadi Astro
check/build belum dijalankan. Jangan deploy sebelum check berhasil dan resource
D1/R2 produksi disiapkan. Kontrak gateway 9routers juga belum dipanggil.

Dependency versions are locked in `package-lock.json`; use `npm ci` for repeatable setup. `astro check` and the production build currently pass. The build emits a frontend chunk size warning (>500 KB), which should be addressed when splitting the admin/editor UI.
## Riwayat revisi naskah

- `GET /api/books/:bookId/chapters/:chapterId/revisions` menampilkan hingga 50 revisi terbaru, sumber, waktu, panjang, dan revisi aktif.
- `GET /api/books/:bookId/chapters/:chapterId/revisions/:revisionId` membaca isi revisi untuk pratinjau.
- `POST` pada endpoint detail revisi memulihkan teks sebagai revisi `restore` baru, mempertahankan revisi lama, dan membatalkan approval lama. Pengguna harus mengonfirmasi aksinya.
- `PUT` penyimpanan naskah menerima `expectedCurrentRevisionId`; konflik menghasilkan 409. Mutasi restore memakai syarat versi aktif yang sama.
- Migrasi `0002_revision_restore.sql` memperluas sumber revisi dan menambah referensi `restored_from_revision_id`.

Layar workspace memuat riwayat bab aktif dan menampilkan snapshot dalam pratinjau terpisah. Pergantian bab menanyakan konfirmasi jika ada perubahan lokal yang belum disimpan.
- `PUT /api/books/:bookId/chapters/order` menerima seluruh daftar ID bab sebagai urutan tujuan. Server memeriksa bahwa daftar itu tepat berisi bab milik pengguna, lalu mengubah posisi melalui batch D1 dengan posisi sementara agar pertukaran posisi tidak melanggar unique constraint.
- Workspace menampilkan tombol bab naik/turun, menonaktifkan batas atas/bawah, dan meminta konfirmasi jika ada teks yang belum disimpan sebelum berpindah/menyusun ulang.
# API profil suara

- `GET /api/voice-profiles` hanya mengembalikan versi terbaru berstatus siap.
- `GET /api/voice-profiles/:profileId?version=n` menampilkan snapshot dan daftar versi dengan jumlah buku yang memakai tiap versi.
- `PUT /api/voice-profiles/:profileId` mensyaratkan `expectedVersion`, lalu membuat versi baru. Benturan edit menghasilkan 409.
- Pembuatan buku hanya menerima versi profil terbaru yang masih aktif. Buku lama tetap mereferensikan versi yang tersimpan pada saat dibuat.

UI: `/voices` untuk daftar, `/voices/new` untuk profil baru, dan `/voices/:id` untuk melihat riwayat serta mengedit versi terbaru.

