
// ===================== v2.9.2: pevný spodní bar · sheet zavřeš stažením dolů =====================
const APPEL = () => $('#app');
go = function (n, p = {}) { view = { n, ...p }; render(); const a = APPEL(); if (a) a.scrollTop = 0; };
// stažení panelu dolů
(function () {
  let st = null;
  const reset = pn => { pn.style.transition = ''; pn.style.transform = ''; const bd = $('#sheet .bd'); if (bd) { bd.style.transition = ''; bd.style.opacity = ''; } };
  document.addEventListener('touchstart', ev => {
    const pn = ev.target.closest('#sheet .pn'); if (!pn || ev.touches.length !== 1) return;
    if (ev.target.closest('input,textarea,select,canvas')) return;
    if (pn.scrollTop > 2 && !ev.target.closest('.grab')) return;
    st = { y: ev.touches[0].clientY, x: ev.touches[0].clientX, t: performance.now(), dy: 0, pn, on: false };
  }, { passive: true });
  document.addEventListener('touchmove', ev => {
    if (!st) return; const y = ev.touches[0].clientY, dy = y - st.y, dx = ev.touches[0].clientX - st.x;
    if (!st.on) {
      if (dy > 8 && dy > Math.abs(dx)) { st.on = true; st.y = y - 1; st.pn.style.transition = 'none'; }
      else if (dy < -6 || Math.abs(dx) > 12) { st = null; return; } else return;
    }
    st.dy = Math.max(0, y - st.y); st.lastY = y; st.lastT = performance.now();
    st.pn.style.transform = `translateY(${st.dy}px)`;
    const bd = $('#sheet .bd'); if (bd) bd.style.opacity = String(Math.max(0, 1 - st.dy / (st.pn.offsetHeight || 600)));
    ev.preventDefault();
  }, { passive: false });
  const end = () => {
    if (!st) return; const s = st; st = null; if (!s.on) return;
    const v = s.dy / Math.max(1, performance.now() - s.t);
    if (s.dy > Math.min(140, s.pn.offsetHeight * .3) || (v > .6 && s.dy > 40)) {
      s.pn.style.transition = 'transform .22s cubic-bezier(.3,0,.8,.4)'; s.pn.style.transform = 'translateY(105%)';
      const bd = $('#sheet .bd'); if (bd) { bd.style.transition = 'opacity .22s'; bd.style.opacity = '0'; }
      setTimeout(() => { if ($('#sheet .pn') === s.pn) closeSheet(); }, 220);
    } else { s.pn.style.transition = 'transform .28s cubic-bezier(.2,.9,.3,1.15)'; s.pn.style.transform = 'translateY(0)'; setTimeout(() => reset(s.pn), 300); }
  };
  document.addEventListener('touchend', end); document.addEventListener('touchcancel', end);
})();
// spodní bar: když iOS ve webové aplikaci nahlásí kratší okno než displej, dorovnáme to
function fixBottom() {
  const pr = document.createElement('div'); pr.style.cssText = 'position:fixed;left:0;bottom:0;width:1px;height:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none';
  document.body.appendChild(pr); const sab = pr.offsetHeight; pr.remove();
  const sa = !!(navigator.standalone || matchMedia('(display-mode: standalone)').matches);
  const port = innerHeight > innerWidth; const gap = sa && port ? Math.max(0, Math.round(screen.height - innerHeight)) : 0;
  const fix = gap > 0 && gap < 140 ? gap : 0;
  // okno končí nad spodní hranou displeje → bezpečný okraj už je mimo okno, bar dáme těsně ke spodku okna
  if (fix > 20) document.documentElement.style.setProperty('--tabb', '8px'); else document.documentElement.style.removeProperty('--tabb');
  window.__vb = { sab, ih: innerHeight, sh: screen.height, sa, fix };
}
fixBottom(); addEventListener('resize', fixBottom); addEventListener('orientationchange', () => setTimeout(fixBottom, 300));
const _9vSettings = vSettings;
vSettings = function () { const v = window.__vb || {}; return _9vSettings().replace(/Kodad boost · verze ([^<]*)<\/span>/, (m, ver) => `Kodad boost · verze ${ver}</span><span class="mut" style="font-size:11px">displej ${v.sh} · okno ${v.ih} · spodní okraj ${v.sab} · posun ${v.fix}${v.sa ? '' : ' · prohlížeč'}</span>`); };
