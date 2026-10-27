
// ===================== v2.24: MOTIVACE – fotky inspirace (jen v telefonu) + proč to dělám =====================
const MV = () => (S.motiv = S.motiv || { photos: [], why: [] });
const MURL = new Map();
async function mvUrl(id) { if (MURL.has(id)) return MURL.get(id); const f = await fGet(id).catch(() => null); if (!f) return null; const u = URL.createObjectURL(f.blob); MURL.set(id, u); return u; }
function mvFill() { document.querySelectorAll('img[data-mid]:not([src])').forEach(async im => { const u = await mvUrl(im.dataset.mid); if (u) im.src = u; else im.closest('.mvph')?.classList.add('miss'); }); }
// zmenšení fotky před uložením (šetří místo v telefonu)
function shrink(file, max, q) { return new Promise((res, rej) => { const img = new Image(); const u = URL.createObjectURL(file);
  img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/jpeg', q); };
  img.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); }; img.src = u; }); }
const todayPhoto = () => { const P = MV().photos; return P.length ? P[Math.floor(toU(today()) / DMS) % P.length] : null; };

XV.motiv = function () {
  const M = MV(); const P = M.photos;
  return `<div class="wrap mv">${hdr(backBtn('home'), '<h1>Motivace</h1>', '<span></span>')}
    <div class="sthd" style="margin-top:4px"><b>Proč to dělám</b><button class="lnk" data-a="mv-why" data-i="-1">+ Přidat</button></div>
    ${M.why.length ? `<div class="mvwhy">${M.why.map((w, i) => `<button data-a="mv-why" data-i="${i}"><span>${i + 1}</span><p>${esc(w)}</p></button>`).join('')}</div>`
      : '<button class="mvempty" data-a="mv-why" data-i="-1">Napiš si 2–3 důvody vlastními slovy. Ukážou se tu a občas na Domů.</button>'}
    <div class="sthd" style="margin-top:22px"><b>Inspirace</b><small>${P.length ? P.length + ' ' + pl(P.length, 'fotka', 'fotky', 'fotek').split(' ')[1] : ''}</small></div>
    <div class="mvgrid">${P.map((p, i) => `<button class="mvph" data-a="mv-open" data-i="${i}"><img data-mid="${p.id}" alt="${esc(p.cap || 'Inspirace')}">${p.cap ? `<span>${esc(p.cap)}</span>` : ''}</button>`).join('')}
      <label class="mvadd">${ico('plus')}<span>Přidat fotky</span><input type="file" id="mv-file" accept="image/*" multiple hidden></label></div>
    <p class="mut" style="font-size:12px;margin:14px 2px 0">Fotky zůstávají jen v tomto telefonu (zmenšené, ať nezabírají místo). Do zálohy se ukládají jen popisky a důvody.</p>
  </div>${tabs()}`;
};
const _24render = render;
render = function () { _24render(); if (document.querySelector('img[data-mid]:not([src])')) mvFill(); };
document.addEventListener('change', async e => {
  if (e.target.id !== 'mv-file') return; const files = [...e.target.files]; e.target.value = ''; if (!files.length) return; toast('Ukládám…');
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
    for (const f of files) { const b = await shrink(f, 1600, .85); const id = 'm' + uid(); await fPut(id, { name: f.name, type: 'image/jpeg', blob: b }); MV().photos.push({ id, cap: '', added: today() }); }
    save(true); render(); toast(files.length > 1 ? `Přidáno ${files.length} fotek` : 'Fotka přidána');
  } catch (err) { toast('Fotku se nepodařilo uložit'); }
});
A['mv-open'] = async b => { const i = +b.dataset.i; const p = MV().photos[i]; if (!p) return; const u = await mvUrl(p.id);
  sheet(`<div class="mvfull">${u ? `<img src="${u}" alt="">` : '<p class="mut">Fotka v tomto telefonu není.</p>'}</div>
    <div class="form"><label class="f">Popisek<input id="mv-cap" maxlength="80" value="${esc(p.cap || '')}" placeholder="např. takhle chci vypadat v létě"></label></div>
    <div class="actions"><button class="btn danger" data-a="mv-del" data-i="${i}" aria-label="Smazat">${ico('trash')}</button><button class="btn" data-a="close">Zavřít</button><button class="btn white" data-a="mv-cap" data-i="${i}">Uložit</button></div>`); };
A['mv-cap'] = b => { const p = MV().photos[+b.dataset.i]; if (!p) return; p.cap = $('#mv-cap').value.trim(); save(true); closeSheet(); render(); };
A['mv-del'] = b => { const i = +b.dataset.i; const p = MV().photos[i]; if (!p) return; fDel(p.id).catch(() => { }); if (MURL.has(p.id)) { URL.revokeObjectURL(MURL.get(p.id)); MURL.delete(p.id); } MV().photos.splice(i, 1); save(true); closeSheet(); render(); toast('Smazáno'); };
A['mv-why'] = b => { const i = +b.dataset.i; const w = i >= 0 ? MV().why[i] : '';
  sheet(`<h2>${i >= 0 ? 'Upravit důvod' : 'Proč to dělám'}</h2><div class="form"><label class="f">Vlastními slovy<textarea id="mv-w" maxlength="200" rows="3" placeholder="např. chci mít sílu a energii na celý den">${esc(w)}</textarea></label></div>
    <div class="actions">${i >= 0 ? `<button class="btn danger" data-a="mv-wdel" data-i="${i}" aria-label="Smazat">${ico('trash')}</button>` : ''}<button class="btn" data-a="close">Zrušit</button><button class="btn white" data-a="mv-wsave" data-i="${i}">Uložit</button></div>`); };
A['mv-wsave'] = b => { const v = $('#mv-w').value.trim(); if (!v) return closeSheet(); const i = +b.dataset.i; if (i >= 0) MV().why[i] = v; else MV().why.push(v); save(true); closeSheet(); render(); };
A['mv-wdel'] = b => { MV().why.splice(+b.dataset.i, 1); save(true); closeSheet(); render(); };
// Domů: dnešní inspirace (každý den jiná fotka) nebo pozvánka k přidání
const _24vHome = vHome;
vHome = function () {
  const h = _24vHome(); const M = MV(); const p = todayPhoto(); const why = M.why.length ? M.why[Math.floor(toU(today()) / DMS) % M.why.length] : '';
  const card = p ? `<button class="mvhome" data-a="tab" data-v="motiv"><img data-mid="${p.id}" alt=""><span class="lbl">Inspirace</span><b>${esc(p.cap || why || 'Proč to dělám')}</b></button>`
    : `<button class="mvhome none" data-a="tab" data-v="motiv"><span class="lbl">Motivace</span><b>${why ? esc(why) : 'Přidej fotky inspirace a proč to děláš'}</b>${ico('chev')}</button>`;
  const T = document.createElement('template'); T.innerHTML = h; const last = [...T.content.querySelectorAll('.scard')].pop() || T.content.querySelector('.gcard');
  if (last) { last.insertAdjacentHTML('afterend', card); return T.innerHTML; } return h.replace('<div class="hgrid">', card + '<div class="hgrid">');
};
const _24tabs = tabs;
tabs = () => view.n === 'motiv' ? _24tabs().replace('data-v="home" class="', 'data-v="home" class="on ') : _24tabs();
