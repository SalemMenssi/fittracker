const MarketplaceItem = require('../Models/MarketplaceItem');
const User = require('../Models/User');
const { buildBoosterFromItem } = require('../utils/boosterHelper');

const DEFAULT_ITEMS = [
  { itemId: 'logic_crystal', name: 'Logic Crystal', description: 'Boosts logical quest XP by 10%', type: 'intelligence_booster', intelligenceBoost: 'logicalMathematical', boostPercent: 10, effectType: 'xpMultiplier', durationHours: 24, priceCoins: 80, icon: 'diamond-outline', rarity: 'rare' },
  { itemId: 'writers_scroll', name: "Writer's Scroll", description: 'Boosts linguistic quest XP', type: 'intelligence_booster', intelligenceBoost: 'linguistic', boostPercent: 10, effectType: 'xpMultiplier', durationHours: 24, priceCoins: 75, icon: 'document-text-outline', rarity: 'rare' },
  { itemId: 'shadow_aura', name: 'Shadow Aura', description: 'Boosts intrapersonal XP', type: 'aura', intelligenceBoost: 'intrapersonal', boostPercent: 10, effectType: 'xpMultiplier', durationHours: 24, priceCoins: 120, icon: 'moon-outline', rarity: 'epic' },
  { itemId: 'nature_cloak', name: 'Nature Cloak', description: 'Boosts naturalistic XP', type: 'skin', intelligenceBoost: 'naturalistic', boostPercent: 10, effectType: 'xpMultiplier', durationHours: 24, priceCoins: 90, icon: 'leaf-outline', rarity: 'rare' },
  { itemId: 'rhythm_core', name: 'Rhythm Core', description: 'Boosts musical XP', type: 'intelligence_booster', intelligenceBoost: 'musical', boostPercent: 10, effectType: 'xpMultiplier', durationHours: 24, priceCoins: 70, icon: 'musical-notes-outline', rarity: 'common' },
  { itemId: 'warrior_gloves', name: 'Warrior Gloves', description: 'Boosts bodily-kinesthetic XP', type: 'intelligence_booster', intelligenceBoost: 'bodilyKinesthetic', boostPercent: 10, effectType: 'xpMultiplier', durationHours: 24, priceCoins: 85, icon: 'fitness-outline', rarity: 'rare' },
  { itemId: 'discipline_sigil', name: 'Discipline Sigil', description: 'Discipline buff for 24h', type: 'discipline_buff', target: 'discipline', boostPercent: 15, effectType: 'xpMultiplier', durationHours: 24, priceCoins: 100, icon: 'shield-outline', rarity: 'epic' },
  { itemId: 'xp_amplifier', name: 'XP Amplifier', description: '+20% XP on quests', type: 'xp_booster', target: 'all', boostPercent: 20, effectType: 'xpMultiplier', durationHours: 24, priceCoins: 150, icon: 'flash-outline', rarity: 'legendary' },
];

const ensureDefaultItems = async () => {
  for (const item of DEFAULT_ITEMS) {
    const multiplier = item.multiplier || 1 + (item.boostPercent || 10) / 100;
    await MarketplaceItem.findOneAndUpdate(
      { itemId: item.itemId },
      { ...item, multiplier, target: item.target || item.intelligenceBoost || 'all' },
      { upsert: true }
    );
  }
};

const getItems = async (req, res) => {
  try {
    await ensureDefaultItems();
    const items = await MarketplaceItem.find({ active: true });
    const user = await User.findById(req.user._id).select('inventory activeBoosters coins');
    res.json({ items, inventory: user?.inventory || [], activeBoosters: user?.activeBoosters || [], coins: user?.coins || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const purchaseItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const item = await MarketplaceItem.findOne({ itemId: req.params.itemId });
    if (!user || !item) return res.status(404).json({ message: 'Not found' });

    if ((user.coins || 0) < item.priceCoins) {
      return res.status(400).json({ message: 'Not enough coins' });
    }

    const owns = user.inventory?.some((i) => i.itemId === item.itemId);
    const isConsumable = ['xp_booster', 'intelligence_booster', 'discipline_buff', 'focus_booster'].includes(item.type);

    if (owns && !isConsumable) {
      return res.status(400).json({ message: 'Already owned' });
    }

    user.coins -= item.priceCoins;
    if (!owns) {
      user.inventory = user.inventory || [];
      user.inventory.push({ itemId: item.itemId, purchasedAt: new Date() });
    }

    if (item.type === 'aura') user.equippedAura = item.itemId;
    if (item.type === 'skin') user.equippedSkin = item.itemId;

    if (isConsumable || item.effectType === 'xpMultiplier') {
      const booster = buildBoosterFromItem(item);
      user.activeBoosters = user.activeBoosters || [];
      user.activeBoosters = user.activeBoosters.filter((b) => b.itemId !== item.itemId);
      user.activeBoosters.push(booster);
    }

    await user.save();
    res.json({
      user: { coins: user.coins, inventory: user.inventory, activeBoosters: user.activeBoosters },
      item,
      boosterActivated: isConsumable,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activateItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const item = await MarketplaceItem.findOne({ itemId: req.params.itemId });
    if (!user || !item) return res.status(404).json({ message: 'Not found' });

    const owns = user.inventory?.some((i) => i.itemId === item.itemId);
    if (!owns) return res.status(400).json({ message: 'Item not in inventory' });

    const booster = buildBoosterFromItem(item);
    user.activeBoosters = user.activeBoosters || [];
    user.activeBoosters = user.activeBoosters.filter((b) => b.itemId !== item.itemId);
    user.activeBoosters.push(booster);
    await user.save();

    res.json({ activeBoosters: user.activeBoosters, message: `${item.name} activated for 24h` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getItems, purchaseItem, activateItem, ensureDefaultItems };
