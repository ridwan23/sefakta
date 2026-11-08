import React, { useId } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { beatKick, camAt, CameraRig, CamLayer, mixPose, useCamera, type CamKey, type CamPose } from '../../shared/camera/CameraRig';
import { cueFrames } from '../../shared/episode/cues';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import { AIR, AirLine, BONE, BONE2, BoneDots, C, EQ_HEAD, EQ_REC, EqPanel, FarField, Hand, Head, LISTENER_EAR, NearDust, P, PHONE, Phone, PLATE, pop, ramp, Rings, SANS, TO_LISTENER, TO_MIC, WLabel, XrayPlate, type Pt } from './parts';

/** Visual per scene (kunci = id scene di briefs/suara-rekaman-v2.json). Satu dunia kontinu (kepala · ponsel ·
 *  pendengar) dijelajahi camera rig; pose akhir kamera tiap scene = pose awal scene berikutnya. Semua perubahan
 *  dipicu waktu kata hasil alignment (cueFrames); angka detik di cue hanya cadangan sebelum `npm run align`. */

// ------------------------------------------------------------------ pose sambungan antarscene
const HOOK_END: CamPose = { x: 700, y: 960, zoom: 0.95 };
const KONTEKS_END: CamPose = { x: 580, y: 950, zoom: 1.9 };
const MEK_END: CamPose = { x: 760, y: 900, zoom: 0.8 };
const DAMPAK_END: CamPose = { x: 1120, y: 700, zoom: 0.6 };
const FINAL: CamPose = { x: 1650, y: 1050, zoom: 0.3 };

const SHAKE = 2.5;
const IO = Easing.inOut(Easing.cubic);
const WHIP = Easing.out(Easing.exp);
const SIN = Easing.inOut(Easing.sin);

const HEAD_LEVELS = [0.95, 0.85, 0.7, 0.6, 0.5, 0.45];
const REC_LEVELS = [0.32, 0.42, 0.7, 0.6, 0.5, 0.45];

// ------------------------------------------------------------------ status dunia
type WorldState = {
  plateX: number; // pemindai x-ray: ilustrasi terlihat di kiri x ini, siluet di kanannya
  scan: number;
  head: number;
  air: number;
  airO: number;
  airPulse: number | null;
  mouth: number;
  bone: number;
  bone2: number;
  boneO: number;
  bonePulse: number | null;
  larynx: number;
  cochlea: number;
  inner: number; // gelombang tulang di dalam kepala (amber putus-putus)
  siput: number;
  udaraLabel: number;
  question: number;
  phonePlay: number;
  phoneCheck: number;
  phoneRec: number;
  phoneRings: number;
  toMic: number;
  boneBlock: number;
  eqHead: number;
  eqBoost: number;
  eqRec: number;
  eqCut: number;
  eqHigh: number;
  hand: number;
  handOut: number;
  listener: number;
  toListener: number;
  listenerGlow: number;
  earGlow: number;
};
const S0: WorldState = {
  plateX: 0, scan: 0, head: 1, air: 0, airO: 1, airPulse: null, mouth: 0, bone: 0, bone2: 0, boneO: 1, bonePulse: null, larynx: 0, cochlea: 0, inner: 0, siput: 0,
  udaraLabel: 0, question: 0, phonePlay: 0, phoneCheck: 0, phoneRec: 0, phoneRings: 0, toMic: 0, boneBlock: 0, eqHead: 0, eqBoost: 0, eqRec: 0, eqCut: 0, eqHigh: 0,
  hand: 0, handOut: 0, listener: 0, toListener: 0, listenerGlow: 0, earGlow: 0,
};

