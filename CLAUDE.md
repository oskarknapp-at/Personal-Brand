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
- **Alle Animationen ≤ 600 ms.**
- **⚠️ KEIN KOMMENTAR IM AUSGELIEFERTEN CODE (PFLICHT):** `index.html`, `impressum/index.html`,
  `datenschutz/index.html`, `main.js`, `style.css` bleiben **komplett kommentarfrei** — kein
  `<!-- … -->`, kein `/* … */`, kein `//`. **Jede** Erklärung, Begründung oder Notiz gehört in
  **diese CLAUDE.md** (Abschnitt „Code-Notizen" für dauerhaftes Wissen, „Arbeitsprotokoll" für den
  Verlauf), niemals in den Quelltext. Betrifft auch TODOs und Platzhalter-Hinweise → als „Offene
  Punkte" hier führen, nicht als Kommentar im Code.
- **⚠️ VERSION — BEI JEDEM DEPLOY PFLICHT (EINE Zahl `N`, überall gleich):** Bei **jeder**
  Änderung, die live geht, `N` um 1 erhöhen und **in allen drei** HTML-Dateien
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
| `index.html` | Die gesamte Seite. Szenen: Hero, Projekte, Fotografie, About, Journey, Kontakt. (Szene 06 „Zusammenarbeit" + Projekte 3/4 ausgebaut, s. „Ausgeblendete Inhalte".) |
| `main.js` | Gesamtes Verhalten, in nummerierte Abschnitte (1–6) gegliedert – siehe unten. |
| `style.css` | Gesamtes Styling. Abschnitte per `/* ---------- … ---------- */`. Design-Tokens in `:root`. |
| `impressum/`, `datenschutz/` | Rechtstexte, eigene `index.html`, teilen sich `../style.css`. |
| `assets/` | Fotos (`DSC*`, `IMG*`), `thumbnails/` (YouTube-Standbilder), `fonts/`. |
| `robots.txt`, `sitemap.xml` | SEO. |
| `.github/workflows/static.yml` | Deploy (s. u.). |

## main.js – Abschnitte (Funktion → Zweck)
Alle `setup*()` werden am Dateiende aufgerufen; `initMotion()` nur bei erwünschter Bewegung.
1. `setupAge()` – Alter aus Geburtsdatum (27.08.2010), füllt `[data-age]`.
2. `setupProgress()` – roter Scroll-Fortschrittsbalken oben.
   2b. `setupBurger()` – Mobile-Burger-Menü (≤ 800px).
