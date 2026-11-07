import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SHOTS, STORY_END, LINES } from './constants';
import { Shot1, Shot2, Shot3 } from './shots123';
import { Shot4, Shot5, Shot6 } from './shots456';
import { Overlay } from '../../../shared/captions/Overlay';
import { Watermark } from '../../../shared/brand/Watermark';
import { CtaClip, CTA_WIPE } from '../../../shared/brand/CtaClip';

const BY_ID = { 1: Shot1, 2: Shot2, 3: Shot3, 4: Shot4, 5: Shot5, 6: Shot6 } as const;

export const MatrixEffect: React.FC = () => (
  <AbsoluteFill style={{ background: '#090d16' }}>
    {SHOTS.map((s) => {
      const Comp = BY_ID[s.id];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={(s.id === 6 ? STORY_END + CTA_WIPE : s.to) - s.from} name={`Shot ${s.id} · ${s.label}`}>
          <Comp />
        </Sequence>
      );
    })}
    <Overlay lines={LINES} />
    <Watermark tone="dark" hideFrom={STORY_END} />
    <Sequence from={STORY_END} name="CTA">
      <CtaClip />
    </Sequence>
  </AbsoluteFill>
);
