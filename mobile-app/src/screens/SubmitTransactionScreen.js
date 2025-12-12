import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import payyApi from '../api/payyApi';

export default function SubmitTransactionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await payyApi.submitTransaction({
        snark: {
          V1: {
            instances: [],
            proof: Buffer.from('demo_proof_data').toString('base64'),
          }
        }
      });

      Alert.alert(
        'Payment Sent! 🎉',
        `Your payment of $${amount} has been submitted.`,
        [
          { text: 'Done', onPress: () => navigation.goBack() },
        ]
      );
    } catch (err) {
      Alert.alert('Demo Mode', 'Real transactions require ZK proof generation. This is a UI demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Payment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Recipient */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>To</Text>
          <TextInput
            style={styles.textInput}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="Enter address or username"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
        </View>

        {/* Note */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Note (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={note}
            onChangeText={setNote}
            placeholder="What's this for?"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Quick Amounts */}
        <View style={styles.quickAmounts}>
          {['10', '25', '50', '100'].map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => setAmount(quickAmount)}
            >
              <Text style={styles.quickAmountText}>${quickAmount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔒</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Zero-Knowledge Privacy</Text>
            <Text style={styles.infoText}>
              Your transaction is protected by ZK proofs. Only you and the recipient know the details.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.submitButton, (!amount || loading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!amount || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Sending...' : `Pay${amount ? ` $${amount}` : ''}`}
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
  scrollView: {
    flex: 1,
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
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.textPrimary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 100,
    textAlign: 'center',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    fontSize: 17,
    color: colors.textPrimary,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickAmountButton: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickAmountText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  submitButton: {
    backgroundColor: colors.green,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
  },
});
