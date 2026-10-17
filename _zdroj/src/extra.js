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
  if (cdMode !== 'run') { cdMode = 'run'; el.className = 'cdbar'; el.innerHTML = `<div class="pg"></div><div class="t"><small>Pracovní série za · ${esc(S.cd.name)}</small><b data-cd></b></div><button class="cx" data-a="cd-stop" aria-label="Zrušit odpočet">${ico('x')}</button>`; }
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
      ${row('Změna proti minulému týdnu', ch == null ? '–' : `${sg(ch, 2)} kg ${tp && S.settings.paceEval ? `<i class="stp ${tp[0]}">${tp[1]}</i>` : ''}`)}
      ${row('Jídelníček dodržen', adh == null ? '–' : Math.round(adh * 100) + ' %')}
      ${row('Ø spánek', sl == null ? '–' : nf(sl, 1) + ' h')}
      ${row('Ø výkon v tréninku', perf == null ? '–' : nf(perf, 1) + ' / 5')}
      ${sick ? row('Nemoc', `${sick} ${sick === 1 ? 'den' : sick < 5 ? 'dny' : 'dní'}`) : ''}
    </div>
    ${Object.keys(ac).length ? `<div class="lbl" style="margin:20px 4px 8px">Aktivity</div><div class="chips">${Object.entries(ac).map(([n, c]) => `<span class="chip">${esc(n)} ${c}×</span>`).join('')}</div>` : ''}
    ${stag.length ? `<div class="lbl" style="margin:20px 4px 8px">Stagnuje</div><div class="chips">${stag.map(x => `<span class="chip down">${esc(x.ex.name)} · ${x.tr.t}</span>`).join('')}</div>` : ''}
    ${ses.length ? `<div class="lbl" style="margin:20px 4px 8px">Tréninky</div><div class="list">${ses.map(s => `<button class="li" data-a="open-sum" data-id="${s.id}"><div class="t"><b>${esc(s.name)}</b><small>${fday(s.date)} · ${fmin(s.end - s.start)} min${s.perf ? ` · výkon ${s.perf}/5` : ''}</small></div><span class="chev">${ico('chev')}</span></button>`).join('')}</div>` : ''}
    <div class="actions"><button class="btn" data-a="wk-share" data-k="${monK}">${ico('share')} Sdílet</button><button class="btn white" data-a="close">Zavřít</button></div>`);
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

// ✓ u série: když chybí opakování, doplní cílové (z placeholderu) – rychlé potvrzení
A.ck = b => {
  const row = b.closest('.tr'), card = b.closest('.ex'); const s = sesById(view.id); if (!s || !row) return;
  const en = s.entries[+card.dataset.idx]; const i = +row.dataset.i; const f = row.dataset.side || 'reps'; const st = en.sets[i];
  const wi = $('[data-f=w]', row), ri = $(`[data-f=${f}]`, row);
  if (num(st.w) == null) { wi.focus(); return toast('Nejdřív váha'); }
  if (st[f] == null || st[f] === '') { const v = parseInt(ri.placeholder, 10); if (!isNaN(v)) { st[f] = v; ri.value = v; save(); updateCard(card, s, en); toast(`Zapsáno ${v} opak.`); } else ri.focus(); }
  else { ri.focus(); }
};

// ===================== v1.7: souhrn týdne v neděli · kotouče · porovnání =====================
// ---------- nedělní souhrn ----------
function weekPromo() {
  const d = new Date(); const mon = monday(d); const mk = dkey(mon);
  const sunday = d.getDay() === 0, monEarly = d.getDay() === 1 && d.getHours() < 12;
  const showFor = sunday ? mk : monEarly ? dkey(addDays(mon, -7)) : null;
  if (!showFor || S.settings.wkSeen === showFor) return '';
  const ks = [...Array(7)].map((_, i) => dkey(addDays(pdate(showFor), i)));
  const n = ks.map(sessionOn).filter(s => s && s.end).length;
  return `<button class="wpromo" data-a="wk-open" data-k="${showFor}"><span class="hic">${pico('gym')}</span><span class="t"><small>${sunday ? 'Neděle' : 'Pondělí ráno'} · týden ${isoWeek(pdate(showFor))}</small><b>Souhrn týdne je připravený</b><em>${n}/${S.settings.weekGoal || 4} tréninků · klepni pro přehled</em></span><span class="chev">${ico('chev')}</span></button>`;
}
function weekData(monK) {
  const mon = pdate(monK); const ks = [...Array(7)].map((_, i) => dkey(addDays(mon, i)));
  const ses = ks.map(sessionOn).filter(s => s && s.end);
  const mins = ses.reduce((a, s) => a + fmin(s.end - s.start), 0);
  const prs = ses.flatMap(s => sessionPRs(s)); const acts = ks.flatMap(actsOn);
  const bd = BD().days; const aw = avgOf(ks.map(k => bd[k]?.weight)), pw = avgOf(ks.map(k => bd[dkey(addDays(pdate(k), -7))]?.weight));
  return { mon, ses, mins, prs, acts, ch: aw != null && pw != null ? aw - pw : null };
}
async function storyWeek(monK) {
  const w = weekData(monK); const goal = S.settings.weekGoal || 4;
  const sub = [`${kg(Math.round(w.mins / 6) / 10)} h v gymu`, w.prs.length ? pl(w.prs.length, 'rekord', 'rekordy', 'rekordů') : '', w.acts.length ? pl(w.acts.length, 'aktivita', 'aktivity', 'aktivit') : ''].filter(Boolean).join('  ·  ');
  const sun = addDays(w.mon, 6);
  const c = await miniCard(w.ch != null ? 556 : 500, 'gym', (x, col, X) => {
    x.fillStyle = col; x.font = `700 30px ${CF}`; spacedL(x, `TÝDEN ${isoWeek(w.mon)}`, X, 150, 7);
    bigNum(x, `${w.ses.length}/${goal}`, 'tréninků', X - 4, 300, 170);
    x.fillStyle = '#C7C7CC'; x.font = `500 36px ${CF}`; x.fillText(clip(x, sub, 600), X, 372);
    if (w.ch != null) { x.fillStyle = '#8E8E93'; x.font = `500 32px ${CF}`; x.fillText(`váha ${sg(w.ch, 2)} kg proti minulému týdnu`, X, 432); }
  }, `${w.mon.getDate()}. ${w.mon.getMonth() + 1}. – ${sun.getDate()}. ${sun.getMonth() + 1}.`);
  showShot(c, `tyden-${isoWeek(w.mon)}.png`);
}

// ---------- kalkulačka kotoučů ----------
const PLATE_ALL = [25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.5, 0.25];
const PLATE_DEF = [25, 20, 15, 10, 5, 2.5, 1.25, 1];
const PLATE_COL = { 25: '#E5484D', 20: '#3B82F6', 15: '#F4C542', 10: '#8BD43B', 5: '#F5F5F7', 2.5: '#C2403F', 1.25: '#A1A1A6', 1: '#C7C7CC', 0.5: '#8E8E93', 0.25: '#6C6C70' };
const PLATE_H = { 25: 112, 20: 112, 15: 98, 10: 82, 5: 62, 2.5: 48, 1.25: 38, 1: 34, 0.5: 30, 0.25: 26 };
const plateSet = () => (S.settings.plates && S.settings.plates.length ? S.settings.plates : PLATE_DEF).slice().sort((a, b) => b - a);
function platesFor(total, bar) {
  let side = r2((total - bar) / 2); if (side < -1e-9) return { err: `Méně než samotná osa (${kg(bar)} kg)` };
  const out = []; for (const p of plateSet()) while (side >= p - 1e-9) { out.push(p); side = r2(side - p); }
  return { out, rest: side };
}
function plateSVG(out) {
  const W = 340, H = 130, cy = H / 2; let x = 70; let g = `<rect x="8" y="${cy - 5}" width="${W - 16}" height="10" rx="5" fill="#5C5C61"/><rect x="58" y="${cy - 14}" width="12" height="28" rx="3" fill="#8E8E93"/>`;
  for (const p of out) { const h = PLATE_H[p], w = p >= 10 ? 16 : p >= 2.5 ? 12 : 9; g += `<rect x="${x}" y="${cy - h / 2}" width="${w}" height="${h}" rx="3" fill="${PLATE_COL[p]}"/>`; x += w + 3; if (x > W - 20) break; }
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kotouče na jedné straně osy">${g}</svg>`;
}
function plateResult(total, bar) {
  if (total == null) return '<p class="mut">Zadej váhu.</p>';
  const r = platesFor(total, bar); if (r.err) return `<p class="mut">${r.err}</p>`;
  return `${plateSVG(r.out)}<p class="plt"><span class="mut">Na každou stranu</span><b>${r.out.length ? r.out.map(kg).join(' + ') : 'jen osa'}</b>${r.rest > 0 ? `<em>nejde přesně, chybí ${kg(r.rest * 2)} kg</em>` : ''}</p>`;
}
function platesSheet(exId, ws) {
  const ex = exById(exId); const bar = ex.plates?.bar ?? 20; const first = ws.find(w => w != null) ?? null;
  sheet(`<h2>Kotouče</h2><p class="mut" style="margin:4px 0 0">${esc(ex.name)} · osa ${kg(bar)} kg</p>
    <div class="form"><label class="f">Celková váha (kg)<input id="pl-w" class="bigin" inputmode="decimal" value="${kg(first)}" data-bar="${bar}"></label></div>
    <div id="pl-out" style="margin-top:10px">${plateResult(first, bar)}</div>
    ${ws.filter(w => w != null).length > 1 ? `<div class="chips" style="margin-top:12px">${ws.map((w, i) => w == null ? '' : `<button class="chip" data-a="pl-pick" data-v="${w}">${i + 1}. série · ${kg(w)} kg</button>`).join('')}</div>` : ''}
    <div class="actions"><button class="btn white" data-a="close">Hotovo</button></div>`);
}

