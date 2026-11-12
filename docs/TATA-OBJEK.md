# Tata objek SeFakta

Aturan membuat objek terlihat nyata (semi-realistis) dan bergerak seperti benda sungguhan. Pelengkap `docs/TATA-GERAK.md`: tata gerak mengatur **kapan** elemen bergerak, dokumen ini mengatur **bagaimana objek tampak dan berperilaku**.

Peragaan di Studio: **katalog → KatalogObjek** (material, cahaya, jatuh, ayunan, timbangan, tuang, cairan, latar, ikon, 3D) dan **katalog → KatalogPola**. Tonton keduanya sebelum menggambar objek pertama.

## 1. Latar dan warna (`src/shared/look`)

- **Jangan memakai latar warna rata.** Lapisan paling bawah setiap scene: `<Backdrop style={style} pattern="…" />` (gradien bercahaya, pendaran aksen melayang, grain, vignette). Pola: `paper` (arsip/sejarah), `dots` / `grid` (sains/data), `lines` (teknologi/berita), `none`.
- **Warna dari token, bukan hex acak:** `const T = tokens(style)` → `bg`, `surface`, `ink`, `muted`, `line`, `accent`, `accentInk`, `accent2`, `danger`, `good`, `shadow`, `elevation(n)`. Kontras teks sudah dijamin (ink ≥ 7:1, muted dan accentInk ≥ 4,5:1).
- **Ikon dari registri:** `<Icon name="lucide:<nama>" />` (garis, bisa `draw={{ at }}`) atau `phosphor:<nama>` (isi). Belum ada → `npm run icon:add -- lucide:<nama>` (cari di lucide.dev/icons, phosphoricons.com). Satu set dan satu bobot per episode; ukuran ≥ 80 px.

## 2. Objek yang tampak nyata (`src/shared/render`)

1. **Satu sumber cahaya per episode.** Bungkus scene dengan `<LightProvider angle={135}>` (135° = kiri atas, default). Semua `Shaded`, `ContactShadow`, `Pour`, dan `Stage3D lightAngle` memakai sudut yang sama. Catat sudutnya di storyboard.
2. **Bentuk bermaterial, bukan isi rata:** `<Shaded d={…} color={…} material="…" />` di dalam `<svg>`. Shading tiga nada (terang–tengah–gelap) searah cahaya, bayangan dalam di sisi gelap, pantulan tepi di sisi terang.

   | Material | Untuk | Ciri |
   |---|---|---|
   | `matte` | buah, batu, tubuh, benda umum | gradien lembut, tanpa kilau |
   | `plastic` | kemasan, mainan, perangkat | kilau bulat terang |
   | `metal` | sendok, kaleng, mesin | pita terang-gelap kontras + garis kilau |
   | `glass` | gelas, botol, layar | transparan, tepi terang, garis kilau |
   | `paper` | kertas, kardus, label | gradien tipis + tekstur |
   | `fabric` | kain, tas | tekstur serat |

   Bentuk dasar: `rectPath`, `ellipsePath`, `pouchPath` (sachet), `cupPath` (gelas/toples), `blobPath` (organik: nasi, sel, awan). Isi tambahan (label, motif) diletakkan sebagai `children` agar ikut terpotong bentuk dan tertutup kilau.
3. **Objek menapak.** Setiap objek yang berdiri di permukaan diberi `<ContactShadow x y width elevation />` di titik tapaknya. Saat objek terangkat/jatuh, isi `elevation` = jarak ke permukaan (bayangan melebar, memudar, bergeser menjauhi cahaya). Elemen HTML yang melayang: `filter: dropShadow(useLight(), elevasi)`.
4. **Kedalaman.** Objek jauh: `depthStyle(z)` (z 0–1: lebih kecil, buram, pucat). Maksimal 3 lapis kedalaman (latar, tengah, depan); gabungkan dengan `CamLayer depth` bila memakai `CameraRig`.
5. **Detail kecil yang menjual realisme:** sambungan/segel (gerigi `pouchPath`), sudut membulat (r ≥ 12 px), garis tepi tipis (`outline`) hanya bila gaya episode ilustratif. Jangan menumpuk lebih dari satu kilau per objek.

## 3. Gerak fisik objek (`src/shared/physics`)

