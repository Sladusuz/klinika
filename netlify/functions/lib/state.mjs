// Suhbat holatini Netlify Blobs'da saqlash (v2 funksiyalarda avtomatik sozlanadi).
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
      del: async k => { try { await s.delete(k); } catch (e) { /* yo'q */ } }
    };
  } catch (e) { reason = 'getStore: ' + e.message; console.error('blobs:', e.message); return null; }
}
export const why = () => reason;
