# Naskah Visual — voc-bangkrut (Kartu 1: Potongan kertas, mundur waktu)

**Judul:** Kenapa Perusahaan Terkaya di Dunia Bisa Bangkrut?
**Episode:** `voc-bangkrut` · **Seri:** Sejarah · **Status:** paket pra-produksi — MENUNGGU persetujuan Ridwan; video TIDAK dibangun sebelum "Lanjutkan buat video" (fakta BELUM dicatat ke used-facts.md)
**Kartu kreatif:** Kartu 1 — Potongan kertas [light] · struktur mundur waktu · pembuka salah-kaprah ("tunggu") · kamera satu tarikan tanpa potong · caption ringkasan · seed 1441722823, pick=1
**Konsep:** Arsip kertas VOC yang dibuka mundur: satu dunia kertas panjang dilewati kamera dalam satu tarikan — dari papan pengumuman pembubaran 1799, lewat lautan kapal dan gudang rempah Batavia, sampai ke selembar saham pertama tahun 1602 — dan koin VOC yang sama berubah peran di tiap stasiun.
**Durasi cerita (estimasi):** 59,0 dtk (5 scene: 7 + 13 + 14 + 14 + 11) — tanpa CTA (akhir loop) = **59,0 dtk total**
**Narasi:** 113 kata · **VO:** Aria (fallback; estimasi tempo ±2,1 kata/dtk — bila Fish Audio dipakai, durasi diukur ulang dari audio)
**Tone:** light (kertas krem) · **Watermark:** varian terang (navy, konstan 0,85 — tanpa fade-out gerbang CTA karena tidak ada CTA) · **Caption:** ringkasan — satu kalimat utuh 8–14 kata per scene (template repo)
**Font:** display Playfair Display (serif arsip untuk angka tahun dan judul dokumen), teks Plus Jakarta Sans · **Kit:** collage/ (PaperSurface, Cutout `torn`, Doc, Stamp, Tag, Tape, PaperFold, Ribbon), anim/stepped
**Objek pahlawan:** koin VOC emas (aset 2) — tampil di SEMUA scene dan berganti peran (menara runtuh → matahari → stempel → meterai → terbelah)
**Aset:** lihat `briefs/voc-bangkrut-asset-sheet.png` (10 aset, semua SVG prosedural, gaya potongan kertas arsip; nomor aset di bawah merujuk ke sheet)

## Dunia: satu dunia kertas 5400 × 1920, 5 zona

Kamera TIDAK pernah memotong. Satu dunia kertas panjang (aset 10) dilewati dalam satu tarikan dari kiri ke kanan; tiap zona selebar satu frame (1080 px). Urutan zona = urutan cerita (mundur waktu):

| Zona | World x | Isi | Scene |
|---|---|---|---|
| A — 1799 | 0–1080 | Pengumuman bubar (aset 1) + menara koin (aset 2) | akhir (hook) |
| B — Laut | 1080–2160 | Laut + rute (aset 4) + kapal (aset 3) + koin-matahari (aset 2) | sebelumnya |
| C — Batavia | 2160–3240 | Benteng (aset 5) + karung rempah (aset 6) + koin-stempel (aset 2) | lebih-awal |
| D — 1602 | 3240–4320 | Sertifikat saham (aset 7) + koin-meterai (aset 2) | awal |
| E — Utang | 4320–5400 | Buku utang merah (aset 8) + koin terbelah (aset 2) | jawaban |

**Jalur kamera (CameraRig, satu tarikan):** x=0 (akhir) → x=1080 (sebelumnya) → x=2160 (lebih-awal) → x=3240 (awal) → x=4320 (jawaban, lalu diam). Alasan tiap gerakan ditulis di tiap scene (prinsip kamera: Follow / Reveal / Emphasize / Connect — bila tidak ada alasan, kamera diam).

**Satu warna = satu konsep (batasan kartu, dipertahankan sampai akhir):** emas `#E8B65C` = kekayaan · merah bata `#C56B50` = utang/bahaya · biru pudar `#7C9DA5` = laut · sage `#8A9B7C` = rempah · arang `#243139` = tinta/dokumen · krem `#F3EBDD` = kertas dasar.

## Aturan yang dipakai di naskah ini

