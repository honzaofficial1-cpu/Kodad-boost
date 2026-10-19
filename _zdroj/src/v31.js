
// ===================== v2.11: lezení, schody, veslo, SkiErg, Hyrox · otužování srozumitelně =====================
const _HD = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
Object.assign(PICTO, {
  stairs: { f: [_HD(8.6, 3.6, 2.1)], c: [], s: [['M14.5 22h2.8v-3.2h2.8v-3.2h2.8v-3.2', 1.7], ['M9 7.4 8.2 12.6', 3.2], ['M9.2 8.4 12.4 10.6', 2.2], ['M8.8 8.6 6.4 11.4', 2.2], ['M8.2 12.6 11.6 14.8 11.2 18.6', 2.4], ['M8.2 12.6 6.6 17 6.2 21.6', 2.4], ['M12.6 9.4V22', 1.4]] },
  row: { f: [_HD(6.6, 6.6, 2.1)], c: [], s: [['M1.5 21h21', 1.6], ['M17 17.4a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0', 1.6], ['M7.4 9.8 5.4 15.6', 3.2], ['M7 11 13 13', 2.2], ['M5.4 15.6 10.6 12.6 14.8 17.6', 2.5], ['M3.6 17.2h4.6', 1.8], ['M13 13 17.2 16', 1]] },
  skierg: { f: [_HD(8, 3.8, 2.1)], c: [], s: [['M18.6 1.5V22.5', 1.8], ['M16.4 22.5h4.4', 1.6], ['M8.6 7.4 11.2 12.8', 3.2], ['M9 8.4 14.6 13.4', 2.2], ['M14.6 13.4 18.6 3', .8], ['M11.2 12.8 9.4 17.2 10 21.8', 2.5], ['M11.2 12.8 13 17.2 12.6 21.8', 2.5]] },
  hyrox: { f: [_HD(6.4, 6.6, 2.1)], c: [], s: [['M8 8.6 13.6 12', 3.2], ['M9.2 9.2 16.2 10.2', 2.2], ['M13.6 12 10.6 15.2 6.8 17.6', 2.5], ['M13.6 12 12.6 16.6 13.6 20.8', 2.5], ['M16.6 7.6V14.6H22', 1.8], ['M15.6 18.6H22.6', 1.8], ['M17.6 14.6v4M21 14.6v4', 1.4]] },
});
const _11pmarkup = pmarkup;
pmarkup = function (k) { const p = PICTO[k]; if (p && p.f && p.s) return `${p.f.map(d => `<path fill="currentColor" d="${d}"/>`).join('')}<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${p.s.map(([d, w]) => `<path d="${d}" stroke-width="${w}"/>`).join('')}</g>`; return _11pmarkup(k); };
Object.assign(ACT_TYPES, {
  stairs: { name: 'Schody (stroj)', cls: 'act', extra: 1 },
  row: { name: 'Veslo (stroj)', cls: 'act', extra: 1 },
  skierg: { name: 'SkiErg', cls: 'act', extra: 1 },
  hyrox: { name: 'Hyrox', cls: 'act', extra: 1 },
});
// „Jiné“ ať zůstane poslední
{ const o = ACT_TYPES.other; delete ACT_TYPES.other; ACT_TYPES.other = o; }
['stairs', 'row', 'skierg', 'hyrox'].forEach(k => { IC['p_' + k] = pmarkup(k); ACT_TYPES[k].icon = 'p_' + k; });
Object.assign(CARD_COL, { stairs: ['#F2B84B', ''], row: ['#5AB0FF', ''], skierg: ['#7FD1E8', ''], hyrox: ['#FFD23F', ''] });

// otužování: srozumitelné názvy i pro lidi, co to uvidí na story
const COLD_KINDS = ['Ledová sprcha', 'Ledová káď', 'Řeka / jezero'];
(function () { if (S.settings.migCold1) return; S.activities.forEach(a => { if (a.type !== 'cold') return; if (a.kind === 'Káď') a.kind = 'Ledová káď'; if (a.kind === 'Venku') a.kind = 'Řeka / jezero'; }); S.settings.migCold1 = 1; save(true); })();

