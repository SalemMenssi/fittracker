export const buildQuestGenerationPrompt = (profile) => {
  return `Generate a daily self-development RPG quest as JSON only.

USER PROFILE:
${JSON.stringify(profile, null, 2)}

RULES:
- Return ONLY valid JSON (no markdown).
- Structure: { title, description, difficulty, estimatedDuration, targetIntelligences[], targetCoreStats[], coachMessage, tasks[] }
- Each task: { title, description, category, intelligenceType, coreStatType, durationMinutes, xpReward, coinsReward, difficulty, instructions, proofType }
- categories: physical, logical, linguistic, creative, musical, social, nature, reflection, discipline
- intelligenceType keys: linguistic, logicalMathematical, spatial, musical, bodilyKinesthetic, naturalistic, interpersonal, intrapersonal
- NEVER only workout tasks. At least 3 different intelligence types. Physical is only one part.
- Adapt to weak intelligence areas. Fit total duration to availableDailyTime.`;
};
