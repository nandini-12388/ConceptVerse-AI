/* =========================================================
   ConceptVerse — Motion layer (animations.js)

   Pairs with animations.css. Everything is gated on the `anim-on` class on
   <html>, so it is fully reversible:
     ConceptAnim.disable()   – turn all motion off instantly (remembered)
     ConceptAnim.enable()    – turn it back on (remembered)
     ?anim=off / ?anim=on    – same thing via the URL
   To remove the feature entirely, delete the <link> to animations.css and
   the <script> for animations.js from index.html. A full copy of the app
   as it was before this layer is in /backup-pre-animations.

   This file never edits existing app logic. It only:
     • tags containers/children with CSS custom properties (--i) for staggering
     • shows a themed loader while a mission is generating
     • adds click ripples, 3D card tilt, and animated number counters
     • fires confetti when a concept/badge is unlocked
   ========================================================= */

(function () {
  'use strict';

  const PREF_KEY = 'conceptverse.anim.v1';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------- on / off switch ---------------- */

  function readPref() {
    try {
      const q = new URLSearchParams(location.search).get('anim');
      if (q === 'on' || q === 'off') {
        localStorage.setItem(PREF_KEY, q);
        return q;
      }
      return localStorage.getItem(PREF_KEY) || 'on';
    } catch (_) {
      return 'on';
    }
  }

  let enabled = readPref() !== 'off';
  root.classList.toggle('anim-on', enabled);

  function setEnabled(on) {
    enabled = !!on;
    root.classList.toggle('anim-on', enabled);
    try { localStorage.setItem(PREF_KEY, enabled ? 'on' : 'off'); } catch (_) { /* storage blocked */ }
    if (!enabled) removeConfetti();
  }

  const $ = (sel, scope) => (scope || document).querySelector(sel);

  /* ---------------- 1. Stagger indexing ----------------
     Children of these containers get --i (their position). Containers in
     STAGGER also get [data-cv-stagger] so the generic entrance applies;
     INDEX_ONLY containers have bespoke entrance rules in the CSS. */

  const MAX_INDEX = 14;

  const STAGGER = [
    '#appearanceOptions', '#powerOptions', '#weaponOptions', '#roleOptions',
    '#personalityOptions', '#universeSpecificOptions',
    '.choice-options', '#questionOptions',
    '.hub-content', '#codexConceptsGrid'
  ];
  const INDEX_ONLY = [
    '#universePortalsGrid', '#missionCardsGrid', '#storyBeatsFlow',
    '#badgesGrid', '#codexBadgesGrid', '#charactersDisplay'
  ];
  const STAGGER_SEL = STAGGER.join(',');
  const ALL_SEL = STAGGER.concat(INDEX_ONLY).join(',');

  function indexContainer(c) {
    if (c.matches(STAGGER_SEL) && !c.hasAttribute('data-cv-stagger')) {
      c.setAttribute('data-cv-stagger', '');
    }
    const kids = c.children;
    for (let i = 0; i < kids.length; i++) {
      kids[i].style.setProperty('--i', String(Math.min(i, MAX_INDEX)));
    }
  }

  function indexTree(node) {
    if (node.nodeType !== 1) return;
    const parent = node.parentElement;
    if (parent && parent.matches(ALL_SEL)) indexContainer(parent);
    if (node.matches(ALL_SEL)) indexContainer(node);
    const inner = node.querySelectorAll ? node.querySelectorAll(ALL_SEL) : [];
    for (let i = 0; i < inner.length; i++) indexContainer(inner[i]);
  }

  function initStagger() {
    document.querySelectorAll(ALL_SEL).forEach(indexContainer);
    new MutationObserver(muts => {
      for (const m of muts) {
        for (const n of m.addedNodes) indexTree(n);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------------- 2. Mission-generation loader ---------------- */

  const LOADER_MESSAGES = {
    harrypotter: ['Brewing the potion…', 'Consulting the Restricted Section…', 'Enchanting your characters…'],
    marvel:      ['Assembling the team…', 'JARVIS is calculating the crisis…', 'Charging the arc reactor…'],
    space:       ['Plotting the jump coordinates…', 'Scanning the nebula…', 'Warming up the engines…'],
    anime:       ['Gathering your ki…', 'Drawing the opening scene…', 'Awakening the spirit seals…'],
    pirates:     ['Charting the course…', 'Hoisting the sails…', 'Hunting for cursed gold…'],
    mythology:   ['Invoking the celestial astras…', 'Consulting the sages…', 'Aligning the cosmic balance…']
  };
  const LOADER_COMMON = ['Writing your scenes…', 'Crafting the quiz…', 'Almost there…'];

  function currentUniverse() {
    try { return (typeof AppState !== 'undefined' && AppState.currentUniverse) || 'harrypotter'; }
    catch (_) { return 'harrypotter'; }
  }

  function initLoader() {
    const box = $('#missionLoadingState');
    if (!box) return;

    let loader = null;
    let timer = null;

    function show() {
      if (loader) return;
      const list = (LOADER_MESSAGES[currentUniverse()] || []).concat(LOADER_COMMON);
      loader = document.createElement('div');
      loader.className = 'cv-loader';
      loader.setAttribute('role', 'status');
      loader.innerHTML =
        '<div class="cv-loader-orbit" aria-hidden="true"><i></i><i></i><i></i><b></b></div>' +
        '<div class="cv-loader-msg"></div>';
      box.prepend(loader);

      const msgEl = loader.querySelector('.cv-loader-msg');
      let i = 0;
      const next = () => {
        msgEl.textContent = list[i++ % list.length];
        msgEl.style.animation = 'none';
        void msgEl.offsetWidth;          // restart the fade-in
        msgEl.style.animation = '';
      };
      next();
      timer = setInterval(next, 2200);
    }

    function hide() {
      clearInterval(timer);
      timer = null;
      if (loader) { loader.remove(); loader = null; }
    }

    new MutationObserver(() => {
      if (box.style.display === 'none') hide(); else show();
    }).observe(box, { attributes: true, attributeFilter: ['style'] });
  }

  /* ---------------- 3. Click ripples ---------------- */

  const RIPPLE_SEL = [
    '.choice-btn', '.question-option-btn', '.option-btn', '.mission-card-launch-btn',
    '.story-continue-btn', '.hub-action-btn', '.primary-btn', '.hub-link-btn'
  ].join(',');

  function initRipples() {
    document.addEventListener('pointerdown', e => {
      if (!enabled || (reducedMotion && reducedMotion.matches)) return;
      const el = e.target.closest && e.target.closest(RIPPLE_SEL);
      if (!el || el.disabled) return;

      const cs = getComputedStyle(el);
      if (cs.position === 'static') el.style.position = 'relative';
      if (cs.overflow === 'visible') el.style.overflow = 'hidden';

      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'cv-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }, { passive: true });
  }

  /* ---------------- 4. 3D tilt on universe / mission cards ---------------- */

  const TILT_SEL = '.universe-portal, .mission-card';

  function initTilt() {
    let raf = 0;

    document.addEventListener('pointermove', e => {
      if (!enabled || e.pointerType !== 'mouse') return;
      const card = e.target.closest && e.target.closest(TILT_SEL);
      if (!card) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 12).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * 10).toFixed(2) + 'deg');
      });
    }, { passive: true });

    document.addEventListener('pointerout', e => {
      const card = e.target.closest && e.target.closest(TILT_SEL);
      if (!card || (e.relatedTarget && card.contains(e.relatedTarget))) return;
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    }, { passive: true });
  }

  /* ---------------- 5. Animated number counters ---------------- */

  const COUNTER_IDS = ['adventurePoints', 'challengePoints', 'hubPoints', 'hubLargePoints', 'codexTotalXP'];

  function bump(el) {
    el.classList.remove('cv-bump');
    void el.offsetWidth;
    el.classList.add('cv-bump');
    el.addEventListener('animationend', () => el.classList.remove('cv-bump'), { once: true });
  }

  function watchCounter(el) {
    let current = parseInt(el.textContent, 10);
    if (isNaN(current)) current = 0;
    let target = current;
    let raf = 0;

    const obs = new MutationObserver(() => {
      if (!enabled || (reducedMotion && reducedMotion.matches)) {
        const v = parseInt(el.textContent, 10);
        if (!isNaN(v)) { current = target = v; }
        return;
      }
      const txt = el.textContent.trim();
      if (!/^-?\d+$/.test(txt)) return;           // only plain numbers
      const to = parseInt(txt, 10);
      if (to === target) return;

      const from = current;
      target = to;
      if (from === to) return;

      cancelAnimationFrame(raf);
      const write = v => { el.textContent = String(v); obs.takeRecords(); };
      write(from);                                // keep showing the old value, then climb
      bump(el);

      const t0 = performance.now();
      const dur = Math.min(1100, 350 + Math.abs(to - from) * 9);
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        current = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        write(current);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    obs.observe(el, { childList: true, characterData: true, subtree: true });
  }

  function initCounters() {
    COUNTER_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) watchCounter(el);
    });
  }

  /* ---------------- 6. Confetti ---------------- */

  const CONFETTI_COLORS = ['#ffd700', '#7c5cff', '#22d3ee', '#f472b6', '#4ade80', '#fb923c', '#ffffff'];
  const CONFETTI_EMOJI = ['✨', '⭐', '🎉', '🌟'];
  let confettiTimer = null;

  function removeConfetti() {
    clearTimeout(confettiTimer);
    const old = document.getElementById('cvConfetti');
    if (old) old.remove();
  }

  function confetti(count) {
    if (!enabled || (reducedMotion && reducedMotion.matches)) return;
    removeConfetti();

    const layer = document.createElement('div');
    layer.id = 'cvConfetti';
    layer.setAttribute('aria-hidden', 'true');

    const n = count || 90;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'cv-confetti-piece';
      const duration = 2.4 + Math.random() * 2.2;
      p.style.left = (Math.random() * 100) + '%';
      p.style.animationDuration = duration + 's';
      p.style.animationDelay = (Math.random() * 0.7) + 's';
      p.style.setProperty('--dx', ((Math.random() - 0.5) * 260) + 'px');
      p.style.setProperty('--rot', ((Math.random() - 0.5) * 1080) + 'deg');

      if (i % 6 === 0) {
        p.textContent = CONFETTI_EMOJI[Math.floor(Math.random() * CONFETTI_EMOJI.length)];
        p.style.fontSize = (14 + Math.random() * 14) + 'px';
      } else {
        const w = 6 + Math.random() * 7;
        p.style.width = w + 'px';
        p.style.height = (w * (0.5 + Math.random() * 0.9)) + 'px';
        p.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      }
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    confettiTimer = setTimeout(removeConfetti, 6500);
  }

  function initRewards() {
    // Concept Unlocked screen becomes active -> celebrate
    const screen = document.getElementById('conceptUnlockedScreen');
    if (screen) {
      let was = screen.classList.contains('active-screen');
      new MutationObserver(() => {
        const now = screen.classList.contains('active-screen');
        if (now && !was) setTimeout(() => confetti(110), 500);
        was = now;
      }).observe(screen, { attributes: true, attributeFilter: ['class'] });
    }

    // Badge sound effect -> small celebration (wraps the existing function; behaviour unchanged)
    const ve = window.VoiceEngine;
    if (ve && typeof ve.playSfx === 'function' && !ve.__cvWrapped) {
      const original = ve.playSfx;
      ve.playSfx = function (type) {
        const result = original.apply(this, arguments);
        if (type === 'badge') confetti(70);
        return result;
      };
      ve.__cvWrapped = true;
    }
  }

  /* ---------------- boot ---------------- */

  function init() {
    initStagger();
    initLoader();
    initRipples();
    initTilt();
    initCounters();
    initRewards();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.ConceptAnim = {
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
    isEnabled: () => enabled,
    confetti
  };
})();
