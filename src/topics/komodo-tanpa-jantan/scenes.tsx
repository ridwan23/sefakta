import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import { cueFrames } from '../../shared/episode/cues';
import { ISO, mixView, WorldMap, type LonLat, type MapView } from '../../shared/maps/WorldMap';
import { hash } from '../../shared/motion';
import { C, Chromo, Egg, Hatchling, Journal, Komodo, Label, Note, Pin, pop, ramp, Sex, Stamp, Waves } from './parts';

/** Visual per scene (kunci = id scene di briefs/komodo-tanpa-jantan.json). Animasi dipicu oleh waktu kata dari
 *  caption hasil alignment (cueFrames); angka detik di setiap cue hanya cadangan sebelum `npm run align`. */

const CHESTER: LonLat = [-2.89, 53.19];
const LONDON: LonLat = [-0.15, 51.53];
const UK_FROM: MapView = { center: [-2.2, 53.6], scale: 4200 };
const UK_TO: MapView = { center: [-1.9, 52.7], scale: 7000 };
const KOMODO: LonLat = [119.45, -8.58];
const RINCA: LonLat = [119.72, -8.67];
const FLORES: LonLat = [121.0, -8.65];
const NT_FROM: MapView = { center: [118.5, -4.5], scale: 2600 };
const NT_TO: MapView = { center: [120.2, -8.6], scale: 16000 };
// Telur ZZ / WW: posisi sama di akhir "mekanisme" dan awal "dampak" agar transisi tidak melompat.
const EGG_L = { x: 300, y: 1180, r: 150 };
const EGG_R = { x: 780, y: 1180, r: 150 };

// ------------------------------------------------------------------ hook: betina sendirian, telur menetas, semua jantan
const NEST = [270, 430, 650, 810];
const Hook: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { betina: ['betina', 0.4], pejantan: ['pejantan', 2.21], telur: ['telurnya', 3.12], menetas: ['menetas', 3.55], jantan: ['jantan', 5.1], kebetulan: ['kebetulan', 6.89] });
  const enter = ramp(f, 0, 14, Easing.out(Easing.cubic));
  const strike = ramp(f, q.pejantan + 8, 10);
  return (
    <Journal>
      <Komodo x={interpolate(enter, [0, 1], [380, 560])} y={720} s={1.35} f={f} o={enter} />
      <Sex x={250} y={540} kind="f" t={pop(f, q.betina, 12)} />
      <Note x={540} y={300} text="AYAH: ?" size={92} o={ramp(f, q.pejantan - 4, 10)} rotate={-4} />
      <svg style={{ position: 'absolute' }} width={1080} height={1920}>
        <line x1={380} y1={300} x2={380 + 320 * strike} y2={290} stroke={C.terra} strokeWidth={12} strokeLinecap="round" opacity={strike > 0 ? 1 : 0} />
      </svg>
      {NEST.map((x, i) => {
        const t = pop(f, q.telur + i * 3, 12);
        const crack = ramp(f, q.menetas + i * 4, 8);
        const open = ramp(f, q.menetas + i * 4 + 10, 12, Easing.out(Easing.back(1.4)));
        return (
          <React.Fragment key={x}>
            <Egg x={x} y={1230} r={80 * t} crack={crack} open={open} o={Math.min(1, t * 2)} />
            <Hatchling x={x - 6} y={1215 - 40 * open} s={0.2} f={f + i * 7} o={open} />
            <Sex x={x} y={1065} kind="m" r={40} t={pop(f, q.jantan + i * 4, 12)} />
          </React.Fragment>
        );
      })}
      <Note x={540} y={1400} text="bukan kebetulan!" size={72} color={C.terra} o={ramp(f, q.kebetulan - 2, 10)} rotate={-2} />
    </Journal>
  );
};

