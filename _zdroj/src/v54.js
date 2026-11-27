// ===================== v2.40: recepty (povinné → dochucení, odškrtávání, příprava na víc dní), plán příjmu od 7. 12., trénink: doporučená váha, sestava, spodek =====================

// ---------- JÍDLO: co do jídla patří vs. jen dochucení ----------
// dochucení = chuť bez výživového podílu (šťávy, omáčky, ocet, koření) nebo malé množství bez energie/bílkovin
const FLAV_RX = /^(citron|limetka|sojova|rybi_omacka|horcice|ryzovy_ocet|ocet|koreni|sul|pepr|chilli|sriracha|kecup|worcester|vanilk|skorice|bylinky|petrzel|koriandr|bazalka|kopr|pazitka)/;
ingGroup = function (i) {
  const x = JD.suroviny[i.surovina] || {}; const kat = x.kategorie_nakupu || ''; const n = x.na_100g || {}; const g = i.g || 0;
  if (kat === 'Maso a ryby' || MEAT_RX.test(i.surovina)) return 0;
  if (i.surovina === 'vejce') return 1;
  if (i.skupina === 'ovoce') return 2;
  if (isVolna(i) || (kat === 'Ovoce a zelenina' && !/^(avokado|citron|limetka)/.test(i.surovina)) || (kat === 'Mražené' && (n.bilkoviny_g || 0) < 8)) return 4;
  if (FLAV_RX.test(i.surovina)) return 3;
  const kcal = (n.kcal || 0) * g / 100, b = (n.bilkoviny_g || 0) * g / 100;
  if (kcal < 25 && b < 2) return 3; // málo energie i bílkovin → jen chuť
  return 2; // oleje, ořechy, med, sýr… = tuky / sacharidy / bílkoviny, patří k jídlu
};
// pořadí: maso → vejce → ostatní → zelenina (sbalená) | mezera | Na dochucení
const _54ingRows = ingRows;
ingRows = function (r) {
  const h = _54ingRows(r); const i = h.indexOf('<p class="flbl2">Na dochucení</p>'); if (i < 0) return h;
  const j = h.indexOf('<button class="fvgh"'); if (j < 0 || j < i) return h.replace('<p class="flbl2">Na dochucení</p>', '<p class="flbl2 fdoch">Na dochucení · nepovinné</p>');
  return h.slice(0, i) + h.slice(j) + h.slice(i, j).replace('<p class="flbl2">Na dochucení</p>', '<p class="flbl2 fdoch">Na dochucení · nepovinné</p>');
};

// ---------- recept: odškrtávání surovin ----------
let fmCtx = null;
const ckKey = () => fmCtx ? `${fmCtx.k}|${fmCtx.s}|${fmCtx.id}` : null;
function ckStore() { const f = F(); f.ingCk = f.ingCk || {}; const lim = dkey(addDays(new Date(), -7)); Object.keys(f.ingCk).forEach(k => { if (k.slice(0, 10) < lim) delete f.ingCk[k]; }); return f.ingCk; }
function ckPaint() {
  const key = ckKey(); if (!key) return; const on = new Set(ckStore()[key] || []);
  $$('#sheet .fing > div[data-i]').forEach(d => { d.classList.add('cki'); d.classList.toggle('on', on.has(d.dataset.i)); });
  const all = $$('#sheet .fing > div[data-i]:not(.fvg)'); const done = all.filter(d => d.classList.contains('on')).length;
  const lb = $('#sheet .fcklb'); if (lb) lb.textContent = done ? `${done}/${all.length} odškrtnuto` : 'klepnutím odškrtneš';
}
document.addEventListener('click', ev => {
  const d = ev.target.closest('#sheet .fing > div[data-i]'); if (!d || ev.target.closest('button')) return; const key = ckKey(); if (!key) return;
  const st = ckStore(); const L = new Set(st[key] || []); L.has(d.dataset.i) ? L.delete(d.dataset.i) : L.add(d.dataset.i); st[key] = [...L]; save(); ckPaint();
});

