# Ponselmu Menguping Obrolanmu?

**Rekomendasi produksi YouTube Shorts · Seri Teknologi · Target 48 detik**

Pertahankan judul, contoh sepatu, dan gaya infografis ponsel di atas latar krem. Tampilkan iklan dalam dua detik pertama dan berikan jawaban sementara pada detik ke-4. Setelah penonton melihat bagaimana data bisa membantu sistem iklan menebak minat, gunakan satu studi untuk membatasi kesimpulan dan jadikan ilusi frekuensi sebagai kejutan kedua.

## Diagnosis draf 59,7 detik

Pembagian waktu berasal dari lima adegan di `iklan-menguping.json`. Angka ini adalah durasi storyboard.

| Waktu | Adegan | Diagnosis dan keputusan |
| --- | --- | --- |
| 0–9,3 dtk | `hook` | Obrolan dan iklan sepatu sudah cukup untuk memancing pertanyaan. Padatkan jadi 4 detik. Ganti gelombang yang tersedot ke mikrofon dengan tanda tanya agar pembuka terbaca sebagai dugaan. |
| 9,3–22,7 dtk | `konteks` | Dua pengujian berturut-turut mengisi 13,4 detik sebelum penonton mendapat mekanisme. Pindahkan studi Android ke sesudah mekanisme dan keluarkan uji makanan hewan dari narasi utama. |
| 22,7–35,7 dtk | `mekanisme` | Jawaban inti baru mulai pada 22,7 detik. Beri petunjuk pada detik ke-4 dan gambarkan contoh sinyal data yang punya dukungan sumber. |
| 35,7–48,7 dtk | `dampak` | Feed yang menyorot satu iklan sepatu sudah menjelaskan perhatian selektif. Tahan komposisi dan ringkas penjelasannya. |
| 48,7–59,7 dtk | `jawaban` | Kembali ke pose ponsel awal untuk loop. Taruh ajakan praktis di kartu layar dan rincian pengaturan di deskripsi agar payoff tetap punya ruang. |

Episode sebelumnya, *Kenapa Suaramu Terdengar Asing di Rekaman?*, punya rata-rata durasi tonton 30 detik dari durasi storyboard 58,3 detik, sekitar 51,5%. Ini memberi alasan untuk menguji jawaban yang muncul lebih awal. Gunakan grafik retensi untuk mengetahui letak penurunan penonton.

## Narasi dan storyboard 48 detik

Rentang frame memakai 30 fps dan batas akhir eksklusif. Waktu berikut adalah target sebelum pengukuran rekaman suara.

| Beat · Waktu · Frame | Narasi siap rekam | Visual dan `cameraRig` |
| --- | --- | --- |
| **1 · 0–4 dtk · [0, 120)** | “Baru ngobrol soal sepatu, eh, iklannya muncul. Ponselmu menguping?” | Mulai dengan gelembung sepatu dan ponsel. Kartu iklan masuk sebelum detik ke-2, dengan satu bunyi notifikasi. Tanda tanya muncul di dekat ikon mikrofon. Kamera terkunci. |
| **2 · 4–10 dtk · [120, 300)** | “Belum tentu. Sistem iklan bisa menebak minatmu tanpa mendengar obrolan.” | Tahan kartu sepatu sejenak, lalu munculkan label **Dari aktivitasmu**. Gelembung obrolan memudar. Kamera terkunci selama perubahan objek. |
| **3 · 10–21 dtk · [300, 630)** | “Misalnya, pencarianmu, video yang kamu tonton, atau area tempat kamu memakai layanan bisa jadi petunjuk. Dari situ, sistem bisa memperkirakan minatmu.” | Susun ikon pencarian, video, dan pin menuju panel **Perkiraan minat**, lalu kartu sepatu. Jika panel perlu ruang, pakai satu pull-back singkat saat semua objek diam. Setelah kamera berhenti, nyalakan garis satu per satu. |
| **4 · 21–32 dtk · [630, 960)** | “Studi tahun 2018 menganalisis lebih dari 17 ribu aplikasi Android. Dalam pengujian pada sebagian aplikasi, peneliti tidak mendeteksi kebocoran audio.” | Cut ke grid statis. Tampilkan **17.260 dianalisis**, lalu **9.100 diuji secara dinamis**. Kartu hasil berbunyi **Kebocoran audio tak terdeteksi dalam uji**. Kamera terkunci. |
| **5 · 32–41 dtk · [960, 1230)** | “Ada juga ilusi frekuensi. Setelah ngobrol soal sepatu, iklan sepatu lebih gampang kamu sadari. Iklan lain lewat begitu saja.” | Geser feed sebentar, berhenti, lalu sorot satu kartu sepatu. Kartu lain meredup. Kamera terkunci. |
| **6 · 41–48 dtk · [1230, 1440)** | “Jadi, iklan yang pas dengan obrolanmu belum cukup jadi bukti ponselmu menguping.” | Tahan kartu **Cek pengaturan privasi iklan** saat jawaban dibacakan. Cut kembali ke posisi ponsel dan gelembung pembuka menjelang frame terakhir. Kamera terkunci. |

