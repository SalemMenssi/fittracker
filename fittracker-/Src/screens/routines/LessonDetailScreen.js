import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import BackButton from '../../components/BackButton';

export default function LessonDetailScreen({ navigation, route }) {
  const { lessonId, title } = route.params || {};
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <BackButton navigation={navigation} />
      </View>
      <Text style={styles.title}>{title || 'Lesson'}</Text>
      <Text style={styles.sub}>Lesson ID: {lessonId}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8', padding: 20 },
  topRow: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  sub: { fontSize: 14, color: '#888', marginTop: 8 },
});