const World: React.FC<{ s: WorldState; f: number }> = ({ s, f }) => {
  const clip = useId().replace(/:/g, '');
  const handT = s.hand * (1 - s.handOut);
  const hx = interpolate(s.hand, [0, 1], [260, 540]) + s.handOut * -40;
  const hy = interpolate(s.hand, [0, 1], [1450, 935]) + s.handOut * 420;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      {/* siluet kepala (kanan garis pemindai) */}
      <svg width={4000} height={2400} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <defs>
          <clipPath id={`c${clip}`}>
            <rect x={s.plateX} y={-500} width={5000} height={3500} />
          </clipPath>
        </defs>
        <g clipPath={`url(#c${clip})`}>
          <Head id={`me${clip}`} o={s.head} f={f} earGlow={s.earGlow} />
        </g>
        <Head id={`ls${clip}`} mirror o={s.listener} rim={C.text} f={f} earGlow={s.listenerGlow} />
      </svg>
      <svg width={4000} height={2400} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {s.scan > 0 ? (
          <g opacity={s.scan}>
            <rect x={s.plateX - 60} y={240} width={60} height={1600} fill={C.air} opacity={0.12} />
            <line x1={s.plateX} x2={s.plateX} y1={240} y2={1840} stroke={C.air} strokeWidth={8} />
          </g>
        ) : null}
        {/* gelombang dari mulut, tulang, rumah siput */}
        <Rings at={P.mouth} f={f} o={s.mouth} color={C.air} maxR={260} arc={[-70, 70]} width={8} />
        <Rings at={P.larynx} f={f} o={s.larynx} color={C.bone} maxR={170} dashed width={7} period={24} />
        <Rings at={P.cochlea} f={f} o={s.inner} color={C.bone} maxR={520} count={4} dashed width={9} period={30} />
        {s.cochlea > 0 ? (
          <g opacity={s.cochlea}>
            <circle cx={P.cochlea[0]} cy={P.cochlea[1]} r={70 + 6 * Math.sin(f / 4)} fill="none" stroke={C.bone} strokeWidth={6} />
            <circle cx={P.cochlea[0]} cy={P.cochlea[1]} r={92 + 6 * Math.sin(f / 4 + 1)} fill="none" stroke={C.air} strokeWidth={4} strokeDasharray="14 10" opacity={s.airO * Math.min(1, s.air)} />
          </g>
        ) : null}
        <AirLine t={AIR} draw={s.air} pulse={s.airPulse} o={s.airO} />
        <BoneDots t={BONE} draw={s.bone} f={f} pulse={s.bonePulse} o={s.boneO} />
        <BoneDots t={BONE2} draw={s.bone2} f={f} o={s.boneO} />
        {/* ponsel: rekaman hanya menerima udara */}
        <Rings at={[PHONE.x, PHONE.y - PHONE.h / 2 + 20]} f={f} o={s.phoneRings} color={C.air} maxR={300} arc={[-150, -30]} width={8} period={26} />
        <AirLine t={TO_MIC} draw={s.toMic} pulse={s.toMic >= 1 ? (f / 40) % 1 : null} />
        <AirLine t={TO_LISTENER} draw={s.toListener} pulse={s.toListener >= 1 ? (f / 55) % 1 : null} />
        <Phone f={f} play={s.phonePlay} check={s.phoneCheck} rec={s.phoneRec} />
        {s.boneBlock > 0 ? (
          <g opacity={s.boneBlock} transform="translate(1250 1345)">
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={-150 + i * 30} cy={-50 + i * 10} r={8} fill={C.bone} />)}
            <circle r={54} fill={C.bgDeep} stroke={C.alert} strokeWidth={8} />
            <path d="M -22 -22 L 22 22 M 22 -22 L -22 22" stroke={C.alert} strokeWidth={11} strokeLinecap="round" />
          </g>
        ) : null}
        <EqPanel at={EQ_HEAD} title="DI KEPALAMU" levels={HEAD_LEVELS.map((v, i) => (i < 2 ? v * (1 + 0.12 * s.eqBoost) : v))} o={s.eqHead} f={f} color={C.air} />
        <EqPanel at={EQ_REC} title="DI REKAMAN" levels={REC_LEVELS} ghost={HEAD_LEVELS} cut={s.eqCut} o={s.eqRec} f={f} color={C.air} />
        {s.eqHigh > 0 ? (
          <g opacity={s.eqHigh} transform={`translate(${EQ_REC.x + 240} ${EQ_REC.y - 270})`}>
            <path d="M 0 90 L 0 -70 M -34 -34 L 0 -70 L 34 -34" fill="none" stroke={C.air} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
        <Hand x={hx} y={hy} rot={interpolate(s.hand, [0, 1], [-35, -8])} o={handT} />
      </svg>
      <WLabel x={1260} y={1010} text="① UDARA" o={s.udaraLabel} color={C.air} size={50} />
      <WLabel x={P.cochlea[0]} y={P.cochlea[1] - 128} text="RUMAH SIPUT" o={s.siput} color={C.bone} size={30} />
      <WLabel x={700} y={190} text="?" o={s.question} color={C.bone} size={250} />
      <WLabel x={LISTENER_EAR[0] - 200} y={360} text="ORANG LAIN" o={s.listenerGlow} color={C.text} size={150} />
      <WLabel x={P.mouth[0] - 420} y={360} text="KAMU" o={s.listenerGlow} color={C.air} size={150} />
    </div>
  );
};

