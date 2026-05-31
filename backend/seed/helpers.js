const today = () => new Date().toISOString().slice(0, 10);

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const dateStr = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

module.exports = { today, daysAgo, daysFromNow, dateStr };
