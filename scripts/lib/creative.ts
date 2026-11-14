// Dek kreatif SeFakta: sumbu-sumbu keputusan kreatif episode, riwayat episode, dan undian acak.
//
// Masalah yang diselesaikan: agent bahasa cenderung jatuh ke pilihan paling aman yang sama setiap kali
// (5 scene hook→jawaban, caption subtitle, infografis krem). Undian memaksa kombinasi baru yang tidak bisa
// ditebak sebelumnya, tetapi tetap disaring kecocokan dengan pilar dan dihindarkan dari riwayat terbaru.
// Agent lalu menafsirkan kartu terhadap faktanya (docs/PANDUAN-KREATIF.md). Dipakai oleh
// scripts/creative-draw.ts (undian) dan scripts/validate-facts.ts (penjaga pengulangan).
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- brief JSON bebas bentuk, seperti di validate-facts.ts
type Json = Record<string, any>;
export type Series = 'Alam' | 'Sains' | 'Sejarah' | 'Antariksa' | 'Teknologi' | 'Tubuh';
const ALL: Series[] = ['Alam', 'Sains', 'Sejarah', 'Antariksa', 'Teknologi', 'Tubuh'];

// ---------------------------------------------------------------- dek
export type Family = { id: string; label: string; fits: Series[]; tones: ('light' | 'dark')[]; ready: boolean; kit: string; cameras?: string[] };
/** Gaya visual. `ready: false` = kit belum ada; hanya keluar dengan --wild (butuh kit baru di src/shared dulu). */
export const FAMILIES: Family[] = [
  { id: 'peta-perjalanan', label: 'Peta perjalanan', fits: ['Sejarah', 'Alam', 'Antariksa'], tones: ['dark', 'light'], ready: true, kit: 'maps/WorldMap, camera/CameraRig' },
  { id: 'cerita-data', label: 'Cerita data', fits: ALL, tones: ['dark', 'light'], ready: true, kit: 'patterns/BigNumber, RankList, Compare, anim/CountUp' },
  { id: 'vektor-datar', label: 'Vektor datar', fits: ['Sains', 'Tubuh', 'Teknologi', 'Alam'], tones: ['light'], ready: true, kit: 'objects/, labels/, render/Shaded' },
  { id: 'diagram-gelap', label: 'Diagram gelap / kosmik (mikroskop, studio malam, antariksa)', fits: ['Sains', 'Tubuh', 'Antariksa', 'Teknologi'], tones: ['dark'], ready: true, kit: 'look/Backdrop, render/, camera/' },
  { id: 'tipografi-kinetik', label: 'Tipografi kinetik', fits: ALL, tones: ['dark', 'light'], ready: true, kit: 'anim/SplitText, Swap, patterns/MythFact', cameras: ['cut-per-beat', 'one-take', 'kunci-statis'] },
  { id: 'papan-tulis', label: 'Papan tulis spidol', fits: ['Sains', 'Tubuh', 'Teknologi'], tones: ['light'], ready: true, kit: 'sketch/ (BoardSurface, SketchPath, Hatch, SketchText)', cameras: ['geser-lateral', 'kunci-statis', 'zoom-masuk'] },
  { id: 'papan-kapur', label: 'Papan kapur', fits: ['Sains', 'Antariksa', 'Sejarah'], tones: ['dark'], ready: true, kit: 'sketch/ variant="chalk", math/Formula', cameras: ['geser-lateral', 'kunci-statis', 'zoom-masuk'] },
  { id: 'clay', label: 'Clay lembut', fits: ['Tubuh', 'Sains', 'Alam'], tones: ['light'], ready: true, kit: 'render/MaterialStyle material="clay" + objects/' },
  { id: 'isometrik', label: 'Isometrik garis', fits: ['Teknologi', 'Sains', 'Sejarah'], tones: ['light'], ready: true, kit: 'iso/ (IsoGrid, IsoBox, IsoFlow)', cameras: ['geser-lateral', 'kunci-statis', 'zoom-masuk', 'cut-per-beat'] },
  { id: 'kolase-dokumenter', label: 'Kolase dokumenter / jurnal arsip', fits: ['Sejarah', 'Teknologi', 'Alam'], tones: ['light'], ready: true, kit: 'collage/, labels/' },
  { id: 'potongan-kertas', label: 'Potongan kertas (stop-motion)', fits: ['Alam', 'Tubuh', 'Sains', 'Sejarah'], tones: ['light'], ready: true, kit: 'collage/ (Cutout torn, PaperFold, Ribbon), anim/stepped' },
  { id: 'siluet', label: 'Siluet berlapis', fits: ['Sejarah', 'Alam', 'Antariksa'], tones: ['dark'], ready: true, kit: 'silhouette/, camera/CamLayer', cameras: ['geser-lateral', 'one-take', 'kunci-statis', 'orbit-parallax'] },
  { id: 'rumus', label: 'Persamaan di papan gelap', fits: ['Sains', 'Antariksa'], tones: ['dark'], ready: true, kit: 'math/Formula, anim/CountUp' },
  { id: 'komik', label: 'Panel komik', fits: ['Sejarah', 'Tubuh', 'Sains'], tones: ['light'], ready: true, kit: 'comic/ComicPanel, SpeechBubble, SoundWord, SpeedLines, Halftone (+ stickman/Stickman)' },
  { id: 'stickman', label: 'Stickman', fits: ['Tubuh', 'Sains', 'Teknologi'], tones: ['light'], ready: true, kit: 'stickman/Stickman (POSES, cycle jalan/lari) + sketch/BoardSurface, SketchPath' },
  { id: 'risograf', label: 'Cetak risograf', fits: ['Sejarah', 'Alam', 'Tubuh'], tones: ['light'], ready: true, kit: 'riso/RisoInk, RisoPrint (membungkus gaya lain), RisoPaper' },
  { id: 'grid-swiss', label: 'Grid Swiss', fits: ['Sejarah', 'Teknologi', 'Sains'], tones: ['light'], ready: true, kit: 'swiss/swissGrid, SwissType, SwissBlock, SwissRule, SwissGridLines' },
  { id: 'terminal', label: 'Terminal', fits: ['Teknologi'], tones: ['dark'], ready: false, kit: 'belum: layar terminal, font mono di registri' },
  { id: 'partikel', label: 'Medan partikel', fits: ['Antariksa', 'Sains', 'Alam'], tones: ['dark'], ready: false, kit: 'sebagian: anim/Particles' },
];

