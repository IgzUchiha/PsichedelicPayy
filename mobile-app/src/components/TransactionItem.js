import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function TransactionItem({ type, title, subtitle, amount, positive = true, onPress }) {
  const getIcon = () => {
    switch (type) {
      case 'send': return '↑';
      case 'receive': return '↓';
      case 'transfer': return '↔';
      default: return '•';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={[styles.amount, positive ? styles.positive : styles.negative]}>
        {positive ? '+' : '-'}${amount}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: colors.green,
  },
  negative: {
    color: colors.textPrimary,
  },
});
