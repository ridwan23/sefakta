# Kamus pelafalan (VO Aria)

Kata yang pernah salah ucap atau salah dengar, beserta ejaan atau penulisan yang benar di naskah VO.
Periksa naskah terhadap daftar ini **SEBELUM** generate VO (`docs/WORKFLOW-AI-AGENT.md` §5).
Kata baru yang berisiko (singkatan, istilah asing, nama orang/tempat) diuji dulu dengan satu klip
pendek + align; bila salah, tulis ulang katanya dan tambahkan ke daftar ini.

| Kata | Tulis sebagai / cara | Alasan |
|---|---|---|
| VOC | `V-O-C` | Aria membaca "VOC" sebagai "vosi" (episode voc-bangkrut, 2026-11-15). Caption di layar tetap "VOC". |
| Achoo | tulis ulang kalimat konteksnya | "Achoo" dibaca salah; solusinya bukan ejaan lain, melainkan kalimat sekitarnya ditulis ulang lalu VO dibuat ulang (episode bersin-matahari, 2026-11-13). |
| nyeri | `sakit` | Whisper mendengar "nyeri" sebagai "nyari" (episode brain-freeze, 2026-11-15); ganti kata, bukan ejaan. |

Aturan umum (lihat juga §6): bila align mendengar kata lain yang mirip (mis. `tua` untuk
`tewas`), buat ulang scene itu sekali; bila masih salah, ganti katanya — dan catat di sini.
