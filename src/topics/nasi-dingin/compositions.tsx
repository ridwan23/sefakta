import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/nasi-dingin.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const NasiDingin: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "Nasi Kemarin Lebih Ramah Gula Darah?". Durasi dihitung dari audio VO (public/nasi-dingin/manifest.json). */
export const NasiDinginCompositions: React.FC = () => (
  <Folder name="nasi-dingin">
    <Composition
      id="EpNasiDingin"
      component={NasiDingin}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
