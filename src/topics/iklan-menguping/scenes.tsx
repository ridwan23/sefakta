import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sfx } from '../../shared/audio/Sfx';
import { CameraRig, CamLayer, useCamera, type CamKey, type CamPose } from '../../shared/camera/CameraRig';
import { cueFrames } from '../../shared/episode/cues';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import { AppGrid, Bubble, BUBBLE, C, DataLine, Ear, FarField, InterestPanel, NearDust, PANEL_SCALE, NODE, Phone, PHONE, pop, ramp, SANS, scrollTo, SHOE_B, SignalIcon, Sneaker, Stamp, WLabel, type Pt } from './parts';

/** Visual per scene (kunci = id scene di briefs/iklan-menguping.json), versi uji retensi 6 beat (±49 dtk).
 *  Kamera terkunci kecuali satu pull-back di awal "mekanisme" (objek diam selama kamera bergerak). Informasi dibawa
 *  oleh aksi objek (kartu masuk, ikon muncul, garis data menyala, sorot kartu). Antarscene memakai cut; frame
 *  terakhir memotong kembali ke komposisi pembuka (loop). Semua perubahan dipicu waktu kata hasil alignment. */

// ------------------------------------------------------------------ pose kamera
const HOOK: CamPose = { x: 1000, y: 800, zoom: 1.0 }; // gelembung + ponsel; ponsel di atas zona subtitle
const WIDE: CamPose = { x: 1000, y: 860, zoom: 0.62 }; // sinyal aktivitas + panel + ponsel
const GRID: CamPose = { x: 1000, y: 1000, zoom: 0.3 }; // kisi aplikasi
const SCREEN_VIEW: CamPose = { x: 1000, y: 1010, zoom: 1.5 }; // layar ponsel (feed)

const still = (pose: CamPose): CamKey[] => [{ frame: 0, pose }];

// ------------------------------------------------------------------ status dunia
type Scr = React.ComponentProps<typeof Phone>['s'];
type WorldState = {
  bubbleMe: number;
  bubbleFriend: number;
  ear: number;
  scr: Scr;
  label: number; // "DARI AKTIVITASMU"
  grid: number;
  search: number;
  video: number;
  area: number;
  lSearch: number;
  lVideo: number;
  lArea: number;
  toPhone: number; // garis sinyal → ponsel (penutup)
  panel: number;
  tag: number;
  adFly: number;
};
const S0: WorldState = { bubbleMe: 0, bubbleFriend: 0, ear: 0, scr: {}, label: 0, grid: 0, search: 0, video: 0, area: 0, lSearch: 0, lVideo: 0, lArea: 0, toPhone: 0, panel: 0, tag: 0, adFly: 0 };
/** Komposisi pembuka (frame 0 hook) = frame terakhir penutup, supaya video menyambung saat diputar ulang. */
const OPENING: WorldState = { ...S0, bubbleMe: 1, bubbleFriend: 1, scr: { lock: 1 } };

const PANEL_IN: Pt = [NODE.panel[0] - 300 * PANEL_SCALE, NODE.panel[1] + 40 * PANEL_SCALE];
const PANEL_BOTTOM: Pt = [NODE.panel[0], NODE.panel[1] + 125 * PANEL_SCALE];
const PHONE_L: Pt = [PHONE.x - PHONE.w / 2, PHONE.y];
const out = (p: Pt): Pt => [p[0] + 120, p[1]];

