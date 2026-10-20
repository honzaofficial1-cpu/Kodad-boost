
// ===================== v2.15: snědeno, záměny, kalibrace, záloha, štítky, výběr sdílení =====================
const FX = () => { const f = F(); f.eaten = f.eaten || {}; f.swaps = f.swaps || {}; return f; };
// odkazy z notifikací
(function () { try { const q = new URLSearchParams(location.search); const o = q.get('open'); if (o === 'nakup' || o === 'jidlo') { history.replaceState(null, '', location.pathname); setTimeout(() => go(o === 'nakup' ? 'f-nakup' : 'f-den'), 0); } } catch (e) { } })();

// ---------- záměny jídel ----------
const _35planDayF = planDayF;
planDayF = function (w, di, k) {
  const d = _35planDayF(w, di); if (!d || !k) return d; const sw = (FX().swaps[k]) || {}; const R = RX();
  Object.entries(sw).forEach(([s, kod]) => { const o = R[d.jidla[s]], n = R[kod]; if (!n || !o || o.kod === kod) return; addN(d.soucet_dne, o.hodnoty_porce, -1); addN(d.soucet_dne, n.hodnoty_porce); d.jidla[s] = kod; d.z_varky = (d.z_varky || []).filter(x => x !== s); (d.swapped2 = d.swapped2 || []).push(s); });
  return d;
};
const PROT = [[/^hov/, 'hovězí'], [/^kur/, 'kuřecí'], [/^krut/, 'krůtí'], [/^vep/, 'vepřové'], [/^losos/, 'losos'], [/^sardinky/, 'sardinky'], [/^tunak/, 'tuňák'], [/^krevety/, 'krevety']];
const protOf = r => new Set(r.suroviny.map(i => (PROT.find(([rx]) => rx.test(i.surovina)) || [])[1]).filter(Boolean));
const groupOf = kod => kod[0] === 'S' ? 'S' : kod[0] === 'P' ? 'P' : 'H';
function swapWarn(k, s, cand) {
  const c = cyc(k); if (!c || c.before) return []; const day = planDayF(c.w, c.di, k); const R = RX(); const W = [];
  const mine = protOf(cand); Object.entries(day.jidla).forEach(([s2, kod]) => { if (s2 === s || !R[kod]) return; protOf(R[kod]).forEach(p => { if (mine.has(p)) W.push(`${p} už je ${s2 === 'obed' ? 'k obědu' : s2 === 'vecere' ? 'k večeři' : s2 === 'snidane' ? 'ke snídani' : 've svačině'}`); }); });
  if (s === 'svacina' && day.trenink && !['P1', 'P4', 'P5'].includes(cand.kod)) W.push('před tréninkem jen P1, P4 nebo P5');
  if (mine.has('tuňák')) { const mon = dkey(addDays(pdate(k), -dIdx(k))); let n = 0; for (let i = 0; i < 7; i++) { const kk = dkey(addDays(pdate(mon), i)); const cc = cyc(kk); if (!cc || cc.before) continue; const dd = planDayF(cc.w, cc.di, kk); Object.entries(dd.jidla).forEach(([s2, kod]) => { if (kk === k && s2 === s) return; if (R[kod] && protOf(R[kod]).has('tuňák')) n++; }); } if (n) W.push('tuňák už tento týden je (max 1×)'); }
  return W;
}
A['f-swap'] = b => {
  const k = b.dataset.k, s = b.dataset.s; const c = cyc(k); if (!c || c.before) return; const day = planDayF(c.w, c.di, k); const cur = day.jidla[s]; const R = RX();
  const base = _35planDayF(c.w, c.di).jidla[s]; const wasBox = (_35planDayF(c.w, c.di).z_varky || []).includes(s);
  const cands = JD.recepty.filter(r => groupOf(r.kod) === groupOf(cur) && r.kod !== cur).map(r => ({ r, w: swapWarn(k, s, r) })).sort((a, b) => a.w.length - b.w.length);
  sheet(`<h2>Vyměnit ${({ snidane: 'snídani', obed: 'oběd', svacina: 'svačinu', vecere: 'večeři' })[s]}</h2><p class="mut" style="margin:4px 0 0">${flong(k)} · teď ${esc(R[cur].nazev)}</p>
    ${wasBox ? '<p class="whint" style="margin-top:10px">Tohle jídlo je z várky – várku uvaříš stejně, porce půjde do mrazáku.</p>' : ''}
    <div class="list" style="margin-top:14px">${base !== cur ? `<button class="li" data-a="f-swapset" data-k="${k}" data-s="${s}" data-v=""><div class="t"><b>Vrátit původní</b><small>${esc(R[base].nazev)}</small></div></button>` : ''}
    ${cands.map(({ r, w }) => `<button class="li" data-a="f-swapset" data-k="${k}" data-s="${s}" data-v="${r.kod}"><div class="t"><b>${esc(r.nazev)}</b><small>${r0(r.hodnoty_porce.kcal)} kcal · B ${r0(r.hodnoty_porce.bilkoviny_g)} g${w.length ? ` · <span style="color:var(--down)">${esc(w.join(', '))}</span>` : ''}</small></div></button>`).join('')}</div>
    <div class="actions"><button class="btn" data-a="close">Zrušit</button></div>`);
};
A['f-swapset'] = b => { const f = FX(); const k = b.dataset.k; const sw = f.swaps[k] = f.swaps[k] || {}; if (b.dataset.v) sw[b.dataset.s] = b.dataset.v; else delete sw[b.dataset.s]; if (!Object.keys(sw).length) delete f.swaps[k]; save(true); closeSheet(); render(); toast(b.dataset.v ? 'Jídlo vyměněno – nákup upraven' : 'Vráceno'); };
// tlačítko výměny v detailu jídla
const _35fmeal = A['f-meal'];
A['f-meal'] = b => { _35fmeal(b); const k = b.dataset.k; if (!k) return; const act = $('#sheet .actions'); if (act) act.insertAdjacentHTML('afterbegin', `<button class="btn" data-a="f-swap" data-k="${k}" data-s="${b.dataset.s}">Vyměnit jídlo</button>`); };
// nákup: rozdíl kvůli záměnám
CATS.splice(CATS.length - 1, 0, 'Kvůli záměnám');
const _35shopItems = shopItems;
shopItems = function (wi, list) {
  const items = _35shopItems(wi, list); if (list === 'Z') return items; const f = FX(); const R = RX();
  const order = JD.meta.poradi_cyklu || ['A', 'B', 'C']; const w = order[wi % order.length]; const rng = list === 'N1' ? [0, 1, 2] : [3, 4, 5, 6]; const add = {};
  rng.forEach(di => { const k = dkey(addDays(pdate(f.start), wi * 7 + di)); const sw = f.swaps[k]; if (!sw) return; const base = _35planDayF(w, di);
    Object.entries(sw).forEach(([s, kod]) => { const o = R[base.jidla[s]], n = R[kod]; if (!o || !n) return; if (!(base.z_varky || []).includes(s)) o.suroviny.forEach(i => add[i.surovina] = (add[i.surovina] || 0) - i.g); n.suroviny.forEach(i => add[i.surovina] = (add[i.surovina] || 0) + i.g); }); });
  Object.entries(add).forEach(([s, g]) => { if (Math.abs(g) >= 1) items.push({ id: 'sw:' + s, nazev: SUR(s).nazev, mnozstvi: `${g > 0 ? '+' : ''}${g} g`, pozn: g > 0 ? 'kvůli výměně jídla' : 'kvůli výměně – kup o tolik méně', kat: 'Kvůli záměnám' }); });
  return items;
};

