
// ===================== v2.8: plán · odznaky · nová mapa svalů · drobnosti =====================

// ---------- nová mapa svalů (vlastní organické tvary, půlka těla se zrcadlí) ----------
const BODY2 = {
  sil: 'M50,3 C56,3 59,8 59,14 C59,19 57,23 55,25 L56,29 C62,31 70,32 75,36 C79,39 79,46 80,52 C81,60 82,66 82,72 C84,80 86,88 87,96 L88,104 C88,108 85,108 84,104 L81,96 C78,88 76,82 75,76 C74,72 73,66 72,62 L71,78 C71,82 70,86 69,90 C70,100 69,112 67,124 C66,132 65,138 64,142 C66,152 65,164 63,176 L62,190 C64,193 63,196 59,196 L55,196 C54,186 55,178 54,170 C53,158 53,148 53,142 C53,132 52,118 51,104 L50,100 L49,104 C48,118 47,132 47,142 C47,148 47,158 46,170 C45,178 46,186 45,196 L41,196 C37,196 36,193 38,190 L37,176 C35,164 34,152 36,142 C35,138 34,132 33,124 C31,112 30,100 31,90 C30,86 29,82 29,78 L28,62 C27,66 26,72 25,76 C24,82 22,88 19,96 L16,104 C15,108 12,108 12,104 L13,96 C14,88 16,80 18,72 C18,66 19,60 20,52 C21,46 21,39 25,36 C30,32 38,31 44,29 L45,25 C43,23 41,19 41,14 C41,8 44,3 50,3 Z',
  head: 'M50,4.5 C55,4.5 57.6,8.6 57.6,14 C57.6,19 55,23.4 50,23.4 C45,23.4 42.4,19 42.4,14 C42.4,8.6 45,4.5 50,4.5 Z',
  f: {
    traps: ['M44.5,26 C46,28 48,29 49.5,29 L49.5,33 C46,33 42,32 39,31 C41,30 43.5,29 44.5,26 Z'],
    delt: ['M37,32 C31,32 26,34 23.5,38 C21.5,42 21.5,48 22.5,53 C25,49 28,46 32,44 C34,40 35.5,36 37,32 Z'],
    chest: ['M38.5,33 C42,33.5 46,34 49.3,34.5 L49.3,50 C45,52.5 39,52 35,49 C33,47.5 32.5,46 33,45 C34.5,40 36,36 38.5,33 Z'],
    biceps: ['M31.5,46 C33,50 32.5,56 30.5,61 C28.5,64.5 25,65.5 23,64 C21.8,60 21.8,56 22.6,54.5 C25,50.5 28,47.5 31.5,46 Z'],
    forearms: ['M22.4,66 C25,67.6 28.6,67.2 30.8,64.6 C31,70 29.6,76 27.4,82 C25.6,87 23.4,92.5 21.2,98 C19.4,98.2 17.4,97.6 16.2,96.6 C16.4,88 17.6,80 19,74 C19.8,71 21,68 22.4,66 Z'],
    abs: ['M43.4,52.8 C45.4,53.2 47.4,53.2 49.3,52.8 L49.3,59.2 L43.6,59.6 Z', 'M43.6,61 L49.3,60.6 L49.3,67 L43.8,67.4 Z', 'M43.8,68.8 L49.3,68.4 L49.3,75 L44,75.4 Z', 'M44,76.8 L49.3,76.4 L49.3,90 C47,88 45,84 44,80 Z'],
    obliques: ['M34.5,51 C37,53 40,54 42.2,53.6 L42.4,62 L42.8,76 C42.8,80 43.2,83 44,86 C40,84 37,80 35.5,76 C34.5,72 34,68 34,63 C34,58 34.2,54 34.5,51 Z'],
    quads: ['M34.5,86 C38,89 42,92 45,96 C46.5,100 47,106 47,112 C47,120 46,128 44.5,134 C42,137.5 39,137.5 37,134.5 C34.5,126 32.5,114 32,104 C31.8,97 32.5,91 34.5,86 Z'],
    adductors: ['M46,95 C47.8,96.5 49,98 49.5,100 L48.8,112 C48.4,108 48,104 47.2,100 C46.8,98.5 46.4,96.5 46,95 Z'],
    calves: ['M36,144 C38.5,141.5 42.5,141.5 45.5,144 C46.8,150 46.5,157 45.4,164 C44.8,171 44.6,178 44.6,184 L41,184 C38.2,177 35.4,168 34.8,159 C34.6,153 35,148 36,144 Z'],
  },
  b: {
    traps: ['M44.5,24 C46,27 48,28.5 50,29 L50,58 C48.5,52 46.5,46 44,41 C41.5,37 38.5,34 35.5,32 C38.5,30.5 42,29 44.5,24 Z'],
    delt: ['M35,32.5 C30,32.5 26,34.5 23.5,38 C21.5,42 21.5,48 22.5,53 C25.5,49 29,45.5 33,43.5 C33.5,40 34,36 35,32.5 Z'],
    upperBack: ['M36.5,34 C39.5,36.5 42.5,40 44.5,44 C46,47 47,50 47.5,53 C44,52 40,50 37,47.5 C35.5,46 34.5,44.5 34,43.5 C34.5,40 35.3,37 36.5,34 Z'],
    lats: ['M34,46 C37.5,49.5 42.5,53 47.5,55 C48,60 48.5,66 49,71 C45,71 40.5,70 37.5,67 C35.5,63 34.5,58 33.5,53 C33.3,50.5 33.5,48 34,46 Z'],
    lowerBack: ['M38.5,69.5 C42,72 45.5,73 49.4,73 L49.4,86 C46,85 42.5,83 40,80.5 C39,77 38.5,73 38.5,69.5 Z'],
    triceps: ['M32.5,45.5 C33.3,50 32.5,55.5 30.5,60.5 C28.5,64.5 25,65.5 23,64 C21.8,60 21.8,56 22.6,54.5 C25.2,50 28.6,47 32.5,45.5 Z'],
    forearms: ['M22.4,66 C25,67.6 28.6,67.2 30.8,64.6 C31,70 29.6,76 27.4,82 C25.6,87 23.4,92.5 21.2,98 C19.4,98.2 17.4,97.6 16.2,96.6 C16.4,88 17.6,80 19,74 C19.8,71 21,68 22.4,66 Z'],
    glutes: ['M35,84 C39,86.5 44,88 49.4,88.5 L49.4,104 C46,107 41,107.5 36.5,105 C33,102 31.5,97 31.8,92 C32.2,89 33.3,86.3 35,84 Z'],
    hamstrings: ['M33,107 C37,109.5 42,110 47.5,108.5 C47.5,116 47,124 45.5,132 C44,137 41.5,138.5 38.5,137.5 C36,133 34,125 33,117 C32.6,113.5 32.6,110 33,107 Z'],
    calves: ['M36.6,143 C39.5,141 43,141 46,143.5 C47.5,149 47.5,156 46,162 C45.2,166 44.6,171 44.6,176 L40.3,178 C38.2,172 36.6,165 35.9,158 C35.5,152 35.7,147 36.6,143 Z'],
  },
};
bodySVG = function (view, P, Sx, opts = {}) {
  const hot = opts.hot || 'var(--hot)', idle = opts.idle || '#4A4B51', sil = opts.sil || '#26272B';
  const lvOf = k => P.has(k) || P.has(view + ':' + k) ? 1 : Sx.has(k) || Sx.has(view + ':' + k) ? .5 : 0;
  let g = `<path d="${BODY2.sil}" fill="${sil}"/><path d="${BODY2.head}" fill="${idle}" fill-opacity=".7"/>`;
  for (const [k, ps] of Object.entries(BODY2[view])) {
    const lv = lvOf(k), fill = lv ? hot : idle, op = lv === .5 ? ' fill-opacity=".5"' : '';
    ps.forEach(d => { g += `<path d="${d}" fill="${fill}"${op}/><path d="${d}" fill="${fill}"${op} transform="matrix(-1 0 0 1 100 0)"/>`; });
  }
  return `<svg class="body" viewBox="8 0 84 200" aria-hidden="true">${g}</svg>`;
};

