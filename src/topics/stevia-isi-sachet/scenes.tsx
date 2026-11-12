import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sfx } from '../../shared/audio/Sfx';
import { cueFrames } from '../../shared/episode/cues';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import { hash } from '../../shared/motion';
import { Backdrop, Balance, BackPanel, C, Enzyme, fade, Glucose, GutBand, Magnifier, Pinch, Plant, pop, ramp, Sachet, SouthAmericaCard, SugarSpoon, Tag, Txt, WIN, type Layer } from './parts';

/** Visual per scene (kunci = id scene di briefs/stevia-isi-sachet.json). Kamera terkunci; informasi dibawa oleh objek:
 *  sachet dibuka → isi berlapis → asal & kemanisan stevia → pengisi ditambahkan → jalur kalori → daftar komposisi.
 *  Semua perubahan dipicu waktu kata hasil alignment (cueFrames). Area aman: tidak ada isi penting di y > 1460
 *  (subtitle) dan di x > 800, y < 175 (watermark). */

const SX = 540; // pusat sachet
const SY = 860;
/** Isi sachet di komposisi pembuka/penutup: lapisan stevia tipis + pengisi. */
const STEVIA_H = 40;
const openingStack = (fillerLabel?: string, labelO = 0): Layer[] => [
  { kind: 'stevia', h: STEVIA_H, t: 1 },
  { kind: 'filler', h: WIN.h - STEVIA_H, t: 1, label: fillerLabel, labelO, seed: 9 },
];

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
    {children}
  </svg>
);

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Backdrop f={f} />
      {children}
    </AbsoluteFill>
  );
};

