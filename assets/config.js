/* Klinika sozlamalari — shu yerni o'zgartiring */
window.CLINIC = {
  name: "Orlent Medical",
  phone: "+998946476479",
  phoneView: "+998 94 647 64 79",
  whatsapp: "998946476479",   // WhatsApp raqami (+ siz, probelsiz)
  telegram: "orlentmedical",
  instagram: "orlent_medical",
  address: {
    uz: "Toshkent, Mirzo Ulug'bek tumani, Sayram ko'chasi, 43-uy. Mo'ljal: «Buyuk Ipak Yo'li» metrosi",
    ru: "Ташкент, Мирзо-Улугбекский район, ул. Сайрам, 43. Ориентир: метро «Буюк Ипак Йули»",
    kk: "Ташкент, Мирзо Улугбек ауданы, Сайрам көшесі, 43-үй. Бағдар: «Буюк Ипак Йули» метросы",
    en: "43 Sayram St, Mirzo Ulugbek district, Tashkent. Landmark: Buyuk Ipak Yuli metro"
  },
  // Google/Yandex xarita va sharh havolalari, koordinatalar (Google qidiruv va xarita uchun)
  geo: { lat: 41.3270095, lng: 69.3264717 }, postalCode: "100170",
  maps: { google: "https://g.page/r/CY92svNpwOEqEBM", review: "https://g.page/r/CY92svNpwOEqEBM/review", yandex: "https://yandex.uz/maps/org/orlent_medical/149891150120/" },
  mapQuery: "Sayram 43, Mirzo Ulugbek tumani, Toshkent",   // xaritada qidiriladigan manzil
  // API (Cloudflare Worker) manzili. Bo'sh = sayt bilan bir xil domen (domen /api/* ni Worker'ga yo'naltirgan bo'lsa).
  // Aks holda to'liq manzil, masalan: "https://orlent-medical-api.<akkaunt>.workers.dev"
  apiBase: "",
  botUsername: "orlentmedical_bot"   // zayavkalar shu bot orqali keladi (token faqat Netlify'da saqlanadi)
};
