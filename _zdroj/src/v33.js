
// ===================== v2.13: JÍDLO – jídelníček, nákup, suplementy, vývoj =====================
Object.assign(IC, {
  fork: '<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10"/><path d="M17 21V3c-2.2 1.2-3.5 3.6-3.5 7v3H17"/>',
  cart: '<path d="M3 4h2.2l2.3 10.2a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.4-1.1L20.5 8H6.2"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
  pill: '<rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="m9.2 7.9 5.6 8.2"/>',
  scale: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8.5 9a5 5 0 0 1 7 0l-2.2 2.6"/>',
  week: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M9 10v10M15 10v10"/>',
});

// ---------- data jídelníčku (výchozí v aplikaci, import přepíše jen tuhle část) ----------
const JD_KEY = 'kodadboost.jd';
let JD = (() => { try { const s = localStorage.getItem(JD_KEY); if (s) { const j = JSON.parse(s); if (j && j.cyklus && j.recepty) return j; } } catch (e) { } return JD_DEFAULT; })();
const RX = () => Object.fromEntries(JD.recepty.map(r => [r.kod, r]));
const SUR = k => JD.suroviny[k] || { nazev: k, na_100g: {} };
const F = () => (S.food = S.food || { start: null, step: JD.meta.vychozi_krok || 0, stepLog: [], tdays: null, shop: {}, custom: {}, sup: [], supWarn: 7, weeks: {}, checks: {}, reviewAt: null, dismiss: {} });
const SLOTS = [['snidane', 'Snídaně', '7:30'], ['obed', 'Oběd', '11:30'], ['svacina', 'Svačina', '15:00'], ['vecere', 'Večeře', '19:00']];
const DNY = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const dIdx = k => (pdate(k).getDay() + 6) % 7;
const NUT = [['kcal', 'kcal', ''], ['bilkoviny_g', 'B', ' g'], ['sacharidy_g', 'S', ' g'], ['tuky_g', 'T', ' g'], ['vlaknina_g', 'Vl', ' g']];
const nutOf = (sur, g) => { const n = SUR(sur).na_100g || {}; const o = {}; NUT.forEach(([k]) => o[k] = (n[k] || 0) * g / 100); return o; };
const addN = (a, b, f = 1) => { NUT.forEach(([k]) => a[k] = (a[k] || 0) + (b[k] || 0) * f); return a; };
const r0 = v => Math.round(v);
const r1 = v => Math.round(v * 10) / 10;

// který týden cyklu a den
function cyc(k) {
  const f = F(); if (!f.start) return null; const d = Math.floor((toU(k) - toU(f.start)) / DMS); if (d < 0) return { before: true, days: -d };
  const wi = Math.floor(d / 7), order = JD.meta.poradi_cyklu || ['A', 'B', 'C'];
  return { wi, w: order[wi % order.length], di: d % 7, mon: dkey(addDays(pdate(f.start), wi * 7)) };
}
// tréninkové dny: vlastní volba → plán z gymu → výchozí z dat
function tDays() {
  const f = F(); if (f.tdays) return f.tdays;
  const p = typeof prog === 'function' && prog(); if (p) return Object.keys(p.days).map(d => DNY[(+d + 6) % 7]);
  return JD.meta.treninkove_dny_vychozi || ['Po', 'Út', 'Čt', 'So'];
}
// den podle cyklu, se svačinami prohozenými podle tvých tréninkových dnů
function planDayF(w, di) {
  const W = JD.cyklus[w]; if (!W) return null; const base = W.dny[di]; const td = tDays();
  const dataT = W.dny.map(d => d.trenink), myT = DNY.map(d => td.includes(d));
  const day = JSON.parse(JSON.stringify(base)); day.trenink = myT[di];
  if (dataT.some((t, i) => t !== myT[i])) {
    const pre = W.dny.filter(d => d.trenink).map(d => d.jidla.svacina), rest = W.dny.filter(d => !d.trenink).map(d => d.jidla.svacina);
    const nT = myT.slice(0, di).filter(Boolean).length, nR = myT.slice(0, di).filter(x => !x).length;
    const src = myT[di] ? (pre.length ? pre : rest) : (rest.length ? rest : pre); const idx = myT[di] ? nT : nR;
    const ns = src[idx % src.length]; if (ns && ns !== day.jidla.svacina) { const R = RX(); const old = R[day.jidla.svacina], nw = R[ns]; if (old && nw) addN(day.soucet_dne, nw.hodnoty_porce), addN(day.soucet_dne, old.hodnoty_porce, -1); day.jidla.svacina = ns; day.swapped = true; }
  }
  return day;
}
// moduly podle kroku: vrací {slot: [{surovina,g,typ}]}
function stepMods(step, day) {
  const U = JD.urovne_prijmu, R = RX(), out = { snidane: [], obed: [], svacina: [], vecere: [] };
  const list = step > 0 ? U.poradi_nahoru.slice(0, step) : step < 0 ? U.poradi_dolu.slice(0, -step) : [];
  list.forEach(m => {
    const rec = R[day.jidla[m.slot]]; if (!rec) return; const sign = step < 0 ? -1 : 1;
    if (m.typ === 'priloha' && rec.modul_prilohy) out[m.slot].push({ surovina: rec.modul_prilohy.surovina, g: sign * rec.modul_prilohy.g, typ: 'příloha' });
    if (m.typ === 'tuk') { const t = m.slot === 'snidane' ? U.modul_tuku.snidane : U.modul_tuku.obed_vecere; if (t) out[m.slot].push({ surovina: t.surovina, g: sign * t.g, typ: 'tuk' }); }
  });
  return out;
}
function dayTotals(day, step) { const t = { ...day.soucet_dne }; const M = stepMods(step, day); Object.values(M).flat().forEach(m => addN(t, nutOf(m.surovina, m.g))); return t; }
const nutLine = (n, short) => NUT.map(([k, l, u]) => k === 'kcal' ? `<b>${thou(r0(n.kcal))} kcal</b>` : `${l} ${r0(n[k])}${short ? '' : u}`).join(' · ');

// ---------- navigace sekce Jídlo ----------
const FOOD_TABS = [['f-den', 'Dnes', 'fork'], ['f-tyden', 'Týden', 'week'], ['f-nakup', 'Nákup', 'cart'], ['f-sup', 'Suplementy', 'pill'], ['f-vyvoj', 'Vývoj', 'scale']];
const _13tabs = tabs;
tabs = () => view.n && view.n.startsWith('f-') ? `<nav class="tabs ftabs">${FOOD_TABS.map(([n, l, i]) => `<button data-a="tab" data-v="${n}" class="${view.n === n || (n === 'f-den' && view.n === 'f-set') ? 'on' : ''}">${ico(i)}${l}</button>`).join('')}</nav>` : _13tabs();
const fHdr = (title, right) => hdr(`<button class="round" data-a="tab" data-v="home" aria-label="Zpět na trénink">${ico('back')}</button>`, `<h1>${title}</h1>`, right || `<button class="round" data-a="tab" data-v="f-set" aria-label="Nastavení jídelníčku">${ico('gear')}</button>`);

