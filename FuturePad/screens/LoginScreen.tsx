import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { authService } from "../services";
import { useAppStore } from "../store/useAppStore";
import { isValidEmail } from "../utils/apiUtils";

const SOCIAL_PROVIDERS = [
  { id: "google", icon: require("@/assets/images/social/google.png") },
  { id: "apple", icon: require("@/assets/images/social/apple.png") },
  { id: "facebook", icon: require("@/assets/images/social/facebook.png") },
] as const;

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setAuthData = useAppStore((state) => state.setAuthData);

  const updateForm = useCallback((field: keyof typeof form) => 
    (value: string) => setForm(prev => ({ ...prev, [field]: value })), 
  []);

  const handleLogin = useCallback(async () => {
    const { email, password } = form;
    
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Error", "Please fill in all fields");
    }

    if (!isValidEmail(email)) {
      return Alert.alert("Error", "Please enter a valid email address");
    }

    setLoading(true);
    try {
      await authService.login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      Alert.alert("Success", "Welcome back!");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleSocialLogin = useCallback((provider: string) => {
    Alert.alert("Coming Soon", `${provider} login will be available soon!`);
  }, []);

  const toggleRememberMe = useCallback(() => setRememberMe(prev => !prev), []);
  const togglePasswordVisibility = useCallback(() => setShowPassword(prev => !prev), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Fixed Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Welcome Back</Text>
        </View>

        {/* Scrollable Content Sheet */}
        <View style={styles.contentWrapper}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelRow}>
                <MaterialIcons name="email" size={20} color="#E69A8D" />
                <Text style={styles.inputLabel}>Email Address</Text>
              </View>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={updateForm("email")}
                placeholder="johndoe@gmail.com"
                placeholderTextColor="#ccc"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="lock-closed" size={20} color="#E69A8D" />
                <Text style={styles.inputLabel}>Password</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={form.password}
                  onChangeText={updateForm("password")}
                  placeholder="Enter your password"
                  placeholderTextColor="#ccc"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity 
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={toggleRememberMe}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={loading ? "Signing In..." : "Sign In"}
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={loading}
            />

            {loading && (
              <ActivityIndicator size="small" color="#E69A8D" style={styles.loader} />
            )}

            <Text style={styles.orText}>
              Or <Text style={styles.signInHighlight}>Sign In</Text> with
            </Text>

            <View style={styles.socialContainer}>
              {SOCIAL_PROVIDERS.map(({ id, icon }) => (
                <TouchableOpacity
                  key={id}
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin(id)}
                  activeOpacity={0.8}
                >
                  <Image source={icon} style={styles.socialIcon} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate("SignUp")}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpText}>
                Already a Member? <Text style={styles.signUpLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8B4A1",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#E69A8D",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#E69A8D",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#666",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#666",
  },
  loginButton: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 8,
  },
  orText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    marginTop: 8,
  },
  signInHighlight: {
    color: "#E69A8D",
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  signUpText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#E69A8D",
    fontWeight: "600",
  },
});