// Aset episode voc-bangkrut — potongan kertas arsip VOC (Kartu 1).
// Semua bentuk disalin dari briefs/voc-bangkrut-asset-sheet.svg (aset FINAL) dan
// briefs/voc-bangkrut-map.svg (peta). Koordinat komponen = koordinat induknya
// (dunia 5400x1920 di dalam CamLayer, atau layar di shot loop).
// Konversi layar->dunia: Z(zona, sx, sy) = [zona*1080 + sx, sy + 134.4]
// (anchor kamera default [540, 825.6], pose y=960, zoom 1).
import React from 'react';
import { font } from '../../shared/brand/fonts';
import { EASE, prog } from '../../shared/anim/core';
import { LAND_D, ROUTE_D, ARROW_D } from './mapdata';

export const WORLD_W = 5400;
export const WORLD_H = 1920;
export const DISPLAY = font('playfair-display');
export const TEXT = font('plus-jakarta-sans');

export const C = {
  kertas: '#F3EBDD', krem: '#FFF8EB', tinta: '#243139', bata: '#C56B50', emas: '#E8B65C',
  sage: '#8A9B7C', biru: '#7C9DA5', merahBendera: '#AE1C28', biruBendera: '#21468B', abu: '#D8D2C4',
  laut: '#B7CFD6',
};

/** layar (sx, sy) di dalam zona -> koordinat dunia. */
export const Z = (zone: number, sx: number, sy: number): [number, number] => [zone * 1080 + sx, sy + 134.4];

export const ramp = (f: number, at: number, dur: number) => prog(f, at, dur, EASE.inOut);
export const pop = (f: number, at: number, dur = 12) => prog(f, at, dur, EASE.back);
export const fade = (f: number, at: number, dur: number) => prog(f, at, dur, EASE.linear);

/** Teks di dunia: x,y = tengah teks. */
export const Txt: React.FC<{ x: number; y: number; text: string; size?: number; o?: number; display?: boolean; color?: string; weight?: number | string; anchor?: 'middle' | 'start' | 'end'; ls?: number }> = ({
  x, y, text, size = 40, o = 1, display = false, color = C.tinta, weight = 700, anchor = 'middle', ls,
}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={display ? DISPLAY : TEXT} fontSize={size} fontWeight={weight} fill={color} opacity={o} letterSpacing={ls}>
    {text}
  </text>
);

/** Koin VOC pahlawan (aset 2): lingkaran emas + monogram VOC + retak opsional + sapuan merah opsional. sc = skala pop. */
export const Coin: React.FC<{ x: number; y: number; r?: number; crack?: number; red?: number; o?: number; rot?: number; sc?: number }> = ({
  x, y, r = 88, crack = 0, red = 0, o = 1, rot = 0, sc = 1,
}) => (
  <svg width={r * 2} height={r * 2} viewBox="-100 -100 200 200" style={{ position: 'absolute', left: x - r, top: y - r, overflow: 'visible', opacity: o, transform: `rotate(${rot}deg) scale(${sc})` }}>
    <circle cx={0} cy={0} r={100} fill={C.emas} stroke={C.tinta} strokeWidth={4.5} />
    <circle cx={0} cy={0} r={100} fill={C.bata} stroke={C.tinta} strokeWidth={4.5} opacity={red} />
    <circle cx={0} cy={0} r={80} fill="none" stroke={C.tinta} strokeWidth={2.5} />
    <text x={0} y={20} textAnchor="middle" fontFamily={DISPLAY} fontSize={52} fontWeight="bold" fill={C.tinta}>VOC</text>
    <path d="M51,-62 L66,-23 L51,6 L74,40 L59,68" fill="none" stroke={C.bata} strokeWidth={5.5} strokeLinecap="round" opacity={crack} />
  </svg>
);

/** Koin terbelah dua keping (aset 2, revisi): setengah emas "V" + setengah merah bata "C". sep 0 = rapat, 1 = terpisah. */
export const CoinSplit: React.FC<{ x: number; y: number; s?: number; sep?: number; o?: number }> = ({ x, y, s = 1, sep = 0, o = 1 }) => (
  <svg width={140 * s} height={140 * s} viewBox="-70 -70 140 140" style={{ position: 'absolute', left: x - 70 * s, top: y - 70 * s, overflow: 'visible', opacity: o }}>
    <g transform={`translate(${-9 - sep * 26},${-3}) rotate(${-10 - sep * 8}) scale(${s})`}>
      <path d="M0,-24 A24,24 0 0 0 0,24 L-6,12 L2,0 L-6,-12 Z" fill={C.emas} stroke={C.tinta} strokeWidth={2.5} strokeLinejoin="round" />
      <text x={-11} y={7} textAnchor="middle" fontFamily={DISPLAY} fontSize={16} fontWeight="bold" fill={C.tinta}>V</text>
    </g>
    <g transform={`translate(${9 + sep * 26},${3}) rotate(${10 + sep * 8}) scale(${s})`}>
      <path d="M0,-24 A24,24 0 0 1 0,24 L6,12 L-2,0 L6,-12 Z" fill={C.bata} stroke={C.tinta} strokeWidth={2.5} strokeLinejoin="round" />
      <text x={11} y={7} textAnchor="middle" fontFamily={DISPLAY} fontSize={16} fontWeight="bold" fill={C.krem}>C</text>
    </g>
  </svg>
);

