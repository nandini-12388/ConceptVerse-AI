// =========================================================
// ConceptVerse 2.0 — Application Navigation System
// Handles screen switching, UI interactions, and state management
// =========================================================

console.log("ConceptVerse Navigation System Loaded");

// Basic functionality test
console.log("Testing basic functionality...");
console.log("AppState available:", typeof AppState !== 'undefined');
console.log("Navigation states available:", AppState.NAVIGATION_STATES);
console.log("Universe themes available:", Object.keys(AppState.universeThemes));

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  try {
    // Initialize starfield background
    buildStarfield();

    // 3D galaxy background (first page only)
    if (typeof window.GalaxyRenderer !== 'undefined' && !window.galaxyEngine) {
      window.galaxyEngine = new window.GalaxyRenderer('galaxyCanvas');
    }
    
    // Set initial state
    AppState.setState(AppState.NAVIGATION_STATES.UNIVERSE_SELECTION);
    
    // Initialize all screen handlers
    initializeUniverseSelection();
    initializeCharacterCreation();
    initializeMissionSelection();
    initializeCinematicAdventure();
    initializeCharacterChallenge();
    initializeConceptUnlocked();
    initializeLearnInDetail();
    initializeHub();
    initializeCodexModal();
    
    // Listen for state changes
    document.addEventListener('stateChange', handleStateChange);
    
    // Show initial screen
    showScreen('universeSelectionScreen');
    
    console.log("ConceptVerse app initialized successfully");
  } catch (error) {
    console.error("Error initializing app:", error);
  }
}

function getUniverseMentor(universeKey) {
  const uni = universeKey || (typeof AppState !== 'undefined' && AppState.currentUniverse) || 'harrypotter';
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
      summaryTitle: "Captain Redbeard's Key Concept",
      icon: '🏴‍☠️',
      buttonText: 'Hear Redbeard',
      profileKey: 'captain redbeard'
    }
  };
  return MENTORS[uni] || MENTORS.harrypotter;
}

function handleStateChange(event) {
  const newState = event.detail.state;
  console.log("State changed to:", newState);

  // Toggle viewport-lock for the cinematic adventure screen
  document.body.classList.toggle('adventure-mode', newState === 'CINEMATIC_ADVENTURE');

  // Map state to screen ID
  const screenMap = {
    'UNIVERSE_SELECTION': 'universeSelectionScreen',
    'CHARACTER_CREATION': 'characterCreationScreen',
    'MISSION_SELECTION': 'missionSelectionScreen',
    'CINEMATIC_ADVENTURE': 'cinematicAdventureScreen',
    'CHARACTER_CHALLENGE': 'characterChallengeScreen',
    'CONCEPT_UNLOCKED': 'conceptUnlockedScreen',
    'LEARN_IN_DETAIL': 'learnInDetailScreen',
    'HUB': 'hubScreen'
  };

  const screenId = screenMap[newState];
  if (screenId) {
    showScreen(screenId);
  }

  // 3D galaxy background is shown on the first page only
  const galaxyCanvas = document.getElementById('galaxyCanvas');
  if (galaxyCanvas) {
    galaxyCanvas.classList.toggle('is-hidden', newState !== 'UNIVERSE_SELECTION');
  }

  if (newState === 'CHARACTER_CREATION') { initializeCharacterOptions(); renderSavedCharacters(); }
  if (newState === 'MISSION_SELECTION') { updateCharacterInfoBar(); renderCuratedMissionCards(); }
  if (newState === 'CINEMATIC_ADVENTURE' && window.VoiceEngine && typeof window.VoiceEngine.startAmbient === 'function') {
    window.VoiceEngine.startAmbient(AppState.currentUniverse);
  }
  if (newState === 'CONCEPT_UNLOCKED') populateConceptUnlocked(AppState.currentSession.conceptData);
  if (newState === 'HUB') updateHubDisplay();
}

function updateNextButtonState() {
  // Legacy stub from multi-step wizard - single-screen creation needs no step-button state
}

function showScreen(screenId) {
  console.log("Showing screen:", screenId);
  
  // Hide all screens
  const allScreens = document.querySelectorAll('.screen');
  allScreens.forEach(screen => {
    screen.classList.remove('active-screen');
    screen.classList.add('hidden-screen');
  });

  // Always reset scroll on window, document, and container so screens always appear at top without scrolling
  window.scrollTo(0, 0);
  if (document.body) document.body.scrollTop = 0;
  if (document.documentElement) document.documentElement.scrollTop = 0;
  const page = document.querySelector('.page');
  if (page) page.scrollTop = 0;
  
  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden-screen');
    targetScreen.scrollTop = 0;
    // Small delay for animation
    setTimeout(() => {
      targetScreen.classList.add('active-screen');
      window.scrollTo(0, 0);
    }, 50);
  } else {
    console.error("Screen not found:", screenId);
  }
}

/* =========================================================
   Starfield Background (Preserved from original)
   ========================================================= */

function buildStarfield() {
  const field = document.getElementById("starfield");
  if (!field) return;

  const STAR_COUNT = 70;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("span");
    star.className = "star";

    const size = Math.random() * 1.6 + 0.6;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDuration = `${2 + Math.random() * 4}s`;
    star.style.animationDelay = `${Math.random() * 4}s`;

    fragment.appendChild(star);
  }

  field.appendChild(fragment);
}

/* =========================================================
   HTML Escape Helper
   ========================================================= */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =========================================================
   Universe Selection Screen
   ========================================================= */

function initializeUniverseSelection() {
  const universePortalsGrid = document.getElementById('universePortalsGrid');
  if (!universePortalsGrid) {
    console.error("Universe portals grid not found");
    return;
  }

  console.log("Initializing universe selection...");

  // Universe data
  const universes = [
    {
      key: 'harrypotter',
      name: 'Harry Potter',
      icon: '🧙‍♂️',
      description: 'Magical lessons through spells and potions'
    },
    {
      key: 'marvel',
      name: 'Marvel',
      icon: '⚡',
      description: 'Heroic adventures with powers and physics'
    },
    {
      key: 'anime',
      name: 'Anime',
      icon: '⚔️',
      description: 'Epic training arcs and power-ups'
    },
    {
      key: 'space',
      name: 'Space',
      icon: '🚀',
      description: 'Cosmic exploration at stellar scale'
    },
    {
      key: 'pirates',
      name: 'Pirates',
      icon: '🏴‍☠️',
      description: 'Treasure maps and buried logic'
    },
    {
      key: 'mythology',
      name: 'Hindu Mythology',
      icon: '🕉️',
      description: 'Sacred epics, celestial astras, and cosmic balance'
    }
  ];

  // Generate universe portals
  universes.forEach(universe => {
    const portal = document.createElement('div');
    portal.className = 'universe-portal glass';
    portal.setAttribute('data-universe', universe.key);
    
    portal.innerHTML = `
      <span class="universe-portal-icon">${universe.icon}</span>
      <h3 class="universe-portal-name">${universe.name}</h3>
      <p class="universe-portal-description">${universe.description}</p>
    `;
    
    portal.addEventListener('click', () => {
      console.log("Universe portal clicked:", universe.key);
      selectUniverse(universe.key);
    });
    
    universePortalsGrid.appendChild(portal);
  });
  
  console.log("Universe selection initialized with", universes.length, "universes");
}

function selectUniverse(universeKey) {
  console.log("Universe selected:", universeKey);
  
  // Reset character data when switching universes
  AppState.resetCharacter();
  
  // Set universe in state
  AppState.setUniverse(universeKey);
  
  // Update character creation badge
  const creationUniverseBadge = document.getElementById('creationUniverseBadge');
  if (creationUniverseBadge) {
    const universeName = AppState.universeThemes[universeKey]?.name || universeKey;
    const universeIcons = {
      harrypotter: '🧙‍♂️',
      marvel: '⚡',
      anime: '⚔️',
      space: '🚀',
      pirates: '🏴‍☠️',
      mythology: '🕉️'
    };
    const icon = universeIcons[universeKey] || '🌌';
    creationUniverseBadge.textContent = `${icon} ${universeName} Universe`;
  }
  
  // Apply visual transition
  const universeBackground = document.getElementById('universeBackground');
  if (universeBackground) {
    universeBackground.className = `universe-background active universe-${universeKey}`;
  }

  if (window.UniverseBgEngine) {
    window.UniverseBgEngine.setUniverse(universeKey);
  }
  
  // Navigate to character creation
  setTimeout(() => {
    AppState.navigateTo(AppState.NAVIGATION_STATES.CHARACTER_CREATION);
  }, 800);
}

/* =========================================================
   Character Creation Screen — Compact Single-Screen Engine
   ========================================================= */

function initializeCharacterCreation() {
  const backToUniverseBtn = document.getElementById('backToUniverseBtn');
  const createCharacterBtn = document.getElementById('createCharacterBtn');
  const characterNameInput = document.getElementById('characterName');

  // Back to universe selection button
  if (backToUniverseBtn) {
    backToUniverseBtn.onclick = () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.UNIVERSE_SELECTION);
    };
  }

  // Primary Action Button: CREATE CHARACTER & CONTINUE -> goes directly to Mission Selection
  if (createCharacterBtn) {
    createCharacterBtn.onclick = () => {
      if (validateCharacter()) {
        // Persist the character so it can be reused next time
        if (typeof CharacterStore !== 'undefined') {
          CharacterStore.save(AppState.character);
        }
        AppState.navigateTo(AppState.NAVIGATION_STATES.MISSION_SELECTION);
      }
    };
  }

  // Character Name input listener
  if (characterNameInput) {
    characterNameInput.oninput = (e) => {
      AppState.character.name = e.target.value.trim();
      updateCharacterPreview();
    };
  }

  // Initialize options for current universe
  initializeCharacterOptions();
}

/* =========================================================
   Saved Character Reuse — localStorage strip
   ========================================================= */

function renderSavedCharacters() {
  const strip = document.getElementById('savedCharactersStrip');
  if (!strip || typeof CharacterStore === 'undefined') return;
  const uni = AppState.currentUniverse;
  const saved = uni ? CharacterStore.all(uni) : [];

  strip.classList.toggle('hidden-element', saved.length === 0);
  if (!saved.length) return;

  strip.innerHTML = `
    <span class="saved-strip-label">YOUR CHARACTERS</span>
    <div class="saved-characters-row">${saved.map(rec => `
      <button type="button" class="saved-char-card" data-id="${rec.id}"
              title="Load ${escapeHtml(rec.name)}">
        <span class="saved-mini">${escapeHtml(rec.appearance?.avatar || '🧙‍♂️')}</span>
        <span class="saved-name">${escapeHtml(rec.name)}</span>
      </button>`).join('')}
    </div>`;

  strip.querySelectorAll('.saved-char-card').forEach(card => {
    card.addEventListener('click', () => {
      const rec = saved.find(r => r.id === card.dataset.id);
      if (rec) loadSavedCharacter(rec);
    });
  });
}

function loadSavedCharacter(rec) {
  if (!rec) return;
  AppState.updateCharacter({
    universe: rec.universe,
    name: rec.name,
    appearance: rec.appearance || {},
    power: rec.power || '',
    weapon: rec.weapon || '',
    role: rec.role || '',
    personality: rec.personality || [],
    universeSpecific: rec.universeSpecific || {}
  });

  // Restore progress into this universe's dedicated storage
  if (typeof AppState.getUniverseProgress === 'function') {
    const uProg = AppState.getUniverseProgress(rec.universe);
    if (rec.points !== undefined) uProg.points = rec.points;
    if (rec.badges !== undefined) uProg.badges = Array.isArray(rec.badges) ? [...rec.badges] : [];
    if (rec.learnedConcepts !== undefined) uProg.learnedConcepts = Array.isArray(rec.learnedConcepts) ? [...rec.learnedConcepts] : [];
    if (rec.adventureHistory !== undefined) uProg.adventureHistory = Array.isArray(rec.adventureHistory) ? [...rec.adventureHistory] : [];
    AppState.saveUniverseProgress();
    AppState.syncUserProgress();
  } else {
    if (rec.points !== undefined) AppState.userProgress.points = rec.points;
    if (rec.badges !== undefined) AppState.userProgress.badges = Array.isArray(rec.badges) ? [...rec.badges] : [];
    if (rec.learnedConcepts !== undefined) AppState.userProgress.learnedConcepts = Array.isArray(rec.learnedConcepts) ? [...rec.learnedConcepts] : [];
    if (rec.adventureHistory !== undefined) AppState.userProgress.adventureHistory = Array.isArray(rec.adventureHistory) ? [...rec.adventureHistory] : [];
  }

  // Sync name input
  const nameInput = document.getElementById('characterName');
  if (nameInput) nameInput.value = rec.name;

  // Helper: select buttons within a container by data-group or container id
  const syncGroup = (groupAttr, value, isMulti) => {
    const buttons = document.querySelectorAll(`[data-group="${groupAttr}"].option-btn, #${groupAttr}Options .option-btn`);
    if (!buttons.length) return;
    if (value && Array.isArray(value)) {
      buttons.forEach(btn => {
        btn.classList.toggle('selected', value.includes(btn.dataset.value));
      });
    } else if (value) {
      buttons.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.value === value);
      });
    }
  };

  syncGroup('power', rec.power, false);
  syncGroup('weapon', rec.weapon, false);
  syncGroup('role', rec.role, false);
  syncGroup('personality', rec.personality, true);
  // Appearance: avatar field
  const appearanceVal = rec.appearance?.avatar || rec.appearance?.bodyType || '';
  if (appearanceVal) {
    document.querySelectorAll('[data-group="appearance"].option-btn, #appearanceOptions .option-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === appearanceVal);
    });
  }

  // Fire the existing preview pipeline so the KEEP button's validation works
  updateCharacterPreview();
  showToast(`✅ Loaded ${rec.name}`);
}



