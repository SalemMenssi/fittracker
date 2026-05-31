import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMarketplaceItems, purchaseItem, activateMarketplaceItem } from '../../services/MarketplaceService';
import { getProfile } from '../../services/AuthService';
import { RPG, cardStyle } from '../../theme/rpgTheme';

export default function MarketplaceScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [activeBoosters, setActiveBoosters] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getMarketplaceItems();
      setItems(data.items || []);
      setActiveBoosters(data.activeBoosters || []);
      setInventory(data.inventory || []);
      setCoins(data.coins ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBuy = async (item) => {
    try {
      const res = await purchaseItem(item.itemId);
      Alert.alert('Purchased', res.boosterActivated ? `${item.name} purchased and activated!` : `${item.name} added to inventory.`);
      load();
    } catch (e) {
      Alert.alert('Purchase failed', e.message);
    }
  };

  const handleActivate = async (item) => {
    try {
      await activateMarketplaceItem(item.itemId);
      Alert.alert('Activated', `${item.name} booster is active for 24h.`);
      load();
    } catch (e) {
      Alert.alert('Activate failed', e.message);
    }
  };

  const owns = (itemId) => inventory.some((i) => i.itemId === itemId);
  const isActive = (itemId) => activeBoosters.some((b) => b.itemId === itemId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Marketplace</Text>
        <View style={styles.coins}><Ionicons name="logo-bitcoin" size={16} color={RPG.gold} /><Text style={styles.coinText}>{coins}</Text></View>
      </View>
      {loading ? (
        <ActivityIndicator color={RPG.accent} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sub}>Self-development items, boosters & cosmetics</Text>
          {activeBoosters.length > 0 && (
            <Text style={styles.activeNote}>Active boosters: {activeBoosters.map((b) => b.itemId).join(', ')}</Text>
          )}
          {items.map((item) => (
            <View key={item.itemId} style={cardStyle}>
              <View style={styles.row}>
                <Ionicons name={item.icon || 'gift-outline'} size={28} color={RPG.accent} />
                <View style={styles.flex}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.rarity}>{item.rarity} · +{item.boostPercent || 10}% XP</Text>
                  {isActive(item.itemId) && <Text style={styles.activeTag}>ACTIVE</Text>}
                </View>
                {owns(item.itemId) ? (
                  <TouchableOpacity style={styles.activateBtn} onPress={() => handleActivate(item)}>
                    <Text style={styles.buyText}>Use</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.buyBtn} onPress={() => handleBuy(item)}>
                    <Text style={styles.buyText}>{item.priceCoins}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RPG.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  title: { flex: 1, color: '#fff', fontSize: 20, fontWeight: '700' },
  coins: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  coinText: { color: RPG.gold, fontWeight: '700' },
  scroll: { padding: 16 },
  sub: { color: RPG.textMuted, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  itemName: { color: '#fff', fontWeight: '700' },
  itemDesc: { color: RPG.textMuted, fontSize: 12, marginTop: 4 },
  rarity: { color: RPG.accent, fontSize: 10, marginTop: 4, textTransform: 'capitalize' },
  buyBtn: { backgroundColor: RPG.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  activateBtn: { backgroundColor: '#2ecc71', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  buyText: { color: '#0d1117', fontWeight: '800' },
  activeNote: { color: '#2ecc71', fontSize: 12, marginBottom: 12 },
  activeTag: { color: '#2ecc71', fontSize: 10, fontWeight: '700', marginTop: 4 },
});
