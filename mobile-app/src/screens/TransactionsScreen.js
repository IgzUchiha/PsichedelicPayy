import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import TransactionItem from '../components/TransactionItem';
import payyApi from '../api/payyApi';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchTransactions = async () => {
    try {
      const response = await payyApi.listTransactions(20, 0);
      if (Array.isArray(response)) {
        setTransactions(response);
      } else if (response.transactions) {
        setTransactions(response.transactions);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.type === 'send';
    if (filter === 'received') return tx.type === 'receive';
    return true;
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'sent', 'received'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
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
        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {filteredTransactions.map((tx, index) => (
              <TransactionItem
                key={tx.hash || index}
                type={tx.type || 'transfer'}
                title={tx.type === 'send' ? 'Payment Sent' : tx.type === 'receive' ? 'Payment Received' : 'Transaction'}
                subtitle={tx.to ? `To ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : (tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleDateString() : tx.hash ? `${tx.hash.slice(0, 10)}...` : 'Recent')}
                amount={tx.amount || '0.00'}
                positive={tx.type === 'receive'}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Activity Yet</Text>
            <Text style={styles.emptyText}>
              Your transactions will appear here once you start sending and receiving payments.
            </Text>
          </View>
        )}

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
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  filterTabActive: {
    backgroundColor: colors.textPrimary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  transactionsList: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
