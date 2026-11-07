# SeFakta — Motion Graphic (Remotion)

Video vertikal 9:16 (1080×1920) untuk YouTube Shorts dan Facebook Reels. **Satu topik = satu folder** dengan nama yang sama di `src/`, `docs/`, `public/`, dan `out/`.

Aturan produksi untuk agent ada di [AGENTS.md](AGENTS.md) (dimuat otomatis lewat `CLAUDE.md`). Baca juga [panduan produksi](docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md).

## Struktur

```
AGENTS.md, CLAUDE.md          aturan produksi untuk agent
briefs/<episode>.json         naskah per scene + fakta, sumber, dan angka (diperiksa validator)
scripts/
  new-episode.ts              kerangka episode baru (brief + topik + Root)
  vo-fish.ts                  voice-over Fish Audio, normalisasi -14 LUFS
  align-captions.ts           caption tersinkron (whisper.cpp + penyelarasan ke naskah)
  check-episodes.ts           pemeriksa kesiapan episode
  validate-facts.ts           validator fakta
  tests/                      pengujian validator
src/
  index.ts, Root.tsx          Root hanya mendaftarkan topik (1 baris per topik)
  shared/
    episode/                  template episode (timeline dari audio, VO, caption, watermark, CTA)
    brand/                    Watermark, CtaClip (klip CTA bersuara), font
    captions/Overlay.tsx      teks narasi kata-per-kata (tema dark / pop / light)
    motion.ts                 easing, slam, kick, hash
  topics/
    matrix-effect/            "Kenapa waktu terasa melambat saat panik"
      2d/  compositions.tsx    (video lama, arsip)
    file-deleted/             "Apa yang terjadi pada file saat dihapus" (piktogram)
docs/
  brand/                      identitas, panduan brand, panduan produksi AI, cta-sefakta.tsx, avatar, watermark
  matrix-effect/              SCRIPT.md, VO_GUIDE.md, storyboard.html, ref/
  file-deleted/               TREATMENT.md
  es-batu-batavia/            index.html (prototipe)
public/                       aset runtime (staticFile)
  brand/                      watermark, cta-opsi1.mp4
  matrix-effect/              vo_v3_narasi.wav
out/
  matrix-effect/, file-deleted/   hasil render
  _review/                    gambar QA sementara (aman dihapus)
```

## Peta dokumen

| Dokumen | Fungsi | Status |
|---|---|---|
| `AGENTS.md` | Aturan kerja agent | Berlaku |
| `docs/brand/IDENTITAS-BRAND-SEFAKTA.md`, `PANDUAN-BRAND-SEFAKTA.md` | Identitas dan aturan brand | Kanonis |
| `docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md` | Riset, cerita, VO, caption, gaya visual, rubrik, format `briefs/` | Berlaku (v1.3) |
| `docs/brand/cta-sefakta.tsx` | Desain asli CTA (video memakai klip `cta-opsi1.mp4`) | Referensi |
| `docs/matrix-effect/SCRIPT.md`, `VO_GUIDE.md` | Naskah awal dan panduan VO 54 dtk | Riwayat (diganti VO v3) |
| `docs/matrix-effect/storyboard.html` | Storyboard visual | Acuan visual |
| `docs/file-deleted/TREATMENT.md` | Treatment piktogram | Belum diperiksa terhadap aturan fakta |
| `docs/es-batu-batavia/index.html` | Prototipe HTML | Belum ada kode Remotion |

File yang disebut dokumen brand tetapi belum ada di `docs/brand/`: `logo-utama.png`, `logo-di-gelap.png`, `banner-youtube.png`, `template-cover-9x16.png`, `brand-sheet.png`, `demo-watermark-bambu.jpg`, `demo-watermark-ijen.jpg`.

## Topik

