// Doimiy xotira: Netlify Blobs (deploylar orasida saqlanadi). v2 funksiyalarda avtomatik sozlanadi.
// Blobs ishlamasa null qaytaradi: bot savol matniga yashirilgan holat bilan (zaxira rejim) ishlayveradi.
let reason = '';
export async function openStore() {
  if (globalThis.__BOT_STORE) return globalThis.__BOT_STORE; // testlar uchun
  try {
    const { getStore } = await import('@netlify/blobs');
    const s = getStore({ name: 'bot-state', consistency: 'strong' });
    reason = '';
    return {
      get: async k => { try { return await s.get(k, { type: 'json' }); } catch (e) { reason = 'o\'qish: ' + e.message; return null; } },
      set: async (k, v) => { await s.setJSON(k, v); },
      del: async k => { try { await s.delete(k); } catch (e) { /* yo'q */ } },
      // atomik: kalit yangi bo'lsa true (birinchi bo'lib yozdik), allaqachon bo'lsa false — takrorlanishdan himoya
      once: async k => { try { const r = await s.setJSON(k, { t: Date.now() }, { onlyIfNew: true }); return !!(r && r.modified); } catch (e) { return true; } },
      list: async prefix => { const out = []; for await (const page of s.list({ prefix, paginate: true })) for (const b of page.blobs) out.push(b.key); return out; }
    };
  } catch (e) { reason = 'getStore: ' + e.message; console.error('blobs:', e.message); return null; }
}
export const why = () => reason;
