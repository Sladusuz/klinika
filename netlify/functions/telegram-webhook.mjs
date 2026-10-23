// Telegram bot webhook: POST /.netlify/functions/telegram-webhook
// Suhbat holati Netlify Blobs'da saqlanadi (c:<chatId>). Blobs bo'lmasa, savol matniga yashirilgan holat bilan ishlaydi.
import tg from './lib/tg.js';
import X from './lib/bot-texts.js';
import { openStore } from './lib/state.mjs';
import { saveUser } from './lib/data.mjs';
import { sendReport, sendUsersCsv } from './lib/report.mjs';
const { call, esc, admins, normPhone, clean, SERVICES, notifyAdmins, SITE, newTicket, leadText, leadKb, hm } = tg;
const LANGS = ['uz', 'ru', 'en'];
const TTL = 3 * 60 * 60 * 1000;

const detectLang = from => { const c = ((from && from.language_code) || '').slice(0, 2); return c === 'ru' ? 'ru' : c === 'en' ? 'en' : 'uz'; };
const menuKb = L => ({ keyboard: [[{ text: X[L].menu.apply }], [{ text: X[L].menu.svcs }, { text: X[L].menu.profile }], [{ text: X[L].menu.addr }, { text: X[L].menu.contact }], [{ text: X[L].menu.site }, { text: X[L].menu.lang }]], resize_keyboard: true, is_persistent: true });
const regKb = L => ({ keyboard: [[{ text: X[L].share, request_contact: true }], [{ text: X[L].skip }]], resize_keyboard: true });
const stepKb = L => ({ keyboard: [[{ text: X[L].share, request_contact: true }], [{ text: X[L].cancel }]], resize_keyboard: true, one_time_keyboard: false });
const langKb = () => ({ inline_keyboard: [LANGS.map(l => ({ text: X[l].flag, callback_data: 'lang:' + l }))] });
const EMO = ['🩺', '👂', '👃', '🗣', '📡', '👶'];
const bar = n => '▰'.repeat(n) + '▱'.repeat(3 - n);
const head = (L, n) => `<code>${bar(n)}</code>  ${n}/3 · <b>${X[L].step[n - 1]}</b>`;
const EFFECT = '5046509860389126442'; // 🎉 konfetti
const PICK = '🌍 Tilni tanlang · Выберите язык · Choose language';
let GUARD = null; // joriy so'rov: bir xil xabarni qisqa vaqtda ikki marta yubormaslik uchun
const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const fresh = async (chat, sig) => !(GUARD && GUARD.st) || GUARD.st.once(`o:${chat}:${hash(sig)}:${Math.floor(Date.now() / 6000)}`);
const say = async (chat_id, text, extra) => {
  if (!(await fresh(chat_id, text))) return null;
  return call('sendMessage', Object.assign({ chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true }, extra || {}));
};
const sayFx = async (chat_id, text, extra) => { try { return await say(chat_id, text, Object.assign({ message_effect_id: EFFECT }, extra)); } catch (e) { return say(chat_id, text, extra); } };
const svcKb = L => {
  const b = SERVICES[L].map((s, i) => ({ text: `${EMO[i]} ${s}`, callback_data: `s:${L}:${i}` }));
  const rows = []; for (let i = 0; i < b.length; i += 2) rows.push(b.slice(i, i + 2));
  return { inline_keyboard: rows };
};
const force = ph => ({ reply_markup: { force_reply: true, input_field_placeholder: ph } });

function findMenu(text) {
  for (const L of LANGS) {
    for (const k of Object.keys(X[L].menu)) if (X[L].menu[k] === text) return { L, k };
    if (X[L].cancel === text) return { L, k: 'cancel' };
    if (X[L].skip === text) return { L, k: 'skip' };
  }
  return null;
}
function clearStep(meta) { delete meta.step; delete meta.svc; delete meta.svcIdx; delete meta.name; delete meta.ts; }

