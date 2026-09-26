// =========================================================
// ConceptVerse AI — script.js
// Legacy script - preserved for reference
// Main functionality moved to app-navigation.js for ConceptVerse 2.0
// =========================================================

console.log("LEGACY SCRIPT LOADED - Functionality moved to app-navigation.js");

// This file is preserved for reference but main functionality has been
// moved to the new ConceptVerse 2.0 navigation system in app-navigation.js
// The old functions below are kept for reference during migration

/* =========================================================
   Starfield Background
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
   Theme / Universe Selection & Character Customization
   ========================================================= */

let selectedTheme = null;
let playerCharacter = {
  universe: null,
  name: ""
};

const CHARACTER_SCHEMAS = {
  harrypotter: {
    badge: "🧙‍♂️ Harry Potter Universe",
    nameLabel: "Choose Your Wizard Name",
    namePlaceholder: "e.g. Aether Vale",
    fields: [
      {
        key: "house",
        label: "Choose Your House",
        options: [
          { id: "Gryffindor", label: "🦁 Gryffindor" },
          { id: "Slytherin", label: "🐍 Slytherin" },
          { id: "Ravenclaw", label: "🦅 Ravenclaw" },
          { id: "Hufflepuff", label: "🦡 Hufflepuff" }
        ]
      },
      {
        key: "bloodStatus",
        label: "Choose Your Blood Status",
        options: [
          { id: "Pure-blood", label: "Pure-blood" },
          { id: "Half-blood", label: "Half-blood" },
          { id: "Muggle-born", label: "Muggle-born" }
        ]
      },
      {
        key: "weapon",
        label: "Choose Your Wand",
        allowRandom: true,
        options: [
          { id: "Phoenix Feather Wand", label: "🪄 Phoenix Feather Wand" },
          { id: "Dragon Heartstring Wand", label: "🐉 Dragon Heartstring Wand" },
          { id: "Unicorn Hair Wand", label: "🦄 Unicorn Hair Wand" },
          { id: "Elder-style Wand", label: "🪵 Elder-style Wand" }
        ]
      }
    ]
  },
  marvel: {
    badge: "⚡ Marvel Universe",
    nameLabel: "Hero Identity / Name",
    namePlaceholder: "e.g. Captain Photon",
    fields: [
      {
        key: "origin",
        label: "Choose Origin / Power Type",
        options: [
          { id: "Tech Suit", label: "🔬 Tech Suit" },
          { id: "Mutant Ability", label: "🧬 Mutant Ability" },
          { id: "Gamma/Cosmic Ray", label: "⚡ Gamma / Cosmic" },
          { id: "Mystic Arts", label: "🔮 Mystic Arts" }
        ]
      },
      {
        key: "ability",
        label: "Choose Signature Ability",
        options: [
          { id: "Quantum Energy Blasts", label: "⚡ Quantum Blasts" },
          { id: "Telekinesis", label: "🧠 Telekinesis" },
          { id: "Super Strength", label: "💥 Super Strength" },
          { id: "Nanotech Shields", label: "🛡️ Nanotech Shields" }
        ]
      },
      {
        key: "weapon",
        label: "Choose Hero Gear",
        allowRandom: true,
        options: [
          { id: "Vibranium Shield", label: "🛡️ Vibranium Shield" },
          { id: "Arc Armor", label: "🦾 Arc Armor" },
          { id: "Energy Gauntlets", label: "⚡ Energy Gauntlets" },
          { id: "Sling Ring", label: "💍 Sling Ring" }
        ]
      }
    ]
  },
  anime: {
    badge: "⚔️ Anime Universe",
    nameLabel: "Character Name",
    namePlaceholder: "e.g. Ren Kaida",
    fields: [
      {
        key: "style",
        label: "Choose Power System / Style",
        options: [
          { id: "Elemental Ninjutsu", label: "🌀 Ninjutsu" },
          { id: "Energy Focus", label: "🔥 Energy Focus" },
          { id: "Magic Grimoire", label: "📜 Magic Grimoire" },
          { id: "Sword Art", label: "⚔️ Sword Art" }
        ]
      },
      {
        key: "ability",
        label: "Choose Special Ability",
        options: [
          { id: "Time Acceleration", label: "⏳ Time Acceleration" },
          { id: "Shadow Clone", label: "👤 Shadow Clone" },
          { id: "Dragon Aura Strike", label: "🐉 Dragon Aura" },
          { id: "Spatial Teleport", label: "🌌 Spatial Teleport" }
        ]
      },
      {
        key: "weapon",
        label: "Choose Weapon",
        allowRandom: true,
        options: [
          { id: "Spirit Katana", label: "🗡️ Spirit Katana" },
          { id: "Energy Blade", label: "⚡ Energy Blade" },
          { id: "Sacred Relic", label: "🛡️ Sacred Relic" },
          { id: "Bare Fists", label: "🥊 Bare Fists" }
        ]
      }
    ]
  },
  space: {
    badge: "🚀 Cosmic Space Universe",
    nameLabel: "Explorer Name",
    namePlaceholder: "e.g. Commander Vance",
    fields: [
      {
        key: "role",
        label: "Choose Station Role",
        options: [
          { id: "Scientist", label: "🔬 Scientist" },
          { id: "Engineer", label: "🛠️ Engineer" },
          { id: "Pilot", label: "🚀 Pilot" },
          { id: "Commander", label: "🎖️ Commander" },
          { id: "Explorer", label: "🌌 Explorer" }
        ]
      },
      {
        key: "specialization",
        label: "Choose Specialization",
        options: [
          { id: "Quantum Physics", label: "⚛️ Quantum Physics" },
          { id: "Warp Engines", label: "💫 Warp Engines" },
          { id: "Astrobiology", label: "🧪 Astrobiology" },
          { id: "AI Tactics", label: "🤖 AI Tactics" }
        ]
      },
      {
        key: "vessel",
        label: "Choose Vessel / Gear",
        allowRandom: true,
        options: [
          { id: "Stealth Interceptor", label: "🛸 Interceptor" },
          { id: "Science Vessel", label: "🔬 Science Vessel" },
          { id: "Explorer Scout", label: "🌌 Explorer Scout" },
          { id: "Power Exosuit", label: "🦾 Power Exosuit" }
        ]
      }
    ]
  },
  pirates: {
    badge: "🏴‍☠️ Pirate Universe",
    nameLabel: "Pirate Name",
    namePlaceholder: "e.g. Captain Blacktide",
    fields: [
      {
        key: "role",
        label: "Choose Crew Position",
        options: [
          { id: "Captain", label: "🏴‍☠️ Captain" },
          { id: "First Mate", label: "⚔️ First Mate" },
          { id: "Quartermaster", label: "📜 Quartermaster" },
          { id: "Navigator", label: "🧭 Navigator" },
          { id: "Gunner", label: "💥 Gunner" }
        ]
      },
      {
        key: "weapon",
        label: "Choose Favorite Weapon",
        allowRandom: true,
        options: [
          { id: "Cutlass", label: "🗡️ Cutlass" },
          { id: "Twin Flintlocks", label: "🔫 Twin Flintlocks" },
          { id: "Boarding Axe", label: "🪓 Boarding Axe" },
          { id: "Heavy Cannon", label: "💣 Heavy Cannon" }
        ]
      },
      {
        key: "reputation",
        label: "Choose Reputation",
        options: [
          { id: "Fearless", label: "⚡ Fearless" },
          { id: "Clever", label: "🧠 Clever" },
          { id: "Mysterious", label: "👁️ Mysterious" },
          { id: "Legendary", label: "👑 Legendary" }
        ]
      }
    ]
  },
  mythology: {
    badge: "🏛️ Ancient Mythology Universe",
    nameLabel: "Hero / Champion Name",
    namePlaceholder: "e.g. Theron of Athens",
    fields: [
      {
        key: "origin",
        label: "Choose Lineage / Origin",
        options: [
          { id: "Child of Zeus", label: "⚡ Child of Zeus" },
          { id: "Child of Thor", label: "🔨 Child of Thor" },
          { id: "Mortal Champion", label: "🛡️ Champion" },
          { id: "Titan Blood", label: "🌋 Titan Blood" },
          { id: "Oracle Scholar", label: "🔮 Oracle Scholar" }
        ]
      },
      {
        key: "domain",
        label: "Choose Divine Domain",
        options: [
          { id: "Lightning & Storms", label: "⚡ Lightning" },
          { id: "Sun & Truth", label: "☀️ Sun & Truth" },
          { id: "Underworld Fire", label: "🪦 Underworld" },
          { id: "Wisdom & Strategy", label: "🦉 Wisdom" }
        ]
      },
      {
        key: "weapon",
        label: "Choose Sacred Weapon",
        allowRandom: true,
        options: [
          { id: "Celestial Spear", label: "🔱 Celestial Spear" },
          { id: "Aegis Shield", label: "🛡️ Aegis Shield" },
          { id: "Runic Blade", label: "🗡️ Runic Blade" },
          { id: "Golden Bow", label: "🏹 Golden Bow" }
        ]
      },
      {
        key: "companion",
        label: "Choose Companion",
        options: [
          { id: "Pegasus", label: "🐴 Pegasus" },
          { id: "Phoenix", label: "🦅 Phoenix" },
          { id: "Celestial Hound", label: "🐺 Hound" },
          { id: "Raven", label: "🐦 Raven" }
        ]
      }
    ]
  }
};

