# TREATMENT: Apa yang Sebenarnya Terjadi pada File Saat Dihapus?
**Gaya**: Pictogram Motion (Otl Aicher geometry, grid shifts, flat bold colors, mono HUD)  
**Format**: Vertikal 1080x1920 (9:16)  
**Durasi**: 47 Detik | 24 FPS = 1.128 Frame  
**Audio / Mood**: Suara tenang, ramah, ritme beat-locked metronomis  
**Loop**: Frame 1127 transisi identik ke Frame 0 (laptop / file icon di desktop)

---

## 1. Palette & Design System
- **Hues**: 
  - Base Ink: `#0B0F19` (Dark Navy / Black)
  - Surface Cream: `#F8FAFC`
  - Accent Cyan: `#38BDF8` (Digital / Index)
  - Accent Amber: `#F59E0B` (Warning / Recovery)
  - Accent Red / Crimson: `#EF4444` (Delete / Overwrite / Ghost)
  - Accent Green: `#10B981` (Safe / Saved)
  - Ghost Teaser: `#A855F7`
- **Typography**:
  - Title: Heavy 900 Sans (`Inter Tight`, `System Bold`)
  - Subtitle: Medium Grotesk
  - Meta / HUD: Monospace (`DM Mono`, `JetBrains Mono`)
  - Status Chip: Pill badge dengan warna dinamis sesuai status FOTO.JPG

---

## 2. Status Chip Lifecycle (FOTO.JPG)
- Scene 1 (0.0s - 6.0s / Frame 0 - 144): `● STATUS: TERSIMPAN`
- Scene 2 (6.0s - 12.0s / Frame 144 - 288): `▲ STATUS: DI RECYCLE BIN`
- Scene 3 (12.0s - 18.0s / Frame 288 - 432): `✕ STATUS: ALAMAT DICORET`
- Scene 4 (18.0s - 24.0s / Frame 432 - 576): `◌ STATUS: DITANDAI KOSONG`
- Scene 5 (24.0s - 30.0s / Frame 576 - 720): `⚡ STATUS: RAWAN DIPULIHKAN`
- Scene 6 (30.0s - 36.0s / Frame 720 - 864): `◼ STATUS: TERTIMPA TOTAL`
- Scene 7 (36.0s - 42.0s / Frame 864 - 1008): `⚙ STATUS: TRIM BERSIH`
- Scene 8 (42.0s - 47.0s / Frame 1008 - 1128): `↻ STATUS: SELESAI / LOOP`

---

## 3. Breakdown Shot & Event Visual Tiap 2,5 Detik

### Scene 1: Hook & Ghost Teaser (0.0s – 6.0s | Frame 0 – 144)
- **Narasi**: *"Kamu hapus sebuah file. Tapi, sebenarnya ke mana perginya?"*
- **Visual**:
  - `0.0s`: Piktogram dokumen `FOTO.JPG` di tengah grid bergeser. Status: `TERSIMPAN`.
  - `2.5s`: Tombol Delete membesar menekan file.
  - `3.0s - 3.5s` (Frame 72-84): **Teaser Siluet Hantu (0,5 detik)** dengan glitch ungu/merah!
  - `4.0s`: Tanda tanya besar piktogram berputar.

### Scene 2: Recycle Bin — Hapus Biasa (6.0s – 12.0s | Frame 144 – 288)
- **Narasi**: *"Hapus biasa cuma mindahin file ke Recycle Bin. Datanya masih utuh dan gampang dipulihkan."*
- **Visual**:
  - `6.0s`: Cut tajam. Piktogram tempat sampah membuka tutupnya secara mekanis.
  - `8.5s`: File meluncur masuk. Status berubah: `DI RECYCLE BIN`.
  - `10.5s`: Tombol panah putar "RESTORE" menyala hijau, menunjukkan data masih 100% utuh.

### Scene 3: Bin Dikosongkan — Indeks Dicoret (12.0s – 18.0s | Frame 288 – 432)
- **Narasi**: *"Saat Bin dikosongkan, sistem cuma mencoret alamat file dari daftar indeks."*
- **Visual**:
  - `12.0s`: Split visual: Tabel Katalog / Buku Indeks di kiri, Blok Memori di kanan.
  - `14.5s`: Garis merah tegas mencoret baris `0x4A: FOTO.JPG`. Status: `ALAMAT DICORET`.
  - `16.5s`: Blok fisik di sisi kanan memancar cahaya — memperlihatkan isi bit-bit data masih tetap ada di sana!

### Scene 4: Ruang Ditandai Kosong (18.0s – 24.0s | Frame 432 – 576)
- **Narasi**: *"Ruang itu ditandai kosong, tapi isinya sama sekali belum dibuang."*
- **Visual**:
  - `18.0s`: Blok memori diberi label stempel putus-putus: `[AVAILABLE / KOSONG]`.
  - `20.5s`: Piktogram kacamata pembesar menyorot ke dalam blok: data biner foto masih duduk santai.
  - `22.5s`: Status chip menyala: `DITANDAI KOSONG`.

### Scene 5: Recovery Software (24.0s – 30.0s | Frame 576 – 720)
- **Narasi**: *"Aplikasi pemulihan kadang bisa membacanya lagi, selama belum tertimpa data baru."*
- **Visual**:
  - `24.0s`: Radar pemindai piktogram menyapu blok memori.
  - `26.5s`: Banner Peringatan tegas kuning/hitam: `⚠️ TIDAK SELALU BERHASIL`.
  - `28.5s`: File setengah terbayang berhasil terbaca ulang.

### Scene 6: Timpa Data Baru (30.0s – 36.0s | Frame 720 – 864)
- **Narasi**: *"Begitu ada file baru menimpa blok itu, barulah data lama benar-benar lenyap."*
- **Visual**:
  - `30.0s`: Piktogram balok solid berat `VIDEO_BARU.MP4` jatuh menimpa blok `FOTO.JPG`.
  - `32.5s`: Partikel data lama hancur rata.
  - `34.5s`: Status chip berubah: `TERTIMPA TOTAL`.

### Scene 7: SSD & TRIM (36.0s – 42.0s | Frame 864 – 1008)
- **Narasi**: *"Di SSD, perintah TRIM menandai blok untuk dibersihkan, lalu penghapusan fisik menyusul."*
- **Visual**:
  - `36.0s`: Skema sirkuit mikrochip SSD dengan sel-sel flash.
  - `38.5s`: Tag `TRIM` menancap di blok, menandai jadwal *garbage collection*.
  - `40.5s`: Penyapu siklus menghapus muatan listrik blok secara perlahan (bukan seketika).

### Scene 8: Outro & Seamless Loop (42.0s – 47.0s | Frame 1008 – 1128)
- **Narasi**: *"Sebelum jual laptop, hapus biasa belum cukup. Ikuti kami, satu fakta baru tiap hari."*
- **Visual**:
  - `42.0s`: Piktogram laptop dengan gembok pengingat.
  - `44.5s`: Sign-off badge: `IKUTI KAMI · SATU FAKTA BARU TIAP HARI`.
  - `46.5s - 47.0s`: Kamera kembali ke tampilan desktop awal laptop dengan kursor mengarah ke file `FOTO.JPG` (persis frame 0 untuk perfect infinite loop).