// ------------------------------------------------------------------ konteks: Inggris 2006, Flora & Sungai, tes DNA
const BANDS = [0.05, 0.16, 0.27, 0.36, 0.48, 0.6, 0.71, 0.83, 0.93];
const KIDS = [[0, 2, 4, 6, 8], [1, 2, 5, 6, 7]];
const Konteks: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { enam: ['enam', 0.92], inggris: ['Inggris', 2.19], komodo: ['komodo', 2.99], flora: ['Flora', 5.44], sungai: ['Sungai', 5.92], tes: ['Tes', 6.58], pastikan: ['memastikan', 7.08], anak: ['anak-anak', 7.93], ayah: ['ayah', 9.72] });
  const view = mixView(UK_FROM, UK_TO, ramp(f, 0, q.inggris + 10, Easing.inOut(Easing.cubic)));
  const toLab = ramp(f, q.tes - 6, 14, Easing.inOut(Easing.cubic));
  const lanes = [
    { x: 250, name: 'INDUK', bands: BANDS.map((_, i) => i), at: q.pastikan },
    { x: 430, name: 'ANAK', bands: KIDS[0], at: q.anak },
    { x: 610, name: 'ANAK', bands: KIDS[1], at: q.anak + 6 },
    { x: 800, name: 'AYAH', bands: [] as number[], at: q.ayah },
  ];
  return (
    <Journal>
      <AbsoluteFill style={{ opacity: 1 - toLab * 0.85 }}>
        <WorldMap view={view} land={C.land} border={C.inkSoft} ocean={C.sea} highlight={{ [ISO.uk]: C.greenSoft }}>
          {(p) => {
            const a = p(CHESTER)!, b = p(LONDON)!;
            return (
              <>
                <Pin x={a[0]} y={a[1]} f={f} t={ramp(f, q.komodo, 10)} />
                <Pin x={b[0]} y={b[1]} f={f} t={ramp(f, q.komodo + 6, 10)} />
                <Label x={a[0]} y={a[1] - 120} text={'FLORA\nChester Zoo'} size={44} o={ramp(f, q.flora, 10)} color={C.terra} />
                <Label x={b[0] - 40} y={b[1] + 120} text={'SUNGAI\nLondon Zoo'} size={44} o={ramp(f, q.sungai, 10)} color={C.terra} />
                <Label x={300} y={1340} text="INGGRIS" size={46} o={ramp(f, q.inggris, 10)} color={C.green} />
              </>
            );
          }}
        </WorldMap>
      </AbsoluteFill>
      {toLab > 0 ? (
        <AbsoluteFill style={{ opacity: toLab, transform: `translateY(${(1 - toLab) * 60}px)` }}>
          <div style={{ position: 'absolute', left: 130, top: 480, width: 820, height: 860, background: '#FBF7EC', border: `5px solid ${C.ink}`, borderRadius: 24, boxShadow: '0 12px 0 rgba(31,42,30,0.12)' }} />
          <Label x={540} y={560} text="TES DNA" size={52} />
          <svg style={{ position: 'absolute' }} width={1080} height={1920}>
            {lanes.map((l) => (
              <g key={l.x}>
                <rect x={l.x - 60} y={630} width={120} height={560} rx={12} fill={l.name === 'AYAH' ? 'rgba(180,83,42,0.07)' : 'rgba(47,107,79,0.08)'} stroke={C.inkSoft} strokeWidth={3} strokeDasharray={l.name === 'AYAH' ? '12 10' : undefined} />
                {l.bands.map((bi, j) => {
                  const t = ramp(f, l.at + j * 2, 8);
                  return <rect key={bi} x={l.x - 50} y={650 + BANDS[bi] * 520} width={100 * t} height={16} rx={6} fill={l.name === 'INDUK' ? C.terra : C.green} />;
                })}
              </g>
            ))}
          </svg>
          {lanes.map((l, i) => <Label key={i} x={l.x} y={1250} text={l.name} size={30} color={l.name === 'AYAH' ? C.terra : C.ink} />)}
          <Note x={800} y={910} text="?" size={150} color={C.terra} o={ramp(f, q.ayah - 4, 8)} rotate={0} />
        </AbsoluteFill>
      ) : null}
      <Stamp x={540} y={1400} text="TANPA AYAH" t={pop(f, q.ayah + 6, 12)} size={56} />
      <Stamp x={540} y={270} text="2006" t={pop(f, q.enam, 12)} size={80} color={C.green} rotate={-4} />
    </Journal>
  );
};

