// 2D "Pop Sticker Comic" toolkit for The Matrix Effect — our own look (deliberately NOT the reference video's):
// saturated flat backgrounds that change per shot, thick ink outlines, hard offset sticker shadows,
// comic halftone-dot shading, faint sunburst rays, chibi characters with big heads, chunky comic lettering.
// Everything is SVG in a 1080x1920 viewBox.
import { FONT_JAKARTA } from '../../../shared/brand/fonts';
import React from 'react';
import { AbsoluteFill } from 'remotion';

export const INK = '#16131F';
export const P = {
  // keys kept stable for the shot code; values are the pop palette
  paper: '#FFF8EC', // off-white (screens, windows, highlights)
  navy: INK, // lines + dark objects
  navyDeep: INK,
  blue: '#2EC4B6', // teal
  blueLight: '#A9EFE6',
  coral: '#FF5A4E', // tomato
  coralDeep: '#D93A30',
  pink: '#FF9EC7',
  pinkLight: '#FFD3E6',
  skin: '#FFCBA4',
  white: '#FFFFFF',
  ice: '#BDF4FF',
  gold: '#FFD23F',
  purple: '#7B5CFF',
  // shot backgrounds
  bgSky: '#4CC9F0',
  bgSun: '#FFD23F',
  bgMint: '#7DE2B0',
  bgGrape: '#9B87FF',
  bgBubble: '#FF9EC7',
  bgAlarm: '#FF6B5E',
};
export const FONT2D = `${FONT_JAKARTA}, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
const STROKE = 6;
const SHADOW = 10;

/** Shared SVG defs: halftone dots + the bottom-up fade mask used for comic shading. */
export const Defs: React.FC = () => (
  <defs>
    <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="7" cy="7" r="3.2" fill={INK} />
    </pattern>
    <pattern id="dotsLight" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="11" cy="11" r="3.4" fill="#FFFFFF" />
    </pattern>
    <linearGradient id="gFade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
      <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    <mask id="fadeUp" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="url(#gFade)" />
    </mask>
    <linearGradient id="gBeam" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.2" />
    </linearGradient>
  </defs>
);

/** Faint comic sunburst behind everything. */
const Sunburst: React.FC<{ spin: number }> = ({ spin }) => (
  <g transform={`translate(540 900) rotate(${spin})`} opacity={0.13}>
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} d="M 0 0 L 2200 -260 L 2200 260 Z" fill="#FFFFFF" transform={`rotate(${i * 22.5})`} />
    ))}
  </g>
);

/** Full-frame scene wrapper: flat pop background + sunburst, SVG stage, corner halftone. */
export const Paper2D: React.FC<{ children: React.ReactNode; bg?: string; tint?: { color: string; amount: number }; spin?: number }> = ({ children, bg = P.bgSky, tint, spin = 0 }) => (
  <AbsoluteFill style={{ background: bg }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Defs />
      <Sunburst spin={spin} />
      {children}
      <rect x={0} y={1500} width={1080} height={420} fill="url(#dotsLight)" opacity={0.25} />
    </svg>
    {tint && tint.amount > 0 ? <AbsoluteFill style={{ background: tint.color, opacity: tint.amount, mixBlendMode: 'multiply' }} /> : null}
  </AbsoluteFill>
);

/** 2D camera: (x, y) world point lands on the frame centre, scaled by z, rotated by rot (deg). */
export const Cam: React.FC<{ x: number; y: number; z?: number; rot?: number; children: React.ReactNode }> = ({ x, y, z = 1, rot = 0, children }) => (
  <g transform={`translate(540 960) rotate(${rot}) scale(${z}) translate(${-x} ${-y})`}>{children}</g>
);

/** Sticker shape: hard ink drop shadow, flat fill, halftone shading at the bottom, thick ink outline.
 *  (`grain` is accepted for API compatibility and ignored.) */
export const Grainy: React.FC<{ d?: string; rect?: { x: number; y: number; w: number; h: number; r?: number }; fill: string; grain?: string; opacity?: number; shadow?: boolean }> = ({ d, rect, fill, opacity = 1, shadow = true }) => {
  const shape = (props: React.SVGProps<SVGPathElement & SVGRectElement>) =>
    rect ? <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={rect.r ?? 0} {...props} /> : <path d={d} {...props} />;
  return (
    <g opacity={opacity}>
      {shadow ? <g transform={`translate(${SHADOW} ${SHADOW})`}>{shape({ fill: INK })}</g> : null}
      {shape({ fill })}
      {shape({ fill: 'url(#dots)', mask: 'url(#fadeUp)' })}
      {shape({ fill: 'none', stroke: INK, strokeWidth: STROKE, strokeLinejoin: 'round' })}
    </g>
  );
};

/** Chunky comic lettering with ink outline + hard shadow; optional squash for slams. */
export const FactText: React.FC<{ text: string; x: number; y: number; size: number; color?: string; squash?: number; rot?: number; anchor?: 'middle' | 'start' | 'end'; outline?: string }> = ({
  text,
  x,
  y,
  size,
  color = P.gold,
  squash = 1,
  rot = -4,
  anchor = 'middle',
}) => {
  const common = { x: 0, textAnchor: anchor, fontFamily: FONT2D, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.02, fontStyle: 'italic' as const };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <text {...common} y={size * 0.07} dx={size * 0.06} fill={INK} stroke={INK} strokeWidth={size * 0.09} strokeLinejoin="round">
        {text}
      </text>
      <text {...common} y={0} fill={color} stroke={INK} strokeWidth={size * 0.07} strokeLinejoin="round" paintOrder="stroke fill">
        {text}
      </text>
      <text {...common} y={0} fill="url(#dots)" opacity={0.25}>
        {text}
      </text>
    </g>
  );
};

/** Impact puff: white comic clouds with ink outline, thrown sideways and shrinking out. */
export const Puff: React.FC<{ f: number; at: number; x: number; y: number; spread?: number; color?: string }> = ({ f, at, x, y, spread = 160, color = '#FFFFFF' }) => {
  const d = f - at;
  if (d < 0 || d > 22) return null;
  const u = d / 22;
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        const k = 0.4 + (0.6 * ((i * 37) % 10)) / 10;
        const px = x + side * spread * k * (1 - (1 - u) ** 3);
        const py = y - 60 * k * Math.sin(u * Math.PI);
        return <circle key={i} cx={px} cy={py} r={(14 + 18 * k) * (1 - u)} fill={color} stroke={INK} strokeWidth={5} />;
      })}
    </g>
  );
};

/** Comic burst star + speed ticks at an impact. */
export const ImpactLines: React.FC<{ f: number; at: number; x: number; y: number; r?: number; color?: string }> = ({ f, at, x, y, r = 120 }) => {
  const d = f - at;
  if (d < 0 || d > 12) return null;
  const u = d / 12;
  const star = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const rr = (i % 2 ? r * 0.55 : r) * (0.7 + 0.5 * u);
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
  }).join(' ');
  return (
    <g opacity={1 - u * 0.9}>
      <polygon points={star} fill={P.gold} stroke={INK} strokeWidth={6} strokeLinejoin="round" opacity={0.85} />
      <g stroke={INK} strokeWidth={9} strokeLinecap="round">
        {[-160, -125, -55, -20].map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const r0 = r * (1.1 + u * 0.5);
          return <line key={i} x1={x + Math.cos(rad) * r0} y1={y + Math.sin(rad) * r0} x2={x + Math.cos(rad) * (r0 + 60)} y2={y + Math.sin(rad) * (r0 + 60)} />;
        })}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- chibi character (side 3/4 view)
export type Face2D = 'whistle' | 'blink' | 'bug' | 'grimace' | 'panic' | 'squint' | 'blank' | 'suspicious' | 'smile' | 'dizzy' | 'glance' | 'battle' | 'frown';
export type Pose2D = {
  lean?: number; // deg, + leans back
  legF?: number; // deg from vertical, + forward
  legB?: number;
  armF?: number; // deg from hanging, + forward/up
  armB?: number;
  head?: number; // deg tilt, + back
};

/** Face marks in head-local coords (head radius 92, facing +x). Two eyes: the near one big, the far one smaller. */
const FaceMarks: React.FC<{ face: Face2D; t: number }> = ({ face, t }) => {
  const E1 = { x: 52, y: 4 }; // near eye
  const E2 = { x: 8, y: 2 }; // far eye
  const eye = (e: { x: number; y: number }, r: number) => (
    <g>
      <ellipse cx={e.x} cy={e.y} rx={r} ry={r * 1.25} fill={INK} />
      <circle cx={e.x + r * 0.35} cy={e.y - r * 0.45} r={r * 0.38} fill="#fff" />
    </g>
  );
  const big = (e: { x: number; y: number }, r: number, pdx = 4, pdy = 0) => (
    <g>
      <circle cx={e.x} cy={e.y - 4} r={r} fill="#fff" stroke={INK} strokeWidth={5} />
      <circle cx={e.x + pdx} cy={e.y - 4 + pdy} r={r * 0.42} fill={INK} />
    </g>
  );
  const cheek = <ellipse cx={46} cy={36} rx={16} ry={10} fill={P.pink} opacity={0.9} />;
  const line = (x1: number, y1: number, x2: number, y2: number, w = 6) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={w} strokeLinecap="round" />;
  switch (face) {
    case 'whistle':
      return (
        <g>
          {eye(E2, 8)}
          {eye(E1, 11)}
          {cheek}
          <circle cx={72} cy={44} r={8} fill={P.coralDeep} stroke={INK} strokeWidth={5} />
          <g transform={`translate(${118 + Math.sin(t * 0.2) * 5} ${-60 - (t % 30) * 1.2})`}>
            <path d="M0 0 v -30 l 18 -6 v 26" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
            <circle cx={-4} cy={2} r={7} fill={INK} />
            <circle cx={14} cy={-8} r={7} fill={INK} />
          </g>
        </g>
      );
    case 'blink':
      return (
        <g>
          <path d="M 40 6 Q 52 16 64 6" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 0 4 Q 8 11 16 4" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          {cheek}
          {line(52, 50, 74, 48)}
        </g>
      );
    case 'squint':
      return (
        <g>
          <path d="M 40 -4 L 62 4 L 40 12" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 0 -2 L 16 4 L 0 10" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {line(50, 54, 76, 48)}
        </g>
      );
    case 'bug':
    case 'glance':
      return (
        <g>
          {big(E2, 15, face === 'glance' ? 2 : 4, face === 'glance' ? 8 : 0)}
          {big(E1, 22, face === 'glance' ? 3 : 7, face === 'glance' ? 11 : 0)}
          <ellipse cx={64} cy={54} rx={12} ry={16} fill={P.coralDeep} stroke={INK} strokeWidth={5} />
        </g>
      );
    case 'panic':
    case 'battle': {
      const w = 1 + 0.18 * Math.sin(t * 1.7);
      const j = Math.sin(t * 2.3) * 3;
      return (
        <g>
          {big(E2, 15, 4 + j, 0)}
          {big(E1, 22, 6 + j, 0)}
          {face === 'battle' ? (
            <>
              {line(26, -34, 72, -20, 8)}
              {line(-10, -26, 18, -30, 7)}
            </>
          ) : null}
          <ellipse cx={62} cy={58} rx={18 * w} ry={20} fill={P.coralDeep} stroke={INK} strokeWidth={5} />
          {face === 'panic' ? <path d="M -60 -40 q 8 16 0 30 q -8 -14 0 -30 Z" fill={P.ice} stroke={INK} strokeWidth={4} /> : null}
        </g>
      );
    }
    case 'grimace':
      return (
        <g>
          {eye(E2, 7)}
          {eye(E1, 9)}
          <rect x={34} y={38} width={48} height={22} rx={6} fill="#fff" stroke={INK} strokeWidth={5} />
          {line(36, 49, 80, 49, 3.5)}
          {line(58, 40, 58, 58, 3.5)}
        </g>
      );
    case 'blank':
      return (
        <g>
          <circle cx={E2.x} cy={E2.y} r={6} fill={INK} />
          <circle cx={E1.x} cy={E1.y} r={8} fill={INK} />
          {line(46, 50, 76, 50)}
        </g>
      );
    case 'suspicious':
      return (
        <g>
          {eye(E2, 7)}
          <path d="M 38 4 Q 52 -4 66 4 Q 52 12 38 4 Z" fill={INK} />
          {line(30, -26, 70, -42, 7)}
          {line(-6, -18, 18, -20, 6)}
          {line(48, 52, 76, 44)}
        </g>
      );
    case 'frown':
      return (
        <g>
          {eye(E2, 7)}
          {eye(E1, 10)}
          {line(30, -30, 68, -16, 8)}
          <path d="M 44 58 Q 60 42 78 56" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'dizzy':
      return (
        <g>
          {[E2, E1].map((e, i) => (
            <g key={i} transform={`translate(${e.x} ${e.y}) rotate(${t * 14 * (i ? 1 : -1)}) scale(${i ? 1.2 : 0.85})`}>
              <path d="M 0 0 m -2 0 a 2 2 0 1 1 4 0 a 6 6 0 1 1 -11 0 a 11 11 0 1 1 21 0 a 16 16 0 1 1 -31 0" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            </g>
          ))}
          {cheek}
          <path d="M 40 54 Q 50 44 60 54 Q 70 64 80 52" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'smile':
    default:
      return (
        <g>
          {eye(E2, 8)}
          {eye(E1, 11)}
          {cheek}
          <path d="M 40 42 Q 60 70 84 40 Z" fill={P.coralDeep} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
      );
  }
};

/** Chibi character (faces right; `flip` faces left). Feet at (x, y). ~560 px tall at scale 1.
 *  `cap` = hair/helmet colour, `body` = hoodie colour. */
export const Person: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  face: Face2D;
  pose?: Pose2D;
  t?: number;
  body?: string;
  bodyGrain?: string;
  cap?: string;
  skin?: string;
  legs?: string;
  sitting?: boolean;
  hold?: React.ReactNode;
}> = ({ x, y, s = 1, flip, face, pose = {}, t = 0, body = P.coral, cap = INK, skin = P.skin, legs = P.purple, sitting, hold }) => {
  const { lean = 0, legF = 0, legB = 0, armF = 0, armB = 0, head = 0 } = pose;
  const hipY = sitting ? -120 : -170;
  const legLen = 160;
  const limb = (x1: number, y1: number, x2: number, y2: number, color: string, w: number) => (
    <g strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={w + STROKE * 2} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} />
    </g>
  );
  const shoe = (cx: number, cy: number, rot: number) => <ellipse cx={cx} cy={cy} rx={32} ry={16} fill={P.paper} stroke={INK} strokeWidth={STROKE} transform={`rotate(${rot} ${cx} ${cy})`} />;
  const leg = (a: number, dx: number) => {
    const r = (a * Math.PI) / 180;
    const ex = dx + Math.sin(r) * legLen;
    const ey = hipY + Math.cos(r) * legLen;
    return (
      <g>
        {limb(dx, hipY, ex, ey, legs, 30)}
        {shoe(ex + 14, ey + 6, -a * 0.6)}
      </g>
    );
  };
  const sitLeg = (dx: number) => (
    <g>
      <path d={`M ${dx} ${hipY} L ${dx + 110} ${hipY} L ${dx + 110} -6`} stroke={INK} strokeWidth={30 + STROKE * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${dx} ${hipY} L ${dx + 110} ${hipY} L ${dx + 110} -6`} stroke={legs} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {shoe(dx + 128, -10, 0)}
    </g>
  );
  const shoulderY = hipY - 150;
  const arm = (a: number, color: string, withHold: boolean) => (
    <g transform={`rotate(${-a} 8 ${shoulderY})`}>
      {limb(8, shoulderY, 8, shoulderY + 125, color, 24)}
      <circle cx={8} cy={shoulderY + 136} r={17} fill={skin} stroke={INK} strokeWidth={STROKE} />
      {withHold && hold ? <g transform={`translate(8 ${shoulderY + 136}) rotate(${a})`}>{hold}</g> : null}
    </g>
  );
  const headY = hipY - 190 - 80;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={20} cy={4} rx={110} ry={16} fill={INK} opacity={0.18} />
      {sitting ? (
        <>
          {sitLeg(-10)}
          {sitLeg(12)}
        </>
      ) : (
        <>
          {leg(legB, -8)}
          {leg(legF, 8)}
        </>
      )}
      <g transform={`rotate(${-lean} 0 ${hipY})`}>
        {arm(armB, body, false)}
        <Grainy rect={{ x: -66, y: hipY - 195, w: 132, h: 215, r: 54 }} fill={body} shadow={false} />
        <path d={`M -30 ${hipY - 120} Q 0 ${hipY - 96} 30 ${hipY - 120}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${-head} 0 ${hipY - 190})`}>
          <g transform={`translate(6 ${headY})`}>
            <circle r={92} fill={skin} stroke={INK} strokeWidth={STROKE} />
            {/* hair / helmet: a swoosh over the back of the head + a tuft on top */}
            <path d="M -92 6 A 92 92 0 0 1 70 -60 Q 30 -40 10 -56 Q -20 -30 -40 -44 Q -60 -10 -92 6 Z" fill={cap} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
            <path d="M -6 -88 q 10 -40 36 -34 q -22 8 -18 36 Z" fill={cap} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <ellipse cx={-56} cy={14} rx={14} ry={20} fill={skin} stroke={INK} strokeWidth={5} />
            <FaceMarks face={face} t={t} />
          </g>
        </g>
        {arm(armF, body, true)}
      </g>
    </g>
  );
};

export const walk2D = (phase: number, amt = 1): Pose2D => {
  const s = Math.sin(phase * Math.PI * 2);
  return { legF: 26 * s * amt, legB: -26 * s * amt, armF: -24 * s * amt, armB: 24 * s * amt };
};

/** Coffee mug sticker. */
export const Mug2D: React.FC<{ x?: number; y?: number; rot?: number; s?: number }> = ({ x = 0, y = 0, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle cx={32} cy={2} r={16} fill="none" stroke={INK} strokeWidth={15} />
    <circle cx={32} cy={2} r={16} fill="none" stroke={P.paper} strokeWidth={6} />
    <Grainy rect={{ x: -30, y: -32, w: 60, h: 68, r: 12 }} fill={P.paper} shadow={false} />
    <ellipse cx={0} cy={-26} rx={24} ry={7} fill="#6B3E26" stroke={INK} strokeWidth={4} />
    <path d="M -10 -2 l 8 8 l 12 -16" stroke={P.coral} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
