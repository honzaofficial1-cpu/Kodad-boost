
// ===================== v2.23: TÝDENNÍ REPORT (2 obrazovky na screenshot, jen data, žádná doporučení) =====================
const RTAGS = ['slané jídlo', 'pozdní jídlo', 'nemoc', 'volno', 'málo spánku', 'cestování', 'jiné'];
const DT = () => (S.dtags = S.dtags || {});
const dayTags = k => { const t = [...(DT()[k] || [])]; if (S.days?.[k]?.sick && !t.includes('nemoc')) t.push('nemoc'); return t; };
const n1 = v => v == null ? '' : nf(v, 1);
const pct = v => (v > 0 ? '+' : v < 0 ? '−' : '±') + nf(Math.abs(v), 2) + ' %';
const kgS = v => (v > 0 ? '+' : v < 0 ? '−' : '±') + nf(Math.abs(v), 2) + ' kg';
const repMon = () => view.rw || dkey(addDays(monday(new Date()), new Date().getDay() === 0 ? 0 : -7));
const wDays = mon => [...Array(7)].map((_, i) => dkey(addDays(pdate(mon), i)));
function wAvg(mon) { const v = wDays(mon).map(k => BD().days[k]?.weight).filter(x => x != null); return { n: v.length, avg: v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }; }
const stepOn = k => { let s = JD.meta.vychozi_krok || 0; (F().stepLog || []).forEach(l => { if (l.d <= k) s = l.to; }); return s; };
// kroky a dodržení zapsané ráno patří ke dni předtím; spánek k ránu
const nextK = k => dkey(addDays(pdate(k), 1));
const stepsOf = k => BD().days[nextK(k)]?.steps ?? wDay(k)?.steps ?? null;
const sleepOf = k => BD().days[k]?.sleep ?? wDay(k)?.sleepH ?? null;
function planDay(k) { const e = (F().eaten || {})[k]; if (e && Object.keys(e).length >= 4) return Object.values(e).every(v => v === 'ok') ? 'ano' : 'ne'; const a = BD().days[nextK(k)]?.adherence; return a === 'Ano' ? 'ano' : a ? 'ne' : null; }
function bestSetWeek(exId, mon) { const ex = exById(exId); let b = null; finished().filter(s => s.date >= mon && s.date <= dkey(addDays(pdate(mon), 6))).forEach(s => { const e = s.entries.find(x => x.exId === exId); if (!e) return;
  usedSets(e, ex).forEach(st => { if (!hasData(st, ex)) return; const w = num(st.w), r = repsOf(st, ex), v = e1(w, r); if (!b || v > b.v) b = { w, r, v }; }); }); return b; }
function mainEx() { const sel = (S.settings.repEx || []).filter(id => exById(id)); if (sel.length) return sel.slice(0, 3);
  const lim = dkey(addDays(new Date(), -42)); const c = {}; finished().filter(s => s.date >= lim).forEach(s => s.entries.forEach(e => { const ex = exById(e.exId); if (ex && !ex.uni) c[e.exId] = (c[e.exId] || 0) + 1; }));
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]); }

