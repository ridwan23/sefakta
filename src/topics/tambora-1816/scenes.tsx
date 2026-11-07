import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import { cueFrames } from '../../shared/episode/cues';
import { ISO, mixView, screenArc, WorldMap, type LonLat, type MapView } from '../../shared/maps/WorldMap';
import { hash } from '../../shared/motion';
import { Book, C, SERIF, Cloud, interpolateHex, MapLabel, Paper, Plume, Pulse, pop, ramp, Rain, Snow, Stamp, Sun, Volcano, Wheat } from './parts';

/** Visual per scene (kunci = id scene di briefs/tambora-1816.json). Animasi dipicu oleh waktu kata dari caption
 *  hasil alignment (cueFrames); angka detik di setiap cue hanya cadangan sebelum `npm run align`. */

const TAMBORA: LonLat = [118.0, -8.25];
const GENEVA: LonLat = [6.14, 46.2];
const EUROPE = [ISO.uk, ISO.ireland, ISO.france, ISO.germany, ISO.switzerland, ISO.italy, ISO.spain, ISO.portugal, ISO.belgium, ISO.netherlands, ISO.luxembourg, ISO.austria, ISO.czechia, ISO.poland, ISO.denmark, ISO.norway, ISO.sweden, ISO.hungary, ISO.slovakia, ISO.slovenia, ISO.croatia];
const NORTH_AMERICA = [ISO.usa, ISO.canada];
const WIDE: MapView = { center: [64, 22], scale: 400 };
const HOOK_END: MapView = { center: [64, 20], scale: 430 };
const paint = (ids: readonly string[], color: string) => Object.fromEntries(ids.map((id) => [id, color]));

// ------------------------------------------------------------------ hook: dari Sumbawa ke Eropa
const Hook: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { indo: ['Indonesia', 0.43], eropa: ['Eropa', 1.68], hilang: ['kehilangan', 2.31], frank: ['Frankenstein', 5.18] });
  const view = mixView(WIDE, HOOK_END, ramp(f, 0, 6 * fps, Easing.inOut(Easing.sin)));
  const cold = ramp(f, q.hilang, 18);
  const arc = ramp(f, q.eropa - 6, 22, Easing.inOut(Easing.cubic));
  return (
    <Paper>
      <WorldMap view={view} land={C.land} border={C.inkSoft} ocean={C.paper} graticule="rgba(43,33,24,0.08)" highlight={{ ...paint(EUROPE, interpolateHex(C.land, C.coldSoft, cold)), [ISO.indonesia]: '#E8C9A0' }}>
        {(p) => {
          const a = p(TAMBORA)!, b = p(GENEVA)!;
          return (
            <>
              <svg style={{ position: 'absolute' }} width={1080} height={1920}>
                <path d={screenArc(a, b, 260, arc)} fill="none" stroke={C.ember} strokeWidth={7} strokeDasharray="20 14" strokeLinecap="round" />
              </svg>
              <Pulse x={a[0]} y={a[1]} f={f} />
              <MapLabel x={a[0] - 10} y={a[1] + 70} text="SUMBAWA" o={ramp(f, q.indo, 10)} size={38} />
              <MapLabel x={b[0] + 30} y={b[1] + 80} text="EROPA" o={ramp(f, q.eropa, 10)} size={44} color={C.cold} align="left" />
              <Sun x={b[0] + 120} y={b[1] - 200} r={58} dim={cold} spin={f * 0.4} />
              <Cloud x={b[0] + 215} y={b[1] - 120 + (1 - cold) * -40} s={1.1 * cold} o={cold} fill="#D9D3C6" />
            </>
          );
        }}
      </WorldMap>
      <Book x={330} y={1260} w={240} title="FRANKENSTEIN" t={pop(f, q.frank, 14)} rotate={-7} />
    </Paper>
  );
};

