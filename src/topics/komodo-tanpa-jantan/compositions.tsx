import React from 'react';
import { Composition, Folder } from 'remotion';
import brief from '../../../briefs/komodo-tanpa-jantan.json';
import { Episode } from '../../shared/episode/Episode';
import { calculateEpisodeMetadata, FPS, WIDTH, HEIGHT } from '../../shared/episode/metadata';
import type { EpisodeBrief, EpisodeProps } from '../../shared/episode/types';
import { VISUALS } from './scenes';

const KomodoTanpaJantan: React.FC<EpisodeProps> = (props) => <Episode {...props} visuals={VISUALS} />;

/** Episode "Komodo Betina Bisa Punya Anak Tanpa Pejantan". Durasi dihitung dari audio VO (public/komodo-tanpa-jantan/manifest.json). */
export const KomodoTanpaJantanCompositions: React.FC = () => (
  <Folder name="komodo-tanpa-jantan">
    <Composition
      id="EpKomodoTanpaJantan"
      component={KomodoTanpaJantan}
      calculateMetadata={calculateEpisodeMetadata}
      defaultProps={{ brief: brief as EpisodeBrief }}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </Folder>
);
