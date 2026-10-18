
// ===================== v2.7: styly Nálepka a Přes fotku + Bez barvy =====================
const hhmm = ms => { const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const MONO = '#F2F2F2';
const _drawCard = drawShare;
drawShare = async function (sp, style, on) {
  const mono = !!on._mono;
  if (sp.prAlt && on.pr === false) sp = { ...sp, ...sp.prAlt, prAlt: null };
  if (mono) sp = { ...sp, col: MONO, prAlt: sp.prAlt ? { ...sp.prAlt, col: MONO } : null };
  if (style === 'nalepka') return drawSticker(sp, on);
  if (style === 'foto') return drawOverlay(sp, on);
  return _drawCard(sp, style, on);
};
async function drawSticker(sp, on) {
  const W = 1000, H = 200, col = sp.col;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  rr(x, 0, 0, W, H, 52); x.fillStyle = '#2A2B2F'; x.fill();
  rr(x, 14, 14, W - 28, H - 28, 42); x.fillStyle = '#35373C'; x.fill();
  // barevný blok
  const bx = 28, by = 28, bh = H - 56;
  x.font = `italic 900 76px ${CF}`; const bigW = x.measureText(sp.big).width; x.font = `italic 700 26px ${CF}`; const uW = sp.unit ? x.measureText(sp.unit).width + 10 : 0;
  const bw = Math.min(520, 40 + 96 + 24 + bigW + uW + 34);
  rr(x, bx, by, bw, bh, 32); x.fillStyle = col; x.fill();
  x.globalAlpha = .12; x.fillStyle = '#000'; slab(x, bx + bw - 90, by, 46, bh); x.fill(); x.globalAlpha = 1;
  drawPicto(x, sp.picto, bx + 40 + 48, by + bh / 2, 92, '#0B0B0C');
  x.fillStyle = '#0B0B0C'; x.font = `italic 900 76px ${CF}`; x.fillText(sp.big, bx + 40 + 96 + 24, by + bh / 2 + 27);
  if (sp.unit) { x.font = `italic 700 26px ${CF}`; x.globalAlpha = .7; x.fillText(sp.unit, bx + 40 + 96 + 24 + bigW + 10, by + bh / 2 + 27); x.globalAlpha = 1; }
  // název
  const lines = sp.times || [(sp.date || '').replace(/\s*\d{4}$/, ''), sp.stats && sp.stats[0] ? `${sp.stats[0].value} ${sp.stats[0].label}` : ''];
  x.font = `700 30px ${CF}`; const rightW = Math.max(...lines.map(t => x.measureText(t || '').width)) + 70;
  const tx = bx + bw + 40;
  x.fillStyle = '#F5F5F7'; { const room = W - tx - rightW - 40, T = sp.title.toUpperCase(); let fs = 40; x.font = `italic 800 ${fs}px ${CF}`; while (x.measureText(T).width + T.length * 2 > room && fs > 26) { fs -= 2; x.font = `italic 800 ${fs}px ${CF}`; } spacedL(x, clip(x, T, room), tx, H / 2 + 6, 2); }
  if (sp.kicker && sp.kicker !== sp.title) { x.fillStyle = '#9A9AA0'; x.font = `600 20px ${CF}`; spacedL(x, clip(x, sp.kicker.toUpperCase(), W - tx - rightW - 40), tx, H / 2 + 38, 3); }
  // vpravo dva řádky + šikmá lišta
  x.textAlign = 'right'; x.fillStyle = '#A8A8AE'; x.font = `700 30px ${CF}`;
  if (lines[1]) { x.fillText(lines[0] || '', W - 74, H / 2 - 12); x.fillText(lines[1], W - 74, H / 2 + 36); } else x.fillText(lines[0] || '', W - 74, H / 2 + 11); x.textAlign = 'left';
  x.fillStyle = col; slab(x, W - 58, 58, 8, H - 116); x.fill();
  return c;
}
async function drawOverlay(sp, on) {
  const W = 1080, H = 340, X = 60, col = sp.col;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 20; x.shadowOffsetY = 2;
  const mk = await markTinted('#FFFFFF');
  let lx = X; if (mk) { const lh = 58, lw = lh * (mk.naturalWidth || mk.width) / (mk.naturalHeight || mk.height); x.drawImage(mk, X, 46, lw, lh); lx = X + lw + 30; }
  x.fillStyle = '#FFFFFF'; x.font = `italic 900 54px ${CF}`; spacedL(x, clip(x, sp.title.toUpperCase(), W - lx - X), lx, 98, 2);
  const isOn = id => on[id] !== false;
  const fm = v => { const n = +v; if (!isFinite(n)) return v; return n >= 60 ? `${Math.floor(n / 60)} h ${n % 60} min` : `${n} min`; };
  const cols = [{ label: sp.bigLabel || 'Výsledek', value: `${sp.big}${sp.unit ? ' ' + sp.unit : ''}` }, ...(sp.stats || []).filter(s => isOn(s.id)).map(s => s.label === 'min' ? { label: 'Čas', value: fm(s.value) } : s.label === 'min/km' ? { label: 'Tempo', value: `${s.value}/km` } : { label: s.label, value: s.value })].slice(0, 3);
  const cw = (W - 2 * X) / cols.length;
  cols.forEach((cc, i) => {
    const cx = X + i * cw;
    x.fillStyle = 'rgba(255,255,255,.9)'; x.font = `600 30px ${CF}`; x.fillText(cc.label.charAt(0).toUpperCase() + cc.label.slice(1), cx, 196);
    x.fillStyle = '#FFFFFF'; let fs = 66; x.font = `italic 800 ${fs}px ${CF}`; while (x.measureText(cc.value).width > cw - 24 && fs > 36) { fs -= 4; x.font = `italic 800 ${fs}px ${CF}`; } x.fillText(cc.value, cx, 196 + 18 + fs * .86);
  });
  x.shadowBlur = 0; x.fillStyle = col; slab(x, X, 300, 96, 8); x.fill(); x.globalAlpha = .5; slab(x, X + 110, 300, 28, 8); x.fill(); x.globalAlpha = 1;
  return c;
}
// doplnění údajů do specifikací (časy, popisek hlavního čísla)
const _specWorkout = specWorkout; specWorkout = s => ({ ..._specWorkout(s), times: [hhmm(s.start), hhmm(s.end || finEnd || Date.now())], bigLabel: 'Čas' });
const _specExercise = specExercise; specExercise = (s, e) => ({ ..._specExercise(s, e), bigLabel: 'Top série' });
const _specActivity = specActivity; specActivity = a => { const sp = _specActivity(a); sp.bigLabel = a.type === 'sauna' ? 'Sauna' : a.km ? 'Vzdálenost' : a.laps ? 'Bazény' : a.reps ? 'Úseky' : a.sec || a.min ? 'Čas' : 'Aktivita'; return sp; };
const _specWeek = specWeek; specWeek = k => ({ ..._specWeek(k), bigLabel: 'Tréninky' });
const _specMonth = specMonth; specMonth = (y, m) => ({ ..._specMonth(y, m), bigLabel: 'Tréninky' });
// studio: víc stylů + barevně / bez barvy
STYLES.length = 0; STYLES.push(['noc', 'Karta'], ['barva', 'Barevná'], ['cista', 'Bez pozadí'], ['nalepka', 'Nálepka'], ['foto', 'Přes fotku']);
const _openStudio = openStudio;
openStudio = function (kind, sp, name) {
  _openStudio(kind, sp, name);
  const pref = (S.settings.share || {})[kind] || {}; STU.on._mono = !!pref.mono;
  const seg = $('#sheet [data-a=st-style]')?.parentElement; if (seg) { seg.classList.add('st5'); }
  seg && seg.insertAdjacentHTML('afterend', `<button class="sw ${STU.on._mono ? '' : 'on'}" data-a="st-mono" style="margin-top:10px"><span>Barevně<small>Vypnuto = bílá na černé, ladí ke každé fotce</small></span><span class="k"></span></button>`);
  stuRender();
};
const _stuRender = stuRender;
stuRender = async function () { await _stuRender(); if (STU && S.settings.share[STU.kind]) { S.settings.share[STU.kind].mono = !!STU.on._mono; save(); } const box = $('#st-prev'); if (box && STU && ['nalepka', 'foto'].includes(STU.style)) box.classList.add('cista'); };
A['st-mono'] = b => { STU.on._mono = !STU.on._mono; b.classList.toggle('on', !STU.on._mono); stuRender(); };
