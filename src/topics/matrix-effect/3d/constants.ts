// "The Matrix Effect" — 3D toon miniature diorama, built from storyboard.html.
// 50 s · 1500 frames @ 30 fps · vertical 1080x1920. Shot 06 closes the story (a CTA is appended after it).

export const FPS = 30;
export const STORY_END = 1500; // narration + shots end here
export const CTA_FRAMES = 120; // 4 s SeFakta CTA scene after the story (iris transition, not an overlay)
export const DURATION = STORY_END + CTA_FRAMES;

export const WIDTH = 1080;
export const HEIGHT = 1920;

export type ShotId = 1 | 2 | 3 | 4 | 5 | 6;
export const SHOTS: { id: ShotId; from: number; to: number; label: string }[] = [
  { id: 1, from: 0, to: 216, label: 'THE ZERO-G SPILL' },
  { id: 2, from: 216, to: 465, label: '90-FOOT DROP TOWER' },
  { id: 3, from: 465, to: 690, label: 'CHRONOMETER & "0"' },
  { id: 4, from: 690, to: 1050, label: 'AMYGDALA RED ALERT' },
  { id: 5, from: 1050, to: 1320, label: 'PROYEKTOR 35MM' },
  { id: 6, from: 1320, to: 1500, label: 'PENUTUP' },
];

export const C = {
  ink: '#0f172a',
  hero: '#fde047',
  hoodie: '#2563eb',
  hoodieDark: '#1d4ed8',
  pants: '#334155',
  gold: '#fbbf24',
  red: '#ef4444',
  redDeep: '#dc2626',
  cyan: '#38bdf8',
  orange: '#f97316',
  steel: '#475569',
  steelDark: '#334155',
  asphalt: '#1e293b',
  sidewalk: '#64748b',
  ice: '#bae6fd',
  cream: '#f8fafc',
  coffee: '#451a03',
  wood: '#a16207',
  woodDark: '#713f12',
  brain: '#f9a8d4',
  brainDark: '#ec4899',
  bone: '#fef3c7',
  film: '#d97706',
};

// Narration (Indonesian, from storyboard). Each line is spread across [from, to] in global frames.
export const LINES: { from: number; to: number; text: string }[] = [
  { from: 4, to: 82, text: 'Kamu terpeleset di lantai licin, dan tiba-tiba semesta mendadak berhenti.' },
  { from: 88, to: 210, text: 'Cangkir kopimu melayang selama tiga detik penuh, berputar lambat seperti bulan yang sekarat.' },
  { from: 222, to: 330, text: 'Dalam uji terjun bebas setinggi 90 kaki, neurosaintis memasang kronometer digital ke 23 relawan' },
  { from: 334, to: 460, text: 'untuk menguji apakah mata manusia menangkap lebih banyak frame per detik saat panik.' },
  { from: 470, to: 580, text: 'Kalau waktu benar-benar melambat, para penerjun harusnya bisa membaca angka berkedip yang tak terlihat di kecepatan normal.' },
  { from: 584, to: 640, text: 'Mereka melihat nol angka ekstra.' },
  { from: 644, to: 686, text: 'Waktu sama sekali tidak melambat.' },
  { from: 696, to: 740, text: 'Tapi inilah bagian anehnya.' },
  { from: 744, to: 860, text: 'Otakmu seperti smartphone overload yang panik mencadangkan data.' },
  { from: 866, to: 1045, text: 'Saat bahaya datang, amigdala menekan tombol rekam darurat, mencatat 80% lebih banyak detail sensorik.' },
  { from: 1056, to: 1316, text: 'Saat kamu memutar ulang ingatan itu nanti, ukuran file yang masif menipu kesadaranmu hingga mengira kejadian itu berlangsung lima kali lebih lama dari kenyataan...' },
  { from: 1324, to: 1488, text: 'Jadi, waktu tidak pernah benar-benar melambat. Otakmu hanya merekam lebih banyak, sehingga momen itu terasa jauh lebih lama.' },
];