function initThemeSelection() {
  const cards = document.querySelectorAll(".theme-card");

  if (cards.length === 0) return;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const themeValue = card.getAttribute("data-theme");

      if (!themeValue) return;

      cards.forEach((otherCard) => {
        otherCard.classList.remove("is-selected");
        otherCard.setAttribute("aria-pressed", "false");
      });

      card.classList.add("is-selected");
      card.setAttribute("aria-pressed", "true");

      selectedTheme = themeValue;

      const nameElement = card.querySelector(".theme-card__name");
      const nameText = nameElement ? nameElement.textContent.trim() : themeValue;

      updateHint(`${nameText} selected — now customize your character below.`, true);

      // Reveal Character Creation Panel
      showCharacterCreation(themeValue);

      // Update Step Indicators
      setStepState(1, "is-done");
      setStepState(2, "is-active");
    });
  });
}

function setStepState(stepNum, stateClass) {
  const item = document.getElementById(`stepItem${stepNum}`);
  if (!item) return;
  item.classList.remove("is-active", "is-done");
  item.classList.add(stateClass);
}

function showCharacterCreation(themeKey) {
  const section = document.getElementById("characterSection");
  const fieldsContainer = document.getElementById("characterFields");
  const badge = document.getElementById("characterUniverseBadge");

  if (!section || !fieldsContainer) return;

  const schema = CHARACTER_SCHEMAS[themeKey];
  if (!schema) return;

  // Reset playerCharacter state for new universe
  playerCharacter = { universe: themeKey, name: "" };

  badge.textContent = schema.badge;

  fieldsContainer.innerHTML = "";

  // Render Name Input Field
  const nameGroup = document.createElement("div");
  nameGroup.className = "char-group";
  nameGroup.innerHTML = `
    <label class="char-label" for="charNameInput">${schema.nameLabel}</label>
    <input type="text" id="charNameInput" class="char-input" placeholder="${schema.namePlaceholder}" autocomplete="off" />
  `;
  fieldsContainer.appendChild(nameGroup);

  const nameInput = nameGroup.querySelector("#charNameInput");
  nameInput.addEventListener("input", (e) => {
    playerCharacter.name = e.target.value.trim();
    updateCharacterSummary();
    if (playerCharacter.name) setStepState(2, "is-done");
  });

  // Render Field Groups
  schema.fields.forEach((field) => {
    const group = document.createElement("div");
    group.className = "char-group";

    let randomBtnHtml = field.allowRandom ? `<button type="button" class="char-random-btn" data-key="${field.key}">🎲 Randomize</button>` : "";

    group.innerHTML = `
      <div class="char-label">
        <span>${field.label}</span>
        ${randomBtnHtml}
      </div>
      <div class="char-options-grid" data-key="${field.key}"></div>
    `;

    const grid = group.querySelector(".char-options-grid");

    field.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "char-opt-btn";
      btn.setAttribute("data-value", opt.id);
      btn.textContent = opt.label;

      btn.addEventListener("click", () => {
        grid.querySelectorAll(".char-opt-btn").forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        playerCharacter[field.key] = opt.id;
        updateCharacterSummary();
      });

      grid.appendChild(btn);
    });

    if (field.allowRandom) {
      const randBtn = group.querySelector(".char-random-btn");
      randBtn.addEventListener("click", () => {
        const btns = grid.querySelectorAll(".char-opt-btn");
        const randomOpt = field.options[Math.floor(Math.random() * field.options.length)];
        btns.forEach((b) => b.classList.remove("is-selected"));
        const targetBtn = Array.from(btns).find((b) => b.getAttribute("data-value") === randomOpt.id);
        if (targetBtn) targetBtn.classList.add("is-selected");
        playerCharacter[field.key] = randomOpt.id;
        updateCharacterSummary();
      });
    }

    fieldsContainer.appendChild(group);
  });

  section.classList.remove("hidden-section");
  section.classList.add("show-section");

  updateCharacterSummary();
}

