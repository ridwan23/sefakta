// Katalog kolase dan label (katalog → KatalogCollage). Bukan episode.
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Reveal } from '../anim/Reveal';
import { FONT_JAKARTA } from '../brand/fonts';
import { Label } from '../labels/Label';
import { Bowl } from '../objects/things';
import { Highlighter, MarkerArrow, MarkerCircle, Underline } from './marks';
import { Cutout, Doc, PAPER, PaperClip, PaperSurface, Stamp, Tag, Tape } from './pieces';

const Title: React.FC<{ name: string; code: string }> = ({ name, code }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top: 70 }}>
    <Reveal at={0} kind="mask">
      <div style={{ fontSize: 46, fontWeight: 800, color: PAPER.tinta }}>{name}</div>
    </Reveal>
    <div style={{ marginTop: 8, fontFamily: 'Menlo, monospace', fontSize: 22, color: '#6B5A45', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{code}</div>
  </div>
);

const Pieces: React.FC = () => (
  <>
    <PaperSurface />
    <Title name="Cutout · Doc · Tape" code={'<Cutout w h torn halftone at /> <Doc keyLine highlightAt />\n<Tape /> <PaperClip />'} />
    <Cutout x={350} y={575} w={490} h={360} rotate={3} at={2} color={PAPER.teal} seed={4} rough={10} />
    <Cutout x={330} y={560} w={420} h={300} rotate={-5} at={6} border={14} color="#FFFFFF" torn={[]} halftone={0.55} seed={4}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 35%, #F7C873, #C56B50 60%, #5A3324)' }} />
    </Cutout>
    <Tape x={200} y={420} w={150} rotate={-28} at={22} />
    <Cutout x={780} y={600} w={340} h={240} rotate={6} at={14} color={PAPER.kraft} seed={9} from="right">
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 64, color: PAPER.tinta }}>1815</div>
    </Cutout>
    <Doc x={540} y={1150} w={700} title="Laporan" keyLine="Letusan menutup matahari setahun" keyIndex={3} at={30} highlightAt={60} rotate={-2} seed={6} />
    <PaperClip x={330} y={860} size={56} at={44} />
  </>
);

const Marks: React.FC = () => (
  <>
    <PaperSurface color={PAPER.koran} />
    <Title name="Highlighter · MarkerCircle · Underline · MarkerArrow" code={'<Highlighter x y w at /> <MarkerCircle x y rx ry at />\n<Underline double /> <MarkerArrow from to />'} />
    <div style={{ position: 'absolute', left: 120, top: 520, fontSize: 64, fontWeight: 800, color: PAPER.tinta }}>Gula darah naik</div>
    <Highlighter x={120} y={562} w={500} at={10} />
    <div style={{ position: 'absolute', left: 120, top: 760, fontSize: 64, fontWeight: 800, color: PAPER.tinta }}>lebih lambat</div>
    <MarkerCircle x={310} y={800} rx={230} ry={70} at={30} />
    <div style={{ position: 'absolute', left: 120, top: 1000, fontSize: 64, fontWeight: 800, color: PAPER.tinta }}>setelah didinginkan</div>
    <Underline x={120} y={1090} w={560} at={50} double />
    <MarkerArrow from={[860, 1300]} to={[640, 1110]} at={70} color={PAPER.teal} />
  </>
);

const Accents: React.FC = () => (
  <>
    <PaperSurface color={PAPER.kraft} />
    <Title name="Stamp · Tag" code={'<Stamp text="FAKTA" at /> <Tag text="Arsip 1816" at />'} />
    <Cutout x={540} y={800} w={640} h={460} rotate={2} color={PAPER.karton} seed={12} />
    <Stamp x={540} y={760} text="FAKTA" at={20} />
    <Stamp x={700} y={930} text="MITOS" at={45} color={PAPER.teal} rotate={10} size={34} seed={9} />
    <Tag x={380} y={1240} text="Arsip 1816" at={10} />
    <Tape x={300} y={590} w={170} rotate={-35} at={4} />
    <Tape x={790} y={590} w={170} rotate={32} at={6} seed={3} />
  </>
);

const Labels: React.FC = () => (
  <>
    <PaperSurface />
    <Title name="Label · garis penunjuk" code={'<Label text target={[x, y]} at variant="solid|paper|ghost" />'} />
    <Bowl x={540} y={960} size={460} fill="rice" ground={1150} />
    <Label x={300} y={600} text="Nasi dingin" sub="disimpan 12 jam" target={[480, 880]} at={10} />
    <Label x={820} y={680} text="Uap" target={[620, 820]} at={30} variant="paper" />
    <Label x={760} y={1340} text="Pati resisten" target={[640, 1020]} at={50} variant="ghost" accent={PAPER.merah} elbow />
  </>
);

const S: [string, React.FC, number][] = [
  ['Potongan', Pieces, 100],
  ['Coretan', Marks, 110],
  ['Aksen', Accents, 90],
  ['Label', Labels, 90],
];

export const KATALOG_COLLAGE_FRAMES = S.reduce((a, [, , n]) => a + n, 0);

export const KatalogCollage: React.FC = () => {
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
