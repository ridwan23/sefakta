// SHOT 01–03: the spill, the 90-ft drop tower, the flashing chronometer + "0" stamp.
import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { C } from './constants';
import { range, smooth, glide, lerp, slam, kick, hash, easeIn } from '../../../shared/motion';
import { G, Ink, Fact, Hero, Rig, Lights, LOOKS, mixLook, Dust, BlobShadow, basic, Face } from './kit';
import { Street, streetCam, heroZ, FREEZE_AT, mugState } from './street';
import { Stage } from './Stage';

type V3 = [number, number, number];
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ================================================================ SHOT 01 · THE ZERO-G SPILL (0–216)
export const SLAM_3S = 132;
const Shot1World: React.FC = () => {
  const f = useCurrentFrame();
  const tw = Math.min(f, FREEZE_AT);
  const frozenT = Math.max(0, f - FREEZE_AT);
  const face: Face = f < FREEZE_AT - 4 ? 'whistle' : f < FREEZE_AT ? 'blink' : 'bug';
  const look = mixLook(LOOKS.night, LOOKS.freeze, smooth(range(f, FREEZE_AT - 1, FREEZE_AT + 4)));
  const hz = heroZ(tw);
  const base = streetCam(tw);
  const mug = mugState(tw, frozenT);
  // after the freeze: slow push up toward the floating mug, then settle for the "3s" slam
  const k = glide(range(f, FREEZE_AT + 4, 200));
  const pos = mix3(base.pos, [1.7, 1.5, hz + 7.0], k);
  const lk = mix3(base.look, [0.35, 1.9, hz + 0.6], k);
  const sh = kick(f, SLAM_3S, 0.09);
  const s = slam(f, SLAM_3S, 9, 7);
  const blockAt: V3 = [1.1, 0.13, hz + 1.4];
  return (
    <>
      <Lights look={look} />
      <Rig pos={[pos[0], pos[1] + sh, pos[2]]} look={lk} fov={lerp(base.fov, 50, k)} roll={lerp(base.roll, -0.05, k)} />
      <Street tw={tw} face={face} frozenT={frozenT} mugOverride={mug} />
      {s.visible ? (
        <group position={[blockAt[0], blockAt[1] + s.y, blockAt[2]]} rotation={[0, -0.45, 0]} scale={[1 / Math.sqrt(s.squash), s.squash, 1 / Math.sqrt(s.squash)]}>
          <BlobShadow r={0.75} opacity={s.landed ? 0.35 : 0.15} position={[0, -s.y, 0]} />
          <Fact text="3s" size={0.8} depth={0.45} color={C.gold} position={[0, 0.5, 0]} />
        </group>
      ) : null}
      <Dust f={f} at={SLAM_3S} position={blockAt} spread={1.2} />
    </>
  );
};
export const Shot1: React.FC = () => (
  <Stage>
    <Shot1World />
  </Stage>
);

// ================================================================ SHOT 02 · 90-FOOT DROP TOWER (216–465)
const TOWER_H = 27.4; // 90 ft
const DROP_AT = 112;
const BRAKE_AT = 150;
const cageY = (f: number) => {
  const top = TOWER_H - 3.2;
  if (f < DROP_AT) return top;
  if (f < BRAKE_AT) return top - (top - 3.6) * easeIn(range(f, DROP_AT, BRAKE_AT));
  const d = f - BRAKE_AT;
  return 1.6 + 2.0 * Math.exp(-d / 7) * Math.cos(d * 0.35);
};