// ------------------------------------------------------------------ mekanisme: telur tanpa sperma → kromosom Z/W → ZZ atau WW
const Sperm: React.FC<{ x: number; y: number; f: number; o: number }> = ({ x, y, f, o }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, opacity: o }} width={1080} height={1920}>
    <path d={`M ${x - 30} ${y} ${Array.from({ length: 8 }, (_, i) => `Q ${x - 50 - i * 22} ${y + (i % 2 ? -1 : 1) * 18 * Math.sin(f / 3 + i)} ${x - 62 - i * 22} ${y}`).join(' ')}`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <ellipse cx={x} cy={y} rx={34} ry={22} fill={C.olive} stroke={C.ink} strokeWidth={5} />
  </svg>
);
const Mekanisme: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { parteno: ['partenogenesis', 1.37], tidak: ['tidak', 3.21], digenapi: ['digenapi', 4.68], salinan: ['salinan', 5.16], masalah: ['Masalahnya', 7.08], kromosom: ['kromosom', 9.3], z: ['Z', 10.84], w: ['W', 11.27], jadi: ['Jadi', 11.84], telur2: ['telurnya', 12.18, 1], zz: ['Z', 14.12, 1], ww: ['W', 15.01, 1] });
  const toChromo = ramp(f, q.masalah - 6, 16, Easing.inOut(Easing.cubic));
  const spermX = interpolate(f, [0, q.tidak], [-80, 250], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const blocked = ramp(f, q.tidak, 8);
  const merge = ramp(f, q.digenapi, 22, Easing.inOut(Easing.cubic));
  const glow = ramp(f, q.digenapi + 18, 10);
  const split = ramp(f, q.jadi, 16, Easing.inOut(Easing.cubic));
  return (
    <Journal>
      <Label x={540} y={270} text="PARTENOGENESIS" size={58} color={C.green} o={ramp(f, q.parteno, 10) * (1 - toChromo)} />
      {/* sel telur */}
      <AbsoluteFill style={{ opacity: 1 - toChromo }}>
        <svg style={{ position: 'absolute' }} width={1080} height={1920}>
          <circle cx={560} cy={800} r={230} fill={C.egg} stroke={C.ink} strokeWidth={6} />
          <circle cx={560} cy={800} r={78 + glow * 10} fill={glow > 0 ? `rgba(47,107,79,${0.25 + glow * 0.45})` : 'rgba(47,107,79,0.25)'} stroke={C.ink} strokeWidth={5} />
          <circle cx={interpolate(merge, [0, 1], [850, 560])} cy={interpolate(merge, [0, 1], [560, 800])} r={interpolate(merge, [0, 1], [46, 30])} fill="rgba(47,107,79,0.55)" stroke={C.ink} strokeWidth={4} opacity={(merge > 0 ? 1 : ramp(f, q.tidak + 10, 10)) * (1 - glow)} />
        </svg>
        <Sperm x={spermX} y={800} f={f} o={1 - ramp(f, q.tidak + 16, 10)} />
        <svg style={{ position: 'absolute', opacity: blocked * (1 - ramp(f, q.tidak + 16, 10)) }} width={1080} height={1920}>
          <g stroke={C.terra} strokeWidth={14} strokeLinecap="round">
            <line x1={190} y1={740} x2={300} y2={850} />
            <line x1={300} y1={740} x2={190} y2={850} />
          </g>
        </svg>
        <Note x={560} y={1120} text="salinan gen induk" size={64} color={C.green} o={ramp(f, q.salinan, 10)} />
        <Note x={240} y={650} text="tanpa sperma" size={54} color={C.terra} o={blocked * (1 - ramp(f, q.salinan, 10))} />
      </AbsoluteFill>
      {/* kromosom induk → dua kemungkinan telur */}
      {toChromo > 0 ? (
        <AbsoluteFill style={{ opacity: toChromo }}>
          <Komodo x={500} y={380} s={0.62} f={f} />
          <Sex x={830} y={330} kind="f" t={toChromo} r={40} />
          <Label x={540} y={560} text="KROMOSOM SEKS INDUK" size={36} o={ramp(f, q.kromosom, 10)} />
          <Chromo x={440} y={760} kind="Z" t={pop(f, q.z, 12)} />
          <Chromo x={640} y={735} kind="W" t={pop(f, q.w, 12)} />
          <svg style={{ position: 'absolute' }} width={1080} height={1920}>
            <g fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeDasharray="18 12">
              <path d={`M 440 900 Q 360 960 ${440 + (EGG_L.x - 440) * split} ${900 + (EGG_L.y - EGG_L.r - 920) * split}`} opacity={split > 0 ? 1 : 0} />
              <path d={`M 640 900 Q 720 960 ${640 + (EGG_R.x - 640) * split} ${900 + (EGG_R.y - EGG_R.r - 920) * split}`} opacity={split > 0 ? 1 : 0} />
            </g>
          </svg>
          <Egg x={EGG_L.x} y={EGG_L.y} r={EGG_L.r * pop(f, q.telur2, 12)} o={Math.min(1, pop(f, q.telur2, 12) * 2)} />
          <Egg x={EGG_R.x} y={EGG_R.y} r={EGG_R.r * pop(f, q.telur2 + 4, 12)} o={Math.min(1, pop(f, q.telur2 + 4, 12) * 2)} />
          <PairInEgg egg={EGG_L} kind="Z" t={pop(f, q.zz, 12)} />
          <PairInEgg egg={EGG_R} kind="W" t={pop(f, q.ww, 12)} />
        </AbsoluteFill>
      ) : null}
    </Journal>
  );
};
const PairInEgg: React.FC<{ egg: { x: number; y: number }; kind: 'Z' | 'W'; t: number; o?: number }> = ({ egg, kind, t, o = 1 }) => (
  <div style={{ opacity: o }}>
    <Chromo x={egg.x - 34} y={egg.y - 40} kind={kind} t={t} s={0.42} rotate={-8} />
    <Chromo x={egg.x + 34} y={egg.y - 40} kind={kind} t={t} s={0.42} rotate={8} />
  </div>
);

