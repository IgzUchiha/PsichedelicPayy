import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import colors from '../theme/colors';
import { useWallet } from '../context/WalletContext';

export default function CreateWalletScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { createWallet } = useWallet();
  const [step, setStep] = useState(1); // 1: generating, 2: show seed, 3: confirm
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    generateWallet();
  }, []);

  const generateWallet = async () => {
    setLoading(true);
    const result = await createWallet('My Wallet');
    if (result.success) {
      setMnemonic(result.mnemonic);
      setStep(2);
    } else {
      Alert.alert('Error', 'Failed to create wallet. Please try again.');
      navigation.goBack();
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(mnemonic);
    Alert.alert('Copied!', 'Seed phrase copied to clipboard. Store it safely!');
  };

  const handleContinue = () => {
    if (!confirmed) {
      Alert.alert(
        'Important!',
        'Please confirm that you have saved your seed phrase. You will need it to recover your wallet.',
        [
          { text: 'Go Back', style: 'cancel' },
          { text: 'I Saved It', onPress: () => setConfirmed(true) },
        ]
      );
      return;
    }
    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const words = mnemonic.split(' ');

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingText}>Creating your wallet...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Seed Phrase</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Write This Down!</Text>
          <Text style={styles.warningText}>
            This 12-word phrase is the ONLY way to recover your wallet. Store it somewhere safe and never share it with anyone.
          </Text>
        </View>

        {/* Seed Phrase Grid */}
        <View style={styles.seedContainer}>
          <View style={styles.seedGrid}>
            {words.map((word, index) => (
              <View key={index} style={styles.wordItem}>
                <Text style={styles.wordNumber}>{index + 1}</Text>
                <Text style={styles.wordText}>{word}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Copy Button */}
        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <Text style={styles.copyButtonText}>📋 Copy to Clipboard</Text>
        </TouchableOpacity>

        {/* Confirmation Checkbox */}
        <TouchableOpacity
          style={styles.confirmRow}
          onPress={() => setConfirmed(!confirmed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
            {confirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.confirmText}>
            I have saved my seed phrase in a secure location
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !confirmed && styles.continueButtonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue to Wallet</Text>
        </TouchableOpacity>
      </View>
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
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
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
  warningCard: {
    backgroundColor: '#3D2E00',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD60A',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#FFD60A',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
  seedContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  wordNumber: {
    fontSize: 12,
    color: colors.textMuted,
    width: 20,
  },
  wordText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  copyButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkmark: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  continueButton: {
    backgroundColor: colors.green,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
  },
});
