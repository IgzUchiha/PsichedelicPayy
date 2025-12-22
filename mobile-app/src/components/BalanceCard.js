import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function BalanceCard({ balance, change, changePercent, positive = true }) {
  const { theme } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Total Balance</Text>
      <Text style={[styles.balance, { color: theme.textPrimary }]}>${balance}</Text>
      <View style={styles.changeContainer}>
        <Text style={[styles.change, positive ? { color: theme.accent } : { color: theme.red }]}>
          {positive ? '+' : '-'}${Math.abs(change).toFixed(2)} ({changePercent}%)
        </Text>
        <Text style={[styles.period, { color: theme.textSecondary }]}>Today</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  balance: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
  },
  period: {
    fontSize: 14,
    marginLeft: 8,
  },
});
