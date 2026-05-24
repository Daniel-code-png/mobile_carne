import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import loanService from '../services/loanService'

// ── Helpers ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pendiente: { color: '#f59e0b', label: 'Pendiente',  icon: '⏳' },
  aceptado:  { color: '#22c55e', label: 'Aceptado',   icon: '✅' },
  rechazado: { color: '#ef4444', label: 'Rechazado',  icon: '❌' },
  devuelto:  { color: '#94a3b8', label: 'Devuelto',   icon: '📦' },
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// ── Terms Modal ────────────────────────────────────────────────

const TermsModal = ({ visible, onAccept, onClose, loading }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>📋 Términos y Condiciones</Text>
        <Text style={styles.modalSubtitle}>Lee y acepta antes de confirmar el préstamo</Text>

        <ScrollView style={styles.termsScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.termsText}>
            Al aceptar estos términos y condiciones, declaro que:{'\n\n'}
            <Text style={styles.termsBold}>1. Responsabilidad</Text>{'\n'}
            Me hago responsable del equipo prestado y me comprometo a devolverlo en las mismas condiciones en que fue entregado.{'\n\n'}
            <Text style={styles.termsBold}>2. Uso adecuado</Text>{'\n'}
            Utilizaré el equipo únicamente para fines académicos e institucionales, y no lo cederé a terceras personas.{'\n\n'}
            <Text style={styles.termsBold}>3. Daños</Text>{'\n'}
            En caso de daño o pérdida del equipo, me comprometo a asumir los costos de reparación o reposición según las políticas institucionales.{'\n\n'}
            <Text style={styles.termsBold}>4. Devolución</Text>{'\n'}
            Devolveré el equipo en la fecha acordada. El retraso injustificado puede generar sanciones académicas o administrativas.{'\n\n'}
            <Text style={styles.termsBold}>5. Verificación</Text>{'\n'}
            Confirmo que soy yo quien está realizando este préstamo y que la información registrada es verídica.
          </Text>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnAccept, loading && { opacity: 0.6 }]}
            onPress={onAccept}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnAcceptText}>✓ Acepto los términos</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)

// ── Loan Card ──────────────────────────────────────────────────

const LoanCard = ({ loan, onConfirm, onReject, onAcceptTerms, theme }) => {
  const t = theme
  const status = STATUS_CONFIG[loan.status] || STATUS_CONFIG.pendiente
  const needsConfirmation = loan.status === 'pendiente' && loan.userConfirmed === null
  const needsTerms = loan.status === 'pendiente' && loan.userConfirmed === true && !loan.termsAccepted

  return (
    <View style={[styles.loanCard, {
      borderColor: status.color + '44',
      borderWidth: 1,
      borderRadius: t.shape.borderRadius,
    }]}>
      <LinearGradient
        colors={t.colors.cardBackground}
        style={[styles.loanCardGradient, { borderRadius: t.shape.borderRadius - 1 }]}
      >
        {/* Header */}
        <View style={styles.loanCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.equipmentName, { color: t.colors.text }]}>
              📦 {loan.equipment?.name || 'Equipo'}
            </Text>
            <Text style={[styles.equipmentCode, { color: t.colors.accent }]}>
              {loan.equipment?.code}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '22', borderColor: status.color + '44' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.icon} {status.label}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: t.colors.cardBorder }]} />

        {/* Details */}
        <View style={styles.details}>
          {[
            { label: 'Categoría',     value: loan.equipment?.category },
            { label: 'Fecha préstamo', value: formatDate(loan.loanDate) },
            { label: 'Devolución',     value: formatDate(loan.expectedReturnDate) },
          ].map(({ label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: t.colors.accent }]}>{label}</Text>
              <Text style={[styles.detailValue, { color: t.colors.textSoft }]}>{value || '—'}</Text>
            </View>
          ))}
        </View>

        {/* Confirmación pendiente */}
        {needsConfirmation && (
          <View style={styles.actionBox}>
            <Text style={[styles.actionQuestion, { color: t.colors.text }]}>
              ¿Fuiste tú quien solicitó este préstamo?
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.btnYes, { borderRadius: t.shape.borderRadius }]}
                onPress={() => onConfirm(loan._id)}
              >
                <Text style={styles.btnYesText}>✓ Sí fui yo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnNo, { borderRadius: t.shape.borderRadius }]}
                onPress={() => onReject(loan._id)}
              >
                <Text style={styles.btnNoText}>✗ No fui yo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Aceptar términos */}
        {needsTerms && (
          <View style={styles.actionBox}>
            <Text style={[styles.actionQuestion, { color: t.colors.text }]}>
              Para completar el préstamo debes aceptar los términos y condiciones.
            </Text>
            <TouchableOpacity
              style={[styles.btnTerms, { borderRadius: t.shape.borderRadius, borderColor: t.colors.accent }]}
              onPress={() => onAcceptTerms(loan._id)}
            >
              <Text style={[styles.btnTermsText, { color: t.colors.accent }]}>
                📋 Ver y aceptar términos
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notas */}
        {loan.notes ? (
          <Text style={[styles.notes, { color: t.colors.textSoft }]}>
            📝 {loan.notes}
          </Text>
        ) : null}
      </LinearGradient>
    </View>
  )
}

// ── Main Screen ────────────────────────────────────────────────

