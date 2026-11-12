const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupAge() {
  const BIRTH_YEAR = 2010;
  const BIRTH_MONTH = 8;
  const BIRTH_DAY = 27;

  const now = new Date();
  let age = now.getFullYear() - BIRTH_YEAR;
  const beforeBirthday =
    now.getMonth() + 1 < BIRTH_MONTH ||
    (now.getMonth() + 1 === BIRTH_MONTH && now.getDate() < BIRTH_DAY);
  if (beforeBirthday) age -= 1;

  $$("[data-age]").forEach((el) => {
    el.textContent = String(age);
  });
}

const scrollWatchers = [];

function onScrollRatio(watcher) {
  scrollWatchers.push(watcher);
}

function setupScroll() {
  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    scrollWatchers.forEach((watcher) => watcher(ratio));
    ticking = false;
  };
  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request, { passive: true });
  update();
}

function setupProgress() {
  const fill = $(".progress-fill");
  if (!fill) return;

  onScrollRatio((ratio) => {
    fill.style.width = `${(ratio * 100).toFixed(2)}%`;
  });
}

function setupBurger() {
  const nav = $(".site-nav");
  const menu = $("#site-menu");
  const burger = $(".nav-burger");
  if (!nav || !menu || !burger) return;

  burger.hidden = false;
  nav.classList.add("has-burger");

  const isOpen = () => nav.classList.contains("is-open");

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  };

  burger.addEventListener("click", () => setOpen(!isOpen()));

  menu.addEventListener("click", (event) => {
    if (event.target === menu) setOpen(false);
  });

  $$("a", menu).forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) setOpen(false);
  });

  window.matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}

let ytApiPromise = null;
function loadYouTubeApi() {
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") previous();
      resolve(window.YT);
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });

  return ytApiPromise;
}

function setupEmbeds() {
  $$(".embed").forEach((embed) => {
    const button = $(".embed-play", embed);
    if (!button) return;

    button.addEventListener("click", () => {
      const id = embed.dataset.yt || "";

      if (!id || id.startsWith("DEINE_")) {
        const original = button.innerHTML;
        button.classList.add("embed-play--msg");
        button.textContent = "VIDEO FOLGT";
        button.disabled = true;
        setTimeout(() => {
          button.classList.remove("embed-play--msg");
          button.innerHTML = original;
          button.disabled = false;
        }, 2000);
        return;
      }

      if (embed.dataset.loading === "1") return;
      embed.dataset.loading = "1";

      const thumb = $(".embed-thumb", embed);
      const originalIcon = button.innerHTML;
      button.classList.add("embed-play--msg");
      button.textContent = "LÄDT …";
      button.disabled = true;
      embed.classList.add("embed--loading");

      const mount = document.createElement("div");
      embed.appendChild(mount);

      let settled = false;
      const fail = () => {
        if (settled) return;
        settled = true;
        $("iframe", embed)?.remove();
        mount.remove();
        embed.classList.remove("embed--loading");
        delete embed.dataset.loading;
        button.classList.remove("embed-play--msg");
        button.innerHTML = originalIcon;
        button.disabled = false;
      };
      const timer = setTimeout(fail, 10000);

      loadYouTubeApi().then((YT) => {
        if (settled) return;
        new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId: id,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
            cc_load_policy: 0,
          },
          events: {
            onReady: (event) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              if (typeof event.target.unloadModule === "function") {
                event.target.unloadModule("captions");
                event.target.unloadModule("cc");
              }
              event.target.playVideo();
              embed.classList.remove("embed--loading");
              if (thumb) thumb.remove();
              button.remove();
            },
          },
        });
      });
    });
  });
}

