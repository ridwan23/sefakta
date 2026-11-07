# Persiapan lingkungan produksi SeFakta

Untuk manusia dan AI agent yang menyiapkan proyek di mesin baru. Mulai dari langkah 1, lalu pastikan `npm run doctor` hijau.

## Ringkas

```bash
npm install                 # dependensi (versi Remotion dikunci 4.0.541)
cp .env.example .env        # lalu isi FISH_AUDIO_API_KEY dan FISH_AUDIO_REFERENCE_ID
npm run setup:whisper       # whisper.cpp + model "small" ke .whisper/ (±540 MB, sekali saja)
npm run doctor              # cek semua kebutuhan; harus "Lingkungan siap produksi."
npm run quality             # gerbang kualitas harus lolos
```

## 1. Alat sistem

| Kebutuhan | Untuk | Cara pasang |
|---|---|---|
| Node.js ≥ 22.6 | menjalankan skrip `.ts` (`--experimental-strip-types`) dan Remotion | https://nodejs.org (22 LTS atau lebih baru) |
| ffmpeg + ffprobe | normalisasi loudness, konversi audio untuk Whisper, durasi | macOS `brew install ffmpeg` · Linux `apt install ffmpeg` |
| make + compiler C | membangun whisper.cpp dari sumber | macOS `xcode-select --install` · Linux `apt install build-essential` |
| git | mengunduh whisper.cpp | bawaan sistem / pengelola paket |
| Ruang disk ≥ 2 GB | Whisper (±540 MB), bundle, render | — |
| python3 + openssl *(opsional)* | `npm run test:validator` (server HTTPS uji lokal) | bawaan macOS / pengelola paket |
| Internet | Fish Audio, unduhan Whisper, font Google, `validate:facts:online` | — |

## 2. Kunci Fish Audio (`.env`)

1. Buat API key di https://fish.audio/app/developers/.
2. `cp .env.example .env`, isi `FISH_AUDIO_API_KEY`.
3. Isi `FISH_AUDIO_REFERENCE_ID` (id suara referensi) agar narator sama di setiap video.
4. Opsional: `FISH_AUDIO_MODEL` (default `s2.1-pro-free`), `FISH_AUDIO_SPEED` (default `1.25`, rentang 0,5–2,0; per scene bisa diatur dengan `voiceoverSpeed` di brief).

`.env` ada di `.gitignore`. Jangan mencetak, menyalin ke manifest, atau meng-commit nilainya. `npm run doctor` hanya melaporkan "terisi/kosong".
Cek naskah tanpa memakai kredit: `npm run vo -- --brief=briefs/<id>.json --dry-run`.

## 3. Whisper (caption tersinkron)

- `npm run setup:whisper` memasang whisper.cpp **1.5.5** (dibangun dengan `make`) dan model multilingual **`small`** (`ggml-small.bin`, ±470 MB) ke `.whisper/`.
- Bila dilewati, `npm run align` memasangnya otomatis saat pertama kali dijalankan.
- `.whisper/` ada di `.gitignore`. Untuk memasang ulang: hapus `.whisper/` lalu jalankan `npm run setup:whisper`.
- Akurasi teruji (VO bahasa Indonesia): selisih rata-rata 0,18 dtk terhadap timing terukur, maksimal 0,74 dtk. Waktu kata diambil dari audio, teks dari naskah; kata yang tidak cocok dilaporkan "tidak terdengar".

## 4. Pemecahan masalah

| Gejala | Penyebab | Solusi |
|---|---|---|
| Proses berhenti dengan **exit 137** saat render still/video | memori habis (beberapa render beruntun) | jalankan render satu per satu, tutup aplikasi lain; render video penuh secara terpisah |
| `FISH_AUDIO_API_KEY belum ada` | `.env` kosong/tidak ada | langkah 2 |
| `Fish Audio gagal (HTTP 401/402)` | key salah atau kredit habis | periksa key/kredit di dasbor Fish Audio |
| `Fish Audio gagal (HTTP 429/5xx)` | batas laju / gangguan server | skrip mencoba ulang 3×; tunggu lalu jalankan lagi (scene yang sudah jadi tidak dibuat ulang) |
| `align` gagal saat memasang whisper | `make`/compiler/git tidak ada, atau offline | langkah 1, lalu `npm run setup:whisper` |
| Loudness di luar -14 ±1 LUFS | klip sangat pendek/berpuncak tinggi | `npm run vo -- --brief=… --scene=<id> --force` |
| `Audio <scene> usang` / `caption usang` | naskah atau audio berubah | `npm run vo` lalu `npm run align` |
| Font berbeda di hasil render | font Google gagal dimuat (offline) | render dengan koneksi internet |
| `remotion still` lambat pertama kali | Chrome headless diunduh Remotion | tunggu sekali; berikutnya memakai cache |
