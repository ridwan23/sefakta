// Gaya stickman: tokoh garis dengan sendi (bahu, siku, pinggul, lutut), pose bernama yang dapat dianimasikan antar-
// keyframe, siklus jalan/lari, dan masuk "tergambar" garis demi garis. Kaki selalu menapak di `y` (tanah).
//
//   <Stickman x={540} y={1400} size={520} poses={[[0, 'berdiri'], [q.kaget, 'kaget'], [q.tunjuk, 'tunjuk']]} at={q.masuk} />
//   <Stickman x={300} y={1400} size={420} cycle="jalan" travel={[300, 800]} />
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, prog } from '../anim/core';
import { clamp01, lerp } from '../motion';

/** Sudut dalam derajat. 0 = menggantung lurus ke bawah; positif = ke depan (arah hadap).
 *  Lengan/kaki bawah relatif terhadap bagian atasnya. */
export type Pose = {
  lean: number;
  head: number;
  armL: number; elbowL: number;
  armR: number; elbowR: number;
  legL: number; kneeL: number;
  legR: number; kneeR: number;
};

const P = (lean: number, head: number, armL: number, elbowL: number, armR: number, elbowR: number, legL: number, kneeL: number, legR: number, kneeR: number): Pose => ({
  lean, head, armL, elbowL, armR, elbowR, legL, kneeL, legR, kneeR,
});

export const POSES = {
  berdiri: P(0, 0, -12, 6, 12, 6, -6, 0, 6, 0),
  tunjuk: P(4, 6, -14, 10, 80, 4, -6, 0, 8, 0),
  kaget: P(-8, -10, -130, -30, 130, 30, -16, 0, 16, 0),
  sorak: P(0, -12, -160, -10, 160, 10, -8, 0, 8, 0),
  bingung: P(-2, 14, -14, 8, 150, 120, -4, 0, 6, 0),
  lelah: P(28, 30, 10, 0, 18, 0, -4, -6, 10, -8),
  mikir: P(2, 8, -10, 6, 40, 135, -4, 0, 6, 0),
  angkat: P(-4, -6, 150, 40, 150, 40, -14, 4, 14, 4),
  dorong: P(30, -10, 82, -10, 86, -12, -36, 30, 30, 10),
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;
type PoseIn = PoseName | Pose;

const resolve = (p: PoseIn): Pose => (typeof p === 'string' ? POSES[p] : p);

export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    o[k] = lerp(a[k], b[k], t);
  });
  return o;
};

/** Pose siklus jalan/lari pada fase 0..1. */
export const cyclePose = (kind: 'jalan' | 'lari', phase: number): Pose => {
  const s = Math.sin(phase * Math.PI * 2);
  const c = Math.cos(phase * Math.PI * 2);
  if (kind === 'lari') {
    return P(14, -4, -s * 60, 80, s * 60, 80, s * 50, 18 + Math.max(0, -c) * 75, -s * 50, 18 + Math.max(0, c) * 75);
  }
  return P(3, 0, -s * 28, 12, s * 28, 12, s * 26, Math.max(0, -c) * 40, -s * 26, Math.max(0, c) * 40);
};

export type StickmanProps = {
  x: number;
  /** tanah (titik kaki) */
  y: number;
  /** tinggi tokoh berdiri (px) */
  size?: number;
  pose?: PoseIn;
  /** keyframe pose [frame, pose]; transisi `blend` frame */
  poses?: [number, PoseIn][];
  blend?: number;
  /** siklus gerak; menimpa pose */
  cycle?: 'jalan' | 'lari';
  /** langkah per detik untuk siklus */
  cadence?: number;
  /** berpindah dari x[0] ke x[1] selama siklus berjalan (frame `travelAt`..+`travelDur`) */
  travel?: [number, number];
  travelAt?: number;
  travelDur?: number;
  facing?: 1 | -1;
  color?: string;
  /** isi kepala (default = sama dengan garis) */
  headFill?: string;
  /** masuk tergambar: kepala → badan → lengan → kaki */
  at?: number;
  width?: number;
};