- **Caption ringkasan (kartu 1):** tiap scene menampilkan SATU kalimat ringkasan 8–14 kata sebagai satu-satunya teks caption — dirender template repo. Narasi TIDAK tampil kata per kata; ia terdengar lewat VO. Satu fokus baca pada satu waktu = kalimat ringkasan itu.
- **Kamera satu tarikan (aturan kartu):** tidak ada potong antar scene. Perpindahan scene = kamera bergeser ke zona berikut. Semua zoom dilakukan objek yang membesar/mengecil, bukan kamera.
- **Gerak kertas (kit collage):** potongan masuk dengan jatuh/meluncur lalu settle dengan sedikit rotasi dan bayangan berubah (PaperMotion); kertas TIDAK bergerak seperti cairan atau karet. Gerak langkah stop-motion hanya untuk potongan fisik; kamera, teks, dan diagram tetap halus.
- **Ruang frame:** dunia kertas (aset 10) mengisi seluruh frame; visual utama besar dan diturunkan anchor-nya; tiap scene punya pita garis waktu (aset 9) di bawah (y ~1700) — penunjuk posisi mundur — sehingga sepertiga bawah terisi; caption ringkasan di atas, key text di tengah/bawah — tidak ada sepertiga bawah kosong.
- **Area aman:** watermark x > 800, y < 175 selalu kosong; isi utama x 60–1020, y 560–1460; label ≤ 900 px.
- **Transisi:** kontinuitas kamera (geser ke zona berikut), bukan fade kosong — kecuali dissolve loop di akhir.
- **Jendela waktu per kalimat adalah perkiraan** (±2,1 kata/dtk + jeda scene 0,5 dtk); waktu final mengikuti alignment Whisper saat build.

---

## Scene 1 — akhir (hook) · 0,0–7,0 dtk (7,0 dtk · 15 kata)

**Narasi verbatim:**
> "Akhir tahun 1799. Perusahaan dagang terkaya di dunia resmi bubar. Utangnya diambil alih negara Belanda."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Akhir tahun 1799. | 0,0–1,5 | Terkaya, lalu bubar |
| Perusahaan dagang terkaya di dunia resmi bubar. | 1,5–4,8 | (sama) |
| Utangnya diambil alih negara Belanda. | 4,8–7,0 | (sama) |

**Visual (aset 1, 2, 9, 10):**
- Frame 0 — **aksi fisik, tanpa pengantar**: menara koin emas (aset 2, objek pahlawan) sudah menjulang besar di tengah zona A (540, 780, skala 1,25) — citra "terlalu besar untuk jatuh", salah-kaprah yang diperagakan; lalu pengumuman pembubaran (aset 1) JATUH dari atas dan mendarat di KANAN menara (700, 1120) — koin VOC + keping kiri menara tetap mengintip di balik pengumuman (revisi R1: pengumuman lama menutupi seluruh menara) — dan stempel "BUBAR 1799" dicap di atasnya (Stamp, hentakan diperbesar revisi R3) saat kata "resmi bubar" — payoff visual detik 1–2: yang terkaya ternyata bubar. Pendaratan pengumuman memakai squash pulse ~6 frame + pantulan (revisi R3: squash lama hanya ~1 frame, tidak terbaca).
- Dtk 4,8–7,0 — koin di kaki menara RETAK dan berubah emas → merah bata (Swap) saat "utangnya diambil alih" — koin yang sama, status berubah: dari kekayaan jadi utang. Revisi R3: keping merah bergeser keluar dari balik pengumuman (tampilkan setengah keping) dan retak merambat ke koin tegak "V" yang mengintip di kiri — sebelumnya perubahan emas→merah hampir tidak terlihat karena tertutup pengumuman.
- Pita garis waktu (aset 9) di bawah menunjukkan "1799" yang dilingkari merah (540, 1700) — mengisi sepertiga bawah.
- Hold: pengumuman bergoyang settle setelah mendarat + ayunan idle KONTINU (dua frekuensi) supaya jeda 2,0–6,3 dtk tetap hidup (revisi R3: goyangan lama mati setelah ~1 dtk); menara berdenyut 2%; stempel BUBAR tetap terbaca.

**Kamera:** SATU TARIKAN dimulai di zona A (x=0) — diam di frame 0, mulai bergeser saat "Tapi tunggu" di scene berikut. **Alasan:** belum ada yang perlu diikuti; kamera diam sampai narasi memerintahkan mundur.
**Caption ringkasan (template):** "Perusahaan dagang terkaya di dunia resmi bubar tahun 1799." **Key text + anchor:** stempel "BUBAR 1799" — (700, 1189), di atas pengumuman. Pita garis waktu: "1799" dilingkari merah (540, 1700).
**Transisi ke sebelumnya:** kamera mulai bergeser kanan ke zona B — objek tidak dipotong, dunia yang bergerak.

