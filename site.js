
(() => {
  const C = window.COPY;
  const html = document.documentElement;
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !window.gsap) html.classList.add('rm');
  const clamp = (a, b, v) => Math.max(a, Math.min(b, v));
  const deel = (p, a, b) => clamp(0, 1, (p - a) / (b - a));
  const ROOT = new URL('.', document.currentScript ? document.currentScript.src : location.href);
  const opRoot = (p) => new URL(p, ROOT).href;
  const vraag = new URLSearchParams(location.search).get('lang');
  let lang = vraag === 'en' || vraag === 'nl' ? vraag : (html.lang === 'en' ? 'en' : 'nl');
  const REGELS = [['d1', '00:32'], ['d2', '00:48'], ['d3', '01:10'], ['d4', '01:22']];
  const esc = (t) => { const d = document.createElement('i'); d.textContent = t; return d.innerHTML; };
  const kaal = (t) => t.replace(/\[\[(.+?)\]\]/g, '$1');
  const merk = (t) => esc(t).replace(/\[\[(.+?)\]\]/g, '<mark>$1</mark>');
  function zetTeksten() {
    html.lang = lang;
    document.title = kaal(C.meta_title[lang]);
    qsa('[data-t]').forEach((el) => { el.innerHTML = merk(C[el.dataset.t][lang]); });
    qsa('[data-ph]').forEach((el) => { el.placeholder = C[el.dataset.ph][lang]; });
    const enWacht = [];
    const tijdelijk = {};
    qsa('[data-shot]').forEach((el) => { const t = lang === 'en' && enWacht.includes(el.dataset.shot) ? 'nl' : lang; const naam = tijdelijk[el.dataset.shot] || el.dataset.shot; el.src = opRoot(`assets/screens/${t}/${naam}.webp`); });
    const pad = (nl, en) => (html.dataset.wortel === 'en' ? (lang === 'en' ? en.slice(3) : 'nl/' + nl) : (lang === 'en' ? en : nl));
    qs('[data-priv]').href = opRoot(pad('privacy/', 'en/privacy/'));
    qs('[data-sup]').href = opRoot(pad('support/', 'en/support/'));
    qs('[data-blog]').href = opRoot(pad('blog/', 'en/blog/'));
    qs('[data-vw]').href = opRoot(pad('voorwaarden/', 'en/terms/'));
    qs('[data-zelf]').href = opRoot(pad('privacy-zelf-controleren/', 'en/check-notecord-privacy-yourself/'));
    qsa('[data-badge]').forEach((el) => { el.src = opRoot(`assets/appstore-${lang}.svg`); });
    qsa('[data-alt]').forEach((el) => { el.alt = kaal(C[el.dataset.alt][lang]); });
    const lijn = qs('.hero-line');
    lijn.innerHTML = lijn.innerHTML.split(/(?<=\.(?:<\/mark>)?) /).map((z) => `<span class="zin">${z}</span>`).join(' ');
    const q = `“${C.d2[lang]}”`;
    qsa('[data-q]').forEach((el) => { el.textContent = q; });
    qs('#regels').innerHTML = REGELS.map(([id, t]) => `<p class="rg"><time>${t}</time><em>${lang.toUpperCase()}</em><span>${C[id][lang].split(' ').map((w) => `<span class="rw">${w}</span>`).join(' ')}</span></p>`).join('');
    qs('#groot').innerHTML = q.split(' ').map((w) => `<span class="kw">${w}</span>`).join(' ');
    const knop = qs('#taal');
    knop.textContent = lang === 'nl' ? 'EN' : 'NL';
    knop.setAttribute('aria-label', lang === 'nl' ? 'EN, switch to English' : 'NL, naar het Nederlands');
    const R = window.NOTECORD_REVIEWS || [];
    const rv = qs('#reviews');
    rv.hidden = !R.length;
    rv.innerHTML = R.map((r) => `<figure><blockquote>“${esc(r.tekst[lang])}”</blockquote><figcaption>${esc(r.naam)}, ${esc(r.rol)}</figcaption></figure>`).join('');
  }
  zetTeksten();
  let naTaal = () => {};
  qs('#taal').addEventListener('click', () => {
    lang = lang === 'nl' ? 'en' : 'nl';
    const url = new URL(location); url.searchParams.set('lang', lang); history.replaceState(null, '', url);
    zetTeksten();
    naTaal();
  });
  Promise.race([
    Promise.all(qsa('.plate').map((im) => im.decode().catch(() => {}))),
    new Promise((klaar) => setTimeout(klaar, 5000)),
  ]).then(() => html.classList.remove('laden'));
  const staand = matchMedia('(max-width:820px) and (orientation:portrait)');
  let horizon = 0;
  const peil = document.createElement('div');
  peil.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
  document.body.appendChild(peil);
  function plaats() {
    const vw = innerWidth; const vh = peil.offsetHeight || innerHeight;
    const st = staand.matches;
    const ar = st ? 0.5627 : 1.7773;
    const hor = st ? 0.56 : 0.6;
    const pw = Math.max(vw, vh * ar); const ph = pw / ar;
    const fx = !st && vw / vh < 1.55 ? 0.72 : 0.5; const fy = st ? 0.5 : 0.66;
    html.style.setProperty('--fxp', `${fx * 100}%`);
    const px = vw / 2 + (0.5 - fx) * Math.max(0, pw - vw) - pw / 2;
    const py = vh / 2 + (0.5 - fy) * Math.max(0, ph - vh) - ph / 2;
    const s = html.style;
    s.setProperty('--px', `${px}px`);
    s.setProperty('--py', `${py}px`);
    horizon = py + ph * hor;
    s.setProperty('--hz', `${horizon}px`);
    s.setProperty('--kt', `${Math.round(py + ph * (st ? 0.3 : 0.36))}px`);
    const sx = st ? 0.498 : 0.492; const sy = st ? 0.792 : 0.746;
    s.setProperty('--cx', `${px + pw * (0.5 + (sx - 0.5) * 1.24)}px`);
    s.setProperty('--cy', `${py + ph * (1 + (sy - 1) * 1.24)}px`);
    const eind = qs('.slot-einde'); const woord = qs('.e-woord');
    const eh = eind.offsetHeight; const ih = Math.max(eh, vw / ar);
    const h2 = ih * hor - (ih - eh);
    s.setProperty('--eb', `${Math.round(eh - h2 + woord.offsetHeight * (st ? 1.75 : 0.2))}px`);
  }
  plaats();
  addEventListener('resize', plaats);
  const golf = qs('.golf');
  const BARS = 42;
  golf.innerHTML = Array.from({ length: BARS }, (_, i) => {
    const t = i / (BARS - 1);
    const r = Math.round(155 + (236 - 155) * t); const g = Math.round(107 + (143 - 107) * t); const b = Math.round(240 + (208 - 240) * t);
    return `<i style="background:rgb(${r},${g},${b})"></i>`;
  }).join('');
  const bars = qsa('i', golf);
  const tape = qs('#tape');
  const pil = qs('.pil');
  let tapeBars = []; let kopNu = -1;
  const zonderVlucht = document.documentElement.classList.contains('zonder-vlucht');
  const MOMENTEN = ['opname', 'gesprekken', 'bewijzen', 'schrijf', 'privacy', 'prijs', 'slot'];
  const STERKTE = { begin: 0.55, opname: 1, gesprekken: 0.6, bewijzen: 0.5, schrijf: 0.42, privacy: 0.3, prijs: 0.48, slot: 0.16 };
  function bouwTape() {
    const smal = innerWidth <= 820;
    const n = smal ? 16 : Math.round(tape.offsetHeight / 5.5);
    const max = html.scrollHeight - innerHeight || 1;
    const secties = ['begin', ...MOMENTEN].map((id) => ({ id, y: qs(`#${id}`).offsetTop }));
    const vlag = (id) => (qs(`#${id}`).offsetTop / max * 100).toFixed(1);
    tape.innerHTML = Array.from({ length: n }, (_, i) => {
      const y = (i / (n - 1)) * max;
      const sec = secties.filter((s) => s.y <= y + 1).pop();
      const ruis = 0.22 + 0.78 * Math.abs(Math.sin(i * 1.37) * Math.cos(i * 0.61 + 1));
      return `<i style="--w:${Math.round(6 + 34 * STERKTE[sec.id] * ruis)}px"></i>`;
    }).join('') + (smal ? '' : MOMENTEN.map((id) => `<b style="top:${vlag(id)}%"></b>`).join(''));
    tapeBars = qsa('i', tape);
    kopNu = -1;
    zetKop(scrollY / max);
  }
  function zetKop(p) {
    const k = Math.round(clamp(0, 1, p) * (tapeBars.length - 1));
    if (k === kopNu) return;
    tapeBars.forEach((b, i) => { b.className = i < k ? 'op' : i === k ? 'kop' : ''; });
    kopNu = k;
  }
  const opTape = (ev) => {
    const r = tape.getBoundingClientRect();
    return clamp(0, 1, innerWidth > 820 ? (ev.clientY - r.top) / r.height : (ev.clientX - r.left) / r.width) * (html.scrollHeight - innerHeight);
  };
  bouwTape();
  addEventListener('load', bouwTape);
  addEventListener('resize', bouwTape);
  new IntersectionObserver((rijen) => rijen.forEach((r) => pil.classList.toggle('bij-slot', r.isIntersecting)), { rootMargin: '-40% 0px -40% 0px' }).observe(qs('.slot-tekst'));
  if (html.classList.contains('rm')) {
    addEventListener('scroll', () => zetKop(scrollY / (html.scrollHeight - innerHeight || 1)), { passive: true });
    qsa('.kw').forEach((w) => w.classList.add('op'));
    qsa('.rg').forEach((r) => r.classList.add('op'));
    tape.addEventListener('click', (ev) => scrollTo(0, opTape(ev)));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  lenis.on('scroll', ({ scroll, limit }) => { ScrollTrigger.update(); zetKop(scroll / (limit || 1)); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  qsa('a[href^="#"]').forEach((a) => a.addEventListener('click', (ev) => {
    ev.preventDefault(); lenis.scrollTo(a.getAttribute('href'), { duration: 1.6 });
  }));
  tape.addEventListener('click', (ev) => lenis.scrollTo(opTape(ev), { duration: 1.6 }));
  const mm = gsap.matchMedia();
  const isSmal = () => innerWidth <= 820;
  mm.add('(hover: hover) and (pointer: fine)', () => {
    gsap.set('.far', { scale: 1.015 / 1.1 });
    gsap.set('.near', { scale: 1.03 / 1.3 });
    const vlakken = [['.sky', 5], ['.wordmark', 9], ['.far', 13], ['.near', 24]].map(([s, a]) => [gsap.quickTo(s, 'x', { duration: 1.1, ease: 'power3' }), a]);
    const beweeg = (ev) => {
      if (scrollY > innerHeight) return;
      const d = (ev.clientX / innerWidth - 0.5) * -2;
      vlakken.forEach(([zet, a]) => zet(d * a));
    };
    addEventListener('pointermove', beweeg, { passive: true });
    return () => removeEventListener('pointermove', beweeg);
  });
  const zak = () => { const w = qs('.wordmark'); return horizon - w.offsetTop + w.offsetHeight * 0.15; };
  const heroStage = qs('.stage');
  const zetHero = (s) => { heroStage.style.visibility = (s.progress >= 0.999 || heroStage.getBoundingClientRect().top < -1) ? 'hidden' : 'visible'; };
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true, onUpdate: zetHero, onRefresh: zetHero },
  })
    .fromTo('.rand', { scaleX: () => { const r = isSmal() ? 6 : 10; return (innerWidth - r * 2) / (innerWidth + 100); }, scaleY: () => { const r = isSmal() ? 6 : 10; return (innerHeight - r * 2) / (innerHeight + 100); } }, { scaleX: 1, scaleY: 1, duration: 0.2 }, 0)
    .to('.wordmark', { y: zak, duration: 0.4 }, 0)
    // staande telefoon: de App Store-regel staat onder de kop en is weg voordat de kop erachter zakt
    .to('.hero-tekst', { autoAlpha: 0, y: -18, duration: staand.matches ? 0.035 : 0.08 }, staand.matches ? 0.005 : 0.05)
    .to('.hero-side,.hero-merk', { autoAlpha: 0, y: -18, duration: 0.08 }, 0.05)
    .to('.sky', { scale: 1.03 / 1.06, y: () => -innerHeight * 0.015, duration: 0.55 }, 0)
    .to('.far', { scale: 1.06 / 1.1, y: () => -innerHeight * 0.03, duration: 0.55 }, 0)
    .to('.near', { scale: 1.24 / 1.3, duration: 0.55 }, 0)
    .to('.cam-near', { scale: 6.6, ease: 'power3.in', duration: 0.4 }, 0.55)
    .to('.cam-far', { scale: 1.9, ease: 'power3.in', duration: 0.4 }, 0.55)
    .to('.cam-sky', { scale: 1.3, ease: 'power3.in', duration: 0.4 }, 0.55)
    .to('.stage .flits', { opacity: 1, duration: 0.19 }, 0.76);
  const stage = qs('.demo-stage');
  const foon = qs('.d-rec');
  const home = qs('.s-home', foon);
  const intro = qs('.h-intro', home); const iLijn = qs('path', intro); const iStip = qs('circle', intro); const knop = qs('.h-knop', home);
  const terugUit = gsap.parseEase('back.out(1.8)'); const rec = qs('.s-rec'); const sum = qs('.s-sum');
  const touch = qs('.touch');
  const vrWrap = qs('.vr-wrap'); const grootP = qs('#groot');
  const tijd = qs('#tijd'); const ptijd = qs('#ptijd'); const speler = qs('.speler');
  const stopk = qs('#stopk'); const vlagk = qs('#vlagk'); const zin = qs('#zin'); const hint = qs('.hint');
  const n1 = qs('.n1'); const n2 = qs('.n2'); const rijen = qsa('.rij', sum);
  const caps = qsa('.cap'); const glazen = qsa('.glas');
  const bArts = qs('.b-arts'); const flits2 = qs('.demo-stage>.flits');
  let rgs = []; let rws = []; let kws = []; let v = {}; const fase = { p: 0, q: 0 };
  const REGEL_VAN = [[0.11, 0.18], [0.19, 0.27], [0.28, 0.35], [0.355, 0.385]];
  const CAP = [[0, 0.085], [0.085, 0.15], [0.15, 0.215], [0.215, 0.29], [0.29, 0.355], [0.355, 0.425], [0.425, 0.6]];
  function bouw() {
    rgs = qsa('.rg'); rws = rgs.map((r) => qsa('.rw', r)); kws = qsa('.kw'); v = {};
  }
  bouw();
  const scherm = qs('.screen', foon);
  const opScherm = (el) => {
    let x = el.offsetWidth / 2; let y = el.offsetHeight / 2; let n = el;
    while (n && n !== scherm) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return [x, y];
  };
  const fmtKort = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const zet = (k, w, f) => { if (v[k] !== w) { f(w); v[k] = w; } };
  const zetOp = (el, a) => { el.style.opacity = a; el.style.visibility = a <= 0 ? 'hidden' : 'visible'; };
  const uit3 = gsap.parseEase('power3.out'); const inUit2 = gsap.parseEase('power2.inOut');
  const stapel = matchMedia('(max-width:960px),(max-width:1180px) and (orientation:portrait)');
  let replay = null;
  let maat = null;
  const meet = () => { const kop = qs('.groot'); maat = { b: foon.offsetWidth, h: foon.offsetHeight, top: foon.offsetTop, kopOnder: kop ? kop.offsetTop + kop.offsetHeight : 0 }; };
  function teken() {
    const p = fase.p; const q = fase.q;
    const breed = !stapel.matches;
    const tikStart = deel(p, 0.05, 0.075);
    zet('home', p >= 0.085 ? 0 : 1 - deel(p, 0.07, 0.085), (w) => zetOp(home, w));
    zet('adem', q >= 0.08 && p < 0.085, (w) => home.classList.toggle('adem', w));
    zet('rec', p > 0.54 ? 0 : deel(p, 0.07, 0.09), (w) => zetOp(rec, w));
    const iSchrijf = inUit2(deel(q, 0.012, 0.058));
    const iAan = deel(q, 0.054, 0.07);
    const iOver = inUit2(deel(q, 0.072, 0.098));
    zet('iL', +iSchrijf.toFixed(3), (w) => { iLijn.style.strokeDashoffset = (1 - w).toFixed(3); });
    zet('iS', +iAan.toFixed(3), (w) => { iStip.style.transform = `scale(${(0.01 + 0.99 * terugUit(w)).toFixed(3)})`; });
    zet('iO', +iOver.toFixed(3), (w) => {
      iLijn.style.opacity = (1 - w).toFixed(3);
      intro.style.transform = `scale(${(1 - 0.5 * w).toFixed(3)})`;
      intro.style.visibility = w >= 1 ? 'hidden' : 'visible';
      knop.style.opacity = w.toFixed(3);
    });
    knop.style.transform = `scale(${((0.85 + 0.15 * iOver) * (1 - 0.06 * Math.sin(tikStart * Math.PI))).toFixed(3)})`;
    const sv = deel(p, 0.46, 0.53); const se = 1 - (1 - sv) * (1 - sv);
    zet('sumY', ((1 - se) * 102).toFixed(2), (w) => { sum.style.transform = `translateY(${w}%)`; });
    rijen.forEach((r, i) => {
      const a = deel(p, 0.5 + i * 0.012, 0.52 + i * 0.012);
      zet(`r${i}`, a.toFixed(3), (w) => { r.style.opacity = w; r.style.transform = `translateY(${((1 - w) * 0.9).toFixed(3)}em)`; });
    });
    rgs.forEach((r, i) => {
      const [a, b] = REGEL_VAN[i];
      const d = deel(p, a, b);
      const n = Math.ceil(d * rws[i].length);
      zet(`rg${i}`, d > 0, (w) => { r.classList.toggle('op', w); });
      zet(`rn${i}`, n, (w) => { rws[i].forEach((el, j) => { el.style.opacity = j < w ? 1 : 0; }); });
    });
    let s = 0;
    const STAP = [[0.09, 0], [0.11, 32], [0.19, 48], [0.28, 70], [0.355, 82], [0.39, 110], [0.42, 720]];
    for (let i = 0; i < STAP.length - 1; i += 1) {
      if (p >= STAP[i][0]) s = Math.round(STAP[i][1] + (STAP[i + 1][1] - STAP[i][1]) * deel(p, STAP[i][0], STAP[i + 1][0]));
    }
    zet('tijd', fmtKort(s), (w) => { tijd.textContent = w; });
    const leeft = p > 0.09 && p < 0.425;
    if (leeft || v.leeft !== false) {
      const t = performance.now() / 260;
      bars.forEach((b, i) => {
        const h = leeft ? 0.14 + 0.86 * Math.abs(Math.sin(i * 0.62 + t) * Math.cos(i * 0.27 + t * 0.57)) : 0.08;
        b.style.transform = `scaleY(${h.toFixed(3)})`;
      });
      v.leeft = leeft;
    }
    zet('vlag', p > 0.225, (w) => { vlagk.classList.toggle('aan', w); n1.style.opacity = w ? 1 : 0; });
    zet('n2', p > 0.325, (w) => { n2.style.opacity = w ? 1 : 0; });
    zet('stop', p > 0.425 && p < 0.47, (w) => { stopk.classList.toggle('druk', w); });
    zet('vlieg', p >= 0.355 && !zonderVlucht, (w) => { foon.classList.toggle('vlieg', w); });
    const doel = p < 0.08 ? 'h-knop' : p < 0.24 ? 'vlagk' : p < 0.47 ? 'stopk' : 'zin';
    const venster = doel === 'h-knop' ? [0.045, 0.078] : doel === 'vlagk' ? [0.205, 0.238] : doel === 'stopk' ? [0.415, 0.455] : [0.70, 0.74];
    const ta = Math.sin(deel(p, venster[0], venster[1]) * Math.PI);
    zet('touchA', ta.toFixed(3), (w) => { touch.style.opacity = w; });
    if (ta > 0) {
      const el = doel === 'h-knop' ? qs('.h-knop', home) : doel === 'vlagk' ? vlagk : doel === 'stopk' ? stopk : zin;
      if (!maat.doel) maat.doel = new Map();
      if (!maat.doel.has(el)) maat.doel.set(el, opScherm(el));
      const [x, y] = maat.doel.get(el);
      touch.style.transform = `translate(${x}px,${y}px)`;
    }
    zet('zinTab', p > 0.55 ? 0 : -1, (w) => { zin.tabIndex = w; });
    const aan = p >= 0.725;
    zet('zinL', aan, (w) => { zin.classList.toggle('licht', w); speler.classList.toggle('speelt', w && p < 0.96); });
    const woordD = deel(p, 0.775, 0.945);
    if (!replay) {
      const n = Math.ceil(woordD * kws.length);
      zet('kw', n, (w) => { kws.forEach((el, i) => { el.classList.toggle('op', i < w); el.classList.toggle('nu', i === w - 1 && w < kws.length); }); });
      const sp = aan ? 48 + Math.round(5 * woordD) : 0;
      zet('pt', sp, (w) => { ptijd.textContent = `${fmtKort(w)} / 12:00`; });
      zet('vrA', (deel(p, 0.6, 0.625) * (1 - deel(p, 0.735, 0.755))).toFixed(3), (w) => zetOp(vrWrap, +w));
      zet('grA', deel(p, 0.76, 0.785).toFixed(3), (w) => zetOp(grootP, +w));
    }
    if (!maat) meet();
    const { b, h, top } = maat;
    const vol = Math.max(innerWidth / (b * 0.9), innerHeight / (h * 0.86)) * 1.12;
    const land = uit3(deel(q, 0, 0.08));
    const groei = 0.94 + 0.06 * deel(p, 0, 0.4);
    const opz = inUit2(deel(p, 0.56, 0.62));
    const opMidden = (innerHeight / 2 - (top + h / 2)) * (1 - land);
    const basis = vol + (groei - vol) * land;
    let stand;
    if (breed) {
      const dx = (innerWidth * 0.71 - innerWidth / 2) * opz;
      stand = `translate(${dx.toFixed(1)}px,${opMidden.toFixed(1)}px) scale(${(basis - 0.03 * opz).toFixed(4)})`;
    } else {
      const doelOnder = innerHeight - (isSmal() ? 84 : 24);
      const ruimte = doelOnder - (maat.kopOnder + 16);
      const eind = clamp(0.36, 0.74, ruimte / h);
      const dy = (doelOnder - (top + h / 2 + (h * eind) / 2)) * opz;
      stand = `translate(0,${(dy + opMidden).toFixed(1)}px) scale(${(basis - (groei - eind) * opz).toFixed(4)})`;
    }
    if (!replay || fase.p >= 0.62) zet('foon', stand, (w) => { foon.style.transform = w; });
    zet('fl2', (1 - deel(q, 0, 0.022)).toFixed(3), (w) => { flits2.style.opacity = w; flits2.style.visibility = +w > 0 ? 'visible' : 'hidden'; });
    zet('arts', deel(p, 0.085, 0.14).toFixed(3), (w) => { bArts.style.opacity = w; });
    caps.forEach((c, i) => {
      const [a, e] = CAP[i];
      const aan = (i === 0 ? q >= 0.06 : p >= a) && p < e;
      zet(`c${i}`, aan, (w) => { c.classList.toggle('zien', w); });
    });
    let laatste = -1;
    const zien = glazen.map((g, i) => { const z = q > 0.05 && p >= +g.dataset.at && p < 0.56; if (z) laatste = i; return z; });
    glazen.forEach((g, i) => {
      const om = g.dataset.om && p >= +g.dataset.om;
      zet(`g${i}`, `${zien[i]}${i === laatste}${om}`, () => { g.classList.toggle('aan', zien[i]); g.classList.toggle('nu', i === laatste); g.classList.toggle('om', !!om); });
    });
    const ha = deel(p, 0.95, 0.975);
    zet('hint', ha.toFixed(3), (w) => { hint.style.opacity = w; hint.style.visibility = +w > 0 ? 'visible' : 'hidden'; });
  }
  const zetFase = (s) => { fase.q = s.progress; fase.p = deel(s.progress, 0.08, 1); };
  ScrollTrigger.create({
    trigger: '.demo', start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
    onUpdate: (s) => { zetFase(s); teken(); },
    onRefresh: (s) => { zetFase(s); v = {}; meet(); teken(); },
  });
  gsap.fromTo('.demo-bg img', { scale: 1 }, { scale: 1 / 1.1, ease: 'none', scrollTrigger: { trigger: '.demo', start: 'top top', end: 'bottom bottom', scrub: true } });
  gsap.ticker.add(() => { if (fase.p > 0.09 && fase.p < 0.425) teken(); });
  function speelAf() {
    if (replay || fase.p < 0.5) return;
    const o = { d: 0 };
    zetOp(vrWrap, 0); zetOp(grootP, 1); stage.classList.add('speelt-af');
    if (!stapel.matches && fase.p < 0.62) { foon.style.transition = 'transform .8s cubic-bezier(.2,.7,.1,1)'; foon.style.transform = `translate(${(innerWidth * 0.21).toFixed(1)}px,0) scale(.97)`; v.foon = null; }
    zin.classList.add('licht'); speler.classList.add('speelt');
    replay = gsap.to(o, {
      d: 1, duration: Math.max(2.6, kws.length * 0.34), ease: 'none',
      onUpdate: () => {
        const n = Math.ceil(o.d * kws.length);
        kws.forEach((el, i) => { el.classList.toggle('op', i < n); el.classList.toggle('nu', i === n - 1 && n < kws.length); });
        ptijd.textContent = `${fmtKort(48 + Math.round(5 * o.d))} / 12:00`;
      },
      onComplete: () => {
        const klaar = () => { replay = null; speler.classList.remove('speelt'); stage.classList.remove('speelt-af'); v = {}; teken(); setTimeout(() => { foon.style.transition = ''; }, 900); };
        if (fase.p >= 0.76) { klaar(); return; }
        gsap.to(grootP, { autoAlpha: 0, duration: 0.6, delay: 1.5, ease: 'power1.in', onStart: () => { foon.style.transition = 'transform .8s cubic-bezier(.2,.7,.1,1)'; v.foon = null; }, onComplete: klaar });
      },
    });
  }
  zin.addEventListener('click', speelAf);
  hint.addEventListener('click', speelAf);
  naTaal = () => { bouw(); bouwTape(); ScrollTrigger.refresh(); teken(); };
  mm.add('(min-width:821px)', () => {
    const track = qs('.track');
    gsap.to(track, { x: () => -(track.scrollWidth - innerWidth + 84), ease: 'none', scrollTrigger: { trigger: '.pan', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
  });
  gsap.fromTo('.schrijf-beeld img', { scale: 1.1 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.schrijf', start: 'top bottom', end: 'bottom 70%', scrub: true } });
  qsa('.kop-rij,.bw-kop,.bw,.pv-tekst,.pv-kaart,.pv-meet,.plan,.ladder').forEach((el) => {
    gsap.from(el, { y: 22, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.fromTo('.e-woord', { y: () => qs('.e-woord').offsetHeight * (staand.matches ? 2.9 : 1.6) }, { y: 0, ease: 'none', scrollTrigger: { trigger: '.slot-einde', start: 'top 92%', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
  const klaarzetten = () => {
    const rij = qsa('img').filter((im) => im.offsetParent !== null);
    const volgende = () => {
      const im = rij.shift();
      if (!im) return;
      im.loading = 'eager';
      im.decode().catch(() => {}).then(() => (window.requestIdleCallback || setTimeout)(volgende));
    };
    volgende();
  };
  addEventListener('load', () => { plaats(); bouwTape(); ScrollTrigger.refresh(); setTimeout(klaarzetten, 300); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { plaats(); ScrollTrigger.refresh(); bouwTape(); });
})();