function setupGallery() {
  const grid = $(".gallery-grid");
  if (!grid) return;
  const items = $$(".gallery-item", grid);
  if (!items.length) return;

  items.forEach((item) => {
    const img = $("img", item);
    const w = parseFloat(img?.getAttribute("width"));
    const h = parseFloat(img?.getAttribute("height"));
    item._ar = w > 0 && h > 0 ? w / h : 1.5;
  });

  const layout = () => {
    const containerW = grid.clientWidth;
    if (!containerW) return;
    const gap = parseFloat(getComputedStyle(grid).gap) || 8;
    const target = containerW < 560 ? 190 : containerW < 900 ? 225 : 260;

    const flush = (row, arSum, isLast) => {
      const avail = containerW - gap * (row.length - 1);
      let h = avail / arSum;

      if (isLast && h > target * 1.3) h = target;
      h = Math.floor(h);
      row.forEach((item) => {
        item.style.height = `${h}px`;
        item.style.width = `${Math.floor(h * item._ar)}px`;
      });
    };

    let row = [];
    let arSum = 0;
    items.forEach((item) => {
      row.push(item);
      arSum += item._ar;
      const avail = containerW - gap * (row.length - 1);
      if (avail / arSum <= target) {
        flush(row, arSum, false);
        row = [];
        arSum = 0;
      }
    });
    if (row.length) flush(row, arSum, true);
  };

  grid.classList.add("is-justified");
  layout();

  let raf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layout);
  }, { passive: true });
}

const EMAIL_PATTERN = /^[^\s@]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

const MAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "gmx.at", "gmx.net", "gmx.de", "web.de",
  "hotmail.com", "outlook.com", "outlook.at", "live.at", "icloud.com",
  "yahoo.com", "aon.at", "a1.net", "chello.at", "kabsi.at",
];

const CHECK_ICON =
  '<svg class="field-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<circle class="check-ring" cx="12" cy="12" r="9"/>' +
  '<path class="check-mark" d="M7.6 12.3l2.9 2.9 5.9-6.3"/>' +
  '<path class="check-bang" d="M12 7.3v5.1"/>' +
  '<path class="check-dot" d="M12 16.4v0.01"/>' +
  "</svg>";

let checkEmail = () => true;

function editDistance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = row;
  }
  return prev[b.length];
}

function suggestDomain(domain) {
  const value = domain.toLowerCase();
  const dot = value.lastIndexOf(".");
  if (dot < 1 || MAIL_DOMAINS.includes(value)) return "";

  const name = value.slice(0, dot);
  const tld = value.slice(dot + 1);

  for (const known of MAIL_DOMAINS) {
    const knownDot = known.lastIndexOf(".");
    const knownName = known.slice(0, knownDot);
    const knownTld = known.slice(knownDot + 1);
    const limit = knownName.length <= 4 ? 1 : 2;

    if (knownTld === tld && editDistance(name, knownName) <= limit) return known;
    if (knownName === name && editDistance(tld, knownTld) === 1) return known;
  }
  return "";
}

function emailProblem(value) {
  const at = value.indexOf("@");
  if (at < 0) return "Das @-Zeichen fehlt.";
  if (at === 0) return "Vor dem @ fehlt der Name.";

  const domain = value.slice(at + 1);
  if (!domain) return "Nach dem @ fehlt die Domain, z. B. gmail.com";
  if (!domain.includes(".")) return "Der Domain fehlt die Endung, z. B. .at oder .com";
  return "Bitte eine vollständige E-Mail-Adresse eingeben.";
}