/** Pengumuman pembubaran (aset 1) tanpa stempel: dokumen sobek + PENGUMUMAN + 3 baris samar + 1799.
 *  lineO = opacity tiap baris (untuk beat gambar-masuk). s = skala (dokumen sheet 224x232). */
export const Pengumuman: React.FC<{ x: number; y: number; s?: number; lineO?: [number, number, number]; o?: number; rot?: number; sy?: number }> = ({
  x, y, s = 1, lineO = [1, 1, 1], o = 1, rot = 0, sy = 1,
}) => (
  <svg width={240 * s} height={260 * s} viewBox="-120 -130 240 260" style={{ position: 'absolute', left: x - 120 * s, top: y - 130 * s, overflow: 'visible', opacity: o, transform: `rotate(${rot}deg) scale(1, ${sy})` }}>
    <polygon points="-105,-115 -70,-122 -35,-114 0,-121 35,-115 70,-122 105,-114 112,110 -112,110" fill={C.krem} stroke={C.tinta} strokeWidth={3} />
    <text x={0} y={-92} textAnchor="middle" fontFamily={TEXT} fontSize={15} fontWeight="bold" fill={C.tinta} opacity={0.75}>PENGUMUMAN</text>
    {/* baris tulisan tangan arsip (R3: batang lurus terbaca seperti placeholder lorem) */}
    <path d="M-85,-72 Q-42,-76 0,-72 T85,-72" fill="none" stroke={C.abu} strokeWidth={6} strokeLinecap="round" opacity={lineO[0]} />
    <path d="M-85,-56 Q-52,-60 -20,-56 T45,-56" fill="none" stroke={C.abu} strokeWidth={6} strokeLinecap="round" opacity={lineO[1]} />
    <path d="M-85,-40 Q-40,-44 0,-40 T65,-40" fill="none" stroke={C.abu} strokeWidth={6} strokeLinecap="round" opacity={lineO[2]} />
    <text x={0} y={102} textAnchor="middle" fontFamily={DISPLAY} fontSize={34} fontWeight="bold" fill={C.tinta}>1799</text>
  </svg>
);

/** Stempel "BUBAR" (bagian dari aset 1): bingkai merah miring -8 derajat. t = 0..1 (pop). rot = ikut goyang pengumuman.
 *  R3: pop diperbesar (dari skala 0,3, bukan 0,6) supaya hentakan stempel terbaca sebagai beat. */
export const StampBubar: React.FC<{ x: number; y: number; s?: number; t?: number; rot?: number }> = ({ x, y, s = 1, t = 1, rot = 0 }) => {
  const sc = 0.3 + 0.7 * EASE.back(Math.max(0, Math.min(1, t)));
  return (
    <svg width={220 * s} height={90 * s} viewBox="-110 -45 220 90" style={{ position: 'absolute', left: x - 110 * s, top: y - 45 * s, overflow: 'visible', opacity: t <= 0 ? 0 : 1, transform: `rotate(${rot}deg) scale(${sc})` }}>
      <g transform="rotate(-8 0 0)">
        <rect x={-95} y={-30} width={190} height={60} rx={6} fill="none" stroke={C.bata} strokeWidth={5} />
        <text x={0} y={15} textAnchor="middle" fontFamily={DISPLAY} fontSize={40} fontWeight="bold" fill={C.bata}>BUBAR</text>
      </g>
    </svg>
  );
};

/** Menara koin (hook): koin tegak besar + tumpukan 5 keping; keping kaki bisa retak + memerah.
 *  x,y = tengah koin tegak. crack/red 0..1 untuk keping kaki. sc = skala keseluruhan (R1: menara
 *  diperbesar supaya tidak tertutup pengumuman). Dibungkus data-layout-ignore: teks VOC pada koin
 *  tegak sengaja tertutup sebagian oleh pengumuman (z-order) dan tidak boleh dianggap bertumpuk. */
