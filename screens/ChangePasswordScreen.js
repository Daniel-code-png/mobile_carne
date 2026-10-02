import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import authService from '../services/authService';

/**
 * ChangePasswordScreen — Pantalla obligatoria de cambio de contraseña.
 *
 * Se muestra SOLO en el primer inicio de sesión.
 * El botón físico de retroceso está bloqueado (no puede saltarse este paso).
 *
 * Validaciones:
 *  - No puede ser igual a la cédula
 *  - Mínimo 6 caracteres
 *  - Las contraseñas deben coincidir
 */
const ChangePasswordScreen = ({ navigation }) => {
  const { user, updateUser } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Bloquear botón de retroceso físico (Android)
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Retornar true bloquea el retroceso
        return true; 
      };

      // Guardamos la suscripción
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Limpiamos usando .remove() sobre la suscripción
      return () => subscription.remove();
    }, [])
  );

  const validate = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return false;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (newPassword === user?.document) {
      Alert.alert('Error', 'La contraseña no puede ser igual a tu cédula.');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.changePassword(newPassword);

      // Marcar en el contexto y persistir el cambio para que no vuelva a abrir este paso
      await updateUser({ firstLogin: false });

      // El navegador se actualizará automáticamente
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a3a6b', '#0f2347']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ícono */}
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Cambio de Contraseña</Text>
          <Text style={styles.subtitle}>
            Es tu primer inicio de sesión.{'\n'}
            Debes crear una contraseña segura para continuar.
          </Text>

          {/* Reglas */}
          <View style={styles.rulesBox}>
            <Text style={styles.rulesText}>✓ Mínimo 6 caracteres</Text>
            <Text style={styles.rulesText}>✓ No puede ser igual a tu cédula</Text>
            <Text style={styles.rulesText}>✓ Las contraseñas deben coincidir</Text>
          </View>

          {/* Formulario */}
          <View style={styles.card}>
            <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nueva contraseña"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              returnKeyType="next"
            />

            <Text style={[styles.label, { marginTop: 16 }]}>CONFIRMAR CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmar contraseña"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleChangePassword}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#0f2347" />
              ) : (
                <Text style={styles.buttonText}>Guardar y Continuar →</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: { fontSize: 52, marginBottom: 12 },
  title: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 22,
  },
  rulesBox: {
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    width: '100%',
    maxWidth: 360,
  },
  rulesText: {
    color: '#FFD700',
    fontSize: 13,
    marginBottom: 4,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    borderRadius: 16,
    padding: 24,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
    borderRadius: 8,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#0f2347',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ChangePasswordScreen;