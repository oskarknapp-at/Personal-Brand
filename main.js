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
