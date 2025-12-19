import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./navigation/AppNavigator";
import { errorService } from "./services/errorService";
import { notificationService } from "./services/notificationService";
import { performanceService } from "./services/performanceService";
import { syncService } from "./services/syncService";
import { ThemeProvider } from "./theme/ThemeContext";
import Toast from "react-native-toast-message";
import toastConfig from "./utils/toastConfig";

export default function App() {
  useEffect(() => {
    // Initialize all services
    const initializeServices = async () => {
      try {
        // Initialize error service first
        await errorService.initialize();

        // Initialize performance monitoring
        await performanceService.initialize();

        // Initialize notification service
        await notificationService.initialize();

        // Initialize sync service
        await syncService.initialize();

        await errorService.logInfo("All services initialized successfully");
        console.log("All services initialized successfully");
      } catch (error) {
        console.error("Failed to initialize services:", error);
        await errorService.logError(error as Error, {
          context: "app_initialization",
        });
      }
    };

    initializeServices();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        <Toast config={toastConfig } />
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
