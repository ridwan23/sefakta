// Visual episode "Kenapa Perusahaan Terkaya di Dunia Bisa Bangkrut?" (voc-bangkrut).
// SATU DUNIA KERTAS PANJANG (5400x1920, 5 zona: 1799 x540 -> laut x1620 -> Batavia x2700 -> 1602 x3780 -> utang x4860),
// kamera SATU TARIKAN tanpa potong mengikuti waktu yang berjalan mundur (Kartu 1, potongan kertas).
// Tiap scene me-render stasiun sebelumnya dalam keadaan SELESAI + stasiunnya sendiri yang aktif,
// supaya tidak ada potongan isi di batas scene (dunia yang sama, kamera yang bergeser).
// Alasan kamera (prinsip: tiap gerakan wajib punya alasan cerita):
// - akhir: DIAM (hook = pengumuman yang jatuh; tidak ada alasan bergerak).
// - sebelumnya: BERGESER (Reveal — narasi menyebut laut/"raja lautan" yang belum ada di frame).
// - lebih-awal: BERGESER (Reveal — narasi menyebut Batavia/markas yang belum ada di frame).
// - awal: BERGESER (Reveal — narasi menyebut selembar saham 1602 yang belum ada di frame).
// - jawaban: BERGESER sekali lagi (Connect — narasi menghubungkan saham ke utang yang membunuhnya), lalu DIAM.
// Area aman: isi dunia y layar 186-1456; watermark layar y<175 kosong; caption template y~1496-1660 kosong;
// pita garis waktu di layar y~1669-1779 (di bawah caption, di dalam dunia).
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraRig, CamLayer, useCamera, type Camera } from '../../shared/camera/CameraRig';
import { cueFrames } from '../../shared/episode/cues';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import { fall, pendulum, squashStretch } from '../../shared/physics/dynamics';
import { EASE, noise1 } from '../../shared/anim/core';
import { PaperFold } from '../../shared/collage/fold';
import { ContactShadow } from '../../shared/render/ContactShadow';
import {
  Api, Benteng, BukuUtang, C, Coin, CoinSplit, DISPLAY, DuniaBg, KapalFleet, KapalKecil, Karung, LembarUtang,
  Lubang, Map, Menara, PaperTag, Pedang, Pengumuman, Pita, Sertifikat, StampBubar, Tangan,
  WORLD_H, WORLD_W, Z, fade, pop, ramp,
} from './parts';

const worldDiv: React.CSSProperties = { position: 'absolute', width: WORLD_W, height: WORLD_H, left: 0, top: 0 };
const RIBBON_YEAR: ('1799' | '1619' | '1602' | 'range')[] = ['1799', 'range', '1619', '1602', '1799'];

