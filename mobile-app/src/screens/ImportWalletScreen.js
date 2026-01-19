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
  const { importWallet, importFromMnemonic } = useWallet();
  const [importType, setImportType] = useState('seed'); // 'seed' or 'key'
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [walletName, setWalletName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    
    let result;
    if (importType === 'seed') {
      if (!seedPhrase.trim()) {
        Alert.alert('Error', 'Please enter your seed phrase');
        setLoading(false);
        return;
      }
      result = await importFromMnemonic(seedPhrase, walletName || 'My Wallet');
    } else {
      if (!privateKey.trim()) {
        Alert.alert('Error', 'Please enter your private key');
        setLoading(false);
        return;
      }
      result = await importWallet(privateKey, walletName || 'My Wallet');
    }
    
    setLoading(false);

    if (result.success) {
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else {
      Alert.alert(
        'Import Failed', 
        result.error || `Could not import wallet. Please check your ${importType === 'seed' ? 'seed phrase' : 'private key'}.`
      );
    }
  };

  const isValid = importType === 'seed' ? seedPhrase.trim().split(/\s+/).length >= 12 : privateKey.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import Wallet</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        <Text style={styles.title}>Restore Your Wallet</Text>
        <Text style={styles.subtitle}>
          Import your existing wallet using your seed phrase or private key.
        </Text>

        {/* Import Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, importType === 'seed' && styles.toggleButtonActive]}
            onPress={() => setImportType('seed')}
          >
            <Text style={[styles.toggleText, importType === 'seed' && styles.toggleTextActive]}>
              Seed Phrase
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, importType === 'key' && styles.toggleButtonActive]}
            onPress={() => setImportType('key')}
          >
            <Text style={[styles.toggleText, importType === 'key' && styles.toggleTextActive]}>
              Private Key
            </Text>
          </TouchableOpacity>
        </View>

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

        {/* Seed Phrase Input */}
        {importType === 'seed' && (
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Seed Phrase (12 or 24 words)</Text>
              <TouchableOpacity onPress={() => setShowInput(!showInput)}>
                <Text style={styles.toggleShowText}>{showInput ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.textInput, styles.seedInput]}
              value={seedPhrase}
              onChangeText={setSeedPhrase}
              placeholder="Enter your seed phrase, words separated by spaces"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showInput}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
            />
            <Text style={styles.wordCount}>
              {seedPhrase.trim() ? seedPhrase.trim().split(/\s+/).length : 0} words
            </Text>
          </View>
        )}

        {/* Private Key Input */}
        {importType === 'key' && (
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Private Key</Text>
              <TouchableOpacity onPress={() => setShowInput(!showInput)}>
                <Text style={styles.toggleShowText}>{showInput ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.textInput, styles.keyInput]}
              value={privateKey}
              onChangeText={setPrivateKey}
              placeholder="Enter your private key (0x...)"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showInput}
              autoCapitalize="none"
              autoCorrect={false}
              multiline={showInput}
            />
          </View>
        )}

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>🔒</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Non-Custodial Wallet</Text>
            <Text style={styles.warningText}>
              Your keys are stored securely on this device only. We never have access to your funds.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Import Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.importButton, (!isValid || loading) && styles.importButtonDisabled]}
          onPress={handleImport}
          disabled={!isValid || loading}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
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
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.green,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.background,
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
  toggleShowText: {
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
  seedInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  keyInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  wordCount: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'right',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.green,
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
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
  importButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
  },
});