// ---------- drobnosti ----------
const THAI_PARTS = ['Lapy', 'Sparing', 'Pytel', 'Technika', 'Klinč', 'Kondice', 'Švihadlo'];
const _8actSheet = actSheet;
actSheet = function (type, k, id) {
  _8actSheet(type, k, id);
  const a = id ? S.activities.find(x => x.id === id) : { type, date: k || today() };
  if (!a || !a.type) return;
  const host = $('#sheet #a-note')?.closest('label'); if (!host) return;
  if (a.type === 'bike') {
    const out = (a.kind || 'Rotoped') === 'Kolo venku';
    host.insertAdjacentHTML('beforebegin', `<label class="f" id="bike-km" ${out ? '' : 'hidden'}>Vzdálenost (km)<input id="a-km" inputmode="decimal" value="${kg(a.km)}" placeholder="25"></label>`);
  }
  if (a.type === 'thai') {
    const on = a.parts || [];
    host.insertAdjacentHTML('beforebegin', `<div><div class="lbl" style="margin:0 4px 8px">Co se dělalo</div><div class="chips tparts">${THAI_PARTS.map(p => `<button class="chip ${on.includes(p) ? 'on' : ''}" data-a="part-tog" data-v="${p}">${p}</button>`).join('')}</div></div>`);
  }
};
const _8seg = A.seg;
A.seg = b => { _8seg(b); if (b.parentElement.dataset.seg === 'kind' && $('#bike-km')) { const out = b.dataset.v === 'Kolo venku'; $('#bike-km').hidden = !out; if (!out) $('#a-km').value = ''; } };
A['part-tog'] = b => b.classList.toggle('on');
const _8actSave = A['act-save'];
A['act-save'] = b => {
  const parts = $$('#sheet .tparts .chip.on').map(x => x.dataset.v); const isThai = b.dataset.t === 'thai' || (b.dataset.id && S.activities.find(x => x.id === b.dataset.id)?.type === 'thai');
  const before = S.activities.length; const editId = b.dataset.id;
  _8actSave(b);
  const a = editId ? S.activities.find(x => x.id === editId) : S.activities.length > before ? S.activities[S.activities.length - 1] : null;
  if (a && isThai) { a.parts = parts; save(true); }
  if (a && a.type === 'bike' && a.kind !== 'Kolo venku') { delete a.km; save(true); }
  render(); setTimeout(checkBadges, 2300);
};
const _8actDesc = actDesc;
actDesc = a => { const d = _8actDesc(a); return a.parts && a.parts.length ? [a.parts.join(', '), d].filter(Boolean).join(' · ') : d; };
const _8specActivity2 = specActivity;
specActivity = a => {
  const sp = _8specActivity2(a);
  if (a.type === 'bike' && a.km && a.min) { sp.stats = [{ id: 'min', label: 'min', value: String(a.min) }, { id: 'spd', label: 'km/h', value: kg(Math.round(a.km / a.min * 600) / 10) }]; if (a.bpm) sp.stats.push({ id: 'bpm', label: 'tep', value: `${a.bpm} bpm` }); }
  if (a.type === 'bike' && a.kind) sp.title = a.kind;
  if (a.parts && a.parts.length) sp.kicker = a.parts.join(' · ');
  return sp;
};
// nálepka: dlouhý název rozdělit (OTUŽOVÁNÍ / LEDOVÁ KÁĎ), jeden řádek vpravo vycentrovat
const _8drawSticker = drawSticker;
drawSticker = function (sp, on) {
  if (sp.title.includes(' · ')) { const [a, b] = sp.title.split(' · '); sp = { ...sp, title: b, kicker: sp.kicker || a }; }
  return _8drawSticker(sp, on);
};
// multipress: osa se nepočítá
const _8drawExEdit = drawExEdit;
drawExEdit = function () {
  _8drawExEdit(); const d = exDraft; if (!d || !d.plates) return; const inp = $('#e-bar'); if (!inp) return;
  inp.closest('label').insertAdjacentHTML('afterend', `<button class="sw ${d.plates.smith ? 'on' : ''}" data-a="e-smith"><span>Multipress / stroj<small>Váha osy se nepočítá – ukáže jen kotouče na stranu</small></span><span class="k"></span></button>`);
  if (d.plates.smith) inp.closest('label').hidden = true;
};
A['e-smith'] = () => { readExDraft(); const p = exDraft.plates; p.smith = !p.smith; p.bar = p.smith ? 0 : 20; drawExEdit(); };
const _8plateResult = plateResult;
plateResult = (total, bar) => _8plateResult(total, bar).replace('jen osa', bar ? 'jen osa' : 'nic');
const _8platesSheet = platesSheet;
platesSheet = function (exId, ws) { _8platesSheet(exId, ws); const ex = exById(exId); if (ex.plates && !ex.plates.bar) { const p = $('#sheet .mut'); if (p) p.textContent = `${ex.name} · multipress, osa se nepočítá`; } };