// ------------------------------------------------------------------ konteks: zoom ke Sumbawa, letusan, korban
const Konteks: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { april: ['April', 0.17], sumbawa: ['Sumbawa', 2.97], meletus: ['meletus', 3.5], terbesar: ['terbesar', 4.65], sepuluh: ['sepuluh', 6.89] });
  const zoom = ramp(f, 0, q.sumbawa + 6, Easing.inOut(Easing.cubic));
  const view = mixView(HOOK_END, { center: [118.0, -8.0], scale: 9000 }, zoom);
  const erupt = ramp(f, q.meletus, 14);
  const rise = ramp(f, q.meletus + 4, q.terbesar - q.meletus + 30, Easing.out(Easing.quad));
  const count = Math.round(interpolate(f, [q.sepuluh, q.sepuluh + 22], [0, 10000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const shake = f >= q.meletus && f < q.meletus + 10 ? (f % 2 === 0 ? 1 : -1) * 8 * (1 - (f - q.meletus) / 10) : 0;
  return (
    <Paper>
      <AbsoluteFill style={{ opacity: 1 - erupt * 0.8 }}>
        <WorldMap view={view} land={C.land} border={C.inkSoft} ocean={C.paper} graticule="rgba(43,33,24,0.08)" highlight={{ [ISO.indonesia]: '#E8C9A0' }}>
          {(p) => {
            const a = p(TAMBORA)!;
            return (
              <>
                <Pulse x={a[0]} y={a[1]} f={f} r={16} />
                <MapLabel x={a[0]} y={a[1] + 90} text="PULAU SUMBAWA" o={ramp(f, q.sumbawa, 10)} size={42} />
              </>
            );
          }}
        </WorldMap>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: erupt, transform: `translate(${shake}px, ${(1 - erupt) * 120}px)` }}>
        <Plume x={540} base={1010} top={440} t={rise} f={f} width={430} />
        <Volcano x={540} y={1440} w={820} h={430} glow={erupt} />
        <MapLabel x={540} y={1490} text="GUNUNG TAMBORA" size={36} o={erupt} />
      </AbsoluteFill>
      <Stamp x={540} y={250} text="APRIL 1815" t={pop(f, q.april, 12)} size={70} />
      {f >= q.sepuluh ? (
        <div style={{ position: 'absolute', left: 540, top: 1230, transform: `translate(-50%,-50%) scale(${interpolate(pop(f, q.sepuluh, 12), [0, 1], [0.7, 1])})`, background: 'rgba(243,234,215,0.95)', border: `5px solid ${C.ink}`, borderRadius: 18, padding: '18px 36px', textAlign: 'center' }}>
          <div style={{ fontFamily: SERIF, color: C.ember, fontWeight: 900, fontSize: 92, lineHeight: 1 }}>±{count.toLocaleString('id-ID')}</div>
          <div style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700, fontSize: 36, letterSpacing: 4, marginTop: 6 }}>JIWA, SEKETIKA</div>
        </div>
      ) : null}
    </Paper>
  );
};

