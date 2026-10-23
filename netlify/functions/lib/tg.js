// Telegram yordamchi funksiyalari (bot token faqat Netlify muhit o'zgaruvchisida saqlanadi)
const SITE = () => process.env.SITE_URL || 'https://orlentmedi.netlify.app';
const token = () => process.env.TELEGRAM_BOT_TOKEN;

async function call(method, payload) {
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload || {})
  });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error(`${method}: ${j.description || r.status}`);
  return j.result;
}

const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const admins = () => (process.env.ADMIN_CHAT_ID || '').split(',').map(s => s.trim()).filter(Boolean);

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
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date());
}

// Klinika xodimlariga boradigan zayavka matni (doim o'zbekcha)
function leadText(l) {
  const lines = [
    '🆕 <b>Yangi zayavka</b>',
    '',
    `👤 <b>Ism:</b> ${esc(l.name)}`,
    `📞 <b>Telefon:</b> ${esc(l.phone)}`,
    `🩺 <b>Xizmat:</b> ${esc(l.service)}`
  ];
  if (l.note) lines.push(`💬 <b>Izoh:</b> ${esc(l.note)}`);
  lines.push('', `🌐 <b>Manba:</b> ${l.source === 'bot' ? 'Telegram bot' : 'Sayt'}${l.lang ? ' · ' + esc(String(l.lang).toUpperCase()) : ''}`);
  if (l.user && l.user.id) {
    const label = l.user.username ? '@' + esc(l.user.username) : esc(l.user.first_name || 'Mijoz');
    lines.push(`🔗 <b>Telegram:</b> <a href="tg://user?id=${l.user.id}">${label}</a>`);
  }
  lines.push(`🕒 ${tashkentTime()}`);
  return lines.join('\n');
}

async function notifyAdmins(l) {
  const ids = admins();
  if (!ids.length) throw new Error('ADMIN_CHAT_ID sozlanmagan');
  const markup = { inline_keyboard: [[{ text: '✅ Qabul qilindi', callback_data: 'done' }]] };
  const res = await Promise.allSettled(ids.map(chat_id =>
    call('sendMessage', { chat_id, text: leadText(l), parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: markup })));
  if (!res.some(r => r.status === 'fulfilled')) throw new Error(res[0].reason && res[0].reason.message || 'send failed');
}

module.exports = { SITE, call, esc, admins, normPhone, clean, SERVICES, leadText, notifyAdmins };
