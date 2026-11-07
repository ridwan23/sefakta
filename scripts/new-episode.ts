// Membuat kerangka episode baru: brief, folder topik (komposisi + peta visual), dan mendaftarkannya di Root.
//
//   npm run new:episode -- tambora-1815 --title="Letusan Tambora 1815" --series=Alam
//
// Setelah itu: isi facts[] + naskah di brief → npm run validate:facts → npm run vo → npm run align →
// buat visual per scene di src/topics/<id>/scenes.tsx → npm run quality.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { arg } from './lib/episode.ts';

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) throw new Error('Pakai id kebab-case, mis.: npm run new:episode -- tambora-1815');
const SERIES = ['Alam', 'Sains', 'Sejarah', 'Antariksa', 'Teknologi', 'Tubuh'];
const series = arg('series') ?? 'Sains';
if (!SERIES.includes(series)) throw new Error(`--series harus salah satu dari: ${SERIES.join(', ')}`);
const title = arg('title') ?? id;
const pascal = id.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const compId = `Ep${pascal}`;
const briefPath = `briefs/${id}.json`;
const topicDir = `src/topics/${id}`;
if (existsSync(briefPath) || existsSync(topicDir)) throw new Error(`Episode ${id} sudah ada.`);

const scene = (sid: string, seconds: number, purpose: string) => ({
  id: sid,
  durationSeconds: seconds,
  voiceoverText: `TODO ${purpose}.`,
  caption: '',
  headline: `TODO ${purpose}`,
  visual: `TODO arahan visual: ${purpose}`,
  factIds: [],
});
const brief = {
  projectId: id,
  title,
  series,
  status: 'draft',
  captionMode: 'subtitle',
  visualStyle: {
    name: 'TODO nama gaya (mis. peta arsip sepia, diagram sains bersih, infografis neon)',
    reason: 'TODO kenapa gaya ini cocok dengan isi fakta episode',
    tone: 'dark',
    palette: ['#0D2250', '#FFB000', '#FFFFFF'],
  },
  scenes: [
    scene('hook', 5, 'hook: pertanyaan spesifik + objek/akibat utama'),
    scene('konteks', 10, 'konteks: siapa, kapan, di mana'),
    scene('mekanisme', 20, 'mekanisme: bagaimana dan mengapa'),
    scene('dampak', 15, 'dampak: bukti, angka, sebelum/sesudah'),
    scene('jawaban', 8, 'jawaban: tuntaskan janji hook'),
  ],
  facts: [],
  numbersIgnored: [],
};
writeFileSync(briefPath, JSON.stringify(brief, null, 2) + '\n');

mkdirSync(topicDir, { recursive: true });
writeFileSync(
  `${topicDir}/scenes.tsx`,
  `import type { SceneVisuals } from '../../shared/episode/types';

/** Visual per scene (kunci = id scene di briefs/${id}.json). Scene yang tidak ada di sini memakai placeholder,
 *  dan \`npm run check:episodes -- --publish\` menolaknya. Komponen menerima { scene, durationInFrames }. */
export const VISUALS: SceneVisuals = {};
`,
);
writeFileSync(
  `${topicDir}/compositions.tsx`,
  `import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/${id}.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const ${pascal}: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "${title}". Durasi dihitung dari audio VO (public/${id}/manifest.json). */
export const ${pascal}Compositions: React.FC = () => (
  <Folder name="${id}">
    <Composition
      id="${compId}"
      component={${pascal}}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
`,
);

const root = readFileSync('src/Root.tsx', 'utf8');
const imp = `import { ${pascal}Compositions } from './topics/${id}/compositions';\n`;
const withImport = root.replace(/(import [^\n]+\n)(?![\s\S]*import )/, `$1${imp}`);
const withUse = withImport.replace(/(\s*)<\/>/, `$1  <${pascal}Compositions />$1</>`);
if (withUse === root || !withUse.includes(`<${pascal}Compositions />`)) throw new Error('Gagal mendaftarkan di src/Root.tsx; tambahkan manual.');
writeFileSync('src/Root.tsx', withUse);

console.log(`Episode dibuat:
  ${briefPath}                   brief (isi naskah + facts[])
  ${topicDir}/scenes.tsx        visual per scene
  ${topicDir}/compositions.tsx  komposisi "${compId}" (terdaftar di src/Root.tsx)

Langkah berikutnya:
  1. Isi naskah dan facts[]           → npm run validate:facts
  2. Voice-over Fish Audio            → npm run vo -- --brief=${briefPath}
  3. Caption tersinkron (whisper)     → npm run align -- --brief=${briefPath}
  4. Visual per scene di scenes.tsx   → npm start (pratinjau)
  5. Gerbang                          → npm run quality   (sebelum tayang: npm run check:publish)`);