// ---------- snědeno ----------
const EAT_ICO = { ok: 'check', jinak: 'x' };
const _35fden = XV['f-den'];
XV['f-den'] = function () {
  let h = _35fden(); const k = view.d || today(); const e = FX().eaten[k] || {};
  h = h.replace(/data-s="(\w+)" data-k="([\d-]+)"><span class="fmt">/g, (m, s, kk) => `${m.slice(0, -18)}<span class="feat ${e[s] || ''}" data-a="f-eat" data-s="${s}" data-k="${kk}" aria-label="Snědeno">${e[s] ? ico(EAT_ICO[e[s]]) : ''}</span><span class="fmt">`);
  const n = Object.values(e).filter(v => v === 'ok').length, j = Object.values(e).filter(v => v === 'jinak').length;
  if (h.includes('class="fmeals"')) h = h.replace('<div class="fmeals">', `<div class="feath"><span>Klepni na kolečko: snědeno ✓, podruhé snědeno jinak ✕</span><b>${n}/4${j ? ` · ${j} jinak` : ''}</b></div><div class="fmeals">`);
  return h;
};
A['f-eat'] = b => { const f = FX(); const k = b.dataset.k, s = b.dataset.s; const e = f.eaten[k] = f.eaten[k] || {}; e[s] = !e[s] ? 'ok' : e[s] === 'ok' ? 'jinak' : undefined; if (!e[s]) delete e[s]; if (!Object.keys(e).length) delete f.eaten[k]; save(); const y = $('#app').scrollTop; render(); $('#app').scrollTop = y; };
// denní záznam v Mírách: „Jídelníček včera dodržen“ se předvyplní ze snědených jídel
const _35mDen = mDen;
mDen = function () {
  const k = view.d || today(); const y = dkey(addDays(pdate(k), -1)); let h = _35mDen(); const e = (S.food && S.food.eaten || {})[y];
  if (e && Object.keys(e).length >= 4 && bf && bf.kind === 'd' && bf.date === k && bf.adherence == null && BD().days[k]?.adherence == null) {
    const j = Object.values(e).filter(v => v === 'jinak').length; bf.adherence = j === 0 ? 'Ano' : j <= 2 ? 'Částečně' : 'Ne'; h = _35mDen();
    h = h.replace('Jídelníček dodržen', 'Jídelníček dodržen <span class="mut" style="font-size:12px;letter-spacing:0;text-transform:none">· podle snědených jídel</span>');
  }
  return h;
};

