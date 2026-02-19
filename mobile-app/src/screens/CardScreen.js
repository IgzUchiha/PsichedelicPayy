import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '../context/WalletContext';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, G, Circle as SvgCircle } from 'react-native-svg';

const BRAND_PURPLE = '#6F34D5';
const BRAND_PURPLE_DARK = '#5821B0';
const BRAND_PURPLE_LIGHT = '#9B6AE8';

function VisaLogo({ width = 60, height = 20 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 60 20" fill="none">
      <Path
        d="M25.2 1.3L21 18.7H17L21.2 1.3H25.2ZM41.8 12.5L44 6.3L45.2 12.5H41.8ZM46.4 18.7H50L47 1.3H43.6C42.8 1.3 42.1 1.8 41.8 2.5L35.4 18.7H39.6L40.4 16.2H45.6L46.4 18.7ZM37.4 12.8C37.4 8.1 30.8 7.8 30.8 5.7C30.8 5.1 31.4 4.4 32.6 4.3C33.2 4.2 34.8 4.2 36.6 5L37.4 1.8C36.4 1.4 35.2 1.1 33.6 1.1C29.6 1.1 26.8 3.3 26.8 6.3C26.8 8.5 28.8 9.7 30.2 10.5C31.8 11.3 32.2 11.8 32.2 12.5C32.2 13.5 31 14 29.8 14C27.8 14 26.6 13.5 25.6 13L24.8 16.3C25.8 16.8 27.6 17.2 29.4 17.2C33.6 17.2 37.4 15.1 37.4 12.8ZM16 1.3L10.2 18.7H6L3.2 4.1C3 3.3 2.8 3 2.2 2.7C1.2 2.1 0 1.6 0 1.6L0.1 1.3H6.6C7.5 1.3 8.2 1.9 8.4 2.9L10 11.7L14 1.3H16Z"
        fill="white"
      />
    </Svg>
  );
}

function CardChip({ width = 36, height = 28 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 28" fill="none">
      <Rect x="0.5" y="0.5" width="35" height="27" rx="4" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <Rect x="4" y="8" width="28" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <Rect x="4" y="13" width="28" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <Rect x="4" y="18" width="28" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <Rect x="14" y="4" width="2" height="20" rx="1" fill="rgba(255,255,255,0.3)" />
      <Rect x="20" y="4" width="2" height="20" rx="1" fill="rgba(255,255,255,0.3)" />
    </Svg>
  );
}

