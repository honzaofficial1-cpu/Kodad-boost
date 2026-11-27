// ===================== v2.42: plán 3.1 – mikroživiny a graf výživy, suplementy, náhrady a „proč“ z plánu, nutné/dochucení, hotové maso, ml, trvanlivost, porcování masa, cesty, tréninková svačina, páté jídlo jen v Plánu =====================

// ---------- skupiny podle plánu (skupina „dochuceni“ už se neodhaduje) ----------
const _56ig = ingGroup;
ingGroup = function (i) {
  if (i && i.skupina === 'dochuceni') return 3;
  const g = _56ig(i); return g === 3 && i && i.skupina === 'hlavni' && 'nutne' in i ? 2 : g; // v plánu 3.1 je „hlavni“ vždy hlavní
};
// jednotka: ml u tekutin
const unitOf = i => (i && i.jednotka) || SUR(i && i.surovina).jednotka || 'g';

// ---------- proč a náhrady z plánu ----------
const _56why = whyTxt;
whyTxt = function (i) {
  const p = SUR(i.surovina).proc; if (!p) return _56why(i);
  const h = _56why(i); const cut = h.indexOf('<small>'); const rest = cut >= 0 ? h.slice(cut) : '';
  return esc(p.charAt(0).toUpperCase() + p.slice(1)) + (/[.!]$/.test(p) ? '' : '.') + rest.replace(/ g\)/, unitOf(i) === 'ml' ? ' ml)' : ' g)');
};
swapHTML = function (i) {
  const N = SUR(i.surovina).nahrady; if (!i.g) return '';
  const L = Array.isArray(N) && N.length ? N.filter(x => JD.suroviny[x.surovina || x]).map(x => typeof x === 'string' ? { s: x, g: swapG(i.surovina, x, i.g) } : { s: x.surovina, g: Math.round(i.g * (x.pomer || 1) / 5) * 5 })
    : (SWAP[i.surovina] || []).filter(x => JD.suroviny[x]).map(x => ({ s: x, g: swapG(i.surovina, x, i.g) }));
  if (!L.length) return '';
  return `<div class="fsw2"><p class="t">Když nemáš</p>${L.slice(0, 3).map(x => `<p class="r"><span>${esc(SUR(x.s).nazev.split(' (')[0].replace(/,\s*syrov[éá]$/, ''))}</span><span class="g">${x.g} ${unitOf({ surovina: x.s })}</span></p>`).join('')}</div>`;
};

