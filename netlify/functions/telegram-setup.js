// Bir martalik sozlash: https://<sayt>/.netlify/functions/telegram-setup?key=<TELEGRAM_WEBHOOK_SECRET>
// Webhook'ni ulaydi, bot nomi/tavsifi va buyruqlarni o'rnatadi.
const { call, admins } = require('./lib/tg');
const { openStore, why } = require('./lib/state');

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
    await call('setMyCommands', { commands: [{ command: 'start', description: 'Boshlash / Zayavka qoldirish' }, { command: 'profile', description: 'Profil' }, { command: 'lang', description: 'Tilni o\'zgartirish' }, { command: 'id', description: 'Chat ID' }] });
    await call('setMyCommands', { language_code: 'ru', commands: [{ command: 'start', description: 'Начать / Оставить заявку' }, { command: 'profile', description: 'Профиль' }, { command: 'lang', description: 'Сменить язык' }, { command: 'id', description: 'Chat ID' }] });
    await call('setMyCommands', { language_code: 'en', commands: [{ command: 'start', description: 'Start / Book appointment' }, { command: 'profile', description: 'Profile' }, { command: 'lang', description: 'Change language' }, { command: 'id', description: 'Chat ID' }] });
    return 'ok';
  });
  await step('menuButton', () => call('setChatMenuButton', { menu_button: { type: 'web_app', text: '🌐 Sayt', web_app: { url: process.env.SITE_URL || `https://${host}` } } }));
  await step('store', async () => {
    const st = await openStore(event);
    if (!st) throw new Error('xotira (Blobs) ulanmagan — ' + (why() || 'sabab noma\'lum'));
    await st.set('health', { t: Date.now() });
    const v = await st.get('health');
    return v && v.t ? 'ok' : 'yozish/o\'qish ishlamadi';
  });
  await step('me', async () => { const m = await call('getMe'); return '@' + m.username; });
  const info = await call('getWebhookInfo').catch(() => ({}));
  const failed = Object.values(res).some(v => String(v).startsWith('XATO'));
  const badToken = String(res.me || '').includes('Not Found') || String(res.me || '').includes('Unauthorized');
  return out(failed ? 500 : 200, { ok: !failed, webhookUrl: url, result: res, adminChatConfigured: admins().length > 0, pendingErrors: info.last_error_message || null,
    next: badToken ? "TELEGRAM_BOT_TOKEN noto'g'ri: Netlify'da haqiqiy token yozilganini tekshiring (BotFather bergan '123456:ABC...' ko'rinishidagi qator, bo'sh joysiz), saqlang va qayta deploy qiling." : admins().length ? 'Tayyor! Botga /start yuboring va sayt formasini sinab ko\'ring.' : 'ADMIN_CHAT_ID hali yo\'q: botga /id yuboring, kelgan raqamni Netlify muhit o\'zgaruvchisiga yozing.' });
};
