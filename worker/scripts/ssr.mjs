// Bosh sahifa HTML'iga matnni to'g'ridan-to'g'ri yozadi (prerender): sarlavhalar, matnlar, ro'yxatlar HTML'da bo'ladi,
// JavaScript esa faqat animatsiya qiladi (va ro'yxatlarni o'zi qayta chizadi).
const ESC = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ANCH = ['#services', '#doctors', '#prices', '#reviews', '#faq', '#contact'];
const ALT = {
  uz: { logo: 'Orlent Medical logotipi', room: "Orlent Medical klinikasi — LOR shifokor xonasi, Toshkent", lb: 'Orlent Medical klinikasidan lavha' },
  ru: { logo: 'Логотип Orlent Medical', room: 'Клиника Orlent Medical — кабинет ЛОР-врача, Ташкент', lb: 'Фото клиники Orlent Medical' },
  kk: { logo: 'Orlent Medical логотипі', room: 'Orlent Medical клиникасы — ЛОР дәрігер кабинеті, Ташкент', lb: 'Orlent Medical клиникасынан көрініс' },
  en: { logo: 'Orlent Medical logo', room: 'Orlent Medical clinic — ENT doctor room, Tashkent', lb: 'Inside the Orlent Medical clinic' }
};

export function ssr(html, L, ctx) {
  const { I, PD, PI, CL, PATH } = ctx, t = I[L];
  let h = html;

  // 1) data-t="kalit" bo'sh elementlarni to'ldirish
  h = h.replace(/<(\w+)((?:\s[^>]*?)?\sdata-t="([A-Za-z0-9_]+)"[^>]*)><\/\1>/g, (m, tag, attrs, key) => typeof t[key] === 'string' ? `<${tag}${attrs}>${ESC(t[key])}</${tag}>` : m);

  // 2) menyu havolalari
  ANCH.forEach((a, i) => { h = h.split(`<a href="${a}"></a>`).join(`<a href="${a}">${ESC(t.nav[i])}</a>`); h = h.split(`<a class="l" href="${a}"></a>`).join(`<a class="l" href="${a}">${ESC(t.nav[i])}</a>`); });

  // 3) aloqa havolalari (telefon, Telegram, WhatsApp) — href va matn
  const tel = 'tel:' + CL.phone, wa = `https://wa.me/${CL.whatsapp}?text=${encodeURIComponent(t.wa_msg)}`;
  h = h.replace(/<a ((?:class="[^"]*" )?)data-ph/g, `<a $1href="${tel}" data-ph`);
  h = h.replace(/(<a [^>]*data-ph[^>]*>(?:(?!<\/a>)[\s\S])*?<span>)(<\/span>)/g, `$1${ESC(CL.phoneView)}$2`);
  h = h.replace(/<a ((?:class="[^"]*" )?)data-tg/g, `<a $1href="https://t.me/${CL.telegram}" data-tg`);
  h = h.replace(/<a ((?:class="[^"]*" )?)data-wa/g, `<a $1href="${ESC(wa)}" data-wa`);
  h = h.replace(/(<a [^>]*data-wa[^>]*>(?:(?!<\/a>)[\s\S])*?<span>)(<\/span>)/g, `$1${ESC(CL.phoneView)}$2`);

  // 4) ro'yxat konteynerlari
  const set = (id, inner) => { h = h.replace(new RegExp(`(<(\\w+)[^>]*\\bid="${id}"[^>]*>)(</\\2>)`), (m, open, tag, close) => open + inner + close); };
  set('hm', t.hm.map(x => `<li>${ESC(x)}</li>`).join(''));
  set('sv', t.sv.map(x => `<article class="svc"><h3>${ESC(x[1])}</h3><p>${ESC(x[2])}</p></article>`).join(''));
  set('stats', t.stats.map(x => `<div class="stat"><b>${ESC(x[0])}</b><span>${ESC(x[1])}</span></div>`).join(''));
  set('wy', t.wy.map(x => `<div class="card"><h3>${ESC(x[1])}</h3><p>${ESC(x[2])}</p></div>`).join(''));
  set('dr', t.dr.map(d => `<article class="card doc"><div class="ph"><img src="${ESC(d[3])}" alt="${ESC(d[0] + ' — ' + d[1])}" loading="lazy" width="800" height="880"></div><div class="bd"><h3>${ESC(d[0])}</h3><small>${ESC(d[1])}</small><p>${ESC(d[2])}</p></div></article>`).join(''));
  set('ce', t.ce.map(x => `<div class="card cert"><h3>${ESC(x[1])}</h3></div>`).join(''));
  set('rv', t.rv.map(x => `<article class="card rev"><p>“${ESC(x[0])}”</p><div class="who">${ESC(x[1])}</div></article>`).join(''));
  set('st', t.st.map((x, i) => `<article class="pr-step"><div class="pr-n">0${i + 1}</div><div><h3>${ESC(x[0])}</h3><p>${ESC(x[1])}</p></div></article>`).join(''));
  set('fq', t.fq.map(x => `<details><summary>${ESC(x[0])}</summary><p>${ESC(x[1])}</p></details>`).join(''));
  set('fdh', ESC(t.fd[0][1]));
  set('fnav', t.nav.map((n, i) => `<a href="${ANCH[i]}">${ESC(n)}</a>`).join(''));
  const P = PI[L];
  set('px', PD.map(tb => `<h3>${ESC(P.tabs[tb.id])}</h3><ul>${tb.groups.flatMap(g => g.items).map(it => `<li>${ESC(P.n[it[0]])} — ${it[1] == null ? ESC(P.ask) : String(it[1]).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + ESC(P.cur)}</li>`).join('')}</ul>`).join(''));
  h = h.replace(/(<span class="v" id="ad">)(<\/span>)/, `$1${ESC(CL.address[L] || CL.address.uz)}$2`);

  // 5) rasmlar uchun alt
  const A = ALT[L];
  h = h.replace('<img src="/assets/logo-transparent.png" alt="" width="110"', `<img src="/assets/logo-transparent.png" alt="${ESC(A.logo)}" width="110"`);
  h = h.replace('clinic-room.jpg" alt=""', `clinic-room.jpg" alt="${ESC(A.room)}"`);
  h = h.replace('<img alt="">', `<img alt="${ESC(A.lb)}">`);

  // 6) til almashtirgichdagi havolalar va footer ichki havolalari
  const foot = [['uzi', ctx.NAV.uzi[L]], ['lor', ctx.NAV.lor[L]], ['bolalar-lor', ctx.NAV.kids[L]]];
  const pre = PATH[L] === '/' ? '/' : PATH[L];
  h = h.replace('<div id="fnav"></div>', '<div id="fnav"></div>');
  h = h.replace(/(<div id="fnav">.*?<\/div>)/, `$1<div class="flinks">${foot.map(([s, n]) => `<a href="${pre}${s}/">${ESC(n)}</a>`).join('')}</div>`);
  return h;
}
