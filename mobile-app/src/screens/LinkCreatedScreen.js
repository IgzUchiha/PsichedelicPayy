import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import Svg, { Rect, Path } from 'react-native-svg';

// QR Icon
function QRIcon({ size = 20, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
      <Rect x="5" y="5" width="3" height="3" fill={color} />
      <Rect x="16" y="5" width="3" height="3" fill={color} />
      <Rect x="5" y="16" width="3" height="3" fill={color} />
    </Svg>
  );
}

// Link Icon
function LinkIcon({ size = 20, color = '#fff' }) {
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

export default function LinkCreatedScreen({ route, navigation }) {
  const { amount, netAmount, link, paymentId, note } = route.params || {};
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { updateActivityStatus } = useWallet();

  const createdDate = new Date();
  const formattedDate = createdDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = createdDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `I'm sending you $${netAmount?.toFixed(2) || amount?.toFixed(2)} via PSI 🔐\n\nClaim your payment here:\n${link}\n\nNew to PSI? Download the app to claim!`,
        url: link,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleShowQR = () => {
    navigation.navigate('PayQR', {
      amount: netAmount?.toFixed(2) || amount?.toFixed(2),
      note,
      payLink: link,
    });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment link? The funds will be returned to your balance.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            // In production, this would refund the amount
            Alert.alert('Cancelled', 'Payment link has been cancelled.');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Link created</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Date</Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{formattedDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Time</Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{formattedTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Status</Text>
          <Text style={[styles.detailValue, { color: theme.accent }]}>Link ready</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Amount</Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>-${amount?.toFixed(2)}</Text>
        </View>
      </View>

      {/* Cancel Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cancel</Text>
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          If not already been claimed by the person you sent it to.
        </Text>
        <TouchableOpacity 
          style={[styles.outlineButton, { borderColor: theme.textSecondary }]}
          onPress={handleCancel}
        >
          <Text style={[styles.outlineButtonText, { color: theme.textPrimary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Reshare Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Reshare</Text>
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Reshare the payment link to pay someone.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.halfButton, { borderColor: theme.textSecondary }]}
            onPress={handleShowQR}
          >
            <QRIcon size={18} color={theme.textPrimary} />
            <Text style={[styles.halfButtonText, { color: theme.textPrimary }]}>QR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.halfButton, { borderColor: theme.textSecondary }]}
            onPress={handleShareLink}
          >
            <LinkIcon size={18} color={theme.textPrimary} />
            <Text style={[styles.halfButtonText, { color: theme.textPrimary }]}>Link</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Get Help Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Get help</Text>
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Need help with this transaction?
        </Text>
        <TouchableOpacity 
          style={[styles.outlineButton, { borderColor: theme.textSecondary }]}
          onPress={() => Alert.alert('Support', 'Contact support@psi.money for help.')}
        >
          <Text style={[styles.outlineButtonText, { color: theme.textPrimary }]}>Chat with us</Text>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  details: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  halfButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
