// SHOT 04–06: amygdala red alert (with the smartphone backup beat), the 35mm projector, the closing shot.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C } from './constants';
import { range, smooth, glide, lerp, slam, kick, hash, easeOut } from '../../../shared/motion';
import { G, Ink, Fact, Hero, Rig, Lights, LOOKS, mixLook, Dust, basic, toon, Face } from './kit';
import { Street, streetCam, heroZ, Shock } from './street';
import { Stage } from './Stage';

type V3 = [number, number, number];
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ================================================================ SHOT 04 · AMYGDALA RED ALERT (690–1050)
// 0–60   close-up: blank -> BLINK on "anehnya" -> suspicious
// 54–178 6-frame dissolve into the skull cutaway: vibrating smartphone dumps folders into a cardboard cloud
// 175–360 X-ray cut into the brain core: mini amygdala stomps the emergency button, dial swings to +80% DATA
const S4_SKULL = 54;
const S4_CORE = 176;
const STOMP_AT = 222;
const DIAL_AT = 270;
const DATA_AT = 282;

const FaceClose: React.FC<{ f: number }> = ({ f }) => {
  const face: Face = f < 38 ? 'blank' : f < 42 ? 'blink' : 'suspicious';
  const push = glide(range(f, 0, 60));
  return (
    <>
      <Lights look={LOOKS.brain} />
      <Rig pos={[0.3, 2.15, lerp(3.4, 2.6, push)]} look={[0, 2.05, 0]} fov={40} roll={lerp(0, 0.06, smooth(range(f, 42, 56)))} />
      <Hero face={face} t={f} pose={{ head: f >= 42 ? 0.12 : 0, armL: 0.2, armR: 0.2 }} />
      {Array.from({ length: 14 }, (_, i) => (
        <Ink key={i} geo={G.sphere(0.2 + 0.25 * hash(i), 12)} color="#831843" ink={0.02} position={[-3 + 6 * hash(i + 1), 0.5 + 4 * hash(i + 2), -3 - 2 * hash(i + 3)]} />
      ))}
    </>
  );
};

const halfSphere = (r: number) => new THREE.SphereGeometry(r, 48, 32, Math.PI, Math.PI); // back hemisphere (z <= 0)

const Folder: React.FC<{ p: V3; color: string; rot: number }> = ({ p, color, rot }) => (
  <group position={p} rotation={[0.2, rot, rot * 0.5]}>
    <Ink geo={G.rbox(0.62, 0.44, 0.06, 0.03)} color={color} ink={0.015} />
    <Ink geo={G.rbox(0.24, 0.1, 0.06, 0.03)} color={color} ink={0.012} position={[-0.17, 0.26, 0]} />
  </group>
);

