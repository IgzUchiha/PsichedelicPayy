import { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text, StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import BalanceCard from '../components/BalanceCard';
import ActionButton from '../components/ActionButton';
import TransactionItem from '../components/TransactionItem';
import { useWallet } from '../context/WalletContext';
import payyApi from '../api/payyApi';

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
});
