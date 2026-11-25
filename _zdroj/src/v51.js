// ===================== v2.32: plán 3.0 (T1/T2, bloky, vaření 3× týdně, nákupy N1–N3, verze kroků) + režim „na cestě“ =====================

// ---------- kroky a verze ----------
function verzeOf(s) { const r = (JD.urovne_prijmu?.kroky || []).find(k => k.krok === s); return r && r.verze ? r.verze : ''; }
// krok mimo rozsah plánu → −7 (doplněk 3.0); jinak se krok při nahrání nemění
function stepFix() { const f = F(); const ks = (JD.urovne_prijmu?.kroky || []).map(k => k.krok); if (!ks.length) return;
  if (typeof f.step !== 'number' || !ks.includes(f.step)) { const to = ks.includes(-7) ? -7 : Math.max(Math.min(...ks), Math.min(Math.max(...ks), f.step || 0)); f.stepLog = [...(f.stepLog || []), { d: today(), from: f.step, to, why: 'krok mimo rozsah plánu' }]; f.step = to; save(true); } }
const _51jlApply = jlApply; jlApply = function () { _51jlApply(); stepFix(); }; stepFix();
const verChips = f => { const V = JD.urovne_prijmu?.verze; if (!V) return '';
  return `<div class="chips swhen fver">${Object.entries(V).map(([n, k]) => `<button class="chip ${f.step === k ? 'on' : ''}" data-a="f-setstep" data-v="${k}" data-why="verze ${esc(n)}">${esc(n)} kcal</button>`).join('')}</div><p class="mut" style="font-size:12px;margin:6px 2px 0">Rychlé přepnutí na verzi plánu (krok ${Object.values(V).map(sgn).join(' / ')}).</p>`; };
const withVer = h => { const f = F(); const v = verzeOf(f.step);
  return h.replace(/(<div class="fstep">[\s\S]*?<small>)/, `$1${v ? 'verze ' + esc(v) + ' · ' : ''}`).replace(/(<div class="fstep">[\s\S]*?<\/div><\/div>)/, `$1${verChips(f)}`); };
const _51vyvoj = XV['f-vyvoj']; XV['f-vyvoj'] = function () { return withVer(_51vyvoj()); };
if (XV['f-plan']) { const _51plan = XV['f-plan']; XV['f-plan'] = function () { return withVer(_51plan()); }; }

