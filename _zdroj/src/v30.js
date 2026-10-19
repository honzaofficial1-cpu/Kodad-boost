
// ===================== v2.10: trasa z GPX · sdílení s trasou a mapou =====================
const ROUTE_TYPES = ['run', 'bike', 'xcski'];
const R_EARTH = 6371008.8;
const toRad = d => d * Math.PI / 180;
function hav(a, b) { const dLa = toRad(b[0] - a[0]), dLo = toRad(b[1] - a[1]); const h = Math.sin(dLa / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLo / 2) ** 2; return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h))); }
// zjednodušení trasy (Douglas–Peucker v metrech)
function simplify(pts, eps) {
  if (pts.length < 3) return pts.slice(); const lat0 = toRad(pts[0][0]);
  const P = pts.map(p => [toRad(p[1]) * Math.cos(lat0) * R_EARTH, toRad(p[0]) * R_EARTH]);
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1; const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1; const [x1, y1] = P[a], [x2, y2] = P[b]; const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    for (let i = a + 1; i < b; i++) { const d = L < 1 ? Math.hypot(P[i][0] - x1, P[i][1] - y1) : Math.abs(dy * P[i][0] - dx * P[i][1] + x2 * y1 - y2 * x1) / L; if (d > md) { md = d; mi = i; } }
    if (md > eps && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
function parseGPX(txt) {
  const doc = new DOMParser().parseFromString(txt, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Soubor není platné GPX');
  let nodes = [...doc.getElementsByTagName('trkpt')]; if (!nodes.length) nodes = [...doc.getElementsByTagName('rtept')];
  const pts = nodes.map(n => { const t = n.getElementsByTagName('time')[0], e = n.getElementsByTagName('ele')[0]; return { la: +n.getAttribute('lat'), lo: +n.getAttribute('lon'), t: t ? Date.parse(t.textContent) : null, e: e ? +e.textContent : null }; }).filter(p => isFinite(p.la) && isFinite(p.lo));
  if (pts.length < 2) throw new Error('V souboru není žádná trasa');
  let dist = 0, moving = 0, gain = 0, lastE = pts[0].e;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i]; const d = hav([a.la, a.lo], [b.la, b.lo]); dist += d;
    if (a.t != null && b.t != null) { const dt = (b.t - a.t) / 1000; if (dt > 0 && dt <= 60 && d / dt > .5) moving += dt; }
    if (b.e != null && lastE != null) { const de = b.e - lastE; if (Math.abs(de) >= 2) { if (de > 0) gain += de; lastE = b.e; } } else if (b.e != null) lastE = b.e;
  }
  const t0 = pts.find(p => p.t != null)?.t, t1 = [...pts].reverse().find(p => p.t != null)?.t;
  const elapsed = t0 && t1 ? Math.round((t1 - t0) / 1000) : null;
  const sec = moving > 60 ? Math.round(moving) : elapsed;
  let route = simplify(pts.map(p => [p.la, p.lo]), 6); if (route.length > 700) route = simplify(route, 15);
  route = route.map(([a, b]) => [Math.round(a * 1e5) / 1e5, Math.round(b * 1e5) / 1e5]);
  const nm = doc.querySelector('trk > name, metadata > name');
  return { km: Math.round(dist / 10) / 100, sec, elev: Math.round(gain), route, start: t0 || null, name: nm ? nm.textContent.trim() : '' };
}
const fdur = s => s == null ? '' : s >= 3600 ? `${Math.floor(s / 3600)} h ${pad(Math.floor(s % 3600 / 60))} min` : `${Math.floor(s / 60)} min ${pad(s % 60)} s`;
const fpace = (sec, km) => { if (!sec || !km) return ''; const p = sec / km; return `${Math.floor(p / 60)}:${pad(Math.round(p % 60) % 60)}`; };
function dayPart(ms) { const h = new Date(ms).getHours(); return h < 5 ? 'Noční' : h < 10 ? 'Ranní' : h < 12 ? 'Dopolední' : h < 14 ? 'Polední' : h < 18 ? 'Odpolední' : h < 22 ? 'Večerní' : 'Noční'; }
const ROUTE_NOUN = { run: 'běh', bike: 'jízda', xcski: 'běžky' };

// formulář: nahrání GPX
let GPXD = null;
const _10actSheet = actSheet;
actSheet = function (type, k, id) {
  GPXD = null; _10actSheet(type, k, id);
  const a = id ? S.activities.find(x => x.id === id) : { type, date: k || today() };
  if (!a || !ROUTE_TYPES.includes(a.type)) return;
  const host = $('#sheet #a-note')?.closest('label'); if (!host) return;
  host.insertAdjacentHTML('beforebegin', `<div class="gpxbox"><label class="btn block gpxbtn">${ico('plus')} ${a.route ? 'Nahrát jinou trasu (GPX)' : 'Nahrát trasu (GPX)'}<input type="file" id="a-gpx" hidden></label>
    <div id="gpx-info" class="mut">${a.route ? `Trasa uložená · ${kg(a.km)} km${a.sec ? ' · ' + fdur(a.sec) : ''}${a.elev ? ' · ↑ ' + a.elev + ' m' : ''}` : 'Ze Stravy: na webu u aktivity ••• → Exportovat GPX. Vyplní vzdálenost, čas i mapu.'}</div>${a.route ? routeSVG(a.route, 'gpxprev') : ''}</div>`);
  $('#a-gpx').addEventListener('change', async ev => {
    const f = ev.target.files && ev.target.files[0]; if (!f) return;
    try {
      const g = parseGPX(await f.text()); GPXD = g;
      if ($('#a-km')) $('#a-km').value = kg(g.km);
      if ($('#a-min') && g.sec) $('#a-min').value = Math.round(g.sec / 60);
      if (g.start && $('#a-date')) $('#a-date').value = dkey(new Date(g.start));
      if (a.type === 'bike') { const b = $('[data-a=seg][data-v="Kolo venku"]'); if (b) A.seg(b); if ($('#a-km')) $('#a-km').value = kg(g.km); }
      $('#gpx-info').innerHTML = `<b style="color:var(--fg)">Načteno</b> · ${kg(g.km)} km${g.sec ? ' · ' + fdur(g.sec) : ''}${g.sec && g.km ? ' · ' + fpace(g.sec, g.km) + '/km' : ''}${g.elev ? ' · ↑ ' + g.elev + ' m' : ''}`;
      $('.gpxprev', $('#sheet'))?.remove(); $('#gpx-info').insertAdjacentHTML('afterend', routeSVG(g.route, 'gpxprev'));
    } catch (e) { GPXD = null; $('#gpx-info').textContent = e.message || 'Soubor se nepodařilo přečíst'; }
  });
};
const _10actSave = A['act-save'];
A['act-save'] = b => {
  const g = GPXD, editId = b.dataset.id, before = S.activities.length; GPXD = null;
  _10actSave(b);
  const a = editId ? S.activities.find(x => x.id === editId) : S.activities.length > before ? S.activities[S.activities.length - 1] : null;
  if (!a) return;
  if (g) { a.route = g.route; a.sec = g.sec || null; a.elev = g.elev || null; a.start = g.start; if (!a.km) a.km = g.km; save(true); render(); }
  else if (a.route && a.min && a.sec && Math.abs(a.min - Math.round(a.sec / 60)) > 0) { a.sec = a.min * 60; save(true); }
};
function routeSVG(route, cls = '') {
  if (!route || route.length < 2) return '';
  const lat0 = toRad(route[0][0]); const P = route.map(([la, lo]) => [lo * Math.cos(lat0), -la]);
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = 100 / Math.max(x1 - x0, y1 - y0, 1e-9), ox = (100 - (x1 - x0) * s) / 2, oy = (100 - (y1 - y0) * s) / 2;
  const d = P.map(([x, y], i) => `${i ? 'L' : 'M'}${((x - x0) * s + ox).toFixed(1)},${((y - y0) * s + oy).toFixed(1)}`).join('');
  return `<svg class="rsvg ${cls}" viewBox="-6 -6 112 112" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
}
const _10actRow = actRow;
actRow = a => { const h = _10actRow(a); return a.route ? h.replace(/<\/button>$/, `${routeSVG(a.route, 'rmini')}</button>`) : h; };
const _10actDesc = actDesc;
actDesc = a => { let d = _10actDesc(a); if (a.sec && a.km) d = d.replace(/\d+ min/, fdur(a.sec)) + ` · ${fpace(a.sec, a.km)}/km`; return d; };

// karta: přesný čas, tempo, převýšení, trasa
const _10specActivity = specActivity;
specActivity = a => {
  const sp = _10specActivity(a); if (!ROUTE_TYPES.includes(a.type)) return sp;
  if (a.km && a.sec) {
    const bike = a.type === 'bike';
    sp.stats = [{ id: 'min', label: 'čas', value: fdur(a.sec) }, bike ? { id: 'spd', label: 'km/h', value: kg(Math.round(a.km / (a.sec / 3600) * 10) / 10) } : { id: 'pace', label: 'min/km', value: fpace(a.sec, a.km) }];
    if (a.elev) sp.stats.push({ id: 'elev', label: 'převýšení', value: `${a.elev} m` });
  }
  if (a.route) { sp.route = a.route; sp.rtitle = a.start ? `${dayPart(a.start)} ${ROUTE_NOUN[a.type] || ''}`.trim() : sp.title; sp.rsec = a.sec; sp.rkm = a.km; sp.rtype = a.type; }
  return sp;
};

// ---------- kreslení trasy ----------
function routeXY(route, z) { const n = 512 * 2 ** z; return route.map(([la, lo]) => { const s = Math.sin(toRad(la)); return [(lo + 180) / 360 * n, (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n]; }); }
function strokeRoute(x, P, col, w) {
  x.save(); x.lineJoin = 'round'; x.lineCap = 'round';
  x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = w + 8; x.beginPath(); P.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke();
  x.strokeStyle = col; x.lineWidth = w; x.beginPath(); P.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke();
  const [sx, sy] = P[0], [ex, ey] = P[P.length - 1];
  x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(sx, sy, w * 1.1, 0, 6.29); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(ex, ey, w * 1.1, 0, 6.29); x.fill(); x.strokeStyle = '#FFFFFF'; x.lineWidth = 4; x.stroke();
  x.restore();
}
function fitRoute(route, bw, bh) {
  for (let z = 18; z >= 3; z--) { const P = routeXY(route, z); const xs = P.map(p => p[0]), ys = P.map(p => p[1]); const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys); if (w <= bw && h <= bh) return { z, P, cx: (Math.max(...xs) + Math.min(...xs)) / 2, cy: (Math.max(...ys) + Math.min(...ys)) / 2, w, h }; }
  const P = routeXY(route, 3); return { z: 3, P, cx: P[0][0], cy: P[0][1], w: 0, h: 0 };
}
const TILE_CACHE = new Map();
function loadTile(z, tx, ty) {
  const n = 2 ** z; tx = ((tx % n) + n) % n; if (ty < 0 || ty >= n) return Promise.resolve(null);
  const key = `${z}/${tx}/${ty}`; if (TILE_CACHE.has(key)) return TILE_CACHE.get(key);
  const p = new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; const t = setTimeout(() => res(null), 6000); im.onload = () => { clearTimeout(t); res(im); }; im.onerror = () => { clearTimeout(t); res(null); }; im.src = `https://${'abcd'[(tx + ty) % 4]}.basemaps.cartocdn.com/dark_all/${key}@2x.png`; });
  p.then(im => { if (!im) TILE_CACHE.delete(key); }); TILE_CACHE.set(key, p); return p;
}
async function drawMapBg(x, W, H, fit, ox, oy) {
  // ox,oy = kde na plátně leží střed trasy
  const left = fit.cx - ox, top = fit.cy - oy; const t0x = Math.floor(left / 512), t0y = Math.floor(top / 512), t1x = Math.floor((left + W) / 512), t1y = Math.floor((top + H) / 512);
  const jobs = []; for (let ty = t0y; ty <= t1y; ty++) for (let tx = t0x; tx <= t1x; tx++) jobs.push(loadTile(fit.z, tx, ty).then(im => ({ im, tx, ty })));
  const res = await Promise.all(jobs); let ok = 0;
  x.fillStyle = '#121214'; x.fillRect(0, 0, W, H);
  res.forEach(({ im, tx, ty }) => { if (im) { x.drawImage(im, tx * 512 - left, ty * 512 - top, 512, 512); ok++; } });
  if (!ok) { x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 2; for (let i = 0; i < W; i += 90) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let j = 0; j < H; j += 90) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); } }
  return ok > 0;
}
function routeCols(sp, on) {
  const isOn = id => on[id] !== false; const bike = sp.rtype === 'bike';
  const cols = [{ l: 'Vzdálenost', v: `${kg(sp.rkm)} km` }];
  if (sp.rsec && isOn('pace') && !bike) cols.push({ l: 'Tempo', v: `${fpace(sp.rsec, sp.rkm)}/km` });
  if (sp.rsec && isOn('spd') && bike) cols.push({ l: 'Rychlost', v: `${kg(Math.round(sp.rkm / (sp.rsec / 3600) * 10) / 10)} km/h` });
  if (sp.rsec && isOn('min')) cols.push({ l: 'Čas', v: fdur(sp.rsec) });
  const el = (sp.stats || []).find(s => s.id === 'elev'); if (el && isOn('elev')) cols.push({ l: 'Převýšení', v: el.value });
  return cols;
}
async function drawRouteCard(sp, on) {
  // průhledná: čísla nad sebou + trasa (jako Strava), na vlastní fotku
  const W = 1080, cols = routeCols(sp, on).slice(0, 3), col = sp.col; const top = 70, rowH = 210, rb = 600;
  const H = top + cols.length * rowH + 40 + rb + 150;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 18; x.shadowOffsetY = 2; x.textAlign = 'center';
  cols.forEach((cc, i) => { const y = top + i * rowH; x.fillStyle = '#FFFFFF'; x.font = `600 44px ${CF}`; x.fillText(cc.l, W / 2, y + 50); x.font = `italic 800 124px 'BC', ${CF}`; x.fillText(cc.v, W / 2, y + 168); });
  x.textAlign = 'left'; x.shadowBlur = 0;
  const fit = fitRoute(sp.route, 760, rb - 40); const oy = top + cols.length * rowH + 40 + rb / 2;
  strokeRoute(x, fit.P.map(([a, b]) => [a - fit.cx + W / 2, b - fit.cy + oy]), col, 14);
  const mk = await markTinted('#FFFFFF'); if (mk) { const lh = 64, lw = lh * (mk.naturalWidth || mk.width) / (mk.naturalHeight || mk.height); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 16; x.drawImage(mk, (W - lw) / 2, H - 110, lw, lh); }
  return c;
}
async function drawMapCard(sp, on) {
  const W = 1080, H = 1350, col = sp.col; const cols = routeCols(sp, on).slice(0, 4);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  rr(x, 0, 0, W, H, 48); x.save(); x.clip();
  const fit = fitRoute(sp.route, W - 220, 640); const ox = W / 2, oy = 400;
  const tiles = await drawMapBg(x, W, H, fit, ox, oy);
  strokeRoute(x, fit.P.map(([a, b]) => [a - fit.cx + ox, b - fit.cy + oy]), col, 11);
  // spodní ztmavení kvůli čitelnosti
  x.fillStyle = 'rgba(10,10,12,.0)'; const g = x.createLinearGradient(0, H - 640, 0, H); g.addColorStop(0, 'rgba(10,10,12,0)'); g.addColorStop(.38, 'rgba(10,10,12,.82)'); g.addColorStop(1, 'rgba(10,10,12,.96)'); x.fillStyle = g; x.fillRect(0, H - 640, W, 640);
  const L = 70; let y = H - 470;
  drawPicto(x, sp.picto, L + 34, y, 76, '#FFFFFF');
  const mk = await markTinted('#FFFFFF'); if (mk) { const lh = 46, lw = lh * (mk.naturalWidth || mk.width) / (mk.naturalHeight || mk.height); x.globalAlpha = .9; x.drawImage(mk, W - L - lw, y - lh / 2, lw, lh); x.globalAlpha = 1; }
  y += 108; x.fillStyle = '#FFFFFF'; x.font = `italic 800 76px 'BC', ${CF}`; x.fillText((sp.rtitle || sp.title).toUpperCase(), L, y);
  x.fillStyle = col; slab(x, L, y + 22, 96, 8); x.fill();
  const cw = (W - 2 * L) / 2; y += 104;
  cols.forEach((cc, i) => { const cx = L + (i % 2) * cw, cy = y + Math.floor(i / 2) * 150; x.fillStyle = 'rgba(255,255,255,.75)'; x.font = `600 34px ${CF}`; x.fillText(cc.l, cx, cy); x.fillStyle = '#FFFFFF'; x.font = `italic 800 86px 'BC', ${CF}`; x.fillText(cc.v, cx, cy + 84); });
  x.fillStyle = 'rgba(255,255,255,.45)'; x.font = `500 20px ${CF}`; x.textAlign = 'right'; x.fillText(tiles ? '© OpenStreetMap · © CARTO' : 'mapa se nenačetla – jsi offline?', W - 30, H - 26); x.textAlign = 'left';
  x.restore(); return c;
}
const _10drawShare = drawShare;
drawShare = async function (sp, style, on) {
  try { await document.fonts.load("italic 800 60px 'BC'"); } catch (e) { }
  if ((style === 'trasa' || style === 'mapa') && sp.route) {
    if (on._mono) sp = { ...sp, col: MONO };
    return style === 'trasa' ? drawRouteCard(sp, on) : drawMapCard(sp, on);
  }
  return _10drawShare(sp, style === 'trasa' || style === 'mapa' ? 'noc' : style, on);
};
STYLES.push(['trasa', 'Trasa'], ['mapa', 'Mapa']);
const _10openStudio = openStudio;
openStudio = function (kind, sp, name) {
  _10openStudio(kind, sp, name);
  if (!sp.route) { $$('#sheet [data-a=st-style][data-v=trasa], #sheet [data-a=st-style][data-v=mapa]').forEach(b => b.remove()); if (['trasa', 'mapa'].includes(STU.style)) { STU.style = 'noc'; $$('#sheet [data-a=st-style]').forEach(b => b.classList.toggle('on', b.dataset.v === 'noc')); stuRender(); } }
};
const _10stuRender = stuRender;
stuRender = async function () { await _10stuRender(); const box = $('#st-prev'); if (box && STU && STU.style === 'trasa') box.classList.add('cista'); };
