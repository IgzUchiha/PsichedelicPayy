import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import colors from '../theme/colors';
import { useWallet } from '../context/WalletContext';

function SettingsItem({ icon, title, subtitle, onPress, danger = false }) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.settingsIcon}>{icon}</Text>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { wallet, balance, hasWallet, removeWallet, loading } = useWallet();

  const handleRemoveWallet = () => {
    Alert.alert(
      'Remove Wallet',
      'Are you sure you want to remove this wallet? Make sure you have backed up your private key.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await removeWallet();
            if (result.success) {
              Alert.alert('Wallet Removed', 'Your wallet has been removed from this device.');
            }
          },
        },
      ]
    );
  };

  const shortAddress = wallet?.address
    ? `${wallet.address.slice(0, 10)}...${wallet.address.slice(-8)}`
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Wallet Card */}
        {hasWallet ? (
          <View style={styles.walletCard}>
            <View style={styles.walletIcon}>
              <Text style={styles.walletIconText}>💳</Text>
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>{wallet?.name || 'My Wallet'}</Text>
              <Text style={styles.walletAddress}>{shortAddress}</Text>
            </View>
            <View style={styles.walletBalance}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>${balance?.total || '0.00'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noWalletCard}>
            <Text style={styles.noWalletIcon}>🔐</Text>
            <Text style={styles.noWalletTitle}>No Wallet Connected</Text>
            <Text style={styles.noWalletText}>
              Import your existing wallet to see your real balance and make transactions.
            </Text>
            <TouchableOpacity
              style={styles.importButton}
              onPress={() => navigation.navigate('ImportWallet')}
            >
              <Text style={styles.importButtonText}>Import Wallet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Wallet Section */}
        <Text style={styles.sectionTitle}>Wallet</Text>
        <View style={styles.settingsGroup}>
          {hasWallet ? (
            <>
              <SettingsItem
                icon="🔑"
                title="Backup Private Key"
                subtitle="View and copy your private key"
                onPress={() => {
                  Alert.alert(
                    'Private Key',
                    'For security, please write this down and store it safely.\n\n' + wallet?.privateKey,
                    [{ text: 'Done' }]
                  );
                }}
              />
              <SettingsItem
                icon="📋"
                title="Copy Address"
                subtitle={shortAddress}
                onPress={() => Alert.alert('Copied!', 'Address copied to clipboard')}
              />
              <SettingsItem
                icon="🗑️"
                title="Remove Wallet"
                subtitle="Delete wallet from this device"
                onPress={handleRemoveWallet}
                danger
              />
            </>
          ) : (
            <SettingsItem
              icon="📥"
              title="Import Wallet"
              subtitle="Restore from private key"
              onPress={() => navigation.navigate('ImportWallet')}
            />
          )}
        </View>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon="🔔"
            title="Notifications"
            subtitle="Manage push notifications"
            onPress={() => {}}
          />
          <SettingsItem
            icon="🌙"
            title="Appearance"
            subtitle="Dark mode"
            onPress={() => {}}
          />
          <SettingsItem
            icon="🔒"
            title="Security"
            subtitle="Face ID, PIN code"
            onPress={() => {}}
          />
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon="📖"
            title="Help Center"
            onPress={() => {}}
          />
          <SettingsItem
            icon="📜"
            title="Terms of Service"
            onPress={() => {}}
          />
          <SettingsItem
            icon="🛡️"
            title="Privacy Policy"
            onPress={() => {}}
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Payy v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletIconText: {
    fontSize: 24,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  walletBalance: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.green,
  },
  noWalletCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  noWalletIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noWalletTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  noWalletText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  importButton: {
    backgroundColor: colors.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  importButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  settingsGroup: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  settingsSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dangerText: {
    color: colors.red,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
  },
  version: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
});