const Tower: React.FC = () => {
  const parts = useMemo(() => {
    const out: { p: V3; s: V3; r?: V3 }[] = [];
    const a = 0.75;
    for (const [x, z] of [[-a, -a], [a, -a], [-a, a], [a, a]]) out.push({ p: [x, TOWER_H / 2, z], s: [0.16, TOWER_H, 0.16] });
    for (let y = 1.5; y < TOWER_H; y += 2.2) {
      out.push({ p: [0, y, a], s: [1.6, 0.1, 0.1] }, { p: [0, y, -a], s: [1.6, 0.1, 0.1] });
      out.push({ p: [a, y, 0], s: [0.1, 0.1, 1.6] }, { p: [-a, y, 0], s: [0.1, 0.1, 1.6] });
      out.push({ p: [0, y + 1.1, a], s: [0.07, 2.5, 0.07], r: [0, 0, 0.6] }, { p: [a, y + 1.1, 0], s: [0.07, 2.5, 0.07], r: [0.6, 0, 0] });
      out.push({ p: [0, y + 1.1, -a], s: [0.07, 2.5, 0.07], r: [0, 0, -0.6] }, { p: [-a, y + 1.1, 0], s: [0.07, 2.5, 0.07], r: [-0.6, 0, 0] });
    }
    return out;
  }, []);
  return (
    <group>
      {parts.map((b, i) => (
        <Ink key={i} geo={G.box(...b.s)} color={i < 4 ? C.steel : C.steelDark} ink={0.02} position={b.p} rotation={b.r} />
      ))}
      <Ink geo={G.rbox(2.6, 0.9, 2.6, 0.15)} color={C.orange} position={[0, TOWER_H + 0.4, 0]} />
      <Ink geo={G.sphere(0.2, 12)} color="#fee2e2" emissive={C.red} glow={3} ink={0.015} position={[0, TOWER_H + 1.05, 0]} />
      <Ink geo={G.rbox(4.5, 0.6, 4.5, 0.1)} color="#94a3b8" position={[0, 0.3, 0]} />
    </group>
  );
};

/** Height gauge with tick marks, slides down into place carrying the "90 FT" fact. */
const Gauge: React.FC<{ f: number }> = ({ f }) => {
  const s = slam(f, 34, 14, 14);
  return (
    <group position={[-3.4, s.y, 0.6]}>
      <Ink geo={G.rbox(0.5, TOWER_H, 0.3, 0.1)} color={C.ink} position={[0, TOWER_H / 2, 0]} />
      {Array.from({ length: 19 }, (_, i) => (
        <Ink key={i} geo={G.box(i % 3 === 0 ? 0.9 : 0.5, 0.09, 0.08)} color={C.cyan} emissive={C.cyan} glow={1.4} ink={0} position={[0.4, 1 + i * 1.45, 0.12]} />
      ))}
      <group position={[0.2, TOWER_H + 1.6, 0.2]} scale={[1, s.squash, 1]}>
        <Fact text="90 FT" size={1.15} depth={0.4} color={C.orange} />
      </group>
    </group>
  );
};

const Volunteer: React.FC<{ face: Face; t: number; position: V3; rotation: V3; seed: number }> = ({ face, t, position, rotation, seed }) => {
  const flap = face === 'panic' ? Math.sin(t * 1.3 + seed) * 0.5 : 0;
  return (
    <Hero
      face={face}
      t={t + seed}
      position={position}
      rotation={rotation}
      scale={0.42}
      shadow={false}
      helmet={C.orange}
      body={['#2563eb', '#16a34a', '#9333ea', '#0891b2'][seed % 4]}
      pose={{ armL: face === 'panic' ? 2.6 + flap : 0.4, armR: face === 'panic' ? 2.6 - flap : 0.4, legL: 0.9, legR: 0.9, lean: -0.05 }}
    />
  );
};

const Gondola: React.FC<{ y: number; face: Face; t: number }> = ({ y, face, t }) => {
  // 23 volunteers on a ring around the tower; seat i=0 faces the camera (+z) and is our hero.
  const seats = useMemo(() => Array.from({ length: 23 }, (_, i) => (i / 23) * Math.PI * 2), []);
  return (
    <group position={[0, y, 0]}>
      <Ink geo={G.cyl(2.3, 2.3, 0.3, 40)} color={C.orange} position={[0, -0.15, 0]} />
      <Ink geo={G.torus(2.3, 0.07)} color={C.ink} ink={0} position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {seats.map((a, i) => {
        const r = 1.85;
        return (
          <Volunteer
            key={i}
            face={i === 0 ? face : face === 'panic' ? 'panic' : hash(i) > 0.5 ? 'grimace' : 'blank'}
            t={t}
            seed={i}
            position={[Math.sin(a) * r, 0, Math.cos(a) * r]}
            rotation={[0, a, 0]}
          />
        );
      })}
    </group>
  );
};

