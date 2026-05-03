import React, { useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

import { AppProvider, useApp } from './context/AppContext';
import LoginScreen from './screens/LoginScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import CarnetScreen from './screens/CarnetScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, user, loading, restoreSession } = useApp();

  useEffect(() => {
    restoreSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f2347', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#FFD700" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user?.firstLogin ? (
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ gestureEnabled: false }}
          />
        ) : (
          <Stack.Screen name="Carnet" component={CarnetScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AppProvider>
  );
}

registerRootComponent(App);