import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RPG } from '../theme/rpgTheme';

// Background timer is MVP. For production, use background tasks or server-side verification.

const storageKey = (questId, taskId) => `@fittracker_timer_${questId}_${taskId}`;
const INTERRUPT_GRACE_MS = 30 * 60 * 1000;

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function QuestTaskTimer({
  questId,
  taskId,
  durationMinutes = 5,
  onComplete,
  onInterrupted,
}) {
  const total = Math.max(1, Math.floor(durationMinutes * 60));
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [interrupted, setInterrupted] = useState(false);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const persist = useCallback(async (payload) => {
    if (!questId || !taskId) return;
    await AsyncStorage.setItem(storageKey(questId, taskId), JSON.stringify({
      ...payload,
      lastUpdatedAt: Date.now(),
    }));
  }, [questId, taskId]);

  const clearPersisted = useCallback(async () => {
    if (!questId || !taskId) return;
    await AsyncStorage.removeItem(storageKey(questId, taskId));
  }, [questId, taskId]);

  const finishTimer = useCallback(() => {
    setDone(true);
    setRunning(false);
    onComplete?.();
    persist({ timerStatus: 'done', durationSeconds: total, remainingSeconds: 0, startedAt: null });
  }, [onComplete, persist, total]);

  useEffect(() => {
    mountedRef.current = true;
    const restore = async () => {
      if (!questId || !taskId) return;
      try {
        const raw = await AsyncStorage.getItem(storageKey(questId, taskId));
        if (!raw || !mountedRef.current) return;
        const saved = JSON.parse(raw);
        const now = Date.now();

        if (saved.timerStatus === 'done') {
          setRemaining(0);
          setDone(true);
          onComplete?.();
          return;
        }

        if (saved.timerStatus === 'paused' && saved.remainingSeconds != null) {
          setRemaining(saved.remainingSeconds);
          return;
        }

        if (saved.timerStatus === 'running' && saved.startedAt) {
          const elapsed = Math.floor((now - saved.startedAt) / 1000);
          const left = (saved.durationSeconds || total) - elapsed;
          const stale = now - (saved.lastUpdatedAt || saved.startedAt) > INTERRUPT_GRACE_MS;

          if (left <= 0) {
            finishTimer();
          } else if (stale) {
            setInterrupted(true);
            onInterrupted?.();
            setRemaining(total);
            await clearPersisted();
          } else {
            setRemaining(left);
            setRunning(true);
          }
        }
      } catch (_) {}
    };
    restore();
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [questId, taskId, total, finishTimer, onComplete, onInterrupted, clearPersisted]);

  useEffect(() => {
    if (!running || done) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          finishTimer();
          return 0;
        }
        const next = r - 1;
        persist({
          timerStatus: 'running',
          startedAt: Date.now() - (total - next) * 1000,
          durationSeconds: total,
          remainingSeconds: next,
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, done, finishTimer, persist, total]);

  const start = async () => {
    setInterrupted(false);
    setRunning(true);
    await persist({
      timerStatus: 'running',
      startedAt: Date.now(),
      durationSeconds: total,
      remainingSeconds: remaining,
    });
  };

  const pause = async () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    await persist({
      timerStatus: 'paused',
      durationSeconds: total,
      remainingSeconds: remaining,
      startedAt: null,
    });
  };

  const reset = async () => {
    pause();
    setRemaining(total);
    setDone(false);
    setInterrupted(false);
    await clearPersisted();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.timer}>{formatTime(remaining)}</Text>
      {interrupted && (
        <Text style={styles.interrupted}>
          Timer was interrupted. Please restart this timer task.
        </Text>
      )}
      <View style={styles.row}>
        {!running && !done && (
          <TouchableOpacity style={styles.btn} onPress={start}>
            <Text style={styles.btnText}>Start</Text>
          </TouchableOpacity>
        )}
        {running && (
          <TouchableOpacity style={styles.btnSec} onPress={pause}>
            <Text style={styles.btnSecText}>Pause</Text>
          </TouchableOpacity>
        )}
        {!running && remaining < total && !done && (
          <TouchableOpacity style={styles.btn} onPress={start}>
            <Text style={styles.btnText}>Resume</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btnSec} onPress={reset}>
          <Text style={styles.btnSecText}>Reset</Text>
        </TouchableOpacity>
      </View>
      {done && <Text style={styles.done}>Timer complete — you may finish the task.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10, padding: 12, backgroundColor: '#0d1117', borderRadius: 10, borderWidth: 1, borderColor: RPG.cardBorder },
  timer: { color: RPG.accent, fontSize: 32, fontWeight: '800', textAlign: 'center' },
  interrupted: { color: '#ff8c42', textAlign: 'center', fontSize: 12, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 },
  btn: { backgroundColor: RPG.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#0d1117', fontWeight: '700' },
  btnSec: { borderWidth: 1, borderColor: RPG.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  btnSecText: { color: RPG.accent, fontWeight: '600' },
  done: { color: '#2ecc71', textAlign: 'center', marginTop: 8, fontSize: 12 },
});
