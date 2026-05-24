/**
 * NotificationService — Servicio de notificaciones push.
 *
 * 🔮 LISTO PARA PRODUCCIÓN — actualmente desactivado.
 *
 * Para activar cuando salga a producción:
 *  1. Instalar dependencias:
 *     npx expo install expo-notifications expo-device
 *     npm install @react-native-firebase/app @react-native-firebase/messaging
 *
 *  2. Agregar google-services.json en la raíz del mobile
 *
 *  3. Descomentar el código de abajo
 *
 *  4. Llamar registerForPushNotifications() en App.js al iniciar
 *
 *  5. Llamar saveFcmToken(token) después del login para
 *     guardar el token en el backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/v1'

const notificationService = {
  /**
   * Registra el dispositivo para recibir notificaciones push.
   * Retorna el FCM token del dispositivo.
   *
   * 🔮 Descomentar para producción:
   */
  registerForPushNotifications: async () => {
    // const { status } = await Notifications.requestPermissionsAsync()
    // if (status !== 'granted') {
    //   console.warn('Permisos de notificación denegados')
    //   return null
    // }
    // const token = await messaging().getToken()
    // return token

    console.log('🔮 Notificaciones: pendiente para producción')
    return null
  },

  /**
   * Guarda el FCM token en el backend para poder
   * enviar notificaciones push a este dispositivo.
   */
  saveFcmToken: async (fcmToken) => {
    if (!fcmToken) return

    try {
      const token = await AsyncStorage.getItem('jwt_token')
      await fetch(`${API_URL}/user/fcm-token`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fcmToken }),
      })
      console.log('✅ FCM token guardado en backend')
    } catch (e) {
      console.warn('⚠️ Error guardando FCM token:', e.message)
    }
  },

  /**
   * Escucha notificaciones en primer plano.
   * 🔮 Descomentar para producción:
   */
  onForegroundMessage: (callback) => {
    // return messaging().onMessage(async remoteMessage => {
    //   callback(remoteMessage)
    // })
    console.log('🔮 onForegroundMessage: pendiente para producción')
    return () => {}
  },

  /**
   * Escucha tap en notificación cuando la app estaba en background.
   * 🔮 Descomentar para producción:
   */
  onNotificationOpenedApp: (navigation) => {
    // messaging().onNotificationOpenedApp(remoteMessage => {
    //   const screen = remoteMessage?.data?.screen
    //   if (screen) navigation.navigate(screen)
    // })
    console.log('🔮 onNotificationOpenedApp: pendiente para producción')
  },
}

export default notificationService