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
  maps: { embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3745.2071581368364!2d69.3264717!3d41.327009499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aef5006653a8b9%3A0x2ae1c069f3b2768f!2sOrlent%20Medical!5e1!3m2!1sen!2s!4v1793886031546!5m2!1sen!2s", google: "https://g.page/r/CY92svNpwOEqEBM", review: "https://g.page/r/CY92svNpwOEqEBM/review", yandex: "https://yandex.uz/maps/org/orlent_medical/149891150120/" },
  mapQuery: "Sayram 43, Mirzo Ulugbek tumani, Toshkent",   // xaritada qidiriladigan manzil
  // API (Cloudflare Worker) manzili. Bo'sh = sayt bilan bir xil domen (domen /api/* ni Worker'ga yo'naltirgan bo'lsa).
  // Aks holda to'liq manzil, masalan: "https://orlent-medical-api.<akkaunt>.workers.dev"
  apiBase: "",
  // Analitika: Google Analytics 4 o'lchov ID (G-XXXXXXXXXX) va Yandex Metrika hisoblagich raqami. Bo'sh bo'lsa o'chirilgan.
  analytics: { ga4: "", ym: 0 },
  botUsername: "orlentmedical_bot"   // zayavkalar shu bot orqali keladi (token faqat Netlify'da saqlanadi)
};
