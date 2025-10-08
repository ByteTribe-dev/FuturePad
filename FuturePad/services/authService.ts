import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

class AuthService {
  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);

      // Store token and user data
      await this.storeAuthData(response.data.token, response.data.user);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      // Store token and user data
      await this.storeAuthData(response.data.token, response.data.user);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(["authToken", "userData"]);

      // Update the app store
      const { useAppStore } = await import("../store/useAppStore");
      useAppStore.getState().logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  // Store authentication data
  private async storeAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ["authToken", token],
        ["userData", JSON.stringify(user)],
      ]);

      // Update the app store
      const { useAppStore } = await import("../store/useAppStore");
      useAppStore.getState().setAuthData(token, user);
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw new Error("Failed to store authentication data");
    }
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  // Get stored user data
  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }
}

export default new AuthService();