| Topik | Status | Komposisi (ID) | Durasi | Perintah render |
|---|---|---|---|---|
| matrix-effect | Video lama (arsip): VO v3 + klip CTA bersuara | `MatrixEffect2D` | 60 dtk | `npm run build:matrix2d` |
| file-deleted | Video lama (arsip) | `FileDeletedPictogram` | 47 dtk @ 24 fps | `npm run build:pictogram` |
| es-batu-batavia | Baru prototipe HTML | — | 60 dtk (rencana) | — |

Preview: `npm start` (Studio mengelompokkan komposisi per topik). Render MP4 hanya bila diminta; hasilnya masuk ke `out/<topik>/`.

## Alur episode baru

```bash
npm run new:episode -- tambora-1815 --title="Letusan Tambora 1815" --series=Alam
# isi naskah per scene + facts[] di briefs/tambora-1815.json
npm run validate:facts                                   # fakta & angka
npm run vo -- --brief=briefs/tambora-1815.json --dry-run # cek teks tanpa kredit
npm run vo -- --brief=briefs/tambora-1815.json           # Fish Audio → public/tambora-1815/vo/ (-14 LUFS)
npm run align -- --brief=briefs/tambora-1815.json        # whisper → caption tersinkron
# buat visual per scene di src/topics/tambora-1815/scenes.tsx, pratinjau: npm start
npm run quality                                          # fakta, episode, ESLint, tsc, bundle
npm run check:publish                                    # sebelum tayang: URL sumber + tanpa placeholder
```

Template (`src/shared/episode/`) menghitung durasi dari audio, memutar VO per scene, menampilkan caption sesuai `captionMode`, watermark, lalu klip CTA bersuara. Butuh `.env` berisi kunci Fish Audio (lihat `.env.example`). Whisper (±540 MB) terpasang di `.whisper/` saat `npm run align` pertama kali.

## Validator fakta

```bash
npm run validate:facts                # mode draft: fakta belum terverifikasi = peringatan
npm run validate:facts -- --publish   # sebelum publikasi: peringatan itu menjadi error
npm run validate:facts:online         # --publish + buka semua URL (butuh internet)
npm run test:validator                # 50 pengujian validator
```

Memeriksa `briefs/*.json`: `visualStyle` (gaya visual episode + alasannya) wajib ada, minimal dua sumber dengan `origin` berbeda, angka tertulis di `quote` sumber, setiap angka di narasi tercakup fakta yang dirujuk scene, fakta yang bertentangan dengan sumber tidak boleh dipakai, durasi 55–65 dtk, dan panjang caption pada mode `ringkasan`. Dengan `--check-urls` ia juga membuka setiap URL: link mati = error, dan `quote` harus tertulis verbatim di halamannya. Format brief ada di panduan produksi (§1).

**Video lama:** `briefs/matrix-effect.json` berstatus `arsip` dan dilewati validator. Video lama dibiarkan apa adanya; aturan berlaku untuk video berikutnya.

## CTA dan watermark
- **CTA**: `shared/brand/CtaClip.tsx` memutar `public/brand/cta-opsi1.mp4` (4 dtk, **bersuara**) setelah transisi iris dari frame terakhir. `docs/brand/cta-sefakta.tsx` adalah desain asli CTA (referensi).
- **Watermark**: `shared/brand/Watermark.tsx` (`tone="light"` / `"dark"`), kanan atas, 194 px (±18%), opacity 85%, memudar saat CTA masuk.

## Gaya visual
Dipilih per episode sesuai isi fakta (mis. sejarah → peta/arsip, sains → diagram, antariksa → kosmik) dan dicatat di brief: `visualStyle: { name, reason, palette? }`. Satu gaya untuk semua scene. Watermark, klip CTA, logo, dan username tidak ikut berubah.

## Catatan
- File VO asli dari pengisi suara bernama `VO v3 — narasi saja, 55,58 detik.wav` (isinya sama dengan `public/matrix-effect/vo_v3_narasi.wav`).
