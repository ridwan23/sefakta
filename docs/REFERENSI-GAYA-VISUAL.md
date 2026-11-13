# Referensi gaya visual

Bahan untuk memilih `visualStyle` per episode (lihat `AGENTS.md` dan `docs/WORKFLOW-AI-AGENT.md` §7). Sumbernya katalog eksternal "Explainer Videos with Claude" (20 gaya). Yang diambil hanya pola visual dan gerak, bukan nama, logo, atau font pihak lain. Palet di bawah adalah titik awal. Palet akhir tetap dipilih per episode dan lolos uji kontras validator.

## Cara memakai

1. Tentukan isi fakta dan pilarnya, lalu pilih 1 gaya dari tabel ringkas.
2. Baca bagian gaya itu: palet, elemen, gerak khas.
3. Wujudkan dengan kit yang disebut di kolom "Kit". Gaya berstatus **belum ada** atau **sebagian** butuh komponen baru di `src/shared/` (lihat `docs/RENCANA-SHARED-OBJEK.md`). Jangan membuatnya di folder topik.
4. Catat di brief: `visualStyle: { name, reason, tone, palette }`.

## Tabel ringkas

Status kit diperiksa dari ekspor `src/shared/*/index.ts` dan komposisi katalog (KatalogGerak, KatalogPola, KatalogObjek, KatalogObjekIlustrasi, KatalogCollage) pada 2026-11-13.

| Gaya | Cocok untuk | tone | Kit | Status |
|---|---|---|---|---|
| Peta perjalanan | sejarah, geopolitik, rute dagang, migrasi | dark | `maps/WorldMap`, `camera/CameraRig`, `anim/DrawPath`, `Pulse` | siap |
| Cerita data | angka, tren, perbandingan | dark/light | `patterns/BigNumber`, `RankList`, `Compare`, `anim/CountUp`, `Highlight` | siap; grafik garis/batang belum ada komponen |
| Vektor datar | sains, kesehatan, cara kerja benda | light | `objects/` (Sun, Person, HeadProfile, Car, Bowl, Cup, …), `labels/Label`, `render/Shaded` | siap |
| Tipografi kinetik | hook, mitos vs fakta, tips | dark | `anim/SplitText`, `Swap`, `patterns/MythFact` | siap |
| Papan tulis | proses langkah demi langkah | light | `anim/DrawPath`, `patterns/ProcessFlow` | sebagian: belum ada garis spidol bergoyang dan arsir |
| Clay 3D lembut | sains keseharian, makanan, benda | light | `three/Stage3D`, `Model`, `render/Shaded` | sebagian: model hanya dari registri CC0 |
| Isometrik garis | sistem, alur, logistik | light | `three/`, `anim/DrawPath` | sebagian: belum ada grid isometrik |
| Kolase dokumenter | sejarah, "kenapa ini terjadi", berita | light | `collage/` (PaperSurface, Cutout, Doc, Stamp, Tag, Tape, PaperClip, Highlighter, MarkerCircle, Underline, MarkerArrow), `labels/Label` | siap |
| Potongan kertas | cara kerja, proses, hangat | light | `collage/` (PaperSurface, Cutout `torn={[]}`) | sebagian: potongan dan permukaan ada; lipat/pita belum |
| Siluet | kisah sejarah, alam, emosional | dark | `camera/CamLayer`, `look/Backdrop` | sebagian: latar gradien ada, siluet berlapis belum |
| Persamaan/matematika | fisika, statistik, rumus | dark | `anim/DrawPath`, `CountUp` | sebagian: tanpa render rumus |
| Komik, risograf, retro, piksel, kaca cair, partikel, terminal, grid Swiss, stickman | lihat katalog | — | — | belum dinilai; pakai hanya bila topik sangat cocok |

## Detail gaya prioritas

### Peta perjalanan

- **Palet awal:** laut `#1C2B36` / `#2C4352`, daratan `#D9CBB0`, bayangan daratan `#B9A889`, batas `#6E6250`, rute `#E04B3A`, sorot `#F2B441`, label `#F5F2EA`.
- **Elemen:** tekstur halus di daratan, batas tipis, garis pantai sedikit lebih tebal, graticule opsional. Pin, cincin, dan denyut untuk lokasi. Negara disorot dengan isi warna atau arsir. Label dalam kotak dengan garis penunjuk. Panel angka kecil yang terikat ke tempat.
- **Gerak khas:** kamera terbang dari luas ke wilayah lalu ke titik, dengan zoom melengkung, bukan lurus. Kamera mengikuti rute yang sedang tergambar dengan ujungnya tetap di frame. Kamera menarik mundur untuk menunjukkan gambaran besar. Pin jatuh dengan pantulan kecil lalu cincin berdenyut. Wilayah terisi berurutan untuk menunjukkan penyebaran.

### Cerita data

- **Palet awal (gelap):** latar `#0F1720`, teks `#EEF1F4`, grid `#2A3540`, sorot `#FF6B4A`, data `#4C8DF6` / `#2BB3A3`, konteks abu `#7D8894`, aksen `#F5C451`. Varian terang: latar `#F7F6F2`, teks `#1A1F24`, grid `#DDDAD2`.
- **Aturan:** seri konteks berwarna abu-abu. Warna terang hanya untuk seri yang sedang diceritakan. Label langsung di garis atau batang, bukan legenda. Judul menyatakan kesimpulan, bukan nama metrik.
- **Gerak khas:** garis tergambar sepanjang sumbu waktu dengan titik di ujung dan nilai berjalan. Batang tumbuh dari dasar dengan stagger. Peringkat berpindah posisi dengan halus. Angka menghitung naik dengan digit tabular agar tidak bergetar. Seri konteks diredupkan saat seri utama disorot. Garis penunjuk tergambar ke titik balik. Satu bentuk grafik berubah jadi bentuk lain saat cerita bergeser (total → porsi).

