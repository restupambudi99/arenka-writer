# Arenka Writer — Rancangan Antarmuka MVP

Status: implementasi bertahap, 2026-11-24.

Rancangan ini memakai kebutuhan yang terlihat pada pemetaan antarmuka sebagai
masukan. Nama, teks, aset, tata letak, dan komponen Arenka harus orisinal.

## Struktur aplikasi

- Navigasi utama: Beranda, Buku, Profil Suara, Pengaturan AI.
- Navigasi kontekstual buku: Blueprint, Outline, Naskah, Preview.
- Panel sekunder buku: Sumber, Riset, Catatan, Konsistensi.
- Menu akun: profil dan keluar. Paket, referral, komunitas, serta CMS berada
  di luar MVP awal.

## Layar dan aksi

### Beranda dan koleksi buku

- Tombol **Buat buku** membuka wizard lima tahap.
- Tombol **Lanjutkan** membuka workspace buku terakhir.
- Kartu buku memperlihatkan status dan progres; menu tindakan menyediakan
  arsip/pulihkan.
- Pencarian judul dan filter Aktif/Arsip; status kosong memberi aksi buat buku.

### Profil Suara

- Daftar profil menampilkan status dan versi.
- Aksi: buat, lihat/edit, duplikasi. Hapus meminta konfirmasi dan menjelaskan
  hubungan profil dengan buku yang ada.
- Setiap revisi profil membuat versi baru; revisi lama tetap dapat ditinjau.

### Wizard buku

1. Jenis buku, judul sementara, dan Profil Suara.
2. Orientasi gagasan: genre/bidang, premis/tesis, dan nuansa.
3. Ukuran halaman, orientasi, serta target jumlah kata.
4. Ringkasan, pembaca sasaran, sudut pandang, dan hal yang perlu dijaga.
5. Metadata sampul, tipografi, nomor halaman, dan daftar isi.

Tombol **Kembali** mempertahankan isian. **Lanjut** memvalidasi dan menyimpan
tahap ke blueprint D1; blueprint dibuat pada tahap pertama. Tahap kelima
mengarahkan penulis ke workspace untuk meninjau dan melanjutkan.

### Pengaturan AI

- Pilihan sumber: gateway Arenka atau provider BYOK yang memang didukung.
- Kredensial disimpan di secret server-side; tidak dikirim kembali ke browser.
- Pemilih model menampilkan model yang tersedia dari konfigurasi server.
- Simpan preferensi dan uji koneksi merupakan aksi terpisah.

### Workspace

- Blueprint → Outline → Naskah → Preview menunjukkan urutan dan prasyarat.
- Editor menyimpan revisi dan menyajikan riwayat yang dapat dipratinjau/dipulihkan.
- Panel AI menghasilkan usulan terpisah. Penulis meninjau sebelum menerapkan.
- Persetujuan bab adalah tindakan terpisah; pemeriksaan konsistensi tidak
  mengubah teks.

### Preview dan ekspor

- Preview paginasi memuat sampul, daftar isi, bagian awal, bab, dan bagian akhir.
- Pengaturan mencakup ukuran/orientasi, tipografi, header, nomor halaman,
  sampul, dan gaya daftar isi.
- PDF dibuat dari versi yang disetujui, disimpan di R2 dengan metadata D1 dan
  tautan unduh terbatas.

## Pola interaksi

- Aksi utama memberi status loading, hasil, dan pesan error yang dapat dipahami.
- Aksi destruktif meminta konfirmasi yang menyebut objek dan akibatnya.
- Semua kontrol dapat dipakai keyboard, fokus terlihat, dan tata letak responsif.
- Jangan meniru teks, logo, ikon khusus, atau aset situs referensi.

## Implementasi saat ini

Astro + EmDash berjalan sebagai aplikasi server Cloudflare. Data domain memakai
D1 dan file memakai R2. Owner API berasal dari session EmDash; mutasi memeriksa
Origin dan data buku selalu dibatasi berdasarkan owner. Wizard lima tahap
menyimpan metadata blueprint ke D1. Outline berversi, bab, revisi manual,
riwayat, pemulihan sebagai revisi baru, pengurutan bab, persetujuan, preview,
dan ekspor PDF privat sudah tersedia.

Workspace menyediakan dialog saran AI dengan empat aksi: lanjutkan, tulis ulang,
brainstorm, dan kritik. Setelah pengguna menekan tombol permintaan, server
mengirim instruksi, blueprint terkait, profil suara yang dipatok pada buku, dan
hingga 20.000 karakter akhir draf ke 9routers. Hasil tetap terpisah sampai
penulis menerapkannya dan menyimpan revisi. Batas saat ini 4 request per menit
dan 30 per hari UTC per akun. Kontrak gateway belum diuji langsung.

Audit browser lokal menggunakan data sintetis memverifikasi wizard, outline,
pembuatan bab, preview, persetujuan, dan unduhan PDF. Pengiriman AI tidak
dilakukan. Production migration 0005, setup EmDash, secrets, autentikasi CLI,
deploy, serta domain belum tersedia.
