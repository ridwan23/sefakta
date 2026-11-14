# Referensi gaya visual

Bahan untuk memilih `visualStyle` per episode (lihat `AGENTS.md` dan `docs/WORKFLOW-AI-AGENT.md` §7). Sumbernya katalog eksternal "Explainer Videos with Claude" (20 gaya). Yang diambil hanya pola visual dan gerak, bukan nama, logo, atau font pihak lain. Palet di bawah adalah titik awal. Palet akhir tetap dipilih per episode dan lolos uji kontras validator.

## Cara memakai

1. Gaya episode datang dari undian kreatif (`npm run creative:draw`, `docs/PANDUAN-KREATIF.md`). Kartu sudah disaring sesuai pilar dan riwayat. Baca bagian gaya kartu itu di sini.
2. Baca bagian gaya itu: palet, elemen, gerak khas.
3. Wujudkan dengan kit yang disebut di kolom "Kit". Gaya berstatus **belum ada** atau **sebagian** butuh komponen baru di `src/shared/` (lihat `docs/RENCANA-SHARED-OBJEK.md`). Jangan membuatnya di folder topik.
4. Catat di brief: `visualStyle: { name, reason, tone, palette }`.

## Tabel ringkas

Status kit diperiksa dari ekspor `src/shared/*/index.ts` dan komposisi katalog (KatalogGerak, KatalogPola, KatalogObjek, KatalogObjekIlustrasi, KatalogCollage, KatalogGaya) pada 2026-11-14.

| Gaya | Cocok untuk | tone | Kit | Status |
|---|---|---|---|---|
| Peta perjalanan | sejarah, geopolitik, rute dagang, migrasi | dark | `maps/WorldMap`, `camera/CameraRig`, `anim/DrawPath`, `Pulse` | siap |
| Cerita data | angka, tren, perbandingan | dark/light | `patterns/BigNumber`, `RankList`, `Compare`, `anim/CountUp`, `Highlight` | siap; grafik garis/batang belum ada komponen |
| Vektor datar | sains, kesehatan, cara kerja benda | light | `objects/` (Sun, Person, HeadProfile, Car, Bowl, Cup, …), `labels/Label`, `render/Shaded` | siap |
| Tipografi kinetik | hook, mitos vs fakta, tips | dark | `anim/SplitText`, `Swap`, `patterns/MythFact` | siap |
| Papan tulis | proses langkah demi langkah | light (kapur: dark) | `sketch/` (BoardSurface putih/kapur, SketchPath bergetar, Hatch, SketchText font Caveat), `patterns/ProcessFlow` | siap |
| Clay 3D lembut | sains keseharian, makanan, benda | light | `render/MaterialStyle material="clay"` membungkus `objects/` (2D); 3D: `three/Stage3D`, `Model` | siap (2D); 3D hanya model registri CC0 |
| Isometrik garis | sistem, alur, logistik | light | `iso/` (isoView, IsoGrid, IsoBox, IsoFlow) | siap |
| Kolase dokumenter | sejarah, "kenapa ini terjadi", berita | light | `collage/` (PaperSurface, Cutout, Doc, Stamp, Tag, Tape, PaperClip, Highlighter, MarkerCircle, Underline, MarkerArrow), `labels/Label` | siap |
| Potongan kertas | cara kerja, proses, hangat | light | `collage/` (PaperSurface, Cutout `torn={[]}`, PaperFold, Ribbon), `anim/stepped` | siap |
| Siluet | kisah sejarah, alam, emosional | dark | `silhouette/` (SilhouetteSky, Ridge: mountains/hills/trees/city/grass, Haze), `camera/CamLayer` | siap |
| Persamaan/matematika | fisika, statistik, rumus | dark | `math/Formula` (LaTeX mini: frac, sqrt, ^, _, \hl, \text), `anim/CountUp` | siap; tanpa matriks/integral |
| Diagram gelap/kosmik | mikroskop, saraf, suara, antariksa | dark | `look/Backdrop`, `render/`, `camera/` | siap (dipakai 3 episode; undian menghindarinya untuk sementara) |
| Komik | kisah tokoh, kejadian berurutan, humor | light | `comic/` (comicGrid, ComicPage, ComicPanel ber-zoom, SpeechBubble speech/shout/thought/box, SoundWord font Bangers, ComicBurst, SpeedLines, Halftone; teks Comic Neue) | siap (2026-11-14) |
| Risograf | sejarah, budaya, alam | light | `riso/` (RisoPaper, RisoInk per pelat, RisoPrint membungkus gaya lain dengan pemisahan kanal; palet `RISO`) | siap (2026-11-14) |
| Stickman | tubuh, eksperimen, kebiasaan | light | `stickman/` (Stickman bersendi, POSES bernama, siklus jalan/lari, masuk tergambar) + `sketch/` | siap (2026-11-14) |
| Grid Swiss | data, sejarah teknologi, editorial | light | `swiss/` (swissGrid 6×12 dalam area aman, SwissGridLines, SwissBlock, SwissType Inter 900, SwissRule) | siap (2026-11-14) |
| Medan partikel | antariksa, gas, cahaya, kerumunan | dark | sebagian (`anim/Particles`) | dinilai: **prioritas 3** |
| Terminal | keamanan siber, data, internet | dark | — (butuh font mono di registri) | dinilai: **prioritas 3**, hanya Teknologi |
| Retro, piksel 8-bit, kaca cair | — | — | — | dinilai: **tidak diprioritaskan** (lihat bawah) |

