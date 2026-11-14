# Naskah Visual — pasta-gigi-jus-jeruk (v2 · Kartu 1: Papan tulis spidol)

**Judul:** Kenapa Jus Jeruk Terasa Pahit Habis Sikat Gigi?
**Episode:** `pasta-gigi-jus-jeruk` · **Seri:** Tubuh · **Status:** produksi DIKUNCI 2026-11-14 12:10 WIB ("Lanjutkan buat video"); revisi loop + isi sepertiga bawah + TV CRT 2026-11-14 13:28–13:29 WIB (perintah Ridwan, satu putaran render); revisi hapus jendela sketsa + matahari + ubin lantai dari backdrop 2026-11-14 17:38 WIB (rencana disetujui Ridwan, papan kini polos)
**Kartu kreatif:** Kartu 1 — Papan tulis spidol [light] · struktur zoom terus · pembuka aksi fisik detik 0 · kamera terkunci · caption headline · seed 1636225309, pick=1
**Konsep:** Papan tulis spidol di dapur: gelas jus digambar di papan, lalu spidol masuk makin dalam — lidah, membran sel rasa — sampai deterjen SLS ketahuan merusak lapisan lemak.
**Durasi cerita:** 61,8 dtk aktual dari audio Aria (5 scene, 1854 frame) — tanpa jeda hold dan tanpa CTA (akhir loop) = **61,8 dtk total** (estimasi awal 57,5 dtk)
**Narasi:** 115 kata · **VO:** Aria (fallback; estimasi tempo ±2,1 kata/dtk — bila Fish Audio dipakai, durasi diukur ulang dari audio)
**Tone:** light (papan tulis putih) · **Watermark:** varian terang (navy) · **Caption:** headline — satu judul per scene (template repo, 84 px, zona atas y 300–520)
**Font:** display Caveat (tulisan tangan, default kit sketch), teks Plus Jakarta Sans · **Kit:** sketch/ (BoardSurface, SketchPath, Hatch, SketchText)
**Objek pahlawan:** gelas jus jeruk (aset 1) — tampil di SEMUA scene dan berganti peran (korban → pembanding → sumber asam → sampel uji → pulih)
**Aset:** lihat `briefs/pasta-gigi-jus-jeruk-asset-sheet.png` (10 aset, semua SVG prosedural, gaya papan tulis; nomor aset di bawah merujuk ke sheet)

## Aturan yang dipakai di naskah ini

- **Caption headline (kartu 1):** tiap scene menampilkan SATU headline sebagai satu-satunya teks caption — dirender template di atas (y 300–520, 84 px, Plus Jakarta Sans 800, maks. lebar 900 px). Narasi TIDAK tampil kata per kata; ia terdengar lewat VO. Satu fokus baca pada satu waktu = headline itu.
- **Kamera TERKUNCI (aturan kartu):** papan tidak bergerak. Semua "zoom" dilakukan objek yang membesar/mengecil, bukan kamera. Tidak ada gerakan kamera sama sekali di episode ini — push-in v1 sudah dihapus.
- **Semua elemen baru digambar, ditulis, atau dihapus** (kit sketch: SketchPath tergambar, SketchText tertulis, Hatch diarsir) — tidak sekadar fade. Garis bergetar halus (boiling) khas spidol.
- **Ruang frame:** papan (aset 10) mengisi seluruh frame; visual utama besar dan diturunkan anchor-nya; tiap scene punya catatan papan di bawah (y ~1700) — label pendukung dari fakta episode — sehingga sepertiga bawah terisi; headline di atas, key text di tengah/bawah — tidak ada sepertiga bawah kosong.
- **Area aman:** watermark x > 800, y < 175 selalu kosong; headline template y 300–520 (key text TIDAK boleh masuk zona ini); isi utama x 60–1020, y 560–1460; label ≤ 900 px.
- **Transisi:** kontinuitas objek (gelas dibawa hook → lebih-dekat → lebih-dekat-lagi → inti → jawaban; lidah dibawa lebih-dekat → lebih-dekat-lagi), bukan fade kosong.
- **Jendela waktu per kalimat adalah perkiraan** (±2,1 kata/dtk + jeda scene 0,5 dtk); waktu final mengikuti alignment Whisper saat build.

---

## Scene 1 — hook · 0,0–5,5 dtk (5,5 dtk · 10 kata)

