import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

// Bitcoin Icon - Orange B with two vertical lines
export const BitcoinIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
      fill="#F7931A"
    />
    <Path
      d="M17.1 10.5c.2-1.4-.9-2.2-2.4-2.7l.5-2-1.2-.3-.5 1.9c-.3-.1-.6-.1-1-.2l.5-2-1.2-.3-.5 2c-.3 0-.5-.1-.8-.1l-1.6-.4-.3 1.3s.9.2.9.2c.5.1.6.4.6.7l-.6 2.4c0 0 .1 0 .2.1h-.2l-.8 3.3c-.1.2-.2.4-.6.3 0 0-.9-.2-.9-.2l-.6 1.4 1.5.4c.3.1.6.1.8.2l-.5 2 1.2.3.5-2c.3.1.7.2 1 .2l-.5 2 1.2.3.5-2c2.1.4 3.6.2 4.3-1.6.5-1.5 0-2.3-1.1-2.9.8-.2 1.4-.7 1.5-1.8zm-2.8 3.9c-.4 1.5-2.8.7-3.6.5l.6-2.6c.8.2 3.4.6 3 2.1zm.4-3.9c-.3 1.4-2.4.7-3 .5l.6-2.3c.7.2 2.8.5 2.4 1.8z"
      fill={color}
    />
  </Svg>
);

// Ethereum Icon - Diamond shape
export const EthereumIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 1.5l-7 10.5 7 4 7-4-7-10.5z" fill={color} fillOpacity={0.9} />
    <Path d="M5 12l7 4 7-4-7 10.5L5 12z" fill={color} fillOpacity={0.6} />
    <Path d="M12 1.5v8.5l7 2-7-10.5z" fill={color} fillOpacity={0.7} />
    <Path d="M12 1.5v8.5l-7 2 7-10.5z" fill={color} />
    <Path d="M12 16l7-4-7 10.5V16z" fill={color} fillOpacity={0.5} />
    <Path d="M12 16l-7-4 7 10.5V16z" fill={color} fillOpacity={0.7} />
  </Svg>
);

// Solana Icon - Slanted parallel lines
export const SolanaIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <SvgGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#00FFA3" />
        <Stop offset="100%" stopColor="#DC1FFF" />
      </SvgGradient>
    </Defs>
    <Path
      d="M4.5 16.5l3-3h12l-3 3h-12z"
      fill={color}
    />
    <Path
      d="M4.5 7.5l3 3h12l-3-3h-12z"
      fill={color}
      fillOpacity={0.7}
    />
    <Path
      d="M4.5 12l3-3h12l-3 3h-12z"
      fill={color}
      fillOpacity={0.85}
    />
  </Svg>
);

// Polygon Icon - Hexagon/Diamond shape
export const PolygonIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 8.5l-3-1.7c-.3-.2-.7-.2-1 0l-3 1.7c-.3.2-.5.5-.5.9v3.4c0 .4.2.7.5.9l3 1.7c.3.2.7.2 1 0l3-1.7c.3-.2.5-.5.5-.9V9.4c0-.4-.2-.7-.5-.9z"
      fill={color}
    />
    <Path
      d="M9 14.5l-3-1.7c-.3-.2-.5-.5-.5-.9V8.5c0-.4.2-.7.5-.9l3-1.7c.3-.2.7-.2 1 0l1.5.9-3 1.7c-.3.2-.5.5-.5.9v3.4c0 .4.2.7.5.9l1.5.9-1.5.9c-.3.2-.7.2-1 0z"
      fill={color}
      fillOpacity={0.6}
    />
    <Path
      d="M18 9.5l-1.5-.9 1.5-.9c.3-.2.5-.5.5-.9v-.3l-3 1.7v3.4l3 1.7v-.3c0-.4-.2-.7-.5-.9l-1.5-.9 1.5-.9c.3-.2.5-.5.5-.9z"
      fill={color}
      fillOpacity={0.8}
    />
  </Svg>
);

// Generic chain icon component
export default function ChainIcon({ chainId, size = 24, color = '#fff' }) {
  switch (chainId) {
    case 'btc':
      return <BitcoinIcon size={size} color={color} />;
    case 'eth':
      return <EthereumIcon size={size} color={color} />;
    case 'sol':
      return <SolanaIcon size={size} color={color} />;
    case 'polygon':
      return <PolygonIcon size={size} color={color} />;
    default:
      return <EthereumIcon size={size} color={color} />;
  }
}
