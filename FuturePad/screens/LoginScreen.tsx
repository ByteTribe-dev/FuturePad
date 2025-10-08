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
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { isValidEmail } from "../utils/apiUtils";

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  // Use the store directly to avoid re-render issues
  const setAuthData = useAppStore((state) => state.setAuthData);

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // Success - user will be automatically navigated due to auth state change
      Alert.alert("Success", "Welcome back!");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert("Coming Soon", `${provider} login will be available soon!`);
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
            <Text style={styles.title}>Login</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabelRow}>
                <MaterialIcons
                  name="email"
                  size={20}
                  color="#E69A8D"
                  style={styles.icon}
                />
                <Text style={styles.inputLabel}>Email Address</Text>
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="johndoe@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabelRow}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color="#E69A8D"
                  style={styles.icon}
                />
                <Text style={styles.inputLabel}>Password</Text>
              </View>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxSelected,
                  ]}
                >
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={loading ? "Signing In..." : "Login"}
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={loading}
            />

            {loading && (
              <ActivityIndicator
                size="small"
                color="#E69A8D"
                style={{ marginTop: -12, marginBottom: 12 }}
              />
            )}

            <Text style={styles.orText}>Or log in with</Text>

            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin("Google")}
              >
                <Image
                  source={require("@/assets/images/social/google.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin("Apple")}
              >
                <Image
                  source={require("@/assets/images/social/apple.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin("Facebook")}
              >
                <Image
                  source={require("@/assets/images/social/facebook.png")}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.signUpText}>
                Don't have an account?{" "}
                <Text style={styles.signUpLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFEEE6",
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 60,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E69A8D",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#666",
    // marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
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
    borderColor: "#e0e0e0",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#E69A8D",
    borderColor: "#E69A8D",
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
    color: "#E69A8D",
  },
  loginButton: {
    marginBottom: 24,
  },
  orText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
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
  socialButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  signUpText: {
    textAlign: "center",
    color: "#666",
  },
  signUpLink: {
    color: "#E69A8D",
    fontWeight: "bold",
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  icon: { marginRight: 8 },
});
