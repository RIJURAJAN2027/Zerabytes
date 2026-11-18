/* =========================================================
   Coffee Sagaa · interactions & animation
   GSAP + ScrollTrigger + Lenis
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none)").matches;
  const isMobile = () => innerWidth <= 900;
  $("#year").textContent = new Date().getFullYear();

  /* =========================================================
     TIME IN CHENNAI (IST) + OPEN STATUS
     Open every day 07:00 – 24:00
     ========================================================= */
  const OPEN_H = 7, CLOSE_H = 24;
  const istParts = () => {
    // IST is UTC+5:30 with no daylight saving, so compute directly from UTC
    const d = new Date(Date.now() + 330 * 60000);
    return { h: d.getUTCHours(), m: d.getUTCMinutes(), s: d.getUTCSeconds(), ms: d.getUTCMilliseconds() };
  };
  const statusOf = ({ h, m }) => {
    const mins = h * 60 + m;
    if (h >= OPEN_H && h < CLOSE_H) {
      const left = CLOSE_H * 60 - mins;
      if (left <= 60) return { open: true, short: "Closing soon", long: `Closing soon · ${left} min left` };
      return { open: true, short: "Open now", long: "Open now · till 12 AM" };
    }
    const until = OPEN_H * 60 - mins;
    if (until <= 60) return { open: false, short: "Opens soon", long: `Opens at 7 AM · in ${until} min` };
    return { open: false, short: "Closed now", long: "Closed now · opens 7 AM" };
  };
  const moments = [
    [0, "We're closed. See you at 7 for the first decoction."],
    [7, "The first decoction of the day is dripping."],
    [9, "Office rush. Filter coffee to go?"],
    [12, "Lunch time. The momos are steaming."],
    [15, "Afternoon slump? Cold coffee helps."],
    [16.5, "Bun butter jam and a coffee. Evening sorted."],
    [19, "Evening crowd's in. Grab a table."],
    [21.5, "Late-night Maggie and cheesy fries hours."],
    [23, "Last orders soon. Make it a filter coffee."],
  ];
  function updateStatus() {
    const t = istParts(), st = statusOf(t);
    $$("[data-status-dot]").forEach((d) => d.classList.toggle("is-closed", !st.open));
    $$("[data-status-short]").forEach((e) => (e.textContent = st.short));
    $$("[data-status-long]").forEach((e) => (e.textContent = st.long));
    const hh = t.h + t.m / 60; let line = moments[0][1];
    moments.forEach(([at, l]) => { if (hh >= at) line = l; });
    const lineEl = $("#clockLine"); if (lineEl.textContent !== line) lineEl.textContent = line;
    const h12 = t.h % 12 === 0 ? 12 : t.h % 12;
    $("#clockReadout").innerHTML = `${h12}:${String(t.m).padStart(2, "0")}<small>${t.h < 12 ? "AM" : "PM"}</small>`;
  }
  updateStatus();
  setInterval(updateStatus, 10000);

  /* clock face */
  const face = $("#clockFace");
  for (let i = 0; i < 60; i++) {
    const t = document.createElement("i");
    t.className = "tick" + (i % 5 === 0 ? " major" : "");
    t.style.transform = `rotate(${i * 6}deg)`;
    face.appendChild(t);
  }
  for (let h = 1; h <= 12; h++) {
    const n = document.createElement("span"), a = (h * 30 - 90) * Math.PI / 180;
    n.className = "num"; n.textContent = h;
    n.style.left = 50 + Math.cos(a) * 37 + "%"; n.style.top = 50 + Math.sin(a) * 37 + "%";
    face.appendChild(n);
  }
  const handH = $("#handH"), handM = $("#handM"), handS = $("#handS");
  const clockAngles = () => {
    const { h, m, s, ms } = istParts(), sec = s + ms / 1000;
    return { h: (h % 12) * 30 + m * .5 + sec / 120, m: m * 6 + sec * .1, s: sec * 6 };
  };
  // hands sweep in from 12 o'clock the first time the clock is seen, then run live
  const sweep = { p: reduceMotion ? 1 : 0 };
  let clockVisible = false;
  (function tick() {
    requestAnimationFrame(tick);
    if (!clockVisible && sweep.p === 1) return;
    const a = clockAngles(), p = sweep.p;
    handH.style.transform = `rotate(${a.h * p}deg)`;
    handM.style.transform = `rotate(${(a.m + (p < 1 ? 360 : 0)) * p}deg)`;
    handS.style.transform = `rotate(${a.s * p}deg)`;
  })();
  const clockEl = $("#clock");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      clockVisible = e.isIntersecting;
      if (e.isIntersecting && sweep.p === 0 && window.gsap) gsap.to(sweep, { p: 1, duration: 2, ease: "expo.inOut" });
      else if (e.isIntersecting && sweep.p === 0) sweep.p = 1;
    }, { threshold: .35 }).observe(clockEl);
  } else { clockVisible = true; sweep.p = 1; }

  /* =========================================================
     MENU
     ========================================================= */
  const MENU = window.SAGAA_MENU || [];
  const visualFor = { coffee: "ill-tumbler", tea: "ill-cup", milk: "ill-cup", coolers: "ill-cold", buns: "ill-bun", momos: "ill-momo", sandwich: "ill-korean", snacks: "ill-fries" };
  const viewBoxes = { "ill-tumbler": "0 0 240 270", "ill-cup": "0 0 200 290", "ill-cold": "0 0 200 290", "ill-bun": "0 0 220 170", "ill-momo": "0 0 220 170", "ill-korean": "0 0 220 170", "ill-fries": "0 0 220 200" };
  const tabsEl = $("#menuTabs"), listEl = $("#menuList"), noteEl = $("#menuNote"), visUse = $("#menuVisualUse");
  const visSvg = visUse.closest("svg");
  const catNote = document.createElement("p"); catNote.className = "menu__cat-note";
  listEl.before(catNote);

  function renderList(cat) {
    listEl.innerHTML = cat.items.map(([name, price, desc]) =>
      `<li><span class="name">${name}${desc ? `<span class="desc">${desc}</span>` : ""}</span><span class="price">${price}</span></li>`
    ).join("");
    noteEl.textContent = cat.note || ""; catNote.textContent = cat.note || "";
    const sym = visualFor[cat.id] || "ill-tumbler";
    visUse.setAttribute("href", "#" + sym); visSvg.setAttribute("viewBox", viewBoxes[sym]);
  }
  tabsEl.innerHTML = MENU.map((c, i) => `<button role="tab" aria-selected="${i === 0}" data-i="${i}" class="${i === 0 ? "is-active" : ""}">${c.title}</button>`).join("");
  if (MENU.length) renderList(MENU[0]);

  let menuBusy = false;
  tabsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b || b.classList.contains("is-active") || menuBusy) return;
    $$("button", tabsEl).forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", x === b); });
    // keep the active chip in view on mobile
    tabsEl.scrollTo({ left: b.offsetLeft - tabsEl.clientWidth / 2 + b.offsetWidth / 2, behavior: "smooth" });
    const cat = MENU[+b.dataset.i];
    // if the list top is above the sticky tab bar, bring it back up
    const bodyTop = $(".menu__body").getBoundingClientRect().top;
    if (isMobile() && bodyTop < 130) {
      const y = scrollY + bodyTop - 130;
      lenis ? lenis.scrollTo(y, { duration: .6 }) : scrollTo({ top: y });
    }
    if (!window.gsap || reduceMotion) return renderList(cat);
    menuBusy = true;
    gsap.timeline({ onComplete: () => (menuBusy = false) })
      .to([listEl.children, catNote], { y: -12, opacity: 0, duration: .22, stagger: .01, ease: "power2.in" })
      .to(visSvg, { scale: .6, rotate: -25, opacity: 0, duration: .28, ease: "power2.in" }, 0)
      .add(() => {
        renderList(cat);
        gsap.fromTo([catNote, ...listEl.children], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .03, ease: "power3.out", onComplete: () => ScrollTrigger.refresh() });
      })
      .fromTo(visSvg, { scale: .6, rotate: 25, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: .7, ease: "back.out(1.6)" });
  });

  /* =========================================================
     MOBILE MENU, CAROUSEL DOTS, VIDEO
     ========================================================= */
  const burger = $("#burger");
  burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
    open ? lenis && lenis.stop() : lenis && lenis.start();
  });

  const favGrid = $("#favGrid"), favDots = $("#favDots");
  favDots.innerHTML = $$(".card", favGrid).map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("");
  favGrid.addEventListener("scroll", () => {
    const cards = $$(".card", favGrid), x = favGrid.scrollLeft;
    let idx = 0, best = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft - favGrid.offsetLeft - x - parseFloat(getComputedStyle(favGrid).paddingLeft)); if (d < best) { best = d; idx = i; } });
    $$("i", favDots).forEach((d, i) => d.classList.toggle("on", i === idx));
  }, { passive: true });

  const film = $("#film"), vid = $("#filmVideo"), soundBtn = $("#filmSound");
  vid.addEventListener("loadeddata", () => { film.classList.add("has-video"); soundBtn.hidden = false; });
  soundBtn.addEventListener("click", () => { vid.muted = !vid.muted; soundBtn.textContent = vid.muted ? "Sound off" : "Sound on"; });

  /* =========================================================
     NO GSAP FALLBACK
     ========================================================= */
  let lenis = null;
  const finishLoader = () => { $("#loader").style.display = "none"; document.body.classList.remove("is-loading"); };
  if (!window.gsap || !window.ScrollTrigger) {
    finishLoader(); sweep.p = 1; clockVisible = true;
    $$(".story__text").forEach((el) => (el.style.opacity = 1));
    $("#actionbar").classList.add("is-visible");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll (desktop only; native scroll feels better on phones) */
  if (window.Lenis && !reduceMotion && !isTouch) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href"); if (!id || !id.startsWith("#")) return;
    e.preventDefault();
    document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", false);
    const target = id === "#top" ? 0 : $(id);
    if (lenis) { lenis.start(); lenis.scrollTo(target, { duration: 1.5, offset: id === "#top" ? 0 : -10 }); }
    else target === 0 ? scrollTo({ top: 0, behavior: "smooth" }) : target.scrollIntoView({ behavior: "smooth" });
  }));

  /* nav state + mobile action bar */
  const nav = $("#nav"), bar = $("#actionbar"); let lastY = 0;
  let navTicking = false;
  const onScrollUI = () => {
    const y = scrollY;
    if (Math.abs(y - lastY) < 2 && y > 0) return;
    const hide = y > lastY && y > 300 && !document.body.classList.contains("menu-open");
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", hide);
    document.body.classList.toggle("nav-up", hide);
    bar.classList.toggle("is-visible", y > innerHeight * .6);
    lastY = y;
  };
  addEventListener("scroll", () => { if (!navTicking) { navTicking = true; requestAnimationFrame(() => { navTicking = false; onScrollUI(); }); } }, { passive: true });
  onScrollUI();

  /* split helpers */
  $$(".reveal-lines > span").forEach((line) => { line.innerHTML = `<span>${line.innerHTML}</span>`; });
  const storyText = $("#storyText");
  storyText.innerHTML = storyText.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");

  /* =========================================================
     PRELOADER (shorter on repeat visits)
     ========================================================= */
  let seen = false;
  try { seen = sessionStorage.getItem("sagaa-seen") === "1"; sessionStorage.setItem("sagaa-seen", "1"); } catch (e) {}
  const counter = $("#loaderCount"), liquid = $("#loaderLiquid");
  gsap.to("#loaderWave", { x: -80, duration: 1.2, ease: "none", repeat: -1 });
  const prog = { v: 0 };
  gsap.set("#loader", { clipPath: "inset(0 0 0% 0)" });
  gsap.timeline()
    .from(".loader__cup", { y: 50, opacity: 0, duration: .7, ease: "power3.out" })
    .from(".loader__top > *, .loader__count", { opacity: 0, y: 16, stagger: .06, duration: .5 }, 0)
    .to(prog, {
      v: 100, duration: reduceMotion || seen ? .5 : 1.9, ease: "power2.inOut",
      onUpdate: () => {
        counter.textContent = Math.round(prog.v);
        liquid.setAttribute("transform", `translate(0 ${200 - (prog.v / 100) * 184})`);
      },
    }, .15)
    .to(".loader__cup", { y: -16, rotate: -5, duration: .4, ease: "power2.out" })
    .to(".loader__top > *, .loader__count", { y: -30, opacity: 0, duration: .4, stagger: .04, ease: "power2.in" }, "<")
    .to("#loader", { clipPath: "inset(0 0 100% 0)", duration: .9, ease: "expo.inOut" }, "-=.1")
    .add(() => { lenis && lenis.start(); heroIntro.play(); }, "-=.5")
    .add(finishLoader);

  /* =========================================================
     HERO
     ========================================================= */
  const heroIntro = gsap.timeline({ paused: true });
  heroIntro
    .from(".hero__title .word", { yPercent: 115, duration: 1.1, stagger: .09, ease: "expo.out" })
    .from(".hero__rating, .hero__sub, .hero__actions > *, .hero__info > div", { y: 22, opacity: 0, stagger: .06, duration: .9, ease: "power3.out" }, .15)
    .from(".prod--bag", { y: 260, rotate: 22, opacity: 0, duration: 1.4, ease: "expo.out" }, .1)
    .from(".prod--cup", { y: 320, rotate: -26, opacity: 0, duration: 1.4, ease: "expo.out" }, .2)
    .from(".prod--tumbler", { y: 260, x: 80, rotate: 18, opacity: 0, duration: 1.4, ease: "expo.out" }, .3)
    .from(".bean-float", { scale: 0, opacity: 0, stagger: .1, duration: 1, ease: "back.out(2)" }, .5)
    .from("#heroTag", { y: 20, opacity: 0, duration: .9, ease: "power3.out" }, .7);

  if (!reduceMotion) {
    gsap.to(".prod--bag svg", { y: -14, rotate: 2, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".prod--cup svg", { y: -18, rotate: -3, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: .4 });
    gsap.to(".prod--tumbler svg", { y: -12, rotate: 3, duration: 2.9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: .8 });
    $$(".bean-float").forEach((b, i) => gsap.to(b, { y: "+=" + (14 + i * 6), rotate: 60 + i * 40, duration: 3 + i, ease: "sine.inOut", yoyo: true, repeat: -1 }));
  }

  if (!isTouch && !reduceMotion) {
    const layers = $$("#heroStage [data-depth]").map((el) => ({ d: +el.dataset.depth, qx: gsap.quickTo(el, "x", { duration: 1, ease: "power3" }), qy: gsap.quickTo(el, "y", { duration: 1, ease: "power3" }) }));
    $("#hero").addEventListener("mousemove", (e) => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      layers.forEach((l) => { l.qx(nx * 24 * l.d); l.qy(ny * 18 * l.d); });
    });
  }

  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } })
      .to(".prod--bag", { yPercent: -40, rotate: 18, xPercent: 20 }, 0)
      .to(".prod--cup", { yPercent: -70, rotate: -24, scale: 1.1 }, 0)
      .to(".prod--tumbler", { yPercent: 40, rotate: 14, xPercent: -30 }, 0)
      .to(".hero__copy", { yPercent: -25, opacity: 0 }, 0)
      .to(".hero__bg", { scale: 1.2 }, 0);
  });

  const tagItems = [
    ["Madras filter coffee", "₹30", "The one everyone orders first"],
    ["Madurai special bun", "₹80", "Crisp outside, soft inside"],
    ["Korean cheese bun", "₹120", "Garlic butter, lots of cream cheese"],
    ["Peri peri momos", "₹130", "Made in our kitchen"],
    ["Hazelnut filter coffee", "₹50", "Filter coffee with a twist"],
  ];
  let tagI = 0;
  setInterval(() => {
    if (document.hidden || scrollY > innerHeight) return;
    tagI = (tagI + 1) % tagItems.length;
    const [n, p, m] = tagItems[tagI];
    gsap.timeline()
      .to("#heroTag > *", { y: -10, opacity: 0, duration: .25, stagger: .03, ease: "power2.in" })
      .add(() => { $("#tagName").textContent = n; $("#tagPrice").textContent = p; $("#tagMeta").textContent = m; })
      .fromTo("#heroTag > *", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .04, ease: "power3.out" });
  }, 3400);

  // steam (desktop only)
  (function steam() {
    const c = $("#steam"); if (!c || reduceMotion || isMobile()) return;
    const ctx = c.getContext("2d"), dpr = Math.min(devicePixelRatio, 2), parts = [];
    let w, h, visible = true;
    const resize = () => { w = c.offsetWidth; h = c.offsetHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener("resize", resize);
    const src = () => { const t = $(".prod--tumbler").getBoundingClientRect(), hr = $("#hero").getBoundingClientRect(); return { x: t.left - hr.left + t.width / 2, y: t.top - hr.top + t.height * .12 }; };
    ScrollTrigger.create({ trigger: "#hero", start: "top bottom", end: "bottom top", onToggle: (s) => (visible = s.isActive) });
    (function loop() {
      requestAnimationFrame(loop); if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      if (parts.length < 36 && Math.random() < .3) { const s = src(); parts.push({ x: s.x + (Math.random() - .5) * 40, y: s.y, r: 10 + Math.random() * 14, life: 0, max: 120 + Math.random() * 80, sway: Math.random() * 6.28 }); }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.life++; p.y -= .7; p.r += .18; p.x += Math.sin(p.sway + p.life * .04) * .5;
        const a = Math.sin((p.life / p.max) * Math.PI) * .12, g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(244,236,224,${a})`); g.addColorStop(1, "rgba(244,236,224,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        if (p.life > p.max) parts.splice(i, 1);
      }
    })();
  })();

  /* =========================================================
     MARQUEE
     ========================================================= */
  const track = $("#marquee");
  track.innerHTML += track.innerHTML;
  const marqueeTween = gsap.to(track, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    trigger: ".marquee", start: "top bottom", end: "bottom top",
    onUpdate: (s) => {
      const v = Math.min(Math.abs(s.getVelocity()) / 500, 4), dir = s.direction < 0 ? -1 : 1;
      gsap.to(marqueeTween, { timeScale: dir * (1 + v), duration: .2, overwrite: true });
      gsap.to(marqueeTween, { timeScale: dir, duration: 1.2, delay: .2 });
    },
  });

  /* =========================================================
     REVEALS
     ========================================================= */
  $$(".reveal-lines").forEach((el) => gsap.from($$(":scope > span > span", el), { yPercent: 115, duration: 1.1, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
  $$("section .label").forEach((el) => gsap.from(el, { opacity: 0, x: -16, duration: .8, scrollTrigger: { trigger: el, start: "top 92%" } }));

  /* favourites */
  const swash = $("#swashPath"), len = swash.getTotalLength();
  gsap.set(swash, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(swash, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".favs", start: "top 80%", end: "bottom 40%", scrub: 1 } });
  gsap.from(".card", { y: 90, opacity: 0, duration: 1.1, stagger: .08, ease: "expo.out", scrollTrigger: { trigger: "#favGrid", start: "top 88%" } });
  gsap.from(".card__img svg", { scale: .6, rotate: -14, opacity: 0, duration: 1.2, stagger: .08, ease: "back.out(1.5)", clearProps: "transform", scrollTrigger: { trigger: "#favGrid", start: "top 88%" } });

  /* story */
  gsap.to($$(".w", storyText), { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: storyText, start: "top 82%", end: "bottom 50%", scrub: true } });
  gsap.from(".story__notes li", { y: 40, opacity: 0, stagger: .1, duration: .9, ease: "power3.out", scrollTrigger: { trigger: ".story__notes", start: "top 88%" } });

  /* film */
  gsap.fromTo("#filmFrame", { scale: .8 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "#film", start: "top bottom", end: "top 20%", scrub: true } });
  gsap.from(".film__overlay .h2", { yPercent: 50, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: "#filmFrame", start: "top 55%" } });
  ScrollTrigger.create({ trigger: "#filmFrame", start: "top 85%", end: "bottom 15%", onToggle: (s) => { if (!film.classList.contains("has-video")) return; s.isActive ? vid.play().catch(() => {}) : vid.pause(); } });

  /* menu */
  gsap.from("#menuTabs button", { y: 16, opacity: 0, stagger: .035, duration: .6, ease: "power3.out", scrollTrigger: { trigger: "#menuTabs", start: "top 92%" } });
  gsap.from("#menuVisual", { scale: .7, rotate: -30, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: "#menuVisual", start: "top 85%" } });
  gsap.from(listEl.children, { y: 24, opacity: 0, stagger: .035, duration: .7, ease: "power3.out", scrollTrigger: { trigger: listEl, start: "top 90%" } });
  if (!isTouch) gsap.to("#menuVisual svg", { y: -10, rotate: -4, duration: 2.5, ease: "sine.inOut", yoyo: true, repeat: -1 });

  /* visit */
  gsap.from(".clock", { scale: .75, rotate: -20, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: "#visit", start: "top 75%" } });
  gsap.from(".visit__info > *", { y: 26, opacity: 0, stagger: .07, duration: .9, ease: "power3.out", scrollTrigger: { trigger: ".visit__info", start: "top 85%" } });
  gsap.from("#mapFrame", { clipPath: "inset(0 0 100% 0 round 22px)", duration: 1.3, ease: "expo.inOut", scrollTrigger: { trigger: "#mapFrame", start: "top 85%" } });

  /* order ahead: beans + cup + receipt */
  (function beans() {
    const c = $("#beans"); if (!c) return;
    const ctx = c.getContext("2d"), dpr = Math.min(devicePixelRatio, 2);
    let w, h, on = false, scrollV = 0;
    const resize = () => { w = c.offsetWidth; h = c.offsetHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener("resize", resize);
    const N = isMobile() ? 16 : 42;
    const bs = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), z: .3 + Math.random() * .9, r: Math.random() * 6, vr: (Math.random() - .5) * .03, vy: .0006 + Math.random() * .0012 }));
    const drawBean = (x, y, s, r, faint) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s); ctx.globalAlpha = faint ? .35 : .9;
      ctx.fillStyle = "#4a2914"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 12.5, 0, 0, 6.28); ctx.fill();
      ctx.fillStyle = "rgba(160,100,60,.35)"; ctx.beginPath(); ctx.ellipse(-4, -4, 9, 4, -.2, 0, 6.28); ctx.fill();
      ctx.strokeStyle = "#1a0c05"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-14, 3); ctx.quadraticCurveTo(0, -7, 15, -1); ctx.stroke();
      ctx.restore();
    };
    ScrollTrigger.create({ trigger: "#city", start: "top bottom", end: "bottom top", onToggle: (s) => (on = s.isActive), onUpdate: (s) => (scrollV = s.getVelocity() / 6000) });
    (function loop() {
      requestAnimationFrame(loop); if (!on) return;
      ctx.clearRect(0, 0, w, h);
      bs.forEach((b) => {
        b.y += (b.vy + scrollV * .02) * b.z * (reduceMotion ? 0 : 1); b.r += b.vr;
        if (b.y > 1.05) { b.y = -.05; b.x = Math.random(); }
        if (b.y < -.06) b.y = 1.04;
        drawBean(b.x * w, b.y * h, b.z * 1.1, b.r, b.z < .55);
      });
      scrollV *= .92;
    })();
  })();
  gsap.from("#cityCup", { x: -180, rotate: -36, opacity: 0, ease: "none", scrollTrigger: { trigger: ".city__row", start: "top 95%", end: "top 45%", scrub: 1 } });
  gsap.fromTo("#receipt", { yPercent: -100 }, { yPercent: 0, ease: "steps(20)", scrollTrigger: { trigger: ".receipt-wrap", start: "top 85%", end: "top 30%", scrub: true } });
  gsap.from(".city__copy > *", { y: 26, opacity: 0, stagger: .1, duration: .9, ease: "power3.out", scrollTrigger: { trigger: ".city__row", start: "top 80%" } });

  /* instagram */
  gsap.from(".insta__card", { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".insta", start: "top 90%" } });
  gsap.from(".insta__avatar", { rotate: -120, scale: .5, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".insta", start: "top 90%" } });

  /* footer word */
  const fw = $("#footerWord span");
  fw.innerHTML = fw.textContent.split("").map((ch) => `<span class="ch" style="display:inline-block">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
  gsap.from(".footer__word .ch", { yPercent: 100, opacity: 0, stagger: .03, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".footer__word", start: "top 95%" } });

  /* =========================================================
     CURSOR + MAGNETIC (desktop)
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
      el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * .3); yT((e.clientY - r.top - r.height / 2) * .3); });
      el.addEventListener("mouseleave", () => { xT(0); yT(0); });
    });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
