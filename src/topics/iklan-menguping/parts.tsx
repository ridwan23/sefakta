import React from 'react';
import { Easing, interpolate } from 'remotion';
import { FONT_JAKARTA } from '../../shared/brand/fonts';
import { hash } from '../../shared/motion';

// Gaya "UI ponsel terang / infografis bersih" (visualStyle di briefs/iklan-menguping.json).
// Satu dunia dalam koordinat dunia (px pada zoom 1): ponselmu di tengah (1000, 1000), gelembung obrolan di atasnya,
// sinyal aktivitas (pencarian, video, area) di kiri, panel "Perkiraan minat" di atas. Kamera (src/shared/camera)
// sebagian besar terkunci; objek yang bergerak membawa informasi. Bentuk membedakan makna, bukan hanya warna:
//   suara/obrolan = merah muda, garis PUTUS-PUTUS · data = biru, garis PENUH dengan denyut titik.
export const C = {
  bg: '#F6F2EA', // krem
  bgDeep: '#E8E1D3',
  panel: '#FFFFFF',
  panel2: '#F1F3F8',
  line: '#D9DEE8', // garis kartu UI
  data: '#1F6FEB', // biru data
  hi: '#FFB000', // Kuning Fakta: satu penekanan (iklan sepatu)
  hiLine: '#E39A00', // kuning lebih tua untuk garis di atas krem
  voice: '#E5396B',
  text: '#0F1B33',
  dim: 'rgba(15,27,51,0.6)',
  ok: '#12A672',
  gray: '#A7B0C2',
  ink: '#0F1B33',
  bezel: '#151A24',
};
export const SANS = FONT_JAKARTA;

export const ramp = (f: number, at: number, len: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const pop = (f: number, at: number, len = 12) => ramp(f, at, len, Easing.out(Easing.back(1.8)));

// ------------------------------------------------------------------ tata letak dunia
export type Pt = [number, number];
export const PHONE = { x: 1000, y: 1000, w: 400, h: 800 };
export const SCREEN = { x: PHONE.x - PHONE.w / 2 + 22, y: PHONE.y - PHONE.h / 2 + 70, w: PHONE.w - 44, h: PHONE.h - 150 };
export const MIC: Pt = [PHONE.x, PHONE.y + PHONE.h / 2 - 38];
export const NODE = {
  search: [410, 520] as Pt,
  video: [410, 1000] as Pt,
  area: [410, 1480] as Pt,
  panel: [1000, 250] as Pt,
};
export const BUBBLE = { me: { x: 770, y: 330 }, friend: { x: 1230, y: 430 } };

// ------------------------------------------------------------------ garis: suara (putus-putus) dan data (penuh)
const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => {
  const m = 1 - t;
  return [m * m * a[0] + 2 * m * t * c[0] + t * t * b[0], m * m * a[1] + 2 * m * t * c[1] + t * t * b[1]];
};
const ctrl = (a: Pt, b: Pt, bend: number): Pt => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  return [mx - dy * bend, my + dx * bend];
};

/** Aliran data: garis cyan penuh tergambar 0→`draw`, dengan titik-titik yang mengalir dari `a` ke `b`. */
export const DataLine: React.FC<{ a: Pt; b: Pt; draw: number; f: number; bend?: number; o?: number; width?: number; color?: string; speed?: number }> = ({ a, b, draw, f, bend = 0.15, o = 1, width = 7, color = C.data, speed = 40 }) => {
  if (draw <= 0 || o <= 0) return null;
  const c = ctrl(a, b, bend);
  const d = `M ${a[0]} ${a[1]} Q ${c[0]} ${c[1]} ${b[0]} ${b[1]}`;
  return (
    <g opacity={o}>
      <path d={d} pathLength={1} fill="none" stroke={color} strokeOpacity={0.14} strokeWidth={width * 3} strokeLinecap="round" strokeDasharray={`${draw} 1`} />
      <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={`${draw} 1`} />
      {draw >= 1
        ? [0, 1, 2].map((i) => {
            const p = quad(a, c, b, ((f / speed + i / 3) % 1 + 1) % 1);
            return <circle key={i} cx={p[0]} cy={p[1]} r={width * 1.5} fill="#FFFFFF" stroke={color} strokeWidth={4} />;
          })
        : null}
    </g>
  );
};

