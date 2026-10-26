
// ===================== v2.21 b: týdenní přehled podle PDF · ferment zelí/kefír · předpříprava jídel · připomínky · pokyny k měření · pozadí počítadel =====================
// ---------- ferment: přepínač zelí / kefír (alternativa v úpravách dne) ----------
const _21pd = planDayF;
planDayF = function (w, di, k) { const d = _21pd(w, di, k); if (d && k) d._k = k; return d; };
const fermAlt = d => (d.upravy || []).find(u => u.alternativa);
const fermOn = d => !!(d && d._k && (F().ferm || {})[d._k] === 'alt' && fermAlt(d));
const _21dt = dayTotals;
dayTotals = function (day, step) { const t = _21dt(day, step); if (fermOn(day)) t.kcal += fermAlt(day).alternativa.kcal_navic || 0; return t; };
A['f-ferm'] = b => { const f = F(); f.ferm = f.ferm || {}; if (b.dataset.v === 'alt') f.ferm[b.dataset.k] = 'alt'; else delete f.ferm[b.dataset.k]; Object.keys(f.ferm).forEach(k => { if (toU(k) < toU(today()) - 60 * DMS) delete f.ferm[k]; }); save(); const y = $('#app').scrollTop; render(); $('#app').scrollTop = y; };
const _21fden = XV['f-den'];
XV['f-den'] = function () {
  let h = _21fden(); const k = view.d || today(); const c = cyc(k); if (!c || c.before) return h; const d = planDayF(c.w, c.di, k); const u = fermAlt(d); if (!u) return h;
  const alt = fermOn(d); const li = `<li class="ferm"><span>${esc(alt ? u.alternativa.text.replace(/^nebo\s+/, '') : u.text)}</span><span class="seg sm">${[['', 'zelí'], ['alt', 'kefír']].map(([v, l]) => `<button data-a="f-ferm" data-k="${k}" data-v="${v}" class="${(v === 'alt') === alt ? 'on' : ''}">${l}</button>`).join('')}</span></li>`;
  return h.replace(`<li>${esc(u.text)}</li>`, li);
};

