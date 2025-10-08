import api from "../services/api";

// Simple API connection test
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get("/");
    console.log("API Connection Test:", response.data);
    return true;
  } catch (error: any) {
    console.error("API Connection Failed:", error.message);
    return false;
  }
};

// Test user registration
export const testUserRegistration = async () => {
  const testUser = {
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "testpassword123",
  };

  try {
    const response = await api.post("/auth/register", testUser);
    console.log("Registration Test Success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Registration Test Failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Test user login
export const testUserLogin = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    console.log("Login Test Success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Login Test Failed:", error.response?.data || error.message);
    throw error;
  }
};
