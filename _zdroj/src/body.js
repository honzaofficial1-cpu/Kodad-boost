// ===================== MÍRY · Deník nabírání =====================
const SCALES = [['sleepQ', 'Kvalita spánku (noc)', '1 špatná · 5 výborná'], ['energy', 'Energie (včera)', '1 vyčerpaný · 5 nabitý'], ['hunger', 'Hlad (včera)', '1 žádný · 3 normál · 5 velký'], ['mood', 'Psychika (včera)', '1 špatná · 5 výborná']];
const MEAS = [['shoulders', 'Ramena', 'nejširší místo přes delty'], ['chest', 'Hrudník', 'přes bradavky, po výdechu'], ['biceps', 'Biceps', 'napnutý, nejširší místo'], ['forearm', 'Předloktí', 'nejširší místo, pěst sevřená'], ['waist', 'Pas', 'v úrovni pupku, nezatahovat'], ['thigh', 'Stehno', 'nejširší místo pod hýždí'], ['calf', 'Lýtko', 'nejširší místo, uvolněně'], ['neck', 'Krk', 'těsně pod ohryzkem']];
const TRAIN = ['Volno', 'Silový', 'Silový + kardio', 'Kardio', 'Thai box', 'Jiné'];
const DMS = 864e5;
const toU = k => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const fromU = t => { const d = new Date(t); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
const avgOf = a => { const b = a.filter(x => x != null && !isNaN(x)); return b.length ? b.reduce((s, x) => s + x, 0) / b.length : null; };
const nf = (v, dec = 1) => v == null || isNaN(v) ? '–' : (Math.abs(v) < Math.pow(10, -dec) / 2 ? 0 : v).toLocaleString('cs-CZ', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const sg = (v, dec) => v == null ? '–' : (v > 0 ? '+' : '') + nf(v, dec);
function BD() { if (!S.body) S.body = { days: {}, meas: {}, settings: {} }; return S.body; }
function bStart() { const b = BD(); if (b.settings.start) return b.settings.start; const k = Object.keys(b.days).filter(k => b.days[k].weight != null).concat(Object.keys(b.meas)).sort(); return k[0] || null; }
const weekNo = (k, st) => Math.floor((toU(k) - toU(st)) / (7 * DMS)) + 1;
// cílové tempo (kg/týden): týden 1–2 adaptace, 3–12: 0,2–0,35, od 13.: 0,115–0,23
function pace(w) { if (w <= 2) return null; if (w <= 12) return [0.2, 0.35]; return [0.115, 0.23]; }
const adhVal = a => a === 'Ano' ? 1 : a === 'Částečně' ? .5 : a === 'Ne' ? 0 : null;
function autoTraining(k) {
  const s = sessionOn(k); const a = actsOn(k);
  const cardio = (s && s.cardio && s.cardio.mode === 'join') || a.some(x => x.type === 'bike');
  if (s && s.end) return cardio ? 'Silový + kardio' : 'Silový';
  if (a.some(x => x.type === 'thai')) return 'Thai box';
  if (cardio) return 'Kardio';
  return null;
}
function bWeeks() {
  const st = bStart(); if (!st) return []; const b = BD(); const W = {};
  for (const [d, v] of Object.entries(b.days)) { const w = weekNo(d, st); if (w < 1) continue; (W[w] = W[w] || { days: [], meas: [] }).days.push({ ...v, date: d }); }
  for (const [d, v] of Object.entries(b.meas)) { const w = weekNo(d, st); if (w < 1) continue; (W[w] = W[w] || { days: [], meas: [] }).meas.push({ ...v, date: d }); }
  return Object.keys(W).map(Number).sort((a, c) => a - c).map(w => {
    const D = W[w].days, M = W[w].meas.sort((a, c) => a.date < c.date ? -1 : 1).pop() || {};
    const ad = D.map(x => adhVal(x.adherence)).filter(x => x != null);
    const r = { w, from: fromU(toU(st) + (w - 1) * 7 * DMS), n: D.filter(x => x.weight != null).length, weight: avgOf(D.map(x => x.weight)), steps: avgOf(D.map(x => x.steps)), sleep: avgOf(D.map(x => x.sleep)), adherence: ad.length ? avgOf(ad) : null, m: M };
    SCALES.forEach(([k]) => r[k] = avgOf(D.map(x => x[k])));
    return r;
  });
}
function weightNear(k) { const t = toU(k); return avgOf(Object.entries(BD().days).filter(([d, v]) => v.weight != null && Math.abs(toU(d) - t) <= 3 * DMS).map(([, v]) => v.weight)); }
function bComp() {
  const H = BD().settings.height || 197;
  return Object.entries(BD().meas).sort((a, c) => a[0] < c[0] ? -1 : 1).map(([date, m]) => {
    const w = weightNear(date); if (w == null) return null;
    let bf = null, src = '';
    if (m.bf != null) { bf = m.bf / 100; src = 'měření'; }
    else if (m.waist != null && m.neck != null && m.waist > m.neck) { bf = (495 / (1.0324 - 0.19077 * Math.log10(m.waist - m.neck) + 0.15456 * Math.log10(H)) - 450) / 100; src = 'odhad'; }
    if (bf == null || bf < .02 || bf > .5) return null;
    return { date, x: toU(date), w, bf, lean: w * (1 - bf), fat: w * bf, muscle: m.muscle ?? null, src };
  }).filter(Boolean);
}
function bVerdict() {
  const full = bWeeks().filter(x => x.weight != null);
  if (full.length < 2) return { ch: null, st: ['idle', 'Málo dat'], w: full.length ? full[full.length - 1].w : null };
  const a = full[full.length - 1], b = full[full.length - 2]; const ch = (a.weight - b.weight) / (a.w - b.w); const t = pace(a.w);
  if (!t) return { ch, st: ['idle', `Týden ${a.w}: adaptace, nehodnotit`], w: a.w };
  if (ch < t[0]) return { ch, st: ['warn', `Pod cílem ${nf(t[0], 2)}–${nf(t[1], 2)}`], w: a.w };
  if (ch > t[1] + .05) return { ch, st: ['bad', `Nad cílem ${nf(t[0], 2)}–${nf(t[1], 2)}`], w: a.w };
  return { ch, st: ['good', 'V cílovém tempu'], w: a.w };
}
function waistDelta() { const M = Object.entries(BD().meas).sort((a, c) => a[0] < c[0] ? -1 : 1).map(([, m]) => m); const f = M.find(m => m.waist != null), l = [...M].reverse().find(m => m.waist != null); return f && l && f !== l ? l.waist - f.waist : null; }
// upozornění: hodnotí jen dokončené týdny se ≥4 váženími
function bAlerts() {
  const out = []; const st = bStart(); if (!st) return out;
  const cur = weekNo(today(), st);
  const W = bWeeks().filter(w => w.w < cur && w.weight != null);
  const ev = [];
  for (let i = 1; i < W.length; i++) { const a = W[i], b = W[i - 1]; const t = pace(a.w); if (!t || a.n < 4 || b.n < 4) continue; const ch = (a.weight - b.weight) / (a.w - b.w); ev.push({ w: a.w, k: ch < t[0] ? 'under' : ch > t[1] + .05 ? 'over' : 'ok', ch, t }); }
  const l2 = ev.slice(-2);
  if (l2.length === 2 && l2.every(e => e.k === 'under')) out.push(['warn', `2 týdny po sobě pod cílovým tempem (${sg(l2[0].ch, 2)} a ${sg(l2[1].ch, 2)} kg). Je čas upravit jídelníček – napiš Claudovi.`]);
  else if (l2.length === 2 && l2.every(e => e.k === 'over')) out.push(['warn', `2 týdny po sobě nad cílovým tempem (${sg(l2[0].ch, 2)} a ${sg(l2[1].ch, 2)} kg). Hrozí zbytečný tuk – zvaž úpravu jídelníčku.`]);
  else if (l2.length && l2[l2.length - 1].k !== 'ok') out.push(['idle', `Týden ${l2[l2.length - 1].w} mimo cílové tempo. Jeden týden nic neznamená, sleduj další.`]);
  const lastW = bWeeks().find(w => w.w === cur - 1);
  if (lastW && lastW.n < 4 && cur > 1) out.push(['idle', `Minulý týden jen ${lastW.n} vážení – hodnocení tempa není spolehlivé (ideálně 5–7).`]);
  const wd = waistDelta(); if (wd != null && wd >= 4) out.push(['bad', `Pas ${sg(wd, 1)} cm od startu. Signál k udržovací fázi.`]);
  const lm = Object.keys(BD().meas).sort().pop();
  if (lm && (toU(today()) - toU(lm)) / DMS >= 7) out.push(['idle', `Poslední míry ${fday(lm)}. Je čas na týdenní měření.`]);
  return out;
}

// ---------- views ----------
let bf = null; // rozpracovaný formulář
function vMery() {
  const t = view.t || 'den';
  const tabsH = `<div class="seg mtabs">${[['den', 'Den'], ['miry', 'Míry'], ['grafy', 'Grafy'], ['hist', 'Historie']].map(([k, l]) => `<button data-a="mtab" data-v="${k}" class="${t === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const body = t === 'den' ? mDen() : t === 'miry' ? mMiry() : t === 'grafy' ? mGrafy() : mHist();
  return `<div class="wrap">${hdr(backBtn('home'), '<h1>Míry</h1>', `<span></span>`)}
    ${mTiles()}${bAlerts().map(([c, x]) => `<div class="alert ${c}">${esc(x)}</div>`).join('')}
    ${tabsH}${body}</div>${tabs()}`;
}
function mTiles() {
  const days = Object.entries(BD().days).filter(([, d]) => d.weight != null);
  const last7 = days.filter(([k]) => toU(k) > toU(today()) - 7 * DMS);
  const a7 = avgOf(last7.map(([, d]) => d.weight));
  const v = bVerdict(); const wd = waistDelta(); const C = bComp(); const lc = C[C.length - 1];
  const ad7 = Object.entries(BD().days).filter(([k]) => toU(k) > toU(today()) - 7 * DMS).map(([, d]) => adhVal(d.adherence)).filter(x => x != null);
  const st = bStart();
  const tile = (k, val, u, n) => `<div class="mtile"><span>${k}</span><b>${val}${u ? `<small>${u}</small>` : ''}</b><em>${n}</em></div>`;
  return `<div class="mtiles">
    ${tile('Průměr 7 dní', a7 == null ? '–' : nf(a7, 1), ' kg', last7.length ? `${last7.length} vážení` : 'zatím bez vážení')}
    ${tile('Změna za týden', v.ch == null ? '–' : sg(v.ch, 2), ' kg', `<i class="stp ${v.st[0]}">${v.st[1]}</i>`)}
    ${tile('Pas od startu', wd == null ? '–' : sg(wd, 1), ' cm', wd != null && wd >= 4 ? '<i class="stp bad">Zvaž udržovačku</i>' : lc ? `${lc.src === 'měření' ? 'tuk' : 'odhad tuku'} ${nf(lc.bf * 100, 1)} %` : 'po 2 měřeních')}
    ${tile('Dodržení 7 dní', ad7.length ? Math.round(avgOf(ad7) * 100) : '–', ad7.length ? ' %' : '', st ? `týden ${weekNo(today(), st)} od startu` : 'start = první záznam')}
  </div>`;
}
function mDen() {
  const k = view.d || today(); const d = BD().days[k] || {};
  if (!bf || bf.kind !== 'd' || bf.date !== k) { bf = { kind: 'd', date: k, adherence: d.adherence ?? null }; SCALES.forEach(([s]) => bf[s] = d[s] ?? null); }
  const auto = autoTraining(k); const sick = !!S.days[k]?.sick;
  const segH = (f, opts, cls = '') => `<div class="seg ${cls}" data-bseg="${f}">${opts.map(o => `<button data-a="bseg" data-f="${f}" data-v="${o}" class="${String(bf[f]) === String(o) ? 'on' : ''}">${o}</button>`).join('')}</div>`;
  return `<div class="card mform">
    <div class="mh"><h2>Denní záznam</h2>${BD().days[k] ? '<span class="chip prog">uloženo</span>' : ''}</div>
    <p class="mut hint">Vyplň ráno: váha po WC nalačno, spánek za noc a jak proběhl včerejšek. Nic není povinné, trénink se bere z appky.</p>
    <div class="form">
      <div class="two"><label class="f">Datum<input id="b-date" type="date" value="${k}"></label><label class="f">Ranní váha (kg)<input id="b-weight" class="bigin" inputmode="decimal" value="${kg(d.weight)}" placeholder="88,4"></label></div>
      <div class="two"><label class="f">Kroky<input id="b-steps" inputmode="numeric" value="${d.steps ?? ''}" placeholder="11000"></label><label class="f">Spánek (h)<input id="b-sleep" inputmode="decimal" value="${kg(d.sleep)}" placeholder="7,5"></label></div>
      <button class="sw ${sick ? 'on' : ''}" data-a="b-sick" data-k="${k}"><span>Nemoc<small>Označí den v kalendáři</small></span><span class="k"></span></button>
      ${SCALES.map(([f, l, leg]) => `<div><div class="ml scl"><span>${l}</span><small>${leg}</small></div>${segH(f, [1, 2, 3, 4, 5])}</div>`).join('')}
      <div><div class="lbl ml">Jídelníček včera dodržen</div>${segH('adherence', ['Ano', 'Částečně', 'Ne'])}</div>
      <label class="f">Co bylo včera jinak<textarea id="b-dev" placeholder="např. oběd v restauraci místo chilli">${esc(d.deviation || '')}</textarea></label>
      <label class="f">Poznámka<textarea id="b-note" placeholder="jak ses cítil, spánek…">${esc(d.note || '')}</textarea></label>
    </div>
    <div class="bottom-acts" style="margin-top:18px"><button class="pill white" data-a="b-save-day">Uložit den</button>${BD().days[k] ? `<button class="btn danger block" data-a="b-del-day" data-k="${k}">Smazat záznam</button>` : ''}</div>
  </div>`;
}
function mMiry() {
  const k = view.md || today(); const m = BD().meas[k] || {}; const s = BD().settings;
  if (!bf || bf.kind !== 'm' || bf.date !== k) bf = { kind: 'm', date: k, photos: m.photos ?? null };
  return `<div class="card mform">
    <div class="mh"><h2>Týdenní míry</h2>${BD().meas[k] ? '<span class="chip prog">uloženo</span>' : ''}</div>
    <p class="mut hint">1× týdně, stejný den ráno nalačno. Metr přiložit, nezařezávat. Pravá strana těla.</p>
    <div class="form">
      <label class="f">Datum<input id="m-date" type="date" value="${k}"></label>
      <div class="two">${MEAS.map(([f, l, h]) => `<label class="f">${l} (cm)<input id="m-${f}" inputmode="decimal" value="${kg(m[f])}"><small class="mut">${h}</small></label>`).join('')}</div>
      <div><div class="lbl ml">Fotky pořízené (každé 2 týdny)</div><div class="seg" data-bseg="photos">${['Ano', 'Ne'].map(o => `<button data-a="bseg" data-f="photos" data-v="${o}" class="${bf.photos === o ? 'on' : ''}">${o}</button>`).join('')}</div></div>
      <details class="dt" ${m.muscle != null || m.bf != null || m.bmi != null ? 'open' : ''}><summary>Měření u fyzia (InBody / DEXA)</summary>
        <div class="three" style="margin-top:12px"><label class="f">Svaly (kg)<input id="m-muscle" inputmode="decimal" value="${kg(m.muscle)}"></label><label class="f">Tuk (%)<input id="m-bf" inputmode="decimal" value="${kg(m.bf)}"></label><label class="f">BMI<input id="m-bmi" inputmode="decimal" value="${kg(m.bmi)}"></label></div></details>
      <label class="f">Jak se cítím za celý týden<textarea id="m-feel">${esc(m.feel || '')}</textarea></label>
    </div>
    <div class="bottom-acts" style="margin-top:18px"><button class="pill white" data-a="b-save-meas">Uložit míry</button>${BD().meas[k] ? `<button class="btn danger block" data-a="b-del-meas" data-k="${k}">Smazat míry</button>` : ''}</div>
  </div>
  <div class="card mform" style="margin-top:14px"><h2>Nastavení</h2><p class="mut hint">Start určuje číslování týdnů a cílové tempo. Prázdný = první den se záznamem. Výška slouží k odhadu tuku.</p>
    <div class="two form"><label class="f">Start objemu<input id="s-start" type="date" value="${s.start || ''}"></label><label class="f">Výška (cm)<input id="s-height" inputmode="decimal" value="${kg(s.height)}" placeholder="197"></label></div>
    <p class="mut" style="font-size:13px;margin:12px 2px 0">Cílové tempo: týden 1–2 adaptace, 3–12 +0,20–0,35 kg/týden, od 13. +0,115–0,23 kg/týden. Pas +4 cm od startu = signál k udržovací fázi.</p>
    <div class="bottom-acts" style="margin-top:14px"><button class="btn block" data-a="b-save-set">Uložit nastavení</button></div></div>`;
}
function lineChart(o) {
  const W = 340, H = o.h || 220, L = 40, R = 12, T = 14, B = 28;
  const all = o.series.flatMap(s => s.pts).concat(o.band ? o.band.flatMap(b => [{ x: b.x, y: b.lo }, { x: b.x, y: b.hi }]) : []);
  if (!all.length) return '';
  let x0 = Math.min(...all.map(p => p.x)), x1 = Math.max(...all.map(p => p.x)); if (x1 === x0) { x0 -= 3 * DMS; x1 += 3 * DMS; }
  let y0 = o.y0 ?? Math.min(...all.map(p => p.y)), y1 = o.y1 ?? Math.max(...all.map(p => p.y));
  if (o.y0 == null) { const p = (y1 - y0) * .12 || .5; y0 -= p; y1 += p; }
  const sx = x => L + (x - x0) / (x1 - x0) * (W - L - R), sy = y => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
  const raw = (y1 - y0) / 4; const p10 = Math.pow(10, Math.floor(Math.log10(raw || 1))); const step = [1, 2, 2.5, 5, 10].map(m => m * p10).find(v => raw <= v) || 10 * p10;
  let g = '';
  for (let v = Math.ceil(y0 / step) * step; v <= y1 + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${sy(v)}" y2="${sy(v)}" stroke="#2E2E31"/><text x="${L - 6}" y="${sy(v) + 4}" text-anchor="end">${o.fmtY ? o.fmtY(v) : nf(v, step < 1 ? 1 : 0)}</text>`;
  g += `<text x="${L}" y="${H - 6}" text-anchor="start">${fday(fromU(x0))}</text><text x="${W - R}" y="${H - 6}" text-anchor="end">${fday(fromU(x1))}</text>`;
  if (o.band && o.band.length > 1) g += `<polygon points="${o.band.map(b => `${sx(b.x)},${sy(b.hi)}`).join(' ')} ${[...o.band].reverse().map(b => `${sx(b.x)},${sy(b.lo)}`).join(' ')}" fill="var(--done)" fill-opacity=".14"/>`;
  for (const s of o.series) {
    if (s.line && s.pts.length > 1) g += `<polyline fill="none" stroke="${s.c}" stroke-width="${s.w || 2.6}" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? 'stroke-dasharray="5 4"' : ''} points="${s.pts.map(p => `${sx(p.x)},${sy(p.y)}`).join(' ')}"/>`;
    if (s.dots) for (const p of s.pts) g += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${s.r || 3}" fill="${s.c}" fill-opacity="${s.op ?? 1}"/>`;
  }
  const leg = o.series.filter(s => s.name).map(s => `<span><u style="background:${s.c}"></u>${s.name}</span>`).join('') + (o.band ? '<span><u style="background:var(--done);opacity:.4"></u>cílové tempo</span>' : '');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}">${g}</svg><div class="legend" style="margin-top:10px">${leg}</div>`;
}
function mGrafy() {
  const b = BD(); const st = bStart();
  const days = Object.entries(b.days).filter(([, d]) => d.weight != null).sort((a, c) => a[0] < c[0] ? -1 : 1);
  const pts = days.map(([k, d]) => ({ x: toU(k), y: d.weight }));
  const roll = pts.map(p => ({ x: p.x, y: avgOf(pts.filter(q => q.x <= p.x && q.x > p.x - 7 * DMS).map(q => q.y)) }));
  let band = null;
  if (st && pts.length) { const s0 = toU(st); const w2 = roll.filter(p => p.x >= s0 + 7 * DMS && p.x < s0 + 14 * DMS); if (w2.length) { const base = w2[w2.length - 1]; band = []; let lo = base.y, hi = base.y; const xEnd = Math.max(pts[pts.length - 1].x, s0 + 21 * DMS); for (let x = s0 + 14 * DMS, i = 0; x <= xEnd + 1; x += 7 * DMS, i++) { band.push({ x, lo, hi }); const t = pace(3 + i) || [0, 0]; lo += t[0]; hi += t[1]; } } }
  const card = (t, hint, html) => `<div class="card mchart"><h2>${t}</h2><p class="mut hint">${hint}</p>${html}</div>`;
  const C = bComp(); const M = Object.entries(b.meas).sort((a, c) => a[0] < c[0] ? -1 : 1);
  const comp = C.length >= 2 ? (() => { const c0 = C[0]; const ser = [{ pts: C.map(c => ({ x: c.x, y: c.lean - c0.lean })), line: true, dots: true, c: 'var(--done)', name: 'Beztuková hmota' }, { pts: C.map(c => ({ x: c.x, y: c.fat - c0.fat })), line: true, dots: true, c: 'var(--heat)', name: 'Tuk' }]; const mu = C.filter(c => c.muscle != null); if (mu.length >= 2) ser.push({ pts: mu.map(c => ({ x: c.x, y: c.muscle - mu[0].muscle })), line: true, dots: true, dash: true, c: 'var(--ice)', name: 'Svaly InBody' }); const l = C[C.length - 1]; return lineChart({ label: 'Složení přírůstku', series: ser, fmtY: v => (v > .04 ? '+' : '') + nf(v, 1) }) + `<p class="mut" style="font-size:13px;margin:8px 0 0">Poslední ${l.src}: ${nf(l.bf * 100, 1)} % tuku, beztuková hmota ${nf(l.lean, 1)} kg.</p>`; })() : '<p class="mut">Ukáže se po dvou měřeních s krkem a pasem (a vážením kolem stejného dne).</p>';
  const wp = M.filter(([, m]) => m.waist != null).map(([k, m]) => ({ x: toU(k), y: m.waist })), sp = M.filter(([, m]) => m.shoulders != null).map(([k, m]) => ({ x: toU(k), y: m.shoulders }));
  const cols = ['var(--heat)', '#AE95E0', '#E07FA0', '#89A9DB', 'var(--prog)', 'var(--done)', '#CDBB5E', '#8E8E93'];
  const ds = []; MEAS.forEach(([f, l], i) => { const a = M.filter(([, m]) => m[f] != null); if (a.length >= 2) { const b0 = a[0][1][f]; ds.push({ pts: a.map(([k, m]) => ({ x: toU(k), y: m[f] - b0 })), line: true, dots: true, c: cols[i], name: l }); } });
  const W = bWeeks().filter(w => w.energy != null || w.adherence != null);
  const feel = W.length >= 2 ? (() => { const x = w => toU(w.from) + 3 * DMS; const fs = [['energy', 'Energie', 'var(--done)'], ['mood', 'Psychika', '#AE95E0'], ['sleepQ', 'Spánek', 'var(--ice)'], ['hunger', 'Hlad', 'var(--heat)']].map(([k, n, c]) => ({ pts: W.filter(w => w[k] != null).map(w => ({ x: x(w), y: w[k] })), line: true, dots: true, c, name: n })); fs.push({ pts: W.filter(w => w.adherence != null).map(w => ({ x: x(w), y: 1 + 4 * w.adherence })), line: true, dash: true, c: '#8E8E93', name: 'Dodržení (100 % = 5)', w: 2 }); return lineChart({ label: 'Týdenní pocity', series: fs, y0: 1, y1: 5 }); })() : '<p class="mut">Ukáže se po dvou týdnech záznamů.</p>';
  return card('Váha', 'Body = jednotlivá vážení, čára = 7denní průměr. Zelený pás = cílové tempo od 3. týdne.', pts.length >= 2 ? lineChart({ label: 'Ranní váha', series: [{ pts, dots: true, c: 'var(--prog)', op: .35, r: 2.6 }, { pts: roll, line: true, c: 'var(--prog)', name: '7denní průměr (kg)' }], band }) : '<p class="mut">Graf se ukáže po dvou váženích.</p>')
    + card('Z čeho je přírůstek', 'Odhad US Navy z krku, pasu a výšky (±3–4 % tuku) – sleduj trend. InBody/DEXA má přednost.', comp)
    + card('Pas a ramena', 'Ramena rostou rychleji než pas = kvalitní nabírání. Pas +4–5 cm od startu = udržovačka.', wp.length + sp.length >= 2 ? lineChart({ label: 'Pas a ramena', series: [{ pts: sp, line: true, dots: true, c: 'var(--heat)', name: 'Ramena (cm)' }, { pts: wp, line: true, dots: true, c: 'var(--prog)', name: 'Pas (cm)' }] }) : '<p class="mut">Ukáže se po dvou měřeních.</p>')
    + card('Obvody – změna od startu', 'Centimetry navíc proti prvnímu měření.', ds.length ? lineChart({ label: 'Změna obvodů', series: ds, fmtY: v => (v > .04 ? '+' : '') + nf(v, 1) }) : '<p class="mut">Ukáže se po dvou měřeních.</p>')
    + card('Pocity a dodržení jídelníčku', 'Týdenní průměry škál 1–5 a podíl dodržených dnů.', feel);
}
function mHist() {
  const W = bWeeks().slice().reverse(); const b = BD();
  const M = Object.entries(b.meas).sort((a, c) => a[0] < c[0] ? 1 : -1); const D = Object.entries(b.days).sort((a, c) => a[0] < c[0] ? 1 : -1);
  return `<div class="bottom-acts" style="margin-bottom:14px"><button class="pill dark" data-a="b-copy">${ico('share')} Zkopírovat přehled pro Clauda</button></div>
  <div class="card mchart"><h2>Po týdnech</h2>${W.length ? `<div class="tw"><table><thead><tr><th>Týden</th><th>Od</th><th>Ø váha</th><th>Změna</th><th>Vážení</th><th>Pas</th><th>Dodržení</th><th>Energie</th><th>Spánek</th><th>Kroky</th></tr></thead><tbody>${W.map((w, i) => { const p = W[i + 1]; const ch = w.weight != null && p && p.weight != null ? w.weight - p.weight : null; const t = pace(w.w); const cl = ch == null || !t ? '' : ch < t[0] ? 'warn' : ch > t[1] + .05 ? 'bad' : 'good'; return `<tr><td>${w.w}</td><td>${fday(w.from)}</td><td>${nf(w.weight, 2)}</td><td class="${cl}">${sg(ch, 2)}</td><td>${w.n}</td><td>${nf(w.m.waist, 1)}</td><td>${w.adherence == null ? '–' : Math.round(w.adherence * 100) + ' %'}</td><td>${nf(w.energy, 1)}</td><td>${w.sleep == null ? '–' : nf(w.sleep, 1) + ' h'}</td><td>${w.steps == null ? '–' : thou(w.steps)}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="mut">Zatím žádný týden.</p>'}</div>
  <div class="card mchart"><h2>Míry</h2>${M.length ? `<div class="tw"><table><thead><tr><th>Datum</th>${MEAS.map(m => `<th>${m[1]}</th>`).join('')}<th>R : P</th></tr></thead><tbody>${M.map(([k, m]) => `<tr data-a="b-open-meas" data-k="${k}"><td>${fday(k)}</td>${MEAS.map(([f]) => `<td>${nf(m[f], 1)}</td>`).join('')}<td>${m.shoulders && m.waist ? nf(m.shoulders / m.waist, 3) : '–'}</td></tr>`).join('')}</tbody></table></div><p class="mut" style="font-size:13px;margin:8px 0 0">Klepnutím na řádek ho upravíš.</p>` : '<p class="mut">Zatím žádné míry.</p>'}</div>
  <div class="card mchart"><h2>Dny</h2>${D.length ? `<div class="list">${D.map(([k, d]) => `<button class="li" style="background:var(--card2)" data-a="b-open-day" data-k="${k}"><div class="t"><b>${fday(k)} · ${d.weight != null ? nf(d.weight, 1) + ' kg' : 'bez vážení'}</b><small>${[autoTraining(dkey(addDays(pdate(k), -1))) && 'včera ' + autoTraining(dkey(addDays(pdate(k), -1))).toLowerCase(), d.adherence ? 'jídelníček: ' + d.adherence : '', d.energy ? 'energie ' + d.energy : '', d.sleep != null ? nf(d.sleep, 1) + ' h spánku' : ''].filter(Boolean).join(' · ') || '–'}</small></div><span class="chev">${ico('chev')}</span></button>`).join('')}</div>` : '<p class="mut">Zatím žádné dny. Začni ráno vážením v záložce Den.</p>'}</div>`;
}
function claudeSummary() {
  const b = BD(); const W = bWeeks(); const v = bVerdict(); const wd = waistDelta(); const C = bComp();
  const L = [`DENÍK NABÍRÁNÍ – přehled ${fdate(today())}`, `Start: ${bStart() ? fdate(bStart()) : '–'} · výška ${b.settings.height || 197} cm`, `Aktuální tempo: ${sg(v.ch, 2)} kg/týden (${v.st[1]})`, `Pas od startu: ${sg(wd, 1)} cm`];
  if (C.length) L.push(`Tuk: ${nf(C[C.length - 1].bf * 100, 1)} % (${C[C.length - 1].src})`);
  L.push('', 'TÝDNY (týden | Ø váha | vážení | dodržení | energie | spánek h | kroky):');
  W.slice(-8).forEach(w => L.push(`${w.w} | ${nf(w.weight, 2)} | ${w.n} | ${w.adherence == null ? '–' : Math.round(w.adherence * 100) + ' %'} | ${nf(w.energy, 1)} | ${nf(w.sleep, 1)} | ${w.steps == null ? '–' : Math.round(w.steps)}`));
  const M = Object.entries(b.meas).sort((a, c) => a[0] < c[0] ? -1 : 1).slice(-4);
  if (M.length) { L.push('', 'MÍRY (cm):'); M.forEach(([k, m]) => L.push(`${fday(k)}: ` + MEAS.map(([f, l]) => m[f] != null ? `${l} ${nf(m[f], 1)}` : null).filter(Boolean).join(', ') + (m.feel ? ` · pocit: ${m.feel}` : ''))); }
  const D = Object.entries(b.days).sort((a, c) => a[0] < c[0] ? -1 : 1).slice(-7).filter(([, d]) => d.deviation || d.note);
  if (D.length) { L.push('', 'POZNÁMKY (posledních 7 dní):'); D.forEach(([k, d]) => L.push(`${fday(k)}: ${[d.deviation && 'jinak: ' + d.deviation, d.note].filter(Boolean).join(' · ')}`)); }
  const fs = finished().filter(s => toU(s.date) > toU(today()) - 7 * DMS);
  if (fs.length) L.push('', `TRÉNINKY za 7 dní: ${fs.map(s => `${s.name} ${fmin(s.end - s.start)} min`).join(', ')}`);
  return L.join('\n');
}
function readDayForm() {
  const k = $('#b-date').value || today(); const o = {};
  const w = num($('#b-weight').value), st = num($('#b-steps').value), sl = num($('#b-sleep').value);
  if (w != null) { if (w < 40 || w > 200) { toast('Váha mimo rozsah 40–200 kg'); return null; } o.weight = Math.round(w * 10) / 10; }
  if (st != null) o.steps = Math.round(st); if (sl != null) o.sleep = sl;
  ['adherence', ...SCALES.map(s => s[0])].forEach(f => { if (bf[f] != null) o[f] = bf[f]; });
  const dev = $('#b-dev').value.trim(), note = $('#b-note').value.trim(); if (dev) o.deviation = dev; if (note) o.note = note;
  return { k, o };
}
Object.assign(A, {
  measures: () => go('mery', { t: 'den' }),
  mtab: b => { bf = null; go('mery', { t: b.dataset.v, d: view.d, md: view.md }); },
  bseg: b => { const f = b.dataset.f; let v = b.dataset.v; if (/^\d$/.test(v)) v = +v; bf[f] = bf[f] === v ? null : v; b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', String(bf[f]) === x.dataset.v)); },
  'b-sick': b => { const k = b.dataset.k; const d = S.days[k] = S.days[k] || {}; d.sick = !d.sick; save(true); b.classList.toggle('on', d.sick); },
  'b-save-day': () => { const r = readDayForm(); if (!r) return; if (!Object.keys(r.o).length) return toast('Vyplň aspoň jednu hodnotu'); r.o.savedAt = Date.now(); BD().days[r.k] = r.o; save(true); bf = null; render(); toast('Den uložen'); },
  'b-del-day': b => { delete BD().days[b.dataset.k]; save(true); bf = null; render(); toast('Záznam smazán'); },
  'b-save-meas': () => {
    const k = $('#m-date').value || today(); const o = {};
    for (const [f, l] of MEAS) { const v = num($('#m-' + f).value); if (v != null) { if (v < 10 || v > 250) return toast(`Zkontroluj míru: ${l}`); o[f] = v; } }
    const mu = num($('#m-muscle').value), fat = num($('#m-bf').value), bmi = num($('#m-bmi').value);
    if (mu != null) o.muscle = mu; if (fat != null) { if (fat < 2 || fat > 50) return toast('Tuk mimo rozsah 2–50 %'); o.bf = fat; } if (bmi != null) o.bmi = bmi;
    const fe = $('#m-feel').value.trim(); if (fe) o.feel = fe; if (bf.photos) o.photos = bf.photos;
    if (!Object.keys(o).length) return toast('Vyplň aspoň jednu míru');
    o.savedAt = Date.now(); BD().meas[k] = o; save(true); bf = null; render(); toast('Míry uloženy');
  },
  'b-del-meas': b => { delete BD().meas[b.dataset.k]; save(true); bf = null; render(); toast('Míry smazány'); },
  'b-save-set': () => { const s = BD().settings; const st = $('#s-start').value; const h = num($('#s-height').value); if (st) s.start = st; else delete s.start; if (h != null) s.height = h; else delete s.height; save(true); render(); toast('Nastavení uloženo'); },
  'b-open-day': b => { bf = null; go('mery', { t: 'den', d: b.dataset.k }); },
  'b-open-meas': b => { bf = null; go('mery', { t: 'miry', md: b.dataset.k }); },
  'b-copy': async () => { const txt = claudeSummary(); try { await navigator.clipboard.writeText(txt); toast('Zkopírováno – vlož to Claudovi'); } catch (e) { sheet(`<h2>Přehled pro Clauda</h2><p class="mut">Označ text a zkopíruj ho.</p><textarea class="inp" style="min-height:300px;font-size:13px" readonly>${esc(txt)}</textarea>`); } },
});
document.addEventListener('change', e => {
  if (view.n !== 'mery') return;
  if (e.target.id === 'b-date') { bf = null; go('mery', { t: 'den', d: e.target.value || today(), md: view.md }); }
  if (e.target.id === 'm-date') { bf = null; go('mery', { t: 'miry', d: view.d, md: e.target.value || today() }); }
});
