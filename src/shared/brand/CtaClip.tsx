import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CTA_VO_DELAY_FRAMES} from './ctaVoice';

/** CTA resmi berupa klip (public/brand/cta-opsi1.mp4: 4 dtk, 1080x1920).
 *  Transisi iris dari tengah layar membuka klip di atas frame fakta terakhir. Pasang di Sequence selebar 120 frame.
 *  `voice` = VO CTA episode (suara & kecepatan sama dengan narasi). Bila ada, audio asli klip diganti VO itu;
 *  bila belum dibuat, audio asli klip diputar (CTA tidak pernah bisu). */
export const CTA_WIPE = 22; // frame (±0,7 dtk)
export const CtaClip: React.FC<{voice?: string | null}> = ({voice}) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, CTA_WIPE], [0, 120], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}% at 50% 50%)`}}>
      <OffthreadVideo src={staticFile('brand/cta-opsi1.mp4')} muted={Boolean(voice)} />
      {voice ? (
        <Sequence name="VO CTA" from={CTA_VO_DELAY_FRAMES}>
          <Audio src={staticFile(voice)} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
