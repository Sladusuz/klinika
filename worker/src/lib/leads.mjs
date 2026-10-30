// Zayavkalar bilan ishlash (ro'yxat, status, statistika) — admin panel va bot uchun umumiy
import tg from './tg.js';
import { allUsers } from './data.mjs';
const { call, leadText, leadKb, hm, SERVICES } = tg;

export const dayAgo = i => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date(Date.now() - i * 864e5));

const slim = l => ({ id: l.id, name: l.name, phone: l.phone, service: l.service, note: l.note || '', source: l.source, lang: l.lang, time: l.time, ts: l.ts, status: l.status || null, respMin: l.status && l.status.ts && l.ts ? Math.max(0, Math.round((l.status.ts - l.ts) / 60000)) : null, n: l.n || null, user: l.user ? { id: l.user.id, username: l.user.username || '' } : null });

export async function recentLeads(st, { filter = 'all', q = '', limit = 30, offset = 0 } = {}) {
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
      out.push(slim(l)); if (out.length >= offset + limit + 1) break;
    }
    if (out.length >= offset + limit + 1) break;
  }
  return { leads: out.slice(offset, offset + limit), more: out.length > offset + limit };
}

export async function setLeadStatus(st, id, by, done) {
  const lead = await st.get('l:' + id); if (!lead) return null;
  lead.status = done ? { by, at: hm(), ts: Date.now() } : null;
  await st.set('l:' + id, lead);
  // Telegramdagi barcha xodimlardagi karta ham yangilanadi
  await Promise.allSettled(Object.entries(lead.msgs || {}).map(([chat_id, message_id]) =>
    call('editMessageText', { chat_id, message_id, text: leadText(lead), parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: leadKb(lead, { copy: true }) })
      .catch(() => call('editMessageText', { chat_id, message_id, text: leadText(lead), parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: leadKb(lead, { copy: false, write: false }) })).catch(() => {})));
  return slim(lead);
}

export async function dashboard(st) {
  const today = dayAgo(0);
  await st.list('d:'); await st.list('r:');
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

const hourOf = ts => new Date(ts + 5 * 3600e3).getUTCHours(); // Toshkent soati

export async function allLeads(st) { // butun tarix (eskidan yangiga)
  const days = (await st.list('d:')).map(k => k.slice(2)).sort();
  const idxs = await Promise.all(days.map(d => st.get('d:' + d)));
  const ids = idxs.flatMap(i => (i && i.ids) || []);
  return (await Promise.all(ids.map(id => st.get('l:' + id)))).filter(Boolean);
}

export async function analytics(st, days) {
  days = Math.min(Math.max(+days || 30, 1), 90);
  const daily = [], leads = [];
  await st.list('d:'); await st.list('r:'); // bitta so'rovda hammasi keshga
  const win = []; for (let i = days - 1; i >= 0; i--) win.push(dayAgo(i));
  const idxAll = await Promise.all(win.map(d => st.get('d:' + d)));
  await Promise.all(idxAll.flatMap(ix => (ix && ix.ids) || []).map(id => st.get('l:' + id))); // barcha zayavkalar bitta guruhda
  for (let i = days - 1; i >= 0; i--) {
    const day = dayAgo(i);
    const [idx, r] = await Promise.all([st.get('d:' + day), st.get('r:' + day)]);
    const ls = idx && idx.ids ? (await Promise.all(idx.ids.map(id => st.get('l:' + id)))).filter(Boolean) : [];
    leads.push(...ls);
    daily.push({ day, leads: ls.length, done: ls.filter(x => x.status).length, regs: r && r.ids ? r.ids.length : 0 });
  }
  const count = (arr, f) => { const m = {}; arr.forEach(x => { const k = f(x); m[k] = (m[k] || 0) + 1; }); return m; };
  const done = leads.filter(x => x.status), resp = done.filter(x => x.status.ts && x.ts).map(x => (x.status.ts - x.ts) / 60000).sort((a, b) => a - b);
  const users = await allUsers(st);
  const byHour = Array(24).fill(0); leads.forEach(x => { if (x.ts) byHour[hourOf(x.ts)]++; });
  return {
    days, daily,
    totals: { leads: leads.length, done: done.length, wait: leads.length - done.length, rate: leads.length ? Math.round(done.length / leads.length * 100) : 0, regs: daily.reduce((a, d) => a + d.regs, 0), avgResp: resp.length ? Math.round(resp.reduce((a, b) => a + b, 0) / resp.length) : null, medResp: resp.length ? Math.round(resp[Math.floor(resp.length / 2)]) : null },
    bySource: count(leads, x => x.source === 'bot' ? 'bot' : 'site'),
    byLang: count(leads, x => x.lang || 'uz'),
    byService: Object.entries(count(leads, x => x.service)).sort((a, b) => b[1] - a[1]).map(([service, n]) => ({ service, n })),
    byHour,
    top: users.slice().sort((a, b) => (b.apps || 0) - (a.apps || 0)).slice(0, 5).filter(u => u.apps).map(u => ({ id: u.id, name: u.name || u.tgName, phone: u.phone, apps: u.apps })),
    users: { total: users.length, blocked: users.filter(u => u.blocked).length }
  };
}

export async function userLeads(st, u, max = 30) {
  const days = (await st.list('d:')).map(k => k.slice(2)).sort().reverse(), out = [];
  for (const day of days) {
    const idx = await st.get('d:' + day); if (!idx || !idx.ids) continue;
    const xs = await Promise.all(idx.ids.map(id => st.get('l:' + id)));
    for (const x of xs) if (x && ((x.user && String(x.user.id) === String(u.id)) || (u.phone && x.phone === u.phone))) out.push(slim(x));
    if (out.length >= max) break;
  }
  return out.sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, max);
}
