import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function NetworkBalanceItem({ network, onPress }) {
  const { theme } = useTheme();
  const hasBalance = network.balance > 0;

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: theme.divider }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: network.color + '20' }]}>
        <Text style={styles.icon}>{network.icon}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.textPrimary }]}>{network.name}</Text>
        <Text style={[styles.chainId, { color: theme.textSecondary }]}>Chain ID: {network.chainId}</Text>
      </View>
      
      <View style={styles.balanceContainer}>
        <Text style={[styles.balance, { color: theme.textSecondary }, hasBalance && { color: theme.accent }]}>
          {network.formattedBalance} {network.symbol}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chainId: {
    fontSize: 13,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 15,
    fontWeight: '600',
  },
});