// ---------- odstranění tréninku odkudkoli ----------
const _8daySheet = daySheet;
daySheet = function (k) {
  _8daySheet(k);
  const s = sessionOn(k); const row = s && $(`#sheet .li[data-id="${s.id}"]`);
  if (row) { const w = document.createElement('div'); w.className = 'lirow'; row.replaceWith(w); w.appendChild(row); w.insertAdjacentHTML('beforeend', `<button class="round" style="width:46px;height:46px;flex:none" data-a="lp-open" data-k="ses" data-id="${s.id}" aria-label="Možnosti">${ico('more')}</button>`); }
  const pd = planDay(k), list = $('#sheet .list');
  if (pd && list && !(s && s.end)) {
    const tp = tplById(pd.tid), st = planState(k);
    list.insertAdjacentHTML('afterbegin', `<div class="li planli"><span class="ic">${ico('cal')}</span><div class="t"><b>Podle plánu: ${esc(tp.name)}</b><small>${esc(planDayDesc(pd))}${st === 'miss' ? ' · zmeškáno' : st === 'skip' ? ' · vynecháno' : ''}</small></div>${k === today() && !s ? `<button class="btn white" style="padding:10px 16px" data-a="start" data-id="${tp.id}">Začít</button>` : ''}</div>`);
    if (!s) { const rest = $('#sheet .list > div.li:not(.planli)'); if (rest) rest.remove(); }
  }
};
A['lp-open'] = b => lpMenu(b.dataset.k === 'ses' ? 'ses' : 'act', b.dataset.id);
const _8vSummary2 = vSummary;
vSummary = function () { return _8vSummary2().replace('class="stat3" style="margin-top:14px"', 'class="stat3 sx" style="margin-top:14px"').replace(`data-a="edit-ses" data-id="${view.id}" aria-label="Upravit"`, `data-a="lp-open" data-k="ses" data-id="${view.id}" aria-label="Možnosti"`); };

