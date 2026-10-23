// Hammaga xabar yuborish: admin yozgan xabar ro'yxatdan o'tgan hamma foydalanuvchiga nusxalanadi (copyMessage)
import tg from './tg.js';
import { allUsers } from './data.mjs';
const { call } = tg;
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function recipients(st, exceptId) {
  const users = await allUsers(st);
  return users.filter(u => !u.blocked && String(u.id) !== String(exceptId));
}

const DEAD = /blocked|deactivated|chat not found|user not found|kicked|PEER_ID_INVALID/i;

export async function runBroadcast(st, adminChat, mid) {
  const list = await recipients(st, adminChat);
  const delay = process.env.BROADCAST_DELAY != null ? +process.env.BROADCAST_DELAY : 1100;
  let ok = 0, fail = 0, dead = 0;
  const one = async u => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try { await call('copyMessage', { chat_id: u.id, from_chat_id: adminChat, message_id: mid }); ok++; return; }
      catch (e) {
        const m = /retry after (\d+)/i.exec(e.message);
        if (m && attempt === 0) { await sleep((+m[1] + 1) * 1000); continue; } // Telegram "juda tez" desa, kutib qayta uriniladi
        fail++;
        if (DEAD.test(e.message)) { dead++; u.blocked = true; try { await st.set('usr:' + u.id, u); } catch (x) { /* ixtiyoriy */ } }
        return;
      }
    }
  };
  for (let i = 0; i < list.length; i += 20) { // Telegram chegarasi ~30 xabar/soniya
    await Promise.allSettled(list.slice(i, i + 20).map(one));
    if (i + 20 < list.length && delay) await sleep(delay);
  }
  try { await st.set('b:' + Date.now(), { adminChat, mid, total: list.length, ok, fail, dead, at: new Date().toISOString() }); } catch (e) { /* ixtiyoriy */ }
  await call('sendMessage', { chat_id: adminChat, parse_mode: 'HTML', text: `📢 <b>Xabar yuborildi</b>\n\n✅ Yetkazildi: <b>${ok}</b>\n${fail ? `❌ Yetib bormadi: <b>${fail}</b>${dead ? ` (shundan <b>${dead}</b> tasi botni bloklagan, endi o'tkazib yuboriladi)` : ''}\n` : ''}👥 Jami: <b>${list.length}</b>` }).catch(() => {});
  return { total: list.length, ok, fail, dead };
}
