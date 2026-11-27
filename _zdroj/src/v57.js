// ===================== v2.43: plán 3.2 · jednodušší jídlo (světlé, 4 záložky) · úvod: jídlo + trénink · ostřejší vzhled =====================

// ---------- plán 3.2: vážení stačí 3× týdně (každý den, občas obden) ----------
function minWFix() { try { const H = PN().hodnoceni; if (H && H.min_vazeni_za_tyden > 3) H.min_vazeni_za_tyden = 3; } catch (e) { } }
const _57jl = jlApply; jlApply = function () { _57jl(); minWFix(); }; minWFix();

// ---------- plán 3.2: pojistka fermentu (jogurt nebo kefír každý den) ----------
const FERM = ['recky_jogurt_0', 'jogurt_bily_3', 'kefir'];
const _57pd = planDayF;
planDayF = function (w, di, k) {
  const d = _57pd.apply(this, arguments); if (!d) return d; const R = RX();
  const has = SLOTS.some(([s]) => (R[d.jidla[s]]?.suroviny || []).some(i => FERM.includes(i.surovina))) || (d.upravy || []).some(u => FERM.includes(u.surovina) && u.g > 0);
  if (!has) { d.upravy = [...(d.upravy || []), { typ: 'ferment', surovina: 'kefir', g: 100, text: 'kefír 100 ml k obědu (ten den není jiný ferment)' }]; addN(d.soucet_dne, nutOf('kefir', 100)); }
  return d;
};

// ---------- recept podle 3.2: základ (bez štítků) · Volitelné (dochucení) · koření ----------
const VEG_ASIA = ['H7', 'H9', 'H13'];
function vegList(r) {
  const Z = JD.zobrazeni_zeleniny || {}; const V = Z.vhodna; if (!V) return '';
  const slot = (r.slot || '').toLowerCase(); const key = /snídaně|před tréninkem|svačina/.test(slot) ? 'snidane_a_svaciny_syrova' : VEG_ASIA.includes(r.kod) ? 'asijska_jidla' : 'tepla_jidla_a_vary';
  return `<div class="vegl"><p>${esc((V[key] || []).join(', '))}</p>${(V.kdykoli_navic || []).length ? `<p class="mut">Kdykoli navíc: ${esc(V.kdykoli_navic.join(', '))}</p>` : ''}</div>`;
}
const _57fm = A['f-meal'];
A['f-meal'] = function (b) {
  _57fm.apply(this, arguments); const r = RX()[b.dataset.id]; if (!r) return;
  $$('#sheet .ftg.nut').forEach(x => x.remove()); // v základu je nutné všechno
  const lb = $('#sheet .fdoch'); if (lb) lb.textContent = 'Volitelné (dochucení)';
  const ing = $('#sheet .fing'); if (ing && !$('#sheet .fkor')) ing.insertAdjacentHTML('beforeend', '<p class="fkor">Koření (skořice, paprika, oregano…) podle chuti.</p>');
  const zv = $('#sheet .fing > p.fveg'); const L = vegList(r);
  if (zv && L) { zv.classList.add('vegtap'); zv.insertAdjacentHTML('afterend', `<div class="vegbox" hidden>${L}</div>`); zv.onclick = () => { const x = zv.nextElementSibling; x.hidden = !x.hidden; }; }
};

// ---------- start kroku 0 (7. 12.): upozornění den předem a v den startu ----------
function startNote() {
  const f = F(); const s = f.calStart || '2026-12-07'; const t = today(); const d = daysBetween(t, s); if (d < 0 || d > 1) return '';
  if ((f.dismiss || {})['start' + s]) return '';
  const msg = d === 1 ? `<b>Zítra začíná plán na 3 400 kcal</b><span>Od pondělí krok 0. Ráno se zvaž a jez podle Dnes. První týden váha klidně skočí o 1–2 kg (voda a glykogen), to je v pořádku.</span>`
    : `<b>Dnes začíná plán na 3 400 kcal</b><span>Krok 0 a 4 týdny kalibrace. Važ se každé ráno (stačí aspoň 3× týdně). Po kalibraci ti appka řekne, jestli přidat.</span>`;
  return `<div class="startn">${msg}<button data-a="start-ok" data-v="${s}" aria-label="Zavřít">${ico('x')}</button></div>`;
}
A['start-ok'] = b => { const f = F(); (f.dismiss = f.dismiss || {})['start' + b.dataset.v] = 1; save(); render(); };

