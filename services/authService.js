import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/v1';
// Nota: en emulador Android usar 10.0.2.2 en lugar de localhost
// En dispositivo físico: usar la IP local de tu PC (ej: 192.168.1.x)

/**
 * authService — Servicio de autenticación.
 * Se comunica con el backend Node.js/Express.
 */
const authService = {
  /**
   * POST /auth/login
   * Retorna: { token, firstLogin, sessionId, user }
   */
  login: async (document, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    return data.data; // { token, firstLogin, sessionId, user }
  },

  /**
   * PUT /auth/change-password
   * Requiere JWT en el header.
   * Retorna: { message }
   */
  changePassword: async (newPassword) => {
    const token = await AsyncStorage.getItem('jwt_token');

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al cambiar contraseña');
    }

    return data.data;
  },
};

export default authService;