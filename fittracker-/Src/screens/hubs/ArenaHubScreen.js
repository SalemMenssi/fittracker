import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../navigation/routes';
import { openStackScreen } from '../../navigation/openStackScreen';

const ARENA_FEATURES = [
  {
    route: ROUTES.CHALLENGES,
    title: 'Challenges',
    subtitle: 'Join community goals and earn XP',
    icon: 'flash-outline',
    color: '#ff8c42',
  },
  {
    route: ROUTES.LEADERBOARD,
    title: 'Leaderboard',
    subtitle: 'See top hunters ranked by performance',
    icon: 'podium-outline',
    color: '#00c2c2',
  },
  {
    route: ROUTES.SOCIAL,
    title: 'Social Feed',
    subtitle: 'Share progress and connect with others',
    icon: 'people-outline',
    color: '#9b59b6',
  },
  {
    route: ROUTES.TESTS_LIST,
    title: 'Skills Tests',
    subtitle: 'Assess discipline, IQ, strength, and more',
    icon: 'school-outline',
    color: '#3498db',
  },
  {
    route: ROUTES.WORKOUTS,
    title: 'Activity Tracker',
    subtitle: 'Log workouts and track fitness sessions',
    icon: 'fitness-outline',
    color: '#e74c3c',
  },
  {
    route: ROUTES.AWARDS,
    title: 'Achievements',
    subtitle: 'Badges and milestones you have earned',
    icon: 'trophy-outline',
    color: '#f1c40f',
  },
  {
    route: ROUTES.COURSES,
    title: 'Browse Courses',
    subtitle: 'Explore all available routines',
    icon: 'library-outline',
    color: '#2ecc71',
  },
];

export default function ArenaHubScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Arena</Text>
        <Text style={styles.subtitle}>Compete, connect, test skills, and track activity</Text>

        {ARENA_FEATURES.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.card}
            onPress={() => openStackScreen(navigation, item.route)}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${item.color}22` }]}>
              <Ionicons name={item.icon} size={26} color={item.color} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#111' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, marginLeft: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  cardSub: { fontSize: 12, color: '#888', marginTop: 3 },
});