## Scene 2 — sebelumnya · 7,0–20,0 dtk (13,0 dtk · 23 kata)

**Narasi verbatim:**
> "Tapi tunggu. Mundur ke masa jayanya. Perusahaan ini masih raja lautan. Kapalnya berlayar ke Asia empat ribu tujuh ratus delapan puluh lima kali."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Tapi tunggu. | 7,0–8,2 | Raja lautan |
| Mundur ke masa jayanya. | 8,2–10,2 | (sama) |
| Perusahaan ini masih raja lautan. | 10,2–12,8 | (sama) |
| Kapalnya berlayar ke Asia empat ribu tujuh ratus delapan puluh lima kali. | 12,8–19,5 | (sama) |

**Visual (aset 2, 3, 4, 9, 10):**
- "Tapi tunggu" — kamera BERGESER ke zona B: headline "Raja lautan" tampil di atas matahari-koin (layar y ~116–196; revisi R3: headline dari brief ini tidak pernah tampil) — peta kertas sesuai realita (aset 4, garis pantai dari data Natural Earth, file `briefs/voc-bangkrut-map.svg`) terbuka — jejak pelayaran (garis putus-putus merah bata) tergambar dari Belanda, mengelilingi Tanjung Harapan di ujung Afrika, lalu ke Asia saat tiga kapal kertas (aset 3) berlayar beriringan — kapal besar di depan (rigging, sarang gagak, lubang meriam), dua kapal kecil di belakang — mengikuti kata "raja lautan".
- Koin pahlawan (aset 2) kini jadi MATAHARI emas di atas laut (540, 405) — peran: kekayaan yang menyinari — TERBIT dari balik peta (f50–95) bersama armada yang BERLAYAR MASUK dari kiri (f50–95), supaya entrance kedua pahlawan terlihat (revisi R1: keduanya lama sudah utuh di frame overview pertama) — armada diperbesar (skala 1,45, revisi R3: band bawah peta kosong) — dan di bawahnya tumpukan koin kecil tumbuh (CountUp) saat rute mulai tergambar ("berlayar", revisi R3: dulu baru muncul saat angka diucapkan).
- Label kertas "4.785 kapal" (Tag, angka tercakup f-kapal, diperbesar) ditempel di ruang sendiri di bawah peta (600, 1410) saat "empat ribu tujuh ratus delapan puluh lima kali" — angka besarnya terlihat, bukan hanya didengar.
- Pita garis waktu (aset 9): bintang emas di tengah rentang 1799–1619, tanpa lingkaran dua tahun (540, 1700).
- Hold: kapal Idle (goyang halus 3 px), ombak berdenyut pelan.

**Kamera:** BERGESER x=0 → x=1080 (one-take). **Alasan: Reveal** — narasi berkata "mundur ke masa jayanya", kamera bergerak untuk memperlihatkan laut kapal yang belum ada di frame.
**Caption ringkasan (template):** "Di masa jayanya, kapalnya berlayar ribuan kali ke Asia." **Key text + anchor:** label "4.785 kapal" — bawah-tengah (540, 1400). Koin-matahari di atas (540, 500). Pita garis waktu (540, 1700).
**Transisi ke lebih-awal:** kamera terus bergeser kanan ke zona C — dunia yang sama, stasiun berikut.

## Scene 3 — lebih-awal · 20,0–34,0 dtk (14,0 dtk · 25 kata)

**Narasi verbatim:**
> "Mundur lagi. Tahun 1619, Batavia jadi markasnya. Dari sini, VOC menguasai rempah. Cuma VOC yang boleh dagang. Keuntungan yang dibagikan delapan belas persen setiap tahun."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Mundur lagi. | 20,0–21,2 | Batavia 1619 |
| Tahun 1619, Batavia jadi markasnya. | 21,2–23,8 | (sama) |
| Dari sini, VOC menguasai rempah. | 23,8–26,4 | (sama) |
| Cuma VOC yang boleh dagang. | 26,4–29,0 | (sama) |
| Keuntungan yang dibagikan delapan belas persen setiap tahun. | 29,0–33,5 | (sama) |

