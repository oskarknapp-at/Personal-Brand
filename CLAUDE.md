# CLAUDE.md

Orientierung für Claude Code. Ziel: Struktur kennen, ohne alle Dateien neu zu scannen.

> **Zuerst lesen:** Aktueller Stand, offene Punkte und was schon erledigt ist stehen
> unten im Abschnitt **„Arbeitsprotokoll"**. Das spart erneutes Durchscannen des Repos.
> **Pflicht:** Diesen Abschnitt nach jeder erledigten Aufgabe aktualisieren.

## Was das ist
Statische **Ein-Seiten-Portfolio-Website** (Oskar Knapp, Videograf). Live: `okmedia.at`.
Kein Framework, kein Build-Step, kein `package.json`. Reines HTML/CSS/Vanilla-JS.

## Stack & harte Regeln
- **Vanilla JS**, ES-Module. Einzige externe Lib: **anime.js v4** – wird in `main.js` per
  dynamischem Import vom CDN geladen (`if (!reducedMotion)`). Fällt das CDN aus, läuft alles ohne Animation.
- **Progressive Enhancement ist Pflicht:** Ohne JS muss die Seite komplett lesbar sein und das
  Formular klassisch per POST senden. Startzustände von Animationen werden erst in JS gesetzt
  (`utils.set`), nie im CSS versteckt.
- **DSGVO:** YouTube lädt erst **nach Klick** und nur über `youtube-nocookie.com`. Keine Tracker,
  keine externen Requests beim Seitenaufbau (Schriften & Icons sind selbst gehostet / Daten-URIs).