// Compact lore-authentic options dataset (4 Powers, 4 Weapons, 4 Roles, 5 Personalities, 4 Appearances per universe)
const UNIVERSE_OPTIONS = {
  harrypotter: {
    categoryNames: {
      power: 'Magical Ability',
      weapon: 'Wizarding Tool',
      role: 'Wizarding Role',
      personality: 'Magical Trait'
    },
    categoryDescriptions: {
      power: 'Your magical specialization',
      weapon: 'Your primary wizarding artifact',
      role: 'Your role in Hogwarts',
      personality: 'Traits defining your magical nature'
    },
    customPlaceholders: {
      power: 'e.g. Wandless Telekinesis...',
      weapon: 'e.g. Phoenix Feather Wand...',
      role: 'e.g. Auror Explorer...',
      personality: 'e.g. Courageous...'
    },
    powers: [
      'Wandless Magic & Telekinesis',
      'Parseltongue (Snake Speaker)',
      'Animagus Transformation',
      'Occlumency (Mind Magic)'
    ],
    weapons: [
      'Phoenix Feather Wand (11" Holly)',
      'Dragon Heartstring Wand',
      'Invisibility Cloak',
      'Time-Turner Pendant'
    ],
    roles: [
      'Hogwarts Student',
      'Auror (Dark Wizard Hunter)',
      'Department of Mysteries Unspeakable',
      'Curse-Breaker Explorer'
    ],
    personalities: [
      'Brave & Gryffindor-Spirited',
      'Wise & Ravenclaw-Clever',
      'Ambitious & Slytherin-Cunning',
      'Loyal & Hufflepuff-Kind',
      'Mischievous Spellcaster'
    ],
    appearances: [
      { id: 'wiz-student', label: 'Hogwarts Student Robes', icon: '🧙‍♂️' },
      { id: 'auror-coat', label: 'Auror Leather Coat', icon: '🧥' },
      { id: 'unspeakable-cloak', label: 'Unspeakable Hooded Cloak', icon: '🔮' },
      { id: 'quidditch-gear', label: 'Quidditch Robes & Goggles', icon: '🧹' }
    ],
    universeSpecific: [
      {
        id: 'house',
        label: 'Hogwarts House',
        options: ['Gryffindor 🦁', 'Ravenclaw 🦅', 'Hufflepuff 🦡', 'Slytherin 🐍']
      },
      {
        id: 'wandWood',
        label: 'Wand Wood',
        options: ['Holly 🪵', 'Dragonwood 🐉', 'Elder 🔮']
      },
      {
        id: 'patronus',
        label: 'Patronus Form',
        options: ['Silver Stag 🦌', 'Otter 🦦', 'Phoenix 🐦‍🔥']
      }
    ]
  },
  marvel: {
    categoryNames: {
      power: 'Superpower',
      weapon: 'Hero Tech & Gear',
      role: 'Heroic Duty',
      personality: 'Heroic Disposition'
    },
    categoryDescriptions: {
      power: 'Your primary superhuman mutation',
      weapon: 'Your hero technology or armor',
      role: 'Your duty in the hero community',
      personality: 'Traits driving your heroics'
    },
    customPlaceholders: {
      power: 'e.g. Gamma Energy Blast...',
      weapon: 'e.g. Vibranium Shield...',
      role: 'e.g. Avengers Strike Leader...',
      personality: 'e.g. Genius Inventor...'
    },
    powers: [
      'Vibranium-Infused Super Strength',
      'Gamma Energy Blast & Resilience',
      'Eldritch Mystic Sorcery',
      'Spider-Sense & Wall-Crawling'
    ],
    weapons: [
      'Nanotech Iron Armor Suit',
      'Vibranium Shield',
      'Sling Ring & Mystic Cloak',
      'High-Tech Web-Shooters'
    ],
    roles: [
      'Avengers Strike Leader',
      'Mutant Rights Protector (X-Man)',
      'Street Vigilante Defender',
      'Master of Mystical Arts'
    ],
    personalities: [
      'Heroic & Self-Sacrificing',
      'Snarky & Quick-Witted',
      'Brilliant Inventor Mind',
      'Stoic & Unshakeable',
      'Relentless Protector'
    ],
    appearances: [
      { id: 'power-suit', label: 'High-Tech Power Suit', icon: '🦾' },
      { id: 'stealth-suit', label: 'Tactical Stealth Suit', icon: '🕶️' },
      { id: 'sorcerer-robes', label: 'Sorcerer Mystical Robes', icon: '🔮' },
      { id: 'armored-combat', label: 'Vibranium Battle Armor', icon: '🛡️' }
    ],
    universeSpecific: [
      {
        id: 'affiliation',
        label: 'Team Affiliation',
        options: ['Avengers 🛡️', 'X-Men 🧬', 'Guardians 🚀']
      },
      {
        id: 'origin',
        label: 'Origin Story',
        options: ['Mutant Mutation 🧬', 'Super Soldier Serum 🧪', 'Ancient Magic 🔮']
      },
      {
        id: 'base',
        label: 'Base of Operations',
        options: ['Avengers Tower 🏢', 'Sanctum Sanctorum 🏛️', 'X-Mansion 🏰']
      }
    ]
  },
  anime: {
    categoryNames: {
      power: 'Special Technique',
      weapon: 'Signature Armament',
      role: 'Adventurer Class',
      personality: 'Anime Archetype'
    },
    categoryDescriptions: {
      power: 'Your signature combat technique',
      weapon: 'Your forged weapon or relic',
      role: 'Your path in the adventure',
      personality: 'Traits defining your character'
    },
    customPlaceholders: {
      power: 'e.g. Spirit Ki Blast...',
      weapon: 'e.g. Demon-Slayer Katana...',
      role: 'e.g. Guild Captain...',
      personality: 'e.g. Hot-Blooded...'
    },
    powers: [
      'Spirit Aura & Ki Energy Blast',
      'Shadow Clone & Substitution',
      'Bankai Weapon Awakening',
      'Cursed Energy Domain'
    ],
    weapons: [
      'Demon-Slayer Katana Blade',
      'Magic Spell Grimoire',
      'Chakra Blade Daggers',
      'Dragon-Scale Buster Sword'
    ],
    roles: [
      'Shonen Protagonist Legend',
      'Guild Squad Captain',
      'Elite Ninja Operative',
      'Wandering Ronin Master'
    ],
    personalities: [
      'Hot-Blooded & Unyielding',
      'Calm & Analytical Genius',
      'Cheerful Endless Optimist',
      'Fiercely Loyal Friend',
      'Honor-Bound Warrior'
    ],
    appearances: [
      { id: 'martial-gi', label: 'Shonen Martial Gi', icon: '🥋' },
      { id: 'shinobi-cloak', label: 'Shinobi Cloak & Headband', icon: '🥷' },
      { id: 'knight-plate', label: 'Armored Knight Plate', icon: '🗡️' },
      { id: 'guild-cloak', label: 'Guild Adventurer Cloak', icon: '🎒' }
    ],
    universeSpecific: [
      {
        id: 'powerSystem',
        label: 'Power System',
        options: ['Ki Energy ⚡', 'Chakra 🍃', 'Cursed Energy 👁️']
      },
      {
        id: 'guild',
        label: 'Affiliated Faction',
        options: ['Demon Corps 🗡️', 'Hidden Village 🥷', 'Magic Knights 🛡️']
      },
      {
        id: 'combatStyle',
        label: 'Combat Style',
        options: ['Rushdown Offense 💥', 'Range Caster 🔮', 'Stealth Assassin 🗡️']
      }
    ]
  },
  space: {
    categoryNames: {
      power: 'Cyber / Void Augmentation',
      weapon: 'Sci-Fi Tech & Arms',
      role: 'Starship Crew Role',
      personality: 'Spacer Disposition'
    },
    categoryDescriptions: {
      power: 'Your cybernetic implant or power',
      weapon: 'Your futuristic weapon or device',
      role: 'Your duty aboard starships',
      personality: 'Traits forged in deep space'
    },
    customPlaceholders: {
      power: 'e.g. Quantum Phase Shift...',
      weapon: 'e.g. Plasma Rifle...',
      role: 'e.g. Starship Captain...',
      personality: 'e.g. Analytical...'
    },
    powers: [
      'Quantum Phase Shifting',
      'Starship Neural Interface',
      'Plasma Shield Generation',
      'Gravity Distortion Field'
    ],
    weapons: [
      'Heavy Plasma Assault Rifle',
      'Arc-Discharge Laser Pistol',
      'Omni-Tool Wrist-Blade',
      'Thermal Fusion Sword'
    ],
    roles: [
      'Starship Fleet Captain',
      'Chief Cyber Engineer',
      'Deep-Space Science Officer',
      'Orbital Marine Commando'
    ],
    personalities: [
      'Hyper-Analytical & Logical',
      'Fearless Deep-Space Pioneer',
      'Technical Genius Tinkerer',
      'Pragmatic Survivalist',
      'Calm Under Vacuum Pressure'
    ],
    appearances: [
      { id: 'flight-suit', label: 'Sealed Flight Suit', icon: '👨‍🚀' },
      { id: 'exo-armor', label: 'Exoskeleton Power Armor', icon: '🤖' },
      { id: 'command-uniform', label: 'Tactical Command Uniform', icon: '🎖️' },
      { id: 'cyber-jacket', label: 'Cybernetic Jacket', icon: '💻' }
    ],
    universeSpecific: [
      {
        id: 'shipClass',
        label: 'Starship Class',
        options: ['Dreadnought 🛰️', 'Stealth Cruiser 🛸', 'Deep Scout 🚀']
      },
      {
        id: 'homeSector',
        label: 'Home Sector',
        options: ['Sol Federation 🪐', 'Orion Colony 🌌', 'Andromeda Station 💫']
      },
      {
        id: 'specialization',
        label: 'Mission Spec',
        options: ['Quantum Physics ⚛️', 'Xenobiology 🧬', 'Cyber Warfare 💻']
      }
    ]
  },
  pirates: {
    categoryNames: {
      power: 'Maritime Mastery',
      weapon: 'Pirate Armament',
      role: 'Crew Position',
      personality: 'Pirate Temperament'
    },
    categoryDescriptions: {
      power: 'Your nautical skill or combat talent',
      weapon: 'Your weapon for sea battles',
      role: 'Your crew position',
      personality: 'Traits forged on the high seas'
    },
    customPlaceholders: {
      power: 'e.g. Sea-Storm Sense...',
      weapon: 'e.g. Cutlass...',
      role: 'e.g. Fleet Captain...',
      personality: 'e.g. Fearless...'
    },
    powers: [
      'Sea-Storm Weather Sense',
      'Kraken & Leviathan Call',
      'Celestial Star Navigation',
      'Master Cutlass Fencing'
    ],
    weapons: [
      'Curved Steel Cutlass',
      'Dual Flintlock Pistols',
      'Heavy Boarding Axe',
      'Swivel Deck Cannon'
    ],
    roles: [
      'Pirate Fleet Captain',
      'First Mate Quartermaster',
      'Master Ship Navigator',
      'Crow\'s Nest Scout'
    ],
    personalities: [
      'Bold & Fearless Swashbuckler',
      'Cunning & Calculating',
      'Fiercely Loyal to Crew',
      'Bound by Pirate Code',
      'Charismatic Sea Singer'
    ],
    appearances: [
      { id: 'captain-hat', label: 'Captain\'s Tricorn Hat', icon: '🏴‍☠️' },
      { id: 'officer-coat', label: 'Officer Longcoat', icon: '🧥' },
      { id: 'sailor-vest', label: 'Rigging Sailor Vest', icon: '⛵' },
      { id: 'cannoneer-apron', label: 'Cannoneer Leather Apron', icon: '🏴' }
    ],
    universeSpecific: [
      {
        id: 'shipType',
        label: 'Ship Type',
        options: ['Grand Galleon 🏴‍☠️', 'Swift Brigantine ⛵', 'Stealth Sloop ⚓']
      },
      {
        id: 'flagSymbol',
        label: 'Jolly Roger Flag',
        options: ['Skull & Crossbones ☠️', 'Kraken Tentacles 🦑', 'Golden Compass 🧭']
      },
      {
        id: 'territory',
        label: 'Sailing Territory',
        options: ['Caribbean Isles 🏝️', 'Devil\'s Triangle 🌀', 'Skeleton Coast ☠️']
      }
    ]
  },
  mythology: {
    categoryNames: {
      power: 'Divine Boon (Divya Shakti)',
      weapon: 'Sacred Astra (Divya Shastra)',
      role: 'Dharmic Squad Role',
      personality: 'Dharmic Disposition'
    },
    categoryDescriptions: {
      power: 'Your celestial blessing granted by the divine',
      weapon: 'Your consecrated astra or sacred weapon',
      role: 'Your combat or spiritual function in the squad',
      personality: 'Virtues governing your actions and Dharma'
    },
    customPlaceholders: {
      power: 'e.g. Rudra Tandava Radiance, Surya Tejas...',
      weapon: 'e.g. Gandiva Bow, Sudarshana Chakra, Trishula...',
      role: 'e.g. Maharathi Archer, Vedic Sage, Kshatriya Guardian...',
      personality: 'e.g. Unshakable Dharma, Meditative Calm...'
    },
    powers: [
      'Rudra Tandava Shakti (Cosmic Equilibrium of Mahadev)',
      'Sudarshana Chakra & Vision of Preservation',
      'Surya Tejas & Blazing Solar Radiance',
      'Vayu Vega & Storm Velocity of Hanuman',
      'Indra Vajra & Celestial Lightning',
      'Adi Shakti Kundalini Awakening'
    ],
    weapons: [
      'Trishula of Lord Shiva 🔱',
      'Sudarshana Chakra of Lord Vishnu ☸️',
      'Pinaka Divine Bow of Mahadev 🏹',
      'Vajra Gada of Lord Hanuman 🪨',
      'Brahmashira Supreme Astra ⚡',
      'Divine Venu Flute of Lord Krishna 🪈'
    ],
    roles: [
      'Maharathi Guardian (Master Celestial Champion)',
      'Devout Brahmarishi (Sage of Mantras & Tapasya)',
      'Dharmic Kshatriya Guardian',
      'Vanara Sena Warrior (Devoted Champion)',
      'Celestial Devata Envoy'
    ],
    personalities: [
      'Unwavering Dharma & Truth (Satya)',
      'Meditative Calm in Crisis (Samadhi)',
      'Fearless Righteous Valor (Veera)',
      'Boundless Bhakti & Devotion',
      'Deep Cosmic Wisdom & Humility',
      'Radiant Tapasya & Willpower'
    ],
    appearances: [
      { id: 'saffron-dhoti', label: 'Saffron Silk Dhoti & Angavastram', icon: '🧘' },
      { id: 'kavacha-armor', label: 'Golden Kavacha & Kundala Armor', icon: '🛡️' },
      { id: 'rudraksha-attire', label: 'Rudraksha Mala & Chandan Tilak', icon: '📿' },
      { id: 'royal-pagdi', label: 'Royal Kshatriya Robes & Pagdi', icon: '👑' }
    ],
    universeSpecific: [
      {
        id: 'ishtaDevata',
        label: 'Ishta Devata (Primary Devotion)',
        options: ['Lord Shiva (Mahadev) 🔱', 'Lord Vishnu (Narayan) 🪷', 'Maa Durga (Adi Shakti) 🌺', 'Lord Hanuman 🪨']
      },
      {
        id: 'sacredRealm',
        label: 'Sacred Realm (Loka)',
        options: ['Mount Kailash 🏔️', 'Vaikuntha Loka 🌌', 'Amaravati & Swarga Loka ⚡', 'Badrinath & Holy Mandakini 🌊']
      },
      {
        id: 'lineage',
        label: 'Vansha / Lineage',
        options: ['Suryavansha (Solar Dynasty) ☀️', 'Chandravansha (Lunar Dynasty) 🌙', 'Rishi Kula (Sage Gotra) 📿', 'Vanara Sena (Devoted Legion) 🐒']
      }
    ]
  }
};

function initializeCharacterOptions() {
  const universe = AppState.currentUniverse || 'harrypotter';
  console.log("Initializing character options for universe:", universe);
  
  const options = UNIVERSE_OPTIONS[universe] || UNIVERSE_OPTIONS.harrypotter;
  
  // Reset character state cleanly for the new universe
  clearCharacterSelections();
  
  // Update category labels, descriptions, and header
  updateCategoryLabels(options);
  updateCharacterCreationHeader(universe);
  
  // Initialize single-select groups (Power, Weapon, Role)
  initializeSingleSelectGroup('power', options.powers, 'customPowerBtn', 'customPowerInput', options.customPlaceholders.power);
  initializeSingleSelectGroup('weapon', options.weapons, 'customWeaponBtn', 'customWeaponInput', options.customPlaceholders.weapon);
  initializeSingleSelectGroup('role', options.roles, 'customRoleBtn', 'customRoleInput', options.customPlaceholders.role);
  
  // Initialize multi-select group (Personality)
  initializeMultiSelectGroup('personality', options.personalities, 'customPersonalityBtn', 'customPersonalityInput', options.customPlaceholders.personality);
  
  // Initialize appearance options
  initializeAppearanceOptions(options.appearances);
  
  // Initialize universe-specific attribute options
  initializeUniverseSpecificOptions(options.universeSpecific);
  
  // Render character preview
  updateCharacterPreview();
}

function clearCharacterSelections() {
  // Clear and hide all custom text inputs
  ['customPowerInput', 'customWeaponInput', 'customRoleInput', 'customPersonalityInput'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.value = '';
      input.classList.add('hidden-element');
    }
  });

  // Clear custom button selection state
  const customBtns = document.querySelectorAll('.custom-option-btn');
  customBtns.forEach(btn => btn.classList.remove('selected'));

  // Clear predefined button selections
  const allOptions = document.querySelectorAll('.option-btn');
  allOptions.forEach(btn => btn.classList.remove('selected'));

  // Clear character name input
  const characterNameInput = document.getElementById('characterName');
  if (characterNameInput) {
    characterNameInput.value = '';
  }

  // Reset AppState character data cleanly
  AppState.resetCharacter();
}

function updateCategoryLabels(options) {
  const powerLabel = document.getElementById('powerLabel');
  const weaponLabel = document.getElementById('weaponLabel');
  const roleLabel = document.getElementById('roleLabel');
  const personalityLabel = document.getElementById('personalityLabel');
  
  if (powerLabel) powerLabel.innerHTML = `${options.categoryNames.power} <span class="required-indicator">*</span>`;
  if (weaponLabel) weaponLabel.innerHTML = `${options.categoryNames.weapon} <span class="required-indicator">*</span>`;
  if (roleLabel) roleLabel.innerHTML = `${options.categoryNames.role} <span class="required-indicator">*</span>`;
  if (personalityLabel) personalityLabel.innerHTML = `${options.categoryNames.personality} <span class="required-indicator">*</span>`;
  
  const powerDescription = document.getElementById('powerDescription');
  const weaponDescription = document.getElementById('weaponDescription');
  const roleDescription = document.getElementById('roleDescription');
  const personalityDescription = document.getElementById('personalityDescription');
  
  if (powerDescription) powerDescription.textContent = options.categoryDescriptions.power;
  if (weaponDescription) weaponDescription.textContent = options.categoryDescriptions.weapon;
  if (roleDescription) roleDescription.textContent = options.categoryDescriptions.role;
  if (personalityDescription) personalityDescription.textContent = options.categoryDescriptions.personality;

  // Sidebar labels
  const sumPowerLabel = document.getElementById('sumPowerLabel');
  const sumWeaponLabel = document.getElementById('sumWeaponLabel');
  const sumRoleLabel = document.getElementById('sumRoleLabel');
  const sumPersonalityLabel = document.getElementById('sumPersonalityLabel');

  if (sumPowerLabel) sumPowerLabel.textContent = `${options.categoryNames.power}:`;
  if (sumWeaponLabel) sumWeaponLabel.textContent = `${options.categoryNames.weapon}:`;
  if (sumRoleLabel) sumRoleLabel.textContent = `${options.categoryNames.role}:`;
  if (sumPersonalityLabel) sumPersonalityLabel.textContent = `${options.categoryNames.personality}:`;
}

function updateCharacterCreationHeader(universe) {
  const title = document.getElementById('characterCreationTitle');
  const subtitle = document.getElementById('characterCreationSubtitle');
  
  const universeNames = {
    harrypotter: 'Create Your Wizard',
    marvel: 'Create Your Hero',
    anime: 'Create Your Adventurer',
    space: 'Create Your Spacer',
    pirates: 'Create Your Pirate',
    mythology: 'Create Your Dharmic Hero'
  };
  
  const universeSubtitles = {
    harrypotter: 'Step into the wizarding world. Define your magical identity.',
    marvel: 'Join the heroes. Define your superhuman potential.',
    anime: 'Enter the adventure. Define your anime character destiny.',
    space: 'Journey among the stars. Define your spacefaring identity.',
    pirates: 'Sail the high seas. Define your pirate legend.',
    mythology: 'Walk among legends of the epics. Fulfill your sacred destiny.'
  };
  
  if (title) title.textContent = universeNames[universe] || 'Create Your Character';
  if (subtitle) subtitle.textContent = universeSubtitles[universe] || 'Step into the universe. Define who you become.';
}

function initializeSingleSelectGroup(groupName, predefinedOptions, customBtnId, customInputId, customPlaceholder) {
  const container = document.getElementById(`${groupName}Options`);
  const customBtn = document.getElementById(customBtnId);
  const customInput = document.getElementById(customInputId);
  
  if (!container || !customBtn || !customInput) return;
  
  container.innerHTML = '';
  if (customPlaceholder) customInput.placeholder = customPlaceholder;

  predefinedOptions.forEach(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.setAttribute('data-value', option);
    btn.setAttribute('data-group', groupName);
    
    btn.onclick = () => {
      // Deselect all options in group including custom button
      const allBtns = container.querySelectorAll('.option-btn');
      allBtns.forEach(b => b.classList.remove('selected'));
      customBtn.classList.remove('selected');
      customInput.classList.add('hidden-element');
      customInput.value = '';

      // Select clicked option
      btn.classList.add('selected');
      AppState.character[groupName] = option;
      updateCharacterPreview();
      updateNextButtonState();
    };
    
    container.appendChild(btn);
  });
  
  // Clean event handlers for custom button and input
  customBtn.onclick = () => {
    const allBtns = container.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.classList.remove('selected'));
    
    customBtn.classList.toggle('selected');
    if (customBtn.classList.contains('selected')) {
      customInput.classList.remove('hidden-element');
      customInput.focus();
      AppState.character[groupName] = customInput.value.trim();
    } else {
      customInput.classList.add('hidden-element');
      customInput.value = '';
      AppState.character[groupName] = '';
    }
    updateCharacterPreview();
    updateNextButtonState();
  };
  
  customInput.oninput = (e) => {
    AppState.character[groupName] = e.target.value.trim();
    updateCharacterPreview();
    updateNextButtonState();
  };
}

function initializeMultiSelectGroup(groupName, predefinedOptions, customBtnId, customInputId, customPlaceholder) {
  const container = document.getElementById(`${groupName}Options`);
  const customBtn = document.getElementById(customBtnId);
  const customInput = document.getElementById(customInputId);
  
  if (!container || !customBtn || !customInput) return;
  
  container.innerHTML = '';
  if (customPlaceholder) customInput.placeholder = customPlaceholder;

  if (!Array.isArray(AppState.character[groupName])) {
    AppState.character[groupName] = [];
  }
  
  predefinedOptions.forEach(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.setAttribute('data-value', option);
    btn.setAttribute('data-group', groupName);
    
    btn.onclick = () => {
      const currentList = AppState.character[groupName] || [];
      if (btn.classList.contains('selected')) {
        btn.classList.remove('selected');
        AppState.character[groupName] = currentList.filter(item => item !== option);
      } else {
        btn.classList.add('selected');
        if (!currentList.includes(option)) {
          AppState.character[groupName] = [...currentList, option];
        }
      }
      updateCharacterPreview();
      updateNextButtonState();
    };
    
    container.appendChild(btn);
  });
  
  customBtn.onclick = () => {
    customInput.classList.toggle('hidden-element');
    if (!customInput.classList.contains('hidden-element')) {
      customInput.focus();
    }
  };
  
  customInput.onkeyup = (e) => {
    if (e.key === 'Enter') {
      const trait = customInput.value.trim();
      if (trait) {
        addCustomPersonality(trait, customInput);
        customInput.value = '';
      }
    }
  };
}

