
// ===================== v2.6: mapa svalů (vlastní kresba) · podržení = možnosti =====================
const MIR = pts => pts.map(([x, y]) => [60 - x, y]);
const RG = (pts, both = true) => both ? [pts, MIR(pts)] : [pts];
// přední pohled
const BODY_F = {
  base: [[[25, 10], [35, 10], [35, 15], [25, 15]], [[26, 38], [34, 38], [35, 42], [25, 42]], [[11, 45], [16, 45], [15, 49], [10, 49]], [[49, 45], [44, 45], [45, 49], [50, 49]], [[22, 75], [27, 75], [28, 78], [21, 78]], [[38, 75], [33, 75], [32, 78], [39, 78]], [[24, 38], [26, 38], [25, 42], [22, 41]], [[36, 38], [34, 38], [35, 42], [38, 41]]],
  delt: RG([[17, 16], [23, 15], [22, 22], [15.5, 23.5]]),
  chest: RG([[23.5, 15.5], [29.4, 16.5], [29.4, 24], [23, 22.5]]),
  biceps: RG([[15, 24.5], [21, 23.5], [19.5, 33], [14, 33]]),
  forearms: RG([[13.6, 34], [19.2, 34], [16.4, 44], [11, 44]]),
  abs: [[[24.5, 25], [29.4, 25.5], [29.4, 37.5], [25.5, 37.5]], MIR([[24.5, 25], [29.4, 25.5], [29.4, 37.5], [25.5, 37.5]])],
  obliques: RG([[22, 24], [24, 25], [25, 37.5], [22.4, 36]]),
  quads: RG([[22.4, 42.5], [28.4, 43], [27.6, 58], [22.4, 57.4]]),
  adductors: RG([[28.8, 43], [29.6, 43], [29.2, 53], [27.9, 52]]),
  calves: RG([[22.6, 59.6], [27.6, 59.6], [26.6, 74], [23.4, 74]]),
};
// zadní pohled
const BODY_B = {
  base: [[[25, 10], [35, 10], [35, 13], [25, 13]], [[11, 45], [16, 45], [15, 49], [10, 49]], [[49, 45], [44, 45], [45, 49], [50, 49]], [[22, 75], [27, 75], [28, 78], [21, 78]], [[38, 75], [33, 75], [32, 78], [39, 78]]],
  traps: [[[23.5, 13.5], [36.5, 13.5], [33, 20], [30, 22], [27, 20]]],
  delt: RG([[17, 16], [23, 15], [22, 22], [15.5, 23.5]]),
  upperBack: RG([[23.5, 16.5], [26.5, 20.5], [29.4, 22.6], [29.4, 27], [24, 25]]),
  lats: RG([[22.4, 23], [29.4, 28], [29.4, 31], [24.6, 34], [22.6, 30]]),
  lowerBack: [[[25, 34.6], [29.4, 31.6], [30.6, 31.6], [35, 34.6], [34.6, 38.6], [25.4, 38.6]]],
  triceps: RG([[15, 24.5], [21, 23.5], [19.5, 33], [14, 33]]),
  forearms: RG([[13.6, 34], [19.2, 34], [16.4, 44], [11, 44]]),
  glutes: RG([[22.6, 39.2], [29.4, 39.2], [29.4, 47.4], [22.6, 46.6]]),
  hamstrings: RG([[22.4, 48], [29, 48.4], [28, 58.6], [22.8, 58.6]]),
  calves: RG([[22.4, 59.6], [28, 59.6], [27, 69], [23.2, 72]]),
};
const MUSCLE_RX = [
  [/hrud|pec/, ['chest']], [/přední delt/, ['f:delt']], [/boční delt|ramen/, ['f:delt', 'b:delt']], [/zadní delt/, ['b:delt']], [/trap/, ['traps']],
  [/široký sval zádový|lat\b|lats/, ['lats']], [/horní záda/, ['upperBack', 'b:delt']], [/vzpřim|bedr|spodní záda/, ['lowerBack']], [/biceps|brachial(?!radial)/, ['biceps']], [/triceps/, ['triceps']],
  [/předlok|brachioradial|flexor/, ['forearms']], [/břich|abs|core/, ['abs', 'obliques']], [/kvadr/, ['quads']], [/addukt/, ['adductors']], [/hamstr/, ['hamstrings']], [/hýžd|glute/, ['glutes']], [/lýtk/, ['calves']],
];
function musclesOf(ex) {
  const P = new Set(), Sx = new Set();
  const scan = (t, set) => MUSCLE_RX.forEach(([rx, keys]) => { if (rx.test((t || '').toLowerCase())) keys.forEach(k => set.add(k)); });
  scan(ex.muscle, P); scan(ex.secondary, Sx); P.forEach(k => Sx.delete(k)); return { P, S: Sx };
}
function bodySVG(view, P, Sx, opts = {}) {
  const B = view === 'f' ? BODY_F : BODY_B, hot = opts.hot || 'var(--hot)', base = opts.base || '#E6E6EA', gap = opts.gap || 'var(--card)';
  const on = k => P.has(k) || P.has(view + ':' + k) ? 1 : Sx.has(k) || Sx.has(view + ':' + k) ? .5 : 0;
  let g = `<circle cx="30" cy="5.6" r="4.4" fill="${base}"/>`;
  for (const [k, polys] of Object.entries(B)) {
    const lv = k === 'base' ? 0 : on(k);
    polys.forEach(p => { g += `<polygon points="${p.map(q => q.join(',')).join(' ')}" fill="${lv ? hot : base}" ${lv === .5 ? 'fill-opacity=".55"' : ''} stroke="${gap}" stroke-width=".9" stroke-linejoin="round"/>`; });
  }
  return `<svg class="body" viewBox="8 0 44 80" aria-hidden="true">${g}</svg>`;
}
function muscleMap(P, Sx, legend = true) {
  return `<div class="mmap"><div class="mm2"><div>${bodySVG('f', P, Sx)}<span>zepředu</span></div><div>${bodySVG('b', P, Sx)}<span>zezadu</span></div></div>
    ${legend ? `<div class="mleg"><span><u></u>primárně</span><span><u class="s"></u>sekundárně</span></div>` : ''}</div>`;
}
// info o cviku: mapa nahoře
const _infoSheet = infoSheet;
infoSheet = function (id) {
  _infoSheet(id); const ex = exById(id); if (!ex) return; const { P, S: Sx } = musclesOf(ex); if (!P.size && !Sx.size) return;
  const host = $('#sheet .info-b'); if (host) host.insertAdjacentHTML('afterbegin', muscleMap(P, Sx));
};
// shrnutí tréninku: všechny procvičené svaly
function sessionMuscles(s) { const P = new Set(), Sx = new Set(); s.entries.forEach(e => { const ex = exById(e.exId); if (!ex || !e.sets.some(st => hasData(st, exE(e)))) return; const m = musclesOf(ex); m.P.forEach(k => P.add(k)); m.S.forEach(k => Sx.add(k)); }); P.forEach(k => Sx.delete(k)); return { P, S: Sx }; }
const _vSummary = vSummary;
vSummary = function () {
  const html = _vSummary(); const s = sesById(view.id); if (!s) return html; const { P, S: Sx } = sessionMuscles(s); if (!P.size) return html;
  return html.replace('<div class="stat3" style="margin-top:14px">', `<div class="card" style="margin-top:14px;padding:16px 18px"><div class="lbl" style="margin-bottom:10px">Procvičené svaly</div>${muscleMap(P, Sx)}</div><div class="stat3" style="margin-top:14px">`);
};

