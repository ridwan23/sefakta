# Workflow AI agent: dari ide fakta sampai video berkualitas

Versi 1.0 · 7 November 2026 · disusun dari produksi episode `tambora-1816`

Dokumen ini adalah **urutan kerja operasional**: apa yang dikerjakan, dengan perintah apa, dan apa yang harus dicek sebelum lanjut. Standar mutunya ada di dokumen lain dan tetap berlaku:

| Dokumen | Isi |
|---|---|
| `AGENTS.md` | aturan wajib proyek (identitas, arsitektur, quality gate) — selalu menang bila ada perbedaan |
| `docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md` | standar cerita, riset, audio, caption, rubrik |
| `docs/SETUP.md` | persiapan mesin, pemecahan masalah |

Prinsip utama: **cegah kesalahan sebelum render, jangan menemukannya dengan coba-coba.** Setiap tahap punya *gerbang keluar*; jangan lanjut sebelum gerbangnya lolos.

---

## Peta tahap

| # | Tahap | Hasil | Gerbang keluar |
|---|---|---|---|
| 0 | Persiapan | lingkungan siap | `npm run doctor` hijau |
| 1 | Pilih fakta & sudut | satu fakta utama + 4 kalimat konflik | fakta tidak diperdebatkan, bisa dijawab dalam 60 dtk |
| 1b | Undian kreatif | kartu terpilih + `creative.concept` di brief | `npm run creative:draw -- <id> --pick=<n>`; konsep lolos uji tukar (`docs/PANDUAN-KREATIF.md`) |
| 2 | Riset sumber | kutipan verbatim + URL | setiap klaim punya ≥ 2 sumber berbeda asal |
| 3 | Naskah | 5 scene, 135–150 kata | lolos aturan pelafalan (§3.3) |
| 4 | Brief | `briefs/<id>.json` | `npm run validate:facts` 0 error, `validate:facts:online` 0 error |
| 5 | Voice-over | `public/<id>/vo/*.mp3` (CTA memakai `public/brand/cta-vo.mp3` bersama) | loudness -14 ±1 LUFS, durasi cerita 55–65 dtk |
| 6 | Alignment & cek ucapan | `captions.json` | cakupan ≥ 90%, transkrip dibaca kata demi kata |
| 7 | Rencana visual | tabel storyboard (pola, gerak, objek) + koordinat + font | semua elemen di area aman (§7.2); font/ikon/model sudah diunduh (§7.6–7.7) |
| 7b | Ilustrasi AI (opsional) | `public/<id>/img/*.jpg` + `images.json` | dicek manusia, label "ILUSTRASI", maks. 1–2 scene (§7.5) |
| 8 | Implementasi | `src/topics/<id>/scenes.tsx`, satu scene per putaran (§8.1) | `tsc` + `eslint` bersih; `motion:check --scene` per scene |
| 9 | Verifikasi visual | still + filmstrip + laporan tata letak + review independen | §9.3 lolos; `motion:check` dan `layout:check` 0 error (§9.4–9.5); review ≥ 14/18 setelah ≥ 1 putaran revisi (§9.6) |
| 10 | Gerbang kualitas | — | `npm run quality` dan `npm run check:publish:episode -- <id>` 0 error |
| 11 | Skor & serah terima | laporan | rubrik ≥ 14/16, tanpa nilai 0 |
| 12 | Render (hanya bila diminta) | `out/<id>/*.mp4` | MP4 diperiksa ulang (§12) |

---

## 0. Persiapan

```bash
npm run doctor          # semua ✓; ikuti perbaikan yang dicetak bila ada ✗
```

- `.env` berisi kunci Fish Audio. **Jangan pernah mencetak isinya**; cukup cek nama variabelnya: `grep -o '^FISH_AUDIO_[A-Z_]*' .env`.
- `AGNES_API_KEY` (Agnes AI, untuk ilustrasi) **opsional**; hanya perlu bila episode memakai image generation (§7.5). Episode tanpa gambar AI tidak membutuhkannya.
- Kecepatan VO default `FISH_AUDIO_SPEED=1.1` (±150 kata/menit). Jangan dinaikkan untuk mengejar durasi.

## 1. Pilih fakta dan sudut

1. Pilih **satu** fakta utama dari pilar SeFakta (Alam, Sains, Sejarah, Antariksa, Teknologi, Tubuh). Ciri fakta yang membuat penonton bertahan:
   - berlawanan dengan dugaan;
   - dekat dengan keseharian atau dengan Indonesia;
   - bisa dijawab tuntas dalam 60 detik;
   - punya bukti visual (peta, objek, angka pembanding).
2. Lolos filter topik `PANDUAN-AI-AGENT-PRODUKSI.md` §2.1 (keseharian, kejutan, teks terbaca tanpa suara). Topik tersegmentasi (bahan/label) wajib diberi sudut personal. Hook 0–5 dtk aktif dan personal, bukan "lagi ramai dibahas".
3. Tulis empat kalimat: *Penonton mengira …* / *Fakta sebenarnya …* / *Ini terjadi karena …* / *Akibatnya …*.
4. **Tolak** fakta yang masih diperdebatkan (efek Mpemba, "wood wide web", asal QWERTY, mitos 10% otak). Bila angka utama berbeda jauh antarsumber (mis. pendinginan global Tambora 0,4–3 °C), jangan sebut angkanya.
5. Buat tiga kandidat hook. Pilih yang paling spesifik dan bisa dijawab di dalam episode. Pakai kata pembatas bila perlu ("seolah", "di beberapa tempat") agar hook tidak menjadi klaim harfiah yang salah.
6. Rencanakan *open loop*: hook menjanjikan sesuatu (mis. "… ikut melahirkan Frankenstein"), dan scene terakhir membayarnya.

## 1b. Undian kreatif

Setelah `npm run new:episode`, jalankan `npm run creative:draw -- <id>` sebelum menulis naskah. Undian memberi 3 kartu acak (gaya, struktur cerita, pembuka, kamera, mode caption, tone, dan 2 batasan) yang menghindari episode terbaru. Pilih satu dengan `--pick=<n>`, lalu isi `creative.concept` di brief. Cara menilai kartu dan menafsirkannya jadi konsep ada di `docs/PANDUAN-KREATIF.md`. Struktur, pembuka, mode caption, dan tone dari kartu mengikat tahap 3, 4, dan 7.

