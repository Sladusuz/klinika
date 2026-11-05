// /uzi/, /lor/, /bolalar-lor/ sahifalarini (4 tilda) yaratadi
import { PAGES, UI, NAV } from './inner-data.mjs';
const ESC = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const LOC = { uz: 'uz_UZ', ru: 'ru_RU', kk: 'kk_KZ', en: 'en_US' };

export function innerPages(ctx, writePage) {
  const { I, PD, PI, CL, PATH, SITE, OGIMG, analyticsTag } = ctx;
  const langs = Object.keys(PATH);
  const urlOf = (L, slug) => SITE + (PATH[L] === '/' ? '/' : PATH[L]) + slug + '/';
  const pathOf = (L, slug) => (PATH[L] === '/' ? '/' : PATH[L]) + slug + '/';
  const out = [];

  for (const key of Object.keys(PAGES)) {
    const pg = PAGES[key];
    for (const L of langs) {
      const T = pg[L], ui = UI[L], t = I[L], P = PI[L];
      const home = PATH[L], url = urlOf(L, pg.slug);
      const tab = PD.find(x => x.id === pg.tab);
      const svc = pg.svc.map(i => t.sv[i]);
      const priceRows = grp => grp.items.map(it => `<li class="ip-row"><span>${ESC(P.n[it[0]])}</span><i></i><b>${it[1] == null ? `<em>${ESC(P.ask)}</em>` : `${fmt(it[1])}${it[2] ? `<u>${ESC(it[2])}</u>` : ''}<small>${ESC(P.cur)}</small>`}</b></li>`).join('');
      const prices = tab.groups.map(g => `${g.g ? `<h3 class="ip-g">${ESC(P.groups[g.g])}</h3>` : ''}<ul class="ip-list">${priceRows(g)}</ul>`).join('') + (pg.tab === 'lor' ? `<p class="ip-note"><b>+20%</b> ${ESC(ui.nonres)}</p>` : '');
      const tg = `https://t.me/${CL.telegram}`, wa = `https://wa.me/${CL.whatsapp}?text=${encodeURIComponent(t.wa_msg)}`;
      const others = Object.keys(PAGES).filter(k => k !== key).map(k => `<a class="ip-chip" href="${pathOf(L, PAGES[k].slug)}">${ESC(NAV[k][L])}</a>`).join('');
      const ld = [
        { '@context': 'https://schema.org', '@type': 'MedicalWebPage', '@id': url + '#page', url, name: T.title, description: T.desc, inLanguage: L, isPartOf: { '@type': 'WebSite', url: SITE + '/', name: 'Orlent Medical' }, about: { '@id': SITE + '/#clinic' }, publisher: { '@id': SITE + '/#clinic' } },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: ui.home, item: SITE + (home === '/' ? '/' : home) }, { '@type': 'ListItem', position: 2, name: T.h1, item: url }] },
        { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: T.faq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) },
        { '@context': 'https://schema.org', '@type': 'MedicalClinic', '@id': SITE + '/#clinic', name: 'Orlent Medical', url: SITE + '/', telephone: '+998946476479', address: { '@type': 'PostalAddress', streetAddress: "Sayram ko'chasi, 43", addressLocality: 'Toshkent', addressRegion: "Mirzo Ulug'bek tumani", postalCode: CL.postalCode, addressCountry: 'UZ' }, geo: { '@type': 'GeoCoordinates', latitude: CL.geo.lat, longitude: CL.geo.lng }, hasMap: CL.maps.google }
      ].map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
      const alts = langs.map(l => `<link rel="alternate" hreflang="${l}" href="${urlOf(l, pg.slug)}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${urlOf('uz', pg.slug)}">`;
      const html = `<!doctype html>
<html lang="${L}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${ESC(T.title)}</title>
<meta name="description" content="${ESC(T.desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}">
${alts}
<meta name="theme-color" content="#050f22">
<meta property="og:type" content="website"><meta property="og:site_name" content="Orlent Medical"><meta property="og:title" content="${ESC(T.title)}"><meta property="og:description" content="${ESC(T.desc)}"><meta property="og:url" content="${url}"><meta property="og:locale" content="${LOC[L]}"><meta property="og:image" content="${OGIMG}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/assets/favicon.png" type="image/png"><link rel="apple-touch-icon" href="/assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/inner.css?v=${ctx.V}">
${ld}
</head>
<body>
<header class="ip-hdr"><div class="ip-wrap ip-nav">
 <a class="ip-brand" href="${home}" aria-label="Orlent Medical"><img src="/assets/logo-transparent.png" alt="Orlent Medical" width="46" height="46"></a>
 <nav class="ip-menu" aria-label="Main">${Object.keys(PAGES).map(k => `<a href="${pathOf(L, PAGES[k].slug)}"${k === key ? ' aria-current="page"' : ''}>${ESC(NAV[k][L])}</a>`).join('')}<a href="${home}#contact">${ESC(ui.contact)}</a></nav>
 <div class="ip-right"><div class="ip-lang" aria-label="Language">${langs.map(l => `<a href="${pathOf(l, pg.slug)}" hreflang="${l}"${l === L ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('')}</div><a class="ip-tel" href="tel:${CL.phone}">${ESC(CL.phoneView)}</a></div>
</div></header>
<main class="ip-wrap">
 <nav class="ip-bc" aria-label="Breadcrumb"><a href="${home}">${ESC(ui.home)}</a><span>/</span><span>${ESC(NAV[key][L])}</span></nav>
 <section class="ip-hero">
  <h1>${ESC(T.h1)}</h1>
  ${T.lead.map(p => `<p class="ip-lead">${ESC(p)}</p>`).join('')}
  <div class="ip-cta"><a class="ip-btn ip-p" href="${home}#contact">${ESC(ui.book)}</a><a class="ip-btn" href="tel:${CL.phone}">${ESC(ui.call)}</a><a class="ip-btn ip-wa" href="${ESC(wa)}" target="_blank" rel="noopener">WhatsApp</a><a class="ip-btn ip-tg" href="${tg}" target="_blank" rel="noopener">Telegram</a></div>
 </section>
 <section class="ip-sec"><h2>${ESC(ui.services)}</h2><div class="ip-grid">${svc.map(x => `<article class="ip-card"><h3>${ESC(x[1])}</h3><p>${ESC(x[2])}</p></article>`).join('')}</div></section>
 <section class="ip-sec" id="prices"><h2>${ESC(ui.prices)}</h2>${prices}<p class="ip-small">${ESC(ui.note)}</p></section>
 <section class="ip-sec"><h2>${ESC(ui.doctors)}</h2><div class="ip-docs">${t.dr.map(d => `<article class="ip-doc"><img src="${ESC(d[3])}" alt="${ESC(d[0] + ' — ' + d[1])}" loading="lazy" width="800" height="880"><div><h3>${ESC(d[0])}</h3><p class="ip-role">${ESC(d[1])}</p><p>${ESC(d[2])}</p><ul class="ip-chips">${d[4].map(c => `<li><b>${ESC(c[0])}</b> ${ESC(c[1])}</li>`).join('')}</ul></div></article>`).join('')}</div></section>
 <section class="ip-sec"><h2>${ESC(ui.faq)}</h2>${T.faq.map(q => `<details class="ip-faq"><summary>${ESC(q[0])}</summary><p>${ESC(q[1])}</p></details>`).join('')}</section>
 <section class="ip-sec ip-contact" id="contact"><h2>${ESC(ui.contact)}</h2>
  <p><b>Orlent Medical</b> — ${ESC(ui.addr)}</p>
  <p>${ESC(ui.hours)} · <a href="tel:${CL.phone}">${ESC(CL.phoneView)}</a></p>
  <p class="ip-links"><a href="https://www.google.com/maps/dir/?api=1&destination=${CL.geo.lat},${CL.geo.lng}" target="_blank" rel="noopener">${ESC(ui.route)}</a><a href="${CL.maps.google}" target="_blank" rel="noopener">Google Maps</a><a href="${CL.maps.yandex}" target="_blank" rel="noopener">Yandex Maps</a></p>
  <iframe class="ip-map" title="Orlent Medical" src="${CL.maps.embed}" width="100%" height="320" style="border:0;border-radius:14px" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
 </section>
 <section class="ip-sec"><h2>${ESC(ui.also)}</h2><div class="ip-chips2">${others}<a class="ip-chip" href="${home}">${ESC(ui.home)}</a></div></section>
</main>
<footer class="ip-foot"><div class="ip-wrap"><span>© 2026 Orlent Medical — ${ESC(ui.addr)}</span></div></footer>
<script src="/assets/config.js"></script><script src="/assets/analytics.js"></script>
</body>
</html>`;
      writePage(pathOf(L, pg.slug), html);
      out.push({ key, L, url });
    }
  }
  return out;
}
