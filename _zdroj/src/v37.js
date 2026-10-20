
// ===================== v2.18: cyklování suplementů · bez alkoholu · krevní testy =====================
const nDays = n => pl(n, 'den', 'dny', 'dní').split(' ')[1];
const daysBetween = (a, b) => Math.round((toU(b) - toU(a)) / DMS);

// ---------- cyklování suplementů (např. 2 měsíce beru, 1 měsíc pauza) ----------
const addMo = (k, n) => { const d = pdate(k); const x = new Date(d.getFullYear(), d.getMonth() + n, 1); x.setDate(Math.min(d.getDate(), new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate())); return dkey(x); };
const cycAdd = (k, n, u) => u === 'm' ? addMo(k, n) : dkey(addDays(pdate(k), n * 7));
const cycLbl = (n, u) => u === 'm' ? pl(n, 'měsíc', 'měsíce', 'měsíců') : pl(n, 'týden', 'týdny', 'týdnů');
function supPhase(s, k) {
  const c = s && s.cyc; if (!c) return null; k = k || today();
  if (k < c.start) return { on: false, pre: true, next: c.start };
  let a = c.start;
  for (let i = 0; i < 400; i++) { const e1 = cycAdd(a, c.on, c.u); if (k < e1) return { on: true, from: a, next: e1 }; const e2 = cycAdd(e1, c.off, c.u); if (k < e2) return { on: false, from: e1, next: e2 }; a = e2; }
  return null;
}
const supOn = (s, k) => { const p = supPhase(s, k); return !p || p.on; };
supState = function (s) {
  const td = tDays(); let left = s.qty; const t = today(); let d = s.since;
  const uses = k => (s.days !== 'trenink' || td.includes(DNY[dIdx(k)])) && supOn(s, k);
  for (let i = 0; i < 2000 && d <= t; i++) { if (uses(d)) left -= s.dose; d = dkey(addDays(pdate(d), 1)); }
  left = Math.max(0, r1(left));
  let end = null, x = left, dd = dkey(addDays(new Date(), 1));
  for (let i = 0; i < 2000; i++) { if (uses(dd)) { if (x < s.dose - 1e-9) { end = dd; break; } x -= s.dose; } dd = dkey(addDays(pdate(dd), 1)); }
  const daysLeft = end ? Math.round((toU(end) - toU(t)) / DMS) : null;
  return { left, end, daysLeft };
};
const phaseTxt = (s, k) => { const p = supPhase(s, k); if (!p) return ''; const n = daysBetween(k || today(), p.next);
  return p.on ? `beru · pauza od ${fday(p.next)}${n <= 7 ? ` (za ${n} ${nDays(n)})` : ''}` : `${p.pre ? 'začínám' : 'pauza · znovu'} od ${fday(p.next)}`; };
