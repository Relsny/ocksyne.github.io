// DCAS : interactions (aucun service externe, compatible GitHub Pages)
(function () {
  'use strict';
  window.__dcas = 1;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const hasIO = 'IntersectionObserver' in window;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

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

  /* Menu mobile */
  const menuBtn = $('.menu-btn'), nav = $('.nav');
  const setNav = open => {
    root.classList.toggle('nav-open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
  };
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => setNav(!root.classList.contains('nav-open')));
    $$('.nav a').forEach(a => a.addEventListener('click', () => setNav(false)));
    const scrim = $('.nav-scrim');
    if (scrim) scrim.addEventListener('click', () => setNav(false));
    addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('nav-open')) { setNav(false); menuBtn.focus(); } });
    addEventListener('resize', () => { if (innerWidth > 960) setNav(false); });
  }

  /* Lien actif selon la section visible */
  const linkFor = {};
  $$('.nav a').forEach(a => {
    const m = (a.getAttribute('href') || '').match(/#(.+)$/);
    if (m && $('#' + m[1])) linkFor[m[1]] = a;
  });
  let activeLink = null;
  function setActive(id) {
    const next = id ? linkFor[id] || null : null;
    if (next === activeLink) return;
    if (activeLink) { activeLink.classList.remove('on'); activeLink.removeAttribute('aria-current'); }
    activeLink = next;
    if (activeLink) { activeLink.classList.add('on'); activeLink.setAttribute('aria-current', 'true'); }
  }
  if (hasIO && Object.keys(linkFor).length) {
    const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(linkFor).forEach(id => spy.observe($('#' + id)));
    addEventListener('scroll', () => { if (window.scrollY < 240) setActive(null); }, { passive: true });
  }

  /* Démos Discord du héros */
  const slides = $$('.hero-slide'), tabsWrap = $('.hero-tabs'), tabs = $$('.hero-tabs button');
  const vis = $('.hero-visual'), heroEl = $('.hero');
  let hi = 0, hoverPause = false, heroInView = true;
  function syncTabs() { if (tabsWrap) tabsWrap.classList.toggle('paused', hoverPause || !heroInView); }
  function show(i) {
    hi = i;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    tabs.forEach(t => t.classList.remove('on'));
    if (tabsWrap) void tabsWrap.offsetWidth;
    if (tabs[i]) { tabs[i].classList.add('on'); tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i))); }
    const chan = $('#hero-chan');
    if (chan && slides[i]) chan.textContent = slides[i].dataset.chan;
  }
  if (hasIO && heroEl) new IntersectionObserver(es => { heroInView = es[0].isIntersecting; syncTabs(); }).observe(heroEl);
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

  /* Filtres des modules */
  $$('.chip').forEach(c => {
    c.setAttribute('type', 'button');
    c.setAttribute('aria-pressed', String(c.classList.contains('on')));
    c.addEventListener('click', () => {
      $$('.chip').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
      c.classList.add('on'); c.setAttribute('aria-pressed', 'true');
      const cat = c.dataset.cat;
      $$('.mod').forEach(m => m.classList.toggle('hide', !(cat === 'all' || m.dataset.cat === cat)));
    });
  });

  /* Composer sa commande */
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
    await sleep(mqReduce.matches ? 0 : 200);
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

    const sCount = $('#s-count'), sSum = $('#s-sum'), sDisc = $('#s-disc'), sDiscV = $('#s-disc-v'), sTotal = $('#s-total'), sHint = $('#s-hint'), sMsg = $('#s-msg');
    const cbCount = $('#cb-count'), cbTotal = $('#cb-total'), cartbar = $('#cartbar');
    const summary = $('#summary');
    let inComposer = false, inSummary = false, count = 0;
    function updateCartbar(n) { if (n !== undefined) count = n; if (cartbar) cartbar.classList.toggle('show', count > 0 && inComposer && !inSummary); }

    function render() {
      $$('.bitem').forEach(b => { const on = sel.has(b.dataset.id); b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
      $$('.add').forEach(b => { const on = sel.has(b.dataset.id); b.classList.toggle('on', on); b.textContent = on ? '✓ Ajouté' : '+ Ajouter'; });
      const ids = [...sel], sum = ids.reduce((a, i) => a + price(i), 0), n = ids.length;
      const libre = n >= DATA.libreMin, total = libre ? Math.ceil(sum * (1 - DATA.libreDisc)) : sum;
      const totalStr = total.toString().replace('.', ',') + ' €';
      const countStr = n + ' module' + (n > 1 ? 's' : '');
      if (sCount) sCount.textContent = countStr;
      if (cbCount) cbCount.textContent = countStr;
      if (sSum) sSum.textContent = fmtE(sum);
      if (sDisc) sDisc.style.display = libre ? 'flex' : 'none';
      if (sDiscV) sDiscV.textContent = '− ' + (Math.round((sum - total) * 100) / 100).toString().replace('.', ',') + ' €';
      if (sTotal) sTotal.textContent = fmtE(total);
      if (cbTotal) cbTotal.textContent = fmtE(total);
      let hint = '';
      if (n === 0) hint = 'Clique sur les modules qui t\'intéressent. Dès ' + DATA.libreMin + ' modules : −50 % (Pack Libre).';
      else {
        const better = DATA.packs.filter(p => ids.every(i => p.modules.includes(i)) && p.price < total).sort((a, b) => a.price - b.price)[0];
        if (better) hint = 'Le <b>' + better.name + '</b> (' + better.price + ' €) contient déjà tout ça, et plus encore, pour moins cher.';
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

    $$('[data-pack]').forEach(b => b.addEventListener('click', e => {
      e.preventDefault();
      const p = [...DATA.packs, ...(DATA.tpacks || [])].find(x => x.id === b.dataset.pack);
      if (!p) return;
      const msg = 'Salut ! Je viens du site DCAS, je voudrais le ' + p.name + ' (' + p.price + ' €).\nMon serveur parle de : ';
      sel.clear(); render(); if (sMsg) sMsg.value = msg;
      composer.scrollIntoView({ behavior: mqReduce.matches ? 'auto' : 'smooth' });
      toast(p.name + ' sélectionné');
    }));

    const copyBtn = $('#s-copy');
    if (copyBtn) copyBtn.addEventListener('click', () => {
      const t = sMsg ? sMsg.value : '';
      if (!t) { toast('Choisis au moins un module ou un pack'); return; }
      copyWithState(copyBtn, t, 'Message copié : envoie-le en MP à ' + DATA.discord);
    });

    // Barre de commande flottante (mobile / tablette)
    if (hasIO && cartbar) {
      new IntersectionObserver(es => { inComposer = es[0].isIntersecting; updateCartbar(); }).observe(composer);
      if (summary) new IntersectionObserver(es => { inSummary = es[0].isIntersecting; updateCartbar(); }, { threshold: 0.15 }).observe(summary);
    }
    render();
  }
})();
