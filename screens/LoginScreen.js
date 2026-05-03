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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import authService from '../services/authService';

/**
 * LoginScreen — Pantalla de inicio de sesión.
 *
 * Usuario: cédula | Contraseña por defecto: cédula
 * Si firstLogin === true → redirige a ChangePassword (obligatorio)
 * Si firstLogin === false → redirige a Carnet
 *
 * Instalación necesaria:
 *   npx expo install expo-linear-gradient
 */
const LoginScreen = ({ navigation }) => {
  const { login } = useApp();
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!document.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu cédula y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(document.trim(), password.trim());

      // Guardar en contexto global (token, user, sessionId, theme)
      await login(result);

      // El navegador se actualizará automáticamente según el estado
    } catch (error) {
      Alert.alert('Error', error.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1a3a6b', '#0f2347']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.title}>CARNÉ DIGITAL</Text>
            <Text style={styles.subtitle}>Sistema Institucional</Text>
          </View>

          {/* Formulario */}
          <View style={styles.card}>
            <Text style={styles.label}>CÉDULA</Text>
            <TextInput
              style={styles.input}
              value={document}
              onChangeText={setDocument}
              placeholder="Número de cédula"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="numeric"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <Text style={[styles.label, { marginTop: 16 }]}>CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Text style={styles.hint}>Por defecto: tu número de cédula</Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#0f2347" />
              ) : (
                <Text style={styles.buttonText}>Ingresar →</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  logoEmoji: { fontSize: 36 },
  title: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 4,
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
  hint: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    marginTop: 6,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#0f2347',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default LoginScreen;