// ---------- detail jídla: nutné, dochucení šedě, hotové maso, ml, trvanlivost ----------
const _56fm = A['f-meal'];
A['f-meal'] = function (b) {
  _56fm.apply(this, arguments); const r = RX()[b.dataset.id]; if (!r) return;
  const lb = $('#sheet .fdoch'); if (lb) { lb.textContent = 'Dochucení'; let n = lb.nextElementSibling; while (n && !n.classList.contains('fvgh') && n.tagName !== 'P') { n.classList.add('dch'); n = n.nextElementSibling; } }
  $$('#sheet .fing > div[data-i]').forEach(d => {
    const i = r.suroviny[+d.dataset.i]; if (!i) return; const sp = d.querySelector('span'), q = d.querySelector('b');
    if (i.nutne && sp && !sp.querySelector('.ftg')) { const f = sp.querySelector('.finf'); if (f) f.insertAdjacentHTML('afterend', '<span class="ftg nut">nutné</span>'); }
    if (q && unitOf(i) === 'ml') q.innerHTML = q.innerHTML.replace(/(\d)\s*g\b/, '$1 ml');
    if (sp && i.vareny_g) sp.insertAdjacentHTML('beforeend', `<small>≈ ${i.vareny_g} g hotového masa</small>`);
    if (sp && unitOf(i) === 'ml') [...sp.querySelectorAll('small')].forEach(x => { if (x.textContent.trim() === 'ml') x.remove(); });
  });
};
// „Znovu ho máš“ + lednice / mrazák podle trvanlivosti receptu
prepBlock = function (r, k, s) {
  const nx = nextSame(r.kod, k, 10); const n = fmCtx.n; const L = r.lednice_dni, M = r.mrazak_dni; const known = typeof L === 'number';
  const where = x => { const d = daysBetween(k, x.dk); if (!known || x.box) return ''; if (d <= L) return ' · z lednice'; return M > 0 ? ' · z mrazáku' : ' · uvař čerstvě'; };
  const when = nx.length ? nx.map(x => `<span class="chip">${fday(x.dk)} · ${x.l.toLowerCase()}${x.box ? ' · z krabičky' : ''}${where(x)}</span>`).join('') : '<span class="mut" style="font-size:14px">V příštích 10 dnech už není.</span>';
  const keep = known ? (L === 0 ? 'Jen čerstvě, dopředu nevař.' : `V lednici ${L} ${L === 1 ? 'den' : L < 5 ? 'dny' : 'dní'}${M > 0 ? `, v mrazáku až ${M} dní` : ', nemrazit'}. Co jíš později, dej hned po vychladnutí do mrazáku.`) : 'Jak dlouho vydrží, máš níž ve Skladování.';
  const can = !known || L > 0;
  return `<div class="fprep" id="fprep"><div class="lbl" style="margin:18px 2px 8px">Znovu ho máš</div><div class="chips">${when}</div>
    ${can ? `<div class="fprep-h"><div><b>Uvařit rovnou na víc</b><small>${n === 1 ? 'jen dnešní porce' : `dnes + ${n - 1}× dopředu, do krabiček`}</small></div>
      <div class="fstp"><button class="round" data-a="fm-n" data-v="-1" ${n <= 1 ? 'disabled' : ''} aria-label="Méně porcí">${ico('minus')}</button><b>${n}</b><button class="round" data-a="fm-n" data-v="1" ${n >= 6 ? 'disabled' : ''} aria-label="Víc porcí">${ico('plus')}</button></div></div>
    ${n > 1 ? `<div class="lbl" style="margin:12px 2px 6px">Na ${n} ${n < 5 ? 'porce' : 'porcí'} · podle dnešního kroku</div>${prepHTML(r, k, s, n).replace(/(<div><span>(?:Hovězí vývar|Vývar|Mléko|Kefír)[^<]*<\/span><b>\d+) g/g, '$1 ml')}` : ''}` : ''}
    <p class="mut" style="font-size:12px;margin:8px 2px 0">${keep}</p></div>`;
};

