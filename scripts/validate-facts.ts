// Validator fakta & brief SeFakta.
//
//   npm run validate:facts                 # semua brief di briefs/ (mode draft)
//   npm run validate:facts -- --publish    # mode publikasi: fakta belum terverifikasi = error
//   npm run validate:facts -- --dir=path   # periksa folder lain (mis. untuk uji)
//   npm run validate:facts:online          # = --publish --check-urls (butuh internet)
//   opsi: --check-urls  buka setiap URL sumber: link hidup, tidak dialihkan ke host lain, `quote` tertulis verbatim
//         --url-timeout=15000  batas waktu per URL (ms)
//
// Yang diperiksa:
//  1. Bentuk brief (field wajib, enum, id unik, factIds ada).
//  2. Fakta berstatus "terverifikasi" (kind fakta/perkiraan): minimal 2 sumber dengan `origin` BERBEDA
//     (dua artikel yang menyalin satu studi bukan dua konfirmasi), URL https, tanggal akses valid,
//     dan setiap angka (`figures`) muncul di `quote` minimal dua sumber.
//  3. Setiap angka yang diucapkan/ditulis di scene harus tercakup `figures` fakta yang dirujuk scene itu
//     (atau tercatat di `numbersIgnored` beserta alasannya).
//  4. Fakta "bertentangan" dengan sumber yang masih dipakai scene = error selalu; "belum-terverifikasi" =
//     peringatan (draft) / error (publish).
//  5. Durasi total 55–65 detik; mode caption "ringkasan" = 8–14 kata per scene.
// Exit code 1 bila ada error.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type Level = 'error' | 'warn';
type Issue = { level: Level; where: string; msg: string };
type Json = Record<string, any>;

const SERIES = ['Alam', 'Sains', 'Sejarah', 'Antariksa', 'Teknologi', 'Tubuh'];
const KINDS = ['fakta', 'perkiraan', 'interpretasi', 'ilustrasi'];
const STATUSES = ['terverifikasi', 'belum-terverifikasi', 'bertentangan'];
const CAPTION_MODES = ['ringkasan', 'subtitle', 'headline'];
const BRIEF_STATUSES = ['draft', 'siap-publikasi'];
const MAX_QUOTE = 400;
const STALE_DAYS = 120;

// ---------------------------------------------------------------- angka (digit + kata bilangan Indonesia)
const UNIT_WORDS: Record<string, number> = { nol: 0, satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5, enam: 6, tujuh: 7, delapan: 8, sembilan: 9 };
const NUM_WORDS = new Set([...Object.keys(UNIT_WORDS), 'sepuluh', 'sebelas', 'belas', 'puluh', 'seratus', 'ratus', 'seribu', 'ribu', 'juta']);
const UNITS = new Set(['detik', 'menit', 'jam', 'hari', 'minggu', 'bulan', 'tahun', 'abad', 'kaki', 'meter', 'm', 'km', 'kilometer', 'cm', 'sentimeter', 'persen', 'kali', 'derajat', 'kg', 'kilogram', 'ton', 'liter']);

const parseWords = (words: string[]): number => {
  let total = 0, cur = 0, last = 0;
  for (const w of words) {
    if (w in UNIT_WORDS) last = UNIT_WORDS[w];
    else if (w === 'sepuluh') cur += 10;
    else if (w === 'sebelas') cur += 11;
    else if (w === 'belas') { cur += last + 10; last = 0; }
    else if (w === 'puluh') { cur += (last || 1) * 10; last = 0; }
    else if (w === 'seratus') cur += 100;
    else if (w === 'ratus') { cur += (last || 1) * 100; last = 0; }
    else if (w === 'seribu') total += 1000;
    else if (w === 'ribu') { total += ((cur + last) || 1) * 1000; cur = 0; last = 0; }
    else if (w === 'juta') { total += ((cur + last) || 1) * 1e6; cur = 0; last = 0; }
  }
  return total + cur + last;
};

