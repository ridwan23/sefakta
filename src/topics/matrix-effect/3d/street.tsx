// Icy night street shared by SHOT 01 (the spill) and SHOT 06 (the closing shot).
// Everything here is a pure function of world time `tw` (frames) so shot 06 can land on shot 01's frame 0 exactly.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { C } from './constants';
import { hash, range, smooth, lerp } from '../../../shared/motion';
import { G, Ink, BlobShadow, Hero, Face, Pose, walkPose, basic } from './kit';

type V3 = [number, number, number];

export const WALK_SPEED = 0.045; // units per frame
export const SLIP_AT = 55; // world frame where the foot hits the ice
export const FREEZE_AT = 76; // "berhenti"
export const heroZ = (tw: number) => -2.5 + WALK_SPEED * Math.min(tw, SLIP_AT) + 0.5 * smooth(range(tw, SLIP_AT, FREEZE_AT));

/** Hero pose: walking with the mug, then the slip (feet out, arms up), frozen at FREEZE_AT. */
export const heroState = (tw: number): { pose: Pose; lift: number } => {
  const walk = walkPose(tw / 30); // two steps per second
  const mugArm: Pose = { ...walk, armR: 0.1, armRf: 0.9 };
  if (tw < SLIP_AT) return { pose: mugArm, lift: 0 };
  const u = smooth(range(Math.min(tw, FREEZE_AT), SLIP_AT, FREEZE_AT));
  return {
    pose: {
      lean: lerp(0, 0.9, u),
      legL: lerp(mugArm.legL ?? 0, 1.25, u),
      legR: lerp(mugArm.legR ?? 0, 0.75, u),
      armL: lerp(0.18, 2.5, u),
      armR: lerp(0.1, 2.1, u),
      armLf: lerp(mugArm.armLf ?? 0, 0.3, u),
      armRf: lerp(0.9, 0.2, u),
      head: lerp(0, -0.15, u),
    },
    lift: 0.55 * Math.sin(u * Math.PI * 0.55),
  };
};

/** Mug in the hand while walking, then flung up in an arc that stops at the freeze, then drifts. */
export const mugState = (tw: number, frozenT = 0): { pos: V3; rot: V3; spill: number } => {
  const hz = heroZ(tw);
  const hand: V3 = [0.42, 1.14, hz + 0.5];
  if (tw < SLIP_AT) return { pos: hand, rot: [0, 0.4, 0], spill: 0 };
  const u = range(Math.min(tw, FREEZE_AT), SLIP_AT, FREEZE_AT);
  const z0 = heroZ(SLIP_AT) + 0.5;
  const pos: V3 = [lerp(0.42, 0.2, u), 1.14 + 2.2 * u - 0.4 * u * u, lerp(z0, z0 + 0.9, u)];
  // frozen-time drift: barely moving, slow tumble ("berputar lambat seperti bulan yang sekarat")
  pos[1] += 0.12 * Math.sin(frozenT * 0.03);
  return { pos, rot: [0.6 * u + frozenT * 0.012, 0.4 + frozenT * 0.02, 1.9 * u + frozenT * 0.008], spill: u };
};

// ---------------------------------------------------------------- props
const Mug: React.FC<{ pos: V3; rot: V3; spill: number }> = ({ pos, rot, spill }) => (
  <group position={pos} rotation={rot}>
    <Ink geo={G.cyl(0.2, 0.16, 0.38, 24)} color={C.cream} ink={0.02} />
    <Ink geo={G.cyl(0.18, 0.18, 0.02, 24)} color={C.coffee} ink={0} position={[0, 0.18, 0]} />
    <Ink geo={G.torus(0.11, 0.035, Math.PI * 1.2)} color={C.cream} ink={0.015} position={[0.21, 0, 0]} rotation={[0, 0, -Math.PI * 0.6]} />
    {/* frozen coffee beads leaving the rim */}
    {spill > 0.05
      ? Array.from({ length: 9 }, (_, i) => {
          const k = (i + 1) / 9;
          const d = spill * (0.2 + 0.45 * k);
          return (
            <Ink
              key={i}
              geo={G.sphere(0.035 + 0.05 * hash(i), 12)}
              color={C.coffee}
              ink={0.012}
              position={[Math.sin(i * 1.7) * 0.18 * k, 0.22 + d, Math.cos(i * 2.3) * 0.18 * k]}
            />
          );
        })
      : null}
  </group>
);