function setupEmailCheck() {
  const input = $("#email");
  if (!input) return;

  const field = input.closest(".field");
  const wrap = $(".field-input", field);
  const hint = $(".field-hint", field);
  if (!wrap || !hint) return;

  wrap.insertAdjacentHTML("beforeend", CHECK_ICON);

  let touched = false;
  let timer;
  let shown = "";

  const setHint = (key, render) => {
    if (shown === key) return;
    shown = key;
    hint.textContent = "";
    if (render) render();
  };

  const clear = () => {
    delete field.dataset.state;
    input.removeAttribute("aria-invalid");
    setHint("");
  };

  const evaluate = (force) => {
    const value = input.value.trim();
    if (!value) {
      clear();
      return true;
    }

    if (EMAIL_PATTERN.test(value)) {
      field.dataset.state = "ok";
      input.removeAttribute("aria-invalid");

      const at = value.lastIndexOf("@");
      const better = suggestDomain(value.slice(at + 1));
      if (!better) {
        setHint("");
        return true;
      }

      const fixed = `${value.slice(0, at)}@${better}`;
      setHint(`fix:${fixed}`, () => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "hint-fix";
        button.textContent = fixed;
        button.addEventListener("click", () => {
          input.value = fixed;
          touched = true;
          evaluate(true);
          input.focus();
        });
        hint.append("MEINTEST DU / ", button, " ?");
      });
      return true;
    }

    if (!force && !touched) {
      clear();
      return false;
    }

    field.dataset.state = "error";
    input.setAttribute("aria-invalid", "true");
    const text = emailProblem(value);
    setHint(text, () => {
      hint.textContent = text;
    });
    return false;
  };

  input.addEventListener("input", () => {
    clearTimeout(timer);
    if (touched) {
      evaluate(false);
      return;
    }
    timer = setTimeout(() => evaluate(false), 350);
  });

  input.addEventListener("blur", () => {
    clearTimeout(timer);
    if (input.value.trim()) touched = true;
    evaluate(true);
  });

  if (input.form) {
    input.form.addEventListener("reset", () => {
      clearTimeout(timer);
      touched = false;
      clear();
    });
  }

  checkEmail = () => {
    touched = true;
    return evaluate(true);
  };
}

const CLAPPER =
  '<svg class="clapper" viewBox="0 0 34 28" aria-hidden="true" focusable="false">' +
  '<rect class="clapper-board" x="2" y="12.5" width="30" height="13.5" rx="1.2"/>' +
  '<path class="clapper-rule" d="M6 18.5h22M6 22h13"/>' +
  '<g class="clapper-base"><rect x="2" y="8.5" width="30" height="4"/>' +
  '<path d="M9 8.5l-3 4M17 8.5l-3 4M25 8.5l-3 4"/></g>' +
  '<g class="clapper-arm"><rect x="2" y="4.5" width="30" height="4"/>' +
  '<path d="M6 4.5l3 4M14 4.5l3 4M22 4.5l3 4"/></g>' +
  "</svg>";

function setupForm() {
  const form = $(".contact-form");
  if (!form) return;

  const status = $(".form-status", form);
  const submit = $(".submit", form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    delete status.dataset.state;

    if (!form.access_key.value || form.access_key.value === "DEIN_ACCESS_KEY") {
      status.dataset.state = "error";
      status.textContent = "FEHLER / Formular noch nicht aktiv. Access Key von web3forms.com eintragen.";
      return;
    }

    if (!checkEmail()) {
      status.dataset.state = "error";
      status.textContent = "PRÜFEN / Bitte die E-Mail-Adresse korrigieren.";
      form.email.focus();
      return;
    }

    if (!form.message.value.trim()) {
      status.dataset.state = "error";
      status.textContent = "PRÜFEN / Bitte noch eine Nachricht schreiben.";
      form.message.focus();
      return;
    }

    submit.disabled = true;
    status.textContent = "SENDET ...";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      status.textContent = "GESENDET / Is im Kasten.";
      status.insertAdjacentHTML("afterbegin", CLAPPER);
      status.dataset.state = "sent";
      form.reset();
    } catch {
      status.dataset.state = "error";
      status.textContent = "FEHLER / Nachricht kam nicht durch. Schreib mir direkt per E-Mail.";
    } finally {
      submit.disabled = false;
    }
  });
}

const FPS = 25;

function tcToFrames(tc, fps = FPS) {
  const [h, m, s, f] = tc.split(":").map(Number);
  return (h * 3600 + m * 60 + s) * fps + f;
}

function framesToTc(total, fps = FPS) {
  const frames = Math.max(0, Math.round(total));
  const f = frames % fps;
  const seconds = Math.floor(frames / fps);
  const s = seconds % 60;
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}