// ---------- MIKROŽIVINY: den a týden z gramů receptů (podle kroku) + odškrtnuté suplementy ----------
const MIC = [['vit_a_ug', 'Vit A'], ['vit_c_mg', 'Vit C'], ['vit_d_ug', 'Vit D'], ['vit_e_mg', 'Vit E'], ['vit_k_ug', 'Vit K'], ['b12_ug', 'B12'], ['folat_ug', 'Folát'], ['vapnik_mg', 'Vápník'], ['horcik_mg', 'Hořčík'], ['zelezo_mg', 'Železo'], ['zinek_mg', 'Zinek'], ['draslik_mg', 'Draslík'], ['selen_ug', 'Selen'], ['jod_ug', 'Jód'], ['sodik_mg', 'Sodík'], ['epa_dha_g', 'Omega-3']];
const MIC_LONG = { vit_a_ug: 'Vitamin A', vit_c_mg: 'Vitamin C', vit_d_ug: 'Vitamin D', vit_e_mg: 'Vitamin E', vit_k_ug: 'Vitamin K', b12_ug: 'Vitamin B12', epa_dha_g: 'Omega-3 (EPA+DHA)' };
const CIL = () => (JD.cile_mikrozivin && JD.cile_mikrozivin.zivina) || null;
const micAdd = (t, sur, g) => { const n = SUR(sur).na_100g || {}; MIC.forEach(([k]) => { t[k] = (t[k] || 0) + (n[k] || 0) * g / 100; }); };
function microFood(k) {
  const c = cyc(k); if (!c || c.before) return null; const day = planDayF(c.w, c.di, k); if (!day) return null; const R = RX(); const M = stepMods(F().step, day); const t = {};
  SLOTS.forEach(([s]) => { const r = R[day.jidla[s]]; if (!r) return; r.suroviny.forEach(i => micAdd(t, i.surovina, i.g || 0)); (M[s] || []).forEach(m => micAdd(t, m.surovina, m.g)); });
  (day.upravy || []).forEach(u => { if (u.surovina && u.g) micAdd(t, u.surovina, u.g); });
  return t;
}
// suplementy z aplikace ↔ suplementy_obsah z plánu (podle názvu)
const supKey = s => { s = String(s || '').toLowerCase(); return /d3|vitamin d/.test(s) ? 'd3' : /hořč|horc|magnes/.test(s) ? 'mg' : /omega|ryb[ií] olej|fish/.test(s) ? 'o3' : s.replace(/vilgain|\s+/g, ''); };
function microSupp(k) {
  const f = F(); const T = (f.supTaken || {})[k] || {}; const O = JD.suplementy_obsah || []; const t = {}; const done = new Set();
  Object.keys(T).forEach(id => { const s = (f.sup || [])[+id.split(':')[0]]; if (!s) return; const key = supKey(s.name); if (done.has(key)) return; const o = O.find(x => supKey(x.nazev) === key); if (!o) return; done.add(key); Object.entries(o.obsah || {}).forEach(([n, v]) => { t[n] = (t[n] || 0) + v; }); });
  return t;
}
function microDays(keys) {
  const food = {}, supp = {}; let n = 0;
  keys.forEach(k => { const a = microFood(k); if (!a) return; n++; MIC.forEach(([x]) => { food[x] = (food[x] || 0) + (a[x] || 0); }); const s = microSupp(k); Object.entries(s).forEach(([x, v]) => { supp[x] = (supp[x] || 0) + v; }); });
  if (!n) return null; const avg = o => Object.fromEntries(MIC.map(([x]) => [x, (o[x] || 0) / n])); return { food: avg(food), supp: avg(supp), n };
}
// stav živiny: lo = pod 80 % doporučení, hi = nad horním limitem (sodík: nad doporučením); výjimky podle plánu
function micState(x, food, supp) {
  const c = CIL()[x]; if (!c) return 'ok'; const v = food + supp;
  if (x === 'sodik_mg') return v > c.doporuceno ? 'hi' : 'ok';
  if (v < c.doporuceno * 0.8) return 'lo';
  if (c.horni_limit != null) {
    if (x === 'vit_a_ug') return 'ok';                       // limit jen pro retinol
    if (x === 'horcik_mg' || x === 'folat_ug' || x === 'zelezo_mg') return supp > c.horni_limit ? 'hi' : 'ok'; // limit jen z doplňků
    if (v > c.horni_limit) return 'hi';
  }
  return 'ok';
}
const micFmt = (v, u) => u === 'g' ? nf(v, 2) : v >= 100 ? thou(Math.round(v)) : nf(v, v < 10 ? 1 : 0);
function micRadar(D) {
  const C = CIL(); const n = MIC.length, cx = 170, cy = 150, R = 92; const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))]; const f2 = p => p.map(v => v.toFixed(1)).join(',');
  const rr = p => R * Math.min(2, Math.max(0.04, p)) / 2; // 0–200 % doporučení, 100 % = půl poloměru
  const P = MIC.map(([x], i) => { const c = C[x] || {}; const v = (D.food[x] || 0) + (D.supp[x] || 0); const p = c.doporuceno ? v / c.doporuceno : 0; return { x, i, p, st: micState(x, D.food[x] || 0, D.supp[x] || 0) }; });
  const ring = f => MIC.map((_, i) => f2(pt(i, R * f))).join(' ');
  const col = st => st === 'lo' ? 'rgba(231,154,184,.9)' : st === 'hi' ? 'rgba(141,180,232,.9)' : 'rgba(255,255,255,.55)';
  return `<svg class="micr" viewBox="0 0 340 300" role="img" aria-label="Mikroživiny v procentech doporučení">
    <polygon points="${ring(1)}" fill="none" stroke="#2C2C30"/><polygon points="${ring(.25)}" fill="none" stroke="#232327"/>
    <polygon points="${ring(.5)}" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.28)" stroke-dasharray="3 3"/>
    ${MIC.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0].toFixed(1)}" y2="${pt(i, R)[1].toFixed(1)}" stroke="#232327"/>`).join('')}
    <polygon points="${P.map(p => f2(pt(p.i, rr(p.p)))).join(' ')}" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.45)" stroke-width="1.5" stroke-linejoin="round"/>
    ${P.map(p => { const [x, y] = pt(p.i, rr(p.p)); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.st === 'ok' ? 3 : 4.5}" fill="${col(p.st)}"/>`; }).join('')}
    ${MIC.map(([, l], i) => { const [x, y] = pt(i, R + 18); const st = P[i].st; return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" class="${st}">${l}</text>`; }).join('')}
    <text x="${cx}" y="${(cy - R / 2 - 4).toFixed(1)}" text-anchor="middle" class="ring">100 %</text></svg>`;
}
function micBlock(keys, title) {
  if (!CIL()) return ''; const D = microDays(keys); if (!D) return ''; const C = CIL();
  const rows = MIC.map(([x, l]) => { const f = D.food[x] || 0, s = D.supp[x] || 0; return { x, l: MIC_LONG[x] || l, f, s, v: f + s, c: C[x] || {}, st: micState(x, f, s) }; });
  const lo = rows.filter(r => r.st === 'lo'), hi = rows.filter(r => r.st === 'hi');
  const line = r => `<div class="mic5 ${r.st}"><i class="d"></i><div class="n"><p class="t">${esc(r.l)}</p><p class="h">${Math.round(r.v / r.c.doporuceno * 100)} % doporučení${r.s ? ` · z toho doplňky ${micFmt(r.s, r.c.jednotka)} ${esc(r.c.jednotka)}` : ''}</p></div><p class="v">${micFmt(r.v, r.c.jednotka)} ${esc(r.c.jednotka || '')}</p></div>`;
  return `<div class="fmic"><div class="lbl" style="margin:26px 2px 6px">${title}</div>
    ${micRadar(D)}
    <p class="fmic-s">${lo.length ? `Málo: <b class="lo">${lo.map(r => esc(r.l)).join(', ')}</b>` : 'Nic nechybí'}${hi.length ? ` · Moc: <b class="hi">${hi.map(r => esc(r.l)).join(', ')}</b>` : ''}</p>
    <p class="mut" style="font-size:12px;margin:-4px 2px 10px">Přerušovaný kruh = 100 % doporučení. Průměr ${D.n} ${D.n === 1 ? 'dne' : 'dnů'} podle kroku ${sgn(F().step)}; doplňky jen ve dny, kdy jsou odškrtnuté.</p>
    <details class="micd"><summary>Všechny živiny<span class="chev">${ico('chevd')}</span></summary>${[...lo, ...hi, ...rows.filter(r => r.st === 'ok')].map(line).join('')}</details></div>`;
}
function kontrolaHTML() {
  const K = JD.kontrola_tydne; if (!K) return ''; const C = CIL() || {};
  const nm = z => MIC_LONG[z] || (MIC.find(m => m[0] === z) || [])[1] || (z === 'ala' ? 'Omega-3 ALA (ořechy)' : z);
  const it = (x, cls) => `<div class="kt5 ${cls}"><b>${esc(nm(x.zivina))}</b><span>${esc(x.reseni || '')}</span></div>`;
  return `<div class="fmic"><div class="lbl" style="margin:22px 2px 8px">Kontrola plánu · ${esc(K.stav || '')}</div>
    ${(K.slabe || []).map(x => it(x, 'lo')).join('')}${(K.preb || []).map(x => it(x, 'hi')).join('')}${K.ok ? `<p class="mut" style="font-size:13px;margin:10px 2px 0">${esc(K.ok)}</p>` : ''}</div>`;
}
// Týden: graf za zobrazený týden + kontrola plánu (místo textové tabulky z verze 2.41)
microHTML = function () {
  if (!CIL()) return ''; const c = cyc(today()); const order = JD.meta.poradi_cyklu || ['T1']; const w = view.w || (c && !c.before ? c.w : order[0]);
  const keys = (JD.cyklus[w]?.dny || []).map((_, di) => weekDateFor(w, di));
  return micBlock(keys, `Výživa týdne ${esc(w)} · vitaminy a minerály`) + kontrolaHTML();
};
// Dnes: sbalená výživa dne dole
const _56den = XV['f-den'];
XV['f-den'] = function () {
  const h = _56den(); if (!CIL()) return h; const k = view.d || today(); const c = cyc(k); if (!c || c.before) return h;
  const D = microDays([k]); if (!D) return h; const C = CIL();
  const lo = MIC.filter(([x]) => micState(x, D.food[x] || 0, D.supp[x] || 0) === 'lo').map(([x, l]) => MIC_LONG[x] || l), hi = MIC.filter(([x]) => micState(x, D.food[x] || 0, D.supp[x] || 0) === 'hi').map(([x, l]) => MIC_LONG[x] || l);
  const box = `<details class="micday"><summary><span><b>Výživa dne</b><small>${lo.length ? `málo: ${lo.join(', ')}` : 'nic nechybí'}${hi.length ? ` · moc: ${hi.join(', ')}` : ''}</small></span><span class="chev">${ico('chevd')}</span></summary>${micBlock([k], 'Vitaminy a minerály dne')}<p class="mut" style="font-size:12px;margin:0 2px 14px">Jeden den vždycky kolísá (ryba je jen některé dny). Rozhoduje průměr týdne v Týdnu.</p></details>`;
  const i = h.lastIndexOf('</div>' + tabs()); return i < 0 ? h : h.slice(0, i) + box + h.slice(i);
};

// ---------- NÁKUP: jak porcovat maso do mrazáku ----------
const _56nak = XV['f-nakup'];
XV['f-nakup'] = function () {
  const h = _56nak(); const L = JD.mrazeni_masa; if (!L || !L.length) return h;
  const box = `<details class="micd frz5"><summary>Jak porcovat do mrazáku<span class="chev">${ico('chevd')}</span></summary>${L.map(x => `<div class="frz5r"><b>${esc(SUR(x.surovina).nazev.split(' (')[0].replace(/,\s*syrov[éá]$/, ''))}</b><small>${esc(x.baleni || '')}</small><span>${esc(x.rozdel || '')}</span></div>`).join('')}</details>`;
  const i = h.lastIndexOf('</div>' + tabs()); return i < 0 ? h : h.slice(0, i) + box + h.slice(i);
};

// ---------- CESTY: jídla z plánu (cestovni_varianty) ----------
const _56easy = easyHTML;
easyHTML = function (step) {
  const V = JD.cestovni_varianty; if (!V || !(V.jidla || []).length) return _56easy(step);
  const SL = { snidane: 'Snídaně', obed: 'Oběd', svacina: 'Svačina', vecere: 'Večeře', hlavni: 'Hlavní jídlo' };
  return `<div class="ftez">${V.pravidlo ? `<p style="margin:0 0 10px">${esc(V.pravidlo)}</p>` : ''}
    ${(V.nakup_zaklad || []).length ? `<div class="lbl" style="margin:8px 2px 6px">Co koupit</div><p class="mut" style="margin:0 2px 12px">${V.nakup_zaklad.map(esc).join(', ')}</p>` : ''}
    ${V.jidla.map(m => `<div class="ftezm"><div class="ftezh"><i>${esc(SL[m.slot] || m.slot)}</i><b>${esc(m.nazev)}</b>${m.hodnoty ? `<span>${thou(r0(m.hodnoty.kcal))} kcal · B ${r0(m.hodnoty.bilkoviny_g)} g</span>` : ''}</div>
      <div class="ftezi">${m.suroviny.map(i => `<span><em>${esc((SUR(i.surovina).obecny_nazev || SUR(i.surovina).nazev).split(' (')[0])}${i.poznamka ? ` <small>${esc(i.poznamka)}</small>` : ''}</em><b>${i.g} ${unitOf(i)}</b></span>`).join('')}</div>${m.priprava ? `<small>${esc(m.priprava)}</small>` : ''}</div>`).join('')}</div>`;
};

// ---------- TRÉNINKOVÁ SVAČINA (urovne_prijmu.pravidlo_treninkove_svaciny) ----------
const _56pd = planDayF;
planDayF = function (w, di, k) {
  const d = _56pd.apply(this, arguments); const rule = JD.urovne_prijmu && JD.urovne_prijmu.pravidlo_treninkove_svaciny; if (!d || !rule || !d.trenink) return d;
  const R = RX(); const base = JD.cyklus[w].dny[di]; const orig = R[base.jidla.svacina]; if (!orig || orig.svacina_typ !== 'volny_den') return d; // jen den s volnou svačinou v plánu
  const codes = String(rule).match(/\b[SH]\d+\b/g) || []; const rice = new Set(codes.filter(x => x[0] === 'H')), riceB = new Set(codes.filter(x => x[0] === 'S'));
  const has = riceB.has(d.jidla.snidane) || ['obed', 'vecere'].some(s => rice.has(d.jidla[s]));
  const want = has ? 'P-T1' : 'P1'; if (!R[want] || d.jidla.svacina === want) return d;
  const cur = R[d.jidla.svacina]; if (cur) addN(d.soucet_dne, cur.hodnoty_porce, -1); addN(d.soucet_dne, R[want].hodnoty_porce); d.jidla.svacina = want; d.swapped = true; return d;
};

// ---------- PÁTÉ JÍDLO: jen informace v Plánu, do dne se nezařazuje ----------
const _56plan = XV['f-plan'];
XV['f-plan'] = function () {
  const h = _56plan(); const U = JD.urovne_prijmu || {}; const P = U.pate_jidlo; if (!P) return h; const R = RX(); const S5 = U.stropy_porci || {};
  const box = `<details class="micd p5"><summary>Páté jídlo · od kroku ${sgn(P.od_kroku)}<span class="chev">${ico('chevd')}</span></summary>
    <p>${esc(P.pravidlo || '')}</p>${(P.recepty || []).filter(k => R[k]).map(k => `<div class="p5r"><b>${esc(R[k].nazev)}</b><small>${thou(r0(R[k].hodnoty_porce.kcal))} kcal · B ${r0(R[k].hodnoty_porce.bilkoviny_g)} g</small></div>`).join('')}
    ${S5.popis ? `<p style="margin-top:12px"><b>Stropy porcí.</b> ${esc(S5.popis)}</p><p class="mut">${['snidane', 'svacina', 'obed_vecere'].filter(x => S5[x]).map(x => esc(S5[x])).join(' · ')}</p>` : ''}
    ${U.kdy_pridat ? `<p style="margin-top:12px"><b>Kdy přidat.</b> ${esc(U.kdy_pridat)}</p>` : ''}</details>`;
  const i = h.lastIndexOf('</div>' + tabs()); return i < 0 ? h : h.slice(0, i) + box + h.slice(i);
};
