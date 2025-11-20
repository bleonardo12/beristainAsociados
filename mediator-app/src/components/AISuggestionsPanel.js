import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

const AISuggestionsPanel = ({ suggestions = [], onUseSuggestion, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (suggestions.length === 0) {
    return null;
  }

  const latestSuggestion = suggestions[suggestions.length - 1];

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'reformulation':
        return 'create-outline';
      case 'insight':
        return 'bulb-outline';
      case 'warning':
        return 'warning-outline';
      case 'agreement':
        return 'checkmark-circle-outline';
      default:
        return 'chatbubble-outline';
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'reformulation':
        return colors.primary;
      case 'insight':
        return colors.info;
      case 'warning':
        return colors.warning;
      case 'agreement':
        return colors.success;
      default:
        return colors.secondary;
    }
  };

  const getSuggestionLabel = (type) => {
    switch (type) {
      case 'reformulation':
        return 'Sugerencia de reformulación';
      case 'insight':
        return 'Observación';
      case 'warning':
        return 'Atención';
      case 'agreement':
        return 'Punto de acuerdo';
      default:
        return 'Sugerencia';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header colapsable */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name="sparkles"
            size={20}
            color={colors.secondary}
          />
          <Text style={styles.headerTitle}>Asistente IA</Text>
          {!isExpanded && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{suggestions.length}</Text>
            </View>
          )}
        </View>

        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-up'}
          size={20}
          color={colors.text.muted}
        />
      </TouchableOpacity>

      {/* Contenido expandible */}
      {isExpanded && (
        <View style={styles.content}>
          <View
            style={[
              styles.suggestionCard,
              { borderLeftColor: getSuggestionColor(latestSuggestion.type) },
            ]}
          >
            <View style={styles.suggestionHeader}>
              <Ionicons
                name={getSuggestionIcon(latestSuggestion.type)}
                size={16}
                color={getSuggestionColor(latestSuggestion.type)}
              />
              <Text
                style={[
                  styles.suggestionType,
                  { color: getSuggestionColor(latestSuggestion.type) },
                ]}
              >
                {getSuggestionLabel(latestSuggestion.type)}
              </Text>
            </View>

            <Text style={styles.suggestionText}>
              {latestSuggestion.content}
            </Text>

            {/* Acciones */}
            {latestSuggestion.type === 'reformulation' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onUseSuggestion && onUseSuggestion(latestSuggestion)}
                >
                  <Ionicons name="copy-outline" size={16} color={colors.primary} />
                  <Text style={styles.actionText}>Usar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDismiss && onDismiss(latestSuggestion.id)}
                >
                  <Ionicons name="close-outline" size={16} color={colors.text.muted} />
                  <Text style={[styles.actionText, { color: colors.text.muted }]}>
                    Ignorar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Ver historial si hay más sugerencias */}
          {suggestions.length > 1 && (
            <TouchableOpacity style={styles.historyButton}>
              <Text style={styles.historyText}>
                Ver {suggestions.length - 1} sugerencias anteriores
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.chat.bubbleAI,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.secondary,
    marginLeft: spacing.sm,
  },
  badge: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
  },
  suggestionCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  suggestionType: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  suggestionText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  historyButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  historyText: {
    ...typography.caption,
    color: colors.text.muted,
  },
});

export default AISuggestionsPanel;
