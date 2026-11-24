# Arenka Writer — Status Proyek

Baca file ini dahulu saat melanjutkan pekerjaan.

Terakhir diperbarui: 2026-11-24

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

- [x] Peta referensi dan spesifikasi fungsional Arenka orisinal.
- [x] Scaffold Astro + EmDash Cloudflare, D1/R2, Durable Object, passkey, health route, dan katalog model terlindungi session.
- [x] UI koleksi buku, pencarian/filter, arsip/pulihkan, profil suara multi-versi, wizard blueprint lima tahap, outline versi, workspace, riwayat revisi, preview PDF, persetujuan bab, dan ekspor R2.
- [x] API domain dengan owner session, same-origin mutation, validasi ukuran JSON, validasi owner, dan konflik revisi/outline.
- [x] PDF Workers-compatible dari revisi yang sudah disetujui; source revision IDs dicatat D1, berkas privat di R2, unduh ulang memeriksa owner.
- [x] `.dev.vars` lokal diabaikan Git; nilai key tidak dikirim ke gateway.
- [x] `npm run typecheck` lulus tanpa error/warning/hint (33 file).
- [x] `npm run build` lulus; peringatan bundle frontend >500 KB dan Wrangler log di luar workspace masih ada.
- [x] Resource baru Cloudflare Arenkabiz: D1 `arenka-writer`, R2 `arenka-writer-media`, KV `arenka-writer-session`; binding D1/KV, SQLite Durable Object, dan custom domain ada di `wrangler.jsonc`.

## Berikutnya

- [x] Terapkan migration D1 0001–0004 ke database baru; migration 0002 sekarang aditif agar tabel revisi tidak diganti. Migration tracker D1 sudah diselaraskan.
- [ ] Verifikasi EmDash migrasi/setup di Cloudflare; jangan menimpa resource D1 lain.
- [ ] Set secret AI production jika kredensial sudah disiapkan; verifikasi kontrak gateway sebelum chat aktif.
- [ ] Deploy Worker dan custom domain `writer.arenka.biz.id`, lalu smoke check. Wrangler CLI tidak terautentikasi (token expired); upaya `wrangler login` sedang menunggu OAuth callback.
- [ ] Lengkapi duplikasi/arsip profil suara dan kontrol penamaan bab.
- [ ] Rancang kuota/rate limit/ledger sebelum chat AI dibuka.
- [ ] Lanjutkan audit security/privacy dan batas ukuran/retensi ekspor.
- [ ] Pecah bundel admin/editor setelah fungsi stabil.

## Keputusan dan batas

- AI hanya memberi usulan; tidak menimpa naskah otomatis.
- Browser referensi tidak membuktikan detail backend.
- EmDash mengelola admin/session; data produk Arenka memakai tabel terpisah.
- Owner API berasal dari session, mutasi cek same-origin, dan data dibatasi per owner.
- Pulihkan revisi membuat snapshot baru dan mempertahankan revisi lama.
- Preview menampilkan revisi aktif; ekspor hanya mengambil snapshot yang disetujui.
- Jangan commit `.dev.vars`, `.env`, atau secret lain.



