// The six shots of "The Matrix Effect" in the flat 2D reference style. Same timings and beats as the 3D version.
import React, { createContext, useContext } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/** Per-shot time remap (VO lock): maps the sequence frame to the shot's choreography frame. */
export const WarpContext = createContext<((f: number) => number) | null>(null);
const useShotFrame = () => {
  const f = useCurrentFrame();
  const warp = useContext(WarpContext);
  return warp ? warp(f) : f;
};
import { range, smooth, glide, lerp, slam, kick, hash, easeIn, easeOut } from '../../../shared/motion';
import { P, INK, FONT2D, Paper2D, Cam, Grainy, FactText, Puff, ImpactLines, Person, walk2D, Mug2D, Face2D, Pose2D } from './kit';

const GROUND_CY = -340; // camera y that puts the ground line at screen y = 1300

// ================================================================ shared street (SHOT 01 + SHOT 06)
const SLIP_AT = 55;
const FREEZE_AT = 76;
const personX = (tw: number) => 120 + 7 * Math.min(tw, SLIP_AT) + 50 * smooth(range(tw, SLIP_AT, FREEZE_AT));
const streetPose = (tw: number): { pose: Pose2D; lift: number } => {
  const w = walk2D(tw / 30);
  const carry: Pose2D = { ...w, armF: 62 };
  if (tw < SLIP_AT) return { pose: carry, lift: 0 };
  const u = smooth(range(Math.min(tw, FREEZE_AT), SLIP_AT, FREEZE_AT));
  return {
    pose: { lean: 38 * u, legF: lerp(w.legF ?? 0, 82, u), legB: lerp(w.legB ?? 0, 48, u), armF: lerp(62, 160, u), armB: lerp(w.armB ?? 0, 145, u), head: 10 * u },
    lift: 95 * Math.sin(u * Math.PI * 0.55),
  };
};
const mugPos = (tw: number, frozenT: number) => {
  const u = range(Math.min(tw, FREEZE_AT), SLIP_AT, FREEZE_AT);
  const x0 = personX(SLIP_AT) + 150;
  return { x: lerp(x0, x0 + 120, u), y: lerp(-300, -820, easeOut(u)) + 12 * Math.sin(frozenT * 0.05), rot: 160 * u + frozenT * 0.9 };
};

const City: React.FC = () => (
  <g>
    {[
      [-500, 260, 520], [-230, 200, 380], [0, 240, 620], [260, 180, 300], [470, 260, 540], [760, 200, 420], [980, 240, 640], [1240, 220, 360], [1480, 260, 560],
    ].map(([x, w, h], i) => (
      <g key={i}>
        <rect x={x} y={-h} width={w - 20} height={h} fill={[P.purple, P.blue, P.pink][i % 3]} stroke={INK} strokeWidth={6} />
        {Array.from({ length: Math.floor(h / 90) }, (_, r) =>
          [0, 1].map((c) => <rect key={`${r}-${c}`} x={x + 30 + c * ((w - 80) / 2)} y={-h + 40 + r * 90} width={(w - 120) / 2} height={40} rx={6} fill={(r + c + i) % 3 ? P.gold : P.paper} stroke={INK} strokeWidth={4} />),
        )}
      </g>
    ))}
  </g>
);

const LampPost: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <line x1={x} y1={0} x2={x} y2={-640} stroke={P.navy} strokeWidth={14} strokeLinecap="round" />
    <path d={`M ${x} -630 Q ${x} -690 ${x - 70} -690`} stroke={P.navy} strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d={`M ${x - 110} -650 L ${x - 30} -650 L ${x - 50} -690 L ${x - 90} -690 Z`} fill={P.coral} />
    <ellipse cx={x - 70} cy={-645} rx={26} ry={9} fill={P.white} />
  </g>
);

/** Real-time ruler (screen space) — runs while time "flows", stops with a pause flag when the world freezes. */
const TimeRuler: React.FC<{ secs: number; paused: number }> = ({ secs, paused }) => {
  const x0 = 140;
  const x1 = 940;
  const px = x0 + ((x1 - x0) * Math.min(secs, 4)) / 4;
  return (
    <g>
      <rect x={x0} y={1352} width={px - x0} height={12} rx={6} fill={P.coral} />
      <line x1={x0} y1={1380} x2={x1} y2={1380} stroke={P.navy} strokeWidth={4} />
      {Array.from({ length: 41 }, (_, i) => (
        <line key={i} x1={x0 + i * 20} y1={1380} x2={x0 + i * 20} y2={i % 10 === 0 ? 1404 : 1392} stroke={P.navy} strokeWidth={i % 10 === 0 ? 4 : 2.5} />
      ))}
      <path d={`M ${px - 16} 1318 L ${px + 16} 1318 L ${px} 1342 Z`} fill={P.navy} />
      {[0, 1, 2, 3, 4].map((s) => (
        <text key={s} x={x0 + s * 200} y={1446} textAnchor="middle" fontFamily={FONT2D} fontWeight={800} fontSize={34} fill={Math.floor(secs) === s ? INK : '#FFFFFF'} stroke={INK} strokeWidth={Math.floor(secs) === s ? 0 : 5} paintOrder="stroke fill">
          {s}s
        </text>
      ))}
      {paused > 0 ? (
        <g opacity={paused} transform="translate(180 120)">
          <rect x={-74} y={-30} width={148} height={56} rx={28} fill={P.navy} />
          <rect x={-46} y={-14} width={8} height={24} rx={2} fill={P.white} />
          <rect x={-32} y={-14} width={8} height={24} rx={2} fill={P.white} />
          <text x={12} y={9} textAnchor="middle" fontFamily={FONT2D} fontWeight={800} fontSize={24} fill={P.white}>
            PAUSE
          </text>
        </g>
      ) : null}
    </g>
  );
};

