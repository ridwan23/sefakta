import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_JAKARTA } from '../brand/fonts';
import type { SceneVisualProps } from './types';

/** Placeholder mengikuti tone episode (gelap: biru malam; terang: kertas) agar watermark & caption bisa dinilai. */
const LOOK = {
  dark: { bg: 'linear-gradient(180deg, #0D2250 0%, #081736 100%)', title: '#FFFFFF', label: '#FFB000', note: 'rgba(255,255,255,0.75)', dash: 'rgba(255,176,0,0.7)' },
  light: { bg: 'linear-gradient(180deg, #FBF7EE 0%, #EFE7D6 100%)', title: '#0D2250', label: '#B37800', note: 'rgba(13,34,80,0.75)', dash: 'rgba(13,34,80,0.45)' },
};

/** Visual sementara untuk scene yang belum punya visual sendiri. Sengaja terlihat "belum jadi":
 *  menampilkan headline dan arahan visual dari brief agar tidak lolos ke publikasi tanpa disadari. */
export const PlaceholderScene: React.FC<SceneVisualProps> = ({ scene, style }) => {
  const L = LOOK[style.tone];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(f, [0, 0.4 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: L.bg, fontFamily: FONT_JAKARTA, alignItems: 'center', justifyContent: 'center', padding: 90 }}>
      <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * 30}px)`, textAlign: 'center' }}>
        <div style={{ color: L.label, fontSize: 30, fontWeight: 800, letterSpacing: 4, marginBottom: 28 }}>SCENE {scene.id.toUpperCase()}</div>
        <div style={{ color: L.title, fontSize: 84, fontWeight: 800, lineHeight: 1.1 }}>{scene.headline ?? scene.voiceoverText}</div>
        {scene.visual ? (
          <div style={{ marginTop: 48, color: L.note, fontSize: 34, lineHeight: 1.35, border: `3px dashed ${L.dash}`, borderRadius: 24, padding: '24px 32px' }}>
            Visual belum dibuat: {scene.visual}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