export default function LoansScreen() {
  const { theme } = useApp()
  const t = theme

  const [loans,       setLoans]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [termsModal,  setTermsModal]  = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadLoans = useCallback(async () => {
    try {
      const data = await loanService.getMyLoans()
      setLoans(data)
    } catch (e) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Recargar cada vez que la pantalla recibe foco
  useFocusEffect(useCallback(() => { loadLoans() }, [loadLoans]))

  const handleConfirm = async (loanId) => {
    Alert.alert(
      '¿Confirmar préstamo?',
      'Estás confirmando que fuiste tú quien solicitó este equipo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, fui yo',
          onPress: async () => {
            try {
              await loanService.confirm(loanId, true)
              // Mostrar términos automáticamente después de confirmar
              setSelectedLoan(loanId)
              setTermsModal(true)
              loadLoans()
            } catch (e) {
              Alert.alert('Error', e.message)
            }
          }
        }
      ]
    )
  }

  const handleReject = async (loanId) => {
    Alert.alert(
      '¿Rechazar préstamo?',
      'Estás indicando que NO fuiste tú quien solicitó este equipo. Se notificará al administrador.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'No fui yo',
          style: 'destructive',
          onPress: async () => {
            try {
              await loanService.confirm(loanId, false)
              Alert.alert('Préstamo rechazado', 'El administrador ha sido notificado.')
              loadLoans()
            } catch (e) {
              Alert.alert('Error', e.message)
            }
          }
        }
      ]
    )
  }

  const handleOpenTerms = (loanId) => {
    setSelectedLoan(loanId)
    setTermsModal(true)
  }

  const handleAcceptTerms = async () => {
    setActionLoading(true)
    try {
      await loanService.acceptTerms(selectedLoan)
      setTermsModal(false)
      setSelectedLoan(null)
      Alert.alert('✅ ¡Listo!', 'Has aceptado los términos. El préstamo está activo.')
      loadLoans()
    } catch (e) {
      Alert.alert('Error', e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const pendientes = loans.filter(l => l.status === 'pendiente')
  const activos    = loans.filter(l => l.status === 'aceptado')
  const historial  = loans.filter(l => ['rechazado', 'devuelto'].includes(l.status))

  return (
    <LinearGradient colors={t.colors.background} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadLoans() }}
              tintColor={t.colors.accent}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.colors.text }]}>🔄 Mis Préstamos</Text>
            <Text style={[styles.subtitle, { color: t.colors.textSoft }]}>
              Desliza hacia abajo para actualizar
            </Text>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={t.colors.accent} size="large" />
              <Text style={[styles.loadingText, { color: t.colors.textSoft }]}>Cargando préstamos...</Text>
            </View>
          ) : loans.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyTitle, { color: t.colors.text }]}>Sin préstamos</Text>
              <Text style={[styles.emptyText, { color: t.colors.textSoft }]}>
                No tienes préstamos registrados
              </Text>
            </View>
          ) : (
            <>
              {/* Pendientes */}
              {pendientes.length > 0 && (
                <Section title="⏳ Pendientes de respuesta" color="#f59e0b" count={pendientes.length}>
                  {pendientes.map(l => (
                    <LoanCard
                      key={l._id} loan={l} theme={t}
                      onConfirm={handleConfirm}
                      onReject={handleReject}
                      onAcceptTerms={handleOpenTerms}
                    />
                  ))}
                </Section>
              )}

              {/* Activos */}
              {activos.length > 0 && (
                <Section title="✅ Préstamos activos" color="#22c55e" count={activos.length}>
                  {activos.map(l => (
                    <LoanCard key={l._id} loan={l} theme={t} />
                  ))}
                </Section>
              )}

              {/* Historial */}
              {historial.length > 0 && (
                <Section title="📦 Historial" color="#94a3b8" count={historial.length}>
                  {historial.map(l => (
                    <LoanCard key={l._id} loan={l} theme={t} />
                  ))}
                </Section>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modal de términos */}
      <TermsModal
        visible={termsModal}
        onAccept={handleAcceptTerms}
        onClose={() => { setTermsModal(false); setSelectedLoan(null) }}
        loading={actionLoading}
      />
    </LinearGradient>
  )
}

// ── Section component ──────────────────────────────────────────

const Section = ({ title, color, count, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      <View style={[styles.sectionBadge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
        <Text style={[styles.sectionCount, { color }]}>{count}</Text>
      </View>
    </View>
    {children}
  </View>
)

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 32 },

  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13 },

  centered: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  loadingText: { fontSize: 14 },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  sectionBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  sectionCount: { fontSize: 12, fontWeight: '700' },

  loanCard: { marginBottom: 14, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  loanCardGradient: { padding: 16 },
  loanCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  equipmentName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  equipmentCode: { fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700' },

  divider: { height: 1, opacity: 0.3, marginBottom: 12 },

  details: { gap: 6, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  detailValue: { fontSize: 12 },

  actionBox: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10, padding: 14, marginTop: 8, gap: 12,
  },
  actionQuestion: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  actionButtons: { flexDirection: 'row', gap: 10 },
  btnYes: { flex: 1, backgroundColor: '#22c55e', padding: 12, alignItems: 'center' },
  btnYesText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnNo: { flex: 1, backgroundColor: '#ef4444', padding: 12, alignItems: 'center' },
  btnNoText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnTerms: { borderWidth: 1.5, padding: 12, alignItems: 'center' },
  btnTermsText: { fontWeight: '700', fontSize: 14 },

  notes: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '85%',
  },
  modalTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { color: '#94a3b8', fontSize: 13, marginBottom: 16 },
  termsScroll: { maxHeight: 320, marginBottom: 20 },
  termsText: { color: '#94a3b8', fontSize: 14, lineHeight: 22 },
  termsBold: { color: '#f1f5f9', fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnCancel: {
    flex: 1, padding: 14, borderRadius: 10,
    backgroundColor: '#334155', alignItems: 'center',
  },
  btnCancelText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
  btnAccept: {
    flex: 2, padding: 14, borderRadius: 10,
    backgroundColor: '#22c55e', alignItems: 'center',
  },
  btnAcceptText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})