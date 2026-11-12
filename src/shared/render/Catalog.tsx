// Katalog objek: peragaan material, cahaya, fisika, bahan bergerak, latar, ikon, dan 3D (katalog → KatalogObjek). Bukan episode.
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, track } from '../anim/core';
import { Reveal } from '../anim/Reveal';
import { FONT_JAKARTA } from '../brand/fonts';
import { Backdrop } from '../look/Backdrop';
import { Icon } from '../look/Icon';
import { tokens } from '../look/tokens';
import { fall, follow, settle, squashStretch, swing } from '../physics/dynamics';
import { Joint, Liquid, Pour, Smoke } from '../physics/matter';
import { Model, Stage3D } from '../three';
import { ContactShadow } from './ContactShadow';
import { LightProvider } from './light';
import { Shaded, type Material } from './Shaded';
import { cupPath, ellipsePath, pouchPath, rectPath } from './shapes';
import registry from '../../../public/icons/icons.json';

const LIGHT = { tone: 'light' as const, palette: ['#F3EEE4', '#1D2B4F', '#E07A1F', '#3E8E7E'] };
const DARK = { tone: 'dark' as const, palette: ['#0B1530', '#F4F1EA', '#FFB000', '#5BC0EB'] };
const TL = tokens(LIGHT);
const TD = tokens(DARK);

const Title: React.FC<{ name: string; code: string; dark?: boolean }> = ({ name, code, dark }) => {
  const T = dark ? TD : TL;
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 70, fontFamily: FONT_JAKARTA }}>
      <Reveal at={0} kind="mask">
        <div style={{ fontSize: 46, fontWeight: 800, color: T.ink }}>{name}</div>
      </Reveal>
      <div style={{ marginTop: 8, fontFamily: 'Menlo, monospace', fontSize: 22, color: T.muted, lineHeight: 1.4 }}>{code}</div>
    </div>
  );
};
const Label: React.FC<{ x: number; y: number; text: string; dark?: boolean }> = ({ x, y, text, dark }) => (
  <div style={{ position: 'absolute', left: x - 150, top: y, width: 300, textAlign: 'center', fontFamily: FONT_JAKARTA, fontWeight: 800, fontSize: 30, color: (dark ? TD : TL).muted }}>{text}</div>
);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>{children}</svg>
);

const MATS: [Material, string][] = [['matte', '#E07A1F'], ['paper', '#F1E6CF'], ['fabric', '#3E6FB0'], ['plastic', '#2E9E6A'], ['metal', '#B8C0CC'], ['glass', '#8FD3F4']];

const Materials: React.FC = () => (
  <>
    <Backdrop style={LIGHT} />
    <Title name="Shaded · material" code={'<Shaded d={ellipsePath(x, y, r)} color="…" material="metal" />'} />
    {MATS.map(([m], i) => {
      const x = 240 + (i % 2) * 600, y = 470 + Math.floor(i / 2) * 400;
      return <ContactShadow key={m} x={x} y={y + 150} width={240} elevation={20} />;
    })}
    <Svg>
      {MATS.map(([m, c], i) => {
        const x = 240 + (i % 2) * 600, y = 470 + Math.floor(i / 2) * 400;
        return <Shaded key={m} d={i % 3 === 1 ? rectPath(x - 120, y - 120, 240, 240, 36) : ellipsePath(x, y, 125)} color={c} material={m} depth={26} />;
      })}
    </Svg>
    {MATS.map(([m], i) => <Label key={m} x={240 + (i % 2) * 600} y={470 + Math.floor(i / 2) * 400 + 175} text={m} />)}
  </>
);

const LightDir: React.FC = () => {
  const f = useCurrentFrame();
  const angle = track(f, [[0, 160], [80, 20, EASE.inOut]]);
  return (
    <LightProvider angle={angle}>
      <Backdrop style={DARK} lightAt={[540 + Math.cos((angle * Math.PI) / 180) * 500, 900 - Math.sin((angle * Math.PI) / 180) * 500]} />
      <Title dark name="LightProvider · angle" code={'<LightProvider angle={135}> semua objek membaca arah cahaya yang sama'} />
      <ContactShadow x={540} y={1180} width={420} />
      <Svg>
        <Shaded d={ellipsePath(540, 900, 230)} color="#FFB000" material="plastic" depth={40} />
      </Svg>
      <Label dark x={540} y={1260} text={`cahaya ${Math.round(angle)}°`} />
    </LightProvider>
  );
};

