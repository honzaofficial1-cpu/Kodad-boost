#!/usr/bin/env python3
"""Studio – přístup k Honzovým videím a scénářům pro Claude na počítači (jen čtení).

Data appky Studio (https://honzaofficial1-cpu.github.io/Kodad-boost/studio/) se synchronizují do soukromého
GitHub gistu. Tenhle skript je stáhne a vypíše v čitelné podobě.

ID gistu (soukromé, nikam ho nedávej): proměnná STUDIO_GIST, soubor ~/.studio-gist, nebo --gist ID.

Použití:
  python3 studio.py                  přehled: co stříhat, co točit, plán na 14 dní, rozpracované
  python3 studio.py scenar <název>   celý scénář videa (stačí část názvu, bez diakritiky)
  python3 studio.py hledej <text>    najde videa podle názvu, formátu nebo textu scénáře
  python3 studio.py videa [stav]     seznam videí (stav: napad, scenar, natoceno, strih, vydano)
  python3 studio.py json             všechna data jako JSON (pro cokoli dalšího)
"""
import json, os, subprocess, sys, unicodedata, urllib.request
from datetime import date, timedelta

USER = 'honzaofficial1-cpu'
STAGES = ['Nápad', 'Scénář', 'Natočeno', 'Sestříháno', 'Vydáno']


def gist_id(args):
    if '--gist' in args:
        i = args.index('--gist'); gid = args[i + 1]; del args[i:i + 2]; return gid
    if os.environ.get('STUDIO_GIST'): return os.environ['STUDIO_GIST'].strip()
    p = os.path.expanduser('~/.studio-gist')
    if os.path.exists(p): return open(p).read().strip()
    sys.exit('Chybí ID dat Studia: ulož ho do ~/.studio-gist (najdeš ho v appce: Nastavení → Návrhy od AI → Kopírovat).')


def load(args):
    if '--file' in args:  # pro testy: místní kopie dat
        i = args.index('--file'); f = args[i + 1]; del args[i:i + 2]; return json.load(open(f, encoding='utf-8'))
    gid = gist_id(args)
    url = f'https://gist.githubusercontent.com/{USER}/{gid}/raw/studio-data.json?t={int(date.today().strftime("%Y%m%d"))}'
    try:
        with urllib.request.urlopen(url, timeout=20) as r: raw = r.read().decode('utf-8')
    except Exception:  # např. Python bez certifikátů na macOS → curl
        raw = subprocess.run(['curl', '-sfL', url], capture_output=True, text=True, check=True).stdout
    return json.loads(raw)


def key(s):  # malá písmena, bez diakritiky, bez čárek a emoji
    t = ''.join(c for c in unicodedata.normalize('NFD', (s or '').lower()) if unicodedata.category(c) != 'Mn')
    return ' '.join(''.join(c if c.isalnum() else ' ' for c in t).split())


def has_all(text, q):  # všechna slova z dotazu jsou v textu
    t = key(text); return all(w in t for w in key(q).split())


def stage(i):
    st = i.get('status')
    if st == 'done': return 4
    if st == 'shot': return 3 if i.get('cut') else 2
    return 1 if st == 'script' else 0


def stage_name(i):
    n = STAGES[stage(i)]
    return n + (' · dodabovat' if i.get('dub') else '') + (' · k dopracování' if i.get('rework') and i.get('status') == 'idea' else '')


def fmt_date(d):
    if not d: return ''
    try:
        y, m, dd = map(int, d.split('-')); x = date(y, m, dd)
    except ValueError:
        return d
    return f"{['po', 'út', 'st', 'čt', 'pá', 'so', 'ne'][x.weekday()]} {x.day}. {x.month}."


def videos(d):
    return [i for i in d.get('ideas', []) if not i.get('deleted')]


def cat_name(d, i):
    c = next((c for c in d.get('cats', []) if c.get('id') == i.get('cat')), None)
    return (c.get('abbr') or c.get('name')) if c else ''


def line(d, i):
    bits = [x for x in [cat_name(d, i), i.get('fmt'), stage_name(i),
                        'natočit ' + fmt_date(i['shoot']) if i.get('shoot') and stage(i) < 2 else '',
                        ('vyšlo ' if stage(i) == 4 else 'vydat ') + fmt_date(i['date']) if i.get('date') else '',
                        'YouTube' if i.get('kind') == 'long' else ''] if x]
    return f"- {i.get('title') or 'Bez názvu'}  ({' · '.join(bits)})"


