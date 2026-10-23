// Bir martalik sozlash: https://<sayt>/.netlify/functions/telegram-setup?key=<TELEGRAM_WEBHOOK_SECRET>
// Webhook'ni ulaydi, bot nomi/tavsifi va buyruqlarni o'rnatadi.
const { call, admins } = require('./lib/tg');

exports.handler = async (event) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const out = (code, body) => ({ statusCode: code, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(body, null, 2) });
  if (!process.env.TELEGRAM_BOT_TOKEN || !secret) return out(500, { ok: false, error: 'TELEGRAM_BOT_TOKEN va TELEGRAM_WEBHOOK_SECRET sozlanmagan' });
  if ((event.queryStringParameters || {}).key !== secret) return out(401, { ok: false, error: 'key noto\'g\'ri' });

  const host = event.headers['x-forwarded-host'] || event.headers.host;
  const url = `https://${host}/.netlify/functions/telegram-webhook`;
  const res = {};
  const step = async (k, fn) => { try { res[k] = await fn(); } catch (e) { res[k] = 'XATO: ' + e.message; } };

  await step('webhook', () => call('setWebhook', { url, secret_token: secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true }));
  await step('name', () => call('setMyName', { name: 'Orlent Medical' }));
  await step('description', async () => {
    await call('setMyDescription', { description: "Orlent Medical — LOR markazi va UTT diagnostikasi. Qabulga yozilish uchun /start ni bosing." });
    await call('setMyDescription', { language_code: 'ru', description: 'Orlent Medical — ЛОР-центр и УЗИ-диагностика. Нажмите /start, чтобы записаться на приём.' });
    await call('setMyDescription', { language_code: 'en', description: 'Orlent Medical — ENT center & ultrasound diagnostics. Press /start to book an appointment.' });
    await call('setMyShortDescription', { short_description: "LOR markazi va UTT diagnostikasi · Zayavka qoldiring" });
    await call('setMyShortDescription', { language_code: 'ru', short_description: 'ЛОР-центр и УЗИ · Оставьте заявку' });
    await call('setMyShortDescription', { language_code: 'en', short_description: 'ENT & ultrasound center · Book online' });
    return 'ok';
  });
  await step('commands', async () => {
    await call('setMyCommands', { commands: [{ command: 'start', description: 'Boshlash / Zayavka qoldirish' }, { command: 'lang', description: 'Tilni o\'zgartirish' }, { command: 'id', description: 'Chat ID' }] });
    await call('setMyCommands', { language_code: 'ru', commands: [{ command: 'start', description: 'Начать / Оставить заявку' }, { command: 'lang', description: 'Сменить язык' }, { command: 'id', description: 'Chat ID' }] });
    await call('setMyCommands', { language_code: 'en', commands: [{ command: 'start', description: 'Start / Book appointment' }, { command: 'lang', description: 'Change language' }, { command: 'id', description: 'Chat ID' }] });
    return 'ok';
  });
  await step('me', async () => { const m = await call('getMe'); return '@' + m.username; });
  const info = await call('getWebhookInfo').catch(() => ({}));
  return out(200, { ok: true, webhookUrl: url, result: res, adminChatConfigured: admins().length > 0, pendingErrors: info.last_error_message || null,
    next: admins().length ? 'Tayyor! Botga /start yuboring va sayt formasini sinab ko\'ring.' : 'ADMIN_CHAT_ID hali yo\'q: botga /id yuboring, kelgan raqamni Netlify muhit o\'zgaruvchisiga yozing.' });
};
