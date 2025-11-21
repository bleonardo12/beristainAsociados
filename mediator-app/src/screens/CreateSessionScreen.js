import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMediation } from '../contexts/MediationContext';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

const CreateSessionScreen = ({ navigation }) => {
  const { createSession } = useMediation();
  const [topic, setTopic] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Por favor ingresa el tema a tratar');
      return;
    }

    if (!inviteeEmail.trim()) {
      Alert.alert('Error', 'Por favor ingresa el email de la otra persona');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteeEmail)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    // Crear sesión
    const session = createSession(topic.trim(), inviteeEmail.trim());

    Alert.alert(
      '¡Invitación enviada!',
      `Se ha enviado una invitación a ${inviteeEmail} para mediar sobre "${topic}"`,
      [
        {
          text: 'Ver sesión',
          onPress: () => navigation.navigate('Sesiones'),
        },
      ]
    );

    // Limpiar formulario
    setTopic('');
    setInviteeEmail('');
    setDescription('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Explicación */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <Text style={styles.infoText}>
            Describe el tema que quieres resolver. La otra persona recibirá una
            invitación y podrá aceptar o proponer otro tema.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Tema */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tema a tratar *</Text>
            <TextInput
              style={styles.input}
              value={topic}
              onChangeText={setTopic}
              placeholder="Ej: Distribución de tareas del hogar"
              placeholderTextColor={colors.text.muted}
              maxLength={100}
            />
            <Text style={styles.charCount}>{topic.length}/100</Text>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email de la otra persona *</Text>
            <TextInput
              style={styles.input}
              value={inviteeEmail}
              onChangeText={setInviteeEmail}
              placeholder="ejemplo@gmail.com"
              placeholderTextColor={colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Descripción adicional */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contexto adicional (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Agrega contexto que ayude a entender la situación..."
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>
        </View>

        {/* Recordatorios */}
        <View style={styles.reminders}>
          <Text style={styles.remindersTitle}>Recordatorios</Text>
          <ReminderItem
            icon="time-outline"
            text="Máximo 2 mensajes consecutivos sin respuesta"
          />
          <ReminderItem
            icon="text-outline"
            text="Máximo 280 caracteres por mensaje"
          />
          <ReminderItem
            icon="sparkles-outline"
            text="La IA te ayudará con sugerencias"
          />
        </View>

        {/* Botón crear */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={20} color={colors.text.inverse} />
          <Text style={styles.createButtonText}>Enviar Invitación</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const ReminderItem = ({ icon, text }) => (
  <View style={styles.reminderItem}>
    <Ionicons name={icon} size={18} color={colors.text.muted} />
    <Text style={styles.reminderText}>{text}</Text>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    ...shadows.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  form: {
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  reminders: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  remindersTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  reminderText: {
    ...typography.caption,
    color: colors.text.muted,
    marginLeft: spacing.sm,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  createButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.inverse,
    marginLeft: spacing.sm,
  },
});

export default CreateSessionScreen;
