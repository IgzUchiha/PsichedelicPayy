import { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import BalanceCard from '../components/BalanceCard';
import ActionButton from '../components/ActionButton';
import TransactionItem from '../components/TransactionItem';
import { useWallet } from '../context/WalletContext';
import payyApi from '../api/payyApi';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { balance: walletBalance, hasWallet, refreshBalance } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [height, setHeight] = useState(null);
  const [health, setHealth] = useState(null);
  const [transactions, setTransactions] = useState([]);

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
      
      // Handle transaction response
      if (Array.isArray(txData)) {
        setTransactions(txData);
      } else if (txData?.transactions) {
        setTransactions(txData.transactions);
      }
      
      // Refresh wallet balance
      if (hasWallet) {
        await refreshBalance();
      }
    } catch (err) {
      // Silently handle errors
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

  // Only show real balance
  const displayBalance = walletBalance?.total || '0.00';
  const change = walletBalance?.change || 0;
  const changePercent = walletBalance?.changePercent || 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileText}>P</Text>
        </View>
        <Text style={styles.headerTitle}>Payy</Text>
        <View style={styles.statusDot}>
          <View style={[styles.dot, isHealthy ? styles.dotOnline : styles.dotOffline]} />
        </View>
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
        {/* Balance */}
        <BalanceCard 
          balance={displayBalance}
          change={change}
          changePercent={changePercent}
          positive={change >= 0}
        />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
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
            icon="⋯" 
            label="More" 
            onPress={() => {}}
          />
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{height?.height ?? '—'}</Text>
              <Text style={styles.statLabel}>Block Height</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalTxns}</Text>
              <Text style={styles.statLabel}>7d Transactions</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text 
            style={styles.seeAll}
            onPress={() => navigation.navigate('Activity')}
          >
            See All
          </Text>
        </View>

        <View style={styles.transactionsList}>
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
              <Text style={styles.emptyText}>No recent activity</Text>
            </View>
          )}
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <Text 
            style={styles.quickLink}
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
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
  dotOnline: {
    backgroundColor: colors.green,
  },
  dotOffline: {
    backgroundColor: colors.red,
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
    borderBottomColor: colors.divider,
  },
  statsCard: {
    margin: 20,
    backgroundColor: colors.cardBackground,
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
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
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
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.green,
    fontWeight: '600',
  },
  transactionsList: {
    backgroundColor: colors.cardBackground,
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
    color: colors.textSecondary,
  },
  quickLinks: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickLink: {
    fontSize: 16,
    color: colors.green,
    fontWeight: '600',
  },
});
