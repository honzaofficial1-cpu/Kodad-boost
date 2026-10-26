
// ===================== v2.21: PLÁN NABÍRÁNÍ z jidelnicek-data.json (meta.format „nabiraci-system“) =====================
// Všechna čísla, prahy a texty se berou z JSON (plan_nabirani, urovne_prijmu). V kódu je jen logika pravidel podle jejich id.
const PN = () => JD.plan_nabirani || JD_DEFAULT.plan_nabirani || {};
const PH = () => PN().hodnoceni || {};
const KROKY = () => JD.urovne_prijmu.kroky;
const stepMin = () => Math.min(...KROKY().map(k => k.krok)), stepMax = () => Math.max(...KROKY().map(k => k.krok));
const stepRow = s => KROKY().find(k => k.krok === s) || null;
const sgn = s => s > 0 ? '+' + s : String(s).replace('-', '−');
const minW = () => PH().min_vazeni_za_tyden ?? 5;
IC.plan = '<path d="M4 5h11M4 10h16M4 15h9M4 20h13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="5" r="2" fill="currentColor"/>';
IC.prep = '<path d="M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z M2.5 9h19 M9 5.5c0-1 .8-1.5 1.5-1.5h3c.7 0 1.5.5 1.5 1.5V9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>';

// časy jídel z textu strategie (např. „snídaně ~7:30 … večeře po tréninku ~18:30“)
function applyTimes() {
  const t = (PN().texty || {}).strategie_a_struktura || ''; const L = { snidane: 'snídaně', obed: 'oběd', svacina: 'svačina', vecere: 'večeře' };
  SLOTS.forEach(s => { const m = new RegExp(L[s[0]] + '[^~|\\n]{0,40}~(\\d{1,2}:\\d{2})', 'i').exec(t); if (m) s[2] = m[1]; });
}
const _21jlApply = jlApply; jlApply = function () { _21jlApply(); applyTimes(); }; applyTimes();

