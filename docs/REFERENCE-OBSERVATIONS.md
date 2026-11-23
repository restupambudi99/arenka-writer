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
- Orientasi menyediakan Potret dan Lanskap; ukuran menyediakan A4, A5,
  B5, B6, dan ukuran kustom. A5 tampak sebagai nilai awal.
- Detail buku meminta judul sementara, ringkasan/tujuan (batas 5.000
  karakter), dan target kata (nilai awal yang tampil 30.000).
- Tahap Sampul & Halaman memiliki tab Sampul, Halaman, dan Daftar Isi.
  Sampul mendukung gambar opsional atau gambar yang sudah memuat teks,
  subjudul, ISBN opsional, dedikasi opsional, serta pratinjau langsung.
- Tab Halaman memuat pilihan font naskah dan heading, ukuran teks, huruf awal
  bab, inden paragraf, header, dan beberapa format nomor halaman.
- Daftar Isi dijelaskan dibuat otomatis dari bab dan nomor mengikuti layout
  ekspor tanpa AI. Gaya nomor halaman daftar isi dapat dipilih.
- Tombol akhir membuat workspace buku; tombol tersebut tidak ditekan.

### Workspace buku

Workspace yang diberikan pengguna dapat diamati dalam keadaan tanpa bab.
Catatan berikut merangkum kontrol dan alur, tanpa menyimpan judul, sinopsis,
nama pemilik, atau isi buku.

- Header menyediakan kembali ke koleksi, panduan menulis, pengaturan buku,
  arsip, tampilan baca penuh, dan unduh.
- Alur utama diurutkan sebagai Blueprint → Outline → Naskah → Preview &
  unduh. Blueprint dijelaskan sebagai arah buku (premis, pembaca, tujuan,
  batasan) dengan riwayat versi. Outline menyusun urutan/tujuan bab dan
  harus disetujui bersama Blueprint sebelum mulai menulis. Bab dapat ditulis
  manual atau lewat chat. Perubahan naskah disebut tersimpan otomatis dan
  versi dapat disetujui.
- Blueprint yang terbuka memperlihatkan dokumen terstruktur dengan bagian
  Tesis, Pembaca, Janji ke pembaca, Cakupan, Standar bukti, Perbedaan dari
  profil suara, dan Yang belum diputuskan penulis. Status persetujuan dan
  riwayat versi dapat dilihat; riwayat menyediakan perbandingan perubahan.
- Blueprint memakai editor teks kaya yang sama dengan ribbon tab Beranda,
  Sisipkan, Referensi, Tinjau, dan AI. Beranda mencakup tipografi, format
  paragraf, gaya heading, serta undo/redo. Observasi tidak mengaktifkan AI,
  mengubah teks, atau menavigasi ke Outline.
- Panel Bagian menunjukkan progres outline, daftar bab, catatan ide, dan
  konsistensi. Konsistensi menyimpan temuan serta catatan fakta/tokoh/detail.
  Pemeriksaan otomatis berjalan saat bab disetujui; tombol pemeriksaan manual
  memakai satu interaksi AI. UI menyebut temuan tidak mengubah naskah atau
  persetujuan otomatis.
- Bagian tambahan mencakup Sumber (unggah TXT, PDF, DOCX dengan batas ukuran
  dan jumlah file), Riset (hasil diskusi Researcher yang dapat disimpan untuk
  Blueprint/Outline), Catatan ide, Konsistensi, serta Pembuka & penutup.
- Pembuka/penutup mencakup halaman seperti kata pengantar/persembahan dan
  epilog/tentang penulis; posisinya sebelum daftar isi atau setelah bab akhir.
  Daftar pustaka dibuat dari sitasi yang disisipkan lewat toolbar.
- Tab Asisten menyediakan sesi/riwayat percakapan, informasi konteks buku,
  sesi baru, mode Penulis dan Riset, pemilih model, input instruksi, serta
  penambahan gambar/referensi. Tidak ada prompt dikirim saat observasi.
- Preview & unduh memisahkan pratinjau, tata letak, hasil ekspor PDF, dan
  checklist siap terbit. PDF final nonaktif saat belum ada bab.
- Checklist mencakup status penulisan/persetujuan bab, judul bab, temuan
  konsistensi, sitasi dan bibliografi, judul/penulis, sampul, teks alternatif
  gambar, nomor halaman, halaman hak cipta dan tentang penulis. Pembaca juga
  dapat menandai pemeriksaan manual seperti membaca naskah penuh, izin materi
  pihak ketiga, sinopsis belakang, dan ISBN bila diperlukan.
- Pengaturan layout mencakup ukuran/arah halaman, target kata, sampul,
  tipografi/heading, header, penomoran, dan daftar isi dengan pratinjau.
  Simpan pengaturan, unggah, buat/arsipkan/hapus, persetujuan bab, jalankan AI,
  dan ekspor tidak dilakukan.

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

### Halaman publik: fitur dan roadmap

- Roadmap memisahkan kemampuan yang ditandai tersedia dari fase yang
  direncanakan. Kemampuan tersedia yang disebut di sana: pembentukan profil
  gaya dari contoh tulisan, interviewer proaktif, riset mendalam, pemeriksaan
  konsistensi, editor split-view, asisten melalui Telegram, dan ekspor PDF.
- Fase yang ditandai direncanakan: persiapan buku siap terbit, penyusunan
  paper ilmiah, dan adaptasi cerita menjadi komik. Ini bukan fitur tersedia
  yang terverifikasi.
- Halaman publik menyebut split-view sebagai percakapan di satu sisi dan
  naskah di sisi lain; penulis meninjau, menyunting, dan menyetujui hasil.
- FAQ publik menyebut pengguna dapat memulai dari ide tanpa draft, naskah
  tetap dapat diedit, dan pengguna memegang keputusan kreatif.
- FAQ riset meminta pengguna memeriksa fakta. Profil gaya bukan jaminan
  bebas plagiarisme; orisinalitas, kutipan, dan sumber tetap perlu ditinjau.

## Kandidat kebutuhan Arenka

Pola ini dapat dipertimbangkan untuk MVP: dashboard dengan aksi cepat; buku
aktif/arsip dan pencarian; profil suara berversi; wizard pembuatan buku;
pemilihan provider/model AI; ringkasan kuota; ekspor; dan bantuan. Referral,
komunitas, dan marketplace dapat diputuskan terpisah.

Backend, skema data, aturan kuota, penagihan, serta pemrosesan kredensial
tidak dapat disimpulkan dari antarmuka. Implementasi Arenka harus memakai
arsitektur dan kontrak sendiri. Peta onboarding profil suara berada di
`docs/FUNCTIONAL-SPEC.md`.

Roadmap bersifat pernyataan publik dan dapat berubah. Catatan ini tidak
memverifikasi secara langsung tiap fitur yang disebut tersedia di dalam
workspace.

## Batas penelusuran

Editor utama dan seluruh alur AI belum diamati secara interaktif. Jangan
mengirim prompt, mengunggah berkas, menyetujui bab, atau menambah/menghapus
konten pada akun referensi untuk meneruskan inspeksi. Alur AI memerlukan
permintaan eksplisit dan perubahan workspace; gunakan akun uji untuk tahap
tersebut bila tersedia.
