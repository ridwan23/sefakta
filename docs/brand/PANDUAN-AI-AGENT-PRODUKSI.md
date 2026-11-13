# Panduan produksi AI agent — SeFakta

Versi 1.6 · 9 November 2026

## Tujuan dan prioritas

Hasilkan satu pengetahuan yang jelas, benar, dan menarik dalam video vertikal sekitar satu menit. Penonton harus memahami janji pembuka, menemukan perkembangan sepanjang cerita, dan memperoleh jawaban yang memuaskan sebelum video berakhir. Retensi adalah hasil yang diuji melalui data penonton; panduan ini tidak menjamin penonton menonton sampai selesai.

Prioritas keputusan: akurasi → kejelasan → alur cerita → keterbacaan dan audio → keindahan. Jangan mengorbankan fakta untuk kejutan atau memperpanjang video hanya untuk mencapai durasi.

Acuan brand: `IDENTITAS-BRAND-SEFAKTA.md` dan `PANDUAN-BRAND-SEFAKTA.md`. *(Catatan 2026-11-07: watercolor, Poppins, dan pembuka "SeFakta hari ini" di paragraf ini kini opsional; lihat `AGENTS.md`.)* Gunakan watercolor + motion graphic, warna resmi, Poppins ExtraBold untuk judul, Poppins/Inter untuk isi. Format utama 1080×1920, 30 fps, 55–65 detik. Narasi dimulai pada frame 0 dengan “SeFakta hari ini: …”. Gunakan watermark resmi dan klip CTA resmi (`public/brand/cta-opsi1.mp4`, bersuara) setelah transisi iris dari frame fakta terakhir.

## 1. Riset sebelum produksi

- Tentukan satu fakta utama dan satu pertanyaan penonton. Jika terdapat dua gagasan besar, pisahkan menjadi dua episode.
- Verifikasi klaim dengan minimal dua sumber kredibel; utamakan sumber primer, institusi ilmiah, museum, arsip, atau publikasi penelitian. Dua artikel yang menyalin sumber sama bukan dua konfirmasi independen.
- Catat URL, judul sumber, tanggal akses, klaim yang didukung, serta batasan atau perbedaan angka. Salin kutipan pendek yang memuat angkanya. Jangan mengarang sumber atau kutipan.
- Bedakan fakta, perkiraan, interpretasi, dan ilustrasi. Hindari kepastian palsu, superlatif tanpa batasan, serta penyederhanaan sebab-akibat.
- Untuk sejarah: periksa tahun, lokasi, cakupan wilayah, satuan, dan anakronisme. Ilustrasi AI bukan foto arsip atau bukti sejarah. Peta dan diagram harus diperiksa secara terpisah dari kualitas estetikanya.

Simpan riset dan klaim pada `briefs/<episode>.json` (bagian `facts[]`), lalu jalankan `npm run validate:facts`. Klaim yang belum terverifikasi harus dihapus atau ditandai sebagai penghambat publikasi.

```json
{
  "projectId": "nama-episode", "title": "…", "series": "Sains",
  "status": "draft", "captionMode": "subtitle",
  "scenes": [
    { "id": "s1", "durationSeconds": 4.5, "voiceoverText": "…", "caption": "…", "factIds": ["f-studi"] }
  ],
  "facts": [
    {
      "id": "f-studi", "claim": "…", "kind": "fakta", "status": "terverifikasi",
      "figures": [{ "text": "31 m", "value": 31 }],
      "sources": [
        { "title": "…", "url": "https://…", "publisher": "…", "origin": "studi/lembaga asal data",
          "primary": true, "accessed": "2026-11-07", "quote": "kutipan pendek yang memuat angkanya" }
      ],
      "limits": "batasan atau perbedaan angka"
    }
  ],
  "numbersIgnored": [{ "value": 3, "reason": "…" }]
}
```

Aturan yang diperiksa validator:

