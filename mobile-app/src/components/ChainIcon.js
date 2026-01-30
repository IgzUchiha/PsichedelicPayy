import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Polygon, Rect } from 'react-native-svg';

// Ethereum Icon - Classic diamond shape
export const EthereumIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path d="M16 2L6 16.5L16 22L26 16.5L16 2Z" fill={color} fillOpacity={0.8} />
    <Path d="M16 2V22L26 16.5L16 2Z" fill={color} fillOpacity={0.6} />
    <Path d="M6 18L16 30L26 18L16 24L6 18Z" fill={color} />
    <Path d="M16 24V30L26 18L16 24Z" fill={color} fillOpacity={0.8} />
  </Svg>
);

// Polygon/POL Icon - Infinity-like connected hexagons
export const PolygonIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M21.5 11.5L17 9C16.4 8.7 15.6 8.7 15 9L10.5 11.5C9.9 11.8 9.5 12.5 9.5 13.2V18.2C9.5 18.9 9.9 19.5 10.5 19.9L15 22.4C15.6 22.7 16.4 22.7 17 22.4L21.5 19.9C22.1 19.6 22.5 18.9 22.5 18.2V13.2C22.5 12.5 22.1 11.8 21.5 11.5Z"
      fill={color}
    />
    <Path
      d="M10.5 11.5L15 9L17 10.2L12.5 12.7C11.9 13 11.5 13.7 11.5 14.4V19.4L10.5 18.8C9.9 18.5 9.5 17.8 9.5 17.1V12.1C9.5 12.4 9.9 11.8 10.5 11.5Z"
      fill={color}
      fillOpacity={0.6}
    />
  </Svg>
);

// Arbitrum Icon - Stylized A
export const ArbitrumIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M16 4L6 24H10L16 12L22 24H26L16 4Z"
      fill={color}
    />
    <Path
      d="M12 20L16 12L20 20H16L12 20Z"
      fill={color}
      fillOpacity={0.6}
    />
  </Svg>
);

// Optimism Icon - O with horizontal stripes
export const OptimismIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="10" fill="none" stroke={color} strokeWidth="3" />
    <Path d="M10 13H22" stroke={color} strokeWidth="2" />
    <Path d="M10 19H22" stroke={color} strokeWidth="2" />
  </Svg>
);

// Base Icon - B stylized
export const BaseIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="12" fill={color} fillOpacity={0.2} />
    <Path
      d="M16 6C10.5 6 6 10.5 6 16C6 21.5 10.5 26 16 26C21.5 26 26 21.5 26 16"
      stroke={color}
      strokeWidth="3"
      fill="none"
    />
    <Circle cx="22" cy="16" r="4" fill={color} />
  </Svg>
);

// BNB Chain Icon - Diamond shape
export const BnbIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path d="M16 4L20 8L16 12L12 8L16 4Z" fill={color} />
    <Path d="M24 12L28 16L24 20L20 16L24 12Z" fill={color} />
    <Path d="M8 12L12 16L8 20L4 16L8 12Z" fill={color} />
    <Path d="M16 20L20 24L16 28L12 24L16 20Z" fill={color} />
    <Path d="M16 12L20 16L16 20L12 16L16 12Z" fill={color} fillOpacity={0.7} />
  </Svg>
);

// Avalanche Icon - Triangle A
export const AvalancheIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M16 4L28 26H4L16 4Z"
      fill={color}
    />
    <Path
      d="M16 12L22 24H10L16 12Z"
      fill="none"
    />
    <Path
      d="M11 20H8L12 14L14 17L11 20Z"
      fill="#1a1a1a"
    />
    <Path
      d="M21 20H24L18 10L14 17L17 20H21Z"
      fill="#1a1a1a"
    />
  </Svg>
);

// Bitcoin Icon
export const BitcoinIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M22 13.5C22 11 20 9.5 17 9.2V6H15V9H13V6H11V9H8V11H10V21H8V23H11V26H13V23H15V26H17V23C20.5 22.7 23 21 23 18C23 16 22 14.5 20 14C21.5 13.5 22 12 22 13.5ZM13 11.5H16C17.5 11.5 18.5 12 18.5 13.5C18.5 15 17.5 15.5 16 15.5H13V11.5ZM17 20.5H13V16.5H17C18.5 16.5 19.5 17 19.5 18.5C19.5 20 18.5 20.5 17 20.5Z"
      fill={color}
    />
  </Svg>
);

// Solana Icon
export const SolanaIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path d="M6 22L9 19H26L23 22H6Z" fill={color} />
    <Path d="M6 10L9 13H26L23 10H6Z" fill={color} fillOpacity={0.7} />
    <Path d="M6 16L9 13H26L23 16H6Z" fill={color} fillOpacity={0.85} />
  </Svg>
);

// PSI Rollup Icon - Dollar sign
export const PsiIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="12" fill={color} fillOpacity={0.2} />
    <Path
      d="M16 6V8M16 24V26M12 12C12 10.3 13.8 9 16 9C18.2 9 20 10.3 20 12C20 13.7 18.2 15 16 15C13.8 15 12 16.3 12 18C12 19.7 13.8 21 16 21C18.2 21 20 19.7 20 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

// Generic chain icon component
export default function ChainIcon({ chainId, size = 24, color = '#fff' }) {
  switch (chainId?.toLowerCase()) {
    case 'btc':
    case 'bitcoin':
      return <BitcoinIcon size={size} color={color} />;
    case 'eth':
    case 'ethereum':
      return <EthereumIcon size={size} color={color} />;
    case 'sol':
    case 'solana':
      return <SolanaIcon size={size} color={color} />;
    case 'polygon':
    case 'matic':
    case 'pol':
      return <PolygonIcon size={size} color={color} />;
    case 'arb':
    case 'arbitrum':
      return <ArbitrumIcon size={size} color={color} />;
    case 'op':
    case 'optimism':
      return <OptimismIcon size={size} color={color} />;
    case 'base':
      return <BaseIcon size={size} color={color} />;
    case 'bsc':
    case 'bnb':
    case 'binance':
      return <BnbIcon size={size} color={color} />;
    case 'avax':
    case 'avalanche':
      return <AvalancheIcon size={size} color={color} />;
    case 'psi':
    case 'payy':
      return <PsiIcon size={size} color={color} />;
    default:
      // Fallback to a generic circle with first letter
      return (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.fallbackText, { fontSize: size * 0.5, color }]}>
            {chainId?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  fallbackText: {
    fontWeight: '700',
  },
});