// ------------------------------------------------------------------ ikon (digambar di sekitar 0,0)
export const Sneaker: React.FC<{ x: number; y: number; s?: number; color?: string; o?: number }> = ({ x, y, s = 1, color = C.text, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -70 18 L -70 -6 C -70 -26 -56 -36 -40 -36 L -24 -36 C -16 -20 2 -12 22 -8 C 46 -3 66 4 70 18 Z" fill={color} />
    <rect x={-74} y={16} width={148} height={16} rx={8} fill={color} opacity={0.75} />
    <path d="M -30 -26 L -18 -16 M -20 -30 L -8 -18 M -10 -32 L 2 -20" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** Telinga + tanda tanya: "apakah ponsel mendengar?" */
export const Ear: React.FC<{ x: number; y: number; t: number; f: number }> = ({ x, y, t, f }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t}) rotate(${Math.sin(f / 9) * 4})`}>
      <circle r={110} fill={C.panel} stroke={C.voice} strokeWidth={6} />
      <path d="M 26 -58 C -28 -84 -66 -40 -58 6 C -52 42 -22 50 -14 72 C -6 92 22 90 28 66" fill="none" stroke={C.text} strokeWidth={12} strokeLinecap="round" />
      <path d="M 6 -26 C -18 -34 -30 -12 -24 8" fill="none" stroke={C.text} strokeWidth={9} strokeLinecap="round" />
      <text x={66} y={-40} fontFamily={SANS} fontWeight={800} fontSize={110} fill={C.voice} textAnchor="middle">
        ?
      </text>
    </g>
  );

/** Sinyal aktivitas dalam lingkaran: pencarian, video yang ditonton, atau area tempat layanan dipakai. */
export const SignalIcon: React.FC<{ x: number; y: number; t: number; kind: 'search' | 'video' | 'area'; color?: string }> = ({ x, y, t, kind, color = C.data }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <circle r={120} fill={C.panel} stroke={color} strokeWidth={6} />
      {kind === 'search' ? (
        <g>
          <circle cx={-12} cy={-12} r={40} fill="none" stroke={color} strokeWidth={14} />
          <path d="M 18 18 L 52 52" stroke={color} strokeWidth={16} strokeLinecap="round" />
        </g>
      ) : kind === 'video' ? (
        <g>
          <rect x={-66} y={-46} width={132} height={92} rx={20} fill={color} />
          <path d="M -14 -24 L 26 0 L -14 24 Z" fill={C.panel} />
        </g>
      ) : (
        <g>
          <path d="M 0 66 C -38 18 -52 -4 -52 -24 A 52 52 0 1 1 52 -24 C 52 -4 38 18 0 66 Z" fill={color} />
          <circle cx={0} cy={-24} r={20} fill={C.panel} />
        </g>
      )}
    </g>
  );

// ------------------------------------------------------------------ gelembung obrolan (suara = garis putus-putus)
export const Bubble: React.FC<{ x: number; y: number; t: number; tail: 'left' | 'right'; label: string; f: number; seed?: number }> = ({ x, y, t, tail, label, f, seed = 0 }) => {
  if (t <= 0) return null;
  const w = 330, h = 190;
  const bob = Math.sin(f / 22 + seed) * 6;
  const tx = tail === 'left' ? -w / 2 + 70 : w / 2 - 70;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${t})`}>
      <path
        d={`M ${-w / 2 + 40} ${-h / 2} L ${w / 2 - 40} ${-h / 2} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 40} L ${w / 2} ${h / 2 - 40} Q ${w / 2} ${h / 2} ${w / 2 - 40} ${h / 2} L ${tx + 30} ${h / 2} L ${tx + (tail === 'left' ? -30 : 30)} ${h / 2 + 60} L ${tx - 20} ${h / 2} L ${-w / 2 + 40} ${h / 2} Q ${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 40} L ${-w / 2} ${-h / 2 + 40} Q ${-w / 2} ${-h / 2} ${-w / 2 + 40} ${-h / 2} Z`}
        fill={C.panel}
        stroke={C.voice}
        strokeWidth={8}
        strokeDasharray="22 14"
        strokeDashoffset={-f * 1.2}
      />
      <Sneaker x={-38} y={-8} s={1.05} />
      <text x={86} y={6} fontFamily={SANS} fontWeight={800} fontSize={60} fill={C.voice} textAnchor="middle">
        …
      </text>
      <text x={0} y={-h / 2 - 34} fontFamily={SANS} fontWeight={800} fontSize={44} letterSpacing={3} fill={C.dim} textAnchor="middle">
        {label}
      </text>
    </g>
  );
};