const World: React.FC<{ s: WorldState; f: number }> = ({ s, f }) => {
  const fly = s.adFly;
  const flyP: Pt = [interpolate(fly, [0, 1], [PANEL_BOTTOM[0], PHONE.x]), interpolate(fly, [0, 1], [PANEL_BOTTOM[1], PHONE.y + 100])];
  return (
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      <AppGrid reveal={s.grid} o={s.grid > 0 ? 0.95 : 0} />
      <svg width={4000} height={3000} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {/* sinyal aktivitas → panel perkiraan minat (garis biru penuh) */}
        <DataLine a={out(NODE.search)} b={PANEL_IN} draw={s.lSearch} f={f} bend={-0.12} />
        <DataLine a={out(NODE.video)} b={PANEL_IN} draw={s.lVideo} f={f} bend={-0.16} />
        <DataLine a={out(NODE.area)} b={PANEL_IN} draw={s.lArea} f={f} bend={-0.2} />
        {/* penutup: sinyal langsung ke ponsel */}
        <DataLine a={out(NODE.search)} b={PHONE_L} draw={s.toPhone} f={f} bend={0.1} />
        <DataLine a={out(NODE.video)} b={PHONE_L} draw={s.toPhone} f={f} bend={0} />
        <DataLine a={out(NODE.area)} b={PHONE_L} draw={s.toPhone} f={f} bend={-0.1} />
        <SignalIcon x={NODE.search[0]} y={NODE.search[1]} t={s.search} kind="search" />
        <SignalIcon x={NODE.video[0]} y={NODE.video[1]} t={s.video} kind="video" />
        <SignalIcon x={NODE.area[0]} y={NODE.area[1]} t={s.area} kind="area" />
        <InterestPanel t={s.panel} tag={s.tag} f={f} />
        <Bubble x={BUBBLE.me.x} y={BUBBLE.me.y} t={s.bubbleMe} tail="right" label="KAMU" f={f} />
        <Bubble x={BUBBLE.friend.x} y={BUBBLE.friend.y} t={s.bubbleFriend} tail="left" label="TEMAN" f={f} seed={2} />
        <Phone s={s.scr} f={f} />
        <Ear x={1290} y={1250} t={s.ear} f={f} />
        {fly > 0 && fly < 1 ? (
          <g transform={`translate(${flyP[0]} ${flyP[1]}) scale(${interpolate(fly, [0, 1], [1, 0.75])})`}>
            <rect x={-150} y={-90} width={300} height={180} rx={24} fill={C.hi} stroke={C.hiLine} strokeWidth={6} />
            <Sneaker x={0} y={0} s={1.3} color={C.ink} />
          </g>
        ) : null}
      </svg>
      <WLabel x={NODE.search[0]} y={NODE.search[1] + 175} text="CARI" o={s.search} size={72} color={C.data} />
      <WLabel x={NODE.video[0]} y={NODE.video[1] + 175} text="TONTON" o={s.video} size={72} color={C.data} />
      <WLabel x={NODE.area[0]} y={NODE.area[1] + 175} text="AREA" o={s.area} size={72} color={C.data} />
      <Stamp x={PHONE.x} y={390} text="DARI AKTIVITASMU" t={s.label} color={C.data} size={58} rot={0} />
    </div>
  );
};

// ------------------------------------------------------------------ HUD studi (ruang layar)
const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');
const card: React.CSSProperties = { background: 'rgba(255,255,255,0.97)', borderRadius: 34, boxShadow: '0 12px 40px rgba(15,27,51,0.15)', fontFamily: SANS, textAlign: 'center' };