function AddFundsIcon({ size = 24, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <SvgCircle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M12 8V16M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Apple logo icon for Apple Pay / Apple Wallet
function AppleLogo({ size = 20, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.82 11.78 5.74 12.53 5.74C13.29 5.74 14.77 4.62 16.33 4.81C17 4.84 18.88 5.09 20.11 6.81C20 6.89 17.76 8.23 17.79 10.98C17.82 14.26 20.67 15.38 20.7 15.39C20.67 15.48 20.24 17.01 19.14 18.58L18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
    </Svg>
  );
}

// Apple Wallet icon
function WalletIcon({ size = 22, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="1.5" />
      <Path d="M2 8H22" stroke={color} strokeWidth="1.5" />
      <Path d="M2 12H22" stroke={color} strokeWidth="1.5" />
      <Rect x="15" y="14" width="4" height="3" rx="1" fill={color} />
    </Svg>
  );
}

export default function CardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { cashBalance = 0 } = useWallet();
  const [showCardInfo, setShowCardInfo] = useState(false);
  const [addedToWallet, setAddedToWallet] = useState(false);
  const [provisioning, setProvisioning] = useState(false);

  const maskedNumber = showCardInfo ? '4532  7891  2345  6789' : '****  ****  ****  ****';
  const validThru = showCardInfo ? '12/28' : '**/**';
  const cvv = showCardInfo ? '431' : '***';

  /**
   * Add card to Apple Wallet / Apple Pay
   * 
   * In production this calls your card issuing partner's (e.g. Marqeta, Stripe Issuing)
   * In-App Provisioning API via PassKit. The flow:
   * 1. App requests provisioning data from your backend
   * 2. Backend calls issuer API to get encrypted card data + certificates
   * 3. PassKit adds the card to Apple Wallet with NFC payment capability
   * 4. User authenticates with Face ID / passcode
   * 5. Card appears in Apple Wallet and is usable via double-click side button
   */
  const handleAddToAppleWallet = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Apple Pay', 'Apple Pay is only available on iOS devices.');
      return;
    }

    try {
      setProvisioning(true);

      // TODO: In production, replace with actual PassKit In-App Provisioning:
      //
      // 1. Import PassKit native module:
      //    import { PassKit } from 'react-native-passkit-wallet';
      //
      // 2. Check if card can be added:
      //    const canAdd = await PassKit.canAddPaymentPass();
      //
      // 3. Request provisioning from your backend:
      //    const provisionData = await api.post('/v0/card/provision', {
      //      cardId: userCardId,
      //      deviceId: deviceIdentifier,
      //      certificates: leafCert + subCACert,
      //      nonce: passKitNonce,
      //      nonceSignature: passKitNonceSignature,
      //    });
      //
      // 4. Complete provisioning:
      //    await PassKit.addPaymentPass({
      //      encryptedPassData: provisionData.encryptedPassData,
      //      activationData: provisionData.activationData,
      //      ephemeralPublicKey: provisionData.ephemeralPublicKey,
      //    });

      // Simulate provisioning delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAddedToWallet(true);
      Alert.alert(
        'Added to Apple Wallet',
        'Your PSI Card has been added to Apple Wallet. Double-click the side button to pay with Apple Pay.',
        [{ text: 'Done' }]
      );
    } catch (error) {
      console.error('Apple Wallet provisioning error:', error);
      Alert.alert('Error', 'Unable to add card to Apple Wallet. Please try again.');
    } finally {
      setProvisioning(false);
    }
  };

  const handleAddToGoogleWallet = async () => {
    // Google Pay uses a similar Push Provisioning flow via Google Pay API
    Alert.alert(
      'Google Pay',
      'Google Pay integration coming soon. Your PSI Card will be available for tap-to-pay on Android.',
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PSI Card</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Row */}
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <View style={styles.balanceAmountRow}>
              <Text style={styles.balanceAmount}>${cashBalance.toFixed(2)}</Text>
              <Text style={styles.balanceCurrency}>USDC</Text>
              <Text style={styles.balanceChevron}>v</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.addFundsButton}
            onPress={() => Alert.alert('Add Funds', 'Convert crypto or deposit cash to fund your card.')}
          >
            <AddFundsIcon size={20} color={BRAND_PURPLE} />
            <Text style={styles.addFundsText}>Add funds</Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Svg style={StyleSheet.absoluteFill} viewBox="0 0 340 210">
              <Defs>
                <LinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={BRAND_PURPLE} />
                  <Stop offset="0.5" stopColor={BRAND_PURPLE_DARK} />
                  <Stop offset="1" stopColor={BRAND_PURPLE_LIGHT} />
                </LinearGradient>
              </Defs>
              <Rect width="340" height="210" rx="16" fill="url(#cardGrad)" />
            </Svg>
            <View style={styles.cardContent}>
              <View style={styles.cardTopRow}>
                <Text style={styles.virtualLabel}>Virtual Card</Text>
              </View>
              <View style={styles.cardChipRow}>
                <CardChip />
              </View>
              <Text style={styles.cardNumber}>{maskedNumber}</Text>
              <View style={styles.cardBottomRow}>
                <View style={styles.cardInfoGroup}>
                  <Text style={styles.cardInfoLabel}>Valid Thru</Text>
                  <Text style={styles.cardInfoValue}>{validThru}</Text>
                </View>
                <View style={styles.cardInfoGroup}>
                  <Text style={styles.cardInfoLabel}>CVV2</Text>
                  <Text style={styles.cardInfoValue}>{cvv}</Text>
                </View>
              </View>
              <View style={styles.cardBrandRow}>
                <Text style={styles.cardBrandName}>psi</Text>
                <View style={styles.cardBrandRight}>
                  <Text style={styles.debitLabel}>DEBIT</Text>
                  <VisaLogo width={50} height={16} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Show Card Info Button */}
        <TouchableOpacity 
          style={styles.showInfoButton}
          onPress={() => setShowCardInfo(!showCardInfo)}
        >
          <Text style={styles.showInfoText}>
            {showCardInfo ? 'Hide card info' : 'Show card info'}
          </Text>
        </TouchableOpacity>

        {/* Apple Wallet / Google Wallet Section */}
        {!addedToWallet ? (
          <TouchableOpacity
            style={styles.appleWalletButton}
            onPress={Platform.OS === 'ios' ? handleAddToAppleWallet : handleAddToGoogleWallet}
            disabled={provisioning}
            activeOpacity={0.8}
          >
            {Platform.OS === 'ios' ? (
              <>
                <AppleLogo size={18} color="#fff" />
                <Text style={styles.appleWalletText}>
                  {provisioning ? 'Adding...' : 'Add to Apple Wallet'}
                </Text>
              </>
            ) : (
              <>
                <WalletIcon size={18} color="#fff" />
                <Text style={styles.appleWalletText}>Add to Google Wallet</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.walletAddedBadge}>
            <AppleLogo size={16} color={BRAND_PURPLE_LIGHT} />
            <Text style={styles.walletAddedText}>Added to Apple Wallet</Text>
            <Text style={styles.walletAddedCheck}>✓</Text>
          </View>
        )}

        {/* Apple Pay Info */}
        <View style={styles.applePayInfo}>
          <View style={styles.applePayInfoRow}>
            <AppleLogo size={16} color="#888" />
            <Text style={styles.applePayInfoText}>
              {addedToWallet
                ? 'Double-click the side button to pay with Apple Pay'
                : 'Add to Apple Wallet to use tap-to-pay everywhere Apple Pay is accepted'
              }
            </Text>
          </View>
        </View>

        {/* Manage Card Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage card</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Card Rewards', 'Earn 0.5% back in PSI on every purchase.')}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>💎</Text>
              <View>
                <Text style={styles.menuItemTitle}>Card rewards</Text>
                <Text style={styles.menuItemSubtitle}>Earned $0.00 USD all-time</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardBadgeText}>0.5% PSI</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Activity')}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>📊</Text>
              <Text style={styles.menuItemTitle}>View transactions</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Change Asset', 'Choose which crypto to spend from: USDC, ETH, or cash balance.')}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🔄</Text>
              <Text style={styles.menuItemTitle}>Change asset</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Lock Card', 'Temporarily lock your card to prevent unauthorized use.')}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🔒</Text>
              <Text style={styles.menuItemTitle}>Lock card</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Spending Limits', 'Set daily and monthly spending limits.')}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>📈</Text>
              <Text style={styles.menuItemTitle}>Spending limits</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={addedToWallet 
                ? () => Alert.alert('Apple Pay', 'Your PSI Card is already in Apple Wallet. Double-click the side button to pay.')
                : handleAddToAppleWallet
              }
            >
              <View style={styles.menuItemLeft}>
                <View style={{ width: 20, alignItems: 'center' }}>
                  <AppleLogo size={18} color="#fff" />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>
                    {addedToWallet ? 'Apple Pay' : 'Add to Apple Pay'}
                  </Text>
                  <Text style={styles.menuItemSubtitle}>
                    {addedToWallet ? 'Active - Double-click side button to pay' : 'Pay with a tap anywhere Apple Pay is accepted'}
                  </Text>
                </View>
              </View>
              {addedToWallet ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              ) : (
                <Text style={styles.menuChevron}>›</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  balanceCurrency: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  balanceChevron: {
    fontSize: 12,
    color: '#888',
    marginLeft: 2,
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFundsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    width: '100%',
    aspectRatio: 340 / 210,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    alignItems: 'flex-end',
  },
  virtualLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardChipRow: {
    marginTop: 4,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 3,
    marginTop: 8,
  },
  cardBottomRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 8,
  },
  cardInfoGroup: {},
  cardInfoLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardInfoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  cardBrandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  cardBrandRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  debitLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    fontWeight: '500',
  },
  showInfoButton: {
    alignSelf: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 32,
  },
  showInfoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardBadge: {
    backgroundColor: BRAND_PURPLE + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: BRAND_PURPLE_LIGHT,
  },
  menuChevron: {
    fontSize: 22,
    color: '#555',
  },
  activeBadge: {
    backgroundColor: '#22C55E20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  appleWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  appleWalletText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  walletAddedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND_PURPLE + '15',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  walletAddedText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND_PURPLE_LIGHT,
  },
  walletAddedCheck: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
  applePayInfo: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  applePayInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applePayInfoText: {
    fontSize: 13,
    color: '#888',
    flex: 1,
    lineHeight: 18,
  },
});
