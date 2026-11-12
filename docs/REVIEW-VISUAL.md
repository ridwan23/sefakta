# Review visual independen

Agent yang membuat visual cenderung puas dengan karyanya sendiri. Karena itu setiap episode **wajib** direview oleh reviewer terpisah dengan konteks segar sebelum diserahkan, lalu direvisi **minimal satu putaran**.

## Cara menjalankan

1. Siapkan bahan (tanpa kode scene, supaya reviewer menilai hasil, bukan niat):
   ```bash
   npm run motion:check -- <id>     # filmstrip out/<id>/motion/<scene>.png + report.json
   npm run layout:check -- <id>     # out/<id>/layout/report.json
   ```
   ditambah lembar kontak still §9.2 dan storyboard (tabel §7.1) dari brief/rencana.
2. Jalankan reviewer:
   - **Claude Code:** subagent `visual-reviewer` (`.claude/agents/visual-reviewer.md`) dengan argumen id episode.
   - **Agent lain:** buka sesi/agent baru tanpa riwayat produksi, beri dokumen ini + path bahan di atas.
3. Perbaiki semua temuan "wajib" dalam satu putaran, jalankan ulang `motion:check`/`layout:check`, lalu minta review kedua bila skor masih < 14/18.
4. Tulis ringkasan review di laporan serah terima (baris "Review").

## Rubrik (0–2 per aspek, total 18)

| Aspek | 2 = baik | 0 = gagal |
|---|---|---|
| **Fokus** | satu fokus baca per beat, hierarki jelas | beberapa hal bersaing, mata bingung |
| **Komposisi** | memakai ruang aman, seimbang, tidak sempit/kosong | elemen menumpuk di satu sisi, ruang mati besar |
| **Kedalaman** | Backdrop berdimensi, objek bershading, bayangan kontak | latar rata, objek warna rata |
| **Cahaya** | satu arah cahaya konsisten di semua objek | sorotan/bayangan berlawanan arah |
| **Gerak masuk** | entrance terlihat di baris atas filmstrip, berkurva | muncul utuh di frame 0 / linear |
| **Hidup saat hold** | tidak ada segmen beku ≥ 1,5 dtk; idle/partikel/kamera | beku lama |
| **Fisika** | benda jatuh/memantul/bergoyang meyakinkan, berat terasa | geser lurus, mendarat tanpa akibat |
| **Ritme** | perubahan tiap 2–4 dtk mengikuti narasi | lama tidak ada beat / terlalu ramai |
| **Konsistensi gaya** | palet token, satu set ikon, satu pasangan font | warna/ikon/font campur aduk |

Target ≥ 14/18 tanpa nilai 0. Aspek **Fokus**, **Gerak masuk**, dan **Hidup saat hold** wajib 2 sebelum publikasi.

## Format temuan

```
Skor: n/18 — Fokus 2, Komposisi 1 (…), …
Wajib diperbaiki:
1. [scene mekanisme, dtk 0,3–3,4] timbangan beku setelah masuk → tambah Idle/settle ayun saat beban jatuh
2. …
Saran (opsional):
- …
```

Setiap temuan menyebut scene, waktu/frame, apa yang terlihat, dan perbaikan konkret dengan komponen kit (`Reveal`, `Idle`, `Shaded`, `ContactShadow`, `fall`, pola scene, dll.).