3. `loadYouTubeApi()` + `setupEmbeds()` – Klick-zu-Laden-YouTube via **IFrame-Player-API**,
   `onReady → playVideo()`. Ladezustand („LÄDT …", Thumbnail bleibt), 10-s-Timeout-Fallback.
   Platzhalter-IDs (`DEINE_…`) zeigen „VIDEO FOLGT".
   3b. `setupGallery()` – justiertes Reihen-Layout, Fotos werden nicht beschnitten.
4. `setupForm()` – Kontaktformular via **Web3Forms** (`fetch` auf `api.web3forms.com/submit`),
   ohne Reload. `access_key` steht als hidden input in `index.html` (öffentlich, kein Secret).
5. `tcToFrames()` / `framesToTc()` – Timecode-Hilfen, 24 fps, Format `HH:MM:SS:FF`.
6. `initMotion({…anime})` – alle Animationen (Hero-Timeline, Szenentitel, Timecode-Counter,
   generische `[data-animate]`-Reveals per `onScroll`).

## JS-Hooks (data-Attribute in HTML)
`data-age`, `data-split` (Text→Buchstaben), `data-tc` (Timecode), `data-yt` (YouTube-ID), `data-animate` (Scroll-Reveal).

## Design-Tokens (`:root` in style.css)
`--paper #E8E6E1`, `--ink #1C1B19`, `--red #E63321` (einzige Akzentfarbe), `--mono` (IBM Plex Mono),
`--display` (Archivo), `--gutter` (Seitenränder). Rot sparsam einsetzen.

## Konventionen
- **Version `N` (JEDES MAL beim Deploy!):** Es gibt **eine** Versionszahl, die an drei Stellen pro
  HTML-Datei steht und **immer identisch** ist:
  - Cache-Buster: `style.css?v=N`, `main.js?v=N` (im `<head>`).
  - Sichtbare Footer-Version: `<span>SCHNITT: ENDE / VN</span>` (Deploy-Marker für den Betreiber).
  Bei **jeder** Änderung, die live geht, `N` in **allen drei** HTML-Dateien (`index.html`,
  `impressum/`, `datenschutz/`) um 1 erhöhen — auch bei reinen HTML-Änderungen, damit der sichtbare
  Marker mitwandert und Betreiber + Claude denselben Stand ablesen. **Aktuell `N=24` (V24 / `v=24`).**
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
- **Formular-Honeypot** (`setupForm`): verstecktes, leer erwartetes Feld gegen Spam-Bots. Der
  Web3Forms-`access_key` ist ein **öffentlicher** Schlüssel und darf im Client-HTML stehen.
- **Szenen-Titel-Reveal** nutzt anime.js `sync: "play"`: einmal ausgelöst, läuft die Animation
  immer zu Ende, auch bei schnellem Weiterscrollen.
- **`.hero-frame video`:** `height: auto` überschreibt den `width`/`height`-Attribut-Hint am
  `<video>`, damit `aspect-ratio: 16/9` greift (sonst der 1:1-Bug aus V18, s. Historie).
- **Text-Split (`data-split`)** injiziert den ungeteilten Text als `.sr-only`-Span (Screenreader)
  und setzt die Einzelbuchstaben `aria-hidden` — **nicht** `aria-label` auf das Element (auf
  generischen `<span>` laut ARIA unzulässig, s. Historie V20).

---

## Arbeitsprotokoll

**Zweck:** Gedächtnis über Sessions hinweg. Künftige Aufgaben zuerst hier abgleichen, statt das
Repo neu zu indizieren. **Nach jeder erledigten Aufgabe pflegen:** „Aktueller Stand" anpassen,
Erledigtes aus „Offene Punkte" streichen, neuen Eintrag in „Historie" (oben = neu) ergänzen.
Reine Doku-Änderungen an dieser Datei brauchen **keinen** Versions-Bump (der Footer-Marker betrifft
nur die sichtbare Seite).

### Aktueller Stand (Stand 2026-07-24)
- **Live-Version:** V21 ist live (Search-Console-Fixes gemergt in `main`, Deploy `success`); **V22**
  (`v=22`, dieser Stand) ersetzt den About-Portrait-Platzhalter durch das echte Foto
  `assets/oskar-knapp-portrait.jpg` und ergänzt `image` im Person-Schema. Geht mit dem nächsten Merge
  live. (Ablauf: … → V20 = ARIA-Fix + kommentarfrei → V21 = `uploadDate` + Search-Console →
  V22 = About-Portrait.)
- **Lighthouse (23.07.26, Moto G Power / Slow 4G):** Performance 94, Accessibility 92,
  Best Practices 100, SEO 100, Agentic Browsing 2/3 → **nach V20-ARIA-Fix 3/3 erwartet**.
  Bewusst offen gelassen: **Kontrast** (Signalrot `#E63321` auf Papier = 3,46:1, unter AA 4,5:1
  für kleinen Text bei `.tc`/`.scroll-hint`/`.journey-cta`) — Betreiber will das helle Brand-Rot
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
- **Schema.org** (`index.html`): Person hat `alumniOf` (IT-HTL Ybbs), `award` **und `image`**
  (seit V22, `https://okmedia.at/assets/oskar-knapp-portrait.jpg`); zwei `VideoObject`
  (ALLEIN = `QDq6b3w08eM`, „Was kommt danach?" = `5XbbUtZ45v0`) — **beide seit V21 mit `uploadDate`**
  (monatsgenau, s. „Offene Punkte").
- **About-Portrait:** Echtes Foto `assets/oskar-knapp-portrait.jpg` (900×1200, 3:4, ~137 KB JPEG,
  EXIF entfernt) im `.about-portrait`-`<figure>`; CSS erzwingt `aspect-ratio: 3/4; object-fit: cover`.
  Betreiber lud das Original als `DSC05657.jpg` (3497×4663) auf `main`; jeweils auf 900×1200
  verkleinert, umbenannt, Original entfernt. **Seit V23** die verbesserte Fassung (Hintergrund/
  Steinwand weichgezeichnet → Fokus auf Person), gleiche Verarbeitung.
- **Hero-Bild → -Video:** Der Platzhalter im Hero ist seit V17 durch das Showreel-Video ersetzt
  (s. o.). Das frühere `<img fetchpriority="high">` gibt es dort nicht mehr.

### Offene Punkte (TODO)
- **Placeholder** (Betreiber liefert Medien selbst): `og:image`, 3× Journey-Videos
  (`data-yt="DEINE_YOUTUBE_ID"` + `placehold.co`-Thumbnails). Solange offen, keine Panik – sind
  bewusst so. (Hero-Showreel-Still nicht mehr offen: Der Hero zeigt jetzt das Video. Optional könnte
  später ein leichtes `poster="assets/…"`-Still für ersten Eindruck & reduced-motion nachgezogen
  werden.)
- **About-Portrait — erledigt (V22):** Echtes Foto `assets/oskar-knapp-portrait.jpg` (900×1200, 3:4,
  ~140 KB JPEG) ersetzt den Platzhalter; Person-Schema um `image` (absolute URL) ergänzt. Optional:
  `og:image` (1200×630 Querformat, aktuell noch `placehold.co`) auf ein echtes Bild umstellen — ein
  3:4-Portrait eignet sich dafür schlecht, daher separat offen gelassen.
- **VideoObject `uploadDate` — Tag verfeinern (optional):** Feld ist seit V21 gesetzt, aber nur
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
- **Backlog:** optional AAAA-/IPv6-Records; Journey-Serie zu echtem Content-Hub ausbauen
  (pro Folge Seite/Anchor + VideoObject + Textzusammenfassung).

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

## Ausgeblendete Inhalte (reaktivieren nach Gewerbeanmeldung)

**Grund:** Noch kein Gewerbe angemeldet → keine kommerziellen Angebote auf der Seite, auch nicht
als HTML-Kommentar im Quelltext. Die Blöcke unten sind der vollständige Originalstand und werden
**1:1 wieder eingebaut**, sobald das Gewerbe existiert. Bis dahin: nichts davon auf die Seite!

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
