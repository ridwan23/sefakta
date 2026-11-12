import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sfx } from '../../shared/audio/Sfx';
import { cueFrames } from '../../shared/episode/cues';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import {
  Bacteria, Bar, Bowl, C, chainY, CrossMark, Enzyme, Flame, FridgeFrame, GlucoseChart, Hexagon, IllustrationTag, LENS, MicroBg, Moon, Person, Pill,
  pop, ramp, SANS, Snowflake, Stamp, StarchChains, WaterDrops, type Pt,
} from './parts';

/** Visual per scene (kunci = id scene di briefs/nasi-dingin-v2.json). Alur: dapur malam (ilustrasi AI) → uji UI
 *  (dua mangkuk) → lensa mikroskop (rantai pati panas → dingin) → bukti (pati resisten, kurva gula) → aturan simpan.
 *  Semua perubahan dipicu waktu kata hasil alignment (cueFrames). Elemen penting di y 180–1460 (subtitle di bawahnya). */

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    {children}
  </svg>
);
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// ------------------------------------------------------------------ 1 · hook: kulkas malam + dua kurva gula
const Hook: React.FC<SceneVisualProps> = ({ scene, durationInFrames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { menaikkan: ['menaikkan', 1.31], gula: ['gula', 1.87], pelan: ['pelan', 2.74], semalam: ['semalam', 5.05], kulkas: ['kulkas', 5.56] });
  // dorong pelan ke mangkuk (titik asal transform = posisi mangkuk di gambar)
  const scale = interpolate(f, [0, durationInFrames], [1.04, 1.2], { easing: Easing.inOut(Easing.sin), extrapolateRight: 'clamp' });
  const card = pop(f, q.menaikkan - 6, 14);
  const glow = ramp(f, q.semalam, 20);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Img src={staticFile('nasi-dingin-v2/img/hook.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, transformOrigin: '34% 56%' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 34% 56%, rgba(255,214,140,0.35) 0%, rgba(255,214,140,0) 38%)', opacity: glow, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,23,54,0.55) 0%, rgba(8,23,54,0) 40%, rgba(8,23,54,0) 70%, rgba(8,23,54,0.7) 100%)' }} />
      <IllustrationTag />
      {card > 0 ? (
        <div style={{ position: 'absolute', left: 80, right: 80, top: 190, height: 440, opacity: Math.min(1, card), transform: `scale(${0.92 + 0.08 * Math.min(1, card)})`, background: C.card, border: `3px solid ${C.line}`, borderRadius: 34, boxShadow: '0 16px 50px rgba(0,0,0,0.45)' }}>
          <div style={{ position: 'absolute', left: 40, top: 26, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: C.dim }}>GULA DARAH SETELAH MAKAN</div>
        </div>
      ) : null}
      <SVG>
        <GlucoseChart id="hook" x={150} y={300} w={760} h={280} o={Math.min(1, card)} drawA={ramp(f, q.gula - 2, 22, Easing.inOut(Easing.cubic))} drawB={ramp(f, q.pelan - 4, 22, Easing.inOut(Easing.cubic))} />
      </SVG>
      <Sfx at={q.semalam} file="hum-low.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2 · konteks: uji UI, dua mangkuk
const Konteks: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    universitas: ['Universitas', 0.57], belasan: ['belasan', 2.83], mereka: ['Mereka', 4.16], baru: ['baru', 5.06], hari: ['hari', 6.04],
    disimpan: ['disimpan', 7.2], sehari: ['sehari', 7.66], dipanaskan: ['dipanaskan', 9.42],
  });
  const people = 1 - 0.45 * ramp(f, q.mereka, 12);
  const left = pop(f, q.baru - 4, 14);
  const right = pop(f, q.hari - 2, 14);
  const fridge = ramp(f, q.disimpan - 2, 12) * (1 - ramp(f, q.dipanaskan, 12));
  const heat = ramp(f, q.dipanaskan - 2, 12);
  const rightSteam = Math.max(1 - ramp(f, q.disimpan, 12), heat);
  return (
    <AbsoluteFill>
      <MicroBg f={f} />
      <Pill x={540} y={250} text="UNIVERSITAS INDONESIA" t={pop(f, q.universitas - 4, 14)} color={C.sugar} size={44} />
      <SVG>
        <g opacity={people}>
          {Array.from({ length: 15 }, (_, i) => (
            <Person key={i} x={540 + ((i % 5) - 2) * 110} y={400 + Math.floor(i / 5) * 100} on={ramp(f, q.belasan + i * 1.2, 6)} />
          ))}
        </g>
        {left > 0 ? (
          <g transform={`translate(290 1040) scale(${Math.min(1, left)}) translate(-290 -1040)`}>
            <Bowl x={290} y={1040} s={0.95} f={f} steam={1} />
            <text x={290} y={1360} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={C.hot}>BARU MATANG</text>
          </g>
        ) : null}
        {left > 0.5 && right > 0 ? (
          <text x={540} y={1060} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={C.dim} opacity={Math.min(1, right)}>vs</text>
        ) : null}
        {right > 0 ? (
          <g transform={`translate(790 1040) scale(${Math.min(1, right)}) translate(-790 -1040)`}>
            <FridgeFrame x={790} y={1010} w={380} h={390} t={fridge} f={f} />
            <Bowl x={790} y={1040} s={0.95} f={f} steam={rightSteam} frost={fridge} />
            <Flame x={790} y={1250} s={0.85} f={f} o={heat} />
            <text x={790} y={1360} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={heat > 0.5 ? C.hot : C.ice}>
              {heat > 0.5 ? 'DIPANASKAN LAGI' : 'DARI KULKAS'}
            </text>
          </g>
        ) : null}
      </SVG>
      <Pill x={790} y={760} text="24 JAM · 4 °C" t={pop(f, q.sehari - 2, 14)} color={C.ice} size={42} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3 · mekanisme: rantai pati di lensa
const GAP_X = -40;
const REST: Pt = [-270, 300];
const Mekanisme: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    dimasak: ['dimasak', 1.68], menyerap: ['menyerap', 2.79], mengembang: ['mengembang', 3.67], dipotong: ['dipotong', 4.84], gula: ['gula', 6.09],
    didinginkan: ['didinginkan', 6.62], merapat: ['merapat', 8.13], kristal: ['kristal', 9.55], enzim2: ['Enzim', 10.32, 1], sulit: ['sulit', 10.57],
    lolos: ['lolos', 12.4], resisten: ['resisten', 14.41],
  });
  const lens = ramp(f, 0, 14, Easing.out(Easing.back(1.4)));
  const swell = ramp(f, q.menyerap - 4, q.mengembang - q.menyerap + 20, Easing.inOut(Easing.cubic));
  const cold = ramp(f, q.didinginkan, q.merapat - q.didinginkan + 18, Easing.inOut(Easing.cubic));
  const shape = Math.max(0.45 * (1 - swell), cold); // beras mentah agak rapat → mengembang → dingin rapat
  const lattice = ramp(f, q.kristal - 6, 16);
  const dy = 70 * ramp(f, q.lolos - 2, 24, Easing.inOut(Easing.cubic));

  // enzim: masuk & menggigit (panas) → mundur → menabrak berkas dingin & memantul
  const biteAt = q.gula - 4;
  const y1 = chainY(1, GAP_X, f, shape);
  const bitePos: Pt = [GAP_X - 92, y1];
  const enter = ramp(f, q.dipotong - 8, biteAt - (q.dipotong - 8), Easing.inOut(Easing.cubic));
  const back1 = ramp(f, biteAt + 8, 18, Easing.inOut(Easing.cubic));
  const contact = q.sulit + 4;
  const hitPos: Pt = [-150, 75 + 14 + 62];
  const approach = ramp(f, q.enzim2 - 6, contact - (q.enzim2 - 6), Easing.in(Easing.quad));
  const bounce = ramp(f, contact, 16, Easing.out(Easing.back(2.2)));
  let ePos: Pt = lerpPt([-480, 260], bitePos, enter);
  ePos = lerpPt(ePos, REST, back1);
  if (f >= q.enzim2 - 6) ePos = lerpPt(lerpPt(REST, hitPos, approach), [-210, 330], bounce);
  const eRot = f >= q.enzim2 - 6 ? -90 * Math.min(1, approach * 1.5) * (1 - bounce * 0.4) : 0;
  const chomp = f < biteAt ? 0.5 + 0.5 * Math.sin(f / 2.2) : f < biteAt + 6 ? 0 : 0.5 + 0.5 * Math.sin(f / 3);
  const eO = ramp(f, q.dipotong - 8, 6);

  const gap = 48 * ramp(f, biteAt, 6) * (1 - ramp(f, q.didinginkan, 20));
  const sugarO = ramp(f, biteAt, 6) * (1 - ramp(f, q.didinginkan + 6, 16));
  const sugarFly = ramp(f, biteAt, 22, Easing.out(Easing.cubic));
  const water = ramp(f, q.menyerap - 4, 12) * (1 - cold);

  const topText = cold > 0.5 ? 'DINGIN: MERAPAT' : 'PANAS: MENGEMBANG';
  const topColor = cold > 0.5 ? C.ice : C.hot;
  const topT = cold > 0.5 ? pop(f, q.didinginkan + 8, 12) : pop(f, q.dimasak - 4, 14) * (1 - ramp(f, q.didinginkan, 6));
  const lolosT = pop(f, q.lolos - 2, 12) * (1 - ramp(f, q.resisten - 4, 6));
  return (
    <AbsoluteFill>
      <MicroBg f={f} cold={cold} />
      <SVG>
        <defs>
          <clipPath id="lensClip"><circle cx={0} cy={0} r={LENS.r - 6} /></clipPath>
        </defs>
        <g transform={`translate(${LENS.cx} ${LENS.cy}) scale(${0.6 + 0.4 * lens})`} opacity={Math.min(1, lens * 1.4)}>
          <circle r={LENS.r} fill="rgba(8,23,54,0.75)" />
          <g clipPath="url(#lensClip)">
            <WaterDrops f={f} o={water} />
            <StarchChains f={f} cold={shape} tint={cold} gap={gap} gapX={GAP_X} lattice={lattice} dy={dy} />
            {cold > 0 ? [0, 1, 2, 3, 4].map((i) => (
              <Snowflake key={i} x={-320 + i * 160} y={((-380 + i * 90 + f * 1.6) % 760 + 760) % 760 - 380} r={18} o={0.5 * cold} rot={f + i * 20} />
            )) : null}
            {sugarO > 0 ? [0, 1, 2].map((i) => (
              <Hexagon key={i} x={GAP_X + sugarFly * (30 + i * 75)} y={y1 - sugarFly * (110 + i * 45)} r={28} o={sugarO} rot={f * 2 + i * 15} />
            )) : null}
            {eO > 0 ? <Enzyme x={ePos[0]} y={ePos[1]} chomp={chomp} rot={eRot} o={eO} /> : null}
          </g>
          <circle r={LENS.r} fill="none" stroke={C.enzyme} strokeOpacity={0.6} strokeWidth={6} />
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={0} y1={-LENS.r} x2={0} y2={-LENS.r + (i % 6 === 0 ? 26 : 12)} transform={`rotate(${i * 15})`} stroke={C.enzyme} strokeOpacity={0.6} strokeWidth={4} />
          ))}
        </g>
        {sugarO > 0.5 ? (
          <text x={LENS.cx + GAP_X + 260} y={LENS.cy + y1 - 210} fontFamily={SANS} fontWeight={800} fontSize={40} fill={C.sugar} opacity={sugarO}>GULA</text>
        ) : null}
      </SVG>
      <Pill x={540} y={300} text={topText} t={topT} color={topColor} size={44} />
      <Pill x={540} y={1340} text="TIDAK JADI GULA" t={lolosT} color={C.ice} size={44} />
      <Stamp x={540} y={1340} text="PATI RESISTEN" t={ramp(f, q.resisten - 2, 8, Easing.in(Easing.quad))} color={C.sugar} rot={-4} size={66} />
      <Sfx at={contact} file="toggle-click.wav" volume={0.5} />
      <Sfx at={q.resisten + 6} file="pop-soft.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 4 · dampak: pati resisten ↑, kurva gula ↓, tetap setelah dipanaskan
