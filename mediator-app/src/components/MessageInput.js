import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { LIMITS } from '../utils/constants';

const MessageInput = ({
  onSend,
  disabled = false,
  remainingMessages = 2,
  placeholder = 'Escribe tu mensaje...',
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const characterCount = message.length;
  const isOverLimit = characterCount > LIMITS.MAX_CHARACTERS;
  const canSend = message.trim().length > 0 && !isOverLimit && !disabled && remainingMessages > 0;

  // Color del contador según cercanía al límite
  const getCounterColor = () => {
    const percentage = characterCount / LIMITS.MAX_CHARACTERS;
    if (percentage > 1) return colors.error;
    if (percentage > 0.9) return colors.warning;
    if (percentage > 0.75) return colors.thermometer.neutral;
    return colors.text.muted;
  };

  const handleSend = () => {
    if (canSend) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Indicador de mensajes restantes */}
      {remainingMessages <= LIMITS.MAX_CONSECUTIVE_MESSAGES && (
        <View style={styles.remainingContainer}>
          <Text style={[
            styles.remainingText,
            remainingMessages === 0 && styles.remainingTextWarning
          ]}>
            {remainingMessages === 0
              ? '⏳ Esperando respuesta...'
              : `Mensajes restantes: ${remainingMessages}`}
          </Text>
        </View>
      )}

      {/* Input principal */}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        disabled && styles.inputContainerDisabled,
      ]}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={disabled ? 'Esperando respuesta...' : placeholder}
          placeholderTextColor={colors.text.muted}
          multiline
          maxLength={LIMITS.MAX_CHARACTERS + 50} // Permite escribir un poco más para ver el error
          editable={!disabled}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Ionicons
            name="send"
            size={20}
            color={canSend ? colors.text.inverse : colors.text.muted}
          />
        </TouchableOpacity>
      </View>

      {/* Contador de caracteres */}
      <View style={styles.counterContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min((characterCount / LIMITS.MAX_CHARACTERS) * 100, 100)}%`,
                backgroundColor: getCounterColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.counter, { color: getCounterColor() }]}>
          {characterCount}/{LIMITS.MAX_CHARACTERS}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  remainingContainer: {
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  remainingText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  remainingTextWarning: {
    color: colors.warning,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...shadows.sm,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  inputContainerDisabled: {
    backgroundColor: colors.borderLight,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  counter: {
    ...typography.caption,
    minWidth: 60,
    textAlign: 'right',
  },
});

export default MessageInput;
