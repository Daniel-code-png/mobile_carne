import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/v1'

const authHeaders = async () => {
  const token = await AsyncStorage.getItem('jwt_token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

const loanService = {
  /**
   * GET /loans/my-loans
   * Obtiene todos los préstamos del usuario autenticado
   */
  getMyLoans: async () => {
    const headers = await authHeaders()
    const res = await fetch(`${API_URL}/loans/my-loans`, { headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al obtener préstamos')
    return data.data
  },

  /**
   * PUT /loans/:id/user-confirm
   * Usuario confirma o rechaza el préstamo
   * confirmed: true = sí fui yo | false = no fui yo
   */
  confirm: async (loanId, confirmed) => {
    const headers = await authHeaders()
    const res = await fetch(`${API_URL}/loans/${loanId}/user-confirm`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ confirmed }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al confirmar préstamo')
    return data.data
  },

  /**
   * PUT /loans/:id/accept-terms
   * Usuario acepta términos y condiciones
   */
  acceptTerms: async (loanId) => {
    const headers = await authHeaders()
    const res = await fetch(`${API_URL}/loans/${loanId}/accept-terms`, {
      method: 'PUT',
      headers,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al aceptar términos')
    return data.data
  },
}

export default loanService