function addCustomPersonality(trait, customInput) {
  if (!trait || trait.trim() === '') return;
  const currentList = AppState.character.personality || [];
  
  if (!currentList.includes(trait)) {
    AppState.character.personality = [...currentList, trait];
    
    const container = document.getElementById('personalityOptions');
    if (container) {
      const customTag = document.createElement('button');
      customTag.type = 'button';
      customTag.className = 'option-btn selected';
      customTag.textContent = `✨ ${trait}`;
      customTag.setAttribute('data-value', trait);
      customTag.style.borderStyle = 'dashed';
      
      customTag.onclick = () => {
        customTag.classList.toggle('selected');
        const updated = AppState.character.personality || [];
        if (customTag.classList.contains('selected')) {
          if (!updated.includes(trait)) AppState.character.personality = [...updated, trait];
        } else {
          AppState.character.personality = updated.filter(t => t !== trait);
        }
        updateCharacterPreview();
        updateNextButtonState();
      };
      
      container.appendChild(customTag);
    }
    
    updateCharacterPreview();
    updateNextButtonState();
    showToast(`Added custom trait: "${trait}"`);
  }
  
  customInput.classList.add('hidden-element');
}

function initializeAppearanceOptions(appearances) {
  const appearanceOptions = document.getElementById('appearanceOptions');
  if (!appearanceOptions) return;
  
  appearanceOptions.innerHTML = '';
  const options = appearances || [];
  
  options.forEach(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.setAttribute('data-appearance', option.id);
    btn.innerHTML = `${option.icon} ${option.label}`;
    
    btn.onclick = () => {
      document.querySelectorAll('#appearanceOptions .option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      AppState.character.appearance = { id: option.id, type: option.label, icon: option.icon };
      updateCharacterPreview();
      updateNextButtonState();
    };
    
    appearanceOptions.appendChild(btn);
  });
}

function initializeUniverseSpecificOptions(attributeGroups) {
  const universeSpecificOptions = document.getElementById('universeSpecificOptions');
  if (!universeSpecificOptions) return;
  
  universeSpecificOptions.innerHTML = '';
  const groups = attributeGroups || [];
  
  groups.forEach(group => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'universe-attribute-group';
    groupDiv.style.marginBottom = '12px';
    
    const labelP = document.createElement('p');
    labelP.style.cssText = 'margin: 0 0 6px; font-size: 0.9em; font-weight: 600; opacity: 0.9;';
    labelP.textContent = group.label;
    groupDiv.appendChild(labelP);
    
    const chipsDiv = document.createElement('div');
    chipsDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px;';
    
    group.options.forEach(opt => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'option-btn';
      chip.textContent = opt;
      chip.style.padding = '6px 12px';
      chip.style.fontSize = '0.85em';
      
      chip.onclick = () => {
        const allChips = chipsDiv.querySelectorAll('.option-btn');
        allChips.forEach(c => c.classList.remove('selected'));
        
        chip.classList.add('selected');
        if (!AppState.character.universeSpecific) {
          AppState.character.universeSpecific = {};
        }
        AppState.character.universeSpecific[group.id] = opt;
        updateCharacterPreview();
        updateNextButtonState();
      };
      
      chipsDiv.appendChild(chip);
    });
    
    groupDiv.appendChild(chipsDiv);
    universeSpecificOptions.appendChild(groupDiv);
  });
}

function validateCharacter() {
  const universe = AppState.currentUniverse || 'harrypotter';
  const options = UNIVERSE_OPTIONS[universe] || UNIVERSE_OPTIONS.harrypotter;

  if (!AppState.character.name || AppState.character.name.trim() === '') {
    showToast('Please enter a character name');
    const input = document.getElementById('characterName');
    if (input) input.focus();
    return false;
  }
  
  if (!AppState.character.power || AppState.character.power.trim() === '') {
    showToast(`Please select a ${options.categoryNames.power}`);
    return false;
  }
  
  if (!AppState.character.weapon || AppState.character.weapon.trim() === '') {
    showToast(`Please select a ${options.categoryNames.weapon}`);
    return false;
  }
  
  if (!AppState.character.role || AppState.character.role.trim() === '') {
    showToast(`Please select a ${options.categoryNames.role}`);
    return false;
  }
  
  if (!AppState.character.personality || AppState.character.personality.length === 0) {
    showToast(`Please select at least one ${options.categoryNames.personality}`);
    return false;
  }
  
  return true;
}

function updateCharacterPreview() {
  const previewName = document.getElementById('previewName');
  const previewDetails = document.getElementById('previewDetails');
  const previewAvatar = document.getElementById('previewAvatar');
  
  const universe = AppState.currentUniverse || 'harrypotter';
  const universeName = AppState.universeThemes[universe]?.name || 'Unknown';
  const options = UNIVERSE_OPTIONS[universe] || UNIVERSE_OPTIONS.harrypotter;

  const defaultIcons = {
    harrypotter: '🧙‍♂️',
    marvel: '⚡',
    anime: '⚔️',
    space: '🚀',
    pirates: '🏴‍☠️',
    mythology: '🏛️'
  };
  const icon = AppState.character.appearance?.icon || defaultIcons[universe] || '👤';

  if (previewAvatar) previewAvatar.textContent = icon;
  
  const charName = AppState.character.name || 'Unnamed Hero';
  if (previewName) previewName.textContent = charName;

  if (previewDetails) {
    const power = AppState.character.power || '<em>Not selected</em>';
    const weapon = AppState.character.weapon || '<em>Not selected</em>';
    const role = AppState.character.role || '<em>Not selected</em>';
    const personalities = AppState.character.personality?.length > 0 
      ? AppState.character.personality.join(', ') 
      : '<em>None selected</em>';
    const appearance = AppState.character.appearance?.type || '<em>Not selected</em>';

    let specificHtml = '';
    if (AppState.character.universeSpecific && Object.keys(AppState.character.universeSpecific).length > 0) {
      const entries = Object.entries(AppState.character.universeSpecific)
        .filter(([_, v]) => v)
        .map(([k, v]) => {
          const groupDef = options.universeSpecific?.find(g => g.id === k);
          const label = groupDef ? groupDef.label : k;
          return `<li><strong>${label}:</strong> ${v}</li>`;
        });
      if (entries.length > 0) {
        specificHtml = `
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.15);">
            <ul style="margin: 0; padding-left: 16px; font-size: 0.85em; opacity: 0.9;">
              ${entries.join('')}
            </ul>
          </div>
        `;
      }
    }

    const complete = isCharacterComplete();
    
    previewDetails.innerHTML = `
      <p><strong>Universe:</strong> ${universeName}</p>
      <p><strong>${options.categoryNames.power}:</strong> ${power}</p>
      <p><strong>${options.categoryNames.weapon}:</strong> ${weapon}</p>
      <p><strong>${options.categoryNames.role}:</strong> ${role}</p>
      <p><strong>${options.categoryNames.personality}:</strong> ${personalities}</p>
      <p><strong>Attire:</strong> ${appearance}</p>
      ${specificHtml}
      <p class="preview-status" style="margin-top: 8px; font-weight: 600; color: ${complete ? '#4dff91' : '#ffb340'};">
        ${complete ? '✅ Ready for Mission' : '⚠️ Missing details'}
      </p>
    `;
  }
}

function isCharacterComplete() {
  return AppState.character.name && AppState.character.name.trim() !== '' &&
         AppState.character.power && AppState.character.power.trim() !== '' &&
         AppState.character.weapon && AppState.character.weapon.trim() !== '' &&
         AppState.character.role && AppState.character.role.trim() !== '' &&
         Array.isArray(AppState.character.personality) && AppState.character.personality.length > 0;
}

/* =========================================================
   Mission Selection Screen
   ========================================================= */

function initializeMissionSelection() {
  const backToCharacterBtn = document.getElementById('backToCharacterBtn');
  const goToHubBtn = document.getElementById('goToHubBtn');
  const startMissionBtn = document.getElementById('startMissionBtn');
  const missionTopicInput = document.getElementById('missionTopicInput');

  // Update character info bar (also refreshed on every state entry via handleStateChange)
  updateCharacterInfoBar();

  // Back button
  if (backToCharacterBtn) {
    backToCharacterBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.CHARACTER_CREATION);
    });
  }

  // Hub button
  if (goToHubBtn) {
    goToHubBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.HUB);
    });
  }

  // Start Mission button
  if (startMissionBtn) {
    startMissionBtn.addEventListener('click', () => {
      const topic = missionTopicInput?.value.trim();
      if (!topic) {
        showToast('Enter a topic to learn first!');
        missionTopicInput?.focus();
        return;
      }
      launchMission(topic);
    });
  }

  // Enter key shortcut on the topic input
  if (missionTopicInput) {
    missionTopicInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const topic = missionTopicInput.value.trim();
        if (!topic) {
          showToast('Enter a topic to learn first!');
          return;
        }
        launchMission(topic);
      }
    });
  }

  // Populate dynamic curated mission cards per universe
  renderCuratedMissionCards();

  // Initialize Study Notes Mode tab & drag-drop handling
  initializeStudyNotesMode();
}

function updateCharacterInfoBar() {
  const miniCharacterAvatar = document.getElementById('miniCharacterAvatar');
  const miniCharacterName = document.getElementById('miniCharacterName');
  const miniCharacterUniverse = document.getElementById('miniCharacterUniverse');
  
  if (miniCharacterName) {
    miniCharacterName.textContent = AppState.character.name || 'Hero Name';
  }
  
  if (miniCharacterUniverse) {
    miniCharacterUniverse.textContent = AppState.universeThemes[AppState.currentUniverse]?.name || 'Universe';
  }

  // Populate saved character strip
  const strip = document.getElementById('missionSavedCharactersStrip');
  if (strip) {
    strip.innerHTML = '';
    const saved = CharacterStore.all(AppState.currentUniverse);
    saved.forEach(rec => {
      const chip = document.createElement('button');
      chip.className = 'saved-char-chip';
      const isActive = rec.name === AppState.character.name;
      if (isActive) chip.classList.add('selected-active');
      chip.title = rec.name;
      chip.textContent = (rec.appearance?.avatar ? rec.appearance.avatar.charAt(0).toUpperCase() : rec.name.charAt(0));
      chip.addEventListener('click', () => {
        loadSavedCharacter(rec);
        // Update chip highlight
        strip.querySelectorAll('.saved-char-chip').forEach(c => c.classList.remove('selected-active'));
        chip.classList.add('selected-active');
        updateCharacterInfoBar();
      });
      strip.appendChild(chip);
    });
  }

  // Wire the Switch Hero button
  const switchBtn = document.getElementById('missionSwitchHeroBtn');
  if (switchBtn && !switchBtn._wired) {
    switchBtn._wired = true;
    switchBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.CHARACTER_CREATION);
    });
  }
}

const CURATED_MISSIONS = {
  harrypotter: [
    {
      icon: "🧬",
      title: "DNA Base Pairing & Genetic Runes",
      topic: "DNA Base Pairing",
      category: "Biology",
      level: "Intermediate",
      description: "Forbidden runes in the Department of Mysteries require matching nucleic base pairs (A-T, C-G) to unseal the chamber."
    },
    {
      icon: "⚡",
      title: "Electrical Conductivity & Alchemical Circuits",
      topic: "Electrical Conductivity",
      category: "Physics",
      level: "Beginner",
      description: "Dumbledore's enchanted apparatus requires balancing metallic conductivity and resistance to stop a magical surge."
    },
    {
      icon: "🌌",
      title: "Quantum Superposition & Time-Turner Mechanics",
      topic: "Quantum Superposition",
      category: "Quantum Physics",
      level: "Advanced",
      description: "A fractured Time-Turner traps Hogwarts in overlapping quantum states. Stabilize the wave function to escape."
    }
  ],
  marvel: [
    {
      icon: "⚛️",
      title: "Quantum Entanglement & Subatomic Realm",
      topic: "Quantum Entanglement",
      category: "Quantum Physics",
      level: "Advanced",
      description: "Ant-Man and Iron Man need your help aligning entangled quantum particle pairs to escape the Quantum Realm."
    },
    {
      icon: "🌿",
      title: "Photosynthesis & Wakandan Bio-Energy",
      topic: "Photosynthesis",
      category: "Biology",
      level: "Beginner",
      description: "Groot and Rocket need to analyze Wakandan solar flora energy output to power shield generators during an invasion."
    },
    {
      icon: "🧲",
      title: "Electromagnetic Induction & Repulsor Coils",
      topic: "Electromagnetic Induction",
      category: "Physics",
      level: "Intermediate",
      description: "Iron Man's arc reactor conduits are overheating. Balance magnetic flux and induction currents to avert core meltdown."
    }
  ],
  space: [
    {
      icon: "🪐",
      title: "Gravitational Slingshot & Black Hole Orbits",
      topic: "Gravity and Orbital Velocity",
      category: "Astrophysics",
      level: "Intermediate",
      description: "The starship drive is failing near a massive singularity. Calculate gravitational acceleration to execute a warp escape."
    },
    {
      icon: "🧪",
      title: "Covalent Bonding & Oxygen Synthesis",
      topic: "Covalent Bonding",
      category: "Chemistry",
      level: "Beginner",
      description: "Ship life support requires synthesizing breathable oxygen from atmospheric compounds using covalent molecular bonding."
    },
    {
      icon: "💻",
      title: "Binary Logic & AI Neural Overdrive",
      topic: "Binary Logic Gates",
      category: "Computer Science",
      level: "Intermediate",
      description: "Ship AI klaxons trigger an automated lockdown. Realign boolean logic gates to regain bridge command."
    }
  ],
  anime: [
    {
      icon: "🔥",
      title: "Thermodynamics & Elemental Flame Aura",
      topic: "Laws of Thermodynamics",
      category: "Physics",
      level: "Intermediate",
      description: "Master Ren's elemental flame aura is over-expanding. Balance thermal expansion and enthalpy to master heat control."
    },
    {
      icon: "🧬",
      title: "Cellular Respiration & Ki Surge",
      topic: "Cellular Respiration",
      category: "Biology",
      level: "Beginner",
      description: "Unlock your inner spirit awakening by accelerating ATP energy production inside cellular mitochondria."
    },
    {
      icon: "📐",
      title: "Vector Mathematics & Kinetic Strikes",
      topic: "Vector Components",
      category: "Mathematics",
      level: "Intermediate",
      description: "Calculate vector force components and trajectory angles to break through the enemy's spirit barrier."
    }
  ],
  mythology: [
    {
      icon: "🌌",
      title: "Cosmic Gravitational Waves & Loka Balance",
      topic: "Gravitational Waves",
      category: "Cosmic Physics",
      level: "Advanced",
      description: "Lord Shiva's cosmic Tandava vibrates celestial Lokas. Balance gravitational harmonic waves to restore cosmic order."
    },
    {
      icon: "🌊",
      title: "Fluid Dynamics & Samudra Manthan Vortex",
      topic: "Fluid Viscosity and Turbulence",
      category: "Physics",
      level: "Intermediate",
      description: "Sage Narada guides the squad through ocean churning. Master fluid viscosity and vortex pressure to extract nectar."
    },
    {
      icon: "🌿",
      title: "Plant Mitosis & Sanjeevani Healing",
      topic: "Cellular Mitosis",
      category: "Biology",
      level: "Beginner",
      description: "Rejuvenate sacred Sanjeevani herbs on Mount Dronagiri by accelerating cellular mitosis and plant regeneration."
    }
  ],
  pirates: [
    {
      icon: "🧭",
      title: "Celestial Navigation & Star Triangulation",
      topic: "Spherical Trigonometry",
      category: "Astronomy",
      level: "Beginner",
      description: "Captain Redbeard navigates cursed whirlpools using star constellations and spherical trigonometry."
    },
    {
      icon: "💣",
      title: "Gas Laws & Powder Keg Pressure",
      topic: "Ideal Gas Law",
      category: "Chemistry",
      level: "Intermediate",
      description: "Broadside cannons misfire in humid sea air. Adjust pressure, volume, and temperature equations to clear guns."
    },
    {
      icon: "⚖️",
      title: "Buoyancy & Archimedes Principle",
      topic: "Archimedes Principle",
      category: "Physics",
      level: "Beginner",
      description: "A treasure galleon is taking on water. Balance fluid displacement and density to prevent sinking!"
    }
  ]
};