- `kind`: `fakta`, `perkiraan`, `interpretasi`, atau `ilustrasi` (ilustrasi tidak butuh sumber). `status`: `terverifikasi`, `belum-terverifikasi`, atau `bertentangan`.
- `terverifikasi` (fakta/perkiraan) = minimal dua sumber dengan `origin` **berbeda** (dua artikel tentang studi yang sama bukan dua konfirmasi), dan setiap angka di `figures` tertulis di `quote` minimal dua sumber. `quote` maksimal 400 karakter dan harus kutipan nyata, bukan parafrase.
- Setiap angka yang diucapkan atau ditulis di scene harus ada di `figures` fakta yang dirujuk scene itu (`factIds`), atau dicatat di `numbersIgnored` beserta alasannya. Angka kata ≤ 10 tanpa satuan diabaikan.
- Fakta `bertentangan` yang masih dipakai = error. `belum-terverifikasi` = peringatan, dan error bila dijalankan dengan `-- --publish` atau `status` brief `siap-publikasi`.
- Durasi total 55–65 detik; mode `ringkasan` mewajibkan caption 8–14 kata per scene.
- `npm run validate:facts -- --check-urls` (atau `npm run validate:facts:online`, yaitu `--publish --check-urls`) membuka setiap URL sumber: link mati (404/410) = error; diblokir, timeout, atau PDF = peringatan (periksa manual); dialihkan ke domain lain = peringatan; `quote` yang tidak tertulis **verbatim** di halaman = error untuk fakta `terverifikasi` (peringatan untuk yang lain). Butuh internet, jadi tidak ikut `npm run quality`. Validator tidak menilai apakah sumbernya kredibel atau `origin`-nya benar: itu tetap tanggung jawab agent.

## 2. Rancang alasan untuk terus menonton

Sebelum menulis naskah, isi empat kalimat: “Penonton mengira …”, “Fakta sebenarnya …”, “Ini terjadi karena …”, dan “Akibatnya …”. Pilih konflik pemahaman yang dapat dijelaskan dengan visual.

Buat tiga kandidat hook dan pilih yang paling spesifik, akurat, serta dapat dijawab dalam episode. Hook harus menyatu dengan pembuka khas, bukan didahului animasi logo atau salam panjang. Tampilkan objek atau akibat yang relevan sejak awal.

Contoh sudut Tambora: “SeFakta hari ini: apa hubungan Tambora dengan musim panas yang membeku?” Ini adalah contoh arah editorial; naskah final tetap harus lolos riset dan uji durasi. Jangan mengubahnya menjadi klaim bahwa seluruh dunia kehilangan musim panas secara harfiah.

Janji hook harus terbayar. Berikan sebagian jawaban lebih awal lalu bangun penjelasan; jangan menahan seluruh informasi sampai detik terakhir atau meminta penonton “tonton sampai habis”.

### 2.1 Filter topik dan hook untuk Shorts (dari analytics YouTube, Nov 2026)

Bukti channel: topik fenomena sehari-hari/kejadian heboh (durian = gas bocor, komodo bertelur tanpa kawin) bertahan >60% penonton; topik bahan/komposisi yang tersegmentasi (stevia) jangkauannya lebih lambat. Ini petunjuk, bukan hukum.

Sebelum memilih topik, jawab tiga pertanyaan:

1. Dialami atau dilihat banyak orang setiap hari (makanan harian, fitur gadget, respons tubuh)?
2. Ada efek kejutan/kontradiksi ("dikira A ternyata B", "kok bisa?!")?
3. Teks di layar terbaca tanpa suara pada detik pertama?

Bila topiknya tersegmentasi (bahan, label, istilah teknis), jangan buang; ubah sudutnya ke efek yang dirasakan semua orang ("Pernah beli gula nol kalori tapi berat badan nggak turun?").

Hook (0–5 dtk): personal dan aktif, bukan berita pasif ("X lagi ramai dibahas…" dihindari). Pakai ajakan/pertanyaan langsung ke penonton ("Coba cek …"), tampilkan objek yang dikenal sejak frame pertama, teks besar kontras di tengah layar, dan beri alasan inti di detik 3–10 tanpa pengantar. Judul: rasa penasaran + objek sehari-hari, hindari klaim yang tidak bisa dibuktikan episode.

## 3. Struktur cerita dan ritme

Tabel berikut adalah titik awal editorial, bukan jadwal wajib untuk semua topik.

| Bagian | Kisaran | Fungsi | Bukti visual |
|---|---|---|---|
| Hook | 0–5 dtk | Memunculkan pertanyaan spesifik | Objek/akibat utama |
| Konteks | 5–15 dtk | Menjelaskan siapa, kapan, di mana | Peta, tanggal, perbandingan |
| Mekanisme | 15–35 dtk | Menjelaskan bagaimana dan mengapa | Diagram atau urutan sebab-akibat |
| Dampak | 35–50 dtk | Menunjukkan konsekuensi atau perubahan pemahaman | Bukti, angka, sebelum/sesudah |
| Jawaban dan penutup | 50–60 dtk | Menuntaskan janji dan meninggalkan satu gagasan | Ringkasan visual + CTA resmi |

