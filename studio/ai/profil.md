# Návrhy od AI – podklad pro nedělní generování

Tenhle soubor čte Claude každou neděli ráno, když připravuje **Návrhy od AI** pro appku Studio
(https://honzaofficial1-cpu.github.io/Kodad-boost/studio/). Výsledek zapíše do `studio/navrhy.json`.
Appka ho načte a tvůrce si v neděli návrhy projde (Beru / Předělat / Ne) a naplánuje.

## Kdo je tvůrce

- Honza, český tvůrce krátkých videí (Instagram Reels, TikTok, Shorts) a občas YouTube.
- Témata: gym a fitness, vaření a jídlo (zdravě, hodně bílkovin), osobní rozvoj, MMA, otužování, sauna, skin care.
- Jeho cesta: „být o 1 % lepší každý den“, svaly, testosteron, první závod, běh, Hyrox.
- Styl řeči: **mluví jako s kámošem** – tyká, krátké věty, žádná korporátní slova, upřímně, s nadhledem.
- Nemíří na celou republiku na „high level“ – jde o autentičnost a pravidelnost.
- Funguje mu: hook do 2 vteřin, jedna myšlenka na video, konec s CTA, minisérie.

## Kategorie (vždy jedna z těchto tří, v JSON jako zkratka)

| Zkratka | Kategorie | Jak video vzniká |
|---|---|---|
| `EZ` | Bez mluvení | edit s hudbou, jen text na obrazovce; ráno |
| `DAB` | Dabing | záběry (B-roll) + jeho hlas přes ně |
| `KAM` | Do kamery | mluví přímo do kamery |

U `EZ` a `DAB` jsou všechny záběry B-roll (`"type": "broll"`). Jen u `KAM` může být záběr „já do kamery“ (`"type": "me"`).

## Formáty (pole `format`)

EZ s textem (EZ) · Head talk (KAM) · Mluvení u tabule (KAM) · Recept (DAB) · Recept edit (EZ) · Vaření (DAB) · Recenze (KAM).
Jiný formát použij jen výjimečně.

## Místa natáčení (pole `place` u záběrů)

Gym · Kuchyň · Koupelna · Doma · Venku

## Co každou neděli vytvořit

1. **5–7 celých videí** (`ideas`) na nadcházející týden (pondělí–neděle). Mix kategorií zhruba 3× EZ, 2× DAB, 2× KAM.
   Každé video: konkrétní název, proč teď (trend, sezóna, svátek, něco, co lidi řeší – krátce v `why`),
   hook ve 3 vrstvách (`say` = co řekne / u EZ prázdné, `see` = první záběr, `txt` = text na obrazovce),
   2–4 body těla (`say` + `see`), konec, CTA, popisek s 2–4 hashtagy a seznam záběrů k natočení s místem.
2. **7 denních EZ nápadů** (`daily`) – na každý den od pondělí do neděle jeden krátký nápad bez mluvení,
   natočitelný za 15 minut (`title`, `how` = jak to natočit a jaký text, `place`).

Témata: drž se jeho témat, sezóny (počasí, svátky, akce, Movember, Black Friday, Vánoce, předsevzetí…),
aktuálních trendů na Reels/TikToku ve fitness a jídle (podívej se na webu, co teď letí) a věcí,
které korespondují s jeho jménem a cestou (1 % lepší, Hyrox, otužování).
Neopakuj témata z `studio/ai/historie.txt` z posledních 8 týdnů.

## Formát souboru `studio/navrhy.json`

```json
{
 "week": "RRRR-MM-DD (pondělí týdne)",
 "created": "RRRR-MM-DD",
 "by": "Claude",
 "ideas": [{
   "id": "RRRR-MM-DD-1",
   "title": "…", "category": "EZ|DAB|KAM", "format": "…", "why": "…",
   "hook": { "say": "…", "see": "…", "txt": "…" },
   "body": [{ "say": "…", "see": "…" }],
   "end": "…", "cta": "…", "caption": "…",
   "shots": [{ "text": "…", "type": "broll|me", "place": "Gym|Kuchyň|Koupelna|Doma|Venku" }]
 }],
 "daily": [{ "date": "RRRR-MM-DD", "title": "…", "how": "…", "format": "EZ s textem", "place": "…" }]
}
```

`id` musí být každý týden nové (začíná datem pondělí). Appka podle něj pozná, co už bylo rozhodnuté.

## Jak psát jako on

Když máš k dispozici jeho scénáře (viz níže), napodob jeho slovník, délku vět a typ hooků.
Jinak: krátce, česky, hovorově, s konkrétními čísly, žádné „v dnešním videu si ukážeme“.

Jeho scénáře a rozhodnutí z minulých týdnů jsou v soukromém gistu. Když je v zadání ID gistu, načti
`https://api.github.com/gists/<ID>` → soubor `studio-data.json` → pole `ideas` (videa se scénáři v `sc`)
a `aiDec` (co u minulých návrhů řekl: `yes` / `no` / `redo` + poznámka). Ber si z toho styl a poučení.
Když gist načíst nejde, pokračuj bez něj.
