// Helper path SVG untuk bentuk dasar objek, supaya agent tidak menulis path mentah untuk bentuk umum.
// Semua mengembalikan string `d` yang bisa langsung dipakai <Shaded d=…>, <path>, clipPath, atau DrawPath.

/** Persegi panjang bersudut bulat. */
export const rectPath = (x: number, y: number, w: number, h: number, r = 0) => {
  const q = Math.min(r, w / 2, h / 2);
  return `M${x + q},${y} H${x + w - q} Q${x + w},${y} ${x + w},${y + q} V${y + h - q} Q${x + w},${y + h} ${x + w - q},${y + h} H${x + q} Q${x},${y + h} ${x},${y + h - q} V${y + q} Q${x},${y} ${x + q},${y} Z`;
};

/** Elips dengan pusat (cx, cy). */
export const ellipsePath = (cx: number, cy: number, rx: number, ry = rx) =>
  `M${cx - rx},${cy} A${rx},${ry} 0 1 0 ${cx + rx},${cy} A${rx},${ry} 0 1 0 ${cx - rx},${cy} Z`;

/** Sachet/kantong: persegi dengan tepi bergerigi di atas dan bawah (segel). */
export const pouchPath = (x: number, y: number, w: number, h: number, teeth = 14, depth = 10) => {
  const step = w / teeth;
  let top = `M${x},${y + depth}`;
  for (let i = 0; i < teeth; i++) top += ` L${x + step * (i + 0.5)},${y} L${x + step * (i + 1)},${y + depth}`;
  let bottom = ` L${x + w},${y + h - depth}`;
  for (let i = teeth - 1; i >= 0; i--) bottom += ` L${x + step * (i + 0.5)},${y + h} L${x + step * i},${y + h - depth}`;
  return `${top}${bottom} Z`;
};

/** Gumpalan organik (batu, awan, sel, gumpalan nasi) dari lingkaran yang diberi tonjolan deterministik. */
export const blobPath = (cx: number, cy: number, r: number, seed = 1, wobble = 0.12, points = 9) => {
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    const rr = r * (1 + wobble * ((s - Math.floor(s)) * 2 - 1));
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  // kurva halus (Catmull-Rom → Bezier)
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points], p1 = pts[i], p2 = pts[(i + 1) % points], p3 = pts[(i + 2) % points];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d + ' Z';
};

/** Wadah (gelas/toples/tabung): badan sedikit menyempit ke bawah dengan dasar bulat. */
export const cupPath = (cx: number, top: number, w: number, h: number, taper = 0.12, r = 28) => {
  const wb = w * (1 - taper);
  const xl = cx - w / 2, xr = cx + w / 2, bl = cx - wb / 2, br = cx + wb / 2, b = top + h;
  return `M${xl},${top} L${bl},${b - r} Q${bl},${b} ${bl + r},${b} L${br - r},${b} Q${br},${b} ${br},${b - r} L${xr},${top} Z`;
};
