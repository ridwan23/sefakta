import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/suara-rekaman-v2.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const SuaraRekamanV2: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "Kenapa Suaramu Terdengar Asing di Rekaman?". Durasi dihitung dari audio VO (public/suara-rekaman-v2/manifest.json). */
export const SuaraRekamanV2Compositions: React.FC = () => (
  <Folder name="suara-rekaman-v2">
    <Composition
      id="EpSuaraRekamanV2"
      component={SuaraRekamanV2}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
