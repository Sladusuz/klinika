/* Narxlar (so'm). Narxni o'zgartirish: shu yerdagi raqamni almashtiring. null — "so'rov bo'yicha".
   Manba: klinika prayskurantlari (LOR, Procedura) va UZI narxlar varag'i. */
window.PRICE_DATA = [
  { id: 'lor', icon: 'ear', note: '+20%', groups: [
    { items: [['l1', 150000], ['l2', 60000], ['l3', 60000], ['l4', 70000], ['l4b', 100000], ['l5', 150000], ['l6', 200000], ['l7', 150000], ['l8', 150000], ['l9', 250000], ['l10', 250000], ['l11', 10000], ['l12', 20000], ['l13', 100000], ['l14', 400000], ['l15', 200000], ['l16', 20000], ['l17', 100000]] }
  ] },
  { id: 'uzi', icon: 'wave', groups: [
    { g: 'abd', items: [['u1', 150000], ['u2', 90000], ['u3', 70000], ['u11', 90000], ['u12', 100000], ['u13', 150000], ['u14', 150000], ['u15', 175000], ['u16', 200000], ['u33', 150000]] },
    { g: 'gl', items: [['u4', 70000], ['u5', 150000], ['u6', 70000], ['u7', 125000, '+5 000'], ['u34', 100000], ['u35', 90000], ['u10', 90000], ['u8', 70000]] },
    { g: 'gyn', items: [['u9', 150000], ['u17', 90000], ['u18', 90000], ['u19', 150000], ['u20', 150000], ['u21', 175000], ['u22', 250000], ['u23', 220000], ['u24', 300000], ['u25', 150000]] },
    { g: 'dop', items: [['u26', 150000], ['u27', 125000], ['u28', 300000], ['u29', 300000], ['u30', 250000], ['u31', 250000], ['u32', 80000]] },
    { g: 'heart', items: [['u36', 350000], ['u37', null], ['u38', null], ['u39', null], ['u40', null], ['u41', null]] }
  ] },
  { id: 'proc', icon: 'zap', groups: [
    { items: [['p1', 40000], ['p2', 80000], ['p3', 60000], ['p4', 30000], ['p5', 30000], ['p6', 50000], ['p7', 20000]] }
  ] }
];

