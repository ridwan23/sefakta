import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/nasi-dingin-v2.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const NasiDinginV2: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "Kenapa Nasi Dingin Lebih Ramah Gula Darah?". Durasi dihitung dari audio VO (public/nasi-dingin-v2/manifest.json). */
export const NasiDinginV2Compositions: React.FC = () => (
  <Folder name="nasi-dingin-v2">
    <Composition
      id="EpNasiDinginV2"
      component={NasiDinginV2}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