// ------------------------------------------------------------------ dampak: WW gagal, ZZ menetas jantan, keragaman turun, terancam
const Dampak: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { gagal: ['gagal', 0.82], menetas: ['menetas', 2.4], jantan: ['jantan', 4.29], anaknya: ['Anaknya', 4.78], bukan: ['bukan', 5.2], keragaman: ['keragaman', 6.78], kurang: ['berkurang', 7.62], terancam: ['terancam', 9.4], jantan2: ['jantan', 12.35, 1], betina: ['betina', 12.93] });
  const dead = ramp(f, q.gagal, 12);
  const crack = ramp(f, q.menetas, 8);
  const open = ramp(f, q.menetas + 10, 14, Easing.out(Easing.back(1.4)));
  const toBars = ramp(f, q.anaknya - 6, 16, Easing.inOut(Easing.cubic));
  const shrink = ramp(f, q.kurang, 24, Easing.inOut(Easing.cubic));
  const barW = 700;
  return (
    <Journal>
      <AbsoluteFill style={{ opacity: 1 - toBars }}>
        <Egg x={EGG_L.x} y={EGG_L.y} r={EGG_L.r} crack={crack} open={open} />
        <PairInEgg egg={EGG_L} kind="Z" t={1} o={1 - ramp(f, q.menetas, 10)} />
        <Hatchling x={EGG_L.x - 10} y={EGG_L.y - 20 - 60 * open} s={0.42} f={f} o={open} />
        <Egg x={EGG_R.x} y={EGG_R.y} r={EGG_R.r} dead={dead} />
        <PairInEgg egg={EGG_R} kind="W" t={1} o={1 - dead * 0.6} />
        <Note x={EGG_R.x} y={EGG_R.y - 230} text="gagal" size={76} color={C.terra} o={dead} rotate={3} />
        <Sex x={EGG_L.x} y={EGG_L.y - 330} kind="m" t={pop(f, q.jantan, 12)} />
        <Note x={EGG_L.x} y={EGG_L.y - 240} text="jantan" size={76} color={C.green} o={ramp(f, q.jantan, 10)} />
      </AbsoluteFill>
      {toBars > 0 ? (
        <AbsoluteFill style={{ opacity: toBars }}>
          <Label x={540} y={330} text="KERAGAMAN GEN" size={46} o={ramp(f, q.keragaman, 10)} />
          {[{ y: 470, name: 'INDUK', w: 1, color: C.terra }, { y: 640, name: 'ANAK', w: 1 - 0.5 * shrink, color: C.green }].map((b) => (
            <React.Fragment key={b.name}>
              <Label x={190} y={b.y} text={b.name} size={30} align="left" />
              <div style={{ position: 'absolute', left: 190, top: b.y + 32, width: barW, height: 56, borderRadius: 14, border: `4px dashed ${C.inkSoft}` }} />
              <div style={{ position: 'absolute', left: 190, top: b.y + 32, width: barW * b.w * ramp(f, q.anaknya + (b.name === 'ANAK' ? 6 : 0), 14), height: 56, borderRadius: 14, background: b.color, border: `4px solid ${C.ink}` }} />
            </React.Fragment>
          ))}
          <Note x={540} y={840} text="bukan klon induknya" size={64} color={C.green} o={ramp(f, q.bukan, 10)} />
          <Stamp x={540} y={1010} text={'TERANCAM\n(IUCN)'} t={pop(f, q.terancam, 12)} size={60} />
          <div style={{ position: 'absolute', left: 300, top: 1190, width: 480, height: 200, borderRadius: 30, border: `6px solid ${C.ink}`, background: 'rgba(185,205,180,0.35)', opacity: ramp(f, q.jantan2 - 6, 10) }} />
          <Sex x={450} y={1290} kind="m" t={pop(f, q.jantan2, 12)} />
          <Sex x={630} y={1290} kind="f" t={pop(f, q.betina, 12)} />
        </AbsoluteFill>
      ) : null}
    </Journal>
  );
};

