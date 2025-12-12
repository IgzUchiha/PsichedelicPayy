import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import payyApi from '../api/payyApi';

function BlockItem({ height, hash, rootHash, txCount, timestamp }) {
  return (
    <TouchableOpacity style={styles.blockItem} activeOpacity={0.7}>
      <View style={styles.blockHeader}>
        <View style={styles.blockNumber}>
          <Text style={styles.blockNumberText}>#{height}</Text>
        </View>
        <Text style={styles.blockTime}>{timestamp}</Text>
      </View>
      <View style={styles.blockDetails}>
        <View style={styles.blockRow}>
          <Text style={styles.blockLabel}>Hash</Text>
          <Text style={styles.blockValue} numberOfLines={1}>{hash}</Text>
        </View>
        <View style={styles.blockRow}>
          <Text style={styles.blockLabel}>Transactions</Text>
          <Text style={styles.blockValueHighlight}>{txCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BlocksScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [blocks, setBlocks] = useState([]);

  const fetchBlocks = async () => {
    try {
      const response = await payyApi.listBlocks(20, 0);
      if (Array.isArray(response)) {
        setBlocks(response);
      } else if (response.blocks) {
        setBlocks(response.blocks);
      } else {
        setBlocks([]);
      }
    } catch (err) {
      console.error('Error fetching blocks:', err);
      setBlocks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlocks();
  };

  // Format blocks for display
  const displayBlocks = blocks.map(b => ({
    height: b.height,
    hash: b.hash ? `${b.hash.slice(0, 6)}...${b.hash.slice(-4)}` : 'N/A',
    rootHash: b.root_hash ? `${b.root_hash.slice(0, 6)}...${b.root_hash.slice(-4)}` : 'N/A',
    txCount: b.transaction_count || b.txns?.length || 0,
    timestamp: b.timestamp ? new Date(b.timestamp * 1000).toLocaleTimeString() : 'Recent',
  }));

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingText}>Loading blocks...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blocks</Text>
        <Text style={styles.headerSubtitle}>ZK Rollup Chain Explorer</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{displayBlocks[0]?.height ?? '—'}</Text>
          <Text style={styles.statLabel}>Latest Block</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{blocks.length}</Text>
          <Text style={styles.statLabel}>Total Blocks</Text>
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
        <Text style={styles.sectionTitle}>Recent Blocks</Text>
        
        {displayBlocks.length > 0 ? (
          <View style={styles.blocksList}>
            {displayBlocks.map((block, index) => (
              <BlockItem
                key={block.height || index}
                height={block.height}
                hash={block.hash}
                rootHash={block.rootHash}
                txCount={block.txCount}
                timestamp={block.timestamp}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⬡</Text>
            <Text style={styles.emptyTitle}>No Blocks Yet</Text>
            <Text style={styles.emptyText}>
              The chain is at genesis state. Blocks will appear here as transactions are processed.
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.green,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  blocksList: {
    paddingHorizontal: 20,
  },
  blockItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  blockNumber: {
    backgroundColor: colors.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  blockNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  blockTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  blockDetails: {
    gap: 8,
  },
  blockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  blockValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  blockValueHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.green,
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