// ------------------------------------------------------------------ latar: kisi aplikasi (17.000 aplikasi)
/** Kisi ikon aplikasi yang terungkap dari ponsel keluar (`reveal` 0..1 → radius). Pola SVG supaya ringan. */
export const AppGrid: React.FC<{ reveal: number; o: number }> = ({ reveal, o }) => {
  if (o <= 0 || reveal <= 0) return null;
  const R = reveal * 5200;
  const cols = ['#DCE7FB', '#FDE9C4', '#F9D9E3', '#D5F0E4', '#E6DEF8', '#D7ECF8'];
  return (
    <svg width={12000} height={12000} viewBox="-5000 -5000 12000 12000" style={{ position: 'absolute', left: -5000, top: -5000, overflow: 'visible' }} opacity={o}>
      <defs>
        <pattern id="imgrid" x={PHONE.x - 90} y={PHONE.y - 90} width={540} height={540} patternUnits="userSpaceOnUse">
          {Array.from({ length: 9 }, (_, i) => {
            const cx = (i % 3) * 180 + 90, cy = Math.floor(i / 3) * 180 + 90;
            return (
              <g key={i}>
                <rect x={cx - 66} y={cy - 66} width={132} height={132} rx={34} fill={cols[i % cols.length]} />
                <circle cx={cx} cy={cy - 6} r={26 + (i % 3) * 4} fill="none" stroke="#7C8AA5" strokeWidth={8} opacity={0.5} />
                <circle cx={cx + 44} cy={cy + 44} r={9} fill={C.gray} />
              </g>
            );
          })}
        </pattern>
        <radialGradient id="imreveal" cx={PHONE.x} cy={PHONE.y} r={Math.max(1, R)} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.85" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id="immask" maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={12000} height={12000}>
          <rect x={-5000} y={-5000} width={12000} height={12000} fill="url(#imreveal)" />
          <rect x={PHONE.x - PHONE.w / 2 - 40} y={PHONE.y - PHONE.h / 2 - 40} width={PHONE.w + 80} height={PHONE.h + 80} rx={70} fill="#000" />
        </mask>
      </defs>
      <rect x={-5000} y={-5000} width={12000} height={12000} fill="url(#imgrid)" mask="url(#immask)" />
    </svg>
  );
};

// ------------------------------------------------------------------ ponsel
type ScreenState = {
  lock?: number; // layar kunci (jam)
  ad?: number; // kartu iklan sepatu
  adGlow?: number;
  feed?: number; // feed kartu iklan (ilusi frekuensi)
  scroll?: number;
  spot?: number; // sorot senter
  match?: number; // kartu sepatu "cocok"
  fade?: number; // kartu lain meredup
};

