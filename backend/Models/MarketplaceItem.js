const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['skin', 'aura', 'xp_booster', 'intelligence_booster', 'focus_booster', 'discipline_buff', 'badge_frame', 'theme'],
    default: 'intelligence_booster',
  },
  intelligenceBoost: String,
  boostPercent: { type: Number, default: 10 },
  effectType: { type: String, default: 'xpMultiplier' },
  target: { type: String, default: 'all' },
  multiplier: { type: Number },
  durationHours: { type: Number, default: 24 },
  priceCoins: { type: Number, default: 50 },
  icon: String,
  rarity: { type: String, default: 'common' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