// ---------- podržení prstu na tréninku / aktivitě ----------
let lpT = null, lpFired = false, lpStart = null;
document.addEventListener('pointerdown', ev => {
  const b = ev.target.closest('[data-a="open-sum"][data-id],[data-a="act-edit"][data-id]'); if (!b) return;
  lpFired = false; lpStart = [ev.clientX, ev.clientY]; clearTimeout(lpT);
  lpT = setTimeout(() => { lpFired = true; try { navigator.vibrate && navigator.vibrate(12); } catch (e) { } lpMenu(b.dataset.a === 'act-edit' ? 'act' : 'ses', b.dataset.id); }, 520);
});
document.addEventListener('pointermove', ev => { if (lpT && lpStart && Math.hypot(ev.clientX - lpStart[0], ev.clientY - lpStart[1]) > 10) { clearTimeout(lpT); lpT = null; } });
['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, () => { clearTimeout(lpT); lpT = null; }));
document.addEventListener('click', ev => { if (lpFired) { lpFired = false; ev.stopPropagation(); ev.preventDefault(); } }, true);
document.addEventListener('contextmenu', ev => { if (ev.target.closest('[data-a="open-sum"],[data-a="act-edit"]')) ev.preventDefault(); });
function lpMenu(kind, id) {
  if (kind === 'ses') {
    const s = sesById(id); if (!s) return;
    sheet(`<h2>${esc(s.name)}</h2><p class="mut" style="margin:4px 0 0">${flong(s.date)}${s.end ? ` · ${fmin(s.end - s.start)} min` : ''}</p><div class="list" style="margin-top:16px">
      <button class="li" data-a="open-sum" data-id="${s.id}"><div class="t"><b>Otevřít shrnutí</b></div></button>
      <button class="li" data-a="edit-ses" data-id="${s.id}"><div class="t"><b>Upravit zápis</b></div></button>
      <button class="li" data-a="lp-share-ses" data-id="${s.id}"><div class="t"><b>Sdílet</b></div></button>
      <button class="li" data-a="lp-del" data-k="ses" data-id="${s.id}"><div class="t"><b style="color:var(--down)">Odstranit trénink</b></div></button></div><div id="lp-conf"></div>`);
  } else {
    const a = S.activities.find(x => x.id === id); if (!a) return; const t = ACT_TYPES[a.type] || ACT_TYPES.other;
    sheet(`<h2>${esc(a.label || t.name)}</h2><p class="mut" style="margin:4px 0 0">${flong(a.date)}</p><div class="list" style="margin-top:16px">
      <button class="li" data-a="act-edit" data-id="${a.id}"><div class="t"><b>Upravit</b></div></button>
      <button class="li" data-a="act-share" data-id="${a.id}"><div class="t"><b>Sdílet</b></div></button>
      <button class="li" data-a="lp-del" data-k="act" data-id="${a.id}"><div class="t"><b style="color:var(--down)">Odstranit aktivitu</b></div></button></div><div id="lp-conf"></div>`);
  }
}
Object.assign(A, {
  'lp-share-ses': b => { closeSheet(); const s = sesById(b.dataset.id); if (s) storySummary(s); },
  'lp-del': b => { $('#lp-conf').innerHTML = `<div class="confirm"><b>Opravdu chceš ${b.dataset.k === 'ses' ? 'odstranit tenhle trénink' : 'odstranit tuhle aktivitu'}?</b><span class="mut">Nejde to vrátit.</span><div class="two"><button class="btn" data-a="close">Zrušit</button><button class="btn danger" style="background:var(--down);color:#fff" data-a="lp-del2" data-k="${b.dataset.k}" data-id="${b.dataset.id}">Odstranit</button></div></div>`; },
  'lp-del2': b => {
    const id = b.dataset.id;
    if (b.dataset.k === 'ses') { S.sessions = S.sessions.filter(s => s.id !== id); S.activities = S.activities.filter(a => a.sessionId !== id); if (S.active === id) S.active = null; if (view.id === id) view = { n: 'home' }; }
    else S.activities = S.activities.filter(a => a.id !== id);
    save(true); closeSheet(); render(); toast('Odstraněno');
  },
});