const Car: React.FC<{ z: number; x: number; color: string; dir: 1 | -1 }> = ({ z, x, color, dir }) => (
  <group position={[x, 0, z]} rotation={[0, dir > 0 ? 0 : Math.PI, 0]}>
    <BlobShadow r={1.3} opacity={0.3} />
    <Ink geo={G.rbox(1.5, 0.6, 2.9, 0.22)} color={color} position={[0, 0.55, 0]} />
    <Ink geo={G.rbox(1.25, 0.5, 1.5, 0.2)} color={color} position={[0, 1.05, -0.15]} />
    <Ink geo={G.rbox(1.28, 0.32, 1.2, 0.1)} color="#93c5fd" ink={0} position={[0, 1.08, -0.15]} />
    {[[-0.72, 0.95], [0.72, 0.95], [-0.72, -0.95], [0.72, -0.95]].map(([wx, wz], i) => (
      <Ink key={i} geo={G.cyl(0.27, 0.27, 0.22, 18)} color={C.ink} ink={0.01} position={[wx, 0.27, wz]} rotation={[0, 0, Math.PI / 2]} />
    ))}
    <Ink geo={G.sphere(0.12, 12)} color="#fff7ed" emissive="#fde68a" glow={2.5} ink={0} position={[-0.5, 0.6, 1.45]} />
    <Ink geo={G.sphere(0.12, 12)} color="#fff7ed" emissive="#fde68a" glow={2.5} ink={0} position={[0.5, 0.6, 1.45]} />
    <Ink geo={G.box(0.3, 0.12, 0.04)} color="#7f1d1d" emissive="#ef4444" glow={1.5} ink={0} position={[-0.5, 0.65, -1.46]} />
    <Ink geo={G.box(0.3, 0.12, 0.04)} color="#7f1d1d" emissive="#ef4444" glow={1.5} ink={0} position={[0.5, 0.65, -1.46]} />
  </group>
);

const Building: React.FC<{ x: number; z: number; w: number; h: number; d: number; color: string; seed: number }> = ({ x, z, w, h, d, color, seed }) => {
  const wins = useMemo(() => {
    const out: { y: number; zz: number; lit: boolean }[] = [];
    for (let fy = 1.2; fy < h - 0.6; fy += 1.1) for (let fz = -d / 2 + 0.6; fz < d / 2 - 0.3; fz += 0.9) out.push({ y: fy, zz: fz, lit: hash(seed + fy * 13 + fz * 7) > 0.45 });
    return out;
  }, [h, d, seed]);
  return (
    <group position={[x, 0, z]}>
      <Ink geo={G.rbox(w, h, d, 0.12)} color={color} position={[0, h / 2, 0]} />
      {wins.map((wn, i) => (
        <Ink
          key={i}
          geo={G.box(0.04, 0.55, 0.45)}
          color={wn.lit ? '#fde68a' : '#1e293b'}
          emissive={wn.lit ? '#fbbf24' : undefined}
          glow={wn.lit ? 1.3 : undefined}
          ink={0}
          position={[w / 2 + 0.01, wn.y, wn.zz]}
        />
      ))}
    </group>
  );
};

const LampPost: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <BlobShadow r={0.35} />
    <Ink geo={G.cyl(0.07, 0.1, 4.2, 12)} color={C.ink} ink={0.015} position={[0, 2.1, 0]} />
    <Ink geo={G.rbox(0.9, 0.08, 0.08, 0.03)} color={C.ink} ink={0.012} position={[-0.4, 4.15, 0]} />
    <Ink geo={G.cyl(0.12, 0.3, 0.3, 16)} color={C.ink} ink={0.012} position={[-0.8, 4.0, 0]} />
    <Ink geo={G.sphere(0.17, 14)} color="#fff7ed" emissive="#fbbf24" glow={3} ink={0} position={[-0.8, 3.85, 0]} />
  </group>
);