/** Tanda tanya besar di area pengisi. */
const Question: React.FC<{ x: number; y: number; t: number; f: number }> = ({ x, y, t, f }) =>
  t <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${t}) rotate(${Math.sin(f / 10) * 4})`}>
      <circle r={86} fill={C.paper} stroke={C.ink} strokeWidth={6} />
      <Txt x={0} y={6} text="?" size={130} color={C.ink} />
    </g>
  );

/** Penanda lapisan stevia di bawah sachet: garis + tag. */
const SteviaCallout: React.FC<{ t: number; label: string }> = ({ t, label }) => {
  if (t <= 0) return null;
  const layerY = SY + WIN.y + WIN.h - STEVIA_H / 2;
  return (
    <g opacity={Math.min(1, t)}>
      <path d={`M ${SX + 150} ${layerY} L ${SX + 150} ${1345}`} stroke={C.leafDark} strokeWidth={5} strokeDasharray={`${t * 200} 400`} />
      <circle cx={SX + 150} cy={layerY} r={10} fill={C.leafDark} />
      <Tag x={SX + 60} y={1370} w={label.length * 27 + 70} h={74} t={t} stroke={C.leaf}>
        <Txt x={0} y={3} text={label} size={40} color={C.leafDark} />
      </Tag>
    </g>
  );
};

// ------------------------------------------------------------------ komposisi pembuka = frame terakhir (loop)
/** Video tanpa CTA dan berulang: frame 0 hook dan frame terakhir jawaban sama persis. Pembuka langsung utuh
 *  (tanpa animasi masuk dari nol), sachet tertutup, miring -3°, tag "ISINYA STEVIA?". */
const OPEN_ROT = -3;
const OpeningTag: React.FC<{ t: number }> = ({ t }) => (
  <Tag x={540} y={290} w={600} h={120} t={t}>
    <Txt x={0} y={4} text="ISINYA STEVIA?" size={62} />
  </Tag>
);

// ------------------------------------------------------------------ 1 · hook: sachet stevia → isinya kebanyakan bukan stevia?
const Hook: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { sebungkus: ['sebungkus', 1.9], kebanyakan: ['kebanyakan', 4.41], apa: ['apa', 6.41] });
  const winAt = q.sebungkus + 8;
  const win = ramp(f, winAt, 14, Easing.inOut(Easing.cubic));
  return (
    <Frame>
      <Svg>
        <OpeningTag t={1} />
        <Sachet x={SX} y={SY} rot={OPEN_ROT + Math.sin(f / 30) * 1.2} win={win} layers={openingStack()} f={f} />
        <SteviaCallout t={ramp(f, q.kebanyakan, 14)} label="STEVIA" />
        <Question x={SX} y={SY + 60} t={pop(f, q.apa - 2, 14)} f={f} />
      </Svg>
      <Sfx at={winAt} file="pop-soft.wav" volume={0.6} />
    </Frame>
  );
};

// ------------------------------------------------------------------ 2 · konteks: daun Amerika Selatan → steviol glikosida → 200–400×
const Konteks: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { amerika: ['Amerika', 2.07], berabad: ['berabad-abad', 3.98], manisnya: ['Manisnya', 6.3], steviol: ['steviol', 8.42], ratusan: ['ratusan', 10.15] });
  const grow = ramp(f, 0, 40, Easing.out(Easing.cubic));
  const toZoom = ramp(f, q.manisnya - 6, 20, Easing.inOut(Easing.cubic));
  const mapT = pop(f, q.amerika - 2, 14) * fade(f, q.manisnya - 8, 12);
  const ageT = pop(f, q.berabad - 2, 12) * fade(f, q.manisnya - 8, 12);
  // tanaman: di kanan saat peta tampil, lalu mengecil ke kiri atas saat kaca pembesar masuk
  const px = interpolate(toZoom, [0, 1], [700, 250]);
  const py = interpolate(toZoom, [0, 1], [1250, 760]);
  const ps = interpolate(toZoom, [0, 1], [1.05, 0.62]);
  const magT = pop(f, q.manisnya + 4, 16);
  const mol = ramp(f, q.steviol - 4, 24);
  return (
    <Frame>
      <SouthAmericaCard x={70} y={230} w={340} h={500} t={mapT} />
      <Svg>
        <Plant x={px} y={py} grow={grow} s={ps} />
        <Tag x={240} y={810} w={340} h={110} t={ageT} stroke={C.leaf}>
          <Txt x={0} y={-16} text="DIPAKAI" size={34} color={C.leafDark} />
          <Txt x={0} y={22} text="BERABAD-ABAD" size={34} color={C.leafDark} />
        </Tag>
        {magT > 0 ? <path d={`M 360 ${560} L ${560} ${640}`} stroke={C.ink} strokeWidth={4} strokeDasharray="10 10" opacity={Math.min(1, magT)} /> : null}
        <Magnifier x={680} y={720} r={250} t={magT} mol={mol} />
        <Tag x={680} y={1060} w={620} h={92} t={pop(f, q.steviol, 12)} stroke={C.leaf}>
          <Txt x={0} y={3} text="STEVIOL GLIKOSIDA" size={46} color={C.leafDark} />
        </Tag>
        <Tag x={540} y={1300} w={820} h={220} t={pop(f, q.ratusan - 2, 14)}>
          <Txt x={0} y={-30} text="200–400×" size={112} color={C.ink} />
          <Txt x={0} y={58} text="LEBIH MANIS DARI GULA" size={40} color={C.dim} spacing={2} />
        </Tag>
      </Svg>
    </Frame>
  );
};

// ------------------------------------------------------------------ 3 · mekanisme: sejumput = sesendok → sachet diisi pengisi
const Mekanisme: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    sedikit: ['sedikit', 2.68],
    sejumput: ['Sejumput', 3.75],
    semanis: ['semanis', 5.44],
    supaya: ['Supaya', 6.58],
    pengisi: ['pengisi', 10.66],
    eritritol: ['eritritol', 11.76],
    dekstrosa: ['dekstrosa', 12.57],
    malto: ['maltodekstrin', 13.63],
  });
  // timbangan: sendok gula di kiri; sejumput stevia jatuh ke kanan → seimbang
  const drop = ramp(f, q.sejumput - 2, 14, Easing.in(Easing.quad));
  const tilt = interpolate(ramp(f, q.sejumput + 10, 18, Easing.out(Easing.back(2))), [0, 1], [11, 0]);
  const balO = pop(f, 0, 10) * fade(f, q.supaya, 14);
  const balY = 560 - ramp(f, q.supaya, 14) * 80;
  // sachet: masuk saat "Supaya", stevia lebih dulu, lalu tiga pengisi pada katanya masing-masing
  const sT = pop(f, q.supaya + 6, 14);
  const fillStart = q.pengisi + 18; // setelah kata "pengisi" selesai (bersama SFX)
  const LH = (WIN.h - STEVIA_H) / 3;
  const layers: Layer[] = [
    { kind: 'stevia', h: STEVIA_H, t: ramp(f, q.supaya + 22, 12) },
    { kind: 'filler', h: LH, t: ramp(f, Math.max(fillStart, q.eritritol - 6), 14), label: 'ERITRITOL', labelO: ramp(f, q.eritritol, 8), seed: 11 },
    { kind: 'filler', h: LH, t: ramp(f, q.dekstrosa - 4, 14), label: 'DEKSTROSA', labelO: ramp(f, q.dekstrosa + 2, 8), seed: 12 },
    { kind: 'filler', h: LH, t: ramp(f, q.malto - 4, 14), label: 'MALTODEKSTRIN', labelO: ramp(f, q.malto + 2, 8), seed: 13 },
  ];
  // butir yang tercurah ke sachet (dekoratif, deterministik)
  const pouring = f > q.supaya + 10 && f < q.malto + 14;
  return (
    <Frame>
      <Svg>
        <Balance
          x={540}
          y={balY}
          tilt={tilt}
          o={balO}
          left={<SugarSpoon x={0} y={-6} s={0.95} />}
          right={drop > 0 ? <Pinch x={0} y={-6 - (1 - drop) * 220} s={1.3} /> : null}
        />
        <Txt x={300} y={balY + 330} text="SESENDOK GULA" size={38} color={C.dim} o={balO * pop(f, 4, 12)} />
        <Txt x={780} y={balY + 330} text="SEJUMPUT STEVIA" size={38} color={C.leafDark} o={balO * pop(f, q.sejumput + 6, 12)} />
        <Tag x={540} y={balY + 470} w={460} h={96} t={pop(f, q.semanis, 12) * balO}>
          <Txt x={0} y={4} text="≈ SAMA MANIS" size={50} />
        </Tag>
        <Tag x={540} y={300} w={560} h={104} t={pop(f, q.pengisi - 2, 12)} fill={C.fillerSoft} stroke={C.filler} dashed>
          <Txt x={0} y={4} text="+ BAHAN PENGISI" size={50} color={C.fillerDark} />
        </Tag>
        <Sachet x={SX} y={SY + 40} t={sT} win={1} layers={layers} f={f} />
        {pouring && sT > 0.9
          ? Array.from({ length: 10 }, (_, i) => {
              const ph = ((f + i * 7) % 24) / 24;
              const steviaPhase = f < q.supaya + 34;
              const gx = SX - 60 + hash(i * 3.1) * 120;
              const gy = 380 + ph * 260;
              return steviaPhase ? <circle key={i} cx={gx} cy={gy} r={6} fill={C.leaf} /> : f > fillStart - 4 ? <rect key={i} x={gx - 7} y={gy - 7} width={14} height={14} rx={3} fill={C.paper} stroke={C.filler} strokeWidth={2.5} /> : null;
            })
          : null}
      </Svg>
      <Sfx at={fillStart} file="pop-soft.wav" volume={0.55} />
    </Frame>
  );
};

// ------------------------------------------------------------------ 4 · kalori: stevia lewat tanpa diurai; pengisi → glukosa → kalori
const Kalori: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    enzim: ['Enzim', 2.6],
    tidak: ['tidak', 3.7],
    mengurai: ['mengurai', 4.24],
    praktis: ['praktis', 6.19],
    dekstrosa: ['dekstrosa', 7.64],
    karbohidrat: ['karbohidrat', 9.37],
    menyumbang: ['menyumbang', 11.02],
  });
  const LX = 290, RX = 790, GUT = 820;
  const head = pop(f, 0, 12);
  // jalur stevia: hijau, putus-putus (tidak diurai)
  const lPath = ramp(f, q.mengurai, 30, Easing.inOut(Easing.cubic));
  const lFlow = f > q.mengurai + 10;
  // jalur pengisi: abu, penuh; berubah jadi glukosa di saluran cerna
  const rPath = ramp(f, q.dekstrosa - 2, 26, Easing.inOut(Easing.cubic));
  const toGlu = ramp(f, q.karbohidrat - 4, 16);
  const kalAt = q.menyumbang + 6;
  return (
    <Frame>
      <Svg>
        <GutBand y={GUT} t={ramp(f, 4, 14)} f={f} />
        <Txt x={540} y={GUT + 2} text="SALURAN CERNA" size={32} color="#8A4B3A" spacing={2} o={ramp(f, 8, 12)} />
        {/* kepala kolom */}
        <Tag x={LX} y={300} w={300} h={96} t={head} stroke={C.leaf}>
          <Txt x={0} y={4} text="STEVIA" size={48} color={C.leafDark} />
        </Tag>
        <Tag x={RX} y={300} w={300} h={96} t={pop(f, 4, 12)} fill={C.fillerSoft} stroke={C.filler} dashed>
          <Txt x={0} y={4} text="PENGISI" size={48} color={C.fillerDark} />
        </Tag>
        {/* sumber: molekul stevia (bulat hijau) dan butir pengisi (kotak) */}
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={`s${i}`} cx={LX - 70 + hash(i * 2.2) * 140} cy={430 + hash(i * 5.1) * 70} r={13} fill={C.leaf} opacity={head} />
        ))}
        {Array.from({ length: 7 }, (_, i) => {
          const gx = RX - 70 + hash(i * 3.6) * 140, gy = 430 + hash(i * 4.4) * 70;
          return <rect key={`p${i}`} x={gx - 13} y={gy - 13} width={26} height={26} rx={5} fill={C.paper} stroke={C.filler} strokeWidth={4} opacity={pop(f, 4, 12)} transform={`rotate(${hash(i) * 60} ${gx} ${gy})`} />;
        })}
        {/* jalur kiri */}
        <path d={`M ${LX} 530 L ${LX} ${530 + 590 * lPath}`} stroke={C.leaf} strokeWidth={8} strokeDasharray="20 16" strokeLinecap="round" />
        {lFlow
          ? Array.from({ length: 4 }, (_, i) => {
              const ph = ((f - q.mengurai) / 50 + i / 4) % 1;
              return <circle key={i} cx={LX} cy={540 + ph * 560} r={13} fill={C.leaf} stroke={C.paper} strokeWidth={4} />;
            })
          : null}
        <Enzyme x={LX - 140} y={GUT} t={pop(f, q.enzim - 2, 12)} blocked={pop(f, q.tidak, 10)} />
        <Txt x={LX + 24} y={GUT + 120} text="TAK TERURAI" size={30} color={C.warm} anchor="start" o={ramp(f, q.mengurai, 10)} />
        <Tag x={LX} y={1230} w={330} h={120} t={pop(f, q.praktis - 2, 14)} stroke={C.leaf}>
          <Txt x={0} y={4} text="≈ 0 KKAL" size={58} color={C.leafDark} />
        </Tag>
        {/* jalur kanan */}
        <path d={`M ${RX} 530 L ${RX} ${530 + 590 * rPath}`} stroke={C.filler} strokeWidth={8} strokeLinecap="round" />
        {rPath > 0.3
          ? Array.from({ length: 4 }, (_, i) => {
              const ph = ((f - q.dekstrosa) / 50 + i / 4) % 1;
              const y = 540 + ph * 560;
              const below = y > GUT - 20;
              return below && toGlu > 0 ? (
                <Glucose key={i} x={RX} y={y} s={0.8 + 0.4 * toGlu} />
              ) : (
                <rect key={i} x={RX - 13} y={y - 13} width={26} height={26} rx={5} fill={C.paper} stroke={C.filler} strokeWidth={4} />
              );
            })
          : null}
        <Txt x={RX - 120} y={GUT + 120} text="GLUKOSA" size={30} color={C.warm} anchor="middle" o={toGlu} />
        <Tag x={RX} y={1230} w={330} h={120} t={pop(f, kalAt, 14)} fill={C.hi} stroke={C.hiLine}>
          <Txt x={0} y={4} text="KALORI" size={58} color={C.ink} />
        </Tag>
      </Svg>
      <Sfx at={kalAt} file="stamp-thud.wav" volume={0.55} />
    </Frame>
  );
};

// ------------------------------------------------------------------ 5 · jawaban: berbalik ke komposisi → urutan pertama → kembali ke depan
const Jawaban: React.FC<SceneVisualProps> = ({ scene, durationInFrames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    komposisi: ['komposisi', 1.96],
    berurutan: ['berurutan', 5.06],
    terbanyak: ['terbanyak', 6.06],
    pertama: ['pertama', 8.29],
    jadi: ['Jadi', 10.5],
    depan: ['depan', 11.9],
    belum: ['belum', 12.69],
  });
  // flip 1: depan → belakang (sekitar "komposisi"); flip 2: belakang → depan ("Jadi")
  const F1 = q.komposisi - 10;
  const F2 = q.jadi;
  const flip1 = interpolate(f, [F1, F1 + 9, F1 + 18], [1, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const flip2 = interpolate(f, [F2, F2 + 9, F2 + 18], [1, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const side: 'front' | 'back' = f < F1 + 9 || f >= F2 + 9 ? 'front' : 'back';
  const flip = Math.max(0.02, f < F2 ? flip1 : flip2);
  const rows = [0, 1, 2].map((i) => ramp(f, F1 + 18 + i * 6, 10));
  // penutup loop: setelah narasi selesai, kembali ke komposisi pembuka (jendela menutup, penanda hilang, tag muncul).
  // Selesai 2 frame sebelum akhir scene, jadi frame terakhir = frame 0 hook.
  const CLOSE = Math.max(q.belum + 30, durationInFrames - 22);
  const close = ramp(f, CLOSE, 18, Easing.inOut(Easing.cubic));
  const keep = 1 - close;
  return (
    <Frame>
      <Svg>
        {side === 'back' ? (
          <BackPanel x={540} y={840} flip={flip} rows={rows} arrow={ramp(f, q.berurutan - 2, 22, Easing.inOut(Easing.cubic))} most={pop(f, q.terbanyak - 2, 12)} first={ramp(f, q.pertama, 12, Easing.out(Easing.cubic))} />
        ) : (
          <>
            <OpeningTag t={close} />
            <Sachet x={SX} y={SY} rot={f < F1 ? OPEN_ROT : OPEN_ROT * ramp(f, F2 + 9, 10)} flip={flip} win={f > F2 ? keep : 1} layers={openingStack()} f={f} ring={f > F2 ? ramp(f, q.depan - 2, 16) * keep : 0} />
            {f > F2 ? <SteviaCallout t={ramp(f, F2 + 18, 12) * keep} label="STEVIA" /> : null}
            {f > F2 ? <Question x={SX} y={SY + 60} t={pop(f, q.belum - 2, 14) * keep} f={f} /> : null}
          </>
        )}
      </Svg>
    </Frame>
  );
};

export const VISUALS: SceneVisuals = { hook: Hook, konteks: Konteks, mekanisme: Mekanisme, kalori: Kalori, jawaban: Jawaban };
