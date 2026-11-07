import React from 'react';
import {AbsoluteFill, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';

/** CTA resmi berupa klip (public/brand/cta-opsi1.mp4: 4 dtk, 1080x1920, BERSUARA).
 *  Transisi iris dari tengah layar membuka klip di atas frame fakta terakhir. Pasang di Sequence selebar 120 frame. */
export const CTA_WIPE = 14; // frame
export const CtaClip: React.FC = () => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, CTA_WIPE], [0, 120], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}% at 50% 50%)`}}>
      <OffthreadVideo src={staticFile('brand/cta-opsi1.mp4')} />
    </AbsoluteFill>
  );
};
