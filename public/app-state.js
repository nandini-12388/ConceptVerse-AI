// =========================================================
// ConceptVerse 2.0 — Application State Management
// Centralized state system for navigation and user data
// =========================================================

const AppState = {
  // Navigation states
  NAVIGATION_STATES: {
    UNIVERSE_SELECTION: 'UNIVERSE_SELECTION',
    CHARACTER_CREATION: 'CHARACTER_CREATION',
    MISSION_SELECTION: 'MISSION_SELECTION',
    CINEMATIC_ADVENTURE: 'CINEMATIC_ADVENTURE',
    CHARACTER_CHALLENGE: 'CHARACTER_CHALLENGE',
    CONCEPT_UNLOCKED: 'CONCEPT_UNLOCKED',
    LEARN_IN_DETAIL: 'LEARN_IN_DETAIL',
    HUB: 'HUB'
  },

  // Current application state
  currentState: 'UNIVERSE_SELECTION',
  
  // Universe-specific theming
  currentUniverse: null,
  universeThemes: {
    harrypotter: {
      name: 'Harry Potter',
      identity: 'magical',
      colors: {
        primary: '#7c5cff',
        secondary: '#9b7edd',
        accent: '#ffd700',
        background: '#1a1a2e'
      },
      typography: {
        display: 'Cinzel Decorative',
        body: 'Crimson Text'
      }
    },
    marvel: {
      name: 'Marvel',
      identity: 'thrilling/cinematic',
      colors: {
        primary: '#ff4d5e',
        secondary: '#ff6b7a',
        accent: '#ffd700',
        background: '#0f0f1a'
      },
      typography: {
        display: 'Bangers',
        body: 'Roboto'
      }
    },
    anime: {
      name: 'Anime',
      identity: 'energetic/stylized',
      colors: {
        primary: '#ff6fd8',
        secondary: '#ff8ae6',
        accent: '#00ffff',
        background: '#1a0a2e'
      },
      typography: {
        display: 'Noto Sans JP',
        body: 'Quicksand'
      }
    },
    space: {
      name: 'Space',
      identity: 'adventurous/exploratory',
      colors: {
        primary: '#3fd4ff',
        secondary: '#5fe0ff',
        accent: '#ff6b35',
        background: '#0a0a1a'
      },
      typography: {
        display: 'Orbitron',
        body: 'Exo 2'
      }
    },
    pirates: {
      name: 'Pirates',
      identity: 'adventurous/playful',
      colors: {
        primary: '#ffb340',
        secondary: '#ffc566',
        accent: '#8b4513',
        background: '#1a120b'
      },
      typography: {
        display: 'Black Ops One',
        body: 'Merriweather'
      }
    },
    mythology: {
      name: 'Mythology',
      identity: 'spiritual/ancient/majestic',
      colors: {
        primary: '#ffd166',
        secondary: '#ffd980',
        accent: '#7c5cff',
        background: '#1a150a'
      },
      typography: {
        display: 'Cinzel',
        body: 'Cormorant Garamond'
      }
    }
  },

  // User character data
  character: {
    universe: null,
    name: '',
    appearance: {
      avatar: null,
      bodyType: null,
      features: []
    },
    power: '', // Single power (required)
    weapon: '', // Single weapon (required)
    role: '', // Single role (required)
    personality: [], // Multiple personality traits (required, at least one)
    universeSpecific: {}
  },

  // User progress data
  userProgress: {
    points: 0,
    badges: [],
    learnedConcepts: [],
    currentAdventure: null,
    adventureHistory: []
  },

  // Current session data
  currentSession: {
    mission: null,
    adventureData: null,
    challengeData: null,
    conceptData: null
  },

  // Audio state (placeholder for future implementation)
  audioState: {
    musicEnabled: false,
    sfxEnabled: false,
    currentTheme: null
  },

  // State transition methods
  setState(newState) {
    this.currentState = newState;
    this.notifyStateChange();
  },

  setUniverse(universeKey) {
    this.currentUniverse = universeKey;
    this.character.universe = universeKey;
    this.applyUniverseTheme();
  },

  applyUniverseTheme() {
    const theme = this.universeThemes[this.currentUniverse];
    if (!theme || typeof document === 'undefined') return;

    // Apply CSS variables for universe theming
    document.documentElement.style.setProperty('--universe-primary', theme.colors.primary);
    document.documentElement.style.setProperty('--universe-secondary', theme.colors.secondary);
    document.documentElement.style.setProperty('--universe-accent', theme.colors.accent);
    document.documentElement.style.setProperty('--universe-background', theme.colors.background);
  },

  notifyStateChange() {
    // Event system for UI updates
    const event = new CustomEvent('stateChange', { 
      detail: { state: this.currentState } 
    });
    document.dispatchEvent(event);
  },

  // Character management
  updateCharacter(characterData) {
    this.character = { ...this.character, ...characterData };
  },

  resetCharacter() {
    this.character = {
      universe: this.currentUniverse || null,
      name: '',
      appearance: { avatar: '👤', type: null, icon: null },
      power: '',
      weapon: '',
      role: '',
      personality: [],
      universeSpecific: {}
    };
  },

  // Progress management
  addPoints(points) {
    this.userProgress.points += points;
  },

  addBadge(badge) {
    if (!this.userProgress.badges.includes(badge)) {
      this.userProgress.badges.push(badge);
    }
  },

  addLearnedConcept(concept) {
    if (!this.userProgress.learnedConcepts.includes(concept)) {
      this.userProgress.learnedConcepts.push(concept);
    }
  },

  // Session management
  startSession(mission) {
    this.currentSession.mission = mission;
    this.currentSession.adventureData = null;
    this.currentSession.challengeData = null;
    this.currentSession.conceptData = null;
  },

  endSession() {
    if (this.currentSession.adventureData) {
      this.userProgress.adventureHistory.push({
        mission: this.currentSession.mission,
        universe: this.currentUniverse,
        completedAt: new Date().toISOString()
      });
    }
    this.currentSession = {
      mission: null,
      adventureData: null,
      challengeData: null,
      conceptData: null
    };
  },

  // Navigation helpers
  canNavigateTo(targetState) {
    // Define navigation rules
    const transitions = {
      UNIVERSE_SELECTION: ['CHARACTER_CREATION'],
      CHARACTER_CREATION: ['UNIVERSE_SELECTION', 'MISSION_SELECTION', 'HUB'],
      MISSION_SELECTION: ['CHARACTER_CREATION', 'HUB', 'CINEMATIC_ADVENTURE'],
      CINEMATIC_ADVENTURE: ['MISSION_SELECTION', 'CHARACTER_CHALLENGE'],
      CHARACTER_CHALLENGE: ['CINEMATIC_ADVENTURE', 'CONCEPT_UNLOCKED'],
      CONCEPT_UNLOCKED: ['CHARACTER_CHALLENGE', 'LEARN_IN_DETAIL', 'HUB'],
      LEARN_IN_DETAIL: ['CONCEPT_UNLOCKED', 'HUB'],
      HUB: ['MISSION_SELECTION', 'UNIVERSE_SELECTION', 'CHARACTER_CREATION']
    };

    return transitions[this.currentState]?.includes(targetState) || false;
  },

  navigateTo(targetState) {
    if (this.canNavigateTo(targetState)) {
      this.setState(targetState);
      return true;
    }
    console.warn(`Cannot navigate from ${this.currentState} to ${targetState}`);
    return false;
  }
};

