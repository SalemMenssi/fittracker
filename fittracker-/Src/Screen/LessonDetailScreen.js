import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function LessonDetailScreen({ route }) {
  const { lessonId, title } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>Lesson ID: {lessonId}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111" },
  sub: { fontSize: 14, color: "#888", marginTop: 8 },
});