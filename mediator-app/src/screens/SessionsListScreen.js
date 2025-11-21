import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMediation } from '../contexts/MediationContext';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { SESSION_STATUS } from '../utils/constants';

const SessionsListScreen = ({ navigation }) => {
  const { sessions, loadSession } = useMediation();

  const getStatusConfig = (status) => {
    switch (status) {
      case SESSION_STATUS.ACTIVE:
        return { label: 'Activa', color: colors.success, icon: 'pulse' };
      case SESSION_STATUS.PENDING:
        return { label: 'Pendiente', color: colors.warning, icon: 'time' };
      case SESSION_STATUS.PAUSED:
        return { label: 'Pausada', color: colors.text.muted, icon: 'pause' };
      case SESSION_STATUS.RESOLVED:
        return { label: 'Resuelta', color: colors.primary, icon: 'checkmark-circle' };
      case SESSION_STATUS.ABANDONED:
        return { label: 'Abandonada', color: colors.error, icon: 'close-circle' };
      default:
        return { label: 'Desconocido', color: colors.text.muted, icon: 'help' };
    }
  };

  const handleSessionPress = (session) => {
    loadSession(session);
    navigation.navigate('Chat', {
      sessionId: session.id,
      topic: session.topic,
    });
  };

  const renderSession = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    const lastMessage = item.messages[item.messages.length - 1];

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => handleSessionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.sessionHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          <Text style={styles.sessionDate}>
            {new Date(item.createdAt).toLocaleDateString('es-AR')}
          </Text>
        </View>

        <Text style={styles.sessionTopic} numberOfLines={2}>
          {item.topic}
        </Text>

        {item.inviteeEmail && (
          <View style={styles.participantRow}>
            <Ionicons name="person-outline" size={14} color={colors.text.muted} />
            <Text style={styles.participantEmail}>{item.inviteeEmail}</Text>
          </View>
        )}

        {lastMessage && (
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessageText} numberOfLines={1}>
              {lastMessage.content}
            </Text>
          </View>
        )}

        <View style={styles.sessionFooter}>
          <View style={styles.messagesCount}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.text.muted} />
            <Text style={styles.messagesCountText}>
              {item.messages.length} mensajes
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={colors.border} />
      <Text style={styles.emptyTitle}>No hay sesiones</Text>
      <Text style={styles.emptyText}>
        Crea una nueva mediación para comenzar a resolver conflictos
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Nueva')}
      >
        <Ionicons name="add" size={20} color={colors.text.inverse} />
        <Text style={styles.emptyButtonText}>Nueva Mediación</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  sessionDate: {
    ...typography.caption,
    color: colors.text.muted,
  },
  sessionTopic: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  participantEmail: {
    ...typography.caption,
    color: colors.text.muted,
    marginLeft: spacing.xs,
  },
  lastMessageContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  lastMessageText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagesCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagesCountText: {
    ...typography.caption,
    color: colors.text.muted,
    marginLeft: spacing.xs,
  },
  separator: {
    height: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.inverse,
    marginLeft: spacing.sm,
  },
});

export default SessionsListScreen;
