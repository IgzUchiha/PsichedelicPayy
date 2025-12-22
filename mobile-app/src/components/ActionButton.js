import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ActionButton({ icon, label, onPress, primary = false }) {
  const { theme } = useTheme();
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
          { backgroundColor: theme.surfaceLight, borderColor: theme.border },
          primary && { backgroundColor: theme.accent, borderWidth: 0 },
          { transform: [{ scale: scaleAnim }] },
          primary ? { shadowColor: theme.accent } : styles.defaultShadow,
        ]}
      >
        {primary && <View style={[styles.glowEffect, { backgroundColor: theme.accentLight }]} />}
        <Text style={[styles.icon, { color: theme.textPrimary }, primary && { color: theme.background }]}>{icon}</Text>
      </Animated.View>
      <Text style={[styles.label, { color: theme.textSecondary }, primary && { color: theme.accent }]}>{label}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  defaultShadow: {
    shadowColor: '#000',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    opacity: 0.15,
    borderRadius: 40,
  },
  icon: {
    fontSize: 26,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