// ---------- TÝDEN: přehled jako v PDF (dny × jídla, navíc, celý den, průměr týdne) ----------
const DNYL = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
const r10 = v => Math.round(v / 10) * 10;
const shortN = n => String(n || '').replace(/\s*\((syrov[áéý]|syrové|bez slupky|dužina)\)/i, '');
function cellIngr(r, mods) {
  const base = r.suroviny.map(i => ({ ...i })); const extra = [];
  mods.forEach(m => { const x = base.find(i => i.surovina === m.surovina); if (x) x.g += m.g; else extra.push({ surovina: m.surovina, nazev: SUR(m.surovina).nazev, g: m.g, plus: 1 }); });
  const small = i => i.g <= 15 && ((SUR(i.surovina).na_100g || {}).kcal || 0) < 80;
  const fmt = i => { const ks = /(\d+)\s*ks/.exec(i.poznamka || ''); return `${esc(shortN(i.nazev))} ${ks && i.g === r.suroviny.find(x => x.surovina === i.surovina)?.g ? `${ks[1]} ks` : `${i.plus && i.g > 0 ? '+' : ''}${i.g} g`}`; };
  const big = [...base, ...extra].filter(i => i.g && !small(i)), sm = [...base, ...extra].filter(i => i.g && small(i));
  return `<ul>${big.map(i => `<li>${fmt(i)}</li>`).join('')}</ul>${sm.length ? `<p class="wsm">${sm.map(fmt).join(', ')}</p>` : ''}`;
}
XV['f-tyden'] = withUP(function () {
  const f = F(); if (!f.start) return XV['f-den']();
  const c = cyc(today()); const order = JD.meta.poradi_cyklu || ['A', 'B', 'C']; const w = view.w || (c && !c.before ? c.w : order[0]); const R = RX(); const W = JD.cyklus[w];
  const nextW = JD.cyklus[order[(order.indexOf(w) + 1) % order.length]];
  const days = W.dny.map((_, di) => { const k = weekDateFor(w, di); const day = planDayF(w, di, k); return { di, k, day, M: stepMods(f.step, day), tot: dayTotals(day, f.step) }; });
  const portions = (rk, wk) => wk.dny.filter(d => d.jidla.obed === rk && (d.z_varky || []).includes('obed')).length;
  const lunchDays = (rk, wk) => { const ds = wk.dny.map((d, i) => d.jidla.obed === rk && (d.z_varky || []).includes('obed') ? i : -1).filter(i => i >= 0); return ds.length ? DNY[ds[0]] + (ds.length > 1 ? '–' + DNY[ds[ds.length - 1]] : '') : ''; };
  const isT = x => c && !c.before && c.w === w && c.di === x.di;
  const tag = (x, s, r) => { const t = [];
    if ((x.day.z_varky || []).includes(s)) t.push('ze zásoby');
    if (s === 'svacina' && x.day.trenink) t.push('před tréninkem');
    if (s === 'vecere' && x.di === 2 && r.kod === W.varka_streda) t.push(`do zásoby (${portions(r.kod, W) + 1} porce)`);
    if (s === 'vecere' && x.di === 6 && r.kod === nextW.varka_nedele) t.push('do zásoby na další týden');
    return t.map(v => `<em class="wtg">${v}</em>`).join(''); };
  const cell = (x, s) => { const r = R[x.day.jidla[s]]; if (!r) return `<div class="wc ${isT(x) ? 'td' : ''}"></div>`; const mods = x.M[s] || [];
    const n = addN({ ...r.hodnoty_porce }, {}); mods.forEach(m => addN(n, nutOf(m.surovina, m.g)));
    return `<button class="wc ${isT(x) ? 'td' : ''}" data-a="f-meal" data-id="${r.kod}" data-s="${s}" data-k="${x.k}"><b>${esc(r.nazev)}</b>${tag(x, s, r)}${cellIngr(r, mods)}<span class="wk">~${thou(r10(n.kcal))} kcal · B ${r0(n.bilkoviny_g)} g</span></button>`; };
  const navic = x => { const L = (x.day.upravy || []).filter(u => !/^ubrat/.test(u.typ)).map(u => u.typ === 'ferment' ? `Ferment: ${esc(fermOn(x.day) ? u.alternativa.text.replace(/^nebo\s+/, '') : u.text)}${u.alternativa && !fermOn(x.day) ? ` (${esc(u.alternativa.text)})` : ''}` : esc(u.text));
    if (!(x.day.upravy || []).some(u => u.typ === 'ferment')) { const s = SLOTS.find(([sl]) => R[x.day.jidla[sl]]?.suroviny.some(i => i.surovina === 'kefir')); if (s) L.push(`Ferment: kefír ve ${{ snidane: 'snídani', obed: 'obědě', svacina: 'svačině', vecere: 'večeři' }[s[0]]}`); }
    return `<div class="wc nav ${isT(x) ? 'td' : ''}"><ul>${L.map(t => `<li>${t}</li>`).join('')}</ul></div>`; };
  const tot = x => `<div class="wc tot ${isT(x) ? 'td' : ''}"><b>~${thou(r10(x.tot.kcal))} kcal</b><small>B ${r0(x.tot.bilkoviny_g)} · S ${r0(x.tot.sacharidy_g)} · T ${r0(x.tot.tuky_g)} · Vl ${r0(x.tot.vlaknina_g)}</small></div>`;
  const avg = {}; days.forEach(x => addN(avg, x.tot, 1 / 7));
  const grid = `<div class="wgr"><div class="wh0"></div>${days.map(x => `<div class="wh ${isT(x) ? 'td' : ''}"><b>${DNYL[x.di]}</b><em class="${x.day.trenink ? 't' : ''}">${x.day.trenink ? 'trénink' : 'volno'}</em><small>${fday(x.k).replace(/^\S+ /, '')}</small></div>`).join('')}
    ${SLOTS.map(([s, l, t]) => `<div class="wl"><b>${l}</b><small>~${t}</small></div>${days.map(x => cell(x, s)).join('')}`).join('')}
    <div class="wl"><b>Navíc</b></div>${days.map(navic).join('')}
    <div class="wl"><b>Celý den</b></div>${days.map(tot).join('')}</div>`;
  const fo = PN().ferment || {};
  return `<div class="wrap wtyd">${fHdr('Týden ' + w)}
    <div class="seg">${order.map(x => `<button data-a="f-week" data-v="${x}" class="${x === w ? 'on' : ''}">Týden ${x}</button>`).join('')}</div>
    <p class="wsub"><b>Jídelníček · krok ${sgn(f.step)} · ~${thou(r10(avg.kcal))} kcal</b><br>Vaření do zásoby: neděle předem <b>${esc(R[W.varka_nedele]?.nazev || '')}</b> (večeře + obědy ${lunchDays(W.varka_nedele, W)}) · středa <b>${esc(R[W.varka_streda]?.nazev || '')}</b> (večeře + obědy ${lunchDays(W.varka_streda, W)})</p>
    <div class="wscroll">${grid}</div>
    <p class="wfoot"><b>Průměr týdne: ~${thou(r10(avg.kcal))} kcal · B ${r0(avg.bilkoviny_g)} g · S ${r0(avg.sacharidy_g)} g · T ${r0(avg.tuky_g)} g · vláknina ${r0(avg.vlaknina_g)} g.</b></p>
    <p class="wfoot">Jednotky: ${esc(JD.meta.jednotky || '')}. ${esc(fo.poznamka || '')} ${esc(JD.meta.upozorneni || '')}</p>
    <button class="btn block" style="margin-top:14px" data-a="tab" data-v="f-prep">${ico('prep')} Předpřipravit jídlo na víc dní</button>
  </div>${tabs()}`;
});
const _21render2 = render;
render = function () { _21render2(); if (view.n === 'f-tyden') { const s = $('.wscroll'), t = $('.wscroll .wh.td'); if (s && t && !s.dataset.done) { s.dataset.done = 1; s.scrollLeft = Math.max(0, t.offsetLeft - 64); } } };