// ---------- DNES ----------
XV['f-den'] = function () {
  const f = F(); const k = view.d || today(); const c = cyc(k);
  if (!f.start) return `<div class="wrap">${fHdr('Jídlo')}<div class="empty" style="margin-top:8px"><b>Nastav start jídelníčku</b><span>Zadej pondělí, kdy začíná týden A. Aplikace pak sama ví, který je týden cyklu (A → B → C) a co je dnes k jídlu.</span>
    <label class="f" style="width:100%;margin-top:10px">Pondělí týdne A<input type="date" id="fs-start" value="${dkey(monday(new Date()))}"></label><button class="btn white" data-a="f-start">Začít</button></div></div>${tabs()}`;
  const nav = `<div class="fdnav"><button class="round" data-a="f-day" data-v="-1" aria-label="Předchozí den">${ico('back')}</button><div><b>${k === today() ? 'Dnes' : flong(k)}</b><small>${c && !c.before ? `Týden ${c.w} · ${DNY[c.di]} · ${planDayF(c.w, c.di, k).trenink ? 'trénink' : 'volno'} · krok ${sg(f.step, 0).replace('–', '0')}` : 'před startem jídelníčku'}</small></div><button class="round" data-a="f-day" data-v="1" aria-label="Další den">${ico('chev')}</button></div>`;
  if (!c || c.before) return `<div class="wrap">${fHdr('Jídlo')}${nav}<p class="mut">Jídelníček začíná ${fday(f.start)}.</p></div>${tabs()}`;
  const day = planDayF(c.w, c.di, k), R = RX(), M = stepMods(f.step, day), tot = dayTotals(day, f.step);
  const meals = SLOTS.map(([s, l, t]) => { const r = R[day.jidla[s]]; if (!r) return ''; const box = (day.z_varky || []).includes(s); const mods = M[s];
    const kc = r.hodnoty_porce.kcal + mods.reduce((a, m) => a + nutOf(m.surovina, m.g).kcal, 0);
    return `<button class="fmeal" data-a="f-meal" data-id="${r.kod}" data-s="${s}" data-k="${k}"><span class="fmt"><i>${l}</i><small>${t}</small></span><span class="fmn"><b>${esc(r.nazev)}</b><small>${box ? '<em class="tag">z krabičky</em>' : ''}${s === 'svacina' && day.trenink ? '<em class="tag o">před tréninkem</em>' : ''}${mods.length ? `<em class="tag o">${mods.map(m => `${m.g > 0 ? '+' : ''}${m.g} g ${SUR(m.surovina).nazev.split(' (')[0].toLowerCase()}`).join(', ')}</em>` : ''}</small></span><span class="fmk"><span>${r0(kc)}<small> kcal</small></span><em>B ${r0(r.hodnoty_porce.bilkoviny_g + mods.reduce((a, m) => a + nutOf(m.surovina, m.g).bilkoviny_g, 0))} g</em></span></button>`; }).join('');
  const up = (day.upravy || []).map(u => `<li>${esc(u.text)}</li>`).join('');
  const W = JD.cyklus[c.w]; const cook = c.di === 6 && W ? JD.cyklus[(JD.meta.poradi_cyklu || ['A', 'B', 'C'])[(c.wi + 1) % 3]]?.varka_nedele : c.di === 2 ? W.varka_streda : null;
  return `<div class="wrap">${fHdr('Jídlo')}${remindersF(k)}${nav}
    <div class="fmeals">${meals}</div>${supToday(k, day.trenink)}
    ${up ? `<div class="fsec"><div class="lbl">Navíc k dnešku</div><ul class="fup">${up}</ul></div>` : ''}
    ${cook && R[cook] ? `<div class="fsec"><div class="lbl">Vaření do zásoby</div><p class="fcook">${c.di === 6 ? 'Dnes večer' : 'Dnes'}: <b>${esc(R[cook].nazev)}</b> × 4 porce</p></div>` : ''}
    ${daySumHTML(tot, f.step)}
    ${day.swapped ? '<p class="mut" style="font-size:13px">Svačina prohozená podle tvých tréninkových dnů.</p>' : ''}
  </div>${tabs()}`;
};
A['f-start'] = () => { const v = $('#fs-start').value; if (!v) return; const m = dkey(monday(pdate(v))); F().start = m; save(true); render(); toast(m !== v ? 'Start posunut na pondělí ' + fday(m) : 'Jídelníček nastaven'); };
A['f-day'] = b => { const k = view.d || today(); view.d = dkey(addDays(pdate(k), +b.dataset.v)); render(); };
A['f-meal'] = b => {
  const r = RX()[b.dataset.id]; if (!r) return; const s = b.dataset.s; const k = b.dataset.k || today(); const c = cyc(k); const day = c && !c.before ? planDayF(c.w, c.di, k) : null; const mods = day ? stepMods(F().step, day)[s] || [] : [];
  const tot = addN({ ...r.hodnoty_porce }, {}); mods.forEach(m => addN(tot, nutOf(m.surovina, m.g)));
  sheet(`<h2>${esc(r.nazev)}</h2><p class="mut" style="margin:4px 0 0">${esc(r.slot)} · ${r.kod}</p>
    <p class="fsheet-n">${nutLine(tot)}</p>
    <div class="lbl" style="margin:16px 2px 8px">Suroviny</div>
    <div class="fing">${r.suroviny.map(i => `<div><span>${esc(i.nazev)}${i.poznamka ? `<small>${esc(i.poznamka)}</small>` : ''}</span><b>${i.g ? i.g + ' g' : 'dle chuti'}</b></div>`).join('')}
      ${mods.map(m => `<div class="add"><span>${esc(SUR(m.surovina).nazev)}<small>${m.g > 0 ? 'navíc' : 'méně'} – krok ${sg(F().step, 0)} (${m.typ})</small></span><b>${m.g > 0 ? '+' : ''}${m.g} g</b></div>`).join('')}</div>
    <div class="lbl" style="margin:16px 2px 8px">Příprava</div><p class="ftext">${esc(r.priprava)}</p>
    <div class="lbl" style="margin:16px 2px 8px">Skladování</div><p class="ftext">${esc(r.skladovani)}</p>
    ${r.poznamka ? `<div class="lbl" style="margin:16px 2px 8px">Poznámka</div><p class="ftext">${esc(r.poznamka)}</p>` : ''}
    <div class="actions"><button class="btn white" data-a="close">Zavřít</button></div>`);
};

// ---------- TÝDEN ----------
XV['f-tyden'] = function () {
  const f = F(); if (!f.start) return XV['f-den']();
  const c = cyc(today()); const order = JD.meta.poradi_cyklu || ['A', 'B', 'C']; const w = view.w || (c && !c.before ? c.w : 'A'); const R = RX();
  const days = JD.cyklus[w].dny.map((_, di) => {
    const wk = weekDateFor(w, di); const day = planDayF(w, di, wk), tot = dayTotals(day, f.step); const isT = c && !c.before && c.w === w && c.di === di;
    return `<div class="fwd ${isT ? 'today' : ''}"><div class="fwh"><b>${DNY[di]}</b><small>${day.trenink ? 'trénink' : 'volno'}</small><span>${thou(r0(tot.kcal))} kcal · B ${r0(tot.bilkoviny_g)} g</span></div>
      ${SLOTS.map(([s, l]) => { const r = R[day.jidla[s]]; return r ? `<button class="fwm" data-a="f-meal" data-id="${r.kod}" data-s="${s}" data-k="${wk}"><i>${l}</i><span>${esc(r.nazev)}${(day.z_varky || []).includes(s) ? ' <em class="tag">krabička</em>' : ''}</span></button>` : ''; }).join('')}
      ${(day.upravy || []).length ? `<p class="fwu">+ ${day.upravy.map(u => esc(u.text)).join(' · ')}</p>` : ''}</div>`; }).join('');
  const W = JD.cyklus[w];
  return `<div class="wrap">${fHdr('Týden ' + w)}
    <div class="seg">${order.map(x => `<button data-a="f-week" data-v="${x}" class="${x === w ? 'on' : ''}">Týden ${x}</button>`).join('')}</div>
    <p class="mut" style="font-size:13px;margin:12px 2px">Vaření do zásoby: neděle předem <b style="color:var(--fg)">${esc(R[W.varka_nedele]?.nazev || '')}</b> · středa <b style="color:var(--fg)">${esc(R[W.varka_streda]?.nazev || '')}</b></p>
    <div class="fweek">${days}</div></div>${tabs()}`;
};
A['f-week'] = b => { view.w = b.dataset.v; render(); };

// ---------- NÁKUP ----------
const CATS = ['Maso a ryby', 'Lednice', 'Ovoce a zelenina', 'Mražené', 'Zásoba', 'Navíc kvůli kroku', 'Vlastní'];
function shopWeek() { const f = F(); const c = cyc(today()); if (!c || c.before) return 0; const dow = dIdx(today()); return c.wi + (dow >= 5 && (view.list || 'N1') === 'N1' ? 1 : 0); }
function shopItems(wi, list) {
  const order = JD.meta.poradi_cyklu || ['A', 'B', 'C']; const w = order[wi % order.length]; const f = F();
  if (list === 'Z') return JD.zasoba_na_cyklus.map(z => ({ id: 'z:' + z.surovina, nazev: z.nazev, mnozstvi: `${z.spotreba_3_tydny_g} g za 3 týdny`, pozn: `balení ${z.baleni}`, kat: 'Zásoba' }));
  const src = JD.cyklus[w].nakup[list === 'N1' ? 'N1_vikend' : 'N2_streda'] || [];
  const items = src.filter(i => i.kategorie !== 'Zásoba').map(i => ({ id: i.surovina, nazev: i.nazev, mnozstvi: i.mnozstvi, pozn: i.poznamka || '', kat: i.kategorie }));
  // navíc kvůli kroku: N1 = Po–St, N2 = Čt–Ne
  if (f.step) { const add = {}; const rng = list === 'N1' ? [0, 1, 2] : [3, 4, 5, 6];
    rng.forEach(di => { const day = planDayF(w, di, dkey(addDays(pdate(f.start), wi * 7 + di))); Object.values(stepMods(f.step, day)).flat().forEach(m => add[m.surovina] = (add[m.surovina] || 0) + m.g); });
    Object.entries(add).forEach(([s, g]) => { if (g) items.push({ id: 'step:' + s, nazev: SUR(s).nazev, mnozstvi: `${g > 0 ? '+' : ''}${g} g`, pozn: g > 0 ? `krok ${sg(f.step, 0)}` : `krok ${sg(f.step, 0)} – kup o tolik méně`, kat: 'Navíc kvůli kroku' }); }); }
  (f.custom[`${wi}:${list}`] || []).forEach((n, i) => items.push({ id: 'c:' + i, nazev: n, mnozstvi: '', pozn: '', kat: 'Vlastní', own: i }));
  return items;
}
XV['f-nakup'] = function () {
  const f = F(); if (!f.start) return XV['f-den']();
  const list = view.list || 'N1'; const wi = list === 'Z' ? Math.floor(Math.max(0, cyc(today())?.wi || 0) / 3) * 3 : (view.wi ?? shopWeek());
  const order = JD.meta.poradi_cyklu || ['A', 'B', 'C']; const w = order[wi % 3]; const key = list === 'Z' ? `Z${Math.floor(wi / 3)}` : `${wi}:${list}`;
  const st = f.shop[key] = f.shop[key] || {}; const items = shopItems(wi, list); const mon = dkey(addDays(pdate(f.start), wi * 7));
  const done = items.filter(i => st[i.id]).length;
  const groups = CATS.map(cat => { const its = items.filter(i => i.kat === cat).sort((a, b) => (st[a.id] ? 1 : 0) - (st[b.id] ? 1 : 0)); if (!its.length) return '';
    return `<div class="fsg"><div class="lbl">${cat}</div>${its.map(i => `<button class="fsi ${st[i.id] ? 'on' : ''}" data-a="f-chk" data-key="${key}" data-id="${esc(i.id)}"><span class="cb">${st[i.id] ? ico('check') : ''}</span><span class="t"><b>${esc(i.nazev)}</b>${i.pozn ? `<small>${esc(i.pozn)}</small>` : ''}</span><span class="q">${esc(i.mnozstvi)}</span>${i.own != null ? `<span class="x" data-a="f-cdel" data-key="${key}" data-i="${i.own}">${ico('x')}</span>` : ''}</button>`).join('')}</div>`; }).join('');
  const when = list === 'N1' ? `na ne ${fday(dkey(addDays(pdate(mon), -1))).replace(/^\S+ /, '')} – st ${fday(dkey(addDays(pdate(mon), 2))).replace(/^\S+ /, '')}` : `na st ${fday(dkey(addDays(pdate(mon), 2))).replace(/^\S+ /, '')} – ne ${fday(dkey(addDays(pdate(mon), 6))).replace(/^\S+ /, '')}`;
  const info = shopInfo(list, wi, mon, w);
  return `<div class="wrap">${fHdr('Nákup')}
    <div class="seg">${[['N1', 'Víkend (N1)'], ['N2', 'Středa (N2)'], ['Z', 'Zásoba']].map(([v, l]) => `<button data-a="f-list" data-v="${v}" class="${v === list ? 'on' : ''}">${l}</button>`).join('')}</div>
    ${list !== 'Z' ? `<div class="fdnav" style="margin-top:12px"><button class="round" data-a="f-swk" data-v="-1" aria-label="Předchozí týden" ${wi > 0 ? '' : 'disabled'}>${ico('back')}</button><div><b>Týden ${w}</b><small>${when}</small></div><button class="round" data-a="f-swk" data-v="1" aria-label="Další týden">${ico('chev')}</button></div>` : ''}${info}
    <div class="fsbar"><span>${done} / ${items.length} v košíku</span><button class="btn" data-a="f-reset" data-key="${key}">Nový nákup</button></div>
    ${groups}
    <div class="fadd"><input id="f-own" placeholder="Přidat vlastní položku"><button class="btn white" data-a="f-cadd" data-key="${key}">Přidat</button></div>
    <p class="mut" style="font-size:12px;margin:14px 2px 0">Množství jsou podle cyklu v kroku 0, ve stavu jako v receptech (syrové maso, suché přílohy). Balení v obchodě ověř.</p>
  </div>${tabs()}`;
};
A['f-list'] = b => { view.list = b.dataset.v; view.wi = undefined; render(); };
A['f-swk'] = b => { view.wi = Math.max(0, (view.wi ?? shopWeek()) + +b.dataset.v); render(); };
A['f-chk'] = (b, ev) => { if (ev && ev.target.closest('[data-a=f-cdel]')) return; const st = F().shop[b.dataset.key] = F().shop[b.dataset.key] || {}; const id = b.dataset.id; if (st[id]) delete st[id]; else st[id] = 1; save(); const y = $('#app').scrollTop; render(); $('#app').scrollTop = y; };
A['f-reset'] = b => { F().shop[b.dataset.key] = {}; save(true); render(); toast('Seznam vynulován'); };
A['f-cadd'] = b => { const v = $('#f-own').value.trim(); if (!v) return; const k = b.dataset.key.replace(/^Z\d+$/, m => m); (F().custom[k] = F().custom[k] || []).push(v); save(true); render(); };
A['f-cdel'] = b => { const L = F().custom[b.dataset.key] || []; L.splice(+b.dataset.i, 1); save(true); render(); };

// ---------- SUPLEMENTY ----------
function supState(s) {
  const td = tDays(); let left = s.qty; const t = today(); let d = s.since;
  const uses = k => s.days === 'trenink' ? td.includes(DNY[dIdx(k)]) : true;
  // spotřeba od data naskladnění (včetně), dnešek se počítá jako spotřebovaný
  for (let i = 0; i < 2000 && d <= t; i++) { if (uses(d)) left -= s.dose; d = dkey(addDays(pdate(d), 1)); }
  left = Math.max(0, r1(left));
  let end = null, x = left, dd = dkey(addDays(new Date(), 1));
  for (let i = 0; i < 2000; i++) { if (uses(dd)) { if (x < s.dose - 1e-9) { end = dd; break; } x -= s.dose; } dd = dkey(addDays(pdate(dd), 1)); }
  const daysLeft = end ? Math.round((toU(end) - toU(t)) / DMS) : null;
  return { left, end, daysLeft };
}
const supAlerts = () => { const f = F(); return (f.sup || []).map(s => ({ s, st: supState(s) })).filter(({ st }) => st.daysLeft != null && (st.daysLeft <= (f.supWarn || 7))); };
XV['f-sup'] = function () {
  const f = F(); const L = f.sup || [];
  return `<div class="wrap">${fHdr('Suplementy')}
    ${L.length ? `<div class="list">${L.map((s, i) => { const st = supState(s); const warn = st.daysLeft != null && st.daysLeft <= (f.supWarn || 7);
      return `<div class="fsup ${warn ? (st.daysLeft <= 2 ? 'crit' : 'warn') : ''}"><button class="t" data-a="f-supedit" data-i="${i}"><b>${esc(s.name)}</b><small>${s.dose} ${esc(s.unit)} ${s.days === 'trenink' ? 'v tréninkové dny' : 'denně'}${(s.when || []).length || s.whenNote ? ' · ' + esc([...(s.when || []), s.whenNote].filter(Boolean).join(', ').toLowerCase()) : ''} · zbývá ${nf(st.left, st.left % 1 ? 1 : 0)} ${esc(s.unit)}</small></button>
        <div class="fsr"><span>${st.end ? `vydrží do <b>${fday(st.end)}</b>` : 'došlo'}${st.daysLeft != null ? `<small>${st.daysLeft <= 0 ? 'dnes poslední' : `ještě ${st.daysLeft} ${st.daysLeft === 1 ? 'den' : st.daysLeft < 5 ? 'dny' : 'dní'}`}</small>` : ''}</span><button class="btn" data-a="f-supadd" data-i="${i}">Doplnil jsem</button></div></div>`; }).join('')}</div>`
      : '<div class="empty"><b>Zatím žádný suplement</b><span>Přidej kreatin, protein, vitamin D… Aplikace sama odečítá spotřebu a ozve se, než dojdou.</span></div>'}
    <button class="btn block" style="margin-top:14px" data-a="f-supedit" data-i="-1">${ico('plus')} Přidat suplement</button>
    <div class="fsec" style="margin-top:22px"><div class="lbl">Upozornit předem</div><div class="seg">${[3, 5, 7, 10, 14].map(v => `<button data-a="f-supwarn" data-v="${v}" class="${(f.supWarn || 7) === v ? 'on' : ''}">${v} dní</button>`).join('')}</div><p class="mut" style="font-size:13px;margin:8px 2px 0">Upozornění se ukáže na úvodu, znovu když zbývají 2 dny.</p></div>
  </div>${tabs()}`;
};
A['f-supwarn'] = b => { F().supWarn = +b.dataset.v; save(true); render(); };
A['f-supedit'] = b => {
  const i = +b.dataset.i; const s = i >= 0 ? F().sup[i] : { name: '', qty: '', unit: 'g', dose: '', days: 'denne', pkg: '' };
  sheet(`<h2>${i >= 0 ? 'Upravit suplement' : 'Nový suplement'}</h2><div class="form">
    <label class="f">Název<input id="su-n" value="${esc(s.name)}" placeholder="např. Kreatin"></label>
    <div class="seg" data-seg="unit">${['g', 'ks', 'dávek'].map(u => `<button data-a="seg" data-v="${u}" class="${s.unit === u ? 'on' : ''}">${u}</button>`).join('')}</div>
    <div class="three"><label class="f">Mám teď<input id="su-q" inputmode="decimal" value="${i >= 0 ? nf(supState(s).left, 1).replace(',0', '') : ''}" placeholder="500"></label><label class="f">Denní dávka<input id="su-d" inputmode="decimal" value="${s.dose ? kg(s.dose) : ''}" placeholder="5"></label><label class="f">Balení<input id="su-p" inputmode="decimal" value="${s.pkg ? kg(s.pkg) : ''}" placeholder="500"></label></div>
    <div class="seg" data-seg="days">${[['denne', 'Denně'], ['trenink', 'Jen tréninkové dny']].map(([v, l]) => `<button data-a="seg" data-v="${v}" class="${s.days === v ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div><div class="lbl" style="margin:4px 2px 8px">Kdy beru</div><div class="chips swhen">${SUP_WHEN.map(w => `<button class="chip ${(s.when || []).includes(w) ? 'on' : ''}" data-a="part-tog" data-v="${w}">${w}</button>`).join('')}</div></div>
    <label class="f">Jinak / poznámka<input id="su-o" value="${esc(s.whenNote || '')}" placeholder="např. s jídlem, rozdělit na 2×"></label></div>
    <div class="actions">${i >= 0 ? `<button class="btn danger" data-a="f-supdel" data-i="${i}" aria-label="Smazat">${ico('trash')}</button>` : ''}<button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="f-supsave" data-i="${i}">Uložit</button></div>`);
};
A['f-supsave'] = b => {
  const i = +b.dataset.i; const name = $('#su-n').value.trim(), q = num($('#su-q').value), d = num($('#su-d').value), p = num($('#su-p').value);
  if (!name || q == null || !d) return toast('Vyplň název, kolik máš a denní dávku');
  const o = { name, qty: q, dose: d, pkg: p || null, unit: $('[data-seg=unit] .on')?.dataset.v || 'g', days: $('[data-seg=days] .on')?.dataset.v || 'denne', since: dkey(addDays(new Date(), 1)), when: $$('#sheet .swhen .chip.on').map(x => x.dataset.v), whenNote: $('#su-o').value.trim() };
  const L = F().sup = F().sup || []; if (i >= 0) L[i] = o; else L.push(o); save(true); closeSheet(); render(); toast('Uloženo');
};
A['f-supdel'] = b => { F().sup.splice(+b.dataset.i, 1); save(true); closeSheet(); render(); };
A['f-supadd'] = b => {
  const s = F().sup[+b.dataset.i]; const st = supState(s);
  sheet(`<h2>Doplnil jsem: ${esc(s.name)}</h2><div class="form"><label class="f">Kolik přibylo (${esc(s.unit)})<input id="su-a" class="bigin" inputmode="decimal" value="${kg(s.pkg)}" placeholder="500"></label></div>
    <div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="f-supadd2" data-i="${b.dataset.i}">Přičíst</button></div>`);
};
A['f-supadd2'] = b => { const s = F().sup[+b.dataset.i]; const a = num($('#su-a').value); if (!a) return; const st = supState(s); s.qty = r1(st.left + a); s.since = dkey(addDays(new Date(), 1)); if (!s.pkg) s.pkg = a; save(true); closeSheet(); render(); toast(`+${kg(a)} ${s.unit}`); };

// ---------- VÝVOJ: hodnocení měření ----------
function weekAvg(mon) { const ks = [...Array(7)].map((_, i) => dkey(addDays(pdate(mon), i))); const ws = ks.map(k => BD().days[k]?.weight).filter(v => v != null); return { n: ws.length, avg: ws.length ? ws.reduce((a, b) => a + b, 0) / ws.length : null }; }
function evalData() {
  const f = F(); const st = f.start || bStart() && dkey(monday(pdate(bStart()))); if (!st) return null;
  const nowMon = dkey(monday(new Date())); const weeks = [];
  for (let m = st; m < nowMon; m = dkey(addDays(pdate(m), 7))) { const a = weekAvg(m); const x = f.weeks[m] || {}; weeks.push({ mon: m, ...a, exc: !!x.exc, excWhy: x.excWhy || '', valid: a.n >= 5 && !x.exc }); }
  const V = weeks.filter(w => w.valid); const evals = [];
  for (let i = 2; i < V.length; i += 2) { const cur = V[i], prev = V[i - 2]; const ch = cur.avg - prev.avg; const lo = cur.avg * .003, hi = cur.avg * .005; evals.push({ mon: cur.mon, from: prev.mon, ch, lo, hi, z: ch < lo ? 'pod' : ch > hi ? 'nad' : 'v' }); }
  // pas
  const M = Object.entries(BD().meas).filter(([, m]) => m.waist != null).sort((a, b) => a[0] < b[0] ? -1 : 1);
  let w4 = null, wAll = null; if (M.length >= 2) { const [lk, lm] = M[M.length - 1]; wAll = lm.waist - M[0][1].waist; const ref = [...M].reverse().find(([k]) => toU(k) <= toU(lk) - 27 * DMS); if (ref) w4 = lm.waist - ref[1].waist; }
  return { st, weeks, evals, w4, wAll, waist: M.length ? M[M.length - 1][1].waist : null };
}
function recommend(E) {
  const f = F(); if (!E) return { t: 'Málo dat', d: 'Zatím není z čeho hodnotit. Važ se denně ráno.', k: 'idle' };
  const out = []; const ev = E.evals; const L = ev[ev.length - 1], P = ev[ev.length - 2];
  const weeksSince = Math.floor((toU(today()) - toU(E.st)) / (7 * DMS)); const lastBig = f.reviewAt ? Math.floor((toU(today()) - toU(f.reviewAt)) / (7 * DMS)) : weeksSince;
  if (lastBig >= 12 || (E.wAll != null && E.wAll >= 4)) out.push({ t: 'Čas na velké přehodnocení jídelníčku', d: 'Projdi fotky, váhu, pas a výkon. Není to automatický konec nabírání.', k: 'big', act: 'f-bigdone' });
  if (!L) { out.push({ t: 'Málo dat', d: 'Hodnotí se po 2 týdnech s aspoň 5 váženími. Týden s výjimkou se nepočítá.', k: 'idle' }); return out; }
  if (E.w4 != null && E.w4 >= 1 && L.z === 'v') {
    const q = f.checks[L.mon] || {};
    if (q.photo && q.perf && q.feel) { const cut = q.photo === 'ano' && q.perf !== 'roste'; out.push(cut ? { t: 'Zvaž −1 krok', d: 'Pas roste, na fotkách víc tuku a výkon neroste.', k: 'down', steps: [-1] } : { t: 'Beze změny, sleduj další 2 týdny', d: 'Pas roste, ale fotky ani výkon nedávají důvod ubírat.', k: 'ok' }); }
    else out.push({ t: 'Zkontroluj fotky a výkon', d: `Pas +${nf(E.w4, 1)} cm za 4 týdny při váze v pásmu. Pas sám nerozhoduje – odpověz na 3 otázky.`, k: 'check', q: L.mon });
    return out;
  }
  if (P && L.z === 'pod' && P.z === 'pod' && (E.w4 == null || Math.abs(E.w4) < 1)) out.push({ t: 'Zvaž +1 až 2 kroky (+100–200 kcal)', d: 'Dvě hodnocení po sobě pod pásmem a pas stabilní.', k: 'up', steps: [1, 2] });
  else if (P && L.z === 'nad' && P.z === 'nad') out.push({ t: 'Zvaž −1 až 2 kroky', d: 'Dvě hodnocení po sobě nad pásmem.', k: 'down', steps: [-1, -2] });
  else if (L.z === 'v') out.push({ t: 'Beze změny, jde to dobře', d: 'Tempo je v cílovém pásmu.', k: 'ok' });
  else out.push({ t: 'Zatím beze změny', d: `Poslední hodnocení je ${L.z === 'pod' ? 'pod' : 'nad'} pásmem. Podle jednoho hodnocení se nic nemění – rozhodne další.`, k: 'idle' });
  return out;
}
function perfTrend() { const lim = Date.now() - 14 * DMS, lim2 = Date.now() - 28 * DMS; const a = finished().filter(s => s.start > lim), b = finished().filter(s => s.start > lim2 && s.start <= lim); const up = x => x.reduce((s, q) => s + stats(q).up, 0); return { now: up(a), prev: up(b), n: a.length }; }
XV['f-vyvoj'] = function () {
  const f = F(); const E = evalData(); const R = recommend(E); const P = perfTrend(); const mon = dkey(monday(new Date())); const lastMon = dkey(addDays(pdate(mon), -7));
  const wk = f.weeks[lastMon] || {};
  const recs = (Array.isArray(R) ? R : [R]).map(r => `<div class="frec ${r.k}"><b>${r.t}</b><span>${r.d}</span>
    ${r.steps ? `<div class="two" style="margin-top:12px">${r.steps.map(s => `<button class="btn ${s === r.steps[0] ? 'white' : ''}" data-a="f-setstep" data-v="${f.step + s}">Potvrdit ${s > 0 ? '+' : ''}${s} → krok ${sg(f.step + s, 0)}</button>`).join('')}</div>` : ''}
    ${r.q ? `<div class="fq">${[['photo', 'Vypadám na fotkách tučněji?', ['ano', 'ne']], ['perf', 'Výkon roste?', ['roste', 'stagnuje', 'klesá']], ['feel', 'Hlad a energie v pořádku?', ['ano', 'ne']]].map(([k, l, o]) => `<div><small>${l}</small><div class="seg">${o.map(v => `<button data-a="f-q" data-m="${r.q}" data-k="${k}" data-v="${v}" class="${(f.checks[r.q] || {})[k] === v ? 'on' : ''}">${v}</button>`).join('')}</div></div>`).join('')}</div>` : ''}
    ${r.act ? `<button class="btn" style="margin-top:12px" data-a="${r.act}">Přehodnoceno</button>` : ''}</div>`).join('');
  const rows = E ? E.weeks.slice(-8).reverse().map(w => `<div class="fwr ${w.valid ? '' : 'dim'}"><span>${fday(w.mon)}</span><b>${w.avg != null ? nf(w.avg, 2) + ' kg' : '–'}</b><small>${w.exc ? 'výjimka' : w.n < 5 ? `málo dat (${w.n}×)` : `${w.n} vážení`}</small></div>`).join('') : '';
  const L = E && E.evals[E.evals.length - 1];
  return `<div class="wrap">${fHdr('Vývoj')}
    ${recs}
    <div class="fstat"><div><span>Za 2 týdny</span><b>${L ? sg(L.ch, 2) : '–'}<small> kg</small></b><em>${L ? `pásmo ${nf(L.lo, 2)}–${nf(L.hi, 2)}` : 'zatím bez hodnocení'}</em></div>
      <div><span>Pas 4 týdny</span><b>${E && E.w4 != null ? sg(E.w4, 1) : '–'}<small> cm</small></b><em>od startu ${E && E.wAll != null ? sg(E.wAll, 1) + ' cm' : '–'}</em></div>
      <div><span>Výkon 2 týdny</span><b>${P.now}<small> ↑</small></b><em>předtím ${P.prev} ↑</em></div></div>
    <div class="fsec"><div class="lbl">Týdenní průměry (Po–Ne)</div>${rows || '<p class="mut">Zatím žádný celý týden.</p>'}</div>
    <div class="fsec"><div class="lbl">Minulý týden · ${fday(lastMon)}</div>
      ${[['hunger', 'Hlad'], ['digest', 'Trávení'], ['sleep', 'Spánek'], ['energy', 'Energie']].map(([k, l]) => `<div class="fsc"><span>${l}</span><div class="seg">${[1, 2, 3, 4, 5].map(v => `<button data-a="f-wk" data-m="${lastMon}" data-k="${k}" data-v="${v}" class="${wk[k] === v ? 'on' : ''}">${v}</button>`).join('')}</div></div>`).join('')}
      <button class="sw ${wk.exc ? 'on' : ''}" data-a="f-exc" data-m="${lastMon}"><span>Výjimka<small>Nemoc, cesta, hodně slané jídlo, změna tréninku – týden se nehodnotí</small></span><span class="k"></span></button>
      ${wk.exc ? `<input class="inp" id="f-excwhy" data-m="${lastMon}" placeholder="Co se dělo" value="${esc(wk.excWhy || '')}">` : ''}</div>
    <div class="fsec"><div class="lbl">Krok příjmu</div><div class="fstep"><button class="round" data-a="f-setstep" data-v="${f.step - 1}" ${f.step <= -4 ? 'disabled' : ''}>−</button><div><b>${sg(f.step, 0).replace('–', '0')}</b><small>${thou(stepAvg(f.step))} kcal/den průměr</small></div><button class="round" data-a="f-setstep" data-v="${f.step + 1}" ${f.step >= 10 ? 'disabled' : ''}>+</button></div>${stepWhat(f.step)}</div>
    <div class="two" style="margin-top:18px"><button class="btn" data-a="tab" data-v="mery">${ico('ruler')} Zapsat váhu / míry</button><button class="btn" data-a="f-export">${ico('share')} Export pro výživu</button></div>
  </div>${tabs()}`;
};
const stepAvg = s => (JD.urovne_prijmu.kroky.find(k => k.krok === s) || {}).prumer_den?.kcal || 0;
function stepWhat(s) {
  if (!s) return '<p class="mut" style="font-size:13px;margin:8px 2px 0">Krok 0 = jídelníček přesně podle cyklu.</p>';
  const U = JD.urovne_prijmu; const list = s > 0 ? U.poradi_nahoru.slice(0, s) : U.poradi_dolu.slice(0, -s); const nm = { snidane: 'snídaně', obed: 'oběd', svacina: 'svačina', vecere: 'večeře' };
  return `<ol class="fsteps">${list.map(m => `<li>${s > 0 ? '+' : '−'} ${m.typ === 'tuk' ? (m.slot === 'snidane' ? '15 g ořechů' : '11 g olivového oleje') : 'modul přílohy'} – ${nm[m.slot]}</li>`).join('')}</ol>`;
}
A['f-setstep'] = b => { const v = Math.max(-4, Math.min(10, +b.dataset.v)); const f = F(); if (v === f.step) return; f.stepLog.push({ d: today(), from: f.step, to: v }); f.step = v; save(true); render(); toast(`Krok ${sg(v, 0).replace('–', '0')} – jídelníček ukazuje nové porce`); };
A['f-q'] = b => { const f = F(); (f.checks[b.dataset.m] = f.checks[b.dataset.m] || {})[b.dataset.k] = b.dataset.v; save(true); render(); };
A['f-wk'] = b => { const f = F(); (f.weeks[b.dataset.m] = f.weeks[b.dataset.m] || {})[b.dataset.k] = +b.dataset.v; save(true); const y = $('#app').scrollTop; render(); $('#app').scrollTop = y; };
A['f-exc'] = b => { const f = F(); const w = f.weeks[b.dataset.m] = f.weeks[b.dataset.m] || {}; w.exc = !w.exc; save(true); const y = $('#app').scrollTop; render(); $('#app').scrollTop = y; };
A['f-bigdone'] = () => { F().reviewAt = today(); save(true); render(); toast('Přehodnocení zapsáno'); };
document.addEventListener('input', ev => { if (ev.target.id === 'f-excwhy') { const f = F(); (f.weeks[ev.target.dataset.m] = f.weeks[ev.target.dataset.m] || {}).excWhy = ev.target.value; save(); } });

// ---------- nastavení jídelníčku, export a import ----------
XV['f-set'] = function () {
  const f = F(); const td = tDays();
  return `<div class="wrap">${fHdr('Nastavení jídla', '<span></span>')}
    <div class="form" style="margin-top:0"><label class="f">Start – pondělí týdne A<input type="date" id="fs-start2" value="${f.start || ''}"></label></div>
    <div class="fsec"><div class="lbl">Tréninkové dny</div><div class="fdays">${DNY.map(d => `<button data-a="f-td" data-v="${d}" class="${td.includes(d) ? 'on' : ''}">${d}</button>`).join('')}</div>
      <p class="mut" style="font-size:13px;margin:8px 2px 0">${f.tdays ? 'Vlastní volba.' : 'Podle tvého plánu v gymu.'} Svačiny P1/P4/P5 se dají do tréninkových dnů, P3/P6 do volných.</p></div>
    <div class="fsec"><div class="lbl">Data jídelníčku</div><p style="margin:0 2px">${esc(JD.meta.nazev)} · verze ${esc(JD.meta.verze)} · ${JD.recepty.length} receptů</p>
      <div class="two" style="margin-top:12px"><label class="btn">Nahrát novou verzi<input type="file" id="f-imp" accept="application/json,.json" hidden></label><button class="btn" data-a="f-export">Export pro výživu</button></div>
      <p class="mut" style="font-size:12px;margin:8px 2px 0">Nová verze přepíše jen recepty a cyklus. Měření, odškrtnuté nákupy a suplementy zůstanou.</p>
      ${localStorage.getItem(JD_KEY) ? '<button class="btn block" style="margin-top:10px" data-a="f-impreset">Vrátit původní verzi</button>' : ''}</div>
    <p class="mut" style="font-size:12px;margin:16px 2px">${esc(JD.meta.upozorneni || '')}</p>
  </div>${tabs()}`;
};
document.addEventListener('change', async ev => {
  if (ev.target.id === 'fs-start2' && ev.target.value) { F().start = dkey(monday(pdate(ev.target.value))); save(true); render(); toast('Start: ' + fday(F().start)); }
  if (ev.target.id === 'f-imp') { const file = ev.target.files[0]; if (!file) return; try { const j = JSON.parse(await file.text()); if (!j.cyklus || !j.recepty || !j.suroviny) throw 0; localStorage.setItem(JD_KEY, JSON.stringify(j)); JD = j; render(); toast('Jídelníček aktualizován: ' + (j.meta?.verze || '')); } catch (e) { toast('Tohle není soubor jídelníčku'); } }
});
A['f-impreset'] = () => { localStorage.removeItem(JD_KEY); JD = JD_DEFAULT; render(); toast('Původní verze'); };
A['f-td'] = b => { const f = F(); const cur = new Set(tDays()); cur.has(b.dataset.v) ? cur.delete(b.dataset.v) : cur.add(b.dataset.v); f.tdays = DNY.filter(d => cur.has(d)); save(true); render(); };
A['f-export'] = async () => {
  const f = F(); const E = evalData(); const b = BD();
  const rows = [['datum', 'vaha_kg', 'kroky', 'spanek_h', 'pas_cm', 'ostatni_obvody', 'fotky', 'vyjimka_tydne', 'krok_prijmu']];
  const keys = [...new Set([...Object.keys(b.days), ...Object.keys(b.meas)])].sort();
  const stepAt = k => { let s = JD.meta.vychozi_krok || 0; f.stepLog.forEach(l => { if (l.d <= k) s = l.to; }); return s; };
  keys.forEach(k => { const d = b.days[k] || {}, m = b.meas[k] || {}; const wk = f.weeks[dkey(monday(pdate(k)))] || {}; const other = Object.entries(m).filter(([x, v]) => typeof v === 'number' && x !== 'waist' && x !== 'savedAt').map(([x, v]) => `${x}=${v}`).join(' ');
    rows.push([k, d.weight ?? '', d.steps ?? '', d.sleep ?? '', m.waist ?? '', other, m.photos || '', wk.exc ? (wk.excWhy || 'ano') : '', stepAt(k)]); });
  const csv = rows.map(r => r.map(v => /[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(';')).join('\n');
  const json = JSON.stringify({ export: new Date().toISOString(), jidelnicek: { nazev: JD.meta.nazev, verze: JD.meta.verze, start: f.start, krok: f.step, historie_kroku: f.stepLog, treninkove_dny: tDays() }, tydny: f.weeks, otazky: f.checks, hodnoceni: E ? E.evals : [], tydenni_prumery: E ? E.weeks : [], mereni: { dny: b.days, obvody: b.meas } }, null, 1);
  const files = [new File(['﻿' + csv], `vyziva-mereni-${today()}.csv`, { type: 'text/csv' }), new File([json], `vyziva-${today()}.json`, { type: 'application/json' })];
  try { if (navigator.canShare && navigator.canShare({ files })) return await navigator.share({ files, title: 'Export pro výživu' }); } catch (e) { if (e.name === 'AbortError') return; }
  files.forEach(fl => { const a = document.createElement('a'); a.href = URL.createObjectURL(fl); a.download = fl.name; document.body.appendChild(a); a.click(); a.remove(); });
};

// ---------- připomínky a upozornění ----------
function remindersF(k) {
  const f = F(); const di = dIdx(today()); const out = [];
  if (!BD().days[today()]?.weight) out.push(['Ranní vážení', 'nalačno, po toaletě', 'mery']);
  if (di === 6) out.push(['Neděle: pas a týdenní hodnocení', 'pas ráno nalačno, ve výši pupku', 'f-vyvoj']);
  if (f.start) { const wi = Math.floor((toU(today()) - toU(f.start)) / (7 * DMS)); if (di === 6 && wi % 4 === 3) out.push(['Obvody a fotky', 'jednou za 4 týdny', 'mery']); }
  if (di === 5) out.push(['Nákup N1', 'víkendový nákup na Po–St', 'f-nakup']);
  if (di === 2) out.push(['Nákup N2', 'středeční nákup na Čt–Ne', 'f-nakup']);
  supAlerts().forEach(({ s, st }) => out.push([`${s.name} ${st.daysLeft <= 2 ? 'skoro došel' : 'dochází'}`, st.end ? `vydrží do ${fday(st.end)}` : 'došel', 'f-sup', st.daysLeft <= 2]));
  if (k && k !== today()) return '';
  return out.length ? `<div class="frem">${out.map(([t, d, go, crit]) => `<button class="${crit ? 'crit' : ''}" data-a="tab" data-v="${go}"><b>${t}</b><small>${d}</small></button>`).join('')}</div>` : '';
}
// domů: řádek Jídlo + výrazný banner u důležitých věcí
const _13vHome = vHome;
vHome = function () {
  let h = _13vHome(); const f = F(); const c = cyc(today()); const R = RX();
  let sub = 'Jídelníček, nákup, suplementy';
  if (c && !c.before) { const day = planDayF(c.w, c.di, today()); const next = SLOTS.find(([s, , t]) => { const [hh, mm] = t.split(':').map(Number); return new Date().getHours() * 60 + new Date().getMinutes() < hh * 60 + mm + 60; }); if (next) sub = `${next[1]}: ${R[day.jidla[next[0]]]?.nazev || ''}`; else sub = `Týden ${c.w} · zítra ${R[planDayF(c.w, (c.di + 1) % 7).jidla.snidane]?.nazev || ''}`; }
  const row = `<button class="hcard frow" data-a="tab" data-v="f-den"><span class="hic">${ico('fork')}</span><b>Jídlo</b><small>${esc(sub)}</small></button>`;
  const ban = []; const E = f.start ? evalData() : null; const RR = E ? recommend(E) : [];
  (Array.isArray(RR) ? RR : []).filter(r => ['up', 'down', 'check', 'big'].includes(r.k)).forEach(r => { const id = (E.evals.at(-1)?.mon || '') + r.k; if (!f.dismiss[id]) ban.push(`<button class="fban" data-a="tab" data-v="f-vyvoj"><b>${r.t}</b><small>${r.d}</small></button>`); });
  supAlerts().filter(({ st }) => st.daysLeft <= 2).forEach(({ s, st }) => ban.push(`<button class="fban crit" data-a="tab" data-v="f-sup"><b>${esc(s.name)} skoro došel</b><small>${st.end ? 'vydrží do ' + fday(st.end) : 'došel'} – doplň zásobu</small></button>`));
  return h.replace('<div class="hgrid">', ban.join('') + '<div class="hgrid">' + row);
};

// přehledný součet dne: energie velkým číslem, makra v řádcích s podílem na energii
function daySumHTML(tot, step) {
  const wts = Object.entries(BD().days).filter(([, d]) => d.weight != null).sort((a, b) => a[0] < b[0] ? 1 : -1); const kgw = wts.length ? wts[0][1].weight : null;
  const en = { bilkoviny_g: 4, sacharidy_g: 4, tuky_g: 9 }; const K = tot.kcal || 1;
  const row = (k, l, sub) => { const g = tot[k]; const pct = en[k] ? Math.round(g * en[k] / K * 100) : null;
    return `<div class="fmr ${k === 'bilkoviny_g' ? 'pro' : ''}"><span class="l">${l}${sub ? `<small>${sub}</small>` : ''}</span><span class="bar">${pct != null ? `<i style="width:${Math.min(100, pct * 1.6)}%"></i>` : ''}</span><b>${r0(g)}<small> g</small></b><em>${pct != null ? pct + ' %' : ''}</em></div>`; };
  return `<div class="fsum2"><div class="lbl">Celý den${step ? ` · krok ${sg(step, 0)}` : ''}</div>
    <div class="fsk"><b>${thou(r0(tot.kcal))}</b><span>kcal</span></div>
    <div class="fmrs">${row('bilkoviny_g', 'Bílkoviny', kgw ? `${nf(tot.bilkoviny_g / kgw, 1)} g na kg` : '')}${row('sacharidy_g', 'Sacharidy')}${row('tuky_g', 'Tuky')}${row('vlaknina_g', 'Vláknina')}</div>
    <p class="fmnote">% = podíl na energii dne</p></div>`;
}

const inDays = k => { const d = Math.round((toU(k) - toU(today())) / DMS); return d === 0 ? 'dnes' : d === 1 ? 'zítra' : d === -1 ? 'včera' : d > 0 ? `za ${d} ${d < 5 ? 'dny' : 'dní'}` : `před ${-d} ${-d < 5 ? 'dny' : 'dny'}`; };
function shopInfo(list, wi, mon, w) {
  const R = RX(); const W = JD.cyklus[w]; const fl = k => flong(k).replace(/^./, c => c.toUpperCase());
  if (list === 'Z') { const c0 = dkey(addDays(pdate(F().start), Math.floor(wi / 3) * 21)); const c1 = dkey(addDays(pdate(c0), 20)); const nx = dkey(addDays(pdate(c1), -1));
    return `<div class="fshi"><div><span>Na období</span><b>${fday(c0)} – ${fday(c1)}</b><small>celý cyklus A → B → C (3 týdny)</small></div><div><span>Další zásoba</span><b>${fday(nx)}</b><small>${inDays(nx)}</small></div></div>`; }
  const buy = list === 'N1' ? dkey(addDays(pdate(mon), -2)) : dkey(addDays(pdate(mon), 2));
  const from = list === 'N1' ? dkey(addDays(pdate(mon), -1)) : buy, to = list === 'N1' ? dkey(addDays(pdate(mon), 2)) : dkey(addDays(pdate(mon), 6));
  const cookK = list === 'N1' ? W.varka_nedele : W.varka_streda; const cookD = list === 'N1' ? from : buy;
  return `<div class="fshi"><div><span>Nakoupit</span><b>${fl(buy)}</b><small>${inDays(buy)}</small></div>
    <div><span>Vystačí</span><b>${fday(from)} – ${fday(to)}</b><small>${list === 'N1' ? 'nedělní vaření + jídla Po–St' : 'středeční vaření + jídla Čt–Ne'}</small></div>
    ${R[cookK] ? `<div class="w"><span>Vaří se do zásoby</span><b>${esc(R[cookK].nazev)} × 4</b><small>${fl(cookD)}</small></div>` : ''}</div>`;
}

const SUP_WHEN = ['Ráno nalačno', 'Po 1. jídle', 'K obědu', 'Před tréninkem', 'Po tréninku', 'Večer', 'Před spaním'];
// dnešní suplementy podle času, odškrtnutí „vzato“
function supToday(k, isT) {
  const f = F(); const L = (f.sup || []).map((s, i) => ({ s, i })).filter(({ s }) => s.days !== 'trenink' || isT); if (!L.length) return '';
  const tk = (f.supTaken = f.supTaken || {})[k] || {};
  const slot = s => { const w = (s.when || []).filter(x => x !== 'Před tréninkem' || isT); return w.length ? w : ['Kdykoli']; };
  const order = [...SUP_WHEN, 'Kdykoli']; const rows = [];
  order.forEach(w => L.forEach(({ s, i }) => { if (slot(s).includes(w)) rows.push({ w, s, i }); }));
  return `<div class="fsec"><div class="lbl">Suplementy</div><div class="fsupd">${rows.map(({ w, s, i }) => { const id = i + ':' + w; return `<button class="fsi ${tk[id] ? 'on' : ''}" data-a="f-took" data-k="${k}" data-id="${id}"><span class="cb">${tk[id] ? ico('check') : ''}</span><span class="t"><b>${esc(s.name)}</b><small>${w}${s.whenNote ? ' · ' + esc(s.whenNote) : ''}</small></span><span class="q">${kg(s.dose)} ${esc(s.unit)}</span></button>`; }).join('')}</div></div>`;
}
A['f-took'] = b => { const f = F(); const T = (f.supTaken = f.supTaken || {}); const d = T[b.dataset.k] = T[b.dataset.k] || {}; if (d[b.dataset.id]) delete d[b.dataset.id]; else d[b.dataset.id] = 1;
  Object.keys(T).forEach(x => { if (toU(x) < toU(today()) - 14 * DMS) delete T[x]; }); save(); const y = $('#app').scrollTop; render(); $('#app').scrollTop = y; };

// datum dne v aktuálním cyklu pro daný týden (A/B/C) a den
function weekDateFor(w, di) { const c = cyc(today()); if (!c || c.before) return dkey(addDays(pdate(F().start), (JD.meta.poradi_cyklu || ['A', 'B', 'C']).indexOf(w) * 7 + di)); const order = JD.meta.poradi_cyklu || ['A', 'B', 'C']; const base = c.wi - (c.wi % order.length); return dkey(addDays(pdate(F().start), (base + order.indexOf(w)) * 7 + di)); }
