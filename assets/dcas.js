
// DCAS — interactions et animations (aucun service externe, compatible GitHub Pages)
(function () {
  'use strict';
  window.__dcas = 1;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = mqReduce.matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const hasIO = 'IntersectionObserver' in window;

  let DATA = null;
  try { const d = $('#dcas-data'); DATA = d ? JSON.parse(d.textContent) : null; } catch (e) {}

  const toastEl = $('#toast');
  const toast = t => {
    if (!toastEl) return;
    toastEl.textContent = t;
    toastEl.classList.add('on');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('on'), 2800);
  };

  /* ------------------------------------------------------------------
     Titres : révélation mot par mot (préserve les balises internes)
  ------------------------------------------------------------------ */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    let i = 0;
    const box = () => {
      const o = document.createElement('span'); o.className = 'w';
      const n = document.createElement('span'); n.style.setProperty('--wi', i++);
      o.appendChild(n); return [o, n];
    };
    [...el.childNodes].forEach(node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const [o, n] = box(); n.textContent = part; frag.appendChild(o);
 });
 node.replaceWith(frag);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
 const [o, n] = box(); node.replaceWith(o); n.appendChild(node);
      }
    });
    el.classList.add('h-split');
  }
  const heads = $$('.sec h2');
  if (!reduce && hasIO) {
    heads.forEach(splitWords);
    const hio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { hio.unobserve(e.target); e.target.classList.add('shown'); }
    }), { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
    heads.forEach(h => hio.observe(h));
  }

  /* ------------------------------------------------------------------
     Démarrage de la page (après l'intro)
  ------------------------------------------------------------------ */
  let started = false;
  function startPage() {
    if (started) return;
    started = true;
    root.classList.add('ready');
    initCounters();
  }

  /* ------------------------------------------------------------------
     Intro d'ouverture (≈ 1,9 s, une fois par visite)
  ------------------------------------------------------------------ */
  const intro = $('#intro');
  function playIntro() {
    let left = false, stopParticles = () => {};
    const skip = $('.intro-skip', intro);
    const onKey = e => { if (e.key === 'Escape' || (e.key === 'Enter' && document.activeElement === skip)) leave(true); };
    const outTimer = setTimeout(() => leave(false), 1900);

    function leave(fast) {
      if (left) return;
      left = true;
      clearTimeout(outTimer);
      removeEventListener('keydown', onKey);
      if (fast) intro.classList.add('fast');
      intro.classList.add('out');
      setTimeout(startPage, fast ? 160 : 180);
      setTimeout(() => {
        stopParticles();
 root.classList.remove('intro-on');
        intro.remove();
      }, fast ? 650 : 1000);
    }

    stopParticles = particles($('.intro-canvas', intro));
    skip && skip.addEventListener('click', () => leave(true));
    addEventListener('keydown', onKey);
  }

  // Particules fines qui convergent vers le logo, puis se dispersent
  function particles(cv) {
    if (!cv || !cv.getContext) return () => {};
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, alive = true;
    const resize = () => {
      w = innerWidth; h = innerHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);
    const cols = ['139,147,255', '255,255,255', '88,101,242'];
    const N = w < 700 ? 34 : 60;
    const ps = Array.from({ length: N }, () => ({
      a: Math.random() * 6.2832,
      r: (0.3 + Math.random() * 0.8) * Math.max(w, h) * 0.55,
      s: 0.6 + Math.random() * 1.3,
      c: cols[(Math.random() * cols.length) | 0],
      spin: (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random()),
      o: 0.35 + Math.random() * 0.5,
      k: Math.random()
    }));
    const t0 = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const IN = 0.8, OUT = 0.9;
    function frame(now) {
      if (!alive) return;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const cx = w / 2, cy = h / 2 - 16;
      for (const p of ps) {
        let rad, ang, alpha;
        if (t < IN) {
   const q = ease(t / IN);
   rad = p.r * (1 - q) + 6;
          ang = p.a + p.spin * (1 - q) * 2;
   alpha = p.o * (0.2 + 0.8 * q);
        } else {
          const q = clamp((t - IN) / OUT, 0, 1);
          if (q >= 1) continue;
   rad = 6 + (80 + p.k * Math.max(w, h) * 0.4) * ease(q);
          ang = p.a + p.spin * q * 0.5;
          alpha = p.o * Math.pow(1 - q, 1.8);
 }
        ctx.fillStyle = 'rgba(' + p.c + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, p.s, 0, 6.2832);
        ctx.fill();
      }
      if (t < IN + OUT + 0.3) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }

  if (intro && root.classList.contains('intro-on') && !reduce) playIntro();
  else { if (intro) intro.remove(); root.classList.remove('intro-on'); startPage(); }

  /* ------------------------------------------------------------------
     Défilement : en-tête, barre de progression, parallaxe
  ------------------------------------------------------------------ */
  const header = $('.top');
  const bar = $('.progress i');
  const pls = $$('[data-parallax]');
  let ticking = false, ptrX = 0, ptrY = 0;

  function update() {
    ticking = false;
    const y = window.scrollY, vh = innerHeight;
    if (header) header.classList.toggle('scrolled', y > 24);
    if (bar) {
      const max = root.scrollHeight - vh;
      bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(4) + ')';
    }
    if (!reduce) {
      for (const el of pls) {
 const p = el.parentElement.getBoundingClientRect();
        if (p.bottom < -300 || p.top > vh + 300) continue;
        const f = (parseFloat(el.dataset.parallax) || 0) * 0.7;
        const cy = p.top + p.height / 2 - vh / 2;
 el.style.transform = 'translate3d(' + (ptrX * f * 120).toFixed(1) + 'px,' + (-cy * f + ptrY * f * 40).toFixed(1) + 'px,0)';
      }
    }
  }
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  queue();

  /* ------------------------------------------------------------------
     Menu mobile + lien actif
  ------------------------------------------------------------------ */
  const menuBtn = $('.menu-btn'), nav = $('.nav');
  const setNav = open => {
    root.classList.toggle('nav-open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
  };
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => setNav(!root.classList.contains('nav-open')));
    $$('.nav a').forEach((a, i) => { a.style.setProperty('--n', i); a.addEventListener('click', () => setNav(false)); });
    const scrim = $('.nav-scrim');
    scrim && scrim.addEventListener('click', () => setNav(false));
    addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('nav-open')) { setNav(false); menuBtn.focus(); } });
    addEventListener('resize', () => { if (innerWidth > 960) setNav(false); });
  }

  const ind = $('.nav-ind');
  const linkFor = {};
  $$('.nav a').forEach(a => {
    const m = (a.getAttribute('href') || '').match(/#(.+)$/);
    if (m && $('#' + m[1]) && /(^|\/)(index\.html)?#/.test(a.getAttribute('href'))) linkFor[m[1]] = a;
  });
  let activeLink = null;
  function placeInd() {
    if (!ind || !nav) return;
    if (!activeLink || innerWidth <= 960) { ind.style.opacity = '0'; return; }
    const nr = nav.getBoundingClientRect(), r = activeLink.getBoundingClientRect();
    ind.style.transform = 'translate3d(' + (r.left - nr.left + 12).toFixed(1) + 'px,0,0) scaleX(' + ((r.width - 24) / 100).toFixed(3) + ')';
    ind.style.opacity = '1';
  }
  function setActive(id) {
    const next = id ? linkFor[id] || null : null;
    if (next === activeLink) return;
    if (activeLink) activeLink.classList.remove('on');
    activeLink = next;
    if (activeLink) { activeLink.classList.add('on'); activeLink.setAttribute('aria-current', 'true'); }
    $$('.nav a').forEach(a => { if (a !== activeLink) a.removeAttribute('aria-current'); });
    placeInd();
  }
  if (hasIO && Object.keys(linkFor).length) {
    const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(linkFor).forEach(id => spy.observe($('#' + id)));
    addEventListener('scroll', () => { if (window.scrollY < 240) setActive(null); }, { passive: true });
    addEventListener('resize', placeInd);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeInd);
  }

  /* ------------------------------------------------------------------
     Apparition au défilement (avec décalage) + chargement des démos
     (les h2 sont gérés à part : révélation mot par mot)
  ------------------------------------------------------------------ */
  const REVEAL = '.sec .kicker,.sec-lead,.chips,.packs-sub,.bgrid,.summary,.host-card,.faq details,.contact,.aud>div,.step,.promise>div,.opt,.pack,.tpack,.mod,.legal>*';
  $$(REVEAL).forEach(el => el.classList.add('reveal'));
  if (reduce || !hasIO) $$('.sec h2').forEach(h => h.classList.add('reveal'));
  const groups = new Map();
  $$('.reveal').forEach(el => {
    const p = el.parentElement;
    const n = groups.get(p) || 0;
    groups.set(p, n + 1);
    el.style.setProperty('--d', ((n % 4) * 0.07).toFixed(2) + 's');
  });
  const settleEl = el => {
    const demo = $('.mod-demo', el);
    if (demo) setTimeout(() => demo.classList.add('loaded'), 600);
    const delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
    setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.removeProperty('--d'); }, (delay + 1.1) * 1000);
  };
  const steps = $('.steps');
  if (hasIO && !reduce) {
    const rio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      rio.unobserve(e.target);
      e.target.classList.add('in');
      settleEl(e.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(el => rio.observe(el));
    if (steps) {
      const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { steps.classList.add('in'); sio.disconnect(); } }), { threshold: 0.3 });
      sio.observe(steps);
    }
  } else {
    $$('.reveal').forEach(el => { el.classList.add('in'); const d = $('.mod-demo', el); if (d) d.classList.add('loaded'); });
    if (steps) steps.classList.add('in');
    $$('.mod-demo').forEach(d => d.classList.add('loaded'));
  }

  // Lien profond (#contact, etc.) : saut immédiat, section visible, puis défilement fluide
  const jumpHash = () => {
    const hashId = (location.hash || '').replace(/^#/, '');
    const target = hashId && document.getElementById(hashId);
    if (!target) return;
    [target, ...$$('.reveal', target)].forEach(el => {
      if (el.classList.contains('reveal')) { el.classList.add('in'); settleEl(el); }
    });
    $$('.h-split', target).forEach(h => h.classList.add('shown'));
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  };
  jumpHash();
  requestAnimationFrame(() => {
    jumpHash();
    requestAnimationFrame(() => root.classList.add('smooth'));
  });

  /* ------------------------------------------------------------------
     Chiffres qui s'animent
  ------------------------------------------------------------------ */
  function countUp(el) {
    const end = parseFloat(el.dataset.count);
    if (!isFinite(end)) return;
    const dur = 900 + Math.min(end, 400) * 1.6, t0 = performance.now();
    el.textContent = '0';
    const step = now => {
      const p = clamp((now - t0) / dur, 0, 1);
      el.textContent = p < 1 ? String(Math.round(end * (1 - Math.pow(1 - p, 4)))) : String(end);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function initCounters() {
    if (reduce || !hasIO) return;
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { cio.unobserve(e.target); countUp(e.target); }
    }), { threshold: 0.6 });
    $$('[data-count]').forEach(el => cio.observe(el));
  }

  /* ------------------------------------------------------------------
     Cartes : projecteur discret + bordure lumineuse du pack recommandé
  ------------------------------------------------------------------ */
  $$('.spot').forEach(c => {
    const fx = document.createElement('span');
    fx.className = 'fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = (c.classList.contains('feat') ? '<b class="cone"></b>' : '') + '<i class="sp"></i>';
    c.prepend(fx);
  });
  const cones = $$('.fx .cone');
  function sizeCones() {
    cones.forEach(cn => {
      const r = cn.parentElement.getBoundingClientRect();
      const s = Math.ceil(Math.hypot(r.width, r.height)) + 8;
      cn.style.width = cn.style.height = s + 'px';
      cn.style.marginLeft = cn.style.marginTop = (-s / 2) + 'px';
    });
  }
  if (cones.length) { sizeCones(); addEventListener('resize', sizeCones); addEventListener('load', sizeCones); if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeCones); }

  /* ------------------------------------------------------------------
     Souris : lueur douce, projecteur des cartes, légère inclinaison 3D
  ------------------------------------------------------------------ */
  const glow = $('.glow');
  const vis = $('.hero-visual'), tilt = $('.tilt');
  const heroEl = $('.hero');
  let heroInView = true;
  if (hasIO && heroEl) new IntersectionObserver(es => { heroInView = es[0].isIntersecting; syncTabs(); }).observe(heroEl);

  if (fine && !reduce) {
    let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my, running = false;
    let lastEv = null, pending = false, spotCard = null;

    const loop = () => {
      gx += (mx - gx) * 0.07; gy += (my - gy) * 0.07;
      if (glow) glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      if (Math.abs(mx - gx) + Math.abs(my - gy) > 0.4) requestAnimationFrame(loop);
      else running = false;
    };

    const frame = () => {
      pending = false;
      const e = lastEv; if (!e) return;
      const card = e.target.closest ? e.target.closest('.spot') : null;
      if (spotCard && spotCard !== card) spotCard.classList.remove('lit');
      spotCard = card;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
        card.classList.add('lit');
      }
      if (tilt && vis && heroInView) {
 const r = vis.getBoundingClientRect();
        const dx = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth * 0.5), -1, 1);
 const dy = clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight * 0.5), -1, 1);
        tilt.style.transform = 'rotateY(' + (dx * 4).toFixed(2) + 'deg) rotateX(' + (-dy * 3).toFixed(2) + 'deg)';
      }
      ptrX = e.clientX / innerWidth - 0.5; ptrY = e.clientY / innerHeight - 0.5;
      queue();
    };

    document.addEventListener('pointermove', e => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!root.classList.contains('pointer-on')) { gx = mx; gy = my; root.classList.add('pointer-on'); }
      if (!running) { running = true; requestAnimationFrame(loop); }
      lastEv = e;
      if (!pending) { pending = true; requestAnimationFrame(frame); }
    }, { passive: true });

    root.addEventListener('mouseleave', () => {
      root.classList.remove('pointer-on');
      if (spotCard) { spotCard.classList.remove('lit'); spotCard = null; }
      if (tilt) tilt.style.transform = '';
    });

    // Boutons légèrement magnétiques
    $$('.btn-main,.dtag button').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((e.clientX - (r.left + r.width / 2)) * 0.1).toFixed(1) + 'px');
 b.style.setProperty('--by', ((e.clientY - (r.top + r.height / 2)) * 0.18).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
  }

  // Ondes au clic
  document.addEventListener('pointerdown', e => {
    if (reduce) return;
    const t = e.target.closest && e.target.closest('.btn,.add,.dtag button');
    if (!t) return;
    const r = t.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'rip';
    s.style.left = (e.clientX - r.left) + 'px';
    s.style.top = (e.clientY - r.top) + 'px';
    t.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }, { passive: true });

  /* ------------------------------------------------------------------
     Héros : démos Discord (la barre de progression pilote le défilement)
  ------------------------------------------------------------------ */
  const slides = $$('.hero-slide'), tabsWrap = $('.hero-tabs'), tabs = $$('.hero-tabs button');
  let hi = 0;
  function show(i) {
    hi = i;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    tabs.forEach(t => t.classList.remove('on'));
    if (tabsWrap) void tabsWrap.offsetWidth;
    if (tabs[i]) { tabs[i].classList.add('on'); tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i))); }
    const chan = $('#hero-chan');
    if (chan && slides[i]) chan.textContent = slides[i].dataset.chan;
  }
  let hoverPause = false;
  function syncTabs() { if (tabsWrap) tabsWrap.classList.toggle('paused', hoverPause || !heroInView); }
  if (slides.length) {
    tabs.forEach((t, k) => {
      t.setAttribute('type', 'button');
      t.addEventListener('click', () => show(k));
      t.addEventListener('animationend', e => { if (e.animationName === 'tabfill') show((hi + 1) % slides.length); });
    });
    if (vis) {
      vis.addEventListener('pointerenter', () => { hoverPause = true; syncTabs(); });
      vis.addEventListener('pointerleave', () => { hoverPause = false; syncTabs(); });
      vis.addEventListener('focusin', () => { hoverPause = true; syncTabs(); });
      vis.addEventListener('focusout', () => { hoverPause = false; syncTabs(); });
    }
    show(0);
  }

  /* ------------------------------------------------------------------
     Filtres des modules
  ------------------------------------------------------------------ */
  $$('.chip').forEach(c => {
    c.setAttribute('type', 'button');
    c.setAttribute('aria-pressed', String(c.classList.contains('on')));
    c.addEventListener('click', () => {
      $$('.chip').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
      c.classList.add('on'); c.setAttribute('aria-pressed', 'true');
      const cat = c.dataset.cat;
      let i = 0;
      $$('.mod').forEach(m => {
        const visible = cat === 'all' || m.dataset.cat === cat;
 m.classList.toggle('hide', !visible);
        const demo = $('.mod-demo', m); if (demo) demo.classList.add('loaded');
        if (visible && !reduce) {
          m.classList.remove('reveal', 'in', 'pop');
   m.style.setProperty('--d', (Math.min(i++, 8) * 0.05).toFixed(2) + 's');
   void m.offsetWidth;
          m.classList.add('pop');
          m.addEventListener('animationend', function f() { m.classList.remove('pop'); m.style.removeProperty('--d'); m.removeEventListener('animationend', f); });
        }
      });
    });
  });

  /* ------------------------------------------------------------------
     Composer sa commande
  ------------------------------------------------------------------ */
  const composer = $('#composer');
  const copy = async t => {
    try { await navigator.clipboard.writeText(t); return true; }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (er) {}
      ta.remove(); return ok;
    }
  };
  async function copyWithState(btn, text, okMsg) {
    const lbl = $('.lbl', btn);
    const orig = lbl ? lbl.textContent : '';
    btn.classList.add('busy');
    const ok = await copy(text);
    await sleep(reduce ? 0 : 400);
    btn.classList.remove('busy');
    if (ok) {
      toast(okMsg);
      if (lbl) { lbl.textContent = 'Copié'; btn.classList.add('done'); setTimeout(() => { lbl.textContent = orig; btn.classList.remove('done'); }, 1800); }
    } else toast('Copie impossible : sélectionne le texte manuellement');
  }
  $$('.copy-tag').forEach(b => {
    if (!DATA) return;
    b.setAttribute('type', 'button');
    b.addEventListener('click', () => copyWithState(b, DATA.discord, 'Pseudo copié : ' + DATA.discord));
  });

  if (composer && DATA) {
    const sel = new Set();
    const price = id => DATA.modules[id].price;
    const fmtE = n => (Math.round(n * 100) / 100).toString().replace('.', ',') + ' €';
    const tween = (el, to) => {
      if (!el) return;
      const from = el._v == null ? 0 : el._v;
      el._v = to;
      cancelAnimationFrame(el._r);
      if (reduce || from === to) { el.textContent = fmtE(to); return; }
      const t0 = performance.now(), dur = 450;
      const step = now => {
        const p = clamp((now - t0) / dur, 0, 1);
        el.textContent = p < 1 ? Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))) + ' €' : fmtE(to);
        if (p < 1) el._r = requestAnimationFrame(step);
      };
      el._r = requestAnimationFrame(step);
    };
    const bump = el => { if (!el || reduce) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };

    const sCount = $('#s-count'), sSum = $('#s-sum'), sDisc = $('#s-disc'), sDiscV = $('#s-disc-v'), sTotal = $('#s-total'), sHint = $('#s-hint'), sMsg = $('#s-msg');
    const cbCount = $('#cb-count'), cbTotal = $('#cb-total'), cartbar = $('#cartbar');
    let lastTotal = null;

    function render() {
      $$('.bitem').forEach(b => { const on = sel.has(b.dataset.id); b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
      $$('.add').forEach(b => { const on = sel.has(b.dataset.id); b.classList.toggle('on', on); b.textContent = on ? '✓ Ajouté' : '+ Ajouter'; });
      const ids = [...sel], sum = ids.reduce((a, i) => a + price(i), 0), n = ids.length;
      const libre = n >= DATA.libreMin, total = libre ? Math.ceil(sum * (1 - DATA.libreDisc)) : sum;
      const totalStr = total.toString().replace('.', ',') + ' €';
      const countStr = n + ' module' + (n > 1 ? 's' : '');
      if (sCount) sCount.textContent = countStr;
      if (cbCount) cbCount.textContent = countStr;
      tween(sSum, sum);
      if (sDisc) sDisc.style.display = libre ? 'flex' : 'none';
      if (sDiscV) sDiscV.textContent = '− ' + (Math.round((sum - total) * 100) / 100).toString().replace('.', ',') + ' €';
      tween(sTotal, total);
      tween(cbTotal, total);
      if (lastTotal !== null && lastTotal !== total) bump(sTotal);
      lastTotal = total;
      let hint = '';
      if (n === 0) hint = 'Clique sur les modules qui t\'intéressent. Dès ' + DATA.libreMin + ' modules : −50 % (Pack Libre).';
      else {
        const better = DATA.packs.filter(p => ids.every(i => p.modules.includes(i)) && p.price < total).sort((a, b) => a.price - b.price)[0];
        if (better) hint = 'Le <b>' + better.name + '</b> contient tout ça' + (better.modules.length > ids.length ? ' (et plus)' : '') + ' pour <b>' + better.price + ' €</b>.';
        else if (!libre) hint = 'Encore <b>' + (DATA.libreMin - n) + '</b> module' + (DATA.libreMin - n > 1 ? 's' : '') + ' et tu passes en Pack Libre à −50 %.';
        else hint = 'Pack Libre activé : tu paies la moitié du prix des modules.';
      }
      if (sHint) sHint.innerHTML = hint;
      const lines = ids.map(i => '- ' + DATA.modules[i].name + ' (' + price(i) + ' €)').join('\n');
      if (sMsg) sMsg.value = n ? ('Salut ! Je viens du site DCAS, je voudrais un bot avec :\n' + lines + '\nTotal estimé : ' + totalStr + (libre ? ' (Pack Libre −50 %)' : '') + '\nMon serveur parle de : ') : '';
      updateCartbar(n);
    }
    const toggle = id => { sel.has(id) ? sel.delete(id) : sel.add(id); render(); };

    $$('.bitem').forEach(b => {
      b.setAttribute('role', 'checkbox'); b.setAttribute('tabindex', '0'); b.setAttribute('aria-checked', 'false');
      b.addEventListener('click', () => toggle(b.dataset.id));
      b.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(b.dataset.id); } });
    });
    $$('.add').forEach(b => { b.setAttribute('type', 'button'); b.addEventListener('click', () => { toggle(b.dataset.id); if (sel.has(b.dataset.id)) toast(DATA.modules[b.dataset.id].name + ' ajouté à ta commande'); }); });

    const summary = $('#summary');
    $$('[data-pack]').forEach(b => b.addEventListener('click', e => {
      e.preventDefault();
      const p = [...DATA.packs, ...(DATA.tpacks || [])].find(x => x.id === b.dataset.pack);
      if (!p) return;
      const msg = 'Salut ! Je viens du site DCAS, je voudrais le ' + p.name + ' (' + p.price + ' €).\nMon serveur parle de : ';
      sel.clear(); render(); if (sMsg) sMsg.value = msg;
      composer.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      toast(p.name + ' sélectionné');
      if (summary && !reduce) { summary.classList.remove('flash'); void summary.offsetWidth; summary.classList.add('flash'); setTimeout(() => summary.classList.remove('flash'), 1300); }
    }));

    const copyBtn = $('#s-copy');
    if (copyBtn) copyBtn.addEventListener('click', () => {
      const t = sMsg ? sMsg.value : '';
      if (!t) { toast('Choisis au moins un module ou un pack'); return; }
      copyWithState(copyBtn, t, 'Message copié : envoie-le en MP à ' + DATA.discord);
    });

    // Barre de commande flottante (mobile / tablette)
    let inComposer = false, inSummary = false, count = 0;
    function updateCartbar(n) { if (n !== undefined) count = n; if (cartbar) cartbar.classList.toggle('show', count > 0 && inComposer && !inSummary); }
    if (hasIO && cartbar) {
      new IntersectionObserver(es => { inComposer = es[0].isIntersecting; updateCartbar(); }).observe(composer);
      if (summary) new IntersectionObserver(es => { inSummary = es[0].isIntersecting; updateCartbar(); }, { threshold: 0.15 }).observe(summary);
    }
    render();
  }

  mqReduce.addEventListener && mqReduce.addEventListener('change', e => {
    reduce = e.matches;
    if (reduce) {
      startPage();
      $$('.reveal').forEach(el => el.classList.add('in'));
      $$('.h-split').forEach(h => h.classList.add('shown'));
      $$('.mod-demo').forEach(d => d.classList.add('loaded'));
      if (steps) steps.classList.add('in');
    }
  });
})();