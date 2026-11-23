# Arenka Writer — Status Proyek

Baca file ini dahulu saat melanjutkan pekerjaan.

Terakhir diperbarui: 2026-11-23

## Target

| Item | Nilai |
|---|---|
| Domain | https://writer.arenka.biz.id |
| Repo | https://github.com/restupambudi99/arenka-writer |
| Runtime | Cloudflare Workers + Astro |
| Database | Cloudflare D1 |
| Berkas | Cloudflare R2 |
| CMS/auth | EmDash CMS |
| Gateway AI | https://9routers.vpsarenka.site/v1 |

## Selesai

- [x] Peta layar dashboard, buku, profil suara, pengaturan AI, wizard, paket, workspace, dan Preview & unduh.
- [x] Tulis spesifikasi fungsional, observasi referensi, dan rancangan UI Arenka.
- [x] Tambahkan tipe domain dan migrasi awal buku/bab/revisi/ekspor/pemakaian AI.
- [x] Siapkan `.dev.vars` lokal dan template; `.dev.vars` diabaikan Git.
- [x] Alihkan scaffold ke Astro + EmDash Cloudflare dengan D1 `DB`, R2 `MEDIA`, Durable Object EmDash, dan admin passkey.
- [x] Tambahkan health route dan route daftar model yang mensyaratkan session EmDash.
- [x] Verifikasi secara lokal bahwa `AI_API_KEY` dan `AI_MODEL` ada dan rapi, tanpa membaca/menampilkan nilainya.
- [x] Periksa struktur JSON Wrangler dan package manifest.

## Berikutnya

- [ ] Instal dependency dan jalankan scaffold; build/typecheck belum dilakukan.
- [ ] Verifikasi kontrak 9routers. Belum ada request ke gateway dan key belum dikirim.
- [ ] Buat UI orisinal Arenka untuk koleksi, wizard, dan workspace.
- [ ] Buat API buku/revisi dengan kepemilikan ditentukan dari session EmDash.
- [ ] Rancang validasi, kuota, rate limit, dan ledger sebelum mengaktifkan route chat.
- [ ] Tentukan onboarding serta role untuk pengguna tambahan.
- [ ] Terapkan migrasi lokal dan siapkan resource/domain Cloudflare sebelum deploy.

## Keputusan

- Jawaban AI menjadi usulan yang ditinjau penulis.
- Antarmuka referensi tidak mengungkap backend Shireen.
- EmDash mengelola admin, session, dan tabel internalnya; data buku memakai tabel terpisah.
- Route privat mengambil `owner_id` dari session, bukan request body.
- Jangan commit `.dev.vars`, `.env`, atau rahasia lain.