**Visual (aset 2, 5, 6, 9, 10):**
- "Tahun 1619" — kamera BERGESER ke zona C: benteng Batavia (aset 5) berdiri besar di tengah (540, 820, skala 2,1), bendera VOC berkibar (Idle); karung rempah goni (aset 6) menumpuk di kaki benteng (y 1230) — satu terikat tali, satu terbuka, rempah sage terlihat; karung MELOMPAT kecil saat kata "rempah" (beat tengah scene, revisi R1). Bayangan kontak tipis di bawah benteng (revisi R3: objek melayang di atas krem rata).
- "Cuma VOC yang boleh dagang": koin pahlawan (aset 2) DICAP di atas karung rempah (Stamp, r90) — peran: stempel monopoli — saat kata "cuma".
- "delapan belas persen": koin MEMBELAH jadi potongan-potongan kecil (r34) yang dibagikan ke tangan-tangan kertas di samping karung (160/920, y1180; revisi R3: tangan lama di menara benteng — terbaca "benteng bertangan") + label "18% tiap tahun" (Tag, angka tercakup f-dividen, diperbesar) di ruang sendiri di bawah headline (540, 480), muncul saat kata "Keuntungan" (revisi R1: label lama menutupi PALA/CENGKEH).
- Pita garis waktu (aset 9) bergeser ke "1619" (540, 1700).
- Hold: bendera berkibar pelan, karung Idle halus.

**Kamera:** BERGESER x=1080 → x=2160 (one-take). **Alasan: Reveal** — narasi menyebut Batavia, kamera bergerak memperlihatkan benteng yang belum ada di frame.
**Caption ringkasan (template):** "Dari Batavia, VOC menguasai rempah dan membagi keuntungan." **Key text + anchor:** label "18% tiap tahun" — di bawah headline (540, 480). Label "BATAVIA" di kaki benteng. Pita garis waktu (540, 1700).
**Transisi ke awal:** kamera terus bergeser kanan ke zona D — dunia yang sama, stasiun berikut.

## Scene 4 — awal · 34,0–48,0 dtk (14,0 dtk · 27 kata)

**Narasi verbatim:**
> "Mundur ke awal. Tahun 1602, perusahaan ini lahir dari selembar kertas. Saham pertama yang bisa dibeli siapa saja. Selembar kertas yang artinya kamu punya bagian dari perusahaan."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Mundur ke awal. | 34,0–35,5 | Saham pertama |
| Tahun 1602, perusahaan ini lahir dari selembar kertas. | 35,5–39,8 | (sama) |
| Saham pertama yang bisa dibeli siapa saja. | 39,8–43,2 | (sama) |
| Selembar kertas yang artinya kamu punya bagian dari perusahaan. | 43,2–47,5 | (sama) |

**Visual (aset 2, 7, 9, 10):**
- "Tahun 1602" — kamera BERGESER ke zona D: sertifikat saham pertama (aset 7) TERBUKA besar (PaperFold 800×800) di tengah (540, 1000) — kertas krem dengan monogram VOC besar dan garis tanda tangan samar; lipatan MEMBUKA SETELAH kamera tiba dan kertas terlipat mendarat (buka f70–106, durasi 36 frame, revisi R3: lipatan lama membuka dalam ~10 frame — tidak terbaca sebagai membuka; jeda f45–70 membuat keadaan terlipat terbaca dulu sebelum membuka), supaya gerak lipatnya terlihat (revisi R1: lipatan lama membuka saat kamera masih bergeser).
- "lahir dari selembar kertas": KOIN pahlawan (aset 2) jadi METERAI EMAS di atas sertifikat — peran: segel kelahiran — menempel (pop + Burst kecil) tepat saat kata "lahir".
- "bisa dibeli siapa saja": tangan-tangan kertas kecil (Cutout, lengkap dengan pergelangan) bermunculan satu per satu di tepi sertifikat sejak kata "Saham" (Stagger) — siapa saja boleh punya bagian.
- "1602" besar di sertifikat (Playfair Display) tetap terbaca sepanjang scene — angka tahunnya adalah jangkar visual.
- Pita garis waktu (aset 9) bergeser ke "1602" — ujung pita, ditandai bintang emas (540, 1700).
- Hold: sertifikat Idle halus, meterai emas berkilau pelan (Pulse lembut).

**Kamera:** BERGESER x=2160 → x=3240 (one-take), lalu melambat. **Alasan: Reveal** — narasi menyebut saham pertama, kamera bergerak memperlihatkan sertifikat 1602 yang belum ada di frame.
**Caption ringkasan (template):** "Semuanya bermula dari selembar saham pada tahun 1602." **Key text + anchor:** "1602" — tengah sertifikat (540, 1000). Monogram "VOC" di atasnya. Pita garis waktu (540, 1700).
**Transisi ke jawaban:** kamera bergeser sekali lagi ke zona E — dari kelahiran ke kematian perusahaan.