## Penilaian 9 gaya sisa (2026-11-14)

Dasar penilaian: nama dan "best for" di katalog. Prompt lengkap gaya-gaya ini belum dibaca. Dinilai juga kecocokan dengan 6 pilar, kemampuan menjelaskan mekanisme, biaya membuat kit di Remotion, dan risiko terhadap identitas. Gaya yang kitnya belum ada tercatat di dek kreatif dengan `ready: false` dan hanya keluar di undian `--wild`. Setelah kit dibuat dan diperagakan di katalog, ubah menjadi `ready: true` (`scripts/lib/creative.ts`). Komik, risograf, stickman, dan grid Swiss sudah `ready: true` (2026-11-14; peragaan: katalog → KatalogGaya). Catatan pakai: risograf adalah *perlakuan* — gabungkan dengan gaya lain lewat `RisoPrint`; kombinasi itu tetap satu `visualStyle` per episode.

| Gaya | Kecocokan | Kekuatan menjelaskan | Biaya kit | Keputusan |
|---|---|---|---|---|
| Komik | Sejarah (tokoh), Tubuh, Sains | tinggi: urutan sebab-akibat per panel, balon kata menggantikan headline | sedang: grid panel yang bisa beranimasi, balon kata, halftone, efek suara tulisan | prioritas 1. Paling berbeda dari semua episode yang sudah ada |
| Risograf | Sejarah, Alam, Tubuh | sedang: perlakuan, bukan tata letak | rendah: filter 2–3 tinta, geser register, butir. Bisa membungkus gaya lain | prioritas 1. Murah, dan menggandakan variasi gaya yang sudah siap |
| Stickman | Tubuh, Sains, Teknologi | tinggi untuk kebiasaan dan eksperimen | sedang: figur dengan pose dan sendi (`physics/Joint` bisa dipakai) | prioritas 2 |
| Grid Swiss | Sejarah, Teknologi, Sains (data) | tinggi untuk angka dan kronologi | rendah: grid dan aturan tipografi di atas `anim/` | prioritas 2 |
| Medan partikel | Antariksa, Sains, Alam | tinggi untuk gas, cahaya, dan populasi | sedang: medan aliran, ribuan titik, perlu dijaga waktu render | prioritas 3 |
| Terminal | Teknologi saja | sedang | rendah: font mono via `font:add` | prioritas 3. Hindari kemiripan dengan video arsip matrix-effect |
| Retro (70-an/VHS) | Teknologi (sejarah gadget) | rendah: kesannya gaya, bukan penjelasan | rendah | tidak diprioritaskan. Mudah terasa murahan; lebih baik jadi batasan sesekali |
| Piksel 8-bit | Teknologi (game) | rendah | sedang: sprite dari kode, font piksel | tidak diprioritaskan. Kesannya kekanak-kanakan untuk kanal fakta |
| Kaca cair | Teknologi (UI) | rendah | tinggi: blur latar berat saat render | tidak diprioritaskan |

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
