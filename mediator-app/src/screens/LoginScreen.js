import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

const LoginScreen = () => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // TODO: Implementar Google Sign-In real con expo-auth-session
      // Por ahora, simulamos un login exitoso
      const mockUser = {
        id: '1',
        email: 'usuario@gmail.com',
        name: 'Usuario Demo',
        avatar: null,
        plan: 'free',
      };
      const mockToken = 'mock-jwt-token';

      await signIn(mockUser, mockToken);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo y título */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="chatbubbles" size={80} color={colors.primary} />
            <View style={styles.logoAccent}>
              <Ionicons name="heart" size={24} color={colors.accent} />
            </View>
          </View>

          <Text style={styles.title}>conflictiVOS</Text>
          <Text style={styles.subtitle}>
            Mediación inteligente para resolver conflictos
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="chatbubble-ellipses-outline"
            text="Conversaciones guiadas por IA"
          />
          <FeatureItem
            icon="analytics-outline"
            text="Análisis de progreso en tiempo real"
          />
          <FeatureItem
            icon="shield-checkmark-outline"
            text="Espacio seguro y confidencial"
          />
        </View>

        {/* Botón de login */}
        <View style={styles.loginSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
                <Text style={styles.googleButtonText}>
                  Continuar con Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Al continuar, aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos de Servicio</Text>
            {' '}y{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={24} color={colors.primary} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  logoAccent: {
    position: 'absolute',
    bottom: -5,
    right: -10,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
    ...shadows.sm,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  features: {
    marginVertical: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.md,
    flex: 1,
  },
  loginSection: {
    marginBottom: spacing.xl,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  googleButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  termsText: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
  },
});

export default LoginScreen;