Setiap beat harus menambah informasi atau memperjelas hubungan. Gunakan perubahan visual saat gagasan berubah, bukan timer efek yang konstan. Sebagai titik awal, evaluasi perkembangan visual setiap 2–4 detik; beri hold lebih panjang untuk peta, angka, dan diagram yang perlu dibaca.

Jeda narator harus memiliki fungsi: membaca data, mengamati perubahan, atau merasakan akibat. Jika narasi berhenti dan visual tidak berkembang, pendekkan hold atau perbaiki naskah. Jangan menyelesaikan ketimpangan timing hanya dengan menambah musik.

## 4. Naskah, Fish Audio, dan durasi

- Pisahkan headline visual, caption ringkasan, dan `voiceoverText`. Narasi menjelaskan; gambar menunjukkan; teks menekankan.
- Gunakan bahasa Indonesia lisan, satu gagasan per kalimat, dan angka yang mudah diucapkan. Periksa pelafalan nama, tanggal, singkatan, dan satuan.
- Estimasi awal naskah boleh memakai 100–130 kata untuk satu menit, tetapi keputusan final mengikuti hasil audio yang didengar dan diukur, bukan jumlah kata.
- Tetapkan reference voice konsisten. Simpan API key di `.env`; jangan mencetak, menyalin ke manifest, atau memasukkannya ke bundle.
- Setelah generasi, ukur semua MP3 dan dengarkan keseluruhannya. Pastikan tidak ada kata hilang, pengulangan, suara rusak, atau intonasi yang mengubah makna.
- Sisakan ruang setelah kalimat sebelum transisi. Bila audio melebihi scene, utamakan menyunting kalimat atau membagi ulang durasi. Jangan menjadikan kecepatan tinggi sebagai solusi default.
- Regenerasi hanya scene yang perlu diperbaiki. Jangan menjalankan `--force` seluruh episode tanpa kebutuhan.
- Aktifkan audio otomatis hanya setelah semua aset episode tersedia dan valid. Metadata harus mencerminkan teks dan pengaturan yang benar-benar menghasilkan file tersebut.

Perintah: `npm run vo -- --brief=briefs/<episode>.json --dry-run` (cek teks tanpa kredit), `npm run vo -- --brief=…` (membuat scene yang belum ada atau naskahnya berubah), dan `npm run vo -- --brief=… --scene=<id> --force` (satu scene). VO CTA tidak dibuat per episode: semua episode memakai satu rekaman bersama `public/brand/cta-vo.mp3` ("Ikuti Sefakta! Fakta baru, tiap hari!") yang menggantikan audio asli klip CTA. Kecepatan default 1,1× (±150 kata/menit); bila durasi melebihi 65 dtk, pangkas naskah, jangan menaikkan kecepatan. Audio per scene disimpan di `public/<episode>/vo/` dan dinormalisasi ke -14 LUFS (true peak -1,5 dBTP); manifest mencatat hash naskah, durasi, dan loudness. Durasi scene di video mengikuti audio (minimal `durationSeconds` brief).

## 5. Caption yang benar-benar sinkron

Agent memilih mode caption sesuai konsep visual episode dan mencatatnya di brief (`captionMode`): `ringkasan` (satu kalimat utuh 8–14 kata per scene; divalidasi), `subtitle` (kata per kata mengikuti ucapan), atau `headline` (judul visual pendek). Gunakan satu fokus baca pada satu waktu; jangan menampilkan headline panjang, ringkasan, dan subtitle panjang bersamaan.

Timestamp kata harus berasal dari transkripsi, alignment audio, atau timing provider yang diverifikasi. Membagi durasi MP3 berdasarkan panjang kata hanya menghasilkan perkiraan, bukan sinkronisasi ucapan yang akurat.

Timestamp hasil pembobotan panjang kata — termasuk interpolasi antar kata kunci di `src/topics/matrix-effect/2d/timeline.ts` — adalah draft. Sebelum menyatakan subtitle sinkron atau siap publikasi, ganti dengan alignment nyata dan periksa awal, tengah, serta akhir setiap scene sambil mendengarkan audio.

