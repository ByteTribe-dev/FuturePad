import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { authService } from "../services";
import { useAppStore } from "../store/useAppStore";
import { validateRegistrationForm, isValidEmail, getPasswordValidationErrors, getNameValidationErrors } from "../utils/validationUtils";
import { toastService } from "../services/toastService";

const SOCIAL_PROVIDERS = [
  { id: "google", icon: require("@/assets/images/social/google.png") },
  { id: "apple", icon: require("@/assets/images/social/apple.png") },
  { id: "facebook", icon: require("@/assets/images/social/facebook.png") },
] as const;

export const SignUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
  }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setAuthData = useAppStore((state) => state.setAuthData);



  // Validation functions that run on field changes
  const validateEmail = useCallback((email: string) => {
    if (!email.trim()) {
      setValidationErrors(prev => ({ ...prev, email: "Email is required" }));
      return false;
    }

    if (!isValidEmail(email)) {
      setValidationErrors(prev => ({ ...prev, email: "Please provide a valid email address" }));
      return false;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.email;
      return newErrors;
    });
    return true;
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (!password.trim()) {
      setValidationErrors(prev => ({ ...prev, password: "Password is required" }));
      return false;
    }

    const errors = getPasswordValidationErrors(password);
    if (errors.length > 0) {
      setValidationErrors(prev => ({ ...prev, password: errors[0] }));
      return false;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.password;
      return newErrors;
    });
    return true;
  }, []);

  const validateName = useCallback((firstName: string, lastName: string) => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    if (!fullName.trim()) {
      setValidationErrors(prev => ({ ...prev, name: "Name is required" }));
      return false;
    }

    const errors = getNameValidationErrors(fullName);
    if (errors.length > 0) {
      setValidationErrors(prev => ({ ...prev, name: errors[0] }));
      return false;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.name;
      return newErrors;
    });
    return true;
  }, []);

  const validateConfirmPassword = useCallback((password: string, confirmPassword: string) => {
    if (confirmPassword && password !== confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return false;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.confirmPassword;
      return newErrors;
    });
    return true;
  }, []);

    const updateForm = useCallback(
    (field: keyof {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => (value: string) => {
      setForm((prev) => {
        const newForm = { ...prev, [field]: value };

        // Validate field in real-time
        if (field === 'email') {
          validateEmail(value);
        } else if (field === 'password') {
          validatePassword(value);
          // Also validate confirm password if it exists
          if (prev.confirmPassword) {
            validateConfirmPassword(value, prev.confirmPassword);
          }
        } else if (field === 'confirmPassword') {
          validateConfirmPassword(prev.password, value);
        } else if (field === 'firstName' || field === 'lastName') {
          validateName(
            field === 'firstName' ? value : prev.firstName,
            field === 'lastName' ? value : prev.lastName
          );
        }

        return newForm;
      });
    },
    [validateEmail, validatePassword, validateConfirmPassword, validateName]
  );

  const handleSignUp = useCallback(async () => {
    const { firstName, lastName, email, password, confirmPassword } = form;

    // Check if passwords match
    if (password !== confirmPassword) {
      toastService.showError("Passwords do not match");
      return;
    }

    // Validate form using server-matching validation
    const { isValid, errors } = validateRegistrationForm(
      email.trim().toLowerCase(),
      password,
      `${firstName.trim()} ${lastName.trim()}`
    );

    if (!isValid) {
      // Show the first validation error
      toastService.showError(errors[0]);
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      toastService.showSuccess("Account created successfully! Welcome to FuturePad!");
    } catch (error: any) {
      toastService.showError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleSocialSignUp = useCallback((provider: string) => {
    Alert.alert("Coming Soon", `${provider} signup will be available soon!`);
  }, []);

  const toggleRememberMe = useCallback(() => setRememberMe((prev) => !prev), []);
  const togglePassword = useCallback(() => setShowPassword((prev) => !prev), []);
  const toggleConfirmPassword = useCallback(() => setShowConfirmPassword((prev) => !prev), []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Fixed Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        {/* Scrollable Content Sheet */}
        <View style={styles.contentWrapper}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name Fields */}
            <View style={styles.nameContainer}>
              <View style={styles.nameInputContainer}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="person" size={18} color="#E69A8D" />
                  <Text style={styles.inputLabel}>First Name</Text>
                </View>
                <TextInput
                  style={[styles.input, validationErrors.name && styles.inputError]}
                  value={form.firstName}
                  onChangeText={updateForm("firstName")}
                  placeholder="John"
                  placeholderTextColor="#ccc"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.nameInputContainer}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="person" size={18} color="#E69A8D" />
                  <Text style={styles.inputLabel}>Last Name</Text>
                </View>
                <TextInput
                  style={[styles.input, validationErrors.name && styles.inputError]}
                  value={form.lastName}
                  onChangeText={updateForm("lastName")}
                  placeholder="Doe"
                  placeholderTextColor="#ccc"
                  returnKeyType="next"
                />
              </View>
            </View>
            {validationErrors.name && (
              <Text style={styles.errorText}>{validationErrors.name}</Text>
            )}

            {/* Email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelRow}>
                <MaterialIcons name="email" size={18} color="#E69A8D" />
                <Text style={styles.inputLabel}>Email Address</Text>
              </View>
              <TextInput
                style={[styles.input, validationErrors.email && styles.inputError]}
                value={form.email}
                onChangeText={updateForm("email")}
                placeholder="your.email@example.com"
                placeholderTextColor="#ccc"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
              {validationErrors.email && (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="lock-closed" size={18} color="#E69A8D" />
                <Text style={styles.inputLabel}>Password</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, validationErrors.password && styles.inputError]}
                  value={form.password}
                  onChangeText={updateForm("password")}
                  placeholder="Create a strong password"
                  placeholderTextColor="#ccc"
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={togglePassword} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.password && (
                <Text style={styles.errorText}>{validationErrors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="lock-closed" size={18} color="#E69A8D" />
                <Text style={styles.inputLabel}>Confirm Password</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, validationErrors.confirmPassword && styles.inputError]}
                  value={form.confirmPassword}
                  onChangeText={updateForm("confirmPassword")}
                  placeholder="Confirm your password"
                  placeholderTextColor="#ccc"
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                <TouchableOpacity onPress={toggleConfirmPassword} style={styles.eyeIcon}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.confirmPassword && (
                <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
              )}
            </View>

            {/* Remember Me */}
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

            {/* Sign Up Button */}
            <Button
              title={loading ? "Creating Account..." : "Sign Up"}
              onPress={handleSignUp}
              style={styles.signUpButton}
              disabled={loading}
            />

            {loading && <ActivityIndicator size="small" color="#E69A8D" style={styles.loader} />}

            <Text style={styles.orText}>
              Or <Text style={styles.signUpHighlight}>Sign Up</Text> with
            </Text>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              {SOCIAL_PROVIDERS.map(({ id, icon }) => (
                <TouchableOpacity
                  key={id}
                  style={styles.socialButton}
                  onPress={() => handleSocialSignUp(id)}
                  activeOpacity={0.8}
                >
                  <Image source={icon} style={styles.socialIcon} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Login Link */}
            <TouchableOpacity onPress={() => navigation.navigate("Login")} activeOpacity={0.7}>
              <Text style={styles.loginText}>
                Already a Member? <Text style={styles.loginLink}>Sign In</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  nameContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  nameInputContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
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
  signUpButton: {
    marginBottom: 12,
  },
  loader: {
    marginVertical: 8,
  },
  orText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
    marginTop: 8,
  },
  signUpHighlight: {
    color: "#E69A8D",
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 26,
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
  loginText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#E69A8D",
    fontWeight: "600",
  },
  inputError: {
    borderColor: "#E69A8D",
    borderWidth: 2,
    backgroundColor: "#FEF3F2",
  },
  errorText: {
    color: "#D92D20",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});