# Arenka Writer — Spesifikasi Fungsional v0.2

Status: rancangan; fakta situs referensi hanya dicatat pada bagian Observasi.
Tanggal: 2026-11-23.

## Tujuan produk

Workspace menulis buku dengan bantuan AI yang mengikuti profil suara penulis.
Merek, antarmuka, teks, dan aset Arenka harus dibuat sendiri. Situs Shireen
digunakan sebagai referensi kemampuan yang tampak; tidak menyalin DOM,
stylesheet, copy, maupun asetnya.

## Observasi referensi: onboarding

Halaman `https://shireen.id/onboarding`, diamati pada sesi browser pengguna
yang sudah login. Observasi awal melalui accessibility tree; alur lanjutan
belum ditelusuri.

- Judul dan pengantar meminta pengguna mengenali suara menulisnya.
- Ada aksi untuk melewati pengisian dan aksi untuk memilih pengalaman hanya
  membaca/membeli buku.
- Navigasi menunjukkan lima bagian: identitas/karakter, gaya bahasa/ritme,
  pola pikir/interaksi, batasan/kenyamanan, dan tulisan terdahulu (opsional),
  diikuti langkah tinjau/simpan. Indikator halaman pada layar menunjukkan
  bagian 1 dari 5.
- Pertanyaan yang teramati pada bagian pertama: karakter penulis dan
  keberanian berpendapat. Keduanya menyediakan beberapa pilihan preset dan
  pilihan Lainnya.
- Ada toggle bantuan AI yang menyatakan jawaban Lainnya dan cuplikan tulisan
  dikirim ke koneksi AI aktif ketika pengguna meninggalkan kolom atau
  melanjutkan. Toggle tidak diaktifkan selama observasi.
- Situs menyatakan draf disimpan di browser jika penyimpanan tersedia;
  jawaban baru menggantikan usulan AI untuk jawaban lama.

## Batas bukti

Observasi di atas tidak mengungkap implementasi backend, skema database,
endpoint privat, autentikasi, atau perilaku setelah pengiriman. Jangan
menganggap kemampuan produk yang direncanakan Arenka sebagai fitur Shireen
yang telah diverifikasi. Jangan kirim data atau aktifkan integrasi AI di akun
referensi saat melakukan inspeksi.

## Kebutuhan Arenka yang direncanakan

### Profil suara penulis

- Intake bertahap dengan lima topik dan layar tinjau/simpan, dapat dilewati
  serta dilanjutkan kembali.
- Pertanyaan mendukung preset dan jawaban bebas. Bantuan AI harus opsional,
  menyebut data yang dikirim, dan tidak mengganti jawaban penulis tanpa
  persetujuan.
- Simpan draf lokal selama intake. Setelah disimpan, simpan profil di D1;
  versi profil dicatat pada bab yang dihasilkan agar hasil dapat dilacak.
- Impor sampel tulisan ke R2 hanya setelah tindakan eksplisit pengguna.

### Ruang kerja buku

- Kelola buku dan bab, simpan revisi, dan susun konteks dari profil suara,
  catatan buku, bab terkait, serta sumber riset.
- Editor dan percakapan AI berdampingan. Hasil AI berupa saran yang dapat
  disisipkan atau ditolak dan tidak menimpa naskah secara otomatis.
- Pemeriksaan kesinambungan menghasilkan temuan yang dapat ditinjau; tidak
  mengubah naskah otomatis.
- Ekspor minimal PDF. Simpan metadata di D1 dan berkas besar di R2.

Semua butir pada bagian ini adalah kebutuhan Arenka, bukan klaim tentang
backend Shireen. Integrasi Telegram, pembayaran, paket kuota, dan fitur lain
belum masuk lingkup sampai kebutuhan dan bukti teknisnya dipastikan.

## Infrastruktur yang diminta

- Cloudflare Workers; D1 untuk data relasional dan R2 untuk berkas.
- Emdash CMS diminta, tetapi produk/paket dan kontrak integrasinya belum
  diidentifikasi. Jangan menambah dependensi CMS sebelum jelas.
- AI melalui `https://9routers.vpsarenka.site/v1`. Format API dan model perlu
  diverifikasi; panggilan wajib berada di satu gateway server-side.
- Domain target: `https://writer.arenka.biz.id`.
- Jangan simpan token atau rahasia di Git; gunakan secrets dan `.dev.vars`.

## Prinsip data dan AI

- Data milik pengguna tidak dipakai untuk AI sampai pengguna memulai tindakan
  yang menjelaskannya.
- AI menghasilkan usulan. Penulis memegang kendali atas naskah.
- Catat penggunaan token per panggilan setelah kontrak respons 9routers
  diverifikasi. Jangan mengklaim biaya akurat sebelum harga/model diketahui.

## Model data awal (rancangan)

`user`, `voice_profile`, `book`, `book_bible`, `chapter`, `chapter_revision`,
`research_source`, `continuity_finding`, dan `usage_ledger`. Rancangan ini
perlu disesuaikan dengan pilihan autentikasi dan kebutuhan retensi sebelum
migrasi D1 dibuat. R2: bucket sampel, riset, dan ekspor (nama final menyusul).

## Pertanyaan terbuka

1. Emdash CMS yang dimaksud: tautan produk/repo dan peran yang diinginkan.
2. 9routers: endpoint model, autentikasi, streaming, dan format API.
3. Autentikasi Arenka: Cloudflare Access, OAuth, atau sesi aplikasi.
4. Layar referensi lain setelah onboarding agar parity dapat dipetakan.
