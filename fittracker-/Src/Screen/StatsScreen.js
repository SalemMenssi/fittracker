import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getPerformanceMetrics } from '../services/performanceService';
import { useIsFocused } from '@react-navigation/native';

export default function StatsScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getPerformanceMetrics();
        setMetrics(data);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) fetchMetrics();
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </View>
    );
  }

  const { level = 1, streakDays = 0, classType = "Novice", stats = {} } = metrics || {};

  const statItems = [
    { label: 'Discipline', value: stats.discipline || 0, icon: 'brain', color: '#ff8c42' },
    { label: 'IQ', value: stats.iq || 0, icon: 'calculator', color: '#42c5f4' },
    { label: 'Strength', value: stats.strength || 0, icon: 'arm-flex', color: '#e74c3c' },
    { label: 'Social', value: stats.social || 0, icon: 'account-group', color: '#9b59b6' },
    { label: 'Social Knowledge', value: stats.socialKnowledge || 0, icon: 'book-open-variant', color: '#2ecc71' },
  ];

  // Logic for progress bar - let's assume 250 is a milestone
  const MAX_STAT = 250;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance Stats</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Badge Card */}
        <View style={styles.mainBadge}>
          <View style={styles.badgeCircle}>
            <Text style={styles.badgeLevel}>Lvl {level}</Text>
          </View>
          <Text style={styles.badgeClass}>{classType || "Novice"}</Text>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={20} color="#ff8c42" />
            <Text style={styles.streakText}>{streakDays} Day Streak</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Attribute Mastery</Text>
          {statItems.map((item, index) => {
            const progress = Math.min((item.value / MAX_STAT) * 100, 100);
            return (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statHeader, { marginBottom: 12 }]}>
                  <View style={styles.statInfoMain}>
                    <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                      <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                    </View>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                  <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                </View>

                {/* Progress Bar Container */}
                <View style={styles.progressBg}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progress}%`, backgroundColor: item.color }
                    ]} 
                  />
                </View>

                <View style={styles.milestoneRow}>
                  <Text style={styles.milestoneText}>0</Text>
                  <Text style={styles.milestoneText}>{MAX_STAT}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  scrollContent: { padding: 20 },
  mainBadge: { 
    backgroundColor: '#111', 
    borderRadius: 24, 
    padding: 30, 
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8
  },
  badgeCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    borderWidth: 3, 
    borderColor: '#00c2c2', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15
  },
  badgeLevel: { color: '#00c2c2', fontSize: 20, fontWeight: 'bold' },
  badgeClass: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.9 },
  streakText: { color: '#ff8c42', fontSize: 14, fontWeight: 'bold' },
  statsSection: { gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 8, letterSpacing: 0.5 },
  statCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statInfoMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  progressBg: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  milestoneRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  milestoneText: { fontSize: 10, color: '#aaa', fontWeight: '600' }
});