type Quantity = { value: number; unit?: string; raw: string };
/** Angka yang berupa klaim kuantitatif: semua angka digit, dan angka kata bila ≥ 11 atau berunit. */
export const quantitiesIn = (text: string): Quantity[] => {
  const tokens = text.toLowerCase().replace(/%/g, ' persen ').match(/[a-z]+|\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?/g) ?? [];
  const out: Quantity[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^\d/.test(t)) {
      out.push({ value: toNumber(t), unit: UNITS.has(tokens[i + 1]) ? tokens[i + 1] : undefined, raw: t });
    } else if (NUM_WORDS.has(t)) {
      let j = i;
      while (j < tokens.length && NUM_WORDS.has(tokens[j])) j++;
      const run = tokens.slice(i, j);
      const value = parseWords(run);
      const unit = UNITS.has(tokens[j]) ? tokens[j] : undefined;
      if (value >= 11 || unit) out.push({ value, unit, raw: run.join(' ') });
      i = j - 1;
    }
  }
  return out;
};
// "1.815" / "1,815" = seribu delapan ratus lima belas (pemisah ribuan); "2,49" / "2.49" = desimal.
const NUM_TOKEN = /\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?/g;
const toNumber = (tok: string) => (/^\d{1,3}(?:[.,]\d{3})+$/.test(tok) ? parseFloat(tok.replace(/[.,]/g, '')) : parseFloat(tok.replace(',', '.')));
const numbersIn = (text: string): number[] => (text.match(NUM_TOKEN) ?? []).map(toNumber);
const same = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// ---------------------------------------------------------------- validasi
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const today = new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

