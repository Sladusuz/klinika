// Suhbat holatini Netlify Blobs'da saqlash. Blobs ishlamasa null qaytaradi (bot eski, holatsiz rejimda ishlayveradi).
let blobs = null;
try { blobs = require('@netlify/blobs'); } catch (e) { /* paket yo'q */ }

async function openStore(event) {
  if (global.__BOT_STORE) return global.__BOT_STORE; // testlar uchun
  if (!blobs) return null;
  try {
    if (event && typeof blobs.connectLambda === 'function') blobs.connectLambda(event);
    const s = blobs.getStore({ name: 'bot-state', consistency: 'strong' });
    return {
      get: async k => { try { return await s.get(k, { type: 'json' }); } catch (e) { return null; } },
      set: async (k, v) => { await s.setJSON(k, v); },
      del: async k => { try { await s.delete(k); } catch (e) { /* yo'q */ } }
    };
  } catch (e) { console.error('blobs:', e.message); return null; }
}
module.exports = { openStore };