function repWeightChart(mon) {
  const W = [...Array(8)].map((_, i) => { const m = dkey(addDays(pdate(mon), (i - 7) * 7)); return { m, ...wAvg(m) }; }); const P = W.filter(w => w.avg != null);
  if (P.length < 2) return '<p class="rmut">Graf týdenních průměrů se ukáže po 2 týdnech vážení.</p>';
  const w = 340, h = 96, L = 36, R = 10, T = 12, B = 20; let mn = Math.min(...P.map(p => p.avg)), mx = Math.max(...P.map(p => p.avg)); const pad = Math.max(.2, (mx - mn) * .15); mn -= pad; mx += pad;
  const x = i => L + (w - L - R) * i / 7, y = v => T + (h - T - B) * (1 - (v - mn) / (mx - mn));
  const seg = []; let cur = []; W.forEach((p, i) => { if (p.avg == null) { if (cur.length) seg.push(cur); cur = []; } else cur.push([x(i), y(p.avg)]); }); if (cur.length) seg.push(cur);
  const last = W.map((p, i) => [p, i]).filter(([p]) => p.avg != null).pop();
  return `<svg class="rchart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Týdenní průměry váhy za 8 týdnů">
    <line x1="${L}" x2="${w - R}" y1="${y(mx - pad)}" y2="${y(mx - pad)}" class="g"/><line x1="${L}" x2="${w - R}" y1="${y(mn + pad)}" y2="${y(mn + pad)}" class="g"/>
    <text x="${L - 5}" y="${y(mx - pad) + 4}" text-anchor="end">${nf(mx - pad, 1)}</text><text x="${L - 5}" y="${y(mn + pad) + 4}" text-anchor="end">${nf(mn + pad, 1)}</text>
    ${seg.map(s => `<path d="${s.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('')}" class="ln"/>`).join('')}
    ${W.map((p, i) => p.avg == null ? '' : `<circle cx="${x(i)}" cy="${y(p.avg)}" r="${p === last[0] ? 4.5 : 3}" class="pt ${p === last[0] ? 'on' : ''}"/>`).join('')}
    <text x="${x(last[1])}" y="${y(last[0].avg) - 9}" text-anchor="${last[1] > 5 ? 'end' : 'middle'}" class="v">${nf(last[0].avg, 2)}</text>
    ${W.map((p, i) => i % 2 === 1 || i === 7 ? `<text x="${x(i)}" y="${h - 4}" text-anchor="${i === 7 ? 'end' : 'middle'}">${pdate(p.m).getDate()}. ${pdate(p.m).getMonth() + 1}.</text>` : '').join('')}</svg>`;
}

