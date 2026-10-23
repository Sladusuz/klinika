// Zayavkalar bilan ishlash (ro'yxat, status, statistika) — admin panel va bot uchun umumiy
import tg from './tg.js';
import { allUsers } from './data.mjs';
const { call, leadText, leadKb, hm, SERVICES } = tg;

export const dayAgo = i => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date(Date.now() - i * 864e5));

const slim = l => ({ id: l.id, name: l.name, phone: l.phone, service: l.service, note: l.note || '', source: l.source, lang: l.lang, time: l.time, ts: l.ts, status: l.status || null, n: l.n || null, user: l.user ? { id: l.user.id, username: l.user.username || '' } : null });

export async function recentLeads(st, { filter = 'all', q = '', limit = 30 } = {}) {
  const days = (await st.list('d:')).map(k => k.slice(2)).sort().reverse();
  const needle = String(q || '').trim().toLowerCase(), out = [];
  for (const day of days) {
    const idx = await st.get('d:' + day);
    if (!idx || !idx.ids || !idx.ids.length) continue;
    const ls = (await Promise.all(idx.ids.map(id => st.get('l:' + id)))).filter(Boolean).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    for (const l of ls) {
      if (filter === 'new' && l.status) continue;
      if (filter === 'done' && !l.status) continue;
      if (needle && !`${l.name} ${l.phone} ${l.service} ${l.note || ''} ${l.id}`.toLowerCase().includes(needle)) continue;
      out.push(slim(l)); if (out.length >= limit) return out;
    }
  }
  return out;
}

export async function setLeadStatus(st, id, by, done) {
  const lead = await st.get('l:' + id); if (!lead) return null;
  lead.status = done ? { by, at: hm() } : null;
  await st.set('l:' + id, lead);
  // Telegramdagi barcha xodimlardagi karta ham yangilanadi
  await Promise.allSettled(Object.entries(lead.msgs || {}).map(([chat_id, message_id]) =>
    call('editMessageText', { chat_id, message_id, text: leadText(lead), parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: leadKb(lead, { copy: true }) })
      .catch(() => call('editMessageText', { chat_id, message_id, text: leadText(lead), parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: leadKb(lead, { copy: false, write: false }) })).catch(() => {})));
  return slim(lead);
}

export async function dashboard(st) {
  const today = dayAgo(0);
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const day = dayAgo(i);
    const [d, r] = await Promise.all([st.get('d:' + day), st.get('r:' + day)]);
    week.push({ day, leads: d ? d.n || 0 : 0, regs: r && r.ids ? r.ids.length : 0 });
  }
  const idx = (await st.get('d:' + today)) || { ids: [] };
  const leads = (await Promise.all((idx.ids || []).map(id => st.get('l:' + id)))).filter(Boolean).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const users = await allUsers(st);
  const by = {}; leads.forEach(l => { by[l.service] = (by[l.service] || 0) + 1; });
  const site = leads.filter(l => l.source !== 'bot').length, done = leads.filter(l => l.status).length;
  return {
    today: { day: today, leads: leads.length, site, bot: leads.length - site, done, wait: leads.length - done, regs: week[6].regs },
    users: { total: users.length, blocked: users.filter(u => u.blocked).length },
    week,
    services: Object.entries(by).sort((a, b) => b[1] - a[1]).map(([service, n]) => ({ service, n })),
    recent: leads.slice(0, 5).map(slim),
    allServices: SERVICES.uz
  };
}

export async function usersList(st, { q = '', limit = 100 } = {}) {
  const needle = String(q || '').trim().toLowerCase();
  let users = (await allUsers(st)).reverse();
  if (needle) users = users.filter(u => `${u.name || ''} ${u.tgName || ''} ${u.phone || ''} ${u.username || ''}`.toLowerCase().includes(needle));
  return users.slice(0, limit).map(u => ({ id: u.id, name: u.name || u.tgName || '', username: u.username || '', phone: u.phone || '', lang: u.lang || 'uz', regTime: u.regTime || '', apps: u.apps || 0, lastService: u.lastApp ? u.lastApp.service : '', blocked: !!u.blocked }));
}