// ---------- recept: kdy je jídlo znovu + uvařit na víc porcí ----------
function nextSame(kod, k, days) {
  const out = [];
  for (let d = 1; d <= days; d++) {
    const dk = dkey(addDays(pdate(k), d)); const c = cyc(dk); if (!c || c.before) continue;
    const day = planDayF(c.w, c.di, dk); SLOTS.forEach(([s, l]) => { if (day.jidla && day.jidla[s] === kod) out.push({ dk, s, l, box: (day.z_varky || []).includes(s) }); });
  }
  return out;
}
function prepHTML(r, k, s, n) {
  const c = cyc(k); const day = c && !c.before ? planDayF(c.w, c.di, k) : null; const mods = day ? stepMods(F().step, day)[s] || [] : [];
  const tot = {}; const order = [];
  ingSorted(r).forEach(({ i, g }) => { if (!(i.surovina in tot)) order.push([i.surovina, i.nazev, g]); tot[i.surovina] = (tot[i.surovina] || 0) + (i.g || 0); });
  mods.forEach(m => { if (!(m.surovina in tot)) order.push([m.surovina, SUR(m.surovina).nazev, 2]); tot[m.surovina] = (tot[m.surovina] || 0) + m.g; });
  const rows = order.filter(([id]) => tot[id] > 0).map(([id, nm, g]) => `<div class="${g === 3 ? 'dim' : ''}"><span>${esc(nm)}</span><b>${id === 'vejce' ? Math.round(tot[id] * n / 55) + ' ks' : Math.round(tot[id] * n) + ' g'}</b></div>`).join('');
  const zv = volnaG(r); return `<div class="fprep-l">${rows}${zv ? `<div><span>Zelenina jakákoli</span><b>~${Math.round(zv * n / 50) * 50} g</b></div>` : ''}</div>`;
}
function prepBlock(r, k, s) {
  const nx = nextSame(r.kod, k, 10); const n = fmCtx.n;
  const when = nx.length ? nx.map(x => `<span class="chip">${fday(x.dk)} · ${x.l.toLowerCase()}${x.box ? ' · z krabičky' : ''}</span>`).join('') : '<span class="mut" style="font-size:14px">V příštích 10 dnech už není.</span>';
  return `<div class="fprep" id="fprep"><div class="lbl" style="margin:18px 2px 8px">Znovu ho máš</div><div class="chips">${when}</div>
    <div class="fprep-h"><div><b>Uvařit rovnou na víc</b><small>${n === 1 ? 'jen dnešní porce' : `dnes + ${n - 1}× dopředu, do krabiček`}</small></div>
      <div class="fstp"><button class="round" data-a="fm-n" data-v="-1" ${n <= 1 ? 'disabled' : ''} aria-label="Méně porcí">${ico('minus')}</button><b>${n}</b><button class="round" data-a="fm-n" data-v="1" ${n >= 6 ? 'disabled' : ''} aria-label="Víc porcí">${ico('plus')}</button></div></div>
    ${n > 1 ? `<div class="lbl" style="margin:12px 2px 6px">Na ${n} ${n < 5 ? 'porce' : 'porcí'} · podle dnešního kroku</div>${prepHTML(r, k, s, n)}<p class="mut" style="font-size:12px;margin:8px 2px 0">Jak dlouho vydrží, máš níž ve Skladování. Co budeš jíst za víc než 3 dny, dej do mrazáku.</p>` : ''}</div>`;
}
A['fm-n'] = b => { if (!fmCtx) return; fmCtx.n = Math.max(1, Math.min(6, fmCtx.n + +b.dataset.v)); const r = RX()[fmCtx.id]; const el = $('#fprep'); if (el && r) el.outerHTML = prepBlock(r, fmCtx.k, fmCtx.s); };
const _54fmeal = A['f-meal'];
A['f-meal'] = function (b) {
  _54fmeal.apply(this, arguments); const r = RX()[b.dataset.id]; if (!r) return;
  const k = b.dataset.k || today(), s = b.dataset.s; fmCtx = { k, s, id: r.kod, n: 1 };
  const lb = $$('#sheet .lbl').find(x => x.textContent.trim() === 'Suroviny'); if (lb) lb.insertAdjacentHTML('beforeend', '<span class="fcklb"></span>');
  const ing = $('#sheet .fing'); if (ing && s) ing.insertAdjacentHTML('afterend', prepBlock(r, k, s));
  ckPaint();
};

