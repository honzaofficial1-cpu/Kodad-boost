// ===================== v2.38: plán Upper 1 / Lower 1 / Upper 2 / Lower 2 (tabulka 26. 11. 2026) =====================
// Rozsah v tréninku (jen dnes / natrvalo) · lehčí váha na sérii s vyšším rozsahem · Jiné fitko · uložení sestavy do tréninku · izometrie

// ---------- 1) jednorázově: nový plán + cyklus od 26. 11. 2026 ----------
(function () {
  if (S.settings.migTL1) return;
  const START = '2026-11-26';
  const lc = s => String(s || '').toLowerCase();
  const byName = n => S.exercises.find(e => lc(e.name) === lc(n));
  const hist = e => S.sessions.some(s => s.end && s.entries.some(x => x.exId === e.id && x.sets.some(st => hasData(st, e))));
  const used = new Set();
  const R = (...rr) => rr.map(([min, max]) => ({ min, max, fail: false }));
  // name, staré názvy (historie se převezme), partie, vedlejší, jednostranně, krok kg, série, tempo, tipy, poznámka
  const D = {
    tbarW: ['T-bar s oporou hrudníku, široký úchop + kelso', ['T bar rows'], 'Horní záda', 'Široký sval zádový, zadní delty', 0, 2.5, R([5, 7], [7, 9]), null, ['Hrudník na opěrce, široký úchop', 'Po poslední sérii kelso (stažení lopatek)']],
    inclM: ['Šikmý tlak na stroji, úzký úchop', ['Incline chest press'], 'Hrudník', 'Přední delty, triceps', 0, 2.5, R([5, 7], [7, 9]), null, ['Úzký úchop, lokty blíž k tělu', 'Lopatky stažené']],
    latW: ['Stahování horní kladky širokým nadhmatem', ['Pronated lat pulldowns'], 'Široký sval zádový', 'Horní záda, biceps', 0, 2.5, R([5, 7], [7, 9]), null, ['Táhni lokty dolů k bokům', 'Nahoře nech lopatky vyjet']],
    upKl: ['Upažování na kladce jednoruč', ['Upažování na kladce', 'Rameno na kladce'], 'Boční delty', 'Trapézy', 1, 1.25, R([6, 8], [9, 11]), null, ['Vede loket', 'Bez švihu']],
    pec: ['Pec deck', ['Pec deck flys'], 'Hrudník', 'Přední delty', 0, 2.5, R([7, 9], [7, 9]), null, ['Plné protažení vzadu', 'Vpředu krátký stisk']],
    predp: ['Předpažování na kladce jednoruč (bez švihu)', [], 'Přední delty', 'Horní hrudník', 1, 1.25, R([7, 9]), null, ['Bez švihu, trup pevně']],
    triL: ['Tricepsové stlačování lana jednoruč', ['Triceps extenze jednoruč na kladce'], 'Triceps', '', 1, 1.25, R([5, 7], [7, 9]), null, ['Loket u těla', 'Dole plné propnutí']],
    prea: ['Preacher curl jednoruč', ['Preacher curls jednoruč (stroj)'], 'Biceps', 'Brachialis', 1, 1.25, R([5, 7], [7, 9]), null, ['Dole plné protažení', 'Loket se nehýbe']],
    rpd: ['Reverse pec deck jednoruč', [], 'Zadní delty', 'Horní záda', 1, 1.25, R([7, 9]), null, ['Táhni do šířky, ne dozadu']],
    bicN: ['Bicepsový zdvih na kladce nadhmatem', ['Overhand cable curls'], 'Brachioradialis', 'Biceps, brachialis', 0, 1.25, R([5, 7]), null, ['Nadhmat, lokty u těla']],
    pend: ['Pendulum dřep', ['Pendulum squats'], 'Kvadricepsy', 'Hýždě', 0, 2.5, R([5, 7], [7, 9]), null, ['Jdi hluboko', 'Záda celou dobu u opěry']],
    zak: ['Zakopávání vsedě', ['Zákopy v sedě'], 'Hamstringy', 'Lýtka', 0, 2.5, R([5, 7], [7, 9]), null, ['Lehký předklon trupu = víc protažení', 'Kontrolovaný návrat']],
    predk: ['Předkopávání jednonož, opěradlo dozadu', ['Předkopy jednonož'], 'Kvadricepsy', '', 1, 1.25, R([6, 8], [7, 9]), null, ['Opěradlo sklopené dozadu = víc protažení', 'Nahoře krátký stisk']],
    hyp: ['Hyperextenze 45°', ['45° back extensions'], 'Hýždě', 'Hamstringy, vzpřimovače', 0, 2.5, R([7, 9]), null, ['Pohyb z kyčlí, neutrální záda'], 'Rezerva 1–2 opakování, nejít do selhání'],
    lytS: ['Lýtka ve stoji', ['Lýtka ve stoje'], 'Lýtka', '', 0, 2.5, R([6, 8], [8, 10]), '2-2-X-0', ['Dole 2 s pauza v protažení']],
    add: ['Adduktory na stroji', ['Seated hip adductions'], 'Adduktory', '', 0, 2.5, R([7, 9], [7, 9]), null, ['Začni z maximálního protažení']],
    crun: ['Zkracovačky na šikmé lavici', ['Decline bench crunches'], 'Břicho', '', 0, 1, R([7, 9], [7, 9]), null, ['Stáčej páteř, ne kyčle', 'Výdech při kontrakci']],
    wrist: ['Zápěstní curly', ['Barbell wrist curls', 'DB wrist curls'], 'Předloktí (flexory)', '', 0, 1.25, R([7, 9]), null, ['Předloktí opřené, plný rozsah v zápěstí']],
    neck: ['Izometrie krku', [], 'Krk', '', 0, 0, R([4, 4]), '–', ['Předek, zadek, levá, pravá strana', 'Tlak dlaní proti hlavě, hlava se nehýbe'], '', '4 směry × 20 s'],
    smith: ['Rovný tlak v multipressu', ['Smith bench press'], 'Hrudník', 'Přední delty, triceps', 0, 2.5, R([5, 7], [7, 9]), null, ['Lopatky stažené a dolů']],
    tbarN: ['T-bar s oporou hrudníku, úzký neutrální úchop', [], 'Horní záda', 'Široký sval zádový', 0, 2.5, R([5, 7], [7, 9]), null, ['Hrudník na opěrce, lokty podél těla']],
    upSt: ['Upažování na stroji', [], 'Boční delty', 'Trapézy', 0, 2.5, R([6, 8], [9, 11]), null, ['Vede loket', 'Bez švihu']],
    pull: ['Pullover na stroji', ['Machine lat pull over'], 'Široký sval zádový', 'Hrudník, triceps', 0, 2.5, R([5, 7], [7, 9]), null, ['Nahoře plné protažení']],
    shM: ['Tlaky na ramena na stroji, širší úchop', ['Tlaky na ramena (stroj)'], 'Přední delty', 'Triceps, boční delty', 0, 2.5, R([5, 7], [7, 9]), null, ['Zpevněný trup, bez záklonu']],
    triO: ['Tricepsová extenze nad hlavou na kladce jednoruč', [], 'Triceps', '', 1, 1.25, R([5, 7], [7, 9]), null, ['Za hlavou plné protažení', 'Loket míří nahoru']],
    incC: ['Incline curl', [], 'Biceps', 'Brachialis', 0, 2, R([5, 7], [7, 9]), null, ['Šikmá lavice, ruce volně dolů', 'Lokty se nehýbou']],
    rdl: ['Rumunský mrtvý tah (RDL)', ['Rumunský mrtvý tah'], 'Hamstringy', 'Hýždě, vzpřimovače', 0, 2.5, R([5, 7], [7, 9]), null, ['Boky dozadu, kolena lehce pokrčená', 'Osa u nohou'], 'Rezerva 1–2 opakování, nejít do selhání'],
    lytM: ['Lýtka na stroji, propnutá kolena', [], 'Lýtka', '', 0, 2.5, R([6, 8], [8, 10]), '2-2-X-0', ['Kolena propnutá', 'Dole 2 s pauza v protažení']],
    abd: ['Abduktory na stroji', [], 'Hýždě (střední)', '', 0, 2.5, R([7, 9]), null, ['Kontrola v obou fázích']],
    abs: ['Břicho na stroji nebo kladce', ['Stroj na zkracovačky', 'Zkracovačky na kladce'], 'Břicho', '', 0, 2.5, R([7, 9], [7, 9]), null, ['Stáčej páteř, ne kyčle']],
  };
  const X = {};
  for (const [k, [name, old, muscle, secondary, uni, inc, sets, tempo, cues, note, hold]] of Object.entries(D)) {
    const cand = [name, ...old].map(byName).filter(e => e && !used.has(e.id));
    let e = cand.find(hist) || cand[0];
    if (!e) { e = { id: uid(), name, muscle, secondary, uni: !!uni, inc, sets, cues, tempo: tempo || '2-0-X-0', partials: false, note: note || '' }; S.exercises.push(e); }
    else {
      e.name = name; e.sets = sets; e.tempo = tempo || '2-0-X-0'; e.cues = cues; e.muscle = e.muscle || muscle; e.secondary = e.secondary || secondary;
      if (!hist(e)) { e.uni = !!uni; e.inc = inc; }
      if (!e.note || /^RIR/.test(e.note)) e.note = note || '';
    }
    if (hold) e.hold = hold;
    used.add(e.id); X[k] = e;
  }
  const T = {
    'Upper 1': [['tbarW', 2], ['inclM', 2], ['latW', 2], ['upKl', 2], ['pec', 2], ['predp', 1], ['triL', 2], ['prea', 2], ['rpd', 1], ['bicN', 1]],
    'Lower 1': [['pend', 2], ['zak', 2], ['predk', 2], ['hyp', 1], ['lytS', 2], ['add', 2], ['crun', 2], ['wrist', 1], ['neck', 1]],
    'Upper 2': [['smith', 2], ['tbarN', 2], ['upSt', 2], ['pull', 2], ['shM', 2], ['pec', 2], ['triO', 2], ['incC', 2]],
    'Lower 2': [['rdl', 2], ['pend', 2], ['zak', 2], ['predk', 1], ['lytM', 2], ['add', 2], ['abd', 1], ['abs', 2], ['wrist', 1], ['neck', 1]],
  };
  const tp = {};
  Object.entries(T).forEach(([name, list]) => {
    let t = S.templates.find(x => lc(x.name) === lc(name));
    if (!t) { t = { id: uid(), name, ex: [], n: {}, finisher: '' }; S.templates.push(t); }
    t.ex = list.map(([k]) => X[k].id); t.n = {}; list.forEach(([k, c]) => { t.n[X[k].id] = c; });
    delete t.dow; tp[name] = t;
  });
  const order = ['Upper 1', 'Lower 1', 'Upper 2', 'Lower 2'].map(n => tp[n]);
  S.templates = order.concat(S.templates.filter(t => !order.includes(t)));
  const day = (t, focus) => ({ tid: t.id, focus, cardio: null, stretch: false, note: '' });
  const old = S.program || {};
  S.program = { name: 'Upper / Lower', focus: old.focus || '', weeks: null, start: START, days: old.days || {}, cycle: [day(tp['Upper 1'], 'Vršek'), day(tp['Lower 1'], 'Spodek'), null, day(tp['Upper 2'], 'Vršek'), day(tp['Lower 2'], 'Spodek'), null], on: true };
  if (S.food) S.food.tdays = null;
  S.settings.weekGoal = 4;
  // dnešní rozjetý trénink bez zapsaných sérií → přepnout na Upper 1
  const s = sessionOn(START);
  if (s && !s.end && !s.entries.some(e => { const ex = exById(e.exId); return ex && e.sets.some(st => hasData(st, ex) && st.reps != null); })) {
    const t = tp['Upper 1']; s.tid = t.id; s.name = t.name; s.entries = []; s.open = 0; t.ex.forEach(id => addEntry(s, id, t.n[id]));
  }
  S.settings.migTL1 = 1; save(true);
})();