async function sendWelcome(chat, L, from, kb) {
  const caption = `${X[L].hi}, <b>${esc((from && from.first_name) || '')}</b>! 👋\n\n${X[L].welcome}`;
  const extra = kb ? { reply_markup: kb } : {};
  if (!(await fresh(chat, 'photo:' + L))) return null;
  try { await call('sendPhoto', Object.assign({ chat_id: chat, photo: `${SITE()}/assets/bot/welcome-${L}.jpg`, caption, parse_mode: 'HTML' }, extra)); }
  catch (e) { await say(chat, caption, extra); }
}
async function greet(c, L, from) { // salomlashuv + (kerak bo'lsa) ro'yxatdan o'tish taklifi
  const needReg = !!c.st && !c.meta.reg;
  await sendWelcome(c.chat, L, from, needReg ? null : menuKb(L));
  if (needReg) await say(c.chat, X[L].regAsk, { reply_markup: regKb(L) });
}

/* ---- holatsiz (zaxira) rejim: savol matniga yashirilgan holat ---- */
const namePrompt = (L, service) => `🩺 ${X[L].svc}: ${service}\n\n👤 ${X[L].askNameShort}`;
const phonePrompt = (L, service, name, err) => `${err ? err + '\n\n' : ''}🩺 ${X[L].svc}: ${service}\n👤 ${X[L].nameLbl}: ${name}\n\n📞 ${X[L].askPhoneShort}`;
function parseReply(m) {
  const r = m.reply_to_message; if (!r || !r.from || !r.from.is_bot || !r.text) return null;
  const lines = r.text.split('\n').filter(s => s.trim());
  for (const L of LANGS) {
    const p = `🩺 ${X[L].svc}: `; const i = lines.findIndex(s => s.startsWith(p));
    if (i < 0) continue;
    const service = lines[i].slice(p.length);
    const nl = lines.find(s => s.startsWith(`👤 ${X[L].nameLbl}: `));
    if (lines.some(s => s.startsWith('📞 '))) return { L, service, name: nl ? nl.slice(`👤 ${X[L].nameLbl}: `.length) : '', step: 'phone' };
    if (lines.some(s => s.startsWith('👤 ' + X[L].askNameShort))) return { L, service, step: 'name' };
  }
  return null;
}

async function finish(c, L, svcName, svcIdx, name, phone, from) {
  const uzIdx = svcIdx >= 0 ? svcIdx : SERVICES[L].indexOf(svcName);
  const service = uzIdx >= 0 ? SERVICES.uz[uzIdx] : svcName;
  const id = newTicket();
  try {
    await notifyAdmins({ id, name, phone, service, lang: L, source: 'bot', user: { id: from.id, username: from.username, first_name: from.first_name } }, c.st);
  } catch (e) {
    console.error('notify:', e.message);
    return say(c.chat, X[L].fail, { reply_markup: menuKb(L) });
  }
  clearStep(c.meta); if (c.st && !c.meta.reg) c.meta.reg = { name, phone }; await c.save();
  if (c.st) await saveUser(c.st, from, L, c.meta.reg || { name, phone }, { id, service, time: new Date().toISOString() }).catch(e => console.error('saveUser:', e.message));
  return sayFx(c.chat, X[L].done.replace('{svc}', esc(svcName)).replace('{name}', esc(name)).replace('{phone}', esc(phone)) + `\n🎫 № <code>${id}</code>`, { reply_markup: menuKb(L) });
}

const confirmCard = (L, m) => `${X[L].confirm}\n\n🩺 ${esc(m.svc)}\n👤 ${esc(m.reg.name)}\n📞 ${esc(m.reg.phone)}`;
const confirmKb = L => ({ inline_keyboard: [[{ text: X[L].send, callback_data: 'ok' }], [{ text: X[L].edit, callback_data: 'edit' }, { text: X[L].cancel, callback_data: 'cx' }]] });
async function askName(c, L) { return say(c.chat, `${head(L, 2)}\n🩺 <b>${esc(c.meta.svc)}</b> ✓\n\n${X[L].askName}`, { reply_markup: stepKb(L) }); }

async function startName(c, L, i) {
  const svc = SERVICES[L][i];
  if (c.st) {
    Object.assign(c.meta, { lang: L, step: 'name', svc, svcIdx: i, name: '', ts: Date.now() }); await c.save();
    if (c.meta.reg) { c.meta.step = 'confirm'; await c.save(); return say(c.chat, confirmCard(L, c.meta), { reply_markup: confirmKb(L) }); } // ro'yxatdan o'tgan: bitta bosish
    return askName(c, L);
  }
  return say(c.chat, namePrompt(L, esc(svc)), force(X[L].askNameShort.replace(':', '')));
}

