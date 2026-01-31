import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Svg, { Rect, Path } from 'react-native-svg';

// Brand purple color (matches splash)
const BRAND_PURPLE = '#6F34D5';

// Simple QR Code representation (in production, use a real QR library)
function QRCodeDisplay({ data, size = 200 }) {
  // Generate a simple visual pattern based on data hash
  const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cells = 21; // Standard QR code size
  const cellSize = size / cells;
  
  const rects = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      // Finder patterns in corners
      const isFinderPattern = 
        (x < 7 && y < 7) || 
        (x >= cells - 7 && y < 7) || 
        (x < 7 && y >= cells - 7);
      
      // Create pseudo-random pattern
      const shouldFill = isFinderPattern 
        ? ((x < 7 && y < 7) ? 
            (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) :
            (x >= cells - 7 && y < 7) ?
            (x === cells - 7 || x === cells - 1 || y === 0 || y === 6 || (x >= cells - 5 && x <= cells - 3 && y >= 2 && y <= 4)) :
            (x === 0 || x === 6 || y === cells - 7 || y === cells - 1 || (x >= 2 && x <= 4 && y >= cells - 5 && y <= cells - 3)))
        : ((hash * (x + 1) * (y + 1)) % 3 === 0);
      
      if (shouldFill) {
        rects.push(
          <Rect
            key={`${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#000"
          />
        );
      }
    }
  }
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect x="0" y="0" width={size} height={size} fill="#fff" />
      {rects}
    </Svg>
  );
}

export default function PayQRScreen({ route, navigation }) {
  const { amount, note, payLink } = route.params || {};
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pay me $${amount} via PSI 🔐\n\nPrivate • Instant • Zero-Knowledge\n\n${payLink}\n\nNew to PSI? Download the app and get started with private payments!`,
        url: payLink,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ZK Payment QR</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* QR Code Section */}
      <View style={styles.qrSection}>
        <View style={styles.qrContainer}>
          <QRCodeDisplay data={payLink} size={240} />
        </View>
        
        <Text style={styles.amountText}>${amount}</Text>
        {note ? <Text style={styles.noteText}>{note}</Text> : null}
        
        <Text style={styles.instructionText}>
          Scan this QR code to pay with zero-knowledge privacy
        </Text>
      </View>

      {/* ZK Badge */}
      <View style={styles.zkBadge}>
        <Text style={styles.zkBadgeText}>🔒 Zero-Knowledge Protected</Text>
        <Text style={styles.zkDescription}>
          This payment uses ZK proofs to ensure your transaction remains private
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share Payment Link</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  qrSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
  },
  noteText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  instructionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  zkBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  zkBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  zkDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 6,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: BRAND_PURPLE,
  },
  doneButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
