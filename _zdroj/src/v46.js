
// ===================== v2.26: jídelníček v2.2 (várky Ne + St), nákup online =====================

// ---------- předchozí vestavěná verze (2.1) jde vrátit: stáhne se jednou z webu do knihovny ----------
(function () {
  const need = S.settings.jdPrevNeed; if (!need) return;
  const ver = need.split('@')[0]; const url = `plany/jidelnicek-${ver}.json`;
  fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject()).then(j => {
    if (j.meta?.format !== 'nabiraci-system') throw 0;
    const L = jlLoad(); const id = 'v' + ver.replace(/\W/g, '_'); L.items[id] = { data: j, added: today() };
    if (!L.prev || L.prev === 'default') L.prev = id; if (!jlSave(L)) return; delete S.settings.jdPrevNeed; save();
  }).catch(() => { /* offline – zkusí se při dalším spuštění */ });
})();

// ---------- nákup: co se kupuje online ----------
// uloženo v S.food (moje data) podle id suroviny → přežije nahrání nové verze plánu
const ON = () => { const f = F(); f.online = f.online || {}; f.onlineCustom = f.onlineCustom || [];
  if (!f.onlineInit) { f.onlineInit = 1; ['sardinky', 'ryzova_kase', 'whey'].forEach(s => { if (JD.suroviny[s] && !f.online[s]) f.online[s] = { kde: '', baleni: '' }; }); save(); }
  return f; };
const onId = id => String(id).replace(/^(z|step|sw):/, '');
const onNote = (s, fallback) => { const o = ON().online[s]; if (!o) return fallback; const b = o.baleni ? `po ${o.baleni}` : ''; return [o.kde, b].filter(Boolean).join(' · ') || (fallback ? `${fallback} · doplň, kde to kupuješ` : 'doplň, kde to kupuješ'); };
CATS.push('Online');
function onMark(items, withCustom) {
  const O = ON().online;
  items.forEach(i => { if (i.own != null || String(i.id).startsWith('c:')) return; const s = onId(i.id); if (!O[s]) return; i.kat = 'Online'; i.pozn = onNote(s, i.pozn); });
  if (withCustom) ON().onlineCustom.forEach((c, n) => items.push({ id: 'oc:' + n, nazev: c.nazev, mnozstvi: '', pozn: [c.kde, c.baleni ? `po ${c.baleni}` : ''].filter(Boolean).join(' · '), kat: 'Online' }));
  return items;
}
const _46shop = shopItems; shopItems = function (wi, list) { return onMark(_46shop(wi, list), list === 'Z'); };
const _46range = rangeItems; rangeItems = function (from, to) { const r = _46range(from, to); onMark(r.items, false); return r; };
const _46nakup = XV['f-nakup'];
XV['f-nakup'] = function () {
  let h = _46nakup(); const f = ON(); const n = Object.keys(f.online).length + f.onlineCustom.length;
  h = h.replace('<div class="lbl">Online</div>', `<div class="lbl fonl"><span>Online – objednat</span><button data-a="on-man">Upravit</button></div>`);
  return h.replace('<div class="fadd">', `<button class="fonm" data-a="on-man"><span><b>Co kupuju online</b><small>${n ? `${n} ${n === 1 ? 'položka' : n < 5 ? 'položky' : 'položek'} mimo obchod` : 'nic – všechno v obchodě'}</small></span>${ico('chev')}</button><div class="fadd">`);
};

function onSheet() {
  const f = ON(); const all = Object.keys(JD.suroviny).sort((a, b) => SUR(a).nazev.localeCompare(SUR(b).nazev, 'cs'));
  const mine = all.filter(s => f.online[s]); const rest = all.filter(s => !f.online[s]);
  const orphan = Object.keys(f.online).filter(s => !JD.suroviny[s]); // surovina zmizela z plánu – nech, ať se nemaže
  const row = (a, id, name, o, extra) => `<button class="li" data-a="${a}" data-v="${esc(id)}"><div class="t"><b>${esc(name)}</b><small>${esc([o.kde, o.baleni ? 'po ' + o.baleni : ''].filter(Boolean).join(' · ') || 'doplň, kde a po kolika se prodává')}${extra || ''}</small></div>${ico('chev')}</button>`;
  return `<h2>Co kupuju online</h2><p class="mut" style="margin:4px 0 0">Tyhle položky zmizí z nákupu v obchodě a ukážou se dole v seznamu jako „Online – objednat“. Zůstanou i po nahrání nové verze jídelníčku.</p>
    <div class="list" style="margin-top:14px">${mine.map(s => row('on-edit', s, SUR(s).nazev, f.online[s])).join('')}
      ${f.onlineCustom.map((c, i) => row('on-cedit', i, c.nazev, c, ' · vlastní')).join('')}
      ${orphan.map(s => row('on-edit', s, s, f.online[s], ' · v aktuálním plánu není')).join('')}
      ${!mine.length && !f.onlineCustom.length ? '<p class="mut" style="margin:6px 2px">Zatím nic. Vyber surovinu dole.</p>' : ''}</div>
    <div class="lbl" style="margin:18px 2px 8px">Přesunout do online</div>
    <div class="chips fonch">${rest.map(s => `<button class="chip" data-a="on-add" data-v="${s}">${esc(SUR(s).nazev.split(' (')[0])}</button>`).join('')}</div>
    <div class="lbl" style="margin:18px 2px 8px">Vlastní online položka</div>
    <div class="fadd" style="margin-top:0"><input id="on-own" placeholder="např. Kreatin"><button class="btn white" data-a="on-cadd">Přidat</button></div>
    <div class="actions"><button class="btn white" data-a="on-close">Hotovo</button></div>`;
}
const onEditSheet = (title, o, del, sv, id) => sheet(`<h2>${esc(title)}</h2><div class="form">
    <label class="f">Kde (obchod, web)<input id="on-kde" value="${esc(o.kde || '')}" placeholder="např. vilgain.cz"></label>
    <label class="f">Po kolika se prodává<input id="on-bal" value="${esc(o.baleni || '')}" placeholder="např. 120 g, 1 kg, 6 ks"></label></div>
    <div class="actions"><button class="btn" data-a="${del}" data-v="${esc(id)}">${del === 'on-del' ? 'Vrátit do obchodu' : 'Smazat'}</button><button class="btn white" data-a="${sv}" data-v="${esc(id)}">Uložit</button></div>`);