## 2. Riset sumber

### 2.1 Pilih sumber

- Urutan prioritas: penelitian/jurnal (PubMed Central, Nature) → lembaga (NASA, NOAA, USGS, museum, universitas) → media kredibel (NPR, The Conversation) → Wikipedia (hanya sebagai sumber pendukung).
- Dua sumber yang mengutip studi yang sama dihitung satu `origin`.
- Situs yang menolak unduhan otomatis (Britannica, Smithsonian: HTTP 403) tidak bisa dicek validator. Pilih sumber lain bila ada.

### 2.2 Ambil kutipan verbatim (jangan memparafrasekan)

Unduh halaman lalu cari kalimat yang memuat klaim dan angkanya. Simpan unduhan di folder sementara tersendiri:

```bash
mkdir -p /tmp/riset && cd /tmp/riset
curl -sL -A "Mozilla/5.0" -o a.html "<URL>"
python3 -I -c "import re,html,sys;t=open(sys.argv[1],errors='ignore').read();t=re.sub(r'(?s)<(script|style).*?</\1>','',t);t=html.unescape(re.sub(r'<[^>]+>',' ',t));print(re.sub(r'\s+',' ',t))" a.html > a.txt
grep -o "[^.]*1815[^.]*\." a.txt | head      # kalimat yang memuat angka/kata kunci
```

- `WebFetch` meringkas halaman, jadi hasilnya **tidak boleh** dipakai sebagai `quote`. Kutipan selalu diambil dari teks mentah.
- Hindari kutipan yang memuat tanda kutip dengan spasi aneh atau nomor rujukan; ambil potongan kalimat yang bersih.

### 2.3 Gerbang

```bash
npm run validate:facts                 # struktur, angka, sumber
npm run validate:facts:online          # buka URL, cek kutipan verbatim
```

Bila validator gagal menjangkau sebuah situs (mis. `UNABLE_TO_VERIFY_LEAF_SIGNATURE`) padahal `curl` berhasil, cek kutipannya manual memakai fungsi validator:

```bash
node --no-warnings --experimental-strip-types -e "
import('./scripts/validate-facts.ts').then(async ({htmlToText,norm})=>{
  const t=norm(htmlToText((await import('node:fs')).readFileSync('/tmp/riset/a.html','utf8')));
  console.log(t.includes(norm('<kutipan>')) ? 'COCOK' : 'TIDAK COCOK');
});"
```

Catat hasil pengecekan manual itu di laporan serah terima.

## 3. Naskah

### 3.1 Struktur

Struktur mengikuti kartu undian (§1b). `--pick` mengisi kerangka scene di brief. Anggaran kata per scene mengikuti durasi awal kerangka (±2,5 kata per detik). Tabel di bawah adalah struktur `klasik`:

| Scene | Fungsi | Kira-kira |
|---|---|---|
| `hook` | pertanyaan spesifik + janji | 15–20 kata |
| `konteks` | siapa, kapan, di mana | 22–28 kata |
| `mekanisme` | bagaimana dan mengapa | 32–38 kata |
| `dampak` | bukti, akibat | 34–40 kata |
| `jawaban` | tuntaskan janji hook | 28–34 kata |

### 3.2 Anggaran kata

Pada 1,1×, Fish Audio menghasilkan ±150–160 kata/menit, tergantung suara referensi (ukur ulang setelah mengganti reference id). Durasi cerita = audio + 0,5 dtk jeda per scene. Agar cerita 55–65 dtk, **targetkan 135–150 kata** (Tambora: 148 kata → audio 58 dtk → cerita 62,5 dtk). Bila kelebihan, pangkas kata yang tidak membawa fakta. Jangan menaikkan kecepatan.

### 3.3 Aturan pelafalan (wajib, dicek sebelum VO)

| Aturan | Salah | Benar | Alasan |
|---|---|---|---|
| Tahun & angka ditulis dengan kata | `musim panas 1816` | `musim panas seribu delapan ratus enam belas` | TTS pernah membaca 1816 dalam bahasa Spanyol |
| Nama tempat asing diberi konteks | `Danau Jenewa` | `Danau Jenewa, Swiss` | membantu TTS dan penonton |
| Hindari kata pendek yang mudah tertelan di akhir kalimat cepat | `orang tewas seketika` | `orang meninggal seketika` | "tewas" terdengar "tua" |
| Satu gagasan per kalimat, kalimat ≤ 15 kata | | | intonasi lebih alami |

**Ekspresi (opsional).** Fish Audio S2 menerima tag kurung siku di naskah, mis. `[excited]`, `[confident]`, `[emphasis]` sebelum kata yang ditekankan, atau deskripsi bebas seperti `[enthusiastic, warm and inviting]`. Tag tidak diucapkan dan otomatis dibuang dari caption/alignment. Bahasa Indonesia tidak termasuk daftar bahasa yang didukung resmi untuk tag, dan efeknya terukur kecil, jadi selalu bandingkan hasilnya dengan telinga dan pastikan lewat whisper bahwa tag tidak ikut terbaca.

Validator tetap memahami angka berbentuk kata ("sepuluh ribu" = 10000), jadi `figures` di fakta tetap berupa angka. Di layar (stempel/label visual) angka boleh ditulis dengan digit.

## 4. Brief

```bash
npm run new:episode -- <id> --title="…" --series=<Pilar>
```

Isi `briefs/<id>.json`:

- **`scenes[]`:** `voiceoverText`, `headline`, `visual` (arahan), `factIds`. Isi `durationSeconds` mendekati perkiraan audio + 0,5 dtk; validator mewajibkan totalnya 55–65 dtk, dan durasi akhir tetap mengikuti audio.
- **`facts[]`:** `claim`, `kind`, `status`, `figures`, `sources` (`origin` berbeda), dan `limits`. Isi `limits` dengan penyederhanaan yang dilakukan naskah.
- **`creative`:** diisi `npm run creative:draw` (seed, 3 kartu, pilihan, tukar). Jangan mengedit kartu dengan tangan. Yang diisi agent hanya `creative.concept { idea, signature, onlyHere }`. `createdAt` diisi `new:episode` dan menandai brief yang wajib diundi.
- **`visualStyle`:**
  - wujudkan gaya kartu (`creative.chosen.family`) sesuai isi fakta: palet dan elemen dari `docs/REFERENSI-GAYA-VISUAL.md`;
  - `tone` mengikuti kartu;
  - `captionColors` bila palet default tidak cocok (validator mengecek kontras ≥ 4,5:1);
  - `fonts: { display, text?, reason }`: font dipilih sesuai konsep (§7.6) dan diunduh dulu dengan `npm run font:add -- <id>`.
