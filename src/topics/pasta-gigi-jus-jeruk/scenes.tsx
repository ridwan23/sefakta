import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { cueFrames } from '../../shared/episode/cues';
import { FONT_JAKARTA } from '../../shared/brand/fonts';
import type { SceneVisualProps, SceneVisuals } from '../../shared/episode/types';
import { SketchPath, SketchText } from '../../shared/sketch';
import { Board, C, Check, Foam, GlassJuice, Membrane, Scale, StudyCard, Timer, Tongue, Toothbrush, Tube, pop, ramp } from './parts';

/** Visual episode "Kenapa Jus Jeruk Terasa Pahit Habis Sikat Gigi?".
 *  KAMERA TERKUNCI TOTAL di semua scene (Kartu 1: papan tulis, kamera kunci-statis) — semua "zoom"
 *  dilakukan objek yang membesar/mengecil, bukan kamera.
 *  Area aman: isi utama x 60–1020, y 560–1720 (headline template y 300–520, watermark x > 800, y < 175 kosong).
 *  Catatan papan di bawah tiap scene (y ~1700) mengisi sepertiga bawah; gelas jus (objek pahlawan) tampil di SEMUA scene. */

// ------------------------------------------------------------------ 1 · hook
const Hook: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    berubah: ['berubah', 2.45], total: ['total', 3.05],
  });
  // sikat gigi JATUH dari atas ke papan (frame 0–18), mendarat di samping gelas, memipih sesaat
  const fallY = interpolate(f, [0, 18], [-260, 820], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad),
  });
  const land = ramp(f, 18, 8);
  // squash 0,70 saat mendarat — terlihat jelas (review R1: squash lama 0,84 tidak terlihat)
  const squash = 1 - 0.3 * Math.sin(Math.min(1, land) * Math.PI);
  // jus berubah oranye cerah → kusam saat "berubah total" (payoff detik 1–2)
  const dull = ramp(f, q.berubah, 24, Easing.inOut(Easing.cubic));
  const stampT = pop(f, q.berubah + 6, 12);
  const foamT = pop(f, q.berubah + 14, 12);
  const idle = Math.sin(f / 28) * 3; // gelas bergoyang halus saat hold
  // gelembung naik pelan di dalam jus (hold tetap hidup)
  const bubbles = [0, 1, 2, 3].map((i) => ({
    x: 420 + ((i * 67) % 240),
    y: 1265 - ((f * 1.1 + i * 90) % 280),
    r: 5 + ((i * 3) % 4),
    o: 0.35 + 0.25 * Math.sin((f + i * 31) / 22),
  }));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Board />
      {/* bayangan kontak di bawah gelas — objek berpijak, bukan melayang */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        <ellipse cx={540} cy={1335} rx={250} ry={16} fill="#000000" opacity={0.16} />
      </svg>
      {/* gelas pahlawan SUDAH utuh di frame 0 (brief: "gelas jus yang sudah tergambar besar") —
          aksi frame 0 adalah sikat yang jatuh, bukan draw-in gelas */}
      <GlassJuice x={540} y={985 + idle} s={1.7} t={1} dull={dull} at={-20} />
      {/* gelembung di dalam jus */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        {bubbles.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="none" stroke={C.white} strokeWidth={3} opacity={b.o} />
        ))}
      </svg>
      <Toothbrush x={270} y={fallY} s={0.9} t={1} rot={-18} sy={squash} at={0} />
      {/* stempel PAHIT! dicap di bawah gelas setelah jus berubah — zona kosong bawah (di atas bibir
          gelas tidak muat tanpa menabrak zona headline/lemon/sedotan; sekaligus mengisi sepertiga bawah) */}
      {stampT > 0 ? (
        <SketchText x={540} y={1540} text="PAHIT!" at={q.berubah + 6} size={96} color={C.red} rotate={-8} />
      ) : null}
      <Foam x={800} y={600} s={0.65} t={foamT} at={q.berubah + 14} />
      {/* catatan papan — mengisi sepertiga bawah */}
      <SketchText x={540} y={1700} text="pagi ini: jus jeruk & sikat gigi" at={0} size={40} color={C.ink} rotate={-1} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2 · lebih-dekat
