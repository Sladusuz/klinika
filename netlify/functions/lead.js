// Saytdagi formadan zayavka qabul qilish: POST /.netlify/functions/lead
const { notifyAdmins, normPhone, clean, SERVICES } = require('./lib/tg');

const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'method' });
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.ADMIN_CHAT_ID) return json(503, { ok: false, error: 'not_configured' });

  // boshqa saytlardan kelgan so'rovlarni rad etish
  const origin = event.headers.origin || event.headers.Origin;
  if (origin) {
    let host = ''; try { host = new URL(origin).host; } catch (e) {}
    const own = event.headers.host || event.headers.Host;
    if (host && host !== own && !/^localhost(:\d+)?$/.test(host)) return json(403, { ok: false, error: 'origin' });
  }

  let b; try { b = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { ok: false, error: 'json' }); }
  if (b.website) return json(200, { ok: true }); // honeypot: botlar to'ldiradi, jim qabul qilamiz

  const name = clean(b.name, 60), note = clean(b.note, 500), phone = normPhone(b.phone);
  const lang = ['uz', 'ru', 'en'].includes(b.lang) ? b.lang : 'uz';
  if (name.length < 2) return json(422, { ok: false, error: 'name' });
  if (!phone) return json(422, { ok: false, error: 'phone' });
  const idx = Number.isInteger(b.serviceIdx) ? b.serviceIdx : -1;
  const service = SERVICES.uz[idx] || clean(b.service, 60) || SERVICES.uz[0]; // xodimlar doim o'zbekcha ko'radi

  try {
    await notifyAdmins({ name, phone, service, note, lang, source: 'site' });
    return json(200, { ok: true });
  } catch (e) {
    console.error('lead error:', e.message);
    return json(502, { ok: false, error: 'telegram' });
  }
};
