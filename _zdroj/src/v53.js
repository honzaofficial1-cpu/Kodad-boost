// ===================== v2.39: Tréninkové plány – všechny tréninky pod sebou, série a rozsahy na jednom místě =====================
function plTpls() {
  const p = S.program, seen = new Set(), out = [];
  (p && p.on && p.cycle || []).forEach(d => { const t = d && tplById(d.tid); if (t && !seen.has(t.id)) { seen.add(t.id); out.push({ t, focus: d.focus || '' }); } });
  return { main: out, rest: S.templates.filter(t => !seen.has(t.id)) };
}
const plN = (t, ex) => (t.n && t.n[ex.id]) || ex.sets.length;
const plSets = (t, ex) => adjSets(ex.sets, plN(t, ex));
function plRangeTxt(sets) { return sets.map(c => `${c.min}–${c.max}${c.fail ? '<sup>F</sup>' : ''}`).join(' / '); }
function plBlock(t, focus, open) {
  const exs = t.ex.map(exById).filter(Boolean);
  const total = exs.reduce((a, ex) => a + plN(t, ex), 0);
  const rows = exs.map((ex, i) => {
    const sets = plSets(t, ex);
    return `<button class="plx" data-a="pl-ex" data-t="${t.id}" data-id="${ex.id}"><span class="plno">${i + 1}</span><span class="pln"><b>${esc(ex.name)}</b>${ex.hold ? `<small>${esc(ex.hold)}</small>` : ex.uni ? '<small>jednoručně / jednonož</small>' : ''}</span><span class="pls"><em>${sets.length}×</em>${ex.hold ? '' : plRangeTxt(sets)}</span></button>`;
  }).join('');
  return `<section class="plt">
    <div class="plth"><div><h2>${esc(t.name)}</h2><small>${focus ? esc(focus) + ' · ' : ''}${CVK(exs.length)} · ${total} pracovních sérií</small></div>
      <button class="btn sm" data-a="pl-tpl" data-id="${t.id}">${ico('edit')} Sestava</button></div>
    <div class="plxs">${rows || '<div class="empty">Bez cviků</div>'}</div></section>`;
}
vTpls = function () {
  const { main, rest } = plTpls();
  return `<div class="wrap">
    ${hdr(backBtn('gym'), '<h1>Tréninkové plány</h1>', `<button class="round" data-a="tpl-new" aria-label="Nový trénink">${ico('plus')}</button>`)}
    <p class="mut" style="font-size:14px;margin:0 4px 16px">Klepni na cvik a uprav počet sérií a rozsah. „Sestava“ = přidat, odebrat nebo přeházet cviky.</p>
    ${main.map(m => plBlock(m.t, m.focus)).join('')}
    ${rest.length ? `<div class="lbl" style="margin:26px 6px 10px">Ostatní tréninky · mimo rotaci</div>
      <div class="list">${rest.map(t => `<button class="li" data-a="pl-tpl" data-id="${t.id}"><div class="t"><b>${esc(t.name)}</b><small>${CVK(t.ex.length)}</small></div><span class="chev">${ico('chev')}</span></button>`).join('')}</div>` : ''}
    ${!main.length && !rest.length ? '<div class="empty">Zatím žádný trénink.</div>' : ''}
  </div>${tabs()}`;
};
A['pl-tpl'] = b => { tplDraft = JSON.parse(JSON.stringify(tplById(b.dataset.id))); go('tpl'); };