/** Panggung: tiga lapisan parallax + vinyet + label ILUSTRASI (selama penampang AI terlihat). */
const Stage: React.FC<{ path: CamKey[] | ((f: number) => CamPose); s: WorldState; kicks?: number[] }> = ({ path, s, kicks = [] }) => {
  const f = useCurrentFrame();
  const cam = useCamera(path, { shake: SHAKE, seed: 7, zoomMul: (fr) => kicks.reduce((m, k) => m * beatKick(fr, k, 0.035, 14), 1) });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <CameraRig cam={cam} motionBlur={0.12} maxBlur={6} background={`radial-gradient(ellipse at 50% 40%, #102044 0%, ${C.bg} 55%, ${C.bgDeep} 100%)`}>
        <CamLayer depth={0.25}>
          <FarField />
        </CamLayer>
        <CamLayer blend="screen">
          <XrayPlate scanX={s.plateX} />
        </CamLayer>
        <CamLayer>
          <World s={s} f={f} />
        </CamLayer>
        <CamLayer depth={1.6} blur={7}>
          <NearDust f={f} />
        </CamLayer>
      </CameraRig>
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(2,6,16,0.55) 100%)' }} />
      {s.plateX > 0 ? (
        <div style={{ position: 'absolute', left: 64, top: 1376, opacity: Math.min(1, s.plateX / 400), fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: C.text, background: 'rgba(5,10,24,0.78)', border: '2px solid rgba(244,241,234,0.5)', borderRadius: 10, padding: '6px 14px' }}>
          ILUSTRASI
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Tracking: campur pose keyframe dengan pose yang mengikuti titik bergerak (sedikit di depannya). */
const follow = (keys: CamKey[], target: (f: number) => Pt | null, zoom: (f: number) => number, weight: (f: number) => number) => (fr: number): CamPose => {
  const base = camAt(keys, fr);
  const w = weight(fr);
  const p = target(fr);
  return w <= 0 || !p ? base : mixPose(base, { x: p[0], y: p[1], zoom: zoom(fr) }, w);
};

// ------------------------------------------------------------------ hook: rekaman → kepala
const Hook: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { orang: ['orang', 2.15], rusak: ['rusak', 4.14], kepalamu: ['kepalamu', 5.83] });
  const keys: CamKey[] = [
    { frame: 0, pose: { x: 1600, y: 1010, zoom: 2.3, rot: -4 } },
    { frame: q.orang - 3, pose: { x: 1600, y: 1000, zoom: 2.55, rot: -2 }, ease: SIN },
    { frame: q.orang + 14, pose: { x: 950, y: 1000, zoom: 0.57 }, ease: WHIP },
    { frame: q.kepalamu - 4, pose: { x: 935, y: 990, zoom: 0.6 }, ease: SIN },
    { frame: q.kepalamu + 26, pose: HOOK_END, ease: IO },
  ];
  const s: WorldState = {
    ...S0,
    phonePlay: 1,
    phoneRings: 1 - 0.6 * ramp(f, q.kepalamu, 15),
    question: pop(f, q.orang + 8, 14) * (1 - ramp(f, q.kepalamu + 6, 12)),
    phoneCheck: pop(f, q.rusak, 12),
    inner: ramp(f, q.kepalamu, 14) * 0.8,
    cochlea: ramp(f, q.kepalamu + 4, 12) * 0.8,
  };
  return <Stage path={keys} s={s} kicks={[q.orang + 14, q.kepalamu + 2]} />;
};

