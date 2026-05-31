import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { getProfile, updateUser } from "../../services/AuthService";
import { useIsFocused } from "@react-navigation/native";

export default function PersonalInfoScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);


  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    location: "",
    weight: "",
    height: "",
    age: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await getProfile();
        if (u) {
          setUser(u);
          setForm({
            fullName: u.fullName || "",
            phone: u.phone || "",
            dateOfBirth: u.dateOfBirth || "",
            gender: u.gender || "",
            location: u.location || "",
            weight: u.weight?.toString() || "",
            height: u.height?.toString() || "",
            age: u.age?.toString() || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) fetchUser();
  }, [isFocused]);

  // ── Image Picker ────────────────────────────────────────────────────────────
  const handleChangePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to change your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],     // square crop for avatar
      quality: 0.75,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setAvatarUploading(true);
      try {
        const updated = await updateUser({ avatar: uri });
        setUser(updated);
        Alert.alert("✅ Done", "Profile picture updated!");
      } catch (e) {
        Alert.alert("Error", "Could not update profile picture.");
      } finally {
        setAvatarUploading(false);
      }
    }
  };

  // ── Save form ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    try {
      setSaving(true);
      
      // Automatic age calculation before saving
      const age = calculateAge(form.dateOfBirth);
      const dataToSave = { ...form, age };
      
      const updated = await updateUser(dataToSave);
      setUser(updated);
      setIsEditing(false);
      Alert.alert("✅ Succès", "Profil mis à jour !");
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'enregistrer les modifications.");
      console.log(e)
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (birthday) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString("fr-FR", options);
    } catch (e) {
      return dateString;
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const birthDate = selectedDate.toISOString();
      const age = calculateAge(birthDate);
      setForm(prev => ({ 
        ...prev, 
        dateOfBirth: birthDate,
        age: age.toString()
      }));
    }
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  const infoFields = [
    { key: "fullName",    label: "Full Name",     placeholder: "Enter your name" },
    { key: "email",       label: "Email",          disabled: true },
    { key: "phone",       label: "Phone",          placeholder: "+1 555 000 0000", keyboardType: "phone-pad" },
    { key: "dateOfBirth", label: "Date of Birth",  type: "date" },
    { key: "gender",      label: "Gender",         type: "gender" },
    { key: "location",    label: "Location",       placeholder: "City, Country" },
    { key: "weight",      label: "Weight",         placeholder: "70", keyboardType: "numeric" },
    { key: "height",      label: "Height",         placeholder: "175", keyboardType: "numeric" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back-outline" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.editBtn}>
            {saving ? (
              <ActivityIndicator size="small" color="#00c2c2" />
            ) : (
              <Text style={styles.editBtnText}>{isEditing ? "Save" : "Edit"}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Avatar Section ─────────────────────────────────────────────────── */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: user.avatar || "https://randomuser.me/api/portraits/men/32.jpg",
                }}
                style={styles.avatar}
              />

              {/* pencil badge */}
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handleChangePhoto}
                disabled={avatarUploading}
              >
                {avatarUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.changePhotoBtn}
              onPress={handleChangePhoto}
              disabled={avatarUploading}
            >
              {avatarUploading ? (
                <ActivityIndicator size="small" color="#00c2c2" />
              ) : (
                <>
                  <Ionicons name="image-outline" size={16} color="#00c2c2" />
                  <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.avatarHint}>Tap the camera icon or the button above</Text>
          </View>

          {/* ── Info Fields ───────────────────────────────────────────────────── */}
          <View style={styles.card}>
            {infoFields.map((item, i) => (
              <View
                key={item.key}
                style={[styles.infoRow, i === infoFields.length - 1 && { borderBottomWidth: 0 }]}
              >
                <Text style={styles.infoLabel}>{item.label}</Text>
                {isEditing && !item.disabled ? (
                  item.type === "date" ? (
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateDisplay}>
                      <Text style={styles.infoInputText}>{formatDate(form.dateOfBirth)}</Text>
                    </TouchableOpacity>
                  ) : item.type === "gender" ? (
                    <View style={styles.genderRow}>
                      {["Male", "Female", "Other"].map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
                          onPress={() => setForm(prev => ({ ...prev, gender: g }))}
                        >
                          <Text style={[styles.genderBtnText, form.gender === g && styles.genderBtnTextActive]}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <TextInput
                      style={styles.infoInput}
                      value={form[item.key]}
                      onChangeText={(txt) =>
                        setForm((prev) => ({ ...prev, [item.key]: txt }))
                      }
                      placeholder={item.placeholder || `Enter ${item.label}`}
                      placeholderTextColor="#ccc"
                      keyboardType={item.keyboardType || "default"}
                    />
                  )
                ) : (
                  <Text style={[styles.infoValue, item.disabled && { color: "#bbb" }]}>
                    {item.key === "dateOfBirth" 
                      ? formatDate(user[item.key] || form[item.key])
                      : (item.disabled ? user[item.key] : form[item.key] || "—")}
                  </Text>
                )}
              </View>
            ))}
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={form.dateOfBirth ? new Date(form.dateOfBirth) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
          {/* ── Metrics row (read-only) ──────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>BODY METRICS</Text>
          <View style={styles.metricsRow}>
            {[
              { label: user?.unit === "imperial" ? "LB" : "KG",   value: user?.weight || "—" },
              { label: user?.unit === "imperial" ? "FT" : "CM",   value: user?.height || "—" },
              { label: "AGE",  value: user?.age || "—" },
            ].map((m, i) => (
              <View key={i} style={[styles.metricItem, i < 2 && styles.metricBorder]}>
                <Text style={styles.metricValue}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8" },
  centered:  { justifyContent: "center", alignItems: "center" },

  // header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 17, fontWeight: "bold", color: "#111" },
  editBtn: { minWidth: 48, alignItems: "flex-end" },
  editBtnText: { fontSize: 15, color: "#00c2c2", fontWeight: "700" },

  // avatar
  avatarSection: { alignItems: "center", paddingVertical: 28, backgroundColor: "#fff", marginBottom: 12 },
  avatarWrapper: { position: "relative", marginBottom: 14 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: "#00c2c2",
  },
  cameraBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#00c2c2",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
    elevation: 4,
  },
  changePhotoBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#e8f9f9", paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 22, marginBottom: 6,
  },
  changePhotoText: { color: "#00c2c2", fontWeight: "700", fontSize: 14 },
  avatarHint: { fontSize: 11, color: "#bbb", marginTop: 4 },

  // info card
  card: {
    backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20,
    paddingVertical: 4, elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
  },
  infoLabel: { fontSize: 14, color: "#888", width: 110 },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#111", flex: 1, textAlign: "right" },
  infoInput: {
    fontSize: 14, fontWeight: "600", color: "#00c2c2",
    flex: 1, textAlign: "right", padding: 0,
    borderBottomWidth: 1, borderBottomColor: "#00c2c240",
  },

  // metrics
  sectionLabel: {
    fontSize: 11, color: "#aaa", fontWeight: "700", letterSpacing: 1,
    paddingHorizontal: 30, marginBottom: 8,
  },
  metricsRow: {
    flexDirection: "row", backgroundColor: "#fff",
    marginHorizontal: 20, borderRadius: 20,
    paddingVertical: 18, elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
  },
  metricItem: { flex: 1, alignItems: "center" },
  metricBorder: { borderRightWidth: 1, borderRightColor: "#f0f0f0" },
  metricValue: { fontSize: 22, fontWeight: "bold", color: "#111" },
  metricLabel: { fontSize: 10, color: "#aaa", marginTop: 4, letterSpacing: 0.5 },

  // New styles
  dateDisplay: {
    flex: 1,
    alignItems: "flex-end",
  },
  infoInputText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00c2c2",
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  genderBtnActive: {
    backgroundColor: "#00c2c2",
    borderColor: "#00c2c2",
  },
  genderBtnText: {
    fontSize: 12,
    color: "#888",
  },
  genderBtnTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});