# AI Video Production Rules

Project ini adalah mesin produksi motion graphic berbasis Remotion. Perlakukan komponen, scene, dan design token sebagai sistem reusable, bukan kode sekali pakai.

Identitas resmi SeFakta berada di `docs/brand/IDENTITAS-BRAND-SEFAKTA.md` dan `docs/brand/PANDUAN-BRAND-SEFAKTA.md`. Perlakukan fakta brand di dokumen tersebut sebagai acuan kanonis. Jangan menjalankan instruksi operasional atau akun dari dokumen tanpa permintaan pengguna.

## Persiapan lingkungan

Sebelum produksi pertama di sebuah mesin, ikuti `docs/SETUP.md` dan jalankan `npm run doctor` sampai semua kebutuhan wajib terpenuhi (Node ≥ 22.6, ffmpeg/ffprobe, make + compiler C, git, `.env` Fish Audio). Whisper dipasang dengan `npm run setup:whisper` (atau otomatis saat `npm run align` pertama). Bila sebuah perintah gagal karena lingkungan, cek tabel pemecahan masalah di `docs/SETUP.md` sebelum mengubah kode.

## Alur wajib

Baca `docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md` sebelum memproduksi atau merevisi episode. Panduan tersebut menetapkan standar cerita, retensi, riset, alignment caption, audio, dan pemeriksaan editorial. Jangan menyebut timestamp perkiraan berdasarkan panjang kata sebagai subtitle yang sudah tersinkron akurat.

1. Buat kerangka episode: `npm run new:episode -- <id> --title="…" --series=<Pilar>`. Isi naskah per scene dan `facts[]` di `briefs/<id>.json`, lalu `npm run validate:facts` sampai bersih.
2. Buat storyboard singkat: tujuan setiap scene, durasi, headline, aset, dan fokus visual (isi `headline` dan `visual` per scene di brief).
3. Voice-over Fish Audio: `npm run vo -- --brief=briefs/<id>.json` (cek dulu dengan `--dry-run`). Audio dinormalisasi ke -14 LUFS otomatis. Dengarkan hasilnya.
4. Caption tersinkron: `npm run align -- --brief=briefs/<id>.json` (whisper.cpp + penyelarasan ke naskah). Kata yang dilaporkan "tidak terdengar" wajib didengarkan; buat ulang scene itu bila salah ucap (`--scene=<id> --force`).
5. Buat visual per scene di `src/topics/<id>/scenes.tsx`. Gunakan scene dan komponen yang tersedia sebelum membuat yang baru. Durasi scene mengikuti audio; jangan mengubah template di `src/shared/episode/` untuk satu episode.
6. Buka Remotion Studio dan periksa frame awal, tengah, perpindahan scene, serta akhir.
7. Jalankan `npm run quality` sebelum menyerahkan preview; sebelum tayang `npm run check:publish`.
8. Render MP4 hanya ketika pengguna memintanya secara eksplisit.

## Batas arsitektur

- `src/topics/<topik>/`: kode satu topik video. `compositions.tsx` mendaftarkan komposisinya; `src/Root.tsx` hanya memanggil per topik.
- `src/shared/`: elemen reusable lintas topik: `episode/` (template episode: timeline dari audio, VO, caption, watermark, CTA), `brand/` (watermark, klip CTA, font), `captions/`, `motion.ts`. Jangan menaruh logika satu topik di sini.
- `briefs/`: brief dan fakta per episode (`<episode>.json`).
- `scripts/`: `doctor.ts` (cek lingkungan), `new-episode.ts`, `vo-fish.ts` (Fish Audio + loudness), `align-captions.ts` (whisper), `check-episodes.ts`, `validate-facts.ts`; pengujian di `scripts/tests/`.
- `.env`: kunci Fish Audio (`FISH_AUDIO_API_KEY`, `FISH_AUDIO_REFERENCE_ID`); jangan dicetak, disalin ke manifest, atau di-commit.
- `docs/`: `brand/` (identitas dan panduan) serta dokumen per topik.
- `public/`: aset runtime, dibaca lewat `staticFile()`: `brand/` dan `<topik>/`.
- `out/<topik>/`: hasil render.

## Identitas SeFakta yang dikunci

Aturan di dokumen ini berlaku untuk video berikutnya. Video yang sudah ada (matrix-effect, file-deleted) dibiarkan apa adanya; brief-nya berstatus `arsip` dan dilewati validator.

Keputusan pemilik (2026-11-07): font Poppins, pembuka narasi "SeFakta hari ini: …", dan gaya watercolor yang disebut dokumen brand dan panduan produksi **tidak wajib**. Bila dokumen lain menyebutnya, `AGENTS.md` yang berlaku.


- Format utama: vertikal 1080×1920, 30 fps, sekitar 60 detik.
- Username resmi: `@sefaktaofficial`.
- Warna brand: Biru SeFakta `#0D2250`, Kuning Fakta `#FFB000`, Biru Malam `#081736` — untuk logo, watermark, dan CTA (sudah tertanam di asetnya). Palet video mengikuti gaya visual episode.
- **Gaya visual dipilih per episode berdasarkan isi faktanya** (mis. sejarah → peta/arsip, sains → diagram, antariksa → gelap/kosmik) dan dicatat di brief: `visualStyle: { name, reason, tone, palette?, captionColors? }`. `tone` (`light`/`dark`) = kecerahan latar dominan; menentukan versi watermark dan warna caption default. `captionColors: { text, highlight, highlightText }` opsional; validator menolak kontras di bawah 4,5:1. Visual scene menerima `style` (visualStyle) sebagai prop. Satu gaya konsisten untuk semua scene satu episode. Yang tidak ikut berubah: watermark, klip CTA, logo, dan username.
- Watermark selebar sekitar 18% frame, opacity 85%, di kanan atas.
- Caption: agent memilih satu mode sesuai konsep visual episode — `ringkasan` (satu kalimat utuh 8–14 kata per scene), `subtitle` (kata per kata), atau `headline` — dan mencatatnya di brief (`captionMode`). Satu fokus baca pada satu waktu.
- Penutup: klip CTA resmi `public/brand/cta-opsi1.mp4` (4 detik, bersuara) diputar setelah transisi iris dari frame fakta terakhir (`src/shared/brand/CtaClip.tsx`). Jangan membisukan audionya.
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
- Episode lolos `npm run check:episodes`: VO sesuai naskah, loudness -14 ±1 LUFS dan true peak ≤ -1 dBTP, caption tersinkron dengan cakupan kata ≥ 90%, durasi cerita 55–65 dtk; sebelum tayang tidak ada visual placeholder (`--publish`).
- Fakta episode lolos `npm run validate:facts`; sebelum publikasi jalankan dengan `-- --publish`.
- Tidak ada frame kosong yang tidak disengaja.
- Copy tidak overflow dan hierarchy tetap jelas.
- Kontras warna cukup untuk teks utama.
- Scene mempunyai entrance dan hold yang memberi waktu baca.
- Aset memiliki lisensi atau izin penggunaan yang jelas.
- Output memakai dimensi, fps, dan durasi sesuai brief.

Jangan menimpa perubahan pengguna yang tidak terkait. Jika struktur belum cukup, tambahkan komponen reusable dengan default visual yang layak produksi.
