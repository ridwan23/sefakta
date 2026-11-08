import React from 'react';
import { Easing, Img, interpolate, staticFile } from 'remotion';
import { FONT_JAKARTA } from '../../shared/brand/fonts';
import { hash } from '../../shared/motion';
import { HEAD_OUTLINE } from './headContour';

// Gaya "studio akustik malam" (visualStyle di briefs/suara-rekaman-v2.json).
// Koordinat dunia = piksel ilustrasi public/suara-rekaman-v2/img/mekanisme.jpg (1242×2208), kepala di kiri,
// ponsel di tengah, pendengar (kepala dicerminkan) di kanan. Kamera (src/shared/camera) menjelajahi dunia ini.
export const C = {
  bg: '#0A1326',
  bgDeep: '#050A18',
  head: '#16284A',
  air: '#5CD6FF', // jalur udara: garis penuh
  bone: '#FFB000', // jalur tulang: titik-titik
  alert: '#FF6B81',
  text: '#F4F1EA',
  dim: 'rgba(244,241,234,0.55)',
};
export const SANS = FONT_JAKARTA;

export const ramp = (f: number, at: number, len: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const pop = (f: number, at: number, len = 12) => ramp(f, at, len, Easing.out(Easing.back(1.8)));

// ------------------------------------------------------------------ titik anatomi (diukur dari ilustrasi)
export type Pt = [number, number];
export const P = {
  mouth: [1100, 1150] as Pt,
  earCanal: [545, 945] as Pt,
  cochlea: [726, 964] as Pt,
  larynx: [710, 1320] as Pt,
  teeth: [1000, 1110] as Pt,
};
export const PLATE = { w: 1242, h: 2208, src: 'suara-rekaman-v2/img/mekanisme.jpg' };
export const PHONE = { x: 1600, y: 1050, w: 330, h: 660 }; // pusat
export const MIC: Pt = [PHONE.x, PHONE.y + PHONE.h / 2 - 34];
export const MIRROR_X = 3300; // pendengar = kepala dicerminkan terhadap x = MIRROR_X / 2
export const LISTENER_EAR: Pt = [MIRROR_X - P.earCanal[0], P.earCanal[1]];
export const EQ_HEAD = { x: 640, y: 110 };
export const EQ_REC = { x: PHONE.x, y: 470 };

// ------------------------------------------------------------------ lintasan Bézier dengan titik-pada-panjang
type Seg = [Pt, Pt, Pt]; // c1, c2, akhir
export type Track = { d: string; at: (u: number) => Pt; len: number };
const cubic = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const m = 1 - t;
  return [m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0], m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1]];
};
export const track = (start: Pt, segs: Seg[]): Track => {
  const pts: Pt[] = [start];
  let prev = start;
  for (const [c1, c2, e] of segs) {
    for (let i = 1; i <= 60; i++) pts.push(cubic(prev, c1, c2, e, i / 60));
    prev = e;
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const len = cum[cum.length - 1];
  const at = (u: number): Pt => {
    const target = Math.max(0, Math.min(1, u)) * len;
    let i = 1;
    while (i < cum.length - 1 && cum[i] < target) i++;
    const k = (target - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
  };
  const d = `M ${start[0]} ${start[1]} ` + segs.map(([a, b, c]) => `C ${a[0]} ${a[1]} ${b[0]} ${b[1]} ${c[0]} ${c[1]}`).join(' ');
  return { d, at, len };
};

/** Udara: dari mulut, memutar di atas kepala, masuk ke lubang telinga. */
export const AIR = track(P.mouth, [
  [[1400, 1100], [1480, 560], [1180, 360]],
  [[920, 170], [470, 140], [260, 400]],
  [[120, 580], [300, 930], P.earCanal],
]);
/** Tulang: dari laring lewat rahang ke rumah siput; cabang kedua dari gigi/rahang atas. */
export const BONE = track(P.larynx, [
  [[780, 1250], [830, 1130], [800, 1050]],
  [[780, 1000], [760, 970], P.cochlea],
]);
export const BONE2 = track(P.teeth, [[[930, 1070], [830, 1000], P.cochlea]]);
/** Udara ke mikrofon ponsel, dan udara ke telinga pendengar (lewat bawah ponsel). */
export const TO_MIC = track(P.mouth, [[[1260, 1220], [1400, 1400], MIC]]);
export const TO_LISTENER = track(P.mouth, [[[1600, 1640], [2200, 1640], LISTENER_EAR]]);

/** Garis udara (penuh) yang tergambar 0→`draw`, dengan denyut terang pada `pulse` (0..1) bila ada. */
export const AirLine: React.FC<{ t: Track; draw: number; pulse?: number | null; width?: number; o?: number; color?: string }> = ({ t, draw, pulse = null, width = 12, o = 1, color = C.air }) => {
  if (draw <= 0 || o <= 0) return null;
  const p = pulse === null ? null : t.at(pulse);
  return (
    <g opacity={o}>
      <path d={t.d} pathLength={1} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={width * 2.6} strokeLinecap="round" strokeDasharray={`${draw} 1`} />
      <path d={t.d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={`${draw} 1`} />
      {p ? (
        <g>
          <circle cx={p[0]} cy={p[1]} r={width * 3.2} fill={color} opacity={0.25} />
          <circle cx={p[0]} cy={p[1]} r={width * 1.6} fill="#FFFFFF" />
        </g>
      ) : null}
    </g>
  );
};

/** Garis tulang: deretan titik yang bergetar (bentuk beda dari garis udara, bukan hanya warna). */
export const BoneDots: React.FC<{ t: Track; draw: number; f: number; pulse?: number | null; size?: number; o?: number }> = ({ t, draw, f, pulse = null, size = 9, o = 1 }) => {
  if (draw <= 0 || o <= 0) return null;
  const n = Math.max(2, Math.round(t.len / 30));
  const dots = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    if (u > draw) break;
    const [x, y] = t.at(u);
    const near = pulse === null ? 0 : Math.max(0, 1 - Math.abs(u - pulse) * 9);
    const wob = Math.sin(f * 0.45 - i * 0.9);
    dots.push(<circle key={i} cx={x + wob * 2.5} cy={y - wob * 2.5} r={size * (1 + 0.25 * wob + 1.1 * near)} fill={near > 0.3 ? '#FFFFFF' : C.bone} />);
  }
  return (
    <g opacity={o} style={{ filter: `drop-shadow(0 0 ${size}px ${C.bone})` }}>
      {dots}
    </g>
  );
};

/** Gelombang melingkar yang memancar (mulut bicara, ponsel, getaran tulang). */
export const Rings: React.FC<{ at: Pt; f: number; o: number; color: string; maxR?: number; count?: number; period?: number; width?: number; dashed?: boolean; arc?: [number, number] }> = ({ at, f, o, color, maxR = 220, count = 3, period = 36, width = 6, dashed = false, arc }) => {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      {Array.from({ length: count }, (_, i) => {
        const k = ((f / period + i / count) % 1 + 1) % 1;
        const r = 30 + k * (maxR - 30);
        const op = (1 - k) * 0.9;
        if (arc) {
          const [a0, a1] = arc.map((d) => (d * Math.PI) / 180);
          const p0 = [at[0] + r * Math.cos(a0), at[1] + r * Math.sin(a0)];
          const p1 = [at[0] + r * Math.cos(a1), at[1] + r * Math.sin(a1)];
          return <path key={i} d={`M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={op} strokeDasharray={dashed ? '4 14' : undefined} />;
        }
        return <circle key={i} cx={at[0]} cy={at[1]} r={r} fill="none" stroke={color} strokeWidth={width} opacity={op} strokeDasharray={dashed ? '4 14' : undefined} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ kepala
const HEAD_D = `M ${HEAD_OUTLINE.map((p) => p.join(' ')).join(' L ')} Z`;
const EAR_D = 'M 575 830 C 500 790 440 840 438 915 C 436 990 470 1045 530 1055 C 560 1060 575 1040 565 1015 C 545 985 520 990 520 960';
const EAR_IN_D = 'M 548 880 C 505 868 482 900 490 940';

/** Siluet kepala (kontur dari ilustrasi), rim cyan, bawah memudar. `mirror` = pendengar menghadap kiri. */
export const Head: React.FC<{ id: string; mirror?: boolean; o?: number; rim?: string; earGlow?: number; f?: number }> = ({ id, mirror = false, o = 1, rim = C.air, earGlow = 0, f = 0 }) => (
  <g opacity={o} transform={mirror ? `translate(${MIRROR_X} 0) scale(-1 1)` : undefined}>
    <defs>
      <linearGradient id={`hf${id}`} x1={0} y1={300} x2={0} y2={1800} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#1B3158" />
        <stop offset="0.75" stopColor={C.head} />
        <stop offset="1" stopColor={C.head} stopOpacity={0} />
      </linearGradient>
      <linearGradient id={`hs${id}`} x1={0} y1={1450} x2={0} y2={1790} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={rim} />
        <stop offset="1" stopColor={rim} stopOpacity={0} />
      </linearGradient>
    </defs>
    <path d={HEAD_D} fill={`url(#hf${id})`} />
    <path d={HEAD_D} fill="none" stroke={`url(#hs${id})`} strokeOpacity={0.3} strokeWidth={26} strokeLinejoin="round" />
    <path d={HEAD_D} fill="none" stroke={`url(#hs${id})`} strokeWidth={7} strokeLinejoin="round" />
    <path d={EAR_D} fill="none" stroke={rim} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
    <path d={EAR_IN_D} fill="none" stroke={rim} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
    <circle cx={P.earCanal[0]} cy={P.earCanal[1]} r={16} fill={C.bgDeep} stroke={rim} strokeWidth={4} />
    {earGlow > 0 ? <circle cx={P.earCanal[0]} cy={P.earCanal[1]} r={34 + 10 * Math.sin(f / 4)} fill={rim} opacity={0.35 * earGlow} /> : null}
    {/* garis bibir */}
    <path d="M 1052 1150 L 1100 1152" stroke={rim} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
  </g>
);

/** Ilustrasi AI (penampang x-ray) yang terungkap oleh pemindai sampai `scanX` (koordinat dunia). */
export const XrayPlate: React.FC<{ scanX: number; o?: number }> = ({ scanX, o = 1 }) =>
  scanX <= 0 || o <= 0 ? null : (
    // tepi kanan & bawah gambar dipudarkan supaya batas kotaknya tidak terlihat; pemindai memotong dari kanan
    <div style={{ position: 'absolute', left: 0, top: 0, width: PLATE.w, height: PLATE.h, opacity: o, clipPath: `inset(0 ${Math.max(0, PLATE.w - scanX)}px 0 0)`, WebkitMaskImage: 'linear-gradient(to right, #000 1190px, transparent 1242px)', maskImage: 'linear-gradient(to right, #000 1190px, transparent 1242px)' }}>
      <Img
        src={staticFile(PLATE.src)}
        style={{
          width: PLATE.w,
          height: PLATE.h,
          WebkitMaskImage: 'linear-gradient(to bottom, #000 1580px, transparent 1800px)',
          maskImage: 'linear-gradient(to bottom, #000 1580px, transparent 1800px)',
        }}
      />
    </div>
  );

// ------------------------------------------------------------------ ponsel
export const Phone: React.FC<{ f: number; play: number; check?: number; rec?: number; o?: number }> = ({ f, play, check = 0, rec = 0, o = 1 }) => {
  const { x, y, w, h } = PHONE;
  const L = x - w / 2, T = y - h / 2;
  const bars = 22;
  return (
    <g opacity={o}>
      <rect x={L - 6} y={T - 6} width={w + 12} height={h + 12} rx={52} fill="none" stroke={C.air} strokeOpacity={0.18} strokeWidth={20} />
      <rect x={L} y={T} width={w} height={h} rx={46} fill="#0D1A33" stroke="#9FB4D8" strokeWidth={7} />
      <rect x={L + 22} y={T + 70} width={w - 44} height={h - 150} rx={22} fill="#071022" />
      <rect x={x - 40} y={T + 30} width={80} height={12} rx={6} fill="#2A3B5E" />
      <text x={x} y={T + 168} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} fill={C.dim}>
        suaraku.m4a
      </text>
      {Array.from({ length: bars }, (_, i) => {
        const bx = L + 46 + i * ((w - 92) / (bars - 1));
        const amp = (0.25 + 0.75 * hash(i * 3.7)) * (0.55 + 0.45 * Math.abs(Math.sin(f * 0.32 + i * 1.3))) * play + 0.06;
        const played = i / bars < ((f / 150) % 1) * play;
        return <line key={i} x1={bx} x2={bx} y1={y - 30 - amp * 120} y2={y - 30 + amp * 120} stroke={played ? C.air : '#3C5583'} strokeWidth={8} strokeLinecap="round" />;
      })}
      {/* tombol putar */}
      <circle cx={x} cy={y + 175} r={46} fill={C.air} opacity={0.9} />
      {play > 0.5 ? (
        <g fill="#071022">
          <rect x={x - 16} y={y + 155} width={11} height={40} rx={3} />
          <rect x={x + 5} y={y + 155} width={11} height={40} rx={3} />
        </g>
      ) : (
        <path d={`M ${x - 12} ${y + 152} L ${x + 20} ${y + 175} L ${x - 12} ${y + 198} Z`} fill="#071022" />
      )}
      {/* mikrofon */}
      <circle cx={MIC[0]} cy={MIC[1]} r={9} fill="#9FB4D8" />
      {rec > 0 ? (
        <g opacity={rec}>
          <circle cx={L + w - 52} cy={T + 98} r={13} fill={C.alert} opacity={0.6 + 0.4 * Math.sin(f / 5)} />
          <text x={L + w - 74} y={T + 107} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={26} fill={C.alert}>
            REC
          </text>
        </g>
      ) : null}
      {check > 0 ? (
        <g transform={`translate(${L + w - 10} ${T + 10}) scale(${check})`}>
          <circle r={58} fill="#1FBF8F" stroke="#071022" strokeWidth={8} />
          <path d="M -26 2 L -7 22 L 28 -18" fill="none" stroke="#FFFFFF" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
    </g>
  );
};

// ------------------------------------------------------------------ equalizer (kualitatif, tanpa angka)
const BANDS = 6;
export const EqPanel: React.FC<{ at: { x: number; y: number }; title: string; levels: number[]; ghost?: number[]; cut?: number; o: number; f: number; color: string }> = ({ at, title, levels, ghost, cut = 0, o, f, color }) => {
  if (o <= 0) return null;
  const W = 600, H = 330, L = at.x - W / 2, T = at.y - H / 2;
  const bw = 62, gap = (W - 80 - BANDS * bw) / (BANDS - 1);
  return (
    <g opacity={o}>
      <rect x={L} y={T} width={W} height={H} rx={30} fill="#0D1A33" fillOpacity={0.92} stroke={color} strokeOpacity={0.6} strokeWidth={4} />
      <text x={at.x} y={T + 62} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={48} letterSpacing={3} fill={C.text}>
        {title}
      </text>
      {levels.map((lv, i) => {
        const bx = L + 40 + i * (bw + gap);
        const base = T + H - 64;
        const live = lv * (0.9 + 0.1 * Math.sin(f * 0.5 + i));
        const g = ghost?.[i] ?? 0;
        return (
          <g key={i}>
            {g > lv ? <rect x={bx} y={base - g * 170} width={bw} height={g * 170} rx={10} fill="none" stroke={C.alert} strokeWidth={4} strokeDasharray="10 8" opacity={cut} /> : null}
            <rect x={bx} y={base - live * 170} width={bw} height={live * 170} rx={10} fill={i < 2 ? C.bone : color} />
          </g>
        );
      })}
      <text x={L + 40} y={T + H - 22} fontFamily={SANS} fontWeight={700} fontSize={30} fill={C.dim}>
        rendah
      </text>
      <text x={L + W - 40} y={T + H - 22} textAnchor="end" fontFamily={SANS} fontWeight={700} fontSize={30} fill={C.dim}>
        tinggi
      </text>
    </g>
  );
};

/** Tangan (telapak) yang menutup telinga. */
export const Hand: React.FC<{ x: number; y: number; rot: number; o: number }> = ({ x, y, rot, o }) =>
  o <= 0 ? null : (
    <g opacity={o} transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[-78, -26, 26, 78].map((fx, i) => (
        <rect key={i} x={fx - 22} y={-250 + Math.abs(fx) * 0.5 - (i === 1 || i === 2 ? 30 : 0)} width={44} height={190} rx={22} fill="#20375F" stroke={C.text} strokeWidth={6} />
      ))}
      <rect x={-110} y={-110} width={220} height={240} rx={80} fill="#20375F" stroke={C.text} strokeWidth={6} />
      <rect x={-150} y={-40} width={70} height={150} rx={35} fill="#20375F" stroke={C.text} strokeWidth={6} transform="rotate(-30 -115 35)" />
    </g>
  );

/** Label dunia (teks pendek ≤ 4 kata). */
export const WLabel: React.FC<{ x: number; y: number; text: string; o: number; size?: number; color?: string }> = ({ x, y, text, o, size = 44, color = C.text }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * o})`, opacity: o, fontFamily: SANS, fontWeight: 800, fontSize: size, color, letterSpacing: size * 0.06, whiteSpace: 'pre', textAlign: 'center', textShadow: `0 0 18px ${C.bg}, 0 0 6px ${C.bg}` }}>
      {text}
    </div>
  );

// ------------------------------------------------------------------ lapisan parallax
/** Latar jauh (depth ~0,25): kisi titik dan cincin akustik samar. */
export const FarField: React.FC = () => (
  <svg width={3000} height={2600} viewBox="-1000 -800 3000 2600" style={{ position: 'absolute', left: -1000, top: -800, overflow: 'visible' }}>
    <defs>
      <pattern id="sr2dots" width={46} height={46} patternUnits="userSpaceOnUse">
        <circle cx={23} cy={23} r={2.6} fill="#5CD6FF" opacity={0.16} />
      </pattern>
      <radialGradient id="sr2glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#1A3266" stopOpacity={0.55} />
        <stop offset="1" stopColor="#1A3266" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-1000} y={-800} width={3000} height={2600} fill="url(#sr2dots)" />
    <circle cx={250} cy={300} r={700} fill="url(#sr2glow)" />
    <circle cx={700} cy={250} r={600} fill="url(#sr2glow)" />
    {[260, 420, 580, 740].map((r) => <circle key={r} cx={330} cy={260} r={r} fill="none" stroke="#5CD6FF" strokeOpacity={0.07} strokeWidth={3} />)}
  </svg>
);

/** Partikel depan (depth > 1, buram): bokeh yang melayang. */
export const NearDust: React.FC<{ f: number }> = ({ f }) => (
  <svg width={4600} height={3200} viewBox="-400 -200 4600 3200" style={{ position: 'absolute', left: -400, top: -200, overflow: 'visible' }}>
    {Array.from({ length: 26 }, (_, i) => {
      const x = -200 + hash(i * 1.7) * 4300 + Math.sin(f / 60 + i) * 30;
      const y = 100 + hash(i * 3.1) * 2700 - ((f * (0.4 + hash(i) * 0.6)) % 400);
      return <circle key={i} cx={x} cy={y} r={14 + hash(i * 5.3) * 30} fill={i % 3 === 0 ? C.bone : C.air} opacity={0.12 + hash(i * 7.7) * 0.14} />;
    })}
  </svg>
);
