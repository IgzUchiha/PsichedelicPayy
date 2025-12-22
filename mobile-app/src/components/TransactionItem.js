import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function TransactionItem({ type, title, subtitle, amount, positive = true, onPress }) {
  const { theme } = useTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'send': return '↑';
      case 'receive': return '↓';
      case 'transfer': return '↔';
      default: return '•';
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { borderBottomColor: theme.divider }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: theme.surfaceLight }]}>
        <Text style={[styles.icon, { color: theme.textPrimary }]}>{getIcon()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
      <Text style={[styles.amount, positive ? { color: theme.accent } : { color: theme.textPrimary }]}>
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
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
