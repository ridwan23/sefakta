// Bingkai bersama untuk objek ilustrasi (shared/objects). Objek menggambar di ruang lokal selebar `w` satuan
// (umumnya 200); ObjFrame mengurus posisi layar, skala, rotasi/cermin, pop-in berpegas, gerak idle, dan bayangan kontak.
//
//   <Sun x={540} y={500} size={360} at={q.matahari} />
//   <Bowl x={540} y={1100} size={420} ground={1230} />          // ground = y permukaan → ContactShadow digambar
//
// Objek baru: tulis komponen yang memanggil <ObjFrame {...props} w={200} h={220} draw={(c) => <>…svg…</>} />.
// `c.t` = detik sejak objek muncul (untuk detail hidup), `c.k` = pengali idle (0 = diam).
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { noise1, springAt } from '../anim/core';
import { ContactShadow } from '../render/ContactShadow';

export type ObjProps = {
  /** pusat objek di layar (px) */
  x: number;
  y: number;
  /** lebar di layar (px); gambar lokal selebar `w` satuan */
  size?: number;
  rotate?: number;
  /** true = idle standar, angka = pengali kecepatan/amplitudo, false = diam */
  idle?: boolean | number;
  /** y permukaan (px); bila diisi, ContactShadow digambar di bawah objek */
  ground?: number;
  flip?: boolean;
  opacity?: number;
  /** warna utama (override) */
  color?: string;
  /** frame mulai muncul (pop-in berpegas); kosong = sudah tampil sejak frame 0 */
  at?: number;
};

export type ObjCtx = {
  /** frame lokal sejak muncul */
  f: number;
  /** detik sejak muncul */
  t: number;
  /** pengali idle (0 = diam) */
  k: number;
  fps: number;
  /** progres pop-in 0..1 (pegas, bisa sedikit > 1) */
  pop: number;
};

type FrameProps = ObjProps & {
  /** ukuran gambar lokal */
  w: number;
  h: number;
  draw: (c: ObjCtx) => React.ReactNode;
  /** goyang idle bawaan bingkai: amplitudo naik-turun (satuan lokal) dan rotasi (derajat) */
  bob?: number;
  sway?: number;
  /** lebar bayangan relatif terhadap size */
  shadowWidth?: number;
  /** jarak dasar objek dari tepi bawah gambar lokal (satuan lokal), untuk bayangan */
  footInset?: number;
  /** seed noise agar objek sejenis tidak bergerak serempak */
  seed?: number;
};

export const idleK = (idle: ObjProps['idle']) => (idle === false ? 0 : idle === true || idle === undefined ? 1 : idle);

export const ObjFrame: React.FC<FrameProps> = ({
  x, y, size = 300, rotate = 0, idle, ground, flip, opacity = 1, at, w, h, draw, bob = 3, sway = 1.2, shadowWidth = 0.7, footInset = 0, seed = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = at ?? -1000;
  if (frame < start) return null;
  const f = frame - (at ?? 0);
  const k = idleK(idle);
  const pop = at === undefined ? 1 : springAt(frame, start, fps, { damping: 12, stiffness: 160, mass: 0.8 });
  const s = size / w;
  const t = f / fps;
  const by = k ? noise1(t * 0.6 * k, seed + 3) * bob * k : 0;
  const br = k ? noise1(t * 0.45 * k, seed + 11) * sway * k : 0;
  const hs = h * s;
  const bottom = y + hs / 2;
  const lift = ground !== undefined ? Math.max(0, ground - (bottom - footInset * s) - by * s) : 0;
  return (
    <>
      {ground !== undefined ? <ContactShadow x={x} y={ground} width={size * shadowWidth * Math.min(1, pop)} elevation={lift} opacity={0.42 * Math.min(1, pop) * opacity} /> : null}
      <svg
        width={size}
        height={hs}
        viewBox={`0 0 ${w} ${h}`}
        style={{
          position: 'absolute',
          left: x - size / 2,
          top: y - hs / 2,
          overflow: 'visible',
          opacity: opacity * Math.min(1, pop * 1.6),
          transformOrigin: '50% 100%',
          transform: `translateY(${by * s}px) rotate(${rotate + br}deg) scale(${(flip ? -1 : 1) * pop}, ${pop})`,
        }}
      >
        {draw({ f, t, k, fps, pop })}
      </svg>
    </>
  );
};
