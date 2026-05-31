import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6f8" }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "#fff" }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111", marginLeft: 15 }}>Terms & Conditions</Text>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111" }}>Terms & Conditions</Text>
        <Text style={{ fontSize: 14, color: "#888", marginTop: 8 }}>Page is working!</Text>
      </View>
    </SafeAreaView>
  );
}