import React from 'react';
import { Easing, interpolate } from 'remotion';
import { FONT_JAKARTA } from '../../shared/brand/fonts';
import { WorldMap } from '../../shared/maps/WorldMap';
import { hash } from '../../shared/motion';

// Gaya "Label dapur terang" (visualStyle di briefs/stevia-isi-sachet.json): sachet, butiran, dan daftar komposisi
// di atas krem. Semua koordinat = piksel layar 1080×1920. Bentuk membedakan makna, bukan hanya warna:
//   stevia  = hijau daun, garis PENUH, butir bulat
//   pengisi = putih/abu, garis PUTUS-PUTUS, butir kotak
// Kuning Fakta hanya satu penanda per beat, selalu sebagai isian dengan teks gelap.
export const C = {
  bg: '#F6F1E7',
  bgDeep: '#E9E1D0',
  paper: '#FFFFFF',
  ink: '#14213D',
  dim: '#4A5468',
  leaf: '#2E8B57',
  leafDark: '#1F6B41', // teks hijau (kontras ≥ 4,5 di krem)
  leafSoft: '#CFE8D8',
  filler: '#8A94A6',
  fillerDark: '#4A5468',
  fillerSoft: '#ECEEF2',
  hi: '#FFB000',
  hiLine: '#E39A00',
  warm: '#C2410C',
  gut: '#F3DCD2',
  gutLine: '#D29C8B',
  sachet: '#2E8B57',
  sachetDark: '#236B43',
};
export const SANS = FONT_JAKARTA;

export const ramp = (f: number, at: number, len: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const pop = (f: number, at: number, len = 12) => ramp(f, at, len, Easing.out(Easing.back(1.8)));
export const fade = (f: number, at: number, len = 10) => 1 - ramp(f, at, len, Easing.inOut(Easing.cubic));

// ------------------------------------------------------------------ teks dan kartu (SVG)
export const Txt: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; o?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; spacing?: number }> = ({ x, y, text, size = 44, color = C.ink, o = 1, anchor = 'middle', weight = 800, spacing = 0 }) =>
  o <= 0 ? null : (
    <text x={x} y={y} fontFamily={SANS} fontWeight={weight} fontSize={size} fill={color} textAnchor={anchor} dominantBaseline="middle" opacity={Math.min(1, o)} letterSpacing={spacing}>
      {text}
    </text>
  );

