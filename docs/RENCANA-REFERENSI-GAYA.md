# Rencana: Referensi Gaya Visual dari Katalog "Explainer Videos with Claude"

Status: Fase 1–2 selesai (2026-11-13). Fase 3 sebagian (2026-11-14): 6 gaya "sebagian" dilengkapi di kit (`sketch/`, `iso/`, `silhouette/`, `math/`, `collage/fold`, material clay, `anim/stepped`), diperagakan di katalog → KatalogGaya; pola scene kolase dan episode uji (review ≥ 14/18) belum. 9 gaya sisa dinilai (2026-11-14, `docs/REFERENSI-GAYA-VISUAL.md`): komik dan risograf prioritas 1; kit komik (`comic/`), risograf (`riso/`), stickman (`stickman/`), dan grid Swiss (`swiss/`) selesai dan siap diundi (2026-11-14). Dek kreatif dan undian (`npm run creative:draw`, `docs/PANDUAN-KREATIF.md`) memilih gaya per episode secara acak. Fase 4 menunggu naskah contoh dari pemilik.

Hasil:
- Fase 1: `docs/REFERENSI-GAYA-VISUAL.md` dibuat. Rujukan ditambahkan di `docs/WORKFLOW-AI-AGENT.md` §7.
- Fase 2: `motion:check` melaporkan beat per scene dan beat per 60 dtk. Peringatan muncul di bawah 10 (kalibrasi: tambora-1816 11,3, bersin-matahari 19,6). Catatan pendukung ditambahkan di `docs/REVIEW-VISUAL.md`.

## Latar belakang

Katalog eksternal "Explainer Videos with Claude" adalah halaman pembuat prompt. Isinya 20 gaya video, prompt 27–46 KB per gaya, dan 3 prompt naskah/SRT. Prompt itu ditempel ke chat Claude, yang membuat animasi Canvas/Three.js dalam satu artifact HTML lalu mengekspor MP4 dari browser.

Prompt itu tidak cocok dipakai langsung untuk SeFakta:

- Render dan ekspor terjadi di browser. SeFakta memakai Remotion dengan 1080×1920, VO Fish Audio, caption whisper, watermark, dan klip CTA.
- Tidak ada validasi fakta atau brief.
- Ada instruksi yang bertentangan dengan aturan kita, misalnya logo brand asli dan audio yang diunggah.
- Hasilnya bukan kode reusable di `src/shared/`.

Yang bernilai: katalog gaya, deskripsi visual dan gerak per gaya, serta beberapa metrik kualitas.

> Catatan: baru prompt Paper Cut-Out yang dibaca penuh. 19 gaya lain baru diketahui nama, mesin, dan "best for"-nya.

## Tujuan

Mengambil pengetahuan gaya dan metrik dari katalog tanpa mengubah pipeline Remotion, `AGENTS.md`, template `src/shared/episode/`, atau identitas brand.

## Pemetaan gaya ke pilar dan kit

| Gaya | Cocok untuk | Status kit `src/shared/` |
|---|---|---|
| Map Journey | sejarah, geopolitik, rute dagang | siap (`maps/WorldMap`, `camera/`) |
| Data Story | angka, tren, statistik | siap (`patterns/BigNumber`, `RankList`, `anim/CountUp`) |
| Flat Vector | sains, energi, kesehatan sehari-hari | siap (`look/`, `anim/`) |
| Kinetic Typography | hook, tips, before-after | siap (`anim/SplitText`) |
| Isometric Line Art | sistem, pipeline, logistik | sebagian (`three/`, `render/`) |
| Whiteboard Doodle | proses langkah demi langkah | sebagian (`anim/DrawPath`) |
| Soft 3D Clay | sains keseharian, fitur produk | sebagian (`three/`, `render/Shaded`) |
| Paper Cut-Out | cara kerja, proses, hangat | belum ada |
| Documentary Collage | sejarah, bisnis, "kenapa ini terjadi" | belum ada |
| Risograph Print | budaya, editorial | belum ada |
| Comic Panels | kisah tokoh, studi kasus | belum ada |
| Lainnya (Stickman, Particles, Liquid Glass, Terminal, Retro, Math, Swiss, Silhouette, 8-Bit) | lihat katalog | belum dinilai |

