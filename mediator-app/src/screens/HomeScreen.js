import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useMediation } from '../contexts/MediationContext';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import Thermometer from '../components/Thermometer';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { sessions } = useMediation();

  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const pendingSessions = sessions.filter(s => s.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Saludo */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Hola, {user?.name?.split(' ')[0] || 'Usuario'}
          </Text>
          <Text style={styles.greetingSubtext}>
            ¿Listo para resolver conflictos?
          </Text>
        </View>

        {/* Acción principal */}
        <TouchableOpacity
          style={styles.mainAction}
          onPress={() => navigation.navigate('Nueva')}
          activeOpacity={0.9}
        >
          <View style={styles.mainActionIcon}>
            <Ionicons name="add-circle" size={48} color={colors.text.inverse} />
          </View>
          <Text style={styles.mainActionTitle}>Nueva Mediación</Text>
          <Text style={styles.mainActionSubtitle}>
            Invita a alguien a resolver un conflicto
          </Text>
        </TouchableOpacity>

        {/* Stats rápidas */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="chatbubbles"
            value={activeSessions}
            label="Activas"
            color={colors.success}
          />
          <StatCard
            icon="time"
            value={pendingSessions}
            label="Pendientes"
            color={colors.warning}
          />
          <StatCard
            icon="checkmark-circle"
            value={sessions.filter(s => s.status === 'resolved').length}
            label="Resueltas"
            color={colors.primary}
          />
        </View>

        {/* Cómo funciona */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>

          <View style={styles.stepsList}>
            <StepItem
              number="1"
              title="Invita"
              description="Envía una invitación describiendo el tema a tratar"
            />
            <StepItem
              number="2"
              title="Conversa"
              description="Mantén un diálogo guiado con límites saludables"
            />
            <StepItem
              number="3"
              title="Resuelve"
              description="La IA ayuda a encontrar puntos de acuerdo"
            />
          </View>
        </View>

        {/* Sesión activa reciente */}
        {activeSessions > 0 && (
          <TouchableOpacity
            style={styles.activeSessionCard}
            onPress={() => navigation.navigate('Sesiones')}
          >
            <View style={styles.activeSessionHeader}>
              <Ionicons name="pulse" size={20} color={colors.success} />
              <Text style={styles.activeSessionTitle}>
                Sesión en progreso
              </Text>
            </View>
            <Text style={styles.activeSessionText}>
              Tienes {activeSessions} mediación{activeSessions > 1 ? 'es' : ''} activa{activeSessions > 1 ? 's' : ''}
            </Text>
            <View style={styles.activeSessionAction}>
              <Text style={styles.activeSessionActionText}>Ver sesiones</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ icon, value, label, color }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StepItem = ({ number, title, description }) => (
  <View style={styles.stepItem}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  greeting: {
    marginBottom: spacing.lg,
  },
  greetingText: {
    ...typography.h2,
    color: colors.text.primary,
  },
  greetingSubtext: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  mainAction: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  mainActionIcon: {
    marginBottom: spacing.md,
  },
  mainActionTitle: {
    ...typography.h3,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  mainActionSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  statValue: {
    ...typography.h2,
    marginVertical: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  stepsList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  stepDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activeSessionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    ...shadows.sm,
  },
  activeSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeSessionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.success,
    marginLeft: spacing.sm,
  },
  activeSessionText: {
    ...typography.body,
    color: colors.text.primary,
  },
  activeSessionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  activeSessionActionText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginRight: spacing.xs,
  },
});

export default HomeScreen;