const Fall: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const balls: [number, number, string, number, Material][] = [[300, 10, '#E07A1F', 0.45, 'plastic'], [780, 22, '#3E6FB0', 0.85, 'matte']];
  return (
    <>
      <Backdrop style={LIGHT} pattern="grid" />
      <Title name="fall · squashStretch" code={'const b = fall(f, { at, from, to, fps, bounce }); const s = squashStretch(b, fps, soft)'} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: 1260, height: 4, background: TL.line }} />
      {balls.map(([x, at], i) => {
        const b = fall(f, { at, from: 380, to: 1260 - 100, fps, bounce: 0.45 });
        return <ContactShadow key={i} x={x} y={1262} width={200} elevation={1160 - b.y} />;
      })}
      <Svg>
        {balls.map(([x, at, c, soft, m], i) => {
          const b = fall(f, { at, from: 380, to: 1160, fps, bounce: 0.45 });
          const s = squashStretch(b, fps, soft);
          return (
            <g key={i} transform={`translate(${x} ${b.y + 100}) scale(${s.sx} ${s.sy}) translate(${-x} ${-(b.y + 100)})`} opacity={b.visible ? 1 : 0}>
              <Shaded d={ellipsePath(x, b.y, 100)} color={c} material={m} depth={30} />
            </g>
          );
        })}
      </Svg>
      <Label x={300} y={1300} text="keras (soft 0,45)" />
      <Label x={780} y={1300} text="lunak (soft 0,85)" />
    </>
  );
};

const Swing: React.FC = () => {
  const f = useCurrentFrame();
  const bodyX = (k: number) => track(k, [[5, 260], [45, 820, EASE.anticipate], [90, 400, EASE.inOut]]);
  const x = bodyX(f);
  const tag = swing(f, bodyX, { length: 160 });
  const ant = follow(f, (k) => bodyX(k), { stiffness: 0.12, damping: 0.75 });
  return (
    <>
      <Backdrop style={DARK} />
      <Title dark name="swing · follow" code={'swing(f, pivotX, { length }) · follow(f, target, { stiffness, damping })'} />
      <ContactShadow x={x} y={1080} width={300} />
      <Svg>
        {/* antena yang tertinggal (follow) */}
        <path d={`M${x} 800 Q ${x} 700, ${ant} 640`} stroke={TD.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
        <circle cx={ant} cy={640} r={18} fill="#FFB000" />
        <Shaded d={rectPath(x - 150, 800, 300, 260, 40)} color="#5BC0EB" material="plastic" depth={30} />
        {/* label menggantung (swing) */}
        <Joint x={x + 110} y={1060} rotate={-tag}>
          <line x1={0} y1={0} x2={0} y2={70} stroke={TD.ink} strokeWidth={5} />
          <Shaded d={rectPath(-55, 70, 110, 80, 14)} color="#FFB000" material="paper" depth={10} />
        </Joint>
      </Svg>
    </>
  );
};

const Balance: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = fall(f, { at: 15, from: 300, to: 805, fps, bounce: 0.2 }); // y = alas beban; piring kiri di y 805 saat datar
  const landed = drop.impacts[0];
  const angle = settle(f, { at: landed, from: 0, to: -14, fps, mass: 0.6 });
  const pan = (side: -1 | 1) => {
    const a = (angle * Math.PI) / 180;
    return [540 + side * 300 * Math.cos(a), 640 + side * 300 * Math.sin(a)];
  };
  const [lx, ly] = pan(-1);
  const [rx, ry] = pan(1);
  return (
    <>
      <Backdrop style={LIGHT} pattern="paper" />
      <Title name="Joint · settle" code={'<Joint x y rotate={settle(f, { at, from, to, fps, mass })}> rig bersendi'} />
      <ContactShadow x={540} y={1180} width={360} />
      <Svg>
        <Shaded d={rectPath(515, 640, 50, 520, 12)} color="#1D2B4F" material="metal" depth={10} />
        <Shaded d={rectPath(400, 1140, 280, 40, 14)} color="#1D2B4F" material="metal" depth={10} />
        <Joint x={540} y={640} rotate={angle}>
          <Shaded d={rectPath(-320, -10, 640, 20, 10)} color="#C8CED8" material="metal" depth={8} />
        </Joint>
        {[[lx, ly], [rx, ry]].map(([px, py], i) => (
          <g key={i}>
            <line x1={px} y1={py} x2={px - 90} y2={py + 160} stroke="#1D2B4F" strokeWidth={4} />
            <line x1={px} y1={py} x2={px + 90} y2={py + 160} stroke="#1D2B4F" strokeWidth={4} />
            <Shaded d={`M${px - 120},${py + 160} Q${px},${py + 230} ${px + 120},${py + 160} Z`} color="#C8CED8" material="metal" depth={10} />
          </g>
        ))}
        <circle cx={540} cy={640} r={16} fill="#E07A1F" />
        {/* beban jatuh ke piring kiri, lalu ikut piring */}
        <g opacity={drop.visible ? 1 : 0}>
          <Shaded d={rectPath(lx - 60, (f >= landed ? ly + 165 : drop.y) - 70, 120, 70, 14)} color="#E07A1F" material="plastic" depth={14} />
        </g>
      </Svg>
    </>
  );
};