export const Menara: React.FC<{ x: number; y: number; crack?: number; red?: number; o?: number; coinO?: number; sc?: number }> = ({ x, y, crack = 0, red = 0, o = 1, coinO = 1, sc = 1 }) => {
  const discs = [0, 1, 2, 3];
  return (
    <div data-layout-ignore style={{ position: 'absolute', left: x, top: y, transform: `scale(${sc})`, transformOrigin: '0 0' }}>
      <svg width={340} height={520} viewBox="-170 -150 340 520" style={{ position: 'absolute', left: -170, top: -150, overflow: 'visible', opacity: o }}>
      {/* tumpukan keping (4 atas) — sisi gelap di bawah tiap keping supaya terbaca sebagai tumpukan koin, bukan piring (R1) */}
      {discs.map((i) => (
        <g key={i} transform={`translate(${i % 2 === 0 ? 5 : -6},${140 + i * 46})`}>
          <ellipse rx={150} ry={23} fill="#C79A35" transform="translate(0,6)" />
          <ellipse rx={150} ry={23} fill={C.emas} stroke={C.tinta} strokeWidth={3} />
          <ellipse rx={128} ry={15} fill="none" stroke={C.tinta} strokeWidth={1.5} opacity={0.4} />
        </g>
      ))}
      {/* keping kaki: retak + emas -> merah bata; saat memerah ia bergeser keluar dari balik
          pengumuman (R3: di f290 hanya ujung merah yang mengintip) — geser -70*red (satuan svg). */}
      <g transform={`translate(${-4 - 70 * red},324)`}>
        <ellipse rx={150} ry={23} fill="#C79A35" transform="translate(0,6)" />
        <ellipse rx={150} ry={23} fill={C.emas} stroke={C.tinta} strokeWidth={3} />
        <ellipse rx={150} ry={23} fill={C.bata} stroke={C.tinta} strokeWidth={3} opacity={red} />
        <path d="M-40,-14 L-18,2 L-38,16 M30,-16 L12,0 L34,14" fill="none" stroke={C.bata} strokeWidth={4} strokeLinecap="round" opacity={crack} />
      </g>
      {/* koin tegak: selalu terlihat (R1: pengumuman mendarat di kanan menara, bukan di tengahnya);
          retak ikut merambat ke koin tegak saat "diambil" (R3: retak hanya di keping kaki tidak terbaca). */}
      <g transform="translate(0,0)" opacity={coinO}>
        <circle cx={0} cy={0} r={135} fill={C.emas} stroke={C.tinta} strokeWidth={4.5} />
        <circle cx={0} cy={0} r={108} fill="none" stroke={C.tinta} strokeWidth={2.5} />
        <text x={0} y={26} textAnchor="middle" fontFamily={DISPLAY} fontSize={70} fontWeight="bold" fill={C.tinta}>VOC</text>
        <path d="M-69,-84 L-89,-31 L-69,8 L-100,54 L-80,92" fill="none" stroke={C.bata} strokeWidth={7} strokeLinecap="round" opacity={crack} />
      </g>
      </svg>
    </div>
  );
};

{/* ---- kapal (aset 3) ---- */}
const GKapalKecil: React.FC = () => (
  <g>
    <path d="M-110,100 Q-75,82 -40,100 Q-5,82 30,100 Q65,82 110,100" fill="none" stroke={C.biru} strokeWidth={4} strokeLinecap="round" />
    <line x1={0} y1={45} x2={0} y2={-95} stroke={C.tinta} strokeWidth={4} />
    <path d="M8,-88 L8,35 L78,35 Z" fill={C.krem} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
    <path d="M-8,-70 L-8,35 L-72,35 Z" fill={C.krem} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
    <path d="M-95,45 L95,45 L70,95 L-70,95 Z" fill={C.bata} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
    <line x1={0} y1={-95} x2={0} y2={-118} stroke={C.tinta} strokeWidth={3} />
    <rect x={0} y={-118} width={44} height={8} fill={C.merahBendera} stroke={C.tinta} strokeWidth={1.5} />
    <rect x={0} y={-110} width={44} height={8} fill="#FFFFFF" stroke={C.tinta} strokeWidth={1.5} />
    <rect x={0} y={-102} width={44} height={8} fill={C.biruBendera} stroke={C.tinta} strokeWidth={1.5} />
  </g>
);

/** Satu kapal kecil (aset 3, latar). */
export const KapalKecil: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> = ({ x, y, s = 1, rot = 0, o = 1 }) => (
  <svg width={240 * s} height={240 * s} viewBox="-120 -130 240 240" style={{ position: 'absolute', left: x - 120 * s, top: y - 130 * s, overflow: 'visible', opacity: o, transform: `rotate(${rot}deg)` }}>
    <GKapalKecil />
  </svg>
);

