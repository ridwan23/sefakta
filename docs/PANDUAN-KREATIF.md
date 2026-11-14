# Panduan kreatif: episode yang tidak bisa ditebak

Dokumen ini untuk agent yang memproduksi episode. Isinya cara mengambil keputusan kreatif: gaya, struktur cerita, pembuka, kamera, dan mode caption. Standar fakta, gerak, dan tata letak tetap di `docs/WORKFLOW-AI-AGENT.md` dan `AGENTS.md`. Bila ada perbedaan, `AGENTS.md` yang berlaku.

## 0. Masalahnya

Agent bahasa cenderung memilih jawaban paling aman. Satu agent yang memilih "yang paling cocok" untuk setiap fakta akan menghasilkan video yang mirip-mirip. Riwayat SeFakta sampai 2026-11-13 (`npm run creative:draw -- --history`) menunjukkannya:

- 8 dari 8 episode memakai caption `subtitle`.
- 6 dari 8 memakai struktur yang sama: hook → konteks → mekanisme → dampak → jawaban.
- Gaya hanya berganti antara "infografis krem terang" dan "diagram gelap".

Penonton yang sudah menonton tiga episode bisa menebak episode keempat. Solusinya bukan meminta agent "lebih kreatif", karena permintaan seperti itu juga dijawab dengan rata-rata. Solusinya ada tiga:

1. **Acak.** Kombinasi diundi, bukan dipilih. Agent tidak bisa jatuh ke kebiasaannya sendiri.
2. **Tercatat.** Seed, kartu, pilihan, dan setiap tukar atau undi ulang disimpan di brief. Agent tidak bisa mengundi diam-diam sampai keluar pilihan aman.
3. **Ditafsirkan.** Kartu hanya bahan. Agent menerjemahkannya menjadi konsep yang jujur terhadap fakta (§3). Bagian inilah yang membedakan video yang terasa disengaja dari video yang terasa acak.

## 1. Kapan dan bagaimana

Undian dilakukan setelah fakta dan empat kalimat konflik siap (WORKFLOW §1), **sebelum menulis naskah**, karena struktur cerita ikut diundi.

```bash
npm run new:episode -- <id> --title="…" --series=<Pilar>
npm run creative:draw -- <id>              # 3 kartu, tersimpan di brief
npm run creative:draw -- <id> --pick=2     # pilih; scene TODO diganti kerangka strukturnya
# isi creative.concept di brief (§3), lalu tulis naskah mengikuti struktur kartu
npm run validate:facts
```

Satu kartu berisi enam sumbu ditambah dua batasan:

| Sumbu | Isi | Dihindari dari riwayat |
|---|---|---|
| Gaya (`family`) | gaya visual yang kitnya siap dan cocok dengan pilar | 4 episode terakhir |
| Struktur | 9 alur: klasik, misteri, hitung mundur, eksperimen, sudut pandang benda, mundur waktu, dua dunia, zoom terus, mitos beruntun | 2 episode terakhir |
| Pembuka | 7 cara membuka detik 0–5 | 2 episode terakhir |
| Kamera | 6 bahasa kamera | 2 episode terakhir |
| Caption | `subtitle` / `ringkasan` / `headline` | makin sering dipakai, makin kecil peluangnya |
| Tone | light / dark sesuai gaya | — |
| Batasan | 2 aturan pemicu ide, mis. "angka sebagai benda fisik" atau "match-cut bentuk" | — |

Isi dek ada di `scripts/lib/creative.ts`. Gaya yang kitnya belum ada hanya keluar dengan `--wild`. Kitnya harus dibuat dulu di `src/shared/` dan diperagakan di katalog.

## 2. Memilih kartu

Untuk **setiap** kartu, tulis satu kalimat konsep (di catatan kerja, bukan di brief) sebelum memilih. Lalu nilai:

1. **Jujur:** gaya dan struktur tidak membelokkan klaim. Struktur "misteri" untuk fakta yang tidak punya teka-teki akan terasa dipaksakan.
2. **Mekanisme terlihat:** penonton bisa melihat *bagaimana* sesuatu terjadi, bukan hanya membaca bahwa itu terjadi.
3. **Mengejutkan:** penonton episode sebelumnya tidak akan menduga bentuk ini.
4. **Bisa dibuat:** kit ada, dan tidak ada aset yang harus dikarang tanpa lisensi.