// ---------- JÍDLO: od pondělí 7. 12. 2026 krok 0 (verze 3 400) a od něj kalibrace ----------
const CAL2 = '2026-12-07';
(function () {
  const f = F(); if (!f.calStart) { f.calStart = CAL2; save(true); }
  if (today() >= CAL2 && !S.settings.krok0_0712) {
    if (f.step !== 0) setStep(0, 'plán: od 7. 12. finální verze 3 400');
    const P = phase(); P.from = CAL2; S.settings.krok0_0712 = 1; save(true);
  }
})();
// kalibrace (4 týdny, porovnání týdnů 2 a 4) se počítá od 7. 12., ne od začátku cyklu jídel
const _54cal = calibState;
calibState = function () { const f = F(); const st = f.start; if (f.calStart && st) f.start = f.calStart; try { return _54cal.apply(this, arguments); } finally { f.start = st; } };
const _54fplan = XV['f-plan'];
XV['f-plan'] = function () {
  const h = _54fplan(); const f = F(); if (today() >= (f.calStart || CAL2)) return h;
  const note = `<div class="fnote54"><b>Od pondělí ${fday(f.calStart || CAL2).replace(/^\S+ /, '')}: krok 0 · verze 3 400</b><span>Přepne se samo. Od toho dne běží 4 týdny kalibrace (první týden se nehodnotí). Do té doby si krok měníš ručně jako teď.</span></div>`;
  const h2 = h.replace(/(Kalibrace)\s*[–-]\s*týden\s*[-−–]?\d+\s*ze\s*\d+/i, `$1 od ${fday(f.calStart || CAL2).replace(/^\S+ /, '')}`); const i = h2.indexOf('</header>'); return i < 0 ? h2 : h2.slice(0, i + 9) + note + h2.slice(i + 9);
};

// ---------- TRÉNINK: text „horní hranice“ při pravidle Při dosažení ----------
const _54nl = nextLines;
nextLines = function () {
  const r = _54nl.apply(this, arguments); if (S.settings.rule !== 'reach') return r;
  const fx = x => typeof x === 'string' ? x.replace(/nad rozsahem/g, 'horní hranice') : x;
  return Array.isArray(r) ? r.map(x => Array.isArray(x) ? x.map(fx) : fx(x)) : fx(r);
};
// pravidlo přidávání přímo v Tréninkových plánech
const _54tpls = vTpls;
vTpls = function () {
  const h = _54tpls(); const re = S.settings.rule === 'reach';
  const box = `<section class="plrule"><div class="lbl" style="margin:0 2px 8px">Kdy přidat váhu</div>
    <div class="seg">${[['reach', 'Při dosažení'], ['exceed', 'Po překonání']].map(([v, l]) => `<button data-a="rule" data-v="${v}" class="${S.settings.rule === v ? 'on' : ''}">${l}</button>`).join('')}</div>
    <p class="mut" style="font-size:13px;margin:8px 2px 0">Rozsah 6–8: ${re ? 'uděláš 8 → příště víc váhy.' : 'až 9 → příště víc váhy, 8 = stejná váha.'}</p></section>`;
  const i = h.indexOf('<section class="plt">'); return i < 0 ? h : h.slice(0, i) + box + h.slice(i);
};

// ---------- TRÉNINK: změněná sestava → nabídka uložit i po dokončení ----------
const _54vFin = vFin;
vFin = function () {
  let h = _54vFin(); const s = sesById(view.id); const tp = s && tplDiff(s); if (!tp) return h;
  const box = `<div class="tplsave"><span>Dnes jsi měl jinou sestavu než uložený <b>${esc(tp.name)}</b>.</span><button class="btn sm white" data-a="w-tplsave">Uložit pro příště</button></div>`;
  const i = h.lastIndexOf('<div class="actions'); return i < 0 ? h + box : h.slice(0, i) + box + h.slice(i);
};
// dnešní Lower 1 (27. 11.) – upravená sestava platí i příště
(function () {
  if (S.settings.migL1s) return; const t = S.templates.find(x => x.name === 'Lower 1');
  const s = t && S.sessions.filter(x => x.tid === t.id && x.date === '2026-11-27').sort((a, b) => b.start - a.start)[0];
  if (s && s.entries.length) { t.ex = s.entries.map(e => e.exId); t.n = {}; s.entries.forEach(e => { const ex = exE(e); if (ex) t.n[e.exId] = ex.sets.length; }); }
  S.settings.migL1s = 1; save(true);
})();

// ---------- iPhone: poslední cvik nesmí zajet pod spodní lištu ----------
const _54fb = fixBottom;
fixBottom = function () { _54fb.apply(this, arguments); const f = (window.__vb && window.__vb.fix) || 0; document.documentElement.style.setProperty('--fixpx', (S.settings.vbStretch && f > 20 ? f : 0) + 'px'); };
fixBottom();
addEventListener('resize', () => setTimeout(() => { const f = (window.__vb && window.__vb.fix) || 0; document.documentElement.style.setProperty('--fixpx', (S.settings.vbStretch && f > 20 ? f : 0) + 'px'); }, 50));

