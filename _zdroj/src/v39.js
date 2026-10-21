
// ===================== v2.20: vlastní počítadla „bez …“ s úsporou · nákup na vlastní období · tipy během dne =====================
// ---------- počítadla ----------
const QK = { alk: ['Alkohol', 'Bez alkoholu'], kratom: ['Kratom', 'Bez kratomu'], cig: ['Cigarety', 'Bez cigaret'], sweet: ['Sladkosti', 'Bez sladkostí'], drugs: ['Drogy', 'Bez drog'], other: ['Jiné', ''] };
const QP = {
  alk: ['M10 2.5h4M10.5 2.5v4.2c0 .8-.4 1.5-1 2-1.2.9-2 2.3-2 3.9v7.4c0 .8.7 1.5 1.5 1.5h6c.8 0 1.5-.7 1.5-1.5v-7.4c0-1.6-.8-3-2-3.9-.6-.5-1-1.2-1-2V2.5'],
  kratom: ['M5 19c0-8 5-13 14-14-1 9-6 14-14 14z', 'M5 19l7-7'],
  cig: ['M2.5 14.5h14v4h-14z', 'M13 14.5v4', 'M19 14.5v4', 'M21.5 14.5v4', 'M19 11.5c0-1.4 1.6-1.4 1.6-2.8S19 7.3 19 5.9'],
  sweet: ['M8.5 12a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0', 'M8.7 10.8 4 8.3v7.4l4.7-2.5', 'M15.3 10.8 20 8.3v7.4l-4.7-2.5'],
  drugs: ['M4.9 13.4l8.5-8.5a4 4 0 0 1 5.7 5.7l-8.5 8.5a4 4 0 0 1-5.7-5.7z'],
  other: ['M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16'],
};
const qIco = k => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${(QP[k] || QP.other).map(d => `<path d="${d}"/>`).join('')}<path d="M4 4l16 16"/></svg>`;
Object.keys(QP).forEach(k => { PICTO['q_' + k] = { s: [...QP[k].map(d => [d, 1.8]), ['M4 4l16 16', 1.8]], c: [] }; });
const qTitle = q => q.kind !== 'other' && QK[q.kind] ? QK[q.kind][1] : `Bez: ${q.name}`;
const qAlk = () => Object.assign(SOB(), { id: 'alk', kind: 'alk', name: 'Alkohol' });
const qList = () => [...(SOB().since ? [qAlk()] : []), ...(F().quits || [])];
const qGet = id => id === 'alk' ? qAlk() : (F().quits || []).find(q => q.id === id);
const qDays = q => q && q.since ? Math.max(0, daysBetween(q.since, today())) : null;
const qPerDay = q => q && q.save && q.save.amt ? (q.save.per === 'w' ? q.save.amt / 7 : q.save.amt) : 0;
const kc = v => thou(Math.round(v)) + ' Kč';
function qBadge(q) { if (q.id === 'alk' || BADGES.some(b => b.id === 'q_' + q.id)) return; BADGES.push({ id: 'q_' + q.id, name: qTitle(q), picto: 'q_' + q.kind, unit: ['den', 'dny', 'dní'], tiers: SOB_T, val: () => { const x = qGet(q.id); return x ? Math.max(qDays(x) || 0, x.best || 0) : 0; } }); }
(F().quits || []).forEach(qBadge);

const qSel = () => { const L = qList(); return L.find(q => q.id === S.settings.qSel) || L[0] || null; };
// ikonka v hlavičce podle vybraného počítadla
const _20render = render;
render = function () { _20render(); const b = $('#app .sobb'); if (b) { const q = qSel(); b.innerHTML = qIco(q ? q.kind : 'alk'); b.classList.toggle('on', !!q); } };

A['sob-open'] = () => {
  const L = qList(); if (!L.length) return A['q-edit']({ dataset: {} });
  const q = qSel(); const n = qDays(q); const P = sobPages(q, n); const pd = qPerDay(q);
  if (pd) P.push(`<div class="sobbig"><b>${thou(Math.round(pd * n))}</b><span>Kč ušetřeno</span><small class="sobsm">za rok to dělá ${kc(pd * 365)}</small></div>`);
  const pg = Math.min(P.length - 1, S.settings.sobPg || 0); const nx = SOB_T.find(t => t > n), pv = [...SOB_T].reverse().find(t => t <= n) || 0;
  sheet(`<div class="sobs"><div class="qchips">${L.map(x => `<button class="${x.id === q.id ? 'on' : ''}" data-a="q-sel" data-id="${x.id}">${qIco(x.kind)}<span>${esc(x.kind === 'other' ? x.name : QK[x.kind][0])}</span></button>`).join('')}<button data-a="q-edit" aria-label="Přidat počítadlo">${ico('plus')}<span>Přidat</span></button></div>
    <p class="sobt">${esc(qTitle(q))} už</p>
    <div class="sobcar">${P.map(p => `<div class="sobp">${p}</div>`).join('')}</div>
    <div class="sobdots">${P.map((_, i) => `<i class="${i === pg ? 'on' : ''}"></i>`).join('')}</div>
    <p class="mut" style="margin:14px 2px 0;text-align:center">od ${fdate(q.since)}${pd ? ` · ušetřeno ${kc(pd * n)}` : ''}${q.best > n ? ` · nejdelší série ${q.best} ${nDays(q.best)}` : ''}</p>
    ${nx ? `<div class="fsobbar"><i style="width:${Math.round((n - pv) / (nx - pv) * 100)}%"></i></div><p class="fsobnx">Odznak ${nx} dní – zbývá ${nx - n} ${nDays(nx - n)}</p>` : '<p class="fsobnx">Všechny odznaky máš.</p>'}</div>
    <div class="actions"><button class="btn" data-a="q-edit" data-id="${q.id}">Upravit</button><button class="btn" data-a="q-reset" data-id="${q.id}">${q.kind === 'alk' ? 'Napil jsem se' : 'Začít znovu'}</button></div>`, el => {
    const c = el.querySelector('.sobcar'); const dots = [...el.querySelectorAll('.sobdots i')];
    requestAnimationFrame(() => { c.scrollLeft = pg * c.clientWidth; });
    c.addEventListener('scroll', () => { const i = Math.round(c.scrollLeft / c.clientWidth); dots.forEach((d, j) => d.classList.toggle('on', j === i)); if (S.settings.sobPg !== i) { S.settings.sobPg = i; save(); } }, { passive: true });
  });
};
A['q-sel'] = b => { S.settings.qSel = b.dataset.id; save(); render(); A['sob-open'](); };
A['q-edit'] = b => {
  const id = b.dataset.id; const q = id ? qGet(id) : null; const has = new Set(qList().map(x => x.kind)); const k0 = q ? q.kind : ['alk', 'kratom', 'cig', 'sweet', 'drugs'].find(k => !has.has(k)) || 'other';
  sheet(`<h2>${q ? esc(qTitle(q)) : 'Nové počítadlo'}</h2><div class="form">
    ${q ? '' : `<div><div class="lbl" style="margin:0 2px 8px">Co chceš počítat</div><div class="qkinds">${Object.entries(QK).filter(([k]) => k !== 'alk' || !SOB().since).map(([k, [l]]) => `<button class="${k === k0 ? 'on' : ''}" data-a="q-kind" data-v="${k}">${qIco(k)}<span>${l}</span></button>`).join('')}</div></div>`}
    <label class="f" id="q-namef" ${k0 === 'other' ? '' : 'hidden'}>Název<input id="q-name" value="${esc(q && q.kind === 'other' ? q.name : '')}" placeholder="např. Energeťáky, sociální sítě"></label>
    <label class="f">První den bez<input type="date" id="q-since" max="${today()}" value="${q && q.since ? q.since : today()}"></label>
    <div><div class="lbl" style="margin:4px 2px 8px">Kolik jsi za to průměrně utratil</div><div class="two"><label class="f">Kč<input id="q-amt" inputmode="decimal" value="${q && q.save ? kg(q.save.amt) : ''}" placeholder="150"></label>
      <div class="seg" data-seg="qper" style="align-self:end">${[['d', 'za den'], ['w', 'za týden']].map(([v, l]) => `<button data-a="seg" data-v="${v}" class="${(q && q.save ? q.save.per : 'd') === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <p class="mut" style="font-size:13px;margin:8px 2px 0">Nepovinné. Aplikace pak ukáže, kolik už máš ušetřeno.</p></div></div>
    <div class="actions">${q ? `<button class="btn danger" data-a="q-del" data-id="${q.id}" aria-label="Smazat">${ico('trash')}</button>` : ''}<button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="q-save" data-id="${id || ''}" data-k="${k0}">Uložit</button></div>`);
};
A['q-kind'] = b => { $$('#sheet .qkinds button').forEach(x => x.classList.toggle('on', x === b)); $('#sheet [data-a=q-save]').dataset.k = b.dataset.v; $('#q-namef').hidden = b.dataset.v !== 'other'; };
A['q-save'] = b => {
  const id = b.dataset.id, kind = b.dataset.k; const since = $('#q-since').value; const name = ($('#q-name').value || '').trim();
  if (!since || since > today()) return toast('Vyber den, nejpozději dnešek'); if (kind === 'other' && !name) return toast('Napiš, co počítáš');
  const amt = num($('#q-amt').value); const sv = amt ? { amt, per: $('[data-seg=qper] .on')?.dataset.v || 'd' } : null;
  let q = id ? qGet(id) : null;
  if (!q && kind === 'alk') q = qAlk();
  if (!q) { q = { id: uid(), kind, name: kind === 'other' ? name : QK[kind][0], since, best: 0, hist: [] }; (F().quits = F().quits || []).push(q); qBadge(q); }
  q.since = since; if (q.kind === 'other') q.name = name || q.name; if (sv) q.save = sv; else delete q.save;
  S.settings.qSel = q.id; save(true); closeSheet(); render(); A['sob-open'](); setTimeout(checkBadges, 600);
};
A['q-del'] = b => sheet(`<h2>Smazat počítadlo?</h2><p class="mut" style="margin:6px 0 0">Získané odznaky zůstanou.</p><div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn danger" data-a="q-del2" data-id="${b.dataset.id}">Smazat</button></div>`);
A['q-del2'] = b => { const id = b.dataset.id; if (id === 'alk') { const o = SOB(); o.since = null; delete o.save; } else F().quits = (F().quits || []).filter(q => q.id !== id); S.settings.qSel = null; save(true); closeSheet(); render(); };
A['q-reset'] = b => { const q = qGet(b.dataset.id); const n = qDays(q);
  sheet(`<h2>${q.kind === 'alk' ? 'Napil jsem se' : 'Začít znovu'}</h2><p class="mut" style="margin:6px 0 0">Série ${n} ${nDays(n)} se uloží do historie a počítadlo začne znovu. Získané odznaky zůstanou.</p>
    <div class="form"><label class="f">Kdy<input type="date" id="q-r" max="${today()}" value="${today()}"></label></div>
    <div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="q-reset2" data-id="${q.id}">Začít znovu</button></div>`); };
