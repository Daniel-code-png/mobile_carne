import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/v1';

/**
 * Helper para obtener headers autenticados.
 */
const authHeaders = async () => {
  const token = await AsyncStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/**
 * userService — Servicio de datos del usuario.
 */
const userService = {
  /**
   * GET /user/profile
   * Retorna los datos completos del carné digital.
   */
  getProfile: async () => {
    const headers = await authHeaders();
    const response = await fetch(`${API_URL}/user/profile`, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener perfil');
    }

    return data.data;
  },

  /**
   * PATCH /user/theme
   * Actualiza el tema visual del usuario en el backend.
   */
  updateTheme: async (theme) => {
    const headers = await authHeaders();
    const response = await fetch(`${API_URL}/user/theme`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ theme }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar tema');
    }

    return data.data;
  },

  // 🔮 Preparado para fase 2
  // getLoans: async () => { ... },
  // getAccessHistory: async () => { ... },
};

export default userService;