function initMotion({ animate, createTimeline, onScroll, stagger, utils }) {
  $$("[data-split]").forEach((el) => {
    const text = el.textContent.trim();

    const sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = text;
    el.replaceChildren(
      sr,
      ...[...text].map((ch) => {
        const span = document.createElement("span");
        span.className = "char";
        span.setAttribute("aria-hidden", "true");
        span.textContent = ch === " " ? " " : ch;
        return span;
      })
    );
  });

  const heroChars = $$(".hero-name .char");
  const heroRest = [".hero-sub", ".scroll-hint"];

  utils.set(".scene--hero .scene-head", { opacity: 0 });
  utils.set(heroChars, { opacity: 0, translateY: "0.35em" });
  utils.set(".hero-statement", { opacity: 0, rotate: -5 });
  utils.set(heroRest, { opacity: 0 });

  const heroTimeline = createTimeline({ defaults: { ease: "outQuad" } });
  heroTimeline
    .add(".scene--hero .scene-head", { opacity: 1, duration: 400 })
    .add(heroChars, {
      opacity: 1,
      translateY: "0em",
      duration: 500,
      delay: stagger(28),
    }, "-=200")

    .add(".hero-statement", {
      opacity: 1,
      rotate: 0,
      duration: 450,
      ease: "outBack",
    }, "-=250")
    .add(heroRest, { opacity: 1, duration: 400 }, "-=200");

  $$(".scene-title").forEach((title) => {
    const chars = $$(".char", title);
    if (!chars.length) return;
    utils.set(chars, { opacity: 0, translateY: "0.3em" });
    animate(chars, {
      opacity: 1,
      translateY: "0em",
      duration: 450,
      delay: stagger(20),
      ease: "outQuad",

      autoplay: onScroll({ target: title, enter: "bottom-=10% top", sync: "play" }),
    });
  });

  $$(".tc[data-tc]").forEach((tcEl) => {
    const totalFrames = tcToFrames(tcEl.dataset.tc);
    if (!totalFrames) return;

    const counter = { f: 0 };
    tcEl.textContent = "TC 00:00:00:00";
    animate(counter, {
      f: totalFrames,
      duration: 600,
      ease: "outCubic",
      onUpdate: () => {
        tcEl.textContent = `TC ${framesToTc(counter.f)}`;
      },
      autoplay: onScroll({ target: tcEl, enter: "bottom-=5% top", sync: "play" }),
    });
  });

  $$("[data-animate]").forEach((el) => {
    utils.set(el, { opacity: 0, translateY: 32 });
    animate(el, {
      opacity: 1,
      translateY: 0,
      duration: 550,
      ease: "outQuad",
      autoplay: onScroll({ target: el, enter: "bottom-=8% top", sync: "play" }),
    });
  });
}

function setupHeroVideo() {
  const video = $(".hero-video");
  if (!video) return;

  if (reducedMotion) {
    video.removeAttribute("autoplay");
    video.pause();
    return;
  }

  video.play().catch(() => {});
}

const VIEWFINDER =
  '<div class="vf" aria-hidden="true">' +
  '<i class="vf-corner vf-corner--tl"></i><i class="vf-corner vf-corner--tr"></i>' +
  '<i class="vf-corner vf-corner--bl"></i><i class="vf-corner vf-corner--br"></i>' +
  '<div class="vf-group vf-group--tl">' +
  '<span class="vf-rec"><i class="vf-dot"></i>REC</span>' +
  '<span class="vf-tc">00:00:00:00</span>' +
  "</div>" +
  '<div class="vf-group vf-group--tr">' +
  '<svg class="vf-batt" viewBox="0 0 28 14" focusable="false">' +
  '<rect class="vf-batt-case" x="0.75" y="0.75" width="23.5" height="12.5" rx="2"/>' +
  '<rect class="vf-batt-tip" x="25.5" y="4.5" width="2" height="5" rx="0.6"/>' +
  '<rect class="vf-batt-level" x="2.75" y="2.75" width="19.5" height="8.5" rx="0.6"/>' +
  "</svg>" +
  '<span class="vf-pct">100%</span>' +
  "</div>" +
  '<div class="vf-group vf-group--br vf-extra">' +
  "<span>4K 25p</span><span>S-Log3</span><span>ISO 800</span><span>180.0°</span>" +
  "</div>" +
  "</div>";

