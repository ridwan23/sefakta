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
 *  jeda singkat tanpa narasi, lalu klip CTA bersuara setelah transisi iris dari frame fakta terakhir yang dibekukan.
 *  Bila brief `ending.cta === false` (mis. loop), komposisi berakhir di akhir narasi: tanpa jeda, tanpa klip CTA,
 *  tanpa pembekuan scene terakhir, dan watermark tetap tampil sampai akhir.
 *  `visuals` memetakan id scene → komponen visual; scene tanpa visual memakai placeholder. */
export const Episode: React.FC<EpisodeProps & { visuals: SceneVisuals }> = ({ brief, timeline, visuals }) => {
  const { fps } = useVideoConfig();
  if (!timeline) return null;
  const last = timeline.scenes.length - 1;
  const hasCta = timeline.hasCta;
  const hold = hasCta ? timeline.ctaFrom - timeline.storyFrames : 0; // jeda: visual akhir tetap bergerak, lalu dibekukan saat iris
  return (
    <AbsoluteFill style={{ background: '#081736' }}>
      {timeline.scenes.map((s, i) => (
        <Sequence key={s.id} name={`Scene ${s.id}`} from={s.from} durationInFrames={i === last && hasCta ? s.frames + hold + CTA_WIPE : s.frames} premountFor={fps}>
          <SceneLayer scene={s} Visual={visuals[s.id] ?? PlaceholderScene} mode={brief.captionMode} style={brief.visualStyle} freezeAfter={i === last && hasCta ? s.frames + hold - 1 : undefined} />
        </Sequence>
      ))}
      {/* latar terang → watermark terang (wordmark navy); latar gelap → watermark gelap (wordmark putih).
          Tanpa CTA tidak ada gerbang CTA — watermark tetap tampil sampai akhir (hideFrom default Infinity). */}
      <Watermark tone={brief.visualStyle.tone} hideFrom={hasCta ? timeline.ctaFrom : undefined} />
      {hasCta ? (
        <Sequence name="CTA" from={timeline.ctaFrom}>
          <CtaClip voice={timeline.ctaAudio} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