const parseT = s => { if (s == null) return null; s = String(s).trim().replace(',', '.'); if (!s) return null; const p = s.split(':').map(Number); if (p.some(n => !isFinite(n))) return null; return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : Math.round(p[0] * 60); };
const fT = s => s == null ? '' : s >= 3600 ? `${Math.floor(s / 3600)}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}` : `${Math.floor(s / 60)}:${pad(s % 60)}`;
const HX_ST = ['SkiErg 1000 m', 'Sled push', 'Sled pull', 'Burpee broad jumps', 'Veslo 1000 m', 'Farmers carry', 'Sandbag lunges', 'Wall balls'];
const seg2 = (name, opts, cur) => `<div class="seg" data-seg="${name}">${opts.map(o => `<button data-a="seg" data-v="${o}" class="${cur === o ? 'on' : ''}">${o}</button>`).join('')}</div>`;

const _11actSheet = actSheet;
actSheet = function (type, k, id) {
  _11actSheet(type, k, id);
  const a = id ? S.activities.find(x => x.id === id) : { type, date: k || today() }; if (!a || !a.type) return;
  const sh = $('#sheet'); const host = $('#a-note', sh)?.closest('label'); if (!host) return;
  const t = a.type;
  if (t === 'cold') { const sg = $('[data-seg="kind"]', sh); if (sg) sg.outerHTML = seg2('kind', COLD_KINDS, a.kind === 'Káď' ? 'Ledová káď' : a.kind === 'Venku' ? 'Řeka / jezero' : (a.kind || 'Ledová sprcha')); return; }
  if (!['climb', 'stairs', 'row', 'skierg', 'hyrox'].includes(t)) return;
  // pryč s obecným polem minut, dáme vlastní
  $('#a-min', sh)?.closest('label')?.remove();
  let f = '';
  if (t === 'climb') f = `${seg2('kind', ['Stěna', 'Boulder'], a.kind || 'Stěna')}
    <div class="three"><label class="f">Cest<input id="x-routes" inputmode="numeric" value="${a.routes ?? ''}" placeholder="8"></label><label class="f">Max obtížnost<input id="x-grade" value="${esc(a.grade || '')}" placeholder="6b+ / 6A"></label><label class="f">Minuty<input id="a-min" inputmode="numeric" value="${a.min ?? ''}" placeholder="90"></label></div>`;
  if (t === 'stairs') f = `<div class="three"><label class="f">Minuty<input id="a-min" inputmode="numeric" value="${a.min ?? ''}" placeholder="20"></label><label class="f">Patra<input id="x-floors" inputmode="numeric" value="${a.floors ?? ''}" placeholder="60"></label><label class="f">Level<input id="x-level" inputmode="numeric" value="${a.level ?? ''}" placeholder="8"></label></div>
    <label class="f">Tep (bpm)<input id="a-bpm" inputmode="numeric" value="${a.bpm ?? ''}" placeholder="140"></label>`;
  if (t === 'row' || t === 'skierg') f = `<div class="three"><label class="f">Metry<input id="x-m" inputmode="numeric" value="${a.m ?? ''}" placeholder="2000"></label><label class="f">Čas (m:ss)<input id="x-t" inputmode="decimal" value="${fT(a.sec)}" placeholder="7:45"></label><label class="f">Tep<input id="a-bpm" inputmode="numeric" value="${a.bpm ?? ''}" placeholder="160"></label></div>
    <p class="mut" style="font-size:13px;margin:0" id="x-split">${a.m && a.sec ? `Tempo ${fT(Math.round(a.sec / a.m * 500))} /500 m` : 'Tempo na 500 m se dopočítá samo.'}</p>`;
  if (t === 'hyrox') { const sp = a.splits || {}; f = `${seg2('kind', ['Závod', 'Simulace', 'Trénink'], a.kind || 'Závod')}
    <div class="two"><label class="f">Celkový čas (h:mm:ss)<input id="x-t" inputmode="decimal" value="${fT(a.sec)}" placeholder="1:12:30"></label><label class="f">Kategorie<select id="x-cat">${['Open', 'Pro', 'Doubles', 'Relay'].map(o => `<option ${a.cat === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label></div>
    <details class="hxs" ${a.splits ? 'open' : ''}><summary>Mezičasy stanovišť (nepovinné)</summary><div class="hxg">${HX_ST.map((s, i) => `<label class="f">${s}<input data-hx="${i}" inputmode="decimal" value="${fT(sp[i])}" placeholder="m:ss"></label>`).join('')}<label class="f">Běh celkem (8 × 1 km)<input data-hx="run" inputmode="decimal" value="${fT(sp.run)}" placeholder="40:00"></label></div></details>`; }
  host.insertAdjacentHTML('beforebegin', f);
  const upd = () => { const m = num($('#x-m')?.value), s = parseT($('#x-t')?.value); const el = $('#x-split'); if (el) el.textContent = m && s ? `Tempo ${fT(Math.round(s / m * 500))} /500 m` : 'Tempo na 500 m se dopočítá samo.'; };
  $('#x-m', sh)?.addEventListener('input', upd); $('#x-t', sh)?.addEventListener('input', upd);
};
const _11actSave = A['act-save'];
A['act-save'] = b => {
  const sh = $('#sheet'); const v = id => $(id, sh)?.value;
  const extra = { routes: num(v('#x-routes')), grade: v('#x-grade')?.trim(), floors: num(v('#x-floors')), level: num(v('#x-level')), m: num(v('#x-m')), sec: parseT(v('#x-t')), cat: v('#x-cat') };
  const hx = $$('[data-hx]', sh); const splits = {}; hx.forEach(i => { const s = parseT(i.value); if (s) splits[i.dataset.hx] = s; });
  const has = { routes: !!$('#x-routes', sh), grade: !!$('#x-grade', sh), floors: !!$('#x-floors', sh), level: !!$('#x-level', sh), m: !!$('#x-m', sh), sec: !!$('#x-t', sh), cat: !!$('#x-cat', sh) };
  const editId = b.dataset.id, before = S.activities.length;
  _11actSave(b);
  const a = editId ? S.activities.find(x => x.id === editId) : S.activities.length > before ? S.activities[S.activities.length - 1] : null; if (!a) return;
  let ch = false; for (const k in has) if (has[k]) { a[k] = extra[k] || null; ch = true; }
  if (hx.length) { a.splits = Object.keys(splits).length ? splits : null; ch = true; }
  if (a.sec && !a.min && ['row', 'skierg', 'hyrox'].includes(a.type)) a.min = Math.round(a.sec / 60);
  if (ch) { save(true); render(); }
};
const _11actDesc = actDesc;
actDesc = a => {
  if (a.type === 'climb') return [a.kind, a.routes ? `${a.routes} ${a.kind === 'Boulder' ? 'bouldrů' : 'cest'}` : '', a.grade ? `max ${a.grade}` : '', a.min ? `${a.min} min` : ''].filter(Boolean).join(' · ');
  if (a.type === 'row' || a.type === 'skierg') return [a.m ? `${thou(a.m)} m` : '', a.sec ? fT(a.sec) : '', a.m && a.sec ? `${fT(Math.round(a.sec / a.m * 500))}/500 m` : ''].filter(Boolean).join(' · ');
  if (a.type === 'stairs') return [a.min ? `${a.min} min` : '', a.floors ? `${a.floors} pater` : '', a.level ? `level ${a.level}` : ''].filter(Boolean).join(' · ');
  if (a.type === 'hyrox') return [a.kind, a.cat, a.sec ? fT(a.sec) : ''].filter(Boolean).join(' · ');
  return _11actDesc(a);
};
const _11specActivity = specActivity;
specActivity = a => {
  const sp = _11specActivity(a); const t = a.type;
  if (PICTO[t]) { sp.picto = t; sp.col = COLK(t); }
  if (t === 'climb') { sp.title = `Lezení · ${a.kind || 'Stěna'}`; if (a.routes) { sp.big = String(a.routes); sp.unit = a.kind === 'Boulder' ? (a.routes === 1 ? 'boulder' : a.routes < 5 ? 'bouldry' : 'bouldrů') : (a.routes === 1 ? 'cesta' : a.routes < 5 ? 'cesty' : 'cest'); sp.bigLabel = a.kind === 'Boulder' ? 'Bouldry' : 'Cesty'; }
    sp.stats = [a.grade ? { id: 'grade', label: 'max obtížnost', value: a.grade } : null, a.min ? { id: 'min', label: 'min', value: String(a.min) } : null].filter(Boolean); }
  if (t === 'row' || t === 'skierg') { sp.title = t === 'row' ? 'Veslo' : 'SkiErg'; sp.big = a.m ? thou(a.m) : (a.sec ? fT(a.sec) : '✓'); sp.unit = a.m ? 'm' : ''; sp.bigLabel = 'Vzdálenost';
    sp.stats = [a.sec ? { id: 'min', label: 'čas', value: fT(a.sec) } : null, a.m && a.sec ? { id: 'split', label: '/500 m', value: fT(Math.round(a.sec / a.m * 500)) } : null, a.bpm ? { id: 'bpm', label: 'tep', value: `${a.bpm} bpm` } : null].filter(Boolean); }
  if (t === 'stairs') { sp.title = 'Schody'; sp.big = a.floors ? String(a.floors) : String(a.min || '✓'); sp.unit = a.floors ? 'pater' : (a.min ? 'min' : ''); sp.bigLabel = a.floors ? 'Patra' : 'Čas';
    sp.stats = [a.floors && a.min ? { id: 'min', label: 'min', value: String(a.min) } : null, a.level ? { id: 'lvl', label: 'level', value: String(a.level) } : null, a.bpm ? { id: 'bpm', label: 'tep', value: `${a.bpm} bpm` } : null].filter(Boolean); }
  if (t === 'hyrox') { sp.title = `Hyrox · ${a.kind || 'Závod'}`; sp.big = a.sec ? fT(a.sec) : '✓'; sp.unit = ''; sp.bigLabel = 'Celkový čas';
    sp.stats = [a.splits?.run ? { id: 'run', label: 'běh celkem', value: fT(a.splits.run) } : null, a.cat ? { id: 'cat', label: 'kategorie', value: a.cat } : null].filter(Boolean);
    const L = a.splits ? HX_ST.map((s, i) => a.splits[i] ? [s, fT(a.splits[i])] : null).filter(Boolean) : []; sp.lists = (sp.lists || []).filter(l => l.id === 'note'); if (L.length) sp.lists.unshift({ id: 'hx', title: 'Stanoviště', items: L }); }
  return sp;
};
// badge za Hyrox
BADGES.push({ id: 'hyrox', name: 'Hyrox', picto: 'hyrox', act: 'hyrox', unit: ['závod', 'závody', 'závodů'], tiers: [1, 3, 5, 10, 20] });
if (S.settings.badges && S.settings.badges.hyrox == null) S.settings.badges.hyrox = bLevel(BADGES[BADGES.length - 1]);

// spodní lišta: roztažení nově zapnuté jako výchozí, lišta o kus výš nad čárou
if (S.settings.vbStretch == null) { S.settings.vbStretch = true; save(); }
const _11fixBottom = fixBottom;
fixBottom = function () { _11fixBottom(); const v = window.__vb || {}; if (v.fix > 20 && S.settings.vbStretch) document.documentElement.style.setProperty('--tabb', `${34 - v.fix + 55}px`); };
fixBottom(); addEventListener('resize', () => fixBottom());
