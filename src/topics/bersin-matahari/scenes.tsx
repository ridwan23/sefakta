import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Backdrop } from '../../shared/look/Backdrop';
import { cueFrames } from '../../shared/episode/cues';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import { C, Car, Glasses, HeadProfile, Motes, Person, Sun, Tag, Tunnel, Txt, fade, pop, ramp } from './parts';

/** Visual episode "Kenapa Matahari Bikin Sebagian Orang Bersin?".
 *  Kamera TERKUNCI di semua scene (prinsip kamera: gerakan hanya bila ada alasan cerita;
 *  di sini objeklah yang bergerak — cahaya membanjir, sinyal melompat, mobil keluar terowongan).
 *  Area aman: isi utama x 60–1020, y 180–1460; watermark x > 800, y < 175 kosong; caption y > 1460 kosong. */

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
    {children}
  </svg>
);

const Frame: React.FC<{ children: React.ReactNode; lightAt?: [number, number]; style: SceneVisualProps['style'] }> = ({ children, lightAt, style }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Backdrop style={style} pattern="dots" lightAt={lightAt ?? [540, 420]} />
      <Motes f={f} />
      {children}
    </AbsoluteFill>
  );
};

/** Kartu kecil "bukan ..." dengan silang merah. */
const NotCard: React.FC<{ x: number; y: number; t: number; label: string; icon: React.ReactNode }> = ({ x, y, t, label, icon }) =>
  t <= 0 ? null : (
    <g opacity={Math.min(1, t)} transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * t})`}>
      <rect x={-150} y={-100} width={300} height={200} rx={28} fill={C.panel} stroke={C.dim} strokeWidth={4} />
      <g transform="scale(1.25)">{icon}</g>
      <Txt x={0} y={78} text={label} size={42} color={C.dim} />
      <g stroke={C.danger} strokeWidth={10} strokeLinecap="round">
        <line x1={-52} y1={-52} x2={52} y2={52} />
        <line x1={52} y1={-52} x2={-52} y2={52} />
      </g>
    </g>
  );

// ------------------------------------------------------------------ 1 · hook
const Hook: React.FC<SceneVisualProps> = ({ scene, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    keluar: ['Keluar', 0.05], bersin: ['bersin', 3.57], bukan: ['Bukan', 4.3],
    debu: ['debu', 5.38], matahari: ['Matahari', 6.1],
  });
  const beam = ramp(f, q.keluar, 30); // cahaya membanjir saat pintu terbuka
  const sunT = pop(f, q.bersin - 6, 16);
  const sneeze = pop(f, q.bersin, 10); // kepala menunduk + "HAPTSI!"
  const tilt = Math.sin(f / 38) * 1.4 - sneeze * 9;
  const notO = pop(f, q.bukan, 12) * fade(f, q.matahari + 12, 12);
  const debuO = pop(f, q.debu, 12) * fade(f, q.matahari + 12, 12);
  const sunGlow = 0.6 + 0.4 * ramp(f, q.matahari, 24);
  return (
    <Frame style={style} lightAt={[860, 300]}>
      <Svg>
        {/* berkas cahaya dari kanan atas saat keluar ruangan */}
        <polygon points="1080,0 1080,420 240,1920 0,1920 0,1500 700,0" fill={C.sun} opacity={0.13 * beam} />
        <g transform={`translate(540 400) scale(${1 + 0.02 * Math.sin(f / 30)}) translate(-540 -400)`}>
          <Sun x={540} y={400} r={105} t={sunT} rot={f * 0.12} />
        </g>
        {/* pintu ruangan gelap di belakang sosok */}
        <g opacity={0.9}>
          <rect x={360} y={880} width={360} height={500} fill="#04101F" stroke={C.dim} strokeWidth={6} />
          <line x1={360} y1={880} x2={720} y2={880} stroke={C.dim} strokeWidth={6} />
        </g>
        {/* sosok di pintu: siluet gelap dulu, lalu tersorot mengikuti cahaya */}
        <ellipse cx={540} cy={1360} rx={200} ry={26} fill="#000000" opacity={0.35 * beam} />
        <g opacity={0.15 + 0.85 * beam}>
          <Person x={540} y={1150} s={1.45} tilt={tilt} />
        </g>
        {sneeze > 0 ? (
          <g opacity={Math.min(1, sneeze)}>
            <Txt x={540} y={640} text="HAPTSI!" size={92} color={C.sunSoft} display />
            <g stroke={C.sunSoft} strokeWidth={8} strokeLinecap="round">
              <line x1={450} y1={990} x2={400} y2={950} />
              <line x1={630} y1={990} x2={680} y2={950} />
              <line x1={540} y1={970} x2={540} y2={910} />
            </g>
          </g>
        ) : null}
        <NotCard
          x={300} y={760} t={notO} label="BUKAN FLU"
          icon={<g fill="none" stroke={C.sky} strokeWidth={6}><circle cx={0} cy={-18} r={34} /><line x1={0} y1={-52} x2={0} y2={-68} /><line x1={-30} y1={-44} x2={-42} y2={-56} /><line x1={30} y1={-44} x2={42} y2={-56} /><line x1={-34} y1={-18} x2={-52} y2={-18} /><line x1={34} y1={-18} x2={52} y2={-18} /></g>}
        />
        <NotCard
          x={780} y={760} t={debuO} label="BUKAN DEBU"
          icon={<g fill={C.dim}><circle cx={-28} cy={-30} r={9} /><circle cx={8} cy={-42} r={7} /><circle cx={30} cy={-12} r={10} /><circle cx={-6} cy={2} r={6} /></g>}
        />
        {/* matahari makin menyala saat namanya disebut */}
        <circle cx={540} cy={400} r={150 + 40 * sunGlow} fill={C.sun} opacity={0.1 * sunGlow * sunT} />
      </Svg>
    </Frame>
  );
};

// ------------------------------------------------------------------ 2 · konteks
const Konteks: React.FC<SceneVisualProps> = ({ scene, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    namanya: ['namanya', 0.42], sindrom: ['sindrom', 0.96], refleks: ['refleks', 3.03],
    diperkirakan: ['Diperkirakan', 5.23], delapan: ['delapan', 6.3], lima: ['lima', 7.24], orang: ['orang', 8.4],
  });
  const letters = ['A', 'C', 'H', 'O', 'O'];
  const lx = (i: number) => 540 + (i - 2) * 110;
  const num = Math.round(interpolate(f, [q.delapan, q.lima + 15], [18, 35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const numT = pop(f, q.diperkirakan, 14);
  const lit = Math.min(3, Math.max(0, Math.round(num / 10)));
  const rowY = 1260;
  return (
    <Frame style={style} lightAt={[540, 480]}>
      <Svg>
        {letters.map((L, i) => {
          // R3: huruf ACHOO masuk sejak frame 2 (bukan menunggu kata "namanya" di ~frame 13)
          // agar 0,4 dtk pertama scene tidak kosong — entrance wajib terlihat di frame awal.
          const t = pop(f, 2 + i * 2, 12);
          const bob = t >= 1 ? Math.sin((f - 2 - i * 2) / 28) * 3 : 0;
          return t <= 0 ? null : (
            <text key={L + i} x={lx(i)} y={520} textAnchor="middle" fontSize={160} fontWeight={700} fill={C.white} opacity={Math.min(1, t)} fontFamily="Space Grotesk, sans-serif" transform={`translate(0 ${(1 - t) * 30 + bob})`}>
              {L}
            </text>
          );
        })}
        <Txt x={540} y={620} text="SINDROM BERSIN CAHAYA" size={44} color={C.sunSoft} o={pop(f, q.sindrom, 12)} spacing={3} display />
        <Txt x={540} y={700} text="refleks bersin karena cahaya" size={40} color={C.dim} o={pop(f, q.refleks, 12)} />
        {numT > 0 ? (
          <g opacity={Math.min(1, numT)}>
            <circle cx={540} cy={990} r={150 + 20 * Math.sin(f / 25)} fill={C.sun} opacity={0.08 + 0.05 * Math.sin(f / 25)} />
            <Txt x={540} y={1050} text={`${num}%`} size={180} color={C.sun} display />
            <Txt x={540} y={1130} text="ORANG DI DUNIA MENGALAMINYA" size={36} color={C.dim} spacing={2} />
            {Array.from({ length: 10 }, (_, i) => {
              const px = 540 + (i - 4.5) * 92;
              const on = i < lit;
              const pt = pop(f, q.delapan + i * 3, 10);
              return pt <= 0 ? null : (
                <g key={i} opacity={Math.min(1, pt)} transform={`translate(${px} ${rowY}) scale(${0.8 + 0.2 * pt})`}>
                  <circle cx={0} cy={-32} r={20} fill={on ? C.sun : '#33456E'} />
                  <path d="M -38 36 Q -37 -6 0 -6 Q 37 -6 38 36 Z" fill={on ? C.sun : '#33456E'} />
                </g>
              );
            })}
          </g>
        ) : null}
      </Svg>
    </Frame>
  );
};

// ------------------------------------------------------------------ 3 · mekanisme
const Mekanisme: React.FC<SceneVisualProps> = ({ scene, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    biasanya: ['Biasanya', 0.06], hidung: ['hidung', 2.84], cahaya: ['cahaya', 4.16],
    menyalakan: ['menyalakan', 4.97], sinyalnya: ['sinyalnya', 6.81], bocor: ['bocor', 7.68],
    otak: ['Otak', 9.0], teriritasi: ['teriritasi', 11.68], padahal: ['padahal', 12.82],
  });
  // jalur hidung → otak (garis penuh, biru langit) tergambar saat "Biasanya"
  const pathA = ramp(f, q.biasanya + 6, 40, Easing.inOut(Easing.cubic));
  // sinar masuk mata + jalur mata → otak saat "cahaya"/"menyalakan"
  const beam = ramp(f, q.cahaya, 20);
  const pathB = ramp(f, q.menyalakan, 24, Easing.inOut(Easing.cubic));
  // sinyal bocor (garis putus-putus kuning) + percikan saat "bocor"
  const leak = ramp(f, q.sinyalnya + 6, 26, Easing.inOut(Easing.cubic));
  const burst = pop(f, q.bocor, 12);
  // otak berkedip saat "Otak salah sangka"
  const brain = 0.6 + 0.4 * Math.sin(f / 9) * ramp(f, q.otak, 10);
  const iritasiT = pop(f, q.teriritasi, 12) * fade(f, q.padahal + 14, 10);
  const padahalT = pop(f, q.padahal, 12);
  const headSway = Math.sin(f / 46) * 1.2;
  return (
    <Frame style={style} lightAt={[300, 300]}>
      <Svg>
        <g opacity={ramp(f, 0, 14)} transform={`rotate(${headSway} 540 740)`}>
          <HeadProfile x={540} y={740} s={1} />
        </g>
        {/* sinar matahari ke mata (640,660) */}
        <g opacity={beam}>
          <line x1={110} y1={230} x2={622} y2={648} stroke={C.sun} strokeWidth={14} strokeLinecap="round" opacity={0.85} />
          <line x1={170} y1={330} x2={618} y2={652} stroke={C.sunSoft} strokeWidth={7} strokeLinecap="round" opacity={0.7} />
          <Sun x={150} y={270} r={64} t={beam} rot={f * 0.15} rays={8} />
        </g>
        {/* jalur A: hidung (800,780) → otak (480,640), garis penuh */}
        <path d="M 780 772 Q 650 725 552 662" fill="none" stroke={C.sky} strokeWidth={9} strokeLinecap="round"
          strokeDasharray="400" strokeDashoffset={400 * (1 - pathA)} opacity={pathA} />
        {/* jalur B: mata → otak, garis penuh kuning */}
        <path d="M 612 652 Q 580 648 556 646" fill="none" stroke={C.sun} strokeWidth={9} strokeLinecap="round"
          strokeDasharray="120" strokeDashoffset={120 * (1 - pathB)} opacity={pathB} />
        {/* bocoran: mata → hidung (putus-putus) */}
        <path d="M 625 678 Q 700 735 762 758" fill="none" stroke={C.sunSoft} strokeWidth={11} strokeLinecap="round" strokeDasharray="16 12"
          strokeDashoffset={-leak * 120 - f * 0.9} opacity={leak} />
        {burst > 0 ? (
          <g opacity={Math.min(1, burst)} transform={`translate(695 718) scale(${burst})`}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 44} y2={Math.sin(a) * 44} stroke={C.sunSoft} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        ) : null}
        {/* otak berkedip */}
        <circle cx={480} cy={640} r={46} fill={C.sunSoft} opacity={0.25 * brain * ramp(f, q.otak, 10)} />
        <Tag x={620} y={330} w={560} h={100} t={pop(f, q.otak, 12)} stroke={C.sunSoft}>
          <Txt x={0} y={4} text="OTAK SALAH SANGKA?" size={44} color={C.cream} display />
        </Tag>
        <Tag x={540} y={1180} w={540} h={96} t={pop(f, q.sinyalnya, 12)} stroke={C.sunSoft} dashed>
          <Txt x={0} y={4} text="SINYAL DIDUGA BOCOR" size={42} color={C.sunSoft} display />
        </Tag>
        <Tag x={880} y={900} w={280} h={88} t={iritasiT} fill={C.panel} stroke={C.danger}>
          <Txt x={0} y={4} text="IRITASI?" size={42} color={C.danger} display />
        </Tag>
        {padahalT > 0 ? (
          <g opacity={Math.min(1, padahalT)}>
            <line x1={760} y1={870} x2={1000} y2={930} stroke={C.danger} strokeWidth={10} strokeLinecap="round" />
            <line x1={1000} y1={870} x2={760} y2={930} stroke={C.danger} strokeWidth={10} strokeLinecap="round" />
            <Txt x={880} y={1000} text="PADAHAL TIDAK" size={38} color={C.cream} display />
          </g>
        ) : null}
        <Txt x={540} y={1300} text="garis penuh = jalur normal · garis putus-putus = bocoran" size={30} color={C.dim} o={pop(f, q.biasanya, 12)} />
      </Svg>
    </Frame>
  );
};

// ------------------------------------------------------------------ 4 · dampak
const Dampak: React.FC<SceneVisualProps> = ({ scene, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    menurun: ['menurun', 0.59], bila: ['Bila', 1.11], peluangmu: ['peluangmu', 3.63],
    bersinnya: ['Bersinnya', 5.0], berbahaya2: ['berbahaya', 7.31, 1], mengemudi: ['mengemudi', 8.31],
    keluar: ['keluar', 9.67], siang: ['siang', 10.97], terang: ['terang', 11.47],
  });
  const familyO = pop(f, 0, 12) * fade(f, q.bersinnya, 12);
  const lineT = ramp(f, q.bila, 18, Easing.inOut(Easing.cubic));
  const pct = Math.round(interpolate(f, [q.peluangmu, q.peluangmu + 30], [0, 50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const pctT = pop(f, q.peluangmu, 12) * fade(f, q.bersinnya, 12);
  const safeT = pop(f, q.bersinnya + 10, 12) * fade(f, q.berbahaya2 - 8, 10);
  const dangerT = pop(f, q.berbahaya2, 12);
  const stageT = pop(f, q.bersinnya, 12); // panggung jalan muncul bersama "Bersinnya" — tanpa jeda kosong
  const sunT = pop(f, q.siang, 14);
  const carX = interpolate(f, [q.keluar, q.terang + 12], [260, 700], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const carT = pop(f, q.mengemudi, 12);
  const sneezeShake = Math.sin(f * 1.4) * 4 * ramp(f, q.terang, 8) * fade(f, q.terang + 26, 14);
  return (
    <Frame style={style} lightAt={[540, 500]}>
      <Svg>
        {/* --- babak 1: menurun --- */}
        {familyO > 0 ? (
          <g opacity={Math.min(1, familyO)}>
            <Txt x={540} y={300} text="SIFAT INI MENURUN" size={52} color={C.cream} display />
            <Person x={350} y={560} s={1.0} color={C.sun} />
            <Txt x={350} y={760} text="ORANG TUA" size={32} color={C.sunSoft} />
            <Person x={730} y={560} s={1.0} color={C.white} />
            <Txt x={730} y={760} text="ANAK" size={32} color={C.dim} />
            <path d="M 350 620 Q 540 760 730 620" fill="none" stroke={C.sky} strokeWidth={7} strokeDasharray="300" strokeDashoffset={300 * (1 - lineT)} />
            {pctT > 0 ? (
              <g opacity={Math.min(1, pctT)}>
                <Txt x={540} y={1010} text={`${pct}%`} size={170} color={C.sun} display />
                <Txt x={540} y={1090} text="PELUANG MEWARISI" size={36} color={C.dim} spacing={2} />
              </g>
            ) : null}
          </g>
        ) : null}
        {/* --- babak 2: berbahaya di jalan --- */}
        <Tag x={540} y={560} w={640} h={104} t={safeT} fill={C.panel} stroke={C.ok}>
          <Txt x={0} y={4} text="✓ TIDAK BERBAHAYA" size={46} color={C.ok} display />
        </Tag>
        <Tag x={540} y={560} w={820} h={104} t={dangerT} fill={C.panel} stroke={C.danger}>
          <Txt x={0} y={4} text="TAPI BERBAHAYA DI JALAN" size={46} color={C.danger} display />
        </Tag>
        {stageT > 0 ? (
          <g opacity={Math.min(1, stageT)}>
            <Tunnel x={40} y={860} w={440} h={470} />
            <rect x={0} y={1280} width={1080} height={14} fill={C.dim} opacity={0.7} />
            <Sun x={880} y={420} r={82} t={sunT} rot={f * 0.15} rays={10} />
            <ellipse cx={carX} cy={1290} rx={180} ry={16} fill="#000000" opacity={0.35 * carT} />
            <Car x={carX} y={1250} s={1.1} o={carT} tilt={sneezeShake} />
            <Txt x={carX} y={1060} text="HAPTSI!" size={64} color={C.sun} o={ramp(f, q.terang, 8) * fade(f, q.terang + 26, 14)} display />
          </g>
        ) : null}
      </Svg>
    </Frame>
  );
};

// ------------------------------------------------------------------ 5 · jawaban
const Jawaban: React.FC<SceneVisualProps> = ({ scene, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    kacamata: ['kacamata', 1.53], bisa: ['bisa', 2.44], jadi: ['Jadi', 4.0],
    matahari: ['matahari', 4.56], kebetulan: ['kebetulan', 6.97], bersilangan: ['bersilangan', 9.19],
  });
  const glassesY = interpolate(pop(f, q.kacamata, 16), [0, 1], [240, 996]);
  const dim = ramp(f, q.bisa, 24); // kacamata meredam sinar
  const cableT = ramp(f, q.kebetulan, 30, Easing.inOut(Easing.cubic));
  const cross = pop(f, q.bersilangan, 12);
  const personSway = Math.sin(f / 42) * 1.3;
  return (
    <Frame style={style} lightAt={[540, 380]}>
      <Svg>
        {/* matahari meredup di balik kacamata: opacity-nya sendiri yang turun, bukan ditutup lingkaran gelap */}
        <g opacity={(1 - 0.35 * dim) * ramp(f, 0, 14)}>
          <g transform={`translate(540 380) scale(${1 + 0.02 * Math.sin(f / 30)}) translate(-540 -400)`}>
            <Sun x={540} y={380} r={105} t={1} rot={f * 0.1} />
          </g>
        </g>
        <ellipse cx={540} cy={1340} rx={200} ry={26} fill="#000000" opacity={0.35 * ramp(f, 0, 14)} />
        <g opacity={ramp(f, 0, 14)}>
          <Person x={540} y={1120} s={1.3} tilt={personSway} />
        </g>
        <Glasses x={540} y={glassesY} s={1.05} t={pop(f, q.kacamata, 10)} rot={personSway * 0.4} />
        {/* dua kabel saraf bersilangan */}
        <g opacity={cableT}>
          <path d="M 320 480 Q 540 620 760 760" fill="none" stroke={C.sun} strokeWidth={12} strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 * (1 - cableT)} />
          <path d="M 760 480 Q 540 620 320 760" fill="none" stroke={C.sky} strokeWidth={12} strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 * (1 - cableT)} />
          <Txt x={300} y={420} text="SARAF MATA" size={34} color={C.sunSoft} />
          <Txt x={780} y={420} text="SARAF HIDUNG" size={34} color={C.sky} />
          {cross > 0 ? (
            <g opacity={Math.min(1, cross)} transform={`translate(540 620) scale(${cross})`}>
              <circle r={34 + 8 * Math.sin(f / 15)} fill="none" stroke={C.sunSoft} strokeWidth={6} />
              <circle r={34} fill="none" stroke={C.sunSoft} strokeWidth={6} />
              <circle r={16} fill={C.sunSoft} />
            </g>
          ) : null}
        </g>
      </Svg>
    </Frame>
  );
};

export const VISUALS: SceneVisuals = {
  hook: Hook,
  konteks: Konteks,
  mekanisme: Mekanisme,
  dampak: Dampak,
  jawaban: Jawaban,
};
