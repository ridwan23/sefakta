import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Overlay } from '../../../shared/captions/Overlay';
import { Watermark } from '../../../shared/brand/Watermark';
import { CtaClip, CTA_WIPE } from '../../../shared/brand/CtaClip';
import { Shot1_2D, Shot2_2D, Shot3_2D, Shot4_2D, Shot5_2D, Shot6_2D, WarpContext } from './shots';
import { SHOTS, LINES, STORY_END, VO_SRC, warpFn } from './timeline';
import { P } from './kit';

const BY_ID = { 1: Shot1_2D, 2: Shot2_2D, 3: Shot3_2D, 4: Shot4_2D, 5: Shot5_2D, 6: Shot6_2D } as const;

/** 2D "Pop Sticker Comic" version of The Matrix Effect, locked to the VO v3 narration (60 s incl. CTA). */
export const MatrixEffect2D: React.FC = () => (
  <AbsoluteFill style={{ background: P.paper }}>
    {SHOTS.map((s) => {
      const Comp = BY_ID[s.id];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={(s.id === 6 ? STORY_END + CTA_WIPE : s.to) - s.from} name={`Shot ${s.id} · ${s.label}`}>
          <WarpContext.Provider value={warpFn(s.warp)}>
            <Comp />
          </WarpContext.Provider>
        </Sequence>
      );
    })}
    <Overlay theme="pop" lines={LINES} />
    <Watermark tone="light" hideFrom={STORY_END} />
    <Sequence from={STORY_END} name="CTA">
      <CtaClip />
    </Sequence>
    <Audio src={staticFile(VO_SRC)} />
  </AbsoluteFill>
);
