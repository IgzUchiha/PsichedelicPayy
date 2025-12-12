import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function BalanceCard({ balance, change, changePercent, positive = true }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.balance}>${balance}</Text>
      <View style={styles.changeContainer}>
        <Text style={[styles.change, positive ? styles.positive : styles.negative]}>
          {positive ? '+' : '-'}${Math.abs(change).toFixed(2)} ({changePercent}%)
        </Text>
        <Text style={styles.period}>Today</Text>
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
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balance: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
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
  positive: {
    color: colors.green,
  },
  negative: {
    color: colors.red,
  },
  period: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});
