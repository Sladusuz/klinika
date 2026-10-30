// Telegram yordamchi funksiyalari (bot token faqat Cloudflare sirlarida (secret) saqlanadi)
const SITE = () => process.env.SITE_URL || 'https://sladusuz.github.io/klinika';
const token = () => process.env.TELEGRAM_BOT_TOKEN;

const STATS = { m: [] }; // diagnostika: joriy hodisada yuborilgan Telegram so'rovlari
async function call(method, payload) {
  STATS.m.push(method + (payload && payload.chat_id ? '>' + String(payload.chat_id).slice(-4) : ''));
  const r = await fetch(`${process.env.TELEGRAM_API || 'https://api.telegram.org'}/bot${token()}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload || {})
  });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error(`${method}: ${j.description || r.status}`);
  return j.result;
}

const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
let EXTRA = [];
const setExtraAdmins = a => { EXTRA = (a || []).map(String); };
const admins = () => [...new Set([...(process.env.ADMIN_CHAT_ID || '').split(',').map(s => s.trim()).filter(Boolean), ...EXTRA])];
const envAdmins = () => (process.env.ADMIN_CHAT_ID || '').split(',').map(s => s.trim()).filter(Boolean);

function normPhone(raw) {
  let d = String(raw || '').replace(/[^\d+]/g, '');
  const digits = d.replace(/\D/g, '');
  if (digits.length === 9) return '+998' + digits;
  if (digits.length === 12 && digits.startsWith('998')) return '+' + digits;
  if (digits.length >= 10 && digits.length <= 13) return '+' + digits;
  return null;
}
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, n);

const SERVICES = {
  uz: ["LOR ko'rik", 'Quloq', 'Burun', 'Tomoq', 'UTT tekshiruvi', 'Bolalar LOR'],
  ru: ['ЛОР-осмотр', 'Ухо', 'Нос', 'Горло', 'УЗИ', 'Детский ЛОР'],
  en: ['ENT exam', 'Ear', 'Nose', 'Throat', 'Ultrasound', 'Pediatric ENT']
};

function tashkentTime() {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date()).replace(',', ' ·');
}
const hm = () => new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' }).format(new Date());
const dayKey = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date());
const newTicket = () => 'OM-' + Date.now().toString(36).slice(-5).toUpperCase();
const EMO = ['🩺', '👂', '👃', '🗣', '📡', '👶'];
const FLAG = { uz: '🇺🇿', ru: '🇷🇺', kk: '🇰🇿', en: '🇬🇧' };
const LINE = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬';

// Klinika xodimlariga boradigan zayavka kartasi (doim o'zbekcha)
function leadText(l) {
  const se = EMO[SERVICES.uz.indexOf(l.service)] || '🩺';
  const lines = [`🆕 <b>YANGI ZAYAVKA</b>   <code>${esc(l.id)}</code>`];
  if (l.n) lines.push(`<i>Bugungi №${l.n}</i>`);
  lines.push('', LINE, `👤 <b>${esc(l.name)}</b>`, `📞 ${esc(l.phone)}`, `${se} ${esc(l.service)}`, LINE);
  if (l.note) lines.push(`<blockquote>💬 ${esc(l.note)}</blockquote>`);
  lines.push(`🌐 ${l.source === 'bot' ? 'Telegram bot' : 'Sayt'}  ·  ${FLAG[l.lang] || ''} ${esc(String(l.lang || 'uz').toUpperCase())}`);
  if (l.user && l.user.id) {
    const label = l.user.username ? '@' + esc(l.user.username) : esc(l.user.first_name || 'Mijoz');
    lines.push(`🔗 <a href="tg://user?id=${l.user.id}">${label}</a>`);
  }
  lines.push(`🕒 ${esc(l.time || tashkentTime())}`, '');
  lines.push(l.status ? `🟢 <b>Holat:</b> Qabul qilindi — ${esc(l.status.by)} · ${esc(l.status.at)}` : '🟡 <b>Holat:</b> Yangi');
  return lines.join('\n');
}

function leadKb(l, opts) {
  const o = opts || {}, rows = [];
  rows.push(l.status ? [{ text: '🔄 Qayta ochish', callback_data: 'reopen:' + l.id }] : [{ text: '✅ Qabul qilindi', callback_data: 'done:' + l.id }]);
  if (o.copy !== false) rows.push([{ text: '📋 Raqamni nusxalash', copy_text: { text: l.phone } }]);
  if (o.write !== false && l.user && l.user.id) rows.push([{ text: '💬 Mijozga yozish', url: 'tg://user?id=' + l.user.id }]);
  if (o.panel !== false) rows.push([panelBtn()]);
  return { inline_keyboard: rows };
}

// store (ixtiyoriy): bugungi raqam va zayavkani saqlaydi, shunda tugma bosilganda xabar yangilanadi
async function notifyAdmins(l, store) {
  const ids = admins();
  if (!ids.length) throw new Error('ADMIN_CHAT_ID sozlanmagan');
  l.id = l.id || newTicket(); l.time = l.time || tashkentTime(); l.msgs = {}; l.day = dayKey(); l.ts = Date.now();
  if (store && !(await store.once('ld:' + l.phone + ':' + l.service + ':' + Math.floor(Date.now() / 120000)))) { l.dup = true; return l; } // bir xil zayavka 2 daqiqa ichida qayta kelsa, ikkinchisi yuborilmaydi
  if (store) { // kunlik indeks: hisobot shundan olinadi
    try { const k = 'd:' + l.day, cur = (await store.get(k)) || { n: 0, ids: [] }; cur.n++; (cur.ids = cur.ids || []).push(l.id); await store.set(k, cur); l.n = cur.n; } catch (e) { /* hisoblagich ixtiyoriy */ }
  }
  const send = async chat_id => {
    const base = { chat_id, text: leadText(l), parse_mode: 'HTML', disable_web_page_preview: true };
    const owner = envAdmins().includes(String(chat_id)); // boshqaruv paneli faqat asosiy admin uchun
    for (const o of [{ panel: owner }, { copy: false, panel: owner }, { copy: false, write: false, panel: false }]) { // eski mijoz/maxfiylik cheklovlarida tugmalarni kamaytirib qayta uriniladi
      try { const r = await call('sendMessage', Object.assign({ reply_markup: leadKb(l, o) }, base)); l.msgs[chat_id] = r && r.message_id; return r; } catch (e) { if (o.write === false) throw e; }
    }
  };
  const res = await Promise.allSettled(ids.map(send));
  if (!res.some(r => r.status === 'fulfilled')) throw new Error(res[0].reason && res[0].reason.message || 'send failed');
  if (store) { try { await store.set('l:' + l.id, l); } catch (e) { /* ixtiyoriy */ } }
  return l;
}

const panelUrl = () => SITE() + '/admin/';
const panelBtn = () => ({ text: '⚙️ Panel', web_app: { url: panelUrl() } });
// admin chatida bot menyusi yonida «⚙️ Panel» tugmasi; admin bo'lmasa — oddiy menyuga qaytaradi
async function setAdminMenu(chat_id, on) {
  try { await call('setChatMenuButton', { chat_id: Number(chat_id), menu_button: on ? { type: 'web_app', text: '⚙️ Panel', web_app: { url: panelUrl() } } : { type: 'default' } }); } catch (e) { /* chat yo'q yoki bot boshlanmagan */ }
}

async function sendDoc(chat_id, filename, content, caption, mime) {
  const fd = new FormData();
  fd.append('chat_id', String(chat_id)); if (caption) { fd.append('caption', caption); fd.append('parse_mode', 'HTML'); }
  fd.append('document', new Blob([content], { type: mime || 'text/csv' }), filename);
  const r = await fetch(`https://api.telegram.org/bot${token()}/sendDocument`, { method: 'POST', body: fd });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error('sendDocument: ' + (j.description || r.status));
  return j.result;
}

module.exports = { panelUrl, panelBtn, setAdminMenu, STATS, setExtraAdmins, envAdmins, sendDoc, EMO, dayKey, tashkentTime, FLAG, SITE, call, esc, admins, normPhone, clean, SERVICES, leadText, leadKb, notifyAdmins, newTicket, hm };
