// VO CTA bersama untuk semua episode (tanpa JSX: dipakai juga oleh skrip Node `scripts/check-episodes.ts`).
// Klip `public/brand/cta-opsi1.mp4` dipakai sebagai gambar; audionya diganti satu rekaman VO resmi (single source of
// truth) yang sama di semua episode. Sumber: VO CTA episode tambora-1816 (Fish Audio s2.1-pro-free, 1,1×, -14 LUFS).

/** Rekaman VO CTA resmi, relatif terhadap public/. */
export const CTA_VO_FILE = 'brand/cta-vo.mp3';
/** Kalimat yang diucapkan di CTA_VO_FILE (dokumentasi; tag [excited] tidak diucapkan). */
export const CTA_VO_TEXT = '[excited] Ikuti Sefakta! Fakta baru, tiap hari!';
/** VO mulai sekian frame setelah iris CTA dimulai (audio asli klip mulai ±0,3 dtk). */
export const CTA_VO_DELAY_FRAMES = 8;
/** Batas panjang VO agar selesai sebelum klip 4 dtk berakhir. */
export const CTA_VO_MAX_SECONDS = 3.5;
