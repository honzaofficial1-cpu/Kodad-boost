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

// ---------- detail jídla: hlavní suroviny + jeden řádek zeleniny ----------
function ingRows(r) {
  const fr = JD.nahrady_ovoce; let out = '';
  r.suroviny.forEach((i, n) => {
    if (isVolna(i)) return;
    const pov = i.povinne === true, ov = i.skupina === 'ovoce' && fr && (fr.polozky || []).length;
    const tag = pov ? `<button class="ftg" data-a="f-ingx" data-v="p${n}">povinné</button>` : ov ? `<button class="ftg sw" data-a="f-ingx" data-v="o${n}" aria-label="Náhrady ovoce">⇄</button>` : '';
    out += `<div data-i="${n}"><span>${esc(i.nazev)}${tag}${i.poznamka ? `<small>${esc(i.poznamka)}</small>` : ''}</span><b>${i.g ? i.g + ' g' : 'dle chuti'}</b></div>`;
    if (pov) out += `<section class="fexp" id="fx-p${n}" hidden>${esc(r.povinne_duvod || 'Tahle zelenina je součást jídla – nevynechávej ji.')}</section>`;
    if (ov) out += `<section class="fexp" id="fx-o${n}" hidden>${fr.princip ? `<p>${esc(fr.princip)}</p>` : ''}<div class="fswt">${fr.polozky.map(x => `<div><span>${esc(x.nazev)}</span><b>${x.g} g</b></div>`).join('')}</div></section>`;
  });
  const zv = volnaG(r); if (zv > 0) out += `<p class="fveg">+ zelenina ~${zv} g, jakákoli</p>`;
  return out;
}
A['f-ingx'] = b => { const el = document.getElementById('fx-' + b.dataset.v); if (!el) return; el.hidden = !el.hidden; b.classList.toggle('on', !el.hidden); };

// ---------- nákup na vlastní období: volná zelenina jako souhrnná položka ----------
const _50range = rangeItems;
rangeItems = function (from, to) {
  const r = _50range(from, to); const z = r.items.find(i => i.id === 'zelenina_volna');
  if (z) { const g = parseFloat(z.mnozstvi.replace(',', '.')) * (/kg/.test(z.mnozstvi) ? 1000 : 1); const g50 = Math.round(g / 50) * 50;
    z.mnozstvi = g50 >= 1000 ? `~${nf(g50 / 1000, 1)} kg` : `~${g50} g`; z.pozn = volnaNote(); z.kat = 'Ovoce a zelenina'; }
  return r;
};
