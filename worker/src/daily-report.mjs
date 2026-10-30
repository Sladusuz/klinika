// Har kuni soat 20:00 (Toshkent, UTC+5 = 15:00 UTC) kunlik hisobot yuboradi (Cloudflare cron: wrangler.toml)
import { openStore } from './lib/state.mjs';
import { sendReport, cleanup } from './lib/report.mjs';
import { loadAdmins } from './lib/admins.mjs';

export default async () => {
  const st = await openStore();
  if (!st) { console.error("daily-report: xotira (D1) ulanmagan"); return new Response('no store', { status: 500 }); }
  await loadAdmins(st);
  await sendReport(st, null, true);
  const n = await cleanup(st);
  console.log('daily-report yuborildi; tozalangan kalitlar:', n);
  return new Response('ok');
};