export type Structure = { id: string; label: string; fits?: Series[]; scenes: [string, number, string][] };
/** Struktur cerita. Scene = [id, detik awal, fungsi]. Total ±58 dtk; durasi akhir tetap mengikuti audio. */
export const STRUCTURES: Structure[] = [
  { id: 'klasik', label: 'Hook → konteks → mekanisme → dampak → jawaban', scenes: [['hook', 5, 'pertanyaan spesifik + objek/akibat utama'], ['konteks', 10, 'siapa, kapan, di mana'], ['mekanisme', 18, 'bagaimana dan mengapa'], ['dampak', 15, 'bukti, angka, sebelum/sesudah'], ['jawaban', 10, 'tuntaskan janji hook']] },
  { id: 'misteri', label: 'Misteri: akibat aneh dulu, petunjuk demi petunjuk, "pelakunya" terungkap', scenes: [['kejadian', 7, 'akibat yang aneh, tanpa penjelasan'], ['petunjuk-1', 12, 'petunjuk pertama (menyingkirkan dugaan umum)'], ['petunjuk-2', 13, 'petunjuk yang mengarah ke penyebab'], ['pelaku', 16, 'mekanisme terungkap'], ['jawaban', 10, 'kembali ke kejadian awal, kini masuk akal']] },
  { id: 'hitung-mundur', label: 'Hitung mundur 3 → 1, makin mengejutkan', scenes: [['hook', 6, 'janji: tiga hal, yang terakhir paling mengejutkan'], ['tiga', 13, 'hal ketiga (paling ringan)'], ['dua', 14, 'hal kedua'], ['satu', 16, 'hal pertama (paling mengejutkan, inti fakta)'], ['jawaban', 9, 'gagasan yang tersisa']] },
  { id: 'eksperimen', label: 'Eksperimen: penonton diajak mencoba, lalu dijelaskan', fits: ['Sains', 'Tubuh', 'Alam', 'Teknologi'], scenes: [['tantangan', 6, 'ajak penonton mencoba/menebak sekarang'], ['percobaan', 13, 'peragakan percobaannya'], ['hasil', 12, 'hasil yang tidak terduga'], ['kenapa', 17, 'mekanisme'], ['jawaban', 10, 'artinya untuk keseharian']] },
  { id: 'pov-benda', label: 'Sudut pandang benda: ikuti satu benda/partikel sepanjang perjalanannya', fits: ['Tubuh', 'Sains', 'Teknologi', 'Alam', 'Antariksa'], scenes: [['hook', 6, 'kenalkan bendanya + pertanyaan'], ['berangkat', 12, 'awal perjalanan'], ['rintangan', 15, 'apa yang terjadi padanya (mekanisme)'], ['tiba', 14, 'akibat di tujuan'], ['jawaban', 11, 'tarik mundur: arti untuk penonton']] },
  { id: 'mundur-waktu', label: 'Mundur waktu: mulai dari akhir, telusuri ke awal', fits: ['Sejarah', 'Alam', 'Antariksa', 'Teknologi'], scenes: [['akhir', 7, 'keadaan akhir yang mengejutkan'], ['sebelumnya', 13, 'langkah sebelum itu'], ['lebih-awal', 14, 'langkah lebih awal'], ['awal', 14, 'titik mula yang tak terduga'], ['jawaban', 10, 'rangkai maju dalam satu tarikan']] },
  { id: 'dua-dunia', label: 'Dua dunia: bandingkan dua keadaan berdampingan', scenes: [['hook', 6, 'dua hal yang tampak sama'], ['dunia-a', 13, 'keadaan pertama'], ['dunia-b', 13, 'keadaan kedua'], ['beda', 16, 'satu perbedaan kunci dan sebabnya'], ['jawaban', 10, 'pilihan/akibat untuk penonton']] },
  { id: 'zoom-terus', label: 'Zoom terus: dari skala sehari-hari masuk ke skala tersembunyi', fits: ['Sains', 'Tubuh', 'Alam', 'Antariksa', 'Teknologi'], scenes: [['hook', 6, 'benda sehari-hari'], ['lebih-dekat', 12, 'skala pertama'], ['lebih-dekat-lagi', 14, 'skala kedua'], ['inti', 15, 'skala terdalam: mekanismenya'], ['jawaban', 11, 'zoom keluar kembali ke benda awal']] },
  { id: 'mitos-beruntun', label: 'Mitos beruntun: patahkan dugaan satu per satu', scenes: [['hook', 6, 'dugaan populer'], ['mitos-1', 12, 'dugaan pertama, dipatahkan'], ['mitos-2', 12, 'dugaan kedua, dipatahkan'], ['fakta', 18, 'yang sebenarnya terjadi'], ['jawaban', 10, 'satu kalimat yang bisa diulang penonton']] },
];

