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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
    console.log("🔥 HINDU MYTHOLOGY CASE HIT");
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

  const { topic, theme, character, notesText } = req.body;
  console.log("[ConceptVerse AI] Theme:", theme);
  console.log("[ConceptVerse AI] Topic:", topic);
  console.log("[ConceptVerse AI] Character:", character);
  if (notesText) console.log("[ConceptVerse AI] Notes Text length:", notesText.length);

  let notesContext = "";
  if (notesText && typeof notesText === 'string' && notesText.trim().length > 0) {
    // Strip non-printable binary artifacts if any raw binary was sent
    const cleanNotes = notesText
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = cleanNotes.split(/\s+/);
    const wordCount = words.length;
    // Cap to top 800 words for optimal prompt context & fast AI generation without rate limits
    const cappedNotes = words.slice(0, 800).join(' ');

    console.log(`[ConceptVerse AI] Study Notes Mode active (${wordCount} total words, sending top 800 words)`);
    notesContext = `
STUDENT UPLOADED STUDY NOTES / TEXTBOOK MATERIAL:
================================================
${cappedNotes}
================================================

CRITICAL MANDATE FOR STUDY NOTES MODE:
The player uploaded these study notes to master for an upcoming exam or study session!
You MUST base the core learning puzzle, discovery beats, and quiz choice questions DIRECTLY on the concepts, definitions, facts, and formulas provided in these notes.
Translate the specific facts from these notes into the magical, heroic, or sci-fi mechanisms of the ${theme} universe!
`;
  }

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
CRITICAL STORYTELLING INSTRUCTIONS — HIGH-STAKES ENSEMBLE CINEMATIC ADVENTURE:

1. ABSOLUTELY ZERO TUTORING / NO STUDENT-TEACHER DYNAMICS:
   - The player and their companions are HEROES / SQUAD MEMBERS, NOT students attending a class or lecture.
   - BANNED: Definitions, study tips, classroom lectures ("Remember, A pairs with T and C with G...", "Let's review how this works...", "Good job student!").
   - NEVER have characters explain science concepts directly in dialogue like a teacher.
   - The characters are comrades, rivals, or adversaries caught in a high-stakes, fast-moving crisis!

2. ENSEMBLE TEAM SQUAD (PLAYER IS A TEAM MEMBER, NOT THE LONE HERO):
   - The player (${charName}) is an active member of the squad, NOT an overpowered sole hero who solves everything alone.
   - OTHER UNIVERSE CHARACTERS MUST ACTIVELY USE THEIR OWN POWERS, INTELLIGENCE, MAGIC, AND TECH:
     * Comrades / Allies (e.g. Hermione, Tony Stark, Thor, Lord Shiva, Lord Vishnu, Captain Nova, Kai) actively cast protective spells, calculate power frequencies, use divine astras, shield the squad, and crack portions of the crisis with their own brilliant minds.
     * The crisis is solved through COORDINATED TEAMWORK where the player contributes their specific power/insight alongside their comrades' active abilities.
   - MANDATORY CLASHING ROSTER IN EVERY SCENE:
     * ALLY / COMRADE: Actively fights, uses their powers/magic/intellect, and offers sharp tactical observations.
     * ANTAGONIST / RIVAL (e.g., Draco Malfoy, Loki, The Asura, Captain Flint, Riku): MOCKS the squad, sneers, doubts their capabilities, and challenges them with biting snark.
     * COMIC RELIEF (e.g., Ron Weasley, Spider-Man, Bolt, Boomer, Narada): Panics comically, cracks sarcastic or absurd jokes, makes ridiculous guesses, and keeps the energy funny and human.
     * THE PLAYER (${charName}): Addressed directly, coordinating with the squad, wielding their weapon and power to make key tactical decisions.

3. REAL UNIVERSE FLAVOR, POWERS & DANGERS:
   - Harry Potter: Named spells (Incendio, Alohomora, Protego Maxima, Lumos, Expelliarmus), wand movements, dark artifacts, shifting staircases.
   - Marvel: Arc reactor surges, Stark repulsors, web-shooters, vibranium shields, Mjolnir lightning, JARVIS tactical alerts.
   - Space: Hull breaches, plasma conduit fires, gravity drive anomalies, AI warning klaxons, scanner telemetry.
   - Anime: Martial stances, ki/chakra bursts, spirit seals, signature strikes, aura flare-ups.
   - Hindu Mythology: Divine astras (Trishula, Sudarshana Chakra, Gandiva, Gada), cosmic disturbances in the Lokas, celestial mantras, asura boons, Dharma, and cosmic balance.
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

CRITICAL JSON FORMATTING:
- Return ONLY a valid JSON object matching the schema.
- In JSON string values, NEVER use nested unescaped double quotes. Use single quotes for any dialogue, spoken lines, spell names, or inner quotes (e.g. 'like this', never "like this").

