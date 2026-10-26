
// ===================== v2.22: STATISTIKY TRÉNINKU (strength score · progres cviků · 1RM · partie · push/pull · antagonisté · metriky) =====================
const C_PUSH = '#EE6227', C_PULL = '#4196E8'; // ověřeno validátorem barev (tmavý režim, povrch #141416)
const e1 = (w, r) => w > 0 && r > 0 ? w * (1 + r / 30) : 0; // Epley
const sesE1 = (e, ex) => Math.max(0, ...usedSets(e, ex).filter(st => hasData(st, ex)).map(st => e1(num(st.w), repsOf(st, ex))));
const topW = (e, ex) => Math.max(0, ...usedSets(e, ex).filter(st => hasData(st, ex)).map(st => num(st.w)));
const PER = [['30', '30 dní', 30], ['90', '90 dní', 90], ['365', 'Rok', 365], ['all', 'Vše', 0]];
const stPer = () => PER.find(p => p[0] === (S.settings.stPer || '30')) || PER[0];
function exSeries(exId) { const ex = exById(exId); return exHistory(exId).filter(({ s }) => !(s.tags || []).length).map(({ s, e }) => ({ d: s.date, t: s.start, v: sesE1(e, ex), w: topW(e, ex) })).filter(p => p.v > 0); }
const valAt = (ser, d) => { let v = null; ser.forEach(p => { if (p.d <= d) v = p; }); return v; };
function periodRange() { const [, , n] = stPer(); const fs = finished(); const first = fs.length ? fs[fs.length - 1].date : today(); const from = n ? dkey(addDays(new Date(), -n + 1)) : first; const len = daysBetween(from, today()) + 1; return { from, to: today(), pfrom: dkey(addDays(pdate(from), -len)), pto: dkey(addDays(pdate(from), -1)), len }; }
const inR = (d, a, b) => d >= a && d <= b;

function strength(R) {
  const all = S.exercises.map(ex => ({ ex, ser: exSeries(ex.id) })).filter(x => x.ser.length);
  const score = d => { const v = all.map(x => { const a = valAt(x.ser, d); return a ? a.v / x.ser[0].v * 100 : null; }).filter(x => x != null); return v.length ? { s: v.reduce((a, b) => a + b, 0) / v.length, n: v.length } : null; };
  const dates = [...new Set([R.from, ...finished().map(s => s.date).filter(d => inR(d, R.from, R.to)), R.to])].sort();
  const pts = dates.map(d => ({ d, ...(score(d) || {}) })).filter(p => p.s != null);
  const st = all.map(x => { const now = valAt(x.ser, R.to), base = valAt(x.ser, dkey(addDays(pdate(R.from), -1))) || x.ser.find(p => p.d >= R.from);
    if (!now || !base || now === base) return { ...x, k: 'na', pct: null, now };
    const pct = (now.v - base.v) / base.v * 100; return { ...x, now, pct, k: pct > 1 ? 'up' : pct < -1 ? 'down' : 'flat' }; });
  return { pts, st };
}
function setsIn(a, b) { const out = []; finished().filter(s => inR(s.date, a, b)).forEach(s => s.entries.forEach(e => { const ex = exE(e); if (!ex) return; usedSets(e, ex).forEach(stt => { if (hasData(stt, ex)) out.push({ s, ex: exById(e.exId) || ex, w: num(stt.w), r: repsOf(stt, ex) }); }); })); return out; }
function metrics(a, b) { const ss = finished().filter(s => inR(s.date, a, b)); const min = ss.reduce((x, s) => x + fmin(s.end - s.start), 0); const st = ss.map(stats);
  return { n: ss.length, min, avg: ss.length ? min / ss.length : 0, sets: st.reduce((x, q) => x + q.sets, 0), vol: st.reduce((x, q) => x + q.vol, 0), prs: ss.reduce((x, s) => x + sessionPRs(s).length, 0) }; }
