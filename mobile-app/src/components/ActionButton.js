import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import colors from '../theme/colors';

export default function ActionButton({ icon, label, onPress, primary = false }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View 
        style={[
          styles.iconContainer, 
          primary && styles.iconContainerPrimary,
          { transform: [{ scale: scaleAnim }] },
          primary ? styles.primaryShadow : styles.defaultShadow,
        ]}
      >
        {primary && <View style={styles.glowEffect} />}
        <Text style={[styles.icon, primary && styles.iconPrimary]}>{icon}</Text>
      </Animated.View>
      <Text style={[styles.label, primary && styles.labelPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 70,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  iconContainerPrimary: {
    backgroundColor: colors.green,
    borderWidth: 0,
  },
  defaultShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  primaryShadow: {
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: colors.greenLight,
    opacity: 0.15,
    borderRadius: 40,
  },
  icon: {
    fontSize: 26,
    color: colors.textPrimary,
  },
  iconPrimary: {
    color: colors.background,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelPrimary: {
    color: colors.green,
  },
});
