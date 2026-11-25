
// ===================== v2.27: porcování masa a ryb po nákupu =====================
// Pro aktuální nákup (N1/N2): co dát celé do várky (rozdělit až uvařené) a co naporcovat syrové – podle toho, kolik jsi reálně koupil.
const PO_FISH = /^(losos|krevety|tunak|sardinky)/;
const poWanted = s => { const x = JD.suroviny[s]; if (!x) return false; return x.kategorie_nakupu === 'Maso a ryby' || (x.kategorie_nakupu === 'Mražené' && (x.na_100g?.bilkoviny_g || 0) >= 15); };
const SLOTL = { snidane: 'snídaně', obed: 'oběd', svacina: 'svačina', vecere: 'večeře' };
function poPlan(wi, list) {
  if (isV3()) return poPlan3(wi, list);
  const f = F(); const R = RX(); const order = JD.meta.poradi_cyklu || ['A', 'B', 'C']; const w = order[wi % order.length];
  const mon = dkey(addDays(pdate(f.start), wi * 7)); const buy = dkey(addDays(pdate(mon), list === 'N1' ? -2 : 2));
  const out = {}; const it = s => (out[s] = out[s] || { s, batch: [], fresh: [] });
  // várka: celé najednou, porce = večeře + obědy z krabičky
  const bk = list === 'N1' ? monBatch(w) : thuBatch(w); const br = R[bk];
  if (br) { const lunchDi = list === 'N1' ? [0, 1, 2] : [3, 4, 5]; const n = 1 + lunchDi.filter(di => { const d = JD.cyklus[w].dny[di]; return d.jidla.obed === bk && (d.z_varky || []).includes('obed'); }).length;
    const cookK = list === 'N1' ? dkey(addDays(pdate(mon), -1)) : dkey(addDays(pdate(mon), 2));
    br.suroviny.forEach(x => { if (poWanted(x.surovina) && x.g) it(x.surovina).batch.push({ g: x.g * n, n, per: x.g, k: cookK, nazev: br.nazev }); }); }
  // čerstvá jídla v období nákupu (ne z krabičky, ne várka)
  const days = list === 'N1' ? [0, 1, 2] : [2, 3, 4, 5, 6];
  days.forEach(di => { const k = dkey(addDays(pdate(mon), di)); const c = cyc(k); if (!c || c.before) return; const day = planDayF(c.w, c.di, k); if (!day) return;
    SLOTS.forEach(([sl]) => { if (list === 'N2' && di === 2 && sl !== 'vecere') return; const r = R[day.jidla[sl]]; if (!r || (day.z_varky || []).includes(sl) || r.varka === true) return;
      r.suroviny.forEach(x => { if (poWanted(x.surovina) && x.g) it(x.surovina).fresh.push({ g: x.g, k, sl, nazev: r.nazev }); }); }); });
  return { buy, items: Object.values(out).sort((a, b) => SUR(a.s).nazev.localeCompare(SUR(b.s).nazev, 'cs')) };
}
const r5 = v => Math.round(v / 5) * 5;
function poResult(p, buy, got) {
  const T = p.batch.reduce((a, b) => a + b.g, 0), Fr = p.fresh.reduce((a, b) => a + b.g, 0), need = T + Fr; const fish = PO_FISH.test(p.s);
  const frozen = JD.suroviny[p.s]?.kategorie_nakupu === 'Mražené';
  const keep = k => { if (frozen) return 'nech v mrazáku, rozmraz den předem v lednici'; const d = daysBetween(buy, k); return d <= (fish ? 1 : 2) ? 'do lednice' : `zamrazit hned, ${fish ? 'rozmrazit den předem v lednici' : 'rozmrazit přes noc v lednici'}`; };
  let fr = p.fresh.map(x => ({ ...x, g2: x.g })), batchG = T, note = '';
  if (got != null && got > 0) { const diff = got - need;
    if (T) { batchG = Math.max(0, got - Fr); note = diff === 0 ? 'Sedí přesně.' : diff > 0 ? `O ${diff} g víc – dej to celé do várky.` : batchG ? `O ${-diff} g míň – várka bude o to slabší, nebo dokup.` : `Chybí ${-diff} g – dokup.`; }
    else if (Math.abs(diff) <= need * 0.2) { fr = fr.map(x => ({ ...x, g2: r5(x.g * got / need) })); const s = fr.reduce((a, b) => a + b.g2, 0); fr[0].g2 += got - s; note = diff === 0 ? 'Sedí přesně.' : `Balení je o ${Math.abs(diff)} g ${diff > 0 ? 'větší' : 'menší'} – rozděl rovnoměrně, energie se liší jen o pár desítek kcal.`; }
    else if (diff > 0) note = `Zbyde ${diff} g – zamraz zvlášť na příště.`;
    else note = `Chybí ${-diff} g – dokup, nebo udělej menší porce.`; }
  const rows = [];
  if (T) { const b = p.batch[0]; rows.push(`<div class="fpor b"><b>${batchG} g</b><span>celé najednou do várky – ${esc(b.nazev)}<small>${fday(b.k)} · neporcuj syrové, rozděl až uvařené do ${b.n} krabiček (~${r5(batchG / b.n)} g masa na porci)</small></span></div>`); }
  fr.forEach(x => rows.push(`<div class="fpor"><b>${x.g2} g</b><span>${fday(x.k)} ${SLOTL[x.sl]} – ${esc(x.nazev)}<small>${keep(x.k)}</small></span></div>`));
  return `${rows.join('')}${note ? `<p class="fpon">${note}</p>` : ''}`;
}
function poSheet() {
  const f = F(); const list = view.list || 'N1'; const wi = view.wi ?? shopWeek(); const key = `${wi}:${list}`; const { buy, items } = poPlan(wi, list); const got = (f.porce || {})[key] || {};
  const body = items.map(p => { const need = p.batch.reduce((a, b) => a + b.g, 0) + p.fresh.reduce((a, b) => a + b.g, 0);
    return `<div class="fpo"><div class="fpoh"><b>${esc(SUR(p.s).nazev.split(' (')[0])}</b><label>koupil jsem <input inputmode="numeric" data-po="${p.s}" data-key="${key}" value="${got[p.s] ?? ''}" placeholder="${need}"> g</label></div>
      <div id="fpr-${p.s}">${poResult(p, buy, got[p.s])}</div></div>`; }).join('');
  return `<h2>Porcování</h2><p class="mut" style="margin:4px 0 0">Nákup ${fday(buy)} Napiš, kolik reálně vážilo balení – porce se přepočítají.</p>
    ${body || '<p class="mut" style="margin-top:14px">V tomhle nákupu není maso ani ryby.</p>'}
    <div class="actions"><button class="btn white" data-a="close">Hotovo</button></div>`;
}
A['po-man'] = () => sheet(poSheet());
document.addEventListener('input', e => { const i = e.target; if (!i.matches || !i.matches('[data-po]')) return; const f = F(); f.porce = f.porce || {};
  const m = f.porce[i.dataset.key] = f.porce[i.dataset.key] || {}; const v = parseInt(i.value, 10); if (v > 0) m[i.dataset.po] = v; else delete m[i.dataset.po]; save();
  const [wi, list] = i.dataset.key.split(':'); const { buy, items } = poPlan(+wi, list); const p = items.find(x => x.s === i.dataset.po); const el = document.getElementById('fpr-' + i.dataset.po); if (p && el) el.innerHTML = poResult(p, buy, m[i.dataset.po]); });
const _47nakup = XV['f-nakup'];
XV['f-nakup'] = function () {
  const h = _47nakup(); const l = view.list || 'N1'; if (!/^N\d$/.test(l)) return h;
  return h.replace('<div class="lbl">Maso a ryby</div>', '<div class="lbl fonl"><span>Maso a ryby</span><button data-a="po-man">Jak naporcovat</button></div>');
};
