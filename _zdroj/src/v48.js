
// ===================== v2.28: plán DOKOLA (LOWER → UPPER → volno → …) =====================
// Plán může jet buď podle dnů v týdnu (p.days), nebo jako cyklus od data začátku (p.cycle: [den | null = volno]).
const isCyc = p => !!(p && Array.isArray(p.cycle) && p.cycle.length);
const cycIdx = (p, k) => { const n = Math.round((toU(k) - toU(p.start)) / 864e5), L = p.cycle.length; return ((n % L) + L) % L; };
const _48pd = planDay;
planDay = function (k) {
  const p = prog(); if (!isCyc(p)) return _48pd(k);
  if (k < p.start || (p.weeks && k > planEnd(p))) return null;
  const d = p.cycle[cycIdx(p, k)]; return d && d.tid && tplById(d.tid) ? d : null;
};
// pro jídelníček: je v daný den podle cyklu trénink? (null = plán dokola neběží)
function trainOn(k) { const p = typeof prog === 'function' && prog(); if (!isCyc(p) || k < p.start) return null; return !!planDay(k); }
const _48td = tDays;
tDays = function () {
  const f = F(); if (f.tdays) return f.tdays; const p = prog(); if (!isCyc(p)) return _48td();
  const mon = monday(new Date()); return DNY.filter((_, i) => planDay(dkey(addDays(mon, i))));
};
const cycName = d => { const tp = d && d.tid && tplById(d.tid); return tp ? tp.name : 'volno'; };
const cycLine = p => p.cycle.map(cycName).join(' → ');
const fdm = k => { const d = pdate(k); return `${d.getDate()}. ${d.getMonth() + 1}.`; };

// přehled plánu – při cyklu po datech (tento a příští týden)
const _48vPlan = XV.plan;
XV.plan = function () {
  const p = S.program; if (!p || !p.on || !isCyc(p)) return _48vPlan();
  const mon = dkey(monday(new Date())), wk = planWeek(mon), pw = planWeek(dkey(addDays(pdate(mon), -7)));
  const weekN = Math.max(1, Math.floor((toU(mon) - toU(dkey(monday(pdate(p.start))))) / 7 / 864e5) + 1);
  const row = k => {
    const d = planDay(k), dw = pdate(k).getDay(), tp = d && tplById(d.tid);
    if (!tp) return `<button class="li pday off ${k === today() ? 'today' : ''}" data-a="day" data-k="${k}"><span class="dw">${DOW[dw]}</span><div class="t"><b class="mut">Volno</b><small>${fdm(k)}</small></div>${k === today() ? '<span class="pst today">Dnes</span>' : ''}</button>`;
    const st = planState(k) || 'plan';
    const lab = { done: 'Hotovo', moved: 'Dohnáno', skip: 'Vynecháno', miss: 'Zmeškáno', today: 'Dnes', plan: '' }[st];
    return `<button class="li pday ${st}" data-a="day" data-k="${k}"><span class="dw">${DOW[dw]}</span><div class="t"><b>${esc(tp.name)}</b><small>${[fdm(k), planDayDesc(d) || CVK(tp.ex.length)].filter(Boolean).map(esc).join(' · ')}</small></div>${lab ? `<span class="pst ${st}">${lab}</span>` : ''}</button>`;
  };
  const days = off => [...Array(7)].map((_, i) => dkey(addDays(pdate(mon), off + i)));
  const nx = planWeek(dkey(addDays(pdate(mon), 7)));
  return `<div class="wrap">
    ${hdr(backBtn('gym'), '<h1>Plán</h1>', `<button class="round" data-a="plan-edit" aria-label="Upravit plán">${ico('more')}</button>`)}
    <div class="plhero"><h2>${esc(p.name)}</h2>
      <div class="chips"><span class="chip">${esc(cycLine(p))}</span><span class="chip">dokola od ${fdm(p.start)}</span>${p.focus ? `<span class="chip">${esc(p.focus)}</span>` : ''}${p.weeks ? `<span class="chip">${p.weeks} týdnů</span>` : ''}</div>
      <div class="plprog"><span class="plring big">${ringSVG(wk.done, wk.n, 96, 8, 'var(--hot)')}<i>${wk.done}/${wk.n}</i></span>
        <div><div class="lbl">${p.weeks ? `Týden ${Math.min(weekN, p.weeks)} z ${p.weeks}` : `Týden ${weekN}`}</div><p>Tento týden máš hotovo ${wk.done} z ${wk.n}.</p>${weekN > 1 ? `<p class="mut">Minulý týden ${pw.done}/${pw.n}</p>` : ''}</div></div></div>
    <div class="lbl" style="margin:22px 6px 10px">Tento týden</div>
    <div class="list">${days(0).map(row).join('')}</div>
    <div class="lbl" style="margin:22px 6px 10px">Příští týden · ${nx.n} ${nx.n >= 5 ? 'tréninků' : 'tréninky'}</div>
    <div class="list">${days(7).map(row).join('')}</div>
  </div>${tabs()}`;
};

