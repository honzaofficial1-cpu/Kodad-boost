// Odešle push upozornění na všechna zařízení v push/subscriptions.json
import webpush from 'web-push';
import fs from 'fs';
const cfg = JSON.parse(fs.readFileSync('push/config.json', 'utf8'));
const subs = JSON.parse(fs.readFileSync('push/subscriptions.json', 'utf8'));
if (!subs.length) { console.log('Žádné zařízení.'); process.exit(0); }
const priv = process.env.VAPID_PRIVATE_KEY;
if (!priv) { console.error('Chybí secret VAPID_PRIVATE_KEY.'); process.exit(1); }
const ev = process.env.EVENT, sched = process.env.SCHEDULE || '';
const off = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Prague', timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName').value;
const plus = off.includes('+2') ? 2 : 1;
let payload;
if (ev === 'schedule') {
  const utcH = +sched.trim().split(/\s+/)[1];
  if ((utcH + plus) % 24 !== cfg.hour) { console.log(`Přeskakuji (${sched}, Praha ${off}).`); process.exit(0); }
  payload = { title: 'Dobré ráno', body: 'Ranní zápis: váha nalačno, spánek a jak proběhl včerejšek.', url: './?open=den' };
} else {
  payload = { title: 'Kodad boost', body: 'Upozornění fungují. Ráno ti připomenu ranní zápis.', url: './' };
}
webpush.setVapidDetails(cfg.subject, cfg.publicKey, priv);
let ok = 0;
for (const s of subs) {
  try { await webpush.sendNotification(s, JSON.stringify(payload), { TTL: 3600 }); ok++; }
  catch (e) { console.error('Chyba', e.statusCode, e.body); }
}
console.log(`Odesláno ${ok}/${subs.length}.`);
if (!ok) process.exit(1);
