import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { font } from '../../shared/brand/fonts';
import { BoardSurface, Hatch, INK, SketchPath, SketchText } from '../../shared/sketch';

/** Palet episode "Papan tulis spidol dapur pagi" (brief v2, Kartu 1). */
export const C = {
  bg: '#F6F6F2',
  ink: INK.hitam,
  blue: INK.biru,
  red: INK.merah,
  green: INK.hijau,
  yellow: INK.kapurKuning,
  orange: '#F08A1D',
  orangeDull: '#A8641F',
  pink: '#F4A7B9',
  white: '#FFFFFF',
  dim: '#6B7280',
};

export const DISPLAY = font('caveat');
export const TEXT = font('plus-jakarta-sans');

/** 0 → 1 dengan easing (default out cubic). */
export const ramp = (f: number, at: number, dur: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
/** 0 → 1 dengan overshoot (masuk pop). */
export const pop = (f: number, at: number, dur = 14) =>
  interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) });
/** 1 → 0 (keluar). */
export const fade = (f: number, at: number, dur: number) => 1 - ramp(f, at, dur);

/** Campur dua warna heksa (t 0..1). */
export const lerpColor = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
};

/** Teks SVG terpusat di (x, y) — y = garis dasar. */
export const Txt: React.FC<{
  x: number; y: number; text: string; size: number; color?: string; weight?: number;
  o?: number; spacing?: number; display?: boolean; anchor?: 'middle' | 'start' | 'end'; rotate?: number;
}> = ({ x, y, text, size, color = C.ink, weight = 700, o = 1, spacing, display, anchor = 'middle', rotate = 0 }) => (
  <text
    x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight}
    fill={color} opacity={o} letterSpacing={spacing}
    fontFamily={display ? DISPLAY : TEXT}
    transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
  >
    {text}
  </text>
);

type Pt = [number, number];
/** Pemetaan koordinat lokal → layar (pusat cx,cy; skala s; putar deg; skala-y sy). */
export const xf = (cx: number, cy: number, s: number, deg = 0, sy = 1) =>
  (lx: number, ly: number): Pt => {
    const a = (deg * Math.PI) / 180;
    const rx = lx * Math.cos(a) - ly * Math.sin(a);
    const ry = lx * Math.sin(a) + ly * Math.cos(a);
    return [cx + rx * s, cy + ry * s * sy];
  };
const fmt = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const line = (a: Pt, b: Pt) => `M${fmt(a)} L${fmt(b)}`;
/** Path lingkaran dari koordinat layar — dipakai SketchPath agar titik/lingkaran benar-benar ter-gambar.
 *  (Elemen <circle>/<path>/<rect> polos yang dirender langsung di dalam <div> TIDAK ter-render di Remotion —
 *  hanya SketchPath/SketchText/Hatch yang membuat layer <svg>-nya sendiri, atau elemen di dalam <svg>.) */
const circPath = (cx: number, cy: number, r: number) =>
  `M${(cx - r).toFixed(1)} ${cy.toFixed(1)} a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0 a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0 Z`;