### Vektor datar

- **Palet awal:** tinta `#172235`, gading `#F6F5EE`, kobalt `#4667FF`, teal `#16B99A`, koral `#FF765E`, amber `#FFC65C`. Pakai subset kecil per scene.
- **Aturan:** satu ilustrasi atau diagram dominan, objek sekunder yang menjelaskan interaksi, sedikit detail mikro yang bermakna (sambungan, potongan, bagian dalam). Objek punya status (diam, aktif, berubah, selesai). Jangan isi frame dengan bentuk dekoratif yang tidak berkaitan. Bentuk yang sama dipertahankan saat perannya berubah agar penonton bisa mengikutinya.

### Tipografi kinetik

- **Palet awal:** tinta `#10131C`, putih tulang `#F5F2EB`, kobalt `#485FFF`, kuning asam `#E8F54D`, koral `#FF715B`.
- **Hierarki:** kata hero besar (boleh terpotong di tepi asal maknanya tidak hilang), kalimat penjelas pendek, detail mikro hanya bila berguna.
- **Gerak khas:** reveal bermasker, kata naik dari garis dasar, tracking melebar atau menyempit. Gerak per huruf hanya untuk momen penting. Perubahan yang mengajar: ganti satu istilah sambil mempertahankan komposisi, pecah frasa jadi komponen lalu hubungkan, headline berubah jadi judul diagram. Jangan memorf kata yang tidak berkaitan.
- **Batas SeFakta:** jangan bersaing dengan caption. Satu fokus baca pada satu waktu.

### Kolase dokumenter

- **Palet awal:** kraft `#C8A97E`, kertas koran `#F1ECE0`, tinta `#1B1B1B`, stabilo `#F7E14B`, coretan merah `#D33A2C`, teal `#2F7F86`.
- **Lapisan:** permukaan bertekstur (kraft, karton). Potongan kertas tepi sobek dengan bayangan lembut. Dokumen dengan isi samar dan satu baris kunci yang terbaca. Foto potong dengan halftone dan tepi putih. Selotip, klip, dan stiker sebagai aksen saja.
- **Anotasi:** sapuan stabilo tidak rata (blend multiply), lingkaran, garis bawah, dan panah spidol yang tergambar goresan demi goresan.
- **Gerak khas:** kertas meluncur, jatuh, lalu settle dengan sedikit rotasi dan bayangan berubah. Dokumen masuk, kamera mendorong ke satu baris, baris itu disorot. Foto berlapis dengan parallax. Label pop dengan skala cepat lalu settle.

### Potongan kertas

- **Palet awal:** krem `#F3EBDD`, arang `#243139`, terakota `#C56B50`, mustard `#E8B65C`, sage `#8A9B7C`, biru pudar `#7C9DA5`, karton `#FFF8EB`.
- **Material:** tepi potongan sedikit tidak sempurna, serat halus yang stabil, tepi kertas tipis terlihat, satu arah cahaya, bayangan lembut antarlapis. Kedalaman dangkal, bukan 3D penuh.
- **Gerak khas:** potongan berkumpul jadi ilustrasi. Lapisan terangkat, terlipat, bergeser, lalu settle. Pita terbuka jadi diagram. Tumpukan terpisah untuk memperlihatkan mekanisme dalam. Kertas tidak boleh bergerak seperti cairan atau karet. Gerak langkah stop-motion hanya untuk potongan fisik. Kamera, teks, dan diagram tetap halus.

### Papan tulis

- **Palet awal:** papan `#FBFBF8`, spidol hitam `#1C1C1C`, biru `#2D5DA8`, merah `#D0412E`, hijau `#3E8E5A`, stabilo `#F7D55C` (isi transparan saja).
- **Gerak khas:** semua elemen baru digambar, ditulis, atau dihapus, tidak sekadar fade. Kecepatan menggambar bervariasi. Panah memakai overshoot kecil. Isi diarsir cepat setelah garis luar. Pindah ide dengan menggeser kamera ke area papan baru, zoom out untuk menunjukkan hubungan, atau hapus cepat untuk ganti topik.

## Prinsip lintas gaya

Dipakai di rubrik `docs/REVIEW-VISUAL.md`.

- **Kepadatan:** sekitar 4–6 poin belajar per 60 dtk, dirangkai dalam satu cerita visual. Pakai skenario konkret, mekanisme, perbandingan, atau sebab-akibat.
- **Beat:** sekitar 12–18 perkembangan visual bermakna per 60 dtk. Contohnya informasi baru muncul, objek berubah status, diagram berkembang, data berpindah, perbandingan terbentuk. `motion:check` menghitung perkiraannya dan memberi peringatan di bawah 10.
- **Hierarki 3 tingkat:** headline singkat, visual utama yang memperlihatkan apa yang terjadi, lalu label atau anotasi pendukung. Tidak wajib ketiganya di setiap komposisi.
- **Bisa dipahami tanpa narasi:** grafik membawa sebagian besar penjelasan.
- **Transisi tumbuh dari aksi:** jangan menghentikan seluruh komposisi sebelum scene berikutnya.
- **Angka demonstrasi bukan data:** nilai ilustratif tidak boleh tampil seolah hasil ukur. Semua angka nyata harus ada di `facts[]`.