A['on-man'] = () => sheet(onSheet());
A['on-close'] = () => { closeSheet(); render(); };
A['on-add'] = b => { ON().online[b.dataset.v] = { kde: '', baleni: '' }; save(true); A['on-edit'](b); };
A['on-edit'] = b => { const s = b.dataset.v; const o = ON().online[s] || {}; onEditSheet(JD.suroviny[s] ? SUR(s).nazev : s, o, 'on-del', 'on-save', s); };
A['on-save'] = b => { ON().online[b.dataset.v] = { kde: $('#on-kde').value.trim(), baleni: $('#on-bal').value.trim() }; save(true); sheet(onSheet()); render(); toast('Uloženo'); };
A['on-del'] = b => { delete ON().online[b.dataset.v]; save(true); sheet(onSheet()); render(); toast('Zpátky v nákupu v obchodě'); };
A['on-cadd'] = () => { const v = $('#on-own').value.trim(); if (!v) return; ON().onlineCustom.push({ nazev: v, kde: '', baleni: '' }); save(true); const i = ON().onlineCustom.length - 1; render(); onEditSheet(v, {}, 'on-cdel', 'on-csave', i); };
A['on-cedit'] = b => { const c = ON().onlineCustom[+b.dataset.v]; if (c) onEditSheet(c.nazev, c, 'on-cdel', 'on-csave', b.dataset.v); };
A['on-csave'] = b => { const c = ON().onlineCustom[+b.dataset.v]; if (c) { c.kde = $('#on-kde').value.trim(); c.baleni = $('#on-bal').value.trim(); } save(true); sheet(onSheet()); render(); toast('Uloženo'); };
A['on-cdel'] = b => { ON().onlineCustom.splice(+b.dataset.v, 1); save(true); sheet(onSheet()); render(); };

// ---------- recept: várka / čerstvě, typ svačiny, odhadnuté hodnoty surovin ----------
const _46fmeal = A['f-meal'];
A['f-meal'] = b => {
  _46fmeal(b); const r = RX()[b.dataset.id]; if (!r) return;
  const sub = $('#sheet h2 + p.mut'); const t = [];
  if (r.varka === true) t.push('várka 4 porce'); else if (r.varka === false) t.push('čerstvě na 1 porci');
  if (r.svacina_typ) t.push(r.svacina_typ === 'pred_treninkem' ? 'svačina před tréninkem' : 'svačina na volný den');
  if (sub && t.length) sub.insertAdjacentText('beforeend', ' · ' + t.join(' · '));
  const rows = $$s('#sheet .fing > div:not(.add)');
  r.suroviny.forEach((i, n) => { if (JD.suroviny[i.surovina]?.zdroj_kategorie === 3 && rows[n]) rows[n].querySelector('span').insertAdjacentHTML('beforeend', '<small>hodnoty jsou obecný odhad</small>'); });
};

// ---------- start jídelníčku: pondělí 23. 11. 2026 = týden A, den 1 (jednorázově) ----------
(function () {
  const NEW = '2026-11-23'; if (S.settings.start2311) return; const f = F(); const old = f.start;
  if (old && old !== NEW) { // odškrtnuté nákupy a vlastní položky posunout na nové číslování týdnů
    const d = Math.round(daysBetween(old, NEW) / 7);
    ['shop', 'custom'].forEach(n => { const o = f[n] || {}, x = {}; Object.entries(o).forEach(([k, v]) => { const m = /^(\d+):(N1|N2)$/.exec(k); if (!m) { x[k] = v; return; } const i = +m[1] - d; if (i >= 0) x[i + ':' + m[2]] = v; }); f[n] = x; });
  }
  f.start = NEW; S.settings.start2311 = 1; save(true);
})();
