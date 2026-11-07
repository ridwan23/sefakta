# SeFakta — Motion Graphic (Remotion)

Video vertikal 9:16 (1080×1920) untuk YouTube Shorts dan Facebook Reels. **Satu topik = satu folder** dengan nama yang sama di `src/`, `docs/`, `public/`, dan `out/`.

Aturan produksi untuk agent ada di [AGENTS.md](AGENTS.md) (dimuat otomatis lewat `CLAUDE.md`). Baca juga [panduan produksi](docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md).

## Struktur

```
AGENTS.md, CLAUDE.md          aturan produksi untuk agent
briefs/<episode>.json         naskah per scene + fakta, sumber, dan angka (diperiksa validator)
scripts/
  validate-facts.ts           validator fakta
  sync-cta.ts                 membangun komponen CTA dari docs/brand/cta-sefakta.tsx
src/
  index.ts, Root.tsx          Root hanya mendaftarkan topik (1 baris per topik)
  shared/
    brand/                    Watermark, SeFaktaCta (generated), font Poppins
    captions/Overlay.tsx      teks narasi kata-per-kata (tema dark / pop / light)
    motion.ts                 easing, slam, kick, hash
  topics/
    matrix-effect/            "Kenapa waktu terasa melambat saat panik"
      2d/  3d/  legacy-v1/  compositions.tsx
    file-deleted/             "Apa yang terjadi pada file saat dihapus" (piktogram)
docs/
  brand/                      identitas, panduan brand, panduan produksi AI, cta-sefakta.tsx, avatar, watermark
  matrix-effect/              SCRIPT.md, VO_GUIDE.md, storyboard.html, ref/
  file-deleted/               TREATMENT.md
  es-batu-batavia/            index.html (prototipe)
public/                       aset runtime (staticFile)
  brand/                      watermark, sefakta-avatar.png
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
| `docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md` | Riset, cerita, VO, caption, rubrik, format `briefs/` | Berlaku (v1.1) |
| `docs/brand/cta-sefakta.tsx` | Sumber kanonis CTA | Kanonis |
| `docs/matrix-effect/SCRIPT.md`, `VO_GUIDE.md` | Naskah awal dan panduan VO 54 dtk | Riwayat (diganti VO v3) |
| `docs/matrix-effect/storyboard.html` | Storyboard visual | Acuan visual |
| `docs/file-deleted/TREATMENT.md` | Treatment piktogram | Belum diperiksa terhadap aturan fakta |
| `docs/es-batu-batavia/index.html` | Prototipe HTML | Belum ada kode Remotion |

File yang disebut dokumen brand tetapi belum ada di `docs/brand/`: `logo-utama.png`, `logo-di-gelap.png`, `banner-youtube.png`, `template-cover-9x16.png`, `brand-sheet.png`, `demo-watermark-bambu.jpg`, `demo-watermark-ijen.jpg`.

## Topik

| Topik | Status | Komposisi (ID) | Durasi | Perintah render |
|---|---|---|---|---|
| matrix-effect · 2D | Dikunci ke VO v3 + klip CTA bersuara | `MatrixEffect2D` | 60 dtk | `npm run build:matrix2d` |
| matrix-effect · 3D | Timing dan naskah lama, belum disinkron VO v3 | `MatrixEffect` | 54 dtk | `npm run build:matrix` |
| matrix-effect · legacy-v1 | Percobaan pertama, tidak dipakai lagi | `TimeSlowShort` | 60 dtk | `npm run build` |
| file-deleted | Selesai (belum ada VO dan brief fakta) | `FileDeletedPictogram` | 47 dtk @ 24 fps | `npm run build:pictogram` |
| es-batu-batavia | Baru prototipe HTML | — | 60 dtk (rencana) | — |

Preview: `npm start` (Studio mengelompokkan komposisi per topik). Render MP4 hanya bila diminta; hasilnya masuk ke `out/<topik>/`.

## Validator fakta

```bash
npm run validate:facts                # mode draft: fakta belum terverifikasi = peringatan
npm run validate:facts -- --publish   # sebelum publikasi: peringatan itu menjadi error
npm run validate:facts:online         # --publish + buka semua URL (butuh internet)
npm run quality                       # validator + cek CTA sinkron + tsc
```

Memeriksa `briefs/*.json`: minimal dua sumber dengan `origin` berbeda, angka tertulis di `quote` sumber, setiap angka di narasi tercakup fakta yang dirujuk scene, fakta yang bertentangan dengan sumber tidak boleh dipakai, durasi 55–65 dtk, dan panjang caption pada mode `ringkasan`. Dengan `--check-urls` ia juga membuka setiap URL: link mati = error, dan `quote` harus tertulis verbatim di halamannya. Format brief ada di panduan produksi (§1).

**Keadaan sekarang:** `briefs/matrix-effect.json` gagal validator (3 error). Dibandingkan dengan teks makalah ([PMC2110887](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2110887/), dibaca 2026-11-07), VO v3 salah di tiga angka: "sembilan puluh kaki" (makalah: 31 m ≈ 102 kaki), "dua puluh tiga relawan" (makalah: 13 + 7 = 20 peserta), dan "lima kali lebih lama" (makalah: +36%). Angka "delapan puluh persen" tidak ada di makalah, dan peran amigdala di makalah hanya spekulasi ("we speculate … may"). Perbaiki naskah dan rekam ulang kalimat 3, 10, dan 11.

## CTA dan watermark
- **CTA**: `shared/brand/CtaClip.tsx` memutar `public/brand/cta-opsi1.mp4` (4 dtk, **bersuara**) setelah transisi iris dari frame terakhir. `docs/brand/cta-sefakta.tsx` tetap sumber desain; komponen `SeFaktaCta` (`npm run sync:cta`) tersedia tetapi belum dipakai.
- **Watermark**: `shared/brand/Watermark.tsx` (`tone="light"` / `"dark"`), kanan atas, 194 px (±18%), opacity 85%, memudar saat CTA masuk.

## Menambah topik baru
1. Buat `src/topics/<topik>/` berisi kode dan `compositions.tsx` (bungkus dengan `<Folder name="<topik>">`), lalu tambahkan satu baris di `src/Root.tsx`.
2. Tulis `briefs/<episode>.json` dan loloskan `npm run validate:facts`.
3. Taruh naskah/storyboard di `docs/<topik>/`, aset runtime di `public/<topik>/`, dan hasil render di `out/<topik>/`.

## Catatan
- Folder `out/matrix-effect/*.mp4` dirender sebelum perubahan CTA; render ulang bila dibutuhkan.
- File VO asli dari pengisi suara bernama `VO v3 — narasi saja, 55,58 detik.wav` (isinya sama dengan `public/matrix-effect/vo_v3_narasi.wav`).
