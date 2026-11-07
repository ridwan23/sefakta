// Caption tersinkron dari audio: transkripsi whisper.cpp per scene, lalu kata NASKAH dicocokkan ke kata hasil
// transkripsi (forced alignment sederhana). Waktu diambil dari audio; teks tetap dari naskah.
//
//   npm run align -- --brief=briefs/<episode>.json
//
// Hasil: public/<projectId>/captions.json  { scenes: { <id>: { hash, coverage, missing, extra, captions: Caption[] } } }
// `coverage` = porsi kata naskah yang ditemukan di audio. Kata naskah yang tidak terdengar ("missing") atau kata
// tambahan di audio ("extra") menandakan VO salah ucap / terpotong / berulang: periksa dan buat ulang scene itu.
// Model whisper (multilingual "small", ±470 MB) dipasang otomatis ke .whisper/ saat pertama kali.
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from '@remotion/install-whisper-cpp';
import { loadBrief, paths, run, normWords, textHash } from './lib/episode.ts';

const WHISPER_DIR = resolve('.whisper');
const WHISPER_VERSION = '1.5.5';
const MODEL = 'small';

type Word = { text: string; startMs: number; endMs: number; confidence: number | null };
export type Caption = { text: string; startMs: number; endMs: number; timestampMs: number | null; confidence: number | null };

const sim = (a: string, b: string) => {
  if (a === b) return 1;
  const m = a.length, n = b.length;
  if (!m || !n) return 0;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
};

/** Penyelarasan DP: token naskah ↔ token audio. Cocok bila kemiripan ≥ 0,7 (menoleransi "smartfon"/"smartphone").
 *  Juga 2–3 token naskah ↔ 1 token audio ("ke mana pun" ↔ "kemanapun") dan 1 ↔ 2–3 (kebalikannya). */
const JOIN = 0.85;
const alignTokens = (script: string[], heard: string[]) => {
  const m = script.length, n = heard.length;
  const cost = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(Infinity));
  const back = Array.from({ length: m + 1 }, () => new Array<[number, number]>(n + 1).fill([0, 0])); // [langkah naskah, langkah audio]
  cost[0][0] = 0;
  for (let i = 0; i <= m; i++)
    for (let j = 0; j <= n; j++) {
      if (i === 0 && j === 0) continue;
      const opts: [number, number, number][] = []; // [biaya, di, dj]
      if (i > 0) opts.push([cost[i - 1][j] + 1, 1, 0]); // kata naskah tidak terdengar
      if (j > 0) opts.push([cost[i][j - 1] + 1, 0, 1]); // kata tambahan di audio
      if (i > 0 && j > 0) { const v = sim(script[i - 1], heard[j - 1]); opts.push([cost[i - 1][j - 1] + (v >= 0.7 ? 1 - v : 1.5), 1, 1]); }
      for (let k = 2; k <= 3; k++) {
        if (i >= k && j > 0) { const v = sim(script.slice(i - k, i).join(''), heard[j - 1]); if (v >= JOIN) opts.push([cost[i - k][j - 1] + (1 - v), k, 1]); }
        if (j >= k && i > 0) { const v = sim(script[i - 1], heard.slice(j - k, j).join('')); if (v >= JOIN) opts.push([cost[i - 1][j - k] + (1 - v), 1, k]); }
      }
      const best = opts.reduce((x, y) => (y[0] < x[0] ? y : x));
      cost[i][j] = best[0];
      back[i][j] = [best[1], best[2]];
    }
  const match: ([number, number] | null)[] = new Array(m).fill(null); // token naskah → [audio awal, audio akhir]
  const extra: number[] = [];
  for (let i = m, j = n; i > 0 || j > 0; ) {
    const [di, dj] = back[i][j];
    if (di && dj) {
      const ok = di > 1 || dj > 1 || sim(script[i - 1], heard[j - 1]) >= 0.7;
      if (ok) for (let t = i - di; t < i; t++) match[t] = [j - dj, j - 1];
    } else if (dj) extra.push(j - 1);
    i -= di; j -= dj;
  }
  return { match, extra: extra.reverse() };
};

export const transcribeScene = async (mp3: string): Promise<Word[]> => {
  const wav = join(tmpdir(), `sefakta-align-${process.pid}.wav`);
  await run('ffmpeg', ['-v', 'error', '-y', '-i', mp3, '-ar', '16000', '-ac', '1', wav]);
  try {
    const out = await transcribe({ inputPath: wav, whisperPath: WHISPER_DIR, whisperCppVersion: WHISPER_VERSION, model: MODEL, modelFolder: WHISPER_DIR, tokenLevelTimestamps: true, language: 'id', printOutput: false });
    const tokens = toCaptions({ whisperCppOutput: out }).captions;
    const words: Word[] = [];
    for (const t of tokens) {
      if (!t.text.trim()) continue;
      if (t.text.startsWith(' ') || !words.length) words.push({ text: t.text.trim(), startMs: t.startMs, endMs: t.endMs, confidence: t.confidence });
      else { const w = words[words.length - 1]; w.text += t.text; w.endMs = t.endMs; }
    }
    return words;
  } finally { rmSync(wav, { force: true }); }
};

