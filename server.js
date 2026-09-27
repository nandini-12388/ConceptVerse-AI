console.log("🔥 THIS IS THE SERVER.JS I'M EDITING");

require('dotenv').config();

console.log("Loading Harry...");
console.log("Harry loaded.");

console.log("Loading Marvel...");
console.log("Marvel loaded.");


const harryPotterPrompt = require("./prompts/harryPotter");
const marvelPrompt = require("./prompts/marvel");
console.log("MARVEL PROMPT CHECK:");
console.log(marvelPrompt.slice(0, 100));
const spacePrompt = require("./prompts/space");
const animePrompt = require("./prompts/anime");
const mythologyPrompt = require("./prompts/mythology");
const piratesPrompt = require("./prompts/pirates");


const express = require('express');
const path = require('path');
const Groq = require("groq-sdk");

const app = express();
const PORT = 3000;
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Theme prompts
function getSystemPrompt(theme) {

    switch(theme){

    case "harrypotter":
        return harryPotterPrompt;

    case "marvel":
    console.log("🔥 MARVEL CASE HIT");
    return marvelPrompt;

    case "space":
        return spacePrompt;

    case "anime":
        return animePrompt;

    case "mythology":
    console.log("🔥 MYTHOLOGY CASE HIT");
    console.log(mythologyPrompt.slice(0,300));
    return mythologyPrompt;

    case "pirates":
        return piratesPrompt;

    default:
        return `
        Teach this topic in a fun and beginner-friendly way.
        `;
    }
}

// Schema validation helper
// Accepts the v2 "beat" scene layout. Also tolerates the legacy flat "story"
// array by treating each entry as a dialogue beat (renderer normalizes it).
function validateLessonSchema(rawContent) {
  if (!rawContent || typeof rawContent !== 'object') return false;
  const lesson = rawContent.lesson || rawContent;
  if (!lesson.mission || typeof lesson.mission.title !== 'string') return false;
  if (!Array.isArray(lesson.scenes) || lesson.scenes.length === 0) return false;
  if (!lesson.discovery || typeof lesson.discovery.title !== 'string') return false;

  const seenIds = new Set();
  for (const scene of lesson.scenes) {
    // Scenes must be plain objects with a unique string id and real beats.
    if (!scene || typeof scene !== 'object' || Array.isArray(scene)) return false;
    if (!scene.id || typeof scene.id !== 'string') return false;
    if (seenIds.has(scene.id)) return false;
    seenIds.add(scene.id);

    const beats = scene.beats || scene.story || [];
    if (!Array.isArray(beats) || beats.length === 0) return false;
    for (const beat of beats) {
      if (!beat || typeof beat !== 'object') return false;
      // Every beat needs at least text, a speaker, or (for choices) options to be meaningful.
      const isMeaningful = typeof beat.text === 'string'
        || typeof beat.speaker === 'string'
        || (Array.isArray(beat.options) && beat.options.length > 0);
      if (!isMeaningful) return false;
    }
  }

  // Branch guard: any "next" reference (scene-level or from a choice option)
  // must point at an existing scene. Missing next on the final scene is fine.
  const ids = new Set(lesson.scenes.map(s => s.id));
  for (const scene of lesson.scenes) {
    if (scene.next && !ids.has(scene.next)) return false;
    for (const beat of scene.beats || scene.story || []) {
      if (Array.isArray(beat.options)) {
        for (const opt of beat.options) {
          if (opt && opt.next && !ids.has(opt.next)) return false;
        }
      }
    }
  }

  return true;
}

