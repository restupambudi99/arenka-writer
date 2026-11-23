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

- [x] Petakan layar referensi dashboard, buku, profil suara, pengaturan AI, wizard, workspace, paket, Preview & unduh.
- [x] Tulis spesifikasi fungsional, observasi referensi, dan rancangan antarmuka orisinal.
- [x] Tambahkan domain awal dan migrasi D1 buku, bab, revisi, ekspor, serta ledger penggunaan.
- [x] Siapkan `.dev.vars` lokal dan template; file secret diabaikan Git.
- [x] Scaffold Astro + EmDash Cloudflare dengan D1 `DB`, R2 `MEDIA`, Durable Object, admin passkey, health route, dan katalog model terlindungi session.
- [x] Implementasikan API buku, profil suara, bab, revisi manual, validasi input, batas ukuran body, pembatasan owner/session, same-origin mutations, serta no-store responses.
- [x] Implementasikan koleksi responsif, pembuatan profil suara awal, pembuatan blueprint, dan workspace editor teks sederhana.
- [x] Cek format AI_API_KEY/AI_MODEL tanpa membaca nilainya; secret tidak pernah dikirim ke gateway.

## Berikutnya

- [ ] Selesaikan `npm install`; percobaan pertama terhenti pada cache profil Windows, percobaan cache lokal lambat dan dihentikan.
- [ ] Jalankan `astro check` dan `astro build`; belum ada hasil runtime.
- [ ] Cocokkan format API 9routers setelah disetujui untuk request; jangan mengirim data naskah tanpa tindakan pengguna.
- [ ] Lengkapi wizard lima tahap, edit/versi profil suara, riwayat revisi, dan pengurutan bab.
- [ ] Tambahkan validasi konflik revisi/urutan yang atomik.
- [ ] Rancang kuota, rate limit, dan ledger sebelum route chat diaktifkan.
- [ ] Implementasikan Preview/PDF dan unduhan R2.
- [ ] Siapkan resource D1/R2/domain Cloudflare setelah build dan pemeriksaan berhasil.

## Keputusan

- AI memberi usulan yang ditinjau penulis; tidak menimpa naskah otomatis.
- Antarmuka situs referensi tidak membuktikan detail backend-nya.
- EmDash mengelola admin/session dan skema CMS; data buku memakai tabel terpisah.
- Owner API selalu diambil dari session EmDash, bukan request body.
- Mutasi yang memakai cookie session memerlukan Origin same-origin.
- Jangan commit `.dev.vars`, `.env`, atau rahasia lain.
- TypeScript/Astro check: lulus, 18 file checked, 0 error/warning/hint.
- Production Astro build: lulus. Ada peringatan ukuran chunk frontend di atas 500 KB.
- EmDash memakai Noto Sans default; build online bisa mengambil font saat build. `fonts: false` diatur agar build terisolasi tidak membutuhkan akses Google Fonts.
Pemeriksaan lokal terbaru: `npm run typecheck` lulus tanpa error/warning/hint;
`npm run build` lulus dengan peringatan ukuran chunk frontend >500 KB. Binding
Astro Sessions `SESSION` dapat diprovision otomatis Cloudflare saat deployment;
EmDash tetap mengelola autentikasi aplikasi. Belum ada deploy atau request AI.