XV['f-report'] = function () {
  const f = F(); const mon = repMon(), sun = dkey(addDays(pdate(mon), 6)), pmon = dkey(addDays(pdate(mon), -7));
  const step = stepOn(sun); const kcal = stepRow(step)?.prumer_den?.kcal; const lastCh = (f.stepLog || []).filter(l => l.d <= sun).pop();
  const head = (pg) => `<div class="rhd"><div><span>Týdenní report${pg ? ` · ${pg}/2` : ''}</span><b>${fday(mon).replace(/^\S+ /, '')} – ${fdate(sun)}</b></div>
    <div class="rhk"><span>Cílový příjem</span><b>${kcal ? thou(kcal) + ' kcal' : '–'}</b><small>krok ${sgn(step)} · změna ${lastCh ? fdate(lastCh.d) : 'zatím žádná'}</small></div></div>`;
  // 1) hmotnost 14 dní
  const days14 = [...wDays(pmon), ...wDays(mon)];
  const rows = days14.map(k => { const w = BD().days[k]?.weight; const t = dayTags(k); return `<button class="rrow ${k < mon ? 'old' : ''}" data-a="rep-tag" data-k="${k}"><span>${DOW[pdate(k).getDay()]} ${pdate(k).getDate()}. ${pdate(k).getMonth() + 1}.</span><b>${w != null ? n1(w) : ''}</b><em>${esc(t.join(', '))}</em></button>`; }).join('');
  // 2) trend
  const A = wAvg(mon), Bp = wAvg(pmon); const d = A.avg != null && Bp.avg != null ? A.avg - Bp.avg : null; const dp = d != null ? d / Bp.avg * 100 : null;
  const H = PH(); const [p0, p1] = (H.pasmo_procent_hmotnosti_za_2_tydny || [0.3, 0.5]).map(v => v / (H.interval_tydnu || 2));
  const z = dp == null ? null : dp < p0 ? 'pod pásmem' : dp > p1 ? 'nad pásmem' : 'v pásmu';
  const page1 = `<section class="rpg">${head(1)}
    <div class="rsec"><div class="rlbl">Hmotnost · posledních 14 dní <i>klepni = poznámka</i></div><div class="rtab"><div class="rth"><span>Datum</span><span>kg</span><span>Poznámka</span></div>${rows}</div></div>
    <div class="rsec rtr"><div class="rlbl">Trend</div>
      <div class="rtg"><div><span>Tento týden</span><b>${A.avg != null ? nf(A.avg, 2) : '–'}<i> kg</i></b><small>${A.n}× váženo</small></div><div><span>Minulý týden</span><b>${Bp.avg != null ? nf(Bp.avg, 2) : '–'}<i> kg</i></b><small>${Bp.n}× váženo</small></div>
        <div><span>Rozdíl</span><b>${d != null ? kgS(d) : '–'}</b><small>${dp != null ? pct(dp) + ' hmotnosti' : ''}</small></div></div>
      <p class="rband">Cílové pásmo ${nf(p0, 2)}–${nf(p1, 2)} % za týden${A.avg ? ` (${nf(A.avg * p0 / 100, 2)}–${nf(A.avg * p1 / 100, 2)} kg)` : ''} · stav: <b class="${z === 'v pásmu' ? 'ok' : ''}">${z || 'málo dat'}</b></p>
      ${repWeightChart(mon)}</div></section>`;
  // 4) týdenní měření
  const M = Object.entries(BD().meas).sort((a, b) => a[0] < b[0] ? -1 : 1); const inW = M.filter(([k]) => k >= mon && k <= sun).pop(); const prevM = f2 => [...M].reverse().find(([k, m]) => k < (inW ? inW[0] : mon) && m[f2] != null);
  const MF = [['waist', 'Pas'], ...MEAS.filter(([k]) => k !== 'waist').map(([k, l]) => [k, l])];
  const mRowsR = inW ? MF.filter(([k]) => inW[1][k] != null).slice(0, 6).map(([k, l]) => { const p = prevM(k); const dd = p ? inW[1][k] - p[1][k] : null; return `<div><span>${l}</span><b>${nf(inW[1][k], 1)} cm</b><small>${dd != null ? (dd > 0 ? '+' : dd < 0 ? '−' : '±') + nf(Math.abs(dd), 1) + ' cm od ' + fday(p[0]).replace(/^\S+ /, '') : 'první měření'}</small></div>`; }).join('') : '';
  const ib = inW && (inW[1].muscle != null || inW[1].bf != null) ? `<div><span>InBody</span><b>${inW[1].muscle != null ? nf(inW[1].muscle, 1) + ' kg svaly' : ''}</b><small>${inW[1].bf != null ? nf(inW[1].bf, 1) + ' % tuku' : ''}</small></div>` : '';
  // 5) kontext
  const wd = wDays(mon); const pd = wd.map(planDay); const onPlan = pd.filter(x => x === 'ano').length, known = pd.filter(x => x).length;
  const dev = wd.map(k => BD().days[nextK(k)]?.deviation).filter(Boolean); const jin = wd.reduce((a, k) => a + Object.values((f.eaten || {})[k] || {}).filter(v => v === 'jinak').length, 0);
  const ss = finished().filter(s => s.date >= mon && s.date <= sun); const up = ss.reduce((a, s) => a + stats(s).up, 0), dn = ss.reduce((a, s) => a + stats(s).down, 0);
  const perf = !ss.length ? '–' : up > dn ? 'lépe' : dn > up ? 'hůř' : 'stejně';
  const exs = mainEx().map(id => { const ex = exById(id); const a = bestSetWeek(id, mon), b = bestSetWeek(id, pmon); const cmp = a && b ? (a.v > b.v + .01 ? 'lépe' : a.v < b.v - .01 ? 'hůř' : 'stejně') : '';
    return `<div class="rex"><span>${esc(ex.name)}</span><b>${a ? `${kg(a.w)} kg × ${a.r}` : '–'}</b><small>${b ? `minule ${kg(b.w)} × ${b.r}` : 'minule –'}${cmp ? ' · ' + cmp : ''}</small></div>`; }).join('');
  const avgOf2 = v => { v = v.filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const st = avgOf2(wd.map(stepsOf)), sl = avgOf2(wd.map(sleepOf)); const wk = f.weeks[mon] || {};
  const sc = (k) => wk[k] != null ? nf(wk[k], 0) : '–';
  const page2 = `<section class="rpg">${head(2)}
    <div class="rsec"><div class="rlbl">Týdenní měření ${inW ? '· ' + fday(inW[0]) : ''}</div>
      ${inW ? `<div class="rmg">${mRowsR}${ib}<div><span>Fotky</span><b>${inW[1].photos || '–'}</b><small>tento týden</small></div></div>` : '<p class="rmut">Tento týden bez měření obvodů.</p>'}</div>
    <div class="rsec"><div class="rlbl">Kontext týdne</div>
      <div class="rkv"><span>Dodržení plánu</span><b>${known ? `${onPlan}/7 dní` : 'nezapsáno'}</b><small>${jin ? `${jin}× jídlo jinak` : ''}${dev.length ? (jin ? ' · ' : '') + 'navíc: ' + esc(dev.join('; ')).slice(0, 110) : (known && onPlan === known && !jin ? 'bez jídla navíc' : '')}</small></div>
      <div class="rkv"><span>Trénink</span><b>${ss.length}× · ${perf}</b><small>${ss.length ? `${up}× zlepšení, ${dn}× zhoršení série` : ''}</small></div>
      ${exs ? `<div class="rexs">${exs}</div>` : ''}
      <div class="r3"><div><span>Kroky / den</span><b>${st != null ? thou(st) : '–'}</b></div><div><span>Spánek</span><b>${sl != null ? nf(sl, 1) + ' h' : '–'}</b></div><div><span>Hlad · trávení · energie</span><b>${sc('hunger')} · ${sc('digest')} · ${sc('energy')}</b><small>škála 1–5</small></div></div>
      <button class="rnote" data-a="rep-note" data-m="${mon}"><span>Poznámka</span><p>${wk.note ? esc(wk.note) : '<i>klepni a napiš pár řádků</i>'}</p></button>
      ${wk.exc ? `<p class="rmut">Týden označený jako výjimka: ${esc(wk.excWhy || '')}</p>` : ''}</div></section>`;
  const ctl = `<div class="rctl"><button class="round" data-a="tab" data-v="f-plan" aria-label="Zavřít">${ico('x')}</button><button class="round" data-a="rep-w" data-v="-7" aria-label="Předchozí týden">${ico('back')}</button>
    <span class="rdots"><i class="on"></i><i></i></span><button class="round" data-a="rep-w" data-v="7" aria-label="Další týden" ${dkey(addDays(pdate(mon), 7)) > today() ? 'disabled' : ''}>${ico('chev')}</button><button class="round" data-a="rep-th" aria-label="Světlý/tmavý"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg></button></div>`;
  return `<div class="rep ${S.settings.repLight ? 'light' : ''}">${ctl}<div class="rcar">${page1}${page2}</div></div>`;
};
A['rep-w'] = b => { view.rw = dkey(addDays(pdate(repMon()), +b.dataset.v)); render(); };
A['rep-th'] = () => { S.settings.repLight = !S.settings.repLight; save(); render(); };
A['rep-tag'] = b => { const k = b.dataset.k; const t = DT()[k] || [];
  sheet(`<h2>${flong(k)}</h2><p class="mut" style="margin:4px 0 12px">Co mohlo ovlivnit váhu ${BD().days[k]?.weight != null ? `(${n1(BD().days[k].weight)} kg)` : ''}</p>
    <div class="chips rtags">${RTAGS.map(x => `<button class="chip ${t.includes(x) || (x === 'nemoc' && S.days?.[k]?.sick) ? 'on' : ''}" data-a="rep-tag2" data-k="${k}" data-v="${x}">${x}</button>`).join('')}</div>
    <div class="actions"><button class="btn white" data-a="close">Hotovo</button></div>`); };
A['rep-tag2'] = b => { const k = b.dataset.k, v = b.dataset.v; const t = DT()[k] = DT()[k] || []; const i = t.indexOf(v); if (i >= 0) t.splice(i, 1); else t.push(v); if (!t.length) delete DT()[k]; b.classList.toggle('on'); save(); };
A['rep-note'] = b => { const m = b.dataset.m; const w = F().weeks[m] || {};
  sheet(`<h2>Poznámka k týdnu</h2><div class="form"><label class="f">Max. pár řádků<textarea id="rep-n" maxlength="240" rows="4">${esc(w.note || '')}</textarea></label></div>
    <div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="rep-note2" data-m="${m}">Uložit</button></div>`); };
A['rep-note2'] = b => { const m = b.dataset.m; const w = F().weeks[m] = F().weeks[m] || {}; w.note = $('#rep-n').value.trim().slice(0, 240); save(true); closeSheet(); render(); };
// tečky stránek a skrytí lišty
const _23render = render;
render = function () { _23render(); const c = $('.rcar'); if (c && !c.dataset.b) { c.dataset.b = 1; const dots = [...document.querySelectorAll('.rdots i')]; c.addEventListener('scroll', () => { const i = Math.round(c.scrollLeft / c.clientWidth); dots.forEach((d, j) => d.classList.toggle('on', j === i)); }, { passive: true }); }
  document.documentElement.classList.toggle('repv', view.n === 'f-report'); };
// výběr hlavních cviků
A['rep-ex'] = () => { const cur = mainEx(); sheet(`<h2>Hlavní cviky v reportu</h2><p class="mut" style="margin:4px 0 12px">Vyber 2–3. Bez výběru se berou nejčastější cviky posledních 6 týdnů.</p>
  <div class="chips">${S.exercises.filter(e => exHistory(e.id).length).map(e => `<button class="chip ${cur.includes(e.id) ? 'on' : ''}" data-a="part-tog" data-v="${e.id}">${esc(e.name)}</button>`).join('')}</div>
  <div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="rep-ex2">Uložit</button></div>`); };
A['rep-ex2'] = () => { S.settings.repEx = $$('#sheet .chip.on').map(x => x.dataset.v).slice(0, 3); save(true); closeSheet(); render(); };
// vstupy: Plán, Vývoj (+ volba cviků), denní záznam (štítky ke dni)
const repBtn = () => `<button class="btn white block" style="margin-top:12px" data-a="tab" data-v="f-report">Týdenní report na screenshot</button>`;
const _23plan = XV['f-plan'];
XV['f-plan'] = function () { return _23plan().replace('<div class="fsec"><div class="lbl">Poslední doporučení</div>', `${repBtn()}<div class="fsec"><div class="lbl">Poslední doporučení</div>`); };
const _23vy = XV['f-vyvoj'];
XV['f-vyvoj'] = function () { return _23vy().replace(/(<div class="two" style="margin-top:18px"><button class="btn" data-a="tab" data-v="mery">)/, `${repBtn()}<button class="btn block" style="margin-top:8px" data-a="rep-ex">Hlavní cviky v reportu</button>$1`); };
const _23mDen = mDen;
mDen = function () { const h = _23mDen(); const k = view.d || today(); const t = dayTags(k);
  return h.replace(/(<button class="sw [^"]*" data-a="b-sick")/, `<div><div class="lbl ml">Co může ovlivnit dnešní váhu</div><div class="chips rtags">${RTAGS.filter(x => x !== 'nemoc').map(x => `<button class="chip ${t.includes(x) ? 'on' : ''}" data-a="rep-tag2" data-k="${k}" data-v="${x}">${x}</button>`).join('')}</div></div>$1`); };