// Generate lesson API
app.post('/generate', async (req, res) => {
  console.log("[ConceptVerse AI] Generate request received");

  const { topic, theme, character } = req.body;
  console.log("[ConceptVerse AI] Theme:", theme);
  console.log("[ConceptVerse AI] Topic:", topic);
  console.log("[ConceptVerse AI] Character:", character);

  if (!topic || !theme) {
    return res.status(400).json({
      success: false,
      message: "Topic and theme are required",
      error: "Missing topic or theme in request body"
    });
  }

  const charName = (character && typeof character === 'object' && character.name) ? character.name : "Adventurer";
  let characterContext = "";
  if (character && typeof character === 'object') {
    const traits = Object.entries(character)
      .filter(([k, v]) => k !== 'universe' && k !== 'name' && v)
      .map(([k, v]) => `- ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
      .join("\n");

    characterContext = `
PLAYER CHARACTER PROFILE:
- Name: ${charName}
- Selected Universe: ${theme}
${traits}

PLAYER INSTRUCTION:
Address the player directly as ${charName} in dialogue and choice questions. Weave their chosen traits into the story adventure!
`;
  }

  const STORY_INSTRUCTION = `
CRITICAL STORYTELLING INSTRUCTIONS — HIGH-STAKES CINEMATIC ADVENTURE:

1. ABSOLUTELY ZERO TUTORING / NO STUDENT-TEACHER DYNAMICS:
   - The player is a HERO / ADVENTURER, NOT a student attending a class or lecture.
   - BANNED: Definitions, study tips, classroom lectures ("Remember, A pairs with T and C with G...", "Let's review how this works...", "Good job student!").
   - NEVER have characters explain science concepts directly in dialogue like a teacher.
   - The characters are comrades, rivals, or adversaries caught in a high-stakes, fast-moving crisis!

2. MANDATORY CLASHING MULTI-CHARACTER ENSEMBLE IN EVERY SCENE:
   Every single scene MUST feature active dialogue and interactions between at least 2 to 3 distinct characters from this universe, each fulfilling their true personality archetype:
   - PROTAGONIST / ALLY (e.g., Harry, Hermione, Tony Stark, Captain Nova, Kai, Shiva):
     Backs up the player, uses their powers/skills/loyalty, and offers sharp tactical observations without giving the answer away.
   - ANTAGONIST / RIVAL (e.g., Draco Malfoy, Loki, The Asura, Captain Flint, Riku, Rival Challenger):
     MOCKS the player, sneers, doubts their capabilities, and challenges them with biting snark ("You actually think your wand-work can crack this serpentine lock, ${charName}? Even Crabbe would know better!").
   - COMIC RELIEF (e.g., Ron Weasley, Spider-Man, Bolt, Boomer, Riku, Narada):
     Panics comically, cracks sarcastic or absurd jokes, makes ridiculous guesses, and keeps the energy funny and human ("Bloody hell, if that glowing rune blows up, I'm defecting to Durmstrang!").
   - THE PLAYER (${charName}):
     Addressed directly by name, physically present, wielding their chosen weapon, power, and role to make heroic choices!

3. REAL UNIVERSE FLAVOR, POWERS & DANGERS:
   - Harry Potter: Named spells (Incendio, Alohomora, Protego, Lumos Maxima, Expelliarmus), wand movements, bubbling cauldrons, dark artifacts, magical creatures, shifting staircases.
   - Marvel: Arc reactor surges, Stark repulsors, web-shooters, vibranium shields, Mjolnir lightning, JARVIS tactical alerts.
   - Space: Hull breaches, plasma conduit fires, gravity drive anomalies, AI warning klaxons, scanner telemetry.
   - Anime: Martial stances, ki/chakra bursts, spirit seals, signature strikes, aura flare-ups.
   - Mythology: Divine weapons (Trishula, Sudarshana Chakra, Vajra), cosmic disturbances, celestial mantras, asura boons.
   - Pirates: Roaring broadside cannons, cutlasses, cursed Aztec gold, swirling whirlpools, kraken tentacles.

4. THE CONCEPT IS THE PHYSICAL/MAGICAL PUZZLE MECHANISM:
   The learning topic (e.g. DNA Base Pairing, Gravity, Electrical Conductivity) is the invisible law governing the crisis. Characters discover it by observing physical reactions (e.g. mismatched runes sparking violently, energy conduits rejecting mismatched polarity), NOT by reciting a textbook!

5. BEAT SHAPE:
   Each scene contains 5-8 dynamic beats:
   - Dialogue beat: { "t": "dialogue", "speaker": "<Character Name>", "role": "ally" | "rival" | "comic" | "learner", "text": "<1-2 vivid, snappy sentences in-character>", "mood": "<sneering / panicked / resolute / sarcastic>" }
   - Action beat: { "t": "action", "by": "<speaker or 'you'>", "text": "<physical action with powers/spells/weapons>", "fx": "spell" | "power" | "attack" | "inspect" }
   - Environment beat: { "t": "env", "text": "<environmental shift or danger flare-up>", "fx": "fire" | "glow" | "shake" | "storm" }
   - Discovery beat: { "t": "discovery", "text": "<the in-universe clue or law the player uncovers>" }
   - Choice beat: { "t": "choice", "question": "<High-stakes decision asked directly to ${charName}>", "options": [ { "text": "<Bold in-universe action>", "isCorrect": true/false, "feedback": "<Immediate narrative consequence and clear educational logic>" } ] }

6. SCENE FLOW:
   - Produce 3-4 scenes total with 2-3 interactive choices.
   - Scenes branch and rejoin cleanly.
   - Keep dialogue short, snappy, and full of personality!

FINAL JSON SHAPE — Return ONLY this JSON:
{
  "mission": { "title": "...", "problem": "...", "reward": "..." },
  "scenes": [
    { "id": "scene_1", "location": "...", "next": "scene_2", "beats": [ ... ] },
    { "id": "scene_2", "location": "...", "next": "scene_3", "beats": [ ... ] },
    { "id": "scene_3", "location": "...", "beats": [ ... ] }
  ],
  "discovery": { "title": "<Topic Name>", "text": "<2-3 clear summary sentences explaining how the concept worked in the mission>" },
  "details": {
    "explanation": ["<3-4 key principles, plain language>"],
    "realWorld": ["<2-3 real-world applications>"],
    "practice": { "question": "...", "options": ["..."], "answer": 0, "explain": "..." }
  },
  "ending": { "text": "<Thrilling cinematic aftermath resolving the crisis>", "funnyLine": "<Memorable comedic or rival quip>" }
}
`;

  let content = null;

  try {
    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[ConceptVerse AI] AI request started (attempt ${attempt})`);

        const completion = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: getSystemPrompt(theme) + "\n\n" + characterContext + "\n\n" + STORY_INSTRUCTION
            },
            {
              role: "user",
              content: `
MISSION TOPIC: ${topic}
PLAYER HERO: ${character?.name || 'Adventurer'} (Universe: ${theme})
${character ? `TRAITS: Power=${character.power || 'Courage'}, Weapon=${character.weapon || 'Focus'}, Role=${character.role || 'Hero'}, Personality=${Array.isArray(character.personality) ? character.personality.join(', ') : character.personality || 'Determined'}` : ''}

Generate an epic, high-stakes cinematic adventure where ${character?.name || 'the player'} and their companions confront a genuine crisis in the ${theme} universe!
The academic concept (${topic}) must serve as the real physical/magical/technological law of the world that solves the crisis.
CRITICAL RULES:
- Absolutely NO classroom/tutoring dialogue. Do not lecture!
- Include multiple characters actively speaking: allies helping, antagonists/rivals mocking, and comic relief cracking jokes.
- Use authentic universe powers, spells, and dangers!
- Return ONLY valid JSON matching the schema.
`
            }
          ],
          temperature: 0.5,
          max_completion_tokens: 4000,
          response_format: { type: "json_object" }
        });

        console.log(`[ConceptVerse AI] AI response received (attempt ${attempt})`);

        const aiResponse = completion.choices[0]?.message?.content || "";
        let cleanJson = aiResponse.replace(/ thinking[\s\S]*?<\/think>/gi, "").replace(/```json|```/g, "").trim();
        // Light repair for the sloppiness the open model is prone to.
        cleanJson = cleanJson
          .replace(/[“”]/g, '"')
          .replace(/,\s*([}\]])/g, '$1')   // trailing commas
          .replace(/,\s*$/, '');            // dangling comma at the very end

        content = JSON.parse(cleanJson);
        console.log("[ConceptVerse AI] JSON parsing successful");

        if (!validateLessonSchema(content)) {
          throw new Error("Lesson schema missing required fields (mission, scenes, discovery, or ending)");
        }
        break; // success — leave the retry loop
      } catch (attemptError) {
        lastError = attemptError;
        console.error(`[ConceptVerse AI] Generation failed on attempt ${attempt}:`,
          attemptError.status ? `HTTP ${attemptError.status}: ${attemptError.message}` : (attemptError.message || attemptError));
        // Quota exhausted — do not burn a second attempt. Fail fast with a clear message.
        if (attemptError.status === 429 || attemptError.code === 'rate_limit_exceeded') {
          break;
        }
      }
    }

    if (!content) {
      throw lastError || new Error("Failed to generate lesson from AI.");
    }

  } catch (error) {
    const isQuotaExhausted = error && (error.status === 429 || error.code === 'rate_limit_exceeded');

    console.error("[ConceptVerse AI] Generation failure:");
    // Full provider detail stays in the server logs (dev/debug) only.
    console.error(error.status ? `HTTP ${error.status}: ${error.message}` : (error.message || error));

    return res.status(500).json({
      success: false,
      message: isQuotaExhausted
        ? "AI generation is temporarily unavailable because the current AI provider has reached its usage limit. Please try again later."
        : "AI generation failed",
      // Never forward the raw provider message to the client (it can carry
      // account ids). The full detail is logged above.
      error: isQuotaExhausted
        ? "Quota exceeded on the AI provider."
        : (error.message || "Failed to generate lesson from AI.")
    });
  }

  console.log("[ConceptVerse AI] Returning valid lesson JSON");
  res.json({
    success: true,
    topic,
    theme,
    lesson: content.lesson || content
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`ConceptVerse AI server running at http://localhost:${PORT}`);
});