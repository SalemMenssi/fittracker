import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TAB_ICONS = {
  Home: 'home-outline',
  Quests: 'sparkles-outline',
  Routines: 'barbell-outline',
  Arena: 'trophy-outline',
  Profile: 'person-circle-outline',
  AdminUsers: 'people-outline',
  AdminManage: 'construct-outline',
  AdminSettings: 'settings-outline',
};

export default function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;
        const color = isFocused ? '#00c2c2' : '#888';
        const icon = TAB_ICONS[route.name] || 'ellipse-outline';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            <Ionicons name={icon} size={22} color={color} />
            <Text style={[styles.navLabel, isFocused && styles.navLabelActive]} numberOfLines={1}>
              {label}
            </Text>
            {isFocused && <View style={styles.navDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 25,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 2,
  },
  navLabel: {
    fontSize: 10,
    color: '#aaa',
  },
  navLabelActive: {
    color: '#00c2c2',
    fontWeight: '600',
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00c2c2',
    marginTop: 2,
  },
});
