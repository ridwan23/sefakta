import type { TimelineScene } from './types';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Frame (relatif awal scene) saat sebuah kata naskah mulai diucapkan, dari caption hasil alignment audio.
 *  `nth` memilih kemunculan ke-n (0 = pertama). Bila caption belum ada, memakai `fallbackSec` (perkiraan),
 *  jadi animasi tetap jalan di Studio sebelum `npm run align`. */
export const cueFrame = (scene: TimelineScene, word: string, fps: number, fallbackSec: number, nth = 0): number => {
  const hit = (scene.captions ?? []).filter((c) => norm(c.text) === norm(word))[nth];
  return Math.round(((hit ? hit.startMs : fallbackSec * 1000) / 1000) * fps);
};

/** Semua cue sekaligus: { kunci: [kata, perkiraanDetik, nth?] } → { kunci: frame }. */
export const cueFrames = <K extends string>(scene: TimelineScene, fps: number, spec: Record<K, [string, number, number?]>): Record<K, number> =>
  Object.fromEntries(Object.entries(spec).map(([k, v]) => {
    const [w, s, n] = v as [string, number, number?];
    return [k, cueFrame(scene, w, fps, s, n ?? 0)];
  })) as Record<K, number>;
