'use strict';
// ===================== Kodad boost · JK =====================
const KEY = 'kodadboost.v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dkey(new Date());
const pdate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const DOW = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'];
const DOWL = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
const MON = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
const MONG = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const fday = k => { const d = pdate(k); return `${DOW[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.`; };
const fdate = k => { const d = pdate(k); return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`; };
const flong = k => { const d = pdate(k); return `${DOWL[d.getDay()]} ${d.getDate()}. ${MONG[d.getMonth()]}`; };
const num = v => { if (v === null || v === undefined || v === '') return null; const n = parseFloat(String(v).replace(',', '.').replace(/\s/g, '')); return isFinite(n) ? n : null; };
const kg = n => n == null ? '' : String(Math.round(n * 100) / 100).replace('.', ',');
const r2 = n => Math.round(n * 100) / 100;
const thou = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fclock = sec => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return `${pad(h)}:${pad(m)}:${pad(s)}`; };
const pl = (n, a, b, c) => `${n} ${n === 1 ? a : n >= 2 && n <= 4 ? b : c}`;
const SER = n => pl(n, 'série', 'série', 'sérií'), CVK = n => pl(n, 'cvik', 'cviky', 'cviků');
const fmin = ms => Math.max(0, Math.round(ms / 60000));
function isoWeek(d) { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / 864e5 + 1) / 7); }
const monday = d => { const m = new Date(d); m.setHours(0, 0, 0, 0); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// ---------- data ----------
function blank() { return { v: 2, exercises: [], templates: [], sessions: [], activities: [], days: {}, settings: { rule: 'exceed', weekGoal: 4 }, active: null }; }
function seedEx() { return SEED.map(([name, muscle, secondary, uni, inc, sets, cues]) => ({ id: uid(), name, muscle, secondary, uni, inc, sets, cues, tempo: '', partials: false, note: '' })); }
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = Object.assign(blank(), JSON.parse(raw)); d.settings = Object.assign(blank().settings, d.settings); return d; }
  } catch (e) { }
  const d = blank(); d.exercises = seedEx(); return d;
}
let S = load();
let saveT;
function save(now) {
  clearTimeout(saveT);
  const w = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Uložení selhalo – udělej zálohu'); } };
  now ? w() : (saveT = setTimeout(w, 250));
}
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { }

const exById = id => S.exercises.find(e => e.id === id);
const tplById = id => S.templates.find(t => t.id === id);
const sesById = id => S.sessions.find(s => s.id === id);
const finished = () => S.sessions.filter(s => s.end).sort((a, b) => b.start - a.start);
const sessionOn = k => S.sessions.find(s => s.date === k);
const actsOn = k => S.activities.filter(a => a.date === k);

// ---------- progression core ----------
function repsOf(set, ex) {
  if (!set) return null;
  if (ex.uni) { const l = num(set.l), r = num(set.r); if (l == null && r == null) return null; if (l == null) return r; if (r == null) return l; return Math.min(l, r); }
  return num(set.reps);
}
const hasData = (set, ex) => !!set && num(set.w) != null && repsOf(set, ex) != null;
function lastBefore(exId, s) {
  const ex = exById(exId);
  for (const o of finished()) {
    if (o.id === s.id || o.start >= s.start) continue;
    const e = o.entries.find(x => x.exId === exId);
    if (e && e.sets.some(st => hasData(st, ex))) return { s: o, e };
  }
  return null;
}
const topHit = (reps, cfg) => S.settings.rule === 'reach' ? reps >= cfg.max : reps > cfg.max;
function target(ex, i, last) {
  const cfg = ex.sets[i]; const ls = last && last.e.sets[i];
  if (!cfg || !ls || !hasData(ls, ex)) return { kind: 'new', w: null };
  const r = repsOf(ls, ex), w = num(ls.w);
  if (topHit(r, cfg)) return { kind: 'up', w: r2(w + (ex.inc || 0)), lastW: w, lastR: r };
  return { kind: 'same', w, lastW: w, lastR: r, goal: r + 1 };
}
function cmpVals(w, r, pw, pr) { if (w == null || r == null) return null; if (pw == null || pr == null) return 'new'; if (w > pw + 1e-9) return 'up'; if (w < pw - 1e-9) return 'down'; return r > pr ? 'up' : r < pr ? 'down' : 'eq'; }
function cmp(cur, prev, ex) { if (!hasData(cur, ex)) return null; if (!prev || !hasData(prev, ex)) return 'new'; return cmpVals(num(cur.w), repsOf(cur, ex), num(prev.w), repsOf(prev, ex)); }
function cmpSide(cur, prev, ex, f) { const w = num(cur?.w), r = num(cur?.[f]); if (w == null || r == null) return null; if (!prev || num(prev.w) == null) return 'new'; const pr = num(prev[f]) ?? repsOf(prev, ex); return cmpVals(w, r, num(prev.w), pr); }
const ARROW = { up: '↑', down: '↓', eq: '', new: '' };
const setTxt = (st, ex) => !hasData(st, ex) ? '–' : ex.uni ? `${kg(num(st.w))} × ${st.l ?? '–'}/${st.r ?? '–'}` : `${kg(num(st.w))} × ${st.reps}`;
const usedSets = (e, ex) => e.sets.slice(0, ex.sets.length);
function stats(s) {
  let sets = 0, up = 0, down = 0, vol = 0;
  for (const e of s.entries) {
    const ex = exById(e.exId); if (!ex) continue;
    const prev = lastBefore(e.exId, s);
    usedSets(e, ex).forEach((st, i) => {
      if (!hasData(st, ex)) return; sets++;
      vol += num(st.w) * (ex.uni ? (num(st.l) || 0) + (num(st.r) || 0) : num(st.reps));
      const c = cmp(st, prev && prev.e.sets[i], ex); if (c === 'up') up++; if (c === 'down') down++;
    });
  }
  return { sets, up, down, vol, ex: s.entries.filter(e => { const ex = exById(e.exId); return ex && e.sets.some(st => hasData(st, ex)); }).length };
}
function progItems(s) {
  const out = [];
  for (const e of s.entries) {
    const ex = exById(e.exId); if (!ex) continue; const prev = lastBefore(e.exId, s); if (!prev) continue;
    const c = [];
    usedSets(e, ex).forEach((st, i) => {
      const p = prev.e.sets[i]; if (!hasData(st, ex) || !hasData(p, ex)) return;
      const w = num(st.w), pw = num(p.w), r = repsOf(st, ex), pr = repsOf(p, ex);
      if (w > pw + 1e-9) c.push({ k: 'kg', d: `+${kg(r2(w - pw))} kg`, from: `${kg(pw)} kg`, to: `${kg(w)} kg`, sc: 3 - i * .01 });
      else if (Math.abs(w - pw) < 1e-9 && r > pr) c.push({ k: 'up', d: `+${r - pr} opak.`, from: `${pr} opak.`, to: `${r} opak.`, sc: 2 - i * .01 });
      else if (w < pw - 1e-9) c.push({ k: 'down', d: `−${kg(r2(pw - w))} kg`, from: `${kg(pw)} kg`, to: `${kg(w)} kg`, sc: 1 - i * .01 });
      else if (r < pr) c.push({ k: 'down', d: `−${pr - r} opak.`, from: `${pr} opak.`, to: `${r} opak.`, sc: 1 - i * .01 });
    });
    if (c.length) { c.sort((a, b) => b.sc - a.sc); out.push({ ex, ...c[0] }); }
  }
  return out.sort((a, b) => b.sc - a.sc);
}
function nextTemplate(after) {
  if (!S.templates.length) return null;
  const ref = after || finished().find(s => s.tid && tplById(s.tid))?.tid;
  if (!ref) return S.templates[0];
  const i = S.templates.findIndex(t => t.id === ref);
  return S.templates[(i + 1) % S.templates.length];
}

// ---------- UI infra ----------
let view = { n: 'home' };
let timerI;
const MARKHTML = (h = 26) => `<span class="mark" style="height:${h}px" aria-label="Jan Kodad">${MARK}</span>`;
function go(n, p = {}) { view = { n, ...p }; render(); window.scrollTo(0, 0); }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2000); }
function sheet(html, onMount) {
  const el = $('#sheet');
  el.innerHTML = `<div class="bd" data-a="close"></div><div class="pn" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  el.hidden = false; document.body.style.overflow = 'hidden'; onMount && onMount(el);
}
function closeSheet() { const el = $('#sheet'); el.hidden = true; el.innerHTML = ''; document.body.style.overflow = ''; }
const tabs = () => `<nav class="tabs">${[['home', 'Domů', 'home'], ['cal', 'Kalendář', 'cal'], ['mery', 'Míry', 'ruler'], ['acts', 'Aktivity', 'flame']]
  .map(([n, l, i]) => `<button data-a="tab" data-v="${n}" class="${view.n === n || (n === 'home' && ['gym', 'prog', 'progEx', 'lib', 'tpls', 'summary'].includes(view.n)) ? 'on' : ''}">${ico(i)}${l}</button>`).join('')}</nav>`;
const hdr = (left, mid, right) => `<header class="hdr">${left || '<span></span>'}${mid}${right || '<span></span>'}</header>`;
const backBtn = (to = 'home') => `<button class="round" data-a="tab" data-v="${to}" aria-label="Zpět">${ico('back')}</button>`;
function ringSVG(val, max, size, stroke, col) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, f = Math.min(1, max ? val / max : 0);
  return `<svg viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#2E2E31" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c * f} ${c}" ${f ? '' : 'stroke-opacity="0"'}/></svg>`;
}

function render() {
  clearInterval(timerI);
  const V = { home: vHome, cal: vCal, prog: vProg, progEx: vProgEx, lib: vLib, workout: vWorkout, fin: vFin, summary: vSummary, mery: vMery, gym: vGym, tpl: vTpl, tpls: vTpls, acts: vActs, settings: vSettings };
  $('#app').innerHTML = (V[view.n] || vHome)();
  const a = S.active && sesById(S.active);
  if (a && !a.end && view.n !== 'fin') timerI = setInterval(() => $$('[data-timer]').forEach(t => t.textContent = fclock((Date.now() - a.start) / 1000)), 1000);
  $$('textarea.notep').forEach(autoGrow);
  if (typeof cdPaint === 'function') cdPaint();
}