/** Armada 3 kapal beriringan (aset 3, revisi): kapal besar di depan + 2 kecil di belakang. rot = oleng pelan. */
export const KapalFleet: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number }> = ({ x, y, s = 1, o = 1, rot = 0 }) => (
  <svg width={320 * s} height={250 * s} viewBox="-160 -110 320 250" style={{ position: 'absolute', left: x - 160 * s, top: y - 110 * s, overflow: 'visible', opacity: o, transform: `rotate(${rot}deg)` }}>
    <g transform="translate(-88,-30) scale(0.42)"><GKapalKecil /></g>
    <g transform="translate(96,-20) scale(0.35)"><GKapalKecil /></g>
    <g transform="translate(12,14) scale(0.9)">
      <path d="M-140,95 Q-105,75 -70,95 Q-35,75 0,95 Q35,75 70,95 Q105,75 140,95" fill="none" stroke={C.biru} strokeWidth={4} strokeLinecap="round" />
      <path d="M-140,118 Q-105,98 -70,118 Q-35,98 0,118 Q35,98 70,118 Q105,98 140,118" fill="none" stroke={C.biru} strokeWidth={4} strokeLinecap="round" />
      <path d="M70,95 Q95,78 118,95 Q105,110 85,106 Q72,102 70,95 Z" fill="#FFFFFF" stroke={C.tinta} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M-140,118 Q-110,128 -80,118" fill="none" stroke={C.biru} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      <line x1={0} y1={45} x2={0} y2={-95} stroke={C.tinta} strokeWidth={4} />
      <path d="M-95,45 L95,45 L70,95 L-70,95 Z" fill={C.bata} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
      <line x1={-88} y1={52} x2={88} y2={52} stroke={C.tinta} strokeWidth={2} opacity={0.4} />
      {[-60, -30, 0, 30, 60].map((cx) => (<circle key={cx} cx={cx} cy={70} r={4.5} fill={C.tinta} />))}
      <path d="M8,-88 L8,35 L78,35 Z" fill={C.krem} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
      <path d="M-8,-70 L-8,35 L-72,35 Z" fill={C.krem} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
      <path d="M0,-95 L-88,38 M0,-95 L88,38" fill="none" stroke={C.tinta} strokeWidth={1.5} opacity={0.65} />
      <line x1={90} y1={50} x2={128} y2={18} stroke={C.tinta} strokeWidth={3.5} strokeLinecap="round" />
      <rect x={-11} y={-68} width={22} height={11} rx={3} fill={C.bata} stroke={C.tinta} strokeWidth={2.5} />
      <line x1={0} y1={-95} x2={0} y2={-118} stroke={C.tinta} strokeWidth={3} />
      <rect x={0} y={-118} width={44} height={8} fill={C.merahBendera} stroke={C.tinta} strokeWidth={1.5} />
      <rect x={0} y={-110} width={44} height={8} fill="#FFFFFF" stroke={C.tinta} strokeWidth={1.5} />
      <rect x={0} y={-102} width={44} height={8} fill={C.biruBendera} stroke={C.tinta} strokeWidth={1.5} />
    </g>
  </svg>
);

/** Peta kertas + jejak pelayaran (aset 4): garis pantai Natural Earth, rute Belanda -> Tanjung Harapan -> Batavia.
 *  x,y = pojok kiri atas peta (1080x730). routeP 0..1 = progres gambar rute (mask). */
export const Map: React.FC<{ x: number; y: number; routeP?: number; o?: number }> = ({ x, y, routeP = 1, o = 1 }) => (
  <svg width={1080} height={730} viewBox="0 0 1080 730" style={{ position: 'absolute', left: x, top: y, overflow: 'visible', opacity: o }}>
    <defs>
      <mask id="voc-route-mask">
        <path d={ROUTE_D} fill="none" stroke="#fff" strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - routeP} />
      </mask>
    </defs>
    <rect width={1080} height={730} fill={C.laut} />
    <path d={LAND_D} fill={C.kertas} stroke={C.tinta} strokeWidth={3} fillRule="evenodd" strokeLinejoin="round" />
    <path d={ROUTE_D} fill="none" stroke={C.bata} strokeWidth={7} strokeDasharray="18 12" strokeLinecap="round" mask="url(#voc-route-mask)" />
    <path d={ARROW_D} fill={C.bata} opacity={routeP >= 0.99 ? 1 : 0} />
    <circle cx={175.3} cy={39.2} r={7} fill={C.tinta} />
    <circle cx={269.8} cy={644} r={7} fill={C.tinta} opacity={routeP >= 0.55 ? 1 : 0} />
    <circle cx={888.6} cy={449.4} r={7} fill={C.tinta} opacity={routeP >= 0.97 ? 1 : 0} />
    {/* label "Belanda" di atas plakat krem (R1: garis pantai menembus huruf → terbaca "Belagda");
        semua label peta diberi halo krem supaya garis peta tidak menembus huruf. */}
    <rect x={28} y={4} width={140} height={38} rx={6} fill={C.krem} stroke={C.tinta} strokeWidth={2} />
    <text x={158.3} y={30} textAnchor="end" fontFamily={TEXT} fontSize={28} fontWeight="bold" fill={C.tinta} stroke={C.krem} strokeWidth={6} paintOrder="stroke" strokeLinejoin="round">Belanda</text>
    <text x={269.8} y={692} textAnchor="middle" fontFamily={TEXT} fontSize={24} fontWeight="bold" fill={C.tinta} stroke={C.krem} strokeWidth={6} paintOrder="stroke" strokeLinejoin="round">Tanjung Harapan</text>
    <text x={904.6} y={492.4} fontFamily={TEXT} fontSize={28} fontWeight="bold" fill={C.tinta} stroke={C.krem} strokeWidth={6} paintOrder="stroke" strokeLinejoin="round">Batavia</text>
    <text x={330} y={520} textAnchor="middle" fontFamily={TEXT} fontSize={22} fontWeight="bold" letterSpacing={4} fill={C.tinta} opacity={0.4} stroke={C.krem} strokeWidth={6} paintOrder="stroke" strokeLinejoin="round">AFRIKA</text>
    <text x={736} y={140} textAnchor="middle" fontFamily={TEXT} fontSize={22} fontWeight="bold" letterSpacing={4} fill={C.tinta} opacity={0.4} stroke={C.krem} strokeWidth={6} paintOrder="stroke" strokeLinejoin="round">ASIA</text>
    <g transform="translate(80,620)">
      <circle cx={0} cy={0} r={26} fill={C.krem} stroke={C.tinta} strokeWidth={2.5} />
      <path d="M0,-20 L6,-5 L20,0 L6,5 L0,20 L-6,5 L-20,0 L-6,-5 Z" fill={C.bata} />
    </g>
  </svg>
);

