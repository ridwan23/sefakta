// Katalog gerak: peragaan setiap komponen src/shared/anim/ di Studio (folder "katalog").
// Bukan episode. Dipakai agent dan manusia sebagai acuan rasa gerak sebelum menulis scene.
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { FONT_JAKARTA } from '../brand/fonts';
import { Burst, CountUp, DrawPath, Highlight, Idle, Particles, Pulse, Shake, Swap } from './accents';
import { EASE, track } from './core';
import { Reveal, SplitText, Stagger, type ExitKind, type RevealKind } from './Reveal';

const BG = '#0E1630';
const INK = '#F4F1EA';
const ACC = '#FFB000';
const MUTED = '#8A93B5';

const Title: React.FC<{ name: string; code: string }> = ({ name, code }) => (
  <div style={{ position: 'absolute', left: 70, right: 70, top: 200 }}>
    <Reveal at={0} kind="mask">
      <div style={{ fontSize: 64, fontWeight: 800, color: INK }}>{name}</div>
    </Reveal>
    <Reveal at={4} kind="fade">
      <div style={{ marginTop: 14, fontFamily: 'Menlo, monospace', fontSize: 26, color: MUTED, lineHeight: 1.4 }}>{code}</div>
    </Reveal>
  </div>
);

const Tile: React.FC<{ label: string; color?: string }> = ({ label, color = ACC }) => (
  <div style={{ width: 290, height: 170, borderRadius: 24, background: color, color: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800 }}>{label}</div>
);

const KINDS: RevealKind[] = ['fade', 'rise', 'drop', 'pop', 'zoom', 'stamp', 'flip', 'mask', 'slide-left', 'slide-right', 'wipe-right', 'wipe-left', 'wipe-up', 'wipe-down'];
const EXITS: ExitKind[] = ['fade', 'shrink', 'sink', 'blur', 'pop', 'wipe', 'mask'];

const grid = (i: number, cols = 3): React.CSSProperties => ({ position: 'absolute', left: 70 + (i % cols) * 320, top: 480 + Math.floor(i / cols) * 200 });

const RevealDemo: React.FC = () => (
  <>
    <Title name="Reveal · kind" code={'<Reveal at={q.kata} kind="pop">…</Reveal>'} />
    {KINDS.map((k, i) => (
      <Reveal key={k} at={12 + i * 6} kind={k} style={grid(i)}>
        <Tile label={k} />
      </Reveal>
    ))}
  </>
);

const ExitDemo: React.FC = () => (
  <>
    <Title name="Reveal · exit" code={'<Reveal at={a} exitAt={q.lanjut} exit="sink">'} />
    {EXITS.map((k, i) => (
      <Reveal key={k} at={0} kind="fade" dur={6} exitAt={30 + i * 7} exit={k} style={grid(i)}>
        <Tile label={k} color={INK} />
      </Reveal>
    ))}
  </>
);

const TextDemo: React.FC = () => (
  <>
    <Title name="SplitText · Stagger" code={'<SplitText text="…" at={q.isi} accentWords={["99%"]} />'} />
    <div style={{ position: 'absolute', left: 70, right: 70, top: 520, fontSize: 92, fontWeight: 800, color: INK, lineHeight: 1.1 }}>
      <SplitText text="Isinya 99% bukan stevia" at={10} accentWords={['99%']} accentStyle={{ color: ACC }} />
    </div>
    <div style={{ position: 'absolute', left: 70, right: 70, top: 820, fontSize: 60, fontWeight: 700, color: MUTED }}>
      <SplitText text="huruf per huruf" by="char" kind="rise" dist={30} at={30} />
    </div>
    <Stagger at={50} gap={4} kind="pop" style={{ position: 'absolute', left: 70, top: 1000, display: 'flex', gap: 24 }}>
      {['gula', 'pemanis', 'pengisi'].map((t) => (
        <div key={t} style={{ padding: '22px 34px', borderRadius: 999, background: ACC, color: BG, fontSize: 40, fontWeight: 800 }}>{t}</div>
      ))}
    </Stagger>
  </>
);

const Ball: React.FC<{ x: number; y: number; label: string; color: string }> = ({ x, y, label, color }) => (
  <>
    <div style={{ position: 'absolute', left: 70, top: y - 70, fontSize: 30, color: MUTED, fontFamily: 'Menlo, monospace' }}>{label}</div>
    <div style={{ position: 'absolute', left: x - 45, top: y - 45 + 20, width: 90, height: 90, borderRadius: '50%', background: color }} />
  </>
);

