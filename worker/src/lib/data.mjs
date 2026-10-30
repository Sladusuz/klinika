// Ro'yxatdan o'tgan foydalanuvchilar bazasi (D1: usr:<telegramId>) va kunlik indekslar
import tg from './tg.js';
const { dayKey, tashkentTime } = tg;

// Foydalanuvchini saqlaydi/yangilaydi. Yangi foydalanuvchi bo'lsa true qaytaradi.
export async function saveUser(st, from, L, reg, application) {
  if (!st || !from || !from.id) return false;
  const key = 'usr:' + from.id, now = Date.now();
  let u = await st.get(key), isNew = !u;
  if (!u) u = { id: from.id, regAt: now, regTime: tashkentTime(), apps: 0 };
  Object.assign(u, { username: from.username || u.username || '', tgName: [from.first_name, from.last_name].filter(Boolean).join(' ') || u.tgName || '', lang: L || u.lang || 'uz', updAt: now });
  if (reg) { u.name = reg.name; u.phone = reg.phone; }
  if (application) { u.apps = (u.apps || 0) + 1; u.lastApp = application; }
  await st.set(key, u);
  if (isNew && reg) { // bugungi yangi ro'yxatdan o'tganlar
    const rk = 'r:' + dayKey(), r = (await st.get(rk)) || { ids: [] };
    if (!r.ids.includes(from.id)) { r.ids.push(from.id); await st.set(rk, r); }
  }
  return isNew;
}

export async function allUsers(st) {
  const keys = await st.list('usr:');
  const users = (await Promise.all(keys.map(k => st.get(k)))).filter(Boolean);
  return users.sort((a, b) => (a.regAt || 0) - (b.regAt || 0));
}

const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
export function usersCsv(users) {
  const head = ['Telegram ID', 'Username', 'Ism', 'Telefon', 'Til', "Ro'yxatdan o'tgan", 'Zayavkalar soni', "Oxirgi xizmat"];
  const rows = users.map(u => [u.id, u.username ? '@' + u.username : '', u.name || u.tgName, u.phone, (u.lang || '').toUpperCase(), u.regTime, u.apps || 0, u.lastApp && u.lastApp.service || ''].map(q).join(','));
  return '﻿' + [head.map(q).join(','), ...rows].join('\r\n'); // BOM: Excel o'zbekcha/ruscha harflarni to'g'ri ochadi
}
