
// ===================== v2.14: Jídlo v zelené · víc jídelníčků =====================
// zelená barva v celé sekci Jídlo
const _14render = render;
render = function () { document.documentElement.classList.toggle('food', !!(view.n && view.n.startsWith('f-'))); _14render(); };

// knihovna jídelníčků: výchozí + nahrané, jeden aktivní
const JL_KEY = 'kodadboost.jdlib';
function jlLoad() {
  let L = null; try { L = JSON.parse(localStorage.getItem(JL_KEY) || 'null'); } catch (e) { }
  if (!L) { L = { act: 'default', items: {} }; try { const old = localStorage.getItem(JD_KEY); if (old) { const j = JSON.parse(old); const id = 'j' + Date.now(); L.items[id] = { data: j, added: today() }; L.act = id; localStorage.removeItem(JD_KEY); } } catch (e) { } jlSave(L); }
  return L;
}
function jlSave(L) { try { localStorage.setItem(JL_KEY, JSON.stringify(L)); return true; } catch (e) { toast('Na další jídelníček už není místo – nějaký smaž'); return false; } }
function jlApply() { const L = jlLoad(); const it = L.act !== 'default' && L.items[L.act]; JD = it ? it.data : JD_DEFAULT; }
jlApply();

const jdRow = (id, j, act, added) => `<div class="fjl ${act ? 'on' : ''}"><button class="t" data-a="f-jdact" data-id="${id}"><span class="rd"></span><span><b>${esc(j.meta?.nazev || 'Jídelníček')}</b><small>verze ${esc(j.meta?.verze || '–')} · ${j.recepty.length} receptů${added ? ' · nahráno ' + fday(added) : ' · v aplikaci'}</small></span></button>${id !== 'default' ? `<button class="round" style="width:38px;height:38px" data-a="f-jddel" data-id="${id}" aria-label="Smazat">${ico('trash')}</button>` : ''}</div>`;
XV['f-set'] = function () {
  const f = F(); const td = tDays(); const L = jlLoad();
  return `<div class="wrap">${fHdr('Nastavení jídla', '<span></span>')}
    <div class="form" style="margin-top:0"><label class="f">Start – pondělí týdne A<input type="date" id="fs-start2" value="${f.start || ''}"></label></div>
    <div class="fsec"><div class="lbl">Jídelníček</div>
      <div class="fjls">${jdRow('default', JD_DEFAULT, L.act === 'default')}${Object.entries(L.items).map(([id, it]) => jdRow(id, it.data, L.act === id, it.added)).join('')}</div>
      <label class="btn white block" style="margin-top:12px">${ico('plus')} Nahrát jiný jídelníček<input type="file" id="f-imp2" accept="application/json,.json" hidden></label>
      <p class="mut" style="font-size:12px;margin:8px 2px 0">Soubor .json ve stejném formátu (suroviny, recepty, cyklus). Přepnutím se změní jen jídla a nákupy – měření, odškrtnutí, suplementy a krok zůstanou.</p></div>
    <div class="fsec"><div class="lbl">Tréninkové dny</div><div class="fdays">${DNY.map(d => `<button data-a="f-td" data-v="${d}" class="${td.includes(d) ? 'on' : ''}">${d}</button>`).join('')}</div>
      <p class="mut" style="font-size:13px;margin:8px 2px 0">${f.tdays ? 'Vlastní volba.' : 'Podle tvého plánu v gymu.'} Svačiny P1/P4/P5 se dají do tréninkových dnů, P3/P6 do volných.</p></div>
    <div class="fsec"><button class="btn block" data-a="f-export">${ico('share')} Export pro výživu</button></div>
    <p class="mut" style="font-size:12px;margin:16px 2px">${esc(JD.meta.upozorneni || '')}</p>
  </div>${tabs()}`;
};
document.addEventListener('change', async ev => {
  if (ev.target.id !== 'f-imp2') return; const file = ev.target.files[0]; if (!file) return;
  try {
    const j = JSON.parse(await file.text()); if (!j.cyklus || !j.recepty || !j.suroviny || !j.urovne_prijmu) throw 0;
    const L = jlLoad(); const same = Object.entries(L.items).find(([, it]) => it.data.meta?.nazev === j.meta?.nazev && it.data.meta?.verze === j.meta?.verze);
    const id = same ? same[0] : 'j' + Date.now(); L.items[id] = { data: j, added: today() }; L.act = id;
    if (!jlSave(L)) return; jlApply(); render(); toast(`Nahráno: ${j.meta?.nazev || 'jídelníček'}`);
  } catch (e) { toast('Tohle není soubor jídelníčku'); }
  ev.target.value = '';
});
A['f-jdact'] = b => { const L = jlLoad(); L.act = b.dataset.id; jlSave(L); jlApply(); render(); toast('Aktivní: ' + (JD.meta?.nazev || '')); };
A['f-jddel'] = b => { const L = jlLoad(); delete L.items[b.dataset.id]; if (L.act === b.dataset.id) L.act = 'default'; jlSave(L); jlApply(); render(); toast('Smazáno'); };

// na stránce Dnes: který jídelníček běží + rychlá změna
const _14fden = XV['f-den'];
XV['f-den'] = function () {
  const h = _14fden(); if (!F().start) return h.replace('<button class="btn white" data-a="f-start">Začít</button>', `<button class="btn white" data-a="f-start">Začít</button><label class="btn">Nahrát jiný jídelníček<input type="file" id="f-imp2" accept="application/json,.json" hidden></label>`);
  return h.replace(/(<\/div>)(<nav class="tabs ftabs">)/, `<button class="fjcur" data-a="tab" data-v="f-set"><span>${esc(JD.meta?.nazev || 'Jídelníček')} · ${esc(JD.meta?.verze || '')}</span><b>Změnit</b></button>$1$2`);
};
