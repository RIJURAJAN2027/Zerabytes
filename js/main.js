/* =========================================================
   COFFEE SAGAA — interactions & animation
   GSAP + ScrollTrigger + Lenis (vendored in js/vendor)
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none)").matches;
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Menu render (works even without GSAP) ---------- */
  const MENU = window.SAGAA_MENU || [];
  const visualFor = { coffee: "ill-tumbler", tea: "ill-cup", milk: "ill-cup", coolers: "ill-cold", buns: "ill-bun", momos: "ill-momo", sandwich: "ill-korean", snacks: "ill-fries" };
  const tabsEl = $("#menuTabs"), listEl = $("#menuList"), noteEl = $("#menuNote"), visUse = $("#menuVisualUse");
  const visSvg = visUse.closest("svg");
  const viewBoxes = { "ill-tumbler": "0 0 240 270", "ill-cup": "0 0 200 290", "ill-cold": "0 0 200 290", "ill-bun": "0 0 220 170", "ill-momo": "0 0 220 170", "ill-korean": "0 0 220 170", "ill-fries": "0 0 220 200" };

  function renderList(cat) {
    listEl.innerHTML = cat.items.map(([name, price, desc], i) =>
      `<li><span class="n">${String(i + 1).padStart(2, "0")}</span><span class="name">${name}${desc ? `<span class="desc">${desc}</span>` : ""}</span><span class="price">${price}</span></li>`
    ).join("");
    noteEl.textContent = cat.note || "";
    const sym = visualFor[cat.id] || "ill-tumbler";
    visUse.setAttribute("href", "#" + sym);
    visSvg.setAttribute("viewBox", viewBoxes[sym]);
  }
  tabsEl.innerHTML = MENU.map((c, i) => `<button role="tab" data-i="${i}" class="${i === 0 ? "is-active" : ""}">${c.title}</button>`).join("");
  if (MENU.length) renderList(MENU[0]);

  let menuBusy = false;
  tabsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b || b.classList.contains("is-active") || menuBusy) return;
    $$("button", tabsEl).forEach((x) => x.classList.toggle("is-active", x === b));
    const cat = MENU[+b.dataset.i];
    if (!window.gsap || reduceMotion) return renderList(cat);
    menuBusy = true;
    gsap.timeline({ onComplete: () => (menuBusy = false) })
      .to(listEl.children, { y: -16, opacity: 0, duration: .25, stagger: .015, ease: "power2.in" })
      .to(visSvg, { scale: .6, rotate: -25, opacity: 0, duration: .3, ease: "power2.in" }, 0)
      .add(() => {
        renderList(cat);
        gsap.from(listEl.children, { y: 24, opacity: 0, duration: .5, stagger: .035, ease: "power3.out", onComplete: () => ScrollTrigger.refresh() });
      })
      .fromTo(visSvg, { scale: .6, rotate: 25, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: .7, ease: "back.out(1.6)" });
  });

  /* ---------- Mobile menu ---------- */
  $("#burger").addEventListener("click", () => document.body.classList.toggle("menu-open"));

  /* ---------- Clock face ---------- */
  const face = $("#clockFace");
  for (let i = 0; i < 60; i++) {
    const t = document.createElement("i");
    t.className = "tick" + (i % 5 === 0 ? " major" : "");
    t.style.transform = `rotate(${i * 6}deg)`;
    face.appendChild(t);
  }
  for (let h = 1; h <= 12; h++) {
    const n = document.createElement("span");
    const a = (h * 30 - 90) * Math.PI / 180;
    n.className = "num"; n.textContent = h;
    n.style.left = 50 + Math.cos(a) * 38 + "%";
    n.style.top = 50 + Math.sin(a) * 38 + "%";
    face.appendChild(n);
  }

  /* ---------- Video slot ---------- */
  const film = $("#film"), vid = $("#filmVideo"), soundBtn = $("#filmSound");
  vid.addEventListener("loadeddata", () => { film.classList.add("has-video"); soundBtn.hidden = false; });
  vid.addEventListener("error", () => film.classList.remove("has-video"), true);
  soundBtn.addEventListener("click", () => { vid.muted = !vid.muted; soundBtn.textContent = vid.muted ? "Sound off" : "Sound on"; });

  /* ---------- No GSAP fallback ---------- */
  const finishLoader = () => { $("#loader").style.display = "none"; document.body.classList.remove("is-loading"); };
  if (!window.gsap || !window.ScrollTrigger) {
    finishLoader();
    $$(".story__text").forEach((el) => (el.style.opacity = 1));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href"); if (!id || !id.startsWith("#")) return;
    e.preventDefault(); document.body.classList.remove("menu-open");
    const target = id === "#top" ? 0 : $(id);
    lenis ? lenis.scrollTo(target, { duration: 1.6 }) : (target === 0 ? scrollTo({ top: 0, behavior: "smooth" }) : target.scrollIntoView({ behavior: "smooth" }));
  }));

  /* ---------- Nav hide/show ---------- */
  const nav = $("#nav"); let lastY = 0;
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => {
    const y = s.scroll(); nav.classList.toggle("is-hidden", y > lastY && y > 200 && !document.body.classList.contains("menu-open")); lastY = y;
  }});

  /* ---------- Split helpers ---------- */
  $$(".reveal-lines > span").forEach((line) => { line.innerHTML = `<span>${line.innerHTML}</span>`; });
  const storyText = $("#storyText");
  storyText.innerHTML = storyText.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");

  /* =========================================================
     PRELOADER
     ========================================================= */
  const counter = $("#loaderCount"), liquid = $("#loaderLiquid"), wave = $("#loaderWave");
  gsap.to(wave, { x: -80, duration: 1.2, ease: "none", repeat: -1 });
  const prog = { v: 0 };
  const loaderTl = gsap.timeline();
  loaderTl
    .from(".loader__cup", { y: 60, opacity: 0, duration: .8, ease: "power3.out" })
    .from(".loader__count, .loader__tag, .loader__brand", { opacity: 0, y: 20, stagger: .08, duration: .6 }, 0)
    .to(prog, {
      v: 100, duration: reduceMotion ? .3 : 2.6, ease: "power2.inOut",
      onUpdate: () => {
        const v = Math.round(prog.v);
        counter.textContent = String(v).padStart(3, "0");
        liquid.setAttribute("transform", `translate(0 ${200 - (prog.v / 100) * 184})`);
      },
    }, .2)
    .to(".loader__cup", { y: -20, rotate: -6, duration: .5, ease: "power2.out" })
    .to(".loader__count, .loader__tag, .loader__brand", { y: -40, opacity: 0, duration: .5, stagger: .05, ease: "power2.in" }, "<")
    .to("#loader", { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "-=.15")
    .add(() => { finishLoader(); lenis && lenis.start(); heroIntro.play(); }, "-=.55");
  gsap.set("#loader", { clipPath: "inset(0 0 0% 0)" });

  /* =========================================================
     HERO
     ========================================================= */
  const heroIntro = gsap.timeline({ paused: true });
  heroIntro
    .from(".hero__title .word", { yPercent: 110, duration: 1.1, stagger: .07, ease: "expo.out" })
    .from("#heroScript", { opacity: 0, x: -30, rotate: -8, duration: 1.2, ease: "expo.out" }, .35)
    .from(".hero__eyebrow, .hero__sub, .hero__copy .link-arrow, .hero__info > div, .hero__scroll", { y: 24, opacity: 0, stagger: .06, duration: .9, ease: "power3.out" }, .2)
    .from(".prod--bag", { y: 300, rotate: 25, opacity: 0, duration: 1.4, ease: "expo.out" }, .1)
    .from(".prod--cup", { y: 360, rotate: -30, opacity: 0, duration: 1.4, ease: "expo.out" }, .2)
    .from(".prod--tumbler", { y: 300, x: 100, rotate: 20, opacity: 0, duration: 1.4, ease: "expo.out" }, .3)
    .from(".bean-float", { scale: 0, opacity: 0, stagger: .1, duration: 1, ease: "back.out(2)" }, .5)
    .from("#heroTag", { clipPath: "inset(0 100% 0 0)", duration: 1, ease: "expo.inOut" }, .6);

  // idle float
  if (!reduceMotion) {
    gsap.to(".prod--bag svg", { y: -14, rotate: 2, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".prod--cup svg", { y: -20, rotate: -3, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: .4 });
    gsap.to(".prod--tumbler svg", { y: -12, rotate: 3, duration: 2.9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: .8 });
    $$(".bean-float").forEach((b, i) => gsap.to(b, { y: "+=" + (14 + i * 6), rotate: 60 + i * 40, duration: 3 + i, ease: "sine.inOut", yoyo: true, repeat: -1 }));
  }

  // mouse parallax
  if (!isTouch && !reduceMotion) {
    const layers = $$("#heroStage [data-depth]").map((el) => ({ el, d: +el.dataset.depth, qx: gsap.quickTo(el, "x", { duration: 1, ease: "power3" }), qy: gsap.quickTo(el, "y", { duration: 1, ease: "power3" }) }));
    $("#hero").addEventListener("mousemove", (e) => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      layers.forEach((l) => { l.qx(nx * 26 * l.d); l.qy(ny * 20 * l.d); });
    });
  }

  // scroll out
  gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } })
    .to(".prod--bag", { yPercent: -40, rotate: 18, xPercent: 20 }, 0)
    .to(".prod--cup", { yPercent: -70, rotate: -24, scale: 1.1 }, 0)
    .to(".prod--tumbler", { yPercent: 40, rotate: 14, xPercent: -30 }, 0)
    .to(".hero__copy", { yPercent: -30, opacity: 0 }, 0)
    .to(".hero__bg", { scale: 1.25 }, 0);

  // product tag cycling
  const tagItems = [
    ["MADRAS FILTER COFFEE", "₹30", "NO. 01 · DECOCTION · BRASS FILTER"],
    ["MADURAI SPECIAL BUN", "₹80", "NO. 02 · CRISPY OUTSIDE · SOFT INSIDE"],
    ["KOREAN CHEESE BUN", "₹120", "NO. 03 · CREAM CHEESE · GARLIC"],
    ["PERI PERI MOMOS", "₹130", "NO. 04 · HOME MADE · VEG / PANEER"],
    ["HAZELNUT FILTER COFFEE", "₹50", "NO. 05 · FLAVOURED DECOCTION"],
  ];
  let tagI = 0;
  setInterval(() => {
    if (document.hidden) return;
    tagI = (tagI + 1) % tagItems.length;
    const [n, p, m] = tagItems[tagI];
    gsap.timeline()
      .to("#heroTag > *", { yPercent: -100, opacity: 0, duration: .3, stagger: .04, ease: "power2.in" })
      .add(() => { $("#tagName").textContent = n; $("#tagPrice").textContent = p; $("#tagMeta").textContent = m; })
      .fromTo("#heroTag > *", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, stagger: .05, ease: "power3.out" });
  }, 3200);

  // script word cycling
  const scriptWords = ["saga", "morning", "midnight", "mood", "saga"];
  let sI = 0;
  const scriptEl = $("#heroScript");
  setInterval(() => {
    if (document.hidden || scrollY > innerHeight) return;
    sI = (sI + 1) % scriptWords.length;
    gsap.timeline()
      .to(scriptEl, { opacity: 0, y: -20, filter: "blur(6px)", duration: .4, ease: "power2.in" })
      .add(() => (scriptEl.textContent = scriptWords[sI]))
      .fromTo(scriptEl, { opacity: 0, y: 20, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .7, ease: "power3.out" });
  }, 4200);

  // steam particles
  (function steam() {
    const c = $("#steam"); if (!c || reduceMotion) return;
    const ctx = c.getContext("2d"); let w, h, dpr = Math.min(devicePixelRatio, 2);
    const parts = [];
    const resize = () => { w = c.offsetWidth; h = c.offsetHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener("resize", resize);
    const src = () => { const t = $(".prod--tumbler").getBoundingClientRect(), hr = $("#hero").getBoundingClientRect(); return { x: t.left - hr.left + t.width / 2, y: t.top - hr.top + t.height * .12 }; };
    let visible = true;
    ScrollTrigger.create({ trigger: "#hero", start: "top bottom", end: "bottom top", onToggle: (s) => (visible = s.isActive) });
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      if (parts.length < 40 && Math.random() < .35) { const s = src(); parts.push({ x: s.x + (Math.random() - .5) * 40, y: s.y, r: 10 + Math.random() * 14, life: 0, max: 120 + Math.random() * 80, sway: Math.random() * Math.PI * 2 }); }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.life++; p.y -= .7; p.r += .18; p.x += Math.sin(p.sway + p.life * .04) * .5;
        const a = Math.sin((p.life / p.max) * Math.PI) * .12;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(243,234,219,${a})`); g.addColorStop(1, "rgba(243,234,219,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        if (p.life > p.max) parts.splice(i, 1);
      }
    })();
  })();

  /* =========================================================
     MARQUEE
     ========================================================= */
  const track = $("#marquee");
  track.innerHTML += track.innerHTML;
  const marqueeTween = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    trigger: ".marquee", start: "top bottom", end: "bottom top",
    onUpdate: (s) => {
      const v = Math.min(Math.abs(s.getVelocity()) / 400, 5);
      gsap.to(marqueeTween, { timeScale: (s.direction < 0 ? -1 : 1) * (1 + v), duration: .2, overwrite: true });
      gsap.to(marqueeTween, { timeScale: s.direction < 0 ? -1 : 1, duration: 1.2, delay: .2 });
    },
  });

  /* =========================================================
     GENERIC LINE REVEALS
     ========================================================= */
  $$(".reveal-lines").forEach((el) => {
    gsap.from($$(":scope > span > span", el), {
      yPercent: 110, duration: 1.1, stagger: .09, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
  $$("section .eyebrow").forEach((el) => gsap.from(el, { opacity: 0, x: -20, duration: .8, scrollTrigger: { trigger: el, start: "top 90%" } }));

  /* =========================================================
     FAVOURITES
     ========================================================= */
  const swash = $("#swashPath");
  const len = swash.getTotalLength();
  gsap.set(swash, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(swash, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".favs", start: "top 80%", end: "bottom 40%", scrub: 1 } });

  gsap.from(".card", {
    y: 120, rotate: (i) => (i % 2 ? 4 : -4), opacity: 0, duration: 1.2, stagger: .08, ease: "expo.out",
    scrollTrigger: { trigger: "#favGrid", start: "top 85%" },
  });
  gsap.from(".card__img", {
    scale: .5, rotate: -20, duration: 1.4, stagger: .08, ease: "back.out(1.6)",
    scrollTrigger: { trigger: "#favGrid", start: "top 85%" },
  });

  /* =========================================================
     STORY
     ========================================================= */
  const words = $$(".w", storyText);
  gsap.to(words, { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: storyText, start: "top 80%", end: "bottom 45%", scrub: true } });
  $$(".count").forEach((el) => {
    const to = +el.dataset.to, suf = el.dataset.suffix || "", o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" }, onUpdate: () => (el.textContent = Math.round(o.v) + suf) });
  });

  /* =========================================================
     FILM
     ========================================================= */
  gsap.fromTo("#filmFrame", { scale: .72, borderRadius: 40 }, { scale: 1, borderRadius: 6, ease: "none", scrollTrigger: { trigger: "#film", start: "top bottom", end: "top 15%", scrub: true } });
  gsap.from(".film__overlay .display", { yPercent: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#filmFrame", start: "top 50%" } });
  ScrollTrigger.create({ trigger: "#filmFrame", start: "top 80%", end: "bottom 20%", onToggle: (s) => { if (!film.classList.contains("has-video")) return; s.isActive ? vid.play().catch(() => {}) : vid.pause(); } });

  /* =========================================================
     MENU
     ========================================================= */
  gsap.from("#menuTabs button", { y: 20, opacity: 0, stagger: .04, duration: .6, ease: "power3.out", scrollTrigger: { trigger: "#menuTabs", start: "top 90%" } });
  gsap.from("#menuVisual", { scale: .6, rotate: -40, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "#menuVisual", start: "top 85%" } });
  gsap.from(listEl.children, { y: 30, opacity: 0, stagger: .04, duration: .7, ease: "power3.out", scrollTrigger: { trigger: listEl, start: "top 85%" } });
  if (!isTouch) gsap.to("#menuVisual svg", { y: -10, rotate: -4, duration: 2.5, ease: "sine.inOut", yoyo: true, repeat: -1 });

  /* =========================================================
     VISIT — scroll-driven clock 07:00 → 00:00
     ========================================================= */
  const handH = $("#handH"), handM = $("#handM"), readout = $("#clockReadout"), ampm = readout.nextElementSibling, clockLine = $("#clockLine");
  const moments = [
    [7, "First decoction of the day."],
    [9, "Office rush — filter coffee to go."],
    [12, "Lunch break? Momos are steaming."],
    [16, "4 PM. Bun butter jam o'clock."],
    [19, "Evening adda with friends."],
    [22, "Late-night Maggie & cheesy fries."],
    [23.5, "Last pour before midnight."],
  ];
  const setClock = (hours) => {
    const h = hours % 24;
    handH.style.transform = `rotate(${hours * 30}deg)`;
    handM.style.transform = `rotate(${hours * 360}deg)`;
    let hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 5) * 5;
    const isPM = hh >= 12 && hours < 24; const disp = hh % 12 === 0 ? 12 : hh % 12;
    readout.textContent = `${String(disp).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    ampm.textContent = hours >= 24 ? "AM" : isPM ? "PM" : "AM";
    let line = moments[0][1]; moments.forEach(([t, l]) => { if (hours >= t) line = l; });
    if (clockLine.textContent !== line) clockLine.textContent = line;
  };
  setClock(7);
  const clockState = { h: 7 };
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    gsap.timeline({ scrollTrigger: { trigger: "#visit", start: "top top", end: "+=220%", pin: ".visit__pin", scrub: .6 } })
      .to(clockState, { h: 24, ease: "none", onUpdate: () => setClock(clockState.h) })
      .fromTo(".clock__center svg", { scale: .85, y: 10 }, { scale: 1.05, y: -6, ease: "none" }, 0);
    gsap.from(".clock", { scale: .6, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#visit", start: "top 70%" } });
  });
  mm.add("(max-width: 900px)", () => {
    gsap.to(clockState, { h: 24, ease: "none", onUpdate: () => setClock(clockState.h), scrollTrigger: { trigger: ".clock", start: "top 80%", end: "bottom 10%", scrub: .6 } });
  });

  /* =========================================================
     CITY — falling beans + cup + receipt print
     ========================================================= */
  (function beans() {
    const c = $("#beans"); if (!c) return;
    const ctx = c.getContext("2d"); let w, h, dpr = Math.min(devicePixelRatio, 2), on = false, scrollV = 0;
    const resize = () => { w = c.offsetWidth; h = c.offsetHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener("resize", resize);
    const N = innerWidth < 700 ? 22 : 46;
    const bs = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), z: .3 + Math.random() * .9, r: Math.random() * 6, vr: (Math.random() - .5) * .03, vy: .0006 + Math.random() * .0012 }));
    const drawBean = (x, y, s, r, blur) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s);
      ctx.globalAlpha = blur ? .35 : .9;
      ctx.fillStyle = "#4a2914"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 12.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(160,100,60,.35)"; ctx.beginPath(); ctx.ellipse(-4, -4, 9, 4, -.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#1a0c05"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-14, 3); ctx.quadraticCurveTo(0, -7, 15, -1); ctx.stroke();
      ctx.restore();
    };
    ScrollTrigger.create({ trigger: "#city", start: "top bottom", end: "bottom top", onToggle: (s) => (on = s.isActive), onUpdate: (s) => (scrollV = s.getVelocity() / 6000) });
    (function loop() {
      requestAnimationFrame(loop); if (!on) return;
      ctx.clearRect(0, 0, w, h);
      bs.forEach((b) => {
        b.y += (b.vy + Math.max(scrollV, -0.002) * .02) * b.z * (reduceMotion ? 0 : 1); b.r += b.vr;
        if (b.y > 1.05) { b.y = -.05; b.x = Math.random(); }
        if (b.y < -.06) b.y = 1.04;
        drawBean(b.x * w, b.y * h, b.z * 1.1, b.r, b.z < .55);
      });
      scrollV *= .92;
    })();
  })();

  gsap.from("#cityCup", { x: -200, rotate: -40, opacity: 0, ease: "none", scrollTrigger: { trigger: ".city__row", start: "top 95%", end: "top 40%", scrub: 1 } });
  gsap.fromTo("#receipt", { yPercent: -100 }, { yPercent: 0, ease: "steps(22)", scrollTrigger: { trigger: ".receipt-wrap", start: "top 80%", end: "top 20%", scrub: true } });
  gsap.from(".city__copy, .city__foot > *", { y: 30, opacity: 0, stagger: .1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".city__row", start: "top 75%" } });

  /* =========================================================
     FOOTER
     ========================================================= */
  const fw = $("#footerWord span");
  fw.innerHTML = fw.textContent.split("").map((ch) => `<span class="ch" style="display:inline-block">${ch === " " || ch === " " ? "&nbsp;" : ch}</span>`).join("");
  gsap.from(".footer__word .ch", { yPercent: 100, opacity: 0, stagger: .035, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".footer__word", start: "top 95%" } });
  gsap.from(".footer__word .logo-mark", { rotate: -180, scale: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".footer__word", start: "top 95%" } });

  /* =========================================================
     CURSOR + MAGNETIC
     ========================================================= */
  if (!isTouch) {
    const cur = $("#cursor"), label = $("#cursorLabel");
    const qx = gsap.quickTo(cur, "x", { duration: .35, ease: "power3" }), qy = gsap.quickTo(cur, "y", { duration: .35, ease: "power3" });
    addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); });
    $$("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => { label.textContent = el.dataset.cursor; cur.classList.add("is-big"); });
      el.addEventListener("mouseleave", () => cur.classList.remove("is-big"));
    });
    $$(".magnetic").forEach((el) => {
      const xT = gsap.quickTo(el, "x", { duration: .5, ease: "power3" }), yT = gsap.quickTo(el, "y", { duration: .5, ease: "power3" });
      el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * .35); yT((e.clientY - r.top - r.height / 2) * .35); });
      el.addEventListener("mouseleave", () => { xT(0); yT(0); });
    });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
