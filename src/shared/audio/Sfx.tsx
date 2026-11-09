import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

/** Satu efek suara pada frame `at` (relatif awal scene). File dari public/sfx/ yang tercatat di
 *  public/sfx/LICENSES.json (dicek `check:episodes`). `volume` 1 di celah narasi; ≤ 0,5 bila tumpang tindih ucapan
 *  (aturan PANDUAN-AI-AGENT-PRODUKSI §7). Pakai di kode topik, dipicu waktu kata dari `cueFrames`. */
export const Sfx: React.FC<{ at: number; file: string; volume?: number; name?: string }> = ({ at, file, volume = 1, name }) => (
  <Sequence from={Math.max(0, Math.round(at))} name={name ?? `SFX ${file}`} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);