function updateCharacterSummary() {
  const summaryName = document.getElementById("summaryName");
  const summaryTags = document.getElementById("summaryTags");

  if (!summaryName || !summaryTags) return;

  summaryName.textContent = playerCharacter.name || "Unnamed Hero";

  const tags = [];
  Object.entries(playerCharacter).forEach(([k, v]) => {
    if (k !== "universe" && k !== "name" && v) {
      tags.push(`<span class="summary-tag">${v}</span>`);
    }
  });

  summaryTags.innerHTML = tags.length > 0 ? tags.join("") : `<span class="summary-tag">Select choices above</span>`;
}

function validateCharacterSelection() {
  if (!selectedTheme) return { valid: false, message: "Choose a universe below before generating." };

  const schema = CHARACTER_SCHEMAS[selectedTheme];
  if (!schema) return { valid: true };

  if (!playerCharacter.name || playerCharacter.name.trim() === "") {
    return { valid: false, message: "Complete your character name before beginning the adventure." };
  }

  for (const field of schema.fields) {
    if (!playerCharacter[field.key]) {
      return { valid: false, message: "Complete your character before beginning the adventure." };
    }
  }

  return { valid: true };
}

/* =========================================================
   Search / Generate Form
   ========================================================= */

function initSearchForm() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("topicInput");

  if (!form || !input) return;

  input.addEventListener("focus", () => {
    setStepState(3, "is-active");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedTheme) {
      flashInvalid(input, "Choose a universe below before generating.");
      highlightThemeGrid();
      return;
    }

    const charValidation = validateCharacterSelection();
    if (!charValidation.valid) {
      showToast(charValidation.message);
      const panel = document.getElementById("characterPanel");
      if (panel) {
        panel.classList.remove("shake");
        void panel.offsetWidth;
        panel.classList.add("shake");
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const topic = input.value.trim();
    if (!topic) {
      flashInvalid(input, "Type a topic first — anything you're curious about.");
      return;
    }

    setStepState(3, "is-done");
    setStepState(4, "is-active");

    console.log("Generating:", { topic, theme: selectedTheme, character: playerCharacter });

    generateConcept(topic, selectedTheme, playerCharacter);
  });
}

