import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { createPaymentLink, generateShareMessage, formatExpiration } from '../config/paymentLinks';
import { payyApi } from '../api/payyApi';
import Svg, { Path, Rect } from 'react-native-svg';

// Brand purple color (matches splash)
const BRAND_PURPLE = '#6F34D5';

// QR Code Icon
function QRIcon({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="5" y="5" width="3" height="3" fill={color} />
      <Rect x="16" y="5" width="3" height="3" fill={color} />
      <Rect x="5" y="16" width="3" height="3" fill={color} />
      <Rect x="14" y="14" width="3" height="3" fill={color} />
      <Rect x="17" y="17" width="4" height="4" fill={color} />
    </Svg>
  );
}

// Link Icon
function LinkIcon({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.5 6L16 6C18.4853 6 20.5 8.01472 20.5 10.5C20.5 12.9853 18.4853 15 16 15H13.5M10.5 6L8 6C5.51472 6 3.5 8.01472 3.5 10.5C3.5 12.9853 5.51472 15 8 15H10.5M8 10.5H16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function PayScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { wallet, addActivity } = useWallet();
  
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleNumberPress = (num) => {
    if (num === '.' && amount.includes('.')) return;
    // Limit to 2 decimal places
    if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return;
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

  const formatAmount = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  /**
   * Create a production-ready payment link with cryptographic signature
   */
  const createSecurePaymentLink = async () => {
    const amountNum = parseFloat(amount);
    
    // Create payment link with proper signature and expiration
    const paymentData = await createPaymentLink({
      amount: amountNum,
      currency: 'USD',
      recipientAddress: wallet?.address,
      recipientName: wallet?.name || 'PSI User',
      note: note || undefined,
      expiresInMs: 24 * 60 * 60 * 1000, // 24 hours
      privateKey: wallet?.privateKey, // For signature
    });
    
    // Try to register with backend (optional - works offline too)
    try {
      await payyApi.createPaymentLink(paymentData);
    } catch (error) {
      console.log('Backend not available, payment link created locally');
    }
    
    // Record activity
    await addActivity({
      type: 'payment_link',
      subType: 'created',
      amount: amountNum,
      currency: 'USD',
      note: note,
      paymentId: paymentData.paymentId,
      payLink: paymentData.url,
      expiresAt: paymentData.expiresAt,
      timestamp: Date.now(),
      status: 'pending',
    });
    
    return paymentData;
  };

  const handleShareViaLink = async () => {
    if (parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount to request.');
      return;
    }

    try {
      setCreating(true);
      
      // Create secure payment link
      const paymentData = await createSecurePaymentLink();
      
      // Generate share message
      const shareMessage = generateShareMessage(paymentData);
      
      await Share.share({
        message: shareMessage,
        url: paymentData.url,
      });
      
      // Navigate to link created screen
      navigation.navigate('LinkCreated', {
        paymentId: paymentData.paymentId,
        amount: paymentData.amount / 100, // Convert cents to dollars
        note: paymentData.note,
        payLink: paymentData.url,
        expiresAt: paymentData.expiresAt,
        status: 'pending',
      });
      
    } catch (error) {
      console.error('Error creating payment link:', error);
      Alert.alert('Error', 'Failed to create payment link. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleShowQR = async () => {
    if (parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount to request.');
      return;
    }
    
    try {
      setCreating(true);
      
      // Create secure payment link
      const paymentData = await createSecurePaymentLink();
      
      navigation.navigate('PayQR', { 
        amount: formatAmount(amount), 
        note,
        payLink: paymentData.url,
        paymentId: paymentData.paymentId,
        expiresAt: paymentData.expiresAt,
      });
      
    } catch (error) {
      console.error('Error creating payment link:', error);
      Alert.alert('Error', 'Failed to create payment link. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Green Section */}
      <View style={styles.greenSection}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Amount Circle */}
        <View style={styles.circleContainer}>
          <View style={styles.circle}>
            <Text style={styles.paymentForText}>Payment for</Text>
            <View style={styles.amountRow}>
              <Text style={styles.dollarSign}>$</Text>
              <Text style={styles.amountText}>{formatAmount(amount)}</Text>
            </View>
          </View>
        </View>

        {/* Add Note */}
        {showNoteInput ? (
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={note}
            onChangeText={setNote}
            onBlur={() => !note && setShowNoteInput(false)}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setShowNoteInput(true)}>
            <Text style={styles.addNoteText}>
              {note || 'Add a note'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* White Section */}
      <View style={[styles.whiteSection, { paddingBottom: insets.bottom }]}>
        {/* Numpad */}
        <View style={styles.numpad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '←'].map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.numpadKey}
              onPress={() => key === '←' ? handleBackspace() : handleNumberPress(key)}
            >
              <Text style={styles.numpadKeyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={[styles.actionButton, creating && styles.actionButtonDisabled]} 
            onPress={handleShowQR}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.actionButtonText}>VIA QR</Text>
                <QRIcon size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.actionDivider} />
          
          <TouchableOpacity 
            style={[styles.actionButton, creating && styles.actionButtonDisabled]} 
            onPress={handleShareViaLink}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.actionButtonText}>VIA LINK</Text>
                <LinkIcon size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_PURPLE,
  },
  greenSection: {
    flex: 1,
    backgroundColor: BRAND_PURPLE,
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
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  circle: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentForText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dollarSign: {
    fontSize: 40,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
  },
  amountText: {
    fontSize: 80,
    fontWeight: '700',
    color: '#fff',
  },
  addNoteText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noteInput: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  whiteSection: {
    backgroundColor: '#fff',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 40,
    paddingTop: 16,
  },
  numpadKey: {
    width: '33.33%',
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadKeyText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#000',
  },
  doneButton: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  bottomActions: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  actionDivider: {
    width: 1,
    backgroundColor: BRAND_PURPLE,
  },
});