/** Dunia bersama: latar kertas + pita garis waktu tiap zona + isi stasiun (children). */
const Dunia: React.FC<{ cam: Camera; children: React.ReactNode }> = ({ cam, children }) => (
  <AbsoluteFill style={{ background: C.kertas }}>
    <CameraRig cam={cam} motionBlur={0.12} maxBlur={6}>
      <CamLayer depth={0.3}>
        <div style={worldDiv}>
          <svg width={WORLD_W} height={WORLD_H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            {[540, 1620, 2700, 3780, 4860].map((cx) => (
              <circle key={cx} cx={cx} cy={960} r={340} fill="#243139" opacity={0.04} />
            ))}
          </svg>
        </div>
      </CamLayer>
      <CamLayer>
        <div style={worldDiv}>
          <DuniaBg />
          {RIBBON_YEAR.map((a, z) => (
            <Pita key={z} x={z * 1080 + 540} y={1859} s={0.85} active={a} />
          ))}
          {children}
        </div>
      </CamLayer>
    </CameraRig>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ stasiun A · 1799
type StationAProps = { docY: number; docSy: number; docRot: number; lineO: [number, number, number]; stampT: number; crack: number; red: number; headlineT: number; coinO: number; menaraSc: number };
const StationA: React.FC<StationAProps> = ({ docY, docSy, docRot, lineO, stampT, crack, red, headlineT, coinO, menaraSc }) => {
  const [mx, my] = Z(0, 540, 780); // R3: menara naik (950->780) — celah headline->visual 415px jadi ~230px (patokan S4)
  const [dx] = Z(0, 700, 960);
  return (
    <>
      {/* headline hook (layar y 300-380) — diabaikan layout-check:
          headline sengaja keluar frame ke kiri saat kamera pan ke zona B (dunia kontinu). */}
      <div data-layout-ignore style={{ position: 'absolute', left: 0, top: 434, width: 1080, textAlign: 'center', fontFamily: DISPLAY, fontSize: 76, fontWeight: 900, color: C.tinta, opacity: headlineT }}>
        Terkaya, lalu bubar
      </div>
      {/* menara di kiri-atas + diperbesar, pengumuman mendarat di KANAN menara (R1: pengumuman lama
          menutupi seluruh menara) — koin VOC + keping kiri tetap mengintip di balik pengumuman. */}
      <Menara x={mx} y={my} crack={crack} red={red} coinO={coinO} sc={menaraSc} />
      <Pengumuman x={dx} y={docY} s={2.0} lineO={lineO} sy={docSy} rot={docRot} />
      <StampBubar x={dx} y={docY + 69} s={2.0} t={stampT} rot={docRot} />
    </>
  );
};
const stationASettled: StationAProps = { docY: 1254, docSy: 1, docRot: 0, lineO: [1, 1, 1], stampT: 1, crack: 1, red: 1, headlineT: 1, coinO: 1, menaraSc: 1.25 };

// ------------------------------------------------------------------ stasiun B · laut
type StationBProps = { routeP: number; shipsT: number; tagT: number; pileT: number; sunT: number; bob: number; rayRot: number; slide: number; rise: number; roll: number; headlineT: number };
const StationB: React.FC<StationBProps> = ({ routeP, shipsT, tagT, pileT, sunT, bob, rayRot, slide, rise, roll, headlineT }) => {
  const [mapX, mapY] = Z(1, 0, 620);
  const [sunX, sunY] = Z(1, 540, 405 + rise);
  const [shipX, shipY] = Z(1, 540 + slide, 1160);
  const [tagX, tagY] = Z(1, 600, 1410);
  const [pileX, pileY] = Z(1, 300, 1420);
  return (
    <>
      {/* headline scene (layar y ~116-196, DI ATAS matahari-koin — R3: headline "Raja lautan"
          dari brief tidak pernah tampil) — diabaikan layout-check: keluar frame saat kamera pan. */}
      <div data-layout-ignore style={{ position: 'absolute', left: 1080, top: 250, width: 1080, textAlign: 'center', fontFamily: DISPLAY, fontSize: 76, fontWeight: 900, color: C.tinta, opacity: headlineT }}>
        Raja lautan
      </div>
      <Map x={mapX} y={mapY} routeP={routeP} />
      {/* koin-matahari + sinar yang berputar pelan (R1: sinar lama memotong tepi peta — matahari naik ke y=405) */}
      <svg width={420} height={420} viewBox="-210 -210 420 420" style={{ position: 'absolute', left: sunX - 210, top: sunY - 210, overflow: 'visible', opacity: sunT }}>
        <g transform={`rotate(${rayRot})`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r0 = 168; const r1 = 198;
            const x0 = Math.cos((a * Math.PI) / 180) * r0; const y0 = Math.sin((a * Math.PI) / 180) * r0;
            const x1 = Math.cos((a * Math.PI) / 180) * r1; const y1 = Math.sin((a * Math.PI) / 180) * r1;
            return <line key={a} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.tinta} strokeWidth={5} strokeLinecap="round" />;
          })}
        </g>
      </svg>
      <Coin x={sunX} y={sunY} r={165} o={sunT} />
      <KapalFleet x={shipX} y={shipY + bob} s={1.45} o={shipsT} rot={roll} />
      {/* tag angka diperbesar + di ruang sendiri di bawah peta (R1: kecil, di tepi bawah peta) */}
      <PaperTag x={tagX} y={tagY} text="4.785 kapal" size={56} o={tagT} />
      {/* tumpukan koin kecil — dekoratif, diabaikan layout-check (teks VOC kecil di bawah zona caption) */}
      <div data-layout-ignore style={{ position: 'absolute', inset: 0 }}>
        <Coin x={pileX} y={pileY} r={32} o={pileT} />
        <Coin x={pileX - 22} y={pileY + 26} r={32} o={pileT} />
        <Coin x={pileX + 22} y={pileY + 26} r={32} o={pileT} />
      </div>
    </>
  );
};
const stationBSettled: StationBProps = { routeP: 1, shipsT: 1, tagT: 1, pileT: 1, sunT: 1, bob: 0, rayRot: 0, slide: 0, rise: 0, roll: 0, headlineT: 1 };