function flashInvalid(input, message) {
  input.classList.remove("shake");
  void input.offsetWidth;
  input.classList.add("shake");
  showToast(message);
}

function highlightThemeGrid() {
  const grid = document.getElementById("themeGrid");
  if (!grid) return;
  grid.classList.remove("shake");
  void grid.offsetWidth;
  grid.classList.add("shake");
}

/* =========================================================
   Generate Concept
   ========================================================= */

async function generateConcept(topic, theme, character) {
  const button = document.getElementById("generateBtn");

  if (!button) return;

  setButtonLoading(button, true);
  clearResultPanel();

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topic: topic,
        theme: theme,
        character: character
      })
    });

    const data = await response.json();

    console.log("BACKEND DATA:", data);

    if (!response.ok || !data.success) {
      showToast(data.message || "Something went wrong. Please try again.");
      return;
    }

    renderResultPanel(data);

    showToast("✨ Adventure Generated!");

  } catch (error) {
    console.error("[ConceptVerse AI] Request failed:", error);
    showToast("⚠️ Could not reach the server. Is it running?");
  } finally {
    setButtonLoading(button, false);
  }
}

/* =========================================================
   Generate Button
   ========================================================= */

function setButtonLoading(button, isLoading) {
  const label = button.querySelector(".generate-btn__label");

  button.disabled = isLoading;

  button.style.opacity = isLoading ? "0.75" : "1";
  button.style.cursor = isLoading ? "wait" : "pointer";

  if (label) {
    label.textContent = isLoading
      ? "Generating…"
      : "Generate";
  }
}