// ------------------------------------------------------------------ mekanisme: belerang → stratosfer → kabut global
const HAZE = Array.from({ length: 70 }, (_, i) => ({ x: hash(i * 2.3), y: 300 + hash(i * 6.1) * 280, r: 5 + hash(i * 3.7) * 6 }));
const Mekanisme: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { strato: ['stratosfer', 2.3], awan: ['awan', 3.65], kabut: ['kabut', 6.31], keliling: ['mengelilingi', 7.66], pantul: ['memantulkan', 8.84], kurang: ['berkurang', 12.72] });
  const gas = ramp(f, 0, q.strato + 10, Easing.out(Easing.quad));
  const spread = ramp(f, q.kabut, 40, Easing.inOut(Easing.cubic));
  const toGlobe = ramp(f, q.keliling - 4, 16, Easing.inOut(Easing.cubic));
  const wrap = ramp(f, q.keliling, 70, Easing.inOut(Easing.cubic));
  const bounce = ramp(f, q.pantul, 36, Easing.inOut(Easing.cubic));
  const shade = ramp(f, q.kurang - 6, 24);
  const gx = 540, gy = 1010, gr = 300;
  const rot = 118 - (f - q.keliling) * 0.18;
  const latBand = 12 + 48 * wrap, lonBand = 25 + 155 * wrap;
  const sun = { x: 170, y: 330 };
  const ux0 = gx - sun.x, uy0 = gy - sun.y, ul = Math.hypot(ux0, uy0), ux = ux0 / ul, uy = uy0 / ul, px = -uy, py = ux;
  const R = gr + 26;
  // sinar sejajar dari arah Matahari; 3 dipantulkan cangkang kabut, 2 tembus melemah ke permukaan
  const rays = [-190, -95, 0, 95, 190].map((off, i) => {
    const start = { x: sun.x + px * off * 0.35 + ux * 100, y: sun.y + py * off * 0.35 + uy * 100 };
    const ox = start.x - gx, oy = start.y - gy, b = ox * ux + oy * uy, c = ox * ox + oy * oy - R * R, disc = b * b - c;
    const tHit = disc > 0 ? -b - Math.sqrt(disc) : ul - R;
    const hit = { x: start.x + ux * tHit, y: start.y + uy * tHit };
    const nx = (hit.x - gx) / R, ny = (hit.y - gy) / R, dot = ux * nx + uy * ny;
    return { start, hit, out: { x: hit.x + (ux - 2 * dot * nx) * 260, y: hit.y + (uy - 2 * dot * ny) * 260 }, inner: { x: hit.x + ux * 70, y: hit.y + uy * 70 }, reflected: i % 2 === 0 };
  });
  return (
    <Paper>
      {/* diagram lapisan udara */}
      <AbsoluteFill style={{ opacity: 1 - toGlobe }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 260, height: 340, background: 'rgba(62,95,138,0.12)', borderTop: `4px dashed ${C.cold}`, borderBottom: `4px dashed ${C.cold}` }} />
        <MapLabel x={60} y={300} text="STRATOSFER" o={ramp(f, q.strato, 10)} size={46} color={C.cold} align="left" />
        <Plume x={540} base={1180} top={420} t={gas} f={f} width={300} />
        {[150, 420, 690, 950].map((x, i) => <Cloud key={x} x={x} y={900 + (i % 2) * 40} s={1.15} />)}
        <MapLabel x={60} y={1010} text="awan hujan" o={ramp(f, q.awan, 10)} size={38} align="left" />
        <svg style={{ position: 'absolute' }} width={1080} height={1920}>
          {HAZE.map((h, i) => {
            const x = 540 + (h.x - 0.5) * 1100 * spread;
            return <circle key={i} cx={x} cy={h.y} r={h.r * Math.min(1, spread * 3)} fill="#7A6A55" opacity={0.6 * Math.min(1, spread * 4)} />;
          })}
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1380, bottom: 0, background: C.landDim, borderTop: `5px solid ${C.ink}` }} />
        <Volcano x={540} y={1390} w={560} h={230} glow={1} />
      </AbsoluteFill>
      {/* globe + kabut yang membungkus + sinar memantul */}
      <AbsoluteFill style={{ opacity: toGlobe }}>
        <WorldMap kind="orthographic" view={{ center: [rot, 5], scale: gr }} width={1080} height={2020} style={{ left: gx - 540, top: gy - 1010 }} land={C.land} border={C.inkSoft} ocean="#DCE3E6" graticule="rgba(43,33,24,0.10)">
          {(p) => (
            <svg style={{ position: 'absolute' }} width={1080} height={2020}>
              {Array.from({ length: 36 }, (_, i) => Array.from({ length: 13 }, (_, j) => {
                const lon = TAMBORA[0] - 180 + i * 10, lat = -60 + j * 10;
                const dLon = Math.abs(((lon - TAMBORA[0] + 540) % 360) - 180);
                if (Math.abs(lat - TAMBORA[1]) > latBand || dLon > lonBand) return null;
                const xy = p([lon + hash(i * 13 + j) * 6, lat + hash(j * 7 + i) * 5]);
                return xy ? <circle key={`${i}-${j}`} cx={xy[0]} cy={xy[1]} r={18} fill="#6E5E4A" opacity={0.28} /> : null;
              }))}
            </svg>
          )}
        </WorldMap>
        <svg style={{ position: 'absolute' }} width={1080} height={1920}>
          <circle cx={gx} cy={gy} r={gr + 26} fill="none" stroke="#8C7B62" strokeWidth={30} opacity={0.35 * wrap} />
          <circle cx={gx} cy={gy} r={gr} fill={C.ink} opacity={0.38 * shade} />
          {rays.map((r, i) => {
            const k1 = Math.min(1, bounce * 2), k2 = Math.max(0, bounce * 2 - 1);
            const ex = r.start.x + (r.hit.x - r.start.x) * k1, ey = r.start.y + (r.hit.y - r.start.y) * k1;
            return (
              <g key={i} stroke={C.sun} strokeWidth={8} strokeLinecap="round" fill="none" opacity={bounce > 0 ? 1 : 0}>
                <line x1={r.start.x} y1={r.start.y} x2={ex} y2={ey} />
                {k2 > 0 && r.reflected ? <line x1={r.hit.x} y1={r.hit.y} x2={r.hit.x + (r.out.x - r.hit.x) * k2} y2={r.hit.y + (r.out.y - r.hit.y) * k2} strokeDasharray="16 12" strokeWidth={10} /> : null}
                {k2 > 0 && !r.reflected ? <line x1={r.hit.x} y1={r.hit.y} x2={r.hit.x + (r.inner.x - r.hit.x) * k2} y2={r.hit.y + (r.inner.y - r.hit.y) * k2} opacity={0.5} /> : null}
              </g>
            );
          })}
        </svg>
        <Sun x={sun.x} y={sun.y} r={70} spin={f * 0.3} />
        <MapLabel x={gx} y={gy + gr + 90} text="KABUT SULFAT" o={ramp(f, q.keliling + 10, 12)} size={40} color={C.sepia} />
      </AbsoluteFill>
    </Paper>
  );
};