function renderCuratedMissionCards() {
  const grid = document.getElementById('missionCardsGrid');
  const input = document.getElementById('missionTopicInput');
  if (!grid) return;

  const currentU = AppState.currentUniverse || 'harrypotter';
  const missions = CURATED_MISSIONS[currentU] || CURATED_MISSIONS.harrypotter;

  let html = '';
  missions.forEach(m => {
    html += `
      <div class="mission-card glass curated-mission-card" data-topic="${escapeHtml(m.topic)}">
        <div class="mission-card-header">
          <span class="mission-card-icon">${m.icon}</span>
          <span class="mission-card-badge">${escapeHtml(m.category)} • ${escapeHtml(m.level)}</span>
        </div>
        <h4 class="mission-card-title">${escapeHtml(m.title)}</h4>
        <p class="mission-card-desc">${escapeHtml(m.description)}</p>
        <button type="button" class="mission-card-launch-btn">Launch Mission 🚀</button>
      </div>
    `;
  });

  // Custom Topic Card
  html += `
    <div class="mission-card glass curated-mission-card custom-topic-card">
      <div class="mission-card-header">
        <span class="mission-card-icon">✨</span>
        <span class="mission-card-badge">Custom Topic</span>
      </div>
      <h4 class="mission-card-title">Custom Topic Mission</h4>
      <p class="mission-card-desc">Type any custom topic above (e.g., Photosynthesis, Black Holes, Fractions) to generate an instant custom adventure!</p>
      <button type="button" class="mission-card-launch-btn secondary" id="customCardFocusBtn">Type Custom Topic ✍️</button>
    </div>
  `;

  grid.innerHTML = html;

  // Add click listeners to launch curated missions instantly
  grid.querySelectorAll('.curated-mission-card:not(.custom-topic-card)').forEach(card => {
    card.addEventListener('click', () => {
      const topic = card.dataset.topic;
      if (topic) {
        if (input) input.value = topic;
        if (window.VoiceEngine && typeof window.VoiceEngine.playSfx === 'function') {
          window.VoiceEngine.playSfx('choice');
        }
        launchMission(topic);
      }
    });
  });

  const focusBtn = grid.querySelector('#customCardFocusBtn');
  if (focusBtn) {
    focusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

/* =========================================================
   Study Notes Mode Initialization & File Uploader
   ========================================================= */

function initializeStudyNotesMode() {
  const tabQuickTopic = document.getElementById('tabQuickTopic');
  const tabStudyNotes = document.getElementById('tabStudyNotes');
  const panelQuickTopic = document.getElementById('panelQuickTopic');
  const panelStudyNotes = document.getElementById('panelStudyNotes');

  const notesDropZone = document.getElementById('notesDropZone');
  const notesFileInput = document.getElementById('notesFileInput');
  const browseNotesBtn = document.getElementById('browseNotesBtn');
  const notesTextInput = document.getElementById('notesTextInput');
  const notesStatsBadge = document.getElementById('notesStatsBadge');
  const notesStatsText = document.getElementById('notesStatsText');
  const startNotesMissionBtn = document.getElementById('startNotesMissionBtn');

  let activeNotesText = '';
  let activeFileName = '';

  function switchTab(mode) {
    if (mode === 'notes') {
      tabQuickTopic?.classList.remove('active');
      tabQuickTopic?.setAttribute('aria-selected', 'false');
      tabStudyNotes?.classList.add('active');
      tabStudyNotes?.setAttribute('aria-selected', 'true');

      panelQuickTopic?.classList.add('hidden-element');
      panelStudyNotes?.classList.remove('hidden-element');
    } else {
      tabStudyNotes?.classList.remove('active');
      tabStudyNotes?.setAttribute('aria-selected', 'false');
      tabQuickTopic?.classList.add('active');
      tabQuickTopic?.setAttribute('aria-selected', 'true');

      panelStudyNotes?.classList.add('hidden-element');
      panelQuickTopic?.classList.remove('hidden-element');
    }
  }

  if (tabQuickTopic) tabQuickTopic.addEventListener('click', () => switchTab('quick'));
  if (tabStudyNotes) tabStudyNotes.addEventListener('click', () => switchTab('notes'));

  // Browse file button
  if (browseNotesBtn && notesFileInput) {
    browseNotesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notesFileInput.click();
    });
  }

  if (notesDropZone && notesFileInput) {
    notesDropZone.addEventListener('click', () => notesFileInput.click());

    notesDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      notesDropZone.classList.add('is-drag-over');
    });
    notesDropZone.addEventListener('dragleave', () => {
      notesDropZone.classList.remove('is-drag-over');
    });
    notesDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      notesDropZone.classList.remove('is-drag-over');
      if (e.dataTransfer && e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
  }

  if (notesFileInput) {
    notesFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  function updateNotesStats(text, sourceName) {
    activeNotesText = text || '';
    activeFileName = sourceName || '';

    const words = activeNotesText.trim() ? activeNotesText.trim().split(/\s+/).length : 0;

    if (words > 0) {
      if (notesStatsBadge) notesStatsBadge.classList.remove('hidden-element');
      if (notesStatsText) {
        notesStatsText.textContent = `${sourceName ? sourceName + ' • ' : ''}${words} words loaded`;
      }
    } else {
      if (notesStatsBadge) notesStatsBadge.classList.add('hidden-element');
    }
  }

  async function extractPdfText(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (window.pdfjsLib) {
        // Disable worker to avoid cross-origin CDN CORS issues
        if (window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }
        const loadingTask = window.pdfjsLib.getDocument({
          data: arrayBuffer,
          disableWorker: true,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/cmaps/',
          cMapPacked: true
        });
        const pdf = await loadingTask.promise;
        let extractedText = '';
        const maxPages = Math.min(pdf.numPages, 40);

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          extractedText += pageText + '\n\n';
        }

        // Clean out any leftover PDF formatting codes
        let cleaned = extractedText
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/%PDF-\d\.\d[\s\S]*?obj/g, ' ')
          .replace(/endobj|endstream|stream/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        return cleaned;
      } else {
        const raw = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
        const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/%PDF[\s\S]*?obj/g, ' ').replace(/\s+/g, ' ').trim();
        return cleaned;
      }
    } catch (err) {
      console.warn('[ConceptVerse] PDF text extraction failed:', err);
      return '';
    }
  }

  async function handleFileSelect(file) {
    if (!file) return;

    showToast(`⏳ Extracting text from ${file.name}...`);

    const filename = file.name || 'document';
    const ext = filename.split('.').pop().toLowerCase();

    let textContent = '';

    if (ext === 'pdf') {
      textContent = await extractPdfText(file);
    } else {
      try {
        const raw = await file.text();
        textContent = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      } catch (e) {
        showToast('⚠️ Could not read file. Please try pasting text directly.');
        return;
      }
    }

    // Guard against binary PDF leftover codes
    if (textContent.includes('%PDF-') || textContent.includes('obj') && textContent.length < 50) {
      showToast('⚠️ This PDF appears to be a scanned image or protected document. Please paste the text notes directly.');
      if (notesTextInput) notesTextInput.value = '';
      updateNotesStats('', filename);
      return;
    }

    if (!textContent || textContent.length < 15) {
      showToast('⚠️ Could not extract text from this file. Please paste text directly into the box.');
      if (notesTextInput) notesTextInput.value = '';
      updateNotesStats('', filename);
      return;
    }

    if (notesTextInput) notesTextInput.value = textContent;
    updateNotesStats(textContent, filename);
    showToast(`✅ Loaded ${filename}! (${textContent.split(/\s+/).length} words)`);
  }

  if (notesTextInput) {
    notesTextInput.addEventListener('input', () => {
      updateNotesStats(notesTextInput.value, activeFileName || 'Pasted Notes');
    });
  }

  if (startNotesMissionBtn) {
    startNotesMissionBtn.addEventListener('click', () => {
      const text = notesTextInput?.value.trim() || activeNotesText.trim();
      if (!text) {
        showToast('⚠️ Please upload a file or paste your study notes first!');
        notesTextInput?.focus();
        return;
      }

      // Generate a clean topic title from file name or clean lines
      let topicTitle = '';
      if (activeFileName && activeFileName !== 'Pasted Notes') {
        topicTitle = activeFileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
      }

      if (!topicTitle || topicTitle.length < 3) {
        const cleanLines = text.split('\n')
          .map(l => l.replace(/[#*`_%]/g, '').trim())
          .filter(l => l.length > 5 && !l.startsWith('PDF') && !l.includes('obj'));
        topicTitle = cleanLines[0] || `Study Notes (${text.split(/\s+/).slice(0, 3).join(' ')})`;
      }

      // Final cleanup of topic title
      topicTitle = topicTitle.replace(/%PDF[^\s]*/gi, '').replace(/[^\x20-\x7E]/g, '').trim() || 'Custom Study Notes';

      if (window.VoiceEngine && typeof window.VoiceEngine.playSfx === 'function') {
        window.VoiceEngine.playSfx('ability');
      }

      launchMission(topicTitle, text);
    });
  }
}

/* =========================================================
   Mission Generation — POST /generate
   ========================================================= */

async function launchMission(topic, notesText = null) {
  const startMissionBtn = document.getElementById('startMissionBtn');
  const startNotesMissionBtn = document.getElementById('startNotesMissionBtn');
  const missionLoadingState = document.getElementById('missionLoadingState');

  // --- Loading state ---
  if (startMissionBtn) {
    startMissionBtn.disabled = true;
    startMissionBtn.textContent = 'Generating…';
  }
  if (startNotesMissionBtn) {
    startNotesMissionBtn.disabled = true;
    startNotesMissionBtn.textContent = 'Creating Notes Quest…';
  }
  if (missionLoadingState) missionLoadingState.style.display = 'block';

  AppState.startSession({ topic, notesText });

  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        notesText,
        theme: AppState.currentUniverse,
        character: AppState.character
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showToast(data.message || '⚠️ Generation failed. Please try again.');
      return;
    }

    // Store the AI lesson in session state
    AppState.currentSession.adventureData = data.lesson;

    // Navigate to the cinematic adventure screen
    AppState.navigateTo(AppState.NAVIGATION_STATES.CINEMATIC_ADVENTURE);

    // Populate the screen with real lesson content
    renderCinematicAdventure(data.lesson);

  } catch (error) {
    console.error('[ConceptVerse] Generation request failed:', error);
    showToast('⚠️ Could not reach the server. Is it running?');
  } finally {
    // Always restore the buttons
    if (startMissionBtn) {
      startMissionBtn.disabled = false;
      startMissionBtn.textContent = 'Start Mission →';
    }
    if (startNotesMissionBtn) {
      startNotesMissionBtn.disabled = false;
      startNotesMissionBtn.textContent = '🚀 Convert Notes into Quest →';
    }
    if (missionLoadingState) missionLoadingState.style.display = 'none';
  }
}


/* =========================================================
   Cinematic Adventure Engine — constants, SVG, StoryCtrl
   ========================================================= */

const UNIVERSE_NPCS = {
  harrypotter: [
    { name: 'Hermione Granger', hair: '#8B4513', skin: '#f5d0a9', trim: '#7c5cff', prop: 'wand' },
    { name: 'Draco Malfoy',    hair: '#f0e68c', skin: '#ffe4c4', trim: '#b0b0b0', prop: 'wand' },
    { name: 'Harry Potter',     hair: '#2c1b00', skin: '#f5d0a9', trim: '#ffd700', prop: 'wand' },
    { name: 'Ron Weasley',      hair: '#cc5500', skin: '#ffe4c4', trim: '#1a6b1a', prop: 'wand' },
  ],
  marvel: [
    { name: 'Tony Stark',       hair: '#1a1008', skin: '#f5d0a9', trim: '#ff4d5e', prop: 'repulsor' },
    { name: 'Bruce Banner',     hair: '#3a2a10', skin: '#c8a882', trim: '#2e8b57', prop: 'none' },
    { name: 'Thor Odinson',     hair: '#f0e68c', skin: '#ffe4c4', trim: '#3fd4ff', prop: 'hammer' },
    { name: 'Black Widow',      hair: '#1a0a00', skin: '#f5d0a9', trim: '#ff4d5e', prop: 'none' },
  ],
  space: [
    { name: 'Captain Nova',     hair: '#1a1008', skin: '#8d6e4a', trim: '#3fd4ff', prop: 'none' },
    { name: 'Astra (AI)',       hair: '#3fd4ff', skin: '#b0d4e8', trim: '#5fe0ff', prop: 'none' },
    { name: 'Dr. Vega',         hair: '#4a3018', skin: '#c8a882', trim: '#ff6b35', prop: 'scanner' },
    { name: 'Bolt',             hair: '#cc5500', skin: '#f5d0a9', trim: '#ff6b35', prop: 'wrench' },
  ],
  anime: [
    { name: 'Kai',              hair: '#1a0a2e', skin: '#ffe4c4', trim: '#ff6fd8', prop: 'sword' },
    { name: 'Aiko',             hair: '#ff6fd8', skin: '#ffe4c4', trim: '#00ffff', prop: 'staff' },
    { name: 'Riku',             hair: '#3fd4ff', skin: '#ffe4c4', trim: '#ff6fd8', prop: 'none' },
    { name: 'Master Ren',       hair: '#808080', skin: '#f5d0a9', trim: '#ffd700', prop: 'staff' },
  ],
  pirates: [
    { name: 'Captain Redbeard', hair: '#1a0a00', skin: '#c8a882', trim: '#8b4513', prop: 'sword' },
    { name: 'Finn',             hair: '#8B4513', skin: '#ffe4c4', trim: '#ffb340', prop: 'none' },
    { name: 'Boomer',           hair: '#2c1b00', skin: '#f5d0a9', trim: '#ffb340', prop: 'wrench' },
    { name: 'Navigator Pearl',  hair: '#1a0a00', skin: '#8d6e4a', trim: '#3fd4ff', prop: 'compass' },
  ],
  mythology: [
    { name: 'Shiva',            hair: '#1a0a2e', skin: '#c8a882', trim: '#ff9933', prop: 'trident' },
    { name: 'Vishnu',           hair: '#1a1008', skin: '#f5d0a9', trim: '#ffd700', prop: 'discus' },
    { name: 'Hanuman',          hair: '#8B4513', skin: '#c8a882', trim: '#ff9933', prop: 'hammer' },
    { name: 'Ganesha',          hair: '#1a1008', skin: '#f5d0a9', trim: '#ffd700', prop: 'staff' },
    { name: 'Narada',           hair: '#2c1b00', skin: '#f5d0a9', trim: '#ffb340', prop: 'flute' },
    { name: 'The Asura',        hair: '#cc5500', skin: '#8d6e4a', trim: '#ff4d5e', prop: 'none' },
  ]
};

const APPEARANCE_TINTS = {
  robed:      { skin: '#f5d0a9', trim: '#7c5cff', hair: '#5c3d2e' },
  armored:    { skin: '#ffe4c4', trim: '#3fd4ff', hair: '#2c1b00' },
  cloaked:    { skin: '#c8a882', trim: '#2e8b57', hair: '#1a0a00' },
  'space suit':{ skin: '#f5d0a9', trim: '#ff6b35', hair: '#8B4513' },
  casual:     { skin: '#ffe4c4', trim: '#ff4d5e', hair: '#cc5500' },
  ninja:      { skin: '#c8a882', trim: '#1a0a2e', hair: '#1a0a00' },
  default:    { skin: '#f5d0a9', trim: '#7c5cff', hair: '#5c3d2e' }
};

const WEAPON_PROPS = {
  wand:       'M14 2 L16 4 L16 28 L14 30 L14 2Z',
  sword:      'M14 4 L16 4 L16 26 L14 26Z M12 26 L18 26 L18 28 L12 28Z',
  staff:      'M14 2 L16 2 L16 30 L14 30Z',
  hammer:     'M10 4 L18 4 L18 10 L10 10Z M14 10 L14 28',
  trident:    'M14 10 L14 30 M10 4 L10 14 M14 2 L14 14 M18 4 L18 14',
  compass:    'M14 6 A8 8 0 1 1 14 22 A8 8 0 1 1 14 6Z M14 10 L14 14 L18 14',
  scanner:    'M8 10 L20 10 L20 24 L8 24Z M10 14 L18 14 M10 18 L18 18 M10 22 L14 22',
  discus:     'M14 6 A8 8 0 1 1 14 22 A8 8 0 1 1 14 6Z',
  flute:      'M12 4 L16 4 L16 26 L12 26Z M12 8 L16 8 M12 14 L16 14 M12 20 L16 20',
  bow:        'M12 4 C18 10, 18 22, 12 28 M12 4 L12 28 M8 16 L20 16',
  repulsor:   'M14 10 A4 4 0 1 1 14 18 A4 4 0 1 1 14 10Z',
  wrench:     'M10 6 L18 14 L14 18 L10 14Z',
  none:       '',
};

const FX_GLYPHS = {
  spell:'⚡',fire:'🔥',frost:'❄️',shake:'💫',glow:'✨',
  storm:'🌊',fog:'🌫️',fade:'👻',reveal:'🔍',crack:'💥',
};

const FX_CLASS = {
  spell:'fx-spell',fire:'fx-fire',frost:'fx-frost',shake:'fx-shake',glow:'fx-glow',
  storm:'fx-storm',fog:'fx-fog',fade:'fx-fade',reveal:'fx-reveal',crack:'fx-crack',
};

/** Lightweight SVG character bust figure. */
function svgFigure(o) {
  const t = APPEARANCE_TINTS[o.tint] || APPEARANCE_TINTS['default'];
  const hair  = o.hair  || t.hair;
  const skin  = o.skin  || t.skin;
  const trim  = o.trim  || t.trim;
  const prop  = o.prop  || 'none';
  const speaking = !!o.speaking;
  const acting   = !!o.acting;

  const headY = speaking ? 5 : acting ? 6 : 8;
  const headR = speaking ? 9 : acting ? 8.5 : 8;
  const openM = speaking
    ? '<ellipse cx="14" cy="13.5" rx="2" ry="1.8" fill="#2c1b00" opacity="0.85"/>'
    : '';
  const actCl = acting ? ' is-acting' : '';
  const speakCl = speaking ? ' is-speaking' : '';

  const propPath = WEAPON_PROPS[prop] || '';
  const propSvg = propPath
    ? `<path d="${propPath}" fill="none" stroke="${trim}" stroke-width="1.4" stroke-linecap="round"
             class="char-prop" transform="translate(22,8) scale(0.7)"/>`
    : '';

  const glowR = speaking ? 18 : acting ? 16 : 14;
  const auraOp = speaking ? 0.18 : acting ? 0.12 : 0.06;
  const auraFill = trim;

  return `<svg class="sprite-figure${actCl}${speakCl}" viewBox="0 0 28 34"
               role="img" aria-label="${o.name || ''}">
    <circle class="sprite-aura" cx="14" cy="16" r="${glowR}" fill="${auraFill}" opacity="${auraOp}"/>
    <circle cx="14" cy="${headY}" r="${headR}" fill="${skin}" stroke="${trim}" stroke-width="0.6"/>
    <ellipse cx="14" cy="${headY - headR * 0.25}" rx="${headR * 1.08}" ry="${headR * 0.52}" fill="${hair}"/>
    <circle cx="11" cy="${headY + 0.5}" r="0.8" fill="#1a0a00"/>
    <circle cx="17" cy="${headY + 0.5}" r="0.8" fill="#1a0a00"/>
    ${openM}
    <path d="M10 ${headY + headR + 1} Q14 ${headY + headR + 5} 18 ${headY + headR + 1}"
          fill="${trim}" opacity="0.9" stroke="${trim}" stroke-width="0.3"/>
    ${propSvg}
  </svg>`;
}

function normalizeBeat(b) {
  if (!b || typeof b !== 'object') return null;
  let beats = b.beats || b.story || b.events;
  if (Array.isArray(beats) && beats.length) return beats.map(normalizeBeat).filter(Boolean);
  const t = b.t || b.type || b.kind || b.event || (b.options ? 'choice' : (b.speaker ? 'dialogue' : 'env'));
  // Choice beats from the model often use "question" — accept both.
  const out = { t, text: b.text || b.question || b.narration || b.description || '' };
  if (b.speaker)   out.speaker = b.speaker;
  if (b.by)        out.by = b.by;
  if (b.what)      out.what = b.what;
  if (b.fx)        out.fx = b.fx;
  if (b.options)   out.options = b.options;
  if (b.next)      out.next = b.next;
  if (b.feedback)  out.feedback = b.feedback;
  if (b.isCorrect !== undefined) out.isCorrect = b.isCorrect;
  if (b.hint)      out.hint = b.hint;
  return out;
}

/* --- StoryCtrl: beat player --- */

const StoryCtrl = {
  _beats:[], _i:0, _atChoice:false, _cb:null, _timer:null,

  start(beats, done) {
    this.stop();
    this._beats = (Array.isArray(beats) ? beats : []).filter(Boolean);
    this._i = 0; this._atChoice = false; this._cb = done || null;
    this.tick();
  },

  tick() {
    clearTimeout(this._timer);
    this._atChoice = false;
    if (this._i >= this._beats.length) { this.finish(); return; }
    const b = this._beats[this._i];
    if (!b) { this._i++; this.tick(); return; }

    if (b.t === 'choice' && b.options) {
      this._atChoice = true;
      renderChoice(b);
      return;
    }

    renderStream(b);
    setStageCast(b);

    if (b.fx && FX_GLYPHS[b.fx]) renderEffect(b.fx, b.what || b.text);
    if (b.location || b.speaker) showLocation(b.speaker || '');

    this._timer = setTimeout(() => { this._i++; this.tick(); }, 2800);
  },

  reveal(b) {
    clearTimeout(this._timer);
    if (!b) { this._i++; this.tick(); return; }
    if (b.t === 'choice' && b.options) { this._atChoice = true; renderChoice(b); return; }
    renderStream(b);
    setStageCast(b);
    if (b.fx && FX_GLYPHS[b.fx]) renderEffect(b.fx, b.what || b.text);
    if (b.location || b.speaker) showLocation(b.speaker || '');
    this._timer = setTimeout(() => { this._i++; this.tick(); }, 2800);
  },

  skipAll() {
    clearTimeout(this._timer);
    const stream = document.getElementById('streamLog');
    while (this._i < this._beats.length) {
      const b = this._beats[this._i];
      if (b && b.t === 'choice' && b.options) { this._atChoice = true; renderChoice(b); return; }
      if (b) {
        renderStream(b);
        setStageCast(b);
        if (b.fx && FX_GLYPHS[b.fx]) renderEffect(b.fx, b.what || b.text);
      }
      this._i++;
    }
    this.finish();
  },

  stop()  { clearTimeout(this._timer); this._beats=[]; this._i=0; this._atChoice=false; },
  finish(){ clearTimeout(this._timer); if (this._cb) this._cb(); },
};

/* =========================================================
   Cinematic Adventure Screen — Init
   ========================================================= */