// ---------- kalibrace: odhad udržovacího příjmu z týdnů 1–3 ----------
function calib() {
  const f = FX(); if (!f.start) return null; const w1 = f.start, w3 = dkey(addDays(pdate(f.start), 14)); if (toU(today()) < toU(w3) + 7 * DMS) return { wait: Math.ceil((toU(w3) + 7 * DMS - toU(today())) / DMS) };
  const a1 = weekAvg(w1), a3 = weekAvg(w3); if (a1.n < 5 || a3.n < 5) return { few: true };
  const stepAt = kk => { let s = JD.meta.vychozi_krok || 0; (f.stepLog || []).forEach(l => { if (l.d <= kk) s = l.to; }); return s; };
  let sum = 0, n = 0, other = 0; for (let i = 7; i < 21; i++) { const kk = dkey(addDays(pdate(f.start), i)); const c = cyc(kk); const d = planDayF(c.w, c.di, kk); sum += dayTotals(d, stepAt(kk)).kcal; n++; other += Object.values(f.eaten[kk] || {}).filter(v => v === 'jinak').length; }
  const intake = sum / n, ch = a3.avg - a1.avg; const maint = Math.round((intake - ch * 7700 / 14) / 50) * 50; const target = maint + 250;
  const best = JD.urovne_prijmu.kroky.reduce((a, b) => Math.abs(b.prumer_den.kcal - target) < Math.abs(a.prumer_den.kcal - target) ? b : a);
  return { intake: Math.round(intake), ch, maint, target, step: best.krok, other };
}
const _35vyvoj = XV['f-vyvoj'];
XV['f-vyvoj'] = function () {
  const h = _35vyvoj(); const c = calib(); const f = FX(); if (!c || f.calibDone) return h;
  const card = c.wait ? `<div class="frec idle"><b>Kalibrace běží</b><span>Týdny 1–3 jez přesně podle plánu a važ se denně. Odhad udržovacího příjmu bude za ${c.wait} ${c.wait < 5 ? 'dny' : 'dní'}.</span></div>`
    : c.few ? `<div class="frec idle"><b>Kalibrace: málo vážení</b><span>V 1. nebo 3. týdnu je méně než 5 vážení, udržovací příjem nejde spočítat.</span></div>`
    : `<div class="frec up"><b>Kalibrace: udržovací příjem ≈ ${thou(c.maint)} kcal</b><span>Průměrný příjem ${thou(c.intake)} kcal, váha ${sg(c.ch, 2)} kg za 14 dní (orientační převod 7 700 kcal/kg).${c.other > 3 ? ` Pozor: ${c.other}× snědeno jinak – odhad je méně přesný.` : ''} Start nabírání ~${thou(c.target)} kcal → krok ${sg(c.step, 0).replace('–', '0')}.</span>
      <div class="two" style="margin-top:12px"><button class="btn white" data-a="f-setstep" data-v="${c.step}">Nastavit krok ${sg(c.step, 0).replace('–', '0')}</button><button class="btn" data-a="f-calok">Skrýt</button></div></div>`;
  return h.replace(/(<\/header>)/, `$1${card}`);
};
A['f-calok'] = () => { FX().calibDone = 1; save(true); render(); };

// ---------- záloha: připomínka a jídelníčky v záloze ----------
const _35vHome = vHome;
vHome = function () {
  const h = _35vHome(); const lb = S.settings.lastBackup; const has = S.sessions.length || (S.food && S.food.start) || Object.keys(BD().days).length;
  if (!has || (lb && Date.now() - lb < 7 * DMS)) return h;
  return h.replace('<div class="hgrid">', `<button class="fban bk" data-a="export"><b>Zálohuj data</b><small>${lb ? `Poslední záloha ${new Date(lb).toLocaleDateString('cs-CZ')}` : 'Zatím žádná záloha'} – všechno je jen v telefonu. Ulož soubor do iCloudu.</small></button><div class="hgrid">`);
};

