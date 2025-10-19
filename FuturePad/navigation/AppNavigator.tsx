import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { CustomDrawer } from "../components/CustomDrawer";
import { useAppStore, useIsAuthenticated } from "../store/useAppStore";

import { HomeScreen } from "../screens/HomeScreen";
import { LetterArchiveScreen } from "../screens/LetterArchiveScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ReadLetterScreen } from "../screens/ReadLetterScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { WriteLetterScreen } from "../screens/WriteLetterScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 320,
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="WriteLetter" component={WriteLetterScreen} />
      <Drawer.Screen name="LetterArchive" component={LetterArchiveScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const isOnboardingCompleted = useAppStore(
    (state) => state.isOnboardingCompleted
  );
  const isAuthenticated = useIsAuthenticated();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboardingCompleted ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainDrawerNavigator} />
            <Stack.Screen name="ReadLetter" component={ReadLetterScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
