# Rencana: memperkaya `src/shared/`

Status: Fase 1–4 selesai (2026-11-13): `src/shared/objects/`, `collage/`, `labels/`, komposisi KatalogObjekIlustrasi dan KatalogCollage. Keputusan memakai default: draf Sun/Person/HeadProfile dilanjutkan (leher dan hidung HeadProfile diperbaiki), kertas krem, shading sedang. Fase 5–8 menunggu permintaan.

## Tujuan

Agent lain bisa membuat video dengan kualitas visual setara hasil terbaik di repo ini. Syaratnya: objek siap pakai yang bentuknya organik, acuan yang mudah ditemukan, dan gerbang yang mengukur hal yang benar.

## Prinsip

- Setiap objek dibangun di atas `Shaded`, `useLight`, `ContactShadow`, dan `tokens`. Gerak idle menyala secara default, jadi objek tidak beku.
- Satu objek per putaran: tulis, render still, lihat, perbaiki. Objek berikutnya dikerjakan setelah yang sebelumnya lolos.
- Bentuk mengikuti `out/konsep-objek.html`: kurva, bukan kotak. Setiap objek punya satu detail yang hidup (napas, ayunan, uap, kilap).
- Episode dan gerbang tidak disentuh sebelum disetujui.
- Gaya dokumenter bergaya kolase tidak menyalin nama, logo, atau font pihak lain.

## Fase

| # | Isi | Lokasi | Keluaran |
|---|---|---|---|
| 1 | Fondasi objek: `ObjFrame` (posisi, ukuran, `idle`, `ground`, `at` pop-in), `index.ts`, JSDoc, `Catalog.tsx` | `shared/objects/` | Komposisi `KatalogObjekIlustrasi` di folder katalog |
| 2 | Objek set 1: Sun, Person (netral dan bersin), HeadProfile (otak dan jalur sinyal), Car, Tunnel, Glasses, Bowl (nasi dan uap), Sachet | `shared/objects/` | 8 objek yang sudah dicek lewat still |
| 3 | Objek set 2: Cup, Spoon, Phone, Flame, Snowflake, Fridge, Leaf | `shared/objects/` | Katalog bertambah |
| 4 | Kolase dan label: Stamp, Tag, Label dengan garis penunjuk, Cutout (tepi sobek, halftone), Highlighter, MarkerCircle, Underline, Tape, PaperClip | `shared/collage/`, `shared/labels/` | Komposisi `KatalogCollage` |
| 5 | Sains dan grafik: diagram dan anotasi grafik | `shared/science/`, `shared/charts/` | Contoh pakai di katalog |
| 6 | Discoverability: `src/shared/INDEX.md`, pointer di `AGENTS.md` dan `WORKFLOW`, contact-sheet PNG per kit | `docs/`, `src/shared/` | Agent menemukan objek tanpa membaca kode |
| 7 | Gerbang: peringatan kit tidak diimpor atau komponen diduplikasi, metrik gerak objek di `motion:check`, `review.md` wajib | `scripts/` | `check:episodes` dan `motion:check` ikut mengukur pemakaian kit |
| 8 | Episode acuan: revisi `bersin-matahari` dengan kit baru | `src/topics/` | Contoh nyata bagi agent lain |

Cakupan yang diminta sekarang: fase 1–4. Fase 5–8 hanya bila diminta.

## Spesifikasi API objek

```tsx
type ObjProps = {
  x: number; y: number;       // pusat di layar (px)
  size?: number;              // lebar di layar; gambar lokal 200 satuan
  rotate?: number;
  idle?: boolean | number;    // true = standar, angka = pengali kecepatan, false = diam
  ground?: number;            // y permukaan; bila diisi, ContactShadow digambar
  flip?: boolean;
  opacity?: number;
  color?: string;             // warna utama (override)
  at?: number;                // frame mulai muncul (pop-in berpegas)
};
```

Objek tertentu menambah prop sendiri, misalnya `pose` dan `poseAt` untuk Person, `rays` dan `face` untuk Sun, `brain` dan `signal` untuk HeadProfile.

## Daftar objek dan detail hidupnya

| Objek | Bentuk | Gerak idle |
|---|---|---|
| Sun | Cakram dengan sinar berbentuk kelopak | Berputar pelan, berdenyut |
| Person | Bahu, leher, kepala, rambut, telinga; pose netral dan bersin | Napas, kepala bergoyang; kepala menyentak saat bersin |
| HeadProfile | Siluet samping, otak tembus pandang | Kepala mengayun, sinyal bergaris mengalir |
| Car | Bodi melengkung, kaca bergradien, roda berpelek | Bodi memantul, roda berputar |
| Tunnel | Lengkung berlapis dengan cahaya di ujung | Cahaya berdenyut |
| Glasses | Lensa membulat tidak simetris, kilap melengkung | Ayunan halus, kilap bergeser |
| Bowl | Mangkuk keramik, nasi berbutir | Uap mengepul |
| Sachet | Segel bergerigi, lipatan, label | Melayang dan miring pelan |

## Verifikasi tiap fase

- `tsc` dan `eslint` bersih.
- Still tiap objek dilihat di beberapa frame untuk membuktikan gerak idle.
- `npm run quality` lulus sebelum diserahkan.
- Tidak ada commit dan tidak ada render MP4 kecuali diminta.

## Keputusan yang dibutuhkan

1. Draf Sun, Person, dan HeadProfile dipakai sebagai titik awal (HeadProfile perlu perbaikan leher dan hidung), atau semuanya dibuat dari nol?
2. Kertas kolase: krem (default) atau putih?
3. Gaya Person dan Sun: ilustrasi dengan shading sedang (default), lebih datar, atau lebih realistis?

## Risiko

- Bentuk SVG buatan tangan bisa terlihat kaku. Mitigasi: cek still tiap objek sebelum lanjut dan bandingkan dengan sketsa konsep.
- Agent lain mungkin tetap membuat objek sendiri. Mitigasi: fase 6 dan 7 (INDEX dan peringatan kit tidak diimpor).
