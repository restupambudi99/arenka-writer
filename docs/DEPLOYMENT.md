# Deploy Arenka Writer

Workflow production berada di **Actions → Deploy Arenka Writer** dan hanya berjalan
saat dipicu manual. Ia menjalankan typecheck, build, bootstrap Worker, kemudian
memasang secret AI. Nilai secret tidak ditulis ke log.

## Persiapkan GitHub Actions secrets

Di repository GitHub, buka **Settings → Secrets and variables → Actions → New
repository secret**, lalu buat tiga secret berikut:

- `CLOUDFLARE_API_TOKEN`: token untuk deployment. Gunakan role Workers Editor
  untuk account, serta Workers Routes Write pada zone `arenka.biz.id`.
- `AI_API_KEY`: API key 9routers yang sudah disimpan lokal di `.dev.vars`.
- `AI_MODEL`: nama model yang digunakan oleh Arenka Writer.

Dokumentasi izin deployment Cloudflare:
https://developers.cloudflare.com/workers/authorization/

Jangan menaruh nilai secret di repository, issue, atau log workflow.

## Jalankan

1. Buka tab **Actions** pada repository dan pilih **Deploy Arenka Writer**.
2. Klik **Run workflow** pada branch `main`.
3. Tunggu job selesai. Jika gagal, baca ringkasan/error job; jangan menempelkan nilai secret ke laporan.
4. Setelah sukses, buka `https://writer.arenka.biz.id/_emdash/admin` dan selesaikan setup admin EmDash/passkey.
5. Lakukan smoke check halaman utama, autentikasi, koleksi, dan health route sebelum menguji AI.

Worker pertama kali dideploy tanpa deklarasi validasi required secrets di konfigurasi
hasil build, lalu workflow menambahkan `AI_API_KEY` dan `AI_MODEL` menggunakan
`wrangler secret put`. Ini diperlukan karena Worker belum ada saat secret pertama
kali dipasang. Konfigurasi sumber `wrangler.jsonc` tetap menyatakan kedua secret
wajib. Pada deployment berikutnya, Wrangler mempertahankan secret yang sudah ada.

Migrasi D1 product 0001–0005 sudah diterapkan. EmDash menjalankan migrasi CMS
runtime secara otomatis saat Worker menangani request pertama; halaman admin lalu
meminta setup awal. Jangan menjalankan ulang SQL EmDash secara manual.

Workflow tidak mengirim prompt uji ke 9routers. Endpoint AI baru memanggil gateway
setelah pengguna meminta saran dari workspace.
