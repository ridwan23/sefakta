// Katalog gaya visual tambahan (katalog → KatalogGaya). Bukan episode. Satu scene per gaya yang dilengkapi:
// papan tulis, potongan kertas (lipat + pita), isometrik garis, siluet berlapis, rumus, clay, komik, risograf,
// grid Swiss, stickman.
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Reveal } from './anim/Reveal';
import { FONT_JAKARTA } from './brand/fonts';
import { Cutout, PAPER, PaperSurface } from './collage/pieces';
import { COMIC, comicGrid, ComicPage, ComicPanel, SoundWord, SpeechBubble, SpeedLines } from './comic/Comic';
import { RISO, RisoInk, RisoPaper, RisoPrint } from './riso/Riso';
import { Stickman } from './stickman/Stickman';
import { SWISS, swissGrid, SwissBlock, SwissGridLines, SwissRule, SwissSurface, SwissType } from './swiss/Swiss';
import { PaperFold, Ribbon } from './collage/fold';
import { isoView, IsoBox, IsoFlow, IsoGrid, ISO } from './iso/Iso';
import { Formula } from './math/Formula';
import { Bowl, Cup } from './objects/things';
import { Leaf, Sun } from './objects/nature';
import { MaterialStyle } from './render/Shaded';
import { ellipsePath } from './render/shapes';
import { Haze, Ridge, SilhouetteSky, SKY } from './silhouette/Silhouette';
import { BoardSurface, Hatch, INK, SketchPath, SketchText } from './sketch/Sketch';

const Title: React.FC<{ name: string; code: string; ink: string; muted: string }> = ({ name, code, ink, muted }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top: 70, fontFamily: FONT_JAKARTA }}>
    <Reveal at={0} kind="mask">
      <div style={{ fontSize: 46, fontWeight: 800, color: ink }}>{name}</div>
    </Reveal>
    <div style={{ marginTop: 8, fontFamily: 'Menlo, monospace', fontSize: 22, color: muted, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{code}</div>
  </div>
);

const Board: React.FC = () => (
  <>
    <BoardSurface />
    <Title name="Papan tulis" code={'<BoardSurface /> <SketchPath d at arrow />\n<Hatch d box at cross /> <SketchText text at />'} ink={INK.hitam} muted="#5A6270" />
    <SketchText x={540} y={470} text="Kenapa gula darah naik?" at={6} size={84} />
    <SketchPath d="M140 1320 L940 1320" at={20} width={6} />
    <SketchPath d="M160 1340 L160 620" at={24} width={6} />
    <SketchPath d="M170 1250 C330 1240 380 760 520 760 C660 760 700 1180 930 1210" at={36} dur={30} color={INK.merah} width={9} />
    <Hatch d={ellipsePath(520, 1000, 120, 160)} box={[400, 840, 240, 320]} at={70} cross color={INK.biru} gap={18} />
    <SketchPath d="M820 640 C760 620 640 640 560 740" at={100} color={INK.hitam} arrow arrowFrom={[600, 700]} arrowTo={[560, 740]} />
    <SketchText x={790} y={590} text="puncak!" at={104} color={INK.merah} size={64} rotate={-6} />
    <SketchText x={540} y={1430} text="waktu setelah makan →" at={120} size={52} color="#5A6270" />
  </>
);

const Chalk: React.FC = () => (
  <>
    <BoardSurface variant="chalk" />
    <Title name="Papan kapur" code={'<BoardSurface variant="chalk" /> <SketchPath chalk />'} ink={INK.kapur} muted="#A9B5AE" />
    <SketchText x={540} y={560} text="Air → Uap" at={4} size={110} color={INK.kapur} />
    <SketchPath d={ellipsePath(540, 1000, 240, 240)} at={20} chalk color={INK.kapur} width={10} />
    <Hatch d={ellipsePath(540, 1000, 240, 240)} box={[300, 760, 480, 480]} at={40} chalk color={INK.kapurKuning} outline={false} gap={22} width={5} />
    <SketchText x={540} y={1360} text="100 °C" at={70} size={96} color={INK.kapurKuning} />
  </>
);

const Paper: React.FC = () => (
  <>
    <PaperSurface color={PAPER.kraft} />
    <Title name="Potongan kertas: lipat · pita" code={'<PaperFold at openAt fold="v|h">…</PaperFold>\n<Ribbon text at />'} ink={PAPER.tinta} muted="#5B4630" />
    <Ribbon x={540} y={420} w={560} text="3 LANGKAH" at={6} />
    <PaperFold x={540} y={930} w={620} h={700} at={14} openAt={34}>
      <div style={{ padding: 60, fontFamily: FONT_JAKARTA, color: PAPER.tinta }}>
        <div style={{ fontSize: 52, fontWeight: 800 }}>Resep nasi dingin</div>
        {['Masak seperti biasa', 'Dinginkan 12 jam', 'Panaskan lagi'].map((t, i) => (
          <div key={t} style={{ marginTop: 50, fontSize: 40, fontWeight: 700, display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ width: 70, height: 70, borderRadius: 35, background: PAPER.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            {t}
          </div>
        ))}
      </div>
    </PaperFold>
    <PaperFold x={330} y={1490} w={340} h={240} at={60} openAt={74} fold="h" color={PAPER.stabilo} rotate={-4} seed={6}>
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_JAKARTA, fontSize: 44, fontWeight: 800, color: PAPER.tinta }}>Tips!</div>
    </PaperFold>
    <Cutout x={760} y={1500} w={300} h={200} at={84} color={PAPER.karton} rotate={5} seed={11}>
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_JAKARTA, fontSize: 64, fontWeight: 900, color: PAPER.merah }}>−30%</div>
    </Cutout>
  </>
);

