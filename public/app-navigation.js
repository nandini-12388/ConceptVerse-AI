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
    
    // Listen for state changes
    document.addEventListener('stateChange', handleStateChange);
    
    // Show initial screen
    showScreen('universeSelectionScreen');
    
    console.log("ConceptVerse app initialized successfully");
  } catch (error) {
    console.error("Error initializing app:", error);
  }
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

  // Refresh screen-specific data each time we enter a screen
  if (newState === 'CHARACTER_CREATION') { initializeCharacterOptions(); renderSavedCharacters(); }
  if (newState === 'MISSION_SELECTION') updateCharacterInfoBar();
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
      name: 'Mythology',
      icon: '🏛️',
      description: 'Ancient stories and timeless truths'
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
      mythology: '🏛️'
    };
    const icon = universeIcons[universeKey] || '🌌';
    creationUniverseBadge.textContent = `${icon} ${universeName} Universe`;
  }
  
  // Apply visual transition
  const universeBackground = document.getElementById('universeBackground');
  if (universeBackground) {
    universeBackground.className = `universe-background active universe-${universeKey}`;
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
      power: 'Divine Blessing',
      weapon: 'Mythic Relic',
      role: 'Mythic Identity',
      personality: 'Divine Disposition'
    },
    categoryDescriptions: {
      power: 'Your god-given domain power',
      weapon: 'Your divine weapon or artifact',
      role: 'Your divine status in myth',
      personality: 'Traits fitting for demigods'
    },
    customPlaceholders: {
      power: 'e.g. Celestial Lightning...',
      weapon: 'e.g. Aegis Shield...',
      role: 'e.g. Heroic Demigod...',
      personality: 'e.g. Wise Beyond Years...'
    },
    powers: [
      'Thunder & Celestial Lightning',
      'Ocean & Earth Control',
      'Sunfire & Solar Radiance',
      'Underworld Shadow Magic'
    ],
    weapons: [
      'Aegis Divine Gorgon Shield',
      'Celestial Lightning Spear',
      'Trident of Poseidon',
      'Mjolnir Thunder Hammer'
    ],
    roles: [
      'Heroic Demigod (Olympus)',
      'High Oracle of Delphi',
      'Champion of Asgard',
      'Mythic Beast Slayer'
    ],
    personalities: [
      'Regal Divine Bearing',
      'Wise Beyond Mortal Years',
      'Fierce in Divine Battle',
      'Just & Unwavering',
      'Heroic & Self-Sacrificing'
    ],
    appearances: [
      { id: 'divine-toga', label: 'Gold Divine Toga', icon: '🏛️' },
      { id: 'armored-cuirass', label: 'Golden Laurel Cuirass', icon: '🛡️' },
      { id: 'oracle-hood', label: 'Oracle Hooded Robes', icon: '🔮' },
      { id: 'viking-mail', label: 'Runic Mail & Furs', icon: '⚔️' }
    ],
    universeSpecific: [
      {
        id: 'pantheon',
        label: 'Pantheon Origin',
        options: ['Greek Olympians 🏛️', 'Norse Aesir ⚡', 'Egyptian Ennead 📿']
      },
      {
        id: 'lineage',
        label: 'Divine Lineage',
        options: ['Child of Thunder ⚡', 'Child of Sea 🌊', 'Child of Wisdom 🦉']
      },
      {
        id: 'realm',
        label: 'Sacred Realm',
        options: ['Mount Olympus 🏛️', 'Asgard Realm ⚡', 'Elysian Fields 🌸']
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
    mythology: 'Create Your Mythic Being'
  };
  
  const universeSubtitles = {
    harrypotter: 'Step into the wizarding world. Define your magical identity.',
    marvel: 'Join the heroes. Define your superhuman potential.',
    anime: 'Enter the adventure. Define your anime character destiny.',
    space: 'Journey among the stars. Define your spacefaring identity.',
    pirates: 'Sail the high seas. Define your pirate legend.',
    mythology: 'Walk among legends. Define your mythic destiny.'
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

  // Placeholder mission cards — guide user to use the topic input above
  initializeMissionCards();
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

function initializeMissionCards() {
  const missionCards = document.querySelectorAll('.mission-card');
  const missionTopicInput = document.getElementById('missionTopicInput');

  // Placeholder cards now guide the user to the topic input instead of
  // navigating directly (which would open the adventure with no data)
  missionCards.forEach(card => {
    card.addEventListener('click', () => {
      showToast('Enter a topic above and press Start Mission!');
      missionTopicInput?.focus();
    });
  });
}

/* =========================================================
   Mission Generation — POST /generate
   ========================================================= */

async function launchMission(topic) {
  const startMissionBtn = document.getElementById('startMissionBtn');
  const missionLoadingState = document.getElementById('missionLoadingState');

  // --- Loading state ---
  if (startMissionBtn) {
    startMissionBtn.disabled = true;
    startMissionBtn.textContent = 'Generating…';
  }
  if (missionLoadingState) missionLoadingState.style.display = 'block';

  AppState.startSession({ topic });

  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
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
    // Always restore the button
    if (startMissionBtn) {
      startMissionBtn.disabled = false;
      startMissionBtn.textContent = 'Start Mission →';
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
    { name: 'Shiva',            hair: '#1a0a2e', skin: '#c8a882', trim: '#7c5cff', prop: 'trident' },
    { name: 'Vishnu',           hair: '#1a1008', skin: '#f5d0a9', trim: '#ffd700', prop: 'discus' },
    { name: 'Krishna',          hair: '#1a0a2e', skin: '#3fd4ff', trim: '#ffd700', prop: 'flute' },
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

  if (backToMissionBtn) {
    backToMissionBtn.addEventListener('click', () => {
      StoryCtrl.stop();
      AppState.navigateTo(AppState.NAVIGATION_STATES.MISSION_SELECTION);
    });
  }
  if (storySkipBtn) {
    storySkipBtn.addEventListener('click', () => StoryCtrl.skipAll());
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

  updateAdventureProgress(lesson, 0);
  renderAdventureSceneByIndex(0, lesson);
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
  const prop = WEAPON_PROPS[wk] !== undefined ? wk : 'none';
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
        avatar = npc?.emoji || (who ? who.charAt(0).toUpperCase() : '✨');
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
      beatEl.className = 'story-beat story-beat--action';
      const actorName = isLearner ? learnerName : (who || 'You');
      beatEl.innerHTML = `
        <div class="beat-action-icon">⚡</div>
        <div class="beat-action-body">
          <span class="beat-action-actor">${escapeHtml(actorName)}</span>: ${escapeHtml(b.text || b.what || '')}
        </div>
      `;
      beatsFlow.appendChild(beatEl);

    } else if (b.t === 'discovery') {
      const beatEl = document.createElement('div');
      beatEl.className = 'story-beat story-beat--discovery';
      beatEl.innerHTML = `
        <div class="beat-action-icon">💡</div>
        <div class="beat-action-body">
          <div class="beat-action-actor">Key Concept Discovery</div>
          <div>${escapeHtml(b.text || '')}</div>
        </div>
      `;
      beatsFlow.appendChild(beatEl);

    } else {
      const beatEl = document.createElement('div');
      beatEl.className = 'story-beat story-beat--narration';
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

  // Scroll to top of chronicle panel so story is read from top
  if (chroniclePanel) {
    chroniclePanel.scrollTop = 0;
  }
}

function renderChronicleChoice(choiceBeat, scene, lesson) {
  const actionArea = document.getElementById('storyActionArea');
  if (!actionArea) return;

  const card = document.createElement('div');
  card.className = 'story-decision-card';
  card.innerHTML = `
    <div class="decision-badge">Your Decision / Next Move</div>
    <div class="decision-question">${escapeHtml(choiceBeat.text || 'What do you choose to do next?')}</div>
    <div class="decision-options" id="chronicleDecisionOptions"></div>
  `;
  actionArea.appendChild(card);

  const optsContainer = card.querySelector('#chronicleDecisionOptions');
  choiceBeat.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'decision-option-btn';
    btn.innerHTML = `<span class="decision-opt-bullet">▶</span> <span>${escapeHtml(opt.text)}</span>`;
    btn.addEventListener('click', () => handleChronicleChoice(opt, card, scene, lesson));
    optsContainer.appendChild(btn);
  });
}

function handleChronicleChoice(opt, card, scene, lesson) {
  const btns = card.querySelectorAll('.decision-option-btn');
  btns.forEach(b => { b.disabled = true; });

  const xp = opt.isCorrect ? 100 : 25;
  AppState.addPoints(xp);
  showToast(opt.isCorrect ? `✅ +${xp} XP` : `💡 +${xp} XP`);

  const ap = document.getElementById('adventurePoints');
  if (ap) ap.textContent = AppState.userProgress.points;

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
      title: 'Deva Sovereign',
      icon: '👑',
      description: 'Earned 300+ Mythology knowledge points.'
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

  if (subtitle) subtitle.textContent = disc.title || 'Concept';

  if (expDiv && det.explanation) {
    expDiv.innerHTML = det.explanation.map(p => `<p>${escapeHtml(p)}</p>`).join('');
  } else if (expDiv && disc.text) {
    expDiv.innerHTML = `<p>${escapeHtml(disc.text)}</p>`;
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
      });
    });
  }

  // Populate takeaway card with explanation bullets if present
  if (takeawayDiv && det.explanation) {
    takeawayDiv.innerHTML = det.explanation.map(p => `<div class="takeaway-bullet"><span class="takeaway-icon">✅</span>${escapeHtml(p)}</div>`).join('');
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
    { key: 'mythology', name: 'Mythology', icon: '🏛️' },
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