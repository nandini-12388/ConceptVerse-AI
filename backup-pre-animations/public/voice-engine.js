/* =========================================================
   ConceptVerse — Character & Narration Voice Engine
   Gives each character & narrator a distinct voice using the browser's
   built-in Web Speech API (free, no API key, no network cost).

   Design rules (calm, interactive & immersive):
   - OFF by default. Nothing plays until the learner asks or enables auto-voices.
   - Speaks both Dialogue AND Narration with theme-appropriate voices!
   - Features enthusiastic "Well done / Hurray / Oh no" speeches for quiz answers!
   - Only ONE voice at a time — every new request cancels the old one.
   - Stops instantly on: scene change, choice click, screen change, Esc key.
   ========================================================= */

(function () {
  'use strict';

  const SUPPORTED =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function';

  const synth = SUPPORTED ? window.speechSynthesis : null;

  const STORAGE_KEY = 'conceptverse.voice.v1';
  const GAP_BETWEEN_LINES_MS = 380;   // breathing room between speakers
  const START_DELAY_MS = 90;          // Chrome drop fix after cancel()
  const AUTOPLAY_DELAY_MS = 500;      // let the scene render first
  const MAX_CHUNK = 180;              // speak long text in sentence chunks
  const HINT_AUTO_HIDE_MS = 9000;

  /* ---------------- Settings (persisted) ---------------- */

  const settings = Object.assign({ autoplay: false, hintSeen: false }, readSettings());

  function readSettings() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (_) { return {}; }
  }
  function saveSettings() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (_) { /* storage blocked */ }
  }

  /* ---------------- FX Engine (Wand Sparkles & Firecrackers) ---------------- */

  function createFxContainer() {
    let container = document.getElementById('fxContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'fxContainer';
      container.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:99999; overflow:hidden;';
      document.body.appendChild(container);
    }
    return container;
  }

  function getElementCenter(el) {
    if (el && typeof el.getBoundingClientRect === 'function') {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    }
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  function triggerSparkle(targetEl) {
    const container = createFxContainer();
    const center = getElementCenter(targetEl);

    if (targetEl && targetEl.classList) {
      targetEl.classList.add('fx-magic-pulse');
      setTimeout(() => targetEl.classList.remove('fx-magic-pulse'), 1000);
    }

    const particles = ['✨', '⭐', '⚡', '🌟', '✦', '✧'];
    const colors = ['#ffd700', '#7c5cff', '#00f2fe', '#4ade80', '#ffffff', '#ff7eb6'];
    const count = 35;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'fx-particle fx-particle--sparkle';
      const isEmoji = i % 3 === 0;
      if (isEmoji) {
        p.textContent = particles[Math.floor(Math.random() * particles.length)];
        p.style.fontSize = (0.8 + Math.random() * 0.9) + 'rem';
      } else {
        const size = 6 + Math.random() * 10;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = '50%';
        p.style.boxShadow = `0 0 12px ${p.style.background}, 0 0 24px ${p.style.background}`;
      }

      p.style.left = center.x + 'px';
      p.style.top = center.y + 'px';

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 60 + Math.random() * 140;
      const vx = Math.cos(angle) * distance;
      const vy = Math.sin(angle) * distance - (20 + Math.random() * 40);
      const rot = (Math.random() - 0.5) * 720;
      const duration = 0.8 + Math.random() * 0.6;

      p.style.transition = `all ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1)`;
      p.style.opacity = '1';

      container.appendChild(p);

      requestAnimationFrame(() => {
        p.style.transform = `translate(${vx}px, ${vy}px) rotate(${rot}deg) scale(${0.4 + Math.random() * 0.8})`;
        p.style.opacity = '0';
      });

      setTimeout(() => p.remove(), duration * 1000 + 100);
    }
  }

  function triggerFirecrackers(targetEl) {
    const container = createFxContainer();
    const center = getElementCenter(targetEl);

    if (targetEl && targetEl.classList) {
      targetEl.classList.add('fx-shake-boom');
      setTimeout(() => targetEl.classList.remove('fx-shake-boom'), 700);
    }

    const fireSymbols = ['💥', '🔥', '✨', '⚡', '🎆'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#ffffff', '#dc2626'];
    const count = 42;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'fx-particle fx-particle--firecracker';
      const isEmoji = i % 4 === 0;
      if (isEmoji) {
        p.textContent = fireSymbols[Math.floor(Math.random() * fireSymbols.length)];
        p.style.fontSize = (0.9 + Math.random() * 1.0) + 'rem';
      } else {
        const size = 5 + Math.random() * 12;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = i % 2 === 0 ? '50%' : '2px';
        p.style.boxShadow = `0 0 12px ${p.style.background}, 0 0 24px #ef4444`;
      }

      p.style.left = center.x + 'px';
      p.style.top = center.y + 'px';

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const speed = 80 + Math.random() * 180;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed + (Math.random() * 60 - 30);
      const rot = (Math.random() - 0.5) * 1080;
      const duration = 0.7 + Math.random() * 0.7;

      p.style.transition = `all ${duration}s cubic-bezier(0.15, 0.85, 0.35, 1)`;
      p.style.opacity = '1';

      container.appendChild(p);

      requestAnimationFrame(() => {
        p.style.transform = `translate(${vx}px, ${vy + 50}px) rotate(${rot}deg) scale(${0.2 + Math.random() * 0.9})`;
        p.style.opacity = '0';
      });

      setTimeout(() => p.remove(), duration * 1000 + 100);
    }
  }

  const FXEngine = {
    triggerSparkle,
    triggerFirecrackers
  };
  window.FXEngine = FXEngine;

  /* ---------------- Character & Narrator voice profiles ----------------
     gender: 'f' | 'm' (used to pick a matching system voice)
     pitch:  0.1 – 2   rate: 0.6 – 1.6   lang: preferred accent
  ------------------------------------------------------------ */

  const PROFILES = {
    // Theme Narrators
    'narrator-harrypotter': { gender: 'm', pitch: 0.9,  rate: 0.92, lang: 'en-GB' },
    'narrator-marvel':      { gender: 'm', pitch: 0.85, rate: 0.96, lang: 'en-US' },
    'narrator-space':       { gender: 'f', pitch: 1.1,  rate: 1.0,  lang: 'en-US' },
    'narrator-anime':       { gender: 'm', pitch: 1.0,  rate: 1.05, lang: 'en-US' },
    'narrator-pirates':     { gender: 'm', pitch: 0.72, rate: 0.9,  lang: 'en-GB' },
    'narrator-mythology':   { gender: 'm', pitch: 0.85, rate: 0.9,  lang: 'en-IN' },
    'narrator':             { gender: 'm', pitch: 0.9,  rate: 0.94, lang: 'en-GB' },

    // Harry Potter Cast
    'hermione granger':   { gender: 'f', pitch: 1.15, rate: 1.06, lang: 'en-GB' },
    'hermione':           { gender: 'f', pitch: 1.15, rate: 1.06, lang: 'en-GB' },
    'harry potter':       { gender: 'm', pitch: 1.0,  rate: 1.0,  lang: 'en-GB' },
    'harry':              { gender: 'm', pitch: 1.0,  rate: 1.0,  lang: 'en-GB' },
    'ron weasley':        { gender: 'm', pitch: 1.1,  rate: 1.08, lang: 'en-GB' },
    'ron':                { gender: 'm', pitch: 1.1,  rate: 1.08, lang: 'en-GB' },
    'draco malfoy':       { gender: 'm', pitch: 0.92, rate: 0.94, lang: 'en-GB' },
    'draco':              { gender: 'm', pitch: 0.92, rate: 0.94, lang: 'en-GB' },
    'severus snape':      { gender: 'm', pitch: 0.6,  rate: 0.82, lang: 'en-GB' },
    'snape':              { gender: 'm', pitch: 0.6,  rate: 0.82, lang: 'en-GB' },
    'albus dumbledore':   { gender: 'm', pitch: 0.75, rate: 0.85, lang: 'en-GB' },
    'dumbledore':         { gender: 'm', pitch: 0.75, rate: 0.85, lang: 'en-GB' },
    'minerva mcgonagall': { gender: 'f', pitch: 0.95, rate: 0.95, lang: 'en-GB' },
    'mcgonagall':         { gender: 'f', pitch: 0.95, rate: 0.95, lang: 'en-GB' },
    'rubeus hagrid':      { gender: 'm', pitch: 0.6,  rate: 0.88, lang: 'en-GB' },
    'hagrid':             { gender: 'm', pitch: 0.6,  rate: 0.88, lang: 'en-GB' },
    'luna lovegood':      { gender: 'f', pitch: 1.25, rate: 0.88, lang: 'en-GB' },
    'luna':               { gender: 'f', pitch: 1.25, rate: 0.88, lang: 'en-GB' },
    'voldemort':          { gender: 'm', pitch: 0.5,  rate: 0.78, lang: 'en-GB' },
    'lord voldemort':     { gender: 'm', pitch: 0.5,  rate: 0.78, lang: 'en-GB' },
    'dobby':              { gender: 'm', pitch: 1.45, rate: 1.15, lang: 'en-GB' },
    'sirius black':       { gender: 'm', pitch: 0.85, rate: 0.98, lang: 'en-GB' },
    'sirius':             { gender: 'm', pitch: 0.85, rate: 0.98, lang: 'en-GB' },
    'remus lupin':        { gender: 'm', pitch: 0.9,  rate: 0.95, lang: 'en-GB' },
    'lupin':              { gender: 'm', pitch: 0.9,  rate: 0.95, lang: 'en-GB' },

    // Marvel Cast
    'tony stark':         { gender: 'm', pitch: 1.0,  rate: 1.12, lang: 'en-US' },
    'iron man':           { gender: 'm', pitch: 1.0,  rate: 1.12, lang: 'en-US' },
    'bruce banner':       { gender: 'm', pitch: 0.9,  rate: 0.95, lang: 'en-US' },
    'hulk':               { gender: 'm', pitch: 0.5,  rate: 0.82, lang: 'en-US' },
    'thor odinson':       { gender: 'm', pitch: 0.68, rate: 0.88, lang: 'en-GB' },
    'thor':               { gender: 'm', pitch: 0.68, rate: 0.88, lang: 'en-GB' },
    'black widow':        { gender: 'f', pitch: 0.95, rate: 1.0,  lang: 'en-US' },
    'natasha romanoff':   { gender: 'f', pitch: 0.95, rate: 1.0,  lang: 'en-US' },
    'natasha':            { gender: 'f', pitch: 0.95, rate: 1.0,  lang: 'en-US' },
    'spider-man':         { gender: 'm', pitch: 1.2,  rate: 1.15, lang: 'en-US' },
    'peter parker':       { gender: 'm', pitch: 1.2,  rate: 1.15, lang: 'en-US' },
    'captain america':    { gender: 'm', pitch: 0.9,  rate: 0.97, lang: 'en-US' },
    'steve rogers':       { gender: 'm', pitch: 0.9,  rate: 0.97, lang: 'en-US' },
    'loki':               { gender: 'm', pitch: 0.85, rate: 0.95, lang: 'en-GB' },
    'thanos':             { gender: 'm', pitch: 0.48, rate: 0.78, lang: 'en-US' },
    'nick fury':          { gender: 'm', pitch: 0.75, rate: 0.95, lang: 'en-US' },
    'jarvis':             { gender: 'm', pitch: 1.05, rate: 1.05, lang: 'en-GB' },
    'doctor strange':     { gender: 'm', pitch: 0.85, rate: 0.95, lang: 'en-US' },
    'dr. strange':        { gender: 'm', pitch: 0.85, rate: 0.95, lang: 'en-US' },
    'wanda maximoff':     { gender: 'f', pitch: 1.05, rate: 0.98, lang: 'en-US' },
    'scarlet witch':      { gender: 'f', pitch: 1.05, rate: 0.98, lang: 'en-US' },
    'black panther':      { gender: 'm', pitch: 0.8,  rate: 0.95, lang: 'en-US' },
    't\'challa':          { gender: 'm', pitch: 0.8,  rate: 0.95, lang: 'en-US' },
    'captain marvel':     { gender: 'f', pitch: 1.05, rate: 1.05, lang: 'en-US' },

    // Space
    'captain nova':       { gender: 'm', pitch: 0.9,  rate: 1.0,  lang: 'en-US' },
    'astra (ai)':         { gender: 'f', pitch: 1.35, rate: 1.05, lang: 'en-US' },
    'dr. vega':           { gender: 'f', pitch: 1.05, rate: 1.0,  lang: 'en-US' },
    'bolt':               { gender: 'm', pitch: 1.25, rate: 1.12, lang: 'en-US' },

    // Anime
    'kai':                { gender: 'm', pitch: 1.05, rate: 1.08, lang: 'en-US' },
    'aiko':               { gender: 'f', pitch: 1.3,  rate: 1.1,  lang: 'en-US' },
    'riku':               { gender: 'm', pitch: 1.2,  rate: 1.12, lang: 'en-US' },
    'master ren':         { gender: 'm', pitch: 0.75, rate: 0.85, lang: 'en-US' },

    // Pirates
    'captain redbeard':   { gender: 'm', pitch: 0.7,  rate: 0.92, lang: 'en-GB' },
    'finn':               { gender: 'm', pitch: 1.1,  rate: 1.05, lang: 'en-GB' },
    'boomer':             { gender: 'm', pitch: 1.2,  rate: 1.1,  lang: 'en-GB' },
    'navigator pearl':    { gender: 'f', pitch: 1.05, rate: 1.0,  lang: 'en-GB' },

    // Mythology
    'shiva':              { gender: 'm', pitch: 0.85, rate: 0.80, lang: 'en-IN' },
    'lord shiva':         { gender: 'm', pitch: 0.85, rate: 0.80, lang: 'en-IN' },
    'mahadev':            { gender: 'm', pitch: 0.85, rate: 0.80, lang: 'en-IN' },
    'vishnu':             { gender: 'm', pitch: 0.98, rate: 1.06, lang: 'en-IN' },
    'lord vishnu':        { gender: 'm', pitch: 0.98, rate: 1.06, lang: 'en-IN' },
    'narayan':            { gender: 'm', pitch: 0.98, rate: 1.06, lang: 'en-IN' },
    'the asura':          { gender: 'm', pitch: 1.0,  rate: 1.14, lang: 'en-IN' },
    'asura':              { gender: 'm', pitch: 1.0,  rate: 1.14, lang: 'en-IN' },
    'bhasmasura':         { gender: 'm', pitch: 1.0,  rate: 1.14, lang: 'en-IN' },
    'hanuman':            { gender: 'm', pitch: 0.92, rate: 1.02, lang: 'en-IN' },
    'lord hanuman':       { gender: 'm', pitch: 0.92, rate: 1.02, lang: 'en-IN' },
    'krishna':            { gender: 'm', pitch: 0.96, rate: 1.04, lang: 'en-IN' },
    'lord krishna':       { gender: 'm', pitch: 0.96, rate: 1.04, lang: 'en-IN' },
    'ganesha':            { gender: 'm', pitch: 0.98, rate: 1.02, lang: 'en-IN' },
    'lord ganesha':       { gender: 'm', pitch: 0.98, rate: 1.02, lang: 'en-IN' },
    'narada':             { gender: 'm', pitch: 1.0,  rate: 1.10, lang: 'en-IN' },
    'sage narada':        { gender: 'm', pitch: 1.0,  rate: 1.10, lang: 'en-IN' },
    'lakshmi':            { gender: 'f', pitch: 1.0,  rate: 0.95, lang: 'en-IN' },
    'parvati':            { gender: 'f', pitch: 1.0,  rate: 0.95, lang: 'en-IN' },
    'durga':              { gender: 'f', pitch: 0.95, rate: 0.95, lang: 'en-IN' },
    'maa durga':          { gender: 'f', pitch: 0.95, rate: 0.95, lang: 'en-IN' },
    'saraswati':          { gender: 'f', pitch: 1.0,  rate: 0.93, lang: 'en-IN' },
    'sita':               { gender: 'f', pitch: 1.0,  rate: 0.95, lang: 'en-IN' },
  };

  const QUIZ_PHRASES = {
    harrypotter: {
      correct: [
        "Hurray! Well done! 10 points to your House!",
        "Brilliant answer! Absolutely spot on!",
        "Hurray! Accio knowledge! Perfectly answered!",
        "Fantastic spellwork! Well done!"
      ],
      incorrect: [
        "Oh no! A minor miscast spell, but keep going!",
        "Oops! Don't worry, even Dumbledore makes mistakes!",
        "Oh no! Close one, let's learn from this misstep!"
      ]
    },
    marvel: {
      correct: [
        "Hurray! Well done! Avengers level intellect!",
        "Bullseye! Outstanding job, hero!",
        "Hurray! JARVIS confirms 100 percent accuracy!",
        "Brilliant move! You nailed it!"
      ],
      incorrect: [
        "Oh no! We took a hit, but heroes adapt and conquer!",
        "Oops! Back to the Stark lab for another attempt!",
        "Oh no! A slight tactical miss, stay sharp!"
      ]
    },
    default: {
      correct: [
        "Hurray! Well done! Outstanding answer!",
        "Fantastic job! You got it right!",
        "Hurray! Perfect choice! Spot on!",
        "Awesome! Well done!"
      ],
      incorrect: [
        "Oh no! Not quite right, but great effort!",
        "Oops! Don't worry, let's learn from this!",
        "Oh no! Almost had it! Try again!"
      ]
    }
  };

  const GENERIC_TOKENS = new Set([
    'the', 'captain', 'master', 'navigator', 'dr', 'dr.', 'doctor', 'professor',
    'lord', 'lady', 'king', 'queen', 'sir', 'ai', '(ai)', 'mr', 'mr.', 'mrs', 'mrs.'
  ]);

  const FEMALE_NAME_HINTS = [
    'hermione', 'ginny', 'luna', 'mcgonagall', 'widow', 'natasha', 'wanda', 'carol',
    'astra', 'vega', 'aiko', 'pearl', 'lakshmi', 'parvati', 'durga', 'saraswati', 'sita',
    'draupadi', 'queen', 'lady', 'princess', 'mother', 'goddess', 'grandma', 'sister'
  ];

  const UNIVERSE_LANG = { harrypotter: 'en-GB', pirates: 'en-GB', mythology: 'en-IN' };

  const ROLE_TWEAK = {
    narrator: { pitch: 0,    rate: -0.05 },
    rival:    { pitch: -0.12, rate: -0.05 },
    comic:    { pitch:  0.12, rate:  0.08 },
    ally:     { pitch:  0,    rate:  0 },
    learner:  { pitch:  0,    rate:  0 },
  };

  const FEMALE_VOICE_RX = /\bfemale\b|zira|samantha|hazel|susan|heera|aria|jenny|libby|sonia|natasha|karen|moira|tessa|fiona|victoria|serena|kate|neerja|michelle|emma|ava|allison|catherine|google us english/i;
  const MALE_VOICE_RX = /\bmale\b|david|mark|george|ravi|guy|ryan|daniel|\balex\b|fred|james|oliver|thomas|arthur|prabhat|christopher|eric|roger|brian|andrew/i;

  /* ---------------- Voice selection ---------------- */

  function clamp(val, min, max) {
    const n = Number(val);
    if (isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function refreshVoices() {
    if (!SUPPORTED || !synth) return;
    try { synth.getVoices(); } catch (_) {}
  }

  function voiceGender(v) {
    const n = v.name || '';
    if (FEMALE_VOICE_RX.test(n)) return 'f';
    if (MALE_VOICE_RX.test(n)) return 'm';
    return '';
  }

  function pickVoice(lang, gender) {
    if (!SUPPORTED || !synth) return null;
    const voiceList = synth.getVoices() || [];
    if (!voiceList.length) return null;

    const wantLang = (lang || 'en-US').toLowerCase();
    const base = wantLang.slice(0, 2);
    let best = null;
    let bestScore = -Infinity;

    for (const v of voiceList) {
      const vl = (v.lang || '').replace('_', '-').toLowerCase();
      const vn = (v.name || '').toLowerCase();

      let score = 0;
      if (vl === wantLang) score += 10;
      else if (vl.startsWith(base)) score += 5;
      else if (vl.startsWith('en')) score += 2;
      else score += 0.5;

      const vg = voiceGender(v);
      if (gender && vg === gender) score += 4;
      else if (gender && vg && vg !== gender) score -= 4;

      if (/neural|natural|online|google|microsoft|apple/i.test(vn)) score += 2;
      if (wantLang === 'en-gb' && /uk|britain|british|george|hazel|susan|daniel|oliver/i.test(vn)) score += 3;
      if (wantLang === 'en-us' && /us|united states|david|zira|mark|samantha|alex|aria/i.test(vn)) score += 3;
      if (wantLang === 'en-in' && /india|hindi|heera|ravi|neerja|prabhat|veena|kalpana|kavya|rishi|aditi|ananya|en-in|en_in/i.test(vn)) score += 8;
      if (v.default) score += 0.5;

      if (score > bestScore) { best = v; bestScore = score; }
    }

    if (!best && voiceList.length > 0) {
      best = voiceList.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voiceList[0];
    }

    return best;
  }

  function tokens(s) {
    return s.toLowerCase().split(/[\s-]+/).filter(t => t && !GENERIC_TOKENS.has(t));
  }

  function findProfile(name) {
    const key = (name || '').toLowerCase().trim();
    if (!key) return null;
    if (PROFILES[key]) return PROFILES[key];

    for (const k of Object.keys(PROFILES)) {
      if (key.includes(k) || (key.length >= 3 && k.includes(key))) return PROFILES[k];
    }

    const keyTokens = tokens(key).filter(t => t.length > 2);
    for (const k of Object.keys(PROFILES)) {
      if (tokens(k).some(t => t.length > 2 && keyTokens.includes(t))) return PROFILES[k];
    }
    return null;
  }

  function guessGender(name) {
    const n = (name || '').toLowerCase();
    return FEMALE_NAME_HINTS.some(h => n.includes(h)) ? 'f' : 'm';
  }

  function unknownProfile(name) {
    let h = 0;
    for (const ch of String(name || 'x')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return { gender: guessGender(name), pitch: 0.85 + (h % 8) * 0.05, rate: 0.95 + (h % 5) * 0.03 };
  }

  function currentUniverse() {
    try { return (typeof AppState !== 'undefined' && AppState.currentUniverse) || 'harrypotter'; }
    catch (_) { return 'harrypotter'; }
  }

  function getNarratorName() {
    const uni = currentUniverse();
    const names = {
      harrypotter: 'Hogwarts Narrator',
      marvel: 'MCU Narrator',
      space: 'Cosmic Narrator',
      anime: 'Chronicle Narrator',
      pirates: 'Captain Storyteller',
      mythology: 'Sutra Narrator'
    };
    return names[uni] || 'Narrator';
  }

  function getUniverseMentor(universeKey) {
    const uni = universeKey || currentUniverse();
    const MENTORS = {
      harrypotter: {
        name: 'Albus Dumbledore',
        title: "Dumbledore's Wisdom",
        explanationTitle: "Dumbledore's Explanation",
        summaryTitle: "Dumbledore's Key Concept",
        icon: '🧙‍♂️',
        buttonText: 'Hear Dumbledore',
        profileKey: 'albus dumbledore'
      },
      marvel: {
        name: 'Nick Fury',
        title: "Fury's Strategic Intel",
        explanationTitle: "Nick Fury's Explanation",
        summaryTitle: "Nick Fury's Key Concept",
        icon: '🕶️',
        buttonText: 'Hear Nick Fury',
        profileKey: 'nick fury'
      },
      space: {
        name: 'Captain Nova',
        title: "Captain Nova's Log",
        explanationTitle: "Captain Nova's Explanation",
        summaryTitle: "Captain Nova's Key Concept",
        icon: '🚀',
        buttonText: 'Hear Captain Nova',
        profileKey: 'captain nova'
      },
      anime: {
        name: 'Master Ren',
        title: "Master Ren's Scroll",
        explanationTitle: "Master Ren's Explanation",
        summaryTitle: "Master Ren's Key Concept",
        icon: '🥋',
        buttonText: 'Hear Master Ren',
        profileKey: 'master ren'
      },
      mythology: {
        name: 'Sage Narada',
        title: "Sage Narada's Sutra",
        explanationTitle: "Sage Narada's Explanation",
        summaryTitle: "Sage Narada's Key Concept",
        icon: '🔱',
        buttonText: 'Hear Sage Narada',
        profileKey: 'narada'
      },
      pirates: {
        name: 'Captain Redbeard',
        title: "Redbeard's Log",
        explanationTitle: "Captain Redbeard's Explanation",
        summaryTitle: "Redbeard's Key Concept",
        icon: '🏴‍☠️',
        buttonText: 'Hear Redbeard',
        profileKey: 'captain redbeard'
      }
    };
    return MENTORS[uni] || MENTORS.harrypotter;
  }

  function profileFor(speaker, role) {
    const spkKey = (speaker || '').toLowerCase().trim();
    const mentor = getUniverseMentor(currentUniverse());
    const mentorNameLower = mentor.name.toLowerCase();

    let prof = null;
    let baseLang = UNIVERSE_LANG[currentUniverse()] || 'en-US';

    if (role === 'dumbledore' || role === 'concept' || role === 'mentor' || spkKey.includes('dumbledore') || spkKey.includes(mentorNameLower) || spkKey.includes('key concept')) {
      const profKey = mentor.profileKey || 'albus dumbledore';
      prof = PROFILES[profKey] || PROFILES['albus dumbledore'] || { gender: 'm', pitch: 0.85, rate: 0.85, lang: 'en-GB' };
    } else if (role === 'narrator' || !speaker || spkKey === 'narrator' || spkKey.includes('narrator')) {
      const uniKey = 'narrator-' + currentUniverse();
      prof = PROFILES[uniKey] || PROFILES['narrator'] || { gender: 'm', pitch: 0.9, rate: 0.94, lang: baseLang };
    } else {
      const known = role === 'learner' ? null : findProfile(speaker);
      const base = role === 'learner'
        ? { pitch: 1.0, rate: 1.0, lang: baseLang }
        : (known || unknownProfile(speaker));
      const tweak = known ? { pitch: 0, rate: 0 } : (ROLE_TWEAK[role] || { pitch: 0, rate: 0 });
      prof = {
        gender: base.gender || (role === 'learner' ? '' : guessGender(speaker)),
        pitch: (base.pitch || 1.0) + tweak.pitch,
        rate: (base.rate || 1.0) + tweak.rate,
        lang: base.lang || baseLang
      };
    }

    const lang = prof.lang || baseLang;
    const voice = pickVoice(lang, prof.gender);

    const safePitch = clamp(prof.pitch, 0.8, 1.0);
    const safeRate = clamp(prof.rate, 0.75, 1.25);

    return {
      lang,
      voice,
      pitch: safePitch,
      rate: safeRate,
      gender: prof.gender
    };
  }

  /* ---------------- Emotional Expression Engine (All Universes) ---------------- */

  function detectSentenceEmotion(text, speakerName, role) {
    const t = String(text || '').toLowerCase();
    const s = String(speakerName || '').toLowerCase();

    let pitchMod = 0;
    let rateMod = 0;
    let volMod = 1.0;

    // --- CHARACTER BASELINE EMOTIONAL SIGNATURES (ALL 6 UNIVERSES) ---
    // 1. Hindu Mythology
    if (s.includes('shiva') || s.includes('mahadev')) {
      pitchMod = -0.04; rateMod = -0.08; // Serene, calm, meditative
    } else if (s.includes('vishnu') || s.includes('narayan')) {
      pitchMod = 0.04; rateMod = 0.04; // Teasing, smiling, clever
    } else if (s.includes('asura') || s.includes('bhasmasura')) {
      pitchMod = 0.06; rateMod = 0.09; // Mischievous, funny, innocent
    } else if (s.includes('hanuman') || s.includes('narada')) {
      pitchMod = 0.05; rateMod = 0.08; // Energetic, devoted, lively

    // 2. Harry Potter
    } else if (s.includes('hermione') || s.includes('mcgonagall')) {
      pitchMod = 0.06; rateMod = 0.08; // Intellectual, rapid, sharp
    } else if (s.includes('dumbledore') || s.includes('lupin')) {
      pitchMod = -0.03; rateMod = -0.06; // Wise, warm, gentle
    } else if (s.includes('ron') || s.includes('dobby')) {
      pitchMod = 0.08; rateMod = 0.10; // Excitable, panicked, high-strung
    } else if (s.includes('snape') || s.includes('voldemort') || s.includes('malfoy')) {
      pitchMod = -0.06; rateMod = -0.10; // Dark, ominous, sneering
    } else if (s.includes('hagrid')) {
      pitchMod = -0.05; rateMod = -0.04; // Warm, booming, jolly

    // 3. Marvel MCU
    } else if (s.includes('tony stark') || s.includes('iron man') || s.includes('spider-man')) {
      pitchMod = 0.06; rateMod = 0.10; // Snarky, witty, high-energy
    } else if (s.includes('nick fury') || s.includes('black widow') || s.includes('captain america')) {
      pitchMod = -0.03; rateMod = 0.02; // Tactical, composed, authoritative
    } else if (s.includes('thor') || s.includes('hulk') || s.includes('thanos')) {
      pitchMod = -0.06; rateMod = -0.04; // Booming, powerful, heavy
    } else if (s.includes('loki')) {
      pitchMod = 0.04; rateMod = 0.06; // Mischievous, sly, theatrical

    // 4. Space Exploration
    } else if (s.includes('captain nova') || s.includes('dr. vega')) {
      pitchMod = -0.02; rateMod = 0.02; // Crisp, scientific commander
    } else if (s.includes('astra') || s.includes('bolt')) {
      pitchMod = 0.08; rateMod = 0.08; // Bright AI / hyperactive scout

    // 5. Anime / Martial Arts
    } else if (s.includes('master ren')) {
      pitchMod = -0.05; rateMod = -0.08; // Calm sensei, focused
    } else if (s.includes('kai') || s.includes('aiko')) {
      pitchMod = 0.06; rateMod = 0.09; // Passionate, heroic, enthusiastic

    // 6. Pirates
    } else if (s.includes('captain redbeard') || s.includes('boomer')) {
      pitchMod = -0.04; rateMod = 0.04; // Boisterous pirate captain
    } else if (s.includes('finn') || s.includes('pearl')) {
      pitchMod = 0.05; rateMod = 0.06; // Spirited deckhand & clever navigator
    }

    // --- DYNAMIC PER-SENTENCE SENTIMENT CLASSIFICATION ---
    const isShouting = /[A-Z]{3,}/.test(text) || t.includes('!!') || t.includes('how dare') || t.includes('charge');
    const isExclaim = t.includes('!') || t.includes('hurray') || t.includes('aha') || t.includes('wow') || t.includes('eureka');
    const isMischief = /hehe|haha|naughty|trick|cheeky|giggle|playful|curious|tease|chuckle|boomer|loki|gullible|snicker|winks|smirk/.test(t);
    const isSadness = /alas|sob|grief|lost|sigh|broken|mourn|pity|sad|unfortunate|ruin|oh no|disaster|doom|\.\.\./.test(t);
    const isAnger = /fury|rage|curse|destroy|foolish|fool|strike|wrath|attack|shut up|begone|silence|threat|blast/.test(t) || isShouting;
    const isFear = /scared|help|trapped|run|danger|panic|beware|horrible|flee|hide|watch out/.test(t);
    const isHappiness = /wonderful|brilliant|victory|joy|delight|glee|fantastic|yay|awesome|superb|well done|hooray|hail/.test(t) || (isExclaim && !isAnger && !isFear);

    if (isAnger) {
      pitchMod -= 0.04;
      rateMod += 0.08;
      volMod = 1.0;
    } else if (isFear) {
      pitchMod += 0.07;
      rateMod += 0.10;
      volMod = 0.96;
    } else if (isSadness) {
      pitchMod -= 0.07;
      rateMod -= 0.12;
      volMod = 0.92;
    } else if (isHappiness) {
      pitchMod += 0.06;
      rateMod += 0.07;
      volMod = 1.0;
    } else if (isMischief) {
      pitchMod += 0.07;
      rateMod += 0.08;
      volMod = 1.0;
    }

    return { pitchMod, rateMod, volMod };
  }

  /* ---------------- Text preparation ---------------- */

  function cleanText(t) {
    if (!t) return '';
    let text = String(t);

    // Convert stage action directions into natural spoken emotional interjections
    text = text
      .replace(/[\*\[\(]\s*(?:laughs?|giggles?|chuckles?|snickers?|smirks?|winks?|mischievous(?:ly)?)\s*[\*\]\)]/gi, ' Hehe! ')
      .replace(/[\*\[\(]\s*(?:sighs?|groans?|mourns?|sobs?)\s*[\*\]\)]/gi, ' Ah... ')
      .replace(/[\*\[\(]\s*(?:gasps?|shocks?|surprised?|startled?)\s*[\*\]\)]/gi, ' Oh! ')
      .replace(/[\*\[\(]\s*(?:cheers?|shouts?|yells?|roars?|triumphant)\s*[\*\]\)]/gi, ' Hurray! ')
      .replace(/[\*\[\(]\s*(?:whispers?|murmurs?)\s*[\*\]\)]/gi, ' ')
      .replace(/\*[^*]{1,60}\*/g, ' ')
      .replace(/\[[^\]]{1,60}\]/g, ' ')
      .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\uFE0F\u200D]/gu, '')
      .replace(/[_#~`>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  }

  function chunkText(text) {
    if (!text) return [];
    if (text.length <= MAX_CHUNK) return [text];

    const sentences = text.match(/[^.!?…]+[.!?…]+["')\]]*\s*|[^.!?…]+$/g) || [text];
    const out = [];
    let buf = '';
    for (const s of sentences) {
      if (buf && (buf + s).length > MAX_CHUNK) { out.push(buf.trim()); buf = s; }
      else buf += s;
    }
    if (buf.trim()) out.push(buf.trim());

    return out.flatMap(s => s.length <= MAX_CHUNK * 1.5
      ? [s]
      : (s.match(new RegExp(`.{1,${MAX_CHUNK}}(\\s|$)`, 'g')) || [s]).map(x => x.trim()).filter(Boolean));
  }

  /* ---------------- Playback ---------------- */

  let runId = 0;
  let queue = [];
  let activeItem = null;
  let sceneItems = [];

  function playItems(items, delay = START_DELAY_MS) {
    if (!SUPPORTED || !items.length) return;
    stop();
    const id = runId;
    queue = items.slice();
    setTimeout(() => playNext(id), delay);
  }

  function playNext(id) {
    if (id !== runId) return;

    const item = queue.shift();
    if (!item) { endPlayback(); return; }
    if (item.el && !item.el.isConnected) { playNext(id); return; }

    const chunks = chunkText(cleanText(item.text));
    if (!chunks.length) { playNext(id); return; }

    const prof = profileFor(item.speaker, item.role);
    setActive(item);

    let i = 0;
    const speakChunk = () => {
      if (id !== runId) return;
      if (i >= chunks.length) {
        clearActive(item);
        setTimeout(() => playNext(id), queue.length ? GAP_BETWEEN_LINES_MS : 0);
        return;
      }

      if (synth && synth.paused) {
        try { synth.resume(); } catch (_) {}
      }

      const text = chunks[i++];
      const emotion = detectSentenceEmotion(text, item.speaker, item.role);
      const u = new SpeechSynthesisUtterance(text);

      const liveVoice = pickVoice(prof.lang, prof.gender) || prof.voice;
      if (liveVoice) {
        u.voice = liveVoice;
        u.lang = liveVoice.lang || prof.lang || 'en-US';
      } else {
        u.lang = prof.lang || 'en-US';
      }

      // Apply base profile pitch & rate combined with dynamic emotional modulation!
      const targetPitch = (prof.pitch || 1.0) + emotion.pitchMod;
      const targetRate = (prof.rate || 1.0) + emotion.rateMod;

      u.pitch = clamp(targetPitch, 0.8, 1.0);
      u.rate = clamp(targetRate, 0.75, 1.25);
      u.volume = emotion.volMod;

      let done = false;
      const watchdog = setTimeout(finish, (text.length / (10 * (targetRate || 1))) * 1000 + 5000);
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(watchdog);
        speakChunk();
      }
      u.onend = finish;
      u.onerror = (err) => {
        console.warn("[VoiceEngine] Utterance error:", err);
        finish();
      };

      try {
        synth.speak(u);
      } catch (err) {
        console.warn("[VoiceEngine] speak failed:", err);
        finish();
      }
    };

    speakChunk();
  }

  function skip() {
    if (!SUPPORTED || !activeItem) return;
    runId++;
    const id = runId;
    synth.cancel();
    clearActive(activeItem);
    if (queue.length) setTimeout(() => playNext(id), START_DELAY_MS);
    else endPlayback();
  }

  function stop() {
    runId++;
    queue = [];
    if (SUPPORTED && (synth.speaking || synth.pending)) synth.cancel();
    if (activeItem) clearActive(activeItem);
    endPlayback();
  }

  function endPlayback() {
    activeItem = null;
    hideChip();
  }

  function playScene() {
    playItems(sceneItems.filter(i => i.el && i.el.isConnected));
  }

  /* ---------------- Direct Speech & Quiz Feedback ---------------- */

  function speakNarration(text) {
    if (!SUPPORTED || !text) return;
    const item = {
      speaker: getNarratorName(),
      text,
      avatar: '🎙️',
      role: 'narrator',
      el: null,
      btn: null
    };
    playItems([item], 50);
  }

  function speakKeyConcept(text, uniKey) {
    if (!SUPPORTED || !text) return;
    const mentor = getUniverseMentor(uniKey || currentUniverse());
    const item = {
      speaker: mentor.name,
      text: `Key Concept. ${cleanText(text)}`,
      avatar: mentor.icon,
      role: 'concept',
      el: null,
      btn: null
    };
    playItems([item], 50);
  }

  function speakQuizFeedback(isCorrect, feedbackText, targetEl) {
    if (isCorrect) {
      triggerSparkle(targetEl);
    } else {
      triggerFirecrackers(targetEl);
    }

    if (!SUPPORTED) return;

    const uni = currentUniverse();
    const set = QUIZ_PHRASES[uni] || QUIZ_PHRASES.default;
    const pool = isCorrect ? set.correct : set.incorrect;
    const cheerPhrase = pool[Math.floor(Math.random() * pool.length)];

    let fullSpeech = cheerPhrase;
    if (feedbackText && typeof feedbackText === 'string') {
      const cleanFb = cleanText(feedbackText);
      if (cleanFb) {
        fullSpeech += `. ${cleanFb}`;
      }
    }

    const item = {
      speaker: isCorrect ? '🌟 Success' : '⚡ Feedback',
      text: fullSpeech,
      avatar: isCorrect ? '🎉' : '💡',
      role: 'narrator',
      el: null,
      btn: null
    };

    playItems([item], 50);
  }

  /* ---------------- UI: active line, sprite, chip ---------------- */

  function setActive(item) {
    activeItem = item;
    if (item.el) item.el.classList.add('is-voicing');
    if (item.btn) {
      item.btn.classList.add('is-playing');
      item.btn.textContent = '⏹';
      item.btn.setAttribute('aria-label', 'Stop voice');
      item.btn.title = 'Stop';
    }
    setSpriteVoicing(item, true);
    showChip(item);
  }

  function clearActive(item) {
    if (!item) return;
    if (item.el) item.el.classList.remove('is-voicing');
    if (item.btn) {
      item.btn.classList.remove('is-playing');
      item.btn.textContent = item.avatar || (item.role === 'dumbledore' || item.role === 'concept' ? '💡' : (item.role === 'narrator' ? '🎙️' : '🔊'));
      item.btn.setAttribute('aria-label', `Hear ${item.speaker || 'this line'}`);
      item.btn.title = 'Play this line';
    }
    setSpriteVoicing(item, false);
    if (activeItem === item) activeItem = null;
  }

  function setSpriteVoicing(item, on) {
    const cast = document.getElementById('charactersDisplay');
    if (!cast) return;
    if (!on) {
      cast.querySelectorAll('.character-sprite.is-voicing').forEach(s => s.classList.remove('is-voicing'));
      return;
    }
    let sprite = null;
    if (item.role === 'learner') {
      sprite = cast.querySelector('.sprite-learner');
    } else {
      const who = (item.speaker || '').toLowerCase();
      sprite = Array.from(cast.querySelectorAll('.sprite-npc')).find(s => {
        const n = (s.dataset.name || '').toLowerCase();
        return n && who && (n.includes(who) || who.includes(n));
      });
    }
    if (sprite) sprite.classList.add('is-voicing');
  }

  let chipEl = null;

  function ensureChip() {
    const arena = document.getElementById('stageArena');
    if (chipEl && chipEl.isConnected && (!arena || arena.contains(chipEl))) return chipEl;

    chipEl = document.createElement('div');
    chipEl.className = 'voice-now-chip';
    chipEl.id = 'voiceNowChip';
    chipEl.setAttribute('role', 'group');
    chipEl.setAttribute('aria-label', 'Now speaking');
    chipEl.innerHTML = `
      <span class="voice-now-avatar" aria-hidden="true"></span>
      <span class="voice-now-name"></span>
      <span class="voice-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <button type="button" class="voice-now-btn voice-now-skip" id="voiceSkipBtn" aria-label="Skip to next line" title="Skip">⏭</button>
      <button type="button" class="voice-now-btn voice-now-stop" id="voiceStopBtn" aria-label="Stop voices" title="Stop">⏹</button>
    `;
    chipEl.querySelector('.voice-now-skip').addEventListener('click', skip);
    chipEl.querySelector('.voice-now-stop').addEventListener('click', stop);

    if (arena) arena.appendChild(chipEl);
    else { chipEl.classList.add('is-floating'); document.body.appendChild(chipEl); }
    return chipEl;
  }

  function showChip(item) {
    const chip = ensureChip();
    chip.querySelector('.voice-now-avatar').textContent = item.avatar || '🔊';
    chip.querySelector('.voice-now-name').textContent = item.speaker || getNarratorName();
    chip.querySelector('.voice-now-skip').hidden = queue.length === 0;
    chip.classList.add('is-open');
    const arena = document.getElementById('stageArena');
    if (arena) arena.classList.add('voice-active');
  }

  function hideChip() {
    if (chipEl) chipEl.classList.remove('is-open');
    const arena = document.getElementById('stageArena');
    if (arena) arena.classList.remove('voice-active');
  }

  /* ---------------- Scene integration ---------------- */

  function attachToScene(container) {
    stop();
    sceneItems = [];
    if (!SUPPORTED || !container) return;

    // Attach to dialogue, narration, action, and concept beats
    container.querySelectorAll('.story-beat').forEach(el => {
      const isDialogue = el.classList.contains('story-beat--dialogue');
      const isNarration = el.classList.contains('story-beat--narration');
      const isAction = el.classList.contains('story-beat--action');
      const isDiscovery = el.classList.contains('story-beat--discovery') || el.classList.contains('story-beat--concept');

      if (isDialogue) {
        const nameEl = el.querySelector('.beat-speaker-name');
        const textEl = el.querySelector('.beat-dialogue-content');
        const avatarEl = el.querySelector('.beat-speaker-avatar');
        const roleMatch = el.className.match(/story-beat--(learner|rival|comic|ally)\b/);

        const item = {
          el,
          speaker: nameEl ? nameEl.textContent.trim() : '',
          text: textEl ? textEl.textContent : '',
          avatar: avatarEl ? avatarEl.textContent.trim() : '🔊',
          role: roleMatch ? roleMatch[1] : 'ally',
          btn: null,
        };
        if (!cleanText(item.text)) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'voice-line-btn';
        btn.textContent = '🔊';
        btn.title = 'Play this line';
        btn.setAttribute('aria-label', `Hear ${item.speaker || 'this line'}`);
        btn.addEventListener('click', e => {
          e.stopPropagation();
          if (activeItem === item) stop();
          else playItems([item]);
        });
        item.btn = btn;

        (el.querySelector('.beat-header-row') || el).appendChild(btn);
        sceneItems.push(item);
      } else if (isDiscovery) {
        const textEl = el.querySelector('.beat-concept-text') || el.querySelector('.beat-action-body') || el;
        const mentor = getUniverseMentor(currentUniverse());
        const item = {
          el,
          speaker: mentor.name,
          text: textEl ? textEl.textContent : '',
          avatar: mentor.icon,
          role: 'concept',
          btn: null,
        };
        if (!cleanText(item.text)) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'voice-line-btn voice-concept-btn';
        btn.textContent = mentor.icon;
        btn.title = `Hear ${mentor.name} speak this key concept`;
        btn.setAttribute('aria-label', `Hear ${mentor.name} speak this key concept`);
        btn.addEventListener('click', e => {
          e.stopPropagation();
          if (activeItem === item) stop();
          else playItems([item]);
        });
        item.btn = btn;

        el.appendChild(btn);
        sceneItems.push(item);
      } else if (isNarration || isAction) {
        const textEl = el.querySelector('.beat-narration-text') || el.querySelector('.beat-action-body') || el;
        const item = {
          el,
          speaker: getNarratorName(),
          text: textEl ? textEl.textContent : '',
          avatar: '📜',
          role: 'narrator',
          btn: null,
        };
        if (!cleanText(item.text)) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'voice-line-btn voice-narration-btn';
        btn.textContent = '🎙️';
        btn.title = 'Hear narration';
        btn.setAttribute('aria-label', 'Hear narration text');
        btn.addEventListener('click', e => {
          e.stopPropagation();
          if (activeItem === item) stop();
          else playItems([item]);
        });
        item.btn = btn;

        el.appendChild(btn);
        sceneItems.push(item);
      }
    });

    if (!sceneItems.length) return;
    if (settings.autoplay) playItems(sceneItems, AUTOPLAY_DELAY_MS);
    else maybeShowHint();
  }

  /* ---------------- Header toggle + one-time hint ---------------- */

  let hintEl = null;
  let hintTimer = null;

  function renderToggle() {
    const btn = document.getElementById('voiceToggleBtn');
    if (!btn) return;
    const on = !!settings.autoplay;
    btn.setAttribute('aria-pressed', String(on));
    btn.title = on ? 'Auto-voices on — narration & characters read aloud' : 'Auto-voices off — tap 🔊 or 🎙️ to hear';
    const icon = btn.querySelector('.voice-toggle-icon');
    const label = btn.querySelector('.voice-toggle-label');
    if (icon) icon.textContent = on ? '🔊' : '🔇';
    if (label) label.textContent = on ? 'Voices On' : 'Voices Off';
  }

  function setAutoplay(on) {
    settings.autoplay = !!on;
    settings.hintSeen = true;
    saveSettings();
    renderToggle();
    hideHint();
    if (on) {
      if (typeof showToast === 'function') showToast('🔊 Narration and characters will now speak aloud');
      playScene();
    } else {
      stop();
      if (typeof showToast === 'function') showToast('🔇 Voices off — tap 🔊 or 🎙️ on any line to hear it');
    }
  }

  function maybeShowHint() {
    if (settings.hintSeen || settings.autoplay) return;
    const control = document.getElementById('voiceControl');
    if (!control) return;

    settings.hintSeen = true;
    saveSettings();

    if (!hintEl) {
      hintEl = document.createElement('div');
      hintEl.className = 'voice-hint';
      hintEl.id = 'voiceHint';
      hintEl.setAttribute('role', 'dialog');
      hintEl.setAttribute('aria-label', 'Character voices tip');
      hintEl.innerHTML = `
        <p class="voice-hint-text"><strong>🎙️ Narration & Voices active!</strong><br>
        Tap 🔊 or 🎙️ on any line to hear it, or turn on auto-voices.</p>
        <div class="voice-hint-actions">
          <button type="button" class="voice-hint-btn" id="voiceHintLaterBtn">Not now</button>
          <button type="button" class="voice-hint-btn voice-hint-btn--primary" id="voiceHintOnBtn">Turn on</button>
        </div>
      `;
      hintEl.querySelector('#voiceHintLaterBtn').addEventListener('click', hideHint);
      hintEl.querySelector('#voiceHintOnBtn').addEventListener('click', () => setAutoplay(true));
      control.appendChild(hintEl);
    }

    setTimeout(() => {
      if (!hintEl) return;
      hintEl.classList.add('is-open');
      clearTimeout(hintTimer);
      hintTimer = setTimeout(hideHint, HINT_AUTO_HIDE_MS);
    }, 1200);
  }

  function hideHint() {
    clearTimeout(hintTimer);
    if (hintEl) hintEl.classList.remove('is-open');
  }

  /* ---------------- Global safety stops ---------------- */

  function init() {
    const control = document.getElementById('voiceControl');
    if (!SUPPORTED) {
      if (control) control.hidden = true;
      return;
    }

    refreshVoices();
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refreshVoices);
    else synth.onvoiceschanged = refreshVoices;

    synth.cancel();

    document.addEventListener('click', () => {
      if (synth && synth.paused) {
        try { synth.resume(); } catch (_) {}
      }
    }, { capture: true, passive: true });

    const btn = document.getElementById('voiceToggleBtn');
    if (btn) btn.addEventListener('click', () => setAutoplay(!settings.autoplay));
    renderToggle();

    // Auto attach to any story beats present on page load
    const beatsFlow = document.getElementById('storyBeatsFlow');
    if (beatsFlow && beatsFlow.children.length > 0) {
      attachToScene(beatsFlow);
    }

    document.addEventListener('stateChange', () => { stop(); hideHint(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    window.addEventListener('pagehide', stop);
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (activeItem || queue.length) stop();
      hideHint();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* ---------------- Web Audio SFX & Procedural Ambient Soundscapes ---------------- */

  let audioCtx = null;
  let ambientGainNode = null;
  let ambientNodes = [];
  let ambientEnabled = false;

  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function stopAmbient() {
    ambientNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (_) {} });
    ambientNodes = [];
  }

  function startAmbient(themeKey) {
    // Disabled per user preference
    stopAmbient();
  }

  function toggleAmbient() {
    ambientEnabled = false;
    stopAmbient();
  }

  function updateAmbientUI() {}

  /* Short synthesized UI sound effects (Web Audio, no assets needed).
     Types used by the app: 'choice', 'ability', 'correct', 'wrong', 'badge'. */
  const SFX_PATTERNS = {
    choice:  [{ f: 520, d: 0.07, t: 'sine' }, { f: 700, d: 0.09, t: 'sine' }],
    ability: [{ f: 400, d: 0.08, t: 'triangle' }, { f: 600, d: 0.08, t: 'triangle' }, { f: 900, d: 0.14, t: 'triangle' }],
    correct: [{ f: 523, d: 0.10, t: 'sine' }, { f: 659, d: 0.10, t: 'sine' }, { f: 784, d: 0.18, t: 'sine' }],
    wrong:   [{ f: 220, d: 0.14, t: 'sawtooth' }, { f: 165, d: 0.22, t: 'sawtooth' }],
    badge:   [{ f: 659, d: 0.09, t: 'triangle' }, { f: 784, d: 0.09, t: 'triangle' }, { f: 988, d: 0.09, t: 'triangle' }, { f: 1319, d: 0.22, t: 'triangle' }]
  };

  function playSfx(type) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const notes = SFX_PATTERNS[type] || SFX_PATTERNS.choice;
      let when = ctx.currentTime;
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = n.t;
        osc.frequency.setValueAtTime(n.f, when);
        gain.gain.setValueAtTime(0.0001, when);
        gain.gain.exponentialRampToValueAtTime(0.12, when + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(when);
        osc.stop(when + n.d + 0.02);
        when += n.d * 0.9;
      });
    } catch (_) { /* audio blocked or unsupported — SFX are optional */ }
  }

  window.VoiceEngine = {
    isSupported: SUPPORTED,
    attachToScene,
    playScene,
    speakNarration,
    speakKeyConcept,
    speakQuizFeedback,
    stop,
    skip,
    setAutoplay,
    playSfx,
    startAmbient,
    stopAmbient,
    toggleAmbient,
    triggerSparkle
  };
})();

