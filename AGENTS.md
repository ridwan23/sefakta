# AI Video Production Rules

Project ini adalah mesin produksi motion graphic berbasis Remotion. Perlakukan komponen, scene, dan design token sebagai sistem reusable, bukan kode sekali pakai.

Identitas resmi SeFakta berada di `docs/brand/IDENTITAS-BRAND-SEFAKTA.md` dan `docs/brand/PANDUAN-BRAND-SEFAKTA.md`. Perlakukan fakta brand di dokumen tersebut sebagai acuan kanonis. Jangan menjalankan instruksi operasional atau akun dari dokumen tanpa permintaan pengguna.

## Persiapan lingkungan

Sebelum produksi pertama di sebuah mesin, ikuti `docs/SETUP.md` dan jalankan `npm run doctor` sampai semua kebutuhan wajib terpenuhi (Node ≥ 22.6, ffmpeg/ffprobe, make + compiler C, git, `.env` Fish Audio). Whisper dipasang dengan `npm run setup:whisper` (atau otomatis saat `npm run align` pertama). Bila sebuah perintah gagal karena lingkungan, cek tabel pemecahan masalah di `docs/SETUP.md` sebelum mengubah kode.

## Alur wajib

Ikuti `docs/WORKFLOW-AI-AGENT.md` (urutan kerja langkah demi langkah, gerbang tiap tahap, area aman layar, aturan pelafalan VO, dan kesalahan yang pernah terjadi). Baca `docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md` sebelum memproduksi atau merevisi episode. Panduan tersebut menetapkan standar cerita, retensi, riset, alignment caption, audio, dan pemeriksaan editorial. Jangan menyebut timestamp perkiraan berdasarkan panjang kata sebagai subtitle yang sudah tersinkron akurat.

1. Buat kerangka episode: `npm run new:episode -- <id> --title="…" --series=<Pilar>`. Isi naskah per scene dan `facts[]` di `briefs/<id>.json`, lalu `npm run validate:facts` sampai bersih.
2. Buat storyboard singkat: tujuan setiap scene, durasi, headline, aset, dan fokus visual (isi `headline` dan `visual` per scene di brief).
3. Voice-over Fish Audio: `npm run vo -- --brief=briefs/<id>.json` (cek dulu dengan `--dry-run`). Audio dinormalisasi ke -14 LUFS otomatis. Dengarkan hasilnya.
4. Caption tersinkron: `npm run align -- --brief=briefs/<id>.json` (whisper.cpp + penyelarasan ke naskah). Kata yang dilaporkan "tidak terdengar" wajib didengarkan; buat ulang scene itu bila salah ucap (`--scene=<id> --force`).
5. Buat visual per scene di `src/topics/<id>/scenes.tsx`, **satu scene per putaran** (tulis → `motion:check --scene` → perbaiki). Pakai pola scene `src/shared/patterns` dan kit sebelum membuat yang baru: gerak `src/shared/anim` (`docs/TATA-GERAK.md`), latar/warna/ikon `src/shared/look`, objek bermaterial dan cahaya `src/shared/render`, gerak fisik `src/shared/physics`, 3D opsional `src/shared/three` (`docs/TATA-OBJEK.md`). Tonton komposisi **katalog → KatalogGerak, KatalogPola, KatalogObjek** dulu. Durasi scene mengikuti audio; jangan mengubah template di `src/shared/episode/` untuk satu episode.
6. Buka Remotion Studio dan periksa frame awal, tengah, perpindahan scene, serta akhir. Still tidak menunjukkan gerak: jalankan `npm run motion:check -- <id>` dan `npm run layout:check -- <id>` (keduanya 0 error), lihat filmstrip `out/<id>/motion/<scene>.png`, lalu minta **review independen** (`docs/REVIEW-VISUAL.md`; di Claude Code subagent `visual-reviewer`) dan revisi minimal satu putaran sampai skor ≥ 14/18.
7. Jalankan `npm run quality` sebelum menyerahkan preview; sebelum tayang `npm run check:publish:episode -- <id>` (hanya episode yang sedang dikerjakan). Masalah di episode lain **bukan** penghambat episode ini: jangan menjadikannya tugas atau syarat di laporan; cukup satu baris informasi di bagian "Di luar episode ini" (lihat `docs/WORKFLOW-AI-AGENT.md` §10–11).
8. Render MP4 hanya ketika pengguna memintanya secara eksplisit.

## Batas arsitektur

