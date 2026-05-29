const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./Models/User');
const Course = require('./Models/Course');
const Post = require('./Models/Post');
const Challenge = require('./Models/Challenge');
const connectDB = require('./Config/db');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Course.deleteMany();
        await Post.deleteMany();
        await Challenge.deleteMany();

        console.log('Data Destroyed...');

        // Create a test user
        const testUser = await User.create({
            fullName: 'Sung Park',
            email: 'hunter@example.com',
            password: 'password123',
            age: 24,
            weight: 71,
            height: 178,
            avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
            performanceLevel: 3,
            xp: 45,
            rank: 'D-Rank',
            classType: 'Shadow Trainee',
            dayStreak: 6,
            earnedBadges: [{ badgeId: 'first_quest_complete', date: 'Apr 27' }],
        });

        await User.create({
            fullName: 'System Admin',
            email: 'admin@system.app',
            password: 'admin123',
            age: 30,
            isAdmin: true,
            rank: 'S-Rank',
            classType: 'System Overseer',
            performanceLevel: 10,
            points: 999,
            xp: 80,
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        });

        // Create routine courses
        const courses = await Course.insertMany([
            {
                title: "System Morning Protocol",
                description: "A structured start to build discipline through wake-up, hydration, and planning rituals.",
                workoutType: "Discipline",
                difficulty: "Easy",
                levelRequirement: 1,
                duration: "20 Minutes",
                image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400",
                isStandard: true,
                tasks: [
                    { title: "Hydrate", description: "Drink one full glass of water after waking up" },
                    { title: "Daily Quest Board", description: "Write top 3 priority tasks for today" },
                    { title: "No-phone Focus", description: "Stay off social media for the first 30 minutes" }
                ]
            },
            {
                title: "Scholar Grind Session",
                description: "Study-focused routine to improve retention and consistency.",
                workoutType: "Study",
                difficulty: "Medium",
                levelRequirement: 2,
                duration: "45 Minutes",
                image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
                isStandard: true,
                tasks: [
                    { title: "Deep Work Block", description: "Complete one 40-minute focused study block" },
                    { title: "Recall Drill", description: "Summarize what you learned in 5 bullet points" }
                ]
            },
            {
                title: "Hunter Body Conditioning",
                description: "Sustainable fitness habits to build stamina and strength.",
                workoutType: "Fitness",
                difficulty: "Medium",
                levelRequirement: 2,
                duration: "30 Minutes",
                image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400",
                isStandard: true,
                tasks: [
                    { title: "Bodyweight Circuit", description: "3 rounds: pushups, squats, plank" },
                    { title: "Recovery Stretch", description: "10 minutes mobility and breathing" }
                ]
            }
        ]);

        const now = new Date();
        const inThreeDays = new Date(now);
        inThreeDays.setDate(inThreeDays.getDate() + 3);
        await Challenge.insertMany([
            {
                title: '7-Day Focus Awakening',
                description: 'Complete one focused study task every day for 7 days.',
                category: 'Mental Focus',
                difficulty: 'Medium',
                expReward: 120,
                levelRequirement: 2,
                startDate: now,
                expiryDate: inThreeDays,
                tasks: [
                    { title: 'Daily Deep Work', description: 'Finish one uninterrupted focus session' },
                    { title: 'Reflection Note', description: 'Log one lesson learned for the day' }
                ],
                joinedUsers: [testUser._id],
                status: 'open'
            }
        ]);

        // Create some posts
        await Post.insertMany([
            {
                user: testUser._id,
                userName: testUser.fullName,
                userAvatar: testUser.avatar,
                text: "System update: Daily Quest complete. +45 EXP today.",
                image: "https://images.unsplash.com/photo-1599058917765-a3b875d67c6d?w=400"
            },
            {
                user: testUser._id,
                userName: testUser.fullName,
                userAvatar: testUser.avatar,
                text: "Awakening log: focus streak is active. Rank-up soon.",
            }
        ]);

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // Optional: Destroy function if you run `node seeder -d`
} else {
    seedData();
}
