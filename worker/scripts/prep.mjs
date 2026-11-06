// Sayt fayllarini worker/public ga yig'adi va SEO sahifalarini yaratadi:
// /  (uz), /ru/, /kk/, /en/ — har biri o'z title/description/hreflang/JSON-LD bilan; sitemap.xml, robots.txt
import { rmSync, mkdirSync, cpSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ssr } from './ssr.mjs';
import { innerPages } from './inner.mjs';
import { PAGES, NAV } from './inner-data.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'worker', 'public');
const SITE = (process.env.PUBLIC_SITE || 'https://orlentmedical.uz').replace(/\/$/, '');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
for (const f of ['404.html', 'admin', 'assets', 'site.webmanifest', 'favicon.ico']) if (existsSync(join(root, f))) cpSync(join(root, f), join(out, f), { recursive: true });

globalThis.window = {}; (0, eval)(readFileSync(join(root, 'assets/content.js'), 'utf8').replace('window.I18N=', 'globalThis.__I=')); const I = globalThis.__I;
(0, eval)(readFileSync(join(root, 'assets/prices.js'), 'utf8')); // window.PRICE_DATA / PRICE_I18N
(0, eval)(readFileSync(join(root, 'assets/config.js'), 'utf8'));
const CL = globalThis.window.CLINIC;
const PD = globalThis.window.PRICE_DATA, PI = globalThis.window.PRICE_I18N;
const tpl = readFileSync(join(root, 'index.html'), 'utf8');
const PATH = { uz: '/', ru: '/ru/', kk: '/kk/', en: '/en/' };
const LOC = { uz: 'uz_UZ', ru: 'ru_RU', kk: 'kk_KZ', en: 'en_US' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const OGIMG = SITE + '/assets/og.jpg';
const GSC = ['JHYKcO52u__elc8h9dWH9N8I4wYquvh3e80uexCVxq4', 'JHYKcO52u__eIc8h9dWH9N8I4wYquvh3e80uexCVxq4', 'JHYKcO52u__elc8h9dWH9N8l4wYquvh3e80uexCVxq4', 'JHYKcO52u__eIc8h9dWH9N8l4wYquvh3e80uexCVxq4'];

function jsonld(L) {
  const t = I[L];
  const GM = CL.maps.google;
  const clinic = {
    '@context': 'https://schema.org', '@type': 'MedicalClinic', '@id': SITE + '/#clinic', name: 'Orlent Medical', alternateName: ['Orlent Medical LOR va UZI markazi', 'ORL-ENT MEDICAL', 'Орлент Медикал'], url: SITE + PATH[L],
    description: t.desc, image: [OGIMG, SITE + '/assets/img/dr-nurshod.jpg'], logo: SITE + '/assets/logo.png', telephone: '+998946476479',
    medicalSpecialty: ['Otolaryngologic', 'Radiography'], availableLanguage: ['uz', 'ru', 'kk', 'en'], isAcceptingNewPatients: true,
    address: { '@type': 'PostalAddress', streetAddress: "Sayram ko'chasi, 43", addressLocality: 'Toshkent', addressRegion: "Mirzo Ulug'bek tumani", postalCode: CL.postalCode, addressCountry: 'UZ' },
    geo: { '@type': 'GeoCoordinates', latitude: CL.geo.lat, longitude: CL.geo.lng },
    areaServed: { '@type': 'City', name: 'Toshkent' }, hasMap: GM,
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }],
    contactPoint: [{ '@type': 'ContactPoint', telephone: '+998946476479', contactType: 'customer service', availableLanguage: ['uz', 'ru', 'kk', 'en'] }],
    availableService: t.sv.map((x, i) => ({ '@type': i === 5 || i === 6 ? 'MedicalTest' : 'MedicalProcedure', name: x[1], description: x[2] })),
    sameAs: [GM, CL.maps.yandex, 'https://instagram.com/' + CL.instagram, 'https://t.me/' + CL.telegram],
    hasOfferCatalog: { '@type': 'OfferCatalog', name: t.pr_h, itemListElement: PD.map(tb => ({ '@type': 'OfferCatalog', name: PI[L].tabs[tb.id], itemListElement: tb.groups.flatMap(g => g.items).filter(it => it[1] != null).map(it => ({ '@type': 'Offer', price: String(it[1]), priceCurrency: 'UZS', itemOffered: { '@type': 'MedicalProcedure', name: PI[L].n[it[0]] } })) })) },
    employee: t.dr.map(d => ({ '@type': 'Physician', name: d[0], jobTitle: d[1], description: d[2], image: SITE + d[3], worksFor: { '@id': SITE + '/#clinic' } }))
  };
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.fq.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) };
  return [clinic, faq].map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
}

