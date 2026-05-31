import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  INTELLIGENCE_KEYS, INTELLIGENCE_META, HUNTER_CLASSES,
  DEVELOPMENT_GOALS, TIME_OPTIONS, EQUIPMENT_OPTIONS,
} from '../../data/intelligenceConstants';
import { updateIntelligenceProfile } from '../../services/IntelligenceService';
import { generateTodayQuest } from '../../services/DailyQuestService';
import { buildUserQuestProfile } from '../../services/IntelligenceService';
import { getProfile, updateUser } from '../../services/AuthService';
import {
  registerForPushNotificationsAsync,
  scheduleDailyQuestReminder,
} from '../../services/notificationService';
import { RPG, cardStyle } from '../../theme/rpgTheme';

const STEPS = [
  'welcome', 'goals', 'intro', 'assessment', 'class', 'equipment', 'notifications', 'quest',
];

export default function OnboardingFlow({ navigation, route }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState(['generalGrowth']);
  const [assessment, setAssessment] = useState(
    Object.fromEntries(INTELLIGENCE_KEYS.map((k) => [k, 3]))
  );
  const [classType, setClassType] = useState('Balanced Hunter');
  const [equipment, setEquipment] = useState(['None']);
  const [dailyTime, setDailyTime] = useState(30);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [generating, setGenerating] = useState(false);
  const [generatedQuest, setGeneratedQuest] = useState(null);
  const [userName, setUserName] = useState(route.params?.fullName || 'Hunter');

  React.useEffect(() => {
    if (!route.params?.fullName) {
      getProfile().then((u) => u?.fullName && setUserName(u.fullName)).catch(() => {});
    }
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const saveProfile = async (extra = {}) => {
    const intelligenceStats = {};
    INTELLIGENCE_KEYS.forEach((k) => {
      intelligenceStats[k] = assessment[k] || 3;
    });
    await updateIntelligenceProfile({
      intelligenceStats,
      classType,
      availableEquipment: equipment,
      availableDailyTime: dailyTime,
      selectedDevelopmentFocus: goals,
      fitnessGoal: goals.includes('fitness') ? 'Build strength' : '',
      mentalGoal: goals.includes('mentalHealth') ? 'Mental clarity' : '',
      onboardingComplete: extra.onboardingComplete ?? false,
      hasCompletedOnboarding: extra.hasCompletedOnboarding ?? extra.onboardingComplete ?? false,
      ...extra,
    });
    await updateUser({
      reminderTime,
      classType,
      onboardingComplete: extra.onboardingComplete ?? false,
      hasCompletedOnboarding: extra.hasCompletedOnboarding ?? extra.onboardingComplete ?? false,
    });
  };

  const handleGenerateQuest = async () => {
    setGenerating(true);
    try {
      await saveProfile();
      const user = await getProfile();
      const profile = buildUserQuestProfile(user);
      const quest = await generateTodayQuest(profile);
      setGeneratedQuest(quest);
    } catch (e) {
      Alert.alert('System', e.message || 'Could not generate quest. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const finishOnboarding = async () => {
    await saveProfile({ onboardingComplete: true, hasCompletedOnboarding: true });
    await scheduleDailyQuestReminder(reminderTime);
    navigation.reset({ index: 0, routes: [{ name: 'User' }] });
  };

  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <Ionicons name="sparkles" size={56} color={RPG.accent} />
      <Text style={styles.heroTitle}>Welcome, {userName}.</Text>
      <Text style={styles.heroSub}>
        Your real-life growth system has awakened.
      </Text>
      <View style={cardStyle}>
        <Text style={styles.cardText}>
          FitTrack AI is now your RPG for self-development. Train body, mind, discipline,
          creativity, social power, and your full intelligence profile — not just the gym.
        </Text>
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={next}>
        <Text style={styles.primaryBtnText}>Enter the System</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGoals = () => (
    <ScrollView style={styles.flex}>
      <Text style={styles.stepTitle}>Select your goals</Text>
      {DEVELOPMENT_GOALS.map((g) => {
        const on = goals.includes(g.id);
        return (
          <TouchableOpacity
            key={g.id}
            style={[styles.option, on && styles.optionOn]}
            onPress={() => setGoals((prev) => on ? prev.filter((x) => x !== g.id) : [...prev, g.id])}
          >
            <Text style={[styles.optionText, on && styles.optionTextOn]}>{g.label}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={styles.primaryBtn} onPress={next}><Text style={styles.primaryBtnText}>Continue</Text></TouchableOpacity>
    </ScrollView>
  );

  const renderIntro = () => (
    <ScrollView style={styles.flex}>
      <Text style={styles.stepTitle}>Eight Intelligences</Text>
      <Text style={styles.stepDesc}>Howard Gardner's theory powers your quest system.</Text>
      {INTELLIGENCE_KEYS.map((k) => {
        const m = INTELLIGENCE_META[k];
        return (
          <View key={k} style={[cardStyle, { borderLeftWidth: 3, borderLeftColor: m.color }]}>
            <View style={styles.row}>
              <Ionicons name={m.icon} size={22} color={m.color} />
              <Text style={styles.cardTitle}>{m.label}</Text>
            </View>
          </View>
        );
      })}
      <TouchableOpacity style={styles.primaryBtn} onPress={next}><Text style={styles.primaryBtnText}>Rate My Profile</Text></TouchableOpacity>
    </ScrollView>
  );

  const renderAssessment = () => (
    <ScrollView style={styles.flex}>
      <Text style={styles.stepTitle}>Self-Assessment</Text>
      <Text style={styles.stepDesc}>Rate each intelligence from 1 (weak) to 5 (strong).</Text>
      {INTELLIGENCE_KEYS.map((k) => {
        const m = INTELLIGENCE_META[k];
        return (
          <View key={k} style={cardStyle}>
            <Text style={styles.cardTitle}>{m.label}</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.ratingBtn, assessment[k] === n && { backgroundColor: m.color }]}
                  onPress={() => setAssessment((a) => ({ ...a, [k]: n }))}
                >
                  <Text style={styles.ratingText}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}
      <TouchableOpacity style={styles.primaryBtn} onPress={next}><Text style={styles.primaryBtnText}>Choose Class</Text></TouchableOpacity>
    </ScrollView>
  );

  const renderClass = () => (
    <ScrollView style={styles.flex}>
      <Text style={styles.stepTitle}>Choose your class</Text>
      {HUNTER_CLASSES.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={[styles.option, classType === c.id && styles.optionOn]}
          onPress={() => setClassType(c.id)}
        >
          <Text style={[styles.optionText, classType === c.id && styles.optionTextOn]}>{c.id}</Text>
          <Text style={styles.optionSub}>{c.focus}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.primaryBtn} onPress={next}><Text style={styles.primaryBtnText}>Continue</Text></TouchableOpacity>
    </ScrollView>
  );

  const renderEquipment = () => (
    <ScrollView style={styles.flex}>
      <Text style={styles.stepTitle}>Equipment & Time</Text>
      {EQUIPMENT_OPTIONS.map((eq) => (
        <TouchableOpacity
          key={eq}
          style={[styles.option, equipment.includes(eq) && styles.optionOn]}
          onPress={() => setEquipment((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq])}
        >
          <Text style={styles.optionText}>{eq}</Text>
        </TouchableOpacity>
      ))}
      <Text style={[styles.stepTitle, { marginTop: 16 }]}>Daily available time</Text>
      <View style={styles.timeRow}>
        {TIME_OPTIONS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.timeBtn, dailyTime === t && styles.optionOn]}
            onPress={() => setDailyTime(t)}
          >
            <Text style={styles.optionText}>{t}m</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={next}><Text style={styles.primaryBtnText}>Continue</Text></TouchableOpacity>
    </ScrollView>
  );

  const renderNotifications = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>System Notifications</Text>
      <View style={cardStyle}>
        {['Daily quest reminders', 'Streak protection', 'Challenge alerts', 'AI coach messages', 'Badge unlocks'].map((t) => (
          <View key={t} style={styles.row}><Ionicons name="checkmark-circle" size={18} color={RPG.accent} /><Text style={styles.cardText}> {t}</Text></View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={async () => {
          await registerForPushNotificationsAsync();
          next();
        }}
      >
        <Text style={styles.primaryBtnText}>Enable & Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => { next(); setTimeout(handleGenerateQuest, 100); }}>
        <Text style={styles.secondaryText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuest = () => (
    <View style={styles.stepContent}>
      {generating ? (
        <>
          <ActivityIndicator size="large" color={RPG.accent} />
          <Text style={styles.loadingText}>The System is analyzing your profile...</Text>
        </>
      ) : generatedQuest ? (
        <ScrollView>
          <Text style={styles.stepTitle}>{generatedQuest.title}</Text>
          <Text style={styles.stepDesc}>{generatedQuest.coachMessage || generatedQuest.description}</Text>
          <View style={cardStyle}>
            <Text style={styles.cardText}>{generatedQuest.tasks?.length || 0} tasks · ~{generatedQuest.estimatedDuration} min</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={finishOnboarding}>
            <Text style={styles.primaryBtnText}>Accept Quest</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          <Text style={styles.loadingText}>Preparing your first quest...</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerateQuest}>
            <Text style={styles.primaryBtnText}>Generate Quest</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const screens = {
    welcome: renderWelcome,
    goals: renderGoals,
    intro: renderIntro,
    assessment: renderAssessment,
    class: renderClass,
    equipment: renderEquipment,
    notifications: renderNotifications,
    quest: renderQuest,
  };

  React.useEffect(() => {
    if (STEPS[step] === 'quest' && !generatedQuest && !generating) {
      handleGenerateQuest();
    }
  }, [step]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>
      {step > 0 && step < STEPS.length - 1 && (
        <TouchableOpacity onPress={back} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={RPG.textMuted} />
        </TouchableOpacity>
      )}
      <View style={styles.flex}>
        {screens[STEPS[step]]()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RPG.bg, padding: 20 },
  flex: { flex: 1 },
  progress: { flexDirection: 'row', gap: 4, marginBottom: 16 },
  dot: { flex: 1, height: 3, backgroundColor: RPG.cardBorder, borderRadius: 2 },
  dotActive: { backgroundColor: RPG.accent },
  backBtn: { marginBottom: 8 },
  stepContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { color: RPG.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 16 },
  heroSub: { color: RPG.accent, fontSize: 16, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  stepTitle: { color: RPG.text, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  stepDesc: { color: RPG.textMuted, marginBottom: 16 },
  cardText: { color: RPG.textMuted, lineHeight: 22 },
  cardTitle: { color: RPG.text, fontWeight: '600', marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  primaryBtn: { backgroundColor: RPG.accent, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#0d1117', fontWeight: '800', fontSize: 16 },
  secondaryBtn: { padding: 12, alignItems: 'center' },
  secondaryText: { color: RPG.textMuted },
  option: { ...cardStyle, padding: 14 },
  optionOn: { borderColor: RPG.accent, backgroundColor: '#00c2c211' },
  optionText: { color: RPG.textMuted, fontWeight: '600' },
  optionTextOn: { color: RPG.accent },
  optionSub: { color: RPG.textMuted, fontSize: 12, marginTop: 4 },
  ratingRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  ratingBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: RPG.cardBorder, alignItems: 'center', justifyContent: 'center' },
  ratingText: { color: '#fff', fontWeight: '700' },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: RPG.card, borderWidth: 1, borderColor: RPG.cardBorder },
  loadingText: { color: RPG.accent, marginTop: 16, fontSize: 16, textAlign: 'center' },
});