const Street: React.FC<{ tw: number; face: Face2D; frozenT: number; t: number }> = ({ tw, face, frozenT, t }) => {
  const { pose, lift } = streetPose(tw);
  const px = personX(tw);
  const holding = tw < SLIP_AT;
  const mug = mugPos(tw, frozenT);
  return (
    <g>
      <City />
      <LampPost x={1180} />
      <LampPost x={-160} />
      <line x1={-3000} y1={0} x2={4000} y2={0} stroke={P.navy} strokeWidth={5} />
      <Grainy rect={{ x: personX(SLIP_AT) - 60, y: -8, w: 420, h: 16, r: 8 }} fill={P.ice} grain="gBlueUp" />
      <Person x={px} y={-lift} face={face} pose={pose} t={t} hold={holding ? <Mug2D x={14} y={-6} rot={0} s={0.9} /> : undefined} />
      {!holding ? (
        <g>
          {tw >= SLIP_AT
            ? Array.from({ length: 9 }, (_, i) => {
                const k = range(Math.min(tw, FREEZE_AT), SLIP_AT, FREEZE_AT);
                const a = (i / 9) * Math.PI * 2;
                return <circle key={i} cx={mug.x + Math.cos(a) * (40 + 70 * k * (0.6 + hash(i)))} cy={mug.y - 50 * k + Math.sin(a) * 50 * k} r={7 + 6 * hash(i + 3)} fill="#5B3A2E" />;
              })
            : null}
          <Mug2D x={mug.x} y={mug.y} rot={mug.rot} s={1.25} />
        </g>
      ) : null}
    </g>
  );
};

// ================================================================ SHOT 01 · THE ZERO-G SPILL
const SLAM_3S = 132;
export const Shot1_2D: React.FC = () => {
  const f = useShotFrame();
  const tw = Math.min(f, FREEZE_AT);
  const frozenT = Math.max(0, f - FREEZE_AT);
  const face: Face2D = f < FREEZE_AT - 4 ? 'whistle' : f < FREEZE_AT ? 'blink' : 'bug';
  const freeze = smooth(range(f, FREEZE_AT - 1, FREEZE_AT + 4));
  const k = glide(range(f, FREEZE_AT + 4, 200));
  const cx = lerp(personX(tw) + 120, 640, k);
  const cy = lerp(GROUND_CY, -430, k);
  const s = slam(f, SLAM_3S, 9, 900);
  const sh = kick(f, SLAM_3S, 16);
  return (
    <Paper2D bg={P.bgSky} spin={f < FREEZE_AT ? f * 0.25 : FREEZE_AT * 0.25} tint={{ color: P.purple, amount: 0.3 * freeze }}>
      <Cam x={cx} y={cy + sh} z={lerp(1, 1.08, k)} rot={lerp(0, -2, k)}>
        <Street tw={tw} face={face} frozenT={frozenT} t={f} />
        {s.visible ? <FactText text="3s" x={900} y={-14 - s.y} size={300} color={P.gold} squash={s.squash} /> : null}
        <Puff f={f} at={SLAM_3S} x={930} y={-20} spread={220} />
        <ImpactLines f={f} at={SLAM_3S} x={930} y={-150} r={190} />
      </Cam>
      <TimeRuler secs={(tw / 30) * 1.0} paused={freeze} />
    </Paper2D>
  );
};

// ================================================================ SHOT 02 · 90-FOOT DROP TOWER
const TOWER_H = 2600;
const DROP_AT = 112;
const BRAKE_AT = 150;
const gondolaY = (f: number) => {
  const top = -TOWER_H + 330;
  if (f < DROP_AT) return top;
  if (f < BRAKE_AT) return lerp(top, -230, easeIn(range(f, DROP_AT, BRAKE_AT)));
  const d = f - BRAKE_AT;
  return -170 - 60 * Math.exp(-d / 7) * Math.cos(d * 0.35);
};