/* =========================================================
   Theme Labels
   ========================================================= */

function labelForTheme(themeKey) {
  const labels = {
    marvel: "Marvel",
    harrypotter: "Harry Potter",
    anime: "Anime",
    space: "Space",
    pirates: "Pirates",
    mythology: "Mythology"
  };

  return labels[themeKey] || themeKey;
}

/* =========================================================
   Result Panel
   ========================================================= */

let currentScore = 0;

function getThemeColor() {
  const styles = getComputedStyle(
    document.documentElement
  );

  return {
    violet:
      styles.getPropertyValue("--violet").trim() ||
      "#7c5cff",

    cyan:
      styles.getPropertyValue("--cyan").trim() ||
      "#22d3ee",

    muted:
      styles.getPropertyValue("--muted").trim() ||
      "#8b8da3",

    text:
      styles.getPropertyValue("--text").trim() ||
      "#e8e9f3"
  };
}

function clearResultPanel() {
  const existing =
    document.getElementById("resultPanel");

  if (existing) {
    existing.remove();
  }
}

/* =========================================================
   Render Lesson
   ========================================================= */

function renderResultPanel(data) {
  clearResultPanel();

  currentScore = 0;

  const lesson = data.lesson;

  if (!lesson) {
    console.error("No lesson found in backend response.");
    return;
  }

  // Support branching lessons
  let scenes = lesson.scenes;

  // Support older linear lesson format
  if (!scenes && lesson.story) {
    scenes = [
      {
        id: "scene_1",
        story: lesson.story
      }
    ];
  }

  if (!scenes || scenes.length === 0) {
    console.error("No scenes found.");
    return;
  }

  const sceneMap = {};

  scenes.forEach((scene) => {
    sceneMap[scene.id] = scene;
  });

  const panel = document.createElement("div");

  panel.id = "resultPanel";
  panel.className = "glass";

  panel.innerHTML = `
    <div class="lesson-section">

      <div class="mission-header">

        <h2 class="mission-title">
          🎯 ${escapeHtml(lesson.mission.title)}
        </h2>

        <span class="score-badge" id="scoreBadge">
          ⭐ XP: 0
        </span>

      </div>

      <p style="margin-top:8px;">
        ${escapeHtml(lesson.mission.problem)}
      </p>

      <p style="margin-top:6px;">
        🏆 <strong>Reward:</strong>
        ${escapeHtml(lesson.mission.reward)}
      </p>

    </div>

    <div id="sceneSection" class="lesson-section">

      <h2>💬 Story</h2>

      <div id="storyContainer"></div>

      <div id="choiceContainer"></div>

    </div>

    <div id="discovery"
         class="lesson-section hidden-section">

      <h2>
        🧠 ${escapeHtml(lesson.discovery.title)}
      </h2>

      <p>
        ${escapeHtml(lesson.discovery.text)}
      </p>

      <button
        id="continueBtn"
        class="reveal-btn"
      >
        ✨ Continue Mission
      </button>

    </div>

    <div
      id="ending"
      class="lesson-section reward-card hidden-section"
    >

      <h2>🎉 Mission Complete</h2>

      <p>
        ${escapeHtml(lesson.ending.text)}
      </p>

      <p style="margin-top:10px;">
        😄 ${escapeHtml(lesson.ending.funnyLine)}
      </p>

    </div>
  `;

  const searchForm =
    document.getElementById("searchForm");

  if (!searchForm) return;

  searchForm.insertAdjacentElement(
    "afterend",
    panel
  );

  requestAnimationFrame(() => {
    panel.style.opacity = "1";
    panel.style.transform = "translateY(0)";
  });

  renderScene(
    scenes[0].id,
    sceneMap,
    lesson
  );
}