**Narasi verbatim:**
> "Jus jeruk yang sama, rasanya berubah total gara-gara sikat gigi."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Jus jeruk yang sama, rasanya berubah total gara-gara sikat gigi. | 0,0–4,8 | Kok jusnya jadi pahit? |

**Visual (aset 1, 2, 3, 10):**
- Frame 0 — **aksi fisik, tanpa pengantar**: sikat gigi (aset 2) JATUH dari atas ke papan (fall + squash) dan mendarat di samping gelas jus (aset 1, objek pahlawan) yang sudah tergambar besar di tengah (540, 985, skala 1,7); papan tulis (aset 10) sebagai latar. Ada gerak sejak frame pertama.
- Dtk 1–2 — **payoff visual**: jus berubah oranye cerah menjadi oranye gelap kusam (Swap) tepat saat kata "berubah total" — paradoksnya terlihat, bukan hanya didengar.
- Dtk 2–4 — stempel "PAHIT!" (SketchText merah, miring −8°) dicap di bawah gelas (540, 1540); busa SLS (aset 3) menyentuh bibir gelas.
- Catatan papan di bawah: "pagi ini: jus jeruk & sikat gigi" (y ~1700) — mengisi sepertiga bawah.
- Hold: gelembung jus naik pelan (Particles halus), gelas Idle 3 px.

**Kamera:** TERKUNCI (aturan kartu 1) — yang berubah adalah jusnya, bukan sudut pandang.
**Headline (template, atas):** "Kok jusnya jadi pahit?" **Key text + anchor:** "PAHIT!" (stempel merah) — bawah (540, 1540). Catatan papan: "pagi ini: jus jeruk & sikat gigi" (540, 1700).
**Transisi ke lebih-dekat:** gelas tetap di tempat, mengecil ke pojok kiri atas — objek dibawa, bukan dipotong.

## Scene 2 — lebih-dekat · 5,5–16,5 dtk (11,0 dtk · 22 kata)

**Narasi verbatim:**
> "Manisnya hilang, tersisa pahit dan menusuk. Pagi ini kamu sikat gigi, lalu minum jus jeruk. Bukan jusnya yang berubah, lidahmu yang berubah."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Manisnya hilang, tersisa pahit dan menusuk. | 5,5–8,4 | Bukan jusnya yang berubah |
| Pagi ini kamu sikat gigi, lalu minum jus jeruk. | 8,4–12,7 | (sama) |
| Bukan jusnya yang berubah, lidahmu yang berubah. | 12,7–16,0 | (sama) |

**Visual (aset 1, 2, 4, 10):**
- Urutan pagi digambar: sikat gigi (aset 2) lalu panah spidol (SketchPath, arrow) ke gelas jus (aset 1) — panah tergambar (18 frame) saat "lalu".
- "Bukan jusnya yang berubah": gelas mengecil ke pojok kiri atas (250, 650), tag kecil "jus sama ✓" (SketchText) di sampingnya — peran gelas: pembanding yang tidak berubah.
- "lidahmu yang berubah": lidah (aset 4) masuk dari bawah dan digambar garis demi garis (Reveal rise) ke tengah-bawah (540, 1180, skala 1,3) — bodi/outline dulu, baru titik reseptor dan label MANIS/PAHIT (stagger, revisi putaran 2 review); label "LIDAH" (SketchText) di atas lidah (540, 875). Beat kedua scene ini: lidah yang masuk adalah pergantian fokus visual (skala pertama).
- Catatan papan di bawah: "lidah = sensor rasa" (y ~1700) — mengisi sepertiga bawah; muncul SETELAH lidah tiba (revisi putaran 2 review: outline lidah sempat memotong teks catatan saat masuk).
- Hold: lidah Idle (goyang halus 3 px), reseptor berdenyut pelan (Pulse).

**Kamera:** TERKUNCI — perpindahan fokus dilakukan objek yang masuk + gelas yang mengecil, bukan kamera.
**Headline (template, atas):** "Bukan jusnya yang berubah" **Key text + anchor:** "LIDAH" — tengah (540, 875). Tag "jus sama ✓" di samping gelas kecil. Catatan papan: "lidah = sensor rasa" (540, 1700).
**Transisi ke lebih-dekat-lagi:** lidah tetap di frame, membran membesar darinya — zoom masuk adalah kelanjutan objek yang sama.

## Scene 3 — lebih-dekat-lagi · 16,5–32,2 dtk (15,7 dtk · 32 kata)