const Dampak: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    pati: ['pati', 1.81], banyak: ['banyak', 2.87], lonjakan: ['lonjakan', 3.51], rendah: ['rendah', 5.39], dipanaskan: ['dipanaskan', 8.68],
    lagi: ['lagi', 9.38], polandia: ['Polandia', 10.32],
  });
  const title = ramp(f, 0, 10);
  const card = pop(f, q.lonjakan - 6, 14);
  const stampAt = q.lagi;
  return (
    <AbsoluteFill>
      <MicroBg f={f} cold={0.5} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 215, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.dim, opacity: title }}>KADAR PATI RESISTEN</div>
      {card > 0 ? (
        <div style={{ position: 'absolute', left: 80, right: 80, top: 850, height: 580, opacity: Math.min(1, card), transform: `scale(${0.92 + 0.08 * Math.min(1, card)})`, background: C.card, border: `3px solid ${C.line}`, borderRadius: 34 }}>
          <div style={{ position: 'absolute', left: 40, top: 26, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: C.dim }}>GULA DARAH SETELAH MAKAN</div>
        </div>
      ) : null}
      <SVG>
        <line x1={170} y1={720} x2={910} y2={720} stroke={C.dim} strokeWidth={4} />
        <Bar x={340} base={720} w={200} h={150} t={ramp(f, q.pati - 6, 16)} color={C.hot} label="BARU MATANG" />
        <Bar x={740} base={720} w={200} h={330} t={ramp(f, q.banyak - 6, 22, Easing.out(Easing.back(1.3)))} color={C.ice} label="DARI KULKAS" dashed />
        <Flame x={930} y={660} s={0.6} f={f} o={ramp(f, q.dipanaskan - 2, 10)} />
        <GlucoseChart id="dampak" x={150} y={960} w={760} h={380} legendY={0.42} o={Math.min(1, card)} drawA={ramp(f, q.lonjakan, 24, Easing.inOut(Easing.cubic))} drawB={ramp(f, q.rendah - 6, 24, Easing.inOut(Easing.cubic))} />
      </SVG>
      <Stamp x={740} y={340} text="TETAP ADA" t={ramp(f, stampAt - 6, 6, Easing.in(Easing.quad))} color={C.sugar} rot={-7} size={58} />
      <Pill x={745} y={1010} text="STUDI POLANDIA" sub="diabetes tipe 1 · pola serupa" t={pop(f, q.polandia - 2, 14)} color={C.enzyme} size={38} />
      <Sfx at={stampAt} file="stamp-thud.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 5 · jawaban: batas studi + aturan simpan (frame akhir = kulkas ✓)
