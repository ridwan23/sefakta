# Usulan revisi naskah VO v3 — Efek Matrix

> **Status: tidak dikerjakan.** Video ini diarsipkan apa adanya (keputusan pemilik 2026-11-07). Disimpan sebagai catatan bila suatu saat direvisi.

Tiga kalimat VO v3 bertentangan dengan makalah sumbernya (Stetson, Fiesta & Eagleman 2007, PLoS ONE,
[PMC2110887](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2110887/), dibaca 2026-11-07), dan satu kalimat terlalu pasti.
Yang perlu direkam ulang hanya **S3, S10, S11**. Target durasi = panjang slot lama, supaya timing visual lain tidak bergeser.

| # | VO v3 (sekarang) | Usulan | Durasi slot | Dasar di makalah |
|---|---|---|---|---|
| S3 | Dalam uji terjun bebas sembilan puluh kaki, dua puluh tiga relawan dipasangi kronometer digital. | Dalam uji terjun bebas **tiga puluh satu meter**, para relawan dipasangi kronometer digital. | ±6,4 dtk | "participants experienced free fall for 31 m before landing safely in a net." Jumlah 23 tidak ada (makalah: 13 + 7 peserta), jadi angkanya dihapus. |
| S10 | Saat bahaya, amigdala menekan tombol rekam darurat, mencatat delapan puluh persen lebih banyak detail. | Saat ketakutan, peneliti **menduga** amigdala membuat otak merekam ingatan yang lebih kaya detail. | ±6,0 dtk | "we speculate that the involvement of the amygdala in emotional memory may lead to dilated duration judgments retrospectively". Angka 80% tidak ada di makalah. |
| S11 | Saat memutar ulang ingatan itu, file masif menipu kesadaranmu: kejadian itu terasa lima kali lebih lama. | Saat diingat lagi, ingatan sepadat itu menipu kesadaranmu: kejadiannya terasa **tiga puluh enam persen** lebih lama. | ±7,5 dtk | "participants' duration estimates increased by an average of 36% when they recalled their own fall" |

## Yang ikut berubah setelah VO baru masuk
- **Visual 2D:** papan "90 FT" → "31 M"; "+80% DATA" → mis. "MEMORI ++" atau dihapus; "5X LONGER" → "+36%".
- **Teks layar:** `src/topics/matrix-effect/2d/timeline.ts` (kalimat dan anchor kata kunci dari laporan timing VO baru).
- **Brief:** `briefs/matrix-effect.json`: ganti `voiceoverText` S3/S10/S11, rujuk `f-36-persen` di S11, lepas `f-tinggi`/`f-relawan`/`f-5x`/`f-80-persen`, tambah fakta tinggi 31 m.
- **Batas yang tetap ada:** semua fakta bersumber dari satu studi. Untuk status `terverifikasi` (dan `npm run validate:facts:online` lolos) dibutuhkan satu sumber independen lagi, misalnya ulasan ilmiah lain tentang persepsi waktu saat takut.
