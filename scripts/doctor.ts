// Pemeriksa lingkungan produksi: alat, versi, kunci Fish Audio (tanpa menampilkan nilainya), Whisper, disk.
//
//   npm run doctor
//
// Exit 1 bila ada kebutuhan wajib yang belum terpenuhi.
import { execFile } from 'node:child_process';
import { existsSync, readFileSync, statfsSync } from 'node:fs';
import { promisify } from 'node:util';

const run = promisify(execFile);
type Row = { ok: boolean; need: 'wajib' | 'opsional'; name: string; detail: string; fix?: string };
const rows: Row[] = [];
const add = (r: Row) => rows.push(r);

const version = async (cmd: string, args: string[], re: RegExp) => {
  try {
    const { stdout, stderr } = await run(cmd, args);
    return re.exec(stdout + stderr)?.[1] ?? 'ada';
  } catch {
    return null;
  }
};

// Node ≥ 22.6 (menjalankan .ts dengan --experimental-strip-types)
const [maj, min] = process.versions.node.split('.').map(Number);
add({ ok: maj > 22 || (maj === 22 && min >= 6), need: 'wajib', name: 'Node.js ≥ 22.6', detail: `v${process.versions.node}`, fix: 'Pasang Node 22 LTS atau lebih baru (https://nodejs.org)' });

for (const [cmd, why] of [['ffmpeg', 'normalisasi loudness, konversi audio'], ['ffprobe', 'durasi audio']] as const) {
  const v = await version(cmd, ['-version'], /version (\S+)/);
  add({ ok: !!v, need: 'wajib', name: cmd, detail: v ? `${v} (${why})` : `tidak ada (${why})`, fix: 'macOS: brew install ffmpeg · Linux: apt install ffmpeg' });
}
const make = await version('make', ['-v'], /Make (\S+)/);
const cc = (await version('cc', ['--version'], /version (\S+)/)) ?? (await version('gcc', ['--version'], /(\d+\.\d+\.\d+)/));
add({ ok: !!make && !!cc, need: 'wajib', name: 'make + compiler C', detail: make && cc ? `make ${make}, cc ${cc} (membangun whisper.cpp)` : 'tidak lengkap (membangun whisper.cpp)', fix: 'macOS: xcode-select --install · Linux: apt install build-essential' });
const git = await version('git', ['--version'], /version (\S+)/);
add({ ok: !!git, need: 'wajib', name: 'git', detail: git ?? 'tidak ada (mengunduh whisper.cpp)', fix: 'Pasang git' });

existsSync('node_modules/remotion')
  ? add({ ok: true, need: 'wajib', name: 'dependensi npm', detail: `remotion ${JSON.parse(readFileSync('node_modules/remotion/package.json', 'utf8')).version}` })
  : add({ ok: false, need: 'wajib', name: 'dependensi npm', detail: 'belum terpasang', fix: 'npm install' });

// .env (nilai tidak pernah dicetak)
const env = existsSync('.env') ? readFileSync('.env', 'utf8') : '';
const has = (k: string) => new RegExp(`^${k}=\\S+`, 'm').test(env);
add({ ok: has('FISH_AUDIO_API_KEY'), need: 'wajib', name: '.env FISH_AUDIO_API_KEY', detail: has('FISH_AUDIO_API_KEY') ? 'terisi' : existsSync('.env') ? 'kosong' : '.env belum ada', fix: 'cp .env.example .env, lalu isi key dari https://fish.audio/app/developers/' });
add({ ok: has('FISH_AUDIO_REFERENCE_ID'), need: 'opsional', name: '.env FISH_AUDIO_REFERENCE_ID', detail: has('FISH_AUDIO_REFERENCE_ID') ? 'terisi' : 'kosong (suara narator bisa berubah antarvideo)', fix: 'Isi id suara referensi Fish Audio' });

// Whisper
const wBin = existsSync('.whisper/main') || existsSync('.whisper/build/bin/main');
const wModel = existsSync('.whisper/ggml-small.bin');
add({ ok: wBin && wModel, need: 'opsional', name: 'whisper.cpp + model small', detail: wBin && wModel ? 'terpasang di .whisper/' : 'belum (dipasang otomatis saat npm run align pertama, ±540 MB)', fix: 'npm run setup:whisper' });

// Disk + alat pengujian
const free = (() => { try { const s = statfsSync('.'); return (s.bavail * s.bsize) / 1024 ** 3; } catch { return NaN; } })();
add({ ok: !(free < 2), need: 'wajib', name: 'ruang disk ≥ 2 GB', detail: Number.isNaN(free) ? 'tidak terbaca' : `${free.toFixed(1)} GB bebas`, fix: 'Kosongkan disk (render dan whisper butuh ruang)' });
const py = await version('python3', ['--version'], /Python (\S+)/);
const ssl = await version('openssl', ['version'], /SSL (\S+)/);
add({ ok: !!py && !!ssl, need: 'opsional', name: 'python3 + openssl', detail: py && ssl ? `python ${py}, openssl ${ssl} (npm run test:validator)` : 'tidak lengkap (hanya untuk pengujian validator)', fix: 'Pasang python3 dan openssl' });

for (const r of rows) console.log(`${r.ok ? '✓' : r.need === 'wajib' ? '✗' : '!'} ${r.name.padEnd(30)} ${r.detail}${r.ok || !r.fix ? '' : `\n    → ${r.fix}`}`);
const bad = rows.filter((r) => !r.ok && r.need === 'wajib').length;
console.log(bad ? `\n${bad} kebutuhan wajib belum terpenuhi.` : '\nLingkungan siap produksi.');
process.exitCode = bad ? 1 : 0;