/** Benteng Batavia (aset 5): dua menara + bendera VOC (triwarna resmi + monogram) + gerbang + label.
 *  wave = sudut kibar bendera (derajat, di sekitar tiang). */
export const Benteng: React.FC<{ x: number; y: number; s?: number; wave?: number; o?: number }> = ({ x, y, s = 1, wave = 0, o = 1 }) => (
  <svg width={320 * s} height={290 * s} viewBox="-160 -140 320 290" style={{ position: 'absolute', left: x - 160 * s, top: y - 140 * s, overflow: 'visible', opacity: o }}>
    <rect x={-135} y={-70} width={45} height={170} fill={C.bata} stroke={C.tinta} strokeWidth={3} />
    <polygon points="-140,-70 -112,-105 -85,-70" fill={C.tinta} />
    <rect x={90} y={-70} width={45} height={170} fill={C.bata} stroke={C.tinta} strokeWidth={3} />
    <polygon points="85,-70 112,-105 140,-70" fill={C.tinta} />
    <line x1={112} y1={-105} x2={112} y2={-130} stroke={C.tinta} strokeWidth={3} />
    {/* bendera diperbesar (R1: tulisan VOC 7px tidak terbaca) — triwarna resmi + monogram, teks 10px */}
    <g transform={`rotate(${wave} 112 -112)`}>
      <rect x={112} y={-130} width={54} height={12} fill={C.merahBendera} stroke={C.tinta} strokeWidth={1.5} />
      <rect x={112} y={-118} width={54} height={12} fill="#FFFFFF" stroke={C.tinta} strokeWidth={1.5} />
      <rect x={112} y={-106} width={54} height={12} fill={C.biruBendera} stroke={C.tinta} strokeWidth={1.5} />
      <text x={139} y={-109} textAnchor="middle" fontFamily={DISPLAY} fontSize={10} fontWeight="bold" fill={C.tinta}>VOC</text>
    </g>
    <rect x={-110} y={-10} width={220} height={110} fill={C.bata} stroke={C.tinta} strokeWidth={3} />
    {[-110, -66, -22, 22, 66].map((mx) => (<rect key={mx} x={mx} y={-28} width={24} height={18} fill={C.bata} stroke={C.tinta} strokeWidth={3} />))}
    <path d="M-25,100 L-25,55 A25,25 0 0 1 25,55 L25,100 Z" fill={C.tinta} />
    <text x={0} y={132} textAnchor="middle" fontFamily={DISPLAY} fontSize={20} fontWeight="bold" fill={C.tinta}>BATAVIA</text>
  </svg>
);

/** Karung rempah goni (aset 6): 'pala' = terikat tali + tag PALA; 'cengkeh' = terbuka + rempah sage + tag CENGKEH. */
export const Karung: React.FC<{ x: number; y: number; s?: number; sx?: number; variant: 'pala' | 'cengkeh'; o?: number }> = ({ x, y, s = 1, sx = 1, variant, o = 1 }) => (
  <svg width={260 * s} height={220 * s} viewBox="-130 -100 260 220" style={{ position: 'absolute', left: x - 130 * s, top: y - 100 * s, overflow: 'visible', opacity: o, transform: `scale(${sx}, 1)` }}>
    {variant === 'pala' ? (
      <g transform="translate(75,-15)">
        <path d="M-89,-70 C-105,-45 -115,0 -113,50 C-112,80 -110,95 -105,100 L-45,100 C-40,95 -38,80 -37,50 C-35,0 -45,-45 -61,-70 Z" fill={C.emas} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
        <path d="M-92,-66 L-58,-66 L-56,-52 L-94,-52 Z" fill={C.tinta} />
        <circle cx={-75} cy={-59} r={5} fill={C.tinta} />
        <path d="M-75,-54 L-82,-44 M-75,-54 L-68,-44" stroke={C.tinta} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M-98,20 Q-93,50 -98,80 M-52,20 Q-57,50 -52,80" fill="none" stroke={C.tinta} strokeWidth={2} opacity={0.45} strokeLinecap="round" />
        <rect x={-111} y={30} width={72} height={24} rx={4} fill={C.krem} stroke={C.tinta} strokeWidth={2} />
        <text x={-75} y={47} textAnchor="middle" fontFamily={TEXT} fontSize={13} fontWeight="bold" fill={C.tinta}>PALA</text>
      </g>
    ) : (
      <g transform="translate(-75,-15)">
        <path d="M61,-70 C45,-45 35,0 37,50 C38,80 40,95 45,100 L105,100 C110,95 112,80 113,50 C115,0 105,-45 89,-70 Z" fill={C.emas} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
        <ellipse cx={75} cy={-70} rx={14} ry={6} fill={C.tinta} />
        <circle cx={55} cy={-82} r={5} fill={C.sage} stroke={C.tinta} strokeWidth={2} />
        <circle cx={75} cy={-88} r={5} fill={C.sage} stroke={C.tinta} strokeWidth={2} />
        <circle cx={95} cy={-82} r={5} fill={C.sage} stroke={C.tinta} strokeWidth={2} />
        <path d="M52,20 Q57,50 52,80 M98,20 Q93,50 98,80" fill="none" stroke={C.tinta} strokeWidth={2} opacity={0.45} strokeLinecap="round" />
        <rect x={39} y={30} width={72} height={24} rx={4} fill={C.krem} stroke={C.tinta} strokeWidth={2} />
        <text x={75} y={47} textAnchor="middle" fontFamily={TEXT} fontSize={12} fontWeight="bold" fill={C.tinta}>CENGKEH</text>
      </g>
    )}
  </svg>
);

