import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import PriceChart from '../components/PriceChart';
import BuySellSheet from '../components/BuySellSheet';
import { fetchPriceHistory } from '../config/networks';

const { width: screenWidth } = Dimensions.get('window');

const CHAIN_CONFIG = {
  ethereum: { name: 'Ethereum', symbol: 'ETH', coingeckoId: 'ethereum', color: '#627EEA' },
  arbitrum: { name: 'Arbitrum', symbol: 'ARB', coingeckoId: 'arbitrum', color: '#28A0F0' },
  optimism: { name: 'Optimism', symbol: 'OP', coingeckoId: 'optimism', color: '#FF0420' },
  polygon: { name: 'Polygon', symbol: 'POL', coingeckoId: 'polygon-ecosystem-token', color: '#8247E5' },
  base: { name: 'Base', symbol: 'ETH', coingeckoId: 'ethereum', color: '#0052FF' },
  bsc: { name: 'BNB Chain', symbol: 'BNB', coingeckoId: 'binancecoin', color: '#F0B90B' },
  avalanche: { name: 'Avalanche', symbol: 'AVAX', coingeckoId: 'avalanche-2', color: '#E84142' },
};

const TIME_PERIODS = [
  { label: '1H', days: 1/24 },
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '1Y', days: 365 },
  { label: 'All', days: 'max' },
];