const StudyHud: React.FC<{ f: number; q: Record<'peneliti' | 'ribu' | 'sebagian' | 'mendeteksi', number> }> = ({ f, q }) => {
  const question = pop(f, 6, 14) * (1 - ramp(f, q.peneliti - 4, 8));
  const row1 = pop(f, q.ribu - 2, 14);
  const n1 = interpolate(f, [q.ribu - 2, q.ribu + 16], [0, 17260], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const row2 = pop(f, q.sebagian, 14);
  const lit = ramp(f, q.sebagian, 18);
  const result = pop(f, q.mendeteksi, 16);
  return (
    <>
      {/* 9.100 dari 17.260 (±53%) diuji dinamis: sebagian kisi ditandai */}
      {lit > 0 ? <div style={{ position: 'absolute', left: 0, top: 150, width: `${53 * lit}%`, height: 1330, background: 'rgba(31,111,235,0.14)', borderRight: `6px dashed ${C.data}` }} /> : null}
      {question > 0 ? (
        <div style={{ ...card, position: 'absolute', left: 170, right: 170, top: 820, padding: '26px 0', opacity: Math.min(1, question), transform: `scale(${0.9 + 0.1 * question})`, border: `5px dashed ${C.voice}`, fontWeight: 800, fontSize: 72, color: C.text }}>
          MEREKAM SUARA?
        </div>
      ) : null}
      {row1 > 0 ? (
        <div style={{ ...card, position: 'absolute', left: 110, right: 110, top: 220, padding: '22px 30px', border: `4px solid ${C.data}`, opacity: Math.min(1, row1) }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 22 }}>
            <span style={{ fontWeight: 800, fontSize: 112, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{fmt(n1)}</span>
            <span style={{ fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.data }}>DIANALISIS</span>
          </div>
          {row2 > 0 ? (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 22, marginTop: 6, opacity: Math.min(1, row2), transform: `translateY(${(1 - Math.min(1, row2)) * 12}px)` }}>
              <span style={{ fontWeight: 800, fontSize: 84, color: C.text }}>9.100</span>
              <span style={{ fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.data }}>DIUJI DINAMIS</span>
            </div>
          ) : null}
        </div>
      ) : null}
      {result > 0 ? (
        <div style={{ ...card, position: 'absolute', left: 120, right: 120, top: 880, padding: '30px 30px 34px', border: `5px solid ${C.text}`, opacity: Math.min(1, result), transform: `scale(${0.9 + 0.1 * Math.min(1, result)})` }}>
          <svg width={300} height={110} viewBox="-150 -55 300 110" style={{ display: 'block', margin: '0 auto 6px' }}>
            {[20, 44, 70, 38, 90, 56, 30, 64, 96, 48, 72, 34, 18].map((h, i) => <rect key={i} x={-138 + i * 22} y={-h / 2} width={12} height={h} rx={6} fill={C.gray} />)}
          </svg>
          <div style={{ fontWeight: 800, fontSize: 60, color: C.text, lineHeight: 1.1 }}>KEBOCORAN AUDIO</div>
          <div style={{ fontWeight: 800, fontSize: 46, color: C.data, marginTop: 8 }}>tak terdeteksi dalam uji</div>
        </div>
      ) : null}
    </>
  );
};

// ------------------------------------------------------------------ panggung
const Stage: React.FC<{ path: CamKey[]; s: WorldState; motionBlur?: number; hud?: React.ReactNode }> = ({ path, s, motionBlur = 0, hud }) => {
  const f = useCurrentFrame();
  const cam = useCamera(path, { shake: 0 });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <CameraRig cam={cam} motionBlur={motionBlur} maxBlur={6} background={`radial-gradient(ellipse at 50% 42%, #FFFDF8 0%, ${C.bg} 55%, ${C.bgDeep} 100%)`}>
        <CamLayer depth={0.3}>
          <FarField f={f} />
        </CamLayer>
        <CamLayer>
          <World s={s} f={f} />
        </CamLayer>
        <CamLayer depth={1.6} blur={7}>
          <NearDust f={f} />
        </CamLayer>
      </CameraRig>
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 42%, rgba(15,27,51,0) 60%, rgba(15,27,51,0.12) 100%)' }} />
      {hud}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 1 · hook: obrolan → iklan muncul → menguping?
const Hook: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { iklannya: ['iklannya', 1.82], menguping: ['menguping', 3.72] });
  const enter = (d: number) => interpolate(f, [d, d + 8], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2)) });
  const s: WorldState = {
    ...OPENING,
    bubbleMe: enter(0),
    bubbleFriend: enter(3),
    scr: { lock: 1 - ramp(f, q.iklannya - 4, 10), ad: ramp(f, q.iklannya - 4, 12, Easing.out(Easing.back(1.2))), adGlow: ramp(f, q.iklannya + 8, 10) },
    ear: pop(f, q.menguping - 4, 14),
  };
  return (
    <>
      <Stage path={still(HOOK)} s={s} />
      <Sfx at={q.iklannya - 4} file="notif-ting.wav" volume={0.6} />
    </>
  );
};

// ------------------------------------------------------------------ 2 · jawaban awal: belum tentu, dari aktivitasmu
const JawabanAwal: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { belum: ['Belum', 0.19], menebak: ['menebak', 1.95] });
  // gelembung memudar saat "menebak" agar label punya ruang; obrolan tidak dibutuhkan untuk menebak
  const bubbles = 1 - ramp(f, q.menebak - 2, 10);
  const s: WorldState = {
    ...S0,
    bubbleMe: bubbles,
    bubbleFriend: bubbles,
    scr: { ad: 1, adGlow: 1 },
    ear: 1 - ramp(f, q.belum, 10),
    label: pop(f, q.menebak + 6, 14),
  };
  return <Stage path={still(HOOK)} s={s} />;
};

