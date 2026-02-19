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
import Svg, { Path, Rect, Circle as SvgCircle } from 'react-native-svg';

const BRAND_PURPLE = '#6F34D5';

// Menu item with icon, title, optional subtitle, and optional right-side badge
function MenuItem({ icon, title, subtitle, rightText, rightColor, onPress, danger = false }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && { color: '#EF4444' }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightText ? (
        <Text style={[styles.menuRightText, rightColor && { color: rightColor }]}>{rightText}</Text>
      ) : (
        <Text style={styles.menuChevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

// Section header
function SectionHeader({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { wallet, balance, cashBalance = 0, hasWallet, removeWallet } = useWallet();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Make sure you have backed up your seed phrase or private key.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const result = await removeWallet();
            if (result.success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Contact support@psichedeliclabs.com')}>
          <View style={styles.helpButton}>
            <Text style={styles.helpText}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Menu Items */}
        <View style={styles.menuGroup}>
          <MenuItem
            icon="💵"
            title="Cash"
            rightText={`$${cashBalance.toFixed(2)}`}
            rightColor="#888"
            onPress={() => navigation.navigate('CashDetail')}
          />
          <MenuItem
            icon="💳"
            title="PSI Card"
            rightText="Virtual"
            rightColor={BRAND_PURPLE}
            onPress={() => navigation.navigate('CardScreen')}
          />
          <MenuItem
            icon="🎁"
            title="Rewards"
            onPress={() => Alert.alert('Rewards', 'Earn rewards on every transaction you make with PSI.')}
          />
          <MenuItem
            icon="👥"
            title="Invite friends"
            rightText="Earn $10"
            rightColor="#22C55E"
            onPress={() => Alert.alert('Invite Friends', 'Share your referral link to earn $10 per friend.')}
          />
        </View>

        {/* Transact Section */}
        <SectionHeader title="TRANSACT" />
        <View style={styles.menuGroup}>
          <MenuItem
            icon="💳"
            title="Debit card"
            onPress={() => navigation.navigate('CardScreen')}
          />
          <MenuItem
            icon="📲"
            title="Request payment"
            onPress={() => navigation.navigate('PayScreen')}
          />
          <MenuItem
            icon="🔄"
            title="Convert"
            onPress={() => navigation.navigate('Convert', {})}
          />
        </View>

        {/* Wallet Section */}
        {hasWallet && (
          <>
            <SectionHeader title="WALLET" />
            <View style={styles.menuGroup}>
              <MenuItem
                icon="🔑"
                title="Backup Seed Phrase"
                subtitle={shortAddress}
                onPress={() => {
                  if (wallet?.mnemonic) {
                    Alert.alert(
                      'Seed Phrase',
                      'Write this down and store it safely. Never share it!\n\n' + wallet.mnemonic,
                      [{ text: 'Done' }]
                    );
                  } else {
                    Alert.alert(
                      'Private Key',
                      'For security, please write this down and store it safely.\n\n' + wallet?.privateKey,
                      [{ text: 'Done' }]
                    );
                  }
                }}
              />
              <MenuItem
                icon="📋"
                title="Copy Address"
                subtitle={shortAddress}
                onPress={() => Alert.alert('Copied!', 'Address copied to clipboard')}
              />
            </View>
          </>
        )}

        {/* More Section */}
        <SectionHeader title="MORE" />
        <View style={styles.menuGroup}>
          <MenuItem
            icon="🔔"
            title="Notifications"
            onPress={() => {}}
          />
          <MenuItem
            icon="🌙"
            title="Appearance"
            onPress={() => {}}
          />
          <MenuItem
            icon="🔒"
            title="Security"
            onPress={() => {}}
          />
          <MenuItem
            icon="📖"
            title="Help Center"
            onPress={() => Alert.alert('Support', 'Contact support@psichedeliclabs.com for help.')}
          />
          <MenuItem
            icon="📜"
            title="Terms of Service"
            onPress={() => {}}
          />
        </View>

        {/* Sign Out */}
        {hasWallet && (
          <View style={[styles.menuGroup, { marginTop: 16 }]}>
            <MenuItem
              icon="🚪"
              title="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </View>
        )}

        {/* Get Help Card */}
        <View style={styles.helpCard}>
          <View style={styles.helpCardContent}>
            <Text style={styles.helpCardTitle}>Get help</Text>
            <Text style={styles.helpCardSubtitle}>Find answers to common{'\n'}questions or talk to us</Text>
          </View>
          <View style={styles.helpCardIcon}>
            <Text style={{ fontSize: 32 }}>💬</Text>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>PSI v1.0.0</Text>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  helpButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C6EF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  menuGroup: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider || '#1C1C1E',
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
    width: 30,
    textAlign: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    color: colors.textPrimary,
    fontWeight: '400',
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuRightText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  menuChevron: {
    fontSize: 22,
    color: colors.textMuted || '#555',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 4,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground || '#1C1C1E',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
  },
  helpCardContent: {
    flex: 1,
  },
  helpCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  helpCardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  helpCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  version: {
    fontSize: 13,
    color: colors.textMuted || '#555',
    textAlign: 'center',
    marginTop: 24,
  },
});
