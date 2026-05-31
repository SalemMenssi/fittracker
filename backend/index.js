const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./Config/db');

// Route imports
const authRoutes = require('./Routes/authRoutes');
const activityRoutes = require('./Routes/activityRoutes');
const courseRoutes = require('./Routes/courseRoutes');
const postRoutes = require('./Routes/postRoutes');
const uploadRoutes = require('./Routes/uploadRoutes');
const challengeRoutes = require('./Routes/challengeRoutes');
const systemRoutes = require('./Routes/systemRoutes');
const dailyQuestRoutes = require('./Routes/dailyQuestRoutes');
const intelligenceRoutes = require('./Routes/intelligenceRoutes');
const marketplaceRoutes = require('./Routes/marketplaceRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');
const statHistoryRoutes = require('./Routes/statHistoryRoutes');
const testRoutes = require('./Routes/testRoutes');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/daily-quests', dailyQuestRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statHistoryRoutes);
app.use('/api/tests', testRoutes);

// Static folders
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('FitTracker API is running 🚀');
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://10.198.81.68:${PORT}`);
});