// ------------------------------------------------------------------ aset 1 · gelas jus
/** Gelas jus jeruk (objek pahlawan). Geometri lokal: tinggi 400, lebar atas 260. `dull` 0 = oranye cerah, 1 = kusam. */
export const GlassJuice: React.FC<{
  x: number; y: number; s?: number; t?: number; dull?: number; straw?: boolean; slice?: boolean; at?: number; seed?: number;
}> = ({ x, y, s = 1, t = 1, dull = 0, straw = true, slice = true, at = 0, seed = 11 }) => {
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t));
  const juice = lerpColor(C.orange, C.orangeDull, dull);
  const outline = `M${fmt(p(-130, -200))} L${fmt(p(-100, 200))} Q${fmt(p(0, 222))} ${fmt(p(100, 200))} L${fmt(p(130, -200))}`;
  const fill = `M${fmt(p(-116, -88))} L${fmt(p(116, -88))} L${fmt(p(92, 186))} Q${fmt(p(0, 204))} ${fmt(p(-92, 186))} Z`;
  const slicePath = `M${fmt(p(-59, -185))} A${(36 * s).toFixed(1)} ${(36 * s).toFixed(1)} 0 1 1 ${fmt(p(-131, -185))} A${(36 * s).toFixed(1)} ${(36 * s).toFixed(1)} 0 1 1 ${fmt(p(-59, -185))} Z`;
  return (
    <g opacity={Math.min(1, t)}>
      <SketchPath d={fill} fill={juice} at={at} dur={14} seed={seed} double={false} />
      <SketchPath d={outline} at={at} dur={16} width={8} seed={seed} />
      <SketchPath d={line(p(-116, -88), p(116, -88))} at={at + 10} dur={10} width={6} color={C.orange} seed={seed + 1} />
      {straw ? <SketchPath d={line(p(55, -262), p(96, 44))} at={at + 6} dur={10} width={13} color={C.red} seed={seed + 2} /> : null}
      {slice ? (
        <>
          <SketchPath d={slicePath} fill={C.yellow} at={at + 4} dur={10} seed={seed + 3} double={false} />
          <SketchPath d={line(p(-95, -185), p(-95, -149))} at={at + 12} dur={6} width={4} color={C.orange} seed={seed + 4} />
          <SketchPath d={line(p(-95, -185), p(-125, -165))} at={at + 12} dur={6} width={4} color={C.orange} seed={seed + 4} />
          <SketchPath d={line(p(-95, -185), p(-65, -165))} at={at + 12} dur={6} width={4} color={C.orange} seed={seed + 4} />
        </>
      ) : null}
      <SketchPath d={line(p(-104, -160), p(-88, 120))} at={at + 12} dur={8} width={8} color={C.white} seed={seed + 5} double={false} />
    </g>
  );
};

// ------------------------------------------------------------------ aset 2 · sikat gigi + tube pasta
/** Sikat gigi hijau (gagang, leher putih, bulu oranye). Geometri lokal: tinggi ±370. */
export const Toothbrush: React.FC<{
  x: number; y: number; s?: number; t?: number; rot?: number; sy?: number; at?: number; seed?: number;
}> = ({ x, y, s = 1, t = 1, rot = 0, sy = 1, at = 0, seed = 21 }) => {
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t), rot, sy);
  const handle = `M${fmt(p(-17, -40))} L${fmt(p(17, -40))} L${fmt(p(17, 178))} Q${fmt(p(17, 198))} ${fmt(p(0, 198))} Q${fmt(p(-17, 198))} ${fmt(p(-17, 178))} Z`;
  const neck = `M${fmt(p(-13, -122))} L${fmt(p(13, -122))} L${fmt(p(13, -40))} L${fmt(p(-13, -40))} Z`;
  return (
    <g opacity={Math.min(1, t)}>
      <SketchPath d={handle} fill={C.green} at={at} dur={12} seed={seed} double={false} />
      <SketchPath d={neck} fill={C.white} at={at + 4} dur={8} seed={seed + 1} double={false} />
      <SketchPath d={line(p(-12, -168), p(-12, -128))} at={at + 8} dur={6} width={6} color={C.orange} seed={seed + 2} />
      <SketchPath d={line(p(0, -174), p(0, -128))} at={at + 8} dur={6} width={6} color={C.yellow} seed={seed + 2} />
      <SketchPath d={line(p(12, -168), p(12, -128))} at={at + 8} dur={6} width={6} color={C.orange} seed={seed + 2} />
    </g>
  );
};

/** Tube pasta gigi. `band` = warna pita, `bandText` = teks pita. */
export const Tube: React.FC<{
  x: number; y: number; s?: number; t?: number; rot?: number; at?: number; sy?: number; band?: string; bandText?: string; seed?: number;
}> = ({ x, y, s = 1, t = 1, rot = 0, at = 0, sy = 1, band = C.red, bandText = 'SLS', seed = 31 }) => {
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t), rot, sy);
  const body = `M${fmt(p(-75, -110))} L${fmt(p(75, -110))} Q${fmt(p(75, -92))} ${fmt(p(75, -80))} L${fmt(p(75, 80))} Q${fmt(p(75, 110))} ${fmt(p(40, 110))} L${fmt(p(-40, 110))} Q${fmt(p(-75, 110))} ${fmt(p(-75, 80))} L${fmt(p(-75, -80))} Q${fmt(p(-75, -92))} ${fmt(p(-75, -110))} Z`;
  const bandPath = `M${fmt(p(-75, -42))} L${fmt(p(75, -42))} L${fmt(p(75, 42))} L${fmt(p(-75, 42))} Z`;
  return (
    <g opacity={Math.min(1, t)}>
      <SketchPath d={body} fill={C.white} at={at} dur={12} seed={seed} double={false} />
      <SketchPath d={bandPath} fill={band} at={at + 6} dur={8} seed={seed + 1} double={false} />
      <SketchText x={x} y={y} text={bandText} at={at + 10} size={Math.round(44 * s)} color={C.white} rotate={-1} />
      <SketchPath d={`M${fmt(p(-24, 110))} Q${fmt(p(0, 128))} ${fmt(p(24, 110))} Q${fmt(p(0, 158))} ${fmt(p(-24, 110))} Z`} fill={C.yellow} at={at + 12} dur={8} seed={seed + 2} double={false} />
    </g>
  );
};