export const validateBrief = (b: Json, file: string, forcePublish: boolean): Issue[] => {
  const issues: Issue[] = [];
  const add = (level: Level, where: string, msg: string) => issues.push({ level, where, msg });
  const publish = forcePublish || b.status === 'siap-publikasi';
  const unverified: Level = publish ? 'error' : 'warn';

  for (const k of ['projectId', 'title']) if (!isStr(b[k])) add('error', k, 'wajib berupa teks');
  if (!SERIES.includes(b.series)) add('error', 'series', `harus salah satu dari: ${SERIES.join(', ')}`);
  if (!BRIEF_STATUSES.includes(b.status)) add('error', 'status', `harus ${BRIEF_STATUSES.join(' | ')}`);
  if (!CAPTION_MODES.includes(b.captionMode)) add('error', 'captionMode', `harus ${CAPTION_MODES.join(' | ')}`);
  if (!Array.isArray(b.scenes) || b.scenes.length === 0) { add('error', 'scenes', 'minimal 1 scene'); return issues; }
  if (!Array.isArray(b.facts)) { add('error', 'facts', 'wajib berupa array (boleh kosong bila tidak ada klaim)'); b.facts = []; }

  // ---- fakta
  const facts = new Map<string, Json>();
  for (const [i, f] of b.facts.entries()) {
    const w = `facts[${i}]${isStr(f?.id) ? ` (${f.id})` : ''}`;
    if (!isStr(f?.id)) { add('error', w, 'id wajib'); continue; }
    if (facts.has(f.id)) add('error', w, 'id ganda');
    facts.set(f.id, f);
    if (!isStr(f.claim)) add('error', w, 'claim wajib');
    if (!KINDS.includes(f.kind)) add('error', w, `kind harus ${KINDS.join(' | ')}`);
    if (!STATUSES.includes(f.status)) add('error', w, `status harus ${STATUSES.join(' | ')}`);
    const figures: Json[] = Array.isArray(f.figures) ? f.figures : [];
    const sources: Json[] = Array.isArray(f.sources) ? f.sources : [];
    for (const [j, fg] of figures.entries()) if (!isStr(fg?.text) || typeof fg?.value !== 'number') add('error', `${w}.figures[${j}]`, 'butuh { text, value:number }');

    const hosts = new Set<string>();
    for (const [j, s] of sources.entries()) {
      const sw = `${w}.sources[${j}]`;
      for (const k of ['title', 'publisher', 'origin']) if (!isStr(s?.[k])) add('error', sw, `${k} wajib`);
      let host = '';
      try { const u = new URL(s.url); host = u.hostname.replace(/^www\./, ''); if (u.protocol !== 'https:') add('error', sw, 'url harus https'); } catch { add('error', sw, 'url tidak valid'); }
      if (host) { if (hosts.has(host)) add('warn', sw, `host ${host} dipakai dua kali`); hosts.add(host); }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s?.accessed ?? '') || Number.isNaN(Date.parse(s.accessed))) add('error', sw, 'accessed harus YYYY-MM-DD');
      else if (s.accessed > today) add('error', sw, `accessed ${s.accessed} ada di masa depan`);
      else if (daysBetween(s.accessed, today) > STALE_DAYS) add('warn', sw, `diakses ${daysBetween(s.accessed, today)} hari lalu; cek ulang`);
      if (s?.quote !== undefined && (!isStr(s.quote) || s.quote.length > MAX_QUOTE)) add('error', sw, `quote harus teks ≤ ${MAX_QUOTE} karakter`);
    }

    if (f.status === 'terverifikasi' && (f.kind === 'fakta' || f.kind === 'perkiraan')) {
      const origins = new Set(sources.map((s) => String(s?.origin ?? '').trim().toLowerCase()).filter(Boolean));
      if (sources.length < 2) add('error', w, `berstatus terverifikasi tetapi hanya ${sources.length} sumber (minimal 2)`);
      else if (origins.size < 2) add('error', w, `sumber tidak independen: semua berasal dari "${[...origins][0]}" (butuh ≥ 2 origin berbeda)`);
      for (const fg of figures) {
        const backed = sources.filter((s) => isStr(s?.quote) && numbersIn(s.quote).some((n) => same(n, fg.value))).length;
        if (backed < 2) add('error', w, `angka "${fg.text}" hanya ada di quote ${backed} sumber (minimal 2)`);
      }
    }
    if (f.status === 'terverifikasi' && f.kind === 'interpretasi' && sources.length < 1) add('error', w, 'interpretasi terverifikasi butuh ≥ 1 sumber');
  }

  // ---- scene
  const ids = new Set<string>();
  const used = new Set<string>();
  let total = 0;
  const contradicted = new Map<string, string[]>();
  const pending = new Map<string, string[]>();
  const ignored = new Set<number>((Array.isArray(b.numbersIgnored) ? b.numbersIgnored : []).filter((n: Json) => typeof n?.value === 'number' && isStr(n?.reason)).map((n: Json) => n.value));
  for (const n of Array.isArray(b.numbersIgnored) ? b.numbersIgnored : []) if (typeof n?.value !== 'number' || !isStr(n?.reason)) add('error', 'numbersIgnored', 'setiap entri butuh { value:number, reason }');

  for (const [i, s] of b.scenes.entries()) {
    const w = `scenes[${i}]${isStr(s?.id) ? ` (${s.id})` : ''}`;
    if (!isStr(s?.id)) add('error', w, 'id wajib'); else if (ids.has(s.id)) add('error', w, 'id ganda'); else ids.add(s.id);
    if (typeof s?.durationSeconds !== 'number' || s.durationSeconds <= 0) add('error', w, 'durationSeconds harus angka > 0'); else total += s.durationSeconds;
    if (!isStr(s?.voiceoverText)) { add('error', w, 'voiceoverText wajib'); continue; }

    const refs: string[] = Array.isArray(s.factIds) ? s.factIds : [];
    const refFacts: Json[] = [];
    for (const id of refs) {
      const f = facts.get(id);
      if (!f) { add('error', w, `factIds merujuk "${id}" yang tidak ada`); continue; }
      used.add(id); refFacts.push(f);
      if (f.status === 'bertentangan') (contradicted.get(id) ?? contradicted.set(id, []).get(id)!).push(s.id);
      else if (f.status === 'belum-terverifikasi' && f.kind !== 'ilustrasi') (pending.get(id) ?? pending.set(id, []).get(id)!).push(s.id);
    }
    const covered = (v: number) => ignored.has(v) || refFacts.some((f) => (f.figures ?? []).some((fg: Json) => same(fg.value, v)));
    for (const q of [...quantitiesIn(s.voiceoverText), ...quantitiesIn(s.caption ?? '')]) {
      if (!covered(q.value)) add('error', w, `angka "${q.raw}${q.unit ? ' ' + q.unit : ''}" (= ${q.value}) tidak tercakup fakta yang dirujuk scene ini`);
    }
    if (b.captionMode === 'ringkasan') {
      const n = (s.caption ?? '').trim().split(/\s+/).filter(Boolean).length;
      if (n < 8 || n > 14) add('error', w, `mode ringkasan: caption harus 8–14 kata (sekarang ${n})`);
    }
  }
  for (const [id, scenes] of contradicted) add('error', `facts (${id})`, `BERTENTANGAN dengan sumber tetapi masih dipakai di ${scenes.join(', ')}: ${facts.get(id)!.claim} ${facts.get(id)!.limits ?? ''}`.trim());
  for (const [id, scenes] of pending) add(unverified, `facts (${id})`, `belum terverifikasi, dipakai di ${scenes.join(', ')}: ${facts.get(id)!.claim}`);
  for (const id of facts.keys()) if (!used.has(id)) add('warn', `facts (${id})`, 'tidak dipakai scene mana pun');
  if (total < 55 || total > 65) add(publish ? 'error' : 'warn', 'scenes', `total durasi ${total.toFixed(2)} dtk di luar 55–65 dtk`);
  void file;
  return issues;
};

