import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useMediation } from '../contexts/MediationContext';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../utils/theme';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import AISuggestionsPanel from '../components/AISuggestionsPanel';
import Thermometer from '../components/Thermometer';
import { analyzeMessage, generateSuggestion } from '../services/aiService';

const ChatScreen = ({ route, navigation }) => {
  const { sessionId } = route.params || {};
  const { user } = useAuth();
  const {
    currentSession,
    sendMessage,
    canSendMessage,
    getRemainingMessages,
    addAISuggestion,
    updateThermometer,
  } = useMediation();

  const flatListRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const userId = 'user1'; // TODO: Determinar basado en el usuario actual

  // Scroll al último mensaje
  useEffect(() => {
    if (currentSession.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentSession.messages]);

  const handleSendMessage = async (content) => {
    try {
      // Enviar mensaje
      const message = sendMessage(content, userId);

      // Analizar con IA
      setIsAnalyzing(true);

      try {
        // Analizar el mensaje para actualizar termómetro
        const analysis = await analyzeMessage(content, currentSession.messages);

        if (analysis.thermometerDelta) {
          const newScore = currentSession.thermometerScore + analysis.thermometerDelta;
          updateThermometer(newScore);
        }

        // Generar sugerencia si es necesario
        if (analysis.shouldSuggest) {
          const suggestion = await generateSuggestion(
            content,
            currentSession.messages,
            analysis.suggestionType
          );

          if (suggestion) {
            addAISuggestion(suggestion);
          }
        }
      } catch (aiError) {
        console.error('Error en análisis de IA:', aiError);
        // Continuar sin sugerencia si falla la IA
      }

      setIsAnalyzing(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUseSuggestion = (suggestion) => {
    // Copiar al clipboard o insertar en el input
    // Por ahora solo mostramos un mensaje
    alert('Sugerencia copiada. Puedes modificarla antes de enviar.');
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.senderId === userId;
    return <ChatBubble message={item} isOwn={isOwn} />;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.thermometerContainer}>
        <Thermometer size="small" showLabel={false} />
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTopic} numberOfLines={2}>
          {currentSession.topic || 'Mediación en curso'}
        </Text>
        <Text style={styles.sessionStatus}>
          {currentSession.messages.length} mensajes
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Inicia la conversación</Text>
      <Text style={styles.emptyText}>
        Escribe tu primer mensaje para comenzar la mediación.
        Recuerda ser claro y respetuoso.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Header con termómetro */}
        {renderHeader()}

        {/* Lista de mensajes */}
        <FlatList
          ref={flatListRef}
          data={currentSession.messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={renderEmpty}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Panel de sugerencias de IA */}
        <AISuggestionsPanel
          suggestions={currentSession.aiSuggestions}
          onUseSuggestion={handleUseSuggestion}
        />

        {/* Input de mensaje */}
        <MessageInput
          onSend={handleSendMessage}
          disabled={!canSendMessage(userId)}
          remainingMessages={getRemainingMessages(userId)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thermometerContainer: {
    marginRight: spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTopic: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sessionStatus: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  messagesList: {
    paddingVertical: spacing.md,
    flexGrow: 1,
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
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ChatScreen;