/** Kartu label dengan skala masuk `t` (0..1+). `dashed` = gaya pengisi. */
export const Tag: React.FC<{ x: number; y: number; w: number; h: number; t: number; fill?: string; stroke?: string; dashed?: boolean; children?: React.ReactNode }> = ({ x, y, w, h, t, fill = C.paper, stroke = C.ink, dashed, children }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * t})`} opacity={Math.min(1, t)}>
      <rect x={-w / 2} y={-h / 2 + 8} width={w} height={h} rx={h / 3.2} fill="rgba(20,33,61,0.10)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 3.2} fill={fill} stroke={stroke} strokeWidth={5} strokeDasharray={dashed ? '16 12' : undefined} />
      {children}
    </g>
  );

// ------------------------------------------------------------------ latar
/** Krem hangat + butiran gula/pengisi diam (deterministik). Sengaja tidak bergerak terhadap frame: video berupa loop,
 *  jadi latar di akhir cerita harus identik dengan latar di frame 0. */
export const Backdrop: React.FC<{ f: number }> = () => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stopColor="#FFFCF5" />
        <stop offset="60%" stopColor={C.bg} />
        <stop offset="100%" stopColor={C.bgDeep} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#bgGrad)" />
    {Array.from({ length: 26 }, (_, i) => {
      const x = hash(i * 7.1) * 1080;
      const y = hash(i * 3.3) * 1920;
      const s = 6 + hash(i * 9.7) * 8;
      return <rect key={i} x={x} y={y} width={s} height={s} rx={2} fill={C.filler} opacity={0.12} transform={`rotate(${hash(i * 5.5) * 90} ${x} ${y})`} />;
    })}
  </svg>
);

// ------------------------------------------------------------------ butiran
/** Isi butiran dalam persegi (x,y,w,h). stevia = bulat hijau; pengisi = kotak putih bergaris abu. */
export const Grains: React.FC<{ x: number; y: number; w: number; h: number; kind: 'stevia' | 'filler'; seed?: number; jiggle?: number }> = ({ x, y, w, h, kind, seed = 1, jiggle = 0 }) => {
  if (w <= 0 || h <= 2) return null;
  const n = Math.max(3, Math.round((w * h) / (kind === 'stevia' ? 420 : 900)));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const gx = x + 8 + hash(seed * 31 + i * 1.7) * (w - 16) + Math.sin(jiggle + i) * 1.5;
        const gy = y + 6 + hash(seed * 17 + i * 2.3) * Math.max(0, h - 12);
        return kind === 'stevia' ? (
          <circle key={i} cx={gx} cy={gy} r={5} fill={C.leaf} opacity={0.75} />
        ) : (
          <rect key={i} x={gx - 7} y={gy - 7} width={14} height={14} rx={3} fill={C.paper} stroke={C.filler} strokeWidth={2.5} transform={`rotate(${hash(seed + i) * 80} ${gx} ${gy})`} />
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ daun dan tanaman
export const Leaf: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string; o?: number }> = ({ x, y, s = 1, rot = 0, color = C.leaf, o = 1 }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      <path d="M 0 0 C 30 -40 100 -46 150 0 C 100 46 30 40 0 0 Z" fill={color} />
      <path d="M 8 0 L 140 0" stroke="rgba(255,255,255,0.55)" strokeWidth={4} strokeLinecap="round" />
      {[40, 70, 100].map((k) => (
        <path key={k} d={`M ${k} 0 L ${k + 18} -16 M ${k} 0 L ${k + 18} 16`} stroke="rgba(255,255,255,0.4)" strokeWidth={3} strokeLinecap="round" />
      ))}
    </g>
  );

/** Tangkai stevia: batang tumbuh (`grow` 0..1), pasangan daun muncul berurutan. Akar di (x, y). */
export const Plant: React.FC<{ x: number; y: number; grow: number; s?: number }> = ({ x, y, grow, s = 1 }) => {
  const H = 560;
  const pairs = [0.28, 0.5, 0.7, 0.88];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M 0 0 C -10 ${-H * 0.4} 12 ${-H * 0.7} 0 ${-H}`} pathLength={1} fill="none" stroke={C.sachetDark} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${grow} 1`} />
      {pairs.map((p, i) => {
        const t = interpolate(grow, [p - 0.12, p + 0.05], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) });
        const ls = (1.25 - i * 0.18) * t;
        return (
          <g key={i}>
            <Leaf x={0} y={-H * p} s={ls} rot={-28 - i * 4} />
            <Leaf x={0} y={-H * p} s={ls} rot={180 + 28 + i * 4} />
          </g>
        );
      })}
      <Leaf x={0} y={-H} s={0.7 * ramp(grow, 0.9, 0.1)} rot={-90} />
    </g>
  );
};

// ------------------------------------------------------------------ molekul (simbolik)
/** Steviol glikosida, simbolik: inti empat cincin (steviol) + dua cincin gula. Bukan struktur kimia presisi. */
export const Molecule: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t <= 0) return null;
  const hex = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, k) => {
      const a = (Math.PI / 3) * k + Math.PI / 6;
      return `${k ? 'L' : 'M'} ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
    }).join(' ') + ' Z';
  const r = 34;
  const core: [number, number][] = [[-60, 0], [0, -34], [0, 34], [60, 0]];
  const sugar: [number, number][] = [[-150, -50], [150, 50]];
  const k = (i: number) => interpolate(t, [i * 0.12, i * 0.12 + 0.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -110 -30 L -88 -14 M 110 30 L 88 14" stroke={C.leafDark} strokeWidth={7} strokeLinecap="round" opacity={k(4)} />
      {core.map(([cx, cy], i) => (
        <path key={i} d={hex(cx, cy, r)} fill={C.leafSoft} stroke={C.leafDark} strokeWidth={7} strokeLinejoin="round" opacity={k(i)} />
      ))}
      {sugar.map(([cx, cy], i) => (
        <path key={i} d={hex(cx, cy, r)} fill={C.paper} stroke={C.leaf} strokeWidth={7} strokeLinejoin="round" opacity={k(4 + i)} />
      ))}
    </g>
  );
};