const Iso: React.FC = () => {
  const v = isoView({ ox: 540, oy: 1060, unit: 78 });
  return (
    <>
      <AbsoluteFill style={{ background: ISO.latar }} />
      <Title name="Isometrik garis" code={'const v = isoView({ ox, oy, unit })\n<IsoGrid view={v} /> <IsoBox view={v} x y w d h /> <IsoFlow points />'} ink={ISO.garis} muted="#5A6B7C" />
      <IsoGrid view={v} size={6} at={2} />
      <IsoFlow view={v} points={[[-4.5, -0.5], [-0.5, -0.5], [-0.5, 3.5], [3, 3.5]]} at={44} />
      <IsoBox view={v} x={-5.5} y={-1.5} w={2} d={2} h={2} at={14} label="Pabrik" windows={[2, 2]} />
      <IsoBox view={v} x={-1.5} y={-3.5} w={2} d={2} h={4} at={22} color="#DDE7EF" windows={[4, 2]} />
      <IsoBox view={v} x={2} y={2.5} w={2} d={2} h={1.3} at={30} color={ISO.aksen} label="Toko" />
      <IsoBox view={v} x={1.5} y={-2} w={1} d={1} h={1} at={36} wire />
    </>
  );
};

const Silhouette: React.FC = () => (
  <>
    <SilhouetteSky palette={SKY.senja} sunY={0.5} riseAt={0} />
    <Title name="Siluet berlapis" code={'<SilhouetteSky palette={SKY.senja} riseAt />\n<Ridge kind="mountains|hills|trees|city|grass" depth y />'} ink="#FFF1DE" muted="#F3C9B0" />
    <Ridge kind="mountains" depth={0.85} y={1180} seed={2} at={4} />
    <Haze y={1180} />
    <Ridge kind="city" depth={0.6} y={1330} seed={4} scale={0.8} at={14} />
    <Ridge kind="hills" depth={0.35} y={1460} seed={5} at={22} />
    <Ridge kind="trees" depth={0.08} y={1650} seed={8} at={30} />
    <Ridge kind="grass" depth={0} y={1800} seed={9} />
  </>
);

const Night: React.FC = () => (
  <>
    <SilhouetteSky palette={SKY.malam} sunX={0.72} sunY={0.24} sunR={70} stars={1} />
    <Title name="Siluet malam" code="<SilhouetteSky palette={SKY.malam} stars={1} />" ink="#E8EEF7" muted="#8EA3C4" />
    <Ridge kind="mountains" palette={SKY.malam} depth={0.7} y={1250} seed={6} />
    <Ridge kind="trees" palette={SKY.malam} depth={0.1} y={1600} seed={3} scale={1.3} />
  </>
);

const MathScene: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 30%, #18264A 0%, #0B1530 70%)' }} />
    <Title name="Rumus" code={'<Formula tex="v = \\frac{\\Delta s}{\\Delta t}" at highlightAt />\n\\frac \\sqrt ^ _ \\hl{} \\text{}'} ink="#F4F1EA" muted="#8EA3C4" />
    <Formula x={540} y={560} tex="E = mc^2" at={6} />
    <Formula x={540} y={880} tex="\hl{v} = \frac{\Delta s}{\Delta t}" at={30} highlightAt={64} />
    <Formula x={540} y={1220} tex="c = \sqrt{a^2 + b^2}" at={70} size={84} />
    <Formula x={540} y={1500} tex="\text{BMI} = \frac{\text{berat}}{\text{tinggi}^2}" at={100} size={70} accent="#5BC0EB" />
  </>
);

