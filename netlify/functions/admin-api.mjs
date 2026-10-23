// Mini App admin panel API: POST /.netlify/functions/admin-api  (Telegram initData imzosi + admin tekshiruvi)
import tg from './lib/tg.js';
import { openStore } from './lib/state.mjs';
import { verifyInitData } from './lib/auth.mjs';
import { loadAdmins, addAdmin, removeAdmin, isEnvAdmin } from './lib/admins.mjs';
import { recentLeads, setLeadStatus, dashboard, usersList, analytics, userLeads } from './lib/leads.mjs';
import { recipients, runBroadcastText } from './lib/broadcast.mjs';
import { sendReport, sendUsersCsv, sendLeadsCsv, sendBackup } from './lib/report.mjs';
const { admins, envAdmins, clean, SITE, call, dayKey, esc } = tg;

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const user = verifyInitData(req.headers.get('x-tg-init-data') || '', process.env.TELEGRAM_BOT_TOKEN);
  if (!user) return json(401, { error: 'auth' });
  const st = await openStore();
  if (!st) return json(503, { error: 'store' });
  await loadAdmins(st);
  // Panelga FAQAT asosiy egasi (ADMIN_CHAT_ID dagi) kira oladi; boshqa adminlar ham, oddiy foydalanuvchilar ham kira olmaydi
  if (!envAdmins().includes(String(user.id))) {
    try {
      const sec = (await st.get('sec')) || [];
      sec.push({ t: new Date().toISOString(), id: user.id, name: [user.first_name, user.last_name].filter(Boolean).join(' '), username: user.username || '' });
      await st.set('sec', sec.slice(-40));
      if (await st.once('secalert:' + user.id + ':' + dayKey())) { // bir kishi uchun kuniga bir marta ogohlantirish
        for (const o of envAdmins()) call('sendMessage', { chat_id: o, parse_mode: 'HTML', text: `🚨 <b>Panelga ruxsatsiz kirish urinishi</b>\n\n👤 ${esc([user.first_name, user.last_name].filter(Boolean).join(' '))}${user.username ? ' (@' + esc(user.username) + ')' : ''}\n🆔 <code>${user.id}</code>\n\nKirish rad etildi.` }).catch(() => {});
      }
    } catch (e) { /* jurnal ixtiyoriy */ }
    return json(403, { error: 'forbidden' });
  }
  let b; try { b = await req.json(); } catch (e) { b = {}; }
  const me = { id: user.id, name: [user.first_name, user.last_name].filter(Boolean).join(' '), username: user.username || '', main: isEnvAdmin(user.id) };
  const who = user.username ? '@' + user.username : (user.first_name || String(user.id));
  try {
    switch (b.action) {
      case 'init': return json(200, { me, admins: admins().map(id => ({ id, main: isEnvAdmin(id) })), dash: await dashboard(st) });
      case 'dashboard': return json(200, { dash: await dashboard(st) });
      case 'leads': return json(200, await recentLeads(st, { filter: ['new', 'done'].includes(b.filter) ? b.filter : 'all', q: clean(b.q, 60), limit: Math.min(+b.limit || 30, 60), offset: Math.max(+b.offset || 0, 0) }));
      case 'stats': return json(200, { stats: await analytics(st, b.days) });
      case 'user': {
        const u = await st.get('usr:' + String(b.id || '').replace(/\D/g, ''));
        if (!u) return json(404, { error: 'not_found' });
        return json(200, { leads: await userLeads(st, u) });
      }
      case 'dm': { // bitta mijozga shaxsiy xabar
        const id = String(b.id || '').replace(/\D/g, ''), text = String(b.text || '').trim();
        const u = id && await st.get('usr:' + id);
        if (!u) return json(404, { error: 'not_found' });
        if (text.length < 1 || text.length > 4000) return json(400, { error: 'text' });
        if (!(await st.once('dm:' + id + ':' + hash(text) + ':' + Math.floor(Date.now() / 60000)))) return json(429, { error: 'duplicate' });
        try { await call('sendMessage', { chat_id: id, text }); return json(200, { ok: true }); }
        catch (e) { if (/blocked|deactivated|chat not found/i.test(e.message)) { u.blocked = true; await st.set('usr:' + id, u); return json(409, { error: 'blocked' }); } throw e; }
      }
      case 'broadcasts': { const ks = (await st.list('b:')).sort().slice(-15).reverse(); return json(200, { items: (await Promise.all(ks.map(k => st.get(k)))).filter(Boolean) }); }
      case 'security': return json(200, { sec: ((await st.get('sec')) || []).slice(-15).reverse(), log: ((await st.get('log')) || []).slice(-40).reverse(), ownerId: user.id });
      case 'leadsCsv': await sendLeadsCsv(user.id, st); return json(200, { ok: true });
      case 'backup': await sendBackup(user.id, st); return json(200, { ok: true });
      case 'status': {
        if (!b.id || typeof b.id !== 'string') return json(400, { error: 'id' });
        const lead = await setLeadStatus(st, b.id.slice(0, 20), who, !!b.done);
        return lead ? json(200, { lead }) : json(404, { error: 'not_found' });
      }
      case 'users': return json(200, { users: await usersList(st, { q: clean(b.q, 60), limit: 150 }) });
      case 'csv': await sendUsersCsv(user.id, st); return json(200, { ok: true });
      case 'report': await sendReport(st, [user.id], false); return json(200, { ok: true });
      case 'recipients': return json(200, { n: (await recipients(st, user.id)).length });
      case 'broadcast': {
        const text = String(b.text || '').trim();
        if (text.length < 2 || text.length > 4000) return json(400, { error: 'text' });
        const total = (await recipients(st, user.id)).length;
        if (!total) return json(409, { error: 'no_recipients' });
        if (!(await st.once('bcp:' + user.id + ':' + hash(text) + ':' + Math.floor(Date.now() / 60000)))) return json(429, { error: 'duplicate' }); // bir daqiqada bir xil matn ikki marta ketmaydi
        const btn = b.btnText && b.btnUrl ? { text: clean(b.btnText, 40), url: clean(b.btnUrl, 300) } : undefined;
        let mode = 'bg';
        try {
          const r = await fetch(`${SITE()}/.netlify/functions/broadcast-background`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-bot-secret': process.env.TELEGRAM_WEBHOOK_SECRET || '' }, body: JSON.stringify({ chat: user.id, text, btn }) });
          if (!(r.ok || r.status === 202)) throw new Error('bg ' + r.status);
        } catch (e) { mode = 'inline'; await runBroadcastText(st, user.id, text, btn); }
        return json(200, { ok: true, total, mode });
      }
      case 'admins': return json(200, { admins: admins().map(id => ({ id, main: isEnvAdmin(id) })) });
      case 'addAdmin': {
        if (!me.main) return json(403, { error: 'main_only' });
        const id = String(b.id || '').trim(); if (!/^\d{3,15}$/.test(id)) return json(400, { error: 'id' });
        const added = await addAdmin(st, id);
        if (added) { call('sendMessage', { chat_id: id, parse_mode: 'HTML', text: "👮 Siz <b>Orlent Medical</b> botida admin etib tayinlandingiz.\n\nSizga yangi zayavkalar va kunlik hisobot keladi.\n<i>Boshqaruv paneli faqat asosiy admin uchun.</i>" }).catch(() => {}); }
        return json(200, { ok: true, added, admins: admins().map(i => ({ id: i, main: isEnvAdmin(i) })) });
      }
      case 'removeAdmin': {
        if (!me.main) return json(403, { error: 'main_only' });
        const id = String(b.id || '').trim();
        const r = await removeAdmin(st, id);
        return json(r === 'env' ? 409 : 200, { ok: r === true, error: r === 'env' ? 'env_admin' : undefined, admins: admins().map(i => ({ id: i, main: isEnvAdmin(i) })) });
      }
      default: return json(400, { error: 'action' });
    }
  } catch (e) {
    console.error('admin-api:', b.action, e.message);
    return json(500, { error: 'server', message: String(e.message).slice(0, 120) });
  }
};