/** Kaca pembesar di atas daun, isinya molekul. */
export const Magnifier: React.FC<{ x: number; y: number; r: number; t: number; mol: number }> = ({ x, y, r, t, mol }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <path d={`M ${-r * 0.72} ${r * 0.72} L ${-r * 1.15} ${r * 1.15}`} stroke={C.ink} strokeWidth={34} strokeLinecap="round" />
      <circle r={r} fill={C.paper} stroke={C.ink} strokeWidth={14} />
      <circle r={r - 18} fill={C.leafSoft} opacity={0.45} />
      <Molecule x={0} y={0} t={mol} s={(r / 230) * 1.05} />
    </g>
  );

// ------------------------------------------------------------------ peta Amerika Selatan
const SOUTH_AMERICA = ['032', '068', '076', '152', '170', '218', '328', '600', '604', '740', '858', '862'];
/** Kartu peta kecil: Amerika Selatan disorot hijau. */
export const SouthAmericaCard: React.FC<{ x: number; y: number; w: number; h: number; t: number }> = ({ x, y, w, h, t }) => {
  if (t <= 0) return null;
  const highlight = Object.fromEntries(SOUTH_AMERICA.map((id) => [id, C.leaf]));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: Math.min(1, t), transform: `scale(${0.85 + 0.15 * t})`, transformOrigin: '50% 50%', background: C.paper, borderRadius: 36, border: `5px solid ${C.ink}`, boxShadow: '0 10px 0 rgba(20,33,61,0.10)', overflow: 'hidden' }}>
      <WorldMap view={{ center: [-62, -20], scale: 225 }} width={w} height={h - 90} land="#E3DDD0" border="#FFFFFF" borderWidth={1} highlight={highlight} style={{ position: 'absolute', left: 0, top: 0, width: w, height: h - 90 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.leafDark, letterSpacing: 1 }}>AMERIKA SELATAN</div>
    </div>
  );
};

// ------------------------------------------------------------------ sendok, timbangan
/** Sendok dengan tumpukan gula. Mangkuk di (x, y). */
export const SugarSpoon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={60} y={-10} width={150} height={20} rx={10} fill="#B9C0CC" />
    <ellipse cx={0} cy={0} rx={80} ry={34} fill="#D5DAE2" stroke="#9AA3B2" strokeWidth={4} />
    <path d="M -70 -6 C -50 -60 50 -60 70 -6 Z" fill={C.paper} stroke="#C9CFD9" strokeWidth={3} />
    {Array.from({ length: 10 }, (_, i) => (
      <rect key={i} x={-50 + hash(i * 4.1) * 100} y={-40 + hash(i * 2.9) * 30} width={9} height={9} rx={2} fill="#E6E9EF" />
    ))}
  </g>
);