- **`captionMode`:** mengikuti kartu undian. Watak tiap mode: `subtitle` untuk cerita bernarasi padat, `ringkasan` untuk visual yang ramai, `headline` untuk visual yang sangat sederhana; tukar hanya dengan `--swap` beralasan. Mode `keypoint` dihapus (9 Nov 2026) karena membingungkan di visual; validator menolak brief yang masih punya `keypoints[]`.
- **`storyDuration` (opsional, pengecualian):** `{ min, max, reason }` mengganti rentang 55–65 dtk untuk **satu** episode, hanya atas persetujuan pemilik (mis. eksperimen retensi). Batas 30–65 dtk, alasan wajib; validator selalu menampilkannya sebagai peringatan. Bukan aturan umum: jangan menyalinnya ke episode lain.
- **CTA:** tidak diatur per episode. Semua episode memakai VO CTA bersama `public/brand/cta-vo.mp3`.

Gerbang: `npm run validate:facts` 0 error.

## 5. Voice-over

```bash
npm run vo -- --brief=briefs/<id>.json --dry-run   # baca ulang teks + kecepatan, tanpa kredit
npm run vo -- --brief=briefs/<id>.json             # semua scene (VO CTA bersama tidak dibuat ulang)
```

- **Jalankan VO dan align sebagai dua perintah terpisah.** Menggabungkannya dalam satu perintah pernah membuat proses mati kehabisan memori (exit 137).
- Baca keluaran: loudness tiap scene -14 ±1 LUFS, true peak ≤ -1 dBTP.
- Hitung durasi cerita: Σ max(`durationSeconds`, audio + 0,5). Bila di luar 55–65 dtk, ubah naskah (tahap 3), bukan kecepatan.

## 6. Alignment dan cek ucapan

```bash
npm run align -- --brief=briefs/<id>.json
node -e "const c=require('./public/<id>/captions.json').scenes;for(const k in c)console.log(k,'|',c[k].heard)"
```

**Baca transkrip `heard` kata demi kata dan bandingkan dengan naskah.** Persentase cakupan saja tidak cukup: 100% cocok bisa menyembunyikan angka yang dibaca dalam bahasa lain, karena whisper menulisnya sebagai digit.

| Yang terlihat di `heard` | Arti | Tindakan |
|---|---|---|
| kata asing/aneh di posisi angka (`mil ocho centos`) | TTS salah bahasa | tulis angka dengan kata, buat ulang scene |
| kata lain yang mirip (`tua` untuk `tewas`) | ucapan kabur | buat ulang sekali; bila masih salah, ganti katanya |
| ejaan Indonesia untuk nama asing (`Suis`, `Geneva`) | biasanya ucapan benar, whisper menulis berbeda | tandai untuk didengar manusia; jangan diulang terus |
| `10.000`, `1800-16` | gaya tulis angka whisper | normal; penormal sudah memahaminya |

- Buat ulang **satu scene saja**: `npm run vo -- --brief=… --scene=<id> --force`, lalu `npm run align`.
- Batas: dua kali buat ulang per scene. Setelah itu ubah kata-katanya, karena TTS tidak deterministik.

Gerbang: semua scene ≥ 90% cocok dan tidak ada salah ucap yang mengubah makna.

## 7. Rencana visual (sebelum menulis kode)

Kesalahan visual paling mahal terjadi karena kode langsung ditulis tanpa rencana. Lengkapi tahap ini dulu.

Untuk memilih `visualStyle` (palet, elemen, gerak khas per gaya, dan status kit), pakai `docs/REFERENSI-GAYA-VISUAL.md`.

### 7.1 Storyboard per scene

Tentukan dulu **pola** tiap scene dari `src/shared/patterns` (`BigNumber`, `MythFact`, `Compare`, `ProcessFlow`, `RankList`, `ZoomDetail`, atau `bebas` bila tidak ada yang cocok), **sudut cahaya** episode (default 135°), dan **massa** objek utama (0 ringan – 1 berat). Lalu buat tabel untuk setiap scene: **kata pemicu → elemen yang muncul → posisi (x, y) → gerak**. Kata pemicu diambil dari transkrip tahap 6 dan dipakai di kode lewat `cueFrames`, sehingga animasi muncul tepat saat kata diucapkan. Kolom **Gerak** wajib diisi dengan istilah `docs/TATA-GERAK.md`: gerak primer (masuk/pindah), gerak sekunder (aksen), idle saat hold, dan kapan keluar.

Contoh (scene `dampak`, Tambora):

| Kata pemicu | Elemen | Posisi | Gerak (primer · sekunder · hold · keluar) | Catatan |
|---|---|---|---|---|
| `seribu` | stempel "1816" | (540, 250) | `stamp` · `Burst` + `Shake` · diam di tempat, kamera drift · keluar `shrink` saat `dijuluki` | di bawah zona watermark |
| `Eropa` / `Amerika` | negara diwarnai biru dingin | peta | warna menyebar 20 frame inOut · `Pulse` di tiap negara · peta drift · tetap | label di dalam frame (cek §7.3) |
| `dingin` | termometer turun | (540, 700–1150) | `rise` lalu air raksa turun `track` anticipate · garis skala `Stagger` · `Idle` 3 px · `sink` | di atas Atlantik |
| `salju` | salju menggantikan hujan | area y 420–1420 | `Swap` hujan → `Particles` turun · — · partikel terus jatuh · tetap | |
| `gagal` | gandum layu | y 1220–1450 | batang melengkung `track` 24 frame · daun gugur · goyang angin `Idle` · tetap | berhenti sebelum zona caption |
| `dijuluki` | stempel "TAHUN TANPA MUSIM PANAS" | (540, 980) | `SplitText mask` · `Highlight` · kamera `beatKick` · bertahan sampai akhir | termometer keluar dulu agar tidak bertumpuk |