// ---------- nahrání plánu ----------
function planOk(j) {
  if (!j || !j.meta || j.meta.format !== 'nabiraci-system') return `Tohle není soubor plánu – meta.format musí být „nabiraci-system“${j && j.meta && j.meta.format ? ` (je „${esc(j.meta.format)}“)` : ''}.`;
  const miss = ['plan_nabirani', 'suroviny', 'recepty', 'cyklus', 'zasoba_na_cyklus', 'urovne_prijmu'].filter(k => !j[k]); return miss.length ? 'V souboru chybí: ' + miss.join(', ') + '.' : '';
}
const planLbl = j => `${esc(j.meta?.nazev || 'Plán')} · verze ${esc(j.meta?.verze || '–')}${j.meta?.datum ? ' · ' + fdate(j.meta.datum) : ''}`;
document.addEventListener('change', async ev => {
  if (ev.target.id !== 'f-impP') return; const file = ev.target.files[0]; ev.target.value = ''; if (!file) return;
  let j = null; try { j = JSON.parse(await file.text()); } catch (e) { }
  const err = j ? planOk(j) : 'Soubor není platný JSON.';
  if (err) return sheet(`<h2>Plán se nenahrál</h2><p style="margin:8px 0 0">${err}</p><p class="mut" style="margin:8px 0 0">Nic se nepřepsalo, aplikace dál používá ${planLbl(JD)}.</p><div class="actions"><button class="btn white" data-a="close">Rozumím</button></div>`);
  const L = jlLoad(); const same = Object.entries(L.items).find(([, it]) => it.data.meta?.nazev === j.meta.nazev && it.data.meta?.verze === j.meta.verze && it.data.meta?.datum === j.meta.datum);
  const id = same ? same[0] : 'j' + Date.now(); if (L.act !== id) L.prev = L.act; L.items[id] = { data: j, added: today() }; L.act = id;
  // v zařízení držíme aktuální, předchozí a nejvýš 2 další verze
  const keep = new Set([L.act, L.prev]); Object.keys(L.items).sort().reverse().forEach(k => { if (keep.size < 4) keep.add(k); }); Object.keys(L.items).forEach(k => { if (!keep.has(k)) delete L.items[k]; });
  if (!jlSave(L)) return; jlApply(); render();
  sheet(`<h2>Plán nahraný</h2><p style="margin:8px 0 0"><b>${esc(j.meta.nazev)}</b><br>verze ${esc(j.meta.verze)}${j.meta.datum ? ' · ' + fdate(j.meta.datum) : ''}</p>
    <p class="mut" style="margin:10px 0 0">Přepsala se jen data plánu (jídla, nákupy, úrovně příjmu, pravidla a texty). Měření, fotky, odškrtnuté nákupy, suplementy, start, fáze, krok, výjimky a potvrzená doporučení zůstala.</p>
    <div class="actions"><button class="btn white" data-a="close">Hotovo</button></div>`);
});
A['pl-prev'] = () => { const L = jlLoad(); if (!L.prev || (L.prev !== 'default' && !L.items[L.prev])) return toast('Předchozí verze není uložená'); const c = L.act; L.act = L.prev; L.prev = c; if (!jlSave(L)) return; jlApply(); render(); toast('Vráceno: ' + (JD.meta?.nazev || '') + ' ' + (JD.meta?.verze || '')); };
function planDataCard() {
  const L = jlLoad(); const pv = L.prev && (L.prev === 'default' ? JD_DEFAULT : L.items[L.prev]?.data);
  return `<div class="card pldc"><p style="margin:0"><b>${esc(JD.meta?.nazev || 'Plán')}</b></p><p class="mut" style="margin:2px 0 0;font-size:14px">verze ${esc(JD.meta?.verze || '–')}${JD.meta?.datum ? ' · ' + fdate(JD.meta.datum) : ''} · ${JD.recepty.length} receptů</p>
    <label class="btn white block" style="margin-top:14px">${ico('plus')} Nahrát plán (JSON)<input type="file" id="f-impP" accept="application/json,.json" hidden></label>
    ${pv ? `<button class="btn block" style="margin-top:8px" data-a="pl-prev">Vrátit předchozí verzi (${esc(pv.meta?.verze || '–')})</button>` : ''}
    <p class="mut" style="font-size:12px;margin:10px 2px 0">Nahraje jídelníček, nákupy, úrovně příjmu i plán nabírání najednou. Tvoje měření, nákupy, suplementy, start, fáze a krok se nemění.</p></div>`;
}
const _21vSettings = vSettings;
vSettings = function () { return _21vSettings().replace('<div class="lbl" style="margin:26px 6px 10px">WHOOP</div>', `<div class="lbl" style="margin:26px 6px 10px">Jídelníček a plán nabírání</div>${planDataCard()}<div class="lbl" style="margin:26px 6px 10px">WHOOP</div>`); };
const _21fset = XV['f-set'];
XV['f-set'] = function () { return _21fset().replace(/<label class="btn white block"[^>]*>[^<]*<svg[\s\S]*?Nahrát jiný jídelníček<input type="file" id="f-imp2"[^>]*><\/label>/, '').replace('<div class="fsec"><div class="lbl">Jídelníček</div>', `<div class="fsec"><div class="lbl">Plán (JSON)</div>${planDataCard()}</div><div class="fsec"><div class="lbl">Uložené verze</div>`).replace(/id="f-imp2"/g, 'id="f-impP"'); };
const _21fden0 = XV['f-den'];
XV['f-den'] = function () { return _21fden0().replace(/id="f-imp2"/g, 'id="f-impP"').replace('Nahrát jiný jídelníček', 'Nahrát plán (JSON)'); };