/** Timbangan dua lengan. `tilt` derajat (+ = kiri turun). Mengembalikan posisi piring via render-prop. */
export const Balance: React.FC<{ x: number; y: number; tilt: number; o?: number; left: React.ReactNode; right: React.ReactNode }> = ({ x, y, tilt, o = 1, left, right }) => {
  const arm = 240;
  const a = (-tilt * Math.PI) / 180;
  const lp: [number, number] = [x - arm * Math.cos(a), y - arm * Math.sin(a)];
  const rp: [number, number] = [x + arm * Math.cos(a), y + arm * Math.sin(a)];
  const hang = 150;
  const pan = (p: [number, number], content: React.ReactNode) => (
    <g>
      <path d={`M ${p[0]} ${p[1]} L ${p[0] - 95} ${p[1] + hang} M ${p[0]} ${p[1]} L ${p[0] + 95} ${p[1] + hang}`} stroke={C.dim} strokeWidth={4} />
      <path d={`M ${p[0] - 120} ${p[1] + hang} Q ${p[0]} ${p[1] + hang + 60} ${p[0] + 120} ${p[1] + hang} Z`} fill={C.paper} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <g transform={`translate(${p[0]} ${p[1] + hang})`}>{content}</g>
    </g>
  );
  return o <= 0 ? null : (
    <g opacity={o}>
      <path d={`M ${x} ${y} L ${x} ${y + 360} M ${x - 110} ${y + 370} L ${x + 110} ${y + 370}`} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      <path d={`M ${lp[0]} ${lp[1]} L ${rp[0]} ${rp[1]}`} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
      <circle cx={x} cy={y} r={18} fill={C.hi} stroke={C.ink} strokeWidth={6} />
      {pan(lp, left)}
      {pan(rp, right)}
    </g>
  );
};

/** Sejumput butir stevia (bulat hijau). */
export const Pinch: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 0, y = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 7 }, (_, i) => (
      <circle key={i} cx={-18 + hash(i * 3.7) * 36} cy={-6 - hash(i * 1.9) * 16} r={6} fill={C.leaf} />
    ))}
  </g>
);

// ------------------------------------------------------------------ sachet
export type Layer = { kind: 'stevia' | 'filler'; h: number; t: number; label?: string; labelO?: number; seed?: number };
export const SACHET = { w: 560, h: 820 };
/** Jendela potong di sachet (koordinat lokal, pusat sachet = 0,0). */
export const WIN = { x: -SACHET.w / 2 + 48, y: -110, w: SACHET.w - 96, h: SACHET.h / 2 + 110 - 64 };

/** Sachet pemanis tampak depan. `win` = jendela potong terbuka (0..1); `layers` ditumpuk dari bawah.
 *  `flip` = skala horizontal (untuk animasi berbalik). */
