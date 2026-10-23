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
  var S = { me: null, dash: null, admins: [], services: [], leadF: 'all', leads: [], users: [], tab: 'home', loaded: {} };

  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var haptic = function (t) { try { if (tg && tg.HapticFeedback) { t === 'ok' ? tg.HapticFeedback.notificationOccurred('success') : t === 'err' ? tg.HapticFeedback.notificationOccurred('error') : tg.HapticFeedback.selectionChanged(); } } catch (e) { /* ixtiyoriy */ } };
  var emo = function (service) { var i = S.services.indexOf(service); return EMO[i] || '🩺'; };
  var initials = function (n) { return (String(n || '?').trim()[0] || '?').toUpperCase(); };

  function toast(msg, err) { var t = $('#toast'); t.textContent = msg; t.className = 'toast on' + (err ? ' err' : ''); haptic(err ? 'err' : 'ok'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.className = 'toast'; }, 2600); }
  function gate(title, text) { $('#gateT').textContent = title; $('#gateP').textContent = text; $('#gate').hidden = false; $('#app').hidden = true; }

  function api(action, data) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tg-Init-Data': (tg && tg.initData) || '' }, body: JSON.stringify(Object.assign({ action: action }, data || {})) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (r.ok) return j; var e = new Error(j.error || r.status); e.status = r.status; e.code = j.error; throw e; }); });
  }
  function fail(e) {
    if (e.status === 401) return gate('Qayta oching', "Sessiya eskirgan. Panelni botdagi «⚙️ Panel» tugmasi orqali qaytadan oching.");
    if (e.status === 403) return gate('Ruxsat yo\'q', 'Bu panel faqat adminlar uchun.');
    toast('Xatolik: ' + (e.code || e.message), true);
  }

  /* ---------- navigation ---------- */
  function go(tab) {
    S.tab = tab; haptic();
    $$('.tab').forEach(function (s) { s.classList.toggle('on', s.dataset.tab === tab); });
    $$('#tabbar button').forEach(function (b) { b.classList.toggle('on', b.dataset.go === tab); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'leads') loadLeads();
    if (tab === 'users') loadUsers();
    if (tab === 'send') loadRecipients();
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

  /* ---------- dashboard ---------- */
  function counter(el, to) { var t0 = performance.now(), d = 700; (function f(t) { var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(f); })(t0); }
  function renderDash() {
    var d = S.dash, t = d.today;
    var k = [
      ['📥', 'Bugungi zayavka', t.leads, 'var(--mint)', ''],
      ['🟡', 'Kutayotgan', t.wait, 'var(--amber)', t.wait ? 'hot' : ''],
      ['🟢', 'Qabul qilingan', t.done, 'var(--mint)', ''],
      ['👥', 'Yangi mijoz', t.regs, 'var(--sky)', '']
    ];
    $('#kpis').innerHTML = k.map(function (x, i) { return '<div class="kpi ' + x[4] + '" style="--c:' + x[3] + ';--d:' + i + '"><small>' + x[0] + ' ' + x[1] + '</small><b data-n="' + x[2] + '">0</b>' + (i === 0 ? '<em>sayt ' + t.site + ' · bot ' + t.bot + '</em>' : i === 3 ? '<em>jami ' + d.users.total + (d.users.blocked ? ' · ' + d.users.blocked + ' bloklagan' : '') + '</em>' : '') + '</div>'; }).join('');
    $$('#kpis b').forEach(function (b) { counter(b, +b.dataset.n); });
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
    return '<button class="item" data-lead="' + esc(l.id) + '" style="--d:' + (i || 0) + '"><div class="av">' + emo(l.service) + '</div><div class="m"><b>' + esc(l.name) + '</b><small>' + esc(l.phone) + ' · ' + esc(l.service) + '</small></div><div class="r"><span class="pill ' + (l.status ? 'done' : 'new') + '">' + (l.status ? '🟢 Qabul' : '🟡 Yangi') + '</span><span>' + esc(((l.time || '').split('·')[1] || '').trim()) + '</span></div></button>';
  }
  var qTimer;
  function loadLeads() {
    var box = $('#leadList'); box.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
    return api('leads', { filter: S.leadF, q: $('#leadQ').value }).then(function (r) {
      S.leads = r.leads;
      box.innerHTML = r.leads.length ? r.leads.map(leadItem).join('') : '<div class="empty"><big>🔍</big>Hech narsa topilmadi</div>';
    }).catch(fail);
  }
  $('#leadSeg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.leadF = b.dataset.f; $$('#leadSeg button').forEach(function (x) { x.classList.toggle('on', x === b); }); haptic(); loadLeads(); });
  $('#leadQ').addEventListener('input', function () { clearTimeout(qTimer); qTimer = setTimeout(loadLeads, 350); });

  function findLead(id) { return S.leads.concat(S.dash ? S.dash.recent : []).filter(function (l) { return l.id === id; })[0]; }
  function openSheet(html) { $('#sheetBody').innerHTML = html; $('#scrim').hidden = false; requestAnimationFrame(function () { $('#sheet').classList.add('on'); }); haptic(); }
  function closeSheet() { $('#sheet').classList.remove('on'); setTimeout(function () { $('#scrim').hidden = true; }, 300); }
  $('#scrim').addEventListener('click', closeSheet);
  function chatLink(u) { return u && u.username ? 'https://t.me/' + encodeURIComponent(u.username) : u && u.id ? 'tg://user?id=' + u.id : ''; }
  function openChat(href) { try { if (href.indexOf('https://t.me/') === 0 && tg && tg.openTelegramLink) tg.openTelegramLink(href); else window.location.href = href; } catch (e) { window.location.href = href; } }

  function leadSheet(l) {
    var link = chatLink(l.user);
    openSheet('<div class="sh-h"><div class="av">' + emo(l.service) + '</div><div><b>' + esc(l.name) + '</b><small>№ ' + esc(l.id) + (l.n ? ' · bugungi #' + l.n : '') + '</small></div></div>'
      + '<div class="kv"><div><span>📞 Telefon</span><b>' + esc(l.phone) + '</b></div><div><span>🩺 Xizmat</span><b>' + esc(l.service) + '</b></div><div><span>🌐 Manba</span><b>' + (l.source === 'bot' ? 'Telegram bot' : 'Sayt') + ' · ' + esc(String(l.lang || 'uz').toUpperCase()) + '</b></div><div><span>🕒 Vaqt</span><b>' + esc(l.time) + '</b></div><div><span>Holat</span><b>' + (l.status ? '🟢 ' + esc(l.status.by) + ' · ' + esc(l.status.at) : '🟡 Yangi') + '</b></div></div>'
      + (l.note ? '<div class="note">💬 ' + esc(l.note) + '</div>' : '')
      + '<div class="sh-act"><a class="btn" href="tel:' + esc(l.phone.replace(/[^\d+]/g, '')) + '"><svg class="i"><use href="#i-phone"/></svg>Qo\'ng\'iroq</a>'
      + (link ? '<button class="btn ghost" id="shChat"><svg class="i"><use href="#i-chat"/></svg>Telegram</button>' : '<button class="btn ghost" disabled><svg class="i"><use href="#i-chat"/></svg>Telegram yo\'q</button>')
      + '<button class="btn ' + (l.status ? 'warn' : 'ok') + ' full" id="shSt"><svg class="i"><use href="#i-' + (l.status ? 'refresh' : 'check') + '"/></svg>' + (l.status ? 'Qayta ochish' : 'Qabul qilindi') + '</button></div>');
    var c = $('#shChat'); if (c) c.onclick = function () { openChat(link); };
    $('#shSt').onclick = function () {
      var b = this; b.disabled = true;
      api('status', { id: l.id, done: !l.status }).then(function (r) {
        [S.leads, S.dash.recent].forEach(function (arr) { arr.forEach(function (x, i) { if (x.id === l.id) arr[i] = r.lead; }); });
        toast(r.lead.status ? '✅ Qabul qilindi' : '🔄 Qayta ochildi'); closeSheet();
        S.dash.today.wait += r.lead.status ? -1 : 1; S.dash.today.done += r.lead.status ? 1 : -1; renderDash();
        if (S.tab === 'leads') loadLeads();
      }).catch(function (e) { b.disabled = false; fail(e); });
    };
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-lead]'); if (b) { var l = findLead(b.dataset.lead); if (l) leadSheet(l); } });

  /* ---------- users ---------- */
  var uTimer;
  function userItem(u, i) {
    return '<button class="item" data-user="' + esc(u.id) + '" style="--d:' + (i || 0) + '"><div class="av">' + esc(initials(u.name)) + '</div><div class="m"><b>' + esc(u.name || 'Nomsiz') + '</b><small>' + esc(u.phone) + (u.username ? ' · @' + esc(u.username) : '') + '</small></div><div class="r">' + (u.blocked ? '<span class="pill bl">Bloklagan</span>' : '<span class="pill done">' + u.apps + ' ta</span>') + '<span>' + esc((u.lang || '').toUpperCase()) + '</span></div></button>';
  }
  function loadUsers() {
    var box = $('#userList'); box.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
    return api('users', { q: $('#userQ').value }).then(function (r) {
      S.users = r.users; $('#usersCount').textContent = 'Mijozlar: ' + r.users.length + (S.dash && !$('#userQ').value ? '' : '');
      box.innerHTML = r.users.length ? r.users.map(userItem).join('') : '<div class="empty"><big>👥</big>Hali ro\'yxatdan o\'tgan mijoz yo\'q</div>';
    }).catch(fail);
  }
  $('#userQ').addEventListener('input', function () { clearTimeout(uTimer); uTimer = setTimeout(loadUsers, 350); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-user]'); if (!b) return;
    var u = S.users.filter(function (x) { return String(x.id) === b.dataset.user; })[0]; if (!u) return;
    var link = u.username ? 'https://t.me/' + encodeURIComponent(u.username) : 'tg://user?id=' + u.id;
    openSheet('<div class="sh-h"><div class="av">' + esc(initials(u.name)) + '</div><div><b>' + esc(u.name || 'Nomsiz') + '</b><small>ID ' + esc(u.id) + (u.blocked ? ' · botni bloklagan' : '') + '</small></div></div>'
      + '<div class="kv"><div><span>📞 Telefon</span><b>' + esc(u.phone) + '</b></div><div><span>✈️ Username</span><b>' + (u.username ? '@' + esc(u.username) : '—') + '</b></div><div><span>🌍 Til</span><b>' + esc((u.lang || '').toUpperCase()) + '</b></div><div><span>📝 Zayavkalar</span><b>' + u.apps + ' ta' + (u.lastService ? ' · oxirgisi: ' + esc(u.lastService) : '') + '</b></div><div><span>🗓 Ro\'yxatdan o\'tgan</span><b>' + esc(u.regTime) + '</b></div></div>'
      + '<div class="sh-act"><a class="btn" href="tel:' + esc(String(u.phone).replace(/[^\d+]/g, '')) + '"><svg class="i"><use href="#i-phone"/></svg>Qo\'ng\'iroq</a><button class="btn ghost" id="shChat"><svg class="i"><use href="#i-chat"/></svg>Telegram</button></div>');
    $('#shChat').onclick = function () { openChat(link); };
  });
  function sendDoc(btn, action, msg) { btn.disabled = true; api(action).then(function () { toast(msg); }).catch(fail).then(function () { btn.disabled = false; }); }
  $('#csvBtn').onclick = function () { sendDoc(this, 'csv', '📎 CSV botga yuborildi'); };
  $('#csv2Btn').onclick = function () { sendDoc(this, 'csv', '📎 CSV botga yuborildi'); };
  $('#repBtn').onclick = function () { sendDoc(this, 'report', '📊 Hisobot botga yuborildi'); };

  /* ---------- broadcast ---------- */
  var recipients = 0;
  function loadRecipients() { return api('recipients').then(function (r) { recipients = r.n; $('#bcHint').textContent = r.n ? 'Yuboriladi: ' + r.n + ' ta mijozga. Yuborilgach, natija botda ko\'rsatiladi.' : 'Hali ro\'yxatdan o\'tgan mijoz yo\'q.'; }).catch(fail); }
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
    var run = function () {
      btn.disabled = true;
      api('broadcast', { text: text, btnText: bt, btnUrl: bu }).then(function (r) { toast('📢 ' + r.total + ' ta mijozga yuborilmoqda…'); $('#bcText').value = ''; prev(); })
        .catch(function (e) { if (e.code === 'no_recipients') toast('Yuboradigan mijoz yo\'q', true); else if (e.code === 'duplicate') toast('Bu xabar hozirgina yuborilgan', true); else fail(e); })
        .then(function () { btn.disabled = false; });
    };
    var msg = 'Xabar ' + recipients + ' ta mijozga yuboriladi. Qaytarib bo\'lmaydi. Yuboraymi?';
    if (tg && tg.showConfirm) tg.showConfirm(msg, function (ok) { if (ok) run(); }); else if (window.confirm(msg)) run();
  };

  /* ---------- settings / admins ---------- */
  function renderAdmins() {
    $('#admCount').textContent = S.admins.length + ' ta';
    $('#admList').innerHTML = S.admins.map(function (a) {
      var me = String(a.id) === String(S.me.id);
      return '<div class="adm"><div class="av" style="width:38px;height:38px;font-size:16px;border-radius:12px">👮</div><div><code>' + esc(a.id) + '</code><br><small style="color:var(--mute)">' + (a.main ? 'asosiy admin' : 'admin') + (me ? ' · siz' : '') + '</small></div><span class="sp"></span>'
        + (S.me.main && !a.main ? '<button class="x" data-rm="' + esc(a.id) + '" aria-label="O\'chirish"><svg class="i"><use href="#i-trash"/></svg></button>' : '') + '</div>';
    }).join('');
    $('#admAdd').hidden = !S.me.main;
    $('#admHint').hidden = !S.me.main;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-rm]'); if (!b) return;
    var go2 = function () { api('removeAdmin', { id: b.dataset.rm }).then(function (r) { S.admins = r.admins; renderAdmins(); toast('Admin o\'chirildi'); }).catch(fail); };
    var m = b.dataset.rm + ' adminlikdan olinsinmi?'; if (tg && tg.showConfirm) tg.showConfirm(m, function (ok) { if (ok) go2(); }); else if (window.confirm(m)) go2();
  });
  $('#admBtn').onclick = function () {
    var id = $('#admId').value.trim(); if (!/^\d{3,15}$/.test(id)) return toast('ID faqat raqamlardan iborat', true);
    var b = this; b.disabled = true;
    api('addAdmin', { id: id }).then(function (r) { S.admins = r.admins; renderAdmins(); $('#admId').value = ''; toast(r.added ? '✅ Admin qo\'shildi' : 'Bu odam allaqachon admin'); }).catch(fail).then(function () { b.disabled = false; });
  };

  /* ---------- boot ---------- */
  function refresh() {
    var b = $('#refresh'); b.classList.add('spin');
    return api('dashboard').then(function (r) { S.dash = r.dash; renderDash(); if (S.tab === 'leads') loadLeads(); if (S.tab === 'users') loadUsers(); }).catch(fail).then(function () { b.classList.remove('spin'); });
  }
  $('#refresh').onclick = function () { haptic(); refresh(); };
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

  if (!tg || !tg.initData) { gate('Telegram ichida oching', "Bu admin panel faqat Telegram botidagi «⚙️ Panel» tugmasi orqali ochiladi."); return; }
  try { tg.ready(); tg.expand(); tg.setHeaderColor && tg.setHeaderColor('#050f22'); tg.setBackgroundColor && tg.setBackgroundColor('#050f22'); tg.disableVerticalSwipes && tg.disableVerticalSwipes(); } catch (e) { /* ixtiyoriy */ }
  api('init').then(function (r) {
    S.me = r.me; S.admins = r.admins; S.dash = r.dash; S.services = r.dash.allServices || [];
    $('#meName').textContent = (r.me.name || 'Admin') + (r.me.main ? ' · asosiy admin' : ' · admin');
    $('#gate').hidden = true; $('#app').hidden = false;
    renderDash(); renderAdmins();
    setInterval(function () { if (document.visibilityState === 'visible' && S.tab === 'home') api('dashboard').then(function (x) { S.dash = x.dash; renderDash(); }).catch(function () { /* jim */ }); }, 45000);
  }).catch(fail);
})();
