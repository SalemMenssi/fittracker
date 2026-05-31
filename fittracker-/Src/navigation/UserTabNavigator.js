import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from './CustomTabBar';
import { ROUTES } from './routes';

import HomeScreen from '../screens/home/HomeScreen';
import QuestsHubScreen from '../screens/hubs/QuestsHubScreen';
import RoutinesScreen from '../screens/routines/RoutinesScreen';
import ArenaHubScreen from '../screens/hubs/ArenaHubScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name={ROUTES.TAB_HOME} component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name={ROUTES.TAB_QUESTS} component={QuestsHubScreen} options={{ tabBarLabel: 'Quests' }} />
      <Tab.Screen name={ROUTES.TAB_ROUTINES} component={RoutinesScreen} options={{ tabBarLabel: 'Routines' }} />
      <Tab.Screen name={ROUTES.TAB_ARENA} component={ArenaHubScreen} options={{ tabBarLabel: 'Arena' }} />
      <Tab.Screen name={ROUTES.TAB_PROFILE} component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