const Tower2D: React.FC = () => (
  <g>
    <line x1={470} y1={0} x2={470} y2={-TOWER_H} stroke={P.navy} strokeWidth={14} />
    <line x1={610} y1={0} x2={610} y2={-TOWER_H} stroke={P.navy} strokeWidth={14} />
    {Array.from({ length: Math.floor(TOWER_H / 130) }, (_, i) => {
      const y = -i * 130;
      return (
        <g key={i} stroke={P.navy} strokeWidth={5}>
          <line x1={470} y1={y} x2={610} y2={y - 130} />
          <line x1={610} y1={y} x2={470} y2={y - 130} />
          <line x1={470} y1={y} x2={610} y2={y} strokeWidth={7} />
        </g>
      );
    })}
    <Grainy rect={{ x: 420, y: -TOWER_H - 90, w: 240, h: 100, r: 14 }} fill={P.coral} grain="gPinkUp" />
    <circle cx={540} cy={-TOWER_H - 110} r={16} fill={P.coralDeep} />
    <rect x={380} y={-30} width={320} height={30} rx={6} fill={P.blue} />
  </g>
);

const Gauge2D: React.FC<{ f: number }> = ({ f }) => {
  const s = slam(f, 34, 14, 1200);
  return (
    <g>
      <line x1={190} y1={0} x2={190} y2={-TOWER_H} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      {Array.from({ length: 31 }, (_, i) => (
        <line key={i} x1={190} y1={-i * (TOWER_H / 30)} x2={i % 5 === 0 ? 250 : 220} y2={-i * (TOWER_H / 30)} stroke={P.navy} strokeWidth={i % 5 === 0 ? 7 : 4} />
      ))}
      {[30, 60].map((ft) => (
        <text key={ft} x={262} y={-(ft / 90) * TOWER_H + 14} fontFamily={FONT2D} fontWeight={800} fontSize={48} fill="#FFFFFF" stroke={INK} strokeWidth={6} paintOrder="stroke fill">
          {ft} FT
        </text>
      ))}
      {s.visible ? <FactText text="90 FT" x={300} y={-TOWER_H - 40 - s.y} size={170} color={P.coral} squash={s.squash} anchor="middle" /> : null}
    </g>
  );
};

const Gondola2D: React.FC<{ y: number; face: Face2D; t: number }> = ({ y, face, t }) => {
  const panic = face === 'panic' || face === 'bug';
  const riderPose = (i: number): Pose2D =>
    panic ? { armF: 165 + 10 * Math.sin(t * 0.9 + i), armB: 150 + 10 * Math.cos(t * 0.8 + i), legF: 12 * Math.sin(t * 0.7 + i), legB: -10 } : { armF: 70, armB: 60 };
  // 15 riders behind the tower (heads + caps peeking over the bar) + 8 in front = 23 volunteers
  return (
    <g transform={`translate(0 ${y})`}>
      {Array.from({ length: 15 }, (_, i) => (
        <g key={i} transform={`translate(${290 + i * 36} ${-205 - (i % 2) * 12})`}>
          <circle r={26} fill={P.skin} stroke={INK} strokeWidth={5} />
          <path d="M -27 -2 A 27 27 0 0 1 27 -2 Z" fill={P.coral} stroke={INK} strokeWidth={5} />
        </g>
      ))}
      <rect x={250} y={-150} width={580} height={46} rx={20} fill={P.navy} />
      {[0, 1, 2, 3].map((i) => (
        <Person key={`l${i}`} flip x={430 - i * 62} y={60} s={0.4} face={i === 0 ? face : panic ? 'panic' : i % 2 ? 'grimace' : 'blank'} t={t + i * 3} cap={P.coral} body={[P.blue, P.navy][i % 2]} pose={riderPose(i)} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Person key={`r${i}`} x={650 + i * 62} y={60} s={0.4} face={i === 0 ? face : panic ? 'panic' : i % 2 ? 'blank' : 'grimace'} t={t + i * 5} cap={P.coral} body={[P.coral, P.navy][i % 2]} bodyGrain="gPinkUp" pose={riderPose(i + 4)} />
      ))}
      <Grainy rect={{ x: 230, y: -60, w: 620, h: 60, r: 24 }} fill={P.coral} grain="gPinkUp" />
    </g>
  );
};

export const Shot2_2D: React.FC = () => {
  const f = useShotFrame();
  const gy = gondolaY(f);
  const face: Face2D = f < 98 ? 'grimace' : f < 102 ? 'blink' : f < BRAKE_AT + 25 ? 'panic' : 'bug';
  let cx = 540, cy = GROUND_CY, z = 1;
  if (f < 9) {
    cy = lerp(GROUND_CY, -1480, glide(f / 9));
    z = lerp(1, 0.75, glide(f / 9));
  } else if (f < 66) {
    cx = 520;
    cy = lerp(-1480, -1520, range(f, 9, 66));
    z = lerp(0.6, 0.62, range(f, 9, 66));
  } else {
    cx = 540;
    cy = gy - 130;
    z = lerp(1.35, 1.25, range(f, 66, DROP_AT));
    if (f >= DROP_AT) z = lerp(1.25, 1.05, range(f, DROP_AT, BRAKE_AT + 40));
  }
  const sh = kick(f, 34, 22) + kick(f, BRAKE_AT, 18);
  const falling = f >= DROP_AT && f < BRAKE_AT + 4;
  return (
    <Paper2D bg={P.bgSun} spin={f * 0.3}>
      <Cam x={cx} y={cy + sh} z={z} rot={falling ? 1.5 * Math.sin(f * 0.8) : 0}>
        {[[-120, -900, 1], [880, -1500, 0.8], [-60, -2100, 1.2], [960, -2600, 1], [200, -400, 0.7]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF" stroke={INK} strokeWidth={6}>
            <ellipse cx={0} cy={0} rx={150} ry={50} />
            <circle cx={-50} cy={-30} r={55} />
            <circle cx={40} cy={-45} r={70} />
          </g>
        ))}
        <line x1={-3000} y1={0} x2={4000} y2={0} stroke={P.navy} strokeWidth={5} />
        <Tower2D />
        <Gauge2D f={f} />
        <Gondola2D y={gy} face={face} t={f} />
        {falling
          ? Array.from({ length: 16 }, (_, i) => {
              const x = 120 + 840 * hash(i + 1);
              const yy = gy - 700 + ((hash(i + 2) * 1200 + f * 60) % 1200);
              return <line key={i} x1={x} y1={yy} x2={x} y2={yy + 120 + 120 * hash(i)} stroke={P.blue} strokeWidth={5} strokeLinecap="round" opacity={0.6} />;
            })
          : null}
        <Puff f={f} at={BRAKE_AT} x={540} y={-20} spread={360} />
      </Cam>
    </Paper2D>
  );
};

