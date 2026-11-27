// ===================== v2.41: statistiky jen to, podle čeho se dá jednat · „Když nemáš“ u surovin · výživa cyklu v Týdnu =====================

// ---------- STATISTIKY: pryč push/pull, antagonisti, objem, čas v gymu, 1RM; partie jako série za týden ----------
// plán sestavil trenér, poměry partií jsou dané plánem → grafy poměrů nedávají zpětnou vazbu, podle které by šlo něco změnit
const _55prog = vProg;
vProg = function () {
  let h = _55prog(); const tab = view.tab || 'p';
  if (tab === 'c') return h.replace(/<button class="li stcalc"[\s\S]*?<\/button>/, '');
  // obecné metriky: nechat tréninky, pracovní série, rekordy, průměrnou délku
  h = h.replace(/<div><span>Čas v gymu<\/span>[\s\S]*?<\/div>(?=<div><span>Průměrný trénink)/, '')
       .replace(/<div><span>Objem<\/span>[\s\S]*?<\/div>(?=<div><span>Rekordy)/, '');
  // radar: série za týden (průměr období), bez rady „přidej série“ (plán dělá trenér)
  h = h.replace('<b>Zasažené partie</b><small>pracovní série</small>', '<b>Partie</b><small>pracovní série za týden, průměr</small>')
       .replace(/<p class="stwarn">[^<]*<svg[\s\S]*?<\/svg>Nejméně sérií má[\s\S]*?<\/p>/, '');
  // push/pull a antagonisté pryč
  const i = h.indexOf('<div class="sthd" style="margin-top:22px"><b>Poměr push / pull</b>'); const j = h.lastIndexOf('</div>' + tabs());
  if (i > 0 && j > i) h = h.slice(0, i) + h.slice(j);
  return h;
};
const _55radar = radarSVG;
radarSVG = function (G) {
  const R = periodRange(); const wk = Math.max(1, R.len / 7); const W = {}; Object.entries(G).forEach(([k, v]) => { W[k] = Math.round(v / wk * 10) / 10; });
  return _55radar(W).replace(/>([\d.]+) sérií</g, (m, v) => `>${nf(+v, 1)} / týden<`);
};

// ---------- JÍDLO: „Když nemáš“ v rozbalení ⓘ (bez dalších tlačítek) ----------
// v plánu může být suroviny[x].nahrady = ["kur_prsa", …]; jinak výchozí tabulka
const SWAP = {
  hov_zadni: ['hov_mlete5', 'krut_prsa'], hov_klizka: ['hov_zadni'], hov_mlete5: ['krut_mlete', 'hov_zadni'],
  kur_prsa: ['krut_prsa', 'kur_stehna'], kur_stehna: ['kur_prsa'], krut_prsa: ['kur_prsa'], krut_mlete: ['hov_mlete5'],
  losos: ['sardinky'], sardinky: ['losos', 'tunak'], tunak: ['kur_prsa', 'krevety'], krevety: ['tunak', 'kur_prsa'],
  recky_jogurt_0: ['cottage'], cottage: ['recky_jogurt_0'], jogurt_bily_3: ['kefir', 'recky_jogurt_0'], kefir: ['jogurt_bily_3'],
  feta: ['parmazan'], parmazan: ['feta'], whey: ['recky_jogurt_0'],
  basmati: ['sushi_ryze', 'testoviny', 'bulgur'], sushi_ryze: ['basmati'], arborio: ['basmati'], ryzove_nudle: ['basmati', 'testoviny'],
  testoviny: ['testoviny_cz', 'basmati'], testoviny_cz: ['testoviny', 'bulgur'], bulgur: ['basmati', 'testoviny_cz'], gnocchi: ['basmati', 'testoviny'],
  tortilla_cz: ['chleb_zitny'], chleb_zitny: ['tortilla_cz'],
  cizrna: ['fazole_cerne', 'edamame'], fazole_cerne: ['cizrna'], edamame: ['hrasek', 'cizrna'], hrasek: ['edamame'],
  klicky_mungo: ['brokolice', 'paprika', 'spenat'], brokolice: ['spenat', 'paprika'], spenat: ['brokolice'], paprika: ['rajcata', 'brokolice'],
  cuketa: ['paprika', 'zampiony'], zampiony: ['cuketa'], mrkev: ['paprika'], rajcata: ['paprika'], salat: ['okurka', 'spenat'], okurka: ['salat'],
  celer: ['petrzel_koren', 'mrkev'], petrzel_koren: ['celer', 'mrkev'], cibule: ['cibule_jarni'], cibule_jarni: ['cibule'],
  vlasske: ['mandle', 'dynova_seminka'], mandle: ['vlasske'], dynova_seminka: ['vlasske', 'mandle'], sezam: ['dynova_seminka'], avokado: ['olej_olivovy'],
  passata: ['rajcata_kons'], rajcata_kons: ['passata'], vyvar_hovezi: ['vyvar_bez_soli'], limetka: ['citron'], citron: ['limetka'], med: ['cukr'],
  sojova_omacka: ['rybi_omacka'], rybi_omacka: ['sojova_omacka'],
};
// gramy náhrady: bílkovinová surovina → stejně bílkovin, přílohy → stejně sacharidů, tuky → stejně kcal, zelenina a ostatní → stejně gramů
function swapG(from, to, g) {
  const a = SUR(from).na_100g || {}, b = SUR(to).na_100g || {}; const kat = SUR(from).kategorie_nakupu;
  let k = 'g';
  if (kat === 'Maso a ryby' || (a.bilkoviny_g || 0) >= 12 && (a.bilkoviny_g || 0) >= (a.sacharidy_g || 0)) k = 'bilkoviny_g';
  else if ((a.sacharidy_g || 0) >= 40) k = 'sacharidy_g';
  else if ((a.tuky_g || 0) >= 40) k = 'kcal';
  if (k === 'g' || !a[k] || !b[k]) return g;
  return Math.round(g * a[k] / b[k] / 5) * 5;
}
function swapHTML(i) {
  const L = (SUR(i.surovina).nahrady || SWAP[i.surovina] || []).filter(x => JD.suroviny[x]); if (!L.length || !i.g) return '';
  return `<div class="fsw2"><p class="t">Když nemáš</p>${L.slice(0, 3).map(x => `<p class="r"><span>${esc(SUR(x).nazev.split(' (')[0])}</span><span class="g">${swapG(i.surovina, x, i.g)} g</span></p>`).join('')}</div>`;
}
const _55why = whyTxt;
whyTxt = function (i) { return _55why(i) + swapHTML(i); };

