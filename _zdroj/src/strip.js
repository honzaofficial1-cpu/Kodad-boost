// ---------- karta „pruh“: nízký široký obdélník ----------
async function drawShare(sp, style, on) {
  const W = 1080, L = 48;
  const isOn = id => on[id] !== false;
  const prOff = sp.prAlt && on.pr === false; if (prOff) sp = { ...sp, ...sp.prAlt };
  const col = sp.col;
  const stats = (sp.stats || []).filter(s => isOn(s.id)).slice(0, 3);
  const lists = (sp.lists || []).filter(l => isOn(l.id) && l.items.length);
  const vizs = (sp.viz || []).filter(v => isOn(v.id));
  const colr = style === 'barva', clear = style === 'cista';
  const fg = colr ? '#0B0B0C' : '#F5F5F7', mut = colr ? 'rgba(11,11,12,.6)' : clear ? 'rgba(255,255,255,.82)' : '#9A9AA0', acc = colr ? '#0B0B0C' : col, faint = colr ? 'rgba(11,11,12,.12)' : clear ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.08)';
  const TB = 300, X = L + 192 + 34, SW = stats.length ? 250 : 0;
  const m = document.createElement('canvas').getContext('2d');
  const room = W - L - X - SW - 20;
  const size = (() => { let s = 140; m.font = `italic 900 ${s}px ${CF}`; let u = sp.unit ? (m.font = `italic 700 ${Math.round(s * .3)}px ${CF}`, m.measureText(sp.unit).width + 14) : 0; m.font = `italic 900 ${s}px ${CF}`; while (m.measureText(sp.big).width + u > room && s > 70) { s -= 6; m.font = `italic 700 ${Math.round(s * .3)}px ${CF}`; u = sp.unit ? m.measureText(sp.unit).width + 14 : 0; m.font = `italic 900 ${s}px ${CF}`; } return s; })();
  const listRows = lists.map(l => Math.ceil(l.items.length / 2));
  const listH = lists.length ? lists.reduce((a, l, i) => a + 40 + listRows[i] * 46, 0) + 10 : 0;
  const vizH = vizs.reduce((a, v) => a + v.hs + 20, 0);
  const h = TB + (vizH ? vizH + 6 : 0) + (listH ? listH : 0) + (vizH || listH ? 26 : 0) + 52;
  const c = document.createElement('canvas'); c.width = W; c.height = h; const x = c.getContext('2d');
  if (!clear) {
    rr(x, 0, 0, W, h, 50); x.save(); x.clip();
    if (colr) { const g = x.createLinearGradient(0, 0, W, h); g.addColorStop(0, col); g.addColorStop(1, shade(col, .74)); x.fillStyle = g; x.fillRect(0, 0, W, h); }
    else { const g = x.createLinearGradient(0, 0, W, h); g.addColorStop(0, '#1E1E21'); g.addColorStop(1, '#0D0D0F'); x.fillStyle = g; x.fillRect(0, 0, W, h); const rg = x.createRadialGradient(150, 150, 10, 150, 150, 420); rg.addColorStop(0, hexA(col, .17)); rg.addColorStop(1, hexA(col, 0)); x.fillStyle = rg; x.fillRect(0, 0, W, h); }
    x.globalAlpha = colr ? .14 : .06; x.fillStyle = colr ? '#FFFFFF' : col; slab(x, W - 330, -10, 100, h + 20); x.globalAlpha = colr ? .08 : .035; slab(x, W - 200, -10, 40, h + 20); x.globalAlpha = 1;
    x.restore();
    if (!colr) { x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 2.5; rr(x, 1.25, 1.25, W - 2.5, h - 2.5, 49); x.stroke(); }
  }
  if (clear) { x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 24; x.shadowOffsetY = 2; }
  // medailon + logo pod ním
  const mx = L + 96, my = 150, R = 92;
  x.beginPath(); x.arc(mx, my, R, 0, Math.PI * 2); x.fillStyle = colr ? 'rgba(11,11,12,.10)' : clear ? 'rgba(255,255,255,.12)' : hexA(col, .12); x.fill();
  x.lineWidth = 3; x.strokeStyle = colr ? 'rgba(11,11,12,.35)' : clear ? 'rgba(255,255,255,.55)' : hexA(col, .45); x.stroke();
  drawPicto(x, sp.picto, mx, my, 110, colr ? '#0B0B0C' : clear ? '#FFFFFF' : col);
  const mk = await markTinted(colr ? '#0B0B0C' : '#FFFFFF');
  // titulky
  const kick = [sp.kicker, sp.date].filter(Boolean).join('  ·  ');
  x.fillStyle = mut; x.font = `600 22px ${CF}`; spacedL(x, clip(x, kick.toUpperCase(), room + SW - 40), X, 70, 4);
  x.fillStyle = acc; x.font = `italic 800 34px ${CF}`; spacedL(x, clip(x, sp.title.toUpperCase(), room), X, 112, 3);
  const bigY = 112 + 18 + Math.round(size * .84);
  x.fillStyle = fg; x.font = `italic 900 ${size}px ${CF}`; x.fillText(sp.big, X - 5, bigY); const bw = x.measureText(sp.big).width;
  if (sp.unit) { x.fillStyle = mut; x.font = `italic 700 ${Math.round(size * .3)}px ${CF}`; x.fillText(sp.unit, X + bw + 12, bigY); }
  x.fillStyle = acc; slab(x, X, bigY + 18, 100, 8); x.fill(); x.globalAlpha = .45; slab(x, X + 114, bigY + 18, 30, 8); x.fill(); x.globalAlpha = 1;
  // statistiky vpravo pod sebou
  if (stats.length) {
    const sx = W - L, step = stats.length === 1 ? 0 : Math.min(78, 190 / (stats.length - 1)), y0 = stats.length === 1 ? 150 : 150 - step * (stats.length - 1) / 2;
    x.fillStyle = faint; x.fillRect(sx - SW + 10, 66, 2, 172);
    stats.forEach((s, i) => { const yy = y0 + i * step; x.textAlign = 'right'; x.fillStyle = fg; x.font = `italic 800 42px ${CF}`; x.fillText(clip(x, s.value, SW - 30), sx, yy + 4); x.fillStyle = mut; x.font = `600 19px ${CF}`; x.fillText(s.label.toUpperCase(), sx, yy + 30); x.textAlign = 'left'; });
  }
  let y = TB;
  vizs.forEach(v => { v.drawS(x, L, y, W - 2 * L, { fg, mut, acc, faint, colr }); y += v.hs + 20; });
  // seznamy ve dvou sloupcích
  const cw = (W - 2 * L - 28) / 2;
  lists.forEach((l, li) => {
    x.fillStyle = mut; x.font = `600 20px ${CF}`; spacedL(x, l.title.toUpperCase(), L, y + 24, 4); y += 40;
    l.items.forEach(([Lt, Rt, rc], k) => {
      const cx = L + (k % 2) * (cw + 28), cy = y + Math.floor(k / 2) * 46;
      x.fillStyle = faint; x.fillRect(cx, cy, cw, 2);
      x.fillStyle = fg; x.font = `500 25px ${CF}`; x.fillText(clip(x, Lt, cw - 150), cx, cy + 32);
      x.textAlign = 'right'; x.fillStyle = rc && !colr ? rc : fg; x.font = `italic 800 26px ${CF}`; x.fillText(Rt, cx + cw, cy + 33); x.textAlign = 'left';
    });
    y += listRows[li] * 46;
  });
  if (mk) { const lh = 28, lw = lh * (mk.naturalWidth || mk.width) / (mk.naturalHeight || mk.height); x.shadowBlur = 0; x.globalAlpha = .55; x.drawImage(mk, W - L - lw, h - 30 - lh, lw, lh); x.globalAlpha = 1; }
  return c;
}
// kompaktní vizualizace do pruhu
function vizStripDays(ks, label, id) {
  return {
    id, label, hs: 64, drawS: (x, X, Y, W, k) => {
      const n = ks.length, gap = n > 10 ? 6 : 12, cw = (W - gap * (n - 1)) / n;
      ks.forEach((kk, i) => { const s = sessionOn(kk), a = actsOn(kk), done = s && s.end, cx = X + i * (cw + gap);
        if (done) { x.fillStyle = k.acc; slab(x, cx - 6, Y, cw - (n > 10 ? 4 : 10), 46); x.fill(); } else { x.fillStyle = k.faint; rr(x, cx, Y, cw, 46, n > 10 ? 6 : 12); x.fill(); }
        if (a.length) { x.fillStyle = done ? (k.colr ? '#FFFFFF' : '#0B0B0C') : k.acc; x.beginPath(); x.arc(cx + cw / 2, Y + 23, n > 10 ? 4 : 6, 0, 6.28); x.fill(); }
        if (n <= 10) { x.fillStyle = k.mut; x.font = `700 18px ${CF}`; x.textAlign = 'center'; x.fillText(DOW[pdate(kk).getDay()].toUpperCase(), cx + cw / 2, Y + 64); x.textAlign = 'left'; } });
    }
  };
}
const _vizMonth = vizMonth, _vizWeek = vizWeek, _vizWeight = vizWeight;
vizMonth = (yy, mm) => { const days = new Date(yy, mm + 1, 0).getDate(); return vizStripDays([...Array(days)].map((_, i) => dkey(new Date(yy, mm, i + 1))), 'Kalendář', 'cal'); };
vizWeek = mon => vizStripDays([...Array(7)].map((_, i) => dkey(addDays(mon, i))), 'Dny', 'days');
vizWeight = ks => { const v = _vizWeight(ks); if (!v) return null; return { ...v, hs: 96, drawS: (x, X, Y, W, k) => v.draw(x, X, Y - 10, W, k) }; };
