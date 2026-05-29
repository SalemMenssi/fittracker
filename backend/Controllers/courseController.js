const Course = require('../Models/Course');
const User = require('../Models/User');

const VALID_WORKOUT_TYPES = ['Study', 'Fitness', 'Discipline', 'Productivity', 'Mental Focus', 'Health', 'Skill Building', 'Daily Life'];
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const VALID_STATUS = ['open', 'expired', 'completed'];

const normalizeStatus = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'active') return 'open';
  return VALID_STATUS.includes(v) ? v : 'open';
};

const normalizeWorkoutType = (value) => {
  const v = String(value || '').trim().toLowerCase();
  const found = VALID_WORKOUT_TYPES.find((w) => w.toLowerCase() === v);
  return found || 'Discipline';
};

const normalizeDifficulty = (value) => {
  const v = String(value || '').trim().toLowerCase();
  const found = VALID_DIFFICULTIES.find((d) => d.toLowerCase() === v);
  return found || 'Medium';
};

// @desc    Get all courses
// @route   GET /api/courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a course
// @route   POST /api/courses/:id/join
const joinCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (course && user) {
      if (!user.joinedCourses.includes(course._id)) {
        user.joinedCourses.push(course._id);
        await user.save();
      }
      res.json({ message: 'Course joined successfully' });
    } else {
      res.status(404).json({ message: 'Course or User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status in a course
// @route   PUT /api/courses/:id/tasks/:taskId
const updateTaskStatus = async (req, res) => {
    try {
        const { status, streak, lastCompletedDate } = req.body;
        const course = await Course.findById(req.params.id);
        
        if (course) {
            const task = course.tasks.id(req.params.taskId);
            if (task) {
                task.status = status || task.status;
                task.streak = streak !== undefined ? streak : task.streak;
                task.lastCompletedDate = lastCompletedDate || task.lastCompletedDate;
                
                await course.save();

                // Gain XP for completing task
                if (status === 'done') {
                    const user = await User.findById(req.user._id);
                    if (user) {
                        user.xp += 10;
                        user.points += 5;
                        await user.save();
                    }
                }

                res.json(course);
            } else {
                res.status(404).json({ message: 'Task not found' });
            }
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new course (Admin/Creator)
// @route   POST /api/courses
const createCourse = async (req, res) => {
    try {
        const { title, description, workoutType, difficulty, levelRequirement, expiryDate, status, duration, image, rules, tasks } = req.body;
        
        const course = new Course({
            title,
            description,
            workoutType: normalizeWorkoutType(workoutType),
            difficulty: normalizeDifficulty(difficulty),
            levelRequirement,
            expiryDate,
            status: normalizeStatus(status),
            duration,
            image,
            rules,
            tasks
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { title, description, workoutType, difficulty, levelRequirement, expiryDate, status, duration, image, rules, Tasks } = req.body;
        
        let course = await Course.findById(req.params.id);
        
        if (course) {
            course.title = title || course.title;
            course.description = description || course.description;
            course.workoutType = workoutType ? normalizeWorkoutType(workoutType) : normalizeWorkoutType(course.workoutType);
            course.difficulty = difficulty ? normalizeDifficulty(difficulty) : normalizeDifficulty(course.difficulty);
            course.levelRequirement = levelRequirement || course.levelRequirement;
            course.expiryDate = expiryDate || course.expiryDate;
            course.status = status ? normalizeStatus(status) : normalizeStatus(course.status);
            course.duration = duration || course.duration;
            course.image = image || course.image;
            course.rules = rules || course.rules;
            // The frontend map sends 'Tasks', model schema stores it as 'tasks'
            course.tasks = Tasks || course.tasks;

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            await Course.deleteOne({ _id: req.params.id });
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unjoin a course
// @route   DELETE /api/courses/:id/join
const unjoinCourse = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.joinedCourses = user.joinedCourses.filter(
        (courseId) => courseId.toString() !== req.params.id
      );
      await user.save();
      res.json({ message: 'Course removed from your list' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourses, getCourseById, joinCourse, unjoinCourse, updateTaskStatus, createCourse, updateCourse, deleteCourse };