async function menuAction(c, L, k) {
  if (k === 'apply') return say(c.chat, `${head(L, 1)}\n\n${X[L].pick}`, { reply_markup: svcKb(L) });
  if (k === 'skip') return say(c.chat, X[L].regSkip, { reply_markup: menuKb(L) });
  if (k === 'profile') {
    const r = c.meta.reg;
    if (!c.st || !r) return say(c.chat, X[L].noProfile, { reply_markup: regKb(L) });
    return say(c.chat, X[L].profile.replace('{p}', `👤 ${esc(r.name)}\n📞 ${esc(r.phone)}`), { reply_markup: stepKb(L) });
  }
  if (k === 'svcs') return say(c.chat, X[L].svcInfo, { reply_markup: { inline_keyboard: [[{ text: X[L].apply, callback_data: 'apply:' + L }]] } });
  if (k === 'lang') return say(c.chat, PICK, { reply_markup: langKb() });
  if (k === 'addr') return say(c.chat, X[L].addr, { reply_markup: { inline_keyboard: [[{ text: X[L].route, url: X.MAPS }]] } });
  if (k === 'contact') return say(c.chat, X[L].contact, { reply_markup: { inline_keyboard: [[{ text: X[L].write, url: 'https://t.me/orlentmedical' }], [{ text: '📷 Instagram', url: 'https://instagram.com/orlent_medical' }]] } });
  if (k === 'site') return say(c.chat, X[L].site, { reply_markup: { inline_keyboard: [[{ text: X[L].open, url: SITE() }]] } });
  if (k === 'cancel') return say(c.chat, X[L].cancelled, { reply_markup: menuKb(L) });
}

async function onCallback(q, c) {
  const data = q.data || '';
  const adm = () => admins().includes(String(c.chat));
  const who = q.from.username ? '@' + q.from.username : q.from.first_name;
  if (/^(done|reopen):/.test(data)) { // zayavka kartasini yangilash (barcha xodimlardagi nusxasi)
    if (!adm()) return call('answerCallbackQuery', { callback_query_id: q.id, text: '⛔️' });
    const [act, id] = data.split(':');
    const lead = c.st && await c.st.get('l:' + id);
    if (!lead) { // zaxira: ma'lumot topilmasa, faqat tugmani almashtiramiz
      await call('editMessageReplyMarkup', { chat_id: c.chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: act === 'done' ? `✅ Qabul qilindi — ${who}` : '🆕', callback_data: 'noop' }]] } }).catch(() => {});
      return call('answerCallbackQuery', { callback_query_id: q.id, text: '✅' });
    }
    lead.status = act === 'done' ? { by: who, at: hm() } : null;
    await c.st.set('l:' + id, lead);
    const targets = Object.assign({}, lead.msgs, { [c.chat]: q.message.message_id });
    await Promise.allSettled(Object.entries(targets).map(([chat_id, message_id]) =>
      call('editMessageText', { chat_id, message_id, text: leadText(lead), parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: leadKb(lead, { copy: true }) })
        .catch(() => call('editMessageText', { chat_id, message_id, text: leadText(lead), parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: leadKb(lead, { copy: false, write: false }) }))));
    return call('answerCallbackQuery', { callback_query_id: q.id, text: act === 'done' ? '✅ Qabul qilindi' : '🔄 Qayta ochildi' });
  }
  if (data === 'users') { await call('answerCallbackQuery', { callback_query_id: q.id }).catch(() => {}); return adm() && c.st ? sendUsersCsv(c.chat, c.st) : null; }
  if (data === 'done') { // eski xabarlardagi tugma
    if (!adm()) return call('answerCallbackQuery', { callback_query_id: q.id, text: '⛔️' });
    await call('editMessageReplyMarkup', { chat_id: c.chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: `✅ Qabul qilindi — ${who}`, callback_data: 'noop' }]] } });
    return call('answerCallbackQuery', { callback_query_id: q.id, text: '✅' });
  }
  await call('answerCallbackQuery', { callback_query_id: q.id }).catch(() => {});
  if (data.startsWith('lang:')) {
    const L = data.slice(5); if (!X[L]) return;
    c.meta.lang = L; clearStep(c.meta); await c.save();
    return greet(c, L, q.from);
  }
  const act = c.meta.step === 'confirm' && c.meta.svc && c.meta.reg, L0 = c.meta.lang || detectLang(q.from);
  if (data === 'ok') { if (act) return finish(c, L0, c.meta.svc, c.meta.svcIdx, c.meta.reg.name, c.meta.reg.phone, q.from); return say(c.chat, X[L0].hint, { reply_markup: menuKb(L0) }); }
  if (data === 'edit') { if (c.meta.svc) { c.meta.step = 'name'; await c.save(); return askName(c, L0); } return say(c.chat, X[L0].hint, { reply_markup: menuKb(L0) }); }
  if (data === 'cx') { clearStep(c.meta); await c.save(); return say(c.chat, X[L0].cancelled, { reply_markup: menuKb(L0) }); }
  if (data.startsWith('apply:')) { const L = data.slice(6); if (X[L]) return menuAction(c, L, 'apply'); }
  if (data.startsWith('s:')) {
    const [, L, i] = data.split(':');
    if (X[L] && SERVICES[L][+i]) return startName(c, L, +i);
  }
}