// ---------- porovnání s minulým tréninkem stejného typu ----------
function prevSameSession(s) { return finished().find(o => o.id !== s.id && o.start < s.start && (s.tid ? o.tid === s.tid : o.name === s.name)) || null; }
function compareBlock(s) {
  const p = prevSameSession(s); if (!p) return '';
  const a = stats(s), b = stats(p); const ma = fmin((s.end || finEnd || Date.now()) - s.start), mb = fmin(p.end - p.start);
  const pa = sessionPRs(s).length, pb = sessionPRs(p).length;
  const row = (l, va, vb, fmt, better) => { const d = va - vb; const cl = d === 0 || better === 'none' ? '' : (better === 'up' ? d > 0 : d < 0) ? 'g' : 'b'; return `<div class="cmpr"><span>${l}</span><b>${fmt(va)}</b><span class="mut">${fmt(vb)}</span><i class="${cl}">${d === 0 ? '=' : (d > 0 ? '+' : '−') + fmt(Math.abs(d))}</i></div>`; };
  return `<div class="cmp"><div class="cmph"><span>Proti minulému ${esc(p.name)}</span><span class="mut">${fday(p.date)}</span></div>
    <div class="cmpr hd"><span></span><b>dnes</b><span>minule</span><i></i></div>
    ${row('Čas', ma, mb, v => v + ' min', 'none')}
    ${row('Série', a.sets, b.sets, v => String(v), 'up')}
    ${row('Objem', a.vol, b.vol, v => thou(v) + ' kg', 'up')}
    ${row('Zlepšení', a.up, b.up, v => String(v), 'up')}
    ${row('Rekordy', pa, pb, v => String(v), 'up')}</div>`;
}