function setupViewfinder() {
  const frame = $(".hero-frame");
  const video = $(".hero-video");
  if (!frame || !video) return;

  frame.insertAdjacentHTML("beforeend", VIEWFINDER);
  const vf = $(".vf", frame);
  const tc = $(".vf-tc", vf);
  const pct = $(".vf-pct", vf);
  const level = $(".vf-batt-level", vf);
  const levelWidth = parseFloat(level.getAttribute("width"));

  let shownFrame = -1;
  let shownRec = "";
  const paint = () => {
    const seconds = video.currentTime;
    const frameNo = Math.floor(seconds * FPS + 0.0001);
    if (frameNo !== shownFrame) {
      shownFrame = frameNo;
      tc.textContent = framesToTc(frameNo);
    }
    const rec = seconds % 1 < 0.5 ? "on" : "off";
    if (rec !== shownRec) {
      shownRec = rec;
      vf.dataset.rec = rec;
    }
  };

  let raf = 0;
  let inView = true;
  const loop = () => {
    paint();
    raf = requestAnimationFrame(loop);
  };
  const sync = () => {
    cancelAnimationFrame(raf);
    if (inView && !video.paused) loop();
    else paint();
  };

  ["playing", "pause", "seeked"].forEach((type) => video.addEventListener(type, sync));

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }).observe(frame);
  }

  sync();

  onScrollRatio((ratio) => {
    const charge = Math.round(100 - ratio * 85);
    pct.textContent = `${charge}%`;
    level.setAttribute("width", ((levelWidth * charge) / 100).toFixed(2));
    vf.dataset.battery = charge <= 20 ? "low" : "ok";
  });
}

const REEL_CORE = 4.5;
const REEL_FULL = 12;

const REEL =
  '<nav class="reel" aria-label="Szenen">' +
  '<svg class="reel-cam" viewBox="0 0 64 70" aria-hidden="true" focusable="false">' +
  '<path class="reel-film" d="M46 30.5V41q0 6-6 6H22.5q-6 0-6-6V30.5"/>' +
  '<g class="reel-spool" data-spool="take">' +
  '<circle class="reel-pack" cx="16.5" cy="16.5" r="4.5"/>' +
  '<circle cx="16.5" cy="16.5" r="14"/>' +
  '<g class="reel-spokes"><path d="M16.5 14.3V3.5M18.4 17.6l9.4 5.4M14.6 17.6l-9.4 5.4"/></g>' +
  '<circle class="reel-hub" cx="16.5" cy="16.5" r="2.2"/>' +
  "</g>" +
  '<g class="reel-spool" data-spool="feed">' +
  '<circle class="reel-pack" cx="46" cy="16.5" r="12"/>' +
  '<circle cx="46" cy="16.5" r="14"/>' +
  '<g class="reel-spokes"><path d="M46 14.3V3.5M47.9 17.6l9.4 5.4M44.1 17.6l-9.4 5.4"/></g>' +
  '<circle class="reel-hub" cx="46" cy="16.5" r="2.2"/>' +
  "</g>" +
  '<rect x="7" y="33" width="44" height="30" rx="2"/>' +
  '<path d="M51 41h5v14h-5M56 43.5l6.5-4.5v18l-6.5-4.5"/>' +
  '<path d="M24 63v4h12v-4"/>' +
  "</svg>" +
  '<div class="reel-track"><i class="reel-pos"></i></div>' +
  '<p class="reel-label" aria-hidden="true"></p>' +
  "</nav>";