Pilih kartu **paling mengejutkan yang lolos 1 dan 2**, bukan yang paling nyaman.

- **Tukar satu sumbu** (`--swap=<sumbu>:<nilai> --why="…"`) bila satu sumbu benar-benar bertentangan dengan isi fakta. Contoh: kamera "zoom terus" untuk fakta tentang perbandingan dua negara. Alasannya harus soal fakta, bukan soal kenyamanan. Maksimal satu sumbu.
- **Undi ulang** (`--reroll="…"`) hanya bila ketiga kartu gagal di poin 1. Undi ulang tercatat beserta alasannya, dan pemilik bisa melihatnya.
- Jangan menukar caption ke `subtitle` hanya karena biasa. `ringkasan` dan `headline` sah dan memberi ruang visual lebih besar.

## 3. Dari kartu ke konsep

Isi `creative.concept` di brief:

```json
"concept": {
  "idea": "…",
  "signature": "…",
  "onlyHere": "…"
}
```

- `idea`: satu kalimat gagasan visual. Dunia apa yang dipakai, dan kenapa dunia itu muncul dari fakta ini.
- `signature`: satu momen visual yang akan diingat atau di-screenshot penonton.
- `onlyHere`: kenapa konsep ini tidak bisa dipakai ulang untuk episode lain.

Validator menolak isian TODO saat publikasi. Cara mengisinya:

1. **Cari dunia benda fakta itu.** Di mana fakta ini terjadi secara fisik? Di dapur, di saraf mata, di kawah, di server, atau di perut komodo? Gaya kartu adalah **bahan** untuk membangun dunia itu, bukan tema yang ditempel. "Papan tulis" untuk fakta nasi dingin bukan berarti papan kelas. Bisa jadi papan resep di dinding dapur, dengan rantai pati digambar spidol di sebelah daftar belanja.
2. **Pilih satu objek pahlawan** dan rencanakan perubahan statusnya dari awal sampai akhir: diam, aktif, berubah, selesai. Penonton mengikuti benda, bukan teks.
3. **Letakkan momen signature di titik balik struktur.** Di "misteri", titik baliknya di scene `pelaku`. Di "hitung mundur", di `satu`. Di "zoom terus", di `inti`. Rancang momen ini dulu, lalu scene lain yang mengantarnya.
4. **Uji tukar.** Ganti nama faktanya dengan fakta lain. Bila konsep masih jalan tanpa perubahan berarti, konsep itu generik. Ulangi langkah 1.
5. **Ide pertama adalah ide rata-rata.** Tulis tiga tafsiran untuk kartu yang dipilih. Pakai yang pertama hanya bila setelah dibandingkan memang yang terkuat.
6. **Batasan kartu adalah alat.** "Minimal 2 scene tanpa headline" memaksa visual menjelaskan sendiri. "Satu objek pahlawan di semua scene" memaksa kesinambungan. Tafsirkan supaya membantu fakta. Bila sebuah batasan merusak kejelasan, catat alasannya di `creative.concept.idea` dan langgar sekecil mungkin.

### Contoh tafsiran

Fakta (contoh, bukan episode): *cahaya terang memicu bersin pada sebagian orang karena sinyal saraf mata "bocor" ke jalur bersin.* Pilar Tubuh.

| Kartu | Konsep satu kalimat | Nilai |
|---|---|---|
| Papan kapur · misteri · kuis-tebak · kunci-statis · ringkasan | Papan kapur detektif. Tersangka: debu, dingin, cahaya. Petunjuk dicoret satu per satu sampai garis kapur dari mata dan hidung bertemu di satu simpul. | jujur, mekanisme terlihat, mengejutkan → **dipilih** |
| Clay · dua dunia · tanya-langsung · orbit · headline | Dua kepala clay keluar rumah bersamaan, hanya satu yang bersin. | lucu, tapi mekanismenya sulit dibuat dengan clay |
| Isometrik · hitung mundur · angka-kejutan · cut-per-beat · subtitle | Kepala sebagai "kota" isometrik dengan jalur kabel saraf. | mekanisme bagus, tapi angka kejutannya lemah |

Konsep yang dipilih:

