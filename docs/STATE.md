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

- [x] Petakan antarmuka referensi: dashboard, buku, profil suara, pengaturan AI, wizard, workspace, paket, dan Preview & unduh.
- [x] Catat spesifikasi fungsional, observasi referensi, dan rancangan UI orisinal Arenka.
- [x] Siapkan Astro + EmDash di Cloudflare dengan D1/R2, Durable Object, passkey, health route, dan katalog model terlindungi session.
- [x] Tambahkan migrasi awal buku, profil suara, bab, revisi, ekspor, dan pemakaian AI.
- [x] Buat UI koleksi, buat profil suara awal, buat blueprint, workspace bab, dan editor teks sederhana.
- [x] Tambahkan API buku/bab/revisi manual/profil suara; pemilik selalu dari session EmDash.
- [x] Tambahkan riwayat revisi, pratinjau snapshot, pulihkan sebagai revisi baru, dan revision cursor untuk mencegah konflik overwrite.
- [x] Sediakan lockfile; `.dev.vars` tetap lokal dan diabaikan Git.
- [x] `npm run typecheck` lulus tanpa error/warning/hint.
- [x] `npm run build` lulus; tersisa peringatan bundle frontend >500 KB.

## Berikutnya

- [ ] Pastikan migrasi D1 lokal/remote diterapkan berurutan; jangan deploy sampai resource/binding D1, R2, Durable Object dan domain disiapkan.
- [ ] Lengkapi wizard lima tahap dan edit/versi profil suara.
- [ ] Buat struktur outline dapat diurutkan dan riwayat revisi dengan metadata yang lebih lengkap.
- [ ] Rancang kuota, rate limit, dan ledger sebelum mengaktifkan route chat.
- [ ] Verifikasi kontrak 9routers sebelum request pertama; key tidak pernah dikirim dari browser.
- [ ] Implementasikan Preview/PDF dan unduhan R2.
- [ ] Pecah bundle besar bila sudah ada layar admin/editor lengkap.

## Keputusan dan batas

- AI hanya memberi usulan yang ditinjau penulis; tidak menimpa naskah otomatis.
- Observasi browser tidak membuktikan backend situs referensi.
- EmDash mengelola admin/session; tabel data buku Arenka terpisah.
- Mutasi memeriksa origin same-origin; owner diturunkan dari session, bukan body.
- Pulihkan revisi membuat entri baru dan mempertahankan seluruh riwayat.
- Belum ada deploy, migrasi Cloudflare, atau request ke 9routers.
- Jangan commit `.dev.vars`, `.env`, atau secret lain.