/** Instanced snow flakes; positions derive from tw so freezing tw freezes the snow. */
const Snow: React.FC<{ tw: number; center: number }> = ({ tw, center }) => {
  const N = 140;
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(G.sphere(0.035, 8), basic('#ffffff'), N);
    m.frustumCulled = false;
    return m;
  }, []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  for (let i = 0; i < N; i++) {
    const fall = 0.012 + 0.012 * hash(i + 1);
    const y = 7 - ((hash(i + 2) * 7 + fall * (tw + 400)) % 7);
    tmp.position.set(-4 + 9 * hash(i + 3) + 0.15 * Math.sin(tw * 0.04 + i), y, center - 12 + 15 * hash(i + 4));
    tmp.scale.setScalar(0.7 + hash(i + 5));
    tmp.updateMatrix();
    mesh.setMatrixAt(i, tmp.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

/** Frozen-time shockwave rings around a point. */
export const Shock: React.FC<{ f: number; at: number; position: V3; color?: string; max?: number }> = ({ f, at, position, color = C.cyan, max = 3 }) => {
  const d = f - at;
  if (d < 0 || d > 34) return null;
  return (
    <group position={position}>
      {[0, 6, 12].map((o, i) => {
        const u = (d - o) / 22;
        if (u < 0 || u > 1) return null;
        return <mesh key={i} geometry={G.torus(1, 0.02)} material={basic(color, 1 - u)} scale={0.2 + max * u} rotation={[Math.PI / 2, 0, 0]} />;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- street world
export const Street: React.FC<{ tw: number; face: Face; frozenT?: number; heroRot?: number; mugOverride?: { pos: V3; rot: V3; spill: number } }> = ({ tw, face, frozenT = 0, mugOverride }) => {
  const hz = heroZ(tw);
  const { pose, lift } = heroState(tw);
  const mug = mugOverride ?? mugState(tw, frozenT);
  const carA = -16 + ((tw * 0.16 + 400) % 32);
  const carB = 16 - ((tw * 0.12 + 600) % 32);
  return (
    <group>
      {/* ground */}
      <Ink geo={G.box(40, 0.4, 60)} color={C.asphalt} ink={0} position={[4, -0.2, 0]} />
      <Ink geo={G.rbox(3.6, 0.25, 60, 0.05)} color={C.sidewalk} ink={0.02} position={[0, 0.0, 0]} />
      {Array.from({ length: 24 }, (_, i) => (
        <Ink key={i} geo={G.box(3.62, 0.02, 0.03)} color="#475569" ink={0} position={[0, 0.13, -24 + i * 2]} />
      ))}
      <Ink geo={G.rbox(0.25, 0.32, 60, 0.04)} color="#94a3b8" ink={0.015} position={[1.92, 0.02, 0]} />
      {/* the ice patch where the foot slips */}
      <Ink geo={G.rbox(2.4, 0.03, 3.2, 0.015)} color={C.ice} ink={0} position={[0.1, 0.14, heroZ(SLIP_AT) + 0.4]} />
      <Ink geo={G.box(0.6, 0.01, 0.05)} color="#ffffff" ink={0} position={[-0.3, 0.16, heroZ(SLIP_AT)]} rotation={[0, 0.5, 0]} />
      <Ink geo={G.box(0.4, 0.01, 0.05)} color="#ffffff" ink={0} position={[0.5, 0.16, heroZ(SLIP_AT) + 0.9]} rotation={[0, -0.4, 0]} />
      {/* road markings */}
      {Array.from({ length: 12 }, (_, i) => (
        <Ink key={i} geo={G.box(0.15, 0.02, 1.4)} color="#fef3c7" ink={0} position={[5.2, 0.01, -24 + i * 4]} />
      ))}
      <Building x={-4.2} z={-8} w={3.5} h={8} d={5} color="#334155" seed={1} />
      <Building x={-4.0} z={-2} w={3} h={6} d={4.5} color="#3f3f63" seed={2} />
      <Building x={-4.4} z={3.5} w={3.8} h={9} d={5} color="#2b3a55" seed={3} />
      <Building x={-4.0} z={9} w={3} h={5} d={4.5} color="#3f3f63" seed={4} />
      <Building x={-4.2} z={-14} w={3.5} h={10} d={5} color="#2b3a55" seed={5} />
      <LampPost x={1.65} z={-4} />
      <LampPost x={1.65} z={14} />
      <Car z={carA} x={3.6} color={C.red} dir={1} />
      <Car z={carB} x={6.6} color={C.cyan} dir={-1} />
      <Snow tw={tw} center={hz} />
      <Hero face={face} pose={pose} t={frozenT} position={[0, 0.13 + lift, hz]} />
      <Mug {...mug} />
    </group>
  );
};

/** Shot 01 camera (low-angle Dutch tilt tracking backward) — shot 06 lands on camAt(0). */
export const streetCam = (tw: number): { pos: V3; look: V3; fov: number; roll: number } => {
  const hz = heroZ(tw);
  return { pos: [1.3, 0.7, hz + 6.4], look: [0, 1.75, hz], fov: 52, roll: -0.1 };
};
