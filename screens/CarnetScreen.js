import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { getAllThemes } from '../themes';
import QRCode from '../components/QRCode';
import RoleBadge from '../components/RoleBadge';
import userService from '../services/userService';
import accessService from '../services/accessService';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * CarnetScreen — Pantalla principal del carné digital.
 *
 * Muestra:
 *  - Foto, nombre completo, cédula, teléfono, correo, carrera/cargo, rol
 *  - QR dinámico por sesión
 *  - Selector de temas con cambio en tiempo real
 */
const CarnetScreen = ({ navigation }) => {
  const { user, sessionId, theme, logout, updateTheme } = useApp();
  const [showQR, setShowQR] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [scanLock, setScanLock] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const allThemes = getAllThemes();
  const canScan = Boolean(user?.canScan || ['guardia', 'administrativo', 'admin', 'superadmin', 'rector', 'vicerrector', 'decano', 'coordinador', 'secretaria', 'biblioteca', 'sistemas', 'mantenimiento'].includes(user?.role));

  useEffect(() => {
    if (!showScanner) {
      setScanLock(false);
    }
  }, [showScanner]);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanLock || !data) return;
    setScanLock(true);

    try {
      const result = await accessService.scan(data, null, 'Principal');
      Alert.alert('Acceso registrado', result.message || 'Registro guardado');
      setShowScanner(false);
    } catch (error) {
      Alert.alert('Error de acceso', error.message || 'No se pudo registrar la entrada/salida');
      setScanLock(false);
    }
  };

  const openScanner = async () => {
    if (!canScan) {
      Alert.alert('Sin permiso', 'Este rol no tiene acceso al escáner QR.');
      return;
    }

    const currentPermission = permission ?? (await requestPermission());
    if (!currentPermission?.granted) {
      Alert.alert('Permiso requerido', 'Necesitas permitir el acceso a la cámara para escanear QR.');
      return;
    }

    setShowScanner(true);
  };

  const handleThemeChange = async (themeId) => {
    setShowThemes(false);
    setSavingTheme(true);
    try {
      // Cambio en tiempo real (contexto) + persistencia (backend + AsyncStorage)
      await updateTheme(themeId);
      await userService.updateTheme(themeId);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el tema');
    } finally {
      setSavingTheme(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const t = theme;

  return (
    <LinearGradient colors={t.colors.background} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerLabel, { color: t.colors.textSoft }]}>
                CARNÉ DIGITAL
              </Text>
              <Text style={[styles.headerStatus, { color: t.colors.accent }]}>
                {savingTheme ? 'Guardando tema...' : 'Activo ●'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.logoutBtn, { borderColor: 'rgba(255,255,255,0.2)' }]}
              onPress={handleLogout}
            >
              <Text style={[styles.logoutText, { color: t.colors.text }]}>Salir</Text>
            </TouchableOpacity>
          </View>

          {/* ── CARNÉ ── */}
          <View
            style={[
              styles.card,
              {
                borderRadius: t.shape.borderRadius,
                borderWidth: t.shape.cardBorderWidth,
                borderColor: t.colors.cardBorder,
              },
            ]}
          >
            <LinearGradient
              colors={t.colors.cardBackground}
              style={[styles.cardGradient, { borderRadius: t.shape.borderRadius - 1 }]}
            >
              {/* Decoración de tema */}
              {t.decoration && (
                <Text style={styles.decoration}>{t.decoration}</Text>
              )}

              <View style={styles.cardIdHeader}>
                <Text style={[styles.cardIdTitle, { color: t.colors.text }]}>CARNÉ UNIVERSITARIO</Text>
                <Text style={[styles.cardIdSubtitle, { color: t.colors.accent }]}>Documento digital oficial</Text>
              </View>

              {/* Header del carné */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderEmoji}>
                  {user?.role === 'estudiante' ? '📚' : user?.role === 'docente' ? '🎓' : '💼'}
                </Text>
                <View>
                  <Text style={[styles.cardHeaderTitle, { color: t.colors.accent }]}>
                    {user?.university?.name ? user.university.name.toUpperCase() : 'UNIVERSIDAD INSTITUCIONAL'}
                  </Text>
                  <Text style={[styles.cardHeaderSub, { color: t.colors.textSoft }]}>
                    Sistema de Identificación Digital
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: t.colors.cardBorder }]} />

              {/* Foto + datos básicos */}
              <View style={styles.profileRow}>
                <View
                  style={[
                    styles.photoContainer,
                    {
                      borderColor: t.colors.accent,
                      borderRadius: t.shape.borderRadius,
                      backgroundColor: t.colors.accentSoft,
                    },
                  ]}
                >
                  {!imgError && user?.photo ? (
                    <Image
                      source={{ uri: user.photo }}
                      style={[styles.photo, { borderRadius: t.shape.borderRadius - 2 }]}
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <Text style={styles.photoFallback}>👤</Text>
                  )}
                </View>

                <View style={styles.profileInfo}>
                  <Text style={[styles.name, { color: t.colors.text }]}>
                    {user?.name}
                  </Text>
                  <RoleBadge role={user?.role} theme={t} />
                  <Text style={[styles.career, { color: t.colors.textSoft }]}>
                    {user?.career}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: t.colors.cardBorder }]} />

              {/* Datos de contacto */}
              {[
                { icon: '🪪', label: 'CÉDULA', value: user?.document },
                { icon: '📧', label: 'CORREO', value: user?.email },
                { icon: '📱', label: 'TELÉFONO', value: user?.phone },
              ].map(({ icon, label, value }) => (
                <View key={label} style={styles.dataRow}>
                  <Text style={styles.dataIcon}>{icon}</Text>
                  <View>
                    <Text style={[styles.dataLabel, { color: t.colors.accent }]}>
                      {label}
                    </Text>
                    <Text style={[styles.dataValue, { color: t.colors.text }]}>
                      {value}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={[styles.divider, { backgroundColor: t.colors.cardBorder }]} />

              {/* Sección QR */}
              <View style={styles.qrRow}>
                <View>
                  <Text style={[styles.dataLabel, { color: t.colors.accent }]}>
                    QR DE SESIÓN
                  </Text>
                  <Text style={[styles.qrSub, { color: t.colors.textSoft }]}>
                    Dinámico · Sesión actual
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.qrButton,
                    { backgroundColor: t.colors.button.background, borderRadius: t.shape.borderRadius },
                  ]}
                  onPress={() => setShowQR(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.qrButtonText, { color: t.colors.button.text }]}>
                    Ver QR 📲
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.squareButton,
                { backgroundColor: t.colors.button.background, borderColor: t.colors.cardBorder },
              ]}
              onPress={() => navigation.navigate('Loans')}
              activeOpacity={0.85}
            >
              <Text style={[styles.squareButtonTitle, { color: t.colors.text }]}>📦 Préstamos</Text>
              <Text style={[styles.squareButtonSubtitle, { color: t.colors.textSoft }]}>Ver mis préstamos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.squareButton,
                { backgroundColor: t.colors.accent, borderColor: t.colors.accent },
              ]}
              onPress={() => setShowThemes(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.squareButtonTitle, { color: t.colors.button.text }]}>🎨 Tema</Text>
              <Text style={[styles.squareButtonSubtitle, { color: t.colors.button.text }]}>Personalizar</Text>
            </TouchableOpacity>
          </View>

          {canScan && (
            <TouchableOpacity
              style={[
                styles.scanButton,
                {
                  backgroundColor: t.colors.button.background,
                  borderRadius: t.shape.borderRadius,
                  shadowColor: t.colors.accent,
                },
              ]}
              onPress={openScanner}
              activeOpacity={0.9}
            >
              <Text style={styles.scanButtonIcon}>📷</Text>
              <Text style={[styles.scanButtonText, { color: t.colors.button.text }]}>Escanear entrada/salida</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ── Modal QR ── */}
      <Modal visible={showQR} transparent animationType="fade" onRequestClose={() => setShowQR(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                borderRadius: t.shape.borderRadius,
                borderColor: t.colors.cardBorder,
                borderWidth: t.shape.cardBorderWidth,
              },
            ]}
          >
            <LinearGradient colors={t.colors.cardBackground} style={styles.modalGradient}>
              <Text style={[styles.modalTitle, { color: t.colors.accent }]}>
                Código QR de Sesión
              </Text>
              <Text style={[styles.modalSub, { color: t.colors.textSoft }]}>
                Válido mientras la sesión esté activa
              </Text>

              <View style={[styles.qrWrapper, { backgroundColor: t.colors.qrBackground, borderRadius: t.shape.borderRadius }]}>
                <QRCode sessionId={sessionId} userId={user?._id || user?.id} theme={t} size={200} />
              </View>

              <Text style={[styles.modalNote, { color: t.colors.accent }]}>
                ✓ Cambia en cada inicio de sesión
              </Text>

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: t.colors.button.background, borderRadius: t.shape.borderRadius },
                ]}
                onPress={() => setShowQR(false)}
              >
                <Text style={[styles.closeButtonText, { color: t.colors.button.text }]}>
                  Cerrar
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ── Modal Selector de Temas ── */}
      <Modal visible={showThemes} transparent animationType="slide" onRequestClose={() => setShowThemes(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.themesModal}>
            <Text style={styles.themesTitle}>🎨 Elige tu tema</Text>
            <Text style={styles.themesSub}>El cambio es inmediato y se guarda automáticamente</Text>

            {allThemes.map((thm) => (
              <TouchableOpacity
                key={thm.id}
                style={[
                  styles.themeOption,
                  thm.id === t.id && styles.themeOptionActive,
                ]}
                onPress={() => handleThemeChange(thm.id)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={thm.colors.background}
                  style={[styles.themePreview, { borderRadius: thm.shape.borderRadius }]}
                >
                  <Text style={{ fontSize: 20 }}>{thm.emoji}</Text>
                </LinearGradient>
                <Text style={styles.themeOptionLabel}>{thm.label}</Text>
                {thm.id === t.id && (
                  <Text style={[styles.themeCheck, { color: thm.colors.accent }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowThemes(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showScanner} transparent={false} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <View style={[styles.scannerContainer, { backgroundColor: t.colors.background[0] || t.colors.background }]}>
          {permission?.granted ? (
            <CameraView
              style={styles.scannerCamera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
          ) : (
            <View style={[styles.scannerFallback, { backgroundColor: t.colors.background[0] || t.colors.background }]}>
              <Text style={[styles.scannerFallbackText, { color: t.colors.text }]}>Solicitando permiso de cámara...</Text>
            </View>
          )}

          <View style={styles.scannerOverlay}>
            <View style={[styles.scannerHeader, { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: t.colors.cardBorder }]}>
              <View>
                <Text style={[styles.scannerEyebrow, { color: t.colors.textSoft }]}>Control de acceso</Text>
                <Text style={[styles.scannerTitle, { color: t.colors.text }]}>Escanear QR</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowScanner(false)}
                style={[styles.closeScannerButton, { backgroundColor: t.colors.accentSoft }]}
              >
                <Text style={[styles.scannerClose, { color: t.colors.accent }]}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.scannerFrameWrapper}>
              <View style={[styles.scannerFrame, { borderColor: t.colors.accent, shadowColor: t.colors.accent }]} />
            </View>

            <Text style={[styles.scannerHint, { color: t.colors.text, backgroundColor: 'rgba(255,255,255,0.08)' }]}>El sistema detecta automáticamente la entrada o salida</Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 32 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLabel: { fontSize: 11, letterSpacing: 1.5 },
  headerStatus: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  logoutText: { fontSize: 13 },

  // Card
  card: { position: 'relative', overflow: 'hidden', marginBottom: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  cardGradient: { padding: 22, position: 'relative', backgroundColor: 'transparent' },
  decoration: { position: 'absolute', top: 12, right: 16, fontSize: 28, opacity: 0.18 },
  cardIdHeader: { marginBottom: 16, paddingRight: 8 },
  cardIdTitle: { fontSize: 11, letterSpacing: 1.8, fontWeight: '700', textTransform: 'uppercase' },
  cardIdSubtitle: { fontSize: 10, marginTop: 4, letterSpacing: 0.8 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardHeaderEmoji: { fontSize: 22 },
  cardHeaderTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  cardHeaderSub: { fontSize: 10, marginTop: 2 },

  divider: { height: 1, opacity: 0.3, marginVertical: 14 },

  profileRow: { flexDirection: 'row', gap: 18, marginBottom: 8 },
  photoContainer: { width: 112, height: 148, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  photoFallback: { fontSize: 46 },

  profileInfo: { flex: 1, paddingTop: 2 },
  name: { fontSize: 18, fontWeight: '700', lineHeight: 24, marginBottom: 4 },
  career: { fontSize: 12, fontStyle: 'italic', marginTop: 6, lineHeight: 18 },

  dataRow: { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'flex-start', padding: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  dataIcon: { fontSize: 14, marginTop: 2 },
  dataLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  dataValue: { fontSize: 13, marginTop: 2 },

  qrRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  qrSub: { fontSize: 11, marginTop: 2 },
  qrButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 16 },
  qrButtonText: { fontSize: 13, fontWeight: '700' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 18 },
  squareButton: { flex: 1, minHeight: 120, borderWidth: 1, borderRadius: 18, padding: 16, justifyContent: 'center', alignItems: 'flex-start' },
  squareButtonTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  squareButtonSubtitle: { fontSize: 12, lineHeight: 18 },

  scanButton: {
    marginTop: 18,
    marginBottom: 4,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  scanButtonIcon: { fontSize: 20 },
  scanButtonText: { fontSize: 16, fontWeight: '700' },

  // Modal QR
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', maxWidth: 340, overflow: 'hidden' },
  modalGradient: { padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalSub: { fontSize: 12, marginBottom: 20, textAlign: 'center' },
  qrWrapper: { padding: 16, marginBottom: 16 },
  modalNote: { fontSize: 12, fontWeight: '600', marginBottom: 20 },
  closeButton: { paddingVertical: 12, paddingHorizontal: 32 },
  closeButtonText: { fontWeight: '700', fontSize: 14 },

  // Modal Temas
  themesModal: {
    backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  themesTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  themesSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 20 },
  themeOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  themeOptionActive: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 8, paddingHorizontal: 8 },
  themePreview: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  themeOptionLabel: { color: '#fff', fontSize: 15, fontWeight: '500', flex: 1 },
  themeCheck: { fontSize: 20 },
  cancelButton: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  cancelButtonText: { color: 'rgba(255,255,255,0.5)', fontSize: 15 },

  scannerContainer: { flex: 1 },
  scannerCamera: { flex: 1 },
  scannerFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scannerFallbackText: { fontSize: 16, fontWeight: '600' },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  scannerEyebrow: { fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  scannerTitle: { fontSize: 18, fontWeight: '700' },
  closeScannerButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scannerClose: { fontSize: 13, fontWeight: '700' },
  scannerFrameWrapper: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  scannerFrame: {
    width: 250,
    height: 250,
    borderRadius: 28,
    borderWidth: 3,
    backgroundColor: 'transparent',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  scannerHint: {
    alignSelf: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
});

export default CarnetScreen;