export const OPENINGS: [string, string][] = [
  ['close-up-ekstrem', 'Frame pertama: close-up ekstrem benda yang dikenal, baru terbaca saat kamera mundur'],
  ['tanya-langsung', 'Pertanyaan langsung ke penonton ("Coba cek…", "Pernah…?") dengan benda di tengah layar'],
  ['angka-kejutan', 'Satu angka besar yang terasa salah, sebelum dijelaskan'],
  ['akhir-dulu', 'Mulai dari akibat paling dramatis, lalu "bagaimana bisa?"'],
  ['kuis-tebak', 'Dua pilihan di layar, penonton menebak; jawaban dibuka di tengah video'],
  ['salah-kaprah', 'Peragakan kebiasaan/salah kaprah yang umum, lalu hentikan dengan "tunggu"'],
  ['aksi-tiba-tiba', 'Aksi fisik di detik 0 (jatuh, pecah, menyala), tanpa pengantar'],
];

export const CAMERAS: [string, string][] = [
  ['one-take', 'Satu tarikan kamera tanpa potong: scene berganti dengan kamera bergerak di satu dunia'],
  ['cut-per-beat', 'Potong tegas di setiap beat, komposisi berani berganti'],
  ['zoom-masuk', 'Kamera terus mendekat; tiap scene satu tingkat lebih dalam'],
  ['geser-lateral', 'Satu dunia panjang, kamera bergeser menyamping dari bagian ke bagian'],
  ['kunci-statis', 'Kamera terkunci (meja/papan); semua gerak datang dari objek'],
  ['orbit-parallax', 'Lapisan berkedalaman, kamera mengitari/menembus lapisan'],
];

