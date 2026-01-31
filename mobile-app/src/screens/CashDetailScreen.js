import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';

export default function CashDetailScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { balance: walletBalance, cashBalance } = useWallet();

  const psiBalance = (cashBalance || 0).toFixed(2);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Your cash</Text>
          <Text style={[styles.totalBalance, { color: theme.textPrimary }]}>${psiBalance}</Text>
        </View>

        {/* Cash Items */}
        <View style={[styles.itemsContainer, { backgroundColor: theme.cardBackground }]}>
          {/* PSI Rollup Balance */}
          <TouchableOpacity style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.itemIcon, { backgroundColor: theme.accent + '20' }]}>
                <Text style={[styles.itemIconText, { color: theme.accent }]}>$</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.textPrimary }]}>PSI Rollup</Text>
                <Text style={[styles.itemSubtext, { color: theme.accent }]}>Private Balance</Text>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Text style={[styles.itemValue, { color: theme.textPrimary }]}>${psiBalance}</Text>
              <Text style={[styles.itemSubvalue, { color: theme.textSecondary }]}>{psiBalance} USDC</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* United States Dollar */}
          <TouchableOpacity style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.itemIcon, { backgroundColor: '#4CAF5020' }]}>
                <Text style={styles.itemIconText}>$</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.textPrimary }]}>United States Dollar</Text>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Text style={[styles.itemValue, { color: theme.textPrimary }]}>$0.00</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>About PSI Rollup</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Your PSI balance is stored privately using zero-knowledge proofs. 
              Only you can see and spend these funds.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.footerButton, { backgroundColor: theme.cardBackground }]}
          onPress={() => navigation.navigate('Receive')}
        >
          <Text style={[styles.footerButtonText, { color: theme.textPrimary }]}>Withdraw</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.footerButton, styles.footerButtonPrimary, { backgroundColor: '#2196F3' }]}
          onPress={() => navigation.navigate('SubmitTransaction')}
        >
          <Text style={[styles.footerButtonText, { color: '#fff' }]}>Deposit</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  totalBalance: {
    fontSize: 40,
    fontWeight: '700',
  },
  itemsContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIconText: {
    fontSize: 20,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubvalue: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 72,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
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
  footerButtonPrimary: {},
  footerButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