// ---------- vaření (cyklus[w].vareni) ----------
const nextW = w => { const o = cycOrder(); return o[(o.indexOf(w) + 1) % o.length]; };
const VAR_DAY = { 'St–Čt': 1, 'Pá–So': 3, 'Ne': 6 }; // den vaření (index Po=0) pro blok; Po–Út se vaří v neděli předchozího týdne
function cookFor(w, di) {
  const L = (JD.cyklus[w]?.vareni || []).filter(v => VAR_DAY[v.blok] === di);
  if (di === 6) L.push(...(JD.cyklus[nextW(w)]?.vareni || []).filter(v => v.blok === 'Po–Út').map(v => ({ ...v, dalsi: nextW(w) })));
  return L;
}
// vaření lidsky: skutečné datum, celé názvy jídel, počet porcí, poznámka
const VAR_OFF = { 'Po–Út': -1, 'St–Čt': 1, 'Pá–So': 3, 'Ne': 6 };
const DNYD = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
const BLOKN = { 'Po–Út': 'na pondělí a úterý', 'St–Čt': 'na středu a čtvrtek', 'Pá–So': 'na pátek a sobotu', 'Ne': 'na neděli' };
function cookParts(co) {
  const R = RX(); const STOP = /^(večer|ráno|poledne|neděli|čerstvě|uvařená|mrazáku|vývaru|cyklu|sudém)$/;
  return String(co || '').split(/;\s*|\s+a\s+(?=[HSP][-\w]*\s)/).map(p => p.trim()).filter(Boolean).map(p => {
    let t = p, when = ''; const tm = /^(večer|ráno|v poledne)\s+/i.exec(t); if (tm) { when = tm[1]; t = t.slice(tm[0].length); }
    let r = null; const km = /^([HSP][-\w]*)\s+/.exec(t); if (km && R[km[1]]) { r = R[km[1]]; t = t.slice(km[0].length); }
    if (!r) { const w = (t.toLowerCase().match(/[a-záčďéěíňóřšťúůýž]{4,}/g) || []).filter(x => !STOP.test(x)); r = JD.recepty.find(x => w.some(y => x.nazev.toLowerCase().includes(y))) || null; }
    const pm = /×\s*(\d+)/.exec(t); let note = pm ? t.slice(pm.index + pm[0].length) : (/(čerstvě|z vývaru.*|z mrazáku.*)$/.exec(t) || [''])[0];
    note = note.replace(/\s*\(\s*/g, ' · ').replace(/\)/g, '').replace(/^[\s,·]+|[\s,·]+$/g, '').replace(/\s*,\s*/g, ', ');
    return { r, name: r ? r.nazev : t.replace(/×\s*\d+.*/, '').trim(), n: pm ? +pm[1] : null, note: [when, note].filter(Boolean).join(' · ') }; });
}
function cookRow(v, mon) {
  const d = mon != null && VAR_OFF[v.blok] != null ? pdate(dkey(addDays(pdate(mon), VAR_OFF[v.blok]))) : null;
  const tm = (/(večer nebo ráno[^)]*|večer|poledne|ráno)/.exec(v.kdy) || [''])[0];
  const head = d ? `${DNYD[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.${tm ? ' · ' + tm : ''}` : v.kdy;
  return `<div class="fvc"><div class="fvch"><b>${esc(head)}</b><small>${BLOKN[v.blok] || 'blok ' + esc(v.blok)}${v.dalsi ? ' (týden ' + esc(v.dalsi) + ')' : ''}</small></div>
    ${cookParts(v.co).map(x => `<div class="fvci"><span>${esc(x.name)}${x.note ? `<small>${esc(x.note)}</small>` : ''}</span>${x.n ? `<b>${x.n} ${x.n < 5 ? 'porce' : 'porcí'}</b>` : ''}</div>`).join('')}
    ${v.poznamka ? `<p>${esc(v.poznamka)}</p>` : ''}</div>`;
}
function cookTodayHTML(c) { const k = view.d || today(); if (typeof tripSkip === 'function' && tripSkip(k).length >= SLOTS.length) return ''; const L = cookFor(c.w, c.di); const mon = dkey(addDays(pdate(k), -c.di));
  return L.length ? `<div class="fsec"><div class="lbl">Vaření dnes</div><div class="fvar">${L.map(v => cookRow(v, v.dalsi ? dkey(addDays(pdate(mon), 7)) : mon)).join('')}</div><button class="btn block" style="margin-top:10px" data-a="pr-plan" data-v="${esc(L.map(v => v.blok).join(','))}">Spočítat suroviny a porce</button></div>` : ''; }
// z „Vaření dnes“: předvyplní dny bloku, na který se vaří, a hlavní chody
A['pr-plan'] = b => { const f = F(); const k = view.d || today(); const c = cyc(k); const mon = dkey(addDays(pdate(k), -(c ? c.di : 0)));
  const days = []; b.dataset.v.split(',').forEach(bl => { const off = { 'Po–Út': [7, 8], 'St–Čt': [2, 3], 'Pá–So': [4, 5], 'Ne': [6] }[bl] || []; off.forEach(o => days.push(dkey(addDays(pdate(mon), o)))); });
  f.prep = { at: today(), days: [...new Set(days)].filter(x => x >= today()).sort(), slots: ['obed', 'vecere'], n: 0, from: 0 }; save(); go('f-prep'); };
function cookWeekHTML(w) { const L = JD.cyklus[w]?.vareni || []; const mon = weekDateFor(w, 0); return L.length ? `<div class="fsec" style="margin-top:4px"><div class="lbl">Vaření</div><div class="fvar">${L.map(v => cookRow(v, mon)).join('')}</div></div>` : ''; }
// týden: nadpisy bloků nad dvojicemi dnů
function blockRow(days) { const g = []; days.forEach(x => { const b = x.day.blok || ''; if (g.length && g[g.length - 1].b === b) g[g.length - 1].n++; else g.push({ b, n: 1 }); });
  return `<div class="wh0 wbk0"></div>${g.map(x => `<div class="wbk" style="grid-column:span ${x.n}">${x.b ? 'blok ' + esc(x.b) : ''}</div>`).join('')}`; }