Persiapan (Whisper, `.env`, alat sistem) ada di `docs/SETUP.md`; cek dengan `npm run doctor`. `npm run align -- --brief=…` membuat timestamp kata dari audio: whisper.cpp (model multilingual `small`) mentranskripsi tiap scene, lalu kata naskah dicocokkan ke kata yang terdengar. Waktu diambil dari audio, teks dari naskah. Hasil uji pada VO lama: selisih rata-rata 0,18 dtk terhadap timing terukur (maks 0,74 dtk). Kata yang tidak cocok dilaporkan sebagai "tidak terdengar" dan waktunya diinterpolasi (`confidence: null`); dengarkan dan buat ulang scene bila salah ucap. Caption menjadi usang otomatis bila audio diganti.

Gunakan struktur `Caption` Remotion dengan `startMs`, `endMs`, `timestampMs`, dan `confidence`. Simpan data JSON, relatif terhadap sumber audio. Audio dan caption harus berada dalam kelompok timeline yang sama. Jika audio diganti, caption lama menjadi tidak valid dan harus dibuat ulang.

## 6. Motion graphic yang menjelaskan

- Tentukan satu fokus visual per beat. Animasi harus mengarahkan perhatian, membandingkan ukuran, atau menjelaskan perubahan.
- Untuk Tambora: lokasi → letusan → aerosol stratosfer → berkurangnya sinar Matahari → dampak regional. Jangan hanya mengulang layout teks di atas gambar berbeda.
- Gunakan peta, diagram berlapis, garis waktu, angka dengan pembanding, atau transformasi sebelum/sesudah ketika membantu pemahaman.
- Slow zoom pada satu gambar adalah gerak kamera; jangan menyebutnya parallax jika tidak ada lapisan dengan kedalaman dan gerak berbeda.
- Pilih gaya visual berdasarkan isi fakta episode dan catat di brief (`visualStyle`: nama, alasan, `tone` light/dark, palet dan `captionColors` opsional; diwajibkan validator, kontras caption minimal 4,5:1). `tone` menentukan watermark (terang/gelap) dan warna caption default. Contoh: sejarah → peta dan arsip, sains → diagram bersih, antariksa → latar gelap kosmik, tubuh → ilustrasi anatomi. Gunakan satu gaya untuk semua scene; aset ilustratif harus menyatu antarscene; hindari pergantian gaya yang tidak disengaja.
- Gunakan kuning untuk satu penekanan utama, bukan seluruh paragraf. Jangan menumpuk efek visual. Aturan bunyi (SFX, musik) ada di §7.
- Periksa video pada ukuran layar ponsel. Teks harus terbaca dalam waktu tampilnya.
- Klip CTA resmi diputar setelah jawaban selesai, lewat transisi iris dari frame fakta terakhir, dengan VO CTA bersama (`public/brand/cta-vo.mp3`, sama untuk semua episode).

## 7. Musik dan sound design

Narator adalah prioritas mix. SFX dan musik **opsional**; episode tanpa keduanya sah. Bila dipakai, keduanya harus membantu cerita, bukan mengisi kekosongan.

### 7.1 Kapan SFX dipakai

- Hanya pada **beat cerita**: objek muncul atau berubah status (notifikasi, toggle, stempel, angka berhenti), atau kejutan yang dijanjikan hook. Setiap SFX harus bisa dijelaskan dengan "bunyi ini menandai …".
- Bunyi sebaiknya **diegetik**, yaitu bunyi yang memang dimiliki objek di layar (notifikasi ponsel, klik toggle, ketukan stempel), bukan efek generik.
- Batas: **3–8 SFX per episode**, jarak minimal ±2 dtk antar-SFX, maksimal satu SFX per beat. Tanpa whoosh pada setiap gerakan kamera atau elemen kecil.
- **Satu palet bunyi per episode**, selaras dengan `visualStyle` (mis. UI ponsel → bunyi antarmuka yang bersih; sejarah → bunyi kertas/stempel). Jangan mencampur gaya kartun dan realistis.
- Jangan menaruh SFX tepat di atas kata kunci, angka, atau nama. Geser ke celah antarkata (waktu dari alignment) atau ±0,1–0,3 dtk sebelum kata.
- Tidak ada SFX di klip CTA. Klip CTA sudah memakai VO CTA bersama.

### 7.2 Musik latar

- Opsional. Pakai ambience atau musik instrumental tanpa vokal, yang tidak bersaing dengan artikulasi narator. Nada sintetis berulang adalah ambience, bukan otomatis sebuah komposisi.
- **Dilarang** memakai lagu populer, trending, atau komersial, termasuk potongan pendek. Lagu seperti itu memicu klaim Content ID yang bisa memblokir atau membatasi video.
- Fade in/out ±0,5 dtk. Musik berhenti atau memudar sebelum jeda CTA.

