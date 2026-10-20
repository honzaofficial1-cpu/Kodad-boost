
// ===================== v2.12: WHOOP – recovery, spánek, strain, tréninky =====================
const WHOOP_URL = '__WHOOP_URL__';
const W = () => (S.whoop = S.whoop || { days: {}, wo: {}, last: null, dis: {} });
const whoopOn = () => !!(S.settings.whoopKey && WHOOP_URL.startsWith('https://'));
let whoopBusy = false;
async function whoopSync(force) {
  if (!whoopOn() || whoopBusy) return; const w = W();
  if (!force && w.last && Date.now() - Date.parse(w.last) < 20 * 60000) return;
  whoopBusy = true;
  try {
    const since = w.last ? new Date(Date.parse(w.last) - 3 * 864e5).toISOString() : new Date(Date.now() - 45 * 864e5).toISOString();
    const r = await fetch(`${WHOOP_URL}/data?since=${encodeURIComponent(since)}`, { headers: { Authorization: 'Bearer ' + S.settings.whoopKey } });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) { S.settings.whoopErr = 'Spojení vypršelo – propoj WHOOP znovu.'; save(true); return; }
    if (!r.ok) { S.settings.whoopErr = j.error && j.error.includes('not_connected') ? 'WHOOP není propojený.' : 'WHOOP se teď nepodařilo načíst.'; save(true); return; }
    whoopMerge(j); w.last = j.at || new Date().toISOString(); delete S.settings.whoopErr; save(true);
    if (['home', 'acts', 'summary', 'settings'].includes(view.n) && $('#sheet').hidden) render();
  } catch (e) { S.settings.whoopErr = 'Bez internetu – WHOOP se načte příště.'; save(); }
  finally { whoopBusy = false; }
}
function whoopMerge(j) {
  const w = W(); const day = k => (w.days[k] = w.days[k] || {});
  const sl = {}; (j.sleep || []).forEach(s => { sl[s.id] = s; if (s.nap || !s.score || s.score_state === 'UNSCORABLE') return; const k = dkey(new Date(s.end)); const st = s.score.stage_summary || {};
    const h = ((st.total_in_bed_time_milli || 0) - (st.total_awake_time_milli || 0)) / 3.6e6; Object.assign(day(k), { sleepH: Math.round(h * 10) / 10, sleepPerf: s.score.sleep_performance_percentage ?? null }); });
  (j.recovery || []).forEach(r => { if (!r.score) return; const s = sl[r.sleep_id]; const k = dkey(new Date(s ? s.end : r.created_at));
    Object.assign(day(k), { rec: Math.round(r.score.recovery_score), hrv: Math.round(r.score.hrv_rmssd_milli), rhr: Math.round(r.score.resting_heart_rate) }); });
  (j.cycle || []).forEach(c => { const k = dkey(new Date(c.start)); const d = day(k); if (c.score) { d.strain = Math.round(c.score.strain * 10) / 10; d.kcal = Math.round((c.score.kilojoule || 0) / 4.184); } if (c.step_count != null) d.steps = c.step_count; });
  (j.workout || []).forEach(x => { const sc = x.score || {}; w.wo[x.id] = { id: x.id, sport: x.sport_name || '', start: Date.parse(x.start), end: Date.parse(x.end), strain: sc.strain != null ? Math.round(sc.strain * 10) / 10 : null, hr: sc.average_heart_rate ?? null, hrMax: sc.max_heart_rate ?? null, kcal: sc.kilojoule ? Math.round(sc.kilojoule / 4.184) : null, km: sc.distance_meter ? Math.round(sc.distance_meter / 10) / 100 : null, elev: sc.altitude_gain_meter ? Math.round(sc.altitude_gain_meter) : null }; });
}
// přihlášení se vrací s ?whoop=klíč
(function () {
  const q = new URLSearchParams(location.search); const k = q.get('whoop');
  if (k) { S.settings.whoopKey = k; delete S.settings.whoopErr; save(true); history.replaceState(null, '', location.pathname); setTimeout(() => { toast('WHOOP propojený'); whoopSync(true); }, 400); }
})();
setTimeout(() => whoopSync(), 1500);
document.addEventListener('visibilitychange', () => { if (!document.hidden) whoopSync(); });

const wDay = k => (S.whoop && S.whoop.days[k]) || null;
const fh = h => h == null ? '–' : `${Math.floor(h)} h ${pad(Math.round((h % 1) * 60))}`;
// trénink z WHOOPu, který se kryje s tréninkem v gymu
function woFor(s) {
  if (!S.whoop || !s || !s.end) return null; let best = null, bo = 0;
  Object.values(S.whoop.wo).forEach(x => { const o = Math.min(x.end, s.end) - Math.max(x.start, s.start); if (o > bo) { bo = o; best = x; } });
  return best && bo > 10 * 60000 ? best : null;
}

