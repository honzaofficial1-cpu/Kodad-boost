// ===================== v2.31: plán 2.6 – volná zelenina jedním řádkem, štítek „povinné“, náhrady ovoce ⇄ =====================

// ---------- skupiny surovin (recepty[].suroviny[].skupina) ----------
// plán bez pole „skupina“ (starší verze) se zobrazuje jako dřív
function isVolna(i) { return i && i.skupina === 'zelenina_volna'; }
function volnaG(r) { return r && r.suroviny.some(isVolna) ? (r.zelenina_volna_g || 0) : 0; }
// pro nákup: volná zelenina se sčítá do jedné položky „Zelenina podle chuti“
function shopSur(i) { return isVolna(i) && JD.suroviny.zelenina_volna ? 'zelenina_volna' : i.surovina; }
function volnaNote() {
  for (const W of Object.values(JD.cyklus || {})) for (const L of Object.values(W.nakup || {})) { const x = (L || []).find(i => i.surovina === 'zelenina_volna' && i.poznamka); if (x) return x.poznamka; }
  return 'jakákoli běžná zelenina; rozděl k jídlům podle aplikace';
}

// ---------- detail jídla: maso → vejce (ks) → ostatní → zelenina (sbalená, po klepnutí) ----------
const MEAT_RX = /^(krevety|sardinky|tunak|losos)/;
function ingGroup(i) {
  const x = JD.suroviny[i.surovina] || {}; const kat = x.kategorie_nakupu || ''; const b = x.na_100g?.bilkoviny_g || 0;
  if (kat === 'Maso a ryby' || MEAT_RX.test(i.surovina)) return 0;
  if (i.surovina === 'vejce') return 1;
  if (i.skupina === 'ovoce') return 2;
  if (isVolna(i) || (kat === 'Ovoce a zelenina' && !/^(avokado|citron|limetka)/.test(i.surovina)) || (kat === 'Mražené' && b < 8)) return 3;
  return 2;
}
const eggKs = i => { const m = /(\d+)\s*ks/.exec(i.poznamka || ''); return m ? +m[1] : Math.max(1, Math.round((i.g || 0) / 55)); };
const ingSorted = r => r.suroviny.map((i, n) => ({ i, n, g: ingGroup(i) })).sort((a, b) => a.g - b.g || (a.g === 0 ? (b.i.g || 0) - (a.i.g || 0) : a.n - b.n));
function ingRows(r) {
  const fr = JD.nahrady_ovoce; let out = ''; const L = ingSorted(r); const veg = L.filter(x => x.g === 3 && !isVolna(x.i)); const zv = volnaG(r);
  const row = ({ i, n, g }, cls) => { const pov = i.povinne === true, ov = i.skupina === 'ovoce' && fr && (fr.polozky || []).length;
    const tag = pov ? `<button class="ftg" data-a="f-ingx" data-v="p${n}">povinné</button>` : ov ? `<button class="ftg sw" data-a="f-ingx" data-v="o${n}" aria-label="Náhrady ovoce">⇄</button>` : '';
    const q = g === 1 ? `${eggKs(i)} ks<small>${i.g} g</small>` : i.g ? i.g + ' g' : 'dle chuti';
    const pz = g === 1 ? (i.poznamka || '').replace(/\d+\s*ks\s*/, '').trim() : i.poznamka;
    let h = `<div data-i="${n}"${cls ? ` class="${cls}" hidden` : ''}><span>${esc(i.nazev)}${tag}${pz ? `<small>${esc(pz)}</small>` : ''}</span><b>${q}</b></div>`;
    if (pov) h += `<section class="fexp" id="fx-p${n}" hidden>${esc(r.povinne_duvod || 'Tahle zelenina je součást jídla – nevynechávej ji.')}</section>`;
    if (ov) h += `<section class="fexp" id="fx-o${n}" hidden>${fr.princip ? `<p>${esc(fr.princip)}</p>` : ''}<div class="fswt">${fr.polozky.map(x => `<div><span>${esc(x.nazev)}</span><b>${x.g} g</b></div>`).join('')}</div></section>`;
    return h; };
  L.filter(x => x.g < 3).forEach(x => out += row(x));
  if (veg.length || zv > 0) {
    const tot = veg.reduce((a, x) => a + (x.i.g || 0), 0) + zv; const np = veg.filter(x => x.i.povinne).length;
    out += `<button class="fvgh" data-a="f-veg"><span><b>Zelenina</b><small>${veg.length ? veg.map(x => esc(x.i.nazev.split(' (')[0].toLowerCase())).join(', ') : ''}${veg.length && zv ? ' + ' : ''}${zv ? `~${zv} g jakékoli` : ''}${np ? ` · ${np}× povinné` : ''}</small></span><b>~${tot} g</b><i>${ico('chev')}</i></button>`;
    veg.forEach(x => out += row(x, 'fvg'));
    if (zv > 0) out += `<p class="fveg fvg" hidden>+ zelenina ~${zv} g, jakákoli</p>`;
  }
  return out;
}
A['f-veg'] = b => { const on = b.classList.toggle('on'); document.querySelectorAll('#sheet .fing > .fvg').forEach(el => el.hidden = !on); if (!on) document.querySelectorAll('#sheet .fing > .fvg + .fexp').forEach(el => el.hidden = true); };
A['f-ingx'] = b => { const el = document.getElementById('fx-' + b.dataset.v); if (!el) return; el.hidden = !el.hidden; b.classList.toggle('on', !el.hidden); };

// ---------- nákup na vlastní období: volná zelenina jako souhrnná položka ----------
const _50range = rangeItems;
rangeItems = function (from, to) {
  const r = _50range(from, to); const z = r.items.find(i => i.id === 'zelenina_volna');
  if (z) { const g = parseFloat(z.mnozstvi.replace(',', '.')) * (/kg/.test(z.mnozstvi) ? 1000 : 1); const g50 = Math.round(g / 50) * 50;
    z.mnozstvi = g50 >= 1000 ? `~${nf(g50 / 1000, 1)} kg` : `~${g50} g`; z.pozn = volnaNote(); z.kat = 'Ovoce a zelenina'; }
  return r;
};