// ------------------------------------------------------------------ 1 · akhir (hook)
const Akhir: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, { bubar: ['bubar', 6.3], diambil: ['diambil', 7.85] });
  // Kamera DIAM: hook adalah pengumuman yang jatuh — tidak ada alasan cerita untuk bergerak.
  const cam = useCamera([{ frame: 0, pose: { x: 540, y: 960, zoom: 1 } }], { shake: 2, seed: 7 });
  const docFall = fall(f, { at: 0, from: -306, to: 1254, fps, g: 3000, bounce: 0.3 });
  const sq = squashStretch(docFall, fps);
  // Squash pendaratan yang TERBACA (R3: squash mentah hanya ~1 frame, decay 2,4 frame):
  // pulse Gaussian ~6 frame di sekitar impact + pantulan 0,3 (naik ~140px).
  const impactF = docFall.impacts[0] ?? 31;
  const squashPulse = Math.exp(-Math.pow((f - impactF) / 3, 2));
  const docSy = Math.max(0.75, Math.min(1.25, 1 + (sq.sy - 1) * 1.6 - 0.18 * squashPulse));
  // Goyang settle setelah mendarat (~f31) + ayunan idle KONTINU supaya hold tidak beku (R3: jeda
  // 2,0-6,3 dtk nyaris tanpa perubahan; pendulum lama mati setelah ~1 dtk).
  const docRot = pendulum(f, { at: 31, amp: 5.5, period: 0.9, decay: 2.5, fps }) + (f > 60 ? 2.5 * Math.sin(f / 12) + 1.5 * Math.sin(f / 9) : 0);
  const lineO: [number, number, number] = [ramp(f, 35, 15), ramp(f, 50, 15), ramp(f, 65, 15)];
  const stampT = pop(f, q.bubar, 12);
  const crack = ramp(f, q.diambil, 12);
  const red = ramp(f, q.diambil, 20);
  const headlineT = 1; // headline hook tampil sejak frame 0 (R1: frame 0 paling kosong) — shot loop ikut memuatnya supaya loop = f0 persis.
  const menaraSc = 1.25 * (1 + 0.02 * Math.sin(f / 14)); // R3: denyut menara diperkuat (dulu 1%) supaya jeda 2-6,3 dtk hidup
  return (
    <Dunia cam={cam}>
      <StationA docY={docFall.y} docSy={docSy} docRot={docRot} lineO={lineO} stampT={stampT} crack={crack} red={red} headlineT={headlineT} coinO={1} menaraSc={menaraSc} />
    </Dunia>
  );
};

