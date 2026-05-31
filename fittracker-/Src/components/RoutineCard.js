import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DIFFICULTY_COLORS = {
  Easy: { bg: '#e8f8f0', text: '#1a9d5c', label: 'Beginner' },
  Medium: { bg: '#fff4e5', text: '#d97706', label: 'Intermediate' },
  Hard: { bg: '#fdecea', text: '#dc2626', label: 'Advanced' },
};

const TYPE_ICONS = {
  Study: 'book-outline',
  Fitness: 'barbell-outline',
  Discipline: 'shield-checkmark-outline',
  Productivity: 'rocket-outline',
  'Mental Focus': 'bulb-outline',
  Health: 'heart-outline',
  'Skill Building': 'construct-outline',
  'Daily Life': 'sunny-outline',
};

const BENEFITS = {
  Study: 'Sharper focus & retention',
  Fitness: 'Strength & endurance gains',
  Discipline: 'Consistency & willpower',
  Productivity: 'Better daily output',
  'Mental Focus': 'Clearer thinking',
  Health: 'Energy & wellbeing',
  'Skill Building': 'New abilities unlocked',
  'Daily Life': 'Balanced lifestyle habits',
};

export const getRoutineStats = (routine = {}) => {
  const tasks = routine.Tasks || [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'done').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const xpEstimate = 10 + total * 20;
  return { total, completed, progress, xpEstimate };
};

export function AnimatedProgressBar({ progress, height = 6, style }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressBg, { height }, style]}>
      <Animated.View style={[styles.progressFill, { width, height }]} />
    </View>
  );
}

