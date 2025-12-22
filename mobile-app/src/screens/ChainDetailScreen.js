import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Share, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import ChainIcon from '../components/ChainIcon';
import { formatAddress } from '../utils/chains';

const CHAIN_CONFIG = {
  btc: {
    name: 'Bitcoin',
    symbol: 'BTC',
    gradient: ['#F7931A', '#E87F17'],
    decimals: 8,
    explorer: 'https://blockstream.info',
  },
  eth: {
    name: 'Ethereum',
    symbol: 'ETH',
    gradient: ['#627EEA', '#454A75'],
    decimals: 18,
    explorer: 'https://etherscan.io',
  },
  sol: {
    name: 'Solana',
    symbol: 'SOL',
    gradient: ['#9945FF', '#14F195'],
    decimals: 9,
    explorer: 'https://solscan.io',
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    gradient: ['#8247E5', '#A379FF'],
    decimals: 18,
    explorer: 'https://polygonscan.com',
  },
};

export default function ChainDetailScreen({ route, navigation }) {
  const { chainId, balance = '0.00', usdValue = '0.00' } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { getChainAddress, hasWallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const chain = CHAIN_CONFIG[chainId] || CHAIN_CONFIG.eth;
  const address = getChainAddress(chainId) || '0x...';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await Share.share({
      message: `Send ${chain.symbol} to my address:\n${address}`,
    });
  };

  const handleSend = () => {
    navigation.navigate('SubmitTransaction', { chainId, chain });
  };

  const handleReceive = () => {
    navigation.navigate('Receive', { chainId });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with gradient */}
        <LinearGradient
          colors={chain.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.chainHeader}>
            <View style={styles.iconLarge}>
              <ChainIcon chainId={chainId} size={48} color="#fff" />
            </View>
            <Text style={styles.chainName}>{chain.name}</Text>
            <Text style={styles.chainSymbol}>{chain.symbol}</Text>
          </View>

          <View style={styles.balanceSection}>
            <Text style={styles.balanceAmount}>{balance}</Text>
            <Text style={styles.balanceSymbol}>{chain.symbol}</Text>
          </View>
          <Text style={styles.balanceUsd}>${usdValue} USD</Text>
        </LinearGradient>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSend}>
            <View style={[styles.actionIconCircle, { backgroundColor: theme.cardBackground }]}>
              <Text style={styles.actionIcon}>↑</Text>
            </View>
            <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleReceive}>
            <View style={[styles.actionIconCircle, { backgroundColor: theme.cardBackground }]}>
              <Text style={styles.actionIcon}>↓</Text>
            </View>
            <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <View style={[styles.actionIconCircle, { backgroundColor: theme.cardBackground }]}>
              <Text style={styles.actionIcon}>↗</Text>
            </View>
            <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Address Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
            Your {chain.name} Address
          </Text>
          <Text style={[styles.addressText, { color: theme.textPrimary }]} selectable>
            {address}
          </Text>
          <TouchableOpacity 
            style={[styles.copyBtn, { backgroundColor: chain.gradient[0] + '20' }]}
            onPress={handleCopy}
          >
            <Text style={[styles.copyBtnText, { color: chain.gradient[0] }]}>
              {copied ? '✓ Copied!' : 'Copy Address'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Recent Transactions
          </Text>
          <View style={styles.emptyTx}>
            <Text style={[styles.emptyTxText, { color: theme.textSecondary }]}>
              No transactions yet
            </Text>
          </View>
        </View>

        {/* Network Info */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Network Info
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Network</Text>
            <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{chain.name} Mainnet</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Decimals</Text>
            <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{chain.decimals}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Explorer</Text>
            <Text style={[styles.infoValue, { color: chain.gradient[0] }]}>{chain.explorer}</Text>
          </View>
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
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  chainHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  iconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  chainName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  chainSymbol: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  balanceSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  balanceUsd: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 24,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 22,
    marginBottom: 16,
  },
  copyBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  copyBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTx: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyTxText: {
    fontSize: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
});