export const CONSTRAINTS: string[] = [
  'Palet maksimal 3 warna + 1 netral',
  'Satu objek pahlawan tampil di semua scene dan berganti peran',
  'Transisi antarscene berupa match-cut bentuk (bentuk akhir scene = bentuk awal scene berikutnya)',
  'Angka utama tampil sebagai benda/skala fisik, bukan hanya teks',
  'Minimal 2 scene tanpa headline teks: visualnya yang bicara',
  'Semua dilihat dari atas (top-down), seperti meja',
  'Setiap angka diberi pembanding benda sehari-hari',
  'Satu warna = satu konsep, dipertahankan sampai akhir',
  'Semua elemen masuk secara fisik (jatuh, didorong, dituang), tanpa fade',
  'Sudut pandang orang pertama: tangan/benda "kamu" tampil di layar',
  'Penutup kembali ke frame pembuka, tetapi maknanya kini berubah (bookend)',
  'Tipografi raksasa menjadi bagian dari lanskap/benda',
  'Latar bergeser gelap ↔ terang mengikuti alur cerita',
  'Satu momen visual hening ±1 dtk di puncak cerita (tanpa teks baru)',
];

export const CAPTION_MODES = ['subtitle', 'ringkasan', 'headline'] as const;
export const AXES = ['family', 'structure', 'opening', 'camera', 'captionMode', 'tone'] as const;
export type Axis = (typeof AXES)[number];
export type Card = { family: string; tone: 'light' | 'dark'; structure: string; opening: string; camera: string; captionMode: string; constraints: string[] };

// ---------------------------------------------------------------- riwayat
export type Fingerprint = Partial<Record<Axis, string>> & { id: string; date: string; inferred: boolean };

/** Perkiraan gaya untuk brief lama yang dibuat sebelum dek kreatif (tanpa `creative`). */
const LEGACY_FAMILY: [RegExp, string][] = [
  [/peta/i, 'peta-perjalanan'],
  [/jurnal|arsip|kolase|dokumen/i, 'kolase-dokumenter'],
  [/papan|kapur/i, 'papan-tulis'],
  [/mikroskop|malam|gelap|kosmik|studio/i, 'diagram-gelap'],
  [/krem|terang|infografis|diagram|label|ui /i, 'vektor-datar'],
];

