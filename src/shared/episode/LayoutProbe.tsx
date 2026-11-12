// Probe tata letak untuk `npm run layout:check` (scripts/layout-check.ts). Tidak terlihat dan tidak melakukan apa pun
// kecuali input props berisi `layoutCheck: true`. Pada setiap `layoutEvery` frame, probe mengukur semua teks yang
// terlihat (di luar subtree `data-layout-ignore`: caption dan watermark) lalu menulis pelanggaran ke console:
//   LAYOUTCHECK {"frame":…,"texts":…,"issues":[{type,text,rect}]}
// Jenis: out-of-frame, watermark-zone, caption-zone, overlap, clipped (overflow terpotong), font-fallback, font-synthetic.
import React, { useEffect, useMemo, useRef } from 'react';
import { continueRender, delayRender, getInputProps, useCurrentFrame } from 'remotion';

type Rect = { x: number; y: number; w: number; h: number };
type Issue = { type: string; text: string; rect: Rect; detail?: string };

const W = 1080;
const H = 1920;
const SAFE_X = [40, 1040] as const;
const WATERMARK = { x: 800, y: 175 };
const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'emoji', 'math', 'inherit', 'initial']);

const props = getInputProps() as { layoutCheck?: boolean; layoutEvery?: number; captionMode?: string };

const unquote = (s: string) => s.trim().replace(/^["']|["']$/g, '');
const area = (r: Rect) => Math.max(0, r.w) * Math.max(0, r.h);
const intersect = (a: Rect, b: Rect): Rect => {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  return { x, y, w: Math.min(a.x + a.w, b.x + b.w) - x, h: Math.min(a.y + a.h, b.y + b.h) - y };
};
const R = (r: DOMRect): Rect => ({ x: r.x, y: r.y, w: r.width, h: r.height });
const round = (r: Rect): Rect => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) });

/** clip-path: inset(t r b l) dalam % atau px → kotak terlihat elemen (layar). */
const insetClip = (el: Element, box: DOMRect, cs: CSSStyleDeclaration): Rect | null => {
  const m = /^inset\(([^)]*)\)/.exec(cs.clipPath || '');
  if (!m) return null;
  const parts = m[1].split(/\s+round\s+/)[0].trim().split(/\s+/);
  const [t, r = t, b = t, l = r] = parts;
  const v = (s: string, size: number) => (s.endsWith('%') ? (parseFloat(s) / 100) * size : parseFloat(s) || 0);
  const sx = box.width / Math.max(1, (el as HTMLElement).offsetWidth || box.width);
  const sy = box.height / Math.max(1, (el as HTMLElement).offsetHeight || box.height);
  const top = v(t, box.height / sy) * sy;
  const right = v(r, box.width / sx) * sx;
  const bottom = v(b, box.height / sy) * sy;
  const left = v(l, box.width / sx) * sx;
  return { x: box.x + left, y: box.y + top, w: box.width - left - right, h: box.height - top - bottom };
};

