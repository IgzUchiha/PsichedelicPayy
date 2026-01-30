import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import ChainIcon from '../components/ChainIcon';

const RECEIVE_OPTIONS = [
  { id: 'usd', name: 'US Dollar', subtitle: 'Cash (USD)', icon: '$', color: '#00C805' },
  { id: 'usdc', name: 'USDC', subtitle: 'USD Coin', icon: '$', color: '#2775CA' },
  { id: 'usdt', name: 'USDT', subtitle: 'Tether', icon: '₮', color: '#26A17B' },
];

export default function SellScreen({ route, navigation }) {
  const { chainId = 'ethereum', chainName = 'Ethereum', chainSymbol = 'ETH' } = route.params || {};
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { networkBalances = [] } = useWallet();
  
  const [amount, setAmount] = useState('0');
  const [selectedReceive, setSelectedReceive] = useState(RECEIVE_OPTIONS[0]);
  const [showReceivePicker, setShowReceivePicker] = useState(false);

  // Get user's balance for this chain
  const chainBalance = networkBalances.find(b => b.id === chainId);
  const availableBalance = chainBalance?.balance || 0;
  const availableUsd = chainBalance?.usdValue || 0;

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

  const handleSellAll = () => {
    setAmount(availableUsd.toFixed(2));
  };

  const formatAmount = (value) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString();
  };

  // Mock crypto conversion (would use real price in production)
  const currentPrice = chainBalance?.price || 2700;
  const cryptoAmount = (parseFloat(amount) || 0) / currentPrice;

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

      {/* Options Section */}
      <View style={styles.optionsSection}>
        {/* Sell From */}
        <TouchableOpacity style={[styles.optionRow, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.optionIconChain, { backgroundColor: theme.background }]}>
            <ChainIcon chainId={chainId} size={24} color={theme.textPrimary} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>Sell</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>{chainName}</Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={[styles.optionLimit, { color: theme.textPrimary }]}>
              ${availableUsd.toFixed(2)}
            </Text>
            <Text style={[styles.optionLimitLabel, { color: theme.textSecondary }]}>Available ⓘ</Text>
          </View>
          <Text style={[styles.optionArrow, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>

        {/* Connector Line */}
        <View style={styles.connectorContainer}>
          <View style={[styles.connectorLine, { backgroundColor: theme.textSecondary }]} />
        </View>

        {/* Receive To */}
        <TouchableOpacity 
          style={[styles.optionRow, { backgroundColor: theme.cardBackground }]}
          onPress={() => setShowReceivePicker(!showReceivePicker)}
        >
          <View style={[styles.optionIcon, { backgroundColor: selectedReceive.color, borderWidth: 2, borderColor: theme.background }]}>
            <Text style={styles.optionIconText}>{selectedReceive.icon}</Text>
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>To</Text>
            <Text style={[styles.optionValue, { color: theme.textSecondary }]}>
              {selectedReceive.subtitle}
            </Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={[styles.optionLimit, { color: theme.textPrimary }]}>$0.00</Text>
            <Text style={[styles.optionLimitLabel, { color: theme.textSecondary }]}>Balance</Text>
          </View>
          <Text style={[styles.optionArrow, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>

        {/* Receive Picker */}
        {showReceivePicker && (
          <View style={[styles.picker, { backgroundColor: theme.cardBackground }]}>
            {RECEIVE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.pickerOption,
                  selectedReceive.id === option.id && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setSelectedReceive(option);
                  setShowReceivePicker(false);
                }}
              >
                <View style={[styles.pickerOptionIcon, { backgroundColor: option.color }]}>
                  <Text style={styles.pickerOptionIconText}>{option.icon}</Text>
                </View>
                <View style={styles.pickerOptionInfo}>
                  <Text style={[styles.pickerOptionName, { color: theme.textPrimary }]}>
                    {option.name}
                  </Text>
                  <Text style={[styles.pickerOptionSubtitle, { color: theme.textSecondary }]}>
                    {option.subtitle}
                  </Text>
                </View>
                {selectedReceive.id === option.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Sell All Button */}
      <TouchableOpacity 
        style={[styles.sellAllButton, { backgroundColor: theme.cardBackground }]}
        onPress={handleSellAll}
      >
        <Text style={[styles.sellAllText, { color: theme.textPrimary }]}>Sell all</Text>
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
            parseFloat(amount) > 0 ? styles.reviewButtonActive : { backgroundColor: theme.cardBackground }
          ]}
          disabled={parseFloat(amount) <= 0}
        >
          <Text style={[
            styles.reviewButtonText,
            { color: parseFloat(amount) > 0 ? '#fff' : theme.textSecondary }
          ]}>
            Review order
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
  connectorContainer: {
    paddingLeft: 36,
    height: 20,
  },
  connectorLine: {
    width: 2,
    height: '100%',
    opacity: 0.3,
  },
  picker: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
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
  pickerOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickerOptionIconText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
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
  sellAllButton: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  sellAllText: {
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