// ================================================================ SHOT 03 · CHRONOMETER & "0" STAMP
const STAMP_AT = 141;
const SEG: Record<string, number[]> = {
  '0': [1, 1, 1, 1, 1, 1, 0], '1': [0, 1, 1, 0, 0, 0, 0], '2': [1, 1, 0, 1, 1, 0, 1], '3': [1, 1, 1, 1, 0, 0, 1], '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1], '6': [1, 0, 1, 1, 1, 1, 1], '7': [1, 1, 1, 0, 0, 0, 0], '8': [1, 1, 1, 1, 1, 1, 1], '9': [1, 1, 1, 1, 0, 1, 1],
};
const SEGS: [number, number, number, number][] = [
  [-22, -46, 44, 9], [22, -42, 9, 40], [22, 2, 9, 40], [-22, 42, 44, 9], [-31, 2, 9, 40], [-31, -42, 9, 40], [-22, -2, 44, 9],
];
const Digit2D: React.FC<{ ch: string; x: number; on: boolean }> = ({ ch, x, on }) => (
  <g transform={`translate(${x} 0)`}>
    {SEGS.map(([sx, sy, w, h], i) => (
      <rect key={i} x={sx} y={sy} width={w} height={h} rx={4} fill={on && SEG[ch][i] ? P.coral : '#2E3A7A'} />
    ))}
  </g>
);

const Watch2D: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.floor(f / 2);
  const on = f % 4 < 3;
  return (
    <g transform="translate(470 -470)">
      <Grainy rect={{ x: -70, y: -230, w: 140, h: 460, r: 30 }} fill={P.coral} grain="gPinkUp" />
      <rect x={-170} y={-120} width={340} height={240} rx={48} fill={P.navy} />
      <rect x={-140} y={-90} width={280} height={180} rx={22} fill={P.navyDeep} />
      {[0, 1, 2].map((i) => (
        <Digit2D key={i} ch={String(Math.floor(hash(n * 3 + i) * 10))} x={(i - 1) * 82} on={on} />
      ))}
      <rect x={168} y={-30} width={22} height={60} rx={6} fill={P.blue} />
    </g>
  );
};

const Desk2D: React.FC = () => (
  <g>
    <rect x={150} y={-312} width={820} height={24} rx={6} fill={P.navy} />
    <rect x={180} y={-288} width={18} height={288} fill={P.navy} />
    <rect x={930} y={-288} width={18} height={288} fill={P.navy} />
    <Grainy rect={{ x: 230, y: -288, w: 170, h: 110 }} fill={P.blue} grain="gPinkUp" />
    <rect x={290} y={-235} width={50} height={8} rx={4} fill={P.white} />
  </g>
);

