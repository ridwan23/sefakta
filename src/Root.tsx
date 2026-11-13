import React from 'react';
import { MatrixEffectCompositions } from './topics/matrix-effect/compositions';
import { FileDeletedCompositions } from './topics/file-deleted/compositions';
import { Tambora1816Compositions } from './topics/tambora-1816/compositions';
import { KomodoTanpaJantanCompositions } from './topics/komodo-tanpa-jantan/compositions';
import { SuaraRekamanV2Compositions } from './topics/suara-rekaman-v2/compositions';
import { IklanMengupingCompositions } from './topics/iklan-menguping/compositions';
import { NasiDinginCompositions } from './topics/nasi-dingin/compositions';
import { NasiDinginV2Compositions } from './topics/nasi-dingin-v2/compositions';
import { SteviaIsiSachetCompositions } from './topics/stevia-isi-sachet/compositions';
import { KatalogCompositions } from './shared/katalog';
import { BersinMatahariCompositions } from './topics/bersin-matahari/compositions';

// One line per topic. Topic code lives in src/topics/<topic>/ and registers its own compositions.
export const RemotionRoot: React.FC = () => (
  <>
    <MatrixEffectCompositions />
    <FileDeletedCompositions />
    <Tambora1816Compositions />
    <KomodoTanpaJantanCompositions />
    <SuaraRekamanV2Compositions />
    <IklanMengupingCompositions />
    <NasiDinginCompositions />
    <NasiDinginV2Compositions />
    <SteviaIsiSachetCompositions />
    {/* acuan gerak untuk agent, bukan episode */}
    <KatalogCompositions />
    <BersinMatahariCompositions />
  </>
);