const FEED = ['Panci', 'Kursus', 'Pulsa', 'Game', 'SEPATU', 'Sofa', 'Kopi', 'Tiket', 'Skincare', 'Motor', 'Bank', 'SEPATU', 'Musik', 'Buku', 'Kamera'];
export const FEED_STRIDE = 150;
/** Gulir agar kartu ke-i berada di tengah layar. */
export const scrollTo = (i: number) => 22 + i * FEED_STRIDE + 63 - SCREEN.h / 2;
export const SHOE_A = 4;
export const SHOE_B = 11;

const FeedCards: React.FC<{ s: ScreenState; f: number }> = ({ s, f }) => {
  const { x, y, w, h } = SCREEN;
  const spotY = y + h / 2;
  return (
    <g opacity={s.feed}>
      <rect x={x} y={y} width={w} height={h} fill={C.panel2} />
      {FEED.map((name, i) => {
        const cy = y + 22 + i * FEED_STRIDE - (s.scroll ?? 0);
        if (cy > y + h + 20 || cy + 126 < y - 20) return null;
        const shoe = name === 'SEPATU';
        const near = Math.max(0, 1 - Math.abs(cy + 63 - spotY) / 110) * (s.spot ?? 0);
        const isMatch = i === SHOE_B ? s.match ?? 0 : 0;
        const lit = shoe ? Math.max(near, isMatch) : 0;
        const forgotten = shoe ? 0 : s.fade ?? 0;
        const sc = 1 + 0.08 * isMatch;
        return (
          <g key={i} opacity={1 - 0.82 * forgotten} transform={`translate(${x + w / 2} ${cy + 63 + forgotten * 30}) scale(${sc})`}>
            <rect x={-w / 2 + 18} y={-63} width={w - 36} height={126} rx={20} fill={lit > 0 ? C.hi : C.panel} fillOpacity={lit > 0 ? 0.25 + 0.75 * lit : 1} stroke={lit > 0 ? C.hiLine : C.line} strokeWidth={lit > 0 ? 6 : 3} />
            {shoe ? <Sneaker x={-w / 2 + 92} y={4} s={0.62} color={lit > 0.5 ? C.ink : C.text} /> : <rect x={-w / 2 + 48} y={-34} width={90} height={68} rx={14} fill={['#DCE7FB', '#FDE9C4', '#F9D9E3', '#D5F0E4', '#E6DEF8'][i % 5]} />}
            <text x={-w / 2 + 160} y={-8} fontFamily={SANS} fontWeight={800} fontSize={32} fill={lit > 0.5 ? C.ink : C.text}>
              {shoe ? 'Sepatu' : name}
            </text>
            <rect x={-w / 2 + 160} y={12} width={100 + hash(i) * 40} height={14} rx={7} fill={lit > 0.5 ? C.ink : C.line} />
            <text x={w / 2 - 34} y={-34} textAnchor="end" fontFamily={SANS} fontWeight={700} fontSize={18} fill={lit > 0.5 ? C.ink : C.dim}>
              Iklan
            </text>
          </g>
        );
      })}
      {(s.spot ?? 0) > 0 ? (
        <g opacity={(s.spot ?? 0) * (1 - (s.fade ?? 0))}>
          <rect x={x} y={y} width={w} height={h} fill="url(#imspot)" />
          <circle cx={x + w / 2} cy={spotY} r={150 + 6 * Math.sin(f / 6)} fill="none" stroke={C.hi} strokeWidth={4} strokeDasharray="10 12" opacity={0.8} />
        </g>
      ) : null}
    </g>
  );
};