// ---------- JÍDLO / Týden: výživa cyklu (mikroživiny z plánu) ----------
function microRows() {
  const t = (PN().texty || {}).mikrozivy || ''; const rows = [];
  t.split('\n').forEach(l => { const c = l.split('|').map(x => x.trim()); if (c.length < 5 || /^-+$/.test(c[1]) || c[1] === 'Živina') return; rows.push({ n: c[1], v: c[2].replace(/\*\*/g, ''), h: c[3].replace(/\*\*/g, '') }); });
  return rows.map(r => { const h = r.h.toLowerCase(); const st = /mezera|chybí|nízk|pod (ai|pri|doporu)/.test(h) ? 'lo' : /(mírně )?nad (2|ai|pri|doporu|\d)/.test(h) && !/pod ul/.test(h) ? 'hi' : 'ok'; return { ...r, st }; });
}
function microHTML() {
  const R = microRows(); if (!R.length) return '';
  const lo = R.filter(r => r.st === 'lo'), hi = R.filter(r => r.st === 'hi');
  return `<div class="fmic"><div class="lbl" style="margin:26px 2px 6px">Výživa cyklu · vitaminy a minerály</div>
    <p class="fmic-s">${lo.length ? `Chybí: <b class="lo">${lo.map(r => esc(r.n)).join(', ')}</b>` : 'Nic nechybí'}${hi.length ? ` · Víc: <b class="hi">${hi.map(r => esc(r.n)).join(', ')}</b>` : ''}</p>
    ${R.map(r => `<div class="mic5 ${r.st}"><i class="d"></i><div class="n"><p class="t">${esc(r.n)}</p><p class="h">${esc(r.h)}</p></div><p class="v">${esc(r.v)}</p></div>`).join('')}
    <p class="mut" style="font-size:12px;margin:10px 2px 0">Odhad z plánu za celý 2týdenní cyklus, ne měření. O doplňcích rozhodnou krevní testy.</p></div>`;
}
const _55tyd = XV['f-tyden'];
XV['f-tyden'] = function () { const h = _55tyd(); const m = microHTML(); if (!m) return h; const i = h.lastIndexOf('</div>' + tabs()); return i < 0 ? h : h.slice(0, i) + m + h.slice(i); };