Status di atas adalah dugaan awal dan harus diverifikasi terhadap `katalog.tsx` di Fase 1.

## Rencana bertahap

### Fase 1: Dokumen referensi gaya (risiko rendah, tanpa perubahan kode)

- Baca penuh prompt gaya yang relevan, minimal 3 gaya pilihan pemilik.
- Buat `docs/REFERENSI-GAYA-VISUAL.md` dengan kolom: nama, pilar yang cocok, palet dan material, aturan gerak, status kit, dan catatan batasan.
- Verifikasi kolom status kit dengan menonton komposisi katalog (KatalogGerak, KatalogPola, KatalogObjek).
- Tambah satu rujukan di `docs/WORKFLOW-AI-AGENT.md` §7: dokumen ini bahan untuk memilih `visualStyle`.

Selesai bila: dokumen ada, status kit terverifikasi, dan tidak ada perubahan di luar `docs/`.

### Fase 2: Metrik kualitas

- `motion:check`: tambahkan laporan "beat visual per 60 dtk" sebagai peringatan, bukan error. Target awal 12–18, dikalibrasi dengan episode yang sudah ada.
- `docs/REVIEW-VISUAL.md`: tambahkan butir "4–6 poin belajar per 60 dtk", "hierarki 3 tingkat (headline, visual utama, anotasi)", dan "dapat dipahami tanpa narasi".
- Jangan menjadikan metrik ini penghambat sebelum dikalibrasi.

Selesai bila: laporan menampilkan jumlah beat, rubrik diperbarui, `npm run quality` bersih.

### Fase 3: Satu gaya baru yang reusable

- Usulan: Paper Cut-Out / Documentary Collage. Ini celah terbesar kit dan cocok untuk sejarah dan "kenapa ini terjadi". Keputusan akhir mengikuti topik episode berikutnya.
- Material dan elemen kolase (Cutout tepi sobek, halftone, Tape, Stamp, Label) **dibangun lewat Fase 4 `docs/RENCANA-SHARED-OBJEK.md`** (`shared/collage/`, `shared/labels/`). Fase ini tidak membuat ulang komponen tersebut.
- Fase ini hanya menambah yang belum tercakup di sana:
  - `anim/`: gerak kertas (slide, lipat, angkat, settle) dengan sedikit langkah stop-motion.
  - `patterns/`: satu pola scene kolase.
  - Tekstur di-cache dan memakai seed acak yang tercampur baik. Jangan xorshift satu langkah pada seed berurutan.
- Dikerjakan setelah Fase 1–4 RENCANA-SHARED-OBJEK selesai. Peragakan di katalog lebih dulu.
- Satu komponen per putaran: tulis, `motion:check --scene`, perbaiki.

Selesai bila: `npm run quality` bersih dan satu episode uji lolos review visual independen ≥ 14/18.

### Fase 4: Panduan naskah (opsional, paralel)

- Pemilik mengumpulkan 3–5 naskah SeFakta berperforma baik.
- Jalankan prompt "style guide" dari katalog pada naskah itu, lalu simpan hasilnya sebagai lampiran `docs/brand/PANDUAN-AI-AGENT-PRODUKSI.md`.
- Gabungkan dengan insight analytics (topik keseharian dan hook personal menang).
- Fakta tetap lewat `npm run validate:facts`.

## Di luar lingkup

- Memakai prompt katalog sebagai generator video.
- Mengubah `AGENTS.md`, template `src/shared/episode/`, watermark, CTA, atau logo.
- Menambah dependensi baru (Three.js atau D3) kecuali satu gaya benar-benar membutuhkannya.
- Render MP4 (hanya atas permintaan eksplisit).

## Urutan

Fase 1 → 2 → 3, Fase 4 paralel. Fase 1 dan 2 muat dalam satu sesi. Fase 3 butuh beberapa putaran.

## Keputusan yang diperlukan dari pemilik

1. Gaya apa yang jadi prioritas Fase 3 (Paper Cut-Out/Collage atau lainnya)?
2. Tiga gaya mana yang dibaca penuh untuk Fase 1?
3. Apakah Fase 4 dijalankan, dan siapa yang menyiapkan naskah contoh?
