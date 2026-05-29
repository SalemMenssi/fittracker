import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TESTS_DATA } from '../data/tests/testsData';
import { getPerformanceMetrics } from '../services/performanceService';
import { useIsFocused } from '@react-navigation/native';

export default function TestsListScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [userLevel, setUserLevel] = useState(1);
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await getPerformanceMetrics();
        setUserLevel(metrics.performanceLevel || 1);
        setCompletedTests(metrics.completedTests || []);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) fetchMetrics();
  }, [isFocused]);

  const isUnlocked = (index) => {
    const testNumber = index + 1;
    if (testNumber <= 10) {
      return userLevel >= testNumber;
    } else {
      const requiredLevel = 10 + (testNumber - 10) * 2;
      return userLevel >= requiredLevel;
    }
  };

  const getRequiredLevel = (index) => {
    const testNumber = index + 1;
    if (testNumber <= 10) return testNumber;
    return 10 + (testNumber - 10) * 2;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Knowledge Tests</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>LVL {userLevel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subTitle}>Unlock tests as you level up your fitness journey.</Text>
        
        <View style={styles.grid}>
          {TESTS_DATA.map((test, index) => {
            const unlocked = isUnlocked(index);
            const reqLevel = getRequiredLevel(index);
            const completed = completedTests.includes(test.id);
            
            return (
              <TouchableOpacity
                key={test.id}
                style={[styles.testCard, !unlocked && styles.testCardLocked, completed && styles.testCardCompleted]}
                onPress={() => unlocked && !completed && navigation.navigate('Test', { testId: test.id })}
                disabled={!unlocked || completed}
                activeOpacity={unlocked && !completed ? 0.7 : 1}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, !unlocked && styles.iconBoxLocked]}>
                    <Ionicons 
                      name={unlocked ? "document-text-outline" : "lock-closed-outline"} 
                      size={24} 
                      color={unlocked ? "#00c2c2" : "#aaa"} 
                    />
                  </View>
                  {!unlocked && (
                    <View style={styles.lockInfo}>
                      <Text style={styles.lockText}>Level {reqLevel}</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.testTitle, !unlocked && styles.testTitleLocked]}>{test.title}</Text>
                <Text style={styles.testMeta}>{test.quizzes.length} Questions</Text>
                
                {completed ? (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#2ecc71" />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                ) : unlocked ? (
                  <View style={styles.startBtn}>
                    <Text style={styles.startBtnText}>Take Test</Text>
                    <Ionicons name="chevron-forward" size={14} color="#00c2c2" />
                  </View>
                ) : (
                  <View style={styles.lockedBar}>
                    <View style={styles.lockedProgress} />
                  </View>
                )}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6f8' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  levelBadge: { backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  subTitle: { fontSize: 14, color: '#666', marginBottom: 25, lineHeight: 20 },
  grid: { gap: 16 },
  testCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2
  },
  testCardLocked: { backgroundColor: '#fafafa', borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#e8f9f9', justifyContent: 'center', alignItems: 'center' },
  iconBoxLocked: { backgroundColor: '#f0f0f0' },
  lockInfo: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  lockText: { color: '#ef4444', fontSize: 11, fontWeight: 'bold' },
  testTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  testTitleLocked: { color: '#999' },
  testMeta: { fontSize: 12, color: '#aaa', marginBottom: 15 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  startBtnText: { color: '#00c2c2', fontSize: 13, fontWeight: 'bold' },
  lockedBar: { height: 4, backgroundColor: '#eee', borderRadius: 2, overflow: 'hidden' },
  lockedProgress: { height: '100%', width: '0%', backgroundColor: '#ddd' },
  testCardCompleted: { borderColor: '#dcfce7', backgroundColor: '#f0fdf4' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { color: '#2ecc71', fontSize: 13, fontWeight: 'bold' }
});
