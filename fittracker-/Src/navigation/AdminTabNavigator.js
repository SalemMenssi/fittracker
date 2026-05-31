import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from './CustomTabBar';
import { ROUTES } from './routes';

import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminManageScreen from '../screens/admin/AdminManageScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name={ROUTES.ADMIN_USERS} component={AdminUsersScreen} options={{ title: 'Users' }} />
      <Tab.Screen name={ROUTES.ADMIN_MANAGE} component={AdminManageScreen} options={{ title: 'Manage' }} />
      <Tab.Screen name={ROUTES.ADMIN_SETTINGS} component={AdminSettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
