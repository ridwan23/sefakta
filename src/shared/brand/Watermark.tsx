import React from 'react';
import {Img, staticFile, useCurrentFrame, interpolate} from 'remotion';

/** SeFakta watermark, kanan atas (±18% lebar, opacity 85%). `tone`: 'light' video -> navy wordmark, 'dark' video -> white wordmark.
 *  Fades out at `hideFrom` (when the CTA lockup takes over). */
export const Watermark: React.FC<{tone: 'light' | 'dark'; hideFrom?: number}> = ({tone, hideFrom = Infinity}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [hideFrom - 12, hideFrom], [0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Img
      src={staticFile(tone === 'light' ? 'brand/watermark-untuk-video-terang.png' : 'brand/watermark-untuk-video-gelap.png')}
      style={{position: 'absolute', top: 84, right: 54, width: 194, /* kanan atas, ±18% lebar frame, opacity 85% (brand) */ height: 'auto', opacity: op, pointerEvents: 'none'}}
    />
  );
};