// ===================== TRÉNINKOVÝ PLÁN =====================
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const CARDIO_KINDS = ['Rotoped', 'Kolo', 'Běh', 'Chůze do kopce', 'Veslo'];
const prog = () => S.program && S.program.on ? S.program : null;
function planDay(k) { const p = prog(); if (!p || k < p.start) return null; if (p.weeks && k > planEnd(p)) return null; const d = p.days[pdate(k).getDay()]; return d && d.tid && tplById(d.tid) ? d : null; }
function planEnd(p) { return dkey(addDays(pdate(p.start), p.weeks * 7 - 1)); }
function planDayDesc(d) { return [d.focus, d.cardio ? `+ ${d.cardio.kind}${d.cardio.min ? ' ' + d.cardio.min + ' min' : ''}` : '', d.stretch ? '+ strečink' : ''].filter(Boolean).join(' · '); }
// stav plánovaného dne: done / skip / miss / today / plan
function planState(k) {
  const pd = planDay(k); if (!pd) return null; const s = sessionOn(k), t = today();
  if (s && s.end) return 'done';
  if (S.days[k]?.planSkip) return 'skip';
  if (k > t) return 'plan';
  if (k === t) return 'today';
  // dohnáno později ve stejném týdnu stejným tréninkem?
  const end = dkey(addDays(monday(pdate(k)), 6));
  if (finished().some(o => o.tid === pd.tid && o.date > k && o.date <= end && planDay(o.date)?.tid !== pd.tid)) return 'moved';
  return 'miss';
}
function lastMissed() {
  const p = prog(); if (!p) return null; const t = today();
  for (let i = 1; i <= 6; i++) { const k = dkey(addDays(pdate(t), -i)); if (k < p.start) break; if (planState(k) === 'miss') return k; }
  return null;
}
const _8nextTemplate2 = nextTemplate;
nextTemplate = function (after) {
  const p = prog(); if (!p) return _8nextTemplate2(after);
  const t = today();
  if (!after && !sessionOn(t)) { const pd = planDay(t); if (pd) return tplById(pd.tid); const m = lastMissed(); if (m) return tplById(planDay(m).tid); }
  for (let i = 1; i <= 7; i++) { const pd = planDay(dkey(addDays(new Date(), i))); if (pd) return tplById(pd.tid); }
  return _8nextTemplate2(after);
};
function nextPlanDay(fromK) { for (let i = 1; i <= 7; i++) { const k = dkey(addDays(pdate(fromK), i)); if (planDay(k)) return k; } return null; }
function planWeek(monK) { const ks = [...Array(7)].map((_, i) => dkey(addDays(pdate(monK), i))).filter(k => planDay(k)); return { n: ks.length, done: ks.filter(k => ['done', 'moved'].includes(planState(k))).length }; }
// po startu z plánu předvyplnit kardio a doporučení
const _8startSession = startSession;
startSession = function (tid) {
  _8startSession(tid); const s = S.active && sesById(S.active); if (!s || s.tid !== tid) return;
  const t = today(); let pd = planDay(t); if (!pd || pd.tid !== tid) { const m = lastMissed(); pd = m && planDay(m).tid === tid ? planDay(m) : pd && pd.tid === tid ? pd : null; }
  if (pd) { s.plan = { focus: pd.focus || '', cardio: pd.cardio || null, stretch: !!pd.stretch, note: pd.note || '' }; if (pd.cardio) s.cardio = { mode: 'none', ...pd.cardio }; save(true); }
};
const _8vFin = vFin;
vFin = function () {
  let h = _8vFin(); const s = sesById(view.id); if (!s || !s.plan || (view.step || 1) !== 3) return h;
  const p = s.plan, items = [p.cardio ? `${p.cardio.kind}${p.cardio.min ? ' ' + p.cardio.min + ' min' : ''}${p.cardio.bpm ? ' · tep ' + p.cardio.bpm : ''}` : '', p.stretch ? 'statický strečink' : '', p.note].filter(Boolean);
  if (!items.length) return h;
  return h.replace('<div class="opt">', `<div class="opt"><div class="reco"><span class="lbl">Podle plánu${p.focus ? ' · ' + esc(p.focus) : ''}</span>${items.map(esc).join('<br>')}${p.cardio ? `<button class="btn" style="margin-top:12px;width:100%" data-a="plan-cardio-done">${ico('check')} Kardio jsem dal</button>` : ''}</div>`);
};
A['plan-cardio-done'] = () => { const s = sesById(view.id); if (!s.plan?.cardio) return; s.cardio = { mode: 'join', ...s.plan.cardio }; save(); render(); toast('Kardio zapsáno k tréninku'); };