const PourDemo: React.FC = () => {
  const f = useCurrentFrame();
  const tilt = track(f, [[0, 0], [20, -118, EASE.inOut], [120, -118], [140, 0, EASE.inOut]]);
  return (
    <>
      <Backdrop style={DARK} />
      <Title dark name="Pour" code={'<Pour at={q.tuang} from={[x, y]} ground={1250} pileX={540} color="…" />'} />
      <ContactShadow x={540} y={1252} width={420} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 1250, height: 6, borderRadius: 3, background: TD.line }} />
      <Pour at={24} from={[512, 560]} ground={1250} pileX={540} color="#F3EFE6" count={180} rate={90} pileWidth={380} pileHeight={130} />
      <Svg>
        <Joint x={420} y={480} rotate={tilt}>
          <Shaded d={pouchPath(-90, -150, 180, 300, 10, 8)} color="#2E7D4F" material="plastic" depth={16} />
        </Joint>
      </Svg>
    </>
  );
};

const LiquidDemo: React.FC = () => (
  <>
    <Backdrop style={LIGHT} />
    <Title name="Liquid · Smoke" code={'<Liquid box={[x,y,w,h]} clip={cupPath(…)} fill={{ at, from, to, dur }} disturbAt={[q.aduk]} />'} />
    <ContactShadow x={540} y={1240} width={400} />
    <Smoke x={540} y={760} at={40} color="#ffffff" opacity={0.55} />
    <Liquid box={[370, 780, 340, 460]} clip={cupPath(540, 780, 340, 460)} fill={{ at: 5, from: 0.05, to: 0.78, dur: 45 }} disturbAt={[75]} color="#7A4A22" />
    <Svg>
      <Shaded d={cupPath(540, 780, 340, 460)} color="#D7EEF7" material="glass" depth={20} />
    </Svg>
  </>
);

const Backdrops: React.FC = () => {
  const f = useCurrentFrame();
  const which = Math.floor(f / 30) % 4;
  const opts: [typeof LIGHT | typeof DARK, 'paper' | 'dots' | 'grid' | 'lines', string][] = [[LIGHT, 'paper', 'paper'], [DARK, 'dots', 'dots'], [LIGHT, 'grid', 'grid'], [DARK, 'lines', 'lines']];
  const [st, pat, name] = opts[which];
  return (
    <>
      <Backdrop style={st} pattern={pat} />
      <Title dark={st.tone === 'dark'} name={`Backdrop · ${name}`} code={'<Backdrop style={style} pattern="dots|grid|lines|paper" />'} />
    </>
  );
};

const Icons: React.FC = () => {
  const names = Object.keys(registry);
  return (
    <>
      <Backdrop style={DARK} pattern="dots" />
      <Title dark name="Icon" code={'<Icon name="lucide:flask-conical" size={140} draw={{ at: q.kata }} />  ·  npm run icon:add -- <set:nama>'} />
      {names.map((n, i) => (
        <div key={n} style={{ position: 'absolute', left: 90 + (i % 3) * 320, top: 330 + Math.floor(i / 3) * 280, width: 260, textAlign: 'center' }}>
          <Icon name={n} size={140} color={i % 2 ? TD.accent : TD.ink} draw={{ at: 6 + i * 4 }} />
          <div style={{ fontFamily: 'Menlo, monospace', fontSize: 20, color: TD.muted, marginTop: 10 }}>{n}</div>
        </div>
      ))}
    </>
  );
};

const ThreeDemo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = fall(f, { at: 10, from: 0, to: 2.6, fps, g: 9.8, bounce: 0.4 }); // satuan dunia 3D (meter)
  const height = 2.6 - b.y;
  return (
    <>
      <Backdrop style={LIGHT} pattern="paper" />
      <Title name="Stage3D · Model (opsional)" code={'<Stage3D lightAngle={135}><Model id="food_apple_01" size={0.9} /></Stage3D>  ·  npm run model:add -- <id>'} />
      <Stage3D lightAngle={135} camera={{ position: [0, 1.4, 7], target: [0, 0.8, 0], fov: 30 }}>
        <Model id="food_apple_01" size={0.9} position={[0, height, 0]} rotation={[0, f * 0.04, 0]} />
      </Stage3D>
    </>
  );
};

const S: [string, React.FC, number][] = [
  ['Material', Materials, 90],
  ['Cahaya', LightDir, 100],
  ['Jatuh', Fall, 110],
  ['Ayunan', Swing, 120],
  ['Timbangan', Balance, 110],
  ['Tuang', PourDemo, 160],
  ['Cairan', LiquidDemo, 120],
  ['Latar', Backdrops, 120],
  ['Ikon', Icons, 90],
  ['3D', ThreeDemo, 90],
];

export const KATALOG_OBJEK_FRAMES = S.reduce((a, [, , n]) => a + n, 0);

export const KatalogObjek: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      {S.map(([name, C, n]) => {
        const el = (
          <Sequence key={name} name={name} from={from} durationInFrames={n}>
            <AbsoluteFill>
              <C />
            </AbsoluteFill>
          </Sequence>
        );
        from += n;
        return el;
      })}
    </AbsoluteFill>
  );
};