export const Phone: React.FC<{ s: ScreenState; f: number; o?: number }> = ({ s, f, o = 1 }) => {
  const { x, y, w, h } = PHONE;
  const L = x - w / 2, T = y - h / 2;
  const sx = SCREEN.x, sy = SCREEN.y, sw = SCREEN.w, sh = SCREEN.h;
  return (
    <g opacity={o}>
      <defs>
        <clipPath id="imscreen">
          <rect x={sx} y={sy} width={sw} height={sh} rx={22} />
        </clipPath>
        <radialGradient id="imspot" cx={sx + sw / 2} cy={sy + sh / 2} r={sh * 0.7} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.ink} stopOpacity={0} />
          <stop offset="0.3" stopColor={C.ink} stopOpacity={0} />
          <stop offset="0.5" stopColor={C.ink} stopOpacity={0.45} />
          <stop offset="1" stopColor={C.ink} stopOpacity={0.6} />
        </radialGradient>
      </defs>
      <rect x={L + 14} y={T + 30} width={w} height={h} rx={50} fill={C.ink} opacity={0.12} />
      <rect x={L} y={T} width={w} height={h} rx={50} fill={C.bezel} stroke="#3A4253" strokeWidth={5} />
      <rect x={sx} y={sy} width={sw} height={sh} rx={22} fill="#FFFFFF" />
      <rect x={x - 44} y={T + 30} width={88} height={13} rx={6} fill="#000000" />
      <g clipPath="url(#imscreen)">
        {/* layar kunci */}
        {(s.lock ?? 0) > 0 ? (
          <g opacity={s.lock}>
            <rect x={sx} y={sy} width={sw} height={sh} fill="#EAF1FD" />
            <text x={x} y={sy + 150} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={84} fill={C.text}>
              21.07
            </text>
            <text x={x} y={sy + 200} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} fill={C.dim}>
              Senin
            </text>
          </g>
        ) : null}
        {/* kartu iklan sepatu */}
        {(s.ad ?? 0) > 0 ? (
          <g transform={`translate(0 ${(1 - (s.ad ?? 0)) * 260})`} opacity={Math.min(1, (s.ad ?? 0) * 1.5)}>
            <rect x={sx + 20} y={sy + 270} width={sw - 40} height={330} rx={24} fill={C.panel} stroke={C.hiLine} strokeWidth={6} />
            {(s.adGlow ?? 0) > 0 ? <rect x={sx + 12} y={sy + 262} width={sw - 24} height={346} rx={30} fill="none" stroke={C.hi} strokeWidth={14} opacity={0.35 * (s.adGlow ?? 0) * (0.7 + 0.3 * Math.sin(f / 4))} /> : null}
            <rect x={sx + 40} y={sy + 290} width={sw - 80} height={170} rx={16} fill={C.hi} />
            <Sneaker x={x} y={sy + 380} s={1.5} color={C.ink} />
            <text x={sx + 44} y={sy + 510} fontFamily={SANS} fontWeight={800} fontSize={36} fill={C.text}>
              Sepatu Lari
            </text>
            <text x={sx + 44} y={sy + 556} fontFamily={SANS} fontWeight={700} fontSize={26} fill={C.dim}>
              Disponsori · Iklan
            </text>
          </g>
        ) : null}
        {(s.feed ?? 0) > 0 ? <FeedCards s={s} f={f} /> : null}
      </g>
      {/* mikrofon */}
      <circle cx={MIC[0]} cy={MIC[1]} r={10} fill="#6B7280" />
    </g>
  );
};

/** Panel "Perkiraan minat": tempat sinyal aktivitas bertemu; `tag` = minat yang diperkirakan (sepatu). */
export const PANEL_SCALE = 1.35;
export const InterestPanel: React.FC<{ t: number; tag: number; f: number }> = ({ t, tag, f }) => {
  if (t <= 0) return null;
  const [x, y] = NODE.panel;
  t *= PANEL_SCALE;
  const W = 600, H = 250;
  return (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={34} fill={C.panel} stroke={tag > 0 ? C.hiLine : C.data} strokeWidth={7} />
      {tag > 0 ? <rect x={-W / 2 - 10} y={-H / 2 - 10} width={W + 20} height={H + 20} rx={42} fill="none" stroke={C.hi} strokeWidth={14} opacity={0.3 * tag * (0.7 + 0.3 * Math.sin(f / 4))} /> : null}
      <text x={0} y={-36} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} letterSpacing={4} fill={C.text}>
        PERKIRAAN MINAT
      </text>
      <g opacity={tag} transform={`translate(0 ${(1 - tag) * 20})`}>
        <rect x={-210} y={4} width={420} height={86} rx={43} fill={C.hi} />
        <Sneaker x={-130} y={50} s={0.62} color={C.ink} />
        <text x={40} y={66} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={C.ink}>
          SEPATU
        </text>
      </g>
    </g>
  );
};

