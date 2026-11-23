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

- [x] Peta antarmuka referensi dan spesifikasi fitur Arenka orisinal.
- [x] Scaffold Astro + EmDash Cloudflare, D1/R2, Durable Object, passkey, health route, dan katalog model terlindungi session.
- [x] Migrasi domain buku, profil suara, bab, revisi, ekspor, dan pemakaian AI.
- [x] UI koleksi buku, profil suara, wizard blueprint lima tahap, dan workspace naskah.
- [x] API buku/bab/revisi dengan owner session, validasi, Origin check, dan revision cursor.
- [x] Riwayat revisi, pratinjau, pemulihan sebagai revisi baru, dan pengurutan bab.
- [x] Profil suara multi-versi: daftar/detail, pratinjau versi lama, simpan versi baru, dan jumlah buku per versi.
- [x] `.dev.vars` lokal diabaikan Git; nilai key tidak pernah dikirim ke gateway.
- [x] `npm run typecheck` lulus tanpa error/warning/hint (24 file).
- [x] `npm run build` lulus; tersisa peringatan bundle frontend >500 KB dan Wrangler tidak dapat menulis log di luar workspace.

## Berikutnya

- [ ] Lengkapi duplicate/arsip profil suara.
- [ ] Lengkapi metadata riwayat revisi dan kontrol penamaan bab.
- [ ] Rancang kuota, rate limit, dan ledger sebelum mengaktifkan chat AI.
- [ ] Verifikasi kontrak 9routers sebelum request pertama.
- [ ] Implementasikan Preview/PDF dan unduhan R2.
- [ ] Terapkan migrasi D1 lalu siapkan resource, binding, domain, dan deploy Cloudflare.
- [ ] Pecah bundle besar setelah UI editor lengkap.

## Keputusan dan batas

- AI hanya memberi usulan; tidak menimpa naskah otomatis.
- Browser referensi tidak membuktikan detail backend.
- EmDash mengelola admin/session; data produk Arenka menggunakan tabel terpisah.
- Owner selalu dari session, tidak dari request body; mutasi juga cek same-origin.
- Pulihkan revisi membuat snapshot baru dan mempertahankan versi lama.
- Belum ada deploy, penerapan migrasi Cloudflare, atau request ke 9routers.
- Jangan commit `.dev.vars`, `.env`, atau secret lain.