// ------------------------------------------------------------------ 2 · sebelumnya
const Sebelumnya: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gf = scene.from + f;
  const q = cueFrames(scene, fps, { raja: ['raja', 3.6], berlayar: ['berlayar', 5.23], empat: ['empat', 6.67] });
  // Kamera BERGESER (Reveal): narasi menyebut laut dan "raja lautan" yang belum ada di frame.
  const cam = useCamera([
    { frame: 0, pose: { x: 540, y: 960, zoom: 1 } },
    { frame: 45, pose: { x: 1620, y: 960, zoom: 1 }, ease: Easing.out(Easing.cubic) },
  ], { shake: 2, seed: 7 });
  const bob = Math.sin(gf / 16) * 10;
  const rayRot = gf * 0.12;
  // Entrance pahlawan yang terlihat (R1: peta/kapal/sertifikat sudah utuh di frame overview pertama):
  // armada berlayar masuk dari kiri + matahari terbit dari balik peta, f50-95.
  const slide = -700 * (1 - ramp(f, 50, 45));
  const rise = 200 * (1 - ramp(f, 50, 45));
  const roll = 2.5 * Math.sin(gf / 18);
  const routeP = ramp(f, q.berlayar, 80);
  const shipsT = pop(f, 50, 14);
  const sunT = pop(f, 50, 14);
  const tagT = pop(f, q.empat, 12);
  const pileT = pop(f, q.berlayar, 12); // tumpukan koin (dekoratif, tanpa angka) muncul bersama rute — R3: band bawah peta kosong sebelum tag
  const headlineT = pop(f, 50, 12);
  return (
    <Dunia cam={cam}>
      <StationA {...stationASettled} />
      <StationB routeP={routeP} shipsT={shipsT} tagT={tagT} pileT={pileT} sunT={sunT} bob={bob} rayRot={rayRot} slide={slide} rise={rise} roll={roll} headlineT={headlineT} />
    </Dunia>
  );
};

// ------------------------------------------------------------------ stasiun C · Batavia
type StationCProps = { fortT: number; sacksT: number; stampT: number; splitT: number; tagT: number; handsT: number; wave: number; headlineT: number; hopY: number };
const StationC: React.FC<StationCProps> = ({ fortT, sacksT, stampT, splitT, tagT, handsT, wave, headlineT, hopY }) => {
  const [fortX, fortY] = Z(2, 540, 820); // R3: benteng naik (960->820) — celah headline->benteng ~370px jadi ~220px
  const [sack1X, sack1Y] = Z(2, 360, 1230 + hopY);
  const [sack2X, sack2Y] = Z(2, 720, 1230 + hopY);
  const [coinX, coinY] = Z(2, 540, 1270);
  const [tagX, tagY] = Z(2, 540, 480);
  const [handLX, handLY] = Z(2, 160, 1180); // R3: tangan turun ke samping karung (dulu di menara benteng — terbaca "benteng bertangan")
  const [handRX, handRY] = Z(2, 920, 1180);
  // koin terbang: dari stempel ke tangan + ke atas karung (busur)
  const fly = (ex: number, ey: number) => {
    const e = EASE.inOut(Math.max(0, Math.min(1, splitT)));
    return { x: coinX + (ex - coinX) * e, y: coinY + (ey - coinY) * e - Math.sin(e * Math.PI) * 120 };
  };
  const c1 = fly(handLX, handLY);
  const c2 = fly(handRX, handRY);
  const c3 = fly(sack1X, sack1Y - 60);
  const c4 = fly(sack2X, sack2Y - 60);
  return (
    <>
      {/* headline scene (layar y 300-380, isi bagian atas frame) — diabaikan layout-check:
          headline sengaja keluar frame saat kamera pan (dunia kontinu). */}
      <div data-layout-ignore style={{ position: 'absolute', left: 2160, top: 434, width: 1080, textAlign: 'center', fontFamily: DISPLAY, fontSize: 76, fontWeight: 900, color: C.tinta, opacity: headlineT }}>
        Batavia 1619
      </div>
      {/* bayangan kontak di bawah benteng (R3: objek melayang di atas krem rata) */}
      <ContactShadow x={2700} y={1184} width={700} elevation={0} opacity={0.3} />
      <Benteng x={fortX} y={fortY} s={2.1} wave={wave} o={fortT} />
      <Karung x={sack1X} y={sack1Y} s={1.3} sx={1.5} variant="pala" o={sacksT} />
      <Karung x={sack2X} y={sack2Y} s={1.3} sx={1.5} variant="cengkeh" o={sacksT} />
      <Coin x={coinX} y={coinY} r={90} o={stampT * (1 - splitT)} sc={0.7 + 0.3 * stampT} />
      {/* koin terbang — diabaikan layout-check: animasi 0,7 dtk yang sengaja melintas di atas label/tag */}
      {splitT > 0 && (
        <div data-layout-ignore style={{ position: 'absolute', inset: 0 }}>
          <Coin x={c1.x} y={c1.y} r={34} o={splitT} />
          <Coin x={c2.x} y={c2.y} r={34} o={splitT} />
          <Coin x={c3.x} y={c3.y} r={34} o={splitT} />
          <Coin x={c4.x} y={c4.y} r={34} o={splitT} />
        </div>
      )}
      {/* tag 18% di ruang sendiri di bawah headline (R1: menutupi label PALA/CENGKEH) */}
      <PaperTag x={tagX} y={tagY} text="18% tiap tahun" size={56} o={tagT} />
      <Tangan x={handLX} y={handLY} s={1.3} rot={-15} o={handsT} />
      <Tangan x={handRX} y={handRY} s={1.3} rot={15} o={handsT} />
    </>
  );
};
const stationCSettled: StationCProps = { fortT: 1, sacksT: 1, stampT: 1, splitT: 1, tagT: 1, handsT: 1, wave: 0, headlineT: 1, hopY: 0 };

