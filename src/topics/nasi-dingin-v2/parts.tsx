import React from 'react';
import { AbsoluteFill, Easing, interpolate, interpolateColors } from 'remotion';
import { FONT_JAKARTA } from '../../shared/brand/fonts';
import { hash } from '../../shared/motion';

// Gaya "Mikroskop malam: dari kulkas ke rantai pati" (visualStyle di briefs/nasi-dingin-v2.json).
// Bentuk membedakan makna, bukan hanya warna:
//   pati panas = garis bergelombang longgar · pati dingin = berkas garis lurus rapat + kisi (kristal)
//   gula = heksagon kuning · enzim = lingkaran bermulut (cyan)
//   kurva nasi baru matang = garis PENUH jingga · kurva nasi dari kulkas = garis PUTUS-PUTUS biru es
export const C = {
  bg: '#081736', // Biru Malam
  bg2: '#0D2250', // Biru SeFakta
  card: 'rgba(13,34,80,0.88)',
  line: 'rgba(156,200,255,0.28)',
  cream: '#F4E9D2', // pati panas, nasi
  sugar: '#FFB000', // Kuning Fakta: gula (satu penekanan)
  enzyme: '#4FD1E8',
  hot: '#FF8A3D',
  ice: '#9CC8FF',
  bad: '#FF5A5F',
  ok: '#3DDC97',
  text: '#FFFFFF',
  dim: 'rgba(255,255,255,0.62)',
};
export const SANS = FONT_JAKARTA;
export type Pt = [number, number];

export const ramp = (f: number, at: number, len: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const pop = (f: number, at: number, len = 12) => ramp(f, at, len, Easing.out(Easing.back(1.8)));

// ------------------------------------------------------------------ latar mikroskop
/** Latar malam: gradasi, kisi halus ala lensa ukur, dan debu melayang (deterministik). */
export const MicroBg: React.FC<{ f: number; cold?: number }> = ({ f, cold = 0 }) => {
  const glow = interpolateColors(cold, [0, 1], ['#16305F', '#123A66']);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${glow} 0%, ${C.bg2} 45%, ${C.bg} 100%)` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={i * 90} y1={0} x2={i * 90} y2={1920} stroke={C.line} strokeOpacity={0.18} strokeWidth={1.5} />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 90} x2={1080} y2={i * 90} stroke={C.line} strokeOpacity={0.18} strokeWidth={1.5} />
        ))}
        {Array.from({ length: 26 }, (_, i) => {
          const x = hash(i) * 1080;
          const y = ((hash(i + 50) * 1920 - f * (0.4 + hash(i + 9) * 0.8)) % 1920 + 1920) % 1920;
          return <circle key={i} cx={x} cy={y} r={2 + hash(i + 3) * 3} fill={C.ice} opacity={0.12 + hash(i + 7) * 0.18} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(2,6,16,0.6) 100%)' }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ label
export const Pill: React.FC<{ x: number; y: number; text: string; t: number; color?: string; bg?: string; size?: number; sub?: string }> = ({ x, y, text, t, color = C.text, bg = C.card, size = 46, sub }) =>
  t <= 0 ? null : (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * Math.min(1, t)})`, opacity: Math.min(1, t),
        background: bg, border: `4px solid ${color}`, borderRadius: 999, padding: sub ? '14px 40px 16px' : '12px 40px', fontFamily: SANS, fontWeight: 800,
        fontSize: size, letterSpacing: 2, color, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.1, boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
      }}
    >
      {text}
      {sub ? <div style={{ fontSize: size * 0.62, color: C.dim, letterSpacing: 1, marginTop: 4 }}>{sub}</div> : null}
    </div>
  );

