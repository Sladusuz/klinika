// Hammaga xabar yuborish. Cloudflare Workers'da bitta so'rov cheklangan (bepul tarifda ~50 tarmoq chaqiruvi),
// shuning uchun yuborish "ish" (job) sifatida bazada saqlanadi va bo'laklarga bo'linadi:
// har bo'lak ~40 ta xabar; keyingisini o'zi chaqiradi, zaxira sifatida har daqiqalik cron ham davom ettiradi.
import tg from './tg.js';
import { allUsers } from './data.mjs';
const { call } = tg;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHUNK = () => Math.max(5, +process.env.BROADCAST_CHUNK || 40);
const DEAD = /blocked|deactivated|chat not found|user not found|kicked|PEER_ID_INVALID/i;

export async function recipients(st, exceptId) {
  const users = await allUsers(st);
  return users.filter(u => !u.blocked && String(u.id) !== String(exceptId));
}

// payload: { mid } (nusxa ko'chirish) yoki { text, btn }
export async function createJob(st, adminChat, payload) {
  const list = await recipients(st, adminChat);
  const job = { id: String(Date.now()), adminChat, mid: payload.mid, text: payload.text, btn: payload.btn, ids: list.map(u => u.id), pos: 0, ok: 0, fail: 0, dead: 0, upd: Date.now(), done: false };
  await st.set('bj:' + job.id, job);
  return job;
}

const markup = btn => btn && btn.text && /^https:\/\//i.test(btn.url || '') ? { reply_markup: { inline_keyboard: [[{ text: String(btn.text).slice(0, 40), url: btn.url }]] } } : {};

// Bitta bo'lakni yuboradi. { done, busy } qaytaradi.
export async function runChunk(st, id) {
  const job = await st.get('bj:' + id);
  if (!job || job.done) return { done: true };
  const stale = Date.now() - job.upd > 120000;
  if (!(await st.once(`bjc:${id}:${job.pos}`)) && !stale) return { busy: true };
  const part = job.ids.slice(job.pos, job.pos + CHUNK());
  const users = await Promise.all(part.map(uid => st.get('usr:' + uid)));
  const extra = job.text ? markup(job.btn) : {};
  const one = async (uid, u) => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (job.text) await call('sendMessage', Object.assign({ chat_id: uid, text: job.text, disable_web_page_preview: false }, extra));
        else await call('copyMessage', { chat_id: uid, from_chat_id: job.adminChat, message_id: job.mid });
        job.ok++; return;
      } catch (e) {
        const m = /retry after (\d+)/i.exec(e.message);
        if (m && attempt === 0) { await sleep((+m[1] + 1) * 1000); continue; }
        job.fail++;
        if (DEAD.test(e.message)) { job.dead++; if (u) { u.blocked = true; try { await st.set('usr:' + uid, u); } catch (x) { /* ixtiyoriy */ } } }
        return;
      }
    }
  };
  for (let i = 0; i < part.length; i += 20) { // Telegram chegarasi ~30 xabar/soniya
    await Promise.allSettled(part.slice(i, i + 20).map((uid, j) => one(uid, users[i + j])));
    if (i + 20 < part.length) await sleep(700);
  }
  job.pos += part.length; job.upd = Date.now();
  if (job.pos >= job.ids.length) {
    job.done = true;
    try { await st.set('b:' + job.id, Object.assign({ adminChat: job.adminChat, total: job.ids.length, ok: job.ok, fail: job.fail, dead: job.dead, at: new Date().toISOString() }, job.text ? { text: job.text.slice(0, 80) } : { mid: job.mid })); } catch (e) { /* ixtiyoriy */ }
    await call('sendMessage', { chat_id: job.adminChat, parse_mode: 'HTML', text: `📢 <b>Xabar yuborildi</b>\n\n✅ Yetkazildi: <b>${job.ok}</b>\n${job.fail ? `❌ Yetib bormadi: <b>${job.fail}</b>${job.dead ? ` (shundan <b>${job.dead}</b> tasi botni bloklagan, endi o'tkazib yuboriladi)` : ''}\n` : ''}👥 Jami: <b>${job.ids.length}</b>` }).catch(() => {});
  }
  await st.set('bj:' + id, job);
  return { done: job.done };
}

// Bo'lakni ishga tushiradi; tugamagan bo'lsa, keyingisini yangi chaqiruv bilan davom ettiradi
export async function processJob(st, id) {
  const r = await runChunk(st, id);
  if (r.done || r.busy) return r;
  const base = (process.env.API_URL || globalThis.__ORIGIN || '').replace(/\/$/, '');
  if (!base) return r; // cron davom ettiradi
  try { await fetch(`${base}/api/broadcast-background`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-bot-secret': process.env.TELEGRAM_WEBHOOK_SECRET || '' }, body: JSON.stringify({ job: id }) }); } catch (e) { /* cron davom ettiradi */ }
  return r;
}

export const kick = p => { const c = globalThis.__CTX; if (c && c.waitUntil) c.waitUntil(p.catch(e => console.error('job:', e.message))); return p; };

// Tugamagan ishlarni (cron) davom ettirish
export async function resumeJobs(st) {
  const keys = await st.list('bj:'); let n = 0;
  for (const k of keys) { const j = await st.get(k); if (j && !j.done) { await processJob(st, j.id); n++; break; } }
  return n;
}