function initializeCinematicAdventure() {
  const backToMissionBtn = document.getElementById('backToMissionBtn');
  const storySkipBtn     = document.getElementById('storySkipBtn');
  const viewSituationPill = document.getElementById('viewSituationPill');

  if (backToMissionBtn) {
    backToMissionBtn.addEventListener('click', () => {
      StoryCtrl.stop();
      AppState.navigateTo(AppState.NAVIGATION_STATES.MISSION_SELECTION);
    });
  }
  if (storySkipBtn) {
    storySkipBtn.addEventListener('click', () => StoryCtrl.skipAll());
  }

  if (viewSituationPill && !viewSituationPill._wired) {
    viewSituationPill._wired = true;
    viewSituationPill.addEventListener('click', () => {
      const lesson = AppState.currentSession._lesson;
      if (lesson) showCrisisBriefing(lesson, true);
      else showToast('⚠️ Situation report will be available once mission loads.');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (AppState.currentState !== 'CINEMATIC_ADVENTURE') return;
    if (StoryCtrl._atChoice) return;
    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      StoryCtrl.skipAll();
    }
  });
}

/* =========================================================
   Cinematic Adventure Renderer — entry point + helpers
   ========================================================= */

function showCrisisBriefing(lesson, isReviewOnly = false) {
  const modal = document.getElementById('crisisBriefingModal');
  const titleEl = document.getElementById('crisisMissionTitle');
  const uBadgeEl = document.getElementById('crisisUniverseBadge');
  const sitEl = document.getElementById('crisisSituationText');
  const probEl = document.getElementById('crisisProblemText');
  const stakesEl = document.getElementById('crisisStakesText');
  const heroEl = document.getElementById('crisisHeroText');
  const squadEl = document.getElementById('crisisSquadText');
  const startBtn = document.getElementById('startAdventureFromBriefingBtn');
  const closeBtn = document.getElementById('closeCrisisBriefingBtn');

  if (!modal) return;

  const currentU = AppState.currentUniverse || 'harrypotter';
  const uName = AppState.universeThemes[currentU]?.name || currentU;
  const uIcons = {
    harrypotter: '🧙‍♂️',
    marvel: '⚡',
    anime: '⚔️',
    space: '🚀',
    pirates: '🏴‍☠️',
    mythology: '🕉️'
  };
  const uIcon = uIcons[currentU] || '🌌';

  const mission = lesson.mission || {};
  const topic = lesson.discovery?.title || AppState.currentSession.mission?.topic || 'the mission';

  // Fallbacks if AI didn't provide separate fields
  const title = mission.title || `Crisis Encounter: ${topic}`;
  const situation = mission.situation || mission.problem || `A critical emergency has erupted across the ${uName} universe involving ${topic}. The regional balance is dangerously unstable.`;
  const problem = mission.problem || mission.situation || `You and your squad must work together to crack the exact principle of ${topic} and resolve the crisis mechanism before it is too late.`;
  const stakes = mission.stakes || 'Immediate systemic destabilization and catastrophic collapse of the sector.';

  const ch = AppState.character || {};
  const heroName = ch.name || 'Hero';
  const heroRole = ch.role || 'Squad Specialist';
  const heroPower = ch.power ? ` • Power: ${ch.power}` : '';

  // Active NPC allies
  const npcs = (UNIVERSE_NPCS[currentU] || []).map(n => n.name).slice(0, 4).join(', ');

  if (titleEl) titleEl.textContent = title;
  if (uBadgeEl) uBadgeEl.textContent = `${uIcon} ${uName} Universe`;
  if (sitEl) sitEl.textContent = situation;
  if (probEl) probEl.textContent = problem;
  if (stakesEl) stakesEl.textContent = stakes;
  if (heroEl) heroEl.textContent = `${heroName} (${heroRole})${heroPower}`;
  if (squadEl) squadEl.textContent = npcs ? `${npcs} and your squad` : 'Your squad allies';

  modal.classList.remove('hidden-element', 'dismissed');
  modal.classList.add('active');

  if (isReviewOnly) {
    if (closeBtn) closeBtn.classList.remove('hidden-element');
    if (startBtn) {
      startBtn.textContent = '✕ Return to Adventure';
      startBtn.onclick = () => {
        modal.classList.remove('active');
        modal.classList.add('dismissed');
      };
    }
  } else {
    if (closeBtn) closeBtn.classList.add('hidden-element');
    if (startBtn) {
      startBtn.textContent = '⚔️ ACCEPT MISSION & ENTER ADVENTURE →';
      startBtn.onclick = () => {
        modal.classList.remove('active');
        modal.classList.add('dismissed');
        updateAdventureProgress(lesson, 0);
        renderAdventureSceneByIndex(0, lesson);
      };
    }
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.classList.remove('active');
      modal.classList.add('dismissed');
    };
  }
}

function renderCinematicAdventure(lesson) {
  if (!lesson || !Array.isArray(lesson.scenes) || lesson.scenes.length === 0) {
    showToast('⚠️ Adventure data is missing. Please try again.');
    AppState.navigateTo(AppState.NAVIGATION_STATES.MISSION_SELECTION);
    return;
  }
  const sceneMap = {};
  lesson.scenes.forEach(s => { sceneMap[s.id] = s; });

  AppState.currentSession._sceneMap  = sceneMap;
  AppState.currentSession._lesson   = lesson;
  AppState.currentSession._sceneIdx = 0;
  AppState.currentSession._visitedScenes = new Set();

  const ap = document.getElementById('adventurePoints');
  if (ap) ap.textContent = AppState.userProgress.points;

  const charsDisp = document.getElementById('charactersDisplay');
  const fxLayer   = document.getElementById('actionMomentsArea');
  const locLabel  = document.getElementById('sceneLocationLabel');
  const flow      = document.getElementById('storyBeatsFlow');
  const actions   = document.getElementById('storyActionArea');

  if (charsDisp) charsDisp.innerHTML = '';
  if (fxLayer)   fxLayer.innerHTML   = '';
  if (locLabel)  locLabel.textContent = '';
  if (flow)      flow.innerHTML = '';
  if (actions)   actions.innerHTML = '';

  // Show the Situation and Problem to Tackle Crisis Briefing before the adventure scenes start!
  showCrisisBriefing(lesson, false);
}

function updateAdventureProgress(lesson, idx) {
  const total = lesson.scenes.length;
  const pt = document.getElementById('adventureProgressText');
  const pf = document.getElementById('adventureProgressFill');
  if (pt) pt.textContent = `Scene ${Math.min(idx + 1, total)} of ${total}`;
  if (pf) pf.style.width = `${((Math.min(idx + 1, total)) / total) * 100}%`;
}

function sceneIndexFor(scene, lesson) {
  if (scene == null) return -1;
  if (typeof scene === 'number') return scene;
  if (typeof scene === 'string') return lesson.scenes.findIndex(s => s.id === scene);
  if (typeof scene === 'object' && scene.id) return lesson.scenes.findIndex(s => s.id === scene.id);
  return -1;
}

function renderAdventureSceneByIndex(idx, lesson) {
  const scene = lesson.scenes[idx];
  if (!scene) { finishAdventure(lesson); return; }

  // Loop guard: never replay a scene that has already been fully consumed.
  const visited = AppState.currentSession._visitedScenes;
  if (visited && visited.has(scene.id)) { finishAdventure(lesson); return; }
  if (visited) visited.add(scene.id);

  AppState.currentSession._sceneIdx = idx;
  updateAdventureProgress(lesson, idx);

  if (scene.location) showLocation(scene.location);

  renderCompactCast(scene, lesson);
  renderSceneStoryChronicle(scene, lesson, idx);
}

function advanceScene(scene, lesson) {
  if (scene && scene.next) {
    const ni = sceneIndexFor(scene.next, lesson);
    if (ni >= 0) { renderAdventureSceneByIndex(ni, lesson); return; }
  }
  const cur = AppState.currentSession._sceneIdx;
  if (cur + 1 < lesson.scenes.length) {
    renderAdventureSceneByIndex(cur + 1, lesson);
  } else {
    finishAdventure(lesson);
  }
}

function showLocation(text) {
  const el = document.getElementById('sceneLocationLabel');
  if (el) el.textContent = text ? `📍 ${text}` : '';
}

function renderCompactCast(scene, lesson) {
  const disp = document.getElementById('charactersDisplay');
  if (!disp) return;
  disp.innerHTML = '';

  const uni = AppState.currentUniverse || 'harrypotter';
  const NPCs = (UNIVERSE_NPCS[uni] || []).slice(0, 4);

  // Discover speakers/actors in this scene
  const activeNames = new Set();
  const rawBeats = (scene?.beats || []).map(normalizeBeat).flat().filter(Boolean);
  rawBeats.forEach(b => {
    if (b.speaker) activeNames.add(b.speaker.toLowerCase());
    if (b.by) activeNames.add(b.by.toLowerCase());
  });

  const ch = AppState.character || {};
  const appKey = (ch.appearance?.avatar || ch.appearance?.id || ch.appearance?.type || 'robed').toLowerCase();
  const tintObj = APPEARANCE_TINTS[appKey] || APPEARANCE_TINTS['robed'] || APPEARANCE_TINTS['default'];
  const wk = (ch.weapon || '').toLowerCase();
  let prop = 'none';
  if (wk.includes('trishula') || wk.includes('trident')) prop = 'trident';
  else if (wk.includes('chakra') || wk.includes('discus')) prop = 'discus';
  else if (wk.includes('bow') || wk.includes('gandiva')) prop = 'bow';
  else if (wk.includes('gada') || wk.includes('mace') || wk.includes('hammer')) prop = 'hammer';
  else if (wk.includes('flute') || wk.includes('venu')) prop = 'flute';
  else if (wk.includes('wand')) prop = 'wand';
  else if (wk.includes('sword') || wk.includes('katana') || wk.includes('cutlass')) prop = 'sword';
  else if (wk.includes('staff')) prop = 'staff';
  else if (wk.includes('repulsor')) prop = 'repulsor';
  else if (wk.includes('compass')) prop = 'compass';
  else if (wk.includes('wrench')) prop = 'wrench';
  else if (wk.includes('scanner')) prop = 'scanner';
  else if (WEAPON_PROPS[wk] !== undefined) prop = wk;
  const learnerActive = activeNames.has('you') || activeNames.has((ch.name || '').toLowerCase()) || activeNames.size === 0;

  // Learner mini sprite
  const learner = document.createElement('div');
  learner.className = `character-sprite sprite-learner${learnerActive ? ' is-speaking' : ''}`;
  learner.innerHTML = svgFigure({
    name: ch.name || 'You',
    tint: appKey,
    hair: tintObj.hair,
    skin: tintObj.skin,
    trim: tintObj.trim,
    prop,
    speaking: learnerActive,
    acting: false,
  }) + `<div class="sprite-name">${escapeHtml(ch.name || 'You')}</div>`;
  disp.appendChild(learner);

  // NPC mini sprites
  NPCs.forEach(npc => {
    const isPresent = activeNames.size === 0 || Array.from(activeNames).some(name => npc.name.toLowerCase().includes(name) || name.includes(npc.name.toLowerCase()));
    const el = document.createElement('div');
    el.className = `character-sprite sprite-npc${isPresent ? ' is-speaking' : ''}`;
    el.dataset.name = npc.name;
    el.innerHTML = svgFigure({
      name: npc.name, hair: npc.hair, skin: npc.skin, trim: npc.trim, prop: npc.prop,
      speaking: isPresent, acting: false,
    }) + `<div class="sprite-name">${escapeHtml(npc.name)}</div>`;
    disp.appendChild(el);
  });
}

function getCharacterEmoji(who, universeKey) {
  if (!who) return '✨';
  const name = String(who).toLowerCase();
  if (name.includes('nova')) return '🚀';
  if (name.includes('vega')) return '📜';
  if (name.includes('bolt')) return '⚡';
  if (name.includes('astra')) return '🤖';
  if (name.includes('stark') || name.includes('iron')) return '🦾';
  if (name.includes('fury')) return '🕶️';
  if (name.includes('spider') || name.includes('peter')) return '🕷️';
  if (name.includes('dumbledore')) return '🧙‍♂️';
  if (name.includes('hermione')) return '🪄';
  if (name.includes('ron')) return '🧹';
  if (name.includes('malfoy')) return '🐍';
  if (name.includes('redbeard')) return '🏴‍☠️';
  if (name.includes('boomer')) return '💣';
  if (name.includes('ren') || name.includes('master')) return '🥋';
  if (name.includes('kai')) return '🔥';
  if (name.includes('narada')) return '🔱';
  if (name.includes('shiva')) return '🔱';
  return '🎭';
}

function renderSceneStoryChronicle(scene, lesson, idx) {
  const beatsFlow = document.getElementById('storyBeatsFlow');
  const actionArea = document.getElementById('storyActionArea');
  const chroniclePanel = document.getElementById('storyChroniclePanel');
  if (!beatsFlow || !actionArea) return;

  beatsFlow.innerHTML = '';
  actionArea.innerHTML = '';

  const rawBeats = (scene.beats || []).map(normalizeBeat).flat().filter(Boolean);

  const storyBeats = [];
  let choiceBeat = null;

  for (const b of rawBeats) {
    if ((b.t === 'choice' || b.options) && !choiceBeat) {
      choiceBeat = b;
    } else {
      storyBeats.push(b);
    }
  }

  if (!choiceBeat && scene.choice) {
    choiceBeat = {
      t: 'choice',
      text: scene.choice.question || scene.choice.text || 'What do you do?',
      options: scene.choice.options || []
    };
  }

  const uni = AppState.currentUniverse || 'harrypotter';
  const npcs = UNIVERSE_NPCS[uni] || [];
  const learnerName = AppState.character?.name || 'You';
  const learnerAvatar = AppState.character?.appearance?.avatar || '🦸';

  // Render all narrative and dialogue beats at once
  storyBeats.forEach(b => {
    const who = (b.speaker || b.by || '').trim();
    const isLearner = who.toLowerCase() === 'you' || who.toLowerCase() === learnerName.toLowerCase();
    const isSpoken = (b.t === 'dialogue' || b.t === 'reaction' || !!b.speaker) && b.t !== 'action';

    if (isSpoken) {
      let role = b.role || '';
      const lwho = who.toLowerCase();

      if (isLearner) {
        role = 'learner';
      } else if (!role) {
        if (lwho.includes('malfoy') || lwho.includes('loki') || lwho.includes('asura') || lwho.includes('flint') || lwho.includes('rival') || lwho.includes('snape')) {
          role = 'rival';
        } else if (lwho.includes('ron') || lwho.includes('spider') || lwho.includes('peter') || lwho.includes('bolt') || lwho.includes('boomer') || lwho.includes('riku') || lwho.includes('narada')) {
          role = 'comic';
        } else {
          role = 'ally';
        }
      }

      let avatar = '✨';
      let name = who || 'Narrator';
      let roleBadgeHtml = '';

      if (isLearner) {
        avatar = learnerAvatar;
        name = learnerName;
        roleBadgeHtml = '<span class="beat-role-badge beat-role-badge--player">⭐ Hero</span>';
      } else {
        const npc = npcs.find(n => n.name.toLowerCase() === lwho || n.name.toLowerCase().includes(lwho) || lwho.includes(n.name.toLowerCase()));
        avatar = npc?.emoji || getCharacterEmoji(who, uni);
        if (npc) name = npc.name;

        if (role === 'rival') {
          roleBadgeHtml = '<span class="beat-role-badge beat-role-badge--rival">⚔️ Rival</span>';
        } else if (role === 'comic') {
          roleBadgeHtml = '<span class="beat-role-badge beat-role-badge--comic">😄 Jester</span>';
        } else {
          roleBadgeHtml = '<span class="beat-role-badge beat-role-badge--ally">🛡️ Ally</span>';
        }
      }

      const moodHtml = b.mood || b.tone ? `<span class="beat-mood-tag">${escapeHtml(b.mood || b.tone)}</span>` : '';

      const beatEl = document.createElement('div');
      beatEl.className = `story-beat story-beat--dialogue story-beat--${role}`;
      beatEl.innerHTML = `
        <div class="beat-header-row">
          <span class="beat-speaker-avatar">${avatar}</span>
          <span class="beat-speaker-name">${escapeHtml(name)}</span>
          ${roleBadgeHtml}
          ${moodHtml}
        </div>
        <div class="beat-dialogue-content">${escapeHtml(b.text || '')}</div>
      `;
      beatsFlow.appendChild(beatEl);

    } else if (b.t === 'action') {
      const beatEl = document.createElement('div');
      beatEl.className = 'story-beat story-beat--action story-beat--narration';
      beatEl.dataset.t = 'action';
      if (b.fx) beatEl.dataset.fx = String(b.fx);
      const rawText = (b.text || b.what || '').trim();
      const actorName = isLearner ? learnerName : (who || '');
      const startsWithPronoun = /^(he|she|they|it)\b/i.test(rawText);
      let displayText = rawText;

      if (!startsWithPronoun && rawText && actorName && !rawText.toLowerCase().startsWith(actorName.toLowerCase())) {
        displayText = `${actorName} ${rawText}`;
      }

      beatEl.innerHTML = `
        <div class="beat-narration-icon">⚡</div>
        <div class="beat-narration-text">${escapeHtml(displayText)}</div>
      `;
      beatsFlow.appendChild(beatEl);

    } else if (b.t === 'discovery') {
      const beatEl = document.createElement('div');
      beatEl.className = 'story-beat story-beat--discovery story-beat--concept';
      const mentor = getUniverseMentor(AppState.currentUniverse);
      beatEl.innerHTML = `
        <div class="beat-action-icon">${mentor.icon}</div>
        <div class="beat-action-body">
          <div class="beat-action-actor" style="color: var(--universe-accent, #ffd700); font-weight:700;">${mentor.icon} Key Concept — ${escapeHtml(mentor.title)}</div>
          <div class="beat-concept-text">${escapeHtml(b.text || '')}</div>
        </div>
      `;
      beatsFlow.appendChild(beatEl);

    } else {
      const beatEl = document.createElement('div');
      beatEl.className = 'story-beat story-beat--narration';
      beatEl.dataset.t = b.t || 'narration';
      if (b.fx) beatEl.dataset.fx = String(b.fx);
      const icon = b.t === 'env' ? '🌍' : '📜';
      beatEl.innerHTML = `
        <div class="beat-narration-icon">${icon}</div>
        <div class="beat-narration-text">${escapeHtml(b.text || '')}</div>
      `;
      beatsFlow.appendChild(beatEl);
    }
  });

  // Render choice or continue button at the end
  if (choiceBeat && Array.isArray(choiceBeat.options) && choiceBeat.options.length > 0) {
    renderChronicleChoice(choiceBeat, scene, lesson);
  } else {
    renderChronicleContinue(scene, lesson, idx);
  }

  // Attach voice engine to dialogue lines (adds 🔊 buttons, handles auto-play if enabled)
  if (window.VoiceEngine && typeof window.VoiceEngine.attachToScene === 'function') {
    window.VoiceEngine.attachToScene(beatsFlow);
  }

  // Scroll to top of chronicle panel so story is read from top
  if (chroniclePanel) {
    chroniclePanel.scrollTop = 0;
  }
}