// Dnes: v pauze se suplement nenabízí k odškrtnutí
supToday = function (k, isT) {
  const f = F(); const all = (f.sup || []).map((s, i) => ({ s, i })).filter(({ s }) => s.days !== 'trenink' || isT); if (!all.length) return '';
  const L = all.filter(({ s }) => supOn(s, k)), P = all.filter(({ s }) => !supOn(s, k));
  const tk = (f.supTaken = f.supTaken || {})[k] || {};
  const slot = s => { const w = (s.when || []).filter(x => x !== 'Před tréninkem' || isT); return w.length ? w : ['Kdykoli']; };
  const rows = []; [...SUP_WHEN, 'Kdykoli'].forEach(w => L.forEach(({ s, i }) => { if (slot(s).includes(w)) rows.push({ w, s, i }); }));
  const soon = s => { const p = supPhase(s, k); return p && p.on && daysBetween(k, p.next) === 1 ? ' · od zítra pauza' : ''; };
  return `<div class="fsec"><div class="lbl">Suplementy</div><div class="fsupd">${rows.map(({ w, s, i }) => { const id = i + ':' + w; return `<button class="fsi ${tk[id] ? 'on' : ''}" data-a="f-took" data-k="${k}" data-id="${id}"><span class="cb">${tk[id] ? ico('check') : ''}</span><span class="t"><b>${esc(s.name)}</b><small>${w}${s.whenNote ? ' · ' + esc(s.whenNote) : ''}${soon(s)}</small></span><span class="q">${kg(s.dose)} ${esc(s.unit)}</span></button>`; }).join('')}</div>
    ${P.map(({ s }) => `<p class="fpz"><b>${esc(s.name)}</b><span>${phaseTxt(s, k)}</span></p>`).join('')}</div>`;
};
const _18fsup = XV['f-sup'];
XV['f-sup'] = function () {
  let h = _18fsup(); (F().sup || []).forEach((s, i) => { if (!s.cyc) return; const on = supOn(s);
    h = h.replace(`data-i="${i}"><b>${esc(s.name)}</b>`, `data-i="${i}"><b>${esc(s.name)}</b><em class="cyct ${on ? 'on' : ''}">${phaseTxt(s)}</em>`); });
  return h;
};
const _18supedit = A['f-supedit'];
A['f-supedit'] = b => {
  _18supedit(b); const i = +b.dataset.i; const s = i >= 0 ? F().sup[i] : {}; const c = s.cyc;
  const host = $('#su-o')?.closest('label'); if (!host) return;
  host.insertAdjacentHTML('afterend', `<button class="sw ${c ? 'on' : ''}" data-a="su-cyc"><span>Cyklovat<small>Část času beru, pak pauza – např. ashwagandha 2 měsíce, 1 měsíc pauza</small></span><span class="k"></span></button>
    <div id="su-cycf" class="form" style="margin:0" ${c ? '' : 'hidden'}>
      <div class="two"><label class="f">Beru<input id="su-con" inputmode="numeric" value="${c ? c.on : 2}"></label><label class="f">Pauza<input id="su-coff" inputmode="numeric" value="${c ? c.off : 1}"></label></div>
      <div class="seg" data-seg="cu">${[['m', 'měsíce'], ['w', 'týdny']].map(([v, l]) => `<button data-a="seg" data-v="${v}" class="${(c ? c.u : 'm') === v ? 'on' : ''}">${l}</button>`).join('')}</div>
      <label class="f">První den brání<input type="date" id="su-cst" value="${c ? c.start : today()}"></label>
      <p class="mut" id="su-cprev" style="font-size:13px;margin:0 2px"></p></div>`);
  supCycPrev();
};
function supCycFields() {
  return { on: Math.round(num($('#su-con')?.value) || 0), off: Math.round(num($('#su-coff')?.value) || 0), u: $('[data-seg=cu] .on')?.dataset.v || 'm', start: $('#su-cst')?.value || today() };
}
function supCycPrev() {
  const el = $('#su-cprev'); if (!el) return; const c = supCycFields(); if (!c.on || !c.off) { el.textContent = 'Vyplň obě délky.'; return; }
  const s = { cyc: c }; const p = supPhase(s, today()); const e1 = cycAdd(c.start, c.on, c.u), e2 = cycAdd(e1, c.off, c.u);
  el.innerHTML = `Beru ${fday(c.start)} – ${fday(dkey(addDays(pdate(e1), -1)))}, pauza do ${fday(dkey(addDays(pdate(e2), -1)))}, pak znovu dokola.<br>Dnes: <b style="color:var(--fg)">${p.on ? 'beru' : 'pauza'}</b>`;
}
A['su-cyc'] = b => { b.classList.toggle('on'); $('#su-cycf').hidden = !b.classList.contains('on'); };
document.addEventListener('input', e => { if (['su-con', 'su-coff', 'su-cst'].includes(e.target.id)) supCycPrev(); });
document.addEventListener('click', e => { if (e.target.closest('[data-seg=cu]')) setTimeout(supCycPrev, 0); });
const _18supsave = A['f-supsave'];
A['f-supsave'] = b => {
  const i = +b.dataset.i; const L0 = F().sup || []; const n0 = L0.length, old = L0[i];
  const on = $('#sheet [data-a=su-cyc]')?.classList.contains('on'); const c = supCycFields();
  if (on && (!c.on || !c.off)) return toast('Vyplň, jak dlouho beru a jak dlouho je pauza');
  _18supsave(b);
  const L = F().sup || []; const o = i >= 0 ? (L[i] !== old ? L[i] : null) : (L.length > n0 ? L[L.length - 1] : null);
  if (o) { if (on) o.cyc = c; else delete o.cyc; save(true); render(); }
};