A['q-reset2'] = b => { const q = qGet(b.dataset.id); const v = $('#q-r').value || today(); const n = Math.max(0, daysBetween(q.since, v));
  q.hist = [...(q.hist || []), { from: q.since, to: v, n }]; q.best = Math.max(q.best || 0, n); q.since = dkey(addDays(pdate(v), 1)); save(true); closeSheet(); render(); toast('Nová série začíná'); };
setTimeout(() => { if ((F().quits || []).length) checkBadges(); }, 2600);

// ---------- nákup na vlastní období ----------
const _20nakup = XV['f-nakup'];
XV['f-nakup'] = function () {
  const segs = `<div class="seg">${[['N1', 'Víkend'], ['N2', 'Středa'], ['R', 'Vlastní'], ['Z', 'Zásoba']].map(([v, l]) => `<button data-a="f-list" data-v="${v}" class="${v === (view.list || 'N1') ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  if (view.list !== 'R') return _20nakup().replace(/<div class="seg">(?:(?!<\/div>)[\s\S])*?data-a="f-list"[\s\S]*?<\/div>/, segs);
  const f = F(); if (!f.start) return XV['f-den']();
  const r = f.rng = f.rng && f.rng.to >= today() ? f.rng : { from: today(), to: nextSun(today()) };
  const key = `R:${r.from}:${r.to}`; const st = f.shop[key] = f.shop[key] || {};
  const { items, days, meals } = rangeItems(r.from, r.to); (f.custom[key] || []).forEach((n, i) => items.push({ id: 'c:' + i, nazev: n, mnozstvi: '', pozn: '', kat: 'Vlastní', own: i }));
  const done = items.filter(i => st[i.id]).length;
  const groups = [...CATS.filter(c => c !== 'Zásoba'), 'Zásoba'].map(cat => { const its = items.filter(i => i.kat === cat).sort((a, b) => (st[a.id] ? 1 : 0) - (st[b.id] ? 1 : 0)); if (!its.length) return '';
    const body = its.map(i => `<button class="fsi ${st[i.id] ? 'on' : ''}" data-a="f-chk" data-key="${key}" data-id="${esc(i.id)}"><span class="cb">${st[i.id] ? ico('check') : ''}</span><span class="t"><b>${esc(i.nazev)}</b>${i.pozn ? `<small>${esc(i.pozn)}</small>` : ''}</span><span class="q">${esc(i.mnozstvi)}</span>${i.own != null ? `<span class="x" data-a="f-cdel" data-key="${key}" data-i="${i.own}" aria-label="Smazat">${ico('x')}</span>` : ''}</button>`).join('');
    return cat === 'Zásoba' ? `<details class="kmore fsg"><summary>Ze zásoby – zkontroluj doma (${its.length})</summary>${body}</details>` : `<div class="fsg"><div class="lbl">${cat}</div>${body}</div>`; }).join('');
  const quick = [['Do neděle', today(), nextSun(today())], ['3 dny', today(), dkey(addDays(new Date(), 2))], ['Týden', today(), dkey(addDays(new Date(), 6))]];
  return `<div class="wrap">${fHdr('Nákup')}${segs}
    <div class="form" style="margin-top:12px"><div class="two"><label class="f">Od<input type="date" id="rg-from" value="${r.from}"></label><label class="f">Do (včetně)<input type="date" id="rg-to" value="${r.to}" min="${r.from}"></label></div></div>
    <div class="chips" style="margin-top:10px">${quick.map(([l, a, b]) => `<button class="chip ${a === r.from && b === r.to ? 'on' : ''}" data-a="rg-q" data-f="${a}" data-t="${b}">${l}</button>`).join('')}</div>
    <div class="fshi" style="margin-top:12px"><div><span>Na období</span><b>${fday(r.from)} – ${fday(r.to)}</b><small>${days} ${nDays(days)} · ${meals} jídel</small></div><div><span>Počítá</span><b>den po dni</b><small>podle jídelníčku vč. záměn a kroku</small></div></div>
    <div class="fsbar"><span>${done} / ${items.length} v košíku</span><button class="btn" data-a="f-reset" data-key="${key}">Nový nákup</button></div>
    ${groups || '<p class="mut">V tomhle období jídelníček nic nemá.</p>'}
    <div class="fadd"><input id="f-own" placeholder="Přidat vlastní položku"><button class="btn white" data-a="f-cadd" data-key="${key}">Přidat</button></div>
    <p class="mut" style="font-size:12px;margin:14px 2px 0">Množství jsou součet porcí jídel v daných dnech (syrové maso, suché přílohy). Když vaříš do zásoby na víc dní dopředu, nakup podle toho, na kolik dní vaříš.</p>
  </div>${tabs()}`;
};
function nextSun(k) { const d = pdate(k); const add = (7 - d.getDay()) % 7; return dkey(addDays(d, add)); }
function rangeItems(from, to) {
  const R = RX(), f = F(), sum = {}; let days = 0, meals = 0; const add = (s, g) => { if (s && g) sum[s] = (sum[s] || 0) + g; };
  for (let k = from, i = 0; k <= to && i < 60; k = dkey(addDays(pdate(k), 1)), i++) {
    const c = cyc(k); if (!c || c.before) continue; const day = planDayF(c.w, c.di, k); if (!day) continue; days++;
    SLOTS.forEach(([s]) => { const r = R[day.jidla[s]]; if (!r) return; meals++; r.suroviny.forEach(x => add(x.surovina, x.g)); });
    (day.upravy || []).forEach(u => add(u.surovina, u.g)); Object.values(stepMods(f.step, day)).flat().forEach(m => add(m.surovina, m.g));
  }
  const items = Object.entries(sum).filter(([, g]) => g > 0).map(([s, g]) => { const x = SUR(s); const gg = Math.ceil(g / 10) * 10;
    const ks = s === 'vejce' ? ` (~${Math.round(g / 55)} ks)` : '';
    return { id: s, nazev: x.nazev, mnozstvi: gg >= 1000 ? `${nf(gg / 1000, 2).replace(/,?0+$/, '')} kg${ks}` : `${gg} g${ks}`, pozn: x.baleni ? `balení ${x.baleni}` : '', kat: CATS.includes(x.kategorie_nakupu) ? x.kategorie_nakupu : 'Lednice' }; })
    .sort((a, b) => a.nazev.localeCompare(b.nazev, 'cs'));
  return { items, days, meals };
}
A['rg-q'] = b => { F().rng = { from: b.dataset.f, to: b.dataset.t }; save(); render(); };
document.addEventListener('change', e => { if (!['rg-from', 'rg-to'].includes(e.target.id)) return; const f = F(); const a = $('#rg-from').value, b = $('#rg-to').value; if (!a || !b) return;
  f.rng = { from: a, to: b < a ? a : b }; save(); render(); });

