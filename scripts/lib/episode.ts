// Bersama untuk skrip episode: membaca brief, path aset, ffmpeg/ffprobe, angka → kata (bahasa Indonesia).
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';

export const run = promisify(execFile);
export const FPS = 30;
export const CTA_SECONDS = 4;
export const LUFS_TARGET = -14;
export const LUFS_TOLERANCE = 1;
export const TRUE_PEAK = -1.5;
export const SCENE_PAD_SECONDS = 0.5; // jeda setelah kalimat sebelum scene berikutnya

export type Scene = {
  id: string;
  durationSeconds: number;
  voiceoverText: string;
  voiceoverSpeed?: number;
  caption?: string;
  headline?: string;
  visual?: string;
  factIds?: string[];
};
export type Brief = { projectId: string; title: string; status: string; captionMode: string; scenes: Scene[]; [k: string]: unknown };

export const arg = (name: string) => process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
export const flag = (name: string) => process.argv.includes(`--${name}`);

export const loadBrief = (): { brief: Brief; path: string } => {
  const p = arg('brief');
  if (!p) throw new Error('Wajib: --brief=briefs/<episode>.json');
  const path = resolve(p);
  return { brief: JSON.parse(readFileSync(path, 'utf8')), path };
};

/** Lokasi aset runtime satu episode: public/<projectId>/ */
export const paths = (projectId: string) => {
  const dir = resolve('public', projectId);
  return {
    dir,
    voDir: resolve(dir, 'vo'),
    vo: (id: string) => resolve(dir, 'vo', `${id}.mp3`),
    voStatic: (id: string) => `${projectId}/vo/${id}.mp3`,
    manifest: resolve(dir, 'manifest.json'),
    captions: resolve(dir, 'captions.json'),
  };
};

/** Sidik teks + kecepatan: bila naskah berubah, audio/caption lama terdeteksi usang. */
export const textHash = (text: string, speed?: number) => createHash('sha1').update(`${text}|${speed ?? ''}`).digest('hex').slice(0, 12);

export const durationSeconds = async (file: string) => {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  const d = Number(stdout.trim());
  if (!Number.isFinite(d) || d <= 0) throw new Error(`Durasi audio tidak valid: ${file}`);
  return d;
};

/** Loudness terintegrasi (LUFS) dan true peak (dBTP) menurut EBU R128. */
export const loudness = async (file: string) => {
  const { stderr } = await run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { maxBuffer: 64 * 1024 * 1024 });
  const tail = stderr.slice(stderr.lastIndexOf('Summary:'));
  const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(tail)?.[1]);
  const TP = Number(/Peak:\s+(-?[\d.]+|-inf) dBFS/.exec(tail)?.[1]);
  return { lufs: I, truePeak: TP };
};

// ---------------------------------------------------------------- angka → kata (untuk mencocokkan "90" dengan "sembilan puluh")
const SATUAN = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
export const numberToWords = (n: number): string => {
  if (!Number.isInteger(n) || n < 0) return String(n);
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) return `${SATUAN[Math.floor(n / 10)]} puluh${n % 10 ? ' ' + SATUAN[n % 10] : ''}`;
  if (n < 200) return `seratus${n % 100 ? ' ' + numberToWords(n % 100) : ''}`;
  if (n < 1000) return `${SATUAN[Math.floor(n / 100)]} ratus${n % 100 ? ' ' + numberToWords(n % 100) : ''}`;
  if (n < 2000) return `seribu${n % 1000 ? ' ' + numberToWords(n % 1000) : ''}`;
  if (n < 1e6) return `${numberToWords(Math.floor(n / 1000))} ribu${n % 1000 ? ' ' + numberToWords(n % 1000) : ''}`;
  return `${numberToWords(Math.floor(n / 1e6))} juta${n % 1e6 ? ' ' + numberToWords(n % 1e6) : ''}`;
};

/** Kata dinormalisasi untuk dicocokkan: huruf kecil, tanpa tanda baca; angka digit diuraikan jadi kata; % → persen. */
export const normWords = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/(\d+)\s*%/g, '$1 persen')
    .replace(/\d+(?:[.,]\d+)?/g, (m) => (/[.,]/.test(m) ? m.replace(/[.,]/, ' koma ') : numberToWords(Number(m))))
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
