// Odešle push upozornění na všechna zařízení v push/subscriptions.json
import fs from 'fs';
process.on('uncaughtException', e => { console.log(`::error::Pád skriptu: ${String(e && e.stack || e).replace(/\n/g, ' | ').slice(0, 400)}`); process.exit(1); });
process.on('unhandledRejection', e => { console.log(`::error::Pád skriptu: ${String(e && e.stack || e).replace(/\n/g, ' | ').slice(0, 400)}`); process.exit(1); });
const webpush = (await import('web-push')).default;
const cfg = JSON.parse(fs.readFileSync('push/config.json', 'utf8'));
const subs = JSON.parse(fs.readFileSync('push/subscriptions.json', 'utf8'));
if (!subs.length) { console.log('Žádné zařízení.'); process.exit(0); }
const priv = (process.env.VAPID_PRIVATE_KEY || '').trim();
console.log(`::notice::Klíč: ${priv ? priv.length + ' znaků' : 'chybí'}, zařízení: ${subs.length}, událost: ${process.env.EVENT}`);
if (!priv) { console.log('::error::Chybí secret VAPID_PRIVATE_KEY'); process.exit(1); }
const ev = process.env.EVENT, sched = process.env.SCHEDULE || '';
const off = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Prague', timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName').value;
const plus = off.includes('+2') ? 2 : 1;
let payload;
if (ev === 'schedule') {
  const [mm, hh, , , dow] = sched.trim().split(/\s+/);
  const local = (+hh + plus) % 24;
  if (dow === '0') {
    if (local !== (cfg.weekHour ?? 19)) { console.log(`Přeskakuji (${sched}, Praha ${off}).`); process.exit(0); }
    payload = { title: 'Souhrn týdne', body: 'Tvůj týden je spočítaný – tréninky, rekordy a tempo nabírání.', url: './?open=week' };
  } else {
    if (local !== cfg.hour) { console.log(`Přeskakuji (${sched}, Praha ${off}).`); process.exit(0); }
    const wd = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Prague', weekday: 'short' }).format(new Date());
    payload = { title: 'Dobré ráno', body: 'Váha nalačno po toaletě, spánek a kroky za včerejšek.', url: './?open=den' };
    if (wd === 'Sun') payload = { title: 'Neděle: pas a váha', body: 'Ráno nalačno váha a pas ve výši pupku. Večer týdenní hodnocení v Jídle → Vývoj.', url: './?open=den' };
    if (wd === 'Sat') payload = { title: 'Dobré ráno · nákup N1', body: 'Váha nalačno. Dnes víkendový nákup na příští týden (Po–St) – seznam je v Jídle.', url: './?open=nakup' };
    if (wd === 'Wed') payload = { title: 'Dobré ráno · nákup N2', body: 'Váha nalačno. Dnes středeční nákup a vaření do zásoby – seznam je v Jídle.', url: './?open=nakup' };
  }
} else {
  payload = { title: 'Kodad boost', body: 'Upozornění fungují.', url: './' };
}
webpush.setVapidDetails(cfg.subject, cfg.publicKey, priv);
let ok = 0;
for (const s of subs) {
  try { await webpush.sendNotification(s, JSON.stringify(payload), { TTL: 3600 }); ok++; }
  catch (e) { console.log(`::error::Push selhal: ${e.statusCode || ''} ${(e.body || e.message || '').toString().slice(0, 200)}`); }
}
console.log(`Odesláno ${ok}/${subs.length}.`);
if (!ok) process.exit(1);