/** Stempel miring: muncul membesar lalu mendarat (t 0→1). */
export const Stamp: React.FC<{ x: number; y: number; text: string; t: number; color?: string; rot?: number; size?: number }> = ({ x, y, text, t, color = C.sugar, rot = -8, size = 64 }) =>
  t <= 0 ? null : (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${interpolate(Math.min(1, t), [0, 1], [1.8, 1])})`, opacity: Math.min(1, t * 1.6),
        border: `7px solid ${color}`, borderRadius: 18, padding: '8px 28px', fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: 3, color, background: 'rgba(8,23,54,0.82)', whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );

export const IllustrationTag: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <div style={{ position: 'absolute', left: 60, top: 96, opacity: o, fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: C.text, background: 'rgba(5,10,24,0.78)', border: '2px solid rgba(244,241,234,0.5)', borderRadius: 10, padding: '6px 14px' }}>
    ILUSTRASI
  </div>
);

// ------------------------------------------------------------------ ikon (digambar di sekitar 0,0 dalam SVG)
const steamPath = (i: number, f: number, h: number) => {
  const x0 = (i - 1) * 46;
  const pts = Array.from({ length: 12 }, (_, k) => {
    const u = k / 11;
    return `${x0 + Math.sin(u * 5 + f / 9 + i) * 14},${-u * h}`;
  });
  return `M ${pts.join(' L ')}`;
};

/** Mangkuk nasi. `steam` 0–1 (uap naik), `steamColor`, `frost` 0–1 (butir es di tepi). */
export const Bowl: React.FC<{ x: number; y: number; s?: number; f: number; steam?: number; steamColor?: string; frost?: number; o?: number }> = ({ x, y, s = 1, f, steam = 0, steamColor = C.hot, frost = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {steam > 0
      ? [0, 1, 2].map((i) => (
          <path key={i} d={steamPath(i, f, 150)} transform="translate(0 -70)" fill="none" stroke={steamColor} strokeWidth={9} strokeLinecap="round" opacity={steam * (0.55 + 0.35 * Math.sin(f / 7 + i * 2))} />
        ))
      : null}
    {/* nasi */}
    <path d="M -128 -10 C -120 -78 -50 -96 0 -96 C 50 -96 120 -78 128 -10 Z" fill={C.cream} />
    {Array.from({ length: 16 }, (_, i) => (
      <ellipse key={i} cx={-100 + hash(i + 1) * 200} cy={-20 - hash(i + 20) * 62} rx={13} ry={6} transform={`rotate(${hash(i + 40) * 180 - 90} ${-100 + hash(i + 1) * 200} ${-20 - hash(i + 20) * 62})`} fill="#FFFDF6" stroke="#D9CBAE" strokeWidth={2} />
    ))}
    {/* mangkuk */}
    <path d="M -150 -14 L 150 -14 C 146 70 84 112 0 112 C -84 112 -146 70 -150 -14 Z" fill="#E7EEF9" stroke={C.ice} strokeWidth={5} />
    <path d="M -150 -14 L 150 -14" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
    <rect x={-56} y={108} width={112} height={18} rx={8} fill="#C9D6EA" />
    {frost > 0
      ? Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-140 + i * 35} cy={-14 + Math.sin(i) * 6} r={6} fill="#FFFFFF" opacity={frost * 0.9} />)
      : null}
  </g>
);

export const Snowflake: React.FC<{ x: number; y: number; r: number; o?: number; rot?: number; color?: string }> = ({ x, y, r, o = 1, rot = 0, color = C.ice }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o} stroke={color} strokeWidth={r * 0.16} strokeLinecap="round">
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <line x1={0} y1={-r} x2={0} y2={r} />
        <line x1={0} y1={-r * 0.6} x2={-r * 0.25} y2={-r * 0.85} />
        <line x1={0} y1={-r * 0.6} x2={r * 0.25} y2={-r * 0.85} />
        <line x1={0} y1={r * 0.6} x2={-r * 0.25} y2={r * 0.85} />
        <line x1={0} y1={r * 0.6} x2={r * 0.25} y2={r * 0.85} />
      </g>
    ))}
  </g>
);

/** Kotak kulkas di sekitar objek: garis biru es + kepingan salju. */
export const FridgeFrame: React.FC<{ x: number; y: number; w: number; h: number; t: number; f: number; checked?: number }> = ({ x, y, w, h, t, f, checked = 0 }) =>
  t <= 0 ? null : (
    <g opacity={Math.min(1, t)} transform={`translate(${x} ${y}) scale(${0.9 + 0.1 * Math.min(1, t)})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="rgba(156,200,255,0.10)" stroke={C.ice} strokeWidth={7} />
      <line x1={-w / 2 + 30} y1={-h / 2 + h * 0.3} x2={w / 2 - 30} y2={-h / 2 + h * 0.3} stroke={C.ice} strokeOpacity={0.45} strokeWidth={4} />
      <rect x={w / 2 - 34} y={-h / 2 + 40} width={10} height={70} rx={5} fill={C.ice} />
      <Snowflake x={-w / 2 + 58} y={-h / 2 + 62} r={30} rot={f * 0.6} />
      <Snowflake x={w / 2 - 90} y={-h / 2 + 64} r={20} rot={-f * 0.8} o={0.7} />
      {checked > 0 ? <CheckMark x={w / 2 - 20} y={-h / 2 + 10} t={checked} /> : null}
    </g>
  );

