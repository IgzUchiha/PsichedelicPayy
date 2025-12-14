import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

export default function NetworkBalanceItem({ network, onPress }) {
  const hasBalance = network.balance > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: network.color + '20' }]}>
        <Text style={styles.icon}>{network.icon}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{network.name}</Text>
        <Text style={styles.chainId}>Chain ID: {network.chainId}</Text>
      </View>
      
      <View style={styles.balanceContainer}>
        <Text style={[styles.balance, hasBalance && styles.balanceActive]}>
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
    borderBottomColor: colors.divider,
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
    color: colors.textPrimary,
    marginBottom: 2,
  },
  chainId: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  balanceActive: {
    color: colors.green,
  },
});
