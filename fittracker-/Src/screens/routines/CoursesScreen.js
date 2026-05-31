import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllCourses } from '../../services/CourseService';
import { getProfile } from '../../services/AuthService';
import { useIsFocused } from '@react-navigation/native';
import { RoutineCard } from '../../components/RoutineCard';
import BackButton from '../../components/BackButton';
import { openStackScreen } from '../../navigation/openStackScreen';
import { ROUTES } from '../../navigation/routes';

const categories = ['All', 'Study', 'Fitness', 'Discipline', 'Productivity', 'Mental Focus', 'Health', 'Skill Building', 'Daily Life'];

export default function CoursesScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [data, profile] = await Promise.all([getAllCourses(), getProfile().catch(() => null)]);
        setCourses(data);
        setUser(profile);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) fetchCourses();
  }, [isFocused]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.workoutType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCourseCard = ({ item, index }) => {
    const joined = user?.joinedCourses?.some((jc) => (jc._id || jc) === item.id);
    return (
      <RoutineCard
        routine={item}
        joined={joined}
        index={index}
        onPress={() => openStackScreen(navigation, ROUTES.COURSE_DETAIL, { Item: item })}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton navigation={navigation} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search routines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.coursesInfo}>
          <Text style={styles.countText}>{filteredCourses.length} available</Text>
        </View>

        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySub}>Adjust your search or category filter.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCourses}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.coursesList}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FC' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 },
  backButton: { padding: 6 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111' },
  headerSub: { fontSize: 14, color: '#666', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  categoriesContainer: { paddingHorizontal: 20, paddingVertical: 12 },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  categoryButtonActive: { backgroundColor: '#00c2c2', borderColor: '#00c2c2' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#666' },
  categoryTextActive: { color: '#fff' },
  coursesInfo: { paddingHorizontal: 20, paddingBottom: 8 },
  countText: { fontSize: 14, fontWeight: '600', color: '#888' },
  coursesList: { paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 14, color: '#888', marginTop: 6 },
});
