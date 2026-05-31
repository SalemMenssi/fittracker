const buildDailyQuestFallback = (profile = {}) => {
  const time = profile.availableDailyTime || 30;
  const titles = [
    'Daily Awakening Quest',
    'Path of Growth',
    'System Trial',
    'Hunter\'s Daily Mission',
    'Mind & Body Protocol',
  ];
  const coaches = [
    'Today you will train your body, sharpen your mind, and reflect on your progress.',
    'The System has prepared a balanced challenge across multiple intelligences.',
    'Small steps today compound into rank-breaking growth tomorrow.',
    'Focus on weak areas while maintaining your strengths.',
  ];
  const title = titles[Math.floor(Math.random() * titles.length)];
  const coachMessage = coaches[Math.floor(Math.random() * coaches.length)];

  const allTasks = [
      {
        title: "Body Activation",
        description: "Do 3 sets of 10 squats and 10 push-ups.",
        category: "physical",
        intelligenceType: "bodilyKinesthetic",
        coreStatType: "strength",
        durationMinutes: 8,
        xpReward: 15,
        coinsReward: 5,
        difficulty: "Beginner",
        instructions: "Warm up first. Rest 30 seconds between sets.",
        proofType: "manual",
      },
      {
        title: "Logic Focus",
        description: "Solve one short logic puzzle or planning challenge.",
        category: "logical",
        intelligenceType: "logicalMathematical",
        coreStatType: "discipline",
        durationMinutes: 7,
        xpReward: 10,
        coinsReward: 3,
        difficulty: "Beginner",
        instructions: "Write your answer before checking the solution.",
        proofType: "text",
      },
      {
        title: "Inner Reflection",
        description: "Write 3 lines about what you want to improve today.",
        category: "reflection",
        intelligenceType: "intrapersonal",
        coreStatType: "willpower",
        durationMinutes: 5,
        xpReward: 10,
        coinsReward: 2,
        difficulty: "Easy",
        instructions: "Be honest and specific.",
        proofType: "text",
      },
      {
        title: "Word Craft",
        description: "Write 5 sentences about your main goal today.",
        category: "linguistic",
        intelligenceType: "linguistic",
        coreStatType: "discipline",
        durationMinutes: 5,
        xpReward: 10,
        coinsReward: 2,
        difficulty: "Beginner",
        instructions: "Use clear, specific language.",
        proofType: "text",
      },
    ];

  const shuffled = [...allTasks].sort(() => Math.random() - 0.5);
  const taskCount = 3 + Math.floor(Math.random() * 2);
  const tasks = shuffled.slice(0, taskCount);

  return {
    title,
    description: "A balanced daily quest to improve body, mind, and discipline.",
    difficulty: "Beginner",
    estimatedDuration: time,
    targetIntelligences: [...new Set(tasks.map((t) => t.intelligenceType))],
    targetCoreStats: [...new Set(tasks.map((t) => t.coreStatType))],
    coachMessage,
    tasks,
  };
};

const buildDailyQuestPrompt = (profile) => {
  return `You are "The System" — an RPG self-development coach. Generate ONE daily quest as JSON only.

USER PROFILE:
${JSON.stringify(profile, null, 2)}

RULES:
- Return ONLY valid JSON matching this exact structure (no markdown):
{
  "title": string,
  "description": string,
  "difficulty": "Beginner"|"Easy"|"Medium"|"Hard",
  "estimatedDuration": number (minutes),
  "targetIntelligences": string[] (keys: linguistic, logicalMathematical, spatial, musical, bodilyKinesthetic, naturalistic, interpersonal, intrapersonal),
  "targetCoreStats": string[] (keys: strength, endurance, agility, flexibility, willpower, cardioHealth, discipline),
  "coachMessage": string,
  "tasks": [{
    "title": string,
    "description": string,
    "category": "physical"|"logical"|"linguistic"|"creative"|"musical"|"social"|"nature"|"reflection"|"discipline",
    "intelligenceType": string,
    "coreStatType": string,
    "durationMinutes": number,
    "xpReward": number,
    "coinsReward": number,
    "difficulty": string,
    "instructions": string,
    "proofType": "manual"|"timer"|"text"|"photo"|"checklist"
  }]
}
- NEVER create a quest with only workout/physical tasks.
- Include at least 3 DIFFERENT intelligence types across tasks.
- Physical tasks are only ONE part of the routine.
- Adapt to user level and weak intelligence areas (add tasks targeting lows).
- Total task duration should fit availableDailyTime (${profile.availableDailyTime || 30} minutes).
- Include 3-6 tasks.`;
};

const parseQuestJson = (text) => {
  const cleaned = String(text || "").replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Invalid quest JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
};

const generateAIContent = async (prompt, raw = true) => {
  if (typeof fetch !== "function") {
    throw new Error("Server fetch API unavailable");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { text: JSON.stringify(buildDailyQuestFallback()), modelUsed: "free-local-fallback" };
  }

  const payload = {
    contents: [{ role: "user", parts: [{ text: raw ? `Return ONLY valid JSON with no markdown.\n\n${prompt}` : prompt }] }],
    generationConfig: raw ? { responseMimeType: "application/json" } : undefined,
  };

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash", "gemini-2.0-flash"];
  const apiVersions = ["v1beta", "v1"];
  let lastError = "Gemini request failed";

  for (const version of apiVersions) {
    for (const model of modelsToTry) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      const data = await response.json();
      if (response.ok) {
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return { text, modelUsed: model, apiVersion: version };
      }
      lastError = data?.error?.message || lastError;
      if (!String(lastError).toLowerCase().includes("not found")) break;
    }
  }

  return { text: JSON.stringify(buildDailyQuestFallback()), modelUsed: "free-local-fallback", note: lastError };
};

const generateDailyQuestData = async (profile) => {
  const prompt = buildDailyQuestPrompt(profile);
  const { text } = await generateAIContent(prompt, true);
  try {
    return parseQuestJson(text);
  } catch {
    return buildDailyQuestFallback(profile);
  }
};

module.exports = { generateDailyQuestData, buildDailyQuestFallback, buildDailyQuestPrompt, generateAIContent, parseQuestJson };
