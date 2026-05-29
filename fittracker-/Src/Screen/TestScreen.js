import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TESTS_DATA } from '../data/tests/testsData';
import { updatePerformanceMetrics, getPerformanceMetrics, updateStatsFromQuiz } from '../services/performanceService';

export default function TestScreen({ navigation, route }) {
  const { testId = 'test_1' } = route.params || {};
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const testData = TESTS_DATA.find(t => t.id === testId);

  if (!testData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Test data not found.</Text>
      </View>
    );
  }

  const quizzes = testData.quizzes;
  const currentQuiz = quizzes[currentQuizIndex];
  const totalQuizzes = quizzes.length;

  const handleSelectOption = (index) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuizIndex]: index }));
  };

  const handleNext = () => {
    if (selectedAnswers[currentQuizIndex] === undefined) {
      Alert.alert('Notice', 'Please select an option before proceeding.');
      return;
    }
    if (currentQuizIndex < totalQuizzes - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const handleBack = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
    }
  };

  const finishTest = async () => {
    setIsSubmitting(true);
    
    try {
      const results = quizzes.map((q, idx) => {
        const selected = selectedAnswers[idx];
        return {
          statType: q.statType,
          isCorrect: (selected === q.correctOptionIndex)
        };
      });

      await updateStatsFromQuiz(results, testId);
      
      // If we can go back, it means we came from the Tests List
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Otherwise it was the forced initial test
        navigation.reset({ index: 0, routes: [{ name: 'User' }] });
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save test results.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentQuizIndex > 0 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtnHolder} />
        )}
        <Text style={styles.headerTitle}>{testData.title}</Text>
        <View style={styles.backBtnHolder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Question {currentQuizIndex + 1} of {totalQuizzes}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentQuizIndex + 1) / totalQuizzes) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.quizCard}>
          <Text style={styles.questionText}>{currentQuiz.question}</Text>
          <View style={styles.optionsList}>
            {currentQuiz.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQuizIndex] === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
                  onPress={() => handleSelectOption(idx)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radio, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextBtnText}>
              {currentQuizIndex < totalQuizzes - 1 ? 'Next Question' : 'Finish Test'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#e74c3c' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { padding: 5 },
  backBtnHolder: { width: 34 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  scrollContent: { padding: 20 },
  progressContainer: { marginBottom: 25 },
  progressText: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8, textAlign: 'right' },
  progressBar: { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00c2c2', borderRadius: 3 },
  quizCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3 },
  questionText: { fontSize: 18, fontWeight: '700', color: '#222', lineHeight: 26, marginBottom: 25 },
  optionsList: { gap: 12 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  optionBtnActive: { backgroundColor: '#e8f9f9', borderColor: '#00c2c2' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#ccc', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#00c2c2' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00c2c2' },
  optionText: { fontSize: 15, color: '#444', flex: 1, lineHeight: 22 },
  optionTextActive: { color: '#00c2c2', fontWeight: '600' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  nextBtn: { backgroundColor: '#00c2c2', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
