// ===================== v2.44: nový detail jídla (podle návrhu): suroviny s porcemi, zelenina konkrétně + zbytek, sbalené Dochucení / Úpravy / Postup =====================
let rcp = null; // { id, k, s, n, open:{} }
const rName = s => SUR(s).nazev.split(' (')[0].replace(/,\s*syrov[éá]$/, '');
function rcpData(r, k, s) {
  const c = k && cyc(k); const day = c && !c.before ? planDayF(c.w, c.di, k) : null; const mods = day && s ? stepMods(F().step, day)[s] || [] : [];
  const tot = { ...r.hodnoty_porce }; mods.forEach(m => addN(tot, nutOf(m.surovina, m.g)));
  const L = ingSorted(r).map(x => ({ ...x, g0: x.i.g || 0, gf: x.i.g || 0 }));
  const add = [];
  mods.forEach(m => { const x = L.find(y => y.i.surovina === m.surovina); if (x) { x.gf += m.g; x.mod = (x.mod || 0) + m.g; } else { const a = add.find(y => y.i.surovina === m.surovina); if (a) { a.gf += m.g; a.mod += m.g; } else add.push({ i: { surovina: m.surovina, nazev: SUR(m.surovina).nazev, g: 0 }, n: 'm' + m.surovina, g: m.surovina === 'vlasske' ? 2 : 2, g0: 0, gf: m.g, mod: m.g }); } });
  return { tot, mods, L, add };
}
const qty = (i, g, n) => { const u = unitOf(i); if (i.surovina === 'vejce') { const ks = Math.max(1, Math.round(eggKs({ ...i, g }) * n)); return `${ks} ks`; } return `${Math.round(g * n)} ${u}`; };
function rowHTML(x, n, key) {
  const i = x.i; const pz = (i.poznamka || '').replace(/^\s*\d+\s*→\s*\d+\s*:?\s*/, '').replace(/^\d+\s*ks\s*/, '').trim();
  const sub = [pz && pz !== 'ml' ? pz : '', i.vareny_g ? `≈ ${Math.round(i.vareny_g * n)} g hotového` : ''].filter(Boolean).join(' · ');
  const fr = i.skupina === 'ovoce' && JD.nahrady_ovoce; const pov = i.povinne === true;
  return `<div class="rr" data-ck="${key}"><i class="cbx"></i><div class="rn"><p><span class="nm">${esc(rName(i.surovina))}</span><button class="rinf" data-a="r-why" data-v="${key}" aria-label="Proč a čím nahradit">i</button>${pov ? '<em class="rpov">povinná</em>' : ''}</p>${sub ? `<small>${esc(sub)}</small>` : ''}</div><b>${qty(i, x.gf, n)}</b></div>
    <div class="rwhy" id="rw-${key}" hidden>${whyTxt({ ...i, g: Math.round(x.gf * n) })}${fr && (fr.polozky || []).length ? `<div class="fsw2"><p class="t">Jiné ovoce${fr.princip ? '' : ''}</p>${fr.polozky.map(p => `<p class="r"><span>${esc(p.nazev)}</span><span class="g">${Math.round(p.g * (x.gf || 100) / 100 * n / 5) * 5} g</span></p>`).join('')}</div>` : ''}</div>`;
}
function rcpHTML() {
  const r = RX()[rcp.id]; if (!r) return ''; const { tot, mods, L, add } = rcpData(r, rcp.k, rcp.s); const n = rcp.n;
  const R = (r.slot || '') + ' · ' + r.kod; const big = r.varka === true ? 4 : Math.min(4, 1 + nextSame(r.kod, rcp.k, 4).length);
  const main = [...L.filter(x => x.g < 3), ...add], veg = L.filter(x => x.g === 4 && !isVolna(x.i)), cond = L.filter(x => x.g === 3);
  const zv = volnaG(r) || L.filter(x => isVolna(x.i)).reduce((a, x) => a + x.gf, 0);
  const sorted = [...main.filter(x => x.g < 2), ...main.filter(x => x.g >= 2 && x.i.skupina !== 'ovoce'), ...main.filter(x => x.i.skupina === 'ovoce')];
  const vegP = veg.filter(x => x.i.povinne), vegO = veg.filter(x => !x.i.povinne);
  const rows = [...sorted, ...vegO, ...vegP].filter(x => x.gf > 0 || !x.g0).map(x => rowHTML(x, n, String(x.n))).join('')
    + (zv > 0 ? `<div class="rr rzv" data-ck="zv"><i class="cbx"></i><div class="rn"><p><span class="nm">${vegP.length || vegO.length ? '+ zelenina podle chuti' : 'Zelenina podle chuti'}</span><button class="rinf" data-a="r-why" data-v="zv" aria-label="Jaká zelenina">i</button></p></div><b>cca ${Math.round(zv * n / 50) * 50 || Math.round(zv * n)} g</b></div><div class="rwhy" id="rw-zv" hidden>${vegList(r) || 'Jakákoli zelenina.'}</div>` : '');
  const modS = {}; mods.forEach(m => { modS[m.surovina] = (modS[m.surovina] || 0) + m.g; });
  const modTxt = Object.entries(modS).filter(([, g]) => g).map(([s, g]) => { const b = (r.suroviny.find(i => i.surovina === s) || {}).g || 0; return `${rName(s)} ${b ? `${Math.round(b * n)} → ${Math.round((b + g) * n)}` : `+${Math.round(g * n)}`} ${unitOf({ surovina: s })}`; });
  const coll = (id, t, sum, body) => `<div class="rc ${rcp.open[id] ? 'on' : ''}"><button class="rch" data-a="r-tog" data-v="${id}"><span><b>${t}</b>${sum ? `<small>${sum}</small>` : ''}</span>${ico('chev')}</button>${rcp.open[id] ? `<div class="rcb">${body}</div>` : ''}</div>`;
  const nx = rcp.k ? nextSame(r.kod, rcp.k, 10) : []; const Ld = r.lednice_dni, Md = r.mrazak_dni;
  const where = x => { if (x.box) return ' z krabičky'; if (typeof Ld !== 'number') return ''; const d = daysBetween(rcp.k, x.dk); return d <= Ld ? ' · z lednice' : Md > 0 ? ' · z mrazáku' : ' · uvařit čerstvě'; };
  const keep = typeof Ld === 'number' ? (Ld === 0 ? 'Jen čerstvě.' : `Lednice ${Ld} ${Ld === 1 ? 'den' : Ld < 5 ? 'dny' : 'dní'}${Md > 0 ? `, mrazák ${Md} dní` : ', nemrazit'}.`) : '';
  return `<div class="rcp">
    <p class="rmeta">${esc(R)}${r.varka === true ? ' · várka' : r.varka === false ? ' · čerstvě' : ''}</p>
    <h2 class="rt">${esc(r.nazev)}</h2>
    <p class="rk"><b>${thou(r0(tot.kcal * n))} kcal</b> ${n === 1 ? 'na porci' : `na ${n} porce`}</p>
    <div class="rmac"><span>B ${r0(tot.bilkoviny_g * n)} g</span><span>S ${r0(tot.sacharidy_g * n)} g</span><span>T ${r0(tot.tuky_g * n)} g</span><span>Vláknina ${r0(tot.vlaknina_g * n)} g</span></div>
    <div class="rsh"><h3>Suroviny</h3>${big > 1 ? `<div class="rseg"><button class="${n === 1 ? 'on' : ''}" data-a="r-n" data-v="1">1 porce</button><button class="${n > 1 ? 'on' : ''}" data-a="r-n" data-v="${big}">${r.varka === true ? 'Celá várka · ' : ''}${big} porce</button></div>` : ''}</div>
    <div class="rrs">${rows}</div>
    <div class="rcs">
      ${cond.length ? coll('d', 'Dochucení', cond.map(x => `${rName(x.i.surovina)} ${qty(x.i, x.gf, n)}`).join(' · ') + ' · koření podle chuti', cond.filter(x => x.gf > 0).map(x => rowHTML(x, n, String(x.n))).join('') + '<p class="rnote">Koření (skořice, paprika, oregano…) podle chuti. Dochucení jde vynechat.</p>') : ''}
      ${modTxt.length ? coll('u', 'Úpravy porce', modTxt.join(' · '), `<p class="rnote">Gramy v surovinách už jsou upravené na tvůj krok ${sgn(F().step)}.</p>${modTxt.map(t => `<p class="rli">${esc(t)}</p>`).join('')}`) : ''}
      ${coll('p', 'Postup přípravy', '', `<p class="rtx">${esc(r.priprava || '')}</p>${r.skladovani ? `<p class="rnote" style="margin-top:12px"><b>Skladování.</b> ${esc(r.skladovani)}</p>` : ''}${r.poznamka ? `<p class="rnote"><b>Poznámka.</b> ${esc(r.poznamka)}</p>` : ''}`)}
    </div>
    ${nx.length ? `<div class="rnext"><p class="rmeta">Další porce v plánu</p>${nx.slice(0, 3).map(x => `<p class="rnx">${fday(x.dk).replace(/^./, c => c.toUpperCase())} · ${x.l.toLowerCase()}${where(x)}</p>`).join('')}${keep ? `<p class="rnote">${keep}</p>` : ''}</div>` : keep ? `<div class="rnext"><p class="rnote">${keep}</p></div>` : ''}
    <div class="actions">${rcp.k && rcp.s ? `<button class="btn" data-a="f-swap" data-k="${rcp.k}" data-s="${rcp.s}">Vyměnit jídlo</button>` : ''}<button class="btn white" data-a="close">Zavřít</button></div></div>`;
}
function rcpDraw(keepScroll) { const sc = keepScroll && $('#sheet .pn') ? $('#sheet .pn').scrollTop : 0; sheet(rcpHTML()); fmCtx = { k: rcp.k, s: rcp.s, id: rcp.id, n: rcp.n }; rcpCk(); if (sc) $('#sheet .pn').scrollTop = sc; }
const rKey = () => `${rcp.k}|${rcp.s}|${rcp.id}`;
function rcpCk() { const on = new Set((ckStore()[rKey()] || [])); $$('#sheet .rr').forEach(d => d.classList.toggle('on', on.has(d.dataset.ck))); }
A['f-meal'] = b => { const r = RX()[b.dataset.id]; if (!r) return; rcp = { id: r.kod, k: b.dataset.k || today(), s: b.dataset.s || '', n: 1, open: {} }; rcpDraw(); };
A['r-n'] = b => { rcp.n = +b.dataset.v; rcpDraw(true); };
A['r-tog'] = b => { rcp.open[b.dataset.v] = !rcp.open[b.dataset.v]; rcpDraw(true); };
A['r-why'] = b => { const el = document.getElementById('rw-' + b.dataset.v); if (el) { el.hidden = !el.hidden; b.classList.toggle('on', !el.hidden); } };
document.addEventListener('click', ev => {
  const d = ev.target.closest('#sheet .rr'); if (!d || ev.target.closest('button') || !rcp) return;
  const st = ckStore(); const L = new Set(st[rKey()] || []); L.has(d.dataset.ck) ? L.delete(d.dataset.ck) : L.add(d.dataset.ck); st[rKey()] = [...L]; save(); rcpCk();
});
