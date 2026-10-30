# Orlent Medical API (Cloudflare Worker)

Telegram bot, sayt formasi, admin panel API va kunlik hisobot — Netlify o'rniga Cloudflare Workers'da.
Sayt (statik) GitHub Pages'da turadi (`.github/workflows/pages.yml`).

## Sozlash
1. **D1 baza:** Cloudflare → Storage & databases → D1 → Create → `orlent-bot`. `wrangler.toml` dagi `[[d1_databases]]` ga `database_id = "..."` yozing.
2. **Deploy:** Workers & Pages → Create → Import a repository → `Sladusuz/klinika`, Root directory: `worker`.
3. **Sirlar (Settings → Variables and Secrets, turi Secret):** `TELEGRAM_BOT_TOKEN`, `ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`.
4. **O'zgaruvchilar:** `SITE_URL` (saytning manzili), `ALLOWED_ORIGINS` (shu sayt origin'i) — `wrangler.toml` da.
5. **Webhook:** `https://<worker-manzil>/api/telegram-setup?key=<TELEGRAM_WEBHOOK_SECRET>` ni bir marta oching.
6. Saytda `assets/config.js` → `apiBase` ga Worker manzilini yozing (domen `/api/*` ni Worker'ga yo'naltirsa — bo'sh qoldiring).

## Marshrutlar
`/api/lead`, `/api/telegram-webhook`, `/api/telegram-setup`, `/api/admin-api`, `/api/broadcast-background`

## Cron
`0 15 * * *` — kunlik hisobot (20:00 Toshkent). `* * * * *` — tugamagan xabar yuborish ishlarini davom ettiradi.

## Lokal sinov
`.dev.vars` yarating (TELEGRAM_BOT_TOKEN, ADMIN_CHAT_ID, TELEGRAM_WEBHOOK_SECRET), so'ng `npx wrangler dev`.