// ------------------------------------------------------------------ konteks: dua jalan; tracking jalur udara
const Konteks: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { bicara: ['bicara', 0.59], dua: ['dua', 3.43], udara: ['udara', 5.08], suara: ['Suara', 5.5], telinga: ['telinga', 9.97] });
  const keys: CamKey[] = [
    { frame: 0, pose: HOOK_END },
    { frame: q.dua + 22, pose: { x: 760, y: 820, zoom: 0.72 }, ease: IO },
    { frame: q.suara, pose: { x: 760, y: 820, zoom: 0.74 }, ease: SIN },
    { frame: q.telinga + 20, pose: KONTEKS_END, ease: IO },
  ];
  const pulseU = (fr: number) => ramp(fr, q.suara, Math.max(10, q.telinga - q.suara), SIN);
  const path = follow(
    keys,
    (fr) => AIR.at(Math.min(1, pulseU(fr) + 0.03)),
    (fr) => interpolate(pulseU(fr), [0, 1], [1.05, 1.4]),
    (fr) => ramp(fr, q.suara - 14, 26, IO) * (1 - ramp(fr, q.telinga - 2, 22, IO)),
  );
  const s: WorldState = {
    ...S0,
    mouth: ramp(f, q.bicara - 4, 10) * (1 - 0.5 * ramp(f, q.telinga, 15)),
    inner: (1 - ramp(f, 0, 12)) * 0.8,
    cochlea: (1 - ramp(f, 0, 12)) * 0.8,
    bone: ramp(f, q.dua + 4, 16) * (1 - ramp(f, q.udara - 4, 10)),
    boneO: 0.45,
    air: ramp(f, q.dua, 18),
    airO: interpolate(ramp(f, q.udara - 2, 10), [0, 1], [0.35, 1]),
    airPulse: f >= q.suara ? pulseU(f) : null,
    udaraLabel: pop(f, q.udara, 12) * (1 - ramp(f, q.suara + 20, 12)),
    earGlow: ramp(f, q.telinga, 10),
    phoneRings: 0.4 * (1 - ramp(f, 0, 20)),
  };
  return <Stage path={path} s={s} kicks={[q.dua, q.telinga]} />;
};

// ------------------------------------------------------------------ mekanisme: x-ray, tracking jalur tulang ke rumah siput
const Mekanisme: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { getaran: ['Getaran', 2.56], tulang: ['tulang', 4.11], siput: ['siput', 5.77], jadi: ['Jadi', 7.36], campuran: ['campuran', 9.07] });
  const SCAN = [4, 44];
  const keys: CamKey[] = [
    { frame: 0, pose: KONTEKS_END },
    { frame: SCAN[1] + 6, pose: { x: 700, y: 1040, zoom: 1.12 }, ease: IO },
    { frame: q.getaran + 18, pose: { x: 720, y: 1270, zoom: 1.7 }, ease: IO },
    { frame: q.siput + 14, pose: { x: 726, y: 960, zoom: 2.9 }, ease: IO },
    { frame: q.jadi, pose: { x: 726, y: 962, zoom: 3.1 }, ease: SIN },
    { frame: q.campuran + 16, pose: MEK_END, ease: IO },
  ];
  const pulseU = (fr: number) => ramp(fr, q.tulang, Math.max(10, q.siput - q.tulang + 4), SIN);
  const path = follow(
    keys,
    (fr) => BONE.at(pulseU(fr)),
    (fr) => interpolate(pulseU(fr), [0, 1], [1.8, 2.7]),
    (fr) => ramp(fr, q.tulang - 10, 20, IO) * (1 - ramp(fr, q.siput, 14, IO)),
  );
  const plateX = interpolate(f, SCAN, [0, PLATE.w], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const mix = ramp(f, q.campuran - 4, 14);
  const s: WorldState = {
    ...S0,
    plateX,
    scan: ramp(f, SCAN[0], 6) * (1 - ramp(f, SCAN[1] - 2, 8)),
    air: 1,
    airO: (1 - ramp(f, 0, 10)) * 0.9 + mix,
    airPulse: mix > 0 ? (f / 45) % 1 : null,
    earGlow: (1 - ramp(f, 0, 14)) + mix,
    larynx: ramp(f, q.getaran, 10) * (1 - ramp(f, q.siput, 12)),
    bone: pulseU(f),
    bonePulse: f >= q.tulang && f < q.siput + 10 ? pulseU(f) : null,
    bone2: ramp(f, q.siput + 4, 18),
    cochlea: ramp(f, q.siput - 2, 10),
    siput: pop(f, q.siput, 12) * (1 - ramp(f, q.campuran - 6, 10)),
    inner: mix * 0.7,
  };
  return <Stage path={path} s={s} kicks={[q.getaran, q.siput, q.campuran + 16]} />;
};

