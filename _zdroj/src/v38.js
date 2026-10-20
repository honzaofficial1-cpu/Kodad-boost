
// ===================== v2.19: alkohol jako ikonka · Dnes bez horní lišty · vyplněné hodnocení · úprava aktivit =====================
// Dnes: horní lišta pryč, u Suplementů jen vykřičník
remindersF = () => '';
const _19tabs = tabs;
tabs = () => { const h = _19tabs(); return view.n && view.n.startsWith('f-') && supAlerts().length ? h.replace(/(data-v="f-sup"[^>]*>)/, '$1<i class="tbang" aria-label="Něco dochází">!</i>') : h; };

// bez alkoholu: jen malá ikonka v hlavičce, počet dní po klepnutí
sobCard = () => '';
const _19fden = XV['f-den'];
XV['f-den'] = function () { return _19fden().replace(/<button class="fsobr"[\s\S]*?<\/button>/, ''); };
const ICO_SOB = `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5h4M10.5 2.5v4.2c0 .8-.4 1.5-1 2-1.2.9-2 2.3-2 3.9v7.4c0 .8.7 1.5 1.5 1.5h6c.8 0 1.5-.7 1.5-1.5v-7.4c0-1.6-.8-3-2-3.9-.6-.5-1-1.2-1-2V2.5"/><path d="M4 4l16 16"/></svg>`;
const _19render = render;
render = function () {
  _19render();
  if (['f-den', 'f-tyden', 'f-nakup', 'f-sup', 'f-vyvoj'].includes(view.n)) { const h = $('#app .hdr'); const r = h && h.lastElementChild;
    if (r && !h.querySelector('[data-a=sob-open]')) { const g = document.createElement('div'); g.className = 'hbtns'; r.replaceWith(g); g.insertAdjacentHTML('beforeend', `<button class="round sobb ${SOB().since ? 'on' : ''}" data-a="sob-open" aria-label="Bez alkoholu">${ICO_SOB}</button>`); g.appendChild(r); h.classList.add('h2b'); } }
  rateFill(document);
};
function sobYMD(from, to) {
  const a = pdate(from), b = pdate(to); let m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth(); if (b.getDate() < a.getDate()) m--;
  const mid = pdate(addMo(from, m)); const d = Math.round((toU(dkey(b)) - toU(dkey(mid))) / DMS); const y = Math.floor(m / 12); m %= 12;
  return [y && pl(y, 'rok', 'roky', 'let'), m && pl(m, 'měsíc', 'měsíce', 'měsíců'), (d || (!y && !m)) && pl(d, 'den', 'dny', 'dní')].filter(Boolean);
}
A['sob-open'] = () => {
  const o = SOB(); const n = sobDays(); if (n == null) return A['sob-set']();
  const ymd = S.settings.sobFmt === 'ym'; const nx = SOB_T.find(t => t > n), pv = [...SOB_T].reverse().find(t => t <= n) || 0;
  const parts = sobYMD(o.since, today());
  sheet(`<div class="sobs"><div class="lbl">Bez alkoholu</div>
    <button class="sobnum" data-a="sob-fmt">${ymd ? parts.map(p => { const [v, ...w] = p.split(' '); return `<span><b>${v}</b><small>${w.join(' ')}</small></span>`; }).join('') : `<span><b>${thou(n)}</b><small>${nDays(n)}</small></span>`}</button>
    <div class="seg sm" style="margin-top:6px"><button data-a="sob-fmt" data-v="d" class="${ymd ? '' : 'on'}">Dny</button><button data-a="sob-fmt" data-v="ym" class="${ymd ? 'on' : ''}">Měsíce a dny</button></div>
    <p class="mut" style="margin:12px 2px 0">od ${fdate(o.since)}${o.best > n ? ` · nejdelší série ${o.best} ${nDays(o.best)}` : ''}</p>
    ${nx ? `<div class="fsobbar"><i style="width:${Math.round((n - pv) / (nx - pv) * 100)}%"></i></div><p class="fsobnx">Odznak ${nx} dní – zbývá ${nx - n} ${nDays(nx - n)}</p>` : '<p class="fsobnx">Všechny odznaky máš.</p>'}</div>
    <div class="actions"><button class="btn" data-a="sob-set">Upravit datum</button><button class="btn" data-a="sob-reset">Napil jsem se</button></div>`);
};
A['sob-fmt'] = b => { const v = b.dataset.v || (S.settings.sobFmt === 'ym' ? 'd' : 'ym'); S.settings.sobFmt = v; save(); A['sob-open'](); };

