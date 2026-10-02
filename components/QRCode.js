import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';

/**
 * QRCode — Componente de código QR dinámico por sesión.
 *
 * El QR se genera a partir del sessionId único retornado en cada login.
 * Cambia en cada inicio de sesión y es inválido cuando el JWT expira.
 *
 * Instalación necesaria:
 *   npm install react-native-qrcode-svg react-native-svg
 *
 * @param {string}  sessionId  - ID único de sesión (del backend)
 * @param {object}  theme      - Tema visual activo
 * @param {number}  size       - Tamaño en px (default: 150)
 */
const QRCode = ({ sessionId, userId, theme, size = 150 }) => {
  if (!sessionId) {
    return (
      <View style={[styles.container, { borderRadius: theme.shape.borderRadius, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.textSoft, fontFamily: theme.typography.fontFamily }}>
          Cargando QR...
        </Text>
      </View>
    );
  }

  const qrValue = JSON.stringify({
    id: userId,
    sessionId,
    type: 'carnet_digital',
    version: 1,
  });

  return (
    <View style={[styles.container, { borderRadius: theme.shape.borderRadius }]}>
      <QRCodeSVG
        value={qrValue}
        size={size}
        backgroundColor={theme.colors.qrBackground}
        color={theme.colors.qrForeground}
        // Logo institucional centrado (opcional)
        // logo={require('../assets/logo.png')}
        // logoSize={30}
        // logoBackgroundColor={theme.colors.qrBackground}
      />
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.textSoft,
            fontFamily: theme.typography.fontFamily,
          },
        ]}
      >
        Sesión: {sessionId.substring(0, 8)}...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default QRCode;