Untuk objek, tulis juga material dan perilaku fisiknya di kolom Catatan (mis. "sachet `plastic`, massa 0,2, jatuh `fall` + squash, label `swing`"); aturan di `docs/TATA-OBJEK.md`.

Setiap scene minimal punya: entrance (gerak di 15 frame pertama), satu beat baru tiap 2–4 dtk yang mengikuti narasi (primer + sekunder), hold yang tetap hidup (tidak beku ≥ 1,5 dtk), dan waktu baca yang cukup. Angka durasi dan kurva: `docs/TATA-GERAK.md` §2.

### 7.2 Area aman (1080×1920)

| Zona | Koordinat | Aturan |
|---|---|---|
| Watermark | x 832–1026, y 84–143 | kosongkan x > 800, y < 175 dari teks/objek penting |
| Caption `subtitle` | y ±1490–1680 | tidak ada teks/objek penting di y > 1460 |
| Caption `ringkasan` | y ±1440–1680 (hingga 3 baris) | tidak ada teks/objek penting di y > 1420 |
| Caption `headline` | y ±300–520 | jangan taruh stempel/judul visual di sini |
| Isi utama | x 60–1020, y 180–1460 | label lebar ≤ 900 px |

### 7.3 Hitung posisi peta sebelum render

Jangan menebak tampilan peta. Hitung koordinat layar setiap titik dan label:

```bash
node --no-warnings --experimental-strip-types -e "
import('./src/shared/maps/geo.ts').then(({projector})=>{
  const p=projector('mercator',{center:[64,22],scale:400},1080,1920);
  for (const [n,ll] of Object.entries({Sumbawa:[118,-8.25],Jenewa:[6.14,46.2]})) console.log(n, p(ll).map(Math.round));
});"
# Sumbawa [917,1175] · Jenewa [136,753] → label selebar ±250 px di x 917 masih aman (≤ 1020)
```

- Rentang bujur yang terlihat pada Mercator = `1080 / scale` radian (scale 400 ≈ 155°).
- Periksa setiap titik **dan** label (lebar label ≈ jumlah huruf × ukuran font × 0,75) terhadap §7.2.
- Untuk zoom, pakai `mixView(a, b, t)`, yang menjaga titik tujuan tetap di layar sepanjang zoom. Akhir kamera scene sebelumnya harus sama dengan awal kamera scene berikutnya.

### 7.4 Pastikan tiap elemen terbaca

- Satu fokus baca pada satu waktu. Teks di visual hanya label pendek (≤ 4 kata) atau angka. Kalimat sudah ada di caption.
- Objek yang menjelaskan proses (sinar memantul, kabut menyebar) harus bisa dipahami tanpa suara. Bedakan arah atau jenis dengan bentuk garis (putus-putus vs penuh), bukan hanya warna.
- Ikon kecil harus berukuran ≥ 80 px di frame 1080 agar terbaca di ponsel.

### 7.5 Ilustrasi AI (opsional, sesuai kebutuhan)

**Image generation tidak wajib.** Default-nya visual berbasis kode (peta, diagram, ikon). Pakai hanya bila ia memberi nilai yang tidak bisa diberikan kode; episode tanpa gambar AI sepenuhnya sah.

| Cocok dipakai | Tetap pakai kode / aset asli |
|---|---|
| adegan sejarah atau peristiwa yang tidak ada fotonya (mis. letusan Tambora) | peta, diagram, grafik, angka, dan teks |
| hook 1–2 dtk pertama yang perlu suasana | tokoh nyata dan wajah |
| latar bergaya di balik elemen kode | bukti faktual: dokumen, kutipan, lokasi yang diklaim "begini aslinya" |
| metafora visual (mis. rumah di tepi danau di bawah hujan) | episode sains/teknologi/data yang cukup dengan diagram |

Aturan bila dipakai:

1. **Maksimal 1–2 scene per episode.** Gambar AI melengkapi visual kode, tidak menggantikannya.
2. **Satu gaya per episode.** Isi `imageStyle` di brief (kalimat Style + Lighting, bahasa Inggris, selaras `visualStyle`), dan `scenes[].imagePrompt` (Subject + Scene) hanya di scene yang memakai gambar.
3. Struktur prompt resmi Agnes: `[Subject] + [Scene] + [Style] + [Lighting] + [Composition] + [Quality]`. Skrip menambahkan Composition (vertikal 9:16, area atas-bawah lega untuk caption) dan Quality (tanpa teks, huruf, logo, wajah tokoh nyata).
4. Buat: `npm run image -- --brief=briefs/<id>.json --dry-run` (cek prompt), lalu tanpa `--dry-run`. Ulang satu scene: `--scene=<id> --force`. Hasil: `public/<id>/img/<scene>.jpg` (1242×2208, ±0,5 MB) dan `public/<id>/images.json` (prompt, model, penanda AI).
5. Pasang lewat `IllustrationBackdrop` (`src/shared/episode/`) dan **hanya setelah file ada** (`staticFile()` ke file yang hilang membuat render gagal).
6. Tampilkan label **"ILUSTRASI"** di layar. Gambar AI tidak boleh tampak seperti dokumentasi asli.
7. Cek manusia sebelum dipakai: akurasi sejarah (busana, bangunan, geografi), tidak ada teks/tangan/objek ganjil, caption tetap terbaca (beri gradasi latar di belakang caption bila gambar gelap).
8. Lisensi: catat model dan penyedia (otomatis di `images.json`); pastikan syarat penggunaan komersial Agnes sebelum tayang.

### 7.6 Font

Font dipilih per episode bersama `visualStyle`, karena huruf ikut membawa suasana konsep. Isi di brief:

```json
"fonts": { "display": "playfair-display", "text": "plus-jakarta-sans", "reason": "serif kontras tinggi seperti cetakan surat kabar 1816" }
```

- **`display`**: judul visual, label, stempel, angka besar. **`text`** (opsional, default `plus-jakarta-sans`): teks kecil di visual (keterangan, nama sumbu).
- **Caption tidak ikut berganti.** Template caption tetap Plus Jakarta Sans agar keterbacaan dan kontras yang sudah divalidasi tidak berubah. Watermark dan CTA juga tidak.

