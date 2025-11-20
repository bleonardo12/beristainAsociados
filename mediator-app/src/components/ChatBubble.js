import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../utils/theme';

const ChatBubble = ({ message, isOwn, isAI = false }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.ownContainer : styles.otherContainer,
        isAI && styles.aiContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
          isAI && styles.aiBubble,
        ]}
      >
        {isAI && (
          <View style={styles.aiHeader}>
            <Text style={styles.aiLabel}>💡 Sugerencia IA</Text>
          </View>
        )}

        <Text
          style={[
            styles.text,
            isOwn ? styles.ownText : styles.otherText,
            isAI && styles.aiText,
          ]}
        >
          {message.content}
        </Text>

        <View style={styles.footer}>
          <Text
            style={[
              styles.time,
              isOwn ? styles.ownTime : styles.otherTime,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>

          {!isAI && (
            <Text
              style={[
                styles.charCount,
                isOwn ? styles.ownTime : styles.otherTime,
              ]}
            >
              {message.characterCount}/280
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  aiContainer: {
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  ownBubble: {
    backgroundColor: colors.chat.bubbleOwn,
    borderBottomRightRadius: borderRadius.sm,
  },
  otherBubble: {
    backgroundColor: colors.chat.bubbleOther,
    borderBottomLeftRadius: borderRadius.sm,
  },
  aiBubble: {
    backgroundColor: colors.chat.bubbleAI,
    borderRadius: borderRadius.lg,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
  },
  text: {
    ...typography.body,
  },
  ownText: {
    color: colors.text.inverse,
  },
  otherText: {
    color: colors.text.primary,
  },
  aiText: {
    color: colors.text.primary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  time: {
    ...typography.caption,
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTime: {
    color: colors.text.muted,
  },
  charCount: {
    ...typography.caption,
    marginLeft: spacing.sm,
  },
  aiHeader: {
    marginBottom: spacing.xs,
  },
  aiLabel: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
});

export default ChatBubble;