export const Flame: React.FC<{ x: number; y: number; s?: number; f: number; o?: number }> = ({ x, y, s = 1, f, o = 1 }) =>
  o <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + 0.05 * Math.sin(f / 2.3))} ${s * (1 + 0.08 * Math.sin(f / 1.7))})`} opacity={o}>
      {[-46, 0, 46].map((dx, i) => (
        <g key={i} transform={`translate(${dx} 0) scale(${i === 1 ? 1 : 0.72})`}>
          <path d="M 0 -78 C 30 -40 40 -14 34 8 C 28 28 -28 28 -34 8 C -40 -14 -14 -30 0 -78 Z" fill={C.hot} />
          <path d="M 0 -36 C 14 -18 18 -4 14 8 C 10 18 -10 18 -14 8 C -18 -4 -6 -14 0 -36 Z" fill={C.sugar} />
        </g>
      ))}
      <rect x={-90} y={24} width={180} height={14} rx={7} fill={C.dim} />
    </g>
  );

export const Person: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => (
  <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * on})`} opacity={0.25 + 0.75 * on}>
    <circle cx={0} cy={-22} r={17} fill={on > 0.5 ? C.ok : C.dim} />
    <path d="M -28 30 C -28 4 -14 -2 0 -2 C 14 -2 28 4 28 30 Z" fill={on > 0.5 ? C.ok : C.dim} />
  </g>
);

export const Hexagon: React.FC<{ x: number; y: number; r?: number; o?: number; rot?: number }> = ({ x, y, r = 26, o = 1, rot = 0 }) => (
  <polygon
    transform={`translate(${x} ${y}) rotate(${rot})`}
    opacity={o}
    points={Array.from({ length: 6 }, (_, i) => `${r * Math.cos((Math.PI / 3) * i)},${r * Math.sin((Math.PI / 3) * i)}`).join(' ')}
    fill={C.sugar}
    stroke="#FFE3A0"
    strokeWidth={4}
  />
);

/** Enzim: lingkaran cyan bermulut (menghadap kanan, diputar `rot`). `chomp` 0 = tertutup, 1 = terbuka. */
export const Enzyme: React.FC<{ x: number; y: number; r?: number; chomp: number; rot?: number; o?: number }> = ({ x, y, r = 58, chomp, rot = 0, o = 1 }) => {
  const a = (8 + 32 * chomp) * (Math.PI / 180);
  const d = `M 0 0 L ${r * Math.cos(a)} ${-r * Math.sin(a)} A ${r} ${r} 0 1 0 ${r * Math.cos(a)} ${r * Math.sin(a)} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
      <circle r={r + 14} fill={C.enzyme} opacity={0.15} />
      <path d={d} fill={C.enzyme} stroke="#BFF4FF" strokeWidth={4} />
      <circle cx={-r * 0.15} cy={-r * 0.45} r={r * 0.11} fill={C.bg} />
    </g>
  );
};

export const CheckMark: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 52 }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1.15, t)})`}>
      <circle r={r} fill={C.ok} />
      <path d={`M ${-r * 0.45} 0 L ${-r * 0.1} ${r * 0.35} L ${r * 0.5} ${-r * 0.35}`} fill="none" stroke={C.bg} strokeWidth={r * 0.22} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );

export const CrossMark: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 52 }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1.15, t)})`}>
      <circle r={r} fill={C.bad} />
      <path d={`M ${-r * 0.38} ${-r * 0.38} L ${r * 0.38} ${r * 0.38} M ${r * 0.38} ${-r * 0.38} L ${-r * 0.38} ${r * 0.38}`} stroke="#FFFFFF" strokeWidth={r * 0.22} strokeLinecap="round" />
    </g>
  );

export const Moon: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 46, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <path d={`M ${r * 0.3} ${-r} A ${r} ${r} 0 1 0 ${r} ${r * 0.35} A ${r * 0.8} ${r * 0.8} 0 1 1 ${r * 0.3} ${-r} Z`} fill={C.cream} />
  </g>
);

/** Bakteri: lonjong merah bergaris, jumlah tumbuh 0→n. */
export const Bacteria: React.FC<{ x: number; y: number; n: number; f: number; spread?: number }> = ({ x, y, n, f, spread = 120 }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: Math.ceil(n) }, (_, i) => {
      const k = Math.min(1, n - i);
      const bx = (hash(i + 3) - 0.5) * 2 * spread;
      const by = (hash(i + 11) - 0.5) * spread * 0.9 + Math.sin(f / 10 + i) * 4;
      const rot = hash(i + 17) * 180;
      return (
        <g key={i} transform={`translate(${bx} ${by}) rotate(${rot}) scale(${k})`}>
          <rect x={-22} y={-10} width={44} height={20} rx={10} fill={C.bad} stroke="#FFC2C4" strokeWidth={3} />
          <line x1={-6} y1={-6} x2={-6} y2={6} stroke="#FFC2C4" strokeWidth={3} />
          <line x1={8} y1={-6} x2={8} y2={6} stroke="#FFC2C4" strokeWidth={3} />
        </g>
      );
    })}
  </g>
);

export const Stethoscope: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.enzyme }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round">
    <path d="M -34 -46 L -34 -6 C -34 22 34 22 34 -6 L 34 -46" />
    <path d="M 0 16 L 0 34 C 0 58 40 58 40 34 L 40 22" />
    <circle cx={40} cy={12} r={12} fill={color} />
    <circle cx={-34} cy={-50} r={6} fill={color} />
    <circle cx={34} cy={-50} r={6} fill={color} />
  </g>
);

// ------------------------------------------------------------------ grafik gula darah (skematis)
const curve = (u: number, peak: number, tp: number, w: number) => peak * Math.exp(-(((u - tp) / w) ** 2)) * Math.min(1, u * 6);
const curvePath = (W: number, H: number, peak: number, tp: number, w: number) =>
  'M ' + Array.from({ length: 61 }, (_, i) => { const u = i / 60; return `${u * W},${H - curve(u, peak, tp, w) * H}`; }).join(' L ');

/** Kurva gula darah setelah makan. A = baru matang (garis penuh jingga), B = dari kulkas (putus-putus biru es).
 *  `drawA`/`drawB` 0–1 menggambar kurva dari kiri ke kanan. Koordinat SVG lokal: (0,0) kiri atas area plot. */
export const GlucoseChart: React.FC<{ x: number; y: number; w: number; h: number; drawA: number; drawB: number; o?: number; labels?: boolean; id: string; labelSize?: number; legendY?: number }> = ({ x, y, w, h, drawA, drawB, o = 1, labels = true, id, labelSize = 34, legendY = 0.3 }) => {
  const pA = curvePath(w, h, 0.92, 0.32, 0.2);
  const pB = curvePath(w, h, 0.56, 0.4, 0.26);
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <defs>
        <clipPath id={`ca${id}`}><rect x={-10} y={-40} width={(w + 20) * drawA} height={h + 60} /></clipPath>
        <clipPath id={`cb${id}`}><rect x={-10} y={-40} width={(w + 20) * drawB} height={h + 60} /></clipPath>
      </defs>
      <line x1={0} y1={h} x2={w} y2={h} stroke={C.dim} strokeWidth={4} />
      <line x1={0} y1={0} x2={0} y2={h} stroke={C.dim} strokeWidth={4} />
      <path d={`M ${w - 6} ${h - 12} L ${w + 10} ${h} L ${w - 6} ${h + 12}`} fill="none" stroke={C.dim} strokeWidth={4} />
      {drawA > 0 ? <path d={pA} clipPath={`url(#ca${id})`} fill="none" stroke={C.hot} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {drawB > 0 ? <path d={pB} clipPath={`url(#cb${id})`} fill="none" stroke={C.ice} strokeWidth={10} strokeDasharray="26 16" strokeLinecap="round" /> : null}
      {/* legenda di area kosong kanan (kurva di sana sudah rendah): contoh garis penuh vs putus-putus */}
      {labels && drawA > 0.2 ? (
        <g opacity={Math.min(1, (drawA - 0.2) * 4)} transform={`translate(${w * 0.56} ${legendY * h})`}>
          <line x1={0} y1={-labelSize * 0.32} x2={60} y2={-labelSize * 0.32} stroke={C.hot} strokeWidth={10} strokeLinecap="round" />
          <text x={78} y={0} fontFamily={SANS} fontWeight={800} fontSize={labelSize} fill={C.hot}>BARU MATANG</text>
        </g>
      ) : null}
      {labels && drawB > 0.2 ? (
        <g opacity={Math.min(1, (drawB - 0.2) * 4)} transform={`translate(${w * 0.56} ${legendY * h + labelSize * 1.5})`}>
          <line x1={0} y1={-labelSize * 0.32} x2={60} y2={-labelSize * 0.32} stroke={C.ice} strokeWidth={10} strokeDasharray="22 12" />
          <text x={78} y={0} fontFamily={SANS} fontWeight={800} fontSize={labelSize} fill={C.ice}>DARI KULKAS</text>
        </g>
      ) : null}
    </g>
  );
};

