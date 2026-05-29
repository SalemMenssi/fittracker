const express = require('express');
const { getCourses, getCourseById, joinCourse, unjoinCourse, updateTaskStatus, createCourse, updateCourse, deleteCourse } = require('../Controllers/courseController');
const { protect } = require('../Middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(protect, createCourse);

router.route('/:id')
    .get(getCourseById)
    .put(protect, updateCourse)
    .delete(protect, deleteCourse);

router.post('/:id/join', protect, joinCourse);
router.delete('/:id/join', protect, unjoinCourse);
router.put('/:id/tasks/:taskId', protect, updateTaskStatus);

module.exports = router;