// jednorázové doplnění kalkulačky k osovým cvikům ve stávající knihovně
(function () {
  if (S.settings.migPlates) return;
  const bar = ['Bench press', 'Dřep', 'Mrtvý tah', 'Rumunský mrtvý tah', 'Přítahy v předklonu', 'Tlak nad hlavu', 'Hip thrust'];
  S.exercises.forEach(e => { if (bar.includes(e.name) && !e.plates) e.plates = { bar: 20 }; });
  S.settings.migPlates = 1; save(true);
})();

Object.assign(A, {
  'wk-open': b => { S.settings.wkSeen = b.dataset.k; save(true); render(); weekSheet(b.dataset.k); },
  'wk-share': b => { closeSheet(); storyWeek(b.dataset.k); },
  plates: b => { const s = sesById(view.id); const e = s.entries[+b.closest('.ex').dataset.idx]; platesSheet(e.exId, e.sets.slice(0, exById(e.exId).sets.length).map(st => num(st.w))); },
  'pl-pick': b => { const i = $('#pl-w'); i.value = kg(+b.dataset.v); $('#pl-out').innerHTML = plateResult(+b.dataset.v, num(i.dataset.bar)); },
  'e-plates': () => { readExDraft(); exDraft.plates = exDraft.plates ? null : { bar: 20 }; drawExEdit(); },
  'plate-tog': b => { const v = +b.dataset.v; let p = plateSet(); p = p.includes(v) ? p.filter(x => x !== v) : p.concat(v); S.settings.plates = p.sort((a, c) => c - a); save(true); render(); },
});
document.addEventListener('input', e => { if (e.target.id === 'pl-w') $('#pl-out').innerHTML = plateResult(num(e.target.value), num(e.target.dataset.bar)); });
(function () { try { const q = new URLSearchParams(location.search); if (q.get('open') === 'week') { history.replaceState(null, '', location.pathname); const mk = dkey(monday(new Date())); setTimeout(() => { S.settings.wkSeen = mk; save(); weekSheet(mk); }, 50); } } catch (e) { } })();

