import os, json, shutil
from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
src = lambda f: open(os.path.join(B, 'src', f), encoding='utf-8').read()
mark = open(os.path.join(B,'assets','mark.svg'),encoding='utf-8').read().replace('<svg ','<svg aria-hidden="true" ')
VERSION = '2.21.0'
WHOOP_URL = 'https://kodad-whoop.honzaofficial1.workers.dev'
import base64 as _b64
_ff = ''.join(f"@font-face{{font-family:'BC';font-weight:{w};font-style:{st};font-display:block;src:url(data:font/woff;base64,{_b64.b64encode(open(os.path.join(B,'assets','fonts',f),'rb').read()).decode()}) format('woff')}}" for f, w, st in [('bc-SemiBold.woff', 600, 'normal'), ('bc-Bold.woff', 700, 'normal'), ('bc-ExtraBoldItalic.woff', 800, 'italic')])
css, js = _ff + src('style.css') + src('style3.css'), 'const APP_VERSION = ' + json.dumps(VERSION) + ';\nconst MARK = ' + json.dumps(mark) + ';\n' + src('data.js') + '\n' + src('app.js') + '\n' + src('body.js') + '\n' + src('extra.js') + '\n' + src('strip.js') + '\n' + src('muscles.js') + '\n' + src('styles2.js') + '\n' + src('v28.js') + '\n' + src('v29.js') + '\n' + src('v30.js') + '\n' + src('v31.js') + '\n' + src('v32.js').replace('__WHOOP_URL__', WHOOP_URL) + '\nconst JD_DEFAULT = ' + json.dumps(json.load(open(os.path.join(B,'assets','jidelnicek-data.json'),encoding='utf-8')), ensure_ascii=False, separators=(',',':')) + ';\n' + src('v33.js') + '\n' + src('v34.js') + '\n' + src('v35.js') + '\n' + src('v36.js') + '\n' + src('v37.js') + '\n' + src('v38.js') + '\n' + src('v39.js') + '\n' + src('v40.js') + '\n' + src('v41.js') + '\nrender();\n'
FONTS_OLD = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap">'
FONTS = ''
BODY = '<div id="app"></div><div id="sheet" hidden></div><div id="toast" role="status" aria-live="polite"></div>'

# 1) artefakt (náhled v Claudovi)
os.makedirs(os.path.join(B, 'dist'), exist_ok=True)
art = f'''<title>Kodad boost</title>
<meta name="claude:viewport-fit-sides" content="cover">
{FONTS}
<style>{css}</style>
{BODY}
<script>{js}</script>
'''
open(os.path.join(B, 'dist', 'kodad-boost.html'), 'w', encoding='utf-8').write(art)

# 2) PWA balíček
P = os.path.join(B, 'pwa'); shutil.rmtree(P, ignore_errors=True); os.makedirs(os.path.join(P, 'icons'))
idx = f'''<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Kodad boost</title>
<meta name="theme-color" content="#0C0D10">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Kodad boost">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" href="icons/icon-192.png">
{FONTS}
<style>:root{{padding-top:env(safe-area-inset-top,0px)}}[hidden]{{display:none!important}}img{{max-width:100%}}</style>
<style>{css}</style>
</head>
<body>
{BODY}
<script>{js}</script>
<script>if('serviceWorker' in navigator){{let rl=false;const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{{if(rl||!had)return;rl=true;location.reload();}});addEventListener('load',()=>navigator.serviceWorker.register('sw.js',{{updateViaCache:'none'}}).then(reg=>{{document.addEventListener('visibilitychange',()=>{{if(document.visibilityState==='visible')reg.update().catch(()=>{{}});}});}}).catch(()=>{{}}));}}</script>
</body>
</html>
'''
open(os.path.join(P, 'index.html'), 'w', encoding='utf-8').write(idx)
json.dump({
  "name": "Kodad boost", "short_name": "JK Boost", "lang": "cs", "start_url": "./", "scope": "./",
  "display": "standalone", "orientation": "portrait", "background_color": "#0C0D10", "theme_color": "#0A0A0A",
  "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]
}, open(os.path.join(P, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
sw = f'''// Kodad boost – offline cache
const C = 'kb-{VERSION}';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {{ e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); }});
self.addEventListener('activate', e => {{ e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())); }});
self.addEventListener('fetch', e => {{
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {{
    // aplikace: síť, když je; jinak cache (vždy funguje offline)
    e.respondWith(fetch(r, {{ cache: 'no-store' }}).then(res => {{ const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; }}).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
  }} else if (/fonts\\.(googleapis|gstatic)\\.com/.test(u.host)) {{
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {{ const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; }})));
  }}
}});
self.addEventListener('push', e => {{
  let d = {{}}; try {{ d = e.data.json(); }} catch (_) {{ d = {{ body: e.data ? e.data.text() : '' }}; }}
  e.waitUntil(self.registration.showNotification(d.title || 'Kodad boost', {{ body: d.body || '', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: {{ url: d.url || './' }} }}));
}});
self.addEventListener('notificationclick', e => {{
  e.notification.close();
  const url = new URL(e.notification.data.url || './', self.registration.scope).href;
  e.waitUntil(clients.matchAll({{ type: 'window', includeUncontrolled: true }}).then(cs => {{
    for (const c of cs) {{ if ('focus' in c) {{ if (c.navigate) c.navigate(url); return c.focus(); }} }}
    return clients.openWindow(url);
  }}));
}});
'''
open(os.path.join(P, 'sw.js'), 'w', encoding='utf-8').write(sw)

for f in ['icon-192.png','icon-512.png','apple-touch-icon.png']: shutil.copy(os.path.join(B,'assets',f), os.path.join(P,'icons',f))
print('ok', len(art))