const LebihDekat: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    pagi: ['Pagi', 3.71], sikat: ['sikat', 4.54], lalu: ['lalu', 5.61],
    bukan: ['Bukan', 7.28], lidahmu: ['lidahmu', 8.94],
  });
  // gelas dibawa dari hook: besar + kusam, lalu mengecil ke pojok kiri atas saat "Bukan jusnya yang berubah"
  const shrink = ramp(f, q.bukan, 30, Easing.inOut(Easing.cubic));
  const glassX = interpolate(shrink, [0, 1], [540, 250]);
  const glassY = interpolate(shrink, [0, 1], [985, 650]);
  const glassS = interpolate(shrink, [0, 1], [1.7, 0.55]);
  const idle = Math.sin(f / 28) * 3;
  // sikat gigi MENYIKAT sejak "Pagi": naik-turun + goyang rotasi dengan amplitudo TERLIHAT (review R2:
  // gerak lama ±10 px/±6° tidak terbaca di still; jeda statis ini jatuh di zona drop retensi 5–10 dtk)
  const brushActive = ramp(f, q.pagi, 6) * (1 - ramp(f, q.pagi + 70, 12)) * (1 - ramp(f, q.bukan, 10));
  const brushY = 820 + Math.sin((f - q.pagi) / 2.5) * 15 * brushActive;
  const wiggle = Math.sin((f - q.pagi) / 2.5) * 8 * brushActive;
  // panah spidol dari sikat ke gelas, tergambar saat "lalu", memudar saat "Bukan"
  const arrowP = ramp(f, q.lalu, 18, Easing.inOut(Easing.cubic));
  const tagT = pop(f, q.bukan + 30, 12);
  // lidah masuk dari bawah saat "lidahmu", naik ke tengah-bawah (diperbesar + diturunkan agar sepertiga bawah terisi)
  const tongueY = interpolate(f, [q.lidahmu, q.lidahmu + 24], [2050, 1180], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  const tongueT = ramp(f, q.lidahmu, 24);
  const labelT = pop(f, q.lidahmu + 12, 12);
  const bitterPulse = 0.3 + 0.2 * Math.sin(f / 20) * ramp(f, q.lidahmu + 24, 20);
  // gelembung di dalam jus selama gelas masih besar (lebih aktif: 6 gelembung, naik lebih cepat)
  const bubbles = [0, 1, 2, 3, 4, 5].map((i) => ({
    x: 420 + ((i * 67) % 240),
    y: 1265 - ((f * 1.8 + i * 90) % 280),
    r: 5 + ((i * 3) % 4),
    o: (0.35 + 0.25 * Math.sin((f + i * 31) / 22)) * (1 - shrink),
  }));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Board />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        <ellipse cx={540} cy={1335} rx={250} ry={16} fill="#000000" opacity={0.16 * (1 - shrink)} />
        {/* bayangan kontak di bawah lidah */}
        <ellipse cx={540} cy={1440} rx={200} ry={14} fill="#000000" opacity={0.14 * tongueT} />
      </svg>
      {/* gelas dibawa dari hook — sudah utuh di frame 0, tanpa draw-in ulang (review R1) */}
      <GlassJuice x={glassX} y={glassY + idle * (1 - shrink)} s={glassS} t={1} dull={1} at={-20} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        {bubbles.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="none" stroke={C.white} strokeWidth={3} opacity={Math.max(0, b.o)} />
        ))}
      </svg>
      {/* sikat gigi urutan pagi — tenggelam ke bawah saat "Bukan" */}
      {f < q.bukan + 22 ? (
        <Toothbrush x={230} y={brushY + ramp(f, q.bukan, 20) * 1300} s={0.9} t={1} rot={-18 + wiggle} at={0} />
      ) : null}
      {/* panah spidol sikat → gelas (lebih besar/tebal, review R1) */}
      {arrowP > 0.02 ? (
        <SketchPath d="M260 720 L350 800" arrow arrowFrom={[260, 720]} arrowTo={[350, 800]} at={q.lalu} dur={18} exitAt={q.bukan} width={9} color={C.ink} seed={131} />
      ) : null}
      {/* tag "jus sama" di samping gelas kecil */}
      {tagT > 0 ? (
        <SketchText x={400} y={560} text="jus sama ✓" at={q.bukan + 30} size={40} color={C.green} rotate={-1} />
      ) : null}
      {/* lidah masuk dari bawah */}
      <Tongue x={540} y={tongueY} s={1.3} t={tongueT} sweetDim={0} bitterLit={bitterPulse} at={q.lidahmu} />
      {labelT > 0 ? (
        <SketchText x={540} y={875} text="LIDAH" at={q.lidahmu + 12} size={64} color={C.ink} rotate={-1} />
      ) : null}
      {/* catatan papan — mengisi sepertiga bawah; muncul SETELAH lidah tiba (lokal q.lidahmu+24)
          supaya outline lidah yang masuk dari bawah tidak memotong teks (putaran 2 review);
          teks dipendekkan jadi "sensor rasa" agar draw-in selesai sebelum scene berakhir */}
      <SketchText x={540} y={1700} text="lidah = sensor rasa" at={q.lidahmu + 24} size={40} color={C.ink} rotate={-1} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3 · lebih-dekat-lagi