function getCharacterAbilityName() {
  const char = AppState.character || {};
  const uni = AppState.currentUniverse || 'harrypotter';
  const ABILITIES = {
    harrypotter: "Hermione's Revelio Spell 🪄",
    marvel: "Stark Nanotech Telemetry 🦾",
    space: "Captain Nova's Scanner Sweep 🚀",
    anime: "Master Ren's Ki Focus ⚔️",
    mythology: "Shiva's Divya Drishti 🔱",
    pirates: "Captain Redbeard's Instinct 🏴‍☠️"
  };
  return char.power ? `✨ ${char.power}` : (ABILITIES[uni] || "✨ Tactical Scan");
}

function renderChronicleChoice(choiceBeat, scene, lesson) {
  const actionArea = document.getElementById('storyActionArea');
  if (!actionArea) return;

  const card = document.createElement('div');
  card.className = 'story-decision-card';

  const abilityName = getCharacterAbilityName();
  const abilityUsed = !!(AppState.currentSession && AppState.currentSession.abilityUsed);

  card.innerHTML = `
    <div class="decision-badge">Your Decision / Next Move</div>
    <div class="ability-action-bar">
      <button type="button" class="ability-trigger-btn" id="abilityTriggerBtn" ${abilityUsed ? 'disabled' : ''}>
        <span>${abilityUsed ? '✨ Ability Spent This Adventure' : `Activate Ability: <strong>${escapeHtml(abilityName)}</strong>`}</span>
        <span class="ability-tag">${abilityUsed ? '0/1 Charges' : '1 Charge Available'}</span>
      </button>
    </div>
    <div class="decision-question">${escapeHtml(choiceBeat.text || 'What do you choose to do next?')}</div>
    <div class="decision-options" id="chronicleDecisionOptions"></div>
  `;
  actionArea.appendChild(card);

  const abilityBtn = card.querySelector('#abilityTriggerBtn');
  if (abilityBtn && !abilityUsed) {
    abilityBtn.addEventListener('click', () => {
      if (!AppState.currentSession) AppState.currentSession = {};
      AppState.currentSession.abilityUsed = true;
      abilityBtn.disabled = true;
      abilityBtn.innerHTML = `<span>✨ <strong>${escapeHtml(abilityName)}</strong> Active!</span> <span class="ability-tag">0 Charges</span>`;

      if (window.VoiceEngine) {
        if (typeof window.VoiceEngine.playSfx === 'function') window.VoiceEngine.playSfx('ability');
        if (typeof window.VoiceEngine.triggerSparkle === 'function') window.VoiceEngine.triggerSparkle(abilityBtn);
      }

      const optBtns = card.querySelectorAll('.decision-option-btn');
      let eliminated = 0;
      choiceBeat.options.forEach((opt, idx) => {
        if (!opt.isCorrect && eliminated < 2 && optBtns[idx]) {
          optBtns[idx].classList.add('ability-disabled-opt');
          eliminated++;
        }
      });
      showToast(`✨ ${abilityName} isolated ${eliminated} flawed option(s)!`);
    });
  }

  const optsContainer = card.querySelector('#chronicleDecisionOptions');
  choiceBeat.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'decision-option-btn';
    btn.innerHTML = `<span class="decision-opt-bullet">▶</span> <span>${escapeHtml(opt.text)}</span>`;
    btn.addEventListener('click', () => {
      if (window.VoiceEngine && typeof window.VoiceEngine.playSfx === 'function') {
        window.VoiceEngine.playSfx('choice');
      }
      handleChronicleChoice(opt, card, scene, lesson);
    });
    optsContainer.appendChild(btn);
  });
}

function handleChronicleChoice(opt, card, scene, lesson) {
  const btns = card.querySelectorAll('.decision-option-btn');
  btns.forEach(b => { b.disabled = true; });

  const xp = opt.isCorrect ? 100 : 25;
  AppState.addPoints(xp);
  showToast(opt.isCorrect ? `✅ +${xp} XP` : `💡 +${xp} XP`);

  if (window.VoiceEngine && typeof window.VoiceEngine.playSfx === 'function') {
    window.VoiceEngine.playSfx(opt.isCorrect ? 'correct' : 'wrong');
  }

  const ap = document.getElementById('adventurePoints');
  if (ap) ap.textContent = AppState.userProgress.points;

  if (window.VoiceEngine && typeof window.VoiceEngine.speakQuizFeedback === 'function') {
    window.VoiceEngine.speakQuizFeedback(opt.isCorrect, opt.feedback, card);
  }

  if (opt.feedback) {
    const fb = document.createElement('div');
    fb.className = 'decision-feedback-card';
    fb.innerHTML = `
      <div style="font-weight: 700; color: ${opt.isCorrect ? '#4ade80' : 'var(--universe-accent, #ffd700)'}">
        ${opt.isCorrect ? '✅ Well done!' : '💡 Insight:'}
      </div>
      <div style="font-size: 0.95rem; line-height: 1.45;">${escapeHtml(opt.feedback)}</div>
      <button class="story-continue-btn" id="feedbackContinueBtn" style="margin-top: 0.5rem;">Continue Journey →</button>
    `;
    card.appendChild(fb);

    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const contBtn = card.querySelector('#feedbackContinueBtn');
    if (contBtn) {
      contBtn.addEventListener('click', () => advanceAfterChoice(opt));
    }
  } else {
    advanceAfterChoice(opt);
  }
}

function renderChronicleContinue(scene, lesson, idx) {
  const actionArea = document.getElementById('storyActionArea');
  if (!actionArea) return;

  const isLast = (idx + 1 >= lesson.scenes.length) && (!scene.next || sceneIndexFor(scene.next, lesson) < 0);
  const btn = document.createElement('button');
  btn.className = `story-continue-btn${isLast ? ' story-continue-btn--final' : ''}`;
  btn.id = 'chronicleContinueBtn';
  btn.textContent = isLast ? 'Complete Mission & Unlock Concept ⭐ →' : 'Continue to Next Scene →';
  btn.addEventListener('click', () => {
    btn.disabled = true;
    advanceScene(scene, lesson);
  });
  actionArea.appendChild(btn);
}

function advanceAfterChoice(opt) {
  const scene  = AppState.currentSession._lesson?.scenes[AppState.currentSession._sceneIdx];
  const sceneMap = AppState.currentSession._sceneMap;
  const lesson = AppState.currentSession._lesson;

  if (opt && opt.next && sceneMap && sceneMap[opt.next]) {
    const nextIdx = lesson.scenes.findIndex(s => s.id === opt.next);
    if (nextIdx >= 0) {
      renderAdventureSceneByIndex(nextIdx, lesson);
      return;
    }
  }
  advanceScene(scene, lesson);
}

/* =========================================================
   Badges System & Milestone Tracking (Per Universe)
   ========================================================= */

const UNIVERSE_BADGES = {
  harrypotter: [
    {
      id: 'hp_merlin',
      title: 'Order of Merlin',
      icon: '⚡',
      description: 'Completed a magical mission at Hogwarts.'
    },
    {
      id: 'hp_spellcaster',
      title: 'Master Wandlore',
      icon: '🪄',
      description: 'Applied spells and wandwork to resolve magical anomalies.'
    },
    {
      id: 'hp_scholar',
      title: 'Hogwarts Prefect',
      icon: '📜',
      description: 'Mastered 2 or more magical academic concepts.'
    },
    {
      id: 'hp_champion',
      title: 'Triwizard Champion',
      icon: '🏆',
      description: 'Earned 300+ Harry Potter knowledge points.'
    }
  ],
  marvel: [
    {
      id: 'marvel_avenger',
      title: 'Avenger Recruited',
      icon: '🛡️',
      description: 'Proved heroic prowess alongside Earth’s Mightiest Heroes.'
    },
    {
      id: 'marvel_tactician',
      title: 'Quantum Strategist',
      icon: '⚛️',
      description: 'Applied physics & technology to resolve high-tech crises.'
    },
    {
      id: 'marvel_scholar',
      title: 'Stark Innovator',
      icon: '🧠',
      description: 'Mastered 2 or more scientific principles in Marvel.'
    },
    {
      id: 'marvel_champion',
      title: 'Infinity Sovereign',
      icon: '👑',
      description: 'Earned 300+ Marvel knowledge points.'
    }
  ],
  space: [
    {
      id: 'space_pioneer',
      title: 'Starfleet Pioneer',
      icon: '🚀',
      description: 'Braved the stellar unknown and charted uncharted systems.'
    },
    {
      id: 'space_navigator',
      title: 'Astro Navigator',
      icon: '🔭',
      description: 'Decoded planetary mechanics and cosmic gravitational anomalies.'
    },
    {
      id: 'space_scholar',
      title: 'Galactic Scholar',
      icon: '🌌',
      description: 'Mastered 2 or more deep space astrophysics concepts.'
    },
    {
      id: 'space_champion',
      title: 'Cosmic Admiral',
      icon: '👑',
      description: 'Earned 300+ Deep Space knowledge points.'
    }
  ],
  anime: [
    {
      id: 'anime_champion',
      title: 'Guild Champion',
      icon: '⚔️',
      description: 'Awakened inner resolve and triumphed in the tournament arena.'
    },
    {
      id: 'anime_spirit',
      title: 'Ki Resonator',
      icon: '🔥',
      description: 'Channeled elemental energy to overcome rival challenges.'
    },
    {
      id: 'anime_scholar',
      title: 'Jutsu Master',
      icon: '📖',
      description: 'Mastered 2 or more battle-tested academic concepts.'
    },
    {
      id: 'anime_legend',
      title: 'Apex Warrior',
      icon: '👑',
      description: 'Earned 300+ Anime knowledge points.'
    }
  ],
  mythology: [
    {
      id: 'myth_sage',
      title: 'Cosmic Sage',
      icon: '🔱',
      description: 'Unlocked ancient wisdom and divine astral mysteries.'
    },
    {
      id: 'myth_wielder',
      title: 'Astra Wielder',
      icon: '⚡',
      description: 'Harnessed sacred mantras to restore universal balance.'
    },
    {
      id: 'myth_scholar',
      title: 'Vedic Scholar',
      icon: '🪷',
      description: 'Mastered 2 or more timeless cosmological truths.'
    },
    {
      id: 'myth_champion',
      title: 'Dharma Sovereign',
      icon: '👑',
      description: 'Earned 300+ Hindu Mythology knowledge points.'
    }
  ],
  pirates: [
    {
      id: 'pirates_legend',
      title: 'Seven Seas Legend',
      icon: '🏴‍☠️',
      description: 'Conquered nautical perils and claimed golden truths.'
    },
    {
      id: 'pirates_navigator',
      title: 'Master Navigator',
      icon: '🧭',
      description: 'Deciphered maritime charts, tidal forces, and sea currents.'
    },
    {
      id: 'pirates_scholar',
      title: 'Cartographer King',
      icon: '🗺️',
      description: 'Mastered 2 or more oceanic science concepts.'
    },
    {
      id: 'pirates_champion',
      title: 'Pirate Sovereign',
      icon: '👑',
      description: 'Earned 300+ Pirates knowledge points.'
    }
  ]
};

// Flattened badge list helper for looking up badge objects by id
function getBadgeDefinition(id, universeKey) {
  const u = universeKey || AppState.currentUniverse;
  if (u && UNIVERSE_BADGES[u]) {
    const found = UNIVERSE_BADGES[u].find(b => b.id === id);
    if (found) return found;
  }
  for (const list of Object.values(UNIVERSE_BADGES)) {
    const found = list.find(b => b.id === id);
    if (found) return found;
  }
  return { id, title: id, icon: '🏆', description: 'Multiverse achievement' };
}

function evaluateBadges(lesson, universeKey) {
  const currentU = universeKey || AppState.currentUniverse || 'harrypotter';
  const uProg = typeof AppState.getUniverseProgress === 'function'
    ? AppState.getUniverseProgress(currentU)
    : AppState.userProgress;
  const currentBadges = uProg.badges || [];
  const hasBadge = (id) => currentBadges.some(b => (typeof b === 'string' ? b === id : b.id === id));
  const roster = UNIVERSE_BADGES[currentU] || [];
  const newBadges = [];

  // Check 1: First adventure in this universe
  if (uProg.adventureHistory.length >= 1 && roster[0] && !hasBadge(roster[0].id)) {
    newBadges.push(roster[0]);
  }

  // Check 2: Tactical decision / spellcraft applied in this adventure
  if (roster[1] && !hasBadge(roster[1].id)) {
    newBadges.push(roster[1]);
  }

  // Check 3: Learned 2 or more concepts in this universe
  if (uProg.learnedConcepts.length >= 2 && roster[2] && !hasBadge(roster[2].id)) {
    newBadges.push(roster[2]);
  }

  // Check 4: Points milestone in this universe (>= 300 points)
  if (uProg.points >= 300 && roster[3] && !hasBadge(roster[3].id)) {
    newBadges.push(roster[3]);
  }

  newBadges.forEach(badge => {
    if (!badge) return;
    if (typeof AppState.addBadge === 'function') {
      AppState.addBadge(badge, currentU);
    } else {
      uProg.badges.push(badge);
    }
    const uName = AppState.universeThemes[currentU]?.name || currentU;
    showToast(`🏆 ${uName} Badge Unlocked: ${badge.title}!`);
  });
}

function finishAdventure(lesson) {
  const currentU = AppState.currentUniverse || 'harrypotter';
  const uProg = typeof AppState.getUniverseProgress === 'function'
    ? AppState.getUniverseProgress(currentU)
    : AppState.userProgress;

  // 1. Record completed adventure in this universe's history
  const missionTitle = lesson.mission?.title || 'Adventure Mission';
  const conceptTitle = lesson.discovery?.title || '';
  uProg.adventureHistory.push({
    title: missionTitle,
    concept: conceptTitle,
    universe: currentU,
    completedAt: new Date().toISOString()
  });

  // 2. Add learned concept strictly to this universe
  if (conceptTitle) {
    if (typeof AppState.addLearnedConcept === 'function') {
      AppState.addLearnedConcept(conceptTitle, currentU);
    } else {
      if (!uProg.learnedConcepts.includes(conceptTitle)) {
        uProg.learnedConcepts.push(conceptTitle);
      }
    }
  }

  // 3. Evaluate and award universe-specific badges
  evaluateBadges(lesson, currentU);

  // 4. Save progress into CharacterStore so adventures count, points, and badges persist for this universe
  if (typeof AppState.saveUniverseProgress === 'function') {
    AppState.saveUniverseProgress();
  }
  if (typeof CharacterStore !== 'undefined' && AppState.character?.name) {
    CharacterStore.save(AppState.character, uProg);
  }

  AppState.currentSession.conceptData = lesson;

  const ending = lesson.ending || {};
  const endText = [ending.text, ending.funnyLine].filter(Boolean).join(' ');

  const flow = document.getElementById('storyBeatsFlow');
  const actArea = document.getElementById('storyActionArea');

  if (endText && flow && actArea) {
    const beatEl = document.createElement('div');
    beatEl.className = 'story-beat story-beat--discovery';
    beatEl.innerHTML = `
      <div class="beat-action-icon">🏆</div>
      <div class="beat-action-body">
        <div class="beat-action-actor" style="color: #ffd700; font-size: 1.1rem; margin-bottom: 0.35rem;">
          Mission Complete!
        </div>
        <div style="font-size: 1rem; line-height: 1.5;">${escapeHtml(endText)}</div>
      </div>
    `;
    flow.appendChild(beatEl);

    actArea.innerHTML = `
      <button class="story-continue-btn story-continue-btn--final" id="finishMissionBtn">
        Unlock Concept & View Rewards ⭐ →
      </button>
    `;
    const btn = document.getElementById('finishMissionBtn');
    if (btn) {
      btn.onclick = () => {
        AppState.navigateTo(AppState.NAVIGATION_STATES.CONCEPT_UNLOCKED);
      };
    }

    const panel = document.getElementById('storyChroniclePanel');
    if (panel) panel.scrollTop = panel.scrollHeight;
  } else {
    AppState.navigateTo(AppState.NAVIGATION_STATES.CONCEPT_UNLOCKED);
  }
}


/* =========================================================
   Character Challenge Screen
   ========================================================= */

function initializeCharacterChallenge() {
  const questionOptions = document.getElementById('questionOptions');
  if (!questionOptions) return;
  
  // Placeholder question options
  const placeholderOptions = [
    'Option A: The correct answer',
    'Option B: A common misconception',
    'Option C: Another possibility',
    'Option D: Final option'
  ];
  
  placeholderOptions.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'question-option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => {
      // Handle answer selection
      const isCorrect = index === 0; // First option is correct
      handleAnswerSelection(btn, isCorrect);
    });
    questionOptions.appendChild(btn);
  });
}

function handleAnswerSelection(button, isCorrect) {
  // Disable all options
  const allOptions = document.querySelectorAll('.question-option-btn');
  allOptions.forEach(opt => {
    opt.disabled = true;
  });
  
  // Show correct/incorrect styling
  if (isCorrect) {
    button.classList.add('correct');
    AppState.addPoints(10);
    showChallengeFeedback(true);
  } else {
    button.classList.add('incorrect');
    AppState.addPoints(-5);
    showChallengeFeedback(false);
  }
  
  // Update points display
  updateChallengePoints();
  
  // After delay, proceed to concept unlock
  setTimeout(() => {
    AppState.navigateTo(AppState.NAVIGATION_STATES.CONCEPT_UNLOCKED);
  }, 2000);
}

function showChallengeFeedback(isCorrect) {
  const feedbackArea = document.getElementById('challengeFeedbackArea');
  if (!feedbackArea) return;
  
  feedbackArea.classList.remove('hidden-element');
  
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackText = document.getElementById('feedbackText');
  const feedbackPoints = document.getElementById('feedbackPoints');
  
  if (feedbackIcon) {
    feedbackIcon.textContent = isCorrect ? '✅' : '❌';
  }
  
  if (feedbackText) {
    feedbackText.textContent = isCorrect ? 'Correct! Well done.' : 'Not quite, but good effort!';
  }
  
  if (feedbackPoints) {
    feedbackPoints.textContent = isCorrect ? '+10 points' : '-5 points';
  }

  if (window.VoiceEngine && typeof window.VoiceEngine.speakQuizFeedback === 'function') {
    window.VoiceEngine.speakQuizFeedback(isCorrect, isCorrect ? 'Well done!' : 'Not quite, but good effort!', feedbackArea);
  }
}

function updateChallengePoints() {
  const challengePoints = document.getElementById('challengePoints');
  if (challengePoints) {
    challengePoints.textContent = AppState.userProgress.points;
  }
}

/* =========================================================
   Concept Unlocked Screen
   ========================================================= */

function initializeConceptUnlocked() {
  const nextAdventureBtn  = document.getElementById('nextAdventureBtn');
  const learnInDetailBtn  = document.getElementById('learnInDetailBtn');
  const conceptBackUniverseBtn = document.getElementById('conceptBackUniverseBtn');
  const conceptViewHubBtn = document.getElementById('conceptViewHubBtn');

  if (nextAdventureBtn) {
    nextAdventureBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.MISSION_SELECTION);
    });
  }

  if (learnInDetailBtn) {
    learnInDetailBtn.addEventListener('click', () => {
      const lesson = AppState.currentSession.conceptData;
      if (lesson) renderLearnInDetail(lesson);
      AppState.navigateTo(AppState.NAVIGATION_STATES.LEARN_IN_DETAIL);
    });
  }

  if (conceptViewHubBtn) {
    conceptViewHubBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.HUB);
    });
  }

  if (conceptBackUniverseBtn) {
    conceptBackUniverseBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.UNIVERSE_SELECTION);
    });
  }
}

