// ===== Výchozí knihovna cviků (informace jsou skryté pod „Info o cviku“) =====
const R = (min, max, fail = true) => ({ min, max, fail });
const SEED = [
  // HRUDNÍK
  ['Bench press', 'Hrudník', 'Přední delty, triceps', false, 2.5, [R(4,8), R(6,9)],
    ['Lopatky stáhni k sobě a dolů, drž je tak celou sérii', 'Chodidla pevně v zemi, mírný oblouk v hrudní páteři', 'Osu spouštěj ke spodní části hrudníku, lokty zhruba 45–70° od těla', 'Nahoře nezamykej ramena dopředu, hrudník zůstává vysoko']],
  ['Tlak s jednoručkami na šikmé lavici', 'Horní hrudník', 'Přední delty, triceps', false, 2, [R(4,8), R(6,9)],
    ['Lavice cca 30°, vyšší úhel bere víc ramen', 'Spouštěj do hlubokého protažení hrudníku', 'Lopatky stažené, jednoručky nahoře neťukej o sebe', 'Zápěstí nad lokty']],
  ['Chest press na stroji', 'Hrudník', 'Přední delty, triceps', false, 2.5, [R(4,8), R(6,9)],
    ['Sedák nastav tak, aby rukojeti byly ve výšce střední části hrudníku', 'Lopatky přitisknuté k opěradlu', 'Plný rozsah: hluboké protažení vzadu']],
  ['Rozpažování na kladkách', 'Hrudník', 'Přední delty', false, 1.25, [R(6,10), R(8,12)],
    ['Lokty lehce pokrčené a zamčené v jednom úhlu', 'Pohyb vede z ramene, ne z loktů', 'Vzadu důraz na protažení, vpředu stisk']],
  ['Kliky na bradlech', 'Spodní hrudník', 'Triceps, přední delty', false, 1.25, [R(4,8), R(6,10)],
    ['Mírný předklon = víc hrudníku, vzpřímeně = víc tricepsu', 'Spouštěj do pohodlného protažení ramen, ne přes bolest', 'Ramena drž dole, nekrč je k uším']],
  // ZÁDA
  ['Shyby', 'Široký sval zádový', 'Biceps, zadní delty', false, 1.25, [R(4,8), R(6,10)],
    ['Začni z plného visu s aktivními lopatkami', 'Táhni lokty dolů k bokům', 'Bez švihu, kontrolovaný návrat']],
  ['Stahování kladky', 'Široký sval zádový', 'Biceps, horní záda', false, 2.5, [R(6,10), R(8,12)],
    ['Lehký záklon trupu, hrudník proti ose', 'Táhni lokty dolů a k tělu', 'Nahoře nech lopatky vyjet do protažení']],
  ['Přítahy v předklonu', 'Horní záda', 'Široký sval zádový, zadní delty', false, 2.5, [R(4,8), R(6,10)],
    ['Trup 30–45° nad zemí, neutrální páteř', 'Osa k pupku, lokty podél těla', 'Trup se nesmí zvedat se švihem']],
  ['Přítah jednoruční činky', 'Široký sval zádový', 'Horní záda, biceps', true, 2, [R(6,10), R(8,12)],
    ['Opři se o lavici, páteř neutrální', 'Táhni loket k boku, ne k uchu', 'Dole nech lopatku natáhnout dopředu']],
  ['Přítahy na kladce vsedě', 'Horní záda', 'Široký sval zádový, biceps', false, 2.5, [R(6,10), R(8,12)],
    ['Hrudník vysoko, trup se nekývá', 'Vpředu protažení lopatek, vzadu stisk', 'Úzký úchop = víc latů, široký = víc horních zad']],
  ['Přítahy s oporou hrudníku', 'Horní záda', 'Zadní delty, široký sval zádový', false, 2.5, [R(6,10), R(8,12)],
    ['Hrudník celou dobu přitisknutý k opoře', 'Táhni lokty dozadu a lehce do stran', 'Žádné odrážení od opory']],
  // RAMENA
  ['Tlak nad hlavu', 'Přední delty', 'Boční delty, triceps', false, 2.5, [R(4,8), R(6,9)],
    ['Zpevni zadek a břicho, žádný záklon', 'Osa jde rovně nahoru, hlavu uhni', 'Nahoře hlavu prostrč dopředu pod osu']],
  ['Upažování s jednoručkami', 'Boční delty', 'Trapézy', false, 1, [R(8,12), R(10,15)],
    ['Vede loket, ne ruka', 'Lehký předklon, paže mírně před tělem', 'Bez švihu, kontrolovaná negativní fáze']],
  ['Upažování na kladce', 'Boční delty', 'Trapézy', true, 0.5, [R(8,12), R(10,15)],
    ['Kladka nízko, lano vede za tělem', 'Dole začínej z protažení přes tělo', 'Loket mírně pokrčený a zamčený']],
  ['Zadní delty na stroji', 'Zadní delty', 'Horní záda', false, 1.25, [R(8,12), R(10,15)],
    ['Paže skoro propnuté, tah do stran, ne dozadu', 'Lopatky se nestahují, pracují ramena', 'Krátká pauza v kontrakci']],
  ['Face pull', 'Zadní delty', 'Rotátory, trapézy', false, 1.25, [R(10,15), R(12,15)],
    ['Lano ve výšce očí', 'Táhni k obličeji a rozevři lano do stran', 'Na konci vytoč ruce ven']],
  // PAŽE
  ['Bicepsový zdvih na kladce', 'Biceps', 'Brachialis', false, 0.25, [R(4,8), R(6,9)],
    ['Lokty pevně u těla, nejdou dopředu', 'Plné propnutí dole', 'Nahoře stisk, bez záklonu trupu']],
  ['Bicepsový zdvih s jednoručkami', 'Biceps', 'Brachioradialis', true, 1, [R(6,10), R(8,12)],
    ['Supinuj (vytoč dlaň nahoru) během zvedání', 'Lokty se nehýbou', 'Kontrolovaný návrat do plného propnutí']],
  ['Bayesian curl', 'Biceps (dlouhá hlava)', 'Brachialis', true, 0.5, [R(6,10), R(8,12)],
    ['Stůj zády ke kladce, paže za tělem', 'Využij protažení dole, tam je největší stimul', 'Loket zůstává za tělem']],
  ['Kladivové zdvihy', 'Brachialis', 'Brachioradialis, biceps', false, 1, [R(6,10), R(8,12)],
    ['Neutrální úchop (palce nahoru)', 'Lokty u těla', 'Bez houpání']],
  ['Stahování kladky na triceps', 'Triceps', '–', false, 1.25, [R(6,10), R(8,12)],
    ['Lokty u těla, ramena dole', 'Plné propnutí dole, krátký stisk', 'Nahoře nech loket jít do ohnutí přes 90°']],
  ['Tricepsové extenze nad hlavou', 'Triceps (dlouhá hlava)', '–', false, 1.25, [R(6,10), R(8,12)],
    ['Lokty míří dopředu/nahoru, neroztahuj je', 'Hluboké protažení za hlavou', 'Trup zpevněný, žádný záklon']],
  // NOHY
  ['Dřep', 'Kvadricepsy', 'Hýždě, adduktory', false, 2.5, [R(4,8), R(6,9)],
    ['Nádech do břicha a zpevnit před každým opakováním', 'Kolena jdou ve směru špiček', 'Hloubka podle mobility, páteř neutrální']],
  ['Hack dřep', 'Kvadricepsy', 'Hýždě', false, 2.5, [R(4,8), R(6,10)],
    ['Chodidla níž na plotně = víc kvadricepsů', 'Jdi hluboko, kolena můžou přes špičky', 'Záda celou dobu u opěry']],
  ['Leg press', 'Kvadricepsy', 'Hýždě, adduktory', false, 1, [R(4,8), R(6,10)],
    ['Bedra nesmí odlepit od opěry (to je tvůj spodní limit)', 'Nahoře nezamykej kolena natvrdo', 'Postavení chodidel drž stejné, ať je progres porovnatelný']],
  ['Bulharský dřep', 'Kvadricepsy', 'Hýždě', true, 1, [R(6,10), R(8,12)],
    ['Delší krok a předklon = víc hýždí, kratší a vzpřímeně = víc kvadricepsů', 'Váha na přední noze', 'Začni slabší (levou) nohou']],
  ['Rumunský mrtvý tah', 'Hamstringy', 'Hýždě, vzpřimovače', false, 2.5, [R(4,8), R(6,10)],
    ['Pohyb jde z kyčlí dozadu, kolena lehce pokrčená', 'Osa těsně u nohou', 'Spouštěj, dokud držíš neutrální páteř']],
  ['Mrtvý tah', 'Hýždě, hamstringy', 'Záda, trapézy', false, 2.5, [R(3,6), R(5,8)],
    ['Osa nad středem chodidla', 'Napni lats a „vytáhni vůli“ z osy před startem', 'Tlač podlahu nohama, nezvedej zadek dřív než ramena']],
  ['Předkopávání', 'Kvadricepsy', '–', false, 1.25, [R(6,10), R(8,12)],
    ['Opěradlo spíš vzad (víc protažení přímého svalu stehna)', 'Nahoře krátký stisk', 'Kontrolovaný návrat']],
  ['Zakopávání vsedě', 'Hamstringy', 'Lýtka', false, 1.25, [R(6,10), R(8,12)],
    ['Lehký předklon trupu zvyšuje protažení', 'Stehna pevně pod polštářem', 'Plný rozsah, žádné cukání']],
  ['Hip thrust', 'Hýždě', 'Hamstringy', false, 2.5, [R(6,10), R(8,12)],
    ['Brada ke hrudníku, žebra dolů', 'Nahoře zpevni hýždě, nezaklánět bedra', 'Holeně kolmo k zemi v horní pozici']],
  ['Lýtka ve stoje', 'Lýtka', '–', false, 2.5, [R(6,10), R(8,12)],
    ['Dole pauza 1–2 s v protažení', 'Nahoře maximálně na špičky', 'Kolena propnutá, bez pérování']],
  ['Adduktory na stroji', 'Adduktory', '–', false, 2.5, [R(8,12), R(10,15)],
    ['Začni z maximálního protažení, které zvládneš', 'Trup lehce v předklonu', 'Kontrola v obou fázích']],
  // BŘICHO
  ['Zkracovačky na kladce', 'Břicho', '–', false, 2.5, [R(8,12), R(10,15)],
    ['Stáčej páteř (žebra k pánvi), neohýbej se v kyčlích', 'Zadek drž na patách', 'Výdech při kontrakci']],
  ['Zvedání nohou ve visu', 'Břicho', 'Flexory kyčle', false, 1, [R(8,12), R(10,15)],
    ['Podsaď pánev nahoru, nejen zvedni nohy', 'Bez houpání', 'Pomalý návrat dolů']],
];

