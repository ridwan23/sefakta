// Undian kreatif episode: 3 kartu acak (gaya × struktur × pembuka × kamera × caption × 2 batasan),
// disaring pilar episode dan dihindarkan dari episode terbaru. Hasil undian dicatat di brief (seed + kartu)
// supaya tidak bisa diam-diam diulang sampai keluar pilihan yang "aman". Cara memakai: docs/PANDUAN-KREATIF.md.
//
//   npm run creative:draw -- <id>                         # undi 3 kartu, simpan di briefs/<id>.json
//   npm run creative:draw -- <id> --pick=2                # pilih kartu 2 (scene TODO diganti kerangka strukturnya)
//   npm run creative:draw -- <id> --pick=2 --swap=camera:kunci-statis --why="…"   # tukar maks. 1 sumbu, beralasan
//   npm run creative:draw -- <id> --reroll="alasan"       # undi ulang (tercatat); hanya bila ketiga kartu tidak bisa jujur dipakai
//   npm run creative:draw -- <id> --wild                  # ikutkan gaya yang kitnya belum ada (harus dibuat dulu di src/shared)
//   npm run creative:draw -- --history                    # riwayat sidik kreatif semua episode
import { randomInt } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { arg, flag } from './lib/episode.ts';
import { AXES, CAMERAS, CAPTION_MODES, draw, FAMILIES, history, label, OPENINGS, STRUCTURES, type Axis, type Card, type Series } from './lib/creative.ts';

const dir = arg('dir') ?? 'briefs'; // --dir untuk uji
const all = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('example')).map((f) => ({ file: `${dir}/${f}`, b: JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) }));

if (flag('history')) {
  console.log('Sidik kreatif episode (terbaru dulu; * = diperkirakan dari brief lama):\n');
  for (const h of history(all)) console.log(`${h.date.slice(0, 10)}  ${h.id.padEnd(22)}${h.inferred ? '*' : ' '} ${AXES.map((a) => `${a}=${h[a] ?? '?'}`).join('  ')}`);
  process.exit(0);
}

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
const file = `${dir}/${id}.json`;
if (!id || !existsSync(file)) throw new Error('Pakai: npm run creative:draw -- <id-episode> (brief harus sudah dibuat dengan npm run new:episode)');
const b = JSON.parse(readFileSync(file, 'utf8'));
const hist = history(all, id);

const show = (c: Card, i: number) => {
  const st = STRUCTURES.find((s) => s.id === c.structure)!;
  const fam = FAMILIES.find((f) => f.id === c.family)!;
  console.log(`\n── Kartu ${i + 1} ──────────────────────────────`);
  console.log(`  Gaya       ${fam.label} [${c.tone}]${fam.ready ? '' : '  ⚠ kit belum ada'}\n             kit: ${fam.kit}`);
  console.log(`  Struktur   ${st.label}\n             ${st.scenes.map((s) => s[0]).join(' → ')}`);
  console.log(`  Pembuka    ${label.opening(c.opening)}`);
  console.log(`  Kamera     ${label.camera(c.camera)}`);
  console.log(`  Caption    ${c.captionMode}`);
  console.log(`  Batasan    • ${c.constraints.join('\n             • ')}`);
};

const save = () => writeFileSync(file, JSON.stringify(b, null, 2) + '\n');
const pickArg = arg('pick');
const reroll = arg('reroll');