// ---------- štítky k tréninku ----------
const TAGS = ['Jiný gym', 'Málo času', 'Jiné pořadí', 'Lehčí týden', 'Únava / nemoc'];
const tagChips = s => `<div class="tagbox"><div class="lbl" style="margin:0 2px 8px">Štítky<small> – výkon s nimi se nebere jako stagnace</small></div><div class="chips">${TAGS.map(t => `<button class="chip ${(s.tags || []).includes(t) ? 'on' : ''}" data-a="ses-tag" data-id="${s.id}" data-v="${t}">${t}</button>`).join('')}</div></div>`;
A['ses-tag'] = b => { const s = sesById(b.dataset.id); if (!s) return; s.tags = s.tags || []; const t = b.dataset.v; s.tags = s.tags.includes(t) ? s.tags.filter(x => x !== t) : s.tags.concat(t); if (!s.tags.length) delete s.tags; save(true); b.classList.toggle('on'); };
const _35vFin = vFin;
vFin = function () { const h = _35vFin(); const s = sesById(view.id); if (!s || (view.step || 1) !== 3) return h; return h.replace('<div class="opt">', tagChips(s) + '<div class="opt">'); };
const _35vSummary = vSummary;
vSummary = function () { const h = _35vSummary(); const s = sesById(view.id); if (!s) return h; const i = h.indexOf('<div class="bottom-acts"'); return i < 0 ? h : h.slice(0, i) + tagChips(s) + h.slice(i); };
trendOf = function (exId) {
  const ex = exById(exId); const h = exHistory(exId).filter(x => !(x.s.tags || []).length); const all = exHistory(exId).length;
  if (h.length < 2) return { k: 'na', t: all ? `${all} ${all === 1 ? 'záznam' : 'záznamy'}` : 'bez dat', n: all };
  let stag = 0; for (let i = h.length - 1; i > 0; i--) { if (cmp(h[i].e.sets[0], h[i - 1].e.sets[0], ex) === 'up') break; stag++; }
  if (stag >= 3) return { k: 'down', t: `stagnace ${stag}×`, n: all };
  const l = h.slice(-4); let u = 0, d = 0; for (let i = 1; i < l.length; i++) { const c = cmp(l[i].e.sets[0], l[i - 1].e.sets[0], ex); if (c === 'up') u++; if (c === 'down') d++; }
  return u > d ? { k: 'up', t: 'roste', n: all } : d > u ? { k: 'down', t: 'klesá', n: all } : { k: 'flat', t: 'drží', n: all };
};
perfTrend = function () { const ok = s => !(s.tags || []).length; const lim = Date.now() - 14 * DMS, lim2 = Date.now() - 28 * DMS; const a = finished().filter(s => s.start > lim && ok(s)), b = finished().filter(s => s.start > lim2 && s.start <= lim && ok(s)); const up = x => x.reduce((q, s) => q + stats(s).up, 0); return { now: up(a), prev: up(b), n: a.length }; };

// ---------- sdílení: celý trénink, nebo jeden cvik ----------
const _35story = storySummary;
storySummary = function (s) {
  if (!s) return; const items = s.entries.map((e, i) => ({ e, i, ex: exE(e) })).filter(x => x.ex && x.e.sets.some(st => hasData(st, x.ex)));
  const top = x => { const u = usedSets(x.e, x.ex).filter(st => hasData(st, x.ex)); const t = u.reduce((a, b) => (num(b.w) || 0) > (num(a.w) || 0) ? b : a, u[0]); return t ? `${kg(num(t.w))} kg × ${x.ex.uni ? `${t.l ?? '–'}/${t.r ?? '–'}` : t.reps}` : ''; };
  sheet(`<h2>Co sdílet?</h2><div class="list" style="margin-top:14px">
    <button class="li" data-a="sh-all" data-id="${s.id}"><span class="ic" style="color:var(--hot)">${ico('dumbbell')}</span><div class="t"><b>Celý trénink</b><small>${esc(s.name)} · ${CVK(items.length)}</small></div><span class="chev">${ico('chev')}</span></button>
    <div class="lbl" style="margin:14px 4px 6px">Nebo jeden cvik</div>
    ${items.map(x => `<button class="li" data-a="sh-ex" data-id="${s.id}" data-i="${x.i}"><div class="t"><b>${esc(x.ex.name)}</b><small>${top(x)}${usedSets(x.e, x.ex).some(st => isPR(st, x.ex, bestBefore(x.e.exId, s))) ? ' · rekord' : ''}</small></div><span class="chev">${ico('chev')}</span></button>`).join('')}</div>`);
};
A['sh-all'] = b => { closeSheet(); _35story(sesById(b.dataset.id)); };
A['sh-ex'] = b => { closeSheet(); const s = sesById(b.dataset.id); storyExercise(s, s.entries[+b.dataset.i]); };