const EaseDemo: React.FC = () => {
  const f = useCurrentFrame();
  const at = 15;
  const go = (ease: (t: number) => number) => track(f, [[at, 160], [at + 36, 920, ease]]);
  return (
    <>
      <Title name="track · EASE" code={'track(f, [[a, 160], [b, 920, EASE.anticipate]])'} />
      <Ball x={go(EASE.linear)} y={560} label="EASE.linear (hindari)" color={MUTED} />
      <Ball x={go(EASE.inOut)} y={780} label="EASE.inOut (pindah)" color={INK} />
      <Ball x={go(EASE.out)} y={1000} label="EASE.out (masuk)" color={INK} />
      <Ball x={go(EASE.anticipate)} y={1220} label="EASE.anticipate (aksen)" color={ACC} />
    </>
  );
};

const ImpactDemo: React.FC = () => (
  <>
    <Title name="CountUp · Burst · Shake · Pulse" code={'<CountUp to={1500} at={q.angka} suffix=" kkal" />'} />
    <Pulse at={8} x={540} y={900} size={1000} repeat={36} color={MUTED} />
    <Burst at={37} x={540} y={900} radius={300} length={80} />
    <Shake at={37} amp={18}>
      <Reveal at={6} kind="pop" style={{ position: 'absolute', left: 140, top: 760, width: 800, height: 280, borderRadius: 40, background: ACC, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CountUp to={1500} at={10} suffix=" kkal" style={{ fontSize: 120, fontWeight: 800, color: BG }} />
      </Reveal>
    </Shake>
  </>
);

const PathDemo: React.FC = () => (
  <>
    <Title name="DrawPath" code={'<DrawPath d="M…" at={q.ke} arrow dash={[24, 18]} />'} />
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <DrawPath d="M140 600 C 400 480, 680 760, 940 600" at={8} stroke={INK} width={10} />
      <DrawPath d="M140 860 C 400 740, 680 1020, 900 860" at={22} stroke={ACC} width={10} dash={[28, 20]} arrow />
      <DrawPath d="M200 1350 L 200 1120 L 880 1120 L 880 1300" at={36} stroke={MUTED} width={12} arrow />
    </svg>
  </>
);

const TextFxDemo: React.FC = () => (
  <>
    <Title name="Highlight · Swap" code={'<Highlight at={q.kata}>…</Highlight>  <Swap at={q.ganti} a={…} b={…} />'} />
    <div style={{ position: 'absolute', left: 70, right: 70, top: 520, fontSize: 76, fontWeight: 800, color: INK, lineHeight: 1.2 }}>
      Yang manis justru <Highlight at={14} color="rgba(255,176,0,0.75)">pengisinya</Highlight>
    </div>
    <Swap
      at={52}
      style={{ position: 'absolute', left: 240, top: 900, width: 600, height: 300 }}
      a={<div style={{ width: 600, height: 300, borderRadius: 40, background: INK, color: BG, fontSize: 64, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Stevia?</div>}
      b={<div style={{ width: 600, height: 300, borderRadius: 40, background: ACC, color: BG, fontSize: 64, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Dekstrosa</div>}
    />
  </>
);

const IdleDemo: React.FC = () => (
  <>
    <Particles count={60} color={INK} rise={30} twinkle />
    <Title name="Idle · Particles" code={'<Idle amp={4}>…</Idle>  <Particles count={40} />'} />
    <div style={{ position: 'absolute', left: 140, top: 640, fontSize: 30, color: MUTED }}>diam (beku)</div>
    <div style={{ position: 'absolute', left: 140, top: 700, width: 300, height: 300, borderRadius: 40, background: MUTED }} />
    <div style={{ position: 'absolute', left: 640, top: 640, fontSize: 30, color: ACC }}>Idle</div>
    <Idle amp={6} rot={1.5} breathe={0.02} style={{ position: 'absolute', left: 640, top: 700 }}>
      <div style={{ width: 300, height: 300, borderRadius: 40, background: ACC }} />
    </Idle>
  </>
);

const SECTIONS: [string, React.FC, number][] = [
  ['Reveal', RevealDemo, 130],
  ['Exit', ExitDemo, 90],
  ['Teks', TextDemo, 100],
  ['Easing', EaseDemo, 80],
  ['Impact', ImpactDemo, 90],
  ['DrawPath', PathDemo, 90],
  ['Highlight-Swap', TextFxDemo, 90],
  ['Idle', IdleDemo, 90],
];
export const KATALOG_GERAK_FRAMES = SECTIONS.reduce((s, [, , n]) => s + n, 0);

export const KatalogGerak: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT_JAKARTA }}>
      {SECTIONS.map(([name, C, n]) => {
        const seq = (
          <Sequence key={name} name={name} from={from} durationInFrames={n}>
            <AbsoluteFill>
              <C />
            </AbsoluteFill>
          </Sequence>
        );
        from += n;
        return seq;
      })}
    </AbsoluteFill>
  );
};
