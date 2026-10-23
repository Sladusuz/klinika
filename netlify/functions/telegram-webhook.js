// Telegram bot webhook: POST /.netlify/functions/telegram-webhook
// Suhbat holati serverda saqlanmaydi: har bir qadam savoli matnida (🩺 Xizmat / 👤 Ism) yashiringan va foydalanuvchi shunga javob beradi.
const { call, esc, admins, normPhone, clean, SERVICES, notifyAdmins, SITE } = require('./lib/tg');
const X = require('./lib/bot-texts');
const LANGS = ['uz', 'ru', 'en'];

const menuKb = L => ({ keyboard: [[{ text: X[L].menu.apply }], [{ text: X[L].menu.addr }, { text: X[L].menu.contact }], [{ text: X[L].menu.site }, { text: X[L].menu.lang }]], resize_keyboard: true, is_persistent: true });
const langKb = () => ({ inline_keyboard: [LANGS.map(l => ({ text: X[l].flag, callback_data: 'lang:' + l }))] });
const say = (chat_id, text, extra) => call('sendMessage', Object.assign({ chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true }, extra || {}));

function findMenu(text) {
  for (const L of LANGS) for (const k of Object.keys(X[L].menu)) if (X[L].menu[k] === text) return { L, k };
  return null;
}
const svcKb = L => {
  const b = SERVICES[L].map((s, i) => ({ text: s, callback_data: `s:${L}:${i}` }));
  const rows = []; for (let i = 0; i < b.length; i += 2) rows.push(b.slice(i, i + 2));
  return { inline_keyboard: rows };
};
const namePrompt = (L, service) => `🩺 ${X[L].svc}: ${service}\n\n👤 ${X[L].askName}`;
const phonePrompt = (L, service, name, err) => `${err ? err + '\n\n' : ''}🩺 ${X[L].svc}: ${service}\n👤 ${X[L].nameLbl}: ${name}\n\n📞 ${X[L].askPhone}`;
const force = ph => ({ reply_markup: { force_reply: true, input_field_placeholder: ph } });

async function sendMenu(chat, L) { return say(chat, X[L].welcome, { reply_markup: menuKb(L) }); }

async function onCallback(q) {
  const data = q.data || '', chat = q.message && q.message.chat.id;
  if (data === 'done') {
    if (!admins().includes(String(chat))) return call('answerCallbackQuery', { callback_query_id: q.id, text: '⛔️' });
    const who = q.from.username ? '@' + q.from.username : q.from.first_name;
    await call('editMessageReplyMarkup', { chat_id: chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [[{ text: `✅ Qabul qilindi — ${who}`, callback_data: 'noop' }]] } });
    return call('answerCallbackQuery', { callback_query_id: q.id, text: '✅' });
  }
  await call('answerCallbackQuery', { callback_query_id: q.id }).catch(() => {});
  if (data.startsWith('lang:')) { const L = data.slice(5); if (X[L]) return sendMenu(chat, L); }
  if (data.startsWith('s:')) {
    const [, L, i] = data.split(':'); const svc = SERVICES[L] && SERVICES[L][+i];
    if (svc) return say(chat, namePrompt(L, esc(svc)), force(X[L].askName.replace(':', '')));
  }
}

function parseReply(m) {
  const r = m.reply_to_message; if (!r || !r.from || !r.from.is_bot || !r.text) return null;
  const lines = r.text.split('\n').filter(s => s.trim());
  for (const L of LANGS) {
    const p = `🩺 ${X[L].svc}: `; const i = lines.findIndex(s => s.startsWith(p));
    if (i < 0) continue;
    const service = lines[i].slice(p.length);
    const nl = lines.find(s => s.startsWith(`👤 ${X[L].nameLbl}: `));
    if (lines.some(s => s.startsWith('📞 '))) return { L, service, name: nl ? nl.slice(`👤 ${X[L].nameLbl}: `.length) : '', step: 'phone' };
    if (lines.some(s => s.startsWith('👤 ' + X[L].askName))) return { L, service, step: 'name' };
  }
  return null;
}

async function onMessage(m) {
  const chat = m.chat.id, text = (m.text || '').trim();
  if (/^\/id(@\w+)?$/i.test(text)) return say(chat, `🆔 Chat ID: <code>${chat}</code>`);
  if (m.chat.type !== 'private') return;
  if (/^\/start/i.test(text) || /^\/lang/i.test(text)) return say(chat, '🌍 Tilni tanlang / Выберите язык / Choose language', { reply_markup: langKb() });

  const rp = parseReply(m);
  if (rp && text) {
    const L = rp.L;
    if (rp.step === 'name') {
      const name = clean(text, 60);
      if (name.length < 2 || /^\//.test(name)) return say(chat, `${X[L].badName}\n\n${namePrompt(L, esc(rp.service))}`, force(X[L].askName.replace(':', '')));
      return say(chat, phonePrompt(L, esc(rp.service), esc(name)), force('+998 90 123 45 67'));
    }
    const phone = normPhone(text);
    if (!phone) return say(chat, phonePrompt(L, esc(rp.service), esc(rp.name), X[L].badPhone), force('+998 90 123 45 67'));
    await notifyAdmins({ name: rp.name, phone, service: rp.service, lang: L, source: 'bot', user: { id: m.from.id, username: m.from.username, first_name: m.from.first_name } });
    return say(chat, X[L].done.replace('{name}', esc(rp.name)), { reply_markup: menuKb(L) });
  }

  const mn = findMenu(text);
  if (!mn) return say(chat, '🌍 Tilni tanlang / Выберите язык / Choose language', { reply_markup: langKb() });
  const { L, k } = mn;
  if (k === 'apply') return say(chat, X[L].pick, { reply_markup: svcKb(L) });
  if (k === 'lang') return say(chat, '🌍 Tilni tanlang / Выберите язык / Choose language', { reply_markup: langKb() });
  if (k === 'addr') return say(chat, X[L].addr, { reply_markup: { inline_keyboard: [[{ text: X[L].route, url: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Sayram 43, Mirzo Ulugbek tumani, Toshkent') }]] } });
  if (k === 'contact') return say(chat, X[L].contact.replace('{phone}', X.PHONE), { reply_markup: { inline_keyboard: [[{ text: X[L].call, url: 'https://t.me/orlentmedical' }], [{ text: '📷 Instagram', url: 'https://instagram.com/orlent_medical' }]] } });
  if (k === 'site') return say(chat, X[L].site, { reply_markup: { inline_keyboard: [[{ text: X[L].open, url: SITE() }]] } });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 200, body: 'Orlent Medical bot' };
  const sec = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (sec && (event.headers['x-telegram-bot-api-secret-token'] || '') !== sec) return { statusCode: 401, body: 'unauthorized' };
  let u; try { u = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: 'bad json' }; }
  try {
    if (u.callback_query) await onCallback(u.callback_query);
    else if (u.message) await onMessage(u.message);
  } catch (e) { console.error('bot error:', e.message); }
  return { statusCode: 200, body: 'ok' }; // Telegram qayta yubormasligi uchun doim 200
};