// ---------- tipy během dne ----------
const TIPS = [
  ['r', 'Na konci sprchy 30–60 s studená voda', 'Probudí tě rychleji než káva – chlad zvedne noradrenalin a náladu na pár hodin. Hned po silovém tréninku ale ledovou koupel vynech, může brzdit růst svalů.'],
  ['r', 'Ven na denní světlo aspoň 10 minut', 'Ranní světlo nastaví vnitřní hodiny: večer pak dřív přijde únava a líp usneš. Venku je i v zataženém dni mnohem víc světla než u okna.'],
  ['r', 'Skin care + krém s SPF', 'UV záření je hlavní příčina stárnutí pleti. SPF 30+ na obličej i v zimě, když jdeš ven.'],
  ['r', 'Sklenici vody hned po probuzení', 'Přes noc ztratíš vodu dýcháním. I mírná dehydratace snižuje soustředění a výkon v tréninku.'],
  ['r', 'Vážit se ráno po toaletě, před jídlem', 'Jindy váha skáče o 1–2 kg kvůli vodě a jídlu. Ranní vážení dává čistá data pro hodnocení jídelníčku.'],
  ['r', 'Snídaně s 30+ g bílkovin', 'Drží sytost do oběda a pomáhá rozložit bílkoviny rovnoměrně přes den – to svaly využijí líp než jednu velkou dávku.'],
  ['d', 'Po jídle 10 minut chůze', 'Krátká procházka po jídle prokazatelně sníží výkyv cukru v krvi. Navíc kroky, které se počítají do denního výdeje.'],
  ['d', 'Kofein naposledy kolem 14:00', 'Kofein má poločas 5–6 hodin. Káva ve 4 odpoledne ti v 10 večer pořád zkracuje hluboký spánek.'],
  ['d', 'Každou hodinu se 2–3 minuty projdi', 'Dlouhé nepřerušené sezení zhoršuje cukr v krvi i záda. Stačí se zvednout a projít.'],
  ['d', 'Doplň vodu', 'Orientačně 35 ml na kilo váhy, v tréninkové dny víc. Tmavá moč = piješ málo.'],
  ['v', 'Dnes spát o 30 minut dřív', 'Spánek je hlavní čas regenerace svalů. Málo spánku zvedá hlad a chuť na sladké – jídelníček se pak drží hůř.'],
  ['v', 'Hodinu před spaním tlumené světlo a míň obrazovek', 'Jasné světlo večer oddaluje melatonin a usínáš později.'],
  ['v', 'V ložnici kolem 18 °C', 'Tělo potřebuje k usnutí snížit teplotu. V chladnější místnosti je spánek hlubší.'],
  ['v', 'Poslední jídlo 2–3 hodiny před spaním', 'Velké jídlo těsně před spaním zvedá tep a zhoršuje spánek – na WHOOPu to uvidíš na HRV.'],
  ['v', 'Stejný čas spánku i o víkendu', 'Pravidelnost spánku ovlivňuje regeneraci skoro stejně jako délka. Posun o 2 hodiny o víkendu je jako malý jet lag.'],
];
function tipNow() {
  const h = new Date().getHours(); const per = h >= 5 && h < 11 ? 'r' : h >= 11 && h < 17 ? 'd' : h >= 17 && h < 23 ? 'v' : null; if (!per) return null;
  const ctx = []; if (whoopOn()) { const d = wDay(today()) || {};
    if (per !== 'v' && d.rec != null && d.rec < 34) ctx.push(['x', `Recovery ${d.rec} % – dnes klidně lehčí trénink`, 'Nízká HRV a vyšší klidový tep ukazují, že se tělo ještě zotavuje. Tvrdý trénink teď přinese víc únavy než výsledku.']);
    if (per !== 'v' && d.sleepH != null && d.sleepH < 6.5) ctx.push(['x', 'Spal jsi méně než 6,5 h', 'Dnes může být větší hlad – drž se plánu jídel a večer zkus jít spát dřív.']); }
  const seen = (S.settings.tipSeen = S.settings.tipSeen || {}); const day = today(); if (seen.d !== day) { seen.d = day; seen.ids = []; }
  const pool = [...ctx, ...TIPS.filter(t => t[0] === per)].filter(t => !seen.ids.includes(t[1])); if (!pool.length) return null;
  const t = ctx.length && !seen.ids.includes(ctx[0][1]) ? ctx[0] : pool[(new Date().getDate() + seen.ids.length) % pool.length]; return t;
}
function showTip() {
  if (S.settings.tipsOff || document.querySelector('.tip') || !['home', 'f-den', 'whoop'].includes(view.n) || !$('#sheet').hidden) return;
  if (Date.now() - (S.settings.tipLast || 0) < 3 * 36e5) return;
  const t = tipNow(); if (!t) return; S.settings.tipLast = Date.now(); S.settings.tipSeen.ids.push(t[1]); save();
  const el = document.createElement('div'); el.className = 'tip'; el.setAttribute('role', 'status');
  el.innerHTML = `<button class="tipb"><small>Tip</small><b>${esc(t[1])}</b><span class="tipw">${esc(t[2])}</span></button><button class="tipx" aria-label="Zavřít">${ico('x')}</button>`;
  document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
  let tm = setTimeout(hide, 9000); function hide() { el.classList.remove('on'); setTimeout(() => el.remove(), 400); }
  el.querySelector('.tipb').addEventListener('click', () => { el.classList.add('open'); clearTimeout(tm); tm = setTimeout(hide, 16000); });
  el.querySelector('.tipx').addEventListener('click', () => { clearTimeout(tm); hide(); });
}
setTimeout(showTip, 4000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(showTip, 3000); });
const _20vSettings = vSettings;
vSettings = function () { const h = _20vSettings(); const sw = `<button class="sw ${S.settings.tipsOff ? '' : 'on'}" data-a="tips-tog" style="margin-top:12px"><span>Tipy během dne<small>Občas se z boku ukáže krátký tip – ráno, přes den, večer</small></span><span class="k"></span></button>`;
  return h.replace(/(<\/div>)(<nav class="tabs)/, sw + '$1$2'); };
A['tips-tog'] = () => { S.settings.tipsOff = !S.settings.tipsOff; save(true); render(); };
