import { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text, StatusBar, Alert, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import BalanceCard from '../components/BalanceCard';
import ActionButton from '../components/ActionButton';
import TransactionItem from '../components/TransactionItem';
import { useWallet } from '../context/WalletContext';
import ChainIcon from '../components/ChainIcon';
import payyApi from '../api/payyApi';

// Chain balance data with gradient colors
const CHAIN_BALANCES = [
  { 
    id: 'btc', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    icon: '₿',
    balance: '0.00', 
    usdValue: '0.00',
    gradient: ['#F7931A', '#FF6B00'],
    shadowColor: '#F7931A',
  },
  { 
    id: 'eth', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    icon: 'Ξ',
    balance: '0.00', 
    usdValue: '0.00',
    gradient: ['#627EEA', '#3C3C3D'],
    shadowColor: '#627EEA',
  },
  { 
    id: 'sol', 
    name: 'Solana', 
    symbol: 'SOL', 
    icon: '◎',
    balance: '0.00', 
    usdValue: '0.00',
    gradient: ['#9945FF', '#14F195'],
    shadowColor: '#9945FF',
  },
  { 
    id: 'polygon', 
    name: 'Polygon', 
    symbol: 'MATIC', 
    icon: '⬡',
    balance: '0.00', 
    usdValue: '0.00',
    gradient: ['#8247E5', '#A379FF'],
    shadowColor: '#8247E5',
  },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { wallet, balance: walletBalance, hasWallet, refreshBalance, addNote } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [height, setHeight] = useState(null);
  const [health, setHealth] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const handleFaucet = async () => {
    if (!hasWallet) {
      Alert.alert('No Wallet', 'Please create or import a wallet first', [
        { text: 'OK', onPress: () => navigation.navigate('ProfileTab') }
      ]);
      return;
    }

    Alert.alert(
      'Request Test Tokens',
      'This will mint $100 test USDC to your wallet. This may take up to a minute.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request', 
          onPress: async () => {
            setFaucetLoading(true);
            try {
              const addressData = await payyApi.deriveAddress(wallet.privateKey);
              const zkAddress = addressData.address;
              const result = await payyApi.requestFaucet(zkAddress, 100_000_000);
              
              if (result.note) {
                await addNote({
                  address: result.note.address,
                  psi: result.note.psi,
                  value: result.amount,
                  commitment: result.note.commitment,
                  token: 'USDC',
                  source: zkAddress,
                });
              }
              
              Alert.alert(
                'Tokens Received! 🎉',
                `$100 test USDC has been minted to your wallet.\n\nNote commitment: ${result.note?.commitment?.slice(0, 16)}...`,
              );
              fetchData();
            } catch (err) {
              console.error('Faucet error:', err);
              Alert.alert(
                'Faucet Error',
                err.response?.data?.error?.message || err.message || 'Failed to request tokens'
              );
            } finally {
              setFaucetLoading(false);
            }
          }
        }
      ]
    );
  };

  const fetchData = async () => {
    try {
      const [heightData, statsData, txData] = await Promise.all([
        payyApi.getHeight().catch(() => null),
        payyApi.getStats().catch(() => null),
        payyApi.listTransactions(5, 0).catch(() => []),
      ]);
      try {
        const healthData = await payyApi.getHealth();
        setHealth(healthData);
      } catch (e) {
        setHealth({ error: { code: 'unavailable' } });
      }
      setHeight(heightData);
      setStats(statsData);
      
      if (Array.isArray(txData)) {
        setTransactions(txData);
      } else if (txData?.transactions) {
        setTransactions(txData.transactions);
      }
      
      if (hasWallet) {
        await refreshBalance();
      }
    } catch (err) {
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const totalTxns = stats?.last_7_days_txns?.reduce((sum, day) => sum + day.count, 0) || 0;
  const isHealthy = !health?.error;
  const displayBalance = walletBalance?.total || '0.00';
  const change = walletBalance?.change || 0;
  const changePercent = walletBalance?.changePercent || 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Image 
          source={require('../../assets/IMG_3244.jpg')} 
          style={styles.profileIcon}
        />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>PSI</Text>
        <View style={styles.statusDot}>
          <View style={[styles.dot, isHealthy ? { backgroundColor: theme.accent } : { backgroundColor: theme.red }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.textSecondary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <BalanceCard 
          balance={displayBalance}
          change={change}
          changePercent={changePercent}
          positive={change >= 0}
        />

        <View style={[styles.actionsContainer, { borderBottomColor: theme.divider }]}>
          <ActionButton 
            icon="↑" 
            label="Send" 
            onPress={() => navigation.navigate('SubmitTransaction')}
          />
          <ActionButton 
            icon="↓" 
            label="Receive" 
            onPress={() => navigation.navigate('Receive')}
          />
          <ActionButton 
            icon="$" 
            label="Pay" 
            primary
            onPress={() => navigation.navigate('SubmitTransaction')}
          />
          <ActionButton 
            icon={faucetLoading ? "⏳" : "💧"} 
            label="Faucet" 
            onPress={handleFaucet}
            disabled={faucetLoading}
          />
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{height?.height ?? '—'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Block Height</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{totalTxns}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>7d Transactions</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Activity</Text>
          <Text 
            style={[styles.seeAll, { color: theme.accent }]}
            onPress={() => navigation.navigate('Activity')}
          >
            See All
          </Text>
        </View>

        <View style={[styles.transactionsList, { backgroundColor: theme.cardBackground }]}>
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((tx, index) => (
              <TransactionItem
                key={tx.hash || index}
                type={tx.type || 'transfer'}
                title={tx.type === 'send' ? 'Payment Sent' : tx.type === 'receive' ? 'Payment Received' : 'Transaction'}
                subtitle={tx.to ? `To ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : tx.hash ? `${tx.hash.slice(0, 10)}...` : 'Recent'}
                amount={tx.amount || '0.00'}
                positive={tx.type === 'receive'}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No recent activity</Text>
            </View>
          )}
        </View>

        {/* Chain Balances Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your Balances</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chainCardsContainer}
        >
          {CHAIN_BALANCES.map((chain) => (
            <TouchableOpacity 
              key={chain.id} 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ChainDetail', { 
                chainId: chain.id, 
                balance: chain.balance, 
                usdValue: chain.usdValue 
              })}
            >
              <LinearGradient
                colors={chain.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.chainCard, { shadowColor: chain.shadowColor }]}
              >
                <View style={styles.chainCardHeader}>
                  <View style={styles.chainIconWrapper}>
                    <ChainIcon chainId={chain.id} size={28} color="#fff" />
                  </View>
                  <View style={styles.chainCardBadge}>
                    <Text style={styles.chainCardBadgeText}>{chain.symbol}</Text>
                  </View>
                </View>
                <Text style={styles.chainCardName}>{chain.name}</Text>
                <View style={styles.chainCardBalance}>
                  <Text style={styles.chainCardAmount}>{chain.balance}</Text>
                  <Text style={styles.chainCardSymbol}>{chain.symbol}</Text>
                </View>
                <Text style={styles.chainCardUsd}>${chain.usdValue} USD</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.quickLinks}>
          <Text 
            style={[styles.quickLink, { color: theme.accent }]}
            onPress={() => navigation.navigate('BlocksTab')}
          >
            View Blocks →
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusDot: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
  },
  statsCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  quickLinks: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  chainCardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  chainCard: {
    width: 160,
    height: 180,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  chainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chainIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chainCardIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  chainCardBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chainCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  chainCardName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  chainCardBalance: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  chainCardAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  chainCardSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  chainCardUsd: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
});