def script(d, i):
    sc = i.get('sc') or {}; h = sc.get('hook') or {}; e = sc.get('end') or {}
    out = [f"# {i.get('title') or 'Bez názvu'}", '',
           f"Formát: {i.get('fmt') or '—'} · Kategorie: {cat_name(d, i) or '—'} · Stav: {stage_name(i)}"
           + (f" · natočit {fmt_date(i['shoot'])}" if i.get('shoot') else '') + (f" · vydat {fmt_date(i['date'])}" if i.get('date') else '')]
    if i.get('link'): out.append(f"Odkaz: {i['link']}")
    if any(h.get(k) for k in ('say', 'see', 'txt')):
        out += ['', '## Hook'] + [f"{n}: {h[k]}" for k, n in (('say', 'Říká'), ('see', 'Vidět'), ('txt', 'Text na obrazovce')) if h.get(k)]
    body = [b for b in sc.get('body') or [] if (b.get('say') or b.get('see'))]
    if body:
        out += ['', '## Body']
        for n, b in enumerate(body, 1):
            out.append(f"{n}. {b.get('say', '')}" + (f"\n   Vidět: {b['see']}" if b.get('see') else ''))
    if e.get('say') or e.get('see'):
        out += ['', '## Konec'] + [f"{n}: {e[k]}" for k, n in (('say', 'Říká'), ('see', 'Vidět')) if e.get(k)]
    if i.get('cta'): out += ['', f"CTA: {i['cta']}"]
    if i.get('cap'): out += ['', '## Popisek', i['cap']]
    if i.get('shots'):
        out += ['', '## Záběry'] + [f"- [{'x' if s.get('done') else ' '}] {s.get('text', '')} ({'já do kamery' if s.get('type') == 'me' else 'B-roll'}{', ' + s['place'] if s.get('place') else ''})" for s in i['shots']]
    if (i.get('chapters') or []):
        out += ['', '## Kapitoly (YouTube)'] + [f"- {c.get('t', '')}: {c.get('txt', '')}" for c in i['chapters']]
    if i.get('note'): out += ['', '## Poznámky', i['note']]
    return '\n'.join(out)


def find(d, q):
    k = key(q); vs = videos(d)
    exact = [i for i in vs if key(i.get('title')) == k]
    return exact or [i for i in vs if has_all(i.get('title'), q)]


def overview(d):
    vs = videos(d); t = date.today().isoformat(); end = (date.today() + timedelta(days=14)).isoformat()
    out = [f"Studio – přehled ({fmt_date(t)}) · videí: {len(vs)}"]
    def sec(title, l):
        if l: out.extend(['', f"## {title} ({len(l)})"] + [line(d, i) for i in l])
    sec('Stříhat (natočeno, nesestříháno)', [i for i in vs if stage(i) == 2])
    sec('Sestříháno – připraveno k vydání', [i for i in vs if stage(i) == 3])
    sec('Naplánováno na 14 dní', sorted([i for i in vs if stage(i) < 4 and ((i.get('date') or '') >= t and (i.get('date') or '') <= end or (i.get('shoot') or '') >= t and (i.get('shoot') or '') <= end)],
                                         key=lambda i: i.get('shoot') or i.get('date') or ''))
    sec('Scénář hotový, čeká na natočení', [i for i in vs if stage(i) == 1 and not i.get('shoot')][:25])
    n0 = sum(1 for i in vs if stage(i) == 0); n4 = sum(1 for i in vs if stage(i) == 4)
    out += ['', f"Nápadů: {n0} · vydaných: {n4}. Formáty: " + ', '.join(sorted({i.get('fmt') for i in vs if i.get('fmt')}))]
    return '\n'.join(out)


def main():
    args = sys.argv[1:]; d = load(args)
    cmd = args[0] if args else ''
    q = ' '.join(args[1:])
    if cmd == 'json':
        print(json.dumps(d, ensure_ascii=False, indent=1))
    elif cmd == 'scenar':
        l = find(d, q)
        if not l: sys.exit(f'Nic nenalezeno pro „{q}“. Zkus: python3 studio.py hledej {q}')
        print(script(d, l[0]))
        if len(l) > 1: print('\nDalší shody:\n' + '\n'.join(line(d, i) for i in l[1:10]))
    elif cmd == 'hledej':
        l = [i for i in videos(d) if has_all(' '.join([i.get('title', ''), i.get('fmt', ''), json.dumps(i.get('sc') or {}, ensure_ascii=False), i.get('cap', '')]), q)]
        print('\n'.join(line(d, i) for i in l) or 'Nic nenalezeno.')
    elif cmd == 'videa':
        names = {'napad': 0, 'scenar': 1, 'natoceno': 2, 'strih': 3, 'sestrihano': 3, 'vydano': 4}
        want = names.get(key(q)) if q else None
        l = [i for i in videos(d) if want is None or stage(i) == want]
        print('\n'.join(line(d, i) for i in sorted(l, key=lambda i: (stage(i), i.get('date') or '9'))) or 'Nic.')
    else:
        print(overview(d))


if __name__ == '__main__':
    main()
