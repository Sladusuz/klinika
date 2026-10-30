// Orlent Medical — Cloudflare Worker: Telegram bot, sayt formasi, admin panel API, kunlik hisobot.
// Marshrutlar: /api/lead, /api/telegram-webhook, /api/telegram-setup, /api/admin-api, /api/broadcast-background
import lead from './lead.mjs';
import webhook from './telegram-webhook.mjs';
import setup from './telegram-setup.mjs';
import adminApi from './admin-api.mjs';
import broadcastBg from './broadcast-background.mjs';
import dailyReport from './daily-report.mjs';
import { openStore } from './lib/state.mjs';
import { loadAdmins } from './lib/admins.mjs';
import { resumeJobs } from './lib/broadcast.mjs';

const ROUTES = { lead, 'telegram-webhook': webhook, 'telegram-setup': setup, 'admin-api': adminApi, 'broadcast-background': broadcastBg };

const allowedOrigin = (req) => {
  const o = req.headers.get('origin'); if (!o) return '';
  const list = (globalThis.__ENV_ALLOWED || '').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
  return list.includes(o) || /^https?:\/\/localhost(:\d+)?$/.test(o) ? o : '';
};
const withCors = (res, origin) => {
  if (!origin) return res;
  const h = new Headers(res.headers);
  h.set('Access-Control-Allow-Origin', origin); h.set('Vary', 'Origin');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
};

function boot(env, ctx, url) {
  globalThis.__DB = env.DB; globalThis.__CTX = ctx; globalThis.__ORIGIN = url ? url.origin : globalThis.__ORIGIN;
  globalThis.__ENV_ALLOWED = env.ALLOWED_ORIGINS || env.SITE_URL || '';
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    boot(env, ctx, url);
    const m = /^\/api\/([a-z-]+)\/?$/.exec(url.pathname);
    const origin = allowedOrigin(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type, x-tg-init-data', 'Access-Control-Max-Age': '86400', Vary: 'Origin' } : {} });
    }
    const fn = m && ROUTES[m[1]];
    if (!fn) return new Response(JSON.stringify({ ok: true, service: 'Orlent Medical API' }), { status: m ? 404 : 200, headers: { 'content-type': 'application/json' } });
    try { return withCors(await fn(req), origin); }
    catch (e) { console.error('route error:', m[1], e && e.message); return withCors(new Response(JSON.stringify({ ok: false, error: 'server' }), { status: 500, headers: { 'content-type': 'application/json' } }), origin); }
  },

  // Cron: "0 15 * * *" — kunlik hisobot (20:00 Toshkent); "* * * * *" — tugamagan xabar yuborish ishlarini davom ettirish
  async scheduled(event, env, ctx) {
    boot(env, ctx, null);
    if (event.cron === '0 15 * * *') { await dailyReport(); return; }
    const st = await openStore(); if (!st) return;
    await loadAdmins(st);
    await resumeJobs(st);
  }
};
