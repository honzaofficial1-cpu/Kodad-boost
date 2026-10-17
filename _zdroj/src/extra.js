// ===================== REKORDY · ODPOČET · SOUHRN TÝDNE =====================
// rekord = vyšší váha než kdykoli předtím, nebo stejná maximální váha s více opakováními
function bestBefore(exId, s) {
  const ex = exById(exId); let b = null;
  for (const o of finished()) {
    if (o.id === s.id || o.start >= s.start) continue;
    const e = o.entries.find(x => x.exId === exId); if (!e) continue;
    usedSets(e, ex).forEach(st => { if (!hasData(st, ex)) return; const w = num(st.w), r = repsOf(st, ex); if (!b || w > b.w + 1e-9 || (Math.abs(w - b.w) < 1e-9 && r > b.r)) b = { w, r }; });
  }
  return b;
}
function isPR(st, ex, best) { if (!best || !hasData(st, ex)) return false; const w = num(st.w), r = repsOf(st, ex); return w > best.w + 1e-9 || (Math.abs(w - best.w) < 1e-9 && r > best.r); }
function sessionPRs(s) {
  const out = [];
  for (const e of s.entries) {
    const ex = exById(e.exId); if (!ex) continue; const best = bestBefore(e.exId, s); if (!best) continue;
    let top = null; usedSets(e, ex).forEach(st => { if (isPR(st, ex, best)) { const w = num(st.w), r = repsOf(st, ex); if (!top || w > top.w || (w === top.w && r > top.r)) top = { w, r }; } });
    if (top) out.push({ ex, ...top, pw: best.w, pr: best.r });
  }
  return out;
}
const arH = (a, pr) => `<b class="ar ${pr ? 'pr' : a || ''}" data-ar>${pr ? 'PR' : ARROW[a] || ''}</b>`;

