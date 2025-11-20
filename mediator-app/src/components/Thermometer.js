import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { useMediation } from '../contexts/MediationContext';

const Thermometer = ({ showLabel = true, size = 'medium' }) => {
  const { currentSession, getThermometerLevel } = useMediation();
  const animatedValue = useRef(new Animated.Value(currentSession.thermometerScore)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const level = getThermometerLevel();

  // Dimensiones según tamaño
  const dimensions = {
    small: { width: 30, height: 120 },
    medium: { width: 40, height: 180 },
    large: { width: 50, height: 240 },
  };

  const { width, height } = dimensions[size];

  useEffect(() => {
    // Animar cambio de valor
    Animated.spring(animatedValue, {
      toValue: currentSession.thermometerScore,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();

    // Pulso si está en estado crítico
    if (currentSession.thermometerScore < 20) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [currentSession.thermometerScore]);

  // Interpolar color según el valor
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 20, 40, 60, 80, 100],
    outputRange: [
      colors.thermometer.hot,
      colors.thermometer.warm,
      colors.thermometer.neutral,
      colors.thermometer.cool,
      colors.thermometer.cold,
      colors.thermometer.cold,
    ],
  });

  // Altura del líquido
  const liquidHeight = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, height - 20],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <View style={[styles.thermometerBody, { width, height }]}>
        {/* Fondo del termómetro */}
        <View style={[styles.background, { borderRadius: width / 2 }]} />

        {/* Líquido animado */}
        <Animated.View
          style={[
            styles.liquid,
            {
              height: liquidHeight,
              backgroundColor,
              borderBottomLeftRadius: width / 2,
              borderBottomRightRadius: width / 2,
            },
          ]}
        />

        {/* Marcadores */}
        <View style={styles.markers}>
          {[0, 25, 50, 75, 100].map((mark) => (
            <View
              key={mark}
              style={[
                styles.marker,
                { bottom: `${mark}%` },
              ]}
            />
          ))}
        </View>

        {/* Bulbo */}
        <Animated.View
          style={[
            styles.bulb,
            {
              width: width * 1.5,
              height: width * 1.5,
              borderRadius: width * 0.75,
              backgroundColor,
            },
          ]}
        />
      </View>

      {/* Etiqueta */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.score}>{Math.round(currentSession.thermometerScore)}%</Text>
          <Text style={styles.label}>{level.label}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.md,
  },
  thermometerBody: {
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.border,
  },
  liquid: {
    position: 'absolute',
    bottom: 10,
    left: 5,
    right: 5,
  },
  markers: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    right: -10,
    width: 10,
  },
  marker: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: colors.text.muted,
  },
  bulb: {
    position: 'absolute',
    bottom: -10,
  },
  labelContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  score: {
    ...typography.h2,
    color: colors.text.primary,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default Thermometer;
