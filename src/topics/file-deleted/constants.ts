export const FPS = 24;
export const TOTAL_SECONDS = 47;
export const DURATION_IN_FRAMES = FPS * TOTAL_SECONDS; // 1128 frames
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Clean, high-contrast, editorial palette (Modern Infographic / Motion Design)
// Absolutely NO hacker / vibe-code tropes (no neon greens, no matrix grids, no cyber glows)
export const PALETTE = {
  bg: '#0e1422',
  bgCard: '#182032',
  bgElevated: '#222d44',
  paper: '#ffffff',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#2e3a52',
  blue: '#3b82f6',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  rose: '#f43f5e',
  emerald: '#10b981',
  indigo: '#6366f1',
  violet: '#8b5cf6',
};

// 8 Chapters / Scenes with exact frame boundaries
export const SCENES = [
  {
    id: 1,
    title: 'KE MANA FILE PERGI?',
    from: 0,
    duration: 144, // 0.0s - 6.0s
    status: 'Tersimpan',
    statusColor: '#10b981',
    chapterNum: 1,
  },
  {
    id: 2,
    title: 'TEMPAT SAMPAH',
    from: 144,
    duration: 144, // 6.0s - 12.0s
    status: 'Di Tempat Sampah',
    statusColor: '#3b82f6',
    chapterNum: 2,
  },
  {
    id: 3,
    title: 'DAFTAR ISI DICORET',
    from: 288,
    duration: 144, // 12.0s - 18.0s
    status: 'Indeks Dihapus',
    statusColor: '#f43f5e',
    chapterNum: 3,
  },
  {
    id: 4,
    title: 'STATUS KOSONG',
    from: 432,
    duration: 144, // 18.0s - 24.0s
    status: 'Ditandai Bebas',
    statusColor: '#f59e0b',
    chapterNum: 4,
  },
  {
    id: 5,
    title: 'SOFTWARE PEMULIHAN',
    from: 576,
    duration: 144, // 24.0s - 30.0s
    status: 'Bisa Dilacak',
    statusColor: '#8b5cf6',
    chapterNum: 5,
  },
  {
    id: 6,
    title: 'TERTIMPA DATA BARU',
    from: 720,
    duration: 144, // 30.0s - 36.0s
    status: 'Hilang Permanen',
    statusColor: '#f43f5e',
    chapterNum: 6,
  },
  {
    id: 7,
    title: 'SISTEM SSD & TRIM',
    from: 864,
    duration: 144, // 36.0s - 42.0s
    status: 'Pembersihan SSD',
    statusColor: '#0ea5e9',
    chapterNum: 7,
  },
  {
    id: 8,
    title: 'TIPS KEAMANAN & LOOP',
    from: 1008,
    duration: 120, // 42.0s - 47.0s
    status: 'Tersimpan',
    statusColor: '#10b981',
    chapterNum: 8,
  },
];

// Indonesian narration transcript with word-by-word timing for highlighted captions
export interface CaptionWord {
  word: string;
  startSec: number;
  endSec: number;
}

export interface CaptionSegment {
  fromSec: number;
  toSec: number;
  text: string;
  words: CaptionWord[];
}

