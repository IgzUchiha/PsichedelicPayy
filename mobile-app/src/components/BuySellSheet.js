import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function BuySellSheet({ visible, onClose, onBuy, onSell, onConvert }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[
            styles.sheet, 
            { 
              backgroundColor: theme.cardBackground,
              paddingBottom: insets.bottom + 20,
            }
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.textSecondary }]} />
          </View>

          {/* Options */}
          <TouchableOpacity style={styles.option} onPress={onBuy}>
            <View style={[styles.optionIcon, { backgroundColor: '#2196F3' }]}>
              <Text style={styles.optionIconText}>+</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Buy</Text>
              <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                Buy crypto with cash
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onSell}>
            <View style={[styles.optionIcon, { backgroundColor: '#2196F3' }]}>
              <Text style={styles.optionIconText}>−</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Sell</Text>
              <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                Sell crypto for cash
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onConvert}>
            <View style={[styles.optionIcon, { backgroundColor: '#2196F3' }]}>
              <Text style={styles.optionIconText}>⇄</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Convert</Text>
              <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                Convert one crypto to another
              </Text>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
});