### 7.3 Level (patokan, dibuktikan dengan mendengar)

| Sumber | Normalisasi file | Saat dipakai |
|---|---|---|
| VO | -14 LUFS (otomatis `npm run vo`) | — |
| SFX | -20 LUFS (pendek: puncak ≤ -6 dBFS) | `volume` 1 di celah narasi; ≤ 0,5 bila tumpang tindih ucapan |
| Musik | -30 LUFS | tetap di bawah narator; turunkan lagi bila menutupi kata |

Angka `volume` saja tidak membuktikan keseimbangan, karena level sumber berbeda-beda. Karena itu file dinormalisasi dulu, lalu hasil render diukur: keseluruhan -14 ±1 LUFS, true peak ≤ -1 dBTP. Dengarkan mix penuh melalui headphone dan speaker ponsel. Periksa clipping, transisi yang mengejutkan, dan bunyi yang menutupi kata.

### 7.4 Lisensi dan penyimpanan

- Sumber yang boleh: bunyi sintesis buatan sendiri (`npm run sfx:make`, `scripts/make-sfx.ts`; lisensi paling bersih, utamakan ini), CC0/domain publik, YouTube Audio Library (sesuai syarat atribusinya), atau aset berlisensi komersial yang izinnya dimiliki SeFakta. URL yang dapat diunduh tidak dengan sendirinya membuktikan lisensi.
- File disimpan di `public/sfx/` (dipakai lintas episode) dan dicatat di `public/sfx/LICENSES.json`: `file`, `sumber` (URL), `pembuat`, `lisensi`, `atribusi` (teks bila wajib), `diakses`, `normalisasi`. File tanpa catatan dilarang dipakai; `check:episodes` menolaknya. Bunyi sintesis dicatat otomatis oleh `npm run sfx:make`.
- Atribusi yang diwajibkan lisensi ditulis di deskripsi video.

### 7.5 Implementasi

- SFX dipasang di kode topik (`src/topics/<id>/scenes.tsx`) dengan komponen `Sfx` (`src/shared/audio/Sfx.tsx`), dipicu waktu kata lewat `cueFrames`: `<Sfx at={q.kata + n} file="notif-ting.wav" volume={0.6} />`. Bila bunyi menandai objek yang muncul, geser animasi objeknya ke frame yang sama. Jangan mengubah template `src/shared/episode/` untuk satu episode.
- Musik latar yang melintasi scene dipasang sekali di komposisi topik, bukan per scene.
- Catat daftar SFX (scene, kata pemicu, file) di arahan `visual` scene di brief, supaya bisa ditinjau tanpa membaca kode.

## 8. Implementasi dan pemeriksaan wajib

Ikuti arsitektur `AGENTS.md`. Gunakan frame Remotion untuk animasi deterministik, `staticFile()` untuk aset lokal, serta `premountFor` pada media bertiming. Jangan mengubah token brand untuk menyelesaikan masalah satu scene.

Sebelum menyerahkan hasil:

1. Jalankan `npm run validate:facts` (sebelum publikasi jalankan `npm run validate:facts:online`), lalu periksa pemetaan aset serta kecocokan episode dan scene.
2. Jalankan `npm run quality`; lolos compile bukan bukti kualitas visual atau audio.
3. Tonton preview utuh dengan suara. Periksa frame awal, setiap transisi, bagian tengah, CTA, dan frame terakhir secara visual.
4. Periksa gambar benar-benar terlihat, teks tidak bertabrakan, subtitle mengikuti ucapan, dan tidak ada kalimat terpotong.
5. Uji tanpa suara: gagasan utama masih terbaca. Uji audio saja: cerita masih dapat dipahami.
6. Catat masalah dan revisi sebelum menyatakan siap. Jangan mengklaim “didengarkan”, “terverifikasi visual”, atau “sinkron” jika hanya membaca struktur DOM atau menjalankan build.
7. Render final saat diminta pengguna. Periksa MP4 hasil render, karena preview tidak membuktikan hasil ekspor identik.

## 9. Rubrik internal

Nilai setiap aspek 0–2: 0 belum layak, 1 perlu revisi, 2 jelas dan teruji. Ini alat editorial internal, bukan prediktor retensi.