**Narasi verbatim:**
> "Pasta gigi mengandung sodium lauryl sulfate, deterjen pembuat busa. Deterjen itu merusak lapisan lemak di sel reseptor rasa di lidahmu. Reseptor manis jadi tumpul, rasa pahit dari asam sitrat jus malah menonjol."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Pasta gigi mengandung sodium lauryl sulfate, deterjen pembuat busa. | 16,5–20,8 | Deterjen mengacaukan lidah |
| Deterjen itu merusak lapisan lemak di sel reseptor rasa di lidahmu. | 20,8–26,5 | (sama) |
| Reseptor manis jadi tumpul, rasa pahit dari asam sitrat jus malah menonjol. | 26,5–31,7 | (sama) |

**Visual (aset 2, 3, 4, 5, 6, 1, 10):**
- Tube pasta diperas (aset 2, squash), busa SLS (aset 3) mengalir ke lidah (aset 4) mengikuti kata "deterjen" — aliran digambar putus-putus (SketchPath, 24 frame).
- "merusak lapisan lemak": membran (aset 5) MEMBESAR dari lidah (objek scale-up — pengganti push-in kamera v1 yang dihapus kartu 1); lapisan lipid retak tergambar (Hatch zigzag merah) + Burst kecil; gelembung SLS menembus celah. Ini skala kedua, makin dalam.
- "Reseptor manis jadi tumpul": titik kuning di lidah meredup (opacity turun 20 frame); "rasa pahit … menonjol": titik merah menyala (Pulse + Highlight).
- "menonjol": lidah MEMUDAR saat keluar (revisi putaran 2 review: kubah/label lidah sempat menutupi catatan papan), lalu timbangan rasa (aset 6) masuk, diperbesar dan diturunkan (540, 1430, skala 1,4) agar sepertiga bawah terisi — sisi manis naik, sisi pahit turun (settle pelan, massa 0,6).
- Gelas jus (aset 1) kecil di pojok dengan panah "asam sitrat" ke membran — peran gelas: sumber asam; label "asam sitrat" di (480, 720), kanan-atas garis panah (revisi putaran 2 review: panah sempat memotong teks labelnya sendiri).
- Catatan papan di bawah: "SLS = deterjen pembuat busa" (y ~1700).
- Hold: busa melayang (Idle), reseptor pahit terus berdenyut pelan.

**Kamera:** TERKUNCI — zoom dilakukan membran yang membesar, bukan kamera.
**Headline (template, atas):** "Deterjen mengacaukan lidah" **Key text + anchor:** "MANIS ↓ / PAHIT ↑" di timbangan — bawah-tengah (540, 1540). Tag "SLS" menempel di busa. Catatan papan: "SLS = deterjen pembuat busa" (540, 1700).
**Transisi ke inti:** timbangan keluar (exit shrink), kartu studi masuk — potong keras yang disengaja (ganti babak: dari mekanisme ke bukti).

## Scene 4 — inti · 32,2–47,0 dtk (14,8 dtk · 30 kata)

**Narasi verbatim:**
> "Peneliti Linda Bartoshuk membuktikannya tahun seribu sembilan ratus delapan puluh. Dalam penelitiannya, tujuh relawan berkumur larutan deterjen, mencicipi manis, asin, asam, dan pahit. Manisnya melemah, dan asam sitrat berubah pahit."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Peneliti Linda Bartoshuk membuktikannya tahun seribu sembilan ratus delapan puluh. | 32,2–37,0 | Dibuktikan tahun 1980 |
| Dalam penelitiannya, tujuh relawan berkumur larutan deterjen, mencicipi manis, asin, asam, dan pahit. | 37,0–43,7 | (sama) |
| Manisnya melemah, dan asam sitrat berubah pahit. | 43,7–46,6 | (sama) |

