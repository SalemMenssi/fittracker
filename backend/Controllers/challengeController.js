const Challenge = require('../Models/Challenge');
const User = require('../Models/User');

const hydrateStatus = (challenge) => {
  const now = new Date();
  if (challenge.status !== 'completed' && challenge.expiryDate < now) {
    challenge.status = 'expired';
  }
  return challenge;
};

const getChallenges = async (_req, res) => {
  try {
    const challenges = await Challenge.find({});
    res.json(challenges.map(hydrateStatus));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.create(req.body);
    res.status(201).json(challenge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    Object.assign(challenge, req.body);
    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteChallenge = async (req, res) => {
  try {
    await Challenge.deleteOne({ _id: req.params.id });
    res.json({ message: 'Challenge removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    const user = await User.findById(req.user._id);
    if (!challenge || !user) return res.status(404).json({ message: 'Challenge or user not found' });
    if (new Date(challenge.expiryDate) < new Date()) return res.status(400).json({ message: 'Challenge has expired' });

    const joined = challenge.joinedUsers.some((id) => id.toString() === user._id.toString());
    if (!joined) challenge.joinedUsers.push(user._id);
    if (!user.joinedChallenges.some((id) => id.toString() === challenge._id.toString())) user.joinedChallenges.push(challenge._id);
    await Promise.all([challenge.save(), user.save()]);
    res.json({ message: 'Challenge accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChallenges, createChallenge, updateChallenge, deleteChallenge, joinChallenge };