// editor série + rozsahy pro cvik v konkrétním tréninku
let plDraft = null;
A['pl-ex'] = b => {
  const t = tplById(b.dataset.t), ex = exById(b.dataset.id); if (!t || !ex) return;
  plDraft = { tid: t.id, id: ex.id, sets: plSets(t, ex).map(c => ({ min: c.min, max: c.max, fail: !!c.fail })) }; plDraw();
};
function plDraw() {
  const d = plDraft, t = tplById(d.tid), ex = exById(d.id);
  const others = S.templates.filter(x => x.id !== t.id && x.ex.includes(ex.id)).map(x => x.name);
  sheet(`<h2>${esc(ex.name)}</h2><p class="mut" style="margin:4px 0 0">${esc(t.name)}</p>
    ${ex.hold ? `<p class="mut" style="margin:14px 2px 0">${esc(ex.hold)} · bez váhy a opakování</p>` : ''}
    <div class="plcnt"><span>Pracovní série</span><div><button class="round" data-a="pl-n" data-v="-1" aria-label="Ubrat sérii" ${d.sets.length > 1 ? '' : 'disabled'}>${ico('minus')}</button><b>${d.sets.length}</b><button class="round" data-a="pl-n" data-v="1" aria-label="Přidat sérii" ${d.sets.length < 6 ? '' : 'disabled'}>${ico('plus')}</button></div></div>
    ${ex.hold ? '' : `<div class="plgh"><span></span><span>Od</span><span>Do</span><span>F</span></div>
    <div style="display:grid;gap:8px" id="pl-sets">${d.sets.map((c, i) => `<div class="setcfg" data-i="${i}"><span class="n">${i + 1}.</span><input class="inp" inputmode="numeric" data-sf="min" value="${c.min}" aria-label="Od"><input class="inp" inputmode="numeric" data-sf="max" value="${c.max}" aria-label="Do"><button class="fb ${c.fail ? 'on' : ''}" data-a="pl-fail" data-i="${i}" aria-label="Do selhání">F</button></div>`).join('')}</div>`}
    ${others.length && !ex.hold ? `<p class="mut" style="font-size:13px;margin:14px 2px 0">Rozsah platí pro cvik všude, takže i v ${others.map(esc).join(', ')}. Počet sérií jen v ${esc(t.name)}.</p>` : ''}
    <div class="actions"><button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="pl-save">Uložit</button></div>`);
}
function plRead() { $$('#pl-sets .setcfg').forEach(r => { const c = plDraft.sets[+r.dataset.i]; c.min = num($('[data-sf=min]', r).value) ?? c.min; c.max = num($('[data-sf=max]', r).value) ?? c.max; }); }
A['pl-fail'] = b => { plRead(); const c = plDraft.sets[+b.dataset.i]; c.fail = !c.fail; plDraw(); };
A['pl-n'] = b => { plRead(); const s = plDraft.sets, v = +b.dataset.v; if (v > 0 && s.length < 6) s.push({ ...s[s.length - 1] }); if (v < 0 && s.length > 1) s.pop(); plDraw(); };
A['pl-save'] = () => {
  plRead(); const d = plDraft; if (d.sets.some(c => !(c.min >= 1) || c.min > c.max)) return toast('Od musí být menší nebo rovno Do');
  const t = tplById(d.tid), ex = exById(d.id);
  d.sets.forEach((c, i) => { ex.sets[i] = { ...ex.sets[i], ...c }; });
  t.n = t.n || {}; t.n[ex.id] = d.sets.length;
  save(true); closeSheet(); render(); toast('Uloženo, platí od dalšího tréninku');
};
// po uložení / zrušení sestavy zpět do plánů (dělá už původní go('tpls'))

IC.minus = IC.minus || '<path d="M5 12h14"/>';

// v2.39.1: rychlý vstup do plánů z úvodu (i během tréninku) a z menu tréninku
const _53home = vHome;
vHome = function () {
  const h = _53home(); const i = h.indexOf('<div class="scard food'); if (i < 0) return h;
  const names = plTpls().main.map(m => esc(m.t.name)).join(' · ') || 'Tvoje tréninky';
  return h.slice(0, i) + `<button class="mvhome none" data-a="tab" data-v="tpls"><span class="lbl">Tréninkové plány</span><b>${names}</b>${ico('chev')}</button>` + h.slice(i);
};
const _53wm = A['w-menu'];
A['w-menu'] = function () {
  _53wm.apply(this, arguments); const list = $('#sheet .list');
  if (list) list.insertAdjacentHTML('beforeend', `<button class="li" data-a="pl-go"><div class="t"><b>Tréninkové plány</b><small>Série a rozsahy všech tréninků</small></div></button>`);
};
A['pl-go'] = () => { closeSheet(); go('tpls'); };