const SkullScene: React.FC<{ f: number }> = ({ f }) => {
  const shell = useMemo(() => halfSphere(3.2), []);
  const shellMat = useMemo(() => {
    const m = (toon(C.hero) as THREE.MeshToonMaterial).clone();
    m.side = THREE.DoubleSide;
    return m;
  }, []);
  const vib = f > 80 ? 0.05 * Math.sin(f * 2.9) : 0;
  const folders = ['#f97316', '#38bdf8', '#a855f7', '#22c55e', '#fbbf24', '#ef4444', '#38bdf8', '#f97316', '#22c55e', '#a855f7'];
  // camera: settle on the cutaway, then x-ray push into the core
  const k = glide(range(f, S4_SKULL, 100));
  const dive = smooth(range(f, 160, S4_CORE));
  const pos = mix3(mix3([0, 1.2, 15], [0.8, 1.3, 11.5], k), [0, 0.2, 2], dive);
  return (
    <>
      <Lights look={LOOKS.brain} />
      <Rig pos={pos} look={[0, 1.0, -0.4]} fov={52} roll={lerp(0.05, 0, k)} />
      <group position={[0, 0, -0.5]}>
        <mesh geometry={shell} material={shellMat} />
        <Ink geo={G.torus(3.2, 0.12)} color={C.bone} ink={0.03} />
        {/* the brain, packed in the back half */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <Ink
              key={i}
              geo={G.sphere(0.75 + 0.2 * hash(i), 18)}
              color={i % 2 ? C.brain : '#f472b6'}
              ink={0.025}
              position={[Math.cos(a) * 1.55, 0.35 + Math.sin(a) * 1.35, -1.6 - 0.3 * hash(i + 3)]}
            />
          );
        })}
        <Ink geo={G.sphere(1.3, 24)} color={C.brain} position={[0, 0.3, -1.7]} />
        {/* overloaded smartphone */}
        <group position={[vib, -0.1, 0.4]} rotation={[0, -0.15, vib * 2]}>
          <Ink geo={G.rbox(1.5, 2.8, 0.18, 0.18)} color="#111827" ink={0.03} />
          <Ink geo={G.rbox(1.32, 2.5, 0.02, 0.1)} color="#7dd3fc" emissive={C.cyan} glow={f > 80 && f % 6 < 3 ? 1.6 : 0.8} ink={0} position={[0, 0, 0.1]} />
          {Array.from({ length: 8 }, (_, i) => (
            <Ink key={i} geo={G.rbox(0.3, 0.3, 0.03, 0.06)} color={folders[i]} ink={0} position={[-0.38 + (i % 3) * 0.38, 0.8 - Math.floor(i / 3) * 0.42, 0.12]} />
          ))}
          <Ink geo={G.rbox(1.0, 0.2, 0.03, 0.08)} color="#ef4444" emissive={C.red} glow={1.2} ink={0} position={[0, -0.9, 0.12]} />
        </group>
        {/* folders burst out of the phone into the puffy cardboard cloud above */}
        {folders.map((c, i) => {
          const t0 = 92 + i * 6;
          const u = range(f, t0, t0 + 24);
          if (u <= 0 || u >= 1) return null;
          const e = easeOut(u);
          const side = (hash(i) - 0.5) * 3;
          return <Folder key={i} color={c} rot={u * 4 + i} p={[lerp(0, side, e), lerp(0.3, 4.3, e) + Math.sin(u * Math.PI) * 0.8, lerp(0.6, 0.8, e)]} />;
        })}
        <group position={[0, 4.6, 0.3]} scale={lerp(0.6, 1, smooth(range(f, 90, 130))) + 0.04 * Math.sin(f * 0.3)}>
          {[[-1.4, 0, 0.8], [-0.5, 0.45, 1.05], [0.6, 0.35, 1], [1.45, 0, 0.75], [0, -0.2, 0.9]].map(([x, y, r], i) => (
            <Ink key={i} geo={G.sphere(r, 18)} color="#e7d3b0" ink={0.03} position={[x, y, 0]} />
          ))}
        </group>
      </group>
    </>
  );
};

const Dial: React.FC<{ f: number }> = ({ f }) => {
  const u = slam(f, DIAL_AT, 1, 0).landed ? glide(range(f, DIAL_AT, DIAL_AT + 14)) : 0;
  const wob = f > DIAL_AT + 14 ? 0.05 * Math.exp(-(f - DIAL_AT - 14) / 10) * Math.sin(f) : 0;
  const ang = lerp(Math.PI * 0.95, Math.PI * 0.12, u) + wob; // needle from "0" to "+80%"
  return (
    <group position={[2.3, 2.6, -1]} rotation={[0, -0.4, 0]}>
      <Ink geo={G.cyl(1.25, 1.25, 0.25, 40)} color={C.cream} rotation={[Math.PI / 2, 0, 0]} />
      <Ink geo={G.torus(1.25, 0.1)} color="#475569" ink={0.02} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI - (i / 8) * Math.PI;
        return <Ink key={i} geo={G.box(0.05, 0.22, 0.03)} color={i > 5 ? C.red : C.ink} ink={0} position={[Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0.14]} rotation={[0, 0, a - Math.PI / 2]} />;
      })}
      <group position={[0, 0, 0.18]} rotation={[0, 0, ang - Math.PI / 2]}>
        <Ink geo={G.box(0.07, 0.95, 0.04)} color={C.red} ink={0.012} position={[0, 0.45, 0]} />
      </group>
      <Ink geo={G.sphere(0.12, 12)} color={C.ink} ink={0} position={[0, 0, 0.2]} />
      <Ink geo={G.cyl(0.1, 0.14, 2.6, 10)} color="#475569" position={[0, -1.6, -0.1]} />
    </group>
  );
};

