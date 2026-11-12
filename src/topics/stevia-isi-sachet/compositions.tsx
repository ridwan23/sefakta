import React from 'react';
import { AbsoluteFill, Audio, Composition, Folder, Sequence, staticFile, useVideoConfig, type CalculateMetadataFunction } from 'remotion';
import brief from '../../../briefs/stevia-isi-sachet.json';
import { Watermark } from '../../shared/brand/Watermark';
import { SceneCaption } from '../../shared/episode/EpisodeCaptions';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import { PlaceholderScene } from '../../shared/episode/PlaceholderScene';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

/** Episode "Sebungkus Stevia, Isinya Stevia?" versi LOOP (keputusan pemilik 2026-11-11): tanpa jeda dan tanpa klip CTA.
 *  Video berakhir tepat di akhir cerita, dan frame terakhir identik dengan frame 0 hook supaya pemutaran ulang menyambung.
 *  Timeline tetap dihitung oleh calculateEpisodeMetadata bersama (audio VO + caption); hanya durasinya dipotong di akhir
 *  cerita. Template src/shared/episode/ tidak diubah. */
const calculateLoopMetadata: CalculateMetadataFunction<EpisodeProps> = async (input) => {
  const meta = await calculateEpisodeMetadata(input);
  const timeline = meta.props?.timeline;
  return timeline ? { ...meta, durationInFrames: timeline.storyFrames } : meta;
};

const SteviaLoop: React.FC<EpisodeProps> = ({ brief: b, timeline }) => {
  const { fps } = useVideoConfig();
  if (!timeline) return null;
  return (
    <AbsoluteFill style={{ background: '#F6F1E7' }}>
      {timeline.scenes.map((s) => {
        const Visual = VISUALS[s.id] ?? PlaceholderScene;
        return (
          <Sequence key={s.id} name={`Scene ${s.id}`} from={s.from} durationInFrames={s.frames} premountFor={fps}>
            <Visual scene={s} durationInFrames={s.frames} style={b.visualStyle} />
            <SceneCaption scene={s} mode={b.captionMode} style={b.visualStyle} />
            {s.audio ? <Audio src={staticFile(s.audio)} /> : null}
          </Sequence>
        );
      })}
      {/* tanpa CTA: watermark tidak pernah memudar (hideFrom di luar durasi; Infinity tidak diterima interpolate) */}
      <Watermark tone={b.visualStyle.tone} hideFrom={timeline.storyFrames + 1000} />
    </AbsoluteFill>
  );
};

export const SteviaIsiSachetCompositions: React.FC = () => (
  <Folder name="stevia-isi-sachet">
    <Composition
      id="EpSteviaIsiSachet"
      component={SteviaLoop}
      calculateMetadata={calculateLoopMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