const LebihDekatLagi: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    pasta: ['Pasta', 0.07], mengandung: ['mengandung', 0.65], sodium: ['sodium', 1.42],
    deterjen: ['deterjen', 2.99], merusak: ['merusak', 5.4], lemak: ['lemak', 6.5],
    reseptor: ['Reseptor', 9.06], tumpul: ['tumpul', 10.6], pahit: ['pahit', 11.6],
    asam: ['asam', 12.26], menonjol: ['menonjol', 13.75],
  });
  // gelas kecil di pojok kiri atas (pembanding → sumber asam), dibawa dari scene 2
  // lidah: besar di tengah, lalu mengecil + turun saat membran membesar, keluar saat timbangan masuk
  // (idle goyang halus agar frame tidak beku di tengah scene)
  const memT = ramp(f, q.merusak, 36, Easing.inOut(Easing.cubic));
  const tongueS = interpolate(memT, [0, 1], [1.3, 0.85]);
  const tongueY = interpolate(memT, [0, 1], [1180, 1420]) + ramp(f, q.menonjol, 16) * 550 + Math.sin(f / 24 + 1) * 4;
  const tongueOut = 1 - ramp(f, q.menonjol, 16);
  // lidah MEMUDAR saat keluar (8 frame, selesai sebelum mencapai garis catatan y~1700)
  // supaya kubah/label lidah tidak menutupi catatan papan (putaran 2 review)
  const tongueExit = 1 - ramp(f, q.menonjol, 8);
  const sweetDim = ramp(f, q.reseptor, 45);
  const bitterLit = Math.max(0, Math.min(1, ramp(f, q.pahit, 18) + 0.12 * Math.sin(f / 16) * ramp(f, q.pahit + 18, 30)));
  // tube: masuk saat "Pasta", diperas saat "sodium", tenggelam saat "merusak"
  const squeeze = ramp(f, q.sodium, 8) * (1 - ramp(f, q.sodium + 20, 14));
  const tubeY = 920 + ramp(f, q.merusak, 16) * 800;
  // busa: mengalir dari tube ke lidah saat "deterjen", mengecil keluar saat "merusak"
  const foamS = 0.7 * (1 - ramp(f, q.merusak, 12));
  const foamY = 960 + Math.sin(f / 25) * 4 * (1 - ramp(f, q.merusak, 12));
  const dots: [number, number][] = [[310, 1020], [345, 1005], [380, 995], [415, 985], [450, 975]];
  // membran membesar dari lidah saat "merusak"; retak saat "lemak"; gelembung SLS menembus celah
  // (napas pelan ±2% + goyang ±4 px agar membran hidup setelah membesar)
  const memS = interpolate(memT, [0, 1], [0.3, 1.25]) * (1 + 0.02 * Math.sin(f / 20) * ramp(f, q.merusak + 36, 20));
  const memY = 1000 + Math.sin(f / 26) * 4 * ramp(f, q.merusak + 36, 20);
  const crack = ramp(f, q.lemak, 16);
  const sls = ramp(f, q.merusak + 12, 12);
  // molekul SLS melayang naik dari lidah ke membran (setelah busa tiba)
  const particles = [0, 1, 2, 3, 4, 5].map((i) => ({
    x: 380 + ((i * 67) % 320),
    y: 1260 - ((f * 0.9 + i * 75) % 210),
    r: 6 + ((i * 2) % 3),
  }));
  // timbangan masuk saat "menonjol": sisi pahit turun (settle pelan)
  const tilt = interpolate(f, [q.menonjol, q.menonjol + 24], [0, 12], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  const acidT = pop(f, q.asam + 10, 12);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Board />
      {/* bayangan kontak di bawah lidah (mengikuti lidah, memudar saat lidah keluar) + di bawah timbangan */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        {f < q.menonjol + 18 ? (
          <ellipse cx={540} cy={tongueY + 210 * tongueS} rx={190 * tongueS} ry={14} fill="#000000" opacity={0.14 * tongueOut} />
        ) : null}
        {f >= q.menonjol ? (
          <ellipse cx={540} cy={1645} rx={250} ry={14} fill="#000000" opacity={0.14} />
        ) : null}
      </svg>
      {/* gelas jus kecil — sumber asam; dibawa dari scene 2, sudah utuh di frame 0 */}
      <GlassJuice x={250} y={650} s={0.55} t={1} dull={1} at={-20} />
      {/* lidah dibawa dari scene 2 — sudah utuh di frame 0; memudar saat keluar (tongueExit) */}
      {f < q.menonjol + 18 ? (
        <Tongue x={540} y={tongueY} s={tongueS} t={tongueExit} sweetDim={sweetDim} bitterLit={bitterLit} at={-20} />
      ) : null}
      {/* tube pasta diperas */}
      {f < q.merusak + 18 ? (
        <Tube x={260} y={tubeY} s={0.9} t={1} rot={-12} sy={1 - 0.22 * squeeze} at={q.pasta} />
      ) : null}
      {/* aliran deterjen: titik-titik biru dari tube ke lidah */}
      {dots.map(([dx, dy], i) => (
        <SketchPath key={i} d={`M ${dx - 8} ${dy} a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0 Z`} fill={C.blue} color={C.blue} width={2} at={q.deterjen + i * 4} dur={4} exitAt={q.merusak} seed={201 + i} double={false} />
      ))}
      {/* busa SLS di atas lidah */}
      {f < q.merusak + 14 && foamS > 0.05 ? (
        <Foam x={480} y={foamY} s={foamS} t={1} at={q.deterjen + 20} />
      ) : null}
      {/* membran membesar dari lidah */}
      {f >= q.merusak - 2 ? (
        <Membrane x={540} y={memY} s={memS} t={1} crack={crack} sls={sls} slsAt={q.merusak + 12} at={q.merusak} />
      ) : null}
      {/* molekul SLS melayang naik */}
      {f >= q.deterjen && f < q.menonjol ? (
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          {particles.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r={pt.r} fill="none" stroke={C.blue} strokeWidth={3} opacity={0.5} />
          ))}
        </svg>
      ) : null}
      {/* burst kecil saat retak */}
      {f >= q.lemak && f < q.lemak + 30 ? (
        <>
          <SketchPath d="M540 950 L500 900" at={q.lemak} dur={6} exitAt={q.lemak + 22} width={6} color={C.red} seed={211} />
          <SketchPath d="M540 950 L580 900" at={q.lemak} dur={6} exitAt={q.lemak + 22} width={6} color={C.red} seed={212} />
          <SketchPath d="M540 950 L500 1000" at={q.lemak} dur={6} exitAt={q.lemak + 22} width={6} color={C.red} seed={213} />
          <SketchPath d="M540 950 L580 1000" at={q.lemak} dur={6} exitAt={q.lemak + 22} width={6} color={C.red} seed={214} />
        </>
      ) : null}
      {/* panah "asam sitrat" dari gelas ke membran; label digeser ke (480,720) — di kanan-atas
          garis panah, jauh dari gelembung SLS — supaya panah tidak memotong teksnya sendiri
          (putaran 2 review) */}
      {f >= q.asam ? (
        <SketchPath d="M330 700 L450 930" arrow arrowFrom={[330, 700]} arrowTo={[450, 930]} at={q.asam} dur={18} width={7} color={C.blue} seed={221} />
      ) : null}
      {acidT > 0 ? (
        <SketchText x={480} y={720} text="asam sitrat" at={q.asam + 10} size={36} color={C.blue} rotate={-1} />
      ) : null}
      {/* timbangan rasa masuk saat "menonjol" (diperbesar + diturunkan agar sepertiga bawah terisi) */}
      {f >= q.menonjol ? (
        <Scale x={540} y={1430} s={1.4} t={1} tilt={tilt} at={q.menonjol} />
      ) : null}
      {/* catatan papan — mengisi sepertiga bawah */}
      <SketchText x={540} y={1700} text="SLS = deterjen pembuat busa" at={0} size={40} color={C.ink} rotate={-1} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 4 · inti
