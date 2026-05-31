import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { INTELLIGENCE_META } from '../../data/intelligenceConstants';
import { completeQuestTask, getQuestProgress } from '../../services/DailyQuestService';
import { uploadProofImage } from '../../services/UploadService';
import { UPLOADS_BASE } from '../../services/config';
import RewardModal from '../../components/RewardModal';
import BadgeUnlockModal from '../../components/BadgeUnlockModal';
import QuestTaskTimer from '../../components/QuestTaskTimer';
import { notifyQuestProgress, notifyDailyQuestComplete, notifyBadgeUnlock } from '../../services/notificationService';
import { RPG, cardStyle } from '../../theme/rpgTheme';

export default function DailyQuestDetailScreen({ navigation, route }) {
  const [quest, setQuest] = useState(route.params?.quest);
  const [loadingId, setLoadingId] = useState(null);
  const [proofTexts, setProofTexts] = useState({});
  const [proofPhotos, setProofPhotos] = useState({});
  const [timerDone, setTimerDone] = useState({});
  const [reward, setReward] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  const progress = getQuestProgress(quest);

  const resolvePhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${UPLOADS_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleComplete = async (task) => {
    const taskId = task._id;
    if (!taskId) return;

    if (task.proofType === 'timer' && !timerDone[taskId]) {
      Alert.alert('Timer', 'Complete the countdown before marking this task done.');
      return;
    }
    if (task.proofType === 'text' && !proofTexts[taskId]?.trim()) {
      Alert.alert('Reflection required', 'Please write your response before completing.');
      return;
    }
    if (task.proofType === 'photo' && !proofPhotos[taskId]) {
      Alert.alert('Photo required', 'Upload a proof photo before completing.');
      return;
    }

    setLoadingId(taskId);
    try {
      const result = await completeQuestTask(quest._id, taskId, {
        proofText: proofTexts[taskId],
        proofPhotoUrl: proofPhotos[taskId],
        timerCompleted: !!timerDone[taskId],
      });
      setQuest(result.quest);
      const r = result.reward || {};
      setReward({
        title: result.questCompleted ? 'Daily Quest Complete!' : 'Quest Progress',
        baseXP: r.baseXP,
        bonusXP: r.bonusXP,
        finalXP: r.finalXP ?? r.xp,
        coins: r.coins,
        appliedBoosters: r.appliedBoosters,
      });
      if (result.unlockedBadges?.length) {
        setUnlockedBadges(result.unlockedBadges);
        result.unlockedBadges.forEach((b) => notifyBadgeUnlock(b.label));
      }
      await notifyQuestProgress(r.finalXP ?? r.xp);
      if (result.questCompleted) await notifyDailyQuestComplete();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const pickPhoto = async (taskId) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', 'Photo library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return;
    setLoadingId(taskId);
    try {
      const url = await uploadProofImage(result.assets[0].uri);
      setProofPhotos((p) => ({ ...p, [taskId]: url }));
    } catch (e) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quest?.title || 'Daily Quest'}</Text>
        <Text style={styles.progress}>{progress}%</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.coach}>{quest?.coachMessage}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        {(quest?.tasks || []).map((task) => {
          const meta = INTELLIGENCE_META[task.intelligenceType] || {};
          const taskId = task._id;
          const photoUri = proofPhotos[taskId] || task.proof?.photoUrl;
          return (
            <View key={taskId} style={[cardStyle, task.completed && styles.doneCard]}>
              <View style={styles.taskHeader}>
                <Ionicons name={meta.icon || 'ellipse-outline'} size={20} color={meta.color || RPG.accent} />
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.completed && <Ionicons name="checkmark-circle" size={22} color={RPG.accent} />}
              </View>
              <Text style={styles.taskDesc}>{task.description}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.badge}>{task.category}</Text>
                <Text style={styles.reward}>+{task.xpReward} XP · {task.durationMinutes}m</Text>
              </View>
              {task.instructions ? <Text style={styles.instructions}>{task.instructions}</Text> : null}

              {task.proofType === 'text' && !task.completed && (
                <TextInput
                  style={styles.input}
                  placeholder="Write your reflection..."
                  placeholderTextColor="#666"
                  multiline
                  value={proofTexts[taskId] || task.proof?.text || ''}
                  onChangeText={(t) => setProofTexts((p) => ({ ...p, [taskId]: t }))}
                />
              )}

              {task.proofType === 'photo' && !task.completed && (
                <View>
                  <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(taskId)}>
                    <Ionicons name="camera-outline" size={20} color={RPG.accent} />
                    <Text style={styles.photoBtnText}>Upload Proof Photo</Text>
                  </TouchableOpacity>
                  {photoUri && (
                    <Image source={{ uri: resolvePhotoUrl(photoUri) }} style={styles.preview} />
                  )}
                </View>
              )}

              {task.proofType === 'timer' && !task.completed && (
                <QuestTaskTimer
                  questId={quest._id}
                  taskId={taskId}
                  durationMinutes={task.durationMinutes || 5}
                  onComplete={() => setTimerDone((d) => ({ ...d, [taskId]: true }))}
                  onInterrupted={() => setTimerDone((d) => ({ ...d, [taskId]: false }))}
                />
              )}

              {task.completed && task.proof?.photoUrl && (
                <Image source={{ uri: resolvePhotoUrl(task.proof.photoUrl) }} style={styles.preview} />
              )}

              {!task.completed && (
                <TouchableOpacity
                  style={[
                    styles.completeBtn,
                    task.proofType === 'timer' && !timerDone[taskId] && styles.completeBtnDisabled,
                  ]}
                  onPress={() => handleComplete(task)}
                  disabled={loadingId === taskId || (task.proofType === 'timer' && !timerDone[taskId])}
                >
                  {loadingId === taskId ? (
                    <ActivityIndicator color="#0d1117" />
                  ) : (
                    <Text style={styles.completeBtnText}>Mark Complete</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
      <RewardModal visible={!!reward} {...reward} onClose={() => setReward(null)} />
      <BadgeUnlockModal
        visible={unlockedBadges.length > 0}
        badges={unlockedBadges}
        onClose={() => setUnlockedBadges([])}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RPG.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  progress: { color: RPG.accent, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  coach: { color: RPG.textMuted, marginBottom: 12, fontStyle: 'italic' },
  progressBar: { height: 6, backgroundColor: RPG.cardBorder, borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: RPG.accent },
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskTitle: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 16 },
  taskDesc: { color: RPG.textMuted, marginTop: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  badge: { color: RPG.accent, fontSize: 11, textTransform: 'uppercase', fontWeight: '600' },
  reward: { color: RPG.gold, fontSize: 11 },
  instructions: { color: '#aaa', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  input: { backgroundColor: '#0d1117', borderRadius: 10, padding: 12, color: '#fff', marginTop: 10, minHeight: 60, borderWidth: 1, borderColor: RPG.cardBorder },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, padding: 12, borderWidth: 1, borderColor: RPG.accent, borderRadius: 10 },
  photoBtnText: { color: RPG.accent, fontWeight: '600' },
  preview: { width: '100%', height: 160, borderRadius: 10, marginTop: 10 },
  completeBtn: { backgroundColor: RPG.accent, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  completeBtnDisabled: { opacity: 0.4 },
  completeBtnText: { color: '#0d1117', fontWeight: '700' },
  doneCard: { opacity: 0.85 },
});
