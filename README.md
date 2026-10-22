# Orlent Medical — klinika sayti

LOR markazi va UTT diagnostikasi uchun statik sayt (HTML/CSS/JS, build kerak emas). Tillar: UZ / RU / EN.

## Netlify'ga joylash
1. Netlify → **Add new site → Import an existing project → GitHub** → shu repozitoriyni tanlang.
2. Build command: bo'sh qoldiring. Publish directory: `.` (`netlify.toml`da sozlangan).
3. **Deploy**. Domen: Site settings → Domain management.

## Ma'lumotlarni o'zgartirish
- `assets/config.js` — telefon, Telegram, Instagram, manzil, Google Maps (`mapEmbed`).
- `assets/content.js` — barcha matnlar (shifokorlar, narxlar, sharhlar, FAQ) uch tilda.
- `assets/` — logotip va rasmlar.

## Qabul formasi
Hozir ariza matni nusxalanadi va Telegram chat (`@orlentmedical`) ochiladi.
Avtomatik yuborish uchun `config.js`da `botToken` va `chatId` to'ldiriladi (token sayt kodida ochiq bo'lishini unutmang;
xavfsizroq yo'l — Netlify Function orqali yuborish).

## Domen ulangach
`index.html`dagi `og:image` ni to'liq havolaga o'zgartiring va `robots.txt`ga `Sitemap:` qo'shing.