const Inti: React.FC<SceneVisualProps> = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    seribu: ['seribu', 4.04], tujuh: ['tujuh', 7.09], mencicipi: ['mencicipi', 9.64],
    manis: ['manis', 10.56], asin: ['asin', 11.34], asam: ['asam', 11.87], pahit: ['pahit', 12.79],
    melemah: ['melemah', 14.19], berubah: ['berubah', 16.23],
  });
  // kartu studi di tengah (diperbesar + diturunkan agar sepertiga bawah terisi); stempel 1980 saat "seribu"; 7 orang saat "tujuh";
  // 4 cangkir muncul satu per satu MENGIKUTI CUE KATA RASA (review R1: stagger lama terlambat);
  // label asam SEGAR→PAHIT saat "berubah"
  const stampT = ramp(f, q.seribu, 12);
  const peopleT = ramp(f, q.tujuh, 28);
  const cupsAt = [q.manis, q.asin, q.asam, q.pahit];
  const swapT = ramp(f, q.berubah, 8);
  // kartu idle halus, lalu tenggelam keluar di akhir scene (potong ke jawaban)
  const cardY = 1160 + Math.sin(f / 28) * 3 + ramp(f, 520, 19) * 500;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Board />
      {/* bayangan kontak di bawah kartu (mengikuti kartu, memudar saat kartu tenggelam) */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        <ellipse cx={540} cy={cardY + 330} rx={440} ry={16} fill="#000000" opacity={0.14 * (1 - ramp(f, 520, 19))} />
      </svg>
      <StudyCard x={540} y={cardY} s={1.2} t={1} stampT={stampT} peopleT={peopleT} cupsAt={cupsAt} swapT={swapT} stampAt={q.seribu} at={0} />
      {/* tag "manis ↓" di atas cangkir manis saat "melemah" (manis yang melemah, bukan panah) */}
      {f >= q.melemah && f < 510 ? (
        <SketchText x={230} y={1230} text="manis ↓" at={q.melemah} size={30} color={C.red} rotate={-1} />
      ) : null}
      {/* panah merah menunjuk cangkir ASAM yang berubah saat "berubah"; ekor panah dijauhkan
          dari teks "seisi meja makan" (putaran 2 review: ekor lama di (710,1215) terbaca sebagai
          bintik merah di ujung teks) — kini dari (770,1245) ke (690,1285) */}
      {f >= q.berubah ? (
        <SketchPath d="M770 1245 L690 1285" arrow arrowFrom={[770, 1245]} arrowTo={[690, 1285]} at={q.berubah} dur={10} exitAt={510} width={7} color={C.red} seed={301} />
      ) : null}
      {/* catatan papan — mengisi sepertiga bawah */}
      <SketchText x={540} y={1700} text="manis melemah, asam jadi pahit" at={0} size={40} color={C.ink} rotate={-1} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 5 · jawaban
// LOOP (tanpa CTA, perintah pemilik 2026-11-14): di ~0,7 dtk terakhir isi jawaban memudar
// keluar dan shot kembali ke framing pembuka hook — gelas cerah besar di tengah papan +
// headline hook — sehingga frame terakhir menyambung ke frame pertama.
// Kata terakhir ("SLS.") berakhir frame 312; gelas selesai membesar frame 310; scene 334 frame.
// Dissolve loop CROSS-DISSOLVE tersinkron + linear (putaran 2b, review 13/18): isi, lapisan
// papan, dan shot loop SEMUA 308→324 (16 frame) — tidak ada jendela papan kosong.
// Lapisan papan (z 10) menutupi headline template jawaban selama dissolve; headline hook
// masuk bersama shot loop (z 11). Gelas di kedua shot posisinya sama persis (540,985, s 1,7)
// sehingga cross-dissolve tidak ghosting.
const Jawaban: React.FC<SceneVisualProps> = ({ scene, durationInFrames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = cueFrames(scene, fps, {
    sementara: ['sementara', 0.58], hilang: ['hilang', 1.19], mau: ['Mau', 3.24],
    minum: ['Minum', 5.05], pakai: ['pakai', 8.03], tanpa: ['tanpa', 9.33],
  });
  // gelas: jangkar visual awal DIPERBESAR (s 0,65 di (265,665), putaran 2 review: gelas
  // kecil s 0,55 membuat 9 dtk pertama jawaban hampir kosong) → membesar + cerah saat "tanpa"
  const growT = ramp(f, q.tanpa, 30, Easing.inOut(Easing.cubic));
  const glassX = interpolate(growT, [0, 1], [265, 540]) + Math.sin(f / 40) * 8 * (1 - growT);
  const glassY = interpolate(growT, [0, 1], [665, 985]) + Math.sin(f / 28) * 3;
  const glassS = interpolate(growT, [0, 1], [0.65, 1.7]);
  const dull = 1 - 0.4 * ramp(f, q.hilang, 116) - 0.6 * growT;
  // sikat gigi masuk saat "Mau", keluar saat gelas membesar
  const brushY = 780 + ramp(f, q.tanpa, 20) * 600;
  const brushRot = -12 + Math.sin(f / 30) * 3 * (1 - ramp(f, q.tanpa, 20));
  // centang mengecil keluar saat gelas membesar (diperbesar s 1,05, putaran 2 review)
  const checkS = 1.05 * (1 - ramp(f, q.tanpa, 12));
  const manisT = pop(f, q.tanpa + 6, 14);
  // dissolve loop (putaran 2b, review 13/18): CROSS-DISSOLVE TERSINKRON + LINEAR — isi, lapisan
  // papan, dan shot loop SEMUA pada timing yang sama (308→324, 16 frame). Sinkron + linear
  // penting: inOut-cubic sebelumnya membuat shot loop baru ~15% saat papan sudah 100% (celah
  // blank ink 1,1% di f1836); dengan linear, di titik tengah (f316) gelas efektif ~75% (isi
  // 50% + loop 50%, posisi sama persis) sehingga tidak ada jendela papan kosong. Ghosting
  // headline (template vs loop, keduanya ~50% di titik tengah) adalah sifat cross-dissolve
  // dan hanya ~4 frame; gelas tidak ghosting karena posisinya sama persis.
  const END = durationInFrames;
  const DISSOLVE_START = END - 26; // 308
  const DISSOLVE_DUR = 16; // 308→324; shot loop penuh 324→333 (9 frame menahan)
  const loopOut = 1 - ramp(f, DISSOLVE_START, DISSOLVE_DUR, Easing.linear);
  const boardIn = ramp(f, DISSOLVE_START, DISSOLVE_DUR, Easing.linear);
  const loopIn = ramp(f, DISSOLVE_START, DISSOLVE_DUR, Easing.linear);
  // Penutup headline template SEBELUM dissolve (revisi putaran 2, review 15/18): lapisan krem
  // di zona headline (y 280–540) memudar masuk 300→308, supaya headline template hilang
  // SEBELUM headline loop masuk (308→324) — tanpa ini kedua headline bertumpuk ~50% di tengah
  // dissolve dan saling tidak terbaca. Lapisan sewarna latar (C.bg) sehingga tidak terlihat,
  // hanya menutupi teks headline; gelas/timer/sikat di bawah y 540 tidak tersentuh.
  const headlineCover = ramp(f, END - 34, 8, Easing.linear);
  // gelembung shot loop: posisi PERSIS frame 0 hook (f=0, alas jus 1265) — statis, tanpa gerak
  const loopBubbles = [0, 1, 2, 3].map((i) => ({
    x: 420 + ((i * 67) % 240),
    y: 1265 - ((i * 90) % 280),
    r: 5 + ((i * 3) % 4),
    o: 0.35 + 0.25 * Math.sin((i * 31) / 22),
  }));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Board />
      {/* isi jawaban: memudar keluar saat dissolve loop (papan tetap — latar shot loop sama) */}
      <div style={{ position: 'absolute', inset: 0, opacity: loopOut }}>
        {/* bayangan kontak di bawah gelas (mengikuti gelas saat membesar) */}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          <ellipse cx={glassX} cy={glassY + 200 * glassS + 10} rx={160 * glassS} ry={14} fill="#000000" opacity={0.16} />
        </svg>
        {/* timer efek sementara — DIPERBESAR (s 1,25) dan bertahan sampai "Mau" (lokal 97),
            supaya 9 dtk pertama tidak kosong; memudar tepat saat sikat masuk (putaran 2 review) */}
        <Timer x={540} y={900} s={1.25} t={1} at={0} exitAt={q.mau} />
        {/* gelas jus pahlawan — dibawa dari scene 3, sudah utuh di frame 0 */}
        <GlassJuice x={glassX} y={glassY} s={glassS} t={1} dull={Math.max(0, dull)} at={-20} />
        {/* sikat gigi (solusi: sikat belakangan) */}
        {f >= q.mau - 2 && f < q.tanpa + 22 ? (
          <Toothbrush x={450} y={brushY} s={0.85} t={1} rot={brushRot} at={q.mau} />
        ) : null}
        {/* panah gelas → sikat saat "Minum" (hijau = urutan solusi, sesuai asset sheet);
            digeser (360,710)→(430,750) karena gelas awal diperbesar (putaran 2 review) */}
        {f >= q.minum ? (
          <SketchPath d="M360 710 L430 750" arrow arrowFrom={[360, 710]} arrowTo={[430, 750]} at={q.minum} dur={18} exitAt={q.tanpa} width={9} color={C.green} seed={401} />
        ) : null}
        {/* centang hijau DI BAWAH sikat saat "Minum dulu" (sesuai asset sheet) */}
        {f >= q.minum && f < q.tanpa + 14 && checkS > 0.05 ? (
          <Check x={450} y={1020} s={checkS} t={1} at={q.minum} />
        ) : null}
        {/* tube tanpa SLS — pilihan kedua, saat "pakai" (kanan-bawah, mengisi sepertiga bawah) */}
        {f >= q.pakai ? (
          <>
            <Tube x={850} y={1080} s={0.9} t={1} rot={8} band={C.green} bandText="✓" at={q.pakai} />
            <SketchText x={850} y={1250} text="tanpa SLS" at={q.pakai + 10} size={36} color={C.green} rotate={-1} />
          </>
        ) : null}
        {/* label penutup di bawah gelas — zona kosong bawah (di atas bibir gelas tidak muat tanpa
            menabrak zona headline/lemon/sedotan; sekaligus mengisi sepertiga bawah) */}
        {manisT > 0 ? (
          <SketchText x={540} y={1540} text="MANIS LAGI" at={q.tanpa + 6} size={64} color={C.green} rotate={-2} />
        ) : null}
        {/* catatan papan — mengisi sepertiga bawah */}
        <SketchText x={540} y={1700} text="atau pakai pasta gigi tanpa SLS" at={0} size={40} color={C.ink} rotate={-1} />
      </div>
      {/* penutup headline template (z 9, di bawah lapisan papan/loop): menutupi headline template
          300→308, sebelum headline loop masuk — supaya tidak ada dua headline bersamaan */}
      {headlineCover > 0 ? (
        <div style={{ position: 'absolute', top: 280, left: 0, width: 1080, height: 260, background: C.bg, opacity: headlineCover, zIndex: 9 }} />
      ) : null}
      {/* lapisan papan: menutupi headline template jawaban saat dissolve (papan yang sama persis,
          jadi lapisannya tidak terlihat kecuali menutupi headline + isi yang memudar) */}
      {boardIn > 0 ? (
        <div style={{ position: 'absolute', inset: 0, opacity: boardIn, zIndex: 10, background: C.bg }}>
          <Board />
        </div>
      ) : null}
      {/* shot loop: gelas + gelembung + headline hook, SAMA PERSIS dengan frame 0 */}
      {loopIn > 0 ? (
        <div style={{ position: 'absolute', inset: 0, opacity: loopIn, zIndex: 11 }}>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
            <ellipse cx={540} cy={1335} rx={250} ry={16} fill="#000000" opacity={0.16} />
            {loopBubbles.map((b, i) => (
              <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="none" stroke={C.white} strokeWidth={3} opacity={b.o} />
            ))}
          </svg>
          <GlassJuice x={540} y={985} s={1.7} t={1} dull={0} at={-20} />
          {/* headline hook (gaya template persis: Plus Jakarta Sans 800, 84 px, y 300–520) */}
          <div
            data-layout-ignore
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 300 }}
          >
            <div
              style={{
                fontFamily: FONT_JAKARTA, fontWeight: 800, fontSize: 84, lineHeight: 1.2, textAlign: 'center',
                color: '#081736', maxWidth: 900,
                textShadow: '0 0 14px rgba(255,255,255,0.95), 0 0 4px rgba(255,255,255,0.95)',
              }}
            >
              Kok jusnya jadi pahit?
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const VISUALS: SceneVisuals = {
  hook: Hook,
  'lebih-dekat': LebihDekat,
  'lebih-dekat-lagi': LebihDekatLagi,
  inti: Inti,
  jawaban: Jawaban,
};
