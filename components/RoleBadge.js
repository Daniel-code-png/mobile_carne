import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ROLE_LABELS = {
  estudiante: 'ESTUDIANTE',
  docente: 'DOCENTE',
  administrativo: 'ADMINISTRATIVO',
};

const ROLE_ICONS = {
  estudiante: '📚',
  docente: '🎓',
  administrativo: '💼',
};

const RoleBadge = ({ role = 'estudiante', theme }) => {
  // Verificación de seguridad para evitar que el componente rompa si el tema no carga
  if (!theme || !theme.colors) {
    return null; // O un fallback básico
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors.chip?.background || '#eee',
          borderRadius: theme.shape?.borderRadius || 8,
          borderColor: theme.colors.cardBorder || '#ccc',
        },
      ]}
    >
      <Text style={styles.icon}>{ROLE_ICONS[role] || '👤'}</Text>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.chip?.text || '#333',
            fontFamily: theme.typography?.fontFamily,
          },
        ]}
      >
        {/* Aquí estaba el error: role.toUpperCase() fallaba si role era undefined */}
        {ROLE_LABELS[role] || (role ? role.toUpperCase() : 'INVITADO')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 6,
    marginTop: 4,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});

export default RoleBadge;