/** Label dunia (teks pendek ≤ 4 kata). */
export const WLabel: React.FC<{ x: number; y: number; text: string; o: number; size?: number; color?: string }> = ({ x, y, text, o, size = 44, color = C.text }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * o})`, opacity: Math.min(1, o), fontFamily: SANS, fontWeight: 800, fontSize: size, color, letterSpacing: size * 0.06, whiteSpace: 'pre', textAlign: 'center', textShadow: `0 0 18px ${C.bg}, 0 0 6px ${C.bg}` }}>
      {text}
    </div>
  );

/** Stempel miring (teks pendek). */
export const Stamp: React.FC<{ x: number; y: number; text: string; t: number; color?: string; size?: number; rot?: number }> = ({ x, y, text, t, color = C.hi, size = 64, rot = -8 }) =>
  t <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${1.4 - 0.4 * Math.min(1, t)})`, opacity: Math.min(1, t), fontFamily: SANS, fontWeight: 800, fontSize: size, color, letterSpacing: size * 0.08, border: `${Math.max(5, size * 0.09)}px solid ${color}`, borderRadius: size * 0.22, padding: `${size * 0.08}px ${size * 0.3}px`, background: 'rgba(255,255,255,0.94)', whiteSpace: 'pre' }}>
      {text}
    </div>
  );

// ------------------------------------------------------------------ lapisan parallax
/** Latar jauh (depth ~0,3): kisi titik dan garis data samar. */
export const FarField: React.FC<{ f: number }> = ({ f }) => (
  <svg width={5000} height={5000} viewBox="-1500 -1500 5000 5000" style={{ position: 'absolute', left: -1500, top: -1500, overflow: 'visible' }}>
    <defs>
      <pattern id="imdots" width={50} height={50} patternUnits="userSpaceOnUse">
        <circle cx={25} cy={25} r={2.6} fill={C.data} opacity={0.12} />
      </pattern>
      <radialGradient id="imglow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.75} />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-1500} y={-1500} width={5000} height={5000} fill="url(#imdots)" />
    <circle cx={300} cy={300} r={900} fill="url(#imglow)" />
    <circle cx={900} cy={700} r={700} fill="url(#imglow)" />
    {Array.from({ length: 9 }, (_, i) => {
      const yy = -600 + i * 280;
      const k = ((f * (0.004 + hash(i) * 0.004) + hash(i * 3.3)) % 1) * 3600 - 1200;
      return <line key={i} x1={k} x2={k + 260} y1={yy} y2={yy} stroke={C.data} strokeWidth={4} strokeLinecap="round" opacity={0.12} />;
    })}
  </svg>
);

/** Partikel depan (depth > 1, buram): bokeh yang melayang. */
export const NearDust: React.FC<{ f: number }> = ({ f }) => (
  <svg width={5200} height={4200} viewBox="-1200 -1000 5200 4200" style={{ position: 'absolute', left: -1200, top: -1000, overflow: 'visible' }}>
    {Array.from({ length: 24 }, (_, i) => {
      const x = -1000 + hash(i * 1.7) * 4800 + Math.sin(f / 60 + i) * 30;
      const y = -800 + hash(i * 3.1) * 3800 - ((f * (0.4 + hash(i) * 0.6)) % 400);
      return <circle key={i} cx={x} cy={y} r={14 + hash(i * 5.3) * 30} fill={i % 3 === 0 ? C.voice : C.data} opacity={0.06 + hash(i * 7.7) * 0.08} />;
    })}
  </svg>
);
