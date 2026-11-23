# Arenka Writer — Status Proyek

Baca file ini dahulu saat melanjutkan pekerjaan.

Terakhir diperbarui: 2026-11-23

## Target

| Item | Nilai |
|---|---|
| Domain | https://writer.arenka.biz.id |
| Repo | https://github.com/restupambudi99/arenka-writer |
| Hosting | Cloudflare Workers |
| Database | Cloudflare D1 |
| Berkas | Cloudflare R2 |
| CMS | Emdash (identitas/kontrak belum dikonfirmasi) |
| Gateway AI | https://9routers.vpsarenka.site/v1 |

## Aturan kerja

1. Arenka memakai merek, antarmuka, teks, dan aset orisinal. Gunakan produk
   referensi hanya untuk mempelajari kemampuan dan alur yang tampak.
2. Tandai observasi, inferensi, dan kebutuhan Arenka secara terpisah.
3. Jangan menaruh rahasia di repo; pakai Worker secrets dan `.dev.vars`.
4. Buat commit kecil per milestone dengan catatan yang memungkinkan agen lain
   meneruskan pekerjaan.
5. Spesifikasi fungsional ada di `docs/FUNCTIONAL-SPEC.md`; peta antarmuka
   referensi ada di `docs/REFERENCE-OBSERVATIONS.md`.

## Selesai

- [x] Observasi awal onboarding referensi (halaman pertama saja).
- [x] Peta fitur dashboard, buku, profil suara, pengaturan AI, paket, dan referral.
- [x] Peta wizard buku hingga sampul, layout halaman, dan daftar isi.
- [x] Catat batas bukti dan kebutuhan Arenka di spesifikasi v0.2.
- [x] Pastikan repo GitHub tersedia, kosong, dan akun memiliki hak push.

## Berikutnya

- [ ] Editor buku belum dipetakan; jangan membuat workspace pada akun utama.
      Gunakan demo publik atau akun uji jika tersedia.
- [ ] Identifikasi Emdash CMS yang dimaksud.
- [ ] Verifikasi kontrak 9routers (model, auth, format, streaming).
- [ ] Putuskan autentikasi sebelum migrasi D1.
- [ ] Tulis `docs/DESIGN.md` untuk antarmuka orisinal Arenka.
- [ ] Scaffold Workers + aplikasi frontend, D1/R2, dan gateway AI.
- [ ] Implementasikan modul berdasarkan peta fungsi yang terverifikasi.
- [ ] Siapkan binding domain produksi setelah aplikasi siap.

## Keputusan

- 2026-11-23 — Semua jawaban AI adalah usulan, bukan pengganti otomatis naskah.
- 2026-11-23 — Jangan menganggap backend Shireen terungkap dari browser.
- 2026-11-23 — Versi profil suara perlu dicatat untuk keterlacakan bab.
- 2026-11-23 — Ukur penggunaan token setelah format dan data biaya gateway
  terverifikasi.