const ACT_TYPES = {
  sauna:  { name: 'Sauna',      cls: 'heat', icon: 'flame' },
  cold:   { name: 'Otužování',  cls: 'cold', icon: 'snow' },
  thai:   { name: 'Thai box',   cls: 'act',  icon: 'glove' },
  yoga:   { name: 'Jóga',       cls: 'act',  icon: 'lotus' },
  stretch:{ name: 'Strečink',   cls: 'act',  icon: 'plus' },
  bike:   { name: 'Kolo / rotoped', cls: 'act', icon: 'bike' },
  run:    { name: 'Běh',        cls: 'act',  icon: 'plus' },
  swim:   { name: 'Plavání',    cls: 'act',  icon: 'plus' },
  climb:  { name: 'Lezení',     cls: 'act',  icon: 'plus', extra: 1 },
  xcski:  { name: 'Běžkování',  cls: 'act',  icon: 'plus', extra: 1 },
  sprint: { name: 'Sprint',     cls: 'act',  icon: 'plus', extra: 1 },
  posing: { name: 'Posing',     cls: 'act',  icon: 'plus', extra: 1 },
  other:  { name: 'Jiné',       cls: 'act',  icon: 'plus', extra: 1 },
};

const IC = {
  dumbbell:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  ruler:'<path d="M4 16 16 4l4 4L8 20z"/><path d="m8 12 2 2M11 9l2 2M14 6l2 2"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  cal:'<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  chart:'<path d="M3 20h18M6 16l4-5 3 3 5-7"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  back:'<path d="m15 18-6-6 6-6"/>',
  chev:'<path d="m9 18 6-6-6-6"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  share:'<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
  check:'<path d="m5 12 5 5 9-10"/>',
  flame:'<path d="M12 21c-3.9 0-7-2.8-7-6.6 0-3 1.9-5 3.6-6.8C10 6.2 11 4.6 11 3c3 1.6 4.5 4.3 4.3 6.8 1-.5 1.8-1.5 2.1-2.7C19 8.8 19 11 19 14.4 19 18.2 15.9 21 12 21z"/><path d="M12 21c-1.7 0-3-1.3-3-3 0-1.8 1.4-2.8 2.2-4 .9 1 3.8 2.2 3.8 4 0 1.7-1.3 3-3 3z"/>',
  snow:'<path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11"/><path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2M3.4 10l3.2-.4-.9-3M20.6 14l-3.2.4.9 3M3.4 14l3.2.4-.9 3M20.6 10l-3.2-.4.9-3"/>',
  glove:'<path d="M7 11V7a5 5 0 0 1 10 0v5a6 6 0 0 1-6 6H9a2 2 0 0 1-2-2z"/><path d="M7 11a2.5 2.5 0 0 1 0 5M7 18v3h8v-3M12 7h5"/>',
  lotus:'<path d="M12 20c-4 0-8-2-9-6 3-1 6 0 9 3 3-3 6-4 9-3-1 4-5 6-9 6z"/><path d="M12 17c-2-2-3-5-3-8 1-2 2-3 3-5 1 2 2 3 3 5 0 3-1 6-3 8z"/>',
  bike:'<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17 9 9h6l3.5 8M9 9 12 17h1.5M15 9l-1-3h-2"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  sick:'<path d="M12 3a4 4 0 0 1 4 4v7a4 4 0 1 1-8 0V7a4 4 0 0 1 4-4z"/><path d="M12 10v7"/>',
};
Object.assign(IC, {
  play:'<path d="M7 4.5v15l12-7.5z"/>',
  timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5"/>',
  bars:'<path d="M6 20v-8M12 20V5M18 20v-5"/>',
  medal:'<circle cx="12" cy="15" r="5.5"/><path d="m8.5 3 1.8 7M15.5 3l-1.8 7M8 3h8"/>',
  weight:'<path d="M9 8a3 3 0 1 1 6 0"/><path d="M5.5 8h13L20 20H4z"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  arm:'<path d="M5 20c-.5-5 1-10 3.5-13.5L11 7l-.5 3.5 2 .8c2.3-1.8 6.3-1.3 7.5 1.7.8 2.2-.4 5.2-3 7z"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  chevd:'<path d="m6 9 6 6 6-6"/>',
  plate:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21"/>',
});
const FEEL = [
  ['Špatný', '<path d="M2 3.5h4v10H2zM8 3.5h9.6a2 2 0 0 1 2 1.6l1.4 7a2 2 0 0 1-2 2.4h-5.2l1 4.3a1.9 1.9 0 0 1-3.4 1.4L8 14z"/>'],
  ['Únava', '<path d="M11.5 4.2A8.3 8.3 0 1 0 20 13.6a6.8 6.8 0 0 1-8.5-9.4z"/><path d="M14.4 2h4.4v1.3l-2.7 3h2.8V7.6h-4.6V6.3l2.7-3h-2.6zM19.3 7.6h3v1l-1.7 2h1.8v1.1h-3.2v-1l1.7-2h-1.6z"/>'],
  ['Dobrý', '<path d="M2 10.5h4v10H2zM8 20.5h9.6a2 2 0 0 0 2-1.6l1.4-7a2 2 0 0 0-2-2.4h-5.2l1-4.3a1.9 1.9 0 0 0-3.4-1.4L8 10z"/>'],
  ['Výborný', '<path fill-rule="evenodd" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zM8.6 8.2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zm6.8 0a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM7 13.6a5 5 0 0 0 10 0z"/>'],
];
const ico = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

