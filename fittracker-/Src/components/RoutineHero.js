import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RoutineHero({ total = 0, active = 0, tasksDone = 0 }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [total, active, tasksDone]);

  const stats = [
    { label: 'Available', value: total, icon: 'library-outline', color: '#00c2c2' },
    { label: 'Active', value: active, icon: 'flash-outline', color: '#ff8c42' },
    { label: 'Tasks done', value: tasksDone, icon: 'checkmark-done-outline', color: '#1a9d5c' },
  ];

  return (
    <Animated.View style={[styles.hero, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.heroLabel}>ROUTINE HUB</Text>
          <Text style={styles.heroTitle}>Build daily habits</Text>
          <Text style={styles.heroSub}>Flip any card to preview tasks & guidelines</Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="barbell" size={28} color="#00c2c2" />
        </View>
      </View>
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statBox}>
            <Ionicons name={s.icon} size={18} color={s.color} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 18,
    padding: 18,
    overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { color: '#00c2c2', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  heroSub: { color: '#aaa', fontSize: 13, marginTop: 6, maxWidth: 240, lineHeight: 18 },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(0,194,194,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#999', fontSize: 11, fontWeight: '600' },
});
