// Kontrak data episode yang dibaca template video.
export type EpisodeScene = {
  id: string;
  durationSeconds: number; // durasi minimum (hold); durasi akhir = max(ini, audio + jeda)
  voiceoverText: string;
  voiceoverSpeed?: number;
  caption?: string; // dipakai mode "ringkasan"
  headline?: string; // dipakai mode "headline" dan placeholder visual
  visual?: string; // arahan visual untuk agent (tampil di placeholder)
  factIds?: string[];
};

/** Warna caption. Bila tidak diisi, default mengikuti `tone`. */
export type CaptionColors = { text: string; highlight: string; highlightText: string };
/** Font episode (id Fontsource yang sudah diunduh ke public/fonts/ dengan `npm run font:add -- <id>`).
 *  `display` = judul/label/angka di visual; `text` = teks kecil di visual (default plus-jakarta-sans). Caption tidak ikut. */
export type EpisodeFonts = { display: string; text?: string; reason: string };
/** Gaya visual episode, dipilih sesuai isi fakta. `tone` = kecerahan latar dominan (menentukan watermark & default caption). */
export type VisualStyle = { name: string; reason: string; tone: 'light' | 'dark'; palette?: string[]; captionColors?: CaptionColors; fonts?: EpisodeFonts };

/** ringkasan = satu kalimat per scene · subtitle = kata per kata · headline = judul visual */
export type CaptionMode = 'ringkasan' | 'subtitle' | 'headline';

export type EpisodeBrief = {
  projectId: string;
  title: string;
  series: string;
  status: string;
  captionMode: CaptionMode;
  visualStyle: VisualStyle;
  scenes: EpisodeScene[];
};

export type ManifestEntry = { id: string; file: string; text: string; hash: string; audioSeconds: number; lufs: number; truePeak: number };
export type Caption = { text: string; startMs: number; endMs: number; timestampMs: number | null; confidence: number | null };
export type SceneCaptions = { hash: string; coverage: number; captions: Caption[] };

/** Hasil calculateMetadata: posisi setiap scene di timeline + aset yang ditemukan. */
export type TimelineScene = EpisodeScene & { from: number; frames: number; audio: string | null; captions: Caption[] | null };
/** `ctaAudio` = VO CTA bersama (CTA_VO_FILE) bila filenya ada. */
/** `storyFrames` = akhir narasi scene terakhir; `ctaFrom` = awal transisi CTA (setelah jeda CTA_HOLD_SECONDS). */
export type EpisodeTimeline = { scenes: TimelineScene[]; storyFrames: number; ctaFrom: number; hasVo: boolean; ctaAudio: string | null };

/** Props yang bisa diserialisasi (aman untuk Studio dan render). */
export type EpisodeProps = {
  brief: EpisodeBrief;
  timeline?: EpisodeTimeline;
};

/** Visual satu scene. Dirender di dalam <Sequence>: useCurrentFrame() mulai dari 0 di awal scene.
 *  `style` = visualStyle episode (tone, palette) supaya semua scene memakai satu gaya. */
export type SceneVisualProps = { scene: TimelineScene; durationInFrames: number; style: VisualStyle };
export type SceneVisuals = Record<string, React.FC<SceneVisualProps>>;
