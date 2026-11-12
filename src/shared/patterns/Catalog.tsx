// Katalog pola scene: peragaan src/shared/patterns/ di Studio (katalog → KatalogPola). Bukan episode.
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Reveal } from '../anim/Reveal';
import { FONT_JAKARTA } from '../brand/fonts';
import { Backdrop } from '../look/Backdrop';
import { tokens } from '../look/tokens';
import { ContactShadow } from '../render/ContactShadow';
import { Shaded } from '../render/Shaded';
import { pouchPath } from '../render/shapes';
import { BigNumber, Compare, MythFact } from './cards';
import { ProcessFlow, RankList, ZoomDetail } from './flows';

const LIGHT = { tone: 'light' as const, palette: ['#F6F1E7', '#1D2B4F', '#E07A1F', '#3E8E7E'] };
const DARK = { tone: 'dark' as const, palette: ['#0B1530', '#F4F1EA', '#FFB000', '#5BC0EB'] };

const Title: React.FC<{ name: string; code: string; dark?: boolean }> = ({ name, code, dark }) => {
  const T = tokens(dark ? DARK : LIGHT);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 70, fontFamily: FONT_JAKARTA }}>
      <Reveal at={0} kind="mask">
        <div style={{ fontSize: 46, fontWeight: 800, color: T.ink }}>{name}</div>
      </Reveal>
      <div style={{ marginTop: 8, fontFamily: 'Menlo, monospace', fontSize: 22, color: T.muted }}>{code}</div>
    </div>
  );
};

const Sachet: React.FC = () => (
  <AbsoluteFill>
    <ContactShadow x={540} y={1245} width={320} />
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <Shaded d={pouchPath(390, 700, 300, 540)} color="#2E7D4F" material="plastic">
        <rect x={420} y={1000} width={240} height={180} rx={16} fill="#F6F1E7" />
        <text x={540} y={840} textAnchor="middle" fontFamily={FONT_JAKARTA} fontWeight={800} fontSize={58} fill="#fff">STEVIA</text>
        <text x={540} y={1040} textAnchor="middle" fontFamily={FONT_JAKARTA} fontWeight={800} fontSize={20} fill="#1D2B4F">KOMPOSISI:</text>
        <text x={540} y={1078} textAnchor="middle" fontFamily={FONT_JAKARTA} fontWeight={700} fontSize={18} fill="#1D2B4F">maltodekstrin 99%</text>
        <text x={540} y={1110} textAnchor="middle" fontFamily={FONT_JAKARTA} fontWeight={700} fontSize={18} fill="#1D2B4F">steviol glikosida 1%</text>
      </Shaded>
    </svg>
  </AbsoluteFill>
);

const S: [string, React.FC, number][] = [
  ['BigNumber', () => (
    <>
      <Backdrop style={DARK} pattern="dots" />
      <Title dark name="BigNumber" code={'<BigNumber at={q.angka} value={1500} suffix=" kkal" label=… context=… />'} />
      <BigNumber style={DARK} at={10} value={1500} suffix=" kkal" label="Energi satu bungkus" context="setara tiga piring nasi" size={190} />
    </>
  ), 130],
  ['MythFact', () => (
    <>
      <Backdrop style={LIGHT} pattern="paper" />
      <Title name="MythFact" code={'<MythFact at={a} myth="…" factAt={q.padahal} fact="…" />'} />
      <MythFact style={LIGHT} at={8} myth="Pemanis stevia pasti nol kalori" factAt={70} fact="Isinya bisa 99% gula pengisi" />
    </>
  ), 160],
  ['Compare', () => (
    <>
      <Backdrop style={LIGHT} pattern="grid" />
      <Title name="Compare" code={'<Compare at={a} left={{title, value}} right={…} verdict={{ side: "right", at: q.menang }} />'} />
      <Compare style={LIGHT} at={8} left={{ title: 'Gula pasir', value: '4 kkal/g' }} right={{ title: 'Stevia murni', value: '0 kkal/g' }} verdict={{ side: 'right', at: 80, text: 'Yang murni memang nol' }} />
    </>
  ), 150],
  ['ProcessFlow', () => (
    <>
      <Backdrop style={DARK} pattern="lines" />
      <Title dark name="ProcessFlow" code={'<ProcessFlow steps={[{ label, at, icon: "lucide:leaf" }, …]} />'} />
      <ProcessFlow style={DARK} steps={[{ label: 'Daun stevia dipanen', at: 10, icon: 'lucide:leaf' }, { label: 'Diekstrak jadi kristal', at: 40, icon: 'lucide:flask-conical' }, { label: 'Dicampur pengisi', at: 70, icon: 'lucide:candy' }, { label: 'Ditakar per sachet', at: 100, icon: 'lucide:scale' }]} />
    </>
  ), 150],
  ['RankList', () => (
    <>
      <Backdrop style={LIGHT} />
      <Title name="RankList" code={'<RankList at={a} items={[{ label, value }]} unit="×" highlight={{ index, at }} />'} />
      <RankList style={LIGHT} at={10} unit="×" items={[{ label: 'Stevia', value: 300 }, { label: 'Sukralosa', value: 600 }, { label: 'Aspartam', value: 200 }, { label: 'Gula pasir', value: 1 }]} highlight={{ index: 0, at: 90 }} />
    </>
  ), 150],
  ['ZoomDetail', () => (
    <>
      <Backdrop style={LIGHT} pattern="dots" />
      <Title name="ZoomDetail (loupe)" code={'<ZoomDetail at={q.baca} focus={[540, 1000]} zoom={2.6} label="…">…</ZoomDetail>'} />
      <ZoomDetail style={LIGHT} at={30} focus={[540, 1075]} zoom={1.9} loupeAt={[790, 430]} radius={170} label="Baca komposisinya">
        <Sachet />
      </ZoomDetail>
    </>
  ), 130],
];

export const KATALOG_POLA_FRAMES = S.reduce((a, [, , n]) => a + n, 0);

export const KatalogPola: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
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