const Wind: React.FC<{ f: number; y: number; on: number }> = ({ f, y, on }) => {
  if (on <= 0) return null;
  return (
    <group>
      {Array.from({ length: 26 }, (_, i) => {
        const x = -3 + 6 * hash(i + 1);
        const z = -1 + 5 * hash(i + 2);
        const yy = y - 6 + ((hash(i + 3) * 14 + f * 0.9) % 14);
        return <mesh key={i} geometry={G.box(0.03, 1.6 + 2 * hash(i), 0.03)} material={basic('#ffffff', 0.55 * on)} position={[x, yy, z]} />;
      })}
    </group>
  );
};

const Shot2World: React.FC = () => {
  const f = useCurrentFrame();
  const cy = cageY(f);
  const face: Face = f < 98 ? 'grimace' : f < 102 ? 'blink' : f < BRAKE_AT + 25 ? 'panic' : 'bug';
  // camera: 8-frame whip-pan up -> wide reveal -> cut close on the gondola -> ride the fall down
  let pos: V3, lk: V3, fov: number;
  if (f < 9) {
    const u = glide(f / 9);
    pos = [3, 2.4, 16];
    lk = [0, lerp(0.5, 15, u), 0];
    fov = 62;
  } else if (f < 66) {
    const u = range(f, 9, 66);
    pos = [lerp(10, 9, u), lerp(13, 14, u), lerp(31, 29, u)];
    lk = [-1.4, 16, 0];
    fov = 60;
  } else {
    const u = range(f, 66, DROP_AT);
    pos = [lerp(1.6, 1.4, u), cy + lerp(2.2, 1.8, u), lerp(7.2, 6.4, u)];
    lk = [0, cy + 0.9, 1.6];
    fov = 50;
    if (f >= DROP_AT) {
      pos = [1.4, cy + 1.8 + 0.4 * range(f, DROP_AT, BRAKE_AT), 6.4 + 0.5 * range(f, BRAKE_AT, 249)];
      lk = [0, cy + 0.6, 1.6];
      fov = lerp(50, 56, range(f, DROP_AT, BRAKE_AT));
    }
  }
  const sh = kick(f, 34, 0.25) + kick(f, BRAKE_AT, 0.18);
  const wind = f >= DROP_AT && f < BRAKE_AT + 6 ? 1 : 0;
  return (
    <>
      <Lights look={LOOKS.sky} />
      <Rig pos={[pos[0], pos[1] + sh, pos[2]]} look={lk} fov={fov} roll={f >= DROP_AT && f < BRAKE_AT ? 0.06 * Math.sin(f * 0.7) : 0} />
      <Ink geo={G.box(120, 0.4, 120)} color="#86efac" ink={0} position={[0, -0.2, 0]} />
      {[[-14, -20, 5], [12, -26, 7], [-20, 6, 4], [18, 2, 6]].map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]}>
          <Ink geo={G.cyl(0.25, 0.3, s * 0.5, 10)} color={C.woodDark} position={[0, s * 0.25, 0]} />
          <Ink geo={G.sphere(s * 0.35, 18)} color="#22c55e" position={[0, s * 0.6, 0]} />
        </group>
      ))}
      {[[-10, 30, -40, 3], [14, 34, -45, 4], [0, 24, -60, 5]].map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]}>
          {[0, 1, 2].map((j) => (
            <Ink key={j} geo={G.sphere(s * (0.7 + 0.2 * j), 16)} color="#ffffff" ink={0.03} position={[(j - 1) * s, j === 1 ? s * 0.3 : 0, 0]} />
          ))}
        </group>
      ))}
      <Tower />
      <Gauge f={f} />
      <Gondola y={cy} face={face} t={f} />
      <Wind f={f} y={cy} on={wind} />
      <Dust f={f} at={BRAKE_AT} position={[0, 0.7, 2.2]} spread={2.4} n={12} />
    </>
  );
};
export const Shot2: React.FC = () => (
  <Stage>
    <Shot2World />
  </Stage>
);

