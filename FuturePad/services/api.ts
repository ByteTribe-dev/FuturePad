import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
const API_BASE_URL = __DEV__
  ? "http://localhost:3000/api"
  : "https://your-production-api.com/api";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased from 10s to 15s
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }

    // Log request in development
    if (__DEV__) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (__DEV__) {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        }
      );
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear stored token from AsyncStorage
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userData");

        // Import and use the store to logout
        // Note: This will trigger a re-render and redirect to login screen
        const { useAppStore } = await import("../store/useAppStore");
        useAppStore.getState().logout();
      } catch (storageError) {
        console.error("Error clearing auth data:", storageError);
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
