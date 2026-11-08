import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

/** Latar ilustrasi hasil `npm run image` (public/<episode>/img/<scene>.jpg), dengan zoom lambat (Ken Burns)
 *  dan lapisan penjernih agar elemen kode di atasnya tetap terbaca. Panggil hanya bila file sudah dibuat. */
export const IllustrationBackdrop: React.FC<{ src: string; durationInFrames: number; fromScale?: number; toScale?: number; veil?: string; veilOpacity?: number }> = ({
  src, durationInFrames, fromScale = 1.04, toScale = 1.14, veil = '#F3EAD7', veilOpacity = 0.25,
}) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, durationInFrames], [fromScale, toScale], { easing: Easing.inOut(Easing.sin), extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }} />
      <AbsoluteFill style={{ background: veil, opacity: veilOpacity }} />
    </AbsoluteFill>
  );
};
