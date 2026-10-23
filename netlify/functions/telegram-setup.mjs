// Bir martalik sozlash: https://<sayt>/.netlify/functions/telegram-setup?key=<TELEGRAM_WEBHOOK_SECRET>
// Webhook'ni ulaydi, bot nomi/tavsifi va buyruqlarni o'rnatadi.
import tg from './lib/tg.js';
import { openStore, why } from './lib/state.mjs';
import { sendReport, cleanup } from './lib/report.mjs';
import { loadAdmins } from './lib/admins.mjs';
const { call, admins } = tg;

export default async (req) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const out = (code, body) => new Response(JSON.stringify(body, null, 2), { status: code, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  if (!process.env.TELEGRAM_BOT_TOKEN || !secret) return out(500, { ok: false, error: 'TELEGRAM_BOT_TOKEN va TELEGRAM_WEBHOOK_SECRET sozlanmagan' });
  const url0 = new URL(req.url);
  if (url0.searchParams.get('key') !== secret) return out(401, { ok: false, error: 'key noto\'g\'ri' });

  const q = url0.searchParams;
  { const st1 = await openStore(); await loadAdmins(st1); }
  if (q.get('log') || q.get('report')) { // diagnostika: oxirgi hodisalar yoki hisobotni hozir yuborish
    const st0 = await openStore(); if (!st0) return out(500, { ok: false, error: 'xotira yo\'q: ' + why() });
    if (q.get('report')) { const r = await sendReport(st0, null, true); return out(200, { ok: true, sent: true, leads: r.leads.length, users: r.users.length }); }
    const bk = (await st0.list('b:')).sort().slice(-5);
    return out(200, { ok: true, log: (await st0.get('log')) || [], broadcasts: await Promise.all(bk.map(k => st0.get(k))) });
  }
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url0.host;
  const url = `https://${host}/.netlify/functions/telegram-webhook`;
  const res = {};
  const step = async (k, fn) => { try { res[k] = await fn(); } catch (e) { res[k] = 'XATO: ' + e.message; } };

  await step('webhook', () => call('setWebhook', { url, secret_token: secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true }));
  await step('name', async () => { const n = await call('getMyName'); if (n && n.name === 'Orlent Medical') return 'allaqachon to\'g\'ri'; return call('setMyName', { name: 'Orlent Medical' }); });
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
  await step('adminCommands', async () => {
    for (const chat_id of admins()) await call('setMyCommands', { scope: { type: 'chat', chat_id: Number(chat_id) }, commands: [{ command: 'panel', description: '⚙️ Boshqaruv paneli' }, { command: 'send', description: '📢 Hammaga xabar yuborish' }, { command: 'stats', description: '📊 Bugungi hisobot' }, { command: 'users', description: '👥 Ro\'yxatdan o\'tganlar (CSV)' }, { command: 'admins', description: '👮 Adminlar' }, { command: 'start', description: 'Menyu' }, { command: 'profile', description: 'Profil' }, { command: 'id', description: 'Chat ID' }] });
    for (const chat_id of admins()) await tg.setAdminMenu(chat_id, true);
    return admins().length ? 'ok' : 'admin yo\'q';
  });
  await step('menuButton', () => call('setChatMenuButton', { menu_button: { type: 'web_app', text: '🌐 Sayt', web_app: { url: process.env.SITE_URL || `https://${host}` } } }));
  await step('store', async () => {
    const st = await openStore();
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
