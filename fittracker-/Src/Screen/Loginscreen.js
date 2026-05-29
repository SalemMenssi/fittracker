import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { login } from "../services/AuthService";

const Loginscreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      navigation.reset({ index: 0, routes: [{ name: data?.isAdmin ? "AdminRoot" : "User" }] });
    } catch (err) {
      Alert.alert("Login Failed", `${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ width: "100%", alignItems: "center" }}
      >
        {/* Logo */}
        <View style={styles.logo} />
        <Text style={styles.appName}>FitTrack</Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Enter your credentials to continue
          </Text>

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordRow}>
            <Text style={styles.label}>PASSWORD</Text>

            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={styles.forgot}>
                {showPw ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              placeholder="••••••••"
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRemember(!remember)}
          >
            <View
              style={[
                styles.checkbox,
                remember && styles.checkboxChecked,
              ]}
            >
              {remember && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>

            <Text style={styles.rememberText}>
              Remember me
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Sign In →
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.signup}>
          Don't have an account?
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.signupLink}>
              {" "}Sign up
            </Text>
          </TouchableOpacity>

        </Text>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Loginscreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
    alignItems: "center",
    paddingTop: 40,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#00c2c2",
  },
  appName: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "gray",
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: "#777",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgot: {
    fontSize: 12,
    color: "#00c2c2",
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#aaa",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
  },
  checkboxChecked: {
    backgroundColor: "#00c2c2",
    borderColor: "#00c2c2",
  },
  checkmark: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  rememberText: {
    fontSize: 12,
  },
  button: {
    backgroundColor: "#00c2c2",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signup: {
    marginTop: 20,
    fontSize: 12,
  },
  signupLink: {
    color: "#00c2c2",
  },
});