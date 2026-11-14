// Gaya risograf: cetak 2–3 tinta spot di atas kertas tak berlapis. Setiap tinta = satu lapisan (pelat) yang dicetak
// terpisah, jadi: warnanya terbatas, tumpang-tindih menjadi warna ketiga (multiply), tinta berbutir, dan pelatnya
// sedikit meleset (misregistration) dan bergeser halus antar-frame.
//
// Dua cara pakai:
//   1) Gambar per pelat (kontrol penuh): isi pelat digambar HITAM/abu; gelap = tinta tebal, abu = tinta tipis.
//      <RisoPaper />
//      <RisoInk color={RISO.biru}><Bentuk hitam/></RisoInk>
//      <RisoInk color={RISO.pink} offset={[6, -3]}><Teks hitam/></RisoInk>
//   2) Bungkus gaya lain (pemisahan warna otomatis, seperti CMY): setiap tinta mengambil satu kanal.
//      <RisoPrint inks={[{ color: RISO.biru, from: 'r' }, { color: RISO.pink, from: 'g' }]}>…visual berwarna…</RisoPrint>
import React, { useId } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { noise1 } from '../anim/core';
import { Fiber } from '../collage/pieces';

/** Warna tinta Riso yang umum (perkiraan sRGB). */
export const RISO = {
  pink: '#FF48B0',
  biru: '#0078BF',
  kuning: '#FFE800',
  teal: '#00838A',
  oranye: '#FF6C2F',
  hijau: '#00A95C',
  ungu: '#765BA7',
  merah: '#F15060',
  federal: '#3D5588',
  hitam: '#2B2A2A',
} as const;

export const RISO_PAPER = '#F4EFE4';

/** Kertas tak berlapis: krem pucat dengan serat. Lapisan paling bawah. */
export const RisoPaper: React.FC<{ color?: string }> = ({ color = RISO_PAPER }) => (
  <AbsoluteFill style={{ background: color }}>
    <Fiber opacity={0.22} seed={9} />
  </AbsoluteFill>
);

/** Sumber cakupan tinta: k = gelap (luminans), r/g/b = kebalikan kanal (pemisahan ala CMY). */
export type InkFrom = 'k' | 'r' | 'g' | 'b';

const COVER: Record<InkFrom, string> = {
  k: '-0.2126 -0.7152 -0.0722 1 0',
  r: '-1 0 0 1 0',
  g: '0 -1 0 1 0',
  b: '0 0 -1 1 0',
};

export type RisoInkProps = {
  color: string;
  /** meleset statis (px) */
  offset?: [number, number];
  /** goyang register antar-frame (px); berganti tiap 4 frame */
  wobble?: number;
  /** butir 0..1 (0 = rata, 1 = sangat berbintik) */
  grain?: number;
  from?: InkFrom;
  /** kerapatan maks. tinta 0..1 (tinta riso jarang 100% rata) */
  density?: number;
  seed?: number;
  children?: React.ReactNode;
};

/** Satu pelat tinta. Isi digambar seperti biasa; cakupan dari kegelapan (atau kanal `from`), lalu diganti warna tinta,
 *  diberi butir, dan dicetak multiply di atas lapisan di bawahnya. */
export const RisoInk: React.FC<RisoInkProps> = ({ color, offset = [0, 0], wobble = 1.6, grain = 0.5, from = 'k', density = 0.92, seed = 1, children }) => {
  const id = useId().replace(/:/g, '');
  const frame = useCurrentFrame();
  const t = Math.floor(frame / 4);
  const dx = offset[0] + noise1(t * 0.7, seed) * wobble;
  const dy = offset[1] + noise1(t * 0.7, seed + 9) * wobble;
  // cakupan − butir, dipertajam: k besar = titik tegas, k kecil = gradasi halus
  const k = 1.2 + grain * 5;
  const spread = 0.25 + grain * 0.55;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id={`r${id}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${COVER[from]}`} result="cov" />
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed * 3 + 1} result="n0" />
          <feColorMatrix in="n0" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${spread * 2} 0 0 0 ${0.5 - spread}`} result="n" />
          <feComposite in="cov" in2="n" operator="arithmetic" k1={0} k2={k * density} k3={-k} k4={0.5} result="a" />
          <feFlood floodColor={color} result="ink" />
          <feComposite in="ink" in2="a" operator="in" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#r${id})`, transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export type RisoPrintProps = {
  inks?: { color: string; from: InkFrom; offset?: [number, number] }[];
  grain?: number;
  /** latar kertas ikut digambar */
  paper?: boolean;
  children: React.ReactNode;
};

/** Bungkus visual berwarna apa pun menjadi cetak riso: isi digambar sekali per tinta, tiap tinta mengambil satu kanal.
 *  Default biru (kanal merah) + pink (kanal hijau): hitam → ungu tua, merah → pink, biru → biru, putih → kertas. */
export const RisoPrint: React.FC<RisoPrintProps> = ({
  inks = [
    { color: RISO.biru, from: 'r' },
    { color: RISO.pink, from: 'g', offset: [5, -3] },
  ],
  grain = 0.5,
  paper = true,
  children,
}) => (
  <AbsoluteFill>
    {paper ? <RisoPaper /> : null}
    {inks.map((ink, i) => (
      <RisoInk key={i} color={ink.color} from={ink.from} offset={ink.offset ?? [0, 0]} grain={grain} seed={i + 1}>
        {children}
      </RisoInk>
    ))}
  </AbsoluteFill>
);