// ---------- PŘEDPŘÍPRAVA: vyber dny a jídla, ukáže co kdy a co uvařit ----------
XV['f-prep'] = withUP(function () {
  const f = F(); if (!f.start) return XV['f-den'](); const R = RX();
  const P = f.prep && f.prep.at === today() ? f.prep : (f.prep = { at: today(), days: [], slots: ['obed'] });
  const next = [...Array(10)].map((_, i) => dkey(addDays(new Date(), i)));
  const sel = P.days.filter(k => k >= today()).sort();
  const rows = []; sel.forEach(k => { const c = cyc(k); if (!c || c.before) return; const d = planDayF(c.w, c.di, k); const M = stepMods(f.step, d);
    SLOTS.forEach(([s, l, t]) => { if (!P.slots.includes(s)) return; const r = R[d.jidla[s]]; if (r) rows.push({ k, s, l, t, r, mods: M[s] || [] }); }); });
  const byR = {}; rows.forEach(x => { (byR[x.r.kod] = byR[x.r.kod] || { r: x.r, L: [] }).L.push(x); });
  const sum = {}; rows.forEach(x => { x.r.suroviny.forEach(i => sum[i.surovina] = (sum[i.surovina] || 0) + i.g); x.mods.forEach(m => sum[m.surovina] = (sum[m.surovina] || 0) + m.g); });
  const ingr = Object.entries(sum).filter(([, g]) => g > 0).map(([s, g]) => [SUR(s), g, s]).sort((a, b) => (a[0].kategorie_nakupu || '').localeCompare(b[0].kategorie_nakupu || '') || a[0].nazev.localeCompare(b[0].nazev, 'cs'));
  const chip = (on, a, v, l, extra = '') => `<button class="chip ${on ? 'on' : ''}" data-a="${a}" data-v="${v}" ${extra}>${l}</button>`;
  return `<div class="wrap">${fHdr('Předpříprava', '<span></span>')}
    <p class="mut" style="margin:0 2px 12px;font-size:14px">Dnes je ${flong(today())}. Vyber dny, na které si chceš jídlo připravit dopředu, a která jídla.</p>
    <div class="lbl" style="margin:0 2px 8px">Dny</div><div class="prd">${next.map(k => { const d = pdate(k); return `<button class="${sel.includes(k) ? 'on' : ''}" data-a="pr-day" data-v="${k}"><small>${k === today() ? 'dnes' : DOW[d.getDay()]}</small><b>${d.getDate()}.</b></button>`; }).join('')}</div>
    <div class="lbl" style="margin:16px 2px 8px">Jídla</div><div class="chips">${SLOTS.map(([s, l]) => chip(P.slots.includes(s), 'pr-slot', s, l)).join('')}${chip(P.slots.length === 4, 'pr-slot', 'all', 'Vše')}</div>
    ${!rows.length ? '<div class="empty" style="margin-top:18px"><b>Vyber dny a jídla</b><span>Třeba středu a čtvrtek, jen obědy a svačiny. Ukáže se, co uvařit, kolik porcí a do kterých krabiček.</span></div>' : `
    <div class="fsec"><div class="lbl">Co kdy · ${rows.length} ${rows.length === 1 ? 'porce' : rows.length < 5 ? 'porce' : 'porcí'}</div>
      ${sel.map(k => { const L = rows.filter(x => x.k === k); return L.length ? `<div class="prday"><b>${flong(k)}</b>${L.map(x => `<button class="prm" data-a="f-meal" data-id="${x.r.kod}" data-s="${x.s}" data-k="${x.k}"><i>${x.l}</i><span>${esc(x.r.nazev)}</span></button>`).join('')}</div>` : ''; }).join('')}</div>
    <div class="fsec"><div class="lbl">Co uvařit</div>${Object.values(byR).map(({ r, L }) => `<div class="prr"><b>${esc(r.nazev)}</b><span class="n">× ${L.length}</span><small>${L.map(x => `${DOW[pdate(x.k).getDay()]} ${x.l.toLowerCase()}`).join(' · ')}</small><small class="mut">${esc(r.skladovani || '')}</small></div>`).join('')}</div>
    <div class="fsec"><div class="lbl">Suroviny celkem</div>${ingr.map(([x, g]) => `<div class="fwr"><span>${esc(x.nazev)}</span><b>${g >= 1000 ? nf(g / 1000, 2) + ' kg' : r0(g) + ' g'}</b><small>${esc(x.kategorie_nakupu || '')}</small></div>`).join('')}</div>`}
  </div>${tabs()}`;
});
A['pr-day'] = b => { const P = F().prep; const i = P.days.indexOf(b.dataset.v); if (i >= 0) P.days.splice(i, 1); else P.days.push(b.dataset.v); save(); const y = $('#app').scrollTop; render(); $('#app').scrollTop = y; };
A['pr-slot'] = b => { const P = F().prep; if (b.dataset.v === 'all') P.slots = P.slots.length === 4 ? ['obed'] : SLOTS.map(s => s[0]); else { const i = P.slots.indexOf(b.dataset.v); if (i >= 0) P.slots.splice(i, 1); else P.slots.push(b.dataset.v); } save(); const y = $('#app').scrollTop; render(); $('#app').scrollTop = y; };
const _21tabs3 = tabs;
tabs = () => view.n === 'f-prep' ? _21tabs3().replace('data-v="f-tyden" class="', 'data-v="f-tyden" class="on ') : _21tabs3();
const _21fden3 = XV['f-den'];
XV['f-den'] = function () { return _21fden3().replace(/(<button class="fjcur")/, `<button class="btn block" style="margin-top:14px" data-a="tab" data-v="f-prep">${ico('prep')} Předpřipravit jídlo na víc dní</button>$1`); };