{/* ---- sertifikat (aset 7, tanpa meterai — meterai = Coin terpisah) ---- */}
export const Sertifikat: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <svg width={250 * s} height={250 * s} viewBox="-125 -125 250 250" style={{ position: 'absolute', left: x - 125 * s, top: y - 125 * s, overflow: 'visible', opacity: o }}>
    <rect x={-115} y={-115} width={230} height={230} rx={8} fill={C.krem} stroke={C.tinta} strokeWidth={3} />
    <path d="M115,-115 L80,-115 L115,-80 Z" fill={C.kertas} stroke={C.tinta} strokeWidth={2} />
    <text x={0} y={-68} textAnchor="middle" fontFamily={DISPLAY} fontSize={34} fontWeight="bold" fill={C.tinta}>VOC</text>
    {/* baris tulisan tangan arsip (R3: batang lurus terbaca seperti placeholder lorem) */}
    <path d="M-75,-32 Q-37,-36 0,-32 T75,-32" fill="none" stroke={C.abu} strokeWidth={6} strokeLinecap="round" />
    <path d="M-75,-14 Q-37,-18 0,-14 T75,-14" fill="none" stroke={C.abu} strokeWidth={6} strokeLinecap="round" />
    <path d="M-75,4 Q-50,0 -25,4 T25,4" fill="none" stroke={C.abu} strokeWidth={6} strokeLinecap="round" />
    <text x={0} y={58} textAnchor="middle" fontFamily={DISPLAY} fontSize={44} fontWeight="bold" fill={C.tinta}>1602</text>
    <path d="M-60,88 Q-40,73 -20,85 T20,83" fill="none" stroke={C.tinta} strokeWidth={2.5} strokeLinecap="round" />
  </svg>
);

/** Buku utang merah tebal (aset 8): sampul merah + blok halaman + label + tanda hitung + panah turun + pita. */
export const BukuUtang: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number }> = ({ x, y, s = 1, o = 1, rot = 0 }) => (
  <svg width={250 * s} height={280 * s} viewBox="-125 -130 250 280" style={{ position: 'absolute', left: x - 125 * s, top: y - 130 * s, overflow: 'visible', opacity: o, transform: `rotate(${rot}deg)` }}>
    <rect x={-95} y={-102} width={210} height={214} rx={6} fill={C.krem} stroke={C.tinta} strokeWidth={2.5} />
    <path d="M105,-70 L115,-70 M105,-30 L115,-30 M105,10 L115,10 M105,50 L115,50 M105,90 L115,90" stroke={C.abu} strokeWidth={2} />
    <rect x={-105} y={-110} width={210} height={220} rx={10} fill={C.bata} stroke={C.tinta} strokeWidth={3} />
    <rect x={-105} y={-110} width={20} height={220} fill={C.tinta} opacity={0.18} />
    <line x1={-85} y1={-110} x2={-85} y2={110} stroke={C.tinta} strokeWidth={2.5} />
    <path d="M105,-110 L85,-110 L105,-90 Z" fill={C.kertas} stroke={C.tinta} strokeWidth={2} strokeLinejoin="round" />
    <rect x={-70} y={-78} width={140} height={62} rx={4} fill={C.krem} stroke={C.tinta} strokeWidth={2.5} />
    <text x={0} y={-50} textAnchor="middle" fontFamily={DISPLAY} fontSize={26} fontWeight="bold" fill={C.tinta}>BUKU</text>
    <text x={0} y={-22} textAnchor="middle" fontFamily={DISPLAY} fontSize={26} fontWeight="bold" fill={C.tinta}>UTANG</text>
    <path d="M-15,58 L-15,82 M0,58 L0,82 M15,58 L15,82 M30,58 L30,82 M-20,82 L35,58" stroke={C.krem} strokeWidth={4} strokeLinecap="round" />
    <path d="M88,-88 L88,-48 M88,-48 L74,-62 M88,-48 L102,-62" fill="none" stroke={C.krem} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M48,110 L48,132 L58,122 L68,132 L68,110 Z" fill={C.tinta} />
  </svg>
);

/** Pita garis waktu mundur (aset 9): 1799 -> 1619 -> 1602, panah ke kiri = mundur.
 *  active: tahun yang dilingkari merah ('range' = masa jaya, tanpa lingkaran — bintang emas di
 *  tengah rentang 1799-1619; R1: elips lama melingkari dua tahun sekaligus dan bintang selalu di 1602). */
