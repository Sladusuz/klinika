// Har kuni soat 20:00 (Toshkent, UTC+5 = 15:00 UTC) kunlik hisobot yuboradi.
import { openStore } from './lib/state.mjs';
import { sendReport, cleanup } from './lib/report.mjs';

export default async () => {
  const st = await openStore();
  if (!st) { console.error('daily-report: xotira (Blobs) ulanmagan'); return new Response('no store', { status: 500 }); }
  await sendReport(st, null, true);
  const n = await cleanup(st);
  console.log('daily-report yuborildi; tozalangan kalitlar:', n);
  return new Response('ok');
};

export const config = { schedule: '0 15 * * *' };
