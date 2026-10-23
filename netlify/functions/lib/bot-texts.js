const PHONE = '+998 94 647 64 79';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Sayram 43, Mirzo Ulugbek tumani, Toshkent');
module.exports = {
  PHONE, MAPS,
  uz: {
    flag: "🇺🇿 O'zbekcha",
    menu: { apply: '📝 Zayavka qoldirish', svcs: '🩺 Xizmatlar', addr: '📍 Manzil', contact: '📞 Aloqa', site: '🌐 Sayt', lang: '🌍 Til' },
    cancel: '❌ Bekor qilish', share: '📱 Kontaktimni yuborish',
    welcome: "<b>Orlent Medical</b>\n<i>LOR markazi va UTT diagnostikasi</i>\n\n✅ Quloq, burun va tomoq kasalliklari\n✅ UTT — xavfsiz, og'riqsiz, tezkor\n✅ Bolalar va kattalar uchun\n\n📍 Mirzo Ulug'bek tumani, Sayram 43\n🚇 Metro «Buyuk Ipak Yo'li» yonida\n📞 " + PHONE + "\n\n👇 Qabulga yozilish uchun <b>«📝 Zayavka qoldirish»</b> tugmasini bosing",
    hint: 'Quyidagi tugmalardan birini tanlang 👇',
    pick: '🩺 <b>Qaysi xizmat kerak?</b>\nBirini tanlang:',
    svc: 'Xizmat', nameLbl: 'Ism', phoneLbl: 'Telefon',
    askName: "👤 <b>Ismingizni yozing</b>\nYoki pastdagi tugma bilan kontaktingizni yuboring — ism va raqam avtomatik olinadi.",
    askPhone: "📞 <b>Telefon raqamingizni yozing</b>\nMasalan: <code>+998 90 123 45 67</code>\nYoki pastdagi tugmani bosing.",
    askNameShort: 'Ismingizni yozing:', askPhoneShort: 'Telefon raqamingizni yozing (masalan: +998 90 123 45 67):',
    badName: "❗️ Iltimos, ismingizni to'g'ri yozing (kamida 2 harf).", badPhone: "❗️ Raqam noto'g'ri ko'rinadi. Masalan: +998 90 123 45 67",
    done: "✅ <b>Arizangiz qabul qilindi!</b>\n\n🩺 {svc}\n👤 {name}\n📞 {phone}\n\nAdministratorimiz tez orada siz bilan bog'lanadi.\nShoshilinch bo'lsa: " + PHONE,
    fail: "😔 Texnik xatolik yuz berdi. Iltimos, qo'ng'iroq qiling: " + PHONE,
    cancelled: '❌ Bekor qilindi. Kerak bo\'lsa, qaytadan boshlang.',
    svcInfo: "🩺 <b>Xizmatlarimiz</b>\n\n👂 <b>Quloq</b> — otit, og'riq, eshitish pasayishi, quloq tiqini\n👃 <b>Burun</b> — rinit, sinusit, allergiya, burun bitishi\n🗣 <b>Tomoq</b> — angina, faringit, laringit, bodomsimon bez\n📡 <b>UTT</b> — xavfsiz, og'riqsiz ultratovush tekshiruvi\n👶 <b>Bolalar LOR</b> — bolalar uchun yumshoq yondashuv\n\n💰 Narxlar qabulda yoki telefon orqali aniqlanadi.",
    addr: "📍 <b>Manzil</b>\nToshkent, Mirzo Ulug'bek tumani, Sayram ko'chasi, 43-uy.\n🚇 Mo'ljal: «Buyuk Ipak Yo'li» metrosi.",
    contact: "📞 <b>Aloqa</b>\n\n☎️ " + PHONE + "\n✈️ Telegram: @orlentmedical\n📷 Instagram: @orlent_medical",
    site: "🌐 <b>Bizning sayt</b>\nXizmatlar, shifokorlar va onlayn yozilish:",
    route: "🗺 Yo'l ko'rsatish", open: 'Saytni ochish', write: "💬 Telegram'da yozish", apply: '📝 Zayavka qoldirish'
  },
  ru: {
    flag: '🇷🇺 Русский',
    menu: { apply: '📝 Оставить заявку', svcs: '🩺 Услуги', addr: '📍 Адрес', contact: '📞 Контакты', site: '🌐 Сайт', lang: '🌍 Язык' },
    cancel: '❌ Отмена', share: '📱 Отправить контакт',
    welcome: '<b>Orlent Medical</b>\n<i>ЛОР-центр и УЗИ-диагностика</i>\n\n✅ Заболевания уха, горла и носа\n✅ УЗИ — безопасно, безболезненно, быстро\n✅ Для детей и взрослых\n\n📍 Мирзо-Улугбекский район, Сайрам 43\n🚇 Рядом с метро «Буюк Ипак Йули»\n📞 ' + PHONE + '\n\n👇 Чтобы записаться, нажмите <b>«📝 Оставить заявку»</b>',
    hint: 'Выберите одну из кнопок ниже 👇',
    pick: '🩺 <b>Какая услуга нужна?</b>\nВыберите:',
    svc: 'Услуга', nameLbl: 'Имя', phoneLbl: 'Телефон',
    askName: '👤 <b>Напишите ваше имя</b>\nИли отправьте контакт кнопкой ниже — имя и номер подставятся автоматически.',
    askPhone: '📞 <b>Напишите номер телефона</b>\nНапример: <code>+998 90 123 45 67</code>\nИли нажмите кнопку ниже.',
    askNameShort: 'Напишите ваше имя:', askPhoneShort: 'Напишите номер телефона (например: +998 90 123 45 67):',
    badName: '❗️ Пожалуйста, напишите имя правильно (минимум 2 буквы).', badPhone: '❗️ Номер выглядит неверно. Например: +998 90 123 45 67',
    done: '✅ <b>Заявка принята!</b>\n\n🩺 {svc}\n👤 {name}\n📞 {phone}\n\nАдминистратор скоро свяжется с вами.\nСрочно: ' + PHONE,
    fail: '😔 Произошла техническая ошибка. Пожалуйста, позвоните: ' + PHONE,
    cancelled: '❌ Отменено. Если нужно, начните заново.',
    svcInfo: '🩺 <b>Наши услуги</b>\n\n👂 <b>Ухо</b> — отит, боль, снижение слуха, серные пробки\n👃 <b>Нос</b> — ринит, синусит, аллергия, заложенность\n🗣 <b>Горло</b> — ангина, фарингит, ларингит, миндалины\n📡 <b>УЗИ</b> — безопасное и безболезненное исследование\n👶 <b>Детский ЛОР</b> — мягкий подход к детям\n\n💰 Стоимость уточняйте на приёме или по телефону.',
    addr: '📍 <b>Адрес</b>\nТашкент, Мирзо-Улугбекский район, ул. Сайрам, 43.\n🚇 Ориентир: метро «Буюк Ипак Йули».',
    contact: '📞 <b>Контакты</b>\n\n☎️ ' + PHONE + '\n✈️ Telegram: @orlentmedical\n📷 Instagram: @orlent_medical',
    site: '🌐 <b>Наш сайт</b>\nУслуги, врачи и онлайн-запись:',
    route: '🗺 Построить маршрут', open: 'Открыть сайт', write: '💬 Написать в Telegram', apply: '📝 Оставить заявку'
  },
  en: {
    flag: '🇬🇧 English',
    menu: { apply: '📝 Book appointment', svcs: '🩺 Services', addr: '📍 Address', contact: '📞 Contact', site: '🌐 Website', lang: '🌍 Language' },
    cancel: '❌ Cancel', share: '📱 Share my contact',
    welcome: '<b>Orlent Medical</b>\n<i>ENT center & ultrasound diagnostics</i>\n\n✅ Ear, nose and throat conditions\n✅ Ultrasound — safe, painless, quick\n✅ For children and adults\n\n📍 Mirzo Ulugbek district, Sayram 43\n🚇 Near Buyuk Ipak Yuli metro\n📞 ' + PHONE + '\n\n👇 Tap <b>«📝 Book appointment»</b> to leave a request',
    hint: 'Please choose one of the buttons below 👇',
    pick: '🩺 <b>Which service do you need?</b>\nChoose one:',
    svc: 'Service', nameLbl: 'Name', phoneLbl: 'Phone',
    askName: '👤 <b>Please write your name</b>\nOr share your contact with the button below — name and number are filled in automatically.',
    askPhone: '📞 <b>Please write your phone number</b>\nFor example: <code>+998 90 123 45 67</code>\nOr tap the button below.',
    askNameShort: 'Please write your name:', askPhoneShort: 'Please write your phone number (e.g. +998 90 123 45 67):',
    badName: '❗️ Please write your name correctly (at least 2 letters).', badPhone: '❗️ That number looks wrong. Example: +998 90 123 45 67',
    done: "✅ <b>Request received!</b>\n\n🩺 {svc}\n👤 {name}\n📞 {phone}\n\nOur administrator will contact you shortly.\nUrgent: " + PHONE,
    fail: '😔 A technical error occurred. Please call us: ' + PHONE,
    cancelled: '❌ Cancelled. Start again whenever you like.',
    svcInfo: '🩺 <b>Our services</b>\n\n👂 <b>Ear</b> — otitis, pain, hearing loss, earwax blockage\n👃 <b>Nose</b> — rhinitis, sinusitis, allergies, congestion\n🗣 <b>Throat</b> — tonsillitis, pharyngitis, laryngitis\n📡 <b>Ultrasound</b> — safe, painless examination\n👶 <b>Pediatric ENT</b> — a gentle approach for children\n\n💰 Prices are confirmed at the clinic or by phone.',
    addr: '📍 <b>Address</b>\n43 Sayram St, Mirzo Ulugbek district, Tashkent.\n🚇 Landmark: Buyuk Ipak Yuli metro.',
    contact: '📞 <b>Contact</b>\n\n☎️ ' + PHONE + '\n✈️ Telegram: @orlentmedical\n📷 Instagram: @orlent_medical',
    site: '🌐 <b>Our website</b>\nServices, doctors and online booking:',
    route: '🗺 Get directions', open: 'Open website', write: '💬 Message on Telegram', apply: '📝 Book appointment'
  }
};