// ---------- domů: řádek s regenerací ----------
const _12vHome = vHome;
vHome = function () {
  let h = _12vHome(); if (!whoopOn()) return h;
  const d = wDay(today()) || {}; const y = wDay(dkey(addDays(new Date(), -1))) || {};
  const row = `<button class="hcard wrow" data-a="tab" data-v="settings"><span class="hic">${ico('bolt')}</span><b>WHOOP</b>
    <span class="wv">${d.rec != null ? `<i>${d.rec}<small> %</small></i><em>recovery</em>` : '<em>recovery zatím není</em>'}</span>
    <span class="wv">${d.sleepH != null ? `<i>${fh(d.sleepH).replace(' h ', ':')}</i><em>spánek</em>` : ''}</span>
    <span class="wv">${y.strain != null ? `<i>${kg(y.strain)}</i><em>strain včera</em>` : ''}</span></button>`;
  return h.replace('<div class="hgrid">', '<div class="hgrid">' + row);
};
// ---------- denní záznam: spánek a kroky z WHOOPu ----------
const _12mDen = mDen;
mDen = function () {
  let h = _12mDen(); if (!whoopOn()) return h;
  const k = view.d || today(), d = BD().days[k] || {}, w = wDay(k) || {}, wy = wDay(dkey(addDays(pdate(k), -1))) || {};
  if (d.sleep == null && w.sleepH != null) h = h.replace('id="b-sleep" inputmode="decimal" value=""', `id="b-sleep" inputmode="decimal" value="${kg(w.sleepH)}"`);
  if (d.steps == null && wy.steps != null) h = h.replace('id="b-steps" inputmode="numeric" value=""', `id="b-steps" inputmode="numeric" value="${wy.steps}"`);
  const bits = [w.rec != null ? `recovery ${w.rec} %` : '', w.hrv != null ? `HRV ${w.hrv} ms` : '', w.rhr != null ? `klidový tep ${w.rhr}` : '', w.sleepPerf != null ? `spánek ${w.sleepPerf} % potřeby` : ''].filter(Boolean);
  if (bits.length) h = h.replace('<div class="dsec"><div class="dsh"><b>', `<p class="whint">WHOOP: ${bits.join(' · ')}</p><div class="dsec"><div class="dsh"><b>`);
  return h;
};
// ---------- shrnutí tréninku: strain a tep ----------
const _12vSummary = vSummary;
vSummary = function () {
  let h = _12vSummary(); const s = sesById(view.id); const x = woFor(s); if (!x) return h;
  const line = [x.strain != null ? `Strain ${kg(x.strain)}` : '', x.hr ? `Ø tep ${x.hr}` : '', x.hrMax ? `max ${x.hrMax}` : '', x.kcal ? `${x.kcal} kcal` : ''].filter(Boolean).join(' · ');
  return h.replace('<div class="stat3 sx"', `<div class="wline"><span class="lbl">WHOOP</span><b>${line}</b></div><div class="stat3 sx"`);
};
// ---------- aktivity: tréninky z WHOOPu k přidání ----------
const WSPORT = [[/run/i, 'run'], [/cycl|bik|spin/i, 'bike'], [/row/i, 'row'], [/ski.?erg/i, 'skierg'], [/ski/i, 'xcski'], [/stair/i, 'stairs'], [/swim/i, 'swim'], [/climb|boulder/i, 'climb'], [/muay|box|kick|martial/i, 'thai'], [/yoga/i, 'yoga'], [/stretch|mobility/i, 'stretch'], [/sauna/i, 'sauna'], [/ice|cold|plunge/i, 'cold'], [/hyrox/i, 'hyrox']];
const GYMLIKE = /weight|strength|functional|powerlift|bodybuild|gym/i;
function woPending() {
  if (!S.whoop) return []; const w = W(); const lim = Date.now() - 14 * 864e5;
  const used = new Set(S.activities.map(a => a.whoopId).filter(Boolean));
  return Object.values(w.wo).filter(x => x.start > lim && !used.has(x.id) && !w.dis[x.id] && !GYMLIKE.test(x.sport) && !finished().some(s => woFor(s) === x)).sort((a, b) => b.start - a.start);
}
const _12vActs = vActs;
vActs = function () {
  const h = _12vActs(); if (!whoopOn()) return h; const P = woPending(); if (!P.length) return h;
  const rows = P.slice(0, 6).map(x => { const t = (WSPORT.find(([r]) => r.test(x.sport)) || [0, 'other'])[1]; const nm = t === 'other' ? x.sport : (ACT_TYPES[t]?.name || x.sport);
    return `<div class="li wpend"><span class="ic ${ACT_TYPES[t]?.cls || 'act'}" data-t="${t}">${ico(ACT_TYPES[t]?.icon || 'plus')}</span><div class="t"><b>${esc(nm)}</b><small>${fday(dkey(new Date(x.start)))} · ${Math.round((x.end - x.start) / 60000)} min${x.km ? ` · ${kg(x.km)} km` : ''}${x.strain != null ? ` · strain ${kg(x.strain)}` : ''}</small></div>
      <button class="btn white" style="padding:9px 14px" data-a="wo-add" data-id="${x.id}">Přidat</button><button class="round" style="width:36px;height:36px" data-a="wo-dis" data-id="${x.id}" aria-label="Skrýt">${ico('x')}</button></div>`; }).join('');
  return h.replace('<section class="sec">', `<section class="sec"><div class="sec-h"><h2>Z WHOOPu</h2></div><div class="list">${rows}</div></section><section class="sec">`);
};
A['wo-add'] = b => {
  const x = W().wo[b.dataset.id]; if (!x) return; const t = (WSPORT.find(([r]) => r.test(x.sport)) || [0, 'other'])[1];
  const a = { id: uid(), type: t, date: dkey(new Date(x.start)), ts: Date.now(), whoopId: x.id, min: Math.round((x.end - x.start) / 60000), bpm: x.hr || null, strain: x.strain, note: '' };
  if (t === 'other') a.label = x.sport; if (x.km && ['run', 'bike', 'xcski', 'swim'].includes(t)) { a.km = x.km; a.sec = Math.round((x.end - x.start) / 1000); }
  if (t === 'bike') a.kind = x.km ? 'Kolo venku' : 'Rotoped'; if (x.elev) a.elev = x.elev;
  if (['row', 'skierg'].includes(t)) { a.sec = Math.round((x.end - x.start) / 1000); if (x.km) a.m = Math.round(x.km * 1000); }
  S.activities.push(a); save(true); render(); toast('Přidáno – doplň detaily klepnutím'); setTimeout(checkBadges, 600);
};
A['wo-dis'] = b => { W().dis[b.dataset.id] = 1; save(true); render(); };
const _12actDesc = actDesc;
actDesc = a => { const d = _12actDesc(a); return a.strain != null ? `${d}${d ? ' · ' : ''}strain ${kg(a.strain)}` : d; };

