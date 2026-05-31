export const INTELLIGENCE_KEYS = [
  'linguistic',
  'logicalMathematical',
  'spatial',
  'musical',
  'bodilyKinesthetic',
  'naturalistic',
  'interpersonal',
  'intrapersonal',
];

export const INTELLIGENCE_META = {
  linguistic: { label: 'Linguistic', short: 'Word', icon: 'book-outline', color: '#4ecdc4', screen: 'LinguisticDetail' },
  logicalMathematical: { label: 'Logical', short: 'Logic', icon: 'calculator-outline', color: '#45b7d1', screen: 'LogicalDetail' },
  spatial: { label: 'Spatial', short: 'Spatial', icon: 'cube-outline', color: '#96ceb4', screen: 'SpatialDetail' },
  musical: { label: 'Musical', short: 'Rhythm', icon: 'musical-notes-outline', color: '#ffeaa7', screen: 'MusicalDetail' },
  bodilyKinesthetic: { label: 'Body', short: 'Body', icon: 'body-outline', color: '#ff6b6b', screen: 'BodilyDetail' },
  naturalistic: { label: 'Nature', short: 'Nature', icon: 'leaf-outline', color: '#55efc4', screen: 'NaturalisticDetail' },
  interpersonal: { label: 'Social', short: 'Social', icon: 'people-outline', color: '#a29bfe', screen: 'InterpersonalDetail' },
  intrapersonal: { label: 'Self', short: 'Self', icon: 'person-outline', color: '#fd79a8', screen: 'IntrapersonalDetail' },
};

export const CORE_STAT_KEYS = [
  'strength', 'endurance', 'agility', 'flexibility', 'willpower', 'cardioHealth', 'discipline',
];

export const CORE_STAT_META = {
  strength: { label: 'Strength', icon: 'barbell-outline' },
  endurance: { label: 'Endurance', icon: 'timer-outline' },
  agility: { label: 'Agility', icon: 'flash-outline' },
  flexibility: { label: 'Flexibility', icon: 'body-outline' },
  willpower: { label: 'Willpower', icon: 'flame-outline' },
  cardioHealth: { label: 'Cardio', icon: 'heart-outline' },
  discipline: { label: 'Discipline', icon: 'shield-outline' },
};

export const HUNTER_CLASSES = [
  { id: 'Strength Fighter', focus: 'body, strength, endurance', intelligences: ['bodilyKinesthetic'] },
  { id: 'Logic Mage', focus: 'logic, planning, problem solving', intelligences: ['logicalMathematical'] },
  { id: 'Word Scholar', focus: 'reading, writing, communication', intelligences: ['linguistic'] },
  { id: 'Spatial Architect', focus: 'design, visualization', intelligences: ['spatial'] },
  { id: 'Rhythm Monk', focus: 'rhythm, breathing, focus', intelligences: ['musical'] },
  { id: 'Nature Ranger', focus: 'outdoor habits, health awareness', intelligences: ['naturalistic'] },
  { id: 'Social Leader', focus: 'empathy, communication', intelligences: ['interpersonal'] },
  { id: 'Inner Shadow', focus: 'reflection, discipline, self-control', intelligences: ['intrapersonal'] },
  { id: 'Balanced Hunter', focus: 'all-round development', intelligences: INTELLIGENCE_KEYS },
];

export const DEVELOPMENT_GOALS = [
  { id: 'fitness', label: 'Build strength' },
  { id: 'weight', label: 'Lose weight' },
  { id: 'discipline', label: 'Improve discipline' },
  { id: 'intelligence', label: 'Improve intelligence' },
  { id: 'creativity', label: 'Improve creativity' },
  { id: 'communication', label: 'Improve communication' },
  { id: 'confidence', label: 'Improve confidence' },
  { id: 'mentalHealth', label: 'Improve mental clarity' },
  { id: 'generalGrowth', label: 'Balanced self-development' },
];

export const TIME_OPTIONS = [10, 20, 30, 45, 60];

export const EQUIPMENT_OPTIONS = [
  'None', 'Dumbbells', 'Resistance bands', 'Yoga mat', 'Pull-up bar', 'Full gym',
];
