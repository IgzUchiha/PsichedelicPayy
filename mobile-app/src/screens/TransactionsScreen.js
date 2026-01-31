import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import TransactionItem from '../components/TransactionItem';
import payyApi from '../api/payyApi';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';

// Skeleton loader component
function SkeletonLoader({ width, height, style }) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: colors.surfaceLight, borderRadius: 8, opacity },
        style,
      ]}
    />
  );
}

function TransactionSkeleton() {
  return (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonLeft}>
        <SkeletonLoader width={40} height={40} style={{ borderRadius: 20 }} />
        <View style={{ marginLeft: 12 }}>
          <SkeletonLoader width={120} height={16} style={{ marginBottom: 6 }} />
          <SkeletonLoader width={80} height={12} />
        </View>
      </View>
      <SkeletonLoader width={60} height={16} />
    </View>
  );
}

export default function TransactionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { activities } = useWallet();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchTransactions = async () => {
    setRefreshing(true);
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

  // Format activity for display
  const formatActivity = (activity) => {
    const date = new Date(activity.date);
    return {
      id: activity.id,
      type: activity.type,
      status: activity.status,
      amount: activity.amount,
      formattedDate: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
      }),
      formattedTime: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      ...activity,
    };
  };

  const formattedActivities = (activities || []).map(formatActivity);

  // Filter activities
  const filteredActivities = formattedActivities.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'sent') return a.type === 'send';
    if (filter === 'received') return a.type === 'receive';
    return true;
  });

  useEffect(() => {
    // Only fetch API transactions if needed
    // fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.type === 'send';
    if (filter === 'received') return tx.type === 'receive';
    return true;
  });

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
        {loading ? (
          <View style={styles.transactionsList}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TransactionSkeleton key={i} />
            ))}
          </View>
        ) : filteredActivities.length > 0 ? (
          <View style={styles.transactionsList}>
            {filteredActivities.map((activity) => (
              <TouchableOpacity 
                key={activity.id}
                style={styles.activityItem}
                onPress={() => {
                  if (activity.paymentLink) {
                    navigation.navigate('LinkCreated', {
                      amount: Math.abs(activity.amount),
                      netAmount: activity.netAmount,
                      link: activity.paymentLink,
                      paymentId: activity.paymentId,
                      note: activity.note,
                    });
                  }
                }}
              >
                <View style={styles.activityLeft}>
                  <View style={[styles.activityIcon, { 
                    backgroundColor: activity.type === 'sell' ? '#00C805' : 
                      activity.type === 'buy' ? '#2196F3' : 
                      activity.type === 'send' ? '#FF9500' : '#8E8E93'
                  }]}>
                    <Text style={styles.activityIconText}>
                      {activity.type === 'sell' ? '↓' : activity.type === 'buy' ? '↑' : activity.type === 'send' ? '→' : '↔'}
                    </Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitle, { color: theme.textPrimary }]}>
                      {activity.type === 'sell' ? 'Sold Crypto' : 
                       activity.type === 'buy' ? 'Bought Crypto' : 
                       activity.type === 'send' ? 'Payment Link' : 'Transaction'}
                    </Text>
                    <Text style={[styles.activitySubtitle, { color: theme.textSecondary }]}>
                      {activity.formattedDate} • {activity.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text style={[styles.activityAmount, { 
                    color: activity.amount >= 0 ? '#00C805' : theme.textPrimary 
                  }]}>
                    {activity.amount >= 0 ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
                  </Text>
                  <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                    {activity.formattedTime}
                  </Text>
                </View>
              </TouchableOpacity>
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
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
  },
  skeletonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  skeletonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
