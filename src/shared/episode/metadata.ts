import { staticFile, type CalculateMetadataFunction } from 'remotion';
import type { EpisodeProps, EpisodeTimeline, ManifestEntry, SceneCaptions } from './types';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const CTA_FRAMES = 120; // klip CTA 4 dtk
export const SCENE_PAD_SECONDS = 0.5; // jeda setelah kalimat sebelum scene berikutnya

const readJson = async <T,>(path: string): Promise<T | null> => {
  try {
    const res = await fetch(staticFile(path));
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
};

/** Durasi video dihitung dari audio VO yang sebenarnya (public/<projectId>/manifest.json) dan caption hasil
 *  penyelarasan (captions.json). Tanpa VO, durasi brief dipakai apa adanya (pratinjau tanpa suara). */
export const calculateEpisodeMetadata: CalculateMetadataFunction<EpisodeProps> = async ({ props }) => {
  const { brief } = props;
  const manifest = await readJson<{ scenes: ManifestEntry[] }>(`${brief.projectId}/manifest.json`);
  const caps = await readJson<{ scenes: Record<string, SceneCaptions> }>(`${brief.projectId}/captions.json`);
  const byId = new Map((manifest?.scenes ?? []).map((e) => [e.id, e]));

  let cursor = 0;
  const scenes = brief.scenes.map((s) => {
    const vo = byId.get(s.id);
    const seconds = Math.max(s.durationSeconds, vo ? vo.audioSeconds + SCENE_PAD_SECONDS : 0);
    const frames = Math.ceil(seconds * FPS);
    const c = caps?.scenes?.[s.id];
    const entry = { ...s, from: cursor, frames, audio: vo ? vo.file : null, captions: c && vo && c.hash === vo.hash ? c.captions : null };
    cursor += frames;
    return entry;
  });
  const timeline: EpisodeTimeline = { scenes, storyFrames: cursor, hasVo: scenes.every((s) => s.audio) };
  return { durationInFrames: cursor + CTA_FRAMES, fps: FPS, width: WIDTH, height: HEIGHT, props: { ...props, timeline } };
};