// ===================== v1.8: sauna jako „trénink“ – víc saun za sebou, typy, sdílení po dokončení =====================
const SAUNA_KINDS = ['Finská', 'Parní', 'Infra', 'Bylinková'];
// sjednocení: stará sauna (rounds/min/temp) = jedna položka
const saunaItems = a => a.items && a.items.length ? a.items : [{ kind: a.kind || null, rounds: a.rounds, min: a.min, temp: a.temp }];
function saunaTotals(a) {
  const it = saunaItems(a); const rounds = it.reduce((s, x) => s + (x.rounds || 1), 0); const mins = it.reduce((s, x) => s + (x.rounds || 1) * (x.min || 0), 0);
  return { it, rounds, mins };
}
const saunaLine = x => [x.kind, x.rounds ? `${x.rounds}× ${x.min ? x.min + ' min' : ''}`.trim() : x.min ? `${x.min} min` : '', x.temp ? `${x.temp} °C` : ''].filter(Boolean).join(' · ');
let sDraft = null;
function saunaSheet(a, id) {
  if (!sDraft || sDraft.id !== (id || 'new')) sDraft = { id: id || 'new', date: a.date || today(), note: a.note || '', items: JSON.parse(JSON.stringify(id ? saunaItems(a) : [{ kind: 'Finská', rounds: null, min: null, temp: null }])) };
  const d = sDraft;
  sheet(`<h2>Sauna</h2><div class="form">
    <label class="f">Datum<input id="a-date" type="date" value="${d.date}"></label>
    ${d.items.map((x, i) => `<div class="sblock" data-i="${i}">
      <div class="sbh"><b>${i + 1}. sauna</b>${d.items.length > 1 ? `<button class="rm" data-a="sa-rm" data-i="${i}" aria-label="Odebrat">${ico('x')}</button>` : ''}</div>
      <div class="seg wrap4">${SAUNA_KINDS.map(k => `<button data-a="sa-kind" data-i="${i}" data-v="${k}" class="${x.kind === k ? 'on' : ''}">${k}</button>`).join('')}</div>
      <div class="three"><label class="f">Kola<input data-sf="rounds" inputmode="numeric" value="${x.rounds ?? ''}" placeholder="3"></label><label class="f">Min / kolo<input data-sf="min" inputmode="numeric" value="${x.min ?? ''}" placeholder="12"></label><label class="f">Teplota °C<input data-sf="temp" inputmode="numeric" value="${x.temp ?? ''}" placeholder="${x.kind === 'Parní' ? '45' : x.kind === 'Infra' ? '55' : '90'}"></label></div>
    </div>`).join('')}
    <button class="btn block" data-a="sa-add">${ico('plus')} Přidat další saunu</button>
    <label class="f">Poznámka<input id="a-note" value="${esc(d.note)}" placeholder="nepovinné"></label></div>
    <div class="actions">${id ? `<button class="btn danger" data-a="act-del" data-id="${id}" aria-label="Smazat">${ico('trash')}</button><button class="btn" data-a="act-share" data-id="${id}" aria-label="Sdílet">${ico('share')}</button>` : ''}<button class="btn" data-a="sa-cancel">Zrušit</button><button class="btn white" data-a="sa-done">Hotovo</button></div>`);
}
function saunaRead() {
  const d = sDraft; d.date = $('#a-date')?.value || d.date; d.note = $('#a-note')?.value || '';
  $$('.sblock').forEach(b => { const x = d.items[+b.dataset.i]; ['rounds', 'min', 'temp'].forEach(f => x[f] = num($(`[data-sf=${f}]`, b).value)); });
}
const _actSheet = actSheet;
actSheet = function (type, k, id) {
  const a = id ? S.activities.find(x => x.id === id) : null;
  if ((a && a.type === 'sauna') || (!a && type === 'sauna')) { if (!id) sDraft = null; return saunaSheet(a || { date: k || today() }, id); }
  return _actSheet(type, k, id);
};
// po uložení nové aktivity rovnou nabídnout kartu ke sdílení
const _actSave = A['act-save'];
A['act-save'] = b => { const isNew = !b.dataset.id; _actSave(b); if (isNew) { const a = S.activities[S.activities.length - 1]; setTimeout(() => storyActivity(a), 1500); } };
Object.assign(A, {
  'sa-kind': b => { saunaRead(); const x = sDraft.items[+b.dataset.i]; x.kind = x.kind === b.dataset.v ? null : b.dataset.v; saunaSheet({}, sDraft.id === 'new' ? null : sDraft.id); },
  'sa-add': () => { saunaRead(); const last = sDraft.items[sDraft.items.length - 1]; sDraft.items.push({ kind: last.kind, rounds: null, min: last.min, temp: null }); saunaSheet({}, sDraft.id === 'new' ? null : sDraft.id); setTimeout(() => { const el = $$('.sblock').pop(); el && el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 50); },
  'sa-rm': b => { saunaRead(); sDraft.items.splice(+b.dataset.i, 1); saunaSheet({}, sDraft.id === 'new' ? null : sDraft.id); },
  'sa-cancel': () => { sDraft = null; closeSheet(); },
  'sa-done': () => {
    saunaRead(); const d = sDraft; const items = d.items.filter(x => x.kind || x.rounds || x.min || x.temp);
    if (!items.length) return toast('Vyplň aspoň jednu saunu');
    const isNew = d.id === 'new';
    const a = isNew ? { id: uid(), type: 'sauna', ts: Date.now() } : S.activities.find(x => x.id === d.id);
    a.date = d.date; a.note = d.note.trim(); a.items = items; delete a.rounds; delete a.min; delete a.temp; delete a.kind;
    if (isNew) S.activities.push(a);
    sDraft = null; save(true); closeSheet(); render();
    storyActivity(a);
  },
});

// ===================== v2.0: SDÍLECÍ STUDIO – vlastní vizuál JK =====================
// Jazyk karet vychází z loga: šikmé tahy (jako „JK“), kurzíva, šikmá podtrhávací lišta, velká silueta sportu.
const STYLES = [['noc', 'Tmavá'], ['barva', 'Barevná'], ['cista', 'Bez pozadí']];
const SLANT = 0.42; // sklon jako v logu
function slab(x, X, Y, w, h) { const k = h * SLANT; x.beginPath(); x.moveTo(X + k, Y); x.lineTo(X + w + k, Y); x.lineTo(X + w, Y + h); x.lineTo(X, Y + h); x.closePath(); }
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.round(r * f); g = Math.round(g * f); b = Math.round(b * f); return `rgb(${r},${g},${b})`; }
async function markTinted(col) {
  return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(MARK.replace('currentColor', col)); });
}
async function drawShare(sp, style, on) {
  const W = 900, L = 54, X = 270, col = sp.col;
  const isOn = id => on[id] !== false;
  const stats = (sp.stats || []).filter(s => isOn(s.id));
  const lists = (sp.lists || []).filter(l => isOn(l.id) && l.items.length);
  const vizs = (sp.viz || []).filter(v => isOn(v.id));
  const colr = style === 'barva', clear = style === 'cista';
  const fg = colr ? '#0B0B0C' : '#F5F5F7', mut = colr ? 'rgba(11,11,12,.6)' : clear ? 'rgba(255,255,255,.82)' : '#9A9AA0', acc = colr ? '#0B0B0C' : col, faint = colr ? 'rgba(11,11,12,.12)' : clear ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.08)';
  // rozvržení (měření předem)
  const m = document.createElement('canvas').getContext('2d');
  const size = (() => { let s = 150; m.font = `italic 900 ${s}px ${CF}`; while (m.measureText(sp.big).width > 400 && s > 84) { s -= 8; m.font = `italic 900 ${s}px ${CF}`; } return s; })();
  const titleY = 138, bigY = titleY + 22 + Math.round(size * .86);
  // statistiky v řádcích (inline)
  const statLines = []; let cur = [], cw = 0, maxW = W - L - X;
  stats.forEach(s => { m.font = `italic 800 40px ${CF}`; const vw = m.measureText(s.value).width; m.font = `600 22px ${CF}`; const lw = m.measureText(s.label.toUpperCase()).width + s.label.length * 2; const w = vw + 12 + lw + 40; if (cw + w > maxW && cur.length) { statLines.push(cur); cur = []; cw = 0; } cur.push({ ...s, vw }); cw += w; });
  if (cur.length) statLines.push(cur);
  let topEnd = bigY + 54; if (statLines.length) topEnd = bigY + 50 + statLines.length * 58;
  topEnd = Math.max(topEnd, 350);
  const listH = lists.reduce((a, l) => a + 50 + l.items.length * 54 + 8, 0), vizH = vizs.reduce((a, v) => a + v.h + 26, 0);
  const h = topEnd + (listH || vizH ? 26 : 0) + vizH + listH + (listH || vizH ? 96 : 52);
  const c = document.createElement('canvas'); c.width = W; c.height = h; const x = c.getContext('2d');
  // pozadí
  if (!clear) {
    rr(x, 0, 0, W, h, 56); x.save(); x.clip();
    if (colr) { const g = x.createLinearGradient(0, 0, W, h); g.addColorStop(0, col); g.addColorStop(1, shade(col, .74)); x.fillStyle = g; x.fillRect(0, 0, W, h); }
    else { const g = x.createLinearGradient(0, 0, W, h); g.addColorStop(0, '#1E1E21'); g.addColorStop(1, '#0D0D0F'); x.fillStyle = g; x.fillRect(0, 0, W, h); const rg = x.createRadialGradient(170, 200, 10, 170, 200, 460); rg.addColorStop(0, hexA(col, .16)); rg.addColorStop(1, hexA(col, 0)); x.fillStyle = rg; x.fillRect(0, 0, W, h); }
    x.globalAlpha = colr ? .14 : .06; x.fillStyle = colr ? '#FFFFFF' : col; slab(x, W - 300, -10, 110, h + 20); x.globalAlpha = colr ? .08 : .035; slab(x, W - 160, -10, 46, h + 20); x.globalAlpha = 1;
    x.restore();
    if (!colr) { x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 2.5; rr(x, 1.25, 1.25, W - 2.5, h - 2.5, 55); x.stroke(); }
  }
  if (clear) { x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 24; x.shadowOffsetY = 2; }
  // medailon se siluetou
  const mx = L + 92, my = 190, R = 92;
  x.beginPath(); x.arc(mx, my, R, 0, Math.PI * 2); x.fillStyle = colr ? 'rgba(11,11,12,.10)' : clear ? 'rgba(255,255,255,.12)' : hexA(col, .12); x.fill();
  x.lineWidth = 3; x.strokeStyle = colr ? 'rgba(11,11,12,.35)' : clear ? 'rgba(255,255,255,.55)' : hexA(col, .45); x.stroke();
  drawPicto(x, sp.picto, mx, my, 112, colr ? '#0B0B0C' : clear ? '#FFFFFF' : col);
  // datum + titulky
  x.fillStyle = mut; x.font = `600 26px ${CF}`; x.textAlign = 'right'; x.fillText(sp.date || sp.kicker || '', W - L, 92); x.textAlign = 'left';
  if (sp.kicker && sp.date) { x.fillStyle = mut; x.font = `600 24px ${CF}`; spacedL(x, clip(x, sp.kicker.toUpperCase(), 330), X, 92, 5); }
  x.fillStyle = acc; x.font = `italic 800 36px ${CF}`; spacedL(x, clip(x, sp.title.toUpperCase(), 540), X, titleY, 3);
  x.fillStyle = fg; x.font = `italic 900 ${size}px ${CF}`; x.fillText(sp.big, X - 6, bigY); const bw = x.measureText(sp.big).width;
  if (sp.unit) { x.fillStyle = mut; x.font = `italic 700 ${Math.round(size * .3)}px ${CF}`; x.fillText(sp.unit, X + bw + 12, bigY); }
  x.fillStyle = acc; slab(x, X, bigY + 20, 110, 9); x.fill(); x.globalAlpha = .45; slab(x, X + 126, bigY + 20, 34, 9); x.fill(); x.globalAlpha = 1;
  let y = bigY + 50;
  statLines.forEach(line => { let sx = X; line.forEach(s => { x.fillStyle = fg; x.font = `italic 800 40px ${CF}`; x.fillText(s.value, sx, y + 40); sx += s.vw + 12; x.fillStyle = mut; x.font = `600 22px ${CF}`; sx = spacedL(x, s.label.toUpperCase(), sx, y + 39, 2) + 38; }); y += 58; });
  y = topEnd + (listH || vizH ? 26 : 0);
  // grafika (od levého okraje pod medailonem)
  vizs.forEach(v => { v.draw(x, L, y, W - 2 * L, { fg, mut, acc, faint, colr }); y += v.h + 26; });
  // seznamy
  lists.forEach(l => {
    x.fillStyle = mut; x.font = `600 22px ${CF}`; spacedL(x, l.title.toUpperCase(), L, y + 30, 5); y += 50;
    l.items.forEach(([Lt, Rt, rc]) => {
      x.fillStyle = faint; x.fillRect(L, y, W - 2 * L, 2);
      x.fillStyle = fg; x.font = `500 31px ${CF}`; x.fillText(clip(x, Lt, 480), L, y + 39);
      x.textAlign = 'right'; x.fillStyle = rc && !colr ? rc : fg; x.font = `italic 800 32px ${CF}`; x.fillText(Rt, W - L, y + 40); x.textAlign = 'left';
      y += 54;
    });
    y += 8;
  });
  // logo
  x.shadowBlur = 0; const mk = await markTinted(colr ? '#0B0B0C' : '#FFFFFF');
  if (mk) { const lh = 30, lw = lh * (mk.naturalWidth || mk.width) / (mk.naturalHeight || mk.height); x.globalAlpha = .5; x.drawImage(mk, W - L - lw, h - 40 - lh, lw, lh); x.globalAlpha = 1; }
  return c;
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function vizMonth(yy, mm) {
  const first = new Date(yy, mm, 1), off = (first.getDay() + 6) % 7, days = new Date(yy, mm + 1, 0).getDate(), rows = Math.ceil((off + days) / 7);
  const cell = 66, gap = 10;
  return {
    id: 'cal', label: 'Kalendář', h: 40 + rows * (cell + gap), draw: (x, X, Y, W, k) => {
      const tw = 7 * cell + 6 * gap, sx = X + (W - tw) / 2;
      ['po', 'út', 'st', 'čt', 'pá', 'so', 'ne'].forEach((d, i) => { x.fillStyle = k.mut; x.font = `600 21px ${CF}`; x.textAlign = 'center'; x.fillText(d.toUpperCase(), sx + i * (cell + gap) + cell / 2, Y + 22); });
      for (let d = 1; d <= days; d++) {
        const p = off + d - 1, r = Math.floor(p / 7), ci = p % 7, cx = sx + ci * (cell + gap), cy = Y + 40 + r * (cell + gap); const kk = dkey(new Date(yy, mm, d));
        const s = sessionOn(kk), a = actsOn(kk); const done = s && s.end;
        if (done) { x.fillStyle = k.acc; slab(x, cx - 6, cy, cell - 10, cell); x.fill(); } else { x.fillStyle = k.faint; rr(x, cx, cy, cell, cell, 14); x.fill(); }
        if (a.length) { x.fillStyle = done ? (k.colr ? '#FFFFFF' : '#0B0B0C') : k.acc; x.beginPath(); x.arc(cx + cell - 15, cy + 15, 6, 0, 6.28); x.fill(); }
        x.fillStyle = done ? (k.colr ? '#FFFFFF' : '#0B0B0C') : k.mut; x.font = `700 22px ${CF}`; x.fillText(String(d), cx + cell / 2, cy + cell / 2 + 8);
      }
      x.textAlign = 'left';
    }
  };
}
function vizWeek(mon) {
  return {
    id: 'days', label: 'Dny', h: 116, draw: (x, X, Y, W, k) => {
      const gap = 14, cw = (W - 6 * gap) / 7;
      for (let i = 0; i < 7; i++) {
        const kk = dkey(addDays(mon, i)); const s = sessionOn(kk), a = actsOn(kk); const cx = X + i * (cw + gap); const done = s && s.end;
        if (done) { x.fillStyle = k.acc; slab(x, cx - 8, Y, cw - 14, 72); x.fill(); } else { x.fillStyle = k.faint; rr(x, cx, Y, cw, 72, 14); x.fill(); }
        if (a.length) { x.fillStyle = done ? (k.colr ? '#FFFFFF' : '#0B0B0C') : k.acc; x.beginPath(); x.arc(cx + cw / 2, Y + 36, 7, 0, 6.28); x.fill(); }
        x.fillStyle = k.mut; x.font = `700 21px ${CF}`; x.textAlign = 'center'; x.fillText(DOW[addDays(mon, i).getDay()].toUpperCase(), cx + cw / 2, Y + 106);
      }
      x.textAlign = 'left';
    }
  };
}
function vizWeight(ks) {
  const pts = ks.map(k => ({ k, w: BD().days[k]?.weight })).filter(p => p.w != null);
  if (pts.length < 2) return null;
  return {
    id: 'vaha', label: 'Křivka váhy', h: 110, def: false, draw: (x, X, Y, W, k) => {
      const mn = Math.min(...pts.map(p => p.w)), mx = Math.max(...pts.map(p => p.w)), sp = Math.max(mx - mn, .6);
      const px = i => X + (W - 200) * i / (pts.length - 1), py = v => Y + 92 - (v - mn) / sp * 80;
      x.strokeStyle = k.acc; x.lineWidth = 6; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(px(i), py(p.w)) : x.moveTo(px(i), py(p.w))); x.stroke();
      const l = pts[pts.length - 1]; x.fillStyle = k.acc; x.beginPath(); x.arc(px(pts.length - 1), py(l.w), 10, 0, 6.28); x.fill();
      const d = l.w - pts[0].w; x.fillStyle = k.fg; x.font = `italic 800 44px ${CF}`; x.textAlign = 'right'; x.fillText(`${d >= 0 ? '+' : '−'}${kg(Math.abs(r2(d)))} kg`, X + W, Y + 62); x.textAlign = 'left';
    }
  };
}

