import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INTELLIGENCE_META } from '../../data/intelligenceConstants';
import { getIntelligenceProfile } from '../../services/IntelligenceService';
import { generateTodayQuest } from '../../services/DailyQuestService';
import { buildUserQuestProfile } from '../../services/IntelligenceService';
import { getProfile } from '../../services/AuthService';
import { getStatHistory, getStatHistorySummary } from '../../services/StatHistoryService';
import StatHistoryChart from '../../components/StatHistoryChart';
import { openStackScreen } from '../../navigation/openStackScreen';
import { ROUTES } from '../../navigation/routes';
import { RPG, cardStyle } from '../../theme/rpgTheme';

const DESCRIPTIONS = {
  linguistic: 'Reading, writing, vocabulary, storytelling, and communication.',
  logicalMathematical: 'Logic puzzles, problem solving, math, patterns, and planning.',
  spatial: 'Visualization, drawing, memory maps, design, and mental imagery.',
  musical: 'Rhythm, listening focus, sound recognition, and beat coordination.',
  bodilyKinesthetic: 'Workout, stretching, balance, coordination, and endurance.',
  naturalistic: 'Outdoor observation, nature walks, hydration, and healthy habits.',
  interpersonal: 'Social challenges, empathy, conversation, and community.',
  intrapersonal: 'Journaling, self-reflection, mood checks, and personal growth.',
};

const EXERCISES = {
  linguistic: ['Write 5 sentences about your goal', 'Read 10 pages', 'Learn 5 new words'],
  logicalMathematical: ['Solve a 3-step planning problem', 'Complete a logic puzzle', 'Analyze a decision matrix'],
  spatial: ['Draw your ideal workspace', 'Create a memory map', 'Visualize a goal for 5 minutes'],
  musical: ['3 minutes rhythmic breathing', 'Listen focus — one song', 'Clap a steady beat for 2 minutes'],
  bodilyKinesthetic: ['15 squats + 10 push-ups', '10-minute stretch', 'Balance hold 60s each leg'],
  naturalistic: ['3-minute environment observation', 'Hydration check + walk', 'Log one healthy meal'],
  interpersonal: ['Send a positive message', '5-minute conversation', 'Offer help to someone'],
  intrapersonal: ['Write one self-insight', '5-minute meditation', 'Review today\'s top goal'],
};

export default function IntelligenceDetailScreen({ navigation, route }) {
  const intelligenceKey = route.params?.intelligenceKey;
  const meta = INTELLIGENCE_META[intelligenceKey] || {};
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, hist, sum] = await Promise.all([
          getIntelligenceProfile(),
          getStatHistory('intelligence', intelligenceKey, 20).catch(() => []),
          getStatHistorySummary('intelligence', intelligenceKey).catch(() => null),
        ]);
        setStats(p.intelligenceStats || {});
        setHistory(hist);
        setSummary(sum);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, [intelligenceKey]);

  const level = stats?.[intelligenceKey] ?? 1;
  const typeSummary = summary?.summary?.find((s) => s.statType === intelligenceKey);
  const totalGain = typeSummary?.totalGain ?? history.reduce((a, h) => a + (h.delta || 0), 0);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const user = await getProfile();
      const quest = await generateTodayQuest(buildUserQuestProfile(user));
      openStackScreen(navigation, ROUTES.DAILY_QUEST_DETAIL, { quest });
    } catch (e) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={RPG.accent} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{meta.label}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[cardStyle, { alignItems: 'center' }]}>
          <Ionicons name={meta.icon} size={48} color={meta.color} />
          <Text style={styles.level}>Level {level.toFixed(1)}</Text>
          <Text style={styles.gain}>Total improvement: +{totalGain.toFixed(2)}</Text>
        </View>

        <Text style={styles.section}>Progress History</Text>
        <View style={cardStyle}>
          <StatHistoryChart entries={history} width={300} height={100} color={meta.color} />
        </View>

        {history.length > 0 && (
          <View style={cardStyle}>
            <Text style={styles.section}>Recent Gains</Text>
            {history.slice(0, 5).map((h) => (
              <View key={h._id} style={styles.historyRow}>
                <Text style={styles.historyDelta}>+{h.delta?.toFixed(2)}</Text>
                <Text style={styles.historyMeta} numberOfLines={1}>
                  {h.taskTitle || h.source} · {new Date(h.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.desc}>{DESCRIPTIONS[intelligenceKey]}</Text>
        <Text style={styles.section}>Recommended exercises</Text>
        {(EXERCISES[intelligenceKey] || []).map((ex) => (
          <View key={ex} style={cardStyle}><Text style={styles.exText}>{ex}</Text></View>
        ))}

        {(summary?.relatedQuests || []).length > 0 && (
          <>
            <Text style={styles.section}>Related quests</Text>
            {summary.relatedQuests.slice(0, 3).map((q) => (
              <View key={q._id} style={cardStyle}>
                <Text style={styles.exText}>{q.title} · {q.date}</Text>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.btn} onPress={handleGenerate} disabled={generating}>
          {generating ? <ActivityIndicator color="#0d1117" /> : (
            <Text style={styles.btnText}>Generate quest for this intelligence</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RPG.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  level: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 12 },
  gain: { color: RPG.accent, marginTop: 6, fontSize: 14 },
  desc: { color: RPG.textMuted, lineHeight: 22, marginVertical: 16 },
  section: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  exText: { color: RPG.textMuted },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  historyDelta: { color: RPG.accent, fontWeight: '700', width: 50 },
  historyMeta: { flex: 1, color: RPG.textMuted, fontSize: 12 },
  btn: { backgroundColor: RPG.accent, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0d1117', fontWeight: '800' },
});