function populateConceptUnlocked(lesson) {
  if (!lesson) return;
  const currentU = AppState.currentUniverse || 'harrypotter';
  const uName = AppState.universeThemes[currentU]?.name || 'Universe';

  // Award knowledge points strictly to this universe
  AppState.addPoints(100, currentU);
  evaluateBadges(lesson, currentU);

  const uProg = typeof AppState.getUniverseProgress === 'function'
    ? AppState.getUniverseProgress(currentU)
    : AppState.userProgress;
  if (typeof AppState.saveUniverseProgress === 'function') {
    AppState.saveUniverseProgress();
  }
  if (typeof CharacterStore !== 'undefined' && AppState.character?.name) {
    CharacterStore.save(AppState.character, uProg);
  }

  // Save full concept into Multiverse Codex Store
  if (typeof CodexStore !== 'undefined' && typeof CodexStore.saveConcept === 'function') {
    CodexStore.saveConcept(lesson, currentU);
  }

  // Sound Effect
  if (window.VoiceEngine && typeof window.VoiceEngine.playSfx === 'function') {
    window.VoiceEngine.playSfx('badge');
  }

  const d = lesson.discovery || {};
  const title = document.getElementById('conceptTitle');
  const short = document.getElementById('conceptShortExplanation');
  const conn  = document.getElementById('adventureConnectionText');
  const rewardPoints = document.getElementById('rewardPoints');
  if (title) title.textContent = d.title || 'Key Concept';
  if (short) short.textContent = d.text || '';
  if (conn) {
    const mission = lesson.mission || {};
    conn.textContent = mission.context
      ? `This concept resolved: ${mission.context}`
      : (d.text ? `You used this knowledge during the adventure.` : '');
  }
  // Update reward badge display
  if (rewardPoints) rewardPoints.textContent = `+100 ${uName} Points`;

  // Render Interactive Canvas Visualizer Widget
  const canvasEl = document.getElementById('conceptCanvas');
  if (canvasEl && typeof initConceptVisualizerCanvas === 'function') {
    setTimeout(() => {
      initConceptVisualizerCanvas(canvasEl, d.title || 'Key Concept', currentU);
    }, 120);
  }
}

/* =========================================================
   Learn in Detail Screen
   ========================================================= */

function initializeLearnInDetail() {
  const backToConceptBtn    = document.getElementById('backToConceptBtn');
  const completeLearningBtn = document.getElementById('completeLearningBtn');

  if (backToConceptBtn) {
    backToConceptBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.CONCEPT_UNLOCKED);
    });
  }

  if (completeLearningBtn) {
    completeLearningBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.HUB);
    });
  }
}

function renderLearnInDetail(lesson) {
  if (!lesson) return;
  const det = lesson.details || {};
  const disc = lesson.discovery || {};

  const subtitle = document.getElementById('learnDetailSubtitle');
  const expDiv   = document.getElementById('detailedExplanation');
  const advDiv   = document.getElementById('adventureConnections');
  const rwDiv    = document.getElementById('realWorldExamples');
  const pqDiv    = document.getElementById('practiceQuestions');
  const quizDiv  = document.getElementById('miniQuiz');
  const takeawayDiv = document.getElementById('conceptTakeawayCard');

  const mentor = getUniverseMentor(AppState.currentUniverse);

  if (subtitle) subtitle.textContent = disc.title || 'Concept';

  if (expDiv && (det.explanation || disc.text)) {
    const textToExplain = Array.isArray(det.explanation) ? det.explanation.join(' ') : (disc.text || '');
    expDiv.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.6rem;">
        <span style="font-weight:700; color: var(--universe-accent, #ffd700);">${mentor.icon} ${escapeHtml(mentor.explanationTitle)}</span>
        <button type="button" class="voice-line-btn voice-concept-btn" id="speakConceptExpBtn">${mentor.icon} ${escapeHtml(mentor.buttonText)}</button>
      </div>
      ${Array.isArray(det.explanation) ? det.explanation.map(p => `<p>${escapeHtml(p)}</p>`).join('') : `<p>${escapeHtml(disc.text)}</p>`}
    `;
    const btn = expDiv.querySelector('#speakConceptExpBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (window.VoiceEngine && typeof window.VoiceEngine.speakKeyConcept === 'function') {
          window.VoiceEngine.speakKeyConcept(textToExplain, AppState.currentUniverse);
        }
      });
    }
  }

  if (advDiv && lesson.mission) {
    const m = lesson.mission;
    advDiv.innerHTML = `<p>You applied <strong>${escapeHtml(disc.title || 'this concept')}</strong> in ${escapeHtml(m.context || 'the adventure')}.</p>`;
  }

  if (rwDiv && det.realWorld) {
    rwDiv.innerHTML = det.realWorld.map(p => `<p>${escapeHtml(p)}</p>`).join('');
  }

  if (pqDiv && det.practice) {
    const pr = det.practice;
    pqDiv.innerHTML = `
      <p class="practice-question">${escapeHtml(pr.question)}</p>
      <div class="practice-options">${(pr.options || []).map((o, i) => `
        <button class="practice-option-btn" data-idx="${i}">${escapeHtml(o)}</button>
      `).join('')}</div>
      <p class="practice-explain hidden-element" id="practiceExplain">${escapeHtml(pr.explain || '')}</p>`;
    const btns = pqDiv.querySelectorAll('.practice-option-btn');
    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        btns.forEach(b => { b.disabled = true; });
        const isCorrect = pr.answer === i || pr.answer === String(i);
        btn.classList.add(isCorrect ? 'practice-correct' : 'practice-incorrect');
        if (!isCorrect && btns[pr.answer]) btns[pr.answer].classList.add('practice-correct');
        const ex = document.getElementById('practiceExplain');
        if (ex) ex.classList.remove('hidden-element');

        if (window.VoiceEngine && typeof window.VoiceEngine.speakQuizFeedback === 'function') {
          window.VoiceEngine.speakQuizFeedback(isCorrect, pr.explain, btn);
        }
      });
    });
  }

  // Populate takeaway card with explanation bullets if present
  if (takeawayDiv && det.explanation) {
    const takeawayText = det.explanation.join(' ');
    takeawayDiv.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.6rem; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <span style="font-weight:700; color: var(--universe-accent, #ffd700);">${mentor.icon} ${escapeHtml(mentor.summaryTitle)}</span>
        <button type="button" class="voice-line-btn voice-concept-btn" id="speakConceptTakeawayBtn">${mentor.icon} ${escapeHtml(mentor.buttonText)}</button>
      </div>
      ${det.explanation.map(p => `<div class="takeaway-bullet"><span class="takeaway-icon">✅</span>${escapeHtml(p)}</div>`).join('')}
    `;
    const btn = takeawayDiv.querySelector('#speakConceptTakeawayBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (window.VoiceEngine && typeof window.VoiceEngine.speakKeyConcept === 'function') {
          window.VoiceEngine.speakKeyConcept(takeawayText, AppState.currentUniverse);
        }
      });
    }
  }
}

/* =========================================================
   Hub Screen (Universe-Specific Tracking & Switcher)
   ========================================================= */

let currentHubUniverse = null;

function renderHubUniverseTabs() {
  const tabsContainer = document.getElementById('hubUniverseTabs');
  if (!tabsContainer) return;

  const universes = [
    { key: 'harrypotter', name: 'Harry Potter', icon: '🧙‍♂️' },
    { key: 'marvel', name: 'Marvel', icon: '⚡' },
    { key: 'space', name: 'Deep Space', icon: '🚀' },
    { key: 'anime', name: 'Anime', icon: '⚔️' },
    { key: 'mythology', name: 'Hindu Mythology', icon: '🕉️' },
    { key: 'pirates', name: 'Pirates', icon: '🏴‍☠️' }
  ];

  const active = currentHubUniverse || AppState.currentUniverse || 'harrypotter';

  tabsContainer.innerHTML = universes.map(u => {
    const prog = typeof AppState.getUniverseProgress === 'function'
      ? AppState.getUniverseProgress(u.key)
      : { points: 0 };
    const pts = prog.points || 0;
    const isAct = u.key === active;
    return `
      <button class="hub-universe-tab${isAct ? ' active' : ''}" data-universe="${u.key}">
        <span>${u.icon} ${u.name}</span>
        ${pts > 0 ? `<span class="tab-mini-pts">${pts} pts</span>` : ''}
      </button>
    `;
  }).join('');

  tabsContainer.querySelectorAll('.hub-universe-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const uKey = btn.dataset.universe;
      currentHubUniverse = uKey;
      renderHubUniverseTabs();
      updateHubDisplay(uKey);
    });
  });
}

function initializeHub() {
  const hubNewMissionBtn = document.getElementById('hubNewMissionBtn');
  const hubSwitchUniverseBtn = document.getElementById('hubSwitchUniverseBtn');
  const hubContinueAdventureBtn = document.getElementById('hubContinueAdventureBtn');
  const switchCharacterBtn = document.getElementById('switchCharacterBtn');
  const createNewCharacterBtn = document.getElementById('createNewCharacterBtn');
  
  currentHubUniverse = AppState.currentUniverse || 'harrypotter';
  renderHubUniverseTabs();
  updateHubDisplay(currentHubUniverse);
  
  // New mission button
  if (hubNewMissionBtn) {
    hubNewMissionBtn.addEventListener('click', () => {
      if (currentHubUniverse && currentHubUniverse !== AppState.currentUniverse) {
        AppState.setUniverse(currentHubUniverse);
      }
      AppState.navigateTo(AppState.NAVIGATION_STATES.MISSION_SELECTION);
    });
  }
  
  // Switch universe button
  if (hubSwitchUniverseBtn) {
    hubSwitchUniverseBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.UNIVERSE_SELECTION);
    });
  }
  
  // Continue adventure button
  if (hubContinueAdventureBtn) {
    hubContinueAdventureBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.CINEMATIC_ADVENTURE);
    });
  }
  
  // Switch character button
  if (switchCharacterBtn) {
    switchCharacterBtn.addEventListener('click', () => {
      AppState.navigateTo(AppState.NAVIGATION_STATES.CHARACTER_CREATION);
    });
  }
  
  // Create new character button
  if (createNewCharacterBtn) {
    createNewCharacterBtn.addEventListener('click', () => {
      AppState.resetCharacter();
      AppState.navigateTo(AppState.NAVIGATION_STATES.CHARACTER_CREATION);
    });
  }
}

function updateHubDisplay(selectedUniverse) {
  const viewingUniverse = selectedUniverse || currentHubUniverse || AppState.currentUniverse || 'harrypotter';
  currentHubUniverse = viewingUniverse;
  const uProg = typeof AppState.getUniverseProgress === 'function'
    ? AppState.getUniverseProgress(viewingUniverse)
    : AppState.userProgress;
  const uTheme = AppState.universeThemes[viewingUniverse];
  const uName = uTheme?.name || viewingUniverse;

  const hubCharacterAvatar = document.getElementById('hubCharacterAvatar');
  const hubCharacterName = document.getElementById('hubCharacterName');
  const hubCharacterUniverse = document.getElementById('hubCharacterUniverse');
  const hubPoints = document.getElementById('hubPoints');
  const hubLargePoints = document.getElementById('hubLargePoints');
  const hubAdventures = document.getElementById('hubAdventures');
  const hubProgressTitle = document.getElementById('hubProgressTitle');
  const hubPointsUniverseLabel = document.getElementById('hubPointsUniverseLabel');
  const hubBadgesTitle = document.getElementById('hubBadgesTitle');
  const hubConceptsTitle = document.getElementById('hubConceptsTitle');

  if (hubCharacterAvatar) {
    hubCharacterAvatar.textContent = AppState.character?.appearance?.avatar || '👤';
  }
  
  if (hubCharacterName) {
    hubCharacterName.textContent = AppState.character?.name || 'Hero Name';
  }
  
  if (hubCharacterUniverse) {
    hubCharacterUniverse.textContent = AppState.universeThemes[AppState.currentUniverse]?.name || 'Universe';
  }
  
  // Character profile card points & adventures for character's own universe
  const charUniverse = AppState.character?.universe || AppState.currentUniverse || 'harrypotter';
  const charProg = typeof AppState.getUniverseProgress === 'function'
    ? AppState.getUniverseProgress(charUniverse)
    : AppState.userProgress;

  if (hubPoints) {
    hubPoints.textContent = charProg.points || 0;
  }
  
  if (hubAdventures) {
    hubAdventures.textContent = charProg.adventureHistory ? charProg.adventureHistory.length : 0;
  }
  
  // Progress card for viewing universe (completely separate!)
  if (hubProgressTitle) {
    hubProgressTitle.textContent = `${uName} Progress`;
  }

  if (hubLargePoints) {
    hubLargePoints.textContent = uProg.points || 0;
  }

  if (hubPointsUniverseLabel) {
    hubPointsUniverseLabel.textContent = `${uName} pts`;
  }

  if (hubBadgesTitle) {
    hubBadgesTitle.textContent = `${uName} Badges`;
  }

  if (hubConceptsTitle) {
    hubConceptsTitle.textContent = `${uName} Concepts`;
  }
  
  // Update learned concepts and badges for viewing universe
  updateLearnedConceptsList(viewingUniverse);
  updateBadgesDisplay(viewingUniverse);
  renderHubUniverseTabs();
}

function updateBadgesDisplay(universeKey) {
  const grid = document.getElementById('badgesGrid');
  if (!grid) return;

  const u = universeKey || currentHubUniverse || AppState.currentUniverse || 'harrypotter';
  const uProg = typeof AppState.getUniverseProgress === 'function'
    ? AppState.getUniverseProgress(u)
    : AppState.userProgress;
  const badges = uProg.badges || [];
  const uTheme = AppState.universeThemes[u];
  const uName = uTheme?.name || u;

  if (!badges.length) {
    grid.innerHTML = `<div class="badge-placeholder">🏆 No ${escapeHtml(uName)} badges earned yet — embark on an adventure!</div>`;
    return;
  }

  grid.innerHTML = badges.map(badge => {
    const b = typeof badge === 'string'
      ? getBadgeDefinition(badge, u)
      : badge;
    return `
      <div class="badge-item glass" title="${escapeHtml(b.description || b.title || '')}">
        <span class="badge-icon">${b.icon || '🏆'}</span>
        <span class="badge-name">${escapeHtml(b.title || '')}</span>
      </div>
    `;
  }).join('');
}

function updateLearnedConceptsList(universeKey) {
  const conceptsList = document.getElementById('conceptsList');
  if (!conceptsList) return;
  
  const u = universeKey || currentHubUniverse || AppState.currentUniverse || 'harrypotter';
  const uProg = typeof AppState.getUniverseProgress === 'function'
    ? AppState.getUniverseProgress(u)
    : AppState.userProgress;
  const concepts = uProg.learnedConcepts || [];
  const uName = AppState.universeThemes[u]?.name || u;

  if (concepts.length === 0) {
    conceptsList.innerHTML = `<div class="concept-placeholder">No concepts learned in ${escapeHtml(uName)} yet</div>`;
  } else {
    conceptsList.innerHTML = concepts
      .map(concept => `<div class="concept-item glass">${escapeHtml(concept)}</div>`)
      .join('');
  }
}

/* =========================================================
   Toast Notification System (Preserved from original)
   ========================================================= */

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('is-visible');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3200);
}

/* =========================================================
   Multiverse Codex Storage & Concept Archives
   ========================================================= */

const CodexStore = {
  KEY: 'cv.codex.v1',

  read() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch (_) { return []; }
  },

  write(list) {
    try { localStorage.setItem(this.KEY, JSON.stringify(list)); }
    catch (_) {}
  },

  saveConcept(lesson, universeKey) {
    if (!lesson || !lesson.discovery || !lesson.discovery.title) return;
    const list = this.read();
    const title = lesson.discovery.title;
    const uKey = universeKey || AppState.currentUniverse || 'harrypotter';
    const key = uKey + '|' + title.trim().toLowerCase();
    const existingIndex = list.findIndex(item => (item.universe + '|' + item.title.trim().toLowerCase()) === key);

    const item = {
      id: existingIndex >= 0 ? list[existingIndex].id : 'concept_' + Date.now().toString(36),
      title: title.trim(),
      universe: uKey,
      summary: lesson.discovery.text || '',
      explanation: Array.isArray(lesson.details?.explanation) ? lesson.details.explanation.join(' ') : (lesson.details?.explanation || ''),
      realWorld: Array.isArray(lesson.details?.realWorld) ? lesson.details.realWorld : [],
      unlockedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = item;
    } else {
      list.unshift(item);
    }
    this.write(list);
  },

  getConcepts(universeFilter) {
    const list = this.read();
    if (!universeFilter || universeFilter === 'all') return list;
    return list.filter(item => item.universe === universeFilter);
  }
};

/* =========================================================
   Interactive Concept Visualizer Widget Canvas Engine
   ========================================================= */

