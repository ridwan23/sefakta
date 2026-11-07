// Shared toolkit for the Matrix Effect diorama: two-tone toon materials, inverted-hull ink outlines,
// extruded 3D numerals, the bean-head hero, camera rig, lights, blob shadows and impact dust.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fontJson from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { C } from './constants';
import { hash } from '../../../shared/motion';

type V3 = [number, number, number];

// ---------------------------------------------------------------- materials
const gradient = (() => {
  // two-tone cel ramp with a thin mid step (shadow / mid / lit)
  const data = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const matCache = new Map<string, THREE.Material>();
export const toon = (color: string, emissive?: string, emissiveIntensity = 1) => {
  const key = `${color}|${emissive ?? ''}|${emissiveIntensity}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({
      color,
      gradientMap: gradient,
      emissive: emissive ?? '#000000',
      emissiveIntensity: emissive ? emissiveIntensity : 0,
    });
    matCache.set(key, m);
  }
  return m;
};
export const basic = (color: string, opacity = 1) => {
  const key = `basic|${color}|${opacity}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
    matCache.set(key, m);
  }
  return m;
};

const outlineCache = new Map<number, THREE.ShaderMaterial>();
const outlineMat = (w: number) => {
  let m = outlineCache.get(w);
  if (!m) {
    m = new THREE.ShaderMaterial({
      uniforms: { w: { value: w }, col: { value: new THREE.Color(C.ink) } },
      vertexShader: `uniform float w; void main(){ vec3 p = position + normal * w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
      fragmentShader: `uniform vec3 col; void main(){ gl_FragColor = vec4(col,1.0); }`,
      side: THREE.BackSide,
    });
    outlineCache.set(w, m);
  }
  return m;
};

// smooth-normal hull so the ink shell never cracks on hard edges
const hullCache = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>();
const hullOf = (g: THREE.BufferGeometry) => {
  let h = hullCache.get(g);
  if (!h) {
    const c = new THREE.BufferGeometry();
    c.setAttribute('position', g.getAttribute('position'));
    if (g.index) c.setIndex(g.index);
    h = mergeVertices(c, 1e-4);
    h.computeVertexNormals();
    hullCache.set(g, h);
  }
  return h;
};

// ---------------------------------------------------------------- geometry cache
const geoCache = new Map<string, THREE.BufferGeometry>();
const cached = (key: string, make: () => THREE.BufferGeometry) => {
  let g = geoCache.get(key);
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
};
export const G = {
  rbox: (w: number, h: number, d: number, r = 0.08) =>
    cached(`rbox${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2))),
  box: (w: number, h: number, d: number) => cached(`box${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)),
  sphere: (r: number, seg = 28) => cached(`sph${r},${seg}`, () => new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7))),
  capsule: (r: number, len: number) => cached(`cap${r},${len}`, () => new THREE.CapsuleGeometry(r, len, 6, 14)),
  cyl: (rt: number, rb: number, h: number, seg = 24) => cached(`cyl${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)),
  torus: (r: number, tube: number, arc = Math.PI * 2) =>
    cached(`tor${r},${tube},${arc}`, () => new THREE.TorusGeometry(r, tube, 12, 36, arc)),
  circle: (r: number) => cached(`cir${r}`, () => new THREE.CircleGeometry(r, 32)),
  plane: (w: number, h: number) => cached(`pl${w},${h}`, () => new THREE.PlaneGeometry(w, h)),
  cone: (r: number, h: number) => cached(`cone${r},${h}`, () => new THREE.ConeGeometry(r, h, 32, 1, true)),
};

const font = new FontLoader().parse(fontJson as never);
export const textGeo = (text: string, size = 1, depth = 0.35) =>
  cached(`txt${text},${size},${depth}`, () => {
    const g = new TextGeometry(text, {
      font,
      size,
      depth,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: size * 0.06,
      bevelSize: size * 0.04,
      bevelSegments: 2,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  });

// ---------------------------------------------------------------- primitives
type InkProps = {
  geo: THREE.BufferGeometry;
  color: string;
  ink?: number;
  emissive?: string;
  glow?: number;
  position?: V3;
  rotation?: V3;
  scale?: V3 | number;
  mat?: THREE.Material;
  visible?: boolean;
};
/** A toon-shaded mesh with an inked outline shell. */
export const Ink: React.FC<InkProps> = ({ geo, color, ink = 0.03, emissive, glow, position, rotation, scale, mat, visible = true }) => (
  <group position={position} rotation={rotation} scale={scale} visible={visible}>
    <mesh geometry={geo} material={mat ?? toon(color, emissive, glow)} />
    {ink > 0 ? <mesh geometry={hullOf(geo)} material={outlineMat(ink)} /> : null}
  </group>
);

/** Extruded 3D numeral / label ("facts as objects"). */
export const Fact: React.FC<{ text: string; size?: number; depth?: number; color: string; position?: V3; rotation?: V3; scale?: V3 | number; emissive?: string; glow?: number; ink?: number }> = ({
  text,
  size = 1,
  depth = 0.35,
  ink = 0.035,
  ...rest
}) => <Ink geo={textGeo(text, size, depth)} ink={ink * size} {...rest} />;

export const BlobShadow: React.FC<{ position?: V3; r?: number; opacity?: number }> = ({ position = [0, 0, 0], r = 0.6, opacity = 0.28 }) => (
  <mesh geometry={G.circle(r)} material={basic('#000000', opacity)} position={[position[0], position[1] + 0.012, position[2]]} rotation={[-Math.PI / 2, 0, 0]} />
);

/** Impact dust: puffs expand and fade out after `at`. */
export const Dust: React.FC<{ f: number; at: number; position: V3; spread?: number; n?: number; color?: string }> = ({ f, at, position, spread = 1.4, n = 10, color = '#e2e8f0' }) => {
  const d = f - at;
  const mats = useMemo(() => Array.from({ length: n }, () => new THREE.MeshToonMaterial({ color, gradientMap: gradient, transparent: true })), [n, color]);
  if (d < 0 || d > 30) return null;
  const u = d / 30;
  return (
    <group position={position}>
      {mats.map((m, i) => {
        const a = (i / n) * Math.PI * 2 + hash(i) * 0.5;
        const r = spread * (0.4 + 0.6 * (1 - (1 - u) ** 3)) * (0.7 + 0.5 * hash(i + 9));
        m.opacity = 1 - u;
        const s = 0.18 + 0.35 * u * (0.6 + hash(i + 3));
        return <mesh key={i} geometry={G.sphere(1, 12)} material={m} position={[Math.cos(a) * r, 0.15 + 0.5 * u * hash(i + 5), Math.sin(a) * r]} scale={s} />;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- camera & lights
export const Rig: React.FC<{ pos: V3; look: V3; fov?: number; roll?: number }> = ({ pos, look, fov = 40, roll = 0 }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(...look);
  cam.rotateZ(roll);
  if (cam.fov !== fov) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }
  return null;
};

export type LightLook = { bg: string; amb: string; ambI: number; key: string; keyI: number; keyPos: V3; rim: string; rimI: number; fog?: [number, number] };
export const LOOKS = {
  night: { bg: '#141b2e', amb: '#c7d2fe', ambI: 0.55, key: '#ffd8a8', keyI: 2.1, keyPos: [4, 9, 6], rim: '#38bdf8', rimI: 1.1, fog: [18, 46] },
  freeze: { bg: '#0b2236', amb: '#bae6fd', ambI: 0.7, key: '#e0f2fe', keyI: 2.0, keyPos: [-3, 10, 6], rim: '#22d3ee', rimI: 1.6, fog: [16, 44] },
  sky: { bg: '#7dd3fc', amb: '#ffffff', ambI: 0.8, key: '#fff7ed', keyI: 2.2, keyPos: [6, 14, 8], rim: '#fde68a', rimI: 0.8, fog: [40, 120] },
  lab: { bg: '#1c1917', amb: '#fde68a', ambI: 0.55, key: '#ffedd5', keyI: 2.3, keyPos: [3, 8, 5], rim: '#f59e0b', rimI: 1.0, fog: [10, 30] },
  brain: { bg: '#2a0f1f', amb: '#fbcfe8', ambI: 0.65, key: '#fff1f2', keyI: 2.0, keyPos: [2, 8, 6], rim: '#f472b6', rimI: 1.2, fog: [14, 40] },
  alarm: { bg: '#3b0a0a', amb: '#fecaca', ambI: 0.5, key: '#fee2e2', keyI: 1.8, keyPos: [2, 8, 6], rim: '#ef4444', rimI: 2.0, fog: [12, 36] },
  cinema: { bg: '#120c08', amb: '#fde68a', ambI: 0.42, key: '#ffedd5', keyI: 1.7, keyPos: [-4, 7, 5], rim: '#f59e0b', rimI: 1.2, fog: [12, 34] },
} satisfies Record<string, LightLook>;

const lc = new THREE.Color(), lc2 = new THREE.Color();
const mixHex = (a: string, b: string, k: number) => '#' + lc.set(a).lerp(lc2.set(b), k).getHexString();
export const mixLook = (a: LightLook, b: LightLook, k: number): LightLook => ({
  bg: mixHex(a.bg, b.bg, k),
  amb: mixHex(a.amb, b.amb, k),
  ambI: a.ambI + (b.ambI - a.ambI) * k,
  key: mixHex(a.key, b.key, k),
  keyI: a.keyI + (b.keyI - a.keyI) * k,
  keyPos: a.keyPos.map((v, i) => v + (b.keyPos[i] - v) * k) as V3,
  rim: mixHex(a.rim, b.rim, k),
  rimI: a.rimI + (b.rimI - a.rimI) * k,
  fog: a.fog && b.fog ? [a.fog[0] + (b.fog[0] - a.fog[0]) * k, a.fog[1] + (b.fog[1] - a.fog[1]) * k] : b.fog,
});

export const Lights: React.FC<{ look: LightLook }> = ({ look }) => (
  <>
    <color attach="background" args={[look.bg]} />
    {look.fog ? <fog attach="fog" args={[look.bg, look.fog[0], look.fog[1]]} /> : null}
    <ambientLight color={look.amb} intensity={look.ambI} />
    <directionalLight color={look.key} intensity={look.keyI} position={look.keyPos} />
    <directionalLight color={look.rim} intensity={look.rimI} position={[-look.keyPos[0] * 1.2, look.keyPos[1] * 0.4, -look.keyPos[2]]} />
  </>
);

// ---------------------------------------------------------------- bean-head hero
export type Face = 'whistle' | 'blink' | 'bug' | 'grimace' | 'panic' | 'squint' | 'blank' | 'suspicious' | 'smile' | 'dizzy' | 'glance' | 'battle' | 'frown';
export type Pose = {
  lean?: number; // + leans back (x rotation of the torso)
  twist?: number; // y rotation of the whole body
  armL?: number; // z swing (+ up/out)
  armR?: number;
  armLf?: number; // x swing (+ forward)
  armRf?: number;
  legL?: number; // x swing (+ forward)
  legR?: number;
  head?: number; // head tilt (z)
  nod?: number; // head pitch (x, + looks down)
};

const Eye: React.FC<{ x: number; kind: Face; t: number }> = ({ x, kind, t }) => {
  const side = Math.sign(x);
  switch (kind) {
    case 'blink':
      return <Ink geo={G.rbox(0.16, 0.035, 0.04, 0.015)} color={C.ink} ink={0} position={[x, 0.06, 0]} />;
    case 'squint':
      return <Ink geo={G.rbox(0.17, 0.04, 0.04, 0.015)} color={C.ink} ink={0} position={[x, 0.06, 0]} rotation={[0, 0, side * 0.35]} />;
    case 'bug':
    case 'panic':
    case 'glance':
    case 'battle': {
      const py = kind === 'glance' ? -0.09 : 0;
      const jitter = kind === 'panic' ? Math.sin(t * 2.7 + x * 9) * 0.02 : 0;
      return (
        <group position={[x * 1.1, 0.08, 0.02]}>
          <Ink geo={G.sphere(0.165, 20)} color="#ffffff" ink={0.018} />
          <Ink geo={G.sphere(0.07, 14)} color={C.ink} ink={0} position={[jitter - side * (kind === 'battle' ? 0.03 : 0), py, 0.12]} />
          {kind === 'battle' ? <Ink geo={G.rbox(0.24, 0.05, 0.05, 0.02)} color={C.ink} ink={0} position={[0, 0.2, 0.08]} rotation={[0, 0, -side * 0.45]} /> : null}
        </group>
      );
    }
    case 'dizzy':
      return (
        <group position={[x, 0.07, 0.02]} rotation={[0, 0, t * 0.35 * side]}>
          <Ink geo={G.torus(0.11, 0.018)} color={C.ink} ink={0} />
          <Ink geo={G.torus(0.055, 0.018, Math.PI * 1.4)} color={C.ink} ink={0} />
        </group>
      );
    case 'suspicious':
    case 'frown': {
      const raise = kind === 'suspicious' && x > 0 ? 0.08 : 0;
      const ang = kind === 'frown' ? -side * 0.4 : x > 0 ? 0.25 : -0.1;
      return (
        <group position={[x, 0.06, 0]}>
          <Ink geo={G.sphere(0.065, 14)} color={C.ink} ink={0} />
          <Ink geo={G.rbox(0.2, 0.04, 0.04, 0.015)} color={C.ink} ink={0} position={[0, 0.15 + raise, 0.02]} rotation={[0, 0, ang]} />
        </group>
      );
    }
    default:
      return <Ink geo={G.sphere(0.065, 14)} color={C.ink} ink={0} position={[x, 0.06, 0]} />;
  }
};

const Mouth: React.FC<{ kind: Face; t: number }> = ({ kind, t }) => {
  switch (kind) {
    case 'whistle':
      return <Ink geo={G.torus(0.05, 0.022)} color={C.ink} ink={0} position={[0.1, -0.2, 0]} />;
    case 'bug':
    case 'glance':
      return <Ink geo={G.sphere(0.1, 16)} color="#7f1d1d" ink={0.015} position={[0, -0.2, -0.02]} scale={[1, 1.15, 0.5]} />;
    case 'panic':
    case 'battle': {
      const w = 1 + 0.12 * Math.sin(t * 1.9);
      return <Ink geo={G.sphere(0.14, 16)} color="#7f1d1d" ink={0.015} position={[0, -0.21, -0.03]} scale={[1.2 * w, 0.9, 0.5]} />;
    }
    case 'grimace':
      return (
        <group position={[0, -0.2, 0]}>
          <Ink geo={G.rbox(0.36, 0.12, 0.05, 0.03)} color="#ffffff" ink={0.015} />
          <Ink geo={G.box(0.36, 0.012, 0.06)} color={C.ink} ink={0} />
        </group>
      );
    case 'smile':
      return <Ink geo={G.torus(0.13, 0.022, Math.PI)} color={C.ink} ink={0} position={[0, -0.12, 0]} rotation={[0, 0, Math.PI]} />;
    case 'frown':
      return <Ink geo={G.torus(0.11, 0.022, Math.PI)} color={C.ink} ink={0} position={[0, -0.27, 0]} />;
    case 'dizzy':
      return <Ink geo={G.torus(0.09, 0.02, Math.PI)} color={C.ink} ink={0} position={[0.02, -0.2, 0]} rotation={[0, 0, Math.PI + Math.sin(t * 0.3) * 0.4]} />;
    case 'suspicious':
      return <Ink geo={G.rbox(0.18, 0.035, 0.04, 0.015)} color={C.ink} ink={0} position={[0.04, -0.2, 0]} rotation={[0, 0, 0.18]} />;
    default:
      return <Ink geo={G.rbox(0.18, 0.035, 0.04, 0.015)} color={C.ink} ink={0} position={[0, -0.2, 0]} />;
  }
};

const Limb: React.FC<{ at: V3; rz: number; rx: number; r: number; len: number; color: string; foot?: boolean; hand?: boolean }> = ({ at, rz, rx, r, len, color, foot, hand }) => (
  <group position={at} rotation={[rx, 0, rz]}>
    <Ink geo={G.capsule(r, len)} color={color} ink={0.02} position={[0, -len / 2, 0]} />
    {foot ? <Ink geo={G.rbox(0.24, 0.12, 0.34, 0.05)} color={C.ink} ink={0.015} position={[0, -len - 0.06, 0.06]} /> : null}
    {hand ? <Ink geo={G.sphere(r * 1.35, 14)} color={C.hero} ink={0.018} position={[0, -len - r * 0.4, 0]} /> : null}
  </group>
);

/** Bean-head hero, ~2.3 units tall, feet at y=0. `t` drives idle micro-motion of some faces (no idle bounce). */
export const Hero: React.FC<{ face: Face; pose?: Pose; t?: number; position?: V3; rotation?: V3; scale?: number; body?: string; skin?: string; shadow?: boolean; helmet?: string }> = ({
  face,
  pose = {},
  t = 0,
  position,
  rotation,
  scale = 1,
  body = C.hoodie,
  skin = C.hero,
  shadow = true,
  helmet,
}) => {
  const { lean = 0, twist = 0, armL = 0.25, armR = 0.25, armLf = 0, armRf = 0, legL = 0, legR = 0, head = 0, nod = 0 } = pose;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {shadow ? <BlobShadow r={0.62} /> : null}
      <group rotation={[0, twist, 0]}>
        <Limb at={[-0.17, 0.66, 0]} rz={0} rx={-legL} r={0.1} len={0.5} color={C.pants} foot />
        <Limb at={[0.17, 0.66, 0]} rz={0} rx={-legR} r={0.1} len={0.5} color={C.pants} foot />
        <group position={[0, 0.66, 0]} rotation={[-lean, 0, 0]}>
          <Ink geo={G.capsule(0.38, 0.45)} color={body} position={[0, 0.42, 0]} />
          <Limb at={[-0.36, 0.72, 0]} rz={-armL} rx={-armLf} r={0.08} len={0.5} color={body} hand />
          <Limb at={[0.36, 0.72, 0]} rz={armR} rx={-armRf} r={0.08} len={0.5} color={body} hand />
          <group position={[0, 1.38, 0]} rotation={[nod, 0, head]}>
            <Ink geo={G.sphere(0.56, 32)} color={skin} scale={[1, 1.06, 0.96]} />
            {helmet ? <Ink geo={G.sphere(0.6, 28)} color={helmet} position={[0, 0.12, -0.04]} scale={[1, 0.8, 1]} /> : null}
            <group position={[0, 0, 0.5]}>
              <Eye x={-0.19} kind={face} t={t} />
              <Eye x={0.19} kind={face} t={t} />
              <Mouth kind={face} t={t} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/** Walk cycle pose with phase in cycles. */
export const walkPose = (phase: number, amt = 1): Pose => {
  const s = Math.sin(phase * Math.PI * 2);
  return { legL: 0.45 * s * amt, legR: -0.45 * s * amt, armLf: -0.4 * s * amt, armRf: 0.4 * s * amt, armL: 0.18, armR: 0.18 };
};