// ===================== HOME =====================
function weekCount(mon) { let c = 0; for (let i = 0; i < 7; i++) { const s = sessionOn(dkey(addDays(mon, i))); if (s && s.end) c++; } return c; }
function weekStrip(mon) {
  const t = today(); let h = '';
  for (let i = 0; i < 7; i++) {
    const x = addDays(mon, i), k = dkey(x); const s = sessionOn(k), a = actsOn(k), sick = S.days[k]?.sick;
    h += `<button class="w7 ${s ? (s.end ? 'done' : 'live') : ''} ${sick ? 'sick' : ''} ${k === t ? 'today' : ''}" data-a="day" data-k="${k}"><span>${DOW[x.getDay()]}</span><i></i><u class="${a.length ? 'on' : ''}"></u></button>`;
  }
  return h;
}
function vHome() {
  const t = today(), d = new Date(), mon = monday(d);
  const act = S.active && sesById(S.active); const done = sessionOn(t);
  const goal = S.settings.weekGoal || 4, wc = weekCount(mon);
  let gym;
  if (act && !act.end) {
    gym = `<div class="gcard live" data-a="open-active"><div class="lbl">Probíhá trénink</div><h1>${esc(act.name)}</h1><div class="gtime" data-timer>${fclock((Date.now() - act.start) / 1000)}</div>
      <div class="gfoot"><span class="mut">${SER(stats(act).sets)} zapsáno</span><button class="gplay" data-a="open-active" aria-label="Pokračovat">${ico('arrow')}</button></div></div>`;
  } else if (done && done.end) {
    const nt = nextTemplate(done.tid);
    gym = `<div class="gcard" data-a="open-sum" data-id="${done.id}"><div class="lbl">Trénink v gymu · dnes hotovo</div><h1>${esc(done.name)}</h1><p class="gsub">${fmin(done.end - done.start)} min · ${stats(done).sets} sérií · příště ${esc(nt?.name || '–')}</p>
      <div class="wk7">${weekStrip(mon)}</div><div class="gfoot"><span class="mut">${wc}/${goal} tento týden</span><button class="gplay ok" data-a="open-sum" data-id="${done.id}" aria-label="Shrnutí">${ico('check')}</button></div></div>`;
  } else {
    const nt = nextTemplate(); const last = nt && finished().find(s => s.tid === nt.id);
    gym = `<div class="gcard" data-a="gym-hub"><div class="lbl">Trénink v gymu</div><h1>${nt ? esc(nt.name) : 'Sestav si trénink'}</h1>
      <p class="gsub">${nt ? `Na řadě · ${CVK(nt.ex.length)}${last ? ` · minule ${fday(last.date)}, ${fmin(last.end - last.start)} min` : ''}` : 'Vyber cviky z knihovny a nastav rozsahy'}</p>
      <div class="wk7">${weekStrip(mon)}</div>
      <div class="gfoot"><span class="mut">${wc}/${goal} tento týden</span><button class="gplay" data-a="${nt ? 'start-next' : 'tpl-new'}" aria-label="${nt ? 'Začít trénink' : 'Sestavit trénink'}">${ico(nt ? 'play' : 'plus')}</button></div></div>`;
  }
  const bdays = Object.entries(BD().days).filter(([, x]) => x.weight != null).sort((a, c) => a[0] < c[0] ? 1 : -1);
  const v = bVerdict();
  const mTile = `<button class="hcard" data-a="measures"><span class="hic">${ico('ruler')}</span><b>Míry</b>${bdays.length ? `<span class="big">${nf(bdays[0][1].weight, 1)}<small> kg</small></span><i class="stp ${v.st[0]}">${v.ch == null ? 'zapiš váhu' : sg(v.ch, 2) + ' kg/týd.'}</i>` : `<small>Ranní váha, obvody, pocity</small>`}</button>`;
  const lastA = [...S.activities].sort((a, c) => c.date.localeCompare(a.date) || c.ts - a.ts)[0];
  const aw = S.activities.filter(a => toU(a.date) >= toU(dkey(mon))).length;
  const aTile = `<button class="hcard" data-a="tab" data-v="acts"><span class="hic" style="color:var(--heat)">${ico('flame')}</span><b>Aktivity</b>${lastA ? `<span class="big">${aw}<small> tento týden</small></span><i class="stp idle">${esc((ACT_TYPES[lastA.type] || {}).name || '')} · ${fday(lastA.date)}</i>` : '<small>Sauna, otužování, kolo, thai box</small>'}</button>`;
  const lastS = finished().find(s => !(done && done.id === s.id));
  const empty = !S.templates.length ? `<div class="empty" style="margin-top:14px"><b>Ještě nemáš žádný trénink</b><span>Sestav si ho z knihovny cviků, nebo si nejdřív proklikej ukázku.</span><div class="two"><button class="btn white" data-a="tpl-new">Sestavit</button><button class="btn" data-a="demo">Ukázka</button></div></div>` : '';
  return `<div class="wrap">
    <header class="htop">${MARKHTML(24)}<button class="round ghost" data-a="tab" data-v="settings" aria-label="Nastavení">${ico('gear')}</button></header>
    <div class="hdate">${DOWL[d.getDay()]} ${d.getDate()}. ${MONG[d.getMonth()]}</div>
    ${gym}
    ${typeof weekPromo === 'function' ? weekPromo() : ''}
    <div class="hgrid">${mTile}${aTile}</div>
    ${empty}
    ${lastS ? `<button class="hrow" data-a="open-sum" data-id="${lastS.id}"><span class="bar"></span><span class="t"><small>Poslední trénink · ${fday(lastS.date)}</small><b>${esc(lastS.name)}</b></span><span class="n">${fmin(lastS.end - lastS.start)} min${stats(lastS).up ? ` · <em>${stats(lastS).up} ↑</em>` : ''}</span></button>` : ''}
  </div>${tabs()}`;
}
function vGym() {
  const nt = nextTemplate(); const ex = sessionOn(today());
  const fs = finished(); const tot = fs.length;
  return `<div class="wrap">
    ${hdr(backBtn('home'), '<h1>Trénink v gymu</h1>', '<span></span>')}
    ${ex ? `<div class="alert">Dnes už máš zapsaný trénink <b>${esc(ex.name)}</b>. Jeden den = jeden trénink.</div><div class="bottom-acts" style="margin-top:12px"><button class="pill white" data-a="${ex.end ? 'open-sum' : 'open-active'}" data-id="${ex.id}">Otevřít dnešní trénink</button></div>` : ''}
    ${!ex ? `<div class="lbl" style="margin:6px 6px 10px">Vyber trénink</div><div class="list">${S.templates.map(tp => { const last = fs.find(s => s.tid === tp.id); return `<button class="li" data-a="start" data-id="${tp.id}"><span class="ic" style="color:${nt && nt.id === tp.id ? 'var(--done)' : 'var(--mut)'}">${ico('play')}</span><div class="t"><b>${esc(tp.name)}${nt && nt.id === tp.id ? ' <span class="chip prog" style="margin-left:6px">Na řadě</span>' : ''}</b><small>${CVK(tp.ex.length)}${last ? ` · naposledy ${fday(last.date)}` : ''}</small></div></button>`; }).join('') || '<div class="empty">Zatím žádný trénink.</div>'}
      <button class="li" data-a="free"><span class="ic">${ico('plus')}</span><div class="t"><b>Prázdný trénink</b><small>Cviky přidáváš za pochodu</small></div></button></div>` : ''}
    <div class="lbl" style="margin:26px 6px 10px">Přehled</div>
    <div class="list">
      <button class="li" data-a="tab" data-v="prog"><span class="ic" style="color:var(--prog)">${ico('chart')}</span><div class="t"><b>Progres cviků</b><small>Grafy, historie, kde stagnuješ · ${tot} tréninků</small></div><span class="chev">${ico('chev')}</span></button>
      <button class="li" data-a="tab" data-v="tpls"><span class="ic" style="color:var(--done)">${ico('dumbbell')}</span><div class="t"><b>Moje tréninky</b><small>${S.templates.length} sestav · pořadí = rotace</small></div><span class="chev">${ico('chev')}</span></button>
      <button class="li" data-a="tab" data-v="lib"><span class="ic">${ico('list')}</span><div class="t"><b>Knihovna cviků</b><small>${S.exercises.length} cviků · rozsahy, krok váhy, info</small></div><span class="chev">${ico('chev')}</span></button>
    </div>
  </div>${tabs()}`;
}
// ===================== START =====================
function pickTemplate() {
  const ex = sessionOn(today());
  if (ex) return sheet(`<h2>Dnes už máš trénink</h2><p class="mut">Jeden den = jeden trénink. Dnes je zapsaný <b style="color:var(--fg)">${esc(ex.name)}</b>.</p>
      <div class="actions"><button class="btn" data-a="close">Zavřít</button><button class="btn white" data-a="${ex.end ? 'open-sum' : 'open-active'}" data-id="${ex.id}">Otevřít</button></div>`);
  if (!S.templates.length) { tplDraft = { id: uid(), name: '', ex: [], finisher: '', _new: true }; return go('tpl'); }
  const nt = nextTemplate();
  sheet(`<h2>Jaký trénink?</h2><div class="list" style="margin-top:16px">${S.templates.map(tp => {
    const last = finished().find(s => s.tid === tp.id);
    return `<button class="li" data-a="start" data-id="${tp.id}"><div class="t"><b>${esc(tp.name)}${nt && nt.id === tp.id ? ' <span class="chip prog" style="margin-left:6px">Na řadě</span>' : ''}</b><small>${CVK(tp.ex.length)}${last ? ` · naposledy ${fday(last.date)}` : ''}</small></div><span class="chev">${ico('chev')}</span></button>`;
  }).join('')}</div><div class="actions"><button class="btn" data-a="tpl-new">${ico('plus')} Nový trénink</button></div>`);
}
function newSession(name, tid) {
  const s = { id: uid(), date: today(), tid: tid || null, name, start: Date.now(), end: null, entries: [], feel: null, perf: null, note: '', cardio: null, stretch: false, open: 0 };
  S.sessions.push(s); S.active = s.id; return s;
}
function startSession(tid) {
  const tp = tplById(tid); if (!tp) return;
  const s = newSession(tp.name, tid); tp.ex.forEach(id => addEntry(s, id));
  save(true); closeSheet(); go('workout', { id: s.id });
}
function addEntry(s, exId) {
  const ex = exById(exId); if (!ex) return;
  const last = lastBefore(exId, s);
  s.entries.push({ exId, sets: ex.sets.map((c, i) => ({ w: target(ex, i, last).w, reps: null, l: null, r: null })), note: '' });
}

// ===================== WORKOUT =====================
function exState(e, ex) { const u = usedSets(e, ex); const n = u.filter(st => hasData(st, ex)).length; return n === 0 ? '' : n === u.length ? 'done' : 'part'; }
function vWorkout() {
  const s = sesById(view.id); if (!s) return vHome();
  const live = !s.end;
  if (s.open == null) s.open = 0;
  return `<div class="wrap">
    ${hdr(`<button class="round" data-a="tab" data-v="home" aria-label="Zavřít">${ico('x')}</button>`, MARKHTML(26), `<button class="round" data-a="w-menu" aria-label="Možnosti">${ico('more')}</button>`)}
    ${live ? `<div class="timer">${ico('timer')}<span data-timer>${fclock((Date.now() - s.start) / 1000)}</span></div>` : `<p class="mut" style="text-align:center;margin:-6px 0 12px">Úprava: ${esc(s.name)} · ${fday(s.date)}</p>`}
    ${s.entries.map((e, i) => exCard(s, e, i)).join('') || '<div class="empty"><b>Prázdný trénink</b><span>Přidej první cvik tlačítkem dole.</span></div>'}
  </div>
  <div class="dock"><button class="pill add" data-a="add-ex">${ico('plus')} Cvik</button>${live ? `<button class="pill fin" data-a="finish">${ico('check')} Dokončit</button>` : `<button class="pill fin" data-a="save-edit">${ico('check')} Uložit</button>`}</div>`;
}
function exCard(s, e, idx) {
  const ex = exById(e.exId); if (!ex) return '';
  while (e.sets.length < ex.sets.length) e.sets.push({ w: null, reps: null, l: null, r: null });
  const st = exState(e, ex); const open = s.open === idx;
  const dots = usedSets(e, ex).map(x => `<u class="${hasData(x, ex) ? 'ok' : ''}"></u>`).join('');
  return `<article class="ex ${st} ${open ? 'open' : ''}" data-idx="${idx}">
    <button class="exh" data-a="ex-tog"><span class="bar"></span><div class="t"><div class="nm">${esc(ex.name)}<span class="inf" data-a="ex-info" data-id="${ex.id}" role="button" aria-label="Info o cviku">${ico('info')}</span></div><div class="sb">${esc(ex.muscle || '')}<span class="dots">${dots}</span></div></div><span class="cv">${ico('chevd')}</span></button>
    ${open ? exBody(s, e, ex) : ''}
  </article>`;
}
function exBody(s, e, ex) {
  const last = lastBefore(e.exId, s); const best = bestBefore(e.exId, s);
  const chips = [`<span class="chip">+${kg(ex.inc)} kg</span>`, ex.uni ? '<span class="chip uni">L první</span>' : '', ex.tempo ? `<span class="chip">${esc(ex.tempo)}</span>` : '', ex.partials ? '<span class="chip">+ polovičky</span>' : ''].join('');
  let rows = '';
  ex.sets.forEach((c, i) => {
    const st = e.sets[i]; const tg = target(ex, i, last);
    const ph = tg.kind === 'same' ? String(Math.max(tg.goal, c.min)) : String(c.min);
    const rg = `<span class="rg">${c.fail ? '<span class="fbadge">F</span>' : ''}<span>${c.min}–${c.max}</span></span>`;
    const prev = last && last.e.sets[i];
    if (ex.uni) {
      for (const f of ['l', 'r']) {
        const a = cmpSide(st, prev, ex, f); const pr = f === 'r' && isPR(st, ex, best);
        const ok = num(st.w) != null && num(st[f]) != null;
        rows += `<div class="tr" data-i="${i}" data-side="${f}"><span class="no">${i + 1}${f === 'l' ? 'L' : 'R'}</span>
          <span><input inputmode="decimal" data-f="w" value="${kg(num(st.w))}" placeholder="kg" aria-label="Váha"></span>
          <span class="rc"><input inputmode="numeric" data-f="${f}" value="${st[f] ?? ''}" placeholder="${ph}" aria-label="Opakování ${f === 'l' ? 'levá' : 'pravá'}">${arH(a, pr)}</span>
          ${f === 'l' ? rg : '<span></span>'}<button class="ck ${ok ? 'ok' : ''}" data-ck data-a="ck" aria-label="Potvrdit sérii"><span>${ico('check')}</span></button></div>`;
      }
    } else {
      const a = cmp(st, prev, ex); const pr = isPR(st, ex, best);
      rows += `<div class="tr" data-i="${i}"><span class="no">${i + 1}</span>
        <span><input inputmode="decimal" data-f="w" value="${kg(num(st.w))}" placeholder="kg" aria-label="Váha"></span>
        <span class="rc"><input inputmode="numeric" data-f="reps" value="${st.reps ?? ''}" placeholder="${ph}" aria-label="Opakování">${arH(a, pr)}</span>
        ${rg}<button class="ck ${hasData(st, ex) ? 'ok' : ''}" data-ck data-a="ck" aria-label="Potvrdit sérii"><span>${ico('check')}</span></button></div>`;
    }
  });
  return `<div class="exb">
    <div class="tools"><div class="chips">${chips}</div><button class="tb cdb" data-a="cd-start" aria-label="Odpočet před pracovní sérií">${ico('timer')}<span>${fcd(cdOf(ex))}</span></button>${ex.plates ? `<button class="tb" data-a="plates" aria-label="Kalkulačka kotoučů">${ico('plate')}</button>` : ''}<button class="tb" data-a="prog-ex" data-id="${ex.id}" aria-label="Statistiky cviku">${ico('bars')}</button><button class="tb" data-a="story-ex" aria-label="Uložit na story">${ico('share')}</button><button class="tb" data-a="ex-menu" aria-label="Možnosti">${ico('more')}</button></div>
    <div class="last">${last ? `Minule · ${fday(last.s.date)} — <b class="num">${usedSets(last.e, ex).map(x => setTxt(x, ex)).join(' · ')}</b>` : 'První záznam tohoto cviku'}</div>
    <div class="tbl"><div class="th"><span>#</span><span>Kg</span><span>Opak.</span><span>Rozsah</span><span>${ico('check')}</span></div>${rows}</div>
    <div class="nx" data-nx>${nextLines(s, e, ex, last)}</div>
    <textarea class="notep" data-in="exnote" rows="1" placeholder="Napiš poznámku…">${esc(ex.note)}</textarea>
  </div>`;
}
function nextLines(s, e, ex, last) {
  return ex.sets.map((c, i) => {
    const st = e.sets[i]; const tg = target(ex, i, last); const n = ex.sets.length > 1 ? `${i + 1}. série: ` : '';
    if (hasData(st, ex)) {
      const r = repsOf(st, ex), w = num(st.w);
      const side = ex.uni && num(st.l) != null && num(st.r) != null && num(st.l) !== num(st.r) ? ` (slabší strana ${r})` : '';
      if (topHit(r, c)) return `<span class="up">${n}↑ nad rozsahem${side} → příště <b>${kg(r2(w + ex.inc))} kg</b></span>`;
      if (r < c.min) return `<span class="down">${n}pod rozsahem${side} → příště zase ${kg(w)} kg</span>`;
      return `<span>${n}v rozsahu${side} → příště <b>${kg(w)} kg</b> a o opáčko víc</span>`;
    }
    if (tg.kind === 'up') return `<span class="up">${n}↑ přidej váhu: <b>${kg(tg.w)} kg</b> (minule ${kg(tg.lastW)} × ${tg.lastR})</span>`;
    if (tg.kind === 'same') return `<span>${n}cíl <b>${Math.max(tg.goal, c.min)}+ opak.</b> na ${kg(tg.w)} kg</span>`;
    return `<span>${n}zapiš váhu a opakování (${c.min}–${c.max})</span>`;
  }).join('');
}
function updateCard(card, s, e) {
  const ex = exById(e.exId); const last = lastBefore(e.exId, s); const best = bestBefore(e.exId, s);
  $$('.tr', card).forEach(row => {
    const i = +row.dataset.i, f = row.dataset.side, st = e.sets[i], prev = last && last.e.sets[i];
    const a = f ? cmpSide(st, prev, ex, f) : cmp(st, prev, ex);
    const pr = (!f || f === 'r') && isPR(st, ex, best); const ar = $('[data-ar]', row); ar.className = 'ar ' + (pr ? 'pr' : a || ''); ar.textContent = pr ? 'PR' : ARROW[a] || '';
    const ok = f ? num(st.w) != null && num(st[f]) != null : hasData(st, ex);
    $('[data-ck]', row).classList.toggle('ok', ok);
    if (f) { const wi = $('[data-f=w]', row); if (document.activeElement !== wi) wi.value = kg(num(st.w)); }
  });
  $('[data-nx]', card).innerHTML = nextLines(s, e, ex, last);
  const stt = exState(e, ex); card.classList.remove('done', 'part'); if (stt) card.classList.add(stt);
  $('.dots', card).innerHTML = usedSets(e, ex).map(x => `<u class="${hasData(x, ex) ? 'ok' : ''}"></u>`).join('');
}