// ------------------------------------------------------------------ aset 3 · busa SLS
/** Gelembung deterjen biru + tag SLS + bintang kuning. */
export const Foam: React.FC<{ x: number; y: number; s?: number; t?: number; at?: number; seed?: number }> = ({ x, y, s = 1, t = 1, at = 0, seed = 41 }) => {
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t));
  const circ = (cx: number, cy: number, r: number) =>
    `M${fmt(p(cx - r, cy))} A${(r * s).toFixed(1)} ${(r * s).toFixed(1)} 0 1 1 ${fmt(p(cx + r, cy))} A${(r * s).toFixed(1)} ${(r * s).toFixed(1)} 0 1 1 ${fmt(p(cx - r, cy))} Z`;
  const star = `M${fmt(p(-95, -118))} L${fmt(p(-87, -94))} L${fmt(p(-63, -86))} L${fmt(p(-87, -78))} L${fmt(p(-95, -54))} L${fmt(p(-103, -78))} L${fmt(p(-127, -86))} L${fmt(p(-103, -94))} Z`;
  return (
    <g opacity={Math.min(1, t)}>
      <SketchPath d={circ(0, 0, 56)} at={at} dur={12} width={6} color={C.blue} seed={seed} double={false} />
      <SketchPath d={circ(78, -46, 38)} at={at + 4} dur={10} width={6} color={C.blue} seed={seed + 1} double={false} />
      <SketchPath d={circ(-66, -56, 32)} at={at + 6} dur={10} width={6} color={C.blue} seed={seed + 2} double={false} />
      <SketchPath d={circ(56, 66, 44)} at={at + 8} dur={10} width={6} color={C.blue} seed={seed + 3} double={false} />
      <SketchPath d={circ(-46, 76, 30)} at={at + 10} dur={10} width={6} color={C.blue} seed={seed + 4} double={false} />
      <SketchPath d={star} fill={C.yellow} at={at + 6} dur={8} seed={seed + 5} double={false} />
      <SketchPath d={`M${fmt(p(-46, -19))} L${fmt(p(46, -19))} L${fmt(p(46, 19))} L${fmt(p(-46, 19))} Z`} fill={C.ink} at={at + 12} dur={8} seed={seed + 6} double={false} />
      <SketchText x={x} y={y} text="SLS" at={at + 12} size={Math.round(34 * s)} color={C.white} rotate={0} />
    </g>
  );
};

// ------------------------------------------------------------------ aset 4 · lidah + reseptor
/** Lidah merah muda dengan titik reseptor: kuning = manis, merah = pahit.
 *  `sweetDim` 0..1 (manis meredup), `bitterLit` 0..1 (pahit menyala). */