function initConceptVisualizerCanvas(canvasEl, conceptTitle, themeKey) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return;

  // Cancel any previous animation loop running on this canvas
  if (canvasEl._animFrameId) {
    cancelAnimationFrame(canvasEl._animFrameId);
    canvasEl._animFrameId = null;
  }

  const rect = canvasEl.getBoundingClientRect();
  canvasEl.width = rect.width || 600;
  canvasEl.height = rect.height || 220;

  const width = canvasEl.width;
  const height = canvasEl.height;

  // Normalize universe theme key
  const tk = (themeKey || '').toLowerCase();
  let theme = 'harrypotter';
  if (tk.includes('marvel')) theme = 'marvel';
  else if (tk.includes('space')) theme = 'space';
  else if (tk.includes('anime')) theme = 'anime';
  else if (tk.includes('myth')) theme = 'mythology';
  else if (tk.includes('pirate')) theme = 'pirates';

  const paletteMap = {
    harrypotter: ['#7c5cff', '#ffd700', '#9b7edd', '#00f2fe', '#e0aaff'],
    marvel: ['#00f2fe', '#ff4d5e', '#ffd700', '#3a86ff', '#ffffff'],
    space: ['#00ffff', '#3fd4ff', '#7c5cff', '#ff6b35', '#b5179e'],
    mythology: ['#ff9933', '#ffd166', '#4ade80', '#e0aaff', '#ffd700'],
    pirates: ['#ffb340', '#ffc566', '#00f2fe', '#8b4513', '#ffffff'],
    anime: ['#ff6fd8', '#00ffff', '#ffd700', '#ff4d5e', '#a855f7']
  };

  const palette = paletteMap[theme] || paletteMap.harrypotter;

  // Mouse tracking
  let mouseX = width / 2;
  let mouseY = height / 2;
  let isHovered = false;

  canvasEl.onmousemove = (e) => {
    const r = canvasEl.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
    isHovered = true;
  };

  canvasEl.onmouseleave = () => {
    isHovered = false;
  };

  // Spark burst effect on click
  let bursts = [];
  canvasEl.onclick = () => {
    if (window.VoiceEngine && typeof window.VoiceEngine.playSfx === 'function') {
      window.VoiceEngine.playSfx('choice');
    }
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 4 + 1.5;
      bursts.push({
        x: mouseX,
        y: mouseY,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: Math.random() * 4 + 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 1.0
      });
    }
  };

  // Build theme-specific particle structures
  let particles = [];
  const centerX = width / 2;
  const centerY = height / 2;

  if (theme === 'harrypotter') {
    // 45 Magic Rune Sparkles & Spell Dust
    for (let i = 0; i < 45; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 20 + Math.random() * 85,
        speed: (Math.random() * 0.02 + 0.005) * (i % 2 === 0 ? 1 : -1),
        size: Math.random() * 3 + 1,
        color: palette[Math.floor(Math.random() * palette.length)],
        pulse: Math.random() * Math.PI,
        sparkle: Math.random() > 0.3
      });
    }
  } else if (theme === 'marvel') {
    // 40 Cyber Tech Data Nodes
    for (let i = 0; i < 40; i++) {
      particles.push({
        dist: 30 + Math.random() * 80,
        angle: (i / 40) * Math.PI * 2,
        speed: (Math.random() * 0.015 + 0.008) * (i % 2 === 0 ? 1 : -1),
        size: Math.random() * 3.5 + 1.5,
        color: palette[i % palette.length],
        pulse: Math.random() * Math.PI
      });
    }
  } else if (theme === 'space') {
    // 50 Spiral Galaxy Stars & Orbiters
    for (let i = 0; i < 50; i++) {
      const arm = i % 2;
      const armAngle = arm * Math.PI;
      const distance = 15 + Math.random() * 85;
      particles.push({
        dist: distance,
        angle: armAngle + (distance / 85) * Math.PI * 1.8 + Math.random() * 0.4,
        speed: (0.015 + (1 / (distance + 10)) * 0.5),
        size: Math.random() * 2.8 + 1,
        color: palette[Math.floor(Math.random() * palette.length)],
        pulse: Math.random() * Math.PI
      });
    }
  } else if (theme === 'mythology') {
    // 35 Sacred Lotus Orbs & Solar Sparks
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: centerX + (Math.random() - 0.5) * 140,
        y: centerY + (Math.random() - 0.5) * 80,
        vy: -(Math.random() * 0.8 + 0.3),
        vx: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3.5 + 1.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        pulse: Math.random() * Math.PI,
        baseY: centerY + 40
      });
    }
  } else if (theme === 'pirates') {
    // 40 Wave Glints & Foam Drops
    for (let i = 0; i < 40; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 25 + Math.random() * 80,
        speed: Math.random() * 0.018 + 0.006,
        size: Math.random() * 3 + 1,
        color: palette[Math.floor(Math.random() * palette.length)],
        pulse: Math.random() * Math.PI,
        bob: Math.random() * Math.PI * 2
      });
    }
  } else if (theme === 'anime') {
    // 40 Sakura Petals & Energy Sparks
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: Math.random() * 1.2 + 0.5,
        speedX: Math.random() * 0.8 - 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.04 - 0.02,
        size: Math.random() * 4 + 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        isSakura: i < 22
      });
    }
  }

  let startTime = Date.now();

  function render() {
    ctx.clearRect(0, 0, width, height);

    const time = (Date.now() - startTime) * 0.002;
    const cx = width / 2;
    const cy = height / 2;

    // Render Click Bursts
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life -= 0.03;
      if (b.life <= 0) {
        bursts.splice(i, 1);
        continue;
      }
      ctx.fillStyle = b.color;
      ctx.globalAlpha = b.life;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size * b.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // ==========================================
    // 1. HARRY POTTER: Golden Snitch & Rune Rings
    // ==========================================
    if (theme === 'harrypotter') {
      // Rotating magic rune rings
      ctx.save();
      ctx.translate(cx, cy);

      // Ring 1 (Inner clockwise)
      ctx.strokeStyle = 'rgba(124, 92, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 18]);
      ctx.beginPath();
      ctx.arc(0, 0, 68, time * 0.5, time * 0.5 + Math.PI * 2);
      ctx.stroke();

      // Ring 2 (Outer golden counter-clockwise)
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 88, -time * 0.4, -time * 0.4 + Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Golden Snitch Center
      const wingFlap = Math.sin(time * 14) * 12;

      // Golden Glow
      const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 55);
      grad.addColorStop(0, '#ffd700');
      grad.addColorStop(0.5, 'rgba(255, 180, 0, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();

      // Fluttering Wings (Left & Right)
      ctx.save();
      ctx.translate(cx, cy);

      // Left Wing
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.bezierCurveTo(-35, -25 + wingFlap, -60, -10 + wingFlap, -50, 5);
      ctx.bezierCurveTo(-35, 0, -20, -2, -10, -2);
      ctx.fill();

      // Right Wing
      ctx.beginPath();
      ctx.moveTo(10, -2);
      ctx.bezierCurveTo(35, -25 + wingFlap, 60, -10 + wingFlap, 50, 5);
      ctx.bezierCurveTo(35, 0, 20, -2, 10, -2);
      ctx.fill();

      // Snitch Core Sphere
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Metallic highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -4, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Render Spell Particles
      particles.forEach(p => {
        p.angle += p.speed;
        p.pulse += 0.05;
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * (p.radius * 0.55);

        ctx.fillStyle = p.color;
        ctx.beginPath();
        const sz = p.size + (p.sparkle ? Math.sin(p.pulse) * 1.2 : 0);
        ctx.arc(px, py, Math.max(0.5, sz), 0, Math.PI * 2);
        ctx.fill();

        if (isHovered && Math.hypot(px - mouseX, py - mouseY) < 55) {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      });
    }

    // ==========================================
    // 2. MARVEL: Stark Arc Reactor & Tech HUD
    // ==========================================
    else if (theme === 'marvel') {
      // Tech Grid Radial Glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 75);
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.8)');
      grad.addColorStop(0.5, 'rgba(0, 150, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);

      // Rotating Outer Target Ring with 12 ticks
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 70, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + time * 0.6;
        const x1 = Math.cos(a) * 64;
        const y1 = Math.sin(a) * 64;
        const x2 = Math.cos(a) * 76;
        const y2 = Math.sin(a) * 76;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Inner Arc Reactor Triangular Core
      ctx.rotate(-time * 0.8);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const r = 24;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Pulsing Center Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 8 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Cyber Data Particles
      particles.forEach(p => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * (p.dist * 0.6);

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Hover Crosshair HUD Target
      if (isHovered) {
        ctx.strokeStyle = '#ff4d5e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 14, 0, Math.PI * 2);
        ctx.moveTo(mouseX - 20, mouseY); ctx.lineTo(mouseX + 20, mouseY);
        ctx.moveTo(mouseX, mouseY - 20); ctx.lineTo(mouseX, mouseY + 20);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    }

    // ==========================================
    // 3. SPACE: Cosmic Singularity & Spiral Galaxy
    // ==========================================
    else if (theme === 'space') {
      // Black Hole Event Horizon Core
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 70);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.3, '#10002b');
      grad.addColorStop(0.65, 'rgba(0, 255, 255, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.fill();

      // Singularity Ring
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Swirling Spiral Galaxy Particles
      particles.forEach(p => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * (p.dist * 0.45);

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Gravitational Lensing on Hover
        if (isHovered) {
          const d = Math.hypot(px - mouseX, py - mouseY);
          if (d < 65) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }
      });
    }

    // ==========================================
    // 4. MYTHOLOGY: Sacred Golden Lotus / Chakra
    // ==========================================
    else if (theme === 'mythology') {
      // Golden Sunburst Background Glow
      const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 75);
      grad.addColorStop(0, '#ffd166');
      grad.addColorStop(0.5, 'rgba(255, 153, 51, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.fill();

      // 12 Golden Lotus Petals
      const petalCount = 12;
      const lotusScale = 1 + Math.sin(time * 2) * 0.06;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.2);

      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        ctx.fillStyle = (i % 2 === 0) ? '#ff9933' : '#ffd166';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(15 * lotusScale, 25 * lotusScale, 0, 48 * lotusScale);
        ctx.quadraticCurveTo(-15 * lotusScale, 25 * lotusScale, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      // Lotus Center Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ascending Temple Sparks
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(time + p.pulse) * 0.3;

        if (p.y < cy - 90) {
          p.y = p.baseY;
          p.x = cx + (Math.random() - 0.5) * 120;
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ==========================================
    // 5. PIRATES: Compass Rose & Ocean Wave Needle
    // ==========================================
    else if (theme === 'pirates') {
      // Ocean Blue Glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 75);
      grad.addColorStop(0, 'rgba(255, 179, 64, 0.7)');
      grad.addColorStop(0.5, 'rgba(0, 242, 254, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.fill();

      // Ocean Wave Ripples
      for (let r = 0; r < 3; r++) {
        const waveR = ((time * 30 + r * 25) % 85) + 10;
        const alpha = Math.max(0, 1 - waveR / 90);
        ctx.strokeStyle = `rgba(0, 242, 254, ${alpha * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Compass Needle Angle (Targeting Mouse)
      const targetAngle = Math.atan2(mouseY - cy, mouseX - cx);

      ctx.save();
      ctx.translate(cx, cy);

      // 8-Point Compass Rose Dial
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const len = (i % 2 === 0) ? 42 : 26;
        ctx.strokeStyle = '#ffb340';
        ctx.lineWidth = (i % 2 === 0) ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }

      // Rotating Magnetic Needle
      ctx.rotate(targetAngle);

      // Red North Pointer
      ctx.fillStyle = '#ff4d5e';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(35, 0);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fill();

      // Brass South Pointer
      ctx.fillStyle = '#ffb340';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(-35, 0);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Floating Gold & Water Glints
      particles.forEach(p => {
        p.angle += p.speed;
        p.bob += 0.05;
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * (p.radius * 0.5) + Math.sin(p.bob) * 3;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ==========================================
    // 6. ANIME: Shonen Ki Aura & Sakura Petals
    // ==========================================
    else if (theme === 'anime') {
      // High Speed Energy Aura Burst Core
      const auraPulse = Math.sin(time * 10) * 8;
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 60 + auraPulse);
      grad.addColorStop(0, '#ff6fd8');
      grad.addColorStop(0.4, 'rgba(0, 255, 255, 0.5)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 60 + auraPulse, 0, Math.PI * 2);
      ctx.fill();

      // Jagged Ki Spikes Around Core
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 1.5);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r = (i % 2 === 0) ? 45 + Math.sin(time * 8 + i) * 10 : 25;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Hover Electric Lightning Snap
      if (isHovered) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const midX = (cx + mouseX) / 2 + (Math.random() - 0.5) * 30;
        const midY = (cy + mouseY) / 2 + (Math.random() - 0.5) * 30;
        ctx.lineTo(midX, midY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }

      // Sakura Petals & Energy Sparks
      particles.forEach(p => {
        if (p.isSakura) {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(time + p.rotation) * 0.5;
          p.rotation += p.rotSpeed;

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = '#ff6fd8';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          p.y -= 1.2;
          if (p.y < 0) p.y = height;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Common Text Overlay on Central Core
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(conceptTitle || 'Concept Matrix', cx, cy);
    ctx.shadowBlur = 0;

    canvasEl._animFrameId = requestAnimationFrame(render);
  }

  render();
}

/* =========================================================
   Multiverse Codex & Badges Modal Manager
   ========================================================= */

function initializeCodexModal() {
  const openBtn = document.getElementById('openCodexBtn');
  const closeBtn = document.getElementById('closeCodexBtn');
  const overlay = document.getElementById('codexModalOverlay');
  const tabBadgesBtn = document.getElementById('tabBadgesBtn');
  const tabConceptsBtn = document.getElementById('tabConceptsBtn');
  const badgesTab = document.getElementById('codexBadgesTab');
  const conceptsTab = document.getElementById('codexConceptsTab');
  const closeConceptDetailBtn = document.getElementById('closeConceptDetailBtn');
  const conceptDetailOverlay = document.getElementById('conceptDetailOverlay');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openCodexModal();
    });
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.add('hidden-element');
      overlay.setAttribute('aria-hidden', 'true');
    });
  }

  if (closeConceptDetailBtn && conceptDetailOverlay) {
    closeConceptDetailBtn.addEventListener('click', () => {
      conceptDetailOverlay.classList.add('hidden-element');
      conceptDetailOverlay.setAttribute('aria-hidden', 'true');
    });
  }

  if (tabBadgesBtn && tabConceptsBtn) {
    tabBadgesBtn.addEventListener('click', () => {
      tabBadgesBtn.classList.add('active');
      tabConceptsBtn.classList.remove('active');
      badgesTab.classList.remove('hidden-element');
      conceptsTab.classList.add('hidden-element');
    });

    tabConceptsBtn.addEventListener('click', () => {
      tabConceptsBtn.classList.add('active');
      tabBadgesBtn.classList.remove('active');
      conceptsTab.classList.remove('hidden-element');
      badgesTab.classList.add('hidden-element');
    });
  }

  // Filter pills for badges
  const badgeFilterContainer = document.getElementById('badgeUniverseFilter');
  if (badgeFilterContainer) {
    badgeFilterContainer.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        badgeFilterContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter || 'all';
        renderCodexBadges(filter);
      });
    });
  }

  // Filter pills for concepts
  const conceptFilterContainer = document.getElementById('conceptUniverseFilter');
  if (conceptFilterContainer) {
    conceptFilterContainer.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        conceptFilterContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter || 'all';
        renderCodexConcepts(filter);
      });
    });
  }
}

function openCodexModal() {
  const overlay = document.getElementById('codexModalOverlay');
  if (!overlay) return;

  if (window.VoiceEngine && typeof window.VoiceEngine.playSfx === 'function') {
    window.VoiceEngine.playSfx('choice');
  }

  // Calculate totals
  const allConcepts = CodexStore.read();
  let totalXP = 0;
  let unlockedBadgesCount = 0;
  const universes = ['harrypotter', 'marvel', 'space', 'anime', 'mythology', 'pirates'];

  universes.forEach(u => {
    const up = AppState.getUniverseProgress(u);
    totalXP += (up.points || 0);
    unlockedBadgesCount += (up.badges || []).length;
  });

  const totalConceptsEl = document.getElementById('codexTotalConcepts');
  const totalBadgesEl = document.getElementById('codexTotalBadges');
  const totalXPEl = document.getElementById('codexTotalXP');

  if (totalConceptsEl) totalConceptsEl.textContent = allConcepts.length;
  if (totalBadgesEl) totalBadgesEl.textContent = `${unlockedBadgesCount}/24`;
  if (totalXPEl) totalXPEl.textContent = totalXP;

  renderCodexBadges('all');
  renderCodexConcepts('all');

  overlay.classList.remove('hidden-element');
  overlay.setAttribute('aria-hidden', 'false');
}

function renderCodexBadges(filterKey) {
  const grid = document.getElementById('codexBadgesGrid');
  if (!grid) return;

  const universes = filterKey === 'all' ? ['harrypotter', 'marvel', 'space', 'anime', 'mythology', 'pirates'] : [filterKey];
  let html = '';

  universes.forEach(u => {
    const roster = UNIVERSE_BADGES[u] || [];
    const uProg = AppState.getUniverseProgress(u);
    const userBadges = uProg.badges || [];
    const hasBadge = (id) => userBadges.some(b => (typeof b === 'string' ? b === id : b.id === id));

    roster.forEach(b => {
      const unlocked = hasBadge(b.id);
      html += `
        <div class="badge-card ${unlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon">${b.icon || '🏆'}</div>
          <div class="badge-info">
            <div class="badge-info-title">${escapeHtml(b.title)}</div>
            <div class="badge-info-desc">${escapeHtml(b.description)}</div>
          </div>
        </div>
      `;
    });
  });

  grid.innerHTML = html || '<div class="concept-placeholder">No badges found</div>';
}

function renderCodexConcepts(filterKey) {
  const grid = document.getElementById('codexConceptsGrid');
  if (!grid) return;

  const concepts = CodexStore.getConcepts(filterKey);

  if (concepts.length === 0) {
    grid.innerHTML = '<div class="concept-placeholder" style="grid-column: 1/-1; text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">No learned concepts recorded yet. Complete missions across universes to fill your Codex!</div>';
    return;
  }

  let html = '';
  concepts.forEach(c => {
    const uName = AppState.universeThemes[c.universe]?.name || c.universe;
    html += `
      <div class="concept-card-item" data-id="${c.id}">
        <span class="concept-card-universe">${escapeHtml(uName)} Universe</span>
        <h4 class="concept-card-title">${escapeHtml(c.title)}</h4>
        <p class="concept-card-snippet">${escapeHtml(c.summary || c.explanation || '')}</p>
      </div>
    `;
  });

  grid.innerHTML = html;

  grid.querySelectorAll('.concept-card-item').forEach(card => {
    card.addEventListener('click', () => {
      const cid = card.dataset.id;
      const found = concepts.find(item => item.id === cid);
      if (found) openConceptDetailPopup(found);
    });
  });
}

function openConceptDetailPopup(concept) {
  const overlay = document.getElementById('conceptDetailOverlay');
  const body = document.getElementById('conceptDetailBody');
  if (!overlay || !body) return;

  const uName = AppState.universeThemes[concept.universe]?.name || concept.universe;
  const mentor = getUniverseMentor(concept.universe);

  body.innerHTML = `
    <span class="codex-eyebrow">${escapeHtml(uName).toUpperCase()} UNIVERSE ARCHIVE</span>
    <h2 class="codex-title" style="margin-bottom: 1rem;">${escapeHtml(concept.title)}</h2>
    
    <div style="margin-bottom: 1.25rem;">
      <h3 style="font-size: 0.95rem; color: var(--universe-accent, #ffd700); margin-bottom: 0.4rem;">💡 Key Summary</h3>
      <p style="font-size: 0.95rem; line-height: 1.5; color: rgba(255,255,255,0.9);">${escapeHtml(concept.summary)}</p>
    </div>

    ${concept.explanation ? `
      <div style="margin-bottom: 1.25rem;">
        <h3 style="font-size: 0.95rem; color: var(--universe-accent, #ffd700); margin-bottom: 0.4rem;">📜 Detailed Explanation</h3>
        <p style="font-size: 0.92rem; line-height: 1.5; color: rgba(255,255,255,0.85);">${escapeHtml(concept.explanation)}</p>
      </div>
    ` : ''}

    ${Array.isArray(concept.realWorld) && concept.realWorld.length > 0 ? `
      <div style="margin-bottom: 1.25rem;">
        <h3 style="font-size: 0.95rem; color: var(--universe-accent, #ffd700); margin-bottom: 0.4rem;">🌍 Real-World Applications</h3>
        <ul style="padding-left: 1.2rem; margin: 0; font-size: 0.9rem; color: rgba(255,255,255,0.85); display: flex; flex-direction: column; gap: 0.35rem;">
          ${concept.realWorld.map(rw => `<li>${escapeHtml(rw)}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div style="display:flex; justify-content:flex-end; margin-top: 1.5rem;">
      <button type="button" class="action-btn primary-action" id="detailSpeakBtn" style="padding: 0.5rem 1.2rem;">
        ${mentor.icon} Listen to ${escapeHtml(mentor.name)}
      </button>
    </div>
  `;

  const speakBtn = body.querySelector('#detailSpeakBtn');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      if (window.VoiceEngine && typeof window.VoiceEngine.speakKeyConcept === 'function') {
        window.VoiceEngine.speakKeyConcept(concept.title, concept.explanation || concept.summary);
      }
    });
  }

  overlay.classList.remove('hidden-element');
  overlay.setAttribute('aria-hidden', 'false');
}

if (typeof window !== 'undefined') {
  window.CodexStore = CodexStore;
}