export const Shot3_2D: React.FC = () => {
  const f = useShotFrame();
  const face: Face2D = f < STAMP_AT - 4 ? 'squint' : f < STAMP_AT ? 'blink' : 'blank';
  const push = glide(range(f, 0, 100));
  const back = glide(range(f, 104, STAMP_AT - 8));
  const pull = glide(range(f, STAMP_AT + 10, 220));
  const z = lerp(lerp(lerp(1.0, 1.75, push), 1.05, back), 0.95, pull);
  const cx = lerp(lerp(lerp(620, 470, push), 600, back), 600, pull);
  const cy = lerp(lerp(lerp(-430, -470, push), -500, back), -520, pull);
  const s = slam(f, STAMP_AT, 8, 1100);
  const sh = kick(f, STAMP_AT, 20);
  const d = f - STAMP_AT;
  return (
    <Paper2D bg={P.bgMint} spin={f * 0.2}>
      <Cam x={cx + sh} y={cy} z={z}>
        <line x1={-3000} y1={0} x2={4000} y2={0} stroke={P.navy} strokeWidth={5} />
        {/* chair + hero leaning in from the right, facing the watch */}
        <rect x={1010} y={-500} width={18} height={500} fill={P.blue} />
        <rect x={880} y={-260} width={150} height={18} fill={P.blue} />
        <line x1={900} y1={-250} x2={900} y2={0} stroke={P.blue} strokeWidth={14} />
        <Person flip sitting x={950} y={0} face={face} t={f} body={P.coral} bodyGrain="gPinkUp" pose={{ lean: -22, armF: 80, armB: 70, head: -8 }} />
        <Desk2D />
        {f < STAMP_AT ? <Watch2D f={f} /> : null}
        {d >= 0
          ? Array.from({ length: 18 }, (_, i) => {
              const tt = Math.min(d, 26);
              const a = (i / 18) * Math.PI * 2;
              const vx = Math.cos(a) * (8 + 8 * hash(i));
              const vy = -10 - 10 * hash(i + 2);
              const y = Math.min(-312, -470 + vy * tt + 1.1 * tt * tt);
              const col = [P.coral, P.navy, P.blue][i % 3];
              return <rect key={i} x={470 + vx * tt} y={y} width={18 + 18 * hash(i + 1)} height={12 + 10 * hash(i + 4)} fill={col} transform={`rotate(${tt * 22 * (hash(i + 5) - 0.5)} ${470 + vx * tt} ${y})`} />;
            })
          : null}
        {s.visible ? <FactText text="0" x={470} y={-316 - s.y} size={560} color={P.coral} squash={s.squash} outline={P.navy} /> : null}
        <Puff f={f} at={STAMP_AT} x={470} y={-320} spread={260} color={P.pink} />
        <ImpactLines f={f} at={STAMP_AT} x={470} y={-520} r={260} />
      </Cam>
    </Paper2D>
  );
};

// ================================================================ SHOT 04 · AMYGDALA RED ALERT
const S4_SKULL = 54;
const S4_CORE = 176;
const STOMP_AT = 222;
const DIAL_AT = 270;
const DATA_AT = 282;

const Folder2D: React.FC<{ x: number; y: number; c: string; rot: number }> = ({ x, y, c, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M -50 -30 L -18 -30 L -10 -40 L 20 -40 L 26 -30 L 50 -30 L 50 34 L -50 34 Z" fill={c} />
    <rect x={-50} y={-22} width={100} height={56} rx={4} fill={c} opacity={0.85} />
  </g>
);

const FaceClose2D: React.FC<{ f: number }> = ({ f }) => {
  const face: Face2D = f < 38 ? 'blank' : f < 42 ? 'blink' : 'suspicious';
  const push = glide(range(f, 0, 60));
  return (
    <Paper2D bg={P.bgGrape} spin={f * 0.3}>
      <Cam x={560} y={lerp(-560, -585, push)} z={lerp(2.3, 2.6, push)}>
        <Person x={520} y={0} face={face} t={f} pose={{ head: f >= 42 ? -8 : 0, armF: 6, armB: -4 }} />
        {f >= 44 ? (
          <text x={700} y={-760} fontFamily={FONT2D} fontWeight={900} fontSize={110} fill={P.coral} opacity={smooth(range(f, 44, 50))}>
            ?
          </text>
        ) : null}
      </Cam>
    </Paper2D>
  );
};

const Skull2D: React.FC<{ f: number }> = ({ f }) => {
  const vib = f > 80 ? 7 * Math.sin(f * 2.9) : 0;
  const folders = [P.coral, P.blue, P.gold, P.navy, P.pink, P.coral, P.blue, P.gold];
  const k = glide(range(f, S4_SKULL, 100));
  const dive = easeIn(range(f, 158, S4_CORE));
  return (
    <Paper2D bg={P.bgSun} spin={f * 0.3}>
      <Cam x={540} y={lerp(880, 1000, dive)} z={lerp(0.92, 1, k) * lerp(1, 4, dive)}>
        {/* cloud the files are dumped into */}
        <g transform={`translate(540 ${330 + 6 * Math.sin(f * 0.2)}) scale(${lerp(0.6, 1, smooth(range(f, 90, 130)))})`}>
          <Grainy d="M -230 40 Q -260 -40 -170 -60 Q -150 -150 -50 -130 Q 20 -200 110 -130 Q 220 -150 220 -50 Q 290 -20 240 50 Z" fill={P.white} grain="gBlueUp" />
          <text x={0} y={10} textAnchor="middle" fontFamily={FONT2D} fontWeight={800} fontSize={44} fill={P.navy}>
            BACKUP
          </text>
        </g>
        {/* head cut-away */}
        <circle cx={540} cy={1000} r={430} fill={P.skin} />
        <path d="M 110 980 A 430 430 0 0 1 960 900 Q 540 880 110 980 Z" fill={P.navy} />
        <circle cx={540} cy={1040} r={360} fill={P.pinkLight} />
        <g>
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI * (0.85 + (i / 10) * 1.3);
            return <circle key={i} cx={540 + Math.cos(a) * 200} cy={1060 + Math.sin(a) * 190} r={95 + 20 * hash(i)} fill={i % 2 ? P.pink : '#F29C95'} />;
          })}
          <circle cx={540} cy={1060} r={170} fill={P.pink} />
        </g>
        {/* overloaded phone */}
        <g transform={`translate(${540 + vib} 1060) rotate(${vib * 0.4})`}>
          <rect x={-110} y={-200} width={220} height={400} rx={34} fill={P.navy} />
          <rect x={-90} y={-170} width={180} height={330} rx={18} fill={f > 80 && f % 6 < 3 ? P.blueLight : P.ice} />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={-70 + (i % 3) * 52} y={-150 + Math.floor(i / 3) * 56} width={36} height={36} rx={9} fill={folders[i % folders.length]} />
          ))}
          <rect x={-70} y={60} width={140} height={22} rx={11} fill={P.coral} />
          <rect x={-70} y={60} width={140 * clampU((f - 80) / 70)} height={22} rx={11} fill={P.coralDeep} />
          {f > 80 ? (
            <g stroke={P.navy} strokeWidth={6} strokeLinecap="round">
              <line x1={-140} y1={-120} x2={-160} y2={-140} />
              <line x1={-145} y1={-80} x2={-172} y2={-84} />
              <line x1={140} y1={-120} x2={160} y2={-140} />
              <line x1={145} y1={-80} x2={172} y2={-84} />
            </g>
          ) : null}
        </g>
        {folders.map((c, i) => {
          const t0 = 92 + i * 7;
          const u = range(f, t0, t0 + 26);
          if (u <= 0 || u >= 1) return null;
          const e = easeOut(u);
          const side = (hash(i) - 0.5) * 360;
          return <Folder2D key={i} c={c} rot={u * 200 * (hash(i + 2) - 0.5)} x={540 + side * e} y={lerp(900, 360, e) - Math.sin(u * Math.PI) * 120} />;
        })}
      </Cam>
    </Paper2D>
  );
};
const clampU = (x: number) => Math.max(0, Math.min(1, x));