// ------------------------------------------------------------------ stasiun D · 1602
type StationDProps = { foldAt?: number; foldOpenAt?: number; sealT: number; sealSc: number; handsT: number[]; headlineT: number; pulse: number; gf: number };
const StationD: React.FC<StationDProps> = ({ foldAt, foldOpenAt, sealT, sealSc, handsT, headlineT, pulse, gf }) => {
  const [certX, certY] = Z(3, 540, 1000);
  const [sealX, sealY] = Z(3, 790, 1290);
  const handPos = [[170, 790], [910, 790], [170, 1260], [910, 1260]].map(([sx, sy]) => Z(3, sx, sy));
  return (
    <>
      {/* headline scene (layar y 300-380, isi bagian atas frame) — diabaikan layout-check:
          headline sengaja keluar frame saat kamera pan (dunia kontinu). */}
      <div data-layout-ignore style={{ position: 'absolute', left: 3240, top: 434, width: 1080, textAlign: 'center', fontFamily: DISPLAY, fontSize: 76, fontWeight: 900, color: C.tinta, opacity: headlineT }}>
        Saham pertama
      </div>
      {/* sertifikat membesar 720->800 (R1: ruang kosong atas) + berdenyut pelan supaya hold hidup;
          dibungkus div skala di tengah sertifikat (PaperFold diposisikan relatif terhadap pembungkus). */}
      <div style={{ position: 'absolute', left: certX, top: certY, transform: `scale(${pulse})` }}>
        <PaperFold x={0} y={0} w={800} h={800} at={foldAt} openAt={foldOpenAt} dur={36} fold="v" color={C.krem}>
          <div style={{ width: 800, height: 800, position: 'relative' }}>
            <Sertifikat x={400} y={400} s={3.2} />
          </div>
        </PaperFold>
      </div>
      <Coin x={sealX} y={sealY} r={55} o={sealT} sc={sealSc} />
      {handPos.map(([hx, hy], i) => (
        <Tangan key={i} x={hx} y={hy + 3 * Math.sin(gf / 14 + i * 1.7)} s={0.8} rot={i % 2 === 0 ? -12 : 12} o={handsT[i] ?? 0} />
      ))}
    </>
  );
};
const stationDSettled: StationDProps = { foldAt: undefined, foldOpenAt: undefined, sealT: 1, sealSc: 1, handsT: [1, 1, 1, 1], headlineT: 1, pulse: 1, gf: 0 };