**Visual (aset 7, 1, 10):**
- Kartu studi (aset 7) digambar di papan, tengah (540, 1160, skala 1,2) — diperbesar dan diturunkan agar sepertiga bawah terisi: stempel "1980" (stamp + Shake kecil) saat "seribu sembilan ratus delapan puluh" — stempel di kanan-atas kartu (822, 938), DI BAWAH zona headline.
- Di samping stempel, sketsa TV tabung CRT yang jelas terbaca sebagai TV (aset 7) — antena V (ujung 18 px di bawah border atas kartu, revisi putaran 2 review), layar berisi gambar matahari + bukit, alas + tombol — **pembanding sehari-hari untuk 1980**: tahun ketika TV di rumah masih tabung. Hanya visual, tidak diucapkan di narasi.
- 7 ikon orang muncul berurutan (Stagger gap 4 frame) saat "tujuh relawan", label "seisi meja makan" (SketchText) — **pembanding sehari-hari untuk 7 relawan**, hanya di layar (bukan narasi, supaya hitung kata dan durasi tetap).
- 4 cangkir rasa (manis, asin, asam, pahit) muncul berurutan mengikuti kata "mencicipi" — tiap cangkir adalah gelas mini (gelas pahlawan, peran: sampel uji) + label kecil.
- "berubah pahit": cangkir asam sitrat berubah label "SEGAR" menjadi "PAHIT" (Swap) DAN isi cangkir berubah oranye→merah bersamaan (revisi putaran 2 review: dua label "pahit" berdampingan terbaca duplikasi tanpa perubahan warna isi) + batang manis turun (CountUp terbalik); panah merah menunjuk cangkir asam, ekornya dijauhkan dari teks "seisi meja makan". Ini beat penutup scene — skala terdalam: vonis mekanisme di tingkat reseptor, dibuktikan studi.
- Catatan papan di bawah: "manis melemah, asam jadi pahit" (y ~1700) — mengisi sepertiga bawah.
- Hold: kartu Idle halus, stempel 1980 tetap terbaca.

**Kamera:** TERKUNCI — kartu dan stempel yang bergerak; tidak ada subjek yang perlu diikuti kamera.
**Headline (template, atas):** "Dibuktikan tahun 1980" **Key text + anchor:** stempel "1980" — kanan-atas kartu (822, 938). Label "SEGAR → PAHIT" di cangkir asam sitrat — tengah (648, 1434). Catatan papan: "manis melemah, asam jadi pahit" (540, 1700).
**Transisi ke jawaban:** kartu keluar (exit sink), timer masuk — potong keras yang disengaja (dari bukti ke solusi).

## Scene 5 — jawaban · 47,0–57,5 dtk (10,5 dtk · 21 kata)

**Narasi verbatim:**
> "Efeknya sementara, hilang dalam beberapa menit. Mau jusmu tetap manis? Minum dulu, sikat gigi belakangan, atau pakai pasta gigi tanpa SLS."

| Kalimat | Perkiraan | Headline |
|---|---|---|
| Efeknya sementara, hilang dalam beberapa menit. | 47,0–49,9 | Minum dulu, sikat belakangan |
| Mau jusmu tetap manis? | 49,9–51,8 | (sama) |
| Minum dulu, sikat gigi belakangan, atau pakai pasta gigi tanpa SLS. | 51,8–57,0 | (sama) |

**Visual (aset 1, 8, 9, 10):**
- Timer (aset 8) DIPERBESAR (skala 1,25) dan bertahan sampai "Mau" — jangkar "efek sementara" supaya 9 dtk pertama jawaban tidak kosong (revisi putaran 2 review); memudar tepat saat sikat masuk.
- Urutan solusi (aset 9): gelas jus (jangkar awal diperbesar, skala 0,65 di (265, 665)) → panah spidol → sikat gigi, centang hijau (diperbesar) muncul (pop + Burst kecil) saat "Minum dulu, sikat gigi belakangan"; tube "tanpa SLS" muncul sebagai pilihan kedua (kanan-bawah, 850, 1080).
- Frame akhir (payoff penutup, bergema ke hook): gelas jus (aset 1) MEMBESAR kembali ke ukuran hook (540, 985, skala 1,7) dan kembali cerah oranye + label "MANIS LAGI" (SketchText hijau, 540, 1540) — zoom keluar dilakukan objek yang membesar, kamera TERKUNCI. Jus yang sama, rasa yang kembali.
- Catatan papan di bawah: "atau pakai pasta gigi tanpa SLS" (y ~1700).
- **AKHIR LOOP (tanpa CTA, perintah pemilik 2026-11-14 13:28 WIB; revisi putaran 2b review):** CROSS-DISSOLVE tersinkron + linear di ~0,7 dtk terakhir — isi jawaban, lapisan papan, dan shot loop SEMUA pada timing yang sama 308→324 (16 frame; overlap inOut-cubic sebelumnya masih menyisakan celah blank ink 1,1% di f1836) — gelas jus cerah oranye besar di tengah papan, framing/background/posisi SAMA PERSIS dengan frame 0 hook (tanpa label "MANIS LAGI", tanpa tube "tanpa SLS", tanpa elemen tambahan) + headline hook "Kok jusnya jadi pahit?" — frame terakhir menyambung mulus ke frame pertama saat diputar ulang. Headline template dipudarkan 300→308 oleh lapisan krem zona headline sebelum dissolve (revisi putaran 2, review 15/18 — kedua headline sempat bertumpuk ~50% di tengah dissolve). Watermark konstan 0,85 sepanjang video (tanpa fade-out gerbang CTA, karena tidak ada CTA; watermark ber-zIndex di atas lapisan dissolve supaya tidak tertutup).