const CoreScene: React.FC<{ f: number }> = ({ f }) => {
  const pressed = f >= STOMP_AT;
  const alarm = smooth(range(f, STOMP_AT, STOMP_AT + 3));
  const pulse = pressed ? 0.5 + 0.5 * Math.sin((f - STOMP_AT) * 0.5) : 0;
  const look = mixLook(LOOKS.brain, { ...LOOKS.alarm, ambI: LOOKS.alarm.ambI + 0.3 * pulse }, alarm);
  // amygdala jumps (STOMP_AT-22 .. STOMP_AT) and lands on the button, then keeps stomping
  const jumpU = range(f, STOMP_AT - 20, STOMP_AT);
  let ay = 1.05;
  if (f >= STOMP_AT - 20 && f < STOMP_AT) ay = 1.05 + 2.2 * Math.sin(jumpU * Math.PI) + (jumpU > 0.5 ? 0 : 0);
  if (f < STOMP_AT - 20) ay = 0;
  const after = f - STOMP_AT;
  if (after >= 0) ay = 0.75 + Math.abs(Math.sin(after * 0.22)) * 0.5 * Math.exp(-after / 60);
  const ax = f < STOMP_AT - 20 ? -1.5 : lerp(-1.5, 0, smooth(jumpU));
  const btnPress = pressed ? 0.18 * (1 - Math.abs(Math.sin(after * 0.22)) * Math.exp(-after / 60)) : 0;
  const face: Face = f < STOMP_AT - 3 ? 'frown' : f < STOMP_AT ? 'blink' : 'battle';
  const k = glide(range(f, S4_CORE, 205));
  const pos = mix3([0.4, 2.0, 5.2], [1.2, 3.4, 10.5], k);
  const sh = kick(f, STOMP_AT, 0.15) + kick(f, DATA_AT, 0.12);
  const s = slam(f, DATA_AT, 9, 6);
  return (
    <>
      <Lights look={look} />
      <Rig pos={[pos[0] + sh, pos[1], pos[2]]} look={[0.5, 1.9, 0]} fov={54} roll={pressed ? 0.04 * Math.sin(after * 0.15) : -0.03} />
      {/* soft folds of brain tissue around the core */}
      <Ink geo={G.cyl(4.2, 4.6, 0.6, 40)} color="#f472b6" position={[0, -0.3, 0]} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = Math.PI * (1.05 + (i / 11) * 0.9); // back half only, never between camera and set
        return <Ink key={i} geo={G.sphere(1.3 + 0.4 * hash(i), 16)} color={i % 2 ? C.brain : '#f472b6'} position={[Math.cos(a) * 6.5, 0.8 + 1.8 * hash(i + 2), Math.sin(a) * 5 - 1.5]} />;
      })}
      {/* emergency button console */}
      <Ink geo={G.rbox(1.9, 0.5, 1.9, 0.12)} color="#facc15" position={[0, 0.25, 0]} />
      <Ink geo={G.cyl(0.62, 0.7, 0.18, 32)} color="#9ca3af" position={[0, 0.58, 0]} />
      <Ink geo={G.sphere(0.6, 28)} color={C.red} emissive={C.red} glow={pressed ? 0.6 + pulse : 0.15} position={[0, 0.7 - btnPress, 0]} scale={[1, 0.5, 1]} />
      {/* siren beacon */}
      <group position={[-2.4, 0, -0.6]}>
        <Ink geo={G.cyl(0.12, 0.16, 2.2, 10)} color="#475569" position={[0, 1.1, 0]} />
        <Ink geo={G.cyl(0.35, 0.4, 0.2, 20)} color="#475569" position={[0, 2.25, 0]} />
        <Ink geo={G.sphere(0.36, 20)} color="#fecaca" emissive={C.red} glow={pressed ? 1 + 2 * pulse : 0.2} position={[0, 2.45, 0]} scale={[1, 1.1, 1]} />
        {pressed ? (
          <group position={[0, 2.45, 0]} rotation={[0, after * 0.25, 0]}>
            <mesh geometry={G.cone(1.1, 5)} material={basic('#ef4444', 0.18)} position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
            <mesh geometry={G.cone(1.1, 5)} material={basic('#ef4444', 0.18)} position={[-2.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]} />
          </group>
        ) : null}
      </group>
      <Dial f={f} />
      {/* mini amygdala: red bean, 0.6x hero, emissive eyes */}
      <Hero
        face={face}
        t={f}
        skin="#f87171"
        body={C.redDeep}
        scale={0.62}
        position={[ax, ay, 0]}
        rotation={[0, 0.25, 0]}
        shadow={ay < 0.1}
        pose={pressed ? { armL: 2.4, armR: 2.4, legL: 0.3 * Math.sin(after * 0.44), legR: -0.3 * Math.sin(after * 0.44) } : { armL: 0.6 + jumpU * 2, armR: 0.6 + jumpU * 2, legL: jumpU * 0.6, legR: jumpU * 0.6 }}
      />
      <Fact text="AMYGDALA" size={0.32} depth={0.08} color={C.red} position={[0, 0.25, 1.05]} />
      {s.visible ? (
        <group position={[0.3, 4.2 + s.y, 0.2]} scale={[1, s.squash, 1]} rotation={[0, -0.12, 0]}>
          <Fact text="+80% DATA" size={0.4} depth={0.25} color={C.gold} />
        </group>
      ) : null}
      <Dust f={f} at={STOMP_AT} position={[0, 0.9, 0]} spread={1.3} color="#fecaca" />
    </>
  );
};