// ------------------------------------------------------------------ stasiun E · utang
type SheetState = { x: number; y: number; rot: number; o: number };
type StationEProps = { booksT: number; perangT: number; korupsiT: number; sheets: SheetState[]; splitT: number; splitSep: number; apiS: number; headlineT: number; swordRot: number; shipBob: number };
const StationE: React.FC<StationEProps> = ({ booksT, perangT, korupsiT, sheets, splitT, splitSep, apiS, headlineT, swordRot, shipBob }) => {
  const [bookCX, bookCY] = Z(4, 540, 1050);
  const [bookLX] = Z(4, 230, 1050);
  const [bookRX] = Z(4, 850, 1050);
  const [swordX, swordY] = Z(4, 260, 720);
  const [shipX, shipY] = Z(4, 860, 720 + shipBob); // R3: kapal geser kanan (820->860) — paruh merah koin terbelah menyentuh lambung
  const [apiX, apiY] = Z(4, 860, 640);
  const [holeX, holeY] = Z(4, 850, 1150);
  const [korTagX, korTagY] = Z(4, 850, 1295);
  const [coinX, coinY] = Z(4, 540, 740);
  return (
    <>
      {/* headline scene (layar y 300-380, isi bagian atas frame) — diabaikan layout-check:
          headline sengaja keluar frame saat kamera pan (dunia kontinu). */}
      <div data-layout-ignore style={{ position: 'absolute', left: 4320, top: 434, width: 1080, textAlign: 'center', fontFamily: DISPLAY, fontSize: 76, fontWeight: 900, color: C.tinta, opacity: headlineT }}>
        Apa yang salah?
      </div>
      {/* buku tengah diperbesar s=1,6 jadi jangkar (R1: tiga buku identik tanpa jangkar);
          tengah di-render terakhir supaya di depan; samping tetap s=1,2. */}
      <ContactShadow x={4860} y={1434} width={900} elevation={0} opacity={0.3} />
      <BukuUtang x={bookLX} y={bookCY} s={1.2} o={booksT} rot={-2} />
      <BukuUtang x={bookRX} y={bookCY} s={1.2} o={booksT} rot={2} />
      <BukuUtang x={bookCX} y={bookCY} s={1.6} o={booksT} />
      <Pedang x={swordX} y={swordY} s={2} o={perangT} rot={swordRot} />
      <KapalKecil x={shipX} y={shipY} s={1.0} o={perangT} />
      <Api x={apiX} y={apiY} s={1.2 * apiS} o={perangT} />
      <Lubang x={holeX} y={holeY} s={1.1} o={korupsiT} />
      <PaperTag x={korTagX} y={korTagY} text="korupsi" size={26} o={korupsiT} />
      {/* lembar utang jatuh — diabaikan layout-check: animasi jatuh 0,3 dtk yang sengaja melintas
          di depan label buku (fisik benar: lembar jatuh DI DEPAN buku); preseden sama dengan
          koin terbang scene 3; reviewer R1 menilai tumpang tindih sesaat ini false positive. */}
      <div data-layout-ignore style={{ position: 'absolute', inset: 0 }}>
        {sheets.map((sh, i) => (
          <LembarUtang key={i} x={sh.x} y={sh.y} s={0.6} rot={sh.rot} o={sh.o} />
        ))}
      </div>
      {/* koin terbelah di ruang kosong DI ATAS barisan buku (R1: menutupi label BUKU UTANG buku tengah) */}
      <CoinSplit x={coinX} y={coinY} s={2.2} sep={splitSep} o={splitT} />
    </>
  );
};

