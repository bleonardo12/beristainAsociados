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

        {/* Botón Mis Sesiones */}
        <TouchableOpacity
          style={styles.sessionsButton}
          onPress={() => navigation.navigate('Sesiones')}
        >
          <Ionicons name="chatbubbles" size={28} color={colors.secondary} />
          <View style={styles.sessionsButtonContent}>
            <Text style={styles.sessionsButtonText}>Mis Sesiones</Text>
            <Text style={styles.sessionsButtonSubtext}>
              {activeSessions > 0 ? `${activeSessions} activa${activeSessions > 1 ? 's' : ''}` : 'Ver historial'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text.muted} />
        </TouchableOpacity>

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
    textAlign: 'center',
  },
  sessionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  sessionsButtonContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  sessionsButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sessionsButtonSubtext: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
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
