import { StyleSheet } from 'react-native';
import colors from './colors';

export const typography = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  // Special styles
  balance: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  balanceChange: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.green,
  },
});

export default typography;