const firstAdded = (file: string): string => {
  try {
    const out = execFileSync('git', ['log', '--diff-filter=A', '--format=%aI', '--', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().split('\n').pop();
    if (out) return out;
  } catch { /* bukan repo git */ }
  try { return statSync(file).mtime.toISOString(); } catch { return '1970-01-01'; }
};

export const fingerprint = (b: Json, file: string): Fingerprint => {
  const c = b.creative?.chosen as Card | undefined;
  const date = b.creative?.drawnAt ?? b.createdAt ?? firstAdded(file);
  if (c) return { id: b.projectId, date, inferred: false, family: c.family, structure: c.structure, opening: c.opening, camera: c.camera, captionMode: b.captionMode ?? c.captionMode, tone: b.visualStyle?.tone ?? c.tone };
  const name = `${b.visualStyle?.name ?? ''}`;
  const ids = (b.scenes ?? []).map((s: Json) => s.id).join(',');
  const structure = STRUCTURES.find((s) => s.scenes.map((x) => x[0]).join(',') === ids)?.id;
  return { id: b.projectId, date, inferred: true, family: LEGACY_FAMILY.find(([re]) => re.test(name))?.[1], structure, captionMode: b.captionMode, tone: b.visualStyle?.tone };
};

/** Episode lain (bukan arsip), terbaru dulu. */
export const history = (briefs: { b: Json; file: string }[], exceptId?: string): Fingerprint[] =>
  briefs.filter(({ b }) => b.status !== 'arsip' && b.projectId !== exceptId).map(({ b, file }) => fingerprint(b, file)).sort((x, y) => y.date.localeCompare(x.date));

// ---------------------------------------------------------------- undian
/** PRNG kecil yang tercampur baik (mulberry32); seed dicatat di brief agar undian bisa diulang persis. */
export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(r: () => number, xs: T[]): T => xs[Math.floor(r() * xs.length)];
const weighted = <T>(r: () => number, xs: T[], w: (x: T) => number): T => {
  const total = xs.reduce((a, x) => a + w(x), 0);
  let u = r() * total;
  for (const x of xs) if ((u -= w(x)) <= 0) return x;
  return xs[xs.length - 1];
};

export const RECENT_FAMILY = 4; // gaya yang sama tidak keluar lagi dalam 4 episode terakhir
export const RECENT_AXIS = 2; // struktur/pembuka/kamera tidak keluar lagi dalam 2 episode terakhir

/** Tiga kartu berbeda gaya dan struktur, cocok dengan pilar, menghindari riwayat terbaru. */
export const draw = (seed: number, series: Series, hist: Fingerprint[], wild = false): Card[] => {
  const r = rng(seed);
  const recent = (axis: Axis, n: number) => new Set(hist.slice(0, n).map((h) => h[axis]).filter(Boolean));
  const avoidFam = recent('family', RECENT_FAMILY);
  const avoid = { structure: recent('structure', RECENT_AXIS), opening: recent('opening', RECENT_AXIS), camera: recent('camera', RECENT_AXIS) };
  const count = (axis: Axis, v: string, n = 4) => hist.slice(0, n).filter((h) => h[axis] === v).length;
  const fresh = <T>(xs: T[], bad: (x: T) => boolean) => (xs.some((x) => !bad(x)) ? xs.filter((x) => !bad(x)) : xs);

  let fams = FAMILIES.filter((f) => f.fits.includes(series) && (wild || f.ready));
  fams = fresh(fams, (f) => avoidFam.has(f.id));
  const structs = fresh(STRUCTURES.filter((s) => !s.fits || s.fits.includes(series)), (s) => avoid.structure.has(s.id));
  const cards: Card[] = [];
  const used = { family: new Set<string>(), structure: new Set<string>() };
  for (let i = 0; i < 3; i++) {
    const f = pick(r, fresh(fams, (x) => used.family.has(x.id)));
    const s = pick(r, fresh(structs, (x) => used.structure.has(x.id)));
    used.family.add(f.id);
    used.structure.add(s.id);
    const cams = fresh(CAMERAS.map((c) => c[0]).filter((c) => !f.cameras || f.cameras.includes(c)), (c) => avoid.camera.has(c));
    const cons: string[] = [];
    while (cons.length < 2) {
      const c = pick(r, CONSTRAINTS);
      if (!cons.includes(c)) cons.push(c);
    }
    cards.push({
      family: f.id,
      tone: weighted(r, f.tones, (t) => 1 / (1 + count('tone', t, 3))),
      structure: s.id,
      opening: pick(r, fresh(OPENINGS.map((o) => o[0]), (o) => avoid.opening.has(o))),
      camera: pick(r, cams),
      captionMode: weighted(r, [...CAPTION_MODES], (m) => 1 / (1 + 2 * count('captionMode', m))),
      constraints: cons,
    });
  }
  return cards;
};

// ---------------------------------------------------------------- pemeriksaan
type Issue = { level: 'error' | 'warn'; where: string; msg: string };
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && !/\bTODO\b/.test(v);

/** Bentuk blok `creative` satu brief. Brief tanpa `createdAt` (dibuat sebelum dek kreatif) tidak diwajibkan. */
export const checkCreative = (b: Json, publish: boolean): Issue[] => {
  const out: Issue[] = [];
  const lvl = publish ? 'error' : 'warn';
  const add = (level: Issue['level'], where: string, msg: string) => out.push({ level, where, msg });
  const c = b.creative;
  if (!c) {
    if (b.createdAt) add(lvl, 'creative', `belum diundi: npm run creative:draw -- ${b.projectId} (docs/PANDUAN-KREATIF.md)`);
    return out;
  }
  if (!Array.isArray(c.cards) || c.cards.length !== 3 || typeof c.seed !== 'number') { add('error', 'creative', 'hasil undian rusak: jangan diedit tangan; undi ulang dengan --reroll="alasan"'); return out; }
  if (!c.chosen) { add(lvl, 'creative', `kartu belum dipilih: npm run creative:draw -- ${b.projectId} --pick=<1|2|3>`); return out; }
  const card: Card = c.cards[c.pick - 1];
  if (!card) { add('error', 'creative.pick', 'harus 1, 2, atau 3'); return out; }
  const swaps = Array.isArray(c.swaps) ? c.swaps : [];
  if (swaps.length > 1) add('error', 'creative.swaps', 'maksimal 1 sumbu ditukar; lebih dari itu berarti kartu tidak dipakai');
  for (const s of swaps) if (!isStr(s?.why) || s.why.trim().length < 20) add('error', 'creative.swaps', `tukar ${s?.axis}: alasan wajib (≥ 20 karakter, terkait isi fakta)`);
  const swapped = new Set(swaps.map((s: Json) => s.axis));
  for (const a of AXES) if (!swapped.has(a) && c.chosen[a] !== card[a]) add('error', `creative.chosen.${a}`, `"${c.chosen[a]}" berbeda dari kartu ${c.pick} ("${card[a]}") tanpa dicatat di swaps`);
  if (b.captionMode !== c.chosen.captionMode) add('error', 'captionMode', `harus "${c.chosen.captionMode}" sesuai kartu (atau catat tukar captionMode di creative.swaps)`);
  if (b.visualStyle?.tone && b.visualStyle.tone !== c.chosen.tone) add('error', 'visualStyle.tone', `harus "${c.chosen.tone}" sesuai kartu (atau catat tukar tone di creative.swaps)`);
  const k = c.concept ?? {};
  for (const [f, hint] of [['idea', 'gagasan visual satu kalimat: dunia apa yang dipakai dan kenapa dari fakta ini'], ['signature', 'satu momen visual yang akan diingat penonton'], ['onlyHere', 'kenapa konsep ini tidak bisa dipakai ulang untuk episode lain']] as const)
    if (!isStr(k[f])) add(lvl, `creative.concept.${f}`, `wajib diisi: ${hint}`);
  const ids = (b.scenes ?? []).map((s: Json) => s.id).join(',');
  const st = STRUCTURES.find((s) => s.id === c.chosen.structure);
  if (st && ids !== st.scenes.map((x) => x[0]).join(',')) add('warn', 'scenes', `id scene tidak mengikuti struktur "${st.id}" (${st.scenes.map((x) => x[0]).join(' → ')}); boleh bila tetap setia pada alurnya`);
  return out;
};

/** Pengulangan terhadap 3 episode sebelumnya (berdasarkan tanggal undian/dibuat). */
export const checkRepetition = (me: Fingerprint, hist: Fingerprint[]): Issue[] => {
  const out: Issue[] = [];
  if (me.inferred) return out;
  const before = hist.filter((h) => h.date < me.date).slice(0, 3);
  if (before[0] && before[0].family && before[0].family === me.family) out.push({ level: 'error', where: 'creative.chosen.family', msg: `gaya "${me.family}" sama dengan episode sebelumnya (${before[0].id})` });
  else if (before.some((h) => h.family === me.family)) out.push({ level: 'warn', where: 'creative.chosen.family', msg: `gaya "${me.family}" sudah dipakai dalam 3 episode terakhir` });
  for (const h of before) {
    const same = AXES.filter((a) => h[a] && h[a] === me[a]);
    if (same.length >= 4) out.push({ level: 'error', where: 'creative', msg: `terlalu mirip ${h.id}: ${same.join(', ')} sama (maks. 3 dari 6 sumbu)` });
  }
  return out;
};

export const label = {
  family: (id: string) => FAMILIES.find((f) => f.id === id)?.label ?? id,
  structure: (id: string) => STRUCTURES.find((s) => s.id === id)?.label ?? id,
  opening: (id: string) => OPENINGS.find((o) => o[0] === id)?.[1] ?? id,
  camera: (id: string) => CAMERAS.find((c) => c[0] === id)?.[1] ?? id,
};
