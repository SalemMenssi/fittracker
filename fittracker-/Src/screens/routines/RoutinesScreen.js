import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { getAllCourses, addCourse, updateCourse, deleteCourse } from '../../services/CourseService';
import { getProfile } from '../../services/AuthService';
import { useIsFocused } from '@react-navigation/native';
import { scheduleTaskNotification, cancelTaskNotification } from '../../services/notificationService';
import { RoutineCard } from '../../components/RoutineCard';
import RoutineHero from '../../components/RoutineHero';
import { openStackScreen } from '../../navigation/openStackScreen';
import { ROUTES } from '../../navigation/routes';

// ─── Blank form factory ────────────────────────────────────────────────────────
const blankForm = () => ({
  title: '',
  description: '',
  type: 'Discipline',
  difficulty: 'Easy',
  levelRequirement: 1,
  image: null,
  rules: [''],
  tasks: [{ title: '', description: '', time: '' }],  // time = optional reminder
});

const WORKOUT_TYPES = ['Study', 'Fitness', 'Discipline', 'Productivity', 'Mental Focus', 'Health', 'Skill Building', 'Daily Life'];
const CATEGORIES   = ['All', ...WORKOUT_TYPES];

// ─── Fallback images per workout type ─────────────────────────────────────────
const TYPE_IMAGES = {
  Study: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400',
  Fitness: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400',
  Discipline: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
  Productivity: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
  "Mental Focus": 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
  Health: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400',
  "Skill Building": 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
  "Daily Life": 'https://images.unsplash.com/photo-1514996937319-344454492b37?w=400',
};