// ---------- bez alkoholu ----------
const SOB = () => (F().sober = F().sober || { since: null, best: 0, hist: [] });
const sobDays = () => { const o = SOB(); return o.since ? Math.max(0, daysBetween(o.since, today())) : null; };
const SOB_T = [7, 30, 60, 100, 180, 365, 730];
PICTO.sober = { s: [['M7 3.5h10l-1.2 7.2a3.85 3.85 0 0 1-7.6 0z', 1.8], ['M12 14.6v5.4', 1.8], ['M8.6 20.5h6.8', 1.8], ['M4 4l16 16', 1.8]], c: [] };
BADGES.push({ id: 'sober', name: 'Bez alkoholu', picto: 'sober', unit: ['den', 'dny', 'dní'], tiers: SOB_T, val: () => Math.max(sobDays() || 0, SOB().best || 0) });
function sobCard() {
  const o = SOB(); const n = sobDays();
  if (n == null) return `<div class="fsob"><div class="lbl">Bez alkoholu</div><p style="margin:10px 0 14px">Zadej den, od kdy nepiješ. Počítadlo pak běží samo a sbírá odznaky za 7, 30, 100, 365 dní…</p><button class="btn white" data-a="sob-set">Nastavit datum</button></div>`;
  const nx = SOB_T.find(t => t > n), pv = [...SOB_T].reverse().find(t => t <= n) || 0;
  return `<div class="fsob"><div class="lbl">Bez alkoholu</div><div class="fsobn"><b>${thou(n)}</b><span>${nDays(n)}</span></div>
    <p class="mut" style="margin:2px 0 0">od ${fdate(o.since)}${o.best > n ? ` · nejdelší série ${o.best} ${nDays(o.best)}` : ''}</p>
    ${nx ? `<div class="fsobbar"><i style="width:${Math.round((n - pv) / (nx - pv) * 100)}%"></i></div><p class="fsobnx">Odznak ${nx} dní – zbývá ${nx - n} ${nDays(nx - n)}</p>` : '<p class="fsobnx">Všechny odznaky máš.</p>'}
    <div class="two" style="margin-top:14px"><button class="btn" data-a="sob-set">Upravit datum</button><button class="btn" data-a="sob-reset">Napil jsem se</button></div></div>`;
}
A['sob-set'] = () => { const o = SOB();
  sheet(`<h2>Bez alkoholu od</h2><div class="form"><label class="f">První den bez alkoholu<input type="date" id="sob-d" max="${today()}" value="${o.since || today()}"></label></div>
    <div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="sob-save">Uložit</button></div>`); };
A['sob-save'] = () => { const v = $('#sob-d').value; if (!v || v > today()) return toast('Vyber den, nejpozději dnešek'); SOB().since = v; save(true); closeSheet(); render(); setTimeout(checkBadges, 500); };
A['sob-reset'] = () => { const n = sobDays();
  sheet(`<h2>Napil jsem se</h2><p class="mut" style="margin:6px 0 0">Série ${n} ${nDays(n)} se uloží do historie a počítadlo začne znovu. Získané odznaky zůstanou.</p>
    <div class="form"><label class="f">Kdy<input type="date" id="sob-r" max="${today()}" value="${today()}"></label></div>
    <div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="sob-reset2">Začít znovu</button></div>`); };
