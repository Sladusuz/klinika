// Doimiy xotira: Cloudflare D1 (SQLite, kuchli izchillik). Jadval: kv(k, v JSON).
// Tezlik va Cloudflare chegarasi (bepul tarifda bir so'rovga ~50 ta DB/tarmoq chaqiruvi) uchun:
//  - bir tick ichidagi bir nechta get() bitta SQL so'rovga birlashtiriladi;
//  - list(prefix) qiymatlarni ham keshga yuklaydi (keyingi get() lar bazaga bormaydi);
//  - kesh faqat bitta so'rov davomida yashaydi.
let reason = '', ready = null;
const CHUNK = 90; // D1: bitta so'rovda ko'pi bilan 100 ta parametr
const like = p => p.replace(/[\\%_]/g, '\\$&') + '%';

export async function openStore() {
  if (globalThis.__BOT_STORE) return globalThis.__BOT_STORE; // testlar uchun
  const db = globalThis.__DB;
  if (!db) { reason = "D1 ulanmagan (DB binding yo'q)"; return null; }
  try {
    ready = ready || db.prepare('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)').run();
    await ready;
  } catch (e) { ready = null; reason = 'D1: ' + e.message; console.error('d1:', e.message); return null; }
  reason = '';
  const raw = new Map(); // k -> JSON qator yoki null (yo'q)
  let queue = null;
  const parse = s => (s == null ? null : JSON.parse(s));
  const fetchKeys = async keys => {
    keys = [...new Set(keys)].filter(k => !raw.has(k));
    for (let i = 0; i < keys.length; i += CHUNK) {
      const part = keys.slice(i, i + CHUNK);
      const { results } = await db.prepare(`SELECT k, v FROM kv WHERE k IN (${part.map(() => '?').join(',')})`).bind(...part).all();
      for (const r of results) raw.set(r.k, r.v);
      for (const k of part) if (!raw.has(k)) raw.set(k, null);
    }
  };
  const flush = async () => {
    const q = queue; queue = null;
    try { await fetchKeys(q.map(x => x[0])); q.forEach(([k, res]) => res(parse(raw.get(k)))); }
    catch (e) { q.forEach(([, , rej]) => rej(e)); }
  };
  const load = k => new Promise((res, rej) => { if (!queue) { queue = []; Promise.resolve().then(flush); } queue.push([k, res, rej]); });
  return {
    get: async k => { try { return raw.has(k) ? parse(raw.get(k)) : await load(k); } catch (e) { reason = "o'qish: " + e.message; return null; } },
    set: async (k, v) => { const s = JSON.stringify(v); await db.prepare('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v').bind(k, s).run(); raw.set(k, s); },
    del: async k => { try { await db.prepare('DELETE FROM kv WHERE k = ?').bind(k).run(); raw.set(k, null); } catch (e) { /* yo'q */ } },
    // atomik: kalit yangi bo'lsa true (birinchi bo'lib yozdik), allaqachon bo'lsa false — takrorlanishdan himoya
    once: async k => { try { const r = await db.prepare('INSERT OR IGNORE INTO kv (k, v) VALUES (?, ?)').bind(k, JSON.stringify({ t: Date.now() })).run(); return !!(r.meta && r.meta.changes); } catch (e) { return true; } },
    list: async prefix => {
      const { results } = await db.prepare("SELECT k, v FROM kv WHERE k LIKE ? ESCAPE '\\'").bind(like(prefix)).all();
      for (const r of results) raw.set(r.k, r.v);
      return results.map(r => r.k);
    },
    prefetch: async keys => { await fetchKeys(keys); },
    delPrefix: async prefix => { const r = await db.prepare("DELETE FROM kv WHERE k LIKE ? ESCAPE '\\'").bind(like(prefix)).run(); for (const k of [...raw.keys()]) if (k.startsWith(prefix)) raw.delete(k); return (r.meta && r.meta.changes) || 0; }
  };
}
export const why = () => reason;