// editor: přepínač Dny v týdnu / Dokola
const _48vPlanEdit = XV.planEdit;
XV.planEdit = function () {
  const d = planDraft; if (!d) return XV.plan();
  const modeSeg = `<div class="seg" style="margin:0 0 14px"><button data-a="pl-mode" data-v="week" class="${isCyc(d) ? '' : 'on'}">Dny v týdnu</button><button data-a="pl-mode" data-v="cyc" class="${isCyc(d) ? 'on' : ''}">Dokola</button></div>`;
  let h = _48vPlanEdit();
  if (!isCyc(d)) return h.replace('<div class="lbl" style="margin:22px 6px 10px">Dny v týdnu</div>', `<div class="lbl" style="margin:22px 6px 10px">Jak plán jede</div>${modeSeg}`);
  const slots = d.cycle.map((x, i) => {
    const tp = x && x.tid && tplById(x.tid); x = x || {};
    return `<div class="pde pce ${tp ? 'on' : ''}" data-ci="${i}"><div class="pdh"><b>Den ${i + 1}</b>
      <div style="display:flex;gap:8px;align-items:center;max-width:70%"><select data-pf="tid" style="max-width:none"><option value="">Volno</option>${S.templates.map(t => `<option value="${t.id}" ${x.tid === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>
      ${d.cycle.length > 1 ? `<button class="round" style="width:40px;height:40px;flex:none" data-a="pc-del" aria-label="Odebrat den">${ico('x')}</button>` : ''}</div></div>
      ${tp ? `<div class="form" style="margin-top:12px;gap:10px">
        <label class="f">Zaměření dne<input data-pf="focus" value="${esc(x.focus || '')}" placeholder="např. Spodek, Vršek"></label>
        <div class="two"><label class="f">Kardio po tréninku<select data-pf="ck"><option value="">Žádné</option>${CARDIO_KINDS.map(o => `<option ${x.cardio?.kind === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
          <div class="two" ${x.cardio ? '' : 'hidden'}><label class="f">Min<input data-pf="cmin" inputmode="numeric" value="${x.cardio?.min ?? ''}" placeholder="15"></label><label class="f">Tep<input data-pf="cbpm" inputmode="numeric" value="${x.cardio?.bpm ?? ''}" placeholder="120"></label></div></div>
        <button class="sw ${x.stretch ? 'on' : ''}" data-a="pf-stretch"><span>Doporučit strečink<small>Připomene se při dokončení</small></span><span class="k"></span></button>
        <label class="f">Poznámka k dni<input data-pf="note" value="${esc(x.note || '')}" placeholder="např. bez kardia, když je box"></label></div>` : ''}</div>`;
  }).join('');
  const prev = [...Array(9)].map((_, i) => { const k = dkey(addDays(pdate(d.start), i)); const x = d.cycle[i % d.cycle.length]; return `${DOW[pdate(k).getDay()]} ${fdm(k)} ${cycName(x)}`; }).join(' · ');
  const block = `<div class="lbl" style="margin:22px 6px 10px">Jak plán jede</div>${modeSeg}
    <p class="mut" style="font-size:14px;margin:0 4px 12px">Dny jdou za sebou pořád dokola od data začátku, bez ohledu na den v týdnu. Když trénink nestihneš, aplikace se zeptá – nic se neposouvá.</p>
    <p style="font-size:14px;margin:0 4px 12px">${esc(prev)} …</p>
    <div class="pdl">${slots}</div>
    <button class="btn block" style="margin-top:10px" data-a="pc-add">${ico('plus')} Přidat den</button>`;
  return h.replace(/<div class="lbl" style="margin:22px 6px 10px">Dny v týdnu<\/div>[\s\S]*?<div class="pdl">[\s\S]*?<\/div>\s*<div class="bottom-acts"/, block + '\n    <div class="bottom-acts"');
};
const _48read = readPlanDraft;
readPlanDraft = function () {
  const d = planDraft; if (!d || !isCyc(d)) return _48read();
  if (!$('#pl-name')) return;
  d.name = $('#pl-name').value.trim() || 'Můj plán'; d.focus = $('#pl-focus').value.trim(); d.weeks = num($('#pl-weeks').value) || null; d.start = $('#pl-start').value || d.start;
  $$('.pce').forEach(el => {
    const i = +el.dataset.ci, v = f => $(`[data-pf="${f}"]`, el);
    const tid = v('tid').value; if (!tid) { d.cycle[i] = null; return; }
    const x = d.cycle[i] = d.cycle[i] && d.cycle[i].tid === tid ? d.cycle[i] : { tid, focus: '', cardio: null, stretch: false, note: '' };
    if (v('focus')) { x.focus = v('focus').value.trim(); x.note = v('note').value.trim(); const ck = v('ck').value; x.cardio = ck ? { kind: ck, min: num(v('cmin').value), bpm: num(v('cbpm').value) } : null; }
  });
};
const reEdit = () => { const a = $('#app'), y = a ? a.scrollTop : 0; render(); if (a) a.scrollTop = y; };
A['pl-mode'] = b => {
  readPlanDraft(); const d = planDraft, want = b.dataset.v === 'cyc'; if (want === isCyc(d)) return;
  if (want) {
    d.cycle = d.cycleOff || (() => { const ws = WEEK_ORDER.map(dw => d.days[dw]).filter(Boolean); return ws.length ? ws.map(x => JSON.parse(JSON.stringify(x))).concat([null]) : [null]; })();
    if (d.start < today() && !d.cycleOff) d.start = today();
  } else { d.cycleOff = d.cycle; d.cycle = null; }
  reEdit();
};
A['pc-add'] = () => { readPlanDraft(); planDraft.cycle.push(null); reEdit(); };
A['pc-del'] = b => { readPlanDraft(); const i = +b.closest('.pce').dataset.ci; planDraft.cycle.splice(i, 1); reEdit(); };
const _48stretch = A['pf-stretch'];
A['pf-stretch'] = b => {
  const el = b.closest('.pce'); if (!el) return _48stretch(b);
  readPlanDraft(); const x = planDraft.cycle[+el.dataset.ci]; if (x) { x.stretch = !x.stretch; b.classList.toggle('on', x.stretch); }
};
const _48save = A['plan-save'];
A['plan-save'] = () => {
  const d = planDraft; if (!d || !isCyc(d)) { if (d) { d.cycle = null; } return _48save(); }
  readPlanDraft(); const nT = d.cycle.filter(x => x && x.tid).length; if (!nT) return toast('Vyber aspoň jeden trénink');
  S.program = { ...d, on: true }; delete S.program.cycleOff;
  S.settings.weekGoal = Math.max(1, Math.floor(nT * 7 / d.cycle.length));
  planDraft = null; save(true); go('plan'); toast('Plán uložen');
};
// v týdenním režimu: když se ve formuláři mění select, readPlanDraft volá správnou verzi (viz výše); u cyklu přerenderovat
document.addEventListener('change', ev => { if (view.n === 'planEdit' && planDraft && isCyc(planDraft) && ev.target.matches('#pl-start')) { readPlanDraft(); reEdit(); } });

// jednorázově: Janův plán UPPER → LOWER → volno, dokola od 23. 11. 2026
(function () {
  if (S.settings.migCyc1) return;
  const find = re => S.templates.find(t => re.test(t.name));
  const byName = n => S.exercises.find(e => e.name.toLowerCase() === n.toLowerCase());
  const mk = (name, list) => { const ex = [], n = {}; list.forEach(([nm, c]) => { const e = byName(nm); if (e) { ex.push(e.id); n[e.id] = c; } }); const t = { id: uid(), name, ex, n, finisher: '' }; S.templates.unshift(t); return t; };
  const lo = find(/^\s*lower\s*$/i) || find(/lower/i) || mk('LOWER', [['One leg leg press', 2], ['Zákopy v sedě', 2], ['Předkopy', 1], ['Lýtka ve stoji', 2], ['Seated hip adductions', 2], ['Decline bench crunches', 2], ['DB wrist curls', 2]]);
  const up = find(/^\s*upper\s*$/i) || find(/upper/i) || mk('UPPER', [['Triceps na kladce', 2], ['Incline preacher curls', 2], ['Banded Smith shoulder press', 2], ['Pronated lat pulldowns', 2], ['Pec deck flys', 2], ['T bar rows', 2], ['Rameno na kladce', 1]]);
  const old = (S.program && S.program.days) || {};
  const cfg = (tp, focus) => { const o = Object.values(old).find(x => x && x.tid === tp.id); return { tid: tp.id, focus: o?.focus || focus, cardio: o?.cardio || null, stretch: !!o?.stretch, note: o?.note || '' }; };
  const nm = S.program && S.program.on && S.program.name && S.program.name !== 'Můj plán' ? S.program.name : 'Upper / Lower';
  S.program = { name: nm, focus: (S.program && S.program.focus) || '', weeks: null, start: '2026-11-23', days: old, cycle: [cfg(up, 'Vršek'), cfg(lo, 'Spodek'), null], on: true };
  S.templates.forEach(t => { delete t.dow; });
  if (S.food) S.food.tdays = null; // jídelníček ať bere tréninkové dny z cyklu
  S.settings.weekGoal = 4; S.settings.migCyc1 = 1; S.settings.migCyc2 = 1; save(true);
})();
// oprava: začátek je pondělí 23. 11. UPPER, úterý LOWER, středa volno
(function () {
  if (S.settings.migCyc2) return; S.settings.migCyc2 = 1;
  const p = S.program; if (isCyc(p) && p.cycle.length === 3 && !p.cycle[2]) {
    const [a, b] = p.cycle; const nA = a && tplById(a.tid)?.name || '', nB = b && tplById(b.tid)?.name || '';
    if (/lower/i.test(nA) && /upper/i.test(nB)) p.cycle = [b, a, null];
    p.start = '2026-11-23';
  }
  save(true);
})();

// ===================== UPPER podle nové předlohy (tabulka „Ján Kodad tréning“, 24. 11. 2026) =====================
// RIR 0 = do selhání (F), RIR 1 = 1 opakování v rezervě. Tempo 2-0-X-0 u všech.
(function () {
  if (S.settings.migUp1) return;
  const p = S.program; const up = (isCyc(p) && p.cycle.map(x => x && tplById(x.tid)).find(t => t && /upper/i.test(t.name))) || S.templates.find(t => /upper/i.test(t.name));
  if (!up) { S.settings.migUp1 = 1; save(true); return; }
  const byName = n => S.exercises.find(e => e.name.toLowerCase() === n.toLowerCase());
  const R = (min, max, rir) => rir.map(r => ({ min, max, fail: r === 0 }));
  // [název, znovupoužít existující, partie, vedlejší, jednostranně, krok kg, série, RIR, tipy]
  const L = [
    ['Smith bench press', null, 'Hrudník', 'Přední delty, triceps', 0, 2.5, R(5, 8, [1, 1]), [1, 1], ['Lopatky stažené a dolů', 'Další rotace: 6–10 opakování']],
    ['Preacher curls jednoruč (stroj)', null, 'Biceps', 'Brachialis', 1, 1.25, R(5, 8, [1, 1]), [1, 1], ['Dole plné protažení', 'Loket se nehýbe']],
    ['Předpažování vleže na lavici na kladce', null, 'Přední delty', 'Horní hrudník', 0, 1.25, R(6, 9, [1]), [1], ['Bez švihu, trup na lavici']],
    ['Overhand cable curls', null, 'Brachioradialis', 'Biceps, brachialis', 0, 1.25, R(6, 9, [1]), [1], ['Nadhmat, lokty u těla']],
    ['Triceps extenze jednoruč na kladce', null, 'Triceps', '–', 1, 1.25, R(5, 8, [1, 0]), [1, 0], ['Lano, kabel nebo manžeta', 'Plné propnutí']],
    ['Upažování na stroji', null, 'Boční delty', 'Trapézy', 0, 2.5, R(5, 8, [1, 0]), [1, 0], ['Vede loket', 'Bez švihu']],
    ['Pronated lat pulldowns', null, 'Široký sval zádový', 'Horní záda, biceps', 0, 2.5, R(5, 8, [1]), [1], ['Nadhmat, široký úchop', 'Táhni lokty dolů k bokům']],
    ['Stahování kladky podhmatem úzce', null, 'Široký sval zádový', 'Biceps', 0, 2.5, R(5, 8, [0]), [0], ['Podhmat, úzký úchop', 'Nahoře nech lopatky vyjet']],
    ['Tlaky na ramena (stroj)', null, 'Přední delty', 'Triceps, boční delty', 0, 2.5, R(5, 8, [0]), [0], ['Zpevněný trup, bez záklonu']],
    ['T bar rows', null, 'Horní záda', 'Široký sval zádový, zadní delty', 0, 2.5, R(5, 8, [1, 0]), [1, 0], ['Hrudník na opěrce, cíl mezilopatkové svaly', 'Po selhání ještě kelso shrugs']],
  ];
  const ex = [], n = {};
  L.forEach(([name, , muscle, secondary, uni, inc, sets, rir, cues]) => {
    let e = byName(name);
    if (!e) { e = { id: uid(), name, muscle, secondary, uni: !!uni, inc, sets, cues, tempo: '2-0-X-0', partials: false, note: '' }; S.exercises.push(e); }
    else { e.sets = sets; e.tempo = '2-0-X-0'; e.cues = cues; e.muscle = e.muscle || muscle; }
    e.note = `RIR ${rir.join(' / ')}`;
    ex.push(e.id); n[e.id] = sets.length;
  });
  up.ex = ex; up.n = n;
  S.settings.migUp1 = 1; save(true);
})();
