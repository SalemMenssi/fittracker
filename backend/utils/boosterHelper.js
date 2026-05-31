const applyXpBoosters = (user, task, baseXP) => {
  const now = new Date();
  const boosters = (user.activeBoosters || []).filter((b) => b.expiresAt && new Date(b.expiresAt) > now);
  let multiplier = 1;
  const appliedBoosters = [];

  for (const booster of boosters) {
    if (booster.effectType !== 'xpMultiplier') continue;
    const target = booster.target || 'all';
    const matches =
      target === 'all' ||
      target === task.intelligenceType ||
      target === task.category ||
      target === task.coreStatType;
    if (!matches) continue;
    const m = booster.multiplier || 1;
    if (m > multiplier) {
      multiplier = m;
      appliedBoosters.push({ itemId: booster.itemId, multiplier: m, target });
    }
  }

  const finalXP = Math.round(baseXP * multiplier);
  const bonusXP = finalXP - baseXP;
  return { baseXP, bonusXP, finalXP, multiplier, appliedBoosters };
};

const buildBoosterFromItem = (item) => {
  const boostPercent = item.boostPercent || 10;
  const multiplier = 1 + boostPercent / 100;
  const durationHours = item.durationHours || 24;
  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  let target = 'all';
  if (item.intelligenceBoost) target = item.intelligenceBoost;
  else if (item.type === 'xp_booster') target = 'all';
  else if (item.type === 'discipline_buff') target = 'discipline';

  return {
    itemId: item.itemId,
    effectType: 'xpMultiplier',
    target,
    multiplier,
    expiresAt,
  };
};

module.exports = { applyXpBoosters, buildBoosterFromItem };
