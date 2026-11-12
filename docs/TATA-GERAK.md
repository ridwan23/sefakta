# Tata gerak SeFakta

Aturan gerak untuk visual episode, dengan angka yang bisa diikuti. Dipakai saat menyusun storyboard (`docs/WORKFLOW-AI-AGENT.md` §7.1) dan menulis `scenes.tsx` (§8). Diperiksa otomatis oleh `npm run motion:check -- <id>` (§9.4).

Kit gerak ada di `src/shared/anim/` (impor dari `../../shared/anim`). Peragaannya bisa dilihat di Studio: **katalog → KatalogGerak**. Tonton katalog itu sekali sebelum menulis scene pertama.

## 1. Prinsip

1. **Tidak ada frame beku.** Selama hold, objek utama tetap hidup: `Idle` (2–6 px), kamera drift (zoom 2–4% per scene lewat `CameraRig`), atau `Particles` di latar. Beku ≥ 1,5 dtk = peringatan, ≥ 3 dtk = error.
2. **Setiap beat narasi = satu gerak primer + satu gerak sekunder.** Primer membawa informasi (objek masuk, angka berhitung, garis tergambar). Sekunder memberi rasa (Pulse, Burst, Shake, Highlight, kamera `beatKick`). Gerak primer dipicu `cueFrames` pada kata kunci.
3. **Opacity lebih cepat dari gerak.** Elemen terlihat penuh sebelum geraknya selesai, supaya mata tidak mengejar bayangan. `Reveal` sudah melakukannya.
4. **Elemen lama keluar sebelum elemen baru menempati tempatnya.** Pakai `exitAt` atau `Swap`, bukan menghilang tiba-tiba dan bukan bertumpuk.
5. **Satu fokus gerak pada satu waktu.** Bila dua hal bergerak bersamaan, satu primer dan satu sekunder (lebih kecil/lambat). Banyak item muncul berurutan dengan `Stagger`, bukan serentak.
6. **Kontinuitas antarscene.** Pose kamera akhir scene N = pose awal scene N+1, atau objek utama dibawa melintasi batas scene. Potong keras hanya bila disengaja (kejutan).

## 2. Angka standar (30 fps)

| Gerak | Durasi | Kurva | Komponen |
|---|---|---|---|
| entrance objek | 8–14 frame (`DUR.base` = 12) | `EASE.out` / pegas | `Reveal kind="rise\|pop\|drop"` |
| teks judul/label | 3 frame antarkata | snap | `SplitText kind="mask"` |
| stempel/kejutan | 6–8 frame turun + getar 10 frame | in lalu impact | `Reveal kind="stamp"` + `Burst` |
| daftar/ikon berurutan | jeda 3–5 frame per item | out | `Stagger gap={4}` |
| pindah posisi A→B | 18–30 frame | `EASE.inOut` | `track()` |
| gerak beraksen (melesat) | 20–36 frame | `EASE.anticipate` | `track()` |
| garis/panah/rute | 15–30 frame | inOut | `DrawPath` |
| angka | 20–30 frame, lalu sentakan | snap | `CountUp` |
| exit | 6–10 frame (`DUR.exit` = 8) | `EASE.in` | `exitAt` + `exit=…` |
| idle saat hold | terus-menerus, 2–6 px, rot ≤ 1,5° | noise halus | `Idle` |
| guncangan benturan | 10–14 frame, amp 10–20 px | meluruh | `Shake`, `impact()` |

Hindari: `EASE.linear` untuk objek (kecuali putaran konstan/ticker), durasi entrance > 20 frame (terasa lambat), overshoot > 15%, lebih dari satu `Shake` per scene.

## 3. Ritme per scene

```
0–0,5 dtk     entrance latar + objek utama (wajib ada gerak di 15 frame pertama)
tiap 2–4 dtk  beat baru pada kata kunci: gerak primer + sekunder
di antara     hold hidup: Idle / drift kamera / partikel
akhir scene   elemen yang tidak dibawa ke scene berikutnya keluar (exitAt), atau kamera menyiapkan pose scene berikutnya
```

## 4. Contoh pola

```tsx
import { Reveal, SplitText, Stagger, Idle, DrawPath, CountUp, Pulse, Burst, Highlight, Swap, Particles, EASE, track } from '../../shared/anim';

const q = cueFrames(scene, fps, { gula: ['gula', 1.2], sedikit: ['sedikit', 3.4], isi: ['pengisi', 6.0] });

<Particles count={30} color={palet.debu} rise={16} />                       {/* latar hidup */}
<Reveal at={q.gula} kind="pop" exitAt={q.isi - 6} exit="shrink" style={pos(540, 700)}>
  <Idle amp={3}><Timbangan /></Idle>                                       {/* tidak beku selama hold */}
</Reveal>
<Pulse at={q.sedikit} x={700} y={760} />                                   {/* sekunder: tunjuk lokasi */}
<SplitText text="99% pengisi" at={q.isi} accentWords={['99%']} accentStyle={{ color: aksen }} />
```

Posisi absolut dengan centering: `style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)' }}`. `Reveal` menggabungkan transform ini dengan animasinya.

## 5. Bila kit belum cukup

Tulis gerak khusus di `src/topics/<id>/` dengan `prog()`, `track()`, `springAt()`, dan `noise1()` dari kit, jangan dengan `interpolate` linear mentah. Bila pola itu berguna lintas episode, tambahkan ke `src/shared/anim/` beserta peragaannya di `Catalog.tsx`.
