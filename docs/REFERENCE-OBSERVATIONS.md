# Peta Fitur Referensi untuk Arenka

Tanggal observasi: 2026-11-23. Berdasarkan antarmuka web yang dapat dilihat
pada situs referensi. Catatan ini merangkum jenis layar dan pola interaksi,
bukan data akun tertentu, implementasi backend, atau endpoint privat. Semua
teks disampaikan sebagai ringkasan, bukan salinan copy.

## Peta layar dan alur

### Dashboard

- Navigasi menuju buku, profil suara penulis, pengaturan provider AI, referral,
  pembuatan buku, paket, dan bantuan.
- Aksi cepat mengarahkan pengguna untuk memulai buku, membuat profil suara,
  atau mengatur asisten AI.
- Area koleksi mendukung status aktif/arsip dan memiliki empty state.
- Terdapat ringkasan akses/paket dan tautan komunitas.

### Daftar buku

- Koleksi buku memiliki pencarian berdasarkan judul serta penyaring aktif dan
  arsip.
- Deskripsi mengarahkan alur dari gagasan/outline hingga ekspor.

### Profil suara penulis

- Profil suara dijelaskan sebagai acuan gaya untuk buku.
- Profil dapat memiliki versi dan status kesiapan.
- Ringkasan profil mencakup karakter penulis, cara menyampaikan pendapat,
  pilihan bahasa, ritme, cara menjelaskan, hubungan dengan pembaca,
  ekspresi, dan batas tulisan.
- UI menyediakan aksi untuk melihat/mengedit, menggandakan, menghapus, dan
  membuat profil.

### Pengaturan AI

- Pengguna dapat memilih layanan AI bawaan atau provider eksternal milik
  pengguna.
- Layar membedakan cara kuota/pembayaran untuk provider bawaan dan provider
  eksternal, menyediakan input kredensial provider, serta pemilih model utama.
- Simpan pengaturan dilakukan melalui aksi eksplisit.

### Pembuatan buku

- Ada panduan awal dua tahap yang dapat dilewati.
- Wizard pembuatan buku menampilkan tahapan Jenis & Profil Suara, Orientasi,
  Ukuran, Detail, serta Sampul & Halaman.
- Pilihan jenis buku (fiksi/nonfiksi) dan profil suara menjadi prasyarat
  sebelum melanjutkan.

### Paket dan pembayaran

- Layar memisahkan ringkasan akses, riwayat transaksi, pembelian/perpanjangan,
  serta tambahan kuota/slot.
- Kategori kuota yang tampak mencakup jumlah buku aktif, profil suara, dan
  pemakaian AI.
- Paket dapat mengatur durasi, buku/profil, kuota AI, riset, dan ekspor.
  Angka atau harga yang muncul dapat berubah menurut akun dan waktu; Arenka
  perlu menentukan model bisnisnya sendiri.

### Referral

- UI referral mencakup tautan berbagi, atribusi pendaftaran/pembelian,
  tahapan komisi dan penahanan, ringkasan status, serta pengaturan rekening
  pencairan.
- Tidak ada kode referral, URL unik, data rekening, atau status akun tertentu
  yang disimpan di dokumen ini.

## Kandidat kebutuhan Arenka

Pola ini dapat dipertimbangkan untuk MVP: dashboard dengan aksi cepat; buku
aktif/arsip dan pencarian; profil suara berversi; wizard pembuatan buku;
pemilihan provider/model AI; ringkasan kuota; ekspor; dan bantuan. Referral,
komunitas, dan marketplace dapat diputuskan terpisah.

Backend, skema data, aturan kuota, penagihan, serta pemrosesan kredensial
tidak dapat disimpulkan dari antarmuka. Implementasi Arenka harus memakai
arsitektur dan kontrak sendiri. Peta onboarding profil suara berada di
`docs/FUNCTIONAL-SPEC.md`.