window.PRICE_I18N = {
  uz: {
    cur: "so'm", ask: "So'rov bo'yicha", search: 'Xizmat qidirish…', none: 'Hech narsa topilmadi', book: 'Qabulga yozilish', call: "Qo'ng'iroq qilish",
    foot: "Narxlar so'mda ko'rsatilgan. Aniq summa qabulda tasdiqlanadi.", nonres: 'Norezidentlar uchun narxlarga +20% qo\'shiladi.',
    tabs: { lor: 'LOR xizmatlari', uzi: 'UZI', proc: 'Muolajalar' },
    groups: { abd: "Qorin bo'shlig'i va siydik yo'llari", gl: "Bezlar va yumshoq to'qimalar", gyn: 'Ginekologiya va homiladorlik', dop: 'Doppler va neyrosonografiya', heart: 'Yurak (exokardiografiya)' },
    n: {
      l1: 'Shifokor konsultatsiyasi (endoskopiya bilan)', l2: 'Bodomsimon bez lakunalarini yuvish va davolash', l3: 'Burunni yuvish (dori vositalari kiritish bilan)', l4: 'Quloqni yuvish (quloq tiqini, yiring, ajralma)', l4b: "Quloqni yuvish — zamburug' (otomikoz)",
      l5: 'Dori vositalarini limfotrop yuborish', l6: 'Eshitish nayini kateterizatsiya qilish', l7: 'Endonazal blokada', l8: 'Burundan qon ketganda tamponada', l9: "Gaymor bo'shlig'i punksiyasi", l10: "Peshona bo'shlig'ini zondlash",
      l11: "Politser bo'yicha burunni puflash", l12: 'Quloqqa dori kiritish (turunda)', l13: 'Burun, quloq va tomoqdan yot jismni olib tashlash', l14: 'Paratonzillyar abssessni ochish', l15: 'Quloq va burun furunkulini ochish', l16: "Tomoq va og'iz bo'shlig'ini antiseptik bilan ishlov berish", l17: 'Burun va quloq shilliq qavatini trixlorsirka kislotasi bilan kuydirish',
      u1: 'Buyraklar UZI', u2: 'Taloq UZI', u3: 'Buyrak usti bezlari UZI', u4: "So'lak bezlari UZI", u5: 'Sut bezlari UZI', u6: 'Ayirsimon (timus) bez UZI', u7: 'Qalqonsimon bez UZI', u8: 'Qov simfizi UZI', u9: 'Bachadon va ortiqlari UZI', u10: "Plevra bo'shlig'i UZI",
      u11: 'Oshqozon osti bezi UZI', u12: "Jigar va o't pufagi UZI", u13: 'Buyrak va siydik pufagi UZI', u14: 'Prostata va siydik pufagi UZI', u15: 'Siydik-tanosil tizimi UZI (buyrak, siydik pufagi, prostata)', u16: "Oshqozon-ichak a'zolari UZI (jigar, o't pufagi, oshqozon osti bezi, taloq)",
      u17: 'Follikulometriya (transvaginal)', u18: 'Follikulometriya (transabdominal)', u19: 'Homila UZI — 1-trimestr (12 haftagacha)', u20: 'Homila UZI — 1-trimestr (egizak)', u21: 'Homila UZI — 2-trimestr (12–24 hafta)', u22: 'Homila UZI — 2-trimestr (egizak)', u23: 'Homila UZI — 3-trimestr (24 haftadan)', u24: 'Homila UZI — 3-trimestr (egizak)', u25: 'Homila skrining UZI (11–13 hafta)',
      u26: 'Neyrosonografiya va dopplerografiya', u27: 'Neyrosonografiya', u28: 'Homila dopplerografiyasi (20 haftadan)', u29: "Bo'yin tomirlari dopplerografiyasi (BTS)", u30: 'Qo\'l tomirlari dopplerografiyasi', u31: 'Oyoq tomirlari dopplerografiyasi', u32: 'Qorin aortasi dopplerografiyasi',
      u33: 'Buyrak tomirlari UZI', u34: 'Limfa tugunlari UZI (1 zona)', u35: "Yumshoq to'qimalar UZI", u36: 'Yurak UZI (exokardiografiya)', u37: 'Transezofageal exokardiografiya', u38: 'Stress-exokardiografiya (dori bilan)', u39: 'Stress-exokardiografiya (jismoniy yuklama bilan)', u40: 'Exokardiografiya + treadmill', u41: 'Exokardiografiya uchun disk',
      p1: 'Kapelnitsa', p2: 'Kapelnitsa — 2 ta', p3: 'Kapelnitsa (dorilar bilan)', p4: 'Inyeksiya (tomir ichiga)', p5: 'Inyeksiya (mushak orasiga)', p6: 'Ingalyatsiya (dorilar bilan)', p7: "Qon bosimini o'lchash"
    }
  },
  ru: {
    cur: 'сум', ask: 'По запросу', search: 'Найти услугу…', none: 'Ничего не найдено', book: 'Записаться на приём', call: 'Позвонить',
    foot: 'Цены указаны в сумах. Точная стоимость подтверждается на приёме.', nonres: 'Для нерезидентов к ценам добавляется +20%.',
    tabs: { lor: 'ЛОР-услуги', uzi: 'УЗИ', proc: 'Процедуры' },
    groups: { abd: 'Брюшная полость и мочевыводящие пути', gl: 'Железы и мягкие ткани', gyn: 'Гинекология и беременность', dop: 'Допплерография и нейросонография', heart: 'Сердце (эхокардиография)' },
    n: {
      l1: 'Консультация врача (эндоскопия)', l2: 'Промывание лакун небных миндалин + обработка', l3: 'Промывание носа с введением лекарственных средств', l4: 'Промывание уха (серная пробка, гной, выделения)', l4b: 'Промывание уха при грибке (отомикоз)',
      l5: 'Лимфотропное введение лекарственных средств', l6: 'Катетеризация слуховой трубы', l7: 'Эндоназальная блокада', l8: 'Тампонада при кровотечении из полости носа', l9: 'Пункция гайморовой пазухи', l10: 'Зондирование лобной пазухи',
      l11: 'Продувание носа по Политцеру', l12: 'Введение лекарственных средств (турунды) в ухо', l13: 'Удаление инородных тел носа, уха и горла', l14: 'Вскрытие паратонзиллярного абсцесса', l15: 'Вскрытие фурункула уха и носа', l16: 'Обработка горла и ротовой полости антисептическими средствами', l17: 'Прижигание слизистых носа и уха трихлоруксусной кислотой',
      u1: 'УЗИ почек', u2: 'УЗИ селезёнки', u3: 'УЗИ надпочечников', u4: 'УЗИ слюнных желёз', u5: 'УЗИ молочных желёз', u6: 'УЗИ вилочковой железы', u7: 'УЗИ щитовидной железы', u8: 'УЗИ лобкового симфиза', u9: 'УЗИ матки и придатков', u10: 'УЗИ плевральной полости',
      u11: 'УЗИ поджелудочной железы', u12: 'УЗИ печени и желчного пузыря', u13: 'УЗИ почек и мочевого пузыря', u14: 'УЗИ предстательной железы и мочевого пузыря', u15: 'УЗИ МПС (почки, мочевой пузырь, предстательная железа)', u16: 'УЗИ ЖКТ (печень, желчный пузырь, поджелудочная железа, селезёнка)',
      u17: 'Фолликулометрия (трансвагинально)', u18: 'Фолликулометрия (трансабдоминально)', u19: 'УЗИ плода — 1 триместр (до 12 недель)', u20: 'УЗИ плода — 1 триместр (двойня)', u21: 'УЗИ плода — 2 триместр (с 12 до 24 недель)', u22: 'УЗИ плода — 2 триместр (двойня)', u23: 'УЗИ плода — 3 триместр (с 24 недель)', u24: 'УЗИ плода — 3 триместр (двойня)', u25: 'УЗИ скрининг плода (11–13 недель)',
      u26: 'Нейросонография и допплерография', u27: 'Нейросонография', u28: 'Допплерография плода (с 20 недель)', u29: 'Допплерография сосудов шеи (БЦС)', u30: 'Допплерография сосудов верхних конечностей', u31: 'Допплерография сосудов нижних конечностей', u32: 'Допплерография брюшной аорты',
      u33: 'УЗИ сосудов почек', u34: 'УЗИ лимфоузлов (1 зона)', u35: 'УЗИ мягких тканей', u36: 'УЗИ сердца (эхокардиография)', u37: 'Транспищеводная эхокардиография', u38: 'Стресс-эхокардиография (медикаментозная)', u39: 'Стресс-эхокардиография (с физической нагрузкой)', u40: 'Эхокардиография + тредмил', u41: 'Диск для эхокардиографии',
      p1: 'Капельница', p2: 'Капельница — 2 шт.', p3: 'Капельница (с лекарствами)', p4: 'Инъекция внутривенная (в/в)', p5: 'Инъекция внутримышечная (в/м)', p6: 'Ингаляция (с лекарствами)', p7: 'Измерение артериального давления'
    }
  },
  en: {
    cur: 'UZS', ask: 'On request', search: 'Search a service…', none: 'Nothing found', book: 'Book an appointment', call: 'Call us',
    foot: 'Prices are in UZS. The exact amount is confirmed at the clinic.', nonres: 'Non-residents: +20% is added to the prices.',
    tabs: { lor: 'ENT services', uzi: 'Ultrasound', proc: 'Procedures' },
    groups: { abd: 'Abdomen & urinary tract', gl: 'Glands & soft tissue', gyn: 'Gynecology & pregnancy', dop: 'Doppler & neurosonography', heart: 'Heart (echocardiography)' },
    n: {
      l1: 'Doctor consultation (with endoscopy)', l2: 'Tonsil lacunae washing + treatment', l3: 'Nasal wash with medication', l4: 'Ear washing (earwax plug, pus, discharge)', l4b: 'Ear washing for fungus (otomycosis)',
      l5: 'Lymphotropic drug administration', l6: 'Eustachian tube catheterization', l7: 'Endonasal block', l8: 'Tamponade for nosebleed', l9: 'Maxillary sinus puncture', l10: 'Frontal sinus probing',
      l11: 'Politzer nasal inflation', l12: 'Ear medication packing (turunda)', l13: 'Foreign body removal from nose, ear or throat', l14: 'Peritonsillar abscess drainage', l15: 'Ear and nose furuncle drainage', l16: 'Throat and mouth antiseptic treatment', l17: 'Cauterization of nasal and ear mucosa with trichloroacetic acid',
      u1: 'Kidney ultrasound', u2: 'Spleen ultrasound', u3: 'Adrenal gland ultrasound', u4: 'Salivary gland ultrasound', u5: 'Breast ultrasound', u6: 'Thymus ultrasound', u7: 'Thyroid ultrasound', u8: 'Pubic symphysis ultrasound', u9: 'Uterus and adnexa ultrasound', u10: 'Pleural cavity ultrasound',
      u11: 'Pancreas ultrasound', u12: 'Liver and gallbladder ultrasound', u13: 'Kidney and bladder ultrasound', u14: 'Prostate and bladder ultrasound', u15: 'Urinary system ultrasound (kidneys, bladder, prostate)', u16: 'Abdominal ultrasound (liver, gallbladder, pancreas, spleen)',
      u17: 'Folliculometry (transvaginal)', u18: 'Folliculometry (transabdominal)', u19: 'Fetal ultrasound — 1st trimester (up to 12 weeks)', u20: 'Fetal ultrasound — 1st trimester (twins)', u21: 'Fetal ultrasound — 2nd trimester (12–24 weeks)', u22: 'Fetal ultrasound — 2nd trimester (twins)', u23: 'Fetal ultrasound — 3rd trimester (from 24 weeks)', u24: 'Fetal ultrasound — 3rd trimester (twins)', u25: 'Fetal screening ultrasound (11–13 weeks)',
      u26: 'Neurosonography and Doppler', u27: 'Neurosonography', u28: 'Fetal Doppler (from 20 weeks)', u29: 'Neck vessels Doppler (brachiocephalic)', u30: 'Upper limb vessels Doppler', u31: 'Lower limb vessels Doppler', u32: 'Abdominal aorta Doppler',
      u33: 'Renal vessels ultrasound', u34: 'Lymph node ultrasound (1 zone)', u35: 'Soft tissue ultrasound', u36: 'Heart ultrasound (echocardiography)', u37: 'Transesophageal echocardiography', u38: 'Stress echocardiography (pharmacological)', u39: 'Stress echocardiography (exercise)', u40: 'Echocardiography + treadmill', u41: 'Echocardiography disc',
      p1: 'IV drip', p2: 'IV drip — 2 bags', p3: 'IV drip (with medication)', p4: 'Intravenous injection', p5: 'Intramuscular injection', p6: 'Inhalation (with medication)', p7: 'Blood pressure measurement'
    }
  },
  kk: {
    cur: 'сум', ask: 'Сұраныс бойынша', search: 'Қызметті іздеу…', none: 'Ештеңе табылмады', book: 'Қабылдауға жазылу', call: 'Қоңырау шалу',
    foot: 'Бағалар сұмен көрсетілген. Нақты соманы қабылдауда растайды.', nonres: 'Резидент еместерге бағаларға +20% қосылады.',
    tabs: { lor: 'ЛОР қызметтері', uzi: 'УЗИ', proc: 'Емшаралар' },
    groups: { abd: 'Құрсақ қуысы және несеп жолдары', gl: 'Бездер және жұмсақ тіндер', gyn: 'Гинекология және жүктілік', dop: 'Допплерография және нейросонография', heart: 'Жүрек (эхокардиография)' },
    n: {
      l1: 'Дәрігер консультациясы (эндоскопиямен)', l2: 'Таңдай бадамша бездерінің лакуналарын жуу + өңдеу', l3: 'Мұрынды жуу (дәрі енгізумен)', l4: 'Құлақты жуу (күкірт тығыны, іріңдеу, бөлінді)', l4b: 'Құлақты жуу — саңырауқұлақ (отомикоз)',
      l5: 'Дәрі-дәрмектерді лимфотропты енгізу', l6: 'Есту түтігін катетеризациялау', l7: 'Эндоназальды блокада', l8: 'Мұрыннан қан кеткенде тампонада', l9: 'Гайморов қуысын пункциялау', l10: 'Маңдай қуысын зондтау',
      l11: 'Политцер бойынша мұрынды үрлеу', l12: 'Құлаққа дәрі енгізу (турунда)', l13: 'Мұрыннан, құлақтан және тамақтан бөгде заттарды алу', l14: 'Паратонзиллярлық абсцесті ашу', l15: 'Құлақ пен мұрын фурункулін ашу', l16: 'Тамақ пен ауыз қуысын антисептикпен өңдеу', l17: 'Мұрын мен құлақ кілегейін трихлорсірке қышқылымен күйдіру',
      u1: 'Бүйрек УЗИ', u2: 'Көкбауыр УЗИ', u3: 'Бүйрек үсті безі УЗИ', u4: 'Сілекей бездері УЗИ', u5: 'Сүт бездері УЗИ', u6: 'Айырша безі УЗИ', u7: 'Қалқанша безі УЗИ', u8: 'Қасаға симфизі УЗИ', u9: 'Жатыр және қосалқылары УЗИ', u10: 'Плевра қуысы УЗИ',
      u11: 'Ұйқы безі УЗИ', u12: 'Бауыр және өт қабы УЗИ', u13: 'Бүйрек және қуық УЗИ', u14: 'Қуықасты безі және қуық УЗИ', u15: 'Несеп жүйесі УЗИ (бүйрек, қуық, қуықасты безі)', u16: 'Асқазан-ішек мүшелері УЗИ (бауыр, өт қабы, ұйқы безі, көкбауыр)',
      u17: 'Фолликулометрия (трансвагиналды)', u18: 'Фолликулометрия (трансабдоминалды)', u19: 'Ұрық УЗИ — 1-триместр (12 аптаға дейін)', u20: 'Ұрық УЗИ — 1-триместр (егіз)', u21: 'Ұрық УЗИ — 2-триместр (12–24 апта)', u22: 'Ұрық УЗИ — 2-триместр (егіз)', u23: 'Ұрық УЗИ — 3-триместр (24 аптадан)', u24: 'Ұрық УЗИ — 3-триместр (егіз)', u25: 'Ұрық скрининг УЗИ (11–13 апта)',
      u26: 'Нейросонография және допплерография', u27: 'Нейросонография', u28: 'Ұрық допплерографиясы (20 аптадан)', u29: 'Мойын тамырлары допплерографиясы (БЦС)', u30: 'Қол тамырлары допплерографиясы', u31: 'Аяқ тамырлары допплерографиясы', u32: 'Құрсақ қолқасы допплерографиясы',
      u33: 'Бүйрек тамырлары УЗИ', u34: 'Лимфа түйіндері УЗИ (1 аймақ)', u35: 'Жұмсақ тіндер УЗИ', u36: 'Жүрек УЗИ (эхокардиография)', u37: 'Трансэзофагеалды эхокардиография', u38: 'Стресс-эхокардиография (дәрілік)', u39: 'Стресс-эхокардиография (дене жүктемесімен)', u40: 'Эхокардиография + тредмил', u41: 'Эхокардиография дискісі',
      p1: 'Тамшылатқыш (капельница)', p2: 'Тамшылатқыш — 2 дана', p3: 'Тамшылатқыш (дәрімен)', p4: 'Көктамырға инъекция', p5: 'Бұлшықетке инъекция', p6: 'Ингаляция (дәрімен)', p7: 'Қан қысымын өлшеу'
    }
  }
};