const GRP = { 'Hrudník': 'Hrudník', 'Záda': 'Záda', 'Ramena': 'Ramena', 'Paže': 'Ruce', 'Nohy': 'Nohy', 'Břicho': 'Core' };
function side(ex) { const P = musclesOf(ex).P; if (P.has('chest') || P.has('triceps') || P.has('f:delt')) return 'push'; if (['lats', 'upperBack', 'biceps', 'b:delt', 'traps', 'forearms'].some(k => P.has(k))) return 'pull'; return null; }
const ANT = [['Triceps', ['triceps'], 'Biceps', ['biceps']], ['Hrudník', ['chest'], 'Záda', ['lats', 'upperBack']], ['Přední ramena', ['f:delt'], 'Zadní ramena', ['b:delt']], ['Kvadricepsy', ['quads'], 'Hamstringy', ['hamstrings']]];

// ---------- grafy (ručně, SVG) ----------
function scoreSVG(pts) {
  if (pts.length < 2) return '<p class="mut" style="margin:8px 2px">Graf se ukáže po dvou trénincích v období.</p>';
  const W = 340, H = 180, L = 34, Rr = 10, T = 14, B = 26; const vs = pts.map(p => p.s); let mn = Math.min(100, ...vs), mx = Math.max(100, ...vs); const pad = Math.max(2, (mx - mn) * .2); mn = Math.floor((mn - pad) / 5) * 5; mx = Math.ceil((mx + pad) / 5) * 5;
  const t0 = toU(pts[0].d), t1 = toU(pts[pts.length - 1].d) || t0 + 1; const x = d => L + (W - L - Rr) * ((toU(d) - t0) / Math.max(1, t1 - t0)), y = v => T + (H - T - B) * (1 - (v - mn) / (mx - mn));
  const step = (mx - mn) / 5 <= 2 ? 2 : (mx - mn) / 5 <= 5 ? 5 : 10; const ticks = []; for (let v = Math.ceil(mn / step) * step; v <= mx; v += step) ticks.push(v);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.d).toFixed(1)},${y(p.s).toFixed(1)}`).join('');
  const xt = [pts[0], pts[Math.floor(pts.length / 2)], pts[pts.length - 1]].filter((p, i, a) => a.indexOf(p) === i);
  return `<svg class="stsc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Strength score v čase" data-pts='${JSON.stringify(pts.map(p => [p.d, Math.round(p.s * 10) / 10, +x(p.d).toFixed(1), +y(p.s).toFixed(1)]))}'>
    ${ticks.map(v => `<line x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}" stroke="#26262A"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
    <line x1="${L}" x2="${W - Rr}" y1="${y(100)}" y2="${y(100)}" stroke="#6C6C70" stroke-dasharray="4 4"/><text x="${L + 4}" y="${y(100) + 14}" class="lo">start = 100</text>
    <path d="${line}L${x(pts[pts.length - 1].d)},${H - B}L${x(pts[0].d)},${H - B}Z" fill="var(--hot)" opacity=".1"/>
    <path d="${line}" fill="none" stroke="var(--hot)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(pts[pts.length - 1].d)}" cy="${y(pts[pts.length - 1].s)}" r="4.5" fill="var(--hot)" stroke="#141416" stroke-width="2"/>
    ${xt.map(p => `<text x="${x(p.d)}" y="${H - 6}" text-anchor="middle">${fday(p.d).replace(/^\S+ /, '')}</text>`).join('')}
    <g class="tipg" style="display:none"><line y1="${T}" y2="${H - B}" stroke="#8E8E93"/><circle r="5" fill="var(--hot)" stroke="#141416" stroke-width="2"/><rect rx="8" width="78" height="36" fill="#F5F5F7"/><text class="t1" fill="#555"></text><text class="t2" fill="#111" font-weight="700"></text></g>
  </svg>`;
}
function spark(ser) { const v = ser.slice(-8).map(p => p.v); if (v.length < 2) return '<span class="spk"></span>'; const mn = Math.min(...v), mx = Math.max(...v), r = mx - mn || 1;
  return `<svg class="spk" viewBox="0 0 60 22" aria-hidden="true"><polyline points="${v.map((x, i) => `${(i / (v.length - 1) * 56 + 2).toFixed(1)},${(19 - (x - mn) / r * 16).toFixed(1)}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function radarSVG(G) {
  const keys = Object.keys(G), n = keys.length, cx = 170, cy = 128, R = 78, mx = Math.max(1, ...Object.values(G)); const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const ring = f => keys.map((_, i) => pt(i, R * f).map(v => v.toFixed(1)).join(',')).join(' ');
  const poly = keys.map((k, i) => pt(i, R * Math.max(.04, G[k] / mx)).map(v => v.toFixed(1)).join(',')).join(' ');
  return `<svg class="radar" viewBox="0 0 340 262" role="img" aria-label="Série podle partií">
    ${[1 / 3, 2 / 3, 1].map(f => `<polygon points="${ring(f)}" fill="none" stroke="#2C2C30"/>`).join('')}${keys.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}" stroke="#2C2C30"/>`).join('')}
    <polygon points="${poly}" fill="var(--hot)" fill-opacity=".22" stroke="var(--hot)" stroke-width="2" stroke-linejoin="round"/>
    ${keys.map((k, i) => { const [px, py] = pt(i, R * Math.max(.04, G[k] / mx)); return `<circle cx="${px}" cy="${py}" r="4" fill="var(--hot)" stroke="#141416" stroke-width="2"/>`; }).join('')}
    ${keys.map((k, i) => { const [lx, ly] = pt(i, R + 30); return `<text x="${lx}" y="${ly - 2}" text-anchor="middle" class="rv">${G[k]} sérií</text><text x="${lx}" y="${ly + 13}" text-anchor="middle" class="rl">${k}</text>`; }).join('')}</svg>`;
}
const ratioBar = (a, b, ca = C_PUSH, cb = C_PULL) => { const t = a + b || 1; const pa = Math.round(a / t * 100); return `<div class="rbar" role="img" aria-label="${pa} : ${100 - pa}"><i style="width:calc(${pa}% - 1px);background:${ca}"></i><i style="width:calc(${100 - pa}% - 1px);background:${cb}"></i><b style="left:${pa}%"></b><u></u></div>`; };

// ---------- pohled ----------
vProg = function () {
  const R = periodRange(); const tab = view.tab || 'p'; const [pk, pl] = stPer();
  const seg = `<div class="seg">${[['p', 'Přehled'], ['c', 'Cviky']].map(([v, l]) => `<button data-a="st-tab" data-v="${v}" class="${tab === v ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="chips stper">${PER.map(([k, l]) => `<button class="chip ${k === pk ? 'on' : ''}" data-a="st-per" data-v="${k}">${l}</button>`).join('')}</div>`;
  if (!finished().length) return `<div class="wrap">${hdr(backBtn('gym'), '<h1>Statistiky</h1>', '<span></span>')}<div class="empty"><b>Zatím žádný trénink</b><span>Po prvních trénincích tu uvidíš sílu, progres cviků a vyváženost partií.</span></div></div>${tabs()}`;
  const { pts, st } = strength(R); const has = st.filter(x => x.k !== 'na');
  let body = '';
  if (tab === 'c') {
    const sort = view.sort || 'p'; const L = [...st].sort(sort === 'a' ? (a, b) => a.ex.name.localeCompare(b.ex.name, 'cs') : sort === 'f' ? (a, b) => b.ser.length - a.ser.length : (a, b) => (b.pct ?? -1e9) - (a.pct ?? -1e9));
    const lab = { up: 'Zlepšení', down: 'Zhoršení', flat: 'Stagnace', na: 'Málo dat' };
    body = `<button class="li stcalc" data-a="st-1rm"><span class="ic">${ico('weight')}</span><div class="t"><b>Kalkulačka 1RM</b><small>Odhad maximálky z váhy a opakování</small></div><span class="chev">${ico('chev')}</span></button>
      <div class="sthd"><b>Cviky</b><div class="seg sm">${[['p', 'Progres'], ['a', 'A–Z'], ['f', 'Četnost']].map(([v, l]) => `<button data-a="st-sort" data-v="${v}" class="${sort === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="stlist">${L.map(x => `<button class="stex ${x.k}" data-a="prog-ex" data-id="${x.ex.id}"><span class="t"><b>${esc(x.ex.name)}</b><small><i></i>${lab[x.k]}</small></span>${spark(x.ser)}<span class="v">${x.pct != null ? `<em>${x.pct > 0 ? '+' : x.pct < 0 ? '−' : ''}${nf(Math.abs(x.pct), 1)} %</em>` : ''}<b>${x.now ? kg(x.now.w) : '–'} kg</b></span></button>`).join('')}</div>
      <p class="mut" style="font-size:12px;margin:12px 2px 0">Progres = odhad maximálky (Epley) z nejlepší série, poslední trénink proti začátku období. Tréninky se štítkem se nepočítají. Číslo vpravo = nejtěžší pracovní váha.</p>`;
  } else {
    const L = pts[pts.length - 1], F0 = pts[0]; const ch = L && F0 ? (L.s - F0.s) / F0.s * 100 : null;
    const M = metrics(R.from, R.to), Mp = metrics(R.pfrom, R.pto); const d = (a, b, f = v => thou(v)) => { const x = a - b; return `<em class="${x > 0 ? 'g' : x < 0 ? 'b' : ''}">${x > 0 ? '+' : x < 0 ? '−' : '±'}${f(Math.abs(x))} proti předchozím ${R.len} dnům</em>`; };
    const hm2 = m => `${Math.floor(m / 60)} h ${Math.round(m % 60)} m`;
    const SS = setsIn(R.from, R.to); const G = { 'Hrudník': 0, 'Záda': 0, 'Ramena': 0, 'Ruce': 0, 'Nohy': 0, 'Core': 0 }; SS.forEach(x => { const g = GRP[muscleGroup(x.ex.muscle)]; if (g) G[g]++; });
    const low = Object.entries(G).sort((a, b) => a[1] - b[1])[0];
    const pp = { push: {}, pull: {} }; SS.forEach(x => { const sd = side(x.ex); if (sd) pp[sd][x.ex.name] = (pp[sd][x.ex.name] || 0) + 1; });
    const sum = o => Object.values(o).reduce((a, b) => a + b, 0); const nP = sum(pp.push), nL = sum(pp.pull); const pctP = nP + nL ? Math.round(nP / (nP + nL) * 100) : 50;
    const top = o => { const e = Object.entries(o).sort((a, b) => b[1] - a[1]); const mx = e[0] ? e[0][1] : 1; return e.slice(0, 3).map(([n, c]) => `<div class="ppr"><span>${esc(n)}</span><b>${c}</b><i style="width:${Math.round(c / mx * 100)}%"></i></div>`).join('') + (e.length > 3 ? `<div class="ppr more"><span>+${e.length - 3} dalších</span><b>${e.slice(3).reduce((a, x) => a + x[1], 0)}</b></div>` : ''); };
    const ant = ANT.map(([la, ka, lb, kb]) => { let a = 0, b = 0; SS.forEach(x => { const P = musclesOf(x.ex).P; const fa = ka.some(k => P.has(k)) && !(ka[0] === 'f:delt' && P.has('b:delt')), fb = kb.some(k => P.has(k)) && !(kb[0] === 'b:delt' && P.has('f:delt')); if (fa) a++; if (fb) b++; }); return { la, lb, a, b }; }).filter(x => x.a + x.b);
    const bal = pctP >= 40 && pctP <= 60;
    body = `<div class="stcard"><div class="sthd"><b>Strength score</b></div>
        <div class="stbig"><div><b>${L ? nf(L.s, 1) : '–'}</b>${ch != null ? `<em class="${ch >= 0 ? 'g' : 'b'}">${ch >= 0 ? '↑ +' : '↓ −'}${nf(Math.abs(ch), 1)} % za ${pl.toLowerCase()}</em>` : ''}</div><span><b>${L ? L.n : 0} cviků</b><small>v průměru</small></span></div>
        ${scoreSVG(pts)}
        <p class="stnote">Průměr všech cviků: odhad maximálky proti prvnímu záznamu cviku (první záznam = 100). Klepni do grafu pro hodnotu.</p></div>
      <div class="stcnt"><div><b>${has.filter(x => x.k === 'up').length} <i class="g">↑</i></b><small>cviků se zlepšilo</small></div><div><b>${has.filter(x => x.k === 'flat').length} <i>→</i></b><small>beze změny</small></div><div><b>${has.filter(x => x.k === 'down').length} <i class="b">↓</i></b><small>zhoršení</small></div></div>
      <div class="sthd" style="margin-top:22px"><b>Obecné metriky</b></div>
      <div class="stmet"><div><span>Čas v gymu</span><b>${hm2(M.min)}</b>${d(M.min, Mp.min, hm2)}</div><div><span>Průměrný trénink</span><b>${Math.round(M.avg)} min</b>${d(Math.round(M.avg), Math.round(Mp.avg), v => v + ' min')}</div>
        <div><span>Tréninků</span><b>${M.n}</b>${d(M.n, Mp.n)}</div><div><span>Pracovních sérií</span><b>${thou(M.sets)}</b>${d(M.sets, Mp.sets)}</div>
        <div><span>Objem</span><b>${nf(M.vol / 1000, 1)} t</b>${d(M.vol / 1000, Mp.vol / 1000, v => nf(v, 1) + ' t')}</div><div><span>Rekordy</span><b>${M.prs}</b>${d(M.prs, Mp.prs)}</div></div>
      <div class="sthd" style="margin-top:22px"><b>Zasažené partie</b><small>pracovní série</small></div>
      <div class="stcard">${radarSVG(G)}${SS.length ? `<p class="stwarn">${ico('info')}Nejméně sérií má ${low[0].toLowerCase()} (${low[1]}). Pokud to není záměr, přidej 2–3 série týdně.</p>` : ''}</div>
      <div class="sthd" style="margin-top:22px"><b>Poměr push / pull</b></div>
      <div class="stcard"><div class="pph"><b style="color:${C_PUSH}">${nP}</b><div><b>${pctP} : ${100 - pctP}</b><small>ideál 50 : 50</small><em class="${bal ? 'g' : 'b'}">${bal ? 'Vyvážené' : pctP > 60 ? 'Víc tlaků' : 'Víc tahů'}</em></div><b style="color:${C_PULL}">${nL}</b></div>
        ${ratioBar(nP, nL)}<div class="ppl"><span>Push (tlaky)</span><span>Pull (tahy)</span></div>
        <div class="ppc"><div>${top(pp.push)}</div><div class="pl">${top(pp.pull)}</div></div>
        <p class="stwarn">${ico('info')}Na 1 sérii tlaků aspoň 1 série tahů – chrání ramena. Nohy a core se do poměru nepočítají.</p></div>
      ${ant.length ? `<div class="sthd" style="margin-top:22px"><b>Poměr antagonistů</b></div><div class="stcard">${ant.map(x => `<div class="antr">${ratioBar(x.a, x.b)}<div class="ppl"><span>${x.la} <b>${x.a}×</b></span><span>${x.lb} <b>${x.b}×</b></span></div></div>`).join('')}
        <p class="stwarn">${ico('info')}Protilehlé partie podle počtu sérií. Doporučeno zhruba 50 : 50, nerovnováha nad 60 : 40 stojí za úpravu.</p></div>` : ''}`;
  }
  return `<div class="wrap stv">${hdr(backBtn('gym'), '<h1>Statistiky</h1>', '<span></span>')}${seg}${body}</div>${tabs()}`;
};
A['st-tab'] = b => { view.tab = b.dataset.v; render(); };
A['st-per'] = b => { S.settings.stPer = b.dataset.v; save(); render(); };
A['st-sort'] = b => { view.sort = b.dataset.v; render(); };
// klepnutí do grafu: svislá čára + hodnota nejbližšího bodu
document.addEventListener('pointerdown', ev => { const sv = ev.target.closest('svg.stsc'); if (!sv) return; const P = JSON.parse(sv.dataset.pts || '[]'); if (!P.length) return;
  const r = sv.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width * 340; const p = P.reduce((a, b) => Math.abs(b[2] - x) < Math.abs(a[2] - x) ? b : a);
  const g = sv.querySelector('.tipg'); g.style.display = ''; g.querySelector('line').setAttribute('x1', p[2]); g.querySelector('line').setAttribute('x2', p[2]); const c = g.querySelector('circle'); c.setAttribute('cx', p[2]); c.setAttribute('cy', p[3]);
  const bx = Math.min(340 - 82, Math.max(36, p[2] - 39)), by = Math.max(2, p[3] - 46); const rc = g.querySelector('rect'); rc.setAttribute('x', bx); rc.setAttribute('y', by);
  const t1 = g.querySelector('.t1'), t2 = g.querySelector('.t2'); t1.setAttribute('x', bx + 39); t1.setAttribute('y', by + 14); t1.setAttribute('text-anchor', 'middle'); t1.textContent = fday(p[0]).replace(/^\S+ /, '');
  t2.setAttribute('x', bx + 39); t2.setAttribute('y', by + 30); t2.setAttribute('text-anchor', 'middle'); t2.textContent = nf(p[1], 1); });
// kalkulačka 1RM
A['st-1rm'] = () => { sheet(`<h2>Kalkulačka 1RM</h2><p class="mut" style="margin:4px 0 0">Odhad maximálky na jedno opakování podle Epleyho. Nejpřesnější do 10 opakování.</p>
  <div class="form"><label class="f">Cvik (nepovinné)<select id="rm-ex"><option value="">– zadám ručně –</option>${S.exercises.filter(e => exHistory(e.id).length).map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select></label>
    <div class="two"><label class="f">Váha (kg)<input id="rm-w" inputmode="decimal" placeholder="100"></label><label class="f">Opakování<input id="rm-r" inputmode="numeric" placeholder="5"></label></div></div>
  <div id="rm-out" class="rmout"></div><div class="actions"><button class="btn white" data-a="close">Zavřít</button></div>`); rmCalc(); };
const RMT = [[100, 1], [95, 2], [93, 3], [90, 4], [87, 5], [85, 6], [83, 7], [80, 8], [77, 9], [75, 10], [70, 12], [67, 15]];
function rmCalc() { const o = $('#rm-out'); if (!o) return; const w = num($('#rm-w').value), r = num($('#rm-r').value);
  if (!w || !r) { o.innerHTML = '<p class="mut" style="margin:6px 2px">Vyplň váhu a opakování, nebo vyber cvik – doplní se tvoje nejlepší série.</p>'; return; }
  const m = e1(w, r); const rd = v => Math.round(v * 2) / 2;
  o.innerHTML = `<div class="rmbig"><span>Tvoje maximálka</span><b>${kg(rd(m))}<i> kg</i></b>${r > 10 ? '<small>Nad 10 opakování je odhad méně přesný.</small>' : ''}</div>
    <div class="rmt">${RMT.map(([p, n]) => `<div><span>${p} %</span><b>${kg(rd(m * p / 100))} kg</b><small>~${n} opak.</small></div>`).join('')}</div>`; }
document.addEventListener('input', e => { if (['rm-w', 'rm-r'].includes(e.target.id)) rmCalc(); });
document.addEventListener('change', e => { if (e.target.id !== 'rm-ex' || !e.target.value) return; const ex = exById(e.target.value); let best = null;
  exHistory(ex.id).forEach(({ e: en }) => usedSets(en, ex).forEach(st => { if (!hasData(st, ex)) return; const v = e1(num(st.w), repsOf(st, ex)); if (!best || v > best.v) best = { v, w: num(st.w), r: repsOf(st, ex) }; }));
  if (best) { $('#rm-w').value = kg(best.w); $('#rm-r').value = best.r; } rmCalc(); });
// v gymu: „Progres cviků“ → „Statistiky“
const _22vGym = vGym;
vGym = function () { return _22vGym().replace('<b>Progres cviků</b><small>Grafy, historie, kde stagnuješ', '<b>Statistiky</b><small>Strength score, progres cviků, partie, push/pull'); };