- `src/topics/<topik>/`: kode satu topik video. `compositions.tsx` mendaftarkan komposisinya; `src/Root.tsx` hanya memanggil per topik.
- `src/shared/`: elemen reusable lintas topik: `episode/` (template episode: timeline dari audio, VO, caption, watermark, CTA; `cues.ts` = frame saat sebuah kata diucapkan, untuk memicu animasi dari caption hasil alignment), `maps/` (`WorldMap`: peta dunia Natural Earth 1:50m, Mercator/globe, sorot negara, zoom `mixView`, busur `screenArc`), `camera/` (`CameraRig`: kamera 2.5D dengan keyframe, tracking `mixPose`, lapisan parallax `CamLayer` ber-`depth`/`blur`/`blend`, guncangan genggam, `beatKick`, motion blur), `brand/` (watermark, klip CTA, font), `audio/` (`Sfx`: efek suara pada frame cue), `patterns/` (pola scene: `BigNumber`, `MythFact`, `Compare`, `ProcessFlow`, `RankList`, `ZoomDetail`), `look/` (`Backdrop`, `Grain`, token palet `tokens()`, `Icon`), `render/` (`LightProvider`, `Shaded` bermaterial, `ContactShadow`, `depthStyle`, helper bentuk), `physics/` (`fall`, `squashStretch`, `follow`, `swing`, `settle`, `Joint`, `Pour`, `Liquid`, `Smoke`), `three/` (`Stage3D`, `Model`; 3D opsional), `katalog.tsx` (komposisi acuan di folder katalog), `anim/` (kit gerak: `Reveal`/`Stagger`/`SplitText` masuk-keluar, `Idle`/`Shake`/`Pulse`/`Burst`/`Highlight`/`Swap`/`Particles` aksen dan hold hidup, `DrawPath`, `CountUp`, kurva `EASE`/`track`; peragaan di `Catalog.tsx`), `captions/`, `motion.ts`. Jangan menaruh logika satu topik di sini.
- `briefs/`: brief dan fakta per episode (`<episode>.json`).
- `scripts/`: `doctor.ts` (cek lingkungan), `new-episode.ts`, `vo-fish.ts` (Fish Audio + loudness), `align-captions.ts` (whisper), `image-agnes.ts` (ilustrasi AI opsional), `check-episodes.ts`, `validate-facts.ts`, `make-sfx.ts` (SFX sintesis + `public/sfx/LICENSES.json`), `font-add.ts` (unduh font Fontsource), `icon-add.ts` (unduh ikon lucide/phosphor), `model-add.ts` (unduh model 3D CC0 Poly Haven), `motion-check.ts` (ukur gerak + filmstrip), `layout-check.ts` (ukur tata letak teks); pengujian di `scripts/tests/`.
- `.env`: kunci Fish Audio (`FISH_AUDIO_API_KEY`, `FISH_AUDIO_REFERENCE_ID`); jangan dicetak, disalin ke manifest, atau di-commit.
- `docs/`: `brand/` (identitas dan panduan) serta dokumen per topik.
- `public/`: aset runtime, dibaca lewat `staticFile()`: `brand/`, `icons/` (registri ikon `icons.json` + `LICENSES/`), `models/` (model 3D + `models.json`), `fonts/` (font di-host sendiri dari Fontsource: woff2 + `LICENSE.txt`, registri `fonts.json`; dimuat dengan `font(id)`/`episodeFonts()` dari `src/shared/brand/fonts.ts`; jangan memakai Google Fonts), dan `<topik>/`.
- `out/<topik>/`: hasil render.

## Identitas SeFakta yang dikunci

Aturan di dokumen ini berlaku untuk video berikutnya. Video yang sudah ada (matrix-effect, file-deleted) dibiarkan apa adanya; brief-nya berstatus `arsip` dan dilewati validator.

Keputusan pemilik (2026-11-07): font Poppins, pembuka narasi "SeFakta hari ini: …", dan gaya watercolor yang disebut dokumen brand dan panduan produksi **tidak wajib**. Bila dokumen lain menyebutnya, `AGENTS.md` yang berlaku.