// ---------- fáze ----------
function phase() {
  const f = F(); if (!f.phase) f.phase = { id: (PN().faze || [{ id: 'kalibrace' }])[0].id, from: f.start || null, log: [] };
  if (!f.phase.from && f.start) f.phase.from = f.start; return f.phase;
}
const phaseDef = id => (PN().faze || []).find(x => x.id === id) || { id, nazev: id };
const isCalib = () => phase().id === 'kalibrace';
const calibStep = () => { const d = phaseDef('kalibrace'); return typeof d.krok === 'number' ? d.krok : (JD.meta.vychozi_krok || 0); };
function wkInfo(mon) { const a = weekAvg(mon); const x = F().weeks[mon] || {}; const done = toU(mon) + 7 * DMS <= toU(today()); return { mon, ...a, exc: !!x.exc, excWhy: x.excWhy || '', done, valid: done && a.n >= minW() && !x.exc }; }
// kalibrace: týden 1 se nehodnotí, porovnají se týdny 2 a 4 (14 dní); neplatný týden = posun o týden
function calibState() {
  const f = F(); if (!f.start) return null; const K = PN().kalibrace || {}; const len = K.delka_tydnu || 4;
  const [a0, b0] = K.porovnat_tydny || [2, 4]; const gap = Math.round((K.dni_mezi_porovnanymi_tydny || 14) / 7);
  const mon = n => dkey(addDays(pdate(f.start), (n - 1) * 7)); const week = Math.floor(daysBetween(f.start, today()) / 7) + 1;
  let pair = null, need = Math.max(len, b0), skipped = [];
  for (let i = a0; i <= a0 + 12; i++) { const A = wkInfo(mon(i)), B = wkInfo(mon(i + gap)); need = Math.max(len, i + gap);
    if (A.done && !A.valid) { skipped.push(i); continue; } if (B.done && !B.valid) { skipped.push(i + gap); continue; }
    if (A.valid && B.valid) { pair = [i, A, i + gap, B]; } break; }
  const out = { week, len: need, end: dkey(addDays(pdate(mon(need)), 6)), skipped: [...new Set(skipped)] };
  if (!pair) return out;
  const intake = stepRow(calibStep())?.prumer_den?.kcal || 0; const kk = K.kcal_na_kg || 7700, dni = K.dni_mezi_porovnanymi_tydny || 14, zao = K.zaokrouhlit_na_kcal || 50;
  const ch = pair[3].avg - pair[1].avg; const corr = ch * kk / dni; const maint = Math.round((intake - corr) / zao) * zao;
  const target = maint + (PN().start_nabirani?.nadbytek_kcal ?? 250);
  const best = KROKY().reduce((a, b) => Math.abs(b.prumer_den.kcal - target) < Math.abs(a.prumer_den.kcal - target) ? b : a);
  return Object.assign(out, { pair, intake, ch, corr, maint, target, step: best.krok, stepKcal: best.prumer_den.kcal, kk, dni });
}
function calibHTML(c, full) {
  if (!c) return '';
  if (!c.pair) return `<div class="frec idle"><b>${esc(phaseDef('kalibrace').nazev || 'Kalibrace')} – týden ${Math.min(c.week, c.len)} ze ${c.len}</b><span>${esc(phaseDef('kalibrace').popis || '')}${c.skipped.length ? ` Týden ${c.skipped.join(' a ')} je neplatný (málo vážení nebo výjimka) – kalibrace se prodlužuje.` : ''} Výpočet po ${fday(c.end)}.</span></div>`;
  const a = c.pair[1], b = c.pair[3];
  return `<div class="frec up"><b>Udržovací příjem ≈ ${thou(c.maint)} kcal</b>
    <span>Týden ${c.pair[0]}: ${nf(a.avg, 2)} kg · týden ${c.pair[2]}: ${nf(b.avg, 2)} kg</span>
    <span class="calc">${thou(c.intake)} − ${nf(c.ch, 2)} × ${thou(c.kk)} ÷ ${c.dni} = ${thou(c.intake)} ${c.corr >= 0 ? '−' : '+'} ${thou(Math.abs(Math.round(c.corr)))} ≈ <b>${thou(c.maint)} kcal</b></span>
    <span>Cíl = udržovací + ${PN().start_nabirani?.nadbytek_kcal ?? 250} kcal = ${thou(c.target)} kcal → nejbližší <b>krok ${sgn(c.step)}</b> (${thou(c.stepKcal)} kcal).</span>
    ${full ? `<span class="mut" style="font-size:12px">${esc(PN().kalibrace?.poznamka || '')}</span>` : ''}
    <div class="two" style="margin-top:12px"><button class="btn white" data-a="pl-calok" data-v="${c.step}">Potvrdit krok ${sgn(c.step)}</button><button class="btn" data-a="tab" data-v="f-plan">Podrobně</button></div></div>`;
}
A['pl-calok'] = b => { const f = F(); const c = calibState(); const s = +b.dataset.v; const ph = phase();
  ph.log = [...(ph.log || []), { d: today(), from: ph.id, to: 'nabirani', maint: c && c.maint }]; ph.id = 'nabirani'; ph.from = dkey(monday(new Date())); f.maint = c && c.maint;
  setStep(s, `Kalibrace: udržovací ${c ? thou(c.maint) : '?'} kcal + ${PN().start_nabirani?.nadbytek_kcal ?? 250} kcal`); render(); toast('Fáze: nabírání · krok ' + sgn(s)); };