/* =========================================================
   Render Scene
   ========================================================= */

function renderScene(
  sceneId,
  sceneMap,
  lesson
) {
  const scene = sceneMap[sceneId];

  if (!scene) {
    console.error(
      "Scene not found:",
      sceneId
    );
    return;
  }

  const storyContainer =
    document.getElementById(
      "storyContainer"
    );

  const choiceContainer =
    document.getElementById(
      "choiceContainer"
    );

  if (!storyContainer || !choiceContainer) {
    return;
  }

  storyContainer.innerHTML = "";
  choiceContainer.innerHTML = "";

  const story = scene.story || [];

  story.forEach((item, index) => {
    const message =
      document.createElement("div");

    message.className =
      "story-message hidden-message";

    message.style.animationDelay =
      `${index * 1.0}s`;

    message.innerHTML = `
      <div class="story-speaker">
        ${escapeHtml(item.speaker)}
      </div>

      <div>
        ${escapeHtml(item.text)}
      </div>
    `;

    storyContainer.appendChild(message);
  });

  const storyDelay =
    story.length * 1000 + 400;

  setTimeout(() => {

    if (scene.choice) {

      renderChoice(
        scene.choice,
        sceneMap,
        lesson
      );

    } else {

      renderFinalRevealButton(lesson);

    }

  }, storyDelay);
}

/* =========================================================
   Render Choices
   ========================================================= */