const Core2D: React.FC<{ f: number }> = ({ f }) => {
  const pressed = f >= STOMP_AT;
  const after = f - STOMP_AT;
  const pulse = pressed ? 0.5 + 0.5 * Math.sin(after * 0.5) : 0;
  const jumpU = range(f, STOMP_AT - 20, STOMP_AT);
  let ay = 0;
  let ax = lerp(250, 420, smooth(jumpU));
  if (f >= STOMP_AT - 20 && f < STOMP_AT) ay = -110 - 260 * Math.sin(jumpU * Math.PI);
  if (f < STOMP_AT - 20) ax = 250;
  if (after >= 0) ay = -110 - Math.abs(Math.sin(after * 0.22)) * 60 * Math.exp(-after / 60);
  const press = pressed ? 22 * (1 - Math.abs(Math.sin(after * 0.22)) * Math.exp(-after / 60)) : 0;
  const face: Face2D = f < STOMP_AT - 3 ? 'frown' : f < STOMP_AT ? 'blink' : 'battle';
  const needleU = glide(range(f, DIAL_AT, DIAL_AT + 14));
  const ang = lerp(180, 30, needleU) + (f > DIAL_AT + 14 ? 4 * Math.exp(-(f - DIAL_AT - 14) / 10) * Math.sin(f) : 0);
  const s = slam(f, DATA_AT, 9, 900);
  const sh = kick(f, STOMP_AT, 18) + kick(f, DATA_AT, 14);
  const k = glide(range(f, S4_CORE, 205));
  return (
    <Paper2D bg={pressed ? (pulse > 0.5 ? P.bgAlarm : P.bgBubble) : P.bgBubble} spin={f * (pressed ? 1.2 : 0.3)}>
      <Cam x={540 + sh} y={lerp(-420, -520, k)} z={lerp(1.25, 1, k)}>
        <line x1={-3000} y1={0} x2={4000} y2={0} stroke={P.navy} strokeWidth={5} />
        {/* siren */}
        <line x1={110} y1={0} x2={110} y2={-520} stroke={P.navy} strokeWidth={14} />
        <rect x={70} y={-540} width={80} height={24} rx={8} fill={P.navy} />
        {pressed ? (
          <g transform={`translate(110 -590) rotate(${after * 14})`} opacity={0.45}>
            <path d="M 0 0 L 520 -110 L 520 110 Z" fill={P.coral} />
            <path d="M 0 0 L -520 -110 L -520 110 Z" fill={P.coral} />
          </g>
        ) : null}
        <path d="M 66 -540 A 44 52 0 0 1 154 -540 Z" fill={pressed ? (pulse > 0.5 ? P.coralDeep : P.coral) : P.pink} />
        {/* emergency button */}
        <path d="M 290 0 L 330 -110 L 550 -110 L 590 0 Z" fill={P.gold} />
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M ${320 + i * 52} -6 L ${348 + i * 52} -104 L ${368 + i * 52} -104 L ${340 + i * 52} -6 Z`} fill={P.navy} />
        ))}
        <rect x={350} y={-140} width={180} height={34} rx={10} fill={P.navy} />
        <path d={`M 360 ${-140 + press} A 80 ${70 - press} 0 0 1 520 ${-140 + press} Z`} fill={P.coral} />
        {/* the dial */}
        <g transform="translate(820 -470)">
          <line x1={0} y1={40} x2={0} y2={470} stroke={P.navy} strokeWidth={14} />
          <path d="M -190 0 A 190 190 0 0 1 190 0 Z" fill={P.white} stroke={P.navy} strokeWidth={10} />
          {Array.from({ length: 9 }, (_, i) => {
            const a = Math.PI - (i / 8) * Math.PI;
            return <line key={i} x1={Math.cos(a) * 150} y1={-Math.sin(a) * 150} x2={Math.cos(a) * 175} y2={-Math.sin(a) * 175} stroke={i > 5 ? P.coral : P.navy} strokeWidth={7} strokeLinecap="round" />;
          })}
          <line x1={0} y1={0} x2={Math.cos((ang * Math.PI) / 180) * 150} y2={-Math.sin((ang * Math.PI) / 180) * 150} stroke={P.coralDeep} strokeWidth={10} strokeLinecap="round" />
          <circle r={18} fill={P.navy} />
          <text x={0} y={-60} textAnchor="middle" fontFamily={FONT2D} fontWeight={800} fontSize={30} fill={P.navy}>
            DATA
          </text>
        </g>
        {/* mini amygdala */}
        <Person x={ax} y={ay} s={0.58} face={face} t={f} skin="#F58C78" cap={P.coralDeep} body={P.coralDeep} bodyGrain="gPinkUp" legs={P.coralDeep}
          pose={pressed ? { armF: 160, armB: 150, legF: 18 * Math.sin(after * 0.44), legB: -18 * Math.sin(after * 0.44) } : { armF: 30 + 120 * jumpU, armB: 20 + 120 * jumpU, legF: 30 * jumpU, legB: -10 }} />
        <g transform={`translate(${ax} ${ay - 380})`} opacity={1 - smooth(range(f, STOMP_AT + 20, STOMP_AT + 30))}>
          <rect x={-110} y={-34} width={220} height={52} rx={26} fill={P.navy} />
          <text x={0} y={2} textAnchor="middle" fontFamily={FONT2D} fontWeight={800} fontSize={28} fill={P.white}>
            AMIGDALA
          </text>
        </g>
        <ImpactLines f={f} at={STOMP_AT} x={440} y={-160} r={120} />
        {s.visible ? <FactText text="+80% DATA" x={520} y={-920 - s.y} size={140} color={P.coral} squash={s.squash} outline={P.navy} /> : null}
      </Cam>
    </Paper2D>
  );
};

export const Shot4_2D: React.FC = () => {
  const f = useShotFrame();
  const fadeIn = range(f, S4_SKULL, S4_SKULL + 6);
  const flash = f >= S4_CORE - 1 && f < S4_CORE + 3 ? 1 - range(f, S4_CORE - 1, S4_CORE + 3) : 0;
  return (
    <AbsoluteFill>
      {f < S4_SKULL + 6 ? <FaceClose2D f={f} /> : null}
      {f >= S4_SKULL && f < S4_CORE ? (
        <AbsoluteFill style={{ opacity: fadeIn }}>
          <Skull2D f={f} />
        </AbsoluteFill>
      ) : null}
      {f >= S4_CORE ? <Core2D f={f} /> : null}
      {flash > 0 ? <AbsoluteFill style={{ background: P.white, opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};

// ================================================================ SHOT 05 · 35MM PROJECTOR
const TRICK_AT = 100;
const LONGER_AT = 192;
const Strip: React.FC<{ x: number; y: number; rot: number; len: number; bend: number }> = ({ x, y, rot, len, bend }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M ${-len / 2} 0 Q 0 ${bend} ${len / 2} 0`} stroke={P.coral} strokeWidth={34} fill="none" strokeLinecap="butt" />
    <path d={`M ${-len / 2} 0 Q 0 ${bend} ${len / 2} 0`} stroke={P.paper} strokeWidth={6} fill="none" strokeDasharray="8 14" />
  </g>
);

