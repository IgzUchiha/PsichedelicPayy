import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import ChainIcon from '../components/ChainIcon';
import { processTransactionWithFee } from '../config/fees';

const PAYMENT_OPTIONS = [
  { id: 'cash', name: 'Cash', subtitle: 'PSI Rollup Balance', icon: '$', color: '#00C805', limit: 10000 },
  { id: 'usdc', name: 'USDC', subtitle: 'USD Coin', icon: '$', color: '#2775CA', limit: 50000 },
  { id: 'usdt', name: 'USDT', subtitle: 'Tether', icon: '₮', color: '#26A17B', limit: 50000 },
];

export default function BuyScreen({ route, navigation }) {
  const { chainId = 'ethereum', chainName = 'Ethereum', chainSymbol = 'ETH' } = route.params || {};
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { cashBalance, subtractFromCashBalance, addActivity } = useWallet();
  
  const [amount, setAmount] = useState('0');
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_OPTIONS[0]);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleNumberPress = (num) => {
    if (num === '.' && amount.includes('.')) return;
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    if (amount.length <= 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleBuyMax = () => {
    setAmount(selectedPayment.limit.toString());
  };

  const formatAmount = (value) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString();
  };

  // Mock crypto conversion (would use real price in production)
  const cryptoAmount = (parseFloat(amount) || 0) / 2700; // Approximate ETH price

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.orderType, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.orderTypeText, { color: theme.textPrimary }]}>One-time order</Text>
          <Text style={[styles.orderTypeArrow, { color: theme.textSecondary }]}>▼</Text>
        </TouchableOpacity>
        <View style={{ width: 44 }} />
      </View>

      {/* Amount Display */}
      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={[styles.amountValue, { color: theme.textPrimary }]}>
            {formatAmount(amount)}
          </Text>
          <Text style={[styles.amountCurrency, { color: theme.textSecondary }]}>USD</Text>
        </View>
        <TouchableOpacity style={styles.cryptoAmount}>
          <Text style={[styles.cryptoIcon, { color: '#2196F3' }]}>↕</Text>
          <Text style={[styles.cryptoText, { color: '#2196F3' }]}>
            {cryptoAmount.toFixed(6)} {chainSymbol}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Method */}
      <View style={styles.optionsSection}>
        <TouchableOpacity 
          style={[styles.optionRow, { backgroundColor: theme.cardBackground }]}
          onPress={() => setShowPaymentPicker(!showPaymentPicker)}
        >
          <View style={[styles.optionIcon, { backgroundColor: selectedPayment.color }]}>
            <Text style={styles.optionIconText}>{selectedPayment.icon}</Text>
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>Pay with</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>
              {selectedPayment.name} • {selectedPayment.subtitle}
            </Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={[styles.optionLimit, { color: theme.textPrimary }]}>
              ${selectedPayment.limit.toLocaleString()}
            </Text>
            <Text style={[styles.optionLimitLabel, { color: theme.textSecondary }]}>Limit</Text>
          </View>
          <Text style={[styles.optionArrow, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>

        {/* Payment Picker */}
        {showPaymentPicker && (
          <View style={[styles.paymentPicker, { backgroundColor: theme.cardBackground }]}>
            {PAYMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.paymentOption,
                  selectedPayment.id === option.id && styles.paymentOptionSelected,
                ]}
                onPress={() => {
                  setSelectedPayment(option);
                  setShowPaymentPicker(false);
                }}
              >
                <View style={[styles.paymentOptionIcon, { backgroundColor: option.color }]}>
                  <Text style={styles.paymentOptionIconText}>{option.icon}</Text>
                </View>
                <View style={styles.paymentOptionInfo}>
                  <Text style={[styles.paymentOptionName, { color: theme.textPrimary }]}>
                    {option.name}
                  </Text>
                  <Text style={[styles.paymentOptionSubtitle, { color: theme.textSecondary }]}>
                    {option.subtitle}
                  </Text>
                </View>
                {selectedPayment.id === option.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Buy Crypto */}
        <TouchableOpacity style={[styles.optionRow, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.optionIconChain, { backgroundColor: theme.background }]}>
            <ChainIcon chainId={chainId} size={24} color={theme.textPrimary} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>Buy</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>{chainName}</Text>
          </View>
          <Text style={[styles.optionArrow, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Buy Max Button */}
      <TouchableOpacity 
        style={[styles.buyMaxButton, { backgroundColor: theme.cardBackground }]}
        onPress={handleBuyMax}
      >
        <Text style={[styles.buyMaxText, { color: theme.textPrimary }]}>Buy maximum amount</Text>
      </TouchableOpacity>

      {/* Numpad */}
      <View style={styles.numpad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←'].map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.numpadKey}
            onPress={() => key === '←' ? handleBackspace() : handleNumberPress(key)}
          >
            <Text style={[styles.numpadKeyText, { color: theme.textPrimary }]}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Review Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[
            styles.reviewButton,
            parseFloat(amount) > 0 && !processing ? styles.reviewButtonActive : { backgroundColor: theme.cardBackground }
          ]}
          disabled={parseFloat(amount) <= 0 || processing}
          onPress={handleReviewOrder}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.reviewButtonText,
              { color: parseFloat(amount) > 0 ? '#fff' : theme.textSecondary }
            ]}>
              Review order
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  async function handleReviewOrder() {
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) return;
    
    // Check if using cash and have enough balance
    if (selectedPayment.id === 'cash' && amountNum > cashBalance) {
      Alert.alert('Insufficient Cash', `You only have $${cashBalance.toFixed(2)} in cash.`);
      return;
    }

    if (amountNum > selectedPayment.limit) {
      Alert.alert('Limit Exceeded', `Maximum purchase limit is $${selectedPayment.limit.toLocaleString()}.`);
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Buy $${amountNum.toFixed(2)} of ${chainName} using ${selectedPayment.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setProcessing(true);
            try {
              // Process with fee (fee is handled silently)
              const result = await processTransactionWithFee({
                amount: amountNum,
                type: 'BUY',
                fromAsset: selectedPayment.id,
                toChain: chainId,
              });

              if (result.success) {
                // Deduct from cash balance if using cash
                if (selectedPayment.id === 'cash') {
                  await subtractFromCashBalance(amountNum);
                }

                const cryptoAmount = (result.netAmount / 2700).toFixed(6); // Mock conversion
                
                // Add to activity
                await addActivity({
                  type: 'buy',
                  status: 'Completed',
                  amount: -amountNum,
                  cryptoAmount,
                  cryptoSymbol: chainSymbol,
                  chainId,
                  chainName,
                  paymentMethod: selectedPayment.name,
                });

                Alert.alert(
                  'Purchase Complete!',
                  `You bought ${cryptoAmount} ${chainSymbol} for $${amountNum.toFixed(2)}.\n\nYour crypto has been added to your wallet.`,
                  [{ text: 'Done', onPress: () => navigation.goBack() }]
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to process purchase. Please try again.');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
    fontWeight: '300',
  },
  orderType: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  orderTypeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  orderTypeArrow: {
    fontSize: 10,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountValue: {
    fontSize: 64,
    fontWeight: '300',
  },
  amountCurrency: {
    fontSize: 48,
    fontWeight: '300',
    marginLeft: 8,
  },
  cryptoAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  cryptoIcon: {
    fontSize: 16,
  },
  cryptoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsSection: {
    paddingHorizontal: 20,
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIconText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  optionIconChain: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionValue: {
    fontSize: 14,
    marginTop: 2,
  },
  optionRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  optionLimit: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionLimitLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  optionArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  paymentPicker: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: -4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  paymentOptionSelected: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  paymentOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentOptionIconText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionName: {
    fontSize: 15,
    fontWeight: '600',
  },
  paymentOptionSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  checkmark: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: '600',
  },
  buyMaxButton: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  buyMaxText: {
    fontSize: 16,
    fontWeight: '600',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 24,
  },
  numpadKey: {
    width: '33.33%',
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadKeyText: {
    fontSize: 32,
    fontWeight: '300',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  reviewButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  reviewButtonActive: {
    backgroundColor: '#2196F3',
  },
  reviewButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
