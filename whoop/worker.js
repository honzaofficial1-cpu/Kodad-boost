// Kodad boost × WHOOP – prostředník pro přihlášení a stahování dat (Cloudflare Worker) · nasazení 2026-10-20
const AUTH = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const TOKEN = 'https://api.prod.whoop.com/oauth/oauth2/token';
const API = 'https://api.prod.whoop.com/developer';
const SCOPES = 'offline read:recovery read:cycles read:workout read:sleep read:body_measurement';
const APP = 'https://honzaofficial1-cpu.github.io/Kodad-boost/';
const ORIGIN = 'https://honzaofficial1-cpu.github.io';

const enc = encodeURIComponent;
const rand = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map(b => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[b % 62]).join(''); };
const json = (o, s, h) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...h } });

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    const cors = { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Headers': 'authorization,content-type', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const redirect = u.origin + '/callback';

    if (u.pathname === '/login') {
      const state = rand(12);
      await env.KV.put('state:' + state, '1', { expirationTtl: 900 });
      return Response.redirect(`${AUTH}?response_type=code&client_id=${enc(env.WHOOP_CLIENT_ID)}&redirect_uri=${enc(redirect)}&scope=${enc(SCOPES)}&state=${state}`, 302);
    }

    if (u.pathname === '/callback') {
      const st = u.searchParams.get('state'), code = u.searchParams.get('code');
      if (u.searchParams.get('error')) return new Response('WHOOP přihlášení zrušeno: ' + u.searchParams.get('error_description'), { status: 400 });
      if (!st || !(await env.KV.get('state:' + st))) return new Response('Neplatný nebo prošlý odkaz, zkus Propojit znovu.', { status: 400 });
      await env.KV.delete('state:' + st);
      const r = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect, client_id: env.WHOOP_CLIENT_ID, client_secret: env.WHOOP_CLIENT_SECRET }) });
      const t = await r.json().catch(() => ({}));
      if (!r.ok || !t.access_token) return new Response('WHOOP nevrátil token: ' + JSON.stringify(t), { status: 500 });
      await saveTok(env, t);
      let key = await env.KV.get('appkey'); if (!key) { key = rand(32); await env.KV.put('appkey', key); }
      return Response.redirect(`${APP}?whoop=${key}`, 302);
    }

    if (u.pathname === '/data') {
      const key = await env.KV.get('appkey');
      if (!key || req.headers.get('authorization') !== 'Bearer ' + key) return json({ error: 'unauthorized' }, 401, cors);
      const since = u.searchParams.get('since') || new Date(Date.now() - 30 * 864e5).toISOString();
      try {
        const at = await access(env);
        const [recovery, sleep, cycle, workout] = await Promise.all(['/v2/recovery', '/v2/activity/sleep', '/v2/cycle', '/v2/activity/workout'].map(p => all(at, p, since)));
        return json({ recovery, sleep, cycle, workout, at: new Date().toISOString() }, 200, cors);
      } catch (e) { return json({ error: String(e.message || e) }, 502, cors); }
    }

    if (u.pathname === '/disconnect') {
      const key = await env.KV.get('appkey');
      if (!key || req.headers.get('authorization') !== 'Bearer ' + key) return json({ error: 'unauthorized' }, 401, cors);
      await Promise.all(['rt', 'at', 'appkey'].map(k => env.KV.delete(k)));
      return json({ ok: true }, 200, cors);
    }
    return new Response('Kodad boost × WHOOP běží.', { headers: cors });
  },
};

async function saveTok(env, t) {
  if (t.refresh_token) await env.KV.put('rt', t.refresh_token);
  await env.KV.put('at', JSON.stringify({ t: t.access_token, exp: Date.now() + ((t.expires_in || 3600) - 120) * 1000 }));
}
async function access(env) {
  const c = JSON.parse((await env.KV.get('at')) || 'null'); if (c && c.exp > Date.now()) return c.t;
  const rt = await env.KV.get('rt'); if (!rt) throw new Error('not_connected');
  const r = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: rt, client_id: env.WHOOP_CLIENT_ID, client_secret: env.WHOOP_CLIENT_SECRET, scope: 'offline' }) });
  const t = await r.json().catch(() => ({}));
  if (!r.ok || !t.access_token) throw new Error('refresh_failed ' + JSON.stringify(t));
  await saveTok(env, t); return t.access_token;
}
async function all(at, path, since) {
  let out = [], next = null;
  for (let i = 0; i < 10; i++) {
    const q = new URLSearchParams({ limit: '25', start: since }); if (next) q.set('nextToken', next);
    const r = await fetch(API + path + '?' + q, { headers: { Authorization: 'Bearer ' + at } });
    if (!r.ok) throw new Error(path + ' ' + r.status + ' ' + (await r.text()).slice(0, 200));
    const j = await r.json(); out = out.concat(j.records || []); next = j.next_token; if (!next) break;
  }
  return out;
}