- Schriften selbst gehostet in `assets/fonts/` (Archivo variable, IBM Plex Mono 400/500/600).
- **three.js (seit V3.5) ist selbst gehostet**, kein CDN: `assets/vendor/three-drohne.min.js` ist ein
  einmalig gebautes Bündel (s. „3D-Drohne"). Es wird **nur** von `setupDrone()` nachgeladen, nie
  beim Seitenaufbau, nie am Handy, nie bei `prefers-reduced-motion`.
- **Alle Animationen ≤ 600 ms.**
- **⚠️ KEIN KOMMENTAR IM AUSGELIEFERTEN CODE (PFLICHT):** `index.html`, `impressum/index.html`,
  `datenschutz/index.html`, `main.js`, `style.css` bleiben **komplett kommentarfrei** — kein
  `<!-- … -->`, kein `/* … */`, kein `//`. **Jede** Erklärung, Begründung oder Notiz gehört in
  **diese CLAUDE.md** (Abschnitt „Code-Notizen" für dauerhaftes Wissen, „Arbeitsprotokoll" für den
  Verlauf), niemals in den Quelltext. Betrifft auch TODOs und Platzhalter-Hinweise → als „Offene
  Punkte" hier führen, nicht als Kommentar im Code.
- **⚠️ VERSION — BEI JEDEM DEPLOY PFLICHT (EINE Zahl `N`, überall gleich):** Bei **jeder**
  Änderung, die live geht, `N` um **0.1** erhöhen (Schema seit 2026-07-25: `3.0` → `3.1` → … →
  `3.9` → `4.0`) und **in allen drei** HTML-Dateien
  (`index.html`, `impressum/index.html`, `datenschutz/index.html`) an **beiden** Stellen setzen:
  1. **Cache-Buster** `style.css?v=N` / `main.js?v=N` (zwingt Browser, neue Dateien zu laden).
  2. **Sichtbare Footer-Version** `<span>SCHNITT: ENDE / VN</span>` — dient dem Betreiber als
     **Deploy-Marker**: Er sieht an der Live-Seite sofort, welche Version online ist, und kann
     bestätigen, dass sein Stand mit dem besprochenen übereinstimmt.
  Beide Zahlen sind **immer identisch**. Wird das vergessen, sehen wiederkehrende Besucher die
  alte gecachte Version, und der Betreiber kann den Live-Stand nicht mehr verlässlich ablesen.
  Details unter „Konventionen".
- **Kein Gewerbe angemeldet:** Es dürfen derzeit **keine kommerziellen Angebote** auf der Seite
  stehen — weder sichtbar noch als HTML-Kommentar noch in Meta-/Schema.org-Daten. Ausgebaute
  Inhalte stehen unten unter „Ausgeblendete Inhalte" und werden nach Gewerbeanmeldung reaktiviert.

## Dateien
| Datei | Inhalt |
|---|---|
| `index.html` | Die gesamte Seite. Szenen: 01 Hero, 02 Fotografie, 03 Drohne, 04 About, 05 Kontakt. (Projekte-Szene, Journey, „Zusammenarbeit" + Projekte 3/4 ausgebaut, s. „Ausgeblendete Inhalte".) |
| `main.js` | Gesamtes Verhalten, in nummerierte Abschnitte (1–6) gegliedert – siehe unten. |
| `style.css` | Gesamtes Styling. Abschnitte per `/* ---------- … ---------- */`. Design-Tokens in `:root`. |
| `impressum/`, `datenschutz/` | Rechtstexte, eigene `index.html`, teilen sich `../style.css`. |
| `assets/` | Fotos, `fonts/`, `drohne/` (Standbild als WebP in 480/960/1600 und `mavic-3-classic.glb`), `vendor/` (three.js-Bündel, einzige Datei mit Lizenz-Kommentar, s. „3D-Drohne"). |
| `robots.txt`, `sitemap.xml` | SEO. |
| `.github/workflows/static.yml` | Deploy (s. u.). |

## main.js – Abschnitte (Funktion → Zweck)
Alle `setup*()` werden am Dateiende aufgerufen; `initMotion()` nur bei erwünschter Bewegung.
1. `setupAge()` – Alter aus Geburtsdatum (27.08.2010), füllt `[data-age]`.
2. `onScrollRatio()` + `setupScroll()` – **eine** gemeinsame Scroll-Quelle (rAF-gedrosselt, Wert 0 bis 1).
   Balken, Akku im Sucher und Filmkamera melden sich mit `onScrollRatio(fn)` an. `setupScroll()`
   wird als **letztes** `setup*()` aufgerufen, damit alle Abnehmer schon angemeldet sind.
   `setupProgress()` – roter Scroll-Fortschrittsbalken oben (am Desktop mit Filmkamera per CSS aus).
   2b. `setupBurger()` – Mobile-Burger-Menü (≤ 800px).
3. `loadYouTubeApi()` + `setupEmbeds()` – Klick-zu-Laden-YouTube via **IFrame-Player-API**,
   `onReady → playVideo()`. Ladezustand („LÄDT …", Thumbnail bleibt), 10-s-Timeout-Fallback.
   Platzhalter-IDs (`DEINE_…`) zeigen „VIDEO FOLGT".
   3b. `setupGallery()` – justiertes Reihen-Layout, Fotos werden nicht beschnitten.
4. `setupForm()` – Kontaktformular via **Web3Forms** (`fetch` auf `api.web3forms.com/submit`),
   ohne Reload. `access_key` steht als hidden input in `index.html` (öffentlich, kein Secret).
   4b. `setupEmailCheck()` + `editDistance()` / `suggestDomain()` / `emailProblem()` – Live-Prüfung
   des E-Mail-Feldes (grüner Haken / roter Hinweis / Tippfehler-Vorschlag), s. „Code-Notizen".
   4c. `CLAPPER` – SVG-Klappe, die `setupForm()` nach erfolgreichem Versand in die Statuszeile setzt.
5. `tcToFrames(tc, fps)` / `framesToTc(total, fps)` – Timecode-Hilfen, Format `HH:MM:SS:FF`. `fps` ist
   Parameter, Standard `FPS = 25` (echte Framerate von `show_reel.mp4`, s. „Code-Notizen").
6. `initMotion({…anime})` – alle Animationen (Hero-Timeline, Szenentitel, Timecode-Counter,
   generische `[data-animate]`-Reveals per `onScroll`).

7. `setupHeroVideo()` – Showreel, bei reduced motion angehalten.
8. `setupViewfinder()` – Sucher-Overlay im Hero (`VIEWFINDER`-Markup, Live-Timecode, REC, Akku).
9. `setupReel()` – Filmkamera am linken Rand als Scroll-Fortschritt mit Szenen-Markern (`REEL`-Markup).
10. `setupDrone()` + `startDrone()` – lädt three.js und das GLB erst in der Nähe der Drohnen-Szene
    und steuert Ausklappen, Propeller, Neigung und Schweben.

## Von JS erzeugte Elemente (stehen nicht im HTML)
Ohne JS gibt es keines davon, deshalb auch keine toten Elemente: `.vf` (Sucher, in `.hero-frame`),
`.reel` (Filmkamera, am Ende von `<body>`, dazu Klasse `has-reel` auf `<html>`), `.clapper` (Klappe
in `.form-status`), `.drone-canvas` (in `.drone-stage`, dazu Klasse `is-live`), `.field-check`.

## JS-Hooks (data-Attribute in HTML)
`data-age`, `data-split` (Text→Buchstaben), `data-tc` (Timecode), `data-yt` (YouTube-ID), `data-animate` (Scroll-Reveal).

## Design-Tokens (`:root` in style.css)
`--paper #FAF7F1`, `--ink #1C1B19`, `--red #E63321` (einzige Akzentfarbe im Layout),
`--green #2F6B46` (**nur** Statusfarbe der Formularprüfung, nie dekorativ), `--mono` (IBM Plex Mono),
`--display` (Archivo), `--gutter` (Seitenränder). Rot sparsam einsetzen.

## Konventionen
- **Version `N` (JEDES MAL beim Deploy!):** Es gibt **eine** Versionszahl, die an drei Stellen pro
  HTML-Datei steht und **immer identisch** ist. **Schema seit 2026-07-25 (Betreiber-Vorgabe):
  Schritte von 0.1** — die alte ganzzahlige V29 wurde als **V2.9** gelesen, danach `3.0`, `3.1`,
  `3.2` usw.; nach `3.9` kommt `4.0`. Der Cache-Buster trägt dieselbe Zahl (`?v=3.0`).
  - Cache-Buster: `style.css?v=N`, `main.js?v=N` (im `<head>`).
  - Sichtbare Footer-Version: `<span>SCHNITT: ENDE / VN</span>` (Deploy-Marker für den Betreiber).
  Bei **jeder** Änderung, die live geht, `N` in **allen drei** HTML-Dateien (`index.html`,
  `impressum/`, `datenschutz/`) um 1 erhöhen — auch bei reinen HTML-Änderungen, damit der sichtbare
  Marker mitwandert und Betreiber + Claude denselben Stand ablesen. **Aktuell `N=3.4` (V3.4 / `v=3.4`).**
- Kommentare & Commit-/PR-Sprache: **Deutsch** (wie im bestehenden Code).
- Neue Videos: echte 11-stellige YouTube-ID in `data-yt` eintragen, `DEINE_YOUTUBE_ID` ersetzen.

## Deployment
GitHub Pages via `.github/workflows/static.yml`: Push auf **`main`** deployt das **gesamte Repo**
(kein Build). Andere Branches deployen nicht – erst nach Merge in `main` ist etwas live.

- **⚠️ IMMER GLEICH MERGEN (Betreiber-Regel, 2026-07-24):** Nach einer fertigen, verifizierten
  Änderung **nicht** nachfragen, ob gemergt werden soll — Arbeit auf den Feature-Branch committen +
  pushen, **PR öffnen und sofort selbst mergen** (Squash in `main`), damit es live geht. Der
  Betreiber will nicht jedes Mal einzeln zustimmen. Danach kurz den Deploy-Workflow auf `main`
  prüfen (`success`) und den Live-Stand melden. Ausnahme: nur bei echten Unklarheiten/riskanten
  Änderungen vorher fragen.

## Verifizieren (kein Test-Framework vorhanden)
- Syntax: `node --check main.js`
- Lokal ansehen: beliebiger Static-Server im Repo-Root (z. B. `python3 -m http.server`), dann Browser.
- Für JS-Verhalten (z. B. Embeds) eignet sich Playwright mit dem vorinstallierten Chromium
  (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`); externe Hosts wie youtube.com sind in der
  Sandbox nicht erreichbar → im Test mocken (`page.route`).

---

## Code-Notizen (nicht-offensichtliche Entscheidungen)

Da der Quelltext **kommentarfrei** ist (s. „harte Regeln"), stehen die nicht-offensichtlichen
Begründungen hier. Ergänzen, wenn eine Entscheidung sonst nur aus dem Code erschließbar wäre.

- **Kein `viewport-fit=cover`** im `<meta viewport>`: bewusst weggelassen, sonst malt iOS Safari den
  Statusleisten-/Notch-Streifen hinter die Nav. Der deckende Papier-Grund von `.site-nav`
  (`::before` mit `height: 100vh`) und `.progress` deckt den Bereich oberhalb des Viewports ab.
- **YouTube-Autoplay nach Klick** (`setupEmbeds` → `onReady → playVideo()`): Chrome/Firefox/Edge
  starten direkt mit Ton. **Safari blockiert nachgeladenes Autoplay grundsätzlich** → dort zeigt der
  Player seinen eigenen Play-Button, erst der Klick darauf startet mit Ton. Kein Bug. 10-s-Timeout
  setzt den Embed zurück, falls die API nicht erreichbar ist (Blocker/Netz weg).
- **Untertitel bleiben aus (seit V3.3), zwei Stufen:** `playerVars.cc_load_policy: 0` **und** im
  `onReady` `unloadModule("captions")` + `unloadModule("cc")` vor `playVideo()`. Beides ist nötig:
  `cc_load_policy: 0` ist von YouTube **nicht dokumentiert** (offiziell existiert nur `1` = CC
  erzwingen) und wird nicht in jedem Fall respektiert, `unloadModule` wirkt dagegen zuverlässig,
  greift aber erst nach dem Laden. Ohne beides entscheidet YouTubes Default „Nutzerpräferenz" —
  Auslöser sind Browser-/OS-Bedienungshilfen („Untertitel bevorzugen"), eine früher im Player
  gesetzte CC-Präferenz (auch `youtube-nocookie.com` legt `yt-player-*` im localStorage ab) oder
  automatische Untertitel. Deshalb sah man es nur auf manchen Geräten. Der CC-Button im Player
  bleibt nutzbar, Untertitel sind nur nicht mehr **vorab** an. `unloadModule` ist per `typeof`
  abgesichert, falls die API-Version die Methode nicht kennt.
- **Formular-Honeypot** (`setupForm`): verstecktes, leer erwartetes Feld gegen Spam-Bots. Der
  Web3Forms-`access_key` ist ein **öffentlicher** Schlüssel und darf im Client-HTML stehen.
- **E-Mail-Live-Prüfung (`setupEmailCheck`) — Timing ist der Kern:** Regel „**Lob sofort, Kritik erst
  wenn der Nutzer fertig ist**". Solange das Feld noch nie verlassen wurde (`touched === false`),
  kann **nur** der grüne Haken erscheinen (350 ms nach dem letzten Tastendruck, sonst flackert es
  beim Tippen) — nie Rot. Erst ein `blur` mit ungültigem Inhalt schaltet `touched` auf `true`; ab
  dann läuft die Prüfung ohne Verzögerung bei jedem Tastendruck, damit Rot in dem Moment verschwindet,
  in dem die Adresse stimmt. Leeres Feld = immer neutral. Bewusst **kein** CSS `:invalid`, sonst
  leuchtet das leere Feld schon beim Laden rot.
- **Warum eigene Regex statt `input.validity`:** `type="email"` lässt `oskar@a` durch (keine
  Endung gefordert). `EMAIL_PATTERN` verlangt zusätzlich einen Punkt und ≥ 2 Buchstaben TLD.
  Die native Prüfung bleibt trotzdem aktiv (`required`/`type`), sie läuft **vor** dem
  `submit`-Event — deshalb muss `setupForm()` den Leer-Fall nicht selbst abfangen.
- **Tippfehler-Vorschlag (`suggestDomain`)** vergleicht Domain-Name und TLD **getrennt** per
  Levenshtein statt die ganze Domain: Name gleich → TLD-Abstand 1 (`gmail.co` → `gmail.com`),
  TLD gleich → Namensabstand ≤ 2, bei kurzen Namen (≤ 4 Zeichen) nur 1. Der Kurz-Namen-Sonderfall
  verhindert Fehlalarme wie `orf.at` → `aon.at` (Abstand 2); die Trennung verhindert `web.at` →
  `web.de`. Nur MX-freie Heuristik — **ob die Adresse existiert, kann die Seite nicht wissen**
  (ein DNS/MX-Lookup wäre ein externer Request beim Tippen → DSGVO-Bruch). Blockiert nie das
  Absenden, der Haken bleibt grün.
- **Zwei Textsorten im Formular, bewusst unterschiedlich (seit V3.0):** Die Hinweise **unter dem
  Feld** (`emailProblem()`) sind schlichte Sätze **ohne Slug-Präfix** („Das @-Zeichen fehlt.") —
  das frühere „FEHLT / …" klang wie eine Fehlermeldung aus dem Maschinenraum. Die Zeile
  `.form-status` **unter dem Button** behält das Präfix (`GESENDET / …`, `FEHLER / …`,
  `PRÜFEN / …`), weil sie zur Drehbuch-Typo der Seite gehört und dort schon immer so aussah.
- **Statusfarbe Grün:** bricht bewusst die „Rot ist die einzige Akzentfarbe"-Regel — „grün = passt"
  ist die Konvention, die jeder sofort liest. `#2F6B46` ist gedeckt und mit 5,9:1 auf dem Papierton
  AA-konform (derselbe Ton wie der frühere Zeichenzähler aus V26).
- **Icon wird in JS injiziert** (`CHECK_ICON` per `insertAdjacentHTML`), nicht ins HTML geschrieben:
  Ohne JS gäbe es sonst ein totes Icon im Formular. Ein SVG, zwei Zustände — `.check-mark` bzw.
  `.check-bang`/`.check-dot` werden per `display` getauscht, der Haken zeichnet sich über
  `stroke-dasharray`/`stroke-dashoffset` in 260 ms selbst (reines CSS, **kein anime.js nötig** →
  funktioniert auch bei CDN-Ausfall; bei `prefers-reduced-motion` steht er sofort da).
- **Szenenkopf bleibt auf dem Handy einzeilig (seit V3.1):** Slug und Timecode dürfen nie
  untereinander rutschen. Deshalb im `≤800px`-Block `flex-wrap: nowrap` + `white-space: nowrap` und
  eine **rechnende** Schriftgröße:
  `clamp(0.52rem, calc((100vw - 2 * var(--gutter) - 1.6rem) / 33), 0.72rem)`.
  Der Teiler **33** ist gemessen, nicht geschätzt: IBM Plex Mono rendert hier **0,691 em pro
  Zeichen** (Vorschub + `letter-spacing: 0.04em`), der längste Kopf („SZENE 01 / EXT. MOSTVIERTEL /
  TAG" + „TC 00:00:00:00" = 47 Zeichen) braucht damit ~32,5 em; `1.6rem` deckt Mindestabstand plus
  Reserve. **Wird ein Slug länger als 33 Zeichen, muss der Teiler mitwachsen** — sonst läuft die
  Zeile über. Ab ~430 px Viewport greift die Obergrenze, dort steht wieder die Desktop-Größe
  0.72 rem; die Untergrenze 0.52 rem wirkt erst unter ~330 px (iPhone SE 1. Gen).
- **Framerate 25 statt 24 (seit V3.5):** `ffprobe` meldet für `assets/show_reel.mp4` `25/1` fps
  (772 Frames, 30,88 s). `FPS = 25` ist der Standardwert beider Timecode-Helfer, die Framerate ist
  aber Parameter. Die Deko-Timecodes in den Szenenköpfen mussten **nicht** angepasst werden: Ihre
  Frame-Stellen (00, 00, 10, 16, 12) liegen unter 25 und sind damit gültig. **Neue Deko-Timecodes
  brauchen eine Frame-Stelle von 00 bis 24.**
- **Live-Timecode im Sucher läuft über `requestAnimationFrame` + `video.currentTime`, bewusst
  nicht über `requestVideoFrameCallback`:** Der Frame-Callback liefert die Zeit des zuletzt
  gezeigten Frames und hinkt `currentTime` im Test bis zu 1,3 Frames hinterher. Mit
  `Math.floor(currentTime * 25)` im selben Bild liegt die Abweichung gemessen zwischen 0 und 1 Frame.
  Die Schleife läuft nur, solange das Video spielt **und** der Hero im Bild ist
  (`IntersectionObserver`), sonst wird einmal gezeichnet und gestoppt.
- **REC-Punkt blinkt aus der Videozeit** (`currentTime % 1 < 0.5`), nicht per CSS-Animation. Steht
  das Video (reduced motion), steht der Punkt. So gibt es keine Endlosschleife ohne Grund.
- **Sucher-Werte** (`4K 25p`, `S-Log3`, `ISO 800`, `180.0°`) entsprechen dem echten Setup (a6700,
  untere Basis-ISO in S-Log3, 1/50 bei 25p). **Keine Marke, kein Kameraname, kein Logo** im Overlay.
  Die untere Zeile steht rechts, weil die Statement-Box den Rahmen unten links überlappt. Am Handy
  (≤ 800 px) ist `.vf-extra` aus, es bleiben REC, Timecode, Akku. Akku: 100 % oben, 15 % am
  Seitenende, ab 20 % rot.
- **Filmkamera und linke Schiene (`.has-reel`, ab 1100 px Breite und 560 px Höhe):** Der linke Rand
  ist ohne Eingriff bei 1280 px nur 51 px breit, die Kamera braucht 104 px (`--rail: 6.5rem`).
  `--edge: max(var(--gutter), calc(var(--rail) - max(0px, (100vw - 90rem) / 2)))` schiebt Nav,
  Szenen und Footer **nur so weit wie nötig** nach rechts (46 bis 60 px), ab rund 1520 px greift
  wieder der normale Rand. Gemessen bei 1100, 1280, 1440, 1512, 1920 px: Abstand Kamera zu Inhalt
  mindestens 19 px. Die Verschiebung hängt an der Klasse `has-reel`, die erst JS setzt. Ohne JS
  bleibt das Layout also unverändert. Unter 1100 px bleibt der rote Balken.
- **Filmkamera, Verhalten:** Spulen-Füllstand flächentreu (`Math.sqrt`), vordere Spule (rechts,
  Linsenseite) wird leer, hintere voll. Marker-Positionen werden aus den echten Szenen-Offsets
  gerechnet und per `ResizeObserver` nachgeführt, weil sich die Seitenhöhe mit Galerie und
  Schriften ändert. Der Szenenname steht als Label **unter** der Schiene statt als Tooltip neben
  dem Marker, damit nichts über den Inhalt ragt. Am Seitenende blendet der Filmstreifen aus (Film
  ist durch). Bei reduced motion drehen Speichen und Perforation nicht, Füllstand und Positions-
  punkt zeigen den Fortschritt aber weiter an (Information, keine Animation).
- **Klappe (`CLAPPER`):** reines CSS (`clapper-shut`, 80 ms Verzögerung + 300 ms), kein anime.js.
  Der **Grundzustand ist geschlossen**, nur die Animation startet offen. Dadurch steht sie bei
  reduced motion (globales `animation: none`) sofort geschlossen da. Sie hängt in `.form-status`
  und verschwindet von selbst, sobald der nächste Status per `textContent` gesetzt wird.
- **Drohnen-Szene, Laden:** `setupDrone()` startet nur bei ≥ 801 px, ohne reduced motion und mit
  WebGL2. Ein `IntersectionObserver` mit 700 px Vorlauf lädt dann Bündel und GLB. Bis dahin, am
  Handy, bei reduced motion und ohne JS steht das Standbild (`.drone-still`). `startDrone()` holt
  sich den WebGL-Kontext **selbst und vor dem Laden von three.js** mit
  `failIfMajorPerformanceCaveat: true`: Gibt es nur Software-Rendering (kein Grafikchip, nachgestellt mit Chrome
  `--disable-gpu`), bleibt still das Standbild stehen, ohne Download und ohne Konsolenfehler.
  Headless-Chrome auf dem Mac nutzt auch ohne Flags die GPU und lädt 3D. Für verlässliche
  3D-Tests mit Playwright trotzdem `--use-angle=metal --enable-gpu --ignore-gpu-blocklist` setzen. Sobald das Modell
  bereit ist, bekommt `.drone-stage` die Klasse `is-live`, das Standbild wird per `opacity: 0`
  ausgeblendet (nicht `visibility`, damit der Alt-Text für Screenreader bleibt).
- **Drohnen-Szene, Kamera muss zum Standbild passen:** `DRONE_VIEW` in `main.js` (Position
  `0.5, 0.34, -0.66`, Ziel `0, 0.004, 0`, vertikaler Öffnungswinkel `31.42°`, Seitenverhältnis 4:3)
  entspricht exakt der Blender-Kamera des Standbilds (48 mm bei 36 mm Sensor). Wer eines ändert,
  muss das andere mitziehen, sonst springt die Drohne beim Wechsel vom Standbild zur 3D-Ansicht.
  Der Ausschnitt ist bewusst weit, damit drehende Propeller nie am Canvas-Rand abgeschnitten werden.
- **Drohnen-Szene, kein Sprung beim Wechsel vom Standbild zu 3D:** Das Standbild zeigt die
  Drohne ausgeklappt. Ist die Szene in dem Moment, in dem das Modell fertig geladen ist, schon
  (auch nur teilweise) im Bild, startet das Modell deshalb **direkt ausgeklappt** und überspringt
  das Ausklappen. Nur wenn die Szene noch außerhalb liegt (der Normalfall dank 700 px Vorlauf),
  startet es eingeklappt und klappt beim Reinscrollen aus. So sieht nie jemand
  „ausgeklappt → eingeklappt → ausgeklappt".
- **Drohnen-Szene, Bewegung:** Ausklappen einmalig in 600 ms ab 45 % Sichtbarkeit (vordere Arme
  0 bis 420 ms, hintere 160 bis 600 ms, Blätter 300 bis 600 ms). Danach Propeller mit
  Leerlauf-Drehzahl, Drehzahl und Neigung (max. rund 8°) folgen der geglätteten
  Scroll-Geschwindigkeit, im Stillstand leichtes Schweben. **Die Render-Schleife läuft nur, solange
  die Szene im Bild ist und das Ausklappen begonnen hat** (vorher wird nichts gezeichnet, gemessen:
  0 Draw-Calls). Dass sie im sichtbaren Zustand auch ohne Scrollen weiterläuft, ist gewollt:
  Leerlauf-Drehzahl und Schweben im Stillstand standen so im Auftrag. Ein unabhängiger Prüfer hat
  das am 12.11. als Abweichung von „hängt an Scroll" angemerkt. Wer es abschalten will, stoppt die
  Schleife, sobald `drive` eine Weile 0 ist. `devicePixelRatio` höchstens 2, keine Schatten.
- **Drohnen-Standbild in vier Breiten (480/960/1200/1600):** Die 1200er (q 76, 23 KB) gibt es nur
  wegen Handys mit 3-fachem Pixelraster: Dort braucht das Bild ~1080 Pixel, ohne 1200er lud
  Chrome die 1600er (36 KB). Chrome lädt das Standbild trotz `loading="lazy"` beim ersten
  Seitenaufbau (die Seite ist kurz genug für die Vorladedistanz), deshalb zählt es zum
  Erstaufbau-Gewicht. Mit der 1200er bleibt der Zuwachs unter 30 KB.
- **Luftbild in der Drohnen-Szene:** bewusst **nicht** eingebaut, solange `assets/drohne/luftbild.jpg`
  fehlt (ein fehlendes Bild erzeugt einen 404 in der Konsole). Markup steht unter „Offene Punkte".
- **Szenen-Titel-Reveal** nutzt anime.js `sync: "play"`: einmal ausgelöst, läuft die Animation
  immer zu Ende, auch bei schnellem Weiterscrollen.
- **`.hero-frame video`:** `height: auto` überschreibt den `width`/`height`-Attribut-Hint am
  `<video>`, damit `aspect-ratio: 16/9` greift (sonst der 1:1-Bug aus V18, s. Historie).
- **Text-Split (`data-split`)** injiziert den ungeteilten Text als `.sr-only`-Span (Screenreader)
  und setzt die Einzelbuchstaben `aria-hidden` — **nicht** `aria-label` auf das Element (auf
  generischen `<span>` laut ARIA unzulässig, s. Historie V20).

---

## 3D-Drohne: Herkunft, Lizenz, Aufbereitung

**Quelle:** Printables, Modell 325787 „DJI Mavic 3 Classic Drone",
https://www.printables.com/model/325787-dji-mavic-3-classic-drone/files (zwei STL: folded, unfolded).

**Lizenz laut Printables:** Creative Commons, Public Domain (CC0). Keine Namensnennung nötig,
Bearbeitung und kommerzielle Nutzung erlaubt. Deshalb steht nichts im Impressum.

**⚠️ Bekanntes Risiko (Betreiber-Entscheidung vom 11.11.2026):** Der Hochlader ist laut Printables
**nicht der Urheber** („The user re-uploaded this model") und schreibt selbst, dass er die Modelle
von der offiziellen DJI-Website genommen und von GLB nach STL umgewandelt hat. Gemeinfrei erklären
kann nur der Rechteinhaber, die CC0-Angabe ist also nicht belastbar, die Rechte liegen vermutlich
bei DJI. Der Betreiber hat entschieden, das Modell trotzdem zu nutzen. Verlangt DJI die Entfernung:
`assets/drohne/mavic-3-classic.glb` und die drei WebP-Standbilder löschen und durch ein eigenes
Modell ersetzen. Die Szene funktioniert auch nur mit Standbild.

**Rohdateien und Skripte liegen nicht im Git:** `drohne-quelle/` steht in `.gitignore` (GitHub Pages
veröffentlicht sonst alles). Dort liegen lokal die beiden STL und unter `drohne-quelle/werkzeug/`
die Aufbereitungs-Skripte (`rig.py`, `build.py`, `render.py`, `drohne-entry.js`) samt `drohne.blend`.

**Befund zum Modell:** Mit feiner Verschmelzung (0,02 mm) zerfällt es in 173 Einzelteile. Arme,
Motoren und jedes Propellerblatt sind eigene Teile. (Bei grober Verschmelzung ab 0,5 mm wirken Rumpf
und Arme wie ein Netz, das war ein Messfehler in der ersten Analyse.) `rig.py` vergleicht beide
Dateien, ordnet jedes Teil dem Rumpf oder einem Arm zu und berechnet daraus Drehachse, Winkel und
Gelenkpunkt: vordere Arme 110° um eine fast senkrechte Achse, hintere rund 174° um eine schräge
Achse, die Blätter falten um ihre Stifte (rund 89° bis 100°). Die linken vorderen Blätter sind aus
der rechten Seite gespiegelt, weil die Quelle dort nicht exakt symmetrisch ist.

**Aufbau des GLB (Namen werden in `startDrone()` ausgewertet):** `Drohne` → `Rumpf` und vier Gelenke
`Arm_FR`, `Arm_FL`, `Arm_RR`, `Arm_RL` (F vorne, R hinten, dann rechts/links) → je `Prop_xx` →
zwei `Blatt_xx_n`. Gelenke sind leere Knoten mit `extras`: `fold_axis` + `fold_angle` (Radiant,
Faltung von aufgeklappt nach zusammengeklappt) bzw. `spin_axis`. Die Netze hängen als Kinder
darunter. **Das ist nötig**, weil die meshopt-Quantisierung den Ursprung von Blatt-Knoten mit Netz
verschiebt und die Gelenkpunkte sonst verloren gehen. Koordinaten: Y oben, Vorderseite Richtung
−Z, Meter, deshalb Export mit `export_yup=False`. Farben: Gehäuse `#46484B` matt, Propeller
`#151617`, Kamera `#1D1E20`, Linse `#060607`. Kein Rot.

**Befehle (Stand V3.5, Blender 4.4.3, three 0.187.0, esbuild 0.28.2, @gltf-transform/cli 4.5.1):**

```
B=/Applications/Blender.app/Contents/MacOS/Blender
W=drohne-quelle/werkzeug

$B -b --factory-startup --python $W/build.py -- \
  "drohne-quelle/dji mavic 3 classic unfolded.stl" \
  "drohne-quelle/dji mavic 3 classic folded.stl" $W/out 0.5

npx @gltf-transform/cli meshopt $W/out/drohne-roh.glb assets/drohne/mavic-3-classic.glb --level medium

$B -b $W/out/drohne.blend --python $W/render.py -- $W/out/still.png 0 1600 1200 160 hero
for w in 480 960 1600; do
  cwebp -q 84 -alpha_q 92 -m 6 -resize $w $((w*3/4)) $W/out/still.png -o assets/drohne/mavic-3-classic-$w.webp
done

npx esbuild $W/drohne-entry.js --bundle --minify --format=esm --target=es2020 \
  --legal-comments=inline --outfile=assets/vendor/three-drohne.min.js
```

`build.py` halbiert die Dreiecke (Faktor `0.5`, Ergebnis rund 66.000) und schreibt `drohne-roh.glb`
plus `drohne.blend`. Für esbuild muss `three` installiert sein (`npm i three esbuild` in einem
Ordner **außerhalb** des Repos, `drohne-entry.js` dorthin kopieren). Das Bündel enthält nur
`WebGLRenderer`, `Scene`, `Group`, `PerspectiveCamera`, `HemisphereLight`, `DirectionalLight`,
`Vector3`, `GLTFLoader` und `MeshoptDecoder`.

**Größen:** GLB 563 KB (Budget 800), three.js-Bündel 648 KB roh, 163 KB gzip (Budget 200).

**Kommentar-Regel und Vendor-Datei:** `assets/vendor/three-drohne.min.js` behält den
Copyright-Hinweis von three.js (MIT verlangt ihn). Die Regel „kein Kommentar" gilt für die fünf
eigenen Dateien, nicht für diese fremde Datei.

---

## Arbeitsprotokoll

**Zweck:** Gedächtnis über Sessions hinweg. Künftige Aufgaben zuerst hier abgleichen, statt das
Repo neu zu indizieren. **Nach jeder erledigten Aufgabe pflegen:** „Aktueller Stand" anpassen,
Erledigtes aus „Offene Punkte" streichen, neuen Eintrag in „Historie" (oben = neu) ergänzen.
Reine Doku-Änderungen an dieser Datei brauchen **keinen** Versions-Bump (der Footer-Marker betrifft
nur die sichtbare Seite).

### Aktueller Stand (Stand 2026-11-12)
- **Bewegung (V3.5, Branch `feature/bewegung`):** Sucher-Overlay im Hero, Filmkamera als
  Scroll-Fortschritt (Desktop), Klappe im Kontaktformular, neue Szene 03 Drohne mit 3D-Modell.
  Details unter „Code-Notizen" und „3D-Drohne". Sicherungspunkt vor dem Umbau: Git-Tag
  `vor-animationen` (auf `5501cac`, auch auf GitHub).
- **Live-Version:** V3.4 ist live (Projekte-Szene mit beiden Kurzfilmen ausgebaut, Datenschutz, s. u.). **Versionsschema seit V3.0:
  Schritte von 0.1** (V2.9 → V3.0 → V3.1 …), s. „Konventionen". (Ablauf: … → V2.9 =
  E-Mail-Live-Prüfung → V3.0 = Texte + Pflichtfeld Nachricht → V3.1 = Szenenkopf einzeilig →
  V3.2 = Papierton fast weiß → V3.3 = Untertitel aus → V3.4 = Projekte-Szene ausgebaut.)
- **⚠️ Projekte-Szene ist ausgebaut (seit V3.4, Datenschutz):** Die zwei Kurzfilme („Was kommt
  danach?" / Postcard-Challenge und ALLEIN) sind **nicht** auf der Seite, solange die
  Datenschutzvereinbarungen mit den beteiligten Personen nicht unterschrieben sind. Der komplette
  Stand liegt in **„Ausgeblendete Inhalte" Block 6** (HTML, JSON-LD, llms.txt-Zeilen,
  Thumbnail-Wiederherstellung, Checkliste). Auf ein „hol die Projekte zurück" hin: Block 6
  abarbeiten. **Derzeit ist damit kein `[data-yt]` mehr im HTML** — die Embed-Mechanik in
  `main.js` bleibt aber vollständig erhalten.
- **YouTube-Embeds:** Klick-zu-Laden über `youtube-nocookie.com`, Autoplay nach dem Klick,
  **Untertitel standardmäßig aus** (seit V3.3, Details unter „Code-Notizen"). Der CC-Button im
  Player bleibt bedienbar. Aktuell ohne Video auf der Seite (s. o.).
- **Szenenköpfe:** Slug und Timecode stehen auf **jeder** Breite in einer Zeile (Betreiberwunsch,
  V3.1). Szene 04 heißt dafür „INT. SCHNITT" statt „INT. SCHNITTPLATZ". Die Schriftgröße rechnet
  sich aus der Viewportbreite, Details unter „Code-Notizen".
- **Szenen-Nummerierung aktuell (seit V3.5):** 01 Hero, 02 Fotografie, **03 Drohne** (`#drohne`,
  `EXT. LUFTRAUM / TAG`, TC 00:03:05:10), 04 About, 05 Kontakt. Die Timecodes der alten Szenen sind
  unverändert. **Die Nummern in den Archiv-Blöcken 5 und 6 stammen aus der Zeit vor der
  Drohnen-Szene:** Beim Wiedereinbau der Projekte wird es 02 Projekte / 03 Fotografie / 04 Drohne /
  05 About / 06 Kontakt, mit der Journey (zwischen About und Kontakt) noch eine Nummer mehr.
- **Kontaktformular:** Nachrichtenfeld **ohne Zeichenlimit und ohne Zähler** (seit V28, Betreiber-
  wunsch). Kurz gab es beides (V26/V27) — falls es je zurück soll, steht der komplette Stand in
  PR #28 + #29 bzw. in den Historie-Einträgen zu V26/V27.
  **E-Mail-Feld mit Live-Prüfung (seit V29):** grüner Haken im Feld sobald die Adresse gültig ist,
  roter Hinweis mit Grund erst nach Verlassen des Feldes, Tippfehler-Vorschlag bei bekannten
  Domains (`gmial.com` → `gmail.com`, anklickbar). Name und Nachricht bekommen **keine** Live-
  Prüfung — dort gibt es inhaltlich nichts zu prüfen (Betreiber-Entscheidung); beide sind aber
  `required`, und seit V3.0 blockt `setupForm()` zusätzlich eine Nachricht aus reinen Leerzeichen
  (die rutscht durch die native `required`-Prüfung). Details unter „Code-Notizen".
- **Papierton `--paper: #FAF7F1` (seit V3.2):** Betreiberwunsch „fast weiß, bisschen beige noch".
  Ungefähr die Mitte zwischen dem vorigen `#F2EDE4` und Weiß, der warme Stich bleibt erhalten
  (R250 G247 B241 — ~9 Punkte Spanne zwischen Rot- und Blaukanal, vorher 14). Vorgeschichte:
  `#E8E6E1` → `#F2EDE4` (V25, „Richtung gelbliche Oka-Töne") → `#FAF7F1` (V3.2). Mitgezogen:
  `<meta name="theme-color">` und die helle Textfarbe im Favicon-Data-URI in allen drei
  HTML-Dateien. Die dunklen Töne (`#181714`, `#23211E`) bleiben unverändert, ebenso
  `placehold.co`-URLs (Platzhalter, verschwinden ohnehin).
- **Lighthouse (23.07.26, Moto G Power / Slow 4G):** Performance 94, Accessibility 92,
  Best Practices 100, SEO 100, Agentic Browsing 2/3 → **nach V20-ARIA-Fix 3/3 erwartet**.
  Bewusst offen gelassen: **Kontrast** (Signalrot `#E63321` auf Papier — mit dem hellen V3.2-Papier
  4,04:1 statt 3,71:1 (V25) bzw. 3,46:1 (davor), weiterhin knapp unter AA 4,5:1 für kleinen Text bei
  `.tc`/`.scroll-hint`/`.journey-cta`) — Betreiber will das helle Brand-Rot
  behalten, Accessibility bleibt daher bei 92. **Performance-Hebel liegen beim Betreiber:**
  Hero-`show_reel.mp4` ist 3,8 MB (LCP-Element, LCP 3,1 s) → Kompression + `poster`-Still nötig
  (in Sandbox mangels ffmpeg nicht machbar); Cache-TTL/CSP/HSTS sind GitHub-Pages-Serverconfig.
- **Hero-Showreel:** `assets/show_reel.mp4` (6,66 MB, Datei ist 1280×720/16:9, quadratische Pixel)
  läuft als `<video autoplay muted loop playsinline>` — stumm, automatisch, Endlosschleife, selbst
  gehostet (kein externer Request, DSGVO-konform). `main.js`/`setupHeroVideo()` stoppt die
  Wiedergabe bei `prefers-reduced-motion` (erster Frame als Standbild). **Kein Poster.**
  Frame-Verhältnis: **16:9 (Originalformat, kein Zuschnitt)** — Betreiber wollte das Video im
  Originalformat. CSS: `.hero-frame img, .hero-frame video { aspect-ratio: 16/9; height: auto;
  object-fit: cover }` (`height: auto` überschreibt den `width`/`height`-Attribut-Hint am
  `<video>`, damit `aspect-ratio` greift). `<video>`-Attribute `1280×720`. Grund `#181714`.
- **Galerie:** 8 Fotos als WebP in 480/960/voller Breite + JPEG-Fallback via `<picture>` (`srcset`/
  `sizes`). Beschreibende Dateinamen (z. B. `see-abenddaemmerung.jpg`), keine `DSC*`/`IMG_*` mehr.
  CSS-Absicherung: `.gallery-item picture { display: contents }`.
- **`llms.txt`** liegt im Repo-Root (Entitäts-Zusammenfassung, ohne kommerzielle Angebote).
- **Schema.org** (`index.html`): `@graph` enthält seit V3.4 nur noch **`Person`** (mit `alumniOf`
  IT-HTL Ybbs, `award` und `image`) und **`WebSite`**. Die zwei `VideoObject` (ALLEIN =
  `QDq6b3w08eM`, „Was kommt danach?" = `5XbbUtZ45v0`, beide mit `uploadDate`) liegen mit dem Rest
  der Projekte-Szene im Archiv (Block 6).
- **About-Portrait:** Echtes Foto `assets/oskar-knapp-portrait.jpg` (900×1200, 3:4, ~137 KB JPEG,
  EXIF entfernt) im `.about-portrait`-`<figure>`; CSS erzwingt `aspect-ratio: 3/4; object-fit: cover`.
  Betreiber lud das Original als `DSC05657.jpg` (3497×4663) auf `main`; jeweils auf 900×1200
  verkleinert, umbenannt, Original entfernt. **Seit V23** die verbesserte Fassung (Hintergrund/
  Steinwand weichgezeichnet → Fokus auf Person), gleiche Verarbeitung.
- **Hero-Bild → -Video:** Der Platzhalter im Hero ist seit V17 durch das Showreel-Video ersetzt
  (s. o.). Das frühere `<img fetchpriority="high">` gibt es dort nicht mehr.

### Offene Punkte (TODO)
- **Luftbild für die Drohnen-Szene (optional, Betreiber liefert):** Datei als
  `assets/drohne/luftbild.jpg` ablegen (dazu WebP-Varianten nach der Bild-Konvention), dann diesen
  Block in `index.html` nach `</div>` von `.drone-grid` einsetzen und Breite/Höhe eintragen:
  ```html
        <figure class="drone-aerial" data-animate>
          <img src="assets/drohne/luftbild.jpg" alt="BESCHREIBUNG" loading="lazy" width="BREITE" height="HOEHE">
        </figure>
  ```
  CSS für `.drone-aerial` gibt es noch nicht (volle Breite, Abstand nach oben), mit dem Bild anlegen.
- **„Stand 11/2026" in der Drohnen-Szene** ist fester Text. Ändern sich Flugzeit (14 h), Strecke
  (124 km) oder Flüge (107), Zahlen **und** Stand in `index.html` nachziehen.
- **Lizenz des Drohnen-Modells ist nicht belastbar** (Herkunft DJI, s. „3D-Drohne"). Spätestens
  vor der Gewerbeanmeldung neu bewerten.
- **Placeholder** (Betreiber liefert Medien selbst): `og:image`. Die 3× Journey-Videos
  (`data-yt="DEINE_YOUTUBE_ID"` + `placehold.co`-Thumbnails) sind **seit V26 nicht mehr auf der
  Seite** — der ganze Journey-Block liegt im Archiv (s. „Ausgeblendete Inhalte" Block 5) und kommt
  mit echten YouTube-IDs zurück. (Hero-Showreel-Still nicht mehr offen: Der Hero zeigt jetzt das Video. Optional könnte
  später ein leichtes `poster="assets/…"`-Still für ersten Eindruck & reduced-motion nachgezogen
  werden.)
- **About-Portrait — erledigt (V22):** Echtes Foto `assets/oskar-knapp-portrait.jpg` (900×1200, 3:4,
  ~140 KB JPEG) ersetzt den Platzhalter; Person-Schema um `image` (absolute URL) ergänzt. Optional:
  `og:image` (1200×630 Querformat, aktuell noch `placehold.co`) auf ein echtes Bild umstellen — ein
  3:4-Portrait eignet sich dafür schlecht, daher separat offen gelassen.
- **VideoObject `uploadDate` — ruht (Szene ausgebaut):** Beide `VideoObject` sind seit V3.4 nicht
  mehr im HTML (Archiv-Block 6). Der folgende Punkt wird erst beim Wiedereinbau wieder aktuell.
  **Tag verfeinern (optional):** Feld ist seit V21 gesetzt, aber nur
  **monatsgenau** (Betreiber bestätigt: „Was kommt danach?" Mai 2026 → `2026-05-01`, „ALLEIN"
  Februar 2026 → `2026-02-01`). Tag `01` ist Konvention. Bei Gelegenheit den echten Tag aus
  YouTube Studio („Veröffentlicht am …") eintragen, Format `JJJJ-MM-TT`. Kein Blocker mehr — die
  kritische Search-Console-Meldung ist behoben.
- **DNS (nicht im Repo, Betreiber-Seite) — Ursache der „Seite mit Weiterleitung"-Meldung:** Doppelter
  `www`-CNAME. Behalten: `www` → `oskar-knapp.github.io.` Löschen: `www` → `okmedia.at.` (zwei CNAMEs
  auf einem Host = ungültig). Der Repo-Inhalt erzeugt keine Weiterleitung (Canonical/Sitemap/interne
  Links alle auf `https://okmedia.at/` mit Trailing-Slash); die Search-Console-Meldung betrifft die
  DNS-Ebene bzw. den normalen, erwarteten Redirect nicht-kanonischer Varianten (www→apex, http→https,
  github.io→okmedia.at) und ist meist rein informativ.
- **Horizontaler Überlauf bei genau 320 px (klein, kosmetisch):** Bei 320 px Viewport ist
  `document.scrollWidth` 343 px, die Seite lässt sich also ~23 px seitlich schieben. Ursache ist der
  Hero-Schriftzug `.hero-name` (`font-stretch: 125%` macht die Glyphen breiter, als die
  `clamp()`-Größe einkalkuliert). Betrifft nur sehr alte Geräte (iPhone SE 1. Gen); ab 360 px ist
  nichts zu sehen. Fix wäre eine leicht kleinere Untergrenze im `clamp()` von `.hero-name`.
  Bestand schon vor V3.1 (nachgeprüft), hat mit dem Szenenkopf nichts zu tun.
- **Backlog:** optional AAAA-/IPv6-Records; Journey-Serie zu echtem Content-Hub ausbauen
  (pro Folge Seite/Anchor + VideoObject + Textzusammenfassung).

### Lokal am Mac prüfen (seit V3.5 so gemacht)
- **Playwright ohne Browser-Download:** `npm i playwright-core` in einem Ordner außerhalb des Repos,
  dann `chromium.launch({ channel: "chrome" })`. Das echte Chrome spielt H.264, der Live-Timecode
  ist damit prüfbar (anders als in der Sandbox unten). Web3Forms im Test mit `page.route` mocken.
- **Lighthouse:** `npx lighthouse http://127.0.0.1:PORT/ --only-categories=performance` mit
  `CHROME_PATH` auf das installierte Chrome. **Wichtig:** `python3 -m http.server` liefert **ohne
  gzip** aus, GitHub Pages mit. Für einen fairen Vorher-Nachher-Vergleich einen Server mit gzip
  nehmen und immer den Median aus drei Läufen vergleichen (Einzelläufe schwanken um bis zu 6 Punkte).
- **Messwerte V3.4 → V3.5 (Lighthouse Handy):** mit gzip Performance 96 → 96, LCP vorher und
  nachher gleich (2,70 s in einem Lauf, 2,78 s im Prüfer-Lauf mit Median aus 5). Ohne gzip
  (python-Server) 95 → 94 und 2,93 s → 3,08 s, weil dort die rohen Dateigrößen zählen. HTML +
  CSS + JS zusammen 15,2 KB → 21,0 KB (gzip). Erstaufbau ohne Video im Prüfer-Lauf +25,7 KB,
  davon 20,6 KB Drohnen-Standbild (s. „Code-Notizen").
- **Unabhängiger Prüfer (12.11.2026):** alle 13 Ziel-Kriterien und die Design-Regeln geprüft, kein
  Blocker. Behoben danach: Sprung Standbild → 3D, Leerlauf der Schleife vor dem Ausklappen,
  1200er-Standbild fürs Handy, Einrückung bei „124 km" entfernt, Sucher-Schrift kräftiger
  abgesetzt. Bewusst gelassen: Schweben und Leerlauf-Propeller im Stillstand (Auftrag), roter
  Filmstreifen an der Kamera (Auftrag: Strichzeichnung in Rot und Ink).

### Sandbox-Wissen (spart nächstes Mal Zeit)
- **okmedia.at selbst ist aus der Sandbox nicht erreichbar** (Proxy blockt → `curl` gibt `000`).
  Live-Verifikation daher nur durch den Betreiber oder externe Tools (PageSpeed, Rich-Results-Test).
- **Pillow mit WebP** installierbar via `pip3 install --break-system-packages Pillow` (WebP-Support ist da).
- **Bild-Varianten-Konvention:** `assets/<name>-<breite>.webp` (480/960/voll), Original `assets/<name>.jpg`.
- Externe Hosts (`youtube.com`, `placehold.co`, `jsdelivr`) im Playwright-Test mit `page.route(...).abort()` mocken.
- **H.264/MP4 spielt im Sandbox-Chromium NICHT** (Open-Source-Build ohne proprietären Codec:
  `video.canPlayType('video/mp4; codecs="avc1"')` → `""`, `networkState=3`). Das Hero-`show_reel.mp4`
  (avc1) lässt sich hier daher **nicht** end-to-end abspielen — echte Browser (Chrome/Safari/Firefox/
  Edge) können es. Verkabelung/JS trotzdem prüfbar: HTML-Attribute, `setupHeroVideo()`-Logik via
  `newContext({ reducedMotion })`. Playwright global unter `/opt/node22/lib/node_modules` (ESM:
  `import pw from '/opt/node22/lib/node_modules/playwright/index.js'; const { chromium } = pw;`).
- **Gebündeltes ffmpeg** (`/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux`) ist ein Minimal-Build von
  Playwright (kein `lavfi`, kein H.264-Decode/libvpx-Encode) → für Kompression/WebM/Poster **unbrauchbar**.

### Historie (neueste oben)
- **2026-11-12 — Bewegung: Filmsprache-Animationen (V3.5):** Auftrag des Betreibers nach einem
  Brainstorming: Die Seite ist wie ein Film aufgebaut, soll sich aber auch so bewegen, ruhig und
  professionell. Vier Bausteine, je ein Commit auf `feature/bewegung`:
  **(A) Sucher-Overlay** im Hero (`setupViewfinder()`): REC, Live-Timecode aus `video.currentTime`
  bei 25 fps (gemessen: Abweichung 0 bis 1 Frame), Format, Bildprofil, ISO, Shutter-Winkel, Akku,
  der beim Scrollen von 100 % auf 15 % fällt. Am Handy nur REC, Timecode, Akku.
  **(B) Filmkamera** am linken Rand (`setupReel()`): zwei Spulen als Scroll-Fortschritt, laufender
  Filmstreifen, Szenen-Marker zum Springen. Ersetzt ab 1100 px den roten Balken, der Inhalt rückt
  dafür 46 bis 60 px nach rechts (Betreiber-Entscheidung „Schiene ab 1100 px").
  **(D) Klappe** nach erfolgreichem Absenden, Statustext „GESENDET / Is im Kasten."
  **(C) Szene 03 Drohne:** DJI Mavic 3 Classic in 3D mit 14 h, 124 km, 107 Flügen,
  EU-Kompetenznachweis A1/A3, „Stand 11/2026". Arme klappen aus, Propeller und Neigung folgen dem
  Scrollen. Am Handy, bei reduced motion und ohne JS steht ein Standbild.
  Dazu: `FPS` 24 → 25 und als Parameter, gemeinsame Scroll-Quelle `onScrollRatio()`, Nav-Link
  `DROHNE`, About und Kontakt auf Szene 04 und 05, `llms.txt` ergänzt.
  **Abgelehnt und nicht gebaut** (Betreiber): Letterbox-Reveals, LOG-zu-Graded, Abspann-Roll,
  scroll-gesteuertes Drohnenvideo, Custom Cursor, Magnet-Buttons, Parallax, Countdown-Intro.
  **Lizenz:** Das Modell stammt laut Hochlader von der DJI-Website, die CC0-Angabe ist nicht
  belastbar. Der Betreiber nutzt es trotzdem (s. „3D-Drohne").
  **Geprüft** mit Playwright und lokalem Chrome: keine Konsolenfehler (1440×900, 390×844), ohne JS
  und mit reduced motion alles lesbar, am Handy kein three.js und kein GLB im Netzwerk-Log, kein
  horizontaler Überlauf ab 360 px. Gewichte und Lighthouse stehen unter „Lokal am Mac prüfen".
- **2026-09-08 — Projekte-Szene ausgebaut, Datenschutz (V3.4):** Betreiberwunsch: Die beiden
  Kurzfilme („Was kommt danach?" / Postcard-Challenge, `5XbbUtZ45v0`, und ALLEIN, `QDq6b3w08eM`)
  müssen runter, bis die Datenschutzvereinbarungen mit den beteiligten Personen unterschrieben sind
  — **nicht auskommentieren**, sondern archivieren, damit ein Satz zum Zurückholen reicht. Da ohne
  beide Filme nichts in der Szene übrig bleibt, ist auf Rückfrage die **ganze Szene 02** raus
  (Betreiber-Entscheidung, gleiches Vorgehen wie beim Journey-Ausbau): Section gelöscht, Nav-Link
  `PROJEKTE` entfernt, Hero-Scroll-Pfeil auf `#fotos` umgehängt, Szenen neu nummeriert
  (Fotografie 03→**02**, About 04→**03**, Kontakt 05→**04**, Timecodes unverändert). Ebenfalls raus,
  damit die Seite auch maschinenlesbar nicht mehr auf die Videos zeigt: beide `VideoObject` aus dem
  JSON-LD (Komma nach dem `WebSite`-Objekt entfernt, JSON per `json.loads` gegengeprüft), die
  Sektion „Filme" aus `llms.txt` samt „Projekte (Kurzfilme)" in der Startseiten-Zeile, und die zwei
  Standbilder `assets/thumbnails/*.jpg` (Ordner dadurch weg — GitHub Pages lieferte sie sonst
  weiter aus). **Bewusst geblieben** (Betreiber-Entscheidung, eigene Arbeit + öffentliche
  Auszeichnung, keine Personendaten): About-Absatz über ALLEIN/Sonderpreis, `award` im
  Person-Schema, die Film-Erwähnungen im `llms.txt`-Fließtext, `meta description`. Unangetastet
  ebenso CSS (`.scene--projekte`, `.project*`, `.embed*`, `.award`), `setupEmbeds()` in `main.js`
  (findet derzeit nur kein `[data-yt]` mehr) und der YouTube-Abschnitt der Datenschutzerklärung —
  beides kommt mit den Videos zurück. Vollständiger Wiedereinbau-Stand inkl. Checkliste und
  Thumbnail-Rückholung (`git checkout 9e064fe -- assets/thumbnails/`) steht in „Ausgeblendete
  Inhalte" **Block 6**. Lokal per Playwright geprüft (keine `.embed`/`[data-yt]`-Elemente mehr,
  vier Szenenköpfe in lückenloser Reihenfolge 01–04, Nav ohne Projekte-Link, Anker `#fotos`
  erreichbar, keine 404 auf Thumbnails, JSON-LD gültig). `node --check main.js` grün.
  Version 3.3 → 3.4 (Cache-Buster + Footer-Marker in allen drei HTML-Dateien), `sitemap.xml`
  `lastmod` der Startseite auf 2026-09-08. Branch `claude/youtube-datenschutz-vertraege-kn2btg`.
- **2026-09-02 — YouTube-Untertitel standardmäßig aus (V3.3):** Betreiberfrage „warum ist bei yt
  projekte untertitel aktiviert" → Ursache lag **nicht** im Code: `setupEmbeds()` setzte gar keine
  Untertitel-Option, also entschied YouTubes Default „Nutzerpräferenz" (Browser-/OS-Bedienungshilfe
  „Untertitel bevorzugen", eine früher im Player gesetzte CC-Präferenz aus dem localStorage von
  `youtube-nocookie.com`, oder automatische Untertitel) — deshalb war es geräteabhängig. Fix in
  `main.js`/`setupEmbeds()` zweistufig: `playerVars.cc_load_policy: 0` plus `unloadModule("captions")`
  und `unloadModule("cc")` im `onReady`, vor `playVideo()`, per `typeof` abgesichert. Warum beides
  nötig ist, steht unter „Code-Notizen". Der CC-Button im Player bleibt nutzbar, Untertitel sind nur
  nicht mehr vorab an. Lokal per Playwright geprüft (YouTube-IFrame-API mit `page.route` gemockt,
  da youtube.com in der Sandbox gesperrt ist): `playerVars` kommen als
  `{autoplay:1, playsinline:1, rel:0, cc_load_policy:0}` an, `unloadModule` wird mit `captions` und
  `cc` aufgerufen, danach läuft `playVideo()` — Ladezustand und Aufräumen unverändert.
  `node --check main.js` grün. Version 3.2 → 3.3 (Cache-Buster + Footer-Marker in allen drei
  HTML-Dateien). Branch `claude/youtube-projekte-untertitel-qa97yi`.
- **2026-08-20 — Papierton fast weiß (V3.2):** Betreiberwunsch „ändere die Hintergrundfarbe auf fast
  weiß, bisschen beige noch". `--paper` in `style.css` von `#F2EDE4` auf **`#FAF7F1`** gesetzt —
  rund die Mitte zwischen bisherigem Ton und Weiß, der warme Stich bleibt (Kanalspanne 9 statt 14).
  Da der Token überall per `var(--paper)` genutzt wird, reichte die eine Zeile fürs Styling;
  zusätzlich in allen drei HTML-Dateien nachgezogen: `<meta name="theme-color">` und die helle
  „OK"-Textfarbe im Favicon-Data-URI. Unverändert: dunkle Töne (`#181714`, `#23211E`) und die
  `placehold.co`-Platzhalter. Kontraste steigen alle leicht: Ink/Papier ~16,2:1, Grün/Papier 5,9:1
  (bleibt AA), Rot/Papier 3,71:1 → **4,04:1** (bewusst weiter knapp unter AA, s. „Aktueller Stand").
  Lokal per Playwright auf allen drei Seiten geprüft (`body` berechnet `rgb(250, 247, 241)`,
  `theme-color` gleich mitgezogen) plus Screenshot. Version 3.1 → 3.2 (Cache-Buster +
  Footer-Marker in allen drei HTML-Dateien). Branch `claude/background-color-beige-white-ncqf06`.
- **2026-07-26 — Szenenkopf auf dem Handy einzeilig (V3.1):** Betreiberwunsch: Slug („SZENE 01 /
  EXT. MOSTVIERTEL / TAG") und Timecode sollen nie untereinander rutschen, notfalls über kürzere
  Orte oder kleinere Schrift — „aber nicht zu klein". Umgesetzt im `≤800px`-Block: `flex-wrap:
  nowrap`, `.slug { white-space: nowrap }`, `letter-spacing` 0.1em → 0.04em und eine aus der
  Viewportbreite **gerechnete** Schriftgröße (Formel + gemessener Teiler s. „Code-Notizen").
  Zusätzlich Szene 04 gekürzt: „INT. SCHNITTPLATZ" → **„INT. SCHNITT"** (36 → 31 Zeichen); Szene 01
  behält „MOSTVIERTEL" (Marke) und ist mit 33 Zeichen jetzt der längste Kopf, auf den die Formel
  ausgelegt ist. **Wichtig:** Der erste Anlauf rechnete mit 0,66 em pro Zeichen (Vorschub 0,6 +
  Spacing) und lief über — real sind es **0,691 em**; der Wert ist im Browser gemessen, nicht
  hergeleitet. Ergebnis (Playwright, 12 Breiten von 320 bis 1280 px, alle fünf Szenenköpfe):
  überall einzeilig, ab 430 px volle Desktop-Größe 0.72 rem, bei 390 px 0.63 rem, bei 320 px
  0.52 rem. Nebenbefund, **nicht** von dieser Änderung verursacht und **offen**: Bei genau 320 px
  scrollt die Seite ~23 px horizontal, Ursache ist der Hero-Schriftzug (`.hero-name`,
  `font-stretch: 125%`), s. „Offene Punkte". Version 3.0 → 3.1.
  Branch `claude/email-field-live-validation-89a0b4`.
- **2026-07-25 — Formulartexte geschärft, Nachricht abgesichert, neues Versionsschema (V3.0):**
  Drei Betreiberwünsche. **(1) Versionsschema:** ab jetzt Schritte von 0.1 — die bisherige V29 gilt
  rückwirkend als **V2.9**, dieser Stand ist **V3.0**, danach 3.1, 3.2 … Cache-Buster trägt
  dieselbe Zahl (`?v=3.0`). **(2) Hinweistexte:** Das Slug-Präfix ist aus den Feldhinweisen raus
  („FEHLT / Das @-Zeichen fehlt." → „Das @-Zeichen fehlt.", ebenso die „PRÜFEN / "-Präfixe), und
  der Auffangsatz „Das sieht noch nicht nach einer E-Mail-Adresse aus." ist ersetzt durch
  **„Bitte eine vollständige E-Mail-Adresse eingeben."** — der alte klang unprofessionell. Die
  `.form-status`-Zeile unter dem Button behält ihre Präfixe (s. „Code-Notizen"). **(3) Nachricht als
  Pflichtfeld:** `required` stand schon am `<textarea>`, die native Prüfung lässt aber reine
  Leerzeichen durch. `setupForm()` prüft jetzt zusätzlich `form.message.value.trim()` und bricht mit
  „PRÜFEN / Bitte noch eine Nachricht schreiben." ab, Fokus springt ins Feld. Playwright-Lauf auf
  39 Prüfungen erweitert, alle grün. Branch `claude/email-field-live-validation-89a0b4`.
- **2026-07-25 — Live-Prüfung im E-Mail-Feld (V29, rückwirkend V2.9):** Betreiberwunsch: Der Nutzer soll nicht erst
  beim Absenden merken, dass die Adresse nicht stimmt — „schöner grüner Haken im Kreis". Umgesetzt
  als `setupEmailCheck()` in `main.js` (+ Helfer `editDistance`, `suggestDomain`, `emailProblem`).
  **HTML:** Das E-Mail-Feld ist jetzt `.field--email`, der Input steckt in `.field-input`
  (Positionierungs-Anker fürs Icon) und wird von `<p class="field-hint" id="email-hint"
  role="status" aria-live="polite">` begleitet, verknüpft per `aria-describedby`.
  **Verhalten:** Lob sofort, Kritik erst nach `blur` (Timing-Regel s. „Code-Notizen"), eigene
  strengere Regex statt `input.validity`, Tippfehler-Vorschlag gegen 16 gängige AT/DE-Provider mit
  getrenntem Name/TLD-Vergleich. `setupForm()` bricht das Absenden bei ungültiger Adresse ab
  (Statuszeile „PRÜFEN / Bitte die E-Mail-Adresse korrigieren.", Fokus zurück ins Feld), der
  `reset`-Listener räumt den Zustand nach erfolgreichem Versand wieder auf.
  **CSS:** neues Token `--green: #2F6B46`, `.field-check` (SVG absolut rechts im Feld, Haken
  zeichnet sich in 260 ms selbst), `.field-hint`, `.hint-fix`; `prefers-reduced-motion` überspringt
  die Zeichen-Animation. Ohne JS unverändert nutzbar (kein Icon im DOM, `required`/`type="email"`
  bleiben). Lokal per Playwright mit 36 Prüfungen abgesichert: Tippen ohne blur zeigt kein Rot,
  blur meldet den konkreten Grund, Korrektur schaltet live auf Grün, `oskar@b` wird abgelehnt
  (native Prüfung ließe es durch), Vorschlag-Klick setzt die Adresse ein, keine Fehlalarme bei
  `orf.at`/`web.at`/`sub.domain.co.uk`, Absende-Sperre + Fokus, Reset, Ohne-JS-Fall.
  Version 28→29 (Cache-Buster + Footer-Marker in allen drei HTML-Dateien).
  Branch `claude/email-field-live-validation-89a0b4`.
- **2026-07-25 — Zeichenlimit im Kontaktformular wieder entfernt (V28):** Betreiberwunsch „mach das
  Limit doch weg" → `maxlength="300"` am `<textarea>`, der Zähler-Absatz, `aria-describedby`,
  `setupCharCount()` in `main.js`, die CSS-Regeln `.char-count*` **und** die nur dafür angelegten
  Tokens `--green`/`--amber` sind alle raus. Das Nachrichtenfeld ist damit wieder ein schlichtes
  `<textarea>` ohne Längenbegrenzung, Spam-Schutz bleibt über Honeypot + Web3Forms. Wiedereinbau
  (falls doch nochmal gewünscht): PR #28 (Zähler) + #29 (erst ab 200 sichtbar) enthalten den
  vollständigen Stand. Version 27→28 (Cache-Buster + Footer-Marker in allen drei HTML-Dateien).
  Branch `claude/journey-contact-char-counter-8qmrwt`.
- **2026-07-25 — Zeichenzähler erst ab 200 Zeichen (V27):** Betreiberwunsch: Der Zähler soll nicht
  dauerhaft dastehen, sondern erst auftauchen, wenn es Richtung Limit geht. `setupCharCount()` setzt
  jetzt zusätzlich `data-visible` auf `#message-count`, sobald ≥ 200 Zeichen getippt sind
  (Konstante `showFrom` in `main.js`); CSS blendet den Absatz mit `visibility: hidden; opacity: 0`
  aus und in 200 ms ein. **Kein `display: none`**, damit der Platz reserviert bleibt und der
  Absende-Button beim Erscheinen nicht springt; `visibility: hidden` hält den Zähler solange auch
  aus dem Accessibility-Tree. Ampel-Schwellen (225 gelb / 279 rot) und `maxlength="300"`
  unverändert, der Reset nach dem Versand blendet ihn wieder aus. Lokal per Playwright geprüft
  (unsichtbar bei 0/199, sichtbar ab 200, Farbwechsel bei 225/279, Reset blendet aus).
  Version 26→27 (Cache-Buster + Footer-Marker in allen drei HTML-Dateien).
  Branch `claude/journey-contact-char-counter-8qmrwt`.
- **2026-07-25 — Journey ausgebaut + Zeichenzähler im Kontaktformular (V26):** Der Betreiber hatte
  die Journey-Szene direkt auf `main` mit `<!-- … -->` auskommentiert. Auskommentierter Code
  verstößt gegen die harte Regel „kein Kommentar im ausgelieferten Code" (und wird trotzdem
  ausgeliefert) → Block **gelöscht** und stattdessen vollständig in **„Ausgeblendete Inhalte"
  Block 5** archiviert, inklusive Wiedereinbau-Checkliste. Mitgezogen: Nav-Link
  `<a href="#journey">` entfernt (zeigte sonst ins Leere), Kontakt-Slug `SZENE 06` → **`SZENE 05`**
  (keine Lücke in der Drehbuch-Nummerierung, gleiches Vorgehen wie beim Ausbau der
  „Zusammenarbeit"-Szene), `llms.txt` ohne „Journey". CSS (`.scene--journey`, `.journey-*`) bleibt
  liegen — kostet ~nichts und macht den Wiedereinbau zum reinen Copy-Paste.
  **Zeichenzähler:** `<textarea id="message">` hat jetzt `maxlength="300"`, darunter
  `<p class="char-count" id="message-count">` mit „N / 300 ZEICHEN". Neue Funktion
  `setupCharCount()` in `main.js` zählt live mit und setzt `data-state` (`low` < 225, `mid` 225–278,
  `high` ab 279 = 93 %); CSS färbt grün `--green #2F6B46` → gelb/ocker `--amber #8A5A00` → rot
  `--red`, mit 200-ms-Farbübergang. Beide neuen Tokens sind AA-tauglich auf dem Papierton
  (5,4:1 bzw. 5,1:1). Ohne JS bleibt das Limit über `maxlength` wirksam, der Zähler steht statisch
  auf „0 / 300 ZEICHEN". Nach erfolgreichem Versand setzt ein `reset`-Listener den Zähler zurück.
  Lokal per Playwright geprüft (Schwellen 224/225/278/279/300, `maxlength` greift, Reset auf 0,
  Journey-Sektion und Nav-Link weg). Version 25→26 (Cache-Buster + Footer-Marker in allen drei
  HTML-Dateien). Branch `claude/journey-contact-char-counter-8qmrwt`.
- **2026-07-25 — Papierton wärmer/gelblicher (V25):** Betreiber wollte den Hintergrund „etwas in
  Richtung der gelblichen Oka-Farben", ungefähr die Mitte zwischen dem bisherigen Ton und `#FBF3E7`.
  `--paper` in `style.css` von `#E8E6E1` auf **`#F2EDE4`** gesetzt (kanalweiser Mittelwert der
  beiden Farben). Da der Token überall per `var(--paper)` genutzt wird, reichte die eine Zeile für
  das gesamte Styling; zusätzlich in allen drei HTML-Dateien nachgezogen: `<meta name="theme-color">`
  und die helle „OK"-Textfarbe im Favicon-Data-URI. Unverändert: dunkle Töne (`#181714`, `#23211E`)
  und die `placehold.co`-Platzhalter-URLs. Kontrast Rot/Papier steigt leicht von 3,46:1 auf 3,71:1
  (immer noch bewusst unter AA, s. „Aktueller Stand"), Ink/Papier bleibt bei ~14,7:1. Lokal per
  Playwright-Screenshot geprüft (`body` berechnet `rgb(242, 237, 228)`). Version 24→25
  (Cache-Buster + Footer-Marker in allen drei HTML-Dateien).
  Branch `claude/background-color-oka-tones-aoet2v`.
- **2026-07-24 — About-Text ausgetauscht (V24):** Betreiber lieferte eine neue, gestraffte Fassung
  des About-Fließtexts (`.about-text` in `index.html`). Vier Absätze ersetzt: (1) „Ich bin 15 und
  mache Filme. Drehbuch, Regie, Kamera, Schnitt …", (2) ALLEIN als Drama über Mobbing + erste
  Auszeichnung (Sonderpreis Jury, Clip, Postcard-Challenge 2026, „Was kommt danach?"), (3)
  technisches Fundament IT-HTL Ybbs / Medientechnik + Rest autodidaktisch, (4) „Ich habe keinen
  Plan, wo das hinführt … jedes nächste Projekt besser". Die Altersangabe „15" im ersten Absatz per
  `<span data-age>15</span>` an die dynamische Alters-Berechnung gehängt (statt hartkodiert), damit
  sie nach dem Geburtstag automatisch mitwandert. Version 23→24 (Cache-Buster + Footer-Marker in
  allen drei HTML-Dateien). Branch `claude/about-text-austauschen-zp9mnw`.
- **2026-07-24 — About-Portrait: verbesserte Fassung (V23):** Betreiber lud eine überarbeitete
  Version des Portraits (`DSC05657.jpg`, 3497×4663, Hintergrund/Steinwand weichgezeichnet → Fokus
  auf die Person) auf `main`. Gleiche Verarbeitung wie V22: auf 900×1200 verkleinert, progressive
  JPEG q=86 → ~137 KB, EXIF entfernt, als `assets/oskar-knapp-portrait.jpg` gespeichert (überschreibt
  die alte Fassung), Original entfernt. Version 22→23. Direkt per PR gemergt (Regel „immer gleich
  mergen"). Branch `claude/search-console-indexing-issues-xpklmc`.
- **2026-07-24 — About-Portrait eingebaut (V22):** Betreiber lud sein Portrait als
  `assets/DSC05657.jpg` (3497×4663, 455 KB) direkt auf `main`. In der Sandbox mit Pillow auf
  **900×1200** (3:4, passend zum CSS `aspect-ratio: 3/4`) verkleinert, progressive JPEG q=84 →
  **~140 KB** (Ziel „max. 150 KB"), EXIF entfernt, als `assets/oskar-knapp-portrait.jpg` gespeichert
  (beschreibender Name gemäß Galerie-Konvention), Original `DSC05657.jpg` entfernt. Platzhalter
  `placehold.co` im `.about-portrait`-`<img>` (`index.html`) durch das echte Bild ersetzt, `alt`
  entplatzhaltert. Person-Schema um `"image"` (absolute URL) ergänzt — der dokumentierte „Sobald
  Portrait da"-Folgeschritt. `og:image` bleibt bewusst Platzhalter (Querformat 1200×630, ein
  3:4-Portrait passt dort schlecht). Version 21→22 (Cache-Buster + Footer-Marker in allen drei
  HTML-Dateien). Branch `claude/search-console-indexing-issues-xpklmc` (frisch auf `main` aufgesetzt,
  da V21-PR #23 gemergt).
- **2026-07-23 — Search-Console-Fixes: VideoObject `uploadDate` + Redirect-Analyse (V21):**
  Zwei Search-Console-Meldungen abgearbeitet. **(1) „Videos für strukturierte Daten / Feld
  `uploadDate` fehlt" (kritisch):** Beide `VideoObject` in `index.html` haben jetzt `uploadDate`
  — „Was kommt danach?" = `2026-05-01`, „ALLEIN" = `2026-02-01`. **Betreiber hat nur den Monat
  bestätigt** (Mai 2026 bzw. Februar 2026, YouTube in Sandbox mit 403 gesperrt), der **Tag `01`
  ist Konvention/Platzhalter** — bei Bedarf mit dem echten Tag aus YouTube Studio verfeinern (Format
  `JJJJ-MM-TT`). Damit ist die kritische Meldung behoben und die Filme wieder rich-result-fähig.
  **(2) „Seite mit Weiterleitung" (nicht indexiert):** Kein ausgelieferter Repo-Inhalt erzeugt die
  Weiterleitung — alle internen Links nutzen Trailing-Slash, Canonical/`og:url`/Sitemap zeigen
  einheitlich auf `https://okmedia.at/`, kein `github.io`/`www.`/`http://` im Quelltext (per grep
  geprüft). Ursache liegt **DNS-/Hosting-seitig** (bekannter doppelter `www`-CNAME, s. „Offene
  Punkte" → DNS) bzw. ist der normale, erwartete Redirect nicht-kanonischer Varianten (www→apex,
  http→https, github.io→okmedia.at), den Google korrekt auf die kanonische URL auflöst — meist
  informativ, kein echter Fehler. `sitemap.xml`-`lastmod` der Startseite auf `2026-07-23` gesetzt.
  Version 20→21 (Cache-Buster + Footer-Marker in allen drei HTML-Dateien). Branch
  `claude/search-console-indexing-issues-xpklmc`.
- **2026-07-23 — Quelltext komplett kommentarfrei (Teil von V20):** Auf Betreiberwunsch alle
  Kommentare aus `index.html`, `impressum/`, `datenschutz/`, `main.js`, `style.css` entfernt
  (`<!-- -->`, `/* */`, `//`). String-bewusst gestrippt, damit URLs (`https://`), das SVG-Data-URI
  und `content`-Strings unversehrt bleiben; `node --check` grün, JSON-LD parst, Tags balanciert.
  Nicht-offensichtliche Begründungen nach **CLAUDE.md → „Code-Notizen"** migriert. Neue **harte
  Regel** ergänzt: kein Kommentar im ausgelieferten Code, alles in diese Datei. Kein Versions-Bump
  (V20 war noch nicht live). Branch `claude/hero-section-italic-style-9nyla2`.
- **2026-07-23 — Lighthouse-ARIA-Fix (V20):** Der Text-Split in `initMotion()` (`main.js`) setzte
  `aria-label` auf **jedes** `[data-split]`-Element — bei den generischen `<span class="hero-line">`
  ist das laut ARIA-Spec unzulässig („prohibited ARIA attributes", von Lighthouse in Accessibility
  **und** Agentic Browsing moniert). Neu: Der ungeteilte Text steckt in einem visuell versteckten
  `.sr-only`-Span (neue CSS-Utility), die Einzel-`.char` bleiben `aria-hidden`. Keine optische
  Änderung. Hebt Agentic Browsing 2/3 → 3/3 (erwartet). **Kontrast bewusst nicht angefasst**
  (Betreiber behält helles Rot, s. „Aktueller Stand"). Auf Branch `claude/hero-section-italic-style-9nyla2`.
- **2026-07-23 — Hero-Kursiv verworfen:** Idee, den Hero-Namen kursiv zu setzen, verworfen — die
  selbst gehostete `archivo-variable.woff2` hat keine Italic-Achse (→ nur Faux-Italic), und der
  aufrechte Bruch ist bewusst. Keine Code-Änderung.
- **2026-07-23 — Showreel-Frame zurück auf 16:9 / Originalformat (V19):** Betreiber wollte das
  Video doch im originalen 16:9-Format (kein Zuschnitt), nicht 1:1. CSS `.hero-frame video` wieder
  `aspect-ratio: 16/9` (mit img zusammengeführt); `<video>`-Attribute auf `1280×720`. `height: auto`
  bleibt, damit der Attribut-Hint das `aspect-ratio` nicht aushebelt (das war der V18-1:1-Bug).
- **2026-07-23 — Showreel-Frame auf 1:1 korrigiert (V18):** Betreiber wollte den Hero-Frame
  quadratisch, nicht 16:9. CSS: `.hero-frame video` auf `aspect-ratio: 1/1` (statt 16:9),
  `object-fit: cover` schneidet die 16:9-Quelle mittig auf 1:1. Kommentar/Doku angepasst.
  Branch nach dem Merge von PR #19 sauber auf `main` neu aufgesetzt.
- **2026-07-23 — Hero-Showreel als Hintergrund-Video (V17):** Platzhalter-`<img>` im Hero durch
  `assets/show_reel.mp4` ersetzt — `<video autoplay muted loop playsinline>`, stumm/automatisch/
  Endlosschleife, selbst gehostet. `setupHeroVideo()` in `main.js` respektiert
  `prefers-reduced-motion` (kein Abspielen, erster Frame als Standbild). CSS `.hero-frame video`
  analog zum Bild + dunkler Grund. Kein Poster (bewusst, erster Frame genügt). Auf Branch
  `claude/show-reel-local-playback-pyhk5j`, noch nicht auf `main`. Ohne `ffmpeg` in der Sandbox
  keine Kompression/kein Poster-Extrakt möglich.
- **2026-07-17 — SEO-Audit umgesetzt (V16, PR #17):** WebP-Galerie + `srcset`, beschreibende
  Dateinamen, `llms.txt`, Schema-Anreicherung (Person `alumniOf`/`award`, 2× VideoObject),
  Hero-LCP (`fetchpriority`), `sitemap.xml` `lastmod`. Placeholder-Punkte bewusst ausgelassen
  (Medien folgen vom Betreiber). Basis-Audit: SEO Health Score 76/100.

---

## Ausgeblendete Inhalte (Archiv — jederzeit 1:1 wieder einbaubar)

**Grundregel:** Ausgebaute Seitenteile werden **nicht auskommentiert**, sondern aus dem Quelltext
**gelöscht** und hier im vollständigen Originalstand archiviert (harte Regel „kein Kommentar im
ausgelieferten Code"). Wiedereinbau = Block von hier 1:1 zurückkopieren.

**Blöcke 1–4 (kommerzielle Inhalte):** Noch kein Gewerbe angemeldet → keine kommerziellen Angebote
auf der Seite. Werden reaktiviert, sobald das Gewerbe existiert. Bis dahin: nichts davon auf die
Seite! **Block 5 (Journey):** vom Betreiber ausgebaut, hat mit dem Gewerbe nichts zu tun.
**Block 6 (Projekte / beide Kurzfilme):** ausgebaut bis die Datenschutzvereinbarungen mit den
beteiligten Personen unterschrieben sind — kommt danach 1:1 zurück, hat mit dem Gewerbe nichts zu tun.

> Hinweis: Das Repo (und damit diese Datei) ist öffentlich – GitHub Pages liefert auch `CLAUDE.md`
> aus. Im Quelltext der *Seite* taucht nichts mehr auf, „geheim" ist dieses Archiv aber nicht.

### 1. Projekte 3 + 4 (Aftermovies, Kundendrehs)
Wieder einfügen in `index.html`, innerhalb `<div class="projects">`, **nach** Projekt 2 (ALLEIN).
`DEINE_YOUTUBE_ID` durch echte 11-stellige IDs ersetzen.

```html
<!-- Projekt 3: Aftermovies -->
<article class="project" data-animate>
  <div class="embed" data-yt="DEINE_YOUTUBE_ID">
    <img class="embed-thumb"
         src="https://placehold.co/1280x720/23211E/E8E6E1?text=AFTERMOVIES+%2F+THUMBNAIL+%2F+PLATZHALTER"
         alt="Platzhalter für ein Aftermovie-Thumbnail" loading="lazy" width="1280" height="720">
    <span class="embed-hover" aria-hidden="true">AFTERMOVIES</span>
    <button class="embed-play" type="button">PLAY / VIDEO LADEN</button>
  </div>
  <div class="project-info">
    <h3 class="project-title">AFTERMOVIES</h3>
    <p class="project-meta">AUFTRAG / EVENTS / FORTLAUFEND</p>
    <p class="project-desc">Events, verdichtet auf wenige Minuten. Schnitt mit Tempo, Grading mit Charakter.</p>
  </div>
</article>

<!-- Projekt 4: Kundendrehs -->
<article class="project" data-animate>
  <div class="embed" data-yt="DEINE_YOUTUBE_ID">
    <img class="embed-thumb"
         src="https://placehold.co/1280x720/23211E/E8E6E1?text=KUNDENDREHS+%2F+THUMBNAIL+%2F+PLATZHALTER"
         alt="Platzhalter für ein Kundendreh-Thumbnail" loading="lazy" width="1280" height="720">
    <span class="embed-hover" aria-hidden="true">KUNDENDREHS</span>
    <button class="embed-play" type="button">PLAY / VIDEO LADEN</button>
  </div>
  <div class="project-info">
    <h3 class="project-title">KUNDENDREHS</h3>
    <p class="project-meta">IMAGEFILM / EVENT / FORTLAUFEND</p>
    <p class="project-desc">Imagefilme und Eventvideos. Bezahlte Drehs unter echten Bedingungen.</p>
  </div>
</article>
```

### 2. Szene 06 / Zusammenarbeit
Wieder einfügen in `index.html` **zwischen** Szene 05 (Journey, endet nach `journey-cta`) und
Szene 07 (Kontakt). Optional den Nav-Link `<a href="#zusammenarbeit">ZUSAMMENARBEIT</a>` in
`#site-menu` (vor KONTAKT) ergänzen. Zugehörige CSS-Klassen (`.scene--work`, `.work-*`) sind in
`style.css` noch vorhanden.

```html
<!-- ================= SZENE 06 / ZUSAMMENARBEIT ================= -->
<section id="zusammenarbeit" class="scene scene--work">
  <div class="scene-head" data-animate>
    <span class="slug">SZENE 06 / INT. BESPRECHUNG / TAG</span>
    <span class="tc" data-tc="00:07:12:20">TC&nbsp;00:07:12:20</span>
  </div>
  <h2 class="scene-title scene-title--wrap" data-animate>ZUSAMMEN&shy;ARBEIT</h2>

  <p class="work-intro" data-animate>Neben den eigenen Filmen arbeite ich als Videograf im Mostviertel und in ganz Niederösterreich. Kurz und ehrlich, das biete ich an:</p>

  <ul class="work-list">
    <li data-animate><span class="work-index">01</span>AFTERMOVIES</li>
    <li data-animate><span class="work-index">02</span>IMAGEFILME</li>
    <li data-animate><span class="work-index">03</span>SOCIAL MEDIA CONTENT</li>
  </ul>

  <p class="work-note" data-animate>Kein Agentur-Zwischenschritt, du redest direkt mit mir. Anfrage genügt, den Rest klären wir gemeinsam.</p>
</section>
```

### 3. SEO/Meta: kommerzielle Fassungen
Aktuell stehen neutrale Portfolio-Texte drin. Nach Gewerbeanmeldung wieder auf diese Fassungen
zurückstellen:

```html
<meta name="description" content="Oskar Knapp, Videograf und Filmemacher aus dem Mostviertel. Aftermovies, Imagefilme und Eventvideos in ganz Niederösterreich. Jetzt anfragen.">
<meta property="og:description" content="Aftermovies, Imagefilme und Eventvideos in Niederösterreich. Junger Filmemacher, alles selbst gedreht und geschnitten.">
```

In `Person.knowsAbout` (JSON-LD) wieder ergänzen: `"Aftermovie", "Imagefilm", "Eventvideo"`.

### 4. Schema.org: Service- und FAQ-Blöcke
Wieder in den `@graph` des JSON-LD in `index.html` einfügen (nach dem `Person`-Objekt):

```json
{
  "@type": "Service",
  "@id": "https://oskar-knapp.github.io/Personal-Brand/#leistungen",
  "serviceType": "Videoproduktion",
  "provider": { "@id": "https://oskar-knapp.github.io/Personal-Brand/#oskar" },
  "url": "https://oskar-knapp.github.io/Personal-Brand/",
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Mostviertel" },
    { "@type": "AdministrativeArea", "name": "Niederösterreich" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Videoproduktion",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Aftermovie" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Imagefilm" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Eventvideo" } }
    ]
  }
},
{
  "@type": "FAQPage",
  "@id": "https://oskar-knapp.github.io/Personal-Brand/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Was kostet ein Video?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Das hängt von Länge, Drehzeit und Schnitt ab. Sag mir kurz, was du vorhast, dann bekommst du ein faires, unverbindliches Angebot."
      }
    },
    {
      "@type": "Question",
      "name": "In welcher Region drehst du?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Im ganzen Mostviertel und in Niederösterreich, rund um Loosdorf, Melk, Ybbs, Amstetten und St. Pölten."
      }
    },
    {
      "@type": "Question",
      "name": "Wie läuft ein Dreh ab?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kurze Anfrage, gemeinsames Konzept, Dreh vor Ort, danach Schnitt und Color Grading, fertige Übergabe im passenden Format."
      }
    }
  ]
}
```

### 5. Szene 05 / Journey (Doku-Serie)
**Grund:** Ausgebaut am 2026-07-25 auf Betreiberwunsch (die drei Folgen sind noch reine
`placehold.co`-Platzhalter mit `data-yt="DEINE_YOUTUBE_ID"`, die Serie ist noch nicht online).
Kein Gewerbe-Thema. Wieder einfügen in `index.html` **zwischen** Szene 04 (About) und der
Kontakt-Szene.

**Beim Wiedereinbau ebenfalls:**
- Nav-Link `<a href="#journey">JOURNEY</a>` in `#site-menu` wieder ergänzen (zwischen ABOUT und KONTAKT).
- Kontakt-Slug zurück auf `SZENE 06 / INT. POSTFACH / NACHT` (steht jetzt auf `SZENE 05`).
- In `llms.txt` die Startseiten-Zeile wieder um „Journey" ergänzen.
- CSS (`.scene--journey`, `.journey-*`) ist unverändert in `style.css` vorhanden, nichts zu tun.

```html
    <section id="journey" class="scene scene--journey">
      <div class="scene-head" data-animate>
        <span class="slug">SZENE 05 / EXT. UNTERWEGS / TAG</span>
        <span class="tc" data-tc="00:05:58:08">TC&nbsp;00:05:58:08</span>
      </div>
      <h2 class="scene-title" data-split>JOURNEY</h2>

      <p class="journey-intro" data-animate>Auf YouTube dokumentiere ich den ganzen Weg als fortlaufende Doku-Serie. Keine Tutorials, keine Tipps von oben herab. Nur was ich mache, was schiefgeht und was ich daraus lerne.</p>

      <div class="journey-grid">

        <article class="journey-item" data-animate>
          <div class="embed" data-yt="DEINE_YOUTUBE_ID">
            <img class="embed-thumb" src="https://placehold.co/800x450/23211E/E8E6E1?text=DOKU+FOLGE+%2F+PLATZHALTER"
                 alt="Platzhalter für eine Folge der Doku-Serie" loading="lazy" width="800" height="450">
            <button class="embed-play" type="button" aria-label="Video abspielen">
              <svg viewBox="0 0 68 48" aria-hidden="true"><path class="yt-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/><path class="yt-tri" d="M45 24 27 14v20z"/></svg>
            </button>
          </div>
          <p class="mono-label">FOLGE / WARUM KEINE FILMSCHULE</p>
        </article>
        <article class="journey-item journey-item--down" data-animate>
          <div class="embed" data-yt="DEINE_YOUTUBE_ID">
            <img class="embed-thumb" src="https://placehold.co/800x450/23211E/E8E6E1?text=DOKU+FOLGE+%2F+PLATZHALTER"
                 alt="Platzhalter für eine Folge der Doku-Serie" loading="lazy" width="800" height="450">
            <button class="embed-play" type="button" aria-label="Video abspielen">
              <svg viewBox="0 0 68 48" aria-hidden="true"><path class="yt-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/><path class="yt-tri" d="M45 24 27 14v20z"/></svg>
            </button>
          </div>
          <p class="mono-label">FOLGE / HINTER DEN KULISSEN VON ALLEIN</p>
        </article>
        <article class="journey-item journey-item--lower" data-animate>
          <div class="embed" data-yt="DEINE_YOUTUBE_ID">
            <img class="embed-thumb" src="https://placehold.co/800x450/23211E/E8E6E1?text=DOKU+FOLGE+%2F+PLATZHALTER"
                 alt="Platzhalter für eine Folge der Doku-Serie" loading="lazy" width="800" height="450">
            <button class="embed-play" type="button" aria-label="Video abspielen">
              <svg viewBox="0 0 68 48" aria-hidden="true"><path class="yt-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/><path class="yt-tri" d="M45 24 27 14v20z"/></svg>
            </button>
          </div>
          <p class="mono-label">FOLGE / MEIN ERSTER DREH</p>
        </article>
      </div>

      <a class="journey-cta" href="https://www.youtube.com/@oskar_knapp?sub_confirmation=1" target="_blank" rel="noopener">KANAL ABONNIEREN / @oskar_knapp</a>
    </section>
```

### 6. Szene 02 / Projekte (beide Kurzfilme) — DATENSCHUTZ
**Grund:** Ausgebaut am 2026-09-08 auf Betreiberwunsch. Die Datenschutz-/Einwilligungsvereinbarungen
mit den beteiligten Personen (Darsteller, Team) sind noch nicht unterschrieben, solange dürfen die
Filme nicht öffentlich auf der Seite stehen. **Kein Gewerbe-Thema.** Sobald die Verträge da sind:
„hol die Projekte zurück" genügt, alles Nötige steht hier.

**Wiedereinbau-Checkliste (alle sechs Punkte):**
1. **HTML-Block unten** in `index.html` **zwischen** Hero-Szene (`</section>` von `#start`) und
   `<section id="fotos">` einsetzen.
2. **Nav-Link** `<a href="#projekte">PROJEKTE</a>` in `#site-menu` wieder als **ersten** Eintrag
   (vor FOTOS) ergänzen.
3. **Scroll-Pfeil im Hero** zurück auf Projekte: `<a class="scroll-hint" href="#fotos">` →
   `href="#projekte"`.
4. **Szenen zurück-nummerieren:** Fotografie `SZENE 02` → **03**, About `SZENE 03` → **04**,
   Kontakt `SZENE 04` → **05** (Timecodes blieben unverändert, nichts zu tun). Steht die Journey
   (Block 5) gleichzeitig wieder drin, verschiebt sich alles um eine weitere Nummer.
5. **JSON-LD:** die beiden `VideoObject`-Blöcke unten wieder in den `@graph` von `index.html`
   einfügen, **nach** dem `WebSite`-Objekt — dabei das Komma nach dessen schließender Klammer
   wieder setzen (`}` → `},`), sonst ist das JSON kaputt.
6. **Thumbnails + `llms.txt`:** Die zwei Standbilder wurden gelöscht (der Ordner
   `assets/thumbnails/` existiert dadurch nicht mehr). Zurückholen aus der Git-Historie:
   `git checkout 9e064fe -- assets/thumbnails/` (Commit V3.3, direkt vor dem Ausbau).
   In `llms.txt` die Sektion „Filme" wieder ergänzen und in der Startseiten-Zeile „Projekte
   (Kurzfilme), " voranstellen:

```
## Filme

- [Was kommt danach? (YouTube)](https://www.youtube.com/watch?v=5XbbUtZ45v0): Kurzfilm, Postcard-Challenge 2025/26, Sonderpreis der Jury (Kategorie Clip)
- [ALLEIN (YouTube)](https://www.youtube.com/watch?v=QDq6b3w08eM): Kurzfilm-Drama über Mobbing, Drehbuch/Regie/Kamera/Schnitt: Oskar Knapp
```

**Bewusst stehen geblieben** (keine Personendaten, nur eigene Arbeit und eine öffentliche
Auszeichnung, Betreiber-Entscheidung 2026-09-08): der About-Absatz über ALLEIN und den Sonderpreis,
das Feld `award` im Person-Schema, die Film-Erwähnungen im Fließtext von `llms.txt`, die
`meta name="description"`. Ebenfalls unangetastet: der YouTube-Abschnitt in
`datenschutz/index.html` (beschreibt das Klick-zu-Laden-Verfahren, das mit den Videos zurückkommt)
und das gesamte CSS (`.scene--projekte`, `.projects`, `.project*`, `.embed*`, `.award`) — die
Embed-Mechanik in `main.js` (`setupEmbeds`) bleibt ebenfalls unverändert, sie findet derzeit nur
kein `[data-yt]` mehr.

**HTML-Block (Szene 02, 1:1 wie ausgebaut):**

```html
    <section id="projekte" class="scene scene--projekte">
      <div class="scene-head" data-animate>
        <span class="slug">SZENE 02 / EXT. SET / TAG</span>
        <span class="tc" data-tc="00:01:23:04">TC&nbsp;00:01:23:04</span>
      </div>
      <h2 class="scene-title" data-split>PROJEKTE</h2>

      <div class="projects">

        <article class="project" data-animate>
          <span class="award">SONDERPREIS DER JURY / POSTCARD-CHALLENGE 2025/26</span>
          <div class="embed" data-yt="5XbbUtZ45v0">
            <img class="embed-thumb"
                 src="assets/thumbnails/was-kommt-danach.jpg"
                 alt="Standbild aus dem Kurzfilm Was kommt danach?" loading="lazy" width="640" height="344">
            <button class="embed-play" type="button" aria-label="Video abspielen">
              <svg viewBox="0 0 68 48" aria-hidden="true"><path class="yt-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/><path class="yt-tri" d="M45 24 27 14v20z"/></svg>
            </button>
          </div>
          <div class="project-info">
            <h3 class="project-title">POSTCARD-CHALLENGE</h3>
            <p class="project-meta">KURZFILM / KATEGORIE CLIP / 2025/26</p>
            <p class="project-desc">Teamprojekt am SZ Ybbs. Sonderpreis der Jury in der Kategorie Clip, vergeben von der Diözese St. Pölten im Mai 2026.</p>
          </div>
        </article>

        <article class="project" data-animate>

          <div class="embed" data-yt="QDq6b3w08eM">
            <img class="embed-thumb"
                 src="assets/thumbnails/thumbnail_allein.jpg"
                 alt="Standbild aus dem Kurzfilm ALLEIN" loading="lazy" width="1280" height="720">
            <button class="embed-play" type="button" aria-label="Video abspielen">
              <svg viewBox="0 0 68 48" aria-hidden="true"><path class="yt-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/><path class="yt-tri" d="M45 24 27 14v20z"/></svg>
            </button>
          </div>
          <div class="project-info">
            <h3 class="project-title">ALLEIN</h3>
            <p class="project-meta">KURZFILM / DRAMA / 2026</p>
            <p class="project-desc">Mein erster eigener Kurzfilm, ein Drama über Mobbing. Drehbuch, Regie, Kamera und Schnitt selbst gemacht.</p>
          </div>
        </article>

      </div>
    </section>
```

**JSON-LD-Blöcke (beide `VideoObject`, 1:1 wie ausgebaut):**

```json
      {
        "@type": "VideoObject",
        "@id": "https://okmedia.at/#video-was-kommt-danach",
        "name": "Was kommt danach?",
        "uploadDate": "2026-05-01",
        "description": "Kurzfilm, Teamprojekt am SZ Ybbs für die Postcard-Challenge 2025/26. Sonderpreis der Jury in der Kategorie Clip, vergeben von der Diözese St. Pölten im Mai 2026.",
        "thumbnailUrl": "https://okmedia.at/assets/thumbnails/was-kommt-danach.jpg",
        "contentUrl": "https://www.youtube.com/watch?v=5XbbUtZ45v0",
        "embedUrl": "https://www.youtube-nocookie.com/embed/5XbbUtZ45v0",
        "inLanguage": "de",
        "creator": { "@id": "https://okmedia.at/#oskar" }
      },
      {
        "@type": "VideoObject",
        "@id": "https://okmedia.at/#video-allein",
        "name": "ALLEIN",
        "uploadDate": "2026-02-01",
        "description": "Kurzfilm-Drama über Mobbing. Drehbuch, Regie, Kamera und Schnitt: Oskar Knapp.",
        "thumbnailUrl": "https://okmedia.at/assets/thumbnails/thumbnail_allein.jpg",
        "contentUrl": "https://www.youtube.com/watch?v=QDq6b3w08eM",
        "embedUrl": "https://www.youtube-nocookie.com/embed/QDq6b3w08eM",
        "inLanguage": "de",
        "creator": { "@id": "https://okmedia.at/#oskar" }
      }
```