// ------------------------------------------------------------------ dampak: 1816 di Eropa & Amerika Utara
const Dampak: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { tahun: ['seribu', 1.5], eropa: ['Eropa', 2.95], amerika: ['Amerika', 3.49], dingin: ['dingin', 4.51], gelap: ['gelap', 5.08], basah: ['basah', 5.68], salju: ['salju', 7.42], panen: ['Panen', 9.04], gagal: ['gagal', 9.34], julukan: ['dijuluki', 12.91] });
  const view = mixView({ center: [-28, 47], scale: 500 }, { center: [-28, 48], scale: 540 }, ramp(f, 0, 14 * fps, Easing.inOut(Easing.sin)));
  const eu = ramp(f, q.eropa, 14), na = ramp(f, q.amerika, 14);
  const mercury = interpolate(ramp(f, q.dingin, 24), [0, 1], [0.72, 0.18]);
  const rain = ramp(f, q.basah, 10) * (1 - ramp(f, q.salju, 12));
  const snow = ramp(f, q.salju, 14);
  const wilt = ramp(f, q.gagal, 30, Easing.inOut(Easing.cubic));
  const crops = ramp(f, q.panen - 4, 12);
  return (
    <Paper dim={0.16 * ramp(f, q.gelap, 16)}>
      <WorldMap view={view} land={C.land} border={C.inkSoft} ocean={C.paper} graticule="rgba(43,33,24,0.08)" highlight={{ ...paint(EUROPE, interpolateHex(C.land, C.coldSoft, eu)), ...paint(NORTH_AMERICA, interpolateHex(C.land, C.coldSoft, na)) }}>
        {(p) => {
          const g = p(GENEVA)!, ne = p([-74, 43])!;
          return (
            <>
              <MapLabel x={g[0]} y={g[1] - 150} text="EROPA" o={eu} size={46} color={C.cold} />
              <MapLabel x={Math.max(250, ne[0])} y={ne[1] - 210} text="AMERIKA UTARA" o={na} size={40} color={C.cold} />
            </>
          );
        }}
      </WorldMap>
      <Rain f={f} o={rain * 0.8} area={[0, 420, 1080, 1000]} />
      <Snow f={f} o={snow} area={[0, 420, 1080, 1000]} />
      {/* termometer di atas Atlantik */}
      <svg style={{ position: 'absolute', opacity: ramp(f, q.dingin - 8, 10) * (1 - ramp(f, q.julukan - 4, 10)) }} width={1080} height={1920}>
        <rect x={505} y={700} width={70} height={420} rx={35} fill="#FBF6EA" stroke={C.ink} strokeWidth={6} />
        <rect x={525} y={720 + 380 * (1 - mercury)} width={30} height={380 * mercury} rx={15} fill={interpolateHex(C.ember, C.cold, ramp(f, q.dingin, 24))} />
        <circle cx={540} cy={1150} r={52} fill={interpolateHex(C.ember, C.cold, ramp(f, q.dingin, 24))} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={580} x2={610} y1={760 + i * 80} y2={760 + i * 80} stroke={C.ink} strokeWidth={4} />)}
      </svg>
      <div style={{ opacity: crops }}>
        {Array.from({ length: 9 }, (_, i) => <Wheat key={i} i={i} x={110 + i * 107} y={1450} h={210 + hash(i * 9.1) * 50} wilt={wilt} />)}
      </div>
      <Stamp x={540} y={250} text="1816" t={pop(f, q.tahun, 12)} size={86} color={C.cold} rotate={-4} />
      <Stamp x={540} y={980} text={'TAHUN TANPA\nMUSIM PANAS'} t={pop(f, q.julukan, 14)} size={82} rotate={-7} />
    </Paper>
  );
};