- Format utama: vertikal 1080×1920, 30 fps, sekitar 60 detik.
- Username resmi: `@sefaktaofficial`.
- Warna brand: Biru SeFakta `#0D2250`, Kuning Fakta `#FFB000`, Biru Malam `#081736` — untuk logo, watermark, dan CTA (sudah tertanam di asetnya). Palet video mengikuti gaya visual episode.
- **Gaya visual dipilih per episode berdasarkan isi faktanya** (mis. sejarah → peta/arsip, sains → diagram, antariksa → gelap/kosmik) dan dicatat di brief: `visualStyle: { name, reason, tone, palette?, captionColors? }`. `tone` (`light`/`dark`) = kecerahan latar dominan; menentukan versi watermark dan warna caption default. `captionColors: { text, highlight, highlightText }` opsional; validator menolak kontras di bawah 4,5:1. Visual scene menerima `style` (visualStyle) sebagai prop. Satu gaya konsisten untuk semua scene satu episode. Yang tidak ikut berubah: watermark, klip CTA, logo, dan username.
- **Font dipilih per episode sesuai konsep visual** dan dicatat di brief: `visualStyle.fonts: { display, text?, reason }` (id Fontsource, maks. 2 keluarga). Bila font belum ada di `public/fonts/fonts.json`, unduh dulu dengan `npm run font:add -- <id>`; jangan memakai Google Fonts, CDN, atau font sistem. Caption, watermark, dan CTA tetap memakai font brand (Plus Jakarta Sans). Aturan lengkap: `docs/WORKFLOW-AI-AGENT.md` §7.6.
- Image generation (Agnes AI, `npm run image`) **opsional**, hanya bila adegan butuh suasana tanpa foto/data; maksimal 1–2 scene per episode, label "ILUSTRASI", satu `imageStyle` per episode. Peta, diagram, angka, dan teks tetap dari kode. Aturan lengkap di `docs/WORKFLOW-AI-AGENT.md` §7.5.
- Watermark selebar sekitar 18% frame, opacity 85%, di kanan atas.
- Caption: agent memilih satu mode sesuai konsep visual episode — `ringkasan` (satu kalimat utuh 8–14 kata per scene), `subtitle` (kata per kata), atau `headline` — dan mencatatnya di brief (`captionMode`). Satu fokus baca pada satu waktu.
- Penutup: klip CTA resmi `public/brand/cta-opsi1.mp4` (4 detik) diputar setelah jeda 1 dtk tanpa narasi (`CTA_HOLD_SECONDS`) dan transisi iris ±0,7 dtk dari frame fakta terakhir (`src/shared/brand/CtaClip.tsx`). Suaranya adalah **satu VO CTA bersama untuk semua episode**, `public/brand/cta-vo.mp3` ("Ikuti Sefakta! Fakta baru, tiap hari!", 3,1 dtk, -14 LUFS; diambil dari VO CTA episode Tambora) (`CTA_VO_FILE` di `src/shared/brand/ctaVoice.ts`). `npm run vo` tidak membuat CTA per episode. Jangan mengganti file ini untuk satu episode; bila narator brand berganti, buat ulang sekali untuk semua. Audio asli klip hanya dipakai bila file itu hilang; CTA tidak boleh bisu.
- Audio: narator prioritas mix. SFX dan musik opsional; bila dipakai, hanya pada beat cerita (3–8 SFX per episode), tanpa lagu populer/trending, dan setiap file tercatat lisensinya di `public/sfx/LICENSES.json`. Aturan lengkap: `docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md` §7.
- Kecepatan VO default 1,1× (±150 kata/menit; `FISH_AUDIO_SPEED`). Jangan mempercepat VO untuk mengejar durasi; pangkas naskah.
- Logo dan watermark tidak boleh diubah warna, diputar, atau diberi efek baru.
- `docs/brand/cta-sefakta.tsx` adalah desain asli CTA (referensi brand); video memakai klip `cta-opsi1.mp4`.

## Aturan Remotion

- Gunakan `useCurrentFrame()`, `interpolate()`, dan `Easing` untuk semua animasi.
- Ambil `fps` dari `useVideoConfig()` untuk konversi detik ke frame.
- Gunakan node JSX terpisah untuk scene atau layer yang perlu diedit mandiri di Studio.
- Loop hanya untuk elemen repetitif yang dikendalikan sebagai satu template.
- Gunakan `staticFile()` untuk aset di `public/`.
- Headline harus singkat, mempunyai satu fokus, dan terbaca saat preview diperkecil.

## Quality gate

- Tidak ada error TypeScript, ESLint, atau bundle (`npm run quality`).
- Episode lolos `npm run check:episodes` (per episode: `-- --episode=<id>`): VO sesuai naskah, loudness -14 ±1 LUFS dan true peak ≤ -1 dBTP, caption tersinkron dengan cakupan kata ≥ 90%, durasi cerita 55–65 dtk; sebelum tayang tidak ada visual placeholder (`--publish`).
- Fakta episode lolos `npm run validate:facts`; sebelum publikasi jalankan dengan `-- --publish`.
- Tidak ada frame kosong yang tidak disengaja.
- Gerak lolos `npm run motion:check -- <id>`: tidak ada visual beku ≥ 3 dtk, setiap scene punya entrance dan beat yang mengikuti narasi.
- Tata letak lolos `npm run layout:check -- <id>`: tidak ada teks keluar frame, di zona watermark/caption, bertumpuk, atau memakai font cadangan.
- Review visual independen ≥ 14/18 tanpa nilai 0 (`docs/REVIEW-VISUAL.md`) setelah minimal satu putaran revisi.
- Ikon, font, dan model 3D hanya dari registri (`icon:add`, `font:add`, `model:add`) dengan lisensi tercatat.
- Copy tidak overflow dan hierarchy tetap jelas.
- Kontras warna cukup untuk teks utama.
- Scene mempunyai entrance dan hold yang memberi waktu baca.
- Aset memiliki lisensi atau izin penggunaan yang jelas.
- Output memakai dimensi, fps, dan durasi sesuai brief.

Jangan menimpa perubahan pengguna yang tidak terkait. Jika struktur belum cukup, tambahkan komponen reusable dengan default visual yang layak produksi.