export const Sachet: React.FC<{ x: number; y: number; t?: number; rot?: number; flip?: number; win: number; layers: Layer[]; f: number; printO?: number; ring?: number }> = ({ x, y, t = 1, rot = 0, flip = 1, win, layers, f, printO = 1, ring = 0 }) => {
  if (t <= 0) return null;
  const { w, h } = SACHET;
  let acc = 0;
  const id = `win-${Math.round(x)}-${Math.round(y)}`;
  const zig = (yy: number) => Array.from({ length: 15 }, (_, i) => `${i ? 'L' : 'M'} ${-w / 2 + (i * w) / 14} ${yy + (i % 2 ? 12 : 0)}`).join(' ');
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${t * flip} ${t})`}>
      <rect x={-w / 2 + 10} y={-h / 2 + 18} width={w} height={h} rx={30} fill="rgba(20,33,61,0.12)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill={C.sachet} />
      <path d={zig(-h / 2 + 34)} stroke={C.sachetDark} strokeWidth={5} fill="none" />
      <path d={zig(h / 2 - 46)} stroke={C.sachetDark} strokeWidth={5} fill="none" />
      {/* cetakan depan */}
      <g opacity={printO}>
        <Leaf x={-232} y={-240} s={0.5} rot={-30} color="#FFFFFF" />
        <text x={45} y={-245} fontFamily={SANS} fontWeight={800} fontSize={84} fill="#FFFFFF" textAnchor="middle" dominantBaseline="middle" letterSpacing={2}>
          STEVIA
        </text>
        <text x={0} y={-178} fontFamily={SANS} fontWeight={700} fontSize={30} fill="rgba(255,255,255,0.85)" textAnchor="middle" dominantBaseline="middle" letterSpacing={4}>
          PEMANIS
        </text>
      </g>
      {ring > 0 ? <rect x={-w / 2 + 30} y={-315} width={w - 60} height={168} rx={40} fill="none" stroke={C.hi} strokeWidth={10} opacity={Math.min(1, ring)} strokeDasharray={`${ring * 1400} 1400`} /> : null}
      {/* jendela potong */}
      <defs>
        <clipPath id={id}>
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={22} />
        </clipPath>
      </defs>
      {win > 0 ? (
        <g opacity={Math.min(1, win * 1.5)}>
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={22} fill="#FBFAF7" />
          <g clipPath={`url(#${id})`}>
            {layers.map((L, i) => {
              const lh = L.h * L.t;
              const yb = WIN.y + WIN.h - acc;
              acc += lh;
              if (lh <= 0) return null;
              const top = yb - lh;
              const stevia = L.kind === 'stevia';
              return (
                <g key={i}>
                  <rect x={WIN.x} y={top} width={WIN.w} height={lh} fill={stevia ? C.leafSoft : C.fillerSoft} />
                  <Grains x={WIN.x} y={top} w={WIN.w} h={lh} kind={L.kind} seed={(L.seed ?? i) + 3} jiggle={f / 6} />
                  <path d={`M ${WIN.x} ${top} L ${WIN.x + WIN.w} ${top}`} stroke={stevia ? C.leaf : C.filler} strokeWidth={5} strokeDasharray={stevia ? undefined : '14 10'} />
                  {L.label && (L.labelO ?? 1) > 0 ? (
                    <g opacity={Math.min(1, L.labelO ?? 1)}>
                      <rect x={-L.label.length * 15 - 24} y={top + lh / 2 - 34} width={L.label.length * 30 + 48} height={68} rx={22} fill={C.paper} stroke={stevia ? C.leaf : C.filler} strokeWidth={4} strokeDasharray={stevia ? undefined : '12 8'} />
                      <Txt x={0} y={top + lh / 2 + 2} text={L.label} size={40} color={stevia ? C.leafDark : C.fillerDark} />
                    </g>
                  ) : null}
                </g>
              );
            })}
          </g>
          {/* tepi potongan: garis putus-putus + lidah plastik terkelupas */}
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={22} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeDasharray="22 14" />
        </g>
      ) : null}
      {win < 1 ? (
        <g transform={`translate(0 ${-win * 60})`} opacity={1 - win}>
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={22} fill={C.sachet} />
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={22} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={5} strokeDasharray={`${win > 0 ? 22 : 0} 14`} />
        </g>
      ) : null}
    </g>
  );
};