**Pilih dari konsep, bukan dari selera.** Tulis satu kalimat di `reason` yang menghubungkan bentuk huruf dengan isi fakta. Titik awal (semua tersedia di Fontsource, lisensi terbuka):

| Konsep visual | Karakter huruf | Contoh id Fontsource |
|---|---|---|
| sejarah, arsip, koran lama | serif kontras tinggi | `playfair-display`, `libre-baskerville`, `dm-serif-display` |
| sains bersih, diagram, kesehatan | sans geometris/humanis | `plus-jakarta-sans`, `manrope`, `space-grotesk`, `inter` |
| teknologi, data, kode, digital | monospace / teknis | `jetbrains-mono`, `space-mono`, `ibm-plex-mono` |
| berita mendesak, mitos vs fakta, angka besar | condensed tebal | `oswald`, `anton`, `bebas-neue`, `barlow-condensed` |
| antariksa, masa depan | lebar/futuristik | `exo-2`, `orbitron` (judul saja), `space-grotesk` |
| alam, anak, makanan, keseharian | rounded ramah | `nunito`, `fredoka`, `baloo-2` |
| catatan tangan, anotasi di atas foto/peta | tulisan tangan | `caveat`, `kalam`, `patrick-hand` (label pendek saja) |

Aturan:

1. **Maksimal 2 keluarga per episode** (display + text). Satu episode, satu pasangan font untuk semua scene.
2. **Keterbacaan di ponsel:** display ≥ 56 px dan bobot ≥ 600 untuk label penting; font tulisan tangan/dekoratif hanya untuk label ≤ 4 kata, tidak untuk angka utama.
3. **Glyph lengkap:** pastikan font punya digit, `%`, dan tanda baca yang dipakai di layar. Simbol di luar latin (mis. `≈`, `→`) jatuh ke font cadangan; gambar dengan SVG atau ganti kata.
4. **Unduh sebelum dipakai.** Bila id belum ada di `public/fonts/fonts.json`, jalankan:
   ```bash
   npm run font:add -- <id>                       # bobot 400 + 700
   npm run font:add -- <id> --weights=600,800     # bobot tertentu (lihat bobot di fontsource.org/fonts/<id>)
   npm run font:add -- <id> --italic=700          # tambah italic
   ```
   Skrip mengunduh paket `@fontsource/<id>` (subset latin + latin-ext), menyalin woff2 dan `LICENSE.txt` ke `public/fonts/<id>/`, dan mencatatnya di registri. Hanya lisensi terbuka (OFL/Apache/MIT/UFL) yang diterima. Jangan memakai Google Fonts API, CDN, atau font sistem.
5. **Pakai di kode** lewat registri, bukan nama keluarga yang ditulis tangan:
   ```tsx
   import { episodeFonts } from '../../shared/brand/fonts';
   const F = episodeFonts(brief.visualStyle); // F.display, F.text = nilai CSS fontFamily
   ```
6. Cek di still §9: huruf benar-benar font terpilih (bukan cadangan serif/sans bawaan browser), tidak ada kotak/huruf hilang, label tidak overflow (lebar font berbeda dari Jakarta; hitung ulang lebar label §7.3).

Gerbang: `check:episodes` tidak melaporkan font yang belum diunduh.

### 7.7 Objek, latar, ikon, dan 3D

Ikuti `docs/TATA-OBJEK.md`. Ringkasnya:

- Latar: `Backdrop` (bukan warna rata); warna dari `tokens(style)`.
- Objek: `Shaded` bermaterial di bawah satu `LightProvider`, `ContactShadow` di titik tapak, gerak dari `src/shared/physics`.
- Ikon dari registri: `npm run icon:add -- lucide:<nama>` bila belum ada (lisensi tercatat di `public/icons/`).
- 3D opsional untuk 1–2 objek kunci: `npm run model:add -- <id>` (Poly Haven, CC0), lalu `Stage3D` + `Model` dengan `lightAngle` sama.

Gerbang: `check:episodes` dan Studio tidak melaporkan font/ikon/model yang belum diunduh.

## 8. Implementasi

Pakai yang sudah ada sebelum membuat yang baru:

| Kebutuhan | Pakai |
|---|---|
| peta dunia / globe, sorot negara, zoom, busur | `src/shared/maps/WorldMap.tsx` (`WorldMap`, `mixView`, `screenArc`, `ISO`) |
| hitung posisi di Node | `src/shared/maps/geo.ts` |
| animasi tepat pada kata | `src/shared/episode/cues.ts` (`cueFrames(scene, fps, { kunci: ['kata', detikCadangan] })`) |
| masuk/keluar elemen, teks kata per kata, daftar berurutan | `src/shared/anim` (`Reveal`, `SplitText`, `Stagger`; lihat `docs/TATA-GERAK.md`) |
| aksen beat dan hold yang hidup | `src/shared/anim` (`Idle`, `Shake`, `Pulse`, `Burst`, `Highlight`, `Swap`, `Particles`) |
| garis/panah tergambar, angka berhitung | `src/shared/anim` (`DrawPath`, `CountUp`) |
| gerak khusus berkurva | `src/shared/anim` (`track`, `prog`, `springAt`, `EASE`, `noise1`) |
| susunan scene utuh (angka besar, mitos/fakta, perbandingan, proses, peringkat, zoom detail) | `src/shared/patterns` (lihat **katalog → KatalogPola**) |
| latar, warna berperan, ikon | `src/shared/look` (`Backdrop`, `Grain`, `tokens`, `Icon`) |
| objek bermaterial, cahaya, bayangan, kedalaman | `src/shared/render` (`LightProvider`, `Shaded`, `ContactShadow`, `depthStyle`, `rectPath`/`pouchPath`/`cupPath`/`blobPath`) |
| gerak fisik dan bahan bergerak | `src/shared/physics` (`fall`, `squashStretch`, `follow`, `swing`, `settle`, `Joint`, `Pour`, `Liquid`, `Smoke`) |
| objek 3D | `src/shared/three` (`Stage3D`, `Model`) |
| kamera menjelajah satu dunia (push, pull-back, whip, tracking, parallax) | `src/shared/camera/CameraRig.tsx` (`useCamera(keys)`, `CameraRig`, `CamLayer depth/blur/blend`, `mixPose` untuk tracking, `beatKick`). Pose akhir scene N = pose awal scene N+1 |
| easing, noise deterministik | `src/shared/motion.ts` (`hash`, `smooth`, …) |
| warna/tone episode | prop `style` (visualStyle) di setiap komponen scene |

