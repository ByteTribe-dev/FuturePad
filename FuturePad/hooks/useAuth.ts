import { useState } from "react";
import { authService, LoginCredentials, RegisterData } from "../services";
import { useAppStore } from "../store/useAppStore";
import { handleApiError } from "../utils/apiUtils";

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuthData, logout: logoutStore } = useAppStore();

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      // Auth service already updates the store
      return response;
    } catch (error: any) {
      const apiError = handleApiError(error);
      setError(apiError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);
      // Auth service already updates the store
      return response;
    } catch (error: any) {
      const apiError = handleApiError(error);
      setError(apiError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout();
      // Auth service already updates the store
    } catch (error: any) {
      const apiError = handleApiError(error);
      setError(apiError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    register,
    logout,
    loading,
    error,
    clearError,
  };
};
