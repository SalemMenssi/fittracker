import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { getProfile } from '../../services/AuthService';
import {
  getTodayQuest,
  generateTodayQuest,
  getQuestProgress,
  activateQuest,
  regenerateQuest,
  resolveQuestId,
} from '../../services/DailyQuestService';
import { getIntelligenceProfile, buildUserQuestProfile } from '../../services/IntelligenceService';
import IntelligenceRadarChart from '../../components/IntelligenceRadarChart';
import { INTELLIGENCE_META, INTELLIGENCE_KEYS } from '../../data/intelligenceConstants';
import { ROUTES } from '../../navigation/routes';
import { openStackScreen } from '../../navigation/openStackScreen';

export default function QuestsHubScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [user, setUser] = useState(null);
  const [dailyQuest, setDailyQuest] = useState(null);
  const [intelProfile, setIntelProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const p = await getProfile();
      setUser(p);
      const [quest, profile] = await Promise.all([
        getTodayQuest().catch(() => null),
        getIntelligenceProfile().catch(() => null),
      ]);
      setDailyQuest(quest);
      setIntelProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const quest = await generateTodayQuest(buildUserQuestProfile(user));
      setDailyQuest(quest);
    } catch (e) {
      Alert.alert('System', e.message || 'Could not generate quest');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartQuest = async () => {
    if (!dailyQuest) {
      await handleGenerate();
      return;
    }
    if (dailyQuest.status === 'pending') {
      try {
        const q = await activateQuest(resolveQuestId(dailyQuest));
        setDailyQuest(q);
      } catch (_) {}
    }
    openStackScreen(navigation, ROUTES.DAILY_QUEST_DETAIL, { quest: dailyQuest });
  };

  const questProgress = dailyQuest ? getQuestProgress(dailyQuest) : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Quests & Growth</Text>
        <Text style={styles.subtitle}>Daily missions and intelligence training</Text>

        <View style={styles.questCard}>
          <Text style={styles.cardLabel}>TODAY&apos;S QUEST</Text>
          {dailyQuest ? (
            <>
              <Text style={styles.questTitle}>{dailyQuest.title}</Text>
              <Text style={styles.questMeta}>~{dailyQuest.estimatedDuration || 30} min · {questProgress}% done</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${questProgress}%` }]} />
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No quest yet. Generate one to begin.</Text>
          )}
          <View style={styles.row}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleStartQuest} disabled={generating}>
              <Text style={styles.primaryBtnText}>{dailyQuest ? 'Continue Quest' : 'Generate Quest'}</Text>
            </TouchableOpacity>
            {dailyQuest && (
              <TouchableOpacity
                style={styles.secondaryBtn}
                disabled={generating}
                onPress={async () => {
                  setGenerating(true);
                  try {
                    const profile = buildUserQuestProfile(user);
                    setDailyQuest(await regenerateQuest(dailyQuest, profile));
                  } catch (e) {
                    Alert.alert('System', e.message || 'Could not regenerate quest');
                  } finally {
                    setGenerating(false);
                  }
                }}
              >
                <Text style={styles.secondaryBtnText}>Regenerate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.linkCard} onPress={() => openStackScreen(navigation, ROUTES.MARKETPLACE)}>
          <Ionicons name="cart-outline" size={24} color="#00c2c2" />
          <View style={styles.linkBody}>
            <Text style={styles.linkTitle}>Marketplace</Text>
            <Text style={styles.linkSub}>Boosters, items, and rewards</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Intelligence Profile</Text>
        <View style={styles.radarWrap}>
          <IntelligenceRadarChart
            stats={intelProfile?.intelligenceStats || user?.intelligenceStats || {}}
            size={240}
            maxValue={5}
          />
        </View>

        <Text style={styles.sectionTitle}>Train Each Intelligence</Text>
        <View style={styles.grid}>
          {INTELLIGENCE_KEYS.map((key) => {
            const meta = INTELLIGENCE_META[key];
            return (
              <TouchableOpacity
                key={key}
                style={styles.intelCard}
                onPress={() => openStackScreen(navigation, meta.screen, { intelligenceKey: key })}
              >
                <Ionicons name={meta.icon} size={22} color={meta.color} />
                <Text style={styles.intelLabel}>{meta.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#111' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 20 },
  questCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardLabel: { color: '#00c2c2', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  questTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 8 },
  questMeta: { color: '#aaa', fontSize: 13, marginTop: 6 },
  emptyText: { color: '#ccc', marginTop: 10 },
  progressBg: { height: 6, backgroundColor: '#333', borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00c2c2' },
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#00c2c2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: '#ccc', fontWeight: '600' },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  linkBody: { flex: 1, marginLeft: 12 },
  linkTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  linkSub: { fontSize: 12, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  radarWrap: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  intelCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  intelLabel: { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' },
});