Struktur topik: `src/topics/<id>/parts.tsx` berisi palet dan elemen ilustrasi gaya episode; `scenes.tsx` berisi satu komponen per scene dan `VISUALS`.

Aturan:

- Animasi diturunkan dari `useCurrentFrame()` + `interpolate()`/`Easing` (aturan Remotion di `AGENTS.md`). Variasi "acak" memakai `hash()` agar setiap render identik.
- Tonton **katalog → KatalogGerak, KatalogPola, KatalogObjek** di Studio sebelum menulis scene pertama, lalu ikuti `docs/TATA-GERAK.md` dan `docs/TATA-OBJEK.md`. Pakai kit `src/shared/anim` dulu; `interpolate` linear mentah untuk gerak objek adalah tanda gerak akan terasa kaku.
- Jangan mengubah `src/shared/episode/` untuk kebutuhan satu episode. Bila sebuah elemen berguna lintas episode, buat komponen baru di `src/shared/`.
- Detik cadangan di `cueFrames` adalah perkiraan sebelum alignment. Setelah alignment, waktu diambil otomatis dari caption.

Gerbang: `npx tsc --noEmit` dan `npx eslint src` bersih.

### 8.1 Cara kerja: satu scene per putaran

Jangan menulis semua scene sekaligus lalu memeriksa di akhir. Untuk setiap scene:

1. Tulis scene memakai pola/kit.
2. `npx tsc --noEmit`, lalu `npm run motion:check -- <id> --scene=<sceneId>` dan lihat filmstrip-nya.
3. Perbaiki sampai tidak ada beku/entrance hilang dan filmstrip menunjukkan beat yang jelas, baru lanjut ke scene berikutnya.

Tahap rencana visual (§7) dan implementasi (§8) adalah tahap yang paling menentukan mutu: jalankan dengan model terkuat yang tersedia dan effort tinggi. Tahap lain (VO, alignment, validasi) boleh memakai model yang lebih ringan.

## 8.5 Sound design (opsional)

Aturan lengkap ada di `docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md` §7. Urutan kerja:

1. Dari storyboard (§7.1), pilih 3–8 beat yang layak diberi bunyi. Tulis "bunyi ini menandai …" untuk setiap beat; yang tidak bisa dijelaskan, dibuang.
2. Ambil SFX dari `public/sfx/` yang sudah tercatat di `LICENSES.json`. Bila belum ada, utamakan membuatnya: tambah rumus di `SOUNDS` pada `scripts/make-sfx.ts`, lalu `npm run sfx:make` (file + catatan lisensi otomatis). Bila perlu sumber luar (CC0/berlisensi), normalisasi lalu catat manual:
   ```bash
   # bunyi ≥ 3 dtk (ambience, musik -30 LUFS): normalisasi loudness
   ffmpeg -i asli.wav -af loudnorm=I=-20:TP=-6 -ar 48000 public/sfx/<nama>.wav
   # bunyi pendek (< 3 dtk, kebanyakan SFX): LUFS tidak andal, normalisasi puncak ke -6 dBFS
   ffmpeg -i asli.wav -af volumedetect -f null - 2>&1 | grep max_volume   # mis. -1.5 dB → geser -4.5 dB agar puncak -6 dB
   ffmpeg -i asli.wav -af volume=-4.5dB -ar 48000 public/sfx/<nama>.wav
   ```
3. Pasang di `scenes.tsx` dengan `<Sfx at={q.kata + n} file="…" />` (`src/shared/audio/Sfx.tsx`). Narasi Fish Audio hampir tanpa jeda antarkata: ambil waktu **akhir** kata kunci dari `captions.json` (`endMs`) dan taruh bunyi di sana, lalu geser animasi objek ke frame yang sama.
4. Dengarkan scene yang diberi bunyi di Studio. Tanpa render video, mix bisa diukur dari audio saja:
   ```bash
   npx remotion render src/index.ts <CompId> /tmp/mix.wav --codec=wav
   ffmpeg -i /tmp/mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary   # I -14 ±1 LUFS
   ```
   Mengukur bukan mendengar: laporkan keduanya terpisah.

Gerbang: `check:episodes` lolos (file SFX ada dan tercatat lisensinya, ≤ 8 per episode); jarak dan posisi SFX sesuai §7.1.

## 9. Verifikasi visual

### 9.1 Tentukan frame yang diperiksa

Ambil frame awal tiap scene dari timeline (`from`), lalu tambahkan frame cue:

```bash
node -e "
const m=require('./public/<id>/manifest.json'),b=require('./briefs/<id>.json');let f=0;
for(const s of b.scenes){const e=m.scenes.find(x=>x.id===s.id);const n=Math.ceil(Math.max(s.durationSeconds,e.audioSeconds+0.5)*30);console.log(s.id,'mulai',f,'frame',n);f+=n}
console.log('cerita',f,'CTA mulai',f+30,'total',f+30+120)"
```

Per scene periksa:
- frame ke-10 (entrance);
- setiap frame cue + 15;
- frame terakhir sebelum scene berikutnya.

Periksa juga jeda sebelum CTA (cerita + 15: visual akhir tanpa caption), tengah iris (CTA mulai + 10), dan CTA penuh (CTA mulai + 90).

### 9.2 Render still satu per satu, lalu buat lembar kontak

```bash
mkdir -p out/<id>/stills
for fr in 10 120 260; do
  npx remotion still src/index.ts <CompId> out/<id>/stills/f$fr.png --frame=$fr --scale=0.5 --log=error
done
ffmpeg -y -loglevel error -i out/<id>/stills/f10.png -i out/<id>/stills/f120.png -i out/<id>/stills/f260.png \
  -filter_complex "hstack=inputs=3" out/<id>/stills/lembar.png
```

Render still satu per satu dalam loop, bukan paralel, untuk menghindari exit 137. Lihat lembar kontaknya dengan alat baca gambar.

### 9.3 Daftar periksa per frame

