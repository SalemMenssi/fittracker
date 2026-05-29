import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { register } from "../services/AuthService";

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unit, setUnit] = useState("metric"); // "metric" or "imperial"
  const [age, setAge] = useState("25");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!fullName || !email || !password || !age || !weight || !height) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 4) {
      Alert.alert("Error", "Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    try {
      console.log({ fullName, email, password, age, weight, height, unit })
      await register({ fullName, email, password, age, weight, height, unit });
      navigation.reset({ index: 0, routes: [{ name: "User" }] });
    } catch (err) {
      Alert.alert("Registration Failed", `${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create account</Text>

          {/* Title */}
          <Text style={styles.title}>Let's get started</Text>
          <Text style={styles.subtitle}>
            Enter your details to personalize your fitness plan.
          </Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Unit System */}
          <Text style={styles.label}>Preferred Unit System</Text>
          <View style={styles.unitRow}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === "metric" && styles.unitBtnActive]}
              onPress={() => setUnit("metric")}
            >
              <Text style={[styles.unitText, unit === "metric" && styles.unitTextActive]}>
                Metric (kg/cm)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, unit === "imperial" && styles.unitBtnActive]}
              onPress={() => setUnit("imperial")}
            >
              <Text style={[styles.unitText, unit === "imperial" && styles.unitTextActive]}>
                Imperial (lb/ft)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Age */}
          <Text style={styles.label}>Age</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
            <Text style={styles.unit}>yrs</Text>
          </View>

          {/* Weight */}
          <Text style={styles.label}>Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <Text style={styles.unit}>{unit === "metric" ? "kg" : "lb"}</Text>
          </View>

          {/* Height */}
          <Text style={styles.label}>Height</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
            <Text style={styles.unit}>{unit === "metric" ? "cm" : "ft"}</Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ</Text>
            <Text style={styles.infoText}>
              Your physical metrics are used to calculate accurate calorie burn
              and personalize your workout intensities.
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </TouchableOpacity>

          {/* Sign In */}
          <Text style={styles.signin}>
            Already have an account?{" "}
            <Text style={styles.signinLink} onPress={() => navigation.navigate("Login")}>
              Sign in
            </Text>
          </Text>

          {/* Terms */}
          <Text style={styles.terms}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.{"\n"}
            FitTracker ensures your data is encrypted and secure.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  back: {
    fontSize: 30,
    color: "#333",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: -30,
    marginBottom: 24,
    color: "#111",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: "#444",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  unit: {
    marginLeft: 10,
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  unitRow: {
    flexDirection: "row",
    backgroundColor: "#efefef",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  unitBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unitText: {
    fontSize: 13,
    color: "#888",
  },
  unitTextActive: {
    color: "#111",
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#e8f9f9",
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    alignItems: "flex-start",
    gap: 10,
  },
  infoIcon: {
    fontSize: 16,
    color: "#00c2c2",
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#444",
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#00c2c2",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signin: {
    textAlign: "center",
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
  },
  signinLink: {
    color: "#00c2c2",
    fontWeight: "600",
  },
  terms: {
    textAlign: "center",
    fontSize: 10,
    color: "#bbb",
    lineHeight: 16,
  },
});