function setupReel() {
  const scenes = $$("main > .scene[id]");
  if (!scenes.length) return;

  document.body.insertAdjacentHTML("beforeend", REEL);
  document.documentElement.classList.add("has-reel");

  const reel = $(".reel");
  const track = $(".reel-track", reel);
  const pos = $(".reel-pos", reel);
  const label = $(".reel-label", reel);
  const film = $(".reel-film", reel);
  const spools = {};
  $$(".reel-spool", reel).forEach((spool) => {
    const pack = $(".reel-pack", spool);
    spools[spool.dataset.spool] = {
      pack,
      spokes: $(".reel-spokes", spool),
      cx: pack.getAttribute("cx"),
      cy: pack.getAttribute("cy"),
    };
  });

  const wide = window.matchMedia("(min-width: 1100px) and (min-height: 560px)");
  let ratio = 0;
  let hovered = "";

  const marks = scenes.map((scene, index) => {
    const number = String(index + 1).padStart(2, "0");
    const title = $(".scene-title", scene)?.textContent.trim() || "Start";
    const link = document.createElement("a");
    link.className = "reel-mark";
    link.href = `#${scene.id}`;
    link.setAttribute("aria-label", `Szene ${number}, ${title}`);
    const name = `SZENE ${number}`;
    const show = () => {
      hovered = name;
      render();
    };
    const hide = () => {
      hovered = "";
      render();
    };
    link.addEventListener("pointerenter", show);
    link.addEventListener("pointerleave", hide);
    link.addEventListener("focus", show);
    link.addEventListener("blur", hide);
    track.appendChild(link);
    return { scene, link, name, at: 0 };
  });

  const radius = (fill) =>
    Math.sqrt(REEL_CORE ** 2 + (REEL_FULL ** 2 - REEL_CORE ** 2) * fill).toFixed(2);

  function render() {
    if (!wide.matches) return;

    const turn = reducedMotion ? 0 : ratio * 1440;
    spools.feed.pack.setAttribute("r", radius(1 - ratio));
    spools.take.pack.setAttribute("r", radius(ratio));
    Object.values(spools).forEach(({ spokes, cx, cy }) => {
      spokes.setAttribute("transform", `rotate(${turn.toFixed(1)} ${cx} ${cy})`);
    });
    film.style.strokeDashoffset = reducedMotion ? "0" : (-ratio * 260).toFixed(1);
    reel.dataset.film = ratio > 0.995 ? "out" : "in";
    pos.style.top = `${(ratio * 100).toFixed(2)}%`;

    let current = marks[0];
    marks.forEach((mark) => {
      if (mark.at <= ratio + 0.004) current = mark;
    });
    marks.forEach((mark) => {
      if (mark === current) mark.link.setAttribute("aria-current", "true");
      else mark.link.removeAttribute("aria-current");
    });
    label.textContent = hovered || current.name;
  }

  const measure = () => {
    if (!wide.matches) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    marks.forEach((mark, index) => {
      const top = mark.scene.getBoundingClientRect().top + window.scrollY - offset;
      mark.at = index === 0 || max <= 0 ? 0 : Math.min(1, Math.max(0, top / max));
      mark.link.style.top = `${(mark.at * 100).toFixed(2)}%`;
    });
    render();
  };

  onScrollRatio((value) => {
    ratio = value;
    render();
  });

  wide.addEventListener("change", measure);
  window.addEventListener("load", measure);
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(document.body);
  measure();
}

const DRONE_VIEW = { fov: 31.42, position: [0.5, 0.34, -0.66], target: [0, 0.004, 0] };

