// Ko'p foydalanuvchiga xabar yuborish ishining keyingi bo'lagini ishga tushiradi (o'zini-o'zi chaqirish uchun)
import { openStore } from './lib/state.mjs';
import { loadAdmins } from './lib/admins.mjs';
import { createJob, processJob, kick } from './lib/broadcast.mjs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('no', { status: 405 });
  if ((req.headers.get('x-bot-secret') || '') !== (process.env.TELEGRAM_WEBHOOK_SECRET || '')) return new Response('unauthorized', { status: 401 });
  let b; try { b = await req.json(); } catch (e) { return new Response('bad json', { status: 400 }); }
  const st = await openStore();
  if (!st) return new Response('no store', { status: 503 });
  await loadAdmins(st);
  let id = b.job;
  if (!id) {
    if (!b.chat || !(b.mid || b.text)) return new Response('bad request', { status: 400 });
    id = (await createJob(st, b.chat, b.text ? { text: String(b.text).slice(0, 4000), btn: b.btn } : { mid: b.mid })).id;
  }
  kick(processJob(st, id));
  return new Response('accepted', { status: 202 });
};
