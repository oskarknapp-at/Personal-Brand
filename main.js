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

function setupProgress() {
  const fill = $(".progress-fill");
  if (!fill) return;

  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    fill.style.width = `${(ratio * 100).toFixed(2)}%`;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
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
          },
          events: {
            onReady: (event) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
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

      status.textContent = "GESENDET / Danke, ich melde mich.";
      form.reset();
    } catch {
      status.dataset.state = "error";
      status.textContent = "FEHLER / Nachricht kam nicht durch. Schreib mir direkt per E-Mail.";
    } finally {
      submit.disabled = false;
    }
  });
}

const FPS = 24;

function tcToFrames(tc) {
  const [h, m, s, f] = tc.split(":").map(Number);
  return (h * 3600 + m * 60 + s) * FPS + f;
}

function framesToTc(total) {
  const frames = Math.max(0, Math.round(total));
  const f = frames % FPS;
  const seconds = Math.floor(frames / FPS);
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

setupAge();
setupProgress();
setupBurger();
setupEmbeds();
setupGallery();
setupEmailCheck();
setupForm();
setupHeroVideo();

if (!reducedMotion) {
  try {
    const anime = await import("https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm");
    initMotion(anime);
  } catch (error) {
    console.warn("anime.js konnte nicht geladen werden, Seite läuft ohne Animationen.", error);
  }
}
