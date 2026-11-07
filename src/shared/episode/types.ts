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

export type EpisodeBrief = {
  projectId: string;
  title: string;
  series: string;
  status: string;
  captionMode: 'ringkasan' | 'subtitle' | 'headline';
  scenes: EpisodeScene[];
};

export type ManifestEntry = { id: string; file: string; hash: string; audioSeconds: number; lufs: number; truePeak: number };
export type Caption = { text: string; startMs: number; endMs: number; timestampMs: number | null; confidence: number | null };
export type SceneCaptions = { hash: string; coverage: number; captions: Caption[] };

/** Hasil calculateMetadata: posisi setiap scene di timeline + aset yang ditemukan. */
export type TimelineScene = EpisodeScene & { from: number; frames: number; audio: string | null; captions: Caption[] | null };
export type EpisodeTimeline = { scenes: TimelineScene[]; storyFrames: number; hasVo: boolean };

/** Props yang bisa diserialisasi (aman untuk Studio dan render). */
export type EpisodeProps = {
  brief: EpisodeBrief;
  watermarkTone: 'light' | 'dark';
  timeline?: EpisodeTimeline;
};

/** Visual satu scene. Dirender di dalam <Sequence>: useCurrentFrame() mulai dari 0 di awal scene. */
export type SceneVisualProps = { scene: TimelineScene; durationInFrames: number };
export type SceneVisuals = Record<string, React.FC<SceneVisualProps>>;