const measure = (root: HTMLElement, frame: number): { frame: number; texts: number; issues: Issue[] } => {
  const o = root.getBoundingClientRect();
  const k = o.width / W; // skala render → koordinat komposisi
  const toComp = (r: Rect): Rect => ({ x: (r.x - o.x) / k, y: (r.y - o.y) / k, w: r.w / k, h: r.h / k });
  const mode = props.captionMode;
  const issues: Issue[] = [];

  // wajah font yang benar-benar dimuat
  const faces = new Map<string, { weight: number; style: string }[]>();
  document.fonts.forEach((f) => {
    if (f.status !== 'loaded') return;
    const fam = unquote(f.family).toLowerCase();
    const w = parseInt(f.weight, 10) || 400;
    faces.set(fam, [...(faces.get(fam) ?? []), { weight: w, style: f.style }]);
  });
  const fontChecked = new Set<string>();

  type Block = { node: Text; el: Element; text: string; rects: Rect[]; ink: Rect[]; box: Rect };
  const blocks: Block[] = [];

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text;
    const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
    const el = node.parentElement;
    if (!text || !el) continue;
    if (el.closest('[data-layout-ignore],[data-layout-probe],script,style,noscript')) continue;
    if (!root.parentElement?.contains(el)) continue;

    // opacity efektif, visibility, dan kotak pemotong leluhur (overflow / clip-path inset)
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    let opacity = 1;
    let clip: Rect | null = null;
    const addClip = (r: Rect) => {
      clip = clip ? intersect(r, clip) : r;
    };
    for (let a: Element | null = el; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      opacity *= parseFloat(s.opacity || '1');
      if (s.display === 'none') opacity = 0;
      if (/hidden|clip/.test(`${s.overflow} ${s.overflowX} ${s.overflowY}`)) addClip(R(a.getBoundingClientRect()));
      const ic = insetClip(a, a.getBoundingClientRect(), s);
      if (ic) addClip(ic);
    }
    if (opacity < 0.05) continue;

    const range = document.createRange();
    range.selectNodeContents(node);
    const rects: Rect[] = [];
    const raw: DOMRect[] = [];
    for (const r of Array.from(range.getClientRects())) {
      if (r.width < 0.5 || r.height < 0.5) continue;
      raw.push(r);
      const vis: Rect = clip ? intersect(R(r), clip) : R(r);
      if (vis.w < 1 || vis.h < 1) continue;
      rects.push(toComp(vis));
    }
    if (!rects.length) continue;
    const box = rects.reduce((u, r) => {
      const x = Math.min(u.x, r.x), y = Math.min(u.y, r.y);
      return { x, y, w: Math.max(u.x + u.w, r.x + r.w) - x, h: Math.max(u.y + u.h, r.y + r.h) - y };
    });
    // kotak tinta: tinggi baris dikurangi leading (≈ 0,8 × font-size), supaya judul dan subjudul yang rapat tidak dianggap bertumpuk
    const fs = parseFloat(cs.fontSize) || 16;
    const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight) || fs * 1.2;
    const frac = Math.min(1, (0.8 * fs) / lh);
    const ink = rects.map((r) => ({ x: r.x, y: r.y + (r.h * (1 - frac)) / 2, w: r.w, h: r.h * frac }));
    blocks.push({ node, el, text, rects, ink, box });
    const t = text.slice(0, 40);

    // posisi
    if (box.x < SAFE_X[0] - 0.5 || box.x + box.w > SAFE_X[1] + 0.5 || box.y < -0.5 || box.y + box.h > H + 0.5) issues.push({ type: 'out-of-frame', text: t, rect: round(box) });
    if (rects.some((r) => r.x + r.w > WATERMARK.x && r.y < WATERMARK.y)) issues.push({ type: 'watermark-zone', text: t, rect: round(box) });
    if ((mode === 'subtitle' || mode === 'ringkasan') && rects.some((r) => r.y + r.h > 1460)) issues.push({ type: 'caption-zone', text: t, rect: round(box), detail: `${mode}: y > 1460` });
    if (mode === 'headline' && rects.some((r) => r.y < 520 && r.y + r.h > 300)) issues.push({ type: 'caption-zone', text: t, rect: round(box), detail: 'headline: y 300–520' });

    // font
    const first = unquote(cs.fontFamily.split(',')[0] ?? '');
    const key = `${first}|${cs.fontWeight}|${cs.fontStyle}`;
    if (first && !GENERIC.has(first.toLowerCase()) && !fontChecked.has(key)) {
      fontChecked.add(key);
      const list = faces.get(first.toLowerCase());
      if (!list) issues.push({ type: 'font-fallback', text: t, rect: round(box), detail: `"${first}" tidak dimuat (font:add?)` });
      else {
        const w = parseInt(cs.fontWeight, 10) || 400;
        const italic = cs.fontStyle !== 'normal';
        const sameStyle = list.filter((f) => (f.style !== 'normal') === italic);
        if (italic && !sameStyle.length) issues.push({ type: 'font-synthetic', text: t, rect: round(box), detail: `"${first}" tanpa italic (miring palsu)` });
        else if (w >= 600 && Math.max(...(sameStyle.length ? sameStyle : list).map((f) => f.weight)) < 600) issues.push({ type: 'font-synthetic', text: t, rect: round(box), detail: `"${first}" ${w} tidak diunduh (tebal palsu)` });
      }
    }

    // terpotong: bagian teks berada di luar kotak leluhur overflow hidden terdekat (teks yang terlihat sebagian)
    for (let a: Element | null = el.parentElement ?? el; a && a !== root.parentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (!/hidden|clip/.test(`${s.overflow} ${s.overflowX} ${s.overflowY}`)) continue;
      const c = a.getBoundingClientRect();
      const out = raw.some((r) => r.x < c.x - 2 * k || r.y < c.y - 2 * k || r.right > c.right + 2 * k || r.bottom > c.bottom + 2 * k);
      if (out) issues.push({ type: 'clipped', text: t, rect: round(box) });
      break;
    }
  }

  // tumpang tindih antar-teks (per baris, kotak tinta), kecuali duplikat glow/outline (teks sama di tempat sama)
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i], b = blocks[j];
      if (area(intersect(a.box, b.box)) <= 0) continue;
      let worst = 0;
      for (const ra of a.ink) for (const rb of b.ink) {
        const sm = Math.min(area(ra), area(rb));
        if (sm > 0) worst = Math.max(worst, area(intersect(ra, rb)) / sm);
      }
      if (worst <= 0.2) continue;
      if (a.text === b.text && area(intersect(a.box, b.box)) / Math.max(area(a.box), area(b.box)) > 0.8) continue;
      issues.push({ type: 'overlap', text: `${a.text.slice(0, 18)} × ${b.text.slice(0, 18)}`, rect: round(intersect(a.box, b.box)), detail: `${Math.round(worst * 100)}%` });
    }
  }

  return { frame, texts: blocks.length, issues };
};