async function onMessage(m, c) {
  const text = (m.text || '').trim();
  if (/^\/id(@\w+)?$/i.test(text)) return say(c.chat, `🆔 Chat ID: <code>${c.chat}</code>`);
  if (/^\/(stats|users)(@\w+)?$/i.test(text)) { // faqat xodimlar uchun
    if (!admins().includes(String(c.chat)) || !c.st) return;
    return /stats/i.test(text) ? sendReport(c.st, [c.chat], false) : sendUsersCsv(c.chat, c.st);
  }
  if (m.chat.type !== 'private') return;
  const meta = c.meta, L = meta.lang || detectLang(m.from);
  const active = meta.step && meta.svc && meta.ts && Date.now() - meta.ts < TTL;

  if (/^\/start/i.test(text)) { if (meta.lang) { clearStep(meta); await c.save(); return greet(c, meta.lang, m.from); } return say(c.chat, PICK, { reply_markup: langKb() }); }
  if (/^\/profile/i.test(text)) return menuAction(c, L, 'profile');
  if (/^\/lang/i.test(text)) return say(c.chat, PICK, { reply_markup: langKb() });
  if (/^\/cancel/i.test(text)) { clearStep(meta); await c.save(); return menuAction(c, L, 'cancel'); }
  if (/^\/help/i.test(text)) return say(c.chat, X[L].hint, { reply_markup: menuKb(L) });

  // kontakt ulashildi
  if (m.contact) {
    if (m.contact.user_id && m.contact.user_id !== m.from.id) return say(c.chat, X[L].wrongContact, { reply_markup: active ? stepKb(L) : regKb(L) }); // boshqaning kontakti emas
    const cname = clean(`${m.contact.first_name || ''} ${m.contact.last_name || ''}`, 60) || clean(m.from.first_name, 60);
    const phone = normPhone(m.contact.phone_number);
    if (!phone) return say(c.chat, X[L].badPhone, { reply_markup: stepKb(L) });
    if (active && meta.step !== 'confirm') return finish(c, L, meta.svc, meta.svcIdx, meta.name || cname, phone, m.from);
    if (!c.st) return say(c.chat, X[L].hint, { reply_markup: menuKb(L) });
    meta.reg = { name: cname, phone }; await saveUser(c.st, m.from, L, meta.reg).catch(e => console.error('saveUser:', e.message));
    if (meta.step === 'confirm') { /* tasdiq kartasi yangilanadi */ await c.save(); return say(c.chat, confirmCard(L, meta), { reply_markup: confirmKb(L) }); }
    clearStep(meta); await c.save();
    return sayFx(c.chat, X[L].regDone.replace('{name}', esc(cname)), { reply_markup: menuKb(L) });
  }

  const mn = findMenu(text);
  if (mn) { meta.lang = mn.L; clearStep(meta); await c.save(); return menuAction(c, mn.L, mn.k); }

  if (active && text && meta.step !== 'confirm') {
    if (meta.step === 'name') {
      const name = clean(text, 60);
      if (name.length < 2 || /^\//.test(name)) return say(c.chat, `${X[L].badName}\n\n${X[L].askName}`, { reply_markup: stepKb(L) });
      meta.name = name; meta.step = 'phone'; await c.save();
      return say(c.chat, `${head(L, 3)}\n🩺 <b>${esc(meta.svc)}</b> ✓\n👤 <b>${esc(name)}</b> ✓\n\n${X[L].askPhone}`, { reply_markup: stepKb(L) });
    }
    const phone = normPhone(text);
    if (!phone) return say(c.chat, `${X[L].badPhone}\n\n${X[L].askPhone}`, { reply_markup: stepKb(L) });
    return finish(c, L, meta.svc, meta.svcIdx, meta.name, phone, m.from);
  }

  // zaxira rejim: savolga javob (reply) orqali
  const rp = parseReply(m);
  if (rp && text) {
    const RL = rp.L;
    if (rp.step === 'name') {
      const name = clean(text, 60);
      if (name.length < 2 || /^\//.test(name)) return say(c.chat, `${X[RL].badName}\n\n${namePrompt(RL, esc(rp.service))}`, force(X[RL].askNameShort.replace(':', '')));
      return say(c.chat, phonePrompt(RL, esc(rp.service), esc(name)), force('+998 90 123 45 67'));
    }
    const phone = normPhone(text);
    if (!phone) return say(c.chat, phonePrompt(RL, esc(rp.service), esc(rp.name), X[RL].badPhone), force('+998 90 123 45 67'));
    return finish(c, RL, rp.service, -1, rp.name, phone, m.from);
  }

  return say(c.chat, X[L].hint, { reply_markup: menuKb(L) });
}

export default async (req) => {
  const R = (body, status) => new Response(body, { status: status || 200 });
  if (req.method !== 'POST') return R('Orlent Medical bot');
  const sec = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (sec && (req.headers.get('x-telegram-bot-api-secret-token') || '') !== sec) return R('unauthorized', 401);
  let u; try { u = await req.json(); } catch (e) { return R('bad json', 400); }
  const t0 = Date.now(); let st = null, outcome = 'ok';
  try {
    const chat = u.message ? u.message.chat.id : (u.callback_query && u.callback_query.message && u.callback_query.message.chat.id);
    if (!chat) return R('ok');
    st = await openStore();
    if (st && u.update_id && !(await st.once('uq:' + u.update_id))) { outcome = 'dup'; await logEvent(st, u, outcome, t0); return R('dup'); } // aynan shu update allaqachon qayta ishlangan
    GUARD = { st };
    const meta = (st && await st.get('c:' + chat)) || {};
    const c = { st, chat, meta, save: async () => { if (st) await st.set('c:' + chat, meta); } };
    const who = (u.message && u.message.from) || (u.callback_query && u.callback_query.from);
    if (st && meta.reg && who && !(await st.get('usr:' + who.id))) await saveUser(st, who, meta.lang, meta.reg).catch(() => {}); // eski ro'yxatdan o'tganlarni yangi bazaga ko'chirish
    if (u.callback_query) await onCallback(u.callback_query, c);
    else if (u.message) await onMessage(u.message, c);
  } catch (e) { outcome = 'error: ' + e.message; console.error('bot error:', e.message); }
  finally { GUARD = null; }
  await logEvent(st, u, outcome, t0);
  return R('ok');
};

// Diagnostika jurnali (oxirgi 60 hodisa): setup?key=...&log=1 orqali ko'rinadi
async function logEvent(st, u, outcome, t0) {
  if (!st) return;
  try {
    const msg = u.message || (u.callback_query && u.callback_query.message) || {};
    const e = { t: new Date().toISOString().slice(11, 19), id: u.update_id, chat: msg.chat && msg.chat.id, what: u.callback_query ? 'cb:' + (u.callback_query.data || '') : (u.message && (u.message.text || (u.message.contact ? '[contact]' : '[other]'))), ms: Date.now() - t0, outcome };
    const log = (await st.get('log')) || [];
    log.push(e); await st.set('log', log.slice(-60));
  } catch (err) { /* jurnal ixtiyoriy */ }
}