// ------------------------------------------------------------------ rantai pati
export const LENS = { cx: 540, cy: 820, r: 430 };
const N_CHAINS = 6;
/** y rantai ke-i pada x (koordinat lensa), `cold` 0 = panas longgar, 1 = dingin rapat. */
export const chainY = (i: number, x: number, f: number, cold: number) => {
  const spread = interpolate(cold, [0, 1], [118, 30]);
  const amp = interpolate(cold, [0, 1], [30, 3]);
  return (i - (N_CHAINS - 1) / 2) * spread + amp * Math.sin(x / 55 + i * 1.7 + f / 14);
};

/** Rantai pati di dalam lensa. `gap` = lebar celah potongan enzim pada rantai 1 (di `gapX`); `lattice` = kisi kristal;
 *  `dy` = geser berkas (lolos). */
export const StarchChains: React.FC<{ f: number; cold: number; tint: number; gap: number; gapX: number; lattice: number; dy: number }> = ({ f, cold, tint, gap, gapX, lattice, dy }) => {
  const color = interpolateColors(tint, [0, 1], [C.cream, C.ice]);
  const xs = Array.from({ length: 49 }, (_, k) => -380 + k * (760 / 48));
  return (
    <g transform={`translate(0 ${dy})`}>
      {lattice > 0
        ? xs.filter((_, k) => k % 3 === 0).map((x, k) => (
            <line key={k} x1={x} y1={chainY(0, x, f, cold)} x2={x} y2={chainY(N_CHAINS - 1, x, f, cold)} stroke={C.ice} strokeOpacity={0.55 * lattice} strokeWidth={3} />
          ))
        : null}
      {Array.from({ length: N_CHAINS }, (_, i) => {
        const segs: Pt[][] = [[]];
        for (const x of xs) {
          if (i === 1 && gap > 0 && Math.abs(x - gapX) < gap) { if (segs[segs.length - 1].length) segs.push([]); continue; }
          segs[segs.length - 1].push([x, chainY(i, x, f, cold)]);
        }
        return segs.filter((s) => s.length > 1).map((s, j) => (
          <g key={`${i}-${j}`}>
            <path d={'M ' + s.map((p) => p.join(',')).join(' L ')} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            {s.filter((_, k) => k % 4 === 0).map((p, k) => <circle key={k} cx={p[0]} cy={p[1]} r={9} fill={C.bg} stroke={color} strokeWidth={4} />)}
          </g>
        ));
      })}
    </g>
  );
};

/** Tetes air di antara rantai panas (memudar saat dingin). */
export const WaterDrops: React.FC<{ f: number; o: number }> = ({ f, o }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      {Array.from({ length: 14 }, (_, i) => {
        const x = -330 + hash(i + 2) * 660;
        const y = -300 + hash(i + 31) * 600 + Math.sin(f / 12 + i) * 8;
        return <path key={i} transform={`translate(${x} ${y}) scale(0.9)`} d="M 0 -16 C 8 -4 12 2 12 8 A 12 12 0 1 1 -12 8 C -12 2 -8 -4 0 -16 Z" fill="#5FA8FF" opacity={0.75} />;
      })}
    </g>
  );

/** Bar sederhana tanpa angka. */
export const Bar: React.FC<{ x: number; base: number; w: number; h: number; t: number; color: string; label: string; dashed?: boolean }> = ({ x, base, w, h, t, color, label, dashed }) => (
  <g>
    <rect x={x - w / 2} y={base - h * t} width={w} height={h * t} rx={18} fill={color} fillOpacity={dashed ? 0.25 : 0.9} stroke={color} strokeWidth={6} strokeDasharray={dashed ? '22 12' : undefined} />
    <text x={x} y={base + 58} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={38} fill={color} opacity={Math.min(1, t * 2)}>{label}</text>
  </g>
);