export const CAPTIONS: CaptionSegment[] = [
  {
    fromSec: 0.0,
    toSec: 2.8,
    text: 'Kamu hapus sebuah file.',
    words: [
      { word: 'Kamu', startSec: 0.0, endSec: 0.7 },
      { word: 'hapus', startSec: 0.7, endSec: 1.4 },
      { word: 'sebuah', startSec: 1.4, endSec: 2.1 },
      { word: 'file.', startSec: 2.1, endSec: 2.8 },
    ],
  },
  {
    fromSec: 2.9,
    toSec: 6.0,
    text: 'Tapi, sebenarnya ke mana perginya?',
    words: [
      { word: 'Tapi,', startSec: 2.9, endSec: 3.6 },
      { word: 'sebenarnya', startSec: 3.6, endSec: 4.4 },
      { word: 'ke', startSec: 4.4, endSec: 4.9 },
      { word: 'mana', startSec: 4.9, endSec: 5.4 },
      { word: 'perginya?', startSec: 5.4, endSec: 6.0 },
    ],
  },
  {
    fromSec: 6.0,
    toSec: 9.0,
    text: 'Hapus biasa hanya memindahkan file ke Recycle Bin.',
    words: [
      { word: 'Hapus', startSec: 6.0, endSec: 6.5 },
      { word: 'biasa', startSec: 6.5, endSec: 7.0 },
      { word: 'hanya', startSec: 7.0, endSec: 7.5 },
      { word: 'memindahkan', startSec: 7.5, endSec: 8.1 },
      { word: 'ke', startSec: 8.1, endSec: 8.4 },
      { word: 'Recycle', startSec: 8.4, endSec: 8.7 },
      { word: 'Bin.', startSec: 8.7, endSec: 9.0 },
    ],
  },
  {
    fromSec: 9.1,
    toSec: 12.0,
    text: 'Datanya masih utuh dan bisa dikembalikan.',
    words: [
      { word: 'Datanya', startSec: 9.1, endSec: 9.7 },
      { word: 'masih', startSec: 9.7, endSec: 10.3 },
      { word: 'utuh', startSec: 10.3, endSec: 10.9 },
      { word: 'dan', startSec: 10.9, endSec: 11.2 },
      { word: 'bisa', startSec: 11.2, endSec: 11.6 },
      { word: 'dikembalikan.', startSec: 11.6, endSec: 12.0 },
    ],
  },
  {
    fromSec: 12.0,
    toSec: 15.2,
    text: 'Saat Bin dikosongkan, sistem cuma mencoret alamat file.',
    words: [
      { word: 'Saat', startSec: 12.0, endSec: 12.4 },
      { word: 'Bin', startSec: 12.4, endSec: 12.8 },
      { word: 'dikosongkan,', startSec: 12.8, endSec: 13.5 },
      { word: 'sistem', startSec: 13.5, endSec: 14.0 },
      { word: 'cuma', startSec: 14.0, endSec: 14.4 },
      { word: 'mencoret', startSec: 14.4, endSec: 14.8 },
      { word: 'alamat', startSec: 14.8, endSec: 15.2 },
      { word: 'file.', startSec: 15.2, endSec: 15.6 },
    ],
  },
  {
    fromSec: 15.6,
    toSec: 18.0,
    text: 'Dari daftar indeks. Datanya sendiri tidak dihapus.',
    words: [
      { word: 'Dari', startSec: 15.6, endSec: 16.0 },
      { word: 'daftar', startSec: 16.0, endSec: 16.5 },
      { word: 'indeks.', startSec: 16.5, endSec: 17.0 },
      { word: 'Datanya', startSec: 17.0, endSec: 17.4 },
      { word: 'sendiri', startSec: 17.4, endSec: 17.7 },
      { word: 'tidak', startSec: 17.7, endSec: 18.0 },
      { word: 'dihapus.', startSec: 18.0, endSec: 18.4 },
    ],
  },
  {
    fromSec: 18.4,
    toSec: 21.2,
    text: 'Ruang itu ditandai kosong di dalam penyimpanan,',
    words: [
      { word: 'Ruang', startSec: 18.4, endSec: 18.9 },
      { word: 'itu', startSec: 18.9, endSec: 19.3 },
      { word: 'ditandai', startSec: 19.3, endSec: 19.8 },
      { word: 'kosong', startSec: 19.8, endSec: 20.3 },
      { word: 'di', startSec: 20.3, endSec: 20.6 },
      { word: 'dalam', startSec: 20.6, endSec: 20.9 },
      { word: 'penyimpanan,', startSec: 20.9, endSec: 21.3 },
    ],
  },
  {
    fromSec: 21.3,
    toSec: 24.0,
    text: 'tetapi isinya belum dibuang sama sekali.',
    words: [
      { word: 'tetapi', startSec: 21.3, endSec: 21.9 },
      { word: 'isinya', startSec: 21.9, endSec: 22.5 },
      { word: 'belum', startSec: 22.5, endSec: 23.0 },
      { word: 'dibuang', startSec: 23.0, endSec: 23.5 },
      { word: 'sama', startSec: 23.5, endSec: 23.8 },
      { word: 'sekali.', startSec: 23.8, endSec: 24.0 },
    ],
  },
  {
    fromSec: 24.0,
    toSec: 27.2,
    text: 'Software recovery kadang bisa membacanya lagi,',
    words: [
      { word: 'Software', startSec: 24.0, endSec: 24.6 },
      { word: 'recovery', startSec: 24.6, endSec: 25.2 },
      { word: 'kadang', startSec: 25.2, endSec: 25.8 },
      { word: 'bisa', startSec: 25.8, endSec: 26.2 },
      { word: 'membacanya', startSec: 26.2, endSec: 26.8 },
      { word: 'lagi,', startSec: 26.8, endSec: 27.2 },
    ],
  },
  {
    fromSec: 27.2,
    toSec: 30.0,
    text: 'selama blok memori itu belum tertimpa data baru.',
    words: [
      { word: 'selama', startSec: 27.2, endSec: 27.8 },
      { word: 'blok', startSec: 27.8, endSec: 28.3 },
      { word: 'memori', startSec: 28.3, endSec: 28.8 },
      { word: 'belum', startSec: 28.8, endSec: 29.2 },
      { word: 'tertimpa', startSec: 29.2, endSec: 29.6 },
      { word: 'data', startSec: 29.6, endSec: 29.8 },
      { word: 'baru.', startSec: 29.8, endSec: 30.0 },
    ],
  },
  {
    fromSec: 30.0,
    toSec: 33.2,
    text: 'Begitu data baru menimpanya secara langsung,',
    words: [
      { word: 'Begitu', startSec: 30.0, endSec: 30.6 },
      { word: 'data', startSec: 30.6, endSec: 31.2 },
      { word: 'baru', startSec: 31.2, endSec: 31.8 },
      { word: 'menimpanya', startSec: 31.8, endSec: 32.5 },
      { word: 'secara', startSec: 32.5, endSec: 32.9 },
      { word: 'langsung,', startSec: 32.9, endSec: 33.3 },
    ],
  },
  {
    fromSec: 33.3,
    toSec: 36.0,
    text: 'barulah data lama benar-benar hilang permanen.',
    words: [
      { word: 'barulah', startSec: 33.3, endSec: 33.9 },
      { word: 'data', startSec: 33.9, endSec: 34.4 },
      { word: 'lama', startSec: 34.4, endSec: 34.9 },
      { word: 'benar-benar', startSec: 34.9, endSec: 35.4 },
      { word: 'hilang', startSec: 35.4, endSec: 35.7 },
      { word: 'permanen.', startSec: 35.7, endSec: 36.0 },
    ],
  },
  {
    fromSec: 36.0,
    toSec: 39.2,
    text: 'Di SSD, perintah TRIM menandai blok agar dibersihkan,',
    words: [
      { word: 'Di', startSec: 36.0, endSec: 36.4 },
      { word: 'SSD,', startSec: 36.4, endSec: 37.0 },
      { word: 'perintah', startSec: 37.0, endSec: 37.6 },
      { word: 'TRIM', startSec: 37.6, endSec: 38.2 },
      { word: 'menandai', startSec: 38.2, endSec: 38.7 },
      { word: 'blok', startSec: 38.7, endSec: 39.0 },
      { word: 'dibersihkan,', startSec: 39.0, endSec: 39.4 },
    ],
  },
  {
    fromSec: 39.4,
    toSec: 42.0,
    text: 'lalu penghapusan fisiknya menyusul kemudian.',
    words: [
      { word: 'lalu', startSec: 39.4, endSec: 39.9 },
      { word: 'penghapusan', startSec: 39.9, endSec: 40.5 },
      { word: 'fisiknya', startSec: 40.5, endSec: 41.1 },
      { word: 'menyusul', startSec: 41.1, endSec: 41.6 },
      { word: 'kemudian.', startSec: 41.6, endSec: 42.0 },
    ],
  },
  {
    fromSec: 42.0,
    toSec: 44.8,
    text: 'Sebelum menjual laptop, menghapus saja belum cukup.',
    words: [
      { word: 'Sebelum', startSec: 42.0, endSec: 42.6 },
      { word: 'menjual', startSec: 42.6, endSec: 43.1 },
      { word: 'laptop,', startSec: 43.1, endSec: 43.6 },
      { word: 'menghapus', startSec: 43.6, endSec: 44.1 },
      { word: 'saja', startSec: 44.1, endSec: 44.4 },
      { word: 'belum', startSec: 44.4, endSec: 44.7 },
      { word: 'cukup.', startSec: 44.7, endSec: 45.0 },
    ],
  },
  {
    fromSec: 45.0,
    toSec: 47.0,
    text: 'Ikuti kami, satu fakta baru tiap hari.',
    words: [
      { word: 'Ikuti', startSec: 45.0, endSec: 45.4 },
      { word: 'kami,', startSec: 45.4, endSec: 45.8 },
      { word: 'satu', startSec: 45.8, endSec: 46.2 },
      { word: 'fakta', startSec: 46.2, endSec: 46.5 },
      { word: 'baru', startSec: 46.5, endSec: 46.8 },
      { word: 'tiap', startSec: 46.8, endSec: 46.9 },
      { word: 'hari.', startSec: 46.9, endSec: 47.0 },
    ],
  },
];