// ---------- krok: zámek v kalibraci, rozsah z JSON, historie s důvodem ----------
function setStep(v, why) { const f = F(); v = Math.max(stepMin(), Math.min(stepMax(), v)); if (v === f.step) return save(true); f.stepLog = [...(f.stepLog || []), { d: today(), from: f.step, to: v, why: why || 'ručně' }]; f.step = v; save(true); }
A['f-setstep'] = b => {
  const v = +b.dataset.v; if (isCalib() && v !== calibStep()) return toast(`Během kalibrace je krok zamčený na ${sgn(calibStep())}`);
  const f = F(); if (v === f.step) return; setStep(v, b.dataset.why || 'ručně'); if (b.dataset.rec) { (f.recOk = f.recOk || {})[b.dataset.rec] = { d: today(), to: f.step }; save(true); }
  render(); toast(`Krok ${sgn(f.step)} – jídelníček ukazuje nové porce`);
};
A['pl-recok'] = b => { const f = F(); (f.recOk = f.recOk || {})[b.dataset.rec] = { d: today(), to: null }; save(true); render(); toast('Potvrzeno'); };
stepWhat = function (s) {
  if (!s) return `<p class="mut" style="font-size:13px;margin:8px 2px 0">Krok ${sgn(0)} = jídelníček přesně podle cyklu.</p>`;
  const U = JD.urovne_prijmu; const list = s > 0 ? U.poradi_nahoru.slice(0, s) : U.poradi_dolu.slice(0, -s); const nm = { snidane: 'snídaně', obed: 'oběd', svacina: 'svačina', vecere: 'večeře' };
  const tuk = slot => { const t = slot === 'snidane' ? U.modul_tuku.snidane : U.modul_tuku.obed_vecere; return t ? `${t.g} g ${(SUR(t.surovina).nazev || '').split(' (')[0].toLowerCase()}` : 'modul tuku'; };
  return `<ol class="fsteps">${list.map(m => `<li>${s > 0 ? '+' : '−'} ${m.typ === 'tuk' ? tuk(m.slot) : 'modul přílohy'} – ${nm[m.slot]}</li>`).join('')}</ol>`;
};
calib = () => null; // starý odhad (týdny 1–3) nahrazuje calibState podle JSON

