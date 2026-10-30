// Kunlik hisobot va foydalanuvchilar ro'yxati (CSV)
import tg from './tg.js';
import { allUsers, usersCsv } from './data.mjs';
import { allLeads } from './leads.mjs';
const { call, esc, admins, SERVICES, EMO, dayKey, sendDoc } = tg;
const LINE = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
const plural = (n, w) => `${n} ${w}`;

function chunk(text, max) { // Telegram 4096 belgi cheklovi
  const out = []; let cur = '';
  for (const ln of text.split('\n')) { if ((cur + '\n' + ln).length > max) { out.push(cur); cur = ln; } else cur = cur ? cur + '\n' + ln : ln; }
  if (cur) out.push(cur); return out;
}

export async function buildReport(st, day) {
  day = day || dayKey();
  const idx = (await st.get('d:' + day)) || { n: 0, ids: [] };
  const leads = (await Promise.all((idx.ids || []).map(id => st.get('l:' + id)))).filter(Boolean).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const regs = ((await st.get('r:' + day)) || { ids: [] }).ids.length;
  const users = await allUsers(st);
  const site = leads.filter(l => l.source !== 'bot').length, bot = leads.length - site;
  const done = leads.filter(l => l.status).length, wait = leads.length - done;
  const [y, m, d] = day.split('-');
  const hm = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' }).format(new Date());
  const L = [`📊 <b>KUNLIK HISOBOT</b>`, `🗓 ${d}.${m}.${y} · soat ${hm} holatiga`, '', LINE];
  if (!leads.length) L.push('📭 Bugun yangi zayavka bo\'lmadi.');
  else {
    L.push(`📥 Zayavkalar: <b>${leads.length}</b>   (🌐 sayt ${site} · 🤖 bot ${bot})`, `🟢 Qabul qilingan: <b>${done}</b>   🟡 Kutayotgan: <b>${wait}</b>`);
  }
  L.push(`👥 Yangi ro'yxatdan o'tganlar: <b>${regs}</b>   (jami: <b>${users.length}</b>)`, LINE);
  if (leads.length) {
    const by = {}; leads.forEach(l => { by[l.service] = (by[l.service] || 0) + 1; });
    L.push('🩺 <b>Xizmatlar bo\'yicha</b>');
    Object.entries(by).sort((a, b) => b[1] - a[1]).forEach(([s, n]) => L.push(`${EMO[SERVICES.uz.indexOf(s)] || '🩺'} ${esc(s)} — <b>${n}</b>`));
    L.push('', '📋 <b>Zayavkalar</b>');
    leads.slice(0, 40).forEach((l, i) => {
      const t = (l.time || '').split('·')[1] || ''; 
      L.push(`${i + 1}. ${l.status ? '🟢' : '🟡'} <b>${esc(l.name)}</b> · ${esc(l.phone)} · ${esc(l.service)}${t ? ' ·' + esc(t) : ''}`);
    });
    if (leads.length > 40) L.push(`… va yana ${leads.length - 40} ta`);
    if (wait) L.push('', `⚠️ <b>${wait} ta zayavka hali qabul qilinmagan.</b> Kartadagi «✅ Qabul qilindi» tugmasini bosing.`);
  }
  return { text: L.join('\n'), users, leads };
}

const usersKb = { inline_keyboard: [[{ text: '👥 Ro\'yxatdan o\'tganlar (CSV)', callback_data: 'users' }]] };

export async function sendUsersCsv(chat, st) {
  const users = await allUsers(st);
  if (!users.length) return call('sendMessage', { chat_id: chat, text: '👥 Hali hech kim ro\'yxatdan o\'tmagan.' });
  return sendDoc(chat, `orlent-users-${dayKey()}.csv`, usersCsv(users), `👥 <b>Ro'yxatdan o'tganlar:</b> ${users.length} ta\n<i>Excel yoki Google Sheets'da oching.</i>`);
}

// Hisobotni xodimlarga yuboradi (chatlar berilmasa: hamma admin). withCsv: zaxira nusxa sifatida CSV ham yuboriladi.
export async function sendReport(st, chats, withCsv) {
  const rep = await buildReport(st);
  const targets = chats && chats.length ? chats : admins();
  for (const chat of targets) {
    const parts = chunk(rep.text, 3800);
    for (let i = 0; i < parts.length; i++) await call('sendMessage', Object.assign({ chat_id: chat, text: parts[i], parse_mode: 'HTML', disable_web_page_preview: true }, i === parts.length - 1 ? { reply_markup: usersKb } : {})).catch(e => console.error('report:', e.message));
    if (withCsv && rep.users.length) await sendUsersCsv(chat, st).catch(e => console.error('csv:', e.message));
  }
  return rep;
}

export async function cleanup(st) { // takrorlanishdan himoya kalitlari bir kundan keyin kerak emas
  let n = 0;
  for (const p of ['uq:', 'o:']) { if (st.delPrefix) n += await st.delPrefix(p); else for (const k of await st.list(p)) { await st.del(k); n++; } }
  return n;
}

const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
export async function sendLeadsCsv(chat, st) { // butun zayavkalar tarixi (Excel uchun BOM bilan)
  const leads = await allLeads(st);
  if (!leads.length) return call('sendMessage', { chat_id: chat, text: '📋 Hali zayavka yo\'q.' });
  const head = ['Ariza №', 'Sana va vaqt', 'Ism', 'Telefon', 'Xizmat', 'Izoh', 'Manba', 'Til', 'Holat', 'Kim qabul qildi', 'Javob vaqti (daqiqa)', 'Telegram'];
  const rows = leads.map(l => [l.id, l.time, l.name, l.phone, l.service, l.note || '', l.source === 'bot' ? 'Bot' : 'Sayt', (l.lang || '').toUpperCase(), l.status ? 'Qabul qilingan' : 'Yangi', l.status ? l.status.by + ' ' + l.status.at : '', l.status && l.status.ts && l.ts ? Math.round((l.status.ts - l.ts) / 60000) : '', l.user && l.user.username ? '@' + l.user.username : ''].map(q).join(','));
  return sendDoc(chat, `orlent-zayavkalar-${dayKey()}.csv`, '\uFEFF' + [head.map(q).join(','), ...rows].join('\r\n'), `📋 <b>Zayavkalar:</b> ${leads.length} ta`);
}

export async function sendBackup(chat, st) { // hamma ma'lumotning to'liq zaxira nusxasi (JSON)
  const [users, leads] = [await allUsers(st), await allLeads(st)];
  const admins2 = (await st.get('admins')) || [];
  const data = { exportedAt: new Date().toISOString(), users, leads, admins: admins2 };
  return sendDoc(chat, `orlent-zaxira-${dayKey()}.json`, JSON.stringify(data, null, 1), `💾 <b>Zaxira nusxa</b>\n👥 ${users.length} mijoz · 📋 ${leads.length} zayavka`, 'application/json');
}
