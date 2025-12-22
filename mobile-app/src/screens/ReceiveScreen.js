import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Share, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import colors from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { CHAINS, formatAddress } from '../utils/chains';
import payyApi from '../api/payyApi';

const CHAIN_LIST = [
  { id: 'eth', ...CHAINS.ETH },
  { id: 'btc', ...CHAINS.BTC },
  { id: 'sol', ...CHAINS.SOL },
  { id: 'polygon', ...CHAINS.POLYGON },
];

export default function ReceiveScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { wallet, hasWallet, activeChain, switchChain, getChainAddress } = useWallet();
  const [selectedChain, setSelectedChain] = useState(activeChain || 'eth');
  const [zkAddress, setZkAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Derive ZK address for the ZK rollup (used alongside chain addresses)
  useEffect(() => {
    const deriveZkAddress = async () => {
      if (wallet?.privateKey) {
        try {
          const result = await payyApi.deriveAddress(wallet.privateKey);
          setZkAddress(result.address);
        } catch (err) {
          console.error('Error deriving ZK address:', err);
        }
      }
      setLoading(false);
    };
    deriveZkAddress();
  }, [wallet?.privateKey]);

  const handleChainSelect = async (chainId) => {
    setSelectedChain(chainId);
    await switchChain(chainId);
  };

  // Get the appropriate address based on selected chain
  const getDisplayAddress = () => {
    if (selectedChain === 'zk') return zkAddress;
    return getChainAddress(selectedChain);
  };

  const walletAddress = getDisplayAddress() || '0x...';
  const selectedChainInfo = CHAIN_LIST.find(c => c.id === selectedChain) || CHAIN_LIST[0];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Send ${selectedChainInfo.symbol} to my address:\n${walletAddress}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receive</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Chain Selector */}
        <View style={styles.chainSelector}>
          <Text style={styles.sectionLabel}>Select Network</Text>
          <View style={styles.chainGrid}>
            {CHAIN_LIST.map((chain) => (
              <TouchableOpacity
                key={chain.id}
                style={[
                  styles.chainButton,
                  selectedChain === chain.id && { borderColor: chain.color, borderWidth: 2 }
                ]}
                onPress={() => handleChainSelect(chain.id)}
              >
                <Text style={styles.chainIcon}>{chain.icon}</Text>
                <Text style={styles.chainName}>{chain.symbol}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* QR Code Placeholder */}
        <View style={styles.qrContainer}>
          <View style={[styles.qrCode, { borderColor: selectedChainInfo.color }]}>
            <Text style={styles.qrIcon}>{selectedChainInfo.icon}</Text>
            <Text style={styles.qrPlaceholder}>QR</Text>
          </View>
          <Text style={styles.qrHint}>Scan to receive {selectedChainInfo.symbol}</Text>
        </View>

        {/* Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={[styles.chainBadge, { backgroundColor: selectedChainInfo.color }]}>
              {selectedChainInfo.symbol}
            </Text>
            <Text style={styles.addressLabel}>{selectedChainInfo.name} Address</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={colors.green} />
          ) : (
            <Text style={styles.address} selectable>{formatAddress(walletAddress, 10)}</Text>
          )}
          <Text style={styles.fullAddress} selectable numberOfLines={2}>
            {walletAddress}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <Text style={styles.actionIcon}>{copied ? '✓' : '📋'}</Text>
            <Text style={styles.actionText}>{copied ? 'Copied!' : 'Copy'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Chain-specific Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>{selectedChainInfo.icon}</Text>
          <Text style={styles.infoText}>
            {selectedChain === 'btc' && 'Send Bitcoin to this address. Transactions typically confirm in 10-60 minutes.'}
            {selectedChain === 'eth' && 'Send ETH or ERC-20 tokens to this address on Ethereum mainnet.'}
            {selectedChain === 'sol' && 'Send SOL or SPL tokens to this address on Solana.'}
            {selectedChain === 'polygon' && 'Send MATIC or tokens on Polygon network. Fast and low fees!'}
          </Text>
        </View>

        {/* ZK Address Info */}
        {zkAddress && (
          <View style={[styles.infoCard, styles.zkCard]}>
            <Text style={styles.infoIcon}>🔒</Text>
            <View style={styles.zkInfo}>
              <Text style={styles.zkLabel}>ZK Rollup Address</Text>
              <Text style={styles.zkAddress}>{formatAddress(zkAddress, 8)}</Text>
              <Text style={styles.infoText}>
                For private transactions with zero-knowledge proofs
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
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
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: colors.textSecondary,
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
  chainSelector: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  chainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chainButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chainIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  chainName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCode: {
    width: 180,
    height: 180,
    backgroundColor: colors.textPrimary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
  },
  qrIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  qrPlaceholder: {
    fontSize: 36,
    color: colors.background,
    fontWeight: '700',
  },
  qrHint: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addressCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chainBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    overflow: 'hidden',
  },
  addressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  address: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  fullAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  zkCard: {
    backgroundColor: colors.surfaceLight,
  },
  zkInfo: {
    flex: 1,
  },
  zkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  zkAddress: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.green,
    marginBottom: 8,
  },
});
