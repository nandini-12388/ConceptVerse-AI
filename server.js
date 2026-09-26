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

  let characterContext = "";
  if (character && typeof character === 'object') {
    const charName = character.name || "Adventurer";
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
CRITICAL STORYTELLING FORMAT — READ CAREFULLY.

Your job is to write a SHORT, interactive, branching CINEMATIC adventure. The learner is the protagonist, standing inside this universe. The story must fulfill the MASTER PATTERN:
    character action → reaction → environmental change → learner involvement → decision → consequence → escalation → solution
It must NEVER read as: dialogue, dialogue, dialogue, click, dialogue, click.

The story is a sequence of EVENTS that unfold, not a chat transcript and not a lecture. Every scene contains a handful of story BEATS. A beat is one meaningful story moment, chosen from these kinds:

  { "t": "dialogue",  "speaker": "<who>", "text": "<short line>", "mood": "<how they say it>" }
      A character speaks. It MUST respond to the previous beat (what was just said or just happened),
      never float in isolation. Dialogues are short — one or two sentences.

  { "t": "reaction",  "speaker": "<who>", "text": "<short line>", "mood": "<sneering / relieved / etc>" }
      A character reacts to what just happened before speaking. Same as dialogue but explicitly reactive.

  { "t": "action",   "by": "<who or 'you'>", "what": "<what is physically done>", "fx": "<one of: spell, probe, attack, power, entry, move, grab, inspect>", "text": "<one-line description of the visible result>" }
      Something PHYSICALLY HAPPENS. The world sees it. The effect must change the situation or reveal info.

  { "t": "env",      "text": "<what changes in the environment>", "fx": "<one of: frost, fire, shake, glow, storm, fade>" }
      The environment/object changes: a light flickers, the floor cracks, frost forms, the room darkens.
      This ALWAYS alters the situation the learner is in.

  { "t": "focus",    "text": "<one line that pulls the learner into the moment>" }
      A narrator-style line addressed to the learner: "The room falls silent. Everyone waits for you."

  { "t": "discovery", "text": "<a clue the learner now knows>", "fx": "reveal" }
      The learner discovers something useful that changes what they should do next.

  { "t": "choice",   "question": "<directly asks the learner, as YOU>",
      "options": [ { "text": "<what the learner chooses to DO>", "next": "<scene id>", "isCorrect": true, "feedback": "<1-2 sentence educational reason>" } ] }
      The learner makes a decision that drives the story forward.

SCENE STRUCTURE — output scenes with this shape. Each scene is a LOCATION with a single unfolding situation:

  { "id": "scene_1", "location": "<named place, one line>", "next": "<scene id>", "beats": [ <4-7 beats in order> ] }

Every scene MUST include a "next" field: the id of the scene that follows when this scene ends WITHOUT a choice at its end. The engine uses it, so:
  - A scene whose story continues automatically (no choice) sets its "next".
  - A scene that ENDS on a choice beat does not need "next" (options carry their own "next"), but it still helps to keep it.
  - The final scene sets "next": null or omits it.

Beat ordering rules:
  1. Use a MIX of kinds: dialogue, reactions, actions, an environmental change, a focus line, a discovery.
  2. Vary them. Do NOT put more than 2 dialogue beats in a row before something else happens.
  3. The learner must be pulled into the story (use "focus" and/or a "choice") before their decision.
  4. Every choice's options are concrete ACTIONS the learner takes in that situation, not abstract answers.
  5. Two separate scenes (e.g. scene_2a and scene_2b) may branch from one choice, but all branches REJOIN into ONE later scene. That rejoin scene sits AFTER the branch scenes in the array and moves the story forward; branch scenes never loop back into a scene that would replay.
  6. The engine advances scene-by-scene using "next" (never by array order). Keep the array order in the same sequence your "next" links describe.

ADVENTURE SHAPE:
  - Mission: title, problem, reward. The concept the learner typed is the MECHANISM that solves the problem — the story is built AROUND it, never stapled onto it.
  - Produce 3-4 short scenes total and 2-3 learner choices in the whole adventure.
  - Wrong choices must NOT end the mission. They cause an interesting in-universe consequence (see "action"/"env") plus constructive feedback, then rejoin the story.
  - Every scene, the learner is physically present as themselves.

CHARACTER BEHAVIOR:
  - Do not make every character a polite tutor. Characters disagree, tease, doubt, argue, mislead and get frustrated.
  - Each character must react to what the character BEFORE them actually said or did.
  - When a character is proven wrong, they react in-character (deflection, stubbornness, grudging respect, humor) — never a cheerful "great question!".
  - Use 2-4 characters max. Only include characters who change the story.

WRITING RULES:
  - Concise. Dialogue and text one or two sentences. Short words. Vivid but not flowery.
  - Concepts unfold through what characters DO and NOTICE, never through a lecture.
  - The ending must show the consequence of the learner's decisions and resolve the mission.

FINAL JSON SHAPE — return ONLY this JSON, nothing before or after, no code fences:

{
  "mission": { "title": "...", "problem": "...", "reward": "..." },
  "scenes": [
    { "id": "scene_1", "location": "...", "next": "scene_2a", "beats": [ ... ] },
    { "id": "scene_2a", "location": "...", "next": "scene_3", "beats": [ ... ] },
    { "id": "scene_2b", "location": "...", "beats": [ ... choice with "next":"scene_3" ... ] },
    { "id": "scene_3", "location": "...", "beats": [ ... ] }
  ],
  "discovery": { "title": "<name of the concept>", "text": "<2-3 accurate beginner sentences, connected to what just happened>" },
  "details": {
    "explanation": ["<3-5 short bullet sentences, plain language>"],
    "realWorld": ["<2-3 real-world examples>"],
    "practice": { "question": "<one question>", "options": ["<option>", "<option>", "<option>", "<option>"], "answer": 0, "explain": "<why>" }
  },
  "ending": { "text": "<in-universe resolution>", "funnyLine": "<one memorable character line>" }
}

BEFORE RETURNING, silently verify:
  - Does every non-choice beat respond to the beat BEFORE it?
  - Is the learner physically in the scene and addressed as themselves?
  - Do the characters argue/tease/doubt like real people instead of teaching?
  - Are action and environmental beats physically meaningful (they change or reveal something)?
  - Is every choice an ACTION the learner takes, with a visible consequence?
  - Do all branches rejoin? Does every "next" scene id exist?
  - Is the concept the mechanism that solves the problem?
  - Is everything short enough to feel like a 3-4 minute scene?
`;

  let content = null;

  try {
    // Retry loop: the open model occasionally returns malformed JSON or hits a
    // transient API error on the first attempt. Two attempts keeps the mission
    // playable without hammering the free tier.
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
Topic: ${topic}

The student is a complete beginner.

Teach this topic using the selected universe and character.

Make learning feel like a natural part of the interactive branching adventure rather than a classroom lesson.

Keep the explanation accurate, engaging, and easy to understand.

IMPORTANT OUTPUT RULE: Return ONLY a single valid JSON object exactly as specified in the system message. No prose, no markdown, no code fences, no extra text before or after the JSON.
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