// ================================================================ SHOT 03 · CHRONOMETER & "0" STAMP (465–690)
export const STAMP_AT = 141;
const SEG: Record<string, number[]> = {
  // segments a b c d e f g
  '0': [1, 1, 1, 1, 1, 1, 0], '1': [0, 1, 1, 0, 0, 0, 0], '2': [1, 1, 0, 1, 1, 0, 1], '3': [1, 1, 1, 1, 0, 0, 1], '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1], '6': [1, 0, 1, 1, 1, 1, 1], '7': [1, 1, 1, 0, 0, 0, 0], '8': [1, 1, 1, 1, 1, 1, 1], '9': [1, 1, 1, 1, 0, 1, 1],
};
const SEG_POS: { p: [number, number]; v: boolean }[] = [
  { p: [0, 0.3], v: false }, { p: [0.16, 0.15], v: true }, { p: [0.16, -0.15], v: true }, { p: [0, -0.3], v: false },
  { p: [-0.16, -0.15], v: true }, { p: [-0.16, 0.15], v: true }, { p: [0, 0], v: false },
];
const Digit: React.FC<{ ch: string; x: number; on: boolean }> = ({ ch, x, on }) => (
  <group position={[x, 0, 0]}>
    {SEG_POS.map((s, i) => {
      const lit = on && SEG[ch][i] === 1;
      return (
        <Ink
          key={i}
          geo={s.v ? G.box(0.05, 0.25, 0.02) : G.box(0.25, 0.05, 0.02)}
          color={lit ? '#fecaca' : '#3f0d0d'}
          emissive={lit ? C.red : undefined}
          glow={lit ? 3.2 : undefined}
          ink={0}
          position={[s.p[0], s.p[1], 0]}
        />
      );
    })}
  </group>
);

const Watch: React.FC<{ f: number }> = ({ f }) => {
  // the digits strobe every 2 frames — "too fast to read at normal speed"
  const n = Math.floor(f / 2);
  const ds = [0, 1, 2].map((i) => String(Math.floor(hash(n * 3 + i) * 10)));
  const on = f % 4 < 3;
  return (
    <group>
      <Ink geo={G.rbox(0.7, 0.22, 3.6, 0.1)} color="#3f6212" position={[0, 0.11, 0]} />
      <Ink geo={G.rbox(1.6, 0.42, 1.35, 0.22)} color="#1f2937" position={[0, 0.3, 0]} />
      <Ink geo={G.rbox(1.25, 0.06, 0.95, 0.06)} color="#111827" ink={0} position={[0, 0.52, 0]} />
      {[[-0.85, 0.18], [0.85, 0.18], [-0.85, -0.18], [0.85, -0.18]].map(([x, z], i) => (
        <Ink key={i} geo={G.cyl(0.07, 0.07, 0.16, 10)} color="#9ca3af" position={[x, 0.36, z]} rotation={[0, 0, Math.PI / 2]} />
      ))}
      <group position={[0, 0.56, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        {ds.map((d, i) => (
          <Digit key={i} ch={d} x={(i - 1) * 0.42} on={on} />
        ))}
      </group>
    </group>
  );
};

const Shards: React.FC<{ f: number }> = ({ f }) => {
  const d = f - STAMP_AT;
  if (d < 0) return null;
  return (
    <group>
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + hash(i) * 0.4;
        const v = 0.06 + 0.06 * hash(i + 4);
        const vy = 0.12 + 0.1 * hash(i + 6);
        const t = Math.min(d, 26);
        const y = Math.max(0.05, 0.5 + vy * t - 0.012 * t * t);
        const r = v * t;
        const col = i % 3 === 0 ? '#fecaca' : i % 3 === 1 ? '#1f2937' : '#9ca3af';
        return (
          <Ink
            key={i}
            geo={G.box(0.12 + 0.12 * hash(i + 1), 0.04, 0.1 + 0.1 * hash(i + 2))}
            color={col}
            emissive={i % 3 === 0 ? C.red : undefined}
            glow={i % 3 === 0 ? 1.5 * Math.max(0, 1 - d / 20) : undefined}
            ink={0.01}
            position={[Math.cos(a) * r, y, Math.sin(a) * r]}
            rotation={[t * 0.4 * hash(i + 7), t * 0.3, t * 0.5 * hash(i + 8)]}
          />
        );
      })}
    </group>
  );
};

