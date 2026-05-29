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
  Image,
  ActivityIndicator,
} from 'react-native';
import { getAllCourses } from "../services/CourseService";
import { useIsFocused } from "@react-navigation/native";

export default function CoursesScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Study', 'Fitness', 'Discipline', 'Productivity', 'Mental Focus', 'Health', 'Skill Building', 'Daily Life'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCourses(data);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) fetchCourses();
  }, [isFocused]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.workoutType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCoursePress = (course) => {
    navigation.navigate('CourseDetail', { Item: course });
  };

  const renderCourseCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => handleCoursePress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.courseImage} />
      
      <View style={styles.cardContent}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.readMoreButton}
            onPress={() => handleCoursePress(item)}
          >
            <Text style={styles.readMoreText}>{item.Status ? "Continue" : "Read More"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00ccff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
            <Text style={styles.headerTitle}>Routines List</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIconContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search routines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* All Courses Info */}
        <View style={styles.coursesInfo}>
          <Text style={styles.allCoursesText}>ALL ROUTINES</Text>
          <Text style={styles.coursesCount}>{filteredCourses.length} Routines Found</Text>
        </View>

        {/* Courses List */}
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.coursesList}
        />

        <View style={{ height: 40 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 28, color: '#00c2c2' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A' },
  section: { paddingHorizontal: 20, paddingVertical: 10 },
  sectionTitle: { fontSize: 24, fontWeight: '600', color: '#00c2c2' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  searchIconContainer: { paddingLeft: 12 },
  searchIcon: { fontSize: 18, color: '#999' },
  searchInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 },
  categoriesContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  categoryButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  categoryButtonActive: { backgroundColor: '#00c2c2', borderColor: '#00c2c2' },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#666666' },
  categoryTextActive: { color: '#FFFFFF' },
  coursesInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  allCoursesText: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  coursesCount: { fontSize: 14, color: '#00c2c2', fontWeight: '500' },
  coursesList: { paddingHorizontal: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  courseImage: { width: '100%', height: 160, resizeMode: 'cover' },
  cardContent: { padding: 16 },
  courseTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  courseDescription: { fontSize: 14, color: '#666666', lineHeight: 20, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  readMoreButton: { flex: 1, backgroundColor: '#cffaff', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  readMoreText: { color: '#00c2c2', fontSize: 14, fontWeight: 'bold' },
});