// ---------------------------------------------------------------- pemeriksaan URL (opsional: --check-urls)
type Page = { status: number | 'error'; finalUrl?: string; ctype?: string; text?: string; err?: string };
const NAMED: Record<string, string> = {
  nbsp: ' ', ensp: ' ', emsp: ' ', thinsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  lsquo: "'", rsquo: "'", sbquo: "'", ldquo: '"', rdquo: '"', bdquo: '"', laquo: '"', raquo: '"',
  ndash: '–', mdash: '—', minus: '−', hellip: '…', middot: '·', bull: '•', deg: '°', plusmn: '±', times: '×', divide: '÷',
  frac12: '½', frac14: '¼', frac34: '¾', micro: 'µ', copy: '©', reg: '®', trade: '™', shy: '',
};
const decodeEntities = (t: string) =>
  t.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&([a-z0-9]+);/gi, (m, n) => NAMED[n] ?? NAMED[n.toLowerCase()] ?? m);
export const htmlToText = (html: string) =>
  decodeEntities(html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<sup[^>]*>[\d,\s–-]*<\/sup>/gi, ' ') // penanda rujukan makalah
    .replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr|td|section|article)>/gi, ' ')
    .replace(/<[^>]+>/g, ' '));
/** Normalisasi untuk perbandingan kutipan: huruf kecil, tanda kutip/strip seragam, tanpa rujukan [12], spasi rapat. */
export const norm = (t: string) =>
  t.toLowerCase().replace(/[‘’‚′]/g, "'").replace(/[“”„″]/g, '"').replace(/[‐‑‒–—−]/g, '-').replace(/­/g, '')
    .replace(/\[\d+(?:\s*[,–-]\s*\d+)*\]/g, ' ').replace(/\s+/g, ' ').replace(/\s+([.,;:!?)])/g, '$1').trim();

const fetchPage = async (url: string, timeoutMs: number): Promise<Page> => {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; SeFaktaFactCheck/1.0)', accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1', 'accept-language': 'en,id;q=0.8' },
    });
    const ctype = res.headers.get('content-type') ?? '';
    const text = res.ok && /html|text|xml/i.test(ctype) ? htmlToText(await res.text()) : undefined;
    return { status: res.status, finalUrl: res.url, ctype, text };
  } catch (e) {
    const err = e as Error & { cause?: { code?: string } };
    return { status: 'error', err: err.name === 'TimeoutError' ? `timeout > ${timeoutMs} ms` : (err.cause?.code ?? err.message) };
  }
};