if (pickArg) {
  const c = b.creative;
  if (!c?.cards) throw new Error('Belum ada undian. Jalankan dulu: npm run creative:draw -- ' + id);
  const n = Number(pickArg);
  if (![1, 2, 3].includes(n)) throw new Error('--pick harus 1, 2, atau 3');
  const chosen: Card = { ...c.cards[n - 1] };
  const swaps: { axis: Axis; from: string; to: string; why: string }[] = [];
  const sw = arg('swap');
  if (sw) {
    const [axis, to] = sw.split(':') as [Axis, string];
    const valid: Record<Axis, string[]> = {
      family: FAMILIES.map((f) => f.id), structure: STRUCTURES.map((s) => s.id), opening: OPENINGS.map((o) => o[0]),
      camera: CAMERAS.map((x) => x[0]), captionMode: [...CAPTION_MODES], tone: ['light', 'dark'],
    };
    if (!valid[axis]) throw new Error(`--swap=<sumbu>:<nilai>; sumbu: ${AXES.join(', ')}`);
    if (!valid[axis].includes(to)) throw new Error(`nilai ${axis} harus salah satu dari: ${valid[axis].join(', ')}`);
    const why = arg('why');
    if (!why || why.trim().length < 20) throw new Error('--why="…" wajib (≥ 20 karakter): kenapa kartu tidak cocok dengan isi fakta di sumbu ini');
    swaps.push({ axis, from: chosen[axis], to, why });
    (chosen as Record<string, unknown>)[axis] = to;
  }
  Object.assign(c, { pick: n, chosen, swaps, concept: c.concept ?? { idea: 'TODO', signature: 'TODO', onlyHere: 'TODO' } });
  b.captionMode = chosen.captionMode;
  b.visualStyle = { ...b.visualStyle, tone: chosen.tone };
  const st = STRUCTURES.find((s) => s.id === chosen.structure)!;
  const untouched = (b.scenes ?? []).every((s: { voiceoverText?: string }) => /^TODO/.test(s.voiceoverText ?? 'TODO'));
  if (untouched) {
    b.scenes = st.scenes.map(([sid, sec, purpose]) => ({ id: sid, durationSeconds: sec, voiceoverText: `TODO ${purpose}.`, caption: '', headline: `TODO ${purpose}`, visual: 'TODO arahan visual', factIds: [] }));
  }
  save();
  console.log(`Kartu ${n} dipilih${swaps.length ? ` (tukar ${swaps[0].axis}: ${swaps[0].from} → ${swaps[0].to})` : ''}.`);
  show(chosen, n - 1);
  console.log(untouched ? `\nScene brief diganti kerangka "${st.id}".` : `\nScene brief sudah berisi naskah; tidak diubah. Struktur "${st.id}": ${st.scenes.map((s) => s[0]).join(' → ')}`);
  console.log('Berikutnya: isi creative.concept { idea, signature, onlyHere } di brief (docs/PANDUAN-KREATIF.md §3), lalu npm run validate:facts.');
  process.exit(0);
}

if (b.creative?.cards && !reroll) {
  console.log(`Undian ${id} sudah ada (seed ${b.creative.seed}${b.creative.rerolls?.length ? `, diulang ${b.creative.rerolls.length}×` : ''}). Kartu tidak diundi ulang diam-diam.`);
  b.creative.cards.forEach(show);
  console.log(`\nPilih: npm run creative:draw -- ${id} --pick=<1|2|3>   ·   undi ulang (tercatat): --reroll="alasan"`);
  process.exit(0);
}
if (reroll !== undefined && reroll.trim().length < 20) throw new Error('--reroll="…" butuh alasan ≥ 20 karakter: kenapa ketiga kartu tidak bisa dipakai untuk fakta ini');

const seed = arg('seed') ? Number(arg('seed')) : randomInt(1, 2 ** 31 - 1);
const cards = draw(seed, b.series as Series, hist, flag('wild'));
const rerolls = [...(b.creative?.rerolls ?? []), ...(reroll ? [{ seed: b.creative.seed, why: reroll }] : [])];
b.createdAt ??= new Date().toISOString();
b.creative = { drawnAt: new Date().toISOString(), seed, wild: flag('wild') || undefined, cards, pick: null, ...(rerolls.length ? { rerolls } : {}) };
save();
const last = hist.slice(0, 4).map((h) => `${h.id} (${h.family ?? '?'}, ${h.structure ?? '?'}, ${h.captionMode})`).join('; ');
console.log(`Undian ${id} · pilar ${b.series} · seed ${seed}\nDihindari (episode terbaru): ${last || '—'}`);
cards.forEach(show);
console.log(`\nLangkah berikutnya (docs/PANDUAN-KREATIF.md §2):
  1. Untuk tiap kartu, tulis satu kalimat konsep yang jujur terhadap fakta. Kartu yang paling mengejutkan tapi tetap benar biasanya yang terbaik.
  2. npm run creative:draw -- ${id} --pick=<n>   (boleh --swap satu sumbu, dengan --why)`);