// ---------- v2.40.1: proč je surovina v jídelníčku (ⓘ u každé suroviny) ----------
const WHY = [
  [/^hov_/, 'Bílkovina pro svaly. Hemové železo, které tělo vstřebá nejlíp, zinek a vitamin B12. Přirozeně i kreatin.'],
  [/^(krut|kur)_/, 'Libová bílkovina s málem tuku. Vitaminy B3 a B6 (energie z jídla) a selen.'],
  [/^losos/, 'Bílkovina a omega-3 mastné kyseliny (EPA, DHA) pro srdce, klouby a regeneraci. Vitamin D a selen.'],
  [/^sardinky/, 'Omega-3 (EPA, DHA), vápník z jemných kostí, vitamin D a B12.'],
  [/^tunak/, 'Skoro čistá bílkovina. Selen a vitamin B12.'],
  [/^krevety/, 'Libová bílkovina, jód, selen a vitamin B12.'],
  [/^vejce$/, 'Kompletní bílkovina se všemi esenciálními aminokyselinami. Cholin, B12, vitamin D a lutein ze žloutku.'],
  [/^whey/, 'Rychlá a kvalitní bílkovina s hodně leucinem, který spouští stavbu svalů.'],
  [/^(recky_jogurt|cottage)/, 'Bílkovina (hlavně kasein, sytí dlouho) a vápník.'],
  [/^(jogurt_bily|kefir)/, 'Živé kultury pro střeva, vápník a bílkovina.'],
  [/^mleko/, 'Vápník, bílkovina a vitamin B2.'],
  [/^(feta|parmazan)/, 'Bílkovina a vápník v malém množství a hodně chuti.'],
  [/^smetana/, 'Tuk, tedy energie, a krémovost omáčky.'],
  [/^maslo/, 'Tuk (energie) a vitamin A.'],
  [/^(basmati|arborio|sushi_ryze|ryzova_kase|ryzove_nudle|testoviny$|gnocchi)/, 'Sacharidy = palivo na trénink a doplnění glykogenu. Lehké na trávení.'],
  [/^(testoviny_cz|tortilla_cz|mouka_spaldova|chleb_zitny|bulgur)/, 'Sacharidy na trénink a k tomu vláknina, hořčík a vitaminy B z celého zrna.'],
  [/^(cizrna|fazole_cerne)/, 'Vláknina, rostlinná bílkovina, hořčík, folát a železo.'],
  [/^edamame/, 'Rostlinná bílkovina, vláknina, folát a vitamin K.'],
  [/^hrasek/, 'Vláknina, rostlinná bílkovina a vitamin C.'],
  [/^kukurice/, 'Sacharidy a vláknina.'],
  [/^banan/, 'Rychlé sacharidy (ideál kolem tréninku) a draslík.'],
  [/^boruvky/, 'Antioxidanty (antokyany), vitamin C a vláknina.'],
  [/^jablko/, 'Vláknina (pektin) a sytost.'],
  [/^kiwi/, 'Hodně vitaminu C, vláknina a pomoc trávení.'],
  [/^pomeranc/, 'Vitamin C a folát.'],
  [/^datle/, 'Rychlé sacharidy a draslík.'],
  [/^avokado/, 'Nenasycené tuky, draslík a vláknina.'],
  [/^olej_olivovy/, 'Zdravé mononenasycené tuky, vitamin E a polyfenoly. Pomáhá vstřebat vitaminy A, D, E, K ze zeleniny.'],
  [/^olej_sezamovy/, 'Tuk (energie) a typická chuť.'],
  [/^vlasske/, 'Rostlinná omega-3 (ALA), hořčík a zdravé tuky.'],
  [/^mandle/, 'Vitamin E, hořčík a zdravé tuky.'],
  [/^dynova/, 'Hořčík, zinek, železo a zdravé tuky.'],
  [/^sezam/, 'Vápník a zdravé tuky.'],
  [/^kakao/, 'Hořčík, železo a polyfenoly, bez cukru.'],
  [/^(med|cukr)$/, 'Rychlé sacharidy a chuť.'],
  [/^brokolice/, 'Vitamin C a K, folát a vláknina.'],
  [/^spenat/, 'Folát, vitamin K, hořčík a železo.'],
  [/^paprika/, 'Velmi hodně vitaminu C a vitamin A.'],
  [/^(rajcata|passata)/, 'Lykopen (antioxidant, z vařených rajčat se vstřebá líp), vitamin C a draslík.'],
  [/^mrkev/, 'Beta-karoten (vitamin A) pro oči a kůži.'],
  [/^cuketa/, 'Velký objem jídla za málo kalorií, vláknina a draslík.'],
  [/^(cibule|cesnek)/, 'Prebiotická vláknina pro střevní bakterie a chuť.'],
  [/^zazvor/, 'Chuť a podpora trávení.'],
  [/^(celer|petrzel)/, 'Vláknina, draslík a chuť vývaru.'],
  [/^(okurka|salat)/, 'Objem, voda a vitamin K skoro bez kalorií.'],
  [/^klicky/, 'Vitamin C, folát a vláknina.'],
  [/^zampiony/, 'Vitaminy B, selen a vláknina.'],
  [/^kysane_zeli/, 'Vitamin C a vláknina. Domácí nepasterované má i živé kultury pro střeva.'],
  [/^nori/, 'Jód pro štítnou žlázu.'],
  [/^vyvar_hovezi/, 'Tekutiny, minerály a chuť.'],
  [/^vyvar/, 'Tekutina a základ polévky.'],
  [/^(citron|limetka)/, 'Chuť a vitamin C, který pomáhá vstřebat železo z rostlin.'],
  [/^(sojova|rybi_omacka|horcice|ryzovy_ocet)/, 'Jen chuť (hlavně sůl). Výživově to nehraje roli.'],
  [/^zelenina_volna/, 'Vláknina, vitaminy a minerály a objem jídla.'],
];
function whyTxt(i) {
  const w = WHY.find(([rx]) => rx.test(i.surovina)); const n = nutOf(i.surovina, i.g || 0);
  const m = [n.bilkoviny_g >= 1 ? `B ${Math.round(n.bilkoviny_g)} g` : '', n.sacharidy_g >= 1 ? `S ${Math.round(n.sacharidy_g)} g` : '', n.tuky_g >= 1 ? `T ${Math.round(n.tuky_g)} g` : '', n.vlaknina_g >= 1 ? `Vl ${Math.round(n.vlaknina_g)} g` : ''].filter(Boolean).join(' · ');
  return `${w ? esc(w[1]) : 'Doplňuje energii a chuť jídla.'}${i.g ? `<small>V téhle porci (${i.g} g): ${Math.round(n.kcal || 0)} kcal${m ? ' · ' + m : ''}</small>` : ''}`;
}
A['f-why'] = b => { const el = document.getElementById('fw-' + b.dataset.v); if (!el) return; el.hidden = !el.hidden; b.classList.toggle('on', !el.hidden); };
const _541fm = A['f-meal'];
A['f-meal'] = function (b) {
  _541fm.apply(this, arguments); const r = RX()[b.dataset.id]; if (!r) return;
  $$('#sheet .fing > div[data-i]').forEach(d => {
    const i = r.suroviny[+d.dataset.i]; if (!i) return; const sp = d.querySelector('span'); if (!sp) return;
    // stejné řádky „krok −7 (příloha)“ za sebou jen jednou
    const seen = new Set(); [...sp.querySelectorAll('small')].forEach(x => { const t = x.textContent.trim(); if (seen.has(t)) x.remove(); else seen.add(t); });
    const tn = [...sp.childNodes].find(x => x.nodeType === 3 && x.textContent.trim());
    const btn = `<button class="finf" data-a="f-why" data-v="${d.dataset.i}" aria-label="Proč je to v jídelníčku">i</button>`;
    if (tn) tn.after(document.createRange().createContextualFragment(btn)); else sp.insertAdjacentHTML('afterbegin', btn);
    d.insertAdjacentHTML('afterend', `<section class="fexp fwhy" id="fw-${d.dataset.i}" hidden>${whyTxt(i)}</section>`);
  });
};

// v2.40.2: Statistiky a Gym přímo z úvodu (karta tréninku vede do tréninku/shrnutí, takže na Gym se jinak nedostaneš)
const _542home = vHome;
vHome = function () {
  const h = _542home(); const i = h.indexOf('<button class="mvhome none" data-a="tab" data-v="tpls"'); if (i < 0) return h;
  const row = `<div class="hqk"><button data-a="tab" data-v="prog">${ico('chart') || ''}<b>Statistiky</b><small>grafy, partie, progres</small></button><button data-a="tab" data-v="gym">${ico('dumbbell')}<b>Gym</b><small>odznaky, knihovna</small></button></div>`;
  return h.slice(0, i) + row + h.slice(i);
};
