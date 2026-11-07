import React from 'react';
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Watermark } from '../brand/Watermark';
import { CtaClip, CTA_WIPE } from '../brand/CtaClip';
import { PlaceholderScene } from './PlaceholderScene';
import { SceneCaption } from './EpisodeCaptions';
import type { EpisodeProps, SceneVisualProps, SceneVisuals, TimelineScene, VisualStyle } from './types';

const SceneLayer: React.FC<{ scene: TimelineScene; Visual: React.FC<SceneVisualProps>; mode: EpisodeProps['brief']['captionMode']; style: VisualStyle; freezeAfter?: number }> = ({ scene, Visual, mode, style, freezeAfter }) => {
  const visual = <Visual scene={scene} durationInFrames={scene.frames} style={style} />;
  return (
    <>
      {freezeAfter !== undefined ? (
        <Freeze frame={freezeAfter} active={(f) => f >= freezeAfter}>
          {visual}
        </Freeze>
      ) : (
        visual
      )}
      <SceneCaption scene={scene} mode={mode} style={style} />
      {scene.audio ? <Audio src={staticFile(scene.audio)} /> : null}
    </>
  );
};

/** Template satu episode SeFakta: scene berurutan (VO per scene), caption sesuai mode brief, watermark,
 *  lalu klip CTA bersuara setelah transisi iris dari frame fakta terakhir yang dibekukan.
 *  `visuals` memetakan id scene → komponen visual; scene tanpa visual memakai placeholder. */
export const Episode: React.FC<EpisodeProps & { visuals: SceneVisuals }> = ({ brief, timeline, visuals }) => {
  const { fps } = useVideoConfig();
  if (!timeline) return null;
  const last = timeline.scenes.length - 1;
  return (
    <AbsoluteFill style={{ background: '#081736' }}>
      {timeline.scenes.map((s, i) => (
        <Sequence key={s.id} name={`Scene ${s.id}`} from={s.from} durationInFrames={i === last ? s.frames + CTA_WIPE : s.frames} premountFor={fps}>
          <SceneLayer scene={s} Visual={visuals[s.id] ?? PlaceholderScene} mode={brief.captionMode} style={brief.visualStyle} freezeAfter={i === last ? s.frames - 1 : undefined} />
        </Sequence>
      ))}
      {/* latar terang → watermark terang (wordmark navy); latar gelap → watermark gelap (wordmark putih) */}
      <Watermark tone={brief.visualStyle.tone} hideFrom={timeline.storyFrames} />
      <Sequence name="CTA" from={timeline.storyFrames}>
        <CtaClip />
      </Sequence>
    </AbsoluteFill>
  );
};