FINAL JSON SHAPE — Return ONLY this JSON:
{
  "mission": {
    "title": "<Catchy crisis mission title>",
    "situation": "<2-3 vivid sentences detailing the exact active catastrophe/emergency currently unfolding in the world>",
    "problem": "<The EXACT, precise mechanical/scientific/magical problem that MUST be tackled and resolved to avert disaster>",
    "stakes": "<What catastrophe occurs if this problem is not solved immediately>",
    "objective": "<The clear victory condition the squad must achieve together>",
    "reward": "<Honor/knowledge gained>"
  },
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
  const userPromptText = `
MISSION TOPIC: ${topic}
PLAYER SQUAD MEMBER: ${character?.name || 'Adventurer'} (Universe: ${theme})
${character ? `TRAITS: Power=${character.power || 'Courage'}, Weapon=${character.weapon || 'Focus'}, Role=${character.role || 'Hero'}, Personality=${Array.isArray(character.personality) ? character.personality.join(', ') : character.personality || 'Determined'}` : ''}
${theme === 'mythology' ? `
SPECIAL HINDU MYTHOLOGY CHARACTERS & TONES:
- Lord Shiva: CALM, SERENE, PEACEFUL, composed, holding cosmic stillness (Shanti Shakti).
- Lord Vishnu: TEASING, PLAYFUL, CLEVER, WITTY, smiling mischievously with divine strategy.
- The Asura: MISCHIEVOUSLY FUNNY, INNOCENT, QUIRKY, boastful yet comically gullible.
- Storyline Companion / Ishta Dev: ${character?.universeSpecific?.ishtaDevata || 'Lord Hanuman / Sage Narada'} actively assisting ${character?.name || 'the player'}.
` : ''}

Generate an epic, high-stakes cinematic adventure where the squad confronts a genuine crisis in the ${theme} universe!
CRITICAL RULES:
- The player (${character?.name || 'the player'}) is a squad member, NOT the sole hero.
- Established characters MUST actively use their own signature powers, intelligence, spells, or technology to fight and tackle the crisis!
- Explicitly detail the ACTIVE SITUATION and the EXACT PROBLEM TO TACKLE in the mission object.
- The academic concept (${topic}) must serve as the real physical/magical/technological law of the world that solves the crisis.
- Absolutely NO classroom/tutoring dialogue. Do not lecture!
- Include active dialogue: allies coordinating with their powers, antagonists mocking, comic relief cracking jokes.
- Return ONLY valid JSON matching the schema. Use single quotes for any speech or quotes inside string values.
`;

  const systemPromptText = getSystemPrompt(theme) + "\n\n" + characterContext + (notesContext ? "\n\n" + notesContext : "") + "\n\n" + STORY_INSTRUCTION;

function repairJsonString(rawStr) {
  if (!rawStr) return null;

  // Direct parse first if clean
  try {
    return JSON.parse(rawStr);
  } catch (_) {}

  let str = String(rawStr)
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json|```/g, "")
    .trim();

  try {
    return JSON.parse(str);
  } catch (_) {}

  // Remove trailing commas before object/array closing
  str = str.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(str);
  } catch (_) {}

  // Escape unescaped newlines inside strings
  let sanitized = str.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, "\\n");
  try {
    return JSON.parse(sanitized);
  } catch (_) {}

  // Attempt auto-closing unclosed JSON brackets/braces/quotes if response truncated
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (ch === '\\') {
      isEscaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '{') openBraces++;
      else if (ch === '}') openBraces = Math.max(0, openBraces - 1);
      else if (ch === '[') openBrackets++;
      else if (ch === ']') openBrackets = Math.max(0, openBrackets - 1);
    }
  }

  let repaired = str;
  if (inString) repaired += '"';
  while (openBrackets > 0) { repaired += ']'; openBrackets--; }
  while (openBraces > 0) { repaired += '}'; openBraces--; }

  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(repaired);
  } catch (err) {
    console.warn("[ConceptVerse AI] Auto-repair attempt failed:", err.message);
    throw err;
  }
}

  try {
    let lastError = null;
    const GROQ_MODELS = [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
      "allam-2-7b"
    ];

    for (const modelName of GROQ_MODELS) {
      try {
        console.log(`[ConceptVerse AI] Attempting Groq model: ${modelName}`);

        const completion = await groq.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemPromptText },
            { role: "user", content: userPromptText }
          ],
          temperature: 0.5,
          max_completion_tokens: 4000,
          response_format: { type: "json_object" }
        });

        const aiResponse = completion.choices[0]?.message?.content || "";
        const parsed = repairJsonString(aiResponse);
        if (parsed && validateLessonSchema(parsed)) {
          content = parsed;
          console.log(`[ConceptVerse AI] Generation successful with model ${modelName}`);
          break;
        } else {
          console.warn(`[ConceptVerse AI] Schema validation failed for model ${modelName}`);
        }
      } catch (err) {
        lastError = err;
        console.error(`[ConceptVerse AI] Model ${modelName} error:`, err.message || err);
      }
    }

    // Fallback to OpenRouter API if Groq models fail or rate limit
    if (!content && process.env.OPENROUTER_API_KEY) {
      try {
        console.log("[ConceptVerse AI] Falling back to OpenRouter API...");
        const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.3-70b-instruct",
            messages: [
              { role: "system", content: systemPromptText },
              { role: "user", content: userPromptText }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (!openrouterRes.ok) {
          const errData = await openrouterRes.json().catch(() => ({}));
          console.warn(`[ConceptVerse AI] OpenRouter fallback returned HTTP ${openrouterRes.status}:`, errData.error?.message || openrouterRes.statusText);
        } else {
          const openrouterData = await openrouterRes.json();
          const aiResponse = openrouterData.choices?.[0]?.message?.content || "";
          const parsed = repairJsonString(aiResponse);
          if (parsed && validateLessonSchema(parsed)) {
            content = parsed;
            console.log("[ConceptVerse AI] OpenRouter generation successful!");
          }
        }
      } catch (orErr) {
        console.error("[ConceptVerse AI] OpenRouter fallback error:", orErr.message || orErr);
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