// ---------- hodnocení (fáze nabírání) ----------
evalData = function () {
  const f = F(); const st = f.start || (bStart() && dkey(monday(pdate(bStart())))); if (!st) return null; const H = PH();
  const [pl, ph] = H.pasmo_procent_hmotnosti_za_2_tydny || [0.3, 0.5]; const iv = H.interval_tydnu || 2; const nowMon = dkey(monday(new Date()));
  const weeks = []; for (let m = st; m < nowMon; m = dkey(addDays(pdate(m), 7))) weeks.push(wkInfo(m));
  const P = phase(); const evals = []; let next = null;
  if (P.id === 'nabirani' && P.from) { let T = dkey(addDays(pdate(P.from), iv * 7));
    for (let g = 0; g < 300; g++) { if (toU(T) >= toU(nowMon)) { next = dkey(addDays(pdate(T), 6)); break; }
      const A = wkInfo(dkey(addDays(pdate(T), -iv * 7))), B = wkInfo(T);
      if (A.valid && B.valid) { const ch = B.avg - A.avg, lo = B.avg * pl / 100, hi = B.avg * ph / 100; evals.push({ mon: T, from: A.mon, ch, lo, hi, z: ch < lo ? 'pod' : ch > hi ? 'nad' : 'v' }); T = dkey(addDays(pdate(T), iv * 7)); }
      else T = dkey(addDays(pdate(T), 7)); } }
  const M = Object.entries(BD().meas).filter(([, m]) => m.waist != null).sort((a, b) => a[0] < b[0] ? -1 : 1);
  let w4 = null, wAll = null; if (M.length >= 2) { const [lk, lm] = M[M.length - 1]; wAll = lm.waist - M[0][1].waist; const ref = [...M].reverse().find(([k]) => toU(k) <= toU(lk) - 27 * DMS); if (ref) w4 = lm.waist - ref[1].waist; }
  return { st, weeks, evals, w4, wAll, next, waist: M.length ? M[M.length - 1][1].waist : null };
};
const rule = id => (PH().pravidla || []).find(p => p.id === id) || { doporuceni: id, zmena_kroku: [0, 0] };
const ruleSteps = r => { const [a, b] = r.zmena_kroku || [0, 0]; const o = []; for (let s = a; s <= b; s++) if (s) o.push(s); return o.sort((x, y) => Math.abs(x) - Math.abs(y)); };
const parseQ = q => { const m = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(q); return m ? [m[1], m[2].split('/').map(x => x.trim())] : [q, ['ano', 'ne']]; };
const QK3 = ['photo', 'perf', 'feel'];
function bigReview(E) {
  const V = PN().velke_prehodnoceni || {}; const P = phase(); const from = F().reviewAt || P.from || E.st; const wks = Math.floor(daysBetween(from, today()) / 7);
  const due = dkey(addDays(pdate(from), (V.kazdych_tydnu || 12) * 7)); const pas = V.nebo_pas_cm_od_startu ?? PN().pas?.prah_velke_prehodnoceni_cm_od_startu;
  return { due, now: P.id === 'nabirani' && (wks >= (V.kazdych_tydnu || 12) || (E.wAll != null && pas != null && E.wAll >= pas)), V };
}
function perfStall() {
  const r = rule('vykon_stoji'); const n = +((/(\d+)\s*a\s*více\s*týdn/.exec(r.kdyz || '') || [])[1] || 4);
  const lim = Date.now() - n * 7 * DMS; const ss = finished().filter(s => s.start > lim); return { n, stall: ss.length >= n && ss.reduce((a, s) => a + stats(s).up, 0) === 0 };
}
recommend = function (E) {
  const f = F(); const H = PH(); const out = [];
  if (isCalib()) { const c = calibState(); return c ? [{ html: calibHTML(c) }] : [{ t: 'Nastav start', d: 'Zadej pondělí týdne A – od něj běží kalibrace.', k: 'idle' }]; }
  if (!E) return [{ t: 'Málo dat', d: H.malo_dat || '', k: 'idle' }];
  const B = bigReview(E); if (B.now) out.push({ t: 'Čas na velké přehodnocení', d: `${(B.V.co_zkontrolovat || []).join(', ')}. Možnosti: ${(B.V.moznosti || []).join(' / ')}. ${B.V.poznamka || ''}`, k: 'big', act: 'f-bigdone' });
  const L = E.evals[E.evals.length - 1], P = E.evals[E.evals.length - 2]; const prah = PN().pas?.prah_cm_za_4_tydny ?? 1;
  if (!L) { out.push({ t: `První hodnocení ${E.next ? fday(E.next) : 'za ' + (PH().interval_tydnu || 2) + ' týdny'}`, d: `Změna = ${PH().zmena_kg || ''}. ${H.malo_dat || ''}`, k: 'idle' }); return out; }
  const key = L.mon; const ok = (f.recOk || {})[key];
  const card = (id, k, extra = {}) => { const r = rule(id); return Object.assign({ t: r.doporuceni, d: r.kdyz ? 'Pravidlo: ' + r.kdyz + '.' : '', k, rec: key + ':' + id, steps: ruleSteps(r), ok: (f.recOk || {})[key + ':' + id] }, extra); };
  if (E.w4 != null && E.w4 >= prah && L.z === 'v') {
    const r = rule('pas_roste'); const q = f.checks[key] || {}; const Q = (r.otazky || []).map(parseQ);
    if (QK3.slice(0, Q.length).every(k => q[k])) { const cut = q.photo === 'ano' && ['stagnuje', 'klesá'].includes(q.perf); const V = r.vyhodnoceni || {};
      out.push(card('pas_roste', cut ? 'down' : 'ok', { t: cut ? V.fotky_ano_a_vykon_stagnuje_nebo_klesa : V.jinak, steps: cut ? ruleSteps(r).filter(s => s < 0) : [] })); }
    else out.push(card('pas_roste', 'check', { d: `Pas ${sgn(Math.round(E.w4 * 10) / 10).replace('.', ',')} cm za 4 týdny při tempu v pásmu. ${PN().pas?.pravidlo || ''}`, q: key, Q, steps: [] }));
  } else if (P && L.z === 'pod' && P.z === 'pod' && (E.w4 == null || E.w4 < prah)) out.push(card('pod', 'up'));
  else if (P && L.z === 'nad' && P.z === 'nad') out.push(card('nad', 'down'));
  else if (L.z === 'v') { out.push(card('v_pasmu', 'ok')); const ps = perfStall(); if (ps.stall) out.push(card('vykon_stoji', 'check')); }
  else out.push({ t: 'Zatím beze změny', d: `Poslední hodnocení je ${L.z === 'pod' ? 'pod' : 'nad'} pásmem. ${H.nikdy || ''}`, k: 'idle', rec: key + ':jedno', ok: (f.recOk || {})[key + ':jedno'] });
  return out;
};
function recHTML(R) {
  const f = F(); return (Array.isArray(R) ? R : [R]).map(r => r.html || `<div class="frec ${r.k}"><b>${esc(r.t || '')}</b><span>${esc(r.d || '')}</span>
    ${r.Q ? `<div class="fq">${r.Q.map(([l, o], i) => `<div><small>${esc(l)}</small><div class="seg">${o.map(v => `<button data-a="f-q" data-m="${r.q}" data-k="${QK3[i]}" data-v="${esc(v)}" class="${(f.checks[r.q] || {})[QK3[i]] === v ? 'on' : ''}">${esc(v)}</button>`).join('')}</div></div>`).join('')}</div>` : ''}
    ${r.ok ? `<span class="recok">${ico('check')} Potvrzeno ${fday(r.ok.d)}${r.ok.to != null ? ` · krok ${sgn(r.ok.to)}` : ''}</span>`
      : r.steps && r.steps.length ? `<div class="two" style="margin-top:12px">${r.steps.map((s, i) => `<button class="btn ${i === 0 ? 'white' : ''}" data-a="f-setstep" data-v="${f.step + s}" data-rec="${r.rec}" data-why="${esc(r.t)}">Potvrdit ${sgn(s)} → krok ${sgn(f.step + s)}</button>`).join('')}</div>`
      : r.rec && r.k !== 'check' ? `<button class="btn" style="margin-top:12px" data-a="pl-recok" data-rec="${r.rec}">Beru na vědomí</button>` : ''}
    ${r.act ? `<button class="btn" style="margin-top:12px" data-a="${r.act}">Přehodnoceno</button>` : ''}</div>`).join('');
}
// Vývoj: karty doporučení, zámek kroku, výjimky s důvody z JSON
const _21vyvoj = XV['f-vyvoj'];
XV['f-vyvoj'] = function () {
  let h = _21vyvoj(); const R = recommend(evalData());
  h = h.replace(/(<\/header>)([\s\S]*?)(<div class="fstat">)/, (m, a, b, c) => a + recHTML(R) + c);
  if (isCalib()) h = h.replace(/<div class="fstep">[\s\S]*?<\/div><\/div>/, m => m.replace(/<button class="round" data-a="f-setstep"[^>]*>/g, s => s.replace('>', ' disabled>'))).replace('<div class="lbl">Krok příjmu</div>', `<div class="lbl">Krok příjmu · zamčený během kalibrace</div>`);
  const V = PN().vyjimky || {}; const lastMon = dkey(addDays(monday(new Date()), -7)); const wk = F().weeks[lastMon] || {};
  h = h.replace(/<small>Nemoc, cesta[^<]*<\/small>/, `<small>${esc((V.duvody || []).join(', '))} – ${esc(V.pravidlo || '')}</small>`);
  h = h.replace(/<input class="inp" id="f-excwhy"[^>]*>/, `<div class="chips" style="margin-top:10px">${(V.duvody || []).map(d => `<button class="chip ${wk.excWhy === d || (d === 'jiné' && wk.excWhy && !(V.duvody || []).includes(wk.excWhy)) ? 'on' : ''}" data-a="pl-exc" data-m="${lastMon}" data-v="${esc(d)}">${esc(d)}</button>`).join('')}</div>
    ${wk.excWhy && !(V.duvody || []).slice(0, -1).includes(wk.excWhy) ? `<input class="inp" id="f-excwhy" data-m="${lastMon}" placeholder="Co se dělo" value="${esc(wk.excWhy === 'jiné' ? '' : wk.excWhy)}" style="margin-top:8px">` : ''}`);
  return h;
};
A['pl-exc'] = b => { const f = F(); const w = f.weeks[b.dataset.m] = f.weeks[b.dataset.m] || {}; w.exc = true; w.excWhy = b.dataset.v; save(true); const y = $('#app').scrollTop; render(); $('#app').scrollTop = y; };