// ===================== FINISH FLOW =====================
let finEnd = null;
function vFin() {
  const s = sesById(view.id); if (!s) return vHome();
  const step = view.step || 1; const end = s.end || finEnd || Date.now();
  const st = stats(s); const min = fmin(end - s.start);
  const bars = `<div class="steps">${[1, 2, 3].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`;
  const back = `<button class="round" data-a="fin-back" aria-label="Zpět">${ico('back')}</button>`;
  if (step === 1) return `<div class="wrap">${hdr(back, '<span></span>')}${bars}
    <div class="fl">${MARKHTML(36)}<div class="lbl">Odjeto</div><div class="huge">${min} <small>min</small></div><h2>${esc(s.name)}</h2>
      <div class="chips"><span class="chip o">${SER(st.sets)}</span><span class="chip o">${CVK(st.ex)}</span><span class="chip o">${thou(st.vol)} kg</span></div></div>
    <div class="bottom-acts"><button class="pill white" data-a="story-sum">Sdílet trénink</button><button class="pill dark" data-a="fin-step" data-v="2">Pokračovat</button></div></div>`;
  if (step === 2) {
    const items = progItems(s); const ups = items.filter(x => x.k !== 'down').length; const prs = sessionPRs(s);
    return `<div class="wrap">${hdr(back, '<span></span>')}${bars}
    <div style="text-align:center;padding-top:26px"><div class="lbl" style="color:var(--fg);letter-spacing:.16em">Trénink dokončen</div>
      <div class="burst"><span style="left:22px;top:42px;width:58px;height:58px">${ico('up')}</span><span style="left:66px;top:6px;width:76px;height:76px;border-color:var(--done);background:rgba(139,212,59,.1)">${ico('up')}</span><span style="right:20px;top:36px;width:52px;height:52px">${ico('up')}</span><span style="left:84px;top:92px;width:46px;height:46px;border-color:var(--down);background:rgba(229,72,77,.08)">${ico('up')}</span></div>
      <h1 style="font-size:44px">${prs.length ? 'Nový rekord!' : ups ? 'Gratulace' : 'Hotovo'}</h1><p style="font-size:19px;margin:12px 0 0">${ups ? 'Tvůj progres:' : items.length ? 'Tentokrát bez posunu. Příště to přijde.' : 'První zápis těchto cviků. Příště uvidíš posun.'}</p></div>
    ${prs.length ? `<div class="gl">${prs.map(p => `<div class="gi pr"><div class="t"><b>${esc(p.ex.name)}</b><small>Osobní rekord</small></div><div class="r"><div class="p"><span class="cir">${ico('medal')}</span><em>PR</em></div><div class="from">${kg(p.pw)} × ${p.pr} → <b>${kg(p.w)} × ${p.r}</b></div></div></div>`).join('')}</div>` : ''}
    <div class="gl">${items.filter(x => !prs.some(p => p.ex === x.ex)).map(x => `<div class="gi ${x.k}"><div class="t"><b>${esc(x.ex.name)}</b><small>${esc(x.ex.muscle || '')}</small></div><div class="r"><div class="p"><span class="cir">${ico(x.k === 'down' ? 'down' : 'up')}</span><em>${x.d}</em></div><div class="from">${x.from} → <b>${x.to}</b></div></div></div>`).join('')}</div>
    ${compareBlock(s)}
    <div class="bottom-acts" style="margin-top:26px"><button class="pill white" data-a="fin-step" data-v="3">Pokračovat</button></div></div>`;
  }
  const tp = tplById(s.tid); const c = s.cardio || {}; const mode = c.mode || 'none';
  return `<div class="wrap" style="padding-bottom:90px">${hdr(back, '<span></span>')}${bars}
    <div class="ov" style="margin-top:26px"><div class="lbl">Přehled</div><h1>Shrnutí tréninku</h1>
    <div class="ovc"><div class="row"><span class="ttl"><i></i>${esc(s.name)}</span></div>
      <div class="row"><span class="k">Poznámka:</span><input id="s-note" value="${esc(s.note)}" placeholder="Piš zde…"></div>
      <div class="row"><span class="k">Uplynulý čas:</span><span class="v">${fclock((end - s.start) / 1000)}</span></div></div>
    <div class="perfc"><div class="scl" style="margin:0 2px 10px"><span>Výkon v tréninku</span><small>1 slabý · 5 rekordní</small></div><div class="seg">${[1, 2, 3, 4, 5].map(v => `<button data-a="perf" data-v="${v}" class="${s.perf === v ? 'on' : ''}">${v}</button>`).join('')}</div></div>
    <div class="feel">${FEEL.map(([l, p], i) => `<button data-a="feel" data-v="${i + 1}" class="${s.feel === i + 1 ? 'on' : ''}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>${l}</button>`).join('')}</div>
    <div class="opt">
      ${tp && tp.finisher ? `<div class="reco"><span class="lbl">Doporučení na závěr</span>${esc(tp.finisher)}</div>` : ''}
      <button class="sw ${s.stretch ? 'on' : ''}" data-a="tog-stretch"><span>Statický strečink<small>Odškrtni, pokud jsi ho dal</small></span><span class="k"></span></button>
      <div class="card" style="padding:16px"><div class="lbl" style="margin:0 4px 10px">Kardio po tréninku</div>
        <div class="seg" data-seg="cmode">${[['none', 'Bez kardia'], ['join', 'K tréninku'], ['sep', 'Zvlášť']].map(([v, l]) => `<button data-a="cmode" data-v="${v}" class="${mode === v ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div class="form" id="cfields" ${mode === 'none' ? 'hidden' : ''} style="margin-top:12px;gap:10px">
          <label class="f">Typ<select id="c-type">${['Rotoped', 'Kolo', 'Běh', 'Chůze do kopce', 'Veslo'].map(o => `<option ${c.kind === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
          <div class="two"><label class="f">Minuty<input id="c-min" inputmode="numeric" value="${c.min ?? ''}" placeholder="15"></label>
          <label class="f">Tep (bpm)<input id="c-bpm" inputmode="numeric" value="${c.bpm ?? ''}" placeholder="120"></label></div></div>
        <p class="mut" style="font-size:13px;margin:10px 4px 0">K tréninku = ukáže se ve shrnutí. Zvlášť = samostatná aktivita. Čas se nesčítá.</p></div>
    </div>
    ${exTables(s)}</div>
    <div class="sfix"><button class="pill white" data-a="finish-save">Ukončit trénink</button></div></div>`;
}
function exTables(s, withShare) {
  return s.entries.map((e, idx) => {
    const ex = exById(e.exId); if (!ex || !e.sets.some(st => hasData(st, ex))) return '';
    const prev = lastBefore(e.exId, s); const best = bestBefore(e.exId, s); const hasPR = usedSets(e, ex).some(st => isPR(st, ex, best));
    const rows = usedSets(e, ex).map((st, i) => { if (!hasData(st, ex)) return ''; const a = cmp(st, prev && prev.e.sets[i], ex);
      return `<div class="tr"><span>${i + 1}</span><span>${kg(num(st.w))}</span><span>${a === 'up' || a === 'down' ? `<b class="ar ${a}" style="position:static;transform:none">${ARROW[a]}</b>` : ''}${ex.uni ? `${st.l ?? '–'}/${st.r ?? '–'}` : st.reps}</span><span>${ex.sets[i].fail ? '<span class="fbadge">F</span>' : `${ex.sets[i].min}–${ex.sets[i].max}`}</span></div>`; }).join('');
    return `<div class="extbl"><div class="eh"><i></i><div class="t"><b>${esc(ex.name)}</b><small>${esc(ex.muscle || '')}</small></div>${hasPR ? `<span class="badge-best">${ico('medal')}PR</span>` : ''}${withShare ? `<button class="round" style="width:44px;height:44px" data-a="story-ex2" data-i="${idx}" aria-label="Story cviku">${ico('share')}</button>` : ''}</div>
      <div class="th"><span>#</span><span>Kg</span><span>Opak.</span><span>Intenzita</span></div>${rows}</div>`;
  }).join('');
}
function finStore() {
  const s = sesById(view.id); if (!s || view.n !== 'fin' || (view.step || 1) !== 3) return;
  const n = $('#s-note'); if (n) s.note = n.value;
  const mode = $('[data-seg="cmode"] .on')?.dataset.v || 'none';
  s.cardio = mode === 'none' ? null : { mode, kind: $('#c-type').value, min: num($('#c-min').value), bpm: num($('#c-bpm').value) };
}

// ===================== SUMMARY =====================
function vSummary() {
  const s = sesById(view.id); if (!s) return vHome();
  const st = stats(s); const sep = S.activities.find(a => a.sessionId === s.id);
  const feel = s.feel ? FEEL[s.feel - 1] : null;
  const extra = [s.cardio && s.cardio.mode === 'join' ? `${s.cardio.kind} ${s.cardio.min ? s.cardio.min + ' min' : ''}${s.cardio.bpm ? ' · ' + s.cardio.bpm + ' bpm' : ''}` : '', s.stretch ? 'statický strečink' : '', sep ? `${sep.kind || 'kardio'} ${sep.min || ''} min (uloženo zvlášť)` : ''].filter(Boolean);
  return `<div class="wrap">
    ${hdr(backBtn('home'), `<h1>${fday(s.date)}</h1>`, `<button class="round" data-a="edit-ses" data-id="${s.id}" aria-label="Upravit">${ico('more')}</button>`)}
    <div class="ovc"><div class="row"><span class="ttl"><i></i>${esc(s.name)}</span></div>
      <div class="row"><span class="k">Čas:</span><span class="v">${fclock((s.end - s.start) / 1000)}</span></div>
      ${s.perf ? `<div class="row"><span class="k">Výkon:</span><span>${s.perf} / 5</span></div>` : ''}
      ${feel ? `<div class="row"><span class="k">Pocit:</span><span>${feel[0]}</span></div>` : ''}
      ${s.note ? `<div class="row"><span class="k">Poznámka:</span><span>${esc(s.note)}</span></div>` : ''}
      ${extra.length ? `<div class="row"><span class="k">Navíc:</span><span>${esc(extra.join(' + '))}</span></div>` : ''}</div>
    <div class="stat3" style="margin-top:14px"><div><span>Sérií</span><b>${st.sets}</b></div><div><span>Zlepšení</span><b class="up">${st.up}</b></div><div><span>Nazvedáno</span><b>${thou(st.vol)}</b></div></div>
    <div class="bottom-acts" style="margin-top:14px"><button class="pill white" data-a="story-sum">${ico('share')} Sdílet trénink</button></div>
    ${compareBlock(s)}
    ${exTables(s, true)}
  </div>${tabs()}`;
}

// ===================== CALENDAR =====================
let calM = (() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; })();
function vCal() {
  const { y, m } = calM; const off = (new Date(y, m, 1).getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate(); const t = today();
  let cells = ['po', 'út', 'st', 'čt', 'pá', 'so', 'ne'].map(d => `<div class="dn">${d}</div>`).join('');
  for (let i = 0; i < off; i++) cells += '<div class="cd out"></div>';
  let tr = 0, act = 0, sick = 0, mins = 0;
  for (let d = 1; d <= days; d++) {
    const k = dkey(new Date(y, m, d)); const s = sessionOn(k), a = actsOn(k), sk = S.days[k]?.sick;
    if (s && s.end) { tr++; mins += fmin(s.end - s.start); } act += a.length; if (sk) sick++;
    const dots = a.slice(0, 3).map(z => `<u class="dot-${ACT_TYPES[z.type]?.cls || 'act'}"></u>`).join('');
    cells += `<button class="cd ${k === t ? 'today' : ''} ${k > t ? 'future' : ''} ${s ? 'gym' : ''} ${sk && !s ? 'sick' : ''}" data-a="day" data-k="${k}"><span class="c">${d}</span><span class="ds">${dots}</span></button>`;
  }
  return `<div class="wrap">
    ${hdr('<span></span>', '<h1>Kalendář</h1>', `<button class="round ghost" data-a="act-new" data-k="${t}" aria-label="Přidat aktivitu">${ico('plus')}</button>`)}
    <div class="card"><div class="cal-h"><button class="round" style="width:44px;height:44px" data-a="cal-m" data-v="-1" aria-label="Předchozí měsíc">${ico('back')}</button><h2>${MON[m]} ${y}</h2><button class="round" style="width:44px;height:44px" data-a="cal-m" data-v="1" aria-label="Další měsíc">${ico('chev')}</button></div>
      <div class="cal">${cells}</div>
      <div class="legend"><span><u style="background:var(--done)"></u>Gym</span><span><u style="background:var(--heat)"></u>Sauna</span><span><u style="background:var(--ice)"></u>Otužování</span><span><u style="background:var(--prog)"></u>Aktivita</span><span><u style="background:var(--sick)"></u>Nemoc</span></div></div>
    <div class="bottom-acts" style="margin-top:12px"><button class="pill dark" data-a="week-sum">${ico('bars')} Souhrn týdne</button></div>
    <div class="stat3" style="margin-top:12px"><div><span>Tréninků</span><b>${tr}</b></div><div><span>Hodin v gymu</span><b>${kg(Math.round(mins / 6) / 10)}</b></div><div><span>Aktivit</span><b>${act}</b></div></div>
    ${sick ? `<p class="mut" style="text-align:center">Nemoc tento měsíc: ${sick} ${sick === 1 ? 'den' : sick < 5 ? 'dny' : 'dní'}</p>` : ''}
  </div>${tabs()}`;
}
function daySheet(k) {
  const s = sessionOn(k), a = actsOn(k), info = S.days[k] || {}; const future = k > today();
  sheet(`<h2>${flong(k)}</h2>
    <div class="list" style="margin-top:16px">
      ${s ? `<button class="li" data-a="${s.end ? 'open-sum' : 'open-active'}" data-id="${s.id}"><span class="ic" style="color:var(--done)">${ico('dumbbell')}</span><div class="t"><b>${esc(s.name)}</b><small>${s.end ? fmin(s.end - s.start) + ' min' : 'probíhá'}${s.cardio && s.cardio.mode === 'join' ? ` + ${esc(s.cardio.kind)} ${s.cardio.min || ''} min` : ''}</small></div><span class="chev">${ico('chev')}</span></button>`
      : `<div class="li"><div class="t"><b class="mut">${future ? 'Zatím nic' : 'Rest den'}</b><small>Bez tréninku v gymu</small></div></div>`}
      ${a.map(actRow).join('')}
    </div>
    <div class="form">
      <button class="sw ${info.sick ? 'on' : ''}" data-a="tog-sick" data-k="${k}"><span>Nemoc<small>Den se označí v kalendáři</small></span><span class="k"></span></button>
      ${info.sick ? `<input class="inp" id="sick-note" data-k="${k}" placeholder="Co ti je (nepovinné)" value="${esc(info.note || '')}">` : ''}
    </div>
    <div class="actions"><button class="btn" data-a="act-new" data-k="${k}">${ico('plus')} Aktivita</button><button class="btn white" data-a="close">Hotovo</button></div>`);
}

// ===================== STATISTICS =====================
function exHistory(exId) {
  const ex = exById(exId); const out = [];
  for (const s of [...finished()].reverse()) { const e = s.entries.find(x => x.exId === exId); if (e && e.sets.some(st => hasData(st, ex))) out.push({ s, e }); }
  return out;
}
function trendOf(exId) {
  const ex = exById(exId); const h = exHistory(exId);
  if (h.length < 2) return { k: 'na', t: h.length ? '1 záznam' : 'bez dat', n: h.length };
  let stag = 0; for (let i = h.length - 1; i > 0; i--) { if (cmp(h[i].e.sets[0], h[i - 1].e.sets[0], ex) === 'up') break; stag++; }
  if (stag >= 3) return { k: 'down', t: `stagnace ${stag}×`, n: h.length };
  const l = h.slice(-4); let u = 0, d = 0;
  for (let i = 1; i < l.length; i++) { const c = cmp(l[i].e.sets[0], l[i - 1].e.sets[0], ex); if (c === 'up') u++; if (c === 'down') d++; }
  return u > d ? { k: 'up', t: 'roste', n: h.length } : d > u ? { k: 'down', t: 'klesá', n: h.length } : { k: 'flat', t: 'drží', n: h.length };
}
function vProg() {
  const rows = S.exercises.filter(ex => exHistory(ex.id).length).map(ex => ({ ex, tr: trendOf(ex.id) }))
    .sort((a, b) => ({ down: 0, flat: 1, up: 2, na: 3 }[a.tr.k] - { down: 0, flat: 1, up: 2, na: 3 }[b.tr.k]));
  const cnt = k => rows.filter(r => r.tr.k === k).length;
  const fs = finished(); const tot = fs.length; const totMin = fs.reduce((a, s) => a + fmin(s.end - s.start), 0);
  const chip = { up: 'prog', flat: '', down: 'down', na: '' };
  return `<div class="wrap">
    ${hdr(backBtn('gym'), '<h1>Progres cviků</h1>', '<span></span>')}
    <div class="stat3"><div>${ico('arm')}<span>Tréninků</span><b>${tot}</b></div><div>${ico('timer')}<span>Průměr</span><b>${tot ? Math.round(totMin / tot) : 0}<small style="font-size:14px"> min</small></b></div><div>${ico('bolt')}<span>Celkem hodin</span><b>${kg(Math.round(totMin / 6) / 10)}</b></div></div>
    ${rows.length ? `<section class="sec"><div class="sec-h"><h2>Cviky</h2></div>
      <div class="stat3"><div><span>Roste</span><b class="up">${cnt('up')}</b></div><div><span>Drží</span><b>${cnt('flat')}</b></div><div><span>Pozor</span><b class="down">${cnt('down')}</b></div></div>
      <p class="mut" style="font-size:14px;margin:12px 4px">Hodnotí se první pracovní série. Stagnace = 3 tréninky po sobě bez zlepšení.</p>
      <div class="list">${rows.map(({ ex, tr }) => `<button class="li" data-a="prog-ex" data-id="${ex.id}"><div class="t"><b>${esc(ex.name)}</b><small>${tr.n} tréninků · ${esc(ex.muscle)}</small></div><span class="chip ${chip[tr.k]}">${tr.t}</span></button>`).join('')}</div></section>`
      : `<section class="sec"><div class="empty"><b>Zatím žádná data</b><span>Po prvních trénincích tu uvidíš u každého cviku, jestli roste, drží, nebo stagnuje.</span></div></section>`}
  </div>${tabs()}`;
}
function bestOf(h, ex) { let b = null; h.forEach(({ s, e }) => usedSets(e, ex).forEach(st => { if (!hasData(st, ex)) return; const w = num(st.w), r = repsOf(st, ex); if (!b || w > b.w || (w === b.w && r > b.r)) b = { w, r, sid: s.id }; })); return b; }
function vProgEx() {
  const ex = exById(view.id); if (!ex) return vProg();
  const h = exHistory(ex.id); const best = bestOf(h, ex);
  const totalSets = h.reduce((a, { e }) => a + usedSets(e, ex).filter(st => hasData(st, ex)).length, 0);
  const tr = trendOf(ex.id);
  return `<div class="wrap">
    ${hdr(`<button class="round" data-a="back-from-stats" aria-label="Zpět">${ico('back')}</button>`, `<h1 style="font-size:17px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(ex.name)}</h1>`, `<button class="round" data-a="ex-edit" data-id="${ex.id}" aria-label="Upravit cvik">${ico('more')}</button>`)}
    <div class="lbl" style="margin:0 6px 12px">Statistiky cviku ${tr.k !== 'na' ? `<span class="chip ${tr.k === 'up' ? 'prog' : tr.k === 'down' ? 'down' : ''}" style="margin-left:8px;letter-spacing:0;text-transform:none">${tr.t}</span>` : ''}</div>
    <div class="stat3"><div>${ico('weight')}<span>Nejlepší váha</span><b>${best ? kg(best.w) + ' kg' : '–'}</b></div><div>${ico('bolt')}<span>Celkem sérií</span><b>${totalSets}</b></div><div>${ico('arm')}<span>Celkem tréninků</span><b>${h.length}</b></div></div>
    <div class="card" style="margin-top:14px;padding:18px 14px">${chartSVG(h, ex)}</div>
    <div class="actions"><button class="btn block" data-a="ex-info" data-id="${ex.id}">${ico('info')} Info o cviku</button></div>
    <div class="lbl" style="margin:26px 6px 0">Historie cviku</div>
    ${[...h].reverse().map(({ s, e }) => `<div class="extbl ${best && best.sid === s.id ? 'best' : ''}"><div class="eh"><div class="t"><b>${fdate(s.date)}</b><small>${esc(s.name)}</small></div>${best && best.sid === s.id ? `<span class="badge-best">${ico('medal')}Nejlepší</span>` : ''}</div>
      <div class="th"><span>#</span><span>Kg</span><span>Opak.</span><span>Intenzita</span></div>
      ${usedSets(e, ex).map((st, i) => hasData(st, ex) ? `<div class="tr"><span>${i + 1}</span><span>${kg(num(st.w))}</span><span>${ex.uni ? `${st.l ?? '–'}/${st.r ?? '–'}` : st.reps}</span><span>${ex.sets[i]?.fail ? '<span class="fbadge">F</span>' : `${ex.sets[i]?.min ?? ''}–${ex.sets[i]?.max ?? ''}`}</span></div>` : '').join('')}
      ${e.note ? `<p class="mut" style="margin:0;padding:4px 20px 16px;font-size:14px">${esc(e.note)}</p>` : ''}</div>`).join('') || '<p class="mut" style="margin:12px 6px">Zatím bez záznamů.</p>'}
  </div>${tabs()}`;
}
function chartSVG(h, ex) {
  const pts = h.slice(-14).map(({ s, e }) => ({ d: s.date, w: num(e.sets[0]?.w), r: repsOf(e.sets[0], ex) })).filter(p => p.w != null);
  if (pts.length < 2) return '<p class="mut" style="margin:6px">Graf se ukáže po dvou trénincích.</p>';
  const W = 340, H = 210, L = 38, R = 14, T = 22, B = 30;
  let mn = Math.min(...pts.map(p => p.w)), mx = Math.max(...pts.map(p => p.w));
  const span = Math.max(mx - mn, 4); const mid = (mn + mx) / 2; mn = mid - span * .75; mx = mid + span * .75;
  const step = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50].find(s => (mx - mn) / s <= 6) || 100;
  const ticks = []; for (let v = Math.ceil(mn / step) * step; v <= mx; v += step) ticks.push(r2(v));
  const x = i => L + (W - L - R) * i / (pts.length - 1), y = v => T + (H - T - B) * (1 - (v - mn) / (mx - mn));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.w).toFixed(1)}`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Vývoj váhy první série">
    ${ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#2E2E31"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${kg(v)}</text>`).join('')}
    <line x1="${L}" x2="${L}" y1="${T}" y2="${H - B}" stroke="#3A3A3D"/>
    <path d="${line}" fill="none" stroke="var(--prog)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.w)}" r="${i === pts.length - 1 ? 5 : 3.5}" fill="${i === pts.length - 1 ? 'var(--prog)' : '#1C1C1E'}" stroke="var(--prog)" stroke-width="2"/><text x="${x(i)}" y="${y(p.w) - 10}" text-anchor="middle" style="fill:#F5F5F7;font-weight:600">${p.r}</text>`).join('')}
    <text x="${x(0)}" y="${H - 8}" text-anchor="start">${fday(pts[0].d)}</text><text x="${x(pts.length - 1)}" y="${H - 8}" text-anchor="end">${fday(pts[pts.length - 1].d)}</text>
  </svg><p class="mut" style="font-size:13px;margin:6px 6px 0">Čára = váha první série, číslo = opakování.</p>`;
}

// ===================== LIBRARY =====================
let libQ = '';
function muscleGroup(m = '') {
  m = m.toLowerCase();
  if (/hrud/.test(m)) return 'Hrudník'; if (/zád|lat|trap/.test(m)) return 'Záda'; if (/delt|ramen/.test(m)) return 'Ramena';
  if (/biceps|triceps|brachi|předlok/.test(m)) return 'Paže'; if (/kvadr|hamstr|hýžd|lýt|addukt|abdukt|stehn|noh/.test(m)) return 'Nohy'; if (/břich|core/.test(m)) return 'Břicho';
  return 'Ostatní';
}
function libList() {
  const q = libQ.toLowerCase(); const groups = {};
  S.exercises.filter(e => !q || (e.name + ' ' + e.muscle).toLowerCase().includes(q)).forEach(e => { const g = muscleGroup(e.muscle); (groups[g] = groups[g] || []).push(e); });
  return ['Hrudník', 'Záda', 'Ramena', 'Paže', 'Nohy', 'Břicho', 'Ostatní'].filter(g => groups[g]).map(g => `<div class="lbl grp">${g}</div><div class="list">${groups[g].map(e => `<button class="li" data-a="ex-view" data-id="${e.id}"><div class="t"><b>${esc(e.name)}</b><small>${esc(e.muscle)} · ${e.sets.map(c => `${c.min}–${c.max}`).join(' / ')} · +${kg(e.inc)} kg${e.uni ? ' · L/P' : ''}</small></div><span class="chev">${ico('chev')}</span></button>`).join('')}</div>`).join('') || '<p class="mut">Nic nenalezeno.</p>';
}
function vLib() {
  return `<div class="wrap">
    ${hdr(backBtn('gym'), '<h1>Knihovna</h1>', `<button class="round" data-a="ex-new" aria-label="Nový cvik">${ico('plus')}</button>`)}
    <input class="search" id="lib-q" type="search" placeholder="Hledat cvik nebo partii…" value="${esc(libQ)}">
    <div id="lib-list">${libList()}</div>
  </div>${tabs()}`;
}
function infoSheet(id) {
  const ex = exById(id);
  sheet(`<h2>${esc(ex.name)}</h2><div class="chips" style="margin-top:12px">${ex.sets.map((c, i) => `<span class="chip">${i + 1}. série ${c.min}–${c.max}${c.fail ? ' · F' : ''}</span>`).join('')}<span class="chip">+${kg(ex.inc)} kg</span>${ex.uni ? '<span class="chip uni">Jednostranně</span>' : ''}${ex.tempo ? `<span class="chip">Tempo ${esc(ex.tempo)}</span>` : ''}${ex.partials ? '<span class="chip">+ polovičky</span>' : ''}</div>
    <div class="info-b">
      <div><div class="lbl">Primárně</div><div>${esc(ex.muscle || '–')}</div></div>
      ${ex.secondary && ex.secondary !== '–' ? `<div><div class="lbl">Sekundárně</div><div>${esc(ex.secondary)}</div></div>` : ''}
      ${(ex.cues || []).length ? `<div><div class="lbl">Na co si dát pozor</div><ul>${ex.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}
      ${ex.note ? `<div class="reco"><span class="lbl">Tvoje poznámka</span>${esc(ex.note)}</div>` : ''}
    </div>
    <div class="actions"><button class="btn" data-a="prog-ex" data-id="${ex.id}">${ico('bars')} Statistiky</button><button class="btn white" data-a="ex-edit" data-id="${ex.id}">Upravit</button></div>`);
}
let exDraft = null;
function exEditSheet(id, onSave) {
  const ex = id ? exById(id) : null;
  exDraft = ex ? JSON.parse(JSON.stringify(ex)) : { id: uid(), name: '', muscle: '', secondary: '', uni: false, inc: 1.25, sets: [{ min: 4, max: 8, fail: true }, { min: 6, max: 9, fail: true }], cues: [], tempo: '', partials: false, note: '' };
  exDraft._new = !ex; exDraft._onSave = onSave; drawExEdit();
}
function drawExEdit() {
  const d = exDraft;
  sheet(`<h2>${d._new ? 'Nový cvik' : 'Upravit cvik'}</h2>
    <div class="form">
      <label class="f">Název<input id="e-name" value="${esc(d.name)}" placeholder="např. Legpress"></label>
      <div class="two"><label class="f">Primárně cílí na<input id="e-muscle" value="${esc(d.muscle)}" placeholder="Kvadricepsy"></label><label class="f">Sekundárně<input id="e-sec" value="${esc(d.secondary)}" placeholder="Hýždě"></label></div>
      <div><div class="lbl" style="margin-bottom:8px">Série · rozsah opakování · do selhání</div>
        <div style="display:grid;gap:8px" id="e-sets">${d.sets.map((c, i) => `<div class="setcfg" data-i="${i}"><span class="n">${i + 1}.</span><input class="inp" inputmode="numeric" data-sf="min" value="${c.min}" aria-label="Minimum"><input class="inp" inputmode="numeric" data-sf="max" value="${c.max}" aria-label="Maximum"><button class="fb ${c.fail ? 'on' : ''}" data-a="set-fail" data-i="${i}" aria-label="Do selhání">F</button><button class="rm" data-a="set-rm" data-i="${i}" aria-label="Odebrat sérii">${ico('x')}</button></div>`).join('')}</div>
        ${d.sets.length < 4 ? `<button class="btn sm" style="margin-top:8px" data-a="set-add">${ico('plus')} Přidat sérii</button>` : ''}
      </div>
      <label class="f">Přidávat váhu po (kg)<input id="e-inc" inputmode="decimal" value="${kg(d.inc)}" placeholder="0,25"></label>
      <div class="seg">${[0.25, 0.5, 1, 1.25, 2.5].map(v => `<button data-a="inc-q" data-v="${v}" class="${d.inc === v ? 'on' : ''}">${kg(v)}</button>`).join('')}</div>
      <button class="sw ${d.uni ? 'on' : ''}" data-a="e-uni"><span>Jednostranný cvik<small>Zapisuje se 1L a 1R, začíná slabší levá</small></span><span class="k"></span></button>
      <button class="sw ${d.plates ? 'on' : ''}" data-a="e-plates"><span>Nakládá se osa<small>U cviku se ukáže kalkulačka kotoučů</small></span><span class="k"></span></button>
      ${d.plates ? `<label class="f">Váha osy / saní (kg)<input id="e-bar" inputmode="decimal" value="${kg(d.plates.bar)}" placeholder="20"></label>` : ''}
      <div class="two"><label class="f">Tempo<input id="e-tempo" value="${esc(d.tempo)}" placeholder="2-0-X-0"></label><label class="f">Polovičky<button class="sw ${d.partials ? 'on' : ''}" data-a="e-part" style="min-height:50px;padding:0 14px"><span>Po plném rozsahu</span><span class="k"></span></button></label></div>
      <div><div class="lbl" style="margin-bottom:8px">Odpočet před pracovní sérií</div><div class="seg">${[[0, 'Výchozí'], [90, '1:30'], [120, '2:00'], [180, '3:00'], [240, '4:00']].map(([v, l]) => `<button data-a="e-cd" data-v="${v}" class="${(d.cd || 0) === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <label class="f">Na co si dát pozor (každý bod na nový řádek)<textarea id="e-cues" placeholder="Lopatky stažené…">${esc((d.cues || []).join('\n'))}</textarea></label>
      <label class="f">Poznámka (ukáže se při každém tréninku)<input id="e-note" value="${esc(d.note)}" placeholder="např. používat trhačky"></label>
    </div>
    <div id="e-conf"></div>
    <div class="actions">${d._new ? '' : `<button class="btn danger" data-a="ex-del" aria-label="Smazat">${ico('trash')}</button>`}<button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="ex-save">Uložit</button></div>`);
}
function readExDraft() {
  const d = exDraft;
  d.name = $('#e-name').value.trim(); d.muscle = $('#e-muscle').value.trim(); d.secondary = $('#e-sec').value.trim();
  if (d.plates && $('#e-bar')) d.plates.bar = num($('#e-bar').value) ?? 20;
  d.inc = num($('#e-inc').value) ?? d.inc; d.tempo = $('#e-tempo').value.trim(); d.note = $('#e-note').value;
  d.cues = $('#e-cues').value.split('\n').map(x => x.trim()).filter(Boolean);
  $$('#e-sets .setcfg').forEach(r => { const i = +r.dataset.i; d.sets[i].min = num($('[data-sf=min]', r).value) ?? d.sets[i].min; d.sets[i].max = num($('[data-sf=max]', r).value) ?? d.sets[i].max; });
}

// ===================== TEMPLATES =====================
function vTpls() {
  return `<div class="wrap">
    ${hdr(backBtn('gym'), '<h1>Moje tréninky</h1>', `<button class="round" data-a="tpl-new" aria-label="Nový trénink">${ico('plus')}</button>`)}
    <p class="mut" style="font-size:14px;margin:0 4px 14px">Pořadí = rotace. Na úvodu se ti vždy nabídne další trénink v pořadí.</p>
    <div class="list">${S.templates.map((t, i) => `<div class="li"><div class="t" data-a="tpl-edit" data-id="${t.id}" style="cursor:pointer"><b>${esc(t.name)}</b><small>${t.ex.map(id => exById(id)?.name).filter(Boolean).join(', ') || 'bez cviků'}</small></div>
      ${i ? `<button class="round" style="width:42px;height:42px" data-a="tpl-mv" data-id="${t.id}" aria-label="Posunout výš">${ico('up')}</button>` : ''}</div>`).join('') || '<div class="empty">Zatím žádný trénink.</div>'}</div>
  </div>${tabs()}`;
}
let tplDraft = null;
function vTpl() {
  const d = tplDraft;
  return `<div class="wrap" style="padding-bottom:20px">
    ${hdr(`<button class="round" data-a="tpl-cancel" aria-label="Zpět">${ico('back')}</button>`, `<h1>${d._new ? 'Nový trénink' : 'Upravit trénink'}</h1>`, `<button class="round" data-a="tpl-save" aria-label="Uložit" style="background:var(--white);color:var(--ink)">${ico('check')}</button>`)}
    <div class="form" style="margin-top:0">
      <label class="f">Název<input id="t-name" value="${esc(d.name)}" placeholder="např. Upper A, Leg day"></label>
      <div><div class="lbl" style="margin-bottom:8px">Cviky v pořadí</div>
        <div class="list">${d.ex.map((id, i) => { const ex = exById(id); return ex ? `<div class="li"><span class="lbl" style="width:16px">${i + 1}</span><div class="t"><b>${esc(ex.name)}</b><small>${ex.sets.map(c => `${c.min}–${c.max}`).join(' / ')} · +${kg(ex.inc)} kg</small></div>
          ${i ? `<button class="round" style="width:40px;height:40px" data-a="tx-mv" data-i="${i}" aria-label="Nahoru">${ico('up')}</button>` : ''}<button class="round" style="width:40px;height:40px" data-a="tx-rm" data-i="${i}" aria-label="Odebrat">${ico('x')}</button></div>` : ''; }).join('')}</div>
        <button class="btn block" style="margin-top:10px" data-a="tx-add">${ico('plus')} Přidat cvik</button></div>
      <label class="f">Doporučení na konec (ukáže se při dokončení)<textarea id="t-fin" placeholder="Rotoped 15 min, tep 120 bpm + statický strečink">${esc(d.finisher || '')}</textarea></label>
    </div>
    <div id="t-conf"></div>
    <div class="bottom-acts" style="margin-top:20px"><button class="pill white" data-a="tpl-save">Uložit trénink</button>${d._new ? '' : `<button class="btn danger block" data-a="tpl-del">Smazat trénink</button>`}</div>
  </div>`;
}
let pickCb = null;
function pickExSheet(onPick) {
  let q = '';
  const draw = () => { $('#pk-list').innerHTML = S.exercises.filter(e => !q || (e.name + ' ' + e.muscle).toLowerCase().includes(q.toLowerCase())).map(e => `<button class="li" data-a="pk" data-id="${e.id}"><div class="t"><b>${esc(e.name)}</b><small>${esc(e.muscle)}</small></div><span class="chev">${ico('plus')}</span></button>`).join('') || '<p class="mut">Nic nenalezeno – vytvoř nový cvik.</p>'; };
  sheet(`<h2>Přidat cvik</h2><input class="search" style="margin-top:14px" id="pk-q" type="search" placeholder="Hledat…"><div class="list" id="pk-list"></div>
    <div class="actions"><button class="btn" data-a="pk-new">${ico('plus')} Nový cvik</button><button class="btn white" data-a="close">Hotovo</button></div>`, () => { draw(); $('#pk-q').addEventListener('input', ev => { q = ev.target.value; draw(); }); });
  pickCb = onPick;
}

// ===================== ACTIVITIES =====================
function vActs() {
  const recent = [...S.activities].sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts).slice(0, 40);
  return `<div class="wrap">
    ${hdr(backBtn('home'), '<h1>Aktivity</h1>', '<span></span>')}
    <div class="agrid">${Object.entries(ACT_TYPES).map(([k, t]) => `<button class="at ${t.cls}" data-a="act-new" data-t="${k}"><span class="ic">${ico(t.icon)}</span>${t.name}</button>`).join('')}</div>
    <section class="sec"><div class="sec-h"><h2>Poslední záznamy</h2></div><div class="list">${recent.map(actRow).join('') || '<div class="empty">Zatím nic. Klepni na aktivitu nahoře.</div>'}</div></section>
  </div>${tabs()}`;
}
function actDesc(a) {
  const p = [];
  if (a.type === 'sauna') { p.push(saunaTotals(a).it.map(saunaLine).join(' + ')); }
  else if (a.type === 'cold') { if (a.kind) p.push(a.kind); if (a.sec) p.push(`${Math.floor(a.sec / 60)}:${pad(a.sec % 60)}`); if (a.temp != null && a.temp !== '') p.push(`${kg(a.temp)} °C`); }
  else { if (a.kind) p.push(a.kind); if (a.min) p.push(`${a.min} min`); if (a.bpm) p.push(`${a.bpm} bpm`); }
  return p.join(' · ');
}
function actRow(a) {
  const t = ACT_TYPES[a.type] || ACT_TYPES.other;
  return `<button class="li" data-a="act-edit" data-id="${a.id}"><span class="ic ${t.cls}">${ico(t.icon)}</span><div class="t"><b>${esc(a.label || t.name)}</b><small>${fday(a.date)} · ${esc(actDesc(a))}${a.note ? ' · ' + esc(a.note) : ''}</small></div></button>`;
}
function actSheet(type, k, id) {
  if (!type && !id) return sheet(`<h2>Přidat aktivitu</h2><p class="mut" style="margin:4px 0 0">${flong(k || today())}</p><div class="agrid" style="margin-top:16px">${Object.entries(ACT_TYPES).map(([t, x]) => `<button class="at ${x.cls}" data-a="act-new" data-t="${t}" data-k="${k || today()}"><span class="ic">${ico(x.icon)}</span>${x.name}</button>`).join('')}</div>`);
  const a = id ? S.activities.find(x => x.id === id) : { type, date: k || today() };
  type = a.type; const t = ACT_TYPES[type];
  let f = '';
  if (type === 'sauna') f = `<div class="three"><label class="f">Kola<input id="a-rounds" inputmode="numeric" value="${a.rounds ?? ''}" placeholder="3"></label><label class="f">Min / kolo<input id="a-min" inputmode="numeric" value="${a.min ?? ''}" placeholder="12"></label><label class="f">Teplota °C<input id="a-temp" inputmode="numeric" value="${a.temp ?? ''}" placeholder="90"></label></div>`;
  else if (type === 'cold') f = `<div class="seg" data-seg="kind">${['Ledová sprcha', 'Káď', 'Venku'].map(o => `<button data-a="seg" data-v="${o}" class="${(a.kind || 'Ledová sprcha') === o ? 'on' : ''}">${o}</button>`).join('')}</div>
    <div class="three"><label class="f">Minuty<input id="a-mm" inputmode="numeric" value="${a.sec ? Math.floor(a.sec / 60) : ''}" placeholder="3"></label><label class="f">Sekundy<input id="a-ss" inputmode="numeric" value="${a.sec ? a.sec % 60 : ''}" placeholder="0"></label><label class="f">Voda °C<input id="a-temp" inputmode="decimal" value="${kg(a.temp)}" placeholder="5"></label></div>`;
  else if (type === 'bike') f = `<div class="seg" data-seg="kind">${['Rotoped', 'Kolo venku'].map(o => `<button data-a="seg" data-v="${o}" class="${(a.kind || 'Rotoped') === o ? 'on' : ''}">${o}</button>`).join('')}</div><div class="two"><label class="f">Minuty<input id="a-min" inputmode="numeric" value="${a.min ?? ''}" placeholder="20"></label><label class="f">Tep (bpm)<input id="a-bpm" inputmode="numeric" value="${a.bpm ?? ''}" placeholder="120"></label></div>`;
  else f = `${type === 'other' ? `<label class="f">Co to bylo<input id="a-label" value="${esc(a.label || '')}" placeholder="např. Plavání"></label>` : ''}<label class="f">Minuty<input id="a-min" inputmode="numeric" value="${a.min ?? ''}" placeholder="60"></label>`;
  sheet(`<h2>${esc(t.name)}</h2><div class="form">
    <label class="f">Datum<input id="a-date" type="date" value="${a.date}"></label>${f}
    <label class="f">Poznámka<input id="a-note" value="${esc(a.note || '')}" placeholder="nepovinné"></label></div>
    <div class="actions">${id ? `<button class="btn danger" data-a="act-del" data-id="${id}" aria-label="Smazat">${ico('trash')}</button><button class="btn" data-a="act-share" data-id="${id}" aria-label="Sdílet">${ico('share')}</button>` : ''}<button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="act-save" data-t="${type}" data-id="${id || ''}">Uložit</button></div>`);
}
function fx(cls, title, sub) {
  const el = document.createElement('div'); el.id = 'fx'; el.className = cls;
  el.innerHTML = `<canvas></canvas><div class="msg"><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;
  document.body.appendChild(el);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = $('canvas', el), ctx = cv.getContext('2d'); const dpr = devicePixelRatio || 1; const W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
  const P = Array.from({ length: cls === 'cold' ? 80 : cls === 'heat' ? 44 : 0 }, () => ({ x: Math.random() * W, y: cls === 'cold' ? Math.random() * -H : H + Math.random() * H * .5, r: 1 + Math.random() * 2.6, v: .6 + Math.random() * 1.4, s: Math.random() * 6.28 }));
  let raf; const t0 = performance.now();
  const step = t => {
    ctx.clearRect(0, 0, W, H);
    for (const p of P) {
      if (cls === 'cold') { p.y += p.v; p.x += Math.sin(t / 900 + p.s) * .4; ctx.fillStyle = 'rgba(225,240,255,.85)'; }
      else { p.y -= p.v * 1.3; p.x += Math.sin(t / 500 + p.s) * .6; ctx.fillStyle = `rgba(242,140,78,${Math.max(0, Math.min(.7, p.y / H))})`; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
    }
    if (t - t0 < 1900) raf = requestAnimationFrame(step);
  };
  if (!reduce && P.length) raf = requestAnimationFrame(step);
  setTimeout(() => { cancelAnimationFrame(raf); el.style.transition = 'opacity .35s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 360); }, 1900);
}

// ===================== SETTINGS =====================
function vSettings() {
  const demo = S.sessions.some(s => s.demo) || S.templates.some(t => t.demo);
  return `<div class="wrap">
    ${hdr(backBtn('home'), '<h1>Nastavení</h1>', '<span></span>')}
    <section><div class="lbl" style="margin:0 6px 10px">Kdy přidat váhu</div>
      <div class="seg">${[['exceed', 'Při překročení'], ['reach', 'Při dosažení']].map(([v, l]) => `<button data-a="rule" data-v="${v}" class="${S.settings.rule === v ? 'on' : ''}">${l}</button>`).join('')}</div>
      <p class="mut" style="font-size:14px;margin:10px 6px">Rozsah 4–8: ${S.settings.rule === 'exceed' ? '9 opakování → příště víc váhy, 8 → stejná váha.' : '8 opakování → příště víc váhy.'}</p></section>
    <section class="sec"><div class="lbl" style="margin:0 6px 10px">Odpočet před pracovní sérií (výchozí)</div>
      <div class="seg">${[90, 120, 150, 180, 240].map(v => `<button data-a="set-cd" data-v="${v}" class="${(S.settings.cd || 120) === v ? 'on' : ''}">${fcd(v)}</button>`).join('')}</div>
      <p class="mut" style="font-size:14px;margin:10px 6px">U každého cviku jde nastavit vlastní (Upravit cvik).</p>
      <button class="sw ${S.settings.cdSound === false ? '' : 'on'}" data-a="tog-sound"><span>Zvuk na konci odpočtu<small>Pípnutí, když máš jít na pracovní sérii</small></span><span class="k"></span></button></section>
    <section class="sec"><div class="lbl" style="margin:0 6px 10px">Kotouče v tvém gymu</div>
      <div class="chips">${PLATE_ALL.map(p => `<button class="chip ${plateSet().includes(p) ? 'prog' : ''}" data-a="plate-tog" data-v="${p}">${kg(p)} kg</button>`).join('')}</div>
      <p class="mut" style="font-size:14px;margin:10px 6px">Kalkulačka počítá jen se zvýrazněnými kotouči.</p></section>
    <section class="sec"><div class="lbl" style="margin:0 6px 10px">Tréninků týdně (cíl)</div>
      <div class="seg">${[2, 3, 4, 5, 6].map(v => `<button data-a="goal" data-v="${v}" class="${(S.settings.weekGoal || 4) === v ? 'on' : ''}">${v}</button>`).join('')}</div></section>
    <section class="sec"><button class="li" data-a="tab" data-v="tpls"><span class="ic" style="color:var(--done)">${ico('dumbbell')}</span><div class="t"><b>Moje tréninky</b><small>${S.templates.length} sestav · rotace</small></div><span class="chev">${ico('chev')}</span></button></section>
    <section class="sec"><div class="lbl" style="margin:0 6px 10px">Záloha dat</div>
      <div class="card" style="display:grid;gap:14px"><p style="margin:0;font-size:15px" class="mut">Všechno se ukládá jen v tvém iPhonu, proto appka jede i bez signálu. Když appku smažeš nebo změníš telefon, data zmizí. Záloha je jeden soubor do iCloudu, který kdykoliv nahraješ zpátky.</p>
      <div class="two"><button class="btn white" data-a="export">${ico('share')} Zálohovat</button><label class="btn" for="imp">Obnovit</label></div><input id="imp" type="file" accept="application/json,.json" hidden>
      <p class="mut" style="font-size:13px;margin:0">Poslední záloha: ${S.settings.lastBackup ? new Date(S.settings.lastBackup).toLocaleDateString('cs-CZ') : 'zatím nikdy'}</p></div></section>
    ${typeof pushCard === 'function' ? pushCard() : ''}
    ${demo ? `<section class="sec"><button class="btn danger block" data-a="demo-clear">Smazat ukázková data</button></section>` : ''}
    <div style="margin:40px auto 0;opacity:.5;display:grid;justify-items:center;gap:8px">${MARKHTML(22)}<span class="mut" style="font-size:12px">Kodad boost · verze ${typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''}</span></div>
  </div>${tabs()}`;
}
async function exportData() {
  const json = JSON.stringify(S); const name = `kodad-boost-zaloha-${today()}.json`;
  try { const file = new File([json], name, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Záloha Kodad boost' }); S.settings.lastBackup = Date.now(); save(true); render(); return; } } catch (e) { if (e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(json); S.settings.lastBackup = Date.now(); save(true); toast('Záloha zkopírována do schránky'); render(); }
  catch (e) { sheet(`<h2>Záloha</h2><p class="mut">Zkopíruj celý text a ulož si ho do Poznámek nebo Souborů.</p><textarea class="inp" style="min-height:240px;font-size:12px" readonly>${esc(json)}</textarea>`); }
}

// ===================== STORY IMAGES =====================
const CF = '-apple-system, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif';
let markImg = null;
function loadMark() {
  if (markImg) return Promise.resolve(markImg);
  return new Promise(res => { const im = new Image(); im.onload = () => { markImg = im; res(im); }; im.onerror = () => res(null);
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(MARK.replace('currentColor', '#FFFFFF')); });
}
// ---------- sdílecí karty v2: malé, čisté, s grafikou sportu ----------
function rr(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function spacedL(x, t, X, Y, sp) { x.textAlign = 'left'; let cx = X; for (const ch of [...t]) { x.fillText(ch, cx, Y); cx += x.measureText(ch).width + sp; } return cx; }
function fitFont(x, t, weight, size, maxW) { do { x.font = `${weight} ${size}px ${CF}`; size -= 3; } while (x.measureText(t).width > maxW && size > 28); }
function clip(x, t, maxW) { let n = t; while (x.measureText(n).width > maxW && n.length > 3) n = n.slice(0, -2); return n === t ? t : n.trim() + '…'; }
const CARD_COL = { gym: ['#8BD43B', 'rgba(139,212,59,'], sauna: ['#F28C4E', 'rgba(242,140,78,'], cold: ['#9ACBF5', 'rgba(154,203,245,'], thai: ['#E5484D', 'rgba(229,72,77,'], yoga: ['#B59CF0', 'rgba(181,156,240,'], bike: ['#35D0C9', 'rgba(53,208,201,'], other: ['#35D0C9', 'rgba(53,208,201,'], pr: ['#F4C542', 'rgba(244,197,66,'] };
function drawPicto(x, key, cx, cy, size, col) {
  const s = size / 24; x.save(); x.translate(cx - size / 2, cy - size / 2); x.scale(s, s);
  x.strokeStyle = col; x.lineWidth = 1.5; x.lineCap = 'round'; x.lineJoin = 'round';
  try { x.stroke(new Path2D(PICTO[key] || PICTO.other)); } catch (e) { }
  x.restore();
}
// kostra karty: kruh s piktogramem vlevo, obsah vpravo, logo dole
async function miniCard(h, key, draw, dateTxt) {
  const mk = await loadMark(); const [col, rgba] = CARD_COL[key] || CARD_COL.other;
  const W = 1080, c = document.createElement('canvas'); c.width = W; c.height = h; const x = c.getContext('2d');
  rr(x, 0, 0, W, h, 60); const g = x.createLinearGradient(0, 0, W, h); g.addColorStop(0, '#1F1F22'); g.addColorStop(1, '#0F0F11'); x.fillStyle = g; x.fill();
  x.save(); rr(x, 0, 0, W, h, 60); x.clip();
  const rg = x.createRadialGradient(200, h / 2, 10, 200, h / 2, 520); rg.addColorStop(0, rgba + '.20)'); rg.addColorStop(1, rgba + '0)'); x.fillStyle = rg; x.fillRect(0, 0, W, h);
  x.restore();
  x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 2.5; rr(x, 1.25, 1.25, W - 2.5, h - 2.5, 59); x.stroke();
  // medailon
  const cy = Math.min(h / 2, 250), R = 130;
  x.beginPath(); x.arc(200, cy, R, 0, Math.PI * 2); x.fillStyle = rgba + '.12)'; x.fill();
  x.lineWidth = 3; x.strokeStyle = rgba + '.45)'; x.stroke();
  drawPicto(x, PICTO[key] ? key : 'gym', 200, cy, 170, col);
  // datum + logo
  x.textAlign = 'right'; x.fillStyle = '#6C6C70'; x.font = `500 28px ${CF}`; x.fillText(dateTxt, W - 64, 84);
  if (mk) { const lh = 34, lw = lh * (mk.naturalWidth || mk.width) / (mk.naturalHeight || mk.height); x.globalAlpha = .55; x.drawImage(mk, W - 64 - lw, h - 64 - lh, lw, lh); x.globalAlpha = 1; }
  x.textAlign = 'left'; draw(x, col, 400); return c;
}
function bigNum(x, big, unit, X, Y, size) {
  x.fillStyle = '#F5F5F7'; x.font = `800 ${size}px ${CF}`; x.fillText(big, X, Y); const w = x.measureText(big).width;
  if (unit) { x.fillStyle = '#8E8E93'; x.font = `700 ${Math.round(size * .36)}px ${CF}`; x.fillText(unit, X + w + 12, Y); }
}
async function storySummary(s) {
  const st = stats(s); const min = fmin((s.end || finEnd || Date.now()) - s.start);
  const prs = sessionPRs(s).slice(0, 2);
  const cardio = s.cardio && s.cardio.mode === 'join';
  const extra = [cardio ? `+ ${s.cardio.kind} ${s.cardio.min ? s.cardio.min + ' min' : ''}`.trim() : '', s.stretch ? '+ strečink' : ''].filter(Boolean).join('   ');
  const h = 500 + (extra ? 56 : 0) + prs.length * 62;
  const c = await miniCard(h, prs.length ? 'gym' : 'gym', (x, col, X) => {
    x.fillStyle = col; x.font = `700 30px ${CF}`; spacedL(x, clip(x, s.name.toUpperCase(), 520), X, 150, 7);
    bigNum(x, String(min), 'min', X - 4, 300, 170);
    x.fillStyle = '#C7C7CC'; x.font = `500 36px ${CF}`; x.fillText(`${CVK(st.ex)}  ·  ${SER(st.sets)}  ·  ${thou(st.vol)} kg`, X, 372);
    let y = 432;
    if (extra) { x.fillStyle = '#8E8E93'; x.font = `500 32px ${CF}`; x.fillText(extra, X, y); y += 56; }
    prs.forEach(p => { x.fillStyle = '#F4C542'; x.font = `700 32px ${CF}`; x.fillText('PR', X, y); x.fillStyle = '#F5F5F7'; x.font = `500 32px ${CF}`; x.fillText(clip(x, `${p.ex.name}  ${kg(p.w)} × ${p.r}`, 560), X + 58, y); y += 62; });
  }, fdate(s.date));
  showShot(c, `trenink-${s.date}.png`);
}
async function storyExercise(s, e) {
  const ex = exById(e.exId); const prev = lastBefore(e.exId, s); const best = bestBefore(e.exId, s);
  const rows = usedSets(e, ex).map((st, i) => ({ st, i })).filter(o => hasData(o.st, ex));
  const pr = rows.some(o => isPR(o.st, ex, best));
  const h = Math.max(500, 250 + rows.length * 86 + (prev ? 70 : 20) + 60);
  const c = await miniCard(h, pr ? 'pr' : 'gym', (x, col, X) => {
    x.fillStyle = pr ? '#F4C542' : col; x.font = `700 28px ${CF}`; spacedL(x, pr ? 'NOVÝ REKORD' : clip(x, s.name.toUpperCase(), 480), X, 140, 7);
    x.fillStyle = '#F5F5F7'; fitFont(x, ex.name, 800, 64, 600); x.fillText(ex.name, X, 215);
    let y = 300;
    rows.forEach(({ st, i }) => {
      const a = cmp(st, prev && prev.e.sets[i], ex); const isP = isPR(st, ex, best);
      x.fillStyle = '#6C6C70'; x.font = `600 30px ${CF}`; x.fillText(`${i + 1}.`, X, y);
      x.fillStyle = '#F5F5F7'; x.font = `700 52px ${CF}`; const t = `${kg(num(st.w))} kg × ${ex.uni ? `${st.l ?? '–'}/${st.r ?? '–'}` : st.reps}`; x.fillText(t, X + 52, y + 2);
      const w = x.measureText(t).width;
      if (isP) { x.fillStyle = '#F4C542'; x.font = `800 30px ${CF}`; x.fillText('PR', X + 76 + w, y - 4); }
      else if (a === 'up' || a === 'down') { x.fillStyle = a === 'up' ? '#35D0C9' : '#E5484D'; x.font = `800 44px ${CF}`; x.fillText(ARROW[a], X + 70 + w, y); }
      y += 86;
    });
    const meta = [ex.tempo && `tempo ${ex.tempo}`, ex.partials && '+ polovičky', prev && `minule ${usedSets(prev.e, ex).map(t => setTxt(t, ex)).join(' · ')}`].filter(Boolean).join('   ');
    if (meta) { x.fillStyle = '#6C6C70'; x.font = `500 28px ${CF}`; x.fillText(clip(x, meta, 600), X, y - 10); }
  }, fdate(s.date));
  showShot(c, `${ex.name}.png`);
}
async function storyActivity(a) {
  const t = ACT_TYPES[a.type] || ACT_TYPES.other; const key = PICTO[a.type] ? a.type : 'other';
  let big, unit = '', sub = [];
  if (a.type === 'sauna') { const t = saunaTotals(a); big = `${t.rounds}×`; unit = t.mins ? `${t.mins} min` : ''; sub = t.it.map(x => [x.kind, `${x.rounds || 1}×${x.min ? ' ' + x.min + ' min' : ''}`, x.temp ? x.temp + ' °C' : ''].filter(Boolean).join(' ')); }
  else if (a.type === 'cold') { big = a.sec ? `${Math.floor(a.sec / 60)}:${pad(a.sec % 60)}` : '✓'; unit = a.sec ? 'min' : ''; if (a.kind) sub.push(a.kind); if (a.temp != null) sub.push(`voda ${kg(a.temp)} °C`); }
  else { big = a.min ? String(a.min) : '✓'; unit = a.min ? 'min' : ''; if (a.kind) sub.push(a.kind); if (a.bpm) sub.push(`${a.bpm} bpm`); }
  if (a.note) sub.push(a.note);
  const title = (a.type === 'other' && a.label ? a.label : t.name).toUpperCase();
  const multi = a.type === 'sauna' && sub.length > 1 + (a.note ? 1 : 0);
  const c = await miniCard(multi ? 452 + sub.length * 50 : 500, key, (x, col, X) => {
    if (a.type === 'cold') { x.fillStyle = 'rgba(225,240,255,.35)'; for (let i = 0; i < 30; i++) { const px = 420 + (i * 197) % 620, py = 40 + (i * 131) % 420; x.beginPath(); x.arc(px, py, 1.5 + (i % 3), 0, 6.28); x.fill(); } }
    x.fillStyle = col; x.font = `700 30px ${CF}`; spacedL(x, clip(x, title, 480), X, 150, 7);
    bigNum(x, big, unit, X - 4, 300, 170);
    if (multi) { sub.forEach((t, i) => { x.fillStyle = i < sub.length - (a.note ? 1 : 0) ? '#C7C7CC' : '#8E8E93'; x.font = `500 34px ${CF}`; x.fillText(clip(x, t, 600), X, 372 + i * 50); }); }
    else if (sub.length) { x.fillStyle = '#C7C7CC'; x.font = `500 36px ${CF}`; x.fillText(clip(x, sub.join('  ·  '), 600), X, 372); }
  }, fdate(a.date));
  showShot(c, `${t.name}-${a.date}.png`);
}

function showShot(canvas, name) {
  const el = document.createElement('div'); el.id = 'shot';
  el.innerHTML = `<img src="${canvas.toDataURL('image/png')}" alt="Náhled pro story"><p>Klepni na „Uložit / sdílet“ → „Uložit obrázek“. Případně podrž prst na obrázku → „Přidat do Fotek“.</p><div class="bottom-acts"><button class="pill white" data-x="share">${ico('share')} Uložit / sdílet</button><button class="pill dark" data-x="close">Zavřít</button></div>`;
  document.body.appendChild(el);
  el.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-x]'); if (!b) return;
    if (b.dataset.x === 'close') return el.remove();
    try {
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const file = new File([blob], name.replace(/[\\/:*?"<>|]/g, ''), { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] }); else toast('Podrž prst na obrázku a ulož ho');
    } catch (e) { if (e.name !== 'AbortError') toast('Podrž prst na obrázku a ulož ho'); }
  });
}

// ===================== DEMO =====================
function loadDemo() {
  const find = n => S.exercises.find(e => e.name === n)?.id;
  const tA = { id: uid(), name: 'Upper A', ex: ['Bench press', 'Přítahy s oporou hrudníku', 'Tlak s jednoručkami na šikmé lavici', 'Stahování kladky', 'Upažování na kladce', 'Bicepsový zdvih na kladce', 'Stahování kladky na triceps'].map(find).filter(Boolean), finisher: 'Rotoped 15 min, tep kolem 120 bpm + statický strečink', demo: true };
  const tB = { id: uid(), name: 'Lower A', ex: ['Hack dřep', 'Rumunský mrtvý tah', 'Leg press', 'Zakopávání vsedě', 'Předkopávání', 'Lýtka ve stoje'].map(find).filter(Boolean), finisher: 'Statický strečink 10 min', demo: true };
  S.templates.push(tA, tB);
  const mk = (daysAgo, tp, data, mins) => {
    const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(17, 30, 0, 0);
    const s = { id: uid(), date: dkey(d), tid: tp.id, name: tp.name, start: d.getTime(), end: d.getTime() + mins * 60000, entries: [], feel: 3, note: '', cardio: null, stretch: true, demo: true };
    tp.ex.forEach((id, i) => { const ex = exById(id); const v = data[i] || data[0]; s.entries.push({ exId: id, note: '', sets: ex.sets.map((c, j) => ex.uni ? { w: v[j * 2], l: v[j * 2 + 1], r: v[j * 2 + 1] + 1, reps: null } : { w: v[j * 2], reps: v[j * 2 + 1], l: null, r: null }) }); });
    S.sessions.push(s);
  };
  mk(9, tA, [[100, 6, 85, 8], [70, 8, 60, 9], [34, 7, 30, 9], [72.5, 9, 65, 10], [7.5, 11, 6, 13], [30, 7, 25, 9], [32.5, 9, 27.5, 11]], 84);
  mk(7, tB, [[120, 7, 100, 9], [110, 6, 95, 8], [200, 8, 180, 10], [55, 9, 47.5, 11], [70, 10, 60, 12], [100, 10, 90, 11]], 95);
  mk(4, tA, [[100, 8, 85, 9], [72.5, 7, 62.5, 9], [34, 9, 30, 10], [72.5, 11, 67.5, 10], [7.5, 13, 6, 14], [30, 9, 25, 10], [32.5, 10, 27.5, 12]], 88);
  mk(2, tB, [[122.5, 6, 102.5, 9], [110, 7, 95, 9], [200, 9, 180, 11], [55, 11, 50, 10], [70, 11, 62.5, 11], [100, 12, 90, 12]], 101);
  const d2 = addDays(new Date(), -2), d3 = addDays(new Date(), -1);
  S.activities.push({ id: uid(), type: 'sauna', date: dkey(d2), rounds: 3, min: 12, temp: 90, ts: Date.now(), demo: true });
  S.activities.push({ id: uid(), type: 'cold', kind: 'Káď', date: dkey(d3), sec: 180, temp: 4, ts: Date.now(), demo: true });
  save(true); render(); toast('Ukázka načtena');
}
function clearDemo() {
  S.templates = S.templates.filter(t => !t.demo); S.sessions = S.sessions.filter(s => !s.demo); S.activities = S.activities.filter(a => !a.demo);
  if (S.active && !sesById(S.active)) S.active = null; save(true); go('home'); toast('Ukázka smazána');
}

// ===================== EVENTS =====================
let statsBack = null;
const A = {
  close: () => closeSheet(),
  tab: b => { closeSheet(); go(b.dataset.v); },
  gym: () => go('gym'),
  free: () => { const ex = sessionOn(today()); if (ex) return go('gym'); const s = newSession('Volný trénink'); save(true); go('workout', { id: s.id }); A['add-ex'](); },
  start: b => startSession(b.dataset.id),
  'open-active': b => { closeSheet(); go('workout', { id: b.dataset.id || S.active }); },
  'open-sum': b => { closeSheet(); go('summary', { id: b.dataset.id }); },
  measures: () => sheet(`<h2>Míry</h2><p class="mut" style="font-size:16px">Sem napojím tvou appku na míry, až mi ji pošleš. Nemoc si už teď označíš v kalendáři klepnutím na den.</p><div class="actions"><button class="btn" data-a="close">Rozumím</button><button class="btn white" data-a="tab" data-v="cal">Kalendář</button></div>`),
  day: b => daySheet(b.dataset.k),
  'cal-m': b => { calM.m += +b.dataset.v; if (calM.m < 0) { calM.m = 11; calM.y--; } if (calM.m > 11) { calM.m = 0; calM.y++; } render(); },
  'tog-sick': b => { const k = b.dataset.k; const d = S.days[k] = S.days[k] || {}; d.sick = !d.sick; if (!d.sick) delete d.note; save(true); render(); daySheet(k); },
  // workout
  'ex-tog': b => { const s = sesById(view.id); const i = +b.closest('.ex').dataset.idx; s.open = s.open === i ? -1 : i; save(); render(); const el = $(`.ex[data-idx="${i}"]`); if (el && s.open === i) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); },
  'ex-info': b => infoSheet(b.dataset.id),
  'w-menu': () => { const s = sesById(view.id); sheet(`<h2>${esc(s.name)}</h2><div class="list" style="margin-top:16px">
      <button class="li" data-a="rename"><div class="t"><b>Přejmenovat trénink</b></div></button>
      ${!s.end ? `<button class="li" data-a="discard"><div class="t"><b style="color:var(--down)">Zahodit trénink</b><small>Smaže dnešní zápis</small></div></button>` : ''}</div><div id="w-conf"></div>`); },
  rename: () => { const s = sesById(view.id); sheet(`<h2>Název tréninku</h2><div class="form"><input id="rn" class="inp" value="${esc(s.name)}"></div><div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="rename-ok">Uložit</button></div>`); },
  'rename-ok': () => { const s = sesById(view.id); s.name = $('#rn').value.trim() || s.name; save(true); closeSheet(); render(); },
  discard: () => { $('#w-conf').innerHTML = `<div class="confirm">Opravdu zahodit dnešní trénink? Nejde to vrátit.<button class="btn danger" data-a="discard2">Zahodit</button></div>`; },
  discard2: () => { S.sessions = S.sessions.filter(s => s.id !== view.id); S.active = null; save(true); closeSheet(); go('home'); toast('Trénink zahozen'); },
  finish: () => { finEnd = Date.now(); go('fin', { id: view.id, step: 1 }); },
  'fin-step': b => { finStore(); go('fin', { id: view.id, step: +b.dataset.v }); },
  'fin-back': () => { finStore(); const st = view.step || 1; if (st > 1) go('fin', { id: view.id, step: st - 1 }); else { finEnd = null; go('workout', { id: view.id }); } },
  feel: b => { const s = sesById(view.id); s.feel = s.feel === +b.dataset.v ? null : +b.dataset.v; $$('.feel button').forEach(x => x.classList.toggle('on', +x.dataset.v === s.feel)); save(); },
  'tog-stretch': b => { const s = sesById(view.id); s.stretch = !s.stretch; b.classList.toggle('on', s.stretch); save(); },
  cmode: b => { $$('[data-seg="cmode"] button').forEach(x => x.classList.toggle('on', x === b)); $('#cfields').hidden = b.dataset.v === 'none'; },
  'finish-save': () => {
    finStore(); const s = sesById(view.id);
    S.activities = S.activities.filter(a => a.sessionId !== s.id);
    if (s.cardio && s.cardio.mode === 'sep') { const c = s.cardio; S.activities.push({ id: uid(), type: 'bike', kind: c.kind, min: c.min, bpm: c.bpm, date: s.date, ts: Date.now(), sessionId: s.id }); s.cardio = null; }
    s.end = s.end || finEnd || Date.now(); finEnd = null;
    s.entries.forEach(e => { const ex = exById(e.exId); if (ex) e.note = ex.note; });
    if (S.active === s.id) S.active = null;
    save(true); go('summary', { id: s.id }); toast('Trénink uložen');
  },
  'save-edit': () => { const s = sesById(view.id); s.entries.forEach(e => { const ex = exById(e.exId); if (ex) e.note = ex.note; }); save(true); go('summary', { id: s.id }); toast('Uloženo'); },
  'edit-ses': b => go('workout', { id: b.dataset.id }),
  'add-ex': () => { const s = sesById(view.id); pickExSheet(id => { addEntry(s, id); s.open = s.entries.length - 1; save(); closeSheet(); render(); const el = $(`.ex[data-idx="${s.open}"]`); el && el.scrollIntoView({ block: 'start' }); }); },
  'story-ex': b => { const s = sesById(view.id); const e = s.entries[+b.closest('.ex').dataset.idx]; const ex = exById(e.exId); if (!e.sets.some(st => hasData(st, ex))) return toast('Nejdřív zapiš aspoň jednu sérii'); storyExercise(s, e); },
  'story-ex2': b => { const s = sesById(view.id); storyExercise(s, s.entries[+b.dataset.i]); },
  'story-sum': () => storySummary(sesById(view.id)),
  'ex-menu': b => {
    const idx = +b.closest('.ex').dataset.idx; const s = sesById(view.id); const e = s.entries[idx];
    sheet(`<h2>${esc(exById(e.exId).name)}</h2><div class="list" style="margin-top:16px">
      <button class="li" data-a="ex-edit" data-id="${e.exId}"><div class="t"><b>Upravit cvik</b><small>Rozsahy, krok váhy, tempo, info</small></div></button>
      ${idx > 0 ? `<button class="li" data-a="en-mv" data-i="${idx}" data-v="-1"><div class="t"><b>Posunout výš</b></div></button>` : ''}
      ${idx < s.entries.length - 1 ? `<button class="li" data-a="en-mv" data-i="${idx}" data-v="1"><div class="t"><b>Posunout níž</b></div></button>` : ''}
      <button class="li" data-a="en-rm" data-i="${idx}"><div class="t"><b style="color:var(--down)">Odebrat z dnešního tréninku</b></div></button></div>`);
  },
  'en-mv': b => { const s = sesById(view.id); const i = +b.dataset.i, j = i + +b.dataset.v; [s.entries[i], s.entries[j]] = [s.entries[j], s.entries[i]]; s.open = j; save(); closeSheet(); render(); },
  'en-rm': b => { const s = sesById(view.id); s.entries.splice(+b.dataset.i, 1); s.open = -1; save(); closeSheet(); render(); },
  // library & stats
  'ex-view': b => infoSheet(b.dataset.id),
  'ex-new': () => exEditSheet(null),
  'ex-edit': b => exEditSheet(b.dataset.id),
  'set-add': () => { readExDraft(); const l = exDraft.sets[exDraft.sets.length - 1] || { min: 6, max: 9 }; exDraft.sets.push({ min: l.min + 2, max: l.max + 1, fail: true }); drawExEdit(); },
  'set-rm': b => { readExDraft(); if (exDraft.sets.length > 1) exDraft.sets.splice(+b.dataset.i, 1); drawExEdit(); },
  'set-fail': b => { readExDraft(); const c = exDraft.sets[+b.dataset.i]; c.fail = !c.fail; drawExEdit(); },
  'inc-q': b => { readExDraft(); exDraft.inc = +b.dataset.v; drawExEdit(); },
  'e-uni': () => { readExDraft(); exDraft.uni = !exDraft.uni; drawExEdit(); },
  'e-part': () => { readExDraft(); exDraft.partials = !exDraft.partials; drawExEdit(); },
  'ex-save': () => {
    readExDraft(); const d = exDraft;
    if (!d.name) return toast('Doplň název cviku');
    if (d.sets.some(c => c.min > c.max)) return toast('Minimum nesmí být větší než maximum');
    const cb = d._onSave; delete d._new; delete d._onSave;
    const i = S.exercises.findIndex(e => e.id === d.id); if (i >= 0) S.exercises[i] = d; else S.exercises.push(d);
    save(true); closeSheet(); toast('Cvik uložen'); if (cb) cb(d.id); else render();
  },
  'ex-del': () => { const used = S.templates.some(t => t.ex.includes(exDraft.id)) || S.sessions.some(s => s.entries.some(e => e.exId === exDraft.id));
    $('#e-conf').innerHTML = `<div class="confirm">${used ? 'Cvik je v historii nebo v tréninku. Smazáním zmizí i jeho historie.' : 'Smazat cvik z knihovny?'}<button class="btn danger" data-a="ex-del2">Smazat</button></div>`; },
  'ex-del2': () => { const id = exDraft.id; S.exercises = S.exercises.filter(e => e.id !== id); S.templates.forEach(t => t.ex = t.ex.filter(x => x !== id)); S.sessions.forEach(s => s.entries = s.entries.filter(e => e.exId !== id)); save(true); closeSheet(); go('lib'); },
  'prog-ex': b => { closeSheet(); statsBack = view.n === 'progEx' ? statsBack : { ...view }; go('progEx', { id: b.dataset.id }); },
  'back-from-stats': () => { const b = statsBack; statsBack = null; if (b && b.n !== 'progEx') { view = b; render(); } else go('prog'); },
  'gym-hub': () => go('gym'),
  'start-next': () => { const ex = sessionOn(today()); if (ex) return go('gym'); const nt = nextTemplate(); if (nt) startSession(nt.id); },
  pk: b => { pickCb && pickCb(b.dataset.id); },
  'pk-new': () => { const cb = pickCb; exEditSheet(null, id => cb && cb(id)); },
  // templates
  'tpl-new': () => { closeSheet(); tplDraft = { id: uid(), name: '', ex: [], finisher: '', _new: true }; go('tpl'); },
  'tpl-edit': b => { tplDraft = JSON.parse(JSON.stringify(tplById(b.dataset.id))); go('tpl'); },
  'tpl-cancel': () => go('tpls'),
  'tpl-mv': b => { const i = S.templates.findIndex(t => t.id === b.dataset.id); if (i > 0) { [S.templates[i - 1], S.templates[i]] = [S.templates[i], S.templates[i - 1]]; save(); render(); } },
  'tx-add': () => { syncTpl(); pickExSheet(id => { if (!tplDraft.ex.includes(id)) { tplDraft.ex.push(id); toast('Přidáno'); } else toast('Už v tréninku je'); render(); }); },
  'tx-mv': b => { syncTpl(); const i = +b.dataset.i; [tplDraft.ex[i], tplDraft.ex[i - 1]] = [tplDraft.ex[i - 1], tplDraft.ex[i]]; render(); },
  'tx-rm': b => { syncTpl(); tplDraft.ex.splice(+b.dataset.i, 1); render(); },
  'tpl-save': () => {
    syncTpl(); const d = tplDraft; if (!d.name.trim()) return toast('Doplň název tréninku'); if (!d.ex.length) return toast('Přidej aspoň jeden cvik');
    const isNew = d._new; delete d._new; const i = S.templates.findIndex(t => t.id === d.id); if (i >= 0) S.templates[i] = d; else S.templates.push(d);
    save(true); toast('Trénink uložen'); go(isNew && S.templates.length === 1 ? 'home' : 'tpls');
  },
  'tpl-del': () => { $('#t-conf').innerHTML = `<div class="confirm">Smazat trénink „${esc(tplDraft.name)}“? Odjeté tréninky v historii zůstanou.<button class="btn danger" data-a="tpl-del2">Smazat</button></div>`; },
  'tpl-del2': () => { S.templates = S.templates.filter(t => t.id !== tplDraft.id); save(true); go('tpls'); },
  // activities
  'act-new': b => actSheet(b.dataset.t || null, b.dataset.k, null),
  'act-edit': b => actSheet(null, null, b.dataset.id),
  seg: b => { b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); },
  'act-save': b => {
    const type = b.dataset.t, id = b.dataset.id;
    const a = id ? S.activities.find(x => x.id === id) : { id: uid(), type, ts: Date.now() };
    a.date = $('#a-date').value || today(); a.note = $('#a-note').value.trim();
    const kb = $('[data-seg="kind"] .on'); if (kb) a.kind = kb.dataset.v;
    if ($('#a-rounds')) a.rounds = num($('#a-rounds').value);
    if ($('#a-min')) a.min = num($('#a-min').value);
    if ($('#a-temp')) a.temp = num($('#a-temp').value);
    if ($('#a-bpm')) a.bpm = num($('#a-bpm').value);
    if ($('#a-label')) a.label = $('#a-label').value.trim();
    if ($('#a-mm')) a.sec = (num($('#a-mm').value) || 0) * 60 + (num($('#a-ss').value) || 0);
    if (!id) S.activities.push(a);
    save(true); closeSheet(); render();
    const t = ACT_TYPES[type];
    if (id) return toast('Uloženo');
    if (type === 'cold') fx('cold', a.sec ? `${Math.floor(a.sec / 60)}:${pad(a.sec % 60)}` : 'Hotovo', `${a.kind || 'Otužování'}${a.temp != null ? ' · ' + kg(a.temp) + ' °C' : ''}`);
    else if (type === 'sauna') fx('heat', `${a.rounds || 1}× ${a.min ? a.min + ' min' : ''}`.trim(), `Sauna${a.temp ? ' · ' + a.temp + ' °C' : ''}`);
    else fx('act', a.min ? `${a.min} min` : 'Uloženo', a.label || t.name);
  },
  'act-share': b => { const x = S.activities.find(q => q.id === b.dataset.id); closeSheet(); if (x) storyActivity(x); },
  'act-del': b => { S.activities = S.activities.filter(a => a.id !== b.dataset.id); save(true); closeSheet(); render(); toast('Smazáno'); },
  // settings
  rule: b => { S.settings.rule = b.dataset.v; save(true); render(); },
  goal: b => { S.settings.weekGoal = +b.dataset.v; save(true); render(); },
  export: () => exportData(),
  demo: () => loadDemo(),
  'demo-clear': () => clearDemo(),
};
function syncTpl() { if (!tplDraft) return; const n = $('#t-name'), f = $('#t-fin'); if (n) tplDraft.name = n.value; if (f) tplDraft.finisher = f.value; }

document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
  const fn = A[b.dataset.a]; if (fn) { e.preventDefault(); e.stopPropagation(); fn(b, e); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'lib-q') { libQ = t.value; $('#lib-list').innerHTML = libList(); return; }
  if (t.id === 'sick-note') { S.days[t.dataset.k].note = t.value; save(); return; }
  if (view.n !== 'workout') return;
  const s = sesById(view.id); if (!s) return;
  const card = t.closest('.ex'); if (!card) return;
  const en = s.entries[+card.dataset.idx]; const ex = exById(en.exId);
  if (t.dataset.in === 'exnote') { ex.note = t.value; save(); autoGrow(t); return; }
  const row = t.closest('.tr'); if (!row || !t.dataset.f) return;
  const f = t.dataset.f, i = +row.dataset.i;
  let v = t.value.replace(/[^\d.,]/g, ''); if (f !== 'w') v = v.replace(/[.,]/g, '');
  if (v !== t.value) t.value = v;
  en.sets[i][f] = f === 'w' ? num(v) : (v === '' ? null : parseInt(v, 10));
  save(); updateCard(card, s, en);
});
document.addEventListener('change', async e => {
  if (e.target.id !== 'imp') return;
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text()); if (!d || !Array.isArray(d.exercises) || !Array.isArray(d.sessions)) throw new Error('bad');
    sheet(`<h2>Obnovit zálohu?</h2><p class="mut">Záloha obsahuje ${d.sessions.length} tréninků a ${d.exercises.length} cviků. Současná data v telefonu se nahradí.</p><div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" id="imp-ok">Obnovit</button></div>`,
      () => { $('#imp-ok').onclick = () => { S = Object.assign(blank(), d); S.settings = Object.assign(blank().settings, d.settings); save(true); closeSheet(); go('home'); toast('Záloha obnovena'); }; });
  } catch (err) { toast('Soubor není záloha Kodad boost'); }
  e.target.value = '';
});
function autoGrow(t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 220) + 'px'; }
document.addEventListener('focusin', e => { if (e.target.matches('.tr input')) setTimeout(() => { try { e.target.select(); } catch (_) { } }, 0); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(true); });