// ---------- piktogramy sportů v2: plné siluety (vlastní kresba, 24×24) ----------
// s = tahy [cesta, tloušťka], c = hlavy/kruhy [x, y, r], f = plné tvary
const PICTO = {
  gym: { c: [[12, 7.1, 2]], f: ['M2.6 1.2h2.2v4.6H2.6zM19.2 1.2h2.2v4.6h-2.2z'], s: [['M4.6 3.5H19.4', 1.3], ['M12 9.6V15', 3.4], ['M12 10.2L9.2 6.9L8.7 3.6M12 10.2L14.8 6.9L15.3 3.6', 2], ['M12 15L9.6 18.6L9.1 22M12 15L14.4 18.6L14.9 22', 2.5]] },
  sauna: { c: [[7.6, 5.4, 1.9]], f: ['M2.6 15.2h11v1.6h-11zM3.6 16.8h1.4V21H3.6zM11.2 16.8h1.4V21h-1.4z'], s: [['M8.1 8L9.2 13.6', 3.2], ['M9.2 13.8H14.4V20.6', 2.5], ['M8.8 9.8L11.8 12.6', 1.9], ['M16.6 3C15.7 4.2 17.5 5.1 16.6 6.4M19.4 2.4C18.5 3.6 20.3 4.5 19.4 5.8M22 3.4C21.3 4.3 22.6 5 22 6', 1.2]] },
  cold: { c: [[8.2, 8.6, 2]], f: ['M2.2 12.6H21.8V14.8A4.7 4.7 0 0 1 17.1 19.5H6.9A4.7 4.7 0 0 1 2.2 14.8Z'], s: [['M8.6 11.2L13.2 12.2', 3.2], ['M10.6 11.6L16 10.4', 1.8], ['M6.4 19.4L5.4 21.6M17.6 19.4L18.6 21.6', 1.6], ['M19.5 2.2V7.8M17 3.6L22 6.4M17 6.4L22 3.6', 1.2]] },
  thai: { c: [[8.6, 4.2, 2]], f: [], s: [['M9.2 6.8L10.4 13.4', 3.4], ['M9.8 8.6L14.6 8.2L18.6 7.6', 2], ['M9.6 9L7 10.6L6.8 8.2', 2], ['M10.4 13.4L7.2 17.4L6.2 21.6M10.4 13.4L13.8 17.2L15.4 21.6', 2.5]], c2: [[20.2, 7.4, 1.8], [6.6, 7.2, 1.6]] },
  yoga: { c: [[12, 5.4, 1.8]], f: [], s: [['M12 7.8V13.4', 3.2], ['M12 8.4L9.4 5L8.6 1.6M12 8.4L14.6 5L15.4 1.6', 1.9], ['M12 13.4V22', 2.5], ['M12 13.8L15.8 16.2L12.4 18.2', 2.2], ['M9.6 22H14.4', 1.6]] },
  bike: { c: [[15.4, 4.4, 1.9]], f: [], s: [['M5.6 17.6m-3.6 0a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0M18.4 17.6m-3.6 0a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0', 1.5], ['M5.6 17.6L9 11.8H16L18.4 17.6M9 11.8L12 17.6L16 11.8M16 11.8L17 9.8', 1.4], ['M14.2 6.8L9.6 10.6', 3.2], ['M13.8 7.6L16.8 10.2', 1.8], ['M9.6 10.8L12.8 13.4L11.8 17.2', 2.3]] },
  run: { c: [[14.6, 3.6, 1.9]], f: [], s: [['M14 6.2L11.4 12.4', 3.2], ['M13.6 7.6L17 9.6L19.2 8.2M13 7.6L10 9.4L7.8 8.6', 1.9], ['M11.4 12.4L15.4 15.4L15 20.6M11.4 12.4L9 16.4L4.6 17.6', 2.5]] },
  swim: { c: [[5.8, 8.4, 1.9]], f: [], s: [['M8.4 10.2L16.4 11.2', 3.2], ['M9.2 9.6L12.4 5.6L16.6 6.2', 1.9], ['M16.4 11.2L21.4 10.4', 2.4], ['M2 15.6c1.7-1.2 3.3 1.2 5 0s3.3 1.2 5 0 3.3 1.2 5 0 3.3 1.2 5 0M2 19.6c1.7-1.2 3.3 1.2 5 0s3.3 1.2 5 0 3.3 1.2 5 0 3.3 1.2 5 0', 1.3]] },
  stretch: { c: [[15, 4.6, 1.9]], f: [], s: [['M12 13L13.9 7.2', 3.2], ['M13.6 7.8L10.6 4.6L7.4 3.4', 1.9], ['M13 9.2L15.6 10.9L13.3 12.5', 1.9], ['M12 13L9.6 21.6M12 13L15 21.6', 2.5]] },
  climb: { c: [[11, 6.2, 1.9], [16.2, 2.2, 1.1], [7.2, 7.4, 1.1], [15.8, 20.8, 1], [19.6, 11.2, 1], [4.6, 15.2, 1]], f: [], s: [['M11.4 8.6L12.4 14', 3.2], ['M11.6 9L14.6 6L15.8 2.8', 1.9], ['M11.2 9.4L8.4 11L7.6 7.9', 1.9], ['M12.4 14L15.6 16L15.2 20.4M12.4 14L9.6 17.4L10.4 21.6', 2.5]] },
  xcski: { c: [[14.6, 4, 1.9]], f: [], s: [['M13.6 6.6L10.6 12.4', 3.2], ['M13.2 7.6L16.4 10M12.6 7.8L9.4 8.6L7.2 7.6', 1.9], ['M16.4 10L14.8 20.2M7.2 7.6L4.4 19', 1.1], ['M10.6 12.4L14.4 15.6L15 20.2M10.6 12.4L8.4 16.4L5.6 19.2', 2.5], ['M1.8 20.4H11M10.2 21.4H21.8', 1.4]] },
  sprint: { c: [[16.4, 4.4, 1.9]], f: [], s: [['M15.2 6.8L11.4 11.8', 3.2], ['M14.8 8L18.2 9.2L20 7M14.2 8.2L11 9.6L8.6 8', 1.9], ['M11.4 11.8L15.6 14.6L17.2 19.4M11.4 11.8L8.4 15L4.2 15.4', 2.5], ['M1.4 6H5.4M1 9.4H4.4M2 12.6H5', 1.2]] },
  posing: { c: [[12, 4, 2], [6.4, 3.9, 1.5], [17.6, 3.9, 1.5]], f: [], s: [['M12 6.6V13.6', 3.8], ['M12 7.6L7.4 8L6.4 4.4M12 7.6L16.6 8L17.6 4.4', 2.4], ['M12 13.6L9.4 17.6L9.6 22M12 13.6L14.6 17.6L14.4 22', 2.6]] },
  other: { c: [], f: ['M12 2.2l2.9 6.2 6.8.8-5 4.6 1.4 6.7L12 17.1 5.9 20.5l1.4-6.7-5-4.6 6.8-.8z'], s: [] },
};
function pmarkup(k) {
  const p = PICTO[k] || PICTO.other;
  return `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${p.s.map(([d, w]) => `<path d="${d}" stroke-width="${w}"/>`).join('')}</g>`
    + `<g fill="currentColor" stroke="none">${[...p.c, ...(p.c2 || [])].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}${(p.f || []).map(d => `<path d="${d}"/>`).join('')}</g>`;
}
const pico = (k, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${pmarkup(k)}</svg>`;

for (const k in PICTO) IC['p_' + k] = pmarkup(k);
for (const k in ACT_TYPES) ACT_TYPES[k].icon = 'p_' + (PICTO[k] ? k : 'other');

function actGrid(attrs = '') {
  const tile = ([k, t]) => `<button class="at ${t.cls}" data-a="act-new" data-t="${k}" ${attrs}><span class="ic">${ico(t.icon)}</span>${t.name}</button>`;
  const E = Object.entries(ACT_TYPES), main = E.filter(([, t]) => !t.extra), more = E.filter(([, t]) => t.extra);
  return `<div class="agrid">${main.map(tile).join('')}<button class="at more" data-a="act-more" aria-expanded="false"><span class="ic">${ico('more')}</span>Další</button></div>
    <div class="agrid amore" hidden>${more.map(tile).join('')}</div>`;
}