/** Pasang sekali per komposisi, di level atas (frame absolut). Watermark sudah memasangnya. */
export const LayoutProbe: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const every = Math.max(1, props.layoutEvery ?? 10);
  const active = props.layoutCheck === true && frame % every === 0;
  const handle = useMemo(() => (active ? delayRender(`layout-check ${frame}`) : null), [active, frame]);
  useEffect(() => {
    if (handle === null) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      continueRender(handle);
    };
    // requestAnimationFrame tidak berjalan di tab render headless: ukur langsung setelah font siap
    // (getBoundingClientRect memaksa layout sinkron, jadi hasilnya sudah final untuk frame ini).
    // @remotion/fonts baru menambahkan FontFace ke document.fonts setelah file selesai dimuat, jadi di frame
    // pertama sebuah tab font bisa belum terdaftar: ulangi sampai 10 × 100 ms sebelum menyebutnya font cadangan.
    const attempt = (n: number) => {
      if (done) return;
      try {
        if (!ref.current) return finish();
        const res = measure(ref.current, frame);
        if (n < 10 && res.issues.some((i) => i.type === 'font-fallback')) {
          setTimeout(() => attempt(n + 1), 100);
          return;
        }
        console.log('LAYOUTCHECK ' + JSON.stringify(res));
      } catch (e) {
        console.log('LAYOUTCHECK ' + JSON.stringify({ frame, error: String(e) }));
      }
      finish();
    };
    document.fonts.ready.then(() => attempt(0));
    return finish;
  }, [handle, frame]);
  if (props.layoutCheck !== true) return null;
  return <div ref={ref} data-layout-probe style={{ position: 'absolute', inset: 0, visibility: 'hidden', pointerEvents: 'none' }} />;
};