// hodnocení 1–5: zelená se natáhne až k vybranému číslu
function rateFill(root) {
  (root.querySelectorAll ? root : document).querySelectorAll('.seg').forEach(sg => { const bs = [...sg.children]; if (bs.length < 3 || !bs.every(b => /^\d$/.test(b.textContent.trim()))) return;
    sg.classList.add('rate'); const i = bs.findIndex(b => b.classList.contains('on')); bs.forEach((b, j) => b.classList.toggle('in', i >= 0 && j <= i)); });
}
const _19bseg = A.bseg; A.bseg = b => { _19bseg(b); rateFill(b.parentElement.parentElement); };

// aktivita: dá se změnit, co to bylo (minuty jsou v úpravě)
const _19actSheet = actSheet;
actSheet = function (type, k, id) {
  _19actSheet(type, k, id); if (!id) return; const a = S.activities.find(x => x.id === id); const f = $('#sheet .form'); if (!a || !f) return;
  f.insertAdjacentHTML('afterbegin', `<label class="f">Co to bylo<select id="a-type">${Object.entries(ACT_TYPES).map(([k2, v]) => `<option value="${k2}" ${k2 === a.type ? 'selected' : ''}>${v.name}</option>`).join('')}</select></label>`);
};
document.addEventListener('change', e => {
  if (e.target.id !== 'a-type') return; const id = $('#sheet [data-a=act-save]')?.dataset.id; const a = id && S.activities.find(x => x.id === id); if (!a) return;
  a.type = e.target.value; if (a.type === 'bike' && !a.kind) a.kind = 'Rotoped'; save(true); actSheet(a.type, a.date, id); render(); toast('Změněno na ' + ACT_TYPES[a.type].name);
});

// ---------- bez alkoholu: listovací stránky (dny · měsíce a dny · týdny a dny · hodiny) ----------
function sobPages(o, n) {
  const a = pdate(o.since), b = new Date(); let m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth(); if (b.getDate() < a.getDate()) m--;
  const dm = daysBetween(addMo(o.since, m), today()); const h = Math.floor((Date.now() - a.getTime()) / 36e5);
  const circ = (x, l) => `<div class="sobc"><b>${thou(x)}</b><span>${l}</span></div>`;
  const two = (v1, l1, v2, l2) => `<div class="sobcs">${circ(v1, l1)}${circ(v2, l2)}</div>`;
  return [
    `<div class="sobbig"><b>${thou(n)}</b><span>${nDays(n)}</span></div>`,
    two(m, pl(m, 'měsíc', 'měsíce', 'měsíců').split(' ')[1], dm, nDays(dm)),
    two(Math.floor(n / 7), pl(Math.floor(n / 7), 'týden', 'týdny', 'týdnů').split(' ')[1], n % 7, nDays(n % 7)),
    `<div class="sobbig"><b>${thou(h)}</b><span>${pl(h, 'hodina', 'hodiny', 'hodin').split(' ')[1]}</span></div>`,
  ];
}
A['sob-open'] = () => {
  const o = SOB(); const n = sobDays(); if (n == null) return A['sob-set']();
  const P = sobPages(o, n); const pg = Math.min(P.length - 1, S.settings.sobPg || 0); const nx = SOB_T.find(t => t > n), pv = [...SOB_T].reverse().find(t => t <= n) || 0;
  sheet(`<div class="sobs"><p class="sobt">Bez alkoholu už</p>
    <div class="sobcar">${P.map(p => `<div class="sobp">${p}</div>`).join('')}</div>
    <div class="sobdots">${P.map((_, i) => `<i class="${i === pg ? 'on' : ''}"></i>`).join('')}</div>
    <p class="mut" style="margin:14px 2px 0;text-align:center">od ${fdate(o.since)}${o.best > n ? ` · nejdelší série ${o.best} ${nDays(o.best)}` : ''}</p>
    ${nx ? `<div class="fsobbar"><i style="width:${Math.round((n - pv) / (nx - pv) * 100)}%"></i></div><p class="fsobnx">Odznak ${nx} dní – zbývá ${nx - n} ${nDays(nx - n)}</p>` : '<p class="fsobnx">Všechny odznaky máš.</p>'}</div>
    <div class="actions"><button class="btn" data-a="sob-set">Upravit datum</button><button class="btn" data-a="sob-reset">Napil jsem se</button></div>`, el => {
    const c = el.querySelector('.sobcar'); const dots = [...el.querySelectorAll('.sobdots i')];
    requestAnimationFrame(() => { c.scrollLeft = pg * c.clientWidth; });
    c.addEventListener('scroll', () => { const i = Math.round(c.scrollLeft / c.clientWidth); dots.forEach((d, j) => d.classList.toggle('on', j === i)); if (S.settings.sobPg !== i) { S.settings.sobPg = i; save(); } }, { passive: true });
  });
};