A['sob-reset2'] = () => { const o = SOB(); const v = $('#sob-r').value || today(); const n = Math.max(0, daysBetween(o.since, v));
  o.hist = [...(o.hist || []), { from: o.since, to: v, n }]; o.best = Math.max(o.best || 0, n); o.since = dkey(addDays(pdate(v), 1)); save(true); closeSheet(); render(); toast('Nová série začíná'); };
setTimeout(() => { if (SOB().since) checkBadges(); }, 2500);

// ---------- krevní testy ----------
const BM = [
  ['Krevní obraz', [['hb', 'Hemoglobin', 'g/l', 135, 175], ['hct', 'Hematokrit', '', 0.4, 0.5], ['ery', 'Erytrocyty', '10¹²/l', 4.3, 5.7], ['leu', 'Leukocyty', '10⁹/l', 4, 10], ['trom', 'Trombocyty', '10⁹/l', 150, 400]]],
  ['Železo', [['fer', 'Feritin', 'µg/l', 30, 400], ['fe', 'Železo', 'µmol/l', 10.6, 28.3], ['trf', 'Transferin', 'g/l', 2, 3.6]]],
  ['Vitaminy', [['vitd', 'Vitamin D (25-OH)', 'nmol/l', 75, 250], ['b12', 'Vitamin B12', 'pmol/l', 145, 569], ['fol', 'Folát', 'nmol/l', 10.4, 42.4]]],
  ['Cukr', [['glu', 'Glukóza', 'mmol/l', 3.9, 5.6], ['hba1c', 'HbA1c', 'mmol/mol', 20, 42], ['ins', 'Inzulin', 'mU/l', 2.6, 24.9]]],
  ['Tuky', [['chol', 'Cholesterol', 'mmol/l', 2.9, 5], ['ldl', 'LDL', 'mmol/l', 1.2, 3], ['hdl', 'HDL', 'mmol/l', 1, 2.1], ['tag', 'Triglyceridy', 'mmol/l', 0.45, 1.7]]],
  ['Játra', [['alt', 'ALT', 'µkat/l', 0.1, 0.78], ['ast', 'AST', 'µkat/l', 0.05, 0.72], ['ggt', 'GGT', 'µkat/l', 0.14, 0.84], ['bil', 'Bilirubin', 'µmol/l', 2, 17]]],
  ['Ledviny', [['krea', 'Kreatinin', 'µmol/l', 64, 104], ['egfr', 'eGFR', 'ml/s/1,73 m²', 1.5, null], ['urea', 'Urea', 'mmol/l', 2.8, 8], ['kmoc', 'Kyselina močová', 'µmol/l', 202, 416]]],
  ['Štítná žláza', [['tsh', 'TSH', 'mU/l', 0.27, 4.2], ['ft4', 'fT4', 'pmol/l', 12, 22]]],
  ['Hormony', [['testo', 'Testosteron', 'nmol/l', 8.6, 29], ['shbg', 'SHBG', 'nmol/l', 18.3, 54.1], ['kort', 'Kortizol (ráno)', 'nmol/l', 166, 507]]],
  ['Minerály', [['mg', 'Hořčík', 'mmol/l', 0.66, 1.07], ['zn', 'Zinek', 'µmol/l', 11, 18], ['na', 'Sodík', 'mmol/l', 136, 145], ['k', 'Draslík', 'mmol/l', 3.5, 5.1], ['ca', 'Vápník', 'mmol/l', 2.15, 2.55]]],
  ['Zánět a svaly', [['crp', 'CRP', 'mg/l', 0, 5], ['ck', 'Kreatinkináza (CK)', 'µkat/l', 0.65, 3.2]]],
];
const BL = () => (S.blood = S.blood || { tests: [], mk: {}, custom: [] });
const bmAll = () => [...BM.flatMap(([, l]) => l), ...BL().custom];
const bmGet = id => { const m = bmAll().find(x => x[0] === id); if (!m) return null; const o = BL().mk[id] || {}; return { id, name: m[1], unit: m[2], lo: o.lo !== undefined ? o.lo : m[3], hi: o.hi !== undefined ? o.hi : m[4] }; };
const bFlag = (m, v) => v == null || !m ? '' : m.lo != null && v < m.lo ? 'lo' : m.hi != null && v > m.hi ? 'hi' : 'ok';
const bRef = m => m.lo != null && m.hi != null ? `${kg(m.lo)}–${kg(m.hi)}` : m.lo != null ? `nad ${kg(m.lo)}` : m.hi != null ? `pod ${kg(m.hi)}` : 'bez rozmezí';
const bTests = () => [...BL().tests].sort((a, b) => b.date < a.date ? -1 : 1);
const bHist = id => bTests().filter(t => t.v && t.v[id] != null).map(t => ({ date: t.date, v: t.v[id], t }));
// soubory (PDF, fotky) v úložišti telefonu – do localStorage by se nevešly
let _idb = null;
const IDB = () => _idb || (_idb = new Promise((res, rej) => { const r = indexedDB.open('kodadboost-files', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
const idbDo = (mode, fn) => IDB().then(db => new Promise((res, rej) => { const t = db.transaction('f', mode); const q = fn(t.objectStore('f')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
const fPut = (id, v) => idbDo('readwrite', s => s.put(v, id));
const fGet = id => idbDo('readonly', s => s.get(id));
const fDel = id => idbDo('readwrite', s => s.delete(id));

const _18tabs = tabs;
tabs = () => view.n && view.n.startsWith('f-krev') ? _18tabs().replace('data-v="f-vyvoj" class="', 'data-v="f-vyvoj" class="on ') : _18tabs();

XV['f-krev'] = function () {
  { const L = BL(); const n0 = L.tests.length; L.tests = L.tests.filter(t => Object.keys(t.v || {}).length || (t.files || []).length || t.lab); if (L.tests.length !== n0) save(); }
  const T = bTests(); const last = T[0];
  const ids = bmAll().map(m => m[0]).filter(id => bHist(id).length);
  const spark = H => { if (H.length < 2) return ''; const v = H.slice(0, 6).reverse().map(x => x.v); const mn = Math.min(...v), mx = Math.max(...v), r = mx - mn || 1;
    return `<svg class="kspark" viewBox="0 0 60 22" aria-hidden="true"><polyline points="${v.map((x, i) => `${(i / (v.length - 1) * 56 + 2).toFixed(1)},${(19 - (x - mn) / r * 16).toFixed(1)}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`; };
  const vals = ids.map(id => { const m = bmGet(id), H = bHist(id), x = H[0], fl = bFlag(m, x.v);
    return `<button class="krow2 ${fl}" data-a="kr-mk" data-id="${id}"><span class="t"><b>${esc(m.name)}</b><small>${bRef(m)} ${esc(m.unit)} · ${fday(x.date)}</small></span>${spark(H)}<span class="v"><b>${kg(x.v)}</b><small>${fl === 'lo' ? 'nízko' : fl === 'hi' ? 'vysoko' : esc(m.unit)}</small></span></button>`; }).join('');
  const out = last ? Object.keys(last.v || {}).filter(id => ['lo', 'hi'].includes(bFlag(bmGet(id), last.v[id]))).length : 0;
  return `<div class="wrap">${hdr(backBtn('f-vyvoj'), '<h1>Krevní testy</h1>', '<span></span>')}
    ${last ? `<div class="kstat"><div><span>Poslední odběr</span><b>${fday(last.date)}</b></div><div><span>Hodnot</span><b>${Object.keys(last.v || {}).length}</b></div><div class="${out ? 'bad' : ''}"><span>Mimo rozmezí</span><b>${out}</b></div></div>` : '<div class="empty"><b>Zatím žádný odběr</b><span>Přidej odběr, nahraj PDF nebo fotku výsledků a opiš hodnoty, které tě zajímají. Aplikace ukáže, co je mimo rozmezí a jak se to mění.</span></div>'}
    <button class="btn white block" style="margin-top:14px" data-a="kr-new">${ico('plus')} Nový odběr</button>
    ${vals ? `<div class="fsec"><div class="lbl">Hodnoty · poslední výsledek</div><div class="klist">${vals}</div></div>` : ''}
    ${T.length ? `<div class="fsec"><div class="lbl">Odběry</div><div class="list">${T.map(t => { const n = Object.keys(t.v || {}).length, o = Object.keys(t.v || {}).filter(id => ['lo', 'hi'].includes(bFlag(bmGet(id), t.v[id]))).length;
      return `<button class="li" data-a="kr-open" data-id="${t.id}"><span class="ic">${ico('cal')}</span><div class="t"><b>${fdate(t.date)}</b><small>${t.lab ? esc(t.lab) + ' · ' : ''}${n} ${pl(n, 'hodnota', 'hodnoty', 'hodnot').split(' ')[1]}${o ? ` · ${o} mimo` : ''}${(t.files || []).length ? ` · ${t.files.length} ${pl(t.files.length, 'soubor', 'soubory', 'souborů').split(' ')[1]}` : ''}</small></div>${ico('chev')}</button>`; }).join('')}</div></div>` : ''}
    <p class="mut" style="font-size:12px;margin:18px 2px 0">Rozmezí jsou běžná pro dospělého muže a každá laboratoř je má trochu jinak – klepni na ukazatel a přepiš je podle svého výsledku. Hodnoty jsou v záloze, nahrané soubory zůstávají jen v tomto telefonu.</p>
  </div>${tabs()}`;
};
A['kr-new'] = () => { const t = { id: uid(), date: today(), lab: '', v: {}, files: [] }; BL().tests.push(t); save(true); go('f-krevt', { id: t.id }); };
A['kr-open'] = b => go('f-krevt', { id: b.dataset.id });
XV['f-krevt'] = function () {
  const t = BL().tests.find(x => x.id === view.id); if (!t) return XV['f-krev']();
  const row = m => { const x = bmGet(m[0]); const v = t.v[m[0]]; const fl = bFlag(x, v);
    return `<label class="kin ${v != null ? fl : ''}"><span><b>${esc(x.name)}</b><small>${bRef(x)} ${esc(x.unit)}</small></span><input data-km="${m[0]}" inputmode="decimal" value="${v != null ? kg(v) : ''}" placeholder="–"></label>`; };
  const groups = [...BM, ...(BL().custom.length ? [['Vlastní', BL().custom]] : [])];
  return `<div class="wrap">${hdr(backBtn('f-krev'), '<h1>Odběr</h1>', `<button class="round" data-a="kr-del" aria-label="Smazat odběr">${ico('trash')}</button>`)}
    <div class="form" style="margin-top:0"><div class="two"><label class="f">Datum odběru<input type="date" id="kr-date" value="${t.date}" max="${today()}"></label><label class="f">Laboratoř<input id="kr-lab" value="${esc(t.lab || '')}" placeholder="např. Synlab"></label></div></div>
    <div class="fsec"><div class="lbl">Výsledky (PDF nebo foto)</div>
      <div class="list">${(t.files || []).map(f => `<div class="li"><span class="ic">${ico('share')}</span><button class="t" data-a="kr-fopen" data-id="${f.id}" style="text-align:left"><b>${esc(f.name)}</b><small>${f.type.includes('pdf') ? 'PDF' : 'obrázek'} · ${Math.max(1, Math.round(f.size / 1024))} kB</small></button><button class="round" style="width:38px;height:38px" data-a="kr-fdel" data-id="${f.id}" aria-label="Smazat soubor">${ico('trash')}</button></div>`).join('')}</div>
      <label class="btn block" style="margin-top:10px">${ico('plus')} Nahrát soubor<input type="file" id="kr-file" accept="application/pdf,image/*" multiple hidden></label></div>
    <div class="fsec"><div class="lbl">Hodnoty</div><p class="mut" style="font-size:13px;margin:0 2px 10px">Vyplň jen to, co máš ve výsledcích. Ukládá se samo.</p>
      ${groups.map(([g, l]) => `<div class="kgrp"><div class="kgh">${esc(g)}</div>${l.map(row).join('')}</div>`).join('')}
      <button class="btn block" style="margin-top:12px" data-a="kr-cadd">${ico('plus')} Vlastní ukazatel</button></div>
  </div>${tabs()}`;
};
const krT = () => BL().tests.find(x => x.id === view.id);
document.addEventListener('change', async e => {
  const t = view.n === 'f-krevt' && krT(); if (!t) return; const el = e.target;
  if (el.dataset.km) { const v = num(el.value); if (v == null) delete t.v[el.dataset.km]; else t.v[el.dataset.km] = v; save(true);
    const lab = el.closest('.kin'); lab.classList.remove('lo', 'hi', 'ok'); const fl = bFlag(bmGet(el.dataset.km), v); if (fl) lab.classList.add(fl); if (fl === 'lo' || fl === 'hi') toast(`${bmGet(el.dataset.km).name}: ${fl === 'lo' ? 'pod' : 'nad'} rozmezím`); return; }
  if (el.id === 'kr-date' && el.value) { t.date = el.value; save(true); return; }
  if (el.id === 'kr-lab') { t.lab = el.value.trim(); save(true); return; }
  if (el.id === 'kr-file') {
    const files = [...el.files]; el.value = ''; if (!files.length) return; toast('Ukládám…');
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
      for (const f of files) { const id = 'f' + uid(); await fPut(id, { name: f.name, type: f.type, blob: f }); (t.files = t.files || []).push({ id, name: f.name, type: f.type || '', size: f.size }); }
      save(true); render(); toast(files.length > 1 ? 'Soubory uloženy' : 'Soubor uložen');
    } catch (err) { toast('Soubor se nepodařilo uložit'); }
  }
});
A['kr-del'] = () => sheet(`<h2>Smazat odběr?</h2><p class="mut" style="margin:6px 0 0">Smažou se hodnoty i nahrané soubory tohoto odběru.</p><div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn danger" data-a="kr-del2">Smazat</button></div>`);
A['kr-del2'] = () => { const t = krT(); if (!t) return; (t.files || []).forEach(f => fDel(f.id).catch(() => { })); BL().tests = BL().tests.filter(x => x !== t); save(true); closeSheet(); go('f-krev'); toast('Smazáno'); };
A['kr-fdel'] = b => { const t = krT(); if (!t) return; fDel(b.dataset.id).catch(() => { }); t.files = (t.files || []).filter(f => f.id !== b.dataset.id); save(true); render(); };
A['kr-fopen'] = async b => {
  let f = null; try { f = await fGet(b.dataset.id); } catch (e) { } if (!f) return toast('Soubor v tomto telefonu není');
  const url = URL.createObjectURL(f.blob); const isImg = (f.type || '').startsWith('image/');
  sheet(`<h2>${esc(f.name)}</h2>${isImg ? `<img src="${url}" alt="" style="width:100%;border-radius:14px;margin-top:12px">` : `<iframe src="${url}" title="${esc(f.name)}" style="width:100%;height:60vh;border:0;border-radius:14px;margin-top:12px;background:#fff"></iframe>`}
    <div class="actions"><button class="btn" data-a="kr-fshare" data-id="${b.dataset.id}">Otevřít / uložit</button><button class="btn white" data-a="close">Zavřít</button></div>`);
};
A['kr-fshare'] = async b => { const f = await fGet(b.dataset.id).catch(() => null); if (!f) return; const file = new File([f.blob], f.name, { type: f.type });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file], title: f.name }); } catch (e) { return; }
  window.open(URL.createObjectURL(f.blob), '_blank'); };
A['kr-mk'] = b => {
  const m = bmGet(b.dataset.id); const H = bHist(m.id);
  sheet(`<h2>${esc(m.name)}</h2><p class="mut" style="margin:4px 0 0">rozmezí ${bRef(m)} ${esc(m.unit)}</p>
    <div class="klist" style="margin-top:14px">${H.map((x, i) => { const fl = bFlag(m, x.v), p = H[i + 1]; const d = p ? x.v - p.v : null;
      return `<div class="krow2 ${fl}"><span class="t"><b>${fdate(x.date)}</b><small>${x.t.lab ? esc(x.t.lab) : ''}${d != null && d !== 0 ? `${x.t.lab ? ' · ' : ''}${d > 0 ? '+' : '−'}${kg(Math.abs(Math.round(d * 100) / 100))} proti minule` : ''}</small></span><span class="v"><b>${kg(x.v)}</b><small>${fl === 'lo' ? 'nízko' : fl === 'hi' ? 'vysoko' : esc(m.unit)}</small></span></div>`; }).join('')}</div>
    <div class="lbl" style="margin:18px 2px 8px">Rozmezí podle tvé laboratoře</div>
    <div class="form" style="margin:0"><div class="two"><label class="f">Od<input id="kr-lo" inputmode="decimal" value="${m.lo != null ? kg(m.lo) : ''}"></label><label class="f">Do<input id="kr-hi" inputmode="decimal" value="${m.hi != null ? kg(m.hi) : ''}"></label></div></div>
    <div class="actions"><button class="btn" data-a="close">Zavřít</button><button class="btn white" data-a="kr-ref" data-id="${m.id}">Uložit rozmezí</button></div>`);
};
A['kr-ref'] = b => { BL().mk[b.dataset.id] = { lo: num($('#kr-lo').value), hi: num($('#kr-hi').value) }; save(true); closeSheet(); render(); toast('Rozmezí uloženo'); };
A['kr-cadd'] = () => sheet(`<h2>Vlastní ukazatel</h2><div class="form"><label class="f">Název<input id="kc-n" placeholder="např. Prolaktin"></label><label class="f">Jednotka<input id="kc-u" placeholder="např. mU/l"></label>
  <div class="two"><label class="f">Rozmezí od<input id="kc-lo" inputmode="decimal"></label><label class="f">do<input id="kc-hi" inputmode="decimal"></label></div></div>
  <div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="kr-cadd2">Přidat</button></div>`);
A['kr-cadd2'] = () => { const n = $('#kc-n').value.trim(); if (!n) return toast('Vyplň název'); BL().custom.push(['c' + uid(), n, $('#kc-u').value.trim(), num($('#kc-lo').value), num($('#kc-hi').value)]); save(true); closeSheet(); render(); };

// ---------- umístění: Vývoj (počítadlo nahoře, krevní testy dole), Dnes (krátký řádek) ----------
const _18vyvoj = XV['f-vyvoj'];
XV['f-vyvoj'] = function () {
  const h = _18vyvoj(); const T = bTests(); const last = T[0];
  const kr = `<div class="fsec"><div class="lbl">Krevní testy</div><button class="krlink" data-a="tab" data-v="f-krev"><span><b>${last ? `Poslední odběr ${fday(last.date)}` : 'Nahrát výsledky z krve'}</b><small>${last ? `${T.length} ${pl(T.length, 'odběr', 'odběry', 'odběrů').split(' ')[1]} · hodnoty a vývoj` : 'PDF nebo foto + hodnoty, které tě zajímají'}</small></span>${ico('chev')}</button></div>`;
  return h.replace('</header>', '</header>' + sobCard()).replace(/(<\/div>)(<nav class="tabs ftabs">)/, kr + '$1$2');
};
const _18fden = XV['f-den'];
XV['f-den'] = function () {
  const h = _18fden(); const n = sobDays(); if (n == null) return h;
  const T = document.createElement('template'); T.innerHTML = h; const m = T.content.querySelector('.fmeals'); if (!m) return h;
  m.insertAdjacentHTML('afterend', `<button class="fsobr" data-a="tab" data-v="f-vyvoj"><span>Bez alkoholu</span><b>${thou(n)} <small>${nDays(n)}</small></b></button>`); return T.innerHTML;
};