async function startDrone(stage) {
  const canvas = document.createElement("canvas");
  canvas.className = "drone-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const context = canvas.getContext("webgl2", {
    antialias: true,
    alpha: true,
    failIfMajorPerformanceCaveat: true,
  });
  if (!context) return;

  const T = await import("./assets/vendor/three-drohne.min.js");

  const renderer = new T.WebGLRenderer({ canvas, context, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(DRONE_VIEW.fov, 4 / 3, 0.05, 5);
  camera.position.set(...DRONE_VIEW.position);
  camera.lookAt(...DRONE_VIEW.target);

  scene.add(new T.HemisphereLight(0xffffff, 0x808080, 2));
  const key = new T.DirectionalLight(0xffffff, 3.4);
  key.position.set(0.5, 0.9, -0.5);
  const rim = new T.DirectionalLight(0xffffff, 2.2);
  rim.position.set(-0.3, 0.6, 0.9);
  scene.add(key, rim);

  const loader = new T.GLTFLoader();
  loader.setMeshoptDecoder(T.MeshoptDecoder);
  const gltf = await loader.loadAsync("assets/drohne/mavic-3-classic.glb");

  const craft = new T.Group();
  craft.add(gltf.scene);
  scene.add(craft);

  const arms = [];
  const blades = [];
  const props = [];
  gltf.scene.traverse((node) => {
    const data = node.userData;
    if (data.fold_axis) {
      const joint = { node, axis: new T.Vector3(...data.fold_axis), angle: data.fold_angle };
      if (node.name.startsWith("Blatt")) blades.push(joint);
      else arms.push({ ...joint, rear: node.name.startsWith("Arm_R") });
    }
    if (data.spin_axis) {
      const turn = /_(FR|RL)$/.test(node.name) ? 1 : -1;
      props.push({ node, axis: new T.Vector3(...data.spin_axis), turn, phase: 0 });
    }
  });

  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const fold = (joint, folded) => {
    joint.node.quaternion.setFromAxisAngle(joint.axis, joint.angle * folded);
  };
  const pose = (ms) => {
    arms.forEach((arm) => fold(arm, 1 - ease(arm.rear ? (ms - 160) / 440 : ms / 420)));
    blades.forEach((blade) => fold(blade, 1 - ease((ms - 300) / 300)));
  };

  const fit = () => {
    const width = stage.clientWidth;
    if (width) renderer.setSize(width, Math.round(width * 0.75), false);
  };
  fit();
  pose(0);
  renderer.render(scene, camera);
  stage.appendChild(canvas);
  stage.classList.add("is-live");

  let visible = false;
  let opened = -1;
  let settled = false;
  let raf = 0;
  let last = 0;
  let lastY = window.scrollY;
  let velocity = 0;
  let spin = 0;
  let pitch = 0;
  let pitchSpeed = 0;
  let clock = 0;

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (!dt) return;

    const y = window.scrollY;
    velocity += ((y - lastY) / dt - velocity) * (1 - Math.exp(-dt / 0.22));
    lastY = y;
    const drive = Math.max(-1, Math.min(1, velocity / 2200));

    if (opened < 0) return;
    const since = now - opened;
    if (!settled) {
      pose(since);
      settled = since >= 600;
    }

    const flying = since > 600;
    spin += ((flying ? 6 + Math.abs(drive) * 30 : 0) - spin) * (1 - Math.exp(-dt / 0.45));
    props.forEach((prop) => {
      prop.phase += spin * dt * prop.turn;
      prop.node.quaternion.setFromAxisAngle(prop.axis, prop.phase);
    });

    const aim = flying ? -drive * 0.14 : 0;
    pitchSpeed += ((aim - pitch) * 38 - pitchSpeed * 10.5) * dt;
    pitch += pitchSpeed * dt;
    craft.rotation.x = pitch;

    clock += dt;
    const calm = flying ? 1 - Math.abs(drive) : 0;
    craft.position.y = Math.sin(clock * 1.5) * 0.005 * calm;
    craft.rotation.z = Math.sin(clock * 0.9) * 0.012 * calm;

    renderer.render(scene, camera);
  };

  const sync = () => {
    cancelAnimationFrame(raf);
    last = 0;
    lastY = window.scrollY;
    velocity = 0;
    if (visible) raf = requestAnimationFrame(frame);
  };

  new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    visible = entry.isIntersecting;
    if (opened < 0 && entry.intersectionRatio >= 0.45) opened = performance.now();
    sync();
  }, { threshold: [0, 0.45] }).observe(stage);

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      fit();
      renderer.render(scene, camera);
    }).observe(stage);
  }
}

function setupDrone() {
  const stage = $(".drone-stage");
  if (!stage || reducedMotion) return;
  if (!window.matchMedia("(min-width: 801px)").matches) return;
  if (!("IntersectionObserver" in window) || !("WebGL2RenderingContext" in window)) return;

  const near = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    near.disconnect();
    startDrone(stage).catch((error) => {
      console.warn("3D-Drohne konnte nicht geladen werden, das Standbild bleibt stehen.", error);
    });
  }, { rootMargin: "700px 0px" });
  near.observe(stage);
}

setupAge();
setupProgress();
setupViewfinder();
setupReel();
setupBurger();
setupEmbeds();
setupGallery();
setupEmailCheck();
setupForm();
setupHeroVideo();
setupDrone();
setupScroll();

if (!reducedMotion) {
  try {
    const anime = await import("https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm");
    initMotion(anime);
  } catch (error) {
    console.warn("anime.js konnte nicht geladen werden, Seite läuft ohne Animationen.", error);
  }
}
