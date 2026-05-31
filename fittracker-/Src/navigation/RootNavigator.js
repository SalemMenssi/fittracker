import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from './routes';

import UserTabNavigator from './UserTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OnboardingFlow from '../screens/onboarding/OnboardingFlow';

import DailyQuestDetailScreen from '../screens/quests/DailyQuestDetailScreen';
import IntelligenceDetailScreen from '../screens/quests/IntelligenceDetailScreen';
import MarketplaceScreen from '../screens/profile/MarketplaceScreen';

import CourseDetailScreen from '../screens/routines/CourseDetailScreen';
import LessonDetailScreen from '../screens/routines/LessonDetailScreen';
import CoursesScreen from '../screens/routines/CoursesScreen';

import ChallengesScreen from '../screens/arena/ChallengesScreen';
import LeaderBoardScreen from '../screens/arena/LeaderBoardScreen';
import SocialScreen from '../screens/arena/SocialScreen';
import TestsListScreen from '../screens/arena/TestsListScreen';
import TestScreen from '../screens/arena/TestScreen';
import FitTrackerScreen from '../screens/arena/FitTrackerScreen';
import AwardsScreen from '../screens/profile/AwardsScreen';

import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PrivacySecurityScreen from '../screens/profile/PrivacySecurityScreen';
import StatsScreen from '../screens/profile/StatsScreen';
const Stack = createStackNavigator();

export default function RootNavigator({ initialRouteName }) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.SIGNUP} component={SignUpScreen} />
      <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingFlow} />
      <Stack.Screen name={ROUTES.USER} component={UserTabNavigator} />
      <Stack.Screen name={ROUTES.ADMIN_ROOT} component={AdminTabNavigator} />

      <Stack.Screen name={ROUTES.DAILY_QUEST_DETAIL} component={DailyQuestDetailScreen} />
      <Stack.Screen name={ROUTES.MARKETPLACE} component={MarketplaceScreen} />

      <Stack.Screen name={ROUTES.LINGUISTIC_DETAIL} component={IntelligenceDetailScreen} />
      <Stack.Screen name={ROUTES.LOGICAL_DETAIL} component={IntelligenceDetailScreen} />
      <Stack.Screen name={ROUTES.SPATIAL_DETAIL} component={IntelligenceDetailScreen} />
      <Stack.Screen name={ROUTES.MUSICAL_DETAIL} component={IntelligenceDetailScreen} />
      <Stack.Screen name={ROUTES.BODILY_DETAIL} component={IntelligenceDetailScreen} />
      <Stack.Screen name={ROUTES.NATURALISTIC_DETAIL} component={IntelligenceDetailScreen} />
      <Stack.Screen name={ROUTES.INTERPERSONAL_DETAIL} component={IntelligenceDetailScreen} />
      <Stack.Screen name={ROUTES.INTRAPERSONAL_DETAIL} component={IntelligenceDetailScreen} />

      <Stack.Screen name={ROUTES.COURSE_DETAIL} component={CourseDetailScreen} />
      <Stack.Screen name={ROUTES.LESSON_DETAIL} component={LessonDetailScreen} />
      <Stack.Screen name={ROUTES.COURSES} component={CoursesScreen} />

      <Stack.Screen name={ROUTES.CHALLENGES} component={ChallengesScreen} />
      <Stack.Screen name={ROUTES.LEADERBOARD} component={LeaderBoardScreen} />
      <Stack.Screen name={ROUTES.SOCIAL} component={SocialScreen} />
      <Stack.Screen name={ROUTES.TESTS_LIST} component={TestsListScreen} />
      <Stack.Screen name={ROUTES.TEST} component={TestScreen} />
      <Stack.Screen name={ROUTES.WORKOUTS} component={FitTrackerScreen} />
      <Stack.Screen name={ROUTES.AWARDS} component={AwardsScreen} />

      <Stack.Screen name={ROUTES.PERSONAL_INFO} component={PersonalInfoScreen} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
      <Stack.Screen name={ROUTES.PRIVACY_SECURITY} component={PrivacySecurityScreen} />
      <Stack.Screen name={ROUTES.STATS} component={StatsScreen} />
    </Stack.Navigator>
  );
}