/** Sisi belakang sachet: panel komposisi (contoh ilustrasi, bukan produk nyata). */
export const BackPanel: React.FC<{ x: number; y: number; flip: number; rows: number[]; arrow: number; most: number; first: number }> = ({ x, y, flip, rows, arrow, most, first }) => {
  const W = 800, H = 980;
  const items = ['Dekstrosa', 'Maltodekstrin', 'Ekstrak daun stevia'];
  const ry = (i: number) => -120 + i * 160;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <rect x={-W / 2 + 10} y={-H / 2 + 18} width={W} height={H} rx={34} fill="rgba(20,33,61,0.12)" />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={34} fill={C.sachet} />
      <rect x={-W / 2 + 36} y={-H / 2 + 70} width={W - 72} height={H - 120} rx={24} fill={C.paper} />
      <Txt x={-W / 2 + 80} y={-H / 2 + 150} text="KOMPOSISI" size={60} anchor="start" />
      <Tag x={W / 2 - 150} y={-H / 2 + 150} w={150} h={52} t={1} fill={C.fillerSoft} stroke={C.filler} dashed>
        <Txt x={0} y={2} text="CONTOH" size={26} color={C.fillerDark} />
      </Tag>
      <path d={`M ${-W / 2 + 80} ${-H / 2 + 205} L ${W / 2 - 80} ${-H / 2 + 205}`} stroke={C.ink} strokeWidth={4} />
      {/* panah urutan */}
      {arrow > 0 ? (
        <g opacity={Math.min(1, arrow * 2)}>
          <path d={`M ${-W / 2 + 110} ${ry(0) - 50} L ${-W / 2 + 110} ${ry(0) - 50 + (ry(2) + 100 - ry(0)) * arrow}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
          {arrow >= 1 ? <path d={`M ${-W / 2 + 86} ${ry(2) + 70} L ${-W / 2 + 110} ${ry(2) + 104} L ${-W / 2 + 134} ${ry(2) + 70}`} fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /> : null}
          <Txt x={-W / 2 + 70} y={ry(2) + 160} text="TERSEDIKIT" size={32} anchor="start" color={C.dim} o={ramp(arrow, 0.6, 0.4)} />
        </g>
      ) : null}
      {first > 0 ? <rect x={-W / 2 + 150} y={ry(0) - 56} width={(W - 230) * Math.min(1, first)} height={112} rx={26} fill={C.hi} /> : null}
      {items.map((it, i) => {
        const t = rows[i] ?? 0;
        if (t <= 0) return null;
        const stevia = i === 2;
        return (
          <g key={it} opacity={Math.min(1, t)} transform={`translate(${(1 - Math.min(1, t)) * 30} 0)`}>
            <circle cx={-W / 2 + 205} cy={ry(i)} r={34} fill={stevia ? C.leaf : C.paper} stroke={stevia ? C.leaf : C.ink} strokeWidth={5} strokeDasharray={stevia ? undefined : '10 7'} />
            <Txt x={-W / 2 + 205} y={ry(i) + 2} text={String(i + 1)} size={38} color={stevia ? '#FFFFFF' : C.ink} />
            <Txt x={-W / 2 + 265} y={ry(i) + 2} text={it} size={stevia ? 44 : 50} anchor="start" color={stevia ? C.leafDark : C.ink} />
          </g>
        );
      })}
      <Txt x={-W / 2 + 70} y={ry(0) - 92} text="TERBANYAK" size={32} anchor="start" color={C.ink} o={most} />
    </g>
  );
};

// ------------------------------------------------------------------ saluran cerna (kalori)
/** Pita saluran cerna horizontal, sederhana. */
export const GutBand: React.FC<{ y: number; t: number; f: number }> = ({ y, t, f }) => {
  if (t <= 0) return null;
  const pts = (off: number) => Array.from({ length: 23 }, (_, i): [number, number] => [80 + i * 42, y + off + Math.sin(i * 0.9 + f / 20) * 8]);
  const line = (p: [number, number][]) => p.map(([px, py], i) => `${i ? 'L' : 'M'} ${px} ${py}`).join(' ');
  const wave = (off: number) => line(pts(off));
  return (
    <g opacity={Math.min(1, t)}>
      <path d={`${line([...pts(-70), ...pts(70).reverse()])} Z`} fill={C.gut} />
      <path d={wave(-70)} fill="none" stroke={C.gutLine} strokeWidth={8} strokeLinecap="round" />
      <path d={wave(70)} fill="none" stroke={C.gutLine} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};

/** Gunting = enzim pencernaan (simbolik). `blocked` menampilkan tanda silang. */
export const Enzyme: React.FC<{ x: number; y: number; t: number; blocked: number }> = ({ x, y, t, blocked }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t})`}>
      <circle r={66} fill={C.paper} stroke={C.ink} strokeWidth={5} />
      <g stroke={C.ink} strokeWidth={8} strokeLinecap="round" fill="none">
        <circle cx={-22} cy={24} r={14} />
        <circle cx={22} cy={24} r={14} />
        <path d="M -12 12 L 20 -38 M 12 12 L -20 -38" />
      </g>
      {blocked > 0 ? (
        <g opacity={Math.min(1, blocked)} transform={`scale(${0.7 + 0.3 * Math.min(1, blocked)})`}>
          <path d="M -54 -54 L 54 54 M 54 -54 L -54 54" stroke={C.warm} strokeWidth={12} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );

/** Glukosa: segi enam oranye kecil. */
export const Glucose: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    opacity={o}
    d={Array.from({ length: 6 }, (_, k) => `${k ? 'L' : 'M'} ${18 * Math.cos((Math.PI / 3) * k)} ${18 * Math.sin((Math.PI / 3) * k)}`).join(' ') + ' Z'}
    fill="#FFE2C4"
    stroke={C.warm}
    strokeWidth={5}
    strokeLinejoin="round"
  />
);
