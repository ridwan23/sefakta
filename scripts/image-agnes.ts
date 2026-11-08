// Ilustrasi latar per scene lewat Agnes AI (OpenAI-compatible), disimpan sebagai aset episode.
//
//   npm run image -- --brief=briefs/<episode>.json --dry-run         # tampilkan prompt, tanpa API
//   npm run image -- --brief=briefs/<episode>.json                   # buat scene ber-imagePrompt yang belum ada / berubah
//   npm run image -- --brief=... --scene=hook --force                # buat ulang satu scene
//
// Struktur prompt resmi Agnes: [Subject] + [Scene/Environment] + [Style] + [Lighting] + [Composition] + [Quality].
//   scenes[].imagePrompt = Subject + Scene (isi adegan, bahasa Inggris)
//   imageStyle (brief)   = Style + Lighting, dikunci untuk SEMUA scene episode
//   Composition + Quality + larangan teks/logo = tetap, ditambahkan skrip. Teks di layar tetap dari kode.
// Kunci di .env: AGNES_API_KEY (wajib), AGNES_IMAGE_MODEL, AGNES_IMAGE_SIZE (tier 1K/2K/3K/4K), AGNES_IMAGE_RATIO.
// Kunci tidak pernah ditulis ke file.
// Hasil: public/<projectId>/img/<scene>.jpg + public/<projectId>/images.json (prompt, model, hash, penanda AI).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { rmSync } from 'node:fs';
import { arg, flag, loadBrief, run, textHash } from './lib/episode.ts';

const API_URL = (process.env.AGNES_API_BASE ?? 'https://apihub.agnes-ai.com') + '/v1/images/generations';
const apiKey = process.env.AGNES_API_KEY;
const model = process.env.AGNES_IMAGE_MODEL ?? 'agnes-image-2.5-flash';
// Agnes memakai tier + rasio, bukan piksel bebas. 2K 9:16 = 1152x2048 ≈ 1080x1920; objectFit cover menyesuaikan di Remotion.
const size = process.env.AGNES_IMAGE_SIZE ?? '2K';
const ratio = process.env.AGNES_IMAGE_RATIO ?? '9:16';
const dryRun = flag('dry-run');
const force = flag('force');
const only = arg('scene');

const COMPOSITION = 'Vertical 9:16 composition, single clear focal subject in the center, calm uncluttered areas at the top and bottom for captions.';
const QUALITY = 'Clean crisp details, coherent perspective, consistent style. No text, no letters, no numbers, no logos, no watermark, no real person likeness.';

if (!dryRun && !apiKey) throw new Error('AGNES_API_KEY belum ada. Buat di https://platform.agnes-ai.com/settings/apiKeys lalu isi .env.');

const { brief } = loadBrief();
const style = (brief as { imageStyle?: string }).imageStyle;
if (!style) throw new Error('Brief belum punya "imageStyle" (kalimat gaya yang dikunci untuk semua gambar episode).');
const scenes = brief.scenes as (typeof brief.scenes[number] & { imagePrompt?: string })[];
if (only && !scenes.some((s) => s.id === only)) throw new Error(`Scene '${only}' tidak ada di brief.`);

const dir = resolve('public', brief.projectId);
const imgDir = resolve(dir, 'img');
const manifestPath = resolve(dir, 'images.json');
type Entry = { id: string; file: string; prompt: string; hash: string; model: string; size: string; aiGenerated: true; generatedAt: string };
const old: { images?: Entry[] } = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const entries = new Map((old.images ?? []).map((e) => [e.id, e]));

const generate = async (prompt: string): Promise<Buffer> => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, n: 1, size, ratio }),
      signal: AbortSignal.timeout(300_000), // generasi bisa puluhan detik; dokumen menyarankan 60–360 dtk
    });
    if (res.ok) {
      const item = ((await res.json()) as { data?: { url?: string; b64_json?: string }[] }).data?.[0];
      if (item?.b64_json) return Buffer.from(item.b64_json, 'base64');
      if (item?.url) {
        const img = await fetch(item.url);
        if (!img.ok) throw new Error(`Unduh gambar gagal (HTTP ${img.status})`);
        return Buffer.from(await img.arrayBuffer());
      }
      throw new Error('Respons Agnes tidak berisi gambar.');
    }
    const details = (await res.text()).slice(0, 300);
    if (!(res.status === 429 || res.status >= 500) || attempt === 3) throw new Error(`Agnes gagal (HTTP ${res.status}): ${details}`);
    await new Promise((r) => setTimeout(r, attempt * 2000));
  }
  throw new Error('Agnes gagal setelah tiga percobaan.');
};

let made = 0;
for (const scene of scenes) {
  if (!scene.imagePrompt || (only && only !== scene.id)) continue;
  const prompt = `${scene.imagePrompt.trim()} ${style.trim()} ${COMPOSITION} ${QUALITY}`;
  const hash = textHash(`${model}|${size}|${ratio}|${prompt}`);
  const file = resolve(imgDir, `${scene.id}.jpg`);
  const prev = entries.get(scene.id);
  if (!force && prev?.hash === hash && existsSync(file)) {
    console.log(`= ${scene.id}: sudah ada`);
    continue;
  }
  if (dryRun) {
    console.log(`→ ${scene.id} (${model}, ${size} ${ratio}):\n  ${prompt}`);
    continue;
  }
  console.log(`→ ${scene.id}: membuat gambar`);
  mkdirSync(imgDir, { recursive: true });
  // Dibuat 2K supaya detail bagus, lalu diperkecil ke 1242x2208 (frame 1080x1920 + zoom 1,14×) dan dikompres JPEG:
  // tetap tajam di video, file ±0,5 MB, bukan ±4,5 MB.
  const raw = resolve(imgDir, `${scene.id}.raw.png`);
  writeFileSync(raw, await generate(prompt));
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-vf', 'scale=1242:2208:flags=lanczos', '-q:v', '3', file]);
  rmSync(raw);
  entries.set(scene.id, { id: scene.id, file: `${brief.projectId}/img/${scene.id}.jpg`, prompt, hash, model, size: `${size} ${ratio}`, aiGenerated: true, generatedAt: new Date().toISOString() });
  writeFileSync(manifestPath, JSON.stringify({ projectId: brief.projectId, provider: 'agnes-ai', images: [...entries.values()] }, null, 2) + '\n');
  made++;
  console.log(`✓ ${scene.id}: public/${brief.projectId}/img/${scene.id}.jpg`);
}
if (!made && !dryRun) console.log('Tidak ada gambar baru (cek imagePrompt di scene brief).');
if (made) console.log('Dengarkan/lihat hasilnya: gambar AI wajib dicek akurasi sejarahnya dan diberi label "ilustrasi" di layar.');
