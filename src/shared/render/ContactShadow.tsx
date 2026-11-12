// Bayangan kontak dan kedalaman atmosfer: objek "menapak" di permukaan dan objek jauh terasa jauh.
//
//   <ContactShadow x={540} y={1180} width={360} elevation={lift} />   // di bawah objek, sebelum objeknya
//   <div style={depthStyle(0.6)}>…objek jauh…</div>
import React from 'react';
import { useLight } from './light';

/** Bayangan elips di permukaan. `elevation` (px) = jarak objek dari permukaan: makin tinggi, makin lebar, pudar,
 *  dan bergeser menjauhi lampu. Dipasang di (x, y) = titik tapak objek. Koordinat layar px. */
export const ContactShadow: React.FC<{ x: number; y: number; width: number; elevation?: number; opacity?: number; color?: string }> = ({
  x, y, width, elevation = 0, opacity = 0.42, color = '15,18,40',
}) => {
  const L = useLight();
  const lift = Math.max(0, elevation);
  const w = width * (1 + lift / 600);
  const h = Math.max(10, width * 0.13 + lift * 0.04);
  const o = opacity / (1 + lift / 140);
  const dx = -L.toLight[0] * lift * 0.35;
  return (
    <>
      {/* bayangan lunak lebar */}
      <div style={{ position: 'absolute', left: x - w / 2 + dx, top: y - h / 2, width: w, height: h, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(${color},${o}), rgba(${color},0))`, filter: `blur(${4 + lift * 0.05}px)`, pointerEvents: 'none' }} />
      {/* inti gelap di titik sentuh (ambient occlusion), hilang saat objek terangkat */}
      {lift < 60 ? (
        <div style={{ position: 'absolute', left: x - width * 0.32 + dx, top: y - h * 0.22, width: width * 0.64, height: h * 0.44, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(${color},${0.55 * (1 - lift / 60)}), rgba(${color},0))`, pointerEvents: 'none' }} />
      ) : null}
    </>
  );
};

/** Perspektif atmosfer: z 0 = dekat (tajam, penuh), z 1 = jauh (kecil, buram, pucat ke arah warna latar). */
export const depthStyle = (z: number): React.CSSProperties => ({
  transform: `scale(${(1 - z * 0.45).toFixed(3)})`,
  filter: `blur(${(z * 6).toFixed(1)}px) saturate(${(1 - z * 0.5).toFixed(2)}) brightness(${(1 + z * 0.12).toFixed(2)})`,
  opacity: 1 - z * 0.35,
});