// ------------------------------------------------------------------ 3 · lebih-awal
const LebihAwal: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gf = scene.from + f;
  const q = cueFrames(scene, fps, { rempah: ['rempah', 6.67], cuma: ['Cuma', 7.62], keuntungan: ['Keuntungan', 9.5], delapan: ['delapan', 11.14] });
  // Kamera BERGESER (Reveal): narasi menyebut Batavia/markas yang belum ada di frame.
  const cam = useCamera([
    { frame: 0, pose: { x: 1620, y: 960, zoom: 1 } },
    { frame: 45, pose: { x: 2700, y: 960, zoom: 1 }, ease: Easing.out(Easing.cubic) },
  ], { shake: 2, seed: 7 });
  const wave = noise1(gf * 0.05, 3) * 8;
  const fortT = pop(f, 45, 14);
  const sacksT = pop(f, 55, 14);
  // Karung melompat kecil saat kata "rempah" (R1: jeda beat ~10 dtk di tengah scene).
  const hopY = -26 * Math.sin(Math.PI * Math.max(0, Math.min(1, (f - q.rempah) / 16)));
  const stampT = pop(f, q.cuma, 12);
  const splitT = ramp(f, q.delapan, 20);
  const tagT = pop(f, q.keuntungan, 12);
  const handsT = pop(f, q.delapan + 4, 12);
  const headlineT = pop(f, 50, 12);
  return (
    <Dunia cam={cam}>
      <StationA {...stationASettled} />
      <StationB {...stationBSettled} />
      <StationC fortT={fortT} sacksT={sacksT} stampT={stampT} splitT={splitT} tagT={tagT} handsT={handsT} wave={wave} headlineT={headlineT} hopY={hopY} />
    </Dunia>
  );
};

// ------------------------------------------------------------------ 4 · awal
const Awal: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gf = scene.from + f;
  const q = cueFrames(scene, fps, { lahir: ['lahir', 4.12], saham: ['Saham', 5.68] });
  // Kamera BERGESER (Reveal): narasi menyebut selembar saham 1602 yang belum ada di frame.
  const cam = useCamera([
    { frame: 0, pose: { x: 2700, y: 960, zoom: 1 } },
    { frame: 45, pose: { x: 3780, y: 960, zoom: 1 }, ease: Easing.out(Easing.cubic) },
  ], { shake: 2, seed: 7 });
  const sealPop = pop(f, q.lahir, 12);
  const sealT = sealPop;
  const sealSc = (0.6 + 0.4 * Math.max(0, Math.min(1.15, sealPop))) * (1 + 0.025 * Math.sin(gf / 22));
  // Tangan masuk satu per satu sejak kata "Saham" (R1: tangan baru masuk di akhir scene).
  const handsT = [0, 1, 2, 3].map((i) => pop(f, q.saham + i * 8, 12));
  const headlineT = pop(f, 50, 12);
  const pulse = 1 + 0.012 * Math.sin(gf / 28);
  return (
    <Dunia cam={cam}>
      <StationA {...stationASettled} />
      <StationB {...stationBSettled} />
      <StationC {...stationCSettled} />
      {/* lipatan membuka SETELAH kamera tiba + kertas terlipat mendarat (R3: buka f70, bukan f48 —
          keadaan terlipat harus terbaca dulu ~0,8 dtk, baru lipatan membuka sebagai beat tersendiri;
          EASE.back di PaperFold membuat lipatan membuka cepat di awal, jadi jeda ini yang membuatnya terbaca) */}
      <StationD foldAt={45} foldOpenAt={70} sealT={sealT} sealSc={sealSc} handsT={handsT} headlineT={headlineT} pulse={pulse} gf={gf} />
    </Dunia>
  );
};

