import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../themes';
import { SafeAreaView } from 'react-native-safe-area-context';
const AppContext = createContext(null);

/**
 * AppProvider — Envuelve toda la app.
 * Maneja: usuario autenticado, token JWT, sessionId (QR), tema visual.
 */
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const defaultTheme = getTheme('institucional');
  const [theme, setThemeState] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);

  /**
   * Restaurar sesión guardada al abrir la app.
   * Llamar desde App.js con useEffect.
   */
  const restoreSession = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('jwt_token');
      const savedUser = await AsyncStorage.getItem('user');
      const savedSessionId = await AsyncStorage.getItem('sessionId');
      const savedThemeId = await AsyncStorage.getItem('user_theme');
      if (savedToken) {
        setToken(savedToken);
      }
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      if (savedSessionId) {
        setSessionId(savedSessionId);
      }
      if (savedThemeId) {
        setThemeState(getTheme(savedThemeId));
      }
    } catch (e) {
      console.warn('Error restaurando sesión:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ejecutar al hacer login exitoso.
   * Recibe el objeto completo de respuesta del backend.
   */
  const login = useCallback(async ({ token, user, sessionId }) => {
    await AsyncStorage.setItem('jwt_token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('sessionId', sessionId);
    await AsyncStorage.setItem('user_theme', user.theme || 'institucional');
    setToken(token);
    setUser(user);
    setSessionId(sessionId);
    setThemeState(getTheme(user.theme));
  }, []);

  /**
   * Actualizar datos del usuario (por ejemplo, después de cambio de contraseña).
   */
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  }, []);

  /**
   * Cambiar tema visual en tiempo real y persistir en AsyncStorage.
   */
  const updateTheme = useCallback(async (themeId) => {
    await AsyncStorage.setItem('user_theme', themeId);
    setThemeState(getTheme(themeId));
    setUser((prev) => ({ ...prev, theme: themeId }));
  }, []);

  /**
   * Cerrar sesión: limpiar estado y AsyncStorage.
   */
  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['jwt_token', 'user', 'sessionId', 'user_theme']);
    setUser(null);
    setToken(null);
    setSessionId(null);
    setThemeState(getTheme('institucional'));
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        sessionId,
        theme,
        loading,
        isAuthenticated: !!token,
        restoreSession,
        login,
        logout,
        updateUser,
        updateTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook para consumir el contexto en cualquier componente.
 * Uso: const { user, theme, logout } = useApp();
 */
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
};

export default AppContext;