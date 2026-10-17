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
const PLATE_ALL = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25];
const PLATE_DEF = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_COL = { 25: '#E5484D', 20: '#3B82F6', 15: '#F4C542', 10: '#8BD43B', 5: '#F5F5F7', 2.5: '#C2403F', 1.25: '#A1A1A6', 0.5: '#8E8E93', 0.25: '#6C6C70' };
const PLATE_H = { 25: 112, 20: 112, 15: 98, 10: 82, 5: 62, 2.5: 48, 1.25: 38, 0.5: 30, 0.25: 26 };
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
