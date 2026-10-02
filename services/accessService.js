import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/v1';

const authHeaders = async () => {
  const token = await AsyncStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const accessService = {
  scan: async (qrData, type = null, location = 'Principal') => {
    const headers = await authHeaders();
    const response = await fetch(`${API_URL}/access/scan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ qrData, ...(type ? { type } : {}), location }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo registrar el acceso');
    }

    return data.data;
  },
};

export default accessService;