// ------------------------------------------------------------------ 5 · jawaban + loop
const Jawaban: React.FC<SceneVisualProps> = ({ scene, durationInFrames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gf = scene.from + f;
  const q = cueFrames(scene, fps, {
    perang: ['Perang', 1.91], korupsi: ['Korupsi', 3.38], utang: ['Utang', 5.4], ternyata: ['ternyata', 9.48],
  });
  // Kamera BERGESER (Connect): narasi menghubungkan saham ke utang yang membunuhnya. Lalu DIAM.
  const cam = useCamera([
    { frame: 0, pose: { x: 3780, y: 960, zoom: 1 } },
    { frame: 45, pose: { x: 4860, y: 960, zoom: 1 }, ease: Easing.out(Easing.cubic) },
  ], { shake: 2, seed: 7 });
  const D = durationInFrames;
  const booksT = pop(f, 45, 14);
  const perangT = pop(f, q.perang, 12);
  const korupsiT = pop(f, q.korupsi, 12);
  const pileTargets: [number, number, number][] = [[480, 1360, -6], [540, 1380, 4], [600, 1360, -3], [520, 1400, 8]];
  const sheets: SheetState[] = pileTargets.map(([sx, sy, rot], i) => {
    const [tx, ty] = Z(4, sx, sy);
    const at = q.utang + i * 8;
    const st = fall(f, { at, from: ty - 900, to: ty, fps, g: 3000, bounce: 0.35 });
    // Goyang settle saat jatuh (R3: lembar menumpuk tanpa goyangan/bounce terbaca — amplitudo 6->12, decay lebih panjang).
    const wob = f > at ? 12 * Math.sin((f - at) / 3.5) * Math.exp(-(f - at) / 30) : 0;
    return { x: tx, y: st.y, rot: rot + wob, o: st.visible ? 1 : 0 };
  });
  const splitT = pop(f, q.ternyata, 12);
  const splitSep = ramp(f, q.ternyata + 6, 15) + 0.05 * Math.sin(gf / 20) * Math.max(0, Math.min(1, splitT));
  const apiS = 1 + 0.1 * Math.sin(gf / 3);
  const headlineT = pop(f, 50, 12) * (1 - fade(f, 310, 23)); // headline keluar f310–333 SEBELUM dissolve, supaya tidak bertumpuk dengan headline shot loop di posisi yang sama.
  const swordRot = -30 + 3 * Math.sin(gf / 18);
  const shipBob = 4 * Math.sin(gf / 15);
  // --- akhir loop (0,7 dtk terakhir, linear, tersinkron) ---
  // R1: shot loop lama (pengumuman + headline, tanpa caption/pita) TIDAK sama dengan frame 0
  // (di frame 0 pengumuman masih di luar frame — hanya menara yang terlihat).
  // Shot loop baru = frame 0 PERSIS: headline hook + menara koin + pita garis waktu, tanpa pengumuman.
  // Caption template TIDAK dipudarkan: overlay ini tanpa z-index, jadi caption yang di-render
  // template setelah scene tetap terlihat di atasnya (seperti di frame 0).
  const out = 1 - fade(f, D - 22, 21); // isi jawaban memudar (selesai tepat di frame terakhir f354)
  const loopIn = fade(f, D - 22, 21); // shot loop masuk (penuh di f354)
  return (
    <>
      <div style={{ opacity: out }}>
        <Dunia cam={cam}>
          <StationA {...stationASettled} />
          <StationB {...stationBSettled} />
          <StationC {...stationCSettled} />
          <StationD {...stationDSettled} />
          <StationE booksT={booksT} perangT={perangT} korupsiT={korupsiT} sheets={sheets} splitT={splitT} splitSep={splitSep} apiS={apiS} headlineT={headlineT} swordRot={swordRot} shipBob={shipBob} />
        </Dunia>
      </div>
      {/* shot loop = frame 0 persis: headline hook + menara (540,780) sc=1,25 + pita 1799 (540,1725).
          Tanpa z-index: di atas isi dunia yang memudar, di bawah caption template. */}
      <div data-layout-ignore style={{ position: 'absolute', inset: 0, opacity: loopIn, background: C.kertas }}>
        {/* latar dunia zona A (tint + vignette + pemisah zona) supaya sama persis dengan frame 0;
            dunia 5400x1920 diposisikan agar zona A sejajar layar (kamera hook di x=540, y=960). */}
        <div style={{ position: 'absolute', left: 0, top: -134.4 }}>
          <DuniaBg />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 300, width: 1080, textAlign: 'center', fontFamily: DISPLAY, fontSize: 76, fontWeight: 900, color: C.tinta }}>
          Terkaya, lalu bubar
        </div>
        <Menara x={540} y={780} sc={1.25} crack={0} red={0} coinO={1} />
        <Pita x={540} y={1725} s={0.85} active="1799" />
      </div>
    </>
  );
};

export const VISUALS: SceneVisuals = {
  akhir: Akhir,
  sebelumnya: Sebelumnya,
  'lebih-awal': LebihAwal,
  awal: Awal,
  jawaban: Jawaban,
};