- [ ] Tidak ada teks/objek terpotong di tepi frame.
- [ ] Tidak ada yang menabrak watermark atau caption.
- [ ] Tidak ada elemen yang bertumpuk tanpa sengaja (stempel di atas ikon, awan menutup matahari).
- [ ] Elemen yang dipicu kata sudah tampil pada frame cue + 15.
- [ ] Ukuran ikon dan label terbaca di 50% skala.
- [ ] Gaya konsisten antar-scene (palet, garis, font).
- [ ] Transisi antarscene tidak melompat (kamera akhir = kamera awal berikutnya).
- [ ] Frame terakhir cerita layak dibekukan sebagai latar transisi CTA.

Perbaiki semua temuan dalam **satu putaran**, lalu render ulang hanya frame yang terdampak.

### 9.4 Periksa gerak (still tidak menunjukkan gerak)

```bash
npm run motion:check -- <id>                     # seluruh cerita (±40 dtk)
npm run motion:check -- <id> --scene=<sceneId>   # satu scene saat iterasi
```

Skrip merender cerita beresolusi kecil dan mengukur selisih piksel antar-frame di area isi (tanpa watermark dan caption). Hasilnya:

- laporan per scene: % frame bergerak, segmen beku terlama, entrance ada/tidak, lompatan kasar, dan grafik energi per detik (`·` beku, `▁▂▃` halus, `▄▅` aktif, `▆▇█` sangat cepat/potong);
- filmstrip `out/<id>/motion/<scene>.png`: baris atas = frame 0, 2, … 14 (kurva entrance), baris bawah = 8 frame merata (perubahan per beat). **Lihat setiap filmstrip dengan alat baca gambar.**

Gerbang: 0 error (beku ≥ 3 dtk). Peringatan (beku ≥ 1,5 dtk, tanpa entrance, < 40% frame bergerak) diperbaiki kecuali disengaja dan disebut di laporan. Di filmstrip, periksa juga: entrance tidak muncul utuh di frame 0 (harus terlihat bergerak di baris atas), objek tidak bertumpuk saat berganti, dan setiap beat terlihat berbeda dari beat sebelumnya.

### 9.5 Periksa tata letak (otomatis)

```bash
npm run layout:check -- <id> [--scene=<id>] [--every=10]
```

Probe (terpasang di Watermark, aktif hanya saat pemeriksaan) mengukur semua teks yang terlihat setiap 10 frame; caption dan watermark diabaikan lewat `data-layout-ignore`.

- **Error** bila menetap (≥ 2 sampel berturut-turut): teks keluar x 40–1040 atau keluar frame, di zona watermark (x > 800, y < 175), di zona caption sesuai `captionMode`, teks saling bertumpuk (> 20% kotak tinta), atau font cadangan (font belum `font:add`).
- **Peringatan**: pelanggaran sesaat (1 sampel, biasanya animasi), teks terpotong overflow, bobot/italic palsu.
- Laporan: `out/<id>/layout/report.json`. Elemen yang sengaja melanggar (dekorasi di tepi) diberi atribut `data-layout-ignore`.
- Hanya teks DOM/SVG yang diukur; objek non-teks dan teks di canvas/3D tetap dicek dari still.

Gerbang: 0 error. Waktu jalan ±20 dtk per episode.

### 9.6 Review independen (wajib)

Ikuti `docs/REVIEW-VISUAL.md`: reviewer dengan konteks segar menilai filmstrip, still, dan laporan dengan rubrik 9 aspek (0–2), tanpa membaca kode scene. Di Claude Code pakai subagent `visual-reviewer`. Perbaiki temuan "wajib" minimal satu putaran, lalu jalankan ulang `motion:check` dan `layout:check`.

Gerbang: skor ≥ 14/18, tanpa nilai 0; Fokus, Gerak masuk, dan Hidup saat hold bernilai 2.

## 10. Gerbang kualitas

```bash
npm run quality                               # fakta, episode, lint, tsc, bundle (semua episode)
npm run check:publish:episode -- <id>         # sebelum tayang, HANYA episode ini: validate:facts:online + check:episodes --publish
```

**Gerbang publikasi berlaku per episode.** `npm run check:publish` (tanpa `:episode`) memeriksa semua brief sekaligus, jadi bisa gagal karena episode lain (mis. halaman sumber episode lama berubah). Itu bukan penghambat episode yang sedang dikerjakan.

- Nyatakan episode siap berdasarkan hasil `check:publish:episode -- <id>`.
- Bila `npm run quality` atau `check:publish` menemukan error di episode **lain**: jangan menjadikannya langkah, syarat, atau "yang perlu dicek" untuk episode ini, dan jangan memperbaikinya tanpa diminta. Tulis satu baris di bagian **"Di luar episode ini"** pada laporan (episode mana, jenis masalah), lalu lanjutkan.
- `npm run quality` tetap harus lolos karena memeriksa kode bersama (lint, tsc, bundle). Bila gagal karena episode lain, sebutkan di bagian yang sama.

`check:episodes` memeriksa:
- VO sesuai naskah, loudness, dan true peak;
- VO CTA bersama `public/brand/cta-vo.mp3` ada, ≤ 3,5 dtk, -14 ±1 LUFS (dicek sekali oleh `check:episodes`);
- cakupan caption ≥ 90%;
- durasi cerita 55–65 dtk;
- tidak ada placeholder visual.

## 11. Skor dan serah terima

Nilai 8 aspek rubrik (Akurasi, Hook, Cerita, Visual, Pacing, Audio, Caption, Brand). Target ≥ 14/16, tanpa nilai 0; Akurasi dan Audio wajib 2 sebelum publikasi.

**Jujur tentang apa yang belum diverifikasi.** Jangan menulis "sudah didengar" bila hanya membaca transkrip whisper, atau "visual sudah dicek" bila baru melihat still. Tulis caranya.

Templat laporan:

```
Episode: <judul> (<id>) · durasi cerita xx,x dtk + CTA 4 dtk
Fakta: n fakta, n sumber; validate:facts:online 0 error (cek manual: …)
VO: kecepatan 1,1×, loudness …; salah ucap diperbaiki: …; perlu didengar: …
Caption: cakupan …%; kata diinterpolasi: …
Visual: still yang diperiksa: …; perbaikan: …
Gerak: motion:check … error/… peringatan; beku terlama … dtk; filmstrip dilihat: …
Tata letak: layout:check … error/… peringatan
Review: skor awal …/18 → setelah revisi …/18; temuan wajib yang diperbaiki: …
Gerbang: quality ✓ · check:publish:episode ✓
Skor: n/16 — Akurasi 2 (…), Hook …, …
Belum dilakukan: render MP4 (menunggu permintaan), commit, tonton utuh dengan suara
Preview: npm start → <CompId>
Di luar episode ini (informasi, bukan tugas): … (kosongkan bila tidak ada)
```

