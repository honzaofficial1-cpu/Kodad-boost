
// ===================== v2.17: WHOOP jako samostatná sekce · větší Jídlo · potvrzení co propsat =====================
// víc údajů z WHOOPu (SpO2, teplota kůže, dech, potřeba a efektivita spánku)
const _17merge = whoopMerge;
whoopMerge = function (j) {
  _17merge(j); const w = W(); const day = k => (w.days[k] = w.days[k] || {}); const sl = {};
  (j.sleep || []).forEach(s => { sl[s.id] = s; if (s.nap || !s.score || s.score_state === 'UNSCORABLE') return; const k = dkey(new Date(s.end)); const sc = s.score, st = sc.stage_summary || {}, nd = sc.sleep_needed || {};
    const need = ((nd.baseline_milli || 0) + (nd.need_from_sleep_debt_milli || 0) + (nd.need_from_recent_strain_milli || 0) - (nd.need_from_recent_nap_milli || 0)) / 3.6e6;
    Object.assign(day(k), { eff: sc.sleep_efficiency_percentage != null ? Math.round(sc.sleep_efficiency_percentage) : null, cons: sc.sleep_consistency_percentage ?? null, resp: sc.respiratory_rate != null ? Math.round(sc.respiratory_rate * 10) / 10 : null, needH: need > 0 ? Math.round(need * 10) / 10 : null,
      deepH: st.total_slow_wave_sleep_time_milli ? Math.round(st.total_slow_wave_sleep_time_milli / 3.6e5) / 10 : null, remH: st.total_rem_sleep_time_milli ? Math.round(st.total_rem_sleep_time_milli / 3.6e5) / 10 : null, bed: s.start, wake: s.end }); });
  (j.recovery || []).forEach(r => { if (!r.score) return; const s = sl[r.sleep_id]; const k = dkey(new Date(s ? s.end : r.created_at)); Object.assign(day(k), { spo2: r.score.spo2_percentage != null ? Math.round(r.score.spo2_percentage * 10) / 10 : null, skin: r.score.skin_temp_celsius != null ? Math.round(r.score.skin_temp_celsius * 10) / 10 : null, calib: !!r.score.user_calibrating }); });
};
if (!S.settings.whoopV2) { S.settings.whoopV2 = 1; if (S.whoop) S.whoop.last = null; save(); }

const recCol = r => r == null ? 'var(--mut)' : r >= 67 ? '#16EC06' : r >= 34 ? '#FFDE00' : '#FF0026';
const recZone = r => r == null ? '' : r >= 67 ? 'zelená' : r >= 34 ? 'žlutá' : 'červená';
const hm = h => h == null ? '–' : `${Math.floor(h)}:${pad(Math.round((h % 1) * 60))}`;
const avg7 = (key, k) => { const v = [...Array(7)].map((_, i) => wDay(dkey(addDays(pdate(k), -i - 1)))?.[key]).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };

// ---------- domů: velké samostatné sekce Jídlo a WHOOP ----------
const _17vHome = vHome;
vHome = function () {
  let h = _17vHome();
  h = h.replace(/<button class="hcard frow"[\s\S]*?<\/button>/, '').replace(/<button class="hcard wrow"[\s\S]*?<\/button>/, '');
  let food = '';
  { const f = F(); const c = f.start ? cyc(today()) : null; const R = RX();
    let line = 'Jídelníček, nákup, suplementy', meta = 'Nastav start jídelníčku', kc = '';
    if (c && !c.before) { const day = planDayF(c.w, c.di, today()); const now = new Date().getHours() * 60 + new Date().getMinutes();
      const nx = SLOTS.find(([, , t]) => { const [a, b] = t.split(':').map(Number); return now < a * 60 + b + 60; });
      line = nx ? `<i>${nx[1]} ${nx[2]}</i>${esc(R[day.jidla[nx[0]]]?.nazev || '')}` : `<i>Zítra</i>${esc(R[planDayF(c.w, (c.di + 1) % 7, dkey(addDays(new Date(), 1))).jidla.snidane]?.nazev || '')}`;
      const tot = dayTotals(day, f.step); const e = (f.eaten || {})[today()] || {}; const n = Object.values(e).filter(v => v === 'ok').length;
      meta = `Týden ${c.w} · ${thou(r0(tot.kcal))} kcal · B ${r0(tot.bilkoviny_g)} g`; kc = `${n}/4 snědeno`; }
    food = `<div class="scard food" data-a="tab" data-v="f-den"><div class="lbl">Jídelníček · nákup · suplementy</div><h1>Jídlo</h1><p class="snext">${line}</p>
      <div class="gfoot"><span class="mut">${meta}${kc ? ' · ' + kc : ''}</span><button class="gplay" data-a="tab" data-v="f-den" aria-label="Otevřít jídlo">${ico('arrow')}</button></div></div>`; }
  let wh = '';
  if (whoopOn()) { const d = wDay(today()) || {}, y = wDay(dkey(addDays(new Date(), -1))) || {}; const P = woPending().length;
    wh = `<div class="scard whoop" data-a="tab" data-v="whoop" style="--rc:${recCol(d.rec)}"><div class="lbl">Regenerace · spánek · zátěž</div><h1>WHOOP</h1>
      <div class="wmini"><div><b style="color:${recCol(d.rec)}">${d.rec != null ? d.rec + '<small>%</small>' : '–'}</b><span>recovery</span></div><div><b>${hm(d.sleepH)}</b><span>spánek</span></div><div><b>${y.strain != null ? kg(y.strain) : '–'}</b><span>strain včera</span></div></div>
      <div class="gfoot"><span class="mut">${P ? `<em style="font-style:normal;color:var(--fg)">${P} ${P === 1 ? 'nová aktivita' : P < 5 ? 'nové aktivity' : 'nových aktivit'} k potvrzení</em>` : d.hrv != null ? `HRV ${d.hrv} ms · klidový tep ${d.rhr}` : 'Detail regenerace a spánku'}</span><button class="gplay" data-a="tab" data-v="whoop" aria-label="Otevřít WHOOP">${ico('arrow')}</button></div></div>`; }
  const T = document.createElement('template'); T.innerHTML = h; const g = T.content.querySelector('.gcard');
  if (g) { g.insertAdjacentHTML('afterend', food + wh); return T.innerHTML; }
  return h.replace('<div class="hgrid">', food + wh + '<div class="hgrid">');
};