// ---------- nákup N1–N3 ----------
function shopInfo3(list, mon, w) {
  const fl = k => flong(k).replace(/^./, c => c.toUpperCase()); const D = n => dkey(addDays(pdate(mon), n));
  const buy = D(listBuy(list)); const ds = listDays(list); const from = list === 'N1' ? D(-1) : D(ds[0]), to = D(ds[ds.length - 1]);
  const bl = { N1: ['Po–Út'], N2: ['St–Čt'], N3: ['Pá–So', 'Ne'] }[list] || []; const V = (JD.cyklus[w]?.vareni || []).filter(v => bl.includes(v.blok));
  return `<div class="fshi"><div><span>Nakoupit</span><b>${fl(buy)}</b><small>${inDays(buy)}${list === 'N1' ? ' (nebo v sobotu)' : ''}</small></div>
    <div><span>Vystačí</span><b>${fday(from)} – ${fday(to)}</b><small>${{ N1: 'nedělní večeře + blok Po–Út', N2: 'blok St–Čt', N3: 'blok Pá–So + neděle' }[list] || ''}</small></div>
    ${V.length ? `<div class="w"><span>Vaří se</span>${V.map(v => `<b class="fvb">${esc(v.kdy.replace(/\s*\([^)]*\)/, ''))}</b><small>${cookParts(v.co).map(x => esc(x.name) + (x.n ? ' × ' + x.n : '')).join(', ')}</small>`).join('')}</div>` : ''}</div>`;
}
function shopDefault() { return ({ 0: 'N1', 6: 'N1', 1: 'N2', 2: 'N2', 3: 'N3', 4: 'N3', 5: 'N3' })[new Date().getDay()]; }
// porcování masa: várky = jídla z krabičky v bloku (+ nedělní večeře pro N1), čerstvá = ostatní
function poPlan3(wi, list) {
  const f = F(); const R = RX(); const o = cycOrder(); const w = o[wi % o.length]; const mon = dkey(addDays(pdate(f.start), wi * 7));
  const buy = dkey(addDays(pdate(mon), listBuy(list))); const out = {}; const it = s => (out[s] = out[s] || { s, batch: [], fresh: [] });
  const nMonLunch = (JD.cyklus[nextW(w)]?.dny[0]?.z_varky || []).includes('obed') ? JD.cyklus[nextW(w)].dny[0].jidla.obed : null;
  const batch = {}; const fresh = [];
  listDays(list).forEach(di => { const k = dkey(addDays(pdate(mon), di)); const c = cyc(k); if (!c || c.before) return; const day = planDayF(c.w, c.di, k); if (!day) return;
    SLOTS.forEach(([sl]) => { const r = R[day.jidla[sl]]; if (!r) return; if (list === 'N3' && di === 6 && sl === 'vecere' && r.kod === nMonLunch) return;
      if ((day.z_varky || []).includes(sl)) (batch[r.kod] = batch[r.kod] || { r, n: 0 }).n++; else fresh.push({ r, k, sl }); }); });
  if (list === 'N1') { const sun = dkey(addDays(pdate(mon), -1)); const c = cyc(sun); if (c && !c.before) { const d = planDayF(c.w, c.di, sun); const kod = d && d.jidla.vecere; if (batch[kod]) batch[kod].n++; } }
  Object.values(batch).forEach(({ r, n }) => r.suroviny.forEach(x => { if (poWanted(x.surovina) && x.g) it(x.surovina).batch.push({ g: x.g * n, n, per: x.g, k: buy, nazev: r.nazev }); }));
  fresh.forEach(({ r, k, sl }) => r.suroviny.forEach(x => { if (poWanted(x.surovina) && x.g) it(x.surovina).fresh.push({ g: x.g, k, sl, nazev: r.nazev }); }));
  return { buy, items: Object.values(out).sort((a, b) => SUR(a.s).nazev.localeCompare(SUR(b.s).nazev, 'cs')) };
}

