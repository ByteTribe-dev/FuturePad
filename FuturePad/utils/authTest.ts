import { authService } from "../services";
import { useAppStore } from "../store/useAppStore";

// Test authentication flow
export const testAuthFlow = async () => {
  console.log("🧪 Testing Authentication Flow...");

  try {
    // Test 1: Check initial state
    const initialState = useAppStore.getState();
    console.log("Initial auth state:", {
      isAuthenticated: initialState.isAuthenticated,
      user: initialState.user,
    });

    // Test 2: Test logout
    console.log("Testing logout...");
    await authService.logout();

    const afterLogout = useAppStore.getState();
    console.log("After logout state:", {
      isAuthenticated: afterLogout.isAuthenticated,
      user: afterLogout.user,
    });

    console.log("✅ Authentication flow test completed");
    return true;
  } catch (error) {
    console.error("❌ Authentication flow test failed:", error);
    return false;
  }
};

// Test store state changes
export const logAuthState = () => {
  const state = useAppStore.getState();
  console.log("Current Auth State:", {
    isAuthenticated: state.isAuthenticated,
    user: state.user ? { id: state.user.id, email: state.user.email } : null,
    hasToken: !!state.authToken,
  });
};
