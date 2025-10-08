import { Alert } from "react-native";

// API Error handling utility
export interface ApiError {
  message: string;
  status?: number;
  errors?: Array<{ field: string; message: string }>;
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      message: data.message || "An error occurred",
      status,
      errors: data.errors || [],
    };
  } else if (error.request) {
    // Network error
    return {
      message: "Network error. Please check your connection.",
      status: 0,
    };
  } else {
    // Other error
    return {
      message: error.message || "An unexpected error occurred",
    };
  }
};

// Show error alert
export const showErrorAlert = (error: ApiError | string, title = "Error") => {
  const message = typeof error === "string" ? error : error.message;
  Alert.alert(title, message);
};

// Show success alert
export const showSuccessAlert = (message: string, title = "Success") => {
  Alert.alert(title, message);
};

// Format date for API
export const formatDateForApi = (date: Date): string => {
  return date.toISOString();
};

// Parse date from API
export const parseDateFromApi = (dateString: string): Date => {
  return new Date(dateString);
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Debounce function for API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Retry API call with exponential backoff
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Check if error is network related
export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

// Check if error is authentication related
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401;
};

// Format validation errors for display
export const formatValidationErrors = (
  errors: Array<{ field: string; message: string }>
): string => {
  return errors.map((error) => `${error.field}: ${error.message}`).join("\n");
};

// Safe JSON parse
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

// Create query string from object
export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};
