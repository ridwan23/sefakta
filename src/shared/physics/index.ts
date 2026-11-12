// Kit fisika: gerak benda nyata (jatuh, pantul, squash/stretch, follow-through, ayunan, inersia) dan bahan bergerak.
// Aturan: docs/TATA-OBJEK.md §3.
export { fall, squashStretch, follow, swing, pendulum, massEase, settle, type FallState } from './dynamics';
export { Joint, Pour, Liquid, Smoke, type PourProps, type LiquidProps } from './matter';
