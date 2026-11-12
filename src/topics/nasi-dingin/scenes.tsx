import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sfx } from '../../shared/audio/Sfx';
import { cueFrames } from '../../shared/episode/cues';
import { IllustrationBackdrop } from '../../shared/episode/IllustrationBackdrop';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import { lerp } from '../../shared/motion';
import { Bacteria, Bowl, C, Check, Clock, Cross, Enzyme, Flame, Fridge, GlucoseCurve, Label, LENS, Paper, Person, pop, ramp, SANS, Snow, Stamp, StarchChains, Steam } from './parts';

/** Visual per scene (kunci = id scene di briefs/nasi-dingin.json). Semua perubahan dipicu waktu kata hasil alignment
 *  (`cueFrames`; detik cadangan = perkiraan sebelum align). Koordinat layar 1080×1920; isi di y 180–1460
 *  (subtitle di bawahnya), kanan atas (x > 800, y < 175) kosong untuk watermark. */

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>{children}</svg>
);
/** Pudar keluar di akhir scene untuk elemen yang tidak berlanjut. */
const fadeOut = (f: number, at: number, len = 10) => 1 - ramp(f, at, len);

// ------------------------------------------------------------------ 1. hook (ilustrasi AI)
const Hook: React.FC<SceneVisualProps> = ({ scene, durationInFrames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { dua: ['dua', 2.77], gula: ['gula', 4.11], kemarin: ['kemarin', 5.34] });
  const end = (w: string, sec: number) => Math.round(((scene.captions?.find((c) => c.text.toLowerCase().startsWith(w))?.endMs ?? sec * 1000) / 1000) * fps);
  const slamAt = end('dua', 3.2) - 4;
  return (
    <AbsoluteFill>
      <IllustrationBackdrop src="nasi-dingin/img/hook.jpg" durationInFrames={durationInFrames} fromScale={1.02} toScale={1.12} veilOpacity={0.12} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(246,241,231,0) 70%, rgba(246,241,231,0.92) 80%)' }} />
      <div style={{ position: 'absolute', left: 64, top: 200, fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: C.ink, background: 'rgba(255,253,247,0.85)', border: `2px solid ${C.faint}`, borderRadius: 10, padding: '6px 14px' }}>
        ILUSTRASI
      </div>
      <Stamp x={540} y={520} text="KELAS DUA?" t={ramp(f, slamAt, 6, Easing.in(Easing.quad))} strike={ramp(f, q.gula, 10)} />
      <Label x={540} y={760} text="RAMAH GULA DARAH?" t={pop(f, q.kemarin)} size={62} bg={C.hi} />
      <Sfx at={slamAt + 6} file="pop-soft.wav" volume={0.8} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2. konteks (uji UI: baru matang vs didinginkan)
const Konteks: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    univ: ['Universitas', 2.12], baru: ['baru', 4.64], dingin: ['didinginkan', 6.06], kulkas: ['kulkas', 7.42], panas: ['dipanaskan', 8.19],
  });
  const enter = ramp(f, 0, 14);
  const fridge = ramp(f, q.dingin - 4, 12) * (1 - ramp(f, q.panas, 12));
  const door = 1 - ramp(f, q.dingin + 6, 10); // pintu menutup setelah mangkuk masuk
  const rightLabel = f < q.dingin ? 'NASI YANG SAMA' : f < q.panas ? 'SEHARI SEMALAM' : 'DIPANASKAN LAGI';
  return (
    <AbsoluteFill>
      <Paper />
      <Label x={540} y={290} text="PENELITI" t={ramp(f, q.univ - 6, 10)} size={34} color={C.dim} />
      <Label x={540} y={370} text="Universitas Indonesia" t={pop(f, q.univ)} size={60} bg={C.card} border={`4px solid ${C.ink}`} />
      <SVG>
        <g opacity={enter}>
          <line x1={540} x2={540} y1={560} y2={1260} stroke={C.faint} strokeWidth={5} strokeDasharray="14 14" />
          <Steam x={290} y={790} o={ramp(f, q.baru, 12)} f={f} />
          <Bowl x={290} y={920} />
          <Steam x={790} y={790} o={ramp(f, q.panas + 8, 14)} f={f + 20} />
          <Bowl x={790} y={920} tint={lerp(0, 1, fridge) > 0.5 ? C.cold : C.card} />
          <Fridge x={790} y={900} w={400} h={500} o={fridge} door={door} />
          <Snow x={790} y={890} r={70 * fridge * (1 - door)} color={C.coldLine} />
          <Clock x={930} y={650} r={56} sweep={ramp(f, q.dingin + 10, Math.max(12, q.panas - q.dingin - 14), Easing.inOut(Easing.sin))} o={fridge} />
          <Flame x={790} y={1120} o={ramp(f, q.panas, 10)} f={f} s={0.9} />
        </g>
      </SVG>
      <Label x={290} y={1250} text="BARU MATANG" t={ramp(f, q.baru, 10)} size={42} />
      <Label x={790} y={1250} text={rightLabel} t={ramp(f, q.baru + 6, 10)} size={42} color={f >= q.dingin && f < q.panas ? C.coldLine : C.ink} />
      <Sfx at={q.kulkas + Math.round(0.55 * fps)} file="hum-low.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3. mekanisme (pati panas → kristal)
const Mekanisme: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    pati: ['pati', 1.31], panas: ['panas', 2.26], dipecah: ['dipecah', 4.64], dingin: ['dingin', 5.98], kristal: ['kristal', 8.72], susah: ['susah', 10.19], inilah: ['Inilah', 11.6],
  });
  const lens = pop(f, 0, 16);
  const chains = ramp(f, q.pati - 4, 12);
  const cut = ramp(f, q.dipecah - 2, 22) * (1 - ramp(f, q.dingin - 4, 8));
  const cold = ramp(f, q.dingin + 2, q.kristal - q.dingin + 6, Easing.inOut(Easing.cubic));
  // enzim: panas = menyapu ke kiri sambil memotong; dingin = mendekat, membentur kisi, memantul
  const hit = q.susah + Math.round(1.05 * fps); // ≥ 2 dtk setelah SFX kristal
  const sweep = ramp(f, q.dipecah - 4, 24, Easing.inOut(Easing.quad));
  const hotX = lerp(1000, 120, sweep);
  const approach = ramp(f, q.susah - 6, hit - q.susah + 6, Easing.in(Easing.quad));
  const recoil = ramp(f, hit, 14, Easing.out(Easing.back(2)));
  const coldX = lerp(1040, 885, approach) + 45 * recoil; // label ENZIM tetap di x ≤ 1000
  const inHot = f < q.dingin;
  const enzX = inHot ? hotX : coldX;
  const enzO = inHot ? ramp(f, q.dipecah - 6, 6) * (1 - ramp(f, q.dipecah + 22, 8)) : ramp(f, q.susah - 6, 8);
  const chomp = Math.abs(Math.sin(f * 0.6));
  const tint = interpolate(cold, [0, 1], [0, 1]);
  return (
    <AbsoluteFill>
      <Paper />
      <Label x={540} y={300} text={cold < 0.5 ? 'PANAS: LONGGAR' : 'DINGIN: RAPAT SEPERTI KRISTAL'} t={f < q.panas ? 0 : 1} size={52} color={cold < 0.5 ? C.wood : C.coldLine} />
      <SVG>
        <defs>
          <clipPath id="lens"><circle cx={LENS.x} cy={LENS.y} r={LENS.r - 8} /></clipPath>
        </defs>
        <g transform={`translate(${LENS.x} ${LENS.y}) scale(${lens}) translate(${-LENS.x} ${-LENS.y})`}>
          <circle cx={LENS.x} cy={LENS.y} r={LENS.r} fill={C.rice} />
          <circle cx={LENS.x} cy={LENS.y} r={LENS.r} fill={C.cold} opacity={tint} />
          <g clipPath="url(#lens)">
            <StarchChains cold={cold} cut={cut} f={f} o={chains} />
          </g>
          <circle cx={LENS.x} cy={LENS.y} r={LENS.r} fill="none" stroke={C.ink} strokeWidth={10} />
        </g>
        <Enzyme x={enzX} y={inHot ? LENS.y - 46 : LENS.y} chomp={inHot ? chomp : 1 - recoil * 0.6} o={enzO} r={70} />
        {!inHot ? <Cross x={860} y={LENS.y - 120} t={pop(f, hit, 10) * (1 - ramp(f, q.inilah + 10, 8))} r={40} /> : null}
      </SVG>
      <Label x={enzX} y={(inHot ? LENS.y - 46 : LENS.y) + 110} text="ENZIM" t={enzO} size={34} color={C.wood} />
      <Label x={540} y={1300} text="GULA" t={cut > 0.4 ? cut : 0} size={44} bg={C.hi} />
      <Label x={540} y={1300} text="PATI RESISTEN" t={pop(f, q.inilah)} size={64} bg={C.hi} />
      <Sfx at={q.kristal + Math.round(0.56 * fps)} file="notif-ting.wav" volume={0.7} />
      <Sfx at={hit} file="toggle-click.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 4. dampak (pati resisten naik, kurva gula landai)
const G = { x0: 150, y0: 1180, w: 800, h: 520 };
const PK = G.x0 + G.w * 0.32; // x puncak kurva (GlucoseCurve: puncak di u = 0,32)
const Dampak: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    pati: ['pati', 0.64], naik: ['naik', 2.17], dua: ['dua', 3.02], kelompok: ['Sekelompok', 3.92], lonjakan: ['lonjakan', 6.35], rendah: ['rendah', 7.86], studi: ['studi', 8.74],
  });
  const thud = q.rendah + Math.round(0.42 * fps); // akhir kata "rendah"
  const barsO = ramp(f, 0, 10) * fadeOut(f, q.kelompok, 10);
  const b1 = ramp(f, q.pati, 16), b2 = ramp(f, q.naik - 4, 24, Easing.out(Easing.cubic));
  const graphO = ramp(f, q.kelompok + 6, 12);
  return (
    <AbsoluteFill>
      <Paper />
      {/* A. batang pati resisten (tanpa angka absolut; rasio dari studi UI) */}
      <div style={{ position: 'absolute', inset: 0, opacity: barsO }}>
        <Label x={540} y={300} text="PATI RESISTEN" size={56} />
        <SVG>
          <line x1={140} x2={940} y1={1120} y2={1120} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          <rect x={220} y={1120 - 230 * b1} width={240} height={230 * b1} rx={18} fill={C.card} stroke={C.ink} strokeWidth={8} />
          <rect x={620} y={1120 - 600 * b2} width={240} height={600 * b2} rx={18} fill={C.hi} stroke={C.ink} strokeWidth={8} />
          <Snow x={740} y={1120 - 600 * b2 + 60} r={32 * b2} color={C.ink} />
        </SVG>
        <Label x={340} y={1180} text="BARU MATANG" size={40} t={b1} />
        <Label x={740} y={1180} text="NASI DINGIN" size={40} t={b1} />
        <Label x={740} y={420} text="> 2×" t={pop(f, q.dua)} size={72} bg={C.card} border={`5px solid ${C.ink}`} />
      </div>
      {/* B. kurva gula darah setelah makan */}
      <div style={{ position: 'absolute', inset: 0, opacity: graphO }}>
        <SVG>
          {[0, 1, 2, 3, 4].map((i) => <Person key={i} x={300 + i * 120} y={340} t={pop(f, q.kelompok + 4 + i * 3)} />)}
          <line x1={G.x0} x2={G.x0} y1={G.y0 - G.h} y2={G.y0} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={G.x0} x2={G.x0 + G.w} y1={G.y0} y2={G.y0} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <GlucoseCurve x0={G.x0} y0={G.y0} w={G.w} peak={420} draw={ramp(f, q.lonjakan - 4, 22, Easing.inOut(Easing.quad))} dashed color={C.dim} />
          <GlucoseCurve x0={G.x0} y0={G.y0} w={G.w} peak={290} draw={ramp(f, q.lonjakan + 14, 22, Easing.inOut(Easing.quad))} color={C.ink} width={12} />
          {/* panah selisih puncak */}
          <g opacity={ramp(f, thud - 2, 8)}>
            <line x1={PK} x2={PK} y1={G.y0 - 30 - 440} y2={G.y0 - 30 - 318} stroke={C.hiLine} strokeWidth={9} strokeLinecap="round" />
            <path d={`M ${PK - 22} ${G.y0 - 30 - 340} L ${PK} ${G.y0 - 30 - 312} L ${PK + 22} ${G.y0 - 30 - 340}`} fill="none" stroke={C.hiLine} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </SVG>
        <div style={{ position: 'absolute', left: G.x0 + 20, top: G.y0 - G.h - 10, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.dim }}>GULA DARAH</div>
        <div style={{ position: 'absolute', left: G.x0 + G.w - 170, top: G.y0 + 16, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.dim }}>WAKTU →</div>
        <Label x={PK + 250} y={G.y0 - 30 - 400} text="baru matang" t={ramp(f, q.lonjakan + 8, 10)} size={36} color={C.dim} weight={700} />
        <Label x={PK + 270} y={G.y0 - 30 - 210} text="nasi dingin" t={ramp(f, q.lonjakan + 30, 10)} size={40} bg={C.hi} />
        <Label x={540} y={1320} text="studi kecil · hasil belum seragam" t={ramp(f, q.studi, 12)} size={36} color={C.ink} weight={700} bg={C.card} border={`3px solid ${C.faint}`} />
      </div>
      <Sfx at={thud} file="stamp-thud.wav" volume={0.7} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 5. jawaban (kulkas ✓ vs semalaman di meja ✗)
const Jawaban: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    kemarin: ['kemarin', 0.78], kulkas: ['kulkas', 4.62], semalaman: ['semalaman', 6.01], meja: ['meja', 6.7], racun: ['Racun', 6.96], panas: ['panas', 8.17], tidak: ['tidak', 9.66],
  });
  const left = ramp(f, q.kulkas - 6, 12), right = ramp(f, q.semalaman - 6, 12);
  return (
    <AbsoluteFill>
      <Paper />
      <Label x={540} y={300} text="BUKAN NASI KELAS DUA" t={pop(f, q.kemarin)} size={56} bg={C.hi} />
      <SVG>
        {/* kiri: cepat ke kulkas */}
        <g opacity={left} transform={`translate(0 ${lerp(30, 0, left)})`}>
          <rect x={60} y={440} width={450} height={860} rx={36} fill={C.card} stroke={C.faint} strokeWidth={4} />
          <Fridge x={285} y={800} w={330} h={520} o={1} door={1} />
          <Bowl x={285} y={830} s={0.8} tint={C.cold} />
          <Check x={285} y={1150} t={pop(f, q.kulkas + 4)} />
        </g>
        {/* kanan: semalaman di meja */}
        <g opacity={right} transform={`translate(0 ${lerp(30, 0, right)})`}>
          <rect x={570} y={440} width={450} height={860} rx={36} fill={C.ink} />
          <circle cx={900} cy={560} r={46} fill={C.hi} />
          <circle cx={922} cy={544} r={42} fill={C.ink} />
          <rect x={600} y={960} width={390} height={22} rx={11} fill={C.wood} />
          <Bowl x={795} y={860} s={0.8} />
          <Bacteria x={795} y={800} spread={130} grow={ramp(f, q.semalaman, Math.max(20, q.racun - q.semalaman + 10))} f={f} glow={ramp(f, q.racun, 10)} />
          <Flame x={795} y={1090} o={ramp(f, q.panas, 10)} f={f} s={0.8} />
          <Cross x={795} y={1200} t={pop(f, q.meja)} />
        </g>
      </SVG>
      <Label x={285} y={1360} text="CEPAT KE KULKAS" t={ramp(f, q.kulkas, 10)} size={38} color={C.ok} />
      <Label x={795} y={1360} text="SEMALAMAN DI MEJA" t={ramp(f, q.semalaman, 10)} size={38} color={C.warn} />
      <Label x={795} y={690} text="TETAP ADA" t={pop(f, q.tidak)} size={36} bg={C.warn} color="#FFFFFF" />
    </AbsoluteFill>
  );
};

export const VISUALS: SceneVisuals = {
  hook: Hook,
  konteks: Konteks,
  mekanisme: Mekanisme,
  dampak: Dampak,
  jawaban: Jawaban,
};