// ---------- markdown → HTML (nadpisy, tabulky, odrážky, číslované seznamy, tučné, kurzíva, odkazy) ----------
function mdInline(s) {
  return esc(s).replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>');
}
function mdHTML(src) {
  const L = String(src || '').replace(/\r/g, '').split('\n'); let o = '', i = 0; const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  while (i < L.length) {
    const l = L[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = /^(#{1,6})\s+(.*)$/.exec(l))) { const n = Math.min(4, m[1].length + 1); o += `<h${n}>${mdInline(m[2])}</h${n}>`; i++; continue; }
    if (/^\s*\|/.test(l) && L[i + 1] && /^\s*\|?\s*:?-{3,}/.test(L[i + 1])) { const hd = cells(l); i += 2; const rows = []; while (i < L.length && /^\s*\|/.test(L[i])) rows.push(cells(L[i++]));
      o += `<div class="mdt"><table><thead><tr>${hd.map(c => `<th>${mdInline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${mdInline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; continue; }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) { const ord = /^\s*\d+\./.test(l); const items = [];
      while (i < L.length && (/^\s*([-*]|\d+\.)\s+/.test(L[i]) || (L[i].trim() && /^\s{2,}/.test(L[i])))) { const x = L[i]; const ind = /^(\s*)/.exec(x)[1].length;
        if (/^\s*([-*]|\d+\.)\s+/.test(x)) items.push({ ind, t: x.replace(/^\s*([-*]|\d+\.)\s+/, '') }); else if (items.length) items[items.length - 1].t += ' ' + x.trim(); i++; }
      o += `<${ord ? 'ol' : 'ul'}>${items.map(x => `<li class="${x.ind >= 2 ? 'sub' : ''}">${mdInline(x.t)}</li>`).join('')}</${ord ? 'ol' : 'ul'}>`; continue; }
    const p = []; while (i < L.length && L[i].trim() && !/^(#{1,6}\s|\s*\||\s*([-*]|\d+\.)\s+)/.test(L[i])) p.push(L[i++].trim()); o += `<p>${mdInline(p.join(' '))}</p>`;
  }
  return o;
}

// ---------- sekce PLÁN ----------
FOOD_TABS.push(['f-plan', 'Plán', 'plan']);
const TXT_NAMES = { strategie_a_struktura: 'Strategie a struktura', urovne_prijmu: 'Úrovně příjmu', zameny_a_mimoradne_dny: 'Záměny a mimořádné dny', nakup_a_priprava: 'Nákup a příprava', mikrozivy: 'Mikroživiny' };
XV['f-plan'] = function () {
  const f = F(); const p = PN(); const P = phase(); const E = evalData(); const sr = stepRow(f.step); const pd = sr?.prumer_den || {};
  if (!f.start) return `<div class="wrap">${fHdr('Plán')}<p class="plsum">${esc(p.shrnuti || '')}</p><div class="empty"><b>Nastav start</b><span>Zadej pondělí, kdy začíná týden A. Od něj běží kalibrace.</span><button class="btn white" data-a="tab" data-v="f-set">Nastavit start</button></div></div>${tabs()}`;
  const c = isCalib() ? calibState() : null; const wN = Math.floor(daysBetween(P.from || f.start, today()) / 7) + 1;
  const phaseTxt = isCalib() ? `${esc(phaseDef('kalibrace').nazev)} – týden ${Math.min(c.week, c.len)} ze ${c.len}` : `${esc(phaseDef('nabirani').nazev)} – týden ${wN}`;
  const B = E ? bigReview(E) : null; const R = recommend(E); const log = (f.stepLog || []).slice(-5).reverse();
  const nextEval = isCalib() ? (c.pair ? 'výsledek kalibrace je hotový' : `výpočet udržovacího ${fday(c.end)}`) : E && E.next ? fday(E.next) : '–';
  const texts = Object.entries(p.texty || {}).map(([k, v]) => `<details class="pltx"><summary>${esc(TXT_NAMES[k] || k.replace(/_/g, ' '))}<span class="chev">${ico('chevd')}</span></summary><div class="md">${mdHTML(v)}</div></details>`).join('');
  return `<div class="wrap">${fHdr('Plán')}
    <p class="plsum">${esc(p.shrnuti || '')}</p>
    <div class="plst">
      <div class="plph"><span class="lbl">Fáze</span><b>${phaseTxt}</b><small>${esc(phaseDef(P.id).popis || '')}</small></div>
      <div class="plgrid">
        <div><span>Krok</span><b>${sgn(f.step)}</b><small>${pd.kcal ? thou(pd.kcal) + ' kcal/den' : ''}${isCalib() ? ' · zamčený' : ''}</small></div>
        <div><span>Bílkoviny</span><b>${pd.bilkoviny_g ? r0(pd.bilkoviny_g) : '–'}<i> g</i></b><small>S ${pd.sacharidy_g ? r0(pd.sacharidy_g) : '–'} · T ${pd.tuky_g ? r0(pd.tuky_g) : '–'} g</small></div>
        <div><span>Další hodnocení</span><b class="sm">${nextEval}</b><small>${isCalib() ? 'týden 1 se nehodnotí' : `každé ${PH().interval_tydnu || 2} týdny`}</small></div>
        <div><span>Velké přehodnocení</span><b class="sm">${B ? fday(B.due) : '–'}</b><small>nebo pas +${(p.velke_prehodnoceni?.nebo_pas_cm_od_startu ?? '–')} cm od startu</small></div>
      </div></div>
    <div class="fsec"><div class="lbl">Poslední doporučení</div>${recHTML(R)}</div>
    ${log.length ? `<div class="fsec"><div class="lbl">Historie kroků</div>${log.map(l => `<div class="fwr"><span>${fday(l.d)}</span><b>${sgn(l.from)} → ${sgn(l.to)}</b><small>${esc(l.why || 'ručně')}</small></div>`).join('')}</div>` : ''}
    <div class="fsec"><div class="lbl">Plán nabírání · ${esc(JD.meta?.nazev || '')} ${esc(JD.meta?.verze || '')}</div>${texts}</div>
    <div class="fsec"><button class="btn block" data-a="pl-phase">Změnit fázi ručně</button></div>
  </div>${tabs()}`;
};
A['pl-phase'] = () => { const P = phase(); sheet(`<h2>Fáze</h2><p class="mut" style="margin:4px 0 0">Normálně se přepíná sama po kalibraci. Ručně jen když víš, co děláš (např. kalibraci už máš za sebou).</p>
  <div class="list" style="margin-top:14px">${(PN().faze || []).map(x => `<button class="li" data-a="pl-phase2" data-v="${x.id}"><div class="t"><b>${esc(x.nazev)}${x.id === P.id ? ' · teď' : ''}</b><small>${esc(x.popis || '')}</small></div></button>`).join('')}</div>
  <div class="actions"><button class="btn white" data-a="close">Zavřít</button></div>`); };
A['pl-phase2'] = b => { const P = phase(); if (b.dataset.v === P.id) return closeSheet(); P.log = [...(P.log || []), { d: today(), from: P.id, to: b.dataset.v, why: 'ručně' }]; P.id = b.dataset.v; P.from = b.dataset.v === 'kalibrace' ? F().start : dkey(monday(new Date()));
  if (P.id === 'kalibrace') setStep(calibStep(), 'kalibrace'); save(true); closeSheet(); render(); };
const _21tabsP = tabs;
tabs = () => { const h = _21tabsP(); return view.n && view.n.startsWith('f-') ? h.replace('<nav class="tabs ftabs">', '<nav class="tabs ftabs t6">') : h; };

// ---------- export: fáze, historie, výjimky, otázky, verze plánu ----------
const _21export = A['f-export'];
A['f-export'] = async () => {
  const f = F(); const E = evalData(); const P = phase();
  const orig = JSON.stringify; JSON.stringify = function (v, ...r) { if (v && v.jidelnicek && v.mereni) { v.plan = { nazev: JD.meta?.nazev, verze: JD.meta?.verze, datum: JD.meta?.datum, format: JD.meta?.format };
      v.faze = { aktualni: P.id, od: P.from, historie: P.log || [], udrzovaci_kcal: f.maint ?? null }; v.krok = { aktualni: f.step, kcal: stepRow(f.step)?.prumer_den?.kcal ?? null, historie: f.stepLog || [] };
      v.vyjimky = Object.entries(f.weeks).filter(([, w]) => w.exc).map(([m, w]) => ({ tyden: m, duvod: w.excWhy || '' })); v.kontrolni_otazky = f.checks; v.potvrzena_doporuceni = f.recOk || {}; v.dalsi_hodnoceni = E && E.next; }
    return orig.call(JSON, v, ...r); };
  try { await _21export(); } finally { JSON.stringify = orig; }
};