export const Shot5_2D: React.FC = () => {
  const f = useShotFrame();
  const face: Face2D = f < TRICK_AT - 4 ? 'smile' : f < TRICK_AT ? 'blink' : 'dizzy';
  const N = Math.floor(lerp(0, 90, smooth(range(f, 20, 230))));
  const k = glide(range(f, 20, 250));
  const s = slam(f, LONGER_AT, 10, 900);
  const sh = kick(f, LONGER_AT, 16);
  return (
    <Paper2D bg={P.bgGrape} spin={f * 0.25}>
      <Cam x={lerp(560, 540, k)} y={lerp(-380, -560, k) + sh} z={lerp(1.25, 0.9, k)}>
        <line x1={-3000} y1={0} x2={4000} y2={0} stroke={P.navy} strokeWidth={5} />
        {/* screen */}
        <rect x={-20} y={-1140} width={480} height={360} fill={P.navy} />
        <rect x={0} y={-1120} width={440} height={320} fill={P.white} />
        <g transform="translate(220 -960)" opacity={0.8}>
          <path d="M -40 -50 L 50 0 L -40 50 Z" fill={P.coral} />
        </g>
        <text x={220} y={-830} textAnchor="middle" fontFamily={FONT2D} fontWeight={800} fontSize={34} fill={P.navy}>
          REPLAY MEMORI
        </text>
        {/* projector + beam */}
        <path d="M 860 -560 L 440 -1120 L 440 -800 Z" fill="url(#gBeam)" opacity={0.75} />
        <g transform="translate(940 -560)">
          {[-70, 70].map((dx, i) => (
            <g key={i} transform={`translate(${dx} -150) rotate(${f * (i ? 6 : 8)})`}>
              <circle r={70} fill={P.navy} />
              <circle r={50} fill={P.paper} />
              {[0, 60, 120].map((a) => (
                <rect key={a} x={-6} y={-50} width={12} height={100} fill={P.navy} transform={`rotate(${a})`} />
              ))}
              <circle r={14} fill={P.coral} />
            </g>
          ))}
          <Grainy rect={{ x: -140, y: -80, w: 280, h: 150, r: 20 }} fill={P.navy} grain="gBlueUp" />
          <rect x={-180} y={-30} width={50} height={60} rx={8} fill={P.navyDeep} />
          <line x1={0} y1={70} x2={0} y2={560} stroke={P.navy} strokeWidth={16} />
          <line x1={-80} y1={560} x2={80} y2={560} stroke={P.navy} strokeWidth={12} strokeLinecap="round" />
        </g>
        {/* seat + spectator facing the screen */}
        <Grainy rect={{ x: 500, y: -520, w: 70, h: 400, r: 20 }} fill={P.coral} grain="gPinkUp" />
        <rect x={360} y={-150} width={210} height={50} rx={14} fill={P.coral} />
        <line x1={420} y1={-100} x2={420} y2={0} stroke={P.navy} strokeWidth={12} />
        <line x1={540} y1={-100} x2={540} y2={0} stroke={P.navy} strokeWidth={12} />
        <Person flip sitting x={510} y={-20} face={face} t={f} pose={{ armF: 40, armB: 30, head: face === 'dizzy' ? 8 * Math.sin(f * 0.12) : 0 }} />
        {/* film spilling out of the projector and piling up over the hero */}
        {Array.from({ length: N }, (_, i) => {
          const born = 20 + (i / 90) * 210;
          const u = range(f, born, born + 16);
          const layer = Math.floor(i / 9);
          const tx = 250 + 520 * hash(i + 1);
          const ty = -20 - layer * 42 - 20 * hash(i + 2);
          const x = lerp(780, tx, easeOut(u));
          const y = lerp(-560, ty, easeOut(u)) - Math.sin(u * Math.PI) * 160;
          return <Strip key={i} x={x} y={y} rot={360 * hash(i + 3) * (1 - u * 0.5)} len={140 + 80 * hash(i + 4)} bend={-60 + 120 * hash(i + 5)} />;
        })}
        {s.visible ? <FactText text="5X LONGER" x={540} y={-560 - s.y} size={150} color={P.gold} squash={s.squash} outline={P.navy} /> : null}
        <Puff f={f} at={LONGER_AT} x={540} y={-560} spread={300} color={P.pink} />
      </Cam>
    </Paper2D>
  );
};

