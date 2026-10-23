// Netlify "background" funksiyasi (15 daqiqagacha ishlaydi): ko'p foydalanuvchiga xabar yuborish
import { openStore } from './lib/state.mjs';
import { loadAdmins } from './lib/admins.mjs';
import { runBroadcast } from './lib/broadcast.mjs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('no', { status: 405 });
  if ((req.headers.get('x-bot-secret') || '') !== (process.env.TELEGRAM_WEBHOOK_SECRET || '')) return new Response('unauthorized', { status: 401 });
  let b; try { b = await req.json(); } catch (e) { return new Response('bad json', { status: 400 }); }
  const st = await openStore();
  if (!st || !b.chat || !b.mid) return new Response('bad request', { status: 400 });
  await loadAdmins(st);
  try { const r = await runBroadcast(st, b.chat, b.mid); console.log('broadcast:', JSON.stringify(r)); } catch (e) { console.error('broadcast error:', e.message); }
  return new Response('done');
};