// ------------------------------------------------------------------ jawaban: Danau Jenewa → Frankenstein → kembali ke Sumbawa
const Jawaban: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { danau: ['Danau', 0.38], mary: ['Mary', 2.45], byron: ['Byron', 4.27], hantu: ['hantu', 6.47], frank: ['Frankenstein', 7.96], ternyata: ['ternyata', 10.01], sumbawa: ['Sumbawa', 11.79] });
  const book = pop(f, q.frank, 16);
  const toMap = ramp(f, q.ternyata - 6, 18, Easing.inOut(Easing.cubic));
  const arc = ramp(f, q.ternyata + 6, q.sumbawa - q.ternyata + 4, Easing.inOut(Easing.cubic));
  const ghost = ramp(f, q.hantu - 6, 40, Easing.out(Easing.quad));
  const glow = 0.55 + 0.45 * ramp(f, q.mary, 12) + Math.sin(f / 5) * 0.05;
  return (
    <Paper dim={0.1}>
      <AbsoluteFill style={{ opacity: 1 - toMap }}>
        <svg style={{ position: 'absolute' }} width={1080} height={1920}>
          {/* pegunungan */}
          <polygon points="0,900 140,640 260,760 400,560 560,780 700,600 860,770 1080,620 1080,900" fill={C.landDim} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <polygon points="400,560 450,640 420,630 380,600" fill="#FBF6EA" />
          <polygon points="700,600 745,665 690,650 665,640" fill="#FBF6EA" />
          {/* danau */}
          <rect x={0} y={900} width={1080} height={300} fill={C.coldSoft} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={60 + hash(i) * 800} x2={160 + hash(i) * 800} y1={950 + i * 24} y2={950 + i * 24} stroke={C.cold} strokeWidth={4} opacity={0.6} />)}
          {/* tepi & rumah */}
          <rect x={0} y={1200} width={1080} height={720} fill={C.land} stroke={C.ink} strokeWidth={5} />
          <polygon points="560,1060 780,930 1000,1060" fill="#7A4A2C" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={590} y={1060} width={380} height={250} fill="#EFE3C8" stroke={C.ink} strokeWidth={6} />
          {[640, 750, 860].map((x, i) => (
            <rect key={x} x={x} y={1110} width={70} height={90} fill={interpolateHex('#6B5B45', '#F2B544', i === 1 ? glow : glow * 0.7)} stroke={C.ink} strokeWidth={5} />
          ))}
          <rect x={745} y={1220} width={70} height={90} fill="#5A3A22" stroke={C.ink} strokeWidth={5} />
          {/* hantu dari jendela */}
          {ghost > 0 ? (
            <g opacity={Math.min(1, ghost * 2) * (1 - book)} transform={`translate(${785 - ghost * 260} ${1120 - ghost * 520}) scale(${1 + ghost * 0.9})`}>
              <path d="M -50 40 L -50 -20 A 50 50 0 0 1 50 -20 L 50 40 L 30 25 L 10 40 L -10 25 L -30 40 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <circle cx={-18} cy={-15} r={7} fill={C.ink} />
              <circle cx={18} cy={-15} r={7} fill={C.ink} />
            </g>
          ) : null}
        </svg>
        <Rain f={f} o={0.85} count={120} area={[0, 0, 1080, 1450]} />
        <MapLabel x={540} y={340} text="DANAU JENEWA · 1816" o={ramp(f, q.danau, 12)} size={50} />
        <MapLabel x={330} y={1300} text="Mary Shelley" o={ramp(f, q.mary, 10) * (1 - book)} size={44} color={C.ember} />
        <MapLabel x={330} y={1370} text="Lord Byron" o={ramp(f, q.byron, 10) * (1 - book)} size={44} color={C.ember} />
        <Book x={540} y={1000} w={400} title="FRANKENSTEIN" sub="Mary Shelley" t={book} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: toMap }}>
        <WorldMap view={WIDE} land={C.land} border={C.inkSoft} ocean={C.paper} graticule="rgba(43,33,24,0.08)" highlight={{ ...paint(EUROPE, C.coldSoft), [ISO.indonesia]: '#E8C9A0' }}>
          {(p) => {
            const a = p(TAMBORA)!, b = p(GENEVA)!;
            return (
              <>
                <svg style={{ position: 'absolute' }} width={1080} height={1920}>
                  <path d={screenArc(a, b, 260, arc)} fill="none" stroke={C.ember} strokeWidth={8} strokeDasharray="20 14" strokeLinecap="round" />
                </svg>
                <Pulse x={a[0]} y={a[1]} f={f} />
                <MapLabel x={a[0] - 10} y={a[1] + 70} text="SUMBAWA" size={38} />
                <Book x={b[0] + 70} y={b[1] + 130} w={120} title="FRANKENSTEIN" t={toMap * pop(f, q.ternyata, 14)} />
              </>
            );
          }}
        </WorldMap>
      </AbsoluteFill>
    </Paper>
  );
};

export const VISUALS: SceneVisuals = { hook: Hook, konteks: Konteks, mekanisme: Mekanisme, dampak: Dampak, jawaban: Jawaban };