## Aturan aksi objek dan kamera

- **Aksi objek** membawa informasi yang berubah di dalam adegan. Pakai animasi lokal untuk kartu yang masuk, feed yang bergerak, garis data yang menyala, dan sorot kuning. Kunci kamera selama aksi utama.
- **`cameraRig`** mengubah sudut pandang terhadap komposisi. Gunakan gerak global hanya bila membantu membaca hubungan spasial. Kandidatnya satu pull-back pada awal beat 3. Kunci objek selama pull-back dan mulai aliran data setelah kamera berhenti. Jika komposisi sudah terbaca pada ukuran ponsel, pakai framing statis.
- Pisahkan lapisan dunia yang menerima transformasi kamera dari lapisan subtitle dan judul yang menempel pada layar. Skala kartu iklan secara lokal saat perlu disorot.
- Pertahankan krem `#F6F2EA`, layar putih `#FFFFFF`, teks gelap `#0F1B33`, garis data biru utuh `#1F6FEB`, dan obrolan merah muda putus-putus `#E5396B`. Gunakan kuning `#FFB000` untuk satu fokus per beat. Garis utuh dan putus-putus harus tetap bisa dibedakan tanpa warna.
- JSON asal menulis arahan kamera di kolom `visual`. Petakan arahan di atas ke format `cameraRig` yang didukung proyek Remotion.

## Batasan fakta untuk narasi, grafis, dan deskripsi