// ---------- specifikace karet ----------
const COLK = k => (CARD_COL[k] || CARD_COL.other)[0];
function specWorkout(s) {
  const st = stats(s), prs = sessionPRs(s), p = prevSameSession(s), min = fmin((s.end || finEnd || Date.now()) - s.start);
  const extra = []; if (s.cardio && s.cardio.mode === 'join') extra.push([s.cardio.kind, [s.cardio.min ? s.cardio.min + ' min' : '', s.cardio.bpm ? s.cardio.bpm + ' bpm' : ''].filter(Boolean).join(' · ') || '✓']); if (s.stretch) extra.push(['Statický strečink', '✓']);
  const tops = s.entries.map(e => { const ex = exById(e.exId); if (!ex) return null; const t = usedSets(e, ex).find(q => hasData(q, ex)); return t ? [ex.name, setTxt(t, ex)] : null; }).filter(Boolean);
  const cmpI = p ? (() => { const b = stats(p); return [['Objem', `${sg(st.vol - b.vol, 0)} kg`, st.vol >= b.vol ? '#35D0C9' : '#E5484D'], ['Zlepšení', `${st.up}`, null]]; })() : [];
  return {
    picto: 'gym', col: prs.length ? '#F4C542' : COLK('gym'), kicker: prs.length ? 'Nový rekord' : 'Trénink', title: s.name, big: String(min), unit: 'min', date: fdate(s.date),
    stats: [{ id: 'vol', label: 'nazvedáno', value: `${thou(st.vol)} kg` }, { id: 'sets', label: pl(st.sets, 'série', 'série', 'sérií').split(' ')[1], value: String(st.sets) }, { id: 'ex', label: pl(st.ex, 'cvik', 'cviky', 'cviků').split(' ')[1], value: String(st.ex) }],
    lists: [{ id: 'pr', title: 'Rekordy', items: prs.map(q => [q.ex.name, `${kg(q.w)} × ${q.r}`, '#F4C542']) }, { id: 'extra', title: 'Navíc', items: extra }, { id: 'top', title: 'Nejlepší série', items: tops, def: false }, { id: 'cmp', title: p ? `Proti minule (${fday(p.date)})` : '', items: cmpI, def: false }],
  };
}
function specExercise(s, e) {
  const ex = exById(e.exId), prev = lastBefore(e.exId, s), best = bestBefore(e.exId, s);
  const rows = usedSets(e, ex).map((st, i) => ({ st, i })).filter(o => hasData(o.st, ex)); const pr = rows.some(o => isPR(o.st, ex, best));
  const top = rows[0]?.st;
  return {
    picto: 'dumbbell', col: pr ? '#F4C542' : COLK('gym'), kicker: pr ? 'Nový rekord' : s.name, title: ex.name, big: top ? kg(num(top.w)) : '–', unit: top ? `kg × ${ex.uni ? `${top.l ?? '–'}/${top.r ?? '–'}` : top.reps}` : '', date: fdate(s.date),
    stats: [ex.tempo ? { id: 'tempo', label: 'tempo', value: ex.tempo } : null, { id: 'musc', label: 'partie', value: ex.muscle || '–', def: false }].filter(Boolean),
    lists: [{ id: 'sets', title: 'Série', items: rows.map(({ st, i }) => { const a = cmp(st, prev && prev.e.sets[i], ex), P = isPR(st, ex, best); return [`${i + 1}. série`, `${setTxt(st, ex)}${P ? '  PR' : a === 'up' ? '  ↑' : a === 'down' ? '  ↓' : ''}`, P ? '#F4C542' : a === 'up' ? '#35D0C9' : null]; }) },
    { id: 'prev', title: 'Minule', items: prev ? [[fday(prev.s.date), usedSets(prev.e, ex).map(t => setTxt(t, ex)).join(' · ')]] : [], def: false }],
  };
}
function specActivity(a) {
  const t = ACT_TYPES[a.type] || ACT_TYPES.other; const key = PICTO[a.type] ? a.type : 'other'; const col = COLK(key); const pic = a.type === 'bike' && a.kind === 'Rotoped' ? 'rotoped' : key;
  let title = a.type === 'other' && a.label ? a.label : t.name; let big = '✓', unit = '', st = [], lists = [];
  if (a.type === 'sauna') { const T = saunaTotals(a); const one = T.it.length === 1; big = `${T.rounds}×`; unit = one && T.it[0].min ? `${T.it[0].min} min` : T.mins ? `${T.mins} min celkem` : 'kol'; const mt = Math.max(0, ...T.it.map(i => i.temp || 0)); st = [mt ? { id: 'tep', label: 'max', value: `${mt} °C` } : null].filter(Boolean); if (one && T.it[0].kind) title = `${t.name} · ${T.it[0].kind}`; if (!one) lists = [{ id: 'saunas', title: 'Sauny', items: T.it.map(i => [i.kind || 'Sauna', `${i.rounds || 1}× ${i.min ? i.min + ' min' : ''}${i.temp ? ' · ' + i.temp + '°' : ''}`.trim()]) }]; }
  else if (a.type === 'cold') { big = a.sec ? `${Math.floor(a.sec / 60)}:${pad(a.sec % 60)}` : (a.kind || 'Hotovo'); unit = a.sec ? 'min' : ''; if (a.kind && a.sec) title = `${t.name} · ${a.kind}`; st = [a.temp != null ? { id: 'tep', label: 'voda', value: `${kg(a.temp)} °C` } : null].filter(Boolean); }
  else if (a.km) { big = kg(a.km); unit = 'km'; const pace = a.min ? a.min / a.km : null; st = [a.min ? { id: 'min', label: 'min', value: String(a.min) } : null, pace ? { id: 'pace', label: 'min/km', value: `${Math.floor(pace)}:${pad(Math.round((pace % 1) * 60))}` } : null].filter(Boolean); }
  else if (a.laps) { big = String(a.laps); unit = 'bazénů'; st = [a.pool ? { id: 'dist', label: 'metrů', value: thou(a.laps * a.pool) } : null, a.min ? { id: 'min', label: 'min', value: String(a.min) } : null].filter(Boolean); }
  else if (a.reps) { big = `${a.reps}×`; unit = a.dist ? `${a.dist} m` : 'úseků'; st = [a.dist ? { id: 'dist', label: 'metrů celkem', value: thou(a.reps * a.dist) } : null, a.min ? { id: 'min', label: 'min', value: String(a.min) } : null].filter(Boolean); }
  else { big = a.min ? String(a.min) : 'Hotovo'; unit = a.min ? 'min' : ''; if (a.kind) title = `${title} · ${a.kind}`; st = [a.bpm ? { id: 'bpm', label: 'tep', value: `${a.bpm} bpm` } : null].filter(Boolean); }
  if (a.note) lists.push({ id: 'note', title: 'Poznámka', items: [[a.note, '']], def: false });
  return { picto: pic, col, kicker: '', title, big, unit, date: fdate(a.date), stats: st, lists };
}
function specWeek(monK) {
  const w = weekData(monK), goal = S.settings.weekGoal || 4, sun = addDays(w.mon, 6);
  const ac = {}; w.acts.forEach(a => { const n = a.type === 'other' ? (a.label || 'Jiné') : ACT_TYPES[a.type]?.name || a.type; ac[n] = (ac[n] || 0) + 1; });
  const ks = [...Array(7)].map((_, i) => dkey(addDays(w.mon, i)));
  return {
    picto: 'gym', col: COLK('gym'), kicker: `${w.mon.getDate()}. ${w.mon.getMonth() + 1}. – ${sun.getDate()}. ${sun.getMonth() + 1}.`, title: `Týden ${isoWeek(w.mon)}`, big: `${w.ses.length}/${goal}`, unit: 'tréninků', date: '',
    stats: [{ id: 'h', label: 'hodin v gymu', value: kg(Math.round(w.mins / 6) / 10) }, { id: 'pr', label: 'rekordy', value: String(w.prs.length) }, { id: 'act', label: 'aktivity', value: String(w.acts.length) }],
    viz: [vizWeek(w.mon), vizWeight(ks)].filter(Boolean),
    lists: [{ id: 'prl', title: 'Rekordy', items: w.prs.slice(0, 5).map(q => [q.ex.name, `${kg(q.w)} × ${q.r}`, '#F4C542']), def: false }, { id: 'acl', title: 'Aktivity', items: Object.entries(ac).map(([n, c]) => [n, `${c}×`]), def: false }],
  };
}
function specMonth(yy, mm) {
  const days = new Date(yy, mm + 1, 0).getDate(); const ks = [...Array(days)].map((_, i) => dkey(new Date(yy, mm, i + 1)));
  const ses = ks.map(sessionOn).filter(s => s && s.end); const mins = ses.reduce((a, s) => a + fmin(s.end - s.start), 0);
  const prs = ses.flatMap(s => sessionPRs(s)); const acts = ks.flatMap(actsOn);
  const best = {}; prs.forEach(p => { const b = best[p.ex.name]; if (!b || p.w > b.w || (p.w === b.w && p.r > b.r)) best[p.ex.name] = p; });
  const ac = {}; acts.forEach(a => { const n = a.type === 'other' ? (a.label || 'Jiné') : ACT_TYPES[a.type]?.name || a.type; ac[n] = (ac[n] || 0) + 1; });
  return {
    picto: 'gym', col: COLK('gym'), kicker: String(yy), title: MON[mm], big: String(ses.length), unit: pl(ses.length, 'trénink', 'tréninky', 'tréninků').split(' ')[1], date: '',
    stats: [{ id: 'h', label: 'hodin v gymu', value: kg(Math.round(mins / 6) / 10) }, { id: 'pr', label: 'rekordy', value: String(prs.length) }, { id: 'act', label: 'aktivity', value: String(acts.length) }],
    viz: [vizMonth(yy, mm), vizWeight(ks)].filter(Boolean),
    lists: [{ id: 'prl', title: 'Nejlepší rekordy', items: Object.values(best).slice(0, 5).map(q => [q.ex.name, `${kg(q.w)} × ${q.r}`, '#F4C542']) }, { id: 'acl', title: 'Aktivity', items: Object.entries(ac).map(([n, c]) => [n, `${c}×`]), def: false }],
  };
}
// ---------- studio (výběr stylu a obsahu) ----------
let STU = null;
function openStudio(kind, sp, name) {
  const pref = (S.settings.share = S.settings.share || {})[kind] || {};
  const on = {}; [...(sp.stats || []), ...(sp.lists || []), ...(sp.viz || [])].forEach(i => { on[i.id] = pref.on && i.id in pref.on ? pref.on[i.id] : i.def !== false; });
  STU = { kind, sp, name, style: pref.style || 'noc', on, canvas: null };
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const toggles = [...(sp.stats || []).map(s => [s.id, cap(s.label)]), ...(sp.lists || []).filter(l => l.items.length).map(l => [l.id, l.title.replace(/\s*\(.*\)/, '')]), ...(sp.viz || []).map(v => [v.id, v.label])];
  sheet(`<div class="stu"><div class="stprev" id="st-prev"><div class="stload"></div></div>
    <div class="seg" style="margin-top:14px">${STYLES.map(([k, l]) => `<button data-a="st-style" data-v="${k}" class="${STU.style === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    ${toggles.length ? `<div class="lbl" style="margin:16px 4px 8px">Co ukázat</div><div class="chips">${toggles.map(([id, l]) => `<button class="chip tg ${on[id] ? 'on' : ''}" data-a="st-tog" data-v="${id}">${esc(l)}</button>`).join('')}</div>` : ''}
    <div class="bottom-acts" style="margin-top:18px"><button class="pill white" data-a="st-share">${ico('share')} Uložit / sdílet</button></div>
    <p class="mut" style="font-size:13px;text-align:center;margin:10px 0 0">„Bez pozadí“ = jen text a silueta. Na story ji dáš přes vlastní fotku.</p></div>`, () => stuRender());
}
async function stuRender() {
  if (!STU) return; const c = await drawShare(STU.sp, STU.style, STU.on); STU.canvas = c;
  const box = $('#st-prev'); if (!box) return; box.className = 'stprev ' + STU.style; box.innerHTML = `<img src="${c.toDataURL('image/png')}" alt="Náhled karty">`;
  (S.settings.share[STU.kind] = { style: STU.style, on: STU.on }); save();
}
async function stuShare() {
  const c = STU && STU.canvas; if (!c) return;
  try { const blob = await new Promise(r => c.toBlob(r, 'image/png')); const file = new File([blob], STU.name.replace(/[\\/:*?"<>|]/g, ''), { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] }); else { closeSheet(); showShot(c, STU.name); } }
  catch (e) { if (e.name !== 'AbortError') { closeSheet(); showShot(c, STU.name); } }
}
// přesměrování starých vstupů na studio
async function storySummary(s) { openStudio('workout', specWorkout(s), `trenink-${s.date}.png`); }
async function storyExercise(s, e) { openStudio('exercise', specExercise(s, e), `${exById(e.exId).name}.png`); }
async function storyActivity(a) { openStudio('act-' + a.type, specActivity(a), `${(ACT_TYPES[a.type] || {}).name || 'aktivita'}-${a.date}.png`); }
async function storyWeek(monK) { openStudio('week', specWeek(monK), `tyden-${isoWeek(pdate(monK))}.png`); }
function storyMonth(yy, mm) { openStudio('month', specMonth(yy, mm), `mesic-${yy}-${pad(mm + 1)}.png`); }
Object.assign(A, {
  'st-style': b => { STU.style = b.dataset.v; $$('[data-a=st-style]').forEach(x => x.classList.toggle('on', x === b)); stuRender(); },
  'st-tog': b => { const id = b.dataset.v; STU.on[id] = !STU.on[id]; b.classList.toggle('on', STU.on[id]); stuRender(); },
  'st-share': () => stuShare(),
  'month-share': () => storyMonth(calM.y, calM.m),
  'tog-pace': () => { S.settings.paceEval = !S.settings.paceEval; save(true); render(); },
});

(function () { if (S.settings.plates && !S.settings.migP1) { if (!S.settings.plates.includes(1)) S.settings.plates.push(1); S.settings.plates.sort((a, b) => b - a); } S.settings.migP1 = 1; save(true); })();