Urutkan laporan dari yang penting bagi episode ini. Hal yang perlu tindakan pengguna hanya yang menyangkut episode ini (mis. dengarkan scene tertentu, pilihan render).

## 12. Render (hanya bila pengguna meminta)

```bash
npx remotion render src/index.ts <CompId> out/<id>/<id>.mp4 --concurrency=2
```

Periksa MP4-nya, karena preview bukan bukti hasil ekspor:

- `ffprobe`: 1080×1920, 30 fps, jumlah frame = cerita + 120.
- Loudness keseluruhan ±-14 LUFS (`ffmpeg -i out.mp4 -af ebur128 -f null -`).
- Ambil 3–4 frame dari MP4 (`ffmpeg -ss <dtk> -frames:v 1`), termasuk tengah kata dan CTA.
- Audio CTA terdengar di detik terakhir (`volumedetect` pada 4 dtk terakhir, bukan senyap).
- Bila ada SFX/musik: dengarkan ulang beat yang diberi bunyi dan pastikan tidak ada kata yang tertutup; loudness keseluruhan tetap -14 ±1 LUFS dan true peak ≤ -1 dBTP.

## Kesalahan yang pernah terjadi dan pencegahannya

| Kejadian (tambora-1816) | Penyebab | Pencegahan di workflow |
|---|---|---|
| 1816 dibaca dalam bahasa Spanyol | angka digit di naskah VO | §3.3 angka ditulis dengan kata |
| "Jenewa" → "Jenoa", "tewas" → "tua" | nama asing/kata pendek | §3.3 konteks nama, ganti kata; §6 batas 2× buat ulang |
| proses mati exit 137 | VO + align, atau render beruntun, dalam satu perintah | §5 perintah terpisah; §9.2 still satu per satu |
| label/peta terpotong di tepi | posisi tidak dihitung | §7.2–7.3 hitung koordinat sebelum render |
| titik zoom keluar layar | interpolasi kamera linear | §7.3 pakai `mixView` |
| awan menutup matahari, stempel menumpuk termometer | elemen tidak dipetakan ke ruang | §7.1 tabel posisi per cue |
| sinar Matahari tak terbaca, hantu terlalu kecil | konsep belum diuji keterbacaannya | §7.4 bentuk pembeda, ikon ≥ 80 px |
| suara CTA berbeda dari narator episode | audio aset brand tidak diperiksa | satu VO CTA bersama yang sudah diperiksa (`public/brand/cta-vo.mp3`); dicek `check:episodes` |
| VO terlalu cepat (1,25×) | kecepatan dipakai untuk mengejar durasi | §3.2 anggaran kata; default 1,1× |
| reference id diganti, VO lama tidak terdeteksi usang | hash VO hanya dari teks + kecepatan | `vo-fish` mencatat sidik suara per scene; `check:episodes` menolak campuran suara |
| proses VO mati di tengah, progres hilang | manifest baru ditulis di akhir | manifest ditulis setelah setiap scene |
| (suara-rekaman-v2) ilustrasi AI tampak sebagai kotak gelap | `mix-blend-mode` di dalam elemen ber-transform terisolasi dari latar | pakai `<CamLayer blend="screen">` (latar rig ada di grup yang sama); pudarkan tepi gambar dengan mask |
| (suara-rekaman-v2) frame tracking kabur | motion blur kamera terlalu kuat saat kamera cepat | `motionBlur` ±0,12, `maxBlur` ≤ 6; masuk/keluar tracking ≥ 20 frame |
| (suara-rekaman-v2) siluet prosedural tidak cocok dengan ilustrasi AI | kontur digambar manual | turunkan kontur dari gambar (ambang kecerahan per baris) dan pakai koordinat piksel gambar sebagai koordinat dunia |
| suara baru melafalkan "Jenewa" seperti "Geneva" | nama asing + karakter suara | ganti kalimat ("sebuah danau di Swiss"), nama tetap di label layar |
| `check:episodes` salah mendeteksi placeholder | regex membaca satu kunci per baris | sudah diperbaiki di skrip |
| caption gelap tak terbaca di atas ilustrasi AI gelap | gambar dipasang tanpa lapisan latar caption | §7.5 butir 7: gradasi latar, cek frame pertama |
| (iklan-menguping) laporan meminta pengguna mengurus error episode komodo | `check:publish` memeriksa semua brief; error episode lain dilaporkan sebagai tugas episode ini | `npm run check:publish:episode -- <id>`; error episode lain hanya di bagian "Di luar episode ini" (§10–11) |
| (iklan-menguping) `npm run vo` gagal HTTP 402 | `FISH_AUDIO_MODEL` di `.env` menunjuk model berbayar yang kreditnya habis | cek `model` di manifest episode sebelumnya; jangan ubah `.env` diam-diam, laporkan ke pengguna |
| (iklan-menguping) teks kuning tak terbaca di tone terang | Kuning Fakta di atas krem/putih kontrasnya rendah | tone `light`: kuning hanya untuk isian/latar (kartu, tag) dengan teks gelap; teks penekanan pakai amber gelap atau biru |
| objek tampak datar dan bergerak seperti kotak; teks menabrak zona caption tanpa terdeteksi | isi warna rata tanpa cahaya; gerak tanpa fisika; tata letak hanya dicek dengan mata; agent menilai karyanya sendiri | `docs/TATA-OBJEK.md` + kit render/physics/patterns; `layout:check` (§9.5); review independen (§9.6) |
| gerak terasa kaku/datar, objek beku lama saat hold | agent hanya melihat still; animasi ditulis dari `interpolate` linear | kit `src/shared/anim` + `docs/TATA-GERAK.md`; kolom Gerak di §7.1; `motion:check` + filmstrip (§9.4) |

Tambahkan baris baru ke tabel ini setiap kali sebuah episode menemukan kesalahan baru, beserta pencegahannya.