## Scene 5 — jawaban · 48,0–59,0 dtk (11,0 dtk · 23 kata)

**Narasi verbatim:**
> "Lalu apa yang salah? Perang menghabiskan uang. Korupsi menggerogoti dari dalam. Utang menumpuk sampai tak terbayar. Perusahaan sebesar itu, ternyata bisa bangkrut juga."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Lalu apa yang salah? | 48,0–49,9 | Apa yang salah? |
| Perang menghabiskan uang. | 49,9–51,3 | (sama) |
| Korupsi menggerogoti dari dalam. | 51,3–53,2 | (sama) |
| Utang menumpuk sampai tak terbayar. | 53,2–55,6 | (sama) |
| Perusahaan sebesar itu, ternyata bisa bangkrut juga. | 55,6–58,9 | (sama) |

**Visual (aset 2, 8, 9, 10):**
- "Lalu apa yang salah?" — kamera BERGESER ke zona E: tiga buku utang merah (aset 8) berjejer — buku TENGAH diperbesar (skala 1,6) jadi jangkar (revisi R1: tiga buku identik lama tanpa jangkar). Bayangan kontak tipis di bawah barisan buku (revisi R3).
- Tiga penyebab muncul berurutan mengikuti kata: pedang kertas besar + kapal terbakar (860, 720; revisi R3: kapal geser kanan — paruh merah koin terbelah menyentuh lambung) (perang, 49,9–51,3) → lubang ROBEK bertepi kertas + label "korupsi" di buku kanan (korupsi, 51,3–53,2; revisi R1: bintang hitam lama terbaca sebagai noda) → lembar-lembar utang merah menumpuk dari atas sambil bergoyang (bounce 0,35 + goyangan 12°, revisi R3: lembar lama menumpuk tanpa goyangan terbaca) (utang, 53,2–55,6).
- "ternyata bisa bangkrut juga": KOIN pahlawan (aset 2) TERBELAH DUA di ruang kosong di ATAS barisan buku (540, 740) — dua keping terpisah dengan celah terlihat, tepi patahan bergerigi, setengah emas dan setengah merah bata (monogram V…C) — koin yang sama, kini patah (revisi R1: posisi lama menutupi label BUKU UTANG buku tengah). Ini beat penutup: dari koin utuh di hook ke koin terbelah di jawaban.
- Pita garis waktu (aset 9) kembali ke "1799" yang dilingkari merah (540, 1700) — lingkaran penuh: cerita mundur sudah kembali ke titik awal.
- **AKHIR LOOP (tanpa CTA, perintah pemilik 2026-11-15; diperbaiki revisi R1):** CROSS-DISSOLVE tersinkron + linear di ~0,7 dtk terakhir (frame lokal jawaban 333→354 = frame global 1770→1791, 21 frame) — isi jawaban dan shot loop SEMUA pada timing yang sama — shot loop = frame 0 hook PERSIS: headline hook "Terkaya, lalu bubar" (tampil sejak frame 0) + menara koin emas saja (540, 780) + pita garis waktu 1799 (540, 1725), tanpa pengumuman (di frame 0 pengumuman masih di luar frame) — frame terakhir menyambung mulus ke frame pertama saat diputar ulang. Headline jawaban "Apa yang salah?" memudar keluar frame lokal 310→333 SEBELUM dissolve, supaya tidak bertumpuk dengan headline shot loop di posisi yang sama. Latar shot loop memakai DuniaBg zona A (tint + vignette sama seperti frame 0). Caption ringkasan template TETAP terlihat selama dissolve (overlay loop tanpa z-index, caption template di atasnya). Watermark konstan 0,85 (tanpa fade-out gerbang CTA). Ukur seam (R1 revisi): selisih rata-rata frame 0 vs frame terakhir 5,37/255 keseluruhan, 0,61/255 di luar pita caption (sisanya hanya pergantian teks caption).