export const Tongue: React.FC<{
  x: number; y: number; s?: number; t?: number; sweetDim?: number; bitterLit?: number; at?: number; seed?: number;
}> = ({ x, y, s = 1, t = 1, sweetDim = 0, bitterLit = 0, at = 0, seed = 51 }) => {
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t));
  const shape = `M${fmt(p(-150, 180))} L${fmt(p(-185, -40))} C${fmt(p(-185, -140))} ${fmt(p(-110, -200))} ${fmt(p(0, -200))} C${fmt(p(110, -200))} ${fmt(p(185, -140))} ${fmt(p(185, -40))} L${fmt(p(150, 180))} Q${fmt(p(0, 200))} ${fmt(p(-150, 180))} Z`;
  const sweet: Pt[] = [[-90, -80], [30, -120], [-30, 0], [90, -40]];
  const bitter: Pt[] = [[80, 60], [-110, 40], [0, 90], [120, -100]];
  const bitterS = 1 + 0.25 * bitterLit;
  return (
    <g opacity={Math.min(1, t)}>
      <SketchPath d={shape} fill={C.pink} at={at} dur={16} seed={seed} double={false} />
      <SketchPath d={line(p(0, -170), p(0, 150))} at={at + 10} dur={10} width={5} color={C.ink} seed={seed + 1} />
      {/* label reseptor sesuai asset sheet: MANIS (kiri) / PAHIT (kanan) di puncak lidah;
          digambar SETELAH bodi lidah (at+12) supaya titik/label tidak melayang di krem kosong
          saat lidah masuk (putaran 2 review) */}
      <SketchText x={p(-95, -155)[0]} y={p(-95, -155)[1]} text="MANIS" at={at + 12} size={Math.round(26 * s)} color={C.ink} rotate={-2} />
      <SketchText x={p(95, -155)[0]} y={p(95, -155)[1]} text="PAHIT" at={at + 12} size={Math.round(26 * s)} color={C.red} rotate={2} />
      {sweet.map(([lx, ly], i) => {
        const [sx, sy] = p(lx, ly);
        return <SketchPath key={`s${i}`} d={circPath(sx, sy, 16 * s)} fill={lerpColor(C.yellow, '#F0E6D2', sweetDim)} color={C.ink} width={3} at={at + 10} dur={8} seed={seed + 10 + i} double={false} />;
      })}
      {bitter.map(([lx, ly], i) => {
        const [sx, sy] = p(lx, ly);
        return <SketchPath key={`b${i}`} d={circPath(sx, sy, (16 * bitterS) * s)} fill={lerpColor('#EFC9C9', C.red, bitterLit)} color={C.ink} width={3} at={at + 10} dur={8} seed={seed + 20 + i} double={false} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ aset 5 · membran sel
/** Lapisan lemak membran: dua baris kepala lipid + ekor, retak merah di tengah, gelembung SLS.
 *  `crack` 0..1 (retak muncul), `sls` 0..1 (gelembung SLS muncul), `slsAt` = frame gelembung mulai tergambar. */
export const Membrane: React.FC<{
  x: number; y: number; s?: number; t?: number; crack?: number; sls?: number; slsAt?: number; at?: number; seed?: number;
}> = ({ x, y, s = 1, t = 1, crack = 0, sls = 0, slsAt, at = 0, seed = 61 }) => {
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t));
  const xs = [-300, -225, -150, -75, 0, 75, 150, 225, 300];
  return (
    <g opacity={Math.min(1, t)}>
      {xs.map((lx, i) => (
        <g key={i}>
          <SketchPath d={line(p(lx, -46), p(lx, -8))} at={at + i} dur={6} width={4} color={C.ink} seed={seed + i} double={false} />
          <SketchPath d={line(p(lx, 8), p(lx, 46))} at={at + i} dur={6} width={4} color={C.ink} seed={seed + i} double={false} />
        </g>
      ))}
      {xs.map((lx, i) => {
        const [hx, hy] = p(lx, -70);
        const [hx2, hy2] = p(lx, 70);
        return (
          <g key={`h${i}`}>
            <SketchPath d={circPath(hx, hy, 24 * s)} fill={C.yellow} color={C.ink} width={4} at={at + i} dur={8} seed={seed + 20 + i} double={false} />
            <SketchPath d={circPath(hx2, hy2, 24 * s)} fill={C.yellow} color={C.ink} width={4} at={at + i} dur={8} seed={seed + 30 + i} double={false} />
          </g>
        );
      })}
      {crack > 0.02 ? (
        <g opacity={crack}>
          <Hatch d={`M${fmt(p(-140, -120))} L${fmt(p(140, -120))} L${fmt(p(140, 120))} L${fmt(p(-140, 120))} Z`} box={[x - 140 * s, y - 120 * s, 280 * s, 240 * s]} angle={45} gap={18} color={C.red} width={4} seed={seed + 9} at={0} dur={10} outline={false} />
          <SketchPath d={line(p(-42, -42), p(42, 42))} at={0} dur={8} width={9} color={C.red} seed={seed + 10} />
          <SketchPath d={line(p(42, -42), p(-42, 42))} at={0} dur={8} width={9} color={C.red} seed={seed + 10} />
        </g>
      ) : null}
      {sls > 0.02 ? (
        <SketchPath d={circPath(p(0, -170)[0], p(0, -170)[1], 30 * s)} fill={C.white} color={C.blue} width={5} at={slsAt ?? at} dur={10} seed={seed + 40} double={false} />
      ) : null}
      {sls > 0.5 ? <SketchText x={p(0, -170)[0]} y={p(0, -170)[1]} text="SLS" size={Math.round(28 * s)} color={C.blue} rotate={0} /> : null}
    </g>
  );
};

// ------------------------------------------------------------------ aset 6 · timbangan rasa
/** Neraca manis vs pahit. `tilt` derajat (positif = sisi pahit turun). */
export const Scale: React.FC<{
  x: number; y: number; s?: number; t?: number; tilt?: number; at?: number; seed?: number;
}> = ({ x, y, s = 1, t = 1, tilt = 0, at = 0, seed = 71 }) => {
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t));
  const beam = xf(x, y - 40 * s, s * (0.85 + 0.15 * t), tilt);
  const pan = (lx: number, fill: string) => {
    const [bx, by] = beam(lx, 78);
    return (
      <g key={lx}>
        <SketchPath d={line(beam(lx, 0), beam(lx, 78))} at={at} dur={8} width={5} color={C.ink} seed={seed} double={false} />
        <SketchPath d={`M${fmt([bx - 70 * s, by])} Q${fmt([bx, by + 52 * s])} ${fmt([bx + 70 * s, by])} Z`} fill={fill} color={C.ink} width={4} at={at} dur={8} seed={seed + 5} double={false} />
      </g>
    );
  };
  return (
    <g opacity={Math.min(1, t)}>
      <SketchPath d={line(p(0, -40), p(0, 150))} at={at} dur={8} width={10} color={C.ink} seed={seed} double={false} />
      <SketchPath d={line(p(-95, 150), p(95, 150))} at={at} dur={8} width={10} color={C.ink} seed={seed + 1} double={false} />
      <SketchPath d={line(beam(-260, 0), beam(260, 0))} at={at + 4} dur={10} width={10} color={C.ink} seed={seed + 2} double={false} />
      {pan(-260, C.yellow)}
      {pan(260, C.red)}
      <SketchText x={beam(-260, 118)[0]} y={beam(-260, 118)[1]} text="MANIS" size={Math.round(38 * s)} color={C.ink} at={at + 8} rotate={-1} />
      <SketchText x={beam(260, 118)[0]} y={beam(260, 118)[1]} text="PAHIT" size={Math.round(38 * s)} color={C.red} at={at + 8} rotate={1} />
    </g>
  );
};