**Kamera:** TERKUNCI — gelas yang kembali cerah adalah payoff-nya; kamera tidak perlu bergerak.
**Headline (template, atas):** "Minum dulu, sikat belakangan" **Key text + anchor:** "MANIS LAGI" — bawah (540, 1540), di bawah gelas. Centang hijau di urutan solusi. Catatan papan: "atau pakai pasta gigi tanpa SLS" (540, 1700).
**Transisi (loop):** cross-dissolve tersinkron + linear ke shot loop (bukan iris CTA) — isi jawaban, lapisan papan, dan shot loop semua 308→324 (16 frame), berakhir tepat di frame terakhir.

---

## SFX (opsional — diputuskan saat build, bukan bagian naskah yang mengikat)

Maks. 3, semua diegetik, masing-masing menandai satu beat: (1) bunyi "duk" sikat gigi jatuh di hook; (2) bunyi retak kecil saat membran retak di lebih-dekat-lagi; (3) bunyi "ting" centang hijau di jawaban. Tanpa SFX pun episode ini sah.

## Catatan untuk build

1. **Undian kreatif (Kartu 1, seed 1636225309, pick=1):** brief sudah berisi `creative` lengkap (chosen + concept terisi). Struktur scene mengikuti zoom-terus persis (hook → lebih-dekat → lebih-dekat-lagi → inti → jawaban). Jangan tukar sumbu apa pun tanpa `--swap` beralasan.
2. **Pelafalan (cek saat VO + alignment):** "sodium lauryl sulfate" (nama kimia asing), "Bartoshuk" (nama peneliti), "SLS" (akronim — pastikan dibaca "es-el-es", bukan kata). Bila salah ucap, ubah katanya, jangan regenerate teks yang sama.
3. **Angka di layar:** hanya "1980" (stempel, tercakup f-studi) dan 7 ikon orang + label "seisi meja makan" (visual, bukan angka digit). Jangan tulis "0,05%", "1 menit", atau "60 menit" di layar — konsentrasi dan durasi studi tidak diucapkan di narasi. Tips Colgate "tunggu ±60 menit setelah sitrus sebelum menyikat" (alasan enamel) hanya ada di catatan fakta f-solusi; bila mau jadi label kecil di jawaban, builder harus menambah sumber kedua untuk angka 60 atau menghilangkan angkanya.
4. **Validator angka:** "seribu sembilan ratus delapan puluh" dan "tujuh" TIDAK boleh bersebelahan tanpa kata pemisah — parser validator menggabungkan kata bilangan berurutan menjadi satu angka (1980 + 7 = 1987). Narasi sudah ditulis dengan pemisah ("…delapan puluh. Dalam penelitiannya, tujuh relawan…"); jangan disambung lagi saat revisi naskah. Kata "satu" pada label layar "seisi meja makan" tidak masuk narasi; kalaupun masuk, parser mengabaikan kata bilangan < 11 tanpa satuan — tapi tetap jangan menambahkannya ke narasi tanpa alasan.
5. **Headline vs key text:** headline template selalu di atas (y 300–520). Key text tiap scene sudah ditempatkan di tengah/bawah agar tidak menabrak headline. Jangan menaruh key text di y 300–520.
6. **Durasi:** estimasi memakai tempo Aria (±2,1 kata/dtk). Bila VO memakai Fish Audio 1,1× (±150–160 kata/mnt), narasi 115 kata hanya ±44 dtk — durasi scene harus diukur ulang dari audio dan brief diperbarui.
7. **Produksi DIKUNCI 2026-11-14 12:10 WIB** ("Lanjutkan buat video") — fakta dicatat ke used-facts.md / animation-log.md oleh parent. Revisi loop (13:28 WIB) + isi sepertiga bawah + TV CRT (13:29 WIB) tidak mengubah fakta/narasi — pembukuan tidak ditambah.