Gerak objek harus mengikuti fisika, bukan sekadar geser lurus:

| Situasi | Pakai | Catatan |
|---|---|---|
| benda jatuh / dilempar | `fall(f, { at, from, to, fps, bounce })` | pantulan makin rendah; `b.impacts` = frame benturan untuk SFX/`Shake`/`Burst` |
| benda memipih & memanjang | `squashStretch(b, fps, soft)` | `soft` 0,3 (keras) – 0,9 (jeli/adonan); volume dijaga |
| bagian yang tertinggal (antena, rambut, daun, kabel) | `follow(f, target, { stiffness, damping })` | stiffness kecil = berat/lambat |
| benda menggantung pada objek yang bergerak (label, lampu gantung) | `swing(f, pivotX, { length })` | berayun lalu teredam otomatis |
| didorong lalu berayun (lonceng, papan) | `pendulum(f, { at, amp })` | |
| timbangan/tuas menuju keseimbangan | `settle(f, { at, from, to, fps, mass })` | massa besar = lambat & sedikit overshoot |
| pindah posisi sesuai bobot benda | `track` + `massEase(mass)` | benda berat lambat mulai & lambat berhenti |
| rig bersendi (lengan, tuas, kaki) | `<Joint x y rotate>` bersarang di SVG | anak digambar relatif terhadap poros |
| butiran tertuang & menumpuk | `<Pour at from ground pileX />` | gula, garam, beras, pasir |
| cairan dalam wadah | `<Liquid box clip fill disturbAt tilt />` | gelombang, guncangan teredam, gelembung |
| uap, asap, kabut | `<Smoke x y />` | |

Aturan:
- **Setiap benturan punya akibat:** squash pada objek, `ContactShadow` mengecil-membesar, dan satu aksen (`Shake` kecil, `Burst`, atau SFX) di `b.impacts[0]`.
- **Benda berat ≠ benda ringan.** Tentukan massa (0–1) tiap objek utama di storyboard dan pakai kurva/pegas yang sesuai.
- **Tidak ada objek yang benar-benar diam** saat hold: bagian lunak bergoyang (`follow`/`swing`), cairan tetap beriak, uap tetap naik.
- Gerak fisik tetap dipicu cue narasi (`at = q.kata`).

## 4. 3D (opsional, 1–2 objek kunci per episode)

Untuk objek yang perlu realisme tinggi (buah, makanan, perabot, benda rumah tangga):

```bash
npm run model:add -- <id>          # model CC0 dari polyhaven.com/models, tekstur 1k (--res=2k bila objek memenuhi layar)
```

```tsx
import { Stage3D, Model } from '../../shared/three';
<Stage3D lightAngle={135}><Model id="food_apple_01" size={0.9} position={[0, tinggi, 0]} rotation={[0, f * 0.03, 0]} /></Stage3D>
```

- Samakan `lightAngle` dengan `LightProvider` agar bayangan 3D dan 2D searah. Latar Stage3D transparan dan lantainya hanya menampilkan bayangan, jadi model menapak di atas `Backdrop`.
- Gerakkan hanya dari `useCurrentFrame()`; fungsi fisika (`fall`, `settle`) bisa dipakai dalam satuan dunia 3D. `scale` sebagai `[x, y, z]` untuk squash/stretch.
- Maksimal satu `Stage3D` per scene. Bila still/render 3D hitam di Linux/CI, tambahkan `--gl=angle` (atau `--gl=swangle` tanpa GPU).
- Model tercatat di `public/models/models.json` (lisensi CC0, penulis, sumber).

## 5. Daftar periksa realisme (dipakai reviewer, `docs/REVIEW-VISUAL.md`)

- [ ] Semua objek diterangi dari arah yang sama; bayangan jatuh ke sisi yang sama.
- [ ] Objek di permukaan punya bayangan kontak; objek melayang punya bayangan yang terpisah.
- [ ] Tidak ada objek utama berisi warna rata tanpa shading.
- [ ] Benda jatuh mempercepat, memantul makin rendah, dan memipih saat mendarat.
- [ ] Bagian lunak/gantung tertinggal lalu menyusul (follow-through).
- [ ] Benda berat dan ringan bergerak berbeda.
- [ ] Latar berdimensi (Backdrop), bukan warna rata.