// domů: karta plánu + otázka u zmeškaného dne
function planCard() {
  const p = prog(); if (!p) return '';
  const t = today(), pd = planDay(t), s = sessionOn(t), miss = !s ? lastMissed() : null;
  const wk = planWeek(dkey(monday(new Date())));
  const weekN = Math.floor((toU(dkey(monday(new Date()))) - toU(dkey(monday(pdate(p.start))))) / 7) + 1;
  let line;
  if (pd) line = `<b>Dnes ${esc(tplById(pd.tid).name)}</b><small>${esc(planDayDesc(pd) || 'podle plánu')}</small>`;
  else { const nk = nextPlanDay(t); line = `<b>Dnes volno</b><small>${nk ? `Další: ${esc(tplById(planDay(nk).tid).name)} · ${DOWL[pdate(nk).getDay()]}` : 'Odpočinek'}</small>`; }
  let h = `<button class="plcard" data-a="tab" data-v="plan"><span class="plring">${ringSVG(wk.done, wk.n, 52, 5, 'var(--hot)')}<i>${wk.done}/${wk.n}</i></span><span class="t"><small class="lbl">${esc(p.name)}${p.weeks ? ` · týden ${Math.min(weekN, p.weeks)}/${p.weeks}` : ''}</small>${line}</span><span class="chev">${ico('chev')}</span></button>`;
  if (miss) {
    const mt = tplById(planDay(miss).tid);
    h += `<div class="plmiss"><div><b>${DOWL[pdate(miss).getDay()][0].toUpperCase() + DOWL[pdate(miss).getDay()].slice(1)} ti utekl ${esc(mt.name)}</b><span class="mut">Plán se neposouvá. Co s ním?</span></div>
      <div class="two"><button class="btn" data-a="plan-skip" data-k="${miss}">Vynechat</button><button class="btn white" data-a="start" data-id="${mt.id}">Odjet dnes</button></div></div>`;
  }
  return h;
}
A['plan-skip'] = b => { const d = S.days[b.dataset.k] = S.days[b.dataset.k] || {}; d.planSkip = 1; save(true); render(); toast('Vynecháno, plán jede dál'); };
const _8vHome2 = vHome;
vHome = function () {
  let h = _8vHome2(); const pc = planCard(); if (pc) h = h.replace('<div class="hgrid">', pc + '<div class="hgrid">');
  return markPlanCells(h, 'w7');
};
function markPlanCells(h, cls) {
  const re = new RegExp(`class="${cls} ([^"]*)" data-a="day" data-k="(\\d{4}-\\d\\d-\\d\\d)"`, 'g');
  return h.replace(re, (m, c, k) => { const st = planState(k); const add = st === 'plan' || st === 'today' ? ' pl-on' : st === 'miss' ? ' pl-miss' : ''; return `class="${cls} ${c}${add}" data-a="day" data-k="${k}"`; });
}
const _8vCal2 = vCal;
vCal = function () { let h = markPlanCells(_8vCal2(), 'cd'); if (prog()) h = h.replace('<span><u style="background:var(--sick)"></u>Nemoc</span>', '<span><u style="background:var(--sick)"></u>Nemoc</span><span><u class="o"></u>Plán</span>'); return h; };
const _8vGym2 = vGym;
vGym = function () {
  const p = prog(); const wk = p && planWeek(dkey(monday(new Date())));
  return _8vGym2().replace('<div class="lbl" style="margin:26px 6px 10px">Přehled</div>\n    <div class="list">', `<div class="lbl" style="margin:26px 6px 10px">Přehled</div>
    <div class="list"><button class="li" data-a="tab" data-v="plan"><span class="ic" style="color:var(--hot)">${ico('cal')}</span><div class="t"><b>${p ? esc(p.name) : 'Sestavit plán'}</b><small>${p ? `Tento týden ${wk.done}/${wk.n} · dny, zaměření, kardio` : 'V jaké dny jaký trénink, kardio, strečink'}</small></div><span class="chev">${ico('chev')}</span></button>
      <button class="li" data-a="tab" data-v="badges"><span class="ic" style="color:#F4C542">${ico('medal')}</span><div class="t"><b>Odznaky</b><small>${badgeCount()} získaných</small></div><span class="chev">${ico('chev')}</span></button>`);
};