const Jawaban: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    ramah: ['ramah', 2.05], kecil: ['kecil', 3.98], penderita: ['penderita', 4.5], simpan: ['Simpan', 6.98], kulkas: ['kulkas', 8.0],
    jangan: ['jangan', 8.71], semalaman: ['semalaman', 8.84], meja: ['meja', 9.71], hilang: ['hilang', 11.24], dipanaskan: ['dipanaskan', 12.12],
  });
  const enter = pop(f, 0, 14);
  const split = ramp(f, q.simpan - 4, 18, Easing.inOut(Easing.cubic));
  const fridgePos = lerpPt([540, 900], [300, 950], split);
  const fridgeScale = interpolate(split, [0, 1], [1.15, 0.95]);
  const table = pop(f, q.jangan - 4, 14);
  const pillsOut = 1 - ramp(f, q.simpan - 6, 10);
  const end = ramp(f, q.dipanaskan + 18, 16);
  const heat = ramp(f, q.dipanaskan - 2, 10);
  const crossAt = q.meja + 6;
  return (
    <AbsoluteFill>
      <MicroBg f={f} cold={0.6} />
      <SVG>
        <g transform={`translate(${fridgePos[0]} ${fridgePos[1]}) scale(${fridgeScale * Math.min(1, enter) * (1 + 0.05 * end)}) translate(-300 -950)`}>
          <FridgeFrame x={300} y={920} w={380} h={430} t={1} f={f} checked={pop(f, Math.max(q.ramah - 2, 0), 14)} />
          <Bowl x={300} y={970} s={0.85} f={f} frost={1} />
        </g>
        {table > 0 ? (
          <g opacity={Math.min(1, table) * (1 - 0.55 * end)} transform={`translate(790 950) scale(${0.9 + 0.1 * Math.min(1, table)}) translate(-790 -950)`}>
            <Moon x={650} y={760} r={44} />
            <line x1={600} y1={1140} x2={980} y2={1140} stroke={C.cream} strokeWidth={10} strokeLinecap="round" />
            <line x1={640} y1={1140} x2={640} y2={1230} stroke={C.cream} strokeWidth={8} strokeLinecap="round" />
            <line x1={940} y1={1140} x2={940} y2={1230} stroke={C.cream} strokeWidth={8} strokeLinecap="round" />
            <Bowl x={790} y={1032} s={0.85} f={f} />
            <Bacteria x={790} y={990} n={interpolate(f, [q.semalaman, q.meja + 24], [0, 9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} f={f} spread={115} />
            <Flame x={790} y={1210} s={0.6} f={f} o={heat} />
            <CrossMark x={950} y={790} t={pop(f, crossAt, 12)} />
          </g>
        ) : null}
        {split > 0.5 ? (
          <text x={300} y={1320} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={C.ice} opacity={ramp(f, q.kulkas - 2, 10)}>SEGERA KE KULKAS</text>
        ) : null}
        {table > 0 ? (
          <text x={790} y={1320} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={C.bad} opacity={Math.min(1, table) * (1 - 0.55 * end)}>
            {f >= q.hilang ? 'RACUN TETAP ADA' : 'SEMALAMAN DI MEJA'}
          </text>
        ) : null}
      </SVG>
      <Pill x={540} y={300} text="STUDI KECIL" t={pop(f, q.kecil - 6, 14) * pillsOut} color={C.sugar} size={46} />
      <Pill x={540} y={430} text="DIABETES? TANYA DOKTER" t={pop(f, q.penderita - 2, 14) * pillsOut} color={C.enzyme} size={42} />
      <Sfx at={crossAt} file="stamp-thud.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

export const VISUALS: SceneVisuals = { hook: Hook, konteks: Konteks, mekanisme: Mekanisme, dampak: Dampak, jawaban: Jawaban };
