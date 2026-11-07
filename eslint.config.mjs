import { config } from '@remotion/eslint-config-flat';

// Video lama (matrix-effect, file-deleted) dibiarkan apa adanya dan tidak di-lint.
export default [
  { ignores: ['src/topics/matrix-effect/**', 'src/topics/file-deleted/**', 'build/**', 'out/**', '.whisper/**'] },
  ...config,
];