export const Pita: React.FC<{ x: number; y: number; s?: number; active?: '1799' | '1619' | '1602' | 'range'; o?: number }> = ({ x, y, s = 1, active = '1799', o = 1 }) => {
  const col = (yr: string) => (active === yr || (active === 'range' && yr === '1619') ? C.bata : C.tinta);
  const starX = active === '1799' ? -85 : active === '1619' ? 0 : active === '1602' ? 85 : -42;
  return (
    <svg data-layout-ignore width={320 * s} height={160 * s} viewBox="-160 -100 320 160" style={{ position: 'absolute', left: x - 160 * s, top: y - 100 * s, overflow: 'visible', opacity: o }}>
      {/* label "MUNDUR" dihapus di video: bertabrakan dengan caption template (bawah:260).
          Panah ke kiri + tahun yang dilingkari sudah menyampaikan "mundur". */}
      <line x1={120} y1={-66} x2={-108} y2={-66} stroke={C.tinta} strokeWidth={4} />
      <path d="M-108,-66 L-88,-76 L-88,-56 Z" fill={C.tinta} />
      <polygon points="-140,-45 -128,-40 -140,-35 -128,-30 -140,-25 -128,-20 -140,-15 -128,-10 -140,-5 -128,0 -140,5 -128,10 -140,15 -128,20 -140,25 -128,30 -140,35 -128,40 -140,45 140,45 128,40 140,35 128,30 140,25 128,20 140,15 128,10 140,5 128,0 140,-5 128,-10 140,-15 128,-20 140,-25 128,-30 140,-35 128,-40 140,-45" fill={C.krem} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
      {active !== 'range' && (
        <circle cx={active === '1799' ? -85 : active === '1619' ? 0 : 85} cy={0} r={34} fill="none" stroke={C.bata} strokeWidth={3} />
      )}
      <text x={-85} y={11} textAnchor="middle" fontFamily={DISPLAY} fontSize={28} fontWeight="bold" fill={col('1799')}>1799</text>
      <text x={0} y={9} textAnchor="middle" fontFamily={DISPLAY} fontSize={26} fontWeight="bold" fill={col('1619')}>1619</text>
      <text x={85} y={11} textAnchor="middle" fontFamily={DISPLAY} fontSize={28} fontWeight="bold" fill={col('1602')}>1602</text>
      <g transform={`translate(${starX - 85},0)`}>
        <path d="M85,-48 L89,-36 L101,-36 L92,-28 L95,-16 L85,-23 L75,-16 L78,-28 L69,-36 L81,-36 Z" fill={C.emas} stroke={C.tinta} strokeWidth={2} />
      </g>
    </svg>
  );
};

/** Tangan kertas kecil (Cutout): telapak + 4 jari + ibu jari + pergelangan (R1: tanpa pergelangan
 *  tangan terbaca seperti cakar). */
export const Tangan: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> = ({ x, y, s = 1, rot = 0, o = 1 }) => (
  <svg width={100 * s} height={100 * s} viewBox="-50 -40 100 100" style={{ position: 'absolute', left: x - 50 * s, top: y - 40 * s, overflow: 'visible', opacity: o, transform: `rotate(${rot}deg)` }}>
    <rect x={-18} y={44} width={36} height={46} rx={10} fill={C.krem} stroke={C.tinta} strokeWidth={2.5} />
    <rect x={-28} y={-12} width={56} height={62} rx={14} fill={C.krem} stroke={C.tinta} strokeWidth={2.5} />
    {[[-21, -18], [-7, -23], [7, -23], [21, -18]].map(([cx, cy]) => (
      <circle key={cx} cx={cx} cy={cy} r={9} fill={C.krem} stroke={C.tinta} strokeWidth={2.5} />
    ))}
    <circle cx={32} cy={6} r={10} fill={C.krem} stroke={C.tinta} strokeWidth={2.5} />
  </svg>
);

/** Pedang kertas (perang, scene 5). */
export const Pedang: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> = ({ x, y, s = 1, rot = -30, o = 1 }) => (
  <svg width={120 * s} height={160 * s} viewBox="-60 -100 120 160" style={{ position: 'absolute', left: x - 60 * s, top: y - 100 * s, overflow: 'visible', opacity: o, transform: `rotate(${rot}deg)` }}>
    <path d="M0,-90 L14,-70 L6,10 L-6,10 L-14,-70 Z" fill={C.krem} stroke={C.tinta} strokeWidth={2.5} />
    <rect x={-24} y={10} width={48} height={10} rx={3} fill={C.tinta} />
    <rect x={-6} y={20} width={12} height={30} rx={4} fill={C.bata} stroke={C.tinta} strokeWidth={2} />
  </svg>
);

/** Api kecil (kapal terbakar, scene 5). */
export const Api: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <svg width={60 * s} height={90 * s} viewBox="-30 -50 60 90" style={{ position: 'absolute', left: x - 30 * s, top: y - 50 * s, overflow: 'visible', opacity: o }}>
    <path d="M0,-40 C12,-20 18,-5 18,8 C18,22 10,30 0,30 C-10,30 -18,22 -18,8 C-18,-5 -12,-20 0,-40 Z" fill="#F08A1D" stroke={C.tinta} strokeWidth={2} />
    <path d="M0,-18 C7,-6 10,2 10,10 C10,18 5,22 0,22 C-5,22 -10,18 -10,10 C-10,2 -7,-6 0,-18 Z" fill="#F3D46B" />
  </svg>
);