export const checkUrls = async (b: Json, timeoutMs: number): Promise<{ issues: Issue[]; stats: Record<string, number> }> => {
  const issues: Issue[] = [];
  const stats: Record<string, number> = { diperiksa: 0, ok: 0, diblokir: 0, mati: 0, 'tidak-terjangkau': 0, 'kutipan-cocok': 0, 'kutipan-tidak-cocok': 0, 'tanpa-kutipan': 0 };
  const targets: { fact: Json; w: string; s: Json }[] = [];
  for (const f of b.facts ?? []) {
    if (f?.kind === 'ilustrasi') continue;
    for (const [j, s] of (Array.isArray(f?.sources) ? f.sources : []).entries()) {
      try { if (new URL(s.url).protocol === 'https:') targets.push({ fact: f, w: `facts (${f.id}).sources[${j}]`, s }); } catch { /* sudah dilaporkan validasi struktur */ }
    }
  }
  const cache = new Map<string, Promise<Page>>();
  const get = (u: string) => cache.get(u) ?? cache.set(u, fetchPage(u, timeoutMs)).get(u)!;
  const queue = [...new Set(targets.map((t) => t.s.url as string))];
  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => { for (let u = queue.shift(); u; u = queue.shift()) await get(u); }));

  for (const { fact, w, s } of targets) {
    const page = await get(s.url);
    stats.diperiksa++;
    const strict: Level = fact.status === 'terverifikasi' ? 'error' : 'warn';
    const add = (level: Level, msg: string) => issues.push({ level, where: w, msg });
    if (page.status === 'error') { stats['tidak-terjangkau']++; add('warn', `tidak bisa dijangkau (${page.err}): ${s.url}. Periksa manual.`); continue; }
    if (page.status === 404 || page.status === 410) { stats.mati++; add('error', `link mati (HTTP ${page.status}): ${s.url}`); continue; }
    if (page.status >= 400) { stats.diblokir++; add('warn', `server menolak/bermasalah (HTTP ${page.status}): ${s.url}. Banyak situs memblokir pemeriksaan otomatis; buka manual dan pastikan kutipannya ada.`); continue; }
    stats.ok++;
    try {
      const from = new URL(s.url).hostname.replace(/^www\./, ''), to = new URL(page.finalUrl ?? s.url).hostname.replace(/^www\./, '');
      const related = from === to || from.endsWith('.' + to) || to.endsWith('.' + from); // pindah subdomain itu wajar
      if (!related) add('warn', `dialihkan ke domain lain: ${from} → ${to}`);
    } catch { /* abaikan */ }
    if (!isStr(s.quote)) { stats['tanpa-kutipan']++; continue; }
    if (page.text === undefined) { add('warn', `bukan halaman teks (${page.ctype || 'tipe tidak diketahui'}): kutipan tidak bisa diperiksa otomatis`); continue; }
    if (norm(page.text).includes(norm(s.quote))) stats['kutipan-cocok']++;
    else { stats['kutipan-tidak-cocok']++; add(strict, `kutipan TIDAK ditemukan di halaman (harus verbatim): "${s.quote.slice(0, 80)}${s.quote.length > 80 ? '…' : ''}"`); }
  }
  return { issues, stats };
};

// ---------------------------------------------------------------- CLI
const main = async () => {
  const args = process.argv.slice(2);
  const publish = args.includes('--publish');
  const online = args.includes('--check-urls');
  const timeoutMs = Number(args.find((a) => a.startsWith('--url-timeout='))?.slice(14) ?? 15000);
  const dir = args.find((a) => a.startsWith('--dir='))?.slice(6) ?? 'briefs';
  if (!existsSync(dir)) { console.log(`Folder ${dir}/ tidak ada: tidak ada brief untuk diperiksa.`); return 0; }
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('example'));
  if (files.length === 0) { console.log(`Tidak ada brief di ${dir}/.`); return 0; }
  let errors = 0, warns = 0;
  for (const f of files) {
    let issues: Issue[];
    let stats: Record<string, number> | undefined;
    try {
      const brief = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      issues = validateBrief(brief, f, publish);
      if (online) { const r = await checkUrls(brief, timeoutMs); issues.push(...r.issues); stats = r.stats; }
    } catch (e) { issues = [{ level: 'error', where: f, msg: `JSON tidak bisa dibaca: ${(e as Error).message}` }]; }
    const e = issues.filter((i) => i.level === 'error'), w = issues.filter((i) => i.level === 'warn');
    errors += e.length; warns += w.length;
    console.log(`\n${e.length ? '✗' : '✓'} ${f}  ${publish ? '[publish]' : '[draft]'}${online ? '[online]' : ''}  ${e.length} error, ${w.length} peringatan`);
    for (const i of [...e, ...w]) console.log(`   ${i.level === 'error' ? 'ERROR ' : 'warn  '} ${i.where}: ${i.msg}`);
    if (stats) console.log(`   URL: ${stats.diperiksa} diperiksa · ${stats.ok} terbuka · ${stats.diblokir} diblokir · ${stats.mati} mati · ${stats['tidak-terjangkau']} tidak terjangkau · kutipan cocok ${stats['kutipan-cocok']}, tidak cocok ${stats['kutipan-tidak-cocok']}, tanpa kutipan ${stats['tanpa-kutipan']}`);
  }
  console.log(`\nTotal: ${errors} error, ${warns} peringatan.${errors ? ' Perbaiki error sebelum lanjut.' : ''}`);
  return errors ? 1 : 0;
};
process.exitCode = await main();
