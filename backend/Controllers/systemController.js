const askSystem = async (req, res) => {
  try {
    if (typeof fetch !== "function") {
      return res.status(500).json({ message: "Server fetch API unavailable. Use Node 18+." });
    }

    const prompt = (req.body?.prompt || "").trim();
    const raw = !!req.body?.raw;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const buildFreeSystemReply = (input) => {
      const q = input.toLowerCase();
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

      if (q.includes('study') || q.includes('read') || q.includes('learn')) {
        return pick([
          'Daily Quest set: 40-minute deep focus block, 10-minute recall notes, no social media until complete. Reward: +30 EXP.',
          'Scholar path unlocked: read 10 pages, summarize in 3 bullets, teach one idea to yourself out loud. Reward: +28 EXP.',
          'Focus raid: one hard study block, one review pass, one practice question. Reward: +25 EXP.',
        ]);
      }
      if (q.includes('fitness') || q.includes('workout') || q.includes('gym') || q.includes('exercise')) {
        return pick([
          'Hunter Conditioning Quest: 3-round bodyweight circuit, 10-minute mobility reset, hydration check. Reward: +35 EXP.',
          'Body protocol: warm-up, strength block, cooldown stretch. Log reps before rest. Reward: +32 EXP.',
          'Movement quest: 20 minutes activity + 5 minutes balance work. Reward: +30 EXP.',
        ]);
      }
      if (q.includes('productivity') || q.includes('focus') || q.includes('task')) {
        return pick([
          'Productivity Raid: pick top 3 tasks, finish the hardest first, ship one measurable result today. Reward: +25 EXP.',
          'Priority strike: one deep-work block, one admin sweep, one clear win before evening. Reward: +22 EXP.',
          'Execution quest: define done, time-box 45 minutes, review outcome in 3 lines. Reward: +24 EXP.',
        ]);
      }
      if (q.includes('today') || q.includes('should i') || q.includes('what')) {
        return pick([
          'Start with one high-focus task, one health habit, and a short reflection tonight. Reward: +20 EXP.',
          'Balance today: train body 15 minutes, sharpen mind 15 minutes, journal 5 minutes. Reward: +22 EXP.',
          'Pick your weakest intelligence and do one small challenge for it today. Reward: +24 EXP.',
        ]);
      }
      return pick([
        'Complete one high-focus task, one health habit, and log progress tonight. Reward: +20 EXP.',
        'Three-step quest: plan 5 minutes, execute 30 minutes, reflect 5 minutes. Reward: +20 EXP.',
        'Small wins stack: one discipline action, one growth action, one recovery action. Reward: +22 EXP.',
        'The System recommends one challenge outside your comfort zone today. Reward: +25 EXP.',
      ]);
    };
    const buildFreeRawJson = (input) => {
      const q = String(input || "").toLowerCase();
      const baseRoutine = {
        title: "Daily Foundation Protocol",
        description: "A balanced routine to build consistency, focus, and momentum.",
        category: "Discipline",
        difficulty: "Medium",
        levelRequirement: 1,
        duration: "30 Minutes",
        status: "open",
        image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400",
        rules: ["Show up daily", "No task skipping", "Log completion at night"],
        tasks: [
          { title: "Morning Plan", description: "Write top 3 priorities for today" },
          { title: "Focus Session", description: "Complete one uninterrupted 40-minute block" },
          { title: "Reflection", description: "Write a short end-of-day review" },
        ],
      };
      const baseChallenge = {
        title: "7-Day Discipline Trial",
        description: "Maintain consistency for one full week.",
        category: "Discipline",
        difficulty: "Medium",
        levelRequirement: 1,
        expReward: 120,
        status: "open",
        startDate: new Date().toISOString().slice(0, 10),
        expiryDate: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); })(),
        rules: ["No missed day", "Complete all listed tasks", "Submit daily check-in"],
        tasks: [
          { title: "Core Quest", description: "Finish your primary daily task before 6 PM" },
          { title: "Health Habit", description: "Complete one health action (walk, stretch, hydrate)" },
          { title: "System Log", description: "Record proof of completion" },
        ],
      };
      return q.includes("challenge") ? JSON.stringify(baseChallenge) : JSON.stringify(baseRoutine);
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ text: raw ? buildFreeRawJson(prompt) : buildFreeSystemReply(prompt), modelUsed: 'free-local-fallback' });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: raw
              ? `Return ONLY valid JSON with no markdown and no extra text. User request: ${prompt}`
              : `You are "The System" in a gamified routine app. Keep answers short, motivating, and practical.\n\nUser request: ${prompt}` },
          ],
        },
      ],
      generationConfig: raw ? { responseMimeType: "application/json" } : undefined,
    };

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ];
    const apiVersions = ["v1beta", "v1"];

    let lastError = "Gemini request failed";
    for (const version of apiVersions) {
      for (const model of modelsToTry) {
        const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok) {
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "System response unavailable.";
          return res.json({ text: raw ? text : text, modelUsed: model, apiVersion: version });
        }

        lastError = data?.error?.message || lastError;
        if (!String(lastError).toLowerCase().includes("not found")) break;
      }
    }

    // Free fallback if external model fails
    return res.json({ text: raw ? buildFreeRawJson(prompt) : buildFreeSystemReply(prompt), modelUsed: 'free-local-fallback', note: lastError });
  } catch (error) {
    const prompt = (req.body?.prompt || "").trim();
    const raw = !!req.body?.raw;
    const fallback = prompt
      ? 'Complete one main quest now, then one bonus quest before day end. Reward: +20 EXP.'
      : 'Set one focused quest and complete it before evening.';
    const rawJson = JSON.stringify({
      title: "Fallback Routine",
      description: "Emergency autofill response",
      category: "Discipline",
      difficulty: "Medium",
      levelRequirement: 1,
      duration: "30 Minutes",
      status: "open",
      rules: ["Stay consistent"],
      tasks: [{ title: "Focus Block", description: "Complete one focused session" }],
    });
    return res.json({ text: raw ? rawJson : fallback, modelUsed: "free-local-fallback", note: error.message });
  }
};

module.exports = { askSystem };
