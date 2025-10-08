import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Button } from "../components/Button";
import { authService } from "../services";
import { useAppStore } from "../store/useAppStore";
import { isValidEmail, isValidPassword } from "../utils/apiUtils";

export const SignUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  // Use the store directly to avoid re-render issues
  const setAuthData = useAppStore((state) => state.setAuthData);

  const handleSignUp = async () => {
    // Validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // Success - user will be automatically navigated due to auth state change
      Alert.alert(
        "Success",
        "Account created successfully! Welcome to FuturePad!"
      );
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = (provider: string) => {
    Alert.alert("Coming Soon", `${provider} signup will be available soon!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>🔮 FuturePad</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Create An Account</Text>

            {/* First + Last Name */}
            <View style={styles.nameContainer}>
              <View style={[styles.nameInputContainer]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                />
              </View>

              <View style={[styles.nameInputContainer, { marginRight: 0 }]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a strong password"
                secureTextEntry
                returnKeyType="next"
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            {/* Remember Me */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxSelected]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Remember Me</Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <Button
              title={loading ? "Creating Account..." : "Sign Up"}
              onPress={handleSignUp}
              style={styles.signUpButton}
              disabled={loading}
            />

            {loading && (
              <ActivityIndicator
                size="small"
                color="#E69A8D"
                style={{ marginTop: -12, marginBottom: 12 }}
              />
            )}

            <Text style={styles.orText}>Or Sign up with</Text>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignUp("Google")}
              >
                <Image
                  source={require("@/assets/images/social/google.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignUp("Apple")}
              >
                <Image
                  source={require("@/assets/images/social/apple.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignUp("Facebook")}
              >
                <Image
                  source={require("@/assets/images/social/facebook.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>
                Already a Member? <Text style={styles.loginLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFEEE6" },
  header: { alignItems: "center", paddingTop: 20, paddingBottom: 40 },
  logo: { fontSize: 20, fontWeight: "bold", color: "#E69A8D" },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 32 },
  nameContainer: { flexDirection: "row", marginBottom: 20 },
  nameInputContainer: { flex: 1, marginRight: 8 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, color: "#666", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: "#E69A8D", borderColor: "#E69A8D" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  checkboxLabel: { fontSize: 14, color: "#666" },
  signUpButton: { marginBottom: 24 },
  orText: { textAlign: "center", color: "#666", marginBottom: 16 },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  socialIcon: { width: 20, height: 20 },
  loginText: { textAlign: "center", color: "#666" },
  loginLink: { color: "#E69A8D", fontWeight: "bold" },
});
