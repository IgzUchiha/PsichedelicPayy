import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useWallet } from '../context/WalletContext';

export default function ImportWalletScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { importWallet } = useWallet();
  const [privateKey, setPrivateKey] = useState('');
  const [walletName, setWalletName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleImport = async () => {
    if (!privateKey.trim()) {
      Alert.alert('Error', 'Please enter your private key');
      return;
    }

    setLoading(true);
    const result = await importWallet(privateKey, walletName || 'My Wallet');
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Wallet Imported! 🎉',
        `Your wallet has been imported successfully.\n\nAddress: ${result.address.slice(0, 10)}...${result.address.slice(-8)}`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Import Failed', result.error || 'Could not import wallet. Please check your private key.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔑</Text>
        </View>

        <Text style={styles.title}>Import Existing Wallet</Text>
        <Text style={styles.subtitle}>
          Enter your private key to restore your wallet and access your funds.
        </Text>

        {/* Wallet Name */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Wallet Name (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={walletName}
            onChangeText={setWalletName}
            placeholder="My Wallet"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Private Key */}
        <View style={styles.inputSection}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Private Key</Text>
            <TouchableOpacity onPress={() => setShowKey(!showKey)}>
              <Text style={styles.toggleText}>{showKey ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.textInput, styles.keyInput]}
            value={privateKey}
            onChangeText={setPrivateKey}
            placeholder="Enter your private key (hex or base64)"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
            multiline={showKey}
          />
        </View>

        {/* Supported Formats */}
        <View style={styles.formatsCard}>
          <Text style={styles.formatsTitle}>Supported Formats</Text>
          <Text style={styles.formatItem}>• Hex (64 characters): 0x1234...abcd</Text>
          <Text style={styles.formatItem}>• Base64 (44 characters): ABC123...xyz=</Text>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Keep Your Key Safe</Text>
            <Text style={styles.warningText}>
              Your private key is stored securely on this device. Never share it with anyone.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Import Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.importButton, (!privateKey.trim() || loading) && styles.importButtonDisabled]}
          onPress={handleImport}
          disabled={!privateKey.trim() || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.importButtonText}>
            {loading ? 'Importing...' : 'Import Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  toggleText: {
    fontSize: 14,
    color: colors.green,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  keyInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formatsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formatsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  formatItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.red,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  importButton: {
    backgroundColor: colors.green,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  importButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  importButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
  },
});