| Aspek | Kriteria nilai 2 |
|---|---|
| Akurasi | Klaim didukung sumber dan batasannya benar |
| Hook | Janji spesifik, langsung terbaca, tidak menyesatkan |
| Cerita | Setiap beat berkembang dan jawaban menuntaskan hook |
| Visual | Gerakan membantu memahami, bukan sekadar dekorasi |
| Pacing | Jeda bertujuan dan setiap informasi sempat dipahami |
| Audio | Ucapan natural, utuh, serta mix jelas; SFX/musik (bila ada) sesuai §7 dan berlisensi tercatat |
| Caption | Timing diverifikasi dari audio dan mudah dibaca |
| Brand dan penutup | Identitas konsisten; CTA tidak mengganggu payoff |

Target internal minimal 14/16 tanpa nilai 0. Akurasi dan audio wajib 2 sebelum publikasi. Laporkan skor beserta bukti singkat, bukan angka tanpa penjelasan. Agent menilai karyanya sendiri; skor Akurasi harus merujuk hasil `validate:facts`.

## 10. Belajar dari penonton

Setelah publikasi yang diotorisasi, gunakan analytics yang tersedia untuk melihat titik keluar, durasi tonton, completion, replay, dan respons penonton. Jangan mengarang data atau ambang sukses universal.

Bandingkan episode pada platform, panjang, dan audiens yang sebanding. Uji satu perubahan utama pada satu waktu: hook, urutan penjelasan, kepadatan teks, atau panjang hold. Penurunan retensi merupakan petunjuk untuk diperiksa, bukan bukti tunggal penyebab. Simpan hipotesis, perubahan, dan hasilnya agar episode berikutnya belajar dari bukti.

## Template tugas untuk agent

> Buat episode SeFakta tentang [topik] untuk [audiens], dengan satu fakta utama [fakta]. Baca panduan produksi dan identitas brand. Isi `facts[]` pada brief dan loloskan `npm run validate:facts` (minimal dua sumber independen per fakta), buat tiga kandidat hook, pilih satu dan jelaskan alasannya. Susun storyboard dengan narasi, visual, durasi, dan payoff setiap beat. Implementasikan memakai komponen reusable, ukur dan dengarkan audio, buat subtitle dengan alignment nyata, lalu periksa preview utuh dan quality gate. Serahkan hasil, sumber, skor editorial, keterbatasan yang belum selesai, dan lokasi preview. Ikuti otorisasi pengguna untuk render serta publikasi.

## Riwayat revisi

- **1.7 (13 Nov 2026):** §2.1 filter topik 3 pertanyaan, aturan hook personal/teks terbaca tanpa suara, dan sudut personal untuk topik tersegmentasi (dari analytics YouTube).

- **1.6 (9 Nov 2026):** §7 ditulis ulang: SFX hanya pada beat cerita (3–8 per episode, jeda ≥ 2 dtk, satu palet bunyi), larangan lagu populer (Content ID), patokan level (SFX -20 LUFS, musik -30 LUFS, render -14 ±1 LUFS), lisensi di `public/sfx/LICENSES.json`, implementasi lewat `cueFrames` di kode topik.
- **1.5 (7 Nov 2026):** VO CTA menjadi satu rekaman bersama untuk semua episode (`public/brand/cta-vo.mp3`, dari VO CTA Tambora); `npm run vo` tidak lagi membuat CTA per episode dan `cta.voiceoverText` di brief dihapus.
- **1.4 (7 Nov 2026):** VO CTA dibuat per episode dengan narator & kecepatan narasi (menggantikan audio asli klip); kecepatan VO default 1,25× → 1,1×.
- **1.3 (7 Nov 2026):** gaya visual dipilih per episode berdasarkan isi fakta (`visualStyle` di brief, diwajibkan validator); kode legacy (`legacy-v1`, versi 3D, `SeFaktaCta`) dihapus.
- **1.2 (7 Nov 2026):** Fish Audio dipindah ke proyek ini (`npm run vo`, normalisasi -14 LUFS); caption tersinkron via whisper.cpp (`npm run align`); template episode `src/shared/episode/`; `npm run new:episode`, `check:episodes`, `check:publish`.
- **1.1 (7 Nov 2026):** format fakta dan validator (`validate:facts`); mode caption dipilih agent (`captionMode`); CTA resmi = `SeFaktaCta` di atas frame akhir (tanpa end card terpisah); aturan margin/area aman dihapus; rujukan Fish Audio disesuaikan dengan proyek ini.
