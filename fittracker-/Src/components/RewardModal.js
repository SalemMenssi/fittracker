import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RewardModal({
  visible,
  title,
  xp,
  baseXP,
  bonusXP,
  finalXP,
  coins,
  appliedBoosters,
  onClose,
}) {
  const displayXp = finalXP ?? xp;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons name="flash" size={40} color="#00c2c2" />
          <Text style={styles.title}>{title || 'Quest Progress'}</Text>
          {baseXP != null && bonusXP > 0 ? (
            <>
              <Text style={styles.detail}>Base +{baseXP} XP</Text>
              <Text style={styles.bonus}>Booster +{bonusXP} XP</Text>
            </>
          ) : null}
          {displayXp != null && <Text style={styles.xp}>+{displayXp} XP</Text>}
          {coins != null && <Text style={styles.coins}>+{coins} coins</Text>}
          {appliedBoosters?.length > 0 && (
            <Text style={styles.boosterNote}>
              {appliedBoosters.map((b) => `${b.itemId} ×${b.multiplier}`).join(', ')}
            </Text>
          )}
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#1a2332', borderRadius: 20, padding: 28, alignItems: 'center', width: '100%', maxWidth: 320, borderWidth: 1, borderColor: '#00c2c233' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 12 },
  detail: { color: '#8a9bb0', fontSize: 14, marginTop: 8 },
  bonus: { color: '#f4c542', fontSize: 14 },
  xp: { color: '#00c2c2', fontSize: 24, fontWeight: '800', marginTop: 8 },
  coins: { color: '#f4c542', fontSize: 16, marginTop: 4 },
  boosterNote: { color: '#8a9bb0', fontSize: 11, marginTop: 8, textAlign: 'center' },
  btn: { marginTop: 20, backgroundColor: '#00c2c2', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#0d1117', fontWeight: '700' },
});