// ---------- sekce WHOOP ----------
XV.whoop = function () {
  const w = S.whoop || { days: {}, wo: {} }; const k = view.d || today(); const d = wDay(k) || {}, y = wDay(dkey(addDays(pdate(k), -1))) || {};
  if (!whoopOn()) return `<div class="wrap">${hdr(backBtn('home'), '<h1>WHOOP</h1>', '<span></span>')}<div class="empty"><b>WHOOP není propojený</b><span>Propoj ho a regenerace, spánek a zátěž se načtou samy.</span><button class="btn white" data-a="wo-login">Propojit WHOOP</button></div>${codeBox()}</div>${tabs()}`;
  const ahrv = avg7('hrv', k), arhr = avg7('rhr', k);
  const dlt = (v, a, inv) => v == null || a == null ? '' : `<em class="${(v - a) * (inv ? -1 : 1) >= 0 ? 'g' : 'b'}">${v - a >= 0 ? '+' : '−'}${Math.abs(Math.round(v - a))} proti 7 dnům</em>`;
  const tip = d.rec == null ? '' : d.rec >= 67 ? 'Tělo je připravené – trénink podle plánu naplno.' : d.rec >= 34 ? 'Trénink podle plánu. Rekordy zkoušej, jen když se cítíš dobře.' : 'Nízká regenerace – zvaž lehčí den (štítek Lehčí týden), víc spánku a jídlo podle plánu.';
  const days7 = [...Array(7)].map((_, i) => dkey(addDays(pdate(k), i - 6)));
  const bars = days7.map(kk => { const x = wDay(kk) || {}; return `<div class="w7b"><i style="height:${x.rec != null ? Math.max(6, x.rec) : 4}%;background:${recCol(x.rec)}"></i><span>${DOW[pdate(kk).getDay()]}</span></div>`; }).join('');
  const av = key => { const v = days7.map(kk => wDay(kk)?.[key]).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const P = woPending(); const lim = Date.now() - 14 * DMS; const used = new Set(S.activities.map(a => a.whoopId).filter(Boolean));
  const wos = Object.values(w.wo).filter(x => x.start > lim).sort((a, b) => b.start - a.start);
  const woRow = x => { const t = (WSPORT.find(([r]) => r.test(x.sport)) || [0, 'other'])[1]; const nm = t === 'other' ? x.sport : (ACT_TYPES[t]?.name || x.sport); const gym = finished().find(s => woFor(s) === x);
    const st = used.has(x.id) ? 'propsáno' : gym ? `k tréninku ${esc(gym.name)}` : (W().dis || {})[x.id] ? 'nepropsáno' : P.includes(x) ? '' : 'posilování';
    return `<div class="li wpend"><span class="ic ${ACT_TYPES[t]?.cls || 'act'}" data-t="${t}">${ico(ACT_TYPES[t]?.icon || 'plus')}</span><div class="t"><b>${esc(gym ? 'Posilování' : nm)}</b><small>${fday(dkey(new Date(x.start)))} · ${Math.round((x.end - x.start) / 60000)} min${x.km ? ` · ${kg(x.km)} km` : ''}${x.strain != null ? ` · strain ${kg(x.strain)}` : ''}${x.hr ? ` · Ø ${x.hr} bpm` : ''}</small></div>${st ? `<span class="pst">${st}</span>` : `<button class="btn white" style="padding:9px 14px" data-a="wo-add" data-id="${x.id}">Propsat</button>`}</div>`; };
  const nav = `<div class="fdnav"><button class="round" data-a="w-day" data-v="-1" aria-label="Předchozí den">${ico('back')}</button><div><b>${k === today() ? 'Dnes' : flong(k)}</b><small>${d.calib ? 'WHOOP se ještě kalibruje' : d.wake ? `vstávání ${new Date(d.wake).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}` : ''}</small></div><button class="round" data-a="w-day" data-v="1" aria-label="Další den" ${k >= today() ? 'disabled' : ''}>${ico('chev')}</button></div>`;
  return `<div class="wrap whp">${hdr(backBtn('home'), '<h1>WHOOP</h1>', '<span></span>')}${nav}
    <div class="wrec" style="--rc:${recCol(d.rec)}"><div class="wring">${ringSVG(d.rec || 0, 100, 150, 12, recCol(d.rec))}<div><b>${d.rec != null ? d.rec : '–'}<small>%</small></b><span>recovery</span></div></div>
      <div class="wside"><div><span>HRV</span><b>${d.hrv ?? '–'}<small> ms</small></b>${dlt(d.hrv, ahrv)}</div><div><span>Klidový tep</span><b>${d.rhr ?? '–'}<small> bpm</small></b>${dlt(d.rhr, arhr, true)}</div></div></div>
    ${tip ? `<p class="wtip" style="border-color:${recCol(d.rec)}">${tip}</p>` : ''}
    <div class="wgrid"><div><span>SpO₂</span><b>${d.spo2 != null ? nf(d.spo2, 1) : '–'}<small> %</small></b></div><div><span>Teplota kůže</span><b>${d.skin != null ? nf(d.skin, 1) : '–'}<small> °C</small></b></div><div><span>Dech</span><b>${d.resp != null ? nf(d.resp, 1) : '–'}<small> /min</small></b></div></div>
    <div class="fsec"><div class="lbl">Spánek</div>
      <div class="wsleep"><div class="big"><b>${hm(d.sleepH)}</b><span>${d.needH ? `potřeba ${hm(d.needH)}` : 'spánek'}</span></div>
        <div class="wlist"><div><span>Výkon spánku</span><b>${d.sleepPerf ?? '–'} %</b></div><div><span>Efektivita</span><b>${d.eff ?? '–'} %</b></div><div><span>Hluboký / REM</span><b>${hm(d.deepH)} / ${hm(d.remH)}</b></div><div><span>Konzistence</span><b>${d.cons ?? '–'} %</b></div></div></div></div>
    <div class="fsec"><div class="lbl">Zátěž</div><div class="wgrid"><div><span>Strain včera</span><b>${y.strain != null ? kg(y.strain) : '–'}</b></div><div><span>Strain dnes</span><b>${d.strain != null ? kg(d.strain) : '–'}</b></div><div><span>Kroky včera</span><b>${y.steps != null ? thou(y.steps) : '–'}</b></div></div></div>
    <div class="fsec"><div class="lbl">Posledních 7 dní</div><div class="w7bars">${bars}</div>
      <div class="wgrid four"><div><span>Ø recovery</span><b>${av('rec') != null ? r0(av('rec')) : '–'}<small>%</small></b></div><div><span>Ø HRV</span><b>${av('hrv') != null ? r0(av('hrv')) : '–'}</b></div><div><span>Ø spánek</span><b>${hm(av('sleepH'))}</b></div><div><span>Ø strain</span><b>${av('strain') != null ? nf(av('strain'), 1) : '–'}</b></div></div></div>
    <div class="fsec"><div class="lbl">Aktivity z WHOOPu · 14 dní</div><p class="mut" style="font-size:13px;margin:0 2px 8px">Nic se nepropisuje samo – u každé vybereš, co z ní převzít.</p><div class="list">${wos.map(woRow).join('') || '<p class="mut">Žádné.</p>'}</div></div>
    <div class="fsec"><p class="mut" style="font-size:12px;margin:0 2px">${w.last ? `Načteno ${new Date(w.last).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}${S.settings.whoopErr ? ' · ' + esc(S.settings.whoopErr) : ''}</p>
      <div class="two" style="margin-top:10px"><button class="btn" data-a="wo-sync">Načíst teď</button><button class="btn" data-a="wo-off">Odpojit</button></div></div>
  </div>${tabs()}`;
};
A['w-day'] = b => { const k = view.d || today(); const n = dkey(addDays(pdate(k), +b.dataset.v)); if (n > today()) return; view.d = n; render(); };

// ---------- potvrzení, co z WHOOP aktivity propsat ----------
A['wo-add'] = b => {
  const x = W().wo[b.dataset.id]; if (!x) return; const t = (WSPORT.find(([r]) => r.test(x.sport)) || [0, 'other'])[1]; const min = Math.round((x.end - x.start) / 60000);
  const F_ = [['min', `Čas ${min} min`, true], x.km ? ['km', `Vzdálenost ${kg(x.km)} km`, true] : null, x.hr ? ['hr', `Ø tep ${x.hr} bpm`, true] : null, x.strain != null ? ['strain', `Strain ${kg(x.strain)}`, true] : null, x.elev ? ['elev', `Převýšení ${x.elev} m`, false] : null].filter(Boolean);
  sheet(`<h2>Propsat z WHOOPu</h2><p class="mut" style="margin:4px 0 0">${esc(x.sport)} · ${flong(dkey(new Date(x.start)))} · ${new Date(x.start).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</p>
    <div class="form"><label class="f">Jako aktivitu<select id="wo-t">${Object.entries(ACT_TYPES).map(([k2, v]) => `<option value="${k2}" ${k2 === t ? 'selected' : ''}>${v.name}</option>`).join('')}</select></label>
      <div><div class="lbl" style="margin:0 2px 8px">Co propsat</div><div class="chips wofs">${F_.map(([k2, l, on]) => `<button class="chip ${on ? 'on' : ''}" data-a="part-tog" data-v="${k2}">${l}</button>`).join('')}</div></div></div>
    <div class="actions"><button class="btn" data-a="wo-dis2" data-id="${x.id}">Nepropisovat</button><button class="btn white" data-a="wo-add2" data-id="${x.id}">Propsat</button></div>`);
};
A['wo-dis2'] = b => { W().dis[b.dataset.id] = 1; save(true); closeSheet(); render(); toast('Nepropsáno'); };
A['wo-add2'] = b => {
  const x = W().wo[b.dataset.id]; if (!x) return; const t = $('#wo-t').value; const on = new Set([...document.querySelectorAll('#sheet .wofs .chip.on')].map(c => c.dataset.v));
  const a = { id: uid(), type: t, date: dkey(new Date(x.start)), ts: Date.now(), whoopId: x.id, note: '' };
  if (on.has('min')) { a.min = Math.round((x.end - x.start) / 60000); if (['run', 'bike', 'xcski', 'row', 'skierg', 'hyrox'].includes(t)) a.sec = Math.round((x.end - x.start) / 1000); }
  if (on.has('km')) { if (['row', 'skierg'].includes(t)) a.m = Math.round(x.km * 1000); else a.km = x.km; }
  if (on.has('hr')) a.bpm = x.hr; if (on.has('strain')) a.strain = x.strain; if (on.has('elev')) a.elev = x.elev;
  if (t === 'other') a.label = x.sport; if (t === 'bike') a.kind = a.km ? 'Kolo venku' : 'Rotoped';
  S.activities.push(a); save(true); closeSheet(); render(); toast('Propsáno – detaily doplníš klepnutím v Aktivitách'); setTimeout(checkBadges, 600);
};

// ---------- kód z přihlášení (když se aplikace z plochy a Safari nepotkají) ----------
function codeBox() { return `<div class="fsec"><div class="lbl">Máš kód z přihlášení?</div><div class="fadd"><input id="wo-code" placeholder="Vlož kód z WHOOP stránky"><button class="btn white" data-a="wo-code">Uložit</button></div></div>`; }
A['wo-code'] = () => { const v = ($('#wo-code').value || '').trim(); if (v.length < 20) return toast('Kód je moc krátký'); S.settings.whoopKey = v; delete S.settings.whoopErr; if (S.whoop) S.whoop.last = null; save(true); render(); whoopSync(true).then(() => render()); toast('WHOOP propojený'); };
const _17vSettings = vSettings;
vSettings = function () { const h = _17vSettings(); return whoopOn() ? h : h.replace('data-a="wo-login">Propojit WHOOP</button></div>', 'data-a="wo-login">Propojit WHOOP</button>' + codeBox() + '</div>'); };
const _17tabs = tabs;
tabs = () => view.n === 'whoop' ? _17tabs().replace('data-v="home" class="', 'data-v="home" class="on ') : _17tabs();

// po automatické synchronizaci překreslit i sekci WHOOP
const _17merge2 = whoopMerge;
whoopMerge = function (j) { _17merge2(j); if (view.n === 'whoop') setTimeout(() => { if ($('#sheet').hidden) render(); }, 50); };
// seznam v Aktivitách: tlačítko Propsat (otevře výběr)
const _17vActs = vActs;
vActs = function () { return _17vActs().replace(/data-a="wo-add" data-id="([^"]+)">Přidat</g, 'data-a="wo-add" data-id="$1">Propsat<'); };
// texty v Nastavení
const _17vSet2 = vSettings;
vSettings = function () { return _17vSet2().replace('Tréninky z WHOOPu půjdou přidat jedním klepnutím.', 'U tréninků z WHOOPu vždy vybereš, co se má propsat.'); };

// návrat z přihlášení v okně, které není aplikace z plochy → poradit zavřít a dát kód
(function () {
  const sa = !!(navigator.standalone || matchMedia('(display-mode: standalone)').matches);
  const k = S.settings.whoopKey; if (sa || !k || !sessionStorage) return;
  let fresh = false; try { fresh = sessionStorage.getItem('kb-wfresh') === '1'; } catch (e) { }
  if (!fresh) return; try { sessionStorage.removeItem('kb-wfresh'); } catch (e) { }
  setTimeout(() => sheet(`<h2>WHOOP propojený</h2><p class="mut" style="margin:6px 0 14px">Tohle okno není aplikace z plochy, proto tu lišta sedí jinde. Zavři ho (Hotovo nahoře) a otevři Kodad z plochy.</p>
    <p class="mut" style="margin:0 0 8px">Když tam WHOOP nebude, vlož v Nastavení tento kód:</p><div class="fadd"><input id="wo-show" readonly value="${esc(k)}"><button class="btn white" data-a="wo-copy">Kopírovat</button></div>`), 700);
})();
A['wo-copy'] = () => { const i = $('#wo-show'); i.select(); (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject()).then(() => toast('Zkopírováno'), () => { document.execCommand('copy'); toast('Zkopírováno'); }); };

// ===================== v2.17.1: „k obědu o X g méně“ rovnou v receptu =====================
const UP_SLOT = { snidani: 'snidane', obedu: 'obed', svacine: 'svacina', veceri: 'vecere' };
let _UPM = 0; // jen při vykreslení jídel, ne pro nákup a součty
const _17pd = planDayF;
planDayF = function (w, di, k) {
  const d = _17pd(w, di, k); if (!d || !_UPM) return d; const R = RX(); d.upMeal = [];
  d.upravy = (d.upravy || []).filter(u => { const m = /^ubrat_k_(\w+)/.exec(u.typ || ''); const s = m && UP_SLOT[m[1]]; const r = s && R[d.jidla[s]];
    if (r && u.surovina && r.suroviny.some(i => i.surovina === u.surovina)) { d.upMeal.push({ slot: s, surovina: u.surovina, g: u.g, typ: 'vyrovnání', u: 1 }); return false; } return true; });
  return d;
};
const _17sm = stepMods;
stepMods = function (step, day) { const o = _17sm(step, day); if (_UPM && day.upMeal) day.upMeal.forEach(m => o[m.slot] = [...o[m.slot], m]); return o; };
dayTotals = function (day, step) { const t = { ...day.soucet_dne }; Object.values(_17sm(step, day)).flat().forEach(m => addN(t, nutOf(m.surovina, m.g))); return t; };
const withUP = f => function (...a) { _UPM++; try { return f.apply(this, a); } finally { _UPM--; } };
// na Dnes místo „-30 g těstovin“ rovnou výsledná gramáž
const _17fden = XV['f-den'];
XV['f-den'] = withUP(function () {
  let h = _17fden(); const k = view.d || today(); const c = cyc(k); if (!c || c.before) return h; const day = planDayF(c.w, c.di, k); const R = RX();
  (day.upMeal || []).forEach(m => { const r = R[day.jidla[m.slot]]; const base = r.suroviny.find(i => i.surovina === m.surovina); const nm = SUR(m.surovina).nazev.split(' (')[0].toLowerCase();
    h = h.replace(`${m.g} g ${nm}`, `${nm} ${base.g + m.g} g`); });
  return h;
});
XV['f-tyden'] = withUP(XV['f-tyden']);
// v receptu: upravená gramáž přímo u suroviny + proč
const _17fmeal = A['f-meal'];
A['f-meal'] = withUP(function (b) {
  _17fmeal(b);
  $$s('#sheet .fing .add').forEach(row => {
    const name = row.querySelector('span').firstChild.textContent.trim(); const g = parseFloat(row.querySelector('b').textContent.replace('+', ''));
    const why = row.querySelector('small').textContent.includes('vyrovnání') ? 'ubráno kvůli ořechům navíc ten den' : row.querySelector('small').textContent.replace(/^(navíc|méně) – /, '');
    const ing = $$s('#sheet .fing > div:not(.add)').find(d => d.querySelector('span').firstChild.textContent.trim() === name); if (!ing) return;
    const bb = ing.querySelector('b'); const was = parseFloat(bb.textContent); if (isNaN(was)) return;
    bb.innerHTML = `${was + g} g<small>${was} ${g > 0 ? '+' : '−'} ${Math.abs(g)}</small>`; ing.classList.add('chg');
    const sp = ing.querySelector('span'); sp.insertAdjacentHTML('beforeend', `<small>${esc(why)}</small>`); row.remove();
  });
});
function $$s(q) { return [...document.querySelectorAll(q)]; }