export const alignScene = (text: string, heardWords: Word[], durationMs: number) => {
  const display = text.split(/\s+/).filter(Boolean);
  // token naskah, beserta kata tampilan asalnya ("90" → "sembilan","puluh")
  const sTok: { tok: string; d: number }[] = display.flatMap((w, d) => normWords(w).map((tok) => ({ tok, d })));
  const hTok: { tok: string; w: number }[] = heardWords.flatMap((w, i) => normWords(w.text).map((tok) => ({ tok, w: i })));
  const { match, extra } = alignTokens(sTok.map((t) => t.tok), hTok.map((t) => t.tok));

  const caps: (Caption & { matched: boolean })[] = display.map((w) => ({ text: w, startMs: NaN, endMs: NaN, timestampMs: null, confidence: null, matched: false }));
  sTok.forEach((t, i) => {
    const mm = match[i];
    if (mm === null) return;
    const first = heardWords[hTok[mm[0]].w], last = heardWords[hTok[mm[1]].w];
    const c = caps[t.d];
    c.startMs = Number.isNaN(c.startMs) ? first.startMs : Math.min(c.startMs, first.startMs);
    c.endMs = Number.isNaN(c.endMs) ? last.endMs : Math.max(c.endMs, last.endMs);
    c.confidence = first.confidence;
    c.matched = true;
  });
  // beberapa kata naskah berbagi satu kata audio ("ke mana pun" ↔ "kemanapun"): bagi rentangnya rata
  for (let i = 0; i < caps.length; ) {
    let k = i + 1;
    while (k < caps.length && caps[k].matched && caps[i].matched && caps[k].startMs === caps[i].startMs && caps[k].endMs === caps[i].endMs) k++;
    if (k - i > 1) { const t0 = caps[i].startMs, span = (caps[i].endMs - t0) / (k - i); for (let q = i; q < k; q++) { caps[q].startMs = t0 + span * (q - i); caps[q].endMs = t0 + span * (q - i + 1); } }
    i = k;
  }
  // kata yang tidak cocok: interpolasi di antara tetangga yang cocok (ditandai confidence null)
  for (let i = 0; i < caps.length; i++) {
    if (caps[i].matched) continue;
    let a = i - 1; while (a >= 0 && !caps[a].matched) a--;
    let b = i + 1; while (b < caps.length && !caps[b].matched) b++;
    const t0 = a >= 0 ? caps[a].endMs : 0, t1 = b < caps.length ? caps[b].startMs : durationMs;
    const r = b - a - 1; // jumlah kata tak cocok berurutan
    const q = i - a; // posisi kata ini di dalam deretan itu (1..r)
    caps[i].startMs = t0 + ((t1 - t0) * (q - 1)) / r;
    caps[i].endMs = t0 + ((t1 - t0) * q) / r;
  }
  for (let i = 0; i < caps.length; i++) {
    caps[i].startMs = Math.round(Math.max(0, caps[i].startMs));
    caps[i].endMs = Math.round(Math.max(caps[i].startMs + 40, caps[i].endMs));
    caps[i].timestampMs = Math.round((caps[i].startMs + caps[i].endMs) / 2);
    caps[i].text = (i ? ' ' : '') + caps[i].text;
  }
  const matchedDisplay = caps.filter((c) => c.matched).length;
  return {
    coverage: Number((matchedDisplay / Math.max(1, caps.length)).toFixed(3)),
    missing: caps.filter((c) => !c.matched).map((c) => c.text.trim()),
    extra: [...new Set(extra.map((j) => heardWords[hTok[j].w].text))],
    heard: heardWords.map((w) => w.text).join(' '),
    captions: caps.map(({ matched: _m, ...c }) => c),
  };
};

// ---------------------------------------------------------------- CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const { brief } = loadBrief();
  const P = paths(brief.projectId);
  if (!existsSync(P.manifest)) throw new Error(`Manifest VO belum ada. Jalankan dulu: npm run vo -- --brief=...`);
  const manifest = JSON.parse(readFileSync(P.manifest, 'utf8'));
  await installWhisperCpp({ to: WHISPER_DIR, version: WHISPER_VERSION, printOutput: false });
  await downloadWhisperModel({ model: MODEL, folder: WHISPER_DIR, printOutput: false });

  const result: Record<string, unknown> = {};
  let worst = 1;
  for (const scene of brief.scenes) {
    const entry = manifest.scenes.find((e: { id: string }) => e.id === scene.id);
    if (!entry) throw new Error(`Scene ${scene.id} tidak ada di manifest VO.`);
    if (entry.hash !== textHash(scene.voiceoverText, scene.voiceoverSpeed ?? entry.speed)) throw new Error(`Audio ${scene.id} usang (naskah berubah). Jalankan npm run vo dulu.`);
    const heard = await transcribeScene(P.vo(scene.id));
    const a = alignScene(scene.voiceoverText, heard, entry.audioSeconds * 1000);
    worst = Math.min(worst, a.coverage);
    result[scene.id] = { hash: entry.hash, ...a };
    console.log(`${a.coverage >= 0.9 ? '✓' : '!'} ${scene.id}: ${(a.coverage * 100).toFixed(0)}% kata cocok${a.missing.length ? ` · tidak terdengar: ${a.missing.join(', ')}` : ''}${a.extra.length ? ` · tambahan di audio: ${a.extra.join(', ')}` : ''}`);
  }
  writeFileSync(P.captions, JSON.stringify({ projectId: brief.projectId, method: `whisper.cpp ${WHISPER_VERSION} (${MODEL}) + forced alignment ke naskah`, generatedAt: new Date().toISOString(), scenes: result }, null, 2) + '\n');
  console.log(`\nCaption: public/${brief.projectId}/captions.json (cakupan terendah ${(worst * 100).toFixed(0)}%)`);
}