/** Tokoh stickman bersendi. Tebal garis default ±4,5% tinggi. */
export const Stickman: React.FC<StickmanProps> = ({
  x, y, size = 480, pose = 'berdiri', poses, blend = 8, cycle, cadence = 1.8, travel, travelAt = 0, travelDur, facing = 1, color = '#1A1A1A', headFill, at, width,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (at !== undefined && frame < at) return null;

  let ps: Pose = resolve(pose);
  if (poses?.length) {
    ps = resolve(poses[0][1]);
    for (let i = 1; i < poses.length; i++) {
      const [f, p] = poses[i];
      if (frame >= f) ps = mixPose(ps, resolve(p), prog(frame, f, blend, EASE.inOut));
    }
  }
  if (cycle) ps = cyclePose(cycle, (frame / fps) * (cadence / 2));

  let cx = x;
  if (travel) {
    const dur = travelDur ?? durationInFrames - travelAt;
    cx = lerp(travel[0], travel[1], clamp01((frame - travelAt) / dur));
  }

  const u = size;
  const L = { head: u * 0.085, neck: u * 0.03, torso: u * 0.3, upper: u * 0.2, fore: u * 0.19, thigh: u * 0.21, shin: u * 0.21 };
  const sw = width ?? u * 0.045;
  const rad = (d: number) => (d * Math.PI) / 180;
  // vektor arah: sudut 0 = ke bawah, positif = ke depan
  const dir = (deg: number): [number, number] => [Math.sin(rad(deg)) * facing, Math.cos(rad(deg))];
  const leg = (a: number, k: number) => {
    const d1 = dir(a);
    const d2 = dir(a - k);
    return { knee: [d1[0] * L.thigh, d1[1] * L.thigh], foot: [d1[0] * L.thigh + d2[0] * L.shin, d1[1] * L.thigh + d2[1] * L.shin] };
  };
  const lL = leg(ps.legL, ps.kneeL);
  const lR = leg(ps.legR, ps.kneeR);
  const hipY = y - Math.max(lL.foot[1], lR.foot[1]);
  const hip: [number, number] = [cx, hipY];
  const up = dir(180 + ps.lean);
  const neck: [number, number] = [hip[0] + up[0] * L.torso, hip[1] + up[1] * L.torso];
  // bahu sedikit di bawah leher, supaya lengan yang terangkat tidak tertutup kepala
  const sh: [number, number] = [hip[0] + up[0] * L.torso * 0.84, hip[1] + up[1] * L.torso * 0.84];
  const hd = dir(180 + ps.lean + ps.head);
  const head: [number, number] = [neck[0] + hd[0] * (L.neck + L.head), neck[1] + hd[1] * (L.neck + L.head)];
  const arm = (a: number, e: number) => {
    const d1 = dir(a + ps.lean);
    const d2 = dir(a + ps.lean + e);
    const el: [number, number] = [sh[0] + d1[0] * L.upper, sh[1] + d1[1] * L.upper];
    return { el, hand: [el[0] + d2[0] * L.fore, el[1] + d2[1] * L.fore] as [number, number] };
  };
  const aL = arm(ps.armL, ps.elbowL);
  const aR = arm(ps.armR, ps.elbowR);
  const f2 = (v: number) => v.toFixed(1);
  const pl = (...pts: [number, number][]) => `M${pts.map((p) => `${f2(p[0])} ${f2(p[1])}`).join('L')}`;
  const legPath = (l: typeof lL) => pl(hip, [hip[0] + l.knee[0], hip[1] + l.knee[1]], [hip[0] + l.foot[0], hip[1] + l.foot[1]]);

  const draw = (i: number) => (at === undefined ? 1 : prog(frame, at + i * 4, 10, EASE.out));
  const dash = (p: number) => ({ pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - p });
  const pHead = draw(0);

  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <g fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {/* lengan belakang & kaki belakang sedikit lebih gelap/tipis memberi kedalaman */}
        <path d={pl(sh, aL.el, aL.hand)} {...dash(draw(2))} opacity={0.85} />
        <path d={legPath(lL)} {...dash(draw(3))} opacity={0.85} />
        <path d={pl(hip, neck)} {...dash(draw(1))} />
        <path d={legPath(lR)} {...dash(draw(3))} />
        <path d={pl(sh, aR.el, aR.hand)} {...dash(draw(2))} />
      </g>
      <circle
        cx={head[0]}
        cy={head[1]}
        r={L.head * (0.6 + 0.4 * pHead)}
        fill={headFill ?? color}
        stroke={color}
        strokeWidth={sw}
        opacity={clamp01(pHead * 3)}
      />
    </svg>
  );
};