// ---------- 2) Jiné fitko: progrese a rekordy se počítají jen v rámci stejného gymu ----------
const awayKey = s => s && s.away ? 'a:' + lc52(s.gymName) : 'home';
function lc52(x) { return String(x || '').trim().toLowerCase(); }
lastBefore = function (exId, s) {
  const ex = exById(exId), g = awayKey(s);
  for (const o of finished()) {
    if (o.id === s.id || o.start >= s.start || awayKey(o) !== g) continue;
    const e = o.entries.find(x => x.exId === exId);
    if (e && e.sets.some(st => hasData(st, ex))) return { s: o, e };
  }
  return null;
};
bestBefore = function (exId, s) {
  if (s && s.away) return null; // v cizím fitku rekordy nepočítáme
  const ex = exById(exId); let b = null;
  for (const o of finished()) {
    if (o.id === s.id || o.start >= s.start || o.away) continue;
    const e = o.entries.find(x => x.exId === exId); if (!e) continue;
    usedSets(e, ex).forEach(st => { if (!hasData(st, ex)) return; const w = num(st.w), r = repsOf(st, ex); if (!b || w > b.w + 1e-9 || (Math.abs(w - b.w) < 1e-9 && r > b.r)) b = { w, r }; });
  }
  return b;
};
// přepočet předvyplněných vah (jen u sérií, kde ještě nejsou opakování)
function refillWeights(s) {
  s.entries.forEach(e => {
    const ex = exE(e); if (!ex || ex.hold) return; const last = lastBefore(e.exId, s);
    ex.sets.forEach((c, i) => {
      const st = e.sets[i] || (e.sets[i] = { w: null, reps: null, l: null, r: null });
      if (st.reps != null || st.l != null || st.r != null) return;
      const est = i > 0 && setGoalW(ex, e, i, last).est;
      if (!ex.uni) { st.w = est ? null : target(ex, i, last).w; return; }
      const wl = est ? null : targetSide(ex, i, last, 'l').w, wr = est ? null : targetSide(ex, i, last, 'r').w, ws = [wl, wr].filter(x => x != null);
      st.wl = wl; st.wr = wr; st.w = ws.length ? Math.min(...ws) : null;
    });
  });
}
const gymNames = () => [...new Set(S.sessions.filter(s => s.away && s.gymName).sort((a, b) => b.start - a.start).map(s => s.gymName.trim()))].slice(0, 6);
A['w-away'] = () => {
  const s = sesById(view.id); if (!s) return;
  if (s.away) { s.away = false; delete s.gymName; refillWeights(s); save(true); render(); return toast('Zpátky v home gymu'); }
  const names = gymNames();
  sheet(`<h2>Cvičíš v jiném fitku?</h2>
    <p class="mut" style="margin:6px 0 0">Jiné stroje = jiné váhy. Tenhle trénink se nezapočítá do progrese ani rekordů v home gymu. Váhy se předvyplní podle posledního tréninku ve stejném fitku.</p>
    <div class="form" style="margin-top:14px"><label class="f">Které fitko (nepovinné)<input id="gy-n" value="" placeholder="např. Form Factory Anděl" autocomplete="off"></label></div>
    ${names.length ? `<div class="chips" style="margin-top:10px">${names.map(n => `<button class="chip" data-a="gy-q" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}
    <div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="gy-ok">Jsem v jiném fitku</button></div>`);
};
A['gy-q'] = b => { $('#gy-n').value = b.dataset.v; };
A['gy-ok'] = () => {
  const s = sesById(view.id); if (!s) return;
  s.away = true; s.gymName = ($('#gy-n').value || '').trim(); refillWeights(s);
  save(true); closeSheet(); render(); toast('Označeno: jiné fitko');
};

// ---------- 3) rozsah opakování přímo v tréninku ----------
let rgDraft = null;
function rgSheet(idx) {
  const s = sesById(view.id); const e = s.entries[idx]; const ex = exE(e); if (!ex) return;
  rgDraft = { idx, sets: ex.sets.map(c => ({ min: c.min, max: c.max, fail: !!c.fail })) }; drawRg();
}
function drawRg() {
  const s = sesById(view.id); const e = s.entries[rgDraft.idx]; const base = exById(e.exId); const d = rgDraft;
  const tp = s.tid && tplById(s.tid);
  sheet(`<h2>Rozsah opakování</h2><p class="mut" style="margin:4px 0 0">${esc(base.name)}</p>
    <div style="display:grid;gap:8px;margin-top:16px" id="rg-sets">${d.sets.map((c, i) => `<div class="setcfg" data-i="${i}"><span class="n">${i + 1}.</span><input class="inp" inputmode="numeric" data-sf="min" value="${c.min}" aria-label="Od"><input class="inp" inputmode="numeric" data-sf="max" value="${c.max}" aria-label="Do"><button class="fb ${c.fail ? 'on' : ''}" data-a="rg-fail" data-i="${i}" aria-label="Do selhání">F</button><button class="rm" data-a="rg-rm" data-i="${i}" aria-label="Odebrat sérii" ${d.sets.length > 1 ? '' : 'disabled'}>${ico('x')}</button></div>`).join('')}</div>
    ${d.sets.length < 5 ? `<button class="btn sm" style="margin-top:8px" data-a="rg-add">${ico('plus')} Přidat sérii</button>` : ''}
    <p class="mut" style="font-size:13px;margin:14px 2px 0">„Uložit natrvalo“ platí pro tenhle cvik v každém dalším tréninku${tp ? ` a počet sérií i v sestavě ${esc(tp.name)}` : ''}.</p>
    <div class="actions" style="flex-wrap:wrap">${e.rg ? '<button class="btn" data-a="rg-reset">Vrátit uložený</button>' : ''}<button class="btn" data-a="rg-today">Jen dnes</button><button class="btn white" data-a="rg-save">Uložit natrvalo</button></div>`);
}
function readRg() { $$('#rg-sets .setcfg').forEach(r => { const c = rgDraft.sets[+r.dataset.i]; c.min = num($('[data-sf=min]', r).value) ?? c.min; c.max = num($('[data-sf=max]', r).value) ?? c.max; }); }
function rgValid() { readRg(); if (rgDraft.sets.some(c => c.min > c.max || c.min < 1)) { toast('Od musí být menší nebo rovno Do'); return false; } return true; }
A['rg-fail'] = b => { readRg(); const c = rgDraft.sets[+b.dataset.i]; c.fail = !c.fail; drawRg(); };
A['rg-add'] = () => { readRg(); const l = rgDraft.sets[rgDraft.sets.length - 1]; rgDraft.sets.push({ ...l }); drawRg(); };
A['rg-rm'] = b => { readRg(); if (rgDraft.sets.length > 1) rgDraft.sets.splice(+b.dataset.i, 1); drawRg(); };
function rgApplyEntry(e, sets) {
  while (e.sets.length < sets.length) e.sets.push({ w: null, reps: null, l: null, r: null });
}
A['rg-today'] = () => {
  if (!rgValid()) return; const s = sesById(view.id); const e = s.entries[rgDraft.idx];
  e.rg = rgDraft.sets.map(c => ({ ...c })); e.n = e.rg.length; rgApplyEntry(e, e.rg); refillWeights(s);
  save(true); closeSheet(); render(); toast('Rozsah jen pro dnešek');
};
A['rg-save'] = () => {
  if (!rgValid()) return; const s = sesById(view.id); const e = s.entries[rgDraft.idx]; const base = exById(e.exId); const sets = rgDraft.sets.map(c => ({ ...c }));
  // do knihovny: přepíše uložené série; když jich je víc, prodlouží
  sets.forEach((c, i) => { base.sets[i] = c; });
  const tp = s.tid && tplById(s.tid);
  if (tp && tp.ex.includes(base.id)) { tp.n = tp.n || {}; tp.n[base.id] = sets.length; }
  if (!tp && base.sets.length > sets.length) base.sets.length = sets.length;
  delete e.rg; e.n = sets.length; rgApplyEntry(e, sets); refillWeights(s);
  save(true); closeSheet(); render(); toast('Uloženo pro další tréninky');
};
A['rg-reset'] = () => { const s = sesById(view.id); const e = s.entries[rgDraft.idx]; const tp = s.tid && tplById(s.tid); delete e.rg; e.n = tp && tp.n && tp.n[e.exId] || undefined; refillWeights(s); save(true); closeSheet(); render(); };
document.addEventListener('click', ev => {
  if (view.n !== 'workout') return; const t = ev.target.closest('.tr .rg, [data-rg]'); if (!t) return;
  const card = t.closest('.ex'); if (!card) return; ev.preventDefault(); rgSheet(+card.dataset.idx);
});

// ---------- 4) lehčí váha na sérii s vyšším rozsahem (odhad z 1. pracovní série) ----------
const mid52 = c => (c.min + c.max) / 2;
const floorStep = (w, st) => { st = st || 1.25; return r2(Math.floor(w / st + 1e-6) * st); };
// odkud počítat: dnešní 1. série (když je zapsaná), jinak cíl z minula
function refSet0(ex, e, last) {
  const st = e.sets[0];
  if (ex.uni) {
    const w = sideW(st, 'l'), r = num(st?.l);
    if (w != null && r != null) return { w, r, live: true };
    const t = targetSide(ex, 0, last, 'l'); if (t.w == null) return null; return { w: t.w, r: num(t.ph) || ex.sets[0].min };
  }
  if (hasData(st, ex)) return { w: num(st.w), r: num(st.reps), live: true };
  const t = target(ex, 0, last); if (t.w == null) return null;
  return { w: t.w, r: t.kind === 'same' ? Math.max(t.goal, ex.sets[0].min) : ex.sets[0].min };
}
function backoff(ex, e, i, last) {
  if (!i || ex.hold || !ex.sets[i] || !ex.sets[0] || mid52(ex.sets[i]) <= mid52(ex.sets[0])) return null;
  const ref = refSet0(ex, e, last); if (!ref || !ref.w) return null;
  const e1 = ref.w * (1 + ref.r / 30);              // odhad 1RM (Epley)
  const w = e1 / (1 + mid52(ex.sets[i]) / 30) * 0.95; // + únava po první sérii
  return floorStep(Math.min(w, ref.w), ex.inc);
}
// cílová váha série i: historie má přednost; u nové série s vyšším rozsahem odhad
function setGoalW(ex, e, i, last, f) {
  const t = ex.uni ? targetSide(ex, i, last, f || 'l') : target(ex, i, last);
  if (t.w != null && (!i || mid52(ex.sets[i]) <= mid52(ex.sets[0]) || lastSameRange(ex, i, last))) return { w: t.w, est: false };
  const b = backoff(ex, e, i, last); if (b != null) return { w: b, est: true };
  return { w: t.w, est: false };
}
// minule se tahle série dělala ve stejném rozsahu? (jinak je minulá váha z jiného rozsahu a radši odhad)
function lastSameRange(ex, i, last) { return !!(last && last.s && Array.isArray(last.e.rgSnap) && last.e.rgSnap[i] && last.e.rgSnap[i].min === ex.sets[i].min && last.e.rgSnap[i].max === ex.sets[i].max); }
// k uloženému tréninku si zapamatovat, v jakém rozsahu se série dělaly
const _52fs = A['finish-save'];
A['finish-save'] = function () { const s = sesById(view.id); if (s) s.entries.forEach(e => { const ex = exE(e); if (ex) e.rgSnap = ex.sets.map(c => ({ min: c.min, max: c.max })); }); return _52fs.apply(this, arguments); };
// nový trénink: u série s vyšším rozsahem bez stejného rozsahu minule nepředvyplňovat starou váhu (ukáže se odhad)
const _52add = addEntry;
addEntry = function (s, exId, n) {
  _52add.apply(this, arguments); const e = s.entries[s.entries.length - 1]; if (!e || e.exId !== exId) return;
  const ex = exE(e); if (!ex || ex.hold) return; const last = lastBefore(exId, s);
  ex.sets.forEach((c, i) => { if (!i) return; const g = setGoalW(ex, e, i, last); if (!g.est) return; const st = e.sets[i]; if (!st) return; st.w = null; if (ex.uni) { st.wl = null; st.wr = null; } });
};
IC.edit = '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>';

function wkLine(s, e, ex, last) {
  if (ex.hold) return `<div class="wkl" data-wk>${esc(ex.hold)} · bez váhy</div>`;
  const parts = ex.sets.map((c, i) => {
    const g = setGoalW(ex, e, i, last); const rg = `${c.min}–${c.max}`; const st = e.sets[i];
    if (st && (ex.uni ? sideW(st, 'l') != null && num(st.l) != null : hasData(st, ex))) return `<span>${ex.sets.length > 1 ? `<i>${i + 1}.</i>` : ''}<b>${ex.uni ? uniW(st) : kg(num(st.w))} kg × ${ex.uni ? `${st.l ?? '–'}/${st.r ?? '–'}` : st.reps}</b> <small>(${rg})</small></span>`;
    return `<span>${ex.sets.length > 1 ? `<i>${i + 1}.</i>` : ''}${g.w != null ? `<b>${g.est ? '~' : ''}${kg(g.w)} kg</b> × ` : ''}${rg}${c.fail ? ' F' : ''}</span>`;
  });
  return `<button class="wkl" data-wk data-rg aria-label="Upravit rozsah">${parts.join('<em>·</em>')}<u>${ico('edit')}Rozsah</u></button>`;
}

// ---------- 5) karta cviku: horní řádek, placeholdery, izometrie ----------
const _52exBody = exBody;
exBody = function (s, e, ex) {
  const last = lastBefore(e.exId, s);
  if (ex.hold) return holdBody(s, e, ex, last);
  let h = _52exBody(s, e, ex);
  h = h.replace('<div class="exb">', `<div class="exb">${wkLine(s, e, ex, last)}`);
  // odhad váhy do placeholderu u série s vyšším rozsahem
  ex.sets.forEach((c, i) => {
    const b = i ? setGoalW(ex, e, i, last) : null; if (!b || !b.est || b.w == null) return;
    if (ex.uni) {
      h = h.replace(new RegExp(`(<div class="tr" data-i="${i}" data-side="l">[\\s\\S]*?data-f="wl" value=")([^"]*)(" placeholder=")[^"]*"`), (m, a, v, p) => `${a}${v}${p}${kg(b.w)}"`);
    } else {
      h = h.replace(new RegExp(`(<div class="tr" data-i="${i}">[\\s\\S]*?data-f="w" value="[^"]*" placeholder=")kg"`), `$1${kg(b.w)}"`);
    }
  });
  return h;
};
function holdBody(s, e, ex, last) {
  const rows = ex.sets.map((c, i) => { const st = e.sets[i] || {}; const ok = num(st.reps) != null;
    return `<button class="holdr ${ok ? 'ok' : ''}" data-a="hold-ck" data-i="${i}"><span>${ex.sets.length > 1 ? `${i + 1}. série · ` : ''}${esc(ex.hold)}</span><i>${ico('check')}</i></button>`; }).join('');
  return `<div class="exb">
    ${(ex.cues || []).length ? `<div class="last">${ex.cues.map(esc).join(' · ')}</div>` : ''}
    <div class="last">${last ? `Minule ${fday(last.s.date)} hotovo` : 'První záznam'}</div>
    <div style="padding:12px 12px 4px;display:grid;gap:8px">${rows}</div>
    <textarea class="notep" data-in="exnote" rows="1" placeholder="Napiš poznámku…">${esc(ex.note)}</textarea></div>`;
}
A['hold-ck'] = b => {
  const s = sesById(view.id); const card = b.closest('.ex'); const e = s.entries[+card.dataset.idx]; const i = +b.dataset.i;
  const st = e.sets[i] || (e.sets[i] = {}); if (num(st.reps) != null) { st.w = null; st.reps = null; } else { st.w = 0; st.reps = 1; }
  save(); render();
};
// ✓ u série: když chybí váha, vezme odhad z placeholderu
const _52ck = A.ck;
A.ck = function (b) {
  const row = b.closest('.tr'), card = b.closest('.ex'); const s = sesById(view.id);
  if (row && card && s && !row.dataset.side) {
    const e = s.entries[+card.dataset.idx], st = e.sets[+row.dataset.i], wi = $('[data-f=w]', row);
    if (st && num(st.w) == null && wi && num(wi.placeholder) != null) { st.w = num(wi.placeholder); wi.value = kg(st.w); }
  }
  return _52ck.apply(this, arguments);
};
// živě: po zapsání 1. série se přepočítá odhad u dalších
const _52upd = updateCard;
updateCard = function (card, s, e) {
  _52upd(card, s, e);
  const ex = exE(e); if (!ex || ex.hold) return; const last = lastBefore(e.exId, s);
  const wl = $('[data-wk]', card); if (wl) wl.outerHTML = wkLine(s, e, ex, last);
  ex.sets.forEach((c, i) => {
    if (!i) return; const g = setGoalW(ex, e, i, last); if (!g.est || g.w == null) return;
    const inp = ex.uni ? $(`.tr[data-i="${i}"][data-side="l"] [data-f=wl]`, card) : $(`.tr[data-i="${i}"] [data-f=w]`, card);
    if (inp) inp.placeholder = kg(g.w);
  });
};

// ---------- 6) trénink: přepínač fitka + uložení změněné sestavy ----------
function tplDiff(s) {
  const tp = s.tid && tplById(s.tid); if (!tp) return null;
  const ids = s.entries.map(e => e.exId);
  const same = ids.length === tp.ex.length && ids.every((id, i) => id === tp.ex[i]) && s.entries.every(e => { const ex = exById(e.exId); const want = (tp.n && tp.n[e.exId]) || ex.sets.length; return !ex || exE(e).sets.length === want || e.rg; });
  return same ? null : tp;
}
const _52vW = vWorkout;
vWorkout = function () {
  const s = sesById(view.id); let h = _52vW(); if (!s) return h;
  const chip = `<div class="gymtg"><button class="${s.away ? '' : 'on'}" data-a="${s.away ? 'w-away' : ''}" ${s.away ? '' : 'aria-pressed="true"'}>Home gym</button><button class="${s.away ? 'on' : ''}" data-a="${s.away ? 'w-away-ed' : 'w-away'}">${s.away ? esc(s.gymName || 'Jiné fitko') : 'Jiné fitko'}</button></div>`;
  h = h.replace(/(<div class="timer">[\s\S]*?<\/div>|<p class="mut" style="text-align:center;margin:-6px 0 12px">[\s\S]*?<\/p>)/, `$1${chip}${s.away ? '<p class="awaynote">Jiné fitko · nepočítá se do progrese ani rekordů v home gymu</p>' : ''}`);
  const tp = !s.end && tplDiff(s);
  if (tp) h = h.replace(/(<\/div>\s*<div class="dock">)/, `<div class="tplsave"><span>Sestava se liší od uloženého tréninku <b>${esc(tp.name)}</b>.</span><button class="btn sm white" data-a="w-tplsave">Uložit pro příště</button></div>$1`);
  return h;
};
A['w-away-ed'] = () => {
  const s = sesById(view.id); const names = gymNames();
  sheet(`<h2>Jiné fitko</h2><div class="form" style="margin-top:12px"><label class="f">Název<input id="gy-n" value="${esc(s.gymName || '')}" placeholder="např. Form Factory Anděl" autocomplete="off"></label></div>
    ${names.length ? `<div class="chips" style="margin-top:10px">${names.map(n => `<button class="chip" data-a="gy-q" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}
    <div class="actions" style="flex-wrap:wrap"><button class="btn" data-a="w-away">Vrátit na home gym</button><button class="btn white" data-a="gy-ok">Uložit</button></div>`);
};
const _52wAway = A['w-away'];
A['w-away'] = function () { const s = sesById(view.id); if (s && s.away && !$('#sheet').hidden) closeSheet(); return _52wAway.apply(this, arguments); };
A['w-tplsave'] = () => {
  const s = sesById(view.id); const tp = s && tplById(s.tid); if (!tp) return;
  tp.ex = s.entries.map(e => e.exId); tp.n = {}; s.entries.forEach(e => { tp.n[e.exId] = exE(e).sets.length; });
  save(true); render(); toast(`Uloženo do ${tp.name}`);
};
const _52wm = A['w-menu'];
A['w-menu'] = function () {
  _52wm.apply(this, arguments); const s = sesById(view.id); const list = $('#sheet .list'); if (!list || !s) return;
  const tp = s.tid && tplById(s.tid);
  list.insertAdjacentHTML('afterbegin', `<button class="li" data-a="${s.away ? 'w-away-ed' : 'w-away'}"><div class="t"><b>${s.away ? 'Jiné fitko · ' + esc(s.gymName || 'bez názvu') : 'Cvičím v jiném fitku'}</b><small>Nepočítá se do progrese v home gymu</small></div></button>${tp ? `<button class="li" data-a="w-tplsave"><div class="t"><b>Uložit sestavu do ${esc(tp.name)}</b><small>Cviky, pořadí a počet sérií platí i příště</small></div></button>` : ''}`);
};
// v menu cviku zkratka na rozsah
const _52exm = A['ex-menu'];
A['ex-menu'] = function (b) {
  const idx = +b.closest('.ex').dataset.idx; _52exm.apply(this, arguments);
  const list = $('#sheet .list'); if (list) list.insertAdjacentHTML('afterbegin', `<button class="li" data-a="rg-open" data-i="${idx}"><div class="t"><b>Rozsah opakování a série</b><small>Jen dnes, nebo uložit natrvalo</small></div></button>`);
};
A['rg-open'] = b => { closeSheet(); rgSheet(+b.dataset.i); };

// ---------- 7) shrnutí a dokončení: štítek fitka ----------
const _52vFin = vFin;
vFin = function () { const s = sesById(view.id); let h = _52vFin(); if (s && s.away) h = h.replace('<div class="chips"><span class="chip o">', `<div class="chips"><span class="chip o">${esc(s.gymName || 'Jiné fitko')}</span><span class="chip o">`); return h; };
