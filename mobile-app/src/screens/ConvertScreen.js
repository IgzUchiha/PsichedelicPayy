import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import ChainIcon from '../components/ChainIcon';
import { processTransactionWithFee } from '../config/fees';

const AVAILABLE_CHAINS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
  { id: 'polygon', name: 'Polygon', symbol: 'POL', color: '#8247E5' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', color: '#28A0F0' },
  { id: 'optimism', name: 'Optimism', symbol: 'OP', color: '#FF0420' },
  { id: 'base', name: 'Base', symbol: 'ETH', color: '#0052FF' },
  { id: 'bsc', name: 'BNB Chain', symbol: 'BNB', color: '#F0B90B' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', color: '#E84142' },
];

export default function ConvertScreen({ route, navigation }) {
  const { chainId = 'ethereum' } = route.params || {};
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { networkBalances = [] } = useWallet();
  
  const [amount, setAmount] = useState('0');
  const [fromChain, setFromChain] = useState(AVAILABLE_CHAINS.find(c => c.id === chainId) || AVAILABLE_CHAINS[0]);
  const [toChain, setToChain] = useState(AVAILABLE_CHAINS.find(c => c.id !== chainId) || AVAILABLE_CHAINS[1]);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Get user's balance for the from chain
  const chainBalance = networkBalances.find(b => b.id === fromChain.id);
  const availableBalance = chainBalance?.balance || 0;
  const fromPrice = chainBalance?.price || 0;

  // Get to chain price
  const toChainBalance = networkBalances.find(b => b.id === toChain.id);
  const toPrice = toChainBalance?.price || 0;

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

  const handleConvertMax = () => {
    setAmount(availableBalance.toFixed(6));
  };

  const handleSwap = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
    setAmount('0');
  };

  const formatAmount = (value) => {
    const num = parseFloat(value) || 0;
    if (num < 0.001 && num > 0) return num.toFixed(6);
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  // Calculate conversion
  const fromAmountNum = parseFloat(amount) || 0;
  const fromUsdValue = fromAmountNum * fromPrice;
  const toAmount = toPrice > 0 ? fromUsdValue / toPrice : 0;

  const renderChainPicker = (chains, selectedChain, onSelect, onClose, excludeId) => (
    <View style={[styles.picker, { backgroundColor: theme.cardBackground }]}>
      <ScrollView style={{ maxHeight: 300 }}>
        {chains.filter(c => c.id !== excludeId).map((chain) => (
          <TouchableOpacity
            key={chain.id}
            style={[
              styles.pickerOption,
              selectedChain.id === chain.id && styles.pickerOptionSelected,
            ]}
            onPress={() => {
              onSelect(chain);
              onClose();
            }}
          >
            <View style={[styles.pickerOptionIconContainer, { backgroundColor: theme.background }]}>
              <ChainIcon chainId={chain.id} size={24} />
            </View>
            <View style={styles.pickerOptionInfo}>
              <Text style={[styles.pickerOptionName, { color: theme.textPrimary }]}>
                {chain.name}
              </Text>
              <Text style={[styles.pickerOptionSubtitle, { color: theme.textSecondary }]}>
                {chain.symbol}
              </Text>
            </View>
            {selectedChain.id === chain.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Convert</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Amount Display */}
      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={[styles.amountValue, { color: theme.textPrimary }]}>
            {formatAmount(amount)}
          </Text>
          <Text style={[styles.amountCurrency, { color: theme.textSecondary }]}>{fromChain.symbol}</Text>
        </View>
        <Text style={[styles.usdValue, { color: theme.textSecondary }]}>
          ≈ ${fromUsdValue.toFixed(2)} USD
        </Text>
      </View>

      {/* Conversion Options */}
      <View style={styles.optionsSection}>
        {/* From Chain */}
        <TouchableOpacity 
          style={[styles.optionRow, { backgroundColor: theme.cardBackground }]}
          onPress={() => {
            setShowFromPicker(!showFromPicker);
            setShowToPicker(false);
          }}
        >
          <View style={[styles.optionIconChain, { backgroundColor: theme.background }]}>
            <ChainIcon chainId={fromChain.id} size={24} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>From</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>{fromChain.name}</Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={[styles.optionBalance, { color: theme.textPrimary }]}>
              {availableBalance.toFixed(4)} {fromChain.symbol}
            </Text>
            <Text style={[styles.optionBalanceLabel, { color: theme.textSecondary }]}>Available</Text>
          </View>
          <Text style={[styles.optionArrow, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>

        {showFromPicker && renderChainPicker(
          AVAILABLE_CHAINS, 
          fromChain, 
          setFromChain, 
          () => setShowFromPicker(false),
          toChain.id
        )}

        {/* Swap Button */}
        <View style={styles.swapContainer}>
          <View style={[styles.swapLine, { backgroundColor: theme.textSecondary }]} />
          <TouchableOpacity 
            style={[styles.swapButton, { backgroundColor: theme.cardBackground, borderColor: theme.background }]}
            onPress={handleSwap}
          >
            <Text style={[styles.swapIcon, { color: theme.textPrimary }]}>⇅</Text>
          </TouchableOpacity>
          <View style={[styles.swapLine, { backgroundColor: theme.textSecondary }]} />
        </View>

        {/* To Chain */}
        <TouchableOpacity 
          style={[styles.optionRow, { backgroundColor: theme.cardBackground }]}
          onPress={() => {
            setShowToPicker(!showToPicker);
            setShowFromPicker(false);
          }}
        >
          <View style={[styles.optionIconChain, { backgroundColor: theme.background }]}>
            <ChainIcon chainId={toChain.id} size={24} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>To</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>{toChain.name}</Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={[styles.optionBalance, { color: theme.textPrimary }]}>
              ≈ {toAmount.toFixed(4)} {toChain.symbol}
            </Text>
            <Text style={[styles.optionBalanceLabel, { color: theme.textSecondary }]}>You'll receive</Text>
          </View>
          <Text style={[styles.optionArrow, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>

        {showToPicker && renderChainPicker(
          AVAILABLE_CHAINS, 
          toChain, 
          setToChain, 
          () => setShowToPicker(false),
          fromChain.id
        )}
      </View>

      {/* Convert Max Button */}
      <TouchableOpacity 
        style={[styles.convertMaxButton, { backgroundColor: theme.cardBackground }]}
        onPress={handleConvertMax}
      >
        <Text style={[styles.convertMaxText, { color: theme.textPrimary }]}>Convert max</Text>
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
            fromAmountNum > 0 && fromAmountNum <= availableBalance && !processing
              ? styles.reviewButtonActive 
              : { backgroundColor: theme.cardBackground }
          ]}
          disabled={fromAmountNum <= 0 || fromAmountNum > availableBalance || processing}
          onPress={handleReviewConversion}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.reviewButtonText,
              { color: fromAmountNum > 0 && fromAmountNum <= availableBalance ? '#fff' : theme.textSecondary }
            ]}>
              Review conversion
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  async function handleReviewConversion() {
    if (fromAmountNum <= 0 || fromAmountNum > availableBalance) return;

    Alert.alert(
      'Confirm Conversion',
      `Convert ${fromAmountNum.toFixed(4)} ${fromChain.symbol} to ~${toAmount.toFixed(4)} ${toChain.symbol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setProcessing(true);
            try {
              // Process with fee (fee is handled silently as spread)
              const result = await processTransactionWithFee({
                amount: fromUsdValue,
                type: 'CONVERT',
                fromChain: fromChain.id,
                toChain: toChain.id,
              });

              if (result.success) {
                const actualToAmount = toPrice > 0 ? result.netAmount / toPrice : 0;
                Alert.alert(
                  'Conversion Complete!',
                  `You converted ${fromAmountNum.toFixed(4)} ${fromChain.symbol} to ${actualToAmount.toFixed(4)} ${toChain.symbol}.`,
                  [{ text: 'Done', onPress: () => navigation.goBack() }]
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to process conversion. Please try again.');
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountValue: {
    fontSize: 56,
    fontWeight: '300',
  },
  amountCurrency: {
    fontSize: 40,
    fontWeight: '300',
    marginLeft: 8,
  },
  usdValue: {
    fontSize: 16,
    marginTop: 8,
  },
  optionsSection: {
    paddingHorizontal: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
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
  optionBalance: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionBalanceLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  optionArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  swapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  swapLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    borderWidth: 3,
  },
  swapIcon: {
    fontSize: 18,
  },
  picker: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  pickerOptionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickerOptionInfo: {
    flex: 1,
  },
  pickerOptionName: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickerOptionSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  checkmark: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: '600',
  },
  convertMaxButton: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  convertMaxText: {
    fontSize: 16,
    fontWeight: '600',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 16,
  },
  numpadKey: {
    width: '33.33%',
    aspectRatio: 2.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadKeyText: {
    fontSize: 28,
    fontWeight: '300',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