// ------------------------------------------------------------------ jawaban: Nusa Tenggara → hipotesis satu betina membangun populasi
const POP = Array.from({ length: 6 }, (_, i) => ({ x: 330 + (i % 3) * 210 + (hash(i * 4.1) - 0.5) * 40, y: 930 + Math.floor(i / 3) * 150 + (hash(i * 2.7) - 0.5) * 30, sex: (i % 2 ? 'f' : 'm') as 'm' | 'f' }));
const Jawaban: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { apa: ['apa', 0.75], alam: ['alam', 2.13], pulau: ['pulau', 4.15], nusa: ['Nusa', 4.59], menduga: ['menduga', 5.98], terdampar: ['terdampar', 7.04], menetaskan: ['menetaskan', 8.26], jantan: ['jantan', 9.17], kawin: ['kawin', 10.02], populasi: ['populasi', 11.93] });
  const toMap = ramp(f, q.alam - 6, 12, Easing.inOut(Easing.cubic));
  const view = mixView(NT_FROM, NT_TO, ramp(f, q.alam, q.nusa - q.alam + 12, Easing.inOut(Easing.cubic)));
  const toIsland = ramp(f, q.menduga - 6, 16, Easing.inOut(Easing.cubic));
  const drift = ramp(f, q.terdampar - 10, 30, Easing.out(Easing.cubic));
  const egg = pop(f, q.menetaskan, 12);
  const hatch = ramp(f, q.menetaskan + 14, 12);
  const grow = ramp(f, q.populasi - 4, 24);
  return (
    <Journal>
      <Note x={540} y={820} text="?" size={360} color={C.green} o={pop(f, q.apa - 6, 12) * (1 - toMap)} rotate={0} />
      <AbsoluteFill style={{ opacity: toMap * (1 - toIsland) }}>
        <WorldMap view={view} land={C.land} border={C.inkSoft} ocean={C.sea} highlight={{ [ISO.indonesia]: '#D9CFAE' }}>
          {(p) => {
            const k = p(KOMODO)!, r = p(RINCA)!, fl = p(FLORES)!;
            const t = ramp(f, q.pulau, 10);
            return (
              <>
                <Pin x={k[0]} y={k[1]} f={f} t={t} color={C.green} />
                <Pin x={r[0]} y={r[1]} f={f} t={t} color={C.green} />
                <Label x={k[0] - 30} y={k[1] - 90} text="KOMODO" size={38} o={t} color={C.green} />
                <Label x={r[0] + 20} y={r[1] + 90} text="RINCA" size={38} o={t} color={C.green} />
                <Label x={Math.min(880, fl[0])} y={fl[1] - 110} text="FLORES" size={38} o={t} color={C.green} />
              </>
            );
          }}
        </WorldMap>
        <Label x={540} y={300} text="NUSA TENGGARA" size={56} o={ramp(f, q.nusa, 10)} />
      </AbsoluteFill>
      {toIsland > 0 ? (
        <AbsoluteFill style={{ opacity: toIsland }}>
          <AbsoluteFill style={{ background: C.sea, opacity: 0.6 }} />
          <Waves f={f} area={[80, 640, 1000, 1400]} count={22} />
          <svg style={{ position: 'absolute' }} width={1080} height={1920}>
            <path d="M 210 1010 C 200 880, 340 790, 520 800 C 720 790, 880 860, 890 990 C 900 1130, 760 1210, 560 1210 C 360 1215, 220 1140, 210 1010 Z" fill={C.land} stroke={C.ink} strokeWidth={6} />
          </svg>
          <Komodo x={interpolate(drift, [0, 1], [-260, 420])} y={1010} s={0.55} f={f} o={Math.min(1, drift * 3) * (1 - grow)} />
          <Sex x={interpolate(drift, [0, 1], [-260, 420])} y={870} kind="f" r={40} t={Math.min(1, drift * 2) * (1 - grow)} />
          <Egg x={700} y={1050} r={62 * egg} crack={ramp(f, q.menetaskan + 6, 8)} open={hatch} o={Math.min(1, egg * 2) * (1 - grow)} />
          <Hatchling x={694} y={1030 - 30 * hatch} s={0.22} f={f} o={hatch * (1 - grow)} />
          <Sex x={700} y={900} kind="m" r={40} t={pop(f, q.jantan, 12) * (1 - grow)} />
          <Note x={560} y={1330} text="+" size={0.01 + 120 * ramp(f, q.kawin, 8) * (1 - grow)} color={C.terra} rotate={0} />
          {POP.map((a, i) => (
            <React.Fragment key={i}>
              <Komodo x={a.x} y={a.y} s={0.3} f={f + i * 11} flip={i % 2 === 1} o={ramp(f, q.populasi - 4 + i * 3, 10)} />
              <Sex x={a.x} y={a.y - 70} kind={a.sex} r={34} t={pop(f, q.populasi + i * 3, 10)} />
            </React.Fragment>
          ))}
          <Note x={540} y={1330} text="populasi baru" size={72} color={C.green} o={grow} />
        </AbsoluteFill>
      ) : null}
      <Stamp x={540} y={290} text="HIPOTESIS" t={pop(f, q.menduga, 12)} size={60} color={C.olive} />
    </Journal>
  );
};

export const VISUALS: SceneVisuals = { hook: Hook, konteks: Konteks, mekanisme: Mekanisme, dampak: Dampak, jawaban: Jawaban };