- **`f-tidak-menguping` — Batasi hasil pada kondisi pengujian.** *Panoptispy* menganalisis 17.260 aplikasi Android secara statis. Sebanyak 9.100 aplikasi dipilih untuk uji dinamis dengan interaksi otomatis dan pemeriksaan lalu lintas jaringan. Uji itu tidak mendeteksi kebocoran audio. Metode dapat melewatkan perilaku yang tidak terpicu atau audio yang sudah berubah format. Gunakan “tidak terdeteksi dalam uji” pada grafis. Hindari grid dengan seluruh mikrofon dicoret atau stempel “aman”. [Makalah Panoptispy, khususnya §5 dan §8](https://secpriv.tuwien.ac.at/fulltext/publik_278928.pdf), [penjelasan tim peneliti di Northeastern](https://news.northeastern.edu/2018/07/06/is-your-smartphone-spying-on-you/)
- **Uji makanan hewan — Keluarkan dari versi 48 detik.** Draf mencatat uji Wandera tahun 2019. Bila dicantumkan di deskripsi, perlakukan sebagai uji eksploratif dengan cakupan terbatas dan atribusikan hasilnya ke pelaporan BBC. Pisahkan sumber dan kesimpulannya dari studi Android. [Pelaporan BBC tentang uji Wandera](https://www.bbc.com/news/technology-49585682)
- **`f-data-profil` — Gunakan contoh yang spesifik.** Google menjelaskan bahwa aktivitas situs dan aplikasi, histori YouTube, dan area tempat layanan digunakan dapat membantu personalisasi sesuai pengaturan. Diagram sepatu adalah ilustrasi cara sinyal dapat dipakai. Hilangkan jalur “teman mencari sepatu → kamu mendapat iklannya” dari versi utama karena penyebab tayangan spesifik tidak diketahui. [My Ad Center](https://support.google.com/My-Ad-Center-Help/answer/12156161)
- **`f-ilusi-frekuensi` — Gambarkan perhatian.** Sorot iklan yang sudah ada di feed. Contoh sepatu menggambarkan bagaimana suatu topik bisa lebih mudah disadari setelah menarik perhatian. Naskah tidak mengukur seberapa sering iklan itu benar-benar muncul. [Penjelasan Arnold Zwicky tentang ilusi frekuensi](https://languagelog.ldc.upenn.edu/myl/languagelog/archives/002407.html)
- **`f-matikan-pelacakan` — Pisahkan opsi tiap platform.** Di iPhone, pengguna dapat menolak permintaan pelacakan lintas aplikasi dan situs perusahaan lain. Pada perangkat Android dengan layanan Google Play yang mendukungnya, pengguna dapat menghapus ID iklan. Untuk iklan Google, pengguna juga dapat mengatur personalisasi lewat My Ad Center. Pengaruhnya terbatas pada pengenal, izin, atau layanan yang diatur. Iklan masih dapat muncul. [Apple Support](https://support.apple.com/en-us/102420), [Google Play tentang ID iklan](https://support.google.com/googleplay/android-developer/answer/6048248), [My Ad Center](https://support.google.com/My-Ad-Center-Help/answer/12155656)

## Evaluasi setelah rilis

Bandingkan data di YouTube Studio pada umur unggahan yang sama, misalnya 48 jam dan 7 hari. Catat volume `Engaged views` dan campuran sumber trafik di kedua episode. Perbedaan topik dan audiens membuat perbandingan ini bersifat indikatif. [Definisi metrik YouTube Studio](https://support.google.com/youtube/answer/12220281)

| Metrik | Sasaran internal dan cara membaca |
| --- | --- |
| **Stayed to watch** | Lebih tinggi dari episode sebelumnya pada jendela pembanding. Jika turun, periksa keterbacaan frame pertama dan kapan iklan sepatu terlihat. |
| **Average view duration (AVD)** | Target 35–40 detik, naik dari acuan 30 detik. Untuk Shorts, YouTube menghitungnya dari penayangan yang bertahan melewati detik-detik awal dan waktu tonton terkait. |
| **Average percentage viewed (APV)** | Kisaran yang sepadan dengan AVD target pada versi 48 detik adalah sekitar 73–83%. Baca keduanya bersama karena memperpendek video bisa menaikkan APV meski AVD tetap. |
| **Grafik retensi** | Cek penurunan di sekitar 0–4 dtk (hook), 15–30 dtk (mekanisme dan studi), serta 41 dtk (awal payoff). Catat persentase pada awal payoff dan menjelang akhir. Jika ada penurunan tajam saat studi, periksa panjang label dan tempo narasi. |

## Checklist produksi Remotion

- [ ] Buat versi revisi dari JSON sumber. Pertahankan identitas proyek dan `captionMode: "subtitle"`. Isi `voiceoverText`, `durationSeconds`, `headline`, `visual`, dan `factIds` untuk setiap beat sesuai materi yang tampil atau dibacakan. Cocokkan semua `factIds` dengan `facts` dan perbarui klaim studi serta angka di sana.
- [ ] Rekam atau buat TTS, ukur durasi suara, lalu geser batas beat mengikuti jeda dan penekanan. Target akhir 45–50 detik. Jika VO kepanjangan, ringkas kalimat sebelum menaikkan laju baca. Pertahankan frasa “dalam pengujian pada sebagian aplikasi” atau padanan yang sama jelasnya.
- [ ] Siapkan komposisi vertikal 1080 × 1920, 30 fps, target 1.440 frame. Setelah VO terkunci, bulatkan batas waktu kumulatif ke frame, lalu hitung panjang tiap `Sequence` dari selisih batas. Cocokkan total dengan `durationInFrames` dan periksa sambungan antarscene.
- [ ] Gerakkan properti dari frame Remotion (`useCurrentFrame`, `interpolate` atau `spring`). Pisahkan transformasi kamera, animasi objek, dan subtitle. Cek bahwa pull-back berhenti sebelum garis data bergerak, jika pull-back dipakai.
- [ ] Sinkronkan subtitle dengan VO yang sudah final. Periksa maksimal dua baris pada satu waktu, kontras, dan jarak dari tombol serta area deskripsi Shorts. Dengarkan hasil dengan dan tanpa musik. Tempatkan notifikasi tepat saat kartu masuk dan jaga agar VO tetap jelas.
- [ ] Pratinjau di Remotion Studio dan di layar ponsel. Cek dua detik pertama, keterbacaan angka studi, perpindahan ke beat ilusi frekuensi, dan sambungan frame terakhir ke frame pertama. Tonton sekali tanpa suara untuk memeriksa apakah visual dan subtitle menyampaikan batas klaim yang sama.
- [ ] Ekspor MP4 vertikal, lalu putar file hasil ekspor untuk mengecek durasi, sinkronisasi audio, keterbacaan teks, dan loop. Cantumkan makalah dan petunjuk pengaturan privasi di deskripsi. Siapkan pencatatan metrik pada 48 jam dan 7 hari.