// přehled plánu
XV.plan = function () {
  const p = S.program;
  if (!p || !p.on) return `<div class="wrap">${hdr(backBtn('gym'), '<h1>Plán</h1>', '<span></span>')}
    <div class="empty" style="margin-top:10px"><b>Sestav si tréninkový plán</b><span>Nastavíš, v jaké dny jaký trénink, na co je zaměřený a co po něm (kardio, strečink). Kalendář pak ukáže, co tě čeká, a když den nestihneš, zeptá se – nic se neposouvá.</span><button class="btn white" data-a="plan-edit">${p ? 'Obnovit plán' : 'Sestavit plán'}</button></div></div>${tabs()}`;
  const mon = dkey(monday(new Date())), wk = planWeek(mon), pw = planWeek(dkey(addDays(pdate(mon), -7)));
  const weekN = Math.floor((toU(mon) - toU(dkey(monday(pdate(p.start))))) / 7) + 1;
  const rows = WEEK_ORDER.map(dw => {
    const d = p.days[dw]; const k = dkey(addDays(pdate(mon), (dw + 6) % 7)); const tp = d && d.tid && tplById(d.tid);
    if (!tp) return `<div class="li pday off"><span class="dw">${DOW[dw]}</span><div class="t"><b class="mut">Volno</b></div></div>`;
    const st = planState(k) || 'plan';
    const lab = { done: 'Hotovo', moved: 'Dohnáno', skip: 'Vynecháno', miss: 'Zmeškáno', today: 'Dnes', plan: '' }[st];
    return `<button class="li pday ${st}" data-a="day" data-k="${k}"><span class="dw">${DOW[dw]}</span><div class="t"><b>${esc(tp.name)}</b><small>${esc(planDayDesc(d) || CVK(tp.ex.length))}</small></div>${lab ? `<span class="pst ${st}">${lab}</span>` : ''}</button>`;
  }).join('');
  return `<div class="wrap">
    ${hdr(backBtn('gym'), '<h1>Plán</h1>', `<button class="round" data-a="plan-edit" aria-label="Upravit plán">${ico('more')}</button>`)}
    <div class="plhero"><h2>${esc(p.name)}</h2>
      <div class="chips">${p.focus ? `<span class="chip">${esc(p.focus)}</span>` : ''}${p.weeks ? `<span class="chip">${p.weeks} týdnů</span>` : ''}<span class="chip">${wk.n}× týdně</span></div>
      <div class="plprog"><span class="plring big">${ringSVG(wk.done, wk.n, 96, 8, 'var(--hot)')}<i>${wk.done}/${wk.n}</i></span>
        <div><div class="lbl">${p.weeks ? `Týden ${Math.min(weekN, p.weeks)} z ${p.weeks}` : `Týden ${weekN}`}</div><p>Tento týden máš hotovo ${wk.done} z ${wk.n}.</p>${weekN > 1 ? `<p class="mut">Minulý týden ${pw.done}/${pw.n}</p>` : ''}</div></div>
      ${p.weeks ? `<div class="plbar"><i style="width:${Math.min(100, Math.round((weekN - 1) / p.weeks * 100 + wk.done / Math.max(1, wk.n) / p.weeks * 100))}%"></i></div>` : ''}</div>
    <div class="lbl" style="margin:22px 6px 10px">Tento týden</div>
    <div class="list">${rows}</div>
  </div>${tabs()}`;
};
// editor plánu
let planDraft = null;
A['plan-edit'] = () => {
  const p = S.program;
  planDraft = p ? JSON.parse(JSON.stringify(p)) : { name: 'Můj plán', focus: '', weeks: null, start: dkey(monday(new Date())), days: {}, on: true };
  if (!p) S.templates.forEach(t => { if (t.dow != null && !planDraft.days[t.dow]) planDraft.days[t.dow] = { tid: t.id, focus: '', cardio: null, stretch: false, note: '' }; });
  planDraft.on = true; go('planEdit');
};
XV.planEdit = function () {
  const d = planDraft; if (!d) return XV.plan();
  const days = WEEK_ORDER.map(dw => {
    const x = d.days[dw] || {}; const tp = x.tid && tplById(x.tid);
    return `<div class="pde ${tp ? 'on' : ''}" data-dw="${dw}"><div class="pdh"><b>${DOWL[dw][0].toUpperCase() + DOWL[dw].slice(1)}</b>
      <select data-pf="tid"><option value="">Volno</option>${S.templates.map(t => `<option value="${t.id}" ${x.tid === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
      ${tp ? `<div class="form" style="margin-top:12px;gap:10px">
        <label class="f">Zaměření dne<input data-pf="focus" value="${esc(x.focus || '')}" placeholder="např. Spodek, Vršek, Nohy"></label>
        <div class="two"><label class="f">Kardio po tréninku<select data-pf="ck"><option value="">Žádné</option>${CARDIO_KINDS.map(o => `<option ${x.cardio?.kind === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
          <div class="two" ${x.cardio ? '' : 'hidden'}><label class="f">Min<input data-pf="cmin" inputmode="numeric" value="${x.cardio?.min ?? ''}" placeholder="15"></label><label class="f">Tep<input data-pf="cbpm" inputmode="numeric" value="${x.cardio?.bpm ?? ''}" placeholder="120"></label></div></div>
        <button class="sw ${x.stretch ? 'on' : ''}" data-a="pf-stretch"><span>Doporučit strečink<small>Připomene se při dokončení</small></span><span class="k"></span></button>
        <label class="f">Poznámka k dni<input data-pf="note" value="${esc(x.note || '')}" placeholder="např. bez kardia, když je box"></label></div>` : ''}</div>`;
  }).join('');
  return `<div class="wrap" style="padding-bottom:30px">
    ${hdr(`<button class="round" data-a="tab" data-v="plan" aria-label="Zpět">${ico('back')}</button>`, '<h1>Upravit plán</h1>', `<button class="round" data-a="plan-save" aria-label="Uložit" style="background:var(--white);color:var(--ink)">${ico('check')}</button>`)}
    <div class="form" style="margin-top:0">
      <label class="f">Název plánu<input id="pl-name" value="${esc(d.name)}" placeholder="např. Fullbody se zaměřením na nohy"></label>
      <label class="f">Zaměření<input id="pl-focus" value="${esc(d.focus || '')}" placeholder="např. Hypertrofie, příprava na závody"></label>
      <div class="two"><label class="f">Délka (týdny)<input id="pl-weeks" inputmode="numeric" value="${d.weeks ?? ''}" placeholder="bez konce"></label><label class="f">Začátek<input id="pl-start" type="date" value="${d.start}"></label></div>
    </div>
    <div class="lbl" style="margin:22px 6px 10px">Dny v týdnu</div>
    <p class="mut" style="font-size:14px;margin:0 4px 12px">Trénink je pevně daný na den. Když ho nestihneš, aplikace se zeptá – nic se neposouvá.</p>
    <div class="pdl">${days}</div>
    <div class="bottom-acts" style="margin-top:20px"><button class="pill white" data-a="plan-save">Uložit plán</button>${S.program && S.program.on ? `<button class="btn danger block" data-a="plan-off">Ukončit plán</button>` : ''}</div>
  </div>`;
};
function readPlanDraft() {
  const d = planDraft; if (!d || !$('#pl-name')) return;
  d.name = $('#pl-name').value.trim() || 'Můj plán'; d.focus = $('#pl-focus').value.trim(); d.weeks = num($('#pl-weeks').value) || null; d.start = $('#pl-start').value || d.start;
  $$('.pde').forEach(el => {
    const dw = +el.dataset.dw, v = f => $(`[data-pf="${f}"]`, el);
    const tid = v('tid').value; if (!tid) { delete d.days[dw]; return; }
    const x = d.days[dw] = d.days[dw] && d.days[dw].tid === tid ? d.days[dw] : { tid, focus: '', cardio: null, stretch: false, note: '' };
    if (v('focus')) { x.focus = v('focus').value.trim(); x.note = v('note').value.trim(); const ck = v('ck').value; x.cardio = ck ? { kind: ck, min: num(v('cmin').value), bpm: num(v('cbpm').value) } : null; }
  });
}
document.addEventListener('change', ev => { if (view.n === 'planEdit' && ev.target.matches('[data-pf="tid"],[data-pf="ck"]')) { readPlanDraft(); const a = $('#app'), y = a ? a.scrollTop : 0; render(); if (a) a.scrollTop = y; } });
A['pf-stretch'] = b => { readPlanDraft(); const dw = +b.closest('.pde').dataset.dw; const x = planDraft.days[dw]; if (x) { x.stretch = !x.stretch; b.classList.toggle('on', x.stretch); } };
A['plan-save'] = () => {
  readPlanDraft(); const d = planDraft; if (!Object.keys(d.days).length) return toast('Vyber aspoň jeden den');
  S.program = { ...d, on: true }; S.templates.forEach(t => { delete t.dow; }); S.settings.weekGoal = Object.keys(d.days).length;
  planDraft = null; save(true); go('plan'); toast('Plán uložen');
};
A['plan-off'] = () => { if (!S.program) return; S.program.on = false; planDraft = null; save(true); go('plan'); toast('Plán ukončen'); };
// jednorázově: z dnů v šablonách udělat plán
(function () {
  if (S.settings.migProg1) return; S.settings.migProg1 = 1;
  const ts = S.templates.filter(t => t.dow != null); if (ts.length && !S.program) {
    const days = {}; ts.forEach(t => { days[t.dow] = { tid: t.id, focus: /LOWER/i.test(t.name) ? 'Spodek' : /UPPER/i.test(t.name) ? 'Vršek' : /FULL/i.test(t.name) ? 'Full body' : '', cardio: null, stretch: false, note: '' }; });
    S.program = { name: 'Můj plán', focus: '', weeks: null, start: dkey(monday(new Date())), days, on: true }; S.settings.weekGoal = ts.length;
  }
  save(true);
})();

// ===================== ODZNAKY =====================
const BADGES = [
  { id: 'gym', name: 'Gym', picto: 'gym', unit: ['trénink', 'tréninky', 'tréninků'], tiers: [1, 10, 25, 50, 100, 200, 365], val: () => finished().length },
  { id: 'ton', name: 'Nazvedáno', picto: 'dumbbell', unit: ['tuna', 'tuny', 'tun'], tiers: [10, 50, 100, 250, 500, 1000], val: () => Math.floor(finished().reduce((a, s) => a + stats(s).vol, 0) / 1000) },
  { id: 'pr', name: 'Rekordy', picto: 'gym', unit: ['rekord', 'rekordy', 'rekordů'], tiers: [1, 10, 25, 50, 100, 250], val: () => finished().reduce((a, s) => a + sessionPRs(s).length, 0) },
  { id: 'week', name: 'Splněné týdny', picto: 'gym', unit: ['týden', 'týdny', 'týdnů'], tiers: [1, 4, 8, 12, 26, 52], val: () => { const goal = S.settings.weekGoal || 4; const fs = finished(); if (!fs.length) return 0; let c = 0; const m0 = monday(pdate(fs[fs.length - 1].date)); for (let m = m0; m <= new Date(); m = addDays(m, 7)) if (weekCount(m) >= goal) c++; return c; } },
  { id: 'sauna', name: 'Sauna', picto: 'sauna', act: 'sauna', unit: ['sauna', 'sauny', 'saun'], tiers: [1, 10, 25, 50, 100, 200, 300] },
  { id: 'cold', name: 'Otužování', picto: 'cold', act: 'cold', unit: ['otužování', 'otužování', 'otužování'], tiers: [1, 10, 25, 50, 100, 200] },
  { id: 'thai', name: 'Thai box', picto: 'thai', act: 'thai', unit: ['trénink', 'tréninky', 'tréninků'], tiers: [1, 10, 25, 50, 100, 200] },
  { id: 'bike', name: 'Kolo / rotoped', picto: 'bike', act: 'bike', unit: ['jízda', 'jízdy', 'jízd'], tiers: [1, 10, 25, 50, 100] },
  { id: 'run', name: 'Běh', picto: 'run', unit: ['km', 'km', 'km'], tiers: [10, 50, 100, 250, 500, 1000], val: () => Math.floor(S.activities.filter(a => a.type === 'run').reduce((x, a) => x + (a.km || 0), 0)) },
];
const TIER = [['Bronz', '#C98A5A'], ['Stříbro', '#C9CDD3'], ['Zlato', '#F4C542'], ['Platina', '#9FE3F0'], ['Diamant', '#B59CF0'], ['Mistr', '#FF6A2B'], ['Legenda', '#FF6A2B']];
const PRAISE = ['Začátek je za tebou.', 'Tohle už není náhoda.', 'Z toho se stává zvyk.', 'Pořádná porce disciplíny.', 'Tohle dělá málokdo.', 'Úroveň, na kterou se nedostaneš omylem.', 'Legenda.'];
const bVal = b => b.val ? b.val() : S.activities.filter(a => a.type === b.act).length;
const bLevel = b => { const v = bVal(b); let l = -1; b.tiers.forEach((t, i) => { if (v >= t) l = i; }); return l; };
function badgeCount() { return BADGES.reduce((a, b) => a + bLevel(b) + 1, 0); }
function badgeSVG(b, li, size = 84) {
  const got = li >= 0, col = got ? TIER[Math.min(li, TIER.length - 1)][1] : '#3A3B40', n = got ? b.tiers[li] : b.tiers[0];
  let pts = ''; for (let i = 0; i < 32; i++) { const r = i % 2 ? 44 : 48, a = i / 32 * Math.PI * 2 - Math.PI / 2; pts += `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)} `; }
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
    <polygon points="${pts}" fill="${got ? col : 'none'}" ${got ? 'fill-opacity=".16"' : ''} stroke="${col}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="35" fill="${got ? '#151517' : '#1C1C1F'}" stroke="${col}" stroke-width="${got ? 3 : 1.5}" ${got ? '' : 'stroke-dasharray="3 4"'}/>
    <g transform="translate(36 24) scale(1.17)" style="color:${got ? col : '#55565C'}">${pmarkup(b.picto)}</g>
    <text x="50" y="${n >= 100 ? 72 : 73}" text-anchor="middle" font-family='${CF}' font-size="${n >= 1000 ? 12 : 15}" font-weight="900" font-style="italic" fill="${got ? '#F5F5F7' : '#6C6C70'}">${n}</text></svg>`;
}
XV.badges = function () {
  const cards = BADGES.map(b => {
    const li = bLevel(b), v = bVal(b), nx = b.tiers[li + 1];
    return `<button class="bdg" data-a="badge" data-id="${b.id}">${badgeSVG(b, li)}<b>${esc(b.name)}</b><small>${li >= 0 ? TIER[Math.min(li, TIER.length - 1)][0] : 'Zatím nic'}</small>
      ${nx != null ? `<span class="bbar"><i style="width:${Math.min(100, Math.round(v / nx * 100))}%"></i></span><em>${v} / ${nx}</em>` : '<em>Max</em>'}</button>`;
  }).join('');
  return `<div class="wrap">${hdr(backBtn('gym'), '<h1>Odznaky</h1>', '<span></span>')}
    <p class="mut" style="font-size:14px;margin:0 4px 14px">Sbírají se samy. Když nějaký získáš, krátce se ukáže dole.</p>
    <div class="bgrid">${cards}</div></div>${tabs()}`;
};
A.badge = b => {
  const g = BADGES.find(x => x.id === b.dataset.id), li = bLevel(g), v = bVal(g);
  sheet(`<h2>${esc(g.name)}</h2><p class="mut" style="margin:4px 0 0">Máš ${v} ${pl(v, ...g.unit).replace(/^\d+\s/, '')}</p>
    <div class="bgrid sm" style="margin-top:16px">${g.tiers.map((t, i) => `<div class="bdg ${i <= li ? '' : 'lock'}">${badgeSVG(g, i <= li ? i : -1, 72).replace(`>${g.tiers[0]}</text>`, `>${t}</text>`)}<small>${TIER[Math.min(i, TIER.length - 1)][0]}</small></div>`).join('')}</div>
    <div class="actions"><button class="btn white" data-a="close">Zavřít</button></div>`);
};
function checkBadges(silent) {
  const seen = S.settings.badges = S.settings.badges || {}; const fresh = [];
  BADGES.forEach(b => { const l = bLevel(b); if (l > (seen[b.id] ?? -1)) { if (!silent) fresh.push([b, l]); seen[b.id] = l; } });
  if (fresh.length || silent) save(true);
  if (!fresh.length || silent) return;
  const [b, l] = fresh[fresh.length - 1]; const n = b.tiers[l];
  const el = document.createElement('button'); el.className = 'bpop'; el.dataset.a = 'tab'; el.dataset.v = 'badges';
  el.innerHTML = `${badgeSVG(b, l, 58)}<span><small>Nový odznak · ${esc(b.name)} · ${TIER[Math.min(l, TIER.length - 1)][0]}</small><b>${n} ${pl(n, ...b.unit).replace(/^\d+\s/, '')}</b><em>${PRAISE[Math.min(l, PRAISE.length - 1)]}</em></span>`;
  document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
  setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 400); }, 5200);
  el.addEventListener('click', () => el.remove());
}
const _8finishSave = A['finish-save'];
A['finish-save'] = b => { _8finishSave(b); setTimeout(checkBadges, 2600); };
// stávající stav označit jako viděný (žádná lavina hned po aktualizaci)
if (!S.settings.badges) checkBadges(true);