const Clay: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: 'radial-gradient(110% 80% at 45% 35%, #FDE9D6 0%, #F2C9A8 70%, #E3AE8A 100%)' }} />
    <Title name="Clay (material)" code={'<MaterialStyle material="clay">…objek…</MaterialStyle>\n<Shaded material="clay" />'} ink="#5A2E1E" muted="#8A5A44" />
    <MaterialStyle material="clay">
      <Sun x={760} y={520} size={260} at={4} color="#FFB347" />
      <Bowl x={420} y={1020} size={440} at={10} fill="rice" ground={1160} color="#5FA8D3" />
      <Cup x={780} y={1040} size={260} at={20} ground={1160} color="#E76F51" />
      <Leaf x={560} y={1450} size={260} at={30} ground={1580} />
    </MaterialStyle>
  </>
);

const Comic: React.FC = () => {
  const [a, b, c] = comicGrid({ x: 70, y: 330, w: 940, h: 1180, rows: [[1, 1], [1]], heights: [1.15, 1] });
  return (
    <>
      <ComicPage />
      <Title name="Komik" code={'comicGrid({ rows }) <ComicPanel at dots zoomTo />\n<SpeechBubble kind tail /> <SoundWord burst /> <SpeedLines />'} ink={COMIC.tinta} muted="#6B5B3E" />
      <ComicPanel {...a} at={4} color="#DDF3FB" zoomTo={1.06}>
        <Stickman x={a.w * 0.5} y={a.h - 30} size={300} poses={[[0, 'berdiri'], [40, 'bingung']]} at={10} />
        <SpeechBubble x={a.w / 2} y={135} w={a.w - 50} h={210} size={38} tail={[a.w * 0.5, 300]} text="Kenapa aku bersin kena matahari?" at={20} emphasis={[3, 4]} />
      </ComicPanel>
      <ComicPanel {...b} at={50} color={COMIC.kuning} dots={COMIC.merah}>
        <SpeedLines cx={b.w / 2} cy={b.h * 0.55} inner={150} at={56} />
        <SoundWord x={b.w / 2} y={b.h * 0.55} text="HACHI!" size={110} at={58} burst="#FFFFFF" />
      </ComicPanel>
      <ComicPanel {...c} at={84} color="#FFFFFF" dots={COMIC.biru}>
        <SpeechBubble x={260} y={70} w={460} h={84} kind="box" size={32} text="Faktanya: 1 dari 4 orang" at={90} perWord={2} />
        <Stickman x={c.w * 0.28} y={c.h - 30} size={330} pose="mikir" at={92} />
        <SpeechBubble x={c.w * 0.68} y={c.h * 0.48} w={460} h={250} kind="thought" size={36} tail={[c.w * 0.36, c.h * 0.6]} text="Refleks fotik bersin!" at={104} />
      </ComicPanel>
    </>
  );
};

const Riso: React.FC = () => (
  <>
    <RisoPaper />
    <Title name="Risograf" code={'<RisoInk color={RISO.biru} offset grain>…hitam/abu…</RisoInk>\n<RisoPrint inks={[{ color, from: "r" }]}>…visual berwarna…</RisoPrint>'} ink={RISO.federal} muted="#7A6F86" />
    <RisoInk color={RISO.biru} seed={2} grain={0.55}>
      <div style={{ position: 'absolute', left: 120, top: 420, width: 560, height: 560, borderRadius: '50%', background: '#000' }} />
      <div style={{ position: 'absolute', left: 90, top: 1060, width: 900, height: 18, background: '#000' }} />
      <div style={{ position: 'absolute', left: 90, top: 1100, fontFamily: FONT_JAKARTA, fontWeight: 800, fontSize: 64, color: '#000', width: 900 }}>Matahari pagi</div>
    </RisoInk>
    <RisoInk color={RISO.pink} offset={[7, -4]} seed={5} grain={0.55}>
      <div style={{ position: 'absolute', left: 420, top: 600, width: 520, height: 520, borderRadius: '50%', background: '#555' }} />
      <div style={{ position: 'absolute', left: 90, top: 1180, fontFamily: FONT_JAKARTA, fontWeight: 800, fontSize: 150, color: '#000' }}>1 : 4</div>
    </RisoInk>
    <div style={{ position: 'absolute', left: 90, top: 1400, width: 900, height: 300 }}>
      <RisoPrint grain={0.5} paper={false} inks={[{ color: RISO.biru, from: 'r' }, { color: RISO.pink, from: 'g', offset: [5, -3] }, { color: RISO.kuning, from: 'b', offset: [-4, 3] }]}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 900, height: 300, display: 'flex', gap: 24 }}>
          {['#E63946', '#2B7DE9', '#141414', '#FFD23F'].map((c) => (
            <div key={c} style={{ flex: 1, background: c, borderRadius: 18 }} />
          ))}
        </div>
      </RisoPrint>
    </div>
  </>
);