// ---------- JÍDLO: 4 záložky (Dnes · Týden · Nákup · Pokrok), suplementy pod Týdnem ----------
for (let i = FOOD_TABS.length - 1; i >= 0; i--) if (['f-sup', 'f-plan'].includes(FOOD_TABS[i][0])) FOOD_TABS.splice(i, 1);
FOOD_TABS.forEach(t => { if (t[0] === 'f-vyvoj') t[1] = 'Pokrok'; });
const _57tabs = tabs;
tabs = function () { const h = _57tabs(); if (view.n === 'f-plan' || view.n === 'f-sup') return h.replace(/(data-v="(?:f-vyvoj|f-tyden)")( class="")/, (m, a) => a + (((view.n === 'f-plan') === /f-vyvoj/.test(a)) ? ' class="on"' : ' class=""')); return h; };
const stripWrap = h => { const t = tabs(); let x = h.endsWith(t) ? h.slice(0, -t.length) : h; x = x.replace(/^\s*<div class="wrap[^"]*">/, '').replace(/<\/div>\s*$/, ''); return x.replace(/^\s*<header[\s\S]*?<\/header>/, ''); };
const _57vy = XV['f-vyvoj'];
XV['f-vyvoj'] = function () {
  let h = _57vy(); const plan = XV['f-plan'] ? stripWrap(XV['f-plan']()) : '';
  h = h.replace(/<h1>[^<]*<\/h1>/, '<h1>Pokrok</h1>');
  const cs = F().calStart || '2026-12-07'; if (today() < cs) h = h.replace(/(Kalibrace)\s*[–-]\s*týden\s*[-−–]?\d+\s*ze\s*\d+/gi, `$1 od ${fday(cs).replace(/^\S+ /, '')}`);
  const i = h.lastIndexOf('</div>' + tabs()); return i < 0 ? h : h.slice(0, i) + `<div class="pokplan"><div class="lbl" style="margin:30px 2px 10px">Plán a pravidla</div>${plan}</div>` + h.slice(i);
};
// Plán: texty 3.2 (trénink a svačina, thajský box, ranní trénink, méně vhodná zelenina)
const _57plan = XV['f-plan'];
XV['f-plan'] = function () {
  const h = _57plan(); const U = JD.urovne_prijmu || {}; const Z = JD.zobrazeni_zeleniny || {};
  const it = (t, x) => x ? `<details class="micd"><summary>${t}<span class="chev">${ico('chevd')}</span></summary><p class="pltxt">${esc(x)}</p></details>` : '';
  const mv = (Z.mene_vhodna || []).length ? `<details class="micd"><summary>Méně vhodná zelenina<span class="chev">${ico('chevd')}</span></summary>${Z.mene_vhodna.map(x => `<p class="pltxt"><b>${esc(x.co)}</b> – ${esc(x.proc)}</p>`).join('')}</details>` : '';
  const box = `<div class="pl32">${it('Trénink a svačina', U.pravidlo_treninkove_svaciny)}${it('Thajský box', U.thajsky_box)}${it('Ranní trénink', U.ranni_trenink)}${mv}</div>`;
  const i = h.lastIndexOf('</div>' + tabs()); return i < 0 ? h : h.slice(0, i) + box + h.slice(i);
};
// Týden: suplementy dole
const _57tyd = XV['f-tyden'];
XV['f-tyden'] = function () {
  const h = _57tyd(); const n = (F().sup || []).length;
  const row = `<button class="supln" data-a="tab" data-v="f-sup"><span><b>Suplementy</b><small>${n ? `${n} ${n === 1 ? 'doplněk' : n < 5 ? 'doplňky' : 'doplňků'} · zásoby, pauzy, časy` : 'přidat doplňky'}</small></span>${ico('chev')}</button>`;
  const i = h.lastIndexOf('</div>' + tabs()); return i < 0 ? h : h.slice(0, i) + row + h.slice(i);
};
// Dnes: upozornění na start + u suplementů odkaz na úpravu
const _57den = XV['f-den'];
XV['f-den'] = function () {
  let h = _57den(); const sn = startNote();
  if (sn) h = h.replace(/(<\/header>)/, `$1${sn}`);
  return h.replace('<div class="fsec"><div class="lbl">Suplementy</div>', '<div class="fsec"><div class="lbl fsuph">Suplementy<button data-a="tab" data-v="f-sup">Upravit</button></div>');
};

// ---------- ÚVOD: dvě hlavní věci – jídlo a trénink ----------
const _57home = vHome;
vHome = function () {
  const h = _57home(); const t = document.createElement('template'); t.innerHTML = h; const W = t.content.querySelector('.wrap') || t.content; const q = s => W.querySelector(s);
  const g = q('.gcard'), food = q('.scard.food'), hq = q('.hqk'), pl = q('[data-v="tpls"].mvhome'), date = q('.hdate');
  [hq, pl].forEach(x => x && x.remove());
  if (food) { food.classList.add('home-food'); const lb = food.querySelector('.lbl'); if (lb) lb.textContent = 'Jídelníček'; }
  if (g) { g.classList.add('home-gym'); const lb = g.querySelector('.lbl'); if (lb && /^Trénink v gymu/i.test(lb.textContent)) lb.textContent = 'Trénink'; }
  const live = g && g.classList.contains('live');
  const links = document.createElement('div'); links.className = 'hlinks';
  links.innerHTML = `<button data-a="tab" data-v="tpls">Plány</button><button data-a="tab" data-v="prog">Statistiky</button><button data-a="tab" data-v="gym">Gym</button>`;
  const anchor = date ? date.nextSibling : W.firstChild; const first = live ? g : food, second = live ? food : g;
  [first, second].filter(Boolean).forEach(x => W.insertBefore(x, anchor));
  if (g) g.after(links);
  const sn = startNote(); if (sn && date) date.insertAdjacentHTML('afterend', sn);
  return t.innerHTML;
};

// ---------- světlé Jídlo: dorovnat natvrdo světlé texty ze starších stylů ----------
function lum(c) { const m = (c || '').match(/[\d.]+/g); if (!m) return null; if (m.length > 3 && +m[3] === 0) return null; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; }
function bgLum(e) { for (let x = e; x && x !== document.body; x = x.parentElement) { const l = lum(getComputedStyle(x).backgroundColor); if (l != null) return l; } return 1; }
function fixLight(root) {
  if (!document.documentElement.classList.contains('food') || !root) return;
  root.querySelectorAll('*').forEach(e => {
    if (e.closest('svg') || e.style.color) return; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const l = lum(getComputedStyle(e).color); if (l == null || l < 0.62) return; if (bgLum(e) < 0.45) return;
    e.style.color = l > 0.93 ? '#13201A' : l > 0.82 ? '#2B3832' : '#4E5A54';
  });
}
const _57render = render;
render = function () { _57render.apply(this, arguments); requestAnimationFrame(() => fixLight($('#app'))); };
new MutationObserver(() => requestAnimationFrame(() => fixLight($('#sheet')))).observe(document.getElementById('sheet') || document.body, { childList: true, subtree: true });