// ---------- odpočet před pracovní sérií ----------
const fcd = sec => `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
const cdOf = ex => ex.cd || S.settings.cd || 120;
let actx = null;
function armAudio() { if (S.settings.cdSound === false) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); const o = actx.createOscillator(), g = actx.createGain(); g.gain.value = 0.0001; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.01); } catch (e) { } }
function beep() {
  if (S.settings.cdSound === false || !actx) return;
  try { if (actx.state === 'suspended') actx.resume(); const t = actx.currentTime + .05; [0, .3, .6].forEach((d, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = i === 2 ? 1320 : 880; o.connect(g); g.connect(actx.destination); g.gain.setValueAtTime(.0001, t + d); g.gain.exponentialRampToValueAtTime(.45, t + d + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d + .24); o.start(t + d); o.stop(t + d + .3); }); } catch (e) { }
}
let cdMode = null;
function cdPaint() {
  let el = $('#cdbar');
  if (!S.cd || view.n !== 'workout') { if (el) { el.remove(); cdMode = null; } return; }
  if (!el) { el = document.createElement('div'); el.id = 'cdbar'; document.body.appendChild(el); cdMode = null; }
  const rem = Math.ceil((S.cd.end - Date.now()) / 1000);
  if (rem <= 0) {
    if (!S.cd.done) { S.cd.done = true; save(); beep(); }
    if (-rem > 120) { S.cd = null; save(); el.remove(); cdMode = null; return; }
    if (cdMode !== 'go') { cdMode = 'go'; el.className = 'cdbar go'; el.innerHTML = `<div class="t"><small>${esc(S.cd.name)}</small><b>Pracovní série – jdi na to</b></div><button class="cx" data-a="cd-stop" aria-label="Hotovo">${ico('check')}</button>`; }
    return;
  }
  if (cdMode !== 'run') { cdMode = 'run'; el.className = 'cdbar'; el.innerHTML = `<div class="pg"></div><div class="t"><small>Pracovní série za · ${esc(S.cd.name)}</small><b data-cd></b></div><button class="ad" data-a="cd-add">+30 s</button><button class="cx" data-a="cd-stop" aria-label="Zrušit odpočet">${ico('x')}</button>`; }
  $('[data-cd]', el).textContent = fcd(rem);
  $('.pg', el).style.width = `${Math.min(100, (1 - rem / S.cd.total) * 100)}%`;
}
setInterval(cdPaint, 400);

// ---------- souhrn týdne (jen na vyžádání z kalendáře) ----------
function weekSheet(monK) {
  const mon = pdate(monK); const ks = [...Array(7)].map((_, i) => dkey(addDays(mon, i)));
  const ses = ks.map(sessionOn).filter(s => s && s.end);
  const mins = ses.reduce((a, s) => a + fmin(s.end - s.start), 0);
  const acts = ks.flatMap(actsOn);
  const prs = ses.flatMap(s => sessionPRs(s));
  const ups = ses.reduce((a, s) => a + stats(s).up, 0);
  const perf = avgOf(ses.map(s => s.perf));
  const bd = BD().days;
  const aw = avgOf(ks.map(k => bd[k]?.weight)), pw = avgOf(ks.map(k => bd[dkey(addDays(pdate(k), -7))]?.weight));
  const ch = aw != null && pw != null ? aw - pw : null;
  const st = bStart(); const t = st ? pace(weekNo(dkey(addDays(mon, 3)), st)) : null;
  const tp = ch == null ? null : !t ? ['idle', 'adaptace'] : ch < t[0] ? ['warn', 'pod cílem'] : ch > t[1] + .05 ? ['bad', 'nad cílem'] : ['good', 'v cílovém tempu'];
  const adh = avgOf(ks.map(k => adhVal(bd[k]?.adherence)));
  const en = avgOf(ks.map(k => bd[k]?.energy)), sl = avgOf(ks.map(k => bd[k]?.sleep));
  const sick = ks.filter(k => S.days[k]?.sick).length;
  const exIds = [...new Set(ses.flatMap(s => s.entries.map(e => e.exId)))];
  const stag = exIds.map(id => ({ ex: exById(id), tr: trendOf(id) })).filter(x => x.ex && x.tr.t.startsWith('stagnace'));
  const ac = {}; acts.forEach(a => { const n = a.type === 'other' ? (a.label || 'Jiné') : ACT_TYPES[a.type]?.name || a.type; ac[n] = (ac[n] || 0) + 1; });
  const goal = S.settings.weekGoal || 4; const sun = addDays(mon, 6);
  const row = (k, v) => `<div class="wrow"><span>${k}</span><b>${v}</b></div>`;
  sheet(`<div class="wkh"><button class="round" style="width:44px;height:44px" data-a="wk" data-k="${dkey(addDays(mon, -7))}" aria-label="Předchozí týden">${ico('back')}</button>
      <div><h2>Týden ${isoWeek(mon)}</h2><p class="mut" style="margin:2px 0 0">${mon.getDate()}. ${mon.getMonth() + 1}. – ${sun.getDate()}. ${sun.getMonth() + 1}.</p></div>
      <button class="round" style="width:44px;height:44px" data-a="wk" data-k="${dkey(addDays(mon, 7))}" aria-label="Další týden" ${dkey(addDays(mon, 7)) > today() ? 'disabled' : ''}>${ico('chev')}</button></div>
    <div class="stat3" style="margin-top:16px;background:var(--card)"><div><span>Tréninky</span><b>${ses.length}/${goal}</b></div><div><span>V gymu</span><b>${kg(Math.round(mins / 6) / 10)}<small style="font-size:13px"> h</small></b></div><div><span>Zlepšení</span><b class="up">${ups}</b></div></div>
    ${prs.length ? `<div class="lbl" style="margin:20px 4px 8px">Rekordy</div><div class="list">${prs.map(p => `<div class="li prli"><span class="ic">${ico('medal')}</span><div class="t"><b>${esc(p.ex.name)}</b><small>${kg(p.pw)} × ${p.pr} → <b>${kg(p.w)} × ${p.r}</b></small></div></div>`).join('')}</div>` : ''}
    <div class="lbl" style="margin:20px 4px 8px">Tělo</div><div class="card wcard">
      ${row('Ø ranní váha', aw == null ? '–' : `${nf(aw, 1)} kg`)}
      ${row('Změna proti minulému týdnu', ch == null ? '–' : `${sg(ch, 2)} kg ${tp ? `<i class="stp ${tp[0]}">${tp[1]}</i>` : ''}`)}
      ${row('Jídelníček dodržen', adh == null ? '–' : Math.round(adh * 100) + ' %')}
      ${row('Ø spánek', sl == null ? '–' : nf(sl, 1) + ' h')}
      ${row('Ø výkon v tréninku', perf == null ? '–' : nf(perf, 1) + ' / 5')}
      ${sick ? row('Nemoc', `${sick} ${sick === 1 ? 'den' : sick < 5 ? 'dny' : 'dní'}`) : ''}
    </div>
    ${Object.keys(ac).length ? `<div class="lbl" style="margin:20px 4px 8px">Aktivity</div><div class="chips">${Object.entries(ac).map(([n, c]) => `<span class="chip">${esc(n)} ${c}×</span>`).join('')}</div>` : ''}
    ${stag.length ? `<div class="lbl" style="margin:20px 4px 8px">Stagnuje</div><div class="chips">${stag.map(x => `<span class="chip down">${esc(x.ex.name)} · ${x.tr.t}</span>`).join('')}</div>` : ''}
    ${ses.length ? `<div class="lbl" style="margin:20px 4px 8px">Tréninky</div><div class="list">${ses.map(s => `<button class="li" data-a="open-sum" data-id="${s.id}"><div class="t"><b>${esc(s.name)}</b><small>${fday(s.date)} · ${fmin(s.end - s.start)} min${s.perf ? ` · výkon ${s.perf}/5` : ''}</small></div><span class="chev">${ico('chev')}</span></button>`).join('')}</div>` : ''}
    <div class="actions"><button class="btn white" data-a="close">Zavřít</button></div>`);
}

Object.assign(A, {
  'cd-start': b => { const s = sesById(view.id); const e = s.entries[+b.closest('.ex').dataset.idx]; const ex = exById(e.exId); const sec = cdOf(ex); S.cd = { end: Date.now() + sec * 1000, total: sec, name: ex.name, done: false }; save(); armAudio(); cdPaint(); },
  'cd-add': () => { if (!S.cd) return; S.cd.end += 30000; S.cd.total += 30; save(); cdPaint(); },
  'cd-stop': () => { S.cd = null; save(); cdPaint(); },
  'e-cd': b => { readExDraft(); exDraft.cd = +b.dataset.v || null; drawExEdit(); },
  'set-cd': b => { S.settings.cd = +b.dataset.v; save(true); render(); },
  'tog-sound': () => { S.settings.cdSound = S.settings.cdSound === false; save(true); render(); },
  perf: b => { const s = sesById(view.id); s.perf = s.perf === +b.dataset.v ? null : +b.dataset.v; $$('[data-a=perf]').forEach(x => x.classList.toggle('on', +x.dataset.v === s.perf)); save(); },
  wk: b => weekSheet(b.dataset.k),
  'week-sum': () => weekSheet(dkey(monday(new Date()))),
});

// ---------- ranní upozornění (web push) ----------
const VAPID_PUB = 'BLw9-Y2wVl1XeeGYVOkouEb6L_Ncb6LDGH4nr0RBHOYy4Q03K_gzTsOlqW6-h1aJB8O27hOBm1Mi8GDtBEPQ-j8';
const b64u = s => { const p = '='.repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
function pushState() {
  if (!isStandalone()) return 'browser';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return S.settings.pushSub ? 'on' : 'off';
}
function pushCard() {
  const st = pushState();
  const msg = { browser: 'Upozornění fungují jen v appce spuštěné z ikony na ploše.', unsupported: 'Tady upozornění nejdou. Na iPhonu je potřeba iOS 16.4 nebo novější.', denied: 'Upozornění jsou zakázaná. Povol je v Nastavení iPhonu → Oznámení → Kodad boost.', off: 'Ráno ti appka připomene ranní zápis (váha, spánek, včerejšek).', on: 'Upozornění jsou v tomhle telefonu zapnutá.' }[st];
  return `<section class="sec"><div class="lbl" style="margin:0 6px 10px">Ranní upozornění</div><div class="card" style="display:grid;gap:14px">
    <p style="margin:0;font-size:15px" class="mut">${msg}</p>
    ${st === 'off' ? `<button class="btn white" data-a="push-on">Zapnout upozornění</button>` : ''}
    ${st === 'on' ? `<button class="btn" data-a="push-copy">Zkopírovat kód pro Clauda</button><p class="mut" style="font-size:13px;margin:0">Kód pošli Claudovi do chatu, ten upozornění dokončí.</p>` : ''}
  </div></section>`;
}
async function pushCopy() {
  const txt = JSON.stringify(S.settings.pushSub);
  try { await navigator.clipboard.writeText(txt); toast('Zkopírováno – vlož to Claudovi'); }
  catch (e) { sheet(`<h2>Kód pro Clauda</h2><p class="mut">Označ celý text a zkopíruj ho.</p><textarea class="inp" style="min-height:200px;font-size:12px" readonly>${esc(txt)}</textarea>`); }
}
Object.assign(A, {
  'push-on': async () => {
    try {
      const p = await Notification.requestPermission(); if (p !== 'granted') { toast('Upozornění nepovolena'); return render(); }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(VAPID_PUB) });
      S.settings.pushSub = sub.toJSON(); save(true); render(); pushCopy();
    } catch (e) { toast('Nepovedlo se: ' + (e.message || e)); }
  },
  'push-copy': () => pushCopy(),
});
(function () { try { const q = new URLSearchParams(location.search); if (q.get('open') === 'den') { history.replaceState(null, '', location.pathname); setTimeout(() => go('mery', { t: 'den', d: today() }), 0); } } catch (e) { } })();
