import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const TOKEN_KEY = "@fittracker_token";

// Helper to map backend data (tasks) to frontend expectation (Tasks)
const mapCourse = (course) => {
    if (!course) return null;
    return {
        ...course,
        id: course._id,
        Tasks: (course.tasks || []).map(t => ({ ...t, id: t._id }))
    };
};

// Initialize courses (now just a fetch wrapper)
export const initCourses = async () => {
    return await getAllCourses();
};

// Get all courses from backend
export const getAllCourses = async () => {
    try {
        const response = await fetch(`${API_URL}/courses`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.map(mapCourse);
    } catch (error) {
        console.error("CourseService Error:", error);
        return [];
    }
};

// Get a single course by id
export const getCourseById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/courses/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return mapCourse(data);
    } catch (error) {
        console.error("CourseService Error:", error);
        return null;
    }
};

// Join a course
export const joinCourse = async (id) => {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const response = await fetch(`${API_URL}/courses/${id}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data; // message
    } catch (error) {
        throw error;
    }
};

// Leave a course
export const leaveCourse = async (id) => {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const response = await fetch(`${API_URL}/courses/${id}/join`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
};

// Update task status in a course
export const updateTaskStatus = async (courseId, taskId, completed) => {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const response = await fetch(`${API_URL}/courses/${courseId}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                status: completed ? 'done' : 'pending',
                // backend will handle streak/XP if needed or we could pass more
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return mapCourse(data);
    } catch (error) {
        throw error;
    }
};

// Create a new course
export const addCourse = async (courseData) => {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return mapCourse(data);
    } catch (error) {
        throw error;
    }
};

// Update a course
export const updateCourse = async (courseData) => {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const response = await fetch(`${API_URL}/courses/${courseData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return mapCourse(data);
    } catch (error) {
        throw error;
    }
};

// Delete a course
export const deleteCourse = async (id) => {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const response = await fetch(`${API_URL}/courses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return true;
    } catch (error) {
        throw error;
    }
};

export default {
    initCourses,
    getAllCourses,
    getCourseById,
    joinCourse,
    leaveCourse,
    updateTaskStatus,
    addCourse,
    updateCourse,
    deleteCourse,
};