// ---------- připomínky z plan_nabirani.pripominky (banner na Domů) ----------
const DOWN = ['neděl', 'pondělí', 'úter', 'střed', 'čtvrt', 'pát', 'sobot'];
function remindToday() {
  const f = F(); if (!f.start) return []; const L = PN().pripominky || []; const d = new Date(), dow = d.getDay(), h = d.getHours(); const wk = Math.floor(daysBetween(f.start, today()) / 7);
  const weekMon = dkey(monday(d)); const waistDone = Object.entries(BD().meas).some(([k, m]) => k >= weekMon && m.waist != null);
  return L.filter(p => { const k = (p.kdy || '').toLowerCase(); const n = /každé\s+(\d+)\s+týdn/.exec(k);
    let due = /denně/.test(k) || DOWN.some((x, i) => i === dow && k.includes(x)) || (n && dow === 0 && (wk + 1) % +n[1] === 0);
    if (/ráno/.test(k) && h >= 12) due = false;
    const co = (p.co || '').toLowerCase();
    if (/zvážit|vážen/.test(co) && BD().days[today()]?.weight != null) due = false;
    if (/^pas/.test(co) && waistDone && f.weeks[weekMon]?.energy) due = false;
    return due; }).map(p => { const co = (p.co || '').toLowerCase(); const go = /nákup/.test(co) ? 'f-nakup' : /várk|vaření/.test(co) ? 'f-tyden' : /pas|hodnocen/.test(co) ? 'f-vyvoj' : 'mery'; return { t: p.co, go }; });
}
const _21vHome = vHome;
vHome = function () { const h = _21vHome(); const R = remindToday(); if (!R.length) return h;
  const row = `<div class="hrem"><span class="lbl">Dnes</span>${R.map(r => `<button data-a="tab" data-v="${r.go}">${esc(r.t)}</button>`).join('')}</div>`;
  return h.replace('<div class="scard food"', row + '<div class="scard food"'); };

