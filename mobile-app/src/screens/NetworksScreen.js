import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import NetworkBalanceItem from '../components/NetworkBalanceItem';

export default function NetworksScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { 
    wallet, 
    networkBalances, 
    loadingBalances, 
    refreshNetworkBalances,
    hasWallet 
  } = useWallet();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNetworkBalances();
    setRefreshing(false);
  };

  const handleNetworkPress = (network) => {
    if (wallet?.address) {
      const url = `${network.explorerUrl}/address/${wallet.address}`;
      Linking.openURL(url);
    }
  };

  // Calculate total balance in USD (simplified - would need price feeds in production)
  const totalBalance = networkBalances.reduce((sum, n) => sum + n.balance, 0);
  const networksWithBalance = networkBalances.filter(n => n.balance > 0);

  if (!hasWallet) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Networks</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔗</Text>
          <Text style={styles.emptyTitle}>No Wallet Connected</Text>
          <Text style={styles.emptySubtitle}>
            Import a wallet to view your balances across all networks
          </Text>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => navigation.navigate('ImportWallet')}
          >
            <Text style={styles.importButtonText}>Import Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Networks</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Across Networks</Text>
          <Text style={styles.summaryValue}>
            {networksWithBalance.length} network{networksWithBalance.length !== 1 ? 's' : ''} with balance
          </Text>
        </View>

        {/* Address */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Your Address</Text>
          <Text style={styles.addressValue} numberOfLines={1}>
            {wallet?.address}
          </Text>
        </View>

        {/* Network List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Networks</Text>
          {loadingBalances && (
            <Text style={styles.loadingText}>Updating...</Text>
          )}
        </View>

        <View style={styles.networksList}>
          {networkBalances.map((network) => (
            <NetworkBalanceItem
              key={network.id}
              network={network}
              onPress={() => handleNetworkPress(network)}
            />
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Tap a network to view your address on its block explorer. Pull down to refresh balances.
          </Text>
        </View>

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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: 20,
    marginBottom: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  addressLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  addressValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  networksList: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  importButton: {
    backgroundColor: colors.green,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
});