// ------------------------------------------------------------------ dampak: nada rendah di kepala vs rekaman
const Dampak: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { rendah: ['rendah', 2.41], berat: ['berat', 6.17], mikrofon: ['mikrofon', 7.27], terekam: ['terekam', 10.73], tinggi: ['tinggi', 14.36] });
  const keys: CamKey[] = [
    { frame: 0, pose: MEK_END },
    { frame: q.rendah + 18, pose: { x: 760, y: 560, zoom: 0.85 }, ease: IO },
    { frame: q.mikrofon - 2, pose: { x: 740, y: 590, zoom: 0.92 }, ease: SIN },
    { frame: q.mikrofon + 22, pose: { x: 1600, y: 900, zoom: 0.9 }, ease: IO },
    { frame: q.terekam - 4, pose: { x: 1580, y: 880, zoom: 0.96 }, ease: SIN },
    { frame: q.terekam + 24, pose: DAMPAK_END, ease: IO },
  ];
  const back = [q.tinggi + 16, q.tinggi + 40]; // pemindai mundur: kembali ke siluet sebelum scene berikutnya
  const s: WorldState = {
    ...S0,
    plateX: interpolate(f, back, [PLATE.w, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) }),
    scan: ramp(f, back[0], 4) * (1 - ramp(f, back[1] - 2, 6)),
    air: 1,
    airO: 0.55,
    bone: 1,
    bone2: 1,
    inner: 0.7 + 0.3 * ramp(f, q.berat, 8),
    cochlea: 1,
    eqHead: ramp(f, q.rendah - 4, 12),
    eqBoost: ramp(f, q.berat, 8),
    toMic: ramp(f, q.mikrofon, 22),
    phoneRec: ramp(f, q.mikrofon, 10),
    phonePlay: ramp(f, q.mikrofon, 10),
    boneBlock: pop(f, q.mikrofon + 16, 12),
    eqRec: ramp(f, q.terekam - 8, 12),
    eqCut: ramp(f, q.terekam + 2, 10),
    eqHigh: pop(f, q.tinggi, 12),
  };
  return <Stage path={keys} s={s} kicks={[q.berat, q.terekam, q.tinggi]} />;
};

// ------------------------------------------------------------------ jawaban: uji tutup telinga → rekaman = suara yang didengar orang lain
const Jawaban: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { tutup: ['Tutup', 1.27], bicara: ['bicara', 3.73], berat: ['berat', 5.95], rekaman: ['rekaman', 8.6], memang: ['memang', 9.0], orang: ['orang', 10.78] });
  const keys: CamKey[] = [
    { frame: 0, pose: DAMPAK_END },
    { frame: q.tutup + 20, pose: { x: 640, y: 960, zoom: 1.0 }, ease: IO },
    { frame: q.berat - 2, pose: { x: 650, y: 960, zoom: 1.08 }, ease: SIN },
    { frame: q.berat + 10, pose: { x: 650, y: 960, zoom: 1.16 }, ease: Easing.out(Easing.cubic) },
    { frame: q.rekaman - 4, pose: { x: 660, y: 960, zoom: 1.12 }, ease: SIN },
    { frame: q.rekaman + 20, pose: { x: 1600, y: 1000, zoom: 0.85 }, ease: IO },
    { frame: q.orang - 2, pose: { x: 1610, y: 1000, zoom: 0.8 }, ease: SIN },
    { frame: q.orang + 40, pose: FINAL, ease: IO },
  ];
  const s: WorldState = {
    ...S0,
    eqHead: 1 - ramp(f, 0, 16),
    eqRec: 1 - ramp(f, 0, 16),
    eqCut: 1,
    cochlea: 1 - ramp(f, q.rekaman, 14),
    bone: 1,
    bone2: 1,
    boneO: 0.6 + 0.4 * ramp(f, q.bicara, 10) - 0.4 * ramp(f, q.rekaman, 14),
    inner: (0.4 + 0.6 * ramp(f, q.berat - 4, 8)) * (1 - ramp(f, q.rekaman, 14)),
    hand: ramp(f, q.tutup, 18, Easing.out(Easing.cubic)),
    handOut: ramp(f, q.rekaman - 4, 16, Easing.in(Easing.cubic)),
    mouth: ramp(f, q.bicara - 4, 10),
    air: 1,
    airO: 0.25 * (1 - ramp(f, q.rekaman, 10)),
    toMic: ramp(f, q.rekaman, 18),
    phonePlay: ramp(f, q.rekaman, 10),
    phoneCheck: pop(f, q.memang + 4, 12),
    listener: ramp(f, q.orang - 6, 18),
    toListener: ramp(f, q.orang + 4, 28, IO),
    listenerGlow: ramp(f, q.orang + 30, 12),
  };
  return <Stage path={keys} s={s} kicks={[q.berat, q.orang + 40]} />;
};

export const VISUALS: SceneVisuals = { hook: Hook, konteks: Konteks, mekanisme: Mekanisme, dampak: Dampak, jawaban: Jawaban };