const Swiss: React.FC = () => {
  const g = swissGrid();
  return (
    <>
      <SwissSurface />
      <SwissGridLines g={g} at={0} />
      <Title name="Grid Swiss" code={'const g = swissGrid(); g.rect(col, row, cs, rs)\n<SwissBlock from /> <SwissType lines /> <SwissRule />'} ink={SWISS.hitam} muted="#6A6A6A" />
      <SwissBlock {...g.rect(0, 1, 4, 5)} color={SWISS.merah} at={20} from="down" />
      <SwissType {...g.rect(0, 1, 4, 5)} lines={['78%']} size={250} color={SWISS.kertas} at={34} align="bottom" />
      <SwissBlock {...g.rect(4, 1, 2, 2)} color={SWISS.hitam} at={28} from="left" />
      <SwissType {...g.rect(0, 6, 6, 3)} lines={['tubuh bayi', 'adalah air.']} size={110} at={46} colors={[undefined, SWISS.merah]} />
      <SwissRule {...g.rect(0, 9, 6, 0)} at={60} />
      <SwissType {...g.rect(0, 10, 3, 2)} lines={['Dewasa', '±60%']} size={58} weight={700} at={70} />
      <SwissType {...g.rect(3, 10, 3, 2)} lines={['Lansia', '±50%']} size={58} weight={700} at={76} />
      <SwissBlock {...g.rect(5, 6, 1, 1)} color={SWISS.biru} at={84} from="up" />
    </>
  );
};

const Stick: React.FC = () => (
  <>
    <BoardSurface />
    <Title name="Stickman" code={'<Stickman x y size poses={[[f, "kaget"], …]} at />\n<Stickman cycle="jalan|lari" travel={[x0, x1]} />  POSES'} ink={INK.hitam} muted="#5A6270" />
    <SketchPath d="M60 1500 L1020 1500" width={6} />
    <Stickman x={300} y={1500} size={520} at={2} poses={[[0, 'berdiri'], [30, 'kaget'], [60, 'tunjuk'], [90, 'sorak']]} />
    <Stickman x={0} y={1500} size={420} cycle="jalan" travel={[620, 980]} color={INK.biru} />
    <Stickman x={0} y={1820} size={260} cycle="lari" cadence={3} travel={[-100, 1180]} color={INK.merah} />
    <SketchText x={300} y={760} text="pose bernama" at={8} size={54} color="#5A6270" />
    <SketchText x={800} y={900} text="siklus jalan" at={12} size={54} color={INK.biru} />
  </>
);

const S: [string, React.FC, number][] = [
  ['Papan tulis', Board, 175],
  ['Papan kapur', Chalk, 100],
  ['Potongan kertas', Paper, 130],
  ['Isometrik', Iso, 110],
  ['Siluet', Silhouette, 110],
  ['Siluet malam', Night, 70],
  ['Rumus', MathScene, 150],
  ['Clay', Clay, 90],
  ['Komik', Comic, 160],
  ['Risograf', Riso, 90],
  ['Grid Swiss', Swiss, 130],
  ['Stickman', Stick, 120],
];

export const KATALOG_GAYA_FRAMES = S.reduce((a, [, , n]) => a + n, 0);

export const KatalogGaya: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ fontFamily: FONT_JAKARTA }}>
      {S.map(([name, C, n]) => {
        const el = (
          <Sequence key={name} name={name} from={from} durationInFrames={n}>
            <AbsoluteFill>
              <C />
            </AbsoluteFill>
          </Sequence>
        );
        from += n;
        return el;
      })}
    </AbsoluteFill>
  );
};
