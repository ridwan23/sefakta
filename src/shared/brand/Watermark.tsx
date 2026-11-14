import React from 'react';
import {Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {LayoutProbe} from '../episode/LayoutProbe';

/** SeFakta watermark, kanan atas (±18% lebar, opacity 85%). `tone`: 'light' video -> navy wordmark, 'dark' video -> white wordmark.
 *  Fades out at `hideFrom` (when the CTA lockup takes over). Bila `hideFrom` tidak diisi
 *  (episode tanpa CTA, mis. loop), watermark tetap tampil sampai akhir (opacity 0,85). */
export const Watermark: React.FC<{tone: 'light' | 'dark'; hideFrom?: number}> = ({tone, hideFrom}) => {
  const f = useCurrentFrame();
  const op = hideFrom === undefined ? 0.85 : interpolate(f, [hideFrom - 12, hideFrom], [0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <Img
        data-layout-ignore
        src={staticFile(tone === 'light' ? 'brand/watermark-untuk-video-terang.png' : 'brand/watermark-untuk-video-gelap.png')}
        // zIndex: watermark adalah penanda brand yang harus selalu tampil di atas konten scene —
        // tanpa ini, lapisan scene ber-zIndex (mis. dissolve loop) akan menutupinya di frame akhir.
        style={{position: 'absolute', top: 84, right: 54, width: 194, /* kanan atas, ±18% lebar frame, opacity 85% (brand) */ height: 'auto', opacity: op, pointerEvents: 'none', zIndex: 30}}
      />
      {/* tak terlihat; aktif hanya saat npm run layout:check (Watermark ada di setiap komposisi episode) */}
      <LayoutProbe />
    </>
  );
};