export default function RoutinesScreen({ navigation }) {
  const isFocused = useIsFocused();
  const scrollRef = useRef(null);

  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [courses, setCourses]               = useState([]);
  const [user, setUser]                     = useState(null);
  const [loading, setLoading]               = useState(true);

  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm]                 = useState(blankForm());
  const [saving, setSaving]             = useState(false);
  const [editingId, setEditingId]       = useState(null);
  
  // time picker state
  const [timePickerIdx, setTimePickerIdx] = useState(null);

  // ── Load data ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, currentUser] = await Promise.all([getAllCourses(), getProfile()]);
        setCourses(data);
        setUser(currentUser);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) fetchData();
  }, [isFocused]);

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filteredCourses = courses.filter(course => {
    const matchesSearch   = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.workoutType === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // ── Navigate to detail ────────────────────────────────────────────────────────
  const handleCoursePress = (course) => openStackScreen(navigation, ROUTES.COURSE_DETAIL, { Item: course });

  // ── Image Picker ──────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setForm(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  // ── Rules helpers ─────────────────────────────────────────────────────────────
  const addRule = () => setForm(prev => ({ ...prev, rules: [...prev.rules, ''] }));
  const updateRule = (idx, val) =>
    setForm(prev => {
      const rules = [...prev.rules];
      rules[idx] = val;
      return { ...prev, rules };
    });
  const removeRule = (idx) =>
    setForm(prev => ({ ...prev, rules: prev.rules.filter((_, i) => i !== idx) }));

  // ── Task helpers ──────────────────────────────────────────────────────────────
  const addTask = () =>
    setForm(prev => ({ ...prev, tasks: [...prev.tasks, { title: '', description: '', time: '' }] }));
  const updateTask = (idx, field, val) =>
    setForm(prev => {
      const tasks = [...prev.tasks];
      tasks[idx] = { ...tasks[idx], [field]: val };
      return { ...prev, tasks };
    });
  const removeTask = async (idx) => {
    const task = form.tasks[idx];
    if (task.notificationId) {
      await cancelTaskNotification(task.notificationId);
    }
    setForm(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== idx) }));
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleCreateRoutine = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the routine.');
      return;
    }

    const cleanRules = form.rules.map(r => r.trim()).filter(Boolean);
    const cleanTasks = await Promise.all(
      form.tasks
        .filter(t => t.title.trim())
        .map(async (t, i) => {
          const taskObj = {
            id: i,
            title: t.title.trim(),
            description: t.description.trim(),
            status: 'pending',
            time: t.time || null,
          };

          if (taskObj.time) {
            taskObj.notificationId = await scheduleTaskNotification(taskObj);
          } else {
            taskObj.notificationId = null;
          }

          return taskObj;
        })
    );

    setSaving(true);
    try {
      if (editingId) {
        const courseToEdit = courses.find(c => c.id === editingId);
        if (!courseToEdit) throw new Error("Course not found");
        
        // Preserve existing fields while updating UI fields
        const updatedCourse = {
          ...courseToEdit,
          title:       form.title.trim(),
          description: form.description.trim() || 'No description.',
          workoutType: form.type,
          difficulty: courseToEdit.difficulty || form.difficulty,
          levelRequirement: courseToEdit.levelRequirement || form.levelRequirement,
          duration:    courseToEdit.duration || '30 Minutes',
          image:       form.image || TYPE_IMAGES[form.type],
          rules:       cleanRules.length ? cleanRules : ['Stay focused'],
          Tasks:       cleanTasks,
        };
        const updated = await updateCourse(updatedCourse);
        setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const newCourse = {
          title:       form.title.trim(),
          description: form.description.trim() || 'No description.',
          creator:     'user',
          workoutType: form.type,
          difficulty: form.difficulty,
          levelRequirement: form.levelRequirement,
          duration:    '30 Minutes',
          image:       form.image || TYPE_IMAGES[form.type],
          rules:       cleanRules.length ? cleanRules : ['Stay focused'],
          Tasks:       cleanTasks,
          Status:      false,
        };
        const added = await addCourse(newCourse);
        setCourses(prev => [...prev, added]);
      }
      setModalVisible(false);
      setForm(blankForm());
      setEditingId(null);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const openModal = () => {
    setForm(blankForm());
    setEditingId(null);
    setModalVisible(true);
  };
  
  const handleEditRoutine = (course) => {
    setForm({
      title: course.title,
      description: course.description,
      type: course.workoutType,
      image: course.image,
      rules: course.rules && course.rules.length ? course.rules : [''],
      tasks: course.Tasks.map(t => ({ title: t.title, description: t.description, time: t.time || '' }))
    });
    setEditingId(course.id);
    setModalVisible(true);
  };

  const handleDeleteRoutine = async (course) => {
    Alert.alert(
      "Delete Routine",
      "Are you sure you want to delete this routine? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              // Cancel notifications for all tasks
              if (course.Tasks && course.Tasks.length) {
                for (let task of course.Tasks) {
                  if (task.notificationId) {
                    await cancelTaskNotification(task.notificationId);
                  }
                }
              }
              await deleteCourse(course.id);
              setCourses(prev => prev.filter(c => c.id !== course.id));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete routine.');
            }
          }
        }
      ]
    );
  };

  // ── Card renderer ─────────────────────────────────────────────────────────────
  const renderCourseCard = ({ item, index }) => {
    const joined = user?.joinedCourses?.some((jc) => (jc._id || jc) === item.id);
    return (
      <RoutineCard
        routine={item}
        joined={joined}
        index={index}
        showOwnerActions
        onPress={() => handleCoursePress(item)}
        onEdit={() => handleEditRoutine(item)}
        onDelete={() => handleDeleteRoutine(item)}
      />
    );
  };

  const activeCount = filteredCourses.filter((c) =>
    user?.joinedCourses?.some((jc) => (jc._id || jc) === c.id)
  ).length;

  const tasksDoneTotal = courses.reduce((sum, c) => {
    const joined = user?.joinedCourses?.some((jc) => (jc._id || jc) === c.id);
    if (!joined) return sum;
    return sum + (c.Tasks?.filter((t) => t.status === 'done').length || 0);
  }, 0);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  // ── JSX ───────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

      {/* ═══════════════════════════ CREATE MODAL ═══════════════════════════════ */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            {/* ── Modal header ── */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Routine' : 'New Routine'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#ccc" />
              </TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* ── Image Picker ── */}
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
                {form.image ? (
                  <>
                    <Image source={{ uri: form.image }} style={styles.imagePreview} />
                    <View style={styles.imageEditBadge}>
                      <Ionicons name="pencil" size={14} color="#fff" />
                      <Text style={styles.imageEditText}>Change</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Ionicons name="image-outline" size={36} color="#00c2c2" />
                    <Text style={styles.imagePickerText}>Tap to add a cover image</Text>
                    <Text style={styles.imagePickerSub}>Recommended 16:9 ratio</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* ── Title ── */}
              <Text style={styles.fieldLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Morning Strength Blast"
                value={form.title}
                onChangeText={val => setForm(prev => ({ ...prev, title: val }))}
              />

              {/* ── Description ── */}
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Describe the goals and benefits of this routine..."
                value={form.description}
                onChangeText={val => setForm(prev => ({ ...prev, description: val }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* ── Workout Type ── */}
              <Text style={styles.fieldLabel}>Workout Type</Text>
              <View style={styles.typeRow}>
                {WORKOUT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, form.type === type && styles.typeChipActive]}
                    onPress={() => setForm(prev => ({ ...prev, type }))}
                  >
                    <Text style={[styles.typeChipText, form.type === type && styles.typeChipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Rules ── */}
              <View style={styles.sectionRow}>
                <Text style={styles.fieldLabel}>Rules</Text>
                <TouchableOpacity style={styles.addBtn} onPress={addRule}>
                  <Ionicons name="add-circle" size={22} color="#00c2c2" />
                  <Text style={styles.addBtnText}>Add Rule</Text>
                </TouchableOpacity>
              </View>
              {form.rules.map((rule, idx) => (
                <View key={idx} style={styles.listItemRow}>
                  <View style={styles.bulletDot} />
                  <TextInput
                    style={[styles.input, styles.listInput]}
                    placeholder={`Rule ${idx + 1}...`}
                    value={rule}
                    onChangeText={val => updateRule(idx, val)}
                  />
                  {form.rules.length > 1 && (
                    <TouchableOpacity onPress={() => removeRule(idx)} style={styles.removeBtn}>
                      <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* ── Tasks ── */}
              <View style={styles.sectionRow}>
                <Text style={styles.fieldLabel}>Tasks</Text>
                <TouchableOpacity style={styles.addBtn} onPress={addTask}>
                  <Ionicons name="add-circle" size={22} color="#00c2c2" />
                  <Text style={styles.addBtnText}>Add Task</Text>
                </TouchableOpacity>
              </View>
              {form.tasks.map((task, idx) => (
                <View key={idx} style={styles.taskBlock}>
                  <View style={styles.taskBlockHeader}>
                    <View style={styles.taskIndexBadge}>
                      <Text style={styles.taskIndexText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.taskBlockLabel}>Task {idx + 1}</Text>
                    {form.tasks.length > 1 && (
                      <TouchableOpacity onPress={() => removeTask(idx)} style={{ marginLeft: 'auto' }}>
                        <Ionicons name="close-circle-outline" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Task name (e.g. Push-ups)"
                    value={task.title}
                    onChangeText={val => updateTask(idx, 'title', val)}
                  />
                  <TextInput
                    style={[styles.input, { marginBottom: 4 }]}
                    placeholder="Description (e.g. 3 sets of 20 reps)"
                    value={task.description}
                    onChangeText={val => updateTask(idx, 'description', val)}
                  />
                  
                  {/* Task Reminder Toggle */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
                    <Text style={{ fontSize: 13, color: '#444', fontWeight: '500' }}>Set Reminder Time</Text>
                    <Switch
                      value={task.time !== null && task.time !== ''}
                      onValueChange={(val) => {
                        if (val) {
                          updateTask(idx, 'time', '08:00');
                        } else {
                          updateTask(idx, 'time', null);
                        }
                      }}
                      trackColor={{ false: '#e0e0e0', true: '#00c2c2' }}
                      thumbColor="#fff"
                    />
                  </View>

                  {/* Task Time Picker */}
                  {task.time !== null && task.time !== '' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginTop: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#00c2c2' }}>{task.time}</Text>
                      <TouchableOpacity onPress={() => setTimePickerIdx(idx)} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#e8f9f9', borderRadius: 8 }}>
                        <Text style={{ fontSize: 12, color: '#00c2c2', fontWeight: 'bold' }}>Change</Text>
                      </TouchableOpacity>
                      {timePickerIdx === idx && (
                        <DateTimePicker
                          value={(() => {
                            try {
                              const [h, m] = task.time.split(':');
                              const d = new Date();
                              d.setHours(parseInt(h, 10));
                              d.setMinutes(parseInt(m, 10));
                              return d;
                            } catch(e) { return new Date(); }
                          })()}
                          mode="time"
                          display="default"
                          onChange={(event, selectedDate) => {
                            // On Android, close picker immediately
                            if (Platform.OS === 'android') {
                              setTimePickerIdx(null);
                            }
                            if (selectedDate) {
                              const hh = selectedDate.getHours().toString().padStart(2, '0');
                              const mm = selectedDate.getMinutes().toString().padStart(2, '0');
                              updateTask(idx, 'time', `${hh}:${mm}`);
                            } else if (event.type === 'dismissed') {
                              setTimePickerIdx(null);
                            }
                          }}
                        />
                      )}
                    </View>
                  )}
                </View>
              ))}

              {/* ── Actions ── */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                  onPress={handleCreateRoutine}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveBtnText}>{editingId ? 'Save Changes' : 'Create Routine'}</Text>
                  }
                </TouchableOpacity>
              </View>

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ═══════════════════════════ MAIN LIST ══════════════════════════════════ */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Routines</Text>
            <Text style={styles.headerSub}>Tap Details on any card to flip and preview tasks</Text>
          </View>
        </View>

        <RoutineHero total={courses.length} active={activeCount} tasksDone={tasksDoneTotal} />

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.filterLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Difficulty</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {['All', 'Easy', 'Medium', 'Hard'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, selectedDifficulty === cat && styles.categoryButtonActive]}
              onPress={() => setSelectedDifficulty(cat)}
            >
              <Text style={[styles.categoryText, selectedDifficulty === cat && styles.categoryTextActive]}>
                {cat === 'All' ? 'Any level' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.coursesInfo}>
          <Text style={styles.allCoursesText}>{filteredCourses.length} routine{filteredCourses.length !== 1 ? 's' : ''}</Text>
          <Text style={styles.coursesCount}>
            {filteredCourses.filter((c) => user?.joinedCourses?.some((jc) => (jc._id || jc) === c.id)).length} active
          </Text>
        </View>

        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={40} color="#ccc" />
            <Text style={styles.emptyTitle}>No routines found</Text>
            <Text style={styles.emptySub}>Try another filter or create your own routine below.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCourses}
            renderItem={renderCourseCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.coursesList}
          />
        )}

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton} onPress={openModal}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create Routine</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F8F9FC' },
  centered:   { justifyContent: 'center', alignItems: 'center' },

  // list
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111' },
  headerSub: { fontSize: 14, color: '#666', marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E8EAED', gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#888', paddingHorizontal: 20, marginTop: 4, marginBottom: 2 },
  categoriesContainer: { paddingHorizontal: 20, paddingVertical: 8 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#E8EAED' },
  categoryButtonActive: { backgroundColor: '#00c2c2', borderColor: '#00c2c2' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#666' },
  categoryTextActive: { color: '#fff' },
  coursesInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  allCoursesText: { fontSize: 15, fontWeight: '700', color: '#111' },
  coursesCount: { fontSize: 13, color: '#00c2c2', fontWeight: '600' },
  coursesList: { paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', paddingHorizontal: 40, paddingVertical: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  createButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#00c2c2', borderRadius: 14, paddingVertical: 16, marginHorizontal: 20, marginTop: 8, marginBottom: 10 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 22, paddingTop: 20, maxHeight: '93%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },

  // image picker
  imagePicker: { height: 160, borderRadius: 16, backgroundColor: '#f0fafa', borderWidth: 1.5, borderColor: '#00c2c240', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 18, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageEditBadge: { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  imageEditText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  imagePickerText: { fontSize: 14, fontWeight: '600', color: '#00c2c2', marginTop: 8 },
  imagePickerSub: { fontSize: 11, color: '#aaa', marginTop: 3 },

  // form fields
  fieldLabel: { fontSize: 13, color: '#444', fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#f7f8fb', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 14, color: '#333', marginBottom: 14 },
  inputMultiline: { minHeight: 75, textAlignVertical: 'top' },

  // type chips
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  typeChipActive: { backgroundColor: '#00c2c2' },
  typeChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  typeChipTextActive: { color: '#fff' },

  // section header row
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 13, color: '#00c2c2', fontWeight: '600' },

  // rule row
  listItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  bulletDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00c2c2', flexShrink: 0 },
  listInput: { flex: 1, marginBottom: 0 },
  removeBtn: { padding: 4 },

  // task block
  taskBlock: { backgroundColor: '#f9f9fb', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e8e8e8' },
  taskBlockHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  taskIndexBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#00c2c2', alignItems: 'center', justifyContent: 'center' },
  taskIndexText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  taskBlockLabel: { fontSize: 14, fontWeight: '600', color: '#333' },

  // modal actions
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#666', fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#00c2c2', alignItems: 'center' },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: 'bold' },
});