import { config } from '@remotion/eslint-config-flat';

// Video lama (matrix-effect, file-deleted) dibiarkan apa adanya dan tidak di-lint.
// SeFaktaCta.tsx dihasilkan dari template kanonis (npm run sync:cta), jadi juga dikecualikan.
export default [
  { ignores: ['src/topics/matrix-effect/**', 'src/topics/file-deleted/**', 'src/shared/brand/SeFaktaCta.tsx', 'build/**', 'out/**', '.whisper/**'] },
  ...config,
];
