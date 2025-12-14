import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import payyApi from '../api/payyApi';

export default function ReceiveScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { wallet, hasWallet } = useWallet();
  const [zkAddress, setZkAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Derive ZK address from private key
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
  
  // Use ZK address for receiving payments
  const walletAddress = zkAddress || wallet?.address || '0x...';
  const shortAddress = walletAddress.length > 20 
    ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`
    : walletAddress;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Send payments to my Payy address:\n${walletAddress}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopy = () => {
    // In production, use Clipboard API
    alert('Address copied to clipboard!');
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

      <View style={styles.content}>
        {/* QR Code Placeholder */}
        <View style={styles.qrContainer}>
          <View style={styles.qrCode}>
            <Text style={styles.qrPlaceholder}>QR</Text>
          </View>
          <Text style={styles.qrHint}>Scan to pay</Text>
        </View>

        {/* Address */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Your ZK Address</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.green} />
          ) : (
            <Text style={styles.address}>{shortAddress}</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoText}>
            This is your ZK address (derived from your private key). Share it to receive payments. Your transaction details remain private with ZK proofs.
          </Text>
        </View>
        
        {/* Private Key Info */}
        {wallet?.privateKey && (
          <View style={[styles.infoCard, { marginTop: 12 }]}>
            <Text style={styles.infoIcon}>🔑</Text>
            <Text style={styles.infoText}>
              To send to someone, you need their ZK address or private key. They can find their ZK address on this screen.
            </Text>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: colors.textPrimary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrPlaceholder: {
    fontSize: 48,
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
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
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
    width: '100%',
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
});
