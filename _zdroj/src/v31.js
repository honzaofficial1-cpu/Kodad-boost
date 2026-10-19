
// ===================== v2.11: lezení, schody, veslo, SkiErg, Hyrox · otužování srozumitelně =====================
const _HD = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
Object.assign(PICTO, {"stairs": {"d": "M17.91 22.31L17.91 22.95L19.00 22.90L19.00 22.31ZM4.36 22.31L4.41 22.95L5.45 22.95L5.45 22.31ZM11.13 18.85L8.02 18.80L7.92 18.90L7.87 20.43L5.89 20.43L5.60 20.53L4.96 20.92L4.41 21.96L8.71 21.96L9.90 20.08L10.84 19.24ZM14.55 15.68L11.98 15.68L11.88 15.78L11.88 17.51L11.78 17.61L8.71 17.61L8.61 17.71L8.61 18.20L8.71 18.30L11.83 18.30L13.95 16.38ZM19.39 14.45L18.95 14.05L18.40 13.90L17.76 13.90L17.02 14.15L10.34 20.28L9.36 21.96L18.45 21.96L19.14 21.71L19.59 21.02L19.59 14.89ZM13.80 14.45L13.90 14.60L15.88 14.60L16.47 13.90L13.90 13.90L13.80 14.00ZM12.12 8.96L12.12 9.31L12.32 9.50L14.94 9.50L15.19 9.60L15.53 9.95L16.62 13.80L16.72 13.90L17.31 13.90L16.18 9.80L15.63 9.11L14.89 8.81L12.32 8.81ZM17.22 8.47L17.81 13.71L18.70 13.71L18.11 8.47ZM19.44 4.71L18.11 4.71L17.86 4.86L16.42 7.87L16.47 8.12L18.11 8.12L19.49 5.05ZM9.50 3.27L8.51 3.62L7.58 4.56L7.03 7.87L6.09 9.55L6.04 10.15L6.44 10.94L6.73 13.95L5.70 15.58L5.40 17.86L4.76 19.09L4.76 19.69L4.91 19.84L7.53 19.84L7.48 19.39L6.83 19.04L6.14 18.40L7.38 15.68L8.12 14.50L8.56 11.68L7.58 11.13L7.58 11.04L10.79 11.73L10.29 12.02L9.85 12.72L9.40 14.84L8.71 16.08L8.66 16.62L9.01 16.82L11.48 16.82L11.43 16.38L10.79 16.03L10.34 15.68L10.15 15.39L12.27 11.63L12.27 11.28L12.12 10.84L10.74 9.85L9.06 9.06L9.55 7.82L9.06 6.73L8.81 5.65L8.91 5.65L9.95 7.82L10.54 8.17L13.01 8.56L14.15 8.56L14.30 8.17L14.30 7.87L13.90 7.53L12.87 7.67L12.22 7.48L11.04 6.88L10.84 5.89L10.54 5.20L10.49 4.36ZM10.64 1.00L9.80 1.69L9.70 2.83L10.29 3.52L10.64 3.67L11.33 3.67L11.93 2.98L11.98 1.64L11.48 1.05Z"}, "row": {"d": "M1.04 18.44L2.68 18.44L2.60 17.97L2.05 17.93L2.01 17.81L2.79 16.06L11.73 16.06L11.73 15.98L11.18 15.20L5.17 15.20L5.17 14.89L6.54 14.89L6.50 14.42L6.42 14.34L3.34 14.38L3.34 14.81L3.42 14.89L4.24 14.89L4.28 15.16L1.00 15.20L1.00 16.06L1.94 16.10ZM15.24 13.99L14.57 13.99L13.21 16.56L12.43 16.60L12.39 17.07L13.87 17.07L15.24 14.34ZM3.34 11.88L3.42 12.16L3.89 12.90L4.08 13.83L4.47 14.11L6.62 14.07L8.84 13.05L9.58 14.07L11.45 15.08L12.16 16.10L12.59 16.37L13.01 16.33L13.99 14.65L13.79 14.38L13.56 14.38L13.21 14.61L12.39 14.89L9.62 11.84L9.27 11.65L6.73 11.92L5.76 12.16L5.56 11.41L4.94 11.38ZM19.53 10.32L18.59 11.80L18.59 12.78L15.32 14.85L14.73 16.06L14.96 16.06L18.90 13.87L19.57 14.54L19.88 14.73L21.32 17.85L21.28 17.93L20.78 17.93L20.66 18.44L22.77 18.44L22.69 17.93L22.10 17.89L20.66 14.69L22.02 14.57L22.92 13.60L22.92 11.14L21.99 10.21L19.88 10.21ZM20.78 11.06L21.36 11.18L21.67 11.38L21.99 11.73L22.18 12.23L22.18 12.70L21.91 13.33L21.52 13.68L20.97 13.87L20.62 13.87L20.04 13.64L19.61 13.17L19.45 12.74L19.45 12.20L19.68 11.65L20.11 11.26ZM1.27 11.06L1.62 11.61L2.72 11.69L5.10 11.10L5.64 11.10L6.07 10.91L6.19 10.91L6.30 11.06L6.23 11.26L6.46 11.26L6.85 10.91L7.20 10.91L7.40 10.63L17.50 11.80L17.73 11.88L17.73 12.94L17.85 12.94L18.36 12.59L18.36 10.95L17.73 10.95L17.73 11.61L17.50 11.65L7.44 10.44L7.16 10.05L6.58 10.01L5.41 10.40L3.34 10.28L2.79 10.32L2.79 10.24L3.26 10.01L3.61 9.39L3.57 10.01L4.82 10.21L5.52 10.13L5.41 9.39L4.82 8.61L4.39 8.26L3.30 7.75L3.15 7.75L2.87 8.10L2.21 8.57L2.01 9.27ZM4.43 5.52L3.73 5.60L3.18 6.27L3.26 7.16L3.77 7.67L4.12 7.75L4.67 7.67L4.82 7.55L5.06 7.05L4.94 5.91Z"}, "skierg": {"d": "M16.71 17.92L15.70 18.94L15.60 19.23L15.60 20.78L15.70 21.07L16.71 22.08L18.70 22.08L19.71 21.02L19.81 20.73L19.76 19.08L18.70 17.92ZM17.49 18.70L17.87 18.70L18.45 18.94L18.84 19.37L18.99 19.76L18.99 20.29L18.70 20.87L18.36 21.16L17.73 21.36L16.96 21.11L16.62 20.78L16.38 20.15L16.47 19.52L16.76 19.08ZM17.00 13.38L16.91 13.38L13.81 21.55L13.72 22.03L13.96 22.27L11.35 22.32L11.35 22.95L20.87 22.95L20.82 22.47L20.10 22.32L19.57 21.69L19.04 22.13L18.99 22.32L14.15 22.27L17.10 14.39ZM9.75 5.74L9.03 6.32L8.88 7.38L9.22 7.91L9.80 8.30L10.38 8.30L10.96 7.72L11.15 6.37L10.67 5.79ZM16.33 1.73L14.44 1.58L14.25 1.77L14.25 2.11L14.49 2.35L11.40 12.56L11.44 12.89L11.54 12.89L14.64 2.40L14.78 2.26L15.51 2.35L15.55 2.55L12.51 13.52L12.27 13.47L11.73 13.81L10.53 12.02L10.09 11.59L9.95 10.72L9.51 9.61L9.46 8.83L8.49 7.53L7.62 7.67L6.56 8.11L5.35 9.75L4.53 11.44L3.61 12.75L3.61 13.38L4.14 14.49L5.06 17.05L4.14 18.50L3.90 20.82L3.13 22.23L3.08 22.95L6.13 22.95L6.03 22.47L5.50 22.18L4.67 21.50L5.93 18.36L6.51 17.34L6.46 16.47L5.35 15.17L5.30 14.97L7.58 16.96L7.09 18.50L7.38 20.87L6.85 22.18L6.90 22.95L10.28 22.95L10.19 22.52L9.27 22.18L8.30 21.36L9.12 16.81L8.69 15.84L6.66 12.75L7.96 11.20L7.62 9.90L7.67 9.75L8.98 12.51L9.46 13.09L10.91 14.35L11.44 14.54L11.83 15.07L12.56 15.12L12.80 14.88L13.09 13.86L12.99 13.67L12.75 13.52L15.75 2.60L16.57 3.90L16.71 3.95L16.71 2.60ZM16.71 1.00L16.47 1.10L16.42 1.53L16.67 1.73L16.96 1.73L17.05 1.82L16.96 12.46L17.34 12.75L17.63 17.39L17.68 17.63L18.60 17.63L19.37 18.12L17.87 1.39L17.73 1.19L17.29 1.00Z"}, "hyrox": {"d": "M18.04 16.82L18.04 17.36L18.16 17.49L21.36 17.49L21.49 17.32L21.49 16.82ZM18.04 15.89L18.04 16.48L18.12 16.56L21.36 16.56L21.49 16.44L21.44 15.89ZM18.04 15.01L18.04 15.60L18.12 15.68L21.36 15.68L21.49 15.55L21.49 15.01ZM16.69 10.42L16.69 17.28L16.61 17.36L16.10 17.32L16.02 17.87L12.32 17.87L12.36 18.71L12.90 18.71L12.99 18.79L12.99 19.21L13.91 19.21L13.96 18.71L20.94 18.71L21.02 18.79L21.02 19.21L21.95 19.21L21.95 18.75L22.58 18.67L22.79 18.37L22.96 17.87L17.36 17.87L17.28 17.78L17.28 10.38ZM18.58 8.24L18.58 14.84L19.17 14.84L19.17 8.28ZM17.28 8.24L16.69 8.24L16.69 8.78L16.10 9.33L13.83 8.70L13.11 8.61L11.26 6.47L10.55 6.55L9.58 6.93L8.57 8.36L7.94 9.67L6.97 10.55L6.72 11.56L5.42 13.45L4.03 14.04L2.35 16.02L1.00 16.90L1.88 18.92L2.01 19.00L3.65 19.00L3.57 18.67L2.81 18.29L2.77 16.82L5.16 15.05L6.17 14.67L8.19 12.69L7.56 11.98L7.60 11.94L9.58 12.90L10.89 13.37L10.51 13.54L9.79 14.42L9.12 16.56L8.15 17.83L8.07 18.54L11.05 18.54L11.01 18.16L9.75 17.20L12.36 13.37L12.36 13.16L12.15 12.53L11.05 11.56L9.92 10.76L11.05 9.41L11.05 9.20L10.55 8.40L10.67 8.40L11.43 9.12L12.53 9.92L12.78 10.00L15.93 10.21L17.36 10.21L17.49 10.09L17.57 9.16L17.28 8.82ZM12.32 4.74L11.68 5.29L11.56 6.22L12.02 6.89L12.40 7.06L12.99 7.06L13.49 6.51L13.62 5.29L13.20 4.79Z"}});
const _11pmarkup = pmarkup;
pmarkup = function (k) { const p = PICTO[k]; if (p && p.f && p.s) return `${p.f.map(d => `<path fill="currentColor" d="${d}"/>`).join('')}<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${p.s.map(([d, w]) => `<path d="${d}" stroke-width="${w}"/>`).join('')}</g>`; return _11pmarkup(k); };
Object.assign(ACT_TYPES, {
  stairs: { name: 'Schody (stroj)', cls: 'act', extra: 1 },
  row: { name: 'Veslo (stroj)', cls: 'act', extra: 1 },
  skierg: { name: 'Běžky (SkiErg)', cls: 'act', extra: 1 },
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
  if (t === 'row' || t === 'skierg') { sp.title = t === 'row' ? 'Veslo' : 'Běžky · SkiErg'; sp.big = a.m ? thou(a.m) : (a.sec ? fT(a.sec) : '✓'); sp.unit = a.m ? 'm' : ''; sp.bigLabel = 'Vzdálenost';
    sp.stats = [a.sec ? { id: 'min', label: 'čas', value: fT(a.sec) } : null, a.m && a.sec ? { id: 'split', label: '/500 m', value: fT(Math.round(a.sec / a.m * 500)) } : null, a.bpm ? { id: 'bpm', label: 'tep', value: `${a.bpm} bpm` } : null].filter(Boolean); }
  if (t === 'stairs') { sp.title = 'Schody'; sp.big = a.floors ? String(a.floors) : String(a.min || '✓'); sp.unit = a.floors ? 'pater' : (a.min ? 'min' : ''); sp.bigLabel = a.floors ? 'Patra' : 'Čas';
    sp.stats = [a.floors && a.min ? { id: 'min', label: 'min', value: String(a.min) } : null, a.level ? { id: 'lvl', label: 'level', value: String(a.level) } : null, a.bpm ? { id: 'bpm', label: 'tep', value: `${a.bpm} bpm` } : null].filter(Boolean); }
  if (t === 'hyrox') { sp.title = 'HYROX'; sp.kicker = ''; sp.big = a.sec ? fT(a.sec) : '✓'; sp.unit = ''; sp.bigLabel = 'Celkový čas';
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
