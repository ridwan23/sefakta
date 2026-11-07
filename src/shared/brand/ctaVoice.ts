// Teks dan waktu VO CTA (tanpa JSX: dipakai juga oleh skrip Node `scripts/vo-fish.ts`).
// Klip `public/brand/cta-opsi1.mp4` dipakai sebagai gambar; audionya diganti VO yang dibuat dengan suara dan
// kecepatan yang sama seperti narasi episode (`npm run vo` → public/<episode>/vo/cta.mp3).

/** Kalimat CTA default, selaras dengan teks di layar klip ("Ikuti · Fakta baru tiap hari"). Bisa diganti per episode lewat `cta.voiceoverText` di brief. */
export const CTA_VO_TEXT = '[excited] Ikuti Sefakta! Fakta baru, tiap hari!'; // [excited] = tag ekspresi Fish S2, tidak diucapkan
/** id entri VO CTA di manifest episode. */
export const CTA_VO_ID = 'cta';
/** VO mulai sekian frame setelah iris CTA dimulai (audio asli klip mulai ±0,3 dtk). */
export const CTA_VO_DELAY_FRAMES = 8;
/** Batas panjang VO agar selesai sebelum klip 4 dtk berakhir. */
export const CTA_VO_MAX_SECONDS = 3.5;
