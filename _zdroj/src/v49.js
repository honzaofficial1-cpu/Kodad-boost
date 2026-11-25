
// ===================== v2.29: plán 2.3 – reverse dieta (kroky −7 až +10), modul „orechy“, nákup podle kroku =====================

// ---------- reverse dieta: plán s meta.aktualni_krok ≠ krok kalibrace → krok není zamčený ----------
const reverseOn = () => typeof JD.meta?.aktualni_krok === 'number' && JD.meta.aktualni_krok !== calibStep();
const stepLocked = () => isCalib() && !reverseOn();
const stepCtl = f => `<div class="fstep"><button class="round" data-a="f-setstep" data-v="${f.step - 1}" ${f.step <= stepMin() || stepLocked() ? 'disabled' : ''}>−</button><div><b>${sg(f.step, 0).replace('–', '0')}</b><small>${thou(stepAvg(f.step))} kcal/den průměr</small></div><button class="round" data-a="f-setstep" data-v="${f.step + 1}" ${f.step >= stepMax() || stepLocked() ? 'disabled' : ''}>+</button></div>`;
A['f-setstep'] = b => {
  const v = +b.dataset.v; if (stepLocked() && v !== calibStep()) return toast(`Během kalibrace je krok zamčený na ${sgn(calibStep())}`);
  const f = F(); if (v === f.step) return; setStep(v, b.dataset.why || 'ručně'); if (b.dataset.rec) { (f.recOk = f.recOk || {})[b.dataset.rec] = { d: today(), to: f.step }; save(true); }
  render(); toast(`Krok ${sgn(f.step)} – jídelníček ukazuje nové porce`);
};
const _49vyvoj = XV['f-vyvoj'];
XV['f-vyvoj'] = function () {
  let h = _49vyvoj(); if (!isCalib() || stepLocked()) return h; const f = F();
  return h.replace(/<div class="fstep">[\s\S]*?<\/div><\/div>/, stepCtl(f)).replace('<div class="lbl">Krok příjmu · zamčený během kalibrace</div>', '<div class="lbl">Krok příjmu · reverse dieta, krok měníš ručně</div>');
};
const _49plan = XV['f-plan'];
XV['f-plan'] = function () { const h = _49plan(); return isCalib() && !stepLocked() ? h.replace(' · zamčený</small>', ' · reverse dieta</small>') : h; };

// ---------- verze plánu: krok se při nahrání nemění ----------
function applyPlanStep() {
  // od v2.31 (doplněk 2.6): nahrání plánu krok NEMĚNÍ – krok se mění jen ručně; jen si poznamenáme, že verze plánu byla použita
  const m = JD.meta || {}; if (typeof m.aktualni_krok !== 'number') return; const V = (m.verze || '') + '@' + (m.datum || '');
  const f = F(); f.planStepSet = f.planStepSet || {}; if (f.planStepSet[V]) return; f.planStepSet[V] = today(); save(true);
}
const _49jlApply = jlApply; jlApply = function () { _49jlApply(); applyPlanStep(); }; applyPlanStep();

// ---------- modul „orechy“ (poradi_dolu): úprava dne typu orechy se skryje a odečte ze součtu ----------
const nutsOff = step => step < 0 ? JD.urovne_prijmu.poradi_dolu.slice(0, -step).filter(m => m.typ === 'orechy').length : 0;
const _49pd = planDayF;
planDayF = function (w, di, k) {
  const d = _49pd(w, di, k); if (!d || !nutsOff(F().step)) return d; let n = nutsOff(F().step); d._nutsOff = [];
  d.upravy = (d.upravy || []).filter(u => { if (u.typ === 'orechy' && n > 0) { n--; d._nutsOff.push(u); return false; } return true; }); return d;
};
const _49dt = dayTotals;
dayTotals = function (day, step) {
  const t = _49dt(day, step); const n = nutsOff(step); if (!n) return t;
  const off = day._nutsOff && day._nutsOff.length ? day._nutsOff : (day.upravy || []).filter(u => u.typ === 'orechy').slice(0, n);
  off.forEach(u => { if (u.surovina && u.g) addN(t, nutOf(u.surovina, -u.g)); }); return t;
};
const _49sw = stepWhat;
stepWhat = function (s) {
  const h = _49sw(s); if (!(s < 0)) return h; const nm = { snidane: 'snídaně', obed: 'oběd', svacina: 'svačina', vecere: 'večeře' };
  const list = JD.urovne_prijmu.poradi_dolu.slice(0, -s); let i = 0;
  return h.replace(/<li>[^<]*<\/li>/g, li => { const m = list[i++]; if (!m || m.typ !== 'orechy') return li;
    const u = Object.values(JD.cyklus).flatMap(W => W.dny).flatMap(d => d.upravy || []).find(x => x.typ === 'orechy');
    return `<li>− ${u ? `${esc((SUR(u.surovina).nazev || '').split(' (')[0].toLowerCase())} ${u.g} g` : 'ořechy'} – ${nm[m.slot]}</li>`; });
};