export const Shot4: React.FC = () => {
  const f = useCurrentFrame();
  const fadeIn = range(f, S4_SKULL, S4_SKULL + 6);
  const flash = f >= S4_CORE - 1 && f < S4_CORE + 3 ? 1 - range(f, S4_CORE - 1, S4_CORE + 3) : 0;
  return (
    <AbsoluteFill>
      {f < S4_SKULL + 6 ? (
        <Stage>
          <FaceClose f={f} />
        </Stage>
      ) : null}
      {f >= S4_SKULL && f < S4_CORE ? (
        <Stage opacity={fadeIn}>
          <SkullScene f={f} />
        </Stage>
      ) : null}
      {f >= S4_CORE ? (
        <Stage>
          <CoreScene f={f} />
        </Stage>
      ) : null}
      {flash > 0 ? <AbsoluteFill style={{ background: '#fff1f2', opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};

// ================================================================ SHOT 05 · 35MM PROJECTOR (1050–1320)
const TRICK_AT = 100; // "menipu"
const LONGER_AT = 192; // "lima kali"
const filmMat = (() => {
  const m = (toon(C.film) as THREE.MeshToonMaterial).clone();
  m.side = THREE.DoubleSide;
  return m;
})();
const filmGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.16, 28, 1, true);

const Cinema: React.FC = () => {
  const f = useCurrentFrame();
  const face: Face = f < TRICK_AT - 4 ? 'smile' : f < TRICK_AT ? 'blink' : 'dizzy';
  // film loops spill out of the projector and pile up around the seated hero
  const N = Math.floor(lerp(0, 120, smooth(range(f, 20, 230))));
  const loops = [] as React.ReactNode[];
  for (let i = 0; i < N; i++) {
    const born = 20 + (i / 120) * 210;
    const u = range(f, born, born + 14);
    const layer = Math.floor(i / 14);
    const a = hash(i) * Math.PI * 2;
    const rr = 0.4 + 1.6 * hash(i + 1);
    const target: V3 = [0.2 + Math.cos(a) * rr, 0.15 + layer * 0.22 + 0.1 * hash(i + 2), 0.6 + Math.sin(a) * rr * 0.7];
    const from: V3 = [2.3, 2.6, -1.8];
    const p = mix3(from, target, easeOut(u));
    p[1] += Math.sin(u * Math.PI) * 1.2;
    loops.push(
      <group key={i} position={p} rotation={[hash(i + 3) * 3, hash(i + 4) * 3, hash(i + 5) * 3]} scale={0.8 + 0.5 * hash(i + 6)}>
        <mesh geometry={filmGeo} material={filmMat} />
        <Ink geo={G.torus(0.42, 0.012)} color={C.ink} ink={0} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <Ink geo={G.torus(0.42, 0.012)} color={C.ink} ink={0} position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]} />
      </group>,
    );
  }
  const k = glide(range(f, 30, 250));
  const pos = mix3([0.6, 2.5, 5.2], [2.6, 5.0, 10.5], k);
  const lk = mix3([0.3, 1.8, 0.4], [0.8, 2.0, -0.8], k);
  const s = slam(f, LONGER_AT, 10, 7);
  const sh = kick(f, LONGER_AT, 0.12);
  return (
    <>
      <Lights look={LOOKS.cinema} />
      <Rig pos={[pos[0], pos[1] + sh, pos[2]]} look={lk} fov={50} roll={lerp(-0.04, 0.03, k)} />
      {/* room */}
      <Ink geo={G.box(30, 0.4, 30)} color="#3f1d1d" ink={0} position={[0, -0.2, 0]} />
      {Array.from({ length: 16 }, (_, i) => (
        <Ink key={i} geo={G.cyl(0.48, 0.48, 9, 12)} color={i % 2 ? '#991b1b' : '#7f1d1d'} ink={0.02} position={[-7 + i * 0.9, 4.5, -5.5]} />
      ))}
      {/* the screen behind the camera side is the projector target; we see the projector + beam */}
      <group position={[2.6, 0, -2.4]}>
        <Ink geo={G.rbox(0.9, 2, 0.9, 0.08)} color="#57534e" position={[0, 1, 0]} />
        <Ink geo={G.rbox(1.3, 0.8, 1.0, 0.12)} color="#292524" position={[0, 2.4, 0]} />
        <Ink geo={G.cyl(0.18, 0.24, 0.5, 18)} color="#111827" position={[-0.4, 2.4, 0.55]} rotation={[Math.PI / 2, 0, 0]} />
        {[[-0.35, 3.25], [0.4, 3.25]].map(([x, y], i) => (
          <group key={i} position={[x, y, 0]} rotation={[0, Math.PI / 2, 0]}>
            <group rotation={[0, 0, f * 0.15 * (i ? 1 : 1.3)]}>
              <Ink geo={G.cyl(0.55, 0.55, 0.12, 28)} color="#1f2937" rotation={[Math.PI / 2, 0, 0]} />
              {[0, 1, 2].map((j) => (
                <Ink key={j} geo={G.box(0.9, 0.08, 0.14)} color="#9ca3af" ink={0} rotation={[0, 0, (j * Math.PI) / 3]} />
              ))}
            </group>
          </group>
        ))}
        <mesh geometry={G.cone(1.8, 7)} material={basic('#fde68a', 0.12)} position={[-0.4 - 0.2, 2.4, 0.55 + 3.6]} rotation={[-Math.PI / 2, 0, 0]} />
      </group>
      {/* cinema seat + hero spectator */}
      <group position={[0.2, 0, 0.6]} rotation={[0, 0.35, 0]}>
        <Ink geo={G.rbox(1.4, 0.5, 1.2, 0.12)} color={C.redDeep} position={[0, 0.55, 0]} />
        <Ink geo={G.rbox(1.4, 1.5, 0.3, 0.12)} color={C.redDeep} position={[0, 1.3, -0.6]} />
        <Hero face={face} t={f} position={[0, 0.55, 0]} pose={{ legL: 1.4, legR: 1.4, armL: 0.35, armR: 0.35, armLf: 0.5, armRf: 0.5, lean: 0.12, head: face === 'dizzy' ? 0.15 * Math.sin(f * 0.12) : 0 }} shadow={false} />
      </group>
      {loops}
      {s.visible ? (
        <group position={[0.6, 3.9 + s.y, 0.6]} scale={[1, s.squash, 1]} rotation={[0, 0.2, 0]}>
          <Fact text="5X LONGER" size={0.4} depth={0.3} color={C.gold} />
        </group>
      ) : null}
      <Dust f={f} at={LONGER_AT} position={[0.6, 3.6, 0.6]} spread={1.8} color="#fde68a" />
    </>
  );
};
export const Shot5: React.FC = () => (
  <Stage>
    <Cinema />
  </Stage>
);

// ================================================================ SHOT 06 · PENUTUP (1320–1500)
// Back on the street: the world freezes for 40 frames on "melambat", then moves on; the hero ends calm and smiling.
export const loopTw = (l: number) => (l < 70 ? l - 140 : l < 110 ? -70 : l - 180);
const LoopWorld: React.FC = () => {
  const l = Math.min(useCurrentFrame(), 179); // holds the final story frame under the CTA
  const tw = loopTw(l);
  const frozen = l >= 70 && l < 110;
  const face: Face = l < 72 ? 'whistle' : l < 76 ? 'blink' : l < 108 ? 'glance' : l < 112 ? 'blink' : l < 140 ? 'whistle' : 'smile';
  const freezeK = l < 70 ? 0 : l < 110 ? smooth(range(l, 70, 74)) : 1 - smooth(range(l, 110, 118));
  const look = mixLook(LOOKS.night, LOOKS.freeze, freezeK);
  const end = streetCam(tw);
  const hz = heroZ(tw);
  const k = glide(range(l, 0, 176));
  const wide = { pos: [3.6, 4.2, hz + 11] as V3, look: [0, 1.4, hz + 1] as V3 };
  return (
    <>
      <Lights look={look} />
      <Rig pos={mix3(wide.pos, end.pos, k)} look={mix3(wide.look, end.look, k)} fov={lerp(46, end.fov, k)} roll={lerp(0, end.roll, k)} />
      <Street tw={tw} face={face} frozenT={frozen ? l - 70 : 0} />
      <Shock f={l} at={70} position={[0, 1.2, hz]} max={4} />
      <Shock f={l} at={73} position={[3.6, 0.6, -16 + ((tw * 0.16 + 400) % 32)]} color="#e0f2fe" max={3} />
    </>
  );
};
export const Shot6: React.FC = () => (
  <Stage>
    <LoopWorld />
  </Stage>
);