// ================================================================ SHOT 06 · PENUTUP
// Back on the street: the world freezes for 40 frames on "melambat", then moves on; the hero ends calm and smiling.
export const Shot6_2D: React.FC = () => {
  const l = Math.min(useShotFrame(), 179); // holds the final story frame under the CTA
  const tw = l < 70 ? l - 140 : l < 110 ? -70 : l - 180; // walking only (always before the slip)
  const frozen = l >= 70 && l < 110;
  const face: Face2D = l < 72 ? 'whistle' : l < 76 ? 'blink' : l < 108 ? 'glance' : l < 112 ? 'blink' : l < 140 ? 'whistle' : 'smile';
  const freezeK = l < 70 ? 0 : l < 110 ? smooth(range(l, 70, 74)) : 1 - smooth(range(l, 110, 118));
  const px = personX(tw);
  const k = glide(range(l, 0, 176));
  const ringU = frozen ? range(l, 70, 100) : 0;
  return (
    <Paper2D bg={P.bgSky} spin={frozen ? 70 * 0.25 : l * 0.25} tint={{ color: P.purple, amount: 0.3 * freezeK }}>
      <Cam x={px + 120} y={lerp(-520, GROUND_CY, k)} z={lerp(0.8, 1, k)}>
        <Street tw={tw} face={face} frozenT={0} t={l} />
        {frozen
          ? [0, 0.3, 0.6].map((o, i) => {
              const u = ringU - o;
              if (u <= 0 || u >= 1) return null;
              return <circle key={i} cx={px} cy={-300} r={80 + 600 * u} fill="none" stroke={P.blue} strokeWidth={10} opacity={1 - u} />;
            })
          : null}
      </Cam>
      <TimeRuler secs={((l - (frozen ? l - 70 : l >= 110 ? 40 : 0)) / 30) * 0.66} paused={freezeK} />
    </Paper2D>
  );
};
