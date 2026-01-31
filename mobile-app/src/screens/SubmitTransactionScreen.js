import { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import payyApi from '../api/payyApi';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { processTransactionWithFee } from '../config/fees';

export default function SubmitTransactionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { wallet, cashBalance, subtractFromCashBalance, addActivity, getUnspentNotes, addNote, spendNote, markNotesPending, unmarkNotesPending } = useWallet();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [paymentLink, setPaymentLink] = useState(null);

  // Convert dollar amount to micro units (6 decimals)
  const dollarToMicro = (dollars) => {
    return Math.floor(parseFloat(dollars) * 1_000_000);
  };

  // Convert micro units to hex (32 bytes)
  const microToHex = (micro) => {
    const hex = micro.toString(16).padStart(64, '0');
    return '0x' + hex;
  };

  // Select notes to spend for a given amount
  const selectNotesForAmount = (targetAmount) => {
    const unspent = getUnspentNotes();
    let selected = [];
    let total = 0;

    // Sort by value descending to minimize number of inputs
    const sorted = [...unspent].sort((a, b) => {
      const aVal = typeof a.value === 'number' ? a.value : parseInt(a.value, 16) || 0;
      const bVal = typeof b.value === 'number' ? b.value : parseInt(b.value, 16) || 0;
      return bVal - aVal;
    });

    for (const n of sorted) {
      if (total >= targetAmount) break;
      const val = typeof n.value === 'number' ? n.value : parseInt(n.value, 16) || 0;
      selected.push(n);
      total += val;
    }

    return { selected, total };
  };

  // Create ZK payment link from cash balance
  const handleCreatePaymentLink = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amountNum > cashBalance) {
      Alert.alert(
        'Insufficient Cash Balance',
        `You need $${amountNum.toFixed(2)} but only have $${cashBalance.toFixed(2)} in cash.`
      );
      return;
    }

    setLoading(true);
    try {
      // Process fee silently
      const result = await processTransactionWithFee({
        amount: amountNum,
        type: 'SEND',
      });

      // Deduct from cash balance
      await subtractFromCashBalance(amountNum);

      // Generate payment link
      const paymentId = Math.random().toString(36).substring(2, 15);
      const link = `https://pay.psi.money/claim/${paymentId}?amount=${Math.round(result.netAmount * 100)}`;
      setPaymentLink(link);

      // Add to activity
      await addActivity({
        type: 'send',
        status: 'Link ready',
        amount: -amountNum,
        netAmount: result.netAmount,
        recipient: recipient || 'Payment Link',
        note: note,
        paymentLink: link,
        paymentId,
      });

      // Navigate to link created screen
      navigation.navigate('LinkCreated', {
        amount: amountNum,
        netAmount: result.netAmount,
        link,
        paymentId,
        note,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create payment link. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const amountMicro = dollarToMicro(amount);

    if (!amount || amountMicro <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    // If no recipient, create a payment link instead
    if (!recipient.trim()) {
      return handleCreatePaymentLink();
    }

    if (!wallet?.privateKey) {
      Alert.alert('No Wallet', 'Please import or create a wallet first');
      return;
    }

    // Check cash balance first
    const amountNum = parseFloat(amount);
    if (amountNum > cashBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You need $${amountNum.toFixed(2)} but only have $${cashBalance.toFixed(2)} available.`
      );
      return;
    }

    // For direct sends, also use cash balance
    return handleCreatePaymentLink();

    setLoading(true);
    const pendingCommitments = inputNotes.slice(0, 2).map(n => n.commitment);
    
    try {
      // Mark notes as pending immediately to prevent double-spend
      await markNotesPending(pendingCommitments);
      
      // Step 1: Get merkle paths for input notes
      setLoadingStatus('Fetching merkle paths...');
      const commitments = inputNotes.map((n) => n.commitment);
      const merkleData = await payyApi.getMerklePathsForNotes(commitments);

      // Check all notes were found
      const notFound = merkleData.paths.filter((p) => !p.found);
      if (notFound.length > 0) {
        throw new Error(
          `Some notes not found in merkle tree. They may not be confirmed yet. Try again in a few seconds.`
        );
      }

      // Step 2: Derive addresses
      setLoadingStatus('Preparing transaction...');
      const myAddressData = await payyApi.deriveAddress(wallet.privateKey);
      const myAddress = myAddressData.address;

      // Normalize recipient ZK address
      let recipientAddress = recipient.trim();
      if (!recipientAddress.startsWith('0x')) {
        recipientAddress = '0x' + recipientAddress;
      }
      // Pad to 66 chars (0x + 64 hex chars) if needed
      if (recipientAddress.length < 66) {
        recipientAddress = '0x' + recipientAddress.slice(2).padStart(64, '0');
      }

      // Step 3: Generate psi values for output notes
      const psi1 = await payyApi.generatePsi();
      const psi2 = await payyApi.generatePsi();

      // Step 4: Build input notes with merkle paths
      const inputs = inputNotes.slice(0, 2).map((n, i) => {
        const pathInfo = merkleData.paths.find((p) => p.commitment === n.commitment);
        return {
          address: n.address,
          psi: n.psi,
          value: typeof n.value === 'number' ? microToHex(n.value) : n.value,
          token: n.token || 'USDC',
          source: n.source || myAddress,
          merkle_path: pathInfo?.path || [],
        };
      });

      // Step 5: Build output notes
      const changeAmount = inputTotal - amountMicro;

      const outputs = [
        {
          address: recipientAddress,
          psi: psi1.psi,
          value: microToHex(amountMicro),
          token: 'USDC',
          source: myAddress,
        },
        {
          address: myAddress,
          psi: psi2.psi,
          value: microToHex(changeAmount),
          token: 'USDC',
          source: myAddress,
        },
      ];

      // Step 6: Build proof request
      const proofRequest = {
        secret_key: wallet.privateKey,
        merkle_root: merkleData.root,
        inputs,
        outputs,
        kind: 'transfer',
      };

      // Step 7: Generate ZK proof
      setLoadingStatus('Generating ZK proof (this may take a minute)...');
      const proofResult = await payyApi.generateTransferProof(proofRequest);

      // Step 8: Submit transaction
      setLoadingStatus('Submitting transaction...');
      const response = await payyApi.submitTransaction({
        snark: proofResult.snark,
      });

      // Step 9: Update local state - mark input notes as spent
      for (const n of inputNotes.slice(0, 2)) {
        await spendNote(n.commitment);
      }

      // Step 10: Add change note to wallet (if any)
      if (changeAmount > 0) {
        // Calculate commitment for change note
        const changeCommitment = await payyApi.calculateCommitment({
          address: myAddress,
          psi: psi2.psi,
          value: microToHex(changeAmount),
          token: 'USDC',
          source: myAddress,
        });

        await addNote({
          address: myAddress,
          psi: psi2.psi,
          value: changeAmount,
          commitment: changeCommitment.commitment,
          token: 'USDC',
          source: myAddress,
        });
      }

      Alert.alert(
        'Payment Sent! 🎉',
        `$${amount} has been sent.\n\nBlock: ${response.height}\nTx: ${response.txn_hash?.slice(0, 16)}...`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Transaction error:', err);

      let errorMessage = 'Transaction failed. Please try again.';

      if (err.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to the Payy node. Make sure the backend is running.';
      } else if (err.response?.data?.error) {
        const errData = err.response.data.error;
        errorMessage = errData.message || errData.reason || JSON.stringify(errData);
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert('Transaction Failed', errorMessage);
      
      // Unmark notes as pending so they can be used again
      await unmarkNotesPending(pendingCommitments);
    } finally {
      setLoading(false);
      setLoadingStatus('');
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
            editable={!loading}
          />
        </View>

        {/* Recipient */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>To</Text>
          <TextInput
            style={styles.textInput}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="Enter recipient ZK address (0x...)"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            editable={!loading}
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
            editable={!loading}
          />
        </View>

        {/* Quick Amounts */}
        <View style={styles.quickAmounts}>
          {['10', '25', '50', '100'].map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => !loading && setAmount(quickAmount)}
              disabled={loading}
            >
              <Text style={styles.quickAmountText}>${quickAmount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading Status */}
        {loading && loadingStatus && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={colors.green} />
            <Text style={styles.loadingText}>{loadingStatus}</Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔒</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Zero-Knowledge Privacy</Text>
            <Text style={styles.infoText}>
              Your transaction is protected by ZK proofs. Only you and the recipient know the
              details.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!amount || !recipient || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!amount || !recipient || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Pay{amount ? ` $${amount}` : ''}</Text>
          )}
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
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
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
    justifyContent: 'center',
    minHeight: 56,
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
