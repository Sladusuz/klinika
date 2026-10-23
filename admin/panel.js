(function () {
  'use strict';
  var tg = (window.Telegram && window.Telegram.WebApp) || null;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var API = '/.netlify/functions/admin-api';
  var EMO = ['🩺', '👂', '👃', '🗣', '📡', '👶'];
  var DAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
  var MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  var WEEK = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];
  var S = { me: null, dash: null, ins: null, admins: [], services: [], leadF: 'all', leads: [], leadMore: false, users: [], userSort: 'new', tab: 'home', page: null };

  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var haptic = function (t) { try { if (tg && tg.HapticFeedback) { t === 'ok' ? tg.HapticFeedback.notificationOccurred('success') : t === 'err' ? tg.HapticFeedback.notificationOccurred('error') : tg.HapticFeedback.selectionChanged(); } } catch (e) { /* ixtiyoriy */ } };
  var emo = function (service) { var i = S.services.indexOf(service); return EMO[i] || '🩺'; };
  var initials = function (n) { return (String(n || '?').trim()[0] || '?').toUpperCase(); };
  var timeOf = function (t) { return String((t || '').split('·')[1] || '').trim(); };
  var dur = function (m) { return m == null ? '—' : m < 1 ? '1 daqiqadan kam' : m < 60 ? m + ' daqiqa' : Math.floor(m / 60) + ' soat ' + (m % 60 ? m % 60 + ' daqiqa' : ''); };
  var confirmBox = function (msg, ok) { if (tg && tg.showConfirm) tg.showConfirm(msg, function (y) { if (y) ok(); }); else if (window.confirm(msg)) ok(); };

  function toast(msg, err) { var t = $('#toast'); t.textContent = msg; t.className = 'toast on' + (err ? ' err' : ''); haptic(err ? 'err' : 'ok'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.className = 'toast'; }, 2600); }
  function gate(title, text) { $('#gateT').textContent = title; $('#gateP').textContent = text; $('#gate').hidden = false; $('#app').hidden = true; }
  function api(action, data) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tg-Init-Data': (tg && tg.initData) || '' }, body: JSON.stringify(Object.assign({ action: action }, data || {})) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (r.ok) return j; var e = new Error(j.error || r.status); e.status = r.status; e.code = j.error; throw e; }); });
  }
  function fail(e) {
    if (e.status === 401) return gate('Qayta oching', "Sessiya eskirgan. Panelni botdagi «⚙️ Panel» tugmasi orqali qaytadan oching.");
    if (e.status === 403) return gate("Ruxsat yo'q", "Bu panel faqat egasi uchun. Sizning kirishingiz rad etildi.");
    toast('Xatolik: ' + (e.code || e.message), true);
  }
  function busy(btn, p) { btn.disabled = true; return p.then(function (r) { btn.disabled = false; return r; }, function (e) { btn.disabled = false; throw e; }); }

  /* ---------- tabs / pages / sheet ---------- */
  function go(tab) {
    if (S.page) closePage(true);
    S.tab = tab; haptic();
    $$('.tab').forEach(function (s) { s.classList.toggle('on', s.dataset.tab === tab); });
    $$('#tabbar button').forEach(function (b) { b.classList.toggle('on', b.dataset.go === tab); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'leads') loadLeads(true);
    if (tab === 'users') loadUsers();
    if (tab === 'send') { loadRecipients(); loadHist('#bcHist', 5); }
    if (tab === 'more') $('#ownerName').textContent = S.me.name || 'Admin';
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

  function openSheet(html) { $('#sheetBody').innerHTML = html; $('#scrim').hidden = false; requestAnimationFrame(function () { $('#sheet').classList.add('on'); }); haptic(); }
  function closeSheet() { $('#sheet').classList.remove('on'); setTimeout(function () { $('#scrim').hidden = true; }, 300); }
  $('#scrim').addEventListener('click', closeSheet);

  var PAGES = { stats: ['📈 Statistika', pageStats], history: ['📜 Xabarlar tarixi', pageHistory], security: ['🛡️ Xavfsizlik va jurnal', pageSecurity], admins: ['👮 Adminlar', pageAdmins], backup: ['💾 Eksport va zaxira', pageBackup] };
  function openPage(name) {
    var p = PAGES[name]; if (!p) return;
    S.page = name; haptic(); $('#pageTitle').textContent = p[0]; $('#pageBody').innerHTML = '<div class="skel"></div><div class="skel" style="margin-top:10px"></div>';
    $('#page').hidden = false; $('#page').scrollTop = 0; document.body.style.overflow = 'hidden';
    if (tg && tg.BackButton) { tg.BackButton.show(); }
    p[1]($('#pageBody'));
  }
  function closePage(silent) { if (!S.page) return; S.page = null; $('#page').hidden = true; document.body.style.overflow = ''; if (tg && tg.BackButton) tg.BackButton.hide(); if (!silent) haptic(); }
  $('#pageBack').onclick = function () { closePage(); };
  if (tg && tg.BackButton) tg.BackButton.onClick(function () { if (!$('#sheet').classList.contains('on')) closePage(); else closeSheet(); });
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-page]'); if (b) openPage(b.dataset.page); });

  /* ---------- dashboard ---------- */
  function counter(el, to) { var t0 = performance.now(), d = 700; (function f(t) { var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(f); })(t0); }
  function renderDash() {
    var d = S.dash, t = d.today;
    var k = [['📥', 'Bugungi zayavka', t.leads, 'var(--mint)', ''], ['🟡', 'Kutayotgan', t.wait, 'var(--amber)', t.wait ? 'hot' : ''], ['🟢', 'Qabul qilingan', t.done, 'var(--mint)', ''], ['👥', 'Yangi mijoz', t.regs, 'var(--sky)', '']];
    $('#kpis').innerHTML = k.map(function (x, i) { return '<div class="kpi ' + x[4] + '" style="--c:' + x[3] + ';--d:' + i + '"><small>' + x[0] + ' ' + x[1] + '</small><b data-n="' + x[2] + '">0</b>' + (i === 0 ? '<em>sayt ' + t.site + ' · bot ' + t.bot + '</em>' : i === 3 ? '<em>jami ' + d.users.total + (d.users.blocked ? ' · ' + d.users.blocked + ' bloklagan' : '') + '</em>' : '') + '</div>'; }).join('');
    $$('#kpis b').forEach(function (b) { counter(b, +b.dataset.n); });
    if (S.ins) { var s = S.ins.totals; $('#insights').innerHTML = '<div><b>' + (s.leads ? s.rate + '%' : '—') + '</b><small>Qabul foizi</small></div><div><b>' + (s.avgResp == null ? '—' : s.avgResp < 60 ? s.avgResp + ' daq' : Math.round(s.avgResp / 60) + ' soat') + '</b><small>O\'rtacha javob</small></div><div><b>' + s.leads + '</b><small>7 kunda zayavka</small></div>'; }
    var max = Math.max.apply(null, d.week.map(function (w) { return Math.max(w.leads, w.regs); }).concat([1]));
    $('#chart').innerHTML = d.week.map(function (w, i) {
      var wd = DAYS[new Date(w.day + 'T12:00:00+05:00').getDay()];
      return '<div class="bar' + (i === 6 ? ' today' : '') + '"><u>' + (w.leads || '') + '</u><div class="cols"><i class="l" style="height:' + Math.max(w.leads / max * 100, w.leads ? 6 : 2) + '%;animation-delay:' + i * 70 + 'ms"></i><i class="r" style="height:' + Math.max(w.regs / max * 100, w.regs ? 6 : 2) + '%;animation-delay:' + (i * 70 + 60) + 'ms"></i></div><span>' + wd + '</span></div>';
    }).join('');
    var sm = Math.max.apply(null, d.services.map(function (s) { return s.n; }).concat([1]));
    $('#svcBars').innerHTML = d.services.length ? d.services.map(function (s) { return '<div class="sb"><span>' + emo(s.service) + ' ' + esc(s.service) + '</span><div class="t"><i style="width:' + s.n / sm * 100 + '%"></i></div><b>' + s.n + '</b></div>'; }).join('') : '<div class="empty" style="padding:14px">Bugun hali zayavka yo\'q</div>';
    $('#recent').innerHTML = d.recent.length ? d.recent.map(leadItem).join('') : '<div class="empty"><big>📭</big>Hali zayavka yo\'q</div>';
    var bd = $('#badge'); bd.hidden = !t.wait; bd.textContent = t.wait;
    var h = new Date().getHours(); $('#helloT').textContent = (h < 12 ? 'Xayrli tong' : h < 18 ? 'Xayrli kun' : 'Xayrli kech') + ', ' + esc((S.me.name || 'admin').split(' ')[0]) + ' 👋';
    var tk = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
    $('#helloD').textContent = tk.getDate() + '-' + MONTHS[tk.getMonth()] + ', ' + WEEK[tk.getDay()];
  }

  /* ---------- leads ---------- */
  function leadItem(l, i) {
    return '<button class="item" data-lead="' + esc(l.id) + '" style="--d:' + Math.min(i || 0, 8) + '"><div class="av">' + emo(l.service) + '</div><div class="m"><b>' + esc(l.name) + '</b><small>' + esc(l.phone) + ' · ' + esc(l.service) + '</small></div><div class="r"><span class="pill ' + (l.status ? 'done' : 'new') + '">' + (l.status ? '🟢 Qabul' : '🟡 Yangi') + '</span><span>' + esc((l.time || '').slice(0, 5)) + ' · ' + esc(timeOf(l.time)) + '</span></div></button>';
  }
  var qTimer;
  function loadLeads(reset) {
    var box = $('#leadList'), off = reset ? 0 : S.leads.length;
    if (reset) { box.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>'; $('#leadMore').hidden = true; }
    return api('leads', { filter: S.leadF, q: $('#leadQ').value, offset: off, limit: 30 }).then(function (r) {
      S.leads = reset ? r.leads : S.leads.concat(r.leads); S.leadMore = r.more;
      box.innerHTML = S.leads.length ? S.leads.map(leadItem).join('') : '<div class="empty"><big>🔍</big>Hech narsa topilmadi</div>';
      $('#leadMore').hidden = !r.more; $('#leadsSub').textContent = S.leads.length + (r.more ? '+' : '') + ' ta ko\'rsatilmoqda';
    }).catch(fail);
  }
  $('#leadSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.leadF = b.dataset.f; $$('#leadSeg button').forEach(function (x) { x.classList.toggle('on', x === b); }); haptic(); loadLeads(true); });
  $('#leadQ').addEventListener('input', function () { clearTimeout(qTimer); qTimer = setTimeout(function () { loadLeads(true); }, 350); });
  $('#leadMore').onclick = function () { busy(this, loadLeads(false)); };
  $('#leadsCsv').onclick = function () { sendDoc(this, 'leadsCsv', '📎 Zayavkalar CSV botga yuborildi'); };

  function findLead(id) { return S.leads.concat(S.dash ? S.dash.recent : []).filter(function (l) { return l.id === id; })[0]; }
  function chatLink(u) { return u && u.username ? 'https://t.me/' + encodeURIComponent(u.username) : u && u.id ? 'tg://user?id=' + u.id : ''; }
  function openChat(href) { try { if (href.indexOf('https://t.me/') === 0 && tg && tg.openTelegramLink) tg.openTelegramLink(href); else window.location.href = href; } catch (e) { window.location.href = href; } }
  function copy(text) { try { navigator.clipboard.writeText(text).then(function () { toast('📋 Nusxalandi'); }, function () { toast(text); }); } catch (e) { toast(text); } }

  function leadSheet(l) {
    var link = chatLink(l.user);
    openSheet('<div class="sh-h"><div class="av">' + emo(l.service) + '</div><div><b>' + esc(l.name) + '</b><small>№ ' + esc(l.id) + (l.n ? ' · bugungi #' + l.n : '') + '</small></div></div>'
      + '<div class="kv"><div><span>📞 Telefon</span><b>' + esc(l.phone) + '</b></div><div><span>🩺 Xizmat</span><b>' + esc(l.service) + '</b></div><div><span>🌐 Manba</span><b>' + (l.source === 'bot' ? 'Telegram bot' : 'Sayt') + ' · ' + esc(String(l.lang || 'uz').toUpperCase()) + '</b></div></div>'
      + (l.note ? '<div class="note">💬 ' + esc(l.note) + '</div>' : '')
      + '<div class="tl"><div><i></i><span>Zayavka keldi<small>' + esc(l.time) + '</small></span></div>' + (l.status ? '<div><i class="g"></i><span>Qabul qilindi — ' + esc(l.status.by) + '<small>' + esc(l.status.at) + ' · javob vaqti: ' + dur(l.respMin) + '</small></span></div>' : '<div><i style="background:var(--amber);box-shadow:0 0 0 4px rgba(255,184,77,.18)"></i><span>Qabul qilinishi kutilmoqda</span></div>') + '</div>'
      + '<div class="sh-act"><a class="btn" href="tel:' + esc(l.phone.replace(/[^\d+]/g, '')) + '"><svg class="i"><use href="#i-phone"/></svg>Qo\'ng\'iroq</a>'
      + (link ? '<button class="btn ghost" id="shChat"><svg class="i"><use href="#i-chat"/></svg>Telegram</button>' : '<button class="btn ghost" id="shCopy"><svg class="i"><use href="#i-copy"/></svg>Raqamni nusxalash</button>')
      + (l.user && l.user.id ? '<button class="btn ghost full" id="shProfile">👤 Mijoz profili va tarixi</button>' : '')
      + '<button class="btn ' + (l.status ? 'warn' : 'ok') + ' full" id="shSt"><svg class="i"><use href="#i-' + (l.status ? 'refresh' : 'check') + '"/></svg>' + (l.status ? 'Qayta ochish' : 'Qabul qilindi') + '</button></div>');
    var c = $('#shChat'); if (c) c.onclick = function () { openChat(link); };
    var cp = $('#shCopy'); if (cp) cp.onclick = function () { copy(l.phone); };
    var pf = $('#shProfile'); if (pf) pf.onclick = function () { closeSheet(); setTimeout(function () { userSheet(String(l.user.id), l); }, 320); };
    $('#shSt').onclick = function () {
      busy(this, api('status', { id: l.id, done: !l.status })).then(function (r) {
        [S.leads, S.dash.recent].forEach(function (arr) { arr.forEach(function (x, i) { if (x.id === l.id) arr[i] = r.lead; }); });
        toast(r.lead.status ? '✅ Qabul qilindi' : '🔄 Qayta ochildi'); closeSheet();
        S.dash.today.wait += r.lead.status ? -1 : 1; S.dash.today.done += r.lead.status ? 1 : -1; renderDash();
        if (S.tab === 'leads') loadLeads(true);
      }).catch(fail);
    };
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-lead]'); if (b) { var l = findLead(b.dataset.lead); if (l) leadSheet(l); } });

  /* ---------- users ---------- */
  var uTimer;
  function sortedUsers() {
    var u = S.users.slice();
    if (S.userSort === 'active') u.sort(function (a, b) { return b.apps - a.apps; });
    if (S.userSort === 'blocked') u = u.filter(function (x) { return x.blocked; });
    return u;
  }
  function userItem(u, i) {
    return '<button class="item" data-user="' + esc(u.id) + '" style="--d:' + Math.min(i || 0, 8) + '"><div class="av">' + esc(initials(u.name)) + '</div><div class="m"><b>' + esc(u.name || 'Nomsiz') + '</b><small>' + esc(u.phone) + (u.username ? ' · @' + esc(u.username) : '') + '</small></div><div class="r">' + (u.blocked ? '<span class="pill bl">Bloklagan</span>' : '<span class="pill done">' + u.apps + ' ta</span>') + '<span>' + esc((u.lang || '').toUpperCase()) + '</span></div></button>';
  }
  function paintUsers() { var a = sortedUsers(); $('#userList').innerHTML = a.length ? a.map(userItem).join('') : '<div class="empty"><big>👥</big>Hech kim topilmadi</div>'; }
  function loadUsers() {
    $('#userList').innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
    return api('users', { q: $('#userQ').value }).then(function (r) { S.users = r.users; $('#usersCount').textContent = 'Mijozlar: ' + r.users.length; paintUsers(); }).catch(fail);
  }
  $('#userQ').addEventListener('input', function () { clearTimeout(uTimer); uTimer = setTimeout(loadUsers, 350); });
  $('#userSort').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.userSort = b.dataset.s; $$('#userSort button').forEach(function (x) { x.classList.toggle('on', x === b); }); haptic(); paintUsers(); });
  function userSheet(id, fromLead) {
    var u = S.users.filter(function (x) { return String(x.id) === id; })[0];
    if (!u) { return api('users', { q: '' }).then(function (r) { S.users = r.users; var f = S.users.filter(function (x) { return String(x.id) === id; })[0]; if (f) userSheet(id); else toast('Mijoz topilmadi', true); }).catch(fail); }
    var link = u.username ? 'https://t.me/' + encodeURIComponent(u.username) : 'tg://user?id=' + u.id;
    openSheet('<div class="sh-h"><div class="av">' + esc(initials(u.name)) + '</div><div><b>' + esc(u.name || 'Nomsiz') + '</b><small>ID ' + esc(u.id) + (u.blocked ? ' · botni bloklagan' : '') + '</small></div></div>'
      + '<div class="kv"><div><span>📞 Telefon</span><b>' + esc(u.phone) + '</b></div><div><span>✈️ Username</span><b>' + (u.username ? '@' + esc(u.username) : '—') + '</b></div><div><span>🌍 Til</span><b>' + esc((u.lang || '').toUpperCase()) + '</b></div><div><span>📝 Zayavkalar</span><b>' + u.apps + ' ta</b></div><div><span>🗓 Ro\'yxatdan o\'tgan</span><b>' + esc(u.regTime) + '</b></div></div>'
      + '<h4>Zayavkalar tarixi</h4><div class="mini" id="uHist"><div class="skel" style="height:44px"></div></div>'
      + '<div class="sh-act"><a class="btn" href="tel:' + esc(String(u.phone).replace(/[^\d+]/g, '')) + '"><svg class="i"><use href="#i-phone"/></svg>Qo\'ng\'iroq</a><button class="btn ghost" id="shChat"><svg class="i"><use href="#i-chat"/></svg>Telegram</button></div>'
      + (u.blocked ? '<p class="hint">Bu mijoz botni bloklagan, shaxsiy xabar yuborib bo\'lmaydi.</p>' : '<div class="dm"><h4>💬 Shaxsiy xabar (bot nomidan)</h4><textarea id="dmText" rows="3" maxlength="4000" placeholder="Mijozga xabar yozing…"></textarea><button class="btn" id="dmSend"><svg class="i"><use href="#i-send"/></svg>Yuborish</button></div>'));
    $('#shChat').onclick = function () { openChat(link); };
    api('user', { id: u.id }).then(function (r) {
      $('#uHist').innerHTML = r.leads.length ? r.leads.map(function (l) { return '<button data-lead2="' + esc(l.id) + '"><span>' + emo(l.service) + ' ' + esc(l.service) + '<br><small>' + esc(l.time) + '</small></span><span class="pill ' + (l.status ? 'done' : 'new') + '">' + (l.status ? 'Qabul' : 'Yangi') + '</span></button>'; }).join('') : '<small style="color:var(--mute)">Hali zayavka yo\'q</small>';
      S._uh = r.leads;
    }).catch(function () { $('#uHist').innerHTML = ''; });
    var ds = $('#dmSend'); if (ds) ds.onclick = function () {
      var text = $('#dmText').value.trim(); if (!text) return toast('Xabar yozing', true);
      confirmBox(u.name + ' ga xabar yuborilsinmi?', function () {
        busy(ds, api('dm', { id: u.id, text: text })).then(function () { toast('✅ Xabar yuborildi'); $('#dmText').value = ''; })
          .catch(function (e) { if (e.code === 'blocked') { toast('Mijoz botni bloklagan', true); u.blocked = true; } else if (e.code === 'duplicate') toast('Bu xabar hozirgina yuborilgan', true); else fail(e); });
      });
    };
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-user]'); if (b) return userSheet(b.dataset.user);
    var h = e.target.closest('[data-lead2]'); if (h && S._uh) { var l = S._uh.filter(function (x) { return x.id === h.dataset.lead2; })[0]; if (l) { closeSheet(); setTimeout(function () { leadSheet(l); }, 320); } }
  });
  function sendDoc(btn, action, msg) { busy(btn, api(action)).then(function () { toast(msg); }).catch(fail); }
  $('#csvBtn').onclick = function () { sendDoc(this, 'csv', '📎 Mijozlar CSV botga yuborildi'); };

  /* ---------- broadcast ---------- */
  var recipients = 0;
  function loadRecipients() { return api('recipients').then(function (r) { recipients = r.n; $('#bcHint').textContent = r.n ? 'Yuboriladi: ' + r.n + ' ta mijozga. Yuborilgach, natija botda ko\'rsatiladi.' : 'Hali ro\'yxatdan o\'tgan mijoz yo\'q.'; }).catch(fail); }
  function histItem(b) { return '<div class="hist"><b>' + esc(b.text || 'Xabar (rasm/fayl)') + '</b><small>' + esc((b.at || '').replace('T', ' ').slice(0, 16)) + ' UTC</small><div class="nums"><span class="g">✅ ' + b.ok + '</span>' + (b.fail ? '<span class="r">❌ ' + b.fail + '</span>' : '') + '<span>👥 ' + b.total + '</span></div></div>'; }
  function loadHist(sel, n) { return api('broadcasts').then(function (r) { var box = $(sel); box.innerHTML = r.items.length ? r.items.slice(0, n).map(histItem).join('') : '<div class="empty" style="padding:16px">Hali xabar yuborilmagan</div>'; }).catch(function () { /* jim */ }); }
  function prev() {
    var t = $('#bcText').value; $('#bcLen').textContent = t.length; $('#bcPrev').textContent = t.trim() || 'Xabar matni shu yerda ko\'rinadi…';
    var bt = $('#bcBtnText').value.trim(), bu = $('#bcBtnUrl').value.trim(), pb = $('#bcPrevBtn'); pb.hidden = !(bt && /^https:\/\//i.test(bu)); pb.textContent = '🔗 ' + bt;
  }
  ['#bcText', '#bcBtnText', '#bcBtnUrl'].forEach(function (s) { $(s).addEventListener('input', prev); });
  $('#bcSend').onclick = function () {
    var text = $('#bcText').value.trim(), btn = this;
    if (text.length < 2) return toast('Xabar matnini yozing', true);
    var bt = $('#bcBtnText').value.trim(), bu = $('#bcBtnUrl').value.trim();
    if ((bt || bu) && !(bt && /^https:\/\//i.test(bu))) return toast('Tugma uchun matn va https:// havola kerak', true);
    confirmBox('Xabar ' + recipients + ' ta mijozga yuboriladi. Qaytarib bo\'lmaydi. Yuboraymi?', function () {
      busy(btn, api('broadcast', { text: text, btnText: bt, btnUrl: bu })).then(function (r) { toast('📢 ' + r.total + ' ta mijozga yuborilmoqda…'); $('#bcText').value = ''; prev(); setTimeout(function () { loadHist('#bcHist', 5); }, 4000); })
        .catch(function (e) { if (e.code === 'no_recipients') toast('Yuboradigan mijoz yo\'q', true); else if (e.code === 'duplicate') toast('Bu xabar hozirgina yuborilgan', true); else fail(e); });
    });
  };

  /* ---------- sahifalar ---------- */
  function areaChart(el, data, tipEl) {
    var W = 340, H = 150, P = 10, n = data.length, vals = data.map(function (d) { return d.leads; }), max = Math.max.apply(null, vals.concat([1]));
    var x = function (i) { return P + i * (W - 2 * P) / Math.max(n - 1, 1); }, y = function (v) { return H - P - (v / max) * (H - 2 * P - 12); };
    var d = 'M' + x(0) + ' ' + y(vals[0]); for (var i = 1; i < n; i++) { var mx = (x(i - 1) + x(i)) / 2; d += ' C' + mx + ' ' + y(vals[i - 1]) + ' ' + mx + ' ' + y(vals[i]) + ' ' + x(i) + ' ' + y(vals[i]); }
    var area = d + ' L' + x(n - 1) + ' ' + (H - P) + ' L' + x(0) + ' ' + (H - P) + ' Z';
    var dots = n <= 31 ? data.map(function (p, i) { return '<circle cx="' + x(i) + '" cy="' + y(p.leads) + '" r="' + (i === n - 1 ? 4.5 : 2.4) + '" fill="' + (i === n - 1 ? '#4be08c' : '#0c2147') + '" stroke="#4be08c" stroke-width="1.6"/>'; }).join('') : '';
    el.innerHTML = '<svg class="area" viewBox="0 0 ' + W + ' ' + H + '"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4be08c" stop-opacity=".45"/><stop offset="1" stop-color="#4be08c" stop-opacity="0"/></linearGradient></defs>'
      + [0, .5, 1].map(function (f) { return '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + (P + 12 + f * (H - 2 * P - 12)) + '" y2="' + (P + 12 + f * (H - 2 * P - 12)) + '" stroke="rgba(255,255,255,.07)"/>'; }).join('')
      + '<path class="ar" d="' + area + '" fill="url(#ag)"/><path class="ln" pathLength="1" d="' + d + '"/>' + dots + '<line id="cur" y1="' + P + '" y2="' + (H - P) + '" stroke="rgba(255,255,255,.3)" stroke-dasharray="3 3" opacity="0"/></svg>';
    var svg = $('svg', el), cur = $('#cur', el);
    var show = function (cx) { var r = svg.getBoundingClientRect(), i = Math.max(0, Math.min(n - 1, Math.round(((cx - r.left) / r.width * W - P) / ((W - 2 * P) / Math.max(n - 1, 1))))), p = data[i]; cur.setAttribute('x1', x(i)); cur.setAttribute('x2', x(i)); cur.setAttribute('opacity', 1); tipEl.innerHTML = '<b>' + p.leads + ' ta zayavka</b> · ' + p.regs + ' yangi mijoz · ' + p.day.slice(5).replace('-', '.'); haptic(); };
    svg.addEventListener('pointermove', function (e) { show(e.clientX); }); svg.addEventListener('pointerdown', function (e) { show(e.clientX); });
    var last = data[n - 1]; tipEl.innerHTML = '<b>' + last.leads + ' ta zayavka</b> · bugun';
  }
  function donut(el, items) {
    var tot = items.reduce(function (a, b) { return a + b.n; }, 0) || 1, C = 2 * Math.PI * 40, off = 0;
    var seg = items.map(function (it) { var len = it.n / tot * C, s = '<circle cx="56" cy="56" r="40" stroke="' + it.c + '" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-off) + '"/>'; off += len; return s; }).join('');
    el.innerHTML = '<div class="donut"><svg viewBox="0 0 112 112"><circle cx="56" cy="56" r="40" stroke="rgba(255,255,255,.07)"/>' + seg + '</svg><ul>' + items.map(function (it) { return '<li><i style="background:' + it.c + '"></i>' + it.t + '<b>' + it.n + '</b></li>'; }).join('') + '</ul></div>';
  }
  function pageStats(box) {
    var days = 30;
    function load() {
      return api('stats', { days: days }).then(function (r) {
        var s = r.stats, t = s.totals, peak = s.byHour.indexOf(Math.max.apply(null, s.byHour.concat([1])));
        var sm = Math.max.apply(null, s.byService.map(function (x) { return x.n; }).concat([1])), hm = Math.max.apply(null, s.byHour.concat([1]));
        box.innerHTML = '<div class="seg" id="rg"><button data-d="7"' + (days === 7 ? ' class="on"' : '') + '>7 kun</button><button data-d="30"' + (days === 30 ? ' class="on"' : '') + '>30 kun</button><button data-d="90"' + (days === 90 ? ' class="on"' : '') + '>90 kun</button></div>'
          + '<div class="kpis"><div class="kpi" style="--c:var(--mint);--d:0"><small>📥 Zayavkalar</small><b>' + t.leads + '</b></div><div class="kpi" style="--c:var(--sky);--d:1"><small>🟢 Qabul foizi</small><b>' + (t.leads ? t.rate + '%' : '—') + '</b></div><div class="kpi" style="--c:var(--amber);--d:2"><small>⏱ O\'rtacha javob</small><b style="font-size:26px">' + (t.avgResp == null ? '—' : dur(t.avgResp)) + '</b></div><div class="kpi" style="--c:var(--sky);--d:3"><small>👥 Yangi mijoz</small><b>' + t.regs + '</b></div></div>'
          + '<div class="card"><div class="card-h"><b>Kunlik zayavkalar</b></div><div class="tip" id="tip"></div><div id="ac"></div></div>'
          + '<div class="card"><div class="card-h"><b>Manba</b></div><div id="dn"></div></div>'
          + '<div class="card"><div class="card-h"><b>Xizmatlar</b></div>' + (s.byService.length ? s.byService.map(function (x) { return '<div class="sb"><span>' + emo(x.service) + ' ' + esc(x.service) + '</span><div class="t"><i style="width:' + x.n / sm * 100 + '%"></i></div><b>' + x.n + '</b></div>'; }).join('') : '<div class="empty" style="padding:14px">Ma\'lumot yo\'q</div>') + '</div>'
          + '<div class="card"><div class="card-h"><b>Soatlar bo\'yicha</b><small>' + (t.leads ? 'eng faol: ' + String(peak).padStart(2, '0') + ':00' : '') + '</small></div><div class="hours">' + s.byHour.map(function (v, i) { return '<i class="' + (v === hm && v ? 'pk' : '') + '" style="height:' + Math.max(v / hm * 100, v ? 8 : 3) + '%;animation-delay:' + i * 20 + 'ms" title="' + i + ':00 — ' + v + '"></i>'; }).join('') + '</div><div class="hl"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div></div>'
          + '<div class="card"><div class="card-h"><b>Tillar</b></div><div class="tags">' + (Object.keys(s.byLang).map(function (k) { return '<span>' + { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' }[k] + ' ' + k.toUpperCase() + '<b>' + s.byLang[k] + '</b></span>'; }).join('') || '<small style="color:var(--mute)">Ma\'lumot yo\'q</small>') + '</div></div>'
          + (s.top.length ? '<div class="card"><div class="card-h"><b>🏆 Eng faol mijozlar</b></div>' + s.top.map(function (u) { return '<div class="sb" style="grid-template-columns:1fr auto"><span>' + esc(u.name) + '<br><small style="color:var(--mute)">' + esc(u.phone) + '</small></span><b>' + u.apps + ' ta</b></div>'; }).join('') + '</div>' : '')
          + '<p class="foot">Jami mijoz: ' + s.users.total + (s.users.blocked ? ' · bloklagan: ' + s.users.blocked : '') + '</p>';
        areaChart($('#ac', box), s.daily, $('#tip', box));
        donut($('#dn', box), [{ t: '🌐 Sayt', n: s.bySource.site || 0, c: '#4be08c' }, { t: '🤖 Telegram bot', n: s.bySource.bot || 0, c: '#7db4ff' }]);
        $('#rg', box).onclick = function (e) { var b = e.target.closest('button'); if (!b) return; days = +b.dataset.d; haptic(); box.innerHTML = '<div class="skel"></div>'; load(); };
      }).catch(fail);
    }
    load();
  }
  function pageHistory(box) { api('broadcasts').then(function (r) { box.innerHTML = r.items.length ? '<div class="list">' + r.items.map(histItem).join('') + '</div>' : '<div class="empty"><big>📭</big>Hali ommaviy xabar yuborilmagan</div>'; }).catch(fail); }
  function pageSecurity(box) {
    api('security').then(function (r) {
      box.innerHTML = '<div class="sec-note"><span>🔐</span><div><b>Panel faqat sizga ochiq</b><small>Telegram ID: ' + esc(r.ownerId) + '. Har bir so\'rov Telegram imzosi bilan tekshiriladi, boshqa adminlar ham kira olmaydi.</small></div></div>'
        + '<div class="sect"><b>🚨 Ruxsatsiz urinishlar</b></div>' + (r.sec.length ? r.sec.map(function (s) { return '<div class="hist"><b>' + esc(s.name || 'Noma\'lum') + (s.username ? ' (@' + esc(s.username) + ')' : '') + '</b><small>ID ' + esc(s.id) + ' · ' + esc(String(s.t).replace('T', ' ').slice(0, 16)) + ' UTC</small></div>'; }).join('<div style="height:8px"></div>') : '<div class="empty" style="padding:18px">Hech qanday urinish bo\'lmagan ✅</div>')
        + '<div class="sect"><b>🤖 Bot faoliyati (oxirgi 40)</b></div>' + (r.log.length ? r.log.map(function (e) { var oc = String(e.outcome || ''), cl = oc === 'ok' ? 'ok' : oc.indexOf('dup') === 0 ? 'dup' : 'er'; return '<div class="logl"><span>' + esc(e.t) + '</span><span>' + esc(String(e.what == null ? '' : e.what).slice(0, 24)) + '</span><span class="' + cl + '">' + esc(oc.slice(0, 30)) + '</span>' + (e.ms ? '<span>' + e.ms + 'ms</span>' : '') + '</div>'; }).join('') : '<div class="empty" style="padding:18px">Jurnal bo\'sh</div>');
    }).catch(fail);
  }
  function renderAdmins(box) {
    box.innerHTML = '<div class="card"><div class="card-h"><b>Adminlar</b><small>' + S.admins.length + ' ta</small></div>' + S.admins.map(function (a) {
      var me = String(a.id) === String(S.me.id);
      return '<div class="adm"><div class="av" style="width:38px;height:38px;font-size:16px;border-radius:12px">👮</div><div><code>' + esc(a.id) + '</code><br><small style="color:var(--mute)">' + (a.main ? 'asosiy admin (panel egasi)' : 'admin · panelga kira olmaydi') + (me ? ' · siz' : '') + '</small></div><span class="sp"></span>' + (!a.main ? '<button class="x" data-rm="' + esc(a.id) + '" aria-label="O\'chirish"><svg class="i"><use href="#i-trash"/></svg></button>' : '') + '</div>';
    }).join('') + '<div class="add"><input id="admId" inputmode="numeric" placeholder="Telegram ID (masalan 123456789)"><button class="btn sm" id="admBtn">Qo\'shish</button></div><p class="hint">Qo\'shilgan admin yangi zayavkalar va kunlik hisobotni oladi, lekin <b>boshqaruv paneliga kira olmaydi</b>. Yangi admin ID sini bilish uchun u botga <b>/id</b> yuborsin.</p></div>';
    $$('[data-rm]', box).forEach(function (b) { b.onclick = function () { confirmBox(b.dataset.rm + ' adminlikdan olinsinmi?', function () { api('removeAdmin', { id: b.dataset.rm }).then(function (r) { S.admins = r.admins; renderAdmins(box); toast('Admin o\'chirildi'); }).catch(fail); }); }; });
    $('#admBtn', box).onclick = function () {
      var id = $('#admId', box).value.trim(); if (!/^\d{3,15}$/.test(id)) return toast('ID faqat raqamlardan iborat', true);
      busy(this, api('addAdmin', { id: id })).then(function (r) { S.admins = r.admins; renderAdmins(box); toast(r.added ? '✅ Admin qo\'shildi' : 'Bu odam allaqachon admin'); }).catch(fail);
    };
  }
  function pageAdmins(box) { api('admins').then(function (r) { S.admins = r.admins; renderAdmins(box); }).catch(fail); }
  function pageBackup(box) {
    box.innerHTML = '<div class="card"><div class="card-h"><b>Eksport</b></div><div class="actions"><button class="btn ghost" id="b1"><svg class="i"><use href="#i-file"/></svg>Zayavkalar — CSV (butun tarix)</button><button class="btn ghost" id="b2"><svg class="i"><use href="#i-file"/></svg>Mijozlar — CSV</button><button class="btn ghost" id="b3"><svg class="i"><use href="#i-chart"/></svg>Bugungi hisobotni yuborish</button></div></div>'
      + '<div class="card"><div class="card-h"><b>Zaxira nusxa</b></div><p class="hint" style="margin:0 0 12px">Hamma mijoz va zayavkalar JSON fayl sifatida botga yuboriladi. Telegram chatida xavfsiz saqlanadi.</p><button class="btn" id="b4" style="width:100%"><svg class="i"><use href="#i-file"/></svg>💾 To\'liq zaxira nusxa</button></div><p class="hint">Barcha fayllar sizning bot chatingizga keladi. Kunlik hisobot har kuni 20:00 da o\'zi yuboriladi.</p>';
    $('#b1', box).onclick = function () { sendDoc(this, 'leadsCsv', '📎 Zayavkalar CSV botga yuborildi'); };
    $('#b2', box).onclick = function () { sendDoc(this, 'csv', '📎 Mijozlar CSV botga yuborildi'); };
    $('#b3', box).onclick = function () { sendDoc(this, 'report', '📊 Hisobot botga yuborildi'); };
    $('#b4', box).onclick = function () { sendDoc(this, 'backup', '💾 Zaxira nusxa botga yuborildi'); };
  }

  /* ---------- boot ---------- */
  function refresh() {
    var b = $('#refresh'); b.classList.add('spin');
    return Promise.all([api('dashboard'), api('stats', { days: 7 })]).then(function (r) { S.dash = r[0].dash; S.ins = r[1].stats; renderDash(); if (S.tab === 'leads') loadLeads(true); if (S.tab === 'users') loadUsers(); }).catch(fail).then(function () { b.classList.remove('spin'); });
  }
  $('#refresh').onclick = function () { haptic(); refresh(); };
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { if ($('#sheet').classList.contains('on')) closeSheet(); else closePage(); } });

  if (!tg || !tg.initData) { gate('Telegram ichida oching', "Bu admin panel faqat Telegram botidagi «⚙️ Panel» tugmasi orqali ochiladi."); return; }
  try { tg.ready(); tg.expand(); tg.setHeaderColor && tg.setHeaderColor('#050f22'); tg.setBackgroundColor && tg.setBackgroundColor('#050f22'); tg.disableVerticalSwipes && tg.disableVerticalSwipes(); } catch (e) { /* ixtiyoriy */ }
  api('init').then(function (r) {
    S.me = r.me; S.admins = r.admins; S.dash = r.dash; S.services = r.dash.allServices || [];
    $('#meName').textContent = (r.me.name || 'Admin') + ' · egasi';
    $('#gate').hidden = true; $('#app').hidden = false;
    renderDash();
    api('stats', { days: 7 }).then(function (x) { S.ins = x.stats; renderDash(); }).catch(function () { /* ixtiyoriy */ });
    setInterval(function () { if (document.visibilityState === 'visible' && S.tab === 'home' && !S.page) api('dashboard').then(function (x) { S.dash = x.dash; renderDash(); }).catch(function () { /* jim */ }); }, 45000);
  }).catch(fail);
})();