function renderChoice(
  choice,
  sceneMap,
  lesson
) {
  const choiceContainer =
    document.getElementById(
      "choiceContainer"
    );

  if (!choiceContainer) return;

  const card =
    document.createElement("div");

  card.className = "choice-card";

  card.innerHTML = `
    <div class="choice-question">
      ❓ ${escapeHtml(choice.question)}
    </div>

    <div class="choice-options">

      ${choice.options
        .map(
          (option) => `
            <button
              class="choice-btn"
              data-opt-id="${escapeHtml(option.id)}"
            >
              ${escapeHtml(option.text)}
            </button>
          `
        )
        .join("")}

    </div>

    <div id="consequenceSlot"></div>
  `;

  choiceContainer.appendChild(card);

  const buttons =
    card.querySelectorAll(
      ".choice-btn"
    );

  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const optionId =
          button.dataset.optId;

        const selectedOption =
          choice.options.find(
            (option) =>
              option.id === optionId
          );

        if (!selectedOption) return;

        // Disable all options
        buttons.forEach((otherButton) => {

          otherButton.disabled = true;

          if (
            otherButton.dataset.optId ===
            optionId
          ) {

            otherButton.classList.add(
              selectedOption.isCorrect
                ? "is-correct"
                : "is-incorrect"
            );
          }

        });

        // Score
        if (selectedOption.isCorrect) {

          currentScore += 100;

          showToast(
            "🌟 Correct! +100 XP"
          );

        } else {

          currentScore += 25;

          showToast(
            "⚡ Twist! +25 XP for effort"
          );
        }

        const scoreBadge =
          document.getElementById(
            "scoreBadge"
          );

        if (scoreBadge) {
          scoreBadge.textContent =
            `⭐ XP: ${currentScore}`;
        }

        // Consequence
        const slot =
          card.querySelector(
            "#consequenceSlot"
          );

        if (!slot) return;

        slot.innerHTML = `
          <div
            class="consequence-card
            ${
              selectedOption.isCorrect
                ? "consequence--correct"
                : "consequence--incorrect"
            }"
          >

            <div class="consequence-header">
              ${
                selectedOption.isCorrect
                  ? "✅ Success!"
                  : "⚡ Twist & Consequence"
              }
            </div>

            <p class="consequence-text">
              ${escapeHtml(
                selectedOption.consequence
              )}
            </p>

            <p class="consequence-feedback">
              ${escapeHtml(
                selectedOption.feedback
              )}
            </p>

            <button
              class="reveal-btn next-scene-btn"
              id="nextSceneBtn"
            >
              Continue Journey →
            </button>

          </div>
        `;

        const nextButton =
          slot.querySelector(
            "#nextSceneBtn"
          );

        if (!nextButton) return;

        nextButton.addEventListener(
          "click",
          () => {

            nextButton.classList.add(
              "fade-out-button"
            );

            setTimeout(() => {

              renderScene(
                selectedOption.nextScene,
                sceneMap,
                lesson
              );

            }, 350);

          }
        );
      }
    );

  });
}

/* =========================================================
   Final Reveal
   ========================================================= */

function renderFinalRevealButton(lesson) {
  const choiceContainer =
    document.getElementById(
      "choiceContainer"
    );

  if (!choiceContainer) return;

  choiceContainer.innerHTML = `
    <button
      id="revealBtn"
      class="reveal-btn hidden-button show"
      style="margin-top:20px;"
    >
      🪄 Cast Revelio (Discover Concept)
    </button>
  `;

  const revealButton =
    document.getElementById(
      "revealBtn"
    );

  const continueButton =
    document.getElementById(
      "continueBtn"
    );

  if (!revealButton || !continueButton) {
    return;
  }

  revealButton.addEventListener(
    "click",
    () => {

      if (
        revealButton.classList.contains(
          "fade-out-button"
        )
      ) {
        return;
      }

      revealButton.classList.add(
        "fade-out-button"
      );

      const discovery =
        document.getElementById(
          "discovery"
        );

      if (discovery) {

        discovery.classList.remove(
          "hidden-section"
        );

        discovery.classList.add(
          "show-section"
        );
      }

      setTimeout(() => {
        revealButton.style.display =
          "none";
      }, 400);

    }
  );

  continueButton.addEventListener(
    "click",
    () => {

      if (
        continueButton.classList.contains(
          "fade-out-button"
        )
      ) {
        return;
      }

      continueButton.classList.add(
        "fade-out-button"
      );

      const ending =
        document.getElementById(
          "ending"
        );

      if (ending) {

        ending.classList.remove(
          "hidden-section"
        );

        ending.classList.add(
          "show-section"
        );
      }

      setTimeout(() => {
        continueButton.style.display =
          "none";
      }, 400);

    }
  );
}

/* =========================================================
   Hint
   ========================================================= */

function updateHint(text, active) {
  const hint =
    document.getElementById(
      "hintText"
    );

  if (!hint) return;

  hint.textContent = text;

  hint.classList.toggle(
    "hint--active",
    active
  );
}

/* =========================================================
   Toast
   ========================================================= */

let toastTimer = null;

function showToast(message) {
  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add(
    "is-visible"
  );

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove(
      "is-visible"
    );

  }, 3200);
}

/* =========================================================
   HTML Escape
   ========================================================= */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}