// ---------- nastavení ----------
const _12vSettings = vSettings;
vSettings = function () {
  const h = _12vSettings(); const w = S.whoop; const on = whoopOn();
  const card = `<div class="lbl" style="margin:26px 6px 10px">WHOOP</div><div class="card wcard">
    ${!WHOOP_URL.startsWith('https://') ? '<p class="mut" style="margin:0">Propojení se připravuje.</p>' : on ? `<p style="margin:0">Propojeno.${w && w.last ? ` Naposledy načteno ${new Date(w.last).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}.` : ''}</p>
      ${S.settings.whoopErr ? `<p class="mut" style="margin:6px 0 0;color:var(--down)">${esc(S.settings.whoopErr)}</p>` : ''}
      <div class="two" style="margin-top:14px"><button class="btn white" data-a="wo-sync">Načíst teď</button><button class="btn" data-a="wo-off">Odpojit</button></div>`
      : `<p class="mut" style="margin:0">Recovery, spánek, kroky a strain se doplní samy. Tréninky z WHOOPu půjdou přidat jedním klepnutím.</p><button class="btn white block" style="margin-top:14px" data-a="wo-login">Propojit WHOOP</button>`}</div>`;
  return h.replace('<div style="margin:40px auto 0;opacity:.5', card + '<div style="margin:40px auto 0;opacity:.5');
};
A['wo-login'] = () => { location.href = WHOOP_URL + '/login'; };
A['wo-sync'] = async () => { toast('Načítám WHOOP…'); await whoopSync(true); render(); if (!S.settings.whoopErr) toast('Hotovo'); };
A['wo-off'] = async () => { try { await fetch(WHOOP_URL + '/disconnect', { headers: { Authorization: 'Bearer ' + S.settings.whoopKey } }); } catch (e) { } delete S.settings.whoopKey; delete S.settings.whoopErr; save(true); render(); toast('WHOOP odpojen'); };