- `idea`: "papan kapur penyidik, karena fakta ini memang teka-teki 'siapa pelakunya'"
- `signature`: "dua garis kapur, saraf mata dan saraf bersin, saling menyilang lalu ditandai lingkaran merah 'TKP'"
- `onlyHere`: "hanya fakta ini yang pelakunya cahaya dan TKP-nya persilangan saraf"

## 4. Yang tidak ikut diundi

Kebaruan tidak boleh mengalahkan kejelasan. Hal berikut tetap berlaku untuk setiap kartu:

- Fakta lolos `validate:facts`, dan angka di layar tercakup `facts[]`.
- Hook personal dan aktif, dengan benda yang dikenal sejak frame pertama (PANDUAN-AI-AGENT-PRODUKSI §2.1). Setiap pembuka di dek harus diwujudkan dalam batas ini.
- Satu fokus baca pada satu waktu, area aman, dan kontras caption ≥ 4,5:1.
- `motion:check` dan `layout:check` 0 error, serta review independen ≥ 14/18.
- Identitas brand (watermark, CTA, logo) tidak berubah.
- Font, ikon, dan model hanya dari registri.

## 5. Kebiasaan kerja yang membuat hasil konsisten bagus

Undian membuat episode berbeda. Kebiasaan berikut membuat hasilnya tetap bagus:

1. **Rencana sebelum kode.** Storyboard per kata pemicu (WORKFLOW §7.1), dengan posisi dihitung, bukan dikira-kira.
2. **Lihat hasil sendiri.** Render still di setiap beat dan lihat gambarnya, bukan hanya membaca kodenya. Bayangkan layar ponsel di tangan: apa yang pertama terbaca? Apakah ada yang terpotong?
3. **Perbaiki yang paling mengganggu dulu.** Satu teks terpotong lebih buruk daripada sepuluh detail kurang halus.
4. **Kit dulu, topik kemudian.** Bila gaya kartu butuh komponen yang belum ada, buat di `src/shared/` dengan default layak produksi, lalu peragakan di katalog. Episode berikutnya ikut mendapat manfaat.
5. **Jujur di laporan.** Sebutkan apa yang diperiksa dan apa yang belum, misalnya "gerak belum ditonton, hanya still". Sebutkan juga kartu, tukar, dan undi ulang yang dilakukan.

## 6. Penjaga otomatis

| Aturan | Diperiksa oleh | Level |
|---|---|---|
| Brief baru (punya `createdAt`) wajib diundi dan kartunya dipilih | `validate:facts` | peringatan (draft), error (publikasi) |
| Kartu tidak diundi ulang diam-diam | `creative:draw` (undian tersimpan; ulang wajib `--reroll` beralasan) | tolak |
| `chosen` sama dengan kartu, kecuali satu sumbu yang dicatat di `swaps` beserta alasan | `validate:facts` | error |
| `captionMode` dan `visualStyle.tone` mengikuti kartu | `validate:facts` | error |
| `concept.idea/signature/onlyHere` terisi | `validate:facts` | peringatan (draft), error (publikasi) |
| Gaya tidak sama dengan episode sebelumnya | `validate:facts` | error (sama dalam 3 terakhir: peringatan) |
| ≥ 4 dari 6 sumbu tidak sama dengan salah satu dari 3 episode terakhir | `validate:facts` | error |
| id scene mengikuti struktur | `validate:facts` | peringatan |

Brief yang dibuat sebelum dek kreatif (tanpa `createdAt`) tidak diwajibkan. Sidiknya diperkirakan dari `visualStyle.name` dan id scene, supaya undian tetap menghindarinya.

## 7. Memperluas dek

Dek yang lebih besar berarti lebih banyak kombinasi yang tidak bisa ditebak. Ubah `scripts/lib/creative.ts`:

- Kit gaya baru selesai dan diperagakan di katalog → tambahkan atau ubah `FAMILIES` dengan `ready: true`.
- Struktur cerita baru → `STRUCTURES` (5 scene, total ±58 dtk).
- Pembuka, kamera, atau batasan baru → `OPENINGS`, `CAMERAS`, `CONSTRAINTS`.

Hanya masukkan pilihan yang sudah terbukti bisa dibuat dengan kualitas produksi.