// ------------------------------------------------------------------ aset 7 · kartu studi
/** Kartu studi: stempel 1980, TV tabung, 7 ikon orang, 4 cangkir rasa.
 *  `stampT`/`peopleT`/`cupsT` = progress masuk (0..1); `swapT` = label asam berubah SEGAR→PAHIT;
 *  `stampAt` = frame stempel mulai tergambar; `cupsAt` = frame tiap cangkir muncul (mengikuti cue kata
 *  rasa — bila diisi, menggantikan `cupsT`). */
export const StudyCard: React.FC<{
  x: number; y: number; s?: number; t?: number; stampT?: number; peopleT?: number; cupsT?: number; swapT?: number; stampAt?: number; at?: number; seed?: number; cupsAt?: number[];
}> = ({ x, y, s = 1, t = 1, stampT = 0, peopleT = 0, cupsT = 0, swapT = 0, stampAt, at = 0, seed = 81, cupsAt }) => {
  const f = useCurrentFrame();
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t));
  const rect = `M${fmt(p(-380, -280))} L${fmt(p(380, -280))} Q${fmt(p(404, -280))} ${fmt(p(404, -256))} L${fmt(p(404, 256))} Q${fmt(p(404, 280))} ${fmt(p(380, 280))} L${fmt(p(-380, 280))} Q${fmt(p(-404, 280))} ${fmt(p(-404, 256))} L${fmt(p(-404, -256))} Q${fmt(p(-404, -280))} ${fmt(p(-380, -280))} Z`;
  const peopleX = [-280, -187, -93, 0, 93, 187, 280];
  const cups: { lx: number; label: string; color: string }[] = [
    { lx: -270, label: 'manis', color: C.yellow },
    { lx: -90, label: 'asin', color: C.white },
    { lx: 90, label: 'asam', color: C.orange },
    { lx: 270, label: 'pahit', color: C.red },
  ];
  const nPeople = Math.floor(peopleT * 7 + 0.0001);
  const nCups = cupsAt ? cupsAt.filter((cf) => f >= cf).length : Math.floor(cupsT * 4 + 0.0001);
  /** Putar titik lokal (lx, ly) −8° mengelilingi pusat stempel (235, −185), lalu ke koordinat layar. */
  const rot = (lx: number, ly: number) => {
    const a = (-8 * Math.PI) / 180;
    const dx = lx - 235;
    const dy = ly + 185;
    return p(235 + dx * Math.cos(a) - dy * Math.sin(a), -185 + dx * Math.sin(a) + dy * Math.cos(a));
  };
  return (
    <g opacity={Math.min(1, t)}>
      <SketchPath d={rect} fill={C.white} at={at} dur={16} seed={seed} double={false} />
      {/* TV tabung CRT (pembanding 1980) — digambar ulang supaya jelas terbaca sebagai TV: bodi lebih
          besar, antena V di atas, layar berisi gambar (matahari + bukit), kolom tombol di kanan, alas di
          bawah. Tetap di dalam kartu, tidak menabrak stempel 1980 / 7 ikon orang. */}
      <SketchPath
        d={`M${fmt(p(-350, -240))} L${fmt(p(-160, -240))} Q${fmt(p(-140, -240))} ${fmt(p(-140, -220))} L${fmt(p(-140, -120))} Q${fmt(p(-140, -100))} ${fmt(p(-160, -100))} L${fmt(p(-350, -100))} Q${fmt(p(-370, -100))} ${fmt(p(-370, -120))} L${fmt(p(-370, -220))} Q${fmt(p(-370, -240))} ${fmt(p(-350, -240))} Z`}
        fill="#EDEDE6" at={at + 8} dur={10} width={6} color={C.ink} seed={seed + 1} double={false}
      />
      {/* antena V + ujung antena — ujung 15 unit (18 px) di bawah border atas kartu (-280)
          supaya TV tidak tampak "menggantung" di tepi kartu (putaran 2 review) */}
      <SketchPath d={line(p(-330, -240), p(-370, -265))} at={at + 10} dur={6} width={5} color={C.ink} seed={seed + 2} />
      <SketchPath d={line(p(-180, -240), p(-140, -265))} at={at + 10} dur={6} width={5} color={C.ink} seed={seed + 2} />
      <SketchPath d={circPath(p(-370, -265)[0], p(-370, -265)[1], 5 * s)} fill={C.ink} color={C.ink} width={3} at={at + 12} dur={4} seed={seed + 2} double={false} />
      <SketchPath d={circPath(p(-140, -265)[0], p(-140, -265)[1], 5 * s)} fill={C.ink} color={C.ink} width={3} at={at + 12} dur={4} seed={seed + 2} double={false} />
      {/* layar + isi layar (matahari + bukit) */}
      <SketchPath d={`M${fmt(p(-355, -228))} L${fmt(p(-255, -228))} L${fmt(p(-255, -112))} L${fmt(p(-355, -112))} Z`} fill="#CFE8F5" at={at + 10} dur={10} width={4} color={C.ink} seed={seed + 3} double={false} />
      <SketchPath d={circPath(p(-325, -195)[0], p(-325, -195)[1], 13 * s)} fill={C.yellow} color={C.ink} width={3} at={at + 14} dur={6} seed={seed + 3} double={false} />
      <SketchPath d={line(p(-355, -155), p(-255, -155))} at={at + 14} dur={6} width={4} color={C.ink} seed={seed + 4} />
      <SketchPath d={`M${fmt(p(-355, -112))} L${fmt(p(-355, -140))} Q${fmt(p(-305, -168))} ${fmt(p(-255, -140))} L${fmt(p(-255, -112))} Z`} fill={C.green} at={at + 16} dur={8} width={3} color={C.ink} seed={seed + 4} double={false} />
      {/* kolom tombol: lampu daya + 2 kenop + gril speaker */}
      <SketchPath d={circPath(p(-200, -215)[0], p(-200, -215)[1], 5 * s)} fill={C.red} color={C.ink} width={3} at={at + 12} dur={4} seed={seed + 5} double={false} />
      <SketchPath d={circPath(p(-200, -195)[0], p(-200, -195)[1], 11 * s)} fill={C.white} color={C.ink} width={4} at={at + 12} dur={6} seed={seed + 5} double={false} />
      <SketchPath d={circPath(p(-200, -160)[0], p(-200, -160)[1], 11 * s)} fill={C.white} color={C.ink} width={4} at={at + 12} dur={6} seed={seed + 5} double={false} />
      <SketchPath d={line(p(-225, -135), p(-175, -135))} at={at + 14} dur={4} width={4} color={C.ink} seed={seed + 6} />
      <SketchPath d={line(p(-225, -125), p(-175, -125))} at={at + 14} dur={4} width={4} color={C.ink} seed={seed + 6} />
      <SketchPath d={line(p(-225, -115), p(-175, -115))} at={at + 14} dur={4} width={4} color={C.ink} seed={seed + 6} />
      {/* alas TV */}
      <SketchPath d={`M${fmt(p(-340, -100))} L${fmt(p(-170, -100))} L${fmt(p(-170, -88))} L${fmt(p(-340, -88))} Z`} fill="#D8D8CE" at={at + 10} dur={8} width={4} color={C.ink} seed={seed + 7} double={false} />
      {/* stempel 1980 */}
      {stampT > 0.02 ? (
        <g>
          <SketchPath
            d={`M${fmt(rot(130, -227))} L${fmt(rot(340, -227))} L${fmt(rot(340, -143))} L${fmt(rot(130, -143))} Z`}
            color={C.red} width={6} at={stampAt ?? at} dur={10} seed={seed + 4} double={false}
          />
          <SketchText x={p(235, -185)[0]} y={p(235, -185)[1]} text="1980" at={stampAt ?? at} size={Math.round(76 * s)} color={C.red} rotate={-8} />
        </g>
      ) : null}
      {/* 7 relawan */}
      {peopleX.slice(0, nPeople).map((lx, i) => {
        const [hx, hy] = p(lx, -60);
        const [bx, by] = p(lx, -10);
        return (
          <g key={i}>
            <SketchPath d={circPath(hx, hy, 17 * s)} fill={C.green} color={C.ink} width={3} at={at} dur={8} seed={seed + 10 + i} double={false} />
            <SketchPath d={`M${fmt([bx - 26 * s, by + 26 * s])} Q${fmt([bx, by - 18 * s])} ${fmt([bx + 26 * s, by + 26 * s])} Z`} fill={C.green} color={C.ink} width={3} at={at} dur={8} seed={seed + 20 + i} double={false} />
          </g>
        );
      })}
      {peopleT > 0.9 ? <SketchText x={x} y={y + 52 * s} text="seisi meja makan" size={Math.round(38 * s)} color={C.ink} rotate={-1} /> : null}
      {/* 4 cangkir rasa */}
      {cups.slice(0, nCups).map(({ lx, label, color }, i) => {
        const [gx, gy] = p(lx, 150);
        const isAcid = label === 'asam';
        const swapped = isAcid && swapT > 0.5;
        const showLabel = isAcid ? (swapped ? 'PAHIT' : 'SEGAR') : label;
        const labelColor = swapped ? C.red : C.ink;
        // label hasil swap dibuat gaya stempel (lebih besar, merah, miring) supaya tidak
        // terbaca sebagai duplikat cangkir ke-4 "pahit"; ISI cangkir asam ikut berubah
        // oranye→merah bersamaan dengan swap label (putaran 2 review) — transformasi asam
        // jadi pahit kini terbaca dari warna isi + label + panah merah, bukan label saja
        const labelSize = swapped ? Math.round(36 * s) : Math.round(30 * s);
        const labelRot = swapped ? -8 : 0;
        const cupFill = isAcid ? lerpColor(C.orange, C.red, swapT) : color;
        const cupAt = cupsAt ? cupsAt[i] : at;
        return (
          <g key={i}>
            <SketchPath d={`M${fmt([gx - 34 * s, gy - 44 * s])} L${fmt([gx - 26 * s, gy + 44 * s])} L${fmt([gx + 26 * s, gy + 44 * s])} L${fmt([gx + 34 * s, gy - 44 * s])} Z`} fill={cupFill} color={C.ink} width={4} at={cupAt} dur={8} seed={seed + 30 + i} double={false} />
            <SketchText x={gx} y={gy + 78 * s} text={showLabel} at={cupAt} size={labelSize} color={labelColor} rotate={labelRot} />
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ aset 8 · timer
/** Jam efek sementara: lingkaran + jarum + busur hijau. `exitAt` = frame mulai memudar keluar. */
export const Timer: React.FC<{ x: number; y: number; s?: number; t?: number; at?: number; exitAt?: number; seed?: number }> = ({ x, y, s = 1, t = 1, at = 0, exitAt, seed = 91 }) => {
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t));
  const circ = `M${fmt(p(-130, 0))} A${(130 * s).toFixed(1)} ${(130 * s).toFixed(1)} 0 1 1 ${fmt(p(130, 0))} A${(130 * s).toFixed(1)} ${(130 * s).toFixed(1)} 0 1 1 ${fmt(p(-130, 0))} Z`;
  const arc = `M${fmt(p(0, -152))} A${(152 * s).toFixed(1)} ${(152 * s).toFixed(1)} 0 1 1 ${fmt(p(-152, 0))}`;
  return (
    <g opacity={Math.min(1, t)}>
      <SketchPath d={circ} at={at} dur={12} width={8} color={C.ink} seed={seed} double={false} exitAt={exitAt} />
      <SketchPath d={arc} at={at + 4} dur={10} width={6} color={C.green} seed={seed + 3} double={false} exitAt={exitAt} />
      <SketchPath d={line(p(0, 0), p(0, -72))} at={at + 6} dur={6} width={8} color={C.ink} seed={seed + 1} exitAt={exitAt} />
      <SketchPath d={line(p(0, 0), p(52, 22))} at={at + 6} dur={6} width={8} color={C.orange} seed={seed + 2} exitAt={exitAt} />
      <SketchText x={x} y={y + 196 * s} text="sementara" at={at} exitAt={exitAt} size={Math.round(40 * s)} color={C.ink} rotate={-1} />
    </g>
  );
};

// ------------------------------------------------------------------ aset 9 · centang hijau
/** Centang hijau (solusi). */
export const Check: React.FC<{ x: number; y: number; s?: number; t?: number; at?: number; seed?: number }> = ({ x, y, s = 1, t = 1, at = 0, seed = 101 }) => {
  if (t <= 0) return null;
  const p = xf(x, y, s * (0.85 + 0.15 * t));
  const circ = `M${fmt(p(-42, 0))} A${(42 * s).toFixed(1)} ${(42 * s).toFixed(1)} 0 1 1 ${fmt(p(42, 0))} A${(42 * s).toFixed(1)} ${(42 * s).toFixed(1)} 0 1 1 ${fmt(p(-42, 0))} Z`;
  return (
    <g opacity={Math.min(1, t)}>
      <SketchPath d={circ} fill={C.green} at={at} dur={10} seed={seed} double={false} />
      <SketchPath d={line(p(-20, 0), p(-6, 16))} at={at + 6} dur={6} width={9} color={C.white} seed={seed + 1} />
      <SketchPath d={line(p(-6, 16), p(22, -16))} at={at + 6} dur={6} width={9} color={C.white} seed={seed + 1} />
    </g>
  );
};

// ------------------------------------------------------------------ aset 10 · papan dapur pagi
/** Backdrop papan tulis polos (revisi 2026-11-14: jendela sketsa + matahari + ubin bawah dihapus atas perintah Ridwan — jendela terbaca sebagai tabel/kalender dan muncul di semua frame; papan dibiarkan bersih). */
export const Board: React.FC = () => (
  <>
    <BoardSurface variant="whiteboard" />
  </>
);