// =========================================================
// CharacterStore — localStorage persistence for saved characters
// =========================================================

const CharacterStore = {
  KEY: 'cv.characters.v1',

  _read() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  _write(list) {
    try { localStorage.setItem(this.KEY, JSON.stringify(list)); }
    catch { /* quota exceeded — silently degrade */ }
  },

  /**
   * Save a character. Upserts by universe + lowercased name.
   * Caps at 12 records (oldest updatedAt dropped first).
   * Returns the saved record.
   */
  save(character) {
    if (!character || !character.universe || !character.name) return null;
    const list = this._read();
    const key = character.universe + '|' + character.name.trim().toLowerCase();
    const existing = list.find(c => (c.universe + '|' + c.name.toLowerCase()) === key);
    const record = {
      id: existing?.id || Date.now().toString(36),
      universe: character.universe,
      name: character.name.trim(),
      appearance: character.appearance || {},
      power: character.power || '',
      weapon: character.weapon || '',
      role: character.role || '',
      personality: character.personality || [],
      universeSpecific: character.universeSpecific || {},
      updatedAt: Date.now()
    };
    if (existing) {
      Object.assign(existing, record);
    } else {
      list.unshift(record);
    }
    // Cap at 12, sort newest first
    list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    while (list.length > 12) list.pop();
    this._write(list);
    return record;
  },

  /** All saved characters for a universe (newest first). */
  all(universe) {
    return this._read().filter(c => c.universe === universe);
  },

  /** Remove a character by id. */
  remove(id) {
    const list = this._read().filter(c => c.id !== id);
    this._write(list);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppState, CharacterStore };
}