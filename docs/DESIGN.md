# Arenka Writer — Rancangan Antarmuka MVP

Status: rancangan implementasi, 2026-11-23.

Rancangan ini memakai kebutuhan yang terlihat pada pemetaan antarmuka sebagai
masukan. Nama, teks, aset, tata letak, dan komponen Arenka harus orisinal.

## Struktur aplikasi

- Navigasi utama: Beranda, Buku, Profil Suara, Pengaturan AI.
- Navigasi kontekstual buku: Blueprint, Outline, Naskah, Preview.
- Panel sekunder buku: Sumber, Riset, Catatan, Konsistensi.
- Menu akun: profil dan keluar. Paket, referral, komunitas, serta CMS berada
  di luar MVP awal.

## Layar dan aksi

### Beranda

- Tombol **Buat buku** membuka wizard.
- Tombol **Lanjutkan** membuka workspace buku terakhir.
- Kartu buku memperlihatkan status dan progres; menu tindakan menyediakan
  arsip/pulihkan. Penghapusan harus memakai konfirmasi dan kebijakan pemulihan.
- Ringkasan kuota bersifat informatif. Kuota habis membatasi permintaan AI,
  tetapi tidak mengunci pembacaan, penyuntingan manual, atau ekspor lokal.

### Buku

- Pencarian judul dan filter Aktif/Arsip.
- Klik kartu membuka workspace; tindakan arsip tidak menghapus konten.
- Status kosong menyediakan tombol buat buku.

### Profil Suara

- Daftar profil menampilkan status dan versi.
- Aksi: buat, lihat/edit, duplikasi. Hapus meminta konfirmasi dan menjelaskan
  hubungan profil dengan buku yang ada.
- Setiap revisi profil membuat versi baru; revisi lama tetap dapat ditinjau.

### Wizard buku

1. Jenis dan Profil Suara.
2. Orientasi halaman.
3. Ukuran halaman.
4. Judul, ringkasan, target panjang.
5. Sampul, tipografi, header, nomor halaman, daftar isi.

Tombol **Kembali** mempertahankan isian. **Berikutnya** memvalidasi tahap
sekarang dan menyimpan draft. **Buat workspace** membuat entitas buku setelah
ringkasan konfigurasi ditinjau. Keluar dari wizard tidak membuat buku.

### Pengaturan AI

- Pilihan sumber: gateway Arenka atau provider BYOK yang memang didukung.
- Kredensial disimpan terenkripsi/secret server-side; tidak pernah dikirim
  kembali ke browser setelah disimpan.
- Pemilih model menampilkan model yang tersedia dari konfigurasi server.
- **Simpan** hanya mengubah preferensi akun. Uji koneksi harus menjadi aksi
  terpisah dan menampilkan biaya/kuota bila gateway menyediakannya.

### Workspace

- Blueprint → Outline → Naskah → Preview menunjukkan urutan dan prasyarat.
- Editor autosave dengan indikator tersimpan/gagal simpan dan riwayat revisi.
- Panel AI menghasilkan usulan terpisah. Tombol **Terapkan usulan** membuat
  revisi baru setelah pratinjau; tombol **Tolak** menutup usulan.
- Persetujuan bab adalah tindakan terpisah dan dapat dibatalkan lewat versi
  baru, tidak melalui penggantian diam-diam.
- Pemeriksaan konsistensi menghasilkan temuan yang dapat ditandai selesai,
  diabaikan, atau diperiksa ulang; temuan tidak mengubah teks.

### Preview dan ekspor

- Preview paginasi memuat sampul, daftar isi, bagian awal, bab, dan bagian
  akhir. Tautan daftar isi melompat ke bagian terkait.
- Panel pengaturan memuat ukuran/orientasi, tipografi, header, nomor halaman,
  sampul, dan gaya daftar isi. Perubahan preview belum permanen sampai **Simpan**.
- Checklist menerangkan masalah yang dapat diperbaiki otomatis dan yang
  memerlukan pemeriksaan manusia.
- **Buat PDF** hanya menghasilkan berkas dari versi yang sudah disetujui.
  Tombol ini tidak boleh menyetujui bab atau mengubah naskah.
- PDF disimpan di R2 dengan metadata ekspor di D1 dan tautan unduh terbatas.

## Pola interaksi

- Setiap aksi utama memberi status loading, hasil, dan pesan error yang dapat
  dipahami; retry tidak menggandakan revisi atau ekspor.
- Aksi destruktif atau perubahan status penting meminta konfirmasi yang
  menyebut objek dan akibatnya.
- Semua kontrol dapat dipakai keyboard, fokus terlihat, label pembaca layar
  tersedia, dan tata letak mengalir dari desktop ke ponsel.
- Jangan meniru teks, logo, ikon khusus, atau aset situs referensi.

## Batas implementasi saat ini

Implementasi kode menunggu keputusan autentikasi, identitas Emdash CMS, dan
kontrak 9routers. Komponen inti buku/editor dapat dibangun setelah ketiganya
dipastikan; jangan mengarang API CMS atau mengirim kredensial ke browser.

## Implementasi MVP awal

Layar `/` menampilkan koleksi aktif/arsip dengan pencarian. `/books/new`
meminta judul, jenis, target kata, dan profil suara siap. `/books/:id` memberi
outline bab, editor teks sederhana, serta simpan revisi manual. Profil suara
awal dapat dibuat lewat `/voices/new`.

API buku, bab, revisi, dan profil memakai `locals.user.id` sebagai owner.
Mutasi memeriksa `Origin`, validasi bentuk/ukuran JSON, dan membatasi query
berdasarkan owner pada D1. Konten bab baru disimpan sebagai revisi; penyimpanan
baru menghapus approval revision terdahulu agar status tidak tetap disetujui
setelah teks berubah.

## Batas implementasi saat ini

Implementasi sekarang belum mencakup wizard lima langkah penuh, rich text,
riwayat revisi yang dapat dibuka, drag-and-drop urutan bab, profil suara multi-
versi/edit, pembuatan naskah AI, Preview/PDF, atau pengaturan model UI. Semua
perubahan antarmuka memakai komponen dan copy Arenka sendiri.

Riwayat revisi dapat dibuka dari editor. Snapshot lama hanya dipratinjau; aksi
pulihkan meminta konfirmasi dan membuat revisi restore baru tanpa menghapus
revisi lama. Autosave belum aktif. Penyimpanan dan pemulihan memakai revision
cursor agar konflik perubahan sesi lain menghasilkan 409, bukan menimpa konten.