/** Lubang menggerogoti (korupsi, scene 5): robekan kertas — tepi terkoyak krem + isi gelap (tembus).
 *  R1: bintang hitam lama terbaca sebagai noda/stiker, bukan lubang. */
export const Lubang: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <svg width={100 * s} height={100 * s} viewBox="-50 -50 100 100" style={{ position: 'absolute', left: x - 50 * s, top: y - 50 * s, overflow: 'visible', opacity: o }}>
    <path d="M0,-34 L13,-21 L30,-27 L25,-8 L38,3 L21,11 L27,28 L8,21 L0,36 L-11,21 L-30,27 L-23,8 L-38,-3 L-21,-11 L-27,-26 L-11,-19 Z" fill={C.kertas} stroke={C.tinta} strokeWidth={3} strokeLinejoin="round" />
    <path d="M0,-19 L9,-11 L19,-13 L15,0 L21,9 L8,11 L11,21 L0,15 L-9,21 L-11,9 L-21,7 L-13,-2 L-17,-13 L-7,-9 Z" fill="#1A2530" />
    <path d="M-40,-40 L-30,-30 M40,-40 L30,-30 M-42,0 L-32,0 M42,0 L32,0 M-32,42 L-24,32 M32,42 L24,32" stroke={C.bata} strokeWidth={4} strokeLinecap="round" />
  </svg>
);

/** Lembar utang merah (scene 5): jatuh dari atas, menumpuk. */
export const LembarUtang: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> = ({ x, y, s = 1, rot = 0, o = 1 }) => (
  <svg width={140 * s} height={180 * s} viewBox="-70 -90 140 180" style={{ position: 'absolute', left: x - 70 * s, top: y - 90 * s, overflow: 'visible', opacity: o, transform: `rotate(${rot}deg)` }}>
    <rect x={-60} y={-80} width={120} height={160} rx={4} fill={C.bata} stroke={C.tinta} strokeWidth={2.5} />
    <line x1={-45} y1={-55} x2={45} y2={-55} stroke={C.krem} strokeWidth={3} />
    <line x1={-45} y1={-35} x2={45} y2={-35} stroke={C.krem} strokeWidth={3} />
    <line x1={-45} y1={-15} x2={20} y2={-15} stroke={C.krem} strokeWidth={3} />
    <path d="M60,-80 L40,-80 L60,-60 Z" fill={C.kertas} stroke={C.tinta} strokeWidth={2} />
    <text x={0} y={55} textAnchor="middle" fontFamily={DISPLAY} fontSize={22} fontWeight="bold" fill={C.krem}>UTANG</text>
  </svg>
);

/** Label kertas (Tag): persegi krem + teks tengah. x,y = tengah label. */
export const PaperTag: React.FC<{ x: number; y: number; text: string; size?: number; w?: number; h?: number; color?: string; o?: number; rot?: number }> = ({
  x, y, text, size = 44, w, h = 84, color = C.tinta, o = 1, rot = 0,
}) => {
  const ww = w ?? text.length * size * 0.62 + 48;
  return (
    <svg width={ww} height={h} viewBox={`${-ww / 2} ${-h / 2} ${ww} ${h}`} style={{ position: 'absolute', left: x - ww / 2, top: y - h / 2, overflow: 'visible', opacity: o, transform: `rotate(${rot}deg)` }}>
      <rect x={-ww / 2} y={-h / 2} width={ww} height={h} rx={8} fill={C.krem} stroke={C.tinta} strokeWidth={3} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={DISPLAY} fontSize={size} fontWeight="bold" fill={color}>{text}</text>
    </svg>
  );
};

/** Latar dunia kertas 5400x1920 (aset 10): kertas krem + pita warna per zona + pemisah zona + vignette. */
export const DuniaBg: React.FC = () => (
  <svg width={WORLD_W} height={WORLD_H} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    <defs>
      <radialGradient id="voc-vig" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.6" stopColor="#243139" stopOpacity={0} />
        <stop offset="1" stopColor="#243139" stopOpacity={0.07} />
      </radialGradient>
    </defs>
    <rect width={WORLD_W} height={WORLD_H} fill={C.kertas} />
    <rect x={0} y={0} width={1080} height={WORLD_H} fill={C.bata} opacity={0.14} />
    <rect x={1080} y={0} width={1080} height={WORLD_H} fill={C.biru} opacity={0.14} />
    <rect x={2160} y={0} width={1080} height={WORLD_H} fill={C.sage} opacity={0.14} />
    <rect x={3240} y={0} width={1080} height={WORLD_H} fill={C.krem} opacity={0.1} />
    <rect x={4320} y={0} width={1080} height={WORLD_H} fill={C.bata} opacity={0.14} />
    {[1080, 2160, 3240, 4320].map((dx) => (
      <line key={dx} x1={dx} y1={0} x2={dx} y2={WORLD_H} stroke={C.tinta} strokeWidth={2} strokeDasharray="8 6" opacity={0.25} />
    ))}
    <rect width={WORLD_W} height={WORLD_H} fill="url(#voc-vig)" />
  </svg>
);
