import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import Sparkline from '../components/Sparkline';

// Chain icons and colors
const CHAIN_CONFIG = {
  ethereum: { icon: '⟠', color: '#627EEA', name: 'Ethereum' },
  arbitrum: { icon: '🔵', color: '#28A0F0', name: 'Arbitrum' },
  optimism: { icon: '🔴', color: '#FF0420', name: 'Optimism' },
  polygon: { icon: '🟣', color: '#8247E5', name: 'Polygon' },
  base: { icon: '🔷', color: '#0052FF', name: 'Base' },
  bsc: { icon: '🟡', color: '#F0B90B', name: 'BNB Chain' },
  avalanche: { icon: '🔺', color: '#E84142', name: 'Avalanche' },
};

export default function CryptoDetailScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { networkBalances = [], refreshNetworkBalances, loadingBalances } = useWallet();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (refreshNetworkBalances) {
      await refreshNetworkBalances();
    }
    setRefreshing(false);
  };

  // Calculate total USD value across all networks
  const totalUsdValue = (networkBalances || []).reduce((sum, n) => sum + (n.usdValue || 0), 0);
  const formattedTotalUsd = totalUsdValue < 0.01 && totalUsdValue > 0 
    ? '<$0.01' 
    : totalUsdValue.toFixed(2);

  // Sort networks: those with balance first, then alphabetically
  const sortedNetworks = [...(networkBalances || [])].sort((a, b) => {
    if (a.balance > 0 && b.balance === 0) return -1;
    if (a.balance === 0 && b.balance > 0) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.filterIcon, { color: theme.textSecondary }]}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.textSecondary}
          />
        }
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Your crypto</Text>
          <Text style={[styles.totalBalance, { color: theme.textPrimary }]}>${formattedTotalUsd}</Text>
          <Text style={[styles.changeText, { color: theme.accent }]}>
            ↗ $0.00 (0%) <Text style={{ color: theme.textSecondary }}>today</Text>
          </Text>
        </View>

        {/* Crypto Items */}
        <View style={[styles.itemsContainer, { backgroundColor: theme.cardBackground }]}>
          {sortedNetworks.map((network, index) => {
            const config = CHAIN_CONFIG[network.id] || { icon: '🔗', color: '#888', name: network.name };
            const hasBalance = network.balance > 0;
            
            return (
              <React.Fragment key={network.id}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
                <TouchableOpacity 
                  style={styles.itemRow}
                  onPress={() => navigation.navigate('ChainDetail', {
                    chainId: network.id,
                    balance: network.formattedBalance,
                    usdValue: network.formattedUsdValue || '$0.00'
                  })}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.itemIcon, { backgroundColor: config.color + '20' }]}>
                      <Text style={styles.itemIconText}>{config.icon}</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: theme.textPrimary }]}>{network.name}</Text>
                      <Text style={[styles.itemSymbol, { color: theme.textSecondary }]}>{network.symbol}</Text>
                    </View>
                  </View>
                  
                  {/* Sparkline Chart */}
                  <View style={styles.sparklineContainer}>
                    {network.sparkline && network.sparkline.length > 0 && (
                      <Sparkline 
                        data={network.sparkline.slice(-24)} 
                        width={60} 
                        height={24}
                        color={(network.priceChange24h || 0) >= 0 ? '#00C805' : '#FF3B30'}
                      />
                    )}
                  </View>
                  
                  <View style={styles.itemRight}>
                    <Text style={[styles.itemValue, { color: theme.textPrimary }]}>
                      {network.formattedUsdValue || '$0.00'}
                    </Text>
                    <Text style={[
                      styles.itemChange, 
                      { color: (network.priceChange24h || 0) >= 0 ? '#00C805' : '#FF3B30' }
                    ]}>
                      {(network.priceChange24h || 0) >= 0 ? '↗' : '↘'} {Math.abs(network.priceChange24h || 0).toFixed(2)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* Loading indicator */}
        {loadingBalances && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Updating balances...</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.footerButton, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigation.navigate('SubmitTransaction')}
        >
          <Text style={[styles.footerButtonText, { color: theme.textPrimary }]}>Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.footerButton, styles.footerButtonPrimary, { backgroundColor: '#2196F3' }]}
          onPress={() => navigation.navigate('Receive')}
        >
          <Text style={[styles.footerButtonText, { color: '#fff' }]}>Buy & sell</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
  },
  headerRight: {
    flexDirection: 'row',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  totalBalance: {
    fontSize: 40,
    fontWeight: '700',
  },
  changeText: {
    fontSize: 14,
    marginTop: 4,
  },
  itemsContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIconText: {
    fontSize: 22,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSymbol: {
    fontSize: 13,
    marginTop: 2,
  },
  sparklineContainer: {
    width: 70,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemRight: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemChange: {
    fontSize: 13,
    marginTop: 2,
  },
  itemSubvalue: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 72,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  footerButtonPrimary: {},
  footerButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