function head(L) {
  const t = I[L], url = SITE + PATH[L];
  return [
    `<title>${esc(t.title)}</title>`,
    `<meta name="description" content="${esc(t.desc)}">`,
    `<meta name="robots" content="index,follow,max-image-preview:large">`,
    `<link rel="canonical" href="${url}">`,
    ...Object.keys(PATH).map(l => `<link rel="alternate" hreflang="${l}" href="${SITE + PATH[l]}">`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}/">`,
    `<meta property="og:type" content="website"><meta property="og:site_name" content="Orlent Medical"><meta property="og:title" content="${esc(t.title)}"><meta property="og:description" content="${esc(t.desc)}"><meta property="og:url" content="${url}"><meta property="og:locale" content="${LOC[L]}"><meta property="og:image" content="${OGIMG}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(t.title)}"><meta name="twitter:description" content="${esc(t.desc)}"><meta name="twitter:image" content="${OGIMG}">`,
    `<meta name="geo.region" content="UZ-TK"><meta name="geo.placename" content="Toshkent"><meta name="geo.position" content="${CL.geo.lat};${CL.geo.lng}"><meta name="ICBM" content="${CL.geo.lat}, ${CL.geo.lng}">`,
    ...(L === 'uz' ? GSC.map(c => `<meta name="google-site-verification" content="${c}" />`) : []),
    `<script>window.FORCE_LANG="${L}"</script>`,
    jsonld(L)
  ].join('\n');
}

function noscript(L) { // JS o'chirilgan qidiruv robotlari va foydalanuvchilar uchun asosiy matn
  const t = I[L];
  return `<noscript><main style="max-width:760px;margin:0 auto;padding:24px;font-family:sans-serif;color:#fff;background:#050f22"><h1>Orlent Medical — ${esc(t.h1a)} ${esc(t.h1b)}</h1><p>${esc(t.hp)}</p><h2>${esc(t.sv_h)}</h2><ul>${t.sv.map(x => `<li><b>${esc(x[1])}</b> — ${esc(x[2])}</li>`).join('')}</ul><h2>${esc(t.dr_h)}</h2><ul>${t.dr.map(d => `<li><b>${esc(d[0])}</b> — ${esc(d[1])}. ${esc(d[2])}</li>`).join('')}</ul><h2>${esc(t.ct_h)}</h2><p>${esc(t.l_ad)}: Toshkent, Mirzo Ulug'bek, Sayram 43. ${esc(t.l_ph)}: <a href="tel:+998946476479">+998 94 647 64 79</a></p></main></noscript>`;
}

const V = '20261109d';
const ctx = { I, PD, PI, CL, PATH, SITE, OGIMG, V, NAV };
for (const L of Object.keys(PATH)) {
  const h = ssr(tpl, L, ctx).replace('<!--SEO_HEAD-->', head(L)).replace('<html lang="uz">', `<html lang="${L}">`);
  const dir = L === 'uz' ? out : join(out, L); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), h);
}
const inner = innerPages(ctx, (path, html) => { const d = join(out, path); mkdirSync(d, { recursive: true }); writeFileSync(join(d, 'index.html'), html); });

const today = new Date().toISOString().slice(0, 10);
const urlOf = (L, slug) => SITE + (PATH[L] === '/' ? '/' : PATH[L]) + (slug ? slug + '/' : '');
const entries = [{ slug: '', pr: ['1.0', '0.8'] }, ...Object.values(PAGES).map(pg => ({ slug: pg.slug, pr: ['0.9', '0.7'] }))];
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  entries.flatMap(e => Object.keys(PATH).map(L => `<url><loc>${urlOf(L, e.slug)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${L === 'uz' ? e.pr[0] : e.pr[1]}</priority>${Object.keys(PATH).map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${urlOf(l, e.slug)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${urlOf('uz', e.slug)}"/></url>`)).join('\n') + `\n</urlset>\n`);
writeFileSync(join(out, 'f73bdd20e36df0fc36bb1ddb09e93689.txt'), 'f73bdd20e36df0fc36bb1ddb09e93689'); // IndexNow kaliti (Bing/Yandex ga yangilanishni xabar qilish)
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);

writeFileSync(join(out, '_headers'), `/*
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/
  Content-Security-Policy: frame-ancestors 'self'
/*/
  Content-Security-Policy: frame-ancestors 'self'
/assets/img/*
  Cache-Control: public, max-age=2592000
/assets/vendor/*
  Cache-Control: public, max-age=2592000
/assets/video/*
  Cache-Control: public, max-age=604800
/assets/bot/*
  Cache-Control: public, max-age=604800
/assets/logo*
  Cache-Control: public, max-age=2592000
/assets/favicon.png
  Cache-Control: public, max-age=2592000
/assets/og.jpg
  Cache-Control: public, max-age=86400
/assets/style.css
  Cache-Control: public, max-age=3600
/assets/inner.css
  Cache-Control: public, max-age=3600
/assets/app.js
  Cache-Control: public, max-age=3600
/assets/content.js
  Cache-Control: public, max-age=3600
/assets/prices.js
  Cache-Control: public, max-age=3600
/assets/config.js
  Cache-Control: public, max-age=3600
/assets/analytics.js
  Cache-Control: public, max-age=3600
/admin/*
  Content-Security-Policy: frame-ancestors https://web.telegram.org https://webk.telegram.org https://webz.telegram.org https://*.telegram.org
  Cache-Control: no-store
  X-Robots-Tag: noindex, nofollow
`);
console.log('public/ tayyor:', Object.keys(PATH).join(', '));
