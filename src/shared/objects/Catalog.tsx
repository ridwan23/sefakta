// Katalog objek ilustrasi (katalog → KatalogObjekIlustrasi). Bukan episode.
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Reveal } from '../anim/Reveal';
import { FONT_JAKARTA } from '../brand/fonts';
import { Backdrop } from '../look/Backdrop';
import { tokens } from '../look/tokens';
import { HeadProfile, Person } from './people';
import { Flame, Leaf, Snowflake, Sun } from './nature';
import { Bowl, Car, Cup, Fridge, Glasses, Phone, Sachet, Spoon, Tunnel } from './things';

const LIGHT = { tone: 'light' as const, palette: ['#F6F5EE', '#172235', '#4667FF', '#16B99A'] };
const DARK = { tone: 'dark' as const, palette: ['#0B1530', '#F4F1EA', '#FFB000', '#5BC0EB'] };
const TL = tokens(LIGHT);
const TD = tokens(DARK);

const Title: React.FC<{ name: string; code: string; dark?: boolean }> = ({ name, code, dark }) => {
  const T = dark ? TD : TL;
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 70, fontFamily: FONT_JAKARTA }}>
      <Reveal at={0} kind="mask">
        <div style={{ fontSize: 46, fontWeight: 800, color: T.ink }}>{name}</div>
      </Reveal>
      <div style={{ marginTop: 8, fontFamily: 'Menlo, monospace', fontSize: 22, color: T.muted, lineHeight: 1.4 }}>{code}</div>
    </div>
  );
};
const Label: React.FC<{ x: number; y: number; text: string; dark?: boolean }> = ({ x, y, text, dark }) => (
  <div style={{ position: 'absolute', left: x - 200, top: y, width: 400, textAlign: 'center', fontFamily: FONT_JAKARTA, fontWeight: 800, fontSize: 30, color: (dark ? TD : TL).muted }}>{text}</div>
);

const People: React.FC = () => (
  <>
    <Backdrop style={LIGHT} />
    <Title name="Person · HeadProfile" code={'<Person pose="sneeze" poseAt={q.hatchi} ground={…} />\n<HeadProfile brain signal={{ at: q.saraf }} />'} />
    <Person x={290} y={640} size={400} at={6} ground={856} />
    <Label x={290} y={890} text="netral (idle)" />
    <Person x={790} y={640} size={400} at={12} pose="sneeze" poseAt={45} ground={856} color="#4667FF" />
    <Label x={790} y={890} text="bersin @45" />
    <HeadProfile x={540} y={1260} size={420} at={20} signal={{ at: 50 }} />
    <Label x={540} y={1560} text="HeadProfile · sinyal @50" />
  </>
);

const Nature: React.FC = () => (
  <>
    <Backdrop style={DARK} />
    <Title dark name="Sun · Flame · Snowflake · Leaf" code={'<Sun pulseAt={[q.silau]} /> <Flame intensity={0.8} /> <Leaf wiltAt={…} />'} />
    <Sun x={290} y={600} size={380} at={6} pulseAt={[50]} />
    <Label dark x={290} y={810} text="Sun · denyut @50" />
    <Flame x={790} y={600} size={260} at={12} intensity={0.9} ground={770} />
    <Label dark x={790} y={810} text="Flame" />
    <Snowflake x={290} y={1130} size={300} at={18} />
    <Label dark x={290} y={1320} text="Snowflake" />
    <Leaf x={790} y={1120} size={280} at={24} wiltAt={60} />
    <Label dark x={790} y={1320} text="Leaf · layu @60" />
  </>
);

const Road: React.FC = () => (
  <>
    <Backdrop style={LIGHT} />
    <Title name="Car · Tunnel · Glasses" code={'<Car speed={1} lights /> <Tunnel light={0.2} /> <Glasses />'} />
    <Tunnel x={540} y={620} size={600} at={6} light={0.25} />
    <Label x={540} y={935} text="Tunnel" />
    <Car x={540} y={1130} size={560} at={14} speed={1} lights ground={1315} />
    <Label x={540} y={1340} text="Car · speed 1" />
    <Glasses x={540} y={1500} size={360} at={22} />
    <Label x={540} y={1610} text="Glasses" />
  </>
);

const Kitchen: React.FC = () => (
  <>
    <Backdrop style={LIGHT} />
    <Title name="Bowl · Cup · Sachet · Spoon" code={'<Bowl fill="rice" steam /> <Cup drink="#6B3E26" level={0.8} steam /> <Sachet label="…" />'} />
    <Bowl x={290} y={600} size={380} at={6} fill="rice" steam ground={754} />
    <Label x={290} y={790} text="Bowl · rice" />
    <Bowl x={790} y={600} size={380} at={12} fill="soup" ground={754} color="#4667FF" />
    <Label x={790} y={790} text="Bowl · soup" />
    <Cup x={290} y={1060} size={240} at={18} drink="#6B3E26" level={0.8} steam ground={1190} />
    <Label x={290} y={1230} text="Cup" />
    <Sachet x={640} y={1060} size={220} at={24} label="STEVIA" />
    <Label x={640} y={1230} text="Sachet" />
    <Spoon x={900} y={1060} size={90} at={30} rotate={20} />
    <Label x={900} y={1230} text="Spoon" />
  </>
);

const Home: React.FC = () => (
  <>
    <Backdrop style={LIGHT} />
    <Title name="Phone · Fridge" code={'<Phone notify screen="#2D5B86" /> <Fridge open={0.6} />'} />
    <Phone x={300} y={760} size={260} at={6} notify ground={1020} />
    <Label x={300} y={1070} text="Phone · notify" />
    <Fridge x={760} y={760} size={340} at={14} open={0.6} ground={1032} />
    <Label x={760} y={1070} text="Fridge · open 0.6" />
  </>
);

const S: [string, React.FC, number][] = [
  ['Orang', People, 120],
  ['Alam', Nature, 110],
  ['Jalan', Road, 90],
  ['Dapur', Kitchen, 90],
  ['Rumah', Home, 90],
];

export const KATALOG_OBJEK_ILUSTRASI_FRAMES = S.reduce((a, [, , n]) => a + n, 0);

export const KatalogObjekIlustrasi: React.FC = () => {
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