// ------------------------------------------------------------------ 3 · mekanisme: cari, tonton, area → perkiraan minat → iklan
const Mekanisme: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { jejak: ['jejak', 1.18], cari: ['cari', 3.74], video: ['video', 4.29], area: ['area', 5.63], memperkirakan: ['memperkirakan', 8.51] });
  // pull-back saat objek diam (label sudah hilang), lalu kamera terkunci sebelum garis data menyala
  const PULL: [number, number] = [8, 32];
  const keys: CamKey[] = [
    { frame: PULL[0], pose: HOOK },
    { frame: PULL[1], pose: WIDE, ease: Easing.inOut(Easing.cubic) },
  ];
  const flyAt = q.memperkirakan + 14;
  const landed = flyAt + 16;
  const s: WorldState = {
    ...S0,
    label: 1 - ramp(f, 0, 7),
    scr: { ad: 1 - ramp(f, PULL[1] + 4, 10) + ramp(f, landed, 8), adGlow: ramp(f, landed, 10), lock: ramp(f, PULL[1] + 4, 10) * (1 - ramp(f, landed, 8)) },
    panel: pop(f, Math.max(PULL[1] + 4, q.jejak), 14),
    search: pop(f, q.cari - 2, 14),
    lSearch: ramp(f, q.cari + 4, 14, Easing.inOut(Easing.cubic)),
    video: pop(f, q.video - 2, 14),
    lVideo: ramp(f, q.video + 4, 14, Easing.inOut(Easing.cubic)),
    area: pop(f, q.area - 2, 14),
    lArea: ramp(f, q.area + 4, 14, Easing.inOut(Easing.cubic)),
    tag: ramp(f, q.memperkirakan, 12),
    adFly: ramp(f, flyAt, 16, Easing.inOut(Easing.cubic)),
  };
  return (
    <>
      <Stage path={keys} s={s} motionBlur={0.12} />
      <Sfx at={landed} file="notif-ting.wav" volume={0.6} />
    </>
  );
};

// ------------------------------------------------------------------ 4 · studi: 17.260 dianalisis, 9.100 diuji, tak terdeteksi dalam uji
const Studi: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { peneliti: ['peneliti', 2.66], ribu: ['ribu', 5.3], sebagian: ['sebagian', 7.61], mendeteksi: ['mendeteksi', 9.48] });
  const s: WorldState = { ...S0, grid: 1, scr: { lock: 1 } };
  return <Stage path={still(GRID)} s={s} hud={<StudyHud f={f} q={q} />} />;
};

// ------------------------------------------------------------------ 5 · ilusi frekuensi: feed berhenti, satu kartu sepatu disorot
const Ilusi: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { frekuensi: ['frekuensi', 2.92], iklan: ['iklan', 5.16], sadari: ['sadari', 7.0], lewat: ['lewat', 8.21] });
  const highlight = q.sadari + 20; // setelah kata "sadari" selesai, bersama SFX
  const s: WorldState = {
    ...S0,
    scr: {
      feed: 1,
      scroll: interpolate(f, [4, q.frekuensi + 12], [0, scrollTo(SHOE_B)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }),
      spot: ramp(f, q.iklan, 14),
      match: pop(f, highlight, 14),
      fade: ramp(f, q.lewat, 18),
    },
  };
  return (
    <>
      <Stage path={still(SCREEN_VIEW)} s={s} />
      <Sfx at={highlight} file="pop-soft.wav" volume={0.7} />
    </>
  );
};

// ------------------------------------------------------------------ 6 · penutup: datamu yang bercerita → tahan pose, langsung CTA
const Penutup: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { datamu: ['datamu', 4.11], bercerita: ['bercerita', 5.22] });
  const s: WorldState = { ...S0, scr: { ad: 1, adGlow: 1 }, search: 1, video: 1, area: 1, toPhone: ramp(f, q.datamu, 16, Easing.inOut(Easing.cubic)) };
  return <Stage path={still(WIDE)} s={s} />;
};

export const VISUALS: SceneVisuals = { hook: Hook, 'jawaban-awal': JawabanAwal, mekanisme: Mekanisme, studi: Studi, ilusi: Ilusi, penutup: Penutup };
