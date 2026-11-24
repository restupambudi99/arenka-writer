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
- [x] UI koleksi buku, pencarian/filter, arsip/pulihkan, profil suara multi-versi, wizard blueprint lima tahap, outline versi, workspace, riwayat revisi, preview, persetujuan bab, dan ekspor PDF privat.
- [x] API domain dengan owner session, same-origin mutation, validasi ukuran JSON, pemeriksaan owner, serta konflik revisi/outline.
- [x] PDF Workers-compatible dari revisi disetujui; source revision IDs dicatat D1, file privat di R2, unduh ulang memeriksa owner.
- [x] Endpoint saran AI per bab: hanya buku milik pengguna, hasil tidak disimpan otomatis, 4 permintaan/menit dan 30/hari UTC per akun, usage gateway dicatat.
- [x] UI saran AI dengan pemberitahuan data yang dikirim, pilihan aksi, validasi, status/error, serta penerapan manual sebagai revisi.
- [x] Bug outline dinamis diperbaiki: judul dan tujuan kerangka yang dibuat otomatis tetap terisi.
- [x] `.dev.vars` lokal diabaikan Git; key tidak ditampilkan di browser atau repository.
- [x] Audit browser lokal memakai data sintetis: wizard 5 tahap, outline, pembuatan bab, preview, persetujuan, PDF, serta dialog AI.
- [x] PDF lokal valid (%PDF-1.4); satu ekspor sintetis lokal; tabel `ai_usage` lokal kosong (tidak ada panggilan gateway).
- [x] `npm run typecheck` lulus 34 file tanpa error, warning, atau hint.
- [x] `npm run build` berhasil; ada peringatan chunk frontend >500 KB dan Wrangler gagal menulis log di luar workspace.
- [x] Resource Cloudflare Arenkabiz: D1 `arenka-writer`, R2 `arenka-writer-media`, KV `arenka-writer-session`; binding D1/KV, Durable Object SQLite, dan konfigurasi custom domain tersedia di `wrangler.jsonc`.

## Sisa sebelum rilis produksi

- [x] Terapkan migration D1 0005 batas permintaan AI ke production; tabel dan tracker migration telah diverifikasi via Cloudflare API.
- [x] Konfirmasi dari konfigurasi EmDash 1.6.0 bahwa migrasi D1 CMS runtime berjalan otomatis pada request pertama; production masih menunggu deploy dan setup admin awal.
- [ ] Set secret AI production melalui workflow deployment. Belum mengirim manuskrip uji ke 9routers; verifikasi kontrak gateway tetap pending.
- [x] Tambahkan workflow GitHub Actions manual untuk build dan deploy Worker. Bootstrap menghapus deklarasi required secrets hanya dari konfigurasi hasil build, deploy Worker pertama, lalu memasang `AI_API_KEY` dan `AI_MODEL` tanpa mencetak nilainya.
- [ ] Jalankan workflow setelah GitHub Actions secrets `CLOUDFLARE_API_TOKEN`, `AI_API_KEY`, dan `AI_MODEL` tersedia. Wrangler lokal masih tidak terautentikasi; inventory terakhir belum menunjukkan Worker maupun custom domain.
- [ ] Setelah deploy, selesaikan setup admin EmDash dan smoke test domain; verifikasi kontrak gateway tanpa manuskrip pengguna. Audit tambahan retensi/ukuran ekspor dan pecah bundle editor/admin tetap terbuka. Pemulihan revisi end-to-end belum dikonfirmasi sesi audit.

## Keputusan dan batas

- AI hanya menghasilkan saran; penulis meninjau dan menerapkan secara manual.
- Saat meminta saran, instruksi, metadata blueprint, profil suara yang dipatok ke buku, dan hingga 20.000 karakter akhir draf dikirim ke 9routers. Hasil tidak tersimpan sampai diterapkan dan disimpan sebagai revisi.
- Rate limit mengatur jumlah request, bukan biaya token; token hanya dicatat jika gateway mengembalikannya.
- Browser referensi tidak membuktikan detail backend; implementasi Arenka memakai pola umum dengan nama, teks, dan aset orisinal.
- EmDash mengelola admin/session; data produk Arenka memakai tabel terpisah.
- Owner API berasal dari session; mutasi memeriksa same-origin dan data dibatasi per owner.
- Pulihkan revisi membuat snapshot baru dan mempertahankan revisi lama.
- Preview memakai revisi aktif; ekspor hanya mengambil snapshot yang disetujui.
- Jangan commit `.dev.vars`, `.env`, atau secret lain.
