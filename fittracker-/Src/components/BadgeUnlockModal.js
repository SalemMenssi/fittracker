import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BadgeUnlockModal({ visible, badges = [], onClose }) {
  if (!visible || !badges.length) return null;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons name="ribbon" size={48} color="#f4c542" />
          <Text style={styles.title}>Badge Unlocked</Text>
          <ScrollView style={styles.list}>
            {badges.map((b) => (
              <Text key={b.badgeId} style={styles.badgeName}>
                {b.label || b.badgeId}
              </Text>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#1a2332', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#f4c54255' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 12 },
  list: { maxHeight: 120, marginVertical: 12, width: '100%' },
  badgeName: { color: '#f4c542', textAlign: 'center', fontSize: 16, marginVertical: 4, fontWeight: '600' },
  btn: { backgroundColor: '#00c2c2', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#0d1117', fontWeight: '700' },
});
