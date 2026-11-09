// SFX sintesis milik SeFakta (dibuat dari kode, tanpa sampel pihak ketiga → lisensi bersih, bisa dibuat ulang persis).
//
//   npm run sfx:make            # tulis public/sfx/*.wav + public/sfx/LICENSES.json
//
// Setiap bunyi = rumus gelombang deterministik (tanpa acak sungguhan; derau memakai PRNG berbiji tetap),
// dinormalisasi ke puncak -6 dBFS (bunyi pendek; aturan PANDUAN-AI-AGENT-PRODUKSI §7.3), 48 kHz, 16-bit mono.
// Tambah bunyi baru di SOUNDS; LICENSES.json ditulis ulang dan mempertahankan catatan file lain (sumber luar).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RATE = 48000;
const PEAK_DB = -6;
const OUT = 'public/sfx';

type Sound = { file: string; seconds: number; desc: string; wave: (t: number) => number };

/** PRNG berbiji tetap (mulberry32) untuk derau yang sama di setiap pembuatan. */
const prng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};
const sin = (f: number, t: number, ph = 0) => Math.sin(2 * Math.PI * f * t + ph);
const env = (t: number, attack: number, decay: number) => (t < 0 ? 0 : Math.min(1, t / attack) * Math.exp(-decay * t));

const noiseA = prng(7);
const noiseB = prng(11);
/** Derau yang sudah dibuat sebelumnya (supaya rumus tetap fungsi murni dari t). */
const table = (rnd: () => number, n: number) => Float32Array.from({ length: n }, () => rnd() * 2 - 1);
const NOISE_A = table(noiseA, RATE);
const NOISE_B = table(noiseB, RATE);
const noise = (tab: Float32Array, t: number) => tab[Math.floor(t * RATE) % tab.length];

const SOUNDS: Sound[] = [
  {
    file: 'notif-ting.wav',
    seconds: 0.7,
    desc: 'Notifikasi ponsel dua nada (E6 → A6) dengan peluruhan lembut',
    wave: (t) => {
      const a = env(t, 0.004, 7) * (sin(1318.5, t) + 0.25 * sin(2637, t));
      const t2 = t - 0.11;
      const b = env(t2, 0.004, 6) * (sin(1760, t2) + 0.2 * sin(3520, t2));
      return 0.55 * a + 0.6 * b;
    },
  },
  {
    file: 'hum-low.wav',
    seconds: 1.1,
    desc: 'Dengung rendah singkat yang naik lalu memudar (nuansa ganjil); parsial 220–330 Hz agar terdengar di speaker ponsel',
    wave: (t) => {
      const shape = Math.sin(Math.PI * Math.min(1, t / 1.1)) ** 1.5;
      const wob = 1 + 0.15 * sin(5.5, t);
      return shape * wob * (0.5 * sin(55, t) + 0.35 * sin(110, t, 0.4) + 0.3 * sin(220, t, 1.1) + 0.18 * sin(331, t, 2));
    },
  },
  {
    file: 'stamp-thud.wav',
    seconds: 0.45,
    desc: 'Ketukan stempel: dentum rendah dengan nada turun + derau ketukan singkat',
    wave: (t) => {
      const f = 150 * Math.exp(-6 * t) + 65;
      const body = env(t, 0.002, 14) * Math.sin(2 * Math.PI * f * t);
      const knock = env(t, 0.001, 90) * noise(NOISE_A, t);
      return 0.9 * body + 0.45 * knock;
    },
  },
  {
    file: 'pop-soft.wav',
    seconds: 0.35,
    desc: 'Pop lembut naik (sorotan/perhatian): nada meluncur 620 → 1240 Hz dengan kilau oktaf',
    wave: (t) => {
      // frekuensi 620 + 620·(1 − e^(−28t)) Hz → fase = 2π·∫f dt
      const ph = 2 * Math.PI * (1240 * t - (620 * (1 - Math.exp(-28 * t))) / 28);
      return env(t, 0.003, 13) * (Math.sin(ph) + 0.3 * Math.sin(2 * ph));
    },
  },
  {
    file: 'toggle-click.wav',
    seconds: 0.18,
    desc: 'Klik sakelar UI: dua klik pendek bernada (tekan dan lepas)',
    wave: (t) => {
      const c1 = env(t, 0.0005, 260) * (0.6 * sin(2300, t) + 0.5 * noise(NOISE_B, t));
      const t2 = t - 0.055;
      const c2 = env(t2, 0.0005, 300) * (0.5 * sin(1700, t2) + 0.4 * noise(NOISE_B, t2 + 0.3));
      return c1 + 0.8 * c2;
    },
  },
];

const wav = (samples: Float32Array) => {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};

mkdirSync(OUT, { recursive: true });
const licPath = join(OUT, 'LICENSES.json');
type Lic = { file: string; sumber: string; pembuat: string; lisensi: string; atribusi: string | null; diakses: string; normalisasi: string; keterangan?: string };
const old: Lic[] = existsSync(licPath) ? JSON.parse(readFileSync(licPath, 'utf8')) : [];
const ours = new Set(SOUNDS.map((s) => s.file));
const today = new Date().toISOString().slice(0, 10);
const entries: Lic[] = old.filter((l) => !ours.has(l.file));

for (const s of SOUNDS) {
  const n = Math.round(s.seconds * RATE);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = s.wave(i / RATE);
  // ujung dipudarkan 5 ms agar tidak ada klik
  const fade = Math.round(0.005 * RATE);
  for (let i = 0; i < fade; i++) buf[n - 1 - i] *= i / fade;
  const peak = buf.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
  const gain = 10 ** (PEAK_DB / 20) / peak;
  for (let i = 0; i < n; i++) buf[i] *= gain;
  writeFileSync(join(OUT, s.file), wav(buf));
  entries.push({
    file: s.file,
    sumber: 'dibuat sendiri: scripts/make-sfx.ts (sintesis, tanpa sampel pihak ketiga)',
    pembuat: 'SeFakta',
    lisensi: 'milik SeFakta',
    atribusi: null,
    diakses: today,
    normalisasi: `puncak ${PEAK_DB} dBFS, 48 kHz 16-bit mono`,
    keterangan: s.desc,
  });
  console.log(`✓ ${OUT}/${s.file}  ${s.seconds}s  — ${s.desc}`);
}
entries.sort((a, b) => a.file.localeCompare(b.file));
writeFileSync(licPath, JSON.stringify(entries, null, 2) + '\n');
console.log(`Lisensi: ${licPath} (${entries.length} file)`);