function MetaChip({ icon, label, tone }) {
  return (
    <View style={[styles.chip, tone && { backgroundColor: tone.bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={tone?.text || '#555'} /> : null}
      <Text style={[styles.chipText, tone && { color: tone.text }]}>{label}</Text>
    </View>
  );
}

function StaggerWrap({ index = 0, children }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 450,
      delay: Math.min(index * 70, 350),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
          },
          {
            scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Full flip card — front overview, back tasks & rules */
export function RoutineCard({
  routine,
  joined = false,
  onPress,
  onEdit,
  onDelete,
  showOwnerActions = false,
  index = 0,
}) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const { total, completed, progress, xpEstimate } = getRoutineStats(routine);
  const difficulty = DIFFICULTY_COLORS[routine.difficulty] || DIFFICULTY_COLORS.Easy;
  const typeIcon = TYPE_ICONS[routine.workoutType] || 'fitness-outline';
  const benefit = BENEFITS[routine.workoutType] || 'Personal growth & consistency';
  const rules = (routine.rules || []).filter(Boolean);
  const tasks = routine.Tasks || [];
  const creatorLabel = routine.creator === 'user' ? 'Custom routine' : 'FitTrack library';

  useEffect(() => {
    if (!joined) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.02, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [joined]);

  const toggleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    Animated.spring(flipAnim, {
      toValue: next ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  return (
    <StaggerWrap index={index}>
      <Animated.View style={[styles.card, joined && { transform: [{ scale: pulse }] }]}>
        <View style={styles.flipContainer}>
          {/* FRONT */}
          <Animated.View
            style={[
              styles.flipFace,
              { transform: [{ rotateY: frontRotate }], opacity: frontOpacity },
            ]}
          >
            <Image source={{ uri: routine.image }} style={styles.image} />
            <View style={styles.imageGradient}>
              {joined && (
                <View style={styles.joinedRibbon}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text style={styles.joinedRibbonText}>Active</Text>
                </View>
              )}
              <View style={styles.topRow}>
                <MetaChip icon={typeIcon} label={routine.workoutType || 'Routine'} />
                <MetaChip label={difficulty.label} tone={difficulty} />
              </View>
            </View>

            <View style={styles.body}>
              <Text style={styles.title}>{routine.title}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {routine.description || 'A structured plan to build consistency step by step.'}
              </Text>

              <View style={styles.benefitRow}>
                <Ionicons name="sparkles-outline" size={14} color="#00c2c2" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="list-outline" size={14} color="#666" />
                  <Text style={styles.metaText}>{total} tasks</Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.metaText}>{routine.duration || '30 min'}</Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaItem}>
                  <Ionicons name="star-outline" size={14} color="#666" />
                  <Text style={styles.metaText}>Lv.{routine.levelRequirement || 1}+</Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaItem}>
                  <Ionicons name="flash-outline" size={14} color="#ff8c42" />
                  <Text style={styles.metaText}>~{xpEstimate} XP</Text>
                </View>
              </View>

              {joined && total > 0 && (
                <View style={styles.progressWrap}>
                  <AnimatedProgressBar progress={progress} />
                  <Text style={styles.progressLabel}>
                    {completed}/{total} tasks · {progress}% complete
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* BACK */}
          <Animated.View
            style={[
              styles.flipFace,
              styles.flipBack,
              { transform: [{ rotateY: backRotate }], opacity: backOpacity },
            ]}
          >
            <View style={styles.backHeader}>
              <Ionicons name="document-text-outline" size={20} color="#00c2c2" />
              <Text style={styles.backTitle}>Routine breakdown</Text>
            </View>

            <Text style={styles.backSectionLabel}>About</Text>
            <Text style={styles.backText} numberOfLines={3}>
              {routine.description || 'Follow the tasks below in order for best results.'}
            </Text>

            {rules.length > 0 && (
              <>
                <Text style={styles.backSectionLabel}>Guidelines</Text>
                {rules.slice(0, 3).map((rule, i) => (
                  <View key={i} style={styles.backListItem}>
                    <View style={styles.backBullet} />
                    <Text style={styles.backListText}>{rule}</Text>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.backSectionLabel}>Tasks preview</Text>
            {tasks.length === 0 ? (
              <Text style={styles.backMuted}>No tasks added yet.</Text>
            ) : (
              tasks.slice(0, 4).map((task, i) => (
                <View key={task.id ?? i} style={styles.taskPreviewRow}>
                  <Ionicons
                    name={task.status === 'done' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={task.status === 'done' ? '#00c2c2' : '#ccc'}
                  />
                  <Text
                    style={[styles.taskPreviewText, task.status === 'done' && styles.taskPreviewDone]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  {task.time ? <Text style={styles.taskPreviewTime}>{task.time}</Text> : null}
                </View>
              ))
            )}
            {tasks.length > 4 && (
              <Text style={styles.backMuted}>+{tasks.length - 4} more tasks</Text>
            )}

            <View style={styles.backFooter}>
              <Text style={styles.backMuted}>{creatorLabel}</Text>
              <Text style={styles.backMuted}>Est. {routine.duration || '30 min'} per session</Text>
            </View>
          </Animated.View>
        </View>

        <View style={[styles.body, styles.actionsBody]}>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.flipBtn} onPress={toggleFlip}>
              <Ionicons name="swap-horizontal-outline" size={18} color="#555" />
              <Text style={styles.flipBtnText}>{flipped ? 'Front' : 'Details'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, joined && styles.primaryBtnJoined]}
              onPress={onPress}
            >
              <Text style={[styles.primaryBtnText, joined && styles.primaryBtnTextJoined]}>
                {joined ? 'Continue' : 'Open'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={joined ? '#00c2c2' : '#fff'} />
            </TouchableOpacity>

            {showOwnerActions && routine.creator === 'user' && (
              <View style={styles.ownerActions}>
                <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
                  <Ionicons name="pencil-outline" size={18} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={onDelete}>
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </StaggerWrap>
  );
}

/** Compact card with press animation */
export function RoutineCardCompact({ routine, joined = false, onPress, index = 0 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const { total, progress, xpEstimate } = getRoutineStats(routine);
  const difficulty = DIFFICULTY_COLORS[routine.difficulty] || DIFFICULTY_COLORS.Easy;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  return (
    <StaggerWrap index={index}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[styles.compactCard, { transform: [{ scale }] }]}>
          <Image source={{ uri: routine.image }} style={styles.compactImage} />
          <View style={styles.compactOverlay}>
            {joined && (
              <View style={styles.compactActiveBadge}>
                <Text style={styles.compactActiveText}>ACTIVE</Text>
              </View>
            )}
            <View style={styles.compactBadges}>
              <Text style={styles.compactCategory}>{routine.workoutType}</Text>
              <Text style={[styles.compactDifficulty, { color: difficulty.text }]}>
                {difficulty.label}
              </Text>
            </View>
            <Text style={styles.compactTitle} numberOfLines={2}>
              {routine.title}
            </Text>
            <Text style={styles.compactMeta}>
              {total} tasks · {routine.duration || '30 min'} · ~{xpEstimate} XP
            </Text>
            {joined && total > 0 && (
              <AnimatedProgressBar progress={progress} height={4} style={{ marginTop: 8 }} />
            )}
          </View>
        </Animated.View>
      </Pressable>
    </StaggerWrap>
  );
}

/** Row card with animated progress */
export function RoutineCardRow({
  routine,
  onPress,
  onEdit,
  onLeave,
  showActions = false,
  index = 0,
}) {
  const { total, completed, progress } = getRoutineStats(routine);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: 1,
      duration: 500,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [index]);

  return (
    <Animated.View
      style={{
        opacity: slide,
        transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
      }}
    >
      <TouchableOpacity style={styles.rowCard} activeOpacity={0.92} onPress={onPress}>
        <View style={styles.rowIcon}>
          <Ionicons name="play-circle" size={28} color="#00c2c2" />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {routine.title}
          </Text>
          <Text style={styles.rowSub}>
            {completed}/{total} tasks · {progress}% · {routine.duration || '30 min'}
          </Text>
          <AnimatedProgressBar progress={progress} />
        </View>
        {showActions ? (
          <View style={styles.rowActions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} hitSlop={8}>
                <Ionicons name="pencil-outline" size={20} color="#00c2c2" />
              </TouchableOpacity>
            )}
            {onLeave && (
              <TouchableOpacity onPress={onLeave} hitSlop={8}>
                <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eef0f4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  flipContainer: { height: 380, position: 'relative' },
  flipFace: {
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  flipBack: {
    padding: 16,
    height: 380,
    backgroundColor: '#fafbfc',
  },
  image: { width: '100%', height: 150, resizeMode: 'cover' },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  joinedRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#00c2c2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  joinedRibbonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  body: { padding: 16 },
  topRow: { flexDirection: 'row', gap: 8, marginTop: 'auto' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#555' },
  title: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 6 },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 10 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  benefitText: { fontSize: 13, color: '#00c2c2', fontWeight: '600', flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#666', fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#ccc' },
  progressWrap: { marginTop: 14 },
  progressBg: { backgroundColor: '#eef0f4', borderRadius: 4, overflow: 'hidden', width: '100%' },
  progressFill: { backgroundColor: '#00c2c2', borderRadius: 4 },
  progressLabel: { fontSize: 12, color: '#00c2c2', fontWeight: '600', marginTop: 6 },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  backTitle: { fontSize: 16, fontWeight: '800', color: '#111' },
  backSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  backText: { fontSize: 13, color: '#555', lineHeight: 19 },
  backListItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  backBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00c2c2', marginTop: 6 },
  backListText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 18 },
  taskPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f4',
  },
  taskPreviewText: { flex: 1, fontSize: 13, color: '#333', fontWeight: '500' },
  taskPreviewDone: { color: '#00c2c2', textDecorationLine: 'line-through' },
  taskPreviewTime: { fontSize: 11, color: '#888', fontWeight: '600' },
  backFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eef0f4',
  },
  backMuted: { fontSize: 12, color: '#999' },
  actionsBody: { paddingTop: 0, borderTopWidth: 1, borderTopColor: '#f0f2f5' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  flipBtnText: { fontSize: 13, fontWeight: '600', color: '#555' },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00c2c2',
    borderRadius: 12,
    paddingVertical: 12,
  },
  primaryBtnJoined: { backgroundColor: '#e8fafa', borderWidth: 1, borderColor: '#00c2c2' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  primaryBtnTextJoined: { color: '#00c2c2' },
  ownerActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDanger: { backgroundColor: '#fdecea' },

  compactCard: {
    width: 210,
    height: 155,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#111',
  },
  compactImage: { width: '100%', height: '100%' },
  compactOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  compactActiveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#00c2c2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  compactActiveText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  compactBadges: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  compactCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: 'rgba(0,194,194,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  compactDifficulty: { fontSize: 10, fontWeight: '700' },
  compactTitle: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 20 },
  compactMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 4 },

  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eef0f4',
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e8fafa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  rowSub: { fontSize: 12, color: '#888', marginBottom: 8 },
  rowActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
});