// ===================== NA CESTĚ =====================
// varianty a texty z plan_nabirani.texty.zameny_a_mimoradne_dny (sekce „Přejíždění a mimořádné dny“)
function travelTexts() {
  const t = (PN().texty || {}).zameny_a_mimoradne_dny || ''; const L = t.split('\n'); const o = { kuch: {} };
  const bold = lab => { const l = L.find(x => new RegExp('^\\s*-\\s*\\*\\*' + lab).test(x)); return l ? l.replace(/^\s*-\s*\*\*[^*]+\*\*\s*/, '').trim() : ''; };
  o.krabicky = bold('Krabičky'); o.bez = bold('Den bez vaření'); o.rest = bold('Restaurace');
  const hi = L.findIndex(x => /^#{2,4}\s.*mimo domov/i.test(x));
  if (hi >= 0) { o.kuchTitle = L[hi].replace(/^#+\s*/, ''); for (let i = hi + 1; i < L.length && !/^#/.test(L[i]); i++) { const m = /^\s*-\s*([^:]+):\s*(.*)$/.exec(L[i]); if (!m) continue; const k = m[1].trim();
    if (/^Den 1/.test(k)) o.kuch.d1 = m[2]; else if (/^Den 2/.test(k)) o.kuch.d2 = m[2]; else if (/^Z domova/.test(k)) o.kuch.home = m[2]; }
    const kc = L.slice(hi + 1).find(x => /^\s*-\s*Na kroku/.test(x)); if (kc) o.kuch.kcal = kc.replace(/^\s*-\s*/, ''); }
  return o;
}
const TRV = () => { const T = travelTexts(); return [
  ['easy', 'Jednoduchá jídla', 'vejce s chlebem, kuře s rýží, mleté s tortillou, rýžová kaše', 'easy'],
  ['krabicky', 'Krabičky s sebou', 'jíš podle plánu, jídla vezeš z domova', T.krabicky],
  ['kuchyne', T.kuchTitle ? T.kuchTitle.replace(/^\d+\s*dny\s*/i, '').replace(/^./, c => c.toUpperCase()) : 'Mimo domov s kuchyňkou', 'cestovní chilli + jednoduché snídaně a svačiny', T.kuch.d2 || ''],
  ['bez', 'Den bez vaření', 'porce z mrazáku + čerstvá rýže', T.bez],
  ['rest', 'Jídlo v restauraci', 'max. zhruba 1× měsíčně', T.rest]].filter(v => v[3]); };
const TF = () => { const f = F(); f.trips = f.trips || []; f.tripShop = f.tripShop || {}; return f; };
const tripDays = t => [...Array(t.n)].map((_, i) => dkey(addDays(pdate(t.from), i)));
function tripOn(k) { for (const t of TF().trips) { const i = daysBetween(t.from, k); if (i >= 0 && i < t.n) return { t, i }; } return null; }
// které sloty plánu doma ten den odpadají (pro nákup na vlastní období)
function tripSkip(k) { const x = tripOn(k); if (x && x.t.v === 'easy') return SLOTS.map(s => s[0]); if (!x || x.t.v !== 'kuchyne') return []; return x.i === 0 ? ['vecere'] : SLOTS.map(s => s[0]); }
const plain = s => mdInline(s || '');
function tripMenu(txt) { // „snídaně …; svačina …; oběd a večeře …. Kefír …“ → řádky
  const parts = String(txt || '').split(/;\s*/).map(x => x.trim()).filter(Boolean);
  return `<div class="ftm">${parts.map(p => { const m = /^(snídaně|svačina|oběd a večeře|oběd|večeře)\s+(.*)$/i.exec(p); return m ? `<div><b>${esc(m[1])}</b><span>${plain(m[2])}</span></div>` : `<div><span>${plain(p)}</span></div>`; }).join('')}</div>`; }
function tripCard(k) {
  const x = tripOn(k); if (!x) return ''; const { t, i } = x; const V = TRV().find(v => v[0] === t.v) || TRV()[0]; const T = travelTexts();
  let body = '';
  if (t.v === 'kuchyne') {
    if (i === 0) body = `<p>${plain(T.kuch.d1)}</p>${T.kuch.home ? `<p class="mut"><b>Z domova:</b> ${plain(T.kuch.home)}</p>` : ''}`;
    else body = `${tripMenu(T.kuch.d2)}${T.kuch.kcal ? `<p class="mut">${plain(T.kuch.kcal)}</p>` : ''}${i >= 3 ? '<p class="mut">Plán z dat je na 3 dny. Další den jez stejně jako den 2–3; až chilli dojde, uvař novou várku.</p>' : ''}`;
  } else if (t.v === 'easy') body = easyHTML(F().step);
  else body = `<p>${plain(V[3])}</p>`;
  return `<div class="ftrip"><div class="ftrh"><span><small>Na cestě · den ${i + 1} z ${t.n}</small><b>${esc(V[1])}</b></span><button data-a="trip-open">Upravit</button></div>${body}
    ${t.v === 'kuchyne' || t.v === 'easy' ? `<button class="ftrb" data-a="trip-shop" data-id="${t.id}">${t.v === 'easy' ? 'Co nakoupit na cestu' : 'Co vzít a co koupit na místě'}</button>` : ''}</div>`;
}
const _51fden = XV['f-den'];
XV['f-den'] = function () {
  let h = _51fden(); const f = F(); if (!f.start) return h; const k = view.d || today(); const x = tripOn(k);
  const btn = `<div class="two" style="margin-top:14px"><button class="btn white" data-a="tab" data-v="f-prep">${ico('prep')} Jdu vařit</button><button class="btn" data-a="trip-open">${x ? 'Upravit cestu' : 'Jsem na cestě'}</button></div>`;
  h = h.replace(/(<\/div>)(<nav class="tabs)/, `${btn}$1$2`);
  if (!x) return h;
  h = h.replace(/(<div class="fdnav">[\s\S]*?<\/div><button class="round" data-a="f-day" data-v="1"[^>]*>[\s\S]*?<\/button><\/div>)/, `$1${tripCard(k)}`);
  if ((x.t.v === 'kuchyne' && x.i > 0) || x.t.v === 'easy') h = h.replace('<div class="fmeals">', '<p class="ftroff">Plán doma – dnes neplatí, jíš podle karty nahoře</p><div class="fmeals ftrip-off">').replace('<div class="fsum2">', '<div class="fsum2 ftrip-off">');
  return h;
};

// ---------- nastavení cesty ----------
function tripSheet() {
  const f = TF(); const d = view.trip || (view.trip = (() => { const x = tripOn(view.d || today()); return x ? { ...x.t } : { id: 't' + Date.now(), from: view.d && view.d > today() ? view.d : today(), n: 3, v: 'easy', exc: false }; })());
  const strip = [...Array(14)].map((_, i) => dkey(addDays(new Date(), i))); const V = TRV(); const editing = f.trips.some(t => t.id === d.id);
  const others = f.trips.filter(t => t.id !== d.id && dkey(addDays(pdate(t.from), t.n - 1)) >= today());
  return `<h2>Na cestě</h2><p class="mut" style="margin:4px 0 0">Vyber dny a jak budeš jíst. Den se pak v Jídle ukáže s kartou „Na cestě“.</p>
    <div class="lbl" style="margin:16px 2px 8px">Odjezd</div>
    <div class="rgbuy">${strip.map(k => `<button class="${k === d.from ? 'on' : ''}" data-a="trip-from" data-v="${k}"><small>${k === today() ? 'dnes' : k === dkey(addDays(new Date(), 1)) ? 'zítra' : DOW[pdate(k).getDay()]}</small><b>${pdate(k).getDate()}.</b></button>`).join('')}</div>
    <div class="lbl" style="margin:16px 2px 8px">Na kolik dní</div>
    <div class="chips swhen">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button class="chip ${d.n === n ? 'on' : ''}" data-a="trip-n" data-v="${n}">${n === 1 ? '1 den' : n < 5 ? n + ' dny' : n + ' dní'}</button>`).join('')}</div>
    <p class="mut" style="font-size:12px;margin:8px 2px 0">${fday(d.from)} – ${fday(dkey(addDays(pdate(d.from), d.n - 1)))}</p>
    <div class="lbl" style="margin:16px 2px 8px">Jak budeš jíst</div>
    <div class="ftv">${V.map(([id, l, s]) => `<button class="${d.v === id ? 'on' : ''}" data-a="trip-v" data-v="${id}"><span class="rd"></span><span><b>${esc(l)}</b><small>${esc(s)}</small></span></button>`).join('')}</div>
    <button class="fsi ${d.exc ? 'on' : ''}" style="margin-top:12px" data-a="trip-exc"><span class="cb">${d.exc ? ico('check') : ''}</span><span class="t"><b>Týden nepočítat do hodnocení</b><small>výjimka „cesta“ – hodnocení váhy se posune o týden</small></span></button>
    <div class="actions">${editing ? '<button class="btn" data-a="trip-del">Zrušit cestu</button>' : '<button class="btn" data-a="close">Zpět</button>'}<button class="btn white" data-a="trip-save">Uložit</button></div>
    ${others.length ? `<div class="lbl" style="margin:18px 2px 8px">Další naplánované cesty</div>${others.map(t => `<button class="li" data-a="trip-edit" data-id="${t.id}"><div class="t"><b>${fday(t.from)} – ${fday(dkey(addDays(pdate(t.from), t.n - 1)))}</b><small>${esc((V.find(v => v[0] === t.v) || [, ''])[1])}</small></div></button>`).join('')}` : ''}`;
}
const tripRe = () => sheet(tripSheet());
A['trip-open'] = () => { view.trip = null; tripRe(); };
A['trip-edit'] = b => { const t = TF().trips.find(x => x.id === b.dataset.id); view.trip = t ? { ...t } : null; tripRe(); };
A['trip-from'] = b => { view.trip.from = b.dataset.v; tripRe(); };
A['trip-n'] = b => { view.trip.n = +b.dataset.v; tripRe(); };
A['trip-v'] = b => { view.trip.v = b.dataset.v; tripRe(); };
A['trip-exc'] = () => { view.trip.exc = !view.trip.exc; tripRe(); };
A['trip-save'] = () => { const f = TF(); const d = view.trip; const days = tripDays(d);
  f.trips = f.trips.filter(t => t.id !== d.id && !tripDays(t).some(k => days.includes(k))); f.trips.push({ ...d }); f.trips.sort((a, b) => a.from < b.from ? -1 : 1);
  if (d.exc) [...new Set(days.map(k => dkey(monday(pdate(k)))))].forEach(m => { const w = f.weeks[m] = f.weeks[m] || {}; w.exc = true; w.excWhy = 'cesta'; });
  f.trips = f.trips.filter(t => dkey(addDays(pdate(t.from), t.n + 30)) >= today()); // staré cesty pryč
  save(true); view.trip = null; closeSheet(); render(); toast(`Na cestě ${fday(d.from)} – ${fday(days[days.length - 1])}`); };
A['trip-del'] = () => { const f = TF(); f.trips = f.trips.filter(t => t.id !== view.trip.id); save(true); view.trip = null; closeSheet(); render(); toast('Cesta zrušená'); };

// ---------- co vzít z domova a co koupit na místě (varianta s kuchyňkou) ----------
function tripLists(t) {
  const K = travelTexts().kuch; const split = s => String(s || '').replace(/\.$/, '').split(/\s*\+\s*|,\s*(?![^(]*\))/).map(x => x.trim()).filter(Boolean);
  const home = split(K.home); const homeRx = new RegExp(home.map(h => h.split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '')).filter(x => x.length > 2).join('|') || '^$', 'i');
  const chilli = /chilli[^(]*\(([^)]*)\)/i.exec(K.d1 || ''); const buy = chilli ? split(chilli[1]).map(x => ({ t: x, pozn: 'cestovní chilli' })) : [];
  const n2 = Math.max(0, t.n - 1);
  if (n2) String(K.d2 || '').split(/;\s*/).forEach(p => { const m = /^(snídaně|svačina)\s+(.*)$/i.exec(p.trim()); if (m) split(m[2]).filter(x => !homeRx.test(x)).forEach(x => buy.push({ t: x, pozn: `${m[1]} · ${n2} ${n2 === 1 ? 'den' : n2 < 5 ? 'dny' : 'dní'}` })); });
  const kef = /Kefír\s+([^.]*)/i.exec(K.d2 || ''); if (kef && n2) buy.push({ t: 'kefír ' + kef[1].replace(/\s*denně/, ''), pozn: `denně · ${n2} ${n2 < 5 ? 'dny' : 'dní'}` });
  return { home: home.map(x => ({ t: x })), buy };
}
function tripShopSheet(id) {
  const f = TF(); const t = f.trips.find(x => x.id === id); if (!t) return '<h2>Cesta nenalezena</h2>'; if (t.v === 'easy') return easyShop(t); const st = f.tripShop[id] = f.tripShop[id] || {}; const { home, buy } = tripLists(t);
  const row = (p, x, i) => { const key = p + i; return `<button class="fsi ${st[key] ? 'on' : ''}" data-a="trip-chk" data-id="${id}" data-k="${key}"><span class="cb">${st[key] ? ico('check') : ''}</span><span class="t"><b>${esc(x.t)}</b>${x.pozn ? `<small>${esc(x.pozn)}</small>` : ''}</span></button>`; };
  return `<h2>Na cestu</h2><p class="mut" style="margin:4px 0 0">${fday(t.from)} – ${fday(dkey(addDays(pdate(t.from), t.n - 1)))} · s kuchyňkou</p>
    <div class="lbl" style="margin:16px 2px 8px">Vzít z domova</div>${home.map((x, i) => row('h', x, i)).join('')}
    <div class="lbl" style="margin:16px 2px 8px">Koupit na místě</div>${buy.map((x, i) => row('b', x, i)).join('')}
    <p class="mut" style="font-size:12px;margin:12px 2px 0">Seznam je složený z textu plánu (cestovní chilli a menu na den 2–3). Gramy u snídaně a svačiny jsou na 1 den.</p>
    <div class="actions"><button class="btn white" data-a="close">Hotovo</button></div>`;
}
A['trip-shop'] = b => sheet(tripShopSheet(b.dataset.id));
A['trip-chk'] = b => { const f = TF(); const st = f.tripShop[b.dataset.id] = f.tripShop[b.dataset.id] || {}; if (st[b.dataset.k]) delete st[b.dataset.k]; else st[b.dataset.k] = 1; save(); sheet(tripShopSheet(b.dataset.id)); };

// ---------- nákup: výchozí seznam podle dne + upozornění na cestu ----------
const _51nakup = XV['f-nakup'];
XV['f-nakup'] = function () {
  if (!view.list && isV3()) view.list = shopDefault();
  let h = _51nakup(); const f = TF(); const l = view.list || 'N1'; if (!f.start || !/^N\d$/.test(l) || !f.trips.length) return h;
  const wi = view.wi ?? shopWeek(); const mon = dkey(addDays(pdate(f.start), wi * 7)); const ks = listDays(l).map(di => dkey(addDays(pdate(mon), di)));
  const hit = ks.filter(k => tripOn(k)); if (!hit.length) return h; const kuch = hit.filter(k => tripSkip(k).length > 1);
  const note = `<p class="whint ftrn">Na cestě ${hit.map(k => fday(k).replace(/^\S+ /, '')).join(', ')}${kuch.length ? ` – jídla z dnů ${kuch.map(k => DNY[dIdx(k)]).join(', ')} nekupuj, jíš podle cestovního plánu (seznam „Na cestu“ v Jídle).` : ' – jídla vezeš s sebou, nákup zůstává.'}</p>`;
  return h.replace('<div class="fsbar">', note + '<div class="fsbar">');
};

// ---------- jednoduchá jídla na cestu (4 jídla, přílohy dopočítané na průměr dne v aktuálním kroku) ----------
// c = příloha, která se škáluje podle kroku; ks = gramů na kus
const EASY = [
  ['snidane', 'Vejce s chlebem a cottage', [['vejce', 165, 0, 55], ['cottage', 100], ['chleb_zitny', 140, 1]], 'vejce natvrdo nebo míchaná, k tomu zelenina podle chuti'],
  ['obed', 'Kuřecí s rýží', [['kur_prsa', 160], ['basmati', 110, 1], ['olej_olivovy', 10]], 'rýže a kuře klidně uvařené dopředu v krabičce; + zelenina'],
  ['svacina', 'Rýžová kaše s proteinem', [['ryzova_kase', 70, 1], ['mleko', 300], ['whey', 25], ['banan', 120], ['med', 15]], 'kaši zalij horkým mlékem, protein vmíchej, až trochu vychladne'],
  ['vecere', 'Mleté maso s tortillou', [['hov_mlete5', 160], ['tortilla_cz', 160, 1, 40], ['recky_jogurt_0', 80], ['olej_olivovy', 5]], 'maso orestuj s kořením, jogurt jako dresink, zelenina do tortilly']];
function easyDay(step) {
  const kc = (s, g) => (SUR(s).na_100g?.kcal || 0) * g / 100; let fix = 0, car = 0;
  EASY.forEach(([, , L]) => L.forEach(([s, g, c]) => { if (!JD.suroviny[s]) return; if (c) car += kc(s, g); else fix += kc(s, g); }));
  const tgt = stepAvg(step) || fix + car; const k = car ? Math.max(0.6, (tgt - fix) / car) : 1;
  return EASY.map(([slot, nazev, L, tip]) => { const items = L.filter(([s]) => JD.suroviny[s]).map(([s, g, c, ks]) => { let gg = c ? g * k : g; gg = ks ? Math.max(1, Math.round(gg / ks)) * ks : Math.round(gg / (gg >= 100 ? 10 : 5)) * (gg >= 100 ? 10 : 5); return { s, g: gg, ks: ks ? gg / ks : 0 }; });
    const n = {}; items.forEach(i => addN(n, nutOf(i.s, i.g))); return { slot, nazev, items, tip, n }; });
}
const easyNm = s => esc((SUR(s).nazev || s).split(' (')[0].replace(/^Celozrnná tortilla.*/, 'Celozrnná tortilla'));
function easyHTML(step) {
  const D = easyDay(step); const tot = {}; D.forEach(m => addN(tot, m.n)); const SL = Object.fromEntries(SLOTS.map(([s, l]) => [s, l]));
  return `<div class="ftez">${D.map(m => `<div class="ftezm"><div class="ftezh"><i>${SL[m.slot]}</i><b>${esc(m.nazev)}</b><span>${thou(r0(m.n.kcal))} kcal · B ${r0(m.n.bilkoviny_g)} g</span></div>
    <div class="ftezi">${m.items.map(i => `<span><em>${easyNm(i.s)}</em><b>${i.ks ? i.ks + ' ks' : i.g + ' g'}</b></span>`).join('')}</div><small>${esc(m.tip)}</small></div>`).join('')}</div>
    <p class="mut">Den ~${thou(r10(tot.kcal))} kcal · B ${r0(tot.bilkoviny_g)} g · S ${r0(tot.sacharidy_g)} g · T ${r0(tot.tuky_g)} g – přílohy jsou dopočítané na krok ${sgn(step)}${verzeOf(step) ? ' (verze ' + esc(verzeOf(step)) + ')' : ''}.</p>`;
}
function easyShop(t) {
  const f = TF(); const st = f.tripShop[t.id] = f.tripShop[t.id] || {}; const D = easyDay(f.step); const sum = {};
  D.forEach(m => m.items.forEach(i => { const x = sum[i.s] = sum[i.s] || { g: 0, ks: 0 }; x.g += i.g * t.n; x.ks += i.ks * t.n; }));
  const q = (s, x) => s === 'vejce' ? `${x.ks} ks` : x.ks ? `${x.ks} ks (${x.g} g)` : x.g >= 1000 ? `${nf(x.g / 1000, 1)} ${s === 'mleko' ? 'l' : 'kg'}` : `${x.g} ${s === 'mleko' ? 'ml' : 'g'}`;
  const rows = Object.entries(sum).sort((a, b) => ingGroup({ surovina: a[0] }) - ingGroup({ surovina: b[0] })).map(([s, x]) => `<button class="fsi ${st[s] ? 'on' : ''}" data-a="trip-chk" data-id="${t.id}" data-k="${s}"><span class="cb">${st[s] ? ico('check') : ''}</span><span class="t"><b>${easyNm(s)}</b></span><span class="q">${q(s, x)}</span></button>`).join('');
  return `<h2>Nákup na cestu</h2><p class="mut" style="margin:4px 0 0">${fday(t.from)} – ${fday(dkey(addDays(pdate(t.from), t.n - 1)))} · jednoduchá jídla na ${t.n} ${t.n === 1 ? 'den' : t.n < 5 ? 'dny' : 'dní'} · krok ${sgn(f.step)}</p>
    <div style="margin-top:14px">${rows}</div>
    <p class="mut" style="font-size:12px;margin:12px 2px 0">K tomu zelenina podle chuti. Kuře, mleté a rýži můžeš uvařit doma dopředu – v lednici max. 3 dny, rýže 24 h, převážet v chladicí tašce.</p>
    <div class="actions"><button class="btn white" data-a="close">Hotovo</button></div>`;
}