const Shot3World: React.FC = () => {
  const f = useCurrentFrame();
  const face: Face = f < STAMP_AT - 4 ? 'squint' : f < STAMP_AT ? 'blink' : 'blank';
  const s = slam(f, STAMP_AT, 8, 6);
  // macro push-in on the strobing display, then a pull back to reveal the deadpan hero behind the "0"
  // macro push-in on the strobe, a quick back-off just before the stamp, then a slow reveal of the deadpan hero
  const push = glide(range(f, 0, 100));
  const back = glide(range(f, 104, STAMP_AT - 8));
  const pull = glide(range(f, STAMP_AT + 10, 220));
  const pos: V3 = mix3(mix3(mix3([0.4, 3.2, 4.6], [0.1, 2.0, 2.0], push), [0.7, 3.0, 5.4], back), [1.0, 3.3, 7.0], pull);
  const lk: V3 = mix3(mix3(mix3([0, 0.4, 0], [0, 0.45, 0], push), [0, 1.1, 0], back), [0, 1.6, -0.8], pull);
  const sh = kick(f, STAMP_AT, 0.14);
  const look = { ...LOOKS.lab, keyI: LOOKS.lab.keyI + (f >= STAMP_AT && f < STAMP_AT + 3 ? 2 : 0) };
  return (
    <>
      <Lights look={look} />
      <Rig pos={[pos[0] + sh, pos[1], pos[2]]} look={lk} fov={lerp(44, 50, pull)} roll={lerp(0.04, -0.03, pull)} />
      {/* wooden lab table */}
      <Ink geo={G.rbox(12, 0.5, 7, 0.12)} color={C.wood} position={[0, -0.25, 0]} />
      {Array.from({ length: 7 }, (_, i) => (
        <Ink key={i} geo={G.box(12, 0.01, 0.025)} color={C.woodDark} ink={0} position={[0, 0.005, -3 + i]} />
      ))}
      <Ink geo={G.box(30, 14, 0.4)} color="#292524" ink={0} position={[0, 4, -5]} />
      {f < STAMP_AT ? <Watch f={f} /> : null}
      <Shards f={f} />
      <Dust f={f} at={STAMP_AT} position={[0, 0, 0]} spread={1.6} color="#fca5a5" />
      {s.visible ? (
        <group position={[0, s.y, 0]} scale={[1 / Math.sqrt(s.squash), s.squash, 1 / Math.sqrt(s.squash)]}>
          <BlobShadow r={0.9} opacity={0.35} position={[0, -s.y, 0]} />
          <Fact text="0" size={1.7} depth={0.7} color={C.redDeep} position={[0, 0.98, 0]} />
        </group>
      ) : null}
      {/* the hero leans over the table, squinting at the strobe */}
      <Hero face={face} t={f} position={[0.1, -2.1, -2.3]} pose={{ lean: -0.35, armL: 0.6, armR: 0.6, armLf: 1.2, armRf: 1.2, nod: 0.25 }} scale={1.25} shadow={false} />
    </>
  );
};
export const Shot3: React.FC = () => (
  <Stage>
    <Shot3World />
  </Stage>
);