// ---- ro'yxatdan o'tish, tasdiqlash, profil
Object.assign(module.exports.uz, {
  hi: 'Assalomu alaykum', skip: '⏭ Keyinroq',
  regAsk: "📲 <b>Ro'yxatdan o'ting</b>\nPastdagi tugma bilan kontaktingizni yuboring — shundan keyin zayavka <b>bitta bosish</b> bilan yuboriladi.",
  regDone: "✅ <b>Rahmat, {name}!</b> Ro'yxatdan o'tdingiz.\nEndi zayavka qoldirish juda oson 👇",
  regSkip: "Mayli, keyinroq ham ro'yxatdan o'tishingiz mumkin (<b>👤 Profil</b>). Menyudan foydalaning 👇",
  wrongContact: "❗️ Iltimos, <b>o'zingizning</b> kontaktingizni pastdagi tugma orqali yuboring.",
  confirm: "📋 <b>Zayavkani tasdiqlang</b>", send: '✅ Yuborish', edit: "✏️ O'zgartirish",
  profile: "👤 <b>Profil</b>\n\n{p}\n\nMa'lumotlarni yangilash uchun kontaktni qayta yuboring.", noProfile: "👤 <b>Profil</b>\n\nHali ro'yxatdan o'tmagansiz.", reReg: '🔄 Kontaktni yuborish',
  step: ['Xizmat', 'Ism', 'Telefon']
});
Object.assign(module.exports.ru, {
  hi: 'Здравствуйте', skip: '⏭ Позже',
  regAsk: '📲 <b>Пройдите регистрацию</b>\nОтправьте контакт кнопкой ниже — после этого заявка отправляется <b>в одно касание</b>.',
  regDone: '✅ <b>Спасибо, {name}!</b> Вы зарегистрированы.\nТеперь оставить заявку проще простого 👇',
  regSkip: 'Хорошо, зарегистрироваться можно позже (<b>👤 Профиль</b>). Пользуйтесь меню 👇',
  wrongContact: '❗️ Пожалуйста, отправьте <b>свой</b> контакт кнопкой ниже.',
  confirm: '📋 <b>Подтвердите заявку</b>', send: '✅ Отправить', edit: '✏️ Изменить',
  profile: '👤 <b>Профиль</b>\n\n{p}\n\nЧтобы обновить данные, отправьте контакт заново.', noProfile: '👤 <b>Профиль</b>\n\nВы ещё не зарегистрированы.', reReg: '🔄 Отправить контакт',
  step: ['Услуга', 'Имя', 'Телефон']
});
Object.assign(module.exports.en, {
  hi: 'Hello', skip: '⏭ Later',
  regAsk: '📲 <b>Quick registration</b>\nShare your contact with the button below — after that, booking takes <b>a single tap</b>.',
  regDone: '✅ <b>Thank you, {name}!</b> You are registered.\nBooking is now super easy 👇',
  regSkip: 'No problem, you can register later (<b>👤 Profile</b>). Use the menu 👇',
  wrongContact: '❗️ Please share <b>your own</b> contact with the button below.',
  confirm: '📋 <b>Confirm your request</b>', send: '✅ Send', edit: '✏️ Edit',
  profile: '👤 <b>Profile</b>\n\n{p}\n\nTo update, share your contact again.', noProfile: "👤 <b>Profile</b>\n\nYou haven't registered yet.", reReg: '🔄 Share contact',
  step: ['Service', 'Name', 'Phone']
});
module.exports.uz.menu.profile = '👤 Profil'; module.exports.ru.menu.profile = '👤 Профиль'; module.exports.en.menu.profile = '👤 Profile';
