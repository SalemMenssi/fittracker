import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getNotificationSettingsFromApi,
  updateNotificationSettingsApi,
} from '../../services/NotificationApiService';
import {
  sendTestNotification,
  scheduleDailyQuestReminder,
} from '../../services/notificationService';
import { useIsFocused } from '@react-navigation/native';

const parseTime = (str = '08:00') => {
  const [h, m] = str.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 8, m || 0, 0, 0);
  return d;
};

const formatTime = (date) => {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

export default function NotificationsScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [questTime, setQuestTime] = useState(new Date());

  const load = async () => {
    try {
      const s = await getNotificationSettingsFromApi();
      setSettings(s);
      setQuestTime(parseTime(s.dailyQuestTime || '08:00'));
    } catch (e) {
      console.warn(e);
      setSettings({ enabled: true, dailyQuest: true, dailyQuestTime: '08:00' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused]);

  const save = async (next) => {
    setSettings(next);
    await updateNotificationSettingsApi(next);
    if (next.dailyQuest !== false) {
      await scheduleDailyQuestReminder(next.dailyQuestTime || '08:00');
    }
  };

  const toggle = async (key) => {
    if (!settings) return;
    const newVal = !settings[key];
    const next = { ...settings, [key]: newVal };
    if (key === 'enabled' || key === 'enableAll') {
      const on = newVal;
      Object.keys(next).forEach((k) => {
        if (typeof next[k] === 'boolean' && k !== 'enabled') next[k] = on;
      });
      next.enabled = on;
      next.enableAll = on;
    }
    await save(next);
  };

  const onTimeChange = async (_, selected) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (!selected) return;
    setQuestTime(selected);
    const timeStr = formatTime(selected);
    const next = { ...settings, dailyQuestTime: timeStr };
    await save(next);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await sendTestNotification();
      Alert.alert('Test', res.message || 'Notification settings saved. Device push is not configured in this app build.');
    } catch (e) {
      Alert.alert('Test', e.message || 'Could not reach notification service.');
    } finally {
      setTesting(false);
    }
  };

  const items = [
    { key: 'enabled', label: 'Enable All Notifications', sub: 'Master switch' },
    { key: 'dailyQuest', label: 'Daily Quest Reminder', sub: 'Your Daily Awakening Quest is ready' },
    { key: 'streakProtection', label: 'Streak Protection', sub: 'Evening alert if streak at risk' },
    { key: 'intelligenceTraining', label: 'Intelligence Training', sub: 'Weak area reminders' },
    { key: 'challengeReminders', label: 'Challenge Reminders', sub: 'Community challenge deadlines' },
    { key: 'aiCoach', label: 'AI Coach Messages', sub: 'System recommendations' },
    { key: 'badgeUnlocks', label: 'Badge Unlocks', sub: 'New badge notifications' },
    { key: 'levelUps', label: 'Level Up', sub: 'When you reach a new level' },
    { key: 'avatarEvolution', label: 'Avatar Evolution', sub: 'Avatar tier upgrades' },
    { key: 'marketplaceRewards', label: 'Marketplace & Rewards', sub: 'Purchases and rewards' },
  ];

  if (loading || !settings) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.card}>
        {items.map((item, i) => (
          <View key={item.key} style={[styles.row, i === items.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSub}>{item.sub}</Text>
            </View>
            <Switch
              value={settings[item.key] !== false}
              onValueChange={() => toggle(item.key)}
              trackColor={{ false: '#e0e0e0', true: '#00c2c2' }}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.timeRow} onPress={() => setShowTimePicker(true)}>
          <View>
            <Text style={styles.rowLabel}>Daily Quest Time</Text>
            <Text style={styles.rowSub}>{settings.dailyQuestTime || '08:00'}</Text>
          </View>
          <Ionicons name="time-outline" size={22} color="#00c2c2" />
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={questTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity style={styles.testBtn} onPress={handleTest} disabled={testing}>
          {testing ? (
            <ActivityIndicator color="#0d1117" />
          ) : (
            <Text style={styles.testBtnText}>Send Test Notification</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 20, marginTop: 20,
    borderRadius: 20, padding: 4, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  timeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  rowSub: { fontSize: 12, color: '#aaa', marginTop: 2 },
  testBtn: {
    margin: 16, backgroundColor: '#00c2c2', padding: 14, borderRadius: 12, alignItems: 'center',
  },
  testBtnText: { color: '#0d1117', fontWeight: '700' },
});