export default function ChainDetailScreen({ route, navigation }) {
  const { chainId, balance = '0.00', usdValue = '0.00' } = route.params;
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { networkBalances } = useWallet();
  
  const [selectedPeriod, setSelectedPeriod] = useState(1); // Default to 1D
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [showBuySellSheet, setShowBuySellSheet] = useState(false);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);

  const chain = CHAIN_CONFIG[chainId] || CHAIN_CONFIG.ethereum;
  
  // Get network data from wallet context (includes sparkline from initial load)
  const networkData = networkBalances?.find(n => n.id === chainId);
  const displayBalance = networkData?.formattedBalance || balance;
  const displayUsdValue = networkData?.formattedUsdValue || usdValue;

  useEffect(() => {
    loadPriceHistory();
  }, [selectedPeriod, chainId, networkData]);

  const loadPriceHistory = async () => {
    setLoading(true);
    try {
      // First try to use cached sparkline data from networkBalances
      if (networkData?.sparkline && networkData.sparkline.length > 0) {
        const sparkline = networkData.sparkline;
        const price = networkData.price || 0;
        const change24h = networkData.priceChange24h || 0;
        
        // Use sparkline for chart data
        setPriceHistory(sparkline);
        setCurrentPrice(price);
        setPriceChange((price * change24h) / 100);
        setPriceChangePercent(change24h);
        setLoading(false);
        
        // Only fetch additional data for longer time periods
        if (selectedPeriod > 1) { // More than 1D
          const period = TIME_PERIODS[selectedPeriod];
          const days = period.days === 'max' ? 365 : period.days;
          
          const data = await fetchPriceHistory(chain.coingeckoId, days);
          
          if (data?.prices && data.prices.length > 0) {
            setPriceHistory(data.prices.map(p => p[1]));
            
            const prices = data.prices.map(p => p[1]);
            const current = prices[prices.length - 1];
            const first = prices[0];
            const change = current - first;
            const changePercent = ((change / first) * 100);
            
            setCurrentPrice(current);
            setPriceChange(change);
            setPriceChangePercent(changePercent);
          }
        }
        return;
      }
      
      // Fallback: fetch from API
      const period = TIME_PERIODS[selectedPeriod];
      const days = period.days === 'max' ? 365 : period.days;
      
      const data = await fetchPriceHistory(chain.coingeckoId, days);
      
      if (data?.prices && data.prices.length > 0) {
        setPriceHistory(data.prices.map(p => p[1]));
        
        const prices = data.prices.map(p => p[1]);
        const current = prices[prices.length - 1];
        const first = prices[0];
        const change = current - first;
        const changePercent = ((change / first) * 100);
        
        setCurrentPrice(current);
        setPriceChange(change);
        setPriceChangePercent(changePercent);
      }
    } catch (error) {
      console.error('Error loading price history:', error);
      // Use network data as fallback if API fails
      if (networkData) {
        setCurrentPrice(networkData.price || 0);
        setPriceChangePercent(networkData.priceChange24h || 0);
        setPriceChange((networkData.price * (networkData.priceChange24h || 0)) / 100);
        if (networkData.sparkline) {
          setPriceHistory(networkData.sparkline);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000) {
      return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '$' + price.toFixed(2);
  };

  const formatChange = (change, percent) => {
    const sign = change >= 0 ? '+' : '';
    const arrow = change >= 0 ? '↗' : '↘';
    return `${arrow} ${sign}$${Math.abs(change).toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  const isPositive = priceChange >= 0;
  const changeColor = isPositive ? '#00C805' : '#FF3B30';

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.headerButtonText, { color: theme.textPrimary }]}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.headerButtonText, { color: '#2196F3' }]}>★</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.headerButtonText, { color: theme.textPrimary }]}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Chain Name & Price */}
        <View style={styles.priceSection}>
          <View style={styles.titleRow}>
            <Text style={[styles.chainName, { color: theme.textPrimary }]}>{chain.name}</Text>
            <View style={[styles.chainIcon, { backgroundColor: chain.color }]}>
              <Text style={styles.chainIconText}>◆</Text>
            </View>
          </View>
          
          <Text style={[styles.currentPrice, { color: theme.textPrimary }]}>
            {formatPrice(currentPrice)}
          </Text>
          
          <Text style={[styles.priceChange, { color: changeColor }]}>
            {formatChange(priceChange, priceChangePercent)}
          </Text>
        </View>

        {/* Price Chart */}
        <View style={styles.chartContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.textSecondary} />
            </View>
          ) : (
            <PriceChart 
              data={priceHistory}
              width={screenWidth - 20}
              height={200}
              color={changeColor}
            />
          )}
        </View>

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          {TIME_PERIODS.map((period, index) => (
            <TouchableOpacity
              key={period.label}
              style={[
                styles.periodButton,
                selectedPeriod === index && [styles.periodButtonActive, { backgroundColor: changeColor + '20' }]
              ]}
              onPress={() => setSelectedPeriod(index)}
            >
              <Text style={[
                styles.periodText,
                { color: selectedPeriod === index ? changeColor : theme.textSecondary }
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Happening Now Section */}
        <View style={[styles.newsSection, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity style={styles.newsHeader}>
            <Text style={[styles.newsTitle, { color: '#00C805' }]}>Happening now →</Text>
          </TouchableOpacity>
          <Text style={[styles.newsContent, { color: theme.textPrimary }]}>
            {chain.name}'s network activity remains strong with consistent transaction volumes...
          </Text>
          <Text style={[styles.newsFooter, { color: theme.textSecondary }]}>
            ▪ AI generated • Just now
          </Text>
        </View>

        {/* Balance Section */}
        <View style={[styles.balanceSection, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Your Balance</Text>
          </View>
          <View style={styles.balanceRow}>
            <View style={styles.balanceLeft}>
              <View style={[styles.balanceIcon, { backgroundColor: chain.color + '20' }]}>
                <Text style={styles.balanceIconText}>◆</Text>
              </View>
              <View>
                <Text style={[styles.balanceName, { color: theme.textPrimary }]}>{chain.name}</Text>
                <Text style={[styles.balanceAmount, { color: theme.textSecondary }]}>
                  {displayBalance} {chain.symbol}
                </Text>
              </View>
            </View>
            <Text style={[styles.balanceUsd, { color: theme.textPrimary }]}>{displayUsdValue}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.footerButton, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigation.navigate('SubmitTransaction', { chainId })}
        >
          <Text style={[styles.footerButtonText, { color: theme.textPrimary }]}>Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.footerButton, styles.footerButtonPrimary]}
          onPress={() => setShowBuySellSheet(true)}
        >
          <Text style={[styles.footerButtonText, { color: '#fff' }]}>Buy & sell</Text>
        </TouchableOpacity>
      </View>

      {/* Buy/Sell Sheet */}
      <BuySellSheet
        visible={showBuySellSheet}
        onClose={() => setShowBuySellSheet(false)}
        onBuy={() => {
          setShowBuySellSheet(false);
          navigation.navigate('Buy', { 
            chainId, 
            chainName: chain.name, 
            chainSymbol: chain.symbol 
          });
        }}
        onSell={() => {
          setShowBuySellSheet(false);
          navigation.navigate('Sell', { 
            chainId, 
            chainName: chain.name, 
            chainSymbol: chain.symbol 
          });
        }}
        onConvert={() => {
          setShowBuySellSheet(false);
          navigation.navigate('Convert', { 
            chainId 
          });
        }}
      />
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  priceSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chainName: {
    fontSize: 24,
    fontWeight: '700',
  },
  chainIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chainIconText: {
    fontSize: 24,
    color: '#fff',
  },
  currentPrice: {
    fontSize: 42,
    fontWeight: '700',
    marginTop: 8,
  },
  priceChange: {
    fontSize: 16,
    marginTop: 4,
  },
  chartContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  periodButtonActive: {
    borderRadius: 16,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  newsSection: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
  },
  newsHeader: {
    marginBottom: 8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  newsContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  newsFooter: {
    fontSize: 13,
  },
  balanceSection: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  balanceHeader: {
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceIconText: {
    fontSize: 18,
  },
  balanceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 14,
    marginTop: 2,
  },
  balanceUsd: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  footerButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
