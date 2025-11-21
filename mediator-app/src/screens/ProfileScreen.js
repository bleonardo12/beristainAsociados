import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useMediation } from '../contexts/MediationContext';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { FREEMIUM_LIMITS } from '../utils/constants';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { sessions } = useMediation();

  const isPremium = user?.plan === 'premium';
  const limits = isPremium ? FREEMIUM_LIMITS.PREMIUM : FREEMIUM_LIMITS.FREE;

  const resolvedSessions = sessions.filter(s => s.status === 'resolved').length;
  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Próximamente',
      'La suscripción premium estará disponible pronto. ¡Gracias por tu interés!'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {/* Badge de plan */}
          <View style={[styles.planBadge, isPremium && styles.planBadgePremium]}>
            <Ionicons
              name={isPremium ? 'star' : 'star-outline'}
              size={14}
              color={isPremium ? colors.warning : colors.text.muted}
            />
            <Text style={[styles.planText, isPremium && styles.planTextPremium]}>
              {isPremium ? 'Premium' : 'Plan Gratuito'}
            </Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tus estadísticas</Text>
          <View style={styles.statsGrid}>
            <StatItem value={sessions.length} label="Sesiones totales" />
            <StatItem value={resolvedSessions} label="Resueltas" />
            <StatItem value={totalMessages} label="Mensajes" />
          </View>
        </View>

        {/* Límites del plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu plan</Text>
          <View style={styles.limitsCard}>
            <LimitItem
              label="Sesiones por mes"
              value={limits.sessionsPerMonth === -1 ? 'Ilimitadas' : limits.sessionsPerMonth}
              used={sessions.length}
              unlimited={limits.sessionsPerMonth === -1}
            />
            <LimitItem
              label="Mensajes por sesión"
              value={limits.messagesPerSession === -1 ? 'Ilimitados' : limits.messagesPerSession}
              unlimited={limits.messagesPerSession === -1}
            />
            <LimitItem
              label="Sugerencias IA por sesión"
              value={limits.aiSuggestionsPerSession === -1 ? 'Ilimitadas' : limits.aiSuggestionsPerSession}
              unlimited={limits.aiSuggestionsPerSession === -1}
            />
            <LimitItem
              label="Mediador humano"
              value={limits.humanMediatorAccess ? 'Disponible' : 'No disponible'}
              isFeature
              available={limits.humanMediatorAccess}
            />
          </View>

          {!isPremium && (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Ionicons name="rocket" size={20} color={colors.text.inverse} />
              <Text style={styles.upgradeButtonText}>Mejorar a Premium</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Opciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <View style={styles.optionsList}>
            <OptionItem icon="notifications-outline" label="Notificaciones" />
            <OptionItem icon="lock-closed-outline" label="Privacidad" />
            <OptionItem icon="help-circle-outline" label="Ayuda" />
            <OptionItem icon="document-text-outline" label="Términos y condiciones" />
          </View>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* Versión */}
        <Text style={styles.version}>conflictiVOS v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatItem = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const LimitItem = ({ label, value, used, unlimited, isFeature, available }) => (
  <View style={styles.limitItem}>
    <Text style={styles.limitLabel}>{label}</Text>
    <View style={styles.limitValueContainer}>
      {isFeature ? (
        <Ionicons
          name={available ? 'checkmark-circle' : 'close-circle'}
          size={18}
          color={available ? colors.success : colors.text.muted}
        />
      ) : (
        <Text style={styles.limitValue}>
          {used !== undefined && !unlimited ? `${used}/` : ''}
          {value}
        </Text>
      )}
    </View>
  </View>
);

const OptionItem = ({ icon, label }) => (
  <TouchableOpacity style={styles.optionItem}>
    <View style={styles.optionLeft}>
      <Ionicons name={icon} size={20} color={colors.text.secondary} />
      <Text style={styles.optionLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.text.inverse,
  },
  userName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  planBadgePremium: {
    backgroundColor: colors.warning + '20',
  },
  planText: {
    ...typography.caption,
    color: colors.text.muted,
    marginLeft: spacing.xs,
  },
  planTextPremium: {
    color: colors.warning,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  limitsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  limitLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  limitValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitValue: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadows.md,
  },
  upgradeButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.inverse,
    marginLeft: spacing.sm,
  },
  optionsList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  signOutText: {
    ...typography.body,
    color: colors.error,
    marginLeft: spacing.sm,
  },
  version: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
});

export default ProfileScreen;