// ---------- pokyny k měření z plan_nabirani.mereni ----------
const mer = co => (PN().mereni || []).find(m => (m.co || '').toLowerCase().startsWith(co)) || null;
const merTxt = m => m ? `${m.jak}${m.kdy ? ' · ' + m.kdy : ''}` : '';
const _21mDen = mDen;
mDen = function () { let h = _21mDen(); const hm = mer('hmotnost'), sc = mer('hlad');
  if (hm) h = h.replace(/(<div class="two"><label class="f">Váha nalačno \(kg\))/, `<p class="mhint">Váha: ${esc(merTxt(hm))}</p>$1`);
  if (sc) h = h.replace(/(<div><div class="ml scl">)/, `<p class="mhint">${esc(sc.co)}: ${esc(merTxt(sc))}</p>$1`);
  return h; };
const _21mMiry = mMiry;
mMiry = function () { let h = _21mMiry(); const p = mer('pas'), o = mer('ostatní'), fo = mer('fotky'), ib = mer('inbody');
  h = h.replace(/<p class="mut hint">[\s\S]*?<\/p>/, `<p class="mut hint">${p ? `<b>Pas:</b> ${esc(merTxt(p))}<br>` : ''}${o ? `<b>${esc(o.co)}:</b> ${esc(merTxt(o))}` : ''}</p>`);
  if (fo) h = h.replace('Fotky pořízené (každé 2 týdny)', `Fotky pořízené <span class="mhs">${esc(merTxt(fo))}</span>`);
  if (ib) h = h.replace('<summary>Měření u fyzia (InBody / DEXA)</summary>', `<summary>Měření u fyzia (InBody / DEXA) <span class="mhs">${esc(ib.kdy || '')}</span></summary>`);
  if (p) h = h.replace(/(<label class="mrow"><span class="ml2"><b>Pas<\/b><small>)[^<]*/, `$1${esc(p.jak)}`);
  return h; };

// ---------- počítadla: klidné přírodní pozadí ----------
function natureSVG(seed) {
  const pal = [['#2E4A3F', '#3E6152', '#557A68', '#E9C98B', '#1B2B25'], ['#2C3E50', '#3D5468', '#5A7286', '#F1C38E', '#18232E'], ['#4A4030', '#6B5D40', '#8C7D58', '#F2C27E', '#2A241A']][seed % 3];
  return `<svg class="natbg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[4]}"/><stop offset=".7" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[3]}" stop-opacity=".55"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#nsky)"/>
    <circle cx="${300 - seed * 40}" cy="62" r="17" fill="${pal[3]}" opacity=".8"/>
    <path d="M0 215 C60 195 110 204 160 192 S260 172 300 188 S370 196 400 184 V300 H0Z" fill="${pal[2]}" opacity=".75"/>
    <path d="M0 238 C70 222 130 234 190 220 S300 212 400 226 V300 H0Z" fill="${pal[1]}"/>
    <path d="M0 262 C80 250 150 260 220 248 S330 243 400 252 V300 H0Z" fill="${pal[0]}"/>
    <g fill="${pal[4]}" opacity=".9">${[30, 52, 70, 330, 352, 375].map((x, i) => `<path d="M${x} ${276 - (i % 3) * 4} l6 -${18 + (i % 2) * 7} l6 ${18 + (i % 2) * 7}z"/>`).join('')}</g>
    <path d="M0 282 C100 275 200 285 300 277 S380 279 400 276 V300 H0Z" fill="${pal[4]}"/></svg>`;
}
const _21sob = A['sob-open'];
A['sob-open'] = () => { _21sob(); const pn = $('#sheet .pn'); const q = qSel(); if (!pn || !q || !$('#sheet .sobs')) return; pn.classList.add('nat'); const i = Object.keys(QK).indexOf(q.kind); pn.insertAdjacentHTML('afterbegin', natureSVG(i < 0 ? 0 : i)); };