**Kamera:** BERGESER x=3240 → x=4320 (one-take), lalu DIAM. **Alasan: Connect** — narasi menghubungkan saham (zona D) ke utang yang membunuhnya (zona E); setelah tiba, kamera diam karena koin yang terbelah adalah payoff-nya.
**Caption ringkasan (template):** "Perang, korupsi, dan utang menumpuk sampai perusahaan itu tumbang." **Key text + anchor:** koin terbelah — di atas barisan buku (540, 740). "BUKU UTANG" di buku tengah. Pita garis waktu (540, 1700).
**Transisi (loop):** cross-dissolve tersinkron + linear ke shot loop (bukan iris CTA) — isi jawaban dan shot loop semua frame lokal 333→354 (global 1770→1791), berakhir tepat di frame terakhir (1791).

---

## SFX (opsional — diputuskan saat build, bukan bagian naskah yang mengikat)

Maks. 3, semua diegetik, masing-masing menandai satu beat: (1) bunyi "bruk" kertas saat pengumuman jatuh di hook; (2) bunyi "ting" logam saat koin jadi meterai di awal; (3) bunyi "krek" saat koin terbelah di jawaban. Tanpa SFX pun episode ini sah.

## Catatan untuk build

1. **Undian kreatif (Kartu 1, seed 1441722823, pick=1):** brief sudah berisi `creative` lengkap (chosen + concept terisi). Struktur scene mengikuti mundur-waktu persis (akhir → sebelumnya → lebih-awal → awal → jawaban). Jangan tukar sumbu apa pun tanpa `--swap` beralasan.
2. **Pelafalan (cek saat VO + alignment):** "VOC" (akronim — pastikan dibaca huruf per huruf "V-O-C", bukan kata "vok"); "Batavia" (ba-ta-vi-a); "monopoli" tidak diucapkan (narasi memakai "cuma VOC yang boleh dagang"). Bila salah ucap, ubah katanya, jangan regenerate teks yang sama.
3. **Angka di layar:** hanya "1799" (stempel + pita), "4.785 kapal" (label, tercakup f-kapal), "18% tiap tahun" (label, tercakup f-dividen), "1619" (pita), "1602" (sertifikat + pita). Jangan tulis angka lain di layar — "21 tahun monopoli", "2,5 juta ton", "hampir 1 juta orang", dan "200 tahun" hanya ada di klaim fakta, tidak di narasi dan tidak di layar.
4. **Validator angka:** "empat ribu tujuh ratus delapan puluh lima kali" dan "delapan belas persen" masing-masing berdiri sendiri di kalimatnya — kata bilangan TIDAK boleh bersebelahan dengan angka lain tanpa pemisah (parser validator menggabungkan kata bilangan berurutan). Narasi sudah ditulis dengan pemisah kalimat; jangan disambung lagi saat revisi naskah.
5. **Angka "7,9 triliun" (nilai puncak VOC) SENGAJA TIDAK DIPAKAI** — angka viral itu satu perhitungan yang diperdebatkan metodenya (sumbernya sendiri menulis "cross-century comparisons are inherently imprecise"); narasi bersandar pada fakta terverifikasi (1602, 1619, 4.785 kapal, 18%, 1799).
6. **Satu warna = satu konsep:** emas hanya untuk kekayaan/koin, merah bata hanya untuk utang/bahaya, biru pudar hanya untuk laut, sage hanya untuk rempah. Jangan memakai warna-warna itu untuk hal lain di scene mana pun.
7. **Koin pahlawan harus KOIN YANG SAMA** di semua scene (bentuk + monogram VOC identik) — hanya statusnya berubah (utuh → matahari → stempel → meterai → terbelah). Bukan koin yang berbeda-beda.
8. **Durasi:** estimasi memakai tempo Aria (±2,1 kata/dtk). Bila VO memakai Fish Audio 1,1× (±150–160 kata/mnt), narasi 113 kata hanya ±44 dtk — durasi scene harus diukur ulang dari audio dan brief diperbarui.
9. **Status:** paket pra-produksi — MENUNGGU persetujuan Ridwan. Produksi DIKUNCI hanya bila Ridwan berkata "Lanjutkan buat video" — saat itu fakta dicatat ke used-facts.md oleh parent. Video TIDAK dibangun sebelum itu.
10. **Bendera VOC (revisi 2026-11-15):** bendera kapal (aset 3) dan benteng (aset 5) adalah bendera VOC — triwarna Belanda merah-putih-biru dengan monogram VOC di lajur putih. Warna resmi: merah #AE1C28, biru #21468B — BUKAN merah bata (#C56B50) atau biru pudar (#7C9DA5) palet. Catatan sejarah: bendera VOC paling awal (1602–~1650) memakai oranye-putih-biru (Prinsenvlag); merah-putih-biru adalah versi yang kemudian jadi standar dan dipakai di sini.
