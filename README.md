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

## Telegram bot va zayavkalar (@orlentmedical_bot)
Sayt formasi va botning o'zi zayavkalarni klinika xodimlarining Telegramiga yuboradi.
Kod `netlify/functions/` ichida: `lead.js` (sayt formasi), `telegram-webhook.js` (bot), `telegram-setup.js` (bir martalik sozlash).

**Bot tokeni hech qachon GitHub'ga yozilmaydi** — faqat Netlify muhit o'zgaruvchilarida saqlanadi.

### Sozlash (bir marta)
1. Netlify → Site configuration → **Environment variables** → quyidagilarni qo'shing:
   - `TELEGRAM_BOT_TOKEN` — @BotFather bergan token
   - `ADMIN_CHAT_ID` — zayavkalar boradigan chat ID (bir nechta bo'lsa vergul bilan: `123,456`; guruh ID si `-100...` bilan boshlanadi)
   - `TELEGRAM_WEBHOOK_SECRET` — uzun tasodifiy qator (webhook himoyasi va sozlash kaliti)
   - `SITE_URL` — (ixtiyoriy) masalan `https://orlentmedi.netlify.app`
2. **Deploys → Trigger deploy → Clear cache and deploy site**.
3. Brauzerda oching: `https://<sayt>/.netlify/functions/telegram-setup?key=<TELEGRAM_WEBHOOK_SECRET>` — webhook ulanadi, bot nomi/tavsifi/buyruqlari o'rnatiladi.
4. Botga `/start` yuboring va saytdagi formani sinab ko'ring.

Chat ID bilmasangiz: webhook ulangach botga (yoki guruhga qo'shilgan botga) `/id` yuboring.

### Bot imkoniyatlari
- 🇺🇿 / 🇷🇺 / 🇬🇧 tillar, doimiy menyu: Zayavka · Manzil · Aloqa · Sayt · Til
- Zayavka: xizmat → ism → telefon (raqam tekshiriladi), mijozga tasdiq xabari
- Xodimlarga: ism, telefon, xizmat, manba (Sayt/Bot), mijoz havolasi va **«✅ Qabul qilindi»** tugmasi
- Spamdan himoya: yashirin maydon, boshqa saytlardan so'rov rad etiladi, webhook maxfiy kalit bilan

## Domen ulangach
`index.html`dagi `og:image` ni to'liq havolaga o'zgartiring va `robots.txt`ga `Sitemap:` qo'shing.

## Rasmlar
`assets/img/` dagi rasmlar [Pexels](https://www.pexels.com) bepul litsenziyasi bilan olingan **namunaviy (stock)** rasmlar
(muallif ko'rsatish shart emas). Klinikaning o'z rasmlari tayyor bo'lganda shu fayllarni xuddi shu nom bilan almashtiring
yoki `index.html`dagi `src` ni o'zgartiring. Shifokorlar rasmi hozircha qo'yilmagan (namunaviy belgi turibdi).

## Animatsiyalar va effektlar
GSAP + ScrollTrigger + Lenis (`assets/vendor/`): yumshoq skroll, skroll bilan qotib turuvchi gorizontal xizmatlar va qadamlar, jonli to'lqin fon (canvas), 3D tilt, magnit tugmalar, kursor. Telefonda og'ir effektlar yengillashtiriladi, "reduce motion" yoqilgan bo'lsa animatsiyalar o'chadi.

## Video
`assets/video/reklama.mp4` — sayt ichidagi telefon maketida ko'rinadigan reklama videosi (ko'rinish maydoniga kirganda o'zi boshlanadi, ovoz tugma bilan yoqiladi).

<!-- deploy: Telegram bot environment variables applied -->
