import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SCENES, PALETTE } from './constants';
import { GridPattern } from './GridPattern';
import { StatusHUD } from './StatusHUD';
import { Captions } from './Captions';

import { Scene1Hook } from './Scene1Hook';
import { Scene2RecycleBin } from './Scene2RecycleBin';
import { Scene3IndexStrikethrough } from './Scene3IndexStrikethrough';
import { Scene4MarkedEmpty } from './Scene4MarkedEmpty';
import { Scene5RecoveryWarning } from './Scene5RecoveryWarning';
import { Scene6Overwritten } from './Scene6Overwritten';
import { Scene7SSDATRIM } from './Scene7SSDATRIM';
import { Scene8OutroLoop } from './Scene8OutroLoop';

export const PictogramVideo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif',
      }}
    >
      {/* 1. Subtle, Clean Ambient Lighting */}
      <GridPattern />

      {/* 2. Scenes Sequences (Hard Cuts between scenes as requested) */}

      {/* Scene 1: Hook (0.0s - 6.0s / 144 frames) */}
      <Sequence from={SCENES[0].from} durationInFrames={SCENES[0].duration}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: Recycle Bin (6.0s - 12.0s / 144 frames) */}
      <Sequence from={SCENES[1].from} durationInFrames={SCENES[1].duration}>
        <Scene2RecycleBin />
      </Sequence>

      {/* Scene 3: Alamat Dicoret / Indeks (12.0s - 18.0s / 144 frames) */}
      <Sequence from={SCENES[2].from} durationInFrames={SCENES[2].duration}>
        <Scene3IndexStrikethrough />
      </Sequence>

      {/* Scene 4: Ditandai Kosong (18.0s - 24.0s / 144 frames) */}
      <Sequence from={SCENES[3].from} durationInFrames={SCENES[3].duration}>
        <Scene4MarkedEmpty />
      </Sequence>

      {/* Scene 5: Recovery Software (24.0s - 30.0s / 144 frames) */}
      <Sequence from={SCENES[4].from} durationInFrames={SCENES[4].duration}>
        <Scene5RecoveryWarning />
      </Sequence>

      {/* Scene 6: Tertimpa Total (30.0s - 36.0s / 144 frames) */}
      <Sequence from={SCENES[5].from} durationInFrames={SCENES[5].duration}>
        <Scene6Overwritten />
      </Sequence>

      {/* Scene 7: SSD & TRIM (36.0s - 42.0s / 144 frames) */}
      <Sequence from={SCENES[6].from} durationInFrames={SCENES[6].duration}>
        <Scene7SSDATRIM />
      </Sequence>

      {/* Scene 8: Outro & Seamless Loop (42.0s - 47.0s / 120 frames) */}
      <Sequence from={SCENES[7].from} durationInFrames={SCENES[7].duration}>
        <Scene8OutroLoop />
      </Sequence>

      {/* 3. Persistent HUD (Clean Segmented Bar & State Chip) */}
      <StatusHUD />

      {/* 4. Embedded Word-Highlighted Captions */}
      <Captions />
    </AbsoluteFill>
  );
};
