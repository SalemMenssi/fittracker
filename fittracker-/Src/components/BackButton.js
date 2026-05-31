import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BackButton({ navigation, color = '#111', style, onDark = false }) {
  if (!navigation?.canGoBack?.()) return null;
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={[styles.btn, onDark && styles.onDark, style]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 4, alignSelf: 'flex-start' },
  onDark: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 8,
  },
});
