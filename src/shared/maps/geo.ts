// Matematika peta tanpa JSX dan tanpa data negara: dipakai komponen WorldMap dan bisa dijalankan di Node untuk
// menghitung posisi titik/label sebelum render (lihat docs/WORKFLOW-AI-AGENT.md, tahap rencana visual).
import { geoDistance, geoMercator, geoOrthographic, type GeoProjection } from 'd3-geo';

/** Tipe dan helper peta. Kode negara ISO 3166 numerik (string) dipakai sebagai id di WorldMap.
 */
export type LonLat = [number, number];
/** Sudut pandang kamera peta: titik tengah [bujur, lintang] dan skala proyeksi (piksel). */
export type MapView = { center: LonLat; scale: number };
export type Projector = (p: LonLat) => [number, number] | null;

/** Kode negara yang sering dipakai. */
export const ISO = {
  indonesia: '360', usa: '840', canada: '124', switzerland: '756', uk: '826', ireland: '372', france: '250', germany: '276',
  italy: '380', spain: '724', portugal: '620', belgium: '056', netherlands: '528', luxembourg: '442', austria: '040',
  czechia: '203', poland: '616', denmark: '208', norway: '578', sweden: '752', hungary: '348', slovakia: '703', slovenia: '705', croatia: '191',
} as const;

/** Interpolasi kamera. Skala geometris (zoom terasa rata); titik tengah bergerak sebanding dengan zoom sehingga
 *  tujuan tetap di layar selama zoom-in (bukan meluncur lepas lalu muncul di akhir). */
export const mixView = (a: MapView, b: MapView, t: number): MapView => {
  const scale = a.scale * Math.pow(b.scale / a.scale, t);
  const k = Math.abs(b.scale - a.scale) < 1e-6 ? t : (1 - a.scale / scale) / (1 - a.scale / b.scale);
  return { center: [a.center[0] + (b.center[0] - a.center[0]) * k, a.center[1] + (b.center[1] - a.center[1]) * k], scale };
};

export const makeProjection = (kind: 'mercator' | 'orthographic', view: MapView, width: number, height: number): GeoProjection =>
  kind === 'mercator'
    ? geoMercator().center(view.center).scale(view.scale).translate([width / 2, height / 2])
    : geoOrthographic().rotate([-view.center[0], -view.center[1]]).scale(view.scale).translate([width / 2, height / 2]).clipAngle(90);

/** Proyektor titik; mengembalikan null bila titik ada di sisi belakang globe. */
export const projector = (kind: 'mercator' | 'orthographic', view: MapView, width: number, height: number): Projector => {
  const p = makeProjection(kind, view, width, height);
  return (ll) => {
    if (kind === 'orthographic' && geoDistance(ll, view.center) > Math.PI / 2) return null;
    const xy = p(ll);
    return xy ? [xy[0], xy[1]] : null;
  };
};

/** Busur layar dari a ke b (kurva kuadratik yang melengkung ke atas), dipotong pada progres t ∈ [0,1]. */
export const screenArc = (a: [number, number], b: [number, number], lift: number, t: number): string => {
  const c: [number, number] = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - lift];
  const k = Math.max(0, Math.min(1, t));
  const q0: [number, number] = [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k];
  const q1: [number, number] = [c[0] + (b[0] - c[0]) * k, c[1] + (b[1] - c[1]) * k];
  const end: [number, number] = [q0[0] + (q1[0] - q0[0]) * k, q0[1] + (q1[1] - q0[1]) * k];
  return `M ${a[0]} ${a[1]} Q ${q0[0]} ${q0[1]} ${end[0]